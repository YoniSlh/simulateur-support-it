#!/usr/bin/env python3
"""Génère index.html (version locale) à partir de app.html (version Artifact)."""
import pathlib
root = pathlib.Path(__file__).parent
body = (root / 'app.html').read_text(encoding='utf-8')
reset = ':root{color-scheme:light}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}'
html = ('<!doctype html><html lang="fr"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        f'<style>{reset}</style></head><body>{body}</body></html>\n')
(root / 'index.html').write_text(html, encoding='utf-8')
print('index.html généré')
