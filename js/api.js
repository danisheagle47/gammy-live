// Client-side fetchers for our serverless APIs
export async function searchGames(query){
  const res = await fetch(`/api/rawg-search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}
export async function getGameDetails(id){
  const res = await fetch(`/api/rawg-game?id=${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Detail failed');
  return res.json();
}

export async function getUpcoming(){
  const res = await fetch(`/api/igdb-upcoming`);
  if (!res.ok) throw new Error('Upcoming failed');
  return res.json();
}

export async function getCalendar(ym){ // ym = 'YYYY-MM'
  const res = await fetch(`/api/igdb-calendar?month=${encodeURIComponent(ym)}`);
  if (!res.ok) throw new Error('Calendar failed');
  return res.json();
}

export async function getNews(){
  const res = await fetch(`/api/igdb-news`);
  if (!res.ok) throw new Error('News failed');
  return res.json();
}