# Late game: design notes

**Status (2026-10-26): built, except Stackers and Machine modules (§3), which the owner turned down for now.**
Everything gates on `late()` in `src/main.js` (main game, `S.asc.n>=2`). Data is in `src/data/game.js`
(`ORB`, `ORB_REP`, `MISSIONS`, `ROCKET`, `RING_MS`, `LATE_T`, SS branches with `br`); numbers are in
`docs/reference.md`. Changes from the plan below as built:
- No "Deep survey" research: Voidstone and Starsand patches simply exist on ascension-2+ moons (world gen adds them
  from their own random stream, so older patches don't move). Late research tiers: Separation, Void optics and
  Magnetics at tier 6; Gyroscopics and Rocketry at tier 7.
- Halo Ring: 9 segments = Starseeds ×2 (instead of endless day); 12 = the unique *Ringforged Halo* Relic the first
  time (`S.ringWins` carries across ascensions), a Relic choice every later time.
- Void sight: Deep Drills mine Voidstone 50% faster (not "patches nearer the Core", which would move the map).
- Spaceport: parts can be belted in or loaded from storage with a button; a Kit run can launch part-full.
- Prefab stackers removed from Logistics.
- Not yet: orbital labs don't progress while offline.
- 2026-10-28 rework: Spaceport is a 7×7 silo, belt-fed only, rockets take a flat 60 s (30 s with Launch logistics;
  machine speed doesn't apply), 1 GW standing / 10 GW while building. Rocket 30 Hull + 4 Guidance; fuel 1,000 / 500 /
  3,000+. One lab to start; Second/Third/Fourth lab research cost 500 red / purple / yellow kits. Single-colour
  research first (red: survey, logistics; purple: zero-g, Void sieve; yellow: Stellar weave), then mixed (Mag-rail,
  Deep tap, Ring design, Orbital overcharge). Incinerator draws 1 GW while burning. Voidstone slower everywhere
  (0.04/s base, 8 s smelt, Void lens 4 glass/10 s) with a new use: Void cells (Guidance units, Lab modules, Ring
  segments); Spaceport costs 2,000 Void glass. Magnets 5 s.
- 2026-11-01: Mag-rail is an elevated layer (`S.rail`, tile indices) over buildings, laid with Line/Free/Route.
  Pylons (1×1 buildings) go on open ground automatically, max 4 unsupported tiles in a row (`RAIL_GAP`); Rail
  Terminals count as support. Rails are instant; Pylons ride the conveyor pulse grouping. Not captured by blueprints.
- Owner's wish for later: raise recipe input counts across the board (most recipes use 1–4 of each input today).

Problem: by the second or third ascension, machines run several times faster than base, power is plentiful and a
run's only real goal is "store Aether". Content past the Refinery is thin. Everything below unlocks from
**ascension 2 onward** (`S.asc.n>=2`), so new players never see it. All numbers are mockups to tune in play.

Pacing target for a run at ascension 2–3: the ground chain (new ores, Magnets, Slagcrete) in the first hour after
Lattice cores; the Spaceport as a 1–2 hour build; orbital research and the Halo Ring as the long tail and the reason to
keep a run going instead of ascending at once.

## Already done (2026-10-26)
- "Burns longer" bonuses now make burners **hotter**: +X% power and fuel burned X% faster.
- Ascension needs at least 20 × (ascensions so far)² Starseeds: 20, 80, 180, 320, 500…
- Speedrun: 1 hour.

---

## 1. New ores and what they're for

### Voidstone (deep-only)
- Patches appear only outside the starting 128×128 area, where pulses crawl at 40%. Only Deep Drills mine it.
  0.3/s on a Deep Drill, 4,000–6,000 per tile. This makes Pulse Relays and outposts matter.
- Smelts only in a **Foundry**: Voidstone → **Void glass**, 3 s (0.33/s base, 1.33/s in a Foundry).

### Starsand (mixed ore, needs sorting)
- Patches anywhere, mined by Drills or Deep Drills (1.0/s, 400–600 per tile). Nothing smelts it.
- **Separator** (3×3): takes 1,000 Starsand, 20 s, then pushes out a mixed stream of 1,000 items from one edge:

  | Out | Share |
  |---|---|
  | Rare earth | 10% (100) |
  | Ferrite ore | 25% |
  | Cuprite ore | 20% |
  | Silica sand | 20% |
  | Slag | 25% |

  The player sorts that stream with Sorters. If the output backs up, the Separator stops, so every output needs
  somewhere to go.
- **Slag** isn't junk: it's the main input for **Slagcrete**, which the Spaceport needs in thousands.
  An **Incinerator** (1×1) destroys anything fed to it, for players who make more slag than they need.

### New parts

| Item | Inputs | Out | Time | Machine | Used in |
|---|---|---|---|---|---|
| Void glass | 1 Voidstone | 1 | 3 s | Foundry only | Void lens, Halo Ring, Mag-rail |
| Magnet | 2 Rare earth + 1 Copper coil | 1 | 2 s | Fabricator | Gyro, Mag-rail, kits, Spaceport |
| Slagcrete | 4 Slag + 1 Carbon | 1 | 1.5 s | Fabricator | Spaceport, Hull plates |
| Void lens | 2 Void glass + 1 Prism | 1 | 4 s | Fabricator | Orbital Lab, Void kit, Halo Ring |
| Gyro | 2 Magnet + 1 Servo + 1 Void lens | 1 | 8 s | Assembler | Guidance unit, Halo Ring |
| Hull plate | 4 Composite + 6 Slagcrete + 2 Frame | 1 | 6 s | Assembler | Rockets |
| Guidance unit | 1 Gyro + 2 Photonic chip + 1 Processor | 1 | 10 s | Assembler | Rockets |

## 2. Spaceport, rockets and orbital research

### Ground research (Charge + items, like today; tier 7+, needs ascension 2)

| Research | Charge | Items | Unlocks |
|---|---|---|---|
| Deep survey | 8,000 MJ | 30 Lattice core, 300 Servo | Voidstone and Starsand patches appear |
| Separation | 10,000 MJ | 400 Composite, 200 Processor | Separator, Incinerator, Slagcrete |
| Magnetics | 12,000 MJ | 300 Rare earth, 800 Copper coil | Magnet |
| Void optics | 12,000 MJ | 200 Void glass, 200 Prism | Void lens |
| Gyroscopics | 20,000 MJ | 200 Magnet, 100 Void lens | Gyro, Guidance unit, Hull plate |
| Rocketry | 40,000 MJ | 50 Gyro, 500 Slagcrete, 20 Lattice core | The Spaceport |

### Spaceport (5×5)
- **Build cost:** 10,000 Servo · 5,000 Slagcrete · 2,000 Magnet · 1,000 Frame · 200 Guidance unit. Uses 2 MW.
- Its own build screen: it assembles **rockets** from belted-in parts, then launches them.
- **Rocket:** 20 Hull plates + 2 Guidance units, assembled in 60 s.
- **Launch fuel:** Aether, belted in. Trade-off: Aether spent on launches isn't Aether you ascend with.
  - Orbital Lab module: 500 Aether.
  - Kit run: 300 Aether.
  - Halo Ring segment: 2,000 Aether, +25% per segment already launched.

### Orbital Lab
- First launch: **Lab module** payload (300 Processor · 200 Photonic chip · 50 Gyro · 100 Void lens). Up to 4 modules,
  each one is another launch. Each module works through 1 kit per second (with machine-speed bonuses).
- Shown in the orbit view next to petals and Lattice cores.

### Experiment kits (the science)
Made on the ground, sent up 500 at a time per kit run (one rocket each).

| Kit | Inputs | Time | Machine |
|---|---|---|---|
| Field kit | 2 Circuit + 2 Gear + 1 Magnet | 4 s | Fabricator |
| Void kit | 1 Void lens + 1 Processor + 2 Slagcrete | 6 s | Assembler |
| Stellar kit | 2 Photonic chip + 2 Magnet + 2 Void glass + 1 Gyro | 10 s | Assembler |

### Orbital research (paid in kits, done in orbit)

| Research | Kits | Unlocks / effect |
|---|---|---|
| Stacking | 2,000 Field | Stacker / Unstacker (see 3) |
| Machine modules | 3,000 Field + 1,000 Void | Speed, Yield and Thrift modules (see 3) |
| Mag-rail | 2,000 Void + 500 Stellar | Mag-rail (see 3) |
| Zero-g casting | 2,000 Void | Foundries smelt Voidstone twice as fast |
| Deep tap | 3,000 Void + 1,000 Stellar | One Starsand tile per patch never runs out |
| Ring design | 5,000 Void + 2,000 Stellar | The Halo Ring (see 4) |
| Orbital overcharge (repeats) | 1,000 Stellar ×1.5 per level | Every machine +10% faster per level |

## 3. Throughput without "Mk II everything"
Belts cap a line at about 5 items/s and belt-speed buffs already stack high, so the answer is carrying more per tile
and spending less on hauling, not faster belts.

- **Stacking.** A **Stacker** (1×1) packs 4 identical items into one stack; belts carry stacks like single items;
  an **Unstacker** splits them at the far end. Machines and the Core accept stacks directly once researched. This
  quadruples a line's throughput without touching belt speed, and it's a layout puzzle, not a stat bump.
  Cost: 20 Magnet + 10 Gyro each.
- **Machine modules** instead of Mk II buildings. Every Fabricator, Assembler, Smelter and Foundry gets one slot (Fab
  Mk II and the Foundry two). Modules are made items, tapped into a machine from its info panel.
  - **Speed module:** +50% speed, +100% power use. 4 Gyro + 10 Void lens.
  - **Yield module:** 15% chance of an extra output, −20% speed. 4 Gyro + 10 Magnet + 1 Lattice core.
  - **Thrift module:** −50% power use. 20 Magnet + 10 Slagcrete.
  Modules come back in the refund when a machine is removed.
- **Mag-rail** (the one expensive fast mover). Two **Rail terminals** (3×3) joined by rail tiles in straight
  lines and right angles. A shuttle carries 200 items per trip at 8 tiles/s, then returns. It's for hauling from
  far Voidstone fields and outposts, not for lines inside a factory.
  Cost: terminal 200 Magnet + 50 Gyro + 100 Void glass; each rail tile 4 Magnet + 2 Slagcrete.

## 4. The Halo Ring
The run's megaproject, and a reason to keep a big run going.

- After the *Ring design* research, the Spaceport can build **Ring segments**: 400 Void glass · 200 Magnet ·
  100 Gyro · 300 Composite · 50 Lattice core. Each one is launched on its own rocket with the Aether fuel above.
  Every segment after the first costs 25% more items.
- **12 segments** close the ring. Each one draws a lit arc around the star in the orbit view.
- **Each segment:** +10% power from every source and +3% machine speed for the rest of the run, and +10% Starseeds
  when you ascend.
- **Milestones:**

  | Segments | Reward |
  |---|---|
  | 3 | Pulses travel at full speed everywhere (no slowdown outside the start area) |
  | 6 | Separators give 50% more Rare earth |
  | 9 | Endless day: no night on this moon |
  | 12 | **Ring closed:** ascending from this run gives ×2 Starseeds and a guaranteed Legendary Relic choice. One Crown point the first time ever. |

- A closed ring is shown on the main menu's moon card, and in a run's summary when you ascend.

## 5. Starseed tree: new branches
Today's shop is Seeds (3) + Core size + Trickle (2). Add four branches beside them. Each node needs the one above it
in its branch. Costs are tuned so a ~700-seed ascension buys one or two real nodes.

**Logistics**

| Node | Levels | Cost | Effect |
|---|---|---|---|
| Light fittings | 1 | 40 | Splitters, Sorters and Crossings cost nothing |
| Deep bins | 2 | 60, 200 | Batchers hold 100, then 200, of each item |
| Extra pulse | 2 | 100, 400 | +1 construction pulse at once per level |
| Prefab stackers | 1 | 300 | Stacking is researched from the start (once you reach ascension 2 content) |
| Rail crews | 2 | 400, 1,200 | Mag-rail costs 25% less per level |

**Head start**

| Node | Levels | Cost | Effect |
|---|---|---|---|
| Starter crate | 1 | 80 | Begin with 4 Drills, 4 Smelters and 2 Fabricators in a crate to place free |
| Field notes | 3 | 100, 300, 900 | Keep tier 1, then tier 2, then tier 3 research when you ascend |
| Warm grid | 1 | 250 | Begin at grid tier 1 and furnace tier 1 |
| Blueprint stock | 1 | 500 | Placing a saved blueprint's conveyors needs no pulses |

**Fortune**

| Node | Levels | Cost | Effect |
|---|---|---|---|
| Wider draw | 1 | 200 | Choose a Relic from 4 instead of 3 |
| Reroll | 2 | 150, 500 | Reroll a Relic offer once per pick, then twice |
| Lucky stars | 2 | 400, 1,200 | Epic and Legendary Relics turn up 1.5×, then 2× as often |
| Relic forge | 1 | 800 | Trade 3 Relics of one rarity for a random one a rarity higher |

**Deep space** (needs ascension 2 content)

| Node | Levels | Cost | Effect |
|---|---|---|---|
| Void sight | 1 | 150 | Voidstone patches can appear within 80 tiles of the Core |
| Rich sand | 3 | 100, 250, 600 | Separators give 25% more Rare earth per level |
| Pad crew | 3 | 200, 500, 1,200 | Launches need 20% less Aether per level |
| Long-haul labs | 3 | 300, 800, 2,000 | Orbital Lab modules work 25% faster per level |

## 6. Build order (suggested)
1. Starsand + Separator + Slag/Slagcrete + Incinerator, Voidstone + Void glass, Magnet, Void lens, and the ground
   research for them. On its own this gives a meaningful sorting puzzle and new sinks.
2. Spaceport, rockets, Orbital Lab, kits, orbital research (Stacking, modules, Mag-rail, the repeatable).
3. Halo Ring.
4. Starseed branches, alongside 1–3 as the things they boost arrive.

## Back burner: daily moon scores
- First, the owner plays a few dailies to see what a good time looks like, then add bonus tiers (e.g. Candy-style
  rewards or Starseeds for beating a target time) without a public board.
- Public board later: Cloudflare Worker + D1 (free), `POST /daily` {day, name, time, save code}, `GET /daily/:day`,
  rate-limited, with save codes kept so suspicious runs can be checked.

---

## Ideas backlog (2026-11-02, not built yet)

### Mag-rail: how several stations behave today
- Each **sending** terminal has one shuttle. It leaves when 200 items are loaded, or after 6 s idle with anything
  loaded, and goes to the **nearest receiving terminal along the track** (shortest path by tiles). It unloads as much
  as fits (receivers hold 800), then comes back.
- Several senders can share track and a receiver; shuttles pass through each other (no collisions or signals).
- A sender never chooses: on a branched network it always serves its nearest receiver. Cargo is mixed, first in,
  first out; receivers push out of three slots on their bright edge.

### Mag-rail customization
1. **Destination**: label terminals (A, B, C… or a colour) and pick "Nearest" or a named receiver on a sender.
2. **Cargo filter** on receivers (one or more items); a sender splits each load by filter, so one line can feed
   several factories.
3. **Departure rule**: when full / at N items / every N seconds / when the receiver runs low (on demand).
4. **Two-way terminal**: send and receive in one building.
5. **Multi-stop route**: a shuttle visits a list of stations in order, loading and unloading by filter.
6. **Shuttle upgrades** (research or Nova): capacity 200→400→800, speed, 2–3 shuttles per terminal.
7. Selecting a terminal highlights its route and destination on the map.

### Nova shard sinks
- **Nova resonance** (tree, 5 lv): the Deep Drill power sequence starts one Fibonacci step later per level.
- **Nova echo** (5 lv): Deep Drills have a 5% chance per level to mine 2.
- **Nova crucible** (5 lv): Foundries +20% speed per level.
- **Nova reactor** (5 lv): Aether Reactors +20% power per level.
- **Nova still** (5 lv): Refineries need 5% less ore per level.
- **Nova sparks** (3 lv): Nova shard drops +50% per level.
- **Nova haul** (3 lv): Mag-rail shuttles carry +100 per level and move 25% faster.
- **Nova silo** (3 lv): rockets assemble 10 s faster per level.
- One-offs: **Nova heart** (Core 9×9), **Nova seed** (Voidstone patches get seed tiles), **Nova keel** (keep one
  built Spaceport's Lab modules when you Ascend), **Nova lens** (Deep Drills on Voidstone ×2).
- Costs about 5–40 shards a level, growing.

### Orbital research list (aimed at ascension 5+, ~10k lifetime Starseeds, ~10 Relics)
Kits: F = Field (red), V = Void (purple), St = Stellar (yellow). Costs assume 4 labs and big kit lines.

| Research | Kits | Effect |
|---|---|---|
| Survey drones II | 6k F | Every ore patch holds 25% more |
| Prefab pulses | 4k F | Construction pulses 50% faster |
| Bulk logistics | 6k F | Batchers hold 2×; Splitters and Sorters pass 2 items a tick |
| Field kits II | 8k F | Field kits craft 2 at once |
| Void tempering | 6k V | Void glass and Void lenses craft 50% faster |
| Clean lattice | 10k V | Lattice cores no longer need an Aether husk |
| Rare sieve | 6k V | Separators give +10 points of Rare earth |
| Void kits II | 8k V | Void kits craft 2 at once |
| Solar sails III | 6k St | Sail petals give 32 kW |
| Star tether | 8k St | Solar keeps 50% at night |
| Stellar kits II | 10k St | Stellar kits craft 2 at once |
| Mag-rail capacity | 4k F + 4k V | Shuttles carry 400 |
| Rail express | 6k F + 6k V | Shuttles twice as fast |
| Hardened hulls | 5k F + 5k V | Rockets need a third fewer Hull plates |
| Ring efficiency | 8k V + 8k St | Ring segments cost 20% less |
| Stellar refining | 8k V + 8k St | Refineries need 25% less ore |
| Aether condensers | 6k V + 6k St | Aether Reactors +50% power |
| Orbital relays | 5k F + 5k St | Pulses twice as fast everywhere |
| Sky trickle | 6k F + 6k St | Trickle ×2 |
| Launch cadence | 4k F + 4k St | Launch Rings twice as fast |
| Relic attunement | 15k each | Relic choices show one more option |
| Deep core | 10k each | Deep Drill power sequence grows half as fast |
| *Repeat:* Orbital flow | 2k F + 1k St, ×1.5 | Conveyors +5% per level |
| *Repeat:* Deep harvest | 2k F + 1k V, ×1.5 | Drills +10% per level |
| *Repeat:* Stellar yield | 1k V + 2k St, ×1.5 | All power +10% per level |
| *Repeat:* Starseed bloom | 3k each, ×1.8 | +5% Starseeds when you Ascend, per level |

**Built 2026-11-02:** Mag-rail labels / destinations / receiver filters and Wider shuttles, Rail express, Big
terminals; all Nova upgrades above (output ones at 10%/level) plus Nova grant (free Deep Drills) and keystone;
"Clean lattice" became the repeat **Husk reclaim** (+5%/level chance the husk goes back to storage, max 20); the
orbital list above (Aether condensers at +25%, Bulk logistics = Batchers ×2 and Uplinks +50%).

### Next ideas: mechanics, resources, goals
**Mechanics**
- **Core contracts**: the Core posts timed orders ("400 Motors in 10 minutes") for Starseeds, Nova shards or Relic
  shards. Gives every phase of a run short goals.
- **Moon surveys**: each moon rolls 3 objectives (e.g. "launch 5 rockets", "close 3 ring segments", "reach Flow 2")
  worth bonus Starseeds when you Ascend.
- **Tunnels**: underground conveyor pairs that hop up to 6 tiles, the ground-level answer to Mag-rail.
- **Warehouse**: a 3×3 store with item filters and a set output rate, for buffering big lines.
- **Drone hub**: ferries items between buildings within a radius; slow but needs no belts. Late game.
- **Heat and coolant**: Foundries, Separators and Reactors run hot; coolant (from Ice) lets them overclock +50%.
- **Meteor showers**: an event that drops rich temporary patches of a random ore somewhere on the map.

**Resources and items**
- **Ice** (new ore on cold moons) → **Coolant**.
- **Helium-3**: a rare Separator output → **Fusion cell** → a Fusion Reactor (huge power, needs coolant).
- **Geodes**: rare Deep Drill finds that crack into **Relic shards**; spend shards to reroll or upgrade a Relic.
- **Quantum chip** (photonic + Void cell + Rare earth), the top-tier part for new buildings and the next megaproject.

**Goals**
- **Dyson swarm**: a megaproject after the Halo Ring, needing Quantum chips and Fusion cells. Each node gives power
  and, when complete, a new prestige currency.
- **Achievements** with small permanent bonuses (first rocket, 1 GW, 100 Relics forged…).
- **Galaxy map**: pick the next moon from a map of moons with visible traits, working outward through sectors.

### Compression (built 2026-11-05)
- Starseed node `dense` (300, shown from ascension 3). Dense items `D_<item>` for everything except Aether, Ember,
  Nova, husks, kits, petals and Lattice cores (`DENSE_OF` / `BASE_OF` in game.js).
- 5 → 1 dense, worth 2 (deliver/addInv convert to 2 of the base). Every consumer takes a dense item as 2 units in
  either mode. Dense mode (`b.dn`) on Drill, Deep Drill, Smelter, Foundry, Fabricator, Assembler: 5× inputs per batch,
  1.5× time, dense output; drills dig 5 ore per dense ore. Compressor 1×1 inline,
  pack 5→1 or unpack 1→2, 0.5 s. One level only for now; a packed tier (5 dense → worth 4) is the obvious next step.

### 2026-11-10
- Compression tiers: `TIN=[1,5,20]` inputs, worth `[1,2,4]`, machine time `TT=[1,1.5,2.25]`; drills ignore TT.
  Packed items `P_<item>` (`PACK_OF`), SS `dense` level 2. Compressor modes 0 dense / 1 packed / 2 unpack.
- Aether Reactor: 40 MW, 10 s per Aether, +25% per touching reactor (`reactorMul`, `b.nb`), fuel 10; `NOVA_P` /12.
- Open question: Refinery ratio and speed (see chat 2026-11-10): ratio by ascension, higher floor, flat speed.
