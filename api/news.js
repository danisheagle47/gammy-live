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
    try {
        const token = await getIGDBToken();
        
        if (!token) {
            throw new Error('Failed to authenticate with IGDB');
        }
        
        const response = await fetch('https://api.igdb.com/v4/articles', {
            method: 'POST',
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: `fields title, summary, url, published_at, image.url; 
                   sort published_at desc; 
                   limit 15;`
        });
        
        if (!response.ok) {
            throw new Error('IGDB API request failed');
        }
        
        const articles = await response.json();
        
        const formattedArticles = articles.map(article => ({
            title: article.title,
            summary: article.summary || '',
            url: article.url,
            publishedAt: article.published_at ? new Date(article.published_at * 1000).toISOString() : new Date().toISOString(),
            image: article.image?.url ? `https:${article.image.url}` : null
        }));
        
        res.status(200).json(formattedArticles);
    } catch (error) {
        console.error('News error:', error);
        res.status(500).json([]);
    }
}