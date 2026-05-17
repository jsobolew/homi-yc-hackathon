// === HD Sprite library ===
// Higher-density sprites. Homie characters are 16w x 24h with a 4x4 sponsor
// patch on the chest (rendered via overlay so logos swap easily).

// ---------- Sponsor logos — 6w x 6h mini sprites ----------
// Each is a placeholder we can swap to real partner logos later.
const SPONSOR_LOGOS = {
  acme: [        // ACME — chunky "A"
    'KKKKKK',
    'KYYYYK',
    'KYKKYK',
    'KYYYYK',
    'KYKKYK',
    'KKKKKK',
  ],
  nimbus: [      // cloud
    '.KKKK.',
    'KSSSSK',
    'KSWWSK',
    'KSWWSK',
    'KSSSSK',
    '.KKKK.',
  ],
  bolt: [        // lightning
    'KKKKKK',
    'KYY..K',
    'KYYYYK',
    'K..YYK',
    'KYY..K',
    'KKKKKK',
  ],
  star: [        // star burst
    'KKKKKK',
    'KKYYKK',
    'KYWWYK',
    'KYWWYK',
    'KKYYKK',
    'KKKKKK',
  ],
  heart: [       // heart
    'KKKKKK',
    'KMKMKK',
    'KMMMMK',
    'KMMMMK',
    'KKMMKK',
    'KKKMKK',
  ],
  diamond: [     // diamond
    'KKKKKK',
    'KKQQKK',
    'KQSSQK',
    'KQSSQK',
    'KKQQKK',
    'KKKKKK',
  ],
  flame: [       // flame
    'KKKKKK',
    'KKOOKK',
    'KOYYOK',
    'KOYYOK',
    'KKOOKK',
    'KKKKKK',
  ],
  leaf: [        // leaf
    'KKKKKK',
    'KKGGKK',
    'KGTTGK',
    'KGTTGK',
    'KKGgKK',
    'KKKKKK',
  ],
};

const SPONSOR_KEYS = Object.keys(SPONSOR_LOGOS);

// ---------- HD homie character — 16w x 24h ----------
// Args: hood color, hoodie color, skin color.
// The chest is plain hoodie color; SponsorLogo SVG is composited on top.
function homieHD(hood, hoodie, skin = 'L') {
  const H = hood, S = hoodie, L = skin;
  return [
    '....HHHHHHHH....',  // 0  hood crown
    '...HHHHHHHHHH...',  // 1
    '..HHHHHHHHHHHH..',  // 2
    '..HhHHHHHHHHhH..',  // 3  hood highlight edge
    '..HHLLLLLLLLHH..',  // 4  face top under hood
    '..HLLLLLLLLLLH..',  // 5
    '..HLLKLLLLKLLH..',  // 6  eyes
    '..HLLKLLLLKLLH..',  // 7
    '..HLLLLLLLLLLH..',  // 8  cheek
    '..HLLLLpppLLLH..',  // 9  smile (p = pink)
    '..HHLLLLLLLLHH..',  // 10 jaw shadow
    '...HLLLLLLLLH...',  // 11 chin
    '...HSSSSSSSSH...',  // 12 neck/collar
    '..SSSSSSSSSSSS..',  // 13 shoulders
    '.SSSSSSSSSSSSSS.',  // 14 — logo overlay sits here
    '.SSSSSSSSSSSSSS.',  // 15
    '.SSSSSSSSSSSSSS.',  // 16
    '.SSSSSSSSSSSSSS.',  // 17
    '.SSSSSSSSSSSSSS.',  // 18
    '.SSSSSSSSSSSSSS.',  // 19
    '.SSSSSSSSSSSSSS.',  // 20
    '.SSSSSSSSSSSSSS.',  // 21
    '.SSSSSSSSSSSSSS.',  // 22 hem
    '..SSS......SSS..',  // 23 hands
  ].map(row => row.replace(/H/g, H).replace(/S/g, S).replace(/L/g, L));
}

// HD homie at a desk — 24w x 26h. Bigger desk + visible laptop/phone + body.
function homieDeskHD(hood, hoodie, mode /* laptop | phone */, skin = 'L') {
  const H = hood, S = hoodie, L = skin;
  const head = [
    '........HHHHHHHH........',
    '.......HHHHHHHHHH.......',
    '......HHHHHHHHHHHH......',
    '......HhHHHHHHHHhH......',
    '......HHLLLLLLLLHH......',
    '......HLLLLLLLLLLH......',
    '......HLLKLLLLKLLH......',
    '......HLLKLLLLKLLH......',
    '......HLLLLLLLLLLH......',
    '......HLLLLLLLLLLH......',
    '......HHLLLLLLLLHH......',
    '.......HLLLLLLLLH.......',
    '......HSSSSSSSSSSH......',
  ];
  const body = [
    '.....SSSSSSSSSSSSSS.....',  // shoulders
    '....SSSSSSSSSSSSSSSS....',  // chest — logo overlay sits here
    '....SSSSSSSSSSSSSSSS....',
    '....SSSSSSSSSSSSSSSS....',
    '....SSSSSSSSSSSSSSSS....',
    '....SSSSSSSSSSSSSSSS....',
  ];
  let item;
  if (mode === 'laptop') {
    item = [
      '..kkkkkkkkkkkkkkkkkkkk..',  // laptop top edge
      '..kQQQQQQQQQQQQQQQQQQk..',
      '..kQWWWWWWWWWWWWWWWWQk..',
      '..kQWQQQQQQQQQQQQQWWQk..',  // screen content
      '..kQWQQWWQQQQWWWWQWWQk..',
      '..kQWWWWWWWWWWWWWWWWQk..',
      '..kkkkkkkkkkkkkkkkkkkk..',
    ];
  } else {
    item = [
      '..K.....................',  // phone at ear (left side)
      '.KK..............PPPP...',
      'KKK.............PPPPPP..',
      'KKK.............P....P..',
      '.KK.............PPPPPP..',
      '..K..............PPPP...',
      '........................',
    ];
  }
  // Desk surface
  const desk = [
    'FFFFFFFFFFFFFFFFFFFFFFFF',
    'fFFFFFFFFFFFFFFFFFFFFFFf',
    'fkfffffffffffffffffffkff',
  ];
  return [
    ...head,
    ...body,
    ...item,
    ...desk,
  ].map(row => row.replace(/H/g, H).replace(/S/g, S).replace(/L/g, L));
}

// Pre-bake the 6 homie variants (HD) — sponsor keys map into SPONSORS registry.
const HOMIE_HD_DEFS = [
  { hood: 'A', hoodie: 'k', skin: 'L', sponsor: 'halo'  },
  { hood: 'E', hoodie: 'k', skin: 'L', sponsor: 'nexus' },
  { hood: 'U', hoodie: 'k', skin: 'l', sponsor: 'volt'  },
  { hood: 'G', hoodie: 'k', skin: 'L', sponsor: 'forge' },
  { hood: 'O', hoodie: 'k', skin: 'l', sponsor: 'atlas' },
  { hood: 'P', hoodie: 'k', skin: 'L', sponsor: 'comet' },
];

const HOMIE_HD_SPRITES = HOMIE_HD_DEFS.map(d => homieHD(d.hood, d.hoodie, d.skin));

// ---------- HD property markers — 18w x 18h ----------
// Each is a recognizable mini-building seen from a slight 3/4 angle.
// Variant A: brick walkup with red mansard roof
const SPR_MARK_HD_A = [
  '......AAAAAA......',
  '.....AaaaaaaA.....',
  '....AaaaaaaaaA....',
  '...AAAAAAAAAAAA...',
  '..wWWWWWWWWWWWWw..',
  '..wWQQwWQQwWQQWw..',
  '..wWQQwWQQwWQQWw..',
  '..wWWWWWWWWWWWWw..',
  '..wWQQwWQQwWQQWw..',
  '..wWQQwWQQwWQQWw..',
  '..wWWWWWWWWWWWWw..',
  '..wWQQwWQQwWQQWw..',
  '..wWQQwWQQwWQQWw..',
  '..wWWWWWWWWWWWWw..',
  '..wWWWWWKKWWWWWw..',
  '..wWWWWWKKWWWWWw..',
  'kkwwwwwwKKwwwwwwkk',
  'kkkkkkkkkkkkkkkkkk',
];
// Variant B: pastel victorian — peaked orange roof
const SPR_MARK_HD_B = [
  '........DD........',
  '.......DDDD.......',
  '......DDDDDD......',
  '.....DDDDDDDD.....',
  '....DDDDDDDDDD....',
  '...DDDDDDDDDDDD...',
  '..PWWWWWWWWWWWWp..',
  '..PWYYwWWWWwYYWp..',
  '..PWYYwWWWWwYYWp..',
  '..PWWWWWWWWWWWWp..',
  '..PWQQwWYYwWQQWp..',
  '..PWQQwWYYwWQQWp..',
  '..PWWWWWWWWWWWWp..',
  '..PWQQwWWWWwQQWp..',
  '..PWQQwWWWWwQQWp..',
  '..PWWWWWKKWWWWWp..',
  'kkPPPPPPKKPPPPPpkk',
  'kkkkkkkkkkkkkkkkkk',
];
// Variant C: cool blue commercial — flat roof, banded windows
const SPR_MARK_HD_C = [
  '..kkkkkkkkkkkkkkkk',
  '..kEEEEEEEEEEEEEEk',
  '..kEEEEEEEEEEEEEEk',
  '..kkkkkkkkkkkkkkkk',
  '..kQQQQwQQQQwQQQQk',
  '..kQQQQwQQQQwQQQQk',
  '..kkkkkkkkkkkkkkkk',
  '..kQQQQwQQQQwQQQQk',
  '..kQQQQwQQQQwQQQQk',
  '..kkkkkkkkkkkkkkkk',
  '..kQQQQwQQQQwQQQQk',
  '..kQQQQwQQQQwQQQQk',
  '..kkkkkkkkkkkkkkkk',
  '..kYYYYwYYYYwYYYYk',
  '..kYYYYwYYYYwYYYYk',
  '..kkkkkkKKkkkkkkkk',
  'kkkkkkkkKKkkkkkkkk',
  'kkkkkkkkkkkkkkkkkk',
];
// Variant D: tan stucco walkup
const SPR_MARK_HD_D = [
  '..wwwwwwwwwwwwww..',
  '.wFFFFFFFFFFFFFFw.',
  'wFFFFFFFFFFFFFFFFw',
  'wfFFFFFFFFFFFFFFfw',
  'wWWWWWWWWWWWWWWWWw',
  'wWYYwWYYwWYYwWYYWw',
  'wWYYwWYYwWYYwWYYWw',
  'wWWWWWWWWWWWWWWWWw',
  'wWQQwWYYwWQQwWQQWw',
  'wWQQwWYYwWQQwWQQWw',
  'wWWWWWWWWWWWWWWWWw',
  'wWQQwWQQwWQQwWQQWw',
  'wWQQwWQQwWQQwWQQWw',
  'wWWWWWWWWWWWWWWWWw',
  'wWWWWWWWKKWWWWWWWw',
  'wWWWWWWWKKWWWWWWWw',
  'kkkkkkkkKKkkkkkkkk',
  'kkkkkkkkkkkkkkkkkk',
];

const MARKER_HD_VARIANTS = [SPR_MARK_HD_A, SPR_MARK_HD_B, SPR_MARK_HD_C, SPR_MARK_HD_D];

// ---------- Compact map markers — 12w x 12h ----------
// Detail level between the original 10x9 and the full 18x18 HD versions.
const SPR_MAP_A = [
  '...AAAAAA...',
  '..AaaaaaaA..',
  '.AAAAAAAAAA.',
  'WWWWWWWWWWWW',
  'WQQwWQQwWQQk',
  'WWWWWWWWWWWk',
  'WQQwWQQwWQQk',
  'WWWWWWWWWWWk',
  'WQQwWQQwWQQk',
  'WWWWWWWWWWWk',
  'WWWWKKWWWWWk',
  'kkkkkkkkkkkk',
];
const SPR_MAP_B = [
  '.....DD.....',
  '....DDDD....',
  '...DDDDDD...',
  '..DDDDDDDD..',
  '.PWWWWWWWWp.',
  '.PWYYwWYYWp.',
  '.PWWWWWWWWp.',
  '.PWQQwWQQWp.',
  '.PWWWWWWWWp.',
  '.PWQQwWQQWp.',
  '.PWWWKKWWWp.',
  'kkPPPKKPPPkk',
];
const SPR_MAP_C = [
  'kkkkkkkkkkkk',
  'kEEEEEEEEEEk',
  'kkkkkkkkkkkk',
  'kQQwQQwQQwQk',
  'kQQwQQwQQwQk',
  'kkkkkkkkkkkk',
  'kQQwQQwQQwQk',
  'kQQwQQwQQwQk',
  'kkkkkkkkkkkk',
  'kYYwYYwYYwYk',
  'kkkkKKkkkkkk',
  'kkkkKKkkkkkk',
];
const SPR_MAP_D = [
  'wwwwwwwwwwww',
  'wFFFFFFFFFFw',
  'wFFFFFFFFFFw',
  'WWWWWWWWWWWW',
  'WYYwWYYwWYYW',
  'WWWWWWWWWWWW',
  'WQQwWYYwWQQW',
  'WWWWWWWWWWWW',
  'WQQwWQQwWQQW',
  'WWWWKKWWWWWW',
  'kkkkKKkkkkkk',
  'kkkkkkkkkkkk',
];
const MAP_MARKER_VARIANTS = [SPR_MAP_A, SPR_MAP_B, SPR_MAP_C, SPR_MAP_D];

// ---------- HD issue glyphs — 12w x 12h ----------
const GLYPHS_HD = {
  drop: [
    '.....QQ.....',
    '....QQQQ....',
    '....QQQQ....',
    '...QQHHQQ...',
    '...QQHHQQ...',
    '..QQHHHHQQ..',
    '..QQHHHHQQ..',
    '.QQQHHHHQQQ.',
    '.QQQQQQQQQQ.',
    '.QQQQQQQQQQ.',
    '..QQQQQQQQ..',
    '...QQQQQQ...',
  ],
  bolt: [
    '...YYYYY....',
    '..YYYYYY....',
    '.YYYYYY.....',
    '.YYYYY......',
    'YYYYY.......',
    'YYYYYYYYY...',
    '.....YYYY...',
    '....YYYY....',
    '...YYYY.....',
    '..YYY.......',
    '.YY.........',
    'Y...........',
  ],
  thermo: [
    '....WWWW....',
    '....WMMW....',
    '...WWMMWW...',
    '...WWMMWW...',
    '...WWMMWW...',
    '...WWMMWW...',
    '...WWMMWW...',
    '..WMMMMMMW..',
    '.WMMMMMMMMW.',
    '.WMMMMMMMMW.',
    '.WMMMMMMMMW.',
    '..WWWWWWWW..',
  ],
  bug: [
    '..KK....KK..',
    '..KKKKKKKK..',
    '.KKKKKKKKKK.',
    'KKMKKKKMMKKK',
    'KMMHHHHHHMMK',
    'KMMHHHHHHMMK',
    'KMMHKHHKHMMK',
    'KMMHHHHHHMMK',
    'KMMMMMMMMMMK',
    '.KKKKKKKKKK.',
    'K.K......K.K',
    'K...........',
  ],
  lock: [
    '...KKKKKK...',
    '..KKKKKKKK..',
    '..KK....KK..',
    '..KK....KK..',
    '..KK....KK..',
    '.KKKKKKKKKK.',
    'KYYYYYYYYYYK',
    'KYYYKKKKYYYK',
    'KYYKKKKKKYYK',
    'KYYKKKKKKYYK',
    'KYYYKKKKYYYK',
    'KKKKKKKKKKKK',
  ],
  broom: [
    '..........KK',
    '.........KKK',
    '........KKK.',
    '.......KKK..',
    '......KKK...',
    '.....KKK....',
    '....KKKKK...',
    '...YYYYYYY..',
    '..YYYYYYYY..',
    '..YyYyYyYy..',
    '..YyYyYyYy..',
    '...YYYYY....',
  ],
  speech: [
    'KKKKKKKKKKKK',
    'KWWWWWWWWWWK',
    'KWWPWWWWPWWK',
    'KWWPWWWWPWWK',
    'KWWWWWWWWWWK',
    'KWWWPPPPWWWK',
    'KWWWPPPPWWWK',
    'KWWWWWWWWWWK',
    'KKKKKKKKKKKK',
    'KKKK........',
    'KKK.........',
    'KK..........',
  ],
  wrench: [
    '..........K.',
    '.........KKK',
    '........KKKK',
    '.......KKKK.',
    '......KKKK..',
    '.....KKKK...',
    '....KKKK....',
    '...KKKK.....',
    '..KKKK......',
    '.hKKK.......',
    'hhKK........',
    'hh..........',
  ],
  cloud: [
    '....hhhhh...',
    '...hWWWWWh..',
    '..hWWWWWWWh.',
    '.hWWWWWWWWWh',
    'hWWWWWWWWWWh',
    'hWWWWWWWWWWh',
    'hWWWWWWWWWWh',
    '.hhhhhhhhhh.',
    '............',
    '............',
    '............',
    '............',
  ],
  phone: [
    '.KKKKKKK....',
    'KK.....KK...',
    'K.......KK..',
    'K........KK.',
    'K.........KK',
    '.K........K.',
    '..K......KK.',
    '..KK....KK..',
    '...KK..KK...',
    '....KKKK....',
    '............',
    '............',
  ],
  laptop: [
    '............',
    'kkkkkkkkkkkk',
    'kSSSSSSSSSSk',
    'kSWWWWWWWWSk',
    'kSWQQwQQQWSk',
    'kSWQQwQQQWSk',
    'kSWWWWWWWWSk',
    'kkkkkkkkkkkk',
    '.kkkkkkkkkk.',
    '............',
    '............',
    '............',
  ],
};

Object.assign(window, {
  SPONSOR_LOGOS, SPONSOR_KEYS,
  homieHD, homieDeskHD,
  HOMIE_HD_DEFS, HOMIE_HD_SPRITES,
  MARKER_HD_VARIANTS,
  MAP_MARKER_VARIANTS,
  GLYPHS_HD,
  HomieHD, HomieDeskHD,
});

// === Composite components: homie + sponsor logo overlay ===
// Logo is rendered as a high-res SVG sized to ~9 sprite-pixels wide on the
// chest. The SVG stays crisp at any zoom; `image-rendering: pixelated`
// gives it a slight pixel feel that matches the rest of the UI.

function HomieHD({ defIdx = 0, scale = 2, palette = window.DEFAULT_PALETTE, sponsorKey, className }) {
  const def = HOMIE_HD_DEFS[defIdx % HOMIE_HD_DEFS.length];
  const sponsor = sponsorKey || def.sponsor;
  const sprite = HOMIE_HD_SPRITES[defIdx % HOMIE_HD_SPRITES.length];
  // Chest logo: square, sized to the chest height, centered horizontally.
  const logoSize = 11 * scale;            // square
  const logoX    = (16 * scale - logoSize) / 2;
  const logoY    = 13 * scale;
  return (
    <div style={{ position: 'relative', width: 16 * scale, height: 24 * scale, display: 'inline-block' }} className={className}>
      <window.Pixel sprite={sprite} scale={scale} palette={palette} />
      {sponsor && window.SponsorLogo && (
        <div style={{ position: 'absolute', left: logoX, top: logoY, pointerEvents: 'none' }}>
          <window.SponsorLogo keyName={sponsor} size={logoSize} pixelated={true} />
        </div>
      )}
    </div>
  );
}

// HD homie sitting at a desk. Desk sprite is 24w x 26h.
function HomieDeskHD({ defIdx = 0, mode = 'laptop', scale = 1, palette = window.DEFAULT_PALETTE, sponsorKey, className }) {
  const def = HOMIE_HD_DEFS[defIdx % HOMIE_HD_DEFS.length];
  const sponsor = sponsorKey || def.sponsor;
  const sprite = homieDeskHD(def.hood, def.hoodie, mode, def.skin);
  const logoSize = 12 * scale;            // square, fits body well
  const logoX    = (24 * scale - logoSize) / 2;
  const logoY    = 14 * scale;
  return (
    <div style={{ position: 'relative', width: 24 * scale, height: 26 * scale, display: 'inline-block' }} className={className}>
      <window.Pixel sprite={sprite} scale={scale} palette={palette} />
      {sponsor && window.SponsorLogo && (
        <div style={{ position: 'absolute', left: logoX, top: logoY, pointerEvents: 'none' }}>
          <window.SponsorLogo keyName={sponsor} size={logoSize} pixelated={true} />
        </div>
      )}
    </div>
  );
}
