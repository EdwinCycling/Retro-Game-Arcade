/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 3D PlayStation 1 Crash Bandicoot Engine (Three.js)
 * Recreates the 1996 Naughty Dog 3D corridor platforming experience
 * with authentic 32-bit low-poly retro visuals, spinning attacks, Wumpa fruits,
 * wooden crates, TNT/Nitro boxes, Aku Aku mask, and level progression!
 */

import * as THREE from 'three';
import { ps1Audio } from './ps1Audio';

export interface CrashEntity {
  id: string;
  type: 'crate_normal' | 'crate_question' | 'crate_aku' | 'crate_life' | 'crate_tnt' | 'crate_nitro' | 'wumpa' | 'enemy_crab' | 'enemy_turtle' | 'warp_pad';
  mesh: THREE.Object3D;
  x: number;
  y: number;
  z: number;
  radius: number;
  active: boolean;
  state?: number; // Timer / health
}

export class Ps1CrashEngine {
  private container: HTMLCanvasElement;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animFrameId: number | null = null;

  // Player State
  public posX: number = 0;
  public posY: number = 0.8;
  public posZ: number = 0;
  public velX: number = 0;
  public velY: number = 0;
  public velZ: number = 0;
  public isGrounded: boolean = true;
  public isSpinning: boolean = false;
  public spinTimer: number = 0;
  private runCycle: number = 0;

  // Stats
  public score: number = 0;
  public wumpaCount: number = 0;
  public lives: number = 3;
  public cratesBroken: number = 0;
  public totalCrates: number = 0;
  public akuAkuLevel: number = 0; // 0=None, 1=Basic, 2=Golden
  public currentLevelName: string = '1. N. Sanity Beach';
  public levelIndex: number = 1;
  public isGameOver: boolean = false;
  public isLevelComplete: boolean = false;

  // Scene Objects
  private playerGroup!: THREE.Group;
  private playerBodyMesh!: THREE.Mesh;
  private leftLegMesh!: THREE.Mesh;
  private rightLegMesh!: THREE.Mesh;
  private leftArmMesh!: THREE.Mesh;
  private rightArmMesh!: THREE.Mesh;
  private spinEffectMesh!: THREE.Mesh;
  private akuAkuMesh!: THREE.Group;
  private entities: CrashEntity[] = [];
  private trackLength: number = 300;

  // Keyboard & Gamepad Inputs (Separated to prevent input locking)
  private keys = {
    left: false,
    right: false,
    up: false,
    down: false
  };

  private gamepadKeys = {
    left: false,
    right: false,
    up: false,
    down: false
  };

  private boundKeyDown!: (e: KeyboardEvent) => void;
  private boundKeyUp!: (e: KeyboardEvent) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.container = canvas;
  }

  public init() {
    // 1. Setup Three.js Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0284c7); // Tropical ocean blue sky
    this.scene.fog = new THREE.FogExp2(0x0284c7, 0.012);

    // Camera setup
    const width = this.container.width || 640;
    const height = this.container.height || 480;
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.container,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height, false);
    this.renderer.shadowMap.enabled = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.0);
    dirLight.position.set(20, 40, -20);
    dirLight.castShadow = true;
    this.scene.add(dirLight);

    // 2. Build Crash Bandicoot Character Mesh
    this.createPlayerMesh();

    // 3. Build Aku Aku Mask Mesh
    this.createAkuAkuMesh();

    // 4. Build Jungle Stage
    this.buildStage(this.levelIndex);

    // 5. Listeners
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);

    // 6. Start Loop
    this.loop();
  }

  private createPlayerMesh() {
    this.playerGroup = new THREE.Group();

    // Orange Bandicoot Upper Body
    const bodyGeo = new THREE.BoxGeometry(0.7, 0.7, 0.5);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xe65100 }); // Vibrant orange
    this.playerBodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    this.playerBodyMesh.position.y = 0.55;
    this.playerBodyMesh.castShadow = true;
    this.playerGroup.add(this.playerBodyMesh);

    // Yellow Chest Belly Patch
    const chestGeo = new THREE.BoxGeometry(0.45, 0.45, 0.1);
    const chestMat = new THREE.MeshLambertMaterial({ color: 0xfde047 });
    const chest = new THREE.Mesh(chestGeo, chestMat);
    chest.position.set(0, 0.55, 0.22);
    this.playerGroup.add(chest);

    // Blue Pants
    const pantsGeo = new THREE.BoxGeometry(0.72, 0.3, 0.52);
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8 }); // Blue jeans
    const pants = new THREE.Mesh(pantsGeo, pantsMat);
    pants.position.y = 0.25;
    this.playerGroup.add(pants);

    // Red Shoes (Left & Right)
    const shoeMat = new THREE.MeshLambertMaterial({ color: 0xdc2626 });
    this.leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.45), shoeMat);
    this.leftLegMesh.position.set(-0.2, 0.08, 0.05);

    this.rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.45), shoeMat);
    this.rightLegMesh.position.set(0.2, 0.08, 0.05);

    this.playerGroup.add(this.leftLegMesh);
    this.playerGroup.add(this.rightLegMesh);

    // Arms & Fingerless Gloves
    const armMat = new THREE.MeshLambertMaterial({ color: 0xe65100 });
    const gloveMat = new THREE.MeshLambertMaterial({ color: 0x78350f }); // Brown gloves

    this.leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.18), armMat);
    this.leftArmMesh.position.set(-0.45, 0.5, 0);
    const leftGlove = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), gloveMat);
    leftGlove.position.y = -0.22;
    this.leftArmMesh.add(leftGlove);

    this.rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.18), armMat);
    this.rightArmMesh.position.set(0.45, 0.5, 0);
    const rightGlove = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), gloveMat);
    rightGlove.position.y = -0.22;
    this.rightArmMesh.add(rightGlove);

    this.playerGroup.add(this.leftArmMesh);
    this.playerGroup.add(this.rightArmMesh);

    // Cream Snout & Face
    const snoutGeo = new THREE.BoxGeometry(0.5, 0.25, 0.4);
    const snoutMat = new THREE.MeshLambertMaterial({ color: 0xfed7aa }); // Cream snout
    const snout = new THREE.Mesh(snoutGeo, snoutMat);
    snout.position.set(0, 0.8, 0.25);
    this.playerGroup.add(snout);

    // Black Nose
    const noseMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.16), noseMat);
    nose.position.set(0, 0.84, 0.45);
    this.playerGroup.add(nose);

    // Green Eyes
    const eyeMat = new THREE.MeshLambertMaterial({ color: 0x22c55e });
    const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.1), eyeMat);
    leftEye.position.set(-0.14, 0.92, 0.24);
    const rightEye = leftEye.clone();
    rightEye.position.set(0.14, 0.92, 0.24);
    this.playerGroup.add(leftEye);
    this.playerGroup.add(rightEye);

    // Spiky Mohawk Hair
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.3), hairMat);
    hair.position.set(0, 1.05, -0.05);
    this.playerGroup.add(hair);

    // Spin Attack Tornado Effect
    const spinGeo = new THREE.CylinderGeometry(1.2, 0.2, 1.2, 12);
    const spinMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.6,
      wireframe: true
    });
    this.spinEffectMesh = new THREE.Mesh(spinGeo, spinMat);
    this.spinEffectMesh.position.y = 0.5;
    this.spinEffectMesh.visible = false;
    this.playerGroup.add(this.spinEffectMesh);

    this.scene.add(this.playerGroup);
  }

  private createAkuAkuMesh() {
    this.akuAkuMesh = new THREE.Group();

    // Wooden Mask Face
    const maskGeo = new THREE.BoxGeometry(0.4, 0.6, 0.08);
    const maskMat = new THREE.MeshLambertMaterial({ color: 0x92400e });
    const mask = new THREE.Mesh(maskGeo, maskMat);
    this.akuAkuMesh.add(mask);

    // Glowing Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), eyeMat);
    eyeL.position.set(-0.1, 0.12, 0.05);
    const eyeR = eyeL.clone();
    eyeR.position.set(0.1, 0.12, 0.05);
    this.akuAkuMesh.add(eyeL);
    this.akuAkuMesh.add(eyeR);

    // Colorful Feathers (Red, Green, Blue, Yellow)
    const colors = [0xef4444, 0x10b981, 0x3b82f6, 0xeab308];
    colors.forEach((col, i) => {
      const fMat = new THREE.MeshLambertMaterial({ color: col });
      const feather = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.03), fMat);
      feather.position.set(-0.15 + i * 0.1, 0.45, 0);
      this.akuAkuMesh.add(feather);
    });

    this.akuAkuMesh.visible = false;
    this.scene.add(this.akuAkuMesh);
  }

  private buildStage(index: number) {
    // Clear old entities
    this.entities.forEach(e => this.scene.remove(e.mesh));
    this.entities = [];

    this.levelIndex = index;
    const names = ['1. N. Sanity Beach', '2. Jungle Rollers', '3. Heavy Boulder Run', '4. Cortex Lair'];
    this.currentLevelName = names[(index - 1) % names.length];

    // Reset Player position
    this.posX = 0;
    this.posY = 0.8;
    this.posZ = 0;
    this.velX = 0;
    this.velY = 0;
    this.velZ = 0;
    this.isLevelComplete = false;

    // Ground Sandy Jungle Track
    const trackGeo = new THREE.BoxGeometry(10, 0.5, this.trackLength);
    const trackMat = new THREE.MeshLambertMaterial({ color: 0xd97706 }); // Sand / dirt path
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.position.set(0, -0.25, this.trackLength / 2);
    track.receiveShadow = true;
    this.scene.add(track);

    // Side Foliage & Palm Trees
    for (let z = 10; z < this.trackLength - 20; z += 12) {
      const treeLeft = this.createPalmTree();
      treeLeft.position.set(-6, 0, z);
      this.scene.add(treeLeft);

      const treeRight = this.createPalmTree();
      treeRight.position.set(6, 0, z + 6);
      this.scene.add(treeRight);
    }

    // Populate Crates, Wumpa Fruits, Enemies
    this.totalCrates = 0;
    for (let z = 15; z < this.trackLength - 30; z += 12) {
      const lane = (Math.floor(Math.random() * 3) - 1) * 2; // -2, 0, 2
      const typeRand = Math.random();

      if (typeRand < 0.4) {
        // Wooden Crate
        let cType: CrashEntity['type'] = 'crate_normal';
        if (typeRand < 0.1) cType = 'crate_question';
        else if (typeRand < 0.18) cType = 'crate_aku';
        else if (typeRand < 0.28) cType = 'crate_tnt';
        else if (typeRand < 0.35) cType = 'crate_nitro';

        this.spawnCrate(cType, lane, 0.5, z);
        this.totalCrates++;
      } else if (typeRand < 0.7) {
        // Line of 3 Wumpa Fruits
        for (let w = 0; w < 3; w++) {
          this.spawnWumpa(lane, 0.8, z + w * 1.5);
        }
      } else {
        // Jungle Enemy
        const eType = Math.random() > 0.5 ? 'enemy_crab' : 'enemy_turtle';
        this.spawnEnemy(eType, lane, 0.5, z);
      }
    }

    // End Warp Pad
    const padGeo = new THREE.CylinderGeometry(2, 2, 0.3, 16);
    const padMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8, emissive: 0x0284c7 });
    const warpPad = new THREE.Mesh(padGeo, padMat);
    warpPad.position.set(0, 0.15, this.trackLength - 10);
    this.scene.add(warpPad);

    this.entities.push({
      id: 'warp_pad',
      type: 'warp_pad',
      mesh: warpPad,
      x: 0,
      y: 0.15,
      z: this.trackLength - 10,
      radius: 2,
      active: true
    });
  }

  private createPalmTree(): THREE.Group {
    const group = new THREE.Group();
    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 6, 8);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 3;
    group.add(trunk);

    // Leaves
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x15803d });
    for (let i = 0; i < 5; i++) {
      const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 2.5), leafMat);
      leaf.position.set(0, 5.8, 0);
      leaf.rotation.y = (i * Math.PI) / 2.5;
      leaf.rotation.x = 0.3;
      group.add(leaf);
    }
    return group;
  }

  private spawnCrate(type: CrashEntity['type'], x: number, y: number, z: number) {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    let color = 0x92400e; // Wooden Brown
    let emissive = 0x000000;

    if (type === 'crate_question') { color = 0xf59e0b; }
    else if (type === 'crate_aku') { color = 0x10b981; }
    else if (type === 'crate_tnt') { color = 0xdc2626; }
    else if (type === 'crate_nitro') { color = 0x22c55e; emissive = 0x15803d; }

    const mat = new THREE.MeshLambertMaterial({ color, emissive });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    this.scene.add(mesh);

    this.entities.push({
      id: `crate_${Math.random()}`,
      type,
      mesh,
      x,
      y,
      z,
      radius: 0.7,
      active: true
    });
  }

  private spawnWumpa(x: number, y: number, z: number) {
    const geo = new THREE.SphereGeometry(0.35, 8, 8);
    const mat = new THREE.MeshLambertMaterial({ color: 0xf97316, emissive: 0x7c2d12 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    this.scene.add(mesh);

    this.entities.push({
      id: `wumpa_${Math.random()}`,
      type: 'wumpa',
      mesh,
      x,
      y,
      z,
      radius: 0.5,
      active: true
    });
  }

  private spawnEnemy(type: 'enemy_crab' | 'enemy_turtle', x: number, y: number, z: number) {
    const geo = type === 'enemy_crab' ? new THREE.BoxGeometry(1.2, 0.4, 0.8) : new THREE.CylinderGeometry(0.6, 0.6, 0.5, 8);
    const mat = new THREE.MeshLambertMaterial({ color: type === 'enemy_crab' ? 0xef4444 : 0x16a34a });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    this.scene.add(mesh);

    this.entities.push({
      id: `enemy_${Math.random()}`,
      type,
      mesh,
      x,
      y,
      z,
      radius: 0.8,
      active: true,
      state: 1
    });
  }

  // Handle Controller / Gamepad Inputs cleanly
  public updateInputsFromGamepad(moveX: number, moveY: number, buttonJump: boolean, buttonSpin: boolean) {
    this.gamepadKeys.left = moveX < -0.2;
    this.gamepadKeys.right = moveX > 0.2;
    this.gamepadKeys.up = moveY < -0.2;
    this.gamepadKeys.down = moveY > 0.2;

    if (buttonJump && this.isGrounded) this.performJump();
    if (buttonSpin && !this.isSpinning) this.performSpin();
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = true;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.keys.up = true;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.keys.down = true;

    if ((e.key === ' ' || e.key === 'x' || e.key === 'X') && this.isGrounded) {
      this.performJump();
    }
    if ((e.key === 'z' || e.key === 'Z' || e.key === 'j' || e.key === 'J') && !this.isSpinning) {
      this.performSpin();
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.keys.up = false;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.keys.down = false;
  }

  private performJump() {
    this.velY = 0.22;
    this.isGrounded = false;
    ps1Audio.playCrashJump();
  }

  private performSpin() {
    this.isSpinning = true;
    this.spinTimer = 0.35;
    this.spinEffectMesh.visible = true;
    ps1Audio.playCrashSpin();
  }

  // Main Game Loop
  private loop() {
    this.update();
    this.render();
    this.animFrameId = requestAnimationFrame(this.loop.bind(this));
  }

  private update() {
    if (this.isGameOver || this.isLevelComplete) return;

    // 1. Combine Keyboard + Gamepad Inputs
    const moveLeft = this.keys.left || this.gamepadKeys.left;
    const moveRight = this.keys.right || this.gamepadKeys.right;
    const moveUp = this.keys.up || this.gamepadKeys.up;
    const moveDown = this.keys.down || this.gamepadKeys.down;

    const speed = 0.18;
    this.velX = 0;
    this.velZ = 0;

    if (moveLeft && this.posX > -3.5) this.velX = -speed;
    if (moveRight && this.posX < 3.5) this.velX = speed;
    if (moveUp && this.posZ < this.trackLength - 2) this.velZ = speed;
    if (moveDown && this.posZ > 0) this.velZ = -speed * 0.7;

    this.posX += this.velX;
    this.posZ += this.velZ;

    // Running limb animation
    if (Math.abs(this.velX) > 0.01 || Math.abs(this.velZ) > 0.01) {
      this.runCycle += 0.25;
      this.leftLegMesh.position.z = Math.sin(this.runCycle) * 0.25;
      this.rightLegMesh.position.z = -Math.sin(this.runCycle) * 0.25;
      this.leftArmMesh.rotation.x = -Math.sin(this.runCycle) * 0.5;
      this.rightArmMesh.rotation.x = Math.sin(this.runCycle) * 0.5;
    } else {
      this.leftLegMesh.position.z = 0.05;
      this.rightLegMesh.position.z = 0.05;
      this.leftArmMesh.rotation.x = 0;
      this.rightArmMesh.rotation.x = 0;
    }

    // Gravity
    this.posY += this.velY;
    if (this.posY > 0.8) {
      this.velY -= 0.015;
      this.isGrounded = false;
    } else {
      this.posY = 0.8;
      this.velY = 0;
      this.isGrounded = true;
    }

    // Spin Attack Animation
    if (this.isSpinning) {
      this.spinTimer -= 0.016;
      this.playerGroup.rotation.y += 0.6;
      this.spinEffectMesh.rotation.y += 0.4;
      if (this.spinTimer <= 0) {
        this.isSpinning = false;
        this.spinEffectMesh.visible = false;
        this.playerGroup.rotation.y = 0;
      }
    }

    // Update Player Position
    this.playerGroup.position.set(this.posX, this.posY, this.posZ);

    // Update Aku Aku Mask Position
    if (this.akuAkuLevel > 0) {
      this.akuAkuMesh.visible = true;
      this.akuAkuMesh.position.set(
        this.posX + 0.8,
        this.posY + 0.6 + Math.sin(Date.now() * 0.005) * 0.15,
        this.posZ
      );
      this.akuAkuMesh.rotation.y = Math.sin(Date.now() * 0.003) * 0.3;
    } else {
      this.akuAkuMesh.visible = false;
    }

    // Update Enemies & Entities
    this.updateEntities();

    // Smooth Camera Follow Corridor View
    this.camera.position.set(this.posX * 0.5, this.posY + 3.2, this.posZ - 7.5);
    this.camera.lookAt(this.posX, this.posY + 0.8, this.posZ + 5.0);
  }

  private updateEntities() {
    for (let i = 0; i < this.entities.length; i++) {
      const ent = this.entities[i];
      if (!ent.active) continue;

      // Rotate Wumpa Fruits
      if (ent.type === 'wumpa') {
        ent.mesh.rotation.y += 0.04;
        ent.mesh.position.y = ent.y + Math.sin(Date.now() * 0.004 + ent.z) * 0.1;
      }

      // Patrol Crab / Turtle
      if (ent.type === 'enemy_crab' || ent.type === 'enemy_turtle') {
        ent.x += (ent.state || 1) * 0.03;
        if (ent.x > 3.2 || ent.x < -3.2) {
          ent.state = -(ent.state || 1);
        }
        ent.mesh.position.x = ent.x;
      }

      // Collision Check with Crash
      const dx = this.posX - ent.x;
      const dy = this.posY - ent.y;
      const dz = this.posZ - ent.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < ent.radius) {
        // Collect Wumpa Fruit
        if (ent.type === 'wumpa') {
          ent.active = false;
          this.scene.remove(ent.mesh);
          this.wumpaCount++;
          this.score += 20;
          ps1Audio.playWumpaFruit();

          if (this.wumpaCount >= 100) {
            this.wumpaCount = 0;
            this.lives++;
          }
        }

        // Crate Interaction
        else if (ent.type.startsWith('crate_')) {
          if (this.isSpinning || this.velY < -0.05) {
            ent.active = false;
            this.scene.remove(ent.mesh);
            this.cratesBroken++;
            this.score += 100;

            if (ent.type === 'crate_aku') {
              this.akuAkuLevel = Math.min(2, this.akuAkuLevel + 1);
              ps1Audio.playAkuAku();
            } else if (ent.type === 'crate_nitro' || ent.type === 'crate_tnt') {
              ps1Audio.playNitroExplode();
              this.handleDamage();
            } else {
              ps1Audio.playCrateSmash();
            }
          }
        }

        // Enemy Collision
        else if (ent.type === 'enemy_crab' || ent.type === 'enemy_turtle') {
          if (this.isSpinning || this.velY < -0.05) {
            ent.active = false;
            this.scene.remove(ent.mesh);
            this.score += 200;
            ps1Audio.playEnemyStomp();
          } else {
            this.handleDamage();
          }
        }

        // Warp Pad Level Finish
        else if (ent.type === 'warp_pad') {
          this.isLevelComplete = true;
          ps1Audio.playAkuAku();
          setTimeout(() => {
            this.buildStage(this.levelIndex + 1);
          }, 2000);
        }
      }
    }
  }

  private handleDamage() {
    if (this.akuAkuLevel > 0) {
      this.akuAkuLevel--;
      ps1Audio.playCrateSmash();
    } else {
      this.lives--;
      ps1Audio.playNitroExplode();
      if (this.lives <= 0) {
        this.isGameOver = true;
      } else {
        this.posX = 0;
        this.posY = 0.8;
        this.posZ = Math.max(0, this.posZ - 20);
      }
    }
  }

  private render() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  public destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
