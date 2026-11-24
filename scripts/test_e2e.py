"""Tests navigateur de bout en bout (Playwright + Chrome) : python3 scripts/test_e2e.py
Parcourt toutes les rubriques sur ordinateur et sur mobile, exerce les interactions principales
et vérifie : absence d'erreur JavaScript, absence de débordement horizontal, sauvegarde de la progression."""
import sys, pathlib, threading, http.server, socketserver, functools, json
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
PORT = 8765
results = []

def ok(cond, label):
    results.append((bool(cond), label))
    print(('  ✓ ' if cond else '  ✗ ') + label)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

def serve():
    handler = functools.partial(Quiet, directory=str(DIST))
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(('127.0.0.1', PORT), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd

ROUTES = ['accueil', 'cours', 'cours-s1', 'cours-s2-gonogo', 'cours-s3', 'cours-s4-cadre', 'fiches', 'fiches-s2', 'fiches-transversale', 'fiches-lexique', 'fiches-cas',
          'flashcards', 'flashcards-s4', 'qcm', 'questions', 'questions-qc-s1-01', 'exercices', 'exercices-calculs', 'exercices-dimensions', 'exercices-ordre',
          'simulateur', 'simulateur-agent', 'methode', 'cas', 'cas-velos', 'cas-handball', 'examens', 'examen-ex2', 'revision', 'reglages', 'recherche']

def run(base, mobile):
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        vp = {'width': 390, 'height': 844} if mobile else {'width': 1366, 'height': 900}
        ctx = b.new_context(viewport=vp, device_scale_factor=1, has_touch=mobile, is_mobile=mobile)
        page = ctx.new_page()
        errs = []
        page.on('pageerror', lambda e: errs.append(str(e)))
        page.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'fonts.g' not in m.text else None)
        tag = 'mobile' if mobile else 'ordinateur'
        print(f'\n== {tag}')
        page.goto(base + '#accueil'); page.wait_for_selector('.net')
        ok(page.locator('.ln').count() == 4, f'{tag} : le réseau affiche les 4 lignes')
        # Toutes les routes s'affichent sans erreur ni débordement
        bad = []
        for r in ROUTES:
            page.goto(base + '#' + r); page.wait_for_timeout(120)
            if page.locator('#main h1').count() == 0: bad.append(r + ' (pas de titre)')
            sw = page.evaluate('document.documentElement.scrollWidth'); cw = page.evaluate('document.documentElement.clientWidth')
            if sw > cw + 1: bad.append(f'{r} (débordement {sw}>{cw})')
        ok(not bad, f'{tag} : {len(ROUTES)} pages affichées sans débordement' + (' — ' + ', '.join(bad) if bad else ''))
        if mobile:
            page.goto(base + '#accueil'); page.wait_for_timeout(100)
            ok(page.locator('.tabbar').is_visible(), 'mobile : barre d’onglets visible')
            page.click('#tab-more'); page.wait_for_timeout(300)
            ok(page.evaluate("document.body.classList.contains('drawer')"), 'mobile : le menu s’ouvre')
            page.click('#close-side'); page.wait_for_timeout(250)
        else:
            # Cours : marquer étudiée
            page.goto(base + '#cours-s1'); page.wait_for_selector('#mark')
            page.click('#mark'); page.wait_for_timeout(100)
            st = page.evaluate("window.__nego.state.seances.s1")
            ok(st and st.get('studied'), 'cours : séance 1 marquée comme étudiée')
            # Recherche depuis un lien de cours
            page.goto(base + '#cours-s3-rapport'); page.wait_for_timeout(200)
            ok(page.evaluate("!!window.__nego.state.seances.s3 && !!window.__nego.state.seances.s3.seen.rapport"), 'cours : station lue enregistrée')
            # Fiches : bascule express
            page.goto(base + '#fiches-s2'); page.click('[data-mode="express"]'); page.wait_for_timeout(100)
            ok(page.locator('.express li').count() >= 8, 'fiches : fiche express affichée')
            # Lexique filtre
            page.goto(base + '#fiches-lexique'); page.fill('#lexq', 'batna'); page.wait_for_timeout(100)
            ok(page.locator('.lex-i:not([hidden])').count() >= 1 and page.locator('.lex-i:not([hidden])').count() < 5, 'lexique : filtre')
            # Flashcards
            page.goto(base + '#flashcards-s1'); page.wait_for_selector('#fc')
            page.click('[data-flip]'); page.wait_for_timeout(500)
            page.click('[data-rate="1"]'); page.wait_for_timeout(150)
            page.keyboard.press('Space'); page.wait_for_timeout(500); page.keyboard.press('1'); page.wait_for_timeout(150)
            cards = page.evaluate("Object.keys(window.__nego.state.cards).length")
            ok(cards == 2, f'flashcards : 2 cartes notées (clic + clavier) [{cards}]')
            # QCM complet
            page.goto(base + '#qcm-s2'); page.click('[data-n="10"]'); page.click('#start'); page.wait_for_selector('.q-card')
            for i in range(10):
                if page.locator('#validate').count():
                    page.locator('.opt').first.click(); page.click('#validate')
                else:
                    page.locator('.opt').first.click()
                page.wait_for_selector('#next'); page.click('#next'); page.wait_for_timeout(60)
            ok(page.locator('.score-big').count() == 1, 'QCM : résultat affiché après 10 questions')
            ok(len(page.evaluate("window.__nego.state.qcmRuns")) == 1, 'QCM : résultat enregistré')
            # Question de cours
            page.goto(base + '#questions-qc-s3-04'); page.fill('[data-ans]', 'Le distributeur n’est pas automatiquement en position de force : tout dépend de la dépendance et des alternatives.')
            page.click('[data-show]'); page.wait_for_selector('.keys input')
            page.locator('.keys input').nth(0).check(); page.locator('.keys input').nth(1).check(); page.click('[data-selfsave]'); page.wait_for_timeout(100)
            q = page.evaluate("window.__nego.state.questions['qc-s3-04']")
            ok(q and abs(q['score'] - 0.4) < 1e-6, 'questions : auto-évaluation enregistrée (2/5)')
            # Exercice : identification (single)
            page.goto(base + '#exercices-contexte'); page.wait_for_selector('.item')
            n = len(page.evaluate("1") and [0] * 12)
            for i in range(12):
                page.locator('.opt').first.click(); page.wait_for_selector('#next'); page.click('#next'); page.wait_for_timeout(40)
            ok(page.locator('.score-big').count() == 1, 'exercice « contexte » : résultat affiché')
            # Exercice : classement + calcul
            page.goto(base + '#exercices-consultation'); page.wait_for_selector('.cls-row')
            rows = page.locator('.cls-row').count()
            for i in range(rows):
                page.locator('.cls-row').nth(i).locator('button').nth(0).click()
            page.click('#validate'); page.wait_for_selector('.cls-why')
            ok(page.locator('.cls-row.right').count() == 3, 'exercice « consultation » : correction du classement (3 exigences justes)')
            page.click('#next'); page.locator('.opt').nth(1).click(); page.click('#next')
            page.fill('#numv', '7,6'); page.click('#validate'); page.wait_for_timeout(80)
            ok(page.locator('.verdict.ok').count() == 1, 'exercice « consultation » : calcul 7,6 accepté (virgule)')
            # Exercice : ordre
            page.goto(base + '#exercices-ordre'); page.wait_for_selector('.order')
            page.locator('[data-down="0"]').click(); page.click('#validate'); page.wait_for_timeout(80)
            ok(page.locator('.order li.right, .order li.wrong').count() == 5, 'exercice « ordre » : correction affichée')
            # Simulateur complet
            page.goto(base + '#simulateur-referencement'); page.wait_for_selector('.choice')
            for i in range(5):
                page.locator('.choice').first.click(); page.wait_for_selector('#cont'); page.click('#cont'); page.wait_for_timeout(60)
            ok(page.locator('.score-big').count() == 1 and page.evaluate("!!window.__nego.state.sims.referencement"), 'simulateur : bilan affiché et enregistré')
            # Cas pratique
            page.goto(base + '#cas-marketone'); page.click('[data-camp="B"]'); page.wait_for_selector('.tabs')
            page.click('[data-tab="annexe"]'); ok(page.locator('.doc.conf').count() == 1, 'cas : annexe confidentielle de mon camp seulement')
            page.click('[data-tab="analyse"]'); page.wait_for_selector('[data-ans]')
            page.locator('[data-ans]').first.fill('Référencement sur une marketplace, cadre encadré, information asymétrique.')
            page.locator('[data-show]').first.click(); page.wait_for_selector('[data-corr]:not([hidden])')
            ok(page.evaluate("window.__nego.state.cases.marketone.steps['m-contexte'].shown === true"), 'cas : correction d’étape ouverte et suivie')
            page.click('[data-tab="prep"]'); page.locator('[data-prep="objectifs"]').fill('Seuil 14 €'); page.wait_for_timeout(700)
            ok(page.evaluate("window.__nego.state.cases.marketone.prep.objectifs") == 'Seuil 14 €', 'cas : fiche de préparation enregistrée')
            page.click('[data-tab="debrief"]'); page.click('#reveal'); page.wait_for_selector('.dlg'); page.click('.dlg [data-v="1"]'); page.wait_for_timeout(150)
            ok(page.locator('.stamp.sim').count() == 1 and page.locator('text=Synthèse et accord possible').count() == 1, 'cas : annexe adverse (simulée) et synthèse révélées')
            # Contrôle blanc
            page.goto(base + '#examen-ex1'); page.click('[data-dur="0"]'); page.click('#go'); page.wait_for_selector('[data-x]')
            page.locator('[data-x]').first.fill('Une négociation dont les modalités sont fortement influencées par le contexte.')
            page.wait_for_timeout(700); page.click('#submit'); page.click('.dlg [data-v="1"]'); page.wait_for_selector('[data-g]')
            page.locator('[data-g="e1q1"]').first.check(); page.wait_for_timeout(80)
            ok(page.locator('#sc').inner_text().strip() == '1', f'contrôle : note recalculée ({page.locator("#sc").inner_text()})')
            page.click('#save-grade'); page.wait_for_timeout(100)
            ok(len(page.evaluate("window.__nego.state.exams")) == 1, 'contrôle : note enregistrée')
            # Recherche
            page.goto(base + '#recherche'); page.fill('#bq', 'BATNA'); page.press('#bq', 'Enter'); page.wait_for_timeout(150)
            ok(page.locator('.results li').count() >= 3, 'recherche : résultats pour « BATNA »')
            page.locator('.results a').first.click(); page.wait_for_timeout(300)
            ok(page.locator('#main h1').count() == 1, 'recherche : ouverture d’un résultat')
            # Réglages + persistance
            page.goto(base + '#reglages'); page.fill('#nm', 'Tom'); page.wait_for_timeout(600)
            page.click('[data-theme="dark"]'); page.wait_for_timeout(100)
            ok(page.evaluate("document.documentElement.dataset.theme") == 'dark', 'réglages : thème sombre appliqué')
            page.reload(); page.goto(base + '#accueil'); page.wait_for_selector('.net')
            ok('Tom' in page.locator('h1').first.inner_text(), 'persistance : prénom conservé après rechargement')
            ok(page.locator('.path li.done').count() >= 1 or page.evaluate("window.__nego.state.qcmRuns.length") == 1, 'persistance : progression conservée')
            page.click('[data-theme]') if page.locator('[data-theme]').count() else None
            page.goto(base + '#reglages'); page.click('[data-theme="auto"]')
            # Révision ciblée
            page.goto(base + '#revision'); page.locator('[data-pick="s4"]').click(); page.wait_for_timeout(100)
            ok(page.locator('.path li').count() >= 5, 'révision ciblée : plan de travail généré')
        ok(not errs, f'{tag} : aucune erreur JavaScript' + (' — ' + ' | '.join(errs[:5]) if errs else ''))
        b.close()

if __name__ == '__main__':
    httpd = serve()
    try:
        run(f'http://127.0.0.1:{PORT}/index.html', mobile=False)
        run(f'http://127.0.0.1:{PORT}/negociation-revision.html', mobile=True)
    finally:
        httpd.shutdown()
    failed = [l for c, l in results if not c]
    print(f'\n{len(results) - len(failed)}/{len(results)} vérifications réussies')
    sys.exit(1 if failed else 0)
