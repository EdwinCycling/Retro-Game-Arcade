/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Spy Fox: Operatie Melkzuur (1997 Humongous Entertainment / SCUMM)
 * Canvas 2D Retro Adventure Renderer
 */

import { SpyFoxEngine, SF_VIRTUAL_WIDTH, SF_VIRTUAL_HEIGHT } from './spyFoxEngine';

export class SpyFoxRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(engine: SpyFoxEngine, lang: 'nl' | 'en' = 'nl') {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;

    // Clear Screen
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, SF_VIRTUAL_WIDTH, SF_VIRTUAL_HEIGHT);

    // 1. Draw Current Room Background & Scenery
    switch (engine.currentRoom) {
      case 'harbor':
        this.drawHarbor(engine);
        break;
      case 'cantina':
        this.drawCantina(engine);
        break;
      case 'cantina_kitchen':
        this.drawCantinaKitchen(engine);
        break;
      case 'fortress':
        this.drawFortress(engine);
        break;
      case 'missile_silo':
        this.drawMissileSilo(engine);
        break;
      case 'command':
        this.drawCommandCenter(engine);
        break;
      case 'victory':
        this.drawVictoryScene(engine, lang);
        break;
    }

    // 2. Draw Spy Fox Character (in playable rooms)
    if (engine.currentRoom !== 'command' && engine.currentRoom !== 'victory') {
      this.drawSpyFox(engine);
    }

    // 3. Draw Laser Animation if active
    if (engine.laserAnim.active) {
      this.drawLaserBeam(engine);
    }

    // 4. Draw interactive hotspot indicator circle
    if (engine.hoveredHotspot && engine.currentRoom !== 'command' && engine.currentRoom !== 'victory') {
      this.drawHotspotReticle(engine.hoveredHotspot);
    }
  }

  private drawHotspotReticle(hotspot: { x: number; y: number; width: number; height: number }) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(hotspot.x, hotspot.y, hotspot.width, hotspot.height);
    // Pulsing corner markers
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(hotspot.x - 1, hotspot.y - 1, 3, 3);
    ctx.fillRect(hotspot.x + hotspot.width - 2, hotspot.y - 1, 3, 3);
    ctx.fillRect(hotspot.x - 1, hotspot.y + hotspot.height - 2, 3, 3);
    ctx.fillRect(hotspot.x + hotspot.width - 2, hotspot.y + hotspot.height - 2, 3, 3);
    ctx.restore();
  }

  private drawHarbor(engine: SpyFoxEngine) {
    const ctx = this.ctx;

    // Mediterranean Sky & Sun
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 90);
    skyGrad.addColorStop(0, '#0284c7');
    skyGrad.addColorStop(1, '#7dd3fc');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, SF_VIRTUAL_WIDTH, 90);

    // Warm Greek Sun
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(45, 30, 16, 0, Math.PI * 2);
    ctx.fill();

    // Distant Greek Island Hills
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(0, 85);
    ctx.quadraticCurveTo(80, 55, 160, 80);
    ctx.quadraticCurveTo(240, 60, SF_VIRTUAL_WIDTH, 85);
    ctx.lineTo(SF_VIRTUAL_WIDTH, 100);
    ctx.lineTo(0, 100);
    ctx.fill();

    // Deep Aegean Sea
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(0, 90, SF_VIRTUAL_WIDTH, 40);

    // Whitewashed Greek Buildings with Blue Dome
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(80, 45, 90, 80);
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(80, 45, 90, 80);

    // Blue Dome on Greek Taverna
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(125, 45, 26, Math.PI, 0);
    ctx.fill();

    // Cantina Entrance Door
    ctx.fillStyle = '#78350f';
    ctx.fillRect(100, 75, 32, 50);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(124, 98, 4, 4); // Brass knob

    // Signboard: "TA VAPORIA" Graphic Hanging Sign
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(94, 58, 44, 14);
    ctx.strokeStyle = '#fbbf24';
    ctx.strokeRect(94, 58, 44, 14);
    // Wine/Coffee Mug Graphic icon on signboard
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(116, 65, 4, 0, Math.PI * 2);
    ctx.fill();

    // Fortress Blast Door (Right Side)
    ctx.fillStyle = engine.warehouseDoorUnlocked ? '#0f172a' : '#475569';
    ctx.fillRect(230, 65, 44, 70);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(230, 65, 44, 70);

    // Hazard Stripes on Door Header
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#eab308' : '#0f172a';
      ctx.fillRect(230 + i * 7.3, 65, 7.3, 6);
    }

    // Keypad Terminal
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(212, 92, 14, 20);
    ctx.strokeStyle = engine.warehouseDoorUnlocked ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 1;
    ctx.strokeRect(212, 92, 14, 20);

    // Keypad dusted indicator (white powdery dusting)
    if (engine.dustedKeypad) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(214, 94, 10, 16);
      // Key buttons illuminated in green
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(216, 96, 2, 2);
      ctx.fillRect(220, 96, 2, 2);
      ctx.fillRect(216, 100, 2, 2);
      ctx.fillRect(220, 104, 2, 2);
    } else {
      ctx.fillStyle = '#64748b';
      ctx.fillRect(215, 95, 8, 14);
    }

    // Pier / Stone Promenade
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 125, SF_VIRTUAL_WIDTH, 40);
    ctx.strokeStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(0, 125);
    ctx.lineTo(SF_VIRTUAL_WIDTH, 125);
    ctx.stroke();

    // Spy Speedboat at the dock
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(14, 140);
    ctx.lineTo(60, 140);
    ctx.lineTo(54, 158);
    ctx.lineTo(24, 158);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(18, 145, 38, 3);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(32, 134, 16, 6); // Windshield
    // Spy Antenna
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(22, 140);
    ctx.lineTo(18, 128);
    ctx.stroke();

    // Greek Cypress Tree
    ctx.fillStyle = '#78350f';
    ctx.fillRect(290, 80, 8, 48);
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(294, 75, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawCantina(engine: SpyFoxEngine) {
    const ctx = this.ctx;

    // Mediterranean Cantina Interior
    ctx.fillStyle = '#331800';
    ctx.fillRect(0, 0, SF_VIRTUAL_WIDTH, 125);

    // Wooden Plank Floor
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 125, SF_VIRTUAL_WIDTH, 40);
    ctx.strokeStyle = '#451a03';
    for (let x = 0; x < SF_VIRTUAL_WIDTH; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 125);
      ctx.lineTo(x, 165);
      ctx.stroke();
    }

    // Door back to harbor (left)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(5, 80, 20, 65);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(10, 110);
    ctx.lineTo(18, 105);
    ctx.lineTo(18, 115);
    ctx.closePath();
    ctx.fill(); // Door Arrow Indicator

    // Swinging Kitchen Door
    ctx.fillStyle = '#92400e';
    ctx.fillRect(35, 75, 25, 60);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(47, 95, 4, 0, Math.PI * 2);
    ctx.fill();
    // Kitchen Fork & Knife graphic
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(43, 82);
    ctx.lineTo(43, 89);
    ctx.moveTo(50, 82);
    ctx.lineTo(50, 89);
    ctx.stroke();

    // Greek Goat Cheese Tapestry
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(80, 60, 35, 60);
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(97, 85, 12, 0, Math.PI * 2);
    ctx.fill();

    // Shady Henchman Goat sitting at the counter
    ctx.fillStyle = '#475569';
    ctx.fillRect(170, 95, 25, 30); // Stool
    // Goat body
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.ellipse(190, 85, 12, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    // Goat head
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.ellipse(186, 65, 8, 11, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // Horns
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(184, 56);
    ctx.quadraticCurveTo(175, 48, 178, 42);
    ctx.moveTo(189, 56);
    ctx.quadraticCurveTo(198, 48, 195, 42);
    ctx.stroke();
    // Eyepatch
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(182, 63, 4, 4);

    // Retro Neon Jukebox (Right Side)
    const jx = 260;
    const jy = 75;
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(jx, jy, 32, 60);
    // Neon Arches
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(jx + 16, jy + 18, 12, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(jx + 6, jy + 25, 20, 25);
    // Music Note icon
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(jx + 13, jy + 40, 2.5, 0, Math.PI * 2);
    ctx.arc(jx + 20, jy + 38, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(jx + 15, jy + 32, 7, 2);
  }

  private drawCantinaKitchen(engine: SpyFoxEngine) {
    const ctx = this.ctx;

    // Greek Kitchen Tiled Background
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, SF_VIRTUAL_WIDTH, 125);
    // Tile Grid Lines
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    for (let x = 0; x < SF_VIRTUAL_WIDTH; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 125);
      ctx.stroke();
    }
    for (let y = 0; y < 125; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(SF_VIRTUAL_WIDTH, y);
      ctx.stroke();
    }

    // Kitchen Floor
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 125, SF_VIRTUAL_WIDTH, 40);

    // Chef Goat
    const cx = 85;
    const cy = 90;
    // Chef uniform
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(cx - 10, cy - 10, 22, 35);
    // Chef Hat (Toque)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy - 30, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - 8, cy - 25, 16, 12);
    // Goat face
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 18, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    // Giant Wooden Ladle
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx + 12, cy - 5);
    ctx.lineTo(cx + 25, cy - 20);
    ctx.stroke();

    // Sack of Flour (White Powder)
    if (!engine.hasFlour) {
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.ellipse(180, 115, 14, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.stroke();
      // Grain spike icon on sack
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(180, 108);
      ctx.lineTo(180, 122);
      ctx.stroke();
    }

    // Giant Simmering Feta Stew Pot
    ctx.fillStyle = '#334155';
    ctx.fillRect(225, 85, 45, 45);
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(247, 85, 20, Math.PI, 0);
    ctx.fill();
    // Steam puffs
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(245, 60, 8, 0, Math.PI * 2);
    ctx.arc(252, 45, 12, 0, Math.PI * 2);
    ctx.fill();

    // Exit to Cantina
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(290, 75, 25, 65);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(298, 105);
    ctx.lineTo(306, 110);
    ctx.lineTo(298, 115);
    ctx.closePath();
    ctx.fill();
  }

  private drawFortress(engine: SpyFoxEngine) {
    const ctx = this.ctx;

    // High-Tech Industrial Bunker
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, SF_VIRTUAL_WIDTH, 125);

    // Metal Grate Floor
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 125, SF_VIRTUAL_WIDTH, 40);

    // Laser Tripwire Emitters
    ctx.fillStyle = '#334155';
    ctx.fillRect(115, 60, 8, 20); // Top Emitter
    ctx.fillRect(115, 120, 8, 20); // Bottom Emitter

    // Red Infrared Laser Beam (if not disabled)
    if (!engine.laserTripwireDisabled) {
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(119, 70);
      ctx.lineTo(119, 130);
      ctx.stroke();
      ctx.restore();
    } else {
      // Disabled Sparkle icon
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(119, 95, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Giant Goat Cheese Fermenter Vat
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(140, 45, 60, 60);
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(170, 75, 18, 0, Math.PI * 2);
    ctx.fill();

    // Door to Missile Silo (Right)
    ctx.fillStyle = '#475569';
    ctx.fillRect(240, 65, 45, 70);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(240, 65, 45, 70);

    // Rocket Icon on Silo Door
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(262, 85);
    ctx.lineTo(256, 105);
    ctx.lineTo(268, 105);
    ctx.closePath();
    ctx.fill();

    // Exit to Pier (Left)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(5, 80, 20, 65);
  }

  private drawMissileSilo(engine: SpyFoxEngine) {
    const ctx = this.ctx;

    // Colossal Underground Launch Facility
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, SF_VIRTUAL_WIDTH, 125);

    // Catwalk Floor
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 125, SF_VIRTUAL_WIDTH, 40);

    // Giant Lactose Missile (Center)
    const rx = 150;
    ctx.fillStyle = engine.missileDisarmed ? '#64748b' : '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(rx, 15);
    ctx.lineTo(rx - 18, 50);
    ctx.lineTo(rx - 18, 125);
    ctx.lineTo(rx + 18, 125);
    ctx.lineTo(rx + 18, 50);
    ctx.closePath();
    ctx.fill();
    // Missile Cow Skull Insignia
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(rx - 12, 65, 24, 6);

    // William the Kid on Elevated Command Balcony
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(135, 40, 30, 25);
    // Goat villain horns & golden suit
    ctx.fillStyle = '#eab308';
    ctx.fillRect(142, 45, 16, 20);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(150, 42, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(147, 36);
    ctx.lineTo(142, 28);
    ctx.moveTo(153, 36);
    ctx.lineTo(158, 28);
    ctx.stroke();

    // Rocket Control Terminal (Left)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(60, 75, 40, 60);
    ctx.strokeStyle = engine.missileDisarmed ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 75, 40, 60);
    // Blinking control lights
    ctx.fillStyle = engine.missileDisarmed ? '#22c55e' : '#ef4444';
    ctx.beginPath();
    ctx.arc(80, 95, 6, 0, Math.PI * 2);
    ctx.fill();

    // Caged Cow: Mr. Udderly (Right)
    const kx = 235;
    const ky = 70;
    // Cage Bars
    ctx.strokeStyle = engine.cowRescued ? '#22c55e' : '#94a3b8';
    ctx.lineWidth = 2;
    ctx.strokeRect(kx, ky, 55, 65);
    for (let b = kx + 8; b < kx + 55; b += 9) {
      ctx.beginPath();
      ctx.moveTo(b, ky);
      ctx.lineTo(b, ky + 65);
      ctx.stroke();
    }
    // Holstein Cow (Mr. Udderly)
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(kx + 28, ky + 40, 16, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    // Black spots
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(kx + 22, ky + 34, 6, 0, Math.PI * 2);
    ctx.arc(kx + 32, ky + 46, 7, 0, Math.PI * 2);
    ctx.fill();
    // Cow face
    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.ellipse(kx + 16, ky + 35, 7, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Exit back to Fortress (Left)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(5, 80, 20, 65);
  }

  private drawCommandCenter(engine: SpyFoxEngine) {
    const ctx = this.ctx;
    // Clean background placeholder, UI handled crisply in SpyFoxCabinet
    ctx.fillStyle = '#022c22';
    ctx.fillRect(0, 0, SF_VIRTUAL_WIDTH, SF_VIRTUAL_HEIGHT);
  }

  private drawVictoryScene(engine: SpyFoxEngine, lang: 'nl' | 'en') {
    const ctx = this.ctx;
    // Clean background placeholder, UI handled crisply in SpyFoxCabinet
    const sky = ctx.createLinearGradient(0, 0, 0, SF_VIRTUAL_HEIGHT);
    sky.addColorStop(0, '#f97316');
    sky.addColorStop(0.5, '#ec4899');
    sky.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, SF_VIRTUAL_WIDTH, SF_VIRTUAL_HEIGHT);
  }

  private drawSpyFox(engine: SpyFoxEngine) {
    const ctx = this.ctx;
    const x = Math.round(engine.foxX);
    const y = Math.round(engine.foxY);
    const facing = engine.facing;

    ctx.save();
    if (facing === 'left') {
      ctx.translate(x, y);
      ctx.scale(-1, 1);
      ctx.translate(-x, -y);
    }

    // Shadow on Ground
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x, y + 10, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fox Tail
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.ellipse(x - 14, y + 2, 8, 4, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff'; // White tip
    ctx.beginPath();
    ctx.arc(x - 20, y + 1, 3, 0, Math.PI * 2);
    ctx.fill();

    // Legs / Dark Navy Trousers
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 5, y + 5, 4, 10);
    ctx.fillRect(x + 2, y + 5, 4, 10);

    // White Smoking Jacket / Tuxedo Torso
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x - 8, y - 14, 16, 20);

    // Black Bowtie
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(x - 3, y - 12);
    ctx.lineTo(x + 3, y - 10);
    ctx.lineTo(x - 3, y - 8);
    ctx.closePath();
    ctx.fill();

    // Fox Head (Orange Fur)
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(x, y - 22, 10, 0, Math.PI * 2);
    ctx.fill();

    // Fox Snout & Cheek Tufts
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x + 6, y - 20, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Black Nose
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x + 10, y - 21, 2, 0, Math.PI * 2);
    ctx.fill();

    // Sly Fox Eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(x + 3, y - 24, 2, 3, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(x - 7, y - 30);
    ctx.lineTo(x - 2, y - 38);
    ctx.lineTo(x + 2, y - 30);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#0f172a'; // Black ear tip
    ctx.beginPath();
    ctx.arc(x - 2, y - 36, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawLaserBeam(engine: SpyFoxEngine) {
    const ctx = this.ctx;
    const l = engine.laserAnim;

    ctx.save();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(l.startX, l.startY);
    ctx.lineTo(l.targetX, l.targetY);
    ctx.stroke();

    // Spark Burst at target
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(l.targetX, l.targetY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
