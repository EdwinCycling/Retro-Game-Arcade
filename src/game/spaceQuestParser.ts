/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Space Quest I: The Sarien Encounter (1986, Sierra On-Line)
 * Natural Language Sci-Fi Parser (English & Dutch)
 */

import { SQRoomId, SQItemId } from './spaceQuestTypes';
import { SQ_INVENTORY_REGISTRY } from './spaceQuestRooms';

export interface SQParseResult {
  success: boolean;
  message: { en: string; nl: string };
  action?: 'ITEM_TAKEN' | 'ITEM_USED' | 'ROOM_CHANGED' | 'VICTORY' | 'DEATH';
  targetItem?: SQItemId;
  targetRoom?: SQRoomId;
  pointsEarned?: number;
  playAudio?: 'laser' | 'klaxon' | 'thruster' | 'pickup' | 'fanfare';
}

export class SpaceQuestParser {
  public parseCommand(
    rawInput: string,
    currentRoom: SQRoomId,
    inventory: SQItemId[],
    roomItems: SQItemId[],
    milestones: Record<string, boolean>
  ): SQParseResult {
    const input = rawInput.trim().toLowerCase();
    if (!input) {
      return {
        success: false,
        message: {
          en: 'Please type a command (e.g., "LOOK", "TAKE KEYCARD", "ENTER POD", "HELP").',
          nl: 'Typ een commando (bijv. "KIJK", "PAK PAS", "STAP IN CAPSULE", "HELP").'
        }
      };
    }

    // 1. INVENTORY & SHORTCUTS
    if (input === 'i' || input === 'inventory' || input === 'inventaris' || input === 'buidel') {
      if (inventory.length === 0) {
        return {
          success: true,
          message: {
            en: 'Your pockets contain only lint and a crumpled StarCon memo.',
            nl: 'Je zakken bevatten slechts wat pluisjes en een verfrommelde memo van StarCon.'
          }
        };
      }
      const names = inventory.map((id) => SQ_INVENTORY_REGISTRY[id]?.name || id).join(', ');
      const namesNl = inventory.map((id) => SQ_INVENTORY_REGISTRY[id]?.nameNl || id).join(', ');
      return {
        success: true,
        message: {
          en: `Roger is carrying: ${names}.`,
          nl: `Roger draagt bij zich: ${namesNl}.`
        }
      };
    }

    if (input === 'help' || input === 'hulp' || input === '?') {
      return {
        success: true,
        message: {
          en: 'Commands: LOOK [object], TAKE [object], SEARCH [body], ENTER POD, PUSH BUTTON, USE [item], TALK, or DRIVE SKIMMER.',
          nl: 'Commando’s: KIJK [object], PAK [object], DOORZOEK [lichaam], STAP IN CAPSULE, DRUK OP KNOP, GEBRUIK [item], of BESTUUR SKIMMER.'
        }
      };
    }

    // 2. LOOK / EXAMINE
    if (input === 'look' || input === 'l' || input === 'kijk' || input === 'look around' || input === 'kijk rond') {
      return {
        success: true,
        message: {
          en: 'You cast a weary janitorial eye around your surroundings.',
          nl: 'Je kijkt met een vermoeide conciërgeblik rond in de omgeving.'
        }
      };
    }

    // 3. SEARCH JERRY / CREWMAN
    if (
      input.includes('search') ||
      input.includes('doorzoek') ||
      input.includes('onderzoek lijk') ||
      input.includes('search body') ||
      input.includes('search jerry')
    ) {
      if (currentRoom === 'STARBOARD_HALL' && roomItems.includes('KEYCARD')) {
        return {
          success: true,
          action: 'ITEM_TAKEN',
          targetItem: 'KEYCARD',
          pointsEarned: 5,
          playAudio: 'pickup',
          message: {
            en: 'Searching poor Jerry’s pockets, you find his magnetic security keycard! (+5 points)',
            nl: 'Terwijl je de zakken van arme Jerry doorzoekt, vind je zijn magnetische pas! (+5 punten)'
          }
        };
      }
    }

    // 4. TAKE COMMANDS
    if (input.startsWith('take ') || input.startsWith('get ') || input.startsWith('pak ') || input.startsWith('neem ')) {
      const obj = input.replace(/^(take|get|grab|pick up|pak|neem)\s+/, '').trim();

      // Broom
      if (obj.includes('broom') || obj.includes('bezem')) {
        if (currentRoom === 'JANITOR_CLOSET' && roomItems.includes('BROOM')) {
          return {
            success: true,
            action: 'ITEM_TAKEN',
            targetItem: 'BROOM',
            pointsEarned: 2,
            playAudio: 'pickup',
            message: {
              en: 'You take your trusty custodial broom. Never leave home without it! (+2 points)',
              nl: 'Je pakt je trouwe conciërgebezem. Ga nooit op pad zonder! (+2 punten)'
            }
          };
        }
      }

      // Keycard
      if (obj.includes('keycard') || obj.includes('card') || obj.includes('pas') || obj.includes('kaart')) {
        if (currentRoom === 'STARBOARD_HALL' && roomItems.includes('KEYCARD')) {
          return {
            success: true,
            action: 'ITEM_TAKEN',
            targetItem: 'KEYCARD',
            pointsEarned: 5,
            playAudio: 'pickup',
            message: {
              en: 'You slide the magnetic keycard into your uniform pocket. (+5 points)',
              nl: 'Je stopt de magnetische sleutelkaart in je borstzak. (+5 punten)'
            }
          };
        }
      }

      // Cartridge
      if (obj.includes('cartridge') || obj.includes('cassette') || obj.includes('crystal') || obj.includes('data')) {
        if (currentRoom === 'DATA_ARCHIVE' && roomItems.includes('CARTRIDGE')) {
          return {
            success: true,
            action: 'ITEM_TAKEN',
            targetItem: 'CARTRIDGE',
            pointsEarned: 15,
            playAudio: 'pickup',
            message: {
              en: 'You eject the glowing Star Generator data cartridge from the console and pocket it securely! (+15 points)',
              nl: 'Je werpt de gloeiende Sterrengenerator datacassette uit de computer en bergt hem veilig op! (+15 punten)'
            }
          };
        }
      }

      // Survival Kit
      if (obj.includes('kit') || obj.includes('survival') || obj.includes('overlevingspakket')) {
        if (currentRoom === 'ESCAPE_POD_BAY' && roomItems.includes('SURVIVAL_KIT')) {
          return {
            success: true,
            action: 'ITEM_TAKEN',
            targetItem: 'SURVIVAL_KIT',
            pointsEarned: 8,
            playAudio: 'pickup',
            message: {
              en: 'You grab the emergency survival canister from the pod rack. (+8 points)',
              nl: 'Je grijpt het noodoverlevingspakket uit het rek van de capsule. (+8 punten)'
            }
          };
        }
      }

      // Glass Shard
      if (obj.includes('glass') || obj.includes('shard') || obj.includes('glas') || obj.includes('scherf')) {
        if (currentRoom === 'KERONA_CRASH' && roomItems.includes('GLASS_SHARD')) {
          return {
            success: true,
            action: 'ITEM_TAKEN',
            targetItem: 'GLASS_SHARD',
            pointsEarned: 5,
            playAudio: 'pickup',
            message: {
              en: 'You pick up a curved, mirror-coated laser reflection shard from the crushed cockpit. (+5 points)',
              nl: 'Je raapt een gebogen scherf spiegelend laserglas op bij de gecrashte cockpit. (+5 punten)'
            }
          };
        }
      }

      // Dehydrated Water
      if (obj.includes('water') || obj.includes('pill') || obj.includes('tablet')) {
        if (currentRoom === 'KERONA_CRASH' && roomItems.includes('DEHYDRATED_WATER')) {
          return {
            success: true,
            action: 'ITEM_TAKEN',
            targetItem: 'DEHYDRATED_WATER',
            pointsEarned: 5,
            playAudio: 'pickup',
            message: {
              en: 'You pocket the dehydrated water canister. "Just add water to enjoy!" (+5 points)',
              nl: 'Je stopt het gedroogde water in je zak. "Voeg water toe om te drinken!" (+5 punten)'
            }
          };
        }
      }

      // Gadget / Translator
      if (obj.includes('gadget') || obj.includes('translator') || obj.includes('vertaal') || obj.includes('widget')) {
        if (currentRoom === 'UNDERGROUND_LAB' && roomItems.includes('GADGET')) {
          return {
            success: true,
            action: 'ITEM_TAKEN',
            targetItem: 'GADGET',
            pointsEarned: 10,
            playAudio: 'pickup',
            message: {
              en: 'The Keronian holographic elder presents you with the Universal Translator Gadget! (+10 points)',
              nl: 'Het Keronische hologram overhandigt je de Universele Vertaal-Widget! (+10 punten)'
            }
          };
        }
      }

      // Pulser Pistol
      if (obj.includes('pistol') || obj.includes('gun') || obj.includes('pistool') || obj.includes('wapen')) {
        if (currentRoom === 'ORAT_CAVERN' && roomItems.includes('PULSER_PISTOL')) {
          return {
            success: true,
            action: 'ITEM_TAKEN',
            targetItem: 'PULSER_PISTOL',
            pointsEarned: 15,
            playAudio: 'pickup',
            message: {
              en: 'You pick up the fallen Sarien military pulser pistol from the slime! (+15 points)',
              nl: 'Je raapt het gevallen Sarien pulser-pistool op uit het slijm! (+15 punten)'
            }
          };
        }
      }
    }

    // 5. ENTER ESCAPE POD / PUSH BUTTON / LAUNCH
    if (
      input.includes('enter pod') ||
      input.includes('stap in capsule') ||
      input.includes('launch') ||
      input.includes('push button') ||
      input.includes('druk op knop') ||
      input.includes('lanceer')
    ) {
      if (currentRoom === 'ESCAPE_POD_BAY') {
        if (!inventory.includes('CARTRIDGE')) {
          return {
            success: false,
            message: {
              en: 'Wait! You can’t leave without the Star Generator Data Cartridge from the Data Archive!',
              nl: 'Wacht! Je kunt niet vertrekken zonder de Sterrengenerator cassette uit het Data-Archief!'
            }
          };
        }
        milestones['POD_LAUNCHED'] = true;
        return {
          success: true,
          action: 'ROOM_CHANGED',
          targetRoom: 'KERONA_CRASH',
          pointsEarned: 25,
          playAudio: 'thruster',
          message: {
            en: 'You strap into the pilot seat and SLAM the flashing red LAUNCH button! The thrusters roar to life as you rocket into hyperspace. The Arcada explodes into stardust behind you! After a fiery atmospheric entry, you crash onto planet Kerona! (+25 points)',
            nl: 'Je gespt je vast in de stoel en RAMT op de rode LANCEER-knop! De motoren brullen en je schiet de ruimte in. De Arcada verpulvert achter je tot sterrenstof! Na een vurige duikvlucht crash je op planeet Kerona! (+25 punten)'
          }
        };
      }
    }

    // 6. DEFEAT ORAT (USE GLASS / SHOOT)
    if (
      input.includes('use glass') ||
      input.includes('gebruik glas') ||
      input.includes('shoot orat') ||
      input.includes('schiet orat') ||
      input.includes('kill orat')
    ) {
      if (currentRoom === 'ORAT_CAVERN') {
        if (inventory.includes('GLASS_SHARD')) {
          milestones['ORAT_DEFEATED'] = true;
          return {
            success: true,
            action: 'ITEM_USED',
            targetItem: 'GLASS_SHARD',
            pointsEarned: 20,
            playAudio: 'laser',
            message: {
              en: 'As the monstrous Orat lunges with mouth agape, you hold up the curved glass shard! His blinding heat beam reflects right back into his gullet, detonating him into a thousand gooey chunks! A PULSER PISTOL lands at your feet! (+20 points)',
              nl: 'Terwijl het monsterlijke Orat brullend op je afduikt, houd je de spiegelende glasscherf omhoog! Zijn eigen hitte-laser ketst recht zijn keel in en laat hem in duizend stukken ontploffen! Een PULSER PISTOOL belandt voor je voeten! (+20 punten)'
            }
          };
        }
      }
    }

    // 7. DRIVE SAND SKIMMER / VICTORY
    if (
      input.includes('drive skimmer') ||
      input.includes('enter skimmer') ||
      input.includes('stap in skimmer') ||
      input.includes('bestuur skimmer') ||
      input.includes('vlieg')
    ) {
      if (currentRoom === 'SKIMMER_LANDING') {
        return {
          success: true,
          action: 'VICTORY',
          pointsEarned: 50,
          playAudio: 'fanfare',
          message: {
            en: 'VICTORY! You jump into the pilot cockpit of the alien sand skimmer, fire up the repulsor turbines, and blast across the glistening Kerona desert toward the spaceport of Ulence Flats! You survived the destruction of the Arcada and saved the secrets of the Star Generator! CONGRATULATIONS, ROGER WILCO!',
            nl: 'OVERWINNING! Je springt in de cockpit van de buitenaardse sand-skimmer, ontsteekt de repulsor-turbines en scheurt over de glinsterende Kerona-woestijn richting de ruimtehaven Ulence Flats! Je hebt de ondergang van de Arcada overleefd en de geheimen van de Sterrengenerator gered! GEFELICITEERD, ROGER WILCO!'
          }
        };
      }
    }

    return {
      success: false,
      message: {
        en: `Roger Wilco scratches his chin. You cannot "${rawInput}" right now. Try LOOK, TAKE, or HELP.`,
        nl: `Roger Wilco krabt achter zijn oren. Je kunt "${rawInput}" hier nu niet doen. Probeer KIJK, PAK, of HELP.`
      }
    };
  }
}
