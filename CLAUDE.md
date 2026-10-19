# Halo Foundry: notes for Claude

- Plain static site: no build step. `npm start` serves it, `npm test` runs the headless smoke test (needs Chromium; set CHROME_PATH).
- Every push to `main` runs the smoke test and deploys to GitHub Pages (https://nickthegreg.github.io/Halo-Foundry/).
- Game data lives in `src/data/game.js` (items, recipes, buildings, milestones, grid ladder) and `src/data/music.js` (playlist). Everything else is in `src/main.js` for now; split it further as features land, keeping the smoke test green.
- Save format: localStorage key `halo-foundry-v2`; save codes (Menu → Save code) move saves between sites. Keep loading old saves working when changing state.
- The player is on mobile first: test at 390×844, touch input, and keep audio quiet by default.
