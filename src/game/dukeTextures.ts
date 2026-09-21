/**
 * High-Resolution Textures Generator for Duke Nukem 3D & Blood
 * Generates procedural HD 512x512 textures with high pixel fidelity:
 * - Brick Street & Alley walls with graffiti ("NUK'EM", "L.A.R.D.")
 * - Cinema Marquee & Hollywood Neon signs ("RODENT", "ADULT THEATER")
 * - High-tech ventilation ducts & steel blast doors
 * - Interactive Bathroom Mirror texture (chrome specular reflection)
 * - Vending machines (Cola / Soda / Snacks)
 * - Light switches (ON / OFF states)
 * - Restroom tiles & toilets
 * - Pig Cop & Cultist sprite sheets
 * - First-Person Weapons: Mighty Foot, Glock 19 Pistol, Shotgun, Chaingun Cannon, RPG Launcher, Pipebomb & Detonator
 */

import * as THREE from 'three';

// Procedural Canvas Texture Helper
function createCanvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  draw(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.LinearMipMapLinearFilter;
  tex.generateMipmaps = true;
  return tex;
}

// 1. Hollywood Red Brick Wall with Graffiti
export function createHollywoodBrickTexture(): THREE.CanvasTexture {
  return createCanvasTexture(512, 512, (ctx) => {
    // Dark brown/red urban brick background
    ctx.fillStyle = '#4a1e1b';
    ctx.fillRect(0, 0, 512, 512);

    // Brick grid
    const brickH = 24;
    const brickW = 48;
    ctx.strokeStyle = '#1e110f';
    ctx.lineWidth = 3;

    let row = 0;
    for (let y = 0; y < 512; y += brickH) {
      const offset = (row % 2 === 0) ? 0 : brickW / 2;
      for (let x = -brickW; x < 512 + brickW; x += brickW) {
        // Subtle brick shading variations
        const shade = Math.floor(Math.random() * 30);
        ctx.fillStyle = `rgb(${75 + shade}, ${30 + Math.floor(shade / 2)}, ${25 + Math.floor(shade / 3)})`;
        ctx.fillRect(x + offset + 2, y + 2, brickW - 4, brickH - 4);
        ctx.strokeRect(x + offset, y, brickW, brickH);
      }
      row++;
    }

    // Grunge & grime splatter
    ctx.fillStyle = 'rgba(10, 10, 10, 0.45)';
    for (let i = 0; i < 400; i++) {
      const gx = Math.random() * 512;
      const gy = Math.random() * 512;
      const gr = Math.random() * 12 + 2;
      ctx.beginPath();
      ctx.arc(gx, gy, gr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Graffiti: "DUKE" in neon spray
    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.fillText('NUKEM', 80, 260);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeText('NUKEM', 80, 260);

    // Poster: "JOIN EDF"
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(320, 200, 140, 190);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('EARTH DEFENSE', 330, 230);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('JOIN NOW!', 340, 280);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(340, 310, 100, 60);
  });
}

// 2. Cinema Marquee / Neon Street Billboard
export function createCinemaMarqueeTexture(): THREE.CanvasTexture {
  return createCanvasTexture(512, 512, (ctx) => {
    // Black art-deco cinema facade
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, 512, 512);

    // Gold/brass art deco borders
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 8;
    ctx.strokeRect(16, 16, 480, 480);
    ctx.lineWidth = 3;
    ctx.strokeRect(32, 32, 448, 448);

    // Light bulbs along border
    for (let i = 40; i < 480; i += 32) {
      ctx.fillStyle = (i % 64 === 0) ? '#fef08a' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(i, 24, 6, 0, Math.PI * 2);
      ctx.arc(i, 488, 6, 0, Math.PI * 2);
      ctx.arc(24, i, 6, 0, Math.PI * 2);
      ctx.arc(488, i, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glowing Neon Marquee Title
    ctx.fillStyle = '#050505';
    ctx.fillRect(48, 80, 416, 352);

    ctx.fillStyle = '#dc2626';
    ctx.font = '900 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOLLYWOOD', 256, 150);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('NOW SHOWING', 256, 220);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 42px sans-serif';
    ctx.fillText('ATTACK OF ALIENS', 256, 290);

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('★ ADULTS ONLY ★', 256, 360);
  });
}

// 3. High-Tech Steel Blast Door / Caution Stripes
export function createSteelDoorTexture(lockedColor?: 'red' | 'blue' | 'yellow'): THREE.CanvasTexture {
  return createCanvasTexture(512, 512, (ctx) => {
    // Industrial metal plate
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 512, 512);

    // Metal panel bevels
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(32, 32, 448, 200);
    ctx.fillRect(32, 280, 448, 200);

    // Hazard Caution Stripes on center seam
    const stripeW = 32;
    for (let x = 0; x < 512; x += stripeW * 2) {
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(x, 236);
      ctx.lineTo(x + stripeW, 236);
      ctx.lineTo(x, 276);
      ctx.lineTo(x - stripeW, 276);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(x + stripeW, 236);
      ctx.lineTo(x + stripeW * 2, 236);
      ctx.lineTo(x + stripeW, 276);
      ctx.lineTo(x, 276);
      ctx.fill();
    }

    // Door Rivets
    ctx.fillStyle = '#94a3b8';
    for (let y = 50; y < 480; y += 80) {
      ctx.beginPath();
      ctx.arc(50, y, 6, 0, Math.PI * 2);
      ctx.arc(462, y, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Access Card Terminal
    if (lockedColor) {
      const colorHex = lockedColor === 'red' ? '#ef4444' : lockedColor === 'blue' ? '#3b82f6' : '#eab308';
      ctx.fillStyle = '#020617';
      ctx.fillRect(206, 110, 100, 100);
      ctx.strokeStyle = colorHex;
      ctx.lineWidth = 4;
      ctx.strokeRect(206, 110, 100, 100);

      ctx.fillStyle = colorHex;
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ACCESS', 256, 145);
      ctx.fillText(lockedColor.toUpperCase(), 256, 175);
    } else {
      // Standard UAC / EDF handle
      ctx.fillStyle = '#64748b';
      ctx.fillRect(236, 120, 40, 80);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(246, 130, 20, 20);
    }
  });
}

// 4. Soda Vending Machine / Water Cooler Texture
export function createVendingMachineTexture(): THREE.CanvasTexture {
  return createCanvasTexture(512, 512, (ctx) => {
    // Red Duke Cola Vending Machine
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(0, 0, 512, 512);

    // Glowing front display glass
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(32, 40, 448, 260);

    // DUKE COLA Glowing Logo
    ctx.fillStyle = '#fef08a';
    ctx.font = '900 46px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DUKE COLA', 256, 120);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('ICE COLD • +10 HP', 256, 170);

    // Selection buttons
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(70 + i * 100, 210, 70, 60);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`$1`, 105 + i * 100, 246);
    }

    // Can Drop Dispenser Slot
    ctx.fillStyle = '#020617';
    ctx.fillRect(100, 360, 312, 100);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 6;
    ctx.strokeRect(100, 360, 312, 100);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('PUSH FOR COLD CAN', 256, 420);
  });
}

// 5. Light Switch & Wall Panel
export function createLightSwitchTexture(isOn: boolean): THREE.CanvasTexture {
  return createCanvasTexture(256, 256, (ctx) => {
    // Metal wall plate
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(40, 40, 176, 176);

    // Switch rocker
    ctx.fillStyle = isOn ? '#22c55e' : '#ef4444';
    ctx.fillRect(88, isOn ? 60 : 130, 80, 66);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(isOn ? 'ON' : 'OFF', 128, isOn ? 100 : 170);

    // Glow indicator
    ctx.fillStyle = isOn ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)';
    ctx.beginPath();
    ctx.arc(128, isOn ? 93 : 163, 50, 0, Math.PI * 2);
    ctx.fill();
  });
}

// 6. Bathroom Tiles & Mirror (Reflective Look)
export function createRestroomTileTexture(): THREE.CanvasTexture {
  return createCanvasTexture(512, 512, (ctx) => {
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, 512, 512);

    const tileSize = 64;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;

    for (let y = 0; y < 512; y += tileSize) {
      for (let x = 0; x < 512; x += tileSize) {
        ctx.fillStyle = ((x / tileSize + y / tileSize) % 2 === 0) ? '#f8fafc' : '#0284c7';
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }
  });
}

// 7. Cinema Carpet / City Asphalt Road
export function createAsphaltRoadTexture(): THREE.CanvasTexture {
  return createCanvasTexture(512, 512, (ctx) => {
    // Dark rough asphalt
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, 512, 512);

    // Road noise & gravel
    for (let i = 0; i < 2000; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      const val = Math.floor(Math.random() * 50) + 30;
      ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
      ctx.fillRect(rx, ry, 2, 2);
    }

    // Yellow double lane markings
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(246, 0, 8, 512);
    ctx.fillRect(258, 0, 8, 512);
  });
}

// 8. Ceiling Vent / Grate Texture
export function createCeilingVentTexture(): THREE.CanvasTexture {
  return createCanvasTexture(512, 512, (ctx) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = '#334155';
    for (let y = 20; y < 512; y += 40) {
      ctx.fillRect(20, y, 472, 20);
    }

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 502, 502);
  });
}

// 9. E1L2: Red Light District Neon Façade & Bar
export function createRedLightTexture(): THREE.CanvasTexture {
  return createCanvasTexture(512, 512, (ctx) => {
    // Dark magenta/purple club facade
    ctx.fillStyle = '#1e112a';
    ctx.fillRect(0, 0, 512, 512);

    // Glowing neon border
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 472, 472);

    // Neon signs
    ctx.fillStyle = '#f43f5e';
    ctx.font = '900 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RED LIGHT', 256, 120);

    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('CLUB & LOUNGE', 256, 180);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '900 48px monospace';
    ctx.fillText('★ XXX ★', 256, 260);

    // Neon silhouette & pole
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(256, 300);
    ctx.lineTo(256, 460);
    ctx.stroke();

    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(256, 340, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e11d48';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('DANCE FLOOR OPEN', 256, 440);
  });
}

// 10. E1L3: Toxic Dump Hazardous Waste & Acid Slime Texture
export function createToxicSlimeTexture(): THREE.CanvasTexture {
  return createCanvasTexture(512, 512, (ctx) => {
    // Radioactive neon green / acid pool
    ctx.fillStyle = '#14532d';
    ctx.fillRect(0, 0, 512, 512);

    // Bubbles and acid eddies
    for (let i = 0; i < 40; i++) {
      const bx = (i * 73) % 512;
      const by = (i * 97) % 512;
      const rad = 10 + (i % 25);

      const grad = ctx.createRadialGradient(bx, by, 2, bx, by, rad);
      grad.addColorStop(0, '#86efac');
      grad.addColorStop(0.5, '#22c55e');
      grad.addColorStop(1, '#15803d');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(bx, by, rad, 0, Math.PI * 2);
      ctx.fill();

      // Slime highlight bubble
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bx - rad * 0.3, by - rad * 0.3, rad * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Radiation hazard warning text
    ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('☣ TOXIC SLIME ☣', 256, 260);
  });
}

// 11. Industrial Nuclear Biohazard Wall
export function createToxicWallTexture(): THREE.CanvasTexture {
  return createCanvasTexture(512, 512, (ctx) => {
    // Dark rusted industrial metal
    ctx.fillStyle = '#292524';
    ctx.fillRect(0, 0, 512, 512);

    // Steel grid plates
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, 480, 480);
    ctx.strokeRect(32, 32, 216, 216);
    ctx.strokeRect(264, 32, 216, 216);
    ctx.strokeRect(32, 264, 216, 216);
    ctx.strokeRect(264, 264, 216, 216);

    // Nuclear hazard symbol
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(256, 256, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(256, 256, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('WASTE SECTOR 7', 256, 100);
    ctx.fillText('HIGH RADIATION', 256, 420);
  });
}

// 12. Interactive Bathroom Mirror (Dynamic Specular & Duke Reflection)
export function createBathroomMirrorTexture(broken: boolean = false): THREE.CanvasTexture {
  return createCanvasTexture(512, 512, (ctx) => {
    // Chrome / Specular mirror background with blue-grey tint
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#e2e8f0');
    grad.addColorStop(0.3, '#94a3b8');
    grad.addColorStop(0.5, '#f8fafc');
    grad.addColorStop(0.7, '#64748b');
    grad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Silver mirror frame
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 14;
    ctx.strokeRect(10, 10, 492, 492);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 472, 472);

    if (broken) {
      // Shattered glass cracks
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Starburst cracks from center
      const cx = 256;
      const cy = 256;
      for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * Math.PI * 2;
        const dist = 80 + Math.random() * 160;
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(ang) * dist, cy + Math.sin(ang) * dist);
        // Jagged branch
        ctx.lineTo(cx + Math.cos(ang + 0.3) * (dist + 40), cy + Math.sin(ang + 0.3) * (dist + 40));
      }
      ctx.stroke();

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('[ SHATTERED GLASS ]', 256, 450);
    } else {
      // Duke Nukem's Reflection in the Mirror!
      // Blonde Flat-Top Hair
      ctx.fillStyle = '#fde047';
      ctx.fillRect(206, 130, 100, 36);

      // Head & Face
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.arc(256, 190, 44, 0, Math.PI * 2);
      ctx.fill();

      // Iconic Dark Sunglasses
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(224, 172, 28, 16, 4);
      ctx.roundRect(260, 172, 28, 16, 4);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(252, 180);
      ctx.lineTo(260, 180);
      ctx.stroke();

      // Smirk
      ctx.strokeStyle = '#be123c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(256, 206, 12, 0.1, Math.PI * 0.9);
      ctx.stroke();

      // Muscular Neck & Red Tank Top
      ctx.fillStyle = '#fbcfe8';
      ctx.fillRect(238, 230, 36, 30);

      ctx.fillStyle = '#dc2626'; // Red Tank Top
      ctx.beginPath();
      ctx.moveTo(196, 260);
      ctx.lineTo(316, 260);
      ctx.lineTo(336, 380);
      ctx.lineTo(176, 380);
      ctx.closePath();
      ctx.fill();

      // Bandolier / Ammo Belts across chest
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(190, 260);
      ctx.lineTo(320, 380);
      ctx.stroke();

      // Brass Bullets on belt
      ctx.fillStyle = '#f59e0b';
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(210 + i * 18, 275 + i * 16, 8, 14);
      }

      // Mirror reflection label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('"DAMN, I\'M LOOKING GOOD!"', 256, 440);
    }
  });
}

