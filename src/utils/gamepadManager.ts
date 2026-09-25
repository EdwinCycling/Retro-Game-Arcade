/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Xbox / Gamepad Controller Manager for Retro Arcade Vault.
 * Supports standard Gamepad API (Xbox 360, Xbox One, Xbox Series X|S, PlayStation, standard USB controllers).
 * Automatically translates controller buttons and analog thumbstick axes to synthetic keyboard events
 * matching each specific game's control schema.
 */

export interface ControllerState {
  connected: boolean;
  id: string;
  buttons: boolean[];
  axes: number[];
}

export interface GamepadSnapshot {
  connected: boolean;
  id: string;
  buttons: Set<string>;
  rt: number;
  lt: number;
  leftStick: { x: number; y: number };
  rightStick: { x: number; y: number };
}

export type GamepadCallback = (state: ControllerState) => void;

class GamepadManager {
  private activeGame: string | null = null;
  private animFrameId: number | null = null;
  private prevButtonStates: Record<number, boolean> = {};
  private prevAxisStates: Record<string, boolean> = {};
  private listeners: Set<GamepadCallback> = new Set();
  private isPolling = false;
  private lastConnectedState = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('gamepadconnected', this.handleConnected);
      window.addEventListener('gamepaddisconnected', this.handleDisconnected);
    }
  }

  public subscribe(callback: GamepadCallback): () => void {
    this.listeners.add(callback);
    callback(this.getCurrentState());
    return () => this.listeners.delete(callback);
  }

  public getCurrentState(): ControllerState {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) {
      return { connected: false, id: '', buttons: [], axes: [] };
    }
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (gp && gp.connected) {
        return {
          connected: true,
          id: gp.id,
          buttons: gp.buttons.map(b => b.pressed),
          axes: [...gp.axes]
        };
      }
    }
    return { connected: false, id: '', buttons: [], axes: [] };
  }

  public getSnapshot(): GamepadSnapshot {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) {
      return {
        connected: false,
        id: '',
        buttons: new Set<string>(),
        rt: 0,
        lt: 0,
        leftStick: { x: 0, y: 0 },
        rightStick: { x: 0, y: 0 }
      };
    }
    const gamepads = navigator.getGamepads();
    let activeGamepad: Gamepad | null = null;
    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (gp && gp.connected) {
        activeGamepad = gp;
        break;
      }
    }

    if (!activeGamepad) {
      return {
        connected: false,
        id: '',
        buttons: new Set<string>(),
        rt: 0,
        lt: 0,
        leftStick: { x: 0, y: 0 },
        rightStick: { x: 0, y: 0 }
      };
    }

    const btnSet = new Set<string>();
    const isPressed = (index: number) => {
      const b = activeGamepad!.buttons[index];
      return !!(b && (b.pressed || b.value > 0.45));
    };

    if (isPressed(0)) btnSet.add('A');
    if (isPressed(1)) btnSet.add('B');
    if (isPressed(2)) btnSet.add('X');
    if (isPressed(3)) btnSet.add('Y');
    if (isPressed(4)) btnSet.add('LB');
    if (isPressed(5)) btnSet.add('RB');
    if (isPressed(6)) btnSet.add('LT');
    if (isPressed(7)) btnSet.add('RT');
    if (isPressed(8)) btnSet.add('View');
    if (isPressed(9)) btnSet.add('Menu');
    if (isPressed(10)) btnSet.add('LS');
    if (isPressed(11)) btnSet.add('RS');
    if (isPressed(12)) btnSet.add('DpadUp');
    if (isPressed(13)) btnSet.add('DpadDown');
    if (isPressed(14)) btnSet.add('DpadLeft');
    if (isPressed(15)) btnSet.add('DpadRight');

    const ltValue = activeGamepad.buttons[6]?.value ?? (isPressed(6) ? 1 : 0);
    const rtValue = activeGamepad.buttons[7]?.value ?? (isPressed(7) ? 1 : 0);

    const lx = activeGamepad.axes[0] || 0;
    const ly = activeGamepad.axes[1] || 0;
    const rx = activeGamepad.axes[2] || 0;
    const ry = activeGamepad.axes[3] || 0;

    return {
      connected: true,
      id: activeGamepad.id,
      buttons: btnSet,
      lt: ltValue,
      rt: rtValue,
      leftStick: { x: Math.abs(lx) < 0.1 ? 0 : lx, y: Math.abs(ly) < 0.1 ? 0 : ly },
      rightStick: { x: Math.abs(rx) < 0.1 ? 0 : rx, y: Math.abs(ry) < 0.1 ? 0 : ry },
    };
  }

  public start(gameId: string) {
    this.activeGame = gameId;
    this.prevButtonStates = {};
    this.prevAxisStates = {};
    if (!this.isPolling) {
      this.isPolling = true;
      this.poll();
    }
  }

  public stop() {
    this.activeGame = null;
    this.isPolling = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    // Release any stuck keys
    this.releaseAllKeys();
  }

  private handleConnected = (e: GamepadEvent) => {
    this.notifyListeners();
  };

  private handleDisconnected = (e: GamepadEvent) => {
    this.notifyListeners();
  };

  private notifyListeners() {
    const state = this.getCurrentState();
    if (state.connected !== this.lastConnectedState) {
      this.lastConnectedState = state.connected;
    }
    this.listeners.forEach(cb => cb(state));
  }

  private poll = () => {
    if (!this.isPolling) return;

    if (typeof navigator !== 'undefined' && navigator.getGamepads) {
      const gamepads = navigator.getGamepads();
      let activeGamepad: Gamepad | null = null;
      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i] && gamepads[i]?.connected) {
          activeGamepad = gamepads[i];
          break;
        }
      }

      if (activeGamepad && this.activeGame) {
        this.processGamepadInput(activeGamepad, this.activeGame);
      }
    }

    this.animFrameId = requestAnimationFrame(this.poll);
  };

  private dispatchKey(key: string, code: string, isDown: boolean) {
    const eventType = isDown ? 'keydown' : 'keyup';
    const event = new KeyboardEvent(eventType, {
      key,
      code,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
  }

  private updateButtonKey(buttonIndex: number, isPressed: boolean, key: string, code: string) {
    const wasPressed = !!this.prevButtonStates[buttonIndex];
    if (isPressed && !wasPressed) {
      this.prevButtonStates[buttonIndex] = true;
      this.dispatchKey(key, code, true);
    } else if (!isPressed && wasPressed) {
      this.prevButtonStates[buttonIndex] = false;
      this.dispatchKey(key, code, false);
    }
  }

  private updateAxisKey(axisKey: string, isPressed: boolean, key: string, code: string) {
    const wasPressed = !!this.prevAxisStates[axisKey];
    if (isPressed && !wasPressed) {
      this.prevAxisStates[axisKey] = true;
      this.dispatchKey(key, code, true);
    } else if (!isPressed && wasPressed) {
      this.prevAxisStates[axisKey] = false;
      this.dispatchKey(key, code, false);
    }
  }

  private releaseAllKeys() {
    // Release previous buttons
    Object.keys(this.prevButtonStates).forEach(idx => {
      this.prevButtonStates[Number(idx)] = false;
    });
    Object.keys(this.prevAxisStates).forEach(k => {
      this.prevAxisStates[k] = false;
    });
  }

  private processGamepadInput(gp: Gamepad, gameId: string) {
    if (gameId === 'sudoku') return;
    const btn = (index: number) => gp.buttons[index]?.pressed || (gp.buttons[index]?.value || 0) > 0.5;
    const axis = (index: number) => gp.axes[index] || 0;

    const deadzone = 0.35;
    const stickLeft = axis(0) < -deadzone;
    const stickRight = axis(0) > deadzone;
    const stickUp = axis(1) < -deadzone;
    const stickDown = axis(1) > deadzone;

    const dpadUp = btn(12) || stickUp;
    const dpadDown = btn(13) || stickDown;
    const dpadLeft = btn(14) || stickLeft;
    const dpadRight = btn(15) || stickRight;

    // Default direction mapping (Arrow keys)
    this.updateAxisKey('up', dpadUp, 'ArrowUp', 'ArrowUp');
    this.updateAxisKey('down', dpadDown, 'ArrowDown', 'ArrowDown');
    if (gameId !== 'arkanoid' && gameId !== 'galaga') {
      this.updateAxisKey('left', dpadLeft, 'ArrowLeft', 'ArrowLeft');
      this.updateAxisKey('right', dpadRight, 'ArrowRight', 'ArrowRight');
    }

    // Start / Menu button (Pause / Start)
    this.updateButtonKey(9, btn(9), 'p', 'KeyP');

    // Specific game logic
    switch (gameId) {
      case 'ps1': {
        // D-pad / Left Stick
        this.updateAxisKey('ps1_up', dpadUp, 'ArrowUp', 'ArrowUp');
        this.updateAxisKey('ps1_down', dpadDown, 'ArrowDown', 'ArrowDown');
        this.updateAxisKey('ps1_left', dpadLeft, 'ArrowLeft', 'ArrowLeft');
        this.updateAxisKey('ps1_right', dpadRight, 'ArrowRight', 'ArrowRight');

        // A / Cross (0) -> Jump / Accelerate (Space / ArrowUp)
        // B / Circle (1) -> Brake / Spin (ArrowDown / z)
        // X / Square (2) -> Spin (x)
        // RT / LT -> Accelerate / Brake
        const jumpAcc = btn(0) || btn(7);
        const spinBrake = btn(1) || btn(2) || btn(6);

        this.updateButtonKey(0, jumpAcc, ' ', 'Space');
        this.updateButtonKey(1, spinBrake, 'z', 'KeyZ');
        this.updateButtonKey(2, btn(2), 'x', 'KeyX');
        break;
      }

      case 'outrun': {
        // Accelerate: RT (Right Trigger) or A button or D-pad/Stick Up
        const gas = btn(7) || btn(0) || dpadUp;
        // Brake: LT (Left Trigger) or B button or D-pad/Stick Down
        const brake = btn(6) || btn(1) || dpadDown;
        // Steer Left / Right
        const steerLeft = dpadLeft;
        const steerRight = dpadRight;
        // Gear Shift: X button or LB or RB
        const gearShift = btn(2) || btn(4) || btn(5);
        // Radio Next Station: Y button
        const nextRadio = btn(3);

        this.updateButtonKey(7, gas, 'ArrowUp', 'ArrowUp');
        this.updateButtonKey(6, brake, 'ArrowDown', 'ArrowDown');
        this.updateAxisKey('outrun_left', steerLeft, 'ArrowLeft', 'ArrowLeft');
        this.updateAxisKey('outrun_right', steerRight, 'ArrowRight', 'ArrowRight');
        this.updateButtonKey(2, gearShift, ' ', 'Space');
        this.updateButtonKey(3, nextRadio, 'r', 'KeyR');
        break;
      }

      case 'qbert': {
        // Isometric jumping: D-pad / Stick
        const act = btn(0) || btn(1) || btn(7);
        this.updateButtonKey(0, act, ' ', 'Space');
        break;
      }

      case 'rocket_raid': {
        // Space / A / RT = Fire lasers forward, B / LT / X = Drop bombs downward
        const fire = btn(0) || btn(7);
        const bomb = btn(1) || btn(6) || btn(2);
        this.updateButtonKey(0, fire, ' ', 'Space');
        this.updateButtonKey(1, bomb, 'b', 'KeyB');
        break;
      }

      case 'zaxxon': {
        // D-pad / Stick = Altitude (Up/Down) & Bank (Left/Right)
        // A / RT = Laser Cannon
        const fire = btn(0) || btn(7) || btn(2);
        this.updateButtonKey(0, fire, ' ', 'Space');
        break;
      }

      case 'doom':
      case 'duke':
      case 'half_life': {
        // RT / A = Shoot, X / Spatie = Use / Open, LT = Alternate / Jump
        const shoot = btn(7) || btn(0);
        const use = btn(2);
        const jumpAlt = btn(1) || btn(6);
        this.updateButtonKey(7, shoot, 'Control', 'ControlLeft');
        this.updateButtonKey(2, use, ' ', 'Space');
        this.updateButtonKey(1, jumpAlt, 'e', 'KeyE');
        break;
      }

      case 'double_dragon': {
        // A = Punch, B = Kick, X / Y = Jump
        const punch = btn(0);
        const kick = btn(1);
        const jump = btn(2) || btn(3);
        this.updateButtonKey(0, punch, 'z', 'KeyZ');
        this.updateButtonKey(1, kick, 'x', 'KeyX');
        this.updateButtonKey(2, jump, 'c', 'KeyC');
        break;
      }

      case 'c64_pinball': {
        // LT / LB / A = Left Flipper, RT / RB = Right Flipper, A / Dpad Down = Plunger (Space)
        const leftFlipper = btn(4) || btn(6); // LB or LT
        const rightFlipper = btn(5) || btn(7); // RB or RT
        const plunger = btn(0); // A button
        const nudge = btn(1) || btn(2); // B or X button

        this.updateButtonKey(4, leftFlipper, 'z', 'KeyZ');
        this.updateButtonKey(5, rightFlipper, '/', 'Slash');
        this.updateButtonKey(0, plunger, ' ', 'Space');
        this.updateButtonKey(1, nudge, 'n', 'KeyN');
        break;
      }

      case 'wolfenstein': {
        // RT / A = Shoot (Ctrl), X / Spatie = Open doors (Space), LB / RB = Weapon change (1 / 2)
        const shoot = btn(7) || btn(2); // RT or X
        const open = btn(0); // A button
        const run = btn(10) || btn(4); // L3 or LB
        const prevWpn = btn(4); // LB
        const nextWpn = btn(5); // RB

        this.updateButtonKey(7, shoot, 'Control', 'ControlLeft');
        this.updateButtonKey(0, open, ' ', 'Space');
        this.updateButtonKey(10, run, 'Shift', 'ShiftLeft');
        this.updateButtonKey(4, prevWpn, '1', 'Digit1');
        this.updateButtonKey(5, nextWpn, '2', 'Digit2');
        break;
      }

      case 'super_mario': {
        // A / B = Jump (z / Space), X / Y / RT = Run / Fire (x / Shift)
        const jump = btn(0) || btn(1); // A or B
        const runFire = btn(2) || btn(3) || btn(7); // X or Y or RT

        this.updateButtonKey(0, jump, 'z', 'KeyZ');
        this.updateButtonKey(2, runFire, 'x', 'KeyX');
        break;
      }

      case 'mario': {
        // A / B = Jump (Space)
        const jump = btn(0) || btn(1) || btn(2);
        this.updateButtonKey(0, jump, ' ', 'Space');
        break;
      }

      case 'tetris': {
        // A = Rotate Right (Up / Space), B/X = Rotate Left (z), RT = Hard Drop (Space)
        const rotate = btn(0) || btn(3); // A or Y
        const hardDrop = btn(7) || btn(1); // RT or B
        this.updateButtonKey(0, rotate, 'ArrowUp', 'ArrowUp');
        this.updateButtonKey(7, hardDrop, ' ', 'Space');
        break;
      }

      case 'arcadians': {
        // Z = Left, X = Right, Space/Enter = Fire (A / RT)
        const fire = btn(0) || btn(7) || btn(2);
        this.updateButtonKey(0, fire, ' ', 'Space');
        this.updateAxisKey('arc_left', dpadLeft, 'z', 'KeyZ');
        this.updateAxisKey('arc_right', dpadRight, 'x', 'KeyX');
        break;
      }

      case 'frak': {
        // Z = Left, X = Right, Space = Jump (A), Return = Yo-yo (X / RT)
        const jump = btn(0);
        const yoyo = btn(2) || btn(7);
        this.updateButtonKey(0, jump, ' ', 'Space');
        this.updateButtonKey(2, yoyo, 'Enter', 'Enter');
        this.updateAxisKey('frak_left', dpadLeft, 'z', 'KeyZ');
        this.updateAxisKey('frak_right', dpadRight, 'x', 'KeyX');
        break;
      }

      case 'chuckie_egg': {
        // Z / X = Left/Right, ' / / = Up/Down, Space = Jump (A)
        const jump = btn(0) || btn(1);
        this.updateButtonKey(0, jump, ' ', 'Space');
        this.updateAxisKey('ce_left', dpadLeft, 'z', 'KeyZ');
        this.updateAxisKey('ce_right', dpadRight, 'x', 'KeyX');
        this.updateAxisKey('ce_up', dpadUp, "'", 'Quote');
        this.updateAxisKey('ce_down', dpadDown, '/', 'Slash');
        break;
      }

      case 'repton': {
        // Arrows = Move, Space = Freeze time / Map (A)
        const act = btn(0) || btn(2);
        this.updateButtonKey(0, act, ' ', 'Space');
        break;
      }

      case 'lode_runner': {
        // Dig Left: X / Square (btn 2) or LB / LT (btn 4, 6) -> 'z' / 'KeyZ'
        const digL = btn(2) || btn(4) || btn(6);
        // Dig Right: B / Circle (btn 1) or A / Cross (btn 0) or RB / RT (btn 5, 7) -> 'c' / 'KeyC'
        const digR = btn(1) || btn(0) || btn(5) || btn(7);
        this.updateButtonKey(2, digL, 'z', 'KeyZ');
        this.updateButtonKey(1, digR, 'c', 'KeyC');
        break;
      }

      case 'demon_attack':
      case 'space_invaders': {
        // Arrows = Move, Space = Fire (A / RT)
        const fire = btn(0) || btn(7) || btn(2);
        this.updateButtonKey(0, fire, ' ', 'Space');
        break;
      }

      case 'kings_quest':
      case 'space_quest': {
        // Arrows = Move, Space / Enter = Interact (A)
        const act = btn(0) || btn(2);
        this.updateButtonKey(0, act, ' ', 'Space');
        break;
      }

      case 'battle_chess': {
        // Cursor movement via arrows, Select via A (Enter / Space)
        const select = btn(0);
        const cancel = btn(1);
        this.updateButtonKey(0, select, 'Enter', 'Enter');
        this.updateButtonKey(1, cancel, 'Escape', 'Escape');
        break;
      }

      case 'eindeloos': {
        // A / RT = Fire rockets / Start / Activate checkpoint (Space)
        const fire = btn(0) || btn(7);
        // B / LT = Speed cycle (B / KeyB)
        const actB = btn(1) || btn(6);
        // X / LB = Stootkussen / Bumper trainer toggle (K / KeyK)
        const bumperToggle = btn(2) || btn(4);
        // Y / RB / View = Toggle Fullscreen Radar Map (M / KeyM)
        const mapToggle = btn(3) || btn(5) || btn(8);
        // Start / Menu = Pause (P / KeyP)
        const pause = btn(9);

        this.updateButtonKey(0, fire, ' ', 'Space');
        this.updateButtonKey(1, actB, 'b', 'KeyB');
        this.updateButtonKey(2, bumperToggle, 'k', 'KeyK');
        this.updateButtonKey(3, mapToggle, 'm', 'KeyM');
        this.updateButtonKey(9, pause, 'p', 'KeyP');
        break;
      }

      case 'exile': {
        // A / RT = Jetpack Thrust (ArrowUp)
        const thrust = btn(0) || btn(7);
        // X / RB = Fire Weapon (KeyF)
        const fire = btn(2) || btn(5);
        // B = Grab / Throw Object (KeyG)
        const grab = btn(1);
        // Y = Warp to Teleport Beacon (KeyT)
        const warp = btn(3);
        // LB = Cycle Weapon (KeyQ)
        const cycleWpn = btn(4);
        // Select / View = Toggle Map View (KeyM)
        const map = btn(8);
        // Start / Menu = Pause (KeyP)
        const pause = btn(9);

        this.updateButtonKey(0, thrust, 'ArrowUp', 'ArrowUp');
        this.updateButtonKey(2, fire, 'f', 'KeyF');
        this.updateButtonKey(1, grab, 'g', 'KeyG');
        this.updateButtonKey(3, warp, 't', 'KeyT');
        this.updateButtonKey(4, cycleWpn, 'q', 'KeyQ');
        this.updateButtonKey(8, map, 'm', 'KeyM');
        this.updateButtonKey(9, pause, 'p', 'KeyP');
        break;
      }

      case 'arkanoid': {
        // A / RT / X = Fire Lasers or Release Ball (Space)
        const launchFire = btn(0) || btn(7) || btn(2);
        this.updateButtonKey(0, launchFire, ' ', 'Space');
        break;
      }

      case 'mastermind': {
        // D-Pad / Left Stick for slot navigation and color cycling
        const dpadUp = btn(12) || gp.axes[1] < -0.4;
        const dpadDown = btn(13) || gp.axes[1] > 0.4;
        const dpadLeft = btn(14) || gp.axes[0] < -0.4;
        const dpadRight = btn(15) || gp.axes[0] > 0.4;

        this.updateAxisKey('mm_left', dpadLeft, 'ArrowLeft', 'ArrowLeft');
        this.updateAxisKey('mm_right', dpadRight, 'ArrowRight', 'ArrowRight');
        this.updateAxisKey('mm_up', dpadUp, 'ArrowUp', 'ArrowUp');
        this.updateAxisKey('mm_down', dpadDown, 'ArrowDown', 'ArrowDown');

        // A / Cross = Place current color / Cycle peg color (Space)
        const select = btn(0);
        // B / Circle = Clear current slot (Backspace)
        const clearSlot = btn(1);
        // X / Square = Clear current row (c)
        const clearRow = btn(2);
        // Y / Triangle = Hint (h)
        const hint = btn(3);
        // LB = Previous Color (q)
        const prevCol = btn(4);
        // RB = Next Color (e)
        const nextCol = btn(5);
        // RT / Start = Check guess (Enter)
        const submit = btn(7) || btn(9);
        // Select / View = New Game (n)
        const newGame = btn(8);

        this.updateButtonKey(0, select, ' ', 'Space');
        this.updateButtonKey(1, clearSlot, 'Backspace', 'Backspace');
        this.updateButtonKey(2, clearRow, 'c', 'KeyC');
        this.updateButtonKey(3, hint, 'h', 'KeyH');
        this.updateButtonKey(4, prevCol, 'q', 'KeyQ');
        this.updateButtonKey(5, nextCol, 'e', 'KeyE');
        this.updateButtonKey(7, submit, 'Enter', 'Enter');
        this.updateButtonKey(8, newGame, 'n', 'KeyN');
        break;
      }

      case 'pong':
      case 'frogger':
      case 'pacman':
      default: {
        // A / RT = Action / Fire / Serve (Space)
        const action = btn(0) || btn(7) || btn(2);
        this.updateButtonKey(0, action, ' ', 'Space');
        break;
      }
    }
  }
}

export const gamepadManager = new GamepadManager();
