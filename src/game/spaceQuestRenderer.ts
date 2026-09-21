/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Space Quest I: The Sarien Encounter (1986, Mark Crowe & Scott Murphy / Sierra On-Line)
 * Authentic 16-Color PCjr / EGA 320x200 CRT Canvas Renderer
 */

import { SQRoomId, RogerState } from './spaceQuestTypes';
import { SQ_ROOMS_DATA } from './spaceQuestRooms';

export const EGA_PALETTE = {
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

export class SpaceQuestRenderer {
  public colorMode: 'EGA' | 'CGA' | 'AMBER' | 'GREEN' = 'EGA';

  public setColorMode(mode: 'EGA' | 'CGA' | 'AMBER' | 'GREEN') {
    this.colorMode = mode;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentRoom: SQRoomId,
    roger: RogerState,
    score: number,
    soundEnabled: boolean,
    lang: 'nl' | 'en',
    inputPrompt: string,
    messageLog: { text: string; isPlayer?: boolean; isSystem?: boolean }[]
  ) {
    ctx.fillStyle = EGA_PALETTE.BLACK;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    const scaleX = width / 320;
    const scaleY = height / 200;
    ctx.scale(scaleX, scaleY);

    // 1. Sierra Status Bar (0-10px)
    this.renderStatusBar(ctx, score, soundEnabled, currentRoom, lang);

    // 2. Room Scenery (10-170px)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 10, 320, 160);
    ctx.clip();
    this.renderRoomScenery(ctx, currentRoom);
    this.renderRoger(ctx, roger);
    ctx.restore();

    // 3. Parser dialog & prompt (170-200px)
    this.renderParserPrompt(ctx, inputPrompt, messageLog);

    ctx.restore();

    // 4. Authentic CRT Filter
    if (this.colorMode !== 'EGA') {
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
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (lum < 35) {
            d[i] = 0; d[i + 1] = 0; d[i + 2] = 0;
          } else if (r > g + 10 && r > b - 20) {
            d[i] = 255; d[i + 1] = 85; d[i + 2] = 255;
          } else if (lum > 185) {
            d[i] = 255; d[i + 1] = 255; d[i + 2] = 255;
          } else {
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
    } catch {}
  }

  private renderStatusBar(
    ctx: CanvasRenderingContext2D,
    score: number,
    soundEnabled: boolean,
    currentRoom: SQRoomId,
    lang: 'nl' | 'en'
  ) {
    ctx.fillStyle = EGA_PALETTE.WHITE;
    ctx.fillRect(0, 0, 320, 10);

    ctx.fillStyle = EGA_PALETTE.BLACK;
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score} of 185`, 4, 8);

    const roomTitle = SQ_ROOMS_DATA[currentRoom]?.title[lang] || currentRoom;
    ctx.textAlign = 'center';
    ctx.fillText(roomTitle.toUpperCase().slice(0, 32), 160, 8);

    ctx.textAlign = 'right';
    ctx.fillText(`Sound: ${soundEnabled ? 'ON' : 'OFF'}`, 316, 8);
  }

  private renderRoomScenery(ctx: CanvasRenderingContext2D, room: SQRoomId) {
    switch (room) {
      case 'JANITOR_CLOSET':
        this.drawJanitorCloset(ctx);
        break;
      case 'STARBOARD_HALL':
        this.drawStarboardHall(ctx);
        break;
      case 'DATA_ARCHIVE':
        this.drawDataArchive(ctx);
        break;
      case 'ESCAPE_POD_BAY':
        this.drawEscapePodBay(ctx);
        break;
      case 'DEEP_SPACE':
        this.drawDeepSpace(ctx);
        break;
      case 'KERONA_CRASH':
        this.drawKeronaCrash(ctx);
        break;
      case 'KERONA_CANYON':
        this.drawKeronaCanyon(ctx);
        break;
      case 'ORAT_CAVERN':
        this.drawOratCavern(ctx);
        break;
      case 'UNDERGROUND_LAB':
        this.drawUndergroundLab(ctx);
        break;
      case 'SKIMMER_LANDING':
        this.drawSkimmerLanding(ctx);
        break;
    }
  }

  // 1. JANITOR CLOSET
  private drawJanitorCloset(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = EGA_PALETTE.DARK_GRAY;
    ctx.fillRect(0, 10, 320, 60);

    ctx.fillStyle = EGA_PALETTE.LIGHT_GRAY;
    ctx.fillRect(0, 70, 320, 100);

    // Wall panels
    ctx.strokeStyle = EGA_PALETTE.BLACK;
    ctx.lineWidth = 1;
    for (let x = 40; x < 320; x += 45) {
      ctx.strokeRect(x, 15, 40, 50);
    }

    // Flashing red emergency alarm light
    const pulse = Math.floor(Date.now() / 250) % 2 === 0;
    ctx.fillStyle = pulse ? EGA_PALETTE.LIGHT_RED : EGA_PALETTE.RED;
    ctx.beginPath();
    ctx.arc(160, 25, 8, 0, Math.PI * 2);
    ctx.fill();

    // Broom locker on left
    ctx.fillStyle = EGA_PALETTE.BROWN;
    ctx.fillRect(20, 35, 30, 85);
    ctx.fillStyle = EGA_PALETTE.YELLOW;
    ctx.fillRect(45, 75, 3, 6);

    // Mop bucket
    ctx.fillStyle = EGA_PALETTE.CYAN;
    ctx.fillRect(65, 110, 18, 14);
    ctx.fillStyle = EGA_PALETTE.DARK_GRAY;
    ctx.fillRect(63, 108, 22, 3);
  }

  // 2. STARBOARD HALL
  private drawStarboardHall(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = EGA_PALETTE.BLACK;
    ctx.fillRect(0, 10, 320, 160);

    // Corridor perspective
    ctx.fillStyle = EGA_PALETTE.DARK_GRAY;
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(320, 10);
    ctx.lineTo(240, 60);
    ctx.lineTo(80, 60);
    ctx.closePath();
    ctx.fill();

    // Hallway floor
    ctx.fillStyle = EGA_PALETTE.LIGHT_GRAY;
    ctx.beginPath();
    ctx.moveTo(80, 60);
    ctx.lineTo(240, 60);
    ctx.lineTo(320, 170);
    ctx.lineTo(0, 170);
    ctx.closePath();
    ctx.fill();

    // Red warning strobes along walls
    const pulse = Math.floor(Date.now() / 200) % 2 === 0;
    ctx.fillStyle = pulse ? EGA_PALETTE.LIGHT_RED : EGA_PALETTE.DARK_GRAY;
    ctx.fillRect(85, 25, 6, 12);
    ctx.fillRect(229, 25, 6, 12);

    // Slumped scientist Jerry on deck
    ctx.fillStyle = EGA_PALETTE.WHITE;
    ctx.fillRect(180, 105, 24, 10); // Lab coat
    ctx.fillStyle = EGA_PALETTE.BROWN;
    ctx.fillRect(174, 102, 8, 8); // Head
    ctx.fillStyle = EGA_PALETTE.LIGHT_BLUE;
    ctx.fillRect(202, 108, 7, 5); // Glowing keycard
  }

  // 3. DATA ARCHIVE
  private drawDataArchive(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = EGA_PALETTE.BLUE;
    ctx.fillRect(0, 10, 320, 70);

    ctx.fillStyle = EGA_PALETTE.DARK_GRAY;
    ctx.fillRect(0, 80, 320, 90);

    // Computer Mainframes
    ctx.fillStyle = EGA_PALETTE.BLACK;
    ctx.fillRect(20, 20, 70, 75);
    ctx.fillRect(230, 20, 70, 75);

    // Blinking LEDs
    for (let y = 26; y < 85; y += 8) {
      for (let x = 25; x < 85; x += 10) {
        const on = (x + y + Math.floor(Date.now() / 300)) % 3 === 0;
        ctx.fillStyle = on ? EGA_PALETTE.LIGHT_GREEN : EGA_PALETTE.GREEN;
        ctx.fillRect(x, y, 4, 4);
      }
      for (let x = 235; x < 295; x += 10) {
        const on = (x + y + Math.floor(Date.now() / 250)) % 2 === 0;
        ctx.fillStyle = on ? EGA_PALETTE.YELLOW : EGA_PALETTE.RED;
        ctx.fillRect(x, y, 4, 4);
      }
    }

    // Central Data Terminal with Cartridge
    ctx.fillStyle = EGA_PALETTE.LIGHT_GRAY;
    ctx.fillRect(125, 75, 70, 35);
    ctx.fillStyle = EGA_PALETTE.CYAN;
    ctx.fillRect(135, 80, 50, 18);
    // Glowing cartridge
    ctx.fillStyle = EGA_PALETTE.LIGHT_MAGENTA;
    ctx.fillRect(154, 99, 12, 8);
  }

  // 4. ESCAPE POD BAY
  private drawEscapePodBay(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = EGA_PALETTE.BLACK;
    ctx.fillRect(0, 10, 320, 160);

    // Blast shields
    ctx.fillStyle = EGA_PALETTE.DARK_GRAY;
    ctx.fillRect(0, 10, 320, 50);

    // Metal Grid Deck
    ctx.fillStyle = EGA_PALETTE.LIGHT_GRAY;
    ctx.fillRect(0, 60, 320, 110);
    ctx.strokeStyle = EGA_PALETTE.DARK_GRAY;
    for (let x = 0; x < 320; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 60);
      ctx.lineTo(x, 170);
      ctx.stroke();
    }

    // Escape Pod (Egg shape)
    ctx.fillStyle = EGA_PALETTE.WHITE;
    ctx.beginPath();
    ctx.ellipse(160, 100, 45, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = EGA_PALETTE.BLUE;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pod Canopy Window
    ctx.fillStyle = EGA_PALETTE.LIGHT_CYAN;
    ctx.beginPath();
    ctx.ellipse(160, 92, 22, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Launch Console with Red Button
    ctx.fillStyle = EGA_PALETTE.DARK_GRAY;
    ctx.fillRect(245, 95, 25, 30);
    ctx.fillStyle = EGA_PALETTE.LIGHT_RED;
    ctx.beginPath();
    ctx.arc(257, 105, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. DEEP SPACE
  private drawDeepSpace(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = EGA_PALETTE.BLACK;
    ctx.fillRect(0, 10, 320, 160);

    // Stars
    ctx.fillStyle = EGA_PALETTE.WHITE;
    for (let i = 0; i < 60; i++) {
      const sx = (i * 47) % 320;
      const sy = 12 + ((i * 31) % 150);
      ctx.fillRect(sx, sy, (i % 5 === 0) ? 2 : 1, (i % 5 === 0) ? 2 : 1);
    }

    // Distant exploding Arcada fireball
    ctx.fillStyle = EGA_PALETTE.YELLOW;
    ctx.beginPath();
    ctx.arc(60, 50, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = EGA_PALETTE.LIGHT_RED;
    ctx.beginPath();
    ctx.arc(60, 50, 14, 0, Math.PI * 2);
    ctx.fill();

    // Desert Planet Kerona in distance
    ctx.fillStyle = EGA_PALETTE.BROWN;
    ctx.beginPath();
    ctx.arc(260, 110, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = EGA_PALETTE.LIGHT_RED;
    ctx.beginPath();
    ctx.arc(250, 105, 32, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. KERONA CRASH
  private drawKeronaCrash(ctx: CanvasRenderingContext2D) {
    // Twin blazing orange suns sky
    ctx.fillStyle = EGA_PALETTE.LIGHT_RED;
    ctx.fillRect(0, 10, 320, 60);

    ctx.fillStyle = EGA_PALETTE.YELLOW;
    ctx.beginPath();
    ctx.arc(80, 32, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(130, 42, 10, 0, Math.PI * 2);
    ctx.fill();

    // Kerona Sand Dunes
    ctx.fillStyle = EGA_PALETTE.BROWN;
    ctx.fillRect(0, 70, 320, 100);

    ctx.fillStyle = EGA_PALETTE.YELLOW;
    ctx.beginPath();
    ctx.moveTo(0, 95);
    ctx.quadraticCurveTo(100, 75, 200, 100);
    ctx.quadraticCurveTo(270, 120, 320, 90);
    ctx.lineTo(320, 170);
    ctx.lineTo(0, 170);
    ctx.closePath();
    ctx.fill();

    // Crashed & Smoldering Pod
    ctx.fillStyle = EGA_PALETTE.DARK_GRAY;
    ctx.beginPath();
    ctx.ellipse(145, 95, 36, 20, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Broken glass canopy
    ctx.fillStyle = EGA_PALETTE.LIGHT_CYAN;
    ctx.fillRect(135, 85, 15, 8);
  }

  // 7. KERONA CANYON
  private drawKeronaCanyon(ctx: CanvasRenderingContext2D) {
    // Sky
    ctx.fillStyle = EGA_PALETTE.LIGHT_RED;
    ctx.fillRect(0, 10, 320, 50);

    // Towering red canyon rock formations
    ctx.fillStyle = EGA_PALETTE.RED;
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(90, 10);
    ctx.lineTo(110, 80);
    ctx.lineTo(0, 110);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(320, 10);
    ctx.lineTo(230, 10);
    ctx.lineTo(210, 80);
    ctx.lineTo(320, 110);
    ctx.closePath();
    ctx.fill();

    // Dark cavern entrance in center
    ctx.fillStyle = EGA_PALETTE.BLACK;
    ctx.beginPath();
    ctx.arc(160, 70, 24, Math.PI, 0);
    ctx.lineTo(184, 85);
    ctx.lineTo(136, 85);
    ctx.closePath();
    ctx.fill();

    // Canyon sand floor
    ctx.fillStyle = EGA_PALETTE.BROWN;
    ctx.fillRect(0, 85, 320, 85);
  }

  // 8. ORAT CAVERN
  private drawOratCavern(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = EGA_PALETTE.BLACK;
    ctx.fillRect(0, 10, 320, 160);

    // Dripping Stalactites
    ctx.fillStyle = EGA_PALETTE.LIGHT_GREEN;
    for (let x = 20; x < 320; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 10);
      ctx.lineTo(x + 8, 10);
      ctx.lineTo(x + 4, 35);
      ctx.closePath();
      ctx.fill();
    }

    // Subterranean Rock Floor
    ctx.fillStyle = EGA_PALETTE.DARK_GRAY;
    ctx.fillRect(0, 110, 320, 60);

    // Giant Orat Monster
    ctx.fillStyle = EGA_PALETTE.LIGHT_MAGENTA;
    ctx.beginPath();
    ctx.arc(160, 90, 28, 0, Math.PI * 2);
    ctx.fill();

    // Huge sharp teeth
    ctx.fillStyle = EGA_PALETTE.WHITE;
    for (let t = 142; t <= 178; t += 6) {
      ctx.beginPath();
      ctx.moveTo(t, 94);
      ctx.lineTo(t + 3, 104);
      ctx.lineTo(t + 6, 94);
      ctx.fill();
    }

    // Glowing yellow bulging eyes
    ctx.fillStyle = EGA_PALETTE.YELLOW;
    ctx.beginPath();
    ctx.arc(148, 80, 6, 0, Math.PI * 2);
    ctx.arc(172, 80, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = EGA_PALETTE.BLACK;
    ctx.fillRect(146, 78, 3, 4);
    ctx.fillRect(170, 78, 3, 4);
  }

  // 9. UNDERGROUND LAB
  private drawUndergroundLab(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = EGA_PALETTE.BLUE;
    ctx.fillRect(0, 10, 320, 160);

    // Alien architecture columns
    ctx.fillStyle = EGA_PALETTE.CYAN;
    ctx.fillRect(40, 10, 20, 160);
    ctx.fillRect(260, 10, 20, 160);

    // Glowing Keronian Holographic Face
    ctx.strokeStyle = EGA_PALETTE.LIGHT_GREEN;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(160, 65, 32, 0, Math.PI * 2);
    ctx.stroke();

    // Eyes and mouth
    ctx.strokeRect(146, 55, 8, 4);
    ctx.strokeRect(166, 55, 8, 4);
    ctx.beginPath();
    ctx.arc(160, 78, 10, 0, Math.PI);
    ctx.stroke();

    // Pedestal with Universal Translator Gadget
    ctx.fillStyle = EGA_PALETTE.DARK_GRAY;
    ctx.fillRect(145, 105, 30, 35);
    ctx.fillStyle = EGA_PALETTE.LIGHT_CYAN;
    ctx.fillRect(152, 98, 16, 10);
  }

  // 10. SKIMMER LANDING
  private drawSkimmerLanding(ctx: CanvasRenderingContext2D) {
    // Twilight Desert Sky
    ctx.fillStyle = EGA_PALETTE.MAGENTA;
    ctx.fillRect(0, 10, 320, 70);

    // Salt flats
    ctx.fillStyle = EGA_PALETTE.LIGHT_GRAY;
    ctx.fillRect(0, 80, 320, 90);

    // Alien Sand Skimmer Vehicle
    ctx.fillStyle = EGA_PALETTE.LIGHT_RED;
    ctx.beginPath();
    ctx.moveTo(130, 100);
    ctx.lineTo(210, 95);
    ctx.lineTo(230, 115);
    ctx.lineTo(120, 115);
    ctx.closePath();
    ctx.fill();

    // Skimmer cockpit canopy
    ctx.fillStyle = EGA_PALETTE.LIGHT_CYAN;
    ctx.beginPath();
    ctx.arc(175, 96, 12, Math.PI, 0);
    ctx.fill();

    // Repulsor glow beneath skimmer
    ctx.fillStyle = EGA_PALETTE.LIGHT_BLUE;
    ctx.fillRect(135, 116, 80, 4);
  }

  // ROGER WILCO SPRITE RENDERING
  private renderRoger(ctx: CanvasRenderingContext2D, roger: RogerState) {
    const rx = roger.x;
    const ry = roger.y;
    const walkOffset = roger.isWalking ? (roger.animFrame % 2 === 0 ? 1 : -1) : 0;

    // Janitor Boots
    ctx.fillStyle = EGA_PALETTE.BLACK;
    ctx.fillRect(rx - 4, ry + 12, 3, 4 + walkOffset);
    ctx.fillRect(rx + 2, ry + 12, 3, 4 - walkOffset);

    // Blue/Gray Custodial Uniform Pants
    ctx.fillStyle = EGA_PALETTE.BLUE;
    ctx.fillRect(rx - 5, ry + 3, 11, 10);

    // Uniform Shirt with Name Tag
    ctx.fillStyle = EGA_PALETTE.LIGHT_BLUE;
    ctx.fillRect(rx - 6, ry - 7, 13, 10);
    ctx.fillStyle = EGA_PALETTE.YELLOW;
    ctx.fillRect(rx - 3, ry - 4, 3, 2); // "Roger" tag

    // Roger Head & Brown Hair
    ctx.fillStyle = EGA_PALETTE.WHITE; // Face
    ctx.fillRect(rx - 4, ry - 14, 9, 8);
    ctx.fillStyle = EGA_PALETTE.BROWN; // Hair
    ctx.fillRect(rx - 5, ry - 17, 11, 4);
    ctx.fillRect(rx - 5, ry - 15, 3, 5);

    // Janitor Broom if walking
    if (roger.isWalking) {
      ctx.strokeStyle = EGA_PALETTE.BROWN;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rx + 6, ry - 10);
      ctx.lineTo(rx + 9, ry + 14);
      ctx.stroke();
    }
  }

  private renderParserPrompt(
    ctx: CanvasRenderingContext2D,
    prompt: string,
    logs: { text: string; isPlayer?: boolean; isSystem?: boolean }[]
  ) {
    ctx.fillStyle = EGA_PALETTE.BLACK;
    ctx.fillRect(0, 170, 320, 30);

    ctx.strokeStyle = EGA_PALETTE.DARK_GRAY;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 170);
    ctx.lineTo(320, 170);
    ctx.stroke();

    // Latest message
    const lastMsg = logs[logs.length - 1];
    if (lastMsg) {
      ctx.fillStyle = lastMsg.isPlayer
        ? EGA_PALETTE.LIGHT_CYAN
        : lastMsg.isSystem
        ? EGA_PALETTE.YELLOW
        : EGA_PALETTE.WHITE;
      ctx.font = '6.5px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(lastMsg.text.slice(0, 68), 6, 181);
    }

    // Command Prompt Line
    ctx.fillStyle = EGA_PALETTE.LIGHT_GREEN;
    ctx.font = 'bold 7px monospace';
    const cursor = Math.floor(Date.now() / 400) % 2 === 0 ? '_' : ' ';
    ctx.fillText(`>${prompt}${cursor}`, 6, 194);
  }
}

export const spaceQuestRenderer = new SpaceQuestRenderer();
