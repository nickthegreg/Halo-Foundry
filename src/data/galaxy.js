// Galaxy map: moons in rings around the home star. Generated from a seed kept in the save (S.gal.seed).
// Ring r has 4r moons; ring 0 is home. Quadrants are sectors with a theme; bands group rings.
import {MODS} from './game.js';

export const GAL_RINGS=5;
export const QUADS=[
  {n:'Ember Reach',perk:'spd',d:'machine speed',col:'#ff9a5a'},
  {n:'Glass Expanse',perk:'pow',d:'power',col:'#7fd7ff'},
  {n:'Iron Drift',perk:'ore',d:'ore per tile',col:'#c7c2b8'},
  {n:'Void Verge',perk:'seeds',d:'Starseeds when you Ascend',col:'#c79bff'}
];
// Bands of rings; finishing every moon of a band within a quadrant earns its perk
export const BANDS=[{n:'Near',r:[1,2],p:5},{n:'Mid',r:[3,4],p:10},{n:'Far',r:[5,5],p:15}];
export const bandOf=r=>BANDS.findIndex(b=>r>=b.r[0]&&r<=b.r[1]);

export const SPECIALS={
  derelict:{n:'Derelict',d:'Wrecked machines lie scattered near the Core. Remove them to salvage their parts.',icon:'⚙'},
  bazaar:{n:'Bazaar',d:'Market clients pay double, and one more contract is open at a time.',icon:'⚖'},
  anomaly:{n:'Anomaly',d:'You get a Rare or better Relic to choose when you land.',icon:'✶'},
  storm:{n:'Storm moon',d:'Solar makes 30% less. Reach the last milestone within 4 hours of play for a Rare or better Relic and +25% Starseeds when you leave.',icon:'ϟ'}
};
export const BIAS={1:'ferrite',2:'cuprite',3:'silica',4:'carbon'};

// Modifiers that can't share a moon
const CLASH=[['rich','barren','seeded'],['longnight','eternal']];
const clash=(a,b)=>CLASH.some(g=>g.includes(a)&&g.includes(b));

function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const SYL=['ka','lo','ve','ri','sa','tu','mi','or','an','el','zu','qe','ny','ra','th','ix','os','ul','ae','di'];
function nameOf(R){const n=2+(R()<.4?1:0);let s='';for(let i=0;i<n;i++)s+=SYL[R()*SYL.length|0];return s[0].toUpperCase()+s.slice(1)+(R()<.3?' '+['II','III','IV','Prime','Minor'][R()*5|0]:'')}

export function genGalaxy(seed){
  const R=rng(seed),nodes=[{id:0,r:0,i:0,a:0,q:-1,n:'Home',mods:[],sp:null,bias:0}];
  const off=R()*.4;
  for(let r=1;r<=GAL_RINGS;r++){const m=4*r;
    for(let i=0;i<m;i++){
      const a=((i+.5)/m+off/m)*Math.PI*2,q=Math.floor((((a/(Math.PI*2))%1)+1)%1*4);
      // modifiers: ring 1–2 one (or none), ring 3+ two
      const ks=Object.keys(MODS),want=r>=3?2:(R()<.25?0:1),mods=[];
      for(let t=0;t<40&&mods.length<want;t++){const k=ks[R()*ks.length|0];if(!mods.includes(k)&&!mods.some(o=>clash(o,k)))mods.push(k)}
      let sp=null;const x=R();
      if(r>=2){if(x<.12)sp='derelict';else if(x<.2)sp='bazaar';else if(x<.28)sp='storm';else if(r>=3&&x<.34)sp='anomaly'}
      const bias=R()<.35?1+(R()*4|0):0;
      nodes.push({id:nodes.length,r,i,a,q,n:nameOf(R),mods,sp,bias});
    }
  }
  // make sure every special shows up at least once, in rings 2–4
  for(const sp of Object.keys(SPECIALS))if(!nodes.some(n=>n.sp===sp)){const c=nodes.filter(n=>n.r>=(sp==='anomaly'?3:2)&&n.r<=4&&!n.sp);if(c.length)c[R()*c.length|0].sp=sp}
  // links: ring neighbours, and each moon to the closest-angle moon one ring in
  const adj=nodes.map(()=>new Set()),link=(a,b)=>{adj[a].add(b);adj[b].add(a)};
  const ring=r=>nodes.filter(n=>n.r===r);
  for(const n of ring(1))link(0,n.id);
  for(let r=1;r<=GAL_RINGS;r++){const L=ring(r);
    for(let k=0;k<L.length;k++)link(L[k].id,L[(k+1)%L.length].id);
    if(r>1){const I=ring(r-1);for(const n of L){let best=null,bd=9;for(const o of I){let d=Math.abs(o.a-n.a);d=Math.min(d,Math.PI*2-d);if(d<bd){bd=d;best=o}}link(n.id,best.id)}}
  }
  nodes.forEach((n,k)=>n.adj=[...adj[k]]);
  return nodes;
}

// Starseed multiplier for a moon: modifiers × distance from home
export function moonSeedMul(n){let m=1+.1*Math.max(0,n.r-1);for(const k of n.mods)m*=MODS[k].seeds;return Math.round(m*100)/100}
