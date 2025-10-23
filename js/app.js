import { state, addToLibrary, removeFromLibrary, addToWishlist, removeFromWishlist, inLibrary, inWishlist, setRating, getRating, addDiaryEntry } from './state.js';
import { t, applyTranslations, switchLang, translateText, getLang } from './i18n.js';
import { toast, bindModal, showModal, hideModal, createCard, platformChip, starRating } from './ui.js';
import { searchGames, getGameDetails, getUpcoming, getCalendar, getNews } from './api.js';
import { startBackground } from './bg.js';

const root = document.getElementById('view-root');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const openSearchBtn = document.getElementById('openSearch');

const modalSearch = document.getElementById('modal-search');
const modalDetail = document.getElementById('modal-detail');
const resultsGrid = document.getElementById('searchResults');

// Detail modal elements
const detailCover = document.getElementById('detailCover');
const detailTitle = document.getElementById('modal-detail-title');
const detailDeveloper = document.getElementById('detailDeveloper');
const detailRelease = document.getElementById('detailRelease');
const detailPlatforms = document.getElementById('detailPlatforms');
const detailMetacritic = document.getElementById('detailMetacritic');
const detailDescription = document.getElementById('detailDescription');
const btnAddLibrary = document.getElementById('btnAddLibrary');
const btnAddWishlist = document.getElementById('btnAddWishlist');
const personalRating = document.getElementById('personalRating');

let currentDetail = null;

// Init
document.addEventListener('DOMContentLoaded', () => {
  startBackground();
  bindModal('modal-search');
  bindModal('modal-detail');
  applyTranslations();
  initLangSwitch();
  initNav();
  initSearch();
  route();
});

function initLangSwitch(){
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchLang(btn.dataset.lang).then(() => {
        route(); // rerender
        toast(btn.dataset.lang === 'it' ? 'Lingua: Italiano' : 'Language: English');
      });
    });
  });
}

function initNav(){
  window.addEventListener('hashchange', route);
  document.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', () => {
      document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
      a.classList.add('active');
    });
  });
}

function route(){
  const hash = location.hash || '#/library';
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href')===hash);
  });
  if (hash.startsWith('#/library')) renderLibrary();
  else if (hash.startsWith('#/wishlist')) renderWishlist();
  else if (hash.startsWith('#/diary')) renderDiary();
  else if (hash.startsWith('#/upcoming')) renderUpcoming();
  else if (hash.startsWith('#/calendar')) renderCalendar();
  else if (hash.startsWith('#/news')) renderNews();
  else renderLibrary();
  applyTranslations();
}

function initSearch(){
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (!q) return;
    await doSearch(q);
  });
  openSearchBtn.addEventListener('click', () => {
    const q = searchInput.value.trim();
    showModal('modal-search');
    if (q) doSearch(q);
  });
}

async function doSearch(q){
  resultsGrid.innerHTML = '';
  showModal('modal-search');
  try {
    const data = await searchGames(q);
    if (!data.results?.length){
      resultsGrid.innerHTML = `<div style="opacity:.7">${getLang()==='it'?'Nessun risultato.':'No results.'}</div>`;
      return;
    }
    data.results.forEach(game => {
      const card = createCard(game, {
        onClick: () => openDetail(game.id)
      });
      resultsGrid.appendChild(card);
    });
  } catch (e){
    resultsGrid.innerHTML = `<div style="opacity:.7">Error: ${e.message}</div>`;
  }
}

// Detail modal logic
async function openDetail(id){
  hideModal('modal-search');
  currentDetail = null;
  detailTitle.textContent = '...';
  detailDeveloper.textContent = '—';
  detailRelease.textContent = '—';
  detailPlatforms.innerHTML = '';
  detailMetacritic.textContent = '—';
  detailDescription.textContent = '...';
  personalRating.innerHTML = '';
  personalRating.classList.add('hidden');
  btnAddLibrary.disabled = true; btnAddWishlist.disabled = true;
  showModal('modal-detail');

  try {
    const data = await getGameDetails(id);
    currentDetail = data;
    detailTitle.textContent = data.name;
    detailCover.src = data.background_image || 'https://placehold.co/1280x720/0D0D1A/EEE?text=Gammy';
    detailDeveloper.textContent = data.developers?.[0]?.name || '—';
    detailRelease.textContent = data.released || '—';
    detailPlatforms.innerHTML = '';
    const platforms = (data.parent_platforms?.map(p => p.platform.name) || data.platforms?.map(p=>p.platform?.name) || []);
    platforms.forEach(p => detailPlatforms.appendChild(platformChip(p)));
    detailMetacritic.textContent = data.metacritic ?? '—';

    let desc = strip(data.description_raw || data.description || '');
    if (desc) {
      const translated = await translateText(desc, getLang());
      detailDescription.textContent = translated;
    } else {
      detailDescription.textContent = getLang()==='it' ? 'Nessuna descrizione disponibile.' : 'No description available.';
    }

    btnAddLibrary.textContent = inLibrary(id) ? (getLang()==='it'?'Nella Libreria':'In Library') : t('detail.addLibrary');
    btnAddWishlist.textContent = inWishlist(id) ? (getLang()==='it'?'Nella Wishlist':'In Wishlist') : t('detail.addWishlist');

    btnAddLibrary.disabled = false; btnAddWishlist.disabled = false;

    btnAddLibrary.onclick = () => {
      if (!inLibrary(id)) {
        addToLibrary(data);
        toast(getLang()==='it'?'Aggiunto alla Libreria':'Added to Library');
      } else {
        removeFromLibrary(id);
        toast(getLang()==='it'?'Rimosso dalla Libreria':'Removed from Library');
      }
      btnAddLibrary.textContent = inLibrary(id) ? (getLang()==='it'?'Nella Libreria':'In Library') : t('detail.addLibrary');
      // enable rating only if in library
      renderPersonalRating();
      if (location.hash === '#/library') renderLibrary();
    };

    btnAddWishlist.onclick = () => {
      if (!inWishlist(id)) {
        addToWishlist(data);
        toast(getLang()==='it'?'Aggiunto alla Wishlist':'Added to Wishlist');
      } else {
        removeFromWishlist(id);
        toast(getLang()==='it'?'Rimosso dalla Wishlist':'Removed from Wishlist');
      }
      btnAddWishlist.textContent = inWishlist(id) ? (getLang()==='it'?'Nella Wishlist':'In Wishlist') : t('detail.addWishlist');
      if (location.hash === '#/wishlist') renderWishlist();
    };

    renderPersonalRating();
  } catch (e){
    detailDescription.textContent = 'Error loading details.';
  }
}

function renderPersonalRating(){
  personalRating.innerHTML = '';
  if (currentDetail && inLibrary(currentDetail.id)) {
    personalRating.classList.remove('hidden');
    const curr = getRating(currentDetail.id);
    const stars = starRating(curr, (val) => {
      setRating(currentDetail.id, val);
      renderPersonalRating();
      toast(getLang()==='it' ? `Valutazione: ${val}/5` : `Rating: ${val}/5`);
      if (location.hash==='#/library') renderLibrary();
    });
    personalRating.appendChild(stars);
  } else {
    personalRating.classList.add('hidden');
  }
}

/* Views */
function renderLibrary(){
  root.innerHTML = `<h2 data-i18n="library.title">La tua Libreria</h2><div class="grid" id="libGrid"></div>`;
  const grid = document.getElementById('libGrid');
  if (!state.library.length) {
    grid.innerHTML = `<div style="opacity:.7">${getLang()==='it'?'La libreria è vuota. Usa la ricerca.':'Library is empty. Use search.'}</div>`;
  } else {
    state.library.forEach(game => {
      const card = createCard(game, {
        onClick: () => openDetail(game.id),
        onRemove: (g) => { removeFromLibrary(g.id); renderLibrary(); toast(getLang()==='it'?'Rimosso.':'Removed.'); },
        removable:true
      });
      const rating = document.createElement('div');
      rating.style.position='absolute'; rating.style.left='10px'; rating.style.top='10px';
      rating.appendChild(starRating(getRating(game.id), (v) => { setRating(game.id, v); renderLibrary(); }));
      card.appendChild(rating);
      grid.appendChild(card);
    });
  }
}

function renderWishlist(){
  root.innerHTML = `<h2 data-i18n="wishlist.title">La tua Wishlist</h2><div class="grid" id="wishGrid"></div>`;
  const grid = document.getElementById('wishGrid');
  if (!state.wishlist.length) {
    grid.innerHTML = `<div style="opacity:.7">${getLang()==='it'?'La wishlist è vuota.':'Wishlist is empty.'}</div>`;
  } else {
    state.wishlist.forEach(game => {
      const card = createCard(game, {
        onClick: () => openDetail(game.id),
        onRemove: (g) => { removeFromWishlist(g.id); renderWishlist(); toast(getLang()==='it'?'Rimosso.':'Removed.'); },
        removable:true
      });
      grid.appendChild(card);
    });
  }
}

function renderDiary(){
  const options = state.library.map(g => `<option value="${g.id}">${escapeHtml(g.name)}</option>`).join('');
  root.innerHTML = `
    <h2 data-i18n="diary.title">Diario di Gioco</h2>
    <div class="glass" style="padding:12px; margin-bottom:12px">
      <div style="display:flex; gap:8px; flex-wrap:wrap">
        <select id="diaryGame" style="flex:1; min-width:200px; background: rgba(0,0,0,0.3); color: var(--text); border:1px solid var(--border); border-radius:10px; padding:8px">
          <option value="">${getLang()==='it'?'Seleziona gioco':'Select game'}</option>
          ${options}
        </select>
        <input id="diaryNote" placeholder="${getLang()==='it'?'Scrivi una nota sulla tua sessione...':'Write a note about your session...'}" style="flex:2; min-width:260px; background: rgba(0,0,0,0.3); color: var(--text); border:1px solid var(--border); border-radius:10px; padding:8px"/>
        <button id="addNoteBtn" class="primary-btn">${getLang()==='it'?'Aggiungi Nota':'Add Note'}</button>
      </div>
    </div>
    <div id="diaryList" class="grid"></div>
  `;
  document.getElementById('addNoteBtn').addEventListener('click', () => {
    const gid = document.getElementById('diaryGame').value;
    const note = document.getElementById('diaryNote').value.trim();
    if (!gid || !note) return;
    const game = state.library.find(g => g.id == gid);
    addDiaryEntry({ rawgId: game.id, title: game.name, note });
    renderDiary();
  });
  const list = document.getElementById('diaryList');
  if (!state.diary.length){
    list.innerHTML = `<div style="opacity:.7">${getLang()==='it'?'Nessuna nota nel diario.':'No diary entries.'}</div>`;
  } else {
    state.diary.forEach(entry => {
      const card = document.createElement('div'); card.className='card';
      const body = document.createElement('div'); body.className='body';
      const title = document.createElement('div'); title.className='title'; title.textContent = entry.title;
      const when = new Date(entry.createdAt).toLocaleString();
      const meta = document.createElement('div'); meta.className='meta'; meta.textContent = when;
      const text = document.createElement('div'); text.style.marginTop='6px'; text.textContent = entry.note;
      const openBtn = document.createElement('button'); openBtn.className='secondary-btn'; openBtn.textContent = getLang()==='it'?'Apri gioco':'Open game';
      openBtn.addEventListener('click', () => openDetail(entry.rawgId));
      const removeBtn = document.createElement('button'); removeBtn.className='icon-btn'; removeBtn.style.position='absolute'; removeBtn.style.top='10px'; removeBtn.style.right='10px'; removeBtn.textContent='✖';
      removeBtn.addEventListener('click', () => { 
        import('./state.js').then(({ removeDiaryEntry }) => { removeDiaryEntry(entry.id); renderDiary(); });
      });
      body.appendChild(title); body.appendChild(meta); body.appendChild(text);
      const actions = document.createElement('div'); actions.style.marginTop='8px'; actions.style.display='flex'; actions.style.gap='8px'; actions.appendChild(openBtn);
      body.appendChild(actions);
      card.appendChild(removeBtn);
      card.appendChild(body);
      list.appendChild(card);
    });
  }
}

async function renderUpcoming(){
  root.innerHTML = `<h2 data-i18n="upcoming.title">In Uscita</h2><div class="grid" id="upGrid"></div>`;
  const grid = document.getElementById('upGrid');
  grid.innerHTML = `<div style="opacity:.7">Loading...</div>`;
  try {
    const data = await getUpcoming();
    grid.innerHTML = '';
    data.forEach(game => {
      const card = createCard(game, {
        onClick: () => {
          // Search by RAWG id unknown; we'll open via name search detail attempt:
          searchGames(game.name).then(res => {
            const match = res.results?.find(g => g.name.toLowerCase()===game.name.toLowerCase()) || res.results?.[0];
            if (match) openDetail(match.id);
          });
        },
        showMeta:true
      });
      grid.appendChild(card);
    });
  } catch (e){
    grid.innerHTML = `<div style="opacity:.7">Error loading upcoming.</div>`;
  }
}

async function renderCalendar(){
  const now = new Date();
  const ym = new URLSearchParams(location.hash.split('?')[1]).get('m') || `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const [yy,mm] = ym.split('-').map(x=>parseInt(x,10));
  const first = new Date(yy, mm-1, 1);
  const startDay = new Date(first); startDay.setDate(1);
  const last = new Date(yy, mm, 0);
  root.innerHTML = `
    <h2 data-i18n="calendar.title">Calendario Uscite</h2>
    <div class="glass" style="padding:10px; display:flex; align-items:center; justify-content:space-between; margin-bottom:10px">
      <button id="prevM" class="secondary-btn">${t('calendar.prev')}</button>
      <div><strong>${first.toLocaleDateString(undefined, { month:'long', year:'numeric' })}</strong></div>
      <button id="nextM" class="secondary-btn">${t('calendar.next')}</button>
    </div>
    <div id="calGrid" class="grid" style="grid-template-columns: repeat(7, 1fr)"></div>
  `;
  document.getElementById('prevM').onclick = () => {
    const d = new Date(yy,mm-2,1);
    location.hash = `#/calendar?m=${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  };
  document.getElementById('nextM').onclick = () => {
    const d = new Date(yy,mm,1);
    location.hash = `#/calendar?m=${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  };

  const calGrid = document.getElementById('calGrid');
  calGrid.innerHTML = `<div style="grid-column: span 7; opacity:.7">Loading...</div>`;
  try {
    const data = await getCalendar(ym); // { days: { 'YYYY-MM-DD': [games] } }
    calGrid.innerHTML = '';
    const dow = (first.getDay() + 6) % 7; // Monday=0
    for (let i=0; i<dow; i++){
      const spacer = document.createElement('div'); spacer.className='card'; spacer.style.visibility='hidden'; calGrid.appendChild(spacer);
    }
    for(let day=1; day<=last.getDate(); day++){
      const dateStr = `${yy}-${String(mm).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const box = document.createElement('div'); box.className='card'; box.style.padding='8px'; box.style.cursor='default';
      const title = document.createElement('div'); title.className='meta'; title.textContent = dateStr;
      box.appendChild(title);
      const list = document.createElement('div'); list.style.display='flex'; list.style.flexDirection='column'; list.style.gap='6px'; list.style.marginTop='6px';
      (data.days?.[dateStr] || []).slice(0,4).forEach(g => {
        const item = document.createElement('div'); item.className='platform-chip';
        item.style.justifyContent='space-between'; item.style.width='100%';
        item.innerHTML = `<span>${escapeHtml(g.name)}</span><span style="opacity:.8">${(g.platforms||[]).slice(0,2).join(', ')}</span>`;
        item.addEventListener('click', () => {
          searchGames(g.name).then(res => {
            const match = res.results?.find(x => x.name.toLowerCase()===g.name.toLowerCase()) || res.results?.[0];
            if (match) openDetail(match.id);
          });
        });
        list.appendChild(item);
      });
      if ((data.days?.[dateStr] || []).length > 4){
        const more = document.createElement('div'); more.className='meta'; more.style.marginTop='4px'; more.textContent = `+${data.days[dateStr].length-4} more`;
        list.appendChild(more);
      }
      box.appendChild(list);
      calGrid.appendChild(box);
    }
  } catch (e){
    calGrid.innerHTML = `<div style="grid-column: span 7; opacity:.7">Error loading calendar.</div>`;
  }
}

async function renderNews(){
  root.innerHTML = `<h2 data-i18n="news.title">Notizie</h2><div id="newsList" class="grid" style="grid-template-columns: repeat(auto-fill, minmax(320px,1fr))"></div>`;
  const list = document.getElementById('newsList');
  list.innerHTML = `<div style="opacity:.7">Loading...</div>`;
  try {
    const items = await getNews();
    list.innerHTML = '';
    items.forEach(n => {
      const card = document.createElement('div'); card.className='card';
      const body = document.createElement('div'); body.className='body';
      const title = document.createElement('div'); title.className='title'; title.textContent = n.title;
      const meta = document.createElement('div'); meta.className='meta'; meta.textContent = new Date(n.published_at*1000).toLocaleString();
      const sum = document.createElement('div'); sum.style.marginTop='6px'; sum.style.opacity='.9'; sum.textContent = n.summary || '';
      const link = document.createElement('a'); link.href = n.url; link.target='_blank'; link.rel='noopener'; link.className='secondary-btn'; link.style.marginTop='8px'; link.textContent = getLang()==='it'?'Leggi':'Read';
      body.appendChild(title); body.appendChild(meta); body.appendChild(sum); body.appendChild(link);
      card.appendChild(body); list.appendChild(card);
    });
  } catch (e){
    list.innerHTML = `<div style="opacity:.7">Error loading news.</div>`;
  }
}

/* Helpers */
function strip(s){ return s?.replace(/<[^>]*>?/gm,'') || ''; }
function escapeHtml(str){ return str.replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m])); }