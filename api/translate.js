// Vercel Serverless Function - Translate Text using MyMemory API
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { text, targetLang } = req.body;
    
    if (!text || !targetLang) {
        return res.status(400).json({ error: 'Text and target language required' });
    }
    
    // Limit text length to avoid API limits
    const truncatedText = text.substring(0, 500);
    
    try {
        const sourceLang = targetLang === 'it' ? 'en' : 'it';
        
        const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(truncatedText)}&langpair=${sourceLang}|${targetLang}`,
            {
                headers: {
                    'User-Agent': 'Gammy/1.0'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Translation API error');
        }
        
        const data = await response.json();
        
        res.setHeader('Cache-Control', 's-maxage=604800, stale-while-revalidate');
        res.status(200).json({
            translatedText: data.responseData?.translatedText || text
        });
    } catch (error) {
        console.error('Translation error:', error);
        res.status(200).json({ translatedText: text });
    }
}