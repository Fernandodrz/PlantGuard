/* Pantalla Inicio: lecturas simuladas con color por nivel, estado de la bomba y alertas (HU02, HU05, HU06, HU07) */
(function () {
  var html = [
    '<div class="top"><div class="logo"><i></i>PlantGuard</div><div class="pill">Bytec <b>◎</b></div></div>',
    '<div class="alert" id="alerta">⚠ <span></span></div>',
    '<div class="hero"><small>Humedad del suelo</small><div class="big"><span id="hv" style="font-size:56px;opacity:1"></span><span>%</span></div><p id="hmsg"></p></div>',
    '<div class="grid">',
    '<div class="tile" id="t-temp"><small>🌡</small><b></b><small>Temperatura</small></div>',
    '<div class="tile" id="t-hum"><small>💧</small><b></b><small>Humedad amb.</small></div>',
    '<div class="tile"><small>〰</small><b>1013</b><small>Presión (hPa)</small></div>',
    '<div class="tile"><small>☀</small><b>540 lx</b><small>Luz ambiental</small></div>',
    '</div>',
    '<div class="pump"><div><strong>Bomba de agua</strong><span class="muted" id="pmsg"></span></div>',
    '<button class="sw" id="sw" role="switch" aria-label="Bomba de agua"></button></div>',
    '<button class="mini" id="fail">Probar fallo de sensor</button>'
  ].join('');

  function lv(el, l) { el.classList.remove('lv-ok', 'lv-warn', 'lv-bad'); el.classList.add('lv-' + l); }

  function render(sec) {
    var s = PG.state, L = PG.sim.level, r = Math.round(s.soil), l = s.ok ? L('soil', s.soil) : 'bad';
    sec.querySelector('#hv').textContent = s.ok ? r : '--';
    var m = sec.querySelector('#hmsg');
    m.textContent = !s.ok ? 'Sensor desconectado' : l === 'bad' ? 'Humedad crítica (umbral ' + s.thr + '%)'
      : l === 'warn' ? 'Por debajo del umbral (' + s.thr + '%)' : 'Dentro del rango (' + s.thr + '% mínimo)';
    m.className = 'lv-' + l;
    var t = sec.querySelector('#t-temp'), h = sec.querySelector('#t-hum');
    t.querySelector('b').textContent = s.temp.toFixed(1) + '°C'; lv(t, L('temp', s.temp));
    h.querySelector('b').textContent = Math.round(s.hum) + '%'; lv(h, L('hum', s.hum));

    var msg = '', cls = '';
    if (!s.ok) { msg = 'Sensor de suelo desconectado — reintentando…'; cls = 'bad'; }
    else if (l === 'bad') { msg = 'Humedad crítica — ' + r + '% en el suelo'; cls = 'bad'; }
    else if (s.pump) msg = s.pumpMode === 'auto' ? 'Humedad baja — riego automático en curso' : 'Riego manual en curso';
    else if (l === 'warn') { msg = 'Humedad baja — esperando para regar'; cls = 'warn'; }
    var a = sec.querySelector('#alerta');
    a.style.display = msg ? 'flex' : 'none'; a.className = 'alert ' + cls; a.querySelector('span').textContent = msg;

    var w = PG.sim.waitLeft();
    sec.querySelector('#sw').setAttribute('aria-checked', s.pump);
    sec.querySelector('#pmsg').textContent = s.pump
      ? (s.pumpMode === 'auto' ? 'Automático' : 'Manual') + ' · riega ' + s.pumpLeft + ' s más'
      : (w ? 'Apagada · espera ' + (w >= 60 ? Math.ceil(w / 60) + ' min' : w + ' s') + ' para volver a regar' : 'Apagada');
  }

  PG.register('inicio', {
    html: html,
    init: function (sec) {
      sec.querySelector('#sw').onclick = function () { PG.sim.toggle(); };
      sec.querySelector('#fail').onclick = function () { PG.sim.fail(); };
      PG.on('state', function () { render(sec); });
      render(sec);
    }
  });
})();
