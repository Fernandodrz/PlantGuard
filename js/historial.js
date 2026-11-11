/* Pantalla Historial: gráfica Chart.js con lecturas guardadas y tabla de eventos */
(function () {
  var html = [
    '<h1 class="title">Historial</h1><p class="sub" id="sub"></p>',
    '<div class="tabs" role="tablist">',
    '<button class="tab" role="tab" data-k="h" aria-selected="true">Humedad</button>',
    '<button class="tab" role="tab" data-k="t" aria-selected="false">Temperatura</button>',
    '<button class="tab" role="tab" data-k="r" aria-selected="false">Riegos</button></div>',
    '<select class="sel" id="rng" aria-label="Rango"><option value="live">Últimas lecturas</option><option value="all">Todo el historial (por fecha)</option></select>',
    '<div class="chart"><div style="position:relative;height:220px"><canvas id="cv"></canvas></div><div class="legend" id="lg"></div></div>',
    '<h2 style="font-size:17px;margin-bottom:10px">Eventos recientes</h2>',
    '<table class="tbl"><tbody id="ev"></tbody></table>',
    '<button class="mini" id="clr">Reiniciar historial de ejemplo</button>'
  ].join('');

  var key = 'h', range = 'live', sec, chart, sig = '';
  var ICON = { auto: '💧', manual: '🖐', stop: '⏹', crit: '⚠️', off: '📡', on: '✅' };

  function lab(t) {
    var d = new Date(t), TZ = PG.sim.TZ;
    var hm = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: range === 'live' ? '2-digit' : undefined, hour12: false, timeZone: TZ });
    return range === 'live' ? hm : d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', timeZone: TZ }) + ' ' + hm;
  }
  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }

  function series() {
    var H = PG.sim.hist, r = H.readings, thr = PG.state.thr, g = css('--green') || '#3D5A33', w = css('--warn') || '#C98B5A';
    if (key === 'r') {
      var days = [], cnt = {}, i, d;
      for (i = 6; i >= 0; i--) { d = new Date(Date.now() - i * 864e5); days.push(d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', timeZone: PG.sim.TZ })); }
      days.forEach(function (x) { cnt[x] = 0; });
      H.events.forEach(function (e) {
        if (e.type !== 'auto' && e.type !== 'manual') return;
        var k = new Date(e.t).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', timeZone: PG.sim.TZ }); if (k in cnt) cnt[k]++;
      });
      return { type: 'bar', labels: days, ds: [{ label: 'Riegos por día', data: days.map(function (x) { return cnt[x]; }), backgroundColor: g, borderRadius: 6 }] };
    }
    if (range === 'live') r = r.slice(-40);
    else { var st = Math.ceil(r.length / 100); r = r.filter(function (_, i) { return i % st === 0; }); }
    var L = r.map(function (x) { return lab(x.t); });
    if (key === 't') return { type: 'line', labels: L, ds: [{ label: 'Temperatura (°C)', data: r.map(function (x) { return x.temp; }), borderColor: g, tension: .3, pointRadius: 0 }] };
    return {
      type: 'line', labels: L, ds: [
        { label: 'Humedad del suelo (%)', data: r.map(function (x) { return x.soil; }), borderColor: g, tension: .3, pointRadius: 0 },
        { label: 'Humedad ambiente (%)', data: r.map(function (x) { return x.hum; }), borderColor: '#8FA7B8', tension: .3, pointRadius: 0 },
        { label: 'Umbral (' + thr + '%)', data: r.map(function () { return thr; }), borderColor: w, borderDash: [5, 5], pointRadius: 0 }]
    };
  }

  function draw() {
    var lg = sec.querySelector('#lg');
    if (!window.Chart) { lg.textContent = 'No se pudo cargar Chart.js (revisa tu conexión).'; return; }
    var s = series(), id = key + range;
    if (chart && sig === id) {
      chart.data.labels = s.labels;
      chart.data.datasets.forEach(function (d, i) { d.data = s.ds[i].data; d.label = s.ds[i].label; });
      chart.update('none'); return;
    }
    if (chart) chart.destroy();
    sig = id; var tx = css('--muted') || '#7C7F6E';
    chart = new Chart(sec.querySelector('#cv'), {
      type: s.type, data: { labels: s.labels, datasets: s.ds }, options: {
        animation: false, responsive: true, maintainAspectRatio: false,
        scales: { x: { ticks: { maxTicksLimit: 5, color: tx, font: { size: 10 } } }, y: { beginAtZero: key === 'r', ticks: { color: tx, precision: 0 } } },
        plugins: { legend: { labels: { boxWidth: 10, color: tx, font: { size: 11 } } } }
      }
    });
  }

  function table() {
    var ev = PG.sim.hist.events.slice(-10).reverse();
    sec.querySelector('#ev').innerHTML = ev.length ? ev.map(function (e) {
      return '<tr><td>' + PG.sim.fmtWhen(e.t) + '</td><td>' + (ICON[e.type] || '•') + ' ' + e.msg + '</td></tr>';
    }).join('') : '<tr><td colspan="2">Sin eventos todavía</td></tr>';
  }
  function refresh() { if (PG.current === 'historial') { draw(); table(); } }

  PG.register('historial', {
    html: html,
    init: function (el) {
      sec = el;
      sec.querySelectorAll('.tab').forEach(function (t) {
        t.onclick = function () {
          sec.querySelectorAll('.tab').forEach(function (x) { x.setAttribute('aria-selected', x === t); });
          key = t.dataset.k; draw();
        };
      });
      sec.querySelector('#rng').onchange = function () { range = this.value; draw(); };
      sec.querySelector('#clr').onclick = function () { PG.sim.clear(); };
      var sub = function () { sec.querySelector('#sub').textContent = 'Simulación en vivo · ' + PG.plant.nombre + ' · hora de Ciudad de México'; };
      sub(); PG.on('plant', sub);
      PG.on('hist', refresh);
    },
    onShow: function () { draw(); table(); }
  });
})();
