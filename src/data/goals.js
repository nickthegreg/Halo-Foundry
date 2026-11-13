// Market contracts, Moon objectives, banes and achievements.

// Market clients. Each has a taste in goods (item, weight); they only ask for items you've seen.
// Levels (contracts completed for them) carry across ascensions and grow their requests.
export const CLIENTS={
  brask:{n:'Foreman Brask',lines:['The new spans need feeding.','Another district, another order.','We build, you supply. Simple.'],pool:[['iron',2],['steel',3],['gear',2],['frame',3],['composite',2]]},
  lumen:{n:'Lumen Guild',lines:['The lamps of the guild hall are dim.','We grind light for a living.','Clear glass, clean prisms, please.'],pool:[['glass',2],['lens',3],['prism',3],['film',2],['wafer',2]]},
  vey:{n:'Quartermaster Vey',lines:['Motors. Always motors.','Inventory is low again, Foreman.','Spools and coils for the depot.'],pool:[['copper',2],['wire',2],['coil',3],['motor',3]]},
  ilo:{n:'Professor Ilo',lines:['My thinking engines need more parts.','For science, of course.','The lab eats processors.'],pool:[['circuit',3],['processor',3],['photonic',2],['wafer',2]]},
  harbor:{n:'Harbor Concord',lines:['Bulk orders for the far docks.','Raw and refined, by the ton.','Ships are waiting.'],pool:[['ferrite',2],['cuprite',2],['silica',2],['carbon',2],['iron',2],['copper',2]]},
  sails:{n:'Choir of Sails',lines:['We sing the petals into orbit.','More sails for the halo choir.','The sky could use more shine.'],pool:[['petal',3],['prism',2],['motor',1],['servo',1]]},
  wren:{n:'Old Wren',odd:1,lines:['Don’t ask what it’s for.','Exactly this many. It matters.','A little of this, a little of that.'],pool:'any'},
  // Commissions only (see newCommission in main.js)
  patron:{n:'The Patron',lines:['A monument needs a foundry like yours.','Only the finest, and plenty of it.','Pack it tight. It has a long way to go.'],pool:[]},
  collector:{n:'The Collector',odd:1,lines:['I collect the unusual.','Leftovers? Those are treasures.','Dense things are delightful.'],pool:[['husk',3],['slag',3],['rare',2],['voidglass',2],['starsand',2],['D_gear',2],['D_iron',2],['D_wire',2]]}
};
// Timed contracts: one offer an hour; accept it and you have an hour to fill it
export const TIMED_SIZES=[['Small',.6,1],['Medium',1.2,1.5],['Large',2.5,2.5],['Huge',5,4]];

// Moon objectives: three are rolled for every new moon in the main game. a = ascensions so far.
export const OBJECTIVES={
  grid:{n:a=>`Reach grid tier ${4+a}`,t:a=>4+a},
  furnace:{n:a=>`Reach furnace tier ${3+a}`,t:a=>3+a},
  petals:{n:a=>`Launch ${(200*(1+a)).toLocaleString()} sail petals`,t:a=>200*(1+a)},
  lattice:{n:a=>`Launch ${5+5*a} Lattice cores`,t:a=>5+5*a},
  contracts:{n:a=>`Complete ${3+a} Market contracts`,t:a=>3+a},
  refine:{n:a=>`Refine ${(50*(1+a)*(1+a)).toLocaleString()} Aether`,t:a=>50*(1+a)*(1+a)},
  power:{n:a=>`Run a ${fmtMW(5*Math.pow(2,a))} grid`,t:a=>5000*Math.pow(2,a)},
  research:{n:a=>`Finish ${10+3*a} research projects`,t:a=>10+3*a},
  relics:{n:()=>'Choose a Relic on this moon',t:()=>1}
};
function fmtMW(mw){return mw>=1000?(mw/1000)+' GW':mw+' MW'}
export const OBJ_BONUS=.15,OBJ_ALL=.15; // +15% Starseeds each, +15% more for all three

// Banes: after each ascension you pick one of three. They're permanent and they stack.
export const BANES={
  ore:{n:'Thin veins',d:'Ore patches hold 8% less ore.'},
  belt:{n:'Sticky belts',d:'Conveyors move items 5% slower.'},
  pow:{n:'Power leak',d:'Machines draw 8% more power.'},
  sun:{n:'Hazy sky',d:'Solar, petals and Lattice cores make 6% less power.'},
  cost:{n:'Tariffs',d:'Buildings cost 6% more.'},
  pulse:{n:'Lazy pulses',d:'Construction pulses travel 8% slower.'},
  refine:{n:'Leaky stills',d:'Refineries need 8% more ore.'},
  drill:{n:'Dull bits',d:'Drills mine 5% slower.'},
  fab:{n:'Gummed gears',d:'Every machine works 4% slower.'},
  market:{n:'Hard bargains',d:'Market contracts ask for 10% more.'},
  fuel:{n:'Heavy rockets',d:'Spaceport launches need 10% more Aether.'},
  shard:{n:'Damp coal',d:'Ember and Nova shards drop 10% less often.'},
  seeds:{n:'Heavy heart',d:'5% fewer Starseeds when you Ascend.'},
  wire:{n:'Wire shortage',d:'Each wire craft makes 1 fewer wire (never below 1).',max:2},
  gear:{n:'Soft iron',d:'Gears need 1 more iron.',max:3},
  circuit:{n:'Fussy circuits',d:'Circuits need 1 more wire.',max:3},
  steel:{n:'Impure carbon',d:'Steel needs 1 more carbon.',max:2}
};

// Achievements: each pays a few Starseeds once (per save, kept through ascensions)
export const ACH={
  first_petal:{n:'First light',d:'Launch a sail petal.',s:2},
  petals1k:{n:'Bright halo',d:'Have 1,000 sail petals in orbit.',s:4},
  petals10k:{n:'Blazing halo',d:'Have 10,000 sail petals in orbit.',s:8},
  lattice:{n:'Crown jewel',d:'Launch a Lattice core.',s:3},
  grid5:{n:'Overclocked',d:'Reach grid tier 5.',s:3},
  grid10:{n:'Surging',d:'Reach grid tier 10.',s:6},
  grid15:{n:'Unbound',d:'Reach grid tier 15.',s:12},
  gw:{n:'Gigawatt',d:'Run a 1 GW grid.',s:5},
  gw10:{n:'Ten gigawatts',d:'Run a 10 GW grid.',s:10},
  asc1:{n:'New ground',d:'Ascend for the first time.',s:2},
  asc3:{n:'Wanderer',d:'Ascend 3 times.',s:5},
  asc5:{n:'Drifter',d:'Ascend 5 times.',s:10},
  asc10:{n:'Star nomad',d:'Ascend 10 times.',s:20},
  relics5:{n:'Keepsakes',d:'Hold 5 Relics.',s:3},
  relics15:{n:'Reliquary',d:'Hold 15 Relics.',s:8},
  deep10:{n:'Deep roots',d:'Run 10 Deep Drills at once.',s:4},
  aether:{n:'Distiller',d:'Refine 1,000 Aether in total.',s:4},
  aether100k:{n:'Aether baron',d:'Refine 100,000 Aether in total.',s:10},
  nova:{n:'Supernova',d:'Find a Nova shard.',s:3},
  contract1:{n:'Open for business',d:'Complete a Market contract.',s:2},
  contract10:{n:'Trusted supplier',d:'Complete 10 Market contracts.',s:5},
  commission:{n:'Patronage',d:'Complete a Market commission.',s:10},
  contract50:{n:'Merchant prince',d:'Complete 50 Market contracts.',s:12},
  timed:{n:'Against the clock',d:'Complete a timed contract.',s:4},
  huge:{n:'Tall order',d:'Complete a Huge timed contract.',s:10},
  objectives:{n:'Surveyor',d:'Complete all three Moon objectives on one moon.',s:6},
  dense:{n:'Packing it in',d:'Make a dense item.',s:3},
  rocket:{n:'Liftoff',d:'Launch a rocket from a Spaceport.',s:5},
  ring:{n:'Ringmaker',d:'Close the Halo Ring.',s:15},
  explorer:{n:'Explorer',d:'Visit 10 moons on the galaxy map.',s:8},
  sector:{n:'Cartographer',d:'Earn a sector perk on the galaxy map.',s:6},
  elevator:{n:'Going up',d:'Finish a Space Elevator.',s:10},
  heart:{n:'Heart of the moon',d:'Take a Deep Core Bore all the way down.',s:10},
  ark:{n:'Bon voyage',d:'Launch a Seed Ark module.',s:4},
  shell:{n:'Shell game',d:'Close a shell of the Dyson swarm.',s:15},
  salvage:{n:'Scrapper',d:'Salvage a wreck on a Derelict moon.',s:3},
  daily:{n:'Daily driver',d:'Claim a daily moon prize.',s:3},
  challenge:{n:'Challenger',d:'Win a challenge.',s:5}
};
