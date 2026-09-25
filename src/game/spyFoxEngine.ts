/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Spy Fox: Operatie Melkzuur (1997 Humongous Entertainment / SCUMM)
 * Comprehensive Clean-Room TypeScript Adventure Engine with Voice Synthesis
 */

import { spyFoxAudio } from './spyFoxAudio';
import { spyFoxSpeech, SpeakerId } from './spyFoxSpeech';

export const SF_VIRTUAL_WIDTH = 320;
export const SF_VIRTUAL_HEIGHT = 200;

export type VerbType = 'LOOK_AT' | 'PICK_UP' | 'TALK_TO' | 'USE';

export type RoomId = 
  | 'harbor' 
  | 'cantina' 
  | 'cantina_kitchen' 
  | 'command' 
  | 'fortress' 
  | 'missile_silo' 
  | 'victory';

export interface InventoryItem {
  id: string;
  name: { nl: string; en: string };
  icon: string;
  description: { nl: string; en: string };
}

export interface Hotspot {
  id: string;
  name: { nl: string; en: string };
  x: number;
  y: number;
  width: number;
  height: number;
  walkTo: { x: number; y: number };
  action: (engine: SpyFoxEngine, verb: VerbType, activeItem: string | null) => void;
}

export interface DialogState {
  speaker: SpeakerId;
  speakerName: string;
  text: { nl: string; en: string };
  duration: number; // in frames
}

export class SpyFoxEngine {
  public currentRoom: RoomId = 'harbor';
  public prevRoom: RoomId = 'harbor';
  public foxX: number = 70;
  public foxY: number = 145;
  public targetX: number = 70;
  public targetY: number = 145;
  public facing: 'left' | 'right' = 'right';
  public isWalking: boolean = false;
  public walkFrame: number = 0;
  public talkFrame: number = 0;

  // Selected Verb & Active Item
  public selectedVerb: VerbType = 'LOOK_AT';
  public activeInventoryItem: string | null = null;
  public hoveredHotspot: Hotspot | null = null;
  public hoveredItem: InventoryItem | null = null;

  // Current language for voice & audio
  public currentLang: 'nl' | 'en' = 'nl';

  // Inventory & Story State
  public inventory: InventoryItem[] = [];

  // Game Puzzle Progression Flags
  public warehouseDoorUnlocked: boolean = false;
  public knowsKeypadCode: boolean = false;
  public dustedKeypad: boolean = false;
  public cantinaSecretDiscovered: boolean = false;
  public cowRescued: boolean = false;
  public laserTripwireDisabled: boolean = false;
  public hasTalkedToHenchman: boolean = false;
  public hasTalkedToChef: boolean = false;
  public hasFlour: boolean = false;
  public hasKeycard: boolean = false;
  public missileDisarmed: boolean = false;
  public score: number = 100;

  // Dialogue & Subtitles
  public dialog: DialogState | null = null;
  public dialogTimer: number = 0;

  // Visual Effects
  public laserAnim: { active: boolean; startX: number; startY: number; targetX: number; targetY: number; timer: number } = {
    active: false,
    startX: 0,
    startY: 0,
    targetX: 0,
    targetY: 0,
    timer: 0
  };

  // Hotspots definition across all authentic game rooms
  public hotspots: Record<RoomId, Hotspot[]> = {
    harbor: [
      {
        id: 'door',
        name: { nl: 'Fort-Toegangspoort', en: 'Fortress Blast Door' },
        x: 230,
        y: 65,
        width: 44,
        height: 70,
        walkTo: { x: 215, y: 140 },
        action: (eng, verb, item) => {
          if (verb === 'LOOK_AT') {
            eng.say('fox', {
              nl: 'Een zware gepantserde staaldeur. Er zit een elektronisch cijferslot naast.',
              en: 'A heavily armored steel blast door. It is locked with an electronic keypad.'
            });
          } else if (verb === 'USE' && item === 'laser_toothpick') {
            eng.fireLaser(eng.foxX, eng.foxY - 24, 252, 95);
            eng.warehouseDoorUnlocked = true;
            eng.say('fox', {
              nl: 'Bingo! De laser-tandenstoker brandt het relais door. De deur is ontgrendeld!',
              en: 'Bingo! The laser toothpick fried the electronic relay. Door unlocked!'
            });
            eng.addScore(250);
          } else if (verb === 'USE' && item === 'flour_powder') {
            eng.dustedKeypad = true;
            eng.knowsKeypadCode = true;
            spyFoxAudio.playSuccessJingle();
            eng.say('fox', {
              nl: 'Geweldig! Het meelpoeder hecht zich aan de vette toetsen. De code is 4 - 2 - 9 - 1!',
              en: 'Brilliant! The flour dust sticks to the greasy fingerprints. The code is 4 - 2 - 9 - 1!'
            });
            eng.addScore(200);
          } else if (verb === 'PICK_UP' || (verb === 'USE' && !item)) {
            if (eng.warehouseDoorUnlocked) {
              eng.changeRoom('fortress', 40, 150);
            } else {
              eng.say('fox', {
                nl: 'Hij zit hermetisch dicht. Ik heb de toegangscode nodig of een laser-snijbrander.',
                en: 'It is hermetically sealed. I need the security code or a cutting laser.'
              });
            }
          } else {
            eng.say('fox', {
              nl: 'Dat zal deze zware deur niet openen.',
              en: 'That won\'t open this reinforced blast door.'
            });
          }
        }
      },
      {
        id: 'keypad',
        name: { nl: 'Cijferslot Terminal', en: 'Security Keypad' },
        x: 212,
        y: 92,
        width: 14,
        height: 20,
        walkTo: { x: 200, y: 140 },
        action: (eng, verb, item) => {
          if (verb === 'LOOK_AT') {
            if (eng.knowsKeypadCode) {
              eng.say('fox', {
                nl: 'De zichtbare vingerafdrukken vormen de geheime code: 4 - 2 - 9 - 1!',
                en: 'The visible fingerprints reveal the secret code: 4 - 2 - 9 - 1!'
              });
            } else {
              eng.say('fox', {
                nl: 'Een 9-cijferig toetsenpaneel. Als ik iets had van poeder om vingerafdrukken zichtbaar te maken...',
                en: 'A 9-digit security keypad. If only I had some powder to reveal fingerprints...'
              });
            }
          } else if (verb === 'USE' && item === 'flour_powder') {
            eng.dustedKeypad = true;
            eng.knowsKeypadCode = true;
            spyFoxAudio.playSuccessJingle();
            eng.say('fox', {
              nl: 'Het meelpoeder hecht zich aan de vingerafdrukken: 4 - 2 - 9 - 1!',
              en: 'The flour powder highlights the fingerprints: 4 - 2 - 9 - 1!'
            });
            eng.addScore(200);
          } else if (verb === 'USE') {
            if (eng.knowsKeypadCode) {
              eng.warehouseDoorUnlocked = true;
              spyFoxAudio.playSuccessJingle();
              eng.say('fox', {
                nl: 'Toegangscode 4-2-9-1 ingevoerd! Klik... De hydraulische poort ontgrendelt!',
                en: 'Access code 4-2-9-1 entered! Click... The blast door unlocks!'
              });
              eng.addScore(150);
            } else {
              eng.say('fox', {
                nl: 'Zomaar wat intoetsen triggert het alarm. Ik moet eerst de code achterhalen.',
                en: 'Guessing blindly will trigger the alarm. I need to discover the code first.'
              });
            }
          }
        }
      },
      {
        id: 'tavern_entrance',
        name: { nl: 'Griekse Cantina Deur', en: 'Greek Cantina Door' },
        x: 100,
        y: 75,
        width: 32,
        height: 60,
        walkTo: { x: 116, y: 140 },
        action: (eng) => {
          eng.changeRoom('cantina', 40, 150);
        }
      },
      {
        id: 'boat',
        name: { nl: 'Spy Fox Snelle Speedboot', en: 'Spy Fox Speedboat' },
        x: 14,
        y: 130,
        width: 50,
        height: 35,
        walkTo: { x: 55, y: 155 },
        action: (eng, verb) => {
          if (verb === 'LOOK_AT') {
            eng.say('fox', {
              nl: 'Mijn vertrouwde SPY-speedboot, uitgerust met dubbele turbinemotoren en minikoelkast.',
              en: 'My trusted SPY speedboat, equipped with dual marine turbines and a mini-fridge.'
            });
          } else {
            eng.say('fox', {
              nl: 'Ik kan Acidophilus nog niet verlaten. De ontvoerde melkkoeien wachten op redding!',
              en: 'I cannot leave Acidophilus yet. The kidnapped dairy cows need rescuing!'
            });
          }
        }
      }
    ],

    cantina: [
      {
        id: 'henchman',
        name: { nl: 'Shady Geit Handlanger', en: 'Shady Goat Henchman' },
        x: 180,
        y: 70,
        width: 40,
        height: 65,
        walkTo: { x: 150, y: 140 },
        action: (eng, verb, item) => {
          if (verb === 'TALK_TO') {
            if (!eng.hasTalkedToHenchman) {
              eng.hasTalkedToHenchman = true;
              eng.say('henchman', {
                nl: 'Mèèèh! Wat moet je, vos? De baas, William the Kid, duldt geen pottenkijkers!',
                en: 'Baaaah! What do you want, fox? The boss, William the Kid, hates snoops!'
              });
            } else if (eng.knowsKeypadCode) {
              eng.say('henchman', {
                nl: 'Ik heb je al verteld wat ik weet! Ga melk drinken ofzo!',
                en: 'I told you everything! Go drink some milk or something!'
              });
            } else {
              eng.say('henchman', {
                nl: 'Voor een lekker muziekje op de jukebox wil ik misschien wel wat loslaten over de bunker...',
                en: 'Play my favorite spy jazz track on that jukebox, and maybe I will talk...'
              });
            }
          } else if (verb === 'LOOK_AT') {
            eng.say('fox', {
              nl: 'Een verdachte geit met een zwart ooglapje en een scheve grijns.',
              en: 'A suspicious goat henchman with an eyepatch and a crooked grin.'
            });
          } else if (verb === 'USE' && item === 'spy_coin') {
            eng.say('fox', {
              nl: 'Ik bewaar mijn spionagemunt liever voor de jukebox achterin.',
              en: 'I\'d rather feed this SPY coin into the jukebox in the corner.'
            });
          }
        }
      },
      {
        id: 'jukebox',
        name: { nl: 'Retro Jukebox', en: 'Retro Jukebox' },
        x: 260,
        y: 75,
        width: 32,
        height: 60,
        walkTo: { x: 245, y: 140 },
        action: (eng, verb, item) => {
          if (verb === 'LOOK_AT') {
            eng.say('fox', {
              nl: 'Een glimmende Wurlitzer jukebox vol funky geheim-agentenmuziek. Kost 1 muntje.',
              en: 'A glowing Wurlitzer jukebox loaded with funky spy tracks. Costs 1 coin.'
            });
          } else if (verb === 'USE' && item === 'spy_coin') {
            spyFoxAudio.playCoin();
            spyFoxAudio.startSpyTheme();
            eng.knowsKeypadCode = true;
            eng.addScore(150);
            eng.say('henchman', {
              nl: 'Mèèèh! Dat nummer is fantastisch! Luister, de code van de poort is 4-2-9-1!',
              en: 'Baaah! That groove is delicious! Listen fox, the fortress gate code is 4-2-9-1!'
            });
          } else if (verb === 'USE') {
            eng.say('fox', {
              nl: 'Hij heeft een muntinworp. Ik moet een geschikte munt gebruiken.',
              en: 'It requires a coin deposit. I need to find a suitable coin.'
            });
          }
        }
      },
      {
        id: 'kitchen_door',
        name: { nl: 'Keukendeur', en: 'Kitchen Swinging Door' },
        x: 35,
        y: 75,
        width: 25,
        height: 60,
        walkTo: { x: 45, y: 140 },
        action: (eng) => {
          eng.changeRoom('cantina_kitchen', 250, 145);
        }
      },
      {
        id: 'tapestry',
        name: { nl: 'Griekse Wandtapijt', en: 'Greek Wall Tapestry' },
        x: 80,
        y: 60,
        width: 35,
        height: 60,
        walkTo: { x: 95, y: 135 },
        action: (eng, verb) => {
          if (verb === 'LOOK_AT' || verb === 'PICK_UP') {
            eng.cantinaSecretDiscovered = true;
            eng.say('fox', {
              nl: 'Hé! Achter dit tapijt met geitenkaas-reclame zit een geheime gang naar het Fort!',
              en: 'Aha! Behind this goat cheese tapestry is a secret passageway to the Fortress!'
            });
          } else if (verb === 'USE') {
            eng.changeRoom('fortress', 40, 150);
          }
        }
      },
      {
        id: 'exit_door',
        name: { nl: 'Terug naar Haven', en: 'Back to Harbor' },
        x: 5,
        y: 80,
        width: 20,
        height: 65,
        walkTo: { x: 20, y: 150 },
        action: (eng) => {
          eng.changeRoom('harbor', 110, 145);
        }
      }
    ],

    cantina_kitchen: [
      {
        id: 'chef',
        name: { nl: 'Griekse Kok Chef Geit', en: 'Greek Goat Chef' },
        x: 70,
        y: 65,
        width: 45,
        height: 65,
        walkTo: { x: 110, y: 140 },
        action: (eng, verb) => {
          if (verb === 'TALK_TO') {
            eng.hasTalkedToChef = true;
            eng.say('henchman', {
              nl: 'Opa! Ik maak de beste geitenfeta soep van heel Griekenland! Pas op met meel morsen!',
              en: 'Opa! I make the finest goat feta stew in all of Greece! Don\'t mess with my flour!'
            });
          } else if (verb === 'LOOK_AT') {
            eng.say('fox', {
              nl: 'Een trotse chef-kok met een reusachtige pollepel en een wolk van meelstof om zich heen.',
              en: 'A proud head chef holding a giant ladle, surrounded by clouds of fine cooking flour.'
            });
          }
        }
      },
      {
        id: 'flour_sack',
        name: { nl: 'Zak Fijn Meelpoeder', en: 'Sack of Fine Flour' },
        x: 170,
        y: 95,
        width: 30,
        height: 35,
        walkTo: { x: 170, y: 140 },
        action: (eng, verb) => {
          if (verb === 'PICK_UP' || verb === 'USE') {
            if (!eng.hasFlour) {
              eng.hasFlour = true;
              eng.inventory.push({
                id: 'flour_powder',
                name: { nl: 'Meelpoeder', en: 'Flour Dust' },
                icon: '🌾',
                description: {
                  nl: 'Fijn wit meelpoeder uit de cantina-keuken. Ideaal als forensisch vingerafdrukpoeder!',
                  en: 'Ultra-fine white flour from the cantina. Perfect as forensic fingerprint powder!'
                }
              });
              spyFoxAudio.playSuccessJingle();
              eng.addScore(150);
              eng.say('fox', {
                nl: 'Uitstekend! Dit fijne meelpoeder is perfect om verborgen vingerafdrukken zichtbaar te maken.',
                en: 'Splendid! This fine flour powder will work wonders revealing hidden fingerprints on the keypad.'
              });
            } else {
              eng.say('fox', {
                nl: 'Ik heb al een zakje meelpoeder in mijn smokingzak.',
                en: 'I already have a pouch of flour powder in my tuxedo jacket.'
              });
            }
          } else if (verb === 'LOOK_AT') {
            eng.say('fox', {
              nl: 'Een zak ultra-fijn wit meel. Zou prima werken om vingerafdrukken mee op te lichten.',
              en: 'A bag of ultra-fine white flour. Could easily reveal greasy fingerprints.'
            });
          }
        }
      },
      {
        id: 'stew_pot',
        name: { nl: 'Grote Pan Feta Soep', en: 'Giant Feta Stew Pot' },
        x: 230,
        y: 80,
        width: 40,
        height: 50,
        walkTo: { x: 210, y: 140 },
        action: (eng, verb) => {
          if (verb === 'LOOK_AT') {
            eng.say('fox', {
              nl: 'Een zachtjes pruttelende ketel met Griekse kruiden en stinkende geitenkaas.',
              en: 'A gently simmering cauldron of Greek herbs and pungent goat feta.'
            });
          }
        }
      },
      {
        id: 'kitchen_exit',
        name: { nl: 'Terug naar Cantina', en: 'Back to Cantina' },
        x: 290,
        y: 75,
        width: 25,
        height: 65,
        walkTo: { x: 275, y: 140 },
        action: (eng) => {
          eng.changeRoom('cantina', 60, 145);
        }
      }
    ],

    fortress: [
      {
        id: 'laser_grid',
        name: { nl: 'Beveiligings-Laserstraal', en: 'Security Laser Tripwire' },
        x: 110,
        y: 80,
        width: 20,
        height: 60,
        walkTo: { x: 80, y: 145 },
        action: (eng, verb, item) => {
          if (verb === 'LOOK_AT') {
            eng.say('fox', {
              nl: 'Een dodelijke infrarood laserstraal die de toegang naar de raketlanceersilo blokkeert.',
              en: 'A deadly infrared laser tripwire guarding access to the missile launch silo.'
            });
          } else if (verb === 'USE' && item === 'laser_toothpick') {
            eng.fireLaser(eng.foxX, eng.foxY - 24, 120, 110);
            eng.laserTripwireDisabled = true;
            eng.addScore(300);
            eng.say('fox', {
              nl: 'De laser-tandenstoker weerkaatst de bundel en schakelt de zekering uit! De weg is vrij!',
              en: 'The laser toothpick neutralizes the emitter! Tripwire disabled! The way is clear!'
            });
          } else {
            eng.say('fox', {
              nl: 'Als ik er zo doorheen loop, word ik tot fondue gebrand.',
              en: 'Walking through unprotected would turn my tuxedo into fondue.'
            });
          }
        }
      },
      {
        id: 'silo_door',
        name: { nl: 'Deur naar Raket-Silo', en: 'Door to Missile Silo' },
        x: 240,
        y: 65,
        width: 45,
        height: 70,
        walkTo: { x: 220, y: 145 },
        action: (eng, verb) => {
          if (!eng.laserTripwireDisabled) {
            eng.say('fox', {
              nl: 'Ik moet eerst de laserstraal uitschakelen voordat ik die deur kan bereiken.',
              en: 'I must deactivate the laser tripwire first before I can approach that door.'
            });
          } else {
            eng.changeRoom('missile_silo', 40, 145);
          }
        }
      },
      {
        id: 'cheese_vat',
        name: { nl: 'Reusachtig Geitenkaasvat', en: 'Giant Goat Cheese Vat' },
        x: 140,
        y: 40,
        width: 60,
        height: 50,
        walkTo: { x: 160, y: 130 },
        action: (eng, verb) => {
          if (verb === 'LOOK_AT') {
            eng.say('fox', {
              nl: 'Duizenden liters stinkende geitenkaas. William the Kid\'s masterplan om koeienmelk te vernietigen!',
              en: 'Thousands of liters of pungent goat cheese. William the Kid\'s evil plot!'
            });
          }
        }
      },
      {
        id: 'exit_fortress',
        name: { nl: 'Terug naar Buiten', en: 'Exit to Pier' },
        x: 10,
        y: 80,
        width: 25,
        height: 65,
        walkTo: { x: 25, y: 150 },
        action: (eng) => {
          eng.changeRoom('harbor', 200, 145);
        }
      }
    ],

    missile_silo: [
      {
        id: 'william',
        name: { nl: 'William the Kid (Geitenbaas)', en: 'William the Kid (Mastermind)' },
        x: 135,
        y: 45,
        width: 45,
        height: 55,
        walkTo: { x: 120, y: 140 },
        action: (eng, verb) => {
          if (verb === 'TALK_TO') {
            eng.say('william', {
              nl: 'Mèèèh-ha-ha! Te laat, Spy Fox! Mijn Melkzuurraket staat klaar om alle melk in de stratosfeer te verzuren!',
              en: 'Mèèèh-ha-ha! Too late, Spy Fox! My Lactose Missile is primed to curdle the world\'s entire milk supply!'
            });
          } else if (verb === 'LOOK_AT') {
            eng.say('fox', {
              nl: 'William the Kid in eigen persoon! Gehuld in een gouden smokingjas en een arrogante grijns.',
              en: 'William the Kid in the flesh! Dressed in a flashy jacket with a supercilious smirk.'
            });
          }
        }
      },
      {
        id: 'cow_cage',
        name: { nl: 'Gekooid Kampioensrund Meneer Udderly', en: 'Caged Prize Cow Mr. Udderly' },
        x: 235,
        y: 70,
        width: 55,
        height: 70,
        walkTo: { x: 205, y: 145 },
        action: (eng, verb, item) => {
          if (verb === 'LOOK_AT') {
            eng.say('fox', {
              nl: 'Daar is meneer Udderly! De ontvoerde Holstein kampioenskoe van professor Quack.',
              en: 'It\'s Mr. Udderly! The prize dairy cow stolen by William the Kid.'
            });
          } else if (verb === 'TALK_TO') {
            eng.say('cow', {
              nl: 'Boeh! Spy Fox! Red me en ontwapen de raket voor hij ontploft!',
              en: 'Moo! Spy Fox! Save me and disarm the missile before it launches!'
            });
          } else if (verb === 'USE' && item === 'laser_toothpick') {
            eng.fireLaser(eng.foxX, eng.foxY - 24, 250, 95);
            eng.cowRescued = true;
            eng.addScore(400);
            spyFoxAudio.playSuccessJingle();
            eng.say('fox', {
              nl: 'De titanium kooiketting is doorgesneden! Meneer Udderly is in veiligheid!',
              en: 'The titanium chains are sliced! Mr. Udderly is safe!'
            });
          } else {
            eng.say('fox', {
              nl: 'De kettingen zijn te dik voor gewone handen. Ik moet de laser-tandenstoker gebruiken.',
              en: 'The chains are too thick for bare hands. I need the laser toothpick.'
            });
          }
        }
      },
      {
        id: 'rocket_panel',
        name: { nl: 'Melkzuurraket Bedieningspaneel', en: 'Milk Missile Control Terminal' },
        x: 60,
        y: 75,
        width: 40,
        height: 60,
        walkTo: { x: 80, y: 145 },
        action: (eng, verb, item) => {
          if (verb === 'LOOK_AT') {
            eng.say('fox', {
              nl: 'De ontstekingssequentie van de Melkzuurraket! Als ik de stroomtoevoer doorsnij...',
              en: 'The launch sequence of the Lactose Missile! If I sever the master fuel coupling...'
            });
          } else if (verb === 'USE' && item === 'laser_toothpick') {
            eng.fireLaser(eng.foxX, eng.foxY - 24, 75, 95);
            eng.missileDisarmed = true;
            eng.addScore(600);
            spyFoxAudio.playSuccessJingle();
            eng.say('fox', {
              nl: 'Voltreffer! De ontstekingskabel is doorgesneden! De raket is geneutraliseerd!',
              en: 'Direct hit! The ignition relay is severed! The missile is completely disarmed!'
            });

            if (eng.cowRescued) {
              setTimeout(() => {
                eng.changeRoom('victory', 160, 140);
              }, 3000);
            } else {
              eng.say('fox', {
                nl: 'Nu snel meneer Udderly bevrijden uit de kooi!',
                en: 'Now quickly, rescue Mr. Udderly from his cage!'
              });
            }
          } else {
            eng.say('fox', {
              nl: 'Het paneel is vergrendeld met gepantserd glas. Alleen de laser-tandenstoker kan hier doorheen.',
              en: 'The console is shielded with reinforced glass. Only the laser toothpick can cut it.'
            });
          }
        }
      },
      {
        id: 'back_to_fortress',
        name: { nl: 'Terug naar Bunker Gang', en: 'Back to Bunker Corridor' },
        x: 5,
        y: 80,
        width: 25,
        height: 65,
        walkTo: { x: 20, y: 145 },
        action: (eng) => {
          eng.changeRoom('fortress', 220, 145);
        }
      }
    ],

    command: [
      {
        id: 'penny',
        name: { nl: 'Monkey Penny', en: 'Monkey Penny' },
        x: 60,
        y: 60,
        width: 45,
        height: 65,
        walkTo: { x: 90, y: 140 },
        action: (eng) => {
          if (!eng.knowsKeypadCode) {
            eng.say('penny', {
              nl: 'Fox, check de cantina-keuken voor fijn meelpoeder om vingerafdrukken op het slot zichtbaar te maken!',
              en: 'Fox, look inside the cantina kitchen for fine flour dust to reveal the fingerprints on the lock!'
            });
          } else if (!eng.laserTripwireDisabled) {
            eng.say('penny', {
              nl: 'Pas op in het fort, Fox! Gebruik Professor Quack\'s laser-tandenstoker om de beveiligingslaser te ontmantelen!',
              en: 'Watch out in the fortress, Fox! Use Professor Quack\'s laser toothpick to disarm the security beam!'
            });
          } else {
            eng.say('penny', {
              nl: 'William the Kid zit in de raketlanceersilo met meneer Udderly! Red de melk van de wereld!',
              en: 'William the Kid is in the missile launch silo with Mr. Udderly! Save the world\'s dairy!'
            });
          }
        }
      },
      {
        id: 'quack',
        name: { nl: 'Professor Quack', en: 'Professor Quack' },
        x: 210,
        y: 60,
        width: 45,
        height: 65,
        walkTo: { x: 180, y: 140 },
        action: (eng) => {
          eng.say('quack', {
            nl: 'Kwak! Mijn Laser-Tandenstoker werkt op lithium-kristallen. Hij brandt door tralies, kooien en raketpanelen!',
            en: 'Quack! My Laser Toothpick runs on lithium crystals. It slices through bars, cages, and missile conduits!'
          });
        }
      },
      {
        id: 'close_watch',
        name: { nl: 'Sluit Spy Watch Scherm', en: 'Close Spy Watch' },
        x: 130,
        y: 160,
        width: 60,
        height: 25,
        walkTo: { x: 160, y: 150 },
        action: (eng) => {
          eng.changeRoom(eng.prevRoom, eng.foxX, eng.foxY);
        }
      }
    ],

    victory: [
      {
        id: 'replay',
        name: { nl: 'Speel Opnieuw / Replay', en: 'Play Again / Replay' },
        x: 110,
        y: 150,
        width: 100,
        height: 30,
        walkTo: { x: 160, y: 150 },
        action: (eng) => {
          eng.resetGame();
        }
      }
    ]
  };

  constructor() {
    this.resetGame();
  }

  public resetGame() {
    this.currentRoom = 'harbor';
    this.prevRoom = 'harbor';
    this.foxX = 70;
    this.foxY = 145;
    this.targetX = 70;
    this.targetY = 145;
    this.facing = 'right';
    this.isWalking = false;
    this.selectedVerb = 'LOOK_AT';
    this.activeInventoryItem = null;
    this.hoveredHotspot = null;
    this.hoveredItem = null;
    this.warehouseDoorUnlocked = false;
    this.knowsKeypadCode = false;
    this.dustedKeypad = false;
    this.cantinaSecretDiscovered = false;
    this.cowRescued = false;
    this.laserTripwireDisabled = false;
    this.hasTalkedToHenchman = false;
    this.hasTalkedToChef = false;
    this.hasFlour = false;
    this.hasKeycard = false;
    this.missileDisarmed = false;
    this.score = 100;
    this.dialog = null;
    this.dialogTimer = 0;

    this.inventory = [
      {
        id: 'spy_watch',
        name: { nl: 'Spy Watch', en: 'SPY Watch' },
        icon: '⌚',
        description: {
          nl: 'Directe videoverbinding met Monkey Penny en Professor Quack op het Mobiele Hoofdkwartier.',
          en: 'Direct satellite link to Monkey Penny and Professor Quack at Mobile Command.'
        }
      },
      {
        id: 'laser_toothpick',
        name: { nl: 'Laser-Tandenstoker', en: 'Laser Toothpick' },
        icon: '⚡',
        description: {
          nl: 'Een ingenieuze gadget van Professor Quack. Snijdt door titanium sloten, kabels en zekeringen.',
          en: 'A high-powered gadget from Professor Quack. Melts locks, cables, and goat cheese.'
        }
      },
      {
        id: 'spy_coin',
        name: { nl: 'Spionage-Munt', en: 'SPY Drachma Coin' },
        icon: '🪙',
        description: {
          nl: 'Een massieve gouden munt met zendertje. Geschikt voor jukeboxen en Griekse automaten.',
          en: 'A weighted Greek coin with a micro transmitter. Perfect for jukeboxes and payphones.'
        }
      }
    ];

    // Intro briefing message with voice
    setTimeout(() => {
      this.say('fox', {
        nl: 'Spy Fox gearriveerd op Acidophilus. Tijd om William the Kid te ontmaskeren en de melk te redden!',
        en: 'Spy Fox arriving on Acidophilus. Time to foil William the Kid and rescue the world\'s milk!'
      });
    }, 200);
  }

  public selectVerb(verb: VerbType) {
    this.selectedVerb = verb;
    this.activeInventoryItem = null;
    spyFoxAudio.playClick();
  }

  public selectInventoryItem(itemId: string) {
    if (itemId === 'spy_watch') {
      spyFoxAudio.playGadgetWhir();
      this.openSpyWatch();
      return;
    }

    this.selectedVerb = 'USE';
    this.activeInventoryItem = itemId;
    spyFoxAudio.playClick();
  }

  public openSpyWatch() {
    if (this.currentRoom !== 'command') {
      this.prevRoom = this.currentRoom;
      this.currentRoom = 'command';
      this.say('penny', {
        nl: 'Mobiel Hoofdkwartier online. Wat is je status, Fox?',
        en: 'Mobile Command online. What is your status, Fox?'
      });
    } else {
      this.currentRoom = this.prevRoom;
    }
  }

  public changeRoom(room: RoomId, startX: number, startY: number) {
    this.currentRoom = room;
    this.foxX = startX;
    this.foxY = startY;
    this.targetX = startX;
    this.targetY = startY;
    this.isWalking = false;
    this.hoveredHotspot = null;
    spyFoxAudio.playClick();
  }

  public say(speaker: SpeakerId, text: { nl: string; en: string }) {
    const speakerNames: Record<SpeakerId, string> = {
      fox: 'Spy Fox',
      penny: 'Monkey Penny',
      quack: 'Prof. Quack',
      william: 'William the Kid',
      henchman: 'Henchman Geit',
      cow: 'Meneer Udderly'
    };

    this.dialog = {
      speaker,
      speakerName: speakerNames[speaker],
      text,
      duration: Math.max(180, text.en.length * 4.5)
    };
    this.dialogTimer = this.dialog.duration;

    // Trigger procedural synth blip sound
    spyFoxAudio.playDialogBlip(speaker === 'fox' ? 0 : 120);

    // Speak with real character voice through speech synthesis
    spyFoxSpeech.speak(text[this.currentLang], speaker, this.currentLang);
  }

  public fireLaser(fromX: number, fromY: number, toX: number, toY: number) {
    this.laserAnim = {
      active: true,
      startX: fromX,
      startY: fromY,
      targetX: toX,
      targetY: toY,
      timer: 24
    };
    spyFoxAudio.playLaserToothpick();
  }

  public addScore(points: number) {
    this.score += points;
  }

  public update() {
    // Dialogue timer
    if (this.dialog) {
      this.dialogTimer--;
      this.talkFrame++;
      if (this.dialogTimer <= 0) {
        this.dialog = null;
      }
    }

    // Laser animation
    if (this.laserAnim.active) {
      this.laserAnim.timer--;
      if (this.laserAnim.timer <= 0) {
        this.laserAnim.active = false;
      }
    }

    // Walking physics
    if (this.isWalking) {
      const dx = this.targetX - this.foxX;
      const dy = this.targetY - this.foxY;
      const dist = Math.hypot(dx, dy);

      if (dist < 2.5) {
        this.foxX = this.targetX;
        this.foxY = this.targetY;
        this.isWalking = false;
      } else {
        const speed = 2.0;
        this.foxX += (dx / dist) * speed;
        this.foxY += (dy / dist) * speed;
        this.facing = dx >= 0 ? 'right' : 'left';
        this.walkFrame++;
      }
    }
  }

  public handleCanvasClick(clickX: number, clickY: number) {
    // 1. Check if clicking on inventory / verb interface at bottom (y >= 165)
    if (clickY >= 165) {
      return;
    }

    // 2. Check if clicked a hotspot in the room
    const currentHotspots = this.hotspots[this.currentRoom] || [];
    for (const spot of currentHotspots) {
      if (
        clickX >= spot.x &&
        clickX <= spot.x + spot.width &&
        clickY >= spot.y &&
        clickY <= spot.y + spot.height
      ) {
        this.targetX = spot.walkTo.x;
        this.targetY = spot.walkTo.y;
        this.isWalking = true;

        setTimeout(() => {
          spot.action(this, this.selectedVerb, this.activeInventoryItem);
        }, 350);
        return;
      }
    }

    // 3. Otherwise walk to clicked position in walkable area
    const clampedY = Math.min(160, Math.max(125, clickY));
    const clampedX = Math.min(300, Math.max(20, clickX));
    this.targetX = clampedX;
    this.targetY = clampedY;
    this.isWalking = true;
    spyFoxAudio.playClick();
  }

  public handleMouseMove(mouseX: number, mouseY: number) {
    const currentHotspots = this.hotspots[this.currentRoom] || [];
    let foundHotspot: Hotspot | null = null;

    if (mouseY < 165) {
      for (const spot of currentHotspots) {
        if (
          mouseX >= spot.x &&
          mouseX <= spot.x + spot.width &&
          mouseY >= spot.y &&
          mouseY <= spot.y + spot.height
        ) {
          foundHotspot = spot;
          break;
        }
      }
    }

    this.hoveredHotspot = foundHotspot;
  }
}
