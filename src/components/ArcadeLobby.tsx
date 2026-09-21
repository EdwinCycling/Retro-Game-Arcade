import React, { useState, useMemo, useEffect } from 'react';
import { 
  Gamepad2, 
  Trophy, 
  Sparkles, 
  Info, 
  Play, 
  Smartphone, 
  Compass, 
  Flame, 
  ShieldCheck, 
  ChevronRight, 
  Star,
  Layers,
  ArrowUpRight,
  Crosshair,
  Shield,
  Zap,
  Key,
  Tv,
  HelpCircle,
  BookOpen,
  Volume2,
  VolumeX,
  Search,
  Filter,
  Shuffle,
  Grid,
  Clock,
  Globe,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Palette,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';
import { PacmanHistoryModal } from './PacmanHistoryModal';
import { SpaceInvadersHistoryModal } from './SpaceInvadersHistoryModal';
import { DemonAttackHistoryModal } from './DemonAttackHistoryModal';
import { ReptonHistoryModal } from './ReptonHistoryModal';
import { EindeloosHistoryModal } from './EindeloosHistoryModal';
import { FroggerHistoryModal } from './FroggerHistoryModal';
import { ChuckieEggHistoryModal } from './ChuckieEggHistoryModal';
import { FrakHistoryModal } from './FrakHistoryModal';
import { ArcadiansHistoryModal } from './ArcadiansHistoryModal';
import { TetrisHistoryModal } from './TetrisHistoryModal';
import { KingsQuestHistoryModal } from './KingsQuestHistoryModal';
import { SpaceQuestHistoryModal } from './SpaceQuestHistoryModal';
import { PongHistoryModal } from './PongHistoryModal';
import { BattleChessHistoryModal } from './BattleChessHistoryModal';
import { MarioHistoryModal } from './MarioHistoryModal';
import { SuperMarioHistoryModal } from './SuperMarioHistoryModal';
import { WolfensteinHistoryModal } from './WolfensteinHistoryModal';
import { C64PinballHistoryModal } from './C64PinballHistoryModal';
import { TempleRunHistoryModal } from './TempleRunHistoryModal';
import { LemmingsHistoryModal } from './LemmingsHistoryModal';
import { ManicMinerHistoryModal } from './ManicMinerHistoryModal';
import { MonsterMazeHistoryModal } from './MonsterMazeHistoryModal';
import { AsteroidsHistoryModal } from './AsteroidsHistoryModal';
import { PrinceHistoryModal } from './PrinceHistoryModal';
import { DonkeyKongHistoryModal } from './DonkeyKongHistoryModal';
import { DoubleDragonHistoryModal } from './DoubleDragonHistoryModal';
import { NokiaSnakeHistoryModal } from './NokiaSnakeHistoryModal';
import { DoomHistoryModal } from './DoomHistoryModal';
import { DukeHistoryModal } from './DukeHistoryModal';
import { HalfLifeHistoryModal } from './HalfLifeHistoryModal';
import { ZaxxonHistoryModal } from './ZaxxonHistoryModal';
import { RocketRaidHistoryModal } from './RocketRaidHistoryModal';
import { QbertHistoryModal } from './QbertHistoryModal';
import { OutrunHistoryModal } from './OutrunHistoryModal';
import { ExileHistoryModal } from './ExileHistoryModal';
import { ImpossibleMissionHistoryModal } from './ImpossibleMissionHistoryModal';
import { GameBoyHistoryModal } from './GameBoyHistoryModal';
import { GbaHistoryModal } from './GbaHistoryModal';
import { Ps1HistoryModal } from './Ps1HistoryModal';
import { GamepadGuideModal } from './GamepadGuideModal';
import { TiltTouchGuideModal } from './TiltTouchGuideModal';
import { ProjectInfoModal } from './ProjectInfoModal';
import { CookieConsentBanner } from './CookieConsentBanner';
import { ArcadeFloorView } from './ArcadeFloorView';
import { ArcadeTimelineView } from './ArcadeTimelineView';
import { GAMES_METADATA, GameMetadata, LOBBY_TRANSLATIONS, Language } from '../i18n/lobbyTranslations';
import { arcadeHallAudio } from '../utils/arcadeHallAudio';
import { gamepadManager } from '../utils/gamepadManager';
import { getHighScores } from '../game/highScores';
import { getSpaceHighScores } from '../game/spaceInvadersHighScores';
import { getDemonHighScores } from '../game/demonAttackHighScores';
import { getReptonHighScores } from '../game/reptonHighScores';
import { getEindeloosHighScores } from '../game/eindeloosHighScores';
import { getFroggerHighScores } from '../game/froggerHighScores';
import { getChuckieEggHighScores } from '../game/chuckieEggHighScores';
import { getFrakHighScores } from '../game/frakHighScores';
import { getArcadiansHighScores } from '../game/arcadiansHighScores';
import { getTetrisHighScores } from '../game/tetrisHighScores';
import { getKingsQuestHighScores } from '../game/kingsQuestHighScores';
import { getPongStats } from '../game/pongHighScores';
import { getBattleChessStats } from '../game/battleChessHighScores';
import { getMarioHighScores } from '../game/marioHighScores';
import { getSuperMarioScores } from '../game/superMarioHighScores';
import { getWolfScores } from '../game/wolfensteinHighScores';
import { getDoomScores } from '../game/doomHighScores';
import { getDukeScores } from '../game/dukeHighScores';
import { getHalfLifeScores } from '../game/halfLifeHighScores';
import { getZaxxonScores } from '../game/zaxxonHighScores';
import { getRocketRaidScores } from '../game/rocketRaidHighScores';
import { getQbertScores } from '../game/qbertHighScores';
import { getOutrunScores } from '../game/outrunHighScores';
import { getC64PinballScores } from '../game/c64PinballHighScores';
import { getTempleRunScores } from '../game/templeRunHighScores';
import { getLemmingsScores } from '../game/lemmingsHighScores';
import { getManicMinerScores } from '../game/manicMinerHighScores';
import { getMonsterMazeScores } from '../game/monsterMazeHighScores';
import { getAsteroidsScores } from '../game/asteroidsHighScores';
import { getPrinceScores } from '../game/princeHighScores';
import { getDonkeyKongHighScores } from '../game/donkeyKongHighScores';
import { getDoubleDragonScores } from '../game/doubleDragonHighScores';
import { getNokiaSnakeScores } from '../game/nokiaSnakeHighScores';
import { getExileHighScores } from '../game/exileHighScores';
import { getImpossibleMissionScores } from '../game/impossibleMissionHighScores';
import { getMarioLandScores, getTetrisScores } from '../game/gameBoyHighScores';
import { retroAudio } from '../game/audio';
import { spaceAudio } from '../game/spaceInvadersAudio';
import { demonAudio } from '../game/demonAttackAudio';
import { reptonAudio } from '../game/reptonAudio';
import { eindeloosAudio } from '../game/eindeloosAudio';
import { froggerAudio } from '../game/froggerAudio';
import { chuckieEggAudio } from '../game/chuckieEggAudio';
import { frakAudio } from '../game/frakAudio';
import { arcadiansAudio } from '../game/arcadiansAudio';
import { tetrisAudio } from '../game/tetrisAudio';
import { kingsQuestAudio } from '../game/kingsQuestAudio';
import { pongAudio } from '../game/pongAudio';
import { battleChessAudio } from '../game/battleChessAudio';
import { marioAudio } from '../game/marioAudio';
import { superMarioAudio } from '../game/superMarioAudio';
import { wolfensteinAudio } from '../game/wolfensteinAudio';
import { c64PinballAudio } from '../game/c64PinballAudio';
import { templeRunAudio } from '../game/templeRunAudio';
import { lemmingsAudio } from '../game/lemmingsAudio';
import { manicMinerAudio } from '../game/manicMinerAudio';
import { monsterMazeAudio } from '../game/monsterMazeAudio';
import { asteroidsAudio } from '../game/asteroidsAudio';
import { princeAudio } from '../game/princeAudio';
import { donkeyKongAudio } from '../game/donkeyKongAudio';
import { doubleDragonAudio } from '../game/doubleDragonAudio';
import { nokiaSnakeAudio } from '../game/nokiaSnakeAudio';
import { doomAudio } from '../game/doomAudio';
import { dukeAudio } from '../game/dukeAudio';
import { halfLifeAudio } from '../game/halfLifeAudio';
import { zaxxonAudio } from '../game/zaxxonAudio';
import { rocketRaidAudio } from '../game/rocketRaidAudio';
import { qbertAudio } from '../game/qbertAudio';
import { outrunAudio } from '../game/outrunAudio';
import { exileAudio } from '../game/exileAudio';
import { impossibleMissionAudio } from '../game/impossibleMissionAudio';
import { gbaAudio } from '../game/gbaAudio';
import { ps1Audio } from '../game/ps1Audio';
import { haptics } from '../utils/haptics';

interface ArcadeLobbyProps {
  onSelectGame: (gameId: GameMetadata['id']) => void;
  onOpenLeaderboard?: () => void;
}

export const ArcadeLobby: React.FC<ArcadeLobbyProps> = ({
  onSelectGame,
  onOpenLeaderboard
}) => {
  const [isPacmanHistoryOpen, setIsPacmanHistoryOpen] = useState(false);
  const [isSpaceHistoryOpen, setIsSpaceHistoryOpen] = useState(false);
  const [isDemonHistoryOpen, setIsDemonHistoryOpen] = useState(false);
  const [isReptonHistoryOpen, setIsReptonHistoryOpen] = useState(false);
  const [isEindeloosHistoryOpen, setIsEindeloosHistoryOpen] = useState(false);
  const [isFroggerHistoryOpen, setIsFroggerHistoryOpen] = useState(false);
  const [isChuckieEggHistoryOpen, setIsChuckieEggHistoryOpen] = useState(false);
  const [isFrakHistoryOpen, setIsFrakHistoryOpen] = useState(false);
  const [isArcadiansHistoryOpen, setIsArcadiansHistoryOpen] = useState(false);
  const [isTetrisHistoryOpen, setIsTetrisHistoryOpen] = useState(false);
  const [isKingsQuestHistoryOpen, setIsKingsQuestHistoryOpen] = useState(false);
  const [isSpaceQuestHistoryOpen, setIsSpaceQuestHistoryOpen] = useState(false);
  const [isPongHistoryOpen, setIsPongHistoryOpen] = useState(false);
  const [isBattleChessHistoryOpen, setIsBattleChessHistoryOpen] = useState(false);
  const [isMarioHistoryOpen, setIsMarioHistoryOpen] = useState(false);
  const [isSuperMarioHistoryOpen, setIsSuperMarioHistoryOpen] = useState(false);
  const [isWolfensteinHistoryOpen, setIsWolfensteinHistoryOpen] = useState(false);
  const [isC64PinballHistoryOpen, setIsC64PinballHistoryOpen] = useState(false);
  const [isTempleRunHistoryOpen, setIsTempleRunHistoryOpen] = useState(false);
  const [isLemmingsHistoryOpen, setIsLemmingsHistoryOpen] = useState(false);
  const [isManicMinerHistoryOpen, setIsManicMinerHistoryOpen] = useState(false);
  const [isMonsterMazeHistoryOpen, setIsMonsterMazeHistoryOpen] = useState(false);
  const [isAsteroidsHistoryOpen, setIsAsteroidsHistoryOpen] = useState(false);
  const [isPrinceHistoryOpen, setIsPrinceHistoryOpen] = useState(false);
  const [isDonkeyKongHistoryOpen, setIsDonkeyKongHistoryOpen] = useState(false);
  const [isDoubleDragonHistoryOpen, setIsDoubleDragonHistoryOpen] = useState(false);
  const [isSnakeHistoryOpen, setIsSnakeHistoryOpen] = useState(false);
  const [isDoomHistoryOpen, setIsDoomHistoryOpen] = useState(false);
  const [isDukeHistoryOpen, setIsDukeHistoryOpen] = useState(false);
  const [isHalfLifeHistoryOpen, setIsHalfLifeHistoryOpen] = useState(false);
  const [isZaxxonHistoryOpen, setIsZaxxonHistoryOpen] = useState(false);
  const [isRocketRaidHistoryOpen, setIsRocketRaidHistoryOpen] = useState(false);
  const [isQbertHistoryOpen, setIsQbertHistoryOpen] = useState(false);
  const [isOutrunHistoryOpen, setIsOutrunHistoryOpen] = useState(false);
  const [isExileHistoryOpen, setIsExileHistoryOpen] = useState(false);
  const [isImpossibleMissionHistoryOpen, setIsImpossibleMissionHistoryOpen] = useState(false);
  const [isGameBoyHistoryOpen, setIsGameBoyHistoryOpen] = useState(false);
  const [isGbaHistoryOpen, setIsGbaHistoryOpen] = useState(false);
  const [isPs1HistoryOpen, setIsPs1HistoryOpen] = useState(false);

  // Xbox & Controller Support
  const [isGamepadConnected, setIsGamepadConnected] = useState(false);
  const [showGamepadGuide, setShowGamepadGuide] = useState(false);
  const [showTiltTouchGuide, setShowTiltTouchGuide] = useState(false);
  const [showProjectInfo, setShowProjectInfo] = useState(false);
  const [projectInfoTab, setProjectInfoTab] = useState<'overview' | 'tech' | 'games' | 'github' | 'legal'>('overview');

  useEffect(() => {
    return gamepadManager.subscribe((state) => {
      setIsGamepadConnected(state.connected);
    });
  }, []);

  // Localization & Arcade Hall Controls (Default to English)
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('arcade_vault_lang_v2');
      if (saved === 'en' || saved === 'nl') return saved;
      return 'en';
    } catch {
      return 'en';
    }
  });

  const [activeView, setActiveView] = useState<'floor' | 'cards' | 'timeline'>('floor');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<number | string>('all');
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAmbianceOn, setIsAmbianceOn] = useState(false);

  // Section 1 Quick Launch Strip sorting & cabinet color uniform mode
  const [quickCardSort, setQuickCardSort] = useState<'default' | 'year-asc' | 'year-desc' | 'type'>('default');
  const [uniformCardColors, setUniformCardColors] = useState<boolean>(false);

  const t = LOBBY_TRANSLATIONS[lang];

  // Read saved local high scores
  const pacmanScores = getHighScores();
  const pacmanTopScore = pacmanScores.length > 0 ? pacmanScores[0].score : 0;
  const pacmanTopInitials = pacmanScores.length > 0 ? pacmanScores[0].initials : 'PAC';

  const spaceScores = getSpaceHighScores();
  const spaceTopScore = spaceScores.length > 0 ? spaceScores[0].score : 0;
  const spaceTopInitials = spaceScores.length > 0 ? spaceScores[0].initials : 'TAI';

  const demonScores = getDemonHighScores();
  const demonTopScore = demonScores.length > 0 ? demonScores[0].score : 0;
  const demonTopInitials = demonScores.length > 0 ? demonScores[0].initials : 'IMG';

  const reptonScores = getReptonHighScores();
  const reptonTopScore = reptonScores.length > 0 ? reptonScores[0].score : 0;
  const reptonTopInitials = reptonScores.length > 0 ? reptonScores[0].initials : 'REP';

  const eindeloosScores = getEindeloosHighScores();
  const eindeloosTopScore = eindeloosScores.length > 0 ? eindeloosScores[0].score : 18500;
  const eindeloosTopInitials = eindeloosScores.length > 0 ? eindeloosScores[0].initials : 'JVA';

  const froggerScores = getFroggerHighScores();
  const froggerTopScore = froggerScores.length > 0 ? froggerScores[0].score : 4850;
  const froggerTopInitials = froggerScores.length > 0 ? froggerScores[0].initials : 'EDW';

  const chuckieScores = getChuckieEggHighScores();
  const chuckieTopScore = chuckieScores.length > 0 ? chuckieScores[0].score : 18450;
  const chuckieTopInitials = chuckieScores.length > 0 ? chuckieScores[0].initials : 'NGA';

  const frakScores = getFrakHighScores();
  const frakTopScore = frakScores.length > 0 ? frakScores[0].score : 24850;
  const frakTopInitials = frakScores.length > 0 ? frakScores[0].initials : 'N.P';

  const arcadiansScores = getArcadiansHighScores();
  const arcadiansTopScore = arcadiansScores.length > 0 ? arcadiansScores[0].score : 32450;
  const arcadiansTopInitials = arcadiansScores.length > 0 ? arcadiansScores[0].initials : 'N.P';

  const tetrisScores = getTetrisHighScores();
  const tetrisTopScore = tetrisScores.length > 0 ? tetrisScores[0].score : 125000;
  const tetrisTopInitials = tetrisScores.length > 0 ? tetrisScores[0].initials : 'ALP';

  const kingsQuestScores = getKingsQuestHighScores();
  const kingsQuestTopScore = kingsQuestScores.length > 0 ? kingsQuestScores[0].score : 158;
  const kingsQuestTopInitials = kingsQuestScores.length > 0 ? kingsQuestScores[0].initials : 'RBW';

  const marioScores = getMarioHighScores();
  const marioTopScore = marioScores.length > 0 ? marioScores[0].score : 48900;
  const marioTopInitials = marioScores.length > 0 ? marioScores[0].initials : 'MAR';

  const superMarioScores = getSuperMarioScores();
  const superMarioTopScore = superMarioScores.length > 0 ? superMarioScores[0].score : 85200;
  const superMarioTopInitials = superMarioScores.length > 0 ? superMarioScores[0].initials : 'SHI';

  const wolfScores = getWolfScores();
  const wolfTopScore = wolfScores.length > 0 ? wolfScores[0].score : 64200;
  const wolfTopInitials = wolfScores.length > 0 ? wolfScores[0].initials : 'BJB';

  const c64PinballScores = getC64PinballScores();
  const c64PinballTopScore = c64PinballScores.length > 0 ? c64PinballScores[0].score : 185000;
  const c64PinballTopInitials = c64PinballScores.length > 0 ? c64PinballScores[0].initials : 'SW.';

  const templeRunScores = getTempleRunScores();
  const templeRunTopScore = templeRunScores.length > 0 ? templeRunScores[0].score : 1254000;
  const templeRunTopInitials = templeRunScores.length > 0 ? templeRunScores[0].initials : 'GUY';

  const lemmingsScores = getLemmingsScores();
  const lemmingsTopScore = lemmingsScores.length > 0 ? lemmingsScores[0].score : 4850;
  const lemmingsTopInitials = lemmingsScores.length > 0 ? lemmingsScores[0].initials : 'DMA';

  const manicMinerScores = getManicMinerScores();
  const manicMinerTopScore = manicMinerScores.length > 0 ? manicMinerScores[0].score : 19830;
  const manicMinerTopInitials = manicMinerScores.length > 0 ? manicMinerScores[0].initials : 'MSM';

  const monsterMazeScores = getMonsterMazeScores();
  const monsterMazeTopScore = monsterMazeScores.length > 0 ? monsterMazeScores[0].score : 3200;
  const monsterMazeTopInitials = monsterMazeScores.length > 0 ? monsterMazeScores[0].initials : 'EVN';

  const asteroidsScores = getAsteroidsScores();
  const asteroidsTopScore = asteroidsScores.length > 0 ? asteroidsScores[0].score : 99990;
  const asteroidsTopInitials = asteroidsScores.length > 0 ? asteroidsScores[0].initials : 'EDL';

  const princeScores = getPrinceScores();
  const princeTopScore = princeScores.length > 0 ? `${princeScores[0].minutesRemaining}:${princeScores[0].secondsRemaining.toString().padStart(2, '0')}` : '54:22';
  const princeTopInitials = princeScores.length > 0 ? princeScores[0].initials : 'JDM';

  const donkeyKongScores = getDonkeyKongHighScores();
  const donkeyKongTopScore = donkeyKongScores.length > 0 ? donkeyKongScores[0].score : 87400;
  const donkeyKongTopInitials = donkeyKongScores.length > 0 ? donkeyKongScores[0].initials : 'DKG';

  const doubleDragonScores = getDoubleDragonScores();
  const doubleDragonTopScore = doubleDragonScores.length > 0 ? doubleDragonScores[0].score : 48500;
  const doubleDragonTopInitials = doubleDragonScores.length > 0 ? doubleDragonScores[0].initials : 'BLY';

  const snakeScores = getNokiaSnakeScores();
  const snakeTopScore = snakeScores.length > 0 ? snakeScores[0].score : 384;
  const snakeTopInitials = snakeScores.length > 0 ? snakeScores[0].initials : 'NOK';

  const doomScores = getDoomScores();
  const doomTopScore = doomScores.length > 0 ? doomScores[0].score : 14500;
  const doomTopInitials = doomScores.length > 0 ? doomScores[0].name : 'FLY';

  const dukeScores = getDukeScores();
  const dukeTopScore = dukeScores.length > 0 ? dukeScores[0].score : 19960;
  const dukeTopInitials = dukeScores.length > 0 ? dukeScores[0].name : 'DUK';

  const halfLifeScores = getHalfLifeScores();
  const halfLifeTopScore = halfLifeScores.length > 0 ? halfLifeScores[0].score : 18500;
  const halfLifeTopInitials = halfLifeScores.length > 0 ? halfLifeScores[0].name : 'FRE';

  const zaxxonScores = getZaxxonScores();
  const zaxxonTopScore = zaxxonScores.length > 0 ? zaxxonScores[0].score : 88400;
  const zaxxonTopInitials = zaxxonScores.length > 0 ? zaxxonScores[0].initials : 'SEG';

  const rocketRaidScores = getRocketRaidScores();
  const rocketRaidTopScore = rocketRaidScores.length > 0 ? rocketRaidScores[0].score : 28450;
  const rocketRaidTopInitials = rocketRaidScores.length > 0 ? rocketRaidScores[0].initials : 'J.G';

  const qbertScores = getQbertScores();
  const qbertTopScore = qbertScores.length > 0 ? qbertScores[0].score : 24850;
  const qbertTopInitials = qbertScores.length > 0 ? qbertScores[0].initials : 'WAR';

  const outrunScores = getOutrunScores();
  const outrunTopScore = outrunScores.length > 0 ? outrunScores[0].score : 18450200;
  const outrunTopInitials = outrunScores.length > 0 ? outrunScores[0].initials : 'YU.';

  const exileScores = getExileHighScores();
  const exileTopScore = exileScores.length > 0 ? exileScores[0].score : 32500;
  const exileTopInitials = exileScores.length > 0 ? exileScores[0].name : 'FINN';

  const impossibleMissionScores = getImpossibleMissionScores();
  const impossibleMissionTopScore = impossibleMissionScores.length > 0 ? `${impossibleMissionScores[0].remainingSeconds}s` : '16820s';
  const impossibleMissionTopInitials = impossibleMissionScores.length > 0 ? impossibleMissionScores[0].initials : 'EPX';

  const marioLandScores = getMarioLandScores();
  const marioLandTopScore = marioLandScores.length > 0 ? marioLandScores[0].score : 28500;
  const marioLandTopInitials = marioLandScores.length > 0 ? marioLandScores[0].initials : 'MAR';

  const tetrisDmgScores = getTetrisScores();
  const tetrisDmgTopScore = tetrisDmgScores.length > 0 ? tetrisDmgScores[0].score : 54200;
  const tetrisDmgTopInitials = tetrisDmgScores.length > 0 ? tetrisDmgScores[0].initials : 'ALX';

  const handleLaunchPacman = () => {
    haptics.powerPellet();
    retroAudio.playEatFruit();
    onSelectGame('pacman');
  };

  const handleLaunchSpaceInvaders = () => {
    haptics.invaderKilled();
    spaceAudio.playShoot();
    onSelectGame('space_invaders');
  };

  const handleLaunchDemonAttack = () => {
    haptics.invaderKilled();
    demonAudio.playLaser();
    onSelectGame('demon_attack');
  };

  const handleLaunchRepton = () => {
    haptics.powerPellet();
    reptonAudio.playDiamond();
    onSelectGame('repton');
  };

  const handleLaunchEindeloos = () => {
    haptics.powerPellet();
    eindeloosAudio.playCheckpoint();
    onSelectGame('eindeloos');
  };

  const handleLaunchFrogger = () => {
    haptics.powerPellet();
    froggerAudio.playHop();
    onSelectGame('frogger');
  };

  const handleLaunchChuckieEgg = () => {
    haptics.powerPellet();
    chuckieEggAudio.playEggPickup();
    onSelectGame('chuckie_egg');
  };

  const handleLaunchFrak = () => {
    haptics.powerPellet();
    frakAudio.playKeyPickup();
    onSelectGame('frak');
  };

  const handleLaunchArcadians = () => {
    haptics.powerPellet();
    arcadiansAudio.playLaser();
    onSelectGame('arcadians');
  };

  const handleLaunchTetris = () => {
    haptics.powerPellet();
    tetrisAudio.playRotate();
    onSelectGame('tetris');
  };

  const handleLaunchKingsQuest = () => {
    haptics.powerPellet();
    kingsQuestAudio.playVictory();
    onSelectGame('kings_quest');
  };

  const handleLaunchSpaceQuest = () => {
    haptics.powerPellet();
    kingsQuestAudio.playBeep();
    onSelectGame('space_quest');
  };

  const handleLaunchPong = () => {
    haptics.powerPellet();
    pongAudio.playPaddleHit(1);
    onSelectGame('pong');
  };

  const handleLaunchBattleChess = () => {
    haptics.powerPellet();
    battleChessAudio.playSwordClash();
    onSelectGame('battle_chess');
  };

  const handleLaunchMario = () => {
    haptics.powerPellet();
    marioAudio.playJump();
    onSelectGame('mario');
  };

  const handleLaunchSuperMario = () => {
    haptics.powerPellet();
    superMarioAudio.playPowerupCollect();
    onSelectGame('super_mario');
  };

  const handleLaunchWolfenstein = () => {
    haptics.powerPellet();
    wolfensteinAudio.playPistol();
    onSelectGame('wolfenstein');
  };

  const handleLaunchC64Pinball = () => {
    haptics.powerPellet();
    c64PinballAudio.playPlungerRelease();
    onSelectGame('c64_pinball');
  };

  const handleLaunchTempleRun = () => {
    haptics.powerPellet();
    templeRunAudio.playCoin();
    onSelectGame('temple_run');
  };

  const handleLaunchLemmings = () => {
    haptics.powerPellet();
    lemmingsAudio.playLetsGo();
    onSelectGame('lemmings');
  };

  const handleLaunchManicMiner = () => {
    haptics.powerPellet();
    manicMinerAudio.playJump();
    onSelectGame('manic_miner');
  };

  const handleLaunchMonsterMaze = () => {
    haptics.powerPellet();
    monsterMazeAudio.playStep();
    onSelectGame('monster_maze');
  };

  const handleLaunchAsteroids = () => {
    haptics.powerPellet();
    asteroidsAudio.playFire();
    onSelectGame('asteroids');
  };

  const handleLaunchPrince = () => {
    haptics.powerPellet();
    princeAudio.playSwordDraw();
    onSelectGame('prince');
  };

  const handleLaunchDonkeyKong = () => {
    haptics.powerPellet();
    donkeyKongAudio.playHammerHit();
    onSelectGame('donkey_kong');
  };

  const handleLaunchDoubleDragon = () => {
    haptics.powerPellet();
    doubleDragonAudio.playPunchImpact();
    onSelectGame('double_dragon');
  };

  const handleLaunchSnake = () => {
    haptics.powerPellet();
    nokiaSnakeAudio.playNokiaTune();
    onSelectGame('snake');
  };

  const handleLaunchDoom = () => {
    haptics.powerPellet();
    doomAudio.playShotgun();
    onSelectGame('doom');
  };

  const handleLaunchDuke = () => {
    haptics.powerPellet();
    dukeAudio.playShotgun();
    onSelectGame('duke');
  };

  const handleLaunchHalfLife = () => {
    haptics.powerPellet();
    halfLifeAudio.playCrowbarMetalHit();
    onSelectGame('half_life');
  };

  const handleLaunchZaxxon = () => {
    haptics.powerPellet();
    zaxxonAudio.playLaser();
    onSelectGame('zaxxon');
  };

  const handleLaunchRocketRaid = () => {
    haptics.powerPellet();
    rocketRaidAudio.playLaser();
    onSelectGame('rocket_raid');
  };

  const handleLaunchQbert = () => {
    haptics.powerPellet();
    qbertAudio.playJump();
    onSelectGame('qbert');
  };

  const handleLaunchOutrun = () => {
    haptics.powerPellet();
    outrunAudio.playRadioTuning();
    onSelectGame('outrun');
  };

  const handleLaunchExile = () => {
    haptics.powerPellet();
    exileAudio.playBlaster();
    onSelectGame('exile');
  };

  const handleLaunchImpossibleMission = () => {
    haptics.powerPellet();
    impossibleMissionAudio.playElvinWelcome();
    onSelectGame('impossible_mission');
  };

  const handleLaunchMarioLand = () => {
    haptics.powerPellet();
    onSelectGame('mario_land');
  };

  const handleLaunchTetrisDmg = () => {
    haptics.powerPellet();
    onSelectGame('tetris_dmg');
  };

  const handleLaunchGbaSp = () => {
    haptics.powerPellet();
    gbaAudio.playGbaBootChime();
    onSelectGame('gba_sp');
  };

  const handleLaunchPs1 = () => {
    haptics.powerPellet();
    ps1Audio.playPs1BootChime();
    onSelectGame('ps1');
  };

  const highScoresMap: Record<string, { score: number | string; initials: string }> = useMemo(() => ({
    space_invaders: { score: spaceTopScore, initials: spaceTopInitials },
    pacman: { score: pacmanTopScore, initials: pacmanTopInitials },
    donkey_kong: { score: donkeyKongTopScore, initials: donkeyKongTopInitials },
    arcadians: { score: arcadiansTopScore, initials: arcadiansTopInitials },
    demon_attack: { score: demonTopScore, initials: demonTopInitials },
    frogger: { score: froggerTopScore, initials: froggerTopInitials },
    chuckie_egg: { score: chuckieTopScore, initials: chuckieTopInitials },
    frak: { score: frakTopScore, initials: frakTopInitials },
    repton: { score: reptonTopScore, initials: reptonTopInitials },
    eindeloos: { score: eindeloosTopScore, initials: eindeloosTopInitials },
    tetris: { score: tetrisTopScore, initials: tetrisTopInitials },
    kings_quest: { score: `${kingsQuestTopScore}/158`, initials: kingsQuestTopInitials },
    space_quest: { score: '220/220', initials: 'RGW' },
    pong: { score: `${getPongStats().longestRally} RALLY`, initials: 'ATA' },
    battle_chess: { score: `${getBattleChessStats().whiteWins} WINS`, initials: 'INT' },
    mario: { score: marioTopScore, initials: marioTopInitials },
    super_mario: { score: superMarioTopScore, initials: superMarioTopInitials },
    wolfenstein: { score: wolfTopScore, initials: wolfTopInitials },
    c64_pinball: { score: c64PinballTopScore, initials: c64PinballTopInitials },
    temple_run: { score: templeRunTopScore, initials: templeRunTopInitials },
    lemmings: { score: lemmingsTopScore, initials: lemmingsTopInitials },
    manic_miner: { score: manicMinerTopScore, initials: manicMinerTopInitials },
    monster_maze: { score: monsterMazeTopScore, initials: monsterMazeTopInitials },
    asteroids: { score: asteroidsTopScore, initials: asteroidsTopInitials },
    prince: { score: princeTopScore, initials: princeTopInitials },
    double_dragon: { score: doubleDragonTopScore, initials: doubleDragonTopInitials },
    snake: { score: snakeTopScore, initials: snakeTopInitials },
    doom: { score: doomTopScore, initials: doomTopInitials },
    duke: { score: dukeTopScore, initials: dukeTopInitials },
    half_life: { score: halfLifeTopScore, initials: halfLifeTopInitials },
    zaxxon: { score: zaxxonTopScore, initials: zaxxonTopInitials },
    rocket_raid: { score: rocketRaidTopScore, initials: rocketRaidTopInitials },
    qbert: { score: qbertTopScore, initials: qbertTopInitials },
    outrun: { score: outrunTopScore, initials: outrunTopInitials },
    exile: { score: exileTopScore, initials: exileTopInitials },
    impossible_mission: { score: impossibleMissionTopScore, initials: impossibleMissionTopInitials },
    mario_land: { score: marioLandTopScore, initials: marioLandTopInitials },
    tetris_dmg: { score: tetrisDmgTopScore, initials: tetrisDmgTopInitials },
    dr_mario: { score: 48500, initials: 'DOC' },
    metroid_2: { score: '39 MT', initials: 'SAM' },
    kirby_dream_land: { score: 62400, initials: 'KBY' },
    mario_land_2: { score: 99990, initials: 'MAR' },
    zelda_links_awakening: { score: '8 INSTR', initials: 'LNK' },
    donkey_kong_94: { score: 101000, initials: 'DKG' },
    pokemon_red: { score: '151 PK', initials: 'RED' },
    wario_land_2: { score: 99999, initials: 'WAR' },
    gba_sp: { score: 9999, initials: 'GBA' },
    pokemon_emerald: { score: '386 PK', initials: 'EME' },
    mario_advance: { score: 999990, initials: 'MAR' },
    zelda_minish: { score: 'FOUR SWORD', initials: 'LNK' },
    ps1: { score: '100% CD', initials: 'PS1' },
    crash_bandicoot: { score: '100% GEM', initials: 'CRH' },
    ridge_racer: { score: "1'12\"45", initials: 'RAC' },
  }), [
    spaceTopScore, spaceTopInitials, pacmanTopScore, pacmanTopInitials,
    donkeyKongTopScore, donkeyKongTopInitials,
    arcadiansTopScore, arcadiansTopInitials, demonTopScore, demonTopInitials,
    froggerTopScore, froggerTopInitials, chuckieTopScore, chuckieTopInitials,
    frakTopScore, frakTopInitials,
    reptonTopScore, reptonTopInitials, eindeloosTopScore, eindeloosTopInitials,
    tetrisTopScore, tetrisTopInitials, kingsQuestTopScore, kingsQuestTopInitials,
    marioTopScore, marioTopInitials, superMarioTopScore, superMarioTopInitials,
    wolfTopScore, wolfTopInitials, c64PinballTopScore, c64PinballTopInitials,
    templeRunTopScore, templeRunTopInitials, lemmingsTopScore, lemmingsTopInitials,
    manicMinerTopScore, manicMinerTopInitials, monsterMazeTopScore, monsterMazeTopInitials,
    asteroidsTopScore, asteroidsTopInitials,
    princeTopScore, princeTopInitials,
    doubleDragonTopScore, doubleDragonTopInitials,
    snakeTopScore, snakeTopInitials,
    doomTopScore, doomTopInitials,
    dukeTopScore, dukeTopInitials,
    halfLifeTopScore, halfLifeTopInitials,
    zaxxonTopScore, zaxxonTopInitials,
    rocketRaidTopScore, rocketRaidTopInitials,
    qbertTopScore, qbertTopInitials,
    outrunTopScore, outrunTopInitials,
    exileTopScore, exileTopInitials,
    impossibleMissionTopScore, impossibleMissionTopInitials,
    marioLandTopScore, marioLandTopInitials,
    tetrisDmgTopScore, tetrisDmgTopInitials
  ]);

  const filteredGames = useMemo(() => {
    return GAMES_METADATA.filter(game => {
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'arcade') {
          const arcadeIds = new Set(['pong', 'space_invaders', 'asteroids', 'pacman', 'donkey_kong', 'frogger', 'mario', 'doom', 'duke', 'zaxxon', 'qbert', 'outrun']);
          if (!arcadeIds.has(game.id)) return false;
        } else if (selectedCategory === 'micro') {
          const microIds = new Set(['arcadians', 'rocket_raid', 'qbert', 'chuckie_egg', 'frak', 'repton', 'eindeloos', 'monster_maze', 'manic_miner', 'exile']);
          if (!microIds.has(game.id)) return false;
        } else if (selectedCategory === 'adventure') {
          const advIds = new Set(['kings_quest', 'space_quest', 'tetris', 'wolfenstein', 'prince', 'doom', 'exile', 'impossible_mission']);
          if (!advIds.has(game.id)) return false;
        } else if (selectedCategory === 'c64') {
          const c64Ids = new Set(['battle_chess', 'c64_pinball', 'lemmings', 'impossible_mission']);
          if (!c64Ids.has(game.id)) return false;
        } else if (selectedCategory === 'console') {
          const consoleIds = new Set(['demon_attack', 'super_mario']);
          if (!consoleIds.has(game.id)) return false;
        } else if (selectedCategory === 'handheld' || selectedCategory === 'portable') {
          const handheldIds = new Set(['mario_land', 'tetris_dmg', 'dr_mario', 'metroid_2', 'kirby_dream_land', 'mario_land_2', 'zelda_links_awakening', 'donkey_kong_94', 'pokemon_red', 'wario_land_2', 'snake', 'gba_sp', 'ps1']);
          if (!handheldIds.has(game.id)) return false;
        } else if (selectedCategory === 'mobile') {
          if (game.id !== 'temple_run') return false;
        }
      }
      if (selectedYear !== 'all') {
        if (selectedYear === '70s') {
          if (game.year < 1970 || game.year > 1979) return false;
        } else if (selectedYear === '80s') {
          if (game.year < 1980 || game.year > 1989) return false;
        } else if (selectedYear === '90s') {
          if (game.year < 1990) return false;
        } else {
          if (game.year !== Number(selectedYear)) return false;
        }
      }
      if (selectedSystem !== 'all' && game.system !== selectedSystem) return false;
      if (selectedGenre !== 'all' && game.genre !== selectedGenre) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = game.title.toLowerCase().includes(q);
        const matchesYear = game.yearDisplay.includes(q);
        const matchesCreator = game.creator.toLowerCase().includes(q);
        const matchesGenre = game.genreName[lang].toLowerCase().includes(q);
        const matchesSystem = game.systemName[lang].toLowerCase().includes(q);
        const matchesSummary = game.summary[lang].toLowerCase().includes(q);
        if (!matchesTitle && !matchesYear && !matchesCreator && !matchesGenre && !matchesSystem && !matchesSummary) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, selectedYear, selectedSystem, selectedGenre, searchQuery, lang]);

  const filteredGameIds = useMemo(() => new Set(filteredGames.map(g => g.id)), [filteredGames]);

  const handleToggleLang = (newLang: Language) => {
    haptics.selection();
    arcadeHallAudio.playSwitch();
    setLang(newLang);
    try {
      localStorage.setItem('arcade_vault_lang_v2', newLang);
      localStorage.setItem('arcade_vault_lang', newLang);
    } catch {}
  };

  const handleToggleAmbiance = () => {
    const next = !isAmbianceOn;
    setIsAmbianceOn(next);
    arcadeHallAudio.toggleAmbiance(next);
    haptics.selection();
  };

  const handleLaunchGameById = (gameId: GameMetadata['id']) => {
    switch (gameId) {
      case 'pacman': handleLaunchPacman(); break;
      case 'space_invaders': handleLaunchSpaceInvaders(); break;
      case 'demon_attack': handleLaunchDemonAttack(); break;
      case 'repton': handleLaunchRepton(); break;
      case 'eindeloos': handleLaunchEindeloos(); break;
      case 'frogger': handleLaunchFrogger(); break;
      case 'chuckie_egg': handleLaunchChuckieEgg(); break;
      case 'frak': handleLaunchFrak(); break;
      case 'arcadians': handleLaunchArcadians(); break;
      case 'rocket_raid': handleLaunchRocketRaid(); break;
      case 'qbert': handleLaunchQbert(); break;
      case 'tetris': handleLaunchTetris(); break;
      case 'kings_quest': handleLaunchKingsQuest(); break;
      case 'space_quest': handleLaunchSpaceQuest(); break;
      case 'pong': handleLaunchPong(); break;
      case 'battle_chess': handleLaunchBattleChess(); break;
      case 'mario': handleLaunchMario(); break;
      case 'super_mario': handleLaunchSuperMario(); break;
      case 'wolfenstein': handleLaunchWolfenstein(); break;
      case 'c64_pinball': handleLaunchC64Pinball(); break;
      case 'temple_run': handleLaunchTempleRun(); break;
      case 'lemmings': handleLaunchLemmings(); break;
      case 'manic_miner': handleLaunchManicMiner(); break;
      case 'monster_maze': handleLaunchMonsterMaze(); break;
      case 'asteroids': handleLaunchAsteroids(); break;
      case 'prince': handleLaunchPrince(); break;
      case 'donkey_kong': handleLaunchDonkeyKong(); break;
      case 'double_dragon': handleLaunchDoubleDragon(); break;
      case 'snake': handleLaunchSnake(); break;
      case 'doom': handleLaunchDoom(); break;
      case 'duke': handleLaunchDuke(); break;
      case 'half_life': handleLaunchHalfLife(); break;
      case 'zaxxon': handleLaunchZaxxon(); break;
      case 'outrun': handleLaunchOutrun(); break;
      case 'exile': handleLaunchExile(); break;
      case 'impossible_mission': handleLaunchImpossibleMission(); break;
      case 'mario_land': handleLaunchMarioLand(); break;
      case 'tetris_dmg': handleLaunchTetrisDmg(); break;
      case 'dr_mario':
      case 'metroid_2':
      case 'kirby_dream_land':
      case 'mario_land_2':
      case 'zelda_links_awakening':
      case 'donkey_kong_94':
      case 'pokemon_red':
      case 'wario_land_2':
        haptics.powerPellet();
        onSelectGame(gameId);
        break;
      case 'gba_sp': handleLaunchGbaSp(); break;
      case 'pokemon_emerald':
      case 'mario_advance':
      case 'zelda_minish':
        haptics.powerPellet();
        onSelectGame(gameId);
        break;
      case 'ps1': handleLaunchPs1(); break;
      case 'crash_bandicoot':
      case 'ridge_racer':
        haptics.powerPellet();
        onSelectGame(gameId);
        break;
    }
  };

  const handleOpenDossierById = (gameId: GameMetadata['id']) => {
    switch (gameId) {
      case 'pacman': setIsPacmanHistoryOpen(true); break;
      case 'space_invaders': setIsSpaceHistoryOpen(true); break;
      case 'donkey_kong': setIsDonkeyKongHistoryOpen(true); break;
      case 'demon_attack': setIsDemonHistoryOpen(true); break;
      case 'repton': setIsReptonHistoryOpen(true); break;
      case 'eindeloos': setIsEindeloosHistoryOpen(true); break;
      case 'frogger': setIsFroggerHistoryOpen(true); break;
      case 'chuckie_egg': setIsChuckieEggHistoryOpen(true); break;
      case 'frak': setIsFrakHistoryOpen(true); break;
      case 'arcadians': setIsArcadiansHistoryOpen(true); break;
      case 'rocket_raid': setIsRocketRaidHistoryOpen(true); break;
      case 'qbert': setIsQbertHistoryOpen(true); break;
      case 'tetris': setIsTetrisHistoryOpen(true); break;
      case 'kings_quest': setIsKingsQuestHistoryOpen(true); break;
      case 'space_quest': setIsSpaceQuestHistoryOpen(true); break;
      case 'pong': setIsPongHistoryOpen(true); break;
      case 'battle_chess': setIsBattleChessHistoryOpen(true); break;
      case 'mario': setIsMarioHistoryOpen(true); break;
      case 'super_mario': setIsSuperMarioHistoryOpen(true); break;
      case 'wolfenstein': setIsWolfensteinHistoryOpen(true); break;
      case 'c64_pinball': setIsC64PinballHistoryOpen(true); break;
      case 'temple_run': setIsTempleRunHistoryOpen(true); break;
      case 'lemmings': setIsLemmingsHistoryOpen(true); break;
      case 'manic_miner': setIsManicMinerHistoryOpen(true); break;
      case 'monster_maze': setIsMonsterMazeHistoryOpen(true); break;
      case 'asteroids': setIsAsteroidsHistoryOpen(true); break;
      case 'prince': setIsPrinceHistoryOpen(true); break;
      case 'double_dragon': setIsDoubleDragonHistoryOpen(true); break;
      case 'snake': setIsSnakeHistoryOpen(true); break;
      case 'doom': setIsDoomHistoryOpen(true); break;
      case 'duke': setIsDukeHistoryOpen(true); break;
      case 'half_life': setIsHalfLifeHistoryOpen(true); break;
      case 'zaxxon': setIsZaxxonHistoryOpen(true); break;
      case 'outrun': setIsOutrunHistoryOpen(true); break;
      case 'exile': setIsExileHistoryOpen(true); break;
      case 'impossible_mission': setIsImpossibleMissionHistoryOpen(true); break;
      case 'mario_land':
      case 'tetris_dmg':
      case 'dr_mario':
      case 'metroid_2':
      case 'kirby_dream_land':
      case 'mario_land_2':
      case 'zelda_links_awakening':
      case 'donkey_kong_94':
      case 'pokemon_red':
      case 'wario_land_2':
        setIsGameBoyHistoryOpen(true);
        break;
      case 'gba_sp':
      case 'pokemon_emerald':
      case 'mario_advance':
      case 'zelda_minish':
        setIsGbaHistoryOpen(true);
        break;
      case 'ps1':
      case 'crash_bandicoot':
      case 'ridge_racer':
        setIsPs1HistoryOpen(true);
        break;
    }
  };

  const handleRandomCabinet = () => {
    const pool = filteredGames.length > 0 ? filteredGames : GAMES_METADATA;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    haptics.success();
    arcadeHallAudio.playCoinDrop();
    handleLaunchGameById(chosen.id);
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedYear !== 'all' || selectedSystem !== 'all' || selectedGenre !== 'all' || searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    haptics.light();
    arcadeHallAudio.playSwitch();
    setSelectedCategory('all');
    setSelectedYear('all');
    setSelectedSystem('all');
    setSelectedGenre('all');
    setSearchQuery('');
  };

  // Section 1 Quick Launch Strip: All 24 games with metadata & cabinet types
  const quickCardsList = useMemo(() => [
    {
      id: 'kings_quest',
      title: "KING'S QUEST I",
      year: 1984,
      tag: "IBM '84",
      genre: "Sierra Quest",
      icon: "👑",
      iconAnim: "group-hover:-translate-y-1.5 group-hover:rotate-6",
      cabinetType: 'pc_dos' as const,
      gradient: "from-amber-600/90 via-yellow-500/80 to-indigo-950/95",
      border: "border-amber-400/80 hover:border-amber-300",
      glow: "hover:shadow-[0_0_24px_rgba(245,158,11,0.65)]",
      badgeColor: "bg-amber-400 text-black",
      onClick: handleLaunchKingsQuest,
    },
    {
      id: 'space_quest',
      title: "SPACE QUEST I",
      year: 1986,
      tag: "IBM '86",
      genre: "Roger Wilco",
      icon: "🚀",
      iconAnim: "group-hover:-translate-y-2 group-hover:translate-x-1 group-hover:scale-125",
      cabinetType: 'pc_dos' as const,
      gradient: "from-purple-600/90 via-fuchsia-600/80 to-cyan-950/95",
      border: "border-purple-400/80 hover:border-fuchsia-300",
      glow: "hover:shadow-[0_0_24px_rgba(168,85,247,0.65)]",
      badgeColor: "bg-fuchsia-400 text-black",
      onClick: handleLaunchSpaceQuest,
    },
    {
      id: 'tetris',
      title: "TETRIS",
      year: 1984,
      tag: "SOVIET '84",
      genre: "Alexey Pajitnov",
      icon: "🧱",
      iconAnim: "group-hover:rotate-180 group-hover:scale-125",
      cabinetType: 'pc_dos' as const,
      gradient: "from-red-600/90 via-rose-600/80 to-neutral-950/95",
      border: "border-red-400/80 hover:border-red-300",
      glow: "hover:shadow-[0_0_24px_rgba(239,68,68,0.65)]",
      badgeColor: "bg-red-400 text-white",
      onClick: handleLaunchTetris,
    },
    {
      id: 'wolfenstein',
      title: "WOLFENSTEIN 3D",
      year: 1992,
      tag: "DOS '92",
      genre: "id Software Raycast",
      icon: "🏰",
      iconAnim: "group-hover:scale-125 group-hover:-translate-y-1",
      cabinetType: 'pc_dos' as const,
      gradient: "from-stone-700/90 via-neutral-800/80 to-red-950/95",
      border: "border-stone-400/80 hover:border-red-400",
      glow: "hover:shadow-[0_0_24px_rgba(239,68,68,0.65)]",
      badgeColor: "bg-stone-300 text-black",
      onClick: handleLaunchWolfenstein,
    },
    {
      id: 'pong',
      title: "PONG",
      year: 1972,
      tag: "ATARI '72",
      genre: "Nolan Bushnell",
      icon: "🏓",
      iconAnim: "group-hover:scale-125 group-hover:-translate-y-1 group-hover:rotate-12",
      cabinetType: 'arcade' as const,
      gradient: "from-neutral-700/90 via-neutral-800/80 to-neutral-950/95",
      border: "border-neutral-400/80 hover:border-white",
      glow: "hover:shadow-[0_0_24px_rgba(255,255,255,0.45)]",
      badgeColor: "bg-white text-black",
      onClick: handleLaunchPong,
    },
    {
      id: 'space_invaders',
      title: "SPACE INVADERS",
      year: 1978,
      tag: "ARCADE '78",
      genre: "T. Nishikado",
      icon: "👾",
      iconAnim: "group-hover:scale-125 group-hover:-translate-y-1",
      cabinetType: 'arcade' as const,
      gradient: "from-emerald-600/90 via-green-600/80 to-neutral-950/95",
      border: "border-emerald-400/80 hover:border-emerald-300",
      glow: "hover:shadow-[0_0_24px_rgba(16,185,129,0.65)]",
      badgeColor: "bg-emerald-400 text-black",
      onClick: handleLaunchSpaceInvaders,
    },
    {
      id: 'asteroids',
      title: "ASTEROIDS",
      year: 1979,
      tag: "VECTOR '79",
      genre: "Atari QuadraScan",
      icon: "🪨",
      iconAnim: "group-hover:-translate-y-2 group-hover:scale-125 group-hover:rotate-45",
      cabinetType: 'arcade' as const,
      gradient: "from-sky-950/90 via-cyan-900/80 to-neutral-950/95",
      border: "border-cyan-400/80 hover:border-cyan-300",
      glow: "hover:shadow-[0_0_24px_rgba(56,189,248,0.85)]",
      badgeColor: "bg-cyan-400 text-black",
      onClick: handleLaunchAsteroids,
    },
    {
      id: 'pacman',
      title: "PAC-MAN",
      year: 1980,
      tag: "NAMCO '80",
      genre: "Toru Iwatani",
      icon: "🟡",
      iconAnim: "group-hover:scale-125 group-hover:translate-x-1",
      cabinetType: 'arcade' as const,
      gradient: "from-yellow-500/90 via-amber-500/80 to-neutral-950/95",
      border: "border-yellow-400/80 hover:border-yellow-300",
      glow: "hover:shadow-[0_0_24px_rgba(234,179,8,0.7)]",
      badgeColor: "bg-yellow-400 text-black",
      onClick: handleLaunchPacman,
    },
    {
      id: 'donkey_kong',
      title: "DONKEY KONG",
      year: 1981,
      tag: "NINTENDO '81",
      genre: "Shigeru Miyamoto",
      icon: "🦍",
      iconAnim: "group-hover:scale-125 group-hover:-translate-y-2",
      cabinetType: 'arcade' as const,
      gradient: "from-sky-600/90 via-blue-600/80 to-red-950/95",
      border: "border-sky-400/80 hover:border-red-400",
      glow: "hover:shadow-[0_0_24px_rgba(56,189,248,0.75)]",
      badgeColor: "bg-red-500 text-white",
      onClick: handleLaunchDonkeyKong,
    },
    {
      id: 'monster_maze',
      title: "MONSTER MAZE",
      year: 1981,
      tag: "ZX81 '81",
      genre: "3D Survival Horror",
      icon: "🦖",
      iconAnim: "group-hover:-translate-y-2 group-hover:scale-125 group-hover:-rotate-12",
      cabinetType: 'micro' as const,
      gradient: "from-emerald-700/90 via-teal-800/80 to-neutral-950/95",
      border: "border-emerald-400/80 hover:border-emerald-300",
      glow: "hover:shadow-[0_0_24px_rgba(16,185,129,0.75)]",
      badgeColor: "bg-emerald-400 text-black",
      onClick: handleLaunchMonsterMaze,
    },
    {
      id: 'demon_attack',
      title: "DEMON ATTACK",
      year: 1982,
      tag: "ATARI '82",
      genre: "Rob Fulop / Imagic",
      icon: "🦅",
      iconAnim: "group-hover:scale-125 group-hover:-translate-y-2",
      cabinetType: 'console' as const,
      gradient: "from-purple-600/90 via-indigo-600/80 to-neutral-950/95",
      border: "border-purple-400/80 hover:border-purple-300",
      glow: "hover:shadow-[0_0_24px_rgba(168,85,247,0.65)]",
      badgeColor: "bg-purple-400 text-white",
      onClick: handleLaunchDemonAttack,
    },
    {
      id: 'frogger',
      title: "FROGGER",
      year: 1982,
      tag: "KONAMI '82",
      genre: "Konami Arcade",
      icon: "🐸",
      iconAnim: "group-hover:-translate-y-2 group-hover:scale-125",
      cabinetType: 'arcade' as const,
      gradient: "from-green-600/90 via-emerald-600/80 to-neutral-950/95",
      border: "border-green-400/80 hover:border-green-300",
      glow: "hover:shadow-[0_0_24px_rgba(34,197,94,0.65)]",
      badgeColor: "bg-green-400 text-black",
      onClick: handleLaunchFrogger,
    },
    {
      id: 'zaxxon',
      title: "ZAXXON",
      year: 1982,
      tag: "SEGA '82",
      genre: "Isometric 3D Flight",
      icon: "🚀",
      iconAnim: "group-hover:scale-125 group-hover:-translate-y-2 group-hover:rotate-6",
      cabinetType: 'arcade' as const,
      gradient: "from-blue-600/90 via-indigo-700/80 to-neutral-950/95",
      border: "border-blue-400/80 hover:border-cyan-300",
      glow: "hover:shadow-[0_0_24px_rgba(37,99,235,0.75)]",
      badgeColor: "bg-blue-500 text-white font-black",
      onClick: handleLaunchZaxxon,
    },
    {
      id: 'arcadians',
      title: "ARCADIANS",
      year: 1982,
      tag: "BBC '82",
      genre: "Orlando Galaxian",
      icon: "🛸",
      iconAnim: "group-hover:rotate-12 group-hover:scale-125",
      cabinetType: 'micro' as const,
      gradient: "from-cyan-600/90 via-blue-600/80 to-neutral-950/95",
      border: "border-cyan-400/80 hover:border-cyan-300",
      glow: "hover:shadow-[0_0_24px_rgba(6,182,212,0.65)]",
      badgeColor: "bg-cyan-400 text-black",
      onClick: handleLaunchArcadians,
    },
    {
      id: 'rocket_raid',
      title: "ROCKET RAID",
      year: 1982,
      tag: "BBC '82",
      genre: "Acornsoft Scramble",
      icon: "🚀",
      iconAnim: "group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-125",
      cabinetType: 'micro' as const,
      gradient: "from-pink-600/90 via-rose-700/80 to-neutral-950/95",
      border: "border-pink-400/80 hover:border-pink-300",
      glow: "hover:shadow-[0_0_24px_rgba(236,72,153,0.65)]",
      badgeColor: "bg-pink-500 text-white font-black",
      onClick: handleLaunchRocketRaid,
    },
    {
      id: 'qbert',
      title: "Q*BERT",
      year: 1983,
      tag: "BBC / ARCADE '83",
      genre: "Isometric 3D Puzzle",
      icon: "🟠",
      iconAnim: "group-hover:scale-125 group-hover:-translate-y-2 group-hover:rotate-12",
      cabinetType: 'micro' as const,
      gradient: "from-orange-600/90 via-amber-600/80 to-neutral-950/95",
      border: "border-orange-400/80 hover:border-yellow-300",
      glow: "hover:shadow-[0_0_24px_rgba(249,115,22,0.75)]",
      badgeColor: "bg-orange-500 text-white font-black",
      onClick: handleLaunchQbert,
    },
    {
      id: 'mario',
      title: "MARIO BROS.",
      year: 1983,
      tag: "ARCADE '83",
      genre: "Shigeru Miyamoto",
      icon: "🍄",
      iconAnim: "group-hover:scale-125 group-hover:-translate-y-2",
      cabinetType: 'arcade' as const,
      gradient: "from-blue-600/90 via-cyan-600/80 to-neutral-950/95",
      border: "border-blue-400/80 hover:border-blue-300",
      glow: "hover:shadow-[0_0_24px_rgba(59,130,246,0.65)]",
      badgeColor: "bg-blue-400 text-white",
      onClick: handleLaunchMario,
    },
    {
      id: 'chuckie_egg',
      title: "CHUCKIE EGG",
      year: 1983,
      tag: "BBC '83",
      genre: "Nigel Alderton",
      icon: "🥚",
      iconAnim: "group-hover:scale-125 group-hover:rotate-12",
      cabinetType: 'micro' as const,
      gradient: "from-yellow-600/90 via-orange-600/80 to-neutral-950/95",
      border: "border-yellow-400/80 hover:border-yellow-300",
      glow: "hover:shadow-[0_0_24px_rgba(234,179,8,0.65)]",
      badgeColor: "bg-yellow-400 text-black",
      onClick: handleLaunchChuckieEgg,
    },
    {
      id: 'manic_miner',
      title: "MANIC MINER",
      year: 1983,
      tag: "SPECTRUM '83",
      genre: "Matthew Smith",
      icon: "⛏️",
      iconAnim: "group-hover:-translate-y-2 group-hover:scale-125 group-hover:rotate-12",
      cabinetType: 'micro' as const,
      gradient: "from-yellow-600/90 via-amber-600/80 to-neutral-950/95",
      border: "border-yellow-400/80 hover:border-yellow-300",
      glow: "hover:shadow-[0_0_24px_rgba(234,179,8,0.75)]",
      badgeColor: "bg-yellow-400 text-black",
      onClick: handleLaunchManicMiner,
    },
    {
      id: 'frak',
      title: "FRAK!",
      year: 1984,
      tag: "BBC '84",
      genre: "Nick Pelling Caveman",
      icon: "🪓",
      iconAnim: "group-hover:rotate-45 group-hover:scale-125",
      cabinetType: 'micro' as const,
      gradient: "from-amber-600/90 via-red-600/80 to-neutral-950/95",
      border: "border-amber-400/80 hover:border-amber-300",
      glow: "hover:shadow-[0_0_24px_rgba(245,158,11,0.65)]",
      badgeColor: "bg-amber-400 text-black",
      onClick: handleLaunchFrak,
    },
    {
      id: 'repton',
      title: "REPTON",
      year: 1985,
      tag: "BBC '85",
      genre: "Tim Tyler Superior",
      icon: "💎",
      iconAnim: "group-hover:scale-125 group-hover:rotate-12",
      cabinetType: 'micro' as const,
      gradient: "from-emerald-600/90 via-teal-600/80 to-neutral-950/95",
      border: "border-emerald-400/80 hover:border-emerald-300",
      glow: "hover:shadow-[0_0_24px_rgba(16,185,129,0.65)]",
      badgeColor: "bg-emerald-400 text-black",
      onClick: handleLaunchRepton,
    },
    {
      id: 'eindeloos',
      title: "EINDELOOS",
      year: 1985,
      tag: "BBC '85",
      genre: "J. v.d. Arend Vektor",
      icon: "🚁",
      iconAnim: "group-hover:-translate-y-2 group-hover:scale-110",
      cabinetType: 'micro' as const,
      gradient: "from-cyan-600/90 via-teal-600/80 to-neutral-950/95",
      border: "border-cyan-400/80 hover:border-cyan-300",
      glow: "hover:shadow-[0_0_24px_rgba(6,182,212,0.65)]",
      badgeColor: "bg-cyan-400 text-black",
      onClick: handleLaunchEindeloos,
    },
    {
      id: 'super_mario',
      title: "SUPER MARIO BROS",
      year: 1985,
      tag: "NES '85",
      genre: "Nintendo Famicom",
      icon: "⭐",
      iconAnim: "group-hover:scale-125 group-hover:rotate-12",
      cabinetType: 'console' as const,
      gradient: "from-red-600/90 via-amber-600/80 to-neutral-950/95",
      border: "border-red-400/80 hover:border-amber-300",
      glow: "hover:shadow-[0_0_24px_rgba(239,68,68,0.7)]",
      badgeColor: "bg-red-500 text-white",
      onClick: handleLaunchSuperMario,
    },
    {
      id: 'battle_chess',
      title: "BATTLE CHESS",
      year: 1988,
      tag: "AMIGA '88",
      genre: "Interplay Animated",
      icon: "♟️",
      iconAnim: "group-hover:scale-125 group-hover:-translate-y-1.5",
      cabinetType: 'c64_amiga' as const,
      gradient: "from-indigo-600/90 via-purple-600/80 to-neutral-950/95",
      border: "border-indigo-400/80 hover:border-indigo-300",
      glow: "hover:shadow-[0_0_24px_rgba(99,102,241,0.65)]",
      badgeColor: "bg-indigo-400 text-white",
      onClick: handleLaunchBattleChess,
    },
    {
      id: 'c64_pinball',
      title: "3D PINBALL",
      year: 1989,
      tag: "C64 '89",
      genre: "Commodore 64",
      icon: "⚡",
      iconAnim: "group-hover:scale-125 group-hover:rotate-12",
      cabinetType: 'c64_amiga' as const,
      gradient: "from-amber-600/90 via-orange-600/80 to-neutral-950/95",
      border: "border-amber-400/80 hover:border-amber-300",
      glow: "hover:shadow-[0_0_24px_rgba(245,158,11,0.65)]",
      badgeColor: "bg-amber-400 text-black",
      onClick: handleLaunchC64Pinball,
    },
    {
      id: 'lemmings',
      title: "LEMMINGS",
      year: 1991,
      tag: "AMIGA '91",
      genre: "DMA Design Classic",
      icon: "🐹",
      iconAnim: "group-hover:-translate-y-2 group-hover:scale-125",
      cabinetType: 'c64_amiga' as const,
      gradient: "from-lime-600/90 via-emerald-600/80 to-neutral-950/95",
      border: "border-lime-400/80 hover:border-lime-300",
      glow: "hover:shadow-[0_0_24px_rgba(132,204,22,0.65)]",
      badgeColor: "bg-lime-400 text-black",
      onClick: handleLaunchLemmings,
    },
    {
      id: 'temple_run',
      title: "TEMPLE RUN 3D",
      year: 2011,
      tag: "3D '11",
      genre: "Imangi Endless Runner",
      icon: "🏃",
      iconAnim: "group-hover:-translate-y-2 group-hover:scale-125",
      cabinetType: 'mobile' as const,
      gradient: "from-orange-600/90 via-amber-600/80 to-neutral-950/95",
      border: "border-orange-400/80 hover:border-orange-300",
      glow: "hover:shadow-[0_0_24px_rgba(249,115,22,0.65)]",
      badgeColor: "bg-orange-400 text-black",
      onClick: handleLaunchTempleRun,
    },
    {
      id: 'prince',
      title: "PRINCE OF PERSIA",
      year: 1990,
      tag: "DOS '90",
      genre: "Mechner Rotoscoped",
      icon: "🗡️",
      iconAnim: "group-hover:rotate-12 group-hover:scale-125",
      cabinetType: 'pc_dos' as const,
      gradient: "from-amber-950/90 via-red-950/80 to-neutral-950/95",
      border: "border-amber-400/80 hover:border-amber-300",
      glow: "hover:shadow-[0_0_24px_rgba(245,158,11,0.75)]",
      badgeColor: "bg-amber-400 text-black",
      onClick: handleLaunchPrince,
    },
    {
      id: 'double_dragon',
      title: "DOUBLE DRAGON",
      year: 1987,
      tag: "ARCADE '87",
      genre: "Technos Beat 'em Up",
      icon: "🥋",
      iconAnim: "group-hover:scale-125 group-hover:-translate-x-1.5",
      cabinetType: 'arcade' as const,
      gradient: "from-blue-700/90 via-indigo-800/80 to-neutral-950/95",
      border: "border-blue-400/80 hover:border-indigo-300",
      glow: "hover:shadow-[0_0_24px_rgba(59,130,246,0.7)]",
      badgeColor: "bg-blue-500 text-white",
      onClick: handleLaunchDoubleDragon,
    },
    {
      id: 'snake',
      title: "NOKIA SNAKE",
      year: 1997,
      tag: "NOKIA '97",
      genre: "Taneli Armanto",
      icon: "🐍",
      iconAnim: "group-hover:scale-125 group-hover:translate-x-1",
      cabinetType: 'mobile' as const,
      gradient: "from-emerald-700/90 via-lime-700/80 to-neutral-950/95",
      border: "border-lime-400/80 hover:border-lime-300",
      glow: "hover:shadow-[0_0_24px_rgba(132,204,22,0.7)]",
      badgeColor: "bg-lime-400 text-black",
      onClick: handleLaunchSnake,
    },
    {
      id: 'doom',
      title: "DOOM (1993)",
      year: 1993,
      tag: "id Software '93",
      genre: "John Carmack & Romero",
      icon: "💀",
      iconAnim: "group-hover:scale-125 group-hover:rotate-6",
      cabinetType: 'arcade' as const,
      gradient: "from-red-950 via-stone-900/90 to-black/95",
      border: "border-red-500/80 hover:border-red-400",
      glow: "hover:shadow-[0_0_26px_rgba(239,68,68,0.75)]",
      badgeColor: "bg-red-600 text-white font-black",
      onClick: handleLaunchDoom,
    },
    {
      id: 'duke',
      title: "DUKE NUKEM 3D",
      year: 1996,
      tag: "3D Realms '96",
      genre: "Build Engine 3D FPS",
      icon: "☢️",
      iconAnim: "group-hover:scale-125 group-hover:-rotate-6",
      cabinetType: 'arcade' as const,
      gradient: "from-amber-950 via-yellow-950/90 to-black/95",
      border: "border-amber-500/80 hover:border-yellow-400",
      glow: "hover:shadow-[0_0_26px_rgba(245,158,11,0.75)]",
      badgeColor: "bg-amber-400 text-black font-black",
      onClick: handleLaunchDuke,
    },
    {
      id: 'half_life',
      title: "HALF-LIFE",
      year: 1998,
      tag: "VALVE '98",
      genre: "GoldSrc 1920x1280 3D",
      icon: "λ",
      iconAnim: "group-hover:scale-125 group-hover:rotate-12",
      cabinetType: 'pc_dos' as const,
      gradient: "from-orange-950 via-amber-950/90 to-black/95",
      border: "border-orange-500/80 hover:border-amber-400",
      glow: "hover:shadow-[0_0_26px_rgba(249,115,22,0.85)]",
      badgeColor: "bg-orange-500 text-white font-black",
      onClick: handleLaunchHalfLife,
    },
    {
      id: 'outrun',
      title: "OUTRUN (1986)",
      year: 1986,
      tag: "SEGA '86",
      genre: "Yu Suzuki Road Trip",
      icon: "🌴",
      iconAnim: "group-hover:scale-125 group-hover:translate-x-1",
      cabinetType: 'arcade' as const,
      gradient: "from-red-950 via-amber-950/90 to-black/95",
      border: "border-red-500/80 hover:border-yellow-400",
      glow: "hover:shadow-[0_0_26px_rgba(239,68,68,0.85)]",
      badgeColor: "bg-red-600 text-white font-black",
      onClick: handleLaunchOutrun,
    },
    {
      id: 'exile',
      title: "EXILE (1988)",
      year: 1988,
      tag: "BBC '88",
      genre: "Peter Irvin Physics Sandbox",
      icon: "🚀",
      iconAnim: "group-hover:scale-125 group-hover:-translate-y-1.5 group-hover:rotate-6",
      cabinetType: 'micro' as const,
      gradient: "from-cyan-950 via-blue-950/90 to-black/95",
      border: "border-cyan-500/80 hover:border-cyan-300",
      glow: "hover:shadow-[0_0_26px_rgba(6,182,212,0.85)]",
      badgeColor: "bg-cyan-500 text-black font-black",
      onClick: handleLaunchExile,
    },
    {
      id: 'impossible_mission',
      title: "IMPOSSIBLE MISSION",
      year: 1984,
      tag: "C64 '84",
      genre: "Epyx • Stay Forever!",
      icon: "🕵️",
      iconAnim: "group-hover:scale-125 group-hover:-translate-y-1 group-hover:rotate-6",
      cabinetType: 'c64_amiga' as const,
      gradient: "from-blue-950 via-indigo-950/90 to-black/95",
      border: "border-blue-500/80 hover:border-blue-300",
      glow: "hover:shadow-[0_0_26px_rgba(59,130,246,0.85)]",
      badgeColor: "bg-blue-500 text-white font-black",
      onClick: handleLaunchImpossibleMission,
    }
  ], [
    handleLaunchKingsQuest, handleLaunchSpaceQuest, handleLaunchTetris, handleLaunchWolfenstein,
    handleLaunchPong, handleLaunchSpaceInvaders, handleLaunchAsteroids, handleLaunchMario,
    handleLaunchChuckieEgg, handleLaunchManicMiner, handleLaunchFrak, handleLaunchRepton,
    handleLaunchC64Pinball, handleLaunchLemmings, handleLaunchTempleRun, handleLaunchPrince,
    handleLaunchDoubleDragon, handleLaunchSnake, handleLaunchDoom, handleLaunchDuke,
    handleLaunchHalfLife, handleLaunchOutrun, handleLaunchExile, handleLaunchImpossibleMission,
    handleLaunchQbert
  ]);

  const displayQuickCards = useMemo(() => {
    const list = [...quickCardsList];
    if (quickCardSort === 'year-asc') {
      list.sort((a, b) => a.year - b.year);
    } else if (quickCardSort === 'year-desc') {
      list.sort((a, b) => b.year - a.year);
    } else if (quickCardSort === 'type') {
      const typePriority: Record<string, number> = { arcade: 1, micro: 2, pc_dos: 3, c64_amiga: 4, console: 5, mobile: 6 };
      list.sort((a, b) => {
        const diff = (typePriority[a.cabinetType] || 99) - (typePriority[b.cabinetType] || 99);
        return diff !== 0 ? diff : a.year - b.year;
      });
    }
    return list;
  }, [quickCardsList, quickCardSort]);

  return (
    <div className="flex flex-col min-h-screen w-full bg-neutral-950 text-white font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Retro Arcade Header Marquee */}
      <header className="w-full border-b border-neutral-800/80 bg-black/75 backdrop-blur sticky top-0 z-30 px-3 sm:px-8 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-500 via-emerald-500 to-cyan-500 flex items-center justify-center text-black font-black text-xl shadow-[0_0_18px_rgba(6,182,212,0.5)] shrink-0">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-wider font-mono text-white flex items-center gap-1.5">
                <span>ARCADE</span>
                <span className="text-yellow-400 underline decoration-yellow-500/60 decoration-2">VAULT</span>
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse">
                {t.activeGamesBadge}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono hidden sm:block">
              {t.headerSub}
            </p>
          </div>
        </div>

        {/* Header Right: Language Switcher, Sound & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ambiance Audio Toggle */}
          <button
            type="button"
            onClick={handleToggleAmbiance}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isAmbianceOn 
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                : 'bg-neutral-900/90 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
            title={isAmbianceOn ? t.soundOn : t.soundOff}
          >
            {isAmbianceOn ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span className="hidden md:inline">{isAmbianceOn ? t.soundOn : t.soundOff}</span>
          </button>

          {/* Bilingual Language Switcher */}
          <div className="flex items-center rounded-xl bg-neutral-900 border border-neutral-800 p-1 text-xs font-mono font-bold shadow-inner">
            <button
              type="button"
              onClick={() => handleToggleLang('nl')}
              className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                lang === 'nl'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Nederlands"
            >
              <span className="text-xs">🇳🇱</span>
              <span className="text-[11px]">NL</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleLang('en')}
              className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                lang === 'en'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="English"
            >
              <span className="text-xs">🇬🇧</span>
              <span className="text-[11px]">EN</span>
            </button>
          </div>

          {/* Xbox Controller Status & Guide */}
          <button
            type="button"
            onClick={() => setShowGamepadGuide(true)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isGamepadConnected
                ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                : 'bg-neutral-900/90 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
            title={isGamepadConnected ? (lang === 'nl' ? 'Xbox Controller Verbonden - Bekijk knoppen' : 'Xbox Controller Connected - View controls') : (lang === 'nl' ? 'Xbox Controller Ondersteuning & Knoppen' : 'Xbox Controller Support & Controls')}
          >
            <Gamepad2 className={`w-3.5 h-3.5 ${isGamepadConnected ? 'text-emerald-400 animate-pulse' : 'text-neutral-400'}`} />
            <span className="hidden sm:inline">
              {isGamepadConnected ? '🎮 Xbox Actief' : '🎮 Xbox'}
            </span>
          </button>

          {/* Mobile Tilt & Touch Controls Guide Button */}
          <button
            type="button"
            onClick={() => setShowTiltTouchGuide(true)}
            className="px-2.5 py-1.5 rounded-xl border border-purple-600/80 bg-purple-950/70 hover:bg-purple-900/80 text-purple-200 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-[0_0_12px_rgba(168,85,247,0.3)] hover:shadow-[0_0_18px_rgba(168,85,247,0.5)]"
            title={lang === 'en' ? 'Mobile Tilt & Touch Controls Guide - Click to view' : 'Kantel- & Aanraakbediening Handleiding (Mobiel/Tablet) - Klik om te bekijken'}
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="hidden sm:inline">Tilt &amp; Touch</span>
          </button>

          {/* GitHub & Project Dossier Modal Button */}
          <button
            type="button"
            onClick={() => {
              setProjectInfoTab('overview');
              setShowProjectInfo(true);
            }}
            className="px-2.5 py-1.5 rounded-xl border border-cyan-700/80 bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-200 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-[0_0_12px_rgba(6,182,212,0.25)] hover:shadow-[0_0_18px_rgba(6,182,212,0.45)]"
            title={lang === 'en' ? 'Project Dossier & GitHub Documentation' : 'Project Dossier & GitHub Documentatie'}
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Docs</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-8">
        
        {/* Welcome & Context Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900/95 to-neutral-950 border border-neutral-800 p-6 sm:p-8 shadow-2xl">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold font-mono tracking-wider whitespace-nowrap shadow-sm w-fit">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{t.badge}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                {t.mainTitle}
              </h2>
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-3xl">
                {t.mainDesc}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: 1-Line Retro Arcade House Control Bar */}
        <section className="w-full">
          <div className="p-2 sm:p-2.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-2xl backdrop-blur flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5">
            {/* View Mode Switcher: 3D Speelhal, Kasten & Tijdlijn */}
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800/80 shrink-0">
              <button
                type="button"
                onClick={() => {
                  haptics.selection();
                  arcadeHallAudio.playSwitch();
                  setActiveView('floor');
                }}
                className={`px-3 py-1.5 rounded-lg font-mono font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeView === 'floor'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title={lang === 'nl' ? '3D Speelhal Vloer' : '3D Arcade Floor'}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t.viewFloor}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  haptics.selection();
                  arcadeHallAudio.playSwitch();
                  setActiveView('cards');
                }}
                className={`px-3 py-1.5 rounded-lg font-mono font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeView === 'cards'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title={lang === 'nl' ? 'Kasten Showcase' : 'Cabinet Showcase'}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>{t.viewCards}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  haptics.selection();
                  arcadeHallAudio.playSwitch();
                  setActiveView('timeline');
                }}
                className={`px-3 py-1.5 rounded-lg font-mono font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeView === 'timeline'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title={lang === 'nl' ? 'Tijdlijn (1972-2011)' : 'Timeline (1972-2011)'}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{t.viewTimeline}</span>
              </button>
            </div>

            {/* Middle: Controls for Category & Year + Search Bar */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 flex-1 min-w-[260px]">
              {/* Category Filter Dropdown */}
              <div className="relative shrink-0 w-full sm:w-auto">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    haptics.light();
                    setSelectedCategory(e.target.value);
                  }}
                  className="w-full sm:w-auto appearance-none pl-3 pr-8 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono font-bold text-neutral-200 focus:outline-none focus:border-cyan-500 cursor-pointer hover:border-neutral-700 transition-colors"
                >
                  <option value="all">🏷️ {lang === 'nl' ? 'Alle Categorieën' : 'All Categories'}</option>
                  <option value="arcade">🕹️ {lang === 'nl' ? 'Speelhal Coin-Op' : 'Arcade Coin-Op'}</option>
                  <option value="handheld">📱 {lang === 'nl' ? 'Portables & Handhelds (Game Boy, GBA, PS1 & Mobiel)' : 'Portables & Handhelds (Game Boy, GBA, PS1 & Mobile)'}</option>
                  <option value="portable">🎮 {lang === 'nl' ? 'Portable Players (Game Boy, GBA, PS1)' : 'Portable Players (Game Boy, GBA, PS1)'}</option>
                  <option value="micro">💻 {lang === 'nl' ? '8-Bit Micro Computers (BBC & ZX)' : '8-Bit Micro Computers (BBC & ZX)'}</option>
                  <option value="adventure">👑 {lang === 'nl' ? 'Sierra Quests & DOS' : 'Sierra Quests & DOS'}</option>
                  <option value="c64">💾 {lang === 'nl' ? 'Commodore 64 & Amiga' : 'C64 & Amiga Classics'}</option>
                  <option value="console">🎮 {lang === 'nl' ? 'Consoles: NES & Atari' : 'Consoles: NES & Atari'}</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Year Filter Dropdown */}
              <div className="relative shrink-0 w-full sm:w-auto">
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    haptics.light();
                    const val = e.target.value;
                    setSelectedYear(val === 'all' || val === '70s' || val === '80s' || val === '90s' ? val : Number(val));
                  }}
                  className="w-full sm:w-auto appearance-none pl-3 pr-8 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono font-bold text-neutral-200 focus:outline-none focus:border-cyan-500 cursor-pointer hover:border-neutral-700 transition-colors"
                >
                  <option value="all">🗓️ {lang === 'nl' ? 'Alle Jaren (1972-2011)' : 'All Years (1972-2011)'}</option>
                  <option value="70s">⚡ {lang === 'nl' ? 'Jaren 70 (1972-1979)' : '70s Era (1972-1979)'}</option>
                  <option value="80s">👾 {lang === 'nl' ? 'Jaren 80 (1980-1989)' : '80s Era (1980-1989)'}</option>
                  <option value="90s">🏰 {lang === 'nl' ? 'Jaren 90 & Verder (1991+)' : '90s & Beyond (1991+)'}</option>
                  <option value="1972">1972 • PONG (Atari Bushnell)</option>
                  <option value="1978">1978 • Space Invaders (Taito)</option>
                  <option value="1979">1979 • Asteroids (Vector DVG)</option>
                  <option value="1980">1980 • Pac-Man (Namco Iwatani)</option>
                  <option value="1981">1981 • 3D Monster Maze & Donkey Kong</option>
                  <option value="1982">1982 • Zaxxon, Frogger, Arcadians & Demon Attack</option>
                  <option value="1983">1983 • Mario Bros, Chuckie Egg & Manic Miner</option>
                  <option value="1984">1984 • Tetris, King's Quest & Frak!</option>
                  <option value="1985">1985 • Super Mario, Repton &amp; Eindeloos</option>
                  <option value="1986">1986 • OutRun (Sega Yu Suzuki) &amp; Space Quest I</option>
                  <option value="1987">1987 • Double Dragon (Technos Japan)</option>
                  <option value="1988">1988 • Exile (BBC Micro) &amp; Battle Chess</option>
                  <option value="1989">1989 • Game Boy DMG, Super Mario Land, Tetris &amp; C64 Pinball</option>
                  <option value="1990">1990 • Dr. Mario &amp; Prince of Persia</option>
                  <option value="1991">1991 • Lemmings &amp; Metroid II</option>
                  <option value="1992">1992 • Wolfenstein 3D, Kirby &amp; Mario Land 2</option>
                  <option value="1993">1993 • DOOM &amp; Zelda: Link's Awakening</option>
                  <option value="1994">1994 • Sony PlayStation 1 &amp; Donkey Kong '94</option>
                  <option value="1996">1996 • Pokémon Red &amp; Blue &amp; Duke Nukem 3D</option>
                  <option value="1997">1997 • Nokia Snake (Taneli Armanto)</option>
                  <option value="1998">1998 • Half-Life &amp; Wario Land II</option>
                  <option value="2003">2003 • Game Boy Advance SP (32-Bit)</option>
                  <option value="2011">2011 • Temple Run 3D (Mobile)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 min-w-[140px]">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'nl' ? 'Zoek spel of kast...' : 'Search game or cabinet...'}
                  className="w-full pl-8 pr-7 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-white placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Right: Reset Filter / Cabinet Counter */}
            <div className="relative z-10 flex items-center gap-2 shrink-0">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer border border-neutral-700 transition-all"
                  title={t.resetFilters}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">{t.resetFilters}</span>
                  <span className="px-1.5 py-0.2 rounded bg-neutral-950 text-cyan-400 text-[10px]">
                    {filteredGames.length}
                  </span>
                </button>
              ) : (
                <div className="hidden sm:flex items-center px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs font-mono text-neutral-400">
                  <span className="text-cyan-400 font-bold mr-1">{filteredGames.length}</span> {lang === 'nl' ? 'kasten' : 'cabs'}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* VIEW 1: 3D ARCADE FLOOR VIEW */}
        {activeView === 'floor' && (
          <ArcadeFloorView
            games={filteredGames}
            lang={lang}
            onLaunchGame={handleLaunchGameById}
            onOpenDossier={handleOpenDossierById}
            highScores={highScoresMap}
          />
        )}

        {/* VIEW 2: CHRONOLOGICAL TIMELINE VIEW (1978-1985) */}
        {activeView === 'timeline' && (
          <ArcadeTimelineView
            games={filteredGames}
            lang={lang}
            onLaunchGame={handleLaunchGameById}
            onOpenDossier={handleOpenDossierById}
            highScores={highScoresMap}
          />
        )}

        {/* VIEW 3: RICH INTERACTIVE CABINET CARDS SHOWCASE */}
        {activeView === 'cards' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <h3 className="text-lg font-black font-mono tracking-wider text-white">
                  {filteredGames.length} {lang === 'nl' ? 'ARCADE KASTEN BESCHIKBAAR' : 'ARCADE CABINETS AVAILABLE'}
                </h3>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                Free Play • Instant Web Emulation
              </span>
            </div>

            {filteredGames.length === 0 ? (
              <div className="rounded-3xl bg-neutral-900/80 border border-neutral-800 p-10 text-center space-y-4">
                <div className="text-4xl">🔍</div>
                <h4 className="text-xl font-bold font-mono text-white">
                  {lang === 'nl' ? 'Geen arcade kasten gevonden' : 'No arcade cabinets found'}
                </h4>
                <p className="text-sm text-neutral-400 font-mono max-w-md mx-auto">
                  {lang === 'nl'
                    ? 'Er zijn geen kasten die voldoen aan de geselecteerde filters of zoekterm. Reset de filters om alle kasten te bekijken.'
                    : 'No cabinets match the selected filters or search query. Reset filters to view all cabinets.'}
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-mono font-bold text-xs cursor-pointer shadow-md"
                >
                  {t.resetFilters}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* GAME 11: TETRIS (1984) - ALEXEY PAJITNOV / ELEKTRONIKA 60 */}
            {filteredGameIds.has('tetris') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-red-500/80 shadow-[0_0_35px_rgba(239,68,68,0.25)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(239,68,68,0.45)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-red-500 to-amber-400 text-black shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                      🧱 NIEUW: GAME 11
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-red-300 border border-neutral-700">
                      ELEKTRONIKA 60 &amp; PAJITNOV • 1984
                    </span>
                  </div>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    RECORD: {tetrisTopScore.toLocaleString()} ({tetrisTopInitials})
                  </span>
                </div>

                {/* Title & Preview Graphic */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-2">
                        <span>TETRIS</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                          FALLING BLOCK PUZZLE
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        Alexey Pajitnov • De tijdloze verslaving • 7 Neon Tetrominoes
                      </p>
                    </div>
                  </div>

                  {/* Retro Tetris Simulation Visual */}
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-red-500/40 bg-neutral-950 p-2 font-mono flex flex-col justify-between group-hover:border-red-400 transition-colors select-none">
                    {/* Top HUD */}
                    <div className="flex justify-between items-center bg-neutral-900/80 rounded px-2 py-1 text-[11px] border border-neutral-800">
                      <span className="text-cyan-300 font-bold">SCORE: 125000</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <span>LIJNEN:</span>
                        <span>042</span>
                      </span>
                      <span className="text-red-400 font-bold">LEVEL: 09 ⚡</span>
                    </div>

                    {/* Matrix Simulation */}
                    <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden py-1">
                      {/* Active Falling Cyan Line Piece */}
                      <div className="flex items-center gap-1 text-cyan-400 font-black text-xs animate-bounce mb-1">
                        <span>■ ■ ■ ■</span>
                        <span className="text-[10px] text-neutral-400 font-mono">I-PIECE</span>
                      </div>

                      {/* Stacked Row Representation */}
                      <div className="flex flex-col gap-1 w-full max-w-[240px] px-2 text-center text-[10px] font-mono">
                        <div className="flex justify-between text-purple-400">
                          <span>■ ■ ■</span>
                          <span className="text-yellow-300">■ ■</span>
                          <span>■ ■ ■</span>
                        </div>
                        <div className="h-0.5 bg-neutral-700 w-full" />
                        <div className="flex justify-between text-amber-400">
                          <span className="text-red-400">■ ■</span>
                          <span className="text-emerald-400">■ ■</span>
                          <span className="text-blue-400">■ ■ ■</span>
                        </div>
                      </div>

                      {/* Flash Banner */}
                      <div className="mt-1">
                        <span className="text-yellow-300 font-black px-2 py-0.5 bg-red-950/80 border border-amber-500 rounded text-[9px] animate-pulse">
                          💥 TETRIS! 4 RIJEN (+1200 PTS)
                        </span>
                      </div>
                    </div>

                    {/* Bottom Floor */}
                    <div className="bg-neutral-900/90 rounded px-2 py-1 flex justify-between items-center text-[10px] text-neutral-400 border border-neutral-800">
                      <span className="text-cyan-400 font-bold">7-BAG RANDOMIZER</span>
                      <span className="text-amber-400 font-bold">KOROBEINIKI 8-BIT THEME</span>
                    </div>
                  </div>

                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                    Stapel de <strong>7 iconische neon tetrominoes</strong>, draai en drop met superprecieze <strong>SRS wall kicks</strong>, overleef de steeds snellere zwaartekracht en wis 4 rijen tegelijk voor de ultieme <strong>Tetris</strong> onder begeleiding van de authentieke 8-bit synthesizer soundtrack!
                  </p>
                </div>

                {/* Feature highlights */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-cyan-300 border border-neutral-700 flex items-center gap-1">
                    <span>🧱 7 Tetrominoes</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-amber-300 border border-neutral-700 flex items-center gap-1">
                    <span>🎵 Korobeiniki Audio</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-rose-300 border border-neutral-700 flex items-center gap-1">
                    <span>👻 Ghost &amp; Hard Drop</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-emerald-300 border border-neutral-700 flex items-center gap-1">
                    <span>📱 Swipe &amp; Gyro Controls</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsTetrisHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-red-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchTetris}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 hover:from-red-500 hover:via-amber-400 hover:to-yellow-300 text-black text-xs font-black tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>START TETRIS!</span>
                </button>
              </div>
            </div>
            )}

            {/* GAME 10: ARCADIANS (1982) - ACORNSOFT / BBC MICRO */}
            {filteredGameIds.has('arcadians') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-cyan-500/80 shadow-[0_0_35px_rgba(6,182,212,0.25)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(6,182,212,0.45)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-cyan-400 text-black shadow-[0_0_12px_rgba(6,182,212,0.5)]">
                      🚀 NIEUW: GAME 10
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-cyan-300 border border-neutral-700">
                      BBC MICRO &amp; ACORNSOFT • 1982
                    </span>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    RECORD: {arcadiansTopScore.toLocaleString()} ({arcadiansTopInitials})
                  </span>
                </div>

                {/* Title & Preview Graphic */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-2">
                        <span>ARCADIANS</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          60 FPS SPACE SHOOTER
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        Nick Pelling • 46-Aliens Formatie • Bezier Swoops • Alle Levels
                      </p>
                    </div>
                  </div>

                  {/* Retro Arcadians Space Simulation Visual */}
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-cyan-500/40 bg-neutral-950 p-2 font-mono flex flex-col justify-between group-hover:border-cyan-400 transition-colors select-none">
                    {/* Top HUD */}
                    <div className="flex justify-between items-center bg-neutral-900/80 rounded px-2 py-1 text-[11px] border border-neutral-800">
                      <span className="text-rose-400 font-bold">1UP 032450</span>
                      <span className="text-cyan-300 font-bold flex items-center gap-1">
                        <span>WAVE: 05</span>
                        <span className="text-yellow-400">★★★★★</span>
                      </span>
                      <span className="text-white font-bold">SCHIP: 🚀 🚀 🚀</span>
                    </div>

                    {/* Middle Starfield & Formation Simulation */}
                    <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden py-1">
                      {/* Flagships */}
                      <div className="flex items-center gap-6 text-xs animate-pulse">
                        <span className="text-yellow-400 font-black">👑 FLAGSHIP</span>
                        <span className="text-yellow-400 font-black">👑 FLAGSHIP</span>
                      </div>
                      {/* Hornets & Emissaries */}
                      <div className="flex items-center gap-3 text-[10px] text-rose-400 font-bold mt-1">
                        <span>👾 👾 👾 👾 👾 👾</span>
                      </div>
                      {/* Diving Escort Combo */}
                      <div className="flex items-center justify-between w-full px-4 text-[10px] mt-1">
                        <span className="text-rose-400 rotate-45">↘️ HORNET</span>
                        <span className="text-yellow-300 font-black px-1.5 py-0.5 bg-yellow-950/80 border border-yellow-500 rounded text-[9px] animate-bounce">
                          +800 PTS COMBO!
                        </span>
                        <span className="text-rose-400 -rotate-45">↙️ HORNET</span>
                      </div>
                      {/* Player laser beam */}
                      <div className="flex items-center justify-center mt-1">
                        <div className="h-4 w-1 bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,1)]" />
                      </div>
                    </div>

                    {/* Bottom Floor */}
                    <div className="bg-neutral-900/90 rounded px-2 py-1 flex justify-between items-center text-[10px] text-neutral-400 border border-neutral-800">
                      <span className="text-cyan-400 font-bold">🚀 BBC MICRO DEFENDER</span>
                      <span className="text-yellow-400 font-bold">60 FPS MODE 2 ASSEMBLY</span>
                    </div>
                  </div>

                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                    Vlieg met razendsnelle <strong>60 FPS snelheid</strong> door <strong>alle wave-levels in 1 keer</strong>! Wiek en duik door de ademende formatie van 46 buitenaardse schepen, ontwijk de gevaarlijke Bezier-duikvluchten en schiet de gele Flagship neer met twee Red Hornet escorts voor de legendarische <strong>800-punten bonus</strong>!
                  </p>
                </div>

                {/* Feature highlights */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-cyan-300 border border-neutral-700 flex items-center gap-1">
                    <span>⚡ 60 FPS BBC Snelheid</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-yellow-300 border border-neutral-700 flex items-center gap-1">
                    <span>👑 46-Aliens Formatie</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-rose-300 border border-neutral-700 flex items-center gap-1">
                    <span>⭐ 800 Pts Escort Bonus</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-emerald-300 border border-neutral-700 flex items-center gap-1">
                    <span>🌊 Alle Waves 1 t/m 20+</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsArcadiansHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchArcadians}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-yellow-400 hover:from-cyan-400 hover:to-yellow-300 text-black text-xs font-black tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>START ARCADIANS!</span>
                </button>
              </div>
            </div>
            )}

            {/* GAME 9: FRAK! (1984) - AARDVARK SOFTWARE / BBC MICRO */}
            {filteredGameIds.has('frak') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-rose-500/80 shadow-[0_0_35px_rgba(239,68,68,0.25)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(239,68,68,0.45)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-500 text-black shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                      🪓 NIEUW: GAME 9
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-rose-300 border border-neutral-700">
                      BBC MICRO &amp; AARDVARK • 1984
                    </span>
                  </div>
                  <span className="text-xs font-mono text-rose-400 font-bold">
                    RECORD: {frakTopScore.toLocaleString()} ({frakTopInitials})
                  </span>
                </div>

                {/* Title & Preview Graphic */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-2">
                        <span>FRAK!</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                          BBC MICRO PLATFORMER
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        Nick Pelling &amp; Holbewoner Troggs Yo-Yo doolhof
                      </p>
                    </div>
                  </div>

                  {/* Retro F-R-A-K Maze Simulation Visual */}
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-rose-500/40 bg-neutral-950 p-2 font-mono flex flex-col justify-between group-hover:border-rose-400 transition-colors select-none">
                    {/* Top HUD */}
                    <div className="flex justify-between items-center bg-neutral-900/80 rounded px-2 py-1 text-[11px] border border-neutral-800">
                      <span className="text-cyan-300 font-bold">SCORE: 024850</span>
                      <span className="text-yellow-400 font-bold flex items-center gap-1">
                        <span>SLEUTELS:</span>
                        <span>🗝️🗝️🗝️</span>
                      </span>
                      <span className="text-rose-400 font-bold">LEVEN: 🪓 🪓 🪓</span>
                    </div>

                    {/* Middle F - R - A - K Platforms */}
                    <div className="space-y-1.5 py-1 px-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-yellow-300">🗝️ Gouden Sleutel</span>
                        <span className="text-emerald-400">🪜 [LADDER]</span>
                        <span className="text-cyan-300">〰️ [TOUW]</span>
                        <span className="text-yellow-300">🗝️ Gouden Sleutel</span>
                      </div>
                      <div className="h-1.5 bg-rose-500 rounded shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <span>🏃 Trogg</span>
                          <span className="text-rose-400 text-xs animate-bounce">🪀 Yo-Yo!</span>
                        </span>
                        <span className="text-white px-1.5 py-0.5 bg-rose-950/80 border border-rose-600 text-[9px] rounded font-black">
                          "FRAK!"
                        </span>
                        <span className="text-purple-300">🧹 Scrubbly &amp; Poglet</span>
                      </div>
                      <div className="h-1.5 bg-rose-500 rounded shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    </div>

                    {/* Bottom Floor */}
                    <div className="bg-neutral-900/90 rounded px-2 py-1 flex justify-between items-center text-[10px] text-neutral-400 border border-neutral-800">
                      <span className="text-emerald-400">🚪 Uitgangsdeur Open</span>
                      <span className="text-yellow-400">F-R-A-K Letterdoolhof</span>
                    </div>
                  </div>

                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                    Klim, spring en gooi je <strong>Yo-Yo</strong> als holbewoner Trogg door dodelijke doolhoven. Pas op voor de dodelijke valhoogte, ontwijk <strong>Scrubbly</strong>, <strong>Poglet</strong> en <strong>Hooter</strong>, pak 3 gouden sleutels en beleef de befaamde <strong>"FRAK!"</strong> schreeuw!
                  </p>
                </div>

                {/* Feature highlights */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-rose-300 border border-neutral-700 flex items-center gap-1">
                    <span>🪓 Trogg the Caveman</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-amber-300 border border-neutral-700 flex items-center gap-1">
                    <span>🪀 Roterende Yo-Yo</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-yellow-300 border border-neutral-700 flex items-center gap-1">
                    <span>🗝️ 3 Gouden Sleutels</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-cyan-300 border border-neutral-700 flex items-center gap-1">
                    <span>🙃 180° Flip Bonusloop</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFrakHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-rose-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchFrak}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-yellow-500 hover:from-rose-500 hover:to-yellow-400 text-black text-xs font-black tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>START FRAK!</span>
                </button>
              </div>
            </div>
            )}

            {/* GAME 8: CHUCKIE EGG (1983) - A&F SOFTWARE / BBC MICRO */}
            {filteredGameIds.has('chuckie_egg') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-yellow-500/80 shadow-[0_0_35px_rgba(234,179,8,0.25)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(234,179,8,0.45)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-yellow-400 text-black shadow-[0_0_12px_rgba(234,179,8,0.5)]">
                      🥚 NIEUW: GAME 8
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-yellow-300 border border-neutral-700">
                      BBC MICRO &amp; A&amp;F SOFTWARE • 1983
                    </span>
                  </div>
                  <span className="text-xs font-mono text-yellow-400 font-bold">
                    RECORD: {chuckieTopScore.toLocaleString()} ({chuckieTopInitials})
                  </span>
                </div>

                {/* Title & Preview Graphic */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-2">
                        <span>CHUCKIE EGG</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-800">
                          BBC MICRO PLATFORMER
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        Nigel Alderton &amp; Hen-House Harry's gouden eieren jacht
                      </p>
                    </div>
                  </div>

                  {/* Retro Barn Simulation Visual */}
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-yellow-500/40 bg-neutral-950 p-2 font-mono flex flex-col justify-between group-hover:border-yellow-400 transition-colors select-none">
                    {/* Top Roof / Cage */}
                    <div className="flex justify-between items-center bg-neutral-900/80 rounded px-2 py-1 text-[11px] border border-neutral-800">
                      <span className="text-cyan-300 font-bold">1UP: 014200</span>
                      <span className="text-rose-400 font-bold animate-pulse">BONUS: 0850</span>
                      <span className="text-yellow-400 font-bold">KOOI: 🦅 [REUZENEEND]</span>
                    </div>

                    {/* Middle Catwalks */}
                    <div className="space-y-2 py-1 px-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-yellow-300">🥚 Gouden Ei</span>
                        <span className="text-emerald-400">🪜 [LADDER]</span>
                        <span className="text-amber-400">🛗 [GRAANLIFT]</span>
                        <span className="text-yellow-300">🥚 Gouden Ei</span>
                      </div>
                      <div className="h-1.5 bg-cyan-500 rounded shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-rose-400 font-bold">👨‍🌾 Harry</span>
                        <span className="text-yellow-400">🦆 Patrouille-eend</span>
                        <span className="text-yellow-300">🥚 Gouden Ei</span>
                      </div>
                      <div className="h-1.5 bg-cyan-500 rounded shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                    </div>

                    {/* Bottom Barn Floor */}
                    <div className="bg-neutral-900/90 rounded px-2 py-1 flex justify-between items-center text-[10px] text-neutral-400 border border-neutral-800">
                      <span className="text-emerald-400">🌾 Graankorrels (+Tijd)</span>
                      <span className="text-yellow-400">12 Eieren Per Schuur</span>
                    </div>
                  </div>

                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                    Klim als boer <strong>Hen-House Harry</strong> langs steile ladders en zwevende liften. Verzamel alle 12 gouden eieren per schuur, eet graan voor extra bonustijd en blijf de uitgebroken <strong>Reuzeneend</strong> voor!
                  </p>
                </div>

                {/* Feature highlights */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-yellow-300 border border-neutral-700 flex items-center gap-1">
                    <span>🥚 12 Gouden Eieren</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-cyan-300 border border-neutral-700 flex items-center gap-1">
                    <span>🛗 Bewegende Liften</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-emerald-300 border border-neutral-700 flex items-center gap-1">
                    <span>🪜 Vloeiend Klimmen</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-rose-300 border border-neutral-700 flex items-center gap-1">
                    <span>🦅 Reuzeneend Alarm</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsChuckieEggHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-yellow-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchChuckieEgg}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black text-xs font-black tracking-wider shadow-[0_0_20px_rgba(234,179,8,0.5)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>START CHUCKIE EGG</span>
                </button>
              </div>
            </div>
            )}

            {/* GAME 7: FROGGER (1982) - PARKER BROTHERS / KONAMI / ATARI 2600 */}
            {filteredGameIds.has('frogger') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-emerald-500/80 shadow-[0_0_35px_rgba(16,185,129,0.25)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(16,185,129,0.45)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-400 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                      🐸 NIEUW: GAME 7
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-emerald-300 border border-neutral-700">
                      PARKER BROTHERS & ATARI 2600 • 1982
                    </span>
                  </div>
                  <span className="text-xs font-mono text-yellow-400 font-bold">
                    RECORD: {froggerTopScore.toLocaleString()} ({froggerTopInitials})
                  </span>
                </div>

                {/* Title & Preview Graphic */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-2">
                        <span>FROGGER</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          ATARI & ARCADE
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        De iconische Konami & Ed English Atari 2600 klassieker
                      </p>
                    </div>
                  </div>

                  {/* Retro lane simulation visual banner */}
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-emerald-500/40 bg-neutral-950 p-2 font-mono flex flex-col justify-between group-hover:border-emerald-400 transition-colors select-none">
                    {/* River preview */}
                    <div className="bg-blue-950/80 rounded p-1.5 border border-blue-800/60 text-[10px] space-y-1">
                      <div className="flex justify-between items-center text-emerald-400 font-bold">
                        <span>🏠 [LELIE]</span>
                        <span>[LELIE]</span>
                        <span>🏠 [LELIE]</span>
                        <span>[LELIE]</span>
                        <span>🏠 [LELIE]</span>
                      </div>
                      <div className="flex justify-around text-amber-500 text-[10px]">
                        <span>🪵🪵🪵 Houtstam</span>
                        <span>🐢🐢 Duikende Schildpadden</span>
                        <span>🪵🪵</span>
                      </div>
                    </div>

                    {/* Middle grass */}
                    <div className="bg-purple-950/70 border-y border-purple-800/80 text-purple-300 text-[10px] text-center py-0.5">
                      🌿 VEILIGE MIDDENBERM 🌿
                    </div>

                    {/* Highway preview */}
                    <div className="bg-neutral-900/90 rounded p-1.5 border border-neutral-700 text-[10px] space-y-1">
                      <div className="flex justify-around text-rose-400">
                        <span>🚗 Snelle Raceauto</span>
                        <span>🚚 Bulldozer</span>
                        <span>🚛 Vrachtwagen</span>
                      </div>
                      <div className="flex justify-center items-center gap-2 text-emerald-300 font-bold text-xs">
                        <span>🐸 KIKKER STARTPUNT</span>
                      </div>
                    </div>
                    
                    {/* Badge over preview */}
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-mono bg-black/85 backdrop-blur-sm px-3 py-1 rounded-lg border border-neutral-700">
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <span>5 Thuishavens</span>
                        <span>•</span>
                        <span>Bonus Vlieg 🪰</span>
                      </span>
                      <span className="text-amber-400 font-bold">
                        Atari 2600 Schakelaar
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-300 leading-relaxed">
                    Help je kikker veilig de gevaarlijke 5-baans snelweg vol raceauto's over te steken en navigeer over de wilde rivier via boomstammen en duikende schildpadden naar de 5 leliebladen.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="relative z-10 p-6 sm:p-7 pt-0 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleLaunchFrogger}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-black font-mono font-black text-sm tracking-wider shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <Play className="w-4 h-4 fill-black" />
                  SPEEL FROGGER (ATARI)
                </button>
                <button
                  type="button"
                  onClick={() => setIsFroggerHistoryOpen(true)}
                  className="p-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition border border-neutral-700 cursor-pointer"
                  title="Historie & Atari 2600 Dossier"
                >
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>
            )}

            {/* GAME 6: EINDELOOS (1985) - RADARSOFT / COMMODORE 64 */}
            {filteredGameIds.has('eindeloos') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-blue-500/80 shadow-[0_0_35px_rgba(59,130,246,0.25)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(59,130,246,0.45)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]">
                      🚁 NIEUW: GAME 6
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-cyan-300 border border-neutral-700">
                      RADARSOFT • COMMODORE 64 1985
                    </span>
                  </div>
                  <span className="text-xs font-mono text-yellow-400 font-bold">
                    RECORD: {eindeloosTopScore.toLocaleString()} ({eindeloosTopInitials})
                  </span>
                </div>

                {/* Title & Preview Graphic */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-2">
                        <span>EINDELOOS</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-blue-800">
                          100% KAART
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        De legendarische Nederlandse C64 klassieker van John Vanderaart
                      </p>
                    </div>
                  </div>

                  {/* Labyrinth map visual preview */}
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-blue-500/40 bg-black flex items-center justify-center group-hover:border-cyan-400 transition-colors">
                    <img
                      src="/games/eindeloos/map.png"
                      alt="Eindeloos Labyrint Kaart"
                      className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    
                    {/* Badge over preview */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-neutral-700">
                      <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                        <span>🚁 14 Helikopters</span>
                        <span>•</span>
                        <span>[!] Checkpoints</span>
                      </span>
                      <span className="text-pink-400 font-bold">
                        ❤️ Klopped Hart Doel
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-300 leading-relaxed">
                    Vlieg met je helikopter door een gigantisch doolhof van <strong>1024 × 512 karakters</strong> (~500 schermen). Ontwijk knipperende doodshoofden, activeer [!] checkpoints en vernietig het buitenaardse kloppende hart!
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="relative z-10 p-6 sm:p-7 pt-0 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleLaunchEindeloos}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-mono font-bold text-sm tracking-wider shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <Play className="w-4 h-4 fill-white" />
                  SPEEL EINDELOOS
                </button>
                <button
                  type="button"
                  onClick={() => setIsEindeloosHistoryOpen(true)}
                  className="p-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition border border-neutral-700 cursor-pointer"
                  title="Historie & Kaart Geheimen"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
            )}

            {/* GAME: OUTRUN (1986) - SEGA SUPER-SCALER / YU SUZUKI */}
            {filteredGameIds.has('outrun') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-red-500/80 shadow-[0_0_35px_rgba(239,68,68,0.25)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(239,68,68,0.45)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                      🏎️ SEGA ARCADE: 1986
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                      SUPER-SCALER 3D • YU SUZUKI
                    </span>
                  </div>
                  <span className="text-xs font-mono text-yellow-400 font-bold">
                    RECORD: {outrunTopScore.toLocaleString()} ({outrunTopInitials})
                  </span>
                </div>

                {/* Title & Preview Graphic */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-2">
                        <span>OUTRUN</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                          SEGA COIN-OP
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono">
                        Door Yu Suzuki • Rode Testarossa Spider • 5 Eindstations A-E
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(239,68,68,0.4)] group-hover:scale-110 transition-transform">
                      🏎️
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    De ultieme arcade race-legende van Sega! Race met 293 km/u over heuvels en bochten met de iconische rode cabriolet, kies je soundtrack (Magical Sound Shower, Passing Breeze of Splash Wave) en splits je route bij elke vork.
                  </p>
                </div>

                {/* OutRun Features Showcase */}
                <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="p-2 rounded-xl bg-red-950/40 border border-red-800/40">
                    <span className="text-[10px] text-red-400 font-bold block">RADIO CASSETTE</span>
                    <span className="text-xs text-white font-bold">3 Soundtracks</span>
                  </div>
                  <div className="p-2 rounded-xl bg-yellow-950/40 border border-yellow-800/40">
                    <span className="text-[10px] text-yellow-400 font-bold block">ROUTE VORK</span>
                    <span className="text-xs text-yellow-300 font-bold">5 Doelbestemmingen</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
                    <span className="text-[10px] text-emerald-400 font-bold block">CONTROLLER</span>
                    <span className="text-xs text-emerald-300 font-bold">Xbox / Triggers</span>
                  </div>
                </div>

                {/* Feature & Control badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <Gamepad2 className="w-3 h-3 text-emerald-400" />
                    <span>Xbox RT Gas / LT Rem</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span>60 FPS Pseudo-3D</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <Tv className="w-3 h-3 text-red-400" />
                    <span>Sega PCM &amp; Synth</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsOutrunHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-red-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchOutrun}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 hover:from-red-500 hover:to-rose-400 text-white text-xs font-black tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.6)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>START OUTRUN (SEGA 1986)</span>
                </button>
              </div>
            </div>
            )}

            {/* GAME 4: REPTON (1985) - BBC MICRO / SUPERIOR SOFTWARE */}
            {filteredGameIds.has('repton') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-emerald-500/80 shadow-[0_0_35px_rgba(16,185,129,0.25)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(16,185,129,0.45)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                      🦎 GAME 4: BBC MICRO
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                      SUPERIOR SOFTWARE • 1985
                    </span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    HI: {reptonTopScore.toLocaleString()} ({reptonTopInitials})
                  </span>
                </div>

                {/* Title & Preview Graphic */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-2">
                        <span>REPTON</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          12 LEVELS & CODES
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono">
                        Door Tim Tyler • BBC Micro Model B / Acorn Electron
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-transform">
                      🦎
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Dé legendarische BBC Micro puzzel-actiehit! Graaf aarde weg, duw zware rotsblokken, ontwijk vallende keien, breek eieren, verpletter monsters tot fonkelende diamanten en vind de gouden sleutels om alle kluizen te openen.
                  </p>
                </div>

                {/* Game Badges */}
                <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>12 Authentieke Levels (A-L)</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <Key className="w-3 h-3 text-yellow-400" />
                    <span>Alle 12 Originele Passwords</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-purple-400" />
                    <span>iPhone Tilt & Touch D-Pad</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <Tv className="w-3 h-3 text-cyan-400" />
                    <span>SN76489 Sound Synthesis</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsReptonHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Info className="w-4 h-4 text-emerald-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchRepton}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.6)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>START REPTON (BBC MICRO)</span>
                </button>
              </div>
            </div>
            )}

            {/* GAME 2: SPACE INVADERS (1978) */}
            {filteredGameIds.has('space_invaders') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-emerald-500/80 shadow-[0_0_35px_rgba(16,185,129,0.2)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(16,185,129,0.35)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                      🟢 NIEUW: GAME 2
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                      1978 • Taito
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                    <span>HI-SCORE:</span>
                    <span className="text-emerald-400 font-bold">{spaceTopScore.toLocaleString()}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-tight flex items-center gap-2.5">
                    <span>SPACE INVADERS</span>
                    <span className="text-2xl">👾</span>
                  </h4>
                  <p className="text-neutral-300 text-xs sm:text-sm mt-2 leading-relaxed">
                    Vernietig 5 rijen dalende aliens voordat ze de aarde bereiken! Met afbrokkelende verdedigingsbunkers, de geheime Mystery UFO en de legendarische versnellende 4-tonige hartslag-soundtrack.
                  </p>
                </div>

                {/* Alien Armada Points Showcase */}
                <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-center text-xs font-mono">
                    <div className="p-1.5 rounded-lg bg-red-950/60 border border-red-800/80">
                      <div className="text-base">🐙</div>
                      <div className="text-[10px] text-red-300 font-bold">30 PTS</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/80">
                      <div className="text-base">🦀</div>
                      <div className="text-[10px] text-cyan-300 font-bold">20 PTS</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-yellow-950/60 border border-yellow-800/80">
                      <div className="text-base">👾</div>
                      <div className="text-[10px] text-yellow-300 font-bold">10 PTS</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-purple-950/60 border border-purple-800/80">
                      <div className="text-base">🛸</div>
                      <div className="text-[10px] text-purple-300 font-bold">300 PTS</div>
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400 flex flex-col items-end">
                    <span className="font-bold flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" /> 4 Bunkers
                    </span>
                    <span className="text-neutral-400 text-[10px]">Erodeerbaar</span>
                  </div>
                </div>

                {/* Control badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-purple-400" />
                    <span>iPhone Gyro Tilt</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <Crosshair className="w-3 h-3 text-emerald-400" />
                    <span>Touch Drag & Tap</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span>Cellofaan CRT</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSpaceHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Info className="w-4 h-4 text-emerald-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchSpaceInvaders}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>START SPACE INVADERS</span>
                </button>
              </div>
            </div>
            )}

            {/* GAME 1: PAC-MAN (1980) */}
            {filteredGameIds.has('pacman') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-yellow-400/80 shadow-[0_0_35px_rgba(250,204,21,0.2)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(250,204,21,0.35)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#2121DE_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-yellow-400 text-black shadow-[0_0_12px_rgba(250,204,21,0.5)]">
                      🟡 GAME 1
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 font-mono">
                      1980 • Namco
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                    <span>HI-SCORE:</span>
                    <span className="text-yellow-400 font-bold">{pacmanTopScore.toLocaleString()}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="text-2xl sm:text-3xl font-black font-mono text-yellow-400 tracking-tight flex items-center gap-2.5">
                    <span>PAC-MAN</span>
                    <span className="text-2xl">ᗧ • • •</span>
                  </h4>
                  <p className="text-neutral-300 text-xs sm:text-sm mt-2 leading-relaxed">
                    Eet alle 240 stippen in het iconische blauwe doolhof, pak de 4 flitsende krachtpillen en draai de rollen om tegen Blinky, Pinky, Inky en Clyde met hun originele Japanse AI.
                  </p>
                </div>

                {/* Ghost Showcase */}
                <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-1 rounded-lg bg-red-950/70 border border-red-800 text-red-300 text-[11px] font-bold">
                      🔴 Blinky
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-pink-950/70 border border-pink-800 text-pink-300 text-[11px] font-bold">
                      🌸 Pinky
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-[11px] font-bold">
                      🔷 Inky
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-orange-950/70 border border-orange-800 text-orange-300 text-[11px] font-bold">
                      🟠 Clyde
                    </span>
                  </div>
                  <span className="text-xs font-mono text-yellow-300 font-bold">🍒 100 PTS</span>
                </div>

                {/* Control badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-purple-400" />
                    <span>iPhone Gyro Tilt</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <Compass className="w-3 h-3 text-pink-400" />
                    <span>Touch Swiping & D-Pad</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-red-400" />
                    <span>Speed / Ghost Tuning</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPacmanHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Info className="w-4 h-4 text-yellow-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchPacman}
                  className="flex-1 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black tracking-wider shadow-[0_0_20px_rgba(250,204,21,0.5)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>START PAC-MAN</span>
                </button>
              </div>
            </div>
            )}

            {/* GAME 3: DEMON ATTACK (1982) */}
            {filteredGameIds.has('demon_attack') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-rose-500/80 shadow-[0_0_35px_rgba(244,63,94,0.2)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(244,63,94,0.35)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-500 text-black shadow-[0_0_12px_rgba(244,63,94,0.5)]">
                      🔥 GAME 3
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">
                      1982 • Imagic / Atari 2600
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
                    <Trophy className="w-3.5 h-3.5 text-rose-400" />
                    <span>HI-SCORE:</span>
                    <span className="text-rose-400 font-bold">{demonTopScore.toLocaleString()}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="text-2xl sm:text-3xl font-black font-mono text-rose-400 tracking-tight flex items-center gap-2.5">
                    <span>DEMON ATTACK</span>
                    <span className="text-xl">🦅 ⚡</span>
                  </h4>
                  <p className="text-neutral-300 text-xs sm:text-sm mt-2 leading-relaxed">
                    De legendarische Atari-shooter! Golven van kosmische demonen vliegen in bochten van links en rechts over Krydos. Vanaf Wave 5 splitsen ze in twee snelle duikwezens!
                  </p>
                </div>

                {/* Enemy Types Showcase */}
                <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-1 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-[11px] font-bold">
                      🔴 Crimson Demon
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-yellow-950/70 border border-yellow-800 text-yellow-300 text-[11px] font-bold">
                      🟡 Gold Demon
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-purple-950/70 border border-purple-800 text-purple-300 text-[11px] font-bold">
                      🟣 De Splitsers!
                    </span>
                  </div>
                  <span className="text-xs font-mono text-rose-300 font-bold">WAVE 1-7+</span>
                </div>

                {/* Control badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-rose-400" />
                    <span>iPhone Gyro Tilt</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span>Splitsende Demonen</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    <span>Reserve Bunkers</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDemonHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Info className="w-4 h-4 text-rose-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchDemonAttack}
                  className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-black text-xs font-black tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.6)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>START DEMON ATTACK</span>
                </button>
              </div>
            </div>
            )}

            {/* GAME 12: KING'S QUEST I: QUEST FOR THE CROWN (1984) - ROBERTA WILLIAMS / SIERRA */}
            {filteredGameIds.has('kings_quest') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-amber-500/80 shadow-[0_0_35px_rgba(245,158,11,0.25)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(245,158,11,0.45)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                      👑 SIERRA ADVENTURE
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-amber-300 border border-neutral-700">
                      IBM PC / PCjr &amp; TANDY • 1984
                    </span>
                  </div>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    RECORD: {kingsQuestTopScore}/158 ({kingsQuestTopInitials})
                  </span>
                </div>

                {/* Title & Preview Graphic */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-2">
                        <span>KING'S QUEST I</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          QUEST FOR THE CROWN
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        Roberta Williams • 16-Kleuren AGI Engine • Tekstparser &amp; Daventry Koninkrijk
                      </p>
                    </div>
                  </div>

                  {/* Retro Daventry Simulation Visual */}
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-amber-500/40 bg-neutral-950 p-2 font-mono flex flex-col justify-between group-hover:border-amber-400 transition-colors select-none">
                    {/* Top HUD */}
                    <div className="flex justify-between items-center bg-[#0000AA] text-white rounded px-2.5 py-1 text-[11px] font-mono shadow-sm">
                      <span className="font-bold text-yellow-300">Score: {kingsQuestTopScore} of 158</span>
                      <span className="font-bold text-white tracking-widest">KINGDOM OF DAVENTRY</span>
                      <span className="text-cyan-300 font-bold">Sound: On</span>
                    </div>

                    {/* Daventry Room Simulation */}
                    <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden py-1">
                      <div className="text-center space-y-1">
                        <div className="text-2xl">🏰 🌳 🚶‍♂️ 🪓 🐉</div>
                        <div className="text-xs font-mono text-amber-300 font-bold">
                          Sir Graham voor het Kasteel van Koning Edward
                        </div>
                        <div className="text-[10px] font-mono text-neutral-400">
                          Vind het Magische Schild, de Toverspiegel en de Onuitputtelijke Kist
                        </div>
                      </div>
                    </div>

                    {/* Bottom Command Prompt */}
                    <div className="bg-black text-white font-mono rounded px-2.5 py-1 flex items-center gap-2 text-[11px] border border-neutral-800">
                      <span className="text-white font-bold">&gt;</span>
                      <span className="text-white font-bold">look at castle</span>
                      <span className="inline-block w-2 h-3.5 bg-white animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <span>🗺️</span>
                    <span>15 Kamers Daventry</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <span>⌨️</span>
                    <span>Originele Tekstparser</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <span>💾</span>
                    <span>Save &amp; Restore</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <span>👑</span>
                    <span>158 Max Punten</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsKingsQuestHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchKingsQuest}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black text-xs font-black tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.6)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>SPEEL KING'S QUEST I</span>
                </button>
              </div>
            </div>
            )}

            {/* GAME 13: SPACE QUEST: CHAPTER I - THE SARIEN ENCOUNTER (1986) */}
            {filteredGameIds.has('space_quest') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-purple-500/80 shadow-[0_0_35px_rgba(168,85,247,0.25)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(168,85,247,0.45)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-purple-500 via-fuchsia-400 to-pink-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]">
                      🚀 SIERRA SCI-FI ADVENTURE
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-purple-300 border border-neutral-700">
                      IBM PC &amp; TANDY • 1986
                    </span>
                  </div>
                  <span className="text-xs font-mono text-purple-400 font-bold">
                    RECORD: 220/220 (RGW)
                  </span>
                </div>

                {/* Title & Preview Graphic */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-2">
                        <span>SPACE QUEST: CH. I</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                          THE SARIEN ENCOUNTER
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        Two Guys from Andromeda • Roger Wilco de Ruimteconciërge • Star Generator
                      </p>
                    </div>
                  </div>

                  {/* Retro Space Quest Simulation Visual */}
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-purple-500/40 bg-neutral-950 p-2 font-mono flex flex-col justify-between group-hover:border-purple-400 transition-colors select-none">
                    {/* Top HUD */}
                    <div className="flex justify-between items-center bg-[#550055] text-white rounded px-2.5 py-1 text-[11px] font-mono shadow-sm">
                      <span className="font-bold text-yellow-300">Score: 005 of 220</span>
                      <span className="font-bold text-pink-300 tracking-widest">STARSHIP ARCADA</span>
                      <span className="text-cyan-300 font-bold">Sound: On</span>
                    </div>

                    {/* Arcada Room Simulation */}
                    <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden py-1">
                      <div className="text-center space-y-1">
                        <div className="text-2xl">🛸 🧹 👨‍🚀 🚨 💥</div>
                        <div className="text-xs font-mono text-purple-300 font-bold">
                          Roger Wilco ontwaakt in de bezemkast van het ruimteschip Arcada
                        </div>
                        <div className="text-[10px] font-mono text-neutral-400">
                          De Sariens hebben de bemanning overvallen! Vind een ontsnappingscapsule!
                        </div>
                      </div>
                    </div>

                    {/* Bottom Command Prompt */}
                    <div className="bg-black text-white font-mono rounded px-2.5 py-1 flex items-center gap-2 text-[11px] border border-neutral-800">
                      <span className="text-white font-bold">&gt;</span>
                      <span className="text-white font-bold">search dead scientist</span>
                      <span className="inline-block w-2 h-3.5 bg-white animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <span>🛸</span>
                    <span>Starship Arcada</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <span>👽</span>
                    <span>Sarien Krijgers</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <span>⌨️</span>
                    <span>Parser &amp; Humor</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSpaceQuestHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchSpaceQuest}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white text-xs font-black tracking-wider shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>SPEEL SPACE QUEST</span>
                </button>
              </div>
            </div>
            )}

            {/* GAME 14: PONG (1972) - ATARI COIN-OP PIONEER */}
            {filteredGameIds.has('pong') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-white/60 shadow-[0_0_35px_rgba(255,255,255,0.15)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(255,255,255,0.35)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.5)]">
                      🏓 DE OERKNAL: 1972
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                      ATARI COIN-OP &amp; ALLAN ALCORN
                    </span>
                  </div>
                  <span className="text-xs font-mono text-yellow-400 font-bold">
                    RECORD: {getPongStats().longestRally} RALLY (ATA)
                  </span>
                </div>

                {/* Title & Preview Graphic */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-2">
                        <span>PONG</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-600">
                          COIN-OP TAFELTENNIS
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        Nolan Bushnell &amp; Allan Alcorn • Andy Capp's Tavern • De geboorte van de arcade-industrie
                      </p>
                    </div>
                  </div>

                  {/* Retro Pong Visual Simulation */}
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-neutral-700 bg-black p-3 font-mono flex flex-col justify-between group-hover:border-white/50 transition-colors select-none">
                    {/* Score display */}
                    <div className="flex justify-around items-center text-3xl font-black text-white/90">
                      <span>03</span>
                      <div className="h-6 w-0.5 border-r-2 border-dashed border-neutral-600" />
                      <span>02</span>
                    </div>

                    {/* Playing Field Simulation */}
                    <div className="relative flex-1 flex items-center justify-between px-6">
                      {/* Left Paddle */}
                      <div className="w-2.5 h-12 bg-white rounded-xs shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                      {/* Bouncing Square Ball */}
                      <div className="w-2.5 h-2.5 bg-white rounded-xs animate-pulse shadow-[0_0_12px_rgba(255,255,255,1)] translate-x-4 -translate-y-2" />
                      {/* Right Paddle */}
                      <div className="w-2.5 h-12 bg-white rounded-xs shadow-[0_0_10px_rgba(255,255,255,0.8)] translate-y-3" />
                    </div>

                    {/* Bottom HUD */}
                    <div className="bg-neutral-900/90 rounded px-2.5 py-1 flex justify-between items-center text-[10px] text-neutral-400 border border-neutral-800">
                      <span className="text-white font-bold">1P VS AI OF 2-SPELERS</span>
                      <span className="text-yellow-300 font-bold">AUTHENTIEK BEEP GELUID</span>
                    </div>
                  </div>

                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                    Ervaar de allereerste commerciële videogame-hit ooit! Speel tegen de computer met 3 moeilijkheidsgraden of speel lokaal tegen een vriend op hetzelfde toetsenbord, compleet met CRT-gloed en analoge hoekfysica.
                  </p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <span>🕹️</span>
                    <span>1P Solo &amp; 2P Lokaal</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <span>⚡</span>
                    <span>3 AI Moeilijkheden</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                    <span>🔊</span>
                    <span>Originele Bip-Bop Audio</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPongHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-neutral-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchPong}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-neutral-200 via-white to-neutral-200 hover:from-white hover:to-neutral-300 text-black text-xs font-black tracking-wider shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>SPEEL PONG</span>
                </button>
              </div>
            </div>
            )}

            {/* GAME 15: BATTLE CHESS (1988) - INTERPLAY PRODUCTIONS */}
            {filteredGameIds.has('battle_chess') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-blue-500/80 shadow-[0_0_35px_rgba(59,130,246,0.25)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(59,130,246,0.45)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]">
                      ⚔️ LEVEND SCHAAKSPEL: 1988
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-blue-300 border border-neutral-700">
                      INTERPLAY &amp; AMIGA 500 / PC
                    </span>
                  </div>
                  <span className="text-xs font-mono text-blue-300 font-bold">
                    RECORD: {getBattleChessStats().whiteWins} WINS (INT)
                  </span>
                </div>

                {/* Title & Preview Graphic */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-2">
                        <span>BATTLE CHESS</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                          ANIMATED COMBAT
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        Brian Fargo &amp; Interplay • Hilarische gevechten tussen levende schaakstukken • 35+ unieke duels
                      </p>
                    </div>
                  </div>

                  {/* Retro Battle Chess Simulation Visual */}
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-blue-500/40 bg-[#0f172a] p-3 font-mono flex flex-col justify-between group-hover:border-blue-400 transition-colors select-none">
                    {/* Top battle status banner */}
                    <div className="bg-blue-950/80 rounded px-2.5 py-1 flex justify-between items-center text-[11px] border border-blue-800">
                      <span className="text-amber-300 font-bold">WIT AAN ZET</span>
                      <span className="text-cyan-300 font-bold animate-pulse">⚔️ RIDDER SLAAT PION!</span>
                      <span className="text-blue-300 font-bold">AI DIEPTE 3</span>
                    </div>

                    {/* Isometric Duel Scene Preview */}
                    <div className="relative flex-1 flex items-center justify-center gap-8 py-2">
                      {/* Animated Knight */}
                      <div className="text-center">
                        <div className="text-4xl animate-bounce">🐴</div>
                        <span className="text-[10px] font-bold text-blue-300">Ridder (Wit)</span>
                      </div>
                      <div className="text-2xl text-red-500 font-black animate-pulse">VS</div>
                      {/* Animated Pawn */}
                      <div className="text-center">
                        <div className="text-3xl">♟️</div>
                        <span className="text-[10px] font-bold text-red-400">Pion (Zwart)</span>
                      </div>
                    </div>

                    {/* Bottom HUD */}
                    <div className="bg-neutral-900/90 rounded px-2.5 py-1 flex justify-between items-center text-[10px] text-neutral-400 border border-neutral-800">
                      <span className="text-blue-300 font-bold">35+ ANIMATIES</span>
                      <span className="text-amber-400 font-bold">2D &amp; 3D BORDWEERGAVE</span>
                    </div>
                  </div>

                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                    Het legendarische schaakspel waarin stukken tot leven komen! Ridders hakken pionnen in de pan, stenen torens verpletteren koninginnen en tovenaars toveren met bliksem. Speel solo tegen de computer of tegen een vriend.
                  </p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-blue-300 border border-neutral-700 flex items-center gap-1">
                    <span>⚔️</span>
                    <span>35+ Gevechtsanimaties</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-amber-300 border border-neutral-700 flex items-center gap-1">
                    <span>♟️</span>
                    <span>2D &amp; 3D Schaakbord</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-emerald-300 border border-neutral-700 flex items-center gap-1">
                    <span>🧠</span>
                    <span>Schaak AI Engine</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBattleChessHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchBattleChess}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-black tracking-wider shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>SPEEL BATTLE CHESS</span>
                </button>
              </div>
            </div>
            )}

            {/* GAME 16: MARIO BROS. (1983) - NINTENDO ARCADE / SHIGERU MIYAMOTO */}
            {filteredGameIds.has('mario') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-red-500/80 shadow-[0_0_35px_rgba(239,68,68,0.25)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(239,68,68,0.5)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                      🍄 NIEUWE KLASSIEKER (SPEL 16)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-red-300 border border-neutral-700">
                      NINTENDO ARCADE • 1983
                    </span>
                  </div>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    RECORD: {marioTopScore.toLocaleString()} ({marioTopInitials})
                  </span>
                </div>

                {/* Title & Preview Graphic */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-2">
                        <span>MARIO BROS.</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                          SEWER PLATFORMER
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        Shigeru Miyamoto &amp; Gunpei Yokoi • New Yorkse riolen • POW-blok &amp; Shellcreepers
                      </p>
                    </div>
                  </div>

                  {/* Retro Mario Bros. Sewer Simulation Visual */}
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-red-500/40 bg-black p-2 font-mono flex flex-col justify-between group-hover:border-red-400 transition-colors select-none">
                    {/* Top HUD */}
                    <div className="flex justify-between items-center bg-neutral-900/90 rounded px-2.5 py-1 text-[11px] border border-neutral-800">
                      <span className="text-red-400 font-bold">MARIO: 048900</span>
                      <span className="text-yellow-400 font-bold flex items-center gap-1">
                        <span>🪙 COINS:</span>
                        <span>08</span>
                      </span>
                      <span className="text-cyan-400 font-bold">FASE 04 ⚡</span>
                    </div>

                    {/* Sewer Arena Simulation */}
                    <div className="relative flex-1 flex flex-col justify-between py-1">
                      {/* Top Pipes & Shelled enemies */}
                      <div className="flex justify-between items-center px-2">
                        <div className="w-8 h-4 bg-green-600 rounded-b border border-green-400 flex items-center justify-center text-[9px] text-white">PIP</div>
                        <div className="text-yellow-300 text-xs animate-bounce font-bold">🐢 ⮯ (POW HIT!)</div>
                        <div className="w-8 h-4 bg-green-600 rounded-b border border-green-400 flex items-center justify-center text-[9px] text-white">PIP</div>
                      </div>

                      {/* Center Brick Platform with POW block */}
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-2 w-16 bg-[#008888] rounded-xs border border-cyan-400" />
                        <div className="px-2 py-0.5 bg-yellow-400 text-black font-black text-[10px] rounded shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-pulse">
                          POW
                        </div>
                        <div className="h-2 w-16 bg-[#008888] rounded-xs border border-cyan-400" />
                      </div>

                      {/* Bottom Floor with Mario jumping under a platform */}
                      <div className="flex justify-between items-end px-3">
                        <div className="text-base animate-pulse">🦀</div>
                        <div className="text-lg font-black text-red-500 animate-bounce">👨‍🔧 ⬆️</div>
                        <div className="text-sm">🪙</div>
                      </div>
                    </div>

                    {/* Bottom HUD */}
                    <div className="bg-neutral-900/90 rounded px-2.5 py-1 flex justify-between items-center text-[10px] text-neutral-400 border border-neutral-800">
                      <span className="text-yellow-400 font-bold">POW BLOK (3 SLAGEN)</span>
                      <span className="text-red-400 font-bold">ORIGINELE 1983 CHIPTUNES</span>
                    </div>
                  </div>

                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                    De originele arcade-sensatie van Miyamoto! Stoot van onderaf tegen de vloeren om Shellcreepers, Sidesteppers en Fighter Flies op hun rug te gooien en schop ze van het platform. Gebruik het legendarische POW-blok en verzamel bonusmunten!
                  </p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-red-300 border border-neutral-700 flex items-center gap-1">
                    <span>🍄</span>
                    <span>4 Vijandtypen &amp; Slip-ijs</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-yellow-300 border border-neutral-700 flex items-center gap-1">
                    <span>💥</span>
                    <span>POW-Blok Mechaniek</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-cyan-300 border border-neutral-700 flex items-center gap-1">
                    <span>🏃</span>
                    <span>Traagheidsfysica</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-emerald-300 border border-neutral-700 flex items-center gap-1">
                    <span>🎵</span>
                    <span>8-Bit Chiptunes</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMarioHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-red-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchMario}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 hover:from-red-500 hover:via-yellow-400 text-black text-xs font-black tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.6)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>SPEEL MARIO BROS.</span>
                </button>
              </div>
            </div>
            )}

            {/* GAME 17: SUPER MARIO BROS. (1985) - NINTENDO / SHIGERU MIYAMOTO */}
            {filteredGameIds.has('super_mario') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-yellow-500/80 shadow-[0_0_35px_rgba(234,179,8,0.25)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(234,179,8,0.45)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-red-500 via-amber-400 to-yellow-400 text-black shadow-[0_0_12px_rgba(234,179,8,0.6)]">
                      ⭐ NES MEESTERWERK (SPEL 17)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-yellow-300 border border-neutral-700">
                      NINTENDO • SHIGERU MIYAMOTO • 1985
                    </span>
                  </div>
                  <span className="text-xs font-mono text-yellow-400 font-bold">
                    RECORD: {superMarioTopScore.toLocaleString()} ({superMarioTopInitials})
                  </span>
                </div>

                {/* Title & Preview Graphic */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-2">
                        <span>SUPER MARIO BROS.</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-700">
                          WERELD 1-1
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        Miyamoto &amp; Tezuka • Koji Kondo Muziek • De Redder der Videogames
                      </p>
                    </div>
                  </div>

                  {/* World 1-1 Visual Simulation */}
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-yellow-500/40 bg-[#5c94fc] p-3 font-mono flex flex-col justify-between group-hover:border-yellow-400 transition-colors select-none shadow-inner">
                    {/* Top HUD */}
                    <div className="flex justify-between items-center bg-black/60 rounded px-2.5 py-1 text-[11px] text-white font-bold border border-white/20">
                      <span className="text-yellow-300">MARIO 085200</span>
                      <span className="text-amber-300 flex items-center gap-1">🪙 x24</span>
                      <span className="text-white">WORLD 1-1</span>
                      <span className="text-red-400">TIME 368</span>
                    </div>

                    {/* Middle Action: Mario jumping to hit a ? block */}
                    <div className="relative flex-1 flex items-center justify-center gap-6">
                      <div className="text-xl animate-bounce">🍄</div>
                      <div className="flex items-center gap-1 text-base font-black">
                        <span className="px-2 py-1 bg-[#d86018] text-white border border-white rounded font-bold shadow">?</span>
                        <span className="px-2 py-1 bg-[#b84418] text-white border border-black rounded font-bold">🧱</span>
                        <span className="px-2 py-1 bg-[#d86018] text-white border border-white rounded font-bold shadow animate-pulse">?</span>
                      </div>
                      <div className="text-2xl animate-pulse">👨‍🌾</div>
                      <div className="text-lg">🌰</div>
                    </div>

                    {/* Bottom Ground & Pipes */}
                    <div className="bg-[#a84400] border-t-2 border-[#fc9838] rounded-b px-2.5 py-1 flex justify-between items-center text-[10px] text-yellow-200 font-bold">
                      <span>🟢 BUIS MET PIRANHA PLANT</span>
                      <span>🚩 VLAGGENSTOK CASTLE GOAL</span>
                    </div>
                  </div>

                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                    De historische 2D side-scrolling platformer die de wereld veroverde! Ren met Mario door Wereld 1-1, breek stenen blokken, verzamel munten uit vraagtekenblokken, groei uit tot Super Mario met de magische paddenstoel, stamp op Goombas en glijd van de vlaggenstok af bij het kasteel!
                  </p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-yellow-300 border border-neutral-700 flex items-center gap-1">
                    <span>🍄</span>
                    <span>Super Mushrooms &amp; Groei</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-red-300 border border-neutral-700 flex items-center gap-1">
                    <span>🌰</span>
                    <span>Goombas &amp; Koopa Troopa</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-cyan-300 border border-neutral-700 flex items-center gap-1">
                    <span>📜</span>
                    <span>60 FPS Side-Scroll Camera</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-emerald-300 border border-neutral-700 flex items-center gap-1">
                    <span>🎵</span>
                    <span>Koji Kondo Overworld Thema</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSuperMarioHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-yellow-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchSuperMario}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 hover:from-red-500 hover:via-yellow-400 text-black text-xs font-black tracking-wider shadow-[0_0_20px_rgba(234,179,8,0.6)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>SPEEL SUPER MARIO</span>
                </button>
              </div>
            </div>
            )}

            {/* GAME 18: WOLFENSTEIN 3D (1992) - ID SOFTWARE / THREE.JS 3D FPS */}
            {filteredGameIds.has('wolfenstein') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-blue-500/80 shadow-[0_0_35px_rgba(59,130,246,0.25)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(59,130,246,0.5)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-blue-600 via-indigo-500 to-red-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.6)]">
                      🏰 3D HARDWARE PIONIER (SPEL 18)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-blue-300 border border-neutral-700">
                      MS-DOS • THREE.JS 3D • 1992
                    </span>
                  </div>
                  <span className="text-xs font-mono text-yellow-400 font-bold">
                    RECORD: {wolfTopScore.toLocaleString()} ({wolfTopInitials})
                  </span>
                </div>

                {/* Title & Preview Graphic */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-2">
                        <span>WOLFENSTEIN 3D</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                          RAYCASTING FPS
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        id Software • John Carmack &amp; John Romero • Castle Hollehammer Ontsnapping
                      </p>
                    </div>
                  </div>

                  {/* 3D Wolfenstein Dungeon Simulation Visual */}
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-blue-500/40 bg-[#000022] p-2 font-mono flex flex-col justify-between group-hover:border-blue-400 transition-colors select-none">
                    {/* Top Simulated DOS Status */}
                    <div className="flex justify-between items-center bg-neutral-900/90 rounded px-2.5 py-1 text-[11px] border border-neutral-800">
                      <span className="text-blue-400 font-bold">FLOOR: 01</span>
                      <span className="text-yellow-400 font-bold">SCORE: 064200</span>
                      <span className="text-emerald-400 font-bold">HEALTH: 100%</span>
                      <span className="text-cyan-400 font-bold">AMMO: 24</span>
                    </div>

                    {/* 3D Castle Corridors Simulation Visual */}
                    <div className="relative flex-1 flex items-center justify-center overflow-hidden">
                      {/* Left and Right Perspective 3D Walls */}
                      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-blue-900 via-blue-950 to-transparent opacity-80 border-r border-blue-700/40" />
                      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-blue-900 via-blue-950 to-transparent opacity-80 border-l border-blue-700/40" />

                      {/* Center Corridor & Sliding Door */}
                      <div className="relative flex flex-col items-center">
                        <div className="w-20 h-16 bg-neutral-700 border-2 border-neutral-500 rounded flex flex-col items-center justify-center shadow-lg relative">
                          <div className="w-12 h-1 bg-yellow-400 mb-1" />
                          <span className="text-[9px] text-yellow-300 font-black tracking-widest">DOOR</span>
                        </div>
                        {/* Enemy Guard in Corridor */}
                        <div className="absolute -left-12 bottom-1 text-xl animate-pulse">
                          💂‍♂️
                        </div>
                      </div>

                      {/* First-Person Pistol Sight & Muzzle Flash in Foreground */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <div className="w-8 h-8 text-yellow-400 text-lg animate-ping">💥</div>
                        <div className="w-8 h-12 bg-neutral-800 border-t-2 border-neutral-600 rounded-t-sm shadow-2xl" />
                      </div>
                    </div>

                    {/* Bottom DOS bar simulation */}
                    <div className="bg-[#0000a8] rounded px-2.5 py-1 flex justify-between items-center text-[10px] text-white border border-[#000054]">
                      <span className="text-yellow-300 font-black">B.J. BLAZKOWICZ 😤</span>
                      <span className="text-cyan-300 font-bold">THREE.JS HARDWARE 3D</span>
                    </div>
                  </div>

                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                    De baanbrekende 3D first-person shooter van John Carmack en id Software! Verken het labyrint van Kasteel Hollehammer met vloeiende Three.js 3D WebGL rendering, openschuivende deuren, geheime gangen die je kunt induwen, mes, Luger pistool en MP-40!
                  </p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-blue-300 border border-neutral-700 flex items-center gap-1">
                    <span>🏰</span>
                    <span>Three.js WebGL 3D</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-yellow-300 border border-neutral-700 flex items-center gap-1">
                    <span>🚪</span>
                    <span>Schuifdeuren &amp; Push-Walls</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-cyan-300 border border-neutral-700 flex items-center gap-1">
                    <span>🔫</span>
                    <span>Mes, Luger &amp; MP-40</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-emerald-300 border border-neutral-700 flex items-center gap-1">
                    <span>🎵</span>
                    <span>AdLib FM Synthesizer</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsWolfensteinHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchWolfenstein}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:via-cyan-400 text-white text-xs font-black tracking-wider shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>SPEEL WOLFENSTEIN 3D</span>
                </button>
              </div>
            </div>
            )}

            {/* GAME 24: DOOM (1993) - ID SOFTWARE / JOHN CARMACK & ROMERO */}
            {filteredGameIds.has('doom') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-red-500/80 shadow-[0_0_35px_rgba(239,68,68,0.25)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(239,68,68,0.5)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 text-black shadow-[0_0_12px_rgba(239,68,68,0.6)]">
                      💀 DE 3D FPS REVOLUTIE (1993)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-red-300 border border-neutral-700">
                      MS-DOS 3D • ID SOFTWARE • 1993
                    </span>
                  </div>
                  <span className="text-xs font-mono text-yellow-400 font-bold">
                    RECORD: {doomTopScore.toLocaleString()} ({doomTopInitials})
                  </span>
                </div>

                {/* Title & Preview Graphic */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-2">
                        <span>DOOM</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                          E1M1 HANGAR
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        id Software • John Carmack &amp; John Romero • UAC Phobos Base
                      </p>
                    </div>
                  </div>

                  {/* 3D DOOM Simulation Visual */}
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-red-500/40 bg-[#160606] p-2 font-mono flex flex-col justify-between group-hover:border-red-400 transition-colors select-none">
                    {/* Top Simulated Doom Status */}
                    <div className="flex justify-between items-center bg-neutral-900/90 rounded px-2.5 py-1 text-[11px] border border-neutral-800">
                      <span className="text-red-400 font-bold">AREA: E1M1</span>
                      <span className="text-yellow-400 font-bold">KILLS: 86%</span>
                      <span className="text-emerald-400 font-bold">HEALTH: 100%</span>
                      <span className="text-cyan-400 font-bold">ARMOR: 100%</span>
                      <span className="text-amber-400 font-bold">SHELLS: 50</span>
                    </div>

                    {/* 3D Phobos Corridors Simulation Visual */}
                    <div className="relative flex-1 flex items-center justify-center overflow-hidden">
                      {/* Left and Right Perspective 3D Walls */}
                      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-red-950 via-stone-900 to-transparent opacity-80 border-r border-red-700/40" />
                      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-red-950 via-stone-900 to-transparent opacity-80 border-l border-red-700/40" />

                      {/* Center Toxic Waste & Demon */}
                      <div className="relative flex flex-col items-center">
                        <div className="w-24 h-14 bg-stone-800 border-2 border-red-700 rounded flex flex-col items-center justify-center shadow-lg relative">
                          <span className="text-lg animate-bounce">👹</span>
                          <span className="text-[8px] text-red-400 font-black tracking-widest">IMP / DEMON</span>
                        </div>
                      </div>

                      {/* First-Person Double-Barrel Shotgun & Muzzle Flash */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <div className="w-10 h-10 text-yellow-400 text-xl animate-ping">💥</div>
                        <div className="flex gap-1">
                          <div className="w-4 h-12 bg-neutral-800 border-t-2 border-stone-600 rounded-t-sm shadow-2xl" />
                          <div className="w-4 h-12 bg-neutral-800 border-t-2 border-stone-600 rounded-t-sm shadow-2xl" />
                        </div>
                      </div>
                    </div>

                    {/* Bottom STBAR HUD simulation */}
                    <div className="bg-[#242424] rounded px-2.5 py-1 flex justify-between items-center text-[10px] text-white border border-stone-700">
                      <span className="text-yellow-400 font-black flex items-center gap-1">
                        <span>😈</span>
                        <span>DOOMGUY (IDDQD)</span>
                      </span>
                      <span className="text-emerald-400 font-bold">100% HEALTH</span>
                      <span className="text-red-400 font-bold">SHOTGUN / BFG 9000</span>
                    </div>
                  </div>

                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                    De baanbrekende 3D first-person shooter die de game-industrie voorgoed transformeerde! Betreed de door demonen overspoelde UAC Phobos basis met Shotgun, Chaingun, Plasma Rifle en de legendarische BFG 9000, vergezeld van de iconische heavy metal soundtrack!
                  </p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-red-400 border border-neutral-700 flex items-center gap-1">
                    <span>💀</span>
                    <span>3D WebGL FPS Engine</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-yellow-300 border border-neutral-700 flex items-center gap-1">
                    <span>💥</span>
                    <span>Shotgun &amp; BFG 9000</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-cyan-300 border border-neutral-700 flex items-center gap-1">
                    <span>😈</span>
                    <span>Geanimeerde STBAR HUD</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-emerald-300 border border-neutral-700 flex items-center gap-1">
                    <span>🎵</span>
                    <span>Heavy Metal Chiptune Synth</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDoomHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-red-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchDoom}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 hover:from-red-500 hover:via-amber-400 text-black text-xs font-black tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.6)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>START DOOM!</span>
                </button>
              </div>
            </div>
            )}

            {/* GAME 19: 3D PINBALL POWER (1989) - COMMODORE 64 / MASTERTRONIC */}
            {filteredGameIds.has('c64_pinball') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-cyan-500/80 shadow-[0_0_35px_rgba(6,182,212,0.25)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.6)]">
                      ⭐ C64 KLASSIEKER (SPEL 19)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-cyan-300 border border-neutral-700">
                      COMMODORE 64 • MASTERTRONIC • 1989
                    </span>
                  </div>
                  <span className="text-xs font-mono text-cyan-300 font-bold">
                    RECORD: {c64PinballTopScore.toLocaleString()} ({c64PinballTopInitials})
                  </span>
                </div>

                {/* Title & Preview Graphic */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-2">
                        <span>3D PINBALL POWER</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                          MOS 6581 SID
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        Stephen Walters • Bulldog / Mastertronic • Perspectief Flipperkast
                      </p>
                    </div>
                  </div>

                  {/* 3D Pinball Visual Simulation */}
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-cyan-500/40 bg-[#0000a4] p-3 font-mono flex flex-col justify-between group-hover:border-cyan-400 transition-colors select-none shadow-inner">
                    {/* Top HUD */}
                    <div className="flex justify-between items-center bg-[#4242e7]/80 rounded px-2.5 py-1 text-[11px] text-white font-bold border border-cyan-300/40">
                      <span className="text-yellow-300">SCORE 185,000</span>
                      <span className="text-cyan-200">BALL 1/3</span>
                      <span className="text-green-300">BONUS x3</span>
                      <span className="text-amber-400">HIGH 250,000</span>
                    </div>

                    {/* Middle Action: 3D Pinball Field */}
                    <div className="relative flex-1 flex flex-col items-center justify-center">
                      <div className="flex items-center gap-6 text-sm">
                        <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-bold border border-white/40 shadow-sm animate-pulse">🔴 100</span>
                        <span className="px-2 py-0.5 rounded-full bg-yellow-500 text-black font-black border border-white/60 shadow-sm">🟡 500</span>
                        <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-bold border border-white/40 shadow-sm animate-pulse">🔴 100</span>
                      </div>
                      <div className="my-1 text-[11px] text-cyan-300 font-mono flex items-center gap-3">
                        <span className="px-1.5 py-0.5 bg-black/60 rounded border border-cyan-500/40">🕳️ BLACK HOLE</span>
                        <span className="text-white">⚪ PINBALL</span>
                        <span className="px-1.5 py-0.5 bg-black/60 rounded border border-cyan-500/40">⚡ 5X MULTIPLIER</span>
                      </div>
                      <div className="flex items-center gap-8 text-cyan-200 font-mono font-black text-lg">
                        <span className="animate-bounce">◢ FLIPPER L</span>
                        <span className="animate-bounce">◣ FLIPPER R</span>
                      </div>
                    </div>

                    {/* Bottom status */}
                    <div className="bg-[#4242e7]/80 rounded-b px-2.5 py-1 flex justify-between items-center text-[10px] text-cyan-200 font-bold border-t border-cyan-300/30">
                      <span>🕹️ BESTURING: [Z] LINKS • [/] RECHTS • [SPATIE] PLUNGER</span>
                      <span>💾 COMMODORE 64 VIC-II</span>
                    </div>
                  </div>

                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                    De historische flipperkastklassieker voor de Commodore 64! Beleef het baanbrekende schuine 3D-perspectief van Stephen Walters, compleet met bumpers, slingshots, een geheimzinnig Black Hole zinkgat, multiplier-banen en authentieke MOS 6581 SID-chiptonen.
                  </p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-cyan-300 border border-neutral-700 flex items-center gap-1">
                    <span>💾</span>
                    <span>C64 VIC-II Engine</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-yellow-300 border border-neutral-700 flex items-center gap-1">
                    <span>⚡</span>
                    <span>2X-5X Multipliers</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-red-300 border border-neutral-700 flex items-center gap-1">
                    <span>🕳️</span>
                    <span>Black Hole Sinkhole</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-emerald-300 border border-neutral-700 flex items-center gap-1">
                    <span>🎵</span>
                    <span>MOS 6581 SID Audio</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsC64PinballHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchC64Pinball}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 text-white text-xs font-black tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>SPEEL 3D PINBALL</span>
                </button>
              </div>
            </div>
            )}

            {/* GAME 20: TEMPLE RUN 3D (2011) - IMANGI STUDIOS / THREE.JS */}
            {filteredGameIds.has('temple_run') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-amber-500/80 shadow-[0_0_35px_rgba(245,158,11,0.25)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)]">
                      ⭐ 3D MOBILE HIT (SPEL 20)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-amber-300 border border-neutral-700">
                      IMANGI STUDIOS • 2011
                    </span>
                  </div>
                  <span className="text-xs font-mono text-amber-300 font-bold">
                    RECORD: {templeRunTopScore.toLocaleString()} ({templeRunTopInitials})
                  </span>
                </div>

                {/* Title & Preview Graphic */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-2">
                        <span>TEMPLE RUN 3D</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700">
                          THREE.JS 3D
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        Keith Shepherd &amp; Natalia Luckyanova • Oer-Endless Runner
                      </p>
                    </div>
                  </div>

                  {/* Temple Run Visual Simulation */}
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-amber-500/40 bg-[#1c1917] p-3 font-mono flex flex-col justify-between group-hover:border-amber-400 transition-colors select-none shadow-inner">
                    <div className="flex justify-between items-center bg-black/70 rounded px-2.5 py-1 text-[11px] text-white font-bold border border-amber-500/30">
                      <span className="text-amber-400">SCORE: 1,254,000</span>
                      <span className="text-yellow-300">🪙 COINS: 420</span>
                      <span className="text-emerald-400">DIST: 8,420M</span>
                    </div>

                    <div className="relative flex-1 flex flex-col items-center justify-center">
                      <div className="text-2xl animate-bounce">🏃💨</div>
                      <div className="text-xs text-amber-300 font-mono font-black mt-1">
                        👹 DEMON MONKEY CHASE!
                      </div>
                      <div className="flex gap-4 text-xs mt-1 text-yellow-400 font-mono">
                        <span>🪙 🪙 🪙</span>
                        <span>🪵 VUURBOOM</span>
                        <span>🪙 🪙 🪙</span>
                      </div>
                    </div>

                    <div className="bg-amber-950/80 rounded-b px-2.5 py-1 flex justify-between items-center text-[10px] text-amber-200 font-bold border-t border-amber-500/30">
                      <span>🕹️ BESTURING: [A/D] DRAAIEN • [W/S] SPRINGEN/BUKKEN</span>
                      <span>🌴 ANCIENT TEMPLE</span>
                    </div>
                  </div>

                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                    De wereldberoemde endless runner die mobiel gamen herdefinieerde! Ren over eeuwenoude tempelmuren, glijd onder brandende hindernissen door, spring over dodelijke kloven en ontsnap aan de meedogenloze demon-apen.
                  </p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-amber-300 border border-neutral-700 flex items-center gap-1">
                    <span>🏃</span>
                    <span>Endless 3D Temple</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-yellow-300 border border-neutral-700 flex items-center gap-1">
                    <span>🪙</span>
                    <span>Gouden Munten &amp; Multipliers</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-red-300 border border-neutral-700 flex items-center gap-1">
                    <span>👹</span>
                    <span>Evil Demon Monkeys</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsTempleRunHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchTempleRun}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-400 hover:via-yellow-400 text-black text-xs font-black tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.6)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>SPEEL TEMPLE RUN 3D</span>
                </button>
              </div>
            </div>
            )}

            {/* GAME 21: LEMMINGS (1991) - DMA DESIGN / PSYGNOSIS */}
            {filteredGameIds.has('lemmings') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-emerald-500/80 shadow-[0_0_35px_rgba(16,185,129,0.25)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-black shadow-[0_0_12px_rgba(16,185,129,0.6)]">
                      ⭐ PUZZLE REVOLUTIE (SPEL 21)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-emerald-300 border border-neutral-700">
                      C64 / AMIGA • DMA DESIGN • 1991
                    </span>
                  </div>
                  <span className="text-xs font-mono text-emerald-300 font-bold">
                    RECORD: {lemmingsTopScore.toLocaleString()} ({lemmingsTopInitials})
                  </span>
                </div>

                {/* Title & Preview Graphic */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-2">
                        <span>LEMMINGS</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                          DESTRUCTIBLE PHYSICS
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        David Jones &amp; Mike Dailly • Psygnosis • 8 Lemming Specialismen
                      </p>
                    </div>
                  </div>

                  {/* Lemmings Visual Simulation */}
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-emerald-500/40 bg-[#05130b] p-3 font-mono flex flex-col justify-between group-hover:border-emerald-400 transition-colors select-none shadow-inner">
                    {/* Top HUD */}
                    <div className="flex justify-between items-center bg-black/70 rounded px-2.5 py-1 text-[11px] text-white font-bold border border-emerald-500/30">
                      <span className="text-emerald-300">LEVEL 1: JUST DIG!</span>
                      <span className="text-cyan-300">🐹 20 LEMMINGS</span>
                      <span className="text-yellow-300">GOAL: 50%</span>
                      <span className="text-amber-400">TIME: 4:58</span>
                    </div>

                    {/* Middle Action: Lemmings marching and digging */}
                    <div className="relative flex-1 flex flex-col items-center justify-center">
                      <div className="flex items-center gap-3 text-lg">
                        <span className="animate-bounce">🐹</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-900/80 text-cyan-200 border border-cyan-400">🪂 FLOATER</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-red-900/80 text-red-200 border border-red-400">✋ BLOCKER</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-900/80 text-yellow-200 border border-yellow-400">⛏️ DIGGER</span>
                        <span className="animate-pulse">🚪 EXIT</span>
                      </div>
                      <div className="mt-2 w-48 h-3 bg-gradient-to-r from-emerald-800 via-emerald-600 to-emerald-900 rounded-full border border-emerald-400/40 shadow-inner flex items-center justify-center">
                        <span className="text-[9px] text-emerald-200 font-mono font-black">DESTRUCTIBLE TERRAIN</span>
                      </div>
                    </div>

                    {/* Bottom Status Bar */}
                    <div className="bg-emerald-950/80 rounded-b px-2.5 py-1 flex justify-between items-center text-[10px] text-emerald-200 font-bold border-t border-emerald-500/30">
                      <span>🕹️ KLIK LEMMING OM VAAARDIGHEID TOE TE WIJZEN • [NUKE] VOLLEDIGE CHAOS</span>
                      <span>🎵 SYNTH AUDIO</span>
                    </div>
                  </div>

                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                    De iconische realtime puzzelklassieker van DMA Design en Psygnosis! Wijs 8 unieke rollen toe aan je marcherende Lemmings (Climber, Floater, Bomber, Blocker, Builder, Basher, Miner, Digger) en leid ze veilig door vernietigbare levels naar de uitgang!
                  </p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-emerald-300 border border-neutral-700 flex items-center gap-1">
                    <span>🐹</span>
                    <span>8 Lemming Vaardigheden</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-yellow-300 border border-neutral-700 flex items-center gap-1">
                    <span>⛏️</span>
                    <span>Echte Vernietigbare Wereld</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-cyan-300 border border-neutral-700 flex items-center gap-1">
                    <span>⚡</span>
                    <span>Fast-Forward &amp; Armageddon Nuke</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-red-300 border border-neutral-700 flex items-center gap-1">
                    <span>🎵</span>
                    <span>Klassieke Chiptune Melodieën</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLemmingsHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchLemmings}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 text-black text-xs font-black tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.6)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>START LEMMINGS!</span>
                </button>
              </div>
            </div>
            )}

            {/* Game 22: MANIC MINER (Sinclair ZX Spectrum 1983) */}
            {filteredGameIds.has('manic_miner') && (
            <div className="relative group rounded-3xl bg-neutral-900/90 border-2 border-yellow-500/60 hover:border-yellow-400 overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between hover:shadow-[0_0_30px_rgba(234,179,8,0.35)]">
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-2xl shadow-inner">
                      ⛏️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono text-lg font-black text-white tracking-wide">
                          MANIC MINER
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-yellow-950 text-yellow-300 border border-yellow-700">
                          1983
                        </span>
                      </div>
                      <p className="text-xs font-mono text-neutral-400">
                        Matthew Smith • Bug-Byte &amp; Software Projects
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-neutral-800 text-yellow-300 border border-neutral-700">
                    SINCLAIR 48K
                  </span>
                </div>

                {/* Simulated ZX Spectrum 48K Screen */}
                <div className="space-y-3">
                  <div className="relative rounded-2xl bg-black border border-yellow-500/30 p-3 overflow-hidden font-mono shadow-inner flex flex-col gap-2">
                    {/* Top Spectrum Rainbow Bar */}
                    <div className="flex items-center justify-between pb-1 border-b border-neutral-800 text-[10px]">
                      <span className="text-yellow-400 font-bold">CAVERN 01: CENTRAL CAVERN</span>
                      <div className="flex h-2 w-12 rounded overflow-hidden">
                        <div className="flex-1 bg-red-600" />
                        <div className="flex-1 bg-yellow-400" />
                        <div className="flex-1 bg-green-500" />
                        <div className="flex-1 bg-cyan-400" />
                      </div>
                    </div>

                    {/* Pixel Simulation Viewport */}
                    <div className="relative h-32 bg-black rounded border border-neutral-900 flex flex-col justify-between p-2 overflow-hidden">
                      {/* Top Air Meter */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-white font-bold">AIR:</span>
                        <div className="flex-1 mx-2 h-2 bg-neutral-900 rounded overflow-hidden border border-neutral-800">
                          <div className="h-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-500 w-4/5 animate-pulse" />
                        </div>
                        <span className="text-yellow-300">🔑 Keys: 4</span>
                      </div>

                      {/* Platforms & Miner Willy Simulation */}
                      <div className="relative flex-1 flex flex-col justify-between py-1">
                        {/* Upper platform with Eugene / Robot */}
                        <div className="flex justify-between items-center px-4">
                          <span className="text-yellow-400 font-bold text-xs animate-bounce">🔑</span>
                          <span className="text-cyan-400 text-xs animate-pulse">🤖 [PATROL]</span>
                          <span className="text-yellow-400 font-bold text-xs animate-bounce">🔑</span>
                        </div>

                        {/* Middle conveyor & Willy */}
                        <div className="flex items-center justify-between px-2 bg-blue-950/40 rounded py-0.5 border border-blue-900/40 text-[10px]">
                          <span className="text-yellow-300 font-bold animate-pulse">🏃 Miner Willy</span>
                          <span className="text-amber-400 font-bold text-[9px]">&gt;&gt;&gt; CONVEYOR &gt;&gt;&gt;</span>
                          <span className="text-emerald-400 font-bold">🚪 EXIT</span>
                        </div>

                        {/* Bottom Floor */}
                        <div className="h-2 bg-green-700/80 rounded w-full flex justify-around">
                          <span className="text-[8px] text-red-400">▲ STALAGMITES ▲</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Status Bar */}
                    <div className="bg-yellow-950/80 rounded-b px-2.5 py-1 flex justify-between items-center text-[10px] text-yellow-200 font-bold border-t border-yellow-500/30">
                      <span>🕹️ O: LINKS • P: RECHTS • SPATIE: SPRONG • M: BEAPER CHIPTUNE</span>
                      <span>⚡ POKE 6031769</span>
                    </div>
                  </div>

                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                    Dé ultieme Britse oer-platformer van de legendarische 17-jarige Matthew Smith! Leid Miner Willy door 20 gevaarlijke grotten, verzamel alle knipperende sleutels, ontwijk Eugene en robot-patrouilles en spring met vaste parabolen vóór je zuurstof op is!
                  </p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-yellow-300 border border-neutral-700 flex items-center gap-1">
                    <span>⛏️</span>
                    <span>20 Volledige Caverns</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-cyan-300 border border-neutral-700 flex items-center gap-1">
                    <span>🎵</span>
                    <span>1-Bit Beeper Synth (Hall of Mountain King)</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-emerald-300 border border-neutral-700 flex items-center gap-1">
                    <span>🪂</span>
                    <span>Vaste Parabolische Fysica</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-magenta-300 border border-neutral-700 flex items-center gap-1">
                    <span>⚡</span>
                    <span>POKE 6031769 Cheats</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsManicMinerHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-yellow-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchManicMiner}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 hover:from-yellow-300 hover:via-amber-400 text-black text-xs font-black tracking-wider shadow-[0_0_20px_rgba(234,179,8,0.6)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>START MANIC MINER!</span>
                </button>
              </div>
            </div>
            )}

            {/* Game 23: 3D MONSTER MAZE (Sinclair ZX81 1981) */}
            {filteredGameIds.has('monster_maze') && (
            <div className="relative group rounded-3xl bg-neutral-900/90 border-2 border-emerald-500/60 hover:border-emerald-400 overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between hover:shadow-[0_0_30px_rgba(16,185,129,0.35)]">
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-2xl shadow-inner">
                      🦖
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono text-lg font-black text-white tracking-wide">
                          3D MONSTER MAZE
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                          1981
                        </span>
                      </div>
                      <p className="text-xs font-mono text-neutral-400">
                        Malcolm Evans • J.K. Greye Software
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-neutral-800 text-emerald-300 border border-neutral-700">
                    SINCLAIR ZX81 16K
                  </span>
                </div>

                {/* Simulated ZX81 3D Raycasting Screen */}
                <div className="space-y-3">
                  <div className="relative rounded-2xl bg-black border border-emerald-500/30 p-3 overflow-hidden font-mono shadow-inner flex flex-col gap-2">
                    {/* Top Header */}
                    <div className="flex items-center justify-between pb-1 border-b border-neutral-800 text-[10px]">
                      <span className="text-emerald-400 font-bold">DIR: NORTH • STEPS: 42</span>
                      <span className="text-white font-bold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                        SCORE: 420
                      </span>
                    </div>

                    {/* 3D Wireframe Corridor Preview */}
                    <div className="relative h-32 bg-black rounded border border-neutral-900 flex flex-col justify-between p-2 overflow-hidden items-center">
                      <div className="w-full flex justify-between text-[9px] text-neutral-500">
                        <span>┌─ 16K RAM ─┐</span>
                        <span>┌─ 3D RAYCAST ─┐</span>
                      </div>

                      {/* Corridor & Rex */}
                      <div className="relative w-44 h-20 border border-emerald-500/40 rounded flex items-center justify-center bg-neutral-950">
                        <div className="text-center">
                          <span className="text-2xl animate-pulse block">🦖</span>
                          <span className="text-[9px] text-red-400 font-bold tracking-widest">
                            TYRANNOSAURUS REX
                          </span>
                        </div>
                      </div>

                      {/* Suspense Ticker */}
                      <div className="w-full bg-emerald-950/90 text-emerald-300 px-2 py-0.5 rounded text-[10px] text-center font-bold animate-pulse border border-emerald-600/40">
                        &quot;REX HAS SEEN YOU! RUN!!&quot;
                      </div>
                    </div>

                    {/* Bottom Keybar Info */}
                    <div className="bg-neutral-950 rounded-b px-2.5 py-1 flex justify-between items-center text-[10px] text-neutral-400 font-bold border-t border-neutral-800">
                      <span>🕹️ 5:LINKS • 6:VOORUIT • 7:ACHTER • 8:RECHTS • 0:OMKEREN</span>
                      <span className="text-emerald-400">CRT MONOCHROOM / GREEN / AMBER</span>
                    </div>
                  </div>

                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                    Het legendarische allereerste 3D first-person survival horror spel ooit gemaakt! Ontworpen in Z80 machinecode door Malcolm Evans op de legendarische Sinclair ZX81. Verken het 16×16 doolhof, zoek de uitgang en ontsnap aan de hongerige Tyrannosaurus Rex voordat hij je grijpt!
                  </p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-emerald-300 border border-neutral-700 flex items-center gap-1">
                    <span>🦖</span>
                    <span>1st 3D Survival Horror (1981)</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-cyan-300 border border-neutral-700 flex items-center gap-1">
                    <span>📐</span>
                    <span>64×48 Semigrafische 3D Raycaster</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-yellow-300 border border-neutral-700 flex items-center gap-1">
                    <span>⚡</span>
                    <span>Tension Heartbeat &amp; Radar Trainer</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-red-300 border border-neutral-700 flex items-center gap-1">
                    <span>🛑</span>
                    <span>16K RAM Pack Wobble Safe</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMonsterMazeHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchMonsterMaze}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-500 hover:from-emerald-300 text-black text-xs font-black tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.6)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>START 3D MONSTER MAZE!</span>
                </button>
              </div>
            </div>
            )}

            {/* Game 24: DUKE NUKEM 3D (3D Realms 1996) */}
            {filteredGameIds.has('duke') && (
            <div className="relative group rounded-3xl bg-neutral-900/90 border-2 border-amber-500/60 hover:border-amber-400 overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between hover:shadow-[0_0_30px_rgba(245,158,11,0.35)]">
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-2xl shadow-inner">
                      ☢️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono text-lg font-black text-white tracking-wide">
                          DUKE NUKEM 3D
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700">
                          1996
                        </span>
                      </div>
                      <p className="text-xs font-mono text-neutral-400">
                        Ken Silverman • 3D Realms • Jon St. John
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-neutral-800 text-amber-300 border border-neutral-700">
                    MS-DOS 3D BUILD
                  </span>
                </div>

                {/* Simulated 3D Build Engine Screen */}
                <div className="space-y-3">
                  <div className="relative rounded-2xl bg-black border border-amber-500/30 p-3 overflow-hidden font-mono shadow-inner flex flex-col gap-2">
                    {/* Top Header */}
                    <div className="flex items-center justify-between pb-1 border-b border-neutral-800 text-[10px]">
                      <span className="text-amber-400 font-bold">E1L1: HOLLYWOOD HOLOCAUST</span>
                      <span className="text-black font-bold bg-amber-400 px-1.5 py-0.5 rounded">
                        RECORD: {dukeTopScore.toLocaleString()} ({dukeTopInitials})
                      </span>
                    </div>

                    {/* 3D High-Res Viewport Simulation */}
                    <div className="relative h-32 bg-neutral-950 rounded border border-neutral-800 flex flex-col justify-between p-2 overflow-hidden items-center">
                      <div className="w-full flex justify-between text-[9px] text-neutral-400">
                        <span>[BUILD ENGINE 640×480]</span>
                        <span className="text-yellow-400 font-bold">JETPACK: 100%</span>
                      </div>

                      <div className="flex flex-col items-center justify-center font-mono text-xs text-center">
                        <span className="text-yellow-400 font-black tracking-widest text-sm">&quot;HAIL TO THE KING, BABY!&quot;</span>
                        <span className="text-[10px] text-amber-300 mt-1">🔫 SHOTGUN • 💣 PIPEBOMB • 🔬 SHRINKER</span>
                        <span className="text-[9px] text-red-400 animate-pulse mt-0.5">⚠️ ALIEN PIG COPS DETECTED</span>
                      </div>

                      <div className="w-full flex justify-between text-[9px] text-neutral-400">
                        <span className="text-emerald-400 font-bold">HEALTH: 100%</span>
                        <span className="text-cyan-400 font-bold">ARMOR: 100%</span>
                        <span className="text-amber-400 font-bold">AMMO: 48</span>
                      </div>
                    </div>

                    {/* Bottom Status Bar */}
                    <div className="flex justify-between items-center text-[10px] text-neutral-400 pt-1 border-t border-neutral-900">
                      <span>🕹️ WASD / PIJLTJES: BEWEEG • CTRL: SCHIET • SPACE: DEUR/TRAP</span>
                      <span className="text-amber-400 font-bold">DNCORNHOLIO</span>
                    </div>
                  </div>

                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                    De absolute kroon op het 3D retro actietijdperk van 3D Realms! Volledige interactie met de wereld, vernietigbare objecten, krimpstralen, jetpacks, varkenspolitie en legendarische one-liners van Duke in haarscherpe 640×480 resolutie!
                  </p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-amber-300 border border-neutral-700 flex items-center gap-1">
                    <span>☢️</span>
                    <span>Ken Silverman Build Engine</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-yellow-300 border border-neutral-700 flex items-center gap-1">
                    <span>🎙️</span>
                    <span>Jon St. John Voice Lines</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-cyan-300 border border-neutral-700 flex items-center gap-1">
                    <span>🎒</span>
                    <span>Jetpack &amp; Shrinker Ray</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-emerald-300 border border-neutral-700 flex items-center gap-1">
                    <span>⚡</span>
                    <span>DOS Cheat Codes &amp; Secrets</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDukeHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchDuke}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black text-xs font-black tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.6)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>START DUKE NUKEM 3D!</span>
                </button>
              </div>
            </div>
            )}

            {/* Game 25: HALF-LIFE (Valve 1998) 1920x1280 FULL HD PC */}
            {filteredGameIds.has('half_life') && (
            <div className="relative group rounded-3xl bg-neutral-900/90 border-2 border-orange-500/70 hover:border-orange-400 overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between hover:shadow-[0_0_40px_rgba(234,88,12,0.45)]">
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-600/30 border border-orange-500 flex items-center justify-center text-2xl font-black text-orange-400 shadow-inner">
                      λ
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono text-lg font-black text-white tracking-wide">
                          HALF-LIFE
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-950 text-orange-300 border border-orange-700">
                          1998
                        </span>
                      </div>
                      <p className="text-xs font-mono text-neutral-400">
                        Valve Software • Gabe Newell &amp; Marc Laidlaw
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-neutral-800 text-orange-400 border border-neutral-700">
                    PC 1920×1280 3D
                  </span>
                </div>

                {/* Simulated 3D Half-Life Screen */}
                <div className="space-y-3">
                  <div className="relative rounded-2xl bg-black border border-orange-500/30 p-3 overflow-hidden font-mono shadow-inner flex flex-col gap-2">
                    {/* Top Header */}
                    <div className="flex items-center justify-between pb-1 border-b border-neutral-800 text-[10px]">
                      <span className="text-orange-400 font-bold">BLACK MESA // SECTOR C: ANOMALOUS MATERIALS</span>
                      <span className="text-black font-bold bg-orange-500 px-1.5 py-0.5 rounded">
                        RECORD: {halfLifeTopScore.toLocaleString()} ({halfLifeTopInitials})
                      </span>
                    </div>

                    {/* 3D High-Res Viewport Simulation */}
                    <div className="relative h-32 bg-neutral-950 rounded border border-neutral-800 flex flex-col justify-between p-2 overflow-hidden items-center">
                      <div className="w-full flex justify-between text-[9px] text-neutral-400">
                        <span className="text-orange-400 font-bold">[1920×1280 FULL HD]</span>
                        <span className="text-green-400 font-bold">FLASHLIGHT: ON</span>
                      </div>

                      <div className="flex flex-col items-center justify-center font-mono text-xs text-center">
                        <span className="text-orange-400 font-black tracking-widest text-sm">&quot;MORNING DR. FREEMAN...&quot;</span>
                        <span className="text-[10px] text-amber-300 mt-1">🔴 KOEVOET • 🔫 GLOCK • 💥 SPAS-12 • ⚡ MP5</span>
                        <span className="text-[9px] text-red-400 animate-pulse mt-0.5">⚠️ RESONANCE CASCADE IN PROGRESS</span>
                      </div>

                      <div className="w-full flex justify-between text-[9px] text-neutral-400">
                        <span className="text-orange-400 font-bold">+ 100 HP</span>
                        <span className="text-amber-400 font-bold">⚡ HEV: 100</span>
                        <span className="text-orange-400 font-bold">AMMO: 17/50</span>
                      </div>
                    </div>

                    {/* Bottom Status Bar */}
                    <div className="flex justify-between items-center text-[10px] text-neutral-400 pt-1 border-t border-neutral-900">
                      <span>🕹️ WASD: LOPEN • MUIS: AIM • E: INTERACTIE / CHARGE • 1-4: WAPENS</span>
                      <span className="text-orange-400 font-bold">GOLDSRC</span>
                    </div>
                  </div>

                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                    De revolutionaire first-person shooter van Valve! Vecht als Gordon Freeman door de verwoeste hallen van Black Mesa. Gebruik de iconische koevoet, Glock, Shotgun en MP5, breek bevoorradingskisten en herlaad je HEV pak bij interactieve muurdispensers!
                  </p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-orange-300 border border-neutral-700 flex items-center gap-1">
                    <span>λ</span>
                    <span>1920×1280 Full HD WebGL 3D</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-amber-300 border border-neutral-700 flex items-center gap-1">
                    <span>🔴</span>
                    <span>Iconische Koevoet &amp; Kisten</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-green-300 border border-neutral-700 flex items-center gap-1">
                    <span>🔋</span>
                    <span>HEV Suit Voice &amp; Chargers</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-red-300 border border-neutral-700 flex items-center gap-1">
                    <span>👾</span>
                    <span>Headcrabs &amp; Vortigaunts</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsHalfLifeHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-orange-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchHalfLife}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-black tracking-wider shadow-[0_0_25px_rgba(234,88,12,0.7)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>START HALF-LIFE!</span>
                </button>
              </div>
            </div>
            )}

            {/* Game 26: ZAXXON (Sega 1982) First Isometric 3D Arcade Shooter */}
            {filteredGameIds.has('zaxxon') && (
            <div className="relative group rounded-3xl bg-neutral-900/90 border-2 border-blue-500/70 hover:border-cyan-400 overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between hover:shadow-[0_0_40px_rgba(37,99,235,0.45)]">
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-500 flex items-center justify-center text-2xl font-black text-cyan-400 shadow-inner">
                      🚀
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono text-lg font-black text-white tracking-wide">
                          ZAXXON
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-cyan-300 border border-blue-700">
                          1982
                        </span>
                      </div>
                      <p className="text-xs font-mono text-neutral-400">
                        Sega • Ikegami Tsushinki
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-neutral-800 text-cyan-400 border border-neutral-700">
                    ISOMETRIC 3D
                  </span>
                </div>

                {/* Simulated Isometric Radar / Zaxxon Screen */}
                <div className="space-y-3">
                  <div className="relative rounded-2xl bg-black border border-blue-500/30 p-3 overflow-hidden font-mono shadow-inner flex flex-col gap-2">
                    {/* Top Header */}
                    <div className="flex items-center justify-between pb-1 border-b border-neutral-800 text-[10px]">
                      <span className="text-cyan-400 font-bold">ASTEROID FORTRESS // ZONE 1</span>
                      <span className="text-black font-bold bg-cyan-400 px-1.5 py-0.5 rounded">
                        RECORD: {zaxxonTopScore.toLocaleString()} ({zaxxonTopInitials})
                      </span>
                    </div>

                    {/* Isometric Viewport Simulation */}
                    <div className="relative h-32 bg-slate-950 rounded border border-blue-900/60 flex flex-col justify-between p-2 overflow-hidden items-center">
                      <div className="w-full flex justify-between text-[9px] text-neutral-400">
                        <span className="text-cyan-400 font-bold">ELEVATION: ALT 2.5</span>
                        <span className="text-amber-400 font-bold">FUEL: ■■■■■□□□ 65%</span>
                      </div>

                      <div className="flex flex-col items-center justify-center font-mono text-xs text-center relative z-10">
                        <div className="text-cyan-300 font-black text-sm tracking-wider flex items-center gap-2">
                          <span>🚀 Z-21 FIGHTER</span>
                          <span className="text-neutral-500 text-[10px]">↘ ISOMETRISCH 3D</span>
                        </div>
                        <div className="text-[10px] text-yellow-400 mt-1 flex items-center gap-2">
                          <span>⛽ FUEL TANK: +300 PTS</span>
                          <span>⚡ ELEC BARRIER</span>
                        </div>
                        <div className="text-[9px] text-blue-300 mt-0.5">
                          ⬛ VLOERSCHADUW BEPAALT JE HOOGTE
                        </div>
                      </div>

                      <div className="w-full flex justify-between text-[9px] text-neutral-400">
                        <span className="text-blue-400 font-bold">LIVES: 🚀 🚀 🚀</span>
                        <span className="text-red-400 font-bold">TARGET: ZAXXON ROBOT</span>
                        <span className="text-cyan-400 font-bold">RADAR: ACTIVE</span>
                      </div>
                    </div>

                    {/* Bottom Status Bar */}
                    <div className="flex justify-between items-center text-[10px] text-neutral-400 pt-1 border-t border-neutral-900">
                      <span>🕹️ PIJLTJES: HOOGTE & KOERS • SPATIE: DUBBELE LASERS • FUEL MANAGEMENT</span>
                      <span className="text-cyan-400 font-bold">AXONOMETRIC</span>
                    </div>
                  </div>

                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                    De baanbrekende arcadeklassieker uit 1982 van Sega! De allereerste game met een isometrische 3D-wereld en projectieschaduwen. Vlieg door verdedigingsmuren, blaas brandstoftanks op om je brandstof aan te vullen, vermijd laserpoorten en schiet de gevreesde Zaxxon Robot neer!
                  </p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-cyan-300 border border-neutral-700 flex items-center gap-1">
                    <span>🚀</span>
                    <span>Isometrisch Axonometrisch 3D</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-blue-300 border border-neutral-700 flex items-center gap-1">
                    <span>⬛</span>
                    <span>Vloerschaduw Hoogte-Indicator</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-amber-300 border border-neutral-700 flex items-center gap-1">
                    <span>⛽</span>
                    <span>Brandstof &amp; Fuel Siren</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-red-300 border border-neutral-700 flex items-center gap-1">
                    <span>🤖</span>
                    <span>Zaxxon Robot Boss Battle</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsZaxxonHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchZaxxon}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-black tracking-wider shadow-[0_0_25px_rgba(37,99,235,0.7)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>START ZAXXON!</span>
                </button>
              </div>
            </div>
            )}

            {/* Game 27: ROCKET RAID (Acornsoft 1982 / Jonathan Griffiths) BBC Micro & Electron Scramble */}
            {filteredGameIds.has('rocket_raid') && (
            <div className="relative group rounded-3xl bg-neutral-900/90 border-2 border-pink-500/70 hover:border-rose-400 overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between hover:shadow-[0_0_40px_rgba(236,72,153,0.45)]">
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-pink-600/30 border border-pink-500 flex items-center justify-center text-2xl font-black text-pink-400 shadow-inner">
                      🚀
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono text-lg font-black text-white tracking-wide">
                          ROCKET RAID
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-pink-950 text-pink-300 border border-pink-700">
                          1982
                        </span>
                      </div>
                      <p className="text-xs font-mono text-neutral-400">
                        Acornsoft • Jonathan Griffiths
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-neutral-800 text-pink-400 border border-neutral-700">
                    BBC MICRO &amp; ELECTRON
                  </span>
                </div>

                {/* Simulated Screen / Rocket Raid Viewport */}
                <div className="space-y-3">
                  <div className="relative rounded-2xl bg-black border border-pink-500/30 p-3 overflow-hidden font-mono shadow-inner flex flex-col gap-2">
                    {/* Top Header */}
                    <div className="flex items-center justify-between pb-1 border-b border-neutral-800 text-[10px]">
                      <span className="text-pink-400 font-bold">SECTIE 1 // THE OPEN HILLS</span>
                      <span className="text-black font-bold bg-pink-400 px-1.5 py-0.5 rounded">
                        RECORD: {rocketRaidTopScore.toLocaleString()} ({rocketRaidTopInitials})
                      </span>
                    </div>

                    {/* Viewport Simulation */}
                    <div className="relative h-32 bg-slate-950 rounded border border-pink-900/60 flex flex-col justify-between p-2 overflow-hidden items-center">
                      <div className="w-full flex justify-between text-[9px] text-neutral-400">
                        <span className="text-pink-400 font-bold">1UP 028450</span>
                        <span className="text-amber-400 font-bold">FUEL: ■■■■■■■□ 85%</span>
                        <span className="text-cyan-400 font-bold">HIGH 028450</span>
                      </div>

                      <div className="flex flex-col items-center justify-center font-mono text-xs text-center relative z-10">
                        <div className="text-pink-300 font-black text-sm tracking-wider flex items-center gap-2">
                          <span>🚀 SCRAMBLE FIGHTER</span>
                          <span className="text-yellow-400 text-[10px]">━━━► LASER</span>
                        </div>
                        <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-3">
                          <span className="bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-600 text-emerald-300 font-bold">⛽ FUEL DEPOT: +150 PTS</span>
                          <span className="text-rose-400 font-bold">🔺 ROCKET LAUNCH</span>
                        </div>
                        <div className="text-[9px] text-neutral-400 mt-0.5">
                          🖥️ MODUS: ACORN GRIJS (MONOCHROOM) &amp; MODE 2 KLEUR
                        </div>
                      </div>

                      <div className="w-full flex justify-between text-[9px] text-neutral-400">
                        <span className="text-pink-400 font-bold">LIVES: 🚀 🚀 🚀</span>
                        <span className="text-yellow-400 font-bold">ZONE: 1 / 5</span>
                        <span className="text-cyan-400 font-bold">BOMBS: 💣 READY</span>
                      </div>
                    </div>

                    {/* Bottom Status Bar */}
                    <div className="flex justify-between items-center text-[10px] text-neutral-400 pt-1 border-t border-neutral-900">
                      <span>🕹️ PIJLTJES: VLIEGEN • SPATIE: LASER • B: BOM DROPPEN • M: ACORN GRIJS</span>
                      <span className="text-pink-400 font-bold">320x240 RETRO</span>
                    </div>
                  </div>

                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                    De absolute Scramble-sensatie van de BBC Micro en Acorn Electron uit 1982! Vlieg horizontaal door 5 dynamische secties: heuvels met lanceerraketten, zwermen aanvallende UFO&apos;s, vallende vuurstenen, nauwe grotten en de centrale vijandelijke reactor. Met authentiek <strong>Acorn Grijs</strong> monochrome modus en dynamisch brandstofmanagement!
                  </p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-pink-300 border border-neutral-700 flex items-center gap-1">
                    <span>🚀</span>
                    <span>5 Complete Secties &amp; Reactor Core</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-slate-300 border border-neutral-700 flex items-center gap-1">
                    <span>🖥️</span>
                    <span>Acorn Grijs (Monochrome) &amp; Mode 2 Kleur</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-amber-300 border border-neutral-700 flex items-center gap-1">
                    <span>⛽</span>
                    <span>Fuel Management &amp; Bommenwerper</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-cyan-300 border border-neutral-700 flex items-center gap-1">
                    <span>🔊</span>
                    <span>TI SN76489 4-Kanaals Synthesizer</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRocketRaidHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-pink-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchRocketRaid}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-500 hover:to-rose-500 text-black text-xs font-black tracking-wider shadow-[0_0_25px_rgba(236,72,153,0.7)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>START ROCKET RAID!</span>
                </button>
              </div>
            </div>
            )}

            {/* Game 28: EXILE (1988) - BBC MICRO / SUPERIOR SOFTWARE / PETER IRVIN & JEREMY SMITH */}
            {filteredGameIds.has('exile') && (
            <div className="relative group rounded-3xl bg-neutral-900/90 border-2 border-cyan-500/80 hover:border-cyan-400 overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between hover:shadow-[0_0_40px_rgba(6,182,212,0.45)]">
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-600/30 border border-cyan-500 flex items-center justify-center text-2xl font-black text-cyan-400 shadow-inner">
                      🚀
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono text-lg font-black text-white tracking-wide">
                          EXILE
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                          1988
                        </span>
                      </div>
                      <p className="text-xs font-mono text-neutral-400">
                        Superior Software • Peter Irvin &amp; Jeremy Smith
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-neutral-800 text-cyan-400 border border-neutral-700">
                    BBC MICRO MODE 5
                  </span>
                </div>

                {/* Simulated Screen / Exile CRT Viewport */}
                <div className="space-y-3">
                  <div className="relative rounded-2xl bg-black border border-cyan-500/30 p-3 overflow-hidden font-mono shadow-inner flex flex-col gap-2">
                    {/* Top Header */}
                    <div className="flex items-center justify-between pb-1 border-b border-neutral-800 text-[10px]">
                      <span className="text-cyan-400 font-bold">PLANET PHOEBUS // BASE FACILITY</span>
                      <span className="text-black font-bold bg-cyan-400 px-1.5 py-0.5 rounded">
                        RECORD: {exileTopScore.toLocaleString()} ({exileTopInitials})
                      </span>
                    </div>

                    {/* Viewport Simulation */}
                    <div className="relative h-32 bg-slate-950 rounded border border-cyan-900/60 flex flex-col justify-between p-2 overflow-hidden items-center">
                      <div className="w-full flex justify-between text-[9px] text-neutral-400">
                        <span className="text-emerald-400 font-bold">O2: 100%</span>
                        <span className="text-cyan-400 font-bold">NRG: ■■■■■■■■ 100%</span>
                        <span className="text-amber-400 font-bold">FUEL: ■■■■■■□□ 85%</span>
                        <span className="text-pink-400 font-bold">WEAPON: BLASTER</span>
                      </div>

                      <div className="flex flex-col items-center justify-center font-mono text-xs text-center relative z-10">
                        <div className="text-cyan-300 font-black text-sm tracking-wider flex items-center gap-2">
                          <span>👨‍🚀 MIKE FINN</span>
                          <span className="text-yellow-400 text-[10px]">━━► THRUST VECTOR</span>
                        </div>
                        <div className="text-[10px] text-teal-400 mt-1 flex items-center gap-3">
                          <span className="bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-600 text-cyan-300 font-bold">📦 BOULDER / POWER CELL</span>
                          <span className="text-pink-400 font-bold">🦅 MAGPIE THIEF</span>
                        </div>
                        <div className="text-[9px] text-neutral-400 mt-0.5">
                          🌊 WATER DRIJFVERMOGEN • 💨 WINDSCHACHTEN • 📡 TELEPORT BEACON
                        </div>
                      </div>

                      <div className="w-full flex justify-between text-[9px] text-neutral-400">
                        <span className="text-cyan-400 font-bold">BEACON: CARRIED</span>
                        <span className="text-yellow-400 font-bold">SECTOR: SURFACE CAVERNS</span>
                        <span className="text-emerald-400 font-bold">CARGO: READY</span>
                      </div>
                    </div>

                    {/* Bottom Status Bar */}
                    <div className="flex justify-between items-center text-[10px] text-neutral-400 pt-1 border-t border-neutral-900">
                      <span>🕹️ WASD: JETPACK • SPATIE: BLASTER • X: PAK/GOOI • C: TELEPORT • TAB: WAPEN</span>
                      <span className="text-cyan-400 font-bold">6502 PHYSICS</span>
                    </div>
                  </div>

                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                    Het technologische wonder van Peter Irvin en Jeremy Smith op de BBC Micro uit 1988! Bestuur Commander Mike Finn met echte Newtoniaanse traagheid, zwaartekracht en straalaandrijving in een gigantisch ondergronds grottenstelsel op planeet Phoebus. Draag en slinger rotsblokken en energiecellen, doorwaad diepe waterbassins met drijfvermogen, activeer generatoren en weersta de diefachtige Magpie eksters en Triax beveiligingsdrones!
                  </p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-cyan-300 border border-neutral-700 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span>6502 Newtoniaanse Traagheid &amp; Vlucht</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-teal-300 border border-neutral-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-teal-400" />
                    <span>Fysisch Oppak- &amp; Werpsysteem</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-amber-300 border border-neutral-700 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-amber-400" />
                    <span>Drijfvermogen, Wind &amp; Magma</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-pink-300 border border-neutral-700 flex items-center gap-1">
                    <Tv className="w-3 h-3 text-pink-400" />
                    <span>Teleport Baken &amp; Magpie AI</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsExileHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchExile}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-black tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.7)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>START EXILE (BBC MICRO 1988)</span>
                </button>
              </div>
            </div>
            )}

            {/* GAME 36: IMPOSSIBLE MISSION (1984) - EPYX / DENNIS CASWELL / COMMODORE 64 */}
            {filteredGameIds.has('impossible_mission') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-blue-500/80 shadow-[0_0_35px_rgba(59,130,246,0.25)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(59,130,246,0.45)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-blue-500 to-cyan-400 text-black shadow-[0_0_12px_rgba(59,130,246,0.5)]">
                      🕵️ NIEUW: GAME 36
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-blue-300 border border-neutral-700">
                      COMMODORE 64 • SID 6581 • 1984
                    </span>
                  </div>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    RECORD: {impossibleMissionTopScore.toLocaleString()} ({impossibleMissionTopInitials})
                  </span>
                </div>

                {/* Title & Preview Graphic */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-2">
                        <span>IMPOSSIBLE MISSION</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                          STEALTH &amp; SOMERSAULT
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        Dennis Caswell • Epyx • "Another visitor... Stay a while, stay forever!"
                      </p>
                    </div>
                  </div>

                  {/* Retro Impossible Mission Simulation Visual */}
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-blue-500/40 bg-neutral-950 p-2 font-mono flex flex-col justify-between group-hover:border-blue-400 transition-colors select-none">
                    {/* Top HUD */}
                    <div className="flex justify-between items-center bg-neutral-900/80 rounded px-2 py-1 text-[11px] border border-neutral-800">
                      <span className="text-blue-300 font-bold">AGENT 4125</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <span>TIME:</span>
                        <span>05:42:19</span>
                      </span>
                      <span className="text-emerald-400 font-bold">PUZZLE: 14/36 🧩</span>
                    </div>

                    {/* Sector Chamber Simulation */}
                    <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden py-1">
                      <div className="w-full flex justify-between px-6 text-xs font-bold text-neutral-400 mb-1">
                        <span className="text-cyan-400">SECTOR 03: MAINFRAME LAB</span>
                        <span className="text-red-400 animate-pulse">⚡ ROBOT PATROL ACTIVE</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="text-white font-bold bg-blue-950 px-2 py-1 rounded border border-blue-600">
                          🏃 360° SOMERSAULT JUMP
                        </span>
                        <span className="text-neutral-500">━━ ⚡ ━━</span>
                        <span className="text-amber-300 font-bold bg-amber-950/80 px-2 py-1 rounded border border-amber-600">
                          🤖 SNOOZE ROBOTS
                        </span>
                      </div>
                    </div>

                    {/* Bottom Status Banner */}
                    <div className="flex justify-between items-center text-[10px] text-neutral-400 bg-neutral-900/60 rounded px-2 py-1">
                      <span className="text-yellow-300">POCKET COMPUTER: SNOOZE + LIFT CODES</span>
                      <span className="text-cyan-300">SID 6581 + ESS SPEECH CHIP</span>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-blue-300 border border-neutral-700 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-blue-400" />
                    <span>Gymnastieke Salto &amp; Fysica</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-amber-300 border border-neutral-700 flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-amber-400" />
                    <span>Gedigitaliseerde ESS Spraak</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-emerald-300 border border-neutral-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>36 Ponskaart Puzzelstukken</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-purple-300 border border-neutral-700 flex items-center gap-1">
                    <Tv className="w-3 h-3 text-purple-400" />
                    <span>8 Ondergrondse Sectoren &amp; Liftschacht</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsImpossibleMissionHistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchImpossibleMission}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black tracking-wider shadow-[0_0_25px_rgba(59,130,246,0.7)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>START IMPOSSIBLE MISSION (C64 1984)</span>
                </button>
              </div>
            </div>
            )}

            {/* SONY PLAYSTATION 1 (1994) - KEN KUTARAGI / SONY */}
            {filteredGameIds.has('ps1') && (
            <div className="group relative rounded-3xl bg-neutral-900/90 border-2 border-indigo-500/80 shadow-[0_0_35px_rgba(99,102,241,0.25)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(99,102,241,0.45)] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-7 space-y-5">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]">
                      💿 32-BIT CD-ROM
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-indigo-300 border border-neutral-700">
                      SONY &amp; KEN KUTARAGI • 1994
                    </span>
                  </div>
                  <span className="text-xs font-mono text-indigo-300 font-bold">
                    RECORD: 100% CD (PS1)
                  </span>
                </div>

                {/* Title & Preview Graphic */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-2">
                        <span>SONY PLAYSTATION 1</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                          CRASH &amp; RIDGE RACER
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        Ken Kutaragi • 32-Bit CD-ROM Console • Crash Bandicoot &amp; Ridge Racer
                      </p>
                    </div>
                  </div>

                  {/* PS1 Visual Preview */}
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-indigo-500/40 bg-neutral-950 p-2 font-mono flex flex-col justify-between group-hover:border-indigo-400 transition-colors select-none">
                    <div className="flex justify-between items-center bg-neutral-900/80 rounded px-2 py-1 text-[11px] border border-neutral-800">
                      <span className="text-indigo-400 font-bold">SONY PS1 CONSOLE</span>
                      <span className="text-yellow-400 font-bold flex items-center gap-1">
                        <span>DISC:</span>
                        <span>CRASH BANDICOOT 3D</span>
                      </span>
                      <span className="text-emerald-400 font-bold">CD-ROM 2X 💿</span>
                    </div>

                    <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden py-1">
                      <div className="w-full flex justify-between px-6 text-xs font-bold text-neutral-400 mb-1">
                        <span className="text-indigo-300">3D CORRIDOR PLATFORMER</span>
                        <span className="text-purple-400 animate-pulse">🎮 DUALSHOCK RUMBLE</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="text-white font-bold bg-indigo-950 px-2 py-1 rounded border border-indigo-600">
                          🌪️ CRASH SPIN ATTACK
                        </span>
                        <span className="text-neutral-500">━━ 📦 ━━</span>
                        <span className="text-amber-300 font-bold bg-amber-950/80 px-2 py-1 rounded border border-amber-600">
                          🏎️ RIDGE RACER 3D
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-neutral-400 bg-neutral-900/60 rounded px-2 py-1">
                      <span className="text-indigo-300">PS1 BOOT JINGLE AUDIO</span>
                      <span className="text-cyan-300">CD-SPINDLE ANIMATION</span>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-indigo-300 border border-neutral-700 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-indigo-400" />
                    <span>Crash Bandicoot &amp; Ridge Racer</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-purple-300 border border-neutral-700 flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-purple-400" />
                    <span>Sony Boot Chime Audio</span>
                  </span>
                  <span className="px-2 py-0.8 rounded-lg bg-neutral-800 text-emerald-300 border border-neutral-700 flex items-center gap-1">
                    <Gamepad2 className="w-3 h-3 text-emerald-400" />
                    <span>DualShock Analog Xbox Control</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPs1HistoryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchPs1}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-slate-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black tracking-wider shadow-[0_0_25px_rgba(99,102,241,0.7)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>START PLAYSTATION 1 (PS1 1994)</span>
                </button>
              </div>
            </div>
            )}

              </div>
            )}
          </section>
        )}



        {/* Footer info */}
        <footer className="w-full pt-6 pb-10 border-t border-neutral-800/60 flex flex-col items-center justify-between gap-4 text-xs text-neutral-500 font-mono">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
            <div>
              Retro Arcade Vault • Volledig responsief voor mobiel &amp; desktop
            </div>
            <div className="flex items-center gap-4">
              <span>36 Klassiekers (1972–2011) • 0 External ROMs</span>
              {onOpenLeaderboard && (
                <button
                  type="button"
                  onClick={onOpenLeaderboard}
                  className="text-yellow-400 hover:underline cursor-pointer"
                >
                  Bekijk Leaderboard
                </button>
              )}
            </div>
          </div>

          {/* Legal Notice Footer Line */}
          <div className="w-full pt-3 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-500">
            <p className="text-center sm:text-left">
              {lang === 'nl'
                ? 'Onafhankelijk, niet-commercieel educatief en historisch project. Er worden geen commerciële ROMs gedistribueerd.'
                : 'Independent, non-commercial educational tribute project. No commercial ROMs distributed.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setProjectInfoTab('legal');
                setShowProjectInfo(true);
              }}
              className="text-rose-400/90 hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>⚖️</span>
              <span>{lang === 'nl' ? 'Juridische Kennisgeving & Intellectueel Eigendom' : 'Legal & Intellectual Property Notice'}</span>
            </button>
          </div>
        </footer>
      </main>

      {/* Arcadians History & BBC Micro Dossier Modal */}
      <ArcadiansHistoryModal
        isOpen={isArcadiansHistoryOpen}
        onClose={() => setIsArcadiansHistoryOpen(false)}
        onPlay={handleLaunchArcadians}
      />

      {/* FRAK! History & BBC Micro Dossier Modal */}
      <FrakHistoryModal
        isOpen={isFrakHistoryOpen}
        onClose={() => setIsFrakHistoryOpen(false)}
        onPlay={handleLaunchFrak}
      />

      {/* Chuckie Egg History & BBC Micro Dossier Modal */}
      <ChuckieEggHistoryModal
        isOpen={isChuckieEggHistoryOpen}
        onClose={() => setIsChuckieEggHistoryOpen(false)}
        onPlay={handleLaunchChuckieEgg}
      />

      {/* Frogger History & Atari Dossier Modal */}
      <FroggerHistoryModal
        isOpen={isFroggerHistoryOpen}
        onClose={() => setIsFroggerHistoryOpen(false)}
        onPlay={handleLaunchFrogger}
      />

      {/* Eindeloos History & Labyrinth Map Modal */}
      <EindeloosHistoryModal
        isOpen={isEindeloosHistoryOpen}
        onClose={() => setIsEindeloosHistoryOpen(false)}
        onPlayNow={handleLaunchEindeloos}
      />

      {/* Xbox Controller Guide & Connection Status Modal */}
      <GamepadGuideModal
        isOpen={showGamepadGuide}
        onClose={() => setShowGamepadGuide(false)}
        lang={lang}
      />

      {/* Mobile Tilt & Touch Controls Guide Modal */}
      <TiltTouchGuideModal
        isOpen={showTiltTouchGuide}
        onClose={() => setShowTiltTouchGuide(false)}
        lang={lang}
      />

      {/* Project Dossier & GitHub Documentation Modal */}
      <ProjectInfoModal
        isOpen={showProjectInfo}
        onClose={() => setShowProjectInfo(false)}
        lang={lang}
        initialTab={projectInfoTab}
      />

      {/* Cookie & Local Storage Consent Banner */}
      <CookieConsentBanner
        lang={lang}
        onOpenPrivacyDetails={() => {
          setProjectInfoTab('legal');
          setShowProjectInfo(true);
        }}
      />

      {/* Pac-Man History & Trivia Modal */}
      <PacmanHistoryModal
        isOpen={isPacmanHistoryOpen}
        onClose={() => setIsPacmanHistoryOpen(false)}
        onPlayGame={handleLaunchPacman}
      />

      {/* Space Invaders History & Trivia Modal */}
      <SpaceInvadersHistoryModal
        isOpen={isSpaceHistoryOpen}
        onClose={() => setIsSpaceHistoryOpen(false)}
        onPlayGame={handleLaunchSpaceInvaders}
      />

      {/* Demon Attack History & Trivia Modal */}
      <DemonAttackHistoryModal
        isOpen={isDemonHistoryOpen}
        onClose={() => setIsDemonHistoryOpen(false)}
        onPlay={handleLaunchDemonAttack}
      />

      {/* Repton History & Trivia Modal */}
      <ReptonHistoryModal
        isOpen={isReptonHistoryOpen}
        onClose={() => setIsReptonHistoryOpen(false)}
        onPlay={() => handleLaunchRepton()}
      />

      {/* Tetris History & Alexey Pajitnov Dossier Modal */}
      <TetrisHistoryModal
        isOpen={isTetrisHistoryOpen}
        onClose={() => setIsTetrisHistoryOpen(false)}
        onPlay={handleLaunchTetris}
      />

      {/* King's Quest I & Sierra On-Line History Modal */}
      <KingsQuestHistoryModal
        isOpen={isKingsQuestHistoryOpen}
        onClose={() => setIsKingsQuestHistoryOpen(false)}
        onPlayAgain={handleLaunchKingsQuest}
      />

      {/* Space Quest I: The Sarien Encounter History Modal */}
      <SpaceQuestHistoryModal
        isOpen={isSpaceQuestHistoryOpen}
        onClose={() => setIsSpaceQuestHistoryOpen(false)}
        lang={lang}
      />

      {/* Pong (1972) Atari History Modal */}
      <PongHistoryModal
        isOpen={isPongHistoryOpen}
        onClose={() => setIsPongHistoryOpen(false)}
        lang={lang}
      />

      {/* Battle Chess (1988) Interplay History Modal */}
      <BattleChessHistoryModal
        isOpen={isBattleChessHistoryOpen}
        onClose={() => setIsBattleChessHistoryOpen(false)}
        lang={lang}
      />

      {/* Mario Bros. (1983) Nintendo Arcade History Modal */}
      <MarioHistoryModal
        isOpen={isMarioHistoryOpen}
        onClose={() => setIsMarioHistoryOpen(false)}
        lang={lang}
      />

      {/* Super Mario Bros. (1985) Nintendo NES History Modal */}
      <SuperMarioHistoryModal
        isOpen={isSuperMarioHistoryOpen}
        onClose={() => setIsSuperMarioHistoryOpen(false)}
        onPlay={handleLaunchSuperMario}
        lang={lang}
      />

      {/* Wolfenstein 3D (1992) id Software History Modal */}
      <WolfensteinHistoryModal
        isOpen={isWolfensteinHistoryOpen}
        onClose={() => setIsWolfensteinHistoryOpen(false)}
        lang={lang}
      />

      {/* 3D Pinball Power (1989) Commodore 64 History Modal */}
      <C64PinballHistoryModal
        isOpen={isC64PinballHistoryOpen}
        onClose={() => setIsC64PinballHistoryOpen(false)}
        onPlay={handleLaunchC64Pinball}
        lang={lang}
      />

      {/* Temple Run 3D (2011) Imangi Studios History Modal */}
      <TempleRunHistoryModal
        isOpen={isTempleRunHistoryOpen}
        onClose={() => setIsTempleRunHistoryOpen(false)}
        lang={lang}
      />

      {/* Lemmings (1991) DMA Design / Psygnosis History Modal */}
      <LemmingsHistoryModal
        isOpen={isLemmingsHistoryOpen}
        onClose={() => setIsLemmingsHistoryOpen(false)}
        onPlay={handleLaunchLemmings}
        lang={lang}
      />

      {/* Manic Miner (1983) Matthew Smith / Sinclair ZX Spectrum History Modal */}
      <ManicMinerHistoryModal
        isOpen={isManicMinerHistoryOpen}
        onClose={() => setIsManicMinerHistoryOpen(false)}
        onPlay={handleLaunchManicMiner}
        lang={lang}
      />

      {/* 3D Monster Maze (1981) Malcolm Evans / Sinclair ZX81 History Modal */}
      <MonsterMazeHistoryModal
        isOpen={isMonsterMazeHistoryOpen}
        onClose={() => setIsMonsterMazeHistoryOpen(false)}
        onPlay={handleLaunchMonsterMaze}
        lang={lang}
      />

      {/* Asteroids (1979) Lyle Rains & Ed Logg / Atari Vector DVG History Modal */}
      <AsteroidsHistoryModal
        isOpen={isAsteroidsHistoryOpen}
        onClose={() => setIsAsteroidsHistoryOpen(false)}
        onPlay={handleLaunchAsteroids}
        lang={lang}
      />

      {/* Prince of Persia (1989/1990) Jordan Mechner / Brøderbund History Modal */}
      <PrinceHistoryModal
        isOpen={isPrinceHistoryOpen}
        onClose={() => setIsPrinceHistoryOpen(false)}
        lang={lang}
      />

      {/* Donkey Kong (1981) Shigeru Miyamoto / Nintendo History Modal */}
      <DonkeyKongHistoryModal
        isOpen={isDonkeyKongHistoryOpen}
        onClose={() => setIsDonkeyKongHistoryOpen(false)}
        onPlay={handleLaunchDonkeyKong}
        lang={lang}
      />

      {/* Double Dragon (1987) Technos Japan History Modal */}
      <DoubleDragonHistoryModal
        isOpen={isDoubleDragonHistoryOpen}
        onClose={() => setIsDoubleDragonHistoryOpen(false)}
        lang={lang}
      />

      {/* Nokia Snake (1997) Taneli Armanto / Nokia History Modal */}
      <NokiaSnakeHistoryModal
        isOpen={isSnakeHistoryOpen}
        onClose={() => setIsSnakeHistoryOpen(false)}
        lang={lang}
      />

      {/* DOOM (1993) id Software History Modal */}
      <DoomHistoryModal
        isOpen={isDoomHistoryOpen}
        onClose={() => setIsDoomHistoryOpen(false)}
        onPlay={handleLaunchDoom}
        lang={lang}
      />

      {/* Duke Nukem 3D (1996) 3D Realms History Modal */}
      <DukeHistoryModal
        isOpen={isDukeHistoryOpen}
        onClose={() => setIsDukeHistoryOpen(false)}
        onPlay={handleLaunchDuke}
        lang={lang}
      />

      {/* Half-Life (1998) Valve Software History Modal */}
      <HalfLifeHistoryModal
        isOpen={isHalfLifeHistoryOpen}
        onClose={() => setIsHalfLifeHistoryOpen(false)}
        onPlay={handleLaunchHalfLife}
        lang={lang}
      />

      {/* Zaxxon (1982) Sega History Modal */}
      <ZaxxonHistoryModal
        isOpen={isZaxxonHistoryOpen}
        onClose={() => setIsZaxxonHistoryOpen(false)}
        onPlay={handleLaunchZaxxon}
        lang={lang}
      />

      {/* Rocket Raid (1982) Jonathan Griffiths / Acornsoft History Modal */}
      <RocketRaidHistoryModal
        isOpen={isRocketRaidHistoryOpen}
        onClose={() => setIsRocketRaidHistoryOpen(false)}
        onPlay={handleLaunchRocketRaid}
      />

      {/* Q*bert (1983) Superior Software / Gottlieb History Modal */}
      <QbertHistoryModal
        isOpen={isQbertHistoryOpen}
        onClose={() => setIsQbertHistoryOpen(false)}
        onPlay={handleLaunchQbert}
      />

      {/* OutRun (1986) Sega Yu Suzuki History Modal */}
      <OutrunHistoryModal
        isOpen={isOutrunHistoryOpen}
        onClose={() => setIsOutrunHistoryOpen(false)}
        onPlay={handleLaunchOutrun}
      />

      {/* Exile (1988) Peter Irvin & Jeremy Smith / Superior Software History Modal */}
      <ExileHistoryModal
        isOpen={isExileHistoryOpen}
        onClose={() => setIsExileHistoryOpen(false)}
        onPlay={handleLaunchExile}
      />

      {/* Impossible Mission (1984) Dennis Caswell / Epyx C64 History Modal */}
      <ImpossibleMissionHistoryModal
        isOpen={isImpossibleMissionHistoryOpen}
        onClose={() => setIsImpossibleMissionHistoryOpen(false)}
        onPlay={handleLaunchImpossibleMission}
        lang={lang}
      />

      {/* Nintendo Game Boy (1989) DMG-01 History Modal */}
      <GameBoyHistoryModal
        isOpen={isGameBoyHistoryOpen}
        onClose={() => setIsGameBoyHistoryOpen(false)}
        onPlayMario={handleLaunchMarioLand}
        onPlayTetris={handleLaunchTetrisDmg}
        onLaunchGame={(id) => handleLaunchGameById(id as any)}
        lang={lang}
      />

      {/* Nintendo Game Boy Advance SP (2003) History Modal */}
      <GbaHistoryModal
        isOpen={isGbaHistoryOpen}
        onClose={() => setIsGbaHistoryOpen(false)}
        onPlay={() => {
          setIsGbaHistoryOpen(false);
          handleLaunchGbaSp();
        }}
        onPlayGame={(id) => handleLaunchGameById(id as any)}
        lang={lang}
      />

      {/* Sony PlayStation 1 (1994) History Modal */}
      <Ps1HistoryModal
        isOpen={isPs1HistoryOpen}
        onClose={() => setIsPs1HistoryOpen(false)}
        onPlayGame={(id) => handleLaunchGameById(id as any)}
        lang={lang}
      />
    </div>
  );
};
