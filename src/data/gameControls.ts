import { GameControl } from '../components/GameControlsModal';

export interface GameControlInfo {
  title: string;
  system: string;
  year: string;
  summary: string;
  instructions: string[];
  controls: GameControl[];
  tips: string[];
}

export const GAME_CONTROLS: Record<string, GameControlInfo> = {
  donkey_kong: {
    title: "Donkey Kong",
    system: "Arcade (Nintendo)",
    year: "1981",
    summary: "Het baanbrekende meesterwerk van Shigeru Miyamoto & Gunpei Yokoi met alle 4 originele levels: 25m, 50m, 75m en 100m.",
    instructions: [
      "Level 1 (25m): Klim over de schuine steigers en spring over rollende en vallende vaten naar Pauline bovenaan.",
      "Level 2 (50m): Ren over transportbanden en ontwijk de hete cementpannen via uitschuifbare ladders.",
      "Level 3 (75m): Gebruik de stijgende en dalende liften terwijl Donkey Kong stuiterende veren naar beneden werpt.",
      "Level 4 (100m): Loop over alle 8 gele klinknagels om de steiger onder Donkey Kong te laten instorten!",
      "Pak de Hamer voor tijdelijke onkwetsbaarheid en sla vaten en vuurballen stuk voor 300 tot 800 punten.",
      "Verzamel Pauline's verloren voorwerpen (parasol, tasje, hoed) voor extra bonuspunten."
    ],
    controls: [
      { action: "Lopen / Klimmen", keyboard: "Pijltjestoetsen / WASD", xbox: "D-Pad / Linker Stick" },
      { action: "Springen / Hamer Slaan", keyboard: "Spatiebalk / Z / K / Ctrl", xbox: "(A) Knop / (X) Knop" },
      { action: "Kies Level (Direct)", keyboard: "Klik op 25m, 50m, 75m, 100m", xbox: "D-Pad Selectie" },
      { action: "Pauze / Herstart", keyboard: "P / R", xbox: "Start / Menu" }
    ],
    tips: [
      "Als je de hamer vasthoudt, kun je geen ladders beklimmen of springen; time het oprapen goed!",
      "Spring over vaten voor 100 bonuspunten per vat.",
      "Op 100m kun je over de openingen van verwijderde klinknagels heen springen."
    ]
  },
  c64_pinball: {
    title: "3D Pinball Power",
    system: "Commodore 64",
    year: "1989",
    summary: "Baanbrekende 3D-perspectief flipperkast van Mastertronic & Stephen Walters met authentieke MOS 6581 SID-geluiden.",
    instructions: [
      "Houd de Plunger-knop ingedrukt om de veer aan te spannen en laat los om de bal in het speelveld te schieten.",
      "Gebruik de linker- en rechterflipper om de bal terug omhoog te kaatsen en doelen te raken.",
      "Raak de 3 pop-bumpers en slingshots om je score snel te laten oplopen.",
      "Voltooi de A-B-C banen bovenin om de score-multiplier te verhogen naar 2X, 3X en 5X.",
      "Schiet de bal in het geheimzinnige Black Hole zinkgat voor een bonus van 1.000 punten."
    ],
    controls: [
      { action: "Flipper Links", keyboard: "Z / A / Shift-Links", xbox: "LT (Trigger) / LB" },
      { action: "Flipper Rechts", keyboard: "/ / M / Shift-Rechts", xbox: "RT (Trigger) / RB" },
      { action: "Plunger (Afvuren)", keyboard: "Spatiebalk (ingedrukt houden)", xbox: "(A) Knop" },
      { action: "Kast Schudden (Nudge)", keyboard: "N / Pijltjestoetsen", xbox: "(B) / (X) Knop" },
      { action: "Pauze / Hervat", keyboard: "P", xbox: "Start / Menu" }
    ],
    tips: [
      "Laat de bal niet tussen de twee flippers vallen; mik op de bovenste bumpers voor maximale punten.",
      "Timing van de flipper bepaalt de hoek: raak de bal op de punt voor schuine schoten."
    ]
  },
  wolfenstein: {
    title: "Wolfenstein 3D",
    system: "MS-DOS / PC",
    year: "1992",
    summary: "De legendarische grondlegger van de first-person shooter door id Software (John Carmack & John Romero).",
    instructions: [
      "Ontsnap uit Kasteel Wolfenstein door de bewakers uit te schakelen en de lift naar de volgende verdieping te vinden.",
      "Open geheime doorgangen in muren voor extra munitie, schatten en EHBO-kits.",
      "Verzamel betere wapens: Machine Gun en Chaingun voor zwaardere gevechten.",
      "Houd je levensbalk (Health) en munitie in de gaten."
    ],
    controls: [
      { action: "Lopen & Draaien", keyboard: "Pijltjestoetsen / WASD", xbox: "Linker Stick / D-Pad" },
      { action: "Schieten", keyboard: "Ctrl / F / Linker Muisknop", xbox: "RT (Right Trigger) / (X)" },
      { action: "Deur Openen / Zoeken", keyboard: "Spatiebalk / E", xbox: "(A) Knop" },
      { action: "Rennen (Sprint)", keyboard: "Shift", xbox: "Linker Stick Indrukken (L3)" },
      { action: "Wapen Wisselen", keyboard: "Toetsen 1, 2, 3, 4", xbox: "LB / RB (Bumpers)" },
      { action: "Pauze", keyboard: "P / Esc", xbox: "Start / Menu" }
    ],
    tips: [
      "Druk op Spatiebalk tegen verdachte houten of stenen panelen om geheime ruimtes te onthullen.",
      "Laat vijanden naar deuropeningen lopen zodat je ze één voor één kunt uitschakelen."
    ]
  },
  temple_run: {
    title: "Temple Run 3D",
    system: "iOS / Mobile 3D",
    year: "2011",
    summary: "De baanbrekende 3D endless runner van Imangi Studios. Ontsnap met het Gouden Idool aan de demonische apen!",
    instructions: [
      "Ren zo ver mogelijk door het eeuwenoude tempeldoolhof zonder te crashen of gegrepen te worden.",
      "Maak 90-graden bochten bij scherpe afslagen met Links / Rechts.",
      "Spring over boomstammen, vlammen en diepe afgronden.",
      "Glijd onder stenen bogen en takken door.",
      "Verzamel gouden munten en activeer krachtige powerups zoals de Magneet, Turbo Boost en Schild."
    ],
    controls: [
      { action: "Baan Wisselen / Afslag", keyboard: "Pijl Links / Rechts (A / D)", xbox: "D-Pad Links / Rechts" },
      { action: "Springen", keyboard: "Pijl Omhoog / W / Spatiebalk", xbox: "(A) Knop / D-Pad Omhoog" },
      { action: "Glijden (Slide)", keyboard: "Pijl Omlaag / S", xbox: "(B) Knop / D-Pad Omlaag" },
      { action: "Balans / Kantelen", keyboard: "Kantel-slider / Touch Drag", xbox: "Linker Stick (Horizontaal)" },
      { action: "Herstarten na Game Over", keyboard: "R", xbox: "(Y) Knop" }
    ],
    tips: [
      "Als je struikelt, komen de apen dichterbij. Ren 4 seconden foutloos om ze weer op afstand te houden.",
      "De Turbo Boost maakt je tijdelijk onkwetsbaar en stuurt automatisch door bochten."
    ]
  },
  pacman: {
    title: "Pac-Man",
    system: "Arcade (Namco)",
    year: "1980",
    summary: "Het wereldberoemde arcadespel van Toru Iwatani. Navigeer door het doolhof en eet alle gele pellets.",
    instructions: [
      "Eet alle 240 pellets en 4 krachtpillen (Power Pellets) om het level te voltooien.",
      "Als je een Power Pellet eet, worden de 4 spoken (Blinky, Pinky, Inky, Clyde) blauw en kun je ze tijdelijk opeten voor bonuspunten.",
      "Gebruik de zijtunnels om aan achtervolgers te ontsnappen; spoken bewegen trager door de tunnel.",
      "Eet het bonusfruit onder de spokenkooi voor extra punten."
    ],
    controls: [
      { action: "Bewegen (Omhoog/Omlaag/L/R)", keyboard: "Pijltjestoetsen / WASD", xbox: "D-Pad / Linker Stick" },
      { action: "Pauze / Hervat", keyboard: "P / Spatiebalk", xbox: "Start / Menu" },
      { action: "Geluid Dempen", keyboard: "M", xbox: "(Y) Knop" },
      { action: "Spel Herstarten", keyboard: "R", xbox: "Back / Select" }
    ],
    tips: [
      "Elk spook heeft een eigen persoonlijkheid: Blinky jaagt direct achter je aan, Pinky probeert je de pas af te snijden.",
      "Draai alvast in de gewenste richting vóór een bocht om geen fractie van een seconde te verliezen."
    ]
  },
  super_mario: {
    title: "Super Mario Bros.",
    system: "Nintendo NES",
    year: "1985",
    summary: "Het iconische platformmeesterwerk van Shigeru Miyamoto dat de game-industrie voorgoed veranderde.",
    instructions: [
      "Ren en spring van links naar rechts door het Mushroom Kingdom om Princess Peach te redden van Bowser.",
      "Spring tegen ?-blokken voor munten, Super Paddestoelen en Vuur reorganisaties.",
      "Spring bovenop Goomba's en Koopa Troopa's om ze uit te schakelen.",
      "Verzamel 100 munten voor een extra leven (1-UP)."
    ],
    controls: [
      { action: "Lopen Links / Rechts", keyboard: "Pijl-Links / Pijl-Rechts (A / D)", xbox: "D-Pad / Linker Stick" },
      { action: "Bukken / Pijp Ingaan", keyboard: "Pijl-Omlaag (S)", xbox: "D-Pad Omlaag" },
      { action: "Springen", keyboard: "Z / Spatiebalk / Pijl-Omhoog", xbox: "(A) Knop" },
      { action: "Rennen & Vuurbal", keyboard: "X / Shift-Links", xbox: "(X) Knop / RT" },
      { action: "Pauze", keyboard: "Enter / P", xbox: "Start / Menu" }
    ],
    tips: [
      "Houd de renknop ingedrukt terwijl je springt om grotere afstanden over diepe ravijnen te overbruggen.",
      "Houd de springknop langer ingedrukt voor een hogere sprong."
    ]
  },
  mario: {
    title: "Mario Bros.",
    system: "Nintendo Arcade",
    year: "1983",
    summary: "De originele rioolklassieker van Nintendo waarin Mario en Luigi buizen schoonvegen van monsters.",
    instructions: [
      "Spring tegen het platform onder vijanden om ze ondersteboven te slaan.",
      "Schop de omgekeerde vijanden van het scherm voordat ze weer opstaan en roodgloeiend snel worden.",
      "Sla tegen het POW-blok in het midden om alle op de grond staande monsters tegelijk te kantelen (maximaal 3 keer te gebruiken!).",
      "Ontwijk vuurballen die door het riool stuiteren."
    ],
    controls: [
      { action: "Lopen Links / Rechts", keyboard: "Pijl-Links / Pijl-Rechts (A / D)", xbox: "D-Pad / Linker Stick" },
      { action: "Springen (tegen vloer)", keyboard: "Spatiebalk / Z / Pijl-Omhoog", xbox: "(A) Knop" },
      { action: "Pauze", keyboard: "P", xbox: "Start / Menu" }
    ],
    tips: [
      "Bewaar het POW-blok voor lastige situaties wanneer meerdere schildpadden en vliegen tegelijk naderen.",
      "Krabben (Sidesteppers) moeten twee keer geraakt worden voordat ze omkeren!"
    ]
  },
  battle_chess: {
    title: "Battle Chess",
    system: "Amiga / PC",
    year: "1988",
    summary: "Het baanbrekende schaakspel van Interplay waarin schaakstukken tot leven komen in spectaculaire duels.",
    instructions: [
      "Speel volgens de officiële regels van het klassieke schaakspel.",
      "Wanneer een stuk een ander stuk slaat, volgt een unieke humoristische animatie.",
      "Zet de vijandelijke koning schaakmat om de partij te winnen.",
      "Klik op een stuk om mogelijke zetten te zien en klik op het doelveld."
    ],
    controls: [
      { action: "Veld Selecteren / Zetten", keyboard: "Muisklik / Pijltjestoetsen + Enter", xbox: "(A) Knop / Linker Stick" },
      { action: "Selectie Annuleren", keyboard: "Escape / Backspace", xbox: "(B) Knop" },
      { action: "Zet Ongedaan Maken", keyboard: "U", xbox: "(Y) Knop" },
      { action: "Nieuwe Partij", keyboard: "R", xbox: "Back / Select" }
    ],
    tips: [
      "Laat de toren (Rook) eens een ridder slaan voor een hilarische scène!",
      "Beheers het centrum van het bord (d4, d5, e4, e5) voor een sterke stelling."
    ]
  },
  pong: {
    title: "Pong",
    system: "Atari Arcade",
    year: "1972",
    summary: "De allereerste commercieel succesvolle videogame ooit, ontworpen door Allan Alcorn voor Nolan Bushnell.",
    instructions: [
      "Beweeg je paddle omhoog en omlaag om het vierkante balletje terug over het net te kaatsen.",
      "Scoor een punt door de bal langs de tegenstander te laten glippen.",
      "De eerste speler met 11 punten wint de wedstrijd.",
      "De snelheid van de bal neemt toe naarmate de rally langer duurt."
    ],
    controls: [
      { action: "Paddle Omhoog / Omlaag", keyboard: "Pijl-Omhoog / Pijl-Omlaag (of W / S)", xbox: "D-Pad / Linker Stick" },
      { action: "Bal Opslaan / Start", keyboard: "Spatiebalk / Enter", xbox: "(A) Knop" },
      { action: "Pauze", keyboard: "P", xbox: "Start / Menu" }
    ],
    tips: [
      "Raak de bal met de bovenste of onderste rand van je paddle voor een scherpe afbuighoek die de AI lastig kan verdedigen."
    ]
  },
  kings_quest: {
    title: "King's Quest I: Quest for the Crown",
    system: "IBM PCjr / Sierra",
    year: "1984",
    summary: "De legendarische grafische avonturenprimeur van Roberta Williams met AGI-engine.",
    instructions: [
      "Begeleid ridder Sir Graham door het koninkrijk Daventry om de drie verloren schatten terug te vinden.",
      "Beweeg met de pijltjestoetsen en typ tekstcommando's zoals 'LOOK TREE', 'OPEN DOOR', 'TAKE CARROT'.",
      "Wees voorzichtig bij water en kliffen: gevaar loert in elk scherm!",
      "Verzamel magische voorwerpen om puzzels en wezens te slim af te zijn."
    ],
    controls: [
      { action: "Graham Bewegen", keyboard: "Pijltjestoetsen", xbox: "Linker Stick / D-Pad" },
      { action: "Tekstinvoer Activeren", keyboard: "Typen op toetsenbord / Spatie", xbox: "(A) Knop (Virtueel invoer)" },
      { action: "Kijk Rond (Look)", keyboard: "L of typ 'LOOK'", xbox: "(Y) Knop" },
      { action: "Pauze / Menu", keyboard: "Escape", xbox: "Start / Menu" }
    ],
    tips: [
      "Sla je spel regelmatig op; een verkeerde stap kan fataal zijn!",
      "Onderzoek alles wat je tegenkomt met het commando 'LOOK'."
    ]
  },
  space_quest: {
    title: "Space Quest: The Sarien Encounter",
    system: "IBM PC / Sierra",
    year: "1986",
    summary: "Het doldwaze sci-fi avontuur van Mark Crowe & Scott Murphy met ruimteschoonmaker Roger Wilco.",
    instructions: [
      "Help Roger Wilco ontsnappen van het ruimteschip Arcada dat geënterd is door kwaadaardige Sariens.",
      "Gebruik typcommando's om machines te bedienen, sleutels te vinden en puzzels op te lossen.",
      "Voorkom dat de Sariens de Star Generator in handen krijgen.",
      "Geniet van de typische humor en overlijdensschermen van Sierra."
    ],
    controls: [
      { action: "Roger Bewegen", keyboard: "Pijltjestoetsen", xbox: "Linker Stick / D-Pad" },
      { action: "Interactie / Typen", keyboard: "Toetsenbord / Enter", xbox: "(A) Knop" },
      { action: "Zoeken (Search)", keyboard: "Typ 'SEARCH' / Spatie", xbox: "(X) Knop" },
      { action: "Menu / Pauze", keyboard: "Escape", xbox: "Start / Menu" }
    ],
    tips: [
      "Vergeet niet om direct de cartridge uit het datacentrum van de Arcada mee te nemen!"
    ]
  },
  tetris: {
    title: "Tetris",
    system: "Elektronika 60 / PC",
    year: "1984",
    summary: "Het tijdloze meesterwerk van Alexey Pajitnov. Stapel de 7 geometrische tetramino's op.",
    instructions: [
      "Roteer en verplaats de vallende blokken om complete horizontale rijen te vormen.",
      "Voltooide lijnen verdwijnen en leveren punten op.",
      "Ruim 4 lijnen tegelijk op voor een prestigieuze 'Tetris' bonus!",
      "Laat de stapel niet de top van het speelveld bereiken."
    ],
    controls: [
      { action: "Blok Verplaatsen L / R", keyboard: "Pijl-Links / Pijl-Rechts", xbox: "D-Pad / Linker Stick" },
      { action: "Roteren Rechts", keyboard: "Pijl-Omhoog / Z / Spatiebalk", xbox: "(A) Knop / (Y) Knop" },
      { action: "Zacht Laten Vallen", keyboard: "Pijl-Omlaag", xbox: "D-Pad Omlaag" },
      { action: "Hard Drop (Direct Neer)", keyboard: "Spatiebalk", xbox: "RT (Trigger) / (B)" },
      { action: "Pauze", keyboard: "P", xbox: "Start / Menu" }
    ],
    tips: [
      "Bouw een gelijkmatige stapel en bewaar de rechterkolom vrij voor de lange rechte I-balk (Tetris)."
    ]
  },
  arcadians: {
    title: "Arcadians",
    system: "BBC Micro",
    year: "1982",
    summary: "De iconische Galaxian-kloon van Acornsoft voor de BBC Micro met snelle duikende insectenvijanden.",
    instructions: [
      "Vernietig de formatie buitenaardse insecten die bovenin het scherm wemelt.",
      "Kijk uit wanneer ze in formatie losbreken en kamikaze-duikvluchten naar je schip maken.",
      "Schiet de commandoschepen neer terwijl ze duiken voor dubbele bonuspunten.",
      "Overleef opeenvolgende golven voor een recordscore."
    ],
    controls: [
      { action: "Schip naar Links", keyboard: "Z / Pijl-Links", xbox: "D-Pad Links / Stick" },
      { action: "Schip naar Rechts", keyboard: "X / Pijl-Rechts", xbox: "D-Pad Rechts / Stick" },
      { action: "Laser Afvuren", keyboard: "Spatiebalk / : / Enter", xbox: "(A) Knop / RT" },
      { action: "Pauze", keyboard: "P", xbox: "Start / Menu" }
    ],
    tips: [
      "Blijf niet stil in het midden staan; beweeg ritmisch langs de zijkanten om duikbommen te ontwijken."
    ]
  },
  frak: {
    title: "FRAK!",
    system: "BBC Micro",
    year: "1984",
    summary: "De unieke platformer van Orlando M. Pilchard met holbewoner Trogg en zijn gevreesde kreet 'FRAK!'.",
    instructions: [
      "Leid Trogg de holbewoner door gevaarlijke prehistorische grotten.",
      "Ontwijk Dodobavianen, gevaarlijke wezens en dodelijke afgronden.",
      "Gebruik je magische jojo om vijanden neer te slaan.",
      "Verzamel alle sleutels en letters om de uitgang van het level te ontgrendelen."
    ],
    controls: [
      { action: "Lopen Links / Rechts", keyboard: "Z / X (of Pijl-L / Pijl-R)", xbox: "D-Pad / Linker Stick" },
      { action: "Springen", keyboard: "Spatiebalk", xbox: "(A) Knop" },
      { action: "Jojo Wapen Gebruiken", keyboard: "Enter / Return", xbox: "(X) Knop / RT" },
      { action: "Pauze", keyboard: "P", xbox: "Start / Menu" }
    ],
    tips: [
      "Trogg heeft even tijd nodig om zijn jojo uit te werpen; anticipeer op de nadering van vijanden."
    ]
  },
  chuckie_egg: {
    title: "Chuckie Egg",
    system: "BBC Micro",
    year: "1983",
    summary: "De razendsnelle platformklassieker van A&F Software met Hen-House Harry.",
    instructions: [
      "Verzamel alle 12 gouden eieren in de kippenschuur voordat de timer afloopt.",
      "Eet graankorrels voor bonuspunten en om de boze eenden tijdelijk te stoppen.",
      "Klim over ladders en spring over gaten en bewegende liften.",
      "In latere levels breekt de gigantische struisvogel los uit zijn kooi!"
    ],
    controls: [
      { action: "Links / Rechts", keyboard: "Z / X (of Pijl-L / Pijl-R)", xbox: "D-Pad / Linker Stick" },
      { action: "Ladder Op / Neer", keyboard: "' / / (of Pijl-Omhoog / Omlaag)", xbox: "D-Pad Omhoog / Omlaag" },
      { action: "Springen", keyboard: "Spatiebalk", xbox: "(A) Knop" },
      { action: "Pauze", keyboard: "P", xbox: "Start / Menu" }
    ],
    tips: [
      "Harry kan meters ver springen als je zijwaarts beweegt tijdens de afzet!"
    ]
  },
  frogger: {
    title: "Frogger",
    system: "Konami / Arcade",
    year: "1982",
    summary: "De legendarische verkeers- en rivieroversteekgame van Konami.",
    instructions: [
      "Begeleid 5 kikkers veilig naar hun leliebladeren aan de overkant.",
      "Deel 1: Steek de drukke snelweg over zonder overreden te worden door auto's en vrachtwagens.",
      "Deel 2: Spring over drijvende boomstammen en schildpadden op de kolkende rivier.",
      "Pas op voor krokodillen en duikende schildpadden!"
    ],
    controls: [
      { action: "Springen (4 Richtingen)", keyboard: "Pijltjestoetsen / WASD", xbox: "D-Pad / Linker Stick" },
      { action: "Pauze", keyboard: "P", xbox: "Start / Menu" }
    ],
    tips: [
      "Wanneer schildpadden beginnen te knipperen, staan ze op het punt om onder water te duiken!"
    ]
  },
  eindeloos: {
    title: "Eindeloos (Endless)",
    system: "Commodore 64 / MSX (Radarsoft)",
    year: "1985",
    summary: "Het legendarische Nederlandse meesterwerk van Cees Kramer en John Vanderaart. Vlieg met 14 helikopters door een gigantisch ondergronds labyrint van 8192 × 4096 pixels om het kloppende hart te vernietigen.",
    instructions: [
      "Vlieg met je helikopter door het uitgestrekte ondergrondse doolhof en ontwijk de rotswanden.",
      "Bewegende Muren & Mechanische Sluisdeuren: Pas op voor verticale en horizontale stenen blokken en hydraulische vergruizers die automatisch open en dicht schuiven! Time je doorgang precies op het juiste moment.",
      "Gepantserde Poorten: Grote doorgangen (rood op de radar) zitten op slot. Verzamel de bijbehorende Gouden Sleutel in die sector om de poort permanent te laten openschuiven!",
      "Uitroepteken '!': Checkpoint / Landingsbaken! Vlieg eroverheen en druk op Spatiebalk of de (A) Knop op Xbox om het baken te activeren. Je tank wordt direct 100% bijgevuld en je verdient +500 punten. Als je crasht, herstart je vanaf dit checkpoint.",
      "4-Wegen Pijltjeskruis (Boost): Vlieg eroverheen om direct een krachtige turbo-stoot in je vliegrichting (+250 punten) en een 3-seconden onkwetsbaar energieschild te ontvangen.",
      "Gele Diamantjes / Ruitjes: Energie-orbs die rond risicovolle zones zweven (+50 punten en brandstofboost).",
      "Gouden Sleutels: Vind sleutels in de gangen (+1.000 punten) om mechanische poorten en energiebarrières permanent te ontgrendelen.",
      "Schiet zwevende doodshoofden (Skulls), mijnen en laserblokken neer met je raketten (+200 punten).",
      "Volg het knipperende kompas naar het zuidoosten (rechtsonderin de kaart) om Het Kloppende Hart te vernietigen!"
    ],
    controls: [
      { action: "Helikopter Sturen (8 Richtingen)", keyboard: "Pijltjestoetsen / WASD / Numpad 1-9", xbox: "D-Pad / Linker Stick" },
      { action: "Raket Vuren / Start / Checkpoint", keyboard: "Spatiebalk / Enter / Z / 0", xbox: "(A) Knop / RT (Right Trigger)" },
      { action: "Vliegsnelheid Wisselen (3 Standen)", keyboard: "B", xbox: "(B) Knop / LT (Left Trigger)" },
      { action: "Stootkussen (Bumper Trainer Aan/Uit)", keyboard: "K / C", xbox: "(X) Knop / LB (Left Bumper)" },
      { action: "Radarkaart (Volledig Scherm)", keyboard: "M / Y", xbox: "(Y) Knop / RB / View" },
      { action: "Pauze / Menu", keyboard: "P", xbox: "Start / Menu" },
      { action: "Spel Herstarten", keyboard: "R", xbox: "Back / Select" }
    ],
    tips: [
      "Origineel in 1985: Het originele spel kende géén stootkussen; elke aanraking met een wand leidde direct tot een crash. Gebruik het Stootkussen (X / LB knop) als trainer om het doolhof rustig te verkennen!",
      "Druk op (Y) op je Xbox controller of de toets 'M' om de complete overzichtskaart van het 8192×4096 doolhof te bekijken.",
      "Je begint met 14 helikopters, exact zoals in het origineel van Radarsoft."
    ]
  },
  outrun: {
    title: "OutRun",
    system: "Sega Arcade (Super-Scaler)",
    year: "1986",
    summary: "De legendarische race-hit van Yu Suzuki en Sega. Race in een rode Testarossa Spider met 293 km/u door 5 etappes met splitsende routes en 3 iconische radiozenders!",
    instructions: [
      "Stuur je rode Testarossa Spider over golvende heuvels, scherpe bochten en tussen verkeer door.",
      "Kies bij elke splitsing (fork) voor links of rechts om een andere route en eindbestemming (A t/m E) te kiezen.",
      "Passeer de controleposten (Checkpoints) voordat de tijd op 0 seconden staat.",
      "Schakel tussen Lage versnelling (Low: 0-190 km/u) en Hoge versnelling (High: tot 293 km/u).",
      "Kies met de radio-knop je favoriete nummer: Magical Sound Shower, Passing Breeze of Splash Wave!"
    ],
    controls: [
      { action: "Gas Geven (Accelerate)", keyboard: "Pijl-Omhoog / W", xbox: "RT (Right Trigger) / (A) Knop" },
      { action: "Remmen (Brake)", keyboard: "Pijl-Omlaag / S", xbox: "LT (Left Trigger) / (X) Knop" },
      { action: "Sturen Links / Rechts", keyboard: "Pijl-Links / Pijl-Rechts / A / D", xbox: "Linker Stick / D-Pad" },
      { action: "Schakelen Low / High", keyboard: "Spatiebalk / Shift", xbox: "RB / LB Bumpers of (Y) Knop" },
      { action: "Radio Zender Wisselen", keyboard: "M / R", xbox: "View / Back / (B) Knop" },
      { action: "Pauze / Start", keyboard: "P / Enter", xbox: "Start / Menu" }
    ],
    tips: [
      "Schakel bij 180-190 km/u door naar High gear voor maximale acceleratie tot 293 km/u!",
      "Laat bij scherpe bochten kort het gas los of tik even kort op de rem om driftend door de bocht te glijden zonder van de baan te vliegen.",
      "Route links is over het algemeen iets rustiger, terwijl rechts ruiger landschap en uitdagender verkeer biedt."
    ]
  },
  repton: {
    title: "Repton",
    system: "BBC Micro",
    year: "1985",
    summary: "De legendarische puzzelklassieker van Superior Software waarin de hagedis Repton diamanten verzamelt.",
    instructions: [
      "Graaf gangen door de aarde en verzamel alle schitterende diamanten in het level.",
      "Pas op voor vallende rotsblokken die je kunnen pletten.",
      "Laat vallende eieren niet breken, want daar komen dodelijke monsters uit!",
      "Pak de sleutel en bereik de kooi om het level af te ronden."
    ],
    controls: [
      { action: "Graven & Lopen", keyboard: "Pijltjestoetsen / WASD", xbox: "D-Pad / Linker Stick" },
      { action: "Tijdklok / Actie", keyboard: "Spatiebalk", xbox: "(A) Knop" },
      { action: "Level Herstarten", keyboard: "R", xbox: "Back / Select" },
      { action: "Pauze", keyboard: "P", xbox: "Start / Menu" }
    ],
    tips: [
      "Kijk altijd twee stappen vooruit voordat je onder een rotsblok door graaft."
    ]
  },
  demon_attack: {
    title: "Demon Attack",
    system: "Atari 2600",
    year: "1982",
    summary: "De adembenemende space shooter van Imagic (Rob Fulop) op de ijsplaneet Krydos.",
    instructions: [
      "Verdedig de basis tegen zwermen geometrische ruimtedemonen.",
      "Ontwijk de vallende laserstralen van de demonen.",
      "Pas op in latere golven: geraakte demonen splitsen zich in twee kleinere, snellere demonen!",
      "Versla het gigantische moederschip in de diepe ruimte."
    ],
    controls: [
      { action: "Kanon Links / Rechts", keyboard: "Pijl-Links / Pijl-Rechts (A / D)", xbox: "D-Pad / Linker Stick" },
      { action: "Laser Afvuren", keyboard: "Spatiebalk / Enter", xbox: "(A) Knop / RT" },
      { action: "Pauze", keyboard: "P", xbox: "Start / Menu" }
    ],
    tips: [
      "Vuur continu salvo's af terwijl je heen en weer beweegt om splitsende demonen direct te elimineren."
    ]
  },
  space_invaders: {
    title: "Space Invaders",
    system: "Taito Arcade",
    year: "1978",
    summary: "Het oerspel van Tomohiro Nishikado dat de wereldwijde arcade-revolutie ontketende.",
    instructions: [
      "Vernietig 5 rijen van 11 aliens voordat ze de grond bereiken.",
      "Schuil achter de 4 groene bunkers; maar let op, ze brokkelen af door vijandelijk vuur én je eigen schoten.",
      "Schiet de rode vliegende schotel (UFO) bovenin neer voor een willekeurige bonus van 50 tot 300 punten.",
      "Naarmate er minder aliens overblijven, bewegen en schieten ze drastisch sneller!"
    ],
    controls: [
      { action: "Kanon Links / Rechts", keyboard: "Pijl-Links / Pijl-Rechts (A / D)", xbox: "D-Pad / Linker Stick" },
      { action: "Kogel Afvuren", keyboard: "Spatiebalk / Pijl-Omhoog", xbox: "(A) Knop / RT" },
      { action: "Pauze", keyboard: "P", xbox: "Start / Menu" }
    ],
    tips: [
      "Schiet als eerste de buitenste kolommen aliens weg om de zijwaartse marcherende beweging van de vloot te vertragen."
    ]
  },
  lemmings: {
    title: "Lemmings",
    system: "Commodore 64 / Amiga / Arcade",
    year: "1991 / 1993",
    summary: "De revolutionaire puzzelklassieker van DMA Design en Psygnosis met vernietigbare landschappen en 8 vaardigheden.",
    instructions: [
      "Leid een groep hulpeloze dwergwezentjes veilig van de valdeur naar de magische uitgang.",
      "Wijs op het juiste moment een van de 8 vaardigheden toe aan individuele lemmings.",
      "Laat Blockers andere lemmings keren en bouw trappen over diepe afgronden met Builders.",
      "Graaf door muren met Bashers of loodrecht omlaag met Diggers.",
      "Bereik het minimale reddingspercentage binnen de tijdslimiet om te winnen.",
      "Gebruik in nood de Armageddon Nuke knop (N) om alle lemmings tegelijk te laten ontploffen."
    ],
    controls: [
      { action: "Vaardigheid Toewijzen", keyboard: "Linker Muisknop (op lemming)", xbox: "(A) Knop" },
      { action: "Vaardigheid Kiezen (1-8)", keyboard: "Cijfertoetsen 1 t/m 8", xbox: "D-Pad / LB & RB" },
      { action: "Camera Verschuiven", keyboard: "Pijltjestoetsen / Muis Slepen", xbox: "Rechter Stick" },
      { action: "Release Rate (+ / -)", keyboard: "+ / - Toetsen", xbox: "LT / RT Triggers" },
      { action: "Fast Forward", keyboard: "F", xbox: "(Y) Knop" },
      { action: "Pauze", keyboard: "P / Spatiebalk", xbox: "Start / Menu" },
      { action: "Armageddon Nuke", keyboard: "N", xbox: "(B) Knop (Inhouden)" }
    ],
    tips: [
      "Bouwers geven een waarschuwingstoon bij de laatste 3 treden; geef ze op tijd een nieuwe bouwopdracht om door te bouwen!",
      "Gebruik een Miner of Basher net boven een afgrond om een veilige glijbaan te maken."
    ]
  },
  rocket_raid: {
    title: "Rocket Raid",
    system: "BBC Micro / Acorn Electron",
    year: "1982",
    summary: "De legendarische side-scrolling shooter van Acornsoft & Jonathan Griffiths met 5 aaneengesloten fasen, dubbele bewapening en brandstofbeheer.",
    instructions: [
      "Vlieg je raket horizontaal door 5 fasen: Lunar Outpost, Grot met Dansende Mijnen, Meteoor Canyon, Wolkenkrabber Stad en het Gele Doolhof met Eindbasis.",
      "Schiet vliegende vijanden en raketten neer met je voorwaartse laser.",
      "Werp parabolische bommen af op grondraket-silo's, radarantennes en brandstoftanks.",
      "Vernietig FUEL-tanks om je brandstofvoorraad tijdig aan te vullen voordat je motor stilvalt.",
      "Ontwijk de dansende mijnen en meteoren en bereik het einde van het doolhof om de vijandelijke reactor te vernietigen!",
      "Schakel met de beeldscherm-knop tussen 'Acorn Grijs Monochroom' en 'Mode 2 Kleuren'!"
    ],
    controls: [
      { action: "Vliegen (Stijgen / Dalen / Versnellen / Remmen)", keyboard: "Pijltjestoetsen / WASD", xbox: "D-Pad / Linker Stick" },
      { action: "Voorwaartse Laser Afvuren", keyboard: "Spatiebalk / Enter / Z", xbox: "(A) Knop / RT" },
      { action: "Bom Afwerpen (Parabool)", keyboard: "B / Tab / Shift / X", xbox: "(B) Knop / (X) Knop / LT" },
      { action: "Beeldschermmodus (Grijs / Kleur)", keyboard: "Beeldscherm Knop Bovenaan", xbox: "(Y) Knop" },
      { action: "Pauze / Herstart", keyboard: "P / R", xbox: "Start / Menu" }
    ],
    tips: [
      "Laat bommen iets eerder vallen dan je doel: door je voorwaartse snelheid hebben ze een natuurlijke parabolische valboog!",
      "Grondsilo's schieten raketten omhoog zodra je in de buurt komt; schiet ze direct uit de lucht of ontwijk ze behendig.",
      "In de grot (fase 2) en het doolhof (fase 5) moet je zowel het plafond als de vloer vermijden."
    ]
  },
  exile: {
    title: "Exile",
    system: "BBC Micro Mode 5",
    year: "1988",
    summary: "De revolutionaire 6502 physics sandbox van Peter Irvin en Jeremy Smith. Verken het gigantische ondergrondse gangenstelsel van planeet Phoebus met Newtoniaanse fysica, vloeistofdynamica, jetpack, teleporter en de strijd tegen Triax.",
    instructions: [
      "Gebruik je jetpack stuwraketten om te vliegen. Pas op voor traagheid: tegensturen is nodig om af te remmen!",
      "Houd je HUD in de gaten: verbruik van SHIELD (energie), FUEL (jetbrandstof) en O2 (zuurstof bij onderwater zwemmen).",
      "Pak losse voorwerpen (rotsblokken, sleutels, brandstoftanks) op met [G] en gooi ze naar vijanden of plaats ze op drukschakelaars.",
      "Vind sleutelkaarten (Rood, Blauw, Geel) om de beveiligingsdeuren van het Triax-complex te ontgrendelen.",
      "Druk op [T] om direct te teleporteren naar je achtergelaten Teleport Baken!",
      "Wissel van wapen met [Q] of [1, 2, 3] tussen Blaster (oneindig), Stuiterende Granaten en Plasma Schoten.",
      "Druk op [M] om de volledige kaart van het ondergrondse Phoebus complex te bekijken.",
      "Versla de gekke geleerde Triax in zijn zwaarbewaakte troonzaal diep in de basis!"
    ],
    controls: [
      { action: "Jetpack Stuwing (Omhoog)", keyboard: "Pijl Omhoog / W", xbox: "(A) Knop / RT" },
      { action: "Navigeren (Links / Rechts)", keyboard: "Pijl Links & Rechts / A & D", xbox: "D-Pad / Linker Stick" },
      { action: "Wapen Afvuren", keyboard: "F / Ctrl / Spatiebalk", xbox: "(X) Knop / RB" },
      { action: "Voorwerp Pakken / Gooien", keyboard: "G / E", xbox: "(B) Knop" },
      { action: "Teleport naar Baken", keyboard: "T", xbox: "(Y) Knop" },
      { action: "Wapen Wisselen", keyboard: "Q / Cijfers 1-3", xbox: "LB" },
      { action: "Kaart Scherm (Map)", keyboard: "M / Tab", xbox: "Select / Back" },
      { action: "Pauze / Herstart", keyboard: "P / R", xbox: "Start / Menu" }
    ],
    tips: [
      "Laat je Teleport Baken achter op een veilige plek (zoals een laadstation). Als je in gevaar komt of bijna geen zuurstof meer hebt, druk je op [T] om direct te ontsnappen!",
      "Magpie-vogels in de bovenste grotten zijn nieuwsgierig en stelen losliggende sleutels of rotsblokken!",
      "Zware rotsblokken rollen langs hellingen naar beneden en kunnen automatische drones of turrets in één klap verpletteren.",
      "In water vermindert je daalsnelheid door drijfvermogen, maar je verbruikt zuurstof. Zoek zuurstoftanks of zwem op tijd naar het oppervlak."
    ]
  }
};


