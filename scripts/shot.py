"""Captures d'écran rapides : python3 scripts/shot.py route1 route2 ... [--w 1280] [--dark] [--full]"""
import sys, pathlib
from playwright.sync_api import sync_playwright

args = sys.argv[1:]
width = 1280
dark = '--dark' in args
full = '--full' in args
if '--w' in args:
    width = int(args[args.index('--w') + 1])
routes = [a for i, a in enumerate(args) if not a.startswith('--') and (i == 0 or args[i - 1] != '--w')]
root = pathlib.Path(__file__).resolve().parent.parent
out = root / 'shots'
out.mkdir(exist_ok=True)
url = (root / 'dist' / 'negociation-revision.html').as_uri()
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    ctx = b.new_context(viewport={'width': width, 'height': 900 if width > 700 else 800}, color_scheme='dark' if dark else 'light', device_scale_factor=1)
    page = ctx.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    for r in routes or ['accueil']:
        page.goto(url + '#' + r)
        page.wait_for_timeout(500)
        name = out / f"{r.replace('/', '_')}-{width}{'-dark' if dark else ''}.png"
        page.screenshot(path=str(name), full_page=full)
        sw = page.evaluate('document.documentElement.scrollWidth')
        print(name.name, 'scrollWidth', sw)
    for e in errors:
        print('ERR', e)
    b.close()
