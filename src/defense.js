// Candy Defense: a standalone mode opened from the main menu. A floating island in a stormy sky, a candy box to
// protect, candy geysers to mine with grunts and your commander, bridges to reach them, and sun towers to hold off
// the waves. Nothing here touches your main game's storage; your Commander levels carry in as bonuses.
import {FOES} from './data/event.js';

const MW=64,MH=32,KEY='halo-foundry-defense';
const DIR4=[[0,-1],[1,0],[0,1],[-1,0]];
// Tile kinds in D.land
const SKY=0,LAND=1,BRIDGE=2,HUSK=3,GEY=4;
const START_MONEY=400,BOX_HP=1000,BOX_R=4.5,GEN_R=6,PREP=75,GAP=30;
const BUILD={
  workshop:{n:'Sun Workshop',w:3,cost:300,hp:400,land:true,d:'Unlocks the sun towers: Generator, Disc Thrower and Sun Cannon. Build on the island.'},
  generator:{n:'Generator',w:1,cost:100,hp:120,power:true,d:'Powers everything within a large circle. Must itself be placed in power: the candy box powers a small circle around it.'},
  disc:{n:'Disc Thrower',w:2,cost:150,hp:200,power:true,range:4,dmg:6,rate:3,air:true,d:'A spinning arm that flings sun discs fast. Hits walkers and flyers.'},
  cannon:{n:'Sun Cannon',w:2,cost:200,hp:300,power:true,range:6,dmg:30,rate:.5,splash:1,d:'Fires along one of four directions and has to turn to switch. Deadly to walkers, mostly misses flyers.'}
};
const UNIT={grunt:{n:'Grunt',cost:50,hp:40,spd:1.15,carry:200}};
const CMDR={hp:300,spd:2.2,carry:300,range:3.5,dmg:8,rate:1.5};
// What each monster does to whatever it reaches, per second
const BITE={skeleton:4,zombie:7,bat:3,ghost:5,vampire:9,king:35};
// Bridge pieces: every shape of 1 to 5 tiles
const PIECES=[[[0,0]],[[0,0],[1,0]],[[0,0],[1,0],[2,0]],[[0,0],[0,1],[1,1]],
  [[0,0],[1,0],[2,0],[3,0]],[[0,0],[0,1],[0,2],[1,2]],[[0,0],[1,0],[2,0],[1,1]],[[1,0],[2,0],[0,1],[1,1]],[[0,0],[1,0],[0,1],[1,1]],
  [[0,0],[1,0],[2,0],[3,0],[4,0]],[[0,0],[0,1],[0,2],[0,3],[1,3]],[[0,0],[1,0],[0,1],[1,1],[0,2]],[[0,0],[1,0],[2,0],[1,1],[1,2]],
  [[0,0],[2,0],[0,1],[1,1],[2,1]],[[0,0],[0,1],[0,2],[1,2],[2,2]],[[0,0],[0,1],[1,1],[1,2],[2,2]],[[0,0],[1,0],[1,1],[1,2],[2,2]],
  [[1,0],[2,0],[0,1],[1,1],[1,2]],[[1,0],[0,1],[1,1],[2,1],[1,2]],[[0,0],[0,1],[1,1],[1,2],[1,3]],[[1,0],[0,1],[1,1],[1,2],[1,3]]];
function norm(c){const mx=Math.min(...c.map(p=>p[0])),my=Math.min(...c.map(p=>p[1]));return c.map(([x,y])=>[x-mx,y-my])}
function rot(c){return norm(c.map(([x,y])=>[-y,x]))}
function randPiece(){let c=PIECES[Math.random()*PIECES.length|0];for(let k=Math.random()*4|0;k>0;k--)c=rot(c);return c}
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function waveList(w){const q=[],n=6+2*w,pool=[['skeleton',5]];if(w>=2)pool.push(['zombie',3]);if(w>=3)pool.push(['bat',3]);if(w>=6)pool.push(['ghost',2]);if(w>=8)pool.push(['vampire',2]);
  const tot=pool.reduce((a,p)=>a+p[1],0);for(let i=0;i<n;i++){let r=Math.random()*tot;for(const [t,wt] of pool){r-=wt;if(r<=0){q.push(t);break}}}if(w%10===0)q.push('king');return q}

export function makeDefense(A){
  // A: {sfx(kind), toast(text), META, saveMeta(), cmdLv(key), candyFor(waves), onExit(), showCandyShop()}
  let D=null,isOpen=false,el,cv,g,dpr=1,VW=0,VH=0,uiT=0,saveT=0,mode='cmd',slot=-1,hover=null,FF={},topo=0,nid=1;
  const cam={x:12,y:16,z:24};
  // ---------- commander bonuses from Commander levels ----------
  const cb=()=>({spd:1+.08*A.cmdLv('industrialist'),dmg:1+.15*A.cmdLv('stellar'),hp:1+.15*A.cmdLv('ember'),inc:1+.1*A.cmdLv('architect')});

  // ---------- a new island ----------
  function fresh(){
    const seed=Math.random()*1e9|0,R=mulberry(seed),land=new Array(MW*MH).fill(SKY);
    const cx=10.5,cy=16,p=[R()*6.3,R()*6.3,R()*6.3],sx=.9+R()*.2,sy=.9+R()*.2;
    for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const dx=(x+.5-cx)/sx,dy=(y+.5-cy)/sy,a=Math.atan2(dy,dx),d=Math.hypot(dx,dy);
      const r=7.6+1.1*Math.sin(2*a+p[0])+.7*Math.sin(3*a+p[1])+.45*Math.sin(5*a+p[2]);if(d<r)land[y*MW+x]=LAND}
    // candy box: a 2×2 spot with land all around it
    const ok=(x,y)=>{for(let j=-1;j<=2;j++)for(let i=-1;i<=2;i++)if(land[(y+j)*MW+x+i]!==LAND)return false;return true};
    let bx=9,by=15;for(let n=0;n<400;n++){const x=4+(R()*14|0),y=8+(R()*16|0);if(ok(x,y)){bx=x;by=y;break}}
    // geysers: three just off the island's shore, three richer ones farther out
    const geysers=[],put=(x,y,amt)=>{x=Math.max(1,Math.min(MW-2,Math.round(x)));y=Math.max(1,Math.min(MH-2,Math.round(y)));const i=y*MW+x;if(land[i]!==SKY)return false;land[i]=GEY;geysers.push({x,y,amt,max:amt,land:false});return true};
    const a0=R()*6.3;
    for(let k=0;k<3;k++){const a=a0+k*2.1+(R()-.5)*.4;let r=6;while(r<20){const x=cx+Math.cos(a)*r*sx,y=cy+Math.sin(a)*r*sy;if(x<1||y<1||x>MW-2||y>MH-2){r=19;break}if(land[Math.round(y)*MW+Math.round(x)]===SKY)break;r+=.5}
      const d=r+2+R()*2.5;if(!put(cx+Math.cos(a)*d*sx,cy+Math.sin(a)*d*sy,3000+(R()*1001|0)))put(cx+18+k*3,4+k*11,3500)}
    for(let k=0;k<3;k++)for(let n=0;n<20;n++)if(put(27+R()*20,3+k*10+R()*6,5000+(R()*1001|0)))break;
    const b=[];
    return{v:1,seed,land,box:{x:bx,y:by,hp:BOX_HP,max:BOX_HP},geysers,b,u:[],cmd:null,cmdDead:0,foes:[],shots:[],money:START_MONEY,wave:0,cleared:0,next:PREP,q:[],qt:0,
      slots:[randPiece(),randPiece(),randPiece(),randPiece()],slotT:[0,0,0,0],t:0,thunder:6+Math.random()*8,flash:0,bolt:null,kills:0,mined:0};
  }
  function spawnCmd(){const c=cb();D.cmd={id:nid++,t:'cmd',x:D.box.x+1,y:D.box.y+2.6,hp:CMDR.hp*c.hp,max:CMDR.hp*c.hp,carry:0,st:'idle',cd:0,order:null}}
  function load(){try{const d=JSON.parse(localStorage.getItem(KEY)||'null');if(d&&d.v===1&&Array.isArray(d.land)&&d.land.length===MW*MH){d.foes=[];d.shots=[];d.q=[];
      // a wave under way when you left starts again
      if(d.wave>d.cleared){d.wave=d.cleared;d.next=Math.min(d.next||GAP,10)}d.u=(d.u||[]).filter(u=>u.t==='grunt').map(u=>Object.assign(u,{st:'seek',tg:null}));for(const q of d.u)q.id=nid++;for(const q of d.b)q.id=nid++;
      if(!Array.isArray(d.slots)||d.slots.length!==4)d.slots=[randPiece(),randPiece(),randPiece(),randPiece()];d.slotT=d.slotT||[0,0,0,0];return d}}catch(_){}return fresh()}
  function persist(){if(!D)return;try{const s=Object.assign({},D,{foes:[],shots:[],q:[],bolt:null,cmd:null,u:D.u.map(u=>({t:u.t,x:u.x,y:u.y,hp:u.hp,max:u.max,carry:u.carry||0})),b:D.b.map(q=>({t:q.t,x:q.x,y:q.y,w:q.w,hp:q.hp,max:q.max,face:q.face||1}))});localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}

  // ---------- map helpers ----------
  const idx=(x,y)=>y*MW+x,inb=(x,y)=>x>=0&&y>=0&&x<MW&&y<MH;
  const walk=i=>D.land[i]!==SKY;
  function bAt(x,y){for(const q of D.b)if(x>=q.x&&y>=q.y&&x<q.x+q.w&&y<q.y+q.w)return q;return null}
  const onBox=(x,y)=>x>=D.box.x&&y>=D.box.y&&x<D.box.x+2&&y<D.box.y+2;
  const gAt=(x,y)=>D.geysers.find(q=>q.amt>0&&q.x===x&&q.y===y);
  function flow(key,targets){if(FF[key]&&FF[key].v===topo)return FF[key].F;const F=new Int16Array(MW*MH).fill(-1),Q=[];for(const i of targets){F[i]=0;Q.push(i)}
    for(let h=0;h<Q.length;h++){const i=Q[h],x=i%MW,y=(i/MW)|0;for(const [dx,dy] of DIR4){const xx=x+dx,yy=y+dy;if(!inb(xx,yy))continue;const j=idx(xx,yy);if(F[j]>=0||!walk(j))continue;F[j]=F[i]+1;Q.push(j)}}
    FF[key]={v:topo,F};return F}
  const boxFlow=()=>flow('box',[idx(D.box.x,D.box.y),idx(D.box.x+1,D.box.y),idx(D.box.x,D.box.y+1),idx(D.box.x+1,D.box.y+1)]);
  const gFlow=gy=>flow('g'+gy.x+','+gy.y,[idx(gy.x,gy.y)]);
  function moveTo(u,tx,ty,step){const vx=tx-u.x,vy=ty-u.y,l=Math.hypot(vx,vy);if(l<=step){u.x=tx;u.y=ty;return true}u.x+=vx/l*step;u.y+=vy/l*step;return false}
  // Walk one step down a flow field; 'here' when standing on a target tile
  function follow(u,F,step){const ix=Math.floor(u.x),iy=Math.floor(u.y);if(!inb(ix,iy))return 'stuck';const d=F[idx(ix,iy)];if(d<0)return 'stuck';
    if(d===0)return moveTo(u,ix+.5,iy+.5,step)?'here':'go';let bx=ix,by=iy,bd=d;for(const [dx,dy] of DIR4){const xx=ix+dx,yy=iy+dy;if(!inb(xx,yy))continue;const v=F[idx(xx,yy)];if(v>=0&&v<bd){bd=v;bx=xx;by=yy}}
    moveTo(u,bx+.5,by+.5,step);return 'go'}
  function nearestGeyser(u){let best=null,bd=1e9;const ix=Math.floor(u.x),iy=Math.floor(u.y);for(const gy of D.geysers){if(gy.amt<=0)continue;const F=gFlow(gy),d=F[idx(ix,iy)];if(d>=0&&d<bd){bd=d;best=gy}}return best}
  function drain(gy,n){const take=Math.min(n,gy.amt);gy.amt-=take;if(gy.amt<=0){const i=idx(gy.x,gy.y);D.land[i]=gy.land?LAND:HUSK;topo++;A.sfx('remove')}return take}

  // ---------- power ----------
  function powered(){const src=[{x:D.box.x+1,y:D.box.y+1,r:BOX_R}];const gens=D.b.filter(q=>q.t==='generator');let grew=true;const on=new Set();
    while(grew){grew=false;for(const q of gens){if(on.has(q))continue;if(src.some(s=>Math.hypot(q.x+.5-s.x,q.y+.5-s.y)<=s.r)){on.add(q);src.push({x:q.x+.5,y:q.y+.5,r:GEN_R});grew=true}}}
    return src}
  function inPower(src,x,y){return src.some(s=>Math.hypot(x-s.x,y-s.y)<=s.r)}
  let SRC=[];

  // ---------- simulation ----------
  function tick(dt){
    const B=D;B.t+=dt;const c=cb();
    // storm
    B.thunder-=dt;if(B.thunder<=0){B.thunder=8+Math.random()*16;B.flash=1;B.bolt={x:Math.random()*MW,t:.25,seed:Math.random()*1e9|0};setTimeout(()=>{if(isOpen)A.sfx('thunder')},300+Math.random()*900)}
    B.flash=Math.max(0,B.flash-dt*2.2);if(B.bolt){B.bolt.t-=dt;if(B.bolt.t<=0)B.bolt=null}
    // bridge slots refill
    for(let i=0;i<4;i++)if(!B.slots[i]){B.slotT[i]-=dt;if(B.slotT[i]<=0){B.slots[i]=randPiece();drawSlots()}}
    if(Math.floor(B.t*2)!==Math.floor((B.t-dt)*2))SRC=powered();
    // commander
    if(!B.cmd){B.cmdDead-=dt;if(B.cmdDead<=0)spawnCmd()}
    // units: grunts loop geyser → box; the commander follows orders or gathers
    const units=[...B.u];if(B.cmd)units.push(B.cmd);
    for(const u of units){const spd=(u.t==='cmd'?CMDR.spd*c.spd:UNIT.grunt.spd)*dt,cap=Math.round((u.t==='cmd'?CMDR.carry:UNIT.grunt.carry)*c.inc);
      if(u.t==='cmd'){u.cd-=dt;if(u.cd<=0){let tg=null,bd=CMDR.range;for(const f of B.foes){const d=Math.hypot(f.x-u.x,f.y-u.y);if(d<bd){bd=d;tg=f}}if(tg){u.cd=1/(CMDR.rate*c.spd);tg.hp-=CMDR.dmg*c.dmg;B.shots.push({k:'bolt',x1:u.x,y1:u.y,x2:tg.x,y2:tg.y,life:.15})}}
        if(u.order&&u.order.type==='move'){const F=flow('m'+u.order.x+','+u.order.y,[idx(u.order.x,u.order.y)]),r=follow(u,F,spd);if(r!=='go')u.order=null;continue}
        if(!u.order)continue}
      if(u.st==='mine'){u.mt-=dt;if(u.mt<=0){if(u.tg&&u.tg.amt>0){u.carry=drain(u.tg,cap);B.mined+=u.carry}u.st='home'}continue}
      if(u.carry>0||u.st==='home'){const r=follow(u,boxFlow(),spd);if(r==='here'||(r==='go'&&onBox(Math.floor(u.x),Math.floor(u.y)))){B.money+=u.carry;if(u.carry)A.sfx('core');u.carry=0;u.st='seek'}else if(r==='stuck')u.st='seek';continue}
      if(!u.tg||u.tg.amt<=0||u.st==='seek'){const wanted=u.t==='cmd'&&u.order&&u.order.type==='gather'&&u.order.g.amt>0?u.order.g:null;u.tg=wanted||nearestGeyser(u);u.st=u.tg?'go':'idle';if(!u.tg){if(u.t==='cmd')u.order=null;continue}}
      const r=follow(u,gFlow(u.tg),spd);if(r==='here'){u.st='mine';u.mt=1.4}else if(r==='stuck'){u.tg=null;u.st='seek'}}
    // towers
    for(const q of B.b){const T=BUILD[q.t];q.on=!T.power||inPower(SRC,q.x+q.w/2,q.y+q.w/2);if(!q.on)continue;
      if(q.t==='disc'){q.ang=(q.ang||0)+dt*14;q.cd=(q.cd||0)-dt;if(q.cd>0)continue;const cx=q.x+1,cy=q.y+1;let tg=null,bd=T.range;for(const f of B.foes){const d=Math.hypot(f.x-cx,f.y-cy);if(d<bd){bd=d;tg=f}}
        if(tg){q.cd=1/T.rate;const a=q.ang;B.shots.push({k:'disc',x:cx+Math.cos(a)*.8,y:cy+Math.sin(a)*.8,tg,dmg:T.dmg,life:1.2})}}
      if(q.t==='cannon'){q.cd=(q.cd||0)-dt;const cx=q.x+1,cy=q.y+1;if(q.face==null)q.face=1;
        let tg=null,bd=T.range,want=q.face;for(const f of B.foes){const dx=f.x-cx,dy=f.y-cy,d=Math.hypot(dx,dy);if(d>T.range)continue;const ax=Math.abs(dx)>=Math.abs(dy)?(dx>0?1:3):(dy>0?2:0),off=ax%2?Math.abs(dy):Math.abs(dx);if(off>1.1)continue;
          const score=d+(ax===q.face?0:2);if(score<bd+(want===q.face?0:2)){bd=d;tg=f;want=ax}}
        if(tg&&want!==q.face){q.turn=(q.turn||0)+dt;if(q.turn>=.9){q.face=want;q.turn=0;A.sfx('lay')}continue}q.turn=0;
        if(tg&&q.cd<=0){q.cd=1/T.rate;const [dx,dy]=DIR4[q.face],dist=Math.hypot(tg.x-cx,tg.y-cy);B.shots.push({k:'shell',x:cx+dx*.9,y:cy+dy*.9,dx,dy,left:dist-.9,dmg:T.dmg,splash:T.splash,life:3});A.sfx('place')}}}
    // waves
    if(!B.q.length&&!B.foes.length){if(B.wave>B.cleared)B.cleared=B.wave;B.next-=dt;if(B.next<=0){B.wave++;B.q=waveList(B.wave);B.qt=0;B.next=GAP;A.sfx('err')}}
    if(B.q.length){B.qt-=dt;if(B.qt<=0){B.qt=.8;const t=B.q.shift(),F=FOES[t],hp=F.hp*Math.pow(1.15,B.wave-1);B.foes.push({t,x:MW-.5,y:2+Math.random()*(MH-4),hp,max:hp,ph:Math.random()*6,bite:0})}}
    // monsters: head for the candy box, and maul anything in the way
    const prey=[...B.b.map(q=>({o:q,x:q.x+q.w/2,y:q.y+q.w/2,r:q.w/2})),...units.map(u=>({o:u,x:u.x,y:u.y,r:.3}))],box={o:B.box,x:B.box.x+1,y:B.box.y+1,r:1};
    for(const f of B.foes){const F=FOES[f.t];f.ph+=dt*6;if(F.heal)f.hp=Math.min(f.max,f.hp+F.heal*dt);let tg=box,bd=Math.hypot(box.x-f.x,box.y-f.y)-box.r;
      for(const p of prey){if(p.o.hp<=0)continue;const d=Math.hypot(p.x-f.x,p.y-f.y)-p.r;if(d<2.5&&d<bd){bd=d;tg=p}}
      if(bd>.45){const sp=F.spd*Math.min(1.6,1+.01*B.wave)*dt,vx=tg.x-f.x,vy=tg.y-f.y,l=Math.hypot(vx,vy)||1;f.x+=vx/l*sp;f.y+=vy/l*sp+(F.air?Math.sin(f.ph*.5)*dt*.4:0)}
      else{tg.o.hp-=(BITE[f.t]||4)*Math.pow(1.08,B.wave-1)*dt;f.bite=.2}
      f.bite=Math.max(0,f.bite-dt)}
    // shots
    for(const s of B.shots){s.life-=dt;
      if(s.k==='disc'){if(s.tg.hp<=0){s.life=0;continue}const step=14*dt;if(moveTo(s,s.tg.x,s.tg.y,step)){s.tg.hp-=s.dmg;s.life=0}}
      else if(s.k==='shell'){const step=9*dt;s.x+=s.dx*step;s.y+=s.dy*step;s.left-=step;if(s.left<=0){for(const f of B.foes){if(Math.hypot(f.x-s.x,f.y-s.y)>s.splash)continue;if(FOES[f.t].air&&Math.random()>.25)continue;f.hp-=s.dmg}B.shots.push({k:'boom',x:s.x,y:s.y,life:.35});s.life=0}}}
    B.shots=B.shots.filter(s=>s.life>0);
    const alive=[];for(const f of B.foes){if(f.hp<=0){B.kills++;continue}alive.push(f)}B.foes=alive;
    // casualties
    B.b=B.b.filter(q=>{if(q.hp>0)return true;A.sfx('remove');return false});
    B.u=B.u.filter(u=>u.hp>0);if(B.cmd&&B.cmd.hp<=0){B.cmd=null;B.cmdDead=15;A.toast('Your commander fell. Back in 15 seconds.')}
    if(B.box.hp<=0)lose();
  }
  function lose(){const c=D.cleared,got=A.candyFor(c);A.META.candy=(A.META.candy||0)+got;A.META.dfBest=Math.max(A.META.dfBest||0,c);A.saveMeta();A.sfx('err');
    showMsg('The candy box was smashed!',`You held out for ${c} wave${c===1?'':'s'} and earned <strong>${got} Candy</strong> (${A.META.candy} total). Best: ${A.META.dfBest} waves.`,'New island');D=fresh();FF={};topo++;nid=1;spawnCmd();persist();centerCam()}

  // ---------- player actions ----------
  function canPlaceB(t,x,y){const T=BUILD[t];for(let j=0;j<T.w;j++)for(let i=0;i<T.w;i++){const xx=x+i,yy=y+j;if(!inb(xx,yy))return 'Off the map';const v=D.land[idx(xx,yy)];
      if(T.land?v!==LAND:(v!==LAND&&v!==BRIDGE))return T.land?'Build workshops on the island':'Build on the island or a bridge';if(bAt(xx,yy)||onBox(xx,yy))return 'Something is already there';if(v===GEY)return 'That’s a geyser'}
    if(T.power&&!inPower(powered(),x+T.w/2,y+T.w/2))return 'Needs power: place it inside the candy box’s or a Generator’s circle';
    if(T.power&&!D.b.some(q=>q.t==='workshop'))return 'Build a Sun Workshop first';return null}
  function placeB(t,x,y){const T=BUILD[t],why=canPlaceB(t,x,y);if(why){A.toast(why);A.sfx('err');return}if(D.money<T.cost){A.toast(`Needs ${T.cost} sugar`);A.sfx('err');return}
    D.money-=T.cost;D.b.push({id:nid++,t,x,y,w:T.w,hp:T.hp,max:T.hp,face:1});SRC=powered();A.sfx('place');refreshBar()}
  function pieceCells(x,y){const c=D.slots[slot];if(!c)return null;const w=Math.max(...c.map(p=>p[0]))+1,h=Math.max(...c.map(p=>p[1]))+1;return c.map(([i,j])=>[x+i-Math.floor((w-1)/2),y+j-Math.floor((h-1)/2)])}
  function canBridge(cells){if(!cells)return 'Pick a bridge piece';let touch=false;for(const [x,y] of cells){if(!inb(x,y))return 'Off the map';if(D.land[idx(x,y)]!==SKY)return 'Bridges go over open sky';
      for(const [dx,dy] of DIR4){const xx=x+dx,yy=y+dy;if(inb(xx,yy)&&D.land[idx(xx,yy)]!==SKY&&!cells.some(p=>p[0]===xx&&p[1]===yy))touch=true}}return touch?null:'Bridges must touch the island, another bridge or a geyser'}
  function placeBridge(x,y){const cells=pieceCells(x,y),why=canBridge(cells);if(why){A.toast(why);A.sfx('err');return}for(const [i,j] of cells)D.land[idx(i,j)]=BRIDGE;topo++;D.slots[slot]=null;D.slotT[slot]=2.5;slot=-1;mode='cmd';A.sfx('lay');refreshBar();drawSlots()}
  function buyGrunt(){if(D.money<UNIT.grunt.cost){A.toast(`Needs ${UNIT.grunt.cost} sugar`);A.sfx('err');return}D.money-=UNIT.grunt.cost;const T=UNIT.grunt;D.u.push({id:nid++,t:'grunt',x:D.box.x+1+(Math.random()-.5),y:D.box.y+1+(Math.random()-.5),hp:T.hp,max:T.hp,carry:0,st:'seek',tg:null});A.sfx('tick')}
  function tapTile(x,y){if(!inb(x,y))return;
    if(mode==='bridge'){placeBridge(x,y);return}
    if(BUILD[mode]){const w=BUILD[mode].w,o=Math.floor((w-1)/2);placeB(mode,x-o,y-o);return}
    if(!D.cmd){A.toast('Your commander is on the way back');return}
    const gy=gAt(x,y);if(gy){D.cmd.order={type:'gather',g:gy};D.cmd.tg=gy;D.cmd.st=D.cmd.carry?'home':'go';A.sfx('tick');return}
    if(walk(idx(x,y))){D.cmd.order={type:'move',x,y};D.cmd.st='idle';A.sfx('tick')}else A.toast('Your commander can only walk on land and bridges')}

  // ---------- drawing ----------
  const W2S=(x,y)=>[(x-cam.x)*cam.z+VW/2,(y-cam.y)*cam.z+VH/2];
  const clouds=[];for(let i=0;i<34;i++)clouds.push({x:Math.random()*(MW+20)-10,y:Math.random()*(MH+8)-4,r:2+Math.random()*5,v:.15+Math.random()*.35,a:.05+Math.random()*.1,lay:Math.random()<.5});
  function drawClouds(top,dt){for(const c of clouds){if(c.lay!==top)continue;c.x+=c.v*dt*(top?1.3:1);if(c.x-c.r>MW+10)c.x=-10-c.r;const [sx,sy]=W2S(c.x,c.y),r=c.r*cam.z;
    const gr=g.createRadialGradient(sx,sy,0,sx,sy,r);gr.addColorStop(0,`rgba(${top?'210,200,235':'120,110,160'},${c.a*(top?.8:1)})`);gr.addColorStop(1,'rgba(120,110,160,0)');g.fillStyle=gr;g.fillRect(sx-r,sy-r,r*2,r*2)}}
  function draw(rdt){
    const z=cam.z,B=D;g.setTransform(dpr,0,0,dpr,0,0);
    const sky=g.createLinearGradient(0,0,0,VH);sky.addColorStop(0,'#141026');sky.addColorStop(1,'#241a3a');g.fillStyle=sky;g.fillRect(0,0,VW,VH);
    drawClouds(false,rdt);
    // map bounds
    {const [a,b]=W2S(0,0);g.strokeStyle='rgba(200,190,255,.08)';g.lineWidth=1;g.strokeRect(a,b,MW*z,MH*z)}
    const x0=Math.max(0,Math.floor(cam.x-VW/2/z)-1),x1=Math.min(MW,Math.ceil(cam.x+VW/2/z)+1),y0=Math.max(0,Math.floor(cam.y-VH/2/z)-1),y1=Math.min(MH,Math.ceil(cam.y+VH/2/z)+1);
    const L=(x,y)=>inb(x,y)?B.land[idx(x,y)]:SKY;
    // island underside: rock hanging below south edges
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){if(L(x,y)!==LAND||L(x,y+1)===LAND)continue;const [sx,sy]=W2S(x,y+1),R=mulberry(x*31+y*977)();const h=z*(.5+R*1.4);
      g.fillStyle='#2a1f2a';g.beginPath();g.moveTo(sx,sy);g.lineTo(sx+z,sy);g.lineTo(sx+z*.6,sy+h);g.lineTo(sx+z*.3,sy+h*.7);g.closePath();g.fill()}
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const v=L(x,y);if(v===SKY||v===GEY)continue;const [sx,sy]=W2S(x,y);
      if(v===LAND){g.fillStyle=(x+y)%2?'#4b3d33':'#4f4036';g.fillRect(sx,sy,z+.5,z+.5);
        // moss along the shore
        g.fillStyle='#4f8a3a';for(let d=0;d<4;d++){if(L(x+DIR4[d][0],y+DIR4[d][1])===LAND)continue;const t=z*.22;if(d===0)g.fillRect(sx,sy,z+.5,t);else if(d===1)g.fillRect(sx+z-t,sy,t,z+.5);else if(d===2)g.fillRect(sx,sy+z-t,z+.5,t);else g.fillRect(sx,sy,t,z+.5)}
        const R=mulberry(x*977+y*131)();if(R<.18){g.fillStyle='rgba(120,180,90,.5)';g.fillRect(sx+z*R*4,sy+z*.5,z*.12,z*.12)}}
      else if(v===BRIDGE){g.fillStyle='#7a5a3a';g.fillRect(sx+z*.06,sy+z*.06,z*.88,z*.88);g.strokeStyle='#4a3420';g.lineWidth=Math.max(1,z*.05);for(let k=1;k<4;k++){g.beginPath();g.moveTo(sx+z*.06,sy+z*k/4);g.lineTo(sx+z*.94,sy+z*k/4);g.stroke()}}
      else if(v===HUSK){g.fillStyle='#3a2f3e';g.beginPath();g.arc(sx+z/2,sy+z/2,z*.42,0,7);g.fill();g.strokeStyle='#5a4a62';g.stroke();g.fillStyle='#1c1622';g.beginPath();g.arc(sx+z/2,sy+z/2,z*.2,0,7);g.fill()}}
    // power circles while placing a powered building
    if(BUILD[mode]&&BUILD[mode].power){for(const s of SRC){const [a,b]=W2S(s.x,s.y);g.beginPath();g.arc(a,b,s.r*z,0,7);g.fillStyle='rgba(255,214,90,.07)';g.fill();g.strokeStyle='rgba(255,214,90,.35)';g.setLineDash([6,5]);g.stroke();g.setLineDash([])}}
    // geysers: fizzing candy soda
    for(const gy of B.geysers){if(gy.amt<=0)continue;const [a,b]=W2S(gy.x+.5,gy.y+.5),f=gy.amt/gy.max;
      g.beginPath();g.arc(a,b,z*.48,0,7);g.fillStyle='#5a2a52';g.fill();g.strokeStyle='#ff7ac8';g.lineWidth=Math.max(1.5,z*.08);g.stroke();
      for(let k=0;k<5;k++){const t=(B.t*1.6+k/5)%1,px=a+Math.sin(k*2.3+B.t*3)*z*.18,py=b-t*z*1.3;g.globalAlpha=1-t;g.fillStyle=k%2?'#ffb3e6':'#ff9a3c';g.beginPath();g.arc(px,py,z*(.12-.06*t),0,7);g.fill()}g.globalAlpha=1;
      g.fillStyle='rgba(0,0,0,.5)';g.fillRect(a-z*.5,b+z*.55,z,z*.12);g.fillStyle='#ff7ac8';g.fillRect(a-z*.5,b+z*.55,z*f,z*.12)}
    // candy box
    {const [a,b]=W2S(B.box.x,B.box.y),s=z*2;g.fillStyle='#e8701c';g.beginPath();g.moveTo(a+s*.15,b+s*.3);g.lineTo(a+s*.85,b+s*.3);g.lineTo(a+s*.78,b+s*.95);g.lineTo(a+s*.22,b+s*.95);g.closePath();g.fill();
      g.strokeStyle='#ffb070';g.lineWidth=Math.max(1,z*.08);g.beginPath();g.arc(a+s/2,b+s*.32,s*.38,Math.PI,0);g.stroke();
      g.fillStyle='#2a1406';g.beginPath();g.moveTo(a+s*.33,b+s*.48);g.lineTo(a+s*.42,b+s*.6);g.lineTo(a+s*.27,b+s*.6);g.fill();g.beginPath();g.moveTo(a+s*.67,b+s*.48);g.lineTo(a+s*.73,b+s*.6);g.lineTo(a+s*.58,b+s*.6);g.fill();
      g.fillRect(a+s*.32,b+s*.72,s*.36,s*.06);
      for(const [k,c] of [[.3,'#ff5a8a'],[.5,'#7ae0ff'],[.7,'#ffe14a']]){g.fillStyle=c;g.beginPath();g.arc(a+s*k,b+s*.28,s*.08,0,7);g.fill()}
      bar(a,b-6,s,B.box.hp/B.box.max,'#72e3b2')}
    // buildings
    for(const q of B.b){const [a,b]=W2S(q.x,q.y),s=q.w*z,cx=a+s/2,cy=b+s/2;g.globalAlpha=q.on===false?.5:1;
      if(q.t==='workshop'){g.fillStyle='#4a3a20';g.fillRect(a+z*.1,b+z*.1,s-z*.2,s-z*.2);g.strokeStyle='#f3c25a';g.lineWidth=Math.max(1,z*.08);g.strokeRect(a+z*.1,b+z*.1,s-z*.2,s-z*.2);
        g.save();g.translate(cx,cy);g.rotate(B.t*.4);g.fillStyle='#f3c25a';for(let k=0;k<8;k++){g.rotate(Math.PI/4);g.fillRect(z*.5,-z*.08,z*.4,z*.16)}g.restore();g.beginPath();g.arc(cx,cy,z*.45,0,7);g.fillStyle='#ffd66e';g.fill()}
      else if(q.t==='generator'){g.beginPath();g.arc(cx,cy,z*.4,0,7);g.fillStyle='#3a3020';g.fill();const p=.7+.3*Math.sin(B.t*4);g.beginPath();g.arc(cx,cy,z*.24*p,0,7);g.fillStyle='#ffe68a';g.fill();
        g.strokeStyle='rgba(255,230,138,.7)';g.lineWidth=Math.max(1,z*.05);for(let k=0;k<6;k++){const an=k*1.047+B.t;g.beginPath();g.moveTo(cx+Math.cos(an)*z*.3,cy+Math.sin(an)*z*.3);g.lineTo(cx+Math.cos(an)*z*.46,cy+Math.sin(an)*z*.46);g.stroke()}}
      else if(q.t==='disc'){g.beginPath();g.arc(cx,cy,s*.42,0,7);g.fillStyle='#3a3248';g.fill();g.strokeStyle='#ffd66e';g.lineWidth=Math.max(1,z*.08);g.stroke();
        g.save();g.translate(cx,cy);g.rotate(q.ang||0);g.fillStyle='#c9a24e';g.fillRect(0,-z*.08,s*.4,z*.16);g.beginPath();g.arc(s*.4,0,z*.18,0,7);g.fillStyle='#ffe68a';g.fill();g.restore();g.beginPath();g.arc(cx,cy,z*.15,0,7);g.fillStyle='#f3c25a';g.fill()}
      else if(q.t==='cannon'){g.fillStyle='#3d3550';g.fillRect(a+z*.15,b+z*.15,s-z*.3,s-z*.3);g.strokeStyle='#f3a24a';g.lineWidth=Math.max(1,z*.07);g.strokeRect(a+z*.15,b+z*.15,s-z*.3,s-z*.3);
        const fa=[-Math.PI/2,0,Math.PI/2,Math.PI][q.face||1],tw=q.turn?q.turn/.9:0;g.save();g.translate(cx,cy);g.rotate(fa+tw*.5);g.fillStyle='#2a2236';g.fillRect(0,-z*.2,s*.62,z*.4);g.fillStyle='#f3a24a';g.fillRect(s*.5,-z*.24,z*.18,z*.48);g.restore();
        g.beginPath();g.arc(cx,cy,z*.38,0,7);g.fillStyle='#f3a24a';g.fill()}
      g.globalAlpha=1;if(q.hp<q.max)bar(a,b-4,s,q.hp/q.max,'#72e3b2')}
    // units
    for(const u of [...B.u,...(B.cmd?[B.cmd]:[])]){const [a,b]=W2S(u.x,u.y),cmd=u.t==='cmd',r=z*(cmd?.36:.24);
      if(cmd){const gr=g.createRadialGradient(a,b,0,a,b,r*2.2);gr.addColorStop(0,'rgba(127,240,208,.35)');gr.addColorStop(1,'rgba(127,240,208,0)');g.fillStyle=gr;g.fillRect(a-r*2.2,b-r*2.2,r*4.4,r*4.4)}
      g.beginPath();g.arc(a,b,r,0,7);g.fillStyle=cmd?'#2f6f62':'#7a6248';g.fill();g.strokeStyle=cmd?'#7ff0d0':'#c9b08a';g.lineWidth=Math.max(1,z*.06);g.stroke();
      g.beginPath();g.arc(a,b-r*.15,r*.45,0,7);g.fillStyle=cmd?'#cffff2':'#e8d6b8';g.fill();
      if(u.carry){g.beginPath();g.arc(a+r*.8,b+r*.5,r*.45,0,7);g.fillStyle='#ff7ac8';g.fill()}
      if(u.hp<u.max)bar(a-r,b-r-5,r*2,u.hp/u.max,'#72e3b2')}
    // monsters
    for(const f of B.foes){const F=FOES[f.t],[a,b]=W2S(f.x,f.y),r=z*(F.boss?.85:F.air?.3:.36);
      if(F.air){const fl=Math.sin(f.ph)*r*.5;g.fillStyle=F.col;g.beginPath();g.ellipse(a,b,r*.45,r*.6,0,0,7);g.fill();g.beginPath();g.moveTo(a,b);g.lineTo(a-r*1.4,b-fl);g.lineTo(a-r*.6,b+r*.3);g.closePath();g.moveTo(a,b);g.lineTo(a+r*1.4,b-fl);g.lineTo(a+r*.6,b+r*.3);g.closePath();g.fill()}
      else{g.beginPath();g.arc(a,b,r,0,7);g.fillStyle=F.col;g.fill()}
      g.fillStyle=f.bite>0?'#ff3a3a':'#1a1020';g.fillRect(a-r*.45,b-r*.25,r*.25,r*.25);g.fillRect(a+r*.2,b-r*.25,r*.25,r*.25);
      if(f.hp<f.max)bar(a-r,b-r-5,r*2,f.hp/f.max,'#ff7378')}
    // shots
    for(const s of B.shots){if(s.k==='bolt'){const [a,b]=W2S(s.x1,s.y1),[c,d]=W2S(s.x2,s.y2);g.strokeStyle='#7ff0d0';g.lineWidth=Math.max(1,z*.08);g.globalAlpha=s.life*6;g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.stroke();g.globalAlpha=1}
      else if(s.k==='disc'){const [a,b]=W2S(s.x,s.y);g.beginPath();g.arc(a,b,z*.14,0,7);g.fillStyle='#ffe68a';g.fill()}
      else if(s.k==='shell'){const [a,b]=W2S(s.x,s.y);g.beginPath();g.arc(a,b,z*.16,0,7);g.fillStyle='#ffb070';g.fill()}
      else if(s.k==='boom'){const [a,b]=W2S(s.x,s.y);g.globalAlpha=s.life/.35;g.beginPath();g.arc(a,b,z*(1.2-s.life*2),0,7);g.strokeStyle='#ffb070';g.lineWidth=Math.max(1,z*.1);g.stroke();g.globalAlpha=1}}
    // placement preview
    if(hover&&(mode==='bridge'||BUILD[mode])){let cells,ok;if(mode==='bridge'){cells=pieceCells(hover[0],hover[1]);ok=cells&&!canBridge(cells)}else{const w=BUILD[mode].w,o=Math.floor((w-1)/2);cells=[];for(let j=0;j<w;j++)for(let i=0;i<w;i++)cells.push([hover[0]-o+i,hover[1]-o+j]);ok=!canPlaceB(mode,hover[0]-o,hover[1]-o)}
      if(cells)for(const [x,y] of cells){const [a,b]=W2S(x,y);g.fillStyle=ok?'rgba(127,240,208,.35)':'rgba(255,115,120,.35)';g.fillRect(a,b,z,z)}}
    drawClouds(true,rdt);
    // lightning
    if(B.bolt){const R=mulberry(B.bolt.seed);let [a,b]=W2S(B.bolt.x,-2);g.strokeStyle=`rgba(235,230,255,${Math.min(1,B.bolt.t*6)})`;g.lineWidth=2;g.beginPath();g.moveTo(a,b);for(let k=0;k<10;k++){a+=(R()-.5)*z*2;b+=VH/10;g.lineTo(a,b)}g.stroke()}
    if(B.flash>0){g.fillStyle=`rgba(225,220,255,${B.flash*.35})`;g.fillRect(0,0,VW,VH)}
  }
  function bar(x,y,w,f,c){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(x,y,w,3);g.fillStyle=c;g.fillRect(x,y,w*Math.max(0,Math.min(1,f)),3)}

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
      else if(k==='grunt')buyGrunt();else if(k==='msg'){$m().hidden=true}
      else if(k.startsWith('slot')){const i=+k.slice(4);if(!D.slots[i])return;slot=slot===i?-1:i;mode=slot>=0?'bridge':'cmd';refreshBar();drawSlots()}
      else{mode=mode===k?'cmd':k;slot=-1;refreshBar();drawSlots()}});
    // pan with one finger or the mouse, pinch or wheel to zoom, tap to act
    const P=new Map();let moved=false,pinch=0;
    cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);P.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY});moved=false;if(P.size===2){const [p,q]=[...P.values()];pinch=Math.hypot(p.x-q.x,p.y-q.y)}});
    cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect(),wx=cam.x+(e.clientX-r.left-VW/2)/cam.z,wy=cam.y+(e.clientY-r.top-VH/2)/cam.z;if(e.pointerType==='mouse')hover=[Math.floor(wx),Math.floor(wy)];
      const p=P.get(e.pointerId);if(!p)return;
      if(P.size===2){const [a,b]=[...P.values()];p.x=e.clientX;p.y=e.clientY;const d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch){zoom(d/pinch)}pinch=d;moved=true;return}
      const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;if(Math.hypot(e.clientX-p.sx,e.clientY-p.sy)>7)moved=true;if(moved){cam.x-=dx/cam.z;cam.y-=dy/cam.z;clampCam()}});
    const up=e=>{const p=P.get(e.pointerId);P.delete(e.pointerId);if(P.size<2)pinch=0;if(!p||moved)return;const r=cv.getBoundingClientRect(),wx=cam.x+(e.clientX-r.left-VW/2)/cam.z,wy=cam.y+(e.clientY-r.top-VH/2)/cam.z;hover=[Math.floor(wx),Math.floor(wy)];tapTile(Math.floor(wx),Math.floor(wy))};
    cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',e=>{P.delete(e.pointerId)});
    cv.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(-e.deltaY*.0015))},{passive:false});
    window.addEventListener('resize',()=>{if(isOpen)resize()});
  }
  const $m=()=>el.querySelector('#dfMsg');
  function showMsg(h,p,btn){const m=$m();m.innerHTML=`<div class="card"><h1>${h}</h1><p>${p}</p><button class="btn primary" data-df="msg">${btn||'OK'}</button></div>`;m.hidden=false}
  function zoom(f){cam.z=Math.max(10,Math.min(60,cam.z*f));clampCam()}
  function clampCam(){cam.x=Math.max(0,Math.min(MW,cam.x));cam.y=Math.max(0,Math.min(MH,cam.y))}
  function centerCam(){cam.x=D.box.x+1+4;cam.y=D.box.y+1;cam.z=Math.max(14,Math.min(34,VW/24))}
  function resize(){dpr=Math.min(2,window.devicePixelRatio||1);VW=window.innerWidth;VH=window.innerHeight;cv.width=VW*dpr;cv.height=VH*dpr;cv.style.width=VW+'px';cv.style.height=VH+'px'}
  function refreshBar(){const has=D.b.some(q=>q.t==='workshop'),btn=(k,label,cost,lock)=>`<button class="btn${mode===k?' primary':''}" data-df="${k}"${lock?' disabled':''}>${label}${cost!=null?` <span class="cost">${cost}</span>`:''}</button>`;
    el.querySelector('#dfActs').innerHTML=btn('cmd','Commander')+`<button class="btn" data-df="grunt">Grunt <span class="cost">${UNIT.grunt.cost}</span></button>`+btn('workshop','Sun Workshop',BUILD.workshop.cost)+
      (has?btn('generator','Generator',BUILD.generator.cost)+btn('disc','Disc Thrower',BUILD.disc.cost)+btn('cannon','Sun Cannon',BUILD.cannon.cost):'');
    const tip=mode==='bridge'?'Tap open sky next to the island or a bridge to lay this piece. ⟳ rotates it. Used pieces are replaced after a moment.':mode==='cmd'?'Tap a geyser to send your commander to collect from it, or tap land to walk there. Grunts collect on their own. Drag to look around, pinch or scroll to zoom.':BUILD[mode]?`${BUILD[mode].n} · ${BUILD[mode].cost} sugar. ${BUILD[mode].d}`:'';
    el.querySelector('#dfTip').textContent=tip}
  function drawSlots(){const row=el.querySelector('#dfSlots');row.innerHTML=D.slots.map((c,i)=>`<button class="def-slot${slot===i?' on':''}" data-df="slot${i}">${c?'<canvas width="56" height="56"></canvas>':'<span>…</span>'}</button>`).join('');
    row.querySelectorAll('canvas').forEach((k,j)=>{const i=[...row.children].indexOf(k.parentElement),c=D.slots[i],x=k.getContext('2d'),w=Math.max(...c.map(p=>p[0]))+1,h=Math.max(...c.map(p=>p[1]))+1,s=Math.min(11,Math.floor(50/Math.max(w,h)));
      for(const [px,py] of c){x.fillStyle='#7a5a3a';x.fillRect(28-w*s/2+px*s+1,28-h*s/2+py*s+1,s-2,s-2)}})}
  function statHtml(){const B=D,between=!B.q.length&&!B.foes.length,gl=B.geysers.reduce((a,q)=>a+q.amt,0);
    return `<span>🍬 <b>${Math.floor(B.money)}</b> sugar</span><span>Wave ${B.wave}${between?` · next in ${Math.ceil(B.next)}s`:` · ${B.foes.length+B.q.length} left`}</span><span>Box ${Math.ceil(B.box.hp)}/${B.box.max}</span><span>${B.u.length} grunt${B.u.length===1?'':'s'} · geysers ${Math.round(gl/1000)}k</span>`}

  function open(){if(!el)build();D=load();FF={};topo++;if(!D.cmd)spawnCmd();isOpen=true;el.hidden=false;resize();centerCam();SRC=powered();mode='cmd';slot=-1;refreshBar();drawSlots();
    if(!D.t)showMsg('Candy Defense','Protect your candy box. Send your commander to a candy geyser and buy Grunts to haul sugar home. Lay free bridge pieces to reach geysers out in the sky. Build a Sun Workshop to unlock Generators, Disc Throwers and Sun Cannons. Monsters arrive in 75 seconds.','Let’s go')}
  function close(){persist();isOpen=false;if(el)el.hidden=true;A.onExit()}
  function frame(rdt){if(!isOpen)return;const dt=Math.min(.1,rdt);if(el.querySelector('#dfMsg').hidden)tick(dt);draw(dt);
    uiT+=rdt;if(uiT>.25){uiT=0;el.querySelector('#dfStats').innerHTML=statHtml()}saveT+=rdt;if(saveT>10){saveT=0;persist()}}
  return{open,close,frame,get isOpen(){return isOpen},get state(){return D},tick,tapTile,buyGrunt,placeB,placeBridge,setMode:(m,s)=>{mode=m;slot=s==null?-1:s}};
}
