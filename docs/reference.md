# Halo Foundry reference

Base numbers from `src/data/game.js`, before any bonuses (grid and furnace tiers, Overcharge, Commander, Crowns,
relics, Starseeds). In-game, machine info panels show the live numbers with every bonus applied.
Regenerate with `node tests/reference.mjs`.

## Buildings

| Building | Size | Cost | Power | Speed |
|---|---|---|---|---|
| Conveyor | 1×1 | 1 Iron ingot | – |  |
| Crossing | 1×1 | 3 Iron ingot, 2 Copper ingot | – |  |
| Drill | 1×1 | 8 Iron ingot, 4 Copper ingot | uses 12 kW |  |
| Deep Drill | 2×2 | 6 Steel, 4 Circuit, 1 Ember shard | uses 40 kW | ×2.5 |
| Smelter | 1×1 | 10 Iron ingot | uses 25 kW |  |
| Fabricator | 1×1 | 12 Iron ingot, 8 Copper ingot | uses 35 kW |  |
| Fabricator Mk II | 2×2 | 10 Composite plate, 4 Servo, 30 Circuit | uses 110 kW | ×2.5 |
| Foundry | 3×3 | 20 Composite plate, 20 Frame, 100 Steel | uses 160 kW | ×4 |
| Splitter | 1×1 | 4 Iron ingot, 2 Copper ingot | – |  |
| Sorter | 1×1 | 4 Iron ingot, 2 Circuit | – |  |
| Batcher | 2×2 | 10 Iron ingot, 6 Gear, 2 Circuit | – |  |
| Combustor | 1×1 | 14 Iron ingot, 6 Copper ingot | makes up to 150 kW |  |
| Sun Leaf | 1×1 | 6 Glass, 3 Circuit | makes up to 45 kW |  |
| Uplink | 1×1 | 8 Steel, 6 Circuit | uses 60 kW |  |
| Launch Ring | 3×3 | 30 Steel, 10 Motor, 20 Lens | uses 120 kW |  |
| Turbine Hall | 3×3 | 40 Steel, 10 Motor, 30 Circuit | makes up to 1.2 MW |  |
| Film Array | 2×2 | 30 Solar film, 6 Frame, 15 Circuit | makes up to 300 kW |  |
| Capacitor Bank | 2×2 | 30 Copper coil, 6 Composite plate, 20 Steel | – |  |
| Prism Collector | 3×3 | 12 Prism, 30 Lens, 20 Steel | makes up to 400 kW |  |
| Pulse Relay | 1×1 | 10 Steel, 10 Circuit, 4 Lens | uses 30 kW |  |
| Assembler | 3×3 | 20 Frame, 40 Circuit, 10 Motor | uses 150 kW |  |
| Refinery | 3×3 | 30 Frame, 60 Steel, 10 Processor | uses 200 kW |  |
| Aether Reactor | 3×3 | 20 Servo, 40 Processor, 60 Frame | makes up to 10 MW |  |
| Separator | 3×3 | 40 Frame, 20 Servo, 80 Composite plate, 200 Steel | uses 400 kW |  |
| Incinerator | 1×1 | 20 Steel, 10 Circuit | – |  |
| Spaceport | 5×5 | 10000 Servo, 5000 Slagcrete, 2000 Magnet, 1000 Frame, 200 Guidance unit | uses 2000 kW |  |
| Rail Terminal | 3×3 | 200 Magnet, 50 Gyro, 100 Void glass | uses 300 kW |  |
| Mag-rail | 1×1 | 4 Magnet, 2 Slagcrete | – |  |
| Core | 3×3 | – | makes 120 kW |  |

Deep Drill cost in Ember shards climbs 1, 1, 2, 3, 5, 8… with each one you own.

## Moving items

| What | Rate |
|---|---|
| Conveyor / Crossing | 1.75 tiles/s, about 5.1 items/s per line |
| Uplink | 4 items/s beside the Core, slower farther away; uses 60 kW + 3 kW per tile from the Core |
| Launch Ring | 1 sail petal every 2.5 s, or 1 Lattice core every 5 s |
| Batcher | holds up to 50 of each item; two outputs |

## Mining

| Ore | Drill | Deep Drill | Ore per tile (before bonuses) |
|---|---|---|---|
| Ferrite ore | 1.2/s | 3/s | 220–340 |
| Cuprite ore | 1.8/s | 4.5/s | 110–190 |
| Silica sand | 0.4/s | 1/s | 250–350 |
| Carbon | 0.22/s | 0.55/s | 3500–5000 |
| Voidstone | – (Deep Drill only) | 0.3/s | 4000–6000 |
| Starsand | 0.6/s | 1.5/s | 400–600 |

Drill reach: 3×3 around it. Deep Drill: 6×6 around its 2×2 body, mines 2.5× as fast and uses up ore half as fast.

## Smelting (1 ore → 1 product)

| Ore | Makes | Time | Smelter | Foundry (×4) |
|---|---|---|---|---|
| Ferrite ore | Iron ingot | 0.8 s | 1.25/s | 5/s |
| Cuprite ore | Copper ingot | 0.45 s | 2.22/s | 8.89/s |
| Silica sand | Glass | 1.6 s | 0.63/s | 2.5/s |
| Voidstone | Void glass | 3 s | – (Foundry only) | 1.33/s |

## Recipes

| Item | Inputs | Time | Made in | Fabricator | Fab Mk II (×2.5) | Assembler |
|---|---|---|---|---|---|---|
| Gear | 2 Iron ingot | 0.6 s | Fabricator, Mk II | 1.67/s | 4.17/s | – |
| Wire ×3 | 1 Copper ingot | 0.4 s | Fabricator, Mk II | 7.5/s | 18.75/s | – |
| Circuit | 1 Iron ingot + 4 Wire | 1.2 s | Fabricator, Mk II | 0.83/s | 2.08/s | – |
| Steel | 3 Iron ingot + 1 Carbon | 2.5 s | Fabricator, Mk II | 0.4/s | 1/s | – |
| Lens | 2 Glass | 1.6 s | Fabricator, Mk II | 0.63/s | 1.56/s | – |
| Motor | 3 Gear + 1 Steel + 8 Wire | 3 s | Fabricator, Mk II | 0.33/s | 0.83/s | – |
| Prism | 1 Lens + 2 Circuit | 3 s | Fabricator, Mk II | 0.33/s | 0.83/s | – |
| Sail petal | 1 Motor + 1 Prism + 2 Steel | 5 s | Fabricator, Mk II | 0.2/s | 0.5/s | – |
| Frame | 2 Steel + 4 Gear | 2 s | Fabricator, Mk II | 0.5/s | 1.25/s | – |
| Processor | 4 Circuit + 2 Glass + 12 Wire | 4 s | Assembler | – | – | 0.25/s |
| Servo | 1 Motor + 1 Processor + 1 Frame | 6 s | Assembler | – | – | 0.17/s |
| Silicon wafer | 2 Glass + 1 Carbon | 2 s | Fabricator, Mk II | 0.5/s | 1.25/s | – |
| Solar film ×2 | 1 Silicon wafer + 2 Glass | 2 s | Fabricator, Mk II | 1/s | 2.5/s | – |
| Composite plate | 2 Steel + 3 Glass | 3 s | Fabricator, Mk II | 0.33/s | 0.83/s | – |
| Copper coil | 4 Copper ingot + 1 Iron ingot | 1.5 s | Fabricator, Mk II | 0.67/s | 1.67/s | – |
| Photonic chip | 2 Silicon wafer + 6 Wire + 1 Lens | 4 s | Assembler | – | – | 0.25/s |
| Lattice core | 2 Photonic chip + 2 Composite plate + 1 Servo + 1 Aether husk | 8 s | Assembler | – | – | 0.13/s |
| Slagcrete | 4 Slag + 1 Carbon | 1.5 s | Fabricator, Mk II | 0.67/s | 1.67/s | – |
| Magnet | 2 Rare earth + 1 Copper coil | 2 s | Fabricator, Mk II | 0.5/s | 1.25/s | – |
| Void lens | 2 Void glass + 1 Prism | 4 s | Fabricator, Mk II | 0.25/s | 0.63/s | – |
| Gyro | 2 Magnet + 1 Servo + 1 Void lens | 8 s | Assembler | – | – | 0.13/s |
| Hull plate | 4 Composite plate + 6 Slagcrete + 2 Frame | 6 s | Assembler | – | – | 0.17/s |
| Guidance unit | 1 Gyro + 2 Photonic chip + 1 Processor | 10 s | Assembler | – | – | 0.1/s |
| Field kit | 2 Circuit + 2 Gear + 1 Magnet | 4 s | Fabricator, Mk II | 0.25/s | 0.63/s | – |
| Void kit | 1 Void lens + 1 Processor + 2 Slagcrete | 6 s | Assembler | – | – | 0.17/s |
| Stellar kit | 2 Photonic chip + 2 Magnet + 2 Void glass + 1 Gyro | 10 s | Assembler | – | – | 0.1/s |

Inputs per second = output per second ÷ output count × each input amount.

## Late game (main game, from ascension 2)

Separator: 1,000 Starsand → 100 Rare earth, 250 ferrite, 200 cuprite, 200 silica, 250 Slag, in 20 s (Rare earth +25% per Rich sand level, +50% from 6 Halo Ring segments, taken from the Slag share).

### Spaceport missions
Every launch needs a rocket (20 Hull plate + 2 Guidance unit, assembled in 60 s) and Aether fuel.

| Mission | Payload | Aether fuel | Notes |
|---|---|---|---|
| Lab module | 300 Processor + 200 Photonic chip + 50 Gyro + 100 Void lens | 500 | Adds an orbital lab. Each one studies 1 Experiment kit a second. Up to 4. |
| Kit run | 500 Experiment kits (1,000 with Launch logistics) | 300 | Carries Experiment kits up to your labs: 500 a launch, or 1,000 with Launch logistics. |
| Ring segment | 400 Void glass + 200 Magnet + 100 Gyro + 300 Composite plate + 50 Lattice core | 2000 | One of the 12 segments of the Halo Ring. Each costs 25% more than the last. |

### Orbital research (paid in Experiment kits)

| Research | Kits | Effect |
|---|---|---|
| Orbital survey | 1,500 Field kit | Voidstone and Starsand patches hold 50% more ore. |
| Launch logistics | 3,000 Field kit + 500 Void kit | Rockets assemble twice as fast, and kit runs carry 1,000 kits instead of 500. |
| Zero-g casting | 2,000 Void kit | Foundries smelt Voidstone twice as fast. |
| Mag-rail | 2,000 Void kit + 500 Stellar kit | Rail Terminals and Mag-rail: a shuttle hauls 200 items at a time from far fields. |
| Deep tap | 3,000 Void kit + 1,000 Stellar kit | Every Starsand patch gets a seed tile that never runs out and regrows the sand around it. |
| Ring design | 5,000 Void kit + 2,000 Stellar kit | The Spaceport can build and launch segments of the Halo Ring. |
| Orbital overcharge (repeats) | 2,000 Field kit + 1,000 Stellar kit ×1.5 per level | Every machine works 10% faster per level. |

### Halo Ring
Each segment: +10% power from every source, +3% machine speed, +10% Starseeds when you Ascend.

| Segments | Reward |
|---|---|
| 3 | Pulses travel at full speed everywhere on the moon. |
| 6 | Separators give 50% more Rare earth. |
| 9 | Starseeds ×2 when you Ascend from this moon. |
| 12 | Ring closed: a unique Relic the first time, a Relic choice every time after. |

## Power and fuel

| Generator | Output | Fuel |
|---|---|---|
| Core | 120 kW | none |
| Combustor | up to 150 kW | 1 carbon per 6 s at full output (0.9 MJ each); about 1 in 50 leaves an Ember shard |
| Turbine Hall | up to 1.2 MW | 1 carbon per 1.5 s at full output (1.8 MJ each) |
| Aether Reactor | 10 MW | 1 Aether per 120 s; leaves an Aether husk each; about 1 in 100 leaves a Nova shard |
| Sun Leaf | up to 45 kW | daylight only |
| Film Array | up to 300 kW | daylight, 40% at night |
| Prism Collector | up to 400 kW | daylight, 25% at night |
| Sail petal in orbit | 8 kW (24 with Halo mirrors) | launched |
| Lattice core in orbit | 1 MW | launched |

Refinery: turns 1,000 ore of any kind into 1 Aether (3 s), needing 1 ore less for every 1,000 Aether ever made, down to 50.
