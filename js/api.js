// Client-side fetchers (ibridi RAWG/IGDB via serverless)
export async function searchGames(query){
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function getGameDetails(ref){
  const params = new URLSearchParams();
  if (typeof ref === 'object' && ref !== null){
    if (ref.id) params.set('id', ref.id);
    if (ref.provider) params.set('provider', ref.provider);
    if (ref.name) params.set('name', ref.name);
  } else {
    params.set('id', ref);
  }
  const res = await fetch(`/api/game?${params.toString()}`);
  if (!res.ok) throw new Error('Detail failed');
  return res.json();
}

export async function getUpcoming(){
  const res = await fetch(`/api/igdb-upcoming`);
  if (!res.ok) throw new Error('Upcoming failed');
  return res.json();
}
export async function getCalendar(ym){
  const res = await fetch(`/api/igdb-calendar?month=${encodeURIComponent(ym)}`);
  if (!res.ok) throw new Error('Calendar failed');
  return res.json();
}
export async function getNews(){
  const res = await fetch(`/api/igdb-news`);
  if (!res.ok) throw new Error('News failed');
  return res.json();
}