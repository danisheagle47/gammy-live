// Vercel Serverless Function - Search Games using RAWG API
export default async function handler(req, res) {
    const { q } = req.query;
    
    if (!q) {
        return res.status(400).json({ error: 'Query parameter required' });
    }
    
    try {
        const response = await fetch(
            `https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&search=${encodeURIComponent(q)}&page_size=20`,
            {
                headers: {
                    'User-Agent': 'Gammy/1.0'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('RAWG API error');
        }
        
        const data = await response.json();
        
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        res.status(200).json({
            results: data.results || []
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to search games', results: [] });
    }
}