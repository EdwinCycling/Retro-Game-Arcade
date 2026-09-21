/**
 * Impossible Mission - Core Game Engine
 * 1-on-1 faithful recreation of the 1984 Commodore 64 masterpiece by Dennis Caswell / Epyx.
 */

import {
  Agent,
  SecurityRoom,
  Robot,
  FloatingOrb,
  Furniture,
  PuzzlePiece,
  GameScreen,
  PocketComputerState,
  PunchCard
} from './impossibleMissionTypes';
import { createRooms, generateInitialPuzzlePieces } from './impossibleMissionData';
import { impossibleMissionAudio } from './impossibleMissionAudio';
import { saveImpossibleMissionScore } from './impossibleMissionHighScores';

export interface ImpossibleMissionInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  search: boolean;
  computer: boolean;
}

export class ImpossibleMissionEngine {
  public screen: GameScreen = 'shaft';
  public currentShaftFloor: number = 1; // 0 = Elvin's Lair, 1-8 = Rooms
  public elevatorY: number = 100; // Shaft elevator position
  public targetElevatorY: number = 100;
  
  public rooms: SecurityRoom[] = [];
  public currentRoomIndex: number = 0;
  public currentRoom: SecurityRoom;

  public agent: Agent;
  public puzzlePieces: PuzzlePiece[] = [];
  public punchCards: PunchCard[] = [];

  // 6-Hour Mission Countdown (in seconds) - 6:00:00 = 21,600s
  public remainingSeconds: number = 21600;
  private timerAccumulator: number = 0;

  // Pocket Computer State
  public computer: PocketComputerState = {
    isOpen: false,
    activeTab: 'puzzle',
    selectedPieceIndex: null,
    snoozePasscodes: 2,
    liftResetPasscodes: 1
  };

  // Status & Notifications
  public notificationText: string = 'ANOTHER VISITOR... STAY A WHILE, STAY FOREVER!';
  public notificationTimer: number = 240;
  public penaltyFlash: number = 0;
  public deathRespawnTimer: number = 0;

  public elvinDialogueTimer: number = 0;
  public isRunning: boolean = true;

  constructor() {
    this.rooms = createRooms();
    this.currentRoomIndex = 0;
    this.currentRoom = this.rooms[0];
    this.puzzlePieces = generateInitialPuzzlePieces();
    this.initPunchCards();

    this.agent = {
      x: 100,
      y: 240,
      vx: 0,
      vy: 0,
      width: 14,
      height: 38,
      direction: 1,
      state: 'idle',
      frame: 0,
      animTimer: 0,
      flipAngle: 0,
      searchTimer: 0,
      searchTarget: null,
      currentPlatformId: null,
      ridingLiftId: null
    };

    // Calculate shaft elevator Y for floor 1
    this.elevatorY = this.getFloorY(1);
    this.targetElevatorY = this.elevatorY;
  }

  private initPunchCards() {
    this.punchCards = [];
    for (let i = 0; i < 9; i++) {
      this.punchCards.push({
        id: i,
        solved: false,
        slots: [null, null, null, null]
      });
    }
  }

  public getFloorY(floor: number): number {
    // Floor 0 at y=40, floor 8 at y=320 (height ~35px per floor)
    return 40 + floor * 35;
  }

  public resetGame() {
    this.rooms = createRooms();
    this.currentRoomIndex = 0;
    this.currentRoom = this.rooms[0];
    this.puzzlePieces = generateInitialPuzzlePieces();
    this.initPunchCards();
    this.remainingSeconds = 21600;
    this.timerAccumulator = 0;
    this.screen = 'shaft';
    this.currentShaftFloor = 1;
    this.elevatorY = this.getFloorY(1);
    this.targetElevatorY = this.elevatorY;
    this.computer = {
      isOpen: false,
      activeTab: 'puzzle',
      selectedPieceIndex: null,
      snoozePasscodes: 2,
      liftResetPasscodes: 1
    };
    this.notificationText = 'MISSION CLOCK: 6:00:00 - INFILTRATE ATOMBENDER BUNKER';
    this.notificationTimer = 220;
    this.penaltyFlash = 0;
    this.deathRespawnTimer = 0;
    this.agent = {
      x: 320,
      y: this.elevatorY + 4,
      vx: 0,
      vy: 0,
      width: 14,
      height: 38,
      direction: 1,
      state: 'idle',
      frame: 0,
      animTimer: 0,
      flipAngle: 0,
      searchTimer: 0,
      searchTarget: null,
      currentPlatformId: null,
      ridingLiftId: null
    };
    impossibleMissionAudio.playElvinWelcome();
  }

  public update(input: ImpossibleMissionInput, dtMs: number) {
    if (this.screen === 'game_over' || this.screen === 'victory') {
      return;
    }

    // Countdown Timer (1 second = 1 real second in-game)
    this.timerAccumulator += dtMs;
    if (this.timerAccumulator >= 1000) {
      const elapsedSeconds = Math.floor(this.timerAccumulator / 1000);
      this.remainingSeconds = Math.max(0, this.remainingSeconds - elapsedSeconds);
      this.timerAccumulator %= 1000;

      if (this.remainingSeconds <= 0) {
        this.triggerGameOver('TIME ELAPSED: MISSILE LAUNCHED BY ATOMBENDER!');
        return;
      }
    }

    if (this.notificationTimer > 0) {
      this.notificationTimer--;
    }
    if (this.penaltyFlash > 0) {
      this.penaltyFlash--;
    }

    // Handle Pocket Computer Screen Toggle
    if (input.computer) {
      this.toggleComputer();
    }

    if (this.computer.isOpen) {
      return; // Game physics paused when pocket computer is open
    }

    // Handle Active Screen
    if (this.screen === 'shaft') {
      this.updateShaft(input);
    } else if (this.screen === 'room') {
      this.updateRoom(input);
    } else if (this.screen === 'elvin_lair') {
      this.updateElvinLair(input);
    }
  }

  public toggleComputer() {
    this.computer.isOpen = !this.computer.isOpen;
    if (this.computer.isOpen) {
      impossibleMissionAudio.playSearchTick();
    }
  }

  // ==========================================
  // CENTRAL ELEVATOR SHAFT LOGIC
  // ==========================================
  private updateShaft(input: ImpossibleMissionInput) {
    // Smooth elevator movement towards target floor
    const diff = this.targetElevatorY - this.elevatorY;
    if (Math.abs(diff) > 0.5) {
      this.elevatorY += Math.sign(diff) * 2.0;
      if (Math.random() < 0.1) {
        impossibleMissionAudio.playElevatorHum();
      }
    } else {
      this.elevatorY = this.targetElevatorY;
    }

    // Agent sits inside elevator platform (center x=320)
    this.agent.x = 320;
    this.agent.y = this.elevatorY;
    this.agent.state = 'idle';

    // Elevator Floor Controls
    if (input.up && this.currentShaftFloor > 0 && this.elevatorY === this.targetElevatorY) {
      this.currentShaftFloor--;
      this.targetElevatorY = this.getFloorY(this.currentShaftFloor);
      impossibleMissionAudio.playElevatorHum();
    } else if (input.down && this.currentShaftFloor < 8 && this.elevatorY === this.targetElevatorY) {
      this.currentShaftFloor++;
      this.targetElevatorY = this.getFloorY(this.currentShaftFloor);
      impossibleMissionAudio.playElevatorHum();
    }

    // Enter Room Doorway (Right arrow or Spacebar)
    if (input.right || input.jump) {
      if (this.currentShaftFloor === 0) {
        // Floor 0: Master Control Room (Requires 9 solved punch cards)
        this.tryEnterElvinLair();
      } else {
        // Floors 1-8: Security Rooms
        this.enterRoom(this.currentShaftFloor - 1);
      }
    }
  }

  private tryEnterElvinLair() {
    const solvedCards = this.punchCards.filter(c => c.solved).length;
    if (solvedCards >= 9) {
      this.screen = 'elvin_lair';
      this.agent.x = 60;
      this.agent.y = 260;
      this.notificationText = 'MASTER CONTROL ROOM ACCESSED! CONFRONT ATOMBENDER!';
      this.notificationTimer = 240;
      impossibleMissionAudio.playElvinWelcome();
    } else {
      this.notificationText = `SECURITY LOCK ACTIVE: ${solvedCards}/9 PASSWORDS ASSEMBLED IN COMPUTER`;
      this.notificationTimer = 180;
      impossibleMissionAudio.playPenaltyBuzzer();
    }
  }

  private enterRoom(roomIndex: number) {
    this.currentRoomIndex = roomIndex;
    this.currentRoom = this.rooms[roomIndex];
    this.screen = 'room';
    this.agent.x = this.currentRoom.entryX;
    this.agent.y = this.currentRoom.entryY;
    this.agent.vx = 0;
    this.agent.vy = 0;
    this.agent.state = 'idle';
    this.agent.flipAngle = 0;
    this.agent.direction = 1;
    this.notificationText = `ENTERED: ${this.currentRoom.name.toUpperCase()}`;
    this.notificationTimer = 180;
    impossibleMissionAudio.playElevatorHum();
  }

  public exitToShaft() {
    this.screen = 'shaft';
    this.currentShaftFloor = this.currentRoomIndex + 1;
    this.elevatorY = this.getFloorY(this.currentShaftFloor);
    this.targetElevatorY = this.elevatorY;
    this.agent.x = 320;
    this.agent.y = this.elevatorY;
    this.agent.state = 'idle';
    impossibleMissionAudio.playElevatorHum();
  }

  // ==========================================
  // ROOM GAMEPLAY LOGIC
  // ==========================================
  private updateRoom(input: ImpossibleMissionInput) {
    // Check if dead and respawning
    if (this.deathRespawnTimer > 0) {
      this.deathRespawnTimer--;
      if (this.deathRespawnTimer === 0) {
        this.respawnAgentInRoom();
      }
      return;
    }

    // Update Floating Room Lifts
    this.updateRoomLifts();

    // Update Room Robots
    this.updateRoomRobots();

    // Update Floating Orb
    if (this.currentRoom.orb) {
      this.updateOrb(this.currentRoom.orb);
    }

    // Update Agent Kinematics & Actions
    this.updateAgent(input);

    // Check Room Exit (Doorway on the left)
    const exit = this.currentRoom.exit;
    if (
      this.agent.x < exit.x + exit.width &&
      this.agent.x + this.agent.width > exit.x &&
      this.agent.y + this.agent.height >= exit.y
    ) {
      if (input.left || input.up) {
        this.exitToShaft();
      }
    }
  }

  private updateRoomLifts() {
    for (const p of this.currentRoom.platforms) {
      if (p.isLift && p.liftAxis && p.liftMin !== undefined && p.liftMax !== undefined) {
        const speed = (p.liftSpeed || 1) * (p.liftDir || 1);
        if (p.liftAxis === 'vertical') {
          p.y += speed;
          if (p.y <= p.liftMin) {
            p.y = p.liftMin;
            p.liftDir = 1;
          } else if (p.y >= p.liftMax) {
            p.y = p.liftMax;
            p.liftDir = -1;
          }
        } else if (p.liftAxis === 'horizontal') {
          p.x += speed;
          if (p.x <= p.liftMin) {
            p.x = p.liftMin;
            p.liftDir = 1;
          } else if (p.x >= p.liftMax) {
            p.x = p.liftMax;
            p.liftDir = -1;
          }
        }
      }
    }
  }

  private updateRoomRobots() {
    for (const r of this.currentRoom.robots) {
      if (r.snoozedTimer > 0) {
        r.snoozedTimer--;
        continue;
      }

      r.animFrame = (r.animFrame + 0.1) % 4;

      if (r.type === 'patrol') {
        r.x += r.direction * r.speed;
        if (r.x <= r.minX) {
          r.x = r.minX;
          r.direction = 1;
        } else if (r.x >= r.maxX) {
          r.x = r.maxX;
          r.direction = -1;
        }
      } else if (r.type === 'chaser') {
        // Chase player if player is within vertical range
        const onSameLevel = Math.abs((this.agent.y + this.agent.height) - (r.y + r.height)) < 24;
        if (onSameLevel) {
          r.direction = this.agent.x > r.x ? 1 : -1;
          r.x += r.direction * (r.speed * 1.3);
        } else {
          r.x += r.direction * r.speed;
        }
        if (r.x <= r.minX) {
          r.x = r.minX;
          r.direction = 1;
        } else if (r.x >= r.maxX) {
          r.x = r.maxX;
          r.direction = -1;
        }
      } else if (r.type === 'zapper') {
        // Stationary or slow patrol, periodic laser blasts
        r.x += r.direction * (r.speed * 0.5);
        if (r.x <= r.minX) {
          r.x = r.minX;
          r.direction = 1;
        } else if (r.x >= r.maxX) {
          r.x = r.maxX;
          r.direction = -1;
        }

        if (r.laserCooldown > 0) {
          r.laserCooldown--;
        } else {
          // Fire Laser!
          r.laserFiring = true;
          impossibleMissionAudio.playRobotZap();
          r.laserCooldown = 140; // Cooldown between shots
        }

        if (r.laserFiring) {
          // Laser beam active for 20 frames
          const beamLength = 260;
          const beamX2 = r.direction === 1 ? r.x + beamLength : r.x - beamLength;
          r.laserBeam = {
            x1: r.direction === 1 ? r.x + r.width : r.x,
            y1: r.y + 10,
            x2: beamX2,
            y2: r.y + 10
          };

          // Check if beam hits agent
          const beamMinX = Math.min(r.laserBeam.x1, r.laserBeam.x2);
          const beamMaxX = Math.max(r.laserBeam.x1, r.laserBeam.x2);
          const agentTop = this.agent.y;
          const agentBottom = this.agent.y + this.agent.height;

          if (
            this.agent.x + this.agent.width > beamMinX &&
            this.agent.x < beamMaxX &&
            r.laserBeam.y1 >= agentTop &&
            r.laserBeam.y1 <= agentBottom &&
            this.agent.state !== 'electrocuted' &&
            this.agent.state !== 'falling'
          ) {
            this.killAgent('electrocuted', 'ZAPPED BY SECURITY ROBOT LASER!');
          }

          if (r.laserCooldown < 120) {
            r.laserFiring = false;
            r.laserBeam = undefined;
          }
        }
      }

      // Direct body collision with robot
      if (
        this.agent.x < r.x + r.width &&
        this.agent.x + this.agent.width > r.x &&
        this.agent.y < r.y + r.height &&
        this.agent.y + this.agent.height > r.y &&
        this.agent.state !== 'electrocuted' &&
        this.agent.state !== 'falling'
      ) {
        this.killAgent('electrocuted', 'ELECTROCUTED BY SECURITY BOT CHASSIS!');
      }
    }
  }

  private updateOrb(orb: FloatingOrb) {
    if (!orb.active) return;
    orb.x += orb.vx;
    orb.y += orb.vy;

    // Room boundaries bounce
    if (orb.x <= orb.radius) {
      orb.x = orb.radius;
      orb.vx = Math.abs(orb.vx);
    } else if (orb.x >= 640 - orb.radius) {
      orb.x = 640 - orb.radius;
      orb.vx = -Math.abs(orb.vx);
    }

    if (orb.y <= orb.radius + 20) {
      orb.y = orb.radius + 20;
      orb.vy = Math.abs(orb.vy);
    } else if (orb.y >= 320 - orb.radius) {
      orb.y = 320 - orb.radius;
      orb.vy = -Math.abs(orb.vy);
    }

    // Orb slowly tracks toward player
    if (Math.random() < 0.05) {
      const dx = this.agent.x - orb.x;
      const dy = this.agent.y - orb.y;
      orb.vx += Math.sign(dx) * 0.15;
      orb.vy += Math.sign(dy) * 0.15;
      // Cap speed
      orb.vx = Math.max(-2, Math.min(2, orb.vx));
      orb.vy = Math.max(-1.5, Math.min(1.5, orb.vy));
    }

    // Collision with agent
    const dist = Math.hypot(
      orb.x - (this.agent.x + this.agent.width / 2),
      orb.y - (this.agent.y + this.agent.height / 2)
    );
    if (dist < orb.radius + 8 && this.agent.state !== 'electrocuted' && this.agent.state !== 'falling') {
      this.killAgent('electrocuted', 'ANNIHILATED BY FLOATING PLASMA ORB!');
    }
  }

  private updateAgent(input: ImpossibleMissionInput) {
    const a = this.agent;

    // Searching furniture state
    if (a.state === 'searching') {
      a.searchTimer += 1;
      if (a.searchTimer % 12 === 0) {
        impossibleMissionAudio.playSearchTick();
      }
      if (a.searchTimer >= 90) { // ~1.5s search duration
        this.finishSearching(a.searchTarget);
        a.state = 'idle';
        a.searchTimer = 0;
        a.searchTarget = null;
      }
      return;
    }

    // Somersault Jump State (Gymnastic 360-degree flip)
    if (a.state === 'jumping') {
      a.x += a.vx;
      a.y += a.vy;
      a.vy += 0.38; // Gravity
      a.flipAngle += a.direction * 14; // Somersault rotation

      // Check landing on platforms
      const landing = this.checkPlatformCollision(a.x, a.y, a.width, a.height, a.vy);
      if (landing && a.vy > 0) {
        a.y = landing.y - a.height;
        a.vy = 0;
        a.vx = 0;
        a.flipAngle = 0;
        a.state = 'idle';
        a.currentPlatformId = landing.id;
        impossibleMissionAudio.playFootstep();
      }

      // Check falling into void
      if (a.y > 360) {
        this.killAgent('falling', 'FALLING DOWN SUBTERRANEAN SHAFT!');
      }
      return;
    }

    // Grounded or Falling movement
    const onGround = this.checkPlatformCollision(a.x, a.y, a.width, a.height, 0);

    if (onGround) {
      a.y = onGround.y - a.height;
      a.vy = 0;
      a.currentPlatformId = onGround.id;

      // Check initiating Search on nearby furniture
      if (input.up || input.search) {
        const nearbyFurniture = this.findNearbyFurniture();
        if (nearbyFurniture && !nearbyFurniture.searched) {
          a.state = 'searching';
          a.searchTimer = 0;
          a.searchTarget = nearbyFurniture;
          a.vx = 0;
          return;
        }
      }

      // Check initiating Gymnastic Somersault Jump
      if (input.jump) {
        a.state = 'jumping';
        a.vy = -7.4;
        a.vx = a.direction * (input.left || input.right ? 3.4 : 2.2);
        a.flipAngle = 0;
        impossibleMissionAudio.playJump();
        return;
      }

      // Running left or right
      if (input.left) {
        a.direction = -1;
        a.vx = -2.6;
        a.state = 'running';
        a.animTimer += 1;
        if (a.animTimer % 8 === 0) {
          a.frame = (a.frame + 1) % 4;
          impossibleMissionAudio.playFootstep();
        }
      } else if (input.right) {
        a.direction = 1;
        a.vx = 2.6;
        a.state = 'running';
        a.animTimer += 1;
        if (a.animTimer % 8 === 0) {
          a.frame = (a.frame + 1) % 4;
          impossibleMissionAudio.playFootstep();
        }
      } else {
        a.vx = 0;
        a.state = 'idle';
        a.frame = 0;
      }

      a.x += a.vx;

      // Keep within room walls
      a.x = Math.max(10, Math.min(620, a.x));
    } else {
      // Free falling
      a.vy += 0.38;
      a.y += a.vy;

      // Check platform catching falling agent
      const catchPlatform = this.checkPlatformCollision(a.x, a.y, a.width, a.height, a.vy);
      if (catchPlatform && a.vy > 0) {
        a.y = catchPlatform.y - a.height;
        a.vy = 0;
        a.state = 'idle';
        a.currentPlatformId = catchPlatform.id;
      } else if (a.y > 360) {
        this.killAgent('falling', 'FALLING DOWN SUBTERRANEAN SHAFT!');
      }
    }
  }

  private checkPlatformCollision(x: number, y: number, width: number, height: number, vy: number) {
    const feetY = y + height;
    for (const p of this.currentRoom.platforms) {
      if (x + width > p.x && x < p.x + p.width) {
        // Check if feet are near platform surface
        if (feetY >= p.y - 4 && feetY <= p.y + 14 && vy >= -1) {
          return p;
        }
      }
    }
    return null;
  }

  private findNearbyFurniture(): Furniture | null {
    const a = this.agent;
    const agentCenterX = a.x + a.width / 2;
    for (const f of this.currentRoom.furniture) {
      const furnitureCenterX = f.x + f.width / 2;
      const dist = Math.abs(agentCenterX - furnitureCenterX);
      if (dist < 32 && Math.abs((a.y + a.height) - (f.y + f.height)) < 16) {
        return f;
      }
    }
    return null;
  }

  private finishSearching(f: Furniture | null) {
    if (!f) return;
    f.searched = true;

    if (f.contentType === 'piece' && f.pieceIndex !== undefined) {
      const piece = this.puzzlePieces[f.pieceIndex];
      if (piece) {
        piece.found = true;
        this.notificationText = `FOUND PUZZLE PIECE #${piece.id + 1} (CARD ${piece.cardIndex + 1})!`;
        this.notificationTimer = 200;
        impossibleMissionAudio.playPieceFound();
      }
    } else if (f.contentType === 'snooze') {
      this.computer.snoozePasscodes += 1;
      this.notificationText = 'FOUND TERMINAL ROBOT SNOOZE PASSCODE (+1)!';
      this.notificationTimer = 200;
      impossibleMissionAudio.playPieceFound();
    } else if (f.contentType === 'reset_lift') {
      this.computer.liftResetPasscodes += 1;
      this.notificationText = 'FOUND LIFT RESET OVERRIDE CODE (+1)!';
      this.notificationTimer = 200;
      impossibleMissionAudio.playPieceFound();
    } else {
      this.notificationText = 'NOTHING OF VALUE FOUND IN UNIT.';
      this.notificationTimer = 140;
    }
  }

  public killAgent(reason: 'falling' | 'electrocuted', label: string) {
    this.agent.state = reason;
    this.penaltyFlash = 45;
    this.deathRespawnTimer = 80;

    // Apply iconic 10-Minute Penalty (-600 seconds)
    this.remainingSeconds = Math.max(0, this.remainingSeconds - 600);
    this.notificationText = `PENALTY -10:00! ${label}`;
    this.notificationTimer = 200;

    if (reason === 'falling') {
      impossibleMissionAudio.playFallingScream();
    } else {
      impossibleMissionAudio.playPenaltyBuzzer();
    }

    if (this.remainingSeconds <= 0) {
      this.triggerGameOver('MISSION FAILED: TIME EXPIRED DURING OPERATION');
    }
  }

  private respawnAgentInRoom() {
    this.agent.x = this.currentRoom.entryX;
    this.agent.y = this.currentRoom.entryY;
    this.agent.vx = 0;
    this.agent.vy = 0;
    this.agent.state = 'idle';
    this.agent.flipAngle = 0;
  }

  // ==========================================
  // POCKET COMPUTER ACTIONS
  // ==========================================
  public useSnoozePasscode(): boolean {
    if (this.computer.snoozePasscodes <= 0) return false;
    this.computer.snoozePasscodes--;
    // Freeze all robots in current room for 12 seconds (~720 frames)
    for (const r of this.currentRoom.robots) {
      r.snoozedTimer = 720;
    }
    this.notificationText = 'ROBOTS SNOOZED FOR 12 SECONDS!';
    this.notificationTimer = 180;
    impossibleMissionAudio.playSnooze();
    return true;
  }

  public useLiftResetPasscode(): boolean {
    if (this.computer.liftResetPasscodes <= 0) return false;
    this.computer.liftResetPasscodes--;
    for (const p of this.currentRoom.platforms) {
      if (p.isLift && p.liftMin !== undefined) {
        p.y = p.liftMin;
      }
    }
    this.notificationText = 'ROOM LIFT PLATFORMS RESET TO HOME POSITIONS!';
    this.notificationTimer = 180;
    impossibleMissionAudio.playSnooze();
    return true;
  }

  public rotatePiece(pieceId: number) {
    const p = this.puzzlePieces.find(x => x.id === pieceId);
    if (!p) return;
    const nextRot = ((p.rotation + 90) % 360) as 0 | 90 | 180 | 270;
    p.rotation = nextRot;
    impossibleMissionAudio.playSearchTick();
    this.checkPunchCardSolved(p.cardIndex);
  }

  public flipPiece(pieceId: number) {
    const p = this.puzzlePieces.find(x => x.id === pieceId);
    if (!p) return;
    p.flipped = !p.flipped;
    impossibleMissionAudio.playSearchTick();
    this.checkPunchCardSolved(p.cardIndex);
  }

  public placePieceInCard(pieceId: number, cardId: number, slotId: number): boolean {
    const piece = this.puzzlePieces.find(p => p.id === pieceId);
    const card = this.punchCards[cardId];
    if (!piece || !card) return false;

    // Check if slot matches
    card.slots[slotId] = piece;
    piece.placedInSlot = slotId;
    impossibleMissionAudio.playSearchTick();
    this.checkPunchCardSolved(cardId);
    return true;
  }

  private checkPunchCardSolved(cardId: number) {
    const card = this.punchCards[cardId];
    if (!card) return;
    const allFilled = card.slots.every(s => s !== null);
    if (allFilled) {
      // Check orientation
      const allAligned = card.slots.every(s => s !== null && s.rotation === 0 && !s.flipped);
      if (allAligned) {
        card.solved = true;
        this.notificationText = `PUNCH CARD #${cardId + 1} FULLY ASSEMBLED!`;
        this.notificationTimer = 220;
        impossibleMissionAudio.playPieceFound();
      }
    }
  }

  // ==========================================
  // PROFESSOR ELVIN ATOMBENDER'S LAIR
  // ==========================================
  private updateElvinLair(input: ImpossibleMissionInput) {
    // Run toward terminal on the right
    this.agent.x += input.right ? 2.6 : input.left ? -2.6 : 0;
    this.agent.x = Math.max(40, Math.min(580, this.agent.x));

    if (this.agent.x > 500) {
      // Disarm Missile Terminal!
      this.triggerVictory();
    }
  }

  private triggerVictory() {
    this.screen = 'victory';
    this.notificationText = 'WORLD SAVED! ATOMBENDER MISSILE DEFUSED!';
    saveImpossibleMissionScore({
      initials: 'AGT',
      remainingSeconds: this.remainingSeconds,
      piecesFound: this.puzzlePieces.filter(p => p.found).length,
      date: new Date().toISOString().split('T')[0],
      cleared: true
    });
    impossibleMissionAudio.playPieceFound();
  }

  private triggerGameOver(reason: string) {
    this.screen = 'game_over';
    this.notificationText = reason;
    saveImpossibleMissionScore({
      initials: 'AGT',
      remainingSeconds: this.remainingSeconds,
      piecesFound: this.puzzlePieces.filter(p => p.found).length,
      date: new Date().toISOString().split('T')[0],
      cleared: false
    });
    impossibleMissionAudio.playPenaltyBuzzer();
  }
}
