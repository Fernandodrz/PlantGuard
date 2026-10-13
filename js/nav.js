/* Barra de navegación: botones, íconos y cambio de pantalla */
(function () {
  var items = [
    { id: 'inicio', label: 'Inicio', icon: '<path d="M3 11l9-8 9 8v10H3z"/>' },
    { id: 'planta', label: 'Mi planta', icon: '<path d="M12 21s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>' },
    { id: 'umbrales', label: 'Umbrales', icon: '<path d="M6 3v18M12 3v18M18 3v18M4 9h4M10 15h4M16 7h4"/>' },
    { id: 'historial', label: 'Historial', icon: '<path d="M3 3v18h18M7 15l4-4 3 3 5-6"/>' }
  ];
  PG.nav = {
    init: function (el) {
      el.innerHTML = items.map(function (i) {
        return '<button data-s="' + i.id + '"><svg viewBox="0 0 24 24">' + i.icon + '</svg>' + i.label + '</button>';
      }).join('');
      el.querySelectorAll('button').forEach(function (b) {
        b.onclick = function () { PG.show(b.dataset.s); };
      });
      PG.on('show', function (id) {
        el.querySelectorAll('button').forEach(function (b) {
          if (b.dataset.s === id) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
        });
      });
    }
  };
})();
