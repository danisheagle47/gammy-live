// Vercel Serverless Function - Get Game Details
export default async function handler(req, res) {
    const { id } = req.query;
    
    if (!id) {
        return res.status(400).json({ error: 'Game ID required' });
    }
    
    try {
        const response = await fetch(
            `https://api.rawg.io/api/games/${id}?key=${process.env.RAWG_API_KEY}`,
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
        
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
        res.status(200).json(data);
    } catch (error) {
        console.error('Game details error:', error);
        res.status(500).json({ error: 'Failed to fetch game details' });
    }
}