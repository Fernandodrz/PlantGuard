/* Pantalla Mi planta: ficha editable (se guarda en localStorage) y estado de riego conectado al simulador */
(function () {
  var KEY = 'pg_planta_v1';
  var P = PG.plant = {
    nombre: 'La Dormilona', especie: 'Mimosa pudica', tipo: 'Interior', ubicacion: 'Sala · junto a la ventana',
    descripcion: 'Conocida como "dormilona" porque sus hojas se pliegan al tacto o al anochecer — una señal visual útil para confirmar que está sana e hidratada.',
    riego: 'Cada 2-3 días', luz: 'Indirecta', temp: '18-25°C'
  };
  try { Object.assign(P, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { }

  function fld(label, id, max) { return '<label class="fld">' + label + '<input id="' + id + '" maxlength="' + max + '"></label>'; }
  var html = [
    '<div class="back"><b>‹</b>Mi planta</div>',
    '<div class="plant">',
    '<svg width="120" height="110" viewBox="0 0 120 110" fill="none" stroke="#5E7F57" stroke-width="2.5" stroke-linecap="round"><path d="M60 100V30M60 30Q40 28 30 22M60 30Q80 26 90 20M60 55Q42 52 28 56M60 70Q80 66 94 72"/><circle cx="28" cy="22" r="6" fill="#E58FB0" stroke="none"/><circle cx="91" cy="19" r="6" fill="#E58FB0" stroke="none"/><circle cx="76" cy="46" r="5" fill="#E58FB0" stroke="none"/></svg>',
    '<h2 id="p-nombre"></h2><em id="p-especie"></em>',
    '<div class="chips"><span class="chip" id="p-tipo"></span><span class="chip" id="p-ubic"></span></div>',
    '</div>',
    '<p class="muted" id="p-desc" style="font-size:14px"></p>',
    '<div class="facts">',
    '<div class="tile"><small>💧 Riego</small><b id="p-riego"></b></div>',
    '<div class="tile"><small>☀ Luz</small><b id="p-luz"></b></div>',
    '<div class="tile"><small>🌡 Temp. ideal</small><b id="p-temp"></b></div>',
    '</div>',
    '<h2 style="font-size:19px;margin-top:16px">Estado actual</h2>',
    '<div class="state"><div><small>Último riego</small><b id="p-last"></b></div><div><small>Próximo estimado</small><b id="p-next"></b></div></div>',
    '<button class="ghost" id="p-edit">Editar información de la planta</button>',
    '<div class="card" id="p-form" style="display:none;margin-top:16px">',
    '<h2 style="font-size:19px;margin-bottom:12px">Editar planta</h2>',
    fld('Nombre', 'f-nombre', 40), fld('Especie', 'f-especie', 50),
    '<label class="fld">Tipo<select id="f-tipo"><option>Interior</option><option>Exterior</option><option>Invernadero</option></select></label>',
    fld('Ubicación', 'f-ubic', 50), fld('Riego recomendado', 'f-riego', 25), fld('Luz', 'f-luz', 25), fld('Temperatura ideal', 'f-temp', 15),
    '<label class="fld">Descripción<textarea id="f-desc" rows="3" maxlength="200"></textarea></label>',
    '<button class="save" id="p-save">Guardar</button>',
    '<button class="ghost" id="p-cancel" style="margin-top:10px">Cancelar</button>',
    '</div>'
  ].join('');

  PG.register('planta', {
    html: html,
    init: function (sec) {
      var $ = function (s) { return sec.querySelector(s); };
      var map = [['#p-nombre', 'nombre'], ['#p-especie', 'especie'], ['#p-tipo', 'tipo'], ['#p-ubic', 'ubicacion'],
      ['#p-desc', 'descripcion'], ['#p-riego', 'riego'], ['#p-luz', 'luz'], ['#p-temp', 'temp']];
      var ids = { nombre: '#f-nombre', especie: '#f-especie', tipo: '#f-tipo', ubicacion: '#f-ubic', riego: '#f-riego', luz: '#f-luz', temp: '#f-temp', descripcion: '#f-desc' };

      function show() { map.forEach(function (m) { $(m[0]).textContent = P[m[1]]; }); $('#p-especie').style.display = P.especie ? '' : 'none'; }
      function status() { var d = PG.sim.liveData(); $('#p-last').textContent = d.ultimoRiego; $('#p-next').textContent = d.proximoEstimado; }
      function toggle(open) { $('#p-form').style.display = open ? 'block' : 'none'; $('#p-edit').style.display = open ? 'none' : 'block'; }

      $('#p-edit').onclick = function () {
        Object.keys(ids).forEach(function (k) { $(ids[k]).value = P[k]; });
        toggle(true); $('#p-form').scrollIntoView({ block: 'nearest' }); $('#f-nombre').focus();
      };
      $('#p-cancel').onclick = function () { toggle(false); };
      $('#p-save').onclick = function () {
        var nombre = $('#f-nombre').value.trim();
        if (!nombre) { PG.sim.toast('Escribe un nombre para la planta', 'bad'); $('#f-nombre').focus(); return; }
        Object.keys(ids).forEach(function (k) { P[k] = $(ids[k]).value.trim(); });
        P.nombre = nombre;
        try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) { }
        show(); toggle(false); PG.emit('plant');
        PG.sim.toast('Información de la planta guardada', 'ok');
      };
      PG.on('hist', function () { if (PG.current === 'planta') status(); });
      PG.on('state', function () { if (PG.current === 'planta') status(); });
      PG.on('show', function (id) { if (id === 'planta') status(); });
      show(); status();
    }
  });
})();
