/**
 * Authentic Pac-Man Ghost AI based on "The Pac-Man Dossier" by Jamey Pittman.
 */

import { Direction, GhostEntity, PacmanEntity, TileCoord } from '../types';
import { FORBIDDEN_UP_TILES, GHOST_DOOR_TILE, GHOST_REVIVE_TARGET, SCATTER_CORNERS } from './constants';

export const GHOST_DIRECTIONS: Direction[] = ['UP', 'LEFT', 'DOWN', 'RIGHT']; // Authentic Namco tie-breaker priority

/**
 * Opposite direction map
 */
export function getOppositeDirection(dir: Direction): Direction {
  switch (dir) {
    case 'UP': return 'DOWN';
    case 'DOWN': return 'UP';
    case 'LEFT': return 'RIGHT';
    case 'RIGHT': return 'LEFT';
    default: return 'NONE';
  }
}

/**
 * Calculate distance squared between two tiles
 */
export function getDistanceSq(a: TileCoord, b: TileCoord): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

/**
 * Calculate the authentic target tile for each ghost
 */
export function calculateGhostTarget(
  ghost: GhostEntity,
  pacman: PacmanEntity,
  blinky: GhostEntity
): TileCoord {
  // If eaten, eyes target the ghost house door
  if (ghost.mode === 'EATEN') {
    return GHOST_REVIVE_TARGET;
  }

  // In scatter mode, target their respective corner
  if (ghost.mode === 'SCATTER') {
    return ghost.scatterCorner;
  }

  // In frightened mode, pseudo-random target or random intersection choices
  if (ghost.mode === 'FRIGHTENED') {
    return {
      x: Math.floor(Math.random() * 28),
      y: Math.floor(Math.random() * 31)
    };
  }

  // Chase Mode Personalities
  switch (ghost.name) {
    case 'blinky': {
      // Blinky ("Shadow"): Directly targets Pac-Man's current tile
      return { x: pacman.tileX, y: pacman.tileY };
    }

    case 'pinky': {
      // Pinky ("Speedy"): 4 tiles ahead of Pac-Man.
      // Classic Namco 6502 Overflow Bug: If Pac-Man is facing UP, target is 4 tiles UP AND 4 tiles LEFT!
      let tx = pacman.tileX;
      let ty = pacman.tileY;

      switch (pacman.dir) {
        case 'UP':
          tx -= 4; // Authentic overflow quirk!
          ty -= 4;
          break;
        case 'DOWN':
          ty += 4;
          break;
        case 'LEFT':
          tx -= 4;
          break;
        case 'RIGHT':
          tx += 4;
          break;
        default:
          break;
      }
      return { x: tx, y: ty };
    }

    case 'inky': {
      // Inky ("Bashful"): Complex dual-vector targeting!
      // Step 1: Intermediate tile 2 tiles ahead of Pac-Man (also has the UP quirk: 2 up & 2 left)
      let intermediateX = pacman.tileX;
      let intermediateY = pacman.tileY;

      switch (pacman.dir) {
        case 'UP':
          intermediateX -= 2;
          intermediateY -= 2;
          break;
        case 'DOWN':
          intermediateY += 2;
          break;
        case 'LEFT':
          intermediateX -= 2;
          break;
        case 'RIGHT':
          intermediateX += 2;
          break;
        default:
          break;
      }

      // Step 2: Vector from Blinky's current tile to intermediate tile
      const vx = intermediateX - blinky.tileX;
      const vy = intermediateY - blinky.tileY;

      // Step 3: Double the vector from intermediate tile
      return {
        x: intermediateX + vx,
        y: intermediateY + vy
      };
    }

    case 'clyde': {
      // Clyde ("Pokey"): Proximity-based targeting.
      // If distance to Pac-Man >= 8 tiles, targets Pac-Man like Blinky.
      // If distance < 8 tiles, retreats to his scatter corner (bottom-left 0, 34)!
      const distSq = getDistanceSq({ x: ghost.tileX, y: ghost.tileY }, { x: pacman.tileX, y: pacman.tileY });
      if (distSq >= 64) {
        // >= 8 tiles away: Target Pac-Man
        return { x: pacman.tileX, y: pacman.tileY };
      } else {
        // < 8 tiles away: Retreat to corner!
        return ghost.scatterCorner;
      }
    }

    default:
      return { x: pacman.tileX, y: pacman.tileY };
  }
}

/**
 * Check if a tile coordinate is passable for a ghost
 */
export function isTilePassableForGhost(
  rawTileX: number,
  rawTileY: number,
  maze: string[],
  ghostMode: string,
  goingThroughDoor: boolean = false
): boolean {
  const tileX = Math.floor(rawTileX);
  const tileY = Math.floor(rawTileY);

  // Wrap around tunnel
  if (tileY === 14 && (tileX < 0 || tileX >= 28)) {
    return true;
  }

  if (tileX < 0 || tileX >= 28 || tileY < 0 || tileY >= 31) {
    return false;
  }

  if (!maze[tileY] || typeof maze[tileY][tileX] !== 'string') {
    return false;
  }

  const char = maze[tileY][tileX];

  if (char === 'W') return false; // Walls never passable

  if (char === '-') {
    // Door can only be passed if entering or leaving ghost house
    return goingThroughDoor || ghostMode === 'EATEN' || ghostMode === 'IN_HOUSE';
  }

  if (char === 'G') {
    // House interior only passable for eaten eyes or ghosts in house
    return ghostMode === 'EATEN' || ghostMode === 'IN_HOUSE' || goingThroughDoor;
  }

  return true;
}

/**
 * Decide next direction for ghost at an intersection.
 * Follows authentic priority: UP > LEFT > DOWN > RIGHT.
 */
export function decideGhostDirection(
  ghost: GhostEntity,
  target: TileCoord,
  maze: string[],
  isFrightened: boolean
): Direction {
  const currentDir = ghost.dir;
  const opposite = getOppositeDirection(currentDir);
  const curTileX = Math.floor(ghost.tileX);
  const curTileY = Math.floor(ghost.tileY);

  // Check if current tile is one of the authentic forbidden-UP tiles
  const isForbiddenUpTile = FORBIDDEN_UP_TILES.some(
    f => f.x === curTileX && f.y === curTileY
  );

  const candidates: { dir: Direction; distSq: number }[] = [];

  for (const dir of GHOST_DIRECTIONS) {
    // Ghosts cannot reverse 180 degrees directly at normal intersections
    if (dir === opposite && currentDir !== 'NONE') continue;

    // Check forbidden UP restriction (only applies in non-frightened and non-eaten mode)
    if (dir === 'UP' && isForbiddenUpTile && !isFrightened && ghost.mode !== 'EATEN') {
      continue;
    }

    let nextX = curTileX;
    let nextY = curTileY;
    if (dir === 'UP') nextY -= 1;
    if (dir === 'DOWN') nextY += 1;
    if (dir === 'LEFT') nextX -= 1;
    if (dir === 'RIGHT') nextX += 1;

    // Wrap tunnel coordinates
    if (nextX < 0) nextX = 27;
    if (nextX >= 28) nextX = 0;

    const isPassable = isTilePassableForGhost(
      nextX,
      nextY,
      maze,
      ghost.mode,
      ghost.mode === 'EATEN'
    );

    if (isPassable) {
      const dist = getDistanceSq({ x: nextX, y: nextY }, target);
      candidates.push({ dir, distSq: dist });
    }
  }

  if (candidates.length === 0) {
    // Fallback: reverse if trapped
    return opposite !== 'NONE' ? opposite : 'LEFT';
  }

  // If frightened, choose pseudo-random valid candidate
  if (isFrightened) {
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex].dir;
  }

  // In standard mode, pick candidate with minimum distance squared to target.
  // Note: GHOST_DIRECTIONS order (UP > LEFT > DOWN > RIGHT) automatically handles tie-breaking!
  let bestDir = candidates[0].dir;
  let minDist = candidates[0].distSq;

  for (let i = 1; i < candidates.length; i++) {
    if (candidates[i].distSq < minDist) {
      minDist = candidates[i].distSq;
      bestDir = candidates[i].dir;
    }
  }

  return bestDir;
}
