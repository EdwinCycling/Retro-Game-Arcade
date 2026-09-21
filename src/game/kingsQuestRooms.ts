/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * King's Quest I: Quest for the Crown (1984, Sierra On-Line)
 * The Kingdom of Daventry: Rooms, Map Connections & Inventory Definitions
 */

import { RoomId, ItemId, InventoryItem, RoomDefinition } from './kingsQuestTypes';

export const INVENTORY_REGISTRY: Record<ItemId, InventoryItem> = {
  GOLDEN_EGG: {
    id: 'GOLDEN_EGG',
    name: 'Golden Egg',
    nameNl: 'Gouden Ei',
    description: 'A heavy egg made of pure, gleaming gold, taken from the bird’s nest in the oak tree.',
    descriptionNl: 'Een zwaar ei van zuiver, glanzend goud, meegenomen uit het vogelnest in de eik.',
    icon: '🥚',
    points: 6
  },
  WALNUT: {
    id: 'WALNUT',
    name: 'Walnut',
    nameNl: 'Walnoot',
    description: 'An ordinary-looking brown walnut picked from the ancient tree. Something rattles inside.',
    descriptionNl: 'Een gewone bruine walnoot geplukt van de oude boom. Er rammelt iets vanbinnen.',
    icon: '🌰',
    points: 3
  },
  GOLD_WALNUT: {
    id: 'GOLD_WALNUT',
    name: 'Golden Walnut Meat',
    nameNl: 'Gouden Walnootpit',
    description: 'Inside the cracked walnut shell lies a solid golden walnut meat!',
    descriptionNl: 'Binnenin de gekraakte walnoot schuilt een massief gouden noot!',
    icon: '✨',
    points: 6
  },
  FOUR_LEAF_CLOVER: {
    id: 'FOUR_LEAF_CLOVER',
    name: 'Four-Leaf Clover',
    nameNl: 'Klavertje Vier',
    description: 'A rare lucky four-leaf clover. Its sweet aroma wards off leprechaun enchantment.',
    descriptionNl: 'Een zeldzaam geluks-klavertjevier. De geur beschermt tegen kabouterbetovering.',
    icon: '🍀',
    points: 2
  },
  CARROT: {
    id: 'CARROT',
    name: 'Juicy Carrot',
    nameNl: 'Sappige Wortel',
    description: 'A crisp orange carrot pulled fresh from the garden patch. Goats find it irresistible.',
    descriptionNl: 'Een knapperige oranje wortel, vers geoogst. Geiten zijn er dol op.',
    icon: '🥕',
    points: 2
  },
  MAGIC_BEANS: {
    id: 'MAGIC_BEANS',
    name: 'Magic Beans',
    nameNl: 'Magische Bonen',
    description: 'Three shimmering beans given to you by the gnome IFNKOVHGROGH.',
    descriptionNl: 'Drie glinsterende bonen gekregen van de kabouter IFNKOVHGROGH.',
    icon: '🫘',
    points: 5
  },
  SLINGSHOT: {
    id: 'SLINGSHOT',
    name: 'Leather Slingshot',
    nameNl: 'Leren Katapult',
    description: 'A sturdy leather slingshot with polished river pebbles.',
    descriptionNl: 'Een stevige leren katapult met gladde rivierkeitjes.',
    icon: '🎯',
    points: 4
  },
  DAGGER: {
    id: 'DAGGER',
    name: 'Engraved Dagger',
    nameNl: 'Graveerde Dolk',
    description: 'A sharp, double-edged hunting dagger found hidden in the hollow tree.',
    descriptionNl: 'Een scherpe jachtdolk, gevonden in de holle boom.',
    icon: '🗡️',
    points: 5
  },
  FIDDLE: {
    id: 'FIDDLE',
    name: 'Enchanted Fiddle',
    nameNl: 'Betoverde Viool',
    description: 'A finely crafted wooden fiddle that plays a lively, irresistible Irish jig.',
    descriptionNl: 'Een prachtige houten viool die een onweerstaanbare Ierse dansmelodie speelt.',
    icon: '🎻',
    points: 3
  },
  CHEESE: {
    id: 'CHEESE',
    name: 'Wedge of Swiss Cheese',
    nameNl: 'Punt Zwitserse Kaas',
    description: 'A pungent wedge of aromatic holey cheese from the underground pantry.',
    descriptionNl: 'Een aromatische punt gatenkaas uit de ondergrondse provisiekast.',
    icon: '🧀',
    points: 2
  },
  MAGIC_MUSHROOM: {
    id: 'MAGIC_MUSHROOM',
    name: 'Magic Mushroom',
    nameNl: 'Magische Paddenstoel',
    description: 'A glowing purple subterranean mushroom. Eating it causes Sir Graham to shrink temporarily!',
    descriptionNl: 'Een paarse ondergrondse paddenstoel. Als je hem eet, krimpt Sir Graham tijdelijk!',
    icon: '🍄',
    points: 2
  },
  BUCKET: {
    id: 'BUCKET',
    name: 'Wooden Bucket',
    nameNl: 'Houten Emmer',
    description: 'An oak water bucket retrieved from the wishing well.',
    descriptionNl: 'Een eikenhouten emmer van de wensput.',
    icon: '🪣',
    points: 2
  },
  WATER_BUCKET: {
    id: 'WATER_BUCKET',
    name: 'Bucket of Water',
    nameNl: 'Emmer met Water',
    description: 'A bucket filled to the brim with clear spring water. Perfect for dousing dragon flame.',
    descriptionNl: 'Een emmer tot de rand gevuld met fris bronwater. Ideaal om drakenvuur te blussen.',
    icon: '💧',
    points: 5
  },
  MAGIC_MIRROR: {
    id: 'MAGIC_MIRROR',
    name: 'The Magic Mirror (Treasure #1)',
    nameNl: 'De Magische Spiegel (Schat #1)',
    description: 'The first Lost Treasure of Daventry! Gazing into the mirror reveals future prophecies and dangers.',
    descriptionNl: 'De eerste Verloren Schat van Daventry! Toont profetieën van de toekomst en gevaren.',
    icon: '🪞',
    points: 25
  },
  MAGIC_SHIELD: {
    id: 'MAGIC_SHIELD',
    name: 'The Magic Shield (Treasure #2)',
    nameNl: 'Het Magische Schild (Schat #2)',
    description: 'The second Lost Treasure of Daventry! Crafted of diamond steel, it protects the bearer from any mortal monster.',
    descriptionNl: 'De tweede Verloren Schat van Daventry! Beschermt de drager tegen alle dodelijke monsters.',
    icon: '🛡️',
    points: 25
  },
  MAGIC_CHEST: {
    id: 'MAGIC_CHEST',
    name: 'The Magic Chest (Treasure #3)',
    nameNl: 'De Magische Schatkist (Schat #3)',
    description: 'The third Lost Treasure of Daventry! An ornate treasure chest perpetually overflowing with pure gold coins.',
    descriptionNl: 'De derde Verloren Schat van Daventry! Een sierlijke kist die altijd volloopt met puur goud.',
    icon: '👑',
    points: 25
  }
};

export const ROOMS_DATA: Record<RoomId, RoomDefinition> = {
  CASTLE_GATES: {
    id: 'CASTLE_GATES',
    title: {
      en: 'Gates of Castle Daventry',
      nl: 'Poort van Kasteel Daventry'
    },
    description: {
      en: 'You stand before the grand stone gatehouse of Castle Daventry. A deep moat with hungry alligators circles the castle. Two royal guards stand watch at the lowered wooden drawbridge.',
      nl: 'Je staat voor het stenen poortgebouw van Kasteel Daventry. Een diepe slotgracht met alligators omringt het kasteel. Twee wachters houden de wacht bij de neergelaten houten ophaalbrug.'
    },
    // North is entered specifically via the drawbridge gate when portcullis opens
    north: undefined,
    south: 'CLOVER_PATCH',
    east: 'CASTLE_GARDEN',
    west: 'GREAT_OAK',
    items: [],
    actors: [
      {
        id: 'guard',
        name: 'Royal Guard',
        nameNl: 'Koninklijke Wachter',
        x: 160,
        y: 110,
        active: true,
        dialogue: {
          en: 'Halt Sir Graham! The portcullis is closed. King Edward is frail and awaits the three Lost Treasures of Daventry!',
          nl: 'Halt Sir Graham! De kasteelpoort is gesloten. Koning Edward is zwak en wacht op de drie Verloren Schatten van Daventry!'
        }
      }
    ],
    obstacles: [
      // Left and right castle stone battlements & towers (impassable)
      { x: 0, y: 0, width: 138, height: 82, type: 'solid' },
      { x: 182, y: 0, width: 138, height: 82, type: 'solid' },
      // Left and right deep moat with hungry alligators
      { x: 0, y: 78, width: 135, height: 26, type: 'water' },
      { x: 185, y: 78, width: 135, height: 26, type: 'water' }
    ],
    visited: false
  },

  CASTLE_GARDEN: {
    id: 'CASTLE_GARDEN',
    title: {
      en: 'Castle Flower Garden & Carrot Patch',
      nl: 'Kasteeltuin & Wortelveld'
    },
    description: {
      en: 'A lush garden beside the eastern castle parapet. Fragrant wildflowers bloom here, and a vegetable garden contains rows of crisp carrots.',
      nl: 'Een weelderige tuin naast de oostelijke kasteelmuur. Wilde bloemen bloeien hier en in een moestuintje groeien rijen knapperige wortels.'
    },
    west: 'CASTLE_GATES',
    south: 'WALNUT_TREE',
    items: ['CARROT'],
    actors: [],
    obstacles: [
      { x: 0, y: 0, width: 320, height: 50, type: 'solid' }
    ],
    visited: false
  },

  GREAT_OAK: {
    id: 'GREAT_OAK',
    title: {
      en: 'The Great Oak Tree',
      nl: 'De Grote Eikenboom'
    },
    description: {
      en: 'A colossal ancient oak tree towers into the blue Daventry sky. High in its sturdy branches rests a large bird’s nest containing a glimmering object.',
      nl: 'Een kolossale oude eik torent hoog in de blauwe hemel van Daventry. Hoog in de takken rust een groot vogelnest met daarin een glinsterend object.'
    },
    east: 'CASTLE_GATES',
    south: 'WISHING_WELL',
    items: ['GOLDEN_EGG', 'DAGGER'],
    actors: [],
    obstacles: [
      { x: 130, y: 90, width: 60, height: 60, type: 'solid' }
    ],
    visited: false
  },

  WISHING_WELL: {
    id: 'WISHING_WELL',
    title: {
      en: 'The Old Stone Wishing Well',
      nl: 'De Oude Stenen Wensput'
    },
    description: {
      en: 'An ancient stone wishing well with a wooden winch and bucket. Looking down the dark shaft, you hear rushing water deep in subterranean caverns below.',
      nl: 'Een oude stenen wensput met een houten lier en emmer. Kijkend in de diepte hoor je kolkend water in de ondergrondse grotten ver beneden.'
    },
    north: 'GREAT_OAK',
    east: 'CLOVER_PATCH',
    south: 'TROLL_BRIDGE',
    items: ['BUCKET'],
    actors: [],
    obstacles: [
      { x: 140, y: 100, width: 40, height: 40, type: 'solid' }
    ],
    visited: false
  },

  CLOVER_PATCH: {
    id: 'CLOVER_PATCH',
    title: {
      en: 'The Magic Clover Meadow',
      nl: 'De Magische Klaverweide'
    },
    description: {
      en: 'A green meadow carpeted with thousands of three-leaf clovers. Among them, a rare four-leaf clover glimmers with faint magical radiance.',
      nl: 'Een groene weide vol duizenden klavertjes drie. Ertussen glinstert een zeldzaam klavertje vier met een magische gloed.'
    },
    north: 'CASTLE_GATES',
    west: 'WISHING_WELL',
    east: 'WALNUT_TREE',
    south: 'GOAT_PEN',
    items: ['FOUR_LEAF_CLOVER'],
    actors: [],
    obstacles: [],
    visited: false
  },

  WALNUT_TREE: {
    id: 'WALNUT_TREE',
    title: {
      en: 'The Ancient Walnut Tree',
      nl: 'De Oude Walnootboom'
    },
    description: {
      en: 'A broad walnut tree with gnarled branches. Plump brown walnuts lie scattered beneath its leafy canopy. You can pick one up.',
      nl: 'Een brede walnootboom met knoestige takken. Dikke bruine walnoten liggen verspreid onder het bladerdak. Je kunt er een oprapen.'
    },
    north: 'CASTLE_GARDEN',
    west: 'CLOVER_PATCH',
    south: 'GNOME_FIELD',
    items: ['WALNUT'],
    actors: [],
    obstacles: [
      { x: 135, y: 75, width: 50, height: 50, type: 'solid' }
    ],
    visited: false
  },

  TROLL_BRIDGE: {
    id: 'TROLL_BRIDGE',
    title: {
      en: 'The Rickety Bridge & Greedy Troll',
      nl: 'De Houten Brug & De Gulzige Trol'
    },
    description: {
      en: 'A wooden bridge crosses a swift mountain river. A menacing troll blocks the crossing: "None shall pass unless you pay my toll or bring me a tasty meal!"',
      nl: 'Een houten brug overspant een snelstromende bergrivier. Een dreigende trol blokkeert de oversteek: "Niemand passeert zonder tol te betalen of mij een maaltijd te brengen!"'
    },
    north: 'WISHING_WELL',
    east: 'GOAT_PEN',
    west: 'GINGERBREAD_HOUSE',
    south: 'FERTILE_GROUND',
    items: [],
    actors: [
      {
        id: 'troll',
        name: 'River Troll',
        nameNl: 'Riviertrol',
        x: 160,
        y: 110,
        active: true,
        dialogue: {
          en: 'Grrr! Keep back, little human! My bridge, my toll!',
          nl: 'Grrr! Blijf achteruit, mensje! Mijn brug, mijn tol!'
        }
      }
    ],
    obstacles: [
      { x: 0, y: 80, width: 120, height: 40, type: 'water' },
      { x: 200, y: 80, width: 120, height: 40, type: 'water' }
    ],
    visited: false
  },

  GOAT_PEN: {
    id: 'GOAT_PEN',
    title: {
      en: 'The Meadow & Billy Goat',
      nl: 'De Weide & De Bok'
    },
    description: {
      en: 'A fenced paddock where a stubborn old billy goat grazes peacefully. He sniffs the air curiously. If only you had something sweet like a carrot to tempt him!',
      nl: 'Een omheinde wei waar een koppige oude bok vredig graast. Hij snuffelt nieuwsgierig. Had je maar iets zoets zoals een wortel om hem te lokken!'
    },
    north: 'CLOVER_PATCH',
    west: 'TROLL_BRIDGE',
    east: 'GNOME_FIELD',
    items: ['SLINGSHOT'],
    actors: [
      {
        id: 'goat',
        name: 'Billy Goat',
        nameNl: 'De Bok',
        x: 170,
        y: 120,
        active: true,
        dialogue: {
          en: 'Baaaaah! The goat looks at you expectantly.',
          nl: 'Bèèèèh! De bok kijkt je verwachtingsvol aan.'
        }
      }
    ],
    obstacles: [
      { x: 40, y: 60, width: 240, height: 10, type: 'solid' }
    ],
    visited: false
  },

  GINGERBREAD_HOUSE: {
    id: 'GINGERBREAD_HOUSE',
    title: {
      en: 'The Gingerbread House of the Witch',
      nl: 'Het Peperkoekhuisje van de Heks'
    },
    description: {
      en: 'In the shadows of the dark woods sits a house made of gingerbread and frosted candy canes. Inside, a cackling witch stirs a roaring brick oven!',
      nl: 'In de schaduw van het donkere bos staat een huisje van peperkoek en zuurstokken. Binnen roert een heks in een hete bakoven!'
    },
    east: 'TROLL_BRIDGE',
    south: 'DRAGON_CAVE',
    items: ['CHEESE'],
    actors: [
      {
        id: 'witch',
        name: 'Wicked Witch',
        nameNl: 'De Boze Heks',
        x: 160,
        y: 100,
        active: true,
        dialogue: {
          en: 'Hehehe! A juicy knight for my stew! Step a little closer to my oven, dearie!',
          nl: 'Hahaha! Een sappige ridder voor mijn stoofpot! Kom eens wat dichter bij mijn oven!'
        }
      }
    ],
    obstacles: [
      { x: 100, y: 60, width: 120, height: 50, type: 'solid' }
    ],
    visited: false
  },

  GNOME_FIELD: {
    id: 'GNOME_FIELD',
    title: {
      en: 'The Gnome & Spinning Wheel',
      nl: 'De Kabouter & Het Spinnewiel'
    },
    description: {
      en: 'An eccentric old gnome sits beside a golden spinning wheel. He cackles: "Guess my name, brave traveler, and magic beans of great power shall be yours!"',
      nl: 'Een zonderlinge kabouter zit bij een gouden spinnewiel. Hij grijnst: "Raad mijn naam, dappere reiziger, en magische bonen zijn voor jou!"'
    },
    north: 'WALNUT_TREE',
    west: 'GOAT_PEN',
    south: 'FERTILE_GROUND',
    items: [],
    actors: [
      {
        id: 'gnome',
        name: 'The Gnome (IFNKOVHGROGH)',
        nameNl: 'De Kabouter (IFNKOVHGROGH)',
        x: 160,
        y: 110,
        active: true,
        dialogue: {
          en: 'Tell me my name! (Hint: Read the alphabet backwards: A=Z, B=Y...)',
          nl: 'Zeg me mijn naam! (Hint: Lees het alfabet achterstevoren: A=Z, B=Y...)'
        }
      }
    ],
    obstacles: [
      { x: 130, y: 90, width: 60, height: 40, type: 'solid' }
    ],
    visited: false
  },

  FERTILE_GROUND: {
    id: 'FERTILE_GROUND',
    title: {
      en: 'The Fertile Soil Plot',
      nl: 'Het Vruchtbare Plantbed'
    },
    description: {
      en: 'A patch of rich, dark, loam soil warmed by the morning sun. It looks like the perfect place to plant seeds or magic beans!',
      nl: 'Een stuk donkere, vruchtbare aarde verwarmd door de zon. Het lijkt de perfecte plek om zaden of magische bonen te planten!'
    },
    north: 'TROLL_BRIDGE',
    east: 'GNOME_FIELD',
    south: 'LEPRECHAUN_HALL',
    items: [],
    actors: [],
    obstacles: [],
    visited: false
  },

  SKY_CLOUDS: {
    id: 'SKY_CLOUDS',
    title: {
      en: 'The Cloud Kingdom & The Giant',
      nl: 'Het Wolkenrijk & De Reus'
    },
    description: {
      en: 'You stand atop billowing white clouds in the high sky! A slumbering or patrolling Giant stomps through the mist, clutching the Magic Shield of Daventry.',
      nl: 'Je staat bovenop donzige witte wolken in de hoge hemel! Een stampende reus patrouilleert door de mist met het Magische Schild van Daventry in zijn vuist.'
    },
    south: 'FERTILE_GROUND',
    items: ['MAGIC_SHIELD'],
    actors: [
      {
        id: 'giant',
        name: 'The Cloud Giant',
        nameNl: 'De Wolkenreus',
        x: 180,
        y: 90,
        active: true,
        dialogue: {
          en: 'Fee-fi-fo-fum! Who dares disturb my heavenly realm?!',
          nl: 'Fee-fi-fo-fum! Wie waagt het mijn hemelrijk te betreden?!'
        }
      }
    ],
    obstacles: [
      { x: 0, y: 170, width: 320, height: 30, type: 'water' }
    ],
    visited: false
  },

  DRAGON_CAVE: {
    id: 'DRAGON_CAVE',
    title: {
      en: 'The Cavern of the Red Dragon',
      nl: 'De Grot van de Rode Draak'
    },
    description: {
      en: 'A subterranean cavern bathed in crimson glow. Coiled upon a pile of scorched boulders lies a gigantic fire-breathing red dragon guarding the Magic Mirror!',
      nl: 'Een onderaardse grot gehuld in een rode gloed. Op een stapel rotsen ligt een vuurspuwende rode draak die de Magische Spiegel bewaakt!'
    },
    north: 'GINGERBREAD_HOUSE',
    east: 'LEPRECHAUN_HALL',
    items: ['MAGIC_MIRROR'],
    actors: [
      {
        id: 'dragon',
        name: 'Red Dragon',
        nameNl: 'Rode Draak',
        x: 180,
        y: 95,
        active: true,
        dialogue: {
          en: 'ROOOAAAR! Flames crackle in the dragon’s throat!',
          nl: 'BRRRRULLL! Vlammen knetteren in de keel van de draak!'
        }
      }
    ],
    obstacles: [
      { x: 120, y: 70, width: 120, height: 60, type: 'solid' }
    ],
    visited: false
  },

  LEPRECHAUN_HALL: {
    id: 'LEPRECHAUN_HALL',
    title: {
      en: 'The Underground Hall of the Leprechauns',
      nl: 'De Ondergrondse Hal van de Kobolden'
    },
    description: {
      en: 'A glittering subterranean kingdom lit by emerald crystals. Tiny leprechauns scurry about. Upon a stone pedestal rests the Magic Chest of Endless Gold!',
      nl: 'Een glinsterend onderaards koninkrijk verlicht door smaragdgroene kristallen. Kleine kabouters krioelen rond. Op een sokkel staat de Magische Schatkist!'
    },
    west: 'DRAGON_CAVE',
    north: 'FERTILE_GROUND',
    items: ['MAGIC_CHEST', 'MAGIC_MUSHROOM', 'FIDDLE'],
    actors: [
      {
        id: 'leprechaun_king',
        name: 'Leprechaun King',
        nameNl: 'Koning der Kobolden',
        x: 160,
        y: 100,
        active: true,
        dialogue: {
          en: 'Welcome traveler! If ye have the shamrock, ye be our friend!',
          nl: 'Welkom reiziger! Zolang je het klavertje hebt, ben je onze vriend!'
        }
      }
    ],
    obstacles: [
      { x: 130, y: 70, width: 60, height: 40, type: 'solid' }
    ],
    visited: false
  },

  THRONE_ROOM: {
    id: 'THRONE_ROOM',
    title: {
      en: 'King Edward’s Royal Throne Room',
      nl: 'De Troonzaal van Koning Edward'
    },
    description: {
      en: 'The magnificent vaulted throne room of Castle Daventry. Frail King Edward sits upon his velvet throne, his royal scepter trembling as he awaits your news.',
      nl: 'De prachtige troonzaal van Kasteel Daventry. De verzwakte koning Edward zit op zijn fluwelen troon, reikhalzend uitkijkend naar jouw nieuws.'
    },
    south: 'CASTLE_GATES',
    items: [],
    actors: [
      {
        id: 'king_edward',
        name: 'King Edward the Benevolent',
        nameNl: 'Koning Edward de Goedhartige',
        x: 160,
        y: 75,
        active: true,
        dialogue: {
          en: 'Brave Sir Graham! Have you brought the three Lost Treasures to save Daventry?',
          nl: 'Dappere Sir Graham! Heb je de drie Verloren Schatten meegebracht om Daventry te redden?'
        }
      }
    ],
    obstacles: [
      { x: 0, y: 0, width: 110, height: 80, type: 'solid' },
      { x: 210, y: 0, width: 110, height: 80, type: 'solid' }
    ],
    visited: false
  }
};
