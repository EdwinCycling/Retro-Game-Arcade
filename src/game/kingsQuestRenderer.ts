/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * King's Quest I: Quest for the Crown (1984, Roberta Williams / Sierra On-Line)
 * Authentic 16-Color PCjr / Tandy 320x200 CRT Canvas Renderer
 */

import { RoomId, GrahamState, RoomActor } from './kingsQuestTypes';
import { ROOMS_DATA } from './kingsQuestRooms';

export const PCJR_PALETTE = {
  BLACK: '#000000',
  BLUE: '#0000aa',
  GREEN: '#00aa00',
  CYAN: '#00aaaa',
  RED: '#aa0000',
  MAGENTA: '#aa00aa',
  BROWN: '#aa5500',
  LIGHT_GRAY: '#aaaaaa',
  DARK_GRAY: '#555555',
  LIGHT_BLUE: '#5555ff',
  LIGHT_GREEN: '#55ff55',
  LIGHT_CYAN: '#55ffff',
  LIGHT_RED: '#ff5555',
  LIGHT_MAGENTA: '#ff55ff',
  YELLOW: '#ffff55',
  WHITE: '#ffffff'
};

export class KingsQuestRenderer {
  public colorMode: 'PCJR' | 'CGA' | 'AMBER' | 'GREEN' = 'PCJR';
  public hasAllTreasures: boolean = false;

  public setColorMode(mode: 'PCJR' | 'CGA' | 'AMBER' | 'GREEN') {
    this.colorMode = mode;
  }

  public setHasAllTreasures(unlocked: boolean) {
    this.hasAllTreasures = unlocked;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentRoom: RoomId,
    graham: GrahamState,
    score: number,
    soundEnabled: boolean,
    lang: 'nl' | 'en',
    inputPrompt: string,
    messageLog: { text: string; isPlayer?: boolean; isSystem?: boolean }[]
  ) {
    // 1. Clear with Black
    ctx.fillStyle = PCJR_PALETTE.BLACK;
    ctx.fillRect(0, 0, width, height);

    // Save and scale to virtual 320x200 AGI coordinates
    ctx.save();
    const scaleX = width / 320;
    const scaleY = height / 200;
    ctx.scale(scaleX, scaleY);

    // 2. Draw Top Sierra Status Bar (Height: 10px)
    this.renderStatusBar(ctx, score, soundEnabled, currentRoom, lang);

    // 3. Draw Room Background & Scenery (Y: 10 to 170)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 10, 320, 160);
    ctx.clip();
    this.renderRoomScenery(ctx, currentRoom);
    this.renderActors(ctx, currentRoom);
    this.renderGraham(ctx, graham);
    ctx.restore();

    // 4. Draw Bottom Text Parser Strip & Dialog (Y: 170 to 200)
    this.renderParserPrompt(ctx, inputPrompt, messageLog);

    ctx.restore();

    // 5. Authentic CRT Palette Post-Processing (CGA 4-color / Amber / Green)
    if (this.colorMode !== 'PCJR') {
      this.applyColorFilter(ctx, width, height);
    }
  }

  private applyColorFilter(ctx: CanvasRenderingContext2D, width: number, height: number) {
    try {
      const imgData = ctx.getImageData(0, 0, width, height);
      const d = imgData.data;
      const mode = this.colorMode;

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        const a = d[i + 3];
        if (a === 0) continue;

        if (mode === 'CGA') {
          // Authentic IBM CGA Mode 4 Palette 1: Black, Cyan, Magenta, White
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (lum < 35) {
            d[i] = 0; d[i + 1] = 0; d[i + 2] = 0;
          } else if (r > g + 10 && r > b - 20) {
            // Warm tones map to authentic CGA Magenta #FF55FF
            d[i] = 255; d[i + 1] = 85; d[i + 2] = 255;
          } else if (lum > 185) {
            // High luminance maps to CGA White #FFFFFF
            d[i] = 255; d[i + 1] = 255; d[i + 2] = 255;
          } else {
            // Cool tones map to authentic CGA Cyan #55FFFF
            d[i] = 85; d[i + 1] = 255; d[i + 2] = 255;
          }
        } else if (mode === 'AMBER') {
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          d[i] = Math.min(255, Math.round(lum * 255));
          d[i + 1] = Math.min(255, Math.round(lum * 176));
          d[i + 2] = 0;
        } else if (mode === 'GREEN') {
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          d[i] = Math.min(255, Math.round(lum * 40));
          d[i + 1] = Math.min(255, Math.round(lum * 255));
          d[i + 2] = Math.min(255, Math.round(lum * 40));
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } catch {
      // Fallback in case of context error
    }
  }

  private renderStatusBar(
    ctx: CanvasRenderingContext2D,
    score: number,
    soundEnabled: boolean,
    currentRoom: RoomId,
    lang: 'nl' | 'en'
  ) {
    ctx.fillStyle = PCJR_PALETTE.WHITE;
    ctx.fillRect(0, 0, 320, 10);

    ctx.fillStyle = PCJR_PALETTE.BLACK;
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score} of 158`, 4, 8);

    const roomTitle = ROOMS_DATA[currentRoom]?.title[lang] || currentRoom;
    ctx.textAlign = 'center';
    ctx.fillText(roomTitle.toUpperCase().slice(0, 30), 160, 8);

    ctx.textAlign = 'right';
    ctx.fillText(`Sound: ${soundEnabled ? 'ON' : 'OFF'}`, 316, 8);
  }

  private renderRoomScenery(ctx: CanvasRenderingContext2D, room: RoomId) {
    switch (room) {
      case 'CASTLE_GATES':
        this.drawCastleGates(ctx);
        break;
      case 'CASTLE_GARDEN':
        this.drawCastleGarden(ctx);
        break;
      case 'GREAT_OAK':
        this.drawGreatOak(ctx);
        break;
      case 'WISHING_WELL':
        this.drawWishingWell(ctx);
        break;
      case 'CLOVER_PATCH':
        this.drawCloverPatch(ctx);
        break;
      case 'WALNUT_TREE':
        this.drawWalnutTree(ctx);
        break;
      case 'TROLL_BRIDGE':
        this.drawTrollBridge(ctx);
        break;
      case 'GOAT_PEN':
        this.drawGoatPen(ctx);
        break;
      case 'GINGERBREAD_HOUSE':
        this.drawGingerbreadHouse(ctx);
        break;
      case 'GNOME_FIELD':
        this.drawGnomeField(ctx);
        break;
      case 'FERTILE_GROUND':
        this.drawFertileGround(ctx);
        break;
      case 'SKY_CLOUDS':
        this.drawSkyClouds(ctx);
        break;
      case 'DRAGON_CAVE':
        this.drawDragonCave(ctx);
        break;
      case 'LEPRECHAUN_HALL':
        this.drawLeprechaunHall(ctx);
        break;
      case 'THRONE_ROOM':
        this.drawThroneRoom(ctx);
        break;
    }
  }

  private drawCastleGates(ctx: CanvasRenderingContext2D) {
    // Sky
    ctx.fillStyle = PCJR_PALETTE.LIGHT_BLUE;
    ctx.fillRect(0, 10, 320, 70);

    // Sun & Clouds
    ctx.fillStyle = PCJR_PALETTE.YELLOW;
    ctx.beginPath();
    ctx.arc(280, 30, 12, 0, Math.PI * 2);
    ctx.fill();

    // Distant Mountains
    ctx.fillStyle = PCJR_PALETTE.MAGENTA;
    ctx.beginPath();
    ctx.moveTo(0, 60);
    ctx.lineTo(60, 35);
    ctx.lineTo(120, 60);
    ctx.lineTo(200, 30);
    ctx.lineTo(270, 65);
    ctx.lineTo(320, 50);
    ctx.lineTo(320, 80);
    ctx.lineTo(0, 80);
    ctx.fill();

    // Grass Field
    ctx.fillStyle = PCJR_PALETTE.GREEN;
    ctx.fillRect(0, 70, 320, 100);

    // Castle Stone Walls
    ctx.fillStyle = PCJR_PALETTE.LIGHT_GRAY;
    ctx.fillRect(20, 25, 280, 55);

    // Battlements / Crenels
    ctx.fillStyle = PCJR_PALETTE.DARK_GRAY;
    for (let x = 20; x <= 280; x += 20) {
      ctx.fillRect(x, 20, 12, 8);
    }

    // Towers
    ctx.fillStyle = PCJR_PALETTE.LIGHT_GRAY;
    ctx.fillRect(15, 12, 35, 70);
    ctx.fillRect(270, 12, 35, 70);
    ctx.fillStyle = PCJR_PALETTE.RED;
    // Tower roofs
    ctx.beginPath();
    ctx.moveTo(10, 12);
    ctx.lineTo(32, 2);
    ctx.lineTo(55, 12);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(265, 12);
    ctx.lineTo(287, 2);
    ctx.lineTo(310, 12);
    ctx.fill();

    // Castle Gate Archway
    ctx.fillStyle = PCJR_PALETTE.BLACK;
    ctx.beginPath();
    ctx.arc(160, 60, 22, Math.PI, 0);
    ctx.lineTo(182, 80);
    ctx.lineTo(138, 80);
    ctx.fill();

    // Portcullis Iron Bars (Raised when treasures returned, lowered when barred)
    ctx.strokeStyle = PCJR_PALETTE.DARK_GRAY;
    ctx.lineWidth = 1.5;
    const portcullisBottom = this.hasAllTreasures ? 48 : 78;
    for (let x = 142; x <= 178; x += 6) {
      ctx.beginPath();
      ctx.moveTo(x, 42);
      ctx.lineTo(x, portcullisBottom);
      ctx.stroke();
    }

    // Deep Moat with Water
    ctx.fillStyle = PCJR_PALETTE.BLUE;
    ctx.fillRect(0, 80, 320, 22);

    // Drawbridge
    ctx.fillStyle = PCJR_PALETTE.BROWN;
    ctx.fillRect(135, 78, 50, 26);
    ctx.strokeStyle = PCJR_PALETTE.BLACK;
    ctx.lineWidth = 1;
    ctx.strokeRect(135, 78, 50, 26);
    // Planks
    for (let y = 82; y <= 100; y += 4) {
      ctx.beginPath();
      ctx.moveTo(135, y);
      ctx.lineTo(185, y);
      ctx.stroke();
    }

    // Green Moat Banks
    ctx.fillStyle = PCJR_PALETTE.LIGHT_GREEN;
    ctx.fillRect(0, 102, 320, 68);

    // Draw Royal Guards
    this.drawSpriteGuard(ctx, 115, 85);
    this.drawSpriteGuard(ctx, 195, 85);
  }

  private drawCastleGarden(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = PCJR_PALETTE.LIGHT_BLUE;
    ctx.fillRect(0, 10, 320, 50);

    // High Castle Wall on Left
    ctx.fillStyle = PCJR_PALETTE.LIGHT_GRAY;
    ctx.fillRect(0, 10, 80, 90);
    ctx.fillStyle = PCJR_PALETTE.DARK_GRAY;
    for (let y = 20; y <= 90; y += 12) {
      ctx.fillRect(0, y, 80, 2);
    }

    // Green Garden Lawn
    ctx.fillStyle = PCJR_PALETTE.LIGHT_GREEN;
    ctx.fillRect(0, 60, 320, 110);

    // Flower patches
    const flowers = [
      { x: 100, y: 80, c: PCJR_PALETTE.LIGHT_RED },
      { x: 130, y: 95, c: PCJR_PALETTE.YELLOW },
      { x: 160, y: 75, c: PCJR_PALETTE.LIGHT_MAGENTA },
      { x: 190, y: 110, c: PCJR_PALETTE.WHITE },
      { x: 230, y: 85, c: PCJR_PALETTE.LIGHT_RED },
      { x: 270, y: 105, c: PCJR_PALETTE.YELLOW }
    ];
    flowers.forEach((f) => {
      ctx.fillStyle = f.c;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Carrot Patch with Dark Soil
    ctx.fillStyle = PCJR_PALETTE.BROWN;
    ctx.fillRect(200, 120, 90, 35);
    ctx.strokeStyle = PCJR_PALETTE.BLACK;
    ctx.strokeRect(200, 120, 90, 35);

    // Carrot tops
    ctx.fillStyle = PCJR_PALETTE.GREEN;
    for (let x = 215; x <= 275; x += 15) {
      ctx.beginPath();
      ctx.moveTo(x, 130);
      ctx.lineTo(x - 3, 122);
      ctx.lineTo(x + 3, 122);
      ctx.fill();
    }
  }

  private drawGreatOak(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = PCJR_PALETTE.LIGHT_BLUE;
    ctx.fillRect(0, 10, 320, 80);

    ctx.fillStyle = PCJR_PALETTE.GREEN;
    ctx.fillRect(0, 80, 320, 90);

    // Oak Tree Trunk
    ctx.fillStyle = PCJR_PALETTE.BROWN;
    ctx.beginPath();
    ctx.moveTo(135, 165);
    ctx.lineTo(145, 60);
    ctx.lineTo(175, 60);
    ctx.lineTo(185, 165);
    ctx.fill();

    // Sprawling Roots
    ctx.beginPath();
    ctx.moveTo(135, 165);
    ctx.lineTo(110, 170);
    ctx.lineTo(145, 155);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(185, 165);
    ctx.lineTo(210, 170);
    ctx.lineTo(175, 155);
    ctx.fill();

    // Massive Green Foliage
    ctx.fillStyle = PCJR_PALETTE.LIGHT_GREEN;
    ctx.beginPath();
    ctx.arc(160, 45, 65, 0, Math.PI * 2);
    ctx.arc(115, 55, 45, 0, Math.PI * 2);
    ctx.arc(205, 55, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PCJR_PALETTE.GREEN;
    ctx.beginPath();
    ctx.arc(160, 50, 45, 0, Math.PI * 2);
    ctx.fill();

    // Bird's Nest with Golden Egg
    ctx.fillStyle = PCJR_PALETTE.BROWN;
    ctx.fillRect(180, 40, 16, 8);
    ctx.fillStyle = PCJR_PALETTE.YELLOW;
    ctx.beginPath();
    ctx.arc(188, 38, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawWishingWell(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = PCJR_PALETTE.LIGHT_BLUE;
    ctx.fillRect(0, 10, 320, 80);

    ctx.fillStyle = PCJR_PALETTE.LIGHT_GREEN;
    ctx.fillRect(0, 80, 320, 90);

    // Stone Circular Well
    ctx.fillStyle = PCJR_PALETTE.LIGHT_GRAY;
    ctx.beginPath();
    ctx.ellipse(160, 115, 36, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(124, 115, 72, 25);
    ctx.beginPath();
    ctx.ellipse(160, 140, 36, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark Well Opening & Water
    ctx.fillStyle = PCJR_PALETTE.BLACK;
    ctx.beginPath();
    ctx.ellipse(160, 115, 30, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PCJR_PALETTE.BLUE;
    ctx.beginPath();
    ctx.ellipse(160, 118, 22, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden Posts & Roof
    ctx.fillStyle = PCJR_PALETTE.BROWN;
    ctx.fillRect(128, 70, 6, 45);
    ctx.fillRect(186, 70, 6, 45);

    // Roof
    ctx.fillStyle = PCJR_PALETTE.RED;
    ctx.beginPath();
    ctx.moveTo(118, 70);
    ctx.lineTo(160, 48);
    ctx.lineTo(202, 70);
    ctx.fill();

    // Winch & Bucket
    ctx.strokeStyle = PCJR_PALETTE.DARK_GRAY;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(160, 65);
    ctx.lineTo(160, 98);
    ctx.stroke();

    ctx.fillStyle = PCJR_PALETTE.BROWN;
    ctx.fillRect(154, 98, 12, 12);
  }

  private drawCloverPatch(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = PCJR_PALETTE.LIGHT_BLUE;
    ctx.fillRect(0, 10, 320, 70);

    ctx.fillStyle = PCJR_PALETTE.GREEN;
    ctx.fillRect(0, 70, 320, 100);

    // Lots of tiny three-leaf clovers
    ctx.fillStyle = PCJR_PALETTE.LIGHT_GREEN;
    for (let i = 0; i < 40; i++) {
      const cx = (i * 27) % 310 + 5;
      const cy = 80 + ((i * 19) % 75);
      ctx.beginPath();
      ctx.arc(cx - 2, cy, 2, 0, Math.PI * 2);
      ctx.arc(cx + 2, cy, 2, 0, Math.PI * 2);
      ctx.arc(cx, cy - 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gleaming Four-Leaf Clover in Center
    ctx.fillStyle = PCJR_PALETTE.YELLOW;
    ctx.beginPath();
    ctx.arc(160, 120, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PCJR_PALETTE.LIGHT_GREEN;
    ctx.beginPath();
    ctx.arc(157, 120, 3, 0, Math.PI * 2);
    ctx.arc(163, 120, 3, 0, Math.PI * 2);
    ctx.arc(160, 117, 3, 0, Math.PI * 2);
    ctx.arc(160, 123, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawWalnutTree(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = PCJR_PALETTE.LIGHT_BLUE;
    ctx.fillRect(0, 10, 320, 75);

    ctx.fillStyle = PCJR_PALETTE.GREEN;
    ctx.fillRect(0, 75, 320, 95);

    // Gnarled Tree Trunk
    ctx.fillStyle = PCJR_PALETTE.BROWN;
    ctx.fillRect(145, 65, 30, 95);

    // Canopy
    ctx.fillStyle = PCJR_PALETTE.LIGHT_GREEN;
    ctx.beginPath();
    ctx.arc(160, 50, 50, 0, Math.PI * 2);
    ctx.arc(120, 55, 35, 0, Math.PI * 2);
    ctx.arc(200, 55, 35, 0, Math.PI * 2);
    ctx.fill();

    // Fallen Walnuts on grass
    ctx.fillStyle = PCJR_PALETTE.BROWN;
    ctx.beginPath();
    ctx.arc(130, 135, 3, 0, Math.PI * 2);
    ctx.arc(180, 142, 3, 0, Math.PI * 2);
    ctx.arc(155, 155, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawTrollBridge(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = PCJR_PALETTE.LIGHT_BLUE;
    ctx.fillRect(0, 10, 320, 65);

    ctx.fillStyle = PCJR_PALETTE.GREEN;
    ctx.fillRect(0, 65, 320, 105);

    // Rushing River
    ctx.fillStyle = PCJR_PALETTE.BLUE;
    ctx.fillRect(0, 85, 320, 45);

    // River foam / rapids
    ctx.fillStyle = PCJR_PALETTE.LIGHT_CYAN;
    for (let x = 10; x <= 300; x += 30) {
      ctx.fillRect(x, 95 + ((x % 3) * 5), 18, 2);
    }

    // Wooden Bridge across river
    ctx.fillStyle = PCJR_PALETTE.BROWN;
    ctx.fillRect(135, 75, 50, 65);
    ctx.strokeStyle = PCJR_PALETTE.DARK_GRAY;
    ctx.strokeRect(135, 75, 50, 65);

    // Planks
    for (let y = 80; y <= 135; y += 6) {
      ctx.beginPath();
      ctx.moveTo(135, y);
      ctx.lineTo(185, y);
      ctx.stroke();
    }
  }

  private drawGoatPen(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = PCJR_PALETTE.LIGHT_BLUE;
    ctx.fillRect(0, 10, 320, 70);

    ctx.fillStyle = PCJR_PALETTE.LIGHT_GREEN;
    ctx.fillRect(0, 70, 320, 100);

    // Wooden Paddock Fence
    ctx.strokeStyle = PCJR_PALETTE.BROWN;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(30, 75);
    ctx.lineTo(290, 75);
    ctx.moveTo(30, 95);
    ctx.lineTo(290, 95);
    ctx.stroke();

    for (let x = 30; x <= 290; x += 35) {
      ctx.fillRect(x - 2, 70, 4, 35);
    }
  }

  private drawGingerbreadHouse(ctx: CanvasRenderingContext2D) {
    // Dark ominous forest
    ctx.fillStyle = PCJR_PALETTE.DARK_GRAY;
    ctx.fillRect(0, 10, 320, 60);

    ctx.fillStyle = PCJR_PALETTE.GREEN;
    ctx.fillRect(0, 70, 320, 100);

    // Gingerbread Cottage Body
    ctx.fillStyle = PCJR_PALETTE.BROWN;
    ctx.fillRect(100, 60, 120, 65);

    // Frosted Candy Roof
    ctx.fillStyle = PCJR_PALETTE.WHITE;
    ctx.beginPath();
    ctx.moveTo(90, 60);
    ctx.lineTo(160, 25);
    ctx.lineTo(230, 60);
    ctx.fill();

    // Chimney with Pink Smoke
    ctx.fillStyle = PCJR_PALETTE.RED;
    ctx.fillRect(190, 20, 14, 25);
    ctx.fillStyle = PCJR_PALETTE.LIGHT_MAGENTA;
    ctx.beginPath();
    ctx.arc(197, 12, 6, 0, Math.PI * 2);
    ctx.arc(205, 5, 5, 0, Math.PI * 2);
    ctx.fill();

    // Chocolate Door & Candy Windows
    ctx.fillStyle = PCJR_PALETTE.BLACK;
    ctx.fillRect(145, 85, 30, 40);

    ctx.fillStyle = PCJR_PALETTE.YELLOW;
    ctx.fillRect(115, 80, 18, 18);
    ctx.fillRect(187, 80, 18, 18);
  }

  private drawGnomeField(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = PCJR_PALETTE.LIGHT_BLUE;
    ctx.fillRect(0, 10, 320, 70);

    ctx.fillStyle = PCJR_PALETTE.GREEN;
    ctx.fillRect(0, 70, 320, 100);

    // Spinning Wheel
    ctx.strokeStyle = PCJR_PALETTE.BROWN;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(130, 95, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = PCJR_PALETTE.YELLOW;
    ctx.fillRect(122, 108, 16, 6);
  }

  private drawFertileGround(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = PCJR_PALETTE.LIGHT_BLUE;
    ctx.fillRect(0, 10, 320, 80);

    ctx.fillStyle = PCJR_PALETTE.GREEN;
    ctx.fillRect(0, 80, 320, 90);

    // Dark Loam Tilled Plot
    ctx.fillStyle = PCJR_PALETTE.BROWN;
    ctx.beginPath();
    ctx.ellipse(160, 125, 75, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Giant Twisting Beanstalk soaring into sky
    ctx.fillStyle = PCJR_PALETTE.LIGHT_GREEN;
    ctx.beginPath();
    ctx.moveTo(150, 125);
    ctx.bezierCurveTo(130, 70, 180, 30, 155, 10);
    ctx.lineTo(165, 10);
    ctx.bezierCurveTo(190, 30, 140, 70, 165, 125);
    ctx.fill();

    // Green leaves sprouting off stalk
    ctx.fillStyle = PCJR_PALETTE.GREEN;
    ctx.beginPath();
    ctx.ellipse(135, 75, 12, 5, -0.4, 0, Math.PI * 2);
    ctx.ellipse(180, 50, 14, 6, 0.3, 0, Math.PI * 2);
    ctx.ellipse(145, 25, 10, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawSkyClouds(ctx: CanvasRenderingContext2D) {
    // Deep Azure Heaven
    ctx.fillStyle = PCJR_PALETTE.BLUE;
    ctx.fillRect(0, 10, 320, 160);

    // Billowing White Clouds
    ctx.fillStyle = PCJR_PALETTE.WHITE;
    ctx.beginPath();
    ctx.arc(60, 140, 50, 0, Math.PI * 2);
    ctx.arc(130, 130, 60, 0, Math.PI * 2);
    ctx.arc(200, 135, 55, 0, Math.PI * 2);
    ctx.arc(270, 140, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PCJR_PALETTE.LIGHT_CYAN;
    ctx.beginPath();
    ctx.arc(160, 150, 70, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawDragonCave(ctx: CanvasRenderingContext2D) {
    // Dark Cavern
    ctx.fillStyle = PCJR_PALETTE.BLACK;
    ctx.fillRect(0, 10, 320, 160);

    // Stalactites on ceiling
    ctx.fillStyle = PCJR_PALETTE.DARK_GRAY;
    for (let x = 10; x <= 310; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x - 8, 10);
      ctx.lineTo(x, 30 + ((x * 7) % 25));
      ctx.lineTo(x + 8, 10);
      ctx.fill();
    }

    // Rocky Ground
    ctx.fillStyle = PCJR_PALETTE.BROWN;
    ctx.fillRect(0, 120, 320, 50);

    // Crimson Lava / Fire Glow
    ctx.fillStyle = PCJR_PALETTE.RED;
    ctx.beginPath();
    ctx.ellipse(220, 115, 60, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PCJR_PALETTE.YELLOW;
    ctx.beginPath();
    ctx.ellipse(220, 115, 35, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Magic Mirror on Rocks
    ctx.fillStyle = PCJR_PALETTE.LIGHT_CYAN;
    ctx.beginPath();
    ctx.ellipse(140, 115, 12, 18, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PCJR_PALETTE.YELLOW;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  private drawLeprechaunHall(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = PCJR_PALETTE.BLACK;
    ctx.fillRect(0, 10, 320, 160);

    // Emerald Glowing Crystals
    ctx.fillStyle = PCJR_PALETTE.LIGHT_GREEN;
    const crystals = [
      { x: 30, y: 50 }, { x: 90, y: 35 }, { x: 230, y: 40 }, { x: 285, y: 55 }
    ];
    crystals.forEach((c) => {
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x - 6, c.y + 16);
      ctx.lineTo(c.x + 6, c.y + 16);
      ctx.fill();
    });

    // Cavern Floor
    ctx.fillStyle = PCJR_PALETTE.DARK_GRAY;
    ctx.fillRect(0, 115, 320, 55);

    // Pedestal with Magic Chest
    ctx.fillStyle = PCJR_PALETTE.LIGHT_GRAY;
    ctx.fillRect(150, 110, 26, 16);

    ctx.fillStyle = PCJR_PALETTE.YELLOW;
    ctx.fillRect(152, 100, 22, 12);
    ctx.fillStyle = PCJR_PALETTE.RED;
    ctx.fillRect(156, 104, 14, 3);
  }

  private drawThroneRoom(ctx: CanvasRenderingContext2D) {
    // Castle Royal Hall
    ctx.fillStyle = PCJR_PALETTE.LIGHT_GRAY;
    ctx.fillRect(0, 10, 320, 160);

    // Marble Pillars
    ctx.fillStyle = PCJR_PALETTE.WHITE;
    ctx.fillRect(40, 10, 20, 160);
    ctx.fillRect(260, 10, 20, 160);
    ctx.strokeStyle = PCJR_PALETTE.DARK_GRAY;
    ctx.strokeRect(40, 10, 20, 160);
    ctx.strokeRect(260, 10, 20, 160);

    // Stained Glass Windows
    ctx.fillStyle = PCJR_PALETTE.LIGHT_BLUE;
    ctx.beginPath();
    ctx.arc(80, 45, 15, Math.PI, 0);
    ctx.fillRect(65, 45, 30, 40);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(240, 45, 15, Math.PI, 0);
    ctx.fillRect(225, 45, 30, 40);
    ctx.fill();

    // Red Carpet
    ctx.fillStyle = PCJR_PALETTE.RED;
    ctx.fillRect(135, 40, 50, 130);

    // Golden Royal Throne
    ctx.fillStyle = PCJR_PALETTE.YELLOW;
    ctx.fillRect(145, 35, 30, 45);
    ctx.fillStyle = PCJR_PALETTE.RED;
    ctx.fillRect(150, 42, 20, 30);
  }

  private renderActors(ctx: CanvasRenderingContext2D, room: RoomId) {
    const actors = ROOMS_DATA[room]?.actors || [];
    actors.forEach((a) => {
      if (!a.active) return;
      switch (a.id) {
        case 'troll':
          this.drawSpriteTroll(ctx, a.x, a.y);
          break;
        case 'goat':
          this.drawSpriteGoat(ctx, a.x, a.y);
          break;
        case 'witch':
          this.drawSpriteWitch(ctx, a.x, a.y);
          break;
        case 'gnome':
          this.drawSpriteGnome(ctx, a.x, a.y);
          break;
        case 'giant':
          this.drawSpriteGiant(ctx, a.x, a.y);
          break;
        case 'dragon':
          this.drawSpriteDragon(ctx, a.x, a.y);
          break;
        case 'leprechaun_king':
          this.drawSpriteLeprechaun(ctx, a.x, a.y);
          break;
        case 'king_edward':
          this.drawSpriteKingEdward(ctx, a.x, a.y);
          break;
      }
    });
  }

  // --- SPRITE DRAWING HELPERS (1984 AGI Style) ---

  private drawGraham(ctx: CanvasRenderingContext2D, graham: GrahamState) {
    const gx = graham.x;
    const gy = graham.y;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(gx, gy + 14, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Red Feathered Cap
    ctx.fillStyle = PCJR_PALETTE.GREEN;
    ctx.fillRect(gx - 4, gy - 16, 8, 4);
    // Red Feather
    ctx.fillStyle = PCJR_PALETTE.RED;
    ctx.beginPath();
    ctx.moveTo(gx - 3, gy - 16);
    ctx.lineTo(gx - 8, gy - 21);
    ctx.lineTo(gx - 2, gy - 18);
    ctx.fill();

    // Head / Face
    ctx.fillStyle = PCJR_PALETTE.LIGHT_RED;
    ctx.fillRect(gx - 3, gy - 12, 6, 6);

    // Blue Doublet Tunic
    ctx.fillStyle = PCJR_PALETTE.BLUE;
    ctx.fillRect(gx - 5, gy - 6, 10, 10);
    // Belt
    ctx.fillStyle = PCJR_PALETTE.BROWN;
    ctx.fillRect(gx - 5, gy - 1, 10, 2);
    ctx.fillStyle = PCJR_PALETTE.YELLOW;
    ctx.fillRect(gx - 1, gy - 1, 2, 2);

    // Walking Legs (animated toggle)
    const legOffset = graham.isWalking && graham.animFrame % 2 === 0 ? 3 : 0;
    ctx.fillStyle = PCJR_PALETTE.BROWN;
    ctx.fillRect(gx - 4 - legOffset, gy + 4, 3, 8);
    ctx.fillRect(gx + 1 + legOffset, gy + 4, 3, 8);
  }

  private drawSpriteGuard(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Silver Armor
    ctx.fillStyle = PCJR_PALETTE.LIGHT_GRAY;
    ctx.fillRect(x - 4, y - 10, 8, 14);
    // Helmet
    ctx.fillStyle = PCJR_PALETTE.WHITE;
    ctx.fillRect(x - 4, y - 16, 8, 6);
    // Spear
    ctx.strokeStyle = PCJR_PALETTE.BROWN;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 6);
    ctx.lineTo(x + 6, y - 22);
    ctx.stroke();
    ctx.fillStyle = PCJR_PALETTE.YELLOW;
    ctx.beginPath();
    ctx.moveTo(x + 4, y - 22);
    ctx.lineTo(x + 6, y - 28);
    ctx.lineTo(x + 8, y - 22);
    ctx.fill();
  }

  private drawSpriteTroll(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Green hulking body
    ctx.fillStyle = PCJR_PALETTE.GREEN;
    ctx.fillRect(x - 8, y - 12, 16, 18);
    // Head with big nose
    ctx.fillStyle = PCJR_PALETTE.LIGHT_GREEN;
    ctx.fillRect(x - 6, y - 20, 12, 8);
    ctx.fillStyle = PCJR_PALETTE.RED;
    ctx.fillRect(x - 2, y - 16, 4, 4); // big nose
    // Wooden Club
    ctx.fillStyle = PCJR_PALETTE.BROWN;
    ctx.fillRect(x + 9, y - 15, 5, 20);
  }

  private drawSpriteGoat(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // White body
    ctx.fillStyle = PCJR_PALETTE.WHITE;
    ctx.fillRect(x - 10, y - 6, 18, 10);
    // Legs
    ctx.fillStyle = PCJR_PALETTE.DARK_GRAY;
    ctx.fillRect(x - 8, y + 4, 2, 6);
    ctx.fillRect(x + 5, y + 4, 2, 6);
    // Head & Horns
    ctx.fillStyle = PCJR_PALETTE.WHITE;
    ctx.fillRect(x + 8, y - 12, 8, 7);
    ctx.fillStyle = PCJR_PALETTE.BROWN;
    ctx.fillRect(x + 10, y - 16, 2, 4); // Horns
  }

  private drawSpriteWitch(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Black Robe & Pointed Hat
    ctx.fillStyle = PCJR_PALETTE.BLACK;
    ctx.beginPath();
    ctx.moveTo(x - 8, y + 10);
    ctx.lineTo(x, y - 8);
    ctx.lineTo(x + 8, y + 10);
    ctx.fill();
    // Pointed Hat
    ctx.beginPath();
    ctx.moveTo(x - 7, y - 8);
    ctx.lineTo(x, y - 22);
    ctx.lineTo(x + 7, y - 8);
    ctx.fill();
    // Green face & warts
    ctx.fillStyle = PCJR_PALETTE.LIGHT_GREEN;
    ctx.fillRect(x - 3, y - 6, 6, 5);
  }

  private drawSpriteGnome(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Red Pointed Hat
    ctx.fillStyle = PCJR_PALETTE.RED;
    ctx.beginPath();
    ctx.moveTo(x - 5, y - 6);
    ctx.lineTo(x, y - 18);
    ctx.lineTo(x + 5, y - 6);
    ctx.fill();
    // White Beard
    ctx.fillStyle = PCJR_PALETTE.WHITE;
    ctx.fillRect(x - 4, y - 2, 8, 8);
    // Blue tunic
    ctx.fillStyle = PCJR_PALETTE.BLUE;
    ctx.fillRect(x - 4, y + 4, 8, 8);
  }

  private drawSpriteGiant(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Giant Scale (Towers over cloud)
    ctx.fillStyle = PCJR_PALETTE.BROWN;
    ctx.fillRect(x - 12, y - 20, 24, 30);
    // Head & Beard
    ctx.fillStyle = PCJR_PALETTE.LIGHT_RED;
    ctx.fillRect(x - 8, y - 32, 16, 12);
    ctx.fillStyle = PCJR_PALETTE.BROWN;
    ctx.fillRect(x - 8, y - 24, 16, 8); // Beard
    // Huge Magic Shield in Hand
    ctx.fillStyle = PCJR_PALETTE.LIGHT_CYAN;
    ctx.fillRect(x + 13, y - 18, 10, 16);
    ctx.strokeStyle = PCJR_PALETTE.YELLOW;
    ctx.strokeRect(x + 13, y - 18, 10, 16);
  }

  private drawSpriteDragon(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Massive Red Scales
    ctx.fillStyle = PCJR_PALETTE.RED;
    ctx.beginPath();
    ctx.ellipse(x, y, 32, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    // Long Neck & Snout
    ctx.fillRect(x - 28, y - 16, 12, 20);
    ctx.fillRect(x - 36, y - 22, 18, 10);
    // Smoke / Flame puffs
    ctx.fillStyle = PCJR_PALETTE.YELLOW;
    ctx.fillRect(x - 44, y - 20, 6, 6);
    // Bat Wings
    ctx.fillStyle = PCJR_PALETTE.LIGHT_RED;
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 10);
    ctx.lineTo(x + 10, y - 30);
    ctx.lineTo(x + 25, y - 8);
    ctx.fill();
  }

  private drawSpriteLeprechaun(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Tiny Green Coat & Top Hat
    ctx.fillStyle = PCJR_PALETTE.GREEN;
    ctx.fillRect(x - 4, y - 4, 8, 8);
    ctx.fillRect(x - 4, y - 12, 8, 6);
    // Gold Buckle
    ctx.fillStyle = PCJR_PALETTE.YELLOW;
    ctx.fillRect(x - 2, y - 8, 4, 2);
  }

  private drawSpriteKingEdward(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Regal Ermine Robe & Golden Crown
    ctx.fillStyle = PCJR_PALETTE.RED;
    ctx.fillRect(x - 7, y - 12, 14, 20);
    ctx.fillStyle = PCJR_PALETTE.WHITE;
    ctx.fillRect(x - 7, y - 12, 14, 3); // Ermine fur trim
    // Crown
    ctx.fillStyle = PCJR_PALETTE.YELLOW;
    ctx.fillRect(x - 5, y - 22, 10, 5);
    ctx.fillRect(x - 4, y - 24, 2, 2);
    ctx.fillRect(x, y - 25, 2, 3);
    ctx.fillRect(x + 3, y - 24, 2, 2);
  }

  private renderGraham(ctx: CanvasRenderingContext2D, graham: GrahamState) {
    if (graham.isDead) {
      // Fallen Graham on the ground
      ctx.fillStyle = PCJR_PALETTE.LIGHT_RED;
      ctx.fillRect(graham.x - 10, graham.y - 4, 20, 6);
      ctx.fillStyle = PCJR_PALETTE.RED;
      ctx.fillRect(graham.x + 8, graham.y - 6, 4, 3); // Red hat
      return;
    }

    if (graham.hasFairyProtection) {
      // Magical Godmother Fairy Protection aura
      ctx.strokeStyle = PCJR_PALETTE.LIGHT_CYAN;
      ctx.lineWidth = 1;
      ctx.strokeRect(graham.x - 7, graham.y - 24, 14, 26);
      ctx.fillStyle = PCJR_PALETTE.WHITE;
      ctx.fillRect(graham.x - 4 + (graham.animFrame % 8), graham.y - 20, 2, 2);
    }

    const { x, y, direction, animFrame } = graham;
    const isFacingWest = direction === 'WEST';
    const isFacingEast = direction === 'EAST';
    const isFacingNorth = direction === 'NORTH';
    const legOffset = (animFrame % 2 === 0) ? 2 : -2;

    // 1. Red Feathered Cap
    ctx.fillStyle = PCJR_PALETTE.RED;
    ctx.fillRect(x - 5, y - 22, 10, 4);
    // Red feather jutting out
    ctx.fillStyle = PCJR_PALETTE.LIGHT_RED;
    if (isFacingWest) {
      ctx.fillRect(x + 2, y - 25, 2, 4);
    } else {
      ctx.fillRect(x - 4, y - 25, 2, 4);
    }

    // 2. Head / Face (Light Red / Pink skin tone in PCjr palette)
    ctx.fillStyle = PCJR_PALETTE.LIGHT_RED;
    ctx.fillRect(x - 4, y - 18, 8, 5);

    // Hair / Eyes
    ctx.fillStyle = PCJR_PALETTE.BROWN;
    if (isFacingNorth) {
      // Back of brown hair
      ctx.fillRect(x - 4, y - 18, 8, 4);
    } else if (isFacingWest) {
      ctx.fillStyle = PCJR_PALETTE.BLACK;
      ctx.fillRect(x - 3, y - 17, 2, 2);
    } else if (isFacingEast) {
      ctx.fillStyle = PCJR_PALETTE.BLACK;
      ctx.fillRect(x + 1, y - 17, 2, 2);
    } else {
      // Facing South or Idle
      ctx.fillStyle = PCJR_PALETTE.BLACK;
      ctx.fillRect(x - 3, y - 17, 2, 2);
      ctx.fillRect(x + 1, y - 17, 2, 2);
    }

    // 3. Green Tunic (Iconic Graham signature)
    ctx.fillStyle = PCJR_PALETTE.GREEN;
    ctx.fillRect(x - 5, y - 13, 10, 8);

    // Belt & Gold Buckle
    ctx.fillStyle = PCJR_PALETTE.BLACK;
    ctx.fillRect(x - 5, y - 7, 10, 2);
    ctx.fillStyle = PCJR_PALETTE.YELLOW;
    ctx.fillRect(x - 1, y - 7, 2, 2);

    // 4. Arms / Sleeves
    ctx.fillStyle = PCJR_PALETTE.LIGHT_GREEN;
    if (isFacingWest || isFacingEast) {
      ctx.fillRect(isFacingWest ? x - 6 : x + 4, y - 12, 3, 6);
    } else {
      ctx.fillRect(x - 7, y - 12, 2, 6);
      ctx.fillRect(x + 5, y - 12, 2, 6);
    }

    // 5. Leggings (Blue/Dark Gray)
    ctx.fillStyle = PCJR_PALETTE.BLUE;
    if (isFacingWest || isFacingEast) {
      ctx.fillRect(x - 3 + legOffset, y - 5, 6, 4);
    } else {
      ctx.fillRect(x - 4, y - 5, 3, 4);
      ctx.fillRect(x + 1, y - 5, 3, 4);
    }

    // 6. Brown Boots
    ctx.fillStyle = PCJR_PALETTE.BROWN;
    if (isFacingWest) {
      ctx.fillRect(x - 4 + legOffset, y - 1, 5, 3);
      ctx.fillRect(x - 6 + legOffset, y + 1, 3, 2);
    } else if (isFacingEast) {
      ctx.fillRect(x - 1 + legOffset, y - 1, 5, 3);
      ctx.fillRect(x + 3 + legOffset, y + 1, 3, 2);
    } else {
      ctx.fillRect(x - 4, y - 1 + (animFrame % 2 === 0 ? 0 : 1), 3, 3);
      ctx.fillRect(x + 1, y - 1 + (animFrame % 2 === 0 ? 1 : 0), 3, 3);
    }
  }

  private renderParserPrompt(
    ctx: CanvasRenderingContext2D,
    inputPrompt: string,
    messageLog: { text: string; isPlayer?: boolean; isSystem?: boolean }[]
  ) {
    // Text Bar Background
    ctx.fillStyle = PCJR_PALETTE.BLACK;
    ctx.fillRect(0, 170, 320, 30);

    ctx.strokeStyle = PCJR_PALETTE.DARK_GRAY;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 170, 320, 30);

    // Latest message line
    const lastMsg = messageLog[messageLog.length - 1];
    ctx.fillStyle = lastMsg?.isPlayer ? PCJR_PALETTE.YELLOW : PCJR_PALETTE.WHITE;
    ctx.font = '6px monospace';
    ctx.textAlign = 'left';

    if (lastMsg) {
      const text = lastMsg.text.length > 55 ? `${lastMsg.text.slice(0, 52)}...` : lastMsg.text;
      ctx.fillText(text, 6, 180);
    }

    // Input prompt line: > command_
    ctx.fillStyle = PCJR_PALETTE.LIGHT_CYAN;
    ctx.font = 'bold 7px monospace';
    ctx.fillText(`>${inputPrompt}_`, 6, 194);
  }
}

export const kingsQuestRenderer = new KingsQuestRenderer();
