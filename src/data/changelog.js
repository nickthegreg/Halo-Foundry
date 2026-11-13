// Player-facing update notes, newest first. Bump `n` for every update worth announcing:
// players who have seen an older `n` get a "What's new" card the next time they open the game.
export const CHANGELOG=[
  {n:61,date:'2026-11-13',title:'Fixed: game stopped with a new Spaceport mission',items:[
    'Fixed: if a Spaceport was set to one of the new missions (Deep Array dish, Seed Ark module or Swarm node), the game stopped on load: nothing moved and nothing ran. The Spaceport now shows an icon for every mission.'
  ]},
  {n:60,date:'2026-11-13',title:'A safety net',items:[
    'If something in the game breaks, you now see what went wrong instead of a frozen screen. Saving pauses so your last good save is kept, the map stays movable, and a button copies your save code to send in.'
  ]},
  {n:59,date:'2026-11-12',title:'Somewhere to keep things',items:[
    'The Deep Core Bore now keeps what it brings up: up to 5,000 each of Heavy metal, Magma glass and Helium-3, waiting until a conveyor takes them. You don’t have to belt them anywhere until you need them, and nothing is lost when you reload. Its panel also says what each one is for.',
    'New building: the Stockpile (2×2, unlocks with the Batcher). It holds up to 2,000 of one kind of item and feeds them back out of its bright edge whenever something there will take them. Put one after a machine whose output you can’t use yet, or in front of one to keep it supplied.'
  ]},
  {n:58,date:'2026-11-12',title:'Deep Core Bore gets its own output',items:[
    'The Deep Core Bore now has a bright edge, like a Foundry. Heavy metal, Magma glass and Helium-3 each come out of their own colour-marked slot in the middle of it, so each can go straight onto its own conveyor with no sorting.',
    'Stage materials go in on the other three sides; the bright edge no longer takes anything in. A Bore you’ve already built keeps the way it was facing: tap it and use Rotate to point its bright edge where you want it.'
  ]},
  {n:57,date:'2026-11-12',title:'Machines keep up with fast conveyors',items:[
    'Fixed: machines couldn’t load a fast conveyor at its full speed. Anything a machine put onto a belt was capped at 15 items a second per line, however fast your conveyors were, so a full Separator, Foundry or Deep Drill fell well short. Machines now fill a line right up to the conveyor’s speed.'
  ]},
  {n:56,date:'2026-11-12',title:'Commissions, Nova shards to the Core, and a fairer daily score',items:[
    'Market contracts no longer pay Relics. Instead, after every 12 contracts the Patron offers a commission: about a million ore’s worth of your best parts, often dense or packed, for a Relic, 3 Nova shards and a pile of Starseeds. Each commission asks for more than the last.',
    'New contracts arrive a little less often. In exchange, clients have a few unannounced extras: fill an order quickly, keep a regular happy, or please an odd one, and see what happens. Huge timed contracts now pay 2 Nova shards.',
    'Nova shards are now real items. Reactors push them out of their bright edge along with husks: belt or Uplink them to the Core to bank them. Uplinks never duplicate Nova or Ember shards.',
    'The Nova workshop costs more and goes further: most upgrades cost about twice as much and have more levels (Nova bore up to 20, echo, crucible and reactor up to 10, and more). Two long new ones: Nova forge (+2% machine speed per level, 25 levels) and Nova prism (+3% Starseeds per level, 20 levels). Levels you already own are kept.',
    'Daily moon scoring: parts deeper in the recipe tree score more (up to about double), petals and Lattice cores launched score double their value, and every upgrade, research and grid or furnace tier you buy scores what it cost. The results screen shows where your points came from.'
  ]},
  {n:55,date:'2026-11-12',title:'Overcharge has a price, and Nova packs it in',items:[
    'Overcharge research now makes machines draw 10% more power per level, as well as working 5% faster. Deep Drills and Incinerators are left out: they already have their own steep power costs.',
    'Nova press (Nova workshop, needs Compression): Deep Drills in Dense or Packed mode need 15% less ore per dig per level, up to 3 levels. At the top, a dense dig takes 3 ore instead of 5 and a packed one 11 instead of 20.',
    'Nova overpack (needs Compression): each Dense dig of a Deep Drill has a 6% chance per level to come up Packed instead, worth 4 rather than 2, up to 30%.'
  ]},
  {n:54,date:'2026-11-11',title:'The halo, up close',items:[
    'Tap the little star at the top left to see your halo: every sail petal and Lattice core in orbit around the star, your Halo Ring and Dyson swarm, drawn live.',
    'Every moon you build on circles that same star. From now on, when you Ascend, the moon you leave stays on the halo view, with its petals and cores still turned toward it. Tap any moon to see what it left in orbit.',
    'Moons you left before this update show up too, but without their petals, because those weren’t recorded at the time.',
    'Progress is still a tap away, from the goal at the top or the button on the halo view.'
  ]},
  {n:53,date:'2026-11-10',title:'Select more, mis-tap less',items:[
    'Select now sets more things on everything in the box at once: Normal, Dense or Packed mode on drills and machines, the chosen item on Sorters, and a quarter turn for all machines.',
    'Opening a building’s panel no longer presses whatever recipe or option appears under your finger. The panel ignores taps for a moment as it opens.',
    'A drill’s “Runs dry in about…” now accounts for Dense and Packed mode, which use ore 5 and 20 times as fast.'
  ]},
  {n:52,date:'2026-11-10',title:'Tidier menus, a proper guide and an FAQ',items:[
    'The Menu is now four tabs: Factory (this moon’s upgrades, Production, bottleneck markers), Powers (Ascension, Commander, Crown, Nova workshop), Guide and Settings.',
    'New Guide: a rewritten How to play that explains where the game is heading, a Questions tab with answers to the things people get stuck on, and a “What now?” hint that tells you your next step from wherever you are.',
    'Ascension and Progress are tabbed too, so the Starseed shop, Relics, tiers and achievements are a tap away instead of a long scroll. The Ascend button now sits at the top with a plain list of what you keep and what you leave behind.',
    'Every building has a new description that says what it’s for as well as how it works, and the tutorial goals each come with a hint. New players get a short “first five minutes” instead of a wall of rules.'
  ]},
  {n:51,date:'2026-11-10',title:'Galaxy map and new megaprojects',items:[
    'Galaxy map: when you Ascend you now choose your next moon on a map of 60 moons in 5 rings. Travel to any moon next to one you’ve visited. Moons farther out carry two modifiers and pay up to 40% more Starseeds. Some moons are rich in one ore. Open it any time from the Ascension panel.',
    'Special moons: Derelict (wrecks near the Core to salvage for parts), Bazaar (Market pays double, one more contract), Anomaly (a Rare or better Relic when you land) and Storm moon (30% less solar; reach the last milestone within 4 hours for a Rare Relic and +25% Starseeds).',
    'Visit every moon of a band (Near, Mid, Far) in a quadrant for a permanent perk: machine speed, power, ore or Starseeds, +5%, +10% and +15%.',
    'Space Elevator (Spaceport tier, 5×5): built in 8 belt-fed stages. Each stage cuts the Aether that launches burn by 6%.',
    'Deep Core Bore (Separator tier, 5×5): sunk in 6 belt-fed stages. It brings up three new resources from every side: Heavy metal, Magma glass (stage 3) and Helium-3 (stage 5). Reaching the heart earns the Moonheart Relic the first time, a Relic choice after that.',
    'New parts made in the Assembler: Quantum chips (photonic, Void cell, Rare earth, Magma glass) and Fusion cells (Helium-3, Heavy metal, Void glass).',
    'New Spaceport missions. Deep Array dish (up to 3, kept forever): see one link farther on the galaxy map. Seed Ark module (up to 5 per moon): carries up to 5,000 items of cargo to your next moon (dense items count as one). Swarm node (after you’ve closed a Halo Ring): +5% power and +4% Starseeds each, and every 8 nodes earn a Starlight.',
    'Starlight buys permanent perks in the Ascension panel: more power, faster machines, more Starseeds and bigger Ark holds.',
    'Seven new achievements.'
  ]},
  {n:50,date:'2026-11-10',title:'Market Uplink, Moon objectives, banes and achievements',items:[
    'New building after the last milestone: the Market Uplink (5×5, one per moon). Clients post 2 to 5 open contracts for goods you belt in from any side. Fill one and they pay Starseeds plus a bonus: a speed, conveyor, power or drill boost for this moon, extra Starseeds when you Ascend, Ember shards, a load of goods, Nova shards, and now and then a Relic. Clients remember you across moons and come back with bigger orders, and two odd ones want strange things.',
    'Timed contracts: one is offered every hour, from Small to Huge. Accept it and you have an hour to fill it. Bigger ones pay much more, Large ones add a Nova shard and Huge ones a Relic.',
    'Anything the contracts don’t need goes on to the Core, so a finished contract never jams the belt.',
    'Moon objectives: every moon in the main game rolls three goals (Progress panel). Each one done adds 15% to the Starseeds you get when you Ascend, and finishing all three adds another 15%.',
    'Banes: from now on each ascension also asks you to pick one of three permanent drawbacks, such as thinner veins, slower belts or gears that need more iron. They stack, so choose the one that hurts least. Yours are listed in the Ascension panel.',
    '30 achievements, each worth a few Starseeds, at the bottom of the Progress panel. Ones you’ve already earned pay out straight away.'
  ]},
  {n:49,date:'2026-11-10',title:'Compressor retired',items:[
    'The Compressor is gone, so machines and drills do the packing themselves in Dense and Packed mode. Any Compressors you built are removed and their cost refunded.'
  ]},
  {n:48,date:'2026-11-10',title:'Packed items and faster Reactors',items:[
    'Drills in Dense mode now dig at full speed: 5 ore per dig for a dense ore worth 2. Only machines take longer in Dense mode (1.5×).',
    'New second level of Compression (1,200 Starseeds): Packed. A packed item is worth 4 and costs 20. Drills dig 20 ore per packed ore at full speed, and machines take 20× the inputs at 2.25× the time. The Compressor gets a Packed mode, and its Unpack mode handles both.',
    'Machine panels now show the real cost in Dense and Packed mode. A Dense motor reads 15 gears, 5 steel and 40 wire in, 1 dense motor out, with the per-second rates to match.',
    'Aether Reactors burn one Aether every 10 seconds instead of every 2 minutes, make 40 MW instead of 10, and hold 10 Aether. Each one gets +25% for every other Reactor lined up against one of its sides, up to +100%.',
    'Nova shards drop at about the same rate per Reactor as before (1 in 1,200 Aether now that they burn faster).'
  ]},
  {n:47,date:'2026-11-05',title:'Dense items work everywhere',items:[
    'Dense items now act like a stack of 2: every machine takes them as 2 of the plain item, in either mode. That covers Smelters, Foundries, Fabricators, Assemblers, Refineries, Separators, Combustors and Turbines.',
    'Dense mode now only changes what a machine makes. It uses 5× the inputs per batch, plain or dense, runs 1.5× longer, and makes dense output.',
    'Sorter and Rail Terminal filters set to an item also catch its dense version, and the filter lists no longer show dense items separately.'
  ]},
  {n:46,date:'2026-11-05',title:'Compression',items:[
    'New Starseed upgrade from ascension 3: Compression (300 Starseeds). It unlocks the Compressor and a Dense mode on Drills, Deep Drills, Smelters, Foundries, Fabricators and Assemblers.',
    'A dense item is made from 5 and is worth 2 wherever it lands: at the Core, through Uplinks, in machines and in the Spaceport. Each belt slot carries twice as much.',
    'Switch a machine with Normal / Dense ×2 in its panel. In Dense mode, drills use 5 ore per dig, and machines take only dense inputs and make dense output, 1.5× slower. Machines in Dense mode show a small violet dot.',
    'The Compressor (1×1) sits in a conveyor line and packs 5 of an item into 1 dense, or unpacks 1 dense into 2.'
  ]},
  {n:45,date:'2026-11-05',title:'❄️ Winter is here',items:[
    'The Halloween ground has packed up for the year. In its place is a Winter ground: fresh snow and drifts, frozen ice patches, snow-capped pines (some strung with lights and a star), snowmen, wrapped presents and candy canes.',
    'On the Winter ground, snow drifts down across the screen, an aurora glows in the sky beyond the frontier, and the panels get a touch of frost.',
    'Turn it on in Menu → Ground → Winter. If you were using the Halloween ground, you’re on Winter already. It only changes the look: your ore, buildings and save stay the same.'
  ]},
  {n:44,date:'2026-11-02',title:'Smarter Mag-rail, more Nova, more orbital research',items:[
    'Rail Terminals have letters. A sender can go to the nearest receiver that takes its load (Auto) or always to a letter you pick. A receiver can accept only chosen items, so one line can feed several factories.',
    'New Mag-rail research: Wider shuttles (300 a load), Rail express (50% faster) and Big terminals (twice the storage).',
    'Thirteen new Nova workshop upgrades. Nova resonance slows the Deep Drill power climb and Nova grant gives free Deep Drills. Echo, crucible, reactor, still, sparks, haul and silo each add about 10% a level. One-offs: Nova heart (9×9 Core), seed (Voidstone seed tiles), lens, lantern and keystone.',
    'Over 20 new orbital projects, including Survey drones, Prefab pulses, Bulk logistics, Void tempering, Rare sieve, Solar sails, Star tether, kit lines, Hardened hulls, Ring efficiency, Stellar refining, Aether condensers, Orbital relays, Sky trickle, Launch cadence, Relic attunement and Deep core.',
    'New repeating orbital research: Husk reclaim (a growing chance that Lattice cores send their husk back), Orbital flow, Deep harvest, Stellar yield and Starseed bloom.',
    'Orbital research is now grouped: repeats first, then projects you can study, then locked, then done.'
  ]},
  {n:43,date:'2026-11-02',title:'Ladder and Deep Drill changes',items:[
    'Past Overclock 4 the grid ladder alternates: Overclock tiers make machines 8% faster (was 10%), and new Flow tiers make conveyors 5% faster.',
    'Each Deep Drill draws more power than the last, on the same 1, 1, 2, 3, 5, 8… climb as its Ember cost (× 40 kW). Each drill’s panel shows what it draws, and Nova cooling still helps.',
    'When you Ascend, the Ember shards you spent on Deep Drills come back to you.'
  ]},
  {n:42,date:'2026-11-01',title:'Raised Mag-rail',items:[
    'Mag-rail is now raised track. It passes over buildings and conveyors, and Pylons hold it up on open ground at least every 5 tiles. Pylons are placed for you as you lay track.',
    'Lay it like conveyors: Line, Free or Route (the mode button next to the bar). Route finds a path with room for Pylons. While you drag, a preview shows where Pylons go and what it costs.',
    'Removing on a rail tile takes the track off first. A Pylon can only be removed once nothing rests on it.',
    'Existing Mag-rail becomes raised track with a Pylon under every tile it already used.'
  ]},
  {n:41,date:'2026-10-30',title:'Map fix',items:[
    'The map works again on moons with Starsand and Voidstone, and shows both ores.'
  ]},
  {n:40,date:'2026-10-29',title:'Daily moon rewards',items:[
    'You can finish a daily moon run early from the Menu. Your score locks and the results screen opens.',
    'Daily rewards, claimed once a day: playing at all gives 1 hour of offline production for a save of your choice. 100k points adds another hour, and 250k a third hour plus a Nova shard. 500k gives a Relic choice, and at 1M that choice is Rare or better.',
    'Only your first attempt each day counts for the prize, and it’s claimed once. That attempt locks when it finishes or when you restart it; later runs that day are practice. Tiers stack, and Relic choices wait in the save you sent them to.'
  ]},
  {n:39,date:'2026-10-28',title:'Starseeds keep scaling',items:[
    'Lifetime Starseeds no longer flatten out. Past about 1,100 the ore and duplication bonuses keep growing with the square root of your total, with no cap: around +276% ore and 74% duplication at 10,000 Starseeds, +874% ore and 233% duplication at 100,000. Below that, nothing changes.',
    'Duplication over 100% gives guaranteed extra batches from Fabricators and extra items from Uplinks, plus a chance at one more.'
  ]},
  {n:38,date:'2026-10-28',title:'A real launch silo',items:[
    'The Spaceport is now a 7×7 launch silo with fuel tanks, a service gantry and a rocket you can watch being built, then lift off in a plume of smoke.',
    'Rockets take 60 seconds once everything is loaded, and machine speed bonuses don’t change that. Launch logistics halves it. The silo draws 1 GW while it stands and 10 GW while a rocket is being built.',
    'Launches cost more (30 Hull plates and 4 Guidance units per rocket, more Aether), and everything has to be belted in.',
    'You start with room for one orbital lab. Second, Third and Fourth lab research costs 500 Field, Void and Stellar kits. Early orbital research uses one colour of kit; the big projects mix them. New: Void sieve (faster Separators) and Stellar weave (+25% orbital power).',
    'Incinerators draw 1 GW while they burn. Belting or Uplinking spare Slag to the Core is usually better.',
    'Voidstone mines, smelts and crafts much more slowly, and has a new use: Void cells, needed for Guidance units, Lab modules and Ring segments. Magnets take longer to make.',
    'If you had already built a Spaceport, it may not fit at its new size: its cost is refunded so you can place it again.'
  ]},
  {n:37,date:'2026-10-26',title:'Faster full conveyors',items:[
    'Full conveyor lines now actually move as many items as the max they show. Before, fast conveyors lost time at every tile: a line rated 12.4 items/s only moved about 10, and faster ones lost even more.'
  ]},
  {n:36,date:'2026-10-26',title:'The late game: Spaceport, orbital labs and the Halo Ring',items:[
    'From your second ascension on, new moons have two new ores. Starsand goes through a Separator into Rare earth, ores and Slag that you sort with Sorters. Voidstone lies far out, only Deep Drills can mine it, and only Foundries smelt it into Void glass.',
    'New parts: Slagcrete, Magnets, Void lenses, Gyros, Hull plates and Guidance units, plus three Experiment kits. New research at tiers 6 and 7 unlocks them.',
    'The Spaceport builds rockets and launches them with Aether as fuel. Send up Lab modules, then Kit runs, and choose orbital research in the Research panel. It covers Mag-rail, faster rockets, richer far patches, endless Starsand and a repeatable +10% machine speed.',
    'Mag-rail: Rail Terminals joined by track, with a shuttle that hauls 200 items at a time.',
    'The Halo Ring: launch 12 segments for more power, speed and Starseeds. At 9 segments your Starseeds double, and closing the ring earns a unique Relic.',
    'Four new Starseed branches: Logistics, Head start, Fortune and Deep space. They include free Splitters, starting research, Relic rerolls, a Relic forge and cheaper launches.',
    'A Relic you hadn’t chosen yet is no longer lost when you Ascend.'
  ]},
  {n:35,date:'2026-10-26',title:'Hotter burners, tougher ascensions',items:[
    'Bonuses that made fuel burn longer now make burners hotter instead: more power, and fuel burns faster, so you get Ember shards, husks and Nova shards sooner. This covers Kindle, Forge Star, the odd Furnace tiers, the Ember commander tree, and two renamed Relics: Bellows (was Slow Fuse) and Roaring Reactor (was Quiet Reactor).',
    'Each ascension after the first needs a minimum number of Starseeds: 20 for the 2nd, 80 for the 3rd, 180 for the 4th, and so on.',
    'Speedrun challenge: 1 hour now.'
  ]},
  {n:34,date:'2026-10-25',title:'Faster rebuilding after a reload',items:[
    'Unfinished conveyors and Crossings no longer each wait for their own pulse after you reload. Connected runs are built together by one pulse, the way they were when you drew them.',
    'This update also finished every conveyor and Crossing that was still waiting to be built.'
  ]},
  {n:33,date:'2026-10-24',title:'Scrollable storage on PC',items:[
    'On PC, the storage bar at the top now scrolls with the mouse wheel or by clicking and dragging, and shows a thin scrollbar.'
  ]},
  {n:32,date:'2026-10-24',title:'Refund popups',items:[
    'Removing a building now shows a little popup over it with everything that came back to storage: its cost and anything it was holding.'
  ]},
  {n:31,date:'2026-10-23',title:'Real crafting speeds',items:[
    'Fabricators, Fabricator Mk IIs, Assemblers, Smelters and Foundries now show their real speed with every bonus applied: seconds per craft, plus a per-second line of what goes in and what comes out at full power (including duplication).',
    'The recipe picker shows each recipe’s output per second for that machine.'
  ]},
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
