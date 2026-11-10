// Player guide: the welcome steps, How to play and the FAQ. Plain text and simple tags only.

// First five minutes: shown on the welcome card
export const FIRST_STEPS=[
  'Pick the <strong>Drill</strong> in the bottom bar and tap beside an ore patch. Orange is ferrite, green is cuprite.',
  'Put a <strong>Smelter</strong> nearby, then pick <strong>Conveyor</strong> and drag from the drill’s bright edge to the smelter.',
  'Drag another conveyor from the smelter’s bright edge to the <strong>Core</strong>, the glowing building in the middle.',
  'Watch the goal at the top of the screen fill up. Finish it and new machines unlock.'
];

// How to play: sections of [title, lines]
export const HOWTO=[
  ['The idea',[
    'You run a foundry on a small moon. Drills dig ore, Smelters and Fabricators turn it into parts, and conveyors carry everything to the <strong>Core</strong>.',
    'Whatever reaches the Core counts toward the <strong>goal at the top of the screen</strong> first. After that it goes into storage, and storage is what pays for every building and upgrade.'
  ]],
  ['Building',[
    'Pick a building in the bottom bar, then tap the ground. It appears as a <strong>blueprint</strong>, and the Core sends out a pulse of light to build it.',
    'Every machine pushes its output out of its <strong>bright edge</strong> and takes inputs on its other sides. Turn it with the round arrow button before you place it.',
    'With <strong>Conveyor</strong> picked, drag a finger to lay a line. Dragging across another conveyor adds a Crossing so the two lines don’t mix.',
    'Tap any building with <strong>Inspect</strong> to see what it’s doing, change its recipe or remove it. Removing gives back everything it cost.'
  ]],
  ['Moving around',[
    'Two fingers pan and pinch to zoom. With Inspect picked, one finger pans too. The map button shows the whole moon.',
    'On a computer: drag to pan, wheel to zoom, R turns a building, Esc returns to Inspect, and right-drag always pans.'
  ]],
  ['Power',[
    'Machines need power, shown in the bar at the top left. If the factory asks for more than you make, <strong>everything slows down together</strong>. Nothing breaks: add generators and it speeds back up.',
    'Combustors burn carbon whenever the grid needs it. Solar is free but fades at night. Sail petals in orbit give power day and night, for good.'
  ]],
  ['Ore runs out',[
    'Ferrite, cuprite and silica patches run dry, so expect to move your drills outward as you grow. <strong>Carbon</strong> is slow but nearly endless, so claim the ground around it early.',
    'Later, Deep Drills reach farther and waste less, and the Deep veins upgrade makes every patch last longer.'
  ]],
  ['Where it all leads',[
    '<strong>1. The tutorial</strong> is six goals, ending with sail petals launched into orbit around the star.',
    '<strong>2. The main game</strong> starts there. Two more goals lead to the <strong>Grid Charter</strong>. From then on, spare power is saved as Charge and spent on <strong>research</strong> (tap the top bar), and you climb <strong>grid tiers</strong> by keeping your solar power high, and <strong>furnace tiers</strong> with burners.',
    '<strong>3. Aether</strong> is the far goal of each moon. Refineries crush ore into it, and Reactors burn it for huge power.',
    '<strong>4. Ascending</strong> trades the Aether you’ve stored for Starseeds and moves you to a fresh moon. You start over, but faster every time: Starseeds, Relics and your Commander are permanent.',
    '<strong>5. Deep space</strong> opens from your second ascension: new ores, rockets, orbital labs, a ring around the star, and the galaxy beyond.'
  ]]
];

// FAQ: [question, answer]
export const FAQ=[
  ['My machine has stopped. Why?','Tap it with Inspect: the coloured line under its name says why. Nearly always it’s one of three things. It’s <strong>missing an input</strong> (check what the recipe needs), its <strong>output has nowhere to go</strong> (the conveyor ahead is full, or nothing is at its bright edge), or the grid is <strong>short of power</strong>. Menu → Factory can also mark bottlenecks on the map.'],
  ['Everything is running slowly.','You’re using more power than you make. The power bar at the top left turns red and every machine slows by the same share. Build more generators, or remove machines you don’t need. Solar drops at night, so a factory that’s fine by day can crawl after dark.'],
  ['Which way does a machine face?','Its bright edge is its output. Inputs can come in on any other side. Conveyors show their direction with moving arrows. Use the round arrow button to turn a building before placing it.'],
  ['My ore patch ran out.','That’s normal. Move drills to a fresh patch (removing a building refunds it in full), or reach farther with Uplinks and, later, Deep Drills and Mag-rail. Carbon barely runs down. After you Ascend, Seed veins in the Starseed shop make patches regrow.'],
  ['What are Ember shards for?','About 1 in 50 carbon burned in a Combustor or Turbine Hall leaves an Ember shard. They pay for Deep Drills and for Conveyor speed in Menu → Factory. You keep them when you Ascend.'],
  ['What is Charge, and how does research work?','After the Grid Charter, any power your factory isn’t using fills a Charge bank. Research (tap the top bar) spends Charge and items from storage together. A bigger power surplus means faster research; Capacitor Banks store more Charge.'],
  ['What are grid tiers and furnace tiers?','Two ladders you climb after the Grid Charter. Grid tiers ask you to <strong>hold</strong> a level of solar and halo power; furnace tiers ask the same of burners (Combustors, Turbine Halls, Reactors). Each tier brings a reward, opens more research, and adds 5% to the Starseeds you earn when you Ascend. See them in Progress → Tiers.'],
  ['What do sail petals and Lattice cores do?','Fed into a Launch Ring, they go into orbit for good. Each petal adds power day and night, and petals add up to Constellations, which give <strong>Commander points</strong> (Menu → Powers). Lattice cores add far more power each and build toward Crowns, which give <strong>Crown points</strong>.'],
  ['When should I Ascend, and what do I keep?','You can Ascend once you have Aether in storage, from Menu → Powers → Ascension. Starseeds grow with the square root of the Aether and husks you’ve stored, so the first few come quickly and each extra one costs more: when a moon starts to feel slow, it’s time. You <strong>keep</strong> Starseeds and what you bought with them, Relics, Ember and Nova shards, your Commander and blueprints. Buildings, storage, research, Menu upgrades and tiers <strong>reset</strong>.'],
  ['What are Starseeds, Relics and banes?','<strong>Starseeds</strong> are the reward for Ascending. Just having earned them makes every tile hold more ore and gives machines a chance of free extra output, and you spend them in the Starseed shop. <strong>Relics</strong> are permanent bonuses you choose from a few on offer; they stack. <strong>Banes</strong> are the price of going on: each ascension you pick one small permanent drawback out of three.'],
  ['How does the galaxy map work?','When you Ascend you choose your next moon. You can travel to any moon next to one you’ve visited. Moons farther from home are harder and pay more Starseeds, and some are special: wrecks to salvage, a Market that pays double, a waiting Relic, or a storm to race. Visiting every moon in a band of a quadrant earns a permanent perk.'],
  ['What is the Market Uplink?','A building you can place after the last milestone. Clients ask for goods; belt them in and you’re paid in Starseeds plus a bonus. Regular clients come back with bigger orders, and once an hour a timed contract is offered: accept it and you have an hour to fill it.'],
  ['What are Moon objectives?','Three goals rolled for each moon, shown in Progress → Goals. Each one you finish adds 15% to the Starseeds you earn when you leave, and all three add another 15%.'],
  ['Does the factory run while I’m away?','Yes, at a reduced rate: 20% of your recent output for up to 8 hours to begin with. Night shift and Long haul in Menu → Factory raise both.'],
  ['What are Dense and Packed items?','From your third ascension, the Starseed shop sells Compression. A machine or drill set to Dense takes 5 times the inputs and makes one dense item that counts as 2, so one conveyor carries twice as much. Packed goes further: 20 in, worth 4. Every machine accepts dense items as if they were the plain ones.'],
  ['How do I move my save or play a second game?','Menu → Settings → Save code gives you a code to paste into the game on another device. There are three save slots on the title screen (Menu → Settings → Main menu), plus a Daily moon everyone shares and Challenges with their own Relics.'],
  ['What changes in the late game?','From your second ascension: two new ores (Starsand and Voidstone), the Separator, Mag-rail, and the Spaceport with its missions: orbital labs and research, the 12-segment Halo Ring, Deep Array dishes, Seed Ark cargo for your next moon, and the Dyson swarm. The Space Elevator and Deep Core Bore are huge projects you feed by conveyor.']
];
