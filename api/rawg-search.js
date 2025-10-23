async function getToken(){
  const id = process.env.TWITCH_CLIENT_ID;
  const secret = process.env.TWITCH_CLIENT_SECRET;
  if (!id || !secret) return null;
  const r = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${id}&client_secret=${secret}&grant_type=client_credentials`, { method:'POST' });
  const j = await r.json(); return j.access_token;
}
function igdbCover(id){ return id ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${id}.jpg` : null; }

module.exports = async function (req, res){
  try{
    const { q } = req.query;
    if (!q) return res.status(400).json({ error:'Missing q' });

    const rawgKey = process.env.RAWG_API_KEY;
    if (rawgKey){
      const url = `https://api.rawg.io/api/games?key=${rawgKey}&search=${encodeURIComponent(q)}&page_size=24`;
      const r = await fetch(url, { headers:{Accept:'application/json'}});
      const data = await r.json();
      const results = (data.results||[]).map(g => ({
        id: g.id, provider:'rawg', name: g.name, released: g.released, background_image: g.background_image, metacritic: g.metacritic,
        platforms: (g.platforms||[]).map(p=>p.platform?.name).filter(Boolean)
      }));
      res.setHeader('Access-Control-Allow-Origin','*');
      return res.status(200).json({ results });
    }

    // Fallback IGDB
    const token = await getToken();
    if (!token) return res.status(500).json({ error:'Missing RAWG_API_KEY and IGDB credentials' });
    const body = `
      search "${q.replace(/"/g,'\\"')}";
      fields id,name,first_release_date,cover.image_id,platforms.name;
      limit 24;
    `;
    const r = await fetch('https://api.igdb.com/v4/games', {
      method:'POST',
      headers:{
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`,
        'Accept':'application/json'
      },
      body
    });
    const games = await r.json();
    const results = games.map(g => ({
      id: g.id, provider:'igdb', name: g.name,
      released: g.first_release_date ? new Date(g.first_release_date*1000).toISOString().slice(0,10) : null,
      background_image: igdbCover(g.cover?.image_id), metacritic: null,
      platforms: (g.platforms||[]).map(p=>p.name).filter(Boolean)
    }));
    res.setHeader('Access-Control-Allow-Origin','*');
    res.status(200).json({ results });
  }catch(e){
    res.status(500).json({ error: e.message });
  }
};