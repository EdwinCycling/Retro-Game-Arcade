/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Space Quest I: The Sarien Encounter (1986, Sierra On-Line)
 * Core Adventure Game Engine
 */

import { SQRoomId, SQItemId, RogerState, SQDirection } from './spaceQuestTypes';
import { SQ_ROOMS_DATA } from './spaceQuestRooms';
import { SpaceQuestParser } from './spaceQuestParser';
import { spaceQuestAudio } from './spaceQuestAudio';
import { saveSQGameSlot, loadSQGameSlot } from './spaceQuestHighScores';

export class SpaceQuestEngine {
  public currentRoom: SQRoomId = 'JANITOR_CLOSET';
  public score: number = 0;
  public maxScore: number = 185;
  public soundEnabled: boolean = true;
  public lang: 'nl' | 'en' = 'nl';

  public roger: RogerState = {
    x: 140,
    y: 120,
    direction: 'IDLE',
    animFrame: 0,
    isWalking: false,
    isDead: false,
    deathReason: '',
    deathReasonNl: '',
    isVictorious: false
  };

  public inventory: SQItemId[] = [];
  public roomItems: Record<SQRoomId, SQItemId[]> = {
    JANITOR_CLOSET: ['BROOM'],
    STARBOARD_HALL: ['KEYCARD'],
    DATA_ARCHIVE: ['CARTRIDGE'],
    ESCAPE_POD_BAY: ['SURVIVAL_KIT'],
    DEEP_SPACE: [],
    KERONA_CRASH: ['GLASS_SHARD', 'DEHYDRATED_WATER'],
    KERONA_CANYON: [],
    ORAT_CAVERN: [],
    UNDERGROUND_LAB: ['GADGET'],
    SKIMMER_LANDING: []
  };

  public milestones: Record<string, boolean> = {};
  public messageLog: { text: string; isPlayer?: boolean; isSystem?: boolean }[] = [
    {
      text: 'Welkom aan boord van het onderzoeksschip Arcada! Bestuur Roger Wilco met de pijltjestoetsen of typ commando’s.',
      isSystem: true
    }
  ];

  public currentInput: string = '';
  public commandHistory: string[] = [];
  public historyIndex: number = -1;

  private parser = new SpaceQuestParser();
  private listeners: (() => void)[] = [];
  private stepTimer: number = 0;

  constructor() {
    this.resetGame();
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public resetGame() {
    this.currentRoom = 'JANITOR_CLOSET';
    this.score = 0;
    this.inventory = [];
    this.milestones = {};
    this.roomItems = {
      JANITOR_CLOSET: ['BROOM'],
      STARBOARD_HALL: ['KEYCARD'],
      DATA_ARCHIVE: ['CARTRIDGE'],
      ESCAPE_POD_BAY: ['SURVIVAL_KIT'],
      DEEP_SPACE: [],
      KERONA_CRASH: ['GLASS_SHARD', 'DEHYDRATED_WATER'],
      KERONA_CANYON: [],
      ORAT_CAVERN: [],
      UNDERGROUND_LAB: ['GADGET'],
      SKIMMER_LANDING: []
    };
    this.roger = {
      x: 140,
      y: 120,
      direction: 'IDLE',
      animFrame: 0,
      isWalking: false,
      isDead: false,
      deathReason: '',
      deathReasonNl: '',
      isVictorious: false
    };
    this.messageLog = [
      {
        text:
          this.lang === 'nl'
            ? 'Welkom aan boord van het onderzoeksschip Arcada! Bestuur Roger Wilco met de pijltjestoetsen of typ commando’s.'
            : 'Welcome aboard the Research Vessel Arcada! Steer Roger Wilco using Arrow Keys or type commands.',
        isSystem: true
      }
    ];
    this.currentInput = '';
    this.notify();
  }

  public setLang(lang: 'nl' | 'en') {
    this.lang = lang;
    this.notify();
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    spaceQuestAudio.setMuted(!this.soundEnabled);
    this.notify();
    return this.soundEnabled;
  }

  public submitCommand(rawText: string) {
    const text = rawText.trim();
    if (!text) return;

    this.commandHistory.push(text);
    this.historyIndex = this.commandHistory.length;

    this.messageLog.push({ text: `> ${text}`, isPlayer: true });

    const currentItems = this.roomItems[this.currentRoom] || [];
    const result = this.parser.parseCommand(
      text,
      this.currentRoom,
      this.inventory,
      currentItems,
      this.milestones
    );

    const reply = this.lang === 'nl' ? result.message.nl : result.message.en;
    this.messageLog.push({ text: reply, isSystem: false });

    if (result.pointsEarned) {
      this.score += result.pointsEarned;
    }

    if (result.targetItem && result.action === 'ITEM_TAKEN') {
      this.inventory.push(result.targetItem);
      this.roomItems[this.currentRoom] = this.roomItems[this.currentRoom].filter(
        (i) => i !== result.targetItem
      );
    }

    if (result.targetItem === 'GLASS_SHARD' && result.action === 'ITEM_USED') {
      // Orat defeated, spawns pulser pistol
      this.roomItems['ORAT_CAVERN'].push('PULSER_PISTOL');
    }

    if (result.action === 'ROOM_CHANGED' && result.targetRoom) {
      this.transitionToRoom(result.targetRoom, 160, 130);
    }

    if (result.action === 'VICTORY') {
      this.roger.isVictorious = true;
    }

    if (result.playAudio && this.soundEnabled) {
      switch (result.playAudio) {
        case 'laser': spaceQuestAudio.playLaser(); break;
        case 'klaxon': spaceQuestAudio.playKlaxon(); break;
        case 'thruster': spaceQuestAudio.playThrusters(); break;
        case 'pickup': spaceQuestAudio.playPickup(); break;
        case 'fanfare': spaceQuestAudio.playThemeFanfare(); break;
      }
    }

    this.currentInput = '';
    this.notify();
  }

  public moveRoger(dir: SQDirection, speed: number = 3.5) {
    if (this.roger.isDead || this.roger.isVictorious) return;

    this.roger.direction = dir;
    this.roger.isWalking = true;
    this.roger.animFrame = (this.roger.animFrame + 1) % 4;

    this.stepTimer++;
    if (this.stepTimer % 4 === 0) {
      spaceQuestAudio.playStep();
    }

    let nextX = this.roger.x;
    let nextY = this.roger.y;

    switch (dir) {
      case 'NORTH': nextY -= speed; break;
      case 'SOUTH': nextY += speed; break;
      case 'EAST': nextX += speed; break;
      case 'WEST': nextX -= speed; break;
    }

    const currentRoomDef = SQ_ROOMS_DATA[this.currentRoom];

    // Screen Boundary Transitions
    if (nextY < 20) {
      if (currentRoomDef?.north) {
        this.transitionToRoom(currentRoomDef.north, nextX, 160);
        return;
      } else {
        nextY = 20;
      }
    } else if (nextY > 165) {
      if (currentRoomDef?.south) {
        this.transitionToRoom(currentRoomDef.south, nextX, 25);
        return;
      } else {
        nextY = 165;
      }
    }

    if (nextX < 10) {
      if (currentRoomDef?.west) {
        this.transitionToRoom(currentRoomDef.west, 305, nextY);
        return;
      } else {
        nextX = 10;
      }
    } else if (nextX > 310) {
      if (currentRoomDef?.east) {
        this.transitionToRoom(currentRoomDef.east, 15, nextY);
        return;
      } else {
        nextX = 310;
      }
    }

    // Check Obstacles
    const obstacles = currentRoomDef?.obstacles || [];
    let isBlocked = false;
    for (const obs of obstacles) {
      if (
        nextX >= obs.x &&
        nextX <= obs.x + obs.width &&
        nextY >= obs.y &&
        nextY <= obs.y + obs.height
      ) {
        isBlocked = true;
        break;
      }
    }

    if (!isBlocked) {
      this.roger.x = nextX;
      this.roger.y = nextY;
    }

    this.notify();
  }

  public stopRoger() {
    this.roger.isWalking = false;
    this.roger.direction = 'IDLE';
    this.notify();
  }

  public transitionToRoom(roomId: SQRoomId, startX?: number, startY?: number) {
    this.currentRoom = roomId;
    if (startX !== undefined) this.roger.x = startX;
    if (startY !== undefined) this.roger.y = startY;

    if (!SQ_ROOMS_DATA[roomId].visited) {
      SQ_ROOMS_DATA[roomId].visited = true;
      this.score += 2;
    }

    const desc = this.lang === 'nl' ? SQ_ROOMS_DATA[roomId].description.nl : SQ_ROOMS_DATA[roomId].description.en;
    this.messageLog.push({ text: desc, isSystem: true });

    this.notify();
  }

  public saveGame(slotId: number) {
    saveSQGameSlot(slotId, {
      room: this.currentRoom,
      score: this.score,
      inventory: [...this.inventory],
      roger: { ...this.roger },
      milestones: { ...this.milestones },
      roomItems: { ...this.roomItems }
    });
    this.messageLog.push({
      text: this.lang === 'nl' ? `Spel opgeslagen in slot #${slotId} op virtuele diskette.` : `Game saved to slot #${slotId} on virtual floppy disk.`,
      isSystem: true
    });
    this.notify();
  }

  public loadGame(slotId: number) {
    const data = loadSQGameSlot(slotId);
    if (!data) return;

    this.currentRoom = data.room;
    this.score = data.score;
    this.inventory = [...data.inventory];
    this.roger = { ...data.roger };
    this.milestones = { ...data.milestones };
    this.roomItems = { ...data.roomItems };

    this.messageLog.push({
      text: this.lang === 'nl' ? `Spel geladen uit slot #${slotId}!` : `Game loaded from slot #${slotId}!`,
      isSystem: true
    });
    this.notify();
  }
}
