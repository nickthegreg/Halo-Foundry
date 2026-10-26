# Late game: design notes (2026-10-26)

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
