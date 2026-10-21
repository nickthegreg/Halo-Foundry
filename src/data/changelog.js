// Player-facing update notes, newest first. Bump `n` for every update worth announcing:
// players who have seen an older `n` get a "What's new" card the next time they open the game.
export const CHANGELOG=[
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
