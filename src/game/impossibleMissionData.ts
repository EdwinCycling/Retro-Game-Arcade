/**
 * Impossible Mission - Room Layouts & Puzzle Data
 * Authentic Commodore 64 room architectures, furniture placements, and robot parameters.
 */

import { SecurityRoom, PuzzlePiece } from './impossibleMissionTypes';

// Generate 36 puzzle pieces (4 quadrants across 9 master punch cards)
export function generateInitialPuzzlePieces(): PuzzlePiece[] {
  const pieces: PuzzlePiece[] = [];
  for (let i = 0; i < 36; i++) {
    const cardIndex = Math.floor(i / 4);
    const slotIndex = i % 4;
    // Initial random rotation / flip to require player manipulation in Pocket Computer
    const rotations: (0 | 90 | 180 | 270)[] = [0, 90, 180, 270];
    const initialRot = rotations[i % 4];
    pieces.push({
      id: i,
      cardIndex,
      slotIndex,
      rotation: initialRot,
      flipped: (i % 2 === 0),
      colorId: (cardIndex % 4),
      found: false,
      placedInSlot: null
    });
  }
  return pieces;
}

// 8 Distinct Authentic Security Rooms (plus Elvin's Master Lair)
export function createRooms(): SecurityRoom[] {
  return [
    // Room 1: Terminal Lab (Floor 1)
    {
      id: 'room_1',
      name: 'Sector Alpha - Terminal Lab',
      colorTheme: '#4b75d6', // C64 Light Blue
      entryX: 40,
      entryY: 260,
      exit: { x: 20, y: 240, width: 30, height: 60, targetShaftFloor: 1 },
      platforms: [
        { id: 'p1_floor', x: 0, y: 300, width: 640, height: 20 },
        { id: 'p1_mid_left', x: 80, y: 220, width: 200, height: 16 },
        { id: 'p1_mid_right', x: 360, y: 220, width: 200, height: 16 },
        { id: 'p1_top', x: 180, y: 140, width: 280, height: 16 },
        // Floating Room Lift
        { id: 'p1_lift', x: 290, y: 220, width: 60, height: 12, isLift: true, liftAxis: 'vertical', liftMin: 140, liftMax: 300, liftSpeed: 1.2, liftDir: 1 }
      ],
      furniture: [
        { id: 'f1_1', x: 100, y: 172, width: 36, height: 48, type: 'computer', searched: false, contentType: 'piece', pieceIndex: 0 },
        { id: 'f1_2', x: 220, y: 100, width: 32, height: 40, type: 'terminal', searched: false, contentType: 'snooze' },
        { id: 'f1_3', x: 420, y: 180, width: 44, height: 40, type: 'filing_cabinet', searched: false, contentType: 'piece', pieceIndex: 1 },
        { id: 'f1_4', x: 500, y: 260, width: 40, height: 40, type: 'desk', searched: false, contentType: 'piece', pieceIndex: 2 }
      ],
      robots: [
        {
          id: 'r1_1',
          x: 400,
          y: 200,
          width: 24,
          height: 20,
          type: 'patrol',
          direction: 1,
          speed: 1.0,
          platformY: 200,
          minX: 360,
          maxX: 540,
          laserCharging: false,
          laserFiring: false,
          laserCooldown: 0,
          snoozedTimer: 0,
          animFrame: 0
        },
        {
          id: 'r1_2',
          x: 200,
          y: 280,
          width: 24,
          height: 20,
          type: 'zapper',
          direction: -1,
          speed: 0.8,
          platformY: 280,
          minX: 100,
          maxX: 480,
          laserCharging: false,
          laserFiring: false,
          laserCooldown: 120,
          snoozedTimer: 0,
          animFrame: 0
        }
      ]
    },

    // Room 2: Server Vault (Floor 2)
    {
      id: 'room_2',
      name: 'Sector Beta - Server Vault',
      colorTheme: '#a357b9', // C64 Purple
      entryX: 40,
      entryY: 260,
      exit: { x: 20, y: 240, width: 30, height: 60, targetShaftFloor: 2 },
      platforms: [
        { id: 'p2_f1', x: 0, y: 300, width: 220, height: 20 },
        { id: 'p2_f2', x: 420, y: 300, width: 220, height: 20 },
        { id: 'p2_m1', x: 120, y: 220, width: 400, height: 16 },
        { id: 'p2_t1', x: 20, y: 140, width: 180, height: 16 },
        { id: 'p2_t2', x: 440, y: 140, width: 180, height: 16 },
        // Horizontal Moving Lift over the central floor gap!
        { id: 'p2_lift_h', x: 230, y: 295, width: 70, height: 12, isLift: true, liftAxis: 'horizontal', liftMin: 220, liftMax: 410, liftSpeed: 1.5, liftDir: 1 }
      ],
      furniture: [
        { id: 'f2_1', x: 140, y: 172, width: 44, height: 48, type: 'computer', searched: false, contentType: 'piece', pieceIndex: 3 },
        { id: 'f2_2', x: 320, y: 172, width: 40, height: 48, type: 'safe', searched: false, contentType: 'piece', pieceIndex: 4 },
        { id: 'f2_3', x: 60, y: 92, width: 36, height: 48, type: 'console', searched: false, contentType: 'snooze' },
        { id: 'f2_4', x: 480, y: 92, width: 36, height: 48, type: 'terminal', searched: false, contentType: 'piece', pieceIndex: 5 }
      ],
      robots: [
        {
          id: 'r2_1',
          x: 240,
          y: 200,
          width: 24,
          height: 20,
          type: 'chaser',
          direction: -1,
          speed: 1.2,
          platformY: 200,
          minX: 130,
          maxX: 500,
          laserCharging: false,
          laserFiring: false,
          laserCooldown: 0,
          snoozedTimer: 0,
          animFrame: 0
        }
      ],
      orb: {
        x: 320,
        y: 80,
        vx: 1.5,
        vy: 1.0,
        radius: 12,
        active: true
      }
    },

    // Room 3: Robotics Assembly (Floor 3)
    {
      id: 'room_3',
      name: 'Sector Gamma - Robotics Bay',
      colorTheme: '#93b664', // C64 Light Green
      entryX: 40,
      entryY: 260,
      exit: { x: 20, y: 240, width: 30, height: 60, targetShaftFloor: 3 },
      platforms: [
        { id: 'p3_floor', x: 0, y: 300, width: 640, height: 20 },
        { id: 'p3_step1', x: 100, y: 240, width: 140, height: 16 },
        { id: 'p3_step2', x: 260, y: 190, width: 160, height: 16 },
        { id: 'p3_step3', x: 440, y: 140, width: 160, height: 16 },
        { id: 'p3_lift_v', x: 50, y: 200, width: 50, height: 12, isLift: true, liftAxis: 'vertical', liftMin: 120, liftMax: 300, liftSpeed: 1.4, liftDir: 1 }
      ],
      furniture: [
        { id: 'f3_1', x: 120, y: 192, width: 44, height: 48, type: 'computer', searched: false, contentType: 'piece', pieceIndex: 6 },
        { id: 'f3_2', x: 300, y: 142, width: 40, height: 48, type: 'console', searched: false, contentType: 'piece', pieceIndex: 7 },
        { id: 'f3_3', x: 480, y: 92, width: 36, height: 48, type: 'safe', searched: false, contentType: 'piece', pieceIndex: 8 },
        { id: 'f3_4', x: 540, y: 92, width: 28, height: 48, type: 'water_cooler', searched: false, contentType: 'reset_lift' }
      ],
      robots: [
        {
          id: 'r3_1',
          x: 280,
          y: 170,
          width: 24,
          height: 20,
          type: 'zapper',
          direction: 1,
          speed: 0.9,
          platformY: 170,
          minX: 260,
          maxX: 410,
          laserCharging: false,
          laserFiring: false,
          laserCooldown: 90,
          snoozedTimer: 0,
          animFrame: 0
        },
        {
          id: 'r3_2',
          x: 350,
          y: 280,
          width: 24,
          height: 20,
          type: 'patrol',
          direction: -1,
          speed: 1.2,
          platformY: 280,
          minX: 80,
          maxX: 580,
          laserCharging: false,
          laserFiring: false,
          laserCooldown: 0,
          snoozedTimer: 0,
          animFrame: 0
        }
      ]
    },

    // Room 4: Power Generation (Floor 4)
    {
      id: 'room_4',
      name: 'Sector Delta - Dynamo Complex',
      colorTheme: '#c25345', // C64 Light Red
      entryX: 40,
      entryY: 260,
      exit: { x: 20, y: 240, width: 30, height: 60, targetShaftFloor: 4 },
      platforms: [
        { id: 'p4_f1', x: 0, y: 300, width: 180, height: 20 },
        { id: 'p4_f2', x: 240, y: 300, width: 180, height: 20 },
        { id: 'p4_f3', x: 480, y: 300, width: 160, height: 20 },
        { id: 'p4_top_left', x: 60, y: 180, width: 220, height: 16 },
        { id: 'p4_top_right', x: 360, y: 180, width: 220, height: 16 },
        { id: 'p4_lift_center', x: 280, y: 240, width: 80, height: 12, isLift: true, liftAxis: 'vertical', liftMin: 180, liftMax: 300, liftSpeed: 1.1, liftDir: 1 }
      ],
      furniture: [
        { id: 'f4_1', x: 90, y: 132, width: 44, height: 48, type: 'computer', searched: false, contentType: 'piece', pieceIndex: 9 },
        { id: 'f4_2', x: 180, y: 132, width: 36, height: 48, type: 'terminal', searched: false, contentType: 'piece', pieceIndex: 10 },
        { id: 'f4_3', x: 400, y: 132, width: 44, height: 48, type: 'filing_cabinet', searched: false, contentType: 'piece', pieceIndex: 11 },
        { id: 'f4_4', x: 500, y: 132, width: 40, height: 48, type: 'safe', searched: false, contentType: 'snooze' }
      ],
      robots: [
        {
          id: 'r4_1',
          x: 120,
          y: 160,
          width: 24,
          height: 20,
          type: 'zapper',
          direction: 1,
          speed: 0.8,
          platformY: 160,
          minX: 70,
          maxX: 260,
          laserCharging: false,
          laserFiring: false,
          laserCooldown: 100,
          snoozedTimer: 0,
          animFrame: 0
        },
        {
          id: 'r4_2',
          x: 440,
          y: 160,
          width: 24,
          height: 20,
          type: 'chaser',
          direction: -1,
          speed: 1.1,
          platformY: 160,
          minX: 370,
          maxX: 560,
          laserCharging: false,
          laserFiring: false,
          laserCooldown: 0,
          snoozedTimer: 0,
          animFrame: 0
        }
      ]
    },

    // Room 5: Security Hub (Floor 5)
    {
      id: 'room_5',
      name: 'Sector Epsilon - Security Hub',
      colorTheme: '#d8e55b', // C64 Yellow
      entryX: 40,
      entryY: 260,
      exit: { x: 20, y: 240, width: 30, height: 60, targetShaftFloor: 5 },
      platforms: [
        { id: 'p5_floor', x: 0, y: 300, width: 640, height: 20 },
        { id: 'p5_tier1', x: 120, y: 230, width: 440, height: 16 },
        { id: 'p5_tier2', x: 180, y: 160, width: 320, height: 16 },
        { id: 'p5_tier3', x: 240, y: 90, width: 200, height: 16 }
      ],
      furniture: [
        { id: 'f5_1', x: 140, y: 182, width: 44, height: 48, type: 'computer', searched: false, contentType: 'piece', pieceIndex: 12 },
        { id: 'f5_2', x: 200, y: 112, width: 40, height: 48, type: 'console', searched: false, contentType: 'piece', pieceIndex: 13 },
        { id: 'f5_3', x: 300, y: 42, width: 44, height: 48, type: 'safe', searched: false, contentType: 'piece', pieceIndex: 14 },
        { id: 'f5_4', x: 460, y: 182, width: 40, height: 48, type: 'filing_cabinet', searched: false, contentType: 'snooze' }
      ],
      robots: [
        {
          id: 'r5_1',
          x: 300,
          y: 210,
          width: 24,
          height: 20,
          type: 'patrol',
          direction: 1,
          speed: 1.3,
          platformY: 210,
          minX: 130,
          maxX: 540,
          laserCharging: false,
          laserFiring: false,
          laserCooldown: 0,
          snoozedTimer: 0,
          animFrame: 0
        },
        {
          id: 'r5_2',
          x: 250,
          y: 140,
          width: 24,
          height: 20,
          type: 'dormant',
          direction: -1,
          speed: 1.5,
          platformY: 140,
          minX: 190,
          maxX: 480,
          laserCharging: false,
          laserFiring: false,
          laserCooldown: 0,
          snoozedTimer: 0,
          animFrame: 0
        }
      ],
      orb: {
        x: 500,
        y: 100,
        vx: 1.4,
        vy: 1.2,
        radius: 12,
        active: true
      }
    },

    // Room 6: Research Quarters (Floor 6)
    {
      id: 'room_6',
      name: 'Sector Zeta - Research Quarters',
      colorTheme: '#68a941', // C64 Green
      entryX: 40,
      entryY: 260,
      exit: { x: 20, y: 240, width: 30, height: 60, targetShaftFloor: 6 },
      platforms: [
        { id: 'p6_floor', x: 0, y: 300, width: 640, height: 20 },
        { id: 'p6_left', x: 80, y: 210, width: 220, height: 16 },
        { id: 'p6_right', x: 340, y: 210, width: 220, height: 16 },
        { id: 'p6_upper', x: 160, y: 120, width: 320, height: 16 },
        { id: 'p6_lift_h', x: 280, y: 210, width: 60, height: 12, isLift: true, liftAxis: 'horizontal', liftMin: 220, liftMax: 360, liftSpeed: 1.2, liftDir: 1 }
      ],
      furniture: [
        { id: 'f6_1', x: 100, y: 162, width: 44, height: 48, type: 'computer', searched: false, contentType: 'piece', pieceIndex: 15 },
        { id: 'f6_2', x: 200, y: 72, width: 40, height: 48, type: 'terminal', searched: false, contentType: 'piece', pieceIndex: 16 },
        { id: 'f6_3', x: 380, y: 162, width: 44, height: 48, type: 'desk', searched: false, contentType: 'piece', pieceIndex: 17 },
        { id: 'f6_4', x: 480, y: 162, width: 36, height: 48, type: 'filing_cabinet', searched: false, contentType: 'reset_lift' }
      ],
      robots: [
        {
          id: 'r6_1',
          x: 240,
          y: 190,
          width: 24,
          height: 20,
          type: 'zapper',
          direction: 1,
          speed: 0.9,
          platformY: 190,
          minX: 90,
          maxX: 290,
          laserCharging: false,
          laserFiring: false,
          laserCooldown: 80,
          snoozedTimer: 0,
          animFrame: 0
        },
        {
          id: 'r6_2',
          x: 400,
          y: 280,
          width: 24,
          height: 20,
          type: 'patrol',
          direction: -1,
          speed: 1.1,
          platformY: 280,
          minX: 80,
          maxX: 560,
          laserCharging: false,
          laserFiring: false,
          laserCooldown: 0,
          snoozedTimer: 0,
          animFrame: 0
        }
      ]
    },

    // Room 7: Control Outpost (Floor 7)
    {
      id: 'room_7',
      name: 'Sector Eta - Control Outpost',
      colorTheme: '#588dbe', // C64 Cyan
      entryX: 40,
      entryY: 260,
      exit: { x: 20, y: 240, width: 30, height: 60, targetShaftFloor: 7 },
      platforms: [
        { id: 'p7_f1', x: 0, y: 300, width: 260, height: 20 },
        { id: 'p7_f2', x: 380, y: 300, width: 260, height: 20 },
        { id: 'p7_m1', x: 100, y: 200, width: 180, height: 16 },
        { id: 'p7_m2', x: 360, y: 200, width: 180, height: 16 },
        { id: 'p7_top', x: 220, y: 110, width: 200, height: 16 },
        { id: 'p7_lift_v', x: 300, y: 250, width: 60, height: 12, isLift: true, liftAxis: 'vertical', liftMin: 110, liftMax: 300, liftSpeed: 1.3, liftDir: 1 }
      ],
      furniture: [
        { id: 'f7_1', x: 120, y: 152, width: 44, height: 48, type: 'computer', searched: false, contentType: 'piece', pieceIndex: 18 },
        { id: 'f7_2', x: 240, y: 62, width: 40, height: 48, type: 'console', searched: false, contentType: 'piece', pieceIndex: 19 },
        { id: 'f7_3', x: 420, y: 152, width: 40, height: 48, type: 'safe', searched: false, contentType: 'piece', pieceIndex: 20 },
        { id: 'f7_4', x: 500, y: 252, width: 40, height: 48, type: 'terminal', searched: false, contentType: 'snooze' }
      ],
      robots: [
        {
          id: 'r7_1',
          x: 180,
          y: 180,
          width: 24,
          height: 20,
          type: 'chaser',
          direction: 1,
          speed: 1.2,
          platformY: 180,
          minX: 110,
          maxX: 270,
          laserCharging: false,
          laserFiring: false,
          laserCooldown: 0,
          snoozedTimer: 0,
          animFrame: 0
        },
        {
          id: 'r7_2',
          x: 440,
          y: 180,
          width: 24,
          height: 20,
          type: 'zapper',
          direction: -1,
          speed: 0.9,
          platformY: 180,
          minX: 370,
          maxX: 530,
          laserCharging: false,
          laserFiring: false,
          laserCooldown: 70,
          snoozedTimer: 0,
          animFrame: 0
        }
      ]
    },

    // Room 8: Sub-Basement Archive (Floor 8)
    {
      id: 'room_8',
      name: 'Sector Theta - Sub-Basement Archive',
      colorTheme: '#8b6239', // C64 Brown
      entryX: 40,
      entryY: 260,
      exit: { x: 20, y: 240, width: 30, height: 60, targetShaftFloor: 8 },
      platforms: [
        { id: 'p8_floor', x: 0, y: 300, width: 640, height: 20 },
        { id: 'p8_tier1', x: 80, y: 220, width: 200, height: 16 },
        { id: 'p8_tier2', x: 360, y: 220, width: 200, height: 16 },
        { id: 'p8_tier3', x: 180, y: 130, width: 280, height: 16 }
      ],
      furniture: [
        { id: 'f8_1', x: 100, y: 172, width: 44, height: 48, type: 'computer', searched: false, contentType: 'piece', pieceIndex: 21 },
        { id: 'f8_2', x: 200, y: 82, width: 40, height: 48, type: 'filing_cabinet', searched: false, contentType: 'piece', pieceIndex: 22 },
        { id: 'f8_3', x: 380, y: 172, width: 40, height: 48, type: 'desk', searched: false, contentType: 'piece', pieceIndex: 23 },
        { id: 'f8_4', x: 500, y: 252, width: 40, height: 48, type: 'safe', searched: false, contentType: 'piece', pieceIndex: 24 }
      ],
      robots: [
        {
          id: 'r8_1',
          x: 200,
          y: 200,
          width: 24,
          height: 20,
          type: 'zapper',
          direction: 1,
          speed: 1.0,
          platformY: 200,
          minX: 90,
          maxX: 270,
          laserCharging: false,
          laserFiring: false,
          laserCooldown: 85,
          snoozedTimer: 0,
          animFrame: 0
        },
        {
          id: 'r8_2',
          x: 440,
          y: 200,
          width: 24,
          height: 20,
          type: 'chaser',
          direction: -1,
          speed: 1.3,
          platformY: 200,
          minX: 370,
          maxX: 550,
          laserCharging: false,
          laserFiring: false,
          laserCooldown: 0,
          snoozedTimer: 0,
          animFrame: 0
        }
      ],
      orb: {
        x: 320,
        y: 100,
        vx: 1.6,
        vy: 1.1,
        radius: 12,
        active: true
      }
    }
  ];
}
