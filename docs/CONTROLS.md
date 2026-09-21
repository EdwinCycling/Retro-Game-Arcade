# 🎮 Universal Controls & Input Guide

The **Classic Retro Arcade** supports four distinct control schemes out of the box: Keyboard, Gamepad (Xbox / PlayStation), Mobile Tilt (Gyroscope), and Touch Screen Gestures.

---

## 1. Keyboard Controls

### Universal Navigation & System Keys
- **Arrow Keys / WASD**: Steer, move, jump, duck
- **Spacebar**: Primary Action (Fire, Jump, Swing Crowbar, Hit Ball)
- **P**: Pause / Unpause Game
- **M**: Mute / Unmute Chiptune Audio
- **R**: Restart current session
- **ESC / Back Button**: Exit cabinet and return to Arcade Lobby

### Specific Game Bindings

#### 🏎️ OutRun (1986)
- **Up Arrow / W**: Accelerate (Up to 293 km/h in High Gear)
- **Down Arrow / S**: Brakes
- **Left / Right / A / D**: Steer Ferrari Testarossa
- **Space / H**: Shift Gear (Low ↔ High)
- **1, 2, 3**: Switch in-car FM Radio Station (*Passing Breeze*, *Magical Sound Shower*, *Splash Wave*)

#### 🚀 Exile (1988)
- **Left / Right / A / D**: Thrusters Left / Right
- **Up Arrow / W**: Vertical Jetpack Thruster (Counteracts gravity)
- **Down Arrow / S**: Crouch / Descend
- **Space / F**: Fire Particle Blaster
- **G / E**: Grab or Throw Boulder / Equipment
- **T**: Activate Personal Teleporter
- **M**: Toggle Phoebus Planetary Map

#### 🏰 King's Quest I & Space Quest I
- **Arrow Keys**: Move Sir Graham / Roger Wilco across screens
- **Text Parser Input Box**: Type commands like:
  - `LOOK AROUND` / `KIJK ROND`
  - `OPEN DOOR` / `OPEN DEUR`
  - `TAKE DAGGER` / `PAK MES`
  - `TALK TO ELF` / `PRAAT MET ELF`
  - `INVENTORY` / `RUGZAK`

#### 🥊 Double Dragon (1987)
- **Arrow Keys**: 8-way movement across the street plane
- **Z / J**: Punch
- **X / K**: Kick
- **C / L**: Jump (Combine with Punch/Kick for flying kick)
- **Z + X (simultaneously)**: Devastating Back Elbow strike

#### 🔫 FPS Games (DOOM, Wolfenstein 3D, Duke Nukem 3D, Half-Life)
- **W / A / S / D**: Walk forward/backward, Strafe left/right
- **Mouse / Left / Right Arrow**: Turn view
- **Left Click / Space / Ctrl**: Fire active weapon
- **1 - 5**: Select weapon (Crowbar/Fists, Pistol, Shotgun, Chaingun, Rocket)
- **E**: Open doors and push hidden wall secrets

---

## 2. Xbox & PlayStation Gamepad Controller

Plug in any USB or Bluetooth gamepad (Xbox Series X/S, Xbox One, PS4/PS5 DualShock/DualSense, 8BitDo, or generic PC controllers). The application automatically detects connection via the browser Gamepad API.

```
                  [LT / L2]                 [RT / R2]
             (Brake / Sec. Fire)      (Accelerate / Prim. Fire)
                  [LB / L1]                 [RB / R1]
               (Prev. Weapon)             (Next. Weapon)

             [   D-PAD   ]                  (Y / △)
          (8-Way Movement)          (Map / Teleport / Jump)
                                       (X / □)    (B / ○)
                                      (Action)   (Alt / Throw)
               ( L-Stick )                  (A / ✕)
           (Analog Steering)          (Primary Fire / Enter)
                                            ( R-Stick )
                                         (Look / Camera)
```

- **Live Controller Telemetry**: Click the **🎮 Xbox** button in the header bar to open the live visual controller mapping overlay. Every physical button press is mirrored in real-time.

---

## 3. Mobile Tilt (Gyroscope Motion Controls)

Supported on modern iOS (Safari) and Android (Chrome) devices equipped with an accelerometer and gyroscope.

### How to Use:
1. Tap the **Tilt & Touch** button in the lobby or inside the cabinet.
2. In the game control strip, tap **Kantelen / Tilt AAN**.
3. **Calibrate Neutral Position**: Hold your phone in your hands at your comfortable natural playing angle and tap **Kalibreer (Calibrate)**. This subtracts current sensor tilt and treats it as center $(0,0)$.
4. **Steering**:
   - **Tilt phone left/right**: Moves your spaceship, Pac-Man, or car left/right.
   - **Tilt phone forward/backward**: Moves your character up/down.

### iOS Safari Permissions:
When prompted by Safari, tap **Allow** for *Motion and Orientation Access*. If you previously dismissed this prompt:
- Open iOS **Settings** → **Safari** → Enable **Motion & Direction Access**.

---

## 4. Touchscreen & Swipe Gestures

Designed for tablet and smartphone players without physical keyboards:

- **Canvas Swipe Gestures**:
  - Swipe your finger across the game display in any direction to turn immediately.
  - Supported in: *Pac-Man*, *Frogger*, *Q\*bert*, *Temple Run 3D*.
- **On-Screen Virtual D-Pads**:
  - Ergonomic translucent thumb pads appear on mobile viewports for directional movement.
- **Dedicated Virtual Action Triggers**:
  - Large tactile buttons for Fire, Jump, Thrust, and Coin-Insert positioned within thumb reach.
- **Haptic Vibration**:
  - Automatically triggers gentle vibration feedback when changing direction or firing weapons on supported mobile browsers.
