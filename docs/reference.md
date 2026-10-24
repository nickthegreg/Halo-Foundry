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

Drill reach: 3×3 around it. Deep Drill: 6×6 around its 2×2 body, mines 2.5× as fast and uses up ore half as fast.

## Smelting (1 ore → 1 product)

| Ore | Makes | Time | Smelter | Foundry (×4) |
|---|---|---|---|---|
| Ferrite ore | Iron ingot | 0.8 s | 1.25/s | 5/s |
| Cuprite ore | Copper ingot | 0.45 s | 2.22/s | 8.89/s |
| Silica sand | Glass | 1.6 s | 0.63/s | 2.5/s |

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

Inputs per second = output per second ÷ output count × each input amount.

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
