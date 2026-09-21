/**
 * High-Resolution Procedural Textures for Half-Life (1998)
 * Designed for 1920x1280 high-fidelity rendering:
 * - Black Mesa Sector C Laboratory walls with Lambda (λ) stencils
 * - Catwalk diamond metal plate floors & fluorescent ceilings
 * - First Aid Health Station & HEV Suit Charger wall panels
 * - Hazard warning stripes & computer monitoring screens
 * - Blast doors & smashable wooden research crates
 * - High-detail First-Person viewmodels (Crowbar, Glock 17, SPAS-12, MP5)
 */

import * as THREE from 'three';

function createCanvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  draw(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipMapLinearFilter;
  tex.generateMipmaps = true;
  return tex;
}

// 1. Black Mesa Laboratory Wall with Lambda (λ) & Sector C Stencil
export function createBlackMesaWallTexture(): THREE.CanvasTexture {
  return createCanvasTexture(512, 512, (ctx) => {
    // Concrete industrial gray base
    ctx.fillStyle = '#424549';
    ctx.fillRect(0, 0, 512, 512);

    // Wall panels with metallic seams
    ctx.strokeStyle = '#22252a';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 492, 492);
    ctx.strokeRect(10, 250, 492, 2);

    // Rivets along borders
    ctx.fillStyle = '#6b7280';
    for (let x = 24; x < 500; x += 48) {
      ctx.beginPath();
      ctx.arc(x, 18, 4, 0, Math.PI * 2);
      ctx.arc(x, 494, 4, 0, Math.PI * 2);
      ctx.arc(x, 246, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Yellow Hazard Stripe at bottom
    for (let x = -50; x < 550; x += 36) {
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(x, 512);
      ctx.lineTo(x + 20, 512);
      ctx.lineTo(x + 44, 460);
      ctx.lineTo(x + 24, 460);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.moveTo(x + 20, 512);
      ctx.lineTo(x + 36, 512);
      ctx.lineTo(x + 60, 460);
      ctx.lineTo(x + 44, 460);
      ctx.closePath();
      ctx.fill();
    }

    // Lambda (λ) Logo in Orange Circle
    ctx.save();
    ctx.translate(256, 130);
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffedd5';
    ctx.stroke();

    // Lambda character
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('λ', 0, 4);
    ctx.restore();

    // Sector C Lab Stencil Text
    ctx.fillStyle = '#d1d5db';
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BLACK MESA RESEARCH FACILITY', 256, 205);

    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.fillText('SECTOR C // ANOMALOUS MATERIALS', 256, 230);

    // Weathering / grime stains
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let i = 0; i < 200; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      const rw = Math.random() * 6 + 1;
      const rh = Math.random() * 18 + 2;
      ctx.fillRect(rx, ry, rw, rh);
    }
  });
}

// 2. Floor Catwalk Diamond Metal Plate
export function createFloorPlateTexture(): THREE.CanvasTexture {
  return createCanvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = '#27272a';
    ctx.fillRect(0, 0, 256, 256);

    // Diamond plate pattern
    ctx.fillStyle = '#3f3f46';
    for (let y = 8; y < 256; y += 32) {
      for (let x = 8; x < 256; x += 32) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-6, -2, 12, 4);
        ctx.restore();

        ctx.save();
        ctx.translate(x + 16, y + 16);
        ctx.rotate(-Math.PI / 4);
        ctx.fillRect(-6, -2, 12, 4);
        ctx.restore();
      }
    }

    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 256, 256);
  });
}

// 3. Fluorescent Light Ceiling
export function createCeilingTexture(): THREE.CanvasTexture {
  return createCanvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = '#33373b';
    ctx.fillRect(0, 0, 256, 256);

    // Ventilation grilles
    ctx.fillStyle = '#1c1e21';
    ctx.fillRect(20, 20, 216, 216);

    // Bright fluorescent fixture in center
    ctx.fillStyle = '#f8fafc';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 15;
    ctx.fillRect(40, 90, 176, 76);
    ctx.shadowBlur = 0;

    // Tube grill
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    for (let x = 50; x < 210; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 90);
      ctx.lineTo(x, 166);
      ctx.stroke();
    }
  });
}

// 4. Wall-Mounted First Aid Health Station
export function createHealthStationTexture(): THREE.CanvasTexture {
  return createCanvasTexture(256, 512, (ctx) => {
    // Metal housing
    ctx.fillStyle = '#d1d5db';
    ctx.fillRect(0, 0, 256, 512);

    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 244, 500);

    // Green Medical Cross
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(108, 30, 40, 100);
    ctx.fillRect(78, 60, 100, 40);

    // Header text
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FIRST AID', 128, 160);

    // Digital readout screen
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(32, 180, 192, 70);
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 28px monospace';
    ctx.fillText('100% STERILE', 128, 224);

    // Glass medicine vial chamber
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(48, 270, 160, 140);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(56, 275, 25, 130);

    // Instruction prompt
    ctx.fillStyle = '#e11d48';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('[HOLD E TO HEAL]', 128, 450);
  });
}

// 5. Wall-Mounted HEV Suit Recharger Station
export function createHEVStationTexture(): THREE.CanvasTexture {
  return createCanvasTexture(256, 512, (ctx) => {
    // Dark steel housing with iconic orange trim
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 256, 512);

    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, 244, 500);

    // Orange HEV Suit Shield Header
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(128, 80, 50, 0, Math.PI * 2);
    ctx.fill();

    // High Voltage Lightning Bolt
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(136, 45);
    ctx.lineTo(110, 85);
    ctx.lineTo(128, 85);
    ctx.lineTo(120, 115);
    ctx.lineTo(146, 75);
    ctx.lineTo(128, 75);
    ctx.closePath();
    ctx.fill();

    // Title
    ctx.fillStyle = '#ffedd5';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('HEV MARK IV', 128, 160);
    ctx.font = 'bold 16px monospace';
    ctx.fillText('SUIT POWER UNIT', 128, 185);

    // Gauge Display
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(32, 210, 192, 80);
    ctx.fillStyle = '#fb923c';
    ctx.font = 'bold 28px monospace';
    ctx.fillText('VOLTAGE: OK', 128, 255);

    // Power coils
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 6;
    for (let y = 310; y < 420; y += 22) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(216, y);
      ctx.stroke();
    }

    // Action Prompt
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('[HOLD E TO CHARGE]', 128, 470);
  });
}

// 6. Computer Monitoring Terminal Console
export function createComputerConsoleTexture(): THREE.CanvasTexture {
  return createCanvasTexture(512, 512, (ctx) => {
    ctx.fillStyle = '#1e2024';
    ctx.fillRect(0, 0, 512, 512);

    // Screen bezel
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(20, 20, 472, 340);

    // Radar / Oscilloscope telemetry
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 30; x < 480; x += 10) {
      const y = 180 + Math.sin(x * 0.05) * 50 + (Math.random() * 15 - 7);
      if (x === 30) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Critical Warning Header
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('CRITICAL: RESONANCE CASCADE', 40, 60);

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('MASS SPECTROMETER: OVERLOAD (105%)', 40, 95);
    ctx.fillText('PORTAL INSTABILITY DETECTED IN SECTOR C', 40, 120);

    // Keyboard and control panels at bottom
    ctx.fillStyle = '#334155';
    ctx.fillRect(20, 380, 472, 110);

    // Light-up buttons
    const colors = ['#ef4444', '#eab308', '#22c55e', '#3b82f6'];
    for (let x = 40; x < 460; x += 40) {
      ctx.fillStyle = colors[(x / 40) % colors.length];
      ctx.fillRect(x, 400, 28, 22);
      ctx.fillRect(x, 435, 28, 22);
    }
  });
}

// 7. Heavy Blast Door with Hazard Stripes
export function createBlastDoorTexture(): THREE.CanvasTexture {
  return createCanvasTexture(512, 512, (ctx) => {
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, 0, 512, 512);

    // Heavy reinforced metal frame
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, 500, 500);

    // Vertical seam in middle
    ctx.strokeRect(250, 0, 12, 512);

    // Hazard Stripes on bottom & top
    for (let x = -50; x < 550; x += 40) {
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(x, 80);
      ctx.lineTo(x + 20, 80);
      ctx.lineTo(x + 40, 0);
      ctx.lineTo(x + 20, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.moveTo(x + 20, 80);
      ctx.lineTo(x + 40, 80);
      ctx.lineTo(x + 60, 0);
      ctx.lineTo(x + 40, 0);
      ctx.closePath();
      ctx.fill();
    }

    // Door Portal Window
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(256, 200, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Security sign
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(156, 320, 200, 50);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('AUTHORIZED ONLY', 256, 352);
  });
}

// 8. Smashable Wooden Black Mesa Research Crate
export function createCrateTexture(): THREE.CanvasTexture {
  return createCanvasTexture(256, 256, (ctx) => {
    // Wood plank background
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(0, 0, 256, 256);

    // Dark wood border
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, 242, 242);

    // Cross diagonals
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(14, 14);
    ctx.lineTo(242, 242);
    ctx.moveTo(242, 14);
    ctx.lineTo(14, 242);
    ctx.stroke();

    // Stenciled Label
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BLACK MESA', 128, 115);
    ctx.fillText('CARGO - FRAGILE', 128, 145);
  });
}

// 9. Radioactive Slime Ooze
export function createRadioactiveSlimeTexture(): THREE.CanvasTexture {
  return createCanvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, 256, 256);

    // Glowing green bubbles
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const r = Math.random() * 14 + 4;
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // Bubble highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}
