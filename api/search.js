export default async function handler(request, response) {
    const query = request.query.q;
    if (!query) {
        return response.status(400).json({ message: 'Query di ricerca mancante' });
    }
    const RAWG_API_KEY = process.env.VITE_RAWG_API_KEY;
    if (!RAWG_API_KEY) {
        return response.status(500).json({ message: 'Chiave API di RAWG non configurata sul server.' });
    }
    const rawgUrl = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(query)}&page_size=12`;
    try {
        const rawgResponse = await fetch(rawgUrl);
        if (!rawgResponse.ok) {
            const errorData = await rawgResponse.json();
            throw new Error(errorData.detail || `Errore dall'API RAWG: ${rawgResponse.status}`);
        }
        const data = await rawgResponse.json();
        // Standardizzazione dell'oggetto 'game'
        const formattedData = data.results.map(game => ({
            id: game.id,
            name: game.name,
            cover: { url: game.background_image }
        }));
        response.status(200).json(formattedData);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
}