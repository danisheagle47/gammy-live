module.exports = async function (req, res) {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const key = process.env.RAWG_API_KEY;
    if (!key) return res.status(500).json({ error: 'Missing RAWG_API_KEY' });
    const url = `https://api.rawg.io/api/games/${id}?key=${key}`;
    const r = await fetch(url);
    const g = await r.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({
      id: g.id,
      name: g.name,
      released: g.released,
      background_image: g.background_image,
      metacritic: g.metacritic,
      description: g.description,
      description_raw: g.description_raw,
      developers: g.developers,
      platforms: g.platforms,
      parent_platforms: g.parent_platforms
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};