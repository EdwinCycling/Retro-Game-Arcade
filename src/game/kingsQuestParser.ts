/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * King's Quest I: Quest for the Crown (1984, Sierra On-Line)
 * Text Parser & Natural Command Processor (English & Dutch support)
 */

import { RoomId, ItemId } from './kingsQuestTypes';
import { INVENTORY_REGISTRY } from './kingsQuestRooms';

export interface ParseResult {
  success: boolean;
  message: { en: string; nl: string };
  action?: 'ITEM_TAKEN' | 'ITEM_USED' | 'ROOM_CHANGED' | 'VICTORY' | 'SCORE_CHANGED' | 'STATE_MUTATED';
  targetItem?: ItemId;
  targetRoom?: RoomId;
  pointsEarned?: number;
  playAudio?: 'triumph' | 'pickup' | 'fiddle' | 'dragon' | 'fanfare' | 'death';
}

export class KingsQuestParser {
  public parseCommand(
    rawInput: string,
    currentRoom: RoomId,
    inventory: ItemId[],
    roomItems: ItemId[],
    milestones: Record<string, boolean>
  ): ParseResult {
    const input = rawInput.trim().toLowerCase();
    if (!input) {
      return {
        success: false,
        message: {
          en: 'Please type a command, e.g. "LOOK", "TAKE CARROT", "CLIMB TREE", or "HELP".',
          nl: 'Typ een commando, bijv. "KIJK", "PAK WORTEL", "KLIM IN BOOM", of "HELP".'
        }
      };
    }

    // 1. GNOME NAME RIDDLE CHECK
    if (
      currentRoom === 'GNOME_FIELD' &&
      (input === 'ifnkovhgrogh' || input.includes('ifnkovhgrogh') || input === 'nikstlitsmpel' || input === 'rumpelstiltskin')
    ) {
      if (!milestones['GNOME_SOLVED']) {
        milestones['GNOME_SOLVED'] = true;
        return {
          success: true,
          action: 'ITEM_TAKEN',
          targetItem: 'MAGIC_BEANS',
          pointsEarned: 5,
          playAudio: 'triumph',
          message: {
            en: 'The gnome stares in astonished disbelief! "Curse you, clever knight! How did you decipher my name IFNKOVHGROGH?!" He tosses three glowing MAGIC BEANS to your feet!',
            nl: 'De kabouter staart je verbijsterd aan! "Vervloekt, slimme ridder! Hoe heb je mijn naam IFNKOVHGROGH ontcijferd?!" Hij gooit drie glinsterende MAGISCHE BONEN naar je voeten!'
          }
        };
      } else {
        return {
          success: true,
          message: {
            en: 'The gnome has already given you the magic beans and vanished into the brush.',
            nl: 'De kabouter heeft je de magische bonen al gegeven en is in het struikgewas verdwenen.'
          }
        };
      }
    }

    // 2. SHORTCUTS & SYSTEM COMMANDS
    if (input === 'i' || input === 'inventory' || input === 'inventaris') {
      if (inventory.length === 0) {
        return {
          success: true,
          message: {
            en: 'You are empty-handed. Explore the Kingdom of Daventry to find useful items!',
            nl: 'Je hebt nog niets in je buidel. Verken het koninkrijk Daventry om spullen te vinden!'
          }
        };
      }
      const names = inventory.map((id) => INVENTORY_REGISTRY[id]?.name || id).join(', ');
      const namesNl = inventory.map((id) => INVENTORY_REGISTRY[id]?.nameNl || id).join(', ');
      return {
        success: true,
        message: {
          en: `You are carrying: ${names}.`,
          nl: `Je draagt bij je: ${namesNl}.`
        }
      };
    }

    if (input === 'help' || input === 'hulp' || input === '?') {
      return {
        success: true,
        message: {
          en: 'King’s Quest commands: LOOK [object], TAKE [object], OPEN [object], TALK [character], GIVE [item], USE [item], CLIMB, EAT, PUSH, or type riddles.',
          nl: 'King’s Quest commando’s: KIJK [object], PAK [object], OPEN [object], PRAAT [persoon], GEEF [item], GEBRUIK [item], KLIM, EET, DUW, of typ raadsels.'
        }
      };
    }

    // 3. LOOK / EXAMINE COMMANDS
    if (input === 'look' || input === 'l' || input === 'kijk' || input === 'look around' || input === 'kijk rond') {
      return {
        success: true,
        message: {
          en: 'You gaze carefully around your surroundings.',
          nl: 'Je kijkt aandachtig rond in de omgeving.'
        }
      };
    }

    if (input.startsWith('look ') || input.startsWith('examine ') || input.startsWith('kijk ') || input.startsWith('bekijk ')) {
      const obj = input.replace(/^(look at|look|examine|inspect|kijk naar|kijk|bekijk|onderzoek)\s+/, '').trim();
      return this.handleLook(obj, currentRoom, inventory, roomItems, milestones);
    }

    // 4. TAKE / GET / PICK COMMANDS
    if (input.startsWith('take ') || input.startsWith('get ') || input.startsWith('pick ') || input.startsWith('pak ') || input.startsWith('neem ') || input.startsWith('raap ')) {
      const obj = input.replace(/^(take|get|pick up|pick|grab|pak|neem|raap op|raap)\s+/, '').trim();
      return this.handleTake(obj, currentRoom, inventory, roomItems, milestones);
    }

    // 5. OPEN / CRACK COMMANDS
    if (input.startsWith('open ') || input.startsWith('crack ') || input.startsWith('break ') || input.startsWith('breek ') || input.startsWith('open ')) {
      const obj = input.replace(/^(open|crack|break|kraak|breek)\s+/, '').trim();
      if (obj.includes('walnut') || obj.includes('noot') || obj.includes('walnoot')) {
        if (inventory.includes('WALNUT')) {
          return {
            success: true,
            action: 'ITEM_USED',
            targetItem: 'GOLD_WALNUT',
            pointsEarned: 6,
            playAudio: 'triumph',
            message: {
              en: 'You crack open the walnut shell with your dagger! Inside gleams a solid chunk of pure GOLD WALNUT meat! (+6 points)',
              nl: 'Je kraakt de walnoot open met je dolk! Binnenin schittert een massieve brok zuiver GOUD! (+6 punten)'
            }
          };
        }
        return {
          success: false,
          message: {
            en: 'You do not have a walnut in your inventory.',
            nl: 'Je hebt geen walnoot in je bezit.'
          }
        };
      }
    }

    // 6. CLIMB COMMANDS
    if (input.startsWith('climb') || input.startsWith('klim')) {
      if (currentRoom === 'GREAT_OAK') {
        if (!milestones['CLIMBED_TREE']) {
          milestones['CLIMBED_TREE'] = true;
          return {
            success: true,
            pointsEarned: 2,
            playAudio: 'pickup',
            message: {
              en: 'You climb the sturdy oak branches! High in the leaves you spot a bird’s nest with a gleaming GOLDEN EGG and an ENGRAVED DAGGER!',
              nl: 'Je klimt in de stevige eikentakken! Hoog in het bladerdak ontdek je een vogelnest met een GOUDEN EI en een GRAVEERDE DOLK!'
            }
          };
        }
        return {
          success: true,
          message: {
            en: 'You are already familiar with the upper branches of the oak tree.',
            nl: 'Je kent de bovenste takken van de eik inmiddels al.'
          }
        };
      }

      if (currentRoom === 'FERTILE_GROUND') {
        if (milestones['BEANSTALK_GROWN']) {
          return {
            success: true,
            action: 'ROOM_CHANGED',
            targetRoom: 'SKY_CLOUDS',
            playAudio: 'fanfare',
            message: {
              en: 'You grasp the thick twisting beanstalk and climb up, up through the azure heavens, stepping out onto the cloud kingdom!',
              nl: 'Je grijpt de reusachtige kronkelende bonenstaak en klimt hoog de hemel in, tot je voet zet op het majestueuze wolkenrijk!'
            }
          };
        }
        return {
          success: false,
          message: {
            en: 'There is nothing here tall enough to climb. Perhaps if magic plants grew here...',
            nl: 'Er staat hier niets hoogs om te beklimmen. Tenzij er magische planten zouden groeien...'
          }
        };
      }

      if (currentRoom === 'WISHING_WELL') {
        return {
          success: true,
          action: 'ROOM_CHANGED',
          targetRoom: 'DRAGON_CAVE',
          playAudio: 'dragon',
          message: {
            en: 'You lower yourself down the mossy well rope into the cool subterranean river below, swimming into the deep dragon caverns!',
            nl: 'Je laat je langs het touw van de put zakken in de ondergrondse rivier en zwemt naar de diepe grotten van de draak!'
          }
        };
      }
    }

    // 7. PLANT BEANS
    if (input.includes('plant bean') || input.includes('plant bonen') || input.includes('plant magische bonen')) {
      if (currentRoom === 'FERTILE_GROUND') {
        if (inventory.includes('MAGIC_BEANS')) {
          milestones['BEANSTALK_GROWN'] = true;
          return {
            success: true,
            action: 'ITEM_USED',
            targetItem: 'MAGIC_BEANS',
            pointsEarned: 4,
            playAudio: 'triumph',
            message: {
              en: 'You plant the glowing magic beans into the rich loam! Instantly, the earth trembles as a colossal beanstalk shoots hundreds of feet up into the clouds! (+4 points)',
              nl: 'Je plant de magische bonen in de vruchtbare aarde! Direct beeft de grond en schiet een reusachtige bonenstaak honderden meters omhoog de wolken in! (+4 punten)'
            }
          };
        }
        return {
          success: false,
          message: {
            en: 'You do not have any magic beans to plant.',
            nl: 'Je hebt geen magische bonen om te planten.'
          }
        };
      }
      return {
        success: false,
        message: {
          en: 'The soil here is too rocky or infertile to sprout magic beans. Look for a fertile plot.',
          nl: 'De bodem is hier te stenig. Zoek een vruchtbaar plantbed.'
        }
      };
    }

    // 8. TALK / CONVERSE
    if (input.startsWith('talk') || input.startsWith('speak') || input.startsWith('praat') || input.startsWith('spreek')) {
      if (currentRoom === 'GNOME_FIELD') {
        return {
          success: true,
          message: {
            en: 'The gnome chuckles mischievously: "If you wish my magical beans, you must divine my true name! Remember how the alphabet mirrors..."',
            nl: 'De kabouter giechelt: "Als je mijn bonen wilt, moet je mijn ware naam raden! Denk aan hoe het alfabet spiegelt..."'
          }
        };
      }
      if (currentRoom === 'CASTLE_GATES') {
        return {
          success: true,
          message: {
            en: 'The guard salutes: "Greetings, Sir Graham! King Edward waits in the throne room for the return of the three lost treasures!"',
            nl: 'De wachter salueert: "Gegroet, Sir Graham! Koning Edward wacht in de troonzaal op de terugkeer van de drie verloren schatten!"'
          }
        };
      }
      if (currentRoom === 'THRONE_ROOM') {
        return this.handleKingEdwardInteraction(inventory);
      }
      return {
        success: true,
        message: {
          en: 'There is no one here inclined to converse with you.',
          nl: 'Er is hier niemand die met je wil praten.'
        }
      };
    }

    // 9. FEED / GIVE GOAT CARROT & TROLL INTERACTION
    if (input.includes('give carrot') || input.includes('feed goat') || input.includes('geef wortel') || input.includes('voer geit')) {
      if (currentRoom === 'GOAT_PEN' && inventory.includes('CARROT')) {
        milestones['GOAT_FOLLOWING'] = true;
        return {
          success: true,
          action: 'STATE_MUTATED',
          pointsEarned: 5,
          playAudio: 'pickup',
          message: {
            en: 'You feed the sweet carrot to the billy goat! Delighted, he lets out a cheerful "Baaaaah!" and begins following loyally at your side! (+5 points)',
            nl: 'Je voert de zoete wortel aan de bok! Blij hinnikt hij "Bèèèèh!" en huppelt trouw achter je aan! (+5 punten)'
          }
        };
      }
    }

    // Troll confrontation with goat
    if (currentRoom === 'TROLL_BRIDGE' && milestones['GOAT_FOLLOWING'] && !milestones['TROLL_DEFEATED']) {
      milestones['TROLL_DEFEATED'] = true;
      return {
        success: true,
        pointsEarned: 4,
        playAudio: 'triumph',
        message: {
          en: 'Seeing the menacing troll block the bridge, your loyal billy goat lowers his sturdy horns, charges forward, and BUTTS the troll headfirst into the rushing river! The bridge is now clear! (+4 points)',
          nl: 'Als de trouwe bok de dreigende trol ziet, zet hij zijn horens naar voren, neemt een sprint en BEUKT de trol pardoes de kolkende rivier in! De brug is vrij! (+4 punten)'
        }
      };
    }

    // 10. WITCH / OVEN
    if (currentRoom === 'GINGERBREAD_HOUSE') {
      if (input.includes('push witch') || input.includes('shove witch') || input.includes('duw heks')) {
        milestones['WITCH_DEFEATED'] = true;
        return {
          success: true,
          pointsEarned: 7,
          playAudio: 'triumph',
          message: {
            en: 'Sneaking behind the wicked witch while she stirs her pot, you give her a mighty push right into her own roaring brick oven and slam the iron door! (+7 points)',
            nl: 'Je sluipt achter de boze heks terwijl ze in haar pot roert, geeft haar een flinke zet haar eigen hete oven in en slaat de ijzeren deur dicht! (+7 punten)'
          }
        };
      }
    }

    // 11. PLAY FIDDLE / LEPRECHAUNS
    if (input.includes('play fiddle') || input.includes('speel viool')) {
      if (inventory.includes('FIDDLE') && currentRoom === 'LEPRECHAUN_HALL') {
        milestones['LEPRECHAUNS_DANCED'] = true;
        return {
          success: true,
          pointsEarned: 5,
          playAudio: 'fiddle',
          message: {
            en: 'You draw your bow across the strings of the enchanted fiddle, playing an upbeat Irish jig! Enchanted by the melody, all the leprechauns dance wildly and skip out of the cavern, leaving the Magic Chest unattended! (+5 points)',
            nl: 'Je strijkt over de betoverde viool en speelt een Ierse dans! Betoverd door de muziek beginnen alle kabouters uitzinnig te dansen en verdwijnen ze de grot uit, de Magische Schatkist achterlatend! (+5 punten)'
          }
        };
      }
    }

    // 12. DRAGON / WATER BUCKET / DAGGER
    if (currentRoom === 'DRAGON_CAVE') {
      if (input.includes('throw water') || input.includes('use water') || input.includes('gooi water') || input.includes('douse')) {
        if (inventory.includes('WATER_BUCKET') || inventory.includes('BUCKET')) {
          milestones['DRAGON_DEFEATED'] = true;
          return {
            success: true,
            action: 'ITEM_USED',
            targetItem: 'WATER_BUCKET',
            pointsEarned: 8,
            playAudio: 'triumph',
            message: {
              en: 'You dash the cold bucket of spring water directly into the roaring dragon’s snout! His fire snuffs out with a hiss of steam. Humiliated, the dragon slinks into the dark recesses, leaving the MAGIC MIRROR unguarded! (+8 points)',
              nl: 'Je gooit de emmer ijskoud bronwater recht in de snuit van de briesende draak! Zijn vuur dooft met een gesis van stoom. Beschaamd druipt de draak af en laat de MAGISCHE SPIEGEL onbewaakt achter! (+8 punten)'
            }
          };
        }
      }
    }

    // 13. GIANT / SLINGSHOT / SLEEP
    if (currentRoom === 'SKY_CLOUDS') {
      if (input.includes('shoot giant') || input.includes('use slingshot') || input.includes('schiet reus') || input.includes('katapult')) {
        if (inventory.includes('SLINGSHOT')) {
          milestones['GIANT_DEFEATED'] = true;
          return {
            success: true,
            pointsEarned: 7,
            playAudio: 'triumph',
            message: {
              en: 'You load a smooth river pebble into your leather slingshot, take steady aim, and loose the stone! It strikes the giant squarely between the eyes! He crashes to the cloud bank in deep slumber, dropping the MAGIC SHIELD! (+7 points)',
              nl: 'Je laadt een glad kiezelsteentje in je leren katapult, mikt en schiet! De steen raakt de reus precies tussen zijn ogen. Met een dreun valt hij in diepe slaap en laat het MAGISCHE SCHILD vallen! (+7 punten)'
            }
          };
        }
      }
    }

    // 14. EAT MUSHROOM
    if (input.includes('eat mushroom') || input.includes('eet paddenstoel')) {
      if (inventory.includes('MAGIC_MUSHROOM')) {
        return {
          success: true,
          action: 'ROOM_CHANGED',
          targetRoom: 'CASTLE_GARDEN',
          pointsEarned: 3,
          playAudio: 'pickup',
          message: {
            en: 'You nibble the magic mushroom! You shrink to mouse size, scamper through the narrow cavern crack, and emerge into the warm sunlit castle garden as you return to normal stature! (+3 points)',
            nl: 'Je proeft van de magische paddenstoel! Je krimpt tot muizenformaat, glipt door een spleet in de rotsen en komt weer op ware grootte tevoorschijn in de zonnige kasteeltuin! (+3 punten)'
          }
        };
      }
    }

    // Generic fallback response
    return {
      success: false,
      message: {
        en: `You cannot "${rawInput}" here right now. Try looking around or examining specific objects.`,
        nl: `Je kunt "${rawInput}" hier nu niet doen. Probeer rond te kijken of specifieke voorwerpen te bekijken.`
      }
    };
  }

  private handleLook(
    obj: string,
    room: RoomId,
    inventory: ItemId[],
    roomItems: ItemId[],
    milestones: Record<string, boolean>
  ): ParseResult {
    if (obj.includes('tree') || obj.includes('boom')) {
      if (room === 'GREAT_OAK') {
        return {
          success: true,
          message: {
            en: 'The great oak has thick limbs. High up in the branches you can see a large nest. You could CLIMB the tree.',
            nl: 'De grote eik heeft dikke takken. Hoog in de kruin zie je een groot nest. Je zou in de boom kunnen KLIMMEN.'
          }
        };
      }
      if (room === 'WALNUT_TREE') {
        return {
          success: true,
          message: {
            en: 'The walnut tree has dropped several ripe walnuts upon the soft grass. You can TAKE WALNUT.',
            nl: 'De walnootboom heeft rijpe walnoten laten vallen in het gras. Je kunt de WALNOOT PAKKEN.'
          }
        };
      }
    }

    if (obj.includes('well') || obj.includes('put') || obj.includes('wensput')) {
      return {
        success: true,
        message: {
          en: 'A stone well with cool water below. A rope and bucket hang from the crossbeam. You can TAKE BUCKET or CLIMB DOWN.',
          nl: 'Een stenen put met koud water beneden. Een touw met emmer hangt eraan. Je kunt de EMMER PAKKEN of OMLAAG KLIMMEN.'
        }
      };
    }

    if (obj.includes('dragon') || obj.includes('draak')) {
      return {
        success: true,
        message: {
          en: 'A massive red scaly dragon coiled over the gleaming Magic Mirror. Smoke curls from his nostrils!',
          nl: 'Een reusachtige rode geschubde draak, gekruld om de glinsterende Magische Spiegel. Rook kringelt uit zijn neusgaten!'
        }
      };
    }

    if (obj.includes('mirror') || obj.includes('spiegel')) {
      return {
        success: true,
        message: {
          en: 'The Magic Mirror of Daventry! Gazing into its crystal surface reveals glimpses of future kingdoms and glory.',
          nl: 'De Magische Spiegel van Daventry! In het kristallen oppervlak zie je flitsen van toekomstige koninkrijken en glorie.'
        }
      };
    }

    if (obj.includes('shield') || obj.includes('schild')) {
      return {
        success: true,
        message: {
          en: 'The Magic Shield of Daventry, forged of diamond steel. It grants the bearer invulnerability against monsters.',
          nl: 'Het Magische Schild van Daventry, gesmeed van diamanten staal. Beschermt tegen alle monsterlijke gevaren.'
        }
      };
    }

    if (obj.includes('chest') || obj.includes('kist')) {
      return {
        success: true,
        message: {
          en: 'The Magic Chest of Daventry, brimming with an eternal supply of gleaming gold coins.',
          nl: 'De Magische Schatkist van Daventry, altijd gevuld met een oneindige voorraad blinkende gouden munten.'
        }
      };
    }

    return {
      success: true,
      message: {
        en: `You examine the ${obj} closely, but observe nothing extraordinary.`,
        nl: `Je bekijkt de ${obj} aandachtig, maar ziet niets bijzonders.`
      }
    };
  }

  private handleTake(
    obj: string,
    room: RoomId,
    inventory: ItemId[],
    roomItems: ItemId[],
    milestones: Record<string, boolean>
  ): ParseResult {
    // Carrot
    if (obj.includes('carrot') || obj.includes('wortel')) {
      if (room === 'CASTLE_GARDEN' && roomItems.includes('CARROT')) {
        return {
          success: true,
          action: 'ITEM_TAKEN',
          targetItem: 'CARROT',
          pointsEarned: 2,
          playAudio: 'pickup',
          message: {
            en: 'You pluck a fresh, crisp orange carrot from the fertile earth. (+2 points)',
            nl: 'Je trekt een verse, knapperige oranje wortel uit de aarde. (+2 punten)'
          }
        };
      }
    }

    // Clover
    if (obj.includes('clover') || obj.includes('klaver')) {
      if (room === 'CLOVER_PATCH' && roomItems.includes('FOUR_LEAF_CLOVER')) {
        return {
          success: true,
          action: 'ITEM_TAKEN',
          targetItem: 'FOUR_LEAF_CLOVER',
          pointsEarned: 2,
          playAudio: 'pickup',
          message: {
            en: 'You carefully pick the rare four-leaf clover. You feel a gentle aura of good fortune! (+2 points)',
            nl: 'Je plukt het zeldzame klavertje vier. Je voelt een warme gloed van geluk over je neerdalen! (+2 punten)'
          }
        };
      }
    }

    // Walnut
    if (obj.includes('walnut') || obj.includes('noot') || obj.includes('walnoot')) {
      if (room === 'WALNUT_TREE' && roomItems.includes('WALNUT')) {
        return {
          success: true,
          action: 'ITEM_TAKEN',
          targetItem: 'WALNUT',
          pointsEarned: 3,
          playAudio: 'pickup',
          message: {
            en: 'You pick up a heavy, plump walnut from beneath the branches. (+3 points)',
            nl: 'Je raapt een zware, gave walnoot op onder de takken. (+3 punten)'
          }
        };
      }
    }

    // Golden Egg
    if (obj.includes('egg') || obj.includes('ei') || obj.includes('gouden ei')) {
      if (room === 'GREAT_OAK' && roomItems.includes('GOLDEN_EGG')) {
        return {
          success: true,
          action: 'ITEM_TAKEN',
          targetItem: 'GOLDEN_EGG',
          pointsEarned: 6,
          playAudio: 'triumph',
          message: {
            en: 'You reach into the nest and retrieve the gleaming solid GOLDEN EGG! (+6 points)',
            nl: 'Je grijpt in het nest en pakt het schitterende massieve GOUDEN EI! (+6 punten)'
          }
        };
      }
    }

    // Dagger
    if (obj.includes('dagger') || obj.includes('dolk')) {
      if (room === 'GREAT_OAK' && roomItems.includes('DAGGER')) {
        return {
          success: true,
          action: 'ITEM_TAKEN',
          targetItem: 'DAGGER',
          pointsEarned: 5,
          playAudio: 'pickup',
          message: {
            en: 'You pull a fine engraved hunting dagger from the hollow knot in the tree. (+5 points)',
            nl: 'Je trekt een fraaie gegraveerde jachtdolk uit een knoest van de boom. (+5 punten)'
          }
        };
      }
    }

    // Bucket
    if (obj.includes('bucket') || obj.includes('emmer')) {
      if (room === 'WISHING_WELL' && roomItems.includes('BUCKET')) {
        return {
          success: true,
          action: 'ITEM_TAKEN',
          targetItem: 'WATER_BUCKET',
          pointsEarned: 2,
          playAudio: 'pickup',
          message: {
            en: 'You unhook the wooden bucket, full of cool well water, and take it with you. (+2 points)',
            nl: 'Je haakt de houten emmer vol fris bronwater los en neemt hem mee. (+2 punten)'
          }
        };
      }
    }

    // Slingshot
    if (obj.includes('slingshot') || obj.includes('katapult')) {
      if (room === 'GOAT_PEN' && roomItems.includes('SLINGSHOT')) {
        return {
          success: true,
          action: 'ITEM_TAKEN',
          targetItem: 'SLINGSHOT',
          pointsEarned: 4,
          playAudio: 'pickup',
          message: {
            en: 'You find a leather slingshot hanging on the paddock post. (+4 points)',
            nl: 'Je vindt een leren katapult aan de omheiningspaal. (+4 punten)'
          }
        };
      }
    }

    // Cheese
    if (obj.includes('cheese') || obj.includes('kaas')) {
      if (room === 'GINGERBREAD_HOUSE' && roomItems.includes('CHEESE')) {
        return {
          success: true,
          action: 'ITEM_TAKEN',
          targetItem: 'CHEESE',
          pointsEarned: 2,
          playAudio: 'pickup',
          message: {
            en: 'You snatch a wedge of aromatic Swiss cheese from the gingerbread pantry shelf! (+2 points)',
            nl: 'Je pakt een punt Zwitserse kaas van het provisierek in het peperkoekhuisje! (+2 punten)'
          }
        };
      }
    }

    // Magic Mirror (Treasure #1)
    if (obj.includes('mirror') || obj.includes('spiegel')) {
      if (room === 'DRAGON_CAVE') {
        if (milestones['DRAGON_DEFEATED']) {
          return {
            success: true,
            action: 'ITEM_TAKEN',
            targetItem: 'MAGIC_MIRROR',
            pointsEarned: 25,
            playAudio: 'triumph',
            message: {
              en: 'TREASURE RECOVERED! You lift the legendary MAGIC MIRROR of Daventry into your arms! (+25 points)',
              nl: 'SCHAT HERWONNEN! Je heft de legendarische MAGISCHE SPIEGEL van Daventry in je armen! (+25 punten)'
            }
          };
        }
        return {
          success: false,
          playAudio: 'dragon',
          message: {
            en: 'The furious red dragon fiercely blocks your path with gusts of fiery breath! You must deal with the dragon first.',
            nl: 'De woeste rode draak verspert je pad met vlagen vuur! Je moet de draak eerst uitschakelen.'
          }
        };
      }
    }

    // Magic Shield (Treasure #2)
    if (obj.includes('shield') || obj.includes('schild')) {
      if (room === 'SKY_CLOUDS') {
        if (milestones['GIANT_DEFEATED']) {
          return {
            success: true,
            action: 'ITEM_TAKEN',
            targetItem: 'MAGIC_SHIELD',
            pointsEarned: 25,
            playAudio: 'triumph',
            message: {
              en: 'TREASURE RECOVERED! You lift the invincible MAGIC SHIELD of Daventry from the cloud mists! (+25 points)',
              nl: 'SCHAT HERWONNEN! Je heft het onoverwinnelijke MAGISCHE SCHILD van Daventry uit de wolkenmist! (+25 punten)'
            }
          };
        }
        return {
          success: false,
          message: {
            en: 'The stomping giant clutches the shield firmly in his giant fist. You need to put him to sleep first!',
            nl: 'De stampende reus houdt het schild stevig vast. Je moet hem eerst laten slapen!'
          }
        };
      }
    }

    // Magic Chest (Treasure #3)
    if (obj.includes('chest') || obj.includes('kist') || obj.includes('schatkist')) {
      if (room === 'LEPRECHAUN_HALL') {
        if (milestones['LEPRECHAUNS_DANCED']) {
          return {
            success: true,
            action: 'ITEM_TAKEN',
            targetItem: 'MAGIC_CHEST',
            pointsEarned: 25,
            playAudio: 'triumph',
            message: {
              en: 'TREASURE RECOVERED! You lift the ornate MAGIC CHEST of endless gold coins! (+25 points)',
              nl: 'SCHAT HERWONNEN! Je pakt de sierlijke MAGISCHE SCHATKIST met oneindig goud! (+25 punten)'
            }
          };
        }
        return {
          success: false,
          message: {
            en: 'The leprechauns guard the chest tightly. Perhaps lively music like an enchanted fiddle could distract them?',
            nl: 'De kobolden bewaken de kist. Misschien kan opwekkende vioolmuziek hen afleiden?'
          }
        };
      }
    }

    // Fiddle & Mushroom in Leprechaun Hall
    if ((obj.includes('fiddle') || obj.includes('viool')) && room === 'LEPRECHAUN_HALL' && roomItems.includes('FIDDLE')) {
      return {
        success: true,
        action: 'ITEM_TAKEN',
        targetItem: 'FIDDLE',
        pointsEarned: 3,
        playAudio: 'pickup',
        message: {
          en: 'You pick up the enchanted wooden fiddle resting against the cavern wall. (+3 points)',
          nl: 'Je raapt de betoverde houten viool op die tegen de rotswand rust. (+3 punten)'
        }
      };
    }

    if ((obj.includes('mushroom') || obj.includes('paddenstoel')) && room === 'LEPRECHAUN_HALL' && roomItems.includes('MAGIC_MUSHROOM')) {
      return {
        success: true,
        action: 'ITEM_TAKEN',
        targetItem: 'MAGIC_MUSHROOM',
        pointsEarned: 2,
        playAudio: 'pickup',
        message: {
          en: 'You pluck a glowing purple magic mushroom from the cavern floor. (+2 points)',
          nl: 'Je plukt een paarse magische paddenstoel van de grotbodem. (+2 punten)'
        }
      };
    }

    return {
      success: false,
      message: {
        en: `There is no "${obj}" here that you can take.`,
        nl: `Er is hier geen "${obj}" die je kunt meenemen.`
      }
    };
  }

  private handleKingEdwardInteraction(inventory: ItemId[]): ParseResult {
    const hasMirror = inventory.includes('MAGIC_MIRROR');
    const hasShield = inventory.includes('MAGIC_SHIELD');
    const hasChest = inventory.includes('MAGIC_CHEST');

    if (hasMirror && hasShield && hasChest) {
      return {
        success: true,
        action: 'VICTORY',
        pointsEarned: 50,
        playAudio: 'fanfare',
        message: {
          en: 'VICTORY! Sir Graham presents the Magic Mirror, the Magic Shield, and the Magic Chest before the throne! King Edward weeps tears of joy: "You have restored the glory of Daventry!" With his dying breath, he places the royal golden crown upon Graham’s head. HAIL KING GRAHAM!',
          nl: 'OVERWINNING! Sir Graham presenteert de Magische Spiegel, het Magische Schild en de Magische Schatkist voor de troon! Koning Edward huilt van geluk: "Je hebt de glorie van Daventry hersteld!" Met zijn laatste adem plaatst hij de gouden kroon op Graham’s hoofd. LEVE KONING GRAHAM!'
        }
      };
    }

    const count = (hasMirror ? 1 : 0) + (hasShield ? 1 : 0) + (hasChest ? 1 : 0);
    return {
      success: true,
      message: {
        en: `King Edward smiles faintly: "You have retrieved ${count} of the 3 lost treasures, brave Sir Graham. Seek the remaining relics throughout Daventry!"`,
        nl: `Koning Edward glimlacht zwakjes: "Je hebt ${count} van de 3 verloren schatten herwonnen, dappere Sir Graham. Zoek de overige relikwieën in Daventry!"`
      }
    };
  }
}
