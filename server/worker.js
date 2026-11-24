// Halo Foundry · Daily moon leaderboard (Cloudflare Worker + D1, binding name DB)
// GET  /daily/YYYY-MM-DD?cid=...  -> {day,total,top:[{name,score}],me:{score,rank}|null}
// POST /daily  {day,name,score,cid,mod,ver}  -> {ok:true} (first post per player per day counts)
const ORIGINS = ['https://nickthegreg.github.io', 'http://localhost:5173', 'http://127.0.0.1:5173'];
const MAX_SCORE = 500_000_000;

async function sha(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].slice(0, 12).map(x => x.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ORIGINS.includes(origin) ? origin : ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    };
    const json = (d, status = 200) => new Response(JSON.stringify(d), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const url = new URL(req.url);

    const m = url.pathname.match(/^\/daily\/(\d{4}-\d{2}-\d{2})$/);
    if (req.method === 'GET' && m) {
      const day = m[1], cid = (url.searchParams.get('cid') || '').slice(0, 40);
      const { results } = await env.DB.prepare('SELECT name, score FROM scores WHERE day = ? ORDER BY score DESC, at ASC LIMIT 50').bind(day).all();
      const total = (await env.DB.prepare('SELECT COUNT(*) AS n FROM scores WHERE day = ?').bind(day).first()).n;
      let me = null;
      if (cid) {
        const r = await env.DB.prepare('SELECT score FROM scores WHERE day = ? AND cid = ?').bind(day, cid).first();
        if (r) me = { score: r.score, rank: (await env.DB.prepare('SELECT COUNT(*) AS n FROM scores WHERE day = ? AND score > ?').bind(day, r.score).first()).n + 1 };
      }
      return json({ day, total, top: results, me });
    }

    if (req.method === 'POST' && url.pathname === '/daily') {
      let b; try { b = await req.json(); } catch { return json({ error: 'Bad request' }, 400); }
      const day = String(b.day || '');
      const name = String(b.name || '').replace(/[^\p{L}\p{N} _.'-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 16);
      const score = Math.floor(Number(b.score));
      const cid = String(b.cid || '');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return json({ error: 'Bad day' }, 400);
      if (Math.abs(Date.now() - Date.parse(day + 'T12:00:00Z')) > 40 * 3600e3) return json({ error: 'That day’s board is closed' }, 400);
      if (name.length < 2) return json({ error: 'Pick a name of 2 to 16 letters' }, 400);
      if (!(score >= 0 && score <= MAX_SCORE)) return json({ error: 'That score can’t be right' }, 400);
      if (!/^[a-z0-9]{12,40}$/i.test(cid)) return json({ error: 'Bad id' }, 400);
      const iph = await sha((req.headers.get('CF-Connecting-IP') || '') + day);
      const n = (await env.DB.prepare('SELECT COUNT(*) AS n FROM scores WHERE day = ? AND iph = ?').bind(day, iph).first()).n;
      if (n >= 6) return json({ error: 'Too many scores from here today' }, 429);
      await env.DB.prepare('INSERT INTO scores (day, cid, name, score, mod, ver, iph, at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(day, cid) DO NOTHING')
        .bind(day, cid, name, score, String(b.mod || '').slice(0, 20), Number(b.ver) || 0, iph, Date.now()).run();
      return json({ ok: true });
    }
    return json({ error: 'Not found' }, 404);
  }
};
