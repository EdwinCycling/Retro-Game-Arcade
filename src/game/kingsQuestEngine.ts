/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * King's Quest I: Quest for the Crown (1984, Sierra On-Line)
 * Core Adventure Game Engine
 */

import { RoomId, ItemId, GrahamState, Direction } from './kingsQuestTypes';
import { ROOMS_DATA } from './kingsQuestRooms';
import { KingsQuestParser } from './kingsQuestParser';
import { kingsQuestAudio } from './kingsQuestAudio';
import { saveGameSlot, loadGameSlot, SavedGame } from './kingsQuestHighScores';

export class KingsQuestEngine {
  public currentRoom: RoomId = 'CASTLE_GATES';
  public score: number = 0;
  public maxScore: number = 158;
  public soundEnabled: boolean = true;
  public lang: 'nl' | 'en' = 'nl';

  public graham: GrahamState = {
    x: 160,
    y: 135,
    direction: 'IDLE',
    animFrame: 0,
    isWalking: false,
    isClimbing: false,
    isDead: false,
    deathReason: '',
    deathReasonNl: '',
    isVictorious: false,
    isCarryingGoat: false,
    hasFairyProtection: false,
    fairyTimer: 0
  };

  public inventory: ItemId[] = [];
  public roomItems: Record<RoomId, ItemId[]> = {
    CASTLE_GATES: [],
    CASTLE_GARDEN: ['CARROT'],
    GREAT_OAK: ['GOLDEN_EGG', 'DAGGER'],
    WISHING_WELL: ['BUCKET'],
    CLOVER_PATCH: ['FOUR_LEAF_CLOVER'],
    WALNUT_TREE: ['WALNUT'],
    TROLL_BRIDGE: [],
    GOAT_PEN: ['SLINGSHOT'],
    GINGERBREAD_HOUSE: ['CHEESE'],
    GNOME_FIELD: [],
    FERTILE_GROUND: [],
    SKY_CLOUDS: ['MAGIC_SHIELD'],
    DRAGON_CAVE: ['MAGIC_MIRROR'],
    LEPRECHAUN_HALL: ['MAGIC_CHEST', 'MAGIC_MUSHROOM', 'FIDDLE'],
    THRONE_ROOM: []
  };

  public milestones: Record<string, boolean> = {};
  public messageLog: { text: string; isPlayer?: boolean; isSystem?: boolean }[] = [
    {
      text: 'Welkom in Daventry! Gebruik de pijltjestoetsen om Sir Graham te besturen en typ commando’s.',
      isSystem: true
    }
  ];

  public currentInput: string = '';
  public commandHistory: string[] = [];
  public historyIndex: number = -1;

  private parser = new KingsQuestParser();
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
    this.currentRoom = 'CASTLE_GATES';
    this.score = 0;
    this.inventory = [];
    this.milestones = {};
    this.graham = {
      x: 160,
      y: 135,
      direction: 'IDLE',
      animFrame: 0,
      isWalking: false,
      isClimbing: false,
      isDead: false,
      deathReason: '',
      deathReasonNl: '',
      isVictorious: false,
      isCarryingGoat: false,
      hasFairyProtection: false,
      fairyTimer: 0
    };

    // Reset room items
    this.roomItems = {
      CASTLE_GATES: [],
      CASTLE_GARDEN: ['CARROT'],
      GREAT_OAK: ['GOLDEN_EGG', 'DAGGER'],
      WISHING_WELL: ['BUCKET'],
      CLOVER_PATCH: ['FOUR_LEAF_CLOVER'],
      WALNUT_TREE: ['WALNUT'],
      TROLL_BRIDGE: [],
      GOAT_PEN: ['SLINGSHOT'],
      GINGERBREAD_HOUSE: ['CHEESE'],
      GNOME_FIELD: [],
      FERTILE_GROUND: [],
      SKY_CLOUDS: ['MAGIC_SHIELD'],
      DRAGON_CAVE: ['MAGIC_MIRROR'],
      LEPRECHAUN_HALL: ['MAGIC_CHEST', 'MAGIC_MUSHROOM', 'FIDDLE'],
      THRONE_ROOM: []
    };

    this.messageLog = [
      {
        text: this.lang === 'nl'
          ? 'Koning Edward is stervende. Vind de drie Verloren Schatten van Daventry om de troon te erven!'
          : 'King Edward is dying. Retrieve the three Lost Treasures of Daventry to inherit the crown!',
        isSystem: true
      }
    ];

    kingsQuestAudio.playFanfare();
    this.notify();
  }

  public setLang(newLang: 'nl' | 'en') {
    this.lang = newLang;
    this.notify();
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    kingsQuestAudio.setMuted(!this.soundEnabled);
    this.notify();
    return this.soundEnabled;
  }

  public submitInput(input?: string) {
    const raw = (input !== undefined ? input : this.currentInput).trim();
    if (!raw) return;

    // Add to history
    this.commandHistory.push(raw);
    this.historyIndex = this.commandHistory.length;

    // Log user command
    this.messageLog.push({ text: `> ${raw}`, isPlayer: true });
    this.currentInput = '';

    // Play retro key click
    kingsQuestAudio.playKeyClick();

    // Parse and execute
    const result = this.parser.parseCommand(
      raw,
      this.currentRoom,
      this.inventory,
      this.roomItems[this.currentRoom] || [],
      this.milestones
    );

    // Apply audio
    if (result.playAudio) {
      switch (result.playAudio) {
        case 'triumph': kingsQuestAudio.playTriumph(); break;
        case 'pickup': kingsQuestAudio.playPickup(); break;
        case 'fiddle': kingsQuestAudio.playFiddleJig(); break;
        case 'dragon': kingsQuestAudio.playDragonDanger(); break;
        case 'fanfare': kingsQuestAudio.playFanfare(); break;
        case 'death': kingsQuestAudio.playDeath(); break;
      }
    }

    // Award points
    if (result.pointsEarned) {
      this.score = Math.min(this.maxScore, this.score + result.pointsEarned);
    }

    // Handle Item Taken
    if (result.action === 'ITEM_TAKEN' && result.targetItem) {
      if (!this.inventory.includes(result.targetItem)) {
        this.inventory.push(result.targetItem);
      }
      // Remove from room
      this.roomItems[this.currentRoom] = (this.roomItems[this.currentRoom] || []).filter(
        (id) => id !== result.targetItem
      );
    }

    // Handle Item Used / Transform
    if (result.action === 'ITEM_USED' && result.targetItem) {
      if (result.targetItem === 'GOLD_WALNUT') {
        this.inventory = this.inventory.filter((id) => id !== 'WALNUT');
        if (!this.inventory.includes('GOLD_WALNUT')) {
          this.inventory.push('GOLD_WALNUT');
        }
      }
      if (result.targetItem === 'MAGIC_BEANS') {
        this.inventory = this.inventory.filter((id) => id !== 'MAGIC_BEANS');
      }
      if (result.targetItem === 'WATER_BUCKET') {
        this.inventory = this.inventory.filter((id) => id !== 'WATER_BUCKET');
        this.inventory.push('BUCKET');
      }
    }

    // Handle Room Changed
    if (result.action === 'ROOM_CHANGED' && result.targetRoom) {
      this.transitionToRoom(result.targetRoom);
    }

    // Handle Victory
    if (result.action === 'VICTORY') {
      this.graham.isVictorious = true;
    }

    // Log response
    const reply = result.message[this.lang];
    this.messageLog.push({ text: reply, isSystem: true });

    // Keep log to last 15 entries
    if (this.messageLog.length > 15) {
      this.messageLog = this.messageLog.slice(-15);
    }

    this.notify();
  }

  public hasAllTreasures(): boolean {
    return (
      this.inventory.includes('MAGIC_SHIELD') &&
      this.inventory.includes('MAGIC_MIRROR') &&
      this.inventory.includes('MAGIC_CHEST')
    );
  }

  public moveGraham(dir: Direction, speed: number = 3.5) {
    if (this.graham.isDead || this.graham.isVictorious) return;

    this.graham.direction = dir;
    this.graham.isWalking = true;
    this.graham.animFrame = (this.graham.animFrame + 1) % 4;

    this.stepTimer++;
    if (this.stepTimer % 4 === 0) {
      kingsQuestAudio.playStep();
    }

    let nextX = this.graham.x;
    let nextY = this.graham.y;

    switch (dir) {
      case 'NORTH': nextY -= speed; break;
      case 'SOUTH': nextY += speed; break;
      case 'EAST': nextX += speed; break;
      case 'WEST': nextX -= speed; break;
    }

    // Special Room Specific Gate & Door Transitions
    if (this.currentRoom === 'CASTLE_GATES') {
      // Trying to enter Castle Gate (drawbridge at x: 135..185)
      if (nextY <= 82) {
        if (nextX >= 140 && nextX <= 180) {
          if (this.hasAllTreasures()) {
            this.transitionToRoom('THRONE_ROOM', 160, 150);
            return;
          } else {
            // Portcullis is barred until treasures are found
            nextY = 84;
          }
        } else {
          // Solid stone castle walls block completely
          nextY = 84;
        }
      }

      // Left and right alligator moat
      if (nextY >= 78 && nextY <= 104) {
        if (nextX < 135 || nextX > 185) {
          return; // Moat water blocks
        }
      }
    }

    if (this.currentRoom === 'THRONE_ROOM') {
      // Exit throne room to castle gate
      if (nextY > 165) {
        this.transitionToRoom('CASTLE_GATES', 160, 88);
        return;
      }
      // King's dais blocking
      if (nextY < 80) {
        nextY = 80;
      }
    }

    if (this.currentRoom === 'TROLL_BRIDGE' && !this.milestones['TROLL_DEFEATED']) {
      // River Troll blocks crossing bridge
      if (nextX >= 125 && nextX <= 195 && nextY >= 90 && nextY <= 118) {
        return; // Troll blocks
      }
    }

    // Screen Boundary Transitions (wrap or move to adjacent screen)
    const currentRoomDef = ROOMS_DATA[this.currentRoom];

    if (nextY < 20) {
      if (currentRoomDef?.north) {
        this.transitionToRoom(currentRoomDef.north, nextX, 160);
        return;
      } else {
        nextY = 20; // Block
      }
    } else if (nextY > 165) {
      if (currentRoomDef?.south) {
        this.transitionToRoom(currentRoomDef.south, nextX, 25);
        return;
      } else {
        nextY = 165; // Block
      }
    }

    if (nextX < 10) {
      if (currentRoomDef?.west) {
        this.transitionToRoom(currentRoomDef.west, 305, nextY);
        return;
      } else {
        nextX = 10; // Block
      }
    } else if (nextX > 310) {
      if (currentRoomDef?.east) {
        this.transitionToRoom(currentRoomDef.east, 15, nextY);
        return;
      } else {
        nextX = 310; // Block
      }
    }

    // Check Obstacle Collisions
    const obstacles = currentRoomDef?.obstacles || [];
    let isBlocked = false;
    for (const obs of obstacles) {
      if (
        nextX >= obs.x &&
        nextX <= obs.x + obs.width &&
        nextY >= obs.y &&
        nextY <= obs.y + obs.height
      ) {
        if (obs.type === 'solid' || obs.type === 'water') {
          isBlocked = true;
          break;
        }
      }
    }

    if (!isBlocked) {
      this.graham.x = nextX;
      this.graham.y = nextY;
    }

    this.notify();
  }

  public stopGraham() {
    this.graham.isWalking = false;
    this.graham.direction = 'IDLE';
    this.notify();
  }

  private transitionToRoom(roomId: RoomId, startX?: number, startY?: number) {
    this.currentRoom = roomId;
    if (startX !== undefined) this.graham.x = startX;
    if (startY !== undefined) this.graham.y = startY;

    const roomDef = ROOMS_DATA[roomId];
    if (roomDef && !roomDef.visited) {
      roomDef.visited = true;
      this.score = Math.min(this.maxScore, this.score + 1);
    }

    // Log arrival
    if (roomDef) {
      this.messageLog.push({
        text: `[${roomDef.title[this.lang]}] ${roomDef.description[this.lang]}`,
        isSystem: true
      });
    }

    kingsQuestAudio.playTone(400, 0.05, 0.08);
    this.notify();
  }

  public saveToSlot(slot: number, name: string): boolean {
    kingsQuestAudio.playFloppySeek();
    const saveState: SavedGame = {
      slot,
      name: name || `Daventry Slot ${slot + 1}`,
      date: new Date().toLocaleDateString(),
      score: this.score,
      currentRoom: this.currentRoom,
      graham: { ...this.graham },
      inventory: [...this.inventory],
      milestones: { ...this.milestones },
      roomItems: JSON.parse(JSON.stringify(this.roomItems))
    };
    return saveGameSlot(slot, saveState);
  }

  public loadFromSlot(slot: number): boolean {
    kingsQuestAudio.playFloppySeek();
    const saved = loadGameSlot(slot);
    if (!saved) return false;

    this.score = saved.score;
    this.currentRoom = saved.currentRoom;
    this.graham = { ...saved.graham };
    this.inventory = [...saved.inventory];
    this.milestones = { ...saved.milestones };
    this.roomItems = saved.roomItems;

    this.messageLog.push({
      text: this.lang === 'nl'
        ? `Spel succesvol geladen vanaf diskette [Slot ${slot + 1}]!`
        : `Game successfully restored from diskette [Slot ${slot + 1}]!`,
      isSystem: true
    });

    kingsQuestAudio.playTriumph();
    this.notify();
    return true;
  }
}
