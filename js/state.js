export const STORAGE_KEYS = {
  lang: 'gammy:language',
  library: 'gammy:library',
  wishlist: 'gammy:wishlist',
  diary: 'gammy:diary',
  ratings: 'gammy:ratings',
  translations: 'gammy:translations'
};

function read(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const state = {
  lang: read(STORAGE_KEYS.lang, 'it'),
  library: read(STORAGE_KEYS.library, []),
  wishlist: read(STORAGE_KEYS.wishlist, []),
  diary: read(STORAGE_KEYS.diary, []),
  ratings: read(STORAGE_KEYS.ratings, {}),
  translations: read(STORAGE_KEYS.translations, {})
};

export function setLang(lang) { state.lang = lang; write(STORAGE_KEYS.lang, lang); }
export function saveLibrary() { write(STORAGE_KEYS.library, state.library); }
export function saveWishlist() { write(STORAGE_KEYS.wishlist, state.wishlist); }
export function saveDiary() { write(STORAGE_KEYS.diary, state.diary); }
export function saveRatings() { write(STORAGE_KEYS.ratings, state.ratings); }
export function saveTranslations() { write(STORAGE_KEYS.translations, state.translations); }

export function inLibrary(rawgId){ return state.library.some(g => g.id === rawgId); }
export function inWishlist(rawgId){ return state.wishlist.some(g => g.id === rawgId); }

export function addToLibrary(game){
  if (!inLibrary(game.id)) { state.library.unshift(minifyGame(game)); saveLibrary(); }
}
export function removeFromLibrary(rawgId){
  state.library = state.library.filter(g => g.id !== rawgId);
  delete state.ratings[rawgId]; saveLibrary(); saveRatings();
}
export function addToWishlist(game){
  if (!inWishlist(game.id)) { state.wishlist.unshift(minifyGame(game)); saveWishlist(); }
}
export function removeFromWishlist(rawgId){
  state.wishlist = state.wishlist.filter(g => g.id !== rawgId); saveWishlist();
}
export function setRating(rawgId, value){ state.ratings[rawgId] = value; saveRatings(); }
export function getRating(rawgId){ return state.ratings[rawgId] || 0; }

export function addDiaryEntry({rawgId, title, note}){
  const entry = { id: crypto.randomUUID(), rawgId, title, note, createdAt: Date.now() };
  state.diary.unshift(entry); saveDiary();
}
export function removeDiaryEntry(entryId){
  state.diary = state.diary.filter(e => e.id !== entryId); saveDiary();
}

function minifyGame(g){
  return {
    id: g.id,
    provider: g.provider || 'rawg',
    name: g.name,
    released: g.released || null,
    metacritic: g.metacritic || null,
    background_image: g.background_image || null,
    platforms: g.platforms?.map(p => p.platform?.name || p.name || p) || []
  };
}