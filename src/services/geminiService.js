import { PROMPT_MBDLE } from '../config/prompt';

export const solicitarAnalisisGemini = async (base64File, mimeType, apiKey, schoolName, useFallback = false) => {
  const modelName = useFallback ? 'gemini-3.1-flash-lite-preview' : 'gemini-3-flash-preview';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  // Customizing the prompt with the school name if provided
  const contextualPrompt = schoolName
    ? `Esta acta pertenece al establecimiento: ${schoolName}.\n\n${PROMPT_MBDLE}`
    : PROMPT_MBDLE;

  const payload = {
    contents: [
      {
        parts: [
          { text: contextualPrompt },
          { inlineData: { mimeType: mimeType, data: base64File.split(',')[1] || base64File } }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json"
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      if (response.status === 503 && !useFallback) {
        console.warn("Modelo en alta demanda. Reintentando con gemini-2.5-flash...");
        return solicitarAnalisisGemini(base64File, mimeType, apiKey, schoolName, true);
      }
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    let textoCrudo = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textoCrudo) {
      throw new Error("Respuesta estructurada no encontrada en la API.");
    }

    // Limpieza robusta del JSON en caso de markdown
    textoCrudo = textoCrudo.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(textoCrudo);

  } catch (error) {
    console.error("Error en Gemini Service:", error);
    throw error;
  }
};
