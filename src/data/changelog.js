// Player-facing update notes, newest first. Bump `n` for every update worth announcing:
// players who have seen an older `n` get a "What's new" card the next time they open the game.
export const CHANGELOG=[
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
