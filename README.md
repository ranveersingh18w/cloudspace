Cloudspace mini apps
====================

This repo contains small web apps you can open directly in a browser.

Included
--------

- Snake game (HTML/CSS/JS) in `snake/`
- Tic‑Tac‑Toe (X/O) in `xo/`

How to run locally
------------------

Any static file server works. Using Python:

1. Start a server in the repo root
2. Open the app in your browser

Try this:

```bash
python3 -m http.server 8080 --bind 127.0.0.1
```

Then open:

- http://127.0.0.1:8080/snake/
- http://127.0.0.1:8080/xo/

Snake controls
--------------

- Arrow keys or WASD to move
- Space to pause/resume
- R to restart
# cloudspace