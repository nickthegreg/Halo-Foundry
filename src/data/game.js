// Game data: items, ores, recipes, buildings, milestones and the grid ladder.
const W=384,H=384,CX=192.5,CY=192.5;
const DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
const opp=d=>(d+2)&3;
const BELT_V=1.75, SP=0.34, DAY_LEN=300, PET_GOAL=40, CORE_GEN=120;
const SAVE_KEY='halo-foundry-v2';

const ITEM_ORDER=['ferrite','cuprite','silica','carbon','iron','copper','glass','gear','wire','circuit','steel','lens','motor','prism','petal','frame','processor','servo','aether','ember','nova','wafer','film','composite','coil','photonic','lattice'];
const ITEMS={
  ferrite:{n:'Ferrite ore',s:'ferrite'},cuprite:{n:'Cuprite ore',s:'cuprite'},silica:{n:'Silica sand',s:'silica'},carbon:{n:'Carbon',s:'carbon'},
  iron:{n:'Iron ingot',s:'iron'},copper:{n:'Copper ingot',s:'copper'},glass:{n:'Glass',s:'glass'},
  gear:{n:'Gear',s:'gear'},wire:{n:'Wire',s:'wire'},circuit:{n:'Circuit',s:'circuit'},steel:{n:'Steel',s:'steel'},
  lens:{n:'Lens',s:'lens'},motor:{n:'Motor',s:'motor'},prism:{n:'Prism',s:'prism'},petal:{n:'Sail petal',s:'petal'},frame:{n:'Frame',s:'frame'},processor:{n:'Processor',s:'processor'},servo:{n:'Servo',s:'servo'},wafer:{n:'Silicon wafer',s:'wafer'},film:{n:'Solar film',s:'film'},composite:{n:'Composite plate',s:'composite'},coil:{n:'Copper coil',s:'coil'},photonic:{n:'Photonic chip',s:'photonic'},lattice:{n:'Lattice core',s:'lattice'},aether:{n:'Aether',s:'aether'},ember:{n:'Ember shard',s:'ember'},nova:{n:'Nova shard',s:'nova'}
};
const ORE_KEYS=[null,'ferrite','cuprite','silica','carbon'];
const ORE_COL={ferrite:['#c8622f','#f3a273'],cuprite:['#24a585','#8af0d3'],silica:['#b3a9da','#f6f2ff'],carbon:['#3c3552','#b3a5ef']};
const SMELT={ferrite:'iron',cuprite:'copper',silica:'glass'};
const SMELT_T={ferrite:0.8,cuprite:0.45,silica:1.6};
// rate = ore/s per Drill; lo/hi = ore per tile. Cuprite and ferrite are fast and shallow; carbon is slow and deep.
const ORE_P={ferrite:{rate:1.2,lo:220,hi:340},cuprite:{rate:1.8,lo:110,hi:190},silica:{rate:0.8,lo:500,hi:700},carbon:{rate:0.22,lo:3500,hi:5000}};
const RECIPES={
  gear:{in:{iron:2},out:1,t:0.6},
  wire:{in:{copper:1},out:3,t:0.4},
  circuit:{in:{iron:1,wire:4},out:1,t:1.2},
  steel:{in:{iron:3,carbon:1},out:1,t:2.5},
  lens:{in:{glass:2},out:1,t:1.6},
  motor:{in:{gear:3,steel:1,wire:8},out:1,t:3},
  prism:{in:{lens:1,circuit:2},out:1,t:3},
  petal:{in:{motor:1,prism:1,steel:2},out:1,t:5},
  frame:{in:{steel:2,gear:4},out:1,t:2},
  processor:{in:{circuit:4,glass:2,wire:12},out:1,t:4,at:'asm'},
  servo:{in:{motor:1,processor:1,frame:1},out:1,t:6,at:'asm'},
  wafer:{in:{glass:2,carbon:1},out:1,t:2},
  film:{in:{wafer:1,glass:2},out:2,t:2},
  composite:{in:{steel:2,glass:3},out:1,t:3},
  coil:{in:{copper:4,iron:1},out:1,t:1.5},
  photonic:{in:{wafer:2,wire:6,lens:1},out:1,t:4,at:'asm'},
  lattice:{in:{photonic:2,composite:2,servo:1},out:1,t:8,at:'asm'}
};
const B={
  belt:{n:'Conveyor',cost:{iron:1},dir:1,d:'Moves items one tile at a time. Drag to lay a line that follows your finger. Dragging across another conveyor adds a Crossing.'},
  junction:{n:'Crossing',cost:{iron:3,copper:2},d:'Two conveyor lines pass over each other here. Items leave on the side opposite where they came in.'},
  drill:{n:'Drill',cost:{iron:8,copper:4},pw:12,dir:1,r:1,d:'Mines one ore type from the 3×3 area around it and pushes it out of its bright edge. Patches run dry over time.'},
  deepdrill:{n:'Deep Drill',cost:{steel:6,circuit:4,ember:1},pw:40,dir:1,w:2,r:2,mult:2.5,d:'A 2×2 drill that mines the 6×6 area around it at 2.5× speed and uses up ore half as fast. Ore leaves through two slots on its bright edge and two on the back. Each one costs more Ember shards than the last.'},
  smelter:{n:'Smelter',cost:{iron:10},pw:25,dir:1,d:'Melts ferrite, cuprite or silica into ingots and glass. Takes ore from any side.'},
  fab:{n:'Fabricator',cost:{iron:12,copper:8},pw:35,dir:1,d:'Builds the recipe you pick. Feed it the inputs from any side.'},
  fab2:{n:'Fabricator Mk II',cost:{composite:10,servo:4,circuit:30},pw:110,dir:1,w:2,mult:2.5,d:'Runs Fabricator recipes 2.5× as fast. Feed it from any side; output leaves its bright edge.'},
  foundry:{n:'Foundry',cost:{composite:20,frame:20,steel:100},pw:160,dir:1,w:3,mult:4,d:'Smelts ore 4× as fast as a Smelter and holds far more. One ore type at a time, from any side. Output leaves through three slots on its bright edge.'},
  splitter:{n:'Splitter',cost:{iron:4,copper:2},dir:1,d:'Takes in items and shares them forward, left and right in turn.'},
  sorter:{n:'Sorter',cost:{iron:4,circuit:2},dir:1,d:'Your chosen item leaves through the side you pick: ahead, left or right. Everything else leaves through the other two.'},
  batcher:{n:'Batcher',cost:{iron:10,gear:6,circuit:2},dir:1,w:2,d:'Holds up to 50 of each item and sends them out in the ratio you set, in whole sets, from two output slots on its bright edge at the same time. Pick a recipe to copy its ratio.'},
  combustor:{n:'Combustor',cost:{iron:14,copper:6},gen:150,burn:6,dir:1,d:'Burns carbon for up to 150 kW, only as much as the grid needs. About 1 in 50 carbon leaves an Ember shard, pushed out of its bright edge.'},
  solar:{n:'Sun Leaf',cost:{glass:6,circuit:3},gen:45,d:'Up to 45 kW in daylight. Nothing at night.'},
  uplink:{n:'Uplink',cost:{steel:8,circuit:6},pw:60,d:'Beams whatever you feed it straight to the Core. Up to 4 items a second next to the Core, slower and hungrier for power the farther away it stands.'},
  ring:{n:'Launch Ring',cost:{steel:30,motor:10,lens:20},pw:120,w:3,d:'Feed it sail petals. Each one is flung into orbit around the star and adds 8 kW to the grid for good.'},
  turbine:{n:'Turbine Hall',cost:{steel:40,motor:10,circuit:30},gen:1200,burn:1.5,w:3,d:'Burns carbon for up to 1.2 MW, twice as efficiently as a Combustor. Takes carbon from any side. Ember shards go straight to storage.'},
  filmarray:{n:'Film Array',cost:{film:30,frame:6,circuit:15},gen:300,w:2,d:'Up to 300 kW in daylight and 120 kW at night: the most power per tile of any solar, and the best at night.'},
  capacitor:{n:'Capacitor Bank',cost:{coil:30,composite:6,steel:20},w:2,cap:400,d:'Stores 400 MJ more Charge for research.'},
  collector:{n:'Prism Collector',cost:{prism:12,lens:30,steel:20},gen:400,w:3,d:'Up to 400 kW in daylight and a quarter of that at night.'},
  relay:{n:'Pulse Relay',cost:{steel:10,circuit:10,lens:4},pw:30,d:'Construction pulses for blueprints closer to this relay than to the Core launch from here. Pulses move at 40% speed outside the starting area, so relays out there save a lot of time.'},
  assembler:{n:'Assembler',cost:{frame:20,circuit:40,motor:10},pw:150,dir:1,w:3,d:'A large factory for advanced parts: Processors and Servos. Feed it from any side. Output leaves its bright edge.'},
  refinery:{n:'Refinery',cost:{frame:30,steel:60,processor:10},pw:200,dir:1,w:3,d:'Crushes raw ore of any kind into Aether. Starts at 1,000 ore per Aether and needs 1 ore less for every 1,000 Aether you have ever made, down to 50.'},
  reactor:{n:'Aether Reactor',cost:{servo:20,processor:40,frame:60},gen:10000,burn:120,w:3,d:'Burns one Aether every 2 minutes for 10 MW. Takes Aether from any side.'},
  core:{n:'Core',w:3,gen:CORE_GEN,d:'Accepts any item from any side. Items count toward the current milestone first, then go to storage. Supplies 120 kW.'}
};
const MS=[
  {n:'First Light',req:{iron:40,copper:40},unl:['fab','splitter','combustor'],rec:['gear','wire'],b:'Wake the Core with its first ingots.'},
  {n:'Spin Up',req:{gear:60,wire:200},unl:['sorter','batcher'],rec:['circuit','steel'],b:'Prove the fabricators can keep pace.'},
  {n:'Lattice',req:{circuit:60,steel:30,glass:60},unl:['solar','uplink','deepdrill'],rec:['lens'],b:'Logic, alloy and glass for the sky.'},
  {n:'Optics',req:{lens:50,circuit:120},unl:[],rec:['motor','prism'],b:'Grind the lenses that will catch the star.'},
  {n:'Sail Program',req:{motor:30,prism:30},unl:['ring'],rec:['petal'],b:'Everything a sail petal needs.'},
  {n:'The Halo',req:{petal:PET_GOAL},unl:[],rec:[],launch:true,b:'Launch '+PET_GOAL+' sail petals into orbit.'},
  {n:'Heavy Industry',req:{steel:150,motor:40,circuit:200},unl:['turbine'],rec:[],b:'Build up the heavy plant a real power grid needs.'},
  {n:'Grid Charter',req:{gear:300,wire:1000,lens:100},unl:[],rec:[],b:'Wire the moon for power. After this, spare power is stored as Charge and spent on research.'}
];
const TUT=6;
// Grid ladder: sustained SOLAR generation thresholds (kW): Sun Leaves, Film Arrays, Prism Collectors and the halo.
// The Core and burners don't count. Past the named rungs it scales ×3 forever.
const RUNGS=[
  {kw:600,n:'Hum',spd:1.5,d:'Pulses travel 50% faster. Opens tier 2 research.'},
  {kw:2000,n:'Thrum',d:'Opens tier 3 research.'},
  {kw:6000,n:'Roar',spd:1.5,map:96,d:'Pulses travel 50% faster. The frontier opens to 192×192 tiles. Opens tier 4 research.'},
  {kw:18000,n:'Overclock 1',oc:1,d:'Every machine works 10% faster. Opens tier 5 research.'},
  {kw:54000,n:'Overclock 2',oc:1,map:128,d:'Every machine works 10% faster. The frontier opens to 256×256 tiles, a third pulse can fly at once, and tier 6 research opens.'},
  {kw:162000,n:'Overclock 3',oc:1,d:'Every machine works 10% faster.'},
  {kw:486000,n:'Overclock 4',oc:1,map:192,d:'Every machine works 10% faster. The whole moon opens: 384×384 tiles.'}
];
// Research: spent with Charge (stored spare power, in MJ) plus items from storage.
// Tier n opens once grid tier n-1 is reached (tier 1 opens with the Grid Charter).
const TECH={
  frames:{t:1,n:'Structural frames',mj:40,items:{steel:100,gear:200},rec:['frame'],d:'Frames: steel and gears for big buildings.'},
  optics:{t:1,n:'Prism optics',mj:60,items:{prism:30,lens:60},unl:['collector'],d:'The Prism Collector: 400 kW of daylight power.'},
  wafers:{t:1,n:'Silicon wafers',mj:50,items:{glass:300,carbon:100},rec:['wafer','film'],d:'Wafers and solar film from glass and carbon.'},
  capacitors:{t:1,n:'Capacitor banks',mj:50,items:{copper:500,steel:60},rec:['coil'],unl:['capacitor'],d:'Copper coils and Capacitor Banks to store more Charge.'},
  relays:{t:2,n:'Pulse relays',mj:120,items:{circuit:200,lens:60},unl:['relay'],d:'Pulse Relays launch construction pulses out in the field.'},
  assembly:{t:2,n:'Assembly',mj:150,items:{frame:60,circuit:300,motor:40},req:['frames'],unl:['assembler'],rec:['processor','servo'],d:'The Assembler, with Processors and Servos.'},
  filmarrays:{t:2,n:'Film arrays',mj:120,items:{film:200,frame:30},req:['wafers'],unl:['filmarray'],d:'Film Arrays: compact 2×2 solar that keeps going at night.'},
  composites:{t:2,n:'Composites',mj:100,items:{steel:300,glass:300},req:['frames','wafers'],rec:['composite'],d:'Composite plates from steel and glass.'},
  foundry:{t:3,n:'Foundry',mj:300,items:{composite:80,frame:80,steel:400},req:['composites'],unl:['foundry'],d:'The Foundry: smelting at 4× speed.'},
  fab2:{t:3,n:'Fabricator Mk II',mj:300,items:{servo:30,processor:60,composite:40},req:['assembly','composites'],unl:['fab2'],d:'A 2×2 Fabricator that runs 2.5× as fast.'},
  photonics:{t:3,n:'Photonics',mj:300,items:{wafer:300,processor:50},req:['assembly','wafers'],rec:['photonic'],d:'Photonic chips from wafers, wire and lenses.'},
  refining:{t:4,n:'Aether refining',mj:800,items:{photonic:60,composite:150},req:['foundry'],unl:['refinery'],d:'The Refinery: any raw ore into Aether.'},
  reactors:{t:5,n:'Aether reactors',mj:2000,items:{aether:20,servo:100,photonic:150},req:['refining'],unl:['reactor'],d:'The Aether Reactor: 10 MW per reactor.'},
  lattice:{t:5,n:'Lattice cores',mj:2000,items:{photonic:200,servo:80,composite:200},req:['photonics','fab2'],rec:['lattice'],d:'Lattice cores, the top-tier part.'},
  mirrors:{t:6,n:'Halo mirrors',mj:6000,items:{lattice:50,petal:200},req:['lattice'],fx:'mirrors',d:'Every sail petal in orbit gives 24 kW instead of 8.'}
};
// Ongoing research: repeats forever. Each level costs more Charge, and the item set rotates so many parts stay useful.
const REPEAT={
  overcharge:{n:'Overcharge',mj:150,grow:1.6,igrow:1.45,sets:[{circuit:200,steel:100},{motor:60,lens:120},{processor:40,film:150},{photonic:30,composite:60}],d:'Every machine works 5% faster per level.'},
  harmonics:{n:'Grid harmonics',mj:250,grow:1.7,igrow:1.45,sets:[{coil:150,glass:300},{wafer:200,frame:60},{servo:30,composite:80},{lattice:5,photonic:60}],d:'Every generator, the Core and the halo produce 10% more power per level.'}
};
// Furnace ladder: sustained power from Combustors, Turbine Halls and Aether Reactors (kW), climbed alongside the grid ladder.
const FRUNGS=[
  {kw:500,n:'Kindle',fuel:.15,d:'Every unit of carbon and Aether burns 15% longer.'},
  {kw:2000,n:'Blaze',pow:.15,d:'Combustors, Turbine Halls and Aether Reactors make 15% more power.'},
  {kw:8000,n:'Inferno',ember:1,d:'Carbon burners leave Ember shards twice as often.'},
  {kw:30000,n:'Forge Star',fuel:.15,d:'Every unit of carbon and Aether burns 15% longer.'},
  {kw:120000,n:'Crucible',pow:.15,d:'Combustors, Turbine Halls and Aether Reactors make 15% more power.'}
];
function frung(i){if(i<FRUNGS.length)return FRUNGS[i];const k=i-FRUNGS.length+1,f=k%2===1;return{kw:120000*Math.pow(4,k),n:'Furnace '+(i+1),[f?'fuel':'pow']:.1,d:f?'Every unit of fuel burns 10% longer.':'Burners make 10% more power.'}}
// Constellations: tiers for sail petals in orbit. Each one earns a Commander point.
const CONST_REQ=[10,25,50,100,200];
function constReq(i){return i<CONST_REQ.length?CONST_REQ[i]:200*Math.pow(2,i-CONST_REQ.length+1)}
const CMD={
  industrialist:{n:'Industrialist',d:'Every machine works 5% faster per point.'},
  stellar:{n:'Stellar',d:'Sun Leaves, Film Arrays, Prism Collectors and the halo make 10% more power per point.'},
  ember:{n:'Ember',d:'Carbon and Aether burn 10% longer per point.'},
  architect:{n:'Architect',max:10,d:'Buildings cost 5% less per point, up to 50% off.'}
};
// Starseed shop: permanent perks bought with Starseeds. They survive Ascension.
const SS={
  seedv:{n:'Seed veins',max:10,cost:L=>Math.round(3*Math.pow(1.5,L)),d:'Each level gives 10% more ore patches a seed tile. A seed tile never runs out, can’t be built on, and slowly regrows the ore around it, even on tiles that were mined out.',eff:L=>`${L*10}% of patches`},
  seedg:{n:'Seed growth',req:'seedv',max:20,cost:L=>Math.round(2*Math.pow(1.6,L)),d:'Seeds regrow ore 50% faster per level.',eff:L=>`×${Math.pow(1.5,L).toFixed(2)} speed`},
  seedr:{n:'Seed reach',req:'seedv',max:3,cost:L=>[4,8,16][L],d:'Seeds regrow ore one tile farther out per level, from 2 tiles around the seed up to 5.',eff:L=>`${2+L} tiles out`},
  core:{n:'Core size',max:2,cost:L=>[8,20][L],d:'The Core grows to 5×5, then 7×7, so more lines can feed it. It grows as soon as the tiles around it are clear.',eff:L=>`${3+2*L}×${3+2*L}`},
  trkT:{n:'Trickle: items',max:5,cost:L=>[2,4,8,16,32][L],d:'The Core makes items on its own, as if they were delivered. Each level adds better items.',eff:L=>`tier ${L}`},
  trkR:{n:'Trickle: rate',req:'trkT',max:20,cost:L=>Math.round(2*Math.pow(1.6,L)),d:'Trickle items arrive 50% faster per level. The base rate is 6 of each item a minute.',eff:L=>`${(6*Math.pow(1.5,L)).toFixed(1)}/min each`}
};
const TRICKLE=[['iron','copper'],['glass','gear','wire'],['circuit','steel'],['lens','motor','frame'],['prism','processor','coil']];
// Relics: permanent bonuses that stack. One is chosen from three every 3rd ascension; rarer ones turn up less often.
// fx keys are percentages unless noted: spd machines, belt conveyors, solar solar+halo, burn burners, pulse pulses, ember Ember drops,
// ore ore per tile, off offline output (points), haul offline hours (h), dup duplication (points), core Core power, cap Charge storage,
// petal kW per petal, drill drill speed, seed seed regrowth, trk trickle rate, smelt smelting, fab fabricating, up Uplink rate,
// cost building discount, fuel fuel burn time, mj research Charge discount, nova Nova drops, seeds Starseeds per ascension, refine Refinery ore discount
const RARITY={c:{n:'Common',w:60,col:'#b8b0e6'},r:{n:'Rare',w:28,col:'#6fd0ff'},e:{n:'Epic',w:10,col:'#d08cff'},l:{n:'Legendary',w:2,col:'#f3c25a'}};
const RELICS={
  courier:{n:'Courier Wings',r:'c',fx:{pulse:30}},
  cinder:{n:'Cinder Charm',r:'c',fx:{ember:25}},
  cog:{n:'Cog of Haste',r:'c',fx:{spd:5}},
  grease:{n:'Greased Rails',r:'c',fx:{belt:10}},
  pane:{n:'Sunlit Pane',r:'c',fx:{solar:10}},
  coals:{n:'Banked Coals',r:'c',fx:{burn:10}},
  pick:{n:'Prospector’s Pick',r:'c',fx:{ore:10}},
  lantern:{n:'Night Lantern',r:'c',fx:{off:5}},
  hourglass:{n:'Pocket Hourglass',r:'c',fx:{haul:2}},
  spark:{n:'Core Spark',r:'c',fx:{core:25}},
  coil:{n:'Capacitor Coil',r:'c',fx:{cap:20}},
  polish:{n:'Petal Polish',r:'c',fx:{petal:10}},
  bit:{n:'Diamond Bit',r:'c',fx:{drill:10}},
  bellows:{n:'Smelter’s Bellows',r:'c',fx:{smelt:10}},
  ratchet:{n:'Fitter’s Ratchet',r:'c',fx:{fab:10}},
  fuse:{n:'Slow Fuse',r:'c',fx:{fuel:10}},
  sprout:{n:'Green Sprout',r:'c',fx:{seed:20}},
  gears:{n:'Relic of Gears',r:'r',fx:{spd:10}},
  rails:{n:'Relic of Rails',r:'r',fx:{belt:25}},
  dawn:{n:'Relic of Dawn',r:'r',fx:{solar:20}},
  hearth:{n:'Relic of the Hearth',r:'r',fx:{burn:20}},
  lode:{n:'Relic of the Lode',r:'r',fx:{ore:25}},
  dream:{n:'Relic of Dreams',r:'r',fx:{off:10}},
  echo:{n:'Twin Echo',r:'r',fx:{dup:3}},
  lattice:{n:'Charge Lattice',r:'r',fx:{cap:50}},
  bloom:{n:'Seed Bloom',r:'r',fx:{seed:50}},
  fountain:{n:'Trickle Fountain',r:'r',fx:{trk:50}},
  antenna:{n:'Uplink Antenna',r:'r',fx:{up:25}},
  rule:{n:'Builder’s Rule',r:'r',fx:{cost:5}},
  quiet:{n:'Quiet Reactor',r:'r',fx:{fuel:20}},
  pouch:{n:'Starseed Pouch',r:'r',fx:{seeds:10}},
  crown:{n:'Overclock Crown',r:'e',fx:{spd:20}},
  mirror:{n:'Halo Mirror',r:'e',fx:{petal:30,solar:10}},
  crucible:{n:'Ember Crucible',r:'e',fx:{ember:100,burn:10}},
  motherlode:{n:'Mother Lode',r:'e',fx:{ore:40}},
  chamber:{n:'Echo Chamber',r:'e',fx:{dup:6}},
  engine:{n:'Research Engine',r:'e',fx:{mj:20}},
  novalens:{n:'Nova Lens',r:'e',fx:{nova:50}},
  stone:{n:'Refiner’s Stone',r:'e',fx:{refine:10}},
  pulsar:{n:'Pulse Engine',r:'e',fx:{pulse:50,belt:15}},
  longdream:{n:'Long Dream',r:'e',fx:{off:15,haul:4}},
  heart:{n:'Heart of the Moon',r:'l',fx:{spd:15,ore:25,core:100}},
  starforge:{n:'Starforge',r:'l',fx:{burn:30,solar:30}},
  seam:{n:'Infinite Seam',r:'l',fx:{seed:100,ore:30}},
  seedcrown:{n:'Seedbearer’s Crown',r:'l',fx:{seeds:25,dup:5}},
  // Challenge relics: only earned by finishing that challenge
  sunsigil:{n:'Sunbound Sigil',r:'l',sig:'solar',fx:{solar:25,petal:12.5}},
  loom:{n:'Loom of One Thread',r:'l',sig:'nosplit',fx:{belt:20,fab:10}},
  hands:{n:'Hands of the Maker',r:'l',sig:'handfed',fx:{up:25,dup:2.5}},
  eternity:{n:'Hourglass Eternal',r:'l',sig:'speed',fx:{spd:12.5,pulse:25}},
  deepcrown:{n:'Deep Crown',r:'l',sig:'deeponly',fx:{drill:20,nova:25}},
  seal:{n:'Minimalist’s Seal',r:'l',sig:'minimal',fx:{cost:7.5,fab:12.5}}
};
const FX_TEXT={spd:'machines {v}% faster',belt:'conveyors {v}% faster',solar:'solar and halo +{v}%',burn:'burner power +{v}%',pulse:'pulses {v}% faster',ember:'Ember drops +{v}%',ore:'+{v}% ore per tile',off:'+{v}% offline output',haul:'+{v} h offline time',dup:'+{v}% duplication',core:'Core power +{v}%',cap:'Charge storage +{v}%',petal:'+{v}% power per petal',drill:'drills {v}% faster',seed:'seeds regrow {v}% faster',trk:'trickle {v}% faster',smelt:'smelting {v}% faster',fab:'fabricating {v}% faster',up:'Uplinks {v}% faster',cost:'buildings {v}% cheaper',fuel:'fuel burns {v}% longer',mj:'research needs {v}% less Charge',nova:'Nova drops +{v}%',seeds:'+{v}% Starseeds when you Ascend',refine:'Refineries need {v}% less ore'};
function relicText(k){const f=RELICS[k].fx;const t=Object.keys(f).map(q=>FX_TEXT[q].replace('{v}',f[q])).join(', ');return t.charAt(0).toUpperCase()+t.slice(1)+'.'}
// Moon modifiers: pick one of three (or a plain moon) when you Ascend. seeds = Starseed multiplier when you leave that moon.
const MODS={
  rich:{n:'Rich moon',seeds:.75,d:'Every ore patch holds twice as much ore.'},
  barren:{n:'Barren moon',seeds:1.3,d:'Ore patches hold half as much ore.'},
  carbon:{n:'Carbon world',seeds:1.2,d:'Carbon patches hold three times as much; cuprite patches hold half.'},
  longnight:{n:'Long night',seeds:1.25,d:'Nights last much longer and days are short.'},
  eternal:{n:'Eternal day',seeds:1.15,d:'The sun never sets, but Combustors can’t be built.'},
  thin:{n:'Thin crust',seeds:1.1,d:'Drills mine 50% faster, but use up ore twice as fast.'},
  lowg:{n:'Low gravity',seeds:1,d:'Conveyors are 50% faster and pulses twice as fast, but each launch takes 2 sail petals.'},
  embermoon:{n:'Ember moon',seeds:1.1,d:'Ember shards drop three times as often, but all power is 20% lower.'},
  unstable:{n:'Unstable core',seeds:1.2,d:'The Core only makes power while the sun is up.'},
  seeded:{n:'Seeded moon',seeds:1.15,d:'Every ore patch has a seed tile, but patches start with 30% of their ore.'},
  frontier:{n:'Frontier moon',seeds:1.2,d:'No ore within 24 tiles of the Core, but the map starts at 192×192.'}
};
// Challenges: a separate run from the start of the tutorial. Sign the Grid Charter to win, then choose a reward.
const CHALLENGES={
  solar:{n:'Solar only',ban:['combustor','turbine','reactor'],d:'No Combustors, Turbine Halls or Reactors.'},
  nosplit:{n:'One thread',ban:['splitter','sorter'],d:'No Splitters or Sorters.'},
  handfed:{n:'Hand-fed',ban:['uplink'],d:'No Uplinks: every item reaches the Core by conveyor.'},
  speed:{n:'Speedrun',limit:7200,d:'Sign the Grid Charter within 2 hours of play.'},
  deeponly:{n:'Deep roots',ban:['drill'],unl:['deepdrill'],inv:{ember:1,steel:6,circuit:4},d:'No basic Drills. Deep Drills are unlocked from the start, and you begin with exactly enough for one. Every other Deep Drill’s Ember shards come from burning carbon.'},
  minimal:{n:'Minimalist',cap:150,d:'At most 150 buildings, not counting conveyors and crossings.'}
};
// Nova workshop: permanent Deep Drill upgrades bought with Nova shards
const NUP={
  bore:{n:'Nova bore',max:10,cost:L=>1+L,d:'Deep Drills mine 20% faster per level.',eff:L=>`+${L*20}% speed`},
  reach:{n:'Nova reach',max:2,cost:L=>[3,8][L],d:'Deep Drills reach one tile farther in every direction: 6×6, then 8×8, then 10×10.',eff:L=>`${6+2*L}×${6+2*L}`},
  thrift:{n:'Nova thrift',max:5,cost:L=>2+L,d:'Deep Drills use up ore 15% slower per level, so patches last longer.',eff:L=>`×${Math.pow(.85,L).toFixed(2)} ore used`},
  cool:{n:'Nova cooling',max:3,cost:L=>1+L,d:'Deep Drills draw 25% less power per level.',eff:L=>`${40*(1-.25*L)} kW each`}
};
function rung(i){if(i<RUNGS.length)return RUNGS[i];const k=i-2;return{kw:6000*Math.pow(3,k),n:'Overclock '+k,oc:1,d:'Every machine works 10% faster.'}}
function fmtW(kw){return kw>=1e6?(kw/1e6).toFixed(2)+' GW':kw>=1000?(kw/1000).toFixed(kw>=1e4?1:2)+' MW':Math.round(kw)+' kW'}
const BOLT='<svg viewBox="0 0 12 12"><path d="M7 0 1.5 7H5.5L4.5 12 10.5 4.5H6.5Z" fill="#f3c25a"/></svg>';
const TOOLS=['inspect','select','blueprints','belt','junction','drill','smelter','foundry','fab','fab2','splitter','sorter','batcher','combustor','deepdrill','solar','filmarray','uplink','ring','turbine','collector','capacitor','relay','assembler','refinery','reactor','remove'];

export {RARITY,FX_TEXT,relicText,MODS,CHALLENGES,SS,TRICKLE,RELICS,NUP,CMD,FRUNGS,constReq,frung,TECH,REPEAT,B,BELT_V,BOLT,CORE_GEN,CX,CY,DAY_LEN,DIRS,H,ITEMS,ITEM_ORDER,MS,ORE_COL,ORE_KEYS,ORE_P,PET_GOAL,RECIPES,RUNGS,SAVE_KEY,SMELT,SMELT_T,SP,TOOLS,TUT,W,fmtW,opp,rung};
