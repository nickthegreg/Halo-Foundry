// Playlist and harmony helpers for the generative soundtrack.
const ION=[0,2,4,5,7,9,11],DOR=[0,2,3,5,7,9,10],AEO=[0,2,3,5,7,8,10],PHR=[0,1,3,5,7,8,10],HMIN=[0,2,3,5,7,8,11];
// default 4/4
const LANE_V={k:1,kj:1,s:.8,c:.7,h:.25,o:.3,r:.28,b:.4,sh:.22,rim:.35,t:.6,hp:.28};
const TUNES=[
  {n:'Regolith Dawn',g:'Ambient',vol:.7,bpm:64,key:62,scale:DOR,prog:['Dm9','Bbmaj7','Fmaj7','C6'],comp:{inst:'pad',mode:'hold',v:.11,cut:900},bass:{inst:'bass',pat:'1...............',v:.17},mel:{inst:'bell',dens:.3,step:4,base:74,v:.09}},
  {n:'Night Shift',g:'Ambient',vol:.65,bpm:54,key:60,scale:AEO,prog:['Cm9','Abmaj7','Fm9','G7'],comp:{inst:'pad',mode:'hold',v:.13,cut:520},bass:{inst:'bass',pat:'1...............',v:.2},mel:{inst:'glass',dens:.22,step:4,base:79,v:.07}},
  {n:'Halo Hymn',g:'Ambient',vol:.8,bpm:68,key:64,scale:ION,prog:['E','B','C#m7','Amaj7'],comp:{inst:'strings',mode:'hold',v:.06,cut:1500},comp2:{inst:'pad',mode:'hold',v:.06,cut:1400},bass:{inst:'bass',pat:'1.......5.......',v:.15},arp:{inst:'bell',seq:[0,1,2,3,2,1],every:4,v:.035,oct:1},mel:{inst:'glass',dens:.22,step:4,base:76,v:.07}},
  {n:'Iron Front',g:'Command',bpm:112,key:64,scale:PHR,prog:['Em','Em','C','D','Em','Em','F','B7'],dv:.24,drums:{k:'X.....x.x.......',s:'....X.......X...',h:'x.x.x.x.x.x.x.x.'},comp:{inst:'brass',mode:'pat',pat:'X.....x.........',v:.07},bass:{inst:'synthbass',pat:'1.18.11.1.18.15.',v:.15},arp:{inst:'arp',seq:[0,1,2,1],every:1,v:.03,oct:1},mel:{inst:'synlead',dens:.35,step:2,base:76,v:.055}},
  {n:'Command Uplink',g:'Command',bpm:128,key:62,scale:AEO,prog:['Dm','Bb','C','Dm','Dm','Bb','Gm','A'],dv:.22,drums:{k:'X...x...X...x...',s:'....X.......X..x',h:'..x...x...x...x.'},comp:{inst:'strings',mode:'hold',v:.05,cut:1600},bass:{inst:'synthbass',pat:'1.1.1.1.1.1.1.8.',v:.14},arp:{inst:'arp',seq:[0,2,1,2,0,2,1,3],every:1,v:.035,oct:1},mel:{inst:'synlead',dens:.4,step:2,base:74,v:.05}},
  {n:'Lobby Level 3',g:'Elevator',bpm:100,key:65,scale:ION,prog:['Fmaj7','Fmaj7','Gm7','C7','Am7','D7','Gm7','C9'],dv:.18,kick:'kj',drums:{sh:'x-xxx-xxx-xxx-xx',rim:'x..x..x...x..x..',k:'x..x....x..x....'},comp:{inst:'ep',mode:'pat',pat:'x..x..x...x..x..',v:.05},bass:{inst:'upright',pat:'1..5..1.1..5..1.',v:.17},mel:{inst:'vibes',dens:.42,step:2,base:77,v:.07}},
  {n:'Hold Please',g:'Elevator',bpm:92,key:58,scale:ION,prog:['Bbmaj7','Gm7','Cm7','F7','Dm7','G7','Cm7','F7'],dv:.16,kick:'kj',drums:{b:'x.x.x.x.x.x.x.x.',k:'x.......x.......'},comp:{inst:'strings',mode:'hold',v:.05,cut:2000},comp2:{inst:'piano',mode:'pat',pat:'..x...x...x...x.',v:.035},bass:{inst:'upright',pat:'1.......5.......',v:.15},mel:{inst:'flute',dens:.38,step:2,base:74,v:.065}},
  {n:'Blue Regolith',g:'Chill jazz',bpm:96,swing:.16,key:60,scale:ION,prog:['Dm9','G13','Cmaj9','A7b9'],dv:.2,kick:'kj',drums:{r:'x...x.x.x...x.x.',hp:'....x.......x...',k:'-.......-.......'},comp:{inst:'ep',mode:'pat',pat:'x.....x.........',v:.05},bass:{inst:'upright',walk:true,v:.17},mel:{inst:'mtrumpet',dens:.5,step:2,base:72,v:.05}},
  {n:'Late Shift Lounge',g:'Chill jazz',bpm:72,swing:.14,key:63,scale:ION,prog:['Ebmaj7','Cm7','Fm7','Bb7','Gm7','C7','Fm9','Bb13'],dv:.2,kick:'kj',drums:{b:'x...x...x...x...',hp:'....x.......x...'},comp:{inst:'piano',mode:'pat',pat:'x.......x.....x.',v:.045},bass:{inst:'upright',walk:true,v:.16},mel:{inst:'ep',dens:.4,step:2,base:75,v:.06}},
  {n:'Overclock',g:'EDM',bpm:126,key:57,scale:AEO,prog:['Am','F','C','G'],side:true,riser:true,dv:.22,drums:{k:'X...X...X...X...',c:'....x.......x...',o:'..x...x...x...x.',h:'.-.-.-.-.-.-.-.-'},comp:{inst:'supersaw',mode:'hold',v:.045,cut:2800},bass:{inst:'sub',pat:'..1...1...1...1.',v:.17},arp:{inst:'lead',seq:[0,1,2,3,2,1,0,2],every:2,v:.035,oct:1},mel:{inst:'lead',dens:.55,step:2,base:76,v:.05}},
  {n:'Petal Drop',g:'EDM',bpm:120,key:65,scale:AEO,prog:['Fm9','Bbm7','Ebmaj7','Cm7'],side:true,riser:true,dv:.22,drums:{k:'X...X...X...X...',c:'....x.......x...',o:'..x...x...x...x.',sh:'.-x-.-x-.-x-.-x-'},comp:{inst:'organ',mode:'pat',pat:'...x..x....x..x.',v:.04},bass:{inst:'sub',pat:'1..1..1...1..5..',v:.17},mel:{inst:'glass',dens:.3,step:2,base:77,v:.05}},
  {n:'Swing Shift',g:'Electro swing',bpm:122,swing:.15,key:55,scale:HMIN,prog:['Gm','Gm','Cm','D7','Gm','Eb7','D7','Gm'],dv:.22,drums:{k:'X...x...X...x...',s:'....X.......X...',c:'....x.......x...',h:'x.x.x.x.x.x.x.x.'},comp:{inst:'brass',mode:'pat',pat:'....X.......X...',v:.05},comp2:{inst:'piano',mode:'pat',pat:'..x...x...x...x.',v:.03},bass:{inst:'upright',pat:'1...5...1...5...',v:.18},mel:{inst:'clarinet',dens:.6,step:2,base:72,v:.055}},
  {n:'Cog & Cabaret',g:'Electro swing',bpm:128,swing:.15,key:58,scale:ION,prog:['Bb','G7','C7','F7','Bb','Bb7','Eb','F7'],dv:.22,drums:{k:'X...x...X...x...',c:'....X.......X...',h:'x.x.x.x.x.x.x.x.',o:'......x.......x.'},comp:{inst:'piano',mode:'pat',pat:'..x...x...x...x.',v:.035},comp2:{inst:'brass',mode:'pat',pat:'X.........x.....',v:.045},bass:{inst:'upright',pat:'1...5...1...5...',v:.18},mel:{inst:'mtrumpet',dens:.55,step:2,base:72,v:.05}}
];
const PCN={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const QUAL={'':[0,4,7],m:[0,3,7],'7':[0,4,7,10],maj7:[0,4,7,11],m7:[0,3,7,10],m9:[0,3,7,10,14],maj9:[0,4,7,11,14],'9':[0,4,7,10,14],'13':[0,4,10,14,21],'7b9':[0,4,7,10,13],dim7:[0,3,6,9],sus4:[0,5,7],'6':[0,4,7,9],m6:[0,3,7,9]};
function chordOf(sym){const m=/^([A-G])([#b]?)(.*)$/.exec(sym);const pc=(PCN[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)+12)%12;return{pc,ints:QUAL[m[3]]||QUAL['']}}
function voice(ch,lo){const s=new Set(ch.ints.map(i=>{let n=ch.pc+48+i;while(n<lo)n+=12;while(n>lo+16)n-=12;return n}));return[...s].sort((a,b)=>a-b)}
function bassRoot(ch){let r=ch.pc+36;if(r<38)r+=12;return r}
function nearestTone(ch,m){const pcs=ch.ints.map(i=>(ch.pc+i)%12);for(let d=0;d<7;d++){if(pcs.includes(((m-d)%12+12)%12))return m-d;if(pcs.includes(((m+d)%12+12)%12))return m+d}return m}
function scaleNotes(T){if(T._sc)return T._sc;const o=[];for(let m=T.mel.base-8;m<=T.mel.base+15;m++)if(T.scale.includes(((m-T.key)%12+12)%12))o.push(m);return T._sc=o}
function genMelBar(T,M){
  const spb=T.beats*4,st=T.mel.step||2,SC=scaleNotes(T),out=[];if(M.mi==null)M.mi=Math.floor(SC.length/2);
  for(let s=0;s<spb;s+=st){const strong=s%4===0;if(M.R()<T.mel.dens*(strong?1:.55)){M.mi=Math.max(0,Math.min(SC.length-1,M.mi+[-2,-1,-1,0,1,1,2][Math.floor(M.R()*7)]));let m=SC[M.mi];if(s===0||(strong&&M.R()<.5))m=nearestTone(M.ch,m);out.push({st:s,m})}}
  out.forEach((n,i)=>{const nx=i+1<out.length?out[i+1].st:spb;n.len=Math.min(nx-n.st,st*3)});return out;
}
TUNES.forEach(T=>{T.beats=T.beats||4});

export {AEO,DOR,HMIN,ION,LANE_V,PCN,PHR,QUAL,TUNES,bassRoot,chordOf,genMelBar,nearestTone,scaleNotes,voice};
