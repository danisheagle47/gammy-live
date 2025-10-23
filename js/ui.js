import { t } from './i18n.js';

export function toast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.remove('hidden'); el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2400);
  setTimeout(() => el.classList.add('hidden'), 2600);
}

/* Ripple effect per tutti i bottoni */
export function initButtonFX(){
  if (initButtonFX._once) return; initButtonFX._once = true;
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.primary-btn,.secondary-btn,.icon-btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 620);
  });
}

export function bindModal(rootId){
  const root = document.getElementById(rootId);
  root.addEventListener('click', (e) => {
    if (e.target.dataset.close === 'true' || e.target.classList.contains('close')) hideModal(rootId);
  });
}
export function showModal(id){ document.getElementById(id).classList.remove('hidden'); }
export function hideModal(id){ document.getElementById(id).classList.add('hidden'); }

export function platformChip(name){
  const icon = platformIcon(name);
  const div = document.createElement('div'); div.className='platform-chip';
  div.innerHTML = `${icon}<span>${name}</span>`;
  return div;
}
function platformIcon(name){
  const n = (name||'').toLowerCase();
  if (n.includes('playstation')) return '🎮';
  if (n.includes('xbox')) return '🕹️';
  if (n.includes('pc') || n.includes('windows') ) return '💻';
  if (n.includes('nintendo') || n.includes('switch')) return '🔺';
  if (n.includes('ios') || n.includes('mac')) return '🍎';
  if (n.includes('android')) return '🤖';
  return '🎲';
}

export function starRating(current, onChange){
  const wrap = document.createElement('div');
  wrap.className='stars';
  for (let i=1; i<=5; i++){
    const s = document.createElement('span');
    s.className='star' + (i>current?' inactive':'');
    s.textContent = i<=current ? '★' : '☆';
    s.title = `${i}/5`;
    s.addEventListener('click', () => onChange(i));
    wrap.appendChild(s);
  }
  return wrap;
}

export function createCard(game, {onClick, onRemove, removable=false, showMeta=true}={}){
  const card = document.createElement('div'); card.className='card';
  const img = document.createElement('img'); img.className='thumb'; img.alt = game.name;
  img.src = game.background_image || coverFromIGDB(game.cover) || 'https://placehold.co/600x338/0D0D1A/EEE?text=Gammy';
  card.appendChild(img);
  const body = document.createElement('div'); body.className='body';
  const title = document.createElement('div'); title.className='title'; title.textContent= game.name;
  body.appendChild(title);
  if (showMeta){
    const meta = document.createElement('div'); meta.className='meta';
    const date = game.released ? formatDate(game.released) : (game.first_release_date ? formatDate(new Date(game.first_release_date*1000).toISOString().slice(0,10)) : '—');
    meta.textContent = `${date}${game.metacritic ? ` • MC ${game.metacritic}`:''}`;
    body.appendChild(meta);
  }
  if (removable){
    const btn = document.createElement('button'); btn.className='icon-btn'; btn.style.position='absolute'; btn.style.top='10px'; btn.style.right='10px'; btn.title=t('common.remove'); btn.textContent='✖';
    btn.addEventListener('click', (e) => { e.stopPropagation(); onRemove?.(game); });
    card.appendChild(btn);
  }
  card.appendChild(body);
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--x', `${e.clientX-rect.left}px`);
    card.style.setProperty('--y', `${e.clientY-rect.top}px`);
  });
  if (onClick) card.addEventListener('click', () => onClick(game));
  return card;
}

function coverFromIGDB(image_id){
  if (!image_id) return null;
  return `https://images.igdb.com/igdb/image/upload/t_cover_big/${image_id}.jpg`;
}
function formatDate(iso){
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'2-digit' });
}