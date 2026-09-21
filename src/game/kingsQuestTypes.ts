/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * King's Quest I: Quest for the Crown (1984, Roberta Williams / Sierra On-Line / IBM PCjr)
 * TypeScript Type Definitions
 */

export type RoomId =
  | 'CASTLE_GATES'
  | 'CASTLE_GARDEN'
  | 'GREAT_OAK'
  | 'WISHING_WELL'
  | 'CLOVER_PATCH'
  | 'WALNUT_TREE'
  | 'TROLL_BRIDGE'
  | 'GOAT_PEN'
  | 'GINGERBREAD_HOUSE'
  | 'GNOME_FIELD'
  | 'FERTILE_GROUND'
  | 'SKY_CLOUDS'
  | 'DRAGON_CAVE'
  | 'LEPRECHAUN_HALL'
  | 'THRONE_ROOM';

export type ItemId =
  | 'GOLDEN_EGG'
  | 'WALNUT'
  | 'GOLD_WALNUT'
  | 'FOUR_LEAF_CLOVER'
  | 'CARROT'
  | 'MAGIC_BEANS'
  | 'SLINGSHOT'
  | 'DAGGER'
  | 'FIDDLE'
  | 'CHEESE'
  | 'MAGIC_MUSHROOM'
  | 'BUCKET'
  | 'WATER_BUCKET'
  | 'MAGIC_MIRROR'
  | 'MAGIC_SHIELD'
  | 'MAGIC_CHEST';

export interface InventoryItem {
  id: ItemId;
  name: string;
  nameNl: string;
  description: string;
  descriptionNl: string;
  icon: string;
  points: number;
}

export type Direction = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'IDLE';

export interface GrahamState {
  x: number;
  y: number;
  direction: Direction;
  animFrame: number;
  isWalking: boolean;
  isClimbing: boolean;
  isDead: boolean;
  deathReason: string;
  deathReasonNl: string;
  isVictorious: boolean;
  isCarryingGoat: boolean;
  hasFairyProtection: boolean;
  fairyTimer: number;
}

export interface RoomActor {
  id: string;
  name: string;
  nameNl: string;
  x: number;
  y: number;
  active: boolean;
  state?: string;
  dialogue?: { en: string; nl: string };
}

export interface RoomObstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'solid' | 'water' | 'climbable';
}

export interface RoomDefinition {
  id: RoomId;
  title: { en: string; nl: string };
  description: { en: string; nl: string };
  north?: RoomId;
  south?: RoomId;
  east?: RoomId;
  west?: RoomId;
  items: ItemId[];
  actors: RoomActor[];
  obstacles: RoomObstacle[];
  visited: boolean;
}

export interface QuestMilestone {
  id: string;
  description: { en: string; nl: string };
  points: number;
  achieved: boolean;
}

export interface SavedGame {
  slot: number;
  name: string;
  date: string;
  score: number;
  currentRoom: RoomId;
  graham: GrahamState;
  inventory: ItemId[];
  milestones: Record<string, boolean>;
  roomItems: Record<RoomId, ItemId[]>;
}

export interface KingsQuestState {
  currentRoom: RoomId;
  score: number;
  maxScore: number;
  soundEnabled: boolean;
  graham: GrahamState;
  inventory: ItemId[];
  messageLog: { text: string; isPlayer?: boolean; isSystem?: boolean }[];
  currentInput: string;
  isInputActive: boolean;
  showInventoryModal: boolean;
  showSaveModal: boolean;
  showRestoreModal: boolean;
  showHelpModal: boolean;
}
