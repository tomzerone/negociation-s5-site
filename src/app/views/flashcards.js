import { state, save, logSession } from '../store.js';
import { FLASHCARDS, SEANCES, SE, tagLabel, rateCard, isMastered, isToReview, isDue, orderDeck } from '../data.js';
import { esc, icon, roundel, bar, plural, $, fr } from '../ui.js';

const DECKS = () => [
  ...SEANCES.map((s) => ({ id: s.id, title: `Séance ${s.num} — ${s.short}`, color: s.color, r: roundel(s.id, s.num) })),
  { id: 'cas', title: 'Cas MarketOne / TempoRun', color: 'l5', r: roundel('cas', 'C') },
  { id: 'x', title: 'Notions transversales', color: 'l5', r: roundel('x', '+') },
];
const deckCards = (id) => {
  if (id === 'all') return FLASHCARDS;
  if (id === 'review') return FLASHCARDS.filter((f) => isToReview(f.id));
  if (id === 'due') return FLASHCARDS.filter((f) => state.cards[f.id] && isDue(f.id) && !isToReview(f.id));
  if (id === 'new') return FLASHCARDS.filter((f) => !state.cards[f.id]);
  return FLASHCARDS.filter((f) => f.s === id);
};
const deckTitle = (id) => ({ all: 'Toutes les cartes', review: 'Cartes à revoir', due: 'Cartes à échéance', new: 'Cartes jamais vues' }[id] || (DECKS().find((d) => d.id === id) || {}).title || id);
const deckColor = (id) => (DECKS().find((d) => d.id === id) || {}).color || 'l5';

function list() {
  const review = deckCards('review').length, due = deckCards('due').length, fresh = deckCards('new').length;
  const decks = DECKS().map((d) => {
    const cards = deckCards(d.id);
    const m = cards.filter((c) => isMastered(c.id)).length, r = cards.filter((c) => isToReview(c.id)).length;
    return `<a class="deck ${d.color}" href="#flashcards-${d.id}"><span style="display:flex;gap:10px;align-items:center">${d.r}<strong>${esc(d.title)}</strong></span>${bar(cards.length ? (m / cards.length) * 100 : 0)}<span>${m}/${cards.length} maîtrisées${r ? ` · <em>${r} à revoir</em>` : ''}</span></a>`;
  }).join('');
  const cs = state.cardSession;
  return `<header class="page-h"><h1>Flashcards</h1><p class="lead">${FLASHCARDS.length} cartes. Réponds de tête, retourne la carte, puis sois honnête : la répétition espacée te remontrera les cartes ratées tout de suite, et les autres après 1, 3, 7, 15 puis 30 jours.</p></header>
  ${cs && cs.queue && cs.index < cs.queue.length ? `<a class="resume" href="#flashcards-${esc(cs.deck)}" style="max-width:520px;margin-bottom:22px"><span class="resume-k">Reprendre la session en cours</span><span class="resume-t">${esc(deckTitle(cs.deck))}</span><span class="resume-d">Carte ${cs.index + 1} sur ${cs.queue.length}</span></a>` : ''}
  <div class="row-btns">
    <a class="btn primary" href="#flashcards-all">${icon('cards')} Toutes les cartes</a>
    <a class="btn ${review ? 'ko' : ''}" href="#flashcards-review" ${review ? '' : 'aria-disabled="true"'}>À revoir (${review})</a>
    <a class="btn" href="#flashcards-due">À échéance (${due})</a>
    <a class="btn" href="#flashcards-new">Jamais vues (${fresh})</a>
  </div>
  <h2 style="margin-top:22px">Par paquet</h2>
  <div class="decks">${decks}</div>
  <p class="muted small">Raccourcis clavier pendant une session : <strong>Espace</strong> pour retourner, <strong>1</strong> « je ne savais pas », <strong>2</strong> « je savais ».</p>`;
}

function cardHtml(sess) {
  const id = sess.queue[sess.index];
  const c = FLASHCARDS.find((f) => f.id === id);
  if (!c) return '';
  const color = SE[c.s] ? SE[c.s].color : 'l5';
  return `<div class="fc ${color}" id="fc">
    <div class="fc-in" role="button" tabindex="0" aria-label="Retourner la carte">
      <div class="fc-face"><div class="fc-k">${esc(tagLabel(c.s))} · carte ${sess.index + 1}/${sess.queue.length}</div><div class="fc-q">${esc(c.q)}</div><div class="fc-hint">Réponds de tête, puis touche la carte ou appuie sur Espace.</div></div>
      <div class="fc-face fc-back"><div class="fc-k">Réponse</div><div class="fc-q" style="font-size:1.05rem;margin:0 0 12px;font-weight:700">${esc(c.q)}</div><div class="fc-a">${c.a}</div></div>
    </div>
  </div>
  <div class="fc-btns" id="rate" hidden>
    <button class="btn ko" data-rate="0"><kbd>1</kbd> Je ne savais pas</button>
    <button class="btn ok" data-rate="1"><kbd>2</kbd> Je savais</button>
  </div>
  <div class="fc-btns" id="flipb"><button class="btn primary" data-flip>${icon('flip')} Retourner la carte</button></div>`;
}

function sessionView(deck) {
  const cards = deckCards(deck);
  let sess = state.cardSession;
  if (!sess || sess.deck !== deck || !sess.queue || sess.index >= sess.queue.length) {
    sess = { deck, queue: orderDeck(cards.map((c) => c.id)), index: 0, ok: 0, ko: 0, startedAt: Date.now() };
    state.cardSession = sess; save();
  }
  if (!sess.queue.length) {
    return `<a href="#flashcards" class="back">${icon('left')} Paquets</a><header class="page-h"><h1>${esc(deckTitle(deck))}</h1></header><div class="empty-big"><p>Aucune carte dans ce paquet pour l’instant.</p><a class="btn primary" href="#flashcards">Choisir un autre paquet</a></div>`;
  }
  return `<a href="#flashcards" class="back">${icon('left')} Paquets</a>
  <div class="fc-top"><h1 style="font-size:1.6rem;margin:0">${esc(deckTitle(deck))}</h1>
  <div class="fc-prog ${deckColor(deck)}"><span id="prog-t">${sess.index}/${sess.queue.length} cartes vues · ${sess.ok} sues · ${sess.ko} à revoir</span>${bar((sess.index / sess.queue.length) * 100)}</div></div>
  <div id="stage">${cardHtml(sess)}</div>`;
}

function endView(sess) {
  const masteredDeck = deckCards(sess.deck).filter((c) => isMastered(c.id)).length;
  return `<div class="empty-big" style="max-width:640px">
    <h2>Session terminée</h2>
    <p class="score-big">${sess.ok}<small>/${sess.queue.length} sues</small></p>
    <p>${sess.ko ? plural(sess.ko, 'carte reviendra', 'cartes reviendront') + ' dans la pile « À revoir ».' : 'Aucune erreur : bravo.'} ${masteredDeck}/${deckCards(sess.deck).length} cartes du paquet sont maîtrisées.</p>
    <div class="row-btns"><a class="btn primary" href="#flashcards-${sess.ko ? 'review' : sess.deck}">${sess.ko ? 'Revoir mes erreurs' : 'Recommencer le paquet'}</a><a class="btn" href="#flashcards">Autres paquets</a><a class="btn" href="#qcm">Passer au QCM</a></div>
  </div>`;
}

export function render(param) {
  if (!param) return { html: list(), title: 'Flashcards', resume: 'Flashcards' };
  return { html: sessionView(param), title: 'Flashcards — ' + deckTitle(param), resume: 'Flashcards — ' + deckTitle(param), noFocus: true };
}

let keyHandler = null;
export function mount(root, param) {
  if (!param) return;
  logSession('flashcards', 'Flashcards — ' + deckTitle(param));
  const flip = () => {
    const fc = $('#fc', root); if (!fc) return;
    fc.classList.toggle('flipped');
    const shown = fc.classList.contains('flipped');
    $('#rate', root).hidden = !shown; $('#flipb', root).hidden = shown;
    if (shown) $('#rate [data-rate="1"]', root).focus({ preventScroll: true });
  };
  const rate = (known) => {
    const sess = state.cardSession; if (!sess) return;
    const id = sess.queue[sess.index];
    rateCard(id, known);
    if (known) sess.ok++; else sess.ko++;
    sess.index++;
    save();
    const stage = $('#stage', root);
    const p = $('#prog-t', root);
    if (p) { p.textContent = `${sess.index}/${sess.queue.length} cartes vues · ${sess.ok} sues · ${sess.ko} à revoir`; const b = p.nextElementSibling; if (b) b.firstElementChild.style.width = Math.round((sess.index / sess.queue.length) * 100) + '%'; }
    stage.innerHTML = fr(sess.index >= sess.queue.length ? endView(sess) : cardHtml(sess));
  };
  root.addEventListener('click', (e) => {
    if (e.target.closest('.fc-in') || e.target.closest('[data-flip]')) { flip(); return; }
    const r = e.target.closest('[data-rate]'); if (r) rate(r.dataset.rate === '1');
  });
  keyHandler = (e) => {
    if (e.target.matches('input, textarea')) return;
    const fc = $('#fc', root); if (!fc) return;
    if (e.key === ' ' || e.key === 'Enter') { if (e.target.closest('button') && e.key === 'Enter') return; e.preventDefault(); if (!fc.classList.contains('flipped')) flip(); }
    else if (fc.classList.contains('flipped') && (e.key === '1' || e.key === '2')) rate(e.key === '2');
  };
  document.addEventListener('keydown', keyHandler);
}
export function unmount() { if (keyHandler) document.removeEventListener('keydown', keyHandler); keyHandler = null; }
