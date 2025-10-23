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
        
        // Prova prima con gli articoli IGDB
        const articlesResponse = await fetch('https://api.igdb.com/v4/articles', {
            method: 'POST',
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: `fields title, summary, url, published_at, image.url, category; 
                   sort published_at desc; 
                   limit 20;`
        });
        
        let articles = [];
        
        if (articlesResponse.ok) {
            articles = await articlesResponse.json();
        }
        
        // Se IGDB non restituisce articoli, usa i pulse (feed social)
        if (articles.length === 0) {
            const pulseResponse = await fetch('https://api.igdb.com/v4/pulses', {
                method: 'POST',
                headers: {
                    'Client-ID': process.env.TWITCH_CLIENT_ID,
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: `fields title, summary, url, published_at, image, category; 
                       sort published_at desc; 
                       limit 20;`
            });
            
            if (pulseResponse.ok) {
                articles = await pulseResponse.json();
            }
        }
        
        // Se ancora nessun risultato, crea notizie di esempio basate su giochi popolari
        if (articles.length === 0) {
            const gamesResponse = await fetch('https://api.igdb.com/v4/games', {
                method: 'POST',
                headers: {
                    'Client-ID': process.env.TWITCH_CLIENT_ID,
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: `fields name, cover.url, summary, first_release_date, hypes; 
                       where hypes > 10; 
                       sort hypes desc; 
                       limit 15;`
            });
            
            if (gamesResponse.ok) {
                const games = await gamesResponse.json();
                articles = games.map(game => ({
                    title: `${game.name} - Uno dei Giochi Più Attesi`,
                    summary: game.summary || `${game.name} sta generando grande attesa nella community gaming.`,
                    url: `https://www.igdb.com/games/${game.name.toLowerCase().replace(/\s+/g, '-')}`,
                    published_at: game.first_release_date || Math.floor(Date.now() / 1000),
                    image: game.cover ? { url: game.cover.url } : null,
                    category: 1
                }));
            }
        }
        
        const formattedArticles = articles.map(article => ({
            title: article.title,
            summary: article.summary || '',
            url: article.url || '#',
            publishedAt: article.published_at ? new Date(article.published_at * 1000).toISOString() : new Date().toISOString(),
            image: article.image?.url ? `https:${article.image.url}` : (article.image ? `https:${article.image}` : null),
            category: article.category || 'gaming'
        }));
        
        res.status(200).json(formattedArticles);
    } catch (error) {
        console.error('News error:', error);
        
        // Fallback: notizie di esempio
        const fallbackNews = [
            {
                title: "Le Novità del Mondo Gaming",
                summary: "Rimani aggiornato sulle ultime uscite e annunci dal mondo dei videogiochi.",
                url: "#",
                publishedAt: new Date().toISOString(),
                image: null,
                category: "gaming"
            },
            {
                title: "I Giochi Più Attesi dell'Anno",
                summary: "Scopri quali sono i titoli che stanno generando più hype nella community.",
                url: "#",
                publishedAt: new Date().toISOString(),
                image: null,
                category: "gaming"
            }
        ];
        
        res.status(200).json(fallbackNews);
    }
}