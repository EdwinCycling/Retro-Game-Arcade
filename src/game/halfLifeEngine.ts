/**
 * Half-Life (1998) - 3D First-Person Engine
 * High-Resolution 1920x1280 WebGL Renderer (Three.js)
 * Black Mesa Research Facility // Sector C: Anomalous Materials
 */

import * as THREE from 'three';
import { halfLifeAudio } from './halfLifeAudio';
import {
  createBlackMesaWallTexture,
  createFloorPlateTexture,
  createCeilingTexture,
  createHealthStationTexture,
  createHEVStationTexture,
  createComputerConsoleTexture,
  createBlastDoorTexture,
  createCrateTexture,
  createRadioactiveSlimeTexture
} from './halfLifeTextures';

export type HalfLifeWeapon = 'crowbar' | 'glock' | 'shotgun' | 'mp5';

export interface HalfLifeStats {
  health: number;
  armor: number;
  score: number;
  kills: number;
  activeWeapon: HalfLifeWeapon;
  ammo: {
    bullets: number;
    shells: number;
    grenades: number;
  };
  magazine: {
    bullets: number; // max 17
    shells: number;  // max 8
    mp5: number;     // max 50
  };
  flashlightOn: boolean;
  isGameOver: boolean;
  victory: boolean;
  alertText: string;
}

interface Enemy {
  type: 'headcrab' | 'zombie' | 'vortigaunt';
  mesh: THREE.Group;
  health: number;
  maxHealth: number;
  speed: number;
  attackRange: number;
  damage: number;
  attackCooldown: number;
  lastAttackTime: number;
  isDead: boolean;
  state: 'idle' | 'chasing' | 'attacking' | 'leaping' | 'charging';
  velocity: THREE.Vector3;
}

interface Crate {
  mesh: THREE.Mesh;
  health: number;
  lootType: 'health' | 'ammo_bullets' | 'ammo_shells' | 'battery';
  destroyed: boolean;
}

interface InteractiveStation {
  type: 'health' | 'hev';
  mesh: THREE.Mesh;
  chargeRemaining: number;
  position: THREE.Vector3;
}

export class HalfLifeEngine {
  private container: HTMLElement;
  private onStatsChange: (stats: HalfLifeStats) => void;

  // Three.js Core
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private animFrameId: number | null = null;

  // Lighting
  private ambientLight: THREE.AmbientLight;
  private flashlight: THREE.SpotLight;

  // First-Person Viewmodel & Hands
  private weaponRig: THREE.Group;
  private crowbarMesh: THREE.Group;
  private glockMesh: THREE.Group;
  private shotgunMesh: THREE.Group;
  private mp5Mesh: THREE.Group;

  // Player state
  private playerPos = new THREE.Vector3(0, 1.7, 10);
  private playerVel = new THREE.Vector3(0, 0, 0);
  private pitch = 0; // up/down
  private yaw = 0;   // left/right
  private isCrouching = false;
  private isSprinting = false;
  private isGrounded = true;
  private isPointerLocked = false;

  // Key tracking
  private keys: Record<string, boolean> = {};

  // World entities
  private walls: THREE.Box3[] = [];
  private enemies: Enemy[] = [];
  private crates: Crate[] = [];
  private stations: InteractiveStation[] = [];
  private particles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];
  private exitDoor: THREE.Mesh | null = null;

  // Weapon animations
  private isSwinging = false;
  private isShooting = false;
  private swingProgress = 0;
  private recoilOffset = 0;

  // Gameplay stats
  private stats: HalfLifeStats = {
    health: 100,
    armor: 45,
    score: 0,
    kills: 0,
    activeWeapon: 'crowbar',
    ammo: {
      bullets: 50,
      shells: 16,
      grenades: 2
    },
    magazine: {
      bullets: 17,
      shells: 8,
      mp5: 50
    },
    flashlightOn: true,
    isGameOver: false,
    victory: false,
    alertText: 'HEV MARK IV SUIT: ONLINE. SECTOR C HAZARD LEVEL HIGH.'
  };

  constructor(container: HTMLElement, onStatsChange: (stats: HalfLifeStats) => void) {
    this.container = container;
    this.onStatsChange = onStatsChange;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#090a0f');
    this.scene.fog = new THREE.FogExp2('#090a0f', 0.04);

    // 2. Camera setup
    const aspect = container.clientWidth / container.clientHeight || 1920 / 1280;
    this.camera = new THREE.PerspectiveCamera(78, aspect, 0.1, 100);
    this.camera.rotation.order = 'YXZ';

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    // 4. Lighting & Flashlight
    this.ambientLight = new THREE.AmbientLight('#475569', 0.85);
    this.scene.add(this.ambientLight);

    this.flashlight = new THREE.SpotLight(0xfff7ed, 4.5, 30, Math.PI / 6, 0.4, 1.2);
    this.flashlight.position.set(0, 0, 0);
    this.flashlight.target.position.set(0, 0, -1);
    this.camera.add(this.flashlight);
    this.camera.add(this.flashlight.target);
    this.scene.add(this.camera);

    // 5. Build Viewmodels & Lab Map
    this.weaponRig = new THREE.Group();
    this.camera.add(this.weaponRig);
    this.weaponRig.position.set(0.3, -0.32, -0.55);

    this.crowbarMesh = this.createCrowbarModel();
    this.glockMesh = this.createGlockModel();
    this.shotgunMesh = this.createShotgunModel();
    this.mp5Mesh = this.createMP5Model();

    this.weaponRig.add(this.crowbarMesh);
    this.weaponRig.add(this.glockMesh);
    this.weaponRig.add(this.shotgunMesh);
    this.weaponRig.add(this.mp5Mesh);
    this.updateWeaponVisibility();

    // 6. Build Black Mesa Sector C Map
    this.buildBlackMesaMap();

    // 7. Event Listeners
    this.setupControls();

    // 8. Start loop & Kelly Bailey music
    halfLifeAudio.startMusic();
    this.renderLoop();
  }

  // --- WEAPON 3D MODELS ---
  private createCrowbarModel(): THREE.Group {
    const group = new THREE.Group();
    // Iconic Red Crowbar with steel curved pry tips
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.3, metalness: 0.8 });
    const tipMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.2, metalness: 0.95 });

    // Main shaft
    const shaftGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.45, 12);
    const shaft = new THREE.Mesh(shaftGeo, bodyMat);
    shaft.rotation.z = -Math.PI / 10;
    group.add(shaft);

    // Curved hook
    const hookGeo = new THREE.TorusGeometry(0.055, 0.014, 8, 16, Math.PI * 0.8);
    const hook = new THREE.Mesh(hookGeo, tipMat);
    hook.position.set(-0.06, 0.23, 0);
    hook.rotation.z = Math.PI / 4;
    group.add(hook);

    // Bottom chisel end
    const chiselGeo = new THREE.ConeGeometry(0.018, 0.05, 4);
    const chisel = new THREE.Mesh(chiselGeo, tipMat);
    chisel.position.set(0.06, -0.23, 0);
    chisel.rotation.z = Math.PI;
    group.add(chisel);

    group.position.set(0, 0.05, 0);
    group.rotation.set(0.2, -0.4, 0.3);
    return group;
  }

  private createGlockModel(): THREE.Group {
    const group = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.8 });
    const slideMat = new THREE.MeshStandardMaterial({ color: '#3f3f46', metalness: 0.7, roughness: 0.3 });

    // Slide
    const slideGeo = new THREE.BoxGeometry(0.04, 0.05, 0.22);
    const slide = new THREE.Mesh(slideGeo, slideMat);
    slide.position.set(0, 0.05, 0);
    group.add(slide);

    // Barrel opening
    const barrelGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.02, 10);
    const barrel = new THREE.Mesh(barrelGeo, frameMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.05, -0.11);
    group.add(barrel);

    // Grip
    const gripGeo = new THREE.BoxGeometry(0.035, 0.12, 0.06);
    const grip = new THREE.Mesh(gripGeo, frameMat);
    grip.position.set(0, -0.03, 0.05);
    grip.rotation.x = 0.25;
    group.add(grip);

    group.position.set(0, 0.05, 0.05);
    return group;
  }

  private createShotgunModel(): THREE.Group {
    const group = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: '#27272a', metalness: 0.85, roughness: 0.3 });
    const pumpMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.9 });

    // SPAS-12 Barrel & Magazine tube
    const barrelGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.5, 12);
    const barrel = new THREE.Mesh(barrelGeo, metalMat);
    barrel.rotation.x = Math.PI / 2;
    group.add(barrel);

    const magTubeGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.45, 12);
    const magTube = new THREE.Mesh(magTubeGeo, metalMat);
    magTube.rotation.x = Math.PI / 2;
    magTube.position.set(0, -0.028, 0.02);
    group.add(magTube);

    // Ribbed Pump Handle
    const pumpGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.14, 12);
    const pump = new THREE.Mesh(pumpGeo, pumpMat);
    pump.rotation.x = Math.PI / 2;
    pump.position.set(0, -0.02, -0.05);
    group.add(pump);

    // Receiver & Stock
    const receiverGeo = new THREE.BoxGeometry(0.05, 0.08, 0.18);
    const receiver = new THREE.Mesh(receiverGeo, metalMat);
    receiver.position.set(0, 0, 0.22);
    group.add(receiver);

    group.position.set(0, 0.02, 0.08);
    return group;
  }

  private createMP5Model(): THREE.Group {
    const group = new THREE.Group();
    const gunMat = new THREE.MeshStandardMaterial({ color: '#1e2024', metalness: 0.6, roughness: 0.4 });

    // Body
    const bodyGeo = new THREE.BoxGeometry(0.045, 0.08, 0.35);
    const body = new THREE.Mesh(bodyGeo, gunMat);
    group.add(body);

    // Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.2, 10);
    const barrel = new THREE.Mesh(barrelGeo, gunMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.01, -0.22);
    group.add(barrel);

    // Curved magazine
    const magGeo = new THREE.BoxGeometry(0.025, 0.18, 0.05);
    const mag = new THREE.Mesh(magGeo, gunMat);
    mag.position.set(0, -0.1, -0.04);
    mag.rotation.x = -0.15;
    group.add(mag);

    // Underbarrel Grenade Launcher tube
    const glGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.18, 12);
    const glMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.7 });
    const gl = new THREE.Mesh(glGeo, glMat);
    gl.rotation.x = Math.PI / 2;
    gl.position.set(0, -0.04, -0.14);
    group.add(gl);

    group.position.set(0, 0.02, 0.08);
    return group;
  }

  private updateWeaponVisibility() {
    this.crowbarMesh.visible = this.stats.activeWeapon === 'crowbar';
    this.glockMesh.visible = this.stats.activeWeapon === 'glock';
    this.shotgunMesh.visible = this.stats.activeWeapon === 'shotgun';
    this.mp5Mesh.visible = this.stats.activeWeapon === 'mp5';
  }

  // --- MAP BUILDER (BLACK MESA SECTOR C) ---
  private buildBlackMesaMap() {
    const wallTex = createBlackMesaWallTexture();
    const floorTex = createFloorPlateTexture();
    const ceilTex = createCeilingTexture();
    const consoleTex = createComputerConsoleTexture();
    const blastDoorTex = createBlastDoorTexture();
    const crateTex = createCrateTexture();
    const slimeTex = createRadioactiveSlimeTexture();

    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.7 });
    const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.5 });
    const ceilMat = new THREE.MeshStandardMaterial({ map: ceilTex, roughness: 0.6 });

    // 1. Corridors & Chambers Floor & Ceiling
    // Chamber 1: Main Sector C Entrance (Z: 0 to 18, X: -6 to 6)
    const floor1Geo = new THREE.PlaneGeometry(16, 26);
    const floor1 = new THREE.Mesh(floor1Geo, floorMat);
    floor1.rotation.x = -Math.PI / 2;
    floor1.position.set(0, 0, 9);
    this.scene.add(floor1);

    const ceil1 = new THREE.Mesh(floor1Geo, ceilMat);
    ceil1.rotation.x = Math.PI / 2;
    ceil1.position.set(0, 4, 9);
    this.scene.add(ceil1);

    // Chamber 2: Anomalous Materials Test Lab (Z: -24 to 0, X: -14 to 14)
    const floor2Geo = new THREE.PlaneGeometry(30, 26);
    const floor2 = new THREE.Mesh(floor2Geo, floorMat);
    floor2.rotation.x = -Math.PI / 2;
    floor2.position.set(0, 0, -12);
    this.scene.add(floor2);

    const ceil2 = new THREE.Mesh(floor2Geo, ceilMat);
    ceil2.rotation.x = Math.PI / 2;
    ceil2.position.set(0, 5, -12);
    this.scene.add(ceil2);

    // Radioactive Slime Pit in Center of Lab
    const slimeGeo = new THREE.PlaneGeometry(8, 10);
    const slimeMat = new THREE.MeshStandardMaterial({
      map: slimeTex,
      emissive: '#16a34a',
      emissiveIntensity: 0.6,
      roughness: 0.2
    });
    const slime = new THREE.Mesh(slimeGeo, slimeMat);
    slime.rotation.x = -Math.PI / 2;
    slime.position.set(0, 0.05, -12);
    this.scene.add(slime);

    // Green glow light above slime pit
    const slimeLight = new THREE.PointLight('#22c55e', 2.5, 14);
    slimeLight.position.set(0, 2.5, -12);
    this.scene.add(slimeLight);

    // 2. Build Perimeter & Interior Walls
    this.addWall(8, 2, 9, 0.5, 4, 26, wallMat);    // Right corridor wall
    this.addWall(-8, 2, 9, 0.5, 4, 26, wallMat);   // Left corridor wall
    this.addWall(0, 2, 22, 16, 4, 0.5, wallMat);   // Entrance back wall

    // Lab walls
    this.addWall(15, 2.5, -12, 0.5, 5, 26, wallMat);  // Lab Right
    this.addWall(-15, 2.5, -12, 0.5, 5, 26, wallMat); // Lab Left
    this.addWall(0, 2.5, -25, 30, 5, 0.5, wallMat);   // Lab Back wall

    // Archway separating corridor and lab
    this.addWall(-11, 2, 0, 8, 4, 0.5, wallMat);
    this.addWall(11, 2, 0, 8, 4, 0.5, wallMat);
    this.addWall(0, 3.5, 0, 14, 1, 0.5, wallMat);

    // 3. Computer Consoles
    const consoleMat = new THREE.MeshStandardMaterial({ map: consoleTex });
    const console1 = new THREE.Mesh(new THREE.BoxGeometry(3, 2.2, 0.8), consoleMat);
    console1.position.set(-5.5, 1.1, 14);
    this.scene.add(console1);
    this.walls.push(new THREE.Box3().setFromObject(console1));

    const console2 = new THREE.Mesh(new THREE.BoxGeometry(4, 2.2, 0.8), consoleMat);
    console2.position.set(9, 1.1, -23.5);
    this.scene.add(console2);
    this.walls.push(new THREE.Box3().setFromObject(console2));

    // 4. Interactive Stations
    // First Aid Health Station
    const healthMat = new THREE.MeshStandardMaterial({ map: createHealthStationTexture() });
    const healthMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.6, 0.15), healthMat);
    healthMesh.position.set(7.8, 1.8, 8);
    healthMesh.rotation.y = -Math.PI / 2;
    this.scene.add(healthMesh);
    this.stations.push({
      type: 'health',
      mesh: healthMesh,
      chargeRemaining: 100,
      position: new THREE.Vector3(7.4, 1.8, 8)
    });

    // HEV Suit Power Charger
    const hevMat = new THREE.MeshStandardMaterial({ map: createHEVStationTexture() });
    const hevMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.6, 0.15), hevMat);
    hevMesh.position.set(-7.8, 1.8, 8);
    hevMesh.rotation.y = Math.PI / 2;
    this.scene.add(hevMesh);
    this.stations.push({
      type: 'hev',
      mesh: hevMesh,
      chargeRemaining: 100,
      position: new THREE.Vector3(-7.4, 1.8, 8)
    });

    // 5. Smashable Wooden Crates with Loot
    const crateMat = new THREE.MeshStandardMaterial({ map: crateTex, roughness: 0.8 });
    this.spawnCrate(4, 0.5, 12, crateMat, 'health');
    this.spawnCrate(4, 0.5, 13.2, crateMat, 'ammo_bullets');
    this.spawnCrate(4, 1.5, 12.6, crateMat, 'ammo_shells');
    this.spawnCrate(-11, 0.5, -16, crateMat, 'battery');
    this.spawnCrate(-11, 0.5, -17.5, crateMat, 'ammo_bullets');

    // 6. Blast Door / Victory Exit Portal
    const doorMat = new THREE.MeshStandardMaterial({ map: blastDoorTex });
    this.exitDoor = new THREE.Mesh(new THREE.BoxGeometry(4, 3.5, 0.4), doorMat);
    this.exitDoor.position.set(0, 1.75, -24.7);
    this.scene.add(this.exitDoor);

    // 7. Spawn Iconic Half-Life Enemies
    this.spawnEnemy('headcrab', new THREE.Vector3(0, 0.3, 4));
    this.spawnEnemy('headcrab', new THREE.Vector3(2.5, 0.3, -2));
    this.spawnEnemy('zombie', new THREE.Vector3(-5, 1, -8));
    this.spawnEnemy('zombie', new THREE.Vector3(6, 1, -10));
    this.spawnEnemy('vortigaunt', new THREE.Vector3(-8, 1.2, -18));
    this.spawnEnemy('vortigaunt', new THREE.Vector3(7, 1.2, -19));
    this.spawnEnemy('headcrab', new THREE.Vector3(0, 0.3, -21));
  }

  private addWall(x: number, y: number, z: number, w: number, h: number, d: number, mat: THREE.Material) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.walls.push(new THREE.Box3().setFromObject(mesh));
  }

  private spawnCrate(x: number, y: number, z: number, mat: THREE.Material, loot: Crate['lootType']) {
    const geo = new THREE.BoxGeometry(1.1, 1.1, 1.1);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    this.scene.add(mesh);
    this.crates.push({
      mesh,
      health: 30,
      lootType: loot,
      destroyed: false
    });
    this.walls.push(new THREE.Box3().setFromObject(mesh));
  }

  // --- MONSTERS ---
  private spawnEnemy(type: Enemy['type'], pos: THREE.Vector3) {
    const group = new THREE.Group();

    if (type === 'headcrab') {
      // 4-legged fleshy alien jumper
      const bodyGeo = new THREE.SphereGeometry(0.28, 8, 8);
      bodyGeo.scale(1, 0.6, 1.2);
      const bodyMat = new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.6 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.25;
      group.add(body);

      // Claws / Legs
      const legGeo = new THREE.CylinderGeometry(0.03, 0.015, 0.25);
      const legMat = new THREE.MeshStandardMaterial({ color: '#78350f' });
      for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(i % 2 === 0 ? 0.2 : -0.2, 0.12, i < 2 ? 0.18 : -0.18);
        leg.rotation.z = i % 2 === 0 ? -0.4 : 0.4;
        group.add(leg);
      }
      group.position.copy(pos);
      this.scene.add(group);

      this.enemies.push({
        type,
        mesh: group,
        health: 25,
        maxHealth: 25,
        speed: 3.2,
        attackRange: 4.5,
        damage: 15,
        attackCooldown: 2.2,
        lastAttackTime: 0,
        isDead: false,
        state: 'idle',
        velocity: new THREE.Vector3()
      });
    } else if (type === 'zombie') {
      // Scientist torso host with long claws
      const torsoGeo = new THREE.BoxGeometry(0.6, 0.9, 0.35);
      const torsoMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.8 }); // Torn labcoat
      const torso = new THREE.Mesh(torsoGeo, torsoMat);
      torso.position.y = 1.0;
      group.add(torso);

      // Headcrab on head
      const headGeo = new THREE.SphereGeometry(0.26, 8, 8);
      const headMat = new THREE.MeshStandardMaterial({ color: '#b45309' });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(0, 1.6, 0.05);
      group.add(head);

      // Long bloody claws
      const armGeo = new THREE.BoxGeometry(0.12, 0.7, 0.12);
      const armMat = new THREE.MeshStandardMaterial({ color: '#991b1b' });
      const leftArm = new THREE.Mesh(armGeo, armMat);
      leftArm.position.set(-0.42, 1.0, 0.25);
      leftArm.rotation.x = -Math.PI / 4;
      const rightArm = new THREE.Mesh(armGeo, armMat);
      rightArm.position.set(0.42, 1.0, 0.25);
      rightArm.rotation.x = -Math.PI / 4;
      group.add(leftArm);
      group.add(rightArm);

      group.position.copy(pos);
      this.scene.add(group);

      this.enemies.push({
        type,
        mesh: group,
        health: 70,
        maxHealth: 70,
        speed: 1.8,
        attackRange: 1.8,
        damage: 25,
        attackCooldown: 1.8,
        lastAttackTime: 0,
        isDead: false,
        state: 'idle',
        velocity: new THREE.Vector3()
      });
    } else if (type === 'vortigaunt') {
      // Alien Slave with green electric eye & claws
      const bodyGeo = new THREE.CylinderGeometry(0.3, 0.22, 1.2, 8);
      const bodyMat = new THREE.MeshStandardMaterial({ color: '#713f12', roughness: 0.7 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.1;
      group.add(body);

      // Red central eye
      const eyeGeo = new THREE.SphereGeometry(0.12, 8, 8);
      const eyeMat = new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#dc2626', emissiveIntensity: 0.8 });
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(0, 1.6, 0.25);
      group.add(eye);

      group.position.copy(pos);
      this.scene.add(group);

      this.enemies.push({
        type,
        mesh: group,
        health: 85,
        maxHealth: 85,
        speed: 2.2,
        attackRange: 14,
        damage: 30,
        attackCooldown: 3.0,
        lastAttackTime: 0,
        isDead: false,
        state: 'idle',
        velocity: new THREE.Vector3()
      });
    }
  }

  // --- CONTROLS & POINTER LOCK ---
  private setupControls() {
    const canvas = this.renderer.domElement;

    canvas.addEventListener('click', () => {
      if (!this.isPointerLocked) {
        canvas.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === canvas;
    });

    // Mouse movement
    window.addEventListener('mousemove', (e) => {
      if (!this.isPointerLocked) return;
      const sensitivity = 0.0022;
      this.yaw -= e.movementX * sensitivity;
      this.pitch -= e.movementY * sensitivity;
      this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));
    });

    // Keyboard keys
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Weapon slots
      if (e.code === 'Digit1') this.switchWeapon('crowbar');
      if (e.code === 'Digit2') this.switchWeapon('glock');
      if (e.code === 'Digit3') this.switchWeapon('shotgun');
      if (e.code === 'Digit4') this.switchWeapon('mp5');

      // Flashlight toggle
      if (e.code === 'KeyF') {
        this.stats.flashlightOn = !this.stats.flashlightOn;
        this.flashlight.intensity = this.stats.flashlightOn ? 4.5 : 0;
        this.emitStats();
      }

      // Reload
      if (e.code === 'KeyR') {
        this.reloadWeapon();
      }

      // Interact (E key)
      if (e.code === 'KeyE') {
        this.interactWithWorld();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Mouse Clicks for Shooting
    canvas.addEventListener('mousedown', (e) => {
      if (!this.isPointerLocked) return;
      if (e.button === 0) {
        this.primaryAttack();
      } else if (e.button === 2) {
        e.preventDefault();
        this.secondaryAttack();
      }
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  public switchWeapon(weapon: HalfLifeWeapon) {
    this.stats.activeWeapon = weapon;
    this.updateWeaponVisibility();
    this.emitStats();
  }

  // --- ATTACKS ---
  public primaryAttack() {
    if (this.stats.isGameOver || this.stats.victory) return;

    if (this.stats.activeWeapon === 'crowbar') {
      if (this.isSwinging) return;
      this.isSwinging = true;
      this.swingProgress = 0;
      halfLifeAudio.playCrowbarSwing();
      this.performMeleeRaycast();
    } else if (this.stats.activeWeapon === 'glock') {
      if (this.stats.magazine.bullets <= 0) {
        this.reloadWeapon();
        return;
      }
      this.stats.magazine.bullets--;
      this.stats.ammo.bullets--;
      this.recoilOffset = 0.08;
      halfLifeAudio.playGlockShot();
      this.performBulletRaycast(22);
      this.emitStats();
    } else if (this.stats.activeWeapon === 'shotgun') {
      if (this.stats.magazine.shells <= 0) {
        this.reloadWeapon();
        return;
      }
      this.stats.magazine.shells--;
      this.stats.ammo.shells--;
      this.recoilOffset = 0.16;
      halfLifeAudio.playShotgunBlast(false);
      // 8 shotgun pellets
      for (let i = 0; i < 8; i++) {
        this.performBulletRaycast(12, 0.04);
      }
      this.emitStats();
    } else if (this.stats.activeWeapon === 'mp5') {
      if (this.stats.magazine.mp5 <= 0) {
        this.reloadWeapon();
        return;
      }
      this.stats.magazine.mp5--;
      this.stats.ammo.bullets--;
      this.recoilOffset = 0.05;
      halfLifeAudio.playMP5Shot();
      this.performBulletRaycast(18, 0.02);
      this.emitStats();
    }
  }

  public secondaryAttack() {
    if (this.stats.isGameOver || this.stats.victory) return;

    if (this.stats.activeWeapon === 'shotgun') {
      // Double barrel blast
      if (this.stats.magazine.shells < 2) {
        this.primaryAttack();
        return;
      }
      this.stats.magazine.shells -= 2;
      this.stats.ammo.shells -= 2;
      this.recoilOffset = 0.28;
      halfLifeAudio.playShotgunBlast(true);
      for (let i = 0; i < 16; i++) {
        this.performBulletRaycast(14, 0.08);
      }
      this.emitStats();
    } else if (this.stats.activeWeapon === 'mp5') {
      // Grenade launcher THUMP!
      if (this.stats.ammo.grenades <= 0) {
        halfLifeAudio.announceHEV('Warning: Ordnance depleted');
        return;
      }
      this.stats.ammo.grenades--;
      this.recoilOffset = 0.2;
      halfLifeAudio.playGrenadeLaunch();
      this.launchGrenade();
      this.emitStats();
    } else if (this.stats.activeWeapon === 'glock') {
      // Rapid semi-auto double tap
      this.primaryAttack();
      setTimeout(() => this.primaryAttack(), 100);
    }
  }

  private performMeleeRaycast() {
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const range = 2.4;

    // Check smashable crates
    for (const crate of this.crates) {
      if (crate.destroyed) continue;
      const intersects = ray.intersectObject(crate.mesh);
      if (intersects.length > 0 && intersects[0].distance <= range) {
        crate.health -= 35;
        halfLifeAudio.playCrowbarMetalHit();
        this.spawnSparks(intersects[0].point, '#d97706');
        if (crate.health <= 0) {
          this.destroyCrate(crate);
        }
        return;
      }
    }

    // Check enemies
    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;
      const intersects = ray.intersectObjects(enemy.mesh.children, true);
      if (intersects.length > 0 && intersects[0].distance <= range) {
        enemy.health -= 40;
        halfLifeAudio.playCrowbarFleshHit();
        this.spawnBlood(intersects[0].point);
        if (enemy.health <= 0) {
          this.killEnemy(enemy);
        }
        return;
      }
    }

    // Hit metal/wall
    const intersects = ray.intersectObjects(this.scene.children);
    if (intersects.length > 0 && intersects[0].distance <= range) {
      halfLifeAudio.playCrowbarMetalHit();
      this.spawnSparks(intersects[0].point, '#facc15');
    }
  }

  private performBulletRaycast(damage: number, spread: number = 0) {
    const ray = new THREE.Raycaster();
    const screenCoord = new THREE.Vector2(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread
    );
    ray.setFromCamera(screenCoord, this.camera);

    // Check enemies
    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;
      const intersects = ray.intersectObjects(enemy.mesh.children, true);
      if (intersects.length > 0) {
        enemy.health -= damage;
        this.spawnBlood(intersects[0].point);
        if (enemy.health <= 0) {
          this.killEnemy(enemy);
        }
        return;
      }
    }

    // Check crates
    for (const crate of this.crates) {
      if (crate.destroyed) continue;
      const intersects = ray.intersectObject(crate.mesh);
      if (intersects.length > 0) {
        crate.health -= damage;
        this.spawnSparks(intersects[0].point, '#ca8a04');
        if (crate.health <= 0) {
          this.destroyCrate(crate);
        }
        return;
      }
    }

    // Bullet impact on wall/scenery
    const intersects = ray.intersectObjects(this.scene.children);
    if (intersects.length > 0) {
      this.spawnSparks(intersects[0].point, '#facc15');
    }
  }

  private launchGrenade() {
    const spawnPos = this.playerPos.clone().add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(0.8));
    const dir = this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(18);

    const geo = new THREE.SphereGeometry(0.08, 8, 8);
    const mat = new THREE.MeshStandardMaterial({ color: '#1e293b' });
    const nade = new THREE.Mesh(geo, mat);
    nade.position.copy(spawnPos);
    this.scene.add(nade);

    const startTime = performance.now();
    const nadeInterval = setInterval(() => {
      nade.position.addScaledVector(dir, 0.02);
      dir.y -= 0.35; // gravity

      // Check impact with ground or enemy
      if (nade.position.y <= 0.1 || performance.now() - startTime > 1200) {
        clearInterval(nadeInterval);
        halfLifeAudio.playExplosion();
        this.spawnSparks(nade.position, '#f97316');

        // Splash damage
        for (const enemy of this.enemies) {
          if (enemy.isDead) continue;
          const dist = enemy.mesh.position.distanceTo(nade.position);
          if (dist <= 6) {
            enemy.health -= Math.max(20, (6 - dist) * 25);
            if (enemy.health <= 0) this.killEnemy(enemy);
          }
        }
        this.scene.remove(nade);
      }
    }, 20);
  }

  private reloadWeapon() {
    if (this.stats.activeWeapon === 'glock') {
      const needed = 17 - this.stats.magazine.bullets;
      const available = Math.min(needed, this.stats.ammo.bullets - this.stats.magazine.bullets);
      if (available > 0) {
        this.stats.magazine.bullets += available;
        halfLifeAudio.playShotgunPump();
        this.emitStats();
      }
    } else if (this.stats.activeWeapon === 'shotgun') {
      const needed = 8 - this.stats.magazine.shells;
      const available = Math.min(needed, this.stats.ammo.shells - this.stats.magazine.shells);
      if (available > 0) {
        this.stats.magazine.shells += available;
        halfLifeAudio.playShotgunPump();
        this.emitStats();
      }
    } else if (this.stats.activeWeapon === 'mp5') {
      const needed = 50 - this.stats.magazine.mp5;
      const available = Math.min(needed, this.stats.ammo.bullets - this.stats.magazine.mp5);
      if (available > 0) {
        this.stats.magazine.mp5 += available;
        halfLifeAudio.playShotgunPump();
        this.emitStats();
      }
    }
  }

  // --- INTERACTION ---
  private interactWithWorld() {
    // Check First Aid or HEV Station within 2.5 meters
    for (const st of this.stations) {
      if (this.playerPos.distanceTo(st.position) < 2.5 && st.chargeRemaining > 0) {
        if (st.type === 'health' && this.stats.health < 100) {
          const healAmount = Math.min(25, 100 - this.stats.health, st.chargeRemaining);
          this.stats.health += healAmount;
          st.chargeRemaining -= healAmount;
          halfLifeAudio.playHealthStation();
          halfLifeAudio.announceHEV('Medical systems activated');
          this.emitStats();
          return;
        } else if (st.type === 'hev' && this.stats.armor < 100) {
          const chargeAmount = Math.min(25, 100 - this.stats.armor, st.chargeRemaining);
          this.stats.armor += chargeAmount;
          st.chargeRemaining -= chargeAmount;
          halfLifeAudio.playHEVStation();
          halfLifeAudio.announceHEV('Armor power at ' + this.stats.armor + ' percent');
          this.emitStats();
          return;
        }
      }
    }

    // Check Victory Blast Door at end of map
    if (this.exitDoor && this.playerPos.distanceTo(this.exitDoor.position) < 3.5) {
      const allDead = this.enemies.every(e => e.isDead);
      if (allDead) {
        this.stats.victory = true;
        this.stats.score += 5000;
        halfLifeAudio.announceHEV('Access granted. Sector C clear. Excellent work, Dr. Freeman.');
        this.emitStats();
      } else {
        halfLifeAudio.announceHEV('Security lockout: Hostile lifeforms detected');
      }
    }
  }

  // --- PARTICLES & DAMAGE ---
  private spawnSparks(pos: THREE.Vector3, color: string) {
    const mat = new THREE.MeshBasicMaterial({ color });
    const geo = new THREE.BoxGeometry(0.04, 0.04, 0.04);
    for (let i = 0; i < 8; i++) {
      const p = new THREE.Mesh(geo, mat);
      p.position.copy(pos);
      this.scene.add(p);
      this.particles.push({
        mesh: p,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          Math.random() * 3 + 1,
          (Math.random() - 0.5) * 4
        ),
        life: 0.35
      });
    }
  }

  private spawnBlood(pos: THREE.Vector3) {
    const mat = new THREE.MeshBasicMaterial({ color: '#dc2626' });
    const geo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
    for (let i = 0; i < 10; i++) {
      const p = new THREE.Mesh(geo, mat);
      p.position.copy(pos);
      this.scene.add(p);
      this.particles.push({
        mesh: p,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          Math.random() * 2,
          (Math.random() - 0.5) * 3
        ),
        life: 0.4
      });
    }
  }

  private destroyCrate(crate: Crate) {
    crate.destroyed = true;
    this.scene.remove(crate.mesh);
    this.spawnSparks(crate.mesh.position, '#78350f');

    // Spawn Loot item
    if (crate.lootType === 'health') {
      this.stats.health = Math.min(100, this.stats.health + 25);
      halfLifeAudio.playHealthStation();
    } else if (crate.lootType === 'battery') {
      this.stats.armor = Math.min(100, this.stats.armor + 30);
      halfLifeAudio.playHEVStation();
    } else if (crate.lootType === 'ammo_bullets') {
      this.stats.ammo.bullets += 30;
      halfLifeAudio.playShotgunPump();
    } else if (crate.lootType === 'ammo_shells') {
      this.stats.ammo.shells += 12;
      halfLifeAudio.playShotgunPump();
    }
    this.emitStats();
  }

  private killEnemy(enemy: Enemy) {
    enemy.isDead = true;
    this.stats.kills++;
    this.stats.score += enemy.type === 'vortigaunt' ? 500 : (enemy.type === 'zombie' ? 300 : 150);

    // Tip enemy mesh over
    enemy.mesh.rotation.z = Math.PI / 2;
    enemy.mesh.position.y = 0.2;
    this.emitStats();
  }

  private takePlayerDamage(amount: number) {
    if (this.stats.isGameOver || this.stats.victory) return;

    if (this.stats.armor > 0) {
      const absorbed = Math.min(this.stats.armor, Math.floor(amount * 0.75));
      this.stats.armor -= absorbed;
      amount -= absorbed;
    }

    this.stats.health = Math.max(0, this.stats.health - amount);

    if (this.stats.health <= 0) {
      this.stats.isGameOver = true;
      halfLifeAudio.announceHEV('Warning: Vital signs dropping. Subject compromised.');
    } else if (this.stats.health <= 25) {
      halfLifeAudio.announceHEV('Warning: Health critical. Morphine administered.');
    }
    this.emitStats();
  }

  // --- GAME TICK LOOP ---
  private update(dt: number) {
    if (this.stats.isGameOver || this.stats.victory) return;

    // 1. Camera Rotation
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    // 2. Player Movement (WASD)
    const moveDir = new THREE.Vector3();
    if (this.keys['KeyW']) moveDir.z -= 1;
    if (this.keys['KeyS']) moveDir.z += 1;
    if (this.keys['KeyA']) moveDir.x -= 1;
    if (this.keys['KeyD']) moveDir.x += 1;
    moveDir.normalize();

    this.isSprinting = !!this.keys['ShiftLeft'];
    this.isCrouching = !!this.keys['ControlLeft'];

    const speed = (this.isSprinting ? 9.5 : (this.isCrouching ? 3.0 : 6.0));
    moveDir.applyEuler(new THREE.Euler(0, this.yaw, 0));

    this.playerPos.x += moveDir.x * speed * dt;
    this.playerPos.z += moveDir.z * speed * dt;

    // Jump / Gravity
    if (this.keys['Space'] && this.isGrounded) {
      this.playerVel.y = 6.8;
      this.isGrounded = false;
    }

    this.playerVel.y -= 22 * dt; // gravity
    this.playerPos.y += this.playerVel.y * dt;

    const baseHeight = this.isCrouching ? 1.0 : 1.7;
    if (this.playerPos.y <= baseHeight) {
      this.playerPos.y = baseHeight;
      this.playerVel.y = 0;
      this.isGrounded = true;
    }

    // Keep camera in sync with player position
    this.camera.position.copy(this.playerPos);

    // 3. Weapon Animations (Swing & Recoil)
    if (this.isSwinging) {
      this.swingProgress += dt * 6;
      const angle = Math.sin(this.swingProgress * Math.PI) * 0.8;
      this.crowbarMesh.rotation.x = 0.2 + angle;
      this.crowbarMesh.rotation.y = -0.4 - angle * 0.5;
      if (this.swingProgress >= 1) {
        this.isSwinging = false;
        this.crowbarMesh.rotation.set(0.2, -0.4, 0.3);
      }
    }

    if (this.recoilOffset > 0) {
      this.recoilOffset = Math.max(0, this.recoilOffset - dt * 0.8);
      this.weaponRig.position.z = -0.55 + this.recoilOffset;
    }

    // 4. Enemy AI & Behaviors
    const now = performance.now() / 1000;
    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;

      const dist = enemy.mesh.position.distanceTo(this.playerPos);

      if (dist < 22) {
        // Face player
        enemy.mesh.lookAt(new THREE.Vector3(this.playerPos.x, enemy.mesh.position.y, this.playerPos.z));

        // Move towards player
        if (dist > enemy.attackRange) {
          const dir = new THREE.Vector3()
            .subVectors(this.playerPos, enemy.mesh.position)
            .normalize();
          enemy.mesh.position.x += dir.x * enemy.speed * dt;
          enemy.mesh.position.z += dir.z * enemy.speed * dt;
        } else {
          // Attack player
          if (now - enemy.lastAttackTime >= enemy.attackCooldown) {
            enemy.lastAttackTime = now;
            if (enemy.type === 'headcrab') {
              halfLifeAudio.playHeadcrabScreech();
              this.takePlayerDamage(enemy.damage);
            } else if (enemy.type === 'zombie') {
              halfLifeAudio.playZombieGroan();
              this.takePlayerDamage(enemy.damage);
            } else if (enemy.type === 'vortigaunt') {
              halfLifeAudio.playVortigauntCharge();
              setTimeout(() => {
                halfLifeAudio.playVortigauntZap();
                this.takePlayerDamage(enemy.damage);
                this.spawnSparks(this.playerPos, '#22c55e');
              }, 400);
            }
          }
        }
      }
    }

    // 5. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }
  }

  private renderLoop = () => {
    const dt = Math.min(this.clock.getDelta(), 0.1);
    this.update(dt);
    this.renderer.render(this.scene, this.camera);
    this.animFrameId = requestAnimationFrame(this.renderLoop);
  };

  private emitStats() {
    this.onStatsChange({ ...this.stats });
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    halfLifeAudio.stopMusic();
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
