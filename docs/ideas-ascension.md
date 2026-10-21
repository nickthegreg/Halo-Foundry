# Ascension: design notes

Brainstormed 2026-10-19.

## Built (2026-10-21)
- Unlocks when any Aether is in storage (main game only). Minimums for later ascensions: not decided yet.
- Starseeds = floor(√(Aether in storage)) at the moment of ascending. Changed from √(Aether/10), which gave 0 for small amounts now that Aether is scarce.
- New moon starts at the main game (ms = TUT, tutorial unlocks granted), 400 iron + 200 copper.
- Kept: Ember shards, Nova shards, Starseeds (S.asc), Commander levels and points (S.cmdBank banks Constellations from past moons; S.cmdSpent tracks spend), blueprints, ground style, lifetime Aether refined (drives Refinery cost).
- Reset: everything else, including all Menu upgrades and petals.
- Ember scaling (conservative): no extra perk yet. Shards are kept in full; the Fibonacci climb restarts because it counts Deep Drills owned.
- Commander cost per path level: 1 + floor(level / 2).
- Nova shards: 1% per Aether burned in a Reactor, first-find popup. No use yet.
- Starseed shop (built 2026-10-21, data in `SS` in game.js): Seed veins (10%/level of patches, max 10), Seed growth (×1.5/level), Seed reach (2→5 tiles), Core size (5×5, 7×7; grows when the ring is clear), Trickle items (5 tiers in `TRICKLE`), Trickle rate (6/min ×1.5/level).
- Seeds: richest tile of each 4-connected patch; on if hash < Seed veins %. Regrow 0.01% of start amount per tile per second × growth, capped at the start amount. Unbuildable (except buildings already there).
- Lifetime Starseeds: +1% ore per tile each; +1% Fabricator (all types) and Uplink duplication each, capped at 100%. Anti-scaling still to do.
- Per ascension: +1 Commander point, +20% Core power. Relic every 3rd ascension, pick 1 of 3 (`RELICS`, stackable).
- Nova workshop (`NUP`): Deep Drill bore (+20% speed), reach (+1 tile each side, max 2), thrift (×0.85 ore used), cooling (−25% power, max 3). Permanent.
- Moon modifiers (`MODS`): pick 1 of 3 or a plain moon on every ascension; Starseed multiplier applies when leaving that moon.
- Relics: 51 (`RELICS`, rarity weights in `RARITY`); 6 are challenge-only and live in META.crelics, applying to every main-game slot.
- Challenges (`CHALLENGES`) and the Daily moon are separate slots starting at the main game with no bonuses; no offline progress there.
- Not built yet: growing non-depleted veins, puzzles, Commander mode, endless frontier, daily leaderboard (local best only).

## Original brainstorm

### Shape
- **Trigger:** a late goal, e.g. Aether Reactors researched or Constellation V. Ascending sends the foundry to a fresh moon (new seed, new ore layout).
- **Currency: Starseeds.** Earned from lifetime Aether refined on a square-root curve, e.g. `floor(sqrt(aether / 10))`, so longer runs pay more without endless grinding being the only answer. Smaller bonus from petals in orbit or Furnace tier.
- **Resets:** buildings, inventory, milestones, research, Charge, grid and furnace tiers.
- **Kept:** Ember shards (all or a share), Starseeds and perks, blueprints, ground style. Maybe Menu upgrades at reduced levels.

## Perk ideas

### Ember shards
- Fibonacci cost climb for Ember buildings starts lower or grows slower.
- Flat discount on Ember costs per level.
- Start each run with a few free Deep Drills that don't count toward the climb.
- Higher Ember drop chance from burning (base 2%).

### Production
- Chance for any fabricator or smelter to make one extra item (duplication).
- Chance a recipe skips consuming one input.
- Machines start faster each run.
- Smelters and Foundries hold more ore.
- Fabricators keep a set's worth of buffer that never strands (also fixes splitter-chain jams).

### Mining and map
- Ore patches start richer (permanent Deep Veins).
- Some depleted tiles slowly regrow ore.
- Larger starting frontier.
- A new ore type that only appears on ascended moons.

### Logistics and building
- Faster construction pulses or an extra pulse slot from the start.
- Conveyors start at a higher Conveyor speed level.
- Blueprints build for free up to a cost cap (placing your old layout is the main speed-up in later runs).
- Longer-range Uplinks, or every building can send a few items to the Core.

### Power
- More kW per petal, or the halo keeps a share of its petals between runs.
- Burners start at Furnace tier 1 or 2.
- Solar keeps some output at night.
- Core makes more than 120 kW.

### Progression
- Commander points carry over, or a free point per ascension.
- One free research of your choice per run.
- Higher starting Charge storage.
- Skip the tutorial after the first ascension.
- Better offline earnings or a longer offline cap.

### Unique to ascension
- **Moon modifiers you choose** (double carbon but no cuprite, fast days...). Harder moons pay more Starseeds.
- **Challenges:** restricted runs (solar only, no splitters) with a permanent reward.
- **Relics:** one random permanent bonus per ascension, chosen from three (JRPG feel, like Commander).
- **Visuals:** past halos stay in the sky as faint rings.

### More ideas (added 2026-10-21)
- **Bigger Core:** the Core grows (3×3 → 4×4 → 5×5), giving more sides to feed and room for more Uplinks next to it.
- **Free trickle production:** the Core makes items on its own at x per minute. Starts with ingots and low-tier parts; more and higher ascensions raise the amount and unlock better items.
- **Uplink duplication:** a chance that an item beamed by an Uplink arrives as two.
- **Fabricator duplication:** a chance a craft makes an extra output.
- **Growing veins:** ore tiles that aren't depleted slowly gain ore over time, above their starting amount.
- **Tiberium seeds:** every ore patch has one seed tile that never runs out. Ore slowly spreads back out from it to depleted tiles, so a mined-out patch always recovers eventually. The seed tile is unbuildable (no drills or anything else on it), and clearly marked so players plan around it. Drills next to it still mine the regrowing tiles around it.

## Design notes
- First ascension should pay off fast: second run reaches Grid Charter in roughly a third of the time.
- Prefer percentages and head starts over skipping content, so runs don't feel samey.
- Store ascension data under its own localStorage key so a broken run can't wipe perks, and include it in save codes.

## Suggested first version
Starseeds from Aether, keep Ember shards, a perk shop with 5–8 of the ideas above, and free starting Deep Drills.
