# Halo Foundry

A touch-first factory game. Drill a small moon, belt and assemble parts, light the star with a halo of sail petals, then grow a power grid that never stops scaling.

**Play:** https://nickthegreg.github.io/Halo-Foundry/ (after the first deploy). On a phone, use "Add to Home Screen" to install it; it works offline after one visit.

## Run locally

```
npm start          # serves the game at http://localhost:5173
npm test           # boots the game in headless Chromium and fails on any page error
```

No build step: the game is plain HTML, CSS and JavaScript modules, deployed as-is.

## Layout

| Path | What's there |
| --- | --- |
| `index.html` | Page shell and HUD markup |
| `src/styles.css` | All styling |
| `src/data/game.js` | Items, ores, recipes, buildings, milestones, grid ladder |
| `src/data/music.js` | Playlist and harmony helpers for the generative soundtrack |
| `src/main.js` | Simulation, rendering, input, UI, audio, save/load |
| `sw.js`, `manifest.webmanifest` | Offline support and home-screen install |
| `tests/` | Static server and smoke test |

## Deploying

Every push to `main` runs the smoke test and publishes to GitHub Pages
(Settings → Pages → Source: **GitHub Actions**).

## Moving a save

In the game: Menu → Save code → Copy code, then paste it into the same screen on the new site.
