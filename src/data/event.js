// Candy Defense, the Halloween event. The mode itself is in ../defense.js; this file holds the event dates,
// the monsters and the Candy shop.
export const EV={id:'halloween26',n:'Candy Defense',start:'2026-10-15',end:'2026-11-01'};
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
