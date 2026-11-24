# Daily moon leaderboard

A tiny Cloudflare Worker with a D1 database. Free tier is plenty.

1. Sign up at dash.cloudflare.com (free).
2. **Storage & Databases → D1 → Create** a database named `halo-daily`. Open its **Console**, paste `schema.sql`, run it.
3. **Workers & Pages → Create → Worker** (Hello World), name it `halo-daily`, **Deploy**, then **Edit code**:
   replace everything with `worker.js` and **Deploy**.
4. In the Worker: **Settings → Bindings → Add → D1 database**, variable name `DB`, database `halo-daily`. Save / deploy.
5. Put the Worker's address (`https://halo-daily.<you>.workers.dev`) in `src/data/leaderboard.js` as `LB_URL`.

Only each player's first attempt of the day is posted. The server checks the date, the name and that the score is in a
sane range, and allows a few entries per network per day; it can't fully stop a determined cheater.
