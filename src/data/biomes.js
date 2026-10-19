// Ground styles. Purely visual: ore, buildings and the world are the same in every biome.
// base/spent = tile fills, blob = [dark, light] rgba prefixes for soft patches, speck = [light, dark] grain,
// grid = tile lines, deco = which surface detail to draw, sky = space beyond the world, fog = shade past the frontier.
export const BIOMES={
  moon:{n:'Moon',base:'#38344f',spent:'#2b2840',spentDot:'rgba(200,190,255,.05)',blob:['rgba(0,0,0,','rgba(120,105,190,'],blobA:[.02,.06],
    speck:['rgba(220,210,255,.035)','rgba(0,0,0,.12)'],grid:'rgba(200,190,255,.085)',deco:'craters',sky:'#1c1a33',fog:'rgba(16,14,32,.62)'},
  desert:{n:'Desert',base:'#a98b62',spent:'#8c7150',spentDot:'rgba(255,236,200,.12)',blob:['rgba(110,60,20,','rgba(255,228,175,'],blobA:[.05,.10],
    speck:['rgba(255,242,215,.12)','rgba(90,50,18,.13)'],grid:'rgba(70,40,12,.11)',deco:'dunes',sky:'#2e2117',fog:'rgba(46,30,16,.55)'},
  grass:{n:'Grassland',base:'#4c7238',spent:'#665a42',spentDot:'rgba(230,210,170,.10)',blob:['rgba(15,45,12,','rgba(185,225,120,'],blobA:[.05,.10],
    speck:['rgba(215,245,165,.09)','rgba(14,40,12,.16)'],grid:'rgba(12,40,8,.13)',deco:'grass',sky:'#132018',fog:'rgba(12,26,14,.56)'}
};
export const BIOME_KEYS=Object.keys(BIOMES);
