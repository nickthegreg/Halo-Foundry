// Game data: items, ores, recipes, buildings, milestones and the grid ladder.
const W=384,H=384,CX=192.5,CY=192.5;
const DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
const opp=d=>(d+2)&3;
const BELT_V=1.75, SP=0.34, DAY_LEN=300, PET_GOAL=40, CORE_GEN=120;
const SAVE_KEY='halo-foundry-v2';

const ITEM_ORDER=['ferrite','cuprite','silica','carbon','iron','copper','glass','gear','wire','circuit','steel','lens','motor','prism','petal','frame','processor','servo','aether','ember'];
const ITEMS={
  ferrite:{n:'Ferrite ore',s:'ferrite'},cuprite:{n:'Cuprite ore',s:'cuprite'},silica:{n:'Silica sand',s:'silica'},carbon:{n:'Carbon',s:'carbon'},
  iron:{n:'Iron ingot',s:'iron'},copper:{n:'Copper ingot',s:'copper'},glass:{n:'Glass',s:'glass'},
  gear:{n:'Gear',s:'gear'},wire:{n:'Wire',s:'wire'},circuit:{n:'Circuit',s:'circuit'},steel:{n:'Steel',s:'steel'},
  lens:{n:'Lens',s:'lens'},motor:{n:'Motor',s:'motor'},prism:{n:'Prism',s:'prism'},petal:{n:'Sail petal',s:'petal'},frame:{n:'Frame',s:'frame'},processor:{n:'Processor',s:'processor'},servo:{n:'Servo',s:'servo'},aether:{n:'Aether',s:'aether'},ember:{n:'Ember shard',s:'ember'}
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
  servo:{in:{motor:1,processor:1,frame:1},out:1,t:6,at:'asm'}
};
const B={
  belt:{n:'Conveyor',cost:{iron:1},dir:1,d:'Moves items one tile at a time. Drag to lay a line that follows your finger. Dragging across another conveyor adds a Crossing.'},
  junction:{n:'Crossing',cost:{iron:3,copper:2},d:'Two conveyor lines pass over each other here. Items leave on the side opposite where they came in.'},
  drill:{n:'Drill',cost:{iron:8,copper:4},pw:12,dir:1,r:1,d:'Mines one ore type from the 3×3 area around it and pushes it out of its bright edge. Patches run dry over time.'},
  deepdrill:{n:'Deep Drill',cost:{steel:6,circuit:4,ember:3},pw:40,dir:1,r:2,mult:2.5,d:'Mines the 5×5 area around it at 2.5× speed and uses up ore half as fast. Each one costs more Ember shards than the last.'},
  smelter:{n:'Smelter',cost:{iron:10},pw:25,dir:1,d:'Melts ferrite, cuprite or silica into ingots and glass. Takes ore from any side.'},
  fab:{n:'Fabricator',cost:{iron:12,copper:8},pw:35,dir:1,d:'Builds the recipe you pick. Feed it the inputs from any side.'},
  splitter:{n:'Splitter',cost:{iron:4,copper:2},dir:1,d:'Takes in items and shares them forward, left and right in turn.'},
  sorter:{n:'Sorter',cost:{iron:4,circuit:2},dir:1,d:'Your chosen item goes straight ahead. Everything else leaves through the sides.'},
  batcher:{n:'Batcher',cost:{iron:10,gear:6,circuit:2},dir:1,w:2,d:'Holds up to 50 of each item and sends them out in the ratio you set, in whole sets, from two output slots on its bright edge at the same time. Pick a recipe to copy its ratio.'},
  combustor:{n:'Combustor',cost:{iron:14,copper:6},gen:150,burn:6,dir:1,d:'Burns carbon for up to 150 kW, only as much as the grid needs. About 1 in 50 carbon leaves an Ember shard, pushed out of its bright edge.'},
  solar:{n:'Sun Leaf',cost:{glass:6,circuit:3},gen:45,d:'Up to 45 kW in daylight. Nothing at night.'},
  uplink:{n:'Uplink',cost:{steel:8,circuit:6},pw:60,d:'Beams whatever you feed it straight to the Core. Up to 4 items a second next to the Core, slower and hungrier for power the farther away it stands.'},
  ring:{n:'Launch Ring',cost:{steel:30,motor:10,lens:20},pw:120,w:3,d:'Feed it sail petals. Each one is flung into orbit around the star and adds 8 kW to the grid for good.'},
  turbine:{n:'Turbine Hall',cost:{steel:40,motor:10,circuit:30},gen:1200,burn:1.5,w:3,d:'Burns carbon for up to 1.2 MW, twice as efficiently as a Combustor. Takes carbon from any side. Ember shards go straight to storage.'},
  collector:{n:'Prism Collector',cost:{prism:12,lens:30,steel:20},gen:400,w:3,d:'Up to 400 kW in daylight and a quarter of that at night.'},
  relay:{n:'Pulse Relay',cost:{steel:10,circuit:10,lens:4},pw:30,d:'Construction pulses for blueprints closer to this relay than to the Core launch from here. Pulses move at 40% speed outside the starting area, so relays out there save a lot of time.'},
  assembler:{n:'Assembler',cost:{frame:20,circuit:40,motor:10},pw:150,dir:1,w:3,d:'A large factory for advanced parts: Processors and Servos. Feed it from any side. Output leaves its bright edge.'},
  refinery:{n:'Refinery',cost:{frame:30,steel:60,processor:10},pw:200,dir:1,w:3,d:'Crushes raw ore of any kind into Aether. Starts at 1,000 ore per Aether and gets cheaper with every Aether made, down to 50.'},
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
  {n:'Grid Charter',req:{gear:300,wire:1000,lens:100},unl:[],rec:[],b:'Wire the moon for power. After this, progress is measured in sustained watts.'}
];
const TUT=6;
// Grid ladder: sustained generation thresholds (kW). Past the named rungs it scales ×3 forever.
const RUNGS=[
  {kw:600,n:'Hum',spd:1.5,unl:['collector'],rec:['frame'],d:'Pulses travel 50% faster. Unlocks the Prism Collector and Frames.'},
  {kw:2000,n:'Thrum',unl:['relay','assembler'],rec:['processor','servo'],d:'Unlocks the Pulse Relay and the Assembler, with Processors and Servos.'},
  {kw:6000,n:'Roar',spd:1.5,map:96,unl:['refinery'],d:'Pulses travel 50% faster. The frontier opens to 192×192 tiles. Unlocks the Refinery.'},
  {kw:18000,n:'Overclock 1',oc:1,unl:['reactor'],d:'Every machine works 10% faster. Unlocks the Aether Reactor.'},
  {kw:54000,n:'Overclock 2',oc:1,map:128,d:'Every machine works 10% faster. The frontier opens to 256×256 tiles, and a third pulse can fly at once.'},
  {kw:162000,n:'Overclock 3',oc:1,d:'Every machine works 10% faster.'},
  {kw:486000,n:'Overclock 4',oc:1,map:192,d:'Every machine works 10% faster. The whole moon opens: 384×384 tiles.'}
];
function rung(i){if(i<RUNGS.length)return RUNGS[i];const k=i-2;return{kw:6000*Math.pow(3,k),n:'Overclock '+k,oc:1,d:'Every machine works 10% faster.'}}
function fmtW(kw){return kw>=1e6?(kw/1e6).toFixed(2)+' GW':kw>=1000?(kw/1000).toFixed(kw>=1e4?1:2)+' MW':Math.round(kw)+' kW'}
const BOLT='<svg viewBox="0 0 12 12"><path d="M7 0 1.5 7H5.5L4.5 12 10.5 4.5H6.5Z" fill="#f3c25a"/></svg>';
const TOOLS=['inspect','select','blueprints','belt','junction','drill','smelter','fab','splitter','sorter','batcher','combustor','deepdrill','solar','uplink','ring','turbine','collector','relay','assembler','refinery','reactor','remove'];

export {B,BELT_V,BOLT,CORE_GEN,CX,CY,DAY_LEN,DIRS,H,ITEMS,ITEM_ORDER,MS,ORE_COL,ORE_KEYS,ORE_P,PET_GOAL,RECIPES,RUNGS,SAVE_KEY,SMELT,SMELT_T,SP,TOOLS,TUT,W,fmtW,opp,rung};
