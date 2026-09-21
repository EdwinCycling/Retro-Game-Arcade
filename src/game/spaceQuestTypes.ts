/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Space Quest: Chapter I - The Sarien Encounter (1986, Sierra On-Line)
 * Authentic Sierra AGI Sci-Fi Graphic Adventure Engine Types
 */

export type SQRoomId =
  | 'JANITOR_CLOSET'
  | 'STARBOARD_HALL'
  | 'DATA_ARCHIVE'
  | 'ESCAPE_POD_BAY'
  | 'DEEP_SPACE'
  | 'KERONA_CRASH'
  | 'KERONA_CANYON'
  | 'ORAT_CAVERN'
  | 'UNDERGROUND_LAB'
  | 'SKIMMER_LANDING';

export type SQItemId =
  | 'BROOM'
  | 'KEYCARD'
  | 'CARTRIDGE'
  | 'GADGET'
  | 'GLASS_SHARD'
  | 'DEHYDRATED_WATER'
  | 'SURVIVAL_KIT'
  | 'PULSER_PISTOL';

export interface SQInventoryItem {
  id: SQItemId;
  name: string;
  nameNl: string;
  description: string;
  descriptionNl: string;
  icon: string;
  points: number;
}

export type SQDirection = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'IDLE';

export interface RogerState {
  x: number;
  y: number;
  direction: SQDirection;
  animFrame: number;
  isWalking: boolean;
  isDead: boolean;
  deathReason: string;
  deathReasonNl: string;
  isVictorious: boolean;
}

export interface SQObstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'solid' | 'airlock' | 'acid';
}

export interface SQRoomDefinition {
  id: SQRoomId;
  title: { en: string; nl: string };
  description: { en: string; nl: string };
  north?: SQRoomId;
  south?: SQRoomId;
  east?: SQRoomId;
  west?: SQRoomId;
  items: SQItemId[];
  obstacles: SQObstacle[];
  visited: boolean;
}
