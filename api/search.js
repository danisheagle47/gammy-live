// api/search.js (VERSIONE FINALE GARANTITA CON API JIKAN)

export default async function handler(request, response) {
    const query = request.query.q;
    if (!query) {
        return response.status(400).json({ message: 'Query di ricerca mancante' });
    }

    // Costruiamo l'URL per l'API di Jikan (MyAnimeList) per la ricerca di giochi.
    // QUESTA API È GARANTITA SENZA CHIAVI PER LA RICERCA.
    const jikanUrl = `https://api.jikan.moe/v4/games?q=${encodeURIComponent(query)}&limit=12`;

    try {
        const jikanResponse = await fetch(jikanUrl);

        if (!jikanResponse.ok) {
            throw new Error(`Errore dall'API Jikan: ${jikanResponse.status}`);
        }

        const data = await jikanResponse.json();

        // Trasformiamo i dati di Jikan in un formato che il nostro frontend capisce.
        const formattedData = data.data.map(game => ({
            id: game.mal_id, // Usiamo l'ID di MyAnimeList
            name: game.title,
            cover: {
                // L'URL della copertina in Jikan è dentro images.jpg.image_url
                url: game.images?.jpg?.image_url || null
            }
        }));

        response.status(200).json(formattedData);

    } catch (error) {
        response.status(500).json({ message: error.message });
    }
}