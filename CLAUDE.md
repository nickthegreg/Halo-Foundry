# Halo Foundry: notes for Claude

- Plain static site: no build step. `npm start` serves it, `npm test` runs the headless smoke test (needs Chromium; set CHROME_PATH).
- Every push to `main` runs the smoke test and deploys to GitHub Pages (https://nickthegreg.github.io/Halo-Foundry/).
- Game data lives in `src/data/game.js` (items, recipes, buildings, milestones, grid ladder) and `src/data/music.js` (playlist). Everything else is in `src/main.js` for now; split it further as features land, keeping the smoke test green.
- Save format: slots are localStorage keys `halo-foundry-v2` (slot 1, the original save), `-s2`, `-s3`, `-daily` and `-ch` (current challenge); `CUR` in main.js is the active one. Account-wide data (challenge wins, challenge Relics, daily bests, last slot) lives in `halo-foundry-meta`. Save codes (Menu → Save code) move one slot between sites. Keep loading old saves working when changing state.
- The player is on mobile first: test at 390×844, touch input, and keep audio quiet by default.
- Every player-facing update adds an entry at the top of `src/data/changelog.js` with the next `n`: that drives the in-game "What's new" card and the "Update ready" banner.
- Design ideas for future features live in `docs/` (e.g. `docs/ideas-ascension.md`). Read them before building those features.
