/* Motor de simulación (Nivel 1): sensores, bomba, riego automático, historial y alertas.
   Todo corre en el navegador y el historial se guarda en localStorage. */
(function () {
  var S = PG.state, KEY = 'pg_hist_v1', SET = 'pg_ajustes_v1', H = { readings: [], events: [] };
  var n = 0, off = 0, flag = {};
  var now = function () { return Date.now(); };
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };
  var r1 = function (x) { return Math.round(x * 10) / 10; };

  Object.assign(S, { soil: 28, temp: 23, hum: 61, ok: true, pump: false, pumpMode: '', pumpLeft: 0, lastEnd: 0, startAt: 0, demo: true });
  try { Object.assign(S, JSON.parse(localStorage.getItem(SET)) || {}); } catch (e) { }

  function level(k, v) {
    if (k === 'soil') return v < S.thr - 10 ? 'bad' : v < S.thr ? 'warn' : 'ok';
    if (k === 'temp') return v >= 18 && v <= 28 ? 'ok' : v >= 15 && v <= 32 ? 'warn' : 'bad';
    return v >= 40 && v <= 70 ? 'ok' : v >= 30 && v <= 80 ? 'warn' : 'bad';
  }
  var TZ = 'America/Mexico_City';
  function hm(d) { return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ }); }
  function dayKey(d) { return d.toLocaleDateString('es-MX', { timeZone: TZ }); }
  function fmtWhen(t) {
    var d = new Date(t);
    return dayKey(d) === dayKey(new Date()) ? 'Hoy, ' + hm(d)
      : d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', timeZone: TZ }) + ' ' + hm(d);
  }
  function waitMs() { return S.wait * (S.demo ? 1000 : 60000); }

  function save() { try { localStorage.setItem(KEY, JSON.stringify(H)); } catch (e) { } }
  function seed() {
    var t0 = now(), r = H.readings = [], e = H.events = [], soil = 55, t, i;
    /* Semana anterior: una lectura cada 3 h, sin pasar de 10 min antes de ahora */
    for (t = t0 - 7 * 864e5; t < t0 - 6e5; t += 3 * 36e5) {
      soil = clamp(soil + rnd(-9, 6), 25, 75);
      r.push({ t: t, soil: r1(soil), temp: r1(22 + rnd(-2, 3)), hum: Math.round(rnd(52, 68)) });
      if (soil < 38) { e.push({ t: t, type: 'auto', msg: 'Riego automático activado · humedad al ' + Math.round(soil) + '%' }); soil += 18; }
    }
    /* Últimas 40 lecturas (2 min), una cada 3 s y terminando en este instante, para que la gráfica en vivo arranque en la hora real */
    for (i = 40; i >= 1; i--) {
      r.push({ t: t0 - i * 3000, soil: r1(clamp(S.soil + i * 0.15, 5, 95)), temp: r1(S.temp + rnd(-0.3, 0.3)), hum: Math.round(S.hum + rnd(-1, 1)) });
    }
  }
  try { var d = JSON.parse(localStorage.getItem(KEY)); if (d && d.readings && d.readings.length) H = d; } catch (e) { }
  if (!H.readings.length) seed();

  function toast(msg, kind) {
    var c = document.getElementById('toasts'); if (!c) return;
    var d = document.createElement('div'); d.className = 'toast ' + (kind || 'info'); d.textContent = msg;
    c.appendChild(d); setTimeout(function () { d.remove(); }, 4500);
  }
  function log(type, msg, kind) {
    H.events.push({ t: now(), type: type, msg: msg });
    if (H.events.length > 80) H.events.shift();
    if (kind) toast(msg, kind);
    PG.emit('hist');
  }

  function startPump(mode) {
    if (S.pump) return;
    S.pump = true; S.pumpMode = mode; S.pumpLeft = mode === 'auto' ? S.dur : 30; S.startAt = now();
    log(mode, (mode === 'auto' ? 'Riego automático activado' : 'Riego manual iniciado') + ' · humedad al ' + Math.round(S.soil) + '%', mode === 'auto' ? 'info' : '');
    PG.emit('state', 'pump');
  }
  function stopPump() {
    if (!S.pump) return;
    var sec = Math.round((now() - S.startAt) / 1000);
    S.pump = false; S.pumpLeft = 0;
    if (S.pumpMode === 'auto') S.lastEnd = now(); /* el riego manual no frena al automático (HU05) */
    log('stop', 'Riego terminado · duró ' + sec + ' s (humedad al ' + Math.round(S.soil) + '%)');
    PG.emit('state', 'pump');
  }
  function fail(k) {
    if (!S.ok) return;
    S.ok = false; off = k;
    log('off', 'Sensor de suelo desconectado', 'bad');
    PG.emit('state', 'ok');
  }

  function read() {
    if (off > 0 && --off === 0) { S.ok = true; log('on', 'Sensor de suelo reconectado', 'ok'); }
    else if (off === 0 && Math.random() < 0.012) return fail(4);
    if (S.ok) S.soil = clamp(S.soil + (S.pump ? rnd(3, 5) : -rnd(0.3, 1.1)), 5, 95);
    S.temp = clamp(S.temp + (23 - S.temp) * 0.1 + rnd(-0.4, 0.4), 10, 40);
    S.hum = clamp(S.hum + (61 - S.hum) * 0.1 + rnd(-1.5, 1.5), 20, 95);
    if (!S.ok) return;
    var bad = level('soil', S.soil) === 'bad';
    if (bad && !flag.crit) log('crit', 'Humedad crítica detectada · ' + Math.round(S.soil) + '% en el suelo', 'bad');
    flag.crit = bad;
    if (!S.pump && S.soil < S.thr && now() - S.lastEnd >= waitMs()) startPump('auto');
    H.readings.push({ t: now(), soil: r1(S.soil), temp: r1(S.temp), hum: Math.round(S.hum) });
    if (H.readings.length > 600) H.readings.shift();
    if (n % 15 === 0) save();
    PG.emit('hist');
  }
  function tick() {
    n++;
    if (S.pump && --S.pumpLeft <= 0) stopPump();
    if (n % 3 === 0) read();
    PG.emit('state', 'tick');
  }

  function liveData() {
    var last = null, i;
    for (i = H.events.length - 1; i >= 0; i--) if (H.events[i].type === 'auto' || H.events[i].type === 'manual') { last = H.events[i]; break; }
    var rem = S.lastEnd + waitMs() - now(), l = level('soil', S.soil);
    return {
      nombrePlanta: (PG.plant ? PG.plant.nombre + (PG.plant.especie ? ' (' + PG.plant.especie + ')' : '') : 'La Dormilona (Mimosa pudica)'),
      ubicacion: PG.plant ? PG.plant.tipo + ', ' + PG.plant.ubicacion : 'Interior, Sala junto a la ventana',
      humedadSuelo: S.ok ? Math.round(S.soil) + '%' : 'sin lectura (sensor desconectado)',
      umbralMinimo: S.thr + '%',
      estadoHumedad: !S.ok ? 'Sin lectura' : l === 'ok' ? 'Dentro del rango' : l === 'warn' ? 'Por debajo del umbral' : 'Crítica',
      temperatura: r1(S.temp) + '°C', humedadAmb: Math.round(S.hum) + '%', presion: '1013 hPa', luz: '540 lx',
      estadoBomba: S.pump ? 'Activa · riega ' + S.pumpLeft + ' s más' : 'Apagada',
      duracionRiegoConfigurada: S.dur + ' s',
      esperaMinimaEntreRiegos: S.wait + (S.demo ? ' s (modo demo)' : ' min'),
      ultimoRiego: last ? fmtWhen(last.t) : 'Sin riegos registrados',
      proximoEstimado: S.pump ? 'Regando ahora' : !S.ok ? 'No disponible mientras el sensor esté desconectado'
        : S.soil >= S.thr ? 'Se regará cuando la humedad baje de ' + S.thr + '%'
          : rem > 0 ? 'En espera ' + Math.ceil(rem / 1000) + ' s antes de volver a regar' : 'En la próxima lectura'
    };
  }

  PG.sim = {
    level: level, fmtWhen: fmtWhen, toast: toast, TZ: TZ,
    waitLeft: function () { return S.lastEnd ? Math.max(0, Math.ceil((S.lastEnd + waitMs() - now()) / 1000)) : 0; }, liveData: liveData, _tick: tick,
    toggle: function () { if (S.pump) stopPump(); else startPump('manual'); },
    fail: function () { fail(4); },
    saveSettings: function () {
      try { localStorage.setItem(SET, JSON.stringify({ thr: S.thr, dur: S.dur, wait: S.wait, demo: S.demo })); } catch (e) { }
      toast('Ajustes guardados', 'ok');
    },
    clear: function () { H = { readings: [], events: [] }; seed(); save(); PG.emit('hist'); }
  };
  Object.defineProperty(PG.sim, 'hist', { get: function () { return H; } });
  window.addEventListener('beforeunload', save);
  setInterval(tick, 1000);
})();
