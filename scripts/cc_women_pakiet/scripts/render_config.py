#!/usr/bin/env python3
"""Renderuj szablon po ustawieniu CCW_* ze środowiska; nie commituj wynikowego pliku."""
from pathlib import Path
import os, re, sys
from urllib.parse import urlparse
ROOT=Path(__file__).resolve().parents[1]
keys={'__HOST__':'CCW_ICECAST_HOST','__PORT__':'CCW_ICECAST_PORT','__PASSWORD__':'CCW_ICECAST_PASSWORD','__MOUNT__':'CCW_ICECAST_MOUNT','__PLAYLIST_PATH__':'CCW_PLAYLIST_PATH'}
vals={k:os.environ.get(env,'') for k,env in keys.items()}
if any(not x for x in vals.values()):
    sys.exit('Brak zmiennej środowiska: '+', '.join(keys[k] for k,v in vals.items() if not v))
if not vals['__PORT__'].isdigit() or not 1 <= int(vals['__PORT__']) <= 65535: sys.exit('Niepoprawny port')
if not re.fullmatch(r'[a-zA-Z0-9.\-]+', vals['__HOST__']): sys.exit('Niepoprawny host')
if not re.fullmatch(r'[a-zA-Z0-9_.\-]+', vals['__MOUNT__']): sys.exit('Niepoprawny mount')
# Template uses quoted string values. Escape characters that can change syntax.
def escape_liq(s): return s.replace('\\','\\\\').replace('"','\\"').replace('\n','\\n').replace('\r','\\r')
for k in vals:
    if k != '__PORT__': vals[k]=escape_liq(vals[k])
config=(ROOT/'stream/ccw.liq.template').read_text('utf-8')
for k,v in vals.items(): config=config.replace(k,v)
out=ROOT/'stream/ccw.generated.liq';out.write_text(config,encoding='utf-8');out.chmod(0o600)
print('Wygenerowano',out,'(SEKRET W PLIKU — NIE COMMITUJ)')
