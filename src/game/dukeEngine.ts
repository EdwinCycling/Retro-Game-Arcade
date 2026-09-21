/**
 * High-Resolution Duke Nukem 3D & Blood 3D Engine (Three.js WebGL)
 * Features:
 * - High-Res 60 FPS 3D rendering with dynamic colored point lighting
 * - True 360° horizontal mouse look & turning with WASD + arrow keys
 * - 6 High-Res Weapons:
 *   1. Mighty Foot (Kick) - Instant melee kick
 *   2. Glock 19 Pistol with laser dot
 *   3. Pump Action Shotgun with shell eject animation
 *   4. Ripper Chaingun Cannon (Three-barrel rotary)
 *   5. RPG Rocket Launcher (with smoke trail & explosion radius)
 *   6. Pipebomb & Handheld Detonator (Throw with Right Click, Detonate with Space/Click)
 * - Interactive World & Build Engine mechanics:
 *   - Working Drink Vending Machines (Duke Cola +10 HP)
 *   - Functional Light Switches (Toggles room lighting in real-time)
 *   - Restroom Toilets & Interactive Specular Mirrors
 *   - Sliding Blast Doors & Red/Blue/Yellow Access Keycards
 *   - Destructible fire extinguishers & barrels
 * - Enemy AI:
 *   - Pig Cops (Shotgun wielding mutated boars)
 *   - Assault Troopers / Lizards (Laser rifle & jetpack)
 *   - Cultists (Tommy gun & dynamite)
 *   - Octabrains (Flying psychic horrors)
 */

import * as THREE from 'three';
import {
  createHollywoodBrickTexture,
  createCinemaMarqueeTexture,
  createSteelDoorTexture,
  createVendingMachineTexture,
  createLightSwitchTexture,
  createRestroomTileTexture,
  createAsphaltRoadTexture,
  createCeilingVentTexture,
  createRedLightTexture,
  createToxicSlimeTexture,
  createToxicWallTexture,
  createBathroomMirrorTexture
} from './dukeTextures';
import { dukeAudio } from './dukeAudio';
import { HOLLYWOOD_HOLOCAUST_MAP, DUKE_MAPS, DukeMapSector } from './dukeMaps';

export type DukeWeapon = 'foot' | 'pistol' | 'shotgun' | 'chaingun' | 'rpg' | 'pipebomb';

export interface DukeStats {
  levelId: string;
  levelName: string;
  parTime: number;
  elapsedTime: number;
  health: number;
  armor: number;
  steroidsTime: number;
  score: number;
  kills: number;
  totalMonsters: number;
  itemsFound: number;
  totalItems: number;
  secretsFound: number;
  totalSecrets: number;
  currentWeapon: DukeWeapon;
  ammo: {
    pistol: number;
    shotgun: number;
    chaingun: number;
    rpg: number;
    pipebombs: number;
  };
  keys: {
    red: boolean;
    blue: boolean;
    yellow: boolean;
  };
  godMode: boolean;
  infiniteAmmo: boolean;
  isDead: boolean;
  isLevelComplete: boolean;
  nearDoor: { type: string; locked: boolean } | null;
  nearInteractable: string | null;
  pipebombsActive: number;
}

export interface DukeMonster {
  id: number;
  type: 'pigcop' | 'trooper' | 'cultist' | 'octabrain';
  x: number;
  z: number;
  hp: number;
  maxHp: number;
  state: 'idle' | 'chase' | 'attack' | 'pain' | 'dead';
  alert: boolean;
  attackCooldown: number;
  walkTimer: number;
  mesh: THREE.Sprite;
}

export interface DukeDoor {
  id: number;
  x: number;
  z: number;
  mesh: THREE.Mesh;
  state: 'closed' | 'opening' | 'open' | 'closing';
  openProgress: number; // 0.0 to 1.0
  requiresKey?: 'red' | 'blue' | 'yellow';
  isExit?: boolean;
}

export interface DukeInteractable {
  id: number;
  x: number;
  z: number;
  type: 'soda' | 'light_switch' | 'toilet' | 'mirror' | 'barrel';
  mesh: THREE.Mesh;
  stateActive: boolean;
  isBroken?: boolean;
}

export interface DukeProjectile {
  mesh: THREE.Mesh;
  x: number;
  z: number;
  vx: number;
  vz: number;
  isRocket?: boolean;
  isPipebomb?: boolean;
  timer?: number;
}

export interface DukeEnemyProjectile {
  mesh: THREE.Mesh | THREE.Sprite;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  type: 'psychic_blast' | 'dynamite' | 'laser';
  timer: number;
  damage: number;
  radius: number;
}

export class DukeEngine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private animFrameId: number | null = null;

  // Player position & 360° orientation
  public posX: number = 2.5;
  public posZ: number = 2.5;
  public angle: number = 0; // Radians
  public pitch: number = 0; // Vertical look clamp

  // Movement Inputs
  public moveForward: boolean = false;
  public moveBackward: boolean = false;
  public strafeLeft: boolean = false;
  public strafeRight: boolean = false;
  public turnLeft: boolean = false;
  public turnRight: boolean = false;

  // Player Stats
  public health: number = 100;
  public armor: number = 25;
  public steroidsTime: number = 0;
  public score: number = 0;
  public kills: number = 0;
  public currentWeapon: DukeWeapon = 'pistol';
  public ammo = {
    pistol: 48,
    shotgun: 12,
    chaingun: 50,
    rpg: 5,
    pipebombs: 4
  };
  public keys = { red: false, blue: false, yellow: false };
  public godMode: boolean = false;
  public infiniteAmmo: boolean = false;
  public isDead: boolean = false;
  public isLevelComplete: boolean = false;

  // Level & Map Info
  public currentMap: DukeMapSector = HOLLYWOOD_HOLOCAUST_MAP;
  public elapsedTime: number = 0;
  public secretsFound: number = 0;
  public itemsFound: number = 0;

  // Entities & Lights
  private ambientLight!: THREE.AmbientLight;
  private roomLights: THREE.PointLight[] = [];
  private doors: DukeDoor[] = [];
  private monsters: DukeMonster[] = [];
  private interactables: DukeInteractable[] = [];
  private projectiles: DukeProjectile[] = [];
  private itemSprites: { mesh: THREE.Sprite; type: string; x: number; z: number; collected: boolean }[] = [];

  // Weapon Firing State
  public isShooting: boolean = false;
  public weaponAnimTimer: number = 0;
  public kickAnimTimer: number = 0;
  private lastShootTime: number = 0;
  public pipebombsInField: { x: number; z: number; mesh: THREE.Mesh }[] = [];

  // Textures
  private texBrick!: THREE.CanvasTexture;
  private texMarquee!: THREE.CanvasTexture;
  private texDoorNormal!: THREE.CanvasTexture;
  private texDoorRed!: THREE.CanvasTexture;
  private texDoorBlue!: THREE.CanvasTexture;
  private texDoorYellow!: THREE.CanvasTexture;
  private texVending!: THREE.CanvasTexture;
  private texTile!: THREE.CanvasTexture;
  private texRoad!: THREE.CanvasTexture;
  private texVent!: THREE.CanvasTexture;
  private texSwitchOn!: THREE.CanvasTexture;
  private texSwitchOff!: THREE.CanvasTexture;
  private texRedLight!: THREE.CanvasTexture;
  private texToxicSlime!: THREE.CanvasTexture;
  private texToxicWall!: THREE.CanvasTexture;
  private texMirrorClean!: THREE.CanvasTexture;
  private texMirrorBroken!: THREE.CanvasTexture;
  private enemyProjectiles: DukeEnemyProjectile[] = [];
  public mirrorMeshes: THREE.Mesh[] = [];

  private onStatsUpdate?: (stats: DukeStats) => void;

  constructor(container: HTMLElement, levelId: string = 'e1l1', onStatsUpdate?: (stats: DukeStats) => void) {
    this.onStatsUpdate = onStatsUpdate;
    this.currentMap = DUKE_MAPS[levelId] || HOLLYWOOD_HOLOCAUST_MAP;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060608);
    this.scene.fog = new THREE.FogExp2(0x060608, 0.05);

    const width = container.clientWidth > 0 ? container.clientWidth : 800;
    const height = container.clientHeight > 0 ? container.clientHeight : 500;

    this.camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 100);
    this.camera.position.set(this.posX, 1.3, this.posZ);

    // 2. High-Performance WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    // 3. Build Textures & Materials
    this.initTextures();

    // 4. Build Map Sectors & Objects
    this.buildMapGeometry();

    // 5. Start Game Loop
    this.animate();
  }

  private initTextures() {
    this.texBrick = createHollywoodBrickTexture();
    this.texMarquee = createCinemaMarqueeTexture();
    this.texDoorNormal = createSteelDoorTexture();
    this.texDoorRed = createSteelDoorTexture('red');
    this.texDoorBlue = createSteelDoorTexture('blue');
    this.texDoorYellow = createSteelDoorTexture('yellow');
    this.texVending = createVendingMachineTexture();
    this.texTile = createRestroomTileTexture();
    this.texRoad = createAsphaltRoadTexture();
    this.texVent = createCeilingVentTexture();
    this.texSwitchOn = createLightSwitchTexture(true);
    this.texSwitchOff = createLightSwitchTexture(false);
    this.texRedLight = createRedLightTexture();
    this.texToxicSlime = createToxicSlimeTexture();
    this.texToxicWall = createToxicWallTexture();
    this.texMirrorClean = createBathroomMirrorTexture(false);
    this.texMirrorBroken = createBathroomMirrorTexture(true);
  }

  private buildMapGeometry() {
    // 1. Lighting
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(this.ambientLight);

    // Add vibrant neon ambient lights based on map theme
    if (this.currentMap.id === 'e1l2') {
      const neonPink = new THREE.PointLight(0xec4899, 3.2, 14);
      neonPink.position.set(12, 2.5, 2);
      this.scene.add(neonPink);
      this.roomLights.push(neonPink);

      const neonPurple = new THREE.PointLight(0xa855f7, 3.0, 14);
      neonPurple.position.set(4, 2.5, 11);
      this.scene.add(neonPurple);
      this.roomLights.push(neonPurple);
    } else if (this.currentMap.id === 'e1l3') {
      const slimeGreen = new THREE.PointLight(0x22c55e, 3.5, 15);
      slimeGreen.position.set(8, 1.5, 8);
      this.scene.add(slimeGreen);
      this.roomLights.push(slimeGreen);

      const toxicYellow = new THREE.PointLight(0xeab308, 2.5, 12);
      toxicYellow.position.set(14, 2.5, 14);
      this.scene.add(toxicYellow);
      this.roomLights.push(toxicYellow);
    } else {
      const streetGold = new THREE.PointLight(0xf59e0b, 2.0, 15);
      streetGold.position.set(10, 2.8, 8);
      this.scene.add(streetGold);
      this.roomLights.push(streetGold);

      const neonCyan = new THREE.PointLight(0x06b6d4, 2.2, 12);
      neonCyan.position.set(4, 2.5, 11);
      this.scene.add(neonCyan);
      this.roomLights.push(neonCyan);
    }

    // 2. Level Grid Iteration
    const map = this.currentMap;
    this.posX = map.startX;
    this.posZ = map.startZ;
    this.angle = map.startAngle;

    const wallGeo = new THREE.BoxGeometry(1, 2.8, 1);
    const floorGeo = new THREE.PlaneGeometry(map.gridWidth, map.gridHeight);

    // Floor
    const floorTex = map.id === 'e1l3' ? this.texToxicSlime : this.texRoad;
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(map.gridWidth / 2, map.gridHeight / 2);
    const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.8 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(map.gridWidth / 2, 0, map.gridHeight / 2);
    this.scene.add(floorMesh);

    // Ceiling
    this.texVent.wrapS = THREE.RepeatWrapping;
    this.texVent.wrapT = THREE.RepeatWrapping;
    this.texVent.repeat.set(map.gridWidth / 2, map.gridHeight / 2);
    const ceilMat = new THREE.MeshStandardMaterial({ map: this.texVent, roughness: 0.9 });
    const ceilMesh = new THREE.Mesh(floorGeo, ceilMat);
    ceilMesh.rotation.x = Math.PI / 2;
    ceilMesh.position.set(map.gridWidth / 2, 2.8, map.gridHeight / 2);
    this.scene.add(ceilMesh);

    // Build Walls, Doors & Interactables
    for (let z = 0; z < map.gridHeight; z++) {
      for (let x = 0; x < map.gridWidth; x++) {
        const cell = map.layout[z][x];
        if (cell === 0) continue;

        const posX = x + 0.5;
        const posZ = z + 0.5;

        if (cell === 1) {
          // Hollywood Brick Wall
          const mat = new THREE.MeshStandardMaterial({ map: this.texBrick, roughness: 0.7 });
          const wall = new THREE.Mesh(wallGeo, mat);
          wall.position.set(posX, 1.4, posZ);
          this.scene.add(wall);
        } else if (cell === 2) {
          // Cinema Neon Marquee Facade
          const mat = new THREE.MeshStandardMaterial({
            map: this.texMarquee,
            roughness: 0.5,
            emissive: new THREE.Color(0x7f1d1d),
            emissiveIntensity: 0.35
          });
          const wall = new THREE.Mesh(wallGeo, mat);
          wall.position.set(posX, 1.4, posZ);
          this.scene.add(wall);
        } else if (cell === 13) {
          // E1L2 Red Light District Club Façade
          const mat = new THREE.MeshStandardMaterial({
            map: this.texRedLight,
            roughness: 0.4,
            emissive: new THREE.Color(0x831843),
            emissiveIntensity: 0.4
          });
          const wall = new THREE.Mesh(wallGeo, mat);
          wall.position.set(posX, 1.4, posZ);
          this.scene.add(wall);
        } else if (cell === 14) {
          // E1L3 Toxic Dump Biohazard Wall
          const mat = new THREE.MeshStandardMaterial({
            map: this.texToxicWall,
            roughness: 0.6,
            emissive: new THREE.Color(0x14532d),
            emissiveIntensity: 0.25
          });
          const wall = new THREE.Mesh(wallGeo, mat);
          wall.position.set(posX, 1.4, posZ);
          this.scene.add(wall);
        } else if (cell === 10) {
          // Toxic Slime / Acid Hazard Pool
          const slimeGeo = new THREE.BoxGeometry(0.98, 0.1, 0.98);
          const slimeMat = new THREE.MeshStandardMaterial({
            map: this.texToxicSlime,
            emissive: new THREE.Color(0x15803d),
            emissiveIntensity: 0.65
          });
          const slimeMesh = new THREE.Mesh(slimeGeo, slimeMat);
          slimeMesh.position.set(posX, 0.05, posZ);
          this.scene.add(slimeMesh);
        } else if (cell === 3 || cell === 4 || cell === 5 || cell === 6) {
          // Sliding Blast Door
          let doorTex = this.texDoorNormal;
          let reqKey: 'red' | 'blue' | 'yellow' | undefined = undefined;
          if (cell === 4) { doorTex = this.texDoorRed; reqKey = 'red'; }
          if (cell === 5) { doorTex = this.texDoorYellow; reqKey = 'yellow'; }
          if (cell === 6) { doorTex = this.texDoorBlue; reqKey = 'blue'; }

          const doorGeo = new THREE.BoxGeometry(0.98, 2.7, 0.98);
          const doorMat = new THREE.MeshStandardMaterial({ map: doorTex, roughness: 0.6 });
          const doorMesh = new THREE.Mesh(doorGeo, doorMat);
          doorMesh.position.set(posX, 1.35, posZ);
          this.scene.add(doorMesh);

          this.doors.push({
            id: this.doors.length + 1,
            x: posX,
            z: posZ,
            mesh: doorMesh,
            state: 'closed',
            openProgress: 0,
            requiresKey: reqKey
          });
        } else if (cell === 7) {
          // Soda Vending Machine
          const vendGeo = new THREE.BoxGeometry(0.9, 2.2, 0.9);
          const vendMat = new THREE.MeshStandardMaterial({
            map: this.texVending,
            emissive: new THREE.Color(0x991b1b),
            emissiveIntensity: 0.25
          });
          const vendMesh = new THREE.Mesh(vendGeo, vendMat);
          vendMesh.position.set(posX, 1.1, posZ);
          this.scene.add(vendMesh);

          this.interactables.push({
            id: this.interactables.length + 1,
            x: posX,
            z: posZ,
            type: 'soda',
            mesh: vendMesh,
            stateActive: false
          });
        } else if (cell === 8) {
          // Restroom Floor & Tile Walls
          const mat = new THREE.MeshStandardMaterial({ map: this.texTile, roughness: 0.3 });
          const tileWall = new THREE.Mesh(wallGeo, mat);
          tileWall.position.set(posX, 1.4, posZ);
          this.scene.add(tileWall);

          // Working Bathroom Mirror on Wall
          const mirrorGeo = new THREE.PlaneGeometry(0.85, 1.3);
          const mirrorMat = new THREE.MeshStandardMaterial({
            map: this.texMirrorClean,
            roughness: 0.1,
            metalness: 0.9,
            emissive: new THREE.Color(0x38bdf8),
            emissiveIntensity: 0.15
          });
          const mirrorMesh = new THREE.Mesh(mirrorGeo, mirrorMat);
          mirrorMesh.position.set(posX, 1.4, posZ - 0.49);
          mirrorMesh.rotation.y = 0;
          this.scene.add(mirrorMesh);
          this.mirrorMeshes.push(mirrorMesh);

          this.interactables.push({
            id: this.interactables.length + 1,
            x: posX,
            z: posZ,
            type: 'mirror',
            mesh: mirrorMesh,
            stateActive: false,
            isBroken: false
          });

          // Restroom Toilet Interactable
          const toiletGeo = new THREE.BoxGeometry(0.5, 0.6, 0.6);
          const toiletMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
          const toiletMesh = new THREE.Mesh(toiletGeo, toiletMat);
          toiletMesh.position.set(posX, 0.3, posZ + 0.1);
          this.scene.add(toiletMesh);

          this.interactables.push({
            id: this.interactables.length + 1,
            x: posX,
            z: posZ + 0.1,
            type: 'toilet',
            mesh: toiletMesh,
            stateActive: false
          });
        } else if (cell === 9) {
          // Level Exit Nuke Sign
          const nukeMat = new THREE.MeshStandardMaterial({
            map: this.texDoorNormal,
            emissive: new THREE.Color(0x15803d),
            emissiveIntensity: 0.6
          });
          const nukeMesh = new THREE.Mesh(wallGeo, nukeMat);
          nukeMesh.position.set(posX, 1.4, posZ);
          this.scene.add(nukeMesh);
        }
      }
    }

    // Spawn Monsters
    map.monsters.forEach((m, idx) => {
      this.spawnMonster(idx + 1, m.type, m.x, m.z);
    });

    // Spawn Items
    map.items.forEach((item) => {
      this.spawnItem(item.type, item.x, item.z);
    });
  }

  // --- Entity Spawning ---
  private spawnMonster(id: number, type: 'pigcop' | 'trooper' | 'cultist' | 'octabrain', x: number, z: number) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // High-Res Monster Character Sprite
    if (type === 'pigcop') {
      // Pig Cop with brown snout, cop cap, and body armor
      ctx.fillStyle = '#1e3a8a'; // Police blue uniform
      ctx.fillRect(36, 48, 56, 60);
      ctx.fillStyle = '#b45309'; // Body armor
      ctx.fillRect(44, 56, 40, 44);

      // Pig Head & Snout
      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.arc(64, 38, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dc2626'; // Snout
      ctx.fillRect(52, 38, 24, 14);

      // Red glowing eyes
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(48, 28, 8, 6);
      ctx.fillRect(72, 28, 8, 6);

      // L.A.R.D. Cop Cap
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(38, 16, 52, 12);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(60, 18, 8, 8); // Gold badge

      // Shotgun in hand
      ctx.fillStyle = '#475569';
      ctx.fillRect(80, 60, 36, 12);
    } else if (type === 'trooper') {
      // Green Alien Lizard Trooper with red eyes
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(64, 36, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(50, 30, 8, 8);
      ctx.fillRect(70, 30, 8, 8);

      // Jetpack & Armor
      ctx.fillStyle = '#475569';
      ctx.fillRect(40, 52, 48, 56);
      ctx.fillStyle = '#06b6d4'; // Laser blaster
      ctx.fillRect(78, 64, 32, 10);
    } else if (type === 'octabrain') {
      // Octabrain: Flying bulbous pink brain with tentacles, multi-eyes & psychic aura
      // Glowing psychic aura
      const aura = ctx.createRadialGradient(64, 48, 10, 64, 48, 50);
      aura.addColorStop(0, 'rgba(217, 70, 239, 0.8)');
      aura.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(64, 48, 50, 0, Math.PI * 2);
      ctx.fill();

      // Big Cerebral Brain Lobes
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(48, 38, 24, 0, Math.PI * 2);
      ctx.arc(80, 38, 24, 0, Math.PI * 2);
      ctx.arc(64, 30, 26, 0, Math.PI * 2);
      ctx.fill();

      // Brain Sulci Wrinkles
      ctx.strokeStyle = '#be185d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(64, 12);
      ctx.lineTo(64, 52);
      ctx.moveTo(42, 28);
      ctx.lineTo(56, 42);
      ctx.moveTo(86, 28);
      ctx.lineTo(72, 42);
      ctx.stroke();

      // Multiple creepy glowing alien eyes
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(46, 52, 6, 0, Math.PI * 2);
      ctx.arc(64, 50, 7, 0, Math.PI * 2);
      ctx.arc(82, 52, 6, 0, Math.PI * 2);
      ctx.arc(54, 62, 5, 0, Math.PI * 2);
      ctx.arc(74, 62, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.fillRect(45, 50, 2, 4);
      ctx.fillRect(63, 48, 2, 4);
      ctx.fillRect(81, 50, 2, 4);

      // Maw with Sharp Fangs
      ctx.fillStyle = '#831843';
      ctx.beginPath();
      ctx.arc(64, 74, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(54 + i * 6, 70, 3, 7);
      }

      // 6 Waving Tentacles
      ctx.strokeStyle = '#db2777';
      ctx.lineWidth = 4;
      for (let i = 0; i < 6; i++) {
        const tx = 38 + i * 10;
        ctx.beginPath();
        ctx.moveTo(tx, 80);
        ctx.bezierCurveTo(tx - 10, 100, tx + 10, 110, tx + (i % 2 === 0 ? -12 : 12), 124);
        ctx.stroke();
      }
    } else {
      // Blood Cultist (Brown Robe & Dynamite Bundle)
      ctx.fillStyle = '#451a03';
      ctx.fillRect(36, 32, 56, 80);
      ctx.fillStyle = '#1c1917'; // Hood
      ctx.beginPath();
      ctx.arc(64, 32, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbbf24'; // Glowing eyes
      ctx.fillRect(54, 28, 6, 6);
      ctx.fillRect(68, 28, 6, 6);

      // Red Sticks of Dynamite with Burning Spark Fuse
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(72, 56, 26, 12);
      ctx.fillRect(74, 66, 26, 10);
      ctx.fillStyle = '#f59e0b'; // Fuse flame
      ctx.beginPath();
      ctx.arc(98, 54, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    const spriteTex = new THREE.CanvasTexture(canvas);
    spriteTex.magFilter = THREE.NearestFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: spriteTex });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.4, 1.4, 1.4);
    sprite.position.set(x, 0.7, z);
    this.scene.add(sprite);

    const hpValue = type === 'octabrain' ? 130 : type === 'pigcop' ? 90 : type === 'cultist' ? 65 : 55;

    this.monsters.push({
      id,
      type,
      x,
      z,
      hp: hpValue,
      maxHp: hpValue,
      state: 'idle',
      alert: false,
      attackCooldown: 120 + Math.floor(Math.random() * 90), // Initial grace period so player isn't hit on spawn
      walkTimer: 0,
      mesh: sprite
    });
  }

  private spawnItem(type: string, x: number, z: number) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    if (type === 'shotgun') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(10, 24, 44, 12);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(4, 28, 14, 10);
    } else if (type === 'chaingun') {
      ctx.fillStyle = '#0891b2';
      ctx.fillRect(8, 22, 48, 16);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(40, 18, 16, 24);
    } else if (type === 'rpg') {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(6, 20, 52, 16);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(56, 16);
      ctx.lineTo(64, 28);
      ctx.lineTo(56, 40);
      ctx.fill();
    } else if (type === 'pipebomb') {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(16, 20, 32, 24);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(28, 12, 8, 8); // Flashing light
    } else if (type === 'atomic_health') {
      // Radioactive Duke Nuclear Symbol +100 HP
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(32, 32, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('☢', 32, 42);
    } else if (type === 'medkit' || type === 'armor') {
      ctx.fillStyle = type === 'armor' ? '#3b82f6' : '#22c55e';
      ctx.fillRect(14, 14, 36, 36);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(type === 'armor' ? 'ARM' : 'MED', 32, 38);
    } else if (type === 'steroids') {
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(18, 12, 28, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('STERO', 32, 36);
    } else if (type.includes('key')) {
      const color = type.includes('red') ? '#ef4444' : type.includes('blue') ? '#3b82f6' : '#eab308';
      ctx.fillStyle = color;
      ctx.fillRect(16, 16, 32, 32);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('KEY', 32, 38);
    } else {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(12, 16, 40, 32);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(28, 20, 8, 24);
      ctx.fillRect(20, 28, 24, 8);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: tex });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(0.8, 0.8, 0.8);
    sprite.position.set(x, 0.4, z);
    this.scene.add(sprite);

    this.itemSprites.push({ mesh: sprite, type, x, z, collected: false });
  }

  // --- WEAPON ATTACK & INTERACTION ---
  public fireWeapon() {
    if (this.isDead || this.isShooting) return;
    const now = performance.now();
    if (now - this.lastShootTime < 220) return;
    this.lastShootTime = now;

    if (this.currentWeapon === 'foot') {
      // Mighty Foot kick
      this.kickAnimTimer = 1.0;
      dukeAudio.playKick();
      this.dealMeleeDamage(45, 1.8);
      this.checkMirrorHit();
      return;
    }

    // Check Ammo
    const currentAmmo = this.ammo[this.currentWeapon as keyof typeof this.ammo];
    if (!this.infiniteAmmo && currentAmmo <= 0) {
      // Auto switch to Pistol or Mighty Foot
      if (this.ammo.pistol > 0) this.currentWeapon = 'pistol';
      else this.currentWeapon = 'foot';
      return;
    }

    if (!this.infiniteAmmo) {
      this.ammo[this.currentWeapon as keyof typeof this.ammo]--;
    }

    this.isShooting = true;
    this.weaponAnimTimer = 1.0;

    if (this.currentWeapon === 'pistol') {
      dukeAudio.playPistol();
      this.hitscanAttack(28, 0.04);
      this.checkMirrorHit();
    } else if (this.currentWeapon === 'shotgun') {
      dukeAudio.playShotgun();
      for (let i = 0; i < 7; i++) {
        this.hitscanAttack(18, 0.12);
      }
      this.checkMirrorHit();
    } else if (this.currentWeapon === 'chaingun') {
      dukeAudio.playChaingun();
      this.hitscanAttack(32, 0.06);
      this.checkMirrorHit();
    } else if (this.currentWeapon === 'rpg') {
      dukeAudio.playRPGLaunch();
      this.spawnRPGProjectile();
    } else if (this.currentWeapon === 'pipebomb') {
      dukeAudio.playPipebombThrow();
      this.throwPipebomb();
    }

    // Occasional Duke badass quote
    if (Math.random() < 0.12) {
      const quotes: ('hail' | 'bubblegum' | 'damn_good' | 'groovy' | 'eat_shit')[] = ['hail', 'bubblegum', 'damn_good', 'groovy', 'eat_shit'];
      dukeAudio.playDukeQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }
  }

  // Mighty Foot Kick hotkey (C key)
  public kick() {
    if (this.isDead || this.kickAnimTimer > 0) return;
    this.kickAnimTimer = 1.0;
    dukeAudio.playKick();
    this.dealMeleeDamage(50, 1.9);
    this.checkMirrorHit();
  }

  private checkMirrorHit() {
    const dirX = Math.sin(this.angle);
    const dirZ = -Math.cos(this.angle);
    const targetX = this.posX + dirX * 1.8;
    const targetZ = this.posZ + dirZ * 1.8;

    for (const obj of this.interactables) {
      if (obj.type === 'mirror' && !obj.isBroken) {
        const dist = Math.hypot(obj.x - targetX, obj.z - targetZ);
        if (dist < 1.6) {
          obj.isBroken = true;
          dukeAudio.playGlassShatter();
          (obj.mesh.material as THREE.MeshStandardMaterial).map = this.texMirrorBroken;
          (obj.mesh.material as THREE.MeshStandardMaterial).needsUpdate = true;
          dukeAudio.playDukeQuote('eat_shit');
          this.score += 150;
        }
      }
    }
  }

  // Detonate Active Pipebombs
  public detonatePipebombs() {
    if (this.pipebombsInField.length === 0) return;
    dukeAudio.playDetonatorClick();

    this.pipebombsInField.forEach((bomb) => {
      dukeAudio.playExplosion();
      this.scene.remove(bomb.mesh);
      this.dealRadialDamage(bomb.x, bomb.z, 160, 4.5);
    });

    this.pipebombsInField = [];
    dukeAudio.playDukeQuote('damn_good');
  }

  private throwPipebomb() {
    const geo = new THREE.BoxGeometry(0.3, 0.2, 0.2);
    const mat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });
    const bombMesh = new THREE.Mesh(geo, mat);

    const dirX = Math.sin(this.angle);
    const dirZ = -Math.cos(this.angle);
    const targetX = this.posX + dirX * 3.5;
    const targetZ = this.posZ + dirZ * 3.5;

    bombMesh.position.set(targetX, 0.15, targetZ);
    this.scene.add(bombMesh);

    this.pipebombsInField.push({ x: targetX, z: targetZ, mesh: bombMesh });
  }

  private spawnRPGProjectile() {
    const geo = new THREE.ConeGeometry(0.12, 0.4, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(this.posX, 1.2, this.posZ);
    this.scene.add(mesh);

    const dirX = Math.sin(this.angle);
    const dirZ = -Math.cos(this.angle);

    this.projectiles.push({
      mesh,
      x: this.posX,
      z: this.posZ,
      vx: dirX * 0.4,
      vz: dirZ * 0.4,
      isRocket: true,
      timer: 60
    });
  }

  private hitscanAttack(damage: number, spread: number) {
    const spreadAngle = this.angle + (Math.random() - 0.5) * spread;
    const dirX = Math.sin(spreadAngle);
    const dirZ = -Math.cos(spreadAngle);

    // Check hit on monsters
    for (const m of this.monsters) {
      if (m.state === 'dead') continue;
      const dx = m.x - this.posX;
      const dz = m.z - this.posZ;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > 18) continue;

      const dot = (dx * dirX + dz * dirZ) / dist;
      if (dot > 0.94) {
        m.hp -= damage;
        m.alert = true;
        if (m.hp <= 0) {
          m.state = 'dead';
          m.mesh.scale.set(1.4, 0.4, 1.4);
          m.mesh.position.y = 0.2;
          this.kills++;
          this.score += 250;
          if (m.type === 'pigcop') dukeAudio.playPigCopDeath();
          else if (m.type === 'octabrain') dukeAudio.playOctabrainScreech();
        }
        break;
      }
    }
  }

  private dealMeleeDamage(damage: number, maxDist: number) {
    for (const m of this.monsters) {
      if (m.state === 'dead') continue;
      const dist = Math.hypot(m.x - this.posX, m.z - this.posZ);
      if (dist <= maxDist) {
        m.hp -= damage;
        m.alert = true;
        if (m.hp <= 0) {
          m.state = 'dead';
          m.mesh.scale.set(1.4, 0.4, 1.4);
          m.mesh.position.y = 0.2;
          this.kills++;
          this.score += 300;
          dukeAudio.playDukeQuote('eat_shit');
        }
      }
    }
  }

  private dealRadialDamage(cx: number, cz: number, maxDamage: number, radius: number) {
    for (const m of this.monsters) {
      if (m.state === 'dead') continue;
      const dist = Math.hypot(m.x - cx, m.z - cz);
      if (dist <= radius) {
        const dmg = maxDamage * (1 - dist / radius);
        m.hp -= dmg;
        if (m.hp <= 0) {
          m.state = 'dead';
          m.mesh.scale.set(1.4, 0.4, 1.4);
          m.mesh.position.y = 0.2;
          this.kills++;
          this.score += 400;
        }
      }
    }
  }

  // --- INTERACTION (Space / E Key) ---
  public interact() {
    if (this.isDead) return;

    // 1. Check Doors in front
    const dirX = Math.sin(this.angle);
    const dirZ = -Math.cos(this.angle);
    const frontX = this.posX + dirX * 1.4;
    const frontZ = this.posZ + dirZ * 1.4;

    for (const d of this.doors) {
      const dist = Math.hypot(d.x - frontX, d.z - frontZ);
      if (dist < 1.2 && d.state === 'closed') {
        if (d.requiresKey && !this.keys[d.requiresKey]) {
          // Locked sound
          dukeAudio.playLightSwitch();
          return;
        }
        if (d.requiresKey) {
          dukeAudio.playKeycardUnlock();
        } else {
          dukeAudio.playDoorSlide();
        }
        d.state = 'opening';
        return;
      }
    }

    // 2. Check Interactables (Vending Machine, Mirror, Toilet, Light Switch)
    for (const obj of this.interactables) {
      const dist = Math.hypot(obj.x - frontX, obj.z - frontZ);
      if (dist < 1.6) {
        if (obj.type === 'soda') {
          // Drink Duke Cola (+10 HP up to 100)
          this.health = Math.min(100, this.health + 10);
          dukeAudio.playSodaMachine();
          this.score += 50;
        } else if (obj.type === 'mirror') {
          // Look into Mirror: Duke looks at himself!
          if (!obj.isBroken) {
            dukeAudio.playDukeQuote('looking_good');
            this.score += 25;
          }
        } else if (obj.type === 'toilet') {
          // Flush toilet
          dukeAudio.playToiletFlush();
          this.health = Math.min(100, this.health + 5);
          dukeAudio.playDukeQuote('soda');
          this.score += 25;
        }
        return;
      }
    }

    // 3. Level Exit Check
    const gridX = Math.floor(frontX);
    const gridZ = Math.floor(frontZ);
    if (this.currentMap.layout[gridZ]?.[gridX] === 9) {
      this.isLevelComplete = true;
      dukeAudio.playDukeQuote('damn_good');
    }
  }

  // --- GAME UPDATE LOOP ---
  private animate = () => {
    this.animFrameId = requestAnimationFrame(this.animate);
    this.update();
    this.renderer.render(this.scene, this.camera);
  };

  private update() {
    if (this.isDead) return;
    this.elapsedTime += 1 / 60;

    // Movement & Turning
    const moveSpeed = this.steroidsTime > 0 ? 0.12 : 0.075;
    const turnSpeed = 0.045;

    if (this.turnLeft) this.angle -= turnSpeed;
    if (this.turnRight) this.angle += turnSpeed;

    let dx = 0;
    let dz = 0;
    if (this.moveForward) {
      dx += Math.sin(this.angle) * moveSpeed;
      dz -= Math.cos(this.angle) * moveSpeed;
    }
    if (this.moveBackward) {
      dx -= Math.sin(this.angle) * moveSpeed;
      dz += Math.cos(this.angle) * moveSpeed;
    }
    if (this.strafeLeft) {
      dx -= Math.cos(this.angle) * moveSpeed;
      dz -= Math.sin(this.angle) * moveSpeed;
    }
    if (this.strafeRight) {
      dx += Math.cos(this.angle) * moveSpeed;
      dz += Math.sin(this.angle) * moveSpeed;
    }

    // Collision Check
    const nextX = this.posX + dx;
    const nextZ = this.posZ + dz;
    if (!this.checkWallCollision(nextX, this.posZ)) this.posX = nextX;
    if (!this.checkWallCollision(this.posX, nextZ)) this.posZ = nextZ;

    // Slime Hazard check (cell 10)
    const curGx = Math.floor(this.posX);
    const curGz = Math.floor(this.posZ);
    if (this.currentMap.layout[curGz]?.[curGx] === 10 && !this.godMode) {
      if (Math.random() < 0.1) {
        this.health = Math.max(0, this.health - 2);
        dukeAudio.playSlimeHiss();
        if (this.health <= 0) this.isDead = true;
      }
    }

    // Camera sync
    this.camera.position.set(this.posX, 1.3, this.posZ);
    this.camera.rotation.set(0, 0, 0);
    this.camera.rotation.y = -this.angle;

    // Update Doors
    this.updateDoors();

    // Update Projectiles
    this.updateProjectiles();
    this.updateEnemyProjectiles();

    // Update Monster AI
    this.updateMonsters();

    // Update Pickups
    this.updatePickups();

    // Weapon Animation Timers
    if (this.weaponAnimTimer > 0) {
      this.weaponAnimTimer -= 0.12;
      if (this.weaponAnimTimer <= 0) this.isShooting = false;
    }
    if (this.kickAnimTimer > 0) {
      this.kickAnimTimer -= 0.09;
    }

    // Emit Stats to UI
    this.notifyStats();
  }

  private checkWallCollision(x: number, z: number): boolean {
    const gx = Math.floor(x);
    const gz = Math.floor(z);
    if (gx < 0 || gx >= this.currentMap.gridWidth || gz < 0 || gz >= this.currentMap.gridHeight) return true;

    const cell = this.currentMap.layout[gz][gx];
    if (cell === 1 || cell === 2 || cell === 7 || cell === 8 || cell === 13 || cell === 14) return true;

    // Closed doors collision
    for (const d of this.doors) {
      if (Math.floor(d.x) === gx && Math.floor(d.z) === gz && d.openProgress < 0.8) {
        return true;
      }
    }

    return false;
  }

  private updateDoors() {
    for (const d of this.doors) {
      if (d.state === 'opening') {
        d.openProgress += 0.04;
        d.mesh.position.y = 1.35 + d.openProgress * 2.5;
        if (d.openProgress >= 1.0) {
          d.state = 'open';
          setTimeout(() => {
            if (d.state === 'open') d.state = 'closing';
          }, 3500);
        }
      } else if (d.state === 'closing') {
        d.openProgress -= 0.04;
        d.mesh.position.y = 1.35 + d.openProgress * 2.5;
        if (d.openProgress <= 0) {
          d.openProgress = 0;
          d.state = 'closed';
        }
      }
    }
  }

  private updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.z += p.vz;
      p.mesh.position.set(p.x, 1.2, p.z);

      if (this.checkWallCollision(p.x, p.z)) {
        dukeAudio.playExplosion();
        this.dealRadialDamage(p.x, p.z, 140, 3.5);
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateEnemyProjectiles() {
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const ep = this.enemyProjectiles[i];
      ep.x += ep.vx;
      ep.z += ep.vz;

      if (ep.type === 'dynamite') {
        ep.vy -= 0.0035; // Gravity
        ep.y = Math.max(0.15, ep.y + ep.vy);
        ep.timer--;

        ep.mesh.position.set(ep.x, ep.y, ep.z);
        ep.mesh.rotation.x += 0.1;
        ep.mesh.rotation.y += 0.15;

        // Fuse detonation
        if (ep.timer <= 0 || this.checkWallCollision(ep.x, ep.z)) {
          dukeAudio.playExplosion();
          const distToPlayer = Math.hypot(this.posX - ep.x, this.posZ - ep.z);
          if (distToPlayer < ep.radius && !this.godMode) {
            const damage = Math.floor(ep.damage * (1 - distToPlayer / ep.radius));
            this.health = Math.max(0, this.health - damage);
            if (this.health <= 0) this.isDead = true;
          }
          this.scene.remove(ep.mesh);
          this.enemyProjectiles.splice(i, 1);
          continue;
        }
      } else {
        ep.mesh.position.set(ep.x, ep.y, ep.z);

        // Direct hit on player
        const distToPlayer = Math.hypot(this.posX - ep.x, this.posZ - ep.z);
        if (distToPlayer < 0.75) {
          if (!this.godMode) {
            this.health = Math.max(0, this.health - ep.damage);
            if (ep.type === 'psychic_blast') {
              dukeAudio.playOctabrainScreech();
            }
            if (this.health <= 0) this.isDead = true;
          }
          this.scene.remove(ep.mesh);
          this.enemyProjectiles.splice(i, 1);
          continue;
        }

        // Hit wall
        if (this.checkWallCollision(ep.x, ep.z)) {
          this.scene.remove(ep.mesh);
          this.enemyProjectiles.splice(i, 1);
          continue;
        }
      }
    }
  }

  private updateMonsters() {
    for (const m of this.monsters) {
      if (m.state === 'dead') continue;
      const dist = Math.hypot(m.x - this.posX, m.z - this.posZ);

      // Octabrain vertical hovering bob
      if (m.type === 'octabrain') {
        m.mesh.position.y = 1.1 + Math.sin(this.elapsedTime * 3 + m.id) * 0.25;
      }

      // Check direct line of sight
      const hasLOS = this.hasLineOfSight(m.x, m.z, this.posX, this.posZ);

      // Alert only if close and has direct line-of-sight, or if player fired weapon nearby
      if ((dist < 8.5 && hasLOS) || (this.isShooting && dist < 12.0)) {
        m.alert = true;
      }

      if (m.alert) {
        // Walk towards player only if not stuck in wall
        const dx = (this.posX - m.x) / dist;
        const dz = (this.posZ - m.z) / dist;
        const step = m.type === 'octabrain' ? 0.035 : m.type === 'cultist' ? 0.025 : 0.028;

        const nextMx = m.x + dx * step;
        const nextMz = m.z + dz * step;
        if (!this.checkWallCollision(nextMx, m.z)) m.x = nextMx;
        if (!this.checkWallCollision(m.x, nextMz)) m.z = nextMz;
        m.mesh.position.set(m.x, m.type === 'octabrain' ? m.mesh.position.y : 0.7, m.z);

        // Monster Attacks only when having direct Line of Sight!
        if (m.attackCooldown <= 0 && hasLOS) {
          if (m.type === 'octabrain' && dist < 12.0) {
            // Octabrain Psychic Blast Attack
            m.attackCooldown = 120 + Math.floor(Math.random() * 40);
            dukeAudio.playOctabrainScreech();
            dukeAudio.playOctabrainBlast();

            const orbGeo = new THREE.SphereGeometry(0.24, 12, 12);
            const orbMat = new THREE.MeshStandardMaterial({
              color: 0xd946ef,
              emissive: 0xc026d3,
              emissiveIntensity: 1.5
            });
            const orbMesh = new THREE.Mesh(orbGeo, orbMat);
            orbMesh.position.set(m.x, 1.2, m.z);
            this.scene.add(orbMesh);

            this.enemyProjectiles.push({
              mesh: orbMesh,
              x: m.x,
              y: 1.2,
              z: m.z,
              vx: dx * 0.14,
              vy: 0,
              vz: dz * 0.14,
              type: 'psychic_blast',
              timer: 120,
              damage: 20,
              radius: 1.5
            });
          } else if (m.type === 'cultist' && dist < 10.0) {
            // Cultist Dynamite Throw Attack
            m.attackCooldown = 140 + Math.floor(Math.random() * 40);
            dukeAudio.playCultistDynamite();

            const dynGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 8);
            const dynMat = new THREE.MeshStandardMaterial({
              color: 0xdc2626,
              emissive: 0xf59e0b,
              emissiveIntensity: 0.8
            });
            const dynMesh = new THREE.Mesh(dynGeo, dynMat);
            dynMesh.position.set(m.x, 1.0, m.z);
            this.scene.add(dynMesh);

            this.enemyProjectiles.push({
              mesh: dynMesh,
              x: m.x,
              y: 1.0,
              z: m.z,
              vx: dx * 0.11,
              vy: 0.07, // Arcing trajectory
              vz: dz * 0.11,
              type: 'dynamite',
              timer: 80,
              damage: 35,
              radius: 3.0
            });
          } else if (m.type === 'trooper' && dist < 9.0) {
            // Trooper Cyan Laser Blast Attack
            m.attackCooldown = 90 + Math.floor(Math.random() * 30);
            dukeAudio.playLaserShot();

            const laserGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 6);
            const laserMat = new THREE.MeshStandardMaterial({
              color: 0x06b6d4,
              emissive: 0x22d3ee,
              emissiveIntensity: 1.8
            });
            const laserMesh = new THREE.Mesh(laserGeo, laserMat);
            laserMesh.position.set(m.x, 1.1, m.z);
            this.scene.add(laserMesh);

            this.enemyProjectiles.push({
              mesh: laserMesh,
              x: m.x,
              y: 1.1,
              z: m.z,
              vx: dx * 0.20,
              vy: 0,
              vz: dz * 0.20,
              type: 'laser',
              timer: 90,
              damage: 12,
              radius: 1.0
            });
          } else if (m.type === 'pigcop' && dist < 5.0) {
            // Pig Cop Shotgun Blast Attack
            m.attackCooldown = 90 + Math.floor(Math.random() * 30);
            dukeAudio.playShotgun();
            if (!this.godMode) {
              this.health = Math.max(0, this.health - 12);
              if (this.health <= 0) this.isDead = true;
            }
          }
        }
      }

      if (m.attackCooldown > 0) m.attackCooldown--;
    }
  }

  private updatePickups() {
    for (const item of this.itemSprites) {
      if (item.collected) continue;
      const dist = Math.hypot(item.x - this.posX, item.z - this.posZ);
      if (dist < 0.9) {
        item.collected = true;
        this.scene.remove(item.mesh);
        dukeAudio.playItemPickup();
        this.itemsFound++;

        if (item.type === 'shotgun') {
          this.ammo.shotgun += 12;
          this.currentWeapon = 'shotgun';
        } else if (item.type === 'chaingun') {
          this.ammo.chaingun += 50;
          this.currentWeapon = 'chaingun';
        } else if (item.type === 'rpg') {
          this.ammo.rpg += 5;
          this.currentWeapon = 'rpg';
        } else if (item.type === 'pipebomb') {
          this.ammo.pipebombs += 5;
          this.currentWeapon = 'pipebomb';
        } else if (item.type === 'atomic_health') {
          this.health = Math.min(200, this.health + 100);
          dukeAudio.playDukeQuote('hail');
        } else if (item.type === 'medkit') {
          this.health = Math.min(100, this.health + 30);
        } else if (item.type === 'armor') {
          this.armor = Math.min(100, this.armor + 50);
        } else if (item.type === 'steroids') {
          this.steroidsTime = 20;
          dukeAudio.playDukeQuote('groovy');
        } else if (item.type === 'red_key') this.keys.red = true;
        else if (item.type === 'blue_key') this.keys.blue = true;
        else if (item.type === 'yellow_key') this.keys.yellow = true;
      }
    }
  }

  private notifyStats() {
    if (!this.onStatsUpdate) return;
    this.onStatsUpdate({
      levelId: this.currentMap.id,
      levelName: this.currentMap.name,
      parTime: this.currentMap.parTime,
      elapsedTime: Math.floor(this.elapsedTime),
      health: this.health,
      armor: this.armor,
      steroidsTime: this.steroidsTime,
      score: this.score,
      kills: this.kills,
      totalMonsters: this.monsters.length,
      itemsFound: this.itemsFound,
      totalItems: this.itemSprites.length,
      secretsFound: this.secretsFound,
      totalSecrets: this.currentMap.secretsCount,
      currentWeapon: this.currentWeapon,
      ammo: { ...this.ammo },
      keys: { ...this.keys },
      godMode: this.godMode,
      infiniteAmmo: this.infiniteAmmo,
      isDead: this.isDead,
      isLevelComplete: this.isLevelComplete,
      nearDoor: null,
      nearInteractable: null,
      pipebombsActive: this.pipebombsInField.length
    });
  }

  // --- Dynamic Level Loading ---
  public loadLevel(levelId: string) {
    // Clear old scene objects
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
    this.roomLights = [];
    this.doors = [];
    this.monsters = [];
    this.interactables = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.itemSprites = [];
    this.pipebombsInField = [];
    this.mirrorMeshes = [];

    // Reset map state
    this.currentMap = DUKE_MAPS[levelId] || HOLLYWOOD_HOLOCAUST_MAP;
    this.elapsedTime = 0;
    this.kills = 0;
    this.itemsFound = 0;
    this.secretsFound = 0;
    this.isLevelComplete = false;
    this.isDead = false;

    // Rebuild
    this.buildMapGeometry();
  }

  // --- Cheats & Quick Controls ---
  public toggleGodMode() {
    this.godMode = !this.godMode;
    dukeAudio.playDukeQuote(this.godMode ? 'hail' : 'damn_good');
  }

  public cheatAllWeapons() {
    this.ammo.pistol = 200;
    this.ammo.shotgun = 50;
    this.ammo.chaingun = 200;
    this.ammo.rpg = 50;
    this.ammo.pipebombs = 20;
    this.keys.red = true;
    this.keys.blue = true;
    this.keys.yellow = true;
    this.health = 100;
    this.armor = 100;
    dukeAudio.playDukeQuote('damn_good');
  }

  public rotate(deltaAngle: number) {
    this.angle += deltaAngle;
  }

  public setWeapon(w: DukeWeapon) {
    this.currentWeapon = w;
  }

  public resize(width: number, height: number) {
    if (width <= 0 || height <= 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public restart() {
    this.health = 100;
    this.armor = 25;
    this.isDead = false;
    this.isLevelComplete = false;
    this.elapsedTime = 0;
    this.kills = 0;
    this.itemsFound = 0;
    this.secretsFound = 0;
    this.ammo = {
      pistol: 48,
      shotgun: 12,
      chaingun: 50,
      rpg: 5,
      pipebombs: 4
    };
    this.keys = { red: false, blue: false, yellow: false };
    this.currentWeapon = 'pistol';
    this.loadLevel(this.currentMap.id);
  }

  private hasLineOfSight(x1: number, z1: number, x2: number, z2: number): boolean {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.2) return true;
    const steps = Math.max(4, Math.ceil(dist * 4));
    const stepX = dx / steps;
    const stepZ = dz / steps;

    for (let i = 1; i < steps; i++) {
      const cx = x1 + stepX * i;
      const cz = z1 + stepZ * i;
      const gx = Math.floor(cx);
      const gz = Math.floor(cz);
      if (gx < 0 || gx >= this.currentMap.gridWidth || gz < 0 || gz >= this.currentMap.gridHeight) return false;
      const cell = this.currentMap.layout[gz][gx];
      if (cell === 1 || cell === 2 || cell === 8 || cell === 13 || cell === 14) return false;
      for (const d of this.doors) {
        if (Math.floor(d.x) === gx && Math.floor(d.z) === gz && d.openProgress < 0.7) {
          return false;
        }
      }
    }
    return true;
  }

  public destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    dukeAudio.stopMusic();
    this.renderer.dispose();
  }
}
