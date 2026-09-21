import * as THREE from 'three';

// Procedural 64x64 Pixel Art Texture Generator for Wolfenstein 3D
// Creates 100% authentic, crisp retro textures using Three.js CanvasTexture

function createCanvas(w = 64, h = 64): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return [canvas, ctx];
}

function makeTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  return tex;
}

// 1. Classic Grey Stone Wall
export function createGreyStoneTexture(): THREE.CanvasTexture {
  const [c, ctx] = createCanvas(64, 64);
  // Base grey
  ctx.fillStyle = '#6b7280';
  ctx.fillRect(0, 0, 64, 64);

  // Ashlar stone blocks (4 rows of alternating blocks)
  const rows = 4;
  const blockH = 16;

  for (let r = 0; r < rows; r++) {
    const y = r * blockH;
    const offset = (r % 2) * 16;
    for (let x = -16; x < 64; x += 32) {
      const bx = x + offset;
      // Stone body variation
      const shade = Math.floor(95 + (Math.sin(bx * 7 + y) * 20));
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
      ctx.fillRect(bx + 1, y + 1, 30, blockH - 2);

      // Noise speckles
      for (let s = 0; s < 12; s++) {
        const sx = bx + 2 + Math.floor(Math.random() * 26);
        const sy = y + 2 + Math.floor(Math.random() * 11);
        ctx.fillStyle = Math.random() > 0.5 ? '#9ca3af' : '#4b5563';
        ctx.fillRect(sx, sy, 2, 2);
      }

      // Highlights & Bevel
      ctx.fillStyle = '#d1d5db';
      ctx.fillRect(bx + 1, y + 1, 29, 1);
      ctx.fillRect(bx + 1, y + 1, 1, blockH - 3);

      // Shadows & Mortar
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(bx, y + blockH - 1, 32, 1);
      ctx.fillRect(bx + 31, y, 1, blockH);
    }
  }
  return makeTexture(c);
}

// 2. Iconic Episode 1 Blue Brick Wall
export function createBlueStoneTexture(): THREE.CanvasTexture {
  const [c, ctx] = createCanvas(64, 64);
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(0, 0, 64, 64);

  for (let r = 0; r < 8; r++) {
    const y = r * 8;
    const offset = (r % 2) * 8;
    for (let x = -8; x < 64; x += 16) {
      const bx = x + offset;
      const blueShade = Math.floor(120 + Math.sin(bx + y) * 30);
      ctx.fillStyle = `rgb(30, 60, ${blueShade})`;
      ctx.fillRect(bx + 1, y + 1, 14, 6);

      // Light edge
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(bx + 1, y + 1, 13, 1);
      ctx.fillRect(bx + 1, y + 1, 1, 5);

      // Mortar dark blue
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(bx, y + 7, 16, 1);
      ctx.fillRect(bx + 15, y, 1, 8);
    }
  }
  return makeTexture(c);
}

// 3. Wooden Wall with Brass Trim
export function createWoodWallTexture(): THREE.CanvasTexture {
  const [c, ctx] = createCanvas(64, 64);
  // Warm wood base
  ctx.fillStyle = '#78350f';
  ctx.fillRect(0, 0, 64, 64);

  // Vertical wood planks
  for (let x = 0; x < 64; x += 8) {
    const grain = Math.floor(70 + (x % 16) * 4);
    ctx.fillStyle = `rgb(${grain + 50}, ${grain + 15}, 15)`;
    ctx.fillRect(x + 1, 0, 6, 64);

    // Wood grain lines
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x + 3, 0, 1, 64);
    ctx.fillRect(x + 7, 0, 1, 64); // Divider shadow
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 1, 0, 1, 64); // Highlight
  }

  // Top and bottom brass trim
  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(0, 0, 64, 4);
  ctx.fillRect(0, 60, 64, 4);

  // Rivets
  ctx.fillStyle = '#fef08a';
  for (let x = 4; x < 64; x += 8) {
    ctx.fillRect(x, 1, 2, 2);
    ctx.fillRect(x, 61, 2, 2);
  }

  return makeTexture(c);
}

// 4. Grey Stone Wall with Eagle Banner
export function createEagleWallTexture(): THREE.CanvasTexture {
  const [c, ctx] = createCanvas(64, 64);
  // Base grey stone
  const greyCanvas = createGreyStoneTexture().image as HTMLCanvasElement;
  ctx.drawImage(greyCanvas, 0, 0);

  // Red banner hanging in center
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(16, 4, 32, 54);
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(18, 6, 28, 50);

  // Golden eagle emblem silhouette
  ctx.fillStyle = '#facc15';
  // Head & Beak
  ctx.fillRect(30, 10, 4, 3);
  ctx.fillRect(34, 11, 2, 1);
  // Wings spread
  ctx.fillRect(22, 13, 20, 4);
  ctx.fillRect(20, 15, 24, 3);
  ctx.fillRect(18, 17, 28, 2);
  // Body & Talons
  ctx.fillRect(29, 17, 6, 12);
  ctx.fillRect(27, 28, 10, 3);

  // White laurel ring
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(26, 32, 12, 12);
  ctx.fillStyle = '#000000';
  ctx.fillRect(28, 34, 8, 8);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(31, 35, 2, 6);
  ctx.fillRect(29, 37, 6, 2);

  // Banner gold fringe
  ctx.fillStyle = '#eab308';
  for (let x = 16; x < 48; x += 2) {
    ctx.fillRect(x, 56, 1, 3);
  }

  return makeTexture(c);
}

// 5. Sliding Wooden Door with Handle
export function createWoodDoorTexture(): THREE.CanvasTexture {
  const [c, ctx] = createCanvas(64, 64);
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(0, 0, 64, 64);

  // Frame
  ctx.fillStyle = '#44403c';
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = '#292524';
  ctx.fillRect(4, 4, 56, 56);

  // Door leaf (rich wood)
  ctx.fillStyle = '#854d0e';
  ctx.fillRect(6, 6, 52, 52);

  // Cross panels
  ctx.fillStyle = '#713f12';
  ctx.fillRect(10, 10, 44, 20);
  ctx.fillRect(10, 34, 44, 20);

  ctx.fillStyle = '#a16207';
  ctx.fillRect(10, 10, 44, 2);
  ctx.fillRect(10, 10, 2, 20);
  ctx.fillRect(10, 34, 44, 2);
  ctx.fillRect(10, 34, 2, 20);

  // Brass Door Handle & Lock Plate
  ctx.fillStyle = '#eab308';
  ctx.fillRect(44, 28, 6, 14);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(45, 29, 4, 3);
  ctx.fillStyle = '#000000';
  ctx.fillRect(46, 36, 2, 4); // Keyhole

  return makeTexture(c);
}

// 6. Prison Iron Bars Texture
export function createPrisonWallTexture(): THREE.CanvasTexture {
  const [c, ctx] = createCanvas(64, 64);
  // Dark inside cell
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, 64, 64);

  // Top & bottom stone borders
  ctx.fillStyle = '#52525b';
  ctx.fillRect(0, 0, 64, 8);
  ctx.fillRect(0, 56, 64, 8);

  // Vertical iron bars
  for (let x = 6; x < 64; x += 10) {
    ctx.fillStyle = '#71717a';
    ctx.fillRect(x, 8, 4, 48);
    ctx.fillStyle = '#d4d4d8';
    ctx.fillRect(x + 1, 8, 1, 48); // highlight
    ctx.fillStyle = '#27272a';
    ctx.fillRect(x + 3, 8, 1, 48); // shadow
  }

  // Cross horizontal bar
  ctx.fillStyle = '#71717a';
  ctx.fillRect(0, 30, 64, 5);
  ctx.fillStyle = '#e4e4e7';
  ctx.fillRect(0, 30, 64, 1);

  return makeTexture(c);
}

// 7. Elevator Exit Panel
export function createElevatorTexture(): THREE.CanvasTexture {
  const [c, ctx] = createCanvas(64, 64);
  ctx.fillStyle = '#3f3f46';
  ctx.fillRect(0, 0, 64, 64);

  // Metal paneling
  ctx.fillStyle = '#71717a';
  ctx.fillRect(4, 4, 56, 56);
  ctx.fillStyle = '#52525b';
  ctx.fillRect(8, 8, 48, 48);

  // Big Red Exit Switch / Lever
  ctx.fillStyle = '#18181b';
  ctx.fillRect(24, 16, 16, 32);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(26, 18, 12, 16);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(28, 20, 8, 6);

  // Text "EXIT / AUSGANG"
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(16, 50, 32, 4);

  return makeTexture(c);
}

// 8. Slate Floor & Ceiling Textures
export function createFloorTexture(): THREE.CanvasTexture {
  const [c, ctx] = createCanvas(64, 64);
  ctx.fillStyle = '#3f3f46'; // Concrete grey floor
  ctx.fillRect(0, 0, 64, 64);

  // Large floor tiles
  ctx.fillStyle = '#27272a';
  ctx.fillRect(0, 31, 64, 2);
  ctx.fillRect(31, 0, 2, 64);

  for (let i = 0; i < 40; i++) {
    const x = Math.floor(Math.random() * 62);
    const y = Math.floor(Math.random() * 62);
    ctx.fillStyle = Math.random() > 0.5 ? '#52525b' : '#333338';
    ctx.fillRect(x, y, 2, 2);
  }
  return makeTexture(c);
}

// 9. Billboarding Sprites: Gold Chalice
export function createGoldChaliceTexture(): THREE.CanvasTexture {
  const [c, ctx] = createCanvas(64, 64);
  ctx.clearRect(0, 0, 64, 64);

  // Cup Rim
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(16, 12, 32, 4);
  ctx.fillStyle = '#eab308';
  ctx.fillRect(18, 16, 28, 14);
  // Jewels on cup
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(22, 20, 4, 4);
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(30, 20, 4, 4);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(38, 20, 4, 4);

  // Stem
  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(28, 30, 8, 16);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(29, 30, 2, 16);

  // Base
  ctx.fillStyle = '#eab308';
  ctx.fillRect(20, 46, 24, 6);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(22, 47, 20, 2);

  return makeTexture(c);
}

// 10. Billboarding Sprites: Ammo Box
export function createAmmoTexture(): THREE.CanvasTexture {
  const [c, ctx] = createCanvas(64, 64);
  ctx.clearRect(0, 0, 64, 64);

  // Metal ammo tin
  ctx.fillStyle = '#365314'; // Olive drab
  ctx.fillRect(16, 24, 32, 26);
  ctx.fillStyle = '#4d7c0f';
  ctx.fillRect(18, 26, 28, 4);

  // Bullets sticking out or stamped
  ctx.fillStyle = '#facc15';
  ctx.fillRect(22, 32, 4, 12);
  ctx.fillRect(28, 32, 4, 12);
  ctx.fillRect(34, 32, 4, 12);
  ctx.fillRect(40, 32, 4, 12);

  // Shiny tips
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(23, 30, 2, 3);
  ctx.fillRect(29, 30, 2, 3);
  ctx.fillRect(35, 30, 2, 3);
  ctx.fillRect(41, 30, 2, 3);

  return makeTexture(c);
}

// 11. Billboarding Sprites: Medkit
export function createMedkitTexture(): THREE.CanvasTexture {
  const [c, ctx] = createCanvas(64, 64);
  ctx.clearRect(0, 0, 64, 64);

  // White medical box
  ctx.fillStyle = '#f4f4f5';
  ctx.fillRect(14, 22, 36, 26);
  ctx.fillStyle = '#e4e4e7';
  ctx.fillRect(16, 24, 32, 22);

  // Handle
  ctx.fillStyle = '#71717a';
  ctx.fillRect(26, 18, 12, 4);

  // Red Cross
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(28, 28, 8, 14);
  ctx.fillRect(25, 31, 14, 8);

  return makeTexture(c);
}

// 12. Guard Sprite (Standing / Walking / Shooting / Dying)
export function createGuardTexture(state: 'stand' | 'walk1' | 'walk2' | 'shoot' | 'pain' | 'die1' | 'dead'): THREE.CanvasTexture {
  const [c, ctx] = createCanvas(64, 64);
  ctx.clearRect(0, 0, 64, 64);

  if (state === 'dead') {
    // Blood pool and dead guard lying flat on ground
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.ellipse(32, 48, 24, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body horizontal
    ctx.fillStyle = '#854d0e'; // Brown uniform
    ctx.fillRect(18, 44, 28, 8);
    // Helmet
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(10, 43, 8, 9);
    // Boots
    ctx.fillStyle = '#18181b';
    ctx.fillRect(44, 45, 8, 6);
    return makeTexture(c);
  }

  if (state === 'die1') {
    // Falling backwards in agony
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(20, 24, 24, 26);
    ctx.fillStyle = '#fbcfe8'; // Face
    ctx.fillRect(24, 12, 14, 12);
    ctx.fillStyle = '#3f3f46'; // Helmet flying
    ctx.fillRect(36, 6, 12, 10);
    // Blood splatter
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(26, 26, 8, 8);
    return makeTexture(c);
  }

  if (state === 'pain') {
    // Stunned recoil
    ctx.fillStyle = '#3f3f46'; // Helmet
    ctx.fillRect(24, 6, 16, 8);
    ctx.fillStyle = '#fbcfe8'; // Face
    ctx.fillRect(26, 14, 12, 10);
    ctx.fillStyle = '#dc2626'; // Blood on chest
    ctx.fillRect(28, 28, 8, 8);
    ctx.fillStyle = '#854d0e'; // Brown uniform
    ctx.fillRect(22, 24, 20, 22);
    ctx.fillStyle = '#18181b'; // Boots
    ctx.fillRect(22, 46, 8, 14);
    ctx.fillRect(34, 46, 8, 14);
    return makeTexture(c);
  }

  // Active Guard (Stand, Walk, Shoot)
  // 1. Helmet (Stahlhelm)
  ctx.fillStyle = '#3f3f46';
  ctx.fillRect(24, 6, 16, 10);
  ctx.fillStyle = '#52525b';
  ctx.fillRect(26, 7, 12, 4);

  // 2. Face
  ctx.fillStyle = '#fbcfe8';
  ctx.fillRect(26, 16, 12, 8);
  ctx.fillStyle = '#18181b';
  ctx.fillRect(28, 19, 2, 2); // Eyes
  ctx.fillRect(34, 19, 2, 2);

  // 3. Brown Uniform Body
  ctx.fillStyle = '#854d0e';
  ctx.fillRect(22, 24, 20, 22);
  // Black Belt & Silver Buckle
  ctx.fillStyle = '#18181b';
  ctx.fillRect(22, 38, 20, 4);
  ctx.fillStyle = '#e4e4e7';
  ctx.fillRect(30, 38, 4, 4);

  // 4. Legs / Boots
  ctx.fillStyle = '#18181b';
  if (state === 'walk1') {
    ctx.fillRect(20, 46, 8, 14);
    ctx.fillRect(36, 44, 8, 12);
  } else if (state === 'walk2') {
    ctx.fillRect(24, 44, 8, 12);
    ctx.fillRect(32, 46, 8, 14);
  } else {
    ctx.fillRect(23, 46, 8, 14);
    ctx.fillRect(33, 46, 8, 14);
  }

  // 5. Arms & Pistol
  if (state === 'shoot') {
    // Two hands extended holding pistol with muzzle flash
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(16, 26, 12, 6);
    ctx.fillStyle = '#18181b'; // Gun
    ctx.fillRect(12, 26, 8, 4);
    // Orange/Yellow Muzzle Flash
    ctx.fillStyle = '#facc15';
    ctx.fillRect(4, 22, 10, 12);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(6, 24, 6, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 26, 4, 4);
  } else {
    // Normal arms down/at holster
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(18, 25, 4, 16);
    ctx.fillRect(42, 25, 4, 16);
    ctx.fillStyle = '#18181b'; // Holster
    ctx.fillRect(42, 38, 4, 6);
  }

  return makeTexture(c);
}

// 13. Red Fortress Stone Wall
export function createRedStoneTexture(): THREE.CanvasTexture {
  const [c, ctx] = createCanvas(64, 64);
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(0, 0, 64, 64);

  const rows = 4;
  const blockH = 16;
  for (let r = 0; r < rows; r++) {
    const y = r * blockH;
    const offset = (r % 2) * 16;
    for (let x = -16; x < 64; x += 32) {
      const bx = x + offset;
      const shade = Math.floor(140 + Math.sin(bx * 5 + y) * 25);
      ctx.fillStyle = `rgb(${shade}, 28, 28)`;
      ctx.fillRect(bx + 1, y + 1, 30, blockH - 2);

      // Highlights & Bevel
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(bx + 1, y + 1, 29, 1);
      ctx.fillRect(bx + 1, y + 1, 1, blockH - 3);

      // Shadows & Mortar
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(bx, y + blockH - 1, 32, 1);
      ctx.fillRect(bx + 31, y, 1, blockH);
    }
  }
  return makeTexture(c);
}

// 14. SS Officer Sprite (Blue uniform, peaked cap, MP40 Submachine Gun)
export function createSSOfficerTexture(state: 'stand' | 'walk1' | 'walk2' | 'shoot' | 'pain' | 'die1' | 'dead'): THREE.CanvasTexture {
  const [c, ctx] = createCanvas(64, 64);
  ctx.clearRect(0, 0, 64, 64);

  if (state === 'dead') {
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.ellipse(32, 48, 24, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Blue uniform lying down
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(18, 44, 28, 8);
    // Cap
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(10, 42, 9, 8);
    // Boots
    ctx.fillStyle = '#000000';
    ctx.fillRect(44, 45, 8, 6);
    return makeTexture(c);
  }

  if (state === 'die1') {
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(20, 24, 24, 26);
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(24, 12, 14, 12);
    ctx.fillStyle = '#0f172a'; // Peaked cap flying
    ctx.fillRect(36, 4, 14, 10);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(26, 26, 10, 8);
    return makeTexture(c);
  }

  if (state === 'pain') {
    ctx.fillStyle = '#0f172a'; // Peaked cap
    ctx.fillRect(22, 6, 20, 8);
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(26, 14, 12, 10);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(28, 28, 8, 8);
    ctx.fillStyle = '#1e40af'; // Blue jacket
    ctx.fillRect(22, 24, 20, 22);
    ctx.fillStyle = '#000000';
    ctx.fillRect(22, 46, 8, 14);
    ctx.fillRect(34, 46, 8, 14);
    return makeTexture(c);
  }

  // Active SS Officer
  // 1. Black Peaked Officer Cap
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(22, 4, 20, 8);
  ctx.fillStyle = '#cbd5e1'; // Silver SS skull emblem
  ctx.fillRect(30, 6, 4, 3);
  ctx.fillStyle = '#1e293b'; // Visor
  ctx.fillRect(20, 11, 24, 2);

  // 2. Face
  ctx.fillStyle = '#fbcfe8';
  ctx.fillRect(26, 13, 12, 10);
  ctx.fillStyle = '#000000';
  ctx.fillRect(28, 16, 2, 2);
  ctx.fillRect(34, 16, 2, 2);

  // 3. Blue Uniform Body & Red Armband
  ctx.fillStyle = '#1e40af';
  ctx.fillRect(22, 23, 20, 23);
  ctx.fillStyle = '#dc2626'; // Armband
  ctx.fillRect(18, 26, 4, 6);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(19, 28, 2, 2);

  // Belt & Silver Buckle
  ctx.fillStyle = '#000000';
  ctx.fillRect(22, 38, 20, 4);
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(30, 38, 4, 4);

  // 4. Boots
  ctx.fillStyle = '#000000';
  if (state === 'walk1') {
    ctx.fillRect(20, 46, 8, 14);
    ctx.fillRect(36, 44, 8, 12);
  } else if (state === 'walk2') {
    ctx.fillRect(24, 44, 8, 12);
    ctx.fillRect(32, 46, 8, 14);
  } else {
    ctx.fillRect(23, 46, 8, 14);
    ctx.fillRect(33, 46, 8, 14);
  }

  // 5. MP40 Submachine Gun
  if (state === 'shoot') {
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(14, 24, 14, 6);
    ctx.fillStyle = '#18181b'; // MP40 Gun barrel & clip
    ctx.fillRect(8, 25, 14, 4);
    ctx.fillRect(14, 29, 3, 8); // Magazine
    // Bright Muzzle Flash
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 21, 10, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, 23, 6, 8);
  } else {
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(18, 24, 4, 16);
    ctx.fillRect(42, 24, 4, 16);
    ctx.fillStyle = '#18181b';
    ctx.fillRect(40, 30, 6, 12); // MP40 carried
  }

  return makeTexture(c);
}

// 15. Guard Dog Sprite (German Shepherd / Dobermann)
export function createDogTexture(state: 'stand' | 'run1' | 'run2' | 'bite' | 'dead'): THREE.CanvasTexture {
  const [c, ctx] = createCanvas(64, 64);
  ctx.clearRect(0, 0, 64, 64);

  if (state === 'dead') {
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.ellipse(32, 50, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#451a03'; // Brown body lying flat
    ctx.fillRect(18, 46, 26, 8);
    ctx.fillStyle = '#1c1917'; // Dark back
    ctx.fillRect(22, 44, 18, 4);
    return makeTexture(c);
  }

  // Head & Snout
  ctx.fillStyle = '#451a03'; // Brown head
  ctx.fillRect(36, 18, 18, 14);
  ctx.fillStyle = '#1c1917'; // Black snout
  ctx.fillRect(46, 22, 10, 8);
  ctx.fillStyle = '#dc2626'; // Red tongue/eyes
  ctx.fillRect(42, 20, 2, 2);

  // Ears
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(36, 12, 4, 8);
  ctx.fillRect(40, 14, 3, 6);

  // Body
  ctx.fillStyle = '#451a03';
  ctx.fillRect(16, 26, 28, 18);
  ctx.fillStyle = '#1c1917'; // Saddle back
  ctx.fillRect(20, 26, 20, 8);

  // Tail
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(10, 24, 8, 4);

  // Legs / Running animation
  ctx.fillStyle = '#451a03';
  if (state === 'run1') {
    ctx.fillRect(12, 42, 6, 14);
    ctx.fillRect(22, 44, 6, 12);
    ctx.fillRect(34, 42, 6, 14);
    ctx.fillRect(44, 40, 6, 16);
  } else if (state === 'run2') {
    ctx.fillRect(18, 40, 6, 16);
    ctx.fillRect(26, 42, 6, 14);
    ctx.fillRect(38, 44, 6, 12);
    ctx.fillRect(42, 44, 6, 12);
  } else if (state === 'bite') {
    // Leaping pounce
    ctx.fillRect(12, 44, 8, 12);
    ctx.fillRect(40, 38, 10, 10);
    // Open jaws with white fangs
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(48, 24, 3, 3);
    ctx.fillRect(48, 29, 3, 3);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(52, 26, 6, 4);
  } else {
    // Stand
    ctx.fillRect(18, 44, 6, 14);
    ctx.fillRect(24, 44, 6, 14);
    ctx.fillRect(36, 44, 6, 14);
    ctx.fillRect(42, 44, 6, 14);
  }

  return makeTexture(c);
}

// 16. Boss Hans Grosse Sprite (Massive gold armored boss with dual chainguns)
export function createHansGrosseTexture(state: 'stand' | 'walk1' | 'walk2' | 'shoot' | 'pain' | 'die1' | 'dead'): THREE.CanvasTexture {
  const [c, ctx] = createCanvas(64, 64);
  ctx.clearRect(0, 0, 64, 64);

  if (state === 'dead') {
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.ellipse(32, 48, 28, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Golden heavy armor collapsed
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(12, 40, 36, 12);
    ctx.fillStyle = '#1e3a8a'; // Blue pants
    ctx.fillRect(38, 44, 18, 8);
    // Chainguns dropped
    ctx.fillStyle = '#475569';
    ctx.fillRect(6, 48, 14, 6);
    ctx.fillRect(44, 48, 14, 6);
    return makeTexture(c);
  }

  if (state === 'die1') {
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(14, 18, 36, 30);
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(24, 6, 16, 14);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(22, 22, 20, 14);
    return makeTexture(c);
  }

  if (state === 'pain') {
    ctx.fillStyle = '#eab308'; // Blond crewcut
    ctx.fillRect(24, 4, 16, 6);
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(24, 10, 16, 12);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(28, 26, 12, 10);
    ctx.fillStyle = '#ca8a04'; // Gold armor
    ctx.fillRect(14, 22, 36, 26);
    ctx.fillStyle = '#1e3a8a'; // Blue pants
    ctx.fillRect(18, 48, 10, 14);
    ctx.fillRect(36, 48, 10, 14);
    return makeTexture(c);
  }

  // Active Hans Grosse
  // 1. Blond crew cut hair
  ctx.fillStyle = '#eab308';
  ctx.fillRect(22, 2, 20, 7);

  // 2. Wide Grinning Face
  ctx.fillStyle = '#fbcfe8';
  ctx.fillRect(22, 9, 20, 13);
  ctx.fillStyle = '#18181b';
  ctx.fillRect(26, 13, 3, 2); // Eyes
  ctx.fillRect(35, 13, 3, 2);
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(27, 18, 10, 3); // Evil smile

  // 3. Golden Massive Chest Armor Plate
  ctx.fillStyle = '#eab308';
  ctx.fillRect(14, 22, 36, 24);
  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(16, 24, 32, 6);
  ctx.fillStyle = '#a16207';
  ctx.fillRect(18, 32, 28, 10);

  // 4. Blue Heavy Pants & Black Boots
  ctx.fillStyle = '#1e3a8a';
  if (state === 'walk1') {
    ctx.fillRect(16, 46, 12, 16);
    ctx.fillRect(36, 44, 12, 14);
  } else if (state === 'walk2') {
    ctx.fillRect(18, 44, 12, 14);
    ctx.fillRect(34, 46, 12, 16);
  } else {
    ctx.fillRect(16, 46, 12, 16);
    ctx.fillRect(36, 46, 12, 16);
  }
  ctx.fillStyle = '#0f172a'; // Steel Toecap Boots
  ctx.fillRect(14, 58, 14, 6);
  ctx.fillRect(36, 58, 14, 6);

  // 5. Dual Chainguns / Miniguns on both hands!
  if (state === 'shoot') {
    // Massive dual barrels spitting fire
    ctx.fillStyle = '#334155';
    ctx.fillRect(2, 22, 14, 12);
    ctx.fillRect(48, 22, 14, 12);
    // Double Muzzle Flashes
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 16, 8, 16);
    ctx.fillRect(56, 16, 8, 16);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(0, 20, 6, 8);
    ctx.fillRect(58, 20, 6, 8);
  } else {
    ctx.fillStyle = '#334155';
    ctx.fillRect(6, 24, 10, 18);
    ctx.fillRect(48, 24, 10, 18);
    ctx.fillStyle = '#64748b'; // Barrels
    ctx.fillRect(6, 38, 8, 12);
    ctx.fillRect(50, 38, 8, 12);
  }

  return makeTexture(c);
}
