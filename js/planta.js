/* Pantalla Mi planta: varias plantas con ícono elegible, ficha editable (localStorage) y estado de riego del simulador */
(function () {
  var KEY = 'pg_plantas_v2', OLD = 'pg_planta_v1', MAX = 8, PINK = '#E58FB0', LEAF = '#7FA56F';

  /* ---------- Íconos (SVG simples, viewBox 120x110) ---------- */
  function fern() { var s = '<path d="M60 100V18"/>'; for (var i = 0; i < 6; i++) { var y = 30 + i * 11, w = 24 - i * 2; s += '<path d="M60 ' + y + 'l-' + w + ' -8M60 ' + y + 'l' + w + ' -8"/>'; } return s; }
  function flower() {
    var s = '';
    for (var a = 0; a < 5; a++) { var g = a * 72 * Math.PI / 180 - Math.PI / 2; s += '<circle cx="' + (60 + 13 * Math.cos(g)).toFixed(1) + '" cy="' + (40 + 13 * Math.sin(g)).toFixed(1) + '" r="9" fill="' + PINK + '" stroke="none"/>'; }
    return s + '<circle cx="60" cy="40" r="7" fill="#F2C14E" stroke="none"/><path d="M60 49V100M60 82Q44 80 38 68M60 74Q76 72 82 62"/>';
  }
  var ICONS = {
    mimosa: { n: 'Mimosa', d: '<path d="M60 100V30M60 30Q40 28 30 22M60 30Q80 26 90 20M60 55Q42 52 28 56M60 70Q80 66 94 72"/><circle cx="28" cy="22" r="6" fill="' + PINK + '" stroke="none"/><circle cx="91" cy="19" r="6" fill="' + PINK + '" stroke="none"/><circle cx="76" cy="46" r="5" fill="' + PINK + '" stroke="none"/>' },
    cactus: { n: 'Cactus', d: '<path d="M52 100V38a8 8 0 0116 0v62M52 74H42a6 6 0 01-6-6V54M68 64h10a6 6 0 006-6V44M44 100h32"/><circle cx="60" cy="30" r="5" fill="' + PINK + '" stroke="none"/>' },
    suculenta: { n: 'Suculenta', d: '<path d="M60 96C48 86 48 66 60 54c12 12 12 32 0 42zM60 96C44 92 36 76 42 62c12 2 18 16 18 34zM60 96c16-4 24-20 18-34-12 2-18 16-18 34zM46 96h28"/>' },
    monstera: { n: 'Hoja grande', d: '<path d="M60 100V62M60 62C36 62 26 40 38 20c16 4 24 20 22 42zM60 62c24 0 34-22 22-42-16 4-24 20-22 42zM60 62V30M48 44l8 4M72 44l-8 4"/>' },
    helecho: { n: 'Helecho', d: fern() },
    flor: { n: 'Flor', d: flower() },
    bonsai: { n: 'Árbol', d: '<path d="M60 100V64M60 82l-14-10M60 74l14-12M48 100h24"/><circle cx="60" cy="40" r="20" fill="' + LEAF + '" stroke="none"/><circle cx="42" cy="54" r="12" fill="' + LEAF + '" stroke="none"/><circle cx="78" cy="52" r="13" fill="' + LEAF + '" stroke="none"/>' },
    hierbas: { n: 'Hierbas', d: '<path d="M60 100V56M60 84l-16-8M60 74l16-8M60 64l-12-8M46 100h28"/><ellipse cx="40" cy="74" rx="9" ry="5" transform="rotate(-25 40 74)" fill="' + LEAF + '" stroke="none"/><ellipse cx="80" cy="64" rx="9" ry="5" transform="rotate(25 80 64)" fill="' + LEAF + '" stroke="none"/><ellipse cx="46" cy="54" rx="8" ry="5" transform="rotate(-25 46 54)" fill="' + LEAF + '" stroke="none"/><ellipse cx="60" cy="48" rx="6" ry="9" fill="' + LEAF + '" stroke="none"/>' }
  };
  function svg(k, w) { return '<svg class="pl-ico" width="' + w + '" height="' + Math.round(w * 0.92) + '" viewBox="0 0 120 110" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[k] || ICONS.mimosa).d + '</svg>'; }
  PG.plantIcons = { list: ICONS, svg: svg };

  /* ---------- Datos ---------- */
  var BLANK = { nombre: '', especie: '', tipo: 'Interior', ubicacion: '', descripcion: '', riego: 'Cada 2-3 días', luz: 'Indirecta', temp: '18-25°C', icono: 'suculenta' };
  var MIMOSA = {
    id: 'p1', nombre: 'La Dormilona', especie: 'Mimosa pudica', tipo: 'Interior', ubicacion: 'Sala · junto a la ventana', icono: 'mimosa',
    descripcion: 'Conocida como "dormilona" porque sus hojas se pliegan al tacto o al anochecer — una señal visual útil para confirmar que está sana e hidratada.',
    riego: 'Cada 2-3 días', luz: 'Indirecta', temp: '18-25°C'
  };
  var data = { list: [Object.assign({}, MIMOSA)], activa: 'p1' };
  try {
    var d = JSON.parse(localStorage.getItem(KEY));
    if (d && d.list && d.list.length) data = d;
    else { var o = JSON.parse(localStorage.getItem(OLD)); if (o) Object.assign(data.list[0], o); }
  } catch (e) { }
  var S = PG.state;
  function active() { return data.list.filter(function (p) { return p.id === data.activa; })[0] || data.list[0]; }
  function persist(quiet) { PG.plant = active(); try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { } if (!quiet) PG.emit('plants:changed'); }
  /* Cada planta guarda sus propios umbrales (humedad mínima, duración y espera) en p.cfg */
  data.list.forEach(function (p) { if (!p.cfg) p.cfg = { thr: S.thr, dur: S.dur, wait: S.wait }; });
  function applyCfg(p) { S.thr = p.cfg.thr; S.dur = p.cfg.dur; S.wait = p.cfg.wait; }
  function activate(id) {
    data.activa = id; applyCfg(active()); PG.sim.select(id); /* cambia al panel de sensores de esa planta */
    persist(); PG.emit('state', 'cfg'); PG.emit('plant');
  }
  PG.plantSaveCfg = function () { var c = active().cfg; c.thr = S.thr; c.dur = S.dur; c.wait = S.wait; persist(); };
  PG.plant = active(); applyCfg(active()); PG.sim.select(PG.plant.id);
  PG.selectPlant = function (id) { if (id !== data.activa) { activate(id); PG.emit('plants:reload'); } };
  /* Ganchos para la nube (firebase.js) */
  PG.plantsData = function () { return data; };
  PG.plantsLoad = function (d) {
    data = d; data.list.forEach(function (p) { if (!p.cfg) p.cfg = { thr: 35, dur: 10, wait: 30 }; });
    if (!data.list.some(function (p) { return p.id === data.activa; })) data.activa = data.list[0].id;
    applyCfg(active()); PG.sim.select(active().id); persist(true);
    PG.emit('state', 'cfg'); PG.emit('plants:reload'); PG.emit('plant');
  };


  /* ---------- Validación del formulario (agregar / editar planta) ---------- */
  var TIPOS = ['Interior', 'Exterior', 'Invernadero'], LUZ = ['Directa', 'Indirecta', 'Media sombra', 'Sombra'];
  var L = 'A-Za-zÁÉÍÓÚÜÑáéíóúüñ';
  var RE = {
    nombre: new RegExp('^[' + L + '0-9][' + L + "0-9 .,'’\\-]*$"),
    especie: new RegExp('^[' + L + '][' + L + "  .'’×\\-]*$"),
    ubic: new RegExp('^[' + L + "0-9][" + L + "0-9 .,'’#()·\\-/]*$"),
    riego: new RegExp('^[' + L + "0-9][" + L + "0-9 .,\\-–/]*$"),
    temp: /^(\d{1,2})(?:\s*(?:-|–|a)\s*(\d{1,2}))?\s*(?:°\s*C?|C)?$/i
  };
  function squash(s) { return String(s == null ? '' : s).replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim(); }
  /* v: valores crudos del formulario · ctx: { list, editingId, adding }  →  { ok, errors:{campo:mensaje}, general, clean } */
  function validate(v, ctx) {
    var e = {}, c = {}, x;
    c.nombre = squash(v.nombre);
    if (!c.nombre) e.nombre = 'Escribe un nombre para la planta.';
    else if (c.nombre.length < 2 || c.nombre.length > 40) e.nombre = 'El nombre debe tener entre 2 y 40 caracteres.';
    else if (!RE.nombre.test(c.nombre) || !new RegExp('[' + L + ']').test(c.nombre)) e.nombre = "Usa solo letras, números, espacios y . , ' - (debe incluir al menos una letra).";
    else if ((ctx.list || []).some(function (p) { return p.id !== ctx.editingId && squash(p.nombre).toLowerCase() === c.nombre.toLowerCase(); })) e.nombre = 'Ya tienes una planta con ese nombre.';

    c.especie = squash(v.especie);
    if (c.especie && c.especie.length > 50) e.especie = 'La especie admite máximo 50 caracteres.';
    else if (c.especie && !RE.especie.test(c.especie)) e.especie = 'La especie solo lleva letras, sin números ni símbolos (ej.: Mimosa pudica).';

    c.tipo = squash(v.tipo);
    if (TIPOS.indexOf(c.tipo) < 0) e.tipo = 'Elige un tipo de la lista.';

    c.ubicacion = squash(v.ubicacion);
    if (c.ubicacion && c.ubicacion.length > 50) e.ubicacion = 'La ubicación admite máximo 50 caracteres.';
    else if (c.ubicacion && !RE.ubic.test(c.ubicacion)) e.ubicacion = 'La ubicación tiene símbolos no permitidos (ej.: Sala · junto a la ventana).';

    c.riego = squash(v.riego);
    if (!c.riego) e.riego = 'Indica cada cuánto se riega (ej.: Cada 2-3 días).';
    else if (c.riego.length > 25) e.riego = 'Máximo 25 caracteres (ej.: Cada 2-3 días).';
    else if (!RE.riego.test(c.riego) || !(/\d/.test(c.riego) || /diari|seman|quincen|mensual|ocasional/i.test(c.riego))) e.riego = 'Escribe una frecuencia válida, con un número o "diario", "semanal"… (ej.: Cada 2-3 días).';

    c.luz = squash(v.luz);
    if (!c.luz) e.luz = 'Elige el tipo de luz.';
    else if (c.luz.length > 25 || !new RegExp('^[' + L + ' ]+$').test(c.luz)) e.luz = 'El tipo de luz no es válido.';

    c.temp = squash(v.temp);
    if (!c.temp) e.temp = 'Indica la temperatura ideal (ej.: 18-25°C).';
    else if (!(x = RE.temp.exec(c.temp))) e.temp = 'Formato no válido. Usa un número o un rango (ej.: 18-25°C).';
    else {
      var a = +x[1], b = x[2] == null ? null : +x[2];
      if (a > 45 || (b != null && b > 45)) e.temp = 'La temperatura debe estar entre 0 y 45 °C.';
      else if (b != null && a >= b) e.temp = 'En un rango, el mínimo debe ser menor que el máximo (ej.: 18-25°C).';
      else c.temp = b == null ? a + '°C' : a + '-' + b + '°C';
    }

    c.descripcion = squash(v.descripcion);
    if (c.descripcion.length > 200) e.descripcion = 'La descripción admite máximo 200 caracteres.';
    else if (/[<>]/.test(c.descripcion)) e.descripcion = 'No uses los símbolos < ni >.';
    else if (/(https?:\/\/|www\.)/i.test(c.descripcion)) e.descripcion = 'No incluyas enlaces en la descripción.';

    c.icono = v.icono;
    if (!ICONS[c.icono]) e.icono = 'Elige un ícono.';

    var general = ctx.adding && (ctx.list || []).length >= MAX ? 'Llegaste al máximo de ' + MAX + ' plantas. Elimina una para agregar otra.' : '';
    return { ok: !general && !Object.keys(e).length, errors: e, general: general, clean: c };
  }
  PG.plantValidate = validate;

  /* ---------- Pantalla ---------- */
  function fld(label, id, max, ph) { return '<label class="fld">' + label + '<input id="' + id + '" maxlength="' + max + '" placeholder="' + ph + '" autocomplete="off"><small class="err" data-for="' + id + '" role="alert"></small></label>'; }
  var html = [
    '<div id="p-main">',
    '<div class="back"><b>‹</b>Mi planta</div>',
    '<div class="pl-row" id="p-chips" role="group" aria-label="Mis plantas"></div>',
    '<div class="plant"><span id="p-ico"></span>',
    '<h2 id="p-nombre"></h2><em id="p-especie"></em>',
    '<div class="chips"><span class="chip" id="p-tipo"></span><span class="chip" id="p-ubic"></span></div></div>',
    '<p class="muted" id="p-desc" style="font-size:14px"></p>',
    '<div class="facts">',
    '<div class="tile"><small>💧 Riego</small><b id="p-riego"></b></div>',
    '<div class="tile"><small>☀ Luz</small><b id="p-luz"></b></div>',
    '<div class="tile"><small>🌡 Temp. ideal</small><b id="p-temp"></b></div>',
    '</div>',
    '<h2 style="font-size:19px;margin-top:16px">Estado actual</h2>',
    '<div class="state"><div><small>Último riego</small><b id="p-last"></b></div><div><small>Próximo estimado</small><b id="p-next"></b></div></div>',
    '<button class="ghost" id="p-edit">Editar información de la planta</button>',
    '</div>',
    '<div class="card" id="p-form" style="display:none">',
    '<div class="back"><b id="f-back" role="button" tabindex="0" aria-label="Volver" style="cursor:pointer">‹</b><span id="f-title"></span></div>',
    '<div class="fld" style="margin-bottom:0">Ícono</div><div class="icons" id="f-icons"></div><small class="err" data-for="f-icons" role="alert"></small>',
    fld('Nombre *', 'f-nombre', 40, 'Ej.: La Dormilona'), fld('Especie', 'f-especie', 50, 'Ej.: Mimosa pudica'),
    '<label class="fld">Tipo<select id="f-tipo"><option>Interior</option><option>Exterior</option><option>Invernadero</option></select><small class="err" data-for="f-tipo" role="alert"></small></label>',
    fld('Ubicación', 'f-ubic', 50, 'Ej.: Sala · junto a la ventana'), fld('Riego recomendado *', 'f-riego', 25, 'Ej.: Cada 2-3 días'),
    '<label class="fld">Luz *<select id="f-luz"></select><small class="err" data-for="f-luz" role="alert"></small></label>',
    fld('Temperatura ideal *', 'f-temp', 15, 'Ej.: 18-25°C'),
    '<label class="fld">Descripción<textarea id="f-desc" rows="3" maxlength="200" placeholder="Ej.: Sus hojas se pliegan al tocarlas"></textarea><small class="err" data-for="f-desc" role="alert"></small><small class="muted" id="f-count" style="display:block;text-align:right"></small></label>',
    '<button class="save" id="p-save">Guardar</button>',
    '<button class="ghost" id="p-cancel" style="margin-top:10px">Cancelar</button>',
    '<button class="mini" id="p-del" style="display:none;color:#D9534F">Eliminar esta planta</button>',
    '</div>'
  ].join('');

  PG.register('planta', {
    html: html,
    init: function (sec) {
      var $ = function (s) { return sec.querySelector(s); }, editing = null, sel = 'suculenta';
      var ids = { nombre: '#f-nombre', especie: '#f-especie', tipo: '#f-tipo', ubicacion: '#f-ubic', riego: '#f-riego', luz: '#f-luz', temp: '#f-temp', descripcion: '#f-desc' };

      function txt(id, v, hide) { var el = $(id); el.textContent = v || '—'; if (hide) el.style.display = v ? '' : 'none'; }
      function show() {
        var P = active();
        $('#p-ico').innerHTML = svg(P.icono, 120);
        txt('#p-nombre', P.nombre); txt('#p-especie', P.especie, true); txt('#p-tipo', P.tipo); txt('#p-ubic', P.ubicacion, true);
        txt('#p-desc', P.descripcion, true); txt('#p-riego', P.riego); txt('#p-luz', P.luz); txt('#p-temp', P.temp);
        var row = $('#p-chips'); row.innerHTML = '';
        data.list.forEach(function (p) {
          var b = document.createElement('button'); b.className = 'pl-chip'; b.setAttribute('aria-pressed', p.id === P.id);
          b.innerHTML = svg(p.icono, 24); var s = document.createElement('span'); s.textContent = p.nombre; b.appendChild(s);
          b.onclick = function () { activate(p.id); close(); show(); status(); };
          row.appendChild(b);
        });
        if (data.list.length < MAX) {
          var a = document.createElement('button'); a.className = 'pl-chip add'; a.textContent = '＋ Agregar'; a.onclick = function () { open(null); }; row.appendChild(a);
        }
      }
      function status() { var d = PG.sim.liveData(); $('#p-last').textContent = d.ultimoRiego; $('#p-next').textContent = d.proximoEstimado; }
      function close() { $('#p-form').style.display = 'none'; $('#p-main').style.display = 'block'; }
      function pick(k) { sel = k; if (FIELDS_READY) showErr('icono', ''); $('#f-icons').querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.k === k); }); }
      function open(id) {
        editing = id; var P = id ? active() : BLANK;
        var lz = $('#f-luz'); lz.innerHTML = '';
        LUZ.concat(P.luz && LUZ.indexOf(P.luz) < 0 ? [P.luz] : []).forEach(function (o) { var op = document.createElement('option'); op.textContent = o; lz.appendChild(op); });
        Object.keys(ids).forEach(function (k) { $(ids[k]).value = P[k] || ''; });
        clearErrs(); count();
        $('#f-title').textContent = id ? 'Editar planta' : 'Agregar planta';
        $('#p-del').style.display = id && data.list.length > 1 ? 'block' : 'none';
        pick(P.icono || 'suculenta');
        $('#p-main').style.display = 'none'; $('#p-form').style.display = 'block';
        document.getElementById('screens').scrollTop = 0; $('#f-nombre').focus();
      }

      /* Errores por campo: se muestran bajo cada campo, se validan al salir de él y se limpian al corregir */
      var FIELDS_READY = true;
      var FIELDS = { nombre: '#f-nombre', especie: '#f-especie', tipo: '#f-tipo', ubicacion: '#f-ubic', riego: '#f-riego', luz: '#f-luz', temp: '#f-temp', descripcion: '#f-desc', icono: '#f-icons' };
      function readForm() { var v = { icono: sel }; Object.keys(ids).forEach(function (k) { v[k] = $(ids[k]).value; }); return v; }
      function ctx() { return { list: data.list, editingId: editing, adding: !editing }; }
      function showErr(k, msg) {
        var el = $(FIELDS[k]), out = $('.err[data-for="' + FIELDS[k].slice(1) + '"]');
        if (out) out.textContent = msg || '';
        if (k !== 'icono') { el.setAttribute('aria-invalid', msg ? 'true' : 'false'); el.classList.toggle('bad', !!msg); }
      }
      function clearErrs() { Object.keys(FIELDS).forEach(function (k) { showErr(k, ''); }); }
      function checkOne(k) { showErr(k, validate(readForm(), ctx()).errors[k]); }
      function count() { $('#f-count').textContent = $('#f-desc').value.length + '/200'; }
      Object.keys(ids).forEach(function (k) {
        var el = $(ids[k]);
        el.onblur = function () { checkOne(k); };
        el.oninput = el.onchange = function () { if (el.getAttribute('aria-invalid') === 'true') checkOne(k); if (k === 'descripcion') count(); };
      });

      Object.keys(ICONS).forEach(function (k) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'ic-btn'; b.dataset.k = k; b.title = ICONS[k].n;
        b.innerHTML = svg(k, 44) + '<br>' + ICONS[k].n; b.onclick = function () { pick(k); }; $('#f-icons').appendChild(b);
      });
      $('#p-edit').onclick = function () { open(active().id); };
      $('#p-cancel').onclick = close;
      $('#f-back').onclick = close;
      $('#p-save').onclick = function () {
        var r = validate(readForm(), ctx());
        Object.keys(FIELDS).forEach(function (k) { showErr(k, r.errors[k]); });
        if (r.general) { PG.sim.toast(r.general, 'bad'); return; }
        if (!r.ok) {
          var first = Object.keys(FIELDS).filter(function (k) { return r.errors[k]; })[0], el = $(FIELDS[first]);
          if (el.scrollIntoView) el.scrollIntoView({ block: 'center' });
          if (first !== 'icono' && el.focus) el.focus();
          PG.sim.toast('Revisa los campos marcados en rojo', 'bad'); return;
        }
        var vals = r.clean;
        try {
          if (editing) { Object.assign(active(), vals); persist(); PG.emit('plant'); }
          else { vals.id = 'p' + Date.now(); vals.cfg = { thr: 35, dur: 10, wait: 30 }; data.list.push(vals); activate(vals.id); }
        } catch (err) { PG.sim.toast('No se pudo guardar la planta. Intenta de nuevo.', 'bad'); return; }
        close(); show(); status();
        PG.sim.toast(editing ? 'Información de la planta guardada' : 'Planta agregada: ' + vals.nombre, 'ok');
      };
      $('#p-del').onclick = function () {
        var P = active();
        if (data.list.length < 2 || !window.confirm('¿Eliminar "' + P.nombre + '"?')) return;
        data.list = data.list.filter(function (p) { return p.id !== P.id; });
        activate(data.list[0].id); close(); show(); status(); PG.sim.toast('Planta eliminada', 'ok');
      };
      PG.on('plants:reload', function () { close(); show(); status(); });
      PG.on('hist', function () { if (PG.current === 'planta') status(); });
      PG.on('state', function () { if (PG.current === 'planta') status(); });
      PG.on('show', function (id) { if (id === 'planta') status(); });
      show(); status();
    }
  });
})();
