/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Nintendo Game Boy (DMG-01 / 1989) Interactive Handheld Cabinet & Dual-Game System
 * Features Super Mario Land (1989), Tetris (1989), Cartridge Swapper, Contrast Dial, and 4 Color Palettes.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Trophy, 
  BookOpen, 
  RotateCcw, 
  Power,
  Palette,
  Disc,
  Grid,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { 
  GameBoyCartridgeId, 
  GameBoyPaletteMode, 
  GAME_BOY_CARTRIDGES, 
  GAME_BOY_PALETTES 
} from '../game/gameBoyTypes';
import { SuperMarioLandEngine } from '../game/superMarioLandEngine';
import { GameBoyTetrisEngine } from '../game/gameBoyTetrisEngine';
import { GameBoyDrMarioEngine } from '../game/gameBoyDrMarioEngine';
import { GameBoyMetroid2Engine } from '../game/gameBoyMetroid2Engine';
import { GameBoyKirbyEngine } from '../game/gameBoyKirbyEngine';
import { GameBoyMarioLand2Engine } from '../game/gameBoyMarioLand2Engine';
import { GameBoyZeldaLaEngine } from '../game/gameBoyZeldaLaEngine';
import { GameBoyDonkeyKong94Engine } from '../game/gameBoyDonkeyKong94Engine';
import { GameBoyPokemonRedEngine } from '../game/gameBoyPokemonRedEngine';
import { GameBoyWarioLand2Engine } from '../game/gameBoyWarioLand2Engine';
import { gameBoyAudio } from '../game/gameBoyAudio';
import { getMarioLandScores, getTetrisScores, MarioLandScore, TetrisScore } from '../game/gameBoyHighScores';
import { GameBoyHistoryModal } from './GameBoyHistoryModal';
import { haptics } from '../utils/haptics';

interface GameBoyCabinetProps {
  initialCartridge?: GameBoyCartridgeId;
  onBackToLobby: () => void;
  lang?: 'nl' | 'en';
}

export const GameBoyCabinet: React.FC<GameBoyCabinetProps> = ({
  initialCartridge = 'mario_land',
  onBackToLobby,
  lang = 'nl'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const smlEngineRef = useRef<SuperMarioLandEngine | null>(null);
  const tetrisEngineRef = useRef<GameBoyTetrisEngine | null>(null);
  const drMarioEngineRef = useRef<GameBoyDrMarioEngine | null>(null);
  const metroid2EngineRef = useRef<GameBoyMetroid2Engine | null>(null);
  const kirbyEngineRef = useRef<GameBoyKirbyEngine | null>(null);
  const sml2EngineRef = useRef<GameBoyMarioLand2Engine | null>(null);
  const zeldaLaEngineRef = useRef<GameBoyZeldaLaEngine | null>(null);
  const dk94EngineRef = useRef<GameBoyDonkeyKong94Engine | null>(null);
  const pokemonRedEngineRef = useRef<GameBoyPokemonRedEngine | null>(null);
  const wario2EngineRef = useRef<GameBoyWarioLand2Engine | null>(null);

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Game Boy Hardware State
  const [isPoweredOn, setIsPoweredOn] = useState<boolean>(true);
  const [bootSequence, setBootSequence] = useState<boolean>(true);
  const [bootLogoY, setBootLogoY] = useState<number>(-20);
  const [activeCartridge, setActiveCartridge] = useState<GameBoyCartridgeId>(initialCartridge);
  const [paletteMode, setPaletteMode] = useState<GameBoyPaletteMode>('dmg');
  const [contrast, setContrast] = useState<number>(100);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(70);
  const [pixelGrid, setPixelGrid] = useState<boolean>(true);

  // UI Modals & Drawers
  const [isCartridgeTrayOpen, setIsCartridgeTrayOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isScoresOpen, setIsScoresOpen] = useState<boolean>(false);
  const [marioScores, setMarioScores] = useState<MarioLandScore[]>([]);
  const [tetrisScoresList, setTetrisScoresList] = useState<TetrisScore[]>([]);

  // Initialize Engines
  useEffect(() => {
    smlEngineRef.current = new SuperMarioLandEngine();
    tetrisEngineRef.current = new GameBoyTetrisEngine();
    drMarioEngineRef.current = new GameBoyDrMarioEngine();
    metroid2EngineRef.current = new GameBoyMetroid2Engine();
    kirbyEngineRef.current = new GameBoyKirbyEngine();
    sml2EngineRef.current = new GameBoyMarioLand2Engine();
    zeldaLaEngineRef.current = new GameBoyZeldaLaEngine();
    dk94EngineRef.current = new GameBoyDonkeyKong94Engine();
    pokemonRedEngineRef.current = new GameBoyPokemonRedEngine();
    wario2EngineRef.current = new GameBoyWarioLand2Engine();

    setMarioScores(getMarioLandScores());
    setTetrisScoresList(getTetrisScores());

    // Boot chime & falling Nintendo logo animation
    startBootSequence();

    return () => {
      gameBoyAudio.stopBgm();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Synchronize palette mode
  useEffect(() => {
    if (smlEngineRef.current) smlEngineRef.current.palette = paletteMode;
    if (tetrisEngineRef.current) tetrisEngineRef.current.palette = paletteMode;
    if (drMarioEngineRef.current) drMarioEngineRef.current.palette = paletteMode;
    if (metroid2EngineRef.current) metroid2EngineRef.current.palette = paletteMode;
    if (kirbyEngineRef.current) kirbyEngineRef.current.palette = paletteMode;
    if (sml2EngineRef.current) sml2EngineRef.current.palette = paletteMode;
    if (zeldaLaEngineRef.current) zeldaLaEngineRef.current.palette = paletteMode;
    if (dk94EngineRef.current) dk94EngineRef.current.palette = paletteMode;
    if (pokemonRedEngineRef.current) pokemonRedEngineRef.current.palette = paletteMode;
    if (wario2EngineRef.current) wario2EngineRef.current.palette = paletteMode;
  }, [paletteMode]);

  // Handle audio volume & mute
  useEffect(() => {
    gameBoyAudio.setMuted(isMuted);
    gameBoyAudio.setVolume(volume / 100);
  }, [isMuted, volume]);

  const startBootSequence = useCallback(() => {
    setBootSequence(true);
    setBootLogoY(-15);
    gameBoyAudio.stopBgm();
    gameBoyAudio.playBootChime();

    let y = -15;
    const interval = setInterval(() => {
      y += 1.5;
      setBootLogoY(y);
      if (y >= 60) {
        clearInterval(interval);
        setTimeout(() => {
          setBootSequence(false);
          if (activeCartridge === 'mario_land') {
            smlEngineRef.current?.initLevel('1-1');
            gameBoyAudio.startSuperMarioLandBGM();
          } else if (activeCartridge === 'tetris_dmg') {
            tetrisEngineRef.current?.startGame('A-TYPE', 0);
          } else if (activeCartridge === 'dr_mario') {
            drMarioEngineRef.current?.initBottle();
          } else if (activeCartridge === 'metroid_2') {
            metroid2EngineRef.current?.initSurface();
          } else if (activeCartridge === 'kirby_dream_land') {
            kirbyEngineRef.current?.initLevel();
          } else if (activeCartridge === 'mario_land_2') {
            sml2EngineRef.current?.initLevel();
          } else if (activeCartridge === 'zelda_links_awakening') {
            zeldaLaEngineRef.current?.initRoom();
          } else if (activeCartridge === 'donkey_kong_94') {
            dk94EngineRef.current?.initStage();
          } else if (activeCartridge === 'pokemon_red') {
            pokemonRedEngineRef.current?.initOverworld();
          } else if (activeCartridge === 'wario_land_2') {
            wario2EngineRef.current?.initLevel();
          }
        }, 600);
      }
    }, 30);
  }, [activeCartridge]);

  const handleSwitchCartridge = (newCart: GameBoyCartridgeId) => {
    if (newCart === activeCartridge && !bootSequence) return;
    haptics.medium();
    setActiveCartridge(newCart);
    setIsCartridgeTrayOpen(false);
    startBootSequence();
  };

  const handleTogglePower = () => {
    haptics.medium();
    if (isPoweredOn) {
      setIsPoweredOn(false);
      gameBoyAudio.stopBgm();
    } else {
      setIsPoweredOn(true);
      startBootSequence();
    }
  };

  // Keyboard Input Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPoweredOn || bootSequence) return;

      const code = e.code;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyZ', 'KeyX', 'Enter', 'ShiftRight', 'ShiftLeft'].includes(code)) {
        e.preventDefault();
      }

      if (activeCartridge === 'mario_land' && smlEngineRef.current) {
        if (code === 'ArrowLeft' || code === 'KeyA') smlEngineRef.current.setKey('left', true);
        if (code === 'ArrowRight' || code === 'KeyD') smlEngineRef.current.setKey('right', true);
        if (code === 'ArrowUp' || code === 'KeyW') smlEngineRef.current.setKey('up', true);
        if (code === 'ArrowDown' || code === 'KeyS') smlEngineRef.current.setKey('down', true);
        if (code === 'KeyZ' || code === 'KeyK' || code === 'Space') smlEngineRef.current.setKey('a', true);
        if (code === 'KeyX' || code === 'KeyJ') smlEngineRef.current.setKey('b', true);
        if (code === 'Enter') {
          if (smlEngineRef.current.state === 'TITLE') smlEngineRef.current.startGame();
        }
      } else if (activeCartridge === 'tetris_dmg' && tetrisEngineRef.current) {
        if (code === 'ArrowLeft' || code === 'KeyA') tetrisEngineRef.current.setKey('left', true);
        if (code === 'ArrowRight' || code === 'KeyD') tetrisEngineRef.current.setKey('right', true);
        if (code === 'ArrowDown' || code === 'KeyS') tetrisEngineRef.current.setKey('down', true);
        if (code === 'KeyZ' || code === 'KeyK') tetrisEngineRef.current.setKey('rotateCCW', true);
        if (code === 'KeyX' || code === 'KeyJ' || code === 'ArrowUp') tetrisEngineRef.current.setKey('rotateCW', true);
        if (code === 'Space') tetrisEngineRef.current.setKey('hardDrop', true);
        if (code === 'Enter') {
          if (tetrisEngineRef.current.state === 'MENU') tetrisEngineRef.current.startGame('A-TYPE', 0);
        }
      } else if (activeCartridge === 'dr_mario' && drMarioEngineRef.current) {
        if (code === 'ArrowLeft' || code === 'KeyA') drMarioEngineRef.current.setKey('left', true);
        if (code === 'ArrowRight' || code === 'KeyD') drMarioEngineRef.current.setKey('right', true);
        if (code === 'ArrowDown' || code === 'KeyS') drMarioEngineRef.current.setKey('down', true);
        if (code === 'KeyZ' || code === 'KeyK') drMarioEngineRef.current.setKey('a', true);
        if (code === 'KeyX' || code === 'KeyJ' || code === 'ArrowUp') drMarioEngineRef.current.setKey('b', true);
        if (code === 'Enter') {
          if (drMarioEngineRef.current.state === 'TITLE') drMarioEngineRef.current.startGame();
        }
      } else if (activeCartridge === 'metroid_2' && metroid2EngineRef.current) {
        if (code === 'ArrowLeft' || code === 'KeyA') metroid2EngineRef.current.setKey('left', true);
        if (code === 'ArrowRight' || code === 'KeyD') metroid2EngineRef.current.setKey('right', true);
        if (code === 'ArrowUp' || code === 'KeyW') metroid2EngineRef.current.setKey('up', true);
        if (code === 'ArrowDown' || code === 'KeyS') metroid2EngineRef.current.setKey('down', true);
        if (code === 'KeyZ' || code === 'KeyK' || code === 'Space') metroid2EngineRef.current.setKey('a', true);
        if (code === 'KeyX' || code === 'KeyJ') metroid2EngineRef.current.setKey('b', true);
        if (code === 'ShiftLeft' || code === 'ShiftRight') metroid2EngineRef.current.setKey('select', true);
        if (code === 'Enter') {
          if (metroid2EngineRef.current.state === 'TITLE') metroid2EngineRef.current.startGame();
        }
      } else if (activeCartridge === 'kirby_dream_land' && kirbyEngineRef.current) {
        if (code === 'ArrowLeft' || code === 'KeyA') kirbyEngineRef.current.setKey('left', true);
        if (code === 'ArrowRight' || code === 'KeyD') kirbyEngineRef.current.setKey('right', true);
        if (code === 'ArrowUp' || code === 'KeyW') kirbyEngineRef.current.setKey('up', true);
        if (code === 'ArrowDown' || code === 'KeyS') kirbyEngineRef.current.setKey('down', true);
        if (code === 'KeyZ' || code === 'KeyK' || code === 'Space') kirbyEngineRef.current.setKey('a', true);
        if (code === 'KeyX' || code === 'KeyJ') kirbyEngineRef.current.setKey('b', true);
        if (code === 'Enter') {
          if (kirbyEngineRef.current.state === 'TITLE') kirbyEngineRef.current.startGame();
        }
      } else if (activeCartridge === 'mario_land_2' && sml2EngineRef.current) {
        if (code === 'ArrowLeft' || code === 'KeyA') sml2EngineRef.current.setKey('left', true);
        if (code === 'ArrowRight' || code === 'KeyD') sml2EngineRef.current.setKey('right', true);
        if (code === 'ArrowUp' || code === 'KeyW') sml2EngineRef.current.setKey('up', true);
        if (code === 'ArrowDown' || code === 'KeyS') sml2EngineRef.current.setKey('down', true);
        if (code === 'KeyZ' || code === 'KeyK' || code === 'Space') sml2EngineRef.current.setKey('a', true);
        if (code === 'KeyX' || code === 'KeyJ') sml2EngineRef.current.setKey('b', true);
        if (code === 'Enter') {
          if (sml2EngineRef.current.state === 'TITLE') sml2EngineRef.current.startGame();
        }
      } else if (activeCartridge === 'zelda_links_awakening' && zeldaLaEngineRef.current) {
        if (code === 'ArrowLeft' || code === 'KeyA') zeldaLaEngineRef.current.setKey('left', true);
        if (code === 'ArrowRight' || code === 'KeyD') zeldaLaEngineRef.current.setKey('right', true);
        if (code === 'ArrowUp' || code === 'KeyW') zeldaLaEngineRef.current.setKey('up', true);
        if (code === 'ArrowDown' || code === 'KeyS') zeldaLaEngineRef.current.setKey('down', true);
        if (code === 'KeyZ' || code === 'KeyK') zeldaLaEngineRef.current.setKey('a', true);
        if (code === 'KeyX' || code === 'KeyJ' || code === 'Space') zeldaLaEngineRef.current.setKey('b', true);
        if (code === 'Enter') {
          if (zeldaLaEngineRef.current.state === 'TITLE') zeldaLaEngineRef.current.startGame();
        }
      } else if (activeCartridge === 'donkey_kong_94' && dk94EngineRef.current) {
        if (code === 'ArrowLeft' || code === 'KeyA') dk94EngineRef.current.setKey('left', true);
        if (code === 'ArrowRight' || code === 'KeyD') dk94EngineRef.current.setKey('right', true);
        if (code === 'ArrowUp' || code === 'KeyW') dk94EngineRef.current.setKey('up', true);
        if (code === 'ArrowDown' || code === 'KeyS') dk94EngineRef.current.setKey('down', true);
        if (code === 'KeyZ' || code === 'KeyK' || code === 'Space') dk94EngineRef.current.setKey('a', true);
        if (code === 'KeyX' || code === 'KeyJ') dk94EngineRef.current.setKey('b', true);
        if (code === 'Enter') {
          if (dk94EngineRef.current.state === 'TITLE') dk94EngineRef.current.startGame();
        }
      } else if (activeCartridge === 'pokemon_red' && pokemonRedEngineRef.current) {
        if (code === 'ArrowLeft' || code === 'KeyA') pokemonRedEngineRef.current.setKey('left', true);
        if (code === 'ArrowRight' || code === 'KeyD') pokemonRedEngineRef.current.setKey('right', true);
        if (code === 'ArrowUp' || code === 'KeyW') pokemonRedEngineRef.current.setKey('up', true);
        if (code === 'ArrowDown' || code === 'KeyS') pokemonRedEngineRef.current.setKey('down', true);
        if (code === 'KeyZ' || code === 'KeyK' || code === 'Space') pokemonRedEngineRef.current.setKey('a', true);
        if (code === 'KeyX' || code === 'KeyJ') pokemonRedEngineRef.current.setKey('b', true);
        if (code === 'Enter') {
          if (pokemonRedEngineRef.current.state === 'TITLE') pokemonRedEngineRef.current.startGame();
        }
      } else if (activeCartridge === 'wario_land_2' && wario2EngineRef.current) {
        if (code === 'ArrowLeft' || code === 'KeyA') wario2EngineRef.current.setKey('left', true);
        if (code === 'ArrowRight' || code === 'KeyD') wario2EngineRef.current.setKey('right', true);
        if (code === 'ArrowUp' || code === 'KeyW') wario2EngineRef.current.setKey('up', true);
        if (code === 'ArrowDown' || code === 'KeyS') wario2EngineRef.current.setKey('down', true);
        if (code === 'KeyZ' || code === 'KeyK' || code === 'Space') wario2EngineRef.current.setKey('a', true);
        if (code === 'KeyX' || code === 'KeyJ') wario2EngineRef.current.setKey('b', true);
        if (code === 'Enter') {
          if (wario2EngineRef.current.state === 'TITLE') wario2EngineRef.current.startGame();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (activeCartridge === 'mario_land' && smlEngineRef.current) {
        if (code === 'ArrowLeft' || code === 'KeyA') smlEngineRef.current.setKey('left', false);
        if (code === 'ArrowRight' || code === 'KeyD') smlEngineRef.current.setKey('right', false);
        if (code === 'ArrowUp' || code === 'KeyW') smlEngineRef.current.setKey('up', false);
        if (code === 'ArrowDown' || code === 'KeyS') smlEngineRef.current.setKey('down', false);
        if (code === 'KeyZ' || code === 'KeyK' || code === 'Space') smlEngineRef.current.setKey('a', false);
        if (code === 'KeyX' || code === 'KeyJ') smlEngineRef.current.setKey('b', false);
      } else if (activeCartridge === 'tetris_dmg' && tetrisEngineRef.current) {
        if (code === 'ArrowLeft' || code === 'KeyA') tetrisEngineRef.current.setKey('left', false);
        if (code === 'ArrowRight' || code === 'KeyD') tetrisEngineRef.current.setKey('right', false);
        if (code === 'ArrowDown' || code === 'KeyS') tetrisEngineRef.current.setKey('down', false);
        if (code === 'KeyZ' || code === 'KeyK') tetrisEngineRef.current.setKey('rotateCCW', false);
        if (code === 'KeyX' || code === 'KeyJ' || code === 'ArrowUp') tetrisEngineRef.current.setKey('rotateCW', false);
        if (code === 'Space') tetrisEngineRef.current.setKey('hardDrop', false);
      } else if (activeCartridge === 'dr_mario' && drMarioEngineRef.current) {
        if (code === 'ArrowLeft' || code === 'KeyA') drMarioEngineRef.current.setKey('left', false);
        if (code === 'ArrowRight' || code === 'KeyD') drMarioEngineRef.current.setKey('right', false);
        if (code === 'ArrowDown' || code === 'KeyS') drMarioEngineRef.current.setKey('down', false);
        if (code === 'KeyZ' || code === 'KeyK') drMarioEngineRef.current.setKey('a', false);
        if (code === 'KeyX' || code === 'KeyJ' || code === 'ArrowUp') drMarioEngineRef.current.setKey('b', false);
      } else if (activeCartridge === 'metroid_2' && metroid2EngineRef.current) {
        if (code === 'ArrowLeft' || code === 'KeyA') metroid2EngineRef.current.setKey('left', false);
        if (code === 'ArrowRight' || code === 'KeyD') metroid2EngineRef.current.setKey('right', false);
        if (code === 'ArrowUp' || code === 'KeyW') metroid2EngineRef.current.setKey('up', false);
        if (code === 'ArrowDown' || code === 'KeyS') metroid2EngineRef.current.setKey('down', false);
        if (code === 'KeyZ' || code === 'KeyK' || code === 'Space') metroid2EngineRef.current.setKey('a', false);
        if (code === 'KeyX' || code === 'KeyJ') metroid2EngineRef.current.setKey('b', false);
      } else if (activeCartridge === 'kirby_dream_land' && kirbyEngineRef.current) {
        if (code === 'ArrowLeft' || code === 'KeyA') kirbyEngineRef.current.setKey('left', false);
        if (code === 'ArrowRight' || code === 'KeyD') kirbyEngineRef.current.setKey('right', false);
        if (code === 'ArrowUp' || code === 'KeyW') kirbyEngineRef.current.setKey('up', false);
        if (code === 'ArrowDown' || code === 'KeyS') kirbyEngineRef.current.setKey('down', false);
        if (code === 'KeyZ' || code === 'KeyK' || code === 'Space') kirbyEngineRef.current.setKey('a', false);
        if (code === 'KeyX' || code === 'KeyJ') kirbyEngineRef.current.setKey('b', false);
      } else if (activeCartridge === 'mario_land_2' && sml2EngineRef.current) {
        if (code === 'ArrowLeft' || code === 'KeyA') sml2EngineRef.current.setKey('left', false);
        if (code === 'ArrowRight' || code === 'KeyD') sml2EngineRef.current.setKey('right', false);
        if (code === 'ArrowUp' || code === 'KeyW') sml2EngineRef.current.setKey('up', false);
        if (code === 'ArrowDown' || code === 'KeyS') sml2EngineRef.current.setKey('down', false);
        if (code === 'KeyZ' || code === 'KeyK' || code === 'Space') sml2EngineRef.current.setKey('a', false);
        if (code === 'KeyX' || code === 'KeyJ') sml2EngineRef.current.setKey('b', false);
      } else if (activeCartridge === 'zelda_links_awakening' && zeldaLaEngineRef.current) {
        if (code === 'ArrowLeft' || code === 'KeyA') zeldaLaEngineRef.current.setKey('left', false);
        if (code === 'ArrowRight' || code === 'KeyD') zeldaLaEngineRef.current.setKey('right', false);
        if (code === 'ArrowUp' || code === 'KeyW') zeldaLaEngineRef.current.setKey('up', false);
        if (code === 'ArrowDown' || code === 'KeyS') zeldaLaEngineRef.current.setKey('down', false);
        if (code === 'KeyZ' || code === 'KeyK') zeldaLaEngineRef.current.setKey('a', false);
        if (code === 'KeyX' || code === 'KeyJ' || code === 'Space') zeldaLaEngineRef.current.setKey('b', false);
      } else if (activeCartridge === 'donkey_kong_94' && dk94EngineRef.current) {
        if (code === 'ArrowLeft' || code === 'KeyA') dk94EngineRef.current.setKey('left', false);
        if (code === 'ArrowRight' || code === 'KeyD') dk94EngineRef.current.setKey('right', false);
        if (code === 'ArrowUp' || code === 'KeyW') dk94EngineRef.current.setKey('up', false);
        if (code === 'ArrowDown' || code === 'KeyS') dk94EngineRef.current.setKey('down', false);
        if (code === 'KeyZ' || code === 'KeyK' || code === 'Space') dk94EngineRef.current.setKey('a', false);
        if (code === 'KeyX' || code === 'KeyJ') dk94EngineRef.current.setKey('b', false);
      } else if (activeCartridge === 'pokemon_red' && pokemonRedEngineRef.current) {
        if (code === 'ArrowLeft' || code === 'KeyA') pokemonRedEngineRef.current.setKey('left', false);
        if (code === 'ArrowRight' || code === 'KeyD') pokemonRedEngineRef.current.setKey('right', false);
        if (code === 'ArrowUp' || code === 'KeyW') pokemonRedEngineRef.current.setKey('up', false);
        if (code === 'ArrowDown' || code === 'KeyS') pokemonRedEngineRef.current.setKey('down', false);
        if (code === 'KeyZ' || code === 'KeyK' || code === 'Space') pokemonRedEngineRef.current.setKey('a', false);
        if (code === 'KeyX' || code === 'KeyJ') pokemonRedEngineRef.current.setKey('b', false);
      } else if (activeCartridge === 'wario_land_2' && wario2EngineRef.current) {
        if (code === 'ArrowLeft' || code === 'KeyA') wario2EngineRef.current.setKey('left', false);
        if (code === 'ArrowRight' || code === 'KeyD') wario2EngineRef.current.setKey('right', false);
        if (code === 'ArrowUp' || code === 'KeyW') wario2EngineRef.current.setKey('up', false);
        if (code === 'ArrowDown' || code === 'KeyS') wario2EngineRef.current.setKey('down', false);
        if (code === 'KeyZ' || code === 'KeyK' || code === 'Space') wario2EngineRef.current.setKey('a', false);
        if (code === 'KeyX' || code === 'KeyJ') wario2EngineRef.current.setKey('b', false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPoweredOn, bootSequence, activeCartridge]);

  // Main Render Loop
  useEffect(() => {
    const loop = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (!isPoweredOn) {
            // Screen is completely blank/powered off
            ctx.fillStyle = '#1c1c1c';
            ctx.fillRect(0, 0, 160, 144);
          } else if (bootSequence) {
            // Render Game Boy Boot Screen
            const pal = GAME_BOY_PALETTES[paletteMode].colors;
            ctx.fillStyle = pal[0];
            ctx.fillRect(0, 0, 160, 144);

            // Falling Nintendo Logo
            ctx.fillStyle = pal[3];
            ctx.font = 'bold 12px monospace';
            ctx.fillText('Nintendo®', 46, bootLogoY);
          } else {
            if (activeCartridge === 'mario_land' && smlEngineRef.current) {
              smlEngineRef.current.update(dt);
              smlEngineRef.current.render(ctx);
            } else if (activeCartridge === 'tetris_dmg' && tetrisEngineRef.current) {
              tetrisEngineRef.current.update(dt);
              tetrisEngineRef.current.render(ctx);
            } else if (activeCartridge === 'dr_mario' && drMarioEngineRef.current) {
              drMarioEngineRef.current.update(dt);
              drMarioEngineRef.current.render(ctx);
            } else if (activeCartridge === 'metroid_2' && metroid2EngineRef.current) {
              metroid2EngineRef.current.update(dt);
              metroid2EngineRef.current.render(ctx);
            } else if (activeCartridge === 'kirby_dream_land' && kirbyEngineRef.current) {
              kirbyEngineRef.current.update(dt);
              kirbyEngineRef.current.render(ctx);
            } else if (activeCartridge === 'mario_land_2' && sml2EngineRef.current) {
              sml2EngineRef.current.update(dt);
              sml2EngineRef.current.render(ctx);
            } else if (activeCartridge === 'zelda_links_awakening' && zeldaLaEngineRef.current) {
              zeldaLaEngineRef.current.update(dt);
              zeldaLaEngineRef.current.render(ctx);
            } else if (activeCartridge === 'donkey_kong_94' && dk94EngineRef.current) {
              dk94EngineRef.current.update(dt);
              dk94EngineRef.current.render(ctx);
            } else if (activeCartridge === 'pokemon_red' && pokemonRedEngineRef.current) {
              pokemonRedEngineRef.current.update(dt);
              pokemonRedEngineRef.current.render(ctx);
            } else if (activeCartridge === 'wario_land_2' && wario2EngineRef.current) {
              wario2EngineRef.current.update(dt);
              wario2EngineRef.current.render(ctx);
            }
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPoweredOn, bootSequence, activeCartridge, paletteMode, bootLogoY]);

  // Button Action Triggers for Touch / Click
  const pressButton = (button: 'left' | 'right' | 'up' | 'down' | 'a' | 'b' | 'select' | 'start') => {
    haptics.light();
    if (!isPoweredOn || bootSequence) return;

    if (activeCartridge === 'mario_land' && smlEngineRef.current) {
      if (button === 'start') {
        if (smlEngineRef.current.state === 'TITLE') smlEngineRef.current.startGame();
      } else if (button === 'a' || button === 'b' || button === 'left' || button === 'right' || button === 'up' || button === 'down') {
        smlEngineRef.current.setKey(button, true);
        setTimeout(() => smlEngineRef.current?.setKey(button, false), 150);
      }
    } else if (activeCartridge === 'tetris_dmg' && tetrisEngineRef.current) {
      if (button === 'start') {
        if (tetrisEngineRef.current.state === 'MENU') tetrisEngineRef.current.startGame('A-TYPE', 0);
      } else if (button === 'left') {
        tetrisEngineRef.current.setKey('left', true);
        setTimeout(() => tetrisEngineRef.current?.setKey('left', false), 100);
      } else if (button === 'right') {
        tetrisEngineRef.current.setKey('right', true);
        setTimeout(() => tetrisEngineRef.current?.setKey('right', false), 100);
      } else if (button === 'down') {
        tetrisEngineRef.current.setKey('down', true);
        setTimeout(() => tetrisEngineRef.current?.setKey('down', false), 100);
      } else if (button === 'a') {
        tetrisEngineRef.current.setKey('rotateCW', true);
        setTimeout(() => tetrisEngineRef.current?.setKey('rotateCW', false), 100);
      } else if (button === 'b') {
        tetrisEngineRef.current.setKey('rotateCCW', true);
        setTimeout(() => tetrisEngineRef.current?.setKey('rotateCCW', false), 100);
      }
    } else if (activeCartridge === 'dr_mario' && drMarioEngineRef.current) {
      if (button === 'start') {
        if (drMarioEngineRef.current.state === 'TITLE') drMarioEngineRef.current.startGame();
      } else if (button === 'left' || button === 'right' || button === 'down' || button === 'a' || button === 'b') {
        drMarioEngineRef.current.setKey(button, true);
        setTimeout(() => drMarioEngineRef.current?.setKey(button, false), 100);
      }
    } else if (activeCartridge === 'metroid_2' && metroid2EngineRef.current) {
      if (button === 'start') {
        if (metroid2EngineRef.current.state === 'TITLE') metroid2EngineRef.current.startGame();
      } else if (button === 'select') {
        metroid2EngineRef.current.setKey('select', true);
        setTimeout(() => metroid2EngineRef.current?.setKey('select', false), 100);
      } else if (button === 'left' || button === 'right' || button === 'up' || button === 'down' || button === 'a' || button === 'b') {
        metroid2EngineRef.current.setKey(button, true);
        setTimeout(() => metroid2EngineRef.current?.setKey(button, false), 120);
      }
    } else if (activeCartridge === 'kirby_dream_land' && kirbyEngineRef.current) {
      if (button === 'start') {
        if (kirbyEngineRef.current.state === 'TITLE') kirbyEngineRef.current.startGame();
      } else if (button === 'left' || button === 'right' || button === 'up' || button === 'down' || button === 'a' || button === 'b') {
        kirbyEngineRef.current.setKey(button, true);
        setTimeout(() => kirbyEngineRef.current?.setKey(button, false), 150);
      }
    } else if (activeCartridge === 'mario_land_2' && sml2EngineRef.current) {
      if (button === 'start') {
        if (sml2EngineRef.current.state === 'TITLE') sml2EngineRef.current.startGame();
      } else if (button === 'left' || button === 'right' || button === 'up' || button === 'down' || button === 'a' || button === 'b') {
        sml2EngineRef.current.setKey(button, true);
        setTimeout(() => sml2EngineRef.current?.setKey(button, false), 150);
      }
    } else if (activeCartridge === 'zelda_links_awakening' && zeldaLaEngineRef.current) {
      if (button === 'start') {
        if (zeldaLaEngineRef.current.state === 'TITLE') zeldaLaEngineRef.current.startGame();
      } else if (button === 'left' || button === 'right' || button === 'up' || button === 'down' || button === 'a' || button === 'b') {
        zeldaLaEngineRef.current.setKey(button, true);
        setTimeout(() => zeldaLaEngineRef.current?.setKey(button, false), 120);
      }
    } else if (activeCartridge === 'donkey_kong_94' && dk94EngineRef.current) {
      if (button === 'start') {
        if (dk94EngineRef.current.state === 'TITLE') dk94EngineRef.current.startGame();
      } else if (button === 'left' || button === 'right' || button === 'up' || button === 'down' || button === 'a' || button === 'b') {
        dk94EngineRef.current.setKey(button, true);
        setTimeout(() => dk94EngineRef.current?.setKey(button, false), 120);
      }
    } else if (activeCartridge === 'pokemon_red' && pokemonRedEngineRef.current) {
      if (button === 'start') {
        if (pokemonRedEngineRef.current.state === 'TITLE') pokemonRedEngineRef.current.startGame();
      } else if (button === 'left' || button === 'right' || button === 'up' || button === 'down' || button === 'a' || button === 'b') {
        pokemonRedEngineRef.current.setKey(button, true);
        setTimeout(() => pokemonRedEngineRef.current?.setKey(button, false), 120);
      }
    } else if (activeCartridge === 'wario_land_2' && wario2EngineRef.current) {
      if (button === 'start') {
        if (wario2EngineRef.current.state === 'TITLE') wario2EngineRef.current.startGame();
      } else if (button === 'left' || button === 'right' || button === 'up' || button === 'down' || button === 'a' || button === 'b') {
        wario2EngineRef.current.setKey(button, true);
        setTimeout(() => wario2EngineRef.current?.setKey(button, false), 150);
      }
    }
  };

  const currCartridgeInfo = GAME_BOY_CARTRIDGES[activeCartridge];

  return (
    <div className="w-full min-h-screen bg-neutral-950 flex flex-col items-center justify-between p-2 sm:p-4 text-white font-mono select-none overflow-x-hidden">
      {/* Top Header / Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 px-3 border-b border-neutral-800 bg-neutral-900/80 rounded-2xl backdrop-blur-md mb-3 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'en' ? 'Lobby' : 'Speelhal'}</span>
          </button>

          {/* Active Cartridge Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-neutral-800/80 border border-neutral-700 text-xs">
            <span>{currCartridgeInfo.icon}</span>
            <span className="font-bold text-neutral-100">{currCartridgeInfo.title}</span>
            <span className="text-[10px] text-neutral-400">({currCartridgeInfo.code})</span>
          </div>
        </div>

        {/* Console Action Bar */}
        <div className="flex items-center gap-2">
          {/* Cartridge Switcher Button */}
          <button
            onClick={() => setIsCartridgeTrayOpen(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Disc className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Switch Cartridge' : 'Wissel Spelcartridge'}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {/* Palette Switcher */}
          <button
            onClick={() => {
              const modes: GameBoyPaletteMode[] = ['dmg', 'pocket', 'light', 'sgb'];
              const next = modes[(modes.indexOf(paletteMode) + 1) % modes.length];
              setPaletteMode(next);
              haptics.light();
            }}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
            title="Wissel Scherm Palette"
          >
            <Palette className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{GAME_BOY_PALETTES[paletteMode].name.split(' ')[0]}</span>
          </button>

          {/* Dossier Modal */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Dossier</span>
          </button>

          {/* High Scores Modal */}
          <button
            onClick={() => {
              setMarioScores(getMarioLandScores());
              setTetrisScoresList(getTetrisScores());
              setIsScoresOpen(true);
            }}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden sm:inline">Records</span>
          </button>

          {/* Audio Toggle */}
          <button
            onClick={() => setIsMuted(prev => !prev)}
            className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Cartridge Selection Dropdown Drawer */}
      {isCartridgeTrayOpen && (
        <div className="w-full max-w-2xl bg-neutral-900 border-2 border-amber-600/50 rounded-2xl p-4 mb-4 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between mb-3 border-b border-neutral-800 pb-2">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Disc className="w-4 h-4" />
              <span>{lang === 'en' ? 'Nintendo Game Boy Cartridge Library' : 'Kies een Game Boy Spelcartridge:'}</span>
            </h4>
            <span className="text-[10px] text-neutral-400">Klik op een cartridge om direct te plaatsen</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
            {Object.values(GAME_BOY_CARTRIDGES).map((cart) => {
              const isSelected = activeCartridge === cart.id;
              return (
                <div
                  key={cart.id}
                  onClick={() => handleSwitchCartridge(cart.id)}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex gap-3 items-center ${
                    isSelected
                      ? 'bg-amber-950/60 border-amber-500 shadow-lg shadow-amber-900/30 ring-1 ring-amber-400/40'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60'
                  }`}
                >
                  {/* Gray 3D Game Boy Cartridge Shape */}
                  <div className="w-14 h-16 bg-neutral-300 rounded-t-lg rounded-b border-2 border-neutral-500 p-1 flex flex-col justify-between shadow-md shrink-0">
                    <div className="w-full h-1 bg-neutral-400 rounded-full" />
                    <div className={`w-full h-8 bg-gradient-to-br ${cart.coverGradient || 'from-neutral-600 to-neutral-800'} rounded text-[7px] text-white flex flex-col items-center justify-center font-bold text-center leading-tight shadow-inner px-0.5`}>
                      <span className="text-[10px]">{cart.icon}</span>
                      <span className="truncate w-full">{cart.title.split(' ')[0]}</span>
                    </div>
                    <div className="w-full text-center text-[6px] text-neutral-800 font-bold tracking-tighter truncate">{cart.code}</div>
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-white truncate">{cart.title}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-900/80 text-amber-200 border border-amber-700 font-mono">{cart.year}</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1 line-clamp-2 leading-snug">
                      {typeof cart.description === 'object' ? cart.description[lang] : cart.description}
                    </p>
                    {isSelected && (
                      <span className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                        <span>✓</span> {lang === 'en' ? 'Inserted in cartridge slot' : 'Nu in cartridge-slot'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Game Boy DMG-01 Physical Console Container */}
      <div className="relative flex flex-col items-center justify-center my-auto">
        {/* Top Cartridge Notch & Physical Slot */}
        <div className="w-72 sm:w-80 h-10 bg-neutral-400 rounded-t-2xl border-t-4 border-l-4 border-r-4 border-neutral-500 flex items-center justify-between px-6 shadow-inner relative z-0 -mb-2">
          {/* Power Switch Slider */}
          <div className="flex items-center gap-1.5 bg-neutral-600 px-2 py-0.5 rounded-full border border-neutral-700 shadow-inner">
            <button
              onClick={handleTogglePower}
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                isPoweredOn ? 'bg-emerald-500 text-black shadow-md' : 'bg-red-500 text-white'
              }`}
            >
              {isPoweredOn ? '◄ ON' : 'OFF ►'}
            </button>
          </div>

          {/* Visible Inserted Cartridge Back */}
          <div 
            onClick={() => setIsCartridgeTrayOpen(true)}
            className="flex items-center gap-1.5 bg-neutral-300 px-3 py-1 rounded-t border-t border-l border-r border-neutral-500 text-[9px] text-neutral-700 font-bold shadow cursor-pointer hover:bg-neutral-200"
          >
            <span>{currCartridgeInfo.icon}</span>
            <span>{currCartridgeInfo.title.substring(0, 12)}...</span>
          </div>

          {/* Contrast Knob Indicator */}
          <div className="text-[8px] text-neutral-600 font-bold uppercase tracking-tighter">
            CONTRAST
          </div>
        </div>

        {/* DMG-01 Main Body */}
        <div 
          className="relative w-[340px] sm:w-[380px] bg-[#d3d3cd] rounded-3xl border-4 border-[#b8b8b0] shadow-2xl p-5 sm:p-6 flex flex-col items-center z-10"
          style={{
            borderBottomRightRadius: '72px', // Iconic Game Boy curved bottom-right corner
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 2px 4px rgba(255, 255, 255, 0.4), inset 0 -4px 6px rgba(0,0,0,0.2)'
          }}
        >
          {/* Top Decorative Horizontal Inset Lines */}
          <div className="w-full flex justify-between items-center mb-3 px-2">
            <div className="flex gap-1">
              <div className="w-8 h-1 bg-[#b8b8b0] rounded-full" />
              <div className="w-16 h-1 bg-[#b8b8b0] rounded-full" />
            </div>
            <div className="text-[10px] text-neutral-600 font-bold tracking-widest uppercase">
              Dot Matrix Game
            </div>
          </div>

          {/* Screen Glass Bezel (Dark Grey with Magenta & Blue Stripes) */}
          <div className="relative w-full bg-[#828489] rounded-2xl p-4 sm:p-5 border-2 border-[#68696d] shadow-inner flex flex-col items-center">
            {/* Top Bezel Text & Dual Stripes */}
            <div className="w-full flex items-center justify-between text-[8px] text-neutral-300 font-bold mb-2 tracking-wider px-1">
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-0.5 bg-[#9c185a]" />
                <div className="w-8 h-0.5 bg-[#1b3d82]" />
              </div>
              <span className="text-neutral-200">DOT MATRIX WITH STEREO SOUND</span>
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-0.5 bg-[#1b3d82]" />
                <div className="w-8 h-0.5 bg-[#9c185a]" />
              </div>
            </div>

            {/* Screen Inner Area */}
            <div className="relative flex items-center justify-center">
              {/* Battery Indicator LED (Left Side of Screen) */}
              <div className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                <div 
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    isPoweredOn ? 'bg-red-500 shadow-md shadow-red-500/80 ring-2 ring-red-400/40' : 'bg-red-950'
                  }`}
                />
                <span className="text-[6px] text-neutral-300 font-bold tracking-tighter">BATTERY</span>
              </div>

              {/* The 160x144 Native LCD Canvas */}
              <div 
                className="relative overflow-hidden rounded-lg border-2 border-[#525458] shadow-2xl"
                style={{
                  backgroundColor: GAME_BOY_PALETTES[paletteMode].colors[0],
                  filter: `contrast(${contrast}%)`
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={160}
                  height={144}
                  className="w-[200px] h-[180px] sm:w-[240px] sm:h-[216px] image-pixelated block cursor-pointer"
                  onClick={() => {
                    if (activeCartridge === 'mario_land') pressButton('a');
                    else pressButton('a');
                  }}
                />

                {/* Optional Pixel Grid Overlay */}
                {pixelGrid && (
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px)',
                      backgroundSize: '3px 3px'
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Nintendo Game Boy Brand Logo */}
          <div className="w-full flex items-center justify-between px-3 mt-4 mb-2">
            <div className="flex items-baseline gap-1 text-[#1b3d82] font-black italic tracking-wider text-base sm:text-lg">
              <span className="text-xs font-normal tracking-tight">Nintendo</span>
              <span className="font-extrabold tracking-widest">GAME BOY</span>
              <span className="text-[9px] not-italic font-bold">TM</span>
            </div>

            <div className="text-[8px] text-neutral-500 font-bold">
              DMG-01
            </div>
          </div>

          {/* Lower Control Section: D-Pad & A/B Buttons */}
          <div className="w-full flex items-center justify-between px-2 sm:px-4 mt-2">
            {/* Classic 8-Way Directional Cross D-Pad */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* D-Pad Circular Base Indentation */}
              <div className="absolute w-24 h-24 rounded-full bg-[#c0c0b8] border border-[#a8a8a0] shadow-inner" />

              {/* Cross Buttons */}
              <div className="relative z-10 w-24 h-24">
                {/* UP */}
                <button
                  onClick={() => pressButton('up')}
                  className="absolute top-0 left-8 w-8 h-9 bg-[#2b2b2b] hover:bg-[#1a1a1a] active:bg-[#000000] rounded-t-md shadow-md flex items-center justify-center text-neutral-500 text-xs cursor-pointer border-t border-neutral-600"
                >
                  ▲
                </button>
                {/* DOWN */}
                <button
                  onClick={() => pressButton('down')}
                  className="absolute bottom-0 left-8 w-8 h-9 bg-[#2b2b2b] hover:bg-[#1a1a1a] active:bg-[#000000] rounded-b-md shadow-md flex items-center justify-center text-neutral-500 text-xs cursor-pointer border-b border-neutral-600"
                >
                  ▼
                </button>
                {/* LEFT */}
                <button
                  onClick={() => pressButton('left')}
                  className="absolute top-8 left-0 w-9 h-8 bg-[#2b2b2b] hover:bg-[#1a1a1a] active:bg-[#000000] rounded-l-md shadow-md flex items-center justify-center text-neutral-500 text-xs cursor-pointer border-l border-neutral-600"
                >
                  ◀
                </button>
                {/* RIGHT */}
                <button
                  onClick={() => pressButton('right')}
                  className="absolute top-8 right-0 w-9 h-8 bg-[#2b2b2b] hover:bg-[#1a1a1a] active:bg-[#000000] rounded-r-md shadow-md flex items-center justify-center text-neutral-500 text-xs cursor-pointer border-r border-neutral-600"
                >
                  ▶
                </button>
                {/* Center Core */}
                <div className="absolute top-8 left-8 w-8 h-8 bg-[#2b2b2b] flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-[#1e1e1e] shadow-inner" />
                </div>
              </div>
            </div>

            {/* Burgundy A and B Action Buttons (Angled) */}
            <div className="relative flex items-center gap-4 rotate-[-25deg] mb-3">
              {/* B Button */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => pressButton('b')}
                  className="w-11 h-11 rounded-full bg-[#9c185a] hover:bg-[#801248] active:bg-[#5c0b32] text-white font-bold text-sm shadow-xl flex items-center justify-center border-t border-[#c42574] active:translate-y-0.5 cursor-pointer"
                >
                  B
                </button>
                <span className="text-[9px] font-bold text-[#1b3d82] tracking-wider">B</span>
              </div>

              {/* A Button */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => pressButton('a')}
                  className="w-11 h-11 rounded-full bg-[#9c185a] hover:bg-[#801248] active:bg-[#5c0b32] text-white font-bold text-sm shadow-xl flex items-center justify-center border-t border-[#c42574] active:translate-y-0.5 cursor-pointer"
                >
                  A
                </button>
                <span className="text-[9px] font-bold text-[#1b3d82] tracking-wider">A</span>
              </div>
            </div>
          </div>

          {/* Lower Middle: SELECT and START Angled Rubber Pills */}
          <div className="flex items-center justify-center gap-6 mt-6 mb-2">
            {/* SELECT */}
            <div className="flex flex-col items-center gap-1 rotate-[-25deg]">
              <button
                onClick={() => pressButton('select')}
                className="w-12 h-3.5 bg-[#68696d] hover:bg-[#525458] active:bg-[#3b3c3e] rounded-full shadow-md border-t border-neutral-500 cursor-pointer"
              />
              <span className="text-[8px] font-bold text-[#1b3d82] tracking-wider uppercase">SELECT</span>
            </div>

            {/* START */}
            <div className="flex flex-col items-center gap-1 rotate-[-25deg]">
              <button
                onClick={() => pressButton('start')}
                className="w-12 h-3.5 bg-[#68696d] hover:bg-[#525458] active:bg-[#3b3c3e] rounded-full shadow-md border-t border-neutral-500 cursor-pointer"
              />
              <span className="text-[8px] font-bold text-[#1b3d82] tracking-wider uppercase">START</span>
            </div>
          </div>

          {/* Bottom Right Speaker Grille (6 Diagonal Slits) */}
          <div className="w-full flex justify-end px-4 mt-2">
            <div className="flex gap-1.5 rotate-[-25deg]">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-1.5 h-6 bg-[#b8b8b0] rounded-full shadow-inner" />
              ))}
            </div>
          </div>

          {/* Bottom Edge: Phones Jack */}
          <div className="w-full flex justify-center mt-2">
            <div className="text-[7px] text-neutral-500 font-bold uppercase tracking-widest flex items-center gap-1">
              <span>🎧 PHONES</span>
              <div className="w-3 h-3 rounded-full bg-neutral-700 border border-neutral-600 shadow-inner" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls Help Bar */}
      <footer className="w-full max-w-4xl mt-3 py-2 px-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl flex flex-wrap items-center justify-between text-[11px] text-neutral-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="font-bold text-neutral-200">Toetsenbord:</span>
          <span>D-Pad: <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-white text-[10px]">Pijltjes / WASD</kbd></span>
          <span>A-Knop: <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-white text-[10px]">Z / K</kbd></span>
          <span>B-Knop: <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-white text-[10px]">X / J</kbd></span>
          <span>Start: <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-white text-[10px]">Enter</kbd></span>
        </div>

        <div className="flex items-center gap-2">
          {/* Contrast Slider */}
          <span className="text-[10px] text-neutral-400">Contrast:</span>
          <input
            type="range"
            min="70"
            max="130"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="w-20 accent-emerald-500 cursor-pointer"
          />

          {/* Grid Toggle */}
          <button
            onClick={() => setPixelGrid(prev => !prev)}
            className={`p-1 rounded text-[10px] border ${pixelGrid ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-neutral-800 text-neutral-400 border-neutral-700'}`}
          >
            Grid
          </button>
        </div>
      </footer>

      {/* History Dossier Modal */}
      <GameBoyHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onPlayMario={() => handleSwitchCartridge('mario_land')}
        onPlayTetris={() => handleSwitchCartridge('tetris_dmg')}
        lang={lang}
      />

      {/* High Scores Modal */}
      {isScoresOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-neutral-900 border-2 border-yellow-600/50 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-yellow-400 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <span>{activeCartridge === 'mario_land' ? 'Super Mario Land Records' : 'Game Boy Tetris Top Scores'}</span>
              </h3>
              <button
                onClick={() => setIsScoresOpen(false)}
                className="text-neutral-400 hover:text-white text-xs px-2 py-1 rounded bg-neutral-800"
              >
                Sluiten
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activeCartridge === 'mario_land' ? (
                marioScores.map((s, idx) => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs">
                    <span className="font-bold text-amber-400">#{idx + 1} {s.initials}</span>
                    <span className="text-neutral-400">World {s.world}</span>
                    <span className="text-neutral-400">🪙 {s.coins}</span>
                    <span className="font-mono font-bold text-white">{s.score.toLocaleString()} pts</span>
                  </div>
                ))
              ) : (
                tetrisScoresList.map((s, idx) => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs">
                    <span className="font-bold text-blue-400">#{idx + 1} {s.initials}</span>
                    <span className="text-neutral-400">{s.mode}</span>
                    <span className="text-neutral-400">Lvl {s.level}</span>
                    <span className="text-neutral-400">{s.lines} Lines</span>
                    <span className="font-mono font-bold text-white">{s.score.toLocaleString()} pts</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
