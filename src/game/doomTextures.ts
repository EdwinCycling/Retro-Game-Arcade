import * as THREE from 'three';

/**
 * Procedural Pixel Art Texture Generator for DOOM 1993
 * Recreates authentic id Software 64x64 and 128x128 textures:
 * - STARGR1: Grey/Green UAC Tech Base Panel
 * - BROWN1: Weathered Gothic Brick Wall
 * - COMPUTE: UAC Terminal with flashing oscilloscope/indicators
 * - SUPPORT2: Steel Girder with Hazard Warning Stripes
 * - EXITDOOR: Iconic red hazard exit door
 * - NUKAGE3: Toxic glowing green radioactive sludge
 * - CEIL3_5: Industrial ceiling grid
 * - SKY1: Red Phobos mountain horizon
 */

// Helper to create a Three.js CanvasTexture with NearestFilter for authentic DOS pixel art
function createCanvasTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = false;
    draw(ctx, canvas);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

// 1. STARGR1: UAC Tech Base Panel (Grey/Greenish steel with rivets, seams, and bevels)
export function createStargrTexture(): THREE.CanvasTexture {
  return createCanvasTexture(128, 128, (ctx) => {
    // Base green-grey steel tone with authentic Doom palette
    ctx.fillStyle = '#49524b';
    ctx.fillRect(0, 0, 128, 128);

    // Bevel highlights & shadows
    ctx.fillStyle = '#657367';
    ctx.fillRect(0, 0, 128, 3);
    ctx.fillRect(0, 0, 3, 128);
    ctx.fillStyle = '#222924';
    ctx.fillRect(0, 125, 128, 3);
    ctx.fillRect(125, 0, 3, 128);

    // Heavy horizontal center girder seam
    ctx.fillStyle = '#1c221e';
    ctx.fillRect(0, 62, 128, 4);
    ctx.fillStyle = '#6e7e70';
    ctx.fillRect(0, 66, 128, 2);

    // Vertical seam
    ctx.fillStyle = '#1c221e';
    ctx.fillRect(62, 0, 4, 128);
    ctx.fillStyle = '#6e7e70';
    ctx.fillRect(66, 0, 2, 128);

    // Darker inner recessed panels
    ctx.fillStyle = '#3a423c';
    ctx.fillRect(6, 6, 52, 52);
    ctx.fillRect(70, 6, 52, 52);
    ctx.fillRect(6, 70, 52, 52);
    ctx.fillRect(70, 70, 52, 52);

    // Sub-panel bevels
    ctx.fillStyle = '#556358';
    ctx.fillRect(6, 6, 52, 2);
    ctx.fillRect(6, 6, 2, 52);
    ctx.fillRect(70, 6, 52, 2);
    ctx.fillRect(70, 6, 2, 52);
    ctx.fillRect(6, 70, 52, 2);
    ctx.fillRect(6, 70, 2, 52);
    ctx.fillRect(70, 70, 52, 2);
    ctx.fillRect(70, 70, 2, 52);

    // Authentic UAC Rivets in corners
    const rivets = [
      [10, 10], [50, 10], [74, 10], [114, 10],
      [10, 50], [50, 50], [74, 50], [114, 50],
      [10, 74], [50, 74], [74, 74], [114, 74],
      [10, 114], [50, 114], [74, 114], [114, 114],
    ];
    rivets.forEach(([rx, ry]) => {
      ctx.fillStyle = '#8ca090';
      ctx.fillRect(rx, ry, 4, 4);
      ctx.fillStyle = '#19201a';
      ctx.fillRect(rx + 2, ry + 2, 2, 2);
    });

    // UAC Air vents in top right panel
    ctx.fillStyle = '#18201a';
    for (let y = 18; y < 48; y += 6) {
      ctx.fillRect(76, y, 40, 4);
      ctx.fillStyle = '#606f62';
      ctx.fillRect(76, y + 4, 40, 1);
      ctx.fillStyle = '#18201a';
    }

    // Danger hazard chevron stripe in bottom left panel
    ctx.fillStyle = '#222924';
    ctx.fillRect(10, 80, 44, 14);
    ctx.fillStyle = '#eab308';
    for (let x = 10; x < 54; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x, 80);
      ctx.lineTo(x + 5, 80);
      ctx.lineTo(x - 2, 94);
      ctx.lineTo(x - 7, 94);
      ctx.closePath();
      ctx.fill();
    }
  });
}

// 2. BROWN1 / BRICK: Classic gothic brown/tan Doom brick with grout & weathering
export function createDoomBrickTexture(): THREE.CanvasTexture {
  return createCanvasTexture(128, 128, (ctx) => {
    // Dark mortar base
    ctx.fillStyle = '#1c120c';
    ctx.fillRect(0, 0, 128, 128);

    const brickH = 16;
    const brickW = 32;

    for (let row = 0; row < 8; row++) {
      const y = row * brickH;
      const xOffset = (row % 2 === 0) ? 0 : 16;

      for (let x = -16; x < 128; x += brickW) {
        const brickX = x + xOffset;
        const colorVariant = ((row + x) % 3 === 0) ? '#7a4e2d' : ((row + x) % 3 === 1) ? '#8b5a35' : '#643f24';
        ctx.fillStyle = colorVariant;
        ctx.fillRect(brickX + 2, y + 2, brickW - 4, brickH - 4);

        // Brick top highlight
        ctx.fillStyle = '#a86f44';
        ctx.fillRect(brickX + 2, y + 2, brickW - 4, 2);
        ctx.fillRect(brickX + 2, y + 2, 2, brickH - 4);

        // Brick bottom & right shadow
        ctx.fillStyle = '#2b190e';
        ctx.fillRect(brickX + 2, y + brickH - 4, brickW - 4, 2);
        ctx.fillRect(brickX + brickW - 4, y + 2, 2, brickH - 4);

        // Weathering & stone chips
        ctx.fillStyle = '#1a0f08';
        ctx.fillRect(brickX + 6, y + 6, 2, 2);
        ctx.fillRect(brickX + 18, y + 9, 3, 2);
        ctx.fillStyle = '#946138';
        ctx.fillRect(brickX + 12, y + 4, 2, 2);
      }
    }
  });
}

// 3. COMPUTE: Tech Console with glowing oscilloscope & blinking LEDs (with animated frame support)
export function createComputeTexture(frame: number = 0): THREE.CanvasTexture {
  return createCanvasTexture(64, 64, (ctx) => {
    // Industrial UAC grey metal panel casing with rivets
    ctx.fillStyle = '#27272a';
    ctx.fillRect(0, 0, 64, 64);

    // Bevel edges
    ctx.fillStyle = '#52525b';
    ctx.fillRect(0, 0, 64, 2);
    ctx.fillRect(0, 0, 2, 64);
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 62, 64, 2);
    ctx.fillRect(62, 0, 2, 64);

    // Top CRT Monitor Display Bezel
    ctx.fillStyle = '#18181b';
    ctx.fillRect(4, 4, 56, 32);

    // Dark green / amber CRT phosphor screen
    const isAmberScreen = frame % 2 === 1;
    ctx.fillStyle = isAmberScreen ? '#451a03' : '#022c22';
    ctx.fillRect(6, 6, 52, 28);

    // CRT Scanlines
    for (let y = 6; y < 34; y += 2) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(6, y, 52, 1);
    }

    // Oscilloscope sine wave / radar grid
    ctx.strokeStyle = isAmberScreen ? '#f59e0b' : '#10b981';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const phase = frame * 1.5;
    for (let x = 6; x < 58; x += 2) {
      const y = 20 + Math.sin((x + phase * 6) * 0.28) * 6.5;
      if (x === 6) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Radar blip & scrolling computer text lines
    ctx.fillStyle = isAmberScreen ? '#fbbf24' : '#34d399';
    const textOffset = (frame * 3) % 8;
    ctx.fillRect(10, 9 + (textOffset > 4 ? 1 : 0), 16, 2);
    ctx.fillRect(10, 13, 24, 2);
    ctx.fillRect(10, 17, 12, 2);

    // Glowing blinking status LED on CRT corner
    ctx.fillStyle = (frame % 3 === 0) ? '#ef4444' : '#22c55e';
    ctx.fillRect(48, 8, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(49, 9, 2, 2);

    // Bottom switchboard and buttons
    ctx.fillStyle = '#1e1e24';
    ctx.fillRect(4, 38, 56, 22);

    // Flashing keypad lights & status strips
    const buttonColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        const colorIdx = (i + j + frame) % buttonColors.length;
        ctx.fillStyle = buttonColors[colorIdx];
        ctx.fillRect(8 + i * 13, 42 + j * 5, 8, 3);
        // Button highlight
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(8 + i * 13, 42 + j * 5, 8, 1);
      }
    }
  });
}

// 4. SUPPORT2: Steel Girder with Hazard Warning Stripes
export function createSupportTexture(): THREE.CanvasTexture {
  return createCanvasTexture(64, 64, (ctx) => {
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(0, 0, 64, 64);

    // Bevel edges
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(0, 0, 64, 3);
    ctx.fillRect(0, 0, 3, 64);
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 61, 64, 3);
    ctx.fillRect(61, 0, 3, 64);

    // Center yellow & black caution hazard stripes
    const stripeY = 16;
    const stripeH = 32;
    ctx.fillStyle = '#111827';
    ctx.fillRect(6, stripeY, 52, stripeH);

    // Diagonal hazard stripes
    ctx.fillStyle = '#f59e0b';
    for (let x = -20; x < 80; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, stripeY);
      ctx.lineTo(x + 10, stripeY);
      ctx.lineTo(x + 10 + stripeH, stripeY + stripeH);
      ctx.lineTo(x + stripeH, stripeY + stripeH);
      ctx.closePath();
      ctx.fill();
    }
  });
}

// 4b. BIGDOOR: Classic DOOM Steel Blast Sliding Door
export function createNormalDoorTexture(): THREE.CanvasTexture {
  return createCanvasTexture(64, 64, (ctx) => {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 64, 64);

    // Outer industrial steel frame
    ctx.fillStyle = '#334155';
    ctx.fillRect(2, 2, 60, 60);

    // Top hazard caution stripes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(6, 6, 52, 10);
    const stripeW = 8;
    for (let x = 6; x < 58; x += stripeW * 2) {
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(x, 6);
      ctx.lineTo(x + 6, 6);
      ctx.lineTo(x + 2, 16);
      ctx.lineTo(x - 4, 16);
      ctx.closePath();
      ctx.fill();
    }

    // Heavy vertical sliding steel panels
    ctx.fillStyle = '#475569';
    ctx.fillRect(8, 18, 48, 42);

    // Panel dividing seams
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(8, 38, 48, 2);
    ctx.fillRect(31, 18, 2, 42);

    // Rivets
    ctx.fillStyle = '#94a3b8';
    [12, 50].forEach((rx) => {
      [22, 34, 42, 54].forEach((ry) => {
        ctx.fillRect(rx, ry, 2, 2);
      });
    });

    // Hydraulic center lock & Green unlocked status light
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(26, 32, 12, 14);
    ctx.fillStyle = '#22c55e'; // Green light = Unlocked door
    ctx.fillRect(29, 35, 6, 3);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(28, 40, 8, 4);
  });
}

// 5. EXITDOOR: The iconic red UAC Exit sign and heavy hydraulic hatch
export function createExitDoorTexture(): THREE.CanvasTexture {
  return createCanvasTexture(64, 64, (ctx) => {
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, 64, 64);

    // Red frame border
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(2, 2, 60, 60);

    // Red illuminated "EXIT" sign on top
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(8, 6, 48, 14);
    ctx.fillStyle = '#f87171';
    ctx.fillRect(10, 8, 44, 10);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('EXIT', 22, 16);

    // Heavy vertical sliding hydraulic blast door
    ctx.fillStyle = '#374151';
    ctx.fillRect(8, 22, 48, 38);

    // Door bevels & chevron stripes
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(8, 22, 2, 38);
    ctx.fillRect(54, 22, 2, 38);
    ctx.fillRect(8, 40, 48, 2);

    // Center manual release handle
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(28, 36, 8, 4);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(30, 44, 4, 10);
  });
}

// 6. KEYCARD DOORS (Blue, Yellow, Red)
export function createKeyDoorTexture(keyType: 'blue' | 'yellow' | 'red'): THREE.CanvasTexture {
  return createCanvasTexture(64, 64, (ctx) => {
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, 64, 64);

    const color = keyType === 'blue' ? '#2563eb' : keyType === 'yellow' ? '#eab308' : '#dc2626';
    const lightColor = keyType === 'blue' ? '#60a5fa' : keyType === 'yellow' ? '#fef08a' : '#f87171';

    // Key stripe columns on left and right
    ctx.fillStyle = color;
    ctx.fillRect(2, 0, 8, 64);
    ctx.fillRect(54, 0, 8, 64);

    // Keycard slot reader in middle
    ctx.fillStyle = '#111827';
    ctx.fillRect(24, 26, 16, 16);
    ctx.fillStyle = lightColor;
    ctx.fillRect(27, 29, 10, 3); // Light indicator
    ctx.fillStyle = '#000000';
    ctx.fillRect(28, 35, 8, 2); // Swipe slot

    // Door panels
    ctx.fillStyle = '#374151';
    ctx.fillRect(12, 2, 40, 22);
    ctx.fillRect(12, 44, 40, 18);
  });
}

// 7. NUKAGE3: Toxic Glowing Green Acid Floor (with animated glow)
export function createNukageTexture(frame: number = 0): THREE.CanvasTexture {
  return createCanvasTexture(64, 64, (ctx) => {
    ctx.fillStyle = '#14532d'; // Deep toxic green
    ctx.fillRect(0, 0, 64, 64);

    // Radioactive swirl patterns
    const swirl = (frame * 4) % 64;
    ctx.fillStyle = '#16a34a';
    for (let i = 0; i < 64; i += 16) {
      for (let j = 0; j < 64; j += 16) {
        const offset = ((i + j + swirl) % 32 < 16) ? 4 : 0;
        ctx.fillRect(i + offset, j, 8, 8);
      }
    }

    // Glowing radioactive acid bubbles
    ctx.fillStyle = '#4ade80';
    const bubbles = [
      [12, 14, 3], [36, 18, 4], [22, 40, 2], [50, 48, 3], [8, 52, 2], [42, 8, 2]
    ];
    bubbles.forEach(([bx, by, rad]) => {
      const animatedR = rad + (Math.sin(frame + bx) > 0 ? 1 : 0);
      ctx.beginPath();
      ctx.arc((bx + swirl * 0.2) % 64, by, animatedR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#bbf7d0';
      ctx.fillRect((bx + swirl * 0.2) % 64 - 1, by - 1, 2, 2); // Highlight
      ctx.fillStyle = '#4ade80';
    });
  });
}

// 8. CEIL3_5: Standard industrial ceiling
export function createCeilingTexture(): THREE.CanvasTexture {
  return createCanvasTexture(64, 64, (ctx) => {
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, 64, 64);

    // Steel grid lines
    ctx.fillStyle = '#27272a';
    ctx.fillRect(0, 0, 64, 2);
    ctx.fillRect(0, 0, 2, 64);
    ctx.fillRect(0, 31, 64, 2);
    ctx.fillRect(31, 0, 2, 64);

    // Fluorescent light fixtures in center
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(10, 10, 12, 12);
    ctx.fillRect(42, 10, 12, 12);
    ctx.fillRect(10, 42, 12, 12);
    ctx.fillRect(42, 42, 12, 12);

    ctx.fillStyle = '#f4f4f5';
    ctx.fillRect(12, 12, 8, 8);
    ctx.fillRect(44, 12, 8, 8);
    ctx.fillRect(12, 44, 8, 8);
    ctx.fillRect(44, 44, 8, 8);
  });
}

// 9. FLOOR4_8: Techbase Grey Floor Tile
export function createFloorTexture(): THREE.CanvasTexture {
  return createCanvasTexture(64, 64, (ctx) => {
    ctx.fillStyle = '#27272a';
    ctx.fillRect(0, 0, 64, 64);

    // Tile grid
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, 64, 2);
    ctx.fillRect(0, 0, 2, 64);
    ctx.fillRect(0, 62, 64, 2);
    ctx.fillRect(62, 0, 2, 64);

    // Tile highlight
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(2, 2, 60, 1);
    ctx.fillRect(2, 2, 1, 60);

    // Diamond plate metal texture
    ctx.fillStyle = '#52525b';
    for (let y = 6; y < 60; y += 8) {
      for (let x = 6; x < 60; x += 8) {
        ctx.fillRect(x, y, 2, 2);
        ctx.fillRect(x + 4, y + 4, 2, 2);
      }
    }
  });
}

// --- SPRITE GENERATORS FOR WEAPONS & HUD ---

/**
 * The Legendary Doomguy Face for STBAR HUD!
 * Renders the Marine's status face with real damage states and eye movements
 */
export function drawDoomguyFace(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  health: number,
  lookDir: 'center' | 'left' | 'right' = 'center',
  godMode: boolean = false,
  isGrinning: boolean = false
) {
  ctx.clearRect(0, 0, width, height);
  const scale = width / 24;

  // Background behind face
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(0, 0, width, height);

  // Marine Hair (Brown military crewcut)
  ctx.fillStyle = '#543d2b';
  ctx.fillRect(3 * scale, 1 * scale, 18 * scale, 5 * scale);
  ctx.fillRect(2 * scale, 3 * scale, 20 * scale, 3 * scale);

  // Marine Face Flesh Base
  const cSkin = health > 20 ? '#d4a373' : '#b07d58';
  ctx.fillStyle = cSkin;
  ctx.fillRect(4 * scale, 4 * scale, 16 * scale, 16 * scale);
  ctx.fillRect(5 * scale, 19 * scale, 14 * scale, 3 * scale); // Jawline

  // Cheekbone shadows
  ctx.fillStyle = '#a87550';
  ctx.fillRect(4 * scale, 10 * scale, 2 * scale, 8 * scale);
  ctx.fillRect(18 * scale, 10 * scale, 2 * scale, 8 * scale);

  // Eyebrows (Determined angle)
  ctx.fillStyle = '#3b281c';
  ctx.fillRect(5 * scale, 7 * scale, 6 * scale, 2 * scale);
  ctx.fillRect(13 * scale, 7 * scale, 6 * scale, 2 * scale);

  // Eyes
  if (godMode) {
    // Golden invincible God-Mode eyes!
    ctx.fillStyle = '#facc15';
    ctx.fillRect(6 * scale, 9 * scale, 4 * scale, 3 * scale);
    ctx.fillRect(14 * scale, 9 * scale, 4 * scale, 3 * scale);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7 * scale, 9.5 * scale, 2 * scale, 2 * scale);
    ctx.fillRect(15 * scale, 9.5 * scale, 2 * scale, 2 * scale);
  } else if (health <= 0) {
    // Mangled dead white eyes
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(6 * scale, 9 * scale, 4 * scale, 3 * scale);
    ctx.fillRect(14 * scale, 9 * scale, 4 * scale, 3 * scale);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(7 * scale, 10 * scale, 2 * scale, 1 * scale);
    ctx.fillRect(15 * scale, 10 * scale, 2 * scale, 1 * scale);
  } else {
    // Eye whites
    ctx.fillStyle = '#f5f5f4';
    ctx.fillRect(6 * scale, 9 * scale, 4 * scale, 3 * scale);
    ctx.fillRect(14 * scale, 9 * scale, 4 * scale, 3 * scale);

    // Pupils looking in direction
    ctx.fillStyle = '#1e293b';
    const pupilOffset = (lookDir === 'left') ? -1 : (lookDir === 'right') ? 1 : 0;
    ctx.fillRect((7 + pupilOffset) * scale, 9.5 * scale, 2 * scale, 2 * scale);
    ctx.fillRect((15 + pupilOffset) * scale, 9.5 * scale, 2 * scale, 2 * scale);
  }

  // Nose
  ctx.fillStyle = '#a87550';
  ctx.fillRect(11 * scale, 10 * scale, 2 * scale, 5 * scale);
  ctx.fillRect(10 * scale, 14 * scale, 4 * scale, 2 * scale);

  // Mouth
  if (isGrinning) {
    // Iconic weapon pickup evil grin
    ctx.fillStyle = '#3b281c';
    ctx.fillRect(7 * scale, 17 * scale, 10 * scale, 3 * scale);
    ctx.fillStyle = '#f5f5f4'; // Teeth
    ctx.fillRect(8 * scale, 18 * scale, 8 * scale, 1 * scale);
  } else if (health > 50) {
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(8 * scale, 18 * scale, 8 * scale, 2 * scale);
  } else if (health > 0) {
    // Grimacing pained mouth
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(7 * scale, 17 * scale, 10 * scale, 3 * scale);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8 * scale, 18 * scale, 3 * scale, 1 * scale);
    ctx.fillRect(13 * scale, 18 * scale, 3 * scale, 1 * scale);
  } else {
    // Dead jaw dropped open
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(7 * scale, 17 * scale, 10 * scale, 5 * scale);
  }

  // Blood and Bruises based on Health Status
  if (health < 80 && health > 0) {
    // Light cheek cut
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(16 * scale, 12 * scale, 3 * scale, 2 * scale);
  }
  if (health < 60 && health > 0) {
    // Bleeding nose
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(11 * scale, 15 * scale, 2 * scale, 3 * scale);
  }
  if (health < 40 && health > 0) {
    // Black eye and forehead gash
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(5 * scale, 8 * scale, 3 * scale, 3 * scale);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(7 * scale, 4 * scale, 5 * scale, 2 * scale);
  }
  if (health < 20 && health > 0) {
    // Severe blood streams
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(6 * scale, 12 * scale, 2 * scale, 7 * scale);
    ctx.fillRect(15 * scale, 14 * scale, 2 * scale, 6 * scale);
  }
  if (health <= 0) {
    // Massive bloody head trauma
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(3 * scale, 2 * scale, 18 * scale, 8 * scale);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(4 * scale, 4 * scale, 16 * scale, 5 * scale);
  }
}

/**
 * 3D Billboards / Sprites for Monsters (Zombieman, Imp, Demon)
 */
export function createMonsterSpriteTexture(
  type: 'zombie' | 'imp' | 'demon',
  state: 'stand' | 'walk' | 'shoot' | 'pain' | 'dead',
  frame: number = 0
): THREE.CanvasTexture {
  return createCanvasTexture(64, 64, (ctx) => {
    ctx.clearRect(0, 0, 64, 64);

    if (type === 'zombie') {
      // FORMER HUMAN ZOMBIEMAN (Beige fatigue, green UAC armor, aiming rifle)
      if (state === 'dead') {
        // Splattered bloody corpse on floor
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(8, 56, 48, 6);
        ctx.fillStyle = '#991b1b'; // Fresh blood pool
        ctx.fillRect(12, 54, 40, 5);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(16, 52, 28, 4);
        // Torn corpse limbs & armor
        ctx.fillStyle = '#166534';
        ctx.fillRect(20, 48, 14, 6);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(10, 50, 12, 6);
        ctx.fillRect(34, 50, 16, 5);
        return;
      }

      const isPain = state === 'pain';
      const isShooting = state === 'shoot';
      const walkCycle = state === 'walk' ? (frame % 4) : 0;
      const legOffset = walkCycle === 1 ? 3 : walkCycle === 3 ? -3 : 0;
      const torsoTilt = isPain ? -2 : 0;

      // Zombie Marine Helmet (Military Green with dark rim)
      ctx.fillStyle = '#14532d';
      ctx.fillRect(25, 6 + torsoTilt, 14, 8);
      ctx.fillStyle = '#166534';
      ctx.fillRect(26, 7 + torsoTilt, 12, 6);
      ctx.fillStyle = '#22c55e'; // Highlight rim
      ctx.fillRect(26, 7 + torsoTilt, 10, 1);

      // Pale decaying zombie face
      ctx.fillStyle = isPain ? '#b91c1c' : '#a1a1aa';
      ctx.fillRect(27, 13 + torsoTilt, 10, 7);
      ctx.fillStyle = '#71717a';
      ctx.fillRect(28, 14 + torsoTilt, 8, 5);

      // Glowing malevolent red zombie eyes
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(28, 15 + torsoTilt, 2, 2);
      ctx.fillRect(33, 15 + torsoTilt, 2, 2);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(29, 15 + torsoTilt, 1, 1);
      ctx.fillRect(34, 15 + torsoTilt, 1, 1);

      // Open snarling mouth
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(29, 18 + torsoTilt, 6, 2);

      // Torso: Green UAC Kevlar Combat Armor with bloody tears
      ctx.fillStyle = '#14532d';
      ctx.fillRect(21, 20 + torsoTilt, 22, 16);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(23, 21 + torsoTilt, 18, 14);
      // Chest armor plate highlight
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(24, 22 + torsoTilt, 16, 2);

      // Bloody bullet holes & torn wounds on chest
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(27, 25 + torsoTilt, 5, 5);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(28, 26 + torsoTilt, 3, 3);
      ctx.fillRect(35, 29 + torsoTilt, 3, 2);

      // Tan military fatigue pants & heavy combat boots
      ctx.fillStyle = '#78350f';
      ctx.fillRect(23, 36, 7, 16 + legOffset);
      ctx.fillRect(34, 36, 7, 16 - legOffset);
      // Kneepads
      ctx.fillStyle = '#451a03';
      ctx.fillRect(23, 44 + legOffset, 7, 3);
      ctx.fillRect(34, 44 - legOffset, 7, 3);
      // Dark combat boots
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(22, 52 + legOffset, 9, 8);
      ctx.fillRect(33, 52 - legOffset, 9, 8);

      // Standard UAC 9mm Service Rifle
      if (isShooting) {
        // Aiming directly at player with muzzle flash!
        ctx.fillStyle = '#18181b';
        ctx.fillRect(32, 22, 24, 6);
        ctx.fillStyle = '#3f3f46';
        ctx.fillRect(32, 23, 22, 3);
        ctx.fillStyle = '#71717a';
        ctx.fillRect(30, 26, 6, 7); // Magazine

        // Blazing Muzzle Flash
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(58, 25, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(58, 25, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(58, 25, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Holding rifle across chest
        ctx.fillStyle = '#18181b';
        ctx.fillRect(30, 24, 18, 5);
        ctx.fillStyle = '#3f3f46';
        ctx.fillRect(32, 25, 15, 3);
        ctx.fillRect(34, 29, 4, 6); // Magazine
        // Arms in tan sleeves
        ctx.fillStyle = '#78350f';
        ctx.fillRect(17, 22, 5, 12);
        ctx.fillRect(38, 23, 5, 8);
      }
    } else if (type === 'imp') {
      // IMP (Muscular spiky brown demon with glowing fire eyes and sharp claws)
      if (state === 'dead') {
        // Collapsed spiky brown demon carcass
        ctx.fillStyle = '#291206';
        ctx.fillRect(10, 52, 44, 10);
        ctx.fillStyle = '#7f1d1d'; // Crimson demon blood
        ctx.fillRect(8, 56, 48, 6);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(14, 54, 34, 4);
        // Spikes jutting out
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(18, 48, 3, 5);
        ctx.fillRect(32, 47, 3, 6);
        ctx.fillRect(42, 49, 3, 4);
        return;
      }

      const isShooting = state === 'shoot';
      const isPain = state === 'pain';
      const walkCycle = state === 'walk' ? (frame % 4) : 0;
      const legOffset = walkCycle === 1 ? 3 : walkCycle === 3 ? -3 : 0;
      const painShift = isPain ? 2 : 0;

      // Bone Spikes crowning the skull
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(23, 4 + painShift, 3, 5);
      ctx.fillRect(38, 4 + painShift, 3, 5);
      ctx.fillRect(30, 2 + painShift, 4, 6);
      ctx.fillRect(26, 5 + painShift, 2, 4);
      ctx.fillRect(36, 5 + painShift, 2, 4);

      // Grotesque Imp Head
      ctx.fillStyle = '#5a2d0c';
      ctx.fillRect(24, 8 + painShift, 16, 12);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(26, 9 + painShift, 12, 10);

      // Glowing crimson eyes
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(26, 12 + painShift, 3, 3);
      ctx.fillRect(35, 12 + painShift, 3, 3);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(27, 13 + painShift, 1, 1);
      ctx.fillRect(36, 13 + painShift, 1, 1);

      // Gaping fanged maw
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(27, 17 + painShift, 10, 4);
      ctx.fillStyle = '#f8fafc'; // Sharp pointy teeth
      ctx.fillRect(28, 17 + painShift, 2, 2);
      ctx.fillRect(31, 17 + painShift, 2, 2);
      ctx.fillRect(34, 17 + painShift, 2, 2);

      // Muscular Spiked Brown Torso
      ctx.fillStyle = '#5a2d0c';
      ctx.fillRect(20, 20 + painShift, 24, 18);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(22, 21 + painShift, 20, 16);
      // Abdominal musculature lines
      ctx.fillStyle = '#451a03';
      ctx.fillRect(31, 23 + painShift, 2, 12);
      ctx.fillRect(25, 27 + painShift, 14, 1);
      ctx.fillRect(25, 32 + painShift, 14, 1);

      // Shoulder and chest white bone thorns
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(17, 18 + painShift, 4, 5);
      ctx.fillRect(43, 18 + painShift, 4, 5);
      ctx.fillRect(23, 23 + painShift, 3, 3);
      ctx.fillRect(38, 23 + painShift, 3, 3);

      // Claws & Fireball casting pose
      if (isShooting) {
        // Raised arm charging iconic Doom Hell Fireball
        ctx.fillStyle = '#78350f';
        ctx.fillRect(40, 14, 16, 7);
        ctx.fillRect(14, 22, 7, 14);

        // Dynamic swirling Hell Fireball in claw
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(57, 17, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(57, 17, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(57, 17, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Sharp claws hanging at sides
        ctx.fillStyle = '#78350f';
        ctx.fillRect(15, 22, 6, 14);
        ctx.fillRect(43, 22, 6, 14);
        ctx.fillStyle = '#f3f4f6'; // Talons
        ctx.fillRect(14, 35, 7, 3);
        ctx.fillRect(43, 35, 7, 3);
      }

      // Digitigrade reptilian legs
      ctx.fillStyle = '#5a2d0c';
      ctx.fillRect(22, 38, 8, 14 + legOffset);
      ctx.fillRect(34, 38, 8, 14 - legOffset);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(23, 39, 6, 12 + legOffset);
      ctx.fillRect(35, 39, 6, 12 - legOffset);

      // Triple taloned claw feet
      ctx.fillStyle = '#291206';
      ctx.fillRect(20, 52 + legOffset, 11, 6);
      ctx.fillRect(33, 52 - legOffset, 11, 6);
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(19, 56 + legOffset, 3, 2);
      ctx.fillRect(24, 56 + legOffset, 3, 2);
      ctx.fillRect(29, 56 + legOffset, 3, 2);
      ctx.fillRect(32, 56 - legOffset, 3, 2);
      ctx.fillRect(37, 56 - legOffset, 3, 2);
      ctx.fillRect(42, 56 - legOffset, 3, 2);
    } else if (type === 'demon') {
      // PINKY DEMON (Iconic charging pink cybernetic hell-hound, massive maw & horns)
      if (state === 'dead') {
        // Massive exploded pink beast mound
        ctx.fillStyle = '#831843';
        ctx.fillRect(8, 48, 48, 14);
        ctx.fillStyle = '#dc2626'; // Demon blood pool
        ctx.fillRect(6, 54, 52, 8);
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(14, 50, 36, 8);
        // Broken horns
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(12, 45, 6, 6);
        ctx.fillRect(44, 46, 6, 5);
        return;
      }

      const isBiting = state === 'shoot';
      const isPain = state === 'pain';
      const walkCycle = state === 'walk' ? (frame % 4) : 0;
      const legOff = walkCycle === 1 ? 4 : walkCycle === 3 ? -4 : 0;
      const painShift = isPain ? 2 : 0;

      // Heavy curved demon horns
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(12, 10 + painShift, 7, 7);
      ctx.fillRect(10, 6 + painShift, 5, 6);
      ctx.fillRect(45, 10 + painShift, 7, 7);
      ctx.fillRect(49, 6 + painShift, 5, 6);

      // Enormous Beast Head
      ctx.fillStyle = '#9d174d';
      ctx.fillRect(16, 14 + painShift, 32, 22);
      ctx.fillStyle = '#db2777';
      ctx.fillRect(18, 15 + painShift, 28, 20);
      ctx.fillStyle = '#f43f5e'; // Forehead highlight
      ctx.fillRect(20, 16 + painShift, 24, 6);

      // Predatory glowing yellow feline eyes
      ctx.fillStyle = '#eab308';
      ctx.fillRect(20, 18 + painShift, 5, 4);
      ctx.fillRect(39, 18 + painShift, 5, 4);
      ctx.fillStyle = '#000000'; // Slit pupils
      ctx.fillRect(22, 18 + painShift, 2, 4);
      ctx.fillRect(41, 18 + painShift, 2, 4);

      // Terrifying gaping mouth with two rows of razor-sharp fangs
      const mouthHeight = isBiting ? 14 : 9;
      ctx.fillStyle = '#4c0519';
      ctx.fillRect(20, 24 + painShift, 24, mouthHeight);
      ctx.fillStyle = '#881337';
      ctx.fillRect(22, 26 + painShift, 20, mouthHeight - 4);

      // Serrated white fangs
      ctx.fillStyle = '#ffffff';
      for (let x = 21; x < 43; x += 3) {
        ctx.fillRect(x, 24 + painShift, 2, 3); // Upper teeth
        ctx.fillRect(x, 24 + mouthHeight - 3 + painShift, 2, 3); // Lower teeth
      }

      // Massive bipedal hunched muscular torso
      ctx.fillStyle = '#831843';
      ctx.fillRect(14, 34 + painShift, 36, 18);
      ctx.fillStyle = '#be185d';
      ctx.fillRect(16, 35 + painShift, 32, 16);

      // Armored cyber/biomechanical spine ridge
      ctx.fillStyle = '#475569';
      ctx.fillRect(30, 36 + painShift, 4, 14);
      ctx.fillStyle = '#94a3af';
      ctx.fillRect(31, 37 + painShift, 2, 12);

      // Stomping muscular pillar legs
      ctx.fillStyle = '#831843';
      ctx.fillRect(12, 44, 14, 14 + legOff);
      ctx.fillRect(38, 44, 14, 14 - legOff);
      ctx.fillStyle = '#be185d';
      ctx.fillRect(14, 45, 10, 12 + legOff);
      ctx.fillRect(40, 45, 10, 12 - legOff);

      // Heavy hooves / claws that crush marble floors
      ctx.fillStyle = '#310d20';
      ctx.fillRect(10, 56 + legOff, 17, 8);
      ctx.fillRect(37, 56 - legOff, 17, 8);
      ctx.fillStyle = '#f8fafc'; // Claws
      ctx.fillRect(9, 61 + legOff, 4, 3);
      ctx.fillRect(14, 61 + legOff, 4, 3);
      ctx.fillRect(37, 61 - legOff, 4, 3);
      ctx.fillRect(42, 61 - legOff, 4, 3);
    }
  });
}

/**
 * Pickups (Medikit, Ammo, Armor, Shotgun drop, Toxic Barrel)
 */
export function createPickupSpriteTexture(
  type: 'medikit' | 'stimpack' | 'armor' | 'shotgun' | 'ammo_clip' | 'ammo_box' | 'blue_key' | 'yellow_key' | 'red_key' | 'barrel'
): THREE.CanvasTexture {
  return createCanvasTexture(48, 48, (ctx) => {
    ctx.clearRect(0, 0, 48, 48);

    if (type === 'medikit') {
      // White medical case with red cross
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(10, 16, 28, 22);
      ctx.fillStyle = '#9ca3af';
      ctx.fillRect(10, 36, 28, 2);
      ctx.fillRect(36, 16, 2, 22);
      // Red Cross
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(21, 20, 6, 14);
      ctx.fillRect(17, 24, 14, 6);
      // Handle
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(18, 12, 12, 4);
    } else if (type === 'stimpack') {
      // Small grey syringe box
      ctx.fillStyle = '#d1d5db';
      ctx.fillRect(16, 22, 16, 18);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(22, 26, 4, 10);
      ctx.fillRect(19, 29, 10, 4);
    } else if (type === 'armor') {
      // Iconic Green Combat Armor Vest
      ctx.fillStyle = '#15803d';
      ctx.fillRect(14, 14, 20, 24);
      ctx.fillStyle = '#22c55e'; // Highlight collar
      ctx.fillRect(18, 14, 12, 4);
      ctx.fillStyle = '#166534';
      ctx.fillRect(16, 22, 16, 6);
      ctx.fillRect(16, 30, 16, 6);
    } else if (type === 'shotgun') {
      // Iconic Pump-Action Shotgun on the floor
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(8, 24, 32, 4); // Barrel
      ctx.fillStyle = '#78350f';
      ctx.fillRect(20, 27, 8, 3); // Wooden pump slide
      ctx.fillRect(4, 26, 6, 6); // Wooden stock
    } else if (type === 'ammo_clip') {
      // Pistol/Chaingun Bullet Clip
      ctx.fillStyle = '#eab308'; // Brass bullets
      ctx.fillRect(16, 22, 16, 18);
      ctx.fillStyle = '#713f12';
      ctx.fillRect(18, 24, 3, 14);
      ctx.fillRect(23, 24, 3, 14);
      ctx.fillRect(28, 24, 3, 14);
    } else if (type === 'ammo_box') {
      // Large Green Metal Ammo Crate
      ctx.fillStyle = '#14532d';
      ctx.fillRect(10, 18, 28, 20);
      ctx.fillStyle = '#eab308'; // Stenciled bullets
      ctx.fillRect(14, 24, 20, 8);
      ctx.fillStyle = '#166534';
      ctx.fillRect(10, 18, 28, 2);
    } else if (type.includes('_key')) {
      // Keycard (Blue, Yellow, or Red)
      const color = type.includes('blue') ? '#3b82f6' : type.includes('yellow') ? '#eab308' : '#ef4444';
      ctx.fillStyle = color;
      ctx.fillRect(16, 18, 16, 22);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(18, 22, 6, 4); // Chip
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(18, 34, 12, 2);
    } else if (type === 'barrel') {
      // Radioactive Green Nukage Hazard Barrel
      ctx.fillStyle = '#15803d';
      ctx.fillRect(12, 10, 24, 32);
      // Ribs
      ctx.fillStyle = '#166534';
      ctx.fillRect(12, 10, 24, 3);
      ctx.fillRect(12, 24, 24, 3);
      ctx.fillRect(12, 39, 24, 3);
      // Radiation Trefoil Symbol
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(24, 26, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(24, 26, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}
