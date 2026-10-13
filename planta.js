/* Pantalla Mi planta: ficha de la planta y su estado de riego */
(function () {
  var html = [
    '<div class="back"><b>‹</b>Mi planta</div>',
    '<div class="plant">',
    '<svg width="120" height="110" viewBox="0 0 120 110" fill="none" stroke="#5E7F57" stroke-width="2.5" stroke-linecap="round"><path d="M60 100V30M60 30Q40 28 30 22M60 30Q80 26 90 20M60 55Q42 52 28 56M60 70Q80 66 94 72"/><circle cx="28" cy="22" r="6" fill="#E58FB0" stroke="none"/><circle cx="91" cy="19" r="6" fill="#E58FB0" stroke="none"/><circle cx="76" cy="46" r="5" fill="#E58FB0" stroke="none"/></svg>',
    '<h2>La Dormilona</h2><em>Mimosa pudica</em>',
    '<div class="chips"><span class="chip">Interior</span><span class="chip">Sala · junto a la ventana</span></div>',
    '</div>',
    '<p class="muted" style="font-size:14px">Conocida como "dormilona" porque sus hojas se pliegan al tacto o al anochecer — una señal visual útil para confirmar que está sana e hidratada.</p>',
    '<div class="facts">',
    '<div class="tile"><small>💧 Riego</small><b>Cada 2-3 días</b></div>',
    '<div class="tile"><small>☀ Luz</small><b>Indirecta</b></div>',
    '<div class="tile"><small>🌡 Temp. ideal</small><b>18-25°C</b></div>',
    '</div>',
    '<h2 style="font-size:19px;margin-top:16px">Estado actual</h2>',
    '<div class="state"><div><small>Último riego</small><b>Hoy, 14:12</b></div><div><small>Próximo estimado</small><b>En 2 días</b></div></div>',
    '<button class="ghost">Editar información de la planta</button>'
  ].join('');

  PG.register('planta', { html: html });
})();
