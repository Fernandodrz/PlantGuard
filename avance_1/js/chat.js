// api/chat.js
export default async function handler(req, res) {
    // Permitir CORS para desarrollo local o producción
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { systemPrompt, liveData, history, message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Falta configurar la GEMINI_API_KEY en el servidor.' });
    }

    try {
        // Construcción del payload para Gemini 1.5 Flash
        const contents = [];

        // Inyectar System Prompt y datos en vivo como contexto inicial
        contents.push({
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n[DATOS ACTUALES DE LA PANTALLA]:\n${JSON.stringify(liveData, null, 2)}` }]
        });
        contents.push({
            role: "model",
            parts: [{ text: "Entendido. Operaré estrictamente bajo estas reglas y datos en tiempo real." }]
        });

        // Añadir el historial de la conversación
        if (history && Array.isArray(history)) {
            history.forEach(item => {
                contents.push({
                    role: item.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: item.content }]
                });
            });
        }

        // Añadir el mensaje actual pidiendo respuesta estricta en JSON
        const finalPrompt = `${message}\n\n[IMPORTANTE]: Responde OBLIGATORIAMENTE en formato JSON válido con esta estructura exacta, sin texto adicional fuera del JSON:\n{\n  "respuesta": "Tu respuesta breve, amable y en español aquí...",\n  "sugerencias": ["Sugerencia 1", "Sugerencia 2"]\n}`;
        
        contents.push({
            role: "user",
            parts: [{ text: finalPrompt }]
        });

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: contents,
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 400
                }
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'Error al comunicarse con la API de Gemini');
        }

        const rawText = data.candidates[0].content.parts[0].text;
        
        // Limpiar bloques de código Markdown si el modelo los añade
        let cleanJSON = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJSON);

        return res.status(200).json(parsed);

    } catch (error) {
        console.error('Error en serverless function:', error);
        return res.status(500).json({ error: error.message });
    }
}