// api/translate.js
export default async function handler(request, response) {
    const text = request.query.text;
    const targetLang = request.query.lang || 'it'; // Default a italiano

    if (!text) {
        return response.status(400).json({ error: 'Testo mancante' });
    }

    const langPair = `en|${targetLang}`;
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

    try {
        const translationResponse = await fetch(apiUrl);
        if (!translationResponse.ok) {
            throw new Error('Servizio di traduzione non disponibile');
        }
        const data = await translationResponse.json();
        if (data.responseStatus !== 200) {
            throw new Error(data.responseDetails);
        }
        // Restituisce il testo tradotto
        response.status(200).json({ translatedText: data.responseData.translatedText });

    } catch (error) {
        // Se la traduzione fallisce, restituisce il testo originale in inglese per sicurezza
        response.status(200).json({ translatedText: text });
    }
}