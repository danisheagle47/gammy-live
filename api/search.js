// api/search.js (NUOVA VERSIONE CON API RAWG.IO)

export default async function handler(request, response) {
    const query = request.query.q;
    if (!query) {
        return response.status(400).json({ message: 'Query di ricerca mancante' });
    }

    // Costruiamo l'URL per l'API di RAWG.io
    // Non richiede chiavi per la ricerca di base!
    const rawgUrl = `https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&page_size=12`;

    try {
        const rawgResponse = await fetch(rawgUrl);

        if (!rawgResponse.ok) {
            throw new Error(`Errore dall'API RAWG: ${rawgResponse.status}`);
        }

        const data = await rawgResponse.json();

        // Trasformiamo i dati di RAWG in un formato simile a quello che usavamo prima
        // per non dover cambiare troppo il frontend.
        const formattedData = data.results.map(game => ({
            id: game.id,
            name: game.name,
            cover: {
                // L'URL della copertina in RAWG si chiama 'background_image'
                url: game.background_image 
                    ? game.background_image.replace('media/', 'media/crop/600/400/') 
                    : null
            }
        }));

        response.status(200).json(formattedData);

    } catch (error) {
        response.status(500).json({ message: error.message });
    }
}