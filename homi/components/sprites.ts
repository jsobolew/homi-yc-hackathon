// Sprite library — every entry is an array of strings where each char maps to a
// color key in DEFAULT_PALETTE (or '.'/' ' for transparent).

export const DEFAULT_PALETTE: Record<string, string> = {
  K: '#1a1326',
  k: '#3d2e4a',
  W: '#fff1d1',
  w: '#e8d4a8',
  S: '#5dc8e3',
  B: '#2b9fc9',
  b: '#1e6f9a',
  L: '#f4cf94',
  l: '#e8b97a',
  R: '#c98f5a',
  r: '#a06f3f',
  G: '#6cc24a',
  g: '#4ea436',
  T: '#2e7d32',
  O: '#e85d3e',
  o: '#b94225',
  Y: '#ffd966',
  y: '#d4a82c',
  P: '#ff8fb1',
  p: '#c25e85',
  U: '#8b5cb8',
  u: '#5e3a85',
  N: '#0e1024',
  Q: '#4a6fa5',
  q: '#2b4775',
  A: '#c14a4a',
  a: '#8a2e2e',
  D: '#de7a3a',
  d: '#a85020',
  E: '#6c8ec7',
  e: '#3d5d99',
  F: '#c8a35a',
  f: '#8a6d3a',
  H: '#ffffff',
  h: '#c4b39a',
  M: '#ff5555',
  m: '#aa2222',
  C: '#b6f0a0',
  X: '#000000',
};

export type Sprite = string[];

// ---------- Small icon glyphs ----------
export const GLYPHS: Record<string, Sprite> = {
  drop: [
    '..QQ..',
    '.QQQQ.',
    'QQQHQQ',
    'QQHHQQ',
    'QQQQQQ',
    '.QQQQ.',
  ],
  bolt: [
    '..YY..',
    '.YYY..',
    '.YY...',
    'YYYYY.',
    '..YY..',
    '.YY...',
    'YY....',
  ],
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
  bug: [
    '.K..K.',
    'KKKKKK',
    'KMMMMK',
    'KMHMHM',
    'KMMMMK',
    'KKKKKK',
    'K....K',
  ],
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
  speech: [
    'KKKKKKK',
    'KWWWWWK',
    'KWKKKWK',
    'KWKKKWK',
    'KWWWWWK',
    'KKKKKKK',
    'KK.....',
    'K......',
  ],
  wrench: [
    '..hhK.',
    '.hKKK.',
    '.hKKK.',
    '..hK..',
    '.hK...',
    'hK....',
    'K.....',
  ],
  cloud: [
    '...hhhhh...',
    '..hWWWWWh..',
    '.hWWWWWWWh.',
    'hWWWWWWWWWh',
    'hWWWWWWWWWh',
    '.hhhhhhhhh.',
  ],
  money: [
    '..KKKK..',
    '..KYYK..',
    '.KYYYYK.',
    'KYYYYYYK',
    'KYYKKYYK',
    'KYYKKYYK',
    'KYYYYYYK',
    '.KKKKKK.',
  ],
  phone: [
    'KKKKK..',
    'K...KK.',
    'K....KK',
    'K.....K',
    'KK....K',
    '.KK..KK',
    '..KKKK.',
  ],
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
const SPR_BLD_A: Sprite = [
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

const SPR_BLD_B: Sprite = [
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

const SPR_BLD_C: Sprite = [
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

const SPR_BLD_D: Sprite = [
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

export const BUILDING_VARIANTS: Sprite[] = [SPR_BLD_A, SPR_BLD_B, SPR_BLD_C, SPR_BLD_D];

// ---------- Compact map markers — 10w x 9h ----------
const SPR_MARKER_A: Sprite = [
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

const SPR_MARKER_B: Sprite = [
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

const SPR_MARKER_C: Sprite = [
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

const SPR_MARKER_D: Sprite = [
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

export const MARKER_VARIANTS: Sprite[] = [SPR_MARKER_A, SPR_MARKER_B, SPR_MARKER_C, SPR_MARKER_D];

// ---------- SF Landmarks ----------
export const SPR_GG_BRIDGE: Sprite = [
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

export const SPR_TRANSAM: Sprite = [
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

export const SPR_COIT: Sprite = [
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

export const SPR_PAINTED: Sprite = [
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

export const SPR_BAY_BRIDGE: Sprite = [
  '........O...........O.......',
  '.......OOO.........OOO......',
  '......OOOOO.......OOOOO.....',
  '......O...O.......O...O.....',
  '......O...O.......O...O.....',
  'KKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  'KhhhhhhhhhhhhhhhhhhhhhhhhhhK',
  'KKKKKKKKKKKKKKKKKKKKKKKKKKKK',
];

export const SPR_FERRY: Sprite = [
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

export const SPR_TREE: Sprite = [
  '..TT..',
  '.TTTT.',
  'TTTTTT',
  'TTTTTT',
  '.TTTT.',
  '..KK..',
];

export const SPR_TREE_BIG: Sprite = [
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
export const SPR_VAN_PLUMB: Sprite = [
  '..QQQQQQQQQQ..',
  '.QSSSSSSSSSSQ.',
  'QQQQQQQQQQQQQQ',
  'QWWWPWWWWWWWWQ',
  'QWWWPWWWWWWWWQ',
  'KKKKKKKKKKKKKK',
  '.KK........KK.',
  '..K........K..',
];

export const SPR_VAN_ELEC: Sprite = [
  '..YYYYYYYYYY..',
  '.YYYYYYYYYYYY.',
  'YYYYYYYYYYYYYY',
  'YWWWKWWWWWWWWY',
  'YWWWKWWWWWWWWY',
  'KKKKKKKKKKKKKK',
  '.KK........KK.',
  '..K........K..',
];

export const SPR_VAN_HVAC: Sprite = [
  '..AAAAAAAAAA..',
  '.AAAAAAAAAAAA.',
  'AAAAAAAAAAAAAA',
  'AWWWWWWWWWWWWA',
  'AWWWMWWWWWWWWA',
  'KKKKKKKKKKKKKK',
  '.KK........KK.',
  '..K........K..',
];

export const SPR_VAN_PEST: Sprite = [
  '..GGGGGGGGGG..',
  '.GGGGGGGGGGGG.',
  'GGGGGGGGGGGGGG',
  'GWWWTWWWWWWWWG',
  'GWWWTWWWWWWWWG',
  'KKKKKKKKKKKKKK',
  '.KK........KK.',
  '..K........K..',
];

export const VAN_SPRITES: Record<string, Sprite> = {
  plumb: SPR_VAN_PLUMB,
  elec: SPR_VAN_ELEC,
  hvac: SPR_VAN_HVAC,
  pest: SPR_VAN_PEST,
};

// ---------- Homie characters ----------
function homie(hat: string, shirt: string): Sprite {
  return [
    '...HH...'.replace(/H/g, hat),
    '..HHHH..'.replace(/H/g, hat),
    '.HHHHHH.'.replace(/H/g, hat),
    '..LLLL..',
    '..LKLKL.',
    '..LLLLL.',
    '.SSSSSS.'.replace(/S/g, shirt),
    'SSSSSSSS'.replace(/S/g, shirt),
    'SSSSSSSS'.replace(/S/g, shirt),
    '.kk..kk.',
    '.kk..kk.',
    '.KK..KK.',
  ];
}

export const HOMIE_HATS = ['Y', 'E', 'U', 'G', 'A', 'O'] as const;
export const HOMIE_SHIRTS = ['A', 'P', 'O', 'E', 'F', 'U'] as const;

export const SPR_HOMIE_A = homie('Y', 'A');
export const SPR_HOMIE_B = homie('E', 'P');
export const SPR_HOMIE_C = homie('U', 'O');
export const SPR_HOMIE_D = homie('G', 'E');
export const SPR_HOMIE_E = homie('A', 'F');
export const SPR_HOMIE_F = homie('O', 'U');

export const HOMIE_SPRITES: Sprite[] = [
  SPR_HOMIE_A,
  SPR_HOMIE_B,
  SPR_HOMIE_C,
  SPR_HOMIE_D,
  SPR_HOMIE_E,
  SPR_HOMIE_F,
];

export function homieDesk(hat: string, shirt: string, mode: 'laptop' | 'phone'): Sprite {
  const top = [
    '....HHHH....'.replace(/H/g, hat),
    '...HHHHHH...'.replace(/H/g, hat),
    '...LLLLLL...',
    '..LLKLLKLL..',
    '..LLLLLLLL..',
    '..SSSSSSSS..'.replace(/S/g, shirt),
    '.SSSSSSSSSS.'.replace(/S/g, shirt),
  ];
  const item: Sprite =
    mode === 'laptop'
      ? [
          'kkkkkkkkkkkk',
          'kSSSSSSSSSSk',
          'kSWWWWWWWWSk',
          'kSWWWWWWWWSk',
          'kkkkkkkkkkkk',
          '.kkkkkkkkkk.',
          'FFFFFFFFFFFF',
        ]
      : [
          '..K.........',
          '.KK..PPPP...',
          'KKK.PPPPPP..',
          '.K..P....P..',
          '....PPPPPP..',
          '............',
          'FFFFFFFFFFFF',
        ];
  return [...top, ...item];
}

// ---------- Office decor ----------
export const SPR_PLANT: Sprite = [
  '.TgT.',
  'TTTTT',
  'TgTTg',
  '.TTT.',
  '.WWW.',
  '.WWW.',
  '.kkk.',
];

export const SPR_WATERCOOLER: Sprite = [
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

export const SPR_HILL: Sprite = [
  '...gggg...',
  '..gggggg..',
  '.gggggggg.',
  'gggggggggg',
];

export const SPR_LOGO: Sprite = [
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

// Vendor office sprite — same as marker but the door painted in for distinction.
export const SPR_VENDOR_OFFICE: Sprite = [
  '..aaaaaa..',
  '.aaaaaaaa.',
  'aaaaaaaaaa',
  'WWWWWWWWWW',
  'WQQWWWWQQW',
  'WWWWWWWWWW',
  'WWWWKKWWWW',
  'WWWWKKWWWW',
  'kkkkkkkkkk',
];
