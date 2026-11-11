/* Sincronización con Firebase: autenticación anónima + Firestore.
   La app sigue funcionando con localStorage; la nube agrega respaldo y persistencia entre sesiones. */
(function () {
  var SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
  function setState(s, msg) { PG.cloud = { state: s, msg: msg || '' }; PG.emit('cloud', PG.cloud); }
  PG.cloud = { state: 'off', msg: '' };

  async function main(sdk) {
    var cfg = window.FIREBASE_CONFIG, opt = window.PG_CLOUD || {}, F = sdk.fs;
    var every = opt.readingEveryMs || 60000, db, uid, known = {}, timer, lastR = {}, ready = false, pend = [];
    setState('connecting');
    function fail(e) { setState('error', (e && (e.code || e.message)) || 'error'); }
    try {
      db = F.getFirestore(sdk.app.initializeApp(cfg));
      uid = (await sdk.auth.signInAnonymously(sdk.auth.getAuth())).user.uid;
    } catch (e) { return fail(e); }

    var col = function () { return F.collection.apply(null, [db, 'users', uid].concat([].slice.call(arguments))); };
    var ref = function () { return F.doc.apply(null, [db, 'users', uid].concat([].slice.call(arguments))); };
    var clean = function (o) { return JSON.parse(JSON.stringify(o)); };

    async function wipe(plant, sub) { /* borra una subcolección por tandas */
      for (; ;) {
        var s = await F.getDocs(F.query(col('plantas', plant, sub), F.limit(400)));
        if (s.empty) return;
        var b = F.writeBatch(db); s.docs.forEach(function (d) { b.delete(d.ref); }); await b.commit();
      }
    }
    async function pushPlants() {
      var d = PG.plantsData(), b = F.writeBatch(db), ids = {};
      d.list.forEach(function (p, i) { var o = clean(p); delete o.id; o.orden = i; ids[p.id] = 1; b.set(ref('plantas', p.id), o, { merge: true }); });
      Object.keys(known).forEach(function (id) {
        if (ids[id]) return;
        b.delete(ref('plantas', id));
        wipe(id, 'lecturas').then(function () { return wipe(id, 'eventos'); }).catch(function () { });
      });
      b.set(ref('meta', 'ajustes'), { activa: d.activa, demo: !!PG.state.demo }, { merge: true });
      await b.commit(); known = ids;
    }
    async function pullPlants() {
      var s = await F.getDocs(col('plantas'));
      if (s.empty) return false;
      var list = s.docs.map(function (d) { var o = d.data(); o.id = d.id; return o; })
        .sort(function (a, b) { return (a.orden || 0) - (b.orden || 0); });
      var m = await F.getDoc(ref('meta', 'ajustes')), md = m.exists() ? m.data() : {};
      list.forEach(function (p) { known[p.id] = 1; delete p.orden; });
      if (typeof md.demo === 'boolean') PG.state.demo = md.demo;
      PG.plantsLoad({ list: list, activa: md.activa });
      return true;
    }
    async function pullHistory() { /* historial de TODAS las plantas, cada una con su propia simulación */
      var list = PG.plantsData().list, i, id;
      var data = function (s) { return s.docs.map(function (d) { return d.data(); }).reverse(); };
      for (i = 0; i < list.length; i++) {
        id = list[i].id;
        var q = function (sub, n) { return F.query(col('plantas', id, sub), F.orderBy('t', 'desc'), F.limit(n)); };
        var rs = await F.getDocs(q('lecturas', 600)), es = await F.getDocs(q('eventos', 80));
        PG.sim.setHistory(id, data(rs), data(es));
      }
    }
    function sendEvent(e) { var o = clean(e), id = o.plant; delete o.plant; return F.addDoc(col('plantas', id, 'eventos'), o); }

    PG.on('plants:changed', function () { clearTimeout(timer); timer = setTimeout(function () { pushPlants().catch(fail); }, 500); });
    PG.on('event', function (e) { if (ready) sendEvent(e).catch(fail); else pend.push(e); });
    PG.on('reading', function (r) {
      if (!ready || r.t - (lastR[r.plant] || 0) < every) return;
      lastR[r.plant] = r.t; var o = clean(r), id = o.plant; delete o.plant;
      F.addDoc(col('plantas', id, 'lecturas'), o).catch(fail);
    });
    PG.on('history:clear', function (id) {
      wipe(id, 'lecturas').then(function () { return wipe(id, 'eventos'); }).catch(fail);
    });

    try {
      if (!(await pullPlants())) await pushPlants(); /* primera vez: sube lo que hay en este navegador */
      ready = true;
      await Promise.all(pend.splice(0).map(sendEvent));
      await pullHistory();
      setState('on');
    } catch (e) { fail(e); }
  }
  PG._cloudMain = main; /* gancho para pruebas */

  var cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.apiKey || /^PEGA/.test(cfg.apiKey)) { setState('off', 'Firebase sin configurar'); return; }
  Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js'), import(SDK + 'firebase-firestore.js')])
    .then(function (m) { return main({ app: m[0], auth: m[1], fs: m[2] }); })
    .catch(function (e) { setState('error', (e && e.message) || 'No se pudo cargar Firebase'); });
})();
