document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('ai-toggle-btn');
    const chatWindow = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('ai-close-btn');
    const sendBtn = document.getElementById('ai-send-btn');
    const userInput = document.getElementById('ai-user-input');
    const messagesContainer = document.getElementById('ai-messages');

    const BACKEND_URL = '/api/chat';
    const TIMEOUT_MS = 15000;

    let conversationHistory = [];
    let hasWelcomed = false;
    let isSending = false;

    userInput.maxLength = 300;

    toggleBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('ai-hidden');
        if (!chatWindow.classList.contains('ai-hidden')) {
            if (!hasWelcomed) { triggerWelcome(); hasWelcomed = true; }
            userInput.focus();
        }
    });
    closeBtn.addEventListener('click', () => chatWindow.classList.add('ai-hidden'));
    sendBtn.addEventListener('click', handleUserMessage);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleUserMessage(); }
    });

    function triggerWelcome() {
        const text = "¡Hola! Soy el asistente de PlantGuard del equipo Bytec. ¿En qué puedo ayudarte hoy con tu planta o el sistema de riego?";
        appendMessage(text, 'ai-bot', ["¿Cómo está mi planta ahora?", "¿Por qué se está regando?", "¿Cómo cambio el umbral de riego?"]);
        conversationHistory.push({ role: 'assistant', content: text });
    }

    async function handleUserMessage() {
        const text = userInput.value.trim();
        if (!text || isSending) return;

        isSending = true;
        sendBtn.disabled = true;
        userInput.value = '';

        // Historial SIN el mensaje actual (el servidor lo recibe en "message")
        const historyToSend = conversationHistory.slice(-6);

        appendMessage(text, 'ai-user');
        conversationHistory.push({ role: 'user', content: text });

        const typingId = showTypingIndicator();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    liveData: getAppLiveData(),
                    history: historyToSend,
                    message: text
                }),
                signal: controller.signal
            });

            if (!response.ok) throw new Error('Error en el servidor: ' + response.status);

            const data = await response.json();
            if (!data.respuesta) throw new Error('Respuesta vacía');

            removeTypingIndicator(typingId);
            appendMessage(data.respuesta, 'ai-bot', data.sugerencias);
            conversationHistory.push({ role: 'assistant', content: data.respuesta });
        } catch (error) {
            console.warn('API falló o tardó demasiado. Activando Plan B local:', error);
            removeTypingIndicator(typingId);
            const fallback = generateFallbackResponse(text);
            appendMessage(fallback.text, 'ai-bot', fallback.chips, 'Modo sin conexión');
            conversationHistory.push({ role: 'assistant', content: fallback.text });
        } finally {
            clearTimeout(timeoutId);
            isSending = false;
            sendBtn.disabled = false;
            userInput.focus();
        }
    }

    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.className = 'ai-msg ai-bot ai-typing';
        msgDiv.id = id;
        msgDiv.innerHTML = '<span></span><span></span><span></span>';
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function appendMessage(text, className, chips = [], note = '') {
        // Solo se muestran las sugerencias más recientes
        messagesContainer.querySelectorAll('.ai-chips-container').forEach(el => el.remove());

        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-msg ${className}`;
        msgDiv.textContent = text;

        if (note) {
            const noteEl = document.createElement('small');
            noteEl.className = 'ai-note';
            noteEl.textContent = note;
            msgDiv.appendChild(noteEl);
        }
        messagesContainer.appendChild(msgDiv);

        if (Array.isArray(chips) && chips.length > 0) {
            const chipsDiv = document.createElement('div');
            chipsDiv.className = 'ai-chips-container';
            chips.forEach(chipText => {
                const chip = document.createElement('button');
                chip.className = 'ai-chip';
                chip.textContent = chipText;
                chip.addEventListener('click', () => {
                    if (isSending) return;
                    userInput.value = chipText;
                    handleUserMessage();
                });
                chipsDiv.appendChild(chip);
            });
            messagesContainer.appendChild(chipsDiv);
        }
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // ---------- Datos de la app ----------
    function getAppLiveData() {
        const humedad = 28, umbral = 35;
        return {
            nombrePlanta: "La Dormilona (Mimosa pudica)",
            ubicacion: "Interior, Sala junto a la ventana",
            humedadSuelo: humedad + "%",
            umbralMinimo: umbral + "%",
            estadoHumedad: humedad < umbral ? "Por debajo del umbral" : "Dentro del rango",
            temperatura: "23°C",
            humedadAmb: "61%",
            presion: "1013 hPa",
            luz: "540 lx",
            estadoBomba: "Activa · riega 8 s más",
            duracionRiegoConfigurada: "10 s",
            esperaMinimaEntreRiegos: "30 min",
            ultimoRiego: "Hoy, 14:12",
            proximoEstimado: "En 2 días"
        };
    }

    // ---------- Plan B local (sin conexión) ----------
    const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

    const CHIPS_MAIN = ["¿Cómo está mi planta ahora?", "¿Por qué se está regando?", "Ver umbrales de riego"];

    const INTENTS = [
        {
            test: /^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|que tal)\b/,
            reply: () => ({ text: "¡Hola! Pregúntame por la humedad, la bomba, los umbrales o el cuidado de tu planta.", chips: CHIPS_MAIN })
        },
        {
            test: /\b(gracias|adios|hasta luego|bye)\b/,
            reply: () => ({ text: "¡De nada! Aquí estaré para cuidar tu planta contigo.", chips: ["¿Cómo está mi planta ahora?"] })
        },
        {
            test: /^\?+$|\bayuda\b|que puedes|que sabes|que haces/,
            reply: () => ({ text: "Puedo decirte la humedad del suelo, el estado de la bomba, el último riego, cómo ajustar umbrales y darte consejos de cuidado de plantas.", chips: CHIPS_MAIN })
        },
        {
            test: /umbral|minimo|configur|ajustar|cambi\w+ .*(riego|humedad|duracion)/,
            reply: (d) => ({ text: `El umbral mínimo actual es ${d.umbralMinimo} y el riego dura ${d.duracionRiegoConfigurada}, con espera mínima de ${d.esperaMinimaEntreRiegos}. Puedes cambiarlo en la pestaña "Umbrales".`, chips: ["¿Por qué se está regando?", "Ver historial"] })
        },
        {
            test: /ultimo riego|ultima vez|proximo|cuando (se )?(rego|riega|va a regar|regar)/,
            reply: (d) => ({ text: `El último riego fue: ${d.ultimoRiego}. El próximo estimado es: ${d.proximoEstimado.toLowerCase()}.`, chips: ["¿Por qué se está regando?", "Ver historial"] })
        },
        {
            test: /amarill/,
            reply: () => ({ text: "Las hojas amarillas suelen deberse a exceso de agua o poca luz. Revisa que el drenaje funcione y que reciba luz brillante indirecta.", chips: ["¿Cómo está mi planta ahora?", "Ver umbrales de riego"] })
        },
        {
            test: /marchit|caid|seca|secas|mustia/,
            reply: (d) => ({ text: `Hojas caídas o secas pueden indicar falta de agua o exceso de calor. Ahora el suelo está en ${d.humedadSuelo} (umbral ${d.umbralMinimo}).`, chips: ["¿Por qué se está regando?", "Ver historial"] })
        },
        {
            test: /plaga|bicho|hongo|mosca|pulgon|insecto/,
            reply: () => ({ text: "Si ves plagas, aísla la planta, limpia las hojas con agua y jabón suave y evita el exceso de humedad. Si persiste, consulta un vivero.", chips: ["¿Cómo está mi planta ahora?"] })
        },
        {
            test: /mimosa|dormilona|cierra|cierran|tocar|tocas/,
            reply: () => ({ text: "La Mimosa pudica cierra sus hojas al tocarla o con cambios bruscos. Le gusta luz brillante indirecta y suelo húmedo pero sin encharcar.", chips: ["¿Cómo está mi planta ahora?", "Ver umbrales de riego"] })
        },
        {
            test: /cada cuanto|frecuencia|maceta|drenaje|abono|fertiliz|cuidado|cuidar|trasplant/,
            reply: () => ({ text: "Lo ideal es regar cuando el suelo baje del umbral, con buen drenaje y sin encharcar. PlantGuard lo hace automático según el sensor de humedad.", chips: ["Ver umbrales de riego", "¿Cómo está mi planta ahora?"] })
        },
        {
            test: /por ?que.*(rieg|reg(ando|ar|ada))|bomba|regando|riega|riego|agua/,
            reply: (d) => ({ text: `La humedad del suelo está en ${d.humedadSuelo}, ${d.estadoHumedad.toLowerCase()} (${d.umbralMinimo}), por eso la bomba está así: ${d.estadoBomba}.`, chips: ["Ver umbrales de riego", "Ver historial"] })
        },
        {
            test: /historial|grafica|registro|lecturas/,
            reply: () => ({ text: "En la pestaña \"Historial\" puedes ver las gráficas y registros de las lecturas de tu planta.", chips: ["¿Cómo está mi planta ahora?"] })
        },
        {
            test: /humedad (del )?(ambiente|aire|amb)|ambiente/,
            reply: (d) => ({ text: `La humedad ambiental es de ${d.humedadAmb}.`, chips: CHIPS_MAIN })
        },
        {
            test: /temperatura|calor|frio|grados/,
            reply: (d) => ({ text: `La temperatura actual es de ${d.temperatura}.`, chips: CHIPS_MAIN })
        },
        {
            test: /presion|hpa|barometr/,
            reply: (d) => ({ text: `La presión atmosférica es de ${d.presion}.`, chips: CHIPS_MAIN })
        },
        {
            test: /\bluz\b|lux|iluminacion|ventana|\bsol\b/,
            reply: (d) => ({ text: `La luz ambiental es de ${d.luz}. La planta está en: ${d.ubicacion.toLowerCase()}.`, chips: CHIPS_MAIN })
        },
        {
            test: /humedad|suelo|como esta|estado|checo|mi planta|sensor|ahora/,
            reply: (d) => ({ text: `Tu ${d.nombrePlanta} tiene el suelo al ${d.humedadSuelo} (${d.estadoHumedad.toLowerCase()}, umbral ${d.umbralMinimo}). Temperatura ${d.temperatura} y bomba: ${d.estadoBomba}.`, chips: ["¿Por qué se está regando?", "Ver historial"] })
        },
        {
            test: /plantguard|bytec|aplicacion|\bapp\b|esp32|arduino|\biot\b|equipo|proyecto/,
            reply: () => ({ text: "PlantGuard es un sistema de riego automático inteligente para plantas domésticas, desarrollado por el equipo Bytec. Usa sensores para medir humedad, temperatura, presión y luz.", chips: CHIPS_MAIN })
        }
    ];

    function generateFallbackResponse(query) {
        const q = norm(query);
        const data = getAppLiveData();
        const match = INTENTS.find(i => i.test.test(q));
        if (match) return match.reply(data);

        // Pregunta no relacionada: se rechaza con amabilidad
        return {
            text: "Lo siento, solo puedo ayudarte con PlantGuard y el cuidado de tus plantas. Prueba preguntándome por la humedad, la bomba o los umbrales.",
            chips: CHIPS_MAIN
        };
    }
});