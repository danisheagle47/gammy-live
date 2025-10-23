// Vercel Serverless Function - Get Release Calendar
async function getAccessToken() {
    const response = await fetch(
        `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
        { method: 'POST' }
    );
    
    const data = await response.json();
    return data.access_token;
}

export default async function handler(req, res) {
    const { year, month } = req.query;
    
    if (!year || !month) {
        return res.status(400).json({ error: 'Year and month required' });
    }
    
    try {
        const accessToken = await getAccessToken();
        
        const startDate = new Date(parseInt(year), parseInt(month), 1);
        const endDate = new Date(parseInt(year), parseInt(month) + 1, 0);
        
        const startTimestamp = Math.floor(startDate.getTime() / 1000);
        const endTimestamp = Math.floor(endDate.getTime() / 1000);
        
        const response = await fetch('https://api.igdb.com/v4/games', {
            method: 'POST',
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            },
            body: `
                fields name, cover.url, first_release_date;
                where first_release_date >= ${startTimestamp} & first_release_date <= ${endTimestamp};
                sort first_release_date asc;
                limit 200;
            `
        });
        
        if (!response.ok) {
            throw new Error('IGDB API error');
        }
        
        const games = await response.json();
        
        const formatted = games.map(game => ({
            id: game.id,
            name: game.name,
            image: game.cover?.url?.replace('t_thumb', 't_cover_small'),
            releaseDate: game.first_release_date 
                ? new Date(game.first_release_date * 1000).toISOString().split('T')[0]
                : null
        }));
        
        res.setHeader('Cache-Control', 's-maxage=43200, stale-while-revalidate');
        res.status(200).json(formatted);
    } catch (error) {
        console.error('Calendar error:', error);
        res.status(500).json([]);
    }
}