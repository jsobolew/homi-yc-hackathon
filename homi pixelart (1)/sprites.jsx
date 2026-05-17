// === Sprite library ===
// Each sprite is an array of strings; chars map to colors in DEFAULT_PALETTE.

// ---------- Small icon glyphs ----------
const GLYPHS = {
  // Water drop
  drop: [
    '..QQ..',
    '.QQQQ.',
    'QQQHQQ',
    'QQHHQQ',
    'QQQQQQ',
    '.QQQQ.',
  ],
  // Lightning bolt
  bolt: [
    '..YY..',
    '.YYY..',
    '.YY...',
    'YYYYY.',
    '..YY..',
    '.YY...',
    'YY....',
  ],
  // Thermometer (HVAC)
  thermo: [
    '.WW.',
    '.WMW',
    '.WMW',
    '.WMW',
    '.WMW',
    'WMMMW',
    'WMMMW',
    '.WWW.',
  ],
  // Bug (pest)
  bug: [
    '.K..K.',
    'KKKKKK',
    'KMMMMK',
    'KMHMHMK'.slice(0,6),
    'KMMMMK',
    'KKKKKK',
    'K....K',
  ],
  // Lock (security)
  lock: [
    '.KKKK.',
    '.K..K.',
    '.K..K.',
    'KKKKKK',
    'KYYYYK',
    'KYKKYK',
    'KYYYYK',
    'KKKKKK',
  ],
  // Broom (cleaning)
  broom: [
    '....KK',
    '...KK.',
    '..KK..',
    '.KK...',
    'KKKK..',
    'YYYY..',
    'YYYY..',
    'YYYY..',
  ],
  // Speech bubble (tenant)
  speech: [
    'KKKKKKK',
    'KWWWWWK',
    'KWKKKWK',
    'KWKKKWK',
    'KWWWWWK',
    'KKKKKKK',
    'KK....',
    'K.....',
  ],
  // Wrench (appliance)
  wrench: [
    '..hhK.',
    '.hKKK.',
    '.hKKK.',
    '..hK..',
    '.hK...',
    'hK....',
    'K.....',
  ],
  // Cloud (the tappable fix cloud)
  cloud: [
    '...hhhhh...',
    '..hWWWWWh..',
    '.hWWWWWWWh.',
    'hWWWWWWWWWh',
    'hWWWWWWWWWh',
    '.hhhhhhhhh.',
  ],
  // Money bag
  money: [
    '..KKKK..',
    '..KYYK..',
    '.KYYYYK.',
    'KYYYYYYK',
    'KYY$$YYK'.replace('$','K'),
    'KYYKKYYK',
    'KYYYYYYK',
    '.KKKKKK.',
  ],
  // Phone
  phone: [
    'KKKKK..',
    'K...KK.',
    'K....KK',
    'K.....K',
    'KK....K',
    '.KK..KK',
    '..KKKK.',
  ],
  // Laptop
  laptop: [
    'KKKKKKKKKK',
    'KSSSSSSSSK',
    'KSWWWWWWSK',
    'KSWWWWWWSK',
    'KSSSSSSSSK',
    'KKKKKKKKKK',
    '.KKKKKKKK.',
  ],
};

// ---------- Building (property) sprites — 16x18 ----------
// Variant A: brick walkup (red roof)
const SPR_BLD_A = [
  '................',
  '......AAAAA.....',
  '....AAAAAAAAA...',
  '...AAAAAAAAAAA..',
  '..AAAAAAAAAAAAA.',
  '.WWWWWWWWWWWWWWk',
  '.WQQWWQQWWQQWWWk',
  '.WQQWWQQWWQQWWWk',
  '.WWWWWWWWWWWWWWk',
  '.WQQWWQQWWQQWWWk',
  '.WQQWWQQWWQQWWWk',
  '.WWWWWWWWWWWWWWk',
  '.WQQWWQQWWQQWWWk',
  '.WQQWWQQWWQQWWWk',
  '.WWWWWWWWWWWWWWk',
  '.WWWWKKWWWWKKWWk',
  '.WWWWKKWWWWKKWWk',
  'kkkkkkkkkkkkkkkk',
];
// Variant B: pastel victorian (orange roof)
const SPR_BLD_B = [
  '...DDDDDDDDDD...',
  '..DDDDDDDDDDDD..',
  '.DDDDDDDDDDDDDD.',
  'DDDDDDDDDDDDDDDD',
  'PWWWWWWWWWWWWWWp',
  'PWQQWWWWWWWWQQWp',
  'PWQQWWWWWWWWQQWp',
  'PWWWWWWWWWWWWWWp',
  'PWQQWWQQQQWWQQWp',
  'PWQQWWQQQQWWQQWp',
  'PWWWWWWWWWWWWWWp',
  'PWQQWWWWWWWWQQWp',
  'PWQQWWWWWWWWQQWp',
  'PWWWWWWWWWWWWWWp',
  'PWWWWWWKKWWWWWWp',
  'PWWWWWWKKWWWWWWp',
  'PWWWWWWKKWWWWWWp',
  'kkkkkkkkkkkkkkkk',
];
// Variant C: cool blue (commercial)
const SPR_BLD_C = [
  'kkkkkkkkkkkkkkkk',
  'kEEEEEEEEEEEEEEk',
  'kEEEEEEEEEEEEEEk',
  'kWWWWWWWWWWWWWWk',
  'kWQQQQWWQQQQWWWk',
  'kWQQQQWWQQQQWWWk',
  'kWWWWWWWWWWWWWWk',
  'kWQQQQWWQQQQWWWk',
  'kWQQQQWWQQQQWWWk',
  'kWWWWWWWWWWWWWWk',
  'kWQQQQWWQQQQWWWk',
  'kWQQQQWWQQQQWWWk',
  'kWWWWWWWWWWWWWWk',
  'kWQQQQWWQQQQWWWk',
  'kWQQQQWWQQQQWWWk',
  'kWWWWWWWWWWWWWWk',
  'kWWWWWWKKWWWWWWk',
  'kkkkkkkkkkkkkkkk',
];
// Variant D: tan stucco walkup
const SPR_BLD_D = [
  '................',
  '....FFFFFFFF....',
  '..FFFFFFFFFFFF..',
  '.FFFFFFFFFFFFFF.',
  'wWWWWWWWWWWWWWWw',
  'wWYYWWYYWWYYWWWw',
  'wWYYWWYYWWYYWWWw',
  'wWWWWWWWWWWWWWWw',
  'wWQQWWYYWWQQWWWw',
  'wWQQWWYYWWQQWWWw',
  'wWWWWWWWWWWWWWWw',
  'wWQQWWQQWWQQWWWw',
  'wWQQWWQQWWQQWWWw',
  'wWWWWWWWWWWWWWWw',
  'wWWWWWKKWWWWWWWw',
  'wWWWWWKKWWWWWWWw',
  'wWWWWWKKWWWWWWWw',
  'kkkkkkkkkkkkkkkk',
];

const BUILDING_VARIANTS = [SPR_BLD_A, SPR_BLD_B, SPR_BLD_C, SPR_BLD_D];

// ---------- Compact map markers — 10w x 9h ----------
// Tiny pixel buildings that read at small scale on the SF map.
const SPR_MARKER_A = [
  '..AAAAAA..',
  '.AAAAAAAA.',
  'AAAAAAAAAA',
  'WWWWWWWWWW',
  'WQQWWQQWWk',
  'WWWWWWWWWk',
  'WQQWWQQWWk',
  'WWWWWWWWWk',
  'kkkkkkkkkk',
];
const SPR_MARKER_B = [
  '.DDDDDDDD.',
  'DDDDDDDDDD',
  'PWWWWWWWWp',
  'PWQQWWQQWp',
  'PWWWWWWWWp',
  'PWQQWWQQWp',
  'PWWWWWWWWp',
  'PWKKWWKKWp',
  'kkkkkkkkkk',
];
const SPR_MARKER_C = [
  'EEEEEEEEEE',
  'EEEEEEEEEE',
  'kWWWWWWWWk',
  'kWQQQQQQWk',
  'kWWWWWWWWk',
  'kWQQQQQQWk',
  'kWWWWWWWWk',
  'kWWWKKWWWk',
  'kkkkkkkkkk',
];
const SPR_MARKER_D = [
  '..FFFFFF..',
  '.FFFFFFFF.',
  'wWWWWWWWWw',
  'wWYYWWYYWw',
  'wWWWWWWWWw',
  'wWYYWWYYWw',
  'wWWWWWWWWw',
  'wWWKKKKWWw',
  'kkkkkkkkkk',
];
const MARKER_VARIANTS = [SPR_MARKER_A, SPR_MARKER_B, SPR_MARKER_C, SPR_MARKER_D];

// ---------- SF Landmarks ----------
// Golden Gate Bridge — 36 wide x 22 high (side view)
const SPR_GG_BRIDGE = [
  '......O.................O...........',
  '......O.................O...........',
  '.....OOO...............OOO..........',
  '.....OOO...............OOO..........',
  '....OOOOO.............OOOOO.........',
  '....OOOOO.............OOOOO.........',
  '....O...O.............O...O.........',
  '....O...O...OOOOOOO...O...O.........',
  '....O...O..OO.....OO..O...O.........',
  '....O...OOO.........OOO...O.........',
  '....O.OOO.............OOO.O.........',
  '....OOO..................OOO........',
  '...OOO.....................OOO......',
  '..OOO........................OOO....',
  '.OOO............................OOO.',
  'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  'KOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOK',
  'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
];

// Transamerica Pyramid — 14 wide x 30 high
const SPR_TRANSAM = [
  '......WW......',
  '......WW......',
  '......WW......',
  '.....WWWW.....',
  '.....WWWW.....',
  '.....WWWW.....',
  '....WWWWWW....',
  '....WWQQWW....',
  '....WWQQWW....',
  '...WWWWWWWW...',
  '...WWQQQQWW...',
  '...WWQQQQWW...',
  '..WWWWWWWWWW..',
  '..WWQQWWQQWW..',
  '..WWQQWWQQWW..',
  '.WWWWWWWWWWWW.',
  '.WWQQWWWWQQWW.',
  '.WWQQWWWWQQWW.',
  'WWWWWWWWWWWWWW',
  'WWQQWWQQWWQQWW',
  'WWQQWWQQWWQQWW',
  'WWWWWWWWWWWWWW',
  'WWQQWWQQWWQQWW',
  'WWQQWWQQWWQQWW',
  'kWWWWWWWWWWWWk',
];

// Coit Tower — 8w x 18h
const SPR_COIT = [
  '..WWWW..',
  '.WWWWWW.',
  '.WKKKKW.',
  '.WWWWWW.',
  '.WWWWWW.',
  '.WQQQQW.',
  '.WWWWWW.',
  '.WQQQQW.',
  '.WWWWWW.',
  '.WQQQQW.',
  '.WWWWWW.',
  '.WQQQQW.',
  '.WWWWWW.',
  'WWWWWWWW',
  'WWWWWWWW',
  'kWWWWWWk',
  'kWWWWWWk',
  'kkkkkkkk',
];

// Painted Ladies — three little victorians side by side, 20w x 12h
const SPR_PAINTED = [
  '..AAA....AAA....AAA.',
  '.AAAAA..AAAAA..AAAAA',
  'AAAAAAAaAAAAAAaAAAAA',
  'PWWWWWpPWWWWWpEWWWWW',
  'PWQQWpPPWQQWpPEWQQWe',
  'PWWWWpPPWWWWpPEWWWWe',
  'PWQQWpPPWQQWpPEWQQWe',
  'PWWWWpPPWWWWpPEWWWWe',
  'PWKKWpPPWKKWpPEWKKWe',
  'PWKKWpPPWKKWpPEWKKWe',
  'PWKKWpPPWKKWpPEWKKWe',
  'kkkkkkkkkkkkkkkkkkkk',
];

// Bay Bridge — 28w x 8h
const SPR_BAY_BRIDGE = [
  '........O...........O.......',
  '.......OOO.........OOO......',
  '......OOOOO.......OOOOO.....',
  '......O...O.......O...O.....',
  '......O...O.......O...O.....',
  'KKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  'KhhhhhhhhhhhhhhhhhhhhhhhhhhK',
  'KKKKKKKKKKKKKKKKKKKKKKKKKKKK',
];

// Ferry Building clock tower — 10w x 16h
const SPR_FERRY = [
  '...WWWW...',
  '...WYYW...',
  '...WYKW...',
  '...WYYW...',
  '...WWWW...',
  '...WWWW...',
  '..WWWWWW..',
  '..WQQQQW..',
  '..WWWWWW..',
  '.WWWWWWWW.',
  '.WQWQWQWW.',
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'WQWQWQWQWW',
  'WWWWWWWWWW',
  'kkkkkkkkkk',
];

// ---------- Trees ----------
const SPR_TREE = [
  '..TT..',
  '.TTTT.',
  'TTTTTT',
  'TTTTTT',
  '.TTTT.',
  '..KK..',
];
const SPR_TREE_BIG = [
  '...TT...',
  '..TTTT..',
  '.TTTTTT.',
  'TTTTTTTT',
  'TTgggTTT',
  '.TTTTTT.',
  '..TKKT..',
  '...KK...',
];

// ---------- Vehicles ----------
// Plumber van — 14w x 8h, side view
const SPR_VAN_PLUMB = [
  '..QQQQQQQQQQ..',
  '.QSSSSSSSSSSQ.',
  'QQQQQQQQQQQQQQ',
  'QWWWPWWWWWWWWQ',
  'QWWWPWWWWWWWWQ',
  'KKKKKKKKKKKKKK',
  '.KK........KK.',
  '..K........K..',
];
// Electrician van — yellow
const SPR_VAN_ELEC = [
  '..YYYYYYYYYY..',
  '.YYYYYYYYYYYY.',
  'YYYYYYYYYYYYYY',
  'YWWWKWWWWWWWWY',
  'YWWWKWWWWWWWWY',
  'KKKKKKKKKKKKKK',
  '.KK........KK.',
  '..K........K..',
];
// HVAC van — red
const SPR_VAN_HVAC = [
  '..AAAAAAAAAA..',
  '.AAAAAAAAAAAA.',
  'AAAAAAAAAAAAAA',
  'AWWWWWWWWWWWWA',
  'AWWWMWWWWWWWWA',
  'KKKKKKKKKKKKKK',
  '.KK........KK.',
  '..K........K..',
];
// Pest van — green
const SPR_VAN_PEST = [
  '..GGGGGGGGGG..',
  '.GGGGGGGGGGGG.',
  'GGGGGGGGGGGGGG',
  'GWWWTWWWWWWWWG',
  'GWWWTWWWWWWWWG',
  'KKKKKKKKKKKKKK',
  '.KK........KK.',
  '..K........K..',
];

// ---------- Homie pixel characters (8w x 12h) ----------
function homie(hat, shirt) {
  return [
    '...HH...'.replace(/H/g, hat),
    '..HHHH..'.replace(/H/g, hat),
    '.HHHHHH.'.replace(/H/g, hat),
    '..LLLL..',     // skin face
    '..LKLKL.',     // eyes
    '..LLLLL.',
    '.SSSSSS.'.replace(/S/g, shirt),
    'SSSSSSSS'.replace(/S/g, shirt),
    'SSSSSSSS'.replace(/S/g, shirt),
    '.kk..kk.',
    '.kk..kk.',
    '.KK..KK.',
  ];
}
const SPR_HOMIE_A = homie('Y', 'A'); // yellow cap, red shirt
const SPR_HOMIE_B = homie('E', 'P'); // blue cap, pink shirt
const SPR_HOMIE_C = homie('U', 'O'); // purple cap, orange shirt
const SPR_HOMIE_D = homie('G', 'E'); // green cap, blue shirt
const SPR_HOMIE_E = homie('A', 'F'); // red cap, tan shirt
const SPR_HOMIE_F = homie('O', 'U'); // orange cap, purple shirt
const HOMIE_SPRITES = [SPR_HOMIE_A, SPR_HOMIE_B, SPR_HOMIE_C, SPR_HOMIE_D, SPR_HOMIE_E, SPR_HOMIE_F];

// Homie sitting at desk (12w x 14h) — desk with laptop and homie behind it
function homieDesk(hat, shirt, mode /* laptop | phone */) {
  const top = [
    '....HHHH....'.replace(/H/g, hat),
    '...HHHHHH...'.replace(/H/g, hat),
    '...LLLLLL...',
    '..LLKLLKLL..',
    '..LLLLLLLL..',
    '..SSSSSSSS..'.replace(/S/g, shirt),
    '.SSSSSSSSSS.'.replace(/S/g, shirt),
  ];
  let item;
  if (mode === 'laptop') {
    item = [
      'kkkkkkkkkkkk',
      'kSSSSSSSSSSk',
      'kSWWWWWWWWSk',
      'kSWWWWWWWWSk',
      'kkkkkkkkkkkk',
      '.kkkkkkkkkk.',
      'FFFFFFFFFFFF', // desk
    ];
  } else {
    item = [
      '..K.........',
      '.KK..PPPP...', // phone to ear (pink phone)
      'KKK.PPPPPP..',
      '.K..P....P..',
      '....PPPPPP..',
      '............',
      'FFFFFFFFFFFF', // desk
    ];
  }
  return [...top, ...item];
}

// Office decor
const SPR_PLANT = [
  '.TgT.',
  'TTTTT',
  'TgTTg',
  '.TTT.',
  '.WWW.',
  '.WWW.',
  '.kkk.',
];

const SPR_WATERCOOLER = [
  'kkkkk',
  'kSSSk',
  'kSSSk',
  'kSSSk',
  'kkkkk',
  '.WWW.',
  '.WWW.',
  'WWWWW',
  'kkkkk',
];

// Hill / sand-dune bump for map
const SPR_HILL = [
  '...gggg...',
  '..gggggg..',
  '.gggggggg.',
  'gggggggggg',
];

// Logo mark — H letterform — 16x16
const SPR_LOGO = [
  '................',
  '.OO..........OO.',
  '.OO..........OO.',
  '.OO..........OO.',
  '.OO..........OO.',
  '.OO..........OO.',
  '.OOOOOOOOOOOOOO.',
  '.OOOOOOOOOOOOOO.',
  '.OO..........OO.',
  '.OO..........OO.',
  '.OO..........OO.',
  '.OO..........OO.',
  '.OO..........OO.',
  '.OO..........OO.',
  '................',
  '................',
];

Object.assign(window, {
  GLYPHS,
  BUILDING_VARIANTS,
  MARKER_VARIANTS,
  SPR_BLD_A, SPR_BLD_B, SPR_BLD_C, SPR_BLD_D,
  SPR_MARKER_A, SPR_MARKER_B, SPR_MARKER_C, SPR_MARKER_D,
  SPR_GG_BRIDGE, SPR_TRANSAM, SPR_COIT, SPR_PAINTED, SPR_BAY_BRIDGE, SPR_FERRY,
  SPR_TREE, SPR_TREE_BIG,
  SPR_VAN_PLUMB, SPR_VAN_ELEC, SPR_VAN_HVAC, SPR_VAN_PEST,
  SPR_HOMIE_A, SPR_HOMIE_B, SPR_HOMIE_C, SPR_HOMIE_D, SPR_HOMIE_E, SPR_HOMIE_F,
  HOMIE_SPRITES,
  homie, homieDesk,
  SPR_PLANT, SPR_WATERCOOLER, SPR_HILL,
  SPR_LOGO,
});
