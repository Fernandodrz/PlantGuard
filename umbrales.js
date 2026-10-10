/* Pantalla Umbrales: humedad mínima, duración y espera entre riegos (HU03, HU04) */
(function () {
  var html = [
    '<h1 class="title">Umbrales de riego</h1><p class="sub">Ajusta cuándo se activa el riego automático</p>',
    '<div class="card"><div class="row"><b>Umbral de humedad mínima</b><output id="o1"></output></div>',
    '<input type="range" id="r1" min="10" max="80" aria-label="Umbral de humedad mínima"><div class="scale"><span>10%</span><span>80%</span></div>',
    '<p class="muted" style="margin-top:8px">Si la humedad del suelo cae por debajo de este valor, la bomba se activa automáticamente.</p></div>',
    '<div class="card"><div class="row"><b>Duración del riego</b><output id="o2"></output></div>',
    '<input type="range" id="r2" min="5" max="15" aria-label="Duración del riego"><div class="scale"><span>5 s</span><span>15 s</span></div></div>',
    '<div class="card"><div class="row"><b>Espera mínima entre riegos</b><output id="o3"></output></div>',
    '<input type="range" id="r3" min="10" max="120" step="5" aria-label="Espera mínima entre riegos">',
    '<p class="muted" style="margin-top:8px">Evita ciclos de riego demasiado frecuentes tras una activación.</p></div>',
    '<button class="save" id="save">Guardar cambios</button>'
  ].join('');

  PG.register('umbrales', {
    html: html,
    init: function (sec) {
      var map = [['r1', 'o1', 'thr', '%'], ['r2', 'o2', 'dur', ' s'], ['r3', 'o3', 'wait', ' min']];
      map.forEach(function (m) {
        var r = sec.querySelector('#' + m[0]), o = sec.querySelector('#' + m[1]);
        r.value = PG.state[m[2]]; o.textContent = r.value + m[3];
        r.oninput = function () { o.textContent = r.value + m[3]; PG.set(m[2], +r.value); };
      });
      var b = sec.querySelector('#save');
      b.onclick = function () {
        b.textContent = 'Cambios guardados';
        setTimeout(function () { b.textContent = 'Guardar cambios'; }, 1600);
      };
    }
  });
})();
