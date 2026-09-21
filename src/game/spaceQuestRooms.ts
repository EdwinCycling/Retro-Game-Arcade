/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Space Quest I: The Sarien Encounter (1986, Sierra On-Line)
 * Room & Inventory Definitions
 */

import { SQRoomId, SQItemId, SQInventoryItem, SQRoomDefinition } from './spaceQuestTypes';

export const SQ_INVENTORY_REGISTRY: Record<SQItemId, SQInventoryItem> = {
  BROOM: {
    id: 'BROOM',
    name: 'Janitor Broom',
    nameNl: 'Conciërge Bezem',
    description: 'A standard-issue Xenon Federation custodial push-broom with worn synthetic bristles.',
    descriptionNl: 'Een standaard bezem van de Xenon Federatie met versleten synthetische haren.',
    icon: '🧹',
    points: 2
  },
  KEYCARD: {
    id: 'KEYCARD',
    name: 'Magnetic Keycard',
    nameNl: 'Magnetische Sleutelkaart',
    description: 'A glowing blue magnetic security keycard retrieved from fallen crewman Jerry.',
    descriptionNl: 'Een blauw oplichtende magnetische pas van de gevallen bemanningslid Jerry.',
    icon: '💳',
    points: 5
  },
  CARTRIDGE: {
    id: 'CARTRIDGE',
    name: 'Star Generator Cartridge',
    nameNl: 'Sterrengenerator Gegevenscassette',
    description: 'A high-density data crystal cartridge holding the top-secret plans to the Star Generator.',
    descriptionNl: 'Een kristalheldere datacassette met de blauwdrukken van de geheime Sterrengenerator.',
    icon: '💾',
    points: 15
  },
  GADGET: {
    id: 'GADGET',
    name: 'Universal Translator Gadget',
    nameNl: 'Universele Vertaal-Widget',
    description: 'An alien handheld translator capable of decoding ancient Keronian dialects.',
    descriptionNl: 'Een buitenaardse vertaalmodule die vreemde Keronische talen ontcijfert.',
    icon: '📟',
    points: 10
  },
  GLASS_SHARD: {
    id: 'GLASS_SHARD',
    name: 'Curved Glass Shard',
    nameNl: 'Scherf Spiegelglas',
    description: 'A razor-sharp shard of heat-resistant laser reflective glass from the pod canopy.',
    descriptionNl: 'Een vlijmscherpe scherf laser-weerkaatsend glas van de reddingscapsule.',
    icon: '🔍',
    points: 5
  },
  DEHYDRATED_WATER: {
    id: 'DEHYDRATED_WATER',
    name: 'Dehydrated Water Pill',
    nameNl: 'Gedehydrateerd Water Tablet',
    description: 'Insta-Quench dry water crystals. Just add water to hydrate!',
    descriptionNl: 'Gedroogde waterkristallen. Voeg gewoon water toe om te drinken!',
    icon: '💊',
    points: 5
  },
  SURVIVAL_KIT: {
    id: 'SURVIVAL_KIT',
    name: 'Escape Pod Survival Kit',
    nameNl: 'Overlevingspakket',
    description: 'Emergency ration canister equipped with medical gel and power cell.',
    descriptionNl: 'Noodrantsoen met medische gel en een reserve energiecel.',
    icon: '🧰',
    points: 8
  },
  PULSER_PISTOL: {
    id: 'PULSER_PISTOL',
    name: 'Sarien Pulser Pistol',
    nameNl: 'Sarien Pulser Pistool',
    description: 'A heavy military laser sidearm with high-intensity plasma charges.',
    descriptionNl: 'Een zwaar militair laserwapen met geconcentreerde plasmaladingen.',
    icon: '🔫',
    points: 15
  }
};

export const SQ_ROOMS_DATA: Record<SQRoomId, SQRoomDefinition> = {
  JANITOR_CLOSET: {
    id: 'JANITOR_CLOSET',
    title: {
      en: 'Starship Arcada: Custodial Broom Closet',
      nl: 'Ruimteschip Arcada: Conciërge Bezemkast'
    },
    description: {
      en: 'You wake up on the floor of the custodial broom closet after a well-deserved nap. The red emergency klaxon blares ominously outside!',
      nl: 'Je wordt wakker op de vloer van de bezemkast na een welverdiend dutje. Het rode noodalarm loeit onheilspellend door de gangen!'
    },
    east: 'STARBOARD_HALL',
    items: ['BROOM'],
    obstacles: [
      { x: 0, y: 0, width: 320, height: 60, type: 'solid' },
      { x: 0, y: 60, width: 30, height: 140, type: 'solid' }
    ],
    visited: false
  },

  STARBOARD_HALL: {
    id: 'STARBOARD_HALL',
    title: {
      en: 'Arcada Starboard Corridors',
      nl: 'Stuurboord Gang Ruimteschip Arcada'
    },
    description: {
      en: 'The hallway is bathed in crimson emergency strobes. Fallen scientist Jerry lies slumped near the bulkhead, clutching his keycard.',
      nl: 'De gang baadt in rode zwaailichten. Wetenschapper Jerry ligt levenloos bij de wand, zijn magnetische pas nog in de hand.'
    },
    west: 'JANITOR_CLOSET',
    north: 'DATA_ARCHIVE',
    east: 'ESCAPE_POD_BAY',
    items: ['KEYCARD'],
    obstacles: [
      { x: 0, y: 0, width: 120, height: 60, type: 'solid' },
      { x: 200, y: 0, width: 120, height: 60, type: 'solid' }
    ],
    visited: false
  },

  DATA_ARCHIVE: {
    id: 'DATA_ARCHIVE',
    title: {
      en: 'Star Generator Research Archive',
      nl: 'Onderzoeksarchief Sterrengenerator'
    },
    description: {
      en: 'Mainframe terminals glow with warning diagnostics. The top-secret Star Generator data cartridge rests inserted in the central console!',
      nl: 'Hoofdcomputerterminals knipperen met waarschuwingen. De geheime datacassette met blauwdrukken zit in de centrale console!'
    },
    south: 'STARBOARD_HALL',
    items: ['CARTRIDGE'],
    obstacles: [
      { x: 0, y: 0, width: 320, height: 50, type: 'solid' },
      { x: 120, y: 70, width: 80, height: 40, type: 'solid' }
    ],
    visited: false
  },

  ESCAPE_POD_BAY: {
    id: 'ESCAPE_POD_BAY',
    title: {
      en: 'Aft Airlock & Escape Pod Bay',
      nl: 'Achterste Luchtsluis & Reddingscapsule'
    },
    description: {
      en: 'An egg-shaped emergency escape pod sits ready in the pressurized bay. A control panel with a big red LAUNCH button stands nearby.',
      nl: 'Een eivormige reddingscapsule staat paraat in de lanceerbaai. Een controlepaneel met een grote rode LANCEER-knop knippert.'
    },
    west: 'STARBOARD_HALL',
    items: ['SURVIVAL_KIT'],
    obstacles: [
      { x: 0, y: 0, width: 320, height: 60, type: 'solid' },
      { x: 280, y: 60, width: 40, height: 140, type: 'solid' }
    ],
    visited: false
  },

  DEEP_SPACE: {
    id: 'DEEP_SPACE',
    title: {
      en: 'Deep Space Orbit & Hyper-Drive Ejection',
      nl: 'Diepe Ruimte Baan & Hyper-Drive Vlucht'
    },
    description: {
      en: 'Your escape pod screams into hyperspace as the Starship Arcada detonates behind you in a blinding fireball. Ahead lies planet Kerona!',
      nl: 'Je reddingscapsule schiet met lichtsnelheid weg terwijl de Arcada achter je in een vuurzee ontploft. Voor je ligt de woestijnplaneet Kerona!'
    },
    items: [],
    obstacles: [],
    visited: false
  },

  KERONA_CRASH: {
    id: 'KERONA_CRASH',
    title: {
      en: 'Planet Kerona: Pod Crash Site',
      nl: 'Planeet Kerona: Wrak van de Capsule'
    },
    description: {
      en: 'Your charred escape capsule lies embedded in the alien sand dunes beneath two blazing suns. Glass shards glitter across the sand.',
      nl: 'Je zwartgeblakerde capsule ligt diep in het buitenaardse woestijnzand onder twee brandende zonnen. Glasscherven glinsteren in het zand.'
    },
    east: 'KERONA_CANYON',
    items: ['GLASS_SHARD', 'DEHYDRATED_WATER'],
    obstacles: [
      { x: 100, y: 70, width: 90, height: 50, type: 'solid' }
    ],
    visited: false
  },

  KERONA_CANYON: {
    id: 'KERONA_CANYON',
    title: {
      en: 'Arid Sandstone Canyons of Kerona',
      nl: 'Rode Zandsteenkloven van Kerona'
    },
    description: {
      en: 'High towering red sandstone cliffs rise above you. To the north lies a dark cavern dripping with acid stalactites.',
      nl: 'Torenhoge rode rotswanden rijzen boven je uit. Naar het noorden gaapt een donkere grot vol druipende zuurstalactieten.'
    },
    west: 'KERONA_CRASH',
    north: 'ORAT_CAVERN',
    east: 'SKIMMER_LANDING',
    items: [],
    obstacles: [
      { x: 0, y: 0, width: 120, height: 60, type: 'solid' },
      { x: 200, y: 0, width: 120, height: 60, type: 'solid' }
    ],
    visited: false
  },

  ORAT_CAVERN: {
    id: 'ORAT_CAVERN',
    title: {
      en: 'Lair of the Menacing Orat',
      nl: 'Het Hol van het Orat Monster'
    },
    description: {
      en: 'A terrifying beast with bulbous eyes and razor fangs—the dreaded Orat—thrashes violently in the subterranean gloom!',
      nl: 'Een angstaanjagend beest met uitpuilende ogen en vlijmscherpe tanden—de gevreesde Orat—briest wild in de duisternis!'
    },
    south: 'KERONA_CANYON',
    north: 'UNDERGROUND_LAB',
    items: ['PULSER_PISTOL'],
    obstacles: [
      { x: 120, y: 60, width: 80, height: 60, type: 'solid' }
    ],
    visited: false
  },

  UNDERGROUND_LAB: {
    id: 'UNDERGROUND_LAB',
    title: {
      en: 'Ancient Keronian Hologram Vault',
      nl: 'Ondergrondse Keronische Hologramkamer'
    },
    description: {
      en: 'A massive holographic face appears: "Greetings, visitor from Xenon! We possess technology to thwart the evil Sarien armada!"',
      nl: 'Een enorm hologram verschijnt: "Gegroet, bezoeker van Xenon! Wij bezitten technologie om de kwade Sarien-vloot te verslaan!"'
    },
    south: 'ORAT_CAVERN',
    items: ['GADGET'],
    obstacles: [
      { x: 0, y: 0, width: 320, height: 60, type: 'solid' }
    ],
    visited: false
  },

  SKIMMER_LANDING: {
    id: 'SKIMMER_LANDING',
    title: {
      en: 'Ulence Flats Sand Skimmer Launchpad',
      nl: 'Zand-Skimmer Lanceerplatform naar Ulence Flats'
    },
    description: {
      en: 'A sleek alien hover skimmer awaits with engine humming. Hop in to speed across the Kerona salt flats toward Ulence Flats settlement!',
      nl: 'Een gestroomlijnde zand-skimmer staat klaar met snorrende motor. Stap in om over de zoutvlaktes naar Ulence Flats te racen!'
    },
    west: 'KERONA_CANYON',
    items: [],
    obstacles: [
      { x: 130, y: 70, width: 90, height: 50, type: 'solid' }
    ],
    visited: false
  }
};
