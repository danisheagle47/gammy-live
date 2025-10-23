export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { text, targetLang } = req.body;
    
    if (!text || !targetLang) {
        return res.status(400).json({ error: 'Text and targetLang required' });
    }
    
    // Se il testo è troppo lungo, tronca per evitare problemi con l'API
    const maxLength = 500;
    const textToTranslate = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    
    try {
        const langPair = targetLang === 'it' ? 'en|it' : 'it|en';
        
        const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=${langPair}`
        );
        
        if (!response.ok) {
            throw new Error('Translation API request failed');
        }
        
        const data = await response.json();
        
        if (data.responseStatus === 200) {
            res.status(200).json({
                translatedText: data.responseData.translatedText
            });
        } else {
            // Se la traduzione fallisce, restituisci il testo originale
            res.status(200).json({
                translatedText: text
            });
        }
    } catch (error) {
        console.error('Translation error:', error);
        // In caso di errore, restituisci il testo originale
        res.status(200).json({
            translatedText: text
        });
    }
}