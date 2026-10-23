// Player-facing update notes, newest first. Bump `n` for every update worth announcing:
// players who have seen an older `n` get a "What's new" card the next time they open the game.
export const CHANGELOG=[
  {n:30,date:'2026-10-22',title:'Candy Defense: bosses and altars',items:[
    'For testers only, for now.',
    'You start with 1,500 sugar. Grunts cost 400, Generators 400, Disc Throwers 200 and Sun Cannons 500.',
    'If your commander falls, the island is lost, just like the candy box.',
    'The Pumpkin King comes every 10th wave. Defeated, it floats where it fell. Grunts haul it home when they can reach it, and your commander can sacrifice it at an Altar for a boon that lasts the rest of the island.',
    'No music in Candy Defense now, just wind, rain and thunder.'
  ]},
  {n:29,date:'2026-10-22',title:'🎃 Candy Defense, rebuilt',items:[
    'Candy Defense is in testing and only shows up for testers for now.',
    'Candy Defense is now its own mode: open it from the main menu. It no longer uses anything from your main game.',
    'You start on a floating island in a thunderstorm, with a candy box to protect. Send your commander and Grunts to mine candy geysers for sugar, and lay free bridge pieces across the sky to reach them.',
    'Build a Sun Workshop to unlock Generators (power), Disc Throwers (hit walkers and flyers) and Sun Cannons (turn to aim; deadly to walkers, poor against flyers). Monsters attack anything in their way, so everything has health.',
    'Your Commander levels from the main game power up your commander here: Industrialist for speed, Stellar for damage, Ember for health, Architect for income.'
  ]},
  {n:28,date:'2026-10-22',title:'🎃 Candy Defense, Aether husks, Starseed balance',items:[
    'Happy Halloween! New event: Candy Defense (now testers only while it’s rebuilt). Skeletons, zombies, bats, ghosts, vampires and the Pumpkin King come for your candy bucket in ever-stronger waves. Build turrets and Ammo Presses from your main game’s storage; presses keep the turrets around them loaded. It runs while you play. When the bucket is emptied you earn Candy for the waves you held, and the field starts over. Spend Candy in the Candy shop when the event ends.',
    'Aether Reactors now leave an Aether husk for each Aether they burn, pushed out of their bright edge. Husks can’t ride Uplinks. Starseeds now count husks in storage: √(Aether + 3 × husks). Lattice cores need a husk each, and later Conveyor speed levels use them too.',
    'Starseeds’ passive bonus now has diminishing returns: about +1% ore and duplication per seed at first, flattening toward +100% ore and +25% duplication.',
    'You now choose a Relic on every ascension, not every third.',
    'Conveyor speed level 5 now costs 10 Aether (was 1,000).'
  ]},
  {n:27,date:'2026-10-22',title:'Lattice Crowns, burning Aether pays, scarcer silica',items:[
    'Launch Rings now take Lattice cores too. Each one in orbit adds 1 MW of solar, and Halo mirrors still boosts petals. Lattice cores have their own tiers, Crowns, at 5, 10, 25, 50 and 100 in orbit (then doubling). Each Crown gives a Crown point for new upgrades in Menu → Crown: Resonance, Forge, Weave, Overdrive and Distill.',
    'Burning Aether now pays: Starseeds = √(Aether stored + 3 × Aether burned in Reactors), and every grid and furnace tier you reach adds 5% more.',
    'Every furnace tier now also makes machines 5% faster, and furnace tiers past Crucible now grow ×3 (was ×4) to stay reachable.',
    'Silica is scarcer: Drills mine it half as fast, tiles hold half as much, and patches are about two thirds the size.',
    'Fixed: Crossings next to Splitters could jam. Crossings now keep a separate queue for each direction, and Splitters and Sorters never send an item back out the side it came in.'
  ]},
  {n:26,date:'2026-10-22',title:'Research fix in challenges',items:[
    'Fixed: in a challenge, tapping the top bar opened the goal instead of Research. It opens Research again, with the challenge goal at the top and a Goal button for the full breakdown.'
  ]},
  {n:25,date:'2026-10-22',title:'Harder challenges',items:[
    'Challenges have real goals now. Solar only, One thread, Speedrun, Deep roots and Minimalist: refine your first Aether. Speedrun still gives you 2 hours.',
    'Hand-fed: deliver 1,000 of every item up to Aether to the Core, 23 kinds including raw ore, all by conveyor. Tap the top bar during the run to see each item’s progress.',
    'One thread now bans Batchers too.',
    'Challenges you’ve already won stay won. Runs in progress switch to the new goal.'
  ]},
  {n:24,date:'2026-10-22',title:'Relic balance',items:[
    'Cinder Charm now gives +25% Ember drops (was +50%). Green Sprout now makes seeds regrow 20% faster (was 25%).',
    'Challenge Relics are half as strong: Sunbound Sigil, Loom of One Thread, Hands of the Maker, Hourglass Eternal, Deep Crown and Minimalist’s Seal. Ones you already own change too.'
  ]},
  {n:23,date:'2026-10-22',title:'Challenge rewards',items:[
    'Each challenge now awards its own Legendary Relic on your first win, with no random picks. The main menu shows which Relic each challenge gives before you start.'
  ]},
  {n:22,date:'2026-10-22',title:'🎃 Happy Halloween!',items:[
    'Happy Halloween from Halo Foundry! A spooky new ground style is here: crooked gravestones, glowing jack-o’-lanterns, dead trees, toadstools, scattered bones, cobwebs, creeping mist, and bats fluttering overhead.',
    'Turn it on in Menu → Ground → Halloween. It only changes the look: your ore, buildings and save stay the same.'
  ]},
  {n:21,date:'2026-10-22',title:'Cheaper first Deep Drills',items:[
    'Deep Drills now start at 1 Ember shard and climb Fibonacci-style: 1, 1, 2, 3, 5, 8, 13… (was 3, 5, 8, 13…).'
  ]},
  {n:20,date:'2026-10-22',title:'Batchers keep their stock',items:[
    'Batchers now keep everything they’re holding when you reload, including sets that were partway out the door.'
  ]},
  {n:19,date:'2026-10-22',title:'Drills only mine what they can send',items:[
    'Drills and Deep Drills now only mine when something is connected to an output and there’s room to send ore on. They hold at most 1 ore (Deep Drills 2) instead of 2 and 4, and show “Nothing to output into” when nothing is connected.',
    'Deep veins no longer applies to carbon. Ferrite, cuprite and silica patches still last 1.5× longer per level.'
  ]},
  {n:18,date:'2026-10-22',title:'Sorter sides and tutorial challenges',items:[
    'Sorters: choose which side your chosen item leaves from: ahead, left or right. Everything else uses the other two sides. The bright arrow shows the chosen side, and blueprints keep the setting.',
    'Challenges now start from the beginning of the tutorial instead of Heavy Industry. Speedrun is still 2 hours.',
    'Deep roots now starts with Deep Drills unlocked and exactly enough for one. Ember shards for the rest come from burning carbon.',
    'Challenges you’ve already started keep going where you left off.'
  ]},
  {n:17,date:'2026-10-21',title:'Building bar on PC',items:[
    'On a computer you can now scroll the building bar with the mouse wheel, click and drag it sideways, or use the ‹ › arrows at its ends.'
  ]},
  {n:16,date:'2026-10-21',title:'Seed fix',items:[
    'Fixed: Drills on a drained seeded patch kept mining at full speed. They now only mine ore that has actually regrown, and show “Waiting for ore to regrow” in between.'
  ]},
  {n:15,date:'2026-10-21',title:'Slower seed regrowth',items:[
    'Seed tiles now regrow ore 80% slower. A mined-out tile takes about 14 hours to refill fully at base speed. Seed growth upgrades still speed it up by 50% per level.'
  ]},
  {n:14,date:'2026-10-21',title:'Clearer blueprints',items:[
    'Name your blueprints: you’re asked for a name when you save one, with a suggestion based on what it makes, and you can Rename them any time.',
    'The blueprint list now shows what’s inside: each building with its count, what the Fabricators make, Sorter filters and Batcher ratios, and the full cost to place it. Costs you can’t afford yet turn orange.',
    'Blueprint previews show the recipe icon on each machine, and buildings you haven’t unlocked are flagged.'
  ]},
  {n:13,date:'2026-10-21',title:'Main menu, moons, challenges and the daily moon',items:[
    'New main menu when you open the game: Continue, three save slots, the Daily moon, Challenges, save codes and update notes. Menu → Main menu brings it back.',
    'Moon modifiers: when you Ascend, choose one of three moons (or a plain one), such as Rich moon, Long night or Low gravity. Harder moons give more Starseeds when you leave them.',
    'Relics: now 50 of them, from Common to Legendary. Rarer ones turn up less often.',
    'Challenges: six runs from the main game’s start with one rule each, like Solar only or Speedrun. Sign the Grid Charter to win; your first win in each lets you choose a Legendary or Epic Relic that works in every main game.',
    'Daily moon: everyone gets the same moon each day. Deliver as much as you can to the Core in 60 minutes of play; better parts score more. Your best score is saved.'
  ]},
  {n:12,date:'2026-10-21',title:'Starseeds, Relics and the Nova workshop',items:[
    'Menu → Ascension now opens its own screen with the Starseed shop: Seed veins, Seed growth, Seed reach, Core size, and trickle production (which items, and how fast).',
    'Seed veins: a share of ore patches get a glowing seed tile. It never runs out, can’t be built on, and slowly regrows the ore around it, even mined-out tiles.',
    'Every Starseed you have ever earned adds 1% ore to every tile and a 1% chance for Fabricators to make an extra batch and Uplinks to beam an item twice.',
    'Each ascension adds +1 Commander point and +20% Core power. Every 3rd ascension you choose one of three Relics, permanent bonuses that stack.',
    'Nova workshop (in Menu once you find a Nova shard): spend Nova shards on permanent Deep Drill upgrades for speed, reach, ore use and power.'
  ]},
  {n:11,date:'2026-10-21',title:'Ascension',items:[
    'Ascension is here. Once you have any Aether in storage, Menu → Ascension starts you on a new moon at the start of the main game, with everything up to there unlocked.',
    'You earn Starseeds equal to the square root of the Aether in storage. Ember shards, Nova shards, Starseeds and your Commander carry over. Buildings, storage, research, upgrades, petals and tiers reset. Starseed perks are coming next.',
    'Commander: points now carry between moons, and each level of a path costs a little more (1, 1, 2, 2, 3…).',
    'New: Nova shards. Aether Reactors leave one for about every 100 Aether burned.',
    'Refineries now get cheaper much more slowly: 1 ore less per Aether for every 1,000 Aether you’ve made.',
    'Deep Drills are now 2×2 with four outputs: two on the bright edge and two on the back. Existing Deep Drills grow into the space next to them, or are refunded if there’s no room.',
    'Foundries now output through three slots on their bright edge.'
  ]},
  {n:10,date:'2026-10-21',title:'Petals launch offline, stronger Film Arrays',items:[
    'Launch Rings keep launching sail petals while you’re away, at your offline rate. Petals launched offline count toward Constellations and Commander points.',
    'Film Arrays now make up to 300 kW in daylight (was 160) and 120 kW at night (was 32), and cost less: 30 solar film, 6 frames and 15 circuits.',
    'Film Arrays are now the later, better solar: more power per tile and per part than Prism Collectors, which remain the first solar research unlocks.'
  ]},
  {n:9,date:'2026-10-19',title:'Research now saves properly',items:[
    'Fixed: Overcharge and Grid harmonics levels, your current research and its progress, and Halo mirrors reset every time the game loaded. They now save like everything else.',
    'Levels lost before this fix can’t be recovered, sorry. Anything you research from now on stays.'
  ]},
  {n:8,date:'2026-10-19',title:'Research and tiers on screen',items:[
    'The top bar now shows what your current research still needs: Charge and each item. Items turn orange when storage doesn’t hold enough to finish.',
    'New Grid and Furnace tier markers under the power box show progress to the next tier. Tap them to open Progress.'
  ]},
  {n:7,date:'2026-10-19',title:'Constellations and the Furnace ladder',items:[
    'Combustors, Turbine Halls and Aether Reactors now keep their fuel when you save, so power comes straight back when you return.',
    'Every Menu upgrade level now boosts sail petal power by 1%, compounding.',
    'Constellations: every 10, 25, 50, 100 and 200 petals in orbit (then doubling) earns a Commander point. Spend points in Menu → Commander on Industrialist, Stellar, Ember or Architect.',
    'The grid ladder now counts solar power only: Sun Leaves, Film Arrays, Prism Collectors and the halo. Tiers you already reached stay reached.',
    'New Furnace ladder for coal and Aether burners, with its own rewards: longer-burning fuel, stronger burners and more Ember shards. See it under Progress.'
  ]},
  {n:6,date:'2026-10-19',title:'Ground styles',items:[
    'New ground styles: Desert (sand ripples, rocks and scrub) and Grassland (meadow, flowers and stones), alongside the original Moon.',
    'Switch any time in Menu → Ground. It only changes the look: ore, buildings and your save stay the same.'
  ]},
  {n:5,date:'2026-10-19',title:'True mute',items:[
    'Volume at 0 is now silent. The echo on music and effects used to keep playing at 0, which caused a faint constant hum.',
    'With both sliders at 0, sound switches off completely and uses no battery.'
  ]},
  {n:4,date:'2026-10-19',title:'Update notices',items:[
    'This card: after each update, the game shows what changed. Reopen it any time from Menu → What\'s new.',
    'If the game is open while an update lands, a banner offers to load the new version.'
  ]},
  {n:3,date:'2026-10-19',title:'Offline progress',items:[
    'Your factory keeps working while you are away, at 20% of its recent delivery rate, for up to 8 hours. Nothing is used up while you are gone.',
    'New upgrades: Night shift raises offline output (up to 100%) and Long haul extends the time cap (up to 48 hours).',
    'Ongoing research: Overcharge (+5% machine speed per level) and Grid harmonics (+10% power per level) repeat forever.',
    'Deep veins level 5 now costs 1,000,000 wire.'
  ]},
  {n:2,date:'2026-10-18',title:'Research',items:[
    'After the Grid Charter, spare power fills a Charge bank. Spend Charge and parts in the Research tree to unlock buildings.',
    'New parts: Wafer, Film, Composite, Coil, Photonic chip, Lattice core.',
    'New buildings: Fabricator II, Foundry, Film array, Capacitor.',
    'Belt speed and Deep veins upgrades have longer ladders with mixed costs.'
  ]},
  {n:1,date:'2026-10-17',title:'Halo Foundry has a home',items:[
    'The game now lives at nickthegreg.github.io/Halo-Foundry and can be installed to your home screen.',
    'Save codes (Menu → Save code) move a game between devices.'
  ]}
];
export const LATEST=CHANGELOG[0].n;
