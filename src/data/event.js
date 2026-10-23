// Candy Defense: the Halloween event. A 50×20 field beside your main game: the candy bucket sits on the left edge,
// monsters walk in from the right. Turrets and Ammo Presses are paid for from your main game's storage,
// and presses keep turning storage into ammo for the turrets around them.
export const EV={id:'halloween26',n:'Candy Defense',start:'2026-10-15',end:'2026-11-01'};
export const EVW=50,EVH=20,EV_LIVES=25,EV_GAP=25;

// air: can hit flyers. splash: tiles. chain: extra targets the shot jumps to.
export const TURRETS={
  popper:{n:'Pumpkin Popper',cost:{iron:40,gear:10},ammo:'shot',dmg:4,range:3,rate:1.2,air:false,col:'#ee7a22',d:'Cheap and quick. Ground only.'},
  mortar:{n:'Garlic Mortar',cost:{steel:30,motor:4},ammo:'garlic',dmg:10,range:4.5,rate:.45,splash:1.2,air:false,col:'#efe6c0',d:'Lobs garlic that splashes nearby monsters. Ground only.'},
  lantern:{n:'Holy Lantern',cost:{lens:20,circuit:20},ammo:'glow',dmg:2,range:3.5,rate:3,air:true,col:'#ffe68a',d:'Rapid beams of light. Hits bats and ghosts too.'},
  ballista:{n:'Silver Ballista',cost:{frame:10,processor:6,steel:40},ammo:'silver',dmg:30,range:6,rate:.5,air:true,col:'#dfe6ff',d:'Heavy silver bolts at long range. Hits flyers.'},
  spire:{n:'Husk Spire',cost:{lattice:1,photonic:10,composite:10},ammo:'huskshot',dmg:80,range:7,rate:.5,air:true,chain:2,col:'#c99bff',d:'Fires Aether husks that arc to two more monsters.'}
};
// What a press makes, from main-game storage
export const AMMO={
  shot:{n:'Iron shot',in:{iron:1},out:5},
  garlic:{n:'Garlic shells',in:{steel:1,carbon:1},out:4},
  glow:{n:'Glow charges',in:{glass:2,wire:2},out:6},
  silver:{n:'Silver bolts',in:{steel:1,wire:4,copper:2},out:2},
  huskshot:{n:'Husk rounds',in:{husk:1},out:3}
};
export const FENCE={n:'Graveyard Fence',cost:{iron:4},d:'Cheap and does nothing but block. Walkers go around it, so use fences to funnel them past your turrets. Flyers ignore fences.'};
export const PRESS={n:'Ammo Press',cost:{iron:30,gear:10,circuit:5},range:2,d:'Turns materials from your main game’s storage into ammo, and loads turrets within 2 tiles that use it. Tap a press to change what it makes.'};
export const FOES={
  skeleton:{n:'Skeleton',hp:12,spd:1.1,leak:1,col:'#e8e2d0'},
  zombie:{n:'Zombie',hp:35,spd:.55,leak:2,col:'#7fae5a'},
  bat:{n:'Bat',hp:8,spd:1.8,leak:1,air:true,col:'#3a2a4a'},
  ghost:{n:'Ghost',hp:30,spd:.8,leak:2,air:true,col:'#d8e6ff'},
  vampire:{n:'Vampire',hp:70,spd:1,leak:3,heal:2,col:'#a01830'},
  king:{n:'Pumpkin King',hp:600,spd:.45,leak:10,boss:true,col:'#ff8a1a'}
};
// Candy shop: spend Candy once the event is over. Levels are account-wide.
export const CANDY_UP={
  sugar:{n:'Sugar Rush',max:5,cost:100,d:'Every machine works 5% faster in every main game, per level.'},
  moon:{n:'Harvest Moon',max:3,cost:120,d:'Solar and the halo make 10% more power in every main game, per level.'},
  seeds:{n:'Candy Starseeds',cost:150,d:'+10 Starseeds in the main game you’re playing.'},
  treat:{n:'Trick or Treat',cost:250,d:'Choose a Relic from three in the main game you’re playing.'}
};
