// Voyage: the second prestige tier. Build a Starship, leave for a new star, start again with Starcharts.

// Star types. solar/day/patches/rich/seeds multiply the usual; ast = how often asteroids pass and land.
export const STARS={
  yellow:{n:'Yellow star',col:'#ffd77a',solar:1,day:1,patches:1,rich:1,seeds:1,ast:1,d:'A sun much like home. No surprises.'},
  red:{n:'Red dwarf',col:'#ff7a5a',solar:.55,day:2,patches:.85,rich:1.6,seeds:1.2,ast:1,d:'A dim, slow sun. Solar makes 45% less and days last twice as long, but every patch holds 60% more ore.'},
  blue:{n:'Blue giant',col:'#8fd0ff',solar:2.5,day:.75,patches:.45,rich:1,seeds:1.25,ast:1.5,d:'A blazing sun. Solar makes 2.5× as much, but the moon has about half the ore patches, so you’ll lean on asteroids.'},
  binary:{n:'Binary pair',col:'#ffe0b0',solar:1.3,day:.5,patches:.7,rich:1.2,seeds:1.15,ast:1.2,d:'Two suns. Short days, 30% more solar, and fewer but richer ore patches.'},
  white:{n:'White dwarf',col:'#e8f0ff',solar:.35,day:1,patches:.8,rich:1.4,seeds:1.4,ast:1.3,d:'The cooling ember of a star. Solar makes 65% less, so burners and Reactors carry the grid. Pays 40% more Starseeds.'},
  rubble:{n:'Rubble star',col:'#c8a878',solar:.9,day:1,patches:.5,rich:1,seeds:1.3,ast:2.5,d:'A star wrapped in debris. Half the usual ore patches, but asteroids pass and land 2.5× as often.'}
};
// The two roads a Voyage can take. Chosen when you Voyage; lasts until the next one.
export const PATHS={
  float:{n:'Low-gravity moon',hard:0,col:'#9fe8ff',charts:1,seeds:1,d:'Everything floats a little, and stacks itself. Dense mode costs nothing extra here: a dense dig or craft takes just 2 inputs, in the normal time, for an item worth 2. Every drill and machine runs Dense at least, so every conveyor, Uplink and buffer carries twice as much for free. Compression is yours from the start.'},
  heavy:{n:'Heavy world',hard:1,col:'#ff9a5a',charts:2,seeds:2,d:'Crushing gravity. Conveyors and drills run 40% slower, Uplinks lift half as fast for triple the power, and every building costs 50% more. Mag-rail and long conveyors carry the load. Pays double Starseeds, and double Starcharts when you next Voyage.'}
};
// After a Voyage, moons keep this share of their ore patches (times the star's own share); the 4 nearest always stay.
export const VOY_THIN=.6;

// The Helm: permanent upgrades bought with Starcharts. Level n costs cost(n).
export const HELM={
  barges:{n:'More barges',max:5,cost:L=>2+2*L,d:'Each Barge Dock flies one more barge per level. Docks start with one.'},
  holds:{n:'Bigger holds',max:5,cost:L=>3+2*L,d:'Barges carry 50% more ore per level.'},
  thrust:{n:'Thrusters',max:5,cost:L=>3+2*L,d:'Barge round trips are 20% quicker per level.'},
  survey:{n:'Survey',max:4,cost:L=>4+3*L,d:'Asteroids pass 25% more often per level, and are 25% bigger.'},
  landfall:{n:'Landfall',max:4,cost:L=>4+3*L,d:'Small asteroids land on your moon 25% more often per level.'},
  oldlight:{n:'Old light',max:10,cost:L=>5+3*L,d:'+15% Starseeds when you Ascend, per level.'},
  sense:{n:'Star sense',max:1,cost:()=>8,d:'Choose each new star from 4 instead of 3.'},
  crate:{n:'Settler crate',max:1,cost:()=>6,d:'Every moon starts with 4 Drills, 4 Smelters and 2 Fabricators you can place for free.'},
  packed:{n:'Packed memory',max:1,cost:()=>15,d:'Compression is yours from the start of every Voyage: Dense and Packed modes, no Starseeds or ascensions needed.'},
  novamem:{n:'Nova memory',max:4,cost:L=>10+10*L,d:'Keep 25% of your Nova workshop levels per level when you Voyage.'},
  command:{n:'Old command',max:1,cost:()=>30,d:'Keep your Commander levels when you Voyage.'},
  ancestry:{n:'Ancestral shop',max:1,cost:()=>60,d:'Keep everything you bought in the Starseed shop when you Voyage.'}
};

// Asteroids that pass the moon, mined by Barge Docks. mix = ore weights.
export const AST_KINDS={
  metal:{n:'Metallic',mix:{ferrite:5,cuprite:3,iridium:1}},
  carbon:{n:'Carbonaceous',mix:{carbon:6,silica:3}},
  glass:{n:'Glassy',mix:{silica:5,cuprite:2,starsand:2}},
  void:{n:'Void',mix:{voidstone:3,iridium:2,ferrite:2}}
};
