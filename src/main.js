import {EVERY_ITEMS,EVERY_N,RARITY,FX_TEXT,relicText,MODS,CHALLENGES,SS,TRICKLE,RELICS,NUP,CMD,FRUNGS,constReq,frung,TECH,REPEAT,B,BELT_V,BOLT,CORE_GEN,CX,CY,DAY_LEN,DIRS,H,ITEMS,ITEM_ORDER,MS,ORE_COL,ORE_KEYS,ORE_P,PET_GOAL,RECIPES,RUNGS,SAVE_KEY,SMELT,SMELT_T,SP,TOOLS,TUT,W,fmtW,opp,rung} from './data/game.js';
import {BIOMES,BIOME_KEYS} from './data/biomes.js';
import {CHANGELOG,LATEST} from './data/changelog.js';
import {AEO,DOR,HMIN,ION,LANE_V,PCN,PHR,QUAL,TUNES,bassRoot,chordOf,genMelBar,nearestTone,scaleNotes,voice} from './data/music.js';
(()=>{
'use strict';
// If an older copy of this script is still running in the same window (a live update), stop it first.
if(window.__haloStop)try{window.__haloStop()}catch(_){}
let STOPPED=false;window.__haloStop=()=>{STOPPED=true;try{window.__haloCtx&&window.__haloCtx.close()}catch(_){}};
// ================= constants & data =================
let BV=1.75;
function mapLim(){let m=modOn('frontier')?96:64;for(let i=0;i<Math.min(S.gt,RUNGS.length);i++)if(RUNGS[i].map)m=Math.max(m,RUNGS[i].map);return m}
function inLim(x,y){const L=mapLim();return x>=192-L&&y>=192-L&&x<192+L&&y<192+L}
function refRatio(){return Math.max(50,Math.round((1000-Math.floor((S.refined||0)/1000))*(1-Math.min(.5,relStat('refine')/100))))}

// ================= rng =================
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

// ================= state =================
let S=null, ORE=null, RES=null, RES0=null, starPat=null;
let dirty=true, tool='inspect', rot=1, sel=null, speed=1;
const cam={x:CX,y:CY,z:44};
let PW={gen:0,demand:0,sat:1,cap:CORE_GEN,day:1};
const PARTS=[];
let hover=null, tapFx=null;

function fresh(seed){
  return {v:1,seed,inv:{iron:160,copper:80},ms:0,prog:{},petals:0,time:0,flags:{del:0},unl:['belt','junction','drill','smelter'],rec:[],bs:new Map(),gt:0,gavg:0,ft:0,favg:0,cmd:{},cmdBank:0,cmdSpent:0,asc:{n:0,seeds:0,total:0},ss:{},nup:{},relics:[],relicPick:null,trk:{},res:{done:{},cur:null,p:{},lv:{}},charge:0,up:{belt:0,vein:0,night:0,haul:0},pulses:[],pq:[],grid:new Int32Array(W*H),nid:1,cnt:{},seen:{},speed:1,newT:[]};
}

// ================= helpers =================
const $=s=>document.querySelector(s);
function at(x,y){if(x<0||y<0||x>=W||y>=H)return null;const id=S.grid[y*W+x];return id?S.bs.get(id):null}
function oreAt(x,y){if(x<0||y<0||x>=W||y>=H)return null;return ORE_KEYS[ORE[y*W+x]]}
function canAfford(c){for(const k in c)if((S.inv[k]||0)<c[k])return false;return true}
function pay(c,sg){for(const k in c)S.inv[k]=(S.inv[k]||0)+sg*c[k]}
function missing(c){const m=[];for(const k in c){const h=S.inv[k]||0;if(h<c[k])m.push((c[k]-h)+' '+ITEMS[k].s)}return m.join(', ')}
function countOf(t){let n=0;for(const b of S.bs.values())if(b.t===t)n++;return n}
// Anything priced in Ember shards climbs Fibonacci-style with each one you own: 1, 1, 2, 3, 5, 8…
function costOf(t,n){const c=Object.assign({},B[t].cost||{});if(c.ember){let a=c.ember,b=c.ember;const k=n==null?countOf(t):n;for(let i=0;i<k;i++){const q=a+b;a=b;b=q}c.ember=a}const off=Math.min(.5,.05*cmdLv('architect')+relStat('cost')/100);if(off)for(const q in c)c[q]=Math.max(1,Math.ceil(c[q]*(1-off)));return c}
// Upgrade costs: hand-set early levels, then each further level costs the last one times `grow`
function tierCost(T,grow,L){if(L<T.length)return T[L];const c={},m=Math.pow(grow,L-T.length+1),last=T[T.length-1];for(const k in last)c[k]=Math.round(last[k]*m/10)*10;return c}
const BELT_COST=[{ember:5},{ember:50},{ember:500},{ember:5000},{aether:1000},{aether:4000,ember:20000},{aether:20000,ember:80000,servo:2000}];
const VEIN_COST=[{iron:150,copper:150},{iron:1500,copper:1500},{circuit:5000,glass:3000},{motor:5000,lens:3000,steel:4000},{wire:1000000},{servo:4000,aether:2000,lens:20000,photonic:2000}];
const NIGHT_COST=[{circuit:500,glass:500},{motor:300,lens:300,steel:500},{processor:200,film:500,frame:200},{photonic:200,composite:300,coil:500},{lattice:50,servo:200,wafer:1000},{aether:500,lattice:150},{lattice:400,photonic:2000},{lattice:1000,aether:3000}];
const HAUL_COST=[{steel:500,copper:1000},{frame:300,coil:200},{servo:100,composite:200},{photonic:300,film:1000},{lattice:100,aether:200}];
const UPG={
  belt:{n:'Conveyor speed',d:'Conveyors and Crossings move items 20% faster per level.',cost:L=>tierCost(BELT_COST,6,L),eff:L=>`+${L*20}% now, +${(L+1)*20}% next`},
  night:{n:'Night shift',max:8,d:'Your factory earns more while you’re away: +10% offline output per level, up to 100%.',cost:L=>NIGHT_COST[Math.min(L,NIGHT_COST.length-1)],eff:L=>`${Math.min(100,20+L*10)}% now${L<8?`, ${20+(L+1)*10}% next`:''}`},
  haul:{n:'Long haul',max:10,d:'Offline time counts longer: +4 hours per level, from 8 hours up to 48.',cost:L=>tierCost(HAUL_COST,4,L),eff:L=>`${8+4*L} h now${L<10?`, ${12+4*L} h next`:''}`},
  vein:{n:'Deep veins',d:'Drills pull more from every tile, so ferrite, cuprite and silica patches last 1.5× longer per level. Carbon isn’t affected.',cost:L=>tierCost(VEIN_COST,7,L),eff:L=>`×${Math.pow(1.5,L).toFixed(2)} now, ×${Math.pow(1.5,L+1).toFixed(2)} next`}
};
function ssLv(k){return (S&&S.ss&&S.ss[k])||0}
function nupLv(k){return (S&&S.nup&&S.nup[k])||0}
function relN(k){let n=0;for(const r of (S&&S.relics)||[])if(r===k)n++;return n}
// ---------- account-wide profile (challenge results, challenge relics, daily bests) ----------
const META_KEY='halo-foundry-meta';
const SLOT_KEYS=[SAVE_KEY,SAVE_KEY+'-s2',SAVE_KEY+'-s3'],DAILY_KEY=SAVE_KEY+'-daily',CH_KEY=SAVE_KEY+'-ch';
let META=(()=>{try{return JSON.parse(localStorage.getItem(META_KEY)||'{}')||{}}catch(_){return{}}})();
META.ch=META.ch||{};META.crelics=META.crelics||[];META.daily=META.daily||{};
let CUR=[...SLOT_KEYS,DAILY_KEY,CH_KEY].includes(META.last)?META.last:SAVE_KEY;
function saveMeta(){try{localStorage.setItem(META_KEY,JSON.stringify(META))}catch(_){}}
function mode(){return (S&&S.mode)||'campaign'}
function isCamp(){return mode()==='campaign'}
function modOn(k){return !!(S&&S.mod===k)}
function chal(){return S&&S.ch?CHALLENGES[S.ch]:null}
// Sum of one relic stat over this game's relics, plus challenge relics (main game only)
function relStat(k){let v=0;const add=r=>{const f=RELICS[r]&&RELICS[r].fx;if(f&&f[k])v+=f[k]};for(const r of (S&&S.relics)||[])add(r);if(isCamp())for(const r of META.crelics)add(r);return v}
function rp(k){return 1+relStat(k)/100}
function banned(t){const c=chal();return !!((c&&c.ban&&c.ban.includes(t))||(t==='combustor'&&modOn('eternal')))}
function ascN(){return (S&&S.asc&&S.asc.n)||0}
function lifeSeeds(){return (S&&S.asc&&S.asc.total)||0}
// Every Starseed ever earned: +1% ore per tile, +1% duplication for Fabricators and Uplinks (capped at 100%)
function dupP(){return Math.min(1,.01*lifeSeeds()+relStat('dup')/100)}
function coreKW(){return CORE_GEN*(1+.2*ascN())*rp('core')}
function drillR(t){return B[t].r+(t==='deepdrill'?nupLv('reach'):0)}
function drillMult(b){return (B[b.t].mult||1)*(b.t==='deepdrill'?1+.2*nupLv('bore'):1)*rp('drill')*(modOn('thin')?1.5:1)}
function oreUse(b){return (b.t==='deepdrill'?.5*Math.pow(.85,nupLv('thrift')):1)*(modOn('thin')?2:1)}
// Deep veins doesn't apply to carbon
function veinMul(o){return Math.pow(1.5,o==='carbon'?0:(S.up&&S.up.vein)||0)*(1+.01*lifeSeeds())*rp('ore')}
// Every Menu upgrade level compounds the halo: ×1.01 per level
function upTotal(){let n=0;for(const k in (S.up||{}))n+=S.up[k]||0;return n}
function haloMul(){return Math.pow(1.01,upTotal())}
function petalKW(){return (S.res&&S.res.done.mirrors?24:8)*haloMul()*rp('petal')}
// Constellations and Commander points
function constN(p){let i=0;while(p>=constReq(i))i++;return i}
function cmdLv(k){return (S&&S.cmd&&S.cmd[k])||0}
function cmdLevels(c){let n=0;for(const k in (c||{}))n+=c[k]||0;return n}
// Points: banked from earlier moons plus Constellations on this one, minus what's been spent. Each level of a path costs more.
function cmdPts(){return Math.max(0,(S.cmdBank||0)+ascN()+constN(S.petals)-(S.cmdSpent||0))}
function cmdCost(k){return 1+Math.floor(cmdLv(k)/2)}
function roman(n){const T=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];let s='';for(const [v,c] of T)while(n>=v){s+=c;n-=v}return s}
function stellarMul(){return (1+.1*cmdLv('stellar'))*rp('solar')}
// Furnace ladder perks, summed over every tier reached
function fPerk(k){let v=0;for(let i=0;i<(S.ft||0);i++)v+=frung(i)[k]||0;return v}
function burnPow(){return (1+fPerk('pow'))*rp('burn')}
function fuelMul(){return (1+fPerk('fuel'))*(1+.1*cmdLv('ember'))*rp('fuel')}
function emberChance(){return .02*(1+fPerk('ember'))*rp('ember')*(modOn('embermoon')?3:1)}
function toolTip(t){const d=B[t];return `<b>${d.n}</b> <span class="cost">${costStr(costOf(t))}${d.pw?' · '+d.pw+' kW':''}${d.gen?' · +'+fmtW(d.gen):''}</span><br>${d.d}`}
function costStr(c){return Object.keys(c).map(k=>c[k]+' '+ITEMS[k].s).join(' · ')}
function addInv(t,n){S.inv[t]=(S.inv[t]||0)+(n||1);S.seen[t]=1}

function init(t){
  switch(t){
    case 'belt':return{items:[],vin:0};
    case 'drill':case 'deepdrill':return{prog:0,out:0,ang:0,dep:false};
    case 'junction':return{lanes:[[],[]]};
    case 'smelter':case 'foundry':return{inT:null,inN:0,outT:null,outN:0,prog:0,run:false,cur:null,heat:0};
    case 'fab':case 'fab2':case 'assembler':return{rec:null,buf:{},outN:0,prog:0,run:false,ang:0};
    case 'refinery':return{n:0,run:false,prog:0,outN:0,ang:0};
    case 'reactor':return{fuel:0,energy:0,load:0,heat:0,ang:0};
    case 'splitter':return{hold:null,rr:0,pri:null};
    case 'sorter':return{hold:null,filter:null,rr:0,sd:0};
    case 'batcher':return{st:{},ratio:{},q:[[],[]],rr:0,alt:0};
    case 'combustor':return{fuel:0,energy:0,load:0,heat:0,ember:0};
    case 'turbine':return{fuel:0,energy:0,load:0,heat:0,ang:0};
    case 'uplink':return{q:[],prog:0,ph:0};
    case 'ring':return{n:0,prog:0,ang:0};
    default:return{ang:0};
  }
}
function drillType(x,y,r,w){
  w=w||1;const own=oreAt(x,y);if(own)return own;
  for(let yy=y-r;yy<=y+w-1+r;yy++)for(let xx=x-r;xx<=x+w-1+r;xx++){const o=oreAt(xx,yy);if(o)return o}
  return null;
}
function place(t,x,y,d,free,oreForce){
  const w=B[t].w||1;
  for(let j=0;j<w;j++)for(let i=0;i<w;i++){const xx=x+i,yy=y+j;if(xx<0||yy<0||xx>=W||yy>=H||S.grid[yy*W+xx])return 'blocked';if(!free&&!inLim(xx,yy))return 'frontier';if(!free&&SEEDT&&SEEDT[yy*W+xx])return 'seed'}
  if(!free&&banned(t))return 'banned';
  if(!free&&chal()&&chal().cap&&t!=='belt'&&t!=='junction'&&bCount()>=chal().cap)return 'cap';
  let ore=null;if(B[t].r){ore=oreForce||drillType(x,y,drillR(t),w);if(!ore)return 'ore'}
  if(!free&&B[t].cost){const c=costOf(t);if(!canAfford(c))return 'cost';pay(c,-1)}
  const b=Object.assign({id:S.nid++,t,x,y,d:d|0,w},init(t));
  if(ore)b.ore=ore;
  for(let j=0;j<w;j++)for(let i=0;i<w;i++)S.grid[(y+j)*W+x+i]=b.id;
  S.bs.set(b.id,b);
  const conv=t==='belt'||t==='junction';
  if(!free&&(S.ms>=TUT||!conv)){b.bp=true;if(conv&&G.stroke)G.stroke.push(b.id);else S.pq.push([b.id])}
  dirty=true;return b;
}
function contents(b){
  const o=[];const add=(t,n)=>{for(let i=0;i<n;i++)o.push(t)};
  switch(b.t){
    case 'belt':b.items.forEach(it=>o.push(it.t));break;
    case 'drill':case 'deepdrill':add(b.ore,b.out);break;
    case 'junction':b.lanes.forEach(l=>l.forEach(i=>o.push(i.t)));break;
    case 'smelter':case 'foundry':if(b.inT)add(b.inT,b.inN);if(b.outT)add(b.outT,b.outN);if(b.run&&b.cur)add(Object.keys(SMELT).find(k=>SMELT[k]===b.cur),1);break;
    case 'fab':case 'fab2':case 'assembler':for(const k in b.buf)add(k,b.buf[k]);if(b.rec)add(b.rec,b.outN);break;
    case 'refinery':add('aether',b.outN);break;
    case 'reactor':add('aether',b.fuel);break;
    case 'splitter':case 'sorter':if(b.hold)o.push(b.hold);break;
    case 'batcher':for(const k in b.st)add(k,b.st[k]);(b.q||[]).forEach(a=>o.push(...a));break;
    case 'combustor':add('carbon',b.fuel);add('ember',b.ember);break;
    case 'turbine':add('carbon',b.fuel);break;
    case 'uplink':o.push(...b.q);break;
    case 'ring':add('petal',b.n);break;
  }
  return o;
}
function removeB(b){
  if(!b||b.t==='core')return false;
  for(let j=0;j<b.w;j++)for(let i=0;i<b.w;i++)S.grid[(b.y+j)*W+b.x+i]=0;
  S.bs.delete(b.id);pay(costOf(b.t),1);contents(b).forEach(t=>addInv(t));
  if(sel===b)closeSheet();dirty=true;return true;
}

// which tiles a building pushes into
// Output leaves from the edge tile nearest the centre (top/left one on even sizes)
function outTile(b,d){const w=b.w||1,m=Math.floor((w-1)/2);return d===1?[b.x+w,b.y+m]:d===3?[b.x-1,b.y+m]:d===0?[b.x+m,b.y-1]:[b.x+m,b.y+w]}
function outputsTo(nb,x,y){
  if(!nb||nb.bp)return false;
  if(nb.t==='junction')return Math.abs(nb.x-x)+Math.abs(nb.y-y)===1;
  if(nb.t==='splitter'||nb.t==='sorter'){for(const d of [nb.d,(nb.d+1)&3,(nb.d+3)&3]){const v=DIRS[d];if(nb.x+v[0]===x&&nb.y+v[1]===y)return true}return false}
  if(nb.t==='batcher'){for(let i=0;i<2;i++){const o=batOut(nb,i);if(o[0]===x&&o[1]===y)return true}return false}
  if(B[nb.t].dir){const o=outTile(nb,nb.d);return o[0]===x&&o[1]===y}
  return false;
}
function recalc(){
  const cnt={};
  for(const b of S.bs.values()){
    cnt[b.t]=(cnt[b.t]||0)+1;
    if(b.t!=='belt')continue;
    const back=opp(b.d),bv=DIRS[back];
    if(outputsTo(at(b.x+bv[0],b.y+bv[1]),b.x,b.y)){b.vin=back;continue}
    const L=(b.d+3)&3,R=(b.d+1)&3,lv=DIRS[L],rv=DIRS[R];
    const l=outputsTo(at(b.x+lv[0],b.y+lv[1]),b.x,b.y),r=outputsTo(at(b.x+rv[0],b.y+rv[1]),b.x,b.y);
    b.vin=(l&&!r)?L:(r&&!l)?R:back;
  }
  S.cnt=cnt;
}

// ================= transfer =================
function accept(nb,t,side){
  if(nb.bp)return false;
  switch(nb.t){
    case 'belt':{
      if(side===nb.d)return false;
      const L=nb.items[nb.items.length-1];if(L&&L.p<SP)return false;
      nb.items.push({t,p:0,f:side});return true;}
    case 'junction':{const lane=nb.lanes[side&1],L=lane[lane.length-1];if(L&&L.p<SP)return false;lane.push({t,p:0,d:opp(side)});return true;}
    case 'smelter':case 'foundry':
      if(!SMELT[t]||nb.inN>=(nb.t==='foundry'?30:6)||(nb.inN>0&&nb.inT!==t))return false;
      nb.inT=t;nb.inN++;return true;
    case 'fab':case 'fab2':case 'assembler':{
      if(!nb.rec)return false;const need=RECIPES[nb.rec].in[t];if(!need)return false;
      const c=nb.buf[t]||0;if(c>=Math.max(need*2,4))return false;nb.buf[t]=c+1;return true;}
    case 'splitter':case 'sorter':if(nb.hold)return false;nb.hold=t;return true;
    case 'batcher':{
      if(side===nb.d)return false;const has=Object.keys(nb.ratio).length;
      if(has&&!nb.ratio[t])return false;
      if(!has&&!nb.st[t]&&Object.keys(nb.st).filter(k=>nb.st[k]>0).length>=6)return false;
      if((nb.st[t]||0)>=50)return false;nb.st[t]=(nb.st[t]||0)+1;return true;}
    case 'combustor':if(t!=='carbon'||nb.fuel>=8)return false;nb.fuel++;return true;
    case 'turbine':if(t!=='carbon'||nb.fuel>=20)return false;nb.fuel++;return true;
    case 'reactor':if(t!=='aether'||nb.fuel>=4)return false;nb.fuel++;return true;
    case 'refinery':if(!ORE_P[t]||nb.n>=refRatio()+200)return false;nb.n++;stat('c',t);return true;
    case 'uplink':if(nb.q.length>=6)return false;nb.q.push(t);return true;
    case 'ring':if(t!=='petal'||nb.n>=4)return false;nb.n++;return true;
    case 'core':deliver(t);return true;
  }
  return false;
}
// Batcher: two output slots side by side on its bright edge
function batOut(b,i){const d=b.d;return d===1?[b.x+2,b.y+i]:d===3?[b.x-1,b.y+i]:d===0?[b.x+i,b.y-1]:[b.x+i,b.y+2]}
function batPush(b,t,i){const o=batOut(b,i),nb=at(o[0],o[1]);if(!nb||nb===b)return false;return accept(nb,t,opp(b.d))}
// Several output slots: ports are [side, slot along that side]; tries them in turn, starting after the last one used
function edgeTile(b,d,i){const w=b.w||1;return d===1?[b.x+w,b.y+i]:d===3?[b.x-1,b.y+i]:d===0?[b.x+i,b.y-1]:[b.x+i,b.y+w]}
function pushPorts(b,t,ports){const n=ports.length,s=(b.rr||0)%n;for(let k=0;k<n;k++){const i=(s+k)%n,[d,j]=ports[i],o=edgeTile(b,d,j),nb=at(o[0],o[1]);if(nb&&nb!==b&&accept(nb,t,opp(d))){b.rr=(i+1)%n;return true}}return false}
function outPorts(b){return b.t==='deepdrill'?[[b.d,0],[opp(b.d),0],[b.d,1],[opp(b.d),1]]:b.t==='foundry'?[[b.d,0],[b.d,1],[b.d,2]]:null}
function bCount(){let n=0;for(const b of S.bs.values())if(b.t!=='belt'&&b.t!=='junction'&&b.t!=='core')n++;return n}
function drillCap(b){return b.t==='deepdrill'?2:1}
function drillHasOut(b){const ts=b.t==='deepdrill'?outPorts(b).map(([d,j])=>edgeTile(b,d,j)):[outTile(b,b.d)];return ts.some(([x,y])=>{const q=at(x,y);return q&&q!==b&&!q.bp})}
function pushDir(b,t,d){const o=outTile(b,d);const nb=at(o[0],o[1]);if(!nb||nb===b)return false;return accept(nb,t,opp(d))}

function deliver(t,quiet){
  stat('d',t);S.flags.del++;S.seen[t]=1;if(!quiet)sfx('core',CX,CY);
  if(S.mode==='daily'&&S.time<DAILY_LEN)S.dscore=(S.dscore||0)+(VAL[t]||1);
  if(S.ch==='handfed'&&EVERY_ITEMS.includes(t)){S.chd=S.chd||{};S.chd[t]=(S.chd[t]||0)+1}
  const m=MS[S.ms];
  if(m&&!m.launch&&m.req[t]&&(S.prog[t]||0)<m.req[t]){S.prog[t]=(S.prog[t]||0)+1;checkMs()}
  else addInv(t);
}
function msDone(m){for(const k in m.req)if((S.prog[k]||0)<m.req[k])return false;return true}
function checkMs(){
  const m=MS[S.ms];if(!m||!msDone(m))return;
  m.unl.forEach(t=>{if(!S.unl.includes(t)){S.unl.push(t);S.newT.push(t)}});
  m.rec.forEach(r=>{if(!S.rec.includes(r))S.rec.push(r)});
  S.ms++;S.prog={};
  if(S.ms<MS.length&&MS[S.ms].launch)S.prog.petal=Math.min(S.petals,PET_GOAL);
  burst(CX,CY,'#f3c25a',40);sfx('fanfare');
  const names=[...m.unl.map(t=>B[t].n),...m.rec.map(r=>ITEMS[r].n)];
  if(S.ms===TUT){setTimeout(showFinale,900)}
  else if(S.ms>=MS.length)showBanner('Grid Charter signed','Generators now run flat out and spare power fills your Charge bank. Tap the top bar to start research.');
  else showBanner('Milestone complete · '+m.n,names.length?('Unlocked: '+names.join(', ')+'.'):'Keep going. The next step is in the top bar.');
  buildDock();save();
}
function launch(b){
  const c0=constN(S.petals);S.petals++;LAUNCHED++;sfx('launch',b.x+1.5,b.y+1.5);
  if(constN(S.petals)>c0){const n=constN(S.petals);burst(CX,CY,'#d8b4ff',40);sfx('fanfare');showBanner('Constellation '+roman(n)+' complete',`${S.petals} petals in orbit. +1 Commander point: spend it in Menu → Commander. Next constellation at ${constReq(n)}.`);save()}
  PARTS.push({k:'petal',x:b.x+1.5,y:b.y+1.5,vx:(Math.random()-.5)*.4,vy:-1.2,life:3.2,max:3.2});
  const m=MS[S.ms];
  if(m&&m.launch){S.prog.petal=Math.min(PET_GOAL,(S.prog.petal||0)+1);checkMs()}
}

// ================= simulation =================
function dayPhase(){return (S.time/DAY_LEN+0.18)%1}
function daylight(){if(modOn('eternal'))return 1;return Math.max(0,Math.min(1,Math.sin(dayPhase()*Math.PI*2)*1.3+(modOn('longnight')?-.15:.5)))}

function sim(dt){
  S.time+=dt;statTick(dt);BV=BELT_V*(1+.2*((S.up&&S.up.belt)||0))*rp('belt')*(modOn('lowg')?1.5:1);
  const day=daylight();
  let demand=0,solar=S.petals*petalKW(),cap=0;const comb=[];
  for(const b of S.bs.values()){
    if(b.bp)continue;
    if(b.t==='relay')b.active=true;
    if(b.active&&B[b.t].pw)demand+=b.t==='uplink'?uplinkPw(b):b.t==='deepdrill'?B.deepdrill.pw*(1-.25*nupLv('cool')):B[b.t].pw;
    if(b.t==='solar')solar+=45*day;
    else if(b.t==='collector')solar+=400*(.25+.75*day);
    else if(b.t==='filmarray')solar+=300*(.4+.6*day);
    else if(B[b.t].burn&&(b.energy>0||b.fuel>0)){cap+=B[b.t].gen;comb.push(b)}
  }
  const gridOn=S.ms>=MS.length,gmul=(1+.1*repLv('harmonics'))*(modOn('embermoon')?.8:1);solar*=gmul*stellarMul();cap*=gmul*burnPow();const base=coreKW()*gmul*(modOn('unstable')?day:1)+solar;
  const need=Math.max(0,demand-base),load=cap?(gridOn?1:Math.min(1,need/cap)):0,gen=base+cap*load;
  const sat0=demand>0?Math.min(1,gen/demand):1;
  PW={gen,demand,sat:sat0,cap:base+cap,day,solar,burn:cap*load};
  const sat=sat0*gridMul();
  for(const b of S.bs.values()){if(B[b.t].burn){b.load=comb.includes(b)?load:0;b.heat+=(b.load-b.heat)*Math.min(1,dt*2);if(b.t!=='combustor')b.ang+=dt*b.heat*(b.t==='reactor'?1.2:4)}}
  for(const c of comb){c.energy-=dt*load;if(c.energy<=0&&c.fuel>0){c.fuel--;stat('c',c.t==='reactor'?'aether':'carbon');c.energy+=B[c.t].burn*fuelMul();if(c.t!=='reactor'&&Math.random()<emberChance()){stat('p','ember');if(c.t==='turbine')addInv('ember');else if(c.ember<5)c.ember++}else if(c.t==='reactor'&&Math.random()<NOVA_P*rp('nova')){stat('p','nova');addInv('nova');novaFound()}}if(c.energy<0)c.energy=0}
  if(gridOn){const k=Math.min(1,dt/20);S.gavg+=(solar-S.gavg)*k;S.favg=(S.favg||0)+(cap*load-(S.favg||0))*k;if(S.gavg>=rung(S.gt).kw)climbRung();if(S.favg>=frung(S.ft||0).kw)climbFurnace();S.charge=Math.min(chargeCap(),(S.charge||0)+Math.max(0,gen-demand)*dt/1000);researchTick()}
  stepPulses(dt);seedTick(dt);trickleTick(dt);

  for(const b of S.bs.values()){
    if(b.bp)continue;
    switch(b.t){
      case 'drill':case 'deepdrill':{
        const P=ORE_P[b.ore];
        b.active=b.out<drillCap(b)&&!b.dep&&!b.wait&&drillHasOut(b);
        if(b.active){b.prog+=dt*sat*P.rate*drillMult(b);b.ang+=dt*sat*(3+P.rate*3);if(b.prog>=1){const mo=mineOne(b);if(mo<0){b.prog=1;b.wait=true;b.active=false}else if(mo){b.prog-=1;b.out++;stat('p',b.ore);sfx('drill',b.x+.5,b.y+.5,b.ore)}else{b.dep=true;b.prog=0;b.active=false}}}
        if(b.out>0&&(b.t==='deepdrill'?pushPorts(b,b.ore,outPorts(b)):pushDir(b,b.ore,b.d)))b.out--;
        break;}
      case 'junction':
        for(const lane of b.lanes){
          for(let i=0;i<lane.length;i++){const it=lane[i],lim=i===0?1:lane[i-1].p-SP;it.p=Math.min(it.p+BV*dt,Math.max(lim,it.p))}
          if(lane.length&&lane[0].p>=1&&pushDir(b,lane[0].t,lane[0].d))lane.shift();
        }
        break;
      case 'combustor':if(b.ember>0&&pushDir(b,'ember',b.d))b.ember--;break;
      case 'smelter':case 'foundry':
        if(!b.run&&b.inN>0&&b.outN<(b.t==='foundry'?16:4)&&(b.outN===0||b.outT===SMELT[b.inT])){b.run=true;b.prog=0;b.cur=SMELT[b.inT];b.ct=SMELT_T[b.inT];stat('c',b.inT);b.inN--;if(!b.inN)b.inT=null}
        b.active=b.run;
        if(b.run){b.prog+=dt*sat*(B[b.t].mult||1)*rp('smelt')/(b.ct||1);if(b.prog>=1){b.run=false;b.outT=b.cur;b.outN++;stat('p',b.cur);sfx('smelt',b.x+.5,b.y+.5)}}
        b.heat+=((b.run?sat:0)-b.heat)*Math.min(1,dt*2.5);
        if(b.outN>0&&(b.t==='foundry'?pushPorts(b,b.outT,outPorts(b)):pushDir(b,b.outT,b.d))){b.outN--;if(!b.outN)b.outT=null}
        break;
      case 'fab':case 'fab2':case 'assembler':{
        const r=b.rec&&RECIPES[b.rec];
        if(r&&!b.run&&b.outN+r.out<=Math.max(4,r.out*2)){
          let ok=true;for(const k in r.in)if((b.buf[k]||0)<r.in[k]){ok=false;break}
          if(ok){for(const k in r.in){b.buf[k]-=r.in[k];stat('c',k,r.in[k])}b.run=true;b.prog=0}
        }
        b.active=b.run;
        if(b.run){b.prog+=dt*sat*(B[b.t].mult||1)*rp('fab')/r.t;b.ang+=dt*sat*2;if(b.prog>=1){b.run=false;b.outN+=r.out;stat('p',b.rec,r.out);if(Math.random()<dupP()){b.outN+=r.out;stat('p',b.rec,r.out)}sfx('craft',b.x+b.w/2,b.y+b.w/2)}}
        if(r&&b.outN>0&&pushDir(b,b.rec,b.d))b.outN--;
        break;}
      case 'batcher':{
        // two output slots run at once, each with its own queue of whole sets
        if(!b.q)b.q=[[],[]];const Rt=b.ratio,ks=Object.keys(Rt);b.alt^=1;
        for(let j=0;j<2;j++){const i=(b.alt+j)%2;
          if(ks.length){
            if(!b.q[i].length&&ks.every(k=>(b.st[k]||0)>=Rt[k])){
              const order=[];ks.forEach(k=>{for(let n=0;n<Rt[k];n++)order.push([(n+.5)/Rt[k],k])});order.sort((a,c)=>a[0]-c[0]);
              ks.forEach(k=>b.st[k]-=Rt[k]);b.q[i]=order.map(o=>o[1]);
            }
            if(b.q[i].length&&batPush(b,b.q[i][0],i))b.q[i].shift();
          }else{
            const have=Object.keys(b.st).filter(k=>b.st[k]>0);
            if(have.length){const k=have[b.rr%have.length];if(batPush(b,k,i)){b.st[k]--;b.rr++}}
          }
        }
        break;}
      case 'splitter':
        if(b.hold){const ds=[b.d,(b.d+3)&3,(b.d+1)&3];if(b.pri!=null&&pushDir(b,b.hold,ds[b.pri]))b.hold=null;else for(let k=0;k<3;k++){const i=(b.rr+k)%3;if(i===b.pri)continue;if(pushDir(b,b.hold,ds[i])){b.hold=null;b.rr=(i+1)%3;break}}}
        break;
      case 'sorter':
        if(b.hold){
          const all=[b.d,(b.d+3)&3,(b.d+1)&3],sd=b.sd||0,pick=all[sd],rest=all.filter((_,i)=>i!==sd);
          if(!b.filter||b.hold===b.filter){if(pushDir(b,b.hold,pick))b.hold=null}
          else{for(let k=0;k<2;k++){const i=(b.rr+k)%2;if(pushDir(b,b.hold,rest[i])){b.hold=null;b.rr=(i+1)%2;break}}}
        }
        break;
      case 'uplink':
        b.active=b.q.length>0;b.ph+=dt*(b.active?sat*3:0.6);
        if(b.active){b.prog+=dt*sat*uplinkRate(b);while(b.prog>=1&&b.q.length){const t=b.q.shift();deliver(t);if(Math.random()<dupP())deliver(t,true);b.prog-=1}if(!b.q.length)b.prog=0}
        break;
      case 'ring':
        {const need=modOn('lowg')?2:1;b.active=b.n>=need;b.ang+=dt*(b.active?sat*1.2:0.15);
        if(b.active){b.prog+=dt*sat/2.5;if(b.prog>=1){b.prog=0;b.n-=need;stat('c','petal',need);launch(b)}}}
        break;
      case 'refinery':{
        const ratio=refRatio();b.active=b.n>0||b.run;
        if(!b.run&&b.n>=ratio&&b.outN<2){b.n-=ratio;b.run=true;b.prog=0}
        b.ang+=dt*(b.active?sat*2.5:0);
        if(b.run){b.prog+=dt*sat/3;if(b.prog>=1){b.run=false;b.outN++;stat('p','aether');S.refined=(S.refined||0)+1}}
        if(b.outN>0&&pushDir(b,'aether',b.d))b.outN--;
        break;}
      case 'core':b.ang+=dt*0.35;break;
      case 'belt':{
        const its=b.items;
        for(let i=0;i<its.length;i++){
          const it=its[i],lim=i===0?1:its[i-1].p-SP;
          it.p=Math.min(it.p+BV*dt,Math.max(lim,it.p));
        }
        if(its.length&&its[0].p>=1&&pushDir(b,its[0].t,b.d)){its.shift();b.fc=(b.fc||0)+1}
        break;}
    }
  }
}

// ================= construction pulses & grid ladder =================
function pulseSpd(){let v=11*rp('pulse')*(modOn('lowg')?2:1);for(let i=0;i<Math.min(S.gt,RUNGS.length);i++)if(RUNGS[i].spd)v*=RUNGS[i].spd;return v}
// Uplinks: 4 items/s beside the Core, slowing with distance, while power draw climbs 3 kW per tile
function coreDist(b){return Math.hypot(b.x+.5-CX,b.y+.5-CY)}
function uplinkRate(b){return 4*rp('up')/(1+Math.max(0,coreDist(b)-3)/8)}
function uplinkPw(b){return Math.round(60+3*coreDist(b))}
function pulseSlots(){return 1+(S.ms>=TUT?1:0)+(S.gt>=5?1:0)}
function gridMul(){let n=0;for(let i=0;i<S.gt;i++)if(rung(i).oc)n++;return (1+0.1*n)*(1+.05*repLv('overcharge'))*(1+.05*cmdLv('industrialist'))*rp('spd')}
// Pulses travel like circuit traces: right-angle steps with only a faint wobble
function makePulse(ids,ox,oy){
  const T=ids.map(id=>{const b=S.bs.get(id);return[b.x+b.w/2,b.y+b.w/2]});
  const tx=T[0][0],ty=T[0][1],dx=tx-ox,dy=ty-oy,L=Math.abs(dx)+Math.abs(dy),n=Math.max(1,Math.min(4,Math.round(L/16))),xFirst=Math.abs(dx)>=Math.abs(dy);
  const way=[[ox,oy]];let cx=ox,cy=oy;
  for(let i=0;i<n;i++){if(xFirst){cx+=dx/n;way.push([cx,cy]);cy+=dy/n;way.push([cx,cy])}else{cy+=dy/n;way.push([cx,cy]);cx+=dx/n;way.push([cx,cy])}}
  const pts=[],cum=[0],marks=[],corners=[],ph=Math.random()*6.283;let dist=0;
  const add=q=>{if(pts.length)cum.push(cum[cum.length-1]+Math.hypot(q[0]-pts[pts.length-1][0],q[1]-pts[pts.length-1][1]));pts.push(q)};
  for(let i=1;i<way.length;i++){
    const a=way[i-1],b=way[i],sl=Math.hypot(b[0]-a[0],b[1]-a[1]);if(sl<1e-6)continue;
    const ux=(b[0]-a[0])/sl,uy=(b[1]-a[1])/sl,N=Math.max(2,Math.ceil(sl*3));
    for(let j=pts.length?1:0;j<=N;j++){const f=j/N,dd=dist+sl*f,taper=Math.max(0,Math.min(1,f*sl/1.2,(1-f)*sl/1.2)),w=.18*Math.sin(dd*1.6+ph)*taper;add([a[0]+(b[0]-a[0])*f-uy*w,a[1]+(b[1]-a[1])*f+ux*w])}
    dist+=sl;if(i<way.length-1)corners.push(cum[cum.length-1]);
  }
  if(!pts.length)add([ox,oy]);if(pts.length<2)add([tx,ty]);
  marks.push(cum[cum.length-1]);
  for(let j=1;j<T.length;j++){add(T[j]);marks.push(cum[cum.length-1])}
  return{ids,pts,cum,marks,corners,len:cum[cum.length-1],d:0,k:0};
}
function ptAt(p,d){const c=p.cum;let i=1;while(i<c.length-1&&c[i]<d)i++;const a=p.pts[i-1],b=p.pts[i],f=Math.max(0,Math.min(1,(d-c[i-1])/((c[i]-c[i-1])||1)));return[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f]}
let sweepT=0;const MATS=[];
function stepPulses(dt){
  for(let i=MATS.length-1;i>=0;i--){const b=S.bs.get(MATS[i]);if(!b||!b.bp){MATS.splice(i,1);continue}b.mat+=dt/.9;if(b.mat>=1){delete b.mat;b.bp=false;dirty=true;MATS.splice(i,1);burst(b.x+b.w/2,b.y+b.w/2,'#7ff0d0',10)}}
  sweepT+=dt;
  if(sweepT>2){sweepT=0;const q=new Set();S.pq.forEach(e=>e.forEach(id=>q.add(id)));S.pulses.forEach(p=>p.ids.forEach(id=>q.add(id)));if(G.stroke)G.stroke.forEach(id=>q.add(id));for(const b of S.bs.values())if(b.bp&&!q.has(b.id))S.pq.push([b.id])}
  const slots=pulseSlots();
  while(S.pulses.length<slots&&S.pq.length){
    const ids=S.pq.shift().filter(id=>{const b=S.bs.get(id);return b&&b.bp});if(!ids.length)continue;
    const f=S.bs.get(ids[0]),tx=f.x+f.w/2,ty=f.y+f.w/2;let ox=CX,oy=CY,bd=Math.hypot(tx-CX,ty-CY);
    for(const q of S.bs.values())if(q.t==='relay'&&!q.bp){const d=Math.hypot(tx-q.x-.5,ty-q.y-.5);if(d<bd){bd=d;ox=q.x+.5;oy=q.y+.5}}
    S.pulses.push(makePulse(ids,ox,oy));sfx('pulse',ox,oy);
  }
  const v=pulseSpd();
  for(let i=S.pulses.length-1;i>=0;i--){
    const p=S.pulses[i],hd=ptAt(p,p.d);p.d+=v*dt*pulseZone(hd[0],hd[1]);
    while(p.k<p.ids.length&&p.marks[p.k]<=p.d){const b=S.bs.get(p.ids[p.k]);if(b&&b.bp){if(b.t==='belt'||b.t==='junction'){b.bp=false;dirty=true;sfx('lay',b.x+.5,b.y+.5);burst(b.x+.5,b.y+.5,'#7ff0d0',3)}else if(b.mat==null){b.mat=0;MATS.push(b.id);sfx('build',b.x+b.w/2,b.y+b.w/2)}}p.k++}
    if(p.d>=p.len)S.pulses.splice(i,1);
  }
}
// Pulses crawl outside the original 128×128 start area, which makes relays and local production worth building
function pulseZone(x,y){return Math.abs(x-CX)<64&&Math.abs(y-CY)<64?1:0.4}
function pulseEta(p,m){let t=0;for(let i=1;i<p.pts.length;i++){const a=Math.max(p.cum[i-1],p.d),b=Math.min(p.cum[i],m);if(b>a){const q=p.pts[i];t+=(b-a)/pulseZone(q[0],q[1])}}return t/pulseSpd()}
function pulseInfo(b){if(b.mat!=null)return 'materializing';const p=S.pulses.find(p=>p.ids.includes(b.id));if(p){const m=p.marks[p.ids.indexOf(b.id)];return 'pulse arriving in '+Math.max(0,pulseEta(p,m)).toFixed(1)+'s'}const q=S.pq.findIndex(e=>e.includes(b.id));return q>=0?'waiting for a pulse ('+(q+1)+' in line)':'waiting for a pulse'}
function climbRung(){
  const r=rung(S.gt);S.gt++;
  (r.unl||[]).forEach(t=>{if(!S.unl.includes(t)){S.unl.push(t);S.newT.push(t)}});
  (r.rec||[]).forEach(k=>{if(!S.rec.includes(k))S.rec.push(k)});
  burst(CX,CY,'#7ff0d0',40);sfx('fanfare');showBanner('Grid tier '+S.gt+' · '+r.n,r.d+' Next: '+fmtW(rung(S.gt).kw)+' sustained.');buildDock();save();
}

// Nova shards: the Aether reactor's Ember shard. About 1 in 100 Aether burned leaves one.
const NOVA_P=.01;
function novaFound(){if(S.flags.nova)return;S.flags.nova=1;save();
  setTimeout(()=>openModal(`<span class="eyebrow">Something rare</span><h1>A Nova shard</h1><div class="ms-req"><span class="req done"><img src="${ICON.nova}" alt="Nova shard">+1</span></div><p>Your Aether Reactor left behind a <strong>Nova shard</strong>, the Aether version of an Ember shard. Only about 1 in 100 Aether burned leaves one, and it goes straight to storage.</p><p>Nova shards are kept when you Ascend. Hold on to them: future upgrades will use them.</p><button class="btn primary" data-close>Keep it</button>`),400)}
function climbFurnace(){
  const r=frung(S.ft||0);S.ft=(S.ft||0)+1;
  burst(CX,CY,'#ff9a5a',40);sfx('fanfare');showBanner('Furnace tier '+S.ft+' · '+r.n,r.d+' Next: '+fmtW(frung(S.ft).kw)+' sustained from burners.');save();
}

// ================= ascension =================
// Available once any Aether sits in storage. Starseeds = floor(√Aether in storage).
function canAscend(){return isCamp()&&S.ms>=MS.length&&(S.inv.aether||0)>=1}
function modSeedMul(){return S.mod&&MODS[S.mod]?MODS[S.mod].seeds:1}
function ascSeeds(){return Math.floor(Math.sqrt(S.inv.aether||0)*rp('seeds')*modSeedMul())}
function ascMenu(){
  const A=S.asc||{n:0,seeds:0};if(!canAscend()&&!A.n&&!lifeSeeds())return '';
  return `<div class="sec-label">Ascension${A.n?' · '+A.n+' so far':''}</div>
  <div class="actions" style="align-items:center"><p style="flex:1;font-size:14px"><strong>${(A.seeds||0).toLocaleString()} Starseeds</strong> to spend${S.relicPick?' · <strong>a Relic to choose</strong>':''}${canAscend()?' · ready to Ascend':''}</p><button class="btn${canAscend()||S.relicPick?' primary':''}" style="flex:none;padding:0 16px" data-ascopen>Open</button></div>`;
}
function novaMenu(){
  const have=S.inv.nova||0;if(!have&&!S.flags.nova&&!Object.keys(S.nup||{}).length)return '';
  return `<div class="sec-label">Nova workshop · ${have} Nova shard${have===1?'':'s'}</div><p style="font-size:14px">Permanent Deep Drill upgrades. They carry over when you Ascend.</p><div class="ms-list">${Object.keys(NUP).map(k=>{const u=NUP[k],L=nupLv(k),mx=L>=u.max,c=mx?0:u.cost(L),ok=!mx&&have>=c;
    return `<div class="ms cur"><div class="ms-top"><h4>${u.n} · level ${L}</h4><span class="st">${u.eff(L)}</span></div><div class="actions" style="align-items:center"><div class="ms-unl" style="flex:1">${u.d}</div>${mx?'<span class="st">Maxed</span>':`<button class="btn${ok?' primary':''}" style="flex:none;padding:0 14px" data-nup="${k}"><img src="${ICON.nova}" alt="Nova shards" style="width:18px;height:18px;vertical-align:-4px"> ${c}</button>`}</div></div>`}).join('')}</div>`;
}
function showAscension(){
  const A=S.asc,T=lifeSeeds(),n=ascN();
  const card=(title,eff,desc,right)=>`<div class="ms cur"><div class="ms-top"><h4>${title}</h4><span class="st">${eff}</span></div><div class="actions" style="align-items:center"><div class="ms-unl" style="flex:1">${desc}</div>${right||''}</div></div>`;
  let h=`<div class="card-head"><h3>Ascension</h3><button class="x" data-close aria-label="Close">${SVG.x}</button></div>
  <p><strong>${A.seeds.toLocaleString()} Starseeds</strong> to spend · ${T.toLocaleString()} earned in all · ${n} ascension${n===1?'':'s'}</p>
  ${S.mod&&MODS[S.mod]?`<p style="font-size:14px">This moon: <strong>${MODS[S.mod].n}</strong>. ${MODS[S.mod].d} Starseeds ×${MODS[S.mod].seeds} when you leave.</p>`:''}
  <div class="sec-label">Always on</div><div class="ms-list">
  ${card('Starseeds earned',T+' total',`Every Starseed you have ever earned: +1% ore in every tile (+${T}% now), and +1% chance that a Fabricator makes an extra batch or an Uplink beams an item twice (${Math.round(dupP()*100)}% now).`)}
  ${card('Ascensions',n+' so far',`Each ascension gives +1 Commander point and +20% Core power (${fmtW(coreKW())} now). Every 3rd ascension you choose a Relic; the next is at ascension ${(Math.floor(n/3)+1)*3}.`)}
  </div>`;
  if(S.relicPick)h+=`<div class="actions"><button class="btn primary" data-relicshow>Choose your Relic</button></div>`;
  const rc={};for(const r of S.relics||[])rc[r]=(rc[r]||0)+1;
  if(META.crelics.length)for(const r of META.crelics)rc[r]=(rc[r]||0)+1;
  if(Object.keys(rc).length)h+=`<div class="sec-label">Relics · ${Object.values(rc).reduce((a,b)=>a+b,0)}</div><div class="ms-list">${Object.keys(rc).sort((a,b)=>'lerc'.indexOf(RELICS[a].r)-'lerc'.indexOf(RELICS[b].r)).map(k=>card(relicTitle(k),(rc[k]>1?'×'+rc[k]+' · ':'')+RARITY[RELICS[k].r].n,relicText(k)+(RELICS[k].sig?' From the '+CHALLENGES[RELICS[k].sig].n+' challenge; works in every main game.':''))).join('')}</div>`;
  h+=`<div class="sec-label">Starseed shop</div><div class="ms-list">${Object.keys(SS).map(k=>{const u=SS[k],L=ssLv(k),mx=L>=u.max,lock=u.req&&!ssLv(u.req),c=mx?0:u.cost(L),ok=!mx&&!lock&&A.seeds>=c;
    let d=u.d;if(k==='trkT')d+=` Now: ${L?trickleItems().map(i=>ITEMS[i].n).join(', '):'nothing'}.${L<TRICKLE.length?' Next adds '+TRICKLE[L].map(i=>ITEMS[i].n).join(', ')+'.':''}`;
    if(k==='seedv'&&L)d+=` ${SEEDS.length} seed${SEEDS.length===1?'':'s'} on this moon.`;
    if(k==='core'&&L&&coreB()&&coreB().w<coreWant())d+=' <strong>Waiting:</strong> clear the tiles around the Core.';
    if(lock)d+=` Needs ${SS[u.req].n} first.`;
    return card(`${u.n} · level ${L}`,u.eff(L),d,mx?'<span class="st">Maxed</span>':`<button class="btn${ok?' primary':''}" style="flex:none;padding:0 14px" data-ss="${k}">✦ ${c}</button>`)}).join('')}</div>`;
  const g=ascSeeds();
  h+=`<div class="sec-label">Ascend</div>`+(canAscend()?`<p style="font-size:14px">Start again on a new moon, at the start of the main game. You keep Ember shards, Nova shards and Nova upgrades, Starseeds and the shop, Relics, your Commander, and blueprints. Everything else resets: buildings, storage, research, Menu upgrades, petals and tiers. You get √(Aether in storage) Starseeds: ${(S.inv.aether||0).toLocaleString()} Aether gives ${g}.</p>
  <div class="actions"><button class="btn primary" data-ascend>Ascend for +${g} Starseed${g===1?'':'s'} →</button></div>`:'<p style="font-size:14px">Store some Aether to Ascend again.</p>');
  openModal(h);
}
function relicTitle(k){return `<span style="color:${RARITY[RELICS[k].r].col}">${RELICS[k].n}</span>`}
// Three different Relics, weighted by rarity; challenge relics never come from here
function relicOffer(rar){const ks=Object.keys(RELICS).filter(k=>!RELICS[k].sig&&(!rar||RELICS[k].r===rar)),o=[];
  while(o.length<3&&o.length<ks.length){let tot=0;const pool=ks.filter(k=>!o.includes(k));for(const k of pool)tot+=RARITY[RELICS[k].r].w;let x=Math.random()*tot;for(const k of pool){x-=RARITY[RELICS[k].r].w;if(x<=0){o.push(k);break}}}return o}
function relicCard(k,btn){return `<div class="ms cur"><div class="ms-top"><h4>${relicTitle(k)}</h4><span class="st" style="color:${RARITY[RELICS[k].r].col}">${RARITY[RELICS[k].r].n}${relN(k)?' · owned ×'+relN(k):''}</span></div><div class="actions" style="align-items:center"><div class="ms-unl" style="flex:1">${relicText(k)}</div>${btn}</div></div>`}
function showRelicPick(){
  const P=S.relicPick;if(!P)return;
  openModal(`<span class="eyebrow">Ascension ${ascN()} · Relic</span><h1>Choose a Relic</h1><p>Relics are permanent and stack with each other.</p><div class="ms-list">${P.map(k=>relicCard(k,`<button class="btn primary" style="flex:none;padding:0 16px" data-relic="${k}">Take</button>`)).join('')}</div>`);
}
function showMoonPick(){
  const ks=Object.keys(MODS),o=[];while(o.length<3){const k=ks[Math.random()*ks.length|0];if(!o.includes(k))o.push(k)}
  const g=n=>Math.floor(Math.sqrt(S.inv.aether||0)*rp('seeds')*modSeedMul());
  openModal(`<span class="eyebrow">Ascension ${ascN()+1}</span><h1>Choose your next moon</h1><p>You get <strong>${g()} Starseed${g()===1?'':'s'}</strong> now. The moon you pick changes how many you earn when you leave it.</p><div class="ms-list">${o.map(k=>`<div class="ms cur"><div class="ms-top"><h4>${MODS[k].n}</h4><span class="st">Starseeds ×${MODS[k].seeds}</span></div><div class="actions" style="align-items:center"><div class="ms-unl" style="flex:1">${MODS[k].d}</div><button class="btn primary" style="flex:none;padding:0 16px" data-moon="${k}">Go</button></div></div>`).join('')}
  <div class="ms cur"><div class="ms-top"><h4>Plain moon</h4><span class="st">Starseeds ×1</span></div><div class="actions" style="align-items:center"><div class="ms-unl" style="flex:1">No modifier.</div><button class="btn" style="flex:none;padding:0 16px" data-moon="">Go</button></div></div></div>
  <div class="actions"><button class="btn" data-ascopen>Back</button></div>`);
}
function doAscend(mod){
  const A=S.asc||{n:0,seeds:0,total:0},got=ascSeeds(),inv={iron:400,copper:200};mod=mod&&MODS[mod]?mod:null;
  for(const k of ['ember','nova'])if(S.inv[k]>0)inv[k]=S.inv[k];
  const d={v:1,wv:3,dd2:1,seed:(Math.random()*1e9|0),inv,ms:TUT,prog:{},petals:0,gt:0,gavg:0,ft:0,favg:0,
    cmd:S.cmd||{},cmdBank:(S.cmdBank||0)+constN(S.petals),cmdSpent:S.cmdSpent||0,asc:{n:A.n+1,seeds:(A.seeds||0)+got,total:(A.total||0)+got},
    up:{belt:0,vein:0,night:0,haul:0},time:0,flags:{del:0,nova:S.flags.nova,ascHint:1},refined:S.refined||0,seen:S.seen,bs:[],fromCode:1,
    ss:S.ss||{},nup:S.nup||{},relics:S.relics||[],relicPick:(A.n+1)%3===0?relicOffer():S.relicPick||null,mod};
  start(d);cam.x=CX;cam.y=CY;save();closeModal();burst(CX,CY,'#d8b4ff',60);sfx('fanfare');
  setTimeout(()=>openModal(`<span class="eyebrow">Ascension ${S.asc.n}</span><h1>A new moon</h1><p>The foundry wakes on fresh ground. You brought <strong>+${got} Starseed${got===1?'':'s'}</strong> (${S.asc.seeds} banked)${inv.ember?`, ${inv.ember.toLocaleString()} Ember shards`:''}${inv.nova?`, ${inv.nova} Nova shard${inv.nova===1?'':'s'}`:''} and your Commander. Core power is now ${fmtW(coreKW())}${S.asc.n?' and you have +'+S.asc.n+' Commander point'+(S.asc.n===1?'':'s')+' from ascending':''}.</p>${mod?`<p>This moon: <strong>${MODS[mod].n}</strong>. ${MODS[mod].d}</p>`:''}<p>The tutorial is behind you: everything up to the main game is unlocked. Next up is <strong>${MS[TUT].n}</strong>.</p>${S.relicPick?'<button class="btn primary" data-relicshow>Choose your Relic</button>':'<button class="btn primary" data-close>Begin</button>'}`),500);
}

// ================= main menu, daily moon, challenges =================
const DAILY_LEN=3600;
// Daily score: each item delivered to the Core is worth roughly the raw ore that went into it
const VAL=(()=>{const v={ferrite:1,cuprite:1,silica:1,carbon:1,aether:50,ember:5,nova:100};for(const o in SMELT)v[SMELT[o]]=2;
  const calc=k=>{if(v[k]!=null)return v[k];const r=RECIPES[k];if(!r)return v[k]=1;v[k]=1;let s=0;for(const i in r.in)s+=calc(i)*r.in[i];return v[k]=Math.round((s/r.out+1)*10)/10};
  for(const k in RECIPES)calc(k);return v})();
function whenIdle(fn){const go=()=>{if(!elModal.hidden){setTimeout(go,800);return}fn()};setTimeout(go,600)}
function fmtClock(s){s=Math.max(0,Math.round(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return (h?h+':'+String(m).padStart(2,'0'):m)+':'+String(x).padStart(2,'0')}
function hashStr(t){let h=2166136261;for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function dailyToday(){const n=new Date(),date=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`,seed=hashStr('halo-daily-'+date),ks=Object.keys(MODS);return{date,seed:seed%1e9,mod:ks[seed%ks.length]}}
function runData(o){return{v:1,wv:3,dd2:1,seed:o.seed!=null?o.seed:(Math.random()*1e9|0),inv:Object.assign(o.ms===0?{iron:160,copper:80}:{iron:400,copper:200},o.inv||{}),ms:o.ms!=null?o.ms:TUT,unl:o.unl?['belt','junction','drill','smelter',...o.unl]:undefined,prog:{},petals:0,gt:0,gavg:0,up:{belt:0,vein:0,night:0,haul:0},time:0,flags:{del:0,ascHint:1},seen:{},bs:[],fromCode:1,mode:o.mode,mod:o.mod||null,ch:o.ch||null,daily:o.daily||null}}
function dailyData(){const T=dailyToday();return runData({mode:'daily',daily:T.date,seed:T.seed,mod:T.mod})}
function chData(id){const c=CHALLENGES[id];return runData({mode:'challenge',ch:id,ms:0,inv:c.inv,unl:c.unl})}
function readSlot(k){try{const s=localStorage.getItem(k);return s?JSON.parse(s):null}catch(_){return null}}
function useSlot(k){if(S)save();CUR=k;META.last=k;saveMeta()}
function startRun(k,d){useSlot(k);start(d);cam.x=CX;cam.y=CY;save();closeModal()}
function playSlot(k){useSlot(k);const d=readSlot(k);start(d,!d);if(!d)save();closeModal();if(!d)showToast('New game started')}
function slotLabel(k){if(k===DAILY_KEY)return 'Daily moon';if(k===CH_KEY){const d=readSlot(k);return 'Challenge'+(d&&d.ch&&CHALLENGES[d.ch]?': '+CHALLENGES[d.ch].n:'')}return 'Slot '+(SLOT_KEYS.indexOf(k)+1)}
function slotSummary(d){if(!d)return 'Empty';const ms=d.ms||0;
  return `${ms<TUT?`Tutorial ${ms+1}/${TUT}`:ms<MS.length?MS[ms].n:'Grid tier '+((d.gt||0)+1)}${d.asc&&d.asc.n?' · Ascension '+d.asc.n:''}${d.mod&&MODS[d.mod]?' · '+MODS[d.mod].n:''} · ${fmtAway(d.time||0)} played`}
let titleArm={};
function showTitle(){
  const T=dailyToday(),dd=readSlot(DAILY_KEY),dToday=dd&&dd.daily===T.date,best=META.daily[T.date]||0,cd=readSlot(CH_KEY);
  const row=(title,st,desc,btns)=>`<div class="ms cur"><div class="ms-top"><h4>${title}</h4><span class="st">${st}</span></div><div class="ms-unl">${desc}</div>${btns?`<div class="actions">${btns}</div>`:''}</div>`;
  let h=`<span class="eyebrow">A moon, a star, a factory</span><h1>Halo Foundry</h1>
  <div class="actions"><button class="btn primary" data-mm="cont">Continue · ${slotLabel(CUR)}</button></div>
  <div class="sec-label">Main game</div><div class="ms-list">${SLOT_KEYS.map((k,i)=>{const d=readSlot(k);return row(`Slot ${i+1}${k===CUR?' · current':''}`,'',slotSummary(d),(d?`<button class="btn${k===CUR?'':' primary'}" data-slot="${i}">Play</button>`:'')+`<button class="btn${d?' danger':' primary'}" data-slotnew="${i}">${d?'New game':'Start'}</button>`)}).join('')}</div>
  <div class="sec-label">Daily moon · ${T.date}</div><div class="ms-list">${row(MODS[T.mod].n,best?'Best '+Math.floor(best).toLocaleString():'No score yet',`Everyone gets the same moon today. Start at the main game and deliver as much as you can to the Core in ${DAILY_LEN/60} minutes of play; better parts score more. ${MODS[T.mod].d}${dToday?` In progress: ${Math.floor(dd.dscore||0).toLocaleString()} points, ${fmtClock(Math.max(0,DAILY_LEN-(dd.time||0)))} left.`:''}`,`<button class="btn primary" data-daily>${dToday?'Continue':'Play today’s moon'}</button>`)}</div>
  <div class="sec-label">Challenges</div><p style="font-size:14px">Start from the tutorial with no bonuses and reach the goal under one rule. The first win in each earns that challenge’s own Legendary Relic, which works in every main game.</p><div class="ms-list">${Object.keys(CHALLENGES).map(id=>{const c=CHALLENGES[id],m=META.ch[id],cur=cd&&cd.ch===id;
    const sig=Object.keys(RELICS).find(k=>RELICS[k].sig===id);
    return row(c.n,m&&m.done?`Won${m.best?' · best '+fmtClock(m.best):''}`:cur?'In progress':'',c.d+` <strong>Goal:</strong> ${chGoalText(c)} Reward: <span style="color:${RARITY.l.col}">${RELICS[sig].n}</span> (${relicText(sig).replace(/\.$/,'').toLowerCase()})${m&&m.done?' ✓':''}.`,`<button class="btn${cur?' primary':''}" data-chal="${id}">${cur?'Continue':'Start'}</button>`)}).join('')}</div>
  <div class="sec-label">More</div><div class="actions"><button class="btn" data-savecode>Save code</button><button class="btn" data-news>What's new</button><button class="btn" data-help>How to play</button></div>`;
  openModal(h);
}
// Win or lose a challenge; finish the daily; called from the HUD tick
function runTick(){
  const c=chal();
  if(c&&!S.chWon&&!S.chFail){
    if(c.limit&&S.time>c.limit){S.chFail=true;save();openModal(`<span class="eyebrow">Challenge · ${c.n}</span><h1>Out of time</h1><p>The goal wasn’t reached within ${fmtClock(c.limit)}. You can keep building here, or restart the run from the main menu.</p><div class="actions"><button class="btn" data-close>Keep building</button><button class="btn primary" data-chal="${S.ch}" data-fresh="1">Try again</button></div>`)}
    else if(chGoalDone()){S.chWon=true;const id=S.ch,m=META.ch[id]||{},first=!m.done;m.done=1;m.best=m.best?Math.min(m.best,S.time):S.time;META.ch[id]=m;saveMeta();save();
      if(first){const sig=Object.keys(RELICS).find(k=>RELICS[k].sig===id);if(sig&&!META.crelics.includes(sig))META.crelics.push(sig);m.reward=sig;saveMeta();save();
        whenIdle(()=>{burst(CX,CY,'#f3c25a',50);sfx('fanfare');openModal(`<span class="eyebrow">Challenge won · ${c.n}</span><h1>Relic earned</h1><p>Finished in ${fmtClock(S.time)}. This challenge’s Relic is yours, and it works in every main game, in every slot.</p><div class="ms-list">${relicCard(sig,'')}</div><button class="btn primary" data-close>Claim</button>`)})}
      else whenIdle(()=>openModal(`<span class="eyebrow">Challenge won · ${c.n}</span><h1>Goal reached</h1><p>Time: <strong>${fmtClock(S.time)}</strong>. Best: ${fmtClock(m.best)}. You already took this challenge’s reward.</p><button class="btn primary" data-close>Nice</button>`))}
  }
  if(S.mode==='daily'&&S.daily){
    if((S.dscore||0)>(META.daily[S.daily]||0)){META.daily[S.daily]=Math.floor(S.dscore);const ks=Object.keys(META.daily).sort();while(ks.length>30)delete META.daily[ks.shift()];saveMeta()}
    if(!S.dEnd&&S.time>=DAILY_LEN){S.dEnd=true;save();whenIdle(()=>openModal(`<span class="eyebrow">Daily moon · ${S.daily}</span><h1>Time’s up</h1><p>You scored <strong>${Math.floor(S.dscore||0).toLocaleString()}</strong> points. Today’s best: ${Math.floor(META.daily[S.daily]||0).toLocaleString()}.</p><p>You can keep building; the score is final.</p><button class="btn primary" data-close>Keep building</button>`))}
  }
}
function chGoalText(c){return c.goal==='every'?`Deliver ${EVERY_N.toLocaleString()} of every item up to Aether to the Core (${EVERY_ITEMS.length} kinds, raw ore included).`:'Refine your first Aether.'}
function everyDone(){let n=0;for(const k of EVERY_ITEMS)if(((S.chd||{})[k]||0)>=EVERY_N)n++;return n}
function chGoalDone(){const c=chal();if(!c)return false;return c.goal==='every'?everyDone()>=EVERY_ITEMS.length:(S.refined||0)>=1}
function chProgress(){const c=chal();return c.goal==='every'?`${everyDone()}/${EVERY_ITEMS.length}`:`Aether ${Math.min(1,S.refined||0)}/1`}
function showChGoal(){const c=chal();if(!c)return;const d=S.chd||{};
  openModal(`<div class="card-head"><h3>${c.n}</h3><button class="x" data-close aria-label="Close">${SVG.x}</button></div><p>${c.d}</p><p><strong>Goal:</strong> ${chGoalText(c)}</p>${c.goal==='every'?`<div class="ms-req">${EVERY_ITEMS.map(k=>{const h=d[k]||0;return `<span class="req${h>=EVERY_N?' done':''}"><img src="${ICON[k]}" alt="${ITEMS[k].n}">${fmtN(Math.min(h,EVERY_N))}/${fmtN(EVERY_N)}<i style="width:${Math.min(100,h/EVERY_N*100)}%"></i></span>`}).join('')}</div>`:`<p>${(S.refined||0)>=1?'Done!':'Research Aether refining, build a Refinery and feed it ore.'}</p>`}${c.limit?`<p>Time left: <strong>${fmtClock(c.limit-S.time)}</strong></p>`:''}`)}
function showChReward(){const c=chal(),o=S.chOffer;if(!c||!o)return;
  openModal(`<span class="eyebrow">Challenge won · ${c.n}</span><h1>Choose your reward</h1><p>Signed in ${fmtClock(S.time)}. Pick one Relic. It works in every main game, in every slot.</p><div class="ms-list">${o.map(k=>relicCard(k,`<button class="btn primary" style="flex:none;padding:0 16px" data-creward="${k}">Take</button>`)).join('')}</div>`)}
function runLabel(){
  if(S.mode==='daily')return S.dEnd?`Daily · final ${Math.floor(S.dscore||0).toLocaleString()}`:`Daily · ${fmtClock(DAILY_LEN-S.time)} · ${Math.floor(S.dscore||0).toLocaleString()} pts`;
  const c=chal();if(c)return c.n+(S.chWon?' · won':S.chFail?' · out of time':' · '+chProgress()+(c.limit?' · '+fmtClock(c.limit-S.time):''));
  return '';
}

// ================= world gen =================
function genWorld(seed){
  ORE=new Uint8Array(W*H);RES=new Float32Array(W*H);
  const centers=[];
  const mkBlob=(R,ox,oy,LW,lcx,lcy,rich)=>(k,bx,by,r)=>{
    const p1=R()*6.28,p2=R()*6.28,P=ORE_P[ORE_KEYS[k]];
    for(let y=Math.floor(by-r-2);y<=by+r+2;y++)for(let x=Math.floor(bx-r-2);x<=bx+r+2;x++){
      if(x<1||y<1||x>=LW-1||y>=LW-1)continue;
      const dx=x+.5-bx,dy=y+.5-by,d=Math.hypot(dx,dy),a=Math.atan2(dy,dx);
      const rr=r*(0.84+0.16*Math.sin(a*3+p1)+0.1*Math.sin(a*5+p2));
      if(d<rr&&Math.max(Math.abs(x+.5-lcx),Math.abs(y+.5-lcy))>3.6){const i=(y+oy)*W+x+ox;ORE[i]=k;RES[i]=Math.round((P.lo+R()*(P.hi-P.lo))*(1.25-0.5*d/rr)*rich)}
    }
  };
  // Inner 128×128 starting region (kept identical to earlier versions so saves line up)
  const R=mulberry(seed),O=128,LW=128,LC=64.5,blob=mkBlob(R,O,O,LW,LC,LC,1);
  const tryBlob=(k,dmin,dmax,rmin,rmax,ang)=>{
    for(let n=0;n<60;n++){
      const a=ang!=null?ang+(R()-.5)*.35:R()*6.283,d=dmin+R()*(dmax-dmin),r=rmin+R()*(rmax-rmin),x=LC+Math.cos(a)*d,y=LC+Math.sin(a)*d;
      if(x-r<4||y-r<4||x+r>LW-4||y+r>LW-4)continue;
      if(centers.some(c=>Math.hypot(c[0]-x-O,c[1]-y-O)<c[2]+r+(d>25?7:5)))continue;
      centers.push([x+O,y+O,r]);blob(k,x,y,r);return;
    }
  };
  const a0=R()*6.283;
  tryBlob(1,13,15,3.6,4.2,a0);tryBlob(2,13,15,3.4,4,a0+Math.PI/2);tryBlob(3,15,18,3,3.6,a0+Math.PI);tryBlob(4,16,19,2.3,2.7,a0+Math.PI*1.5);
  for(let k=1;k<=4;k++)for(let i=0;i<(k===4?3:4);i++)tryBlob(k,30,46,3.5,5.5);
  for(let k=1;k<=4;k++)for(let i=0;i<4;i++)tryBlob(k,48,60,4.5,7);
  // Frontier rings: bigger, richer patches farther out
  const R2=mulberry(seed^0x5bd1e995);
  const outer=(k,dmin,dmax,rmin,rmax,rich)=>{
    const ob=mkBlob(R2,0,0,W,CX,CY,rich);
    for(let n=0;n<80;n++){
      const a=R2()*6.283,d=dmin+R2()*(dmax-dmin),r=rmin+R2()*(rmax-rmin),x=CX+Math.cos(a)*d,y=CY+Math.sin(a)*d;
      if(x-r<4||y-r<4||x+r>W-4||y+r>H-4)continue;
      if(Math.abs(x-CX)<64+r+2&&Math.abs(y-CY)<64+r+2)continue;
      if(centers.some(c=>Math.hypot(c[0]-x,c[1]-y)<c[2]+r+8))continue;
      centers.push([x,y,r]);ob(k,x,y,r);return;
    }
  };
  for(let k=1;k<=4;k++)for(let i=0;i<(k===4?5:6);i++)outer(k,72,110,4.5,7.5,1.6);
  for(let k=1;k<=4;k++)for(let i=0;i<(k===4?6:8);i++)outer(k,110,150,6,9,2.2);
  for(let k=1;k<=4;k++)for(let i=0;i<10;i++)outer(k,150,260,7,11,3);
  // moon modifiers that change the ground
  const md=S&&S.mod;
  if(md)for(let i=0;i<W*H;i++){const k=ORE[i];if(!k)continue;let m=1;
    if(md==='rich')m=2;else if(md==='barren')m=.5;else if(md==='seeded')m=.3;else if(md==='carbon')m=k===4?3:k===2?.5:1;
    else if(md==='frontier'&&Math.max(Math.abs(i%W+.5-CX),Math.abs(((i/W)|0)+.5-CY))<24){ORE[i]=0;RES[i]=0;continue}
    RES[i]=Math.max(1,Math.round(RES[i]*m))}
  RES0=RES.slice();
  CHUNKS.clear();
  buildPatches();
}
let BIOME='moon';try{const b=localStorage.getItem('halo-foundry-biome');if(BIOMES[b])BIOME=b}catch(_){}
const BI=()=>BIOMES[BIOME];
function setBiome(k){if(!BIOMES[k]||k===BIOME)return;BIOME=k;try{localStorage.setItem('halo-foundry-biome',k)}catch(_){}CHUNKS.clear();makeStars()}
const GT=20,CH=32,CPX=CH*GT,CHUNKS=new Map();let chunkBudget=0,CHUNK_MAX=40;
function chunkCv(cx,cy){
  const key=cy*1000+cx;let c=CHUNKS.get(key);
  if(c){CHUNKS.delete(key);CHUNKS.set(key,c);return c}
  if(chunkBudget<=0)return null;chunkBudget--;
  c=renderChunk(cx,cy);CHUNKS.set(key,c);
  while(CHUNKS.size>CHUNK_MAX)CHUNKS.delete(CHUNKS.keys().next().value);
  return c;
}
function renderChunk(cx,cy){
  const c=document.createElement('canvas');c.width=c.height=CPX;const g=c.getContext('2d'),X0=cx*CH,Y0=cy*CH;
  const T=BI();g.fillStyle=T.base;g.fillRect(0,0,CPX,CPX);
  const near=[];for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)near.push([i,j,mulberry(((S.seed*7)^((cx+i)*73856093)^((cy+j)*19349663))>>>0)]);
  for(const [i,j,R] of near){for(let n=0;n<3;n++){const x=(i+R())*CPX,y=(j+R())*CPX,r=40+R()*170,dark=R()<.5,al=R()*T.blobA[1]+T.blobA[0];if(x+r<0||y+r<0||x-r>CPX||y-r>CPX)continue;const gr=g.createRadialGradient(x,y,0,x,y,r),cc=dark?T.blob[0]:T.blob[1];gr.addColorStop(0,cc+al+')');gr.addColorStop(1,cc+'0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}}
  DECO[T.deco](g,near,cx,cy);
  const RS=mulberry((S.seed+cx*31+cy*977)>>>0);
  for(let n=0;n<CH*CH*2.5;n++){const x=RS()*CPX,y=RS()*CPX;g.fillStyle=RS()<.5?T.speck[0]:T.speck[1];const z=RS()*2.2+.6;g.fillRect(x,y,z,z)}
  if(T.deco==='grass')grassTufts(g,RS);
  g.strokeStyle=T.grid;g.lineWidth=1;g.beginPath();
  for(let i=0;i<=CH;i++){g.moveTo(i*GT+.5,0);g.lineTo(i*GT+.5,CPX);g.moveTo(0,i*GT+.5);g.lineTo(CPX,i*GT+.5)}
  g.stroke();
  for(let y=0;y<CH;y++)for(let x=0;x<CH;x++){
    const i=(Y0+y)*W+X0+x,o=ORE[i];
    if(!o){if(RES0[i]>0)paintSpentAt(g,x,y,X0+x,Y0+y);continue}
    const col=ORE_COL[ORE_KEYS[o]],R=mulberry((i*2654435761)^S.seed);
    g.fillStyle=col[0]+'44';g.fillRect(x*GT,y*GT,GT,GT);
    for(let k=0;k<3;k++){
      const px=x*GT+3+R()*(GT-6),py=y*GT+3+R()*(GT-6),sz=2.5+R()*4.5,a=R()*6.28;
      g.beginPath();for(let q=0;q<4;q++){const aa=a+q*1.57+(R()-.5)*.6,rr=sz*(q%2?.6:1);const X=px+Math.cos(aa)*rr,Y=py+Math.sin(aa)*rr;q?g.lineTo(X,Y):g.moveTo(X,Y)}
      g.closePath();g.fillStyle=col[0];g.fill();g.strokeStyle=col[1];g.globalAlpha=.6;g.lineWidth=1;g.stroke();g.globalAlpha=1;
    }
  }
  return c;
}
// Surface detail per biome. Features are seeded from the 3×3 neighbourhood so they run across chunk edges.
const DECO={
  craters(g,near){for(const [i,j,R] of near){for(let n=0;n<9;n++){const x=(i+R())*CPX,y=(j+R())*CPX,r=6+R()*R()*44;if(x+r*1.2<0||y+r*1.2<0||x-r*1.2>CPX||y-r*1.2>CPX)continue;
    g.beginPath();g.ellipse(x,y,r,r*.86,0,0,7);g.fillStyle='rgba(6,4,14,.22)';g.fill();
    g.beginPath();g.ellipse(x,y,r,r*.86,0,Math.PI*.15,Math.PI*1.05);g.strokeStyle='rgba(200,190,255,.07)';g.lineWidth=Math.max(1,r*.12);g.stroke();
    g.beginPath();g.ellipse(x+r*.08,y+r*.1,r*.8,r*.66,0,Math.PI*1.1,Math.PI*1.9);g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=Math.max(1,r*.1);g.stroke()}}},
  dunes(g,near){
    for(const [i,j,R] of near){
      // wind ripples: long gentle waves, a shadow line under a lit crest
      for(let n=0;n<16;n++){const x0=(i+R())*CPX-160,y0=(j+R())*CPX,len=120+R()*220,amp=2+R()*4,wl=40+R()*50,ph=R()*6.28,tilt=(R()-.5)*.12;
        if(y0+amp+60<0||y0-amp-60>CPX||x0>CPX||x0+len<0)continue;
        for(const [dy,col,lw] of [[2,'rgba(105,64,28,.15)',2.4],[0,'rgba(255,238,205,.16)',1.3]]){g.beginPath();for(let t=0;t<=len;t+=8){const X=x0+t,Y=y0+dy+Math.sin(t/wl*6.28+ph)*amp+t*tilt;t?g.lineTo(X,Y):g.moveTo(X,Y)}g.strokeStyle=col;g.lineWidth=lw;g.stroke()}}
      // rock outcrops and dry scrub
      for(let n=0;n<4;n++){const x=(i+R())*CPX,y=(j+R())*CPX,r=4+R()*R()*16;if(x+r<0||y+r<0||x-r>CPX||y-r>CPX)continue;
        g.beginPath();for(let q=0;q<7;q++){const a=q/7*6.283,rr=r*(.7+R()*.4);q?g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr*.7):g.moveTo(x+rr,y)}g.closePath();g.fillStyle='rgba(120,78,40,.55)';g.fill();
        g.beginPath();g.ellipse(x-r*.2,y-r*.2,r*.45,r*.22,0,0,7);g.fillStyle='rgba(255,230,180,.18)';g.fill()}
      for(let n=0;n<5;n++){const x=(i+R())*CPX,y=(j+R())*CPX;if(x<-8||y<-8||x>CPX+8||y>CPX+8)continue;g.strokeStyle='rgba(98,80,40,.55)';g.lineWidth=1.2;g.beginPath();for(let q=0;q<6;q++){const a=-Math.PI/2+(q-2.5)*.38;g.moveTo(x,y);g.lineTo(x+Math.cos(a)*(4+R()*3),y+Math.sin(a)*(4+R()*3))}g.stroke()}
    }},
  grass(g,near){
    for(const [i,j,R] of near){
      // meadow patches: soft darker and lighter clumps
      for(let n=0;n<10;n++){const x=(i+R())*CPX,y=(j+R())*CPX,r=10+R()*30,dk=R()<.55;if(x+r<0||y+r<0||x-r>CPX||y-r>CPX)continue;
        g.beginPath();g.ellipse(x,y,r,r*.7,R()*3,0,7);g.fillStyle=dk?'rgba(25,60,20,.14)':'rgba(170,215,105,.10)';g.fill()}
      // flower clusters and small stones
      for(let n=0;n<4;n++){const x=(i+R())*CPX,y=(j+R())*CPX,c=['rgba(255,250,235,.85)','rgba(255,214,90,.85)','rgba(240,150,200,.8)','rgba(170,190,255,.8)'][(R()*4)|0];if(x<-20||y<-20||x>CPX+20||y>CPX+20)continue;
        for(let q=0;q<9;q++){g.fillStyle=c;g.beginPath();g.arc(x+(R()-.5)*26,y+(R()-.5)*20,1+R()*1.1,0,7);g.fill()}}
      for(let n=0;n<3;n++){const x=(i+R())*CPX,y=(j+R())*CPX,r=2.5+R()*5;if(x+r<0||y+r<0||x-r>CPX||y-r>CPX)continue;g.beginPath();g.ellipse(x,y,r,r*.75,0,0,7);g.fillStyle='rgba(150,150,140,.7)';g.fill();g.beginPath();g.ellipse(x-r*.25,y-r*.25,r*.45,r*.3,0,0,7);g.fillStyle='rgba(235,235,225,.35)';g.fill()}
    }}
};
// Halloween: graves, jack-o'-lanterns, dead trees, toadstools, bones and cobwebs
function spooky(g,near){
  for(const [i,j,R] of near){
    // low mist
    for(let n=0;n<5;n++){const x=(i+R())*CPX,y=(j+R())*CPX,r=30+R()*60;if(x+r<0||y+r<0||x-r>CPX||y-r>CPX)continue;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(190,170,220,.07)');gr.addColorStop(1,'rgba(190,170,220,0)');g.fillStyle=gr;g.beginPath();g.ellipse(x,y,r,r*.45,0,0,7);g.fill()}
    // gravestones
    for(let n=0;n<4;n++){const x=(i+R())*CPX,y=(j+R())*CPX,h=14+R()*10,w=h*.7,tilt=(R()-.5)*.35,cross=R()<.3;if(x<-20||y<-20||x>CPX+20||y>CPX+20)continue;
      g.save();g.translate(x,y);g.rotate(tilt);g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(1,1,w*.75,w*.25,0,0,7);g.fill();
      if(cross){g.fillStyle='#6d6680';g.fillRect(-w*.14,-h,w*.28,h);g.fillRect(-w*.45,-h*.75,w*.9,w*.26)}
      else{g.beginPath();g.moveTo(-w/2,0);g.lineTo(-w/2,-h+w/2);g.arc(0,-h+w/2,w/2,Math.PI,0);g.lineTo(w/2,0);g.closePath();g.fillStyle='#6d6680';g.fill();g.strokeStyle='#4a4458';g.lineWidth=1;g.stroke();
        g.strokeStyle='rgba(30,25,40,.7)';g.beginPath();g.moveTo(-w*.25,-h*.55);g.lineTo(w*.25,-h*.55);g.moveTo(-w*.2,-h*.38);g.lineTo(w*.2,-h*.38);g.stroke()}
      g.restore()}
    // jack-o'-lanterns, some lit
    for(let n=0;n<4;n++){const x=(i+R())*CPX,y=(j+R())*CPX,r=6+R()*5,lit=R()<.7;if(x<-20||y<-20||x>CPX+20||y>CPX+20)continue;
      if(lit){const gr=g.createRadialGradient(x,y,0,x,y,r*4);gr.addColorStop(0,'rgba(255,150,40,.25)');gr.addColorStop(1,'rgba(255,150,40,0)');g.fillStyle=gr;g.fillRect(x-r*4,y-r*4,r*8,r*8)}
      for(const [dx,s2] of [[-r*.45,.62],[r*.45,.62],[0,.75]]){g.beginPath();g.ellipse(x+dx,y,r*s2,r*.8,0,0,7);g.fillStyle=dx?'#d8641c':'#ee7a22';g.fill()}
      g.fillStyle='#4f6a2a';g.fillRect(x-r*.1,y-r*1.05,r*.22,r*.35);
      if(lit){g.fillStyle='#ffd27a';g.beginPath();g.moveTo(x-r*.45,y-r*.15);g.lineTo(x-r*.2,y-r*.15);g.lineTo(x-r*.32,y-r*.4);g.fill();g.beginPath();g.moveTo(x+r*.45,y-r*.15);g.lineTo(x+r*.2,y-r*.15);g.lineTo(x+r*.32,y-r*.4);g.fill();
        g.beginPath();g.moveTo(x-r*.5,y+r*.15);g.lineTo(x+r*.5,y+r*.15);g.lineTo(x+r*.3,y+r*.45);g.lineTo(x,y+r*.3);g.lineTo(x-r*.3,y+r*.45);g.closePath();g.fill()}}
    // dead trees
    for(let n=0;n<1+(R()<.5);n++){const x=(i+R())*CPX,y=(j+R())*CPX,h=30+R()*24;if(x<-40||y<-50||x>CPX+40||y>CPX+10)continue;
      g.strokeStyle='#120c16';g.lineCap='round';const br=(x0,y0,a,l,w,d)=>{const x1=x0+Math.cos(a)*l,y1=y0+Math.sin(a)*l;g.lineWidth=w;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();if(d>0){br(x1,y1,a-.5-R()*.3,l*.68,w*.65,d-1);br(x1,y1,a+.45+R()*.3,l*.62,w*.65,d-1)}};
      g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x+3,y+1,h*.35,h*.1,0,0,7);g.fill();br(x,y,-Math.PI/2+(R()-.5)*.2,h*.45,4.5,3)}
    // toadstools, bones
    for(let n=0;n<3;n++){const x=(i+R())*CPX,y=(j+R())*CPX,r=3+R()*3;if(x<-8||y<-8||x>CPX+8||y>CPX+8)continue;g.fillStyle='#d9cfe6';g.fillRect(x-r*.25,y-r*.2,r*.5,r);g.beginPath();g.arc(x,y-r*.2,r,Math.PI,0);g.fillStyle=R()<.5?'#8a3cc8':'#c8342e';g.fill();g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(x-r*.35,y-r*.6,r*.18,0,7);g.arc(x+r*.3,y-r*.5,r*.15,0,7);g.fill()}
    for(let n=0;n<2;n++){const x=(i+R())*CPX,y=(j+R())*CPX,a=R()*3;if(x<-8||y<-8||x>CPX+8||y>CPX+8)continue;g.save();g.translate(x,y);g.rotate(a);g.fillStyle='rgba(225,215,195,.75)';g.fillRect(-5,-.8,10,1.6);for(const s2 of [-1,1]){g.beginPath();g.arc(s2*5,-1,1.4,0,7);g.arc(s2*5,1,1.4,0,7);g.fill()}g.restore()}
    // cobwebs
    if(R()<.6){const x=(i+R())*CPX,y=(j+R())*CPX,r=10+R()*8;if(x>-20&&y>-20&&x<CPX+20&&y<CPX+20){g.strokeStyle='rgba(230,225,240,.18)';g.lineWidth=.7;g.beginPath();for(let q=0;q<6;q++){const a=q/6*6.283;g.moveTo(x,y);g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}for(const f of [.35,.65,.95]){for(let q=0;q<=6;q++){const a=q/6*6.283,X=x+Math.cos(a)*r*f,Y=y+Math.sin(a)*r*f;q?g.lineTo(X,Y):g.moveTo(X,Y)}}g.stroke()}}
  }
}
DECO.spooky=spooky;
// Bats flutter across the screen on the Halloween ground
function drawBats(g){
  if(BIOME!=='spooky')return;const t=performance.now()/1000;
  for(let k=0;k<6;k++){const sp=40+k*13,span=VW+160,x=((t*sp+k*311)%span)-80,y=VH*(.15+.12*k)+Math.sin(t*1.3+k*2)*30,s=11+(k%3)*3,f=Math.sin(t*12+k*1.7);
    g.save();g.translate(x,y);g.fillStyle='rgba(12,6,16,.85)';g.beginPath();g.ellipse(0,0,s*.28,s*.4,0,0,7);g.fill();
    for(const d of [-1,1]){g.beginPath();g.moveTo(0,-s*.1);g.quadraticCurveTo(d*s*.8,-s*(.6+.5*f),d*s*1.5,-s*.2*f);g.quadraticCurveTo(d*s*1.1,s*.15,d*s*.9,s*.05);g.quadraticCurveTo(d*s*.6,s*.25,d*s*.4,s*.1);g.quadraticCurveTo(d*s*.2,s*.2,0,s*.15);g.fill()}
    g.fillStyle='#ffb347';g.fillRect(-s*.13,-s*.2,s*.08,s*.08);g.fillRect(s*.05,-s*.2,s*.08,s*.08);g.restore()}
}
function grassTufts(g,RS){for(let n=0;n<CH*CH*.9;n++){const x=RS()*CPX,y=RS()*CPX,h=3+RS()*4,lt=RS()<.5;g.strokeStyle=lt?'rgba(175,220,110,.45)':'rgba(25,60,18,.40)';g.lineWidth=1.1;g.beginPath();g.moveTo(x-2,y-h*.8);g.lineTo(x,y);g.lineTo(x+.5,y-h);g.moveTo(x,y);g.lineTo(x+2.5,y-h*.75);g.stroke()}}
function paintSpentAt(g,lx,ly,x,y){
  const R=mulberry(x*977+y*131+7),T=BI();
  g.fillStyle=T.spent;g.fillRect(lx*GT,ly*GT,GT,GT);
  for(let k=0;k<5;k++){g.fillStyle=k%2?'rgba(0,0,0,.3)':T.spentDot;g.beginPath();g.arc(lx*GT+2+R()*(GT-4),ly*GT+2+R()*(GT-4),1+R()*2.4,0,7);g.fill()}
  g.strokeStyle=T.grid;g.lineWidth=1;g.strokeRect(lx*GT+.5,ly*GT+.5,GT,GT);
}
// ---------- seed veins ----------
// Each ore patch (4-connected tiles of one ore) has a candidate seed: its richest tile. A Starseed perk switches on a share of them.
let PATCH=null,PATCHES=[],SEEDS=[],SEEDT=null,seedAcc=0;
function buildPatches(){
  PATCH=new Int32Array(W*H).fill(-1);PATCHES=[];SEEDT=new Uint8Array(W*H);const st=[];
  for(let i=0;i<W*H;i++){
    if(!ORE[i]||PATCH[i]>=0)continue;const k=ORE[i],id=PATCHES.length;let best=i;PATCH[i]=id;st.push(i);
    while(st.length){const j=st.pop();if(RES[j]>RES[best])best=j;const x=j%W,y=(j/W)|0;
      for(const [dx,dy] of DIRS){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=W||yy>=H)continue;const q=yy*W+xx;if(ORE[q]===k&&PATCH[q]<0){PATCH[q]=id;st.push(q)}}}
    PATCHES.push({id,k,seed:best,h:mulberry(((S.seed^Math.imul(id+1,2654435761))>>>0))()});
  }
  refreshSeeds();
}
function refreshSeeds(){
  if(!PATCHES.length)return;const pct=modOn('seeded')?1:.1*ssLv('seedv');SEEDS=[];
  for(const p of PATCHES){const on=p.h<pct;SEEDT[p.seed]=on?1:0;if(on){SEEDS.push(p);if(!ORE[p.seed]){ORE[p.seed]=p.k;RES[p.seed]=RES0[p.seed];const x=p.seed%W,y=(p.seed/W)|0;CHUNKS.delete(((y/CH)|0)*1000+((x/CH)|0))}}}
}
// Once a second each seed tops tiles in its reach back up toward their starting amount, restoring mined-out tiles
function seedTick(dt){
  seedAcc+=dt;if(seedAcc<1)return;const t=seedAcc;seedAcc=0;if(!SEEDS.length)return;
  const R=2+ssLv('seedr'),rate=.00002*Math.pow(1.5,ssLv('seedg'))*rp('seed')*t;let grew=false;
  for(const p of SEEDS){const sx=p.seed%W,sy=(p.seed/W)|0;
    for(let y=sy-R;y<=sy+R;y++)for(let x=sx-R;x<=sx+R;x++){if(x<0||y<0||x>=W||y>=H)continue;const i=y*W+x;if(PATCH[i]!==p.id||RES[i]>=RES0[i])continue;
      RES[i]=Math.min(RES0[i],RES[i]+RES0[i]*rate);if(!ORE[i]&&RES[i]>=2){ORE[i]=p.k;grew=true;CHUNKS.delete(((y/CH)|0)*1000+((x/CH)|0))}}}
  for(const b of S.bs.values()){if(b.wait)b.wait=false;if(grew&&b.dep)b.dep=false}
}
function drawSeeds(g,z){
  if(!SEEDS.length)return;const L=cam.x-VW/z/2-1,Rr=cam.x+VW/z/2+1,T=cam.y-VH/z/2-1,Bt=cam.y+VH/z/2+1,pulse=.6+.4*Math.sin(S.time*2.4);
  for(const p of SEEDS){const x=p.seed%W,y=(p.seed/W)|0;if(x<L||x>Rr||y<T||y>Bt)continue;const cx=w2sx(x+.5),cy=w2sy(y+.5),r=z*.34,oc=ORE_COL[ORE_KEYS[p.k]];
    g.beginPath();g.arc(cx,cy,r*1.25,0,7);g.strokeStyle=`rgba(127,240,208,${.35+.4*pulse})`;g.lineWidth=Math.max(1.5,z*.07);g.stroke();
    g.beginPath();g.moveTo(cx,cy-r);g.lineTo(cx+r*.75,cy);g.lineTo(cx,cy+r);g.lineTo(cx-r*.75,cy);g.closePath();g.fillStyle=oc[1];g.fill();g.strokeStyle='#7ff0d0';g.lineWidth=Math.max(1,z*.05);g.stroke()}
}
// ---------- trickle production ----------
function trickleItems(){return TRICKLE.slice(0,ssLv('trkT')).flat()}
function trickleRate(){return 6*Math.pow(1.5,ssLv('trkR'))*rp('trk')/60}
function trickleTick(dt){const ks=trickleItems();if(!ks.length)return;S.trk=S.trk||{};const r=trickleRate()*dt;for(const k of ks){S.trk[k]=(S.trk[k]||0)+r;while(S.trk[k]>=1){S.trk[k]-=1;deliver(k,true)}}}
// ---------- Core size ----------
function coreWant(){return 3+2*ssLv('core')}
function coreB(){for(const b of S.bs.values())if(b.t==='core')return b;return null}
function growCore(){
  const c=coreB(),w=coreWant();if(!c||c.w>=w)return true;const nx=Math.round(CX-w/2);
  for(let y=nx;y<nx+w;y++)for(let x=nx;x<nx+w;x++){const id=S.grid[y*W+x];if(id&&id!==c.id)return false}
  for(let y=c.y;y<c.y+c.w;y++)for(let x=c.x;x<c.x+c.w;x++)S.grid[y*W+x]=0;
  c.x=c.y=nx;c.w=w;for(let y=nx;y<nx+w;y++)for(let x=nx;x<nx+w;x++)S.grid[y*W+x]=c.id;
  dirty=true;burst(CX,CY,'#f3c25a',30);return true;
}
function deplete(i){ORE[i]=0;RES[i]=0;const x=i%W,y=(i/W)|0,c=CHUNKS.get(((y/CH)|0)*1000+((x/CH)|0));if(c)paintSpentAt(c.getContext('2d'),x%CH,y%CH,x,y)}
function forReach(b,fn){const k=ORE_KEYS.indexOf(b.ore),r=drillR(b.t),w=b.w||1;for(let y=b.y-r;y<=b.y+w-1+r;y++)for(let x=b.x-r;x<=b.x+w-1+r;x++){if(x<0||y<0||x>=W||y>=H)continue;const i=y*W+x;if(ORE[i]===k&&RES[i]>0&&!(SEEDT&&SEEDT[i]))fn(i)}}
function seededTile(i){const p=PATCH&&PATCH[i]>=0?PATCHES[PATCH[i]]:null;return !!(p&&SEEDT[p.seed])}
// 1 = mined, 0 = nothing left in reach, -1 = a seeded patch is regrowing but no tile holds a whole unit yet
function mineOne(b){let bi=-1,bv=0;forReach(b,i=>{if(RES[i]>bv){bv=RES[i];bi=i}});if(bi<0)return 0;const use=oreUse(b)/veinMul(b.ore);
  if(bv<use&&seededTile(bi))return -1;RES[bi]-=use;if(RES[bi]<=.001){if(seededTile(bi))RES[bi]=Math.max(0,RES[bi]);deplete(bi)}return 1}
function reachLeft(b){let n=0;forReach(b,i=>n+=RES[i]);return Math.round(n*veinMul(b.ore)/oreUse(b))}
function resDiff(){const o=[];if(!RES)return o;for(let i=0;i<RES.length;i++)if(RES[i]!==RES0[i])o.push(i,Math.max(0,Math.round(RES[i]*10)/10));return o}
function makeStars(){
  const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d'),R=mulberry(7);
  g.fillStyle=BI().sky;g.fillRect(0,0,512,512);
  for(let i=0;i<5;i++){const x=R()*512,y=R()*512,r=90+R()*160,gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,i%2?'rgba(80,60,150,.16)':'rgba(40,120,130,.10)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,512,512)}
  for(let i=0;i<260;i++){const x=R()*512,y=R()*512,s=R()*R()*1.8+.3;g.fillStyle=`rgba(${220+R()*35|0},${215+R()*40|0},255,${.25+R()*.7})`;g.beginPath();g.arc(x,y,s,0,7);g.fill()}
  starPat=ctx.createPattern(c,'repeat');
}

// ================= drawing: items =================
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function ingot(g,r,c1,c2){
  g.beginPath();g.moveTo(-r*.88,r*.48);g.lineTo(r*.88,r*.48);g.lineTo(r*.58,-r*.42);g.lineTo(-r*.58,-r*.42);g.closePath();g.fillStyle=c1;g.fill();g.stroke();
  g.beginPath();g.moveTo(-r*.58,-r*.42);g.lineTo(r*.58,-r*.42);g.lineTo(r*.44,-r*.08);g.lineTo(-r*.44,-r*.08);g.closePath();g.fillStyle=c2;g.fill();
}
function drawItem(g,t,r){
  g.lineJoin='round';g.lineCap='round';g.lineWidth=r*.13;g.strokeStyle='rgba(8,6,16,.9)';
  const o=ORE_COL[t];
  if(o){
    g.beginPath();const n=7;for(let i=0;i<n;i++){const a=i/n*6.283+.3,q=r*(.78+.22*((i*37%5)/4));const X=Math.cos(a)*q,Y=Math.sin(a)*q*.86;i?g.lineTo(X,Y):g.moveTo(X,Y)}
    g.closePath();g.fillStyle=o[0];g.fill();g.stroke();
    g.beginPath();g.moveTo(-r*.48,-r*.12);g.lineTo(-r*.08,-r*.56);g.lineTo(r*.36,-r*.26);g.lineTo(r*.04,r*.06);g.closePath();g.fillStyle=o[1];g.globalAlpha=t==='carbon'?.55:.8;g.fill();g.globalAlpha=1;
    return;
  }
  switch(t){
    case 'iron':ingot(g,r,'#8e98b2','#cbd3e6');break;
    case 'copper':ingot(g,r,'#c96a3a','#f6a978');break;
    case 'steel':ingot(g,r,'#545d78','#a3adc7');g.beginPath();g.moveTo(-r*.5,r*.2);g.lineTo(r*.5,r*.2);g.strokeStyle='#e1e7f5';g.lineWidth=r*.08;g.stroke();break;
    case 'glass':rr(g,-r*.7,-r*.7,r*1.4,r*1.4,r*.22);g.fillStyle='rgba(170,228,244,.82)';g.fill();g.stroke();g.beginPath();g.moveTo(-r*.35,r*.25);g.lineTo(r*.25,-r*.35);g.strokeStyle='#fff';g.lineWidth=r*.13;g.stroke();break;
    case 'gear':{
      g.beginPath();const n=8;for(let i=0;i<n*2;i++){const a0=i/(n*2)*6.283,q=i%2?r*.68:r*.95;g.arc(0,0,q,a0,a0+6.283/(n*2))}
      g.closePath();g.fillStyle='#a3abc0';g.fill();g.stroke();g.beginPath();g.arc(0,0,r*.27,0,7);g.fillStyle='#2a2638';g.fill();break;}
    case 'wire':
      for(const [w,c] of [[r*.34,'rgba(8,6,16,.9)'],[r*.18,'#ec9a5e']]){g.lineWidth=w;g.strokeStyle=c;for(let i=0;i<3;i++){g.beginPath();g.ellipse(-r*.42+i*r*.42,0,r*.3,r*.62,0,0,7);g.stroke()}}
      break;
    case 'circuit':
      rr(g,-r*.88,-r*.68,r*1.76,r*1.36,r*.14);g.fillStyle='#1f7d55';g.fill();g.stroke();
      g.strokeStyle='#f3c25a';g.lineWidth=r*.09;g.beginPath();g.moveTo(-r*.7,-r*.35);g.lineTo(-r*.3,-r*.35);g.moveTo(-r*.7,r*.35);g.lineTo(-r*.3,r*.35);g.moveTo(r*.3,0);g.lineTo(r*.7,0);g.moveTo(r*.3,-r*.4);g.lineTo(r*.7,-r*.4);g.stroke();
      rr(g,-r*.32,-r*.32,r*.64,r*.64,r*.08);g.fillStyle='#161424';g.fill();break;
    case 'lens':{
      const gr=g.createRadialGradient(-r*.25,-r*.25,r*.05,0,0,r*.85);gr.addColorStop(0,'#f2fdff');gr.addColorStop(.5,'#7fd6ea');gr.addColorStop(1,'#2a8db0');
      g.beginPath();g.arc(0,0,r*.82,0,7);g.fillStyle=gr;g.fill();g.stroke();g.beginPath();g.arc(0,0,r*.55,3.6,4.6);g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=r*.1;g.stroke();break;}
    case 'motor':
      g.fillStyle='#d4dae8';g.fillRect(r*.6,-r*.12,r*.35,r*.24);
      rr(g,-r*.82,-r*.56,r*1.5,r*1.12,r*.28);g.fillStyle='#7f89a2';g.fill();g.stroke();
      g.fillStyle='#f08a3c';g.fillRect(-r*.2,-r*.56,r*.32,r*1.12);break;
    case 'prism':{
      const gr=g.createLinearGradient(-r,0,r,0);gr.addColorStop(0,'#ff7fb0');gr.addColorStop(.35,'#ffd66e');gr.addColorStop(.65,'#72e3b2');gr.addColorStop(1,'#73b5ff');
      g.beginPath();g.moveTo(0,-r*.88);g.lineTo(r*.9,r*.66);g.lineTo(-r*.9,r*.66);g.closePath();g.fillStyle=gr;g.fill();g.stroke();
      g.beginPath();g.moveTo(0,-r*.6);g.lineTo(-r*.45,r*.4);g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=r*.08;g.stroke();break;}
    case 'ember':{
      const gr=g.createRadialGradient(-r*.2,-r*.25,r*.05,0,0,r*.95);gr.addColorStop(0,'#ffe8bf');gr.addColorStop(.4,'#ff6a3d');gr.addColorStop(1,'#4e1730');
      g.beginPath();g.moveTo(0,-r*.92);g.lineTo(r*.66,-r*.12);g.lineTo(r*.38,r*.82);g.lineTo(-r*.42,r*.76);g.lineTo(-r*.7,-r*.06);g.closePath();g.fillStyle=gr;g.fill();g.stroke();
      g.beginPath();g.moveTo(-r*.25,-r*.2);g.lineTo(r*.15,-r*.55);g.strokeStyle='rgba(255,240,210,.8)';g.lineWidth=r*.09;g.stroke();break;}
    case 'nova':{
      const gr=g.createRadialGradient(-r*.15,-r*.2,r*.05,0,0,r);gr.addColorStop(0,'#ffffff');gr.addColorStop(.35,'#e6d2ff');gr.addColorStop(.75,'#8a5cff');gr.addColorStop(1,'#2a1a5e');
      g.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,q=i%2?r*.42:r*.95;g.lineTo(Math.cos(a)*q,Math.sin(a)*q)}g.closePath();g.fillStyle=gr;g.fill();g.stroke();
      g.beginPath();g.arc(0,0,r*.16,0,7);g.fillStyle='#fff';g.fill();break;}
    case 'wafer':{const gr=g.createLinearGradient(-r,-r,r,r);gr.addColorStop(0,'#5a5f8a');gr.addColorStop(.5,'#c4ccff');gr.addColorStop(1,'#3b3f66');g.beginPath();g.arc(0,0,r*.85,0,7);g.fillStyle=gr;g.fill();g.stroke();g.strokeStyle='rgba(30,30,60,.55)';g.lineWidth=r*.05;g.beginPath();for(let k=-2;k<=2;k++){g.moveTo(k*r*.3,-r*.7);g.lineTo(k*r*.3,r*.7);g.moveTo(-r*.7,k*r*.3);g.lineTo(r*.7,k*r*.3)}g.stroke();break;}
    case 'film':{g.save();g.rotate(-.3);rr(g,-r*.9,-r*.55,r*1.8,r*1.1,r*.12);g.fillStyle='#2a4fb0';g.fill();g.stroke();g.strokeStyle='#9fd0ff';g.lineWidth=r*.07;g.beginPath();g.moveTo(-r*.6,-r*.2);g.lineTo(r*.5,-r*.2);g.moveTo(-r*.6,r*.15);g.lineTo(r*.2,r*.15);g.stroke();g.restore();break;}
    case 'composite':{for(let i=2;i>=0;i--){rr(g,-r*.85+i*r*.1,-r*.7+i*r*.3,r*1.5,r*.5,r*.1);g.fillStyle=['#6f7a96','#9aa6c2','#c9d2e8'][i];g.fill();g.stroke()}break;}
    case 'coil':{g.lineWidth=r*.44;g.beginPath();g.arc(0,0,r*.55,0,7);g.stroke();g.strokeStyle='#e88a55';g.lineWidth=r*.3;g.beginPath();g.arc(0,0,r*.55,0,7);g.stroke();g.strokeStyle='#ffc39a';g.lineWidth=r*.06;for(let k=0;k<8;k++){const a=k/8*6.283;g.beginPath();g.moveTo(Math.cos(a)*r*.42,Math.sin(a)*r*.42);g.lineTo(Math.cos(a)*r*.68,Math.sin(a)*r*.68);g.stroke()}g.fillStyle='#2a2638';g.beginPath();g.arc(0,0,r*.24,0,7);g.fill();break;}
    case 'photonic':{rr(g,-r*.75,-r*.75,r*1.5,r*1.5,r*.18);g.fillStyle='#1f2440';g.fill();g.stroke();const gr=g.createRadialGradient(0,0,0,0,0,r*.6);gr.addColorStop(0,'#ffffff');gr.addColorStop(.4,'#9fe8ff');gr.addColorStop(1,'rgba(159,232,255,0)');g.fillStyle=gr;g.beginPath();g.arc(0,0,r*.6,0,7);g.fill();g.strokeStyle='#9fe8ff';g.lineWidth=r*.07;g.beginPath();g.moveTo(-r*.75,0);g.lineTo(-r*.32,0);g.moveTo(r*.32,0);g.lineTo(r*.75,0);g.moveTo(0,-r*.75);g.lineTo(0,-r*.32);g.moveTo(0,r*.32);g.lineTo(0,r*.75);g.stroke();break;}
    case 'lattice':{const pts=[];for(let k=0;k<6;k++){const a=k/6*6.283-1.5708;pts.push([Math.cos(a)*r*.88,Math.sin(a)*r*.88])}g.beginPath();pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();const gr=g.createLinearGradient(-r,-r,r,r);gr.addColorStop(0,'#f3c25a');gr.addColorStop(.5,'#c99bff');gr.addColorStop(1,'#7ff0d0');g.fillStyle=gr;g.fill();g.stroke();g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=r*.06;g.beginPath();pts.forEach(q=>{g.moveTo(0,0);g.lineTo(q[0],q[1])});g.stroke();break;}
    case 'frame':
      rr(g,-r*.8,-r*.8,r*1.6,r*1.6,r*.12);g.fillStyle='#8a94b0';g.fill();g.stroke();
      rr(g,-r*.46,-r*.46,r*.92,r*.92,r*.06);g.fillStyle='#2a2638';g.fill();
      g.beginPath();g.moveTo(-r*.46,-r*.46);g.lineTo(r*.46,r*.46);g.strokeStyle='#c8d0e6';g.lineWidth=r*.16;g.stroke();break;
    case 'processor':
      g.strokeStyle='#f3c25a';g.lineWidth=r*.1;g.beginPath();for(let k=-1;k<=1;k++){const o=k*r*.38;g.moveTo(o,-r*.95);g.lineTo(o,r*.95);g.moveTo(-r*.95,o);g.lineTo(r*.95,o)}g.stroke();
      rr(g,-r*.66,-r*.66,r*1.32,r*1.32,r*.14);g.fillStyle='#2c2748';g.fill();g.strokeStyle='rgba(8,6,16,.9)';g.lineWidth=r*.12;g.stroke();
      rr(g,-r*.3,-r*.3,r*.6,r*.6,r*.08);g.fillStyle='#6fe0c0';g.fill();break;
    case 'servo':
      g.fillStyle='#d4dae8';g.fillRect(r*.2,-r*.9,r*.22,r*.6);
      rr(g,-r*.85,-r*.35,r*1.7,r*1.05,r*.3);g.fillStyle='#e08a3c';g.fill();g.stroke();
      g.beginPath();g.arc(r*.3,-r*.35,r*.36,0,7);g.fillStyle='#8f99b2';g.fill();g.stroke();
      g.beginPath();g.arc(-r*.35,r*.17,r*.18,0,7);g.fillStyle='#2a2638';g.fill();break;
    case 'aether':{
      const gr=g.createRadialGradient(-r*.2,-r*.2,r*.05,0,0,r*.85);gr.addColorStop(0,'#ffffff');gr.addColorStop(.35,'#d8a8ff');gr.addColorStop(1,'#6a2fc0');
      g.beginPath();g.arc(0,0,r*.72,0,7);g.fillStyle=gr;g.fill();g.stroke();
      g.beginPath();g.ellipse(0,0,r*.98,r*.32,-.5,0,7);g.strokeStyle='#f0d8ff';g.lineWidth=r*.09;g.stroke();break;}
    case 'petal':{
      const gr=g.createLinearGradient(0,-r,0,r);gr.addColorStop(0,'#fff4c4');gr.addColorStop(.5,'#f3c25a');gr.addColorStop(1,'#b97a17');
      g.beginPath();g.moveTo(0,-r);g.quadraticCurveTo(r*.98,0,0,r);g.quadraticCurveTo(-r*.98,0,0,-r);g.fillStyle=gr;g.fill();g.stroke();
      g.beginPath();g.moveTo(0,-r*.7);g.lineTo(0,r*.7);g.strokeStyle='rgba(255,250,225,.85)';g.lineWidth=r*.07;g.stroke();break;}
  }
}
const SPR={},ICON={},ICON_B={};
function makeSprites(){
  for(const t of ITEM_ORDER){
    const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.translate(32,32);drawItem(g,t,26);SPR[t]=c;ICON[t]=c.toDataURL();
  }
}

// ================= drawing: buildings =================
function base(g,x,y,s,fill,ins){const i=s*(ins||.07);rr(g,x+i,y+i,s-2*i,s-2*i,s*.17);g.fillStyle=fill||'#45406a';g.fill();g.lineWidth=Math.max(1,s*.035);g.strokeStyle='#7d75b4';g.stroke()}
function port(g,b,x,y,s,col,ti){
  const w=b.w||1,[dx,dy]=DIRS[b.d],mid=s*((ti!=null?ti:Math.floor((w-1)/2))+.5),cx=x+(dx?s*w/2:mid),cy=y+(dy?s*w/2:mid),px=-dy,py=dx;
  const ex=cx+dx*s*(w/2-.07),ey=cy+dy*s*(w/2-.07),L=s*.24;
  g.beginPath();g.moveTo(ex+px*L,ey+py*L);g.lineTo(ex-px*L,ey-py*L);g.strokeStyle=col;g.lineWidth=Math.max(1.5,s*.075);g.lineCap='round';g.stroke();
  const tx=cx+dx*s*(w/2-.2),ty=cy+dy*s*(w/2-.2),a=s*.07;
  g.beginPath();g.moveTo(tx+dx*a*1.2,ty+dy*a*1.2);g.lineTo(tx-dx*a+px*a,ty-dy*a+py*a);g.lineTo(tx-dx*a-px*a,ty-dy*a-py*a);g.closePath();g.fillStyle=col;g.fill();
}
function arrowTri(g,cx,cy,d,len,w,col){
  const [dx,dy]=DIRS[d],px=-dy,py=dx;
  g.beginPath();g.moveTo(cx+dx*len,cy+dy*len);g.lineTo(cx+dx*(len-w*1.3)+px*w,cy+dy*(len-w*1.3)+py*w);g.lineTo(cx+dx*(len-w*1.3)-px*w,cy+dy*(len-w*1.3)-py*w);g.closePath();g.fillStyle=col;g.fill();
}
let GL=[];
function glow(x,y,r,col,a){GL.push([x,y,r,col,a])}
function drawCore(g,b,x,y,s){
      const S3=s*3,c3x=x+S3/2,c3y=y+S3/2;
      rr(g,x+s*.12,y+s*.12,S3-s*.24,S3-s*.24,s*.5);g.fillStyle='#36325a';g.fill();g.lineWidth=s*.05;g.strokeStyle='#7d75b4';g.stroke();
      for(let d=0;d<4;d++){const [dx,dy]=DIRS[d];g.fillStyle='#f3c25a';g.globalAlpha=.55;const L=s*.8,T=s*.07;if(dx)g.fillRect(c3x+dx*(S3/2-s*.2)-T/2,c3y-L/2,T,L);else g.fillRect(c3x-L/2,c3y+dy*(S3/2-s*.2)-T/2,L,T);g.globalAlpha=1}
      g.save();g.translate(c3x,c3y);g.rotate(b.ang);
      g.beginPath();for(let i=0;i<6;i++){const a=i/6*6.283;const X=Math.cos(a)*s*1.05,Y=Math.sin(a)*s*1.05;i?g.lineTo(X,Y):g.moveTo(X,Y)}g.closePath();g.fillStyle='#2b2556';g.fill();g.lineWidth=s*.06;g.strokeStyle='#8c80d8';g.stroke();
      g.setLineDash([s*.25,s*.18]);g.beginPath();g.arc(0,0,s*1.25,0,7);g.strokeStyle='rgba(243,194,90,.55)';g.lineWidth=s*.05;g.stroke();g.setLineDash([]);
      g.restore();
      const gr=g.createRadialGradient(c3x,c3y,0,c3x,c3y,s*.62);gr.addColorStop(0,'#fff6d8');gr.addColorStop(.45,'#f3c25a');gr.addColorStop(1,'rgba(160,110,230,.0)');
      g.beginPath();g.arc(c3x,c3y,s*.62,0,7);g.fillStyle=gr;g.fill();
      const hw=(b.w||3)/2;glow(b.x+hw,b.y+hw,3.2*hw/1.5,'#c9a2ff',.45);glow(b.x+hw,b.y+hw,1.6*hw/1.5,'#f3c25a',.5);
      }
function drawMachine(g,b,x,y,s){
  const cx=x+s/2,cy=y+s/2;
  switch(b.t){
    case 'drill':case 'deepdrill':{
      const deep=b.t==='deepdrill',z=deep?s*2:s,cx=x+z/2,cy=y+z/2,s0=s;{const s=z;base(g,x,y,s,deep?'#53435e':'#423d62');const oc=ORE_COL[b.ore]||ORE_COL.ferrite;
      g.beginPath();g.arc(cx,cy,s*.29,0,7);g.fillStyle='#25222f';g.fill();g.lineWidth=s*.06;g.strokeStyle=oc[0];g.stroke();
      g.save();g.translate(cx,cy);g.rotate(b.ang);g.fillStyle='#a69fcc';
      for(let i=0;i<3;i++){g.rotate(2.094);g.beginPath();g.moveTo(0,-s*.05);g.lineTo(s*.22,-s*.02);g.lineTo(s*.05,s*.07);g.closePath();g.fill()}
      g.restore();g.beginPath();g.arc(cx,cy,s*.05,0,7);g.fillStyle=b.dep?'#ff7378':oc[1];g.fill();
      if(deep){g.beginPath();g.arc(cx,cy,s*.37,0,7);g.strokeStyle='#f3c25a';g.lineWidth=s*.035;g.stroke()}
      if(b.dep){g.fillStyle='rgba(10,8,18,.45)';rr(g,x+s*.07,y+s*.07,s*.86,s*.86,s*.17);g.fill()}
      const pc=b.dep?'#6d6690':oc[1];if(deep){const bk={w:2,d:opp(b.d)};port(g,b,x,y,s0,pc,0);port(g,b,x,y,s0,pc,1);port(g,bk,x,y,s0,pc,0);port(g,bk,x,y,s0,pc,1)}else port(g,b,x,y,s,pc)}break;}
    case 'junction':{
      base(g,x,y,s,'#322e4e',.03);
      g.fillStyle='#211e33';g.fillRect(x+s*.03,cy-s*.29,s*.94,s*.58);
      g.fillStyle='#4c4774';g.fillRect(x+s*.03,cy-s*.22,s*.94,s*.44);
      drawLane(g,b.lanes[1],cx,cy,s);
      rr(g,cx-s*.31,y+s*.03,s*.62,s*.94,s*.1);g.fillStyle='#3a3557';g.fill();g.strokeStyle='#6a6299';g.lineWidth=Math.max(1,s*.035);g.stroke();
      g.strokeStyle='rgba(243,194,90,.4)';g.lineWidth=Math.max(1,s*.03);g.beginPath();g.moveTo(cx-s*.21,y+s*.12);g.lineTo(cx-s*.21,y+s*.88);g.moveTo(cx+s*.21,y+s*.12);g.lineTo(cx+s*.21,y+s*.88);g.stroke();
      drawLane(g,b.lanes[0],cx,cy,s);
      break;}
    case 'smelter':{
      base(g,x,y,s,'#4a405e');const h=b.heat;
      const gr=g.createRadialGradient(cx,cy,0,cx,cy,s*.27);gr.addColorStop(0,h>.05?`rgba(255,${200+40*h|0},${120+60*h|0},${.35+.65*h})`:'#2a1e2b');gr.addColorStop(.7,h>.05?`rgba(240,120,50,${.25+.6*h})`:'#21171f');gr.addColorStop(1,'#1a1220');
      g.beginPath();g.arc(cx,cy,s*.26,0,7);g.fillStyle=gr;g.fill();g.lineWidth=s*.05;g.strokeStyle='#5b4060';g.stroke();
      if(h>.05)glow(b.x+.5,b.y+.5,1.1,'#ff9a45',.55*h);
      port(g,b,x,y,s,'#ffb070');break;}
    case 'fab':{
      base(g,x,y,s,'#423d6c');
      g.save();g.setLineDash([s*.09,s*.06]);g.lineDashOffset=-b.ang*s*.3;g.beginPath();g.arc(cx,cy,s*.32,0,7);g.strokeStyle=b.run?'#9f95e6':'#5d5790';g.lineWidth=s*.06;g.stroke();g.restore();
      if(b.rec){const q=s*.42;g.drawImage(SPR[b.rec],cx-q/2,cy-q/2,q,q)}
      else{g.fillStyle='#ff7378';g.beginPath();g.arc(cx,cy,s*.06,0,7);g.fill()}
      if(b.run){g.beginPath();g.arc(cx,cy,s*.32,-1.5708,-1.5708+6.283*b.prog);g.strokeStyle='#f3c25a';g.lineWidth=s*.06;g.stroke();glow(b.x+.5,b.y+.5,.8,'#9f8cff',.25)}
      port(g,b,x,y,s,'#c4baff');break;}
    case 'foundry':{
      const S3=s*3,c3x=x+S3/2,c3y=y+S3/2,h=b.heat;
      rr(g,x+s*.08,y+s*.08,S3-s*.16,S3-s*.16,s*.35);g.fillStyle='#4a3a52';g.fill();g.lineWidth=s*.05;g.strokeStyle='#a07a6a';g.stroke();
      for(let i=0;i<3;i++){g.fillStyle='#3a2c3c';rr(g,x+s*(.5+i)-s*.28,y+s*.22,s*.56,s*.42,s*.1);g.fill()}
      const gr=g.createRadialGradient(c3x,c3y+s*.25,0,c3x,c3y+s*.25,s);gr.addColorStop(0,h>.05?`rgba(255,${210+30*h|0},${140+60*h|0},${.4+.6*h})`:'#2a1e2b');gr.addColorStop(.7,h>.05?`rgba(240,110,50,${.3+.5*h})`:'#24181f');gr.addColorStop(1,'#1c1218');
      rr(g,c3x-s*.95,c3y-s*.3,s*1.9,s*1.15,s*.3);g.fillStyle=gr;g.fill();g.strokeStyle='#6b4a5a';g.lineWidth=s*.06;g.stroke();
      if(b.outT){const q=s*.7;g.drawImage(SPR[b.outT],c3x-q/2,c3y+s*.27-q/2,q,q)}
      if(h>.05)glow(b.x+1.5,b.y+1.6,2.6,'#ff9a45',.6*h);
      port(g,b,x,y,s,'#ffb070',0);port(g,b,x,y,s,'#ffb070',1);port(g,b,x,y,s,'#ffb070',2);break;}
    case 'fab2':{
      const S2=s*2,c2x=x+s,c2y=y+s;
      rr(g,x+s*.08,y+s*.08,S2-s*.16,S2-s*.16,s*.3);g.fillStyle='#423d6c';g.fill();g.lineWidth=Math.max(1,s*.05);g.strokeStyle='#9f95e6';g.stroke();
      g.save();g.setLineDash([s*.14,s*.08]);g.lineDashOffset=-b.ang*s*.5;g.beginPath();g.arc(c2x,c2y,s*.62,0,7);g.strokeStyle=b.run?'#b8b0ff':'#5d5790';g.lineWidth=s*.09;g.stroke();g.restore();
      if(b.rec){const q=s*.8;g.drawImage(SPR[b.rec],c2x-q/2,c2y-q/2,q,q)}else{g.fillStyle='#ff7378';g.beginPath();g.arc(c2x,c2y,s*.1,0,7);g.fill()}
      if(b.run){g.beginPath();g.arc(c2x,c2y,s*.62,-1.5708,-1.5708+6.283*b.prog);g.strokeStyle='#f3c25a';g.lineWidth=s*.09;g.stroke();glow(b.x+1,b.y+1,1.4,'#9f8cff',.3)}
      port(g,b,x,y,s,'#c4baff');break;}
    case 'filmarray':{
      const S2=s*2,i0=s*.06;rr(g,x+i0,y+i0,S2-2*i0,S2-2*i0,s*.12);g.fillStyle='#1e2a5c';g.fill();g.lineWidth=Math.max(1,s*.05);g.strokeStyle='#c9a34e';g.stroke();
      g.strokeStyle='#33478a';g.lineWidth=Math.max(1,s*.025);g.beginPath();for(let k=1;k<4;k++){const o=i0+(S2-2*i0)*k/4;g.moveTo(x+o,y+i0);g.lineTo(x+o,y+S2-i0);g.moveTo(x+i0,y+o);g.lineTo(x+S2-i0,y+o)}g.stroke();
      const sh=PW.day;if(sh>0){g.save();rr(g,x+i0,y+i0,S2-2*i0,S2-2*i0,s*.12);g.clip();const ph=(((S?S.time:0)*.12+b.x*.11)%1.6)-.3,gx=x+S2*ph,gr=g.createLinearGradient(gx-s*.5,y,gx+s*.5,y+S2);gr.addColorStop(0,'rgba(255,240,200,0)');gr.addColorStop(.5,`rgba(200,230,255,${.3*sh})`);gr.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=gr;g.fillRect(x,y,S2,S2);g.restore()}
      break;}
    case 'capacitor':{
      const S2=s*2;rr(g,x+s*.1,y+s*.1,S2-s*.2,S2-s*.2,s*.3);g.fillStyle='#2f3550';g.fill();g.lineWidth=Math.max(1,s*.05);g.strokeStyle='#7ff0d0';g.stroke();
      const f=S&&S.bs?Math.min(1,(S.charge||0)/chargeCap()):.6;
      for(let i=0;i<3;i++){const cx2=x+s*(.45+i*.55),top=y+s*.4,hh=s*1.2;g.fillStyle='#1c2236';rr(g,cx2-s*.18,top,s*.36,hh,s*.12);g.fill();if(f>.01){g.fillStyle='#7ff0d0';const fh=Math.max(s*.24,hh*f);rr(g,cx2-s*.18,top+hh-fh,s*.36,fh,s*.12);g.fill()}}
      glow(b.x+1,b.y+1,1.6,'#7ff0d0',.15+.3*f);break;}
    case 'batcher':{
      const S2=s*2;rr(g,x+s*.08,y+s*.08,S2-s*.16,S2-s*.16,s*.3);g.fillStyle='#3d3a62';g.fill();g.lineWidth=Math.max(1,s*.05);g.strokeStyle='#8c82c8';g.stroke();
      const ks=Object.keys(b.st).filter(k=>b.st[k]>0).slice(0,6);
      for(let i=0;i<6;i++){const bx=x+s*(.3+i*.24),f=ks[i]?Math.min(1,b.st[ks[i]]/50):0;g.fillStyle='#262342';rr(g,bx,y+s*.35,s*.16,s*.95,s*.05);g.fill();if(f>0){g.fillStyle=ITEM_TINT[ks[i]]||'#f3c25a';g.fillRect(bx,y+s*(1.3-.95*f),s*.16,s*.95*f);const q=s*.3;g.drawImage(SPR[ks[i]],bx+s*.08-q/2,y+s*1.36,q,q)}}
      const rk=Object.keys(b.ratio);if(rk.length){g.font=`600 ${Math.max(7,s*.2)}px ${getComputedStyle(document.body).fontFamily}`;g.fillStyle='#f3c25a';g.textAlign='center';g.fillText(rk.map(k=>b.ratio[k]).join(':'),x+s,y+s*.3);g.textAlign='left'}
      port(g,b,x,y,s,'#f3c25a',0);port(g,b,x,y,s,'#f3c25a',1);break;}
    case 'splitter':{
      base(g,x,y,s,'#403c66',.14);
      const pd=b.pri!=null?[b.d,(b.d+3)&3,(b.d+1)&3][b.pri]:-1;for(const d of [b.d,(b.d+1)&3,(b.d+3)&3])arrowTri(g,cx,cy,d,s*(d===pd?.38:.3),s*(d===pd?.13:.1),d===pd?'#7ff0d0':pd<0&&d===b.d?'#f3c25a':'#b8b0e6');
      g.beginPath();g.arc(cx,cy,s*.08,0,7);g.fillStyle=b.hold?'#f3c25a':'#7d75b4';g.fill();break;}
    case 'sorter':{
      base(g,x,y,s,'#403c66',.1);
      {const all=[b.d,(b.d+3)&3,(b.d+1)&3],pk=all[b.sd||0];for(const d of all)arrowTri(g,cx,cy,d,s*.38,s*(d===pk?.1:.07),d===pk?'#f3c25a':'#8a83b8')}
      if(b.filter){const q=s*.36;g.drawImage(SPR[b.filter],cx-q/2,cy-q/2,q,q)}
      else{g.beginPath();g.arc(cx,cy,s*.12,0,7);g.strokeStyle='#8a83b8';g.lineWidth=s*.04;g.stroke()}
      break;}
    case 'combustor':{
      g.beginPath();g.arc(cx,cy,s*.42,0,7);g.fillStyle='#4c3c56';g.fill();g.lineWidth=s*.04;g.strokeStyle='#5a4062';g.stroke();
      const h=b.heat;const gr=g.createRadialGradient(cx,cy,0,cx,cy,s*.26);
      gr.addColorStop(0,h>.03?`rgba(255,230,170,${.4+.6*h})`:'#2b1d24');gr.addColorStop(.6,h>.03?`rgba(255,110,60,${.3+.6*h})`:'#24181f');gr.addColorStop(1,'#1c1218');
      g.beginPath();g.arc(cx,cy,s*.25,0,7);g.fillStyle=gr;g.fill();
      for(let i=0;i<8;i++){const a=i/8*6.283-1.57;g.beginPath();g.arc(cx+Math.cos(a)*s*.34,cy+Math.sin(a)*s*.34,s*.035,0,7);g.fillStyle=i<b.fuel?'#b6a6e8':'#3a3150';g.fill()}
      if(h>.03)glow(b.x+.5,b.y+.5,1.4,'#ff7a3a',.6*h);
      port(g,b,x,y,s,'#ff9a6a');
      break;}
    case 'solar':{
      const i=s*.08;rr(g,x+i,y+i,s-2*i,s-2*i,s*.08);g.fillStyle='#1b2450';g.fill();g.lineWidth=Math.max(1,s*.05);g.strokeStyle='#8a7440';g.stroke();
      g.strokeStyle='#2e3d78';g.lineWidth=Math.max(1,s*.025);g.beginPath();
      for(let k=1;k<3;k++){const o=i+(s-2*i)*k/3;g.moveTo(x+o,y+i);g.lineTo(x+o,y+s-i);g.moveTo(x+i,y+o);g.lineTo(x+s-i,y+o)}g.stroke();
      const sh=PW.day;if(sh>0){g.save();rr(g,x+i,y+i,s-2*i,s-2*i,s*.08);g.clip();const ph=(((S?S.time:0)*.15+b.x*.13+b.y*.07)%1.6)-.3;const gx=x+s*ph;const gr=g.createLinearGradient(gx-s*.3,y,gx+s*.3,y+s);gr.addColorStop(0,'rgba(255,240,200,0)');gr.addColorStop(.5,`rgba(255,236,190,${.28*sh})`);gr.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=gr;g.fillRect(x,y,s,s);g.restore()}
      break;}
    case 'uplink':{
      base(g,x,y,s,'#363d60');
      g.beginPath();g.arc(cx,cy,s*.28,0,7);g.strokeStyle='#3f5a7a';g.lineWidth=s*.05;g.stroke();
      const p=(b.ph%1);g.beginPath();g.arc(cx,cy,s*(.1+.3*p),0,7);g.strokeStyle=`rgba(127,230,255,${(1-p)*.8})`;g.lineWidth=s*.04;g.stroke();
      g.beginPath();g.arc(cx,cy,s*.1,0,7);g.fillStyle=b.active?'#a9f1ff':'#4f8aa0';g.fill();
      if(b.active)glow(b.x+.5,b.y+.5,1.2,'#62d8ff',.5);
      break;}
    case 'turbine':{
      const S3=s*3,c3x=x+S3/2,c3y=y+S3/2,h=b.heat;
      rr(g,x+s*.1,y+s*.1,S3-s*.2,S3-s*.2,s*.4);g.fillStyle='#4a3f5c';g.fill();g.lineWidth=s*.05;g.strokeStyle='#8c82c2';g.stroke();
      const gr=g.createRadialGradient(c3x,c3y,0,c3x,c3y,s*1.1);gr.addColorStop(0,h>.03?`rgba(255,215,150,${.5+.5*h})`:'#3a2d3a');gr.addColorStop(.7,h>.03?`rgba(255,110,60,${.3+.5*h})`:'#2e2433');gr.addColorStop(1,'#271f2e');
      g.beginPath();g.arc(c3x,c3y,s*1.08,0,7);g.fillStyle=gr;g.fill();g.strokeStyle='#8c82c2';g.lineWidth=s*.06;g.stroke();
      g.save();g.translate(c3x,c3y);g.rotate(b.ang);
      for(let i=0;i<7;i++){g.rotate(6.283/7);g.beginPath();g.moveTo(s*.16,-s*.04);g.quadraticCurveTo(s*.6,-s*.42,s*.98,-s*.16);g.lineTo(s*.98,s*.02);g.quadraticCurveTo(s*.55,-s*.14,s*.16,s*.1);g.closePath();g.fillStyle='#d6cff5';g.fill()}
      g.restore();g.beginPath();g.arc(c3x,c3y,s*.2,0,7);g.fillStyle='#f3c25a';g.fill();
      for(let i=0;i<10;i++){g.beginPath();g.arc(x+s*.55+i*s*.21,y+S3-s*.3,s*.06,0,7);g.fillStyle=i*2<b.fuel?'#b6a6e8':'#4a405e';g.fill()}
      if(h>.03)glow(b.x+1.5,b.y+1.5,2.8,'#ff8a45',.5*h);
      break;}
    case 'collector':{
      const S3=s*3,sh=.25+.75*PW.day;
      rr(g,x+s*.08,y+s*.08,S3-s*.16,S3-s*.16,s*.25);g.fillStyle='#2f3a70';g.fill();g.lineWidth=s*.06;g.strokeStyle='#d0aa55';g.stroke();
      for(let j=0;j<3;j++)for(let i=0;i<3;i++){const q=s*.78,cx2=x+s*(i+.5),cy2=y+s*(j+.5);g.globalAlpha=.55+.45*sh;g.drawImage(SPR.prism,cx2-q/2,cy2-q/2,q,q);g.globalAlpha=1}
      glow(b.x+1.5,b.y+1.5,2.6,'#a6dcff',.35*sh);
      break;}
    case 'relay':{
      base(g,x,y,s,'#33406a');const t=(S?S.time:0),p=(t*.9+b.x*.13)%1;
      g.beginPath();g.arc(cx,cy,s*(.12+.3*p),0,7);g.strokeStyle=`rgba(127,240,208,${.85*(1-p)})`;g.lineWidth=s*.05;g.stroke();
      g.beginPath();g.moveTo(cx,cy-s*.2);g.lineTo(cx+s*.14,cy);g.lineTo(cx,cy+s*.2);g.lineTo(cx-s*.14,cy);g.closePath();g.fillStyle='#7ff0d0';g.fill();
      glow(b.x+.5,b.y+.5,1.1,'#7ff0d0',.3);
      break;}
    case 'assembler':{
      const S3=s*3,c3x=x+S3/2,c3y=y+S3/2;
      rr(g,x+s*.08,y+s*.08,S3-s*.16,S3-s*.16,s*.35);g.fillStyle='#403a70';g.fill();g.lineWidth=s*.05;g.strokeStyle='#8c82c8';g.stroke();
      g.save();g.translate(c3x,c3y);for(let i=0;i<4;i++){g.save();g.rotate(i*1.5708+.785+Math.sin(b.ang+i)*.3);rr(g,s*.6,-s*.1,s*.66,s*.2,s*.08);g.fillStyle='#b8b0e6';g.fill();g.restore()}g.restore();
      g.beginPath();g.arc(c3x,c3y,s*.78,0,7);g.fillStyle='#2a2650';g.fill();g.strokeStyle=b.run?'#9f95e6':'#5d5790';g.lineWidth=s*.06;g.stroke();
      if(b.rec){const q=s*.95;g.drawImage(SPR[b.rec],c3x-q/2,c3y-q/2,q,q)}else{g.fillStyle='#ff7378';g.beginPath();g.arc(c3x,c3y,s*.12,0,7);g.fill()}
      if(b.run){g.beginPath();g.arc(c3x,c3y,s*.78,-1.5708,-1.5708+6.283*b.prog);g.strokeStyle='#f3c25a';g.lineWidth=s*.08;g.stroke();glow(b.x+1.5,b.y+1.5,2,'#9f8cff',.3)}
      port(g,b,x,y,s,'#c4baff');break;}
    case 'refinery':{
      const S3=s*3,c3x=x+S3/2,c3y=y+S3/2,f=Math.min(1,b.n/(S?refRatio():1000));
      rr(g,x+s*.08,y+s*.08,S3-s*.16,S3-s*.16,s*.3);g.fillStyle='#3a3352';g.fill();g.lineWidth=s*.05;g.strokeStyle='#a58fd0';g.stroke();
      g.beginPath();g.arc(c3x,c3y,s*1.05,0,7);g.fillStyle='#231d33';g.fill();
      if(f>0){g.beginPath();g.arc(c3x,c3y,s*1.05,-1.5708,-1.5708+6.283*f);g.strokeStyle='#c99bff';g.lineWidth=s*.12;g.stroke()}
      g.save();g.translate(c3x,c3y);g.rotate(b.ang);for(let i=0;i<6;i++){g.rotate(1.047);g.fillStyle='#8a80b8';g.fillRect(s*.22,-s*.07,s*.58,s*.14)}g.restore();
      if(b.run){g.globalAlpha=.5+.5*b.prog;g.drawImage(SPR.aether,c3x-s*.45,c3y-s*.45,s*.9,s*.9);g.globalAlpha=1;glow(b.x+1.5,b.y+1.5,2.4,'#c48bff',.5)}
      else{g.beginPath();g.arc(c3x,c3y,s*.22,0,7);g.fillStyle='#5a4a7a';g.fill()}
      port(g,b,x,y,s,'#d8b4ff');break;}
    case 'reactor':{
      const S3=s*3,c3x=x+S3/2,c3y=y+S3/2,h=b.heat;
      rr(g,x+s*.08,y+s*.08,S3-s*.16,S3-s*.16,s*.5);g.fillStyle='#2c2548';g.fill();g.lineWidth=s*.05;g.strokeStyle='#c99bff';g.stroke();
      const gr=g.createRadialGradient(c3x,c3y,0,c3x,c3y,s*1.05);gr.addColorStop(0,h>.03?`rgba(255,255,255,${.4+.6*h})`:'#3a2d55');gr.addColorStop(.45,h>.03?`rgba(190,120,255,${.4+.5*h})`:'#30264a');gr.addColorStop(1,'#241c3a');
      g.beginPath();g.arc(c3x,c3y,s*1.05,0,7);g.fillStyle=gr;g.fill();
      g.save();g.translate(c3x,c3y);for(let k=0;k<3;k++){g.save();g.rotate(b.ang*(k%2?-1:1)+k*1.05);g.beginPath();g.ellipse(0,0,s*1.28,s*.42,0,0,7);g.strokeStyle=`rgba(216,180,255,${.35+.5*h})`;g.lineWidth=s*.05;g.stroke();g.restore()}g.restore();
      for(let i=0;i<4;i++){g.beginPath();g.arc(c3x-s*.45+i*s*.3,y+S3-s*.28,s*.07,0,7);g.fillStyle=i<b.fuel?'#d8b4ff':'#3a3452';g.fill()}
      if(h>.03)glow(b.x+1.5,b.y+1.5,3.4,'#b77cff',.6*h);
      break;}
    case 'core':drawCore(g,b,x,y,s*(b.w||3)/3);break;
    case 'ring':{
      const S3=s*3,c3x=x+S3/2,c3y=y+S3/2;
      g.beginPath();g.arc(c3x,c3y,S3*.47,0,7);g.fillStyle='#302d4c';g.fill();g.lineWidth=s*.05;g.strokeStyle='#7d75b4';g.stroke();
      g.save();g.translate(c3x,c3y);g.rotate(b.ang);
      for(let i=0;i<12;i++){g.rotate(6.283/12);g.fillStyle=i%3?'#8a7440':'#f3c25a';g.fillRect(s*1.02,-s*.07,s*.28,s*.14)}
      g.restore();
      g.beginPath();g.arc(c3x,c3y,s*.95,0,7);g.strokeStyle='rgba(243,194,90,.8)';g.lineWidth=s*.09;g.stroke();
      if(b.active){g.beginPath();g.arc(c3x,c3y,s*.95,-1.5708,-1.5708+6.283*b.prog);g.strokeStyle='#fff4c4';g.lineWidth=s*.12;g.stroke()}
      if(b.n>0){const q=s*.9;g.drawImage(SPR.petal,c3x-q/2,c3y-q/2,q,q);glow(b.x+1.5,b.y+1.5,2.4,'#f3c25a',.55)}
      for(let i=0;i<4;i++){g.beginPath();g.arc(c3x-s*.45+i*s*.3,c3y+s*1.22,s*.06,0,7);g.fillStyle=i<b.n?'#f3c25a':'#3a3452';g.fill()}
      break;}
  }
}
function drawLane(g,lane,cx,cy,s){const q=s*.44;for(const it of lane){const v=DIRS[it.d];g.drawImage(SPR[it.t],cx+v[0]*(it.p-.5)*s-q/2,cy+v[1]*(it.p-.5)*s-q/2,q,q)}}
function reachRect(g,x,y,r,w){w=w||1;g.save();g.setLineDash([5,4]);g.strokeStyle='rgba(111,224,192,.85)';g.lineWidth=1.5;g.strokeRect(w2sx(x-r)+1,w2sy(y-r)+1,(2*r+w)*cam.z-2,(2*r+w)*cam.z-2);g.restore()}
function beltPath(p,b,x,y,s){
  const cx=x+s/2,cy=y+s/2,e=DIRS[b.vin],o=DIRS[b.d];
  p.moveTo(cx+e[0]*s/2,cy+e[1]*s/2);p.quadraticCurveTo(cx,cy,cx+o[0]*s/2,cy+o[1]*s/2);
}
function drawBeltLayer(g,list,s,tm){
  if(!list.length)return;
  const p=new Path2D();for(const [b,x,y] of list)beltPath(p,b,x,y,s);
  g.lineCap='butt';g.lineJoin='round';
  g.lineWidth=s*.72;g.strokeStyle='#211e33';g.stroke(p);
  g.lineWidth=s*.58;g.strokeStyle='#4c4774';g.stroke(p);
  g.save();g.setLineDash([s*.075,s/3-s*.075]);g.lineDashOffset=-((tm*BV*s)%(s/3));g.lineWidth=s*.36;g.strokeStyle='rgba(243,194,90,.26)';g.stroke(p);g.restore();
}
function itemPos(b,it){
  const p=it.p,e=DIRS[it.f],o=DIRS[b.d],a=(1-p)*(1-p)*.5,c=p*p*.5;
  return [b.x+.5+e[0]*a+o[0]*c,b.y+.5+e[1]*a+o[1]*c];
}
function makeBuildingIcons(){
  for(const t of Object.keys(B)){
    const c=document.createElement('canvas');c.width=c.height=72;const g=c.getContext('2d');
    const fake=Object.assign({t,x:0,y:0,d:1,w:B[t].w||1},init(t),{ore:'ferrite',heat:.7,ang:.5,fuel:5,n:1,vin:3,ph:.4,run:false,prog:0,rec:t==='fab'||t==='fab2'?'gear':null});
    const saveGL=GL;GL=[];
    if(t==='belt')drawBeltLayer(g,[[fake,4,4]],64,0);
    else if(fake.w>1)drawMachine(g,fake,0,0,72/fake.w);
    else drawMachine(g,fake,4,4,64);
    GL=saveGL;ICON_B[t]=c.toDataURL();
  }
}

// ================= camera / render =================
const cv=$('#world'),ctx=cv.getContext('2d');
let DPR=1,VW=0,VH=0;
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);VW=window.innerWidth;VH=window.innerHeight;cv.width=Math.round(VW*DPR);cv.height=Math.round(VH*DPR);cv.style.width=VW+'px';cv.style.height=VH+'px'}
const w2sx=x=>(x-cam.x)*cam.z+VW/2,w2sy=y=>(y-cam.y)*cam.z+VH/2;
const s2wx=x=>(x-VW/2)/cam.z+cam.x,s2wy=y=>(y-VH/2)/cam.z+cam.y;
const ITEM_TINT={wafer:'#a7b0ee',film:'#3d66d0',composite:'#aab4cc',coil:'#e88a55',photonic:'#9fe8ff',lattice:'#c99bff',ferrite:'#e07a40',cuprite:'#3cc49c',silica:'#c8c0ea',carbon:'#8d7fc8',iron:'#b8c0d6',copper:'#e88a55',glass:'#9fdcf0',gear:'#a3abc0',wire:'#ec9a5e',circuit:'#3aa070',steel:'#7d88a6',lens:'#7fd6ea',motor:'#f08a3c',prism:'#ffd66e',petal:'#f3c25a',frame:'#8a94b0',processor:'#6fe0c0',servo:'#e08a3c',aether:'#c99bff',ember:'#ff6a3d',nova:'#e0c8ff'};
const glowCache={},DISCO=['#ffd77a','#ff9fd0','#9fe8ff','#ffffff','#c7b2ff'];
function glowSpr(col){
  if(glowCache[col])return glowCache[col];
  const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const gr=g.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,col);gr.addColorStop(.35,col+'88');gr.addColorStop(1,col+'00');g.fillStyle=gr;g.fillRect(0,0,128,128);return glowCache[col]=c;
}
function clampCam(){const L=S?mapLim():64;cam.z=Math.max(10,Math.min(84,cam.z));cam.x=Math.max(186-L,Math.min(198+L,cam.x));cam.y=Math.max(186-L,Math.min(198+L,cam.y))}

function render(rdt){
  AUvis=0;const z=cam.z,g=ctx;g.setTransform(DPR,0,0,DPR,0,0);
  const ox=((-cam.x*z*.12)%512+512)%512,oy=((-cam.y*z*.12)%512+512)%512;
  g.save();g.translate(ox,oy);g.fillStyle=starPat;g.fillRect(-ox,-oy,VW,VH);g.restore();
  const wx0=Math.max(0,Math.floor(s2wx(0))),wy0=Math.max(0,Math.floor(s2wy(0))),wx1=Math.min(W,Math.ceil(s2wx(VW))),wy1=Math.min(H,Math.ceil(s2wy(VH)));
  if(wx1>wx0&&wy1>wy0){
    const c0=Math.floor(wx0/CH),c1=Math.floor((wx1-1)/CH),r0=Math.floor(wy0/CH),r1=Math.floor((wy1-1)/CH);
    chunkBudget=3;CHUNK_MAX=Math.max(40,(c1-c0+1)*(r1-r0+1)+8);g.imageSmoothingEnabled=true;
    for(let cy=r0;cy<=r1;cy++)for(let cx=c0;cx<=c1;cx++){const c=chunkCv(cx,cy),sx=w2sx(cx*CH),sy=w2sy(cy*CH),sz=CH*z+.6;if(c)g.drawImage(c,sx,sy,sz,sz);else{g.fillStyle=BI().base;g.fillRect(sx,sy,sz,sz)}}
  }
  {const L=mapLim(),lo=192-L,sz=2*L*z;g.fillStyle=BI().fog;g.beginPath();g.rect(0,0,VW,VH);g.rect(w2sx(lo),w2sy(lo),sz,sz);g.fill('evenodd');
   g.save();g.setLineDash([8,6]);g.strokeStyle='rgba(127,240,208,.4)';g.lineWidth=1.5;g.strokeRect(w2sx(lo),w2sy(lo),sz,sz);g.restore()}
  GL=[];
  const bx0=wx0-3,bx1=wx1+1,by0=wy0-3,by1=wy1+1,belts=[],mach=[];
  const bpb=[];for(const b of S.bs.values()){if(b.x+b.w<bx0||b.x>bx1||b.y+b.w<by0||b.y>by1)continue;(b.t==='belt'?(b.bp?bpb:belts):mach).push([b,w2sx(b.x),w2sy(b.y)])}
  drawBeltLayer(g,belts,z,S.time);
  if(bpb.length){g.globalAlpha=.38;drawBeltLayer(g,bpb,z,0);g.globalAlpha=1;const pth=new Path2D();for(const [b,x,y] of bpb)beltPath(pth,b,x,y,z);g.save();g.setLineDash([3,4]);g.lineDashOffset=-S.time*10;g.strokeStyle='rgba(127,240,208,.8)';g.lineWidth=1.3;g.stroke(pth);g.restore()}
  const is=z*.44;
  for(const [b] of belts)for(const it of b.items){const [px,py]=itemPos(b,it);g.drawImage(SPR[it.t],w2sx(px)-is/2,w2sy(py)-is/2,is,is);if(it.t==='petal')glow(px,py,.6,'#f3c25a',.4)}
  for(const [b,x,y] of mach){
    if(!b.bp){if(b.active)AUvis++;drawMachine(g,b,x,y,z);
      if(bneck){const st=badOf(b);if(st&&st===b.bk)b.bkT=(b.bkT||0)+rdt;else{b.bk=st;b.bkT=0}if(st&&b.bkT>1.5){const col=st==='block'?'255,115,120':'242,165,74',a=.55+.25*Math.sin(S.time*3);g.strokeStyle=`rgba(${col},${a})`;g.lineWidth=Math.max(1.5,z*.06);rr(g,x+z*.05,y+z*.05,b.w*z-z*.1,b.w*z-z*.1,z*.18);g.stroke();g.fillStyle=`rgb(${col})`;g.beginPath();g.arc(x+b.w*z-z*.16,y+z*.16,Math.max(2.5,z*.08),0,7);g.fill()}}
      continue}
    const sv=GL;GL=[];g.globalAlpha=.36;drawMachine(g,b,x,y,z);g.globalAlpha=1;
    if(b.mat!=null){const W2=b.w*z,hh=W2*b.mat,ly=y+W2-hh;g.save();g.beginPath();g.rect(x-2,ly,W2+4,hh+2);g.clip();drawMachine(g,b,x,y,z);g.restore();
      g.save();g.globalCompositeOperation='lighter';const gr=g.createLinearGradient(0,ly-z*.35,0,ly+z*.12);gr.addColorStop(0,'rgba(127,240,208,0)');gr.addColorStop(.75,'rgba(127,240,208,.55)');gr.addColorStop(1,'rgba(220,255,245,.9)');g.fillStyle=gr;g.fillRect(x,ly-z*.35,W2,z*.47);g.restore();
      if(Math.random()<.5)PARTS.push({k:'spark',x:b.x+Math.random()*b.w,y:b.y+b.w*(1-b.mat),vx:(Math.random()-.5)*.6,vy:-Math.random()*1.2,life:.4,max:.4,c:'#7ff0d0'});GL=sv;continue}
    GL=sv;
    g.save();g.setLineDash([4,4]);g.lineDashOffset=-S.time*10;g.strokeStyle='rgba(127,240,208,.85)';g.lineWidth=1.5;g.strokeRect(x+2,y+2,b.w*z-4,b.w*z-4);g.restore();
  }
  const night=1-PW.day;
  if(night>0){g.fillStyle=`rgba(14,12,40,${.3*night})`;g.fillRect(0,0,VW,VH)}
  g.globalCompositeOperation='lighter';
  const gm=.55+.6*night;
  for(const [x,y,r,col,a] of GL){const R=r*z;g.globalAlpha=Math.min(1,a*gm);g.drawImage(glowSpr(col),w2sx(x)-R,w2sy(y)-R,R*2,R*2)}
  g.globalAlpha=1;
  // Halo reflections: petals in orbit throw drifting mirror-ball light across the moon
  const np=Math.min(220,Math.floor(S.petals*1.6));
  if(np){const L=mapLim(),amp=.13+.17*night+Math.min(.1,S.petals/2000),fr=v=>{const q=Math.sin(v)*43758.5453;return q-Math.floor(q)};
    for(let i=0;i<np;i++){const h1=fr(i*12.9898+1),h2=fr(i*78.233+2),h3=fr(i*37.719+3),rad=5+h1*L*1.15,a=h2*6.283+S.time*.03,x=CX+Math.cos(a)*rad,y=CY+Math.sin(a)*rad*.92,sx=w2sx(x),sy=w2sy(y),RR=z*(1.1+h3*2.4);
      if(sx<-RR||sy<-RR||sx>VW+RR||sy>VH+RR)continue;g.globalAlpha=amp*(.55+.45*Math.sin(S.time*1.6+i*2.1));g.drawImage(glowSpr(DISCO[i%5]),sx-RR,sy-RR,RR*2,RR*2)}
    g.globalAlpha=1}
  for(const p of S.pulses){
    g.lineCap='round';g.lineJoin='round';
    g.beginPath();p.pts.forEach((q,i)=>i?g.lineTo(w2sx(q[0]),w2sy(q[1])):g.moveTo(w2sx(q[0]),w2sy(q[1])));g.strokeStyle='rgba(127,240,208,.10)';g.lineWidth=Math.max(1,z*.06);g.stroke();
    const T=5,a0=Math.max(0,p.d-T),h=ptAt(p,p.d);g.beginPath();let st=false;
    for(let i=0;i<p.pts.length;i++){if(p.cum[i]<a0||p.cum[i]>p.d)continue;const q=p.pts[i];if(!st){const s0=ptAt(p,a0);g.moveTo(w2sx(s0[0]),w2sy(s0[1]));st=true}g.lineTo(w2sx(q[0]),w2sy(q[1]))}
    if(st){g.lineTo(w2sx(h[0]),w2sy(h[1]));g.strokeStyle='rgba(127,240,208,.6)';g.lineWidth=Math.max(2,z*.13);g.stroke()}
    const R=z*1.1;g.drawImage(glowSpr('#7ff0d0'),w2sx(h[0])-R,w2sy(h[1])-R,R*2,R*2);
    if(Math.random()<.5)PARTS.push({k:'spark',x:h[0],y:h[1],vx:(Math.random()-.5)*.8,vy:(Math.random()-.5)*.8,life:.5,max:.5,c:'#7ff0d0'});
  }
  for(let i=PARTS.length-1;i>=0;i--){
    const p=PARTS[i];p.life-=rdt;if(p.life<=0){PARTS.splice(i,1);continue}
    if(p.k==='petal'){p.vy-=rdt*5;p.x+=p.vx*rdt;p.y+=p.vy*rdt;if(Math.random()<.7)PARTS.push({k:'spark',x:p.x,y:p.y+.2,vx:(Math.random()-.5)*.6,vy:Math.random()*.6,life:.7,max:.7,c:'#f3c25a'});
      const a=Math.min(1,p.life/p.max*2);g.globalAlpha=a;const R=z*1.4;g.drawImage(glowSpr('#f3c25a'),w2sx(p.x)-R,w2sy(p.y)-R,R*2,R*2);g.globalAlpha=1;g.globalCompositeOperation='source-over';const q=z*.6;g.drawImage(SPR.petal,w2sx(p.x)-q/2,w2sy(p.y)-q/2,q,q);g.globalCompositeOperation='lighter'}
    else{p.x+=p.vx*rdt;p.y+=p.vy*rdt;g.globalAlpha=p.life/p.max;const R=z*.18;g.drawImage(glowSpr(p.c),w2sx(p.x)-R,w2sy(p.y)-R,R*2,R*2)}
  }
  g.globalAlpha=1;g.globalCompositeOperation='source-over';
  drawOverlays(g,z);
  drawSeeds(g,z);drawBats(g);
  // ghost (mouse hover)
  if(hover&&B[tool]&&tool!=='core'){
    const w=B[tool].w||1,gx=hover[0]-Math.floor((w-1)/2),gy=hover[1]-Math.floor((w-1)/2);
    const fake=Object.assign({t:tool,x:gx,y:gy,d:rot,w},init(tool),{ore:oreAt(gx,gy)||'ferrite',vin:opp(rot),heat:0});
    g.globalAlpha=.55;if(tool==='belt')drawBeltLayer(g,[[fake,w2sx(gx),w2sy(gy)]],z,0);else{const sv=GL;GL=[];drawMachine(g,fake,w2sx(gx),w2sy(gy),z);GL=sv}g.globalAlpha=1;
    let ok=true;for(let j=0;j<w;j++)for(let i=0;i<w;i++){const xx=gx+i,yy=gy+j;if(xx<0||yy<0||xx>=W||yy>=H||at(xx,yy))ok=false}
    if(SEEDT)for(let j=0;j<w;j++)for(let i=0;i<w;i++){const xx=gx+i,yy=gy+j;if(xx>=0&&yy>=0&&xx<W&&yy<H&&SEEDT[yy*W+xx])ok=false}
    if(B[tool].r){if(!drillType(gx,gy,drillR(tool),B[tool].w))ok=false;reachRect(g,gx,gy,drillR(tool),B[tool].w)}
    g.strokeStyle=ok?'rgba(243,194,90,.9)':'rgba(255,115,120,.9)';g.lineWidth=2;g.strokeRect(w2sx(gx)+1,w2sy(gy)+1,w*z-2,w*z-2);
  }
  if(sel&&S.bs.has(sel.id)){g.strokeStyle='#f3c25a';g.lineWidth=2;g.setLineDash([6,4]);g.lineDashOffset=-S.time*12;rr(g,w2sx(sel.x)-2,w2sy(sel.y)-2,sel.w*z+4,sel.w*z+4,z*.2);g.stroke();g.setLineDash([]);if(B[sel.t].r)reachRect(g,sel.x,sel.y,drillR(sel.t),sel.w)}
  if(tapFx){tapFx.t-=rdt;if(tapFx.t<=0)tapFx=null;else{g.strokeStyle=tapFx.c;g.globalAlpha=tapFx.t/.4;g.lineWidth=2;const k=(1-tapFx.t/.4)*z*.25;g.strokeRect(w2sx(tapFx.x)-k,w2sy(tapFx.y)-k,z+2*k,z+2*k);g.globalAlpha=1}}
}
function burst(x,y,c,n){for(let i=0;i<n;i++){const a=Math.random()*6.283,v=1+Math.random()*3;PARTS.push({k:'spark',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.9+Math.random()*.6,max:1.5,c})}}

// ================= orrery =================
const orC=$('#orrery'),orG=orC.getContext('2d');
function msFrac(){const m=MS[S.ms];if(!m)return Math.min(1,S.gavg/rung(S.gt).kw);let a=0,t=0;for(const k in m.req){a+=Math.min(S.prog[k]||0,m.req[k]);t+=m.req[k]}return t?a/t:0}
function drawOrrery(){
  const g=orG,s=orC.width,m=s/2;g.clearRect(0,0,s,s);
  g.lineCap='round';
  g.beginPath();g.arc(m,m,s*.43,0,7);g.strokeStyle='rgba(255,255,255,.08)';g.lineWidth=s*.04;g.stroke();
  const f=msFrac();if(f>0){g.beginPath();g.arc(m,m,s*.43,-1.5708,-1.5708+6.283*f);g.strokeStyle=S.ms>=MS.length?'#72e3b2':'#f3c25a';g.stroke()}
  g.beginPath();g.arc(m,m,s*.3,0,7);g.strokeStyle='rgba(243,194,90,.22)';g.lineWidth=s*.012;g.stroke();
  const n=Math.min(S.petals,PET_GOAL*3);
  for(let i=0;i<n;i++){const ring=Math.floor(i/PET_GOAL),k=i%PET_GOAL,a=k/PET_GOAL*6.283+S.time*.04*(ring%2?-1:1),r=s*(.3+ring*.035);g.beginPath();g.arc(m+Math.cos(a)*r,m+Math.sin(a)*r,s*.018,0,7);g.fillStyle='#ffd77a';g.fill()}
  const gr=g.createRadialGradient(m,m,0,m,m,s*.17);gr.addColorStop(0,'#fff8e2');gr.addColorStop(.35,'#f3c25a');gr.addColorStop(1,'rgba(243,150,60,0)');g.fillStyle=gr;g.beginPath();g.arc(m,m,s*.17,0,7);g.fill();
  g.beginPath();g.arc(m,m,s*.2,0,7);g.strokeStyle='rgba(180,170,255,.18)';g.setLineDash([2,3]);g.lineWidth=1;g.stroke();g.setLineDash([]);
  const pa=dayPhase()*6.283+Math.PI,px=m+Math.cos(pa)*s*.2,py=m+Math.sin(pa)*s*.2;
  g.beginPath();g.arc(px,py,s*.045,0,7);g.fillStyle='#3d3768';g.fill();
  g.beginPath();g.arc(px,py,s*.045,pa+Math.PI/2,pa+Math.PI*1.5);g.fillStyle='#cfc7ff';g.fill();
}

// ================= UI =================
const elTools=$('#tools'),elTip=$('#tip'),elRot=$('#rotBtn'),elSheet=$('#sheet'),elModal=$('#modal'),elCard=$('#card'),elToast=$('#toast'),elBanner=$('#banner');
const SVG={
  inspect:'<svg class="ic" viewBox="0 0 36 36" fill="none" stroke="#c9c2ef" stroke-width="2.4" stroke-linecap="round"><circle cx="16" cy="16" r="8"/><path d="M22 22l7 7"/><path d="M16 12v8M12 16h8" stroke="#f3c25a" stroke-width="2"/></svg>',
  remove:'<svg class="ic" viewBox="0 0 36 36" fill="none" stroke="#ff7378" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11h18M15 11V8h6v3M11 11l1.5 17h11L25 11"/><path d="M16 16v8M20 16v8" stroke-width="2"/></svg>',
  lock:'<svg class="lock" viewBox="0 0 12 12" fill="currentColor"><path d="M3 5V3.5a3 3 0 0 1 6 0V5h.5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-5A.5.5 0 0 1 2.5 5zm1.5 0h3V3.5a1.5 1.5 0 0 0-3 0z"/></svg>',
  x:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>',
  rot:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 8A6 6 0 1 0 16 12"/><path d="M16 3.5V8h-4.5"/></svg>',
  trash:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h12M8 6V4h4v2M6 6l1 11h6l1-11"/></svg>'
};
SVG.select='<svg class="ic" viewBox="0 0 36 36" fill="none" stroke="#7ff0d0" stroke-width="2.2"><rect x="7" y="8" width="22" height="20" rx="3" stroke-dasharray="4 3"/><path d="M22 22l7 7" stroke-linecap="round"/></svg>';
SVG.blueprints='<svg class="ic" viewBox="0 0 36 36" fill="none" stroke="#9fd8ff" stroke-width="2"><rect x="10" y="7" width="18" height="22" rx="2"/><path d="M7 11v19a2 2 0 0 0 2 2h14"/><path d="M14 13h10M14 18h10M14 23h6" stroke-linecap="round"/></svg>';
const isUnl=t=>t==='inspect'||t==='remove'||t==='select'||t==='blueprints'||t==='paste'||(S.unl.includes(t)&&!banned(t));
const toolName=t=>({inspect:'Inspect',remove:'Remove',select:'Select',blueprints:'Blueprints',paste:'Paste'})[t]||B[t].n;
function buildDock(){
  elTools.innerHTML=TOOLS.map(t=>{
    const lk=!isUnl(t),ic=SVG[t]||`<img src="${ICON_B[t]}" alt="">`;
    return `<button class="tool${tool===t?' on':''}${lk?' locked':''}${S.newT.includes(t)?' new':''}" id="tool-${t}" data-t="${t}" aria-pressed="${tool===t}">${ic}<span>${toolName(t)}</span>${lk?SVG.lock:''}</button>`;
  }).join('');
  setTimeout(toolArrows,0);
}
elTools.addEventListener('click',e=>{if(toolDrag.moved){toolDrag.moved=false;return}const bt=e.target.closest('.tool');if(bt)setTool(bt.dataset.t)});
// Desktop: mouse wheel and click-and-drag scroll the building bar sideways; arrow buttons appear when it overflows
const toolDrag={on:false,x:0,sl:0,moved:false};
elTools.addEventListener('wheel',e=>{const d=Math.abs(e.deltaY)>Math.abs(e.deltaX)?e.deltaY:e.deltaX;if(!d||elTools.scrollWidth<=elTools.clientWidth)return;e.preventDefault();elTools.scrollLeft+=d*(e.deltaMode===1?32:1);toolArrows()},{passive:false});
elTools.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;toolDrag.on=true;toolDrag.x=e.clientX;toolDrag.sl=elTools.scrollLeft;toolDrag.moved=false});
window.addEventListener('pointermove',e=>{if(!toolDrag.on)return;const dx=e.clientX-toolDrag.x;if(!toolDrag.moved&&Math.abs(dx)>6){toolDrag.moved=true;elTools.classList.add('dragging')}if(toolDrag.moved){elTools.scrollLeft=toolDrag.sl-dx;toolArrows()}});
window.addEventListener('pointerup',()=>{if(!toolDrag.on)return;toolDrag.on=false;elTools.classList.remove('dragging');if(toolDrag.moved)setTimeout(()=>{toolDrag.moved=false},0)});
function toolArrows(){const mx=elTools.scrollWidth-elTools.clientWidth;$('#toolsL').hidden=elTools.scrollLeft<=4;$('#toolsR').hidden=mx<=4||elTools.scrollLeft>=mx-4}
elTools.addEventListener('scroll',toolArrows);window.addEventListener('resize',toolArrows);
$('#toolsL').onclick=()=>{elTools.scrollBy({left:-elTools.clientWidth*.7,behavior:'smooth'})};
$('#toolsR').onclick=()=>{elTools.scrollBy({left:elTools.clientWidth*.7,behavior:'smooth'})};
let tipOverride='',tipUntil=0;
function setTool(t){
  if(t==='blueprints'){showBlueprints();return}
  ROUTE=null;
  if(banned(t)){showToast(`${B[t].n} can’t be used ${chal()?'in this challenge':'on this moon'}`);return}
  if(!isUnl(t)){const i=MS.findIndex(m=>m.unl.includes(t));if(i>=0)showToast(`${B[t].n} unlocks with ${MS[i].n}`);else{const tk=Object.keys(TECH).find(k=>(TECH[k].unl||[]).includes(t));showToast(tk?`${B[t].n} comes from research: ${TECH[tk].n}`:`${B[t].n} is still locked`)}return}
  tool=(tool===t&&t!=='inspect')?'inspect':t;sfx('tick');
  const k=S.newT.indexOf(t);if(k>=0)S.newT.splice(k,1);
  if(tool!=='inspect')closeSheet();
  buildDock();updateRot();
  if(tool==='belt'){tipOverride=`<b>${BELT_MODES[beltMode].n}.</b> ${BELT_MODES[beltMode].d}`;tipUntil=performance.now()+5000}
  else if(B[tool]){tipOverride=toolTip(tool);tipUntil=performance.now()+7000}
  else if(tool==='select'){tipOverride='Drag a box around buildings to copy them, save a blueprint, remove them, or set one recipe on all of them.';tipUntil=performance.now()+6000}
  else if(tool==='remove'){tipOverride='Tap or drag across buildings to remove them. You get the full cost back.';tipUntil=performance.now()+4000}
  else{tipOverride='';tipUntil=0}
  hudTick(true);
}
function updateRot(){
  const show=!!(B[tool]&&B[tool].dir);elRot.hidden=!show;
  const bm=$('#beltModeBtn');bm.hidden=tool!=='belt';bm.textContent=BELT_MODES[beltMode].n;updatePasteBar();
  elRot.querySelector('svg').style.transform=`rotate(${rot*90}deg)`;
}
let rotTurns=1;
$('#beltModeBtn').addEventListener('click',()=>{const ks=Object.keys(BELT_MODES);beltMode=ks[(ks.indexOf(beltMode)+1)%ks.length];try{localStorage.setItem('halo-foundry-beltmode',beltMode)}catch(_){}ROUTE=null;updateRot();sfx('tick');tipOverride=`<b>${BELT_MODES[beltMode].n}.</b> ${BELT_MODES[beltMode].d}`;tipUntil=performance.now()+5000;hudTick(true)});
elRot.addEventListener('click',()=>{rot=(rot+1)&3;rotTurns++;elRot.querySelector('svg').style.transform=`rotate(${rotTurns*90}deg)`});
function syncRot(d){rot=d;rotTurns=rotTurns-((rotTurns%4+4)%4)+d;elRot.querySelector('svg').style.transform=`rotate(${rotTurns*90}deg)`}

let toastT=0;
function showToast(m){elToast.textContent=m;elToast.classList.remove('hide');clearTimeout(toastT);toastT=setTimeout(()=>elToast.classList.add('hide'),2200)}
let banT=0;
function showBanner(h,p){if(elBanner.dataset.reload)return;elBanner.innerHTML=`<h3></h3><p></p>`;elBanner.querySelector('h3').textContent=h;elBanner.querySelector('p').textContent=p;elBanner.hidden=false;clearTimeout(banT);banT=setTimeout(()=>elBanner.hidden=true,5200)}
elBanner.addEventListener('click',()=>{if(elBanner.dataset.reload){save();location.reload();return}elBanner.hidden=true});

function chip(t,n,cls){return `<span class="${cls||'chip'}"><img src="${ICON[t]}" alt="${ITEMS[t].n}" title="${ITEMS[t].n}">${n}</span>`}
let invSig='',hudN=0;
function tipText(){
  if(performance.now()<tipUntil)return tipOverride;
  if(S.ms>0)return '';
  const c=S.cnt;
  if(!c.drill)return 'Ore lies a short trip from the Core. Drag to look around, pick <b>Drill</b>, and tap orange ferrite. It mines the 3×3 around it.';
  if(!c.smelter)return 'Put a <b>Smelter</b> right where the drill points. Use the round button to aim before you tap.';
  if(!S.flags.del)return 'Pick <b>Conveyor</b> and drag from the smelter into the Core. Dragging over another conveyor builds a Crossing.';
  return 'Now do the same with teal cuprite. The Core needs 40 of each ingot.';
}
function hudTick(force){
  // goal
  const m=MS[S.ms];
  if(m){
    $('#goalEyebrow').textContent=S.ms<TUT?`Tutorial ${S.ms+1}/${TUT}`:`Milestone ${S.ms-TUT+1}/${MS.length-TUT}`;$('#goalName').textContent=m.n;
    $('#goalReqs').innerHTML=Object.keys(m.req).map(k=>{const h=Math.min(S.prog[k]||0,m.req[k]);return `<span class="req${h>=m.req[k]?' done':''}"><img src="${ICON[k]}" alt="${ITEMS[k].n}">${h}/${m.req[k]}<i style="width:${h/m.req[k]*100}%"></i></span>`}).join('');
  }else{
    const cur=S.res.cur;
    $('#goalEyebrow').textContent=cur?'Researching':'Research';$('#goalName').textContent=cur?techName(cur):'Tap to choose';
    $('#goalReqs').classList.toggle('rs',S.ms>=MS.length);$('#goalReqs').innerHTML=cur?techHudChips(cur):'<span class="req">Pick what to research next</span>';
  }
  runTick();{const L=runLabel();if(L)$('#goalEyebrow').textContent=L}
  if(!S.flags.ascHint&&canAscend()){S.flags.ascHint=1;showBanner('Ascension unlocked','You have Aether in storage. Open Menu → Ascension to start a new moon and earn Starseeds.');save()}
  if(S.bs&&coreWant()>3){const c=coreB();if(c&&c.w<coreWant())growCore()}
  // grid and furnace ladder markers
  const lb=$('#ladBox'),lo=S.ms>=MS.length;if(lb.hidden===lo)lb.hidden=!lo;
  if(lo){const g=rung(S.gt),fr=frung(S.ft||0);
    $('#ladGt').textContent='Grid '+(S.gt+1);$('#ladGb').style.width=Math.min(100,S.gavg/g.kw*100)+'%';
    $('#ladFt').textContent='Furnace '+((S.ft||0)+1);$('#ladFb').style.width=Math.min(100,(S.favg||0)/fr.kw*100)+'%';
    lb.title=`Grid tier ${S.gt+1}: ${fmtW(S.gavg)} / ${fmtW(g.kw)} solar · Furnace tier ${(S.ft||0)+1}: ${fmtW(S.favg||0)} / ${fmtW(fr.kw)} from burners`}
  // power
  const sh=PW.sat<.999;$('#powerBox').classList.toggle('short',sh);
  $('#pwText').textContent=`${fmtW(PW.demand)} / ${fmtW(PW.cap)}`;
  $('#pwBar').style.width=Math.min(100,PW.cap?PW.demand/PW.cap*100:0)+'%';
  const dl=PW.day;$('#pwDay').textContent=dl>=.99?'Day':dl<=.01?'Night':(Math.sin(dayPhase()*6.283)>0?'Day ':'Dusk ')+Math.round(dl*100)+'%';
  $('#pwSat').textContent=sh?Math.round(PW.sat*100)+'% speed':S.ms>=MS.length?fmtW(S.gavg)+' solar avg':'';
  // inventory
  const keys=ITEM_ORDER.filter(k=>(S.inv[k]||0)>0),sig=keys.map(k=>k+S.inv[k]).join();
  if(sig!==invSig||force){invSig=sig;$('#inv').innerHTML=keys.length?keys.map(k=>chip(k,S.inv[k])).join(''):'<span class="empty">Storage is empty</span>'}
  // tip
  const tx=tool==='paste'?'':tipText();if(tx){if(elTip.innerHTML!==tx)elTip.innerHTML=tx;elTip.hidden=false}else elTip.hidden=true;
  refreshSheet();
  if(STATS_OPEN&&!elModal.hidden&&(hudN=(hudN+1)%4)===0)updateStats();
  if(RES_OPEN&&!elModal.hidden&&(resN=(resN+1)%4)===0)updateResearch();
}

// ---------- inspector ----------
function status(b){
  if(b.bp)return['warn','Blueprint · '+pulseInfo(b)];
  const lp=PW.sat<.999,pct=Math.round(PW.sat*100)+'%';
  switch(b.t){
    case 'belt':return['ok',(b.rate||0)>.05?`Moving ${(b.rate||0).toFixed(1)} items/s of ${(BV/SP).toFixed(1)} max`:b.items.length?`Holding ${b.items.length}, not moving`:'Empty'];
    case 'drill':case 'deepdrill':return !b.dep&&!drillHasOut(b)?['warn','Nothing to output into']:b.wait?['warn','Waiting for ore to regrow']:b.dep?['bad','Ore in reach used up']:b.out>=drillCap(b)?['warn','Output blocked']:lp?['warn','Low power · '+pct]:['ok','Mining '+ITEMS[b.ore].s];
    case 'junction':{const n=b.lanes[0].length+b.lanes[1].length;return['ok',n?`Carrying ${n}`:'Empty']}
    case 'smelter':case 'foundry':return b.run?(lp?['warn','Low power · '+pct]:['ok','Smelting']):b.outN>=4?['warn','Output blocked']:['warn','Waiting for ore'];
    case 'refinery':return b.run?(lp?['warn','Low power · '+pct]:['ok','Fusing Aether']):b.outN>=2?['warn','Output blocked']:['warn',`Collecting ore · ${b.n.toLocaleString()} / ${refRatio().toLocaleString()}`];
    case 'reactor':return b.load>.01?['ok',`Running · ${fmtW(b.load*10000)}`]:(b.fuel||b.energy>0)?['ok','Standing by']:['bad','Needs Aether'];
    case 'fab':case 'fab2':case 'assembler':{if(!b.rec)return['bad','Pick a recipe'];const r=RECIPES[b.rec];return b.run?(lp?['warn','Low power · '+pct]:['ok','Assembling']):b.outN+r.out>Math.max(4,r.out*2)?['warn','Output blocked']:['warn','Waiting for inputs']}
    case 'batcher':{const ks=Object.keys(b.ratio);if(!ks.length)return['warn','No ratio set · passing items through'];if(b.q&&(b.q[0].length||b.q[1].length))return['ok',b.q[0].length&&b.q[1].length?'Sending on both outputs':'Sending a batch'];const need=ks.filter(k=>(b.st[k]||0)<b.ratio[k]).map(k=>ITEMS[k].s);return['warn','Waiting for '+need.join(', ')]}
    case 'splitter':case 'sorter':return b.hold?['warn','Waiting for room']:['ok','Ready'];
    case 'combustor':return b.load>.01?['ok',`Burning · ${Math.round(b.load*150)} kW`]:(b.fuel||b.energy>0)?['ok','Standing by']:['bad','Needs carbon'];
    case 'turbine':return b.load>.01?['ok',`Burning · ${fmtW(b.load*1200)}`]:(b.fuel||b.energy>0)?['ok','Standing by']:['bad','Needs carbon'];
    case 'filmarray':return['ok',`Making ${Math.round(300*(.4+.6*PW.day))} kW`];
    case 'capacitor':return['ok',`${Math.floor(S.charge||0).toLocaleString()} of ${chargeCap().toLocaleString()} MJ stored in all banks`];
    case 'collector':return['ok',`Making ${Math.round(400*(.25+.75*PW.day))} kW`];
    case 'relay':return['ok','Pulse origin'];
    case 'solar':return PW.day>0?['ok',`Making ${Math.round(45*PW.day)} kW`]:['warn','Night'];
    case 'uplink':return b.q.length?(lp?['warn','Low power · '+pct]:['ok','Sending']):['ok','Idle'];
    case 'ring':return b.n?(lp?['warn','Low power · '+pct]:['ok','Launching']):['warn','Waiting for petals'];
    case 'core':return['ok','Online · '+fmtW(coreKW())];
  }
  return['ok',''];
}
function bufRow(b){
  const cnt=a=>{const o={};a.forEach(t=>o[t]=(o[t]||0)+1);return Object.keys(o).map(k=>chip(k,o[k])).join('')};
  switch(b.t){
    case 'junction':{const a=[...b.lanes[0],...b.lanes[1]].map(i=>i.t);return a.length?`<div class="flow">${cnt(a)}</div>`:''}
    case 'drill':case 'deepdrill':return `<div class="flow"><span class="lbl">Out</span>${chip(b.ore,b.out)}<span class="lbl">· ${reachLeft(b).toLocaleString()} ${ITEMS[b.ore].s} left in reach · ${(ORE_P[b.ore].rate*drillMult(b)).toFixed(2)}/s</span></div><div class="flow"><span class="lbl">${b.dep?'This drill has run dry':`Runs dry in about ${fmtDur(reachLeft(b)/(ORE_P[b.ore].rate*drillMult(b)*gridMul()))} at full speed`}</span></div><div class="prog"><b style="width:${b.prog*100}%"></b></div>`;
    case 'smelter':case 'foundry':return `<div class="flow"><span class="lbl">In</span>${b.inT?chip(b.inT,b.inN):'<span class="lbl">empty</span>'}<span class="arrow">→</span><span class="lbl">Out</span>${b.outT?chip(b.outT,b.outN):'<span class="lbl">empty</span>'}</div><div class="prog"><b style="width:${b.run?b.prog*100:0}%"></b></div>`;
    case 'refinery':return `<div class="flow"><span class="lbl">Ore</span>${b.n.toLocaleString()} / ${refRatio().toLocaleString()}<span class="arrow">→</span>${chip('aether',b.outN)}<span class="lbl">· ${S.refined||0} made so far</span></div><div class="prog"><b style="width:${Math.min(100,b.n/refRatio()*100)}%"></b></div>`;
    case 'reactor':return `<div class="flow"><span class="lbl">Fuel</span>${chip('aether',b.fuel+'/4')}</div>`;
    case 'fab':case 'fab2':case 'assembler':{if(!b.rec)return '';const r=RECIPES[b.rec];return `<div class="flow"><span class="lbl">In</span>${Object.keys(r.in).map(k=>chip(k,(b.buf[k]||0)+'/'+r.in[k])).join('')}<span class="arrow">→</span>${chip(b.rec,b.outN)}<span class="lbl">${r.t}s</span></div><div class="prog"><b style="width:${b.run?b.prog*100:0}%"></b></div>`}
    case 'batcher':{const ks=Object.keys(b.st).filter(k=>b.st[k]>0);return ks.length?`<div class="flow"><span class="lbl">Stored</span>${ks.map(k=>chip(k,b.st[k]+'/50')).join('')}</div>`:'<div class="flow"><span class="lbl">Empty</span></div>'}
    case 'splitter':case 'sorter':return b.hold?`<div class="flow"><span class="lbl">Holding</span>${chip(b.hold,1)}</div>`:'';
    case 'turbine':return `<div class="flow"><span class="lbl">Fuel</span>${chip('carbon',b.fuel+'/20')}</div>`;
    case 'combustor':return `<div class="flow"><span class="lbl">Fuel</span>${chip('carbon',b.fuel+'/8')}<span class="lbl">Byproduct</span>${chip('ember',b.ember+'/5')}</div>`;
    case 'uplink':return `<div class="flow"><span class="lbl">${uplinkRate(b).toFixed(2)} items/s · ${uplinkPw(b)} kW · ${Math.round(coreDist(b))} tiles from Core</span></div>`+(b.q.length?`<div class="flow"><span class="lbl">Queue</span>${cnt(b.q)}</div>`:'');
    case 'ring':return `<div class="flow"><span class="lbl">Loaded</span>${chip('petal',b.n+'/4')}<span class="lbl">· ${S.petals} launched</span></div><div class="prog"><b style="width:${b.prog*100}%"></b></div>`;
    case 'belt':return b.items.length?`<div class="flow">${cnt(b.items.map(i=>i.t))}</div>`:'';
  }
  return '';
}
function openSheet(b){sel=b;renderSheet();elSheet.hidden=false}
function closeSheet(){sel=null;SELB=null;elSheet.hidden=true}
function renderSheet(){
  const b=sel,d=B[b.t];
  let ctrl='';
  if(b.t==='fab'||b.t==='fab2'||b.t==='assembler'){
    const recs=S.rec.filter(k=>(RECIPES[k].at==='asm')===(b.t==='assembler'));
    ctrl=`<div class="sec-label">Recipe</div>`+(recs.length?`<div class="grid">${recs.map(k=>{const r=RECIPES[k];return `<button class="opt${b.rec===k?' on':''}" data-rec="${k}"><img src="${ICON[k]}" alt=""><span class="t"><b>${ITEMS[k].n}${r.out>1?' ×'+r.out:''}</b><small>${Object.keys(r.in).map(i=>r.in[i]+' '+ITEMS[i].s).join(' + ')}</small></span></button>`}).join('')}</div>`:'<p class="desc">No recipes unlocked for this factory yet.</p>');
  }
  if(b.t==='batcher'){
    const items=[...new Set([...Object.keys(b.ratio),...Object.keys(b.st).filter(k=>b.st[k]>0)])];
    const recs=S.rec;
    ctrl=`<div class="sec-label">Copy a recipe ratio</div>`+(recs.length?`<div class="grid">${recs.map(k=>`<button class="opt sm" data-preset="${k}"><img src="${ICON[k]}" alt=""><span class="t"><b>${ITEMS[k].n}</b><small>${Object.keys(RECIPES[k].in).map(i=>RECIPES[k].in[i]+' '+ITEMS[i].s).join(' + ')}</small></span></button>`).join('')}</div>`:'<p class="desc">Recipes appear here as you unlock them.</p>')+
      `<div class="sec-label">Ratio per batch</div>`+(items.length?items.map(k=>`<div class="rrow"><img src="${ICON[k]}" alt=""><span class="nm">${ITEMS[k].n}</span><button class="stp" data-rq="${k}" data-dv="-1" aria-label="Less ${ITEMS[k].n}">−</button><b class="mono">${b.ratio[k]||0}</b><button class="stp" data-rq="${k}" data-dv="1" aria-label="More ${ITEMS[k].n}">+</button></div>`).join(''):'<p class="desc">Pick a recipe above, or feed items in and set counts here.</p>')+
      (Object.keys(b.ratio).length?`<button class="btn" data-act="clearratio">Clear ratio</button>`:'');
  }
  if(b.t==='splitter'){const opts=[[null,'Even'],[0,'Forward'],[1,'Left'],[2,'Right']];ctrl=`<div class="sec-label">Priority output</div><div class="seg">${opts.map(([v,n])=>`<button data-pri="${v==null?'':v}" class="${(b.pri==null?null:b.pri)===v?'on':''}">${n}</button>`).join('')}</div><p class="desc">The priority side gets every item it can take. The other sides only get the overflow when it backs up.</p>`}
  if(b.t==='sorter'){
    const so=[[0,'Forward'],[1,'Left'],[2,'Right']];
    ctrl=`<div class="sec-label">Chosen item leaves</div><div class="seg">${so.map(([v,n])=>`<button data-sd="${v}" class="${(b.sd||0)===v?'on':''}">${n}</button>`).join('')}</div><p class="desc">Everything else leaves through the other two sides, taking turns.</p><div class="sec-label">Chosen item</div><div class="grid items"><button class="opt${!b.filter?' on':''}" data-filter="" aria-label="Everything">All</button>${ITEM_ORDER.map(k=>`<button class="opt${b.filter===k?' on':''}" data-filter="${k}" aria-label="${ITEMS[k].n}"><img src="${ICON[k]}" alt=""></button>`).join('')}</div>`;
  }
  const acts=b.t==='core'?'':`<div class="actions">${d.dir?`<button class="btn" data-act="rot">${SVG.rot}Rotate</button>`:''}<button class="btn danger" data-act="del">${SVG.trash}Remove</button></div>`;
  elSheet.innerHTML=`<div class="sh-head"><img src="${ICON_B[b.t]}" alt=""><div class="sh-title"><h2>${d.n}</h2><span class="pill" id="shStatus"></span></div><button class="x" data-act="close" aria-label="Close">${SVG.x}</button></div>
  <div class="sh-body"><p class="desc">${d.d}${d.pw?` Uses ${d.pw} kW.`:''}</p><div id="shBuf" class="sh-body" style="margin:0;gap:8px"></div>${ctrl}${acts}</div>`;
  refreshSheet();
}
function refreshSheet(){
  if(!sel||elSheet.hidden)return;
  if(!S.bs.has(sel.id)){closeSheet();return}
  const [c,t]=status(sel),st=$('#shStatus');st.className='pill '+c;st.textContent=t;
  const bf=$('#shBuf'),h=bufRow(sel);if(bf.innerHTML!==h)bf.innerHTML=h;
}
elSheet.addEventListener('click',e=>{
  const el=e.target.closest('button');if(!el||!sel)return;const b=sel;
  if(el.dataset.act==='close')closeSheet();
  else if(el.dataset.act==='rot'){b.d=(b.d+1)&3;dirty=true}
  else if(el.dataset.act==='del'){removeB(b);sfx('remove');showToast(B[b.t].n+' removed, cost refunded')}
  else if(el.dataset.rec!==undefined){
    if(b.rec===el.dataset.rec)return;setRecipe(b,el.dataset.rec);renderSheet();
  }
  else if(el.dataset.preset){batUnq(b);b.ratio=Object.assign({},RECIPES[el.dataset.preset].in);for(const k in b.st)if(!b.ratio[k]&&b.st[k]>0){addInv(k,b.st[k]);b.st[k]=0}renderSheet();sfx('tick')}
  else if(el.dataset.rq){batUnq(b);const k=el.dataset.rq,v=Math.max(0,Math.min(20,(b.ratio[k]||0)+(+el.dataset.dv)));if(v)b.ratio[k]=v;else delete b.ratio[k];renderSheet();sfx('tick')}
  else if(el.dataset.act==='clearratio'){batUnq(b);b.ratio={};renderSheet();sfx('tick')}
  else if(el.dataset.sd!==undefined){b.sd=+el.dataset.sd||0;renderSheet();sfx('tick')}
  else if(el.dataset.pri!==undefined){b.pri=el.dataset.pri===''?null:+el.dataset.pri;renderSheet();sfx('tick')}
  else if(el.dataset.filter!==undefined){b.filter=el.dataset.filter||null;renderSheet()}
});

// ---------- modals ----------
function openModal(html){STATS_OPEN=false;RES_OPEN=false;elCard.innerHTML=html;elModal.hidden=false}
function closeModal(){STATS_OPEN=false;RES_OPEN=false;elModal.hidden=true}
elModal.addEventListener('click',e=>{if(e.target===elModal)closeModal()});
const HOWTO=`<ol class="howto">
<li><span>1</span><span>Pick a building in the bottom bar, then tap the ground. It goes down as a <strong>blueprint</strong> and the Core sends a pulse out to build it. In the tutorial, Conveyors and Crossings appear instantly. In the main game they need pulses too, and one pulse builds a whole dragged line.</span></li>
<li><span>2</span><span>Machines push items out of their <strong>bright edge</strong> and take items in from the other sides. Aim with the round arrow button before placing.</span></li>
<li><span>3</span><span>With <strong>Conveyor</strong> picked, drag one finger to lay a line. Dragging across another conveyor adds a <strong>Crossing</strong>.</span></li>
<li><span>4</span><span>Two fingers pan and pinch-zoom. With <strong>Inspect</strong> picked, one finger pans too.</span></li>
<li><span>5</span><span>Cuprite and ferrite mine fast but run dry. <strong>Carbon</strong> is slow and nearly endless, so claim the ground around it.</span></li>
<li><span>6</span><span>Belt items into the <strong>Core</strong>. They count toward the milestone first, then go to storage for building.</span></li>
<li><span>7</span><span>Over the power budget, everything slows down. Nights are dark for solar.</span></li>
<li><span>8</span><span>The first six milestones are the tutorial. After two more, you climb <strong>grid tiers</strong> by raising sustained power output.</span></li>
</ol>`;
function showWelcome(){
  openModal(`<span class="eyebrow">A moon, a star, a factory</span><h1>Halo Foundry</h1><p>Drill the moon, smelt and assemble, and belt it all into the Core. The tutorial ends with sail petals in orbit around the star. Then the real work begins: a power grid that keeps growing.</p>${HOWTO}<button class="btn primary" data-close>Start building</button>`);
}
function showHelp(){openModal(`<div class="card-head"><h3>How to play</h3><button class="x" data-close aria-label="Close">${SVG.x}</button></div>${HOWTO}<p>Desktop: drag to pan, wheel to zoom, R rotates, Esc returns to Inspect, right-drag always pans.</p>`)}
function msCard(m,i){
  const done=i<S.ms,cur=i===S.ms,cls=done?'done':cur?'cur':'future';
  const reqs=Object.keys(m.req).map(k=>{const h=done?m.req[k]:cur?Math.min(S.prog[k]||0,m.req[k]):0;return `<span class="req${h>=m.req[k]?' done':''}"><img src="${ICON[k]}" alt="${ITEMS[k].n}">${h}/${m.req[k]}<i style="width:${h/m.req[k]*100}%"></i></span>`}).join('');
  const un=[...m.unl.map(t=>B[t].n),...m.rec.map(r=>ITEMS[r].n)];
  return `<div class="ms ${cls}"><div class="ms-top"><h4>${i<TUT?i+1:i-TUT+1} · ${m.n}</h4><span class="st">${done?'Complete':cur?'In progress':'Locked'}</span></div><div class="ms-unl">${m.b}</div><div class="ms-req">${reqs}</div>${un.length?`<div class="ms-unl">Unlocks <b>${un.join(', ')}</b></div>`:''}</div>`;
}
function showMilestones(){
  const sec=t=>`<div class="sec-label">${t}</div>`;
  let h=`<div class="card-head"><h3>Progress</h3><button class="x" data-close aria-label="Close">${SVG.x}</button></div><div class="ms-list">`;
  MS.forEach((m,i)=>{if(i===0)h+=sec('Tutorial');if(i===TUT)h+=sec('Main game');h+=msCard(m,i)});
  h+=sec('Grid ladder · solar power');
  const top=Math.max(S.gt+3,RUNGS.length+1);
  for(let i=0;i<top;i++){
    const r=rung(i),done=i<S.gt,cur=i===S.gt&&S.ms>=MS.length,cls=done?'done':cur?'cur':'future',f=done?1:cur?Math.min(1,S.gavg/r.kw):0;
    h+=`<div class="ms ${cls}"><div class="ms-top"><h4>Tier ${i+1} · ${r.n}</h4><span class="st">${done?'Reached':cur?'In progress':'Locked'}</span></div><div class="ms-req"><span class="req${done?' done':''}">${BOLT}${cur?fmtW(S.gavg)+' / ':''}${fmtW(r.kw)} sustained<i style="width:${f*100}%"></i></span></div><div class="ms-unl">${r.d}</div></div>`;
  }
  h+=sec('Furnace ladder · coal and Aether');
  const ft=S.ft||0,ftop=ft+3;
  for(let i=0;i<ftop;i++){
    const r=frung(i),done=i<ft,cur=i===ft&&S.ms>=MS.length,cls=done?'done':cur?'cur':'future',f=done?1:cur?Math.min(1,(S.favg||0)/r.kw):0;
    h+=`<div class="ms ${cls}"><div class="ms-top"><h4>Furnace ${i+1} · ${r.n}</h4><span class="st">${done?'Reached':cur?'In progress':'Locked'}</span></div><div class="ms-req"><span class="req${done?' done':''}">${BOLT}${cur?fmtW(S.favg||0)+' / ':''}${fmtW(r.kw)} sustained<i style="width:${f*100}%"></i></span></div><div class="ms-unl">${r.d}</div></div>`;
  }
  h+=sec('Constellations · sail petals in orbit');
  const cn=constN(S.petals);
  for(let i=0;i<cn+3;i++){
    const q=constReq(i),done=i<cn,cur=i===cn,prev=i?constReq(i-1):0,f=done?1:cur?Math.max(0,Math.min(1,(S.petals-prev)/(q-prev))):0;
    h+=`<div class="ms ${done?'done':cur?'cur':'future'}"><div class="ms-top"><h4>Constellation ${roman(i+1)}</h4><span class="st">${done?'Complete':cur?'In progress':'Locked'}</span></div><div class="ms-req"><span class="req${done?' done':''}"><img src="${ICON.petal}" alt="Sail petal">${cur?S.petals+' / ':''}${q} petals<i style="width:${f*100}%"></i></span></div><div class="ms-unl">+1 Commander point.</div></div>`;
  }
  openModal(h+'</div>');
}
// ---------- what's new ----------
const SEEN_KEY='halo-foundry-seen';
function seenN(){try{return +localStorage.getItem(SEEN_KEY)||0}catch(_){return 0}}
function markSeen(){try{localStorage.setItem(SEEN_KEY,String(LATEST))}catch(_){}}
function showNews(since){
  const list=CHANGELOG.filter(c=>since==null||c.n>since);
  const fmtD=d=>new Date(d+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'});
  openModal(`<div class="card-head"><h3>What's new</h3><button class="x" data-close aria-label="Close">${SVG.x}</button></div><div class="ms-list">${list.map(c=>`<div class="ms ${c.n===LATEST?'cur':'done'}"><div class="ms-top"><h4>${c.title}</h4><span class="st">${fmtD(c.date)}</span></div><ul class="news">${c.items.map(i=>`<li>${i}</li>`).join('')}</ul></div>`).join('')}</div>${since!=null?'<div class="actions"><button class="btn" data-news>All updates</button><button class="btn primary" data-close>Back to the factory</button></div>':''}`);
  markSeen();
}
// While the game stays open, check now and then whether a newer version has been published.
let updAt=0,updShown=false;
function checkUpdate(){
  if(updShown||location.protocol!=='https:'||Date.now()-updAt<120000)return;updAt=Date.now();
  fetch('src/data/changelog.js',{cache:'no-store'}).then(r=>r.ok?r.text():'').then(t=>{
    const m=/n:(\d+)/.exec(t);if(!m||+m[1]<=LATEST)return;updShown=true;
    const hw=(()=>{const d=new Date();return (d.getMonth()===9&&d.getDate()>=15)||(d.getMonth()===10&&d.getDate()<=1)})();
    elBanner.innerHTML=hw?'<h3>🎃 Happy Halloween! Update ready</h3><p>A spooky new ground style is waiting. Tap here to load it. Your game is saved first.</p>':'<h3>Update ready</h3><p>Tap here to load the new version. Your game is saved first.</p>';elBanner.dataset.reload='1';elBanner.hidden=false;clearTimeout(banT);
  }).catch(()=>{});
}
setInterval(()=>{if(!document.hidden)checkUpdate()},600000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkUpdate()});
let resetArm=0;
function showMenu(){
  openModal(`<div class="card-head"><h3>Menu</h3><button class="x" data-close aria-label="Close">${SVG.x}</button></div>
  <div class="sec-label">Upgrades</div><div class="ms-list">${Object.keys(UPG).map(k=>{const u=UPG[k],L=S.up[k]||0,mx=u.max&&L>=u.max,c=mx?{}:u.cost(L),ok=!mx&&canAfford(c);
    return `<div class="ms cur"><div class="ms-top"><h4>${u.n} · level ${L}</h4><span class="st">${u.eff(L)}</span></div><div class="ms-unl">${u.d}</div><div class="actions" style="align-items:center"><div class="ms-req" style="flex:1">${Object.keys(c).map(i=>`<span class="req${(S.inv[i]||0)>=c[i]?' done':''}"><img src="${ICON[i]}" alt="${ITEMS[i].n}">${(S.inv[i]||0).toLocaleString()}/${c[i].toLocaleString()}</span>`).join('')}</div>${mx?'<span class="st">Maxed</span>':`<button class="btn${ok?' primary':''}" style="flex:none;padding:0 18px" data-up="${k}">Upgrade</button>`}</div></div>`}).join('')}</div>
  <div class="sec-label">Halo</div><p style="font-size:14px">Each sail petal gives <strong>${petalKW().toFixed(1)} kW</strong> before other bonuses: ×${haloMul().toFixed(2)} from ${upTotal()} upgrade level${upTotal()===1?'':'s'} (+1% each, compounding).</p>
  <div class="sec-label">Commander · ${cmdPts()} point${cmdPts()===1?'':'s'} to spend</div><p style="font-size:14px">Earn a point for every Constellation of sail petals in orbit. Next at ${constReq(constN(S.petals))} petals (${S.petals} now). Points and levels carry over when you Ascend.</p><div class="ms-list">${Object.keys(CMD).map(k=>{const u=CMD[k],L=cmdLv(k),mx=u.max&&L>=u.max,ct=cmdCost(k),ok=!mx&&cmdPts()>=ct;
    return `<div class="ms cur"><div class="ms-top"><h4>${u.n} · level ${L}</h4>${mx?'<span class="st">Maxed</span>':''}</div><div class="actions" style="align-items:center"><div class="ms-unl" style="flex:1">${u.d}</div>${mx?'':`<button class="btn${ok?' primary':''}" style="flex:none;padding:0 14px" data-cmd="${k}">+1 · ${ct} pt${ct===1?'':'s'}</button>`}</div></div>`}).join('')}</div>
  ${novaMenu()}
  ${ascMenu()}
  <div class="sec-label">Ground</div><div class="seg">${BIOME_KEYS.map(k=>`<button data-biome="${k}" class="${BIOME===k?'on':''}">${BIOMES[k].n}</button>`).join('')}</div>
  <div class="sec-label">Sound</div>
  <label class="slider" for="musicVol"><span>Music</span><input id="musicVol" type="range" min="0" max="100" value="${Math.round(AU.mv*100)}"></label>
  <label class="slider" for="sfxVol"><span>Effects</span><input id="sfxVol" type="range" min="0" max="100" value="${Math.round(AU.sv*100)}"></label>
  <div class="actions" style="align-items:center"><p style="flex:1;font-size:14px">${AU.cur?`Now playing <strong>${AU.cur}</strong> · ${AU.genre}`:AU.ctx?'Between tunes':'Sound starts after your first tap'}</p><button class="btn" style="flex:none;padding:0 16px" data-next>Next tune</button></div>
  ${testerOK()?`<div class="sec-label">Game speed · tester</div><div class="seg">${[1,2,3].map(v=>`<button data-speed="${v}" class="${speed===v?'on':''}">${v}×</button>`).join('')}</div>`:`<div class="sec-label">Tester access</div><form class="seg" id="testerForm"><input id="testerPw" type="password" autocomplete="off" placeholder="Password" aria-label="Tester password" style="flex:2;min-height:42px;border-radius:12px;border:1px solid var(--line);background:var(--raise);color:var(--text);padding:0 12px;font:inherit"><button type="submit">Unlock</button></form><p id="testerMsg" style="font-size:13px">Unlocks game speed controls for testing.</p>`}
  <p>Progress saves on this device every few seconds.</p>
  <div class="actions"><button class="btn" data-stats>Production</button><button class="btn" data-savecode>Save code</button></div>
  <div class="actions"><button class="btn${bneck?' primary':''}" data-bneck>Bottleneck markers: ${bneck?'on':'off'}</button></div>
  <div class="actions"><button class="btn" data-news>What's new</button><button class="btn" data-help>How to play</button></div>
  <div class="actions"><button class="btn" data-mm="title">Main menu</button><button class="btn danger" data-reset>${isCamp()?'Start over':'Restart run'}</button></div>`);
}
function showFinale(){openModal(`<span class="eyebrow">Tutorial complete</span><h1>The halo is lit</h1><p>${PET_GOAL} sail petals now circle the star. From here on, conveyors need construction pulses too, and the Core can send a second pulse at once. Two milestones stand between you and the <strong>Grid Charter</strong>. After that, progress is measured in sustained power, and the ladder has no top.</p><button class="btn primary" data-close>Start the main game</button>`)}
function testerOK(){try{return localStorage.getItem('halo-foundry-tester')==='1'}catch(_){return false}}
elCard.addEventListener('submit',e=>{
  if(e.target.id==='bpNameForm'){e.preventDefault();const no=+e.target.dataset.no,v=($('#bpNameIn').value||'').trim().slice(0,40),a=loadBPS(),x=a.find(q=>q.no===no);if(x&&v){x.name=v;storeBPS(a)}showBlueprints();showToast('Saved as “'+(x?x.name:v)+'”');return}
  if(e.target.id!=='testerForm')return;e.preventDefault();
  const v=($('#testerPw').value||'').trim().toLowerCase();
  if(v==='na'){try{localStorage.setItem('halo-foundry-tester','1')}catch(_){}showMenu();showToast('Tester speed controls unlocked')}
  else{$('#testerMsg').textContent='That password is not right.';$('#testerPw').value=''}
});
elCard.addEventListener('input',e=>{const v=+e.target.value/100;if(e.target.id==='musicVol'){AU.mv=v;audioPrefs()}else if(e.target.id==='sfxVol'){AU.sv=v;audioPrefs();sfx('tick')}});
elCard.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-close'))closeModal();
  else if(b.dataset.biome){setBiome(b.dataset.biome);sfx('tick');const st=elCard.scrollTop;showMenu();elCard.scrollTop=st}
  else if(b.dataset.speed){if(!testerOK())return;speed=+b.dataset.speed;S.speed=speed;showMenu()}
  else if(b.dataset.up){const k=b.dataset.up;if(UPG[k].max&&(S.up[k]||0)>=UPG[k].max)return;const c=UPG[k].cost(S.up[k]||0);if(!canAfford(c)){showToast('Need '+missing(c)+' more');return}pay(c,-1);S.up[k]=(S.up[k]||0)+1;save();showMenu();showToast(UPG[k].n+' is now level '+S.up[k])}
  else if(b.dataset.tech){const id=b.dataset.tech;S.res.cur=S.res.cur===id?null:id;sfx('tick');showResearch();hudTick(true)}
  else if(b.hasAttribute('data-stats'))showStats();
  else if(b.dataset.cmd){const k=b.dataset.cmd,u=CMD[k];if(!u)return;if(u.max&&cmdLv(k)>=u.max)return;const ct=cmdCost(k);if(cmdPts()<ct){showToast(`Needs ${ct} Commander point${ct===1?'':'s'}. Complete Constellations to earn more.`);return}S.cmd=S.cmd||{};S.cmdSpent=(S.cmdSpent||0)+ct;S.cmd[k]=cmdLv(k)+1;save();showMenu();showToast(u.n+' is now level '+S.cmd[k])}
  else if(b.dataset.mm==='cont')closeModal();
  else if(b.dataset.mm==='title'){save();showTitle()}
  else if(b.dataset.slot!=null){playSlot(SLOT_KEYS[+b.dataset.slot])}
  else if(b.dataset.slotnew!=null){const k=SLOT_KEYS[+b.dataset.slotnew];if(readSlot(k)&&Date.now()-(titleArm[k]||0)>3000){titleArm[k]=Date.now();b.textContent='Tap again to erase';return}
    useSlot(k);try{localStorage.removeItem(k)}catch(_){}start(null,true);save();closeModal();showToast('New game in Slot '+(+b.dataset.slotnew+1))}
  else if(b.hasAttribute('data-daily')){const T=dailyToday(),dd=readSlot(DAILY_KEY);if(dd&&dd.daily===T.date)playSlot(DAILY_KEY);else startRun(DAILY_KEY,dailyData())}
  else if(b.dataset.chal){const id=b.dataset.chal,cd=readSlot(CH_KEY);if(!CHALLENGES[id])return;
    if(cd&&cd.ch===id&&!b.dataset.fresh){playSlot(CH_KEY);return}
    if(cd&&!cd.chWon&&cd.ch!==id&&Date.now()-(titleArm.ch||0)>3000){titleArm.ch=Date.now();b.textContent='Tap again: replaces '+CHALLENGES[cd.ch].n;return}
    startRun(CH_KEY,chData(id));showToast(CHALLENGES[id].n+': '+CHALLENGES[id].d)}
  else if(b.dataset.creward){const k=b.dataset.creward;if(!S.chOffer||!S.chOffer.includes(k))return;META.crelics.push(k);META.ch[S.ch].reward=k;saveMeta();S.chOffer=null;save();closeModal();burst(CX,CY,'#f3c25a',50);sfx('fanfare');showToast(RELICS[k].n+' now works in every main game')}
  else if(b.dataset.bpren)showBpName(+b.dataset.bpren);
  else if(b.hasAttribute('data-bplist'))showBlueprints();
  else if(b.hasAttribute('data-ascopen'))showAscension();
  else if(b.hasAttribute('data-relicshow'))showRelicPick();
  else if(b.dataset.relic){const k=b.dataset.relic;if(!S.relicPick||!S.relicPick.includes(k)||!RELICS[k])return;S.relics=S.relics||[];S.relics.push(k);S.relicPick=null;save();closeModal();burst(CX,CY,'#d8b4ff',40);sfx('fanfare');showToast(RELICS[k].n+': '+relicText(k))}
  else if(b.dataset.ss){const k=b.dataset.ss,u=SS[k];if(!u)return;const L=ssLv(k);if(L>=u.max)return;if(u.req&&!ssLv(u.req)){showToast('Needs '+SS[u.req].n+' first');return}const c=u.cost(L);if(S.asc.seeds<c){showToast(`Needs ${c} Starseeds`);return}
    S.asc.seeds-=c;S.ss=S.ss||{};S.ss[k]=L+1;if(k==='seedv')refreshSeeds();if(k==='core'&&!growCore())showToast('Clear the tiles around the Core and it will grow');save();showAscension();sfx('tick')}
  else if(b.dataset.nup){const k=b.dataset.nup,u=NUP[k];if(!u)return;const L=nupLv(k);if(L>=u.max)return;const c=u.cost(L);if((S.inv.nova||0)<c){showToast(`Needs ${c} Nova shard${c===1?'':'s'}`);return}
    S.inv.nova-=c;S.nup=S.nup||{};S.nup[k]=L+1;for(const q of S.bs.values())if(q.t==='deepdrill')q.dep=false;save();showMenu();showToast(u.n+' is now level '+S.nup[k])}
  else if(b.hasAttribute('data-ascend')){if(canAscend())showMoonPick()}
  else if(b.dataset.moon!==undefined){if(canAscend())doAscend(b.dataset.moon||null)}
  else if(b.hasAttribute('data-savecode'))showSaveCode();
  else if(b.hasAttribute('data-bneck')){bneck=!bneck;try{localStorage.setItem('halo-foundry-bneck',bneck?'1':'0')}catch(_){}showMenu()}
  else if(b.hasAttribute('data-copycode')){const o=$('#codeOut'),v=o.value;if(!v.startsWith('HF'))return;const sel=()=>{o.focus();o.select();showToast('Code selected. Copy it from here.')};try{navigator.clipboard.writeText(v).then(()=>showToast('Save code copied'),sel)}catch(_){sel()}}
  else if(b.hasAttribute('data-loadcode')){const v=$('#codeIn').value.trim(),m=$('#codeMsg');if(!v){m.textContent='Paste a save code first.';return}
    if(Date.now()-(b._arm||0)>4000){b._arm=Date.now();b.textContent='Tap again to replace this game';return}
    decodeSave(v).then(d=>{if(!d||!d.v||d.seed==null)throw 0;d.fromCode=1;start(d);save();closeModal();showToast('Game loaded')}).catch(()=>{m.textContent='That code could not be read. Check that it was copied in full.';b.textContent='Load this game';b._arm=0})}
  else if(b.hasAttribute('data-bpclip'))startPaste(CLIP);
  else if(b.dataset.bpuse!=null){const x=loadBPS()[+b.dataset.bpuse];if(x)startPaste(x.L)}
  else if(b.dataset.bpdel!=null){if(Date.now()-(b._arm||0)<3000){const a=loadBPS();a.splice(+b.dataset.bpdel,1);storeBPS(a);showBlueprints()}else{b._arm=Date.now();b.textContent='Tap again'}}
  else if(b.hasAttribute('data-next')){musicNext();setTimeout(showMenu,60)}
  else if(b.hasAttribute('data-help'))showHelp();
  else if(b.hasAttribute('data-news'))showNews();
  else if(b.hasAttribute('data-reset')){
    if(Date.now()-resetArm<3000){if(S.mode==='daily'){startRun(DAILY_KEY,dailyData());showToast('Daily moon restarted')}else if(S.mode==='challenge'){const c=S.ch;startRun(CH_KEY,chData(c));showToast('Challenge restarted')}else{try{localStorage.removeItem(CUR)}catch(_){}start(null,true);closeModal();showToast('New world generated')}}
    else{resetArm=Date.now();b.textContent='Tap again to wipe';setTimeout(()=>{if(b.isConnected)b.innerHTML='Start over'},3000)}
  }
});
$('#menuBtn').onclick=showMenu;$('#goalBtn').onclick=()=>chal()&&!S.chWon&&S.ms>=MS.length?showChGoal():S.ms>=MS.length?showResearch():showMilestones();$('#orreryBtn').onclick=showMilestones;
$('#powerBox').onclick=showStats;$('#ladBox').onclick=showMilestones;$('#mapBtn').onclick=showMap;

// ================= audio: generative music + positional effects =================
// Everything is synthesized with Web Audio, so nothing loads from the network. Audio starts on the first touch.
let AUvis=0;
const AU={ps:new Map(),ctx:null,mv:.5,sv:.6,last:{},winT:0,winN:0,m:{},cur:'',bag:[]};
try{const a=JSON.parse(localStorage.getItem('halo-foundry-audio')||'{}');if(a.mv!=null)AU.mv=a.mv;if(a.sv!=null)AU.sv=a.sv}catch(_){}
function audioPrefs(){try{localStorage.setItem('halo-foundry-audio',JSON.stringify({mv:AU.mv,sv:AU.sv}))}catch(_){}if(AU.ctx){AU.music.gain.setTargetAtTime(AU.mv*.45,AU.ctx.currentTime,.1);AU.sfx.gain.setTargetAtTime(AU.sv*.9,AU.ctx.currentTime,.1);audioWake()}}
// Both sliders at 0 = fully silent: the audio engine is paused, not just turned down.
function audioMuted(){return AU.mv<=.001&&AU.sv<=.001}
function audioWake(){const c=AU.ctx;if(!c)return;if(audioMuted()||document.hidden){if(c.state==='running')setTimeout(()=>{if(audioMuted()||document.hidden)c.suspend().catch(()=>{})},250)}else if(c.state==='suspended')c.resume().catch(()=>{})}
const mf=m=>440*Math.pow(2,(m-69)/12);
function impulse(c,sec,dec){const n=Math.floor(c.sampleRate*sec),b=c.createBuffer(2,n,c.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,dec)}return b}
function audioInit(){
  if(AU.ctx){audioWake();return}
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  let c;try{c=new C()}catch(_){return}AU.ctx=c;window.__haloCtx=c;
  AU.master=c.createGain();AU.master.gain.value=.55;
  const comp=c.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=6;comp.knee.value=8;comp.attack.value=.005;comp.release.value=.2;AU.master.connect(comp);comp.connect(c.destination);
  AU.music=c.createGain();AU.music.gain.value=AU.mv*.45;AU.music.connect(AU.master);
  AU.sfx=c.createGain();AU.sfx.gain.value=AU.sv*.9;AU.sfx.connect(AU.master);
  // Each bus gets its own reverb so its slider also silences the echo (a shared reverb leaked music at volume 0).
  const ir=impulse(c,1.8,2.8);AU.revM=c.createConvolver();AU.revM.buffer=ir;AU.revM.connect(AU.music);AU.rev=c.createConvolver();AU.rev.buffer=ir;const ro=c.createGain();ro.gain.value=.5;AU.rev.connect(ro);ro.connect(AU.sfx);
  const nb=c.createBuffer(1,c.sampleRate*2,c.sampleRate),nd=nb.getChannelData(0);let br=0;for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;AU.noise=nb;
  const bb=c.createBuffer(1,c.sampleRate*4,c.sampleRate),bd=bb.getChannelData(0);for(let i=0;i<bd.length;i++){br=(br+.02*(Math.random()*2-1))/1.02;bd[i]=br*3.5}
  const hs=c.createBufferSource();hs.buffer=bb;hs.loop=true;const hf=c.createBiquadFilter();hf.type='lowpass';hf.frequency.value=170;AU.hum=c.createGain();AU.hum.gain.value=0;hs.connect(hf);hf.connect(AU.hum);AU.hum.connect(AU.sfx);hs.start();
  audioWake();
  musicStart(pickTune());setInterval(audioPump,100);
}
['pointerdown','keydown'].forEach(ev=>window.addEventListener(ev,audioInit,{capture:true}));
document.addEventListener('visibilitychange',audioWake);

// ---- instruments ----
// Every voice is built from oscillators and filtered noise. dest is the current tune's bus, so switching tunes fades the old one out cleanly.
function inst(k,f,t,dur,v,opt,dest){
  const ct=AU.ctx.currentTime;AU.vn=(AU.vn||[]).filter(x=>x>ct);if(AU.vn.length>40)return; // voice cap keeps phones from crackling
  opt=opt||{};const c=AU.ctx,out=c.createGain(),snd=c.createGain(),G=out.gain,stops=[];
  out.connect(dest||AU.m.bus||AU.music);snd.gain.value=opt.rev!=null?opt.rev:(k==='bass'||k==='sub'||k==='synthbass'||k==='upright'?.05:.4);out.connect(snd);snd.connect(AU.revM);
  const osc=(type,fr,to,gain,det)=>{const o=c.createOscillator();o.type=type;o.frequency.value=fr;if(det)o.detune.value=det;if(gain!=null&&gain!==1){const g=c.createGain();g.gain.value=gain;o.connect(g);g.connect(to)}else o.connect(to);stops.push(o);return o};
  const lp=(fr,q,to)=>{const b=c.createBiquadFilter();b.type='lowpass';b.frequency.value=fr;b.Q.value=q||.7;b.connect(to||out);return b};
  const vib=(param,rate,depth,delay)=>{const l=c.createOscillator(),g=c.createGain();l.frequency.value=rate;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(depth,t+(delay||.2)+.15);l.connect(g);g.connect(param);stops.push(l)};
  let end=t+dur+.3;
  const sus=(a,lvl,rel)=>{const h=Math.max(a,dur);G.setValueAtTime(0,t);G.linearRampToValueAtTime(lvl,t+a);G.setValueAtTime(lvl,t+h);G.linearRampToValueAtTime(0,t+h+rel);end=t+h+rel+.05};
  const perc=(a,lvl,tail)=>{G.setValueAtTime(0,t);G.linearRampToValueAtTime(lvl,t+a);G.exponentialRampToValueAtTime(.0004,t+tail);end=t+tail+.05};
  switch(k){
    case 'pad':{const fl=lp(opt.cut||900,.5);osc('sawtooth',f,fl,.5,-7);osc('sawtooth',f,fl,.5,7);osc('triangle',f/2,fl,.6);const a=Math.min(1.6,dur*.35);G.setValueAtTime(0,t);G.linearRampToValueAtTime(v,t+a);G.setValueAtTime(v,t+dur);G.linearRampToValueAtTime(0,t+dur+2.5);end=t+dur+2.6;break}
    case 'strings':{const fl=lp(opt.cut||1900,.5);const os=[-12,0,12].map(d=>osc('sawtooth',f,fl,.33,d));vib(os[1].detune,5,8,.3);const a=Math.min(.6,dur*.3);G.setValueAtTime(0,t);G.linearRampToValueAtTime(v,t+a);G.setValueAtTime(v,t+dur);G.linearRampToValueAtTime(0,t+dur+.8);end=t+dur+.9;break}
    case 'bell':case 'glass':{const tail=Math.max(.7,dur*2)+(k==='glass'?1.2:0);osc('sine',f,out);osc('sine',f*(k==='bell'?2.756:3.01),out,.26);osc('sine',f*(k==='glass'?2:5.4),out,.07);G.setValueAtTime(0,t);G.linearRampToValueAtTime(v,t+(k==='glass'?.05:.006));G.exponentialRampToValueAtTime(.0004,t+tail);end=t+tail+.1;break}
    case 'pluck':{const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(2600,t);fl.frequency.exponentialRampToValueAtTime(420,t+.35);fl.connect(out);osc('triangle',f,fl);osc('square',f*1.003,fl,.12);perc(.004,v,Math.min(1.2,dur+.3));break}
    case 'bass':{osc('sine',f,out);osc('triangle',f,out,.25);G.setValueAtTime(0,t);G.linearRampToValueAtTime(v,t+.03);G.setValueAtTime(v,t+dur*.7);G.linearRampToValueAtTime(0,t+dur+.6);end=t+dur+.7;break}
    case 'ep':{const m=c.createOscillator(),mg=c.createGain();m.frequency.value=f;mg.gain.setValueAtTime(f*2.2,t);mg.gain.exponentialRampToValueAtTime(f*.12,t+.5);m.connect(mg);const car=osc('sine',f,out);mg.connect(car.frequency);stops.push(m);osc('sine',f*2,out,.1);const tail=Math.min(2.6,dur+1.2);G.setValueAtTime(0,t);G.linearRampToValueAtTime(v,t+.004);G.exponentialRampToValueAtTime(v*.4,t+.4);G.setValueAtTime(v*.4,t+Math.max(.4,dur));G.exponentialRampToValueAtTime(.0004,t+Math.max(.5,tail));end=t+Math.max(.5,tail)+.05;break}
    case 'piano':{osc('sine',f,out);osc('triangle',f,out,.35);osc('sine',f*2,out,.18);osc('sine',f*3,out,.06);G.setValueAtTime(0,t);G.linearRampToValueAtTime(v,t+.003);G.exponentialRampToValueAtTime(v*.35,t+.3);G.exponentialRampToValueAtTime(.0004,t+Math.min(3,dur+1.6));end=t+Math.min(3,dur+1.6)+.05;break}
    case 'vibes':{const tm=c.createGain();tm.gain.value=.75;tm.connect(out);const l=c.createOscillator(),lg=c.createGain();l.frequency.value=5.5;lg.gain.value=.25;l.connect(lg);lg.connect(tm.gain);stops.push(l);osc('sine',f,tm);osc('sine',f*4,tm,.08);perc(.003,v,2.4);break}
    case 'organ':{[1,2,3,4].forEach((h,i)=>osc('sine',f*h,out,[1,.5,.28,.18][i]));sus(.008,v,.1);break}
    case 'brass':{const fl=c.createBiquadFilter();fl.type='lowpass';fl.Q.value=1.5;fl.frequency.setValueAtTime(350,t);fl.frequency.linearRampToValueAtTime(2600,t+.05);fl.frequency.exponentialRampToValueAtTime(1300,t+.25);fl.connect(out);osc('sawtooth',f,fl,.5,-6);osc('sawtooth',f,fl,.5,6);sus(.02,v,.12);break}
    case 'supersaw':{const fl=lp(opt.cut||3200,.6);[-22,-11,0,11,22].forEach(d=>osc('sawtooth',f,fl,.22,d));osc('sine',f/2,fl,.3);sus(.01,v,.25);break}
    case 'lead':{const fl=c.createBiquadFilter();fl.type='lowpass';fl.Q.value=4;fl.frequency.setValueAtTime(5200,t);fl.frequency.exponentialRampToValueAtTime(900,t+.28);fl.connect(out);osc('sawtooth',f,fl,.5,-8);osc('sawtooth',f,fl,.5,8);const h=Math.max(.3,dur);G.setValueAtTime(0,t);G.linearRampToValueAtTime(v,t+.004);G.exponentialRampToValueAtTime(v*.3,t+.3);G.setValueAtTime(v*.3,t+h);G.linearRampToValueAtTime(0,t+h+.15);end=t+h+.2;break}
    case 'synlead':{const fl=lp(2300,1.2);const a=osc('square',f,fl,.5);osc('sawtooth',f*1.004,fl,.4);vib(a.detune,5.5,10,.2);sus(.012,v,.1);break}
    case 'arp':{const fl=lp(1900,3);osc('square',f,fl,.6);perc(.003,v,.18);break}
    case 'synthbass':{const fl=c.createBiquadFilter();fl.type='lowpass';fl.Q.value=7;fl.frequency.setValueAtTime(1500,t);fl.frequency.exponentialRampToValueAtTime(230,t+.18);fl.connect(out);osc('sawtooth',f,fl,.7);osc('square',f/2,fl,.3);const h=Math.max(.05,dur);G.setValueAtTime(0,t);G.linearRampToValueAtTime(v,t+.004);G.linearRampToValueAtTime(v*.7,t+.1);G.setValueAtTime(v*.7,t+h);G.linearRampToValueAtTime(0,t+h+.06);end=t+h+.1;break}
    case 'sub':{osc('sine',f,out);osc('sine',f*2,out,.12);sus(.006,v,.06);break}
    case 'upright':{const fl=lp(900,.8);const a=osc('sine',f,fl);a.frequency.setValueAtTime(f*1.03,t);a.frequency.exponentialRampToValueAtTime(f,t+.05);osc('triangle',f,fl,.4);perc(.006,v,Math.max(.35,Math.min(1.2,dur+.15)));break}
    case 'mtrumpet':{const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1300;bp.Q.value=1.4;bp.connect(out);const a=osc('sawtooth',f,bp);vib(a.detune,5.2,12,.25);sus(.04,v,.12);break}
    case 'clarinet':{const fl=lp(1700,.9);const a=osc('square',f,fl,.6);osc('sine',f,fl,.4);vib(a.detune,5,9,.2);sus(.05,v,.1);break}
    case 'flute':{const a=osc('sine',f,out);osc('sine',f*2,out,.08);vib(a.detune,5,10,.25);sus(.08,v,.15);const n=c.createBufferSource();n.buffer=AU.noise;const nb=c.createBiquadFilter();nb.type='bandpass';nb.frequency.value=f*2;nb.Q.value=6;const ng=c.createGain();ng.gain.value=.25;n.connect(nb);nb.connect(ng);ng.connect(out);n.start(t,Math.random());n.stop(end);break}
  }
  AU.vn.push(end);stops.forEach(o=>{o.start(t);o.stop(end)});
}
function drum(k,t,v,dest){
  const c=AU.ctx,o=c.createGain();o.gain.value=v;o.connect(dest);
  const nz=(type,fr,q,a,dec,lvl,off)=>{const tt=t+(off||0),s=c.createBufferSource();s.buffer=AU.noise;const f=c.createBiquadFilter();f.type=type;f.frequency.value=fr;f.Q.value=q;const g=c.createGain();s.connect(f);f.connect(g);g.connect(o);g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(lvl,tt+a);g.gain.exponentialRampToValueAtTime(.0004,tt+a+dec);s.start(tt,Math.random()*1.5);s.stop(tt+a+dec+.05)};
  const tn=(type,f0,f1,dec,lvl)=>{const x=c.createOscillator(),g=c.createGain();x.type=type;x.frequency.setValueAtTime(f0,t);x.frequency.exponentialRampToValueAtTime(f1,t+dec*.6);x.connect(g);g.connect(o);g.gain.setValueAtTime(lvl,t);g.gain.exponentialRampToValueAtTime(.0004,t+dec);x.start(t);x.stop(t+dec+.05)};
  switch(k){
    case 'k':tn('sine',150,45,.32,1);tn('triangle',900,200,.02,.25);break;
    case 'kj':tn('sine',95,50,.25,.7);break;
    case 's':nz('highpass',1400,.7,.002,.16,.55);tn('triangle',200,150,.1,.45);break;
    case 'c':[0,.011,.022].forEach(d=>nz('bandpass',1200,1.2,.001,.02,.6,d));nz('bandpass',1150,1,.001,.16,.5,.03);break;
    case 'h':nz('highpass',7500,.8,.001,.04,.5);break;
    case 'o':nz('highpass',7000,.8,.002,.22,.4);break;
    case 'r':nz('bandpass',7200,1,.001,.5,.25);tn('sine',3100,3050,.4,.04);break;
    case 'b':nz('bandpass',3000,.6,.03,.14,.4);break;
    case 'sh':nz('highpass',6000,1,.015,.05,.35);break;
    case 'rim':tn('square',1700,1600,.025,.25);tn('triangle',800,780,.03,.3);break;
    case 't':tn('sine',150,95,.3,.8);break;
    case 'hp':nz('bandpass',5500,1.2,.002,.05,.4);break;
  }
}
function riser(t,dur,dest){const c=AU.ctx,s=c.createBufferSource();s.buffer=AU.noise;s.loop=true;const f=c.createBiquadFilter();f.type='bandpass';f.Q.value=1.5;f.frequency.setValueAtTime(400,t);f.frequency.exponentialRampToValueAtTime(7000,t+dur);const g=c.createGain();s.connect(f);f.connect(g);g.connect(dest);g.gain.setValueAtTime(.0004,t);g.gain.exponentialRampToValueAtTime(.12,t+dur*.95);g.gain.linearRampToValueAtTime(0,t+dur);s.start(t);s.stop(t+dur+.05)}

// ---- the playlist ----
function pickTune(){if(!AU.bag.length){AU.bag=TUNES.map((_,i)=>i).sort(()=>Math.random()-.5);if(AU.bag[0]===AU.m.idx)AU.bag.push(AU.bag.shift())}return AU.bag.shift()}
function musicStart(i){
  const c=AU.ctx,M=AU.m,T=TUNES[i];
  if(M.bus){const ob=M.bus;ob.gain.setTargetAtTime(0,c.currentTime,.2);setTimeout(()=>{try{ob.disconnect()}catch(_){}},2500)}
  M.bus=c.createGain();M.bus.gain.value=T.vol||1;M.bus.connect(AU.music);M.duck=c.createGain();M.duck.connect(M.bus);
  const len=T.prog.length,barDur=60/T.bpm*(T.beats||4);
  M.t=T;M.idx=i;M.step=0;M.bar=-1;M.bars=Math.max(len*4,Math.round(150/barDur/len)*len);M.next=c.currentTime+.35;M.R=mulberry((Math.random()*1e9)|0);M.mi=null;M.mc={};M.gap=0;
  M.brk=T.drums?Math.floor(M.bars*.55/len)*len:-1;M.brkLen=Math.min(4,len);AU.cur=T.n;AU.genre=T.g;
}
function musicNext(){if(!AU.ctx)return;musicStart(pickTune())}
function barStart(T,M){
  const len=T.prog.length,b=M.bar;M.ch=chordOf(T.prog[b%len]);M.nch=chordOf(T.prog[(b+1)%len]);
  M.ph=b<2?'intro':b>=M.bars-2?'outro':(b>=M.brk&&b<M.brk+M.brkLen)?'break':'main';
  if(T.bass&&T.bass.walk){const r=bassRoot(M.ch),n=bassRoot(M.nch);M.walk=[r,r+M.ch.ints[1]+(M.R()<.3?12:0),r+7,n+(M.R()<.5?1:-1)]}
  M.mbar=null;
  if(T.mel&&M.ph==='main'){const key=b%len,cyc=Math.floor(b/len);
    if(M.mc[key]&&cyc%2===1){M.mbar=M.mc[key].map(n=>({...n,m:M.R()<.2?nearestTone(M.ch,n.m+(M.R()<.5?2:-2)):n.m}))}
    else{M.mbar=genMelBar(T,M);M.mc[key]=M.mbar}}
}
function playStep(T,M,st,t0,sd){
  const spb=T.beats*4,t=t0+(T.swing&&st%4===2?sd*4*T.swing:0),ph=M.ph,ch=M.ch,barDur=sd*spb,side=T.side?M.duck:M.bus,on=ph==='main'||ph==='break';
  for(const C of [T.comp,T.comp2]){if(!C)continue;
    if(C.mode==='hold'){if(st===0)voice(ch,55).forEach(n=>inst(C.inst,mf(n),t,barDur*1.02,C.v,{cut:C.cut},side))}
    else if(C.pat[st]!=='.'&&ph!=='outro'){let j=1;while(j<spb&&C.pat[(st+j)%spb]==='.')j++;const acc=C.pat[st]==='X'?1.2:1;voice(ch,55).forEach(n=>inst(C.inst,mf(n),t,Math.min(j,8)*sd*.85,C.v*acc,{},side))}}
  if(T.bass&&(ph!=='intro'||!T.drums)){
    const B=T.bass;
    if(B.walk){if(st%4===0&&M.walk)inst(B.inst,mf(M.walk[st/4]),t,sd*3.6,B.v,{},side)}
    else{const k=B.pat[st];if(k&&k!=='.'&&k!=='-'){const r=bassRoot(ch),off={'1':0,'3':ch.ints[1],'5':7,'7':ch.ints[3]||10,'8':12}[k]||0;let j=1;while(j<spb&&B.pat[(st+j)%spb]==='.'&&st+j<spb)j++;inst(B.inst,mf(r+off),t,Math.min(j,B.max||8)*sd*.9,B.v,{},side)}}
  }
  if(T.arp&&on&&st%(T.arp.every||1)===0){const ns=voice(ch,60+12*(T.arp.oct||0)),q=T.arp.seq[(st/(T.arp.every||1))%T.arp.seq.length],m=ns[q%ns.length]+12*Math.floor(q/ns.length);inst(T.arp.inst,mf(m),t,sd*(T.arp.every||1)*.9,T.arp.v,{},side)}
  if(T.drums&&on){for(const lane in T.drums){if(ph==='break'&&!['h','sh','r','b'].includes(lane))continue;const ch2=T.drums[lane][st];if(!ch2||ch2==='.')continue;const vel=(ch2==='X'?1:ch2==='-'?.35:.7)*(ph==='break'?.5:1);const kk=lane==='k'&&T.kick?T.kick:lane;drum(kk,t,vel*(T.dv||.2)*LANE_V[lane],M.bus);if(lane==='k'&&T.side){M.duck.gain.setValueAtTime(.3,t);M.duck.gain.linearRampToValueAtTime(1,t+sd*3)}}}
  if(T.riser&&ph==='break'&&st===0&&M.bar===M.brk+M.brkLen-1)riser(t,barDur,M.bus);
  if(M.mbar)for(const n of M.mbar)if(n.st===st)inst(T.mel.inst,mf(n.m),t,n.len*sd*.95,T.mel.v,{},M.bus);
}
function audioPump(){
  const c=AU.ctx;if(STOPPED||!c||c.state!=='running')return;const now=c.currentTime,M=AU.m;
  // factory hum follows how many machines are working on screen, and how close you are
  const zf=Math.max(.12,Math.min(1.15,(cam.z-8)/40));AU.hum.gain.setTargetAtTime(Math.min(1,AUvis/18)*zf*.3,now,.6);
  const live=new Set(S?S.pulses:[]);
  for(const [p,v] of AU.ps)if(!live.has(p)){v.out.gain.setTargetAtTime(0,now,.07);setTimeout(v.stop,600);AU.ps.delete(p)}
  if(S)for(const p of S.pulses){
    let v=AU.ps.get(p);if(!v){if(AU.ps.size>=3)continue;v=pulseVoice();AU.ps.set(p,v)}
    const h=ptAt(p,p.d),sp=spot(h[0],h[1]),vol=sp?sp[0]*.16:0;
    v.out.gain.setTargetAtTime(vol,now,.08);if(v.pn&&sp)v.pn.pan.setTargetAtTime(sp[1],now,.08);v.bp.frequency.setTargetAtTime(1300+900*Math.abs(Math.sin(now*2.6+p.len)),now,.08);
  }
  if(M.gap){if(now<M.gap)return;musicStart(pickTune())}
  if(!M.t)return;
  const T=M.t,sd=60/T.bpm/4,spb=(T.beats||4)*4;
  if(M.next<now)M.next=now+.05; // after a stall, resume cleanly instead of firing missed notes all at once
  while(M.next<now+.8){
    const st=M.step%spb,t=M.next;
    if(st===0){M.bar++;if(M.bar>=M.bars){M.gap=t+5+M.R()*6;AU.cur='';return}barStart(T,M)}
    playStep(T,M,st,t,sd);
    M.step++;M.next+=sd;
  }
}

// ---- positional sound effects ----
function tone(c,t,dest,type,f0,f1,dur,v){const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(f1,t+dur);o.connect(g);g.connect(dest);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.004);g.gain.exponentialRampToValueAtTime(.0004,t+dur);o.start(t);o.stop(t+dur+.05)}
function hiss(c,t,dest,ft,f0,f1,dur,v,q){const s=c.createBufferSource();s.buffer=AU.noise;const f=c.createBiquadFilter();f.type=ft;f.frequency.setValueAtTime(f0,t);if(f1!==f0)f.frequency.exponentialRampToValueAtTime(f1,t+dur);f.Q.value=q||1;const g=c.createGain();s.connect(f);f.connect(g);g.connect(dest);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.006);g.gain.exponentialRampToValueAtTime(.0004,t+dur);s.start(t,Math.random()*1.4,dur+.05)}
function swell(c,t,dest,ft,f0,f1,dur,v,q,peak){const s=c.createBufferSource();s.buffer=AU.noise;s.loop=true;const f=c.createBiquadFilter();f.type=ft;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+dur);f.Q.value=q||1;const g=c.createGain();s.connect(f);f.connect(g);g.connect(dest);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+dur*(peak||.5));g.gain.exponentialRampToValueAtTime(.0004,t+dur);s.start(t,Math.random()*1.4);s.stop(t+dur+.05)}
// a running pulse: airy whoosh + chopped high crackle + a faint electric hum, steered by audioPump
function pulseVoice(){
  const c=AU.ctx,t=c.currentTime,out=c.createGain();out.gain.value=0;let pn=null;
  if(c.createStereoPanner){pn=c.createStereoPanner();out.connect(pn);pn.connect(AU.sfx)}else out.connect(AU.sfx);
  const sn=c.createGain();sn.gain.value=.3;out.connect(sn);sn.connect(AU.rev);
  const n1=c.createBufferSource();n1.buffer=AU.noise;n1.loop=true;const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1500;bp.Q.value=3.5;n1.connect(bp);bp.connect(out);
  const n2=c.createBufferSource();n2.buffer=AU.noise;n2.loop=true;const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=3800;const cg=c.createGain();cg.gain.value=0;
  const lfo=c.createOscillator();lfo.type='square';lfo.frequency.value=16+Math.random()*10;const lg=c.createGain();lg.gain.value=.12;lfo.connect(lg);lg.connect(cg.gain);n2.connect(hp);hp.connect(cg);cg.connect(out);
  n1.start(t,Math.random()*1.5);n2.start(t,Math.random()*1.5);lfo.start(t);
  return{out,pn,bp,stop:()=>{const e=c.currentTime+.05;[n1,n2,lfo].forEach(x=>{try{x.stop(e)}catch(_){}})}};
}
function spot(wx,wy){const sx=w2sx(wx),sy=w2sy(wy),dx=sx-VW/2,dy=sy-VH/2,d=Math.hypot(dx,dy),Rr=.55*Math.max(VW,VH);if(d>Rr*1.6)return null;return[Math.max(.12,Math.min(1.15,(cam.z-8)/40))*Math.exp(-(d/Rr)*(d/Rr)),Math.max(-.7,Math.min(.7,dx/(VW/2)*.7))]}
const ORE_PITCH={ferrite:380,cuprite:540,silica:720,carbon:250};
const SFX={
  tick:(c,t,o)=>tone(c,t,o,'sine',1500,1500,.04,.1),
  lay:(c,t,o)=>tone(c,t,o,'triangle',900,700,.035,.06),
  place:(c,t,o)=>{tone(c,t,o,'sine',230,110,.16,.35);hiss(c,t,o,'bandpass',1400,1400,.04,.1,2)},
  remove:(c,t,o)=>tone(c,t,o,'triangle',520,170,.2,.2),
  err:(c,t,o)=>{tone(c,t,o,'triangle',150,140,.09,.18);tone(c,t+.11,o,'triangle',150,130,.1,.16)},
  pulse:(c,t,o)=>hiss(c,t,o,'bandpass',700,2600,.2,.09,2),
  // materialize: an electric inhale that rises and snaps shut as the building seals
  build:(c,t,o)=>{const D=.9;
    const s=c.createBufferSource();s.buffer=AU.noise;s.loop=true;const f=c.createBiquadFilter();f.type='bandpass';f.Q.value=3;f.frequency.setValueAtTime(380,t);f.frequency.exponentialRampToValueAtTime(3400,t+D);const g=c.createGain();s.connect(f);f.connect(g);g.connect(o);g.gain.setValueAtTime(.0004,t);g.gain.exponentialRampToValueAtTime(.2,t+D*.95);g.gain.linearRampToValueAtTime(0,t+D+.03);s.start(t,Math.random());s.stop(t+D+.05);
    const z=c.createOscillator();z.type='sawtooth';z.frequency.setValueAtTime(55,t);z.frequency.exponentialRampToValueAtTime(140,t+D);const zl=c.createBiquadFilter();zl.type='lowpass';zl.frequency.value=900;const ch=c.createGain();ch.gain.value=0;const l=c.createOscillator();l.type='square';l.frequency.value=28;const lg=c.createGain();lg.gain.value=.5;l.connect(lg);lg.connect(ch.gain);const zg=c.createGain();z.connect(zl);zl.connect(ch);ch.connect(zg);zg.connect(o);zg.gain.setValueAtTime(.0004,t);zg.gain.exponentialRampToValueAtTime(.09,t+D*.9);zg.gain.linearRampToValueAtTime(0,t+D+.02);[z,l].forEach(x=>{x.start(t);x.stop(t+D+.05)});
    tone(c,t+D,o,'sine',170,60,.12,.1);
  },
  drill:(c,t,o,ore)=>hiss(c,t,o,'bandpass',ORE_PITCH[ore]||380,(ORE_PITCH[ore]||380)*.8,.07,.22,4),
  smelt:(c,t,o)=>{hiss(c,t,o,'bandpass',2600,1800,.22,.06,.8);tone(c,t,o,'sine',150,90,.12,.1)},
  craft:(c,t,o)=>{tone(c,t,o,'square',1100,1100,.02,.04);tone(c,t+.06,o,'square',1480,1480,.02,.035)},
  launch:(c,t,o)=>{
    swell(c,t,o,'lowpass',160,700,1.8,.22,.7,.35);tone(c,t,o,'sine',72,38,1.7,.2);
    swell(c,t+.1,o,'bandpass',350,5600,1.6,.2,2.4,.7);
    [0,4,7,11,14,19].forEach((k,i)=>{const f=mf(74+k),tt=t+.6+i*.075;tone(c,tt,o,'sine',f,f,1.8,.045);tone(c,tt,o,'sine',f*2.003,f*2.003,.9,.012)});
  },
  fanfare:(c,t,o)=>[0,4,7,12].forEach((k,i)=>{tone(c,t+i*.13,o,'sine',mf(72+k),mf(72+k),1.4,.12);tone(c,t+i*.13,o,'sine',mf(72+k)*2.756,mf(72+k)*2.756,.6,.03)})
};
SFX.core=(c,t,o)=>{tone(c,t,o,'sine',260,170,.06,.05);hiss(c,t,o,'bandpass',900,700,.035,.03,2)};
const SFX_GAP={launch:.3,drill:.08,core:.06,smelt:.12,craft:.08,build:.04,lay:.03,pulse:.1,tick:.03,place:.03};
function sfx(kind,wx,wy,arg){
  const c=AU.ctx;if(!c||c.state!=='running'||AU.sv<=.001)return;
  const now=c.currentTime;if(now-(AU.last[kind]||-9)<(SFX_GAP[kind]||.02))return;
  if(now-AU.winT>.1){AU.winT=now;AU.winN=0}if(AU.winN>=4)return;
  let vol=1,pan=0;
  if(wx!=null){
    const sx=w2sx(wx),sy=w2sy(wy),dx=sx-VW/2,dy=sy-VH/2,d=Math.hypot(dx,dy),Rr=.55*Math.max(VW,VH);if(d>Rr*1.6)return;
    vol=Math.max(.12,Math.min(1.15,(cam.z-8)/40))*Math.exp(-(d/Rr)*(d/Rr));pan=Math.max(-.7,Math.min(.7,dx/(VW/2)*.7));if(vol<.03)return;
  }
  AU.last[kind]=now;AU.winN++;
  const out=c.createGain();out.gain.value=vol;
  if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;out.connect(p);p.connect(AU.sfx)}else out.connect(AU.sfx);
  const sn=c.createGain();sn.gain.value=.22;out.connect(sn);sn.connect(AU.rev);
  SFX[kind](c,now+.005,out,arg);
}

// ================= input =================
const ptrs=new Map();let G={m:null};
const tileAt=(sx,sy)=>[Math.floor(s2wx(sx)),Math.floor(s2wy(sy))];
cv.addEventListener('pointerdown',e=>{
  try{cv.setPointerCapture(e.pointerId)}catch(_){}
  ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptrs.size>1)flushStroke();
  if(e.pointerType==='mouse'&&e.button!==0){G={m:'pan',lx:e.clientX,ly:e.clientY};return}
  if(ptrs.size===1)G={m:'pend',id:e.pointerId,sx:e.clientX,sy:e.clientY,lx:e.clientX,ly:e.clientY};
  else if(ptrs.size===2){const [a,b]=[...ptrs.values()],mx=(a.x+b.x)/2,my=(a.y+b.y)/2;G={m:'pinch',d:Math.hypot(a.x-b.x,a.y-b.y)||1,z:cam.z,wx:s2wx(mx),wy:s2wy(my)}}
});
cv.addEventListener('pointermove',e=>{
  if(e.pointerType==='mouse'){hover=(B[tool]&&!ptrs.size)?tileAt(e.clientX,e.clientY):(G.m==='paint'?null:hover)}
  if(!ptrs.has(e.pointerId))return;
  const p=ptrs.get(e.pointerId);p.x=e.clientX;p.y=e.clientY;
  switch(G.m){
    case 'pend':
      if(Math.hypot(e.clientX-G.sx,e.clientY-G.sy)>8){
        if(tool==='belt'&&beltMode==='line'){G.m='line';G.a=tileAt(G.sx,G.sy);G.b=tileAt(e.clientX,e.clientY)}
        else if(tool==='select'){G.m='sel';G.a=tileAt(G.sx,G.sy);G.b=tileAt(e.clientX,e.clientY)}
        else if(tool==='belt'&&beltMode==='free'){G.m='paint';G.mine=new Set();G.stroke=[];const t=tileAt(G.sx,G.sy);G.lt=t;const sb=at(t[0],t[1]);if(sb&&sb.t==='belt')G.mine.add(sb.id);ensureBelt(t[0],t[1],rot);paintTo(e.clientX,e.clientY)}
        else if(tool==='remove'){G.m='erase';G.lt=tileAt(G.sx,G.sy);eraseTile(...G.lt);eraseTo(e.clientX,e.clientY)}
        else{G.m='pan';G.lx=e.clientX;G.ly=e.clientY}
      }break;
    case 'pan':cam.x-=(e.clientX-G.lx)/cam.z;cam.y-=(e.clientY-G.ly)/cam.z;G.lx=e.clientX;G.ly=e.clientY;clampCam();break;
    case 'paint':paintTo(e.clientX,e.clientY);break;
    case 'line':case 'sel':G.b=tileAt(e.clientX,e.clientY);break;
    case 'erase':eraseTo(e.clientX,e.clientY);break;
    case 'pinch':{
      if(ptrs.size<2)break;const [a,b]=[...ptrs.values()],mx=(a.x+b.x)/2,my=(a.y+b.y)/2,d=Math.hypot(a.x-b.x,a.y-b.y)||1;
      cam.z=Math.max(10,Math.min(84,G.z*d/G.d));cam.x=G.wx-(mx-VW/2)/cam.z;cam.y=G.wy-(my-VH/2)/cam.z;clampCam();break;}
  }
});
function flushStroke(){if(G.stroke&&G.stroke.length)S.pq.push(G.stroke);G.stroke=null}
function endPtr(e){
  if(!ptrs.has(e.pointerId))return;ptrs.delete(e.pointerId);
  if(G.m==='paint'&&e.pointerId===G.id)flushStroke();
  if(G.m==='line'&&e.pointerId===G.id&&e.type==='pointerup'){const tl=lineTiles(G.a,G.b),n=layTiles(tl);sfx(n?'place':'err');if(n<tl.length)showToast(`Laid ${n} of ${tl.length} conveyors`);hudTick(true)}
  if(G.m==='sel'&&e.pointerId===G.id&&e.type==='pointerup')selectRect(G.a,G.b);
  if(G.m==='pend'&&e.pointerId===G.id&&e.type==='pointerup')tap(e.clientX,e.clientY);
  if(G.m==='pinch'&&ptrs.size<2)G={m:'none'};
  if(!ptrs.size)G={m:null};
  else if(G.m==='paint'||G.m==='erase'||G.m==='pend'||G.m==='pan'||G.m==='line'||G.m==='sel'){if(e.pointerId===G.id||G.m==='pan')G={m:'none'}}
}
cv.addEventListener('pointerup',endPtr);cv.addEventListener('pointercancel',endPtr);
cv.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')hover=null});
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('wheel',e=>{e.preventDefault();const wx=s2wx(e.clientX),wy=s2wy(e.clientY);cam.z=Math.max(10,Math.min(84,cam.z*Math.exp(-e.deltaY*.0015)));cam.x=wx-(e.clientX-VW/2)/cam.z;cam.y=wy-(e.clientY-VH/2)/cam.z;clampCam()},{passive:false});
window.addEventListener('keydown',e=>{
  if(e.target.closest&&e.target.closest('input,textarea'))return;
  if(e.key==='r'||e.key==='R'){if(sel&&B[sel.t].dir&&tool==='inspect'){sel.d=(sel.d+1)&3;dirty=true}else{rot=(rot+1)&3;rotTurns++;updateRot();elRot.querySelector('svg').style.transform=`rotate(${rotTurns*90}deg)`}}
  else if(e.key==='Escape'){if(!elModal.hidden)closeModal();else{setTool('inspect');closeSheet()}}
  else if(/^[0-9]$/.test(e.key)){const i=(+e.key+9)%10;if(TOOLS[i])setTool(TOOLS[i])}
  else if(e.key==='x'||e.key==='X')setTool('remove');
  else if((e.key==='c'||e.key==='C')&&SELB){CLIP=captureLayout(SELB.map(id=>S.bs.get(id)));startPaste(CLIP)}
  else if((e.key==='v'||e.key==='V')&&CLIP)startPaste(CLIP);
});

function ensureBelt(x,y,d){
  const b=at(x,y),mine=G.mine;
  if(b){
    if(b.t==='junction')return true;
    if(b.t!=='belt')return false;
    if(mine&&!mine.has(b.id)&&(b.d&1)!==(d&1)){
      if(!canAfford(B.junction.cost)){showToast('Need '+missing(B.junction.cost)+' more for a Crossing');return false}
      removeB(b);place('junction',x,y,0);tapFx={x,y,t:.4,c:'#6fe0c0'};return true;
    }
    if(b.d!==d){b.d=d;dirty=true}
    if(mine)mine.add(b.id);return true;
  }
  const r=place('belt',x,y,d);
  if(r==='cost')showToast('Out of iron ingots for conveyors');
  if(typeof r==='object'){if(mine)mine.add(r.id);sfx('lay');return true}
  return false;
}
function paintTo(sx,sy){
  const [tx,ty]=tileAt(sx,sy);let [lx,ly]=G.lt,guard=0;
  while((lx!==tx||ly!==ty)&&guard++<200){
    const dx=tx-lx,dy=ty-ly,d=Math.abs(dx)>=Math.abs(dy)?(dx>0?1:3):(dy>0?2:0);
    const pb=at(lx,ly);if(pb&&pb.t==='belt'&&pb.d!==d&&G.mine&&G.mine.has(pb.id)){pb.d=d;dirty=true}
    lx+=DIRS[d][0];ly+=DIRS[d][1];ensureBelt(lx,ly,d);
    if(d!==rot)syncRot(d);
  }
  G.lt=[lx,ly];
}
function eraseTile(x,y){const b=at(x,y);if(b&&b.t!=='core'){removeB(b);sfx('remove');tapFx={x,y,t:.4,c:'#ff7378'}}}
function eraseTo(sx,sy){
  const [tx,ty]=tileAt(sx,sy);let [lx,ly]=G.lt,guard=0;
  while((lx!==tx||ly!==ty)&&guard++<200){const dx=tx-lx,dy=ty-ly;if(Math.abs(dx)>=Math.abs(dy))lx+=Math.sign(dx);else ly+=Math.sign(dy);eraseTile(lx,ly)}
  G.lt=[lx,ly];
}
// ================= research =================
// Spare power fills a Charge bank (MJ). Research draws Charge and items from storage together; it finishes when both are paid.
// Ongoing research ("rep:<id>") can be done again and again; each level costs more and it keeps going on its own.
let RES_OPEN=false,resN=0;
function chargeCap(){let c=200;for(const b of S.bs.values())if(b.t==='capacitor'&&!b.bp)c+=B.capacitor.cap;return Math.round(c*rp('cap'))}
function repLv(k){return (S.res&&S.res.lv&&S.res.lv[k])||0}
function isRep(id){return id.startsWith('rep:')}
function techName(id){if(isRep(id)){const k=id.slice(4);return `${REPEAT[k].n} ${repLv(k)+1}`}return TECH[id].n}
function techCost(id){
  const md=1-Math.min(.5,relStat('mj')/100);
  if(!isRep(id))return{mj:Math.round(TECH[id].mj*md),items:TECH[id].items};
  const k=id.slice(4),R=REPEAT[k],n=repLv(k),set=R.sets[n%R.sets.length],m=Math.pow(R.igrow,n),items={};
  for(const i in set)items[i]=Math.max(1,Math.round(set[i]*m));
  return{mj:Math.round(R.mj*Math.pow(R.grow,n)*md),items};
}
function techOpen(N){return S.ms>=MS.length&&S.gt>=N.t-1}
function techReady(id){if(isRep(id))return S.ms>=MS.length&&!!REPEAT[id.slice(4)];const N=TECH[id];return !S.res.done[id]&&techOpen(N)&&(N.req||[]).every(r=>S.res.done[r])}
function techProg(id){return S.res.p[id]||(S.res.p[id]={c:0,it:{}})}
function techFrac(id){const C=techCost(id),p=S.res.p[id]||{c:0,it:{}};let f=Math.min(1,p.c/C.mj),n=1;for(const k in C.items){f+=Math.min(1,(p.it[k]||0)/C.items[k]);n++}return f/n}
function researchTick(){
  const id=S.res.cur;if(!id)return;if(!(isRep(id)?REPEAT[id.slice(4)]:TECH[id])||!techReady(id)){S.res.cur=null;return}
  const C=techCost(id),p=techProg(id);
  if(p.c<C.mj){const pay=Math.min(C.mj-p.c,S.charge||0);S.charge-=pay;p.c+=pay}
  const f=Math.min(1,p.c/C.mj);let done=p.c>=C.mj-1e-6;
  for(const k in C.items){const need=C.items[k],want=Math.min(need,Math.ceil(need*f))-(p.it[k]||0);if(want>0){const take=Math.min(want,Math.floor(S.inv[k]||0));if(take>0){S.inv[k]-=take;p.it[k]=(p.it[k]||0)+take}}if((p.it[k]||0)<need)done=false}
  if(done)completeTech(id);
}
function grantTech(id){const N=TECH[id];S.res.done[id]=1;(N.unl||[]).forEach(t=>{if(!S.unl.includes(t)){S.unl.push(t);S.newT.push(t)}});(N.rec||[]).forEach(k=>{if(!S.rec.includes(k))S.rec.push(k)})}
function completeTech(id){
  if(isRep(id)){const k=id.slice(4);delete S.res.p[id];S.res.lv[k]=repLv(k)+1;sfx('build');showToast(`${REPEAT[k].n} reached level ${S.res.lv[k]}. Level ${S.res.lv[k]+1} has started.`);if(RES_OPEN&&!elModal.hidden)showResearch();return}
  const N=TECH[id];grantTech(id);S.res.cur=null;delete S.res.p[id];burst(CX,CY,'#7ff0d0',40);sfx('fanfare');showBanner('Research complete · '+N.n,N.d+' Pick the next one from the top bar.');buildDock();save();if(RES_OPEN&&!elModal.hidden)showResearch();
}
// Compact research requirements for the top bar: Charge first, then each item, with short numbers
function fmtN(n){n=Math.floor(n);return n<1000?String(n):n<1e4?(n/1e3).toFixed(1).replace(/\.0$/,'')+'k':n<1e6?Math.round(n/1e3)+'k':(n/1e6).toFixed(1).replace(/\.0$/,'')+'M'}
function techHudChips(id){
  const C=techCost(id),p=S.res.p[id]||{c:0,it:{}};
  return `<span class="req${p.c>=C.mj?' done':''}">${BOLT}${fmtN(p.c)}/${fmtN(C.mj)}<i style="width:${Math.min(100,p.c/C.mj*100)}%"></i></span>`+
    Object.keys(C.items).map(k=>{const h=p.it[k]||0,n=C.items[k],have=S.inv[k]||0;return `<span class="req${h>=n?' done':h+have<n?' short':''}"><img src="${ICON[k]}" alt="${ITEMS[k].n}">${fmtN(h)}/${fmtN(n)}<i style="width:${Math.min(100,h/n*100)}%"></i></span>`}).join('');
}
function techCostChips(id){
  const C=techCost(id),p=S.res.p[id]||{c:0,it:{}};
  return `<span class="req${p.c>=C.mj?' done':''}">${BOLT}${Math.floor(p.c).toLocaleString()}/${C.mj.toLocaleString()} MJ<i style="width:${Math.min(100,p.c/C.mj*100)}%"></i></span>`+
    Object.keys(C.items).map(k=>{const h=p.it[k]||0,n=C.items[k];return `<span class="req${h>=n?' done':''}"><img src="${ICON[k]}" alt="${ITEMS[k].n}">${h.toLocaleString()}/${n.toLocaleString()}<i style="width:${h/n*100}%"></i></span>`}).join('');
}
function techCard(id,title,desc,status,cls,canGo){
  const cur=S.res.cur===id,started=!!S.res.p[id];
  return `<div class="ms ${cls}"><div class="ms-top"><h4>${title}</h4><span class="st">${status}</span></div><div class="ms-unl">${desc}</div>`+
    (cls==='done'?'':`<div class="ms-req" id="tq-${id.replace(':','_')}">${techCostChips(id)}</div>`)+
    (canGo?`<button class="btn${cur?'':' primary'}" data-tech="${id}">${cur?'Pause':started?'Resume':'Research'}</button>`:'')+`</div>`;
}
function showResearch(){
  const tiers=[...new Set(Object.values(TECH).map(N=>N.t))].sort((a,b)=>a-b),open=S.ms>=MS.length;
  let h=`<div class="card-head"><h3>Research</h3><button class="x" data-close aria-label="Close">${SVG.x}</button></div>
  <div class="ms cur"><div class="ms-top"><h4>Charge</h4><span class="st" id="rsRate"></span></div><div class="meter"><b id="rsBar"></b></div><div class="ms-unl" id="rsCharge"></div></div>
  <p>Research spends stored Charge and items from storage. Spare power refills Charge, so a bigger grid researches faster. Progress is kept if you switch.</p><div class="ms-list">`;
  if(!open)h+='<p><strong>Research opens with the Grid Charter milestone.</strong></p>';
  h+=`<div class="sec-label">Ongoing · repeats on its own, every level stronger</div>`;
  for(const k in REPEAT){const R=REPEAT[k],id='rep:'+k,lv=repLv(k);h+=techCard(id,`${R.n} · level ${lv}`,R.d,S.res.cur===id?`Researching level ${lv+1}`:`Next: level ${lv+1}`,S.res.cur===id?'cur':open?'':'future',open)}
  for(const t of tiers){
    const gate=t>1?rung(t-2):null,topen=open&&S.gt>=t-1;
    h+=`<div class="sec-label">Tier ${t}${topen||!gate?'':` · opens at ${gate.n}, ${fmtW(gate.kw)} sustained`}</div>`;
    for(const id in TECH){const N=TECH[id];if(N.t!==t)continue;
      const done=S.res.done[id],cur=S.res.cur===id,ready=techReady(id),miss=(N.req||[]).filter(r=>!S.res.done[r]).map(r=>TECH[r].n);
      h+=techCard(id,N.n,N.d+(miss.length&&!done?` <b>Needs ${miss.join(', ')}.</b>`:''),done?'Done':cur?'Researching':ready?(S.res.p[id]?'Paused':'Available'):'Locked',done?'done':cur?'cur':ready?'':'future',ready&&!done);
    }
  }
  openModal(h+'</div>');RES_OPEN=true;updateResearch();
}
function updateResearch(){
  const a=$('#rsCharge');if(!a)return;const cap=chargeCap(),rate=Math.max(0,PW.gen-PW.demand)/1000;
  a.textContent=`${Math.floor(S.charge||0).toLocaleString()} of ${cap.toLocaleString()} MJ stored`;
  $('#rsRate').textContent=S.ms>=MS.length?`+${rate.toFixed(2)} MJ/s spare`:'';$('#rsBar').style.width=Math.min(100,(S.charge||0)/cap*100)+'%';
  if(S.res.cur){const q=$('#tq-'+S.res.cur.replace(':','_'));if(q)q.innerHTML=techCostChips(S.res.cur)}
}

// ================= offline progress =================
// While you're away the factory earns a share of what it was delivering to the Core, without using ore or fuel.
let AWAY=null,LAUNCHED=0;
function offEff(){return Math.min(1,.2+.1*((S.up&&S.up.night)||0)+relStat('off')/100)}
function offCapH(){return 8+4*((S.up&&S.up.haul)||0)+relStat('haul')}
function trackRates(d){
  // rolling ~3 minute average of deliveries to the Core and of spare power, per game-second
  const a=1/180;S.dr=S.dr||{};
  for(const k of new Set([...Object.keys(S.dr),...Object.keys(d)])){const v=(S.dr[k]||0)*(1-a)+(d[k]||0)*a;if(v<1e-4)delete S.dr[k];else S.dr[k]=v}
  S.lr=(S.lr||0)*(1-a)+LAUNCHED*a;LAUNCHED=0;if(S.lr<1e-5)S.lr=0;
  S.dch=(S.dch||0)*(1-a)+(S.ms>=MS.length?Math.max(0,PW.gen-PW.demand)/1000:0)*a;
}
function fmtAway(s){s=Math.round(s);const h=Math.floor(s/3600),m=Math.round(s%3600/60);return h?`${h}h ${m}m`:`${m} min`}
function grantOffline(sec){
  if(!S||sec<60||!isCamp())return;
  const t=Math.min(sec,offCapH()*3600),e=offEff(),got={};let any=false;
  for(const k in (S.dr||{})){const n=Math.floor(S.dr[k]*t*e);if(n>0){addInv(k,n);got[k]=n;any=true}}
  let ch=0;if(S.ms>=MS.length&&S.dch>0){ch=Math.max(0,Math.min(chargeCap()-(S.charge||0),S.dch*t*e));S.charge=(S.charge||0)+ch;if(ch>=1)any=true}
  // Launch Rings keep flinging petals at the same share of their recent rate
  let pl=0,cg=0;if(S.lr>0){pl=Math.floor(S.lr*t*e);if(pl>0){const c0=constN(S.petals);S.petals+=pl;cg=constN(S.petals)-c0;any=true;
    const m=MS[S.ms];if(m&&m.launch){S.prog.petal=Math.min(PET_GOAL,(S.prog.petal||0)+pl);checkMs()}}}
  if(!any)return;
  const keys=ITEM_ORDER.filter(k=>got[k]);
  openModal(`<span class="eyebrow">Welcome back</span><h1>Your factory kept going</h1>
  <p>You were away <strong>${fmtAway(sec)}</strong>. It ran at <strong>${Math.round(e*100)}%</strong> while you were gone, without using up ore or fuel.${sec>t?` Offline time counts up to ${offCapH()} hours; Long haul raises that.`:''}</p>
  <div class="ms-req">${keys.map(k=>`<span class="req done"><img src="${ICON[k]}" alt="${ITEMS[k].n}">+${got[k].toLocaleString()}</span>`).join('')}${ch>=1?`<span class="req done">${BOLT}+${Math.floor(ch).toLocaleString()} MJ</span>`:''}</div>
  ${pl>0?`<p><strong>${pl.toLocaleString()}</strong> sail petal${pl===1?' was':'s were'} launched into orbit (${S.petals.toLocaleString()} now).${cg>0?` <strong>${cg===1?'A Constellation':cg+' Constellations'}</strong> completed: +${cg} Commander point${cg===1?'':'s'} in Menu → Commander.`:''}</p>`:''}
  <button class="btn primary" data-close>Collect</button>`);
  hudTick(true);save();
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){AWAY=Date.now()}else if(AWAY){const s=(Date.now()-AWAY)/1000;AWAY=null;grantOffline(s)}});

// ================= production stats, save codes, minimap =================
// Counts are kept per game-second for the last minute; power is sampled every 5 seconds for the last 10 minutes.
const STAT={acc:0,pacc:0,cur:{p:{},c:{},d:{}},hist:[],pw:[]};
let STATS_OPEN=false,bneck=true;try{bneck=localStorage.getItem('halo-foundry-bneck')!=='0'}catch(_){}
function stat(k,t,n){STAT.cur[k][t]=(STAT.cur[k][t]||0)+(n||1)}
function statTick(dt){
  STAT.acc+=dt;STAT.pacc+=dt;
  if(STAT.acc>=1){STAT.acc-=1;trackRates(STAT.cur.d);STAT.hist.push(STAT.cur);if(STAT.hist.length>60)STAT.hist.shift();STAT.cur={p:{},c:{},d:{}};
    for(const b of S.bs.values())if(b.t==='belt'){b.rate=(b.rate||0)*.6+(b.fc||0)*.4;b.fc=0}}
  if(STAT.pacc>=5){STAT.pacc-=5;STAT.pw.push([PW.gen,PW.demand,PW.cap]);if(STAT.pw.length>120)STAT.pw.shift()}
}
function rates(){const n=Math.max(1,STAT.hist.length),m=60/n,a={};for(const h of STAT.hist)for(const k of ['p','c','d'])for(const t in h[k]){(a[t]=a[t]||{p:0,c:0,d:0})[k]+=h[k][t]}for(const t in a)for(const k of ['p','c','d'])a[t][k]*=m;return a}
function fmtDur(s){if(!isFinite(s))return 'forever';s=Math.round(s);if(s>=3600)return `${Math.floor(s/3600)}h ${Math.round(s%3600/60)}m`;if(s>=60)return `${Math.floor(s/60)}m ${s%60}s`;return s+'s'}
function showStats(){
  openModal(`<div class="card-head"><h3>Production</h3><button class="x" data-close aria-label="Close">${SVG.x}</button></div>
  <div class="sec-label">Power · last 10 minutes</div><canvas id="pwChart" width="800" height="300" style="width:100%;height:auto;display:block"></canvas>
  <div class="legend"><span><i style="background:#f3c25a"></i>Generated</span><span><i style="background:#ff8fb6"></i>Used</span><span><i style="background:#6fe0c0"></i>Available</span></div>
  <div class="sec-label" id="stLabel">Items per minute</div><div class="stbl" id="stBody"></div>`);
  STATS_OPEN=true;updateStats();
}
function updateStats(){
  const a=rates(),keys=ITEM_ORDER.filter(k=>a[k]&&(a[k].p||a[k].c||a[k].d)),f=v=>v?(v>=100?Math.round(v).toLocaleString():v.toFixed(1)):'·';
  $('#stLabel').textContent=`Items per minute · last ${STAT.hist.length} s of game time`;
  $('#stBody').innerHTML=`<div class="sr sh"><span>Item</span><span>Made</span><span>Used</span><span>To Core</span></div>`+(keys.length?keys.map(k=>`<div class="sr"><span><img src="${ICON[k]}" alt="">${ITEMS[k].n}</span><span>${f(a[k].p)}</span><span>${f(a[k].c)}</span><span>${f(a[k].d)}</span></div>`).join(''):'<p>Nothing has been made in the last minute.</p>');
  const c=$('#pwChart');if(!c)return;const g=c.getContext('2d'),Wc=c.width,Hc=c.height,P={l:84,r:12,t:14,b:34},pw=STAT.pw;
  g.clearRect(0,0,Wc,Hc);g.font='22px '+getComputedStyle(document.body).fontFamily;g.fillStyle='#b5b0d4';
  if(pw.length<2){g.fillText('Collecting data… check back in a few seconds.',P.l,Hc/2);return}
  const mx=Math.max(1,...pw.map(q=>Math.max(q[0],q[1],q[2])))*1.12,X=i=>P.l+(Wc-P.l-P.r)*i/119,Y=v=>Hc-P.b-(Hc-P.t-P.b)*v/mx,off=120-pw.length;
  g.strokeStyle='rgba(185,175,245,.18)';g.lineWidth=1;for(let i=0;i<=4;i++){const y=Y(mx*i/4);g.beginPath();g.moveTo(P.l,y);g.lineTo(Wc-P.r,y);g.stroke();g.textAlign='right';g.fillText(fmtW(mx*i/4),P.l-10,y+7)}
  g.textAlign='left';g.fillText('10 min ago',P.l,Hc-6);g.textAlign='right';g.fillText('now',Wc-P.r,Hc-6);g.textAlign='left';
  const line=(k,col,w,dash)=>{g.beginPath();pw.forEach((q,i)=>i?g.lineTo(X(i+off),Y(q[k])):g.moveTo(X(i+off),Y(q[k])));g.strokeStyle=col;g.lineWidth=w;g.setLineDash(dash||[]);g.stroke();g.setLineDash([])};
  g.beginPath();pw.forEach((q,i)=>i?g.lineTo(X(i+off),Y(q[0])):g.moveTo(X(i+off),Y(q[0])));g.lineTo(X(pw.length-1+off),Y(0));g.lineTo(X(off),Y(0));g.closePath();g.fillStyle='rgba(243,194,90,.14)';g.fill();
  line(2,'#6fe0c0',3,[10,8]);line(1,'#ff8fb6',3);line(0,'#f3c25a',4);
  const last=pw[pw.length-1];g.fillStyle='#f3c25a';g.beginPath();g.arc(X(pw.length-1+off),Y(last[0]),7,0,7);g.fill();
}
function badOf(b){
  if(b.bp)return null;
  switch(b.t){
    case 'drill':case 'deepdrill':return b.dep||b.out>=drillCap(b)?'block':null;
    case 'smelter':case 'foundry':return b.run?null:b.outN>=(b.t==='foundry'?16:4)?'block':!b.inN?'starve':null;
    case 'fab':case 'fab2':case 'assembler':{if(!b.rec||b.run)return null;const r=RECIPES[b.rec];return b.outN+r.out>Math.max(4,r.out*2)?'block':'starve'}
    case 'refinery':return b.outN>=2?'block':null;
    case 'combustor':case 'turbine':case 'reactor':return !b.fuel&&b.energy<=0?'starve':null;
  }
  return null;
}
async function encodeSave(){
  const json=JSON.stringify(serialize());
  const b64=u=>{let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s)};
  if(window.CompressionStream){try{const st=new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));return 'HF2:'+b64(new Uint8Array(await new Response(st).arrayBuffer()))}catch(_){}}
  return 'HF1:'+b64(new TextEncoder().encode(json));
}
async function decodeSave(code){
  code=code.trim();const raw=atob(code.slice(4)),u=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)u[i]=raw.charCodeAt(i);
  if(code.startsWith('HF2:')){const st=new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'));return JSON.parse(await new Response(st).text())}
  if(code.startsWith('HF1:'))return JSON.parse(new TextDecoder().decode(u));
  throw new Error('bad');
}
function showSaveCode(){
  openModal(`<div class="card-head"><h3>Save code</h3><button class="x" data-close aria-label="Close">${SVG.x}</button></div>
  <p>Copy this code to carry your game to another device, the offline file, or another browser.</p>
  <textarea id="codeOut" class="code" rows="4" readonly>Making your code…</textarea>
  <button class="btn primary" data-copycode>Copy code</button>
  <div class="sec-label">Load a game</div>
  <textarea id="codeIn" class="code" rows="4" placeholder="Paste a save code here"></textarea>
  <button class="btn danger" data-loadcode>Load this game</button><p id="codeMsg" style="font-size:14px">Loading replaces the game on this device.</p>`);
  encodeSave().then(c=>{const o=$('#codeOut');if(o)o.value=c});
}
function showMap(){
  const L=mapLim(),lo=192-L,n=2*L;
  openModal(`<div class="card-head"><h3>Map</h3><button class="x" data-close aria-label="Close">${SVG.x}</button></div><canvas id="mm" width="${n}" height="${n}"></canvas><p>Tap anywhere to jump there. The teal box is your current view.</p>`);
  const c=$('#mm'),g=c.getContext('2d'),img=g.createImageData(n,n),d=img.data,hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  const OC={1:hex('#c0643a'),2:hex('#2fae8a'),3:hex('#aea5d8'),4:hex('#6a5e96')},ground=hex(BI().base),spent=hex(BI().spent),core=hex('#f3c25a'),cache={};
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=(lo+y)*W+lo+x,id=S.grid[i];let col;
    if(id){const b=S.bs.get(id);col=b.t==='core'?core:(cache[b.t]=cache[b.t]||hex(BP_COL[b.t]||'#8c82c8'))}else col=ORE[i]?OC[ORE[i]]:RES0[i]>0?spent:ground;
    const k=(y*n+x)*4;d[k]=col[0];d[k+1]=col[1];d[k+2]=col[2];d[k+3]=255}
  g.putImageData(img,0,0);
  const vw=VW/cam.z,vh=VH/cam.z;g.strokeStyle='#7ff0d0';g.lineWidth=Math.max(1,n/160);g.strokeRect(cam.x-vw/2-lo,cam.y-vh/2-lo,vw,vh);
  c.addEventListener('click',e=>{const r=c.getBoundingClientRect();cam.x=lo+(e.clientX-r.left)/r.width*n;cam.y=lo+(e.clientY-r.top)/r.height*n;clampCam();closeModal();sfx('tick')});
}

// ================= selection, copy/paste, blueprints, conveyor routing =================
let SELB=null,PASTE=null,ROUTE=null,CLIP=null;
let beltMode='line';try{beltMode=localStorage.getItem('halo-foundry-beltmode')||'line'}catch(_){}
const BELT_MODES={
  line:{n:'Line',d:'Drag to lay one straight line of conveyor.'},
  route:{n:'Route',d:'Tap where the line starts, then where it ends. It finds a way around buildings and adds Crossings.'},
  free:{n:'Free',d:'Drag and the conveyor follows your finger, turning with it.'}
};
function lineTiles(a,b){const dx=b[0]-a[0],dy=b[1]-a[1],h=Math.abs(dx)>=Math.abs(dy),n=h?Math.abs(dx):Math.abs(dy),d=h?(dx>=0?1:3):(dy>=0?2:0),o=[];for(let i=0;i<=n;i++)o.push([a[0]+DIRS[d][0]*i,a[1]+DIRS[d][1]*i,d]);return o}
function layTiles(tiles){
  if(!tiles.length)return 0;
  G.mine=new Set();G.stroke=[];let n=0;
  const s0=at(tiles[0][0],tiles[0][1]);if(s0&&s0.t==='belt')G.mine.add(s0.id);
  for(const [x,y,d] of tiles){if(ensureBelt(x,y,d))n++;else{const q=at(x,y);if(!q||q.t==='belt')break}}
  flushStroke();G.mine=null;syncRot(tiles[tiles.length-1][2]);return n;
}
// Shortest conveyor route that prefers straight runs, avoids buildings and crosses other lines when it must
function routePath(a,b){
  const [ax,ay]=a,[bx,by]=b,gq=at(bx,by),goalB=gq&&gq.t!=='belt'&&gq.t!=='junction'?gq:null;
  const pad=18,x0=Math.max(0,Math.min(ax,bx)-pad),y0=Math.max(0,Math.min(ay,by)-pad),x1=Math.min(W-1,Math.max(ax,bx)+pad),y1=Math.min(H-1,Math.max(ay,by)+pad),bw=x1-x0+1,N=bw*(y1-y0+1)*4;
  const dist=new Float64Array(N).fill(Infinity),prev=new Int32Array(N).fill(-1),heap=[];
  const id=(x,y,d)=>((y-y0)*bw+(x-x0))*4+d;
  const push=(c,i)=>{heap.push([c,i]);let k=heap.length-1;while(k>0){const p=(k-1)>>1;if(heap[p][0]<=heap[k][0])break;[heap[p],heap[k]]=[heap[k],heap[p]];k=p}};
  const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===k)break;[heap[m],heap[k]]=[heap[k],heap[m]];k=m}}return top};
  const cost=(x,y,d)=>{if(!inLim(x,y))return -1;const q=at(x,y);if(!q)return 0;if(goalB&&q===goalB)return 0;if(q.t==='junction')return 2;if(q.t==='belt'&&!q.bp&&(q.d&1)!==(d&1))return 8;return -1};
  for(let d=0;d<4;d++){const i=id(ax,ay,d);dist[i]=0;push(0,i)}
  let goal=-1,pops=0;
  while(heap.length&&pops++<300000){
    const [c,i]=pop();if(c>dist[i])continue;const d=i&3,cell=i>>2,x=cell%bw+x0,y=((cell/bw)|0)+y0;
    if(goalB?at(x,y)===goalB:(x===bx&&y===by)){goal=i;break}
    for(let k=0;k<4;k++){
      if(k===opp(d)&&!(x===ax&&y===ay))continue;const nx=x+DIRS[k][0],ny=y+DIRS[k][1];if(nx<x0||ny<y0||nx>x1||ny>y1)continue;
      const tc=cost(nx,ny,k);if(tc<0)continue;const nc=c+10+tc+(k!==d?4:0),j=id(nx,ny,k);if(nc<dist[j]){dist[j]=nc;prev[j]=i;push(nc,j)}
    }
  }
  if(goal<0)return null;
  const cells=[];for(let i=goal;i>=0;i=prev[i]){const cell=i>>2;cells.push([cell%bw+x0,((cell/bw)|0)+y0,i&3])}cells.reverse();
  const out=cells.map((c0,j)=>[c0[0],c0[1],j+1<cells.length?cells[j+1][2]:c0[2]]);
  if(goalB)out.pop();
  return out;
}
function routeTap(x,y){
  if(!ROUTE){
    let s=[x,y];const q=at(x,y);
    if(q&&q.t!=='belt'&&q.t!=='junction'){if(!B[q.t].dir||q.t==='core'){showToast('Start on open ground, a conveyor, or a machine');sfx('err');return}s=outTile(q,q.d);const o=at(s[0],s[1]);if(o&&o.t!=='belt'&&o.t!=='junction'){showToast('That machine’s output is blocked');sfx('err');return}}
    ROUTE={a:s};tipOverride='Now tap where the conveyor should end. Tap the start again to cancel.';tipUntil=performance.now()+9000;sfx('tick');hudTick(true);return;
  }
  if(x===ROUTE.a[0]&&y===ROUTE.a[1]){ROUTE=null;tipUntil=0;showToast('Route cancelled');return}
  const path=routePath(ROUTE.a,[x,y]);ROUTE=null;tipUntil=0;
  if(!path||!path.length){sfx('err');showToast('No clear route there. Try a closer end point.');return}
  const n=layTiles(path);sfx(n?'place':'err');if(n<path.length)showToast(`Laid ${n} of ${path.length} conveyors`);hudTick(true);
}
function setRecipe(b,k){if(b.rec===k)return;for(const q in b.buf)addInv(q,b.buf[q]);if(b.rec&&b.outN)addInv(b.rec,b.outN);if(b.run)for(const q in RECIPES[b.rec].in)addInv(q,RECIPES[b.rec].in[q]);b.rec=k;b.buf={};b.outN=0;b.run=false;b.prog=0}
function batUnq(b){(b.q||[]).forEach(a=>a.forEach(t=>b.st[t]=(b.st[t]||0)+1));b.q=[[],[]]}
function setRatio(b,k){batUnq(b);b.ratio=Object.assign({},RECIPES[k].in);for(const q in b.st)if(!b.ratio[q]&&b.st[q]>0){addInv(q,b.st[q]);b.st[q]=0}}
function selectRect(a,b){
  const x0=Math.min(a[0],b[0]),x1=Math.max(a[0],b[0]),y0=Math.min(a[1],b[1]),y1=Math.max(a[1],b[1]),ids=[];
  for(const q of S.bs.values())if(q.t!=='core'&&q.x>=x0&&q.y>=y0&&q.x+q.w-1<=x1&&q.y+q.w-1<=y1)ids.push(q.id);
  if(!ids.length){SELB=null;closeSheet();showToast('Nothing inside that box');return}
  SELB=ids;openSelSheet();sfx('tick');
}
function openSelSheet(){
  sel=null;const bs=SELB.map(id=>S.bs.get(id)).filter(Boolean),cnt={};bs.forEach(q=>cnt[q.t]=(cnt[q.t]||0)+1);
  const n=t=>bs.filter(q=>q.t===t).length,fr=S.rec.filter(k=>!RECIPES[k].at),ar=S.rec.filter(k=>RECIPES[k].at==='asm');
  const recBtns=(list,kind)=>`<div class="grid">${list.map(k=>`<button class="opt sm" data-srec="${k}" data-kind="${kind}"><img src="${ICON[k]}" alt=""><span class="t"><b>${ITEMS[k].n}</b><small>${Object.keys(RECIPES[k].in).map(i=>RECIPES[k].in[i]+' '+ITEMS[i].s).join(' + ')}</small></span></button>`).join('')}</div>`;
  const grp=(t,list,label)=>n(t)&&list.length?`<div class="sec-label">${label} for ${n(t)} ${B[t].n}${n(t)>1?'s':''}</div>${recBtns(list,t)}`:'';
  elSheet.innerHTML=`<div class="sh-head"><div class="sh-title"><h2>Selection</h2><span class="pill ok">${bs.length} building${bs.length===1?'':'s'}</span></div><button class="x" data-sx="close" aria-label="Close">${SVG.x}</button></div>
  <div class="sh-body"><div class="flow">${Object.keys(cnt).map(t=>`<span class="chip"><img src="${ICON_B[t]}" alt="${B[t].n}">${cnt[t]}</span>`).join('')}</div>
  <div class="actions"><button class="btn primary" data-sx="copy">Copy</button><button class="btn" data-sx="save">Save blueprint</button></div>
  ${grp('fab',fr,'Recipe')}${grp('fab2',fr,'Recipe')}${grp('assembler',ar,'Recipe')}${grp('batcher',S.rec,'Ratio')}
  <div class="actions"><button class="btn danger" data-sx="del">${SVG.trash}Remove all</button></div></div>`;
  elSheet.hidden=false;
}
elSheet.addEventListener('click',e=>{
  const el=e.target.closest('button');if(!el||!SELB)return;const bs=SELB.map(id=>S.bs.get(id)).filter(Boolean);
  if(el.dataset.sx==='close')closeSheet();
  else if(el.dataset.sx==='copy'){CLIP=captureLayout(bs);startPaste(CLIP)}
  else if(el.dataset.sx==='save')saveBlueprint(captureLayout(bs));
  else if(el.dataset.sx==='del'){if(Date.now()-(el._arm||0)<3000){bs.forEach(q=>removeB(q));sfx('remove');showToast(`Removed ${bs.length}, cost refunded`);closeSheet()}else{el._arm=Date.now();el.innerHTML=SVG.trash+'Tap again to remove'}}
  else if(el.dataset.srec){const k=el.dataset.srec,kind=el.dataset.kind;let c=0;bs.forEach(q=>{if(q.t!==kind)return;if(kind==='batcher')setRatio(q,k);else setRecipe(q,k);c++});sfx('tick');showToast(`${ITEMS[k].n} set on ${c} ${B[kind].n}${c>1?'s':''}`)}
});
function captureLayout(bs){
  bs=bs.filter(q=>q&&q.t!=='core');let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  bs.forEach(q=>{x0=Math.min(x0,q.x);y0=Math.min(y0,q.y);x1=Math.max(x1,q.x+q.w);y1=Math.max(y1,q.y+q.w)});
  return{w:x1-x0,h:y1-y0,items:bs.map(q=>({t:q.t,dx:q.x-x0,dy:q.y-y0,d:q.d,w:q.w,rec:q.rec||null,filter:q.filter||null,sd:q.sd||0,pri:q.pri!=null?q.pri:null,ratio:q.ratio&&Object.keys(q.ratio).length?Object.assign({},q.ratio):null}))};
}
function rotLayout(L){return{w:L.h,h:L.w,items:L.items.map(e=>Object.assign({},e,{dx:L.h-(e.dy+e.w),dy:e.dx,d:(e.d+1)&3}))}}
function loadBPS(){try{return JSON.parse(localStorage.getItem('halo-foundry-bps')||'[]')}catch(_){return[]}}
function storeBPS(a){try{localStorage.setItem('halo-foundry-bps',JSON.stringify(a))}catch(_){}}
function saveBlueprint(L){const a=loadBPS(),n=a.reduce((m,x)=>Math.max(m,x.no||0),0)+1;a.unshift({no:n,name:bpAutoName(L,n),L});storeBPS(a.slice(0,40));sfx('tick');closeSheet();showBpName(n,true)}
// A starting name from what the blueprint makes, e.g. "Circuits ×4" or "Smelting line"
function bpAutoName(L,n){const rec={};let sm=0,dr=0;for(const e of L.items){if(e.rec)rec[e.rec]=(rec[e.rec]||0)+1;if(e.t==='smelter'||e.t==='foundry')sm++;if(e.t==='drill'||e.t==='deepdrill')dr++}
  const ks=Object.keys(rec).sort((a,b)=>rec[b]-rec[a]);if(ks.length)return ITEMS[ks[0]].n+(rec[ks[0]]>1?' ×'+rec[ks[0]]:'')+(ks.length>1?' +'+(ks.length-1):'');
  if(sm)return 'Smelting line';if(dr)return 'Mining outpost';return 'Blueprint '+n}
function showBpName(no,fresh){const x=loadBPS().find(q=>q.no===no);if(!x)return;
  openModal(`<span class="eyebrow">${fresh?'Blueprint saved':'Rename blueprint'}</span><h1>Name it</h1><form id="bpNameForm" data-no="${no}"><input id="bpNameIn" maxlength="40" autocomplete="off" value="${escAttr(x.name)}" style="width:100%;min-height:46px;border-radius:12px;border:1px solid var(--line);background:var(--raise);color:var(--text);padding:0 12px;font:inherit;font-size:16px"><div class="actions"><button type="button" class="btn" data-bplist>Skip</button><button type="submit" class="btn primary">Save name</button></div></form><p style="font-size:14px">Find it under Blueprints in the toolbar.</p>`);
  setTimeout(()=>{const i=$('#bpNameIn');if(i){i.focus();i.select()}},50)}
function escAttr(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
function escHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
// What's inside: buildings with counts, recipes set, sorter filters, batcher ratios, and the cost to place it
function bpContents(L){
  const bc={},rec={},filt={},rat=[];
  for(const e of L.items){bc[e.t]=(bc[e.t]||0)+1;if(e.rec)rec[e.rec]=(rec[e.rec]||0)+1;if(e.t==='sorter'&&e.filter)filt[e.filter]=1;if(e.t==='batcher'&&e.ratio)rat.push(e.ratio)}
  const conv=(bc.belt||0)+(bc.junction||0),order=TOOLS.filter(t=>bc[t]&&t!=='belt'&&t!=='junction');
  const lock=order.filter(t=>!isUnl(t));
  const bchip=t=>`<span class="chip${isUnl(t)?'':' lockchip'}" title="${B[t].n}"><img src="${ICON_B[t]}" alt="${B[t].n}">${bc[t]}<span class="cn">${B[t].n}</span></span>`;
  let h=`<div class="bprow">${order.map(bchip).join('')}${conv?`<span class="chip" title="Conveyors and crossings"><img src="${ICON_B.belt}" alt="Conveyors">${conv}<span class="cn">Conveyors</span></span>`:''}</div>`;
  const rk=Object.keys(rec);if(rk.length)h+=`<div class="bprow"><span class="lbl">Makes</span>${rk.map(k=>chip(k,'×'+rec[k])).join('')}</div>`;
  const fk=Object.keys(filt);if(fk.length)h+=`<div class="bprow"><span class="lbl">Sorts</span>${fk.map(k=>chip(k,'')).join('')}</div>`;
  if(rat.length)h+=`<div class="bprow"><span class="lbl">Batches</span>${rat.slice(0,3).map(r=>Object.keys(r).map(k=>chip(k,r[k])).join('')).join('<span class="lbl">·</span>')}</div>`;
  const c=layoutCost(L),ok=canAfford(c);
  h+=`<div class="bprow"><span class="lbl">Cost</span>${Object.keys(c).map(k=>`<span class="chip${(S.inv[k]||0)>=c[k]?'':' short'}"><img src="${ICON[k]}" alt="${ITEMS[k].n}">${fmtN(c[k])}</span>`).join('')}</div>`;
  if(lock.length)h+=`<p class="bpwarn">Not unlocked yet: ${lock.map(t=>B[t].n).join(', ')}. Those pieces will be skipped.</p>`;
  else if(!ok)h+=`<p class="bpwarn">Not enough in storage to place all of it right now.</p>`;
  return h;
}
const BP_COL={foundry:'#ff7a45',fab2:'#b0a6f0',filmarray:'#3d5ac0',capacitor:'#7ff0d0',belt:'#6d66a0',junction:'#9890c8',drill:'#e08a3c',deepdrill:'#f0a050',smelter:'#ff9a45',fab:'#9f95e6',assembler:'#c4baff',refinery:'#c99bff',reactor:'#d8b4ff',combustor:'#ff7a3a',turbine:'#ff8a45',solar:'#5a74d0',collector:'#a6dcff',splitter:'#f3c25a',sorter:'#f3c25a',batcher:'#f3c25a',uplink:'#62d8ff',relay:'#7ff0d0',ring:'#ffd77a'};
function bpThumb(L){
  const cs=Math.max(3,Math.min(12,Math.floor(240/Math.max(L.w,L.h,1)))),c=document.createElement('canvas');c.width=L.w*cs+8;c.height=L.h*cs+8;const g=c.getContext('2d');
  g.fillStyle='#262342';g.fillRect(0,0,c.width,c.height);
  for(const e of L.items){const x=4+e.dx*cs,y=4+e.dy*cs,s=e.w*cs;g.fillStyle=BP_COL[e.t]||'#7d75b4';
    if(e.t==='belt'){const v=DIRS[e.d];g.fillRect(x+cs*.3,y+cs*.3,cs*.4,cs*.4);g.fillRect(x+cs*.5+v[0]*cs*.25-cs*.15,y+cs*.5+v[1]*cs*.25-cs*.15,cs*.3,cs*.3)}else{g.fillRect(x+.5,y+.5,s-1,s-1);const it=e.rec||(e.t==='sorter'&&e.filter);if(it&&SPR[it]&&s>=8){const q=Math.max(6,s*.8);g.drawImage(SPR[it],x+s/2-q/2,y+s/2-q/2,q,q)}}}
  return c.toDataURL();
}
function showBlueprints(){
  const a=loadBPS();
  const card=(title,L,btns)=>`<div class="ms"><div class="ms-top"><h4>${title}</h4><span class="st">${L.w}×${L.h} tiles</span></div><img class="bpimg" src="${bpThumb(L)}" alt="">${bpContents(L)}<div class="actions">${btns}</div></div>`;
  openModal(`<div class="card-head"><h3>Blueprints</h3><button class="x" data-close aria-label="Close">${SVG.x}</button></div><div class="ms-list">
  ${CLIP?card('Clipboard',CLIP,'<button class="btn primary" data-bpclip>Paste</button>'):''}
  ${a.length?a.map((x,i)=>card(escHtml(x.name),x.L,`<button class="btn primary" data-bpuse="${i}">Place</button><button class="btn" data-bpren="${x.no}">Rename</button><button class="btn danger" data-bpdel="${i}">Delete</button>`)).join(''):'<p>No saved blueprints yet. Pick <strong>Select</strong>, drag a box around buildings, then tap <strong>Save blueprint</strong>.</p>'}</div>`);
}
function startPaste(L){PASTE={L:JSON.parse(JSON.stringify(L)),ax:null,ay:null};closeModal();closeSheet();tool='paste';ROUTE=null;buildDock();updateRot();hudTick(true);showToast('Tap where it should go, then tap Place')}
function layoutCost(L){const c={},cnt={};for(const e of L.items){const k=costOf(e.t,countOf(e.t)+(cnt[e.t]||0));cnt[e.t]=(cnt[e.t]||0)+1;for(const i in k)c[i]=(c[i]||0)+k[i]}return c}
function updatePasteBar(){
  const on=tool==='paste'&&PASTE;elPB.hidden=!on;if(!on)return;
  $('#pasteInfo').textContent=PASTE.ax==null?'Tap the ground to position':costStr(layoutCost(PASTE.L));
}
function placeLayout(){
  const L=PASTE.L,ax=PASTE.ax,ay=PASTE.ay;if(ax==null){showToast('Tap the ground first to position it');return}
  let ok=0;const fail={};G.stroke=[];
  const order=[...L.items].sort((p,q)=>((p.t==='belt'||p.t==='junction')?1:0)-((q.t==='belt'||q.t==='junction')?1:0));
  for(const e of order){const r=place(e.t,ax+e.dx,ay+e.dy,e.d);if(typeof r==='object'){ok++;if(e.rec&&(e.t==='fab'||e.t==='fab2'||e.t==='assembler'))r.rec=e.rec;if(e.filter&&e.t==='sorter')r.filter=e.filter;if(e.t==='sorter'&&e.sd)r.sd=e.sd;if(e.t==='splitter'&&e.pri!=null)r.pri=e.pri;if(e.ratio&&e.t==='batcher')r.ratio=Object.assign({},e.ratio)}else fail[r]=(fail[r]||0)+1}
  flushStroke();sfx(ok?'place':'err');
  const why={banned:'not allowed',cap:'building limit',seed:'seed tile',blocked:'no room',cost:'not enough materials',ore:'no ore in reach',frontier:'beyond the frontier'};
  const sk=Object.keys(fail).map(k=>`${fail[k]} ${why[k]||k}`).join(', ');
  showToast(`Placed ${ok} of ${L.items.length}`+(sk?` · skipped: ${sk}`:''));
  PASTE.ax=null;updatePasteBar();hudTick(true);
}
const elPB=$('#pasteBar');
elPB.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!PASTE)return;const k=b.dataset.pb;
  if(k==='rot'){const cx=PASTE.ax!=null?PASTE.ax+Math.floor(PASTE.L.w/2):null,cy=PASTE.ay!=null?PASTE.ay+Math.floor(PASTE.L.h/2):null;PASTE.L=rotLayout(PASTE.L);if(cx!=null){PASTE.ax=cx-Math.floor(PASTE.L.w/2);PASTE.ay=cy-Math.floor(PASTE.L.h/2)}sfx('tick');updatePasteBar()}
  else if(k==='place')placeLayout();
  else if(k==='cancel')setTool('inspect');
});
function drawOverlays(g,z){
  if(G.m==='line'&&G.a&&G.b){
    const tl=lineTiles(G.a,G.b),bl=tl.map(([x,y,d])=>[{t:'belt',x,y,d,w:1,vin:opp(d),items:[]},w2sx(x),w2sy(y)]);
    g.globalAlpha=.6;drawBeltLayer(g,bl,z,S.time);g.globalAlpha=1;
    g.strokeStyle='rgba(255,115,120,.9)';g.lineWidth=2;tl.forEach(([x,y])=>{const q=at(x,y);if((q&&q.t!=='belt'&&q.t!=='junction')||!inLim(x,y))g.strokeRect(w2sx(x)+1,w2sy(y)+1,z-2,z-2)});
    const e=tl[tl.length-1];g.font='600 13px '+getComputedStyle(document.body).fontFamily;g.fillStyle='#ece9f7';g.fillText(String(tl.length),w2sx(e[0])+z+4,w2sy(e[1])+z*.5+4);
  }
  if(ROUTE){const [x,y]=ROUTE.a,p=2+2*Math.sin(S.time*6);g.strokeStyle='#7ff0d0';g.lineWidth=2.5;g.strokeRect(w2sx(x)-p,w2sy(y)-p,z+p*2,z+p*2)}
  if(G.m==='sel'&&G.a&&G.b){const x0=Math.min(G.a[0],G.b[0]),y0=Math.min(G.a[1],G.b[1]),w=Math.abs(G.a[0]-G.b[0])+1,h=Math.abs(G.a[1]-G.b[1])+1;g.fillStyle='rgba(127,240,208,.12)';g.fillRect(w2sx(x0),w2sy(y0),w*z,h*z);g.save();g.setLineDash([6,4]);g.strokeStyle='rgba(127,240,208,.9)';g.lineWidth=1.5;g.strokeRect(w2sx(x0),w2sy(y0),w*z,h*z);g.restore()}
  if(SELB){g.strokeStyle='rgba(127,240,208,.9)';g.lineWidth=2;for(const id of SELB){const q=S.bs.get(id);if(q)g.strokeRect(w2sx(q.x)+1,w2sy(q.y)+1,q.w*z-2,q.w*z-2)}}
  if(tool==='paste'&&PASTE){
    const L=PASTE.L,ax=PASTE.ax!=null?PASTE.ax:(hover?hover[0]-Math.floor(L.w/2):null),ay=PASTE.ay!=null?PASTE.ay:(hover?hover[1]-Math.floor(L.h/2):null);
    if(ax!=null){
      const bl=[],sv=GL;GL=[];g.globalAlpha=.55;
      for(const e of L.items){const X=ax+e.dx,Y=ay+e.dy,fake=Object.assign({t:e.t,x:X,y:Y,d:e.d,w:e.w},init(e.t),{ore:oreAt(X,Y)||'ferrite',vin:opp(e.d),rec:e.rec||null,heat:0,items:[]});if(e.t==='belt')bl.push([fake,w2sx(X),w2sy(Y)]);else drawMachine(g,fake,w2sx(X),w2sy(Y),z)}
      if(bl.length)drawBeltLayer(g,bl,z,0);g.globalAlpha=1;GL=sv;
      g.strokeStyle='rgba(255,115,120,.9)';g.lineWidth=2;
      for(const e of L.items){let ok=true;for(let j=0;j<e.w;j++)for(let i=0;i<e.w;i++){const xx=ax+e.dx+i,yy=ay+e.dy+j;if(xx<0||yy<0||xx>=W||yy>=H||at(xx,yy)||!inLim(xx,yy))ok=false}if(B[e.t].r&&!drillType(ax+e.dx,ay+e.dy,drillR(e.t),B[e.t].w))ok=false;if(!ok)g.strokeRect(w2sx(ax+e.dx)+1,w2sy(ay+e.dy)+1,e.w*z-2,e.w*z-2)}
      g.save();g.setLineDash([6,5]);g.strokeStyle='rgba(127,240,208,.8)';g.lineWidth=1.5;g.strokeRect(w2sx(ax)-2,w2sy(ay)-2,L.w*z+4,L.h*z+4);g.restore();
    }
  }
}

function tap(sx,sy){
  const [x,y]=tileAt(sx,sy),b=at(x,y);
  if(tool==='paste'&&PASTE){PASTE.ax=x-Math.floor(PASTE.L.w/2);PASTE.ay=y-Math.floor(PASTE.L.h/2);updatePasteBar();sfx('tick');return}
  if(tool==='select'){if(b&&b.t!=='core'){SELB=[b.id];openSelSheet();sfx('tick')}else closeSheet();return}
  if(tool==='belt'&&beltMode==='route'){routeTap(x,y);return}
  if(tool==='inspect'){if(b)openSheet(b);else{closeSheet();const o=oreAt(x,y);if(o)showToast(ITEMS[o].n+' · about '+Math.round(RES[y*W+x]*veinMul(o))+' left on this tile')}return}
  if(tool==='remove'){if(b){if(b.t==='core')showToast('The Core stays');else{removeB(b);sfx('remove');tapFx={x,y,t:.4,c:'#ff7378'}}}return}
  if(b){
    if(b.t===tool&&B[tool].dir){b.d=(b.d+1)&3;syncRot(b.d);dirty=true;tapFx={x:b.x,y:b.y,t:.4,c:'#f3c25a'}}
    else openSheet(b);
    return;
  }
  const w=B[tool].w||1,px=x-Math.floor((w-1)/2),py=y-Math.floor((w-1)/2);
  const r=place(tool,px,py,rot);sfx(typeof r==='object'?'place':'err');
  if(r==='blocked')showToast('No room here');
  else if(r==='ore')showToast('Drills need ore within reach');
  else if(r==='banned')showToast(`${B[tool].n} can’t be used ${chal()?'in this challenge':'on this moon'}`);
  else if(r==='cap')showToast(`Building limit reached: ${chal().cap} buildings, not counting conveyors`);
  else if(r==='seed')showToast('That’s a seed tile. Nothing can be built on it, but drills next to it can mine the ore it regrows.');
  else if(r==='frontier')showToast('Beyond the frontier. Climb grid tiers to open more of the moon.');
  else if(r==='cost')showToast('Need '+missing(costOf(tool))+' more');
  else{tapFx={x,y,t:.4,c:'#f3c25a'};if(B[tool].cost&&B[tool].cost.ember){tipOverride=toolTip(tool);tipUntil=performance.now()+6000}if(w===1&&tool!=='belt'&&tool!=='solar')hudTick()}
}

// ================= save / load =================
function serialize(){
  const bs=[];for(const b of S.bs.values()){if(b.t==='core')continue;const a=[b.t,b.x,b.y,b.d];if(B[b.t].r)a.push(b.ore);if(b.t==='fab'||b.t==='fab2'||b.t==='assembler')a.push(b.rec||0);if(b.t==='sorter')a.push(b.filter||0);if(b.t==='batcher')a.push(b.bp?{r:b.ratio}:{r:b.ratio,st:b.st,q:b.q});if(b.t==='splitter')a.push(b.pri==null?-1:b.pri);if(B[b.t].burn&&!b.bp)a.push({f:b.fuel||0,e:Math.round((b.energy||0)*100)/100,m:b.ember||0});if(b.bp){while(a.length<5)a.push(0);a.push(1)}if(b.t==='sorter'&&b.sd){while(a.length<6)a.push(0);a.push(b.sd)}bs.push(a)}
  return {v:1,wv:3,refined:S.refined||0,seed:S.seed,inv:S.inv,ms:S.ms,prog:S.prog,petals:S.petals,rsh:S.res,dr:S.dr,dch:S.dch,lr:S.lr||0,savedAt:Date.now(),charge:S.charge,gt:S.gt,gavg:S.gavg,ft:S.ft||0,favg:S.favg||0,cmd:S.cmd||{},cmdBank:S.cmdBank||0,cmdSpent:S.cmdSpent||0,asc:S.asc,dd2:1,ss:S.ss||{},nup:S.nup||{},relics:S.relics||[],relicPick:S.relicPick||null,trk:S.trk||{},mode:mode(),mod:S.mod||null,ch:S.ch||null,daily:S.daily||null,dscore:S.dscore||0,dEnd:!!S.dEnd,chWon:!!S.chWon,chFail:!!S.chFail,chOffer:S.chOffer||null,chd:S.chd||{},up:S.up,time:S.time,flags:S.flags,unl:S.unl,rec:S.rec,seen:S.seen,speed,newT:S.newT,cam:{x:cam.x,y:cam.y,z:cam.z},bs,res:resDiff()};
}
function save(){try{localStorage.setItem(CUR,JSON.stringify(serialize()))}catch(_){}}
function load(){try{const s=localStorage.getItem(CUR);return s?JSON.parse(s):null}catch(_){return null}}
function start(data,forceNew){
  let d=forceNew?null:(data&&data.v?data:load());
  const seed=d?d.seed:(Math.random()*1e9|0);
  S=fresh(seed);if(d){S.mode=d.mode||'campaign';S.mod=d.mod&&MODS[d.mod]?d.mod:null;S.ch=d.ch&&CHALLENGES[d.ch]?d.ch:null;S.daily=d.daily||null}genWorld(seed);
  place('core',191,191,0,true);
  if(d){
    Object.assign(S,{inv:d.inv||{},ms:d.ms||0,prog:d.prog||{},petals:d.petals||0,gt:d.gt||0,gavg:d.gavg||0,up:d.up||{belt:0,vein:0},time:d.time||0,flags:d.flags||{del:0},unl:d.unl||S.unl,rec:d.rec||[],seen:d.seen||{},newT:d.newT||[]});
    for(let i=0;i<Math.min(S.ms,MS.length);i++){MS[i].unl.forEach(t=>{if(!S.unl.includes(t))S.unl.push(t)});MS[i].rec.forEach(k=>{if(!S.rec.includes(k))S.rec.push(k)})}
    for(let i=0;i<S.gt;i++){const q=rung(i);(q.unl||[]).forEach(t=>{if(!S.unl.includes(t))S.unl.push(t)});(q.rec||[]).forEach(k=>{if(!S.rec.includes(k))S.rec.push(k)})}
    {const R0=d.rsh&&d.rsh.done?d.rsh:d.res&&d.res.done?d.res:null;S.res=R0||{done:{},cur:null,p:{},lv:{}};S.res.p=S.res.p||{};S.res.lv=S.res.lv||{}}S.dr=d.dr||{};S.dch=d.dch||0;S.lr=+d.lr||0;S.charge=d.charge||0;S.ft=d.ft||0;S.favg=d.favg||0;S.cmd=d.cmd&&typeof d.cmd==='object'?d.cmd:{};S.cmdBank=+d.cmdBank||0;S.cmdSpent=d.cmdSpent!=null?+d.cmdSpent:cmdLevels(S.cmd);S.asc=d.asc&&typeof d.asc==='object'?d.asc:{n:0,seeds:0,total:0};const ob=(v,f)=>v&&typeof v==='object'?v:f;S.ss=ob(d.ss,{});S.nup=ob(d.nup,{});S.relics=Array.isArray(d.relics)?d.relics.filter(k=>RELICS[k]):[];S.relicPick=Array.isArray(d.relicPick)?d.relicPick:null;S.trk=ob(d.trk,{});S.dscore=+d.dscore||0;S.dEnd=!!d.dEnd;S.chWon=!!d.chWon;S.chFail=!!d.chFail;S.chOffer=Array.isArray(d.chOffer)?d.chOffer.filter(k=>RELICS[k]):null;S.chd=d.chd&&typeof d.chd==='object'?d.chd:{};refreshSeeds();
    // players who earned buildings from the old grid ladder get the matching research for free
    for(const id in TECH){const N=TECH[id];if(S.res.done[id]||(!(N.unl||[]).length&&!(N.rec||[]).length))continue;if((N.unl||[]).every(t=>S.unl.includes(t))&&(N.rec||[]).every(k=>S.rec.includes(k)))S.res.done[id]=1}
    S.refined=d.refined||0;speed=testerOK()?(d.speed||1):1;
    const OFF=d.wv?0:128,mapI=k=>OFF?(((k/128)|0)+128)*W+(k%128)+128:k;
    if(d.res)for(let i=0;i<d.res.length;i+=2){const k=mapI(d.res[i]);RES[k]=d.res[i+1];if(RES[k]<=0&&ORE[k])deplete(k)}
    const BL=(d.bs||[]).slice();if(!d.dd2)BL.sort((p,q)=>(p[0]==='deepdrill')-(q[0]==='deepdrill'));
    for(const a of BL){if(!B[a[0]])continue;let b=place(a[0],a[1]+OFF,a[2]+OFF,a[3],true,B[a[0]].r?a[4]:null);if(a[0]==='deepdrill'&&!d.dd2)for(const [ox,oy] of [[-1,0],[0,-1],[-1,-1]]){if(typeof b==='object')break;b=place(a[0],a[1]+OFF+ox,a[2]+OFF+oy,a[3],true,a[4])}if(typeof b!=='object'&&B[a[0]].cost){pay(B[a[0]].cost,1);S.flags.refunded=(S.flags.refunded||0)+1}if(typeof b==='object'){if((a[0]==='fab'||a[0]==='fab2'||a[0]==='assembler')&&a[4])b.rec=a[4];if(a[0]==='sorter'&&a[4])b.filter=a[4];if(a[0]==='sorter'&&a[6])b.sd=a[6];if(a[0]==='batcher'&&a[4]&&typeof a[4]==='object'){const X=a[4];if(X.r)b.ratio=X.r;else b.ratio=X;
      if(X.st&&typeof X.st==='object')for(const k in X.st)if(ITEMS[k]&&X.st[k]>0)b.st[k]=Math.min(50,X.st[k]|0);
      if(Array.isArray(X.q))b.q=[0,1].map(i=>Array.isArray(X.q[i])?X.q[i].filter(k=>ITEMS[k]):[])}if(a[0]==='splitter'&&typeof a[4]==='number'&&a[4]>=0&&a[5]!==1)b.pri=a[4];if(B[a[0]].burn&&a[4]&&typeof a[4]==='object'&&a[5]!==1){const F=a[4],mx=a[0]==='combustor'?8:a[0]==='turbine'?20:4;b.fuel=Math.max(0,Math.min(mx,F.f|0));b.energy=Math.max(0,+F.e||0);if(a[0]==='combustor')b.ember=Math.max(0,Math.min(5,F.m|0))}if(a[5]===1){b.bp=true;S.pq.push([b.id])}}}
    if(d.cam){cam.x=d.cam.x+OFF;cam.y=d.cam.y+OFF;cam.z=d.cam.z}
  }else{cam.x=CX;cam.y=CY;cam.z=Math.max(18,Math.min(36,Math.min(VW,VH)/20))}
  growCore();tool='inspect';sel=null;elSheet.hidden=true;recalc();dirty=false;buildDock();updateRot();hudTick(true);
  if(d&&d.savedAt&&!d.fromCode){const away=(Date.now()-d.savedAt)/1000;whenIdle(()=>grantOffline(away))}
  return !d;
}

// ================= boot =================
let lastT=performance.now(),acc=0,hudAcc=0,orAcc=0,saveAcc=0;
function frame(now){
  if(STOPPED)return;
  const rdt=Math.min(.1,(now-lastT)/1000);lastT=now;
  acc+=rdt*speed;const STEP=1/30;let n=0;
  while(acc>=STEP&&n<15){sim(STEP);acc-=STEP;n++}if(n>=15)acc=0;
  if(dirty){recalc();dirty=false}
  render(rdt);
  hudAcc+=rdt;if(hudAcc>.25){hudAcc=0;hudTick()}
  orAcc+=rdt;if(orAcc>.08){orAcc=0;drawOrrery()}
  saveAcc+=rdt;if(saveAcc>8){saveAcc=0;save()}
  requestAnimationFrame(frame);
}
// Test hook, only on a local dev server
if(/^(localhost|127\.)/.test(location.hostname))window.__hf={showTitle,saveBlueprint,captureLayout,showBlueprints,dailyToday,VAL,get META(){return META},get CUR(){return CUR},relStat,get S(){return S},place,cam,at,novaFound,doAscend,refRatio,refreshSeeds,growCore,get SEEDS(){return SEEDS},get RES(){return RES},get RES0(){return RES0},get ORE(){return ORE},dupP,veinMul,coreKW,cmdPts,drillR,setSpeed:v=>{speed=v},TECH,showResearch};
let booted=false;
function boot(data){
  if(booted)return;booted=true;
  resize();makeStars();makeSprites();makeBuildingIcons();
  const isNew=start(data);
  let seenIntro=false;try{seenIntro=!!localStorage.getItem(SAVE_KEY+'-intro')}catch(_){}
  if(isNew&&!seenIntro){showWelcome();try{localStorage.setItem(SAVE_KEY+'-intro','1')}catch(_){}}
  else showTitle();
  if(S.relicPick)whenIdle(()=>{if(S.relicPick)showRelicPick()});
  if(S.chOffer)whenIdle(showChReward);
  const sn=seenN();
  if(isNew||sn>=LATEST)markSeen();
  else setTimeout(()=>{const go=()=>{if(!elModal.hidden){setTimeout(go,1000);return}showNews(sn||LATEST-1)};go()},900);
  requestAnimationFrame(t=>{lastT=t;frame(t)});
}
window.addEventListener('resize',()=>{resize()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
window.addEventListener('pagehide',save);
window.claude?.hot?.snapshot?.(()=>S?serialize():{});
window.claude?.hot?.ready?window.claude.hot.ready(boot):boot(window.claude?.hot?.data??{});
})();

// Offline support once the game is installed from the hosted site
if('serviceWorker' in navigator&&location.protocol==='https:'){window.addEventListener('load',()=>{navigator.serviceWorker.register('./sw.js').catch(()=>{})})}
