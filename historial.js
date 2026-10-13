/* Pantalla Historial: gráfica por pestañas y eventos recientes (HU08) */
(function () {
  var html = [
    '<h1 class="title">Historial</h1><p class="sub">Últimos 7 días · Monstera del balcón</p>',
    '<div class="tabs" role="tablist">',
    '<button class="tab" role="tab" data-k="h" aria-selected="true">Humedad</button>',
    '<button class="tab" role="tab" data-k="t" aria-selected="false">Temperatura</button>',
    '<button class="tab" role="tab" data-k="r" aria-selected="false">Riegos</button></div>',
    '<div class="chart"><svg id="ch" viewBox="0 0 320 170" role="img" aria-label="Gráfica de historial"></svg><div class="legend" id="lg"></div></div>',
    '<h2 style="font-size:17px;margin-bottom:12px">Eventos recientes</h2>',
    '<div class="ev"><i style="background:var(--green)">💧</i><div><strong>Riego automático activado</strong><span class="muted">Hoy · 14:12 · duró 10 s, humedad al 31%</span></div></div>',
    '<div class="ev"><i style="background:var(--warn)">!</i><div><strong>Humedad crítica detectada</strong><span class="muted">Hoy · 13:58 · 22% de humedad en el suelo</span></div></div>',
    '<div class="ev"><i style="background:var(--green)">☀</i><div><strong>Riego manual iniciado</strong><span class="muted">Ayer · 09:20 · activado desde la app</span></div></div>',
    '<div class="ev"><i style="background:#8D8D72">≈</i><div><strong>Sensor de suelo desconectado</strong><span class="muted">Ayer · 03:44 · reconectado tras 6 min</span></div></div>'
  ].join('');

  var days = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
  var data = { h: [52, 58, 44, 38, 50, 58, 64], t: [22, 23, 25, 24, 22, 23, 24], r: [1, 0, 2, 1, 0, 1, 2] };
  var key = 'h', sec;

  function chart() {
    var thr = PG.state.thr, v = data[key];
    var mn = key === 'h' ? 20 : key === 't' ? 18 : 0, mx = key === 'h' ? 80 : key === 't' ? 28 : 3;
    var L = 14, R = 306, T = 14, B = 140, s = '';
    function X(i) { return L + i * (R - L) / 6; }
    function Y(x) { return B - (x - mn) / (mx - mn) * (B - T); }
    for (var g = 0; g < 3; g++) { var y = T + g * (B - T) / 2; s += '<line x1="' + L + '" x2="' + R + '" y1="' + y + '" y2="' + y + '" stroke="var(--line)"/>'; }
    if (key === 'r') {
      v.forEach(function (x, i) { s += '<rect x="' + (X(i) - 12) + '" y="' + Y(x) + '" width="24" height="' + (B - Y(x)) + '" rx="5" fill="var(--green)"/>'; });
    } else {
      if (key === 'h') s += '<line x1="' + L + '" x2="' + R + '" y1="' + Y(thr) + '" y2="' + Y(thr) + '" stroke="var(--warn)" stroke-dasharray="4 4"/>';
      s += '<polyline fill="none" stroke="var(--green)" stroke-width="2.5" stroke-linejoin="round" points="' + v.map(function (x, i) { return X(i) + ',' + Y(x); }).join(' ') + '"/>';
    }
    days.forEach(function (d, i) { s += '<text x="' + X(i) + '" y="162" text-anchor="middle" font-size="11" fill="var(--muted)">' + d + '</text>'; });
    sec.querySelector('#ch').innerHTML = s;
    sec.querySelector('#lg').textContent = key === 'h' ? '- - Umbral configurado (' + thr + '%)' : key === 't' ? 'Temperatura ambiente (°C)' : 'Riegos por día';
  }

  PG.register('historial', {
    html: html,
    init: function (el) {
      sec = el;
      sec.querySelectorAll('.tab').forEach(function (t) {
        t.onclick = function () {
          sec.querySelectorAll('.tab').forEach(function (x) { x.setAttribute('aria-selected', x === t); });
          key = t.dataset.k; chart();
        };
      });
      PG.on('state', chart);
      chart();
    },
    onShow: function () { chart(); }
  });
})();
