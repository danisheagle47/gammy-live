// api/search.js
export default async function handler(request, response) {
    const query = request.query.q;
    if (!query) {
        return response.status(400).json({ message: 'Query di ricerca mancante' });
    }

    const RAWG_API_KEY = process.env.VITE_RAWG_API_KEY;
    if (!RAWG_API_KEY) {
        return response.status(500).json({ message: 'Chiave API di RAWG non configurata sul server.' });
    }

    const fetchGameDetails = async (slug) => {
        const detailUrl = `https://api.rawg.io/api/games/${slug}?key=${RAWG_API_KEY}`;
        try {
            const detailResponse = await fetch(detailUrl);
            if (!detailResponse.ok) return null;
            return await detailResponse.json();
        } catch {
            return null;
        }
    };

    const searchUrl = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(query)}&page_size=9`;

    try {
        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) {
            const errorData = await searchResponse.json();
            throw new Error(errorData.detail || `Errore dall'API RAWG: ${searchResponse.status}`);
        }
        
        const searchData = await searchResponse.json();

        // Per ogni gioco trovato, facciamo una chiamata aggiuntiva per ottenere la trama.
        const detailedResults = await Promise.all(searchData.results.map(async (game) => {
            const details = await fetchGameDetails(game.slug);
            return {
                id: game.id,
                name: game.name,
                slug: game.slug,
                cover: game.background_image,
                platforms: game.platforms?.map(p => p.platform.slug.split('-')[0]) || [],
                metacritic: game.metacritic,
                released: game.released,
                developers: details?.developers?.map(d => d.name).join(', ') || 'N/D',
                description: details?.description_raw || 'Nessuna descrizione disponibile.',
            };
        }));
        
        response.status(200).json(detailedResults);

    } catch (error) {
        response.status(500).json({ message: error.message });
    }
}