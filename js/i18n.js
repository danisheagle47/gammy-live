import { state, setLang, saveTranslations } from './state.js';

const dict = {
  it: {
    nav: { library:'Libreria', wishlist:'Wishlist', diary:'Diario', upcoming:'In Uscita', calendar:'Calendario', news:'Notizie' },
    search: { placeholder:'Cerca giochi...', search:'Cerca', results:'Risultati' },
    common: { close:'Chiudi', remove:'Rimuovi', save:'Salva', cancel:'Annulla', add:'Aggiungi', empty:'Nessun elemento.' },
    detail: { developer:'Sviluppatore', release:'Data di uscita', platforms:'Piattaforme', addLibrary:'Aggiungi alla Libreria', addWishlist:'Aggiungi alla Wishlist', rate:'Valutazione personale' },
    library: { title:'La tua Libreria' },
    wishlist: { title:'La tua Wishlist' },
    diary: { title:'Diario di Gioco', selectGame:'Seleziona gioco', notePlaceholder:'Scrivi una nota sulla tua sessione...', addNote:'Aggiungi Nota' },
    upcoming: { title: 'In Uscita' },
    calendar: { title: 'Calendario Uscite', prev:'Prec', next:'Succ' },
    news: { title:'Notizie' }
  },
  en: {
    nav: { library:'Library', wishlist:'Wishlist', diary:'Diary', upcoming:'Upcoming', calendar:'Calendar', news:'News' },
    search: { placeholder:'Search games...', search:'Search', results:'Results' },
    common: { close:'Close', remove:'Remove', save:'Save', cancel:'Cancel', add:'Add', empty:'Nothing here.' },
    detail: { developer:'Developer', release:'Release date', platforms:'Platforms', addLibrary:'Add to Library', addWishlist:'Add to Wishlist', rate:'Your rating' },
    library: { title:'Your Library' },
    wishlist: { title:'Your Wishlist' },
    diary: { title:'Game Diary', selectGame:'Select game', notePlaceholder:'Write a note about your session...', addNote:'Add Note' },
    upcoming: { title: 'Upcoming' },
    calendar: { title: 'Release Calendar', prev:'Prev', next:'Next' },
    news: { title:'News' }
  }
};

export function t(path){
  const [ns, key] = path.split('.');
  return dict[state.lang]?.[ns]?.[key] ?? path;
}

export function applyTranslations(){
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key));
  });
  // highlight language button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === state.lang);
  });
}

export async function switchLang(lang){
  setLang(lang);
  applyTranslations();
}

export function getLang(){ return state.lang; }

// Dynamic translation with caching (via serverless)
export async function translateText(text, targetLang){
  if (!text) return text;
  if (targetLang === 'en') return text; // assume source English (RAWG)
  const key = `${targetLang}|${hash(text)}`;
  if (state.translations[key]) return state.translations[key];
  const res = await fetch(`/api/translate?to=${encodeURIComponent(targetLang)}`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ text })
  });
  if (!res.ok) return text;
  const data = await res.json();
  const out = data.translation || text;
  state.translations[key] = out; saveTranslations();
  return out;
}

function hash(s){
  let h=0, i, chr;
  if (s.length === 0) return h.toString();
  for (i=0; i<s.length; i++){ chr = s.charCodeAt(i); h=((h<<5)-h)+chr; h|=0; }
  return h.toString();
}