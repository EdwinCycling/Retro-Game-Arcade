import * as THREE from 'three';
import {
  createStargrTexture,
  createDoomBrickTexture,
  createComputeTexture,
  createSupportTexture,
  createNormalDoorTexture,
  createExitDoorTexture,
  createKeyDoorTexture,
  createNukageTexture,
  createCeilingTexture,
  createFloorTexture,
  createMonsterSpriteTexture,
  createPickupSpriteTexture
} from './doomTextures';
import { doomAudio } from './doomAudio';
import { DOOM_MAPS, DoomMapDefinition } from './doomMaps';

export type DoomWeaponType = 'fist' | 'pistol' | 'shotgun' | 'chaingun' | 'rocket' | 'plasma' | 'bfg';

export interface DoomMonsterEntity {
  id: number;
  type: 'zombie' | 'imp' | 'demon';
  x: number;
  z: number;
  hp: number;
  maxHp: number;
  state: 'stand' | 'walk' | 'shoot' | 'pain' | 'dead';
  alert: boolean;
  attackCooldown: number;
  walkTimer: number;
  mesh: THREE.Sprite;
}

export interface DoomItemEntity {
  id: number;
  x: number;
  z: number;
  type: 'medikit' | 'stimpack' | 'armor' | 'shotgun' | 'ammo_clip' | 'ammo_box' | 'blue_key' | 'barrel';
  mesh: THREE.Sprite;
  collected: boolean;
  hp?: number; // for barrels
}

export interface DoomDoorEntity {
  id: number;
  x: number;
  z: number;
  mesh: THREE.Mesh;
  state: 'closed' | 'opening' | 'open' | 'closing';
  openAmount: number; // 0 to 1
  requiresKey?: 'blue' | 'yellow' | 'red';
  isExit?: boolean;
}

export interface DoomProjectile {
  mesh: THREE.Mesh;
  x: number;
  z: number;
  vx: number;
  vz: number;
  type: 'imp_fireball' | 'rocket' | 'plasma';
  damage: number;
  isPlayer: boolean;
}

export interface DoomStats {
  levelId: string;
  levelName: string;
  parTime: number;
  elapsedTime: number;
  health: number;
  armor: number;
  score: number;
  weapon: DoomWeaponType;
  weaponsOwned: Record<DoomWeaponType, boolean>;
  ammo: {
    bullets: number;
    shells: number;
    rockets: number;
    cells: number;
  };
  keys: {
    blue: boolean;
    yellow: boolean;
    red: boolean;
  };
  kills: number;
  totalMonsters: number;
  secrets: number;
  totalSecrets: number;
  items: number;
  totalItems: number;
  godMode: boolean;
  isDead: boolean;
  victory: boolean;
  faceDirection: 'center' | 'left' | 'right';
  isGrinning: boolean;
  nearDoor?: { type: 'normal' | 'exit' | 'blue' | 'yellow' | 'red'; state: string; locked: boolean } | null;
}

export class DoomEngine {
  private container: HTMLElement;
  private onStatsChange: (stats: DoomStats) => void;

  // Three.js Core
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private animFrameId: number | null = null;
  private clock: THREE.Clock;

  // Map state
  public currentMap: DoomMapDefinition;
  public grid: number[][];
  private wallMeshes: THREE.Mesh[] = [];
  private monsters: DoomMonsterEntity[] = [];
  private items: DoomItemEntity[] = [];
  private doors: DoomDoorEntity[] = [];
  private projectiles: DoomProjectile[] = [];

  // Textures
  private texStargr: THREE.CanvasTexture;
  private texBrick: THREE.CanvasTexture;
  private texCompute: THREE.CanvasTexture;
  private texSupport: THREE.CanvasTexture;
  private texNormalDoor: THREE.CanvasTexture;
  private texExitDoor: THREE.CanvasTexture;
  private texBlueDoor: THREE.CanvasTexture;
  private texFloor: THREE.CanvasTexture;
  private texCeil: THREE.CanvasTexture;
  private texNukage: THREE.CanvasTexture;

  // Player controls & state
  public posX: number = 2.5;
  public posZ: number = 2.5;
  public rotAngle: number = 0; // In radians
  public moveForward: boolean = false;
  public moveBackward: boolean = false;
  public strafeLeft: boolean = false;
  public strafeRight: boolean = false;
  public turnLeft: boolean = false;
  public turnRight: boolean = false;
  public isRunning: boolean = false;

  // Weapon fire state
  public isFiring: boolean = false;
  private fireCooldown: number = 0;
  public muzzleFlashActive: boolean = false;
  private muzzleFlashTimer: number = 0;

  // Acid Floor damage accumulator
  private acidTimer: number = 0;

  // Face update timer
  private faceTimer: number = 0;
  private grinTimer: number = 0;

  // Authentic Doom Head & Weapon Bobbing
  private bobTimer: number = 0;
  private bobOffset: number = 0;

  // Engine Stats
  public stats: DoomStats = {
    levelId: 'e1m1',
    levelName: 'E1M1: HANGAR',
    parTime: 30,
    elapsedTime: 0,
    health: 100,
    armor: 0,
    score: 0,
    weapon: 'pistol',
    weaponsOwned: {
      fist: true,
      pistol: true,
      shotgun: false,
      chaingun: false,
      rocket: false,
      plasma: false,
      bfg: false
    },
    ammo: {
      bullets: 50,
      shells: 0,
      rockets: 0,
      cells: 0
    },
    keys: {
      blue: false,
      yellow: false,
      red: false
    },
    kills: 0,
    totalMonsters: 0,
    secrets: 0,
    totalSecrets: 0,
    items: 0,
    totalItems: 0,
    godMode: false,
    isDead: false,
    victory: false,
    faceDirection: 'center',
    isGrinning: false,
    nearDoor: null
  };

  // Dynamic Lighting & CRT Animation Timers
  private lightTimer: number = 0;
  private crtFrameTimer: number = 0;
  private crtFrame: number = 0;
  private ambientLight: THREE.AmbientLight | null = null;

  constructor(container: HTMLElement, onStatsChange: (stats: DoomStats) => void) {
    this.container = container;
    this.onStatsChange = onStatsChange;
    this.clock = new THREE.Clock();

    // 1. Setup Three.js Scene
    this.scene = new THREE.Scene();
    // Atmospheric dark fog (authentic Doom depth shading - diminishing lighting)
    this.scene.fog = new THREE.FogExp2(0x000000, 0.08);

    // 2. Camera: Field of view 75 deg (authentic Doom wide FOV)
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100);
    this.camera.position.set(2.5, 0.5, 2.5);

    // 3. Renderer with nearest filtering for retro DOS look
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(this.renderer.domElement);

    // 4. Lighting (Vibrant retro base + directional contrast)
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(this.ambientLight);

    // 5. Initialize Textures
    this.texStargr = createStargrTexture();
    this.texBrick = createDoomBrickTexture();
    this.texCompute = createComputeTexture();
    this.texSupport = createSupportTexture();
    this.texNormalDoor = createNormalDoorTexture();
    this.texExitDoor = createExitDoorTexture();
    this.texBlueDoor = createKeyDoorTexture('blue');
    this.texFloor = createFloorTexture();
    this.texCeil = createCeilingTexture();
    this.texNukage = createNukageTexture(0);

    // 6. Load default E1M1
    this.currentMap = DOOM_MAPS.e1m1;
    this.grid = JSON.parse(JSON.stringify(this.currentMap.layout));
    this.loadLevel('e1m1');

    // 7. Start Game Loop
    this.animate = this.animate.bind(this);
    this.animFrameId = requestAnimationFrame(this.animate);
  }

  // Load a specified level
  public loadLevel(levelId: string) {
    const mapDef = DOOM_MAPS[levelId] || DOOM_MAPS.e1m1;
    this.currentMap = mapDef;
    this.grid = JSON.parse(JSON.stringify(mapDef.layout));

    // Clear old meshes
    this.wallMeshes.forEach((m) => this.scene.remove(m));
    this.wallMeshes = [];
    this.monsters.forEach((m) => this.scene.remove(m.mesh));
    this.monsters = [];
    this.items.forEach((item) => this.scene.remove(item.mesh));
    this.items = [];
    this.doors.forEach((d) => this.scene.remove(d.mesh));
    this.doors = [];
    this.projectiles.forEach((p) => this.scene.remove(p.mesh));
    this.projectiles = [];

    // Reset player position
    this.posX = mapDef.playerStart.x;
    this.posZ = mapDef.playerStart.z;
    this.rotAngle = mapDef.playerStart.angle;
    this.camera.position.set(this.posX, 0.5, this.posZ);
    this.camera.rotation.y = this.rotAngle;

    // Reset stats for level
    this.stats.levelId = levelId;
    this.stats.levelName = mapDef.name;
    this.stats.parTime = mapDef.parTime;
    this.stats.elapsedTime = 0;
    this.stats.health = 100;
    this.stats.armor = 0;
    this.stats.kills = 0;
    this.stats.totalMonsters = mapDef.monsters.length;
    this.stats.secrets = 0;
    this.stats.totalSecrets = mapDef.secrets.length;
    this.stats.items = 0;
    this.stats.totalItems = mapDef.items.filter((i) => i.type !== 'barrel').length;
    this.stats.isDead = false;
    this.stats.victory = false;
    this.stats.ammo.bullets = 50;

    // Build Geometry
    this.buildMapGeometry();
    this.spawnMonsters();
    this.spawnItems();

    doomAudio.startMusic();
    this.onStatsChange({ ...this.stats });
  }

  // Construct walls, floors, ceilings, and doors
  private buildMapGeometry() {
    const wallGeo = new THREE.BoxGeometry(1, 1, 1);
    const floorGeo = new THREE.PlaneGeometry(1, 1);

    const matStargr = new THREE.MeshBasicMaterial({ map: this.texStargr });
    const matBrick = new THREE.MeshBasicMaterial({ map: this.texBrick });
    const matCompute = new THREE.MeshBasicMaterial({ map: this.texCompute });
    const matSupport = new THREE.MeshBasicMaterial({ map: this.texSupport });
    const matFloor = new THREE.MeshBasicMaterial({ map: this.texFloor });
    const matNukage = new THREE.MeshBasicMaterial({ map: this.texNukage });
    const matCeil = new THREE.MeshBasicMaterial({ map: this.texCeil });

    let doorIdCounter = 1;

    for (let r = 0; r < this.currentMap.gridHeight; r++) {
      for (let c = 0; c < this.currentMap.gridWidth; c++) {
        const cell = this.grid[r][c];

        // Floor tile (for every cell except solid walls)
        const isWall = [1, 2, 4].includes(cell);
        const isNukage = cell === 8;

        if (!isWall) {
          // Floor
          const floor = new THREE.Mesh(floorGeo, isNukage ? matNukage : matFloor);
          floor.rotation.x = -Math.PI / 2;
          floor.position.set(c + 0.5, 0, r + 0.5);
          this.scene.add(floor);
          this.wallMeshes.push(floor);

          // Ceiling
          const ceil = new THREE.Mesh(floorGeo, matCeil);
          ceil.rotation.x = Math.PI / 2;
          ceil.position.set(c + 0.5, 1.0, r + 0.5);
          this.scene.add(ceil);
          this.wallMeshes.push(ceil);
        }

        // Walls & Doors
        if (cell === 1) {
          const wall = new THREE.Mesh(wallGeo, matStargr);
          wall.position.set(c + 0.5, 0.5, r + 0.5);
          this.scene.add(wall);
          this.wallMeshes.push(wall);
        } else if (cell === 2) {
          const wall = new THREE.Mesh(wallGeo, matBrick);
          wall.position.set(c + 0.5, 0.5, r + 0.5);
          this.scene.add(wall);
          this.wallMeshes.push(wall);
        } else if (cell === 3) {
          // Standard Hydraulic Sliding Blast Door (Opens on Space/E/F, Click or Bump)
          const doorMat = new THREE.MeshBasicMaterial({ map: this.texNormalDoor });
          const doorMesh = new THREE.Mesh(wallGeo, doorMat);
          doorMesh.position.set(c + 0.5, 0.5, r + 0.5);
          this.scene.add(doorMesh);
          this.doors.push({
            id: doorIdCounter++,
            x: c,
            z: r,
            mesh: doorMesh,
            state: 'closed',
            openAmount: 0
          });
        } else if (cell === 4) {
          const wall = new THREE.Mesh(wallGeo, matCompute);
          (wall as any).isComputeWall = true;
          wall.position.set(c + 0.5, 0.5, r + 0.5);
          this.scene.add(wall);
          this.wallMeshes.push(wall);
        } else if (cell === 5) {
          // Exit Door
          const doorMat = new THREE.MeshBasicMaterial({ map: this.texExitDoor });
          const doorMesh = new THREE.Mesh(wallGeo, doorMat);
          doorMesh.position.set(c + 0.5, 0.5, r + 0.5);
          this.scene.add(doorMesh);
          this.doors.push({
            id: doorIdCounter++,
            x: c,
            z: r,
            mesh: doorMesh,
            state: 'closed',
            openAmount: 0,
            isExit: true
          });
        } else if (cell === 6) {
          // Blue Keycard Door
          const doorMat = new THREE.MeshBasicMaterial({ map: this.texBlueDoor });
          const doorMesh = new THREE.Mesh(wallGeo, doorMat);
          doorMesh.position.set(c + 0.5, 0.5, r + 0.5);
          this.scene.add(doorMesh);
          this.doors.push({
            id: doorIdCounter++,
            x: c,
            z: r,
            mesh: doorMesh,
            state: 'closed',
            openAmount: 0,
            requiresKey: 'blue'
          });
        }
      }
    }
  }

  // Populate monsters from level def
  private spawnMonsters() {
    let idCounter = 1;
    this.currentMap.monsters.forEach((m) => {
      const tex = createMonsterSpriteTexture(m.type, 'stand', 0);
      const spriteMat = new THREE.SpriteMaterial({ map: tex });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(0.85, 0.85, 1);
      sprite.position.set(m.x, 0.42, m.z);
      this.scene.add(sprite);

      const maxHp = m.type === 'zombie' ? 20 : m.type === 'imp' ? 50 : 120;
      this.monsters.push({
        id: idCounter++,
        type: m.type,
        x: m.x,
        z: m.z,
        hp: maxHp,
        maxHp: maxHp,
        state: 'stand',
        alert: false,
        attackCooldown: 1.0 + Math.random() * 2.0,
        walkTimer: 0,
        mesh: sprite
      });
    });
  }

  // Populate items and barrels
  private spawnItems() {
    let idCounter = 1;
    this.currentMap.items.forEach((item) => {
      const tex = createPickupSpriteTexture(item.type);
      const spriteMat = new THREE.SpriteMaterial({ map: tex });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(0.6, 0.6, 1);
      sprite.position.set(item.x, 0.3, item.z);
      this.scene.add(sprite);

      this.items.push({
        id: idCounter++,
        x: item.x,
        z: item.z,
        type: item.type,
        mesh: sprite,
        collected: false,
        hp: item.type === 'barrel' ? 20 : undefined
      });
    });
  }

  // Fire currently active weapon
  public fireWeapon() {
    if (this.stats.isDead || this.stats.victory || this.fireCooldown > 0) return;

    const w = this.stats.weapon;

    // Check ammo
    if (w === 'pistol' || w === 'chaingun') {
      if (this.stats.ammo.bullets <= 0) {
        doomAudio.playPunch();
        return;
      }
      this.stats.ammo.bullets--;
    } else if (w === 'shotgun') {
      if (this.stats.ammo.shells <= 0) {
        doomAudio.playPunch();
        return;
      }
      this.stats.ammo.shells--;
    } else if (w === 'rocket') {
      if (this.stats.ammo.rockets <= 0) return;
      this.stats.ammo.rockets--;
    } else if (w === 'plasma' || w === 'bfg') {
      const cost = w === 'bfg' ? 40 : 1;
      if (this.stats.ammo.cells < cost) return;
      this.stats.ammo.cells -= cost;
    }

    // Trigger visual muzzle flash & cooldown
    this.muzzleFlashActive = true;
    this.muzzleFlashTimer = 0.08;

    if (w === 'fist') {
      this.fireCooldown = 0.35;
      doomAudio.playPunch();
      this.performMeleeAttack();
    } else if (w === 'pistol') {
      this.fireCooldown = 0.32;
      doomAudio.playPistol();
      this.performHitscanAttack(1, 15);
      this.alertNearbyMonsters();
    } else if (w === 'shotgun') {
      this.fireCooldown = 0.85; // Pump action delay
      doomAudio.playShotgun();
      // 7 scatter pellets
      for (let i = 0; i < 7; i++) {
        const spreadAngle = (Math.random() - 0.5) * 0.14;
        this.performHitscanAttack(1, 12, spreadAngle);
      }
      this.alertNearbyMonsters();
    } else if (w === 'chaingun') {
      this.fireCooldown = 0.12; // High rapid rate
      doomAudio.playChaingun();
      const spreadAngle = (Math.random() - 0.5) * 0.08;
      this.performHitscanAttack(1, 14, spreadAngle);
      this.alertNearbyMonsters();
    } else if (w === 'rocket') {
      this.fireCooldown = 0.8;
      doomAudio.playRocketFire();
      this.spawnRocketProjectile();
      this.alertNearbyMonsters();
    } else if (w === 'plasma') {
      this.fireCooldown = 0.15;
      doomAudio.playPlasma();
      this.spawnPlasmaProjectile();
      this.alertNearbyMonsters();
    } else if (w === 'bfg') {
      this.fireCooldown = 1.4;
      doomAudio.playBFG();
      setTimeout(() => {
        this.performBFGDetonation();
      }, 500);
      this.alertNearbyMonsters();
    }

    this.onStatsChange({ ...this.stats });
  }

  // Raycast Hitscan attack (Pistol, Shotgun, Chaingun)
  private performHitscanAttack(range: number, damage: number, spreadAngle: number = 0) {
    const angle = this.rotAngle + spreadAngle;
    const dirX = -Math.sin(angle);
    const dirZ = -Math.cos(angle);

    // Check hit against monsters
    let closestMonster: DoomMonsterEntity | null = null;
    let closestDist = 20;

    for (const m of this.monsters) {
      if (m.state === 'dead') continue;
      const dx = m.x - this.posX;
      const dz = m.z - this.posZ;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Dot product to check if in front
      const dot = (dx * dirX + dz * dirZ) / (dist || 1);
      if (dot > 0.96 && dist < closestDist) {
        // Line of sight check (no walls blocking)
        if (!this.checkWallCollisionBetween(this.posX, this.posZ, m.x, m.z)) {
          closestDist = dist;
          closestMonster = m;
        }
      }
    }

    if (closestMonster) {
      this.damageMonster(closestMonster, damage);
    }

    // Check hit against barrels
    for (const item of this.items) {
      if (item.type === 'barrel' && !item.collected && item.hp !== undefined) {
        const dx = item.x - this.posX;
        const dz = item.z - this.posZ;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const dot = (dx * dirX + dz * dirZ) / (dist || 1);
        if (dot > 0.96 && dist < 12) {
          if (!this.checkWallCollisionBetween(this.posX, this.posZ, item.x, item.z)) {
            item.hp -= damage;
            if (item.hp <= 0) {
              this.explodeBarrel(item);
            }
          }
        }
      }
    }
  }

  // Melee attack for Fist
  private performMeleeAttack() {
    const dirX = -Math.sin(this.rotAngle);
    const dirZ = -Math.cos(this.rotAngle);

    for (const m of this.monsters) {
      if (m.state === 'dead') continue;
      const dx = m.x - this.posX;
      const dz = m.z - this.posZ;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 1.4) {
        const dot = (dx * dirX + dz * dirZ) / dist;
        if (dot > 0.6) {
          this.damageMonster(m, 25);
          break;
        }
      }
    }
  }

  // Rocket projectile
  private spawnRocketProjectile() {
    const geo = new THREE.SphereGeometry(0.12, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(this.posX, 0.5, this.posZ);
    this.scene.add(mesh);

    const speed = 12;
    this.projectiles.push({
      mesh,
      x: this.posX,
      z: this.posZ,
      vx: -Math.sin(this.rotAngle) * speed,
      vz: -Math.cos(this.rotAngle) * speed,
      type: 'rocket',
      damage: 100,
      isPlayer: true
    });
  }

  // Plasma projectile
  private spawnPlasmaProjectile() {
    const geo = new THREE.SphereGeometry(0.1, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(this.posX, 0.5, this.posZ);
    this.scene.add(mesh);

    const speed = 16;
    this.projectiles.push({
      mesh,
      x: this.posX,
      z: this.posZ,
      vx: -Math.sin(this.rotAngle) * speed,
      vz: -Math.cos(this.rotAngle) * speed,
      type: 'plasma',
      damage: 35,
      isPlayer: true
    });
  }

  // BFG 9000 Detonation
  private performBFGDetonation() {
    doomAudio.playExplosion();
    // Massive room-clearing blast cone
    for (const m of this.monsters) {
      if (m.state === 'dead') continue;
      const dx = m.x - this.posX;
      const dz = m.z - this.posZ;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 18) {
        this.damageMonster(m, 250);
      }
    }
  }

  // Exploding hazard barrel
  private explodeBarrel(item: DoomItemEntity) {
    item.collected = true;
    this.scene.remove(item.mesh);
    doomAudio.playExplosion();

    // Damage nearby monsters & player
    for (const m of this.monsters) {
      if (m.state === 'dead') continue;
      const dx = m.x - item.x;
      const dz = m.z - item.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 3.0) {
        this.damageMonster(m, 70);
      }
    }

    const pDist = Math.sqrt((this.posX - item.x) ** 2 + (this.posZ - item.z) ** 2);
    if (pDist < 3.0) {
      this.damagePlayer(Math.round(40 / Math.max(1, pDist)));
    }
  }

  // Alert all monsters in line of sight when player fires
  private alertNearbyMonsters() {
    for (const m of this.monsters) {
      if (!m.alert && m.state !== 'dead') {
        const dx = m.x - this.posX;
        const dz = m.z - this.posZ;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 14 && !this.checkWallCollisionBetween(this.posX, this.posZ, m.x, m.z)) {
          m.alert = true;
          if (m.type === 'zombie') doomAudio.playZombiemanAlert();
          else if (m.type === 'imp') doomAudio.playImpAlert();
          else if (m.type === 'demon') doomAudio.playDemonAttack();
        }
      }
    }
  }

  // Damage monster
  public damageMonster(m: DoomMonsterEntity, damage: number) {
    m.hp -= damage;
    m.alert = true;

    if (m.hp <= 0) {
      m.state = 'dead';
      m.hp = 0;
      this.stats.kills++;
      this.stats.score += m.type === 'zombie' ? 100 : m.type === 'imp' ? 200 : 400;
      doomAudio.playMonsterDeath();

      // Update texture to dead frame
      const deadTex = createMonsterSpriteTexture(m.type, 'dead', 0);
      m.mesh.material.map = deadTex;
      m.mesh.material.needsUpdate = true;
      m.mesh.scale.set(0.9, 0.45, 1);
      m.mesh.position.y = 0.22;

      // Drop ammo or shotgun if zombieman
      if (m.type === 'zombie' && Math.random() < 0.4) {
        this.spawnDroppedItem(m.x, m.z, 'ammo_clip');
      }
    } else {
      m.state = 'pain';
      const painTex = createMonsterSpriteTexture(m.type, 'pain', 0);
      m.mesh.material.map = painTex;
      m.mesh.material.needsUpdate = true;
      setTimeout(() => {
        if (m.state === 'pain') {
          m.state = 'walk';
          const walkTex = createMonsterSpriteTexture(m.type, 'walk', 0);
          m.mesh.material.map = walkTex;
          m.mesh.material.needsUpdate = true;
        }
      }, 150);
    }
    this.onStatsChange({ ...this.stats });
  }

  // Spawn item on floor (e.g., dropped ammo from killed zombieman)
  private spawnDroppedItem(x: number, z: number, type: 'ammo_clip') {
    const tex = createPickupSpriteTexture(type);
    const spriteMat = new THREE.SpriteMaterial({ map: tex });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(0.5, 0.5, 1);
    sprite.position.set(x, 0.25, z);
    this.scene.add(sprite);

    this.items.push({
      id: Date.now() + Math.random(),
      x,
      z,
      type,
      mesh: sprite,
      collected: false
    });
  }

  // Damage player
  public damagePlayer(amount: number) {
    if (this.stats.godMode || this.stats.isDead || this.stats.victory) return;

    // Armor absorbs 1/3 to 1/2 of damage
    if (this.stats.armor > 0) {
      const armorAbsorb = Math.min(this.stats.armor, Math.ceil(amount * 0.4));
      this.stats.armor -= armorAbsorb;
      amount -= armorAbsorb;
    }

    this.stats.health -= amount;
    doomAudio.playPlayerPain();

    if (this.stats.health <= 0) {
      this.stats.health = 0;
      this.stats.isDead = true;
      doomAudio.playPlayerDeath();
    }

    this.onStatsChange({ ...this.stats });
  }

  // Activate / Open Doors / Flip Switches (Space, E, F, Enter, Click)
  public interactWithWorld() {
    const checkDist = 1.6;
    const targetX = Math.floor(this.posX - Math.sin(this.rotAngle) * checkDist);
    const targetZ = Math.floor(this.posZ - Math.cos(this.rotAngle) * checkDist);

    // 1. Direct ray-target door check
    for (const d of this.doors) {
      if (d.x === targetX && d.z === targetZ) {
        this.triggerDoor(d);
        return;
      }
    }

    // 2. Proximity door check (within 1.75 units)
    for (const d of this.doors) {
      const dist = Math.hypot(this.posX - (d.x + 0.5), this.posZ - (d.z + 0.5));
      if (dist < 1.75) {
        this.triggerDoor(d);
        return;
      }
    }
  }

  private triggerDoor(d: DoomDoorEntity) {
    if (d.requiresKey && !this.stats.keys[d.requiresKey]) {
      // Play locked click
      doomAudio.playDoor();
      return;
    }

    if (d.isExit) {
      // Level Exit!
      this.stats.victory = true;
      doomAudio.playSecret();
      this.onStatsChange({ ...this.stats });
      return;
    }

    if (d.state === 'closed') {
      d.state = 'opening';
      doomAudio.playDoor();
    }
  }

  // Change active weapon
  public setWeapon(w: DoomWeaponType) {
    if (!this.stats.weaponsOwned[w]) return;
    this.stats.weapon = w;
    this.onStatsChange({ ...this.stats });
  }

  // Toggle Cheat: IDDQD God Mode
  public toggleGodMode() {
    this.stats.godMode = !this.stats.godMode;
    if (this.stats.godMode) {
      this.stats.health = 100;
      doomAudio.playSecret();
    }
    this.onStatsChange({ ...this.stats });
  }

  // Cheat: IDKFA (Very Happy Ammo, Guns & Keys)
  public cheatAllWeaponsAndKeys() {
    this.stats.weaponsOwned = {
      fist: true,
      pistol: true,
      shotgun: true,
      chaingun: true,
      rocket: true,
      plasma: true,
      bfg: true
    };
    this.stats.ammo = {
      bullets: 200,
      shells: 50,
      rockets: 50,
      cells: 300
    };
    this.stats.keys = {
      blue: true,
      yellow: true,
      red: true
    };
    this.stats.armor = 100;
    this.stats.health = 100;
    doomAudio.playSecret();
    this.onStatsChange({ ...this.stats });
  }

  // Check collision line between two points
  private checkWallCollisionBetween(x1: number, z1: number, x2: number, z2: number): boolean {
    const steps = 15;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const gx = Math.floor(x1 + (x2 - x1) * t);
      const gz = Math.floor(z1 + (z2 - z1) * t);
      if (this.isWallSolid(gx, gz)) {
        return true;
      }
    }
    return false;
  }

  private isWallSolid(x: number, z: number): boolean {
    if (x < 0 || x >= this.currentMap.gridWidth || z < 0 || z >= this.currentMap.gridHeight) return true;
    const cell = this.grid[z][x];
    if ([1, 2, 4].includes(cell)) return true;
    // Check closed doors
    const door = this.doors.find((d) => d.x === x && d.z === z);
    if (door && door.openAmount < 0.75) return true;
    return false;
  }

  // Main animation frame loop
  private animate() {
    this.animFrameId = requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), 0.1);

    if (!this.stats.isDead && !this.stats.victory) {
      this.stats.elapsedTime += delta;
      this.updatePlayerMovement(delta);
      this.updateDoors(delta);
      this.updateProjectiles(delta);
      this.updateMonsters(delta);
      this.checkPickups();
      this.checkAcidDamage(delta);

      // Detect if player is close to a door for on-screen prompt
      let activeNearDoor: DoomStats['nearDoor'] = null;
      for (const d of this.doors) {
        const dist = Math.hypot(this.posX - (d.x + 0.5), this.posZ - (d.z + 0.5));
        if (dist < 2.0) {
          const isLocked = d.requiresKey ? !this.stats.keys[d.requiresKey] : false;
          activeNearDoor = {
            type: d.isExit ? 'exit' : d.requiresKey || 'normal',
            state: d.state,
            locked: isLocked
          };
          break;
        }
      }
      if (
        (activeNearDoor === null && this.stats.nearDoor !== null) ||
        (activeNearDoor !== null &&
          (!this.stats.nearDoor ||
            this.stats.nearDoor.type !== activeNearDoor.type ||
            this.stats.nearDoor.state !== activeNearDoor.state ||
            this.stats.nearDoor.locked !== activeNearDoor.locked))
      ) {
        this.stats.nearDoor = activeNearDoor;
        this.onStatsChange({ ...this.stats });
      }

      // Weapon firing & cooldowns
      if (this.fireCooldown > 0) {
        this.fireCooldown -= delta;
      }
      if (this.muzzleFlashActive) {
        this.muzzleFlashTimer -= delta;
        if (this.muzzleFlashTimer <= 0) {
          this.muzzleFlashActive = false;
        }
      }

      // Live facial direction simulation
      this.faceTimer += delta;
      if (this.faceTimer > 2.5) {
        this.faceTimer = 0;
        const r = Math.random();
        this.stats.faceDirection = r < 0.25 ? 'left' : r < 0.5 ? 'right' : 'center';
        this.onStatsChange({ ...this.stats });
      }

      if (this.stats.isGrinning) {
        this.grinTimer += delta;
        if (this.grinTimer > 1.2) {
          this.stats.isGrinning = false;
          this.onStatsChange({ ...this.stats });
        }
      }

      // Dynamic pulsating / flickering fluorescent lighting in the Hangar
      this.lightTimer += delta;
      if (this.ambientLight) {
        // Subtle base pulsation with occasional micro-flicker
        const basePulse = Math.sin(this.lightTimer * 3.5) * 0.08;
        const microFlicker = Math.random() < 0.04 ? (Math.random() - 0.5) * 0.25 : 0;
        this.ambientLight.intensity = THREE.MathUtils.clamp(0.85 + basePulse + microFlicker, 0.65, 1.15);
      }

      // Computer terminal CRT screen update (oscilloscope & scanline animations)
      this.crtFrameTimer += delta;
      if (this.crtFrameTimer > 0.12) {
        this.crtFrameTimer = 0;
        this.crtFrame = (this.crtFrame + 1) % 1000;
        this.texCompute.dispose();
        this.texCompute = createComputeTexture(this.crtFrame);
        for (const wall of this.wallMeshes) {
          const mat = wall.material as THREE.MeshBasicMaterial;
          if (mat && mat.map && mat.map.image) {
            // Check if this is the computer texture
            if (mat.map === this.texCompute || (wall as any).isComputeWall) {
              mat.map = this.texCompute;
              mat.needsUpdate = true;
            }
          }
        }
      }
    }

    // Camera sync with authentic Doom head bobbing
    this.camera.position.set(this.posX, 0.5 + this.bobOffset, this.posZ);
    this.camera.rotation.y = this.rotAngle;

    // Render 3D Scene
    this.renderer.render(this.scene, this.camera);
  }

  // Smooth player movement & collision
  private updatePlayerMovement(delta: number) {
    const moveSpeed = (this.isRunning ? 5.5 : 3.4) * delta;
    const rotSpeed = 2.4 * delta;

    // Turning
    if (this.turnLeft) this.rotAngle += rotSpeed;
    if (this.turnRight) this.rotAngle -= rotSpeed;

    // Direction vector
    const forwardX = -Math.sin(this.rotAngle);
    const forwardZ = -Math.cos(this.rotAngle);
    const strafeX = Math.cos(this.rotAngle);
    const strafeZ = -Math.sin(this.rotAngle);

    let dx = 0;
    let dz = 0;

    if (this.moveForward) {
      dx += forwardX * moveSpeed;
      dz += forwardZ * moveSpeed;
    }
    if (this.moveBackward) {
      dx -= forwardX * moveSpeed;
      dz -= forwardZ * moveSpeed;
    }
    if (this.strafeLeft) {
      dx -= strafeX * moveSpeed;
      dz -= strafeZ * moveSpeed;
    }
    if (this.strafeRight) {
      dx += strafeX * moveSpeed;
      dz += strafeZ * moveSpeed;
    }

    // Authentic Doom head bobbing calculation
    const isMoving = this.moveForward || this.moveBackward || this.strafeLeft || this.strafeRight;
    if (isMoving && !this.stats.isDead) {
      this.bobTimer += delta * (this.isRunning ? 14 : 9);
      this.bobOffset = Math.sin(this.bobTimer) * 0.04;
    } else {
      this.bobOffset *= 0.85; // smooth decay to center
    }

    // Collision with walls & doors (with 0.25 player radius cushion)
    const cushion = 0.25;
    const newX = this.posX + dx;
    const checkX = dx > 0 ? newX + cushion : newX - cushion;
    if (!this.isWallSolid(Math.floor(checkX), Math.floor(this.posZ))) {
      this.posX = newX;
    }

    const newZ = this.posZ + dz;
    const checkZ = dz > 0 ? newZ + cushion : newZ - cushion;
    if (!this.isWallSolid(Math.floor(this.posX), Math.floor(checkZ))) {
      this.posZ = newZ;
    }

    // Bump-to-open: walking up to a closed door automatically opens it (classic Doom feel)
    for (const d of this.doors) {
      const dist = Math.hypot(this.posX - (d.x + 0.5), this.posZ - (d.z + 0.5));
      if (dist < 1.35 && d.state === 'closed' && !d.isExit) {
        if (!d.requiresKey || this.stats.keys[d.requiresKey]) {
          d.state = 'opening';
          doomAudio.playDoor();
        }
      }
    }
  }

  // Doors sliding up & down
  private updateDoors(delta: number) {
    for (const d of this.doors) {
      if (d.state === 'opening') {
        d.openAmount += delta * 1.5;
        if (d.openAmount >= 1.0) {
          d.openAmount = 1.0;
          d.state = 'open';
          // Auto close after 4 seconds
          setTimeout(() => {
            if (d.state === 'open') d.state = 'closing';
          }, 4000);
        }
        d.mesh.position.y = 0.5 + d.openAmount * 0.95;
      } else if (d.state === 'closing') {
        d.openAmount -= delta * 1.5;
        if (d.openAmount <= 0) {
          d.openAmount = 0;
          d.state = 'closed';
        }
        d.mesh.position.y = 0.5 + d.openAmount * 0.95;
      }
    }
  }

  // Projectiles flying across the level (Imp Fireballs, Rockets, Plasma)
  private updateProjectiles(delta: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * delta;
      p.z += p.vz * delta;
      p.mesh.position.set(p.x, 0.5, p.z);

      // Hit solid wall
      if (this.isWallSolid(Math.floor(p.x), Math.floor(p.z))) {
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
        if (p.type === 'rocket') doomAudio.playExplosion();
        continue;
      }

      // Check collision with monsters (player projectiles)
      if (p.isPlayer) {
        for (const m of this.monsters) {
          if (m.state === 'dead') continue;
          const dist = Math.sqrt((m.x - p.x) ** 2 + (m.z - p.z) ** 2);
          if (dist < 0.6) {
            this.damageMonster(m, p.damage);
            this.scene.remove(p.mesh);
            this.projectiles.splice(i, 1);
            if (p.type === 'rocket') doomAudio.playExplosion();
            break;
          }
        }
      } else {
        // Monster projectile hitting player
        const dist = Math.sqrt((this.posX - p.x) ** 2 + (this.posZ - p.z) ** 2);
        if (dist < 0.55) {
          this.damagePlayer(p.damage);
          this.scene.remove(p.mesh);
          this.projectiles.splice(i, 1);
        }
      }
    }
  }

  // Monster AI & Attacks
  private updateMonsters(delta: number) {
    for (const m of this.monsters) {
      if (m.state === 'dead') continue;

      const dx = this.posX - m.x;
      const dz = this.posZ - m.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Sight check: if close & line of sight clear, wake up!
      if (!m.alert && dist < 8.0) {
        if (!this.checkWallCollisionBetween(m.x, m.z, this.posX, this.posZ)) {
          m.alert = true;
          if (m.type === 'zombie') doomAudio.playZombiemanAlert();
          else if (m.type === 'imp') doomAudio.playImpAlert();
          else if (m.type === 'demon') doomAudio.playDemonAttack();
        }
      }

      if (m.alert) {
        m.attackCooldown -= delta;

        // Face player sprite
        m.mesh.position.set(m.x, 0.42, m.z);

        // Move towards player if not too close
        const minRange = m.type === 'demon' ? 0.9 : 3.0;
        if (dist > minRange) {
          const speed = (m.type === 'demon' ? 2.5 : 1.4) * delta;
          const stepX = (dx / dist) * speed;
          const stepZ = (dz / dist) * speed;

          if (!this.isWallSolid(Math.floor(m.x + stepX), Math.floor(m.z))) {
            m.x += stepX;
          }
          if (!this.isWallSolid(Math.floor(m.x), Math.floor(m.z + stepZ))) {
            m.z += stepZ;
          }
          m.state = 'walk';
        }

        // Attack when cooldown ready and in sight
        if (m.attackCooldown <= 0 && !this.checkWallCollisionBetween(m.x, m.z, this.posX, this.posZ)) {
          if (m.type === 'zombie' && dist < 12) {
            // Zombieman rifle burst
            m.attackCooldown = 1.8 + Math.random();
            doomAudio.playPistol();
            this.damagePlayer(10);
          } else if (m.type === 'imp' && dist < 12) {
            // Imp launches blazing fireball projectile
            m.attackCooldown = 2.2 + Math.random();
            doomAudio.playImpAttack();
            this.spawnImpFireball(m.x, m.z);
          } else if (m.type === 'demon' && dist < 1.2) {
            // Pinky demon bite attack
            m.attackCooldown = 1.0;
            doomAudio.playDemonAttack();
            this.damagePlayer(20);
          }
        }
      }
    }
  }

  // Spawn Imp Fireball projectile
  private spawnImpFireball(startX: number, startZ: number) {
    const geo = new THREE.SphereGeometry(0.12, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(startX, 0.45, startZ);
    this.scene.add(mesh);

    const dx = this.posX - startX;
    const dz = this.posZ - startZ;
    const dist = Math.sqrt(dx * dx + dz * dz) || 1;
    const speed = 7.0;

    this.projectiles.push({
      mesh,
      x: startX,
      z: startZ,
      vx: (dx / dist) * speed,
      vz: (dz / dist) * speed,
      type: 'imp_fireball',
      damage: 18,
      isPlayer: false
    });
  }

  // Check item pickups (Medikit, Armor, Shotgun, Ammo)
  private checkPickups() {
    for (const item of this.items) {
      if (item.collected || item.type === 'barrel') continue;

      const dist = Math.sqrt((this.posX - item.x) ** 2 + (this.posZ - item.z) ** 2);
      if (dist < 0.75) {
        let pickedUp = false;

        if (item.type === 'medikit' && this.stats.health < 100) {
          this.stats.health = Math.min(100, this.stats.health + 25);
          pickedUp = true;
          doomAudio.playItemPickup();
        } else if (item.type === 'stimpack' && this.stats.health < 100) {
          this.stats.health = Math.min(100, this.stats.health + 10);
          pickedUp = true;
          doomAudio.playItemPickup();
        } else if (item.type === 'armor' && this.stats.armor < 100) {
          this.stats.armor = 100;
          pickedUp = true;
          doomAudio.playItemPickup();
          // Secret check
          this.checkSecretFound(item.x, item.z);
        } else if (item.type === 'shotgun') {
          this.stats.weaponsOwned.shotgun = true;
          this.stats.ammo.shells = Math.min(50, this.stats.ammo.shells + 16);
          this.stats.weapon = 'shotgun';
          this.stats.isGrinning = true;
          this.grinTimer = 0;
          pickedUp = true;
          doomAudio.playWeaponPickup();
        } else if (item.type === 'ammo_clip') {
          this.stats.ammo.bullets = Math.min(200, this.stats.ammo.bullets + 10);
          pickedUp = true;
          doomAudio.playItemPickup();
        } else if (item.type === 'ammo_box') {
          this.stats.ammo.bullets = Math.min(200, this.stats.ammo.bullets + 50);
          this.stats.ammo.shells = Math.min(50, this.stats.ammo.shells + 20);
          pickedUp = true;
          doomAudio.playItemPickup();
        } else if (item.type === 'blue_key') {
          this.stats.keys.blue = true;
          pickedUp = true;
          doomAudio.playItemPickup();
        }

        if (pickedUp) {
          item.collected = true;
          this.scene.remove(item.mesh);
          this.stats.items++;
          this.onStatsChange({ ...this.stats });
        }
      }
    }
  }

  // Secret discovery detector
  private checkSecretFound(x: number, z: number) {
    for (const s of this.currentMap.secrets) {
      if (!s.found && Math.hypot(s.x - x, s.z - z) < 1.0) {
        s.found = true;
        this.stats.secrets++;
        doomAudio.playSecret();
        break;
      }
    }
  }

  // Acid nukage floor deals damage
  private checkAcidDamage(delta: number) {
    const curCell = this.grid[Math.floor(this.posZ)]?.[Math.floor(this.posX)];
    if (curCell === 8) {
      // Stepping in glowing green acid sludge!
      this.acidTimer += delta;
      if (this.acidTimer >= 1.0) {
        this.acidTimer = 0;
        this.damagePlayer(5);
      }
    } else {
      this.acidTimer = 0;
    }
  }

  // Resize canvas
  public resize(width: number, height: number) {
    if (!this.renderer || !this.camera) return;
    this.camera.aspect = width / (height || 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // Rotate player view smoothly (mouse look, drag, or touch swipe)
  public rotateBy(deltaAngle: number) {
    this.rotAngle = (this.rotAngle + deltaAngle) % (Math.PI * 2);
    if (this.camera) {
      this.camera.rotation.y = this.rotAngle;
    }
  }

  // Getters for Automap and UI radar
  public getMonsters(): DoomMonsterEntity[] {
    return this.monsters;
  }

  public getItems(): DoomItemEntity[] {
    return this.items;
  }

  // Cleanup & destroy engine instance
  public destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    doomAudio.stopMusic();

    this.wallMeshes.forEach((m) => this.scene.remove(m));
    this.monsters.forEach((m) => this.scene.remove(m.mesh));
    this.items.forEach((item) => this.scene.remove(item.mesh));
    this.doors.forEach((d) => this.scene.remove(d.mesh));
    this.projectiles.forEach((p) => this.scene.remove(p.mesh));

    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
