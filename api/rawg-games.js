async function getToken(){
  const id = process.env.TWITCH_CLIENT_ID;
  const secret = process.env.TWITCH_CLIENT_SECRET;
  if (!id || !secret) return null;
  const r = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${id}&client_secret=${secret}&grant_type=client_credentials`, { method:'POST' });
  const j = await r.json(); return j.access_token;
}
function igdbCover(id){ return id ? `https://images.igdb.com/igdb/image/upload/t_1080p/${id}.jpg` : null; }

async function rawgDetailById(id){
  const key = process.env.RAWG_API_KEY; if (!key) return null;
  const r = await fetch(`https://api.rawg.io/api/games/${id}?key=${key}`);
  if (!r.ok) return null; const g = await r.json();
  return {
    id: g.id, provider:'rawg', name: g.name, released: g.released || null,
    background_image: g.background_image || null, metacritic: g.metacritic ?? null,
    description: g.description || g.description_raw || '',
    description_raw: g.description_raw || '',
    developers: g.developers || [], platforms: g.platforms || [], parent_platforms: g.parent_platforms || []
  };
}

async function igdbDetailById(id){
  const token = await getToken(); if (!token) return null;
  const q = `
    where id = ${Number(id)};
    fields id,name,first_release_date,summary,cover.image_id,platforms.name,involved_companies.company.name;
    limit 1;
  `;
  const r = await fetch('https://api.igdb.com/v4/games', {
    method:'POST',
    headers:{
      'Client-ID': process.env.TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${token}`,
      'Accept':'application/json'
    },
    body: q
  });
  if (!r.ok) return null;
  const [g] = await r.json();
  if (!g) return null;
  return {
    id: g.id, provider:'igdb', name: g.name,
    released: g.first_release_date ? new Date(g.first_release_date*1000).toISOString().slice(0,10) : null,
    background_image: igdbCover(g.cover?.image_id), metacritic: null,
    description: g.summary || '', description_raw: g.summary || '',
    developers: (g.involved_companies||[]).map(x => ({ name: x.company?.name })).filter(Boolean),
    platforms: (g.platforms||[]).map(name => ({ platform:{ name: name.name }}))
  };
}

async function rawgFindFirstByName(name){
  const key = process.env.RAWG_API_KEY; if (!key) return null;
  const r = await fetch(`https://api.rawg.io/api/games?key=${key}&search=${encodeURIComponent(name)}&page_size=1`);
  if (!r.ok) return null;
  const j = await r.json(); return j.results?.[0]?.id || null;
}
async function igdbFindFirstByName(name){
  const token = await getToken(); if (!token) return null;
  const q = `
    search "${name.replace(/"/g,'\\"')}";
    fields id;
    limit 1;
  `;
  const r = await fetch('https://api.igdb.com/v4/games', {
    method:'POST',
    headers:{
      'Client-ID': process.env.TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${token}`,
      'Accept':'application/json'
    },
    body: q
  });
  if (!r.ok) return null;
  const rows = await r.json(); return rows?.[0]?.id || null;
}

module.exports = async function(req, res){
  try{
    const { id, provider, name } = req.query;

    // 1) Se ho id e RAWG disponibile e provider non forza IGDB -> RAWG
    if (id && provider !== 'igdb'){
      const rawg = await rawgDetailById(id);
      if (rawg) { res.setHeader('Access-Control-Allow-Origin','*'); return res.status(200).json(rawg); }
    }
    // 2) Se ho id -> IGDB
    if (id){
      const igdb = await igdbDetailById(id);
      if (igdb) { res.setHeader('Access-Control-Allow-Origin','*'); return res.status(200).json(igdb); }
    }
    // 3) Se non ho id ma ho name -> cerca RAWG, fallback IGDB
    if (name){
      const foundRawg = await rawgFindFirstByName(name);
      if (foundRawg){
        const rawg = await rawgDetailById(foundRawg);
        if (rawg){ res.setHeader('Access-Control-Allow-Origin','*'); return res.status(200).json(rawg); }
      }
      const foundIgdb = await igdbFindFirstByName(name);
      if (foundIgdb){
        const igdb = await igdbDetailById(foundIgdb);
        if (igdb){ res.setHeader('Access-Control-Allow-Origin','*'); return res.status(200).json(igdb); }
      }
    }
    res.status(404).json({ error:'Game not found' });
  }catch(e){
    res.status(500).json({ error: e.message });
  }
};