/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Topografie Europa (Cees Kramer & Roel Kramer • Radarsoft, 1984)
 * Authentic European Geography, Capitals, Major Cities, Rivers & Mountains
 */

import { REAL_EUROPE_COUNTRIES, CountryGeo } from './europeRealGeoData';

export interface CityTarget {
  id: string;
  name: { nl: string; en: string };
  country: { nl: string; en: string };
  x: number; // World map coordinate (0 - WORLD_WIDTH)
  y: number; // World map coordinate (0 - WORLD_HEIGHT)
  isCapital: boolean;
  hasHeliport?: boolean;
  hint: { nl: string; en: string };
}

export interface CountryTarget {
  id: string;
  name: { nl: string; en: string };
  x: number;
  y: number;
  hint: { nl: string; en: string };
}

export interface GeoFeature {
  id: string;
  name: { nl: string; en: string };
  type: 'river' | 'mountain' | 'sea';
  x: number;
  y: number;
  points?: Array<[number, number]>;
  hint: { nl: string; en: string };
}

// World Map Dimensions for Smooth Scrolling (Radarsoft Virtual Europe)
export const WORLD_WIDTH = 1000;
export const WORLD_HEIGHT = 750;

// C64 Screen & Viewport Dimensions
export const SCREEN_WIDTH = 320;
export const SCREEN_HEIGHT = 200;
export const HUD_TOP_HEIGHT = 18;
export const HUD_BOTTOM_HEIGHT = 22;
export const VIEW_HEIGHT = SCREEN_HEIGHT - HUD_TOP_HEIGHT - HUD_BOTTOM_HEIGHT; // 160px viewport

// Authentic Radarsoft & C64 Palette (Matches YouTube & Archive Screenshots)
export const C64_COLORS = {
  black: '#000000',
  white: '#ffffff',
  red: '#e02828',
  redBlink: '#ff3b30',
  cyan: '#40e0d0',
  brightCyan: '#33ffff',
  purple: '#9333ea',
  green: '#22c55e',
  blue: '#1d4ed8',
  yellow: '#facc15',
  brightYellow: '#ffff20',
  orange: '#f97316',
  brown: '#8b4513',
  lightRed: '#f87171',
  darkGrey: '#1e293b',
  grey: '#64748b',
  lightGreen: '#4ade80',
  lightBlue: '#38bdf8',
  lightGrey: '#cbd5e1',

  // Radarsoft In-Game Colors (from 1984 C64/MSX screenshots)
  radarSeaBlue: '#1a6fd8',       // Bright pure Radarsoft sea blue
  radarLandGreen: '#3aa83a',     // Vibrant Radarsoft grass green
  radarBorderWhite: '#ffffff',   // Crisp solid white national borders
  radarCopterBrown: '#965a25',   // Brown 4-rotor helicopter cross sprite
  radarCopterDark: '#3b1d06',    // Dark cockpit center hub
  radarDotRed: '#e52020',        // Pulsing red location dot
  heliportYellow: '#e8da6f'
};

// Heliport Home Base (Schiphol / Amsterdam)
export const HOME_HELIPORT = {
  name: { nl: 'Heliport Amsterdam (Schiphol)', en: 'Amsterdam Heliport (Schiphol)' },
  x: 319,
  y: 380,
  radius: 8
};

// European Capitals mapped to true geographic locations on the 1000x750 European Grid
export const EUROPEAN_CAPITALS: CityTarget[] = [
  {
    id: 'amsterdam',
    name: { nl: 'Amsterdam', en: 'Amsterdam' },
    country: { nl: 'Nederland', en: 'Netherlands' },
    x: 319,
    y: 380,
    isCapital: true,
    hasHeliport: true,
    hint: { nl: 'Hoofdstad van Nederland aan het IJ en de Amstel', en: 'Capital of the Netherlands on the Amstel river' }
  },
  {
    id: 'brussel',
    name: { nl: 'Brussel', en: 'Brussels' },
    country: { nl: 'België', en: 'Belgium' },
    x: 309,
    y: 410,
    isCapital: true,
    hint: { nl: 'Het bestuurlijke hart van België en de Europese Unie', en: 'Capital of Belgium and heart of Europe' }
  },
  {
    id: 'parijs',
    name: { nl: 'Parijs', en: 'Paris' },
    country: { nl: 'Frankrijk', en: 'France' },
    x: 272,
    y: 450,
    isCapital: true,
    hint: { nl: 'De lichtstad aan de Seine met de Eiffeltoren', en: 'City of light on the River Seine' }
  },
  {
    id: 'londen',
    name: { nl: 'Londen', en: 'London' },
    country: { nl: 'Verenigd Koninkrijk', en: 'United Kingdom' },
    x: 227,
    y: 397,
    isCapital: true,
    hint: { nl: 'Aan de Theems, de wereldberoemde Britse hoofdstad', en: 'On the River Thames, capital of the UK' }
  },
  {
    id: 'berlijn',
    name: { nl: 'Berlijn', en: 'Berlin' },
    country: { nl: 'Duitsland', en: 'Germany' },
    x: 475,
    y: 377,
    isCapital: true,
    hint: { nl: 'De historische metropool aan de Spree', en: 'Capital of Germany on the Spree river' }
  },
  {
    id: 'rome',
    name: { nl: 'Rome', en: 'Rome' },
    country: { nl: 'Italië', en: 'Italy' },
    x: 459,
    y: 591,
    isCapital: true,
    hint: { nl: 'De Eeuwige Stad aan de Tiber met het Colosseum', en: 'The Eternal City on the Tiber with the Colosseum' }
  },
  {
    id: 'madrid',
    name: { nl: 'Madrid', en: 'Madrid' },
    country: { nl: 'Spanje', en: 'Spain' },
    x: 161,
    y: 621,
    isCapital: true,
    hint: { nl: 'Hooggelegen op de Spaanse hoogvlakte (Meseta)', en: 'Capital of Spain on the central plateau' }
  },
  {
    id: 'lissabon',
    name: { nl: 'Lissabon', en: 'Lisbon' },
    country: { nl: 'Portugal', en: 'Portugal' },
    x: 62,
    y: 655,
    isCapital: true,
    hint: { nl: 'Aan de monding van de Taag aan de Atlantische Oceaan', en: 'At the mouth of the Tagus on the Atlantic coast' }
  },
  {
    id: 'wenen',
    name: { nl: 'Wenen', en: 'Vienna' },
    country: { nl: 'Oostenrijk', en: 'Austria' },
    x: 530,
    y: 464,
    isCapital: true,
    hint: { nl: 'De keizerlijke muziekstad aan de Donau', en: 'Imperial city on the Blue Danube' }
  },
  {
    id: 'bern',
    name: { nl: 'Bern', en: 'Bern' },
    country: { nl: 'Zwitserland', en: 'Switzerland' },
    x: 366,
    y: 489,
    isCapital: true,
    hint: { nl: 'Aan de kronkelende Aare aan de voet van de Alpen', en: 'Capital of Switzerland nestled near the Alps' }
  },
  {
    id: 'kopenhagen',
    name: { nl: 'Kopenhagen', en: 'Copenhagen' },
    country: { nl: 'Denemarken', en: 'Denmark' },
    x: 460,
    y: 313,
    isCapital: true,
    hint: { nl: 'Op het eiland Seeland met de Kleine Zeemeermin', en: 'On the island of Zealand guarding the Baltic straits' }
  },
  {
    id: 'stockholm',
    name: { nl: 'Stockholm', en: 'Sweden' },
    country: { nl: 'Zweden', en: 'Sweden' },
    x: 561,
    y: 239,
    isCapital: true,
    hint: { nl: 'Gebouwd op veertien eilanden aan de Oostzee', en: 'Built across 14 islands on the Swedish coast' }
  },
  {
    id: 'oslo',
    name: { nl: 'Oslo', en: 'Norway' },
    country: { nl: 'Noorwegen', en: 'Norway' },
    x: 427,
    y: 228,
    isCapital: true,
    hint: { nl: 'Aan het uiteinde van de majestueuze Oslofjord', en: 'Situated at the head of the Oslofjord' }
  },
  {
    id: 'helsinki',
    name: { nl: 'Helsinki', en: 'Helsinki' },
    country: { nl: 'Finland', en: 'Finland' },
    x: 687,
    y: 222,
    isCapital: true,
    hint: { nl: 'De witte stad van het noorden aan de Finse Golf', en: 'White city of the north on the Gulf of Finland' }
  },
  {
    id: 'warschau',
    name: { nl: 'Warschau', en: 'Warsaw' },
    country: { nl: 'Polen', en: 'Poland' },
    x: 615,
    y: 382,
    isCapital: true,
    hint: { nl: 'De trotse hoofdstad aan de rivier de Wisła', en: 'Historic capital on the Vistula River' }
  },
  {
    id: 'praag',
    name: { nl: 'Praag', en: 'Prague' },
    country: { nl: 'Tsjechië', en: 'Czech Republic' },
    x: 494,
    y: 426,
    isCapital: true,
    hint: { nl: 'De Gouden Stad aan de Moldau (Vltava)', en: 'The Golden City on the Vltava' }
  },
  {
    id: 'boedapest',
    name: { nl: 'Boedapest', en: 'Budapest' },
    country: { nl: 'Hongarije', en: 'Hungary' },
    x: 579,
    y: 478,
    isCapital: true,
    hint: { nl: 'Boeda en Pest gescheiden door de brede Donau', en: 'Buda and Pest united across the Danube' }
  },
  {
    id: 'athene',
    name: { nl: 'Athene', en: 'Athens' },
    country: { nl: 'Griekenland', en: 'Greece' },
    x: 665,
    y: 670,
    isCapital: true,
    hint: { nl: 'Wieg van de democratie met de Acropolis', en: 'Cradle of Western civilization with the Acropolis' }
  },
  {
    id: 'ankara',
    name: { nl: 'Ankara', en: 'Ankara' },
    country: { nl: 'Turkije', en: 'Turkey' },
    x: 832,
    y: 630,
    isCapital: true,
    hint: { nl: 'De centrale hoofdstad op het Anatolische plateau', en: 'Central capital of Turkey on the Anatolian plateau' }
  },
  {
    id: 'sofia',
    name: { nl: 'Sofia', en: 'Sofia' },
    country: { nl: 'Bulgarije', en: 'Bulgaria' },
    x: 657,
    y: 575,
    isCapital: true,
    hint: { nl: 'Gelegen aan de voet van de berg Vitosha', en: 'Situated at the foot of Mount Vitosha' }
  },
  {
    id: 'boekarest',
    name: { nl: 'Boekarest', en: 'Bucharest' },
    country: { nl: 'Roemenië', en: 'Romania' },
    x: 708,
    y: 540,
    isCapital: true,
    hint: { nl: 'Het Parijs van het oosten aan de Dâmbovița', en: 'Paris of the East on the Dâmbovița river' }
  },
  {
    id: 'belgrado',
    name: { nl: 'Belgrado', en: 'Belgrade' },
    country: { nl: 'Servië / Joegoslavië', en: 'Serbia / Yugoslavia' },
    x: 605,
    y: 532,
    isCapital: true,
    hint: { nl: 'Waar de Sava en de Donau samenvloeien', en: 'Where the Sava meets the Danube' }
  },
  {
    id: 'dublin',
    name: { nl: 'Dublin', en: 'Dublin' },
    country: { nl: 'Ierland', en: 'Ireland' },
    x: 114,
    y: 360,
    isCapital: true,
    hint: { nl: 'Aan de monding van de Liffey op het Groene Eiland', en: 'On the mouth of the River Liffey on the Emerald Isle' }
  },
  {
    id: 'moskou',
    name: { nl: 'Moskou', en: 'Moscow' },
    country: { nl: 'Rusland / Sovjet-Unie', en: 'Russia / Soviet Union' },
    x: 920,
    y: 311,
    isCapital: true,
    hint: { nl: 'De historische machtsbasis met het Kremlin en Rode Plein', en: 'Capital with the Kremlin and Red Square' }
  }
];

// European Countries with exact geographic centroids
export const EUROPEAN_COUNTRIES: CountryTarget[] = [
  { id: 'nederland', name: { nl: 'Nederland', en: 'Netherlands' }, x: 326, y: 382, hint: { nl: 'Land van tulpen, windmolens en dijken', en: 'Land of dikes and windmills' } },
  { id: 'belgie', name: { nl: 'België', en: 'Belgium' }, x: 309, y: 410, hint: { nl: 'Vlaanderen en Wallonië in het hart van West-Europa', en: 'Flanders and Wallonia' } },
  { id: 'frankrijk', name: { nl: 'Frankrijk', en: 'France' }, x: 267, y: 501, hint: { nl: 'Van de Kanaalkust tot de Middellandse Zee', en: 'From the Channel to the Mediterranean' } },
  { id: 'spanje', name: { nl: 'Spanje', en: 'Spain' }, x: 173, y: 618, hint: { nl: 'Het Iberisch schiereiland', en: 'The Iberian Peninsula' } },
  { id: 'portugal', name: { nl: 'Portugal', en: 'Portugal' }, x: 62, y: 655, hint: { nl: 'Aan de Atlantische kust van het Iberisch schiereiland', en: 'Atlantic coast of Iberia' } },
  { id: 'italie', name: { nl: 'Italië', en: 'Italy' }, x: 457, y: 589, hint: { nl: 'Het land in de vorm van een laars', en: 'The boot-shaped nation' } },
  { id: 'duitsland', name: { nl: 'Duitsland', en: 'Germany' }, x: 419, y: 387, hint: { nl: 'Het centrale land van Europa', en: 'Central European powerhouse' } },
  { id: 'verenigd_koninkrijk', name: { nl: 'Groot-Brittannië', en: 'Great Britain' }, x: 195, y: 360, hint: { nl: 'Engeland, Schotland en Wales', en: 'England, Scotland and Wales' } },
  { id: 'ierland', name: { nl: 'Ierland', en: 'Ireland' }, x: 114, y: 360, hint: { nl: 'Het groene eiland in de Atlantische Oceaan', en: 'The Emerald Isle' } },
  { id: 'griekenland', name: { nl: 'Griekenland', en: 'Greece' }, x: 669, y: 663, hint: { nl: 'Het land van duizend eilanden en de Peloponnesos', en: 'Land of islands and the Peloponnese' } },
  { id: 'turkije', name: { nl: 'Turkije', en: 'Turkey' }, x: 839, y: 646, hint: { nl: 'Brug tussen Europa en Azië met de Bosporus', en: 'Bridge between Europe and Asia' } },
  { id: 'bulgarije', name: { nl: 'Bulgarije', en: 'Bulgaria' }, x: 694, y: 572, hint: { nl: 'Aan de Zwarte Zee op de Balkan', en: 'On the Black Sea coast in the Balkans' } },
  { id: 'roemenie', name: { nl: 'Roemenië', en: 'Romania' }, x: 690, y: 515, hint: { nl: 'Land van de Karpaten en de Donaudelta', en: 'Land of the Carpathians and Danube delta' } },
  { id: 'polen', name: { nl: 'Polen', en: 'Poland' }, x: 581, y: 385, hint: { nl: 'Aan de Oostzee en de Wisła', en: 'On the Baltic Sea and Vistula' } },
  { id: 'oostenrijk', name: { nl: 'Oostenrijk', en: 'Austria' }, x: 500, y: 470, hint: { nl: 'Alpenland aan de Donau', en: 'Alpine nation on the Danube' } },
  { id: 'zwitserland', name: { nl: 'Zwitserland', en: 'Switzerland' }, x: 366, y: 489, hint: { nl: 'Het bergland van de Alpen', en: 'Alpine confederation' } },
  { id: 'denemarken', name: { nl: 'Denemarken', en: 'Denmark' }, x: 450, y: 305, hint: { nl: 'Jutland en de Deense eilanden', en: 'Jutland and Danish isles' } },
  { id: 'noorwegen', name: { nl: 'Noorwegen', en: 'Norway' }, x: 410, y: 190, hint: { nl: 'Land van de fjorden', en: 'Land of fjords' } },
  { id: 'zweden', name: { nl: 'Zweden', en: 'Sweden' }, x: 530, y: 220, hint: { nl: 'Tussen het Kattegat en de Botnische Golf', en: 'Scandinavian realm' } },
  { id: 'finland', name: { nl: 'Finland', en: 'Finland' }, x: 690, y: 170, hint: { nl: 'Land van de duizend meren', en: 'Land of a thousand lakes' } }
];

// Major Cities & Ports
export const MAJOR_CITIES: CityTarget[] = [
  {
    id: 'rotterdam',
    name: { nl: 'Rotterdam', en: 'Rotterdam' },
    country: { nl: 'Nederland', en: 'Netherlands' },
    x: 312,
    y: 388,
    isCapital: false,
    hint: { nl: 'De grootste zeehaven van Europa aan de Nieuwe Waterweg', en: 'Largest port in Europe on the Rhine delta' }
  },
  {
    id: 'istanbul',
    name: { nl: 'Istanbul', en: 'Istanbul' },
    country: { nl: 'Turkije', en: 'Turkey' },
    x: 760,
    y: 608,
    isCapital: false,
    hint: { nl: 'De historische metropool op twee continenten aan de Bosporus', en: 'Historic metropolis on the Bosphorus' }
  },
  {
    id: 'barcelona',
    name: { nl: 'Barcelona', en: 'Barcelona' },
    country: { nl: 'Spanje', en: 'Spain' },
    x: 260,
    y: 590,
    isCapital: false,
    hint: { nl: 'De Catalaanse havenstad aan de Middellandse Zee met de Sagrada Família', en: 'Catalan jewel on the Mediterranean' }
  },
  {
    id: 'milan',
    name: { nl: 'Milaan', en: 'Milan' },
    country: { nl: 'Italië', en: 'Italy' },
    x: 405,
    y: 520,
    isCapital: false,
    hint: { nl: 'In de vruchtbare Povlakte aan de voet van de Alpen', en: 'Industrial and fashion hub in Lombardy' }
  },
  {
    id: 'munchen',
    name: { nl: 'München', en: 'Munich' },
    country: { nl: 'Duitsland', en: 'Germany' },
    x: 440,
    y: 465,
    isCapital: false,
    hint: { nl: 'Aan de Isar in het zuiden van Duitsland (Beieren)', en: 'Capital of Bavaria on the River Isar' }
  },
  {
    id: 'hamburg',
    name: { nl: 'Hamburg', en: 'Hamburg' },
    country: { nl: 'Duitsland', en: 'Germany' },
    x: 420,
    y: 350,
    isCapital: false,
    hint: { nl: 'De grote Hanzestad en zeehaven aan de Elbe', en: 'Great Hanseatic port on the River Elbe' }
  },
  {
    id: 'marseille',
    name: { nl: 'Marseille', en: 'Marseille' },
    country: { nl: 'Frankrijk', en: 'France' },
    x: 295,
    y: 560,
    isCapital: false,
    hint: { nl: 'De oudste havenstad van Frankrijk aan de Golf van Lion', en: 'Oldest port city in France on the Mediterranean' }
  },
  {
    id: 'napels',
    name: { nl: 'Napels', en: 'Naples' },
    country: { nl: 'Italië', en: 'Italy' },
    x: 490,
    y: 615,
    isCapital: false,
    hint: { nl: 'Aan de prachtige baai in de schaduw van de Vesuvius', en: 'On the Bay of Naples beneath Mount Vesuvius' }
  }
];

// Geographical Features (Rivers, Mountains, Seas & Natural Landmarks)
export const GEO_FEATURES: GeoFeature[] = [
  // Major Rivers
  {
    id: 'rijn',
    name: { nl: 'De Rijn (Rivier)', en: 'The Rhine (River)' },
    type: 'river',
    x: 345,
    y: 435,
    hint: { nl: 'Belangrijkste West-Europese waterweg van de Zwitserse Alpen naar Rotterdam', en: 'Crucial European waterway flowing from the Alps to the North Sea' }
  },
  {
    id: 'donau',
    name: { nl: 'De Donau (Rivier)', en: 'The Danube (River)' },
    type: 'river',
    x: 579,
    y: 478,
    hint: { nl: 'De lange blauwe rivier door Wenen en Boedapest naar de Zwarte Zee', en: 'Historic river flowing through Vienna and Budapest to the Black Sea' }
  },
  {
    id: 'seine',
    name: { nl: 'De Seine (Rivier)', en: 'The Seine (River)' },
    type: 'river',
    x: 272,
    y: 450,
    hint: { nl: 'De beroemde Franse rivier die dwars door het hart van Parijs stroomt', en: 'Iconic French river flowing right through Paris to Le Havre' }
  },
  {
    id: 'theems',
    name: { nl: 'De Theems (Rivier)', en: 'The Thames (River)' },
    type: 'river',
    x: 227,
    y: 397,
    hint: { nl: 'De historische levensader van Londen die uitmondt in de Noordzee', en: 'The historic artery of London emptying into the North Sea' }
  },
  {
    id: 'po',
    name: { nl: 'De Po (Rivier)', en: 'The Po (River)' },
    type: 'river',
    x: 430,
    y: 522,
    hint: { nl: 'De grote Italiaanse rivier die door de vruchtbare Povlakte stroomt', en: 'Major river in northern Italy flowing across the fertile Po Valley' }
  },
  {
    id: 'elbe',
    name: { nl: 'De Elbe (Rivier)', en: 'The Elbe (River)' },
    type: 'river',
    x: 455,
    y: 382,
    hint: { nl: 'Stroomt van Tsjechië via Dresden en Hamburg naar de Noordzee', en: 'Flows from the Czech Republic through Dresden and Hamburg' }
  },
  {
    id: 'wisla',
    name: { nl: 'De Wisła (Rivier)', en: 'The Vistula (River)' },
    type: 'river',
    x: 615,
    y: 382,
    hint: { nl: 'De nationale rivier van Polen die door Krakau en Warschau stroomt', en: 'The longest river in Poland passing Krakow and Warsaw' }
  },
  {
    id: 'taag',
    name: { nl: 'De Taag / Tajo (Rivier)', en: 'The Tagus (River)' },
    type: 'river',
    x: 142,
    y: 632,
    hint: { nl: 'Langste rivier van het Iberisch schiereiland die bij Lissabon uitmondt', en: 'Longest river in the Iberian peninsula emptying at Lisbon' }
  },
  // Mountain Ranges
  {
    id: 'alpen',
    name: { nl: 'De Alpen (Hooggebergte)', en: 'The Alps' },
    type: 'mountain',
    x: 420,
    y: 490,
    hint: { nl: 'Het hoogste gebergte van Midden-Europa met de Mont Blanc', en: 'Highest mountain range in Central Europe' }
  },
  {
    id: 'pyreneeën',
    name: { nl: 'De Pyreneeën (Gebergte)', en: 'The Pyrenees' },
    type: 'mountain',
    x: 210,
    y: 560,
    hint: { nl: 'De natuurlijke bergketen tussen Frankrijk en Spanje', en: 'Natural mountain frontier separating France and Spain' }
  },
  {
    id: 'karpaten',
    name: { nl: 'De Karpaten (Gebergte)', en: 'The Carpathians' },
    type: 'mountain',
    x: 620,
    y: 450,
    hint: { nl: 'De grote boogvormige bergketen door Centraal- en Oost-Europa', en: 'Vast arc of mountains across Central and Eastern Europe' }
  },
  {
    id: 'apennijnen',
    name: { nl: 'De Apennijnen (Gebergte)', en: 'The Apennines' },
    type: 'mountain',
    x: 460,
    y: 585,
    hint: { nl: 'De bergrug die als een ruggengraat door heel Italië loopt', en: 'Mountain backbone traversing the length of Italy' }
  },
  // Major Seas
  {
    id: 'middellandse_zee',
    name: { nl: 'Middellandse Zee', en: 'Mediterranean Sea' },
    type: 'sea',
    x: 390,
    y: 650,
    hint: { nl: 'De warme binnenzee tussen Zuid-Europa en Noord-Afrika', en: 'Great sea separating Southern Europe from Africa' }
  },
  {
    id: 'zwarte_zee',
    name: { nl: 'Zwarte Zee', en: 'Black Sea' },
    type: 'sea',
    x: 780,
    y: 540,
    hint: { nl: 'De binnenzee tussen de Balkan, Oekraïne en Anatolië', en: 'Inland sea bounded by the Balkans and Anatolia' }
  },
  {
    id: 'noordzee',
    name: { nl: 'Noordzee', en: 'North Sea' },
    type: 'sea',
    x: 290,
    y: 310,
    hint: { nl: 'De zee tussen Groot-Brittannië, Nederland en Scandinavië', en: 'Sea bounded by Great Britain and the Low Countries' }
  },
  {
    id: 'oostzee',
    name: { nl: 'Oostzee / Baltische Zee', en: 'Baltic Sea' },
    type: 'sea',
    x: 550,
    y: 270,
    hint: { nl: 'Binnenzee omsloten door Zweden, Finland en Polen', en: 'Sea enclosed by Scandinavia, Finland and Poland' }
  }
];

// Major European Rivers with realistic, natural multi-point curvature mapped to authentic geography
export const EUROPE_RIVERS: Array<{ name: string; points: Array<[number, number]> }> = [
  // 1. Rhine (Rijn) - Swiss Alps -> Lake Constance -> Basel -> Strasbourg -> Koblenz -> Cologne -> Rotterdam
  {
    name: 'Rhine',
    points: [
      [380, 492],
      [373, 487],
      [364, 486],
      [358, 484],
      [356, 472],
      [355, 462],
      [358, 448],
      [360, 438],
      [356, 428],
      [352, 422],
      [346, 420],
      [344, 414],
      [339, 405],
      [336, 398],
      [332, 392],
      [328, 388],
      [324, 386],
      [319, 385],
      [312, 388]
    ]
  },
  // 2. Danube (Donau) - Black Forest -> Ulm -> Regensburg -> Passau -> Linz -> Vienna -> Bratislava -> Budapest -> Belgrade -> Iron Gates -> Delta
  {
    name: 'Danube',
    points: [
      [376, 475],
      [390, 471],
      [412, 468],
      [432, 466],
      [452, 463],
      [475, 462],
      [498, 462],
      [518, 463],
      [530, 464],
      [545, 467],
      [560, 470],
      [578, 472],
      [579, 478],
      [581, 495],
      [582, 512],
      [588, 524],
      [605, 532],
      [625, 536],
      [645, 538],
      [665, 545],
      [680, 560],
      [700, 565],
      [725, 550],
      [735, 532],
      [738, 522],
      [748, 524],
      [758, 526]
    ]
  },
  // 3. Seine - Burgundy -> Troyes -> Paris -> Rouen -> Le Havre
  {
    name: 'Seine',
    points: [
      [312, 480],
      [302, 472],
      [292, 464],
      [282, 458],
      [272, 450],
      [262, 444],
      [252, 438],
      [245, 435],
      [238, 432],
      [230, 430]
    ]
  },
  // 4. Loire - Massif Central -> Nevers -> Orléans -> Tours -> Nantes -> Atlantic
  {
    name: 'Loire',
    points: [
      [306, 528],
      [302, 512],
      [295, 498],
      [282, 482],
      [272, 472],
      [258, 473],
      [245, 475],
      [230, 477],
      [218, 478],
      [205, 480],
      [192, 482]
    ]
  },
  // 5. Rhône - Alps -> Lake Geneva -> Lyon -> Valence -> Avignon -> Mediterranean Delta
  {
    name: 'Rhône',
    points: [
      [380, 492],
      [365, 495],
      [350, 496],
      [335, 502],
      [320, 510],
      [318, 525],
      [316, 540],
      [314, 552],
      [310, 560],
      [306, 566]
    ]
  },
  // 6. Thames (Theems) - Cotswolds -> Oxford -> Reading -> London -> North Sea
  {
    name: 'Thames',
    points: [
      [204, 396],
      [212, 395],
      [218, 397],
      [224, 398],
      [227, 397],
      [234, 397],
      [240, 397],
      [248, 396],
      [256, 395]
    ]
  },
  // 7. Elbe - Krkonoše -> Dresden -> Magdeburg -> Hamburg -> Cuxhaven
  {
    name: 'Elbe',
    points: [
      [512, 436],
      [502, 428],
      [490, 412],
      [478, 398],
      [465, 388],
      [455, 382],
      [442, 368],
      [430, 358],
      [420, 350],
      [408, 342],
      [398, 335]
    ]
  },
  // 8. Vistula (Wisła) - Carpathians -> Kraków -> Warsaw -> Płock -> Toruń -> Bydgoszcz -> Gdańsk
  {
    name: 'Wisła',
    points: [
      [592, 442],
      [596, 428],
      [604, 418],
      [610, 400],
      [615, 382],
      [608, 370],
      [596, 362],
      [590, 352],
      [586, 342],
      [585, 334],
      [584, 324]
    ]
  },
  // 9. Oder (Odra) - Czech mountains -> Wrocław -> Frankfurt an der Oder -> Szczecin -> Baltic Sea
  {
    name: 'Oder',
    points: [
      [548, 436],
      [544, 424],
      [542, 414],
      [540, 404],
      [530, 394],
      [518, 384],
      [506, 376],
      [500, 362],
      [496, 348],
      [494, 336]
    ]
  },
  // 10. Po - Cottian Alps -> Turin -> Pavia / South of Milan -> Piacenza -> Cremona -> Ferrara -> Adriatic Delta
  {
    name: 'Po',
    points: [
      [368, 522],
      [378, 520],
      [394, 520],
      [410, 522],
      [426, 523],
      [442, 524],
      [456, 525],
      [468, 525],
      [478, 525]
    ]
  },
  // 11. Tagus (Taag / Tajo) - Montes Universales -> Toledo -> Talavera -> Abrantes -> Lisbon / Atlantic
  {
    name: 'Tagus',
    points: [
      [210, 615],
      [192, 618],
      [168, 626],
      [142, 632],
      [118, 638],
      [96, 644],
      [80, 650],
      [68, 654],
      [62, 655]
    ]
  },
  // 12. Ebro - Cantabrian Mountains -> Logroño -> Zaragoza -> Tortosa -> Mediterranean Delta
  {
    name: 'Ebro',
    points: [
      [176, 574],
      [188, 584],
      [202, 592],
      [216, 600],
      [234, 604],
      [248, 608],
      [260, 612]
    ]
  },
  // 13. Meuse (Maas) - France -> Ardennes -> Liège -> Maastricht -> Venlo -> Rotterdam Delta
  {
    name: 'Maas',
    points: [
      [332, 462],
      [326, 446],
      [320, 432],
      [318, 424],
      [320, 415],
      [322, 410],
      [323, 398],
      [320, 392],
      [312, 388]
    ]
  },
  // 14. Douro / Duero - Soria -> Valladolid -> Zamora -> Porto -> Atlantic
  {
    name: 'Douro',
    points: [
      [184, 590],
      [168, 594],
      [148, 596],
      [128, 598],
      [104, 600],
      [80, 602],
      [58, 605]
    ]
  },
  // 15. Dnieper (Dnjepr) - Smolensk -> Mogilev -> Kyiv -> Dnipro -> Zaporizhzhia -> Black Sea
  {
    name: 'Dnieper',
    points: [
      [840, 305],
      [822, 325],
      [808, 350],
      [795, 375],
      [780, 390],
      [792, 410],
      [815, 430],
      [835, 442],
      [840, 452],
      [825, 475],
      [805, 490]
    ]
  },
  // 16. Weser - Hannoversch Münden -> Minden -> Bremen -> Bremerhaven -> North Sea
  {
    name: 'Weser',
    points: [
      [412, 408],
      [408, 392],
      [404, 378],
      [400, 365],
      [395, 345]
    ]
  }
];

// Mountain Ridges
export const EUROPE_MOUNTAINS: Array<[number, number]> = [
  // Alps
  [390, 495], [410, 485], [430, 480], [450, 480], [470, 482], [490, 485],
  // Pyrenees
  [180, 555], [200, 558], [220, 560], [240, 560],
  // Apennines
  [430, 545], [450, 570], [470, 600], [490, 630],
  // Carpathians
  [560, 430], [600, 420], [640, 440], [670, 480], [680, 510]
];

export { REAL_EUROPE_COUNTRIES };
