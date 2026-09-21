/**
 * Ultra-High-Resolution Procedural Texture Generator for Temple Run 3D
 * Generates crisp 1024x1024 & 512x512 canvas textures (stone pavers, ancient glyph carvings,
 * mossy cliffs, weathered wood bridges, 3D engraved Aztec golden coins,
 * adventurer clothing/leather straps, monkey demon dark fur, and glowing ancient runes).
 */

import * as THREE from 'three';

class TempleRunTextureFactory {
  private cache: Map<string, THREE.CanvasTexture> = new Map();

  /**
   * Ancient Temple Stone Road (Crisp 1024x1024 Cobblestone Pavers with Deep Grooves, Mortar & Moss)
   */
  public getStoneRoadTexture(theme: 'jungle' | 'cliff' | 'volcano' = 'jungle'): THREE.CanvasTexture {
    const key = `stone_road_${theme}_hd`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base background tone
    let baseHue = 38; // warm golden sandstone
    let baseSat = 35;
    let baseLight = 42;

    if (theme === 'cliff') {
      baseHue = 25;
      baseSat = 22;
      baseLight = 46;
    } else if (theme === 'volcano') {
      baseHue = 12;
      baseSat = 22;
      baseLight = 20;
    }

    ctx.fillStyle = `hsl(${baseHue}, ${baseSat}%, ${baseLight}%)`;
    ctx.fillRect(0, 0, size, size);

    // Deep mortar lines background
    ctx.fillStyle = `hsl(${baseHue}, ${baseSat - 15}%, ${baseLight - 25}%)`;
    ctx.fillRect(0, 0, size, size);

    // Paving stones grid
    const rows = 12;
    const cols = 6;
    const rowH = size / rows;
    const colW = size / cols;

    for (let r = 0; r < rows; r++) {
      const offsetX = (r % 2 === 0) ? 0 : colW / 2;
      for (let c = -1; c <= cols + 1; c++) {
        const x = c * colW + offsetX;
        const y = r * rowH;

        // Individual stone color variance
        const stoneLight = baseLight + (Math.random() * 16 - 8);
        const stoneSat = baseSat + (Math.random() * 12 - 6);
        ctx.fillStyle = `hsl(${baseHue}, ${stoneSat}%, ${stoneLight}%)`;

        // Stone with beveled margins
        const pad = 6;
        ctx.fillRect(x + pad, y + pad, colW - pad * 2, rowH - pad * 2);

        // Chiseled surface micro-texture
        for (let s = 0; s < 18; s++) {
          const sx = x + pad + Math.random() * (colW - pad * 2);
          const sy = y + pad + Math.random() * (rowH - pad * 2);
          const sRad = Math.random() * 4 + 1;
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.18)';
          ctx.beginPath();
          ctx.arc(sx, sy, sRad, 0, Math.PI * 2);
          ctx.fill();
        }

        // Stone bevel highlight (top-left)
        ctx.fillStyle = `rgba(255, 255, 255, 0.28)`;
        ctx.fillRect(x + pad, y + pad, colW - pad * 2, 4);
        ctx.fillRect(x + pad, y + pad, 4, rowH - pad * 2);

        // Stone bevel shadow (bottom-right)
        ctx.fillStyle = `rgba(0, 0, 0, 0.55)`;
        ctx.fillRect(x + pad, y + rowH - pad - 5, colW - pad * 2, 5);
        ctx.fillRect(x + colW - pad - 5, y + pad, 5, rowH - pad * 2);

        // Weathering stone cracks & crevices
        ctx.strokeStyle = 'rgba(15, 10, 5, 0.45)';
        ctx.lineWidth = 2;
        if (Math.random() < 0.6) {
          ctx.beginPath();
          const startX = x + pad + Math.random() * (colW - pad * 2);
          const startY = y + pad + Math.random() * (rowH - pad * 2);
          ctx.moveTo(startX, startY);
          ctx.lineTo(startX + (Math.random() * 20 - 10), startY + (Math.random() * 25));
          ctx.stroke();
        }

        // Lush jungle moss along mortar crevices
        if (theme === 'jungle' && Math.random() < 0.5) {
          ctx.fillStyle = `rgba(${35 + Math.random() * 25}, ${95 + Math.random() * 50}, ${25 + Math.random() * 25}, 0.78)`;
          ctx.beginPath();
          ctx.arc(x + pad + Math.random() * (colW - pad * 2), y + pad, Math.random() * 10 + 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (theme === 'volcano' && Math.random() < 0.3) {
          // Molten ember crevices in volcano theme
          ctx.fillStyle = 'rgba(255, 80, 0, 0.85)';
          ctx.fillRect(x, y + rowH - 4, colW, 4);
        }
      }
    }

    // Center Aztec gold ceremonial inlay channel
    const grad = ctx.createLinearGradient(size / 2 - 40, 0, size / 2 + 40, 0);
    grad.addColorStop(0, 'rgba(160, 110, 30, 0)');
    grad.addColorStop(0.3, 'rgba(215, 160, 35, 0.3)');
    grad.addColorStop(0.5, 'rgba(255, 215, 65, 0.85)');
    grad.addColorStop(0.7, 'rgba(215, 160, 35, 0.3)');
    grad.addColorStop(1, 'rgba(160, 110, 30, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(size / 2 - 40, 0, 80, size);

    // Intricate Aztec geometric pattern along the center line
    ctx.strokeStyle = 'rgba(90, 50, 10, 0.7)';
    ctx.lineWidth = 3;
    for (let y = 0; y < size; y += 40) {
      ctx.strokeRect(size / 2 - 16, y + 8, 32, 24);
      ctx.strokeRect(size / 2 - 8, y + 14, 16, 12);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Ancient Carved Stone Pillar & Wall (Mayan / Aztec Totem Face Glyph - 1024x1024)
   */
  public getStoneCarvingTexture(theme: 'jungle' | 'cliff' | 'volcano' = 'jungle'): THREE.CanvasTexture {
    const key = `stone_carving_${theme}_hd`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Stone background
    let bg = '#5e4835';
    if (theme === 'cliff') bg = '#4a4440';
    if (theme === 'volcano') bg = '#2c201e';

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    // Weathered stone grain
    for (let i = 0; i < 600; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.12)';
      ctx.fillRect(Math.random() * size, Math.random() * size, Math.random() * 6 + 1, Math.random() * 6 + 1);
    }

    // Heavy carved frame
    ctx.strokeStyle = 'rgba(0,0,0,0.65)';
    ctx.lineWidth = 14;
    ctx.strokeRect(14, 14, size - 28, size - 28);
    ctx.strokeStyle = 'rgba(220,180,110,0.3)';
    ctx.lineWidth = 6;
    ctx.strokeRect(24, 24, size - 48, size - 48);

    // Aztec Face / Mask Carving in Center
    ctx.save();
    ctx.translate(size / 2, size / 2);

    // Carved Head Recess Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(-240, -280, 480, 560);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 12;
    ctx.strokeRect(-240, -280, 480, 560);

    // Sun Crown / Feather Headdress
    ctx.fillStyle = '#c89520';
    ctx.strokeStyle = '#634208';
    ctx.lineWidth = 4;
    for (let i = -6; i <= 6; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 36, -280);
      ctx.lineTo(i * 36 + 18, -380);
      ctx.lineTo(i * 36 + 36, -280);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Fierce Tribal Eye Sockets & Glowing Gems
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(-170, -130, 120, 70);
    ctx.fillRect(50, -130, 120, 70);
    ctx.strokeStyle = '#cda365';
    ctx.lineWidth = 6;
    ctx.strokeRect(-170, -130, 120, 70);
    ctx.strokeRect(50, -130, 120, 70);

    // Burning Amber Iris Gems
    const eyeGradL = ctx.createRadialGradient(-110, -95, 4, -110, -95, 30);
    eyeGradL.addColorStop(0, '#ffffff');
    eyeGradL.addColorStop(0.3, '#ffcc00');
    eyeGradL.addColorStop(0.7, '#e65100');
    eyeGradL.addColorStop(1, '#501000');
    ctx.fillStyle = eyeGradL;
    ctx.beginPath();
    ctx.arc(-110, -95, 24, 0, Math.PI * 2);
    ctx.fill();

    const eyeGradR = ctx.createRadialGradient(110, -95, 4, 110, -95, 30);
    eyeGradR.addColorStop(0, '#ffffff');
    eyeGradR.addColorStop(0.3, '#ffcc00');
    eyeGradR.addColorStop(0.7, '#e65100');
    eyeGradR.addColorStop(1, '#501000');
    ctx.fillStyle = eyeGradR;
    ctx.beginPath();
    ctx.arc(110, -95, 24, 0, Math.PI * 2);
    ctx.fill();

    // Geometric Mayan Nose
    ctx.fillStyle = '#9b7642';
    ctx.strokeStyle = '#422d14';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, -90);
    ctx.lineTo(-55, 40);
    ctx.lineTo(55, 40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Carved Grimacing Fanged Mouth
    ctx.fillStyle = '#111';
    ctx.fillRect(-140, 95, 280, 95);
    ctx.strokeStyle = '#e6c898';
    ctx.lineWidth = 6;
    ctx.strokeRect(-140, 95, 280, 95);

    // Carved Jagged Teeth
    ctx.fillStyle = '#f0dbb6';
    for (let t = 0; t < 6; t++) {
      ctx.fillRect(-130 + t * 45, 100, 36, 40);
      ctx.fillRect(-130 + t * 45, 144, 36, 40);
    }

    // Side ornamental spiral glyphs
    ctx.strokeStyle = '#cda365';
    ctx.lineWidth = 8;
    ctx.strokeRect(-220, -50, 40, 110);
    ctx.strokeRect(180, -50, 40, 110);

    ctx.restore();

    // Hanging Jungle Vines & Moss
    if (theme === 'jungle') {
      ctx.fillStyle = 'rgba(34, 130, 48, 0.8)';
      for (let v = 0; v < 14; v++) {
        const vx = 40 + v * 70;
        const vLen = 90 + Math.random() * 220;
        ctx.fillRect(vx, 0, 12, vLen);
        ctx.beginPath();
        ctx.arc(vx + 6, vLen, 14, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Ancient Golden Aztec Coin (High-Def 512x512 Gleaming Metal with Skull / Sun Face)
   */
  public getGoldCoinTexture(): THREE.CanvasTexture {
    const key = 'gold_coin_hd';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Radial gold sheen with high contrast
    const rad = ctx.createRadialGradient(size / 2 - 40, size / 2 - 40, 20, size / 2, size / 2, size / 2);
    rad.addColorStop(0, '#fffbe0');
    rad.addColorStop(0.2, '#fde047');
    rad.addColorStop(0.5, '#eab308');
    rad.addColorStop(0.8, '#b45309');
    rad.addColorStop(1, '#713f12');

    ctx.fillStyle = rad;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 12, 0, Math.PI * 2);
    ctx.fill();

    // Outer notched ring
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 12;
    ctx.stroke();

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 26, 0, Math.PI * 2);
    ctx.stroke();

    // Aztec glyph studs around border
    for (let a = 0; a < 16; a++) {
      const angle = (a / 16) * Math.PI * 2;
      const bx = size / 2 + Math.cos(angle) * (size / 2 - 20);
      const by = size / 2 + Math.sin(angle) * (size / 2 - 20);
      ctx.fillStyle = '#fef9c3';
      ctx.beginPath();
      ctx.arc(bx, by, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ancient Coin Skull / Aztec Idol Face in center
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.fillStyle = '#451a03';

    // Skull dome
    ctx.beginPath();
    ctx.arc(0, -20, 85, 0, Math.PI * 2);
    ctx.fill();

    // Jaw structure
    ctx.fillRect(-45, 20, 90, 60);

    // Glowing Eyes
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(-32, -24, 22, 0, Math.PI * 2);
    ctx.arc(32, -24, 22, 0, Math.PI * 2);
    ctx.fill();

    // Inverted triangular nose
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-12, 24);
    ctx.lineTo(12, 24);
    ctx.closePath();
    ctx.fill();

    // Carved teeth
    ctx.fillStyle = '#fef08a';
    for (let t = -3; t <= 3; t++) {
      ctx.fillRect(t * 12 - 4, 30, 8, 18);
      ctx.fillRect(t * 12 - 4, 52, 8, 18);
    }

    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Detailed Explorer Leather & Fabric Texture (Guy Dangerous & Scarlett Fox Outfits)
   */
  public getExplorerJacketTexture(character: string = 'Guy Dangerous'): THREE.CanvasTexture {
    const key = `jacket_${character}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    let baseColor = '#b38d50'; // khaki explorer
    let trimColor = '#61411e'; // dark leather
    if (character === 'Scarlett Fox') {
      baseColor = '#991b1b'; // ruby explorer
      trimColor = '#450a0a';
    } else if (character === 'Barry Bones') {
      baseColor = '#1e3a8a'; // tactical navy
      trimColor = '#0f172a';
    } else if (character === 'Karma Lee') {
      baseColor = '#831843'; // crimson ninja
      trimColor = '#18181b';
    }

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);

    // Fabric cross-weave weave lines
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    for (let y = 0; y < size; y += 4) {
      ctx.fillRect(0, y, size, 2);
    }
    for (let x = 0; x < size; x += 4) {
      ctx.fillRect(x, 0, 2, size);
    }

    // Leather collar & pockets
    ctx.fillStyle = trimColor;
    // Left & Right Flap Pockets
    ctx.fillRect(60, 220, 140, 160);
    ctx.fillRect(312, 220, 140, 160);

    // Brass buttons on pockets
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(130, 250, 12, 0, Math.PI * 2);
    ctx.arc(382, 250, 12, 0, Math.PI * 2);
    ctx.fill();

    // Center leather zipper / button placket
    ctx.fillStyle = trimColor;
    ctx.fillRect(size / 2 - 24, 0, 48, size);

    // Golden zipper teeth
    ctx.fillStyle = '#eab308';
    for (let z = 20; z < size - 20; z += 16) {
      ctx.fillRect(size / 2 - 10, z, 20, 8);
    }

    // Stitched seams
    ctx.strokeStyle = '#fef08a';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 3;
    ctx.strokeRect(size / 2 - 32, 4, 64, size - 8);
    ctx.setLineDash([]);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Demon Monkey Dark Shaggy Fur & Muscular Texture (1024x1024)
   */
  public getDemonMonkeyFurTexture(): THREE.CanvasTexture {
    const key = 'monkey_fur_hd';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Black obsidian base
    ctx.fillStyle = '#101010';
    ctx.fillRect(0, 0, size, size);

    // Coarse shaggy fur strokes
    for (let i = 0; i < 2400; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const len = Math.random() * 24 + 10;
      const shade = Math.random() * 30 + 15;
      ctx.strokeStyle = `rgb(${shade}, ${shade - 5}, ${shade - 5})`;
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() * 8 - 4), y + len);
      ctx.stroke();
    }

    // Demonic red glowing tribal markings / scarred runes
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.lineWidth = 6;
    for (let r = 0; r < 4; r++) {
      const rx = 80 + r * 110;
      ctx.beginPath();
      ctx.moveTo(rx, 100);
      ctx.lineTo(rx + 40, 200);
      ctx.lineTo(rx - 20, 300);
      ctx.lineTo(rx + 20, 400);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Tropical Turquoise River Water (Animated Caustic Waves - 512x512)
   */
  public getWaterTexture(): THREE.CanvasTexture {
    const key = 'river_water_hd';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#0a4f56');
    grad.addColorStop(0.5, '#128690');
    grad.addColorStop(1, '#0c6770');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Water caustic wave ripples
    ctx.strokeStyle = 'rgba(180, 250, 255, 0.4)';
    ctx.lineWidth = 4;
    for (let i = 0; i < 34; i++) {
      ctx.beginPath();
      const y = (i * 18) % size;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(size * 0.25, y - 20, size * 0.5, y + 20, size * 0.75, y - 12);
      ctx.lineTo(size, y + 10);
      ctx.stroke();
    }

    // Sparkling foam flecks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let f = 0; f < 60; f++) {
      ctx.beginPath();
      ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 4 + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.generateMipmaps = true;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Mossy Jungle Cliff Rock Face (1024x1024)
   */
  public getCliffRockTexture(): THREE.CanvasTexture {
    const key = 'cliff_rock_hd';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Dark mountain rock base
    ctx.fillStyle = '#1e241e';
    ctx.fillRect(0, 0, size, size);

    // Rock layers & strata
    for (let i = 0; i < 40; i++) {
      const y = (i * 26) % size;
      ctx.fillStyle = `hsl(${100 + Math.random() * 30}, ${25 + Math.random() * 25}%, ${16 + Math.random() * 14}%)`;
      ctx.fillRect(0, y, size, 22);
    }

    // Lush moss patches & foliage clumps
    for (let p = 0; p < 90; p++) {
      const px = Math.random() * size;
      const py = Math.random() * size;
      const r = Math.random() * 50 + 20;
      ctx.fillStyle = `rgba(${25 + Math.random() * 35}, ${95 + Math.random() * 55}, ${30 + Math.random() * 30}, 0.78)`;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.generateMipmaps = true;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Wooden Rope Bridge Planks (512x512)
   */
  public getWoodBridgeTexture(): THREE.CanvasTexture {
    const key = 'wood_bridge_hd';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#3a200e';
    ctx.fillRect(0, 0, size, size);

    const planks = 10;
    const pH = size / planks;

    for (let i = 0; i < planks; i++) {
      const y = i * pH;
      ctx.fillStyle = `hsl(28, 55%, ${22 + Math.random() * 14}%)`;
      ctx.fillRect(2, y + 2, size - 4, pH - 4);

      // Wood grain lines
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 2;
      for (let g = 0; g < 5; g++) {
        ctx.beginPath();
        ctx.moveTo(0, y + 4 + g * 8);
        ctx.lineTo(size, y + 4 + g * 8);
        ctx.stroke();
      }

      // Iron nails
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(30, y + pH / 2, 5, 0, Math.PI * 2);
      ctx.arc(size - 30, y + pH / 2, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.generateMipmaps = true;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Tropical Sky Panorama / Backdrop
   */
  public getSkyTexture(theme: 'jungle' | 'cliff' | 'volcano' = 'jungle'): THREE.CanvasTexture {
    const key = `sky_${theme}_hd`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 0, size);
    if (theme === 'jungle') {
      grad.addColorStop(0, '#1e5d6d'); // tropical teal-blue sky
      grad.addColorStop(0.35, '#4f9ba0');
      grad.addColorStop(0.65, '#8dc4b4'); // misty horizon
      grad.addColorStop(1, '#153e2a'); // deep jungle canopy
    } else if (theme === 'cliff') {
      grad.addColorStop(0, '#153d57');
      grad.addColorStop(0.5, '#4482a0');
      grad.addColorStop(0.8, '#9ac2d7');
      grad.addColorStop(1, '#1e3441');
    } else {
      grad.addColorStop(0, '#360f0a');
      grad.addColorStop(0.4, '#6b1c11');
      grad.addColorStop(0.75, '#c74817');
      grad.addColorStop(1, '#220704');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Warm sun orb glow
    const sunGrad = ctx.createRadialGradient(size * 0.7, size * 0.25, 8, size * 0.7, size * 0.25, 180);
    sunGrad.addColorStop(0, 'rgba(255, 252, 210, 0.95)');
    sunGrad.addColorStop(0.3, 'rgba(255, 220, 120, 0.55)');
    sunGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(size * 0.7, size * 0.25, 180, 0, Math.PI * 2);
    ctx.fill();

    // Distant jagged mountain silhouettes
    ctx.fillStyle = 'rgba(8, 24, 16, 0.55)';
    ctx.beginPath();
    ctx.moveTo(0, size * 0.65);
    ctx.lineTo(size * 0.2, size * 0.5);
    ctx.lineTo(size * 0.45, size * 0.6);
    ctx.lineTo(size * 0.75, size * 0.46);
    ctx.lineTo(size, size * 0.58);
    ctx.lineTo(size, size);
    ctx.lineTo(0, size);
    ctx.closePath();
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Pavement Glowing Turn Chevron Decals (etched directly on cobblestones before corners)
   */
  public getTurnArrowTexture(type: 'left' | 'right' | 'split'): THREE.CanvasTexture {
    const key = `turn_pavement_arrow_${type}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const width = 512;
    const height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Transparent background
    ctx.clearRect(0, 0, width, height);

    // Glowing Aztec border inlay
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
    ctx.lineWidth = 8;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // Outer glow aura
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 30;

    if (type === 'left') {
      // Multiple bold left chevrons: ◀ ◀
      ctx.fillStyle = '#ffea00';
      for (let i = 0; i < 2; i++) {
        const offset = i * 160;
        ctx.beginPath();
        ctx.moveTo(340 - offset, 90);
        ctx.lineTo(190 - offset, 256);
        ctx.lineTo(340 - offset, 422);
        ctx.lineTo(270 - offset, 422);
        ctx.lineTo(120 - offset, 256);
        ctx.lineTo(270 - offset, 90);
        ctx.closePath();
        ctx.fill();
      }
      // Text "LEFT"
      ctx.shadowBlur = 10;
      ctx.font = 'bold 54px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('DRAAI LINKS', 256, 480);
    } else if (type === 'right') {
      // Multiple bold right chevrons: ▶ ▶
      ctx.fillStyle = '#ffea00';
      for (let i = 0; i < 2; i++) {
        const offset = i * 160;
        ctx.beginPath();
        ctx.moveTo(172 + offset, 90);
        ctx.lineTo(322 + offset, 256);
        ctx.lineTo(172 + offset, 422);
        ctx.lineTo(242 + offset, 422);
        ctx.lineTo(392 + offset, 256);
        ctx.lineTo(242 + offset, 90);
        ctx.closePath();
        ctx.fill();
      }
      // Text "RIGHT"
      ctx.shadowBlur = 10;
      ctx.font = 'bold 54px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('DRAAI RECHTS', 256, 480);
    } else {
      // Split: Dual arrows ◀  ▶
      ctx.fillStyle = '#38ef7d';
      // Left chevron
      ctx.beginPath();
      ctx.moveTo(210, 110);
      ctx.lineTo(90, 240);
      ctx.lineTo(210, 370);
      ctx.lineTo(150, 370);
      ctx.lineTo(40, 240);
      ctx.lineTo(150, 110);
      ctx.closePath();
      ctx.fill();

      // Right chevron
      ctx.beginPath();
      ctx.moveTo(302, 110);
      ctx.lineTo(422, 240);
      ctx.lineTo(302, 370);
      ctx.lineTo(362, 370);
      ctx.lineTo(472, 240);
      ctx.lineTo(362, 110);
      ctx.closePath();
      ctx.fill();

      // Center glowing diamond
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(256, 170);
      ctx.lineTo(300, 240);
      ctx.lineTo(256, 310);
      ctx.lineTo(212, 240);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 12;
      ctx.font = '900 44px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('SPLITSING', 256, 465);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Jump Obstacle Warning Texture (Glowing Upward Chevrons & Leaping Icon on Mossy Stone)
   */
  public getJumpHazardTexture(): THREE.CanvasTexture {
    const key = 'jump_hazard_texture';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Rich dark mossy stone base
    ctx.fillStyle = '#1c2818';
    ctx.fillRect(0, 0, size, size);

    // Hazard stripes (Dark Green / Bright Jade Gold)
    const stripeW = 64;
    for (let x = -size; x < size * 2; x += stripeW * 2) {
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + stripeW, 0);
      ctx.lineTo(x + stripeW + size, size);
      ctx.lineTo(x + size, size);
      ctx.closePath();
      ctx.fill();
    }

    // Centered Jump Banner
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(40, 140, size - 80, 232);
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 140, size - 80, 232);

    // Upward glowing arrows
    ctx.shadowColor = '#4ade80';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffffff';

    // Up arrow 1
    ctx.beginPath();
    ctx.moveTo(256, 170);
    ctx.lineTo(340, 250);
    ctx.lineTo(300, 250);
    ctx.lineTo(300, 310);
    ctx.lineTo(212, 310);
    ctx.lineTo(212, 250);
    ctx.lineTo(172, 250);
    ctx.closePath();
    ctx.fill();

    ctx.font = '900 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#4ade80';
    ctx.fillText('SPRING! (▲)', 256, 355);

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Slide / Duck Obstacle Warning Texture (Downward Chevrons & Flaming Runes on Carved Lintel)
   */
  public getSlideHazardTexture(): THREE.CanvasTexture {
    const key = 'slide_hazard_texture';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Dark obsidian stone base
    ctx.fillStyle = '#1c130e';
    ctx.fillRect(0, 0, size, size);

    // Hazard stripes (Black / Flaming Amber Red)
    const stripeW = 64;
    for (let x = -size; x < size * 2; x += stripeW * 2) {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + stripeW, 0);
      ctx.lineTo(x + stripeW + size, size);
      ctx.lineTo(x + size, size);
      ctx.closePath();
      ctx.fill();
    }

    // Centered Slide Banner
    ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
    ctx.fillRect(40, 140, size - 80, 232);
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 140, size - 80, 232);

    // Downward glowing arrow
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 22;
    ctx.fillStyle = '#ffffff';

    ctx.beginPath();
    ctx.moveTo(256, 300);
    ctx.lineTo(172, 220);
    ctx.lineTo(212, 220);
    ctx.lineTo(212, 160);
    ctx.lineTo(300, 160);
    ctx.lineTo(300, 220);
    ctx.lineTo(340, 220);
    ctx.closePath();
    ctx.fill();

    ctx.font = '900 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fb923c';
    ctx.fillText('BUKKEN! (▼)', 256, 355);

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }
}

export const templeRunTextures = new TempleRunTextureFactory();
