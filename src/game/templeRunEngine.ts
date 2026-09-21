/**
 * Temple Run 3D iOS-Grade Hardware-Accelerated Engine (Three.js WebGL)
 * Authentic Aztec/Mayan stone viaduct, carved glyph pillars, hanging vines,
 * turquoise canyon river, mossy cliffs, 3-lane navigation, 90-degree corner turns,
 * jumping/sliding obstacle physics, chasing demon monkey pack, magnet coin trails,
 * booster wings, and resurrection idol mechanics.
 */

import * as THREE from 'three';
import { templeRunAudio } from './templeRunAudio';
import { templeRunTextures } from './templeRunTextures';

export type TempleLevelTheme = 'jungle' | 'cliff' | 'volcano';
export type TempleCharacter = 'Guy Dangerous' | 'Scarlett Fox' | 'Barry Bones' | 'Karma Lee';

export interface TempleRunStats {
  score: number;
  distance: number; // in meters
  coins: number;
  multiplier: number;
  levelTheme: TempleLevelTheme;
  character: TempleCharacter;
  gameOver: boolean;
  deathReason: string;
  activePowerup: 'none' | 'magnet' | 'boost' | 'shield' | 'multiplier';
  powerupTimer: number; // remaining seconds
  monkeyProximity: number; // 0 (far) to 1 (biting heels)
  hasResurrectionIdol: boolean;
  stumbleCount: number;
  turnWarning?: { direction: 'left' | 'right' | 'split'; distance: number } | null;
  coinMeterProgress: number; // 0 to 100
}

interface PathSegment {
  id: number;
  mesh: THREE.Group;
  type: 'straight' | 'turn_left' | 'turn_right' | 't_split' | 'jump_trunk' | 'slide_arch' | 'chasm_gap' | 'fire_trap' | 'wood_bridge';
  position: THREE.Vector3;
  direction: THREE.Vector3;
  rotationY: number;
  length: number;
  hasTurn: boolean;
  turnDirection?: 'left' | 'right' | 'both';
  turnExecuted?: boolean;
  cornerCenter?: THREE.Vector3;
  obstacles: {
    type: 'trunk' | 'arch' | 'gap' | 'fire' | 'spikes' | 'wall';
    box: THREE.Box3;
    mesh: THREE.Object3D;
    cleared?: boolean;
  }[];
  coins: {
    mesh: THREE.Mesh;
    worldPos: THREE.Vector3;
    collected: boolean;
    value: number;
  }[];
  powerup?: {
    type: 'magnet' | 'boost' | 'shield' | 'mega_coin' | 'multiplier' | 'idol';
    mesh: THREE.Group;
    worldPos: THREE.Vector3;
    collected: boolean;
  };
}

export class TempleRunEngine {
  private container: HTMLDivElement;
  private onStatsUpdate: (stats: TempleRunStats) => void;

  // Three.js Core
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animFrameId: number | null = null;
  private lastFrameTime: number = performance.now();

  // Environment & Scenery
  private skyDome!: THREE.Mesh;
  private riverWater!: THREE.Mesh;
  private waterTexture!: THREE.CanvasTexture;
  private dirLight!: THREE.DirectionalLight;
  private ambLight!: THREE.AmbientLight;
  private hemiLight!: THREE.HemisphereLight;
  private playerPointLight!: THREE.PointLight;
  private portalGroup: THREE.Group | null = null;

  // Materials Cache
  private matStoneRoad!: THREE.MeshStandardMaterial;
  private matCarvedPillar!: THREE.MeshStandardMaterial;
  private matStoneWall!: THREE.MeshStandardMaterial;
  private matWoodBridge!: THREE.MeshStandardMaterial;
  private matCliffRock!: THREE.MeshStandardMaterial;
  private matGoldCoin!: THREE.MeshStandardMaterial;
  private matVineLeaves!: THREE.MeshStandardMaterial;
  private matFireEmber!: THREE.MeshStandardMaterial;
  private matTurnPavementLeft!: THREE.MeshBasicMaterial;
  private matTurnPavementRight!: THREE.MeshBasicMaterial;
  private matTurnPavementSplit!: THREE.MeshBasicMaterial;
  private matJumpWarning!: THREE.MeshStandardMaterial;
  private matSlideWarning!: THREE.MeshStandardMaterial;

  // Player State
  private playerGroup!: THREE.Group;
  private playerHead!: THREE.Mesh;
  private playerBody!: THREE.Mesh;
  private playerLeftArm!: THREE.Mesh;
  private playerRightArm!: THREE.Mesh;
  private playerLeftLeg!: THREE.Mesh;
  private playerRightLeg!: THREE.Mesh;
  private playerFedora!: THREE.Group;
  private shieldMesh!: THREE.Mesh;
  private wingsGroup!: THREE.Group;

  // Navigation & Physics
  private currentLane: number = 0; // -1 (left), 0 (center), 1 (right)
  private targetLaneX: number = 0;
  private readonly laneWidth: number = 1.35;
  private currentSpeed: number = 13.5; // Starts at comfortable classic Temple Run jog
  private baseSpeed: number = 13.5;
  private maxSpeed: number = 38.0;

  private playerPos = new THREE.Vector3(0, 0, 0);
  private currentDirection = new THREE.Vector3(0, 0, -1);
  private targetRotationY: number = 0;
  private currentRotationY: number = 0;

  private isJumping: boolean = false;
  private jumpY: number = 0;
  private jumpVelocity: number = 0;
  private readonly gravity: number = -52.0;
  private readonly jumpForce: number = 18.0;

  private isSliding: boolean = false;
  private slideTimer: number = 0;
  private readonly slideDuration: number = 0.85;

  private tiltOffset: number = 0; // -0.6 to +0.6
  private runAnimTime: number = 0;

  // Demon Monkeys (Pack of 3 Chasers)
  private monkeyPackGroup!: THREE.Group;
  private monkeyDistance: number = 4.8; // distance behind player
  private monkeyTargetDistance: number = 4.8;
  private monkeyRoarTimer: number = 0;

  // Track Segments Management
  private segments: PathSegment[] = [];
  private readonly segmentLength = 16.0;
  private readonly maxActiveSegments = 18;
  private lastSegmentEndPos = new THREE.Vector3(0, 0, 0);
  private lastSegmentDirection = new THREE.Vector3(0, 0, -1);
  private lastSegmentRotationY: number = 0;
  private segmentCounter: number = 0;
  private currentSegmentId: number = 0;
  private queuedTurn: { direction: 'left' | 'right'; segId: number } | null = null;
  private corridorStepCount: number = 0;
  private currentCorridorTargetLength: number = 2;

  // Game Stats
  private score: number = 0;
  private distance: number = 0;
  private coins: number = 0;
  private multiplier: number = 1;
  private levelTheme: TempleLevelTheme = 'jungle';
  private character: TempleCharacter = 'Guy Dangerous';
  private gameOver: boolean = false;
  private deathReason: string = '';
  private activePowerup: 'none' | 'magnet' | 'boost' | 'shield' | 'multiplier' = 'none';
  private powerupTimer: number = 0;
  private hasResurrectionIdol: boolean = false;
  private stumbleCount: number = 0;
  private stumbleRecoveryTimer: number = 0;

  constructor(
    container: HTMLDivElement,
    theme: TempleLevelTheme,
    char: TempleCharacter,
    onStatsUpdate: (stats: TempleRunStats) => void
  ) {
    this.container = container;
    this.levelTheme = theme;
    this.character = char;
    this.onStatsUpdate = onStatsUpdate;

    this.initThree();
    this.createMaterials();
    this.createEnvironment();
    this.createPlayer();
    this.createDemonMonkeys();
    this.initInitialTrack();
    this.startLoop();

    templeRunAudio.startTribalDrums();
  }

  private initThree() {
    const width = this.container.clientWidth || 600;
    const height = this.container.clientHeight || 750;

    // Scene
    this.scene = new THREE.Scene();

    // Camera (High-Angle Cinematic 3rd-Person Follow)
    this.camera = new THREE.PerspectiveCamera(62, width / height, 0.2, 350);
    this.camera.position.set(0, 4.2, 5.8);

    // Renderer (Ultra High-Definition Antialiased)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      precision: 'highp',
      stencil: false
    });
    this.renderer.setSize(width, height);
    // Support crisp retina & 4k displays with up to 2.5x pixel ratio
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;

    // Clear previous elements
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
    this.container.appendChild(this.renderer.domElement);

    // Lighting Setup
    this.setupLighting();

    // Resize Handler
    window.addEventListener('resize', this.handleResize);
  }

  private setupLighting() {
    // Ambient soft fill light
    this.ambLight = new THREE.AmbientLight(0xfff5ea, 0.7);
    this.scene.add(this.ambLight);

    // Hemisphere sky/ground reflection
    let skyCol = 0x6bb7c7;
    let groundCol = 0x2d4a22;
    if (this.levelTheme === 'cliff') {
      skyCol = 0x7da8c4;
      groundCol = 0x3d352c;
    } else if (this.levelTheme === 'volcano') {
      skyCol = 0xd9531e;
      groundCol = 0x1f100a;
    }

    this.hemiLight = new THREE.HemisphereLight(skyCol, groundCol, 0.65);
    this.scene.add(this.hemiLight);

    // Warm Sun Directional Light with Soft Shadows
    this.dirLight = new THREE.DirectionalLight(0xfff0d0, 1.4);
    this.dirLight.position.set(25, 45, 20);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 1.0;
    this.dirLight.shadow.camera.far = 120;
    this.dirLight.shadow.camera.left = -30;
    this.dirLight.shadow.camera.right = 30;
    this.dirLight.shadow.camera.top = 30;
    this.dirLight.shadow.camera.bottom = -30;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);

    // Player Dynamic Torch Glow
    this.playerPointLight = new THREE.PointLight(0xffaa33, 2.2, 16, 1.2);
    this.scene.add(this.playerPointLight);

    // Atmospheric Scenic Fog (Soft Depth, NEVER pitch black)
    this.updateAtmosphericFog();
  }

  private updateAtmosphericFog() {
    if (this.levelTheme === 'jungle') {
      const fogColor = new THREE.Color(0x629c8e);
      this.scene.background = fogColor;
      this.scene.fog = new THREE.Fog(fogColor, 40, 140);
    } else if (this.levelTheme === 'cliff') {
      const fogColor = new THREE.Color(0x7399af);
      this.scene.background = fogColor;
      this.scene.fog = new THREE.Fog(fogColor, 45, 150);
    } else {
      const fogColor = new THREE.Color(0x4a1810);
      this.scene.background = fogColor;
      this.scene.fog = new THREE.Fog(fogColor, 35, 130);
    }
  }

  private createMaterials() {
    // 1. High-Resolution Ancient Stone Road
    const stoneTex = templeRunTextures.getStoneRoadTexture(this.levelTheme);
    stoneTex.repeat.set(1, 4);
    this.matStoneRoad = new THREE.MeshStandardMaterial({
      map: stoneTex,
      roughness: 0.82,
      metalness: 0.12
    });

    // 2. Carved Mayan Totem Face Pillars & Arches
    const pillarTex = templeRunTextures.getStoneCarvingTexture(this.levelTheme);
    this.matCarvedPillar = new THREE.MeshStandardMaterial({
      map: pillarTex,
      roughness: 0.78,
      metalness: 0.15
    });

    // 3. Side Parapet Stone
    this.matStoneWall = new THREE.MeshStandardMaterial({
      color: this.levelTheme === 'jungle' ? 0x8a7055 : this.levelTheme === 'cliff' ? 0x6e645a : 0x3d302a,
      roughness: 0.9,
      metalness: 0.05
    });

    // 4. Wooden Suspension Bridge Planks
    const woodTex = templeRunTextures.getWoodBridgeTexture();
    woodTex.repeat.set(1, 4);
    this.matWoodBridge = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.85,
      metalness: 0.1
    });

    // 5. Mossy Cliff Rock
    const rockTex = templeRunTextures.getCliffRockTexture();
    rockTex.repeat.set(4, 4);
    this.matCliffRock = new THREE.MeshStandardMaterial({
      map: rockTex,
      roughness: 0.95
    });

    // 6. Gleaming Golden Aztec Coin
    const textureLoader = new THREE.TextureLoader();
    let coinTex: THREE.Texture;
    try {
      coinTex = textureLoader.load('/src/assets/images/ancient_aztec_coin_1789233162968.jpg');
    } catch {
      coinTex = templeRunTextures.getGoldCoinTexture();
    }
    this.matGoldCoin = new THREE.MeshStandardMaterial({
      map: coinTex,
      color: 0xfff6bb,
      emissive: 0x664400,
      metalness: 0.88,
      roughness: 0.18
    });

    // 7. Lush Tropical Jungle Vines
    this.matVineLeaves = new THREE.MeshStandardMaterial({
      color: 0x228b22,
      roughness: 0.6,
      metalness: 0.05
    });

    // 8. Fire Trap Emitter
    this.matFireEmber = new THREE.MeshStandardMaterial({
      color: 0xff3b00,
      emissive: 0xff5500,
      emissiveIntensity: 2.0,
      roughness: 0.3
    });

    // 9. Pavement Turn Decals (Etched Glowing Aztec Arrows)
    this.matTurnPavementLeft = new THREE.MeshBasicMaterial({
      map: templeRunTextures.getTurnArrowTexture('left'),
      transparent: true,
      opacity: 0.95,
      depthWrite: false
    });
    this.matTurnPavementRight = new THREE.MeshBasicMaterial({
      map: templeRunTextures.getTurnArrowTexture('right'),
      transparent: true,
      opacity: 0.95,
      depthWrite: false
    });
    this.matTurnPavementSplit = new THREE.MeshBasicMaterial({
      map: templeRunTextures.getTurnArrowTexture('split'),
      transparent: true,
      opacity: 0.95,
      depthWrite: false
    });

    // 10. Distinct Obstacle Hazard Signs (Jump & Slide)
    this.matJumpWarning = new THREE.MeshStandardMaterial({
      map: templeRunTextures.getJumpHazardTexture(),
      roughness: 0.45,
      emissive: 0x143c14,
      emissiveIntensity: 0.5
    });
    this.matSlideWarning = new THREE.MeshStandardMaterial({
      map: templeRunTextures.getSlideHazardTexture(),
      roughness: 0.45,
      emissive: 0x5a2000,
      emissiveIntensity: 0.6
    });
  }

  private createEnvironment() {
    // Giant Sky Dome
    const textureLoader = new THREE.TextureLoader();
    let skyTex: THREE.Texture;
    try {
      skyTex = textureLoader.load('/src/assets/images/temple_jungle_panorama_1789233175995.jpg');
      skyTex.wrapS = THREE.RepeatWrapping;
      skyTex.repeat.set(2, 1);
    } catch {
      skyTex = templeRunTextures.getSkyTexture(this.levelTheme);
    }
    const skyGeo = new THREE.SphereGeometry(220, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide,
      fog: false
    });
    this.skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyDome);

    // Canyon Turquoise River Surface below Viaduct (14 meters below track)
    this.waterTexture = templeRunTextures.getWaterTexture();
    this.waterTexture.repeat.set(8, 8);
    const waterGeo = new THREE.PlaneGeometry(300, 300, 16, 16);
    const waterMat = new THREE.MeshStandardMaterial({
      map: this.waterTexture,
      roughness: 0.15,
      metalness: 0.35,
      transparent: true,
      opacity: 0.88
    });
    this.riverWater = new THREE.Mesh(waterGeo, waterMat);
    this.riverWater.rotation.x = -Math.PI / 2;
    this.riverWater.position.set(0, -14, -60);
    this.scene.add(this.riverWater);
  }

  private createPlayer() {
    this.playerGroup = new THREE.Group();

    let shirtColor = 0xbfa054; // Explorer Khaki / Leather
    let pantsColor = 0x382c23; // Dark utility pants
    let hairColor = 0x4a2c11;
    let skinColor = 0xf5c2a3;

    if (this.character === 'Scarlett Fox') {
      shirtColor = 0xba1e1e; // Ruby explorer
      pantsColor = 0x1e293b;
      hairColor = 0xee7e14; // Amber red/blonde
      skinColor = 0xfbe0cf;
    } else if (this.character === 'Barry Bones') {
      shirtColor = 0x1d4ed8; // Midnight officer
      pantsColor = 0x0f172a;
      hairColor = 0x18181b;
      skinColor = 0x8d5538;
    } else if (this.character === 'Karma Lee') {
      shirtColor = 0x991b1b; // Crimson ninja
      pantsColor = 0xd97706;
      hairColor = 0x09090b;
      skinColor = 0xf5d0b5;
    }

    const jacketTex = templeRunTextures.getExplorerJacketTexture(this.character);
    const matSkin = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.5, metalness: 0.05 });
    const matShirt = new THREE.MeshStandardMaterial({
      map: jacketTex,
      color: shirtColor,
      roughness: 0.65,
      metalness: 0.1
    });
    const matPants = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.75 });
    const matBoots = new THREE.MeshStandardMaterial({ color: 0x181311, roughness: 0.85 });
    const matLeather = new THREE.MeshStandardMaterial({ color: 0x3b200c, roughness: 0.45, metalness: 0.2 });
    const matGoldBuckle = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.85, roughness: 0.2 });

    // 1. Sculpted Head (Rounded Jaw & Face with Hair Mesh)
    const headGroup = new THREE.Group();
    const skullGeo = new THREE.SphereGeometry(0.18, 16, 16);
    skullGeo.scale(0.9, 1.05, 0.95);
    const skull = new THREE.Mesh(skullGeo, matSkin);
    skull.castShadow = true;
    headGroup.add(skull);

    // Hair / Sideburns
    const hairGeo = new THREE.CylinderGeometry(0.185, 0.19, 0.14, 12);
    const matHair = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.9 });
    const hair = new THREE.Mesh(hairGeo, matHair);
    hair.position.set(0, 0.08, -0.01);
    headGroup.add(hair);

    // Explorer Fedora Hat (Sculpted curved brim and pinched crown)
    this.playerFedora = new THREE.Group();
    const brimGeo = new THREE.CylinderGeometry(0.34, 0.35, 0.035, 20);
    const crownGeo = new THREE.CylinderGeometry(0.19, 0.21, 0.18, 16);
    crownGeo.scale(0.88, 1.0, 1.15); // pinched front-to-back
    const hatMat = new THREE.MeshStandardMaterial({ color: 0x422614, roughness: 0.85 });
    const hatBandMat = new THREE.MeshStandardMaterial({ color: 0x1f140a, roughness: 0.6 });

    const brim = new THREE.Mesh(brimGeo, hatMat);
    const crown = new THREE.Mesh(crownGeo, hatMat);
    crown.position.set(0, 0.09, 0);

    const hatBand = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.21, 0.04, 16), hatBandMat);
    hatBand.position.set(0, 0.03, 0);

    this.playerFedora.add(brim);
    this.playerFedora.add(crown);
    this.playerFedora.add(hatBand);
    this.playerFedora.position.set(0, 0.16, 0);
    headGroup.add(this.playerFedora);

    this.playerHead = headGroup as unknown as THREE.Mesh;
    this.playerHead.position.set(0, 1.48, 0);
    this.playerGroup.add(this.playerHead);

    // 2. Torso (Sculpted Chest & Waist with Explorer Belt & Golden Buckle)
    const torsoGroup = new THREE.Group();
    // Chest
    const chestGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.36, 16);
    chestGeo.scale(1.15, 1.0, 0.75);
    const chestMesh = new THREE.Mesh(chestGeo, matShirt);
    chestMesh.position.set(0, 0.16, 0);
    chestMesh.castShadow = true;
    torsoGroup.add(chestMesh);

    // Waist / Pelvis
    const waistGeo = new THREE.CylinderGeometry(0.2, 0.19, 0.22, 16);
    waistGeo.scale(1.05, 1.0, 0.72);
    const waistMesh = new THREE.Mesh(waistGeo, matShirt);
    waistMesh.position.set(0, -0.11, 0);
    waistMesh.castShadow = true;
    torsoGroup.add(waistMesh);

    // Heavy Utility Leather Belt
    const beltGeo = new THREE.CylinderGeometry(0.205, 0.205, 0.065, 16);
    beltGeo.scale(1.08, 1.0, 0.75);
    const belt = new THREE.Mesh(beltGeo, matLeather);
    belt.position.set(0, -0.19, 0);
    torsoGroup.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.04), matGoldBuckle);
    buckle.position.set(0, -0.19, 0.16);
    torsoGroup.add(buckle);

    // Satchel Cross-Strap & Leather Pouch
    const strapGeo = new THREE.BoxGeometry(0.48, 0.07, 0.32);
    const strap = new THREE.Mesh(strapGeo, matLeather);
    strap.position.set(0, 0.1, 0);
    strap.rotation.z = 0.52;
    torsoGroup.add(strap);

    const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.09), matLeather);
    pouch.position.set(0.23, -0.16, 0.05);
    torsoGroup.add(pouch);

    this.playerBody = torsoGroup as unknown as THREE.Mesh;
    this.playerBody.position.set(0, 1.02, 0);
    this.playerGroup.add(this.playerBody);

    // 3. Detailed Rounded Arms with Elbows and Hands
    const createArm = (isLeft: boolean) => {
      const armGroup = new THREE.Group();
      // Shoulder & Bicep
      const upperArmGeo = new THREE.CylinderGeometry(0.065, 0.06, 0.26, 12);
      const upperArm = new THREE.Mesh(upperArmGeo, matShirt);
      upperArm.position.set(0, -0.12, 0);
      upperArm.castShadow = true;
      armGroup.add(upperArm);

      // Forearm
      const forearmGeo = new THREE.CylinderGeometry(0.058, 0.052, 0.24, 12);
      const forearm = new THREE.Mesh(forearmGeo, matSkin);
      forearm.position.set(0, -0.34, 0);
      forearm.castShadow = true;
      armGroup.add(forearm);

      // Hand / Leather Glove
      const handGeo = new THREE.SphereGeometry(0.055, 10, 10);
      handGeo.scale(0.8, 1.2, 0.9);
      const hand = new THREE.Mesh(handGeo, matLeather);
      hand.position.set(0, -0.47, 0);
      armGroup.add(hand);

      // In the right hand, player holds the iconic Cursed Golden Idol from Temple Run!
      if (!isLeft) {
        const idolGroup = new THREE.Group();
        const idolGeo = new THREE.CylinderGeometry(0.05, 0.065, 0.14, 12);
        const idolMat = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          emissive: 0x997700,
          emissiveIntensity: 0.7,
          metalness: 0.92,
          roughness: 0.2
        });
        const idolMesh = new THREE.Mesh(idolGeo, idolMat);
        idolGroup.add(idolMesh);

        // Sun-god crest headdress
        const crestGeo = new THREE.ConeGeometry(0.08, 0.07, 6);
        const crest = new THREE.Mesh(crestGeo, idolMat);
        crest.position.y = 0.08;
        crest.rotation.x = Math.PI;
        idolGroup.add(crest);

        // Piercing Emerald Green Glowing Eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), eyeMat);
        leftEye.position.set(-0.025, 0.02, 0.055);
        const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), eyeMat);
        rightEye.position.set(0.025, 0.02, 0.055);
        idolGroup.add(leftEye);
        idolGroup.add(rightEye);

        idolGroup.position.set(0, -0.45, 0.08);
        idolGroup.rotation.x = -0.3;
        armGroup.add(idolGroup);
      }

      return armGroup;
    };

    this.playerLeftArm = createArm(true) as unknown as THREE.Mesh;
    this.playerLeftArm.position.set(-0.31, 1.18, 0);
    this.playerGroup.add(this.playerLeftArm);

    this.playerRightArm = createArm(false) as unknown as THREE.Mesh;
    this.playerRightArm.position.set(0.31, 1.18, 0);
    this.playerGroup.add(this.playerRightArm);

    // 4. Detailed Rounded Legs & Laced Climbing Boots
    const createLeg = (isLeft: boolean) => {
      const legGroup = new THREE.Group();
      // Thigh
      const thighGeo = new THREE.CylinderGeometry(0.088, 0.075, 0.32, 12);
      const thigh = new THREE.Mesh(thighGeo, matPants);
      thigh.position.set(0, -0.15, 0);
      thigh.castShadow = true;
      legGroup.add(thigh);

      // Shin / Calf
      const calfGeo = new THREE.CylinderGeometry(0.075, 0.068, 0.3, 12);
      const calf = new THREE.Mesh(calfGeo, matPants);
      calf.position.set(0, -0.42, 0);
      calf.castShadow = true;
      legGroup.add(calf);

      // Sturdy Leather Hiking Boot with Sole
      const bootGroup = new THREE.Group();
      const bootAnkleGeo = new THREE.CylinderGeometry(0.072, 0.075, 0.14, 12);
      const bootAnkle = new THREE.Mesh(bootAnkleGeo, matBoots);
      bootGroup.add(bootAnkle);

      const bootToeGeo = new THREE.BoxGeometry(0.15, 0.11, 0.22);
      const bootToe = new THREE.Mesh(bootToeGeo, matBoots);
      bootToe.position.set(0, -0.04, 0.05);
      bootGroup.add(bootToe);

      const bootSoleGeo = new THREE.BoxGeometry(0.16, 0.03, 0.24);
      const bootSole = new THREE.Mesh(bootSoleGeo, new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.95 }));
      bootSole.position.set(0, -0.09, 0.05);
      bootGroup.add(bootSole);

      bootGroup.position.set(0, -0.58, 0);
      legGroup.add(bootGroup);

      return legGroup;
    };

    this.playerLeftLeg = createLeg(true) as unknown as THREE.Mesh;
    this.playerLeftLeg.position.set(-0.13, 0.74, 0);
    this.playerGroup.add(this.playerLeftLeg);

    this.playerRightLeg = createLeg(false) as unknown as THREE.Mesh;
    this.playerRightLeg.position.set(0.13, 0.74, 0);
    this.playerGroup.add(this.playerRightLeg);

    // Protective Emerald Shield Bubble (Hidden by default)
    const shieldGeo = new THREE.SphereGeometry(1.22, 32, 32);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.set(0, 1.0, 0);
    this.shieldMesh.visible = false;
    this.playerGroup.add(this.shieldMesh);

    // Golden Wings (Turbo Boost Artifact)
    this.wingsGroup = new THREE.Group();
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(0.9, 0.4);
    wingShape.lineTo(0.7, 0.1);
    wingShape.lineTo(1.1, 0.2);
    wingShape.lineTo(0.6, -0.2);
    wingShape.lineTo(0.8, -0.3);
    wingShape.lineTo(0, -0.15);
    wingShape.closePath();

    const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 });
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xff9900,
      emissiveIntensity: 0.6,
      metalness: 0.85,
      roughness: 0.2
    });

    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.scale.set(-1, 1, 1);
    leftWing.position.set(-0.15, 0.1, -0.15);
    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.set(0.15, 0.1, -0.15);

    this.wingsGroup.add(leftWing);
    this.wingsGroup.add(rightWing);
    this.wingsGroup.position.set(0, 1.1, 0);
    this.wingsGroup.visible = false;
    this.playerGroup.add(this.wingsGroup);

    this.scene.add(this.playerGroup);
  }

  private createDemonMonkeys() {
    this.monkeyPackGroup = new THREE.Group();

    const monkeyFurTex = templeRunTextures.getDemonMonkeyFurTexture();
    const matFur = new THREE.MeshStandardMaterial({
      map: monkeyFurTex,
      color: 0x181414,
      roughness: 0.92,
      metalness: 0.08
    });
    const matDemonSkin = new THREE.MeshStandardMaterial({ color: 0x221a18, roughness: 0.7 });
    const matGlowEyes = new THREE.MeshBasicMaterial({ color: 0xff1a00 });
    const matFangs = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.25, metalness: 0.2 });
    const matHorns = new THREE.MeshStandardMaterial({ color: 0x0a0505, roughness: 0.5, metalness: 0.3 });

    // Spawn 3 Chasing Demon Apes (1 Huge Alpha Center, 2 Pack Followers)
    const offsets = [
      { x: 0, z: 0, scale: 1.25, isAlpha: true },
      { x: -1.2, z: 0.75, scale: 0.95, isAlpha: false },
      { x: 1.2, z: 0.75, scale: 0.95, isAlpha: false }
    ];

    offsets.forEach((cfg) => {
      const ape = new THREE.Group();
      ape.scale.set(cfg.scale, cfg.scale, cfg.scale);

      // Hulking Muscular Torso (Dual Sphere & Cylinder anatomy)
      const torsoGroup = new THREE.Group();
      const chestGeo = new THREE.SphereGeometry(0.46, 16, 16);
      chestGeo.scale(1.2, 0.95, 1.0);
      const chest = new THREE.Mesh(chestGeo, matFur);
      chest.position.set(0, 0.68, 0);
      chest.castShadow = true;
      torsoGroup.add(chest);

      const bellyGeo = new THREE.SphereGeometry(0.38, 14, 14);
      const belly = new THREE.Mesh(bellyGeo, matDemonSkin);
      belly.position.set(0, 0.45, 0.1);
      belly.scale.set(0.9, 0.85, 0.8);
      torsoGroup.add(belly);

      // Snarling Demon Ape Head
      const headGroup = new THREE.Group();
      const skullGeo = new THREE.SphereGeometry(0.3, 16, 16);
      skullGeo.scale(1.0, 0.9, 1.15);
      const skull = new THREE.Mesh(skullGeo, matFur);
      headGroup.add(skull);

      // Protruding demon muzzle / jaw
      const muzzleGeo = new THREE.BoxGeometry(0.32, 0.24, 0.28);
      const muzzle = new THREE.Mesh(muzzleGeo, matDemonSkin);
      muzzle.position.set(0, -0.08, -0.22);
      headGroup.add(muzzle);

      // Piercing Glowing Eyes
      const eyeGeo = new THREE.SphereGeometry(0.065, 10, 10);
      const leftEye = new THREE.Mesh(eyeGeo, matGlowEyes);
      leftEye.position.set(-0.13, 0.07, -0.26);
      headGroup.add(leftEye);

      const rightEye = new THREE.Mesh(eyeGeo, matGlowEyes);
      rightEye.position.set(0.13, 0.07, -0.26);
      headGroup.add(rightEye);

      // Vicious curved sabre fangs
      const createFang = (x: number) => {
        const fangGeo = new THREE.ConeGeometry(0.038, 0.18, 8);
        const fang = new THREE.Mesh(fangGeo, matFangs);
        fang.rotation.x = Math.PI - 0.2;
        fang.position.set(x, -0.16, -0.32);
        return fang;
      };
      headGroup.add(createFang(-0.09));
      headGroup.add(createFang(0.09));

      // Menacing Ram / Demon Horns for Alpha Ape
      if (cfg.isAlpha) {
        const hornGeo = new THREE.ConeGeometry(0.08, 0.42, 10);
        const hornL = new THREE.Mesh(hornGeo, matHorns);
        hornL.position.set(-0.24, 0.28, -0.05);
        hornL.rotation.z = 0.65;
        hornL.rotation.x = -0.35;
        headGroup.add(hornL);

        const hornR = new THREE.Mesh(hornGeo, matHorns);
        hornR.position.set(0.24, 0.28, -0.05);
        hornR.rotation.z = -0.65;
        hornR.rotation.x = -0.35;
        headGroup.add(hornR);
      }

      headGroup.position.set(0, 1.1, 0.08);
      torsoGroup.add(headGroup);
      ape.add(torsoGroup);

      // Massive Knuckle-Walking Gorilla Arms with Curved Shoulders
      const createApeArm = (isLeft: boolean) => {
        const armGroup = new THREE.Group();
        const side = isLeft ? -1 : 1;

        // Shoulder ball
        const shoulderGeo = new THREE.SphereGeometry(0.18, 12, 12);
        const shoulder = new THREE.Mesh(shoulderGeo, matFur);
        armGroup.add(shoulder);

        // Bicep
        const bicepGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.44, 12);
        const bicep = new THREE.Mesh(bicepGeo, matFur);
        bicep.position.set(0, -0.22, 0);
        armGroup.add(bicep);

        // Massive Forearm
        const forearmGeo = new THREE.CylinderGeometry(0.15, 0.12, 0.46, 12);
        const forearm = new THREE.Mesh(forearmGeo, matFur);
        forearm.position.set(0, -0.58, -0.08);
        forearm.rotation.x = -0.25;
        armGroup.add(forearm);

        // Clenched Knuckle Fist
        const fistGeo = new THREE.SphereGeometry(0.14, 10, 10);
        fistGeo.scale(1.1, 0.8, 1.2);
        const fist = new THREE.Mesh(fistGeo, matDemonSkin);
        fist.position.set(0, -0.85, -0.14);
        armGroup.add(fist);

        armGroup.position.set(side * 0.48, 0.72, -0.08);
        armGroup.rotation.x = -0.4;
        return armGroup;
      };

      ape.add(createApeArm(true));
      ape.add(createApeArm(false));

      // Muscular Crouched Legs
      const createApeLeg = (isLeft: boolean) => {
        const legGroup = new THREE.Group();
        const side = isLeft ? -1 : 1;
        const thighGeo = new THREE.CylinderGeometry(0.15, 0.12, 0.35, 12);
        const thigh = new THREE.Mesh(thighGeo, matFur);
        thigh.position.set(0, -0.16, 0);
        legGroup.add(thigh);

        const footGeo = new THREE.BoxGeometry(0.18, 0.12, 0.28);
        const foot = new THREE.Mesh(footGeo, matDemonSkin);
        foot.position.set(0, -0.36, 0.06);
        legGroup.add(foot);

        legGroup.position.set(side * 0.28, 0.4, 0.15);
        return legGroup;
      };

      ape.add(createApeLeg(true));
      ape.add(createApeLeg(false));

      ape.position.set(cfg.x, 0, cfg.z);
      this.monkeyPackGroup.add(ape);
    });

    this.scene.add(this.monkeyPackGroup);
  }


  private initInitialTrack() {
    this.segments = [];
    this.segmentCounter = 0;
    this.currentSegmentId = 0;
    this.corridorStepCount = 0;
    this.currentCorridorTargetLength = 2; // Opening straight has 2 segments before the first turn
    this.lastSegmentEndPos.set(0, 0, 0);
    this.lastSegmentDirection.set(0, 0, -1);
    this.lastSegmentRotationY = 0;

    // 1. Initial Grand Temple Portal Gateway
    this.spawnGreatTemplePortal();

    // 2. Opening Runway (Straight from the Aztec temple doorway)
    this.spawnSegment('straight');

    // 3. Opening Jump Hurdle (Mossy tree trunk with golden coin arc)
    this.spawnSegment('jump_trunk');

    // 4. Iconic First Corner (Turn right at ~32m, exactly matching the classic Temple Run 1 opening!)
    this.spawnSegment('turn_right');

    // 5. Populate subsequent corridors up to maxActiveSegments ahead
    this.corridorStepCount = 0;
    this.currentCorridorTargetLength = 3;
    while (this.segments.length < this.maxActiveSegments) {
      this.spawnNextMapSegment();
    }
  }

  private spawnGreatTemplePortal() {
    if (this.portalGroup) {
      this.scene.remove(this.portalGroup);
      this.portalGroup = null;
    }

    const portalGroup = new THREE.Group();
    portalGroup.position.set(0, 0, 4);

    // Left & Right Giant Ancient Pillars
    const pGeo = new THREE.BoxGeometry(1.6, 7.5, 1.6);
    const leftPillar = new THREE.Mesh(pGeo, this.matCarvedPillar);
    leftPillar.position.set(-3.2, 3.5, 0);
    leftPillar.castShadow = true;
    portalGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(pGeo, this.matCarvedPillar);
    rightPillar.position.set(3.2, 3.5, 0);
    rightPillar.castShadow = true;
    portalGroup.add(rightPillar);

    // Massive Stone Lintel Beam
    const lintelGeo = new THREE.BoxGeometry(8.2, 1.6, 2.0);
    const lintel = new THREE.Mesh(lintelGeo, this.matCarvedPillar);
    lintel.position.set(0, 7.5, 0);
    lintel.castShadow = true;
    portalGroup.add(lintel);

    // Hanging Jungle Ivy Vines
    for (let v = -2; v <= 2; v++) {
      const vine = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 3.5, 6), this.matVineLeaves);
      vine.position.set(v * 1.2, 5.0, 0);
      portalGroup.add(vine);
    }

    this.portalGroup = portalGroup;
    this.scene.add(portalGroup);
  }

  private spawnNextMapSegment() {
    // If we reached the end of the corridor, spawn a mandatory 90-degree Corner Turn or T-Junction Fork!
    if (this.corridorStepCount >= this.currentCorridorTargetLength) {
      const turnRand = Math.random();
      let turnType: PathSegment['type'] = 'turn_left';
      if (turnRand < 0.38) {
        turnType = 'turn_left';
      } else if (turnRand < 0.76) {
        turnType = 'turn_right';
      } else {
        turnType = 't_split';
      }

      this.spawnSegment(turnType);
      this.corridorStepCount = 0;
      this.currentCorridorTargetLength = 2 + Math.floor(Math.random() * 3); // 2, 3, or 4 segments (32-64m per corridor)
      return;
    }

    // Inside a corridor: spawn authentic classic Temple Run obstacle & bridge segments
    const corridorHazards: PathSegment['type'][] = [
      'jump_trunk',
      'slide_arch',
      'wood_bridge',
      'chasm_gap',
      'fire_trap',
      'straight'
    ];

    const chosenType = corridorHazards[Math.floor(Math.random() * corridorHazards.length)];
    this.spawnSegment(chosenType);
    this.corridorStepCount++;
  }

  private spawnSegment(type: PathSegment['type']) {
    this.segmentCounter++;
    const segGroup = new THREE.Group();
    const pos = this.lastSegmentEndPos.clone();
    const dir = this.lastSegmentDirection.clone();
    const rotY = this.lastSegmentRotationY;

    segGroup.position.copy(pos);
    segGroup.rotation.y = rotY;

    const obstacles: PathSegment['obstacles'] = [];
    const coins: PathSegment['coins'] = [];
    let powerupObj: PathSegment['powerup'] | undefined;

    const roadWidth = 4.4;
    const roadLen = this.segmentLength;
    let cornerCenterWorld: THREE.Vector3 | undefined;

    // 1. Road Viaduct Base Floor Mesh
    const floorMat = (type === 'wood_bridge') ? this.matWoodBridge : this.matStoneRoad;
    const floorGeo = new THREE.BoxGeometry(roadWidth, 0.8, roadLen);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, -0.4, -roadLen / 2);
    floorMesh.receiveShadow = true;
    segGroup.add(floorMesh);

    // 2. Viaduct Heavy Stone Support Pier down into Canyon
    const pierGeo = new THREE.BoxGeometry(3.6, 14.0, 3.6);
    const pier = new THREE.Mesh(pierGeo, this.matStoneWall);
    pier.position.set(0, -7.4, -roadLen / 2);
    segGroup.add(pier);

    // 3. Side Stone Battlements / Parapets (Unless wooden bridge)
    if (type !== 'wood_bridge') {
      if (type === 'turn_left') {
        // Left side opens up for the 90-degree corner: wall only extends along approach
        const approachLen = roadLen - roadWidth;
        const leftWallGeo = new THREE.BoxGeometry(0.55, 1.2, approachLen);
        const leftWall = new THREE.Mesh(leftWallGeo, this.matStoneWall);
        leftWall.position.set(-roadWidth / 2 - 0.28, 0.45, -approachLen / 2);
        leftWall.castShadow = true;
        segGroup.add(leftWall);

        // Right side runs full length to the dead-end back corner
        const rightWallGeo = new THREE.BoxGeometry(0.55, 1.2, roadLen);
        const rightWall = new THREE.Mesh(rightWallGeo, this.matStoneWall);
        rightWall.position.set(roadWidth / 2 + 0.28, 0.45, -roadLen / 2);
        rightWall.castShadow = true;
        segGroup.add(rightWall);
      } else if (type === 'turn_right') {
        // Right side opens up for the 90-degree corner: wall only extends along approach
        const approachLen = roadLen - roadWidth;
        const rightWallGeo = new THREE.BoxGeometry(0.55, 1.2, approachLen);
        const rightWall = new THREE.Mesh(rightWallGeo, this.matStoneWall);
        rightWall.position.set(roadWidth / 2 + 0.28, 0.45, -approachLen / 2);
        rightWall.castShadow = true;
        segGroup.add(rightWall);

        // Left side runs full length to the dead-end back corner
        const leftWallGeo = new THREE.BoxGeometry(0.55, 1.2, roadLen);
        const leftWall = new THREE.Mesh(leftWallGeo, this.matStoneWall);
        leftWall.position.set(-roadWidth / 2 - 0.28, 0.45, -roadLen / 2);
        leftWall.castShadow = true;
        segGroup.add(leftWall);
      } else if (type === 't_split') {
        // Both left and right corridors open up for the T-junction
        const approachLen = roadLen - roadWidth;
        const leftWallGeo = new THREE.BoxGeometry(0.55, 1.2, approachLen);
        const leftWall = new THREE.Mesh(leftWallGeo, this.matStoneWall);
        leftWall.position.set(-roadWidth / 2 - 0.28, 0.45, -approachLen / 2);
        leftWall.castShadow = true;
        segGroup.add(leftWall);

        const rightWallGeo = new THREE.BoxGeometry(0.55, 1.2, approachLen);
        const rightWall = new THREE.Mesh(rightWallGeo, this.matStoneWall);
        rightWall.position.set(roadWidth / 2 + 0.28, 0.45, -approachLen / 2);
        rightWall.castShadow = true;
        segGroup.add(rightWall);
      } else {
        const wallGeo = new THREE.BoxGeometry(0.55, 1.2, roadLen);
        const leftWall = new THREE.Mesh(wallGeo, this.matStoneWall);
        leftWall.position.set(-roadWidth / 2 - 0.28, 0.45, -roadLen / 2);
        leftWall.castShadow = true;
        segGroup.add(leftWall);

        const rightWall = new THREE.Mesh(wallGeo, this.matStoneWall);
        rightWall.position.set(roadWidth / 2 + 0.28, 0.45, -roadLen / 2);
        rightWall.castShadow = true;
        segGroup.add(rightWall);
      }
    }

    // 4. Scenery: Left & Right Massive Cliff Mountains along the Ravine (Keep turn exit unobstructed)
    if (this.segmentCounter % 2 === 0) {
      const cliffGeo = new THREE.BoxGeometry(16, 24, roadLen);
      if (type !== 'turn_left' && type !== 't_split') {
        const leftCliff = new THREE.Mesh(cliffGeo, this.matCliffRock);
        leftCliff.position.set(-roadWidth / 2 - 14.0, 4.0, -roadLen / 2);
        segGroup.add(leftCliff);
      }

      if (type !== 'turn_right' && type !== 't_split') {
        const rightCliff = new THREE.Mesh(cliffGeo, this.matCliffRock);
        rightCliff.position.set(roadWidth / 2 + 14.0, 4.0, -roadLen / 2);
        segGroup.add(rightCliff);
      }
    }

    // 5. Decorative Ancient Arches & Torches (Every 3 straight segments)
    if (type === 'straight' && this.segmentCounter % 3 === 0) {
      const archPillarGeo = new THREE.BoxGeometry(0.9, 4.2, 0.9);
      const archTopGeo = new THREE.BoxGeometry(roadWidth + 1.8, 0.9, 1.1);

      const pLeft = new THREE.Mesh(archPillarGeo, this.matCarvedPillar);
      pLeft.position.set(-roadWidth / 2 - 0.5, 2.0, -roadLen / 2);
      segGroup.add(pLeft);

      const pRight = new THREE.Mesh(archPillarGeo, this.matCarvedPillar);
      pRight.position.set(roadWidth / 2 + 0.5, 2.0, -roadLen / 2);
      segGroup.add(pRight);

      const pTop = new THREE.Mesh(archTopGeo, this.matCarvedPillar);
      pTop.position.set(0, 4.2, -roadLen / 2);
      segGroup.add(pTop);
    }

    // 6. Obstacles & 90-Degree Corner Turns
    if (type === 'turn_left' || type === 'turn_right') {
      const turnDir = type === 'turn_left' ? 'left' : 'right';

      // Solid Corner Platform spanning the turn intersection
      const cornerGeo = new THREE.BoxGeometry(roadWidth + 4.0, 0.8, roadWidth + 4.0);
      const cornerFloor = new THREE.Mesh(cornerGeo, this.matStoneRoad);
      cornerFloor.position.set(0, -0.4, -roadLen + roadWidth / 2);
      cornerFloor.receiveShadow = true;
      segGroup.add(cornerFloor);

      // Glowing Pavement Decals showing Aztec Turn Arrow approaching the corner
      const turnDecMat = turnDir === 'left' ? this.matTurnPavementLeft : this.matTurnPavementRight;
      for (const pz of [-roadLen + 11.0, -roadLen + 5.5]) {
        const decGeo = new THREE.PlaneGeometry(3.6, 3.6);
        const decMesh = new THREE.Mesh(decGeo, turnDecMat);
        decMesh.rotation.x = -Math.PI / 2;
        decMesh.position.set(0, 0.02, pz);
        segGroup.add(decMesh);
      }

      // Ancient Totem Pillars at Corner Outer Edge
      const pillarGeo = new THREE.BoxGeometry(1.4, 6.0, 1.4);
      const cornerPillar = new THREE.Mesh(pillarGeo, this.matCarvedPillar);
      const px = turnDir === 'left' ? roadWidth / 2 + 1.2 : -roadWidth / 2 - 1.2;
      cornerPillar.position.set(px, 2.8, -roadLen + 1.5);
      cornerPillar.castShadow = true;
      segGroup.add(cornerPillar);

      // Dead-End Back Wall on the Straight Continuation
      const backWallGeo = new THREE.BoxGeometry(roadWidth + 2.5, 4.8, 1.4);
      const backWall = new THREE.Mesh(backWallGeo, this.matCarvedPillar);
      backWall.position.set(0, 2.0, -roadLen - 0.7);
      backWall.castShadow = true;
      segGroup.add(backWall);

      // Dedicated Wall Obstacle trigger mesh (transparent material with visible=true so Box3 computes world bounds)
      const wallTriggerGeo = new THREE.BoxGeometry(roadWidth + 3.0, 5.0, 2.0);
      const wallTriggerMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
      const wallTrigger = new THREE.Mesh(wallTriggerGeo, wallTriggerMat);
      wallTrigger.position.set(0, 2.0, -roadLen - 0.5);
      wallTrigger.visible = true;
      segGroup.add(wallTrigger);
      obstacles.push({ type: 'wall', box: new THREE.Box3(), mesh: wallTrigger });

      // Ancient Stone Arrow Signpost Warning of Turn Ahead
      const signGroup = new THREE.Group();
      const signPoleGeo = new THREE.CylinderGeometry(0.16, 0.2, 3.2, 8);
      const signPole = new THREE.Mesh(signPoleGeo, this.matStoneWall);
      signPole.position.y = 1.6;
      signGroup.add(signPole);

      const signBoardGeo = new THREE.BoxGeometry(2.2, 1.2, 0.2);
      const signBoard = new THREE.Mesh(signBoardGeo, this.matCarvedPillar);
      signBoard.position.y = 2.4;
      signGroup.add(signBoard);

      const arrowMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffaa00,
        emissiveIntensity: 1.4,
        roughness: 0.3
      });
      const arrowGeo = new THREE.ConeGeometry(0.5, 0.7, 3);
      arrowGeo.rotateZ(turnDir === 'left' ? Math.PI / 2 : -Math.PI / 2);
      const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
      arrowMesh.position.set(0, 2.4, 0.14);
      signGroup.add(arrowMesh);

      const signSideX = turnDir === 'left' ? -roadWidth / 2 - 1.2 : roadWidth / 2 + 1.2;
      signGroup.position.set(signSideX, 0, -roadLen + 4.5);
      segGroup.add(signGroup);

      // Compute World Coordinates for Corner Intersection Center
      const localCornerVec = new THREE.Vector3(0, 0, -roadLen + roadWidth / 2).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
      cornerCenterWorld = pos.clone().add(localCornerVec);

    } else if (type === 't_split') {
      // Solid Wide Cross Platform spanning the T intersection
      const splitGeo = new THREE.BoxGeometry(roadWidth + 8.0, 0.8, roadWidth + 4.0);
      const splitFloor = new THREE.Mesh(splitGeo, this.matStoneRoad);
      splitFloor.position.set(0, -0.4, -roadLen + roadWidth / 2);
      splitFloor.receiveShadow = true;
      segGroup.add(splitFloor);

      // Dead-End Central Temple Altar Shrine dead ahead
      const altarGeo = new THREE.BoxGeometry(roadWidth + 1.6, 5.5, 1.8);
      const altar = new THREE.Mesh(altarGeo, this.matCarvedPillar);
      altar.position.set(0, 2.3, -roadLen - 0.9);
      altar.castShadow = true;
      segGroup.add(altar);

      // Two flaming torches on the central altar
      for (const side of [-1, 1]) {
        const torchStand = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 2.2, 8), this.matStoneWall);
        torchStand.position.set(side * (roadWidth / 2 - 0.2), 2.2, -roadLen - 0.4);
        segGroup.add(torchStand);

        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.65, 8), this.matFireEmber);
        flame.position.set(side * (roadWidth / 2 - 0.2), 3.4, -roadLen - 0.4);
        segGroup.add(flame);
      }

      // Dedicated Wall Obstacle trigger mesh for running straight into the altar
      const wallTriggerGeo = new THREE.BoxGeometry(roadWidth + 2.5, 5.0, 2.0);
      const wallTriggerMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
      const wallTrigger = new THREE.Mesh(wallTriggerGeo, wallTriggerMat);
      wallTrigger.position.set(0, 2.0, -roadLen - 0.6);
      wallTrigger.visible = true;
      segGroup.add(wallTrigger);
      obstacles.push({ type: 'wall', box: new THREE.Box3(), mesh: wallTrigger });

      // Glowing Pavement Decals showing T-Split Arrows ◀ 🔶 ▶
      for (const pz of [-roadLen + 11.0, -roadLen + 5.5]) {
        const decGeo = new THREE.PlaneGeometry(3.6, 3.6);
        const decMesh = new THREE.Mesh(decGeo, this.matTurnPavementSplit);
        decMesh.rotation.x = -Math.PI / 2;
        decMesh.position.set(0, 0.02, pz);
        segGroup.add(decMesh);
      }

      // Left and Right Illuminated Stone Totems with Warning Signs
      for (const dir of ['left', 'right'] as const) {
        const signGroup = new THREE.Group();
        const signPole = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 3.2, 8), this.matStoneWall);
        signPole.position.y = 1.6;
        signGroup.add(signPole);

        const signBoard = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 0.2), this.matCarvedPillar);
        signBoard.position.y = 2.4;
        signGroup.add(signBoard);

        const arrowMat = new THREE.MeshStandardMaterial({
          color: 0x38ef7d,
          emissive: 0x10b981,
          emissiveIntensity: 1.6,
          roughness: 0.2
        });
        const arrowGeo = new THREE.ConeGeometry(0.5, 0.7, 3);
        arrowGeo.rotateZ(dir === 'left' ? Math.PI / 2 : -Math.PI / 2);
        const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
        arrowMesh.position.set(0, 2.4, 0.14);
        signGroup.add(arrowMesh);

        const sx = dir === 'left' ? -roadWidth / 2 - 1.4 : roadWidth / 2 + 1.4;
        signGroup.position.set(sx, 0, -roadLen + 4.5);
        segGroup.add(signGroup);
      }

      // Compute World Coordinates for Corner Intersection Center
      const localCornerVec = new THREE.Vector3(0, 0, -roadLen + roadWidth / 2).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
      cornerCenterWorld = pos.clone().add(localCornerVec);

    } else if (type === 'jump_trunk') {
      // Fallen Mossy Tree Trunk (Leap over waist-height ~0.55m)
      const trunkGeo = new THREE.CylinderGeometry(0.52, 0.52, roadWidth - 0.2, 16);
      const trunk = new THREE.Mesh(trunkGeo, this.matStoneWall);
      trunk.position.set(0, 0.45, -roadLen / 2);
      trunk.rotation.z = Math.PI / 2;
      trunk.castShadow = true;
      segGroup.add(trunk);

      // Lush green moss on top of trunk
      const mossGeo = new THREE.BoxGeometry(roadWidth - 0.4, 0.15, 0.7);
      const mossMesh = new THREE.Mesh(mossGeo, this.matVineLeaves);
      mossMesh.position.set(0, 0.9, -roadLen / 2);
      segGroup.add(mossMesh);

      // Left & Right Distinct Jump Warning Totem Signs (▲ SPRINGEN ▲)
      for (const side of [-1, 1]) {
        const jumpSignGeo = new THREE.BoxGeometry(0.4, 1.6, 1.4);
        const jumpSign = new THREE.Mesh(jumpSignGeo, this.matJumpWarning);
        jumpSign.position.set(side * (roadWidth / 2 - 0.15), 1.1, -roadLen / 2);
        jumpSign.castShadow = true;
        segGroup.add(jumpSign);

        // Warning Brazier on top of sign
        const brazier = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.45, 6), this.matFireEmber);
        brazier.position.set(side * (roadWidth / 2 - 0.15), 2.05, -roadLen / 2);
        segGroup.add(brazier);
      }

      const box = new THREE.Box3().setFromObject(trunk);
      box.min.y = 0;
      box.max.y = 0.95;
      obstacles.push({ type: 'trunk', box, mesh: trunk });

      // Classic Temple Run Jump Coin Arch (5 coins rising in a beautiful parabolic arc!)
      const coinGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.09, 24);
      coinGeo.rotateX(Math.PI / 2);
      const arcZ = -roadLen / 2;
      for (let c = -2; c <= 2; c++) {
        const cz = arcZ + c * 1.8;
        const cy = 2.2 - (c * c) * 0.35;
        const coinMesh = new THREE.Mesh(coinGeo, this.matGoldCoin);
        coinMesh.position.set(0, cy, cz);
        coinMesh.castShadow = true;
        segGroup.add(coinMesh);

        const localVec = new THREE.Vector3(0, cy, cz).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
        const worldPos = pos.clone().add(localVec);
        coins.push({
          mesh: coinMesh,
          worldPos,
          collected: false,
          value: 1
        });
      }

    } else if (type === 'slide_arch') {
      // Low Hanging Spiked Stone Portal / Lintel (Slide Underneath, clearance 0.95m)
      const archPillarGeo = new THREE.BoxGeometry(0.9, 4.8, 0.9);
      const pLeft = new THREE.Mesh(archPillarGeo, this.matCarvedPillar);
      pLeft.position.set(-roadWidth / 2 + 0.1, 2.2, -roadLen / 2);
      pLeft.castShadow = true;
      segGroup.add(pLeft);

      const pRight = new THREE.Mesh(archPillarGeo, this.matCarvedPillar);
      pRight.position.set(roadWidth / 2 - 0.1, 2.2, -roadLen / 2);
      pRight.castShadow = true;
      segGroup.add(pRight);

      // Heavy carved overhead lintel beam spanning road
      const lintelGeo = new THREE.BoxGeometry(roadWidth + 0.8, 1.8, 1.2);
      const lintel = new THREE.Mesh(lintelGeo, this.matCarvedPillar);
      lintel.position.set(0, 2.2, -roadLen / 2);
      lintel.castShadow = true;
      segGroup.add(lintel);

      // Distinct Slide Hazard Warning Banner on the lintel face (▼ BUKKEN ▼)
      const hazardPlateGeo = new THREE.BoxGeometry(roadWidth - 0.4, 0.9, 1.3);
      const hazardPlate = new THREE.Mesh(hazardPlateGeo, this.matSlideWarning);
      hazardPlate.position.set(0, 2.15, -roadLen / 2);
      segGroup.add(hazardPlate);

      // Hanging ancient stalactites/spikes coming down to y=1.05m
      for (let s = -3; s <= 3; s++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 6), this.matStoneWall);
        spike.rotation.x = Math.PI;
        spike.position.set(s * 0.55, 1.15, -roadLen / 2);
        segGroup.add(spike);
      }

      const box = new THREE.Box3().setFromObject(lintel);
      box.min.y = 0.95;
      obstacles.push({ type: 'arch', box, mesh: lintel });

      // Low slide coins flat on the pavement (under the arch)
      const coinGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.09, 24);
      coinGeo.rotateX(Math.PI / 2);
      for (let c = -2; c <= 2; c++) {
        const cz = -roadLen / 2 + c * 1.8;
        const cy = 0.35;
        const coinMesh = new THREE.Mesh(coinGeo, this.matGoldCoin);
        coinMesh.position.set(0, cy, cz);
        coinMesh.castShadow = true;
        segGroup.add(coinMesh);

        const localVec = new THREE.Vector3(0, cy, cz).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
        const worldPos = pos.clone().add(localVec);
        coins.push({
          mesh: coinMesh,
          worldPos,
          collected: false,
          value: 1
        });
      }

    } else if (type === 'fire_trap') {
      // Fire Flame Jet Emitter
      const fireBaseGeo = new THREE.BoxGeometry(roadWidth - 0.6, 0.4, 1.8);
      const fireBase = new THREE.Mesh(fireBaseGeo, this.matFireEmber);
      fireBase.position.set(0, 0.2, -roadLen / 2);
      segGroup.add(fireBase);

      const box = new THREE.Box3().setFromObject(fireBase);
      obstacles.push({ type: 'fire', box, mesh: fireBase });

    } else if (type === 'chasm_gap') {
      // Missing bridge section (two floor sections with chasm gap in between)
      floorMesh.scale.set(1, 1, 0.32);
      floorMesh.position.set(0, -0.4, -roadLen * 0.16);

      const backFloor = floorMesh.clone();
      backFloor.position.set(0, -0.4, -roadLen * 0.84);
      segGroup.add(backFloor);

      // Dedicated trigger mesh representing the actual chasm void (hole) in the bridge
      const gapTriggerGeo = new THREE.BoxGeometry(roadWidth - 0.2, 3.0, roadLen * 0.4);
      const gapTriggerMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
      const gapTrigger = new THREE.Mesh(gapTriggerGeo, gapTriggerMat);
      gapTrigger.position.set(0, 0.1, -roadLen * 0.5);
      gapTrigger.visible = true;
      segGroup.add(gapTrigger);

      obstacles.push({ type: 'gap', box: new THREE.Box3(), mesh: gapTrigger });
    }

    // 7. Gold Coins in Rows Along Lanes (Detailed Chamfered 3D Aztec Medallions)
    if (type !== 'chasm_gap' && type !== 'jump_trunk' && type !== 'slide_arch') {
      const coinLane = [-this.laneWidth, 0, this.laneWidth][Math.floor(Math.random() * 3)];
      const coinGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.09, 24);
      coinGeo.rotateX(Math.PI / 2);

      for (let c = 0; c < 5; c++) {
        const coinMesh = new THREE.Mesh(coinGeo, this.matGoldCoin);
        const cz = -2.5 - c * 2.3;
        coinMesh.position.set(coinLane, 0.65, cz);
        coinMesh.castShadow = true;
        segGroup.add(coinMesh);

        // World Position Calculation
        const localVec = new THREE.Vector3(coinLane, 0.65, cz).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
        const worldPos = pos.clone().add(localVec);

        coins.push({
          mesh: coinMesh,
          worldPos,
          collected: false,
          value: 1
        });
      }
    }

    // 8. Floating 3D Artifact Powerup (Magnet, Boost, Shield, Mega Coin, Idol)
    if (Math.random() < 0.28 && type === 'straight') {
      const pTypes: ('magnet' | 'boost' | 'shield' | 'mega_coin' | 'multiplier' | 'idol')[] = [
        'magnet', 'boost', 'shield', 'mega_coin', 'multiplier', 'idol'
      ];
      const pType = pTypes[Math.floor(Math.random() * pTypes.length)];
      const pGroup = new THREE.Group();

      let pColor = 0x3b82f6; // blue magnet
      if (pType === 'boost') pColor = 0xf59e0b; // gold booster
      if (pType === 'shield') pColor = 0x10b981; // green shield
      if (pType === 'mega_coin') pColor = 0xffd700; // giant coin
      if (pType === 'multiplier') pColor = 0xa855f7; // purple star
      if (pType === 'idol') pColor = 0xeab308; // golden ankh idol

      const pGeo = new THREE.OctahedronGeometry(0.48, 0);
      const pMat = new THREE.MeshStandardMaterial({
        color: pColor,
        emissive: pColor,
        emissiveIntensity: 0.6,
        roughness: 0.2
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pGroup.add(pMesh);

      const pz = -roadLen / 2;
      pGroup.position.set(0, 1.4, pz);
      segGroup.add(pGroup);

      const localVec = new THREE.Vector3(0, 1.4, pz).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
      const worldPos = pos.clone().add(localVec);

      powerupObj = {
        type: pType,
        mesh: pGroup,
        worldPos,
        collected: false
      };
    }

    this.scene.add(segGroup);
    segGroup.updateMatrixWorld(true);

    // Compute true world-space bounding boxes for obstacles once placed in the scene
    for (const obs of obstacles) {
      obs.mesh.updateMatrixWorld(true);
      obs.box.setFromObject(obs.mesh);
    }

    const hasTurn = type === 'turn_left' || type === 'turn_right' || type === 't_split';
    const turnDirection: 'left' | 'right' | 'both' | undefined =
      type === 'turn_left' ? 'left' : type === 'turn_right' ? 'right' : type === 't_split' ? 'both' : undefined;

    const segment: PathSegment = {
      id: this.segmentCounter,
      mesh: segGroup,
      type,
      position: pos,
      direction: dir,
      rotationY: rotY,
      length: roadLen,
      hasTurn,
      turnDirection,
      cornerCenter: cornerCenterWorld,
      obstacles,
      coins,
      powerup: powerupObj
    };

    this.segments.push(segment);

    // Calculate End Coordinates for the Next Segment
    if (segment.hasTurn) {
      // Default continuation angle (for t_split, default preview continuation to left until chosen)
      const turnAngle = segment.turnDirection === 'right' ? -Math.PI / 2 : Math.PI / 2;
      this.lastSegmentRotationY += turnAngle;
      this.lastSegmentDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), turnAngle);

      // Offset end position through the 90-degree corner
      const forwardOffset = dir.clone().multiplyScalar(roadLen - roadWidth / 2);
      const sideDir = dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), turnAngle);
      const sideOffset = sideDir.multiplyScalar(roadWidth / 2);

      this.lastSegmentEndPos.add(forwardOffset).add(sideOffset);
    } else {
      this.lastSegmentEndPos.add(dir.clone().multiplyScalar(roadLen));
    }
  }

  // --- Input & Navigation Handlers ---
  public swipeLeft() {
    this.handleTurnOrLane('left');
  }

  public swipeRight() {
    this.handleTurnOrLane('right');
  }

  public swipeUp() {
    this.jump();
  }

  public swipeDown() {
    this.slide();
  }

  public handleTurnOrLane(direction: 'left' | 'right') {
    if (this.gameOver) return;

    // Check if player is approaching an active 90-degree turn or T-split
    const activeTurnSeg = this.segments.find(s => s.hasTurn && !s.turnExecuted && s.cornerCenter);
    if (activeTurnSeg && activeTurnSeg.cornerCenter) {
      const toCorner = activeTurnSeg.cornerCenter.clone().sub(this.playerPos);
      const distAhead = toCorner.dot(activeTurnSeg.direction);
      const distToCenter = this.playerPos.distanceTo(activeTurnSeg.cornerCenter);

      // If user presses the correct turn direction (or if T-split, either direction is valid!)
      const isTurnMatch = activeTurnSeg.type === 't_split' || activeTurnSeg.turnDirection === direction;
      if (isTurnMatch) {
        // Immediate turn window: within 4.8m before corner center to 2.5m past it
        if (distAhead >= -2.5 && distAhead <= 4.8 && distToCenter <= 9.0) {
          this.executeTurn(direction, activeTurnSeg);
          this.queuedTurn = null;
          return;
        }
        // Turn Queueing: if swiping while approaching the corner (up to 18m away)
        else if (distAhead > 4.8 && distAhead <= 18.0) {
          this.queuedTurn = { direction, segId: activeTurnSeg.id };
          return;
        }
      }
    }

    // Standard Lane Shift (when not triggering or queueing a turn)
    if (direction === 'left' && this.currentLane > -1) {
      this.currentLane--;
      this.targetLaneX = this.currentLane * this.laneWidth;
      templeRunAudio.playSlide();
    } else if (direction === 'right' && this.currentLane < 1) {
      this.currentLane++;
      this.targetLaneX = this.currentLane * this.laneWidth;
      templeRunAudio.playSlide();
    }
  }

  private executeTurn(direction: 'left' | 'right', seg: PathSegment) {
    seg.turnExecuted = true;
    const turnAngle = direction === 'left' ? Math.PI / 2 : -Math.PI / 2;
    this.targetRotationY += turnAngle;
    this.currentRotationY = this.targetRotationY;
    this.currentDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), turnAngle);

    // Cleanly snap player position to the corner center so they are aligned with the new corridor!
    if (seg.cornerCenter) {
      this.playerPos.copy(seg.cornerCenter);
    }
    this.currentLane = 0;
    this.targetLaneX = 0;
    this.tiltOffset = 0;
    templeRunAudio.playTurn();

    // Reset corridor counter for the newly entered corridor
    this.corridorStepCount = 0;
    this.currentCorridorTargetLength = 2 + Math.floor(Math.random() * 3);

    // If this was a T-Split, purge pre-spawned segments ahead and continue seamlessly in the chosen direction!
    if (seg.type === 't_split' && seg.cornerCenter) {
      for (let i = this.segments.length - 1; i >= 0; i--) {
        if (this.segments[i].id > seg.id) {
          this.scene.remove(this.segments[i].mesh);
          this.segments.splice(i, 1);
        }
      }

      const roadWidth = 4.4;
      this.lastSegmentDirection = this.currentDirection.clone();
      this.lastSegmentRotationY = this.targetRotationY;
      this.lastSegmentEndPos = seg.cornerCenter.clone().add(this.currentDirection.clone().multiplyScalar(roadWidth / 2));

      while (this.segments.length < this.maxActiveSegments) {
        this.spawnNextMapSegment();
      }
    }
  }

  public jump() {
    if (this.gameOver || this.isJumping) return;
    this.isJumping = true;
    this.jumpVelocity = this.jumpForce;
    this.isSliding = false;
    templeRunAudio.playJump();
  }

  public slide() {
    if (this.gameOver || this.isSliding) return;
    this.isSliding = true;
    this.slideTimer = this.slideDuration;
    this.isJumping = false;
    this.jumpY = 0;
    templeRunAudio.playSlide();
  }

  public setTilt(tilt: number) {
    this.tiltOffset = Math.max(-0.6, Math.min(0.6, tilt * 0.6));
  }

  // --- Main Update Loop ---
  private update(delta: number) {
    if (this.gameOver) return;

    const dt = Math.min(delta, 0.08);

    // Speed progression: starts slower (13.5) and ramps up smoothly with distance
    if (this.activePowerup === 'boost') {
      this.currentSpeed = Math.max(26.0, this.baseSpeed * 2.0);
    } else {
      this.currentSpeed = Math.min(this.maxSpeed, this.baseSpeed + Math.sqrt(Math.max(0, this.distance)) * 0.42);
    }

    // Advance forward movement
    const moveDist = this.currentSpeed * dt;
    this.distance += Math.round(moveDist);
    this.score += Math.round(moveDist * (this.activePowerup === 'multiplier' ? this.multiplier * 2 : this.multiplier));

    const forwardMove = this.currentDirection.clone().multiplyScalar(moveDist);
    this.playerPos.add(forwardMove);

    // Process queued turn if runner reaches the corner
    if (this.queuedTurn) {
      const targetSeg = this.segments.find(s => s.id === this.queuedTurn?.segId);
      if (targetSeg && !targetSeg.turnExecuted && targetSeg.cornerCenter) {
        const toCorner = targetSeg.cornerCenter.clone().sub(this.playerPos);
        const distAhead = toCorner.dot(targetSeg.direction);
        if (distAhead <= 4.8 && distAhead >= -2.5) {
          this.executeTurn(this.queuedTurn.direction, targetSeg);
          this.queuedTurn = null;
        } else if (distAhead < -2.5) {
          this.queuedTurn = null;
        }
      } else {
        this.queuedTurn = null;
      }
    }

    // Smooth Corner Rotation Interpolation
    this.currentRotationY = THREE.MathUtils.lerp(this.currentRotationY, this.targetRotationY, dt * 14.0);

    // Smooth Lane Shift Interpolation
    const sideDir = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.currentRotationY);
    const clampedLateralOffset = Math.max(-1.8, Math.min(1.8, this.targetLaneX + this.tiltOffset));
    const targetSideOffset = sideDir.clone().multiplyScalar(clampedLateralOffset);

    // Visual Player Position
    const visualPlayerPos = this.playerPos.clone().add(targetSideOffset);
    visualPlayerPos.y = this.jumpY;
    this.playerGroup.position.copy(visualPlayerPos);
    this.playerGroup.rotation.y = this.currentRotationY;

    // Banking lean into turns & lane shifts
    const rollAngle = (this.targetLaneX - (this.playerGroup.position.x - this.playerPos.x)) * -0.15;
    this.playerGroup.rotation.z = rollAngle;

    // Player Dynamic Torch Glow
    this.playerPointLight.position.set(visualPlayerPos.x, visualPlayerPos.y + 2.4, visualPlayerPos.z);

    // Water & Sky Sync with Player Position (Ensures no void is ever visible!)
    this.riverWater.position.x = visualPlayerPos.x;
    this.riverWater.position.z = visualPlayerPos.z;
    this.skyDome.position.copy(visualPlayerPos);
    this.waterTexture.offset.y += dt * 0.15;

    // Directional Light follow player
    this.dirLight.position.set(visualPlayerPos.x + 25, 45, visualPlayerPos.z + 20);
    this.dirLight.target.position.copy(visualPlayerPos);
    this.dirLight.target.updateMatrixWorld();

    // Jump Physics
    if (this.isJumping) {
      this.jumpVelocity += this.gravity * dt;
      this.jumpY += this.jumpVelocity * dt;
      if (this.jumpY <= 0) {
        this.jumpY = 0;
        this.isJumping = false;
        this.jumpVelocity = 0;
      }
    }

    // Slide Physics & Animation
    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
      this.playerGroup.scale.set(1.0, 0.45, 1.4);
      this.playerBody.rotation.x = 0.85;
    } else {
      this.playerGroup.scale.set(1.0, 1.0, 1.0);
      this.playerBody.rotation.x = 0;
    }

    // Running Character Limb Animation
    this.runAnimTime += dt * this.currentSpeed * 0.85;
    if (!this.isJumping && !this.isSliding) {
      const legAngle = Math.sin(this.runAnimTime) * 0.8;
      this.playerLeftLeg.rotation.x = legAngle;
      this.playerRightLeg.rotation.x = -legAngle;
      this.playerLeftArm.rotation.x = -legAngle * 0.95;
      this.playerRightArm.rotation.x = legAngle * 0.95;

      if (Math.sin(this.runAnimTime) > 0.95 && Math.random() < 0.3) {
        templeRunAudio.playFootstep();
      }
    }

    // Powerup Timers & FX
    if (this.activePowerup !== 'none') {
      this.powerupTimer -= dt;
      if (this.powerupTimer <= 0) {
        this.activePowerup = 'none';
        this.shieldMesh.visible = false;
        this.wingsGroup.visible = false;
      }
      if (this.activePowerup === 'shield') {
        this.shieldMesh.visible = true;
        this.shieldMesh.rotation.y += dt * 3.0;
      }
      if (this.activePowerup === 'boost') {
        this.wingsGroup.visible = true;
        this.wingsGroup.rotation.y = Math.sin(this.runAnimTime * 2.0) * 0.2;
      }
    }

    // Dynamic Cinematic Follow Camera
    const baseCamY = this.isSliding ? 2.9 : 3.8;
    const baseCamZ = this.isSliding ? 5.0 : 5.6;

    // Anticipate corner turn if approaching within 16m
    let cornerCamOffset = 0;
    const approachingTurn = this.segments.find(s => s.hasTurn && !s.turnExecuted && s.cornerCenter);
    if (approachingTurn && approachingTurn.cornerCenter) {
      const toCorner = approachingTurn.cornerCenter.clone().sub(this.playerPos);
      const distAhead = toCorner.dot(approachingTurn.direction);
      if (distAhead > 0 && distAhead <= 16.0) {
        const factor = (16.0 - distAhead) / 16.0;
        if (approachingTurn.turnDirection === 'left') {
          cornerCamOffset = -factor * 0.9;
        } else if (approachingTurn.turnDirection === 'right') {
          cornerCamOffset = factor * 0.9;
        }
      }
    }

    const camOffset = new THREE.Vector3(cornerCamOffset, baseCamY, baseCamZ).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.currentRotationY);
    const targetCamPos = visualPlayerPos.clone().add(camOffset);
    this.camera.position.lerp(targetCamPos, dt * 12.0);

    const camLookAt = visualPlayerPos.clone().add(new THREE.Vector3(cornerCamOffset * 0.5, 1.3, 0)).add(this.currentDirection.clone().multiplyScalar(4.5));
    this.camera.lookAt(camLookAt);

    // Update Chasing Demon Monkey Pack
    this.updateDemonMonkeys(dt, visualPlayerPos);

    // Collision Detection & Coin Collection
    this.checkCollisions(visualPlayerPos);

    // Track Buffer Management
    this.manageTrackSegments();

    // Notify UI HUD
    this.notifyStats();
  }

  private updateDemonMonkeys(dt: number, playerPos: THREE.Vector3) {
    if (this.stumbleRecoveryTimer > 0) {
      this.stumbleRecoveryTimer -= dt;
      if (this.stumbleRecoveryTimer <= 0) {
        this.monkeyTargetDistance = 4.8; // retreat back
      }
    }

    this.monkeyDistance = THREE.MathUtils.lerp(this.monkeyDistance, this.monkeyTargetDistance, dt * 3.5);
    const monkeyBehind = this.currentDirection.clone().multiplyScalar(-this.monkeyDistance);
    const targetMonkeyPos = playerPos.clone().add(monkeyBehind);
    targetMonkeyPos.y = 0;

    this.monkeyPackGroup.position.lerp(targetMonkeyPos, dt * 12.0);
    this.monkeyPackGroup.rotation.y = this.currentRotationY;

    // Periodic growl & footfall if monkeys are close
    this.monkeyRoarTimer += dt;
    if (this.monkeyDistance < 2.5 && this.monkeyRoarTimer > 2.0) {
      templeRunAudio.playMonkeyPound();
      this.monkeyRoarTimer = 0;
    }
  }

  private checkCollisions(playerPos: THREE.Vector3) {
    if (this.distance < 4.0 || this.gameOver) return; // Grace period on game start

    const playerRadius = 0.44;
    const playerHeight = this.isSliding ? 0.7 : 1.7;
    const playerBottom = playerPos.y;
    const playerTop = playerPos.y + playerHeight;

    const playerBox = new THREE.Box3(
      new THREE.Vector3(playerPos.x - playerRadius, playerBottom, playerPos.z - playerRadius),
      new THREE.Vector3(playerPos.x + playerRadius, playerTop, playerPos.z + playerRadius)
    );

    for (const seg of this.segments) {
      // Proximity check: only evaluate segments within close distance of the runner
      const segDist = playerPos.distanceTo(seg.position);
      if (segDist > this.segmentLength * 1.8) continue;

      // 1. Coins Check
      for (const coin of seg.coins) {
        if (!coin.collected) {
          coin.mesh.rotation.z += 0.06;

          const dist = playerPos.distanceTo(coin.worldPos);
          const magnetRadius = this.activePowerup === 'magnet' ? 8.5 : 1.4;

          if (dist < magnetRadius) {
            if (this.activePowerup === 'magnet') {
              coin.mesh.position.lerp(new THREE.Vector3(0, 1.0, 0), 0.25);
            }
            if (dist < 1.5) {
              coin.collected = true;
              coin.mesh.visible = false;
              const prevCoins = this.coins;
              this.coins += coin.value;
              this.score += coin.value * 100 * this.multiplier;

              // Authentic Temple Run Coin Multiplier Meter: fills every 100 coins!
              if (Math.floor(this.coins / 100) > Math.floor(prevCoins / 100)) {
                this.multiplier++;
                templeRunAudio.playPowerup();
              } else {
                templeRunAudio.playCoin();
              }
            }
          }
        }
      }

      // 2. Powerups Check
      if (seg.powerup && !seg.powerup.collected) {
        seg.powerup.mesh.rotation.y += 0.05;
        const pDist = playerPos.distanceTo(seg.powerup.worldPos);
        if (pDist < 1.7) {
          seg.powerup.collected = true;
          seg.powerup.mesh.visible = false;
          this.activatePowerup(seg.powerup.type);
        }
      }

      // 3. Obstacles Check
      for (const obs of seg.obstacles) {
        if (obs.cleared) continue;
        if (seg.turnExecuted && obs.type === 'wall') continue;

        const targetBox = obs.box.isEmpty() ? new THREE.Box3().setFromObject(obs.mesh) : obs.box;

        if (playerBox.intersectsBox(targetBox)) {
          if (obs.type === 'trunk' || obs.type === 'spikes') {
            if (this.jumpY > 0.42) {
              obs.cleared = true;
            } else {
              obs.cleared = true; // Mark cleared so stumble triggers once!
              this.handleObstacleHit('Gestruikeld over boomstam / obstakel');
            }
          } else if (obs.type === 'arch') {
            if (this.isSliding) {
              obs.cleared = true;
            } else {
              obs.cleared = true;
              this.handleFatalFall('Hoofd gestoten tegen stenen tempelboog');
              return;
            }
          } else if (obs.type === 'fire') {
            if (this.jumpY > 0.42 || this.isSliding) {
              obs.cleared = true;
            } else {
              obs.cleared = true;
              this.handleFatalFall('Verbrand door vurige tempelval');
              return;
            }
          } else if (obs.type === 'wall') {
            this.handleFatalFall('Gecrasht tegen de stenen tempelmuur (afslag gemist)');
            return;
          } else if (obs.type === 'gap') {
            if (this.jumpY < 0.4) {
              this.handleFatalFall('In de diepe rivierkloof gevallen');
              return;
            } else {
              obs.cleared = true;
            }
          }
        }
      }
    }

    // 4. Dead-End Corner Overshoot Check (Guarantees player cannot run past corner into the abyss/water)
    for (const seg of this.segments) {
      if (seg.hasTurn && !seg.turnExecuted && seg.cornerCenter) {
        const toCorner = seg.cornerCenter.clone().sub(playerPos);
        const distAhead = toCorner.dot(seg.direction);
        // If runner passed 2.2 meters beyond the corner center without turning, fatal fall!
        if (distAhead < -2.2) {
          this.handleFatalFall('In het ravijn gestort bij de tempelafslag');
          return;
        }
      }
    }

    // 5. Track Continuity Check (Prevent running off the viaduct into the river)
    let minTrackDist = Infinity;
    for (const seg of this.segments) {
      const d = playerPos.distanceTo(seg.position);
      if (d < minTrackDist) minTrackDist = d;
      if (seg.cornerCenter) {
        const cd = playerPos.distanceTo(seg.cornerCenter);
        if (cd < minTrackDist) minTrackDist = cd;
      }
    }
    if (minTrackDist > this.segmentLength * 1.5) {
      this.handleFatalFall('In de diepe rivierkloof gevallen');
    }
  }

  private activatePowerup(type: 'magnet' | 'boost' | 'shield' | 'mega_coin' | 'multiplier' | 'idol') {
    if (type === 'mega_coin') {
      this.coins += 100;
      this.score += 10000;
      templeRunAudio.playMegaCoin();
      return;
    }

    if (type === 'idol') {
      this.hasResurrectionIdol = true;
      templeRunAudio.playPowerup();
      return;
    }

    this.activePowerup = type;
    this.powerupTimer = type === 'boost' ? 5.5 : 10.0;
    templeRunAudio.playPowerup();

    if (type === 'boost') {
      templeRunAudio.playBoost();
    }
  }

  private handleObstacleHit(reason: string) {
    if (this.activePowerup === 'boost') return;

    if (this.activePowerup === 'shield') {
      this.activePowerup = 'none';
      this.shieldMesh.visible = false;
      templeRunAudio.playShieldBreak();
      return;
    }

    this.stumbleCount++;
    templeRunAudio.playStumble();

    if (this.monkeyDistance < 2.2 || this.stumbleCount >= 3) {
      this.triggerGameOver('Gegrepen door de demonische tempelapen!');
    } else {
      this.monkeyTargetDistance = 1.6;
      this.stumbleRecoveryTimer = 4.5;
    }
  }

  private handleFatalFall(reason: string) {
    if (this.activePowerup === 'boost') return;

    if (this.hasResurrectionIdol) {
      this.hasResurrectionIdol = false;
      this.jumpY = 2.5;
      templeRunAudio.playPowerup();
      return;
    }

    this.triggerGameOver(reason);
  }

  private triggerGameOver(reason: string) {
    this.gameOver = true;
    this.deathReason = reason;
    templeRunAudio.playDeath();
    templeRunAudio.stopTribalDrums();
    this.notifyStats();
  }

  private manageTrackSegments() {
    // Find current segment closest to player
    let closestSegId = this.currentSegmentId;
    let minDist = Infinity;
    for (const seg of this.segments) {
      const d = this.playerPos.distanceTo(seg.position);
      if (d < minDist) {
        minDist = d;
        closestSegId = seg.id;
      }
    }
    if (closestSegId > this.currentSegmentId) {
      this.currentSegmentId = closestSegId;
    }

    // Remove segments far behind the player (at least 2 segments behind and distance > 35m)
    while (this.segments.length > 0) {
      const first = this.segments[0];
      const dist = this.playerPos.distanceTo(first.position);
      if (first.id < this.currentSegmentId - 2 && dist > 35.0) {
        this.scene.remove(first.mesh);
        this.segments.shift();
      } else {
        break;
      }
    }

    // Always maintain active segments ahead for infinite generation in any direction
    while (this.segments.length < this.maxActiveSegments) {
      this.spawnNextMapSegment();
    }
  }

  private notifyStats() {
    // Calculate upcoming turn or split warning within 26 meters
    let turnWarning: { direction: 'left' | 'right' | 'split'; distance: number } | null = null;
    const nextTurn = this.segments.find(s => s.hasTurn && !s.turnExecuted && s.cornerCenter);
    if (nextTurn && nextTurn.cornerCenter) {
      const toCorner = nextTurn.cornerCenter.clone().sub(this.playerPos);
      const distAhead = toCorner.dot(nextTurn.direction);
      if (distAhead > 0 && distAhead <= 26.0) {
        const dir: 'left' | 'right' | 'split' =
          nextTurn.type === 't_split' ? 'split' : (nextTurn.turnDirection === 'right' ? 'right' : 'left');
        turnWarning = {
          direction: dir,
          distance: Math.round(distAhead)
        };
      }
    }

    this.onStatsUpdate({
      score: this.score,
      distance: this.distance,
      coins: this.coins,
      multiplier: this.multiplier,
      levelTheme: this.levelTheme,
      character: this.character,
      gameOver: this.gameOver,
      deathReason: this.deathReason,
      activePowerup: this.activePowerup,
      powerupTimer: Math.max(0, Math.ceil(this.powerupTimer)),
      monkeyProximity: Math.max(0, Math.min(1, (4.8 - this.monkeyDistance) / 3.2)),
      hasResurrectionIdol: this.hasResurrectionIdol,
      stumbleCount: this.stumbleCount,
      turnWarning,
      coinMeterProgress: this.coins % 100
    });
  }

  private startLoop() {
    this.lastFrameTime = performance.now();
    const animate = (now: number) => {
      this.animFrameId = requestAnimationFrame(animate);
      const delta = Math.min((now - this.lastFrameTime) / 1000, 0.1);
      this.lastFrameTime = now;
      this.update(delta);
      this.renderer.render(this.scene, this.camera);
    };
    animate(performance.now());
  }

  private handleResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || 600;
    const height = this.container.clientHeight || 750;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public setLevelTheme(theme: TempleLevelTheme) {
    this.levelTheme = theme;
    this.updateAtmosphericFog();
    this.createMaterials();
  }

  public setCharacter(char: TempleCharacter) {
    this.character = char;
    this.scene.remove(this.playerGroup);
    this.createPlayer();
  }

  public restart() {
    this.score = 0;
    this.distance = 0;
    this.coins = 0;
    this.multiplier = 1;
    this.gameOver = false;
    this.deathReason = '';
    this.activePowerup = 'none';
    this.powerupTimer = 0;
    this.hasResurrectionIdol = false;
    this.stumbleCount = 0;
    this.stumbleRecoveryTimer = 0;
    this.currentLane = 0;
    this.targetLaneX = 0;
    this.tiltOffset = 0;
    this.jumpY = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.monkeyDistance = 4.8;
    this.monkeyTargetDistance = 4.8;
    this.playerPos.set(0, 0, 0);
    this.currentDirection.set(0, 0, -1);
    this.targetRotationY = 0;
    this.currentRotationY = 0;

    for (const seg of this.segments) {
      this.scene.remove(seg.mesh);
    }
    this.initInitialTrack();
    templeRunAudio.startTribalDrums();
    this.notifyStats();
  }

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.handleResize);
    templeRunAudio.stopTribalDrums();

    if (this.portalGroup) {
      this.scene.remove(this.portalGroup);
      this.portalGroup = null;
    }

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
    }
  }
}
