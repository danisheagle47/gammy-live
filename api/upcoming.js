// Vercel Serverless Function - Get Upcoming Games using IGDB
async function getAccessToken() {
    const response = await fetch(
        `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
        { method: 'POST' }
    );
    
    const data = await response.json();
    return data.access_token;
}

export default async function handler(req, res) {
    try {
        const accessToken = await getAccessToken();
        
        const today = Math.floor(Date.now() / 1000);
        const threeMonths = today + (90 * 24 * 60 * 60);
        
        const response = await fetch('https://api.igdb.com/v4/games', {
            method: 'POST',
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            },
            body: `
                fields name, cover.url, first_release_date, hypes, platforms.name;
                where first_release_date >= ${today} & first_release_date < ${threeMonths} & hypes != null;
                sort hypes desc;
                limit 20;
            `
        });
        
        if (!response.ok) {
            throw new Error('IGDB API error');
        }
        
        const games = await response.json();
        
        // Transform to consistent format
        const formatted = games.map(game => ({
            id: game.id,
            name: game.name,
            image: game.cover?.url?.replace('t_thumb', 't_cover_big'),
            background_image: game.cover?.url?.replace('t_thumb', 't_screenshot_big'),
            releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString() : null,
            platforms: game.platforms
        }));
        
        res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate');
        res.status(200).json(formatted);
    } catch (error) {
        console.error('Upcoming games error:', error);
        res.status(500).json([]);
    }
}