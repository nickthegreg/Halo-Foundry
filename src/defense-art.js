// Candy Defense art: pixel sprites painted once by code into small canvases, then drawn scaled up without smoothing.
// Everything is lit from the upper left. Sizes are in sprite pixels; the game scales them to tiles.
export function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hex2(c){return[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]}
export function shade(c,l){const [r,g,b]=hex2(c),f=v=>Math.max(0,Math.min(255,Math.round(v*l)));return `rgb(${f(r)},${f(g)},${f(b)})`}
function px(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');const P=(col,a,b,ww,hh)=>{x.fillStyle=col;x.fillRect(a,b,ww==null?1:ww,hh==null?1:hh)};fn(x,P);return c}
// filled ellipse, optionally shaded left (l0) to right (l1)
function ell(x,cx,cy,rx,ry,col,l0,l1){for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let i=Math.floor(cx-rx);i<=cx+rx;i++){const d=((i+.5-cx)/rx)**2+((y+.5-cy)/ry)**2;if(d>1)continue;x.fillStyle=l0==null?col:shade(col,l0+(l1-l0)*((i-cx+rx)/(2*rx)));x.fillRect(i,y,1,1)}}
// shaded box: lit left, dark right, with a little grain
function box(x,a,b,w,h,col,R,grain){for(let y=b;y<b+h;y++)for(let i=a;i<a+w;i++){let l=1.12-.6*(i-a)/Math.max(1,w-1);if(grain)l+=(R()-.5)*grain;x.fillStyle=shade(col,l);x.fillRect(i,y,1,1)}}
// stone wall with courses and joints
function stone(x,a,b,w,h,col,R){for(let y=b;y<b+h;y++)for(let i=a;i<a+w;i++){let l=1.08-.55*(i-a)/Math.max(1,w-1);if((y-b)%5===0)l-=.2;if(((((y-b)/5|0)%2)?i+3:i)%6===0)l-=.13;l+=(R()-.5)*.1;x.fillStyle=shade(col,l);x.fillRect(i,y,1,1)}}

let SPR=null;
export function sprites(){if(SPR)return SPR;SPR={};const S=SPR;
  // ---------- ground ----------
  S.ground=px(64,64,(x,P)=>{const R=mulberry(11),pal=['#4a4224','#57502b','#655d32','#5a6630','#4e5a2a','#6e6438'];
    for(let y=0;y<64;y++)for(let i=0;i<64;i++){const n=(Math.sin(i*.35+Math.sin(y*.21)*2)+Math.sin(y*.29+i*.11))*.25+R()*.7;P(pal[Math.min(pal.length-1,Math.floor(n*pal.length))],i,y)}
    for(let k=0;k<70;k++)P(R()<.5?'#33301a':'#7d7a44',R()*64|0,R()*64|0)});
  S.cliff=px(16,14,(x,P)=>{const R=mulberry(5),bands=['#6a4a32','#5a3e2a','#74513a','#4a3222','#5a3c28','#3a281c','#2e2018'];
    for(let y=0;y<14;y++)for(let i=0;i<16;i++)P(shade(bands[Math.min(6,y>>1)],.85+R()*.3),i,y);
    for(let k=0;k<4;k++){const i=R()*16|0;for(let y=2+(R()*4|0);y<14;y++)if(R()<.8)P('#1e140e',i+(R()<.3?1:0),y)}
    for(let i=0;i<16;i++)if(R()<.5)P('#4f8a3a',i,0,1,1+(R()*3|0))});
  // player bridge: planks with rope edges
  S.bridge=px(16,16,(x,P)=>{const R=mulberry(3);for(let r=0;r<4;r++){const c=['#8a6440','#7a5636','#93704a','#83603e'][r];for(let y=r*4;y<r*4+3;y++)for(let i=0;i<16;i++)P(shade(c,1.08-.25*(i/15)+(R()-.5)*.12),i,y);P('#3a2414',0,r*4+3,16,1);P('#c9a070',2,r*4+1);P('#c9a070',13,r*4+1)}
    P('#b89a6a',0,0,16,1);P('#b89a6a',0,15,16,1)});
  // enemy bridge: black ribs of bone lashed together
  S.ebridge=px(16,16,(x,P)=>{const R=mulberry(9);P('#16101c',0,0,16,16);for(let r=0;r<5;r++){const y=1+r*3;for(let i=1;i<15;i++)P(shade('#d8d0c0',.95-.4*(i/14)+(R()-.5)*.15),i,y);P('#efe8da',1,y-1);P('#efe8da',14,y-1)}
    P('#7a1020',3,6);P('#a01830',11,12)});
  S.husk=px(16,12,(x,P)=>{ell(x,8,7,7.5,4.5,'#4a3e4e',1.05,.55);ell(x,8,6.5,5,3,'#1e1624');ell(x,7,6,2,1,'#2e2436');P('#5a4a62',3,3);P('#6a5a72',12,4)});
  // geyser rim: a ring of rock around a pink candy-soda pool (bubbles are drawn live)
  S.geyser=px(20,12,(x,P)=>{ell(x,10,7,9.5,4.6,'#5a4e5a',1.1,.55);ell(x,10,6.4,6.5,3,'#ff6ab8',1.2,.7);ell(x,9,5.8,3,1.2,'#ffc0e6');P('#7a6e7a',2,5);P('#7a6e7a',17,6);P('#3a3040',6,10,8,1)});
  // ---------- candy box: a carved pumpkin bucket brimming with sweets ----------
  S.box=px(32,36,(x,P)=>{const R=mulberry(2);
    for(let y=10;y<34;y++){const t=(y-10)/24,hw=11+Math.sin(t*Math.PI)*3;for(let i=Math.round(16-hw);i<Math.round(16+hw);i++){let l=1.15-.6*(i-(16-hw))/(2*hw);if(((i-16+40)%6)===0)l-=.15;P(shade('#e8701c',l+(R()-.5)*.06),i,y)}}
    P('#8a3a08',6,33,20,1);
    ell(x,16,10,11,3,'#3a1a06');for(let k=0;k<26;k++){const i=7+(R()*18|0),y=6+(R()*5|0);P(['#ff5a8a','#7ae0ff','#ffe14a','#9aff7a','#c88aff'][R()*5|0],i,y,2,2)}
    // face
    P('#2a1006',9,16,4,3);P('#2a1006',19,16,4,3);P('#ffd66e',10,17,2,1);P('#ffd66e',20,17,2,1);
    P('#2a1006',10,24,12,3);P('#ffd66e',11,25,10,1);P('#e8701c',13,24,1,3);P('#e8701c',18,24,1,3);
    for(let i=4;i<28;i++){const y=Math.round(9-Math.sin((i-4)/24*Math.PI)*8);P('#5a3a1a',i,y);P('#9a6a3a',i,y-1)}});
  // ---------- buildings ----------
  S.disc=px(32,58,(x,P)=>{const R=mulberry(7);
    ell(x,16,51,15,6,'#4a4350',.9,.5);ell(x,16,49,15,6,'#8a8090',1.15,.6);
    stone(x,8,16,16,34,'#d4c4ac',R);
    for(const by of [22,39]){for(let i=8;i<24;i++)P(shade('#c97a36',1.2-.6*(i-8)/15),i,by,1,2);P('#5a3416',8,by+2,16,1)}
    P('#22140c',14,27,4,7);P('#ffcf6a',15,28,2,5);P('#fff2c0',15,28,1,2);
    ell(x,16,16,11,4.5,'#4e4652');ell(x,16,15,10,4,'#b0a496',1.1,.6);
    for(let k=0;k<8;k++){const a=k/8*Math.PI*2;if(Math.sin(a)<-.2)continue;P(Math.cos(a)<0?'#d8ccbc':'#857a70',Math.round(16+Math.cos(a)*9.5)-1,Math.round(15+Math.sin(a)*3.8)-3,2,3)}
    P('#5a3c18',15,8,3,8);P('#e8b85a',15,8,1,8);P('#ffd66e',14,7,5,2)});
  // generator: a bronze pylon of coils; the sun orb on top is drawn live
  S.gen=px(16,32,(x,P)=>{ell(x,8,29,7,2.6,'#4a4350',1,.5);ell(x,8,28,6.5,2.3,'#8a8090',1.15,.6);
    for(let y=10;y<28;y++)for(let i=6;i<10;i++)P(shade('#a8783a',1.2-.6*(i-6)/3),i,y);
    for(const cy of [13,18,23]){for(let i=3;i<13;i++)P(shade('#d08a3a',1.25-.7*(i-3)/9),i,cy,1,2);P('#5a3416',3,cy+2,10,1)}
    P('#5a4a2a',5,8,6,3);P('#c9a24e',5,8,2,1)});
  // sun cannon: a riveted stone drum; the bronze barrel is drawn live so it can turn
  S.cannon=px(32,26,(x,P)=>{const R=mulberry(4);ell(x,16,19,15,6.5,'#3e3646',.95,.5);
    for(let y=8;y<20;y++){for(let i=2;i<30;i++){const dx=(i-16)/14;if(Math.abs(dx)>1)continue;let l=1.12-.6*(i-2)/27+(R()-.5)*.08;if(y%4===0)l-=.15;P(shade('#9a8e86',l),i,y)}}
    ell(x,16,8,14,5,'#b8ac9e',1.15,.65);ell(x,16,8,9,3,'#6a5e58');for(let k=0;k<10;k++){const a=k/10*Math.PI*2;P('#e0c080',Math.round(16+Math.cos(a)*12),Math.round(8+Math.sin(a)*4.2))}
    for(let i=4;i<29;i+=4)P('#5a4e48',i,14)});
  // sun workshop: stone hall with a tiled roof, a sun window and a warm door
  S.workshop=px(48,56,(x,P)=>{const R=mulberry(8);ell(x,24,51,23,5,'#3e3646',.95,.5);
    stone(x,5,24,38,27,'#cbbca4',R);
    for(let y=6;y<26;y++){const inset=Math.round((26-y)*.35);for(let i=2+inset;i<46-inset;i++){let l=1.05-.5*(i/46);if((y-6)%3===0)l-=.22;if(((((y-6)/3|0)%2)?i+2:i)%5===0)l-=.12;P(shade('#9a3e2a',l+(R()-.5)*.08),i,y)}}
    P('#5a2010',2,25,44,2);P('#e0a050',9,6,30,1);
    ell(x,24,15,6,6,'#5a2a10');ell(x,24,15,4.5,4.5,'#ffd66e',1.2,.8);for(let k=0;k<8;k++){const a=k/8*Math.PI*2;P('#ffd66e',Math.round(24+Math.cos(a)*6.5),Math.round(15+Math.sin(a)*6.5))}
    P('#2a160a',20,38,8,13);P('#ffb050',21,40,6,11);P('#ffe0a0',21,40,2,4);
    P('#2a160a',9,32,6,6);P('#ffcf6a',10,33,4,4);P('#2a160a',33,32,6,6);P('#e0a050',34,33,4,4);
    P('#6a5e58',38,2,5,9);P('#9a8e86',38,2,2,9);P('#ff9a3c',39,1,3,1)});
  // altar: a carved slab draped in purple, candles lit live
  S.altar=px(32,30,(x,P)=>{const R=mulberry(6);ell(x,16,26,15,4,'#3e3646',.95,.5);
    stone(x,4,12,24,14,'#a89a90',R);ell(x,16,12,13,4,'#cfc2b4',1.15,.65);
    for(let y=14;y<24;y++)for(let i=10;i<22;i++)P(shade('#6a2a8a',1.1-.5*(i-10)/11),i,y);P('#c9a24e',10,23,12,1);
    P('#e8e0d0',8,6,2,6);P('#e8e0d0',22,6,2,6);P('#ffffff',8,6,1,6);P('#ffffff',22,6,1,6);
    P('#3a1010',14,16,4,4);P('#ff5a3a',15,17,2,2)});
  // outpost: a little timber hut with a thatched roof, a pennant and sacks of sugar
  S.outpost=px(32,36,(x,P)=>{const R=mulberry(12);ell(x,16,32,15,4,'#3e3646',.95,.5);
    for(let y=15;y<31;y++)for(let i=5;i<27;i++){let l=1.1-.55*(i-5)/21;if((i-5)%4===0)l-=.25;P(shade('#8a6440',l+(R()-.5)*.1),i,y)}
    for(let y=4;y<17;y++){const hw=Math.round((y-4)*1.05);for(let i=16-hw;i<=16+hw;i++)P(shade('#c9a24e',1.1-.55*(i-(16-hw))/(2*hw+1)+(R()-.5)*.15),i,y)}P('#7a5a20',3,16,26,1);
    P('#2a160a',13,22,6,9);P('#ffcf6a',14,24,4,7);
    P('#4a3420',27,0,1,16);P('#ff8a1a',28,1,4,3);P('#ffb050',28,1,4,1);
    ell(x,6,30,3,2.5,'#ff8ac8',1.1,.6);ell(x,26,30,3,2.5,'#ff8ac8',1.1,.6);P('#ffd0ec',5,28);P('#ffd0ec',25,28)});
  // ---------- your side ----------
  // commander mech: four frames of a walk cycle, facing right
  S.mech=[0,1,2,3].map(f=>px(24,30,(x,P)=>{const ph=[0,1,0,-1][f];
    const leg=(dx,c1,c2,up)=>{P(c2,9+dx,18,3,5);P(c1,9+dx,18,1,5);P(c2,9+dx,22+up,3,5);P(c1,9+dx,22+up,1,5);P('#22262e',8+dx,27+up,5,2);P('#5a6672',8+dx,27+up,5,1)};
    leg(2-ph*2,'#5a6672','#353d47',f===3?-1:0);leg(ph*2,'#9aa8b6','#5a6672',f===1?-1:0);
    P('#353d47',7,16,10,3);
    for(let y=6;y<17;y++)for(let i=5;i<19;i++){if((y===6||y===16)&&(i===5||i===18))continue;const t=(i-5)/13*.7+(y-6)/10*.3;P(shade('#3f9a8e',1.25-.7*t),i,y)}
    P('#1e5a52',5,6,14,1);P('#d29a44',5,14,14,1);P('#7a5520',5,15,14,1);
    P('#10201e',8,9,8,3);P('#7ff0d0',9,10,6,1);P('#e8fffa',9,10,2,1);
    P('#2f6f66',2,8,4,6);P('#5fc0b2',2,8,1,6);P('#1e4a44',2,13,4,1);
    P('#3a434e',17,10,6,4);P('#5a6672',17,10,6,1);P('#1a1d24',22,11,2,2);P('#ff9a3c',23,11,1,2);
    P('#9aa8b6',7,2,1,4);P('#ff5a5a',7,1,1,1)}));
  // grunt: a little hooded hauler, two frames
  S.grunt=[0,1].map(f=>px(14,17,(x,P)=>{P('#2a1c12',4+f,14,2,3);P('#2a1c12',8-f,14,2,3);
    for(let y=5;y<15;y++){const h=2+(y-5)*.42;for(let i=Math.round(7-h);i<Math.round(7+h);i++)P(shade('#8a6a48',1.15-.6*(i-(7-h))/(2*h)),i,y)}
    P('#6a4e34',4,2,6,4);P('#7a5c40',4,2,2,4);P('#140e08',5,4,4,2);P('#ffcf6a',6,5,1,1);P('#ffcf6a',8,5,1,1);P('#5a3e26',3,9,8,1)}));
  // ---------- monsters ----------
  S.skeleton=[0,1].map(f=>px(12,18,(x,P)=>{ell(x,6,4,4,3.6,'#ece6d6',1.1,.7);P('#1a1020',3,3,2,2);P('#1a1020',7,3,2,2);P('#1a1020',5,6,2,1);
    for(let y=8;y<13;y+=2)P('#d8d0c0',3,y,6,1);P('#d8d0c0',5,8,2,5);P('#c8c0b0',1,9,2,1);P('#c8c0b0',9,9,2,1);P('#c8c0b0',0,10,1,3);P('#c8c0b0',11,10,1,3);
    P('#d8d0c0',4+f,13,1,5);P('#d8d0c0',7-f,13,1,5);P('#b8b0a0',3+f,17,2,1);P('#b8b0a0',7-f,17,2,1)}));
  S.zombie=[0,1].map(f=>px(14,18,(x,P)=>{ell(x,7,4,4,3.6,'#7fae5a',1.1,.6);P('#1a2010',4,3,2,1);P('#ff4a3a',8,3,2,1);P('#3a2a1a',5,6,4,1);
    box(x,3,8,8,6,'#6a3a7a',null,0);P('#4a2a5a',4,12,2,2);P('#7fae5a',11,9,3,2);P('#7fae5a',12,8,2,1);
    P('#3a3a4a',4+f,14,2,4);P('#3a3a4a',8-f,14,2,4)}));
  S.bat=[0,1].map(f=>px(18,10,(x,P)=>{ell(x,9,5,2.5,3,'#3a2a4a');P('#ffb347',8,4);P('#ffb347',10,4);P('#2a1a34',7,1);P('#2a1a34',11,1);
    const up=f===0;for(let i=0;i<7;i++){const y=up?4-Math.round(Math.sin(i/6*Math.PI)*3):5+Math.round(i*.3);P('#4a3a5a',1+i,y,1,2);P('#4a3a5a',16-i,y,1,2)}}));
  S.ghost=px(14,18,(x,P)=>{for(let y=1;y<17;y++){const hw=y<7?Math.sqrt(Math.max(0,36-(7-y)**2)):6;for(let i=Math.round(7-hw);i<Math.round(7+hw);i++){if(y>13&&((i+y)%4<2))continue;P(shade('#d8e6ff',1.12-.5*(i-(7-hw))/(2*hw)),i,y)}}
    P('#1a1a3a',4,6,2,3);P('#1a1a3a',8,6,2,3);P('#1a1a3a',6,10,2,2)});
  S.vampire=[0,1].map(f=>px(14,20,(x,P)=>{ell(x,7,4,3.4,3.4,'#e8d8d0',1.1,.7);P('#1a0a10',4,1,6,2);P('#c01830',5,4);P('#c01830',8,4);P('#fff',6,6,1,1);P('#fff',7,6,1,1);
    for(let y=7;y<18;y++){const hw=3+(y-7)*.35;for(let i=Math.round(7-hw);i<Math.round(7+hw);i++)P(shade('#2a1426',1.1-.5*(i-(7-hw))/(2*hw)),i,y)}P('#a01830',3,7,8,2);P('#a01830',2,8,1,3);P('#a01830',11,8,1,3);
    P('#1a0a10',5+f,18,2,2);P('#1a0a10',8-f,18,2,2)}));
  S.king=px(30,32,(x,P)=>{const R=mulberry(13);for(let y=8;y<31;y++){const t=(y-8)/23,hw=10+Math.sin(t*Math.PI)*4;for(let i=Math.round(15-hw);i<Math.round(15+hw);i++){let l=1.15-.6*(i-(15-hw))/(2*hw);if(((i-15+40)%5)===0)l-=.15;P(shade('#ff8a1a',l+(R()-.5)*.06),i,y)}}
    P('#3a5a1a',13,5,4,4);for(const cx of [8,15,22])for(let y=0;y<5;y++)P('#ffd66e',cx-(4-y>>1),y+1,(4-y)+1,1);P('#e8b030',6,5,19,2);P('#ff3a5a',15,3);
    P('#2a1006',8,14,5,4);P('#2a1006',18,14,5,4);P('#ffe14a',9,15,3,2);P('#ffe14a',19,15,3,2);
    P('#2a1006',9,22,13,4);for(let i=10;i<21;i+=3)P('#ffe14a',i,23,2,2)});
  return S}
