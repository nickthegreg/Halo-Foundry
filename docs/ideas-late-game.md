# Late game: design notes (2026-10-26)

Problem: by the second or third ascension, machines run several times faster than base, power is plentiful and a
run's only real goal is "store Aether". Content past the Refinery is thin, and conveyors (about 5 items/s per line)
become the hard cap. Everything below unlocks from **ascension 2 onward** (`S.asc.n>=2`), so new players never see
it, and it's tuned around high machine speed.

## Already done (2026-10-26)
- "Burns longer" bonuses (Kindle, Forge Star, odd Furnace tiers, Ember commander, Bellows / Roaring Reactor relics)
  now make burners **hotter**: +X% power and fuel burned X% faster, so more Ember shards, husks and Nova shards.
- Ascension needs at least 20 × (ascensions so far)² Starseeds: 20 for the 2nd, 80 for the 3rd, 180, 320, 500…
- Speedrun: 1 hour.

## 1. Two new ores
- **Voidstone**: deep-only. Patches appear only outside the starting 128×128 area (where pulses are slow), and only a
  Deep Drill can mine them. Smelts into **Void glass** in a Foundry only.
- **Starsand**: a mixed ore. A Deep Drill pulls it like any ore, but nothing smelts it directly. A new 3×3
  **Separator** takes 1,000 Starsand and puts out a stream: about 10% **Rare earth**, plus ferrite, cuprite, silica
  and **Slag** mixed together. Players sort it with Sorters. Slag goes into an **Incinerator** (or back to the
  Core for a tiny refund). If an output backs up, the Separator stops. This is the "lots of junk to sort" puzzle.

## 2. Science (the throughput sink)
- New items **Science packs** in three colours, each a real chain:
  - Red: gear + circuit (Fabricator).
  - Blue: processor + Void glass + coil (Assembler).
  - Gold: photonic + Rare earth + servo + lattice-grade composite (Assembler Mk II).
- A **Lab** (3×3) eats packs and turns them into **Insight**. Late research and the new repeatables cost Insight, not
  Charge, so a run's progress is limited by how many packs per second the factory makes. This is what puts high
  machine speed to work.

## 3. Bigger machines and logistics
- **Express conveyor** (2× speed) and **Hyper conveyor** (4×): the real late-game bottleneck. Unlocked by research
  in the run, made cheaper by a Starseed node.
- **Smelter Mk II** (2×2, ×3), **Assembler Mk II** (3×3, ×3), **Deep Drill Mk II** (3×3, larger reach).
- **Megaproject: Halo Ring.** A huge build site near the Core with stage costs in the hundreds of thousands of items
  (steel, servos, Void glass, gold packs). Each finished stage gives a run-long bonus and Starseeds when you leave.
  This gives a big run a goal beyond "store Aether".

## 4. Starseed tree: more branches
Today the shop is Seeds (3) + Core size + Trickle (2). New branches:
- **Logistics:** start with Express conveyors unlocked; Sorters/Splitters free; Batcher capacity ×2.
- **Head start:** keep N research nodes on ascension; start with a starter kit of machines; start at grid tier 1.
- **Fortune:** a Relic choice of 4 instead of 3; one reroll per pick; Legendary weight +1.
- **Deep space:** Voidstone patches start closer; Separator gives more Rare earth; Labs 25% faster.
- Each branch: ~4 nodes, costs growing like the existing ones (hundreds to thousands of seeds), so a 700-seed run buys
  1–2 meaningful nodes.

## 5. Public daily leaderboard
GitHub Pages can't store scores, so this needs a tiny backend. Options:
- **Cloudflare Worker + D1** (free tier, recommended): `POST /daily` {day, name, time, save code}, `GET /daily/:day`
  top 50. Rate-limit by IP, reject impossible times, keep the save code so suspicious runs can be checked or removed.
- Supabase/Firebase: quicker to set up, but the browser writes directly so cheating is trivial.
- Needs from the owner: a Cloudflare account (free) and a player-chosen name field. Claude writes the Worker and the
  in-game board; the owner deploys with `wrangler deploy` once.
