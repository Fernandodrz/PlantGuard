/* Núcleo: estado compartido, eventos y arranque. Las pantallas se registran con PG.register(id, def). */
(function () {
  var PG = window.PG = {
    state: { soil: 28, thr: 35, dur: 10, wait: 30, pump: true },
    order: ['inicio', 'planta', 'umbrales', 'historial'],
    screens: {}, handlers: {}, current: 'inicio'
  };
  PG.register = function (id, def) { PG.screens[id] = def; };
  PG.on = function (ev, fn) { (PG.handlers[ev] = PG.handlers[ev] || []).push(fn); };
  PG.emit = function (ev, data) { (PG.handlers[ev] || []).forEach(function (f) { f(data); }); };
  PG.set = function (key, value) { PG.state[key] = value; PG.emit('state', key); };
  PG.show = function (id) {
    PG.current = id;
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.toggle('on', s.id === id); });
    document.getElementById('screens').scrollTop = 0;
    if (PG.screens[id] && PG.screens[id].onShow) PG.screens[id].onShow();
    PG.emit('show', id);
  };
  PG.start = function () {
    var host = document.getElementById('screens');
    PG.order.forEach(function (id) {
      var def = PG.screens[id]; if (!def) return;
      var sec = document.createElement('section');
      sec.className = 'screen'; sec.id = id; sec.innerHTML = def.html;
      host.appendChild(sec);
      if (def.init) def.init(sec);
    });
    if (PG.nav) PG.nav.init(document.getElementById('nav'));
    PG.show('inicio');
  };
  document.addEventListener('DOMContentLoaded', PG.start);
})();
