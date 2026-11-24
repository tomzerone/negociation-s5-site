// Utilitaires d'affichage, icônes et rendu des blocs de contenu
// Typographie française : espaces insécables avant ; : ! ? » et après «
export const fr = (h) => String(h).replace(/ ([;:!?»])/g, '\u00a0$1').replace(/« /g, '«\u00a0');
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const strip = (html) => String(html ?? '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function plural(n, one, many) { return n + ' ' + (n > 1 ? many : one); }
export function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }
export function fmtDate(ts) {
  if (!ts) return '';
  const d = new Date(ts), now = new Date();
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === now.toDateString()) return "Aujourd'hui, " + time;
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'Hier, ' + time;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ', ' + time;
}
export function shuffle(a) { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
export function note20(x) { return (Math.round(x * 2) / 2).toLocaleString('fr-FR'); }
export function num(x, d = 2) { return Number(x).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: d }); }
export function parseNum(s) {
  if (s == null) return NaN;
  const t = String(s).replace(/\s| |€|%/g, '').replace(',', '.');
  if (!t) return NaN;
  return Number(t);
}

// Couleurs des lignes (séances)
export const LINE = { s1: 'l1', s2: 'l2', s3: 'l3', s4: 'l4', cas: 'l5', m: 'l5', x: 'l5' };
export function roundel(sid, label) {
  const cls = LINE[sid] || 'l5';
  return `<span class="rd ${cls}" aria-hidden="true">${esc(label)}</span>`;
}

// Icônes (trait 1.7, 20px)
const P = {
  home: '<path d="M3 10.5 10 4l7 6.5V17a1 1 0 0 1-1 1h-3.5v-5h-5v5H4a1 1 0 0 1-1-1z"/>',
  book: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H16v12H5.5A1.5 1.5 0 0 0 4 16.5zM4 16.5A1.5 1.5 0 0 0 5.5 18H16v-3"/>',
  sheet: '<path d="M5 3h7l3 3v11H5z"/><path d="M12 3v3h3M8 10h4M8 13h4"/>',
  cards: '<rect x="3" y="6" width="11" height="11" rx="1.5"/><path d="M7 3.5h9.5V14"/>',
  check: '<path d="M4 10.5 8 14l8-8"/>',
  list: '<path d="M7 5h10M7 10h10M7 15h10M3.5 5h.01M3.5 10h.01M3.5 15h.01"/>',
  target: '<circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="3"/>',
  timer: '<circle cx="10" cy="11" r="6.5"/><path d="M10 7.5V11l2 2M8 2.5h4"/>',
  spark: '<path d="M10 2.5v4M10 13.5v4M2.5 10h4M13.5 10h4M5 5l2.5 2.5M12.5 12.5 15 15M15 5l-2.5 2.5M7.5 12.5 5 15"/>',
  search: '<circle cx="9" cy="9" r="5.5"/><path d="m13.5 13.5 4 4"/>',
  menu: '<path d="M3 6h14M3 10h14M3 14h14"/>',
  x: '<path d="M5 5l10 10M15 5 5 15"/>',
  left: '<path d="M12 4 6 10l6 6"/>', right: '<path d="m8 4 6 6-6 6"/>',
  up: '<path d="m4 12 6-6 6 6"/>', down: '<path d="m4 8 6 6 6-6"/>',
  flip: '<path d="M4 8a6 6 0 0 1 11-2.5M16 12a6 6 0 0 1-11 2.5M15 2.5v3h-3M5 17.5v-3h3"/>',
  alert: '<path d="M10 3 2.5 16.5h15z"/><path d="M10 8v4M10 14.5v.01"/>',
  pen: '<path d="M4 16l1-4 8.5-8.5 3 3L8 15z"/>',
  more: '<circle cx="5" cy="10" r=".9"/><circle cx="10" cy="10" r=".9"/><circle cx="15" cy="10" r=".9"/>',
  cloud: '<path d="M6 15.5h8.5a3.5 3.5 0 0 0 .3-7A5 5 0 0 0 5 9.5a3 3 0 0 0 1 6z"/>',
  device: '<rect x="5" y="2.5" width="10" height="15" rx="2"/><path d="M9 15h2"/>',
  chat: '<path d="M3.5 4.5h13v9h-7l-4 3v-3h-2z"/><path d="M7 8.5h6M7 11h4"/>',
  puzzle: '<path d="M4 7h3a2 2 0 1 1 4 0h3v3a2 2 0 1 1 0 4v3H4z"/>',
  case: '<rect x="2.5" y="6" width="15" height="10.5" rx="1.5"/><path d="M7 6V4.5A1.5 1.5 0 0 1 8.5 3h3A1.5 1.5 0 0 1 13 4.5V6M2.5 10.5h15"/>',
  compass: '<circle cx="10" cy="10" r="7"/><path d="m12.8 7.2-1.7 3.9-3.9 1.7 1.7-3.9z"/>',
  quest: '<circle cx="10" cy="10" r="7"/><path d="M8 8a2 2 0 1 1 2.8 1.8c-.5.3-.8.7-.8 1.2v.5M10 14v.01"/>',
  lock: '<rect x="4.5" y="9" width="11" height="8" rx="1.5"/><path d="M7 9V6.5a3 3 0 0 1 6 0V9"/>',
  unlock: '<rect x="4.5" y="9" width="11" height="8" rx="1.5"/><path d="M7 9V6.5a3 3 0 0 1 5.8-1"/>',
  eye: '<path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10z"/><circle cx="10" cy="10" r="2.3"/>',
  users: '<circle cx="7.5" cy="7" r="2.8"/><path d="M2.5 16.5a5 5 0 0 1 10 0"/><path d="M13 4.5a2.8 2.8 0 0 1 0 5.2M14.5 12a5 5 0 0 1 3 4.5"/>',
  play: '<path d="M6 4l10 6-10 6z"/>',
  refresh: '<path d="M16 5v3.5h-3.5"/><path d="M15.5 8.5A6 6 0 1 0 16 12"/>',
  flag: '<path d="M5 17V3.5M5 4h9l-2 3 2 3H5"/>',
  calc: '<rect x="4" y="2.5" width="12" height="15" rx="1.5"/><path d="M7 6h6M7 10h.01M10 10h.01M13 10h.01M7 13h.01M10 13h.01M13 13h.01"/>',
  layers: '<path d="m10 3 7 3.5-7 3.5-7-3.5z"/><path d="m3 10 7 3.5 7-3.5M3 13.5 10 17l7-3.5"/>',
  copy: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M13 7V4.5A1.5 1.5 0 0 0 11.5 3h-7A1.5 1.5 0 0 0 3 4.5v7A1.5 1.5 0 0 0 4.5 13H7"/>',
  info: '<circle cx="10" cy="10" r="7"/><path d="M10 9v5M10 6.5v.01"/>',
  scale: '<path d="M10 3v14M6 17h8M4 7h12M4 7l-2 5a2 2 0 0 0 4 0zM16 7l-2 5a2 2 0 0 0 4 0z"/>',
};
export function icon(name, cls = '') {
  return `<svg class="ic ${cls}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
}

// ───────── Rendu des blocs du cours
// Blocs « Cours » : contenu tiré des supports et de tes notes. Blocs « Plateforme » : explications et applications ajoutées pour t'aider.
const COURSE = {
  def: 'Définition', ex: 'Exemple du cours', key: 'À retenir', q: 'Question clé du cours', dist: 'Distinction',
  warn: 'Point de vigilance', note: 'Tes notes de cours',
};
const PLAT = { expl: 'Pour comprendre', app: 'Application', trap: 'Piège au contrôle', check: 'Point à vérifier' };

export function renderBlocks(blocks, ctx = {}) {
  return blocks.map((b, i) => {
    const t = b[0];
    const id = ctx.prefix ? ` id="${ctx.prefix}-b${i}"` : '';
    switch (t) {
      case 'p': return `<p${id}>${b[1]}</p>`;
      case 'h': return `<h3 class="subh"${id}>${b[1]}</h3>`;
      case 'ul': return `<ul${id}>${b[1].map((x) => `<li>${x}</li>`).join('')}</ul>`;
      case 'ol': return `<ol${id}>${b[1].map((x) => `<li>${x}</li>`).join('')}</ol>`;
      case 'table': return table(b[1], b[2], id);
      case 'flow': return `<div class="flow"${id}>${b[2] ? `<div class="flow-l">${b[2]}</div>` : ''}<ol class="flow-line">${b[1].map((x) => `<li><span>${x}</span></li>`).join('')}</ol></div>`;
      case 'cols': return `<div class="cols"${id}>${b[1].map(([h, body]) => `<div class="col"><h4>${h}</h4>${body}</div>`).join('')}</div>`;
      case 'def': case 'ex': case 'dist':
        return `<aside class="box c ${t}"${id}><div class="box-l"><span class="tag">Cours</span>${COURSE[t]}</div><div class="box-t">${b[1]}</div><div class="box-b">${b[2]}</div></aside>`;
      case 'key':
        return `<aside class="box c key"${id}><div class="box-l"><span class="tag">Cours</span>${COURSE.key}</div><ul>${b[1].map((x) => `<li>${x}</li>`).join('')}</ul></aside>`;
      case 'q':
        return `<aside class="box c qk"${id}><div class="box-l"><span class="tag">Cours</span>${COURSE.q}</div><div class="box-b qk-t">${b[1]}</div>${b[2] ? `<div class="box-b">${b[2]}</div>` : ''}</aside>`;
      case 'warn': case 'note':
        return `<aside class="box c ${t}"${id}><div class="box-l"><span class="tag">Cours</span>${COURSE[t]}</div><div class="box-b">${b[1]}</div></aside>`;
      case 'expl': case 'app':
        return `<aside class="box pf ${t}"${id}><div class="box-l"><span class="tag">Plateforme</span>${PLAT[t]}</div>${b[1] ? `<div class="box-t">${b[1]}</div>` : ''}<div class="box-b">${b[2]}</div></aside>`;
      case 'trap': case 'check':
        return `<aside class="box pf ${t}"${id}><div class="box-l"><span class="tag">Plateforme</span>${PLAT[t]}</div><div class="box-b">${b[1]}</div></aside>`;
      case 'link': return `<p class="train-l"${id}>${icon('puzzle')}<span>${b[1]}</span></p>`;
      default: return '';
    }
  }).join('');
}
export function table(head, rows, idAttr = '') {
  return `<div class="tbl-wrap"${idAttr}><table class="stack"><thead><tr>${head.map((x) => `<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, j) => j === 0 ? `<th scope="row">${c}</th>` : `<td data-label="${esc(strip(head[j]))}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
export function blockText(b) {
  const t = b[0];
  if (['p', 'h', 'warn', 'note', 'trap', 'check', 'link'].includes(t)) return strip(b[1]);
  if (t === 'q') return strip(b[1]) + (b[2] ? ' ' + strip(b[2]) : '');
  if (['ul', 'ol', 'key'].includes(t)) return b[1].map(strip).join(' ');
  if (t === 'flow') return b[1].map(strip).join(' → ');
  if (t === 'cols') return b[1].map(([h, x]) => strip(h) + ' : ' + strip(x)).join(' ');
  if (['def', 'ex', 'dist', 'expl', 'app'].includes(t)) return strip(b[1]) + ' — ' + strip(b[2]);
  if (t === 'table') return [b[1].map(strip).join(' | '), ...b[2].map((r) => r.map(strip).join(' | '))].join(' ');
  return '';
}

// Toast
let toastTimer;
export function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

// Boîte de dialogue intégrée (alert/confirm sont bloqués dans le cadre des artefacts)
export function confirmDialog(title, text, okLabel = 'Confirmer') {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'dlg-wrap';
    wrap.innerHTML = `<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="dlg-t"><h3 id="dlg-t">${esc(title)}</h3><p>${text}</p><div class="dlg-a"><button class="btn ghost" data-v="0">Annuler</button><button class="btn primary" data-v="1">${esc(okLabel)}</button></div></div>`;
    document.body.appendChild(wrap);
    const done = (v) => { wrap.remove(); resolve(v); };
    wrap.addEventListener('click', (e) => { const b = e.target.closest('button[data-v]'); if (b) done(b.dataset.v === '1'); else if (e.target === wrap) done(false); });
    wrap.addEventListener('keydown', (e) => { if (e.key === 'Escape') done(false); });
    wrap.querySelector('button[data-v="1"]').focus();
  });
}

// Copie dans le presse-papiers (à appeler depuis un clic)
export async function copyText(txt) {
  try { await navigator.clipboard.writeText(txt); toast('Copié dans le presse-papiers'); return true; }
  catch { toast('Copie impossible ici : sélectionne le texte et copie-le à la main'); return false; }
}

// Petite jauge horizontale
export function bar(p, cls = '') { const v = Math.max(0, Math.min(100, Math.round(p))); return `<span class="bar ${cls}" aria-hidden="true"><i style="width:${v}%"></i></span>`; }
