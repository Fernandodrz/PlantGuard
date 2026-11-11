/* Pantalla Inicio: lecturas simuladas con color por nivel, estado de la bomba y alertas */
(function () {
  var html = [
    '<div class="top"><div class="logo"><i></i>PlantGuard</div><div class="pill"><span id="cloud" class="cloud off">☁ Local</span>Bytec <b>◎</b></div></div>',
    '<div class="pl-row" id="i-plants" role="group" aria-label="Mis plantas"></div>',
    '<div class="alert" id="alerta">⚠ <span></span></div>',
    '<div class="hero"><small>Humedad del suelo<span id="hname"></span></small><div class="big"><span id="hv" style="font-size:56px;opacity:1"></span><span>%</span></div><p id="hmsg"></p></div>',
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

  var sig = '';
  function chips(sec) { /* una pastilla por planta; el punto de color indica su humedad y el halo, si está regando */
    var d = PG.plantsData && PG.plantsData(), box = sec.querySelector('#i-plants'); if (!d) return;
    var key = d.list.map(function (p) { return p.id + p.nombre + p.icono; }).join('|') + '#' + PG.plant.id;
    box.style.display = d.list.length > 1 ? 'flex' : 'none';
    if (sig !== key) {
      sig = key; box.innerHTML = '';
      d.list.forEach(function (p) {
        var b = document.createElement('button'); b.className = 'pl-chip'; b.dataset.id = p.id; b.setAttribute('aria-pressed', p.id === PG.plant.id);
        b.innerHTML = PG.plantIcons.svg(p.icono, 24) + '<span></span><i class="dot"></i>';
        b.querySelector('span').textContent = p.nombre; b.onclick = function () { PG.selectPlant(p.id); };
        box.appendChild(b);
      });
    }
    PG.sim.summary().forEach(function (x) {
      var b = box.querySelector('[data-id="' + x.id + '"]'); if (b) b.querySelector('.dot').className = 'dot lv-' + x.lv + (x.pump ? ' on' : '');
    });
  }

  function render(sec) {
    var s = PG.state, L = PG.sim.level, r = Math.round(s.soil), l = s.ok ? L('soil', s.soil) : 'bad';
    chips(sec);
    sec.querySelector('#hname').textContent = PG.plant ? ' · ' + PG.plant.nombre : '';
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
      function cloud(c) {
        var el = sec.querySelector('#cloud'), t = { off: '☁ Local', connecting: '☁ …', on: '☁ Nube', error: '☁ Sin nube' };
        el.textContent = t[c.state] || '☁'; el.className = 'cloud ' + c.state;
        el.title = c.state === 'on' ? 'Sincronizado con Firebase' : c.state === 'error' ? 'Error de Firebase: ' + c.msg
          : c.state === 'connecting' ? 'Conectando con Firebase…' : 'Firebase sin configurar: los datos quedan solo en este navegador';
      }
      PG.on('cloud', cloud); cloud(PG.cloud || { state: 'off' });
      PG.on('state', function () { render(sec); });
      PG.on('plant', function () { render(sec); });
      render(sec);
    }
  });
})();
