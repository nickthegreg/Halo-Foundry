// Candy Defense: a standalone mode opened from the main menu (testers only for now). A floating home island and a
// scatter of islets in a stormy sky. Protect your candy box and your commander, mine candy geysers with grunts,
// bridge out from islands you hold, and raise sun towers. Monsters lay bone bridges toward you as they come.
// Nothing here touches your main game's storage; your Commander levels carry in as bonuses.
import {FOES} from './data/event.js';
import {sprites,mulberry} from './defense-art.js';

const MW=64,MH=32,KEY='halo-foundry-defense',VER=2;
const DIR4=[[0,-1],[1,0],[0,1],[-1,0]];
// Tile kinds in D.land
const SKY=0,LAND=1,BRIDGE=2,HUSK=3,GEY=4,EBR=5;
const START_MONEY=1500,BOX_HP=1000,BOX_R=4.5,GEN_R=6,PREP=75,GAP=30,PULSE_V=9,CMD_BUILD=3,GEY_MAX=9;
const BUILD={
  outpost:{n:'Outpost',w:2,cost:300,hp:300,land:true,cmd:true,d:'Claims the island it stands on: Grunts can drop sugar here, and you can lay bridges from that island. Your commander builds it in person.'},
  workshop:{n:'Sun Workshop',w:3,cost:300,hp:400,land:true,cmd:true,own:true,d:'Unlocks the sun towers. Your commander builds it in person, on an island you hold.'},
  altar:{n:'Altar',w:2,cost:300,hp:300,land:true,cmd:true,own:true,d:'Your commander carries a defeated boss here to sacrifice it for a boon that lasts the rest of this island. Built by your commander.'},
  generator:{n:'Generator',w:1,cost:400,hp:120,power:true,d:'Powers everything within a large circle. Must itself be placed in power: the candy box powers a small circle around it.'},
  disc:{n:'Disc Thrower',w:2,cost:200,hp:200,power:true,range:5,dmg:6,rate:3,air:true,d:'A stone tower with a spinning arm that flings sun discs. Hits walkers and flyers.'},
  cannon:{n:'Sun Cannon',w:2,cost:500,hp:300,power:true,range:12,dmg:30,rate:.5,splash:1,d:'Fires down one of four directions and must turn to switch. Its aim widens from 1 tile at the barrel to 4 at full range. Deadly to walkers, mostly misses flyers.'}
};
const UNIT={grunt:{n:'Grunt',cost:400,hp:40,spd:1.15,carry:200}};
const CMDR={hp:300,spd:2.2,carry:300,range:3.5,dmg:8,rate:1.5};
const BOONS={
  sweet:{n:'Sugar rush',d:'+2,000 sugar right now.'},
  fortify:{n:'Fortified box',d:'Candy box +500 maximum health, fully repaired.'},
  sharpen:{n:'Sharpened sun',d:'Towers deal 25% more damage.'},
  haul:{n:'Strong backs',d:'Grunts move 30% faster and carry 50% more.'},
  champion:{n:'Champion',d:'Commander +40% damage and +50% health, fully healed.'}
};
const BITE={skeleton:4,zombie:7,bat:3,ghost:5,vampire:9,king:35};
// Sprite size in tiles for each monster
const FSIZE={skeleton:.8,zombie:.9,bat:1,ghost:.9,vampire:.95,king:1.9};
const PIECES=[[[0,0]],[[0,0],[1,0]],[[0,0],[1,0],[2,0]],[[0,0],[0,1],[1,1]],
  [[0,0],[1,0],[2,0],[3,0]],[[0,0],[0,1],[0,2],[1,2]],[[0,0],[1,0],[2,0],[1,1]],[[1,0],[2,0],[0,1],[1,1]],[[0,0],[1,0],[0,1],[1,1]],
  [[0,0],[1,0],[2,0],[3,0],[4,0]],[[0,0],[0,1],[0,2],[0,3],[1,3]],[[0,0],[1,0],[0,1],[1,1],[0,2]],[[0,0],[1,0],[2,0],[1,1],[1,2]],
  [[0,0],[2,0],[0,1],[1,1],[2,1]],[[0,0],[0,1],[0,2],[1,2],[2,2]],[[0,0],[0,1],[1,1],[1,2],[2,2]],[[0,0],[1,0],[1,1],[1,2],[2,2]],
  [[1,0],[2,0],[0,1],[1,1],[1,2]],[[1,0],[0,1],[1,1],[2,1],[1,2]],[[0,0],[0,1],[1,1],[1,2],[1,3]],[[1,0],[0,1],[1,1],[1,2],[1,3]]];
function norm(c){const mx=Math.min(...c.map(p=>p[0])),my=Math.min(...c.map(p=>p[1]));return c.map(([x,y])=>[x-mx,y-my])}
function rot(c){return norm(c.map(([x,y])=>[-y,x]))}
function randPiece(){let c=PIECES[Math.random()*PIECES.length|0];for(let k=Math.random()*4|0;k>0;k--)c=rot(c);return c}
function waveList(w){const q=[],n=6+2*w,pool=[['skeleton',5]];if(w>=2)pool.push(['zombie',3]);if(w>=3)pool.push(['bat',3]);if(w>=6)pool.push(['ghost',2]);if(w>=8)pool.push(['vampire',2]);
  const tot=pool.reduce((a,p)=>a+p[1],0);for(let i=0;i<n;i++){let r=Math.random()*tot;for(const [t,wt] of pool){r-=wt;if(r<=0){q.push(t);break}}}if(w%10===0)q.push('king');return q}

export function makeDefense(A){
  // A: {sfx(kind), toast(text), META, saveMeta(), cmdLv(key), candyFor(waves), onExit(), showCandyShop(), quiet(on)}
  let D=null,isOpen=false,el,cv,g,dpr=1,VW=0,VH=0,uiT=0,saveT=0,mode='cmd',slot=-1,hover=null,FF={},topo=0,nid=1,CONN=null,connV=-1,SRC=[];
  const cam={x:12,y:16,z:24};
  const cb=()=>({spd:1+.08*A.cmdLv('industrialist'),dmg:1+.15*A.cmdLv('stellar'),hp:1+.15*A.cmdLv('ember'),inc:1+.1*A.cmdLv('architect')});
  const idx=(x,y)=>y*MW+x,inb=(x,y)=>x>=0&&y>=0&&x<MW&&y<MH;

  // ---------- a new sky ----------
  function blob(land,isl,id,cx,cy,rad,R,sx,sy){const p=[R()*6.3,R()*6.3,R()*6.3];let n=0;
    for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const dx=(x+.5-cx)/sx,dy=(y+.5-cy)/sy,a=Math.atan2(dy,dx),d=Math.hypot(dx,dy),r=rad*(1+.14*Math.sin(2*a+p[0])+.09*Math.sin(3*a+p[1])+.06*Math.sin(5*a+p[2]));
      if(d<r&&land[idx(x,y)]===SKY){land[idx(x,y)]=LAND;isl[idx(x,y)]=id;n++}}return n}
  function fresh(){
    const seed=Math.random()*1e9|0,R=mulberry(seed),land=new Array(MW*MH).fill(SKY),isl=new Array(MW*MH).fill(-1);
    const sx=.9+R()*.2,sy=.9+R()*.2;blob(land,isl,0,10.5,16,7.6,R,sx,sy);
    // islets out in the middle, kept apart from each other and from home
    const centers=[[10.5,16,9]];let id=1;
    for(let n=0;n<60&&id<6;n++){const cx=22+R()*26,cy=4+R()*24,r=2.2+R()*1.6;if(centers.some(([a,b,rr])=>Math.hypot(a-cx,b-cy)<rr+r+3.5))continue;
      if(blob(land,isl,id,cx,cy,r,R,1,1)>=8){centers.push([cx,cy,r]);id++}}
    const ok=(x,y)=>{for(let j=-1;j<=2;j++)for(let i=-1;i<=2;i++)if(isl[(y+j)*MW+x+i]!==0)return false;return true};
    let bx=9,by=15;for(let n=0;n<400;n++){const x=4+(R()*14|0),y=8+(R()*16|0);if(ok(x,y)){bx=x;by=y;break}}
    const B={v:VER,seed,land,isl,box:{x:bx,y:by,hp:BOX_HP,max:BOX_HP},geysers:[],b:[],u:[],cmd:null,foes:[],shots:[],pulses:[],money:START_MONEY,wave:0,cleared:0,next:PREP,q:[],qt:0,
      slots:[randPiece(),randPiece(),randPiece(),randPiece()],slotT:[0,0,0,0],corpses:[],mods:{},boonPick:null,lanes:[],ebr:{},crack:{},geyT:40,t:0,thunder:6+Math.random()*8,flash:0,bolt:null,kills:0,mined:0};
    // three geysers just off the home shore, plus a couple anywhere
    const a0=R()*6.3;
    for(let k=0;k<3;k++){const a=a0+k*2.1+(R()-.5)*.4;let r=6;while(r<20){const x=10.5+Math.cos(a)*r*sx,y=16+Math.sin(a)*r*sy;if(x<1||y<1||x>MW-2||y>MH-2){r=19;break}if(land[Math.round(y)*MW+Math.round(x)]===SKY)break;r+=.5}
      const d=r+2+R()*2.5;addGeyser(B,10.5+Math.cos(a)*d*sx,16+Math.sin(a)*d*sy)}
    for(let k=0;k<2;k++)addGeyser(B);
    return B}
  // a geyser at (x,y), or anywhere free on the map; on land or in the sky
  function addGeyser(B,x,y){for(let n=0;n<80;n++){let gx=x!=null&&n===0?Math.round(x):1+(Math.random()*(MW-2)|0),gy=y!=null&&n===0?Math.round(y):1+(Math.random()*(MH-2)|0);
      if(!inb(gx,gy))continue;const i=idx(gx,gy),v=B.land[i];if(!(v===SKY||v===LAND))continue;
      if(B.geysers.some(q=>q.amt>0&&Math.abs(q.x-gx)<3&&Math.abs(q.y-gy)<3))continue;if(B.b.some(q=>gx>=q.x-1&&gy>=q.y-1&&gx<=q.x+q.w&&gy<=q.y+q.w))continue;
      if(gx>=B.box.x-1&&gy>=B.box.y-1&&gx<=B.box.x+2&&gy<=B.box.y+2)continue;if(B.ebr[i]!=null)continue;
      const amt=3000+(Math.random()*1001|0);B.geysers.push({x:gx,y:gy,amt,max:amt,land:v===LAND});if(v===SKY)B.land[i]=GEY;topo++;return true}return false}
  function cmdMaxHp(){return CMDR.hp*cb().hp*(1+.5*(D.mods.champion||0))}
  function spawnCmd(){D.cmd={id:nid++,t:'cmd',x:D.box.x+1,y:D.box.y+2.6,hp:cmdMaxHp(),max:cmdMaxHp(),carry:0,st:'idle',cd:0,order:null}}
  function load(){try{const d=JSON.parse(localStorage.getItem(KEY)||'null');if(d&&d.v===VER&&Array.isArray(d.land)&&d.land.length===MW*MH){d.foes=[];d.shots=[];d.q=[];d.pulses=[];
      if(d.wave>d.cleared){d.wave=d.cleared;d.next=Math.min(d.next||GAP,10)}
      d.u=(d.u||[]).filter(u=>u.t==='grunt').map(u=>Object.assign(u,{id:nid++,st:'seek',tg:null}));for(const q of d.b){q.id=nid++;if(q.bp&&!BUILD[q.t].cmd)q.needPulse=true}
      d.corpses=(d.corpses||[]).filter(c=>c.st==='float'||c.st==='trophy').map(c=>({x:c.x,y:c.y,st:c.st,id:nid++}));d.mods=d.mods||{};d.boonPick=Array.isArray(d.boonPick)?d.boonPick:null;
      d.ebr=d.ebr||{};d.crack=d.crack||{};d.lanes=d.lanes||[];
      if(!Array.isArray(d.slots)||d.slots.length!==4)d.slots=[randPiece(),randPiece(),randPiece(),randPiece()];d.slotT=d.slotT||[0,0,0,0];return d}}catch(_){}return fresh()}
  function persist(){if(!D)return;try{const s=Object.assign({},D,{foes:[],shots:[],q:[],pulses:[],bolt:null,cmd:null,corpses:D.corpses.map(c=>({x:c.x,y:c.y,st:c.st==='carried'?'float':c.st})),
      u:D.u.map(u=>({t:u.t,x:u.x,y:u.y,hp:u.hp,max:u.max,carry:u.carry||0})),b:D.b.map(q=>({t:q.t,x:q.x,y:q.y,w:q.w,hp:q.hp,max:q.max,face:q.face||1,bp:!!q.bp,prog:q.prog||0}))});localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}

  // ---------- map helpers ----------
  const walk=i=>{const v=D.land[i];return v===LAND||v===BRIDGE||v===HUSK||v===GEY};
  function bAt(x,y){for(const q of D.b)if(x>=q.x&&y>=q.y&&x<q.x+q.w&&y<q.y+q.w)return q;return null}
  const onBox=(x,y)=>x>=D.box.x&&y>=D.box.y&&x<D.box.x+2&&y<D.box.y+2;
  const gAt=(x,y)=>D.geysers.find(q=>q.amt>0&&q.x===x&&q.y===y);
  function flow(key,targets){if(FF[key]&&FF[key].v===topo)return FF[key].F;const F=new Int16Array(MW*MH).fill(-1),Q=[];for(const i of targets){if(i<0)continue;F[i]=0;Q.push(i)}
    for(let h=0;h<Q.length;h++){const i=Q[h],x=i%MW,y=(i/MW)|0;for(const [dx,dy] of DIR4){const xx=x+dx,yy=y+dy;if(!inb(xx,yy))continue;const j=idx(xx,yy);if(F[j]>=0||!walk(j))continue;F[j]=F[i]+1;Q.push(j)}}
    FF[key]={v:topo,F};return F}
  // sugar can be dropped at the candy box or any finished outpost
  function dropTiles(){const t=[idx(D.box.x,D.box.y),idx(D.box.x+1,D.box.y),idx(D.box.x,D.box.y+1),idx(D.box.x+1,D.box.y+1)];for(const q of D.b)if(q.t==='outpost'&&!q.bp)for(let j=0;j<2;j++)for(let i=0;i<2;i++)t.push(idx(q.x+i,q.y+j));return t}
  const dropFlow=()=>flow('drop',dropTiles());
  const gFlow=gy=>flow('g'+gy.x+','+gy.y,[idx(gy.x,gy.y)]);
  function moveTo(u,tx,ty,step){const vx=tx-u.x,vy=ty-u.y,l=Math.hypot(vx,vy);if(l<=step){u.x=tx;u.y=ty;return true}u.x+=vx/l*step;u.y+=vy/l*step;return false}
  function follow(u,F,step){const ix=Math.floor(u.x),iy=Math.floor(u.y);if(!inb(ix,iy))return 'stuck';const d=F[idx(ix,iy)];if(d<0)return 'stuck';
    if(d===0)return moveTo(u,ix+.5,iy+.5,step)?'here':'go';let bx=ix,by=iy,bd=d;for(const [dx,dy] of DIR4){const xx=ix+dx,yy=iy+dy;if(!inb(xx,yy))continue;const v=F[idx(xx,yy)];if(v>=0&&v<bd){bd=v;bx=xx;by=yy}}
    moveTo(u,bx+.5,by+.5,step);return 'go'}
  function nearestGeyser(u){let best=null,bd=1e9;const ix=Math.floor(u.x),iy=Math.floor(u.y);for(const gy of D.geysers){if(gy.amt<=0)continue;const F=gFlow(gy),d=F[idx(ix,iy)];if(d>=0&&d<bd){bd=d;best=gy}}return best}
  function drain(gy,n){const take=Math.min(n,gy.amt);gy.amt-=take;if(gy.amt<=0){const i=idx(gy.x,gy.y);if(!gy.land)D.land[i]=HUSK;topo++;A.sfx('remove')}return take}
  function nearTiles(c){const out=[],cx=Math.floor(c.x),cy=Math.floor(c.y);for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const x=cx+i,y=cy+j;if(inb(x,y)&&walk(idx(x,y)))out.push(idx(x,y))}return out}
  function ringTiles(q){const out=[];for(let j=-1;j<=q.w;j++)for(let i=-1;i<=q.w;i++){const x=q.x+i,y=q.y+j;if(inb(x,y)&&walk(idx(x,y))&&!(i>=0&&j>=0&&i<q.w&&j<q.w))out.push(idx(x,y))}return out}
  // islands you hold: home, plus any with a finished outpost
  function owned(){const s=new Set([0]);for(const q of D.b)if(q.t==='outpost'&&!q.bp)s.add(D.isl[idx(q.x,q.y)]);return s}
  // your network: land of held islands, plus your bridges joined to it
  function conn(){if(connV===topo&&CONN)return CONN;const C=new Uint8Array(MW*MH),own=owned(),Q=[];for(let i=0;i<MW*MH;i++)if(D.land[i]===LAND&&own.has(D.isl[i])){C[i]=1;Q.push(i)}
    for(let h=0;h<Q.length;h++){const i=Q[h],x=i%MW,y=(i/MW)|0;for(const [dx,dy] of DIR4){const xx=x+dx,yy=y+dy;if(!inb(xx,yy))continue;const j=idx(xx,yy);if(C[j]||D.land[j]!==BRIDGE)continue;C[j]=1;Q.push(j)}}
    CONN=C;connV=topo;return C}

  // ---------- power ----------
  function powered(){const src=[{x:D.box.x+1,y:D.box.y+1,r:BOX_R}];const gens=D.b.filter(q=>q.t==='generator'&&!q.bp);let grew=true;const on=new Set();
    while(grew){grew=false;for(const q of gens){if(on.has(q))continue;if(src.some(s=>Math.hypot(q.x+.5-s.x,q.y+.5-s.y)<=s.r)){on.add(q);src.push({x:q.x+.5,y:q.y+.5,r:GEN_R});grew=true}}}return src}
  const inPower=(src,x,y)=>src.some(s=>Math.hypot(x-s.x,y-s.y)<=s.r);

  // ---------- monster lanes: a path of tiles from the far edge toward the box ----------
  function makeLane(){const R=Math.random;let x=MW-1,y=3+(R()*(MH-6)|0);const tx=D.box.x+1,ty=D.box.y+1,t=[idx(x,y)];let drift=0;
    while(t.length<400){const own=D.isl[idx(x,y)]===0;if(own||Math.hypot(x-tx,y-ty)<3)break;
      if(R()<.12)drift=(R()<.5?-1:1)*(R()<.6?1:0);let nx=x,ny=y;const dy=ty-y;
      if(drift&&R()<.5)ny=y+drift;else if(Math.abs(dy)>Math.abs(tx-x)*.6&&R()<.6)ny=y+Math.sign(dy);else nx=x-Math.sign(x-tx||1);
      ny=Math.max(1,Math.min(MH-2,ny));nx=Math.max(0,Math.min(MW-1,nx));if(nx===x&&ny===y)nx=x-1;x=nx;y=ny;t.push(idx(x,y))}
    return t}

  // ---------- simulation ----------
  function tick(dt){
    const B=D;B.t+=dt;const c=cb();
    B.thunder-=dt;if(B.thunder<=0){B.thunder=8+Math.random()*16;B.flash=1;B.bolt={x:Math.random()*MW,t:.25,seed:Math.random()*1e9|0};setTimeout(()=>{if(isOpen)A.sfx('thunder')},300+Math.random()*900)}
    B.flash=Math.max(0,B.flash-dt*2.2);if(B.bolt){B.bolt.t-=dt;if(B.bolt.t<=0)B.bolt=null}
    for(let i=0;i<4;i++)if(!B.slots[i]){B.slotT[i]-=dt;if(B.slotT[i]<=0){B.slots[i]=randPiece();drawSlots()}}
    if(Math.floor(B.t*2)!==Math.floor((B.t-dt)*2))SRC=powered();
    // new geysers bubble up now and then
    B.geyT-=dt;if(B.geyT<=0){B.geyT=40+Math.random()*30;if(B.geysers.filter(q=>q.amt>0).length<GEY_MAX&&addGeyser(B))A.sfx('pulse')}
    // bridges cut off from your islands crack and fall away
    {const C=conn();let fell=false;for(let i=0;i<MW*MH;i++){if(B.land[i]!==BRIDGE)continue;if(C[i]){if(B.crack[i])delete B.crack[i];continue}B.crack[i]=(B.crack[i]||0)+dt/25;if(B.crack[i]>=1){B.land[i]=SKY;delete B.crack[i];fell=true}}if(fell){topo++;A.sfx('remove')}}
    // monster bridges crumble once nobody walks them
    {let fell=false;for(const k in B.ebr){B.ebr[k]-=dt/90;if(B.ebr[k]<=0){delete B.ebr[k];if(B.land[k]===EBR)B.land[k]=SKY;fell=true}}if(fell)topo++}
    // build pulses fly from the nearest of the box and your outposts
    for(const q of B.b)if(q.needPulse){q.needPulse=false;const src=[{x:B.box.x+1,y:B.box.y+1},...B.b.filter(o=>o.t==='outpost'&&!o.bp).map(o=>({x:o.x+1,y:o.y+1}))];let s=src[0],bd=1e9;for(const p of src){const d=Math.hypot(p.x-q.x-q.w/2,p.y-q.y-q.w/2);if(d<bd){bd=d;s=p}}B.pulses.push({x:s.x,y:s.y,q});A.sfx('pulse')}
    for(const p of B.pulses){if(!B.b.includes(p.q)){p.done=true;continue}if(moveTo(p,p.q.x+p.q.w/2,p.q.y+p.q.w/2,PULSE_V*dt)){p.q.bp=false;p.done=true;SRC=powered();topo++;A.sfx('build')}}B.pulses=B.pulses.filter(p=>!p.done);
    // units
    const units=[...B.u];if(B.cmd)units.push(B.cmd);
    const gm=1+.3*(B.mods.haul||0),gc=1+.5*(B.mods.haul||0),td=1+.25*(B.mods.sharpen||0),cdm=1+.4*(B.mods.champion||0);
    for(const u of units){const spd=(u.t==='cmd'?CMDR.spd*c.spd:UNIT.grunt.spd*gm)*dt,cap=Math.round((u.t==='cmd'?CMDR.carry:UNIT.grunt.carry*gc)*c.inc);
      if(u.t==='cmd'){u.cd-=dt;if(u.cd<=0){let tg=null,bd=CMDR.range;for(const f of B.foes){const d=Math.hypot(f.x-u.x,f.y-u.y);if(d<bd){bd=d;tg=f}}if(tg){u.cd=1/(CMDR.rate*c.spd);tg.hp-=CMDR.dmg*c.dmg*cdm;B.shots.push({k:'bolt',x1:u.x,y1:u.y-.4,x2:tg.x,y2:tg.y,life:.15})}}
        // build orders: walk next to the site, then raise it by hand
        if(u.order&&u.order.type==='build'){const q=u.order.q;if(!B.b.includes(q)||!q.bp){u.order=null;continue}
          if(Math.max(Math.abs(u.x-(q.x+q.w/2)),Math.abs(u.y-(q.y+q.w/2)))<=q.w/2+1.1){q.prog=(q.prog||0)+dt/CMD_BUILD;u.building=true;if(q.prog>=1){q.bp=false;u.order=null;u.building=false;topo++;SRC=powered();A.sfx('build');A.toast(BUILD[q.t].n+' finished')}continue}
          u.building=false;const r=follow(u,flow('bs'+q.id,ringTiles(q)),spd);if(r==='stuck'){u.order=null;A.toast('Your commander can’t reach that site. Bridge to it first.')}continue}
        if(u.order&&u.order.type==='move'){const F=flow('m'+u.order.x+','+u.order.y,[idx(u.order.x,u.order.y)]),r=follow(u,F,spd);if(r!=='go')u.order=null;continue}
        if(!u.order&&!u.haul)continue}
      if(u.haul){const r=follow(u,u.toAltar?flow('alt'+u.toAltar.id,ringTiles(u.toAltar)):dropFlow(),spd*.5);u.haul.x=u.x+.35;u.haul.y=u.y-.35;
        if(r==='here'){if(u.toAltar){const al=u.toAltar;B.corpses=B.corpses.filter(k=>k!==u.haul);u.haul=null;u.toAltar=null;u.order=null;if(B.b.includes(al)){B.boonPick=boonOffer();A.sfx('launch');showBoons()}}else{u.haul.st='trophy';u.haul.carrier=null;u.haul.x=u.x;u.haul.y=u.y;u.haul=null;u.st='seek';A.toast('A boss trophy is home. Build an Altar and have your commander sacrifice it.')}}
        else if(r==='stuck'){u.haul.st=u.toAltar?'trophy':'float';u.haul.carrier=null;u.haul=null;u.toAltar=null;u.order=null;u.st='seek'}continue}
      if(u.t==='cmd'&&u.order&&u.order.type==='sac'){const tr=u.order.c;if(!B.corpses.includes(tr)||tr.st!=='trophy'||!B.b.includes(u.order.al)){u.order=null;continue}
        const r=follow(u,flow('tr'+tr.id,[idx(Math.floor(tr.x),Math.floor(tr.y))]),spd);if(r==='here'){tr.st='carried';tr.carrier=u.id;u.haul=tr;u.toAltar=u.order.al}else if(r==='stuck'){u.order=null;A.toast('Your commander can’t reach the trophy')}continue}
      if(u.t==='grunt'&&!u.carry&&u.st!=='mine'){if(!u.fetch){const k=B.corpses.find(k=>k.st==='float'&&!k.carrier&&k.claim==null);if(k){const F=flow('c'+k.id,nearTiles(k));if(F[idx(Math.floor(u.x),Math.floor(u.y))]>=0){k.claim=u.id;u.fetch=k}}}
        if(u.fetch){const k=u.fetch;if(!B.corpses.includes(k)||k.st!=='float'){u.fetch=null}else{const r=follow(u,flow('c'+k.id,nearTiles(k)),spd);if(r==='here'){k.st='carried';k.carrier=u.id;k.claim=null;u.haul=k;u.fetch=null}else if(r==='stuck'){k.claim=null;u.fetch=null}continue}}}
      if(u.st==='mine'){u.mt-=dt;if(u.mt<=0){if(u.tg&&u.tg.amt>0){u.carry=drain(u.tg,cap);B.mined+=u.carry}u.st='home'}continue}
      if(u.carry>0||u.st==='home'){const r=follow(u,dropFlow(),spd);if(r==='here'){B.money+=u.carry;if(u.carry)A.sfx('core');u.carry=0;u.st='seek'}else if(r==='stuck')u.st='seek';continue}
      if(!u.tg||u.tg.amt<=0||u.st==='seek'){const wanted=u.t==='cmd'&&u.order&&u.order.type==='gather'&&u.order.g.amt>0?u.order.g:null;u.tg=wanted||nearestGeyser(u);u.st=u.tg?'go':'idle';if(!u.tg){if(u.t==='cmd')u.order=null;continue}}
      const r=follow(u,gFlow(u.tg),spd);if(r==='here'){u.st='mine';u.mt=1.4}else if(r==='stuck'){u.tg=null;u.st='seek'}}
    // towers
    for(const q of B.b){const T=BUILD[q.t];q.on=!q.bp&&(!T.power||inPower(SRC,q.x+q.w/2,q.y+q.w/2));if(!q.on)continue;
      if(q.t==='disc'){q.ang=(q.ang||0)+dt*14;q.cd=(q.cd||0)-dt;if(q.cd>0)continue;const cx=q.x+1,cy=q.y+1;let tg=null,bd=T.range;for(const f of B.foes){const d=Math.hypot(f.x-cx,f.y-cy);if(d<bd){bd=d;tg=f}}
        if(tg){q.cd=1/T.rate;const a=q.ang;B.shots.push({k:'disc',x:cx+Math.cos(a)*.6,y:cy-1.4+Math.sin(a)*.3,tg,dmg:T.dmg*td,life:1.4})}}
      if(q.t==='cannon'){q.cd=(q.cd||0)-dt;const cx=q.x+1,cy=q.y+1;if(q.face==null)q.face=1;
        // aim zone per direction: 1 tile wide at the barrel, widening to 4 at full range
        let tg=null,bs=1e9,want=q.face;for(const f of B.foes){for(let d=0;d<4;d++){const [ax,ay]=DIR4[d],along=(f.x-cx)*ax+(f.y-cy)*ay,perp=Math.abs((f.x-cx)*ay-(f.y-cy)*ax);
          if(along<=.5||along>T.range||perp>.5+1.5*along/T.range)continue;const score=along+(d===q.face?0:3);if(score<bs){bs=score;tg=f;want=d}}}
        if(tg&&want!==q.face){q.turn=(q.turn||0)+dt;if(q.turn>=.9){q.face=want;q.turn=0;A.sfx('lay')}continue}q.turn=0;
        if(tg&&q.cd<=0){q.cd=1/T.rate;const [dx,dy]=DIR4[q.face],along=(tg.x-cx)*dx+(tg.y-cy)*dy;B.shots.push({k:'shell',x:cx+dx*.9,y:cy+dy*.9,dx,dy,left:Math.max(.5,along-.9),dmg:T.dmg*td,splash:T.splash,life:3,tx:tg.x,ty:tg.y});A.sfx('place')}}}
    // waves
    if(!B.q.length&&!B.foes.length){if(B.wave>B.cleared)B.cleared=B.wave;B.next-=dt;if(B.next<=0){B.wave++;B.q=waveList(B.wave);B.qt=0;B.next=GAP;A.sfx('err');
      // one or two lanes this wave; old lanes may be reused if their bones still stand
      const nl=1+(Math.random()<.4?1:0);B.wl=[];for(let k=0;k<nl;k++){const reuse=B.lanes.length&&Math.random()<.5;const L=reuse?B.lanes[Math.random()*B.lanes.length|0]:makeLane();if(!reuse){B.lanes.push(L);if(B.lanes.length>6)B.lanes.shift()}B.wl.push(L)}}}
    if(B.q.length){B.qt-=dt;if(B.qt<=0){B.qt=.8;const t=B.q.shift(),F=FOES[t],hp=F.hp*Math.pow(1.15,B.wave-1);let x=MW-.5,y=2+Math.random()*(MH-4),lane=null;
      if(!F.air&&B.wl&&B.wl.length){lane=B.wl[Math.random()*B.wl.length|0];x=lane[0]%MW+.5;y=(lane[0]/MW|0)+.5}
      B.foes.push({t,x,y,hp,max:hp,ph:Math.random()*6,bite:0,lane,li:0,bt:0})}}
    // monsters
    const prey=[...B.b.map(q=>({o:q,x:q.x+q.w/2,y:q.y+q.w/2,r:q.w/2})),...units.map(u=>({o:u,x:u.x,y:u.y,r:.3}))],box={o:B.box,x:B.box.x+1,y:B.box.y+1,r:1};
    for(const f of B.foes){const F=FOES[f.t];f.ph+=dt*6;if(F.heal)f.hp=Math.min(f.max,f.hp+F.heal*dt);f.bite=Math.max(0,f.bite-dt);const sp=F.spd*Math.min(1.6,1+.01*B.wave)*dt;
      // close enough to bite something?
      let tg=null,bd=f.lane?1.1:2.5;for(const p of prey){if(p.o.hp<=0)continue;const d=Math.hypot(p.x-f.x,p.y-f.y)-p.r;if(d<bd){bd=d;tg=p}}
      {const db=Math.hypot(box.x-f.x,box.y-f.y)-box.r;if(db<bd){bd=db;tg=box}}
      if(tg&&bd<=.45){tg.o.hp-=(BITE[f.t]||4)*Math.pow(1.08,B.wave-1)*dt;f.bite=.2;continue}
      if(f.lane){const i=f.lane[f.li];if(B.land[i]===EBR)B.ebr[i]=1;
        // reached your ground: leave the lane and go for the kill
        if(f.li>=f.lane.length-1||(D.land[i]===LAND&&D.isl[i]===0)||(B.land[i]===BRIDGE)){f.lane=null}
        else{const ni=f.lane[f.li+1],v=B.land[ni];
          if(v===SKY){f.bt+=dt;if(f.bt>=.7){f.bt=0;B.land[ni]=EBR;B.ebr[ni]=1;topo++;A.sfx('lay')}continue}
          if(moveTo(f,ni%MW+.5,(ni/MW|0)+.5,sp))f.li++;continue}}
      if(!tg)tg=box;const vx=tg.x-f.x,vy=tg.y-f.y,l=Math.hypot(vx,vy)||1;f.x+=vx/l*sp;f.y+=vy/l*sp+(F.air?Math.sin(f.ph*.5)*dt*.4:0)}
    // shots
    for(const s of B.shots){s.life-=dt;
      if(s.k==='disc'){if(s.tg.hp<=0){s.life=0;continue}if(moveTo(s,s.tg.x,s.tg.y,14*dt)){s.tg.hp-=s.dmg;s.life=0}}
      else if(s.k==='shell'){const step=11*dt;s.x+=s.dx*step;s.y+=s.dy*step;s.left-=step;if(s.left<=0){const ex=s.dx?s.x:s.tx,ey=s.dy?s.y:s.ty;for(const f of B.foes){if(Math.hypot(f.x-ex,f.y-ey)>s.splash+.6)continue;if(FOES[f.t].air&&Math.random()>.25)continue;f.hp-=s.dmg}B.shots.push({k:'boom',x:ex,y:ey,life:.35});s.life=0}}}
    B.shots=B.shots.filter(s=>s.life>0);
    const alive=[];for(const f of B.foes){if(f.hp<=0){B.kills++;if(FOES[f.t].boss){B.corpses.push({id:nid++,x:Math.max(.5,Math.min(MW-.5,f.x)),y:Math.max(.5,Math.min(MH-.5,f.y)),st:'float'});A.toast('The boss is down! Grunts can haul it home if they can reach it.');A.sfx('fanfare')}continue}alive.push(f)}B.foes=alive;
    B.b=B.b.filter(q=>{if(q.hp>0)return true;A.sfx('remove');topo++;return false});
    for(const u of B.u)if(u.hp<=0){if(u.haul){u.haul.st='float';u.haul.carrier=null}if(u.fetch)u.fetch.claim=null}B.u=B.u.filter(u=>u.hp>0);
    if(B.cmd&&B.cmd.hp<=0){lose('Your commander fell!');return}
    if(B.box.hp<=0)lose('The candy box was smashed!');
  }
  function lose(why){const c=D.cleared,got=A.candyFor(c);A.META.candy=(A.META.candy||0)+got;A.META.dfBest=Math.max(A.META.dfBest||0,c);A.saveMeta();A.sfx('err');
    showMsg(why,`You held out for ${c} wave${c===1?'':'s'} and earned <strong>${got} Candy</strong> (${A.META.candy} total). Best: ${A.META.dfBest} waves.`,'New island');D=fresh();FF={};topo++;nid=1;spawnCmd();persist();centerCam()}
  function boonOffer(){const ks=Object.keys(BOONS),o=[];while(o.length<3){const k=ks[Math.random()*ks.length|0];if(!o.includes(k))o.push(k)}return o}
  function showBoons(){const P=D.boonPick;if(!P)return;const m=$m();m.innerHTML=`<div class="card"><span class="eyebrow">Sacrifice accepted</span><h1>Choose a boon</h1><div class="ms-list">${P.map(k=>`<div class="ms cur"><div class="ms-top"><h4>${BOONS[k].n}</h4></div><div class="actions" style="align-items:center"><div class="ms-unl" style="flex:1">${BOONS[k].d}</div><button class="btn primary" style="flex:none;padding:0 16px" data-df="boon:${k}">Take</button></div></div>`).join('')}</div></div>`;m.hidden=false}
  function takeBoon(k){if(!D.boonPick||!D.boonPick.includes(k))return;D.boonPick=null;D.mods[k]=(D.mods[k]||0)+1;
    if(k==='sweet')D.money+=2000;if(k==='fortify'){D.box.max+=500;D.box.hp=D.box.max}if(k==='champion'&&D.cmd){D.cmd.max=cmdMaxHp();D.cmd.hp=D.cmd.max}
    $m().hidden=true;A.sfx('fanfare');A.toast(BOONS[k].n+': '+BOONS[k].d);persist()}

  // ---------- player actions ----------
  function canPlaceB(t,x,y){const T=BUILD[t],C=conn(),own=owned();let footed=false,isl=null;
    for(let j=0;j<T.w;j++)for(let i=0;i<T.w;i++){const xx=x+i,yy=y+j;if(!inb(xx,yy))return 'Off the map';const k=idx(xx,yy),v=D.land[k];
      if(bAt(xx,yy)||onBox(xx,yy))return 'Something is already there';if(v===GEY||gAt(xx,yy))return 'That’s a geyser';if(v===HUSK||v===EBR)return 'Can’t build there';
      if(T.land){if(v!==LAND)return 'Build that on solid island ground';if(isl==null)isl=D.isl[k];else if(isl!==D.isl[k])return 'Keep it on one island'}
      else if((v===LAND||v===BRIDGE)&&C[k])footed=true;else if(v!==SKY&&v!==LAND)return 'Can’t build there'}
    if(T.land&&T.own&&!own.has(isl))return 'Build an Outpost on this island first';
    if(t==='outpost'&&own.has(isl))return 'You already hold this island';
    if(!T.land&&!footed)return 'Towers need a footing on an island or bridge you hold; they can hang over the edge';
    if(T.power&&!inPower(powered(),x+T.w/2,y+T.w/2))return 'Needs power: place it inside the candy box’s or a Generator’s circle';
    if(T.power&&!D.b.some(q=>q.t==='workshop'&&!q.bp))return 'Build a Sun Workshop first';return null}
  function placeB(t,x,y){const T=BUILD[t],why=canPlaceB(t,x,y);if(why){A.toast(why);A.sfx('err');return}if(D.money<T.cost){A.toast(`Needs ${T.cost} sugar`);A.sfx('err');return}
    D.money-=T.cost;const q={id:nid++,t,x,y,w:T.w,hp:T.hp,max:T.hp,face:1,bp:true,prog:0};D.b.push(q);
    if(T.cmd){if(D.cmd){D.cmd.order={type:'build',q};A.toast('Your commander heads over to build it')}}else q.needPulse=true;A.sfx('place');refreshBar()}
  function pieceCells(x,y){const c=D.slots[slot];if(!c)return null;const w=Math.max(...c.map(p=>p[0]))+1,h=Math.max(...c.map(p=>p[1]))+1;return c.map(([i,j])=>[x+i-Math.floor((w-1)/2),y+j-Math.floor((h-1)/2)])}
  function canBridge(cells){if(!cells)return 'Pick a bridge piece';const C=conn();let touch=false;for(const [x,y] of cells){if(!inb(x,y))return 'Off the map';if(D.land[idx(x,y)]!==SKY||bAt(x,y))return 'Bridges go over open sky';
      for(const [dx,dy] of DIR4){const xx=x+dx,yy=y+dy;if(inb(xx,yy)&&C[idx(xx,yy)])touch=true}}return touch?null:'Bridges must start from an island you hold (home or one with an Outpost) or a bridge joined to it'}
  function placeBridge(x,y){const cells=pieceCells(x,y),why=canBridge(cells);if(why){A.toast(why);A.sfx('err');return}for(const [i,j] of cells)D.land[idx(i,j)]=BRIDGE;topo++;D.slots[slot]=null;D.slotT[slot]=2.5;slot=-1;mode='cmd';A.sfx('lay');refreshBar();drawSlots()}
  function buyGrunt(){if(D.money<UNIT.grunt.cost){A.toast(`Needs ${UNIT.grunt.cost} sugar`);A.sfx('err');return}D.money-=UNIT.grunt.cost;const T=UNIT.grunt;D.u.push({id:nid++,t:'grunt',x:D.box.x+1+(Math.random()-.5),y:D.box.y+1+(Math.random()-.5),hp:T.hp,max:T.hp,carry:0,st:'seek',tg:null});A.sfx('tick')}
  function tapTile(x,y){if(!inb(x,y))return;
    if(mode==='bridge'){placeBridge(x,y);return}
    if(BUILD[mode]){const w=BUILD[mode].w,o=Math.floor((w-1)/2);placeB(mode,x-o,y-o);return}
    if(!D.cmd)return;const q=bAt(x,y);
    if(q&&q.bp&&BUILD[q.t].cmd){D.cmd.order={type:'build',q};A.sfx('tick');A.toast('Your commander heads over to build it');return}
    if(q&&q.t==='altar'&&!q.bp){const tr=D.corpses.find(c=>c.st==='trophy');if(!tr){A.toast('No boss trophy yet. Grunts bring defeated bosses home.');return}D.cmd.order={type:'sac',c:tr,al:q};A.sfx('tick');A.toast('Your commander goes to fetch the trophy');return}
    const gy=gAt(x,y);if(gy){D.cmd.order={type:'gather',g:gy};D.cmd.tg=gy;D.cmd.st=D.cmd.carry?'home':'go';A.sfx('tick');return}
    if(walk(idx(x,y))){D.cmd.order={type:'move',x,y};D.cmd.st='idle';A.sfx('tick')}else A.toast('Your commander can only walk on land and bridges')}

  // ---------- drawing ----------
  const W2S=(x,y)=>[(x-cam.x)*cam.z+VW/2,(y-cam.y)*cam.z+VH/2];
  const clouds=[];for(let i=0;i<34;i++)clouds.push({x:Math.random()*(MW+20)-10,y:Math.random()*(MH+8)-4,r:2+Math.random()*5,v:.15+Math.random()*.35,a:.05+Math.random()*.1,lay:Math.random()<.5});
  function drawClouds(top,dt){for(const c of clouds){if(c.lay!==top)continue;c.x+=c.v*dt*(top?1.3:1);if(c.x-c.r>MW+10)c.x=-10-c.r;const [sx,sy]=W2S(c.x,c.y),r=c.r*cam.z;
    const gr=g.createRadialGradient(sx,sy,0,sx,sy,r);gr.addColorStop(0,`rgba(${top?'210,200,235':'120,110,160'},${c.a*(top?.8:1)})`);gr.addColorStop(1,'rgba(120,110,160,0)');g.fillStyle=gr;g.fillRect(sx-r,sy-r,r*2,r*2)}}
  function bar(x,y,w,f,c){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(x,y,w,3);g.fillStyle=c;g.fillRect(x,y,w*Math.max(0,Math.min(1,f)),3)}
  // draw sprite S so its pixel (ax,ay) lands at screen (sx,sy), k screen px per sprite px
  function spr(S,sx,sy,ax,ay,k,flip){if(flip){g.save();g.translate(sx,sy);g.scale(-1,1);g.drawImage(S,-ax*k,-ay*k,S.width*k,S.height*k);g.restore()}else g.drawImage(S,sx-ax*k,sy-ay*k,S.width*k,S.height*k)}
  function shadow(x,y,rx,ry){g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fill()}
  function draw(rdt){
    const z=cam.z,B=D,SP=sprites();g.setTransform(dpr,0,0,dpr,0,0);g.imageSmoothingEnabled=false;
    const sky=g.createLinearGradient(0,0,0,VH);sky.addColorStop(0,'#141026');sky.addColorStop(1,'#241a3a');g.fillStyle=sky;g.fillRect(0,0,VW,VH);
    drawClouds(false,rdt);
    {const [a,b]=W2S(0,0);g.strokeStyle='rgba(200,190,255,.08)';g.lineWidth=1;g.strokeRect(a,b,MW*z,MH*z)}
    const x0=Math.max(0,Math.floor(cam.x-VW/2/z)-1),x1=Math.min(MW,Math.ceil(cam.x+VW/2/z)+1),y0=Math.max(0,Math.floor(cam.y-VH/2/z)-2),y1=Math.min(MH,Math.ceil(cam.y+VH/2/z)+1);
    const L=(x,y)=>inb(x,y)?B.land[idx(x,y)]:SKY;
    // cliff faces under every island's south edge
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){if(L(x,y)!==LAND||L(x,y+1)===LAND)continue;const [sx,sy]=W2S(x,y+1),R=mulberry(x*31+y*977)(),fh=z*.8,h=z*(.4+R*1.2);
      g.drawImage(SP.cliff,0,0,16,14,sx,sy,z+.6,fh);
      g.fillStyle='#2a1f22';g.beginPath();g.moveTo(sx,sy+fh-1);g.lineTo(sx+z,sy+fh-1);g.lineTo(sx+z*.62,sy+fh+h);g.lineTo(sx+z*.32,sy+fh+h*.6);g.closePath();g.fill()}
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const v=L(x,y);if(v===SKY)continue;const [sx,sy]=W2S(x,y),i=idx(x,y);
      if(v===LAND){g.drawImage(SP.ground,(x&3)*16,(y&3)*16,16,16,sx,sy,z+.6,z+.6);
        g.fillStyle='#4f8a3a';for(let d=0;d<4;d++){if(L(x+DIR4[d][0],y+DIR4[d][1])===LAND)continue;const t=z*.18;if(d===0)g.fillRect(sx,sy,z+.5,t);else if(d===1)g.fillRect(sx+z-t,sy,t,z+.5);else if(d===2)g.fillRect(sx,sy+z-t,z+.5,t);else g.fillRect(sx,sy,t,z+.5)}}
      else if(v===BRIDGE){g.drawImage(SP.bridge,sx,sy,z+.5,z+.5);const ck=B.crack[i];if(ck){g.strokeStyle=`rgba(20,10,8,${.4+ck*.6})`;g.lineWidth=Math.max(1,z*.06);g.beginPath();g.moveTo(sx+z*.2,sy+z*.1);g.lineTo(sx+z*.45,sy+z*.5);g.lineTo(sx+z*.3,sy+z*.9);if(ck>.5){g.moveTo(sx+z*.45,sy+z*.5);g.lineTo(sx+z*.85,sy+z*.65)}g.stroke();g.globalAlpha=1}}
      else if(v===EBR){g.globalAlpha=Math.max(.25,Math.min(1,(B.ebr[i]||0)*1.6));g.drawImage(SP.ebridge,sx,sy,z+.5,z+.5);g.globalAlpha=1}
      else if(v===HUSK){g.drawImage(SP.husk,sx,sy+z*.15,z,z*.75)}}
    // power circles while placing a powered building
    if(BUILD[mode]&&BUILD[mode].power){for(const s of SRC){const [a,b]=W2S(s.x,s.y);g.beginPath();g.arc(a,b,s.r*z,0,7);g.fillStyle='rgba(255,214,90,.07)';g.fill();g.strokeStyle='rgba(255,214,90,.35)';g.setLineDash([6,5]);g.stroke();g.setLineDash([])}}
    // geysers
    for(const gy of B.geysers){if(gy.amt<=0)continue;const [a,b]=W2S(gy.x+.5,gy.y+.5),f=gy.amt/gy.max;spr(SP.geyser,a,b,10,7,z*1.1/20);
      for(let k=0;k<6;k++){const t=(B.t*1.4+k/6)%1,px2=a+Math.sin(k*2.3+B.t*3)*z*.16,py=b-z*.15-t*z*1.5;g.globalAlpha=1-t;g.fillStyle=k%2?'#ffb3e6':'#ff9a3c';g.fillRect(px2-z*.07,py-z*.07,z*(.14-.06*t),z*(.14-.06*t))}g.globalAlpha=1;
      bar(a-z*.5,b+z*.45,z,f,'#ff7ac8')}
    // everything with height, back to front
    const items=[[B.box.y+2,3,B.box]];for(const q of B.b)items.push([q.y+q.w,0,q]);for(const c of B.corpses)items.push([c.y+.3,1,c]);for(const u of [...B.u,...(B.cmd?[B.cmd]:[])])items.push([u.y+.25,2,u]);for(const f of B.foes)if(!FOES[f.t].air)items.push([f.y+.25,4,f]);
    items.sort((p,q)=>p[0]-q[0]);
    for(const [,kind,o] of items){if(kind===0)drawBld(o);else if(kind===1)drawCorpse(o);else if(kind===2)drawUnit(o);else if(kind===3)drawBox(o);else drawFoe(o)}
    for(const f of B.foes)if(FOES[f.t].air)drawFoe(f);
    function drawBox(bx){const [a,b]=W2S(bx.x+1,bx.y+2);shadow(a,b-z*.1,z*.95,z*.32);spr(SP.box,a,b,16,34,z*2/32);bar(a-z,b-z*2.4,z*2,bx.hp/bx.max,'#72e3b2')}
    function drawBld(q){const cx=(q.x+q.w/2),[a,bb]=W2S(cx,q.y+q.w),k0=z*q.w;g.globalAlpha=q.bp?.45:q.on===false&&BUILD[q.t].power?.6:1;
      if(q.t==='disc'){const k=k0/32;shadow(a+z*.15,bb-z*.5,z*.95,z*.36);spr(SP.disc,a,bb-z*.55,16,51,k);
        if(!q.bp){const hx=a,hy=bb-z*.55-(51-8)*k,an=q.ang||0,L2=13*k,ex=hx+Math.cos(an)*L2,ey=hy+Math.sin(an)*L2*.45;
          g.strokeStyle='#6a4a1c';g.lineWidth=Math.max(2,k*2.2);g.lineCap='round';g.beginPath();g.moveTo(hx,hy);g.lineTo(ex,ey);g.stroke();g.strokeStyle='#d8a84a';g.lineWidth=Math.max(1,k);g.beginPath();g.moveTo(hx,hy-k*.5);g.lineTo(ex,ey-k*.5);g.stroke();
          g.fillStyle='#b8862a';g.beginPath();g.ellipse(ex,ey,k*3.4,k*1.8,0,0,7);g.fill();g.fillStyle='#ffe07a';g.beginPath();g.ellipse(ex,ey-k*.4,k*2.6,k*1.2,0,0,7);g.fill()}}
      else if(q.t==='generator'){const k=z*1/16;shadow(a,bb-z*.2,z*.45,z*.17);spr(SP.gen,a,bb-z*.15,8,29,k);if(!q.bp){const p=.75+.25*Math.sin(B.t*4),oy=bb-z*.15-21*k;const gr=g.createRadialGradient(a,oy,0,a,oy,z*.9*p);gr.addColorStop(0,'rgba(255,230,140,.55)');gr.addColorStop(1,'rgba(255,230,140,0)');g.fillStyle=gr;g.fillRect(a-z,oy-z,z*2,z*2);g.fillStyle='#ffe68a';g.beginPath();g.arc(a,oy,z*.2*p,0,7);g.fill();g.fillStyle='#fff8d8';g.fillRect(a-z*.07,oy-z*.1,z*.07,z*.07)}}
      else if(q.t==='cannon'){const k=k0/32;shadow(a,bb-z*.45,z*.95,z*.36);spr(SP.cannon,a,bb-z*.4,16,19,k);
        const cy=bb-z*.4-11*k,f=q.face||1;const brl=(x1,y1,w,h)=>{g.fillStyle='#5a3a16';g.fillRect(x1,y1,w,h);g.fillStyle='#c98a3a';g.fillRect(x1,y1,w,Math.max(1,h*.45));g.fillStyle='#e8b85a';g.fillRect(x1,y1,w,Math.max(1,h*.15))};
        if(f===1)brl(a,cy-k*3,k*16,k*5);else if(f===3)brl(a-k*16,cy-k*3,k*16,k*5);else if(f===0)brl(a-k*2.5,cy-k*12,k*5,k*12);else brl(a-k*2.5,cy-k*2,k*5,k*9);
        g.fillStyle='#3a2a1a';g.beginPath();g.ellipse(a,cy,k*4.5,k*2.5,0,0,7);g.fill();g.fillStyle='#e8b85a';g.beginPath();g.ellipse(a,cy-k*.6,k*2.5,k*1.3,0,0,7);g.fill()}
      else if(q.t==='workshop'){const k=k0/48;shadow(a,bb-z*.4,z*1.45,z*.45);spr(SP.workshop,a,bb-z*.3,24,51,k)}
      else if(q.t==='altar'){const k=k0/32;shadow(a,bb-z*.4,z*.95,z*.3);spr(SP.altar,a,bb-z*.35,16,26,k);if(!q.bp)for(const cx2 of [9,23]){const fl=Math.sin(B.t*9+cx2)*k*.6;g.fillStyle='#ff9a3a';g.beginPath();g.ellipse(a+(cx2-16)*k,bb-z*.35-(26-4)*k+fl,k*1.1,k*2,0,0,7);g.fill();g.fillStyle='#ffe0a0';g.fillRect(a+(cx2-16.4)*k,bb-z*.35-(26-5)*k+fl,k*.8,k*1.2)}}
      else if(q.t==='outpost'){const k=k0/32;shadow(a,bb-z*.35,z*.95,z*.3);spr(SP.outpost,a,bb-z*.3,16,32,k)}
      g.globalAlpha=1;
      if(q.bp){const [ta,tb]=W2S(q.x,q.y);g.strokeStyle='rgba(127,240,208,.85)';g.setLineDash([4,4]);g.lineDashOffset=-B.t*12;g.strokeRect(ta+1,tb+1,k0-2,k0-2);g.setLineDash([]);if(q.prog)bar(ta,tb+k0+2,k0,q.prog,'#7ff0d0')}
      else if(q.hp<q.max){const [ta,tb]=W2S(q.x,q.y);bar(ta,tb-z*(q.t==='disc'?2:q.t==='workshop'?1.2:.8),k0,q.hp/q.max,'#72e3b2')}}
    function drawCorpse(c){const [a,b]=W2S(c.x,c.y),bob=c.st==='float'?Math.sin(B.t*1.5+c.id)*z*.15:0,k=z*1.6/30;
      if(c.st==='float'){const gr=g.createRadialGradient(a,b+bob,0,a,b+bob,z*1.6);gr.addColorStop(0,'rgba(255,138,26,.3)');gr.addColorStop(1,'rgba(255,138,26,0)');g.fillStyle=gr;g.fillRect(a-z*1.6,b+bob-z*1.6,z*3.2,z*3.2)}
      g.save();g.filter='brightness(.55) saturate(.6)';spr(SP.king,a,b+bob+z*.3,15,30,k);g.restore();
      if(c.st==='trophy'){g.strokeStyle='#f3c25a';g.setLineDash([3,3]);g.beginPath();g.ellipse(a,b+z*.3,z*.9,z*.35,0,0,7);g.stroke();g.setLineDash([])}}
    function drawUnit(u){const [a,b]=W2S(u.x,u.y),cmd=u.t==='cmd';
      const moved=Math.hypot(u.x-(u.lx??u.x),u.y-(u.ly??u.y));if(Math.abs(u.x-(u.lx??u.x))>.002)u.fx=u.x>u.lx?1:-1;u.lx=u.x;u.ly=u.y;u.walk=moved>.0005;
      const S=cmd?SP.mech[u.walk?[1,2,3,2][Math.floor(B.t*9)%4]:0]:SP.grunt[u.walk?Math.floor(B.t*8)%2:0],w=S.width,k=z*(cmd?1.35:.75)/w;
      if(cmd){const gr=g.createRadialGradient(a,b,0,a,b,z*.9);gr.addColorStop(0,'rgba(127,240,208,.28)');gr.addColorStop(1,'rgba(127,240,208,0)');g.fillStyle=gr;g.fillRect(a-z*.9,b-z*.9,z*1.8,z*1.8)}
      shadow(a,b+z*.22,w*k*.38,w*k*.14);spr(S,a,b+z*.25,w/2,S.height-1,k,(u.fx||1)<0);
      if(cmd&&u.building){g.fillStyle='#7ff0d0';for(let s=0;s<3;s++){const t=(B.t*3+s/3)%1;g.globalAlpha=1-t;g.fillRect(a+(s-1)*z*.3,b-z*.9-t*z*.6,z*.08,z*.08)}g.globalAlpha=1}
      if(u.carry){g.fillStyle='#ff7ac8';g.fillRect(a-(u.fx||1)*z*.3-z*.12,b-z*.3,z*.24,z*.24);g.fillStyle='#ffd0ec';g.fillRect(a-(u.fx||1)*z*.3-z*.08,b-z*.26,z*.08,z*.08)}
      if(u.hp<u.max)bar(a-z*.35,b-S.height*k-2,z*.7,u.hp/u.max,'#72e3b2')}
    function drawFoe(f){const F=FOES[f.t],[a,b]=W2S(f.x,f.y),fr=Math.floor(f.ph*.8)%2;let S=SP[f.t];if(Array.isArray(S))S=S[f.t==='bat'?Math.floor(f.ph*1.6)%2:(f.lane||!F.air?fr:0)];
      const k=z*FSIZE[f.t]/S.width,bob=F.air?Math.sin(f.ph*.7)*z*.15-z*.5:0;
      if(!F.air)shadow(a,b+z*.2,S.width*k*.35,S.width*k*.12);else shadow(a,b+z*.3,S.width*k*.25,S.width*k*.08);
      if(f.bite>0){g.save();g.filter='brightness(1.4)'}spr(S,a,b+z*.25+bob,S.width/2,S.height-1,k,f.lane?true:f.x>(B.box.x+1));if(f.bite>0)g.restore();
      if(f.hp<f.max)bar(a-z*.35,b+bob-S.height*k,z*.7,f.hp/f.max,'#ff7378')}
    // pulses and shots
    for(const p of B.pulses){const [a,b]=W2S(p.x,p.y);const gr=g.createRadialGradient(a,b,0,a,b,z*.6);gr.addColorStop(0,'rgba(127,240,208,.9)');gr.addColorStop(1,'rgba(127,240,208,0)');g.fillStyle=gr;g.fillRect(a-z*.6,b-z*.6,z*1.2,z*1.2)}
    for(const s of B.shots){if(s.k==='bolt'){const [a,b]=W2S(s.x1,s.y1),[c2,d]=W2S(s.x2,s.y2);g.strokeStyle='#7ff0d0';g.lineWidth=Math.max(1,z*.08);g.globalAlpha=s.life*6;g.beginPath();g.moveTo(a,b);g.lineTo(c2,d);g.stroke();g.globalAlpha=1}
      else if(s.k==='disc'){const [a,b]=W2S(s.x,s.y);g.fillStyle='#b8862a';g.beginPath();g.ellipse(a,b,z*.18,z*.1,0,0,7);g.fill();g.fillStyle='#ffe07a';g.beginPath();g.ellipse(a,b-z*.02,z*.13,z*.06,0,0,7);g.fill()}
      else if(s.k==='shell'){const [a,b]=W2S(s.x,s.y);g.fillStyle='#3a2a1a';g.beginPath();g.arc(a,b,z*.17,0,7);g.fill();g.fillStyle='#ffb070';g.beginPath();g.arc(a-z*.05,b-z*.05,z*.08,0,7);g.fill()}
      else if(s.k==='boom'){const [a,b]=W2S(s.x,s.y),t=1-s.life/.35;g.globalAlpha=1-t;g.fillStyle='#ffb070';g.beginPath();g.arc(a,b,z*(.4+t*1.1),0,7);g.fill();g.fillStyle='#fff0c0';g.beginPath();g.arc(a,b,z*(.2+t*.5),0,7);g.fill();g.globalAlpha=1}}
    // placement preview, and the cannon's aim zone while placing one
    if(hover&&(mode==='bridge'||BUILD[mode])){let cells,ok;if(mode==='bridge'){cells=pieceCells(hover[0],hover[1]);ok=cells&&!canBridge(cells)}else{const w=BUILD[mode].w,o=Math.floor((w-1)/2);cells=[];for(let j=0;j<w;j++)for(let i=0;i<w;i++)cells.push([hover[0]-o+i,hover[1]-o+j]);ok=!canPlaceB(mode,hover[0]-o,hover[1]-o)}
      if(cells)for(const [x,y] of cells){const [a,b]=W2S(x,y);g.fillStyle=ok?'rgba(127,240,208,.35)':'rgba(255,115,120,.35)';g.fillRect(a,b,z,z)}
      if(mode==='cannon'||mode==='disc'){const o=Math.floor((BUILD[mode].w-1)/2),cx=hover[0]-o+1,cy=hover[1]-o+1,[a,b]=W2S(cx,cy),Rr=BUILD[mode].range;g.fillStyle='rgba(255,180,90,.1)';g.strokeStyle='rgba(255,180,90,.45)';
        if(mode==='disc'){g.beginPath();g.arc(a,b,Rr*z,0,7);g.fill();g.stroke()}
        else for(const [dx,dy] of DIR4){g.beginPath();const p=(al,pp)=>[a+(dx*al-dy*pp)*z,b+(dy*al+dx*pp)*z];let [u1,v1]=p(.5,.5);g.moveTo(u1,v1);for(const [al,s2] of [[Rr,1],[Rr,-1],[.5,-1]]){const [u2,v2]=p(al,s2*(.5+1.5*al/Rr));g.lineTo(u2,v2)}g.closePath();g.fill();g.stroke()}}}
    drawClouds(true,rdt);
    if(B.bolt){const R=mulberry(B.bolt.seed);let [a,b]=W2S(B.bolt.x,-2);g.strokeStyle=`rgba(235,230,255,${Math.min(1,B.bolt.t*6)})`;g.lineWidth=2;g.beginPath();g.moveTo(a,b);for(let k=0;k<10;k++){a+=(R()-.5)*z*2;b+=VH/10;g.lineTo(a,b)}g.stroke()}
    if(B.flash>0){g.fillStyle=`rgba(225,220,255,${B.flash*.35})`;g.fillRect(0,0,VW,VH)}
  }

  // ---------- UI ----------
  function build(){
    el=document.createElement('div');el.className='def';el.hidden=true;
    el.innerHTML=`<canvas class="def-cv"></canvas>
    <div class="def-top glass"><div class="def-stats" id="dfStats"></div><button class="btn" data-df="shop">Candy</button><button class="btn" data-df="exit">Exit</button></div>
    <div class="def-bot glass"><div class="def-acts" id="dfActs"></div><div class="def-slots"><div id="dfSlots" class="def-slotrow"></div><button class="btn" data-df="rot" aria-label="Rotate piece">⟳</button></div><div class="def-tip" id="dfTip"></div></div>
    <div class="def-msg" id="dfMsg" hidden></div>`;
    document.body.appendChild(el);cv=el.querySelector('canvas');g=cv.getContext('2d');
    el.addEventListener('click',e=>{const b=e.target.closest('[data-df]');if(!b)return;const k=b.dataset.df;
      if(k==='exit')close();else if(k==='shop')A.showCandyShop();else if(k==='rot'){if(slot>=0&&D.slots[slot]){D.slots[slot]=rot(D.slots[slot]);drawSlots()}}
      else if(k==='grunt')buyGrunt();else if(k.startsWith('boon:'))takeBoon(k.slice(5));else if(k==='msg'){$m().hidden=true}
      else if(k.startsWith('slot')){const i=+k.slice(4);if(!D.slots[i])return;slot=slot===i?-1:i;mode=slot>=0?'bridge':'cmd';refreshBar();drawSlots()}
      else{mode=mode===k?'cmd':k;slot=-1;refreshBar();drawSlots()}});
    const P=new Map();let moved=false,pinch=0;
    cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);P.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY});moved=false;if(P.size===2){const [p,q]=[...P.values()];pinch=Math.hypot(p.x-q.x,p.y-q.y)}});
    cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect(),wx=cam.x+(e.clientX-r.left-VW/2)/cam.z,wy=cam.y+(e.clientY-r.top-VH/2)/cam.z;if(e.pointerType==='mouse')hover=[Math.floor(wx),Math.floor(wy)];
      const p=P.get(e.pointerId);if(!p)return;
      if(P.size===2){const [a,b]=[...P.values()];p.x=e.clientX;p.y=e.clientY;const d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch)zoom(d/pinch);pinch=d;moved=true;return}
      const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;if(Math.hypot(e.clientX-p.sx,e.clientY-p.sy)>7)moved=true;if(moved){cam.x-=dx/cam.z;cam.y-=dy/cam.z;clampCam()}});
    cv.addEventListener('pointerup',e=>{const p=P.get(e.pointerId);P.delete(e.pointerId);if(P.size<2)pinch=0;if(!p||moved)return;const r=cv.getBoundingClientRect(),wx=cam.x+(e.clientX-r.left-VW/2)/cam.z,wy=cam.y+(e.clientY-r.top-VH/2)/cam.z;hover=[Math.floor(wx),Math.floor(wy)];tapTile(Math.floor(wx),Math.floor(wy))});
    cv.addEventListener('pointercancel',e=>{P.delete(e.pointerId)});
    cv.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(-e.deltaY*.0015))},{passive:false});
    window.addEventListener('resize',()=>{if(isOpen)resize()});
  }
  const $m=()=>el.querySelector('#dfMsg');
  function showMsg(h,p,btn){const m=$m();m.innerHTML=`<div class="card"><h1>${h}</h1><p>${p}</p><button class="btn primary" data-df="msg">${btn||'OK'}</button></div>`;m.hidden=false}
  function zoom(f){cam.z=Math.max(10,Math.min(64,cam.z*f));clampCam()}
  function clampCam(){cam.x=Math.max(0,Math.min(MW,cam.x));cam.y=Math.max(0,Math.min(MH,cam.y))}
  function centerCam(){cam.x=D.box.x+1+4;cam.y=D.box.y+1;cam.z=Math.max(14,Math.min(34,VW/24))}
  function resize(){dpr=Math.min(2,window.devicePixelRatio||1);VW=window.innerWidth;VH=window.innerHeight;cv.width=VW*dpr;cv.height=VH*dpr;cv.style.width=VW+'px';cv.style.height=VH+'px'}
  function refreshBar(){const has=D.b.some(q=>q.t==='workshop'&&!q.bp),btn=(k,label,cost)=>`<button class="btn${mode===k?' primary':''}" data-df="${k}">${label}${cost!=null?` <span class="cost">${cost}</span>`:''}</button>`;
    el.querySelector('#dfActs').innerHTML=btn('cmd','Commander')+`<button class="btn" data-df="grunt">Grunt <span class="cost">${UNIT.grunt.cost}</span></button>`+btn('outpost','Outpost',BUILD.outpost.cost)+btn('workshop','Sun Workshop',BUILD.workshop.cost)+btn('altar','Altar',BUILD.altar.cost)+
      (has?btn('generator','Generator',BUILD.generator.cost)+btn('disc','Disc Thrower',BUILD.disc.cost)+btn('cannon','Sun Cannon',BUILD.cannon.cost):'');
    const tip=mode==='bridge'?'Tap open sky next to an island you hold or a bridge joined to one. ⟳ rotates the piece. Bridges cut off from your islands crack and fall.':mode==='cmd'?'Tap a geyser to send your commander to collect, tap land to walk, tap a blueprint to build it. Grunts collect on their own. Drag to look around, pinch or scroll to zoom.':BUILD[mode]?`${BUILD[mode].n} · ${BUILD[mode].cost} sugar. ${BUILD[mode].d}`:'';
    el.querySelector('#dfTip').textContent=tip}
  function drawSlots(){const row=el.querySelector('#dfSlots');row.innerHTML=D.slots.map((c,i)=>`<button class="def-slot${slot===i?' on':''}" data-df="slot${i}">${c?'<canvas width="56" height="56"></canvas>':'<span>…</span>'}</button>`).join('');
    row.querySelectorAll('canvas').forEach(k=>{const i=[...row.children].indexOf(k.parentElement),c=D.slots[i],x=k.getContext('2d'),w=Math.max(...c.map(p=>p[0]))+1,h=Math.max(...c.map(p=>p[1]))+1,s=Math.min(11,Math.floor(50/Math.max(w,h)));x.imageSmoothingEnabled=false;
      for(const [px2,py] of c)x.drawImage(sprites().bridge,28-w*s/2+px2*s,28-h*s/2+py*s,s-1,s-1)})}
  function statHtml(){const B=D,between=!B.q.length&&!B.foes.length,gl=B.geysers.reduce((a,q)=>a+q.amt,0);
    return `<span>🍬 <b>${Math.floor(B.money)}</b> sugar</span><span>Wave ${B.wave}${between?` · next in ${Math.ceil(B.next)}s`:` · ${B.foes.length+B.q.length} left`}</span><span>Box ${Math.ceil(B.box.hp)}/${B.box.max}</span><span>${B.u.length} grunt${B.u.length===1?'':'s'} · geysers ${Math.round(gl/1000)}k</span>`}
  function open(){if(!el)build();D=load();FF={};topo++;if(!D.cmd)spawnCmd();isOpen=true;el.hidden=false;A.quiet(true);resize();centerCam();SRC=powered();mode='cmd';slot=-1;refreshBar();drawSlots();
    if(D.boonPick)showBoons();
    else if(!D.t)showMsg('Candy Defense','Protect your candy box and your commander: if either falls, the island is lost. Send your commander to a candy geyser and buy Grunts to haul sugar home. Lay free bridge pieces from islands you hold; claim the islets with Outposts to bridge farther and give Grunts a closer drop-off. Your commander builds Outposts, Workshops and Altars in person; build pulses fly out for everything else. Monsters lay bone bridges toward you as they come. First wave in 75 seconds.','Let’s go')}
  function close(){persist();isOpen=false;if(el)el.hidden=true;A.quiet(false);A.onExit()}
  function frame(rdt){if(!isOpen)return;const dt=Math.min(.1,rdt);if(el.querySelector('#dfMsg').hidden)tick(dt);draw(dt);
    uiT+=rdt;if(uiT>.25){uiT=0;el.querySelector('#dfStats').innerHTML=statHtml();if(D.b.some(q=>q.t==='workshop'&&!q.bp)!==!!el.querySelector('[data-df="disc"]'))refreshBar()}saveT+=rdt;if(saveT>10){saveT=0;persist()}}
  return{dirty:()=>{topo++},canPlaceB,cam,takeBoon,open,close,frame,get isOpen(){return isOpen},get state(){return D},tick,tapTile,buyGrunt,placeB,placeBridge,setMode:(m,s)=>{mode=m;slot=s==null?-1:s},conn:()=>conn()};
}
