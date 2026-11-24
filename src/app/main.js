import { state, initRemote, onSync, sync, setLast, onChange } from './store.js';
import { icon, esc, $, toast, fr } from './ui.js';
import * as Home from './views/home.js';
import * as Cours from './views/cours.js';
import * as Fiches from './views/fiches.js';
import * as Cards from './views/flashcards.js';
import * as Qcm from './views/qcm.js';
import * as Questions from './views/questions.js';
import * as Methode from './views/methode.js';
import * as Exos from './views/exercices.js';
import * as Sim from './views/simulateur.js';
import * as Cas from './views/cas.js';
import * as Exams from './views/examens.js';
import * as Misc from './views/misc.js';

export const NAV = [
  { group: 'Apprendre' },
  { id: 'accueil', label: 'Tableau de bord', short: 'Accueil', icon: 'home' },
  { id: 'cours', label: 'Cours', icon: 'book' },
  { id: 'fiches', label: 'Fiches et lexique', short: 'Fiches', icon: 'sheet' },
  { id: 'flashcards', label: 'Flashcards', short: 'Cartes', icon: 'cards' },
  { group: 'S’entraîner' },
  { id: 'qcm', label: 'QCM', icon: 'check' },
  { id: 'questions', label: 'Questions de cours', short: 'Questions', icon: 'quest' },
  { id: 'exercices', label: 'Exercices d’application', short: 'Exercices', icon: 'puzzle' },
  { id: 'simulateur', label: 'Simulateur de négociation', short: 'Simulateur', icon: 'chat' },
  { group: 'Négocier' },
  { id: 'methode', label: 'Méthode d’analyse', short: 'Méthode', icon: 'compass' },
  { id: 'cas', label: 'Cas pratiques', short: 'Cas', icon: 'case' },
  { id: 'examens', label: 'Contrôles blancs', short: 'Contrôles', icon: 'timer' },
  { id: 'revision', label: 'Révision ciblée', short: 'Révision', icon: 'spark' },
];
const TABS = ['accueil', 'cours', 'flashcards', 'cas'];

const ROUTES = {
  accueil: [Home], cours: [Cours], fiches: [Fiches], flashcards: [Cards], qcm: [Qcm], questions: [Questions],
  methode: [Methode], exercices: [Exos], simulateur: [Sim], cas: [Cas], examens: [Exams], examen: [Exams, 'run'],
  revision: [Misc, 'revision'], reglages: [Misc, 'reglages'], recherche: [Misc, 'recherche'],
};
const NAV_OF = { examen: 'examens', recherche: 'recherche', reglages: 'reglages' };

let current = null;
export function go(hash) { if (location.hash.slice(1) === hash) route(); else location.hash = hash; }

function parse() {
  const h = decodeURIComponent(location.hash.slice(1)) || 'accueil';
  const i = h.indexOf('-');
  const name = i < 0 ? h : h.slice(0, i);
  const param = i < 0 ? '' : h.slice(i + 1);
  return ROUTES[name] ? { name, param, full: h } : { name: 'accueil', param: '', full: 'accueil' };
}


function route() {
  const r = parse();
  const [mod, sub] = ROUTES[r.name];
  if (current && current.unmount) { try { current.unmount(); } catch { /* */ } }
  const main = $('#main');
  const view = sub ? mod.views[sub] : mod;
  let out;
  try { out = view.render(r.param); } catch (e) { console.error(e); out = { html: `<div class="empty-big"><h1>Oups</h1><p>Cette page n’a pas pu s’afficher. <a href="#accueil">Retour au tableau de bord</a>.</p></div>` }; }
  main.innerHTML = `<div class="view view-${r.name}">${fr(out.html ?? out)}</div>`;
  current = view;
  if (view.mount) { try { view.mount(main.firstElementChild, r.param); } catch (e) { console.error(e); } }
  document.title = (out.title ? out.title + ' — ' : '') + 'Négociation spécifique';
  const navId = NAV_OF[r.name] || r.name;
  document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('on', a.dataset.nav === navId));
  closeDrawer();
  if (!out.keepScroll) {
    const anchor = out.anchor && document.getElementById(out.anchor);
    if (anchor) anchor.scrollIntoView({ block: 'start' }); else window.scrollTo(0, 0);
  }
  if (out.resume) setLast(r.full, out.resume);
  const firstH = main.querySelector('h1');
  if (firstH && !out.noFocus) { firstH.setAttribute('tabindex', '-1'); firstH.focus({ preventScroll: true }); }
}

function shell() {
  const nav = NAV.map((n) => n.group ? `<div class="nav-g">${n.group}</div>` : `<a href="#${n.id}" data-nav="${n.id}" class="nav-i">${icon(n.icon)}<span>${n.label}</span></a>`).join('');
  const tabs = TABS.map((id) => { const n = NAV.find((x) => x.id === id); return `<a href="#${id}" data-nav="${id}" class="tab">${icon(n.icon)}<span>${n.short || n.label}</span></a>`; }).join('')
    + `<button class="tab" id="tab-more" aria-label="Toutes les rubriques">${icon('more')}<span>Plus</span></button>`;
  document.getElementById('app').innerHTML = `
  <button class="skip" id="skip">Aller au contenu</button>
  <aside class="side" id="side" aria-label="Navigation">
    <div class="brand"><span class="logo" aria-hidden="true">N</span><div><strong>Négociation spécifique</strong><span>BUT TC · MDEE · S5</span></div><button class="icon-btn close-side" id="close-side" aria-label="Fermer le menu">${icon('x')}</button></div>
    <form class="side-search" id="side-search" role="search"><label class="sr" for="q-side">Rechercher</label>${icon('search')}<input id="q-side" type="search" placeholder="Rechercher une notion…" autocomplete="off"></form>
    <nav class="nav">${nav}</nav>
    <div class="side-foot">
      <a href="#reglages" class="nav-i small" data-nav="reglages">${icon('device')}<span>Réglages et sauvegarde</span></a>
      <div class="sync" id="sync">${icon('device')}<span>${esc(sync.status)}</span></div>
    </div>
  </aside>
  <div class="scrim" id="scrim"></div>
  <header class="topbar">
    <button class="icon-btn" id="open-side" aria-label="Ouvrir le menu">${icon('menu')}</button>
    <a href="#accueil" class="top-brand"><span class="logo sm" aria-hidden="true">N</span>Négociation</a>
    <a href="#recherche" class="icon-btn" aria-label="Rechercher">${icon('search')}</a>
  </header>
  <main id="main" tabindex="-1"></main>
  <nav class="tabbar" aria-label="Navigation principale">${tabs}</nav>`;

  $('#skip').onclick = () => $('#main').focus();
  $('#open-side').onclick = openDrawer;
  $('#tab-more').onclick = openDrawer;
  $('#close-side').onclick = closeDrawer;
  $('#scrim').onclick = closeDrawer;
  $('#side-search').onsubmit = (e) => { e.preventDefault(); const q = $('#q-side').value.trim(); if (q) { Misc.setQuery(q); go('recherche'); } };
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });
}
function openDrawer() { document.body.classList.add('drawer'); const f = $('#q-side'); if (f && window.innerWidth > 600) f.focus(); }
function closeDrawer() { document.body.classList.remove('drawer'); }

// Thème : celui choisi dans les réglages, sinon celui de l'environnement (artefact ou système)
function applyTheme() {
  let t = null;
  try { t = localStorage.getItem('nego-theme'); } catch { /* */ }
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
}
export function setTheme(t) {
  try { if (t === 'auto') localStorage.removeItem('nego-theme'); else localStorage.setItem('nego-theme', t); } catch { /* */ }
  if (t === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
}

function boot() {
  applyTheme();
  shell();
  window.addEventListener('hashchange', route);
  onSync((s) => { const el = $('#sync'); if (el) el.innerHTML = `${icon(s.mode === 'cloud' ? 'cloud' : 'device')}<span>${esc(s.status)}</span>`; });
  onChange(() => { const r = parse(); if (r.name === 'accueil') route(); });
  route();
  initRemote();
  window.addEventListener('error', (e) => { if (e && e.message && !/ResizeObserver/.test(e.message)) toast('Un problème d’affichage est survenu — recharge la page si besoin'); });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
window.__nego = { state, go };
