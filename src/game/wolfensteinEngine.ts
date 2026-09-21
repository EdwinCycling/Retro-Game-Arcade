import * as THREE from 'three';
import {
  createGreyStoneTexture,
  createBlueStoneTexture,
  createWoodWallTexture,
  createEagleWallTexture,
  createWoodDoorTexture,
  createPrisonWallTexture,
  createElevatorTexture,
  createFloorTexture,
  createGoldChaliceTexture,
  createAmmoTexture,
  createMedkitTexture,
  createGuardTexture,
  createSSOfficerTexture,
  createDogTexture,
  createHansGrosseTexture,
  createRedStoneTexture,
} from './wolfensteinTextures';
import { wolfensteinAudio } from './wolfensteinAudio';
import { WOLFENSTEIN_FLOORS, FloorDefinition } from './wolfensteinFloors';

export interface GuardEntity {
  id: number;
  type: 'guard' | 'ss' | 'dog' | 'boss';
  x: number;
  z: number;
  hp: number;
  maxHp: number;
  state: 'stand' | 'walk1' | 'walk2' | 'shoot' | 'pain' | 'die1' | 'dead';
  alert: boolean;
  shootCooldown: number;
  walkTimer: number;
  mesh: THREE.Sprite;
}

export interface ItemEntity {
  id: number;
  x: number;
  z: number;
  type: 'chalice' | 'ammo' | 'medkit' | 'machinegun';
  mesh: THREE.Sprite;
  collected: boolean;
}

export interface DoorEntity {
  id: number;
  x: number;
  z: number;
  mesh: THREE.Mesh;
  state: 'closed' | 'opening' | 'open' | 'closing';
  openAmount: number; // 0 to 1
  timer: number;
}

export interface PushWallEntity {
  id: number;
  x: number;
  z: number;
  mesh: THREE.Mesh;
  targetX: number;
  targetZ: number;
  state: 'idle' | 'moving' | 'done';
}

export interface EngineStats {
  floor: number;
  floorTitle: string;
  score: number;
  lives: number;
  health: number;
  ammo: number;
  weapon: 'knife' | 'pistol' | 'machinegun';
  hasMachinegun: boolean;
  kills: number;
  totalGuards: number;
  secrets: number;
  totalSecrets: number;
  treasures: number;
  totalTreasures: number;
  gameOver: boolean;
  victory: boolean;
  canInteract?: boolean;
  interactPrompt?: string | null;
  bossHp?: number;
  bossMaxHp?: number;
  floorAnnouncement?: string | null;
}

export class WolfensteinEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;

  // Multi-floor management
  public currentFloor: number = 1;
  public floorAnnouncement: string | null = null;
  private floorAnnouncementTimer: number = 0;

  // Map Data (18 x 18 grid)
  public mapSize = 18;
  public visited: boolean[][] = [];
  public map: number[][] = [];

  // Player State
  public posX = 2.5;
  public posZ = 2.5;
  public angle = 0; // facing direction in radians
  public health = 100;
  public ammo = 24;
  public lives = 3;
  public score = 0;
  public kills = 0;
  public secrets = 0;
  public treasures = 0;
  public weapon: 'knife' | 'pistol' | 'machinegun' = 'pistol';
  public hasMachinegun = false;
  public isShooting = false;
  public shootTimer = 0;
  public muzzleFlashLight: THREE.PointLight;
  public hurtTimer = 0;

  // Entities & World Meshes
  private worldMeshes: THREE.Object3D[] = [];
  private guards: GuardEntity[] = [];
  private items: ItemEntity[] = [];
  private doors: DoorEntity[] = [];
  private pushWalls: PushWallEntity[] = [];

  // Textures caches
  private guardTextures: Record<string, THREE.CanvasTexture> = {};
  private ssTextures: Record<string, THREE.CanvasTexture> = {};
  private dogTextures: Record<string, THREE.CanvasTexture> = {};
  private bossTextures: Record<string, THREE.CanvasTexture> = {};

  // Input states
  public moveForward = false;
  public moveBackward = false;
  public strafeLeft = false;
  public strafeRight = false;
  public turnLeft = false;
  public turnRight = false;

  private headBobTimer = 0;
  public gameOver = false;
  public victory = false;
  public canInteract = false;
  public interactPrompt: string | null = null;
  private interactCheckTimer = 0;

  private onStatsChange?: (stats: EngineStats) => void;

  constructor(container: HTMLElement, onStatsChange?: (stats: EngineStats) => void) {
    this.container = container;
    this.onStatsChange = onStatsChange;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x383838); // Classic dark slate ceiling
    this.scene.fog = new THREE.Fog(0x383838, 5, 20); // Retro distance fog

    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(72, aspect, 0.1, 50);

    // 2. Renderer with crispy retro pixelation
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(this.renderer.domElement);

    // 3. Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.4);
    this.scene.add(ambient);

    this.muzzleFlashLight = new THREE.PointLight(0xffaa44, 0, 8);
    this.scene.add(this.muzzleFlashLight);

    // Preload entity texture sprite sheets
    this.initTextureCaches();

    // 4. Load Floor 1
    this.loadFloor(1, true);

    // 5. Event Listeners
    window.addEventListener('resize', this.onResize);

    // Start loop
    this.animate();
    this.notifyStats();
  }

  private initTextureCaches() {
    this.guardTextures = {
      stand: createGuardTexture('stand'),
      walk1: createGuardTexture('walk1'),
      walk2: createGuardTexture('walk2'),
      shoot: createGuardTexture('shoot'),
      pain: createGuardTexture('pain'),
      die1: createGuardTexture('die1'),
      dead: createGuardTexture('dead'),
    };

    this.ssTextures = {
      stand: createSSOfficerTexture('stand'),
      walk1: createSSOfficerTexture('walk1'),
      walk2: createSSOfficerTexture('walk2'),
      shoot: createSSOfficerTexture('shoot'),
      pain: createSSOfficerTexture('pain'),
      die1: createSSOfficerTexture('die1'),
      dead: createSSOfficerTexture('dead'),
    };

    this.dogTextures = {
      stand: createDogTexture('stand'),
      walk1: createDogTexture('run1'),
      walk2: createDogTexture('run2'),
      shoot: createDogTexture('bite'),
      pain: createDogTexture('stand'),
      die1: createDogTexture('stand'),
      dead: createDogTexture('dead'),
    };

    this.bossTextures = {
      stand: createHansGrosseTexture('stand'),
      walk1: createHansGrosseTexture('walk1'),
      walk2: createHansGrosseTexture('walk2'),
      shoot: createHansGrosseTexture('shoot'),
      pain: createHansGrosseTexture('pain'),
      die1: createHansGrosseTexture('die1'),
      dead: createHansGrosseTexture('dead'),
    };
  }

  private getTextureForEntity(type: 'guard' | 'ss' | 'dog' | 'boss', state: string): THREE.CanvasTexture {
    let textures = this.guardTextures;
    if (type === 'ss') textures = this.ssTextures;
    else if (type === 'dog') textures = this.dogTextures;
    else if (type === 'boss') textures = this.bossTextures;

    return textures[state] || textures['stand'];
  }

  // Load / Switch Floors
  public loadFloor(floorNum: number, isInitial: boolean = false) {
    const floorIndex = Math.max(0, Math.min(WOLFENSTEIN_FLOORS.length - 1, floorNum - 1));
    const floorDef = WOLFENSTEIN_FLOORS[floorIndex];
    this.currentFloor = floorDef.floorNumber;

    // Clear previous world meshes
    this.worldMeshes.forEach((mesh) => {
      this.scene.remove(mesh);
      if (mesh instanceof THREE.Mesh) {
        mesh.geometry.dispose();
      }
    });
    this.worldMeshes = [];

    // Clear previous entity meshes
    this.guards.forEach((g) => this.scene.remove(g.mesh));
    this.items.forEach((i) => this.scene.remove(i.mesh));
    this.doors.forEach((d) => this.scene.remove(d.mesh));
    this.pushWalls.forEach((p) => this.scene.remove(p.mesh));

    this.guards = [];
    this.items = [];
    this.doors = [];
    this.pushWalls = [];

    // Deep copy floor map
    this.mapSize = floorDef.mapSize;
    this.map = floorDef.map.map((row) => [...row]);
    this.visited = Array.from({ length: this.mapSize }, () => Array(this.mapSize).fill(false));

    // Player placement
    this.posX = floorDef.startX;
    this.posZ = floorDef.startZ;
    this.angle = floorDef.startAngle;
    this.camera.position.set(this.posX, 0.5, this.posZ);
    this.camera.rotation.y = this.angle;

    // Floor announcement banner
    this.floorAnnouncement = `${floorDef.title}\n${floorDef.subtitle}`;
    this.floorAnnouncementTimer = 3.5;

    // Build 3D Geometry
    this.buildWorld(floorDef);

    // Spawn Floor Entities
    this.spawnFloorEntities(floorDef);

    if (!isInitial) {
      wolfensteinAudio.playVictory();
    }

    this.notifyStats();
  }

  private buildWorld(floorDef: FloorDefinition) {
    const greyMat = new THREE.MeshBasicMaterial({ map: createGreyStoneTexture() });
    const blueMat = new THREE.MeshBasicMaterial({ map: createBlueStoneTexture() });
    const woodMat = new THREE.MeshBasicMaterial({ map: createWoodWallTexture() });
    const eagleMat = new THREE.MeshBasicMaterial({ map: createEagleWallTexture() });
    const prisonMat = new THREE.MeshBasicMaterial({ map: createPrisonWallTexture() });
    const redMat = new THREE.MeshBasicMaterial({ map: createRedStoneTexture() });
    const elevatorMat = new THREE.MeshBasicMaterial({ map: createElevatorTexture() });
    const doorMat = new THREE.MeshBasicMaterial({ map: createWoodDoorTexture() });

    const wallGeo = new THREE.BoxGeometry(1, 1, 1);

    // Floor & Ceiling planes
    const floorMat = new THREE.MeshBasicMaterial({ map: createFloorTexture() });
    const floorGeo = new THREE.PlaneGeometry(this.mapSize, this.mapSize);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(this.mapSize / 2, 0, this.mapSize / 2);
    this.scene.add(floorMesh);
    this.worldMeshes.push(floorMesh);

    const ceilMat = new THREE.MeshBasicMaterial({ color: 0x383838 });
    const ceilMesh = new THREE.Mesh(floorGeo, ceilMat);
    ceilMesh.rotation.x = Math.PI / 2;
    ceilMesh.position.set(this.mapSize / 2, 1, this.mapSize / 2);
    this.scene.add(ceilMesh);
    this.worldMeshes.push(ceilMesh);

    // Place Wall Blocks
    for (let z = 0; z < this.mapSize; z++) {
      for (let x = 0; x < this.mapSize; x++) {
        const cell = this.map[z][x];
        if (cell === 0) continue;

        if (cell === 7) {
          // Sliding Door
          const doorMesh = new THREE.Mesh(wallGeo, doorMat);
          doorMesh.position.set(x + 0.5, 0.5, z + 0.5);
          this.scene.add(doorMesh);
          this.worldMeshes.push(doorMesh);
          this.doors.push({
            id: this.doors.length,
            x,
            z,
            mesh: doorMesh,
            state: 'closed',
            openAmount: 0,
            timer: 0,
          });
          continue;
        }

        if (cell === 8) {
          // Secret Push-Wall
          const pushDef = floorDef.pushWalls.find((p) => p.x === x && p.z === z) || {
            x,
            z,
            targetX: x,
            targetZ: z + 2,
          };
          const pushMesh = new THREE.Mesh(wallGeo, floorDef.floorNumber === 2 ? blueMat : floorDef.floorNumber === 3 ? redMat : greyMat);
          pushMesh.position.set(x + 0.5, 0.5, z + 0.5);
          this.scene.add(pushMesh);
          this.worldMeshes.push(pushMesh);
          this.pushWalls.push({
            id: this.pushWalls.length,
            x,
            z,
            mesh: pushMesh,
            targetX: pushDef.targetX,
            targetZ: pushDef.targetZ,
            state: 'idle',
          });
          continue;
        }

        let mat = greyMat;
        if (cell === 2) mat = blueMat;
        else if (cell === 3) mat = woodMat;
        else if (cell === 4) mat = floorDef.floorNumber === 3 ? redMat : eagleMat;
        else if (cell === 5) mat = prisonMat;
        else if (cell === 6) mat = elevatorMat;

        const wallMesh = new THREE.Mesh(wallGeo, mat);
        wallMesh.position.set(x + 0.5, 0.5, z + 0.5);
        this.scene.add(wallMesh);
        this.worldMeshes.push(wallMesh);
      }
    }
  }

  private spawnFloorEntities(floorDef: FloorDefinition) {
    // 1. Items
    const chaliceMat = new THREE.SpriteMaterial({ map: createGoldChaliceTexture() });
    const ammoMat = new THREE.SpriteMaterial({ map: createAmmoTexture() });
    const medkitMat = new THREE.SpriteMaterial({ map: createMedkitTexture() });

    floorDef.items.forEach((loc, idx) => {
      let mat = chaliceMat;
      if (loc.type === 'ammo') mat = ammoMat;
      else if (loc.type === 'medkit') mat = medkitMat;
      else if (loc.type === 'machinegun') mat = ammoMat;

      const sprite = new THREE.Sprite(mat.clone());
      sprite.scale.set(0.6, 0.6, 0.6);
      sprite.position.set(loc.x, 0.3, loc.z);
      this.scene.add(sprite);

      this.items.push({
        id: idx,
        x: loc.x,
        z: loc.z,
        type: loc.type,
        mesh: sprite,
        collected: false,
      });
    });

    // 2. Enemies
    floorDef.enemies.forEach((loc, idx) => {
      let initialTexture = this.guardTextures.stand;
      let scale = 0.85;
      let hp = 25;
      let posY = 0.42;

      if (loc.type === 'ss') {
        initialTexture = this.ssTextures.stand;
        hp = 55;
      } else if (loc.type === 'dog') {
        initialTexture = this.dogTextures.stand;
        hp = 18;
        scale = 0.7;
        posY = 0.32;
      } else if (loc.type === 'boss') {
        initialTexture = this.bossTextures.stand;
        hp = 450;
        scale = 1.35;
        posY = 0.62;
      }

      const mat = new THREE.SpriteMaterial({ map: initialTexture });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(scale, scale, scale);
      sprite.position.set(loc.x, posY, loc.z);
      this.scene.add(sprite);

      this.guards.push({
        id: idx,
        type: loc.type,
        x: loc.x,
        z: loc.z,
        hp,
        maxHp: hp,
        state: 'stand',
        alert: false,
        shootCooldown: 1.0 + Math.random(),
        walkTimer: 0,
        mesh: sprite,
      });
    });
  }

  // Shoot Action
  public triggerShoot() {
    if (this.gameOver || this.victory) return;

    if (this.weapon !== 'knife' && this.ammo <= 0) {
      wolfensteinAudio.playAmmo();
      return;
    }

    this.isShooting = true;
    this.shootTimer = 0.22;

    if (this.weapon === 'knife') {
      wolfensteinAudio.playKnife();
    } else if (this.weapon === 'pistol') {
      this.ammo--;
      wolfensteinAudio.playPistol();
      this.muzzleFlashLight.intensity = 3.5;
    } else if (this.weapon === 'machinegun') {
      this.ammo--;
      wolfensteinAudio.playMachineGun();
      this.muzzleFlashLight.intensity = 4.0;
    }

    // Alert nearby guards to gunfire
    this.guards.forEach((g) => {
      if (g.state !== 'dead') {
        const dist = Math.hypot(g.x - this.posX, g.z - this.posZ);
        if (dist < 12 && !g.alert) {
          g.alert = true;
          this.playAlertSound(g.type);
        }
      }
    });

    // Raycast hit check in 3D
    this.checkBulletHit();
    this.notifyStats();
  }

  private playAlertSound(type: 'guard' | 'ss' | 'dog' | 'boss') {
    if (type === 'boss') wolfensteinAudio.playBossAlert();
    else if (type === 'ss') wolfensteinAudio.playSSAlert();
    else if (type === 'dog') wolfensteinAudio.playDogBark();
    else wolfensteinAudio.playGuardAlert();
  }

  private checkBulletHit() {
    const dirX = -Math.sin(this.angle);
    const dirZ = -Math.cos(this.angle);

    let maxRange = this.weapon === 'knife' ? 1.6 : 18;
    let closestGuard: GuardEntity | null = null;
    let closestDist = maxRange;

    this.guards.forEach((guard) => {
      if (guard.state === 'dead') return;

      const toGuardX = guard.x - this.posX;
      const toGuardZ = guard.z - this.posZ;
      const dist = Math.hypot(toGuardX, toGuardZ);
      if (dist > closestDist) return;

      const dot = (toGuardX * dirX + toGuardZ * dirZ) / dist;
      if (dot > 0.92) {
        if (this.hasLineOfSight(this.posX, this.posZ, guard.x, guard.z)) {
          closestDist = dist;
          closestGuard = guard;
        }
      }
    });

    if (closestGuard) {
      const damage = this.weapon === 'knife' ? 40 : this.weapon === 'machinegun' ? 22 : 16;
      this.damageGuard(closestGuard, damage);
    }
  }

  private hasLineOfSight(x1: number, z1: number, x2: number, z2: number): boolean {
    const steps = 25;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const testX = Math.floor(x1 + (x2 - x1) * t);
      const testZ = Math.floor(z1 + (z2 - z1) * t);
      if (testX >= 0 && testX < this.mapSize && testZ >= 0 && testZ < this.mapSize) {
        const cell = this.map[testZ][testX];
        if (cell === 1 || cell === 2 || cell === 3 || cell === 4 || cell === 5 || cell === 6) {
          return false;
        }
        if (cell === 7) {
          const door = this.doors.find((d) => d.x === testX && d.z === testZ);
          if (door && door.openAmount < 0.6) return false;
        }
        if (cell === 8) {
          const push = this.pushWalls.find((p) => p.x === testX && p.z === testZ);
          if (push && push.state !== 'done') return false;
        }
      }
    }
    return true;
  }

  private damageGuard(guard: GuardEntity, damage: number) {
    guard.hp -= damage;
    if (!guard.alert) {
      guard.alert = true;
      this.playAlertSound(guard.type);
    }

    if (guard.hp <= 0) {
      guard.state = 'dead';
      guard.mesh.material.map = this.getTextureForEntity(guard.type, 'dead');

      if (guard.type === 'boss') {
        guard.mesh.scale.set(1.4, 0.7, 1.4);
        guard.mesh.position.y = 0.35;
        this.kills++;
        this.score += 5000;
        wolfensteinAudio.playHansDeath();
      } else if (guard.type === 'ss') {
        guard.mesh.scale.set(0.9, 0.4, 0.9);
        guard.mesh.position.y = 0.15;
        this.kills++;
        this.score += 250;
        wolfensteinAudio.playSSDeath();
      } else if (guard.type === 'dog') {
        guard.mesh.scale.set(0.75, 0.3, 0.75);
        guard.mesh.position.y = 0.12;
        this.kills++;
        this.score += 150;
        wolfensteinAudio.playDogWhine();
      } else {
        guard.mesh.scale.set(0.9, 0.4, 0.9);
        guard.mesh.position.y = 0.15;
        this.kills++;
        this.score += 100;
        wolfensteinAudio.playGuardDeath();
      }

      // Drop ammo / weapon
      if (guard.type !== 'dog') {
        const ammoMat = new THREE.SpriteMaterial({ map: createAmmoTexture() });
        const sprite = new THREE.Sprite(ammoMat);
        sprite.scale.set(0.6, 0.6, 0.6);
        sprite.position.set(guard.x, 0.3, guard.z);
        this.scene.add(sprite);
        this.items.push({
          id: this.items.length,
          x: guard.x,
          z: guard.z,
          type: guard.type === 'ss' && !this.hasMachinegun ? 'machinegun' : 'ammo',
          mesh: sprite,
          collected: false,
        });
      }
    } else {
      guard.state = 'pain';
      guard.mesh.material.map = this.getTextureForEntity(guard.type, 'pain');
      setTimeout(() => {
        if (guard.state === 'pain') {
          guard.state = 'stand';
          guard.mesh.material.map = this.getTextureForEntity(guard.type, 'stand');
        }
      }, 150);
    }
    this.notifyStats();
  }

  // Check if player is facing interactable target
  public checkInteractTarget(): { canInteract: boolean; prompt: string | null } {
    if (this.gameOver || this.victory) return { canInteract: false, prompt: null };

    const dirX = -Math.sin(this.angle);
    const dirZ = -Math.cos(this.angle);

    for (let d = 0.25; d <= 1.9; d += 0.15) {
      const tx = Math.floor(this.posX + dirX * d);
      const tz = Math.floor(this.posZ + dirZ * d);
      if (tx < 0 || tx >= this.mapSize || tz < 0 || tz >= this.mapSize) continue;

      const cell = this.map[tz][tx];
      if (cell === 7) {
        const door = this.doors.find((item) => item.x === tx && item.z === tz);
        if (door && (door.state === 'closed' || door.state === 'closing')) {
          return { canInteract: true, prompt: 'DEUR OPENEN' };
        }
      } else if (cell === 8) {
        const push = this.pushWalls.find((p) => p.x === tx && p.z === tz);
        if (push && push.state === 'idle') {
          return { canInteract: true, prompt: 'GEHEIM INDUWEN' };
        }
      } else if (cell === 6) {
        if (this.currentFloor === 3) {
          const boss = this.guards.find((g) => g.type === 'boss');
          const bossDefeated = !boss || boss.state === 'dead';
          return {
            canInteract: true,
            prompt: bossDefeated ? 'KASTEEL ONTSNAPPEN' : 'VERSLA EERST HANS GROSSE!',
          };
        }
        return { canInteract: true, prompt: `LIFT NAAR VERDIEPING ${this.currentFloor + 1}` };
      }
    }

    return { canInteract: false, prompt: null };
  }

  // Interact Action (Open Door, Push Wall or Elevator Switch)
  public triggerInteract(): boolean {
    if (this.gameOver || this.victory) return false;

    const dirX = -Math.sin(this.angle);
    const dirZ = -Math.cos(this.angle);

    for (let d = 0.25; d <= 2.0; d += 0.15) {
      const targetX = Math.floor(this.posX + dirX * d);
      const targetZ = Math.floor(this.posZ + dirZ * d);
      if (targetX < 0 || targetX >= this.mapSize || targetZ < 0 || targetZ >= this.mapSize) continue;

      const cell = this.map[targetZ][targetX];

      // 1. Sliding Door
      if (cell === 7) {
        const door = this.doors.find((item) => item.x === targetX && item.z === targetZ);
        if (door && (door.state === 'closed' || door.state === 'closing')) {
          door.state = 'opening';
          wolfensteinAudio.playDoor(true);
          this.canInteract = false;
          this.interactPrompt = null;
          this.notifyStats();
          return true;
        }
      }

      // 2. Secret Push-Wall
      if (cell === 8) {
        const push = this.pushWalls.find((p) => p.x === targetX && p.z === targetZ);
        if (push && push.state === 'idle') {
          push.state = 'moving';
          this.secrets++;
          this.score += 500;
          wolfensteinAudio.playPushWall();
          this.canInteract = false;
          this.interactPrompt = null;
          this.notifyStats();
          return true;
        }
      }

      // 3. Elevator Switch / Victory
      if (cell === 6) {
        if (this.currentFloor < 3) {
          this.score += 2000;
          this.loadFloor(this.currentFloor + 1);
          return true;
        } else {
          // Final Boss floor
          const boss = this.guards.find((g) => g.type === 'boss');
          if (!boss || boss.state === 'dead') {
            this.triggerVictory();
            return true;
          }
        }
      }
    }

    return false;
  }

  public switchWeapon(w: 'knife' | 'pistol' | 'machinegun') {
    if (w === 'machinegun' && !this.hasMachinegun) return;
    this.weapon = w;
    this.notifyStats();
  }

  private triggerVictory() {
    if (this.victory) return;
    this.victory = true;
    wolfensteinAudio.playVictory();
    this.score += 5000;
    this.notifyStats();
  }

  // Game Loop Update
  private update(dt: number) {
    if (this.gameOver || this.victory) return;

    if (this.floorAnnouncementTimer > 0) {
      this.floorAnnouncementTimer -= dt;
      if (this.floorAnnouncementTimer <= 0) {
        this.floorAnnouncement = null;
        this.notifyStats();
      }
    }

    // 1. Player Turning
    const turnSpeed = 2.4 * dt;
    if (this.turnLeft) this.angle += turnSpeed;
    if (this.turnRight) this.angle -= turnSpeed;

    // 2. Player Movement with Collision
    const moveSpeed = 3.2 * dt;
    const forwardX = -Math.sin(this.angle);
    const forwardZ = -Math.cos(this.angle);
    const rightX = Math.cos(this.angle);
    const rightZ = -Math.sin(this.angle);

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
      dx -= rightX * moveSpeed;
      dz -= rightZ * moveSpeed;
    }
    if (this.strafeRight) {
      dx += rightX * moveSpeed;
      dz += rightZ * moveSpeed;
    }

    if (dx !== 0 || dz !== 0) {
      this.headBobTimer += dt * 14;
    }

    // Collision check against map walls
    const newX = this.posX + dx;
    const newZ = this.posZ + dz;
    const radius = 0.28;

    if (!this.isWall(newX + (dx > 0 ? radius : -radius), this.posZ)) {
      this.posX = newX;
    }
    if (!this.isWall(this.posX, newZ + (dz > 0 ? radius : -radius))) {
      this.posZ = newZ;
    }

    // Camera height + head bob
    const bob = Math.sin(this.headBobTimer) * 0.03;
    this.camera.position.set(this.posX, 0.5 + bob, this.posZ);
    this.camera.rotation.y = this.angle;

    // Muzzle light follow
    this.muzzleFlashLight.position.set(this.posX, 0.5, this.posZ);
    if (this.shootTimer > 0) {
      this.shootTimer -= dt;
      if (this.shootTimer <= 0) {
        this.isShooting = false;
        this.muzzleFlashLight.intensity = 0;
      }
    }

    if (this.hurtTimer > 0) {
      this.hurtTimer -= dt;
    }

    // Mark visited cells for automap radar
    const curPX = Math.floor(this.posX);
    const curPZ = Math.floor(this.posZ);
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const vx = curPX + dx;
        const vz = curPZ + dy;
        if (vx >= 0 && vx < this.mapSize && vz >= 0 && vz < this.mapSize) {
          this.visited[vz][vx] = true;
        }
      }
    }

    // Check interact target for HUD prompt
    this.interactCheckTimer += dt;
    if (this.interactCheckTimer >= 0.08) {
      this.interactCheckTimer = 0;
      const target = this.checkInteractTarget();
      if (target.canInteract !== this.canInteract || target.prompt !== this.interactPrompt) {
        this.canInteract = target.canInteract;
        this.interactPrompt = target.prompt;
        this.notifyStats();
      }
    }

    // 3. Update Doors
    this.doors.forEach((door) => {
      if (door.state === 'opening') {
        door.openAmount += dt * 2.2;
        if (door.openAmount >= 1) {
          door.openAmount = 1;
          door.state = 'open';
          door.timer = 3.5;
        }
      } else if (door.state === 'open') {
        door.timer -= dt;
        if (door.timer <= 0) {
          const distToPlayer = Math.hypot(this.posX - (door.x + 0.5), this.posZ - (door.z + 0.5));
          if (distToPlayer > 0.8) {
            door.state = 'closing';
            wolfensteinAudio.playDoor(false);
          }
        }
      } else if (door.state === 'closing') {
        door.openAmount -= dt * 2.2;
        if (door.openAmount <= 0) {
          door.openAmount = 0;
          door.state = 'closed';
        }
      }
      door.mesh.position.x = door.x + 0.5 + door.openAmount * 0.95;
    });

    // 4. Update Push-Walls
    this.pushWalls.forEach((pw) => {
      if (pw.state === 'moving') {
        const toTarget = pw.targetZ - pw.mesh.position.z;
        if (Math.abs(toTarget) > 0.05) {
          pw.mesh.position.z += Math.sign(toTarget) * dt * 0.8;
        } else {
          pw.mesh.position.z = pw.targetZ;
          pw.state = 'done';
          this.map[pw.z][pw.x] = 0;
        }
      }
    });

    // 5. Update Item Pickups
    this.items.forEach((item) => {
      if (item.collected) return;
      const dist = Math.hypot(item.x - this.posX, item.z - this.posZ);
      if (dist < 0.6) {
        item.collected = true;
        item.mesh.visible = false;

        if (item.type === 'chalice') {
          this.treasures++;
          this.score += 500;
          wolfensteinAudio.playTreasure();
        } else if (item.type === 'ammo') {
          this.ammo = Math.min(99, this.ammo + 8);
          wolfensteinAudio.playAmmo();
        } else if (item.type === 'medkit') {
          if (this.health < 100) {
            this.health = Math.min(100, this.health + 25);
            wolfensteinAudio.playHealth();
          }
        } else if (item.type === 'machinegun') {
          this.hasMachinegun = true;
          this.weapon = 'machinegun';
          this.ammo = Math.min(99, this.ammo + 25);
          this.score += 1000;
          wolfensteinAudio.playTreasure();
        }
        this.notifyStats();
      }
    });

    // 6. Update Guard / Dog / SS / Boss AI
    this.guards.forEach((guard) => {
      if (guard.state === 'dead') return;

      const dist = Math.hypot(guard.x - this.posX, guard.z - this.posZ);

      // Vision check
      if (!guard.alert && dist < (guard.type === 'boss' ? 16 : 12)) {
        if (this.hasLineOfSight(guard.x, guard.z, this.posX, this.posZ)) {
          guard.alert = true;
          this.playAlertSound(guard.type);
        }
      }

      if (guard.alert) {
        const isDog = guard.type === 'dog';
        const isBoss = guard.type === 'boss';
        const isSS = guard.type === 'ss';

        const minRange = isDog ? 0.95 : isBoss ? 3.5 : 2.5;

        if (dist > minRange) {
          const moveSpeedMultiplier = isDog ? 2.3 : isBoss ? 1.1 : isSS ? 1.6 : 1.35;
          const speed = moveSpeedMultiplier * dt;
          const stepX = ((this.posX - guard.x) / dist) * speed;
          const stepZ = ((this.posZ - guard.z) / dist) * speed;

          if (!this.isWall(guard.x + stepX, guard.z)) guard.x += stepX;
          if (!this.isWall(guard.x, guard.z + stepZ)) guard.z += stepZ;

          guard.mesh.position.set(guard.x, isDog ? 0.32 : isBoss ? 0.62 : 0.42, guard.z);

          // Walk animation frames
          guard.walkTimer += dt * (isDog ? 9 : 6);
          guard.state = Math.floor(guard.walkTimer) % 2 === 0 ? 'walk1' : 'walk2';
          guard.mesh.material.map = this.getTextureForEntity(guard.type, guard.state);
        } else {
          // In attack range!
          guard.shootCooldown -= dt;
          if (guard.shootCooldown <= 0) {
            const baseCooldown = isDog ? 0.65 : isBoss ? 0.55 : isSS ? 0.9 : 1.6;
            guard.shootCooldown = baseCooldown + Math.random() * 0.4;
            guard.state = 'shoot';
            guard.mesh.material.map = this.getTextureForEntity(guard.type, 'shoot');

            if (isDog) {
              wolfensteinAudio.playDogBark();
            } else if (isBoss) {
              wolfensteinAudio.playMachineGun();
            } else if (isSS) {
              wolfensteinAudio.playMachineGun();
            } else {
              wolfensteinAudio.playPistol();
            }

            // Damage player if in line of sight
            if (this.hasLineOfSight(guard.x, guard.z, this.posX, this.posZ)) {
              const damage = isBoss ? 16 + Math.floor(Math.random() * 12) : isSS ? 12 + Math.floor(Math.random() * 10) : isDog ? 14 : 8 + Math.floor(Math.random() * 8);
              this.health = Math.max(0, this.health - damage);
              this.hurtTimer = 0.25;
              wolfensteinAudio.playPlayerHurt();

              if (this.health <= 0) {
                this.lives--;
                if (this.lives <= 0) {
                  this.gameOver = true;
                } else {
                  // Respawn at floor start
                  const floorDef = WOLFENSTEIN_FLOORS[this.currentFloor - 1];
                  this.health = 100;
                  this.posX = floorDef.startX;
                  this.posZ = floorDef.startZ;
                }
              }
              this.notifyStats();
            }

            setTimeout(() => {
              if (guard.state === 'shoot') {
                guard.state = 'stand';
                guard.mesh.material.map = this.getTextureForEntity(guard.type, 'stand');
              }
            }, 250);
          }
        }
      }
    });
  }

  private isWall(x: number, z: number): boolean {
    const gridX = Math.floor(x);
    const gridZ = Math.floor(z);
    if (gridX < 0 || gridX >= this.mapSize || gridZ < 0 || gridZ >= this.mapSize) return true;

    const cell = this.map[gridZ][gridX];
    if (cell === 1 || cell === 2 || cell === 3 || cell === 4 || cell === 5 || cell === 6) return true;

    if (cell === 7) {
      const door = this.doors.find((d) => d.x === gridX && d.z === gridZ);
      if (door && door.openAmount < 0.75) return true;
    }

    if (cell === 8) {
      const push = this.pushWalls.find((p) => p.x === gridX && p.z === gridZ);
      if (push && push.state !== 'done') return true;
    }

    return false;
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.update(0.016);
    this.renderer.render(this.scene, this.camera);
  };

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private notifyStats() {
    if (this.onStatsChange) {
      const floorDef = WOLFENSTEIN_FLOORS[this.currentFloor - 1];
      const boss = this.guards.find((g) => g.type === 'boss');

      this.onStatsChange({
        floor: this.currentFloor,
        floorTitle: floorDef ? floorDef.title : `VERDIEPING ${this.currentFloor}`,
        score: this.score,
        lives: this.lives,
        health: this.health,
        ammo: this.ammo,
        weapon: this.weapon,
        hasMachinegun: this.hasMachinegun,
        kills: this.kills,
        totalGuards: this.guards.length,
        secrets: this.secrets,
        totalSecrets: this.pushWalls.length,
        treasures: this.treasures,
        totalTreasures: this.items.filter((i) => i.type === 'chalice').length,
        gameOver: this.gameOver,
        victory: this.victory,
        canInteract: this.canInteract,
        interactPrompt: this.interactPrompt,
        bossHp: boss ? Math.max(0, boss.hp) : undefined,
        bossMaxHp: boss ? boss.maxHp : undefined,
        floorAnnouncement: this.floorAnnouncement,
      });
    }
  }

  public getAutomapInfo() {
    return {
      mapSize: this.mapSize,
      map: this.map,
      visited: this.visited,
      posX: this.posX,
      posZ: this.posZ,
      angle: this.angle,
      doors: this.doors.map((d) => ({ x: d.x, z: d.z, state: d.state, openAmount: d.openAmount })),
      guards: this.guards.map((g) => ({ x: g.x, z: g.z, type: g.type, dead: g.state === 'dead' })),
      pushWalls: this.pushWalls.map((p) => ({ x: p.x, z: p.z, state: p.state })),
    };
  }

  public destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
