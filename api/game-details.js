export default async function handler(req, res) {
    const { id } = req.query;
    
    if (!id) {
        return res.status(400).json({ error: 'ID parameter required' });
    }
    
    try {
        const response = await fetch(
            `https://api.rawg.io/api/games/${id}?key=${process.env.RAWG_API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error('RAWG API request failed');
        }
        
        const game = await response.json();
        
        res.status(200).json(game);
    } catch (error) {
        console.error('Game details error:', error);
        res.status(500).json({ error: 'Failed to fetch game details' });
    }
}