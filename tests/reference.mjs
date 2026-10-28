// Writes docs/reference.md: base speeds, recipes and smelting straight from src/data/game.js.
// Run after changing game data:  node tests/reference.mjs
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {B,ITEMS,RECIPES,SMELT,SMELT_T,ORE_P,BELT_V,SP,CORE_GEN,MISSIONS,ROCKET,ROCKET_T,ORB,ORB_REP,RING_MS} from '../src/data/game.js';

const n=k=>ITEMS[k]?ITEMS[k].n:k, f=(v,d=2)=>{const r=Number(v.toFixed(d));return String(r)};
const cost=c=>c?Object.keys(c).map(k=>`${c[k]} ${n(k)}`).join(', '):'free';
const table=(head,rows)=>`| ${head.join(' | ')} |\n|${head.map(()=>'---').join('|')}|\n`+rows.map(r=>`| ${r.join(' | ')} |`).join('\n')+'\n';
const out=[];
out.push(`# Halo Foundry reference

Base numbers from \`src/data/game.js\`, before any bonuses (grid and furnace tiers, Overcharge, Commander, Crowns,
relics, Starseeds). In-game, machine info panels show the live numbers with every bonus applied.
Regenerate with \`node tests/reference.mjs\`.
`);

// ---------- buildings ----------
const rows=[];for(const k in B){const b=B[k];if(k==='core')continue;
  const size=(b.w||1)+'×'+(b.w||1),power=b.pw?`uses ${b.pw>=1e6?f(b.pw/1e6)+' GW':b.pw>=1000?f(b.pw/1000)+' MW':b.pw+' kW'}${k==='spaceport'?' standing, 10 GW while building a rocket':k==='incinerator'?' while burning':''}`:b.gen?`makes up to ${b.gen>=1000?f(b.gen/1000)+' MW':b.gen+' kW'}`:'–',speed=b.mult?`×${b.mult}`:'';
  rows.push([b.n,size,cost(b.cost),power,speed])}
rows.push([B.core.n,'3×3','–',`makes ${CORE_GEN} kW`,'']);
out.push('## Buildings\n\n'+table(['Building','Size','Cost','Power','Speed'],rows)+'\nDeep Drill cost in Ember shards climbs 1, 1, 2, 3, 5, 8… with each one you own.\n');

// ---------- moving items ----------
out.push(`## Moving items

${table(['What','Rate'],[
  ['Conveyor / Crossing',`${f(BELT_V)} tiles/s, about ${f(BELT_V/SP,1)} items/s per line`],
  ['Uplink',`4 items/s beside the Core, slower farther away; uses 60 kW + 3 kW per tile from the Core`],
  ['Launch Ring','1 sail petal every 2.5 s, or 1 Lattice core every 5 s'],
  ['Batcher','holds up to 50 of each item; two outputs'],
])}`);

// ---------- mining ----------
const mrows=[];for(const k in ORE_P){const p=ORE_P[k];mrows.push([n(k),p.deep?'– (Deep Drill only)':f(p.rate)+'/s',f(p.rate*B.deepdrill.mult)+'/s',`${p.lo}–${p.hi}`])}
out.push('## Mining\n\n'+table(['Ore','Drill','Deep Drill','Ore per tile (before bonuses)'],mrows)+
  '\nDrill reach: 3×3 around it. Deep Drill: 6×6 around its 2×2 body, mines 2.5× as fast and uses up ore half as fast.\n');

// ---------- smelting ----------
const srows=[];for(const ore in SMELT){const t=SMELT_T[ore];srows.push([n(ore),n(SMELT[ore]),f(t)+' s',ore==='voidstone'?'– (Foundry only)':f(1/t)+'/s',f(B.foundry.mult/t)+'/s'])}
out.push('## Smelting (1 ore → 1 product)\n\n'+table(['Ore','Makes','Time','Smelter','Foundry (×4)'],srows));

// ---------- recipes ----------
const fabMk=B.fab2.mult||1;const rrows=[];
for(const k in RECIPES){const r=RECIPES[k],asm=r.at==='asm',ins=Object.keys(r.in).map(i=>`${r.in[i]} ${n(i)}`).join(' + ');
  const per=m=>{const c=m/r.t;return `${f(c*r.out)}/s`};
  rrows.push([n(k)+(r.out>1?` ×${r.out}`:''),ins,f(r.t)+' s',asm?'Assembler':'Fabricator, Mk II',asm?'–':per(1),asm?'–':per(fabMk),asm?per(B.assembler.mult||1):'–'])}
out.push('## Recipes\n\n'+table(['Item','Inputs','Time','Made in','Fabricator','Fab Mk II (×'+fabMk+')','Assembler'],rrows)+
  '\nInputs per second = output per second ÷ output count × each input amount.\n');

// ---------- late game ----------
const kits=o=>Object.keys(o).map(k=>`${o[k].toLocaleString()} ${n(k)}`).join(' + ');
out.push(`## Late game (main game, from ascension 2)

Separator: 1,000 Starsand → 100 Rare earth, 250 ferrite, 200 cuprite, 200 silica, 250 Slag, in 20 s (Rare earth +25% per Rich sand level, +50% from 6 Halo Ring segments, taken from the Slag share).

### Spaceport missions
Every launch needs a rocket (${kits(ROCKET)}, assembled in ${ROCKET_T} s) and Aether fuel.

${table(['Mission','Payload','Aether fuel','Notes'],Object.keys(MISSIONS).map(k=>{const M=MISSIONS[k];return [M.n,M.pay?kits(M.pay):'500 Experiment kits (1,000 with Launch logistics)',String(M.fuel),M.d]}))}
### Orbital research (paid in Experiment kits)

${table(['Research','Kits','Effect'],[...Object.keys(ORB).map(k=>[ORB[k].n,kits(ORB[k].kits),ORB[k].d]),...Object.keys(ORB_REP).map(k=>[ORB_REP[k].n+' (repeats)',kits(ORB_REP[k].kits)+` ×${ORB_REP[k].grow} per level`,ORB_REP[k].d])])}
### Halo Ring
Each segment: +10% power from every source, +3% machine speed, +10% Starseeds when you Ascend.

${table(['Segments','Reward'],RING_MS.map(([k,t])=>[String(k),t]))}`);

// ---------- power and fuel ----------
out.push(`## Power and fuel

${table(['Generator','Output','Fuel'],[
  ['Core',`${CORE_GEN} kW`,'none'],
  ['Combustor',`up to ${B.combustor.gen} kW`,`1 carbon per ${B.combustor.burn} s at full output (${f(B.combustor.gen*B.combustor.burn/1000)} MJ each); about 1 in 50 leaves an Ember shard`],
  ['Turbine Hall',`up to ${f(B.turbine.gen/1000)} MW`,`1 carbon per ${B.turbine.burn} s at full output (${f(B.turbine.gen*B.turbine.burn/1000)} MJ each)`],
  ['Aether Reactor',`${f(B.reactor.gen/1000)} MW`,`1 Aether per ${B.reactor.burn} s; leaves an Aether husk each; about 1 in 100 leaves a Nova shard`],
  ['Sun Leaf',`up to ${B.solar.gen} kW`,'daylight only'],
  ['Film Array',`up to ${B.filmarray.gen} kW`,'daylight, 40% at night'],
  ['Prism Collector',`up to ${B.collector.gen} kW`,'daylight, 25% at night'],
  ['Sail petal in orbit','8 kW (24 with Halo mirrors)','launched'],
  ['Lattice core in orbit','1 MW','launched'],
])}
Refinery: turns 1,000 ore of any kind into 1 Aether (3 s), needing 1 ore less for every 1,000 Aether ever made, down to 50.
`);

const path=fileURLToPath(new URL('../docs/reference.md',import.meta.url));
writeFileSync(path,out.join('\n'));
console.log('wrote',path);

// Same tables as CSV (one file, sections separated by a blank line) for spreadsheet apps.
const q=v=>{v=String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
const csv=(title,head,rs)=>[title,head.map(q).join(','),...rs.map(r=>r.map(q).join(','))].join('\n');
const csvPath=fileURLToPath(new URL('../docs/reference.csv',import.meta.url));
writeFileSync(csvPath,[
  csv('BUILDINGS',['Building','Size','Cost','Power','Speed'],rows),
  csv('MINING',['Ore','Drill','Deep Drill','Ore per tile'],mrows),
  csv('SMELTING',['Ore','Makes','Time','Smelter','Foundry (x4)'],srows),
  csv('RECIPES',['Item','Inputs','Time','Made in','Fabricator','Fab Mk II (x'+fabMk+')','Assembler'],rrows),
].join('\n\n')+'\n');
console.log('wrote',csvPath);
