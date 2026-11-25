# The Tarrasque (design draft)

Owner's idea, 2026-11-25. Built in update 91 (main.js, "the Tarrasque" block). Decisions: normal Starseeds on the forced
Ascension plus a "turn back time" option; final Bore stage locked until 10,000 shells; 100 batteries × 100 shells;
campaign only; state per save slot in META.tq (0 asleep, 1 woke, 2 slain); tester menu can play either encounter.
Remains: 0.5 Starseeds/s per touching Drill (Deep Drill ×4), 1 Nova shard per 10 min per Drill.

## Encounter 1: the Bore wakes something
Trigger: the Deep Core Bore reaches the heart (final stage) on a campaign moon, the first time ever (account-wide flag).
No retroactive trigger for saves that already reached it.

Scripted sequence (game paused for the player, camera driven, ~60–90 s, skippable after the first watch):
1. The map shakes. Caption: "What's that?"
2. Calm. A few seconds of nothing.
3. Bigger shake. Caption: "An earthquake? A volcano?" Dust and cracks round the Bore.
4. The Tarrasque bursts out beside the Bore. It walks toward the Core, smashing buildings on its path
   (they crumble with sparks and smoke; the destruction is only staged, since the moon ends).
5. "We have to try something!" Every barge the player has flies at it, fires, and is swatted away or exploded.
6. "What else?" Construction pulses fly round it and build a ring of capacitor banks, which overload and explode.
   It flinches, shakes it off and keeps going.
7. "One more thing…" Sail petals and Lattice cores swing into a focusing lens; a burning beam hits it. It seems to work…
8. It reaches the Core and crushes it. Screen fades. "The moon is lost." The player is sent to Ascend (normal rewards).

## Between: artillery
On the next moon a popup: "We've developed artillery."
- **Artillery** building (3×3): holds 100 shells, fires moon-wide. Idle unless the Tarrasque appears.
- **Shell** recipe from existing parts (proposal: steel + slagcrete + heavy metal + a little Iridium).
- Readiness meter: how many shells are loaded across all Artillery. Goal: 100 Artillery × 100 shells = 10,000.
- Proposal: the Bore's final stage is locked until the meter is full, so the second fight can't be lost by accident.

## Encounter 2: the fight
Same opening, then every Artillery fires its shells in volleys; shells arc across the moon and hit it.
Its health bar drops with each volley; it falls before it reaches the Core.

Rewards:
- **Tarrasque remains**: a special ore patch where it fell. Drills on it mine Starseeds and Nova shards straight
  to the Core (rates to be decided).
- **Relic "Slayer"**: +100% Starseeds (unique, kept like other Relics).

## Open questions
- Forced Ascension after encounter 1: normal Starseed rewards, or a bonus for the trouble?
- Lock the final Bore stage until artillery is ready, or let players try and lose again?
- 100 Artillery × 100 shells is a lot to build on a phone; smaller numbers with bigger shells?
- Campaign moons only (not Dailies, not challenges)?
- Name: "Tarrasque" is the D&D spelling; the folk legend is "Tarasque". Keep it, or give it our own name?
