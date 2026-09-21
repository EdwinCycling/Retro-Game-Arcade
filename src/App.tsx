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
import { ArcadeLobby } from './components/ArcadeLobby';
import { LeaderboardModal } from './components/LeaderboardModal';
import { gamepadManager } from './utils/gamepadManager';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'lobby' | 'pacman' | 'space_invaders' | 'donkey_kong' | 'demon_attack' | 'repton' | 'eindeloos' | 'frogger' | 'chuckie_egg' | 'frak' | 'arcadians' | 'rocket_raid' | 'qbert' | 'outrun' | 'tetris' | 'kings_quest' | 'space_quest' | 'pong' | 'battle_chess' | 'mario' | 'super_mario' | 'wolfenstein' | 'doom' | 'duke' | 'half_life' | 'zaxxon' | 'c64_pinball' | 'temple_run' | 'lemmings' | 'manic_miner' | 'monster_maze' | 'asteroids' | 'prince' | 'double_dragon' | 'snake' | 'exile'>('lobby');
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
