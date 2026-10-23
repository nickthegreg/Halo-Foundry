# Candy Defense: design notes

Halloween event mode, testers only for now (needs the tester password). Code: `src/defense.js` (rules, UI),
`src/defense-art.js` (pixel sprites), monsters and event dates in `src/data/event.js`, sounds and the
storm ambience in `src/main.js` (`SFX.df*`, `defAudio`). Save key `halo-foundry-defense` (format `v:2`);
Candy and best wave live in `halo-foundry-meta` (`candy`, `dfBest`).

## What's built (2026-10-23)

### The map
- 64×32 tiles of stormy sky. A ~16×16 home island, randomly shaped, sits on the left-middle with moss
  shores and layered cliff faces. Up to five smaller islets generate in the middle.
- Clouds drift; lightning flashes with close thunder; distant rumbles between. Gusting wind with a whistle.
  No music in this mode.

### Losing
- The **candy box** (1,000 health, randomly placed on the home island) or the **commander** dying ends the
  island. You earn Candy = floor(3 × waves held^1.4), then a fresh island starts.

### Economy
- Start with 1,500 sugar. **Geysers** hold 3,000–4,000 each; a new one appears every 40–70 s anywhere on the
  map (land or sky), up to 9 at once. Sky geysers leave an unbuildable husk; land geysers vanish.
- **Grunts** (400) walk to the nearest reachable geyser, take 200, carry it to the nearest drop-off (candy box
  or a finished Outpost), repeat. The **commander** can gather too (300 per trip).

### Bridges and islands
- Four free bridge slots of 1–5 tile pieces; a used slot refills after 2.5 s. ⟳ rotates.
- Bridges must start from an island you hold (home, or an islet with a finished Outpost) or a bridge joined
  to one. Bridges cut off from your network crack and fall after ~25 s.
- **Outpost** (300): claims its island: a drop-off for Grunts and a bridge origin.

### Building
- Commander builds Outposts, Workshops and Altars in person (walk to the site, ~3 s). Everything else is built
  by a pulse that flies from the nearest of the box and your outposts. Unfinished = faded blueprint.
- Towers go on held island ground, or hang over open sky off the side of a held bridge or shore (braced timber
  deck). Never on a bridge tile.
- Power: the candy box powers a 4.5-tile circle; Generators (400) power 6 tiles and must be placed in power.

### Sun Workshop (300) unlocks
- **Generator** (400): power.
- **Disc Thrower** (200): range 5, 6 damage, 3 throws/s, hits walkers and flyers. Wind-up after resting.
- **Sun Cannon** (500): range 12, 30 splash damage every 2 s, fires down one of four directions and turns to
  switch (~0.9 s). Aim zone is petal-shaped: 1 tile wide at the barrel, 4 at full range. Rarely hits flyers.
- Tap a tower (Commander selected) to see its range as animated dotted rings.

### Monsters and waves
- First wave at 75 s, then 30 s after each wave clears. Health ×1.12 per wave.
- Per wave: 10 + 5w skeletons (max 90), from wave 3 3w bats (max 50), a few zombies, ghosts (wave 6+),
  vampires (wave 8+, heal). Pumpkin King boss every 10th wave.
- Walkers follow 1–2 lanes per wave from the right edge, laying **bone bridges** across open sky (~0.7 s per
  tile). Bone bridges crumble 90 s after last use; later waves reuse an old lane half the time.
- Monsters attack whatever is in reach: towers, grunts, commander, box. Everything has health.

### Bosses and the Altar
- A defeated boss floats where it fell. A free Grunt that can reach it hauls it home as a trophy.
- **Altar** (300): with Commander selected, tap it; the commander carries a trophy there and sacrifices it
  for a boon (choose 1 of 3): +2,000 sugar · box +500 max health · towers +25% damage · grunts faster and
  carry more · commander +40% damage/+50% health. Boons last the rest of the island and stack.

### Commander levels from the main game
- Industrialist +8% commander move/attack speed per level · Stellar +15% damage · Ember +15% health ·
  Architect +10% sugar carried (commander and grunts). Read from a copy in META (`META.cmd`).

## Planned

### Roster: ~40 units across 4 workshop types
- Sun Workshop is the first. Three or four of the four workshop types should each have:
  - a **wall/soak tower**: high health, little or no attack, meant to take hits;
  - a **main attack tower** with its own way of fighting;
  - an alternative **collector**: one that flies (ignores bridges) and one that walks, versus Grunts;
  - an **aerial launch base**: no weapon of its own; it launches units that fly out and attack.
- Workshops can be 3×3 or 4×4.
- Start with a few units per workshop unlocked; the rest come from sacrifices.

### Sacrifice rewards and unit ascension
- A sacrifice offers a choice: a **Commander point** or **unlock a new unit** (unlocks kept between islands).
  Open question: does that Commander point go to the main game's Commander or a Candy Defense pool?
- Once every unit is unlocked: **Ascend** back to just the starting units, everything 10% stronger and
  hitting harder, stacking per ascension.

### Background play that still ends in a loss
- Recommended: on return, **replay the time away for real**, fast-forwarded headless with the same rules
  (grunts mine, towers fire, waves come), capped (~8 h), behind a "Replaying the night…" screen.
- Loss happens naturally: offline nobody bridges, claims islets, builds or sacrifices, while waves scale and
  geysers deplete. Strong bases last longer, weak ones fall fast.
- Points per wave survived, live or offline (offline maybe pays a little less). If the island fell offline,
  report the wave it fell at and the Candy earned, then start fresh.
- The headless `tick()` already runs well above real time (25 game-minutes in a moment in tests); chunk it
  with a progress screen.

### Smarter enemies (by wave level)
- **Raid sugar:** monsters steal sugar lying in their path (Grunts carrying it, drop-offs) and carry it off.
- **Guard geysers:** some park at geysers and attack collectors that stray.
- **Build their own turrets** next to geysers they pass, at higher waves.
- **Claim the nearest islands** instead of always heading for the box: target Outposts and islets closest to
  their lane, cutting your network.

### Sound
- Much more to do. Current sounds are synthesized; for real wind/thunder, use recordings the player can
  legally ship (e.g. CC0 libraries) attached as files; the game can play those instead.
- Wanted: building ambience, action sounds for every unit, richer storm layers.

### Other open items
- Wave/boss balance, Candy shop rewards (opens after the event), what Candy buys long-term.
- More boss types and boss frequency.
