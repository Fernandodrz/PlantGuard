/* Pantalla Inicio: humedad del suelo, sensores y bomba (HU02, HU05, HU06) */
(function () {
  var html = [
    '<div class="top"><div class="logo"><i></i>PlantGuard</div><div class="pill">Bytec <b>◎</b></div></div>',
    '<div class="alert" id="alerta">⚠ <span>Humedad del suelo baja — riego automático en curso</span></div>',
    '<div class="hero"><small>Humedad del suelo</small><div class="big"><span id="hv" style="font-size:56px;opacity:1"></span><span>%</span></div><p id="hmsg"></p></div>',
    '<div class="grid">',
    '<div class="tile"><small>🌡</small><b>23°C</b><small>Temperatura</small></div>',
    '<div class="tile"><small>💧</small><b>61%</b><small>Humedad amb.</small></div>',
    '<div class="tile"><small>〰</small><b>1013</b><small>Presión (hPa)</small></div>',
    '<div class="tile"><small>☀</small><b>540 lx</b><small>Luz ambiental</small></div>',
    '</div>',
    '<div class="pump"><div><strong>Bomba de agua</strong><span class="muted" id="pmsg"></span></div>',
    '<button class="sw" id="sw" role="switch" aria-label="Bomba de agua"></button></div>'
  ].join('');

  function render(sec) {
    var s = PG.state, low = s.soil < s.thr;
    sec.querySelector('#hv').textContent = s.soil;
    var msg = sec.querySelector('#hmsg');
    msg.textContent = low ? 'Por debajo del umbral (' + s.thr + '%)' : 'Dentro del rango (' + s.thr + '% mínimo)';
    msg.style.color = low ? 'var(--warn)' : '#A9C79B';
    sec.querySelector('#alerta').style.display = low ? 'flex' : 'none';
    sec.querySelector('#sw').setAttribute('aria-checked', s.pump);
    sec.querySelector('#pmsg').textContent = s.pump ? 'Activa · riega ' + Math.min(s.dur, 8) + ' s más' : 'Apagada';
  }

  PG.register('inicio', {
    html: html,
    init: function (sec) {
      sec.querySelector('#sw').onclick = function () { PG.set('pump', !PG.state.pump); };
      PG.on('state', function () { render(sec); });
      render(sec);
    }
  });
})();
