export default async function handler(req, res){
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error:'Missing q' });
    const key = process.env.RAWG_API_KEY;
    if (!key) return res.status(500).json({ error:'Missing RAWG_API_KEY' });
    const url = `https://api.rawg.io/api/games?key=${key}&search=${encodeURIComponent(q)}&page_size=24`;
    const r = await fetch(url, { headers: { 'Accept':'application/json' }});
    const data = await r.json();
    res.setHeader('Access-Control-Allow-Origin','*');
    res.status(200).json({
      results: (data.results || []).map(g => ({
        id: g.id, name: g.name, released: g.released, background_image: g.background_image, metacritic: g.metacritic,
        platforms: g.platforms
      }))
    });
  } catch (e){
    res.status(500).json({ error: e.message });
  }
}