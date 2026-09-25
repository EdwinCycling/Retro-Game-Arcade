/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { PacmanCabinet } from './components/PacmanCabinet';
import { SpaceInvadersCabinet } from './components/SpaceInvadersCabinet';
import { DemonAttackCabinet } from './components/DemonAttackCabinet';
import { ReptonCabinet } from './components/ReptonCabinet';
import { EindeloosCabinet } from './components/EindeloosCabinet';
import { FroggerCabinet } from './components/FroggerCabinet';
import { ChuckieEggCabinet } from './components/ChuckieEggCabinet';
import { FrakCabinet } from './components/FrakCabinet';
import { ArcadiansCabinet } from './components/ArcadiansCabinet';
import { RocketRaidCabinet } from './components/RocketRaidCabinet';
import { QbertCabinet } from './components/QbertCabinet';
import { TetrisCabinet } from './components/TetrisCabinet';
import { KingsQuestCabinet } from './components/KingsQuestCabinet';
import { SpaceQuestCabinet } from './components/SpaceQuestCabinet';
import { PongCabinet } from './components/PongCabinet';
import { BattleChessCabinet } from './components/BattleChessCabinet';
import { MarioCabinet } from './components/MarioCabinet';
import { SuperMarioCabinet } from './components/SuperMarioCabinet';
import { WolfensteinCabinet } from './components/WolfensteinCabinet';
import { C64PinballCabinet } from './components/C64PinballCabinet';
import { TempleRunCabinet } from './components/TempleRunCabinet';
import { LemmingsCabinet } from './components/LemmingsCabinet';
import { ManicMinerCabinet } from './components/ManicMinerCabinet';
import { MonsterMazeCabinet } from './components/MonsterMazeCabinet';
import { AsteroidsCabinet } from './components/AsteroidsCabinet';
import { PrinceCabinet } from './components/PrinceCabinet';
import { DonkeyKongCabinet } from './components/DonkeyKongCabinet';
import { DoubleDragonCabinet } from './components/DoubleDragonCabinet';
import { NokiaSnakeCabinet } from './components/NokiaSnakeCabinet';
import { DoomCabinet } from './components/DoomCabinet';
import { DukeCabinet } from './components/DukeCabinet';
import { HalfLifeCabinet } from './components/HalfLifeCabinet';
import { ZaxxonCabinet } from './components/ZaxxonCabinet';
import { OutrunCabinet } from './components/OutrunCabinet';
import { ExileCabinet } from './components/ExileCabinet';
import { ImpossibleMissionCabinet } from './components/ImpossibleMissionCabinet';
import { GameBoyCabinet } from './components/GameBoyCabinet';
import { GbaSpCabinet } from './components/GbaSpCabinet';
import { Ps1Cabinet } from './components/Ps1Cabinet';
import { SpyFoxCabinet } from './components/SpyFoxCabinet';
import { NightDriverCabinet } from './components/NightDriverCabinet';
import { TopografieEuropaCabinet } from './components/TopografieEuropaCabinet';
import { LodeRunnerCabinet } from './components/LodeRunnerCabinet';
import { ArkanoidCabinet } from './components/ArkanoidCabinet';
import { GalagaCabinet } from './components/GalagaCabinet';
import { SudokuCabinet } from './components/SudokuCabinet';
import { BattleshipCabinet } from './components/BattleshipCabinet';
import { MastermindCabinet } from './components/MastermindCabinet';
import { PatienceCabinet } from './components/PatienceCabinet';
import { HeartsCabinet } from './components/HeartsCabinet';
import { FreeCellCabinet } from './components/FreeCellCabinet';
import { SpiderCabinet } from './components/SpiderCabinet';
import { KlaverjassenCabinet } from './components/KlaverjassenCabinet';
import { BlackjackCabinet } from './components/BlackjackCabinet';
import { BridgeCabinet } from './components/BridgeCabinet';
import { Radarsoft3DTicTacToeCabinet } from './components/Radarsoft3DTicTacToeCabinet';
import { StrategoCabinet } from './components/StrategoCabinet';
import { KamertjeVerhurenCabinet } from './components/KamertjeVerhurenCabinet';
import { ConnectFourCabinet } from './components/ConnectFourCabinet';
import { HangmanCabinet } from './components/HangmanCabinet';
import { ArcadeLobby } from './components/ArcadeLobby';
import { LeaderboardModal } from './components/LeaderboardModal';
import { gamepadManager } from './utils/gamepadManager';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'lobby' | 'pacman' | 'space_invaders' | 'donkey_kong' | 'demon_attack' | 'repton' | 'eindeloos' | 'frogger' | 'chuckie_egg' | 'frak' | 'arcadians' | 'rocket_raid' | 'qbert' | 'outrun' | 'tetris' | 'kings_quest' | 'space_quest' | 'pong' | 'battle_chess' | 'mario' | 'super_mario' | 'wolfenstein' | 'doom' | 'duke' | 'half_life' | 'zaxxon' | 'c64_pinball' | 'temple_run' | 'lemmings' | 'manic_miner' | 'monster_maze' | 'asteroids' | 'prince' | 'double_dragon' | 'snake' | 'exile' | 'impossible_mission' | 'mario_land' | 'tetris_dmg' | 'dr_mario' | 'metroid_2' | 'kirby_dream_land' | 'mario_land_2' | 'zelda_links_awakening' | 'donkey_kong_94' | 'pokemon_red' | 'wario_land_2' | 'gba_sp' | 'ps1' | 'pokemon_emerald' | 'mario_advance' | 'zelda_minish' | 'crash_bandicoot' | 'ridge_racer' | 'spy_fox' | 'night_driver' | 'topografie_europa' | 'lode_runner' | 'arkanoid' | 'galaga' | 'sudoku' | 'battleship' | 'mastermind' | 'patience' | 'hearts' | 'freecell' | 'spider_solitaire' | 'klaverjassen' | 'blackjack' | 'bridge' | 'radarsoft_3d_ttt' | 'stratego' | 'kamertje_verhuren' | 'connect_four' | 'hangman'>('lobby');
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  useEffect(() => {
    if (activeScreen !== 'lobby') {
      gamepadManager.start(activeScreen);
    } else {
      gamepadManager.stop();
    }
    return () => {
      gamepadManager.stop();
    };
  }, [activeScreen]);

  // Global Escape & Controller Back buttons listener to return to lobby unconditionally
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeScreen !== 'lobby') {
        setActiveScreen('lobby');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, true);

    // High precision Gamepad polling for BACK/Select buttons
    let animId: number;
    const pollExitButton = () => {
      if (activeScreen !== 'lobby') {
        const snapshot = gamepadManager.getSnapshot();
        if (snapshot.connected) {
          // View (Select/Back button on Xbox controller) allows exiting back to lobby instantly
          if (snapshot.buttons.has('View')) {
            setActiveScreen('lobby');
          }
        }
      }
      animId = requestAnimationFrame(pollExitButton);
    };

    animId = requestAnimationFrame(pollExitButton);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown, true);
      cancelAnimationFrame(animId);
    };
  }, [activeScreen]);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      {activeScreen === 'lobby' && (
        <ArcadeLobby
          onSelectGame={(gameId) => {
            setActiveScreen(gameId);
          }}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        />
      )}

      {activeScreen === 'pacman' && (
        <PacmanCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'space_invaders' && (
        <SpaceInvadersCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'demon_attack' && (
        <DemonAttackCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'repton' && (
        <ReptonCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'eindeloos' && (
        <EindeloosCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'frogger' && (
        <FroggerCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'chuckie_egg' && (
        <ChuckieEggCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'frak' && (
        <FrakCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'arcadians' && (
        <ArcadiansCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'rocket_raid' && (
        <RocketRaidCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'qbert' && (
        <QbertCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'tetris' && (
        <TetrisCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'kings_quest' && (
        <KingsQuestCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'space_quest' && (
        <SpaceQuestCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'pong' && (
        <PongCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'battle_chess' && (
        <BattleChessCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'mario' && (
        <MarioCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'super_mario' && (
        <SuperMarioCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'wolfenstein' && (
        <WolfensteinCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'c64_pinball' && (
        <C64PinballCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
          onOpenHistory={() => {}}
          lang="nl"
        />
      )}

      {activeScreen === 'temple_run' && (
        <TempleRunCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'lemmings' && (
        <LemmingsCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'manic_miner' && (
        <ManicMinerCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'monster_maze' && (
        <MonsterMazeCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'asteroids' && (
        <AsteroidsCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'prince' && (
        <PrinceCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'donkey_kong' && (
        <DonkeyKongCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'double_dragon' && (
        <DoubleDragonCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'snake' && (
        <NokiaSnakeCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'doom' && (
        <DoomCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'duke' && (
        <DukeCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'half_life' && (
        <HalfLifeCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'zaxxon' && (
        <ZaxxonCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'outrun' && (
        <OutrunCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'exile' && (
        <ExileCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'impossible_mission' && (
        <ImpossibleMissionCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'mario_land' && (
        <GameBoyCabinet
          initialCartridge="mario_land"
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'tetris_dmg' && (
        <GameBoyCabinet
          initialCartridge="tetris_dmg"
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'dr_mario' && (
        <GameBoyCabinet
          initialCartridge="dr_mario"
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'metroid_2' && (
        <GameBoyCabinet
          initialCartridge="metroid_2"
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'kirby_dream_land' && (
        <GameBoyCabinet
          initialCartridge="kirby_dream_land"
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'mario_land_2' && (
        <GameBoyCabinet
          initialCartridge="mario_land_2"
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'zelda_links_awakening' && (
        <GameBoyCabinet
          initialCartridge="zelda_links_awakening"
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'donkey_kong_94' && (
        <GameBoyCabinet
          initialCartridge="donkey_kong_94"
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'pokemon_red' && (
        <GameBoyCabinet
          initialCartridge="pokemon_red"
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'wario_land_2' && (
        <GameBoyCabinet
          initialCartridge="wario_land_2"
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'gba_sp' && (
        <GbaSpCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'pokemon_emerald' && (
        <GbaSpCabinet
          initialGame="pokemon_emerald"
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'mario_advance' && (
        <GbaSpCabinet
          initialGame="mario_advance"
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'zelda_minish' && (
        <GbaSpCabinet
          initialGame="zelda_minish"
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'ps1' && (
        <Ps1Cabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'crash_bandicoot' && (
        <Ps1Cabinet
          initialDisc="crash_bandicoot"
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'ridge_racer' && (
        <Ps1Cabinet
          initialDisc="ridge_racer"
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'spy_fox' && (
        <SpyFoxCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'night_driver' && (
        <NightDriverCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'topografie_europa' && (
        <TopografieEuropaCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'lode_runner' && (
        <LodeRunnerCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'arkanoid' && (
        <ArkanoidCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'galaga' && (
        <GalagaCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'sudoku' && (
        <SudokuCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'battleship' && (
        <BattleshipCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'mastermind' && (
        <MastermindCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'patience' && (
        <PatienceCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'hearts' && (
        <HeartsCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'freecell' && (
        <FreeCellCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'spider_solitaire' && (
        <SpiderCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'klaverjassen' && (
        <KlaverjassenCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'blackjack' && (
        <BlackjackCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'bridge' && (
        <BridgeCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'radarsoft_3d_ttt' && (
        <Radarsoft3DTicTacToeCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'stratego' && (
        <StrategoCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'kamertje_verhuren' && (
        <KamertjeVerhurenCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'connect_four' && (
        <ConnectFourCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {activeScreen === 'hangman' && (
        <HangmanCabinet
          onBackToLobby={() => setActiveScreen('lobby')}
        />
      )}

      {/* Global Pacman Leaderboard Modal accessible from lobby */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        onPlayAgain={() => {
          setIsLeaderboardOpen(false);
          setActiveScreen('pacman');
        }}
      />
    </main>
  );
}
