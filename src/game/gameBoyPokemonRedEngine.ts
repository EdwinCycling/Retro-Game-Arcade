/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Nintendo Game Boy (1996) Pokémon Red & Blue Engine (DMG-APAE-USA)
 * Recreates Red in Pallet Town, Tall Grass encounters, and the iconic 8-bit turn-based Battle Arena.
 */

import { GameBoyPaletteMode, GAME_BOY_PALETTES } from './gameBoyTypes';
import { gameBoyAudio } from './gameBoyAudio';

export class GameBoyPokemonRedEngine {
  public palette: GameBoyPaletteMode = 'dmg';
  public state: 'TITLE' | 'OVERWORLD' | 'BATTLE' | 'VICTORY' = 'TITLE';

  // Overworld Red Position
  public x: number = 72;
  public y: number = 72;
  public facing: 'up' | 'down' | 'left' | 'right' = 'down';

  // Battle State
  public playerPokemon = {
    name: 'PIKACHU',
    level: 5,
    hp: 20,
    maxHp: 20,
    moves: ['THUNDERSHOCK', 'QUICK ATTACK', 'TAIL WHIP', 'GROWL']
  };

  public wildPokemon = {
    name: 'PIDGEY',
    level: 3,
    hp: 14,
    maxHp: 14
  };

  public battleMenuIndex: number = 0; // 0: FIGHT, 1: PKMN, 2: ITEM, 3: RUN
  public moveMenuIndex: number = 0;
  public battleSubState: 'MAIN_MENU' | 'MOVE_MENU' | 'ATTACKING' | 'ENEMY_TURN' | 'CAUGHT' = 'MAIN_MENU';
  public battleMessage: string = 'What will PIKACHU do?';
  public battleAnimTimer: number = 0;

  private animTimer: number = 0;
  private keyState = { left: false, right: false, up: false, down: false, a: false, b: false };

  constructor() {
    this.initOverworld();
  }

  public initOverworld() {
    this.x = 72;
    this.y = 80;
    this.facing = 'down';
    this.playerPokemon.hp = 20;
    this.wildPokemon.hp = 14;
    this.battleSubState = 'MAIN_MENU';
  }

  public startGame() {
    this.state = 'OVERWORLD';
    this.initOverworld();
    gameBoyAudio.startPokemonRedBGM();
  }

  public triggerBattle() {
    this.state = 'BATTLE';
    this.wildPokemon.hp = 14;
    this.battleSubState = 'MAIN_MENU';
    this.battleMessage = `Wild ${this.wildPokemon.name} appeared!`;
    gameBoyAudio.startPokemonBattleBGM();
  }

  public setKey(key: 'left' | 'right' | 'up' | 'down' | 'a' | 'b', pressed: boolean) {
    this.keyState[key] = pressed;
    if (!pressed) return;

    if (this.state === 'OVERWORLD') {
      const step = 16;
      if (key === 'left') { this.x -= step; this.facing = 'left'; }
      if (key === 'right') { this.x += step; this.facing = 'right'; }
      if (key === 'up') { this.y -= step; this.facing = 'up'; }
      if (key === 'down') { this.y += step; this.facing = 'down'; }

      this.x = Math.max(16, Math.min(136, this.x));
      this.y = Math.max(32, Math.min(120, this.y));

      // Tall grass encounter trigger (y < 60)
      if (this.y < 60 && Math.random() < 0.35) {
        this.triggerBattle();
      }
    } else if (this.state === 'BATTLE') {
      if (this.battleSubState === 'MAIN_MENU') {
        if (key === 'left' || key === 'right') {
          this.battleMenuIndex = (this.battleMenuIndex % 2 === 0) ? this.battleMenuIndex + 1 : this.battleMenuIndex - 1;
        }
        if (key === 'up' || key === 'down') {
          this.battleMenuIndex = (this.battleMenuIndex < 2) ? this.battleMenuIndex + 2 : this.battleMenuIndex - 2;
        }
        if (key === 'a') {
          if (this.battleMenuIndex === 0) {
            // FIGHT
            this.battleSubState = 'MOVE_MENU';
          } else if (this.battleMenuIndex === 3) {
            // RUN
            this.state = 'OVERWORLD';
            gameBoyAudio.startPokemonRedBGM();
          } else if (this.battleMenuIndex === 2) {
            // ITEM: POKEBALL
            this.battleMessage = 'Threw a POKÉBALL!';
            this.battleSubState = 'CAUGHT';
            setTimeout(() => {
              this.battleMessage = `Gotcha! ${this.wildPokemon.name} was caught!`;
              gameBoyAudio.playPokemonVictory();
              setTimeout(() => {
                this.state = 'OVERWORLD';
                gameBoyAudio.startPokemonRedBGM();
              }, 1500);
            }, 1000);
          }
        }
      } else if (this.battleSubState === 'MOVE_MENU') {
        if (key === 'up') this.moveMenuIndex = Math.max(0, this.moveMenuIndex - 1);
        if (key === 'down') this.moveMenuIndex = Math.min(3, this.moveMenuIndex + 1);
        if (key === 'b') this.battleSubState = 'MAIN_MENU';
        if (key === 'a') {
          this.executeAttack();
        }
      }
    }
  }

  private executeAttack() {
    const move = this.playerPokemon.moves[this.moveMenuIndex];
    this.battleMessage = `PIKACHU used ${move}!`;
    this.battleSubState = 'ATTACKING';
    gameBoyAudio.playPokemonAttack();

    setTimeout(() => {
      this.wildPokemon.hp = Math.max(0, this.wildPokemon.hp - 7);
      if (this.wildPokemon.hp <= 0) {
        this.battleMessage = `Enemy ${this.wildPokemon.name} fainted!`;
        gameBoyAudio.playPokemonVictory();
        setTimeout(() => {
          this.state = 'OVERWORLD';
          gameBoyAudio.startPokemonRedBGM();
        }, 2000);
      } else {
        // Enemy Turn
        this.battleSubState = 'ENEMY_TURN';
        this.battleMessage = `${this.wildPokemon.name} used GUST!`;
        setTimeout(() => {
          this.playerPokemon.hp = Math.max(0, this.playerPokemon.hp - 4);
          this.battleSubState = 'MAIN_MENU';
          this.battleMessage = 'What will PIKACHU do?';
        }, 1200);
      }
    }, 1000);
  }

  public update(dt: number) {
    this.animTimer += dt;
  }

  public render(ctx: CanvasRenderingContext2D) {
    const pal = GAME_BOY_PALETTES[this.palette].colors;
    const [c0, c1, c2, c3] = pal;

    // Background
    ctx.fillStyle = c0;
    ctx.fillRect(0, 0, 160, 144);

    if (this.state === 'TITLE') {
      ctx.fillStyle = c3;
      ctx.font = 'bold 12px monospace';
      ctx.fillText('POKéMON', 52, 34);
      ctx.font = 'bold 8px monospace';
      ctx.fillText('RED & BLUE VERSION', 32, 48);
      ctx.font = '7px monospace';
      ctx.fillText('©1996 GAME FREAK / NINTENDO', 20, 64);

      // Pikachu Sprite
      ctx.fillStyle = c2;
      ctx.beginPath();
      ctx.arc(80, 84, 14, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.fillStyle = c3;
      ctx.fillRect(68, 64, 4, 10);
      ctx.fillRect(88, 64, 4, 10);

      ctx.fillText('PRESS START', 48, 122);
      return;
    }

    if (this.state === 'OVERWORLD') {
      // Pallet Town / Route 1 Buildings & Tall Grass
      ctx.fillStyle = c1;
      // Tall grass patch top
      for (let tx = 16; tx < 144; tx += 16) {
        for (let ty = 32; ty < 64; ty += 16) {
          ctx.fillStyle = c2;
          ctx.fillRect(tx, ty, 14, 14);
          ctx.fillStyle = c3;
          ctx.fillRect(tx + 2, ty + 2, 3, 10);
          ctx.fillRect(tx + 8, ty + 2, 3, 10);
        }
      }

      // Oak's Lab / House Roofs
      ctx.fillStyle = c3;
      ctx.fillRect(16, 80, 48, 36);
      ctx.fillStyle = c0;
      ctx.fillRect(24, 92, 12, 12); // Window
      ctx.fillRect(44, 96, 12, 20); // Door

      // Red (Player)
      ctx.fillStyle = c3;
      ctx.fillRect(this.x, this.y, 10, 6); // Cap
      ctx.fillStyle = c1;
      ctx.fillRect(this.x + 1, this.y + 4, 8, 4); // Face
      ctx.fillStyle = c3;
      ctx.fillRect(this.x, this.y + 8, 10, 8); // Vest

      // HUD
      ctx.fillStyle = c0;
      ctx.fillRect(0, 0, 160, 14);
      ctx.fillStyle = c3;
      ctx.font = 'bold 7px monospace';
      ctx.fillText('ROUTE 1 - TALL GRASS', 4, 10);
    } else if (this.state === 'BATTLE') {
      // Enemy Pokémon Box (Top Right)
      ctx.fillStyle = c0;
      ctx.fillRect(80, 10, 76, 26);
      ctx.strokeStyle = c3;
      ctx.strokeRect(80, 10, 76, 26);

      ctx.fillStyle = c3;
      ctx.font = 'bold 7px monospace';
      ctx.fillText(`${this.wildPokemon.name} :L${this.wildPokemon.level}`, 84, 20);
      ctx.fillText('HP:', 84, 30);
      // HP Bar
      const enemyHpPct = this.wildPokemon.hp / this.wildPokemon.maxHp;
      ctx.strokeRect(98, 24, 52, 6);
      ctx.fillStyle = c3;
      ctx.fillRect(99, 25, Math.floor(50 * enemyHpPct), 4);

      // Enemy Sprite (Pidgey)
      ctx.fillStyle = c2;
      ctx.beginPath();
      ctx.arc(40, 40, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c3;
      ctx.fillRect(42, 36, 4, 3); // Beak

      // Player Pokémon Box (Bottom Left)
      ctx.fillStyle = c0;
      ctx.fillRect(6, 62, 80, 30);
      ctx.strokeStyle = c3;
      ctx.strokeRect(6, 62, 80, 30);

      ctx.fillStyle = c3;
      ctx.fillText(`${this.playerPokemon.name} :L${this.playerPokemon.level}`, 10, 72);
      ctx.fillText('HP:', 10, 82);
      const playerHpPct = this.playerPokemon.hp / this.playerPokemon.maxHp;
      ctx.strokeRect(26, 76, 54, 6);
      ctx.fillRect(27, 77, Math.floor(52 * playerHpPct), 4);
      ctx.fillText(`${this.playerPokemon.hp}/${this.playerPokemon.maxHp}`, 40, 90);

      // Player Back Sprite (Pikachu tail & back)
      ctx.fillStyle = c3;
      ctx.beginPath();
      ctx.arc(120, 80, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c2;
      ctx.fillRect(132, 60, 6, 16); // Lightning tail

      // Bottom Dialogue / Action Window
      ctx.fillStyle = c0;
      ctx.fillRect(0, 96, 160, 48);
      ctx.strokeStyle = c3;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(2, 96, 156, 46);

      ctx.fillStyle = c3;
      ctx.font = 'bold 7px monospace';

      if (this.battleSubState === 'MAIN_MENU') {
        ctx.fillText(this.battleMessage, 8, 110);
        // 2x2 Menu
        ctx.fillText((this.battleMenuIndex === 0 ? '▶' : ' ') + 'FIGHT', 84, 120);
        ctx.fillText((this.battleMenuIndex === 1 ? '▶' : ' ') + 'PKMN', 124, 120);
        ctx.fillText((this.battleMenuIndex === 2 ? '▶' : ' ') + 'ITEM', 84, 134);
        ctx.fillText((this.battleMenuIndex === 3 ? '▶' : ' ') + 'RUN', 124, 134);
      } else if (this.battleSubState === 'MOVE_MENU') {
        for (let i = 0; i < 4; i++) {
          const move = this.playerPokemon.moves[i];
          const mx = i % 2 === 0 ? 12 : 84;
          const my = i < 2 ? 114 : 130;
          ctx.fillText((this.moveMenuIndex === i ? '▶' : ' ') + move, mx, my);
        }
      } else {
        ctx.fillText(this.battleMessage, 10, 120);
      }
    }
  }
}
