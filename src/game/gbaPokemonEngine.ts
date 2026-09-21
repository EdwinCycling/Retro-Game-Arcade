/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Pokémon Emerald Edition GBA Engine (240x160 32-bit Game Boy Advance)
 */

import { gbaAudio } from './gbaAudio';
import { savePokemonScore } from './gbaHighScores';

export interface PokemonMove {
  name: string;
  type: 'Fire' | 'Grass' | 'Water' | 'Electric' | 'Normal';
  power: number;
  accuracy: number;
  pp: number;
  maxPp: number;
  description: string;
}

export interface PokemonSpecies {
  name: string;
  type: string;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  color: string;
  spriteType: 'torchic' | 'treecko' | 'mudkip' | 'pikachu' | 'zigzagoon' | 'wurmple' | 'taillow' | 'rayquaza';
  moves: PokemonMove[];
}

export class GbaPokemonEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animId: number = 0;
  private isRunning: boolean = false;

  // Game Mode: 'OVERWORLD' | 'BATTLE_INTRO' | 'BATTLE' | 'BATTLE_WON' | 'CAUGHT' | 'GAME_OVER'
  public mode: 'OVERWORLD' | 'BATTLE_INTRO' | 'BATTLE' | 'BATTLE_WON' | 'CAUGHT' | 'STARTER_SELECT' = 'STARTER_SELECT';

  // Overworld Player Position
  public player = {
    x: 120,
    y: 80,
    dir: 'DOWN' as 'UP' | 'DOWN' | 'LEFT' | 'RIGHT',
    step: 0,
    walkTimer: 0,
    isMoving: false,
    speed: 1.5
  };

  // Controller inputs
  private keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    a: false,
    b: false,
    start: false,
    select: false,
    l: false,
    r: false
  };

  // Battle state
  public starterList: PokemonSpecies[] = [
    {
      name: 'TORCHIC',
      type: 'Fire',
      maxHp: 45,
      attack: 60,
      defense: 40,
      speed: 45,
      color: '#f97316',
      spriteType: 'torchic',
      moves: [
        { name: 'EMBER', type: 'Fire', power: 40, accuracy: 100, pp: 25, maxPp: 25, description: 'Attacks with small flames.' },
        { name: 'SCRATCH', type: 'Normal', power: 40, accuracy: 100, pp: 35, maxPp: 35, description: 'Hard, pointed claws scratch.' },
        { name: 'GROWL', type: 'Normal', power: 0, accuracy: 100, pp: 40, maxPp: 40, description: 'Lowers foe attack.' },
        { name: 'FLAMETHROWER', type: 'Fire', power: 90, accuracy: 100, pp: 15, maxPp: 15, description: 'A powerful blast of fire.' }
      ]
    },
    {
      name: 'TREECKO',
      type: 'Grass',
      maxHp: 40,
      attack: 45,
      defense: 35,
      speed: 70,
      color: '#22c55e',
      spriteType: 'treecko',
      moves: [
        { name: 'ABSORB', type: 'Grass', power: 20, accuracy: 100, pp: 25, maxPp: 25, description: 'Absorbs foe HP to heal.' },
        { name: 'POUND', type: 'Normal', power: 40, accuracy: 100, pp: 35, maxPp: 35, description: 'Pounds with forelegs or tail.' },
        { name: 'LEER', type: 'Normal', power: 0, accuracy: 100, pp: 30, maxPp: 30, description: 'Frightens foe to lower defense.' },
        { name: 'MEGA DRAIN', type: 'Grass', power: 40, accuracy: 100, pp: 15, maxPp: 15, description: 'Drains half the damage inflicted.' }
      ]
    },
    {
      name: 'MUDKIP',
      type: 'Water',
      maxHp: 50,
      attack: 70,
      defense: 50,
      speed: 40,
      color: '#0ea5e9',
      spriteType: 'mudkip',
      moves: [
        { name: 'WATER GUN', type: 'Water', power: 40, accuracy: 100, pp: 25, maxPp: 25, description: 'Squirts water to attack.' },
        { name: 'TACKLE', type: 'Normal', power: 35, accuracy: 95, pp: 35, maxPp: 35, description: 'Full body charge attack.' },
        { name: 'GROWL', type: 'Normal', power: 0, accuracy: 100, pp: 40, maxPp: 40, description: 'Lowers foe attack.' },
        { name: 'SURF', type: 'Water', power: 90, accuracy: 100, pp: 15, maxPp: 15, description: 'Creates a huge wave.' }
      ]
    },
    {
      name: 'PIKACHU',
      type: 'Electric',
      maxHp: 35,
      attack: 55,
      defense: 40,
      speed: 90,
      color: '#eab308',
      spriteType: 'pikachu',
      moves: [
        { name: 'THUNDER SHOCK', type: 'Electric', power: 40, accuracy: 100, pp: 30, maxPp: 30, description: 'An electric shock attack.' },
        { name: 'QUICK ATTACK', type: 'Normal', power: 40, accuracy: 100, pp: 30, maxPp: 30, description: 'Extremely fast striking move.' },
        { name: 'THUNDER WAVE', type: 'Electric', power: 0, accuracy: 100, pp: 20, maxPp: 20, description: 'Paralyzes the target.' },
        { name: 'THUNDERBOLT', type: 'Electric', power: 90, accuracy: 100, pp: 15, maxPp: 15, description: 'Strong lightning bolt.' }
      ]
    }
  ];

  public selectedStarterIndex = 0;
  public playerMon = {
    species: null as PokemonSpecies | null,
    level: 5,
    currentHp: 45,
    maxHp: 45,
    exp: 0,
    maxExp: 100
  };

  public wildMon = {
    species: null as PokemonSpecies | null,
    level: 3,
    currentHp: 25,
    maxHp: 25
  };

  // Battle menu: 0 = FIGHT, 1 = BAG, 2 = POKÉMON, 3 = RUN
  public battleMenuOption: number = 0;
  public moveMenuOption: number = 0;
  public isSubMenuFight: boolean = false;
  public isSubMenuBag: boolean = false;
  public bagItems = [
    { name: 'POKÉ BALL', count: 5, type: 'ball' },
    { name: 'POTION', count: 3, type: 'potion' }
  ];
  public bagOption: number = 0;

  // Dialog & Animation
  public dialogText: string = '';
  public battleIntroProgress: number = 0;
  public attackAnimTimer: number = 0;
  public activeAttackType: string | null = null;
  public ballThrowState: 'none' | 'flying' | 'shaking' | 'caught' | 'escaped' = 'none';
  public ballShakeCount: number = 0;
  public ballTimer: number = 0;

  // Score & Pokedex
  public score: number = 0;
  public caughtCount: number = 0;
  public battlesWon: number = 0;
  public onScoreUpdate?: (score: number, caught: number) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
  }

  public init() {
    this.canvas.width = 240;
    this.canvas.height = 160;
    this.playerMon.species = this.starterList[0];
    this.playerMon.maxHp = this.starterList[0].maxHp;
    this.playerMon.currentHp = this.starterList[0].maxHp;
    this.mode = 'STARTER_SELECT';
    this.dialogText = 'Choose your Starter Pokémon with A!';
    this.startLoop();
  }

  public setInput(input: Partial<typeof this.keys>) {
    const prevA = this.keys.a;
    const prevB = this.keys.b;
    const prevLeft = this.keys.left;
    const prevRight = this.keys.right;
    const prevUp = this.keys.up;
    const prevDown = this.keys.down;

    this.keys = { ...this.keys, ...input };

    // Trigger actions on press edge
    if (this.mode === 'STARTER_SELECT') {
      if (this.keys.left && !prevLeft) {
        this.selectedStarterIndex = (this.selectedStarterIndex - 1 + this.starterList.length) % this.starterList.length;
        gbaAudio.playMarioCoin();
      }
      if (this.keys.right && !prevRight) {
        this.selectedStarterIndex = (this.selectedStarterIndex + 1) % this.starterList.length;
        gbaAudio.playMarioCoin();
      }
      if (this.keys.a && !prevA) {
        this.chooseStarter(this.selectedStarterIndex);
      }
    } else if (this.mode === 'OVERWORLD') {
      // Free roaming
    } else if (this.mode === 'BATTLE') {
      this.handleBattleInput(prevA, prevB, prevLeft, prevRight, prevUp, prevDown);
    } else if (this.mode === 'BATTLE_WON' || this.mode === 'CAUGHT') {
      if (this.keys.a && !prevA) {
        this.mode = 'OVERWORLD';
        this.dialogText = 'Explore Route 101!';
      }
    }
  }

  private chooseStarter(index: number) {
    const chosen = this.starterList[index];
    this.playerMon.species = chosen;
    this.playerMon.level = 5;
    this.playerMon.maxHp = chosen.maxHp;
    this.playerMon.currentHp = chosen.maxHp;
    this.mode = 'OVERWORLD';
    this.dialogText = `Professor Birch: You received ${chosen.name}!`;
    gbaAudio.playZeldaChestFanfare();
  }

  private triggerWildBattle() {
    this.mode = 'BATTLE_INTRO';
    this.battleIntroProgress = 0;
    gbaAudio.playPokemonEncounter();

    const wildCandidates: PokemonSpecies[] = [
      {
        name: 'ZIGZAGOON',
        type: 'Normal',
        maxHp: 20,
        attack: 30,
        defense: 41,
        speed: 60,
        color: '#a16207',
        spriteType: 'zigzagoon',
        moves: [{ name: 'TACKLE', type: 'Normal', power: 35, accuracy: 95, pp: 35, maxPp: 35, description: 'Tackle' }]
      },
      {
        name: 'WURMPLE',
        type: 'Bug',
        maxHp: 22,
        attack: 45,
        defense: 35,
        speed: 20,
        color: '#e11d48',
        spriteType: 'wurmple',
        moves: [{ name: 'POISON STING', type: 'Grass', power: 15, accuracy: 100, pp: 35, maxPp: 35, description: 'Sting' }]
      },
      {
        name: 'TAILLOW',
        type: 'Flying',
        maxHp: 24,
        attack: 55,
        defense: 30,
        speed: 85,
        color: '#2563eb',
        spriteType: 'taillow',
        moves: [{ name: 'PECK', type: 'Normal', power: 35, accuracy: 100, pp: 35, maxPp: 35, description: 'Peck' }]
      },
      {
        name: 'PIKACHU',
        type: 'Electric',
        maxHp: 28,
        attack: 55,
        defense: 40,
        speed: 90,
        color: '#eab308',
        spriteType: 'pikachu',
        moves: [{ name: 'THUNDER SHOCK', type: 'Electric', power: 40, accuracy: 100, pp: 30, maxPp: 30, description: 'Shock' }]
      }
    ];

    const pick = wildCandidates[Math.floor(Math.random() * wildCandidates.length)];
    const wildLvl = Math.max(2, Math.floor(Math.random() * 4) + 2);
    this.wildMon = {
      species: pick,
      level: wildLvl,
      currentHp: pick.maxHp,
      maxHp: pick.maxHp
    };
    this.isSubMenuFight = false;
    this.isSubMenuBag = false;
    this.ballThrowState = 'none';
  }

  private handleBattleInput(prevA: boolean, prevB: boolean, prevLeft: boolean, prevRight: boolean, prevUp: boolean, prevDown: boolean) {
    if (this.ballThrowState !== 'none' || this.attackAnimTimer > 0) return;

    if (this.isSubMenuFight) {
      if (this.keys.up && !prevUp) this.moveMenuOption = (this.moveMenuOption - 2 + 4) % 4;
      if (this.keys.down && !prevDown) this.moveMenuOption = (this.moveMenuOption + 2) % 4;
      if (this.keys.left && !prevLeft) this.moveMenuOption = (this.moveMenuOption - 1 + 4) % 4;
      if (this.keys.right && !prevRight) this.moveMenuOption = (this.moveMenuOption + 1) % 4;

      if (this.keys.b && !prevB) {
        this.isSubMenuFight = false;
        this.dialogText = `What will ${this.playerMon.species?.name} do?`;
      }
      if (this.keys.a && !prevA) {
        this.executePlayerMove(this.moveMenuOption);
      }
    } else if (this.isSubMenuBag) {
      if (this.keys.up && !prevUp) this.bagOption = Math.max(0, this.bagOption - 1);
      if (this.keys.down && !prevDown) this.bagOption = Math.min(this.bagItems.length - 1, this.bagOption + 1);

      if (this.keys.b && !prevB) {
        this.isSubMenuBag = false;
        this.dialogText = `What will ${this.playerMon.species?.name} do?`;
      }
      if (this.keys.a && !prevA) {
        this.useBagItem(this.bagOption);
      }
    } else {
      // Main 4-Box Battle Menu (0=FIGHT, 1=BAG, 2=POKÉMON, 3=RUN)
      if (this.keys.left && !prevLeft) this.battleMenuOption = this.battleMenuOption % 2 === 1 ? this.battleMenuOption - 1 : this.battleMenuOption;
      if (this.keys.right && !prevRight) this.battleMenuOption = this.battleMenuOption % 2 === 0 ? this.battleMenuOption + 1 : this.battleMenuOption;
      if (this.keys.up && !prevUp) this.battleMenuOption = this.battleMenuOption >= 2 ? this.battleMenuOption - 2 : this.battleMenuOption;
      if (this.keys.down && !prevDown) this.battleMenuOption = this.battleMenuOption < 2 ? this.battleMenuOption + 2 : this.battleMenuOption;

      if (this.keys.a && !prevA) {
        if (this.battleMenuOption === 0) {
          this.isSubMenuFight = true;
          this.moveMenuOption = 0;
        } else if (this.battleMenuOption === 1) {
          this.isSubMenuBag = true;
          this.bagOption = 0;
        } else if (this.battleMenuOption === 2) {
          this.dialogText = `${this.playerMon.species?.name} (Lv. ${this.playerMon.level}) is ready!`;
        } else if (this.battleMenuOption === 3) {
          this.mode = 'OVERWORLD';
          this.dialogText = 'Got away safely!';
          gbaAudio.playHingeClick();
        }
      }
    }
  }

  private executePlayerMove(moveIdx: number) {
    const move = this.playerMon.species?.moves[moveIdx] || this.playerMon.species?.moves[0];
    if (!move) return;

    this.activeAttackType = move.type.toLowerCase();
    this.attackAnimTimer = 30;
    this.dialogText = `${this.playerMon.species?.name} used ${move.name}!`;

    gbaAudio.playPokemonAttack(
      move.type === 'Fire' ? 'fire' :
      move.type === 'Electric' ? 'thunder' :
      move.type === 'Water' ? 'water' : 'tackle'
    );

    setTimeout(() => {
      const dmg = Math.max(5, Math.floor(move.power * 0.4 + (this.playerMon.level * 2) - 3));
      this.wildMon.currentHp = Math.max(0, this.wildMon.currentHp - dmg);

      if (this.wildMon.currentHp <= 0) {
        this.mode = 'BATTLE_WON';
        this.battlesWon++;
        this.score += 250 * this.wildMon.level;
        this.dialogText = `Foe ${this.wildMon.species?.name} fainted! Gained EXP! [Press A]`;
        gbaAudio.playPokeballCatch();
        savePokemonScore('RED', this.score, `Pokedex: ${this.caughtCount} | Wins: ${this.battlesWon}`);
        this.onScoreUpdate?.(this.score, this.caughtCount);
      } else {
        // Foe retaliation
        setTimeout(() => {
          this.dialogText = `Foe ${this.wildMon.species?.name} used TACKLE!`;
          gbaAudio.playPokemonAttack('tackle');
          const foeDmg = Math.max(3, Math.floor(this.wildMon.level * 2.5));
          this.playerMon.currentHp = Math.max(1, this.playerMon.currentHp - foeDmg);
          this.isSubMenuFight = false;

          setTimeout(() => {
            if (this.mode === 'BATTLE') {
              this.dialogText = `What will ${this.playerMon.species?.name || 'TORCHIC'} do?`;
            }
          }, 1200);
        }, 1200);
      }
    }, 600);
  }

  private useBagItem(itemIdx: number) {
    const item = this.bagItems[itemIdx];
    if (!item || item.count <= 0) {
      this.dialogText = 'You are out of this item!';
      return;
    }

    item.count--;
    this.isSubMenuBag = false;

    if (item.type === 'ball') {
      this.dialogText = `Player used one POKÉ BALL!`;
      this.ballThrowState = 'flying';
      this.ballTimer = 0;
      this.ballShakeCount = 0;
      gbaAudio.playMarioCoin();

      setTimeout(() => {
        this.ballThrowState = 'shaking';
        this.doBallShake(1);
      }, 700);
    } else if (item.type === 'potion') {
      this.playerMon.currentHp = Math.min(this.playerMon.maxHp, this.playerMon.currentHp + 20);
      this.dialogText = `${this.playerMon.species?.name} recovered 20 HP!`;
      gbaAudio.playMarioPowerup();
    }
  }

  private doBallShake(shakeNum: number) {
    if (shakeNum <= 3) {
      this.ballShakeCount = shakeNum;
      gbaAudio.playHingeClick();
      setTimeout(() => {
        this.doBallShake(shakeNum + 1);
      }, 700);
    } else {
      // Caught!
      this.ballThrowState = 'caught';
      this.mode = 'CAUGHT';
      this.caughtCount++;
      this.score += 500;
      this.dialogText = `Gotcha! ${this.wildMon.species?.name} was caught! [Press A]`;
      gbaAudio.playPokeballCatch();
      savePokemonScore('RED', this.score, `Pokedex: ${this.caughtCount} | Wins: ${this.battlesWon}`);
      this.onScoreUpdate?.(this.score, this.caughtCount);
    }
  }

  private update() {
    if (this.mode === 'OVERWORLD') {
      let dx = 0;
      let dy = 0;
      if (this.keys.left) { dx -= this.player.speed; this.player.dir = 'LEFT'; }
      if (this.keys.right) { dx += this.player.speed; this.player.dir = 'RIGHT'; }
      if (this.keys.up) { dy -= this.player.speed; this.player.dir = 'UP'; }
      if (this.keys.down) { dy += this.player.speed; this.player.dir = 'DOWN'; }

      if (dx !== 0 || dy !== 0) {
        this.player.isMoving = true;
        this.player.walkTimer += 0.2;
        if (this.player.walkTimer > 1) {
          this.player.step = (this.player.step + 1) % 4;
          this.player.walkTimer = 0;
        }
        this.player.x = Math.max(16, Math.min(224, this.player.x + dx));
        this.player.y = Math.max(24, Math.min(136, this.player.y + dy));

        // Check if player is in tall grass (patches in the middle and top-right)
        const inGrass = (this.player.x > 30 && this.player.x < 110 && this.player.y > 40 && this.player.y < 100) ||
                        (this.player.x > 140 && this.player.x < 210 && this.player.y > 60 && this.player.y < 120);

        if (inGrass && Math.random() < 0.015) {
          this.triggerWildBattle();
        }
      } else {
        this.player.isMoving = false;
        this.player.step = 0;
      }
    } else if (this.mode === 'BATTLE_INTRO') {
      this.battleIntroProgress += 0.05;
      if (this.battleIntroProgress >= 1) {
        this.mode = 'BATTLE';
        this.dialogText = `Wild ${this.wildMon.species?.name} appeared!`;
      }
    }
  }

  public render() {
    this.update();
    const ctx = this.ctx;

    if (this.mode === 'STARTER_SELECT') {
      this.renderStarterSelect(ctx);
    } else if (this.mode === 'OVERWORLD') {
      this.renderOverworld(ctx);
    } else if (this.mode === 'BATTLE_INTRO') {
      this.renderBattleIntro(ctx);
    } else {
      this.renderBattle(ctx);
    }
  }

  private renderStarterSelect(ctx: CanvasRenderingContext2D) {
    // Birch lab background
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(0, 0, 240, 160);

    // Title banner
    ctx.fillStyle = '#059669';
    ctx.fillRect(0, 0, 240, 24);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.fillText('SELECT YOUR STARTER', 28, 16);

    // Render 4 starter cards
    this.starterList.forEach((mon, idx) => {
      const x = 16 + idx * 54;
      const y = 40;
      const isSelected = idx === this.selectedStarterIndex;

      // Card box
      ctx.fillStyle = isSelected ? '#d1fae5' : '#ffffff';
      ctx.fillRect(x, y, 48, 60);
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.strokeStyle = isSelected ? '#059669' : '#9ca3af';
      ctx.strokeRect(x, y, 48, 60);

      // Icon preview
      ctx.fillStyle = mon.color;
      ctx.beginPath();
      ctx.arc(x + 24, y + 26, 14, 0, Math.PI * 2);
      ctx.fill();

      // Simple creature face
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 18, y + 22, 3, 3);
      ctx.fillRect(x + 27, y + 22, 3, 3);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 19, y + 23, 2, 2);
      ctx.fillRect(x + 28, y + 23, 2, 2);

      // Name & type
      ctx.fillStyle = '#1f2937';
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.fillText(mon.name.slice(0, 6), x + 4, y + 48);
      ctx.fillStyle = mon.color;
      ctx.fillText(mon.type, x + 6, y + 56);
    });

    // Dialog banner at bottom
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 115, 240, 45);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 117, 236, 41);

    ctx.fillStyle = '#ffffff';
    ctx.font = '7px "Press Start 2P", monospace';
    const chosen = this.starterList[this.selectedStarterIndex];
    ctx.fillText(`Starter: ${chosen.name} (${chosen.type})`, 10, 130);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Use ◄ / ► to select, press A to take!', 10, 145);
  }

  private renderOverworld(ctx: CanvasRenderingContext2D) {
    // Lush Hoenn grass background
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(0, 0, 240, 160);

    // Dirt path
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(100, 0, 40, 160);
    ctx.fillRect(40, 70, 160, 25);

    // Tall grass patches
    ctx.fillStyle = '#15803d';
    // Left patch
    for (let gx = 32; gx < 100; gx += 10) {
      for (let gy = 40; gy < 70; gy += 10) {
        this.drawGrassTuft(ctx, gx, gy);
      }
    }
    // Right patch
    for (let gx = 140; gx < 210; gx += 10) {
      for (let gy = 95; gy < 140; gy += 10) {
        this.drawGrassTuft(ctx, gx, gy);
      }
    }

    // Border trees
    for (let tx = 0; tx < 240; tx += 16) {
      this.drawTree(ctx, tx, 0);
      this.drawTree(ctx, tx, 144);
    }
    for (let ty = 0; ty < 160; ty += 16) {
      this.drawTree(ctx, 0, ty);
      this.drawTree(ctx, 224, ty);
    }

    // Little flowers
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(70, 25, 3, 3);
    ctx.fillRect(180, 45, 3, 3);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(80, 120, 3, 3);

    // Player sprite (Ruby / Brendan with red/white cap)
    const px = this.player.x;
    const py = this.player.y;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(px + 6, py + 14, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#dc2626'; // Red shirt
    ctx.fillRect(px + 2, py + 5, 8, 7);
    // Head / Cap
    ctx.fillStyle = '#ffffff'; // White cap
    ctx.fillRect(px + 2, py, 8, 5);
    ctx.fillStyle = '#1e293b'; // Hair
    ctx.fillRect(px + 2, py + 4, 8, 2);
    // Legs
    ctx.fillStyle = '#1e3a8a';
    const legOffset = this.player.isMoving && this.player.step % 2 === 1 ? 2 : 0;
    ctx.fillRect(px + 2, py + 11, 3, 4 + legOffset);
    ctx.fillRect(px + 7, py + 11, 3, 4 - legOffset);

    // HUD banner top
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, 0, 240, 16);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillText(`ROUTE 101 | ${this.playerMon.species?.name} Lv.${this.playerMon.level}`, 6, 11);
    ctx.fillStyle = '#facc15';
    ctx.fillText(`CAUGHT: ${this.caughtCount}`, 175, 11);

    // Dialog banner bottom
    if (this.dialogText) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(10, 132, 220, 22);
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 132, 220, 22);
      ctx.fillStyle = '#1f2937';
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.fillText(this.dialogText.slice(0, 42), 14, 146);
    }
  }

  private drawGrassTuft(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#166534';
    ctx.fillRect(x, y + 2, 8, 6);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x + 1, y, 2, 5);
    ctx.fillRect(x + 4, y - 1, 2, 6);
    ctx.fillRect(x + 6, y + 1, 2, 4);
  }

  private drawTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 6, y + 8, 4, 8);
    ctx.fillStyle = '#14532d';
    ctx.fillRect(x + 2, y, 12, 10);
    ctx.fillStyle = '#15803d';
    ctx.fillRect(x + 4, y + 2, 8, 6);
  }

  private renderBattleIntro(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 240, 160);

    // Swirling GBA battle transition
    const slices = 10;
    const h = 160 / slices;
    for (let i = 0; i < slices; i++) {
      const offset = (i % 2 === 0 ? 1 : -1) * (1 - this.battleIntroProgress) * 240;
      ctx.fillStyle = i % 2 === 0 ? '#10b981' : '#059669';
      ctx.fillRect(offset, i * h, 240, h);
    }
  }

  private renderBattle(ctx: CanvasRenderingContext2D) {
    // Battle Arena Background (Gradient sky + grassy base)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 100);
    skyGrad.addColorStop(0, '#bae6fd');
    skyGrad.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 240, 100);

    // Foe platform (top right)
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.ellipse(175, 45, 45, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Player platform (bottom left)
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.ellipse(65, 95, 55, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Foe Pokémon HUD
    if (this.wildMon.species) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(10, 8, 105, 28);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 8, 105, 28);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 6px "Press Start 2P", monospace';
      ctx.fillText(this.wildMon.species.name, 14, 18);
      ctx.fillText(`Lv.${this.wildMon.level}`, 85, 18);

      // HP Bar
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(35, 23, 72, 6);
      const foeHpPct = Math.max(0, this.wildMon.currentHp / this.wildMon.maxHp);
      ctx.fillStyle = foeHpPct > 0.5 ? '#22c55e' : foeHpPct > 0.2 ? '#eab308' : '#ef4444';
      ctx.fillRect(35, 23, Math.floor(72 * foeHpPct), 6);
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('HP', 16, 29);

      // Draw Foe Sprite (or Pokéball if catching)
      if (this.ballThrowState === 'shaking' || this.ballThrowState === 'caught') {
        // Draw Pokeball shaking
        const bx = 175 + (this.ballThrowState === 'shaking' ? Math.sin(Date.now() * 0.02) * 4 : 0);
        const by = 36;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(bx, by, 7, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(bx, by, 7, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.fillRect(bx - 7, by - 1, 14, 2);
        ctx.beginPath();
        ctx.arc(bx, by, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Foe creature sprite
        ctx.fillStyle = this.wildMon.species.color;
        ctx.beginPath();
        ctx.arc(175, 34, 16, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(167, 30, 4, 4);
        ctx.fillRect(177, 30, 4, 4);
        ctx.fillStyle = '#000000';
        ctx.fillRect(168, 31, 2, 2);
        ctx.fillRect(178, 31, 2, 2);
      }
    }

    // Player Pokémon HUD
    if (this.playerMon.species) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(125, 68, 105, 32);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.strokeRect(125, 68, 105, 32);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 6px "Press Start 2P", monospace';
      ctx.fillText(this.playerMon.species.name, 129, 78);
      ctx.fillText(`Lv.${this.playerMon.level}`, 200, 78);

      // HP Bar
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(150, 83, 72, 6);
      const playerHpPct = Math.max(0, this.playerMon.currentHp / this.playerMon.maxHp);
      ctx.fillStyle = playerHpPct > 0.5 ? '#22c55e' : playerHpPct > 0.2 ? '#eab308' : '#ef4444';
      ctx.fillRect(150, 83, Math.floor(72 * playerHpPct), 6);
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('HP', 131, 89);

      ctx.fillStyle = '#475569';
      ctx.fillText(`${this.playerMon.currentHp}/${this.playerMon.maxHp}`, 170, 97);

      // Player back sprite
      ctx.fillStyle = this.playerMon.species.color;
      ctx.beginPath();
      ctx.arc(65, 80, 20, 0, Math.PI * 2);
      ctx.fill();
      // Ears/Details
      ctx.fillRect(52, 62, 6, 8);
      ctx.fillRect(72, 62, 6, 8);
    }

    // Lower Command Console / Dialog Area
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 102, 240, 58);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 104, 236, 54);

    if (this.isSubMenuFight && this.playerMon.species) {
      // 4 Moves Menu
      this.playerMon.species.moves.forEach((move, i) => {
        const mx = 10 + (i % 2) * 110;
        const my = 118 + Math.floor(i / 2) * 18;
        const isSel = i === this.moveMenuOption;

        ctx.fillStyle = isSel ? '#facc15' : '#ffffff';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillText(`${isSel ? '▶ ' : '  '}${move.name}`, mx, my);
      });
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('[B] BACK', 185, 153);
    } else if (this.isSubMenuBag) {
      // Bag Menu
      this.bagItems.forEach((item, idx) => {
        const isSel = idx === this.bagOption;
        ctx.fillStyle = isSel ? '#facc15' : '#ffffff';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillText(`${isSel ? '▶ ' : '  '}${item.name} x${item.count}`, 15, 122 + idx * 16);
      });
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('[B] BACK', 185, 153);
    } else if (this.mode === 'BATTLE') {
      // Dialog Text on Left (width 130)
      ctx.fillStyle = '#ffffff';
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.fillText(this.dialogText.slice(0, 20), 10, 124);
      ctx.fillText(this.dialogText.slice(20, 45), 10, 138);

      // 4-Button Grid on Right
      const options = ['FIGHT', 'BAG', 'POKÉMON', 'RUN'];
      options.forEach((opt, idx) => {
        const ox = 145 + (idx % 2) * 45;
        const oy = 120 + Math.floor(idx / 2) * 18;
        const isSel = idx === this.battleMenuOption;

        ctx.fillStyle = isSel ? '#facc15' : '#94a3b8';
        ctx.font = 'bold 6px "Press Start 2P", monospace';
        ctx.fillText(`${isSel ? '▶' : ''}${opt}`, ox, oy);
      });
    } else {
      // Victory / Caught / Result text
      ctx.fillStyle = '#ffffff';
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.fillText(this.dialogText.slice(0, 42), 10, 126);
      ctx.fillText(this.dialogText.slice(42, 84), 10, 140);
    }
  }

  private startLoop() {
    this.isRunning = true;
    const loop = () => {
      if (!this.isRunning) return;
      this.render();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  public destroy() {
    this.isRunning = false;
    cancelAnimationFrame(this.animId);
  }
}
