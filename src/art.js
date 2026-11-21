// Painted art: building sprites, Core stages, ore clusters and halo pieces (generated, then hand-picked).
// Everything here is optional: until an image loads, or with "Classic" art chosen, the game draws its own shapes.
export const ART={};
const subs=[];let left=0;
export function onArt(f){subs.push(f)}
export function artDone(){return left===0}
function load(k,p){left++;const im=new Image();im.decoding='async';
  const done=()=>{left--;if(!left)subs.forEach(f=>{try{f()}catch(_){}})};
  im.onload=()=>{ART[k]=im;done()};im.onerror=done;im.src=new URL(p,import.meta.url).href}
const BLD=['drill','deepdrill','smelter','fab','fab2','foundry','splitter','sorter','stock','batcher','combustor','solar','uplink','ring','turbine','filmarray','capacitor','collector','relay','assembler','refinery','reactor','separator','incinerator','spaceport','railterm','elevator','bore','dock','starship','market'];
export const ORE_ART=['ferrite','cuprite','silica','carbon','voidstone','starsand'];
export function loadArt(){
  for(const t of BLD)load(t,`./art/b/${t}.webp`);
  for(let i=0;i<3;i++)load('wreck'+i,`./art/b/wreck${i}.webp`);
  for(const w of [3,5,7,9])load('core'+w,`./art/b/core${w}.webp`);
  for(const o of ORE_ART)for(let i=0;i<3;i++)load(`ore_${o}${i}`,`./art/ore/${o}${i}.webp`);
  for(const h of ['star','moon','petal','lattice','nebula'])load('h_'+h,`./art/halo/${h}.webp`);
}
