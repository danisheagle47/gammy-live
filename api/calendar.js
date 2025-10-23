async function getIGDBToken() {
    try {
        const response = await fetch(
            `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
            { method: 'POST' }
        );
        
        if (!response.ok) {
            throw new Error('Failed to get IGDB token');
        }
        
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Token error:', error);
        return null;
    }
}

export default async function handler(req, res) {
    const { year, month } = req.query;
    
    if (!year || !month) {
        return res.status(400).json({ error: 'Year and month parameters required' });
    }
    
    try {
        const token = await getIGDBToken();
        
        if (!token) {
            throw new Error('Failed to authenticate with IGDB');
        }
        
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0);
        
        const startTimestamp = Math.floor(startDate.getTime() / 1000);
        const endTimestamp = Math.floor(endDate.getTime() / 1000);
        
        const response = await fetch('https://api.igdb.com/v4/games', {
            method: 'POST',
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: `fields name, first_release_date, cover.url, hypes, rating, platforms.name; 
                   where first_release_date >= ${startTimestamp} & first_release_date <= ${endTimestamp}; 
                   sort first_release_date asc; 
                   limit 200;`
        });
        
        if (!response.ok) {
            throw new Error('IGDB API request failed');
        }
        
        const games = await response.json();
        
        const formattedGames = games.map(game => ({
            id: game.id,
            name: game.name,
            releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString().split('T')[0] : null,
            released: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString().split('T')[0] : null,
            cover: game.cover?.url ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : null,
            background_image: game.cover?.url ? `https:${game.cover.url.replace('t_thumb', 't_screenshot_big')}` : null,
            hypes: game.hypes || 0,
            metacritic: game.rating ? Math.round(game.rating) : null,
            platformsList: game.platforms || []
        }));
        
        res.status(200).json(formattedGames);
    } catch (error) {
        console.error('Calendar error:', error);
        res.status(500).json([]);
    }
}