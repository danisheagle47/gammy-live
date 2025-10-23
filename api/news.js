// Vercel Serverless Function - Get Gaming News
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
        
        // Get recent pulse (news) articles from IGDB
        const response = await fetch('https://api.igdb.com/v4/pulses', {
            method: 'POST',
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            },
            body: `
                fields title, summary, url, image, published_at, website.name;
                sort published_at desc;
                limit 20;
            `
        });
        
        if (!response.ok) {
            throw new Error('IGDB API error');
        }
        
        const pulses = await response.json();
        
        const formatted = pulses.map(pulse => ({
            title: pulse.title,
            summary: pulse.summary,
            url: pulse.url,
            image: pulse.image?.replace('t_thumb', 't_screenshot_med'),
            date: pulse.published_at ? new Date(pulse.published_at * 1000).toISOString() : new Date().toISOString(),
            source: pulse.website?.name || 'Gaming News'
        }));
        
        res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');
        res.status(200).json(formatted);
    } catch (error) {
        console.error('News error:', error);
        res.status(500).json([]);
    }
}