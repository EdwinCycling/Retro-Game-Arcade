/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type HangmanLanguage = 'nl' | 'en';
export type HangmanDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';
export type HangmanCategory = 'all' | 'retro' | 'science' | 'geography' | 'nature' | 'general';
export type HangmanMode = 'solitaire' | 'custom_word';

export interface HangmanWordItem {
  word: string;
  categoryNl: string;
  categoryEn: string;
  hintNl: string;
  hintEn: string;
  type: HangmanCategory;
}

export const HANGMAN_WORDS: { nl: HangmanWordItem[]; en: HangmanWordItem[] } = {
  nl: [
    // EASY (3-5 letters)
    { word: 'KAST', categoryNl: 'Meubilair', categoryEn: 'Furniture', hintNl: 'Opbergmeubel voor kleding of boeken', hintEn: 'Furniture for clothes', type: 'general' },
    { word: 'SCHIP', categoryNl: 'Vervoer', categoryEn: 'Transport', hintNl: 'Vaartuig op het water', hintEn: 'Vessel on water', type: 'general' },
    { word: 'BOOM', categoryNl: 'Natuur', categoryEn: 'Nature', hintNl: 'Grote plant met stam en takken', hintEn: 'Large plant with trunk', type: 'nature' },
    { word: 'WOLK', categoryNl: 'Weer', categoryEn: 'Weather', hintNl: 'Witte massa van waterdruppels in de lucht', hintEn: 'White cloud in sky', type: 'nature' },
    { word: 'ROBOT', categoryNl: 'Techniek', categoryEn: 'Tech', hintNl: 'Geautomatiseerde machine', hintEn: 'Automated machine', type: 'science' },
    { word: 'RADIO', categoryNl: 'Media', categoryEn: 'Media', hintNl: 'Ontvanger van geluidsgolven', hintEn: 'Sound wave receiver', type: 'retro' },
    { word: 'MAAN', categoryNl: 'Ruimte', categoryEn: 'Space', hintNl: 'Natuurlijke satelliet van de aarde', hintEn: 'Natural satellite of Earth', type: 'science' },
    { word: 'ZON', categoryNl: 'Ruimte', categoryEn: 'Space', hintNl: 'Onze dichtstbijzijnde ster', hintEn: 'Our nearest star', type: 'science' },
    { word: 'PACMAN', categoryNl: 'Retro Gaming', categoryEn: 'Retro Gaming', hintNl: 'Gele cirkel die spookjes ontwijkt', hintEn: 'Yellow dot eater dodging ghosts', type: 'retro' },
    { word: 'PONG', categoryNl: 'Retro Gaming', categoryEn: 'Retro Gaming', hintNl: 'Eerste arcade tennissimulatie uit 1972', hintEn: 'First 1972 arcade tennis game', type: 'retro' },
    { word: 'KAAS', categoryNl: 'Voeding', categoryEn: 'Food', hintNl: 'Goudgeel Nederlands zuivelproduct', hintEn: 'Yellow Dutch dairy product', type: 'general' },
    { word: 'TREIN', categoryNl: 'Vervoer', categoryEn: 'Transport', hintNl: 'Voertuig op spoorstaven', hintEn: 'Rail vehicle on tracks', type: 'general' },
    { word: 'LEEUW', categoryNl: 'Natuur', categoryEn: 'Nature', hintNl: 'Koning der dieren op de savanne', hintEn: 'King of animals on savanna', type: 'nature' },
    { word: 'KOMEET', categoryNl: 'Ruimte', categoryEn: 'Space', hintNl: 'IJsachtig hemellichaam met een staart', hintEn: 'Icy celestial body with tail', type: 'science' },
    { word: 'MOTOR', categoryNl: 'Techniek', categoryEn: 'Tech', hintNl: 'Aandrijfmechanisme in voertuigen', hintNl: 'Drive mechanism in vehicles', type: 'science' },
    { word: 'VOGEL', categoryNl: 'Natuur', categoryEn: 'Nature', hintNl: 'Gevleugeld dier dat kan vliegen', hintEn: 'Winged flying creature', type: 'nature' },
    { word: 'PIXEL', categoryNl: 'Retro Gaming', categoryEn: 'Retro Gaming', hintNl: 'Kleinste beeldelement op een scherm', hintEn: 'Smallest element of a display image', type: 'retro' },
    { word: 'RIVER', categoryNl: 'Aardrijkskunde', categoryEn: 'Geography', hintNl: 'Stromende watermassa naar de zee', hintEn: 'Flowing water body', type: 'geography' },

    // MEDIUM (6-8 letters)
    { word: 'KASTEEL', categoryNl: 'Gebouwen', categoryEn: 'Buildings', hintNl: 'Middeleeuwse vesting met torens', hintEn: 'Medieval fortress with towers', type: 'general' },
    { word: 'GITAAR', categoryNl: 'Muziek', categoryEn: 'Music', hintNl: 'Snaarinstrument met zes snaren', hintEn: 'Six-string instrument', type: 'general' },
    { word: 'PIRAAT', categoryNl: 'Historie', categoryEn: 'History', hintNl: 'Zeerover op zoek naar schatten', hintEn: 'Sea robber searching treasure', type: 'general' },
    { word: 'VULKAAN', categoryNl: 'Aardrijkskunde', categoryEn: 'Geography', hintNl: 'Berg die lava en as kan spuwen', hintEn: 'Mountain spewing lava and ash', type: 'geography' },
    { word: 'SLEUTEL', categoryNl: 'Gereedschap', categoryEn: 'Tools', hintNl: 'Voorwerp om een slot mee te openen', hintEn: 'Object to open a lock', type: 'general' },
    { word: 'TETRIS', categoryNl: 'Retro Gaming', categoryEn: 'Retro Gaming', hintNl: 'Puzzelspel met vallende tetromino blokken', hintEn: 'Puzzle game with falling blocks', type: 'retro' },
    { word: 'ARCADE', categoryNl: 'Retro Gaming', categoryEn: 'Retro Gaming', hintNl: 'Speelhal met muntelementen', hintEn: 'Coin-op game hall', type: 'retro' },
    { word: 'DIAMANT', categoryNl: 'Geologie', categoryEn: 'Geology', hintNl: 'Hardste natuurlijke edelsteen van koolstof', hintEn: 'Hardest natural gemstone', type: 'science' },
    { word: 'WOESTIJN', categoryNl: 'Aardrijkskunde', categoryEn: 'Geography', hintNl: 'Droog en zanderig landschap', hintEn: 'Dry and sandy landscape', type: 'geography' },
    { word: 'KOMPAS', categoryNl: 'Navigatie', categoryEn: 'Navigation', hintNl: 'Instrument met een magnetische naald', hintEn: 'Instrument with magnetic needle', type: 'science' },
    { word: 'SATELLIET', categoryNl: 'Ruimtevaart', categoryEn: 'Space', hintNl: 'Kunstmaan in een baan om de aarde', hintEn: 'Artificial body orbiting Earth', type: 'science' },
    { word: 'COMPUTER', categoryNl: 'Techniek', categoryEn: 'Tech', hintNl: 'Elektronische verwerkingsmachine', hintEn: 'Electronic processing device', type: 'science' },
    { word: 'LAMINATIE', categoryNl: 'Materialen', categoryEn: 'Materials', hintNl: 'Beschermlaag van kunststof', hintEn: 'Protective plastic coating', type: 'general' },
    { word: 'AMSTERDAM', categoryNl: 'Aardrijkskunde', categoryEn: 'Geography', hintNl: 'Hoofdstad van Nederland met grachten', hintEn: 'Capital of the Netherlands', type: 'geography' },
    { word: 'NINTENDO', categoryNl: 'Retro Gaming', categoryEn: 'Retro Gaming', hintNl: 'Maker van NES, SNES en Game Boy', hintEn: 'Maker of NES, SNES and Game Boy', type: 'retro' },
    { word: 'OLIFANT', categoryNl: 'Natuur', categoryEn: 'Nature', hintNl: 'Grootste landzoogdier met slurf', hintEn: 'Largest land mammal with trunk', type: 'nature' },
    { word: 'TROMBET', categoryNl: 'Muziek', categoryEn: 'Music', hintNl: 'Koperen blaasinstrument met ventielen', hintEn: 'Brass wind instrument', type: 'general' },
    { word: 'AARDIBEI', categoryNl: 'Voeding', categoryEn: 'Food', hintNl: 'Rode zomerse schijnvrucht', hintEn: 'Red summer fruit', type: 'nature' },

    // HARD (9-12 letters)
    { word: 'LABYRINT', categoryNl: 'Puzzels', categoryEn: 'Puzzles', hintNl: 'Doolhof met veel dwaalwegen', hintEn: 'Maze with many winding paths', type: 'general' },
    { word: 'HELIKOPTER', categoryNl: 'Luchtvaart', categoryEn: 'Aviation', hintNl: 'Luchtvaartuig met een grote rotor', hintEn: 'Aircraft with large overhead rotor', type: 'science' },
    { word: 'STRATEGIE', categoryNl: 'Denksport', categoryEn: 'Brain', hintNl: 'Doordacht plan om een doel te bereiken', hintEn: 'Thoughtful plan to achieve a goal', type: 'general' },
    { word: 'TELEFOON', categoryNl: 'Communicatie', categoryEn: 'Tech', hintNl: 'Toestel om op afstand mee te spreken', hintEn: 'Device for long-distance speech', type: 'general' },
    { word: 'ASTRONAUT', categoryNl: 'Ruimtevaart', categoryEn: 'Space', hintNl: 'Ruimtereiziger in een gewichtloze baan', hintEn: 'Space traveler in zero gravity', type: 'science' },
    { word: 'REINIGING', categoryNl: 'Schoonmaak', categoryEn: 'Cleaning', hintNl: 'Proces van grondig schoonmaken', hintEn: 'Process of thorough washing', type: 'general' },
    { word: 'CHIPTUNE', categoryNl: 'Retro Geluid', categoryEn: 'Retro Audio', hintNl: '8-bit muziek gesynthetiseerd door soundchips', hintEn: '8-bit music synthesized by chips', type: 'retro' },
    { word: 'COMMODORE', categoryNl: 'Retro Computers', categoryEn: 'Retro Computing', hintNl: 'Maker van de C64 en Amiga 500', hintEn: 'Maker of the C64 and Amiga 500', type: 'retro' },
    { word: 'MICROSCOOP', categoryNl: 'Wetenschap', categoryEn: 'Science', hintNl: 'Optisch instrument voor miniscule organismen', hintEn: 'Optical device for microscopic life', type: 'science' },
    { word: 'PENGUIN', categoryNl: 'Natuur', categoryEn: 'Nature', hintNl: 'Niet-vliegende vogel van het zuidelijk halfrond', hintEn: 'Flightless bird of polar regions', type: 'nature' },
    { word: 'STRATEGO', categoryNl: 'Bordspellen', categoryEn: 'Board Games', hintNl: 'Bordspel met de vlag en de maarschalk', hintEn: 'Classic board game with flag and marshal', type: 'retro' },
    { word: 'AARDRIJKSKUNDE', categoryNl: 'Wetenschap', categoryEn: 'Science', hintNl: 'De studie van de aarde en haar landschappen', hintEn: 'Study of Earth and its landscapes', type: 'geography' },
    { word: 'ZEESLAG', categoryNl: 'Bordspellen', categoryEn: 'Board Games', hintNl: 'Vlootstrategie op een ruitjesrooster', hintEn: 'Naval fleet grid game', type: 'retro' },
    { word: 'EVENWICHT', categoryNl: 'Natuurkunde', categoryEn: 'Physics', hintNl: 'Toestand waarin alle krachten in balans zijn', hintEn: 'State where forces are balanced', type: 'science' },
    { word: 'KLASLOKAAL', categoryNl: 'Onderwijs', categoryEn: 'School', hintNl: 'Ruimte op school waar les wordt gegeven', hintEn: 'School room where lessons are held', type: 'general' },

    // EXTREME (13+ letters)
    { word: 'COMPUTERWETENSCHAP', categoryNl: 'Informatica', categoryEn: 'Computer Science', hintNl: 'De studie van algoritmen, data en computers', hintEn: 'Study of algorithms and computation', type: 'science' },
    { word: 'QUANTUMMECHANICA', categoryNl: 'Natuurkunde', categoryEn: 'Physics', hintNl: 'Fysica van subatomaire deeltjes en golven', hintEn: 'Physics of subatomic particles', type: 'science' },
    { word: 'ARCHITECTUUR', categoryNl: 'Bouwkunde', categoryEn: 'Architecture', hintNl: 'De kunst en wetenschap van het ontwerpen van gebouwen', hintEn: 'Art and science of designing structures', type: 'general' },
    { word: 'ASTROFYSICA', categoryNl: 'Sterrenkunde', categoryEn: 'Astronomy', hintNl: 'Tak van de astronomie die natuurkunde toepast op het heelal', hintEn: 'Branch of astronomy applying physics to the cosmos', type: 'science' },
    { word: 'TELECOMMUNICATIE', categoryNl: 'Netwerken', categoryEn: 'Networks', hintNl: 'Overdracht van informatie over grote afstanden', hintEn: 'Transmission of signals across distances', type: 'science' },
    { word: 'RUITJESPAPIER', categoryNl: 'Wiskunde', categoryEn: 'Math Paper', hintNl: 'Collegeblok papier met blauwe vierkante vakjes', hintEn: 'Grid paper with blue square boxes', type: 'general' },
    { word: 'ELEKTRONICA', categoryNl: 'Techniek', categoryEn: 'Tech', hintNl: 'Wetenschap van elektrische stroomsturing', hintEn: 'Science of controlling electrical flow', type: 'science' },
    { word: 'HERSTRUCTURERING', categoryNl: 'Organisatie', categoryEn: 'Business', hintNl: 'Grondige hervorming van een organisatie', hintEn: 'Thorough reform of an organization', type: 'general' }
  ],
  en: [
    // EASY (3-5 letters)
    { word: 'CABIN', categoryNl: 'Gebouwen', categoryEn: 'Buildings', hintEn: 'Small wooden house in woods', hintNl: 'Houten hutje in het bos', type: 'general' },
    { word: 'PLANET', categoryNl: 'Ruimte', categoryEn: 'Space', hintEn: 'Large celestial body orbiting a star', hintNl: 'Groot hemellichaam om een ster', type: 'science' },
    { word: 'LASER', categoryNl: 'Techniek', categoryEn: 'Tech', hintEn: 'Focused narrow beam of light', hintNl: 'Gefocuste smalle lichtstraal', type: 'science' },
    { word: 'GHOST', categoryNl: 'Retro Gaming', categoryEn: 'Retro Gaming', hintEn: 'Blinky, Pinky, Inky or Clyde', hintNl: 'Spookje uit Pac-Man', type: 'retro' },
    { word: 'SPACE', categoryNl: 'Ruimte', categoryEn: 'Space', hintEn: 'The vast cosmos beyond Earth', hintNl: 'Het oneindige heelal', type: 'science' },
    { word: 'SNAKE', categoryNl: 'Natuur', categoryEn: 'Nature', hintEn: 'Legless reptile or Nokia mobile game', hintNl: 'Pootloze reptiel of Nokia mobiel spel', type: 'retro' },
    { word: 'TIGER', categoryNl: 'Natuur', categoryEn: 'Nature', hintEn: 'Large striped wild cat', hintNl: 'Grote gestreepte wilde kat', type: 'nature' },
    { word: 'STORM', categoryNl: 'Weer', categoryEn: 'Weather', hintEn: 'Violent weather with heavy rain and wind', hintNl: 'Hevig weer met regen en wind', type: 'nature' },
    { word: 'ROBOT', categoryNl: 'Techniek', categoryEn: 'Tech', hintEn: 'Automated mechanical machine', hintNl: 'Geautomatiseerde machine', type: 'science' },
    { word: 'COMET', categoryNl: 'Ruimte', categoryEn: 'Space', hintEn: 'Icy body leaving a tail in space', hintNl: 'IJsachtig hemellichaam met een staart', type: 'science' },
    { word: 'CROWN', categoryNl: 'Historie', categoryEn: 'History', hintEn: 'Headpiece worn by a monarch', hintNl: 'Hoofddeksel van een koning', type: 'general' },
    { word: 'OCEAN', categoryNl: 'Aardrijkskunde', categoryEn: 'Geography', hintEn: 'Vast body of salt water covering Earth', hintNl: 'Grote zoutwatermassa op aarde', type: 'geography' },

    // MEDIUM (6-8 letters)
    { word: 'CASTLE', categoryNl: 'Gebouwen', categoryEn: 'Buildings', hintEn: 'Fortified medieval royal residence', hintNl: 'Middeleeuwse koninklijke burcht', type: 'general' },
    { word: 'GUITAR', categoryNl: 'Muziek', categoryEn: 'Music', hintEn: 'Plucked musical instrument with strings', hintNl: 'Tokkelinstrument met snaren', type: 'general' },
    { word: 'PIRATE', categoryNl: 'Historie', categoryEn: 'History', hintEn: 'Seafaring bandit seeking treasure', hintNl: 'Zeerover op zoek naar goud', type: 'general' },
    { word: 'VOLCANO', categoryNl: 'Aardrijkskunde', categoryEn: 'Geography', hintEn: 'Mountain with a crater spewing lava', hintNl: 'Berg met een krater waar lava uit komt', type: 'geography' },
    { word: 'DRAGON', categoryNl: 'Sprookjes', categoryEn: 'Fantasy', hintEn: 'Mythical fire-breathing reptilian creature', hintNl: 'Mythologisch vuurspuwend wezen', type: 'general' },
    { word: 'SPECTRUM', categoryNl: 'Retro Computers', categoryEn: 'Retro Computing', hintEn: 'Sinclair ZX 8-bit home computer', hintNl: 'Sinclair 8-bit homecomputer', type: 'retro' },
    { word: 'NINTENDO', categoryNl: 'Retro Gaming', categoryEn: 'Retro Gaming', hintEn: 'Japanese gaming giant created Game Boy', hintNl: 'Japanse gamegigant van NES en Game Boy', type: 'retro' },
    { word: 'GALAXY', categoryNl: 'Ruimte', categoryEn: 'Space', hintEn: 'Gravitationally bound system of stars', hintNl: 'Sterrenstelsel in het heelal', type: 'science' },
    { word: 'DIAMOND', categoryNl: 'Geologie', categoryEn: 'Geology', hintEn: 'Hardest natural mineral gemstone', hintNl: 'Hardste edelsteen', type: 'science' },
    { word: 'COMPASS', categoryNl: 'Navigatie', categoryEn: 'Navigation', hintEn: 'Magnetic direction finding tool', hintNl: 'Magnetisch kompas', type: 'science' },
    { word: 'KINGDOM', categoryNl: 'Historie', categoryEn: 'History', hintEn: 'Country ruled by a king or queen', hintNl: 'Koninkrijk onder een vorst', type: 'general' },

    // HARD (9-12 letters)
    { word: 'LABYRINTH', categoryNl: 'Puzzels', categoryEn: 'Puzzles', hintEn: 'Intricate network of winding passages', hintNl: 'Ingewikkeld netwerk van dwaalgangen', type: 'general' },
    { word: 'HELICOPTER', categoryNl: 'Luchtvaart', categoryEn: 'Aviation', hintEn: 'Rotorcraft capable of vertical takeoff', hintNl: 'Luchtvaartuig dat verticaal kan opstijgen', type: 'science' },
    { word: 'ASTRONAUT', categoryNl: 'Ruimtevaart', categoryEn: 'Space', hintEn: 'Person trained to travel in spacecraft', hintNl: 'Persoon getraind voor ruimte-expedities', type: 'science' },
    { word: 'ALGORITHM', categoryNl: 'Informatica', categoryEn: 'Computer Science', hintEn: 'Step-by-step set of rules for calculation', hintNl: 'Stapsgewijze instructies voor berekeningen', type: 'science' },
    { word: 'VOYAGER', categoryNl: 'Ruimtevaart', categoryEn: 'Space Exploration', hintEn: 'NASA interstellar space probe launched in 1977', hintNl: 'NASA ruimtesonde gelanceerd in 1977', type: 'science' },
    { word: 'SATELLITE', categoryNl: 'Ruimtevaart', categoryEn: 'Space', hintEn: 'Object in orbit around a larger body', hintNl: 'Kunstmaan om een planeet', type: 'science' },
    { word: 'MICROSCOPE', categoryNl: 'Wetenschap', categoryEn: 'Science', hintEn: 'Instrument used to view tiny objects', hintNl: 'Instrument voor miniscule deeltjes', type: 'science' },

    // EXTREME (13+ letters)
    { word: 'COMPUTERSCIENCE', categoryNl: 'Informatica', categoryEn: 'Computer Science', hintEn: 'Study of computation, information and automation', hintNl: 'Studie van berekeningen, informatie en automatisering', type: 'science' },
    { word: 'QUANTUMPHYSICS', categoryNl: 'Natuurkunde', categoryEn: 'Physics', hintEn: 'Branch of science exploring atomic scale phenomena', hintNl: 'Tak van de wetenschap die atomaire verschijnselen bestudeert', type: 'science' },
    { word: 'ASTROPHYSICS', categoryNl: 'Sterrenkunde', categoryEn: 'Astronomy', hintEn: 'Branch of space science applying laws of physics', hintNl: 'Ruimtewetenschap die natuurkundige wetten toepast', type: 'science' },
    { word: 'TELECOMMUNICATION', categoryNl: 'Netwerken', categoryEn: 'Networks', hintEn: 'Transmission of signals over long distances', hintNl: 'Overdracht van data over grote afstanden', type: 'science' }
  ]
};

export class HangmanEngine {
  public language: HangmanLanguage = 'nl';
  public difficulty: HangmanDifficulty = 'medium';
  public category: HangmanCategory = 'all';
  public gameMode: HangmanMode = 'solitaire';

  public targetWord: string = '';
  public wordCategory: string = '';
  public wordHint: string = '';

  public guessedLetters: Set<string> = new Set();
  public wrongGuesses: string[] = [];
  public maxWrongGuesses: number = 10;

  public phase: 'playing' | 'won' | 'lost' = 'playing';
  public isHintRevealed: boolean = false;
  public score: number = 0;
  public winStreak: number = 0;

  private audioCtx: AudioContext | null = null;

  constructor(lang: HangmanLanguage = 'nl', diff: HangmanDifficulty = 'medium') {
    this.language = lang;
    this.difficulty = diff;
    this.initGame();
  }

  public initGame(customWord?: string, customCategory?: string, customHint?: string) {
    this.guessedLetters.clear();
    this.wrongGuesses = [];
    this.phase = 'playing';
    this.isHintRevealed = false;

    if (customWord && customWord.trim().length >= 3) {
      this.gameMode = 'custom_word';
      this.targetWord = customWord.trim().toUpperCase();
      this.wordCategory = customCategory || (this.language === 'nl' ? 'Eigen Woord' : 'Custom Word');
      this.wordHint = customHint || (this.language === 'nl' ? 'Zelf ingevoerd door speler 1' : 'Entered by Player 1');
    } else {
      this.gameMode = 'solitaire';
      this.pickRandomWord();
    }
  }

  public pickRandomWord() {
    const list = HANGMAN_WORDS[this.language] || HANGMAN_WORDS.nl;

    // Filter by difficulty length
    const filtered = list.filter(item => {
      const len = item.word.length;
      if (this.difficulty === 'easy') return len >= 3 && len <= 5;
      if (this.difficulty === 'medium') return len >= 6 && len <= 8;
      if (this.difficulty === 'hard') return len >= 9 && len <= 12;
      if (this.difficulty === 'extreme') return len >= 13;
      return true;
    });

    // Filter by category if set
    const categoryFiltered = filtered.filter(item => {
      if (this.category === 'all') return true;
      return item.type === this.category;
    });

    const pool = categoryFiltered.length > 0 ? categoryFiltered : (filtered.length > 0 ? filtered : list);
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    this.targetWord = chosen.word;
    this.wordCategory = this.language === 'nl' ? chosen.categoryNl : chosen.categoryEn;
    this.wordHint = this.language === 'nl' ? chosen.hintNl : chosen.hintEn;
  }

  // Guess a letter
  public guessLetter(letter: string, playAudio: boolean = true): { isCorrect: boolean; isAlreadyGuessed: boolean } {
    if (this.phase !== 'playing') return { isCorrect: false, isAlreadyGuessed: false };

    const cleanChar = letter.toUpperCase().trim();
    if (!cleanChar || cleanChar.length !== 1 || !/[A-Z]/.test(cleanChar)) {
      return { isCorrect: false, isAlreadyGuessed: false };
    }

    if (this.guessedLetters.has(cleanChar)) {
      return { isCorrect: this.targetWord.includes(cleanChar), isAlreadyGuessed: true };
    }

    this.guessedLetters.add(cleanChar);

    const isCorrect = this.targetWord.includes(cleanChar);

    if (isCorrect) {
      if (playAudio) this.playPenScratch();

      // Check for win
      const allRevealed = this.targetWord.split('').every(char => !/[A-Z]/.test(char) || this.guessedLetters.has(char));
      if (allRevealed) {
        this.phase = 'won';
        this.winStreak++;
        const baseScore = this.targetWord.length * 150;
        const penalty = this.wrongGuesses.length * 50;
        const hintPenalty = this.isHintRevealed ? 100 : 0;
        const roundPoints = Math.max(100, baseScore - penalty - hintPenalty);
        this.score += roundPoints;
        if (playAudio) this.playVictoryChime();
      }
    } else {
      this.wrongGuesses.push(cleanChar);
      if (playAudio) this.playWrongScribble();

      // Check for loss
      if (this.wrongGuesses.length >= this.maxWrongGuesses) {
        this.phase = 'lost';
        this.winStreak = 0;
        if (playAudio) this.playPaperTear();
      }
    }

    return { isCorrect, isAlreadyGuessed: false };
  }

  public revealHint() {
    this.isHintRevealed = true;
  }

  public getMaskedWord(): { char: string; revealed: boolean }[] {
    return this.targetWord.split('').map(char => {
      if (!/[A-Z]/.test(char)) {
        return { char, revealed: true };
      }
      return {
        char,
        revealed: this.guessedLetters.has(char)
      };
    });
  }

  // Audio synthesis
  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  public playPenScratch() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;

      // Ballpoint pen stroke sound
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.08);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.08);
    } catch {
      // Audio fallback
    }
  }

  public playWrongScribble() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;

      // Heavy red pen scribble noise
      for (let i = 0; i < 3; i++) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const start = t + i * 0.03;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180 + Math.random() * 120, start);
        osc.frequency.exponentialRampToValueAtTime(90, start + 0.05);

        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.05);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(start);
        osc.stop(start + 0.05);
      }
    } catch {
      // Audio fallback
    }
  }

  public playVictoryChime() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.1);

        gain.gain.setValueAtTime(0.18, t + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.1 + 0.25);

        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);

        osc.start(t + idx * 0.1);
        osc.stop(t + idx * 0.1 + 0.25);
      });
    } catch {
      // Audio fallback
    }
  }

  public playPaperTear() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.linearRampToValueAtTime(80, t + 0.35);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.35);
    } catch {
      // Audio fallback
    }
  }
}
