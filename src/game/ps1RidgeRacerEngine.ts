/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 3D PlayStation 1 Ridge Racer Engine (Three.js)
 * Recreates the historic 1994 PS1 launch title with high-speed 3D mountain racing,
 * drift physics, 3D sports car model, lap times, rival cars, and Namco billboards!
 */

import * as THREE from 'three';
import { ps1Audio } from './ps1Audio';

export interface RivalCar {
  mesh: THREE.Group;
  speed: number;
  x: number;
  z: number;
  angle: number;
  progress: number;
}

export class Ps1RidgeRacerEngine {
  private container: HTMLCanvasElement;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animFrameId: number | null = null;

  // Car Physics
  public carSpeed: number = 0; // km/h
  public maxSpeed: number = 230; // km/h
  public carX: number = 0;
  public carZ: number = 0;
  public carAngle: number = 0;
  public driftAngle: number = 0;
  public isDrifting: boolean = false;
  public lap: number = 1;
  public maxLaps: number = 3;
  public lapTime: number = 0;
  public bestLapTime: number = 0;
  public position: number = 1;
  public isRaceFinished: boolean = false;

  private carMesh!: THREE.Group;
  private brakeLightMat!: THREE.MeshBasicMaterial;
  private wheels: THREE.Mesh[] = [];
  private rivalCars: RivalCar[] = [];
  private trackCurve!: THREE.CatmullRomCurve3;

  // Keyboard & Gamepad Inputs (Separated to prevent input locking)
  private keys = {
    accelerate: false,
    brake: false,
    left: false,
    right: false
  };

  private gamepadKeys = {
    accelerate: false,
    brake: false,
    left: false,
    right: false
  };

  private boundKeyDown!: (e: KeyboardEvent) => void;
  private boundKeyUp!: (e: KeyboardEvent) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.container = canvas;
  }

  public init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x38bdf8); // Coastal sky blue
    this.scene.fog = new THREE.FogExp2(0x38bdf8, 0.005);

    const width = this.container.width || 640;
    const height = this.container.height || 480;
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1200);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.container,
      antialias: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height, false);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.1);
    dirLight.position.set(50, 100, -50);
    this.scene.add(dirLight);

    // Build Ridge Racer Car, Circuit & Rivals
    this.createCarMesh();
    this.buildMountainCircuit();
    this.spawnRivalCars();

    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);

    this.loop();
  }

  private createCarMesh() {
    this.carMesh = new THREE.Group();

    // Red F/A Racing Sports Car Body
    const bodyGeo = new THREE.BoxGeometry(1.8, 0.65, 3.8);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xdc2626 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.45;
    this.carMesh.add(body);

    // Racing Stripe
    const stripeGeo = new THREE.BoxGeometry(0.5, 0.67, 3.82);
    const stripeMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = 0.45;
    this.carMesh.add(stripe);

    // Tinted Cockpit
    const cabinGeo = new THREE.BoxGeometry(1.4, 0.55, 1.8);
    const cabinMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 0.85, -0.2);
    this.carMesh.add(cabin);

    // Rear Spoiler Wing
    const spoilerGeo = new THREE.BoxGeometry(1.8, 0.12, 0.45);
    const spoilerMat = new THREE.MeshLambertMaterial({ color: 0x991b1b });
    const spoiler = new THREE.Mesh(spoilerGeo, spoilerMat);
    spoiler.position.set(0, 1.05, 1.65);
    this.carMesh.add(spoiler);

    // Glowing Red Brake Lights
    this.brakeLightMat = new THREE.MeshBasicMaterial({ color: 0x7f1d1d });
    const brakeL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.1), this.brakeLightMat);
    brakeL.position.set(-0.65, 0.5, 1.91);
    const brakeR = brakeL.clone();
    brakeR.position.set(0.65, 0.5, 1.91);
    this.carMesh.add(brakeL);
    this.carMesh.add(brakeR);

    // 4 Sport Wheels
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const rimMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.32, 12);

    const positions = [
      [-0.92, 0.38, 1.2],
      [0.92, 0.38, 1.2],
      [-0.92, 0.38, -1.2],
      [0.92, 0.38, -1.2]
    ];

    this.wheels = [];
    positions.forEach(p => {
      const wGroup = new THREE.Group();
      const tire = new THREE.Mesh(wheelGeo, wheelMat);
      tire.rotation.z = Math.PI / 2;
      wGroup.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.34, 8), rimMat);
      rim.rotation.z = Math.PI / 2;
      wGroup.add(rim);

      wGroup.position.set(p[0], p[1], p[2]);
      this.carMesh.add(wGroup);
      this.wheels.push(tire);
    });

    this.scene.add(this.carMesh);
  }

  private buildMountainCircuit() {
    // Ridge City Mountain Curve Track
    this.trackCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(120, 0, 220),
      new THREE.Vector3(320, 0, 320),
      new THREE.Vector3(520, 0, 120),
      new THREE.Vector3(420, 0, -220),
      new THREE.Vector3(220, 0, -320),
      new THREE.Vector3(-120, 0, -180)
    ], true);

    // Road Tube
    const roadGeo = new THREE.TubeGeometry(this.trackCurve, 180, 10, 8, true);
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const trackMesh = new THREE.Mesh(roadGeo, roadMat);
    this.scene.add(trackMesh);

    // Surrounding Ocean Island
    const islandGeo = new THREE.PlaneGeometry(1500, 1500);
    const islandMat = new THREE.MeshLambertMaterial({ color: 0x15803d });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.rotation.x = -Math.PI / 2;
    island.position.y = -0.5;
    this.scene.add(island);

    // Start / Finish Arch Archway Banner
    const archGroup = new THREE.Group();
    const pillarMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(1, 8, 1), pillarMat);
    p1.position.set(-8, 4, 0);
    const p2 = p1.clone();
    p2.position.set(8, 4, 0);
    archGroup.add(p1);
    archGroup.add(p2);

    const bannerMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const banner = new THREE.Mesh(new THREE.BoxGeometry(17, 2, 0.5), bannerMat);
    banner.position.set(0, 7, 0);
    archGroup.add(banner);

    archGroup.position.set(0, 0, 5);
    this.scene.add(archGroup);

    // Billboards along the track
    const billboardColors = [0xef4444, 0x3b82f6, 0xeab308, 0x10b981];
    for (let i = 0; i < 8; i++) {
      const pt = this.trackCurve.getPoint(i / 8);
      const bbGroup = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6, 0.4), pillarMat);
      pole.position.y = 3;
      bbGroup.add(pole);

      const board = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 0.2), new THREE.MeshLambertMaterial({ color: billboardColors[i % 4] }));
      board.position.set(0, 5, 0);
      bbGroup.add(board);

      bbGroup.position.set(pt.x + 12, pt.y, pt.z);
      this.scene.add(bbGroup);
    }
  }

  private spawnRivalCars() {
    const rivalColors = [0xeab308, 0x2563eb, 0xf87171]; // Yellow Solvalou, Blue Bayyard, White Angel
    this.rivalCars = [];

    rivalColors.forEach((color, idx) => {
      const rGroup = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 3.8), new THREE.MeshLambertMaterial({ color }));
      body.position.y = 0.4;
      rGroup.add(body);

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 1.8), new THREE.MeshLambertMaterial({ color: 0x0f172a }));
      cabin.position.set(0, 0.8, -0.2);
      rGroup.add(cabin);

      this.scene.add(rGroup);

      this.rivalCars.push({
        mesh: rGroup,
        speed: 150 + idx * 25,
        x: 0,
        z: 0,
        angle: 0,
        progress: 0.1 + idx * 0.25
      });
    });
  }

  // Handle Controller / Gamepad Inputs cleanly
  public updateInputsFromGamepad(steerX: number, accel: boolean, brake: boolean) {
    this.gamepadKeys.left = steerX < -0.2;
    this.gamepadKeys.right = steerX > 0.2;
    this.gamepadKeys.accelerate = accel;
    this.gamepadKeys.brake = brake;
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.keys.accelerate = true;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.keys.brake = true;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = true;
  }

  private handleKeyUp(e: KeyboardEvent) {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.keys.accelerate = false;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.keys.brake = false;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
  }

  private loop() {
    this.update();
    this.render();
    this.animFrameId = requestAnimationFrame(this.loop.bind(this));
  }

  private update() {
    if (this.isRaceFinished) return;

    this.lapTime += 0.016;

    // Combine Keyboard + Gamepad Inputs
    const isAccel = this.keys.accelerate || this.gamepadKeys.accelerate;
    const isBrake = this.keys.brake || this.gamepadKeys.brake;
    const isLeft = this.keys.left || this.gamepadKeys.left;
    const isRight = this.keys.right || this.gamepadKeys.right;

    // Acceleration & Braking Physics
    if (isAccel) {
      this.carSpeed = Math.min(this.maxSpeed, this.carSpeed + 2.5);
      this.brakeLightMat.color.setHex(0x7f1d1d);
    } else if (isBrake) {
      this.carSpeed = Math.max(0, this.carSpeed - 4.5);
      this.brakeLightMat.color.setHex(0xef4444); // Bright red brake lights!
    } else {
      this.carSpeed = Math.max(0, this.carSpeed - 0.8);
      this.brakeLightMat.color.setHex(0x7f1d1d);
    }

    // Steering & Drift Angle
    if (this.carSpeed > 5) {
      const turnRate = 0.038;
      if (isLeft) {
        this.carAngle += turnRate;
        if (isBrake) this.driftAngle = -0.3; // Drift slide!
      }
      if (isRight) {
        this.carAngle -= turnRate;
        if (isBrake) this.driftAngle = 0.3;
      }
    }

    // Smooth drift recovery
    this.driftAngle *= 0.9;

    // Move Player Car
    const moveDist = (this.carSpeed / 3.6) * 0.016;
    this.carX += Math.sin(this.carAngle) * moveDist;
    this.carZ += Math.cos(this.carAngle) * moveDist;

    this.carMesh.position.set(this.carX, 0.2, this.carZ);
    this.carMesh.rotation.y = this.carAngle + this.driftAngle;

    // Rotate Wheels when moving
    this.wheels.forEach(w => {
      w.rotation.x += moveDist * 2.0;
    });

    // Update Rival Cars along the track curve
    this.rivalCars.forEach(rival => {
      rival.progress += (rival.speed / 3600) * 0.016;
      if (rival.progress >= 1.0) rival.progress -= 1.0;

      const pt = this.trackCurve.getPoint(rival.progress);
      const tangent = this.trackCurve.getTangent(rival.progress);

      rival.mesh.position.set(pt.x, 0.2, pt.z);
      rival.mesh.rotation.y = Math.atan2(tangent.x, tangent.z);
    });

    // Camera Chase view from behind car
    const camDist = 6.5;
    this.camera.position.set(
      this.carX - Math.sin(this.carAngle) * camDist,
      2.6,
      this.carZ - Math.cos(this.carAngle) * camDist
    );
    this.camera.lookAt(this.carX, 1.1, this.carZ);
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
