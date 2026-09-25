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
import { SpyFoxHistoryModal } from './SpyFoxHistoryModal';
import { NightDriverHistoryModal } from './NightDriverHistoryModal';
import { TopografieEuropaHistoryModal } from './TopografieEuropaHistoryModal';
import { LodeRunnerHistoryModal } from './LodeRunnerHistoryModal';
import { ArkanoidHistoryModal } from './ArkanoidHistoryModal';
import { GalagaHistoryModal } from './GalagaHistoryModal';
import { SudokuHistoryModal } from './SudokuHistoryModal';
import { BattleshipHistoryModal } from './BattleshipHistoryModal';
import { MastermindHistoryModal } from './MastermindHistoryModal';
import { PatienceHistoryModal } from './PatienceHistoryModal';
import { HeartsHistoryModal } from './HeartsHistoryModal';
import { FreeCellHistoryModal } from './FreeCellHistoryModal';
import { SpiderHistoryModal } from './SpiderHistoryModal';
import { KlaverjassenHistoryModal } from './KlaverjassenHistoryModal';
import { BlackjackHistoryModal } from './BlackjackHistoryModal';
import { BridgeHistoryModal } from './BridgeHistoryModal';
import { Radarsoft3DTicTacToeHistoryModal } from './Radarsoft3DTicTacToeHistoryModal';
import { StrategoHistoryModal } from './StrategoHistoryModal';
import { KamertjeVerhurenHistoryModal } from './KamertjeVerhurenHistoryModal';
import { ConnectFourHistoryModal } from './ConnectFourHistoryModal';
import { HangmanHistoryModal } from './HangmanHistoryModal';
import { GamepadGuideModal } from './GamepadGuideModal';
import { TiltTouchGuideModal } from './TiltTouchGuideModal';
import { ProjectInfoModal } from './ProjectInfoModal';
import { CookieConsentBanner } from './CookieConsentBanner';
import { ArcadeFloorView } from './ArcadeFloorView';
import { ArcadeTimelineView } from './ArcadeTimelineView';
import { ArcadeSearchBar } from './ArcadeSearchBar';
import { CabinetShowcaseView } from './CabinetShowcaseView';
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
import { getSpaceQuestHighScores } from '../game/spaceQuestHighScores';
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
import { getSudokuHighScores } from '../game/sudokuHighScores';
import { getBattleshipHighScores } from '../game/battleshipHighScores';
import { getMastermindHighScores } from '../game/mastermindHighScores';
import { getPatienceHighScores } from '../game/patienceHighScores';
import { getHeartsHighScores } from '../game/heartsHighScores';
import { getFreeCellHighScores } from '../game/freecellHighScores';
import { getSpiderHighScores } from '../game/spiderHighScores';
import { getKlaverjasHighScores } from '../game/klaverjasHighScores';
import { getBlackjackHighScores } from '../game/blackjackHighScores';
import { getBridgeHighScores } from '../game/bridgeHighScores';
import { getRadarsoftHighScores } from '../game/radarsoft3DTicTacToeHighScores';
import { getStrategoHighScores } from '../game/strategoHighScores';
import { getKamertjeHighScores } from '../game/kamertjeVerhurenHighScores';
import { getConnectFourHighScores } from '../game/connectFourHighScores';
import { getHangmanHighScores } from '../game/hangmanHighScores';
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
import { radarsoftAudio } from '../game/radarsoft3DTicTacToeAudio';
import { strategoAudio } from '../game/strategoAudio';
import { kamertjeAudio } from '../game/kamertjeVerhurenAudio';
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
  const [isSpyFoxHistoryOpen, setIsSpyFoxHistoryOpen] = useState(false);
  const [isNightDriverHistoryOpen, setIsNightDriverHistoryOpen] = useState(false);
  const [isTopografieEuropaHistoryOpen, setIsTopografieEuropaHistoryOpen] = useState(false);
  const [isLodeRunnerHistoryOpen, setIsLodeRunnerHistoryOpen] = useState(false);
  const [isArkanoidHistoryOpen, setIsArkanoidHistoryOpen] = useState(false);
  const [isGalagaHistoryOpen, setIsGalagaHistoryOpen] = useState(false);
  const [isSudokuHistoryOpen, setIsSudokuHistoryOpen] = useState(false);
  const [isBattleshipHistoryOpen, setIsBattleshipHistoryOpen] = useState(false);
  const [isMastermindHistoryOpen, setIsMastermindHistoryOpen] = useState(false);
  const [isPatienceHistoryOpen, setIsPatienceHistoryOpen] = useState(false);
  const [isHeartsHistoryOpen, setIsHeartsHistoryOpen] = useState(false);
  const [isFreeCellHistoryOpen, setIsFreeCellHistoryOpen] = useState(false);
  const [isSpiderHistoryOpen, setIsSpiderHistoryOpen] = useState(false);
  const [isKlaverjassenHistoryOpen, setIsKlaverjassenHistoryOpen] = useState(false);
  const [isBlackjackHistoryOpen, setIsBlackjackHistoryOpen] = useState(false);
  const [isBridgeHistoryOpen, setIsBridgeHistoryOpen] = useState(false);
  const [isRadarsoft3DHistoryOpen, setIsRadarsoft3DHistoryOpen] = useState(false);
  const [isStrategoHistoryOpen, setIsStrategoHistoryOpen] = useState(false);
  const [isKamertjeHistoryOpen, setIsKamertjeHistoryOpen] = useState(false);
  const [isConnectFourHistoryOpen, setIsConnectFourHistoryOpen] = useState(false);
  const [isHangmanHistoryOpen, setIsHangmanHistoryOpen] = useState(false);

  // Xbox & Controller Support
  const [isGamepadConnected, setIsGamepadConnected] = useState(false);
  const [showGamepadGuide, setShowGamepadGuide] = useState(false);
  const [showTiltTouchGuide, setShowTiltTouchGuide] = useState(false);
  const [showProjectInfo, setShowProjectInfo] = useState(false);
  const [projectInfoTab, setProjectInfoTab] = useState<'overview' | 'tech' | 'games' | 'github' | 'legal'>('overview');

  const [highlightedGameId, setHighlightedGameId] = useState<string | null>(null);

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
  const pacmanTopDate = pacmanScores.length > 0 && pacmanScores[0].date ? pacmanScores[0].date : '1980-05-22';

  const spaceScores = getSpaceHighScores();
  const spaceTopScore = spaceScores.length > 0 ? spaceScores[0].score : 0;
  const spaceTopInitials = spaceScores.length > 0 ? spaceScores[0].initials : 'TAI';
  const spaceTopDate = spaceScores.length > 0 && spaceScores[0].date ? spaceScores[0].date : '1978-06-01';

  const demonScores = getDemonHighScores();
  const demonTopScore = demonScores.length > 0 ? demonScores[0].score : 0;
  const demonTopInitials = demonScores.length > 0 ? demonScores[0].initials : 'IMG';
  const demonTopDate = demonScores.length > 0 && (demonScores[0] as any).date ? (demonScores[0] as any).date : '1982-08-15';

  const reptonScores = getReptonHighScores();
  const reptonTopScore = reptonScores.length > 0 ? reptonScores[0].score : 0;
  const reptonTopInitials = reptonScores.length > 0 ? reptonScores[0].initials : 'REP';
  const reptonTopDate = reptonScores.length > 0 && (reptonScores[0] as any).date ? (reptonScores[0] as any).date : '1985-11-01';

  const eindeloosScores = getEindeloosHighScores();
  const eindeloosTopScore = eindeloosScores.length > 0 ? eindeloosScores[0].score : 18500;
  const eindeloosTopInitials = eindeloosScores.length > 0 ? eindeloosScores[0].initials : 'JVA';
  const eindeloosTopDate = eindeloosScores.length > 0 && eindeloosScores[0].date ? eindeloosScores[0].date : '1985-04-12';

  const froggerScores = getFroggerHighScores();
  const froggerTopScore = froggerScores.length > 0 ? froggerScores[0].score : 4850;
  const froggerTopInitials = froggerScores.length > 0 ? froggerScores[0].initials : 'EDW';
  const froggerTopDate = froggerScores.length > 0 && froggerScores[0].date ? froggerScores[0].date : '1982-10-12';

  const chuckieScores = getChuckieEggHighScores();
  const chuckieTopScore = chuckieScores.length > 0 ? chuckieScores[0].score : 18450;
  const chuckieTopInitials = chuckieScores.length > 0 ? chuckieScores[0].initials : 'NGA';
  const chuckieTopDate = chuckieScores.length > 0 && chuckieScores[0].date ? chuckieScores[0].date : '1983-09-12';

  const frakScores = getFrakHighScores();
  const frakTopScore = frakScores.length > 0 ? frakScores[0].score : 24850;
  const frakTopInitials = frakScores.length > 0 ? frakScores[0].initials : 'N.P';
  const frakTopDate = frakScores.length > 0 && (frakScores[0] as any).date ? (frakScores[0] as any).date : '1984-06-12';

  const arcadiansScores = getArcadiansHighScores();
  const arcadiansTopScore = arcadiansScores.length > 0 ? arcadiansScores[0].score : 32450;
  const arcadiansTopInitials = arcadiansScores.length > 0 ? arcadiansScores[0].initials : 'N.P';
  const arcadiansTopDate = arcadiansScores.length > 0 && (arcadiansScores[0] as any).date ? (arcadiansScores[0] as any).date : '1982-10-12';

  const tetrisScores = getTetrisHighScores();
  const tetrisTopScore = tetrisScores.length > 0 ? tetrisScores[0].score : 125000;
  const tetrisTopInitials = tetrisScores.length > 0 ? tetrisScores[0].initials : 'ALP';
  const tetrisTopDate = tetrisScores.length > 0 && (tetrisScores[0] as any).date ? (tetrisScores[0] as any).date : '1984-06-06';

  const kingsQuestScores = getKingsQuestHighScores();
  const kingsQuestTopScore = kingsQuestScores.length > 0 ? kingsQuestScores[0].score : 158;
  const kingsQuestTopInitials = kingsQuestScores.length > 0 ? kingsQuestScores[0].initials : 'RBW';
  const kingsQuestTopDate = kingsQuestScores.length > 0 && kingsQuestScores[0].date ? kingsQuestScores[0].date : '1984-05-10';

  const spaceQuestScores = getSpaceQuestHighScores();
  const spaceQuestTopScore = spaceQuestScores.length > 0 ? `${spaceQuestScores[0].score}/220` : '220/220';
  const spaceQuestTopInitials = spaceQuestScores.length > 0 ? spaceQuestScores[0].initials : 'RGW';
  const spaceQuestTopDate = spaceQuestScores.length > 0 && spaceQuestScores[0].date ? spaceQuestScores[0].date : '1986-10-18';

  const marioScores = getMarioHighScores();
  const marioTopScore = marioScores.length > 0 ? marioScores[0].score : 48900;
  const marioTopInitials = marioScores.length > 0 ? marioScores[0].initials : 'MAR';
  const marioTopDate = marioScores.length > 0 && marioScores[0].date ? marioScores[0].date : '1983-07-14';

  const superMarioScores = getSuperMarioScores();
  const superMarioTopScore = superMarioScores.length > 0 ? superMarioScores[0].score : 85200;
  const superMarioTopInitials = superMarioScores.length > 0 ? superMarioScores[0].initials : 'SHI';
  const superMarioTopDate = superMarioScores.length > 0 && superMarioScores[0].date ? superMarioScores[0].date : '1985-09-13';

  const wolfScores = getWolfScores();
  const wolfTopScore = wolfScores.length > 0 ? wolfScores[0].score : 64200;
  const wolfTopInitials = wolfScores.length > 0 ? wolfScores[0].initials : 'BJB';
  const wolfTopDate = wolfScores.length > 0 && wolfScores[0].date ? wolfScores[0].date : '1992-05-05';

  const c64PinballScores = getC64PinballScores();
  const c64PinballTopScore = c64PinballScores.length > 0 ? c64PinballScores[0].score : 185000;
  const c64PinballTopInitials = c64PinballScores.length > 0 ? c64PinballScores[0].initials : 'SW.';
  const c64PinballTopDate = c64PinballScores.length > 0 && c64PinballScores[0].date ? c64PinballScores[0].date : '1989-10-14';

  const templeRunScores = getTempleRunScores();
  const templeRunTopScore = templeRunScores.length > 0 ? templeRunScores[0].score : 1254000;
  const templeRunTopInitials = templeRunScores.length > 0 ? templeRunScores[0].initials : 'GUY';
  const templeRunTopDate = templeRunScores.length > 0 && templeRunScores[0].date ? templeRunScores[0].date : '2011-08-04';

  const lemmingsScores = getLemmingsScores();
  const lemmingsTopScore = lemmingsScores.length > 0 ? lemmingsScores[0].score : 4850;
  const lemmingsTopInitials = lemmingsScores.length > 0 ? lemmingsScores[0].initials : 'DMA';
  const lemmingsTopDate = lemmingsScores.length > 0 && (lemmingsScores[0] as any).date ? (lemmingsScores[0] as any).date : '1991-02-14';

  const manicMinerScores = getManicMinerScores();
  const manicMinerTopScore = manicMinerScores.length > 0 ? manicMinerScores[0].score : 19830;
  const manicMinerTopInitials = manicMinerScores.length > 0 ? manicMinerScores[0].initials : 'MSM';
  const manicMinerTopDate = manicMinerScores.length > 0 && manicMinerScores[0].date ? manicMinerScores[0].date : '1983-06-15';

  const monsterMazeScores = getMonsterMazeScores();
  const monsterMazeTopScore = monsterMazeScores.length > 0 ? monsterMazeScores[0].score : 3200;
  const monsterMazeTopInitials = monsterMazeScores.length > 0 ? monsterMazeScores[0].initials : 'EVN';
  const monsterMazeTopDate = monsterMazeScores.length > 0 && monsterMazeScores[0].date ? monsterMazeScores[0].date : '1981-12-01';

  const asteroidsScores = getAsteroidsScores();
  const asteroidsTopScore = asteroidsScores.length > 0 ? asteroidsScores[0].score : 99990;
  const asteroidsTopInitials = asteroidsScores.length > 0 ? asteroidsScores[0].initials : 'EDL';
  const asteroidsTopDate = asteroidsScores.length > 0 && asteroidsScores[0].date ? asteroidsScores[0].date : '1979-11-20';

  const princeScores = getPrinceScores();
  const princeTopScore = princeScores.length > 0 ? `${princeScores[0].minutesRemaining}:${princeScores[0].secondsRemaining.toString().padStart(2, '0')}` : '54:22';
  const princeTopInitials = princeScores.length > 0 ? princeScores[0].initials : 'JDM';
  const princeTopDate = princeScores.length > 0 && princeScores[0].date ? princeScores[0].date : '1989-10-03';

  const donkeyKongScores = getDonkeyKongHighScores();
  const donkeyKongTopScore = donkeyKongScores.length > 0 ? donkeyKongScores[0].score : 87400;
  const donkeyKongTopInitials = donkeyKongScores.length > 0 ? donkeyKongScores[0].initials : 'DKG';
  const donkeyKongTopDate = donkeyKongScores.length > 0 && donkeyKongScores[0].date ? donkeyKongScores[0].date : '1981-07-09';

  const doubleDragonScores = getDoubleDragonScores();
  const doubleDragonTopScore = doubleDragonScores.length > 0 ? doubleDragonScores[0].score : 48500;
  const doubleDragonTopInitials = doubleDragonScores.length > 0 ? doubleDragonScores[0].initials : 'BLY';
  const doubleDragonTopDate = doubleDragonScores.length > 0 && doubleDragonScores[0].date ? doubleDragonScores[0].date : '1987-07-15';

  const snakeScores = getNokiaSnakeScores();
  const snakeTopScore = snakeScores.length > 0 ? snakeScores[0].score : 384;
  const snakeTopInitials = snakeScores.length > 0 ? snakeScores[0].initials : 'NOK';
  const snakeTopDate = snakeScores.length > 0 && snakeScores[0].date ? snakeScores[0].date : '1997-12-15';

  const doomScores = getDoomScores();
  const doomTopScore = doomScores.length > 0 ? doomScores[0].score : 14500;
  const doomTopInitials = doomScores.length > 0 ? doomScores[0].name : 'FLY';
  const doomTopDate = doomScores.length > 0 && doomScores[0].date ? doomScores[0].date : '1993-12-10';

  const dukeScores = getDukeScores();
  const dukeTopScore = dukeScores.length > 0 ? dukeScores[0].score : 19960;
  const dukeTopInitials = dukeScores.length > 0 ? dukeScores[0].name : 'DUK';
  const dukeTopDate = dukeScores.length > 0 && dukeScores[0].date ? dukeScores[0].date : '1996-01-29';

  const halfLifeScores = getHalfLifeScores();
  const halfLifeTopScore = halfLifeScores.length > 0 ? halfLifeScores[0].score : 18500;
  const halfLifeTopInitials = halfLifeScores.length > 0 ? halfLifeScores[0].name : 'FRE';
  const halfLifeTopDate = halfLifeScores.length > 0 && halfLifeScores[0].date ? halfLifeScores[0].date : '1998-11-19';

  const zaxxonScores = getZaxxonScores();
  const zaxxonTopScore = zaxxonScores.length > 0 ? zaxxonScores[0].score : 88400;
  const zaxxonTopInitials = zaxxonScores.length > 0 ? zaxxonScores[0].initials : 'SEG';
  const zaxxonTopDate = zaxxonScores.length > 0 && zaxxonScores[0].date ? zaxxonScores[0].date : '1982-04-12';

  const rocketRaidScores = getRocketRaidScores();
  const rocketRaidTopScore = rocketRaidScores.length > 0 ? rocketRaidScores[0].score : 28450;
  const rocketRaidTopInitials = rocketRaidScores.length > 0 ? rocketRaidScores[0].initials : 'J.G';
  const rocketRaidTopDate = rocketRaidScores.length > 0 && (rocketRaidScores[0] as any).date ? (rocketRaidScores[0] as any).date : '1982-10-14';

  const qbertScores = getQbertScores();
  const qbertTopScore = qbertScores.length > 0 ? qbertScores[0].score : 24850;
  const qbertTopInitials = qbertScores.length > 0 ? qbertScores[0].initials : 'WAR';
  const qbertTopDate = qbertScores.length > 0 && (qbertScores[0] as any).date ? (qbertScores[0] as any).date : '1983-04-12';

  const outrunScores = getOutrunScores();
  const outrunTopScore = outrunScores.length > 0 ? outrunScores[0].score : 18450200;
  const outrunTopInitials = outrunScores.length > 0 ? outrunScores[0].initials : 'YU.';
  const outrunTopDate = outrunScores.length > 0 && (outrunScores[0] as any).date ? (outrunScores[0] as any).date : '1986-09-20';

  const exileScores = getExileHighScores();
  const exileTopScore = exileScores.length > 0 ? exileScores[0].score : 32500;
  const exileTopInitials = exileScores.length > 0 ? exileScores[0].name : 'FINN';
  const exileTopDate = exileScores.length > 0 && exileScores[0].date ? exileScores[0].date : '1988-10-14';

  const impossibleMissionScores = getImpossibleMissionScores();
  const impossibleMissionTopScore = impossibleMissionScores.length > 0 ? `${impossibleMissionScores[0].remainingSeconds}s` : '16820s';
  const impossibleMissionTopInitials = impossibleMissionScores.length > 0 ? impossibleMissionScores[0].initials : 'EPX';
  const impossibleMissionTopDate = impossibleMissionScores.length > 0 && impossibleMissionScores[0].date ? impossibleMissionScores[0].date : '1984-04-12';

  const marioLandScores = getMarioLandScores();
  const marioLandTopScore = marioLandScores.length > 0 ? marioLandScores[0].score : 28500;
  const marioLandTopInitials = marioLandScores.length > 0 ? marioLandScores[0].initials : 'MAR';
  const marioLandTopDate = marioLandScores.length > 0 && marioLandScores[0].date ? marioLandScores[0].date : '1989-04-21';

  const tetrisDmgScores = getTetrisScores();
  const tetrisDmgTopScore = tetrisDmgScores.length > 0 ? tetrisDmgScores[0].score : 54200;
  const tetrisDmgTopInitials = tetrisDmgScores.length > 0 ? tetrisDmgScores[0].initials : 'ALX';
  const tetrisDmgTopDate = tetrisDmgScores.length > 0 && tetrisDmgScores[0].date ? tetrisDmgScores[0].date : '1989-04-21';

  const sudokuScores = getSudokuHighScores();
  const sudokuTopScore = sudokuScores.length > 0 ? `${sudokuScores[0].score} PTS` : '9850 PTS';
  const sudokuTopInitials = sudokuScores.length > 0 ? sudokuScores[0].initials : 'MAKI';
  const sudokuTopDate = sudokuScores.length > 0 && sudokuScores[0].date ? sudokuScores[0].date : '1984-04-15';

  const battleshipScores = getBattleshipHighScores();
  const battleshipTopScore = battleshipScores.length > 0 ? `${battleshipScores[0].score} PTS` : '11450 PTS';
  const battleshipTopInitials = battleshipScores.length > 0 ? battleshipScores[0].initials : 'ADMR';
  const battleshipTopDate = battleshipScores.length > 0 && battleshipScores[0].date ? battleshipScores[0].date : '1982-04-12';

  const mastermindScores = getMastermindHighScores();
  const mastermindTopScore = mastermindScores.length > 0 ? `${mastermindScores[0].score} PTS` : '18450 PTS';
  const mastermindTopInitials = mastermindScores.length > 0 ? mastermindScores[0].initials : 'MMW';
  const mastermindTopDate = mastermindScores.length > 0 && mastermindScores[0].date ? mastermindScores[0].date : '1971-04-12';

  const patienceScores = getPatienceHighScores();
  const patienceTopScore = patienceScores.length > 0 ? `${patienceScores[0].score} PTS` : '7280 PTS';
  const patienceTopInitials = patienceScores.length > 0 ? patienceScores[0].initials : 'WES';
  const patienceTopDate = patienceScores.length > 0 && patienceScores[0].date ? patienceScores[0].date : '1990-05-22';

  const heartsScores = getHeartsHighScores();
  const heartsTopScore = heartsScores.length > 0 ? `${heartsScores[0].score} PT` : '18 PT';
  const heartsTopInitials = heartsScores.length > 0 ? heartsScores[0].initials : 'POL';
  const heartsTopDate = heartsScores.length > 0 && heartsScores[0].date ? heartsScores[0].date : '1992-10-27';

  const freeCellScores = getFreeCellHighScores();
  const freeCellTopScore = freeCellScores.length > 0 ? `${freeCellScores[0].moves} M` : '82 M';
  const freeCellTopInitials = freeCellScores.length > 0 ? freeCellScores[0].initials : 'JIM';
  const freeCellTopDate = freeCellScores.length > 0 && freeCellScores[0].date ? freeCellScores[0].date : '1991-08-15';

  const spiderScores = getSpiderHighScores();
  const spiderTopScore = spiderScores.length > 0 ? `${spiderScores[0].score} PTS` : '1080 PTS';
  const spiderTopInitials = spiderScores.length > 0 ? spiderScores[0].initials : 'JAB';
  const spiderTopDate = spiderScores.length > 0 && spiderScores[0].date ? spiderScores[0].date : '1998-06-25';

  const klaverjasScores = getKlaverjasHighScores();
  const klaverjasTopScore = klaverjasScores.length > 0 ? `${klaverjasScores[0].scoreWij} P` : '1742 P';
  const klaverjasTopInitials = klaverjasScores.length > 0 ? klaverjasScores[0].initials : 'HNK';
  const klaverjasTopDate = klaverjasScores.length > 0 && klaverjasScores[0].date ? klaverjasScores[0].date : '1985-09-12';

  const blackjackScores = getBlackjackHighScores();
  const blackjackTopScore = blackjackScores.length > 0 ? `€${blackjackScores[0].bankroll}` : '€4850';
  const blackjackTopInitials = blackjackScores.length > 0 ? blackjackScores[0].initials : 'EOT';
  const blackjackTopDate = blackjackScores.length > 0 && blackjackScores[0].date ? blackjackScores[0].date : '1962-11-15';

  const bridgeScores = getBridgeHighScores();
  const bridgeTopScore = bridgeScores.length > 0 ? `+${bridgeScores[0].resultScore} PT` : '+2220 PT';
  const bridgeTopInitials = bridgeScores.length > 0 ? bridgeScores[0].initials : 'HV';
  const bridgeTopDate = bridgeScores.length > 0 && bridgeScores[0].date ? bridgeScores[0].date : '1925-11-01';

  const radarsoftScores = getRadarsoftHighScores();
  const radarsoftTopScore = radarsoftScores.length > 0 ? `${radarsoftScores[0].score} PTS` : '1984 PTS';
  const radarsoftTopInitials = radarsoftScores.length > 0 ? radarsoftScores[0].initials : 'DRJ';
  const radarsoftTopDate = radarsoftScores.length > 0 && radarsoftScores[0].date ? radarsoftScores[0].date : '1984-06-15';

  const strategoScores = getStrategoHighScores();
  const strategoTopScore = strategoScores.length > 0 ? `${strategoScores[0].score} PTS` : '3450 PTS';
  const strategoTopInitials = strategoScores.length > 0 ? strategoScores[0].initials : 'MOG';
  const strategoTopDate = strategoScores.length > 0 && strategoScores[0].date ? strategoScores[0].date : '1947-04-20';

  const kamertjeScores = getKamertjeHighScores();
  const kamertjeTopScore = kamertjeScores.length > 0 ? `${kamertjeScores[0].percentage}%` : '88%';
  const kamertjeTopInitials = kamertjeScores.length > 0 ? kamertjeScores[0].initials : 'LUC';
  const kamertjeTopDate = kamertjeScores.length > 0 && kamertjeScores[0].date ? kamertjeScores[0].date : '1895-03-14';

  const connectFourScores = getConnectFourHighScores();
  const connectFourTopScore = connectFourScores.length > 0 ? `${connectFourScores[0].score} PTS` : '3000 PTS';
  const connectFourTopInitials = connectFourScores.length > 0 ? connectFourScores[0].initials : 'MB';
  const connectFourTopDate = connectFourScores.length > 0 && connectFourScores[0].date ? connectFourScores[0].date : '1974-05-10';

  const hangmanScores = getHangmanHighScores();
  const hangmanTopScore = hangmanScores.length > 0 ? `${hangmanScores[0].score} PTS` : '3250 PTS';
  const hangmanTopInitials = hangmanScores.length > 0 ? hangmanScores[0].initials : 'WRD';
  const hangmanTopDate = hangmanScores.length > 0 && hangmanScores[0].date ? hangmanScores[0].date : '1894-05-12';

  const handleLaunchKamertje = () => {
    haptics.powerPellet();
    kamertjeAudio.playPenDraw();
    onSelectGame('kamertje_verhuren');
  };

  const handleLaunchRadarsoft3D = () => {
    haptics.powerPellet();
    radarsoftAudio.playPlacePiece('X');
    onSelectGame('radarsoft_3d_ttt');
  };

  const handleLaunchStratego = () => {
    haptics.powerPellet();
    strategoAudio.playBattleClash();
    onSelectGame('stratego');
  };

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

  const handleLaunchNightDriver = () => {
    haptics.powerPellet();
    onSelectGame('night_driver');
  };

  const highScoresMap: Record<string, { score: number | string; initials: string; date?: string }> = useMemo(() => ({
    space_invaders: { score: spaceTopScore, initials: spaceTopInitials, date: spaceTopDate },
    pacman: { score: pacmanTopScore, initials: pacmanTopInitials, date: pacmanTopDate },
    donkey_kong: { score: donkeyKongTopScore, initials: donkeyKongTopInitials, date: donkeyKongTopDate },
    arcadians: { score: arcadiansTopScore, initials: arcadiansTopInitials, date: arcadiansTopDate },
    demon_attack: { score: demonTopScore, initials: demonTopInitials, date: demonTopDate },
    frogger: { score: froggerTopScore, initials: froggerTopInitials, date: froggerTopDate },
    chuckie_egg: { score: chuckieTopScore, initials: chuckieTopInitials, date: chuckieTopDate },
    frak: { score: frakTopScore, initials: frakTopInitials, date: frakTopDate },
    repton: { score: reptonTopScore, initials: reptonTopInitials, date: reptonTopDate },
    eindeloos: { score: eindeloosTopScore, initials: eindeloosTopInitials, date: eindeloosTopDate },
    tetris: { score: tetrisTopScore, initials: tetrisTopInitials, date: tetrisTopDate },
    kings_quest: { score: `${kingsQuestTopScore}/158`, initials: kingsQuestTopInitials, date: kingsQuestTopDate },
    space_quest: { score: spaceQuestTopScore, initials: spaceQuestTopInitials, date: spaceQuestTopDate },
    pong: { score: `${getPongStats().longestRally} RALLY`, initials: 'ATA', date: '1972-11-29' },
    battle_chess: { score: `${getBattleChessStats().whiteWins} WINS`, initials: 'INT', date: '1988-10-15' },
    mario: { score: marioTopScore, initials: marioTopInitials, date: marioTopDate },
    super_mario: { score: superMarioTopScore, initials: superMarioTopInitials, date: superMarioTopDate },
    wolfenstein: { score: wolfTopScore, initials: wolfTopInitials, date: wolfTopDate },
    c64_pinball: { score: c64PinballTopScore, initials: c64PinballTopInitials, date: c64PinballTopDate },
    temple_run: { score: templeRunTopScore, initials: templeRunTopInitials, date: templeRunTopDate },
    lemmings: { score: lemmingsTopScore, initials: lemmingsTopInitials, date: lemmingsTopDate },
    manic_miner: { score: manicMinerTopScore, initials: manicMinerTopInitials, date: manicMinerTopDate },
    monster_maze: { score: monsterMazeTopScore, initials: monsterMazeTopInitials, date: monsterMazeTopDate },
    asteroids: { score: asteroidsTopScore, initials: asteroidsTopInitials, date: asteroidsTopDate },
    prince: { score: princeTopScore, initials: princeTopInitials, date: princeTopDate },
    double_dragon: { score: doubleDragonTopScore, initials: doubleDragonTopInitials, date: doubleDragonTopDate },
    snake: { score: snakeTopScore, initials: snakeTopInitials, date: snakeTopDate },
    doom: { score: doomTopScore, initials: doomTopInitials, date: doomTopDate },
    duke: { score: dukeTopScore, initials: dukeTopInitials, date: dukeTopDate },
    half_life: { score: halfLifeTopScore, initials: halfLifeTopInitials, date: halfLifeTopDate },
    zaxxon: { score: zaxxonTopScore, initials: zaxxonTopInitials, date: zaxxonTopDate },
    rocket_raid: { score: rocketRaidTopScore, initials: rocketRaidTopInitials, date: rocketRaidTopDate },
    qbert: { score: qbertTopScore, initials: qbertTopInitials, date: qbertTopDate },
    outrun: { score: outrunTopScore, initials: outrunTopInitials, date: outrunTopDate },
    exile: { score: exileTopScore, initials: exileTopInitials, date: exileTopDate },
    impossible_mission: { score: impossibleMissionTopScore, initials: impossibleMissionTopInitials, date: impossibleMissionTopDate },
    mario_land: { score: marioLandTopScore, initials: marioLandTopInitials, date: marioLandTopDate },
    tetris_dmg: { score: tetrisDmgTopScore, initials: tetrisDmgTopInitials, date: tetrisDmgTopDate },
    dr_mario: { score: 48500, initials: 'DOC', date: '1990-07-27' },
    metroid_2: { score: '39 MT', initials: 'SAM', date: '1991-11-01' },
    kirby_dream_land: { score: 62400, initials: 'KBY', date: '1992-04-27' },
    mario_land_2: { score: 99990, initials: 'MAR', date: '1992-10-21' },
    zelda_links_awakening: { score: '8 INSTR', initials: 'LNK', date: '1993-06-06' },
    donkey_kong_94: { score: 101000, initials: 'DKG', date: '1994-06-14' },
    pokemon_red: { score: '151 PK', initials: 'RED', date: '1996-02-27' },
    wario_land_2: { score: 99999, initials: 'WAR', date: '1998-03-01' },
    gba_sp: { score: 9999, initials: 'GBA', date: '2003-02-14' },
    pokemon_emerald: { score: '386 PK', initials: 'EME', date: '2004-09-16' },
    mario_advance: { score: 999990, initials: 'MAR', date: '2003-10-21' },
    zelda_minish: { score: 'FOUR SWORD', initials: 'LNK', date: '2004-11-04' },
    ps1: { score: '100% CD', initials: 'PS1', date: '1994-12-03' },
    crash_bandicoot: { score: '100% GEM', initials: 'CRH', date: '1996-09-09' },
    ridge_racer: { score: "1'12\"45", initials: 'RAC', date: '1994-12-03' },
    spy_fox: { score: '100% MILK', initials: 'FOX', date: '1997-10-17' },
    night_driver: { score: '780 PTS', initials: 'BUD', date: '1976-10-01' },
    topografie_europa: { score: '1050 PTS', initials: 'RAD', date: '1984-05-15' },
    lode_runner: { score: '15400 PTS', initials: 'DGS', date: '1983-06-23' },
    arkanoid: { score: '18500 PTS', initials: 'TAI', date: '1986-07-15' },
    galaga: { score: '24890 PTS', initials: 'NAM', date: '1981-09-01' },
    sudoku: { score: sudokuTopScore, initials: sudokuTopInitials, date: sudokuTopDate },
    battleship: { score: battleshipTopScore, initials: battleshipTopInitials, date: battleshipTopDate },
    mastermind: { score: mastermindTopScore, initials: mastermindTopInitials, date: mastermindTopDate },
    patience: { score: patienceTopScore, initials: patienceTopInitials, date: patienceTopDate },
    hearts: { score: heartsTopScore, initials: heartsTopInitials, date: heartsTopDate },
    freecell: { score: freeCellTopScore, initials: freeCellTopInitials, date: freeCellTopDate },
    spider_solitaire: { score: spiderTopScore, initials: spiderTopInitials, date: spiderTopDate },
    klaverjassen: { score: klaverjasTopScore, initials: klaverjasTopInitials, date: klaverjasTopDate },
    blackjack: { score: blackjackTopScore, initials: blackjackTopInitials, date: blackjackTopDate },
    bridge: { score: bridgeTopScore, initials: bridgeTopInitials, date: bridgeTopDate },
    radarsoft_3d_ttt: { score: radarsoftTopScore, initials: radarsoftTopInitials, date: radarsoftTopDate },
    stratego: { score: strategoTopScore, initials: strategoTopInitials, date: strategoTopDate },
    kamertje_verhuren: { score: kamertjeTopScore, initials: kamertjeTopInitials, date: kamertjeTopDate },
    connect_four: { score: connectFourTopScore, initials: connectFourTopInitials, date: connectFourTopDate },
    hangman: { score: hangmanTopScore, initials: hangmanTopInitials, date: hangmanTopDate },
  }), [
    spaceTopScore, spaceTopInitials, spaceTopDate, pacmanTopScore, pacmanTopInitials, pacmanTopDate,
    donkeyKongTopScore, donkeyKongTopInitials, donkeyKongTopDate,
    arcadiansTopScore, arcadiansTopInitials, arcadiansTopDate, demonTopScore, demonTopInitials, demonTopDate,
    froggerTopScore, froggerTopInitials, froggerTopDate, chuckieTopScore, chuckieTopInitials, chuckieTopDate,
    frakTopScore, frakTopInitials, frakTopDate,
    reptonTopScore, reptonTopInitials, reptonTopDate, eindeloosTopScore, eindeloosTopInitials, eindeloosTopDate,
    tetrisTopScore, tetrisTopInitials, tetrisTopDate, kingsQuestTopScore, kingsQuestTopInitials, kingsQuestTopDate,
    spaceQuestTopScore, spaceQuestTopInitials, spaceQuestTopDate,
    marioTopScore, marioTopInitials, marioTopDate, superMarioTopScore, superMarioTopInitials, superMarioTopDate,
    wolfTopScore, wolfTopInitials, wolfTopDate, c64PinballTopScore, c64PinballTopInitials, c64PinballTopDate,
    templeRunTopScore, templeRunTopInitials, templeRunTopDate, lemmingsTopScore, lemmingsTopInitials, lemmingsTopDate,
    manicMinerTopScore, manicMinerTopInitials, manicMinerTopDate, monsterMazeTopScore, monsterMazeTopInitials, monsterMazeTopDate,
    asteroidsTopScore, asteroidsTopInitials, asteroidsTopDate,
    princeTopScore, princeTopInitials, princeTopDate,
    doubleDragonTopScore, doubleDragonTopInitials, doubleDragonTopDate,
    snakeTopScore, snakeTopInitials, snakeTopDate,
    doomTopScore, doomTopInitials, doomTopDate,
    dukeTopScore, dukeTopInitials, dukeTopDate,
    halfLifeTopScore, halfLifeTopInitials, halfLifeTopDate,
    zaxxonTopScore, zaxxonTopInitials, zaxxonTopDate,
    rocketRaidTopScore, rocketRaidTopInitials, rocketRaidTopDate,
    qbertTopScore, qbertTopInitials, qbertTopDate,
    outrunTopScore, outrunTopInitials, outrunTopDate,
    exileTopScore, exileTopInitials, exileTopDate,
    impossibleMissionTopScore, impossibleMissionTopInitials, impossibleMissionTopDate,
    marioLandTopScore, marioLandTopInitials, marioLandTopDate,
    tetrisDmgTopScore, tetrisDmgTopInitials, tetrisDmgTopDate,
    sudokuTopScore, sudokuTopInitials, sudokuTopDate,
    battleshipTopScore, battleshipTopInitials, battleshipTopDate,
    mastermindTopScore, mastermindTopInitials, mastermindTopDate,
    patienceTopScore, patienceTopInitials, patienceTopDate,
    heartsTopScore, heartsTopInitials, heartsTopDate,
    freeCellTopScore, freeCellTopInitials, freeCellTopDate,
    spiderTopScore, spiderTopInitials, spiderTopDate,
    klaverjasTopScore, klaverjasTopInitials, klaverjasTopDate,
    blackjackTopScore, blackjackTopInitials, blackjackTopDate,
    bridgeTopScore, bridgeTopInitials, bridgeTopDate,
    radarsoftTopScore, radarsoftTopInitials, radarsoftTopDate,
    strategoTopScore, strategoTopInitials, strategoTopDate,
    kamertjeTopScore, kamertjeTopInitials, kamertjeTopDate
  ]);

  const filteredGames = useMemo(() => {
    return GAMES_METADATA.filter(game => {
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'card_games') {
          const cardGameIds = new Set(['patience', 'freecell', 'spider_solitaire', 'hearts', 'tripeaks', 'klaverjassen', 'video_poker', 'blackjack', 'bridge']);
          if (!cardGameIds.has(game.id) && game.category !== 'card_games') return false;
        } else if (selectedCategory === 'arcade') {
          const arcadeIds = new Set(['pong', 'space_invaders', 'asteroids', 'pacman', 'donkey_kong', 'frogger', 'mario', 'doom', 'duke', 'zaxxon', 'qbert', 'outrun', 'arkanoid', 'galaga']);
          if (!arcadeIds.has(game.id)) return false;
        } else if (selectedCategory === 'brain_logic') {
          const brainIds = new Set(['sudoku', 'battleship', 'mastermind', 'battle_chess', 'tetris', 'tetris_dmg', 'dr_mario', 'topografie_europa', 'patience', 'bridge', 'radarsoft_3d_ttt', 'stratego', 'kamertje_verhuren', 'connect_four', 'hangman']);
          if (!brainIds.has(game.id) && game.category !== 'brain_logic' && game.category !== 'card_games') return false;
        } else if (selectedCategory === 'micro') {
          const microIds = new Set(['arcadians', 'rocket_raid', 'qbert', 'chuckie_egg', 'frak', 'repton', 'eindeloos', 'monster_maze', 'manic_miner', 'exile', 'night_driver', 'topografie_europa', 'lode_runner', 'radarsoft_3d_ttt']);
          if (!microIds.has(game.id)) return false;
        } else if (selectedCategory === 'apple_ii') {
          if (game.system !== 'apple_ii' && game.id !== 'night_driver' && game.id !== 'lode_runner') return false;
        } else if (selectedCategory === 'adventure') {
          const advIds = new Set(['kings_quest', 'space_quest', 'tetris', 'wolfenstein', 'prince', 'doom', 'exile', 'impossible_mission', 'spy_fox']);
          if (!advIds.has(game.id)) return false;
        } else if (selectedCategory === 'c64') {
          const c64Ids = new Set(['battle_chess', 'c64_pinball', 'lemmings', 'impossible_mission', 'eindeloos', 'topografie_europa', 'radarsoft_3d_ttt']);
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
      case 'spy_fox':
      case 'night_driver':
      case 'topografie_europa':
      case 'lode_runner':
      case 'arkanoid':
      case 'galaga':
      case 'sudoku':
      case 'battleship':
      case 'mastermind':
      case 'patience':
      case 'hearts':
      case 'freecell':
      case 'spider_solitaire':
      case 'klaverjassen':
      case 'blackjack':
      case 'bridge':
      case 'radarsoft_3d_ttt':
      case 'stratego':
      case 'kamertje_verhuren':
      case 'connect_four':
        haptics.powerPellet();
        onSelectGame(gameId);
        break;
      default:
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
      case 'spy_fox':
        setIsSpyFoxHistoryOpen(true);
        break;
      case 'night_driver':
        setIsNightDriverHistoryOpen(true);
        break;
      case 'topografie_europa':
        setIsTopografieEuropaHistoryOpen(true);
        break;
      case 'lode_runner':
        setIsLodeRunnerHistoryOpen(true);
        break;
      case 'arkanoid':
        setIsArkanoidHistoryOpen(true);
        break;
      case 'galaga':
        setIsGalagaHistoryOpen(true);
        break;
      case 'sudoku':
        setIsSudokuHistoryOpen(true);
        break;
      case 'battleship':
        setIsBattleshipHistoryOpen(true);
        break;
      case 'mastermind':
        setIsMastermindHistoryOpen(true);
        break;
      case 'patience':
        setIsPatienceHistoryOpen(true);
        break;
      case 'hearts':
        setIsHeartsHistoryOpen(true);
        break;
      case 'freecell':
        setIsFreeCellHistoryOpen(true);
        break;
      case 'spider_solitaire':
        setIsSpiderHistoryOpen(true);
        break;
      case 'klaverjassen':
        setIsKlaverjassenHistoryOpen(true);
        break;
      case 'blackjack':
        setIsBlackjackHistoryOpen(true);
        break;
      case 'bridge':
        setIsBridgeHistoryOpen(true);
        break;
      case 'radarsoft_3d_ttt':
        setIsRadarsoft3DHistoryOpen(true);
        break;
      case 'stratego':
        setIsStrategoHistoryOpen(true);
        break;
      case 'kamertje_verhuren':
        setIsKamertjeHistoryOpen(true);
        break;
      case 'connect_four':
        setIsConnectFourHistoryOpen(true);
        break;
      case 'hangman':
        setIsHangmanHistoryOpen(true);
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

  // Sync active view selection index with available filtered games list
  useEffect(() => {
    if (filteredGames.length > 0) {
      const exists = filteredGames.some(g => g.id === highlightedGameId);
      if (!exists) {
        setHighlightedGameId(filteredGames[0].id);
      }
    } else {
      setHighlightedGameId(null);
    }
  }, [filteredGames, highlightedGameId]);

  // Keep a ref in sync with state to avoid effect reconstruction on game selection
  const highlightedGameIdRef = React.useRef<string | null>(null);
  useEffect(() => {
    highlightedGameIdRef.current = highlightedGameId;
  }, [highlightedGameId]);

  const prevPressedButtonsRef = React.useRef<Set<string>>(new Set());
  const lastStickDirTimeRef = React.useRef<number>(0);

  // High-precision Gamepad polling loop for Lobby / Home page navigation (No reconstruction dependency on highlightedGameId)
  useEffect(() => {
    let animFrameId: number;

    const pollGamepad = () => {
      const snapshot = gamepadManager.getSnapshot();
      if (snapshot.connected) {
        const buttons = snapshot.buttons;
        const now = Date.now();

        const justPressed = (btn: string) => buttons.has(btn) && !prevPressedButtonsRef.current.has(btn);

        // Detect direction tapping
        let dirUp = justPressed('DpadUp');
        let dirDown = justPressed('DpadDown');
        let dirLeft = justPressed('DpadLeft');
        let dirRight = justPressed('DpadRight');

        // Translate Left analog stick axes to navigation triggers
        if (Math.abs(snapshot.leftStick.x) < 0.25 && Math.abs(snapshot.leftStick.y) < 0.25) {
          lastStickDirTimeRef.current = 0;
        } else {
          if (now - lastStickDirTimeRef.current > 230) {
            if (snapshot.leftStick.y < -0.5) {
              dirUp = true;
              lastStickDirTimeRef.current = now;
            } else if (snapshot.leftStick.y > 0.5) {
              dirDown = true;
              lastStickDirTimeRef.current = now;
            } else if (snapshot.leftStick.x < -0.5) {
              dirLeft = true;
              lastStickDirTimeRef.current = now;
            } else if (snapshot.leftStick.x > 0.5) {
              dirRight = true;
              lastStickDirTimeRef.current = now;
            }
          }
        }

        if (filteredGames.length > 0) {
          const currentId = highlightedGameIdRef.current;
          const currentIndex = filteredGames.findIndex(g => g.id === currentId);
          const safeIndex = currentIndex === -1 ? 0 : currentIndex;
          let targetIndex = safeIndex;

          if (dirDown) {
            targetIndex = (safeIndex + 1) % filteredGames.length;
          } else if (dirUp) {
            targetIndex = (safeIndex - 1 + filteredGames.length) % filteredGames.length;
          } else if (dirRight) {
            targetIndex = Math.min(filteredGames.length - 1, safeIndex + 1);
          } else if (dirLeft) {
            targetIndex = Math.max(0, safeIndex - 1);
          }

          if (targetIndex !== safeIndex || currentId === null) {
            const nextGame = filteredGames[targetIndex];
            if (nextGame) {
              haptics.selection();
              arcadeHallAudio.playSwitch();
              setHighlightedGameId(nextGame.id);
              highlightedGameIdRef.current = nextGame.id;

              // Smoothly auto-scroll selected card container into viewport
              setTimeout(() => {
                const el = document.getElementById(`cabinet-card-${nextGame.id}`);
                el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              }, 10);
            }
          }
        }

        // Action confirmation (Button A) -> Launch the highlighted game
        if (justPressed('A')) {
          const currentId = highlightedGameIdRef.current;
          if (currentId) {
            haptics.success();
            arcadeHallAudio.playCoinDrop();
            handleLaunchGameById(currentId);
          }
        }

        // Action cancel / clear (Button B) -> Reset filters
        if (justPressed('B')) {
          handleResetFilters();
        }

        // Switch active lobby layout (Button Y) -> Cycles Floor, Cards, Timeline
        if (justPressed('Y')) {
          haptics.selection();
          arcadeHallAudio.playSwitch();
          setActiveView(prev => prev === 'floor' ? 'cards' : prev === 'cards' ? 'timeline' : 'floor');
        }

        // Toggle Dutch / English (Button X)
        if (justPressed('X')) {
          handleToggleLang(lang === 'nl' ? 'en' : 'nl');
        }

        // Store current buttons set for next frame release check
        prevPressedButtonsRef.current.clear();
        for (const btn of buttons) {
          prevPressedButtonsRef.current.add(btn);
        }
      }

      animFrameId = requestAnimationFrame(pollGamepad);
    };

    animFrameId = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(animFrameId);
  }, [filteredGames, lang]);

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
    },
    {
      id: 'topografie_europa',
      title: "TOPO EUROPA",
      year: 1984,
      tag: "C64 '84",
      genre: "Radarsoft • Helikopter",
      icon: "🚁",
      iconAnim: "group-hover:scale-125 group-hover:-translate-y-1.5 group-hover:rotate-6",
      cabinetType: 'c64_amiga' as const,
      gradient: "from-blue-950 via-sky-950/90 to-black/95",
      border: "border-blue-500/80 hover:border-sky-300",
      glow: "hover:shadow-[0_0_26px_rgba(59,130,246,0.85)]",
      badgeColor: "bg-blue-500 text-white font-black",
      onClick: () => handleLaunchGameById('topografie_europa'),
    },
    {
      id: 'lode_runner',
      title: "LODE RUNNER",
      year: 1983,
      tag: "Apple II '83",
      genre: "Doug Smith • Brøderbund",
      icon: "🏃",
      iconAnim: "group-hover:scale-125 group-hover:-translate-y-1.5 group-hover:rotate-6",
      cabinetType: 'apple_ii' as const,
      gradient: "from-emerald-950 via-green-950/90 to-black/95",
      border: "border-emerald-500/80 hover:border-emerald-300",
      glow: "hover:shadow-[0_0_26px_rgba(34,197,94,0.85)]",
      badgeColor: "bg-emerald-500 text-white font-black",
      onClick: () => handleLaunchGameById('lode_runner'),
    },
    {
      id: 'arkanoid',
      title: "ARKANOID",
      year: 1986,
      tag: "TAITO '86",
      genre: "Akira Fujita • Vaus",
      icon: "🧱",
      iconAnim: "group-hover:scale-125 group-hover:-translate-y-1.5 group-hover:rotate-6",
      cabinetType: 'arcade' as const,
      gradient: "from-cyan-950 via-blue-950/90 to-black/95",
      border: "border-cyan-500/80 hover:border-cyan-300",
      glow: "hover:shadow-[0_0_26px_rgba(6,182,212,0.85)]",
      badgeColor: "bg-cyan-500 text-black font-black",
      onClick: () => handleLaunchGameById('arkanoid'),
    },
    {
      id: 'galaga',
      title: "GALAGA",
      year: 1981,
      tag: "NAMCO '81",
      genre: "Shigeru Yokoyama",
      icon: "🚀",
      iconAnim: "group-hover:scale-125 group-hover:-translate-y-1.5 group-hover:rotate-6",
      cabinetType: 'arcade' as const,
      gradient: "from-red-950 via-blue-950/90 to-black/95",
      border: "border-red-500/80 hover:border-red-300",
      glow: "hover:shadow-[0_0_26px_rgba(239,68,68,0.85)]",
      badgeColor: "bg-red-500 text-white font-black",
      onClick: () => handleLaunchGameById('galaga'),
    },
    {
      id: 'sudoku',
      title: "SUDOKU",
      year: 1984,
      tag: "NIKOLI '84",
      genre: "Howard Garns • Maki Kaji",
      icon: "🔢",
      iconAnim: "group-hover:scale-125 group-hover:-translate-y-1.5 group-hover:rotate-6",
      cabinetType: 'c64_amiga' as const,
      gradient: "from-amber-950 via-stone-900/90 to-black/95",
      border: "border-amber-500/80 hover:border-amber-300",
      glow: "hover:shadow-[0_0_26px_rgba(217,119,6,0.85)]",
      badgeColor: "bg-amber-500 text-stone-950 font-black",
      onClick: () => handleLaunchGameById('sudoku'),
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
        
        {/* Welcome & Context Banner (Redesigned with Xbox Controller Support & Back to Lobby Info) */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-neutral-800 p-6 sm:p-8 lg:p-10 shadow-2xl">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -left-16 -top-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute right-1/4 top-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Grid Layout: Left Content, Right Interactive Controller Dashboard */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Hero Copy & Search (7 cols on large screens) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold font-mono tracking-wider whitespace-nowrap shadow-sm w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{t.badge}</span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                  {t.mainTitle}
                </h2>
                
                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                  {t.mainDesc}
                </p>

                {/* Interactive Spotlight Title Search Bar in Hero */}
                <div className="pt-2">
                  <ArcadeSearchBar
                    lang={lang}
                    onSelectGame={onSelectGame}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    isHeroVariant={true}
                    placeholder={
                      lang === 'nl'
                        ? '🔍 Zoek direct op titel of jaartal (bijv. Topografie, 1984, Pac-Man, Doom)...'
                        : '🔍 Search by title or year (e.g. Topografie, 1984, Pac-Man, Doom)...'
                    }
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Xbox Controller Support Dashboard (5 cols) */}
            <div className="lg:col-span-5 bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 rounded-2xl p-5 space-y-4 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              {/* Header Box */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Gamepad2 className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black tracking-widest font-mono text-emerald-400">
                      XBOX CONTROLLER
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      {lang === 'nl' ? '100% Volledig Ondersteund' : '100% Fully Supported'}
                    </p>
                  </div>
                </div>

                {/* Connection Live status tag */}
                <div className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold flex items-center gap-1.5 border ${
                  isGamepadConnected
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 animate-pulse'
                    : 'bg-neutral-950/80 text-neutral-400 border-neutral-800/60'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isGamepadConnected ? 'bg-emerald-400' : 'bg-neutral-600'}`} />
                  {isGamepadConnected ? (lang === 'nl' ? 'ACTIEF' : 'ACTIVE') : (lang === 'nl' ? 'STAND-BY' : 'STAND-BY')}
                </div>
              </div>

              {/* Lobby Navigation Bindings Guide */}
              <div className="space-y-2 text-xs font-mono">
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                  {lang === 'nl' ? 'Besturing in deze Speelhal:' : 'Controls in this Lobby:'}
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-black/40 border border-neutral-800/60 p-2 rounded-lg">
                    <span className="text-yellow-400 font-bold block">🎮 Left Stick / D-Pad</span>
                    <span className="text-neutral-300">{lang === 'nl' ? 'Blader door kasten' : 'Browse cabinets'}</span>
                  </div>
                  <div className="bg-black/40 border border-neutral-800/60 p-2 rounded-lg">
                    <span className="text-emerald-400 font-bold block">🟢 Button A</span>
                    <span className="text-neutral-300">{lang === 'nl' ? 'Munt inwerpen & Start' : 'Insert Coin & Start'}</span>
                  </div>
                  <div className="bg-black/40 border border-neutral-800/60 p-2 rounded-lg">
                    <span className="text-cyan-400 font-bold block">🟡 Button Y</span>
                    <span className="text-neutral-300">{lang === 'nl' ? 'Wissel 3D / Lijst' : 'Switch 3D / List'}</span>
                  </div>
                  <div className="bg-black/40 border border-neutral-800/60 p-2 rounded-lg">
                    <span className="text-rose-400 font-bold block">🔵 Button B</span>
                    <span className="text-neutral-300">{lang === 'nl' ? 'Filters wissen' : 'Clear filters'}</span>
                  </div>
                </div>
              </div>

              {/* Return to Lobby Notification */}
              <div className="border-t border-neutral-800/80 pt-3 text-[11px] text-neutral-300 space-y-1.5 leading-relaxed bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-800/30">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold font-mono text-[10px] uppercase">
                  <span>💡</span>
                  <span>{lang === 'nl' ? 'Terugkeren naar Speelhal' : 'Exit Game Instruction'}</span>
                </div>
                <p className="font-sans">
                  {lang === 'nl' ? (
                    <>
                      Klaar met spelen? Je kunt bij <strong>elk spel</strong> direct terug naar deze pagina gaan door op de{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-white font-mono text-[9px] border border-neutral-700">ESC-toets</kbd>{' '}
                      op je toetsenbord te drukken, of op de{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-white font-mono text-[9px] border border-neutral-700">Back / Select</kbd>{' '}
                      knop van je Xbox controller te tikken!
                    </>
                  ) : (
                    <>
                      Finished playing? For <strong>every game</strong>, you can easily exit back to this lobby by pressing the{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-white font-mono text-[9px] border border-neutral-700">ESC key</kbd>{' '}
                      on your keyboard, or tapping the{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-white font-mono text-[9px] border border-neutral-700">Back / Select</kbd>{' '}
                      button on your Xbox controller!
                    </>
                  )}
                </p>
              </div>
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
                  <option value="card_games">🃏 {lang === 'nl' ? 'PC Kaartspellen & Solitaire (Patience, Win95)' : 'PC Card & Solitaire Games (Patience, Win95)'}</option>
                  <option value="brain_logic">🧠 {lang === 'nl' ? 'Denksport, Bord- & Logica (Sudoku, Chess)' : 'Brain, Board & Logic (Sudoku, Chess)'}</option>
                  <option value="arcade">🕹️ {lang === 'nl' ? 'Speelhal Coin-Op' : 'Arcade Coin-Op'}</option>
                  <option value="apple_ii">🍏 {lang === 'nl' ? 'Apple II Computer (Bill Budge & Wozniak)' : 'Apple II Computer (Bill Budge & Wozniak)'}</option>
                  <option value="handheld">📱 {lang === 'nl' ? 'Portables & Handhelds (Game Boy, GBA, PS1 & Mobiel)' : 'Portables & Handhelds (Game Boy, GBA, PS1 & Mobile)'}</option>
                  <option value="portable">🎮 {lang === 'nl' ? 'Portable Players (Game Boy, GBA, PS1)' : 'Portable Players (Game Boy, GBA, PS1)'}</option>
                  <option value="micro">💻 {lang === 'nl' ? '8-Bit Micro Computers (BBC, ZX & Apple)' : '8-Bit Micro Computers (BBC, ZX & Apple)'}</option>
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
                  <option value="1980">1980 • Pac-Man (Namco) &amp; Night Driver (Apple II)</option>
                  <option value="1981">1981 • 3D Monster Maze & Donkey Kong</option>
                  <option value="1982">1982 • Zaxxon, Frogger, Arcadians & Demon Attack</option>
                  <option value="1983">1983 • Mario Bros, Chuckie Egg & Manic Miner</option>
                  <option value="1984">1984 • Tetris, Topografie Europa (C64) &amp; Frak!</option>
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
            highlightedGameId={highlightedGameId}
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
            highlightedGameId={highlightedGameId}
          />
        )}

        {/* VIEW 3: RICH INTERACTIVE CABINET CARDS SHOWCASE */}
        {activeView === 'cards' && (
          <CabinetShowcaseView
            games={filteredGames}
            lang={lang}
            onLaunchGame={handleLaunchGameById}
            onOpenDossier={handleOpenDossierById}
            highScores={highScoresMap}
            onResetFilters={handleResetFilters}
            highlightedGameId={highlightedGameId}
          />
        )}

        {/* Footer info */}
        <footer className="w-full pt-6 pb-10 border-t border-neutral-800/60 flex flex-col items-center justify-between gap-4 text-xs text-neutral-500 font-mono">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
            <div>
              Retro Arcade Vault • Volledig responsief voor mobiel &amp; desktop
            </div>
            <div className="flex items-center gap-4">
              <span>{GAMES_METADATA.length} Klassieke Games &amp; Consoles • 0 External ROMs</span>
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

      {/* Spy Fox in "Dry Cereal" (1997) Humongous Entertainment History Modal */}
      <SpyFoxHistoryModal
        isOpen={isSpyFoxHistoryOpen}
        onClose={() => setIsSpyFoxHistoryOpen(false)}
        onPlay={() => {
          setIsSpyFoxHistoryOpen(false);
          onSelectGame('spy_fox');
        }}
      />

      {/* Apple II Night Driver (1980 / 1983) Bill Budge History Modal */}
      <NightDriverHistoryModal
        isOpen={isNightDriverHistoryOpen}
        onClose={() => setIsNightDriverHistoryOpen(false)}
        lang={lang}
      />

      {/* Topografie Europa (1984) Cees Kramer / Radarsoft History Modal */}
      <TopografieEuropaHistoryModal
        isOpen={isTopografieEuropaHistoryOpen}
        onClose={() => setIsTopografieEuropaHistoryOpen(false)}
        lang={lang}
      />

      {/* Apple II Lode Runner (1983) Doug Smith / Brøderbund History Modal */}
      <LodeRunnerHistoryModal
        isOpen={isLodeRunnerHistoryOpen}
        onClose={() => setIsLodeRunnerHistoryOpen(false)}
        onPlay={() => {
          setIsLodeRunnerHistoryOpen(false);
          onSelectGame('lode_runner');
        }}
      />

      {/* Arkanoid / Breakout (1986 / 1976) Taito / Atari History Modal */}
      <ArkanoidHistoryModal
        isOpen={isArkanoidHistoryOpen}
        onClose={() => setIsArkanoidHistoryOpen(false)}
        onPlayGame={() => {
          setIsArkanoidHistoryOpen(false);
          onSelectGame('arkanoid');
        }}
        lang={lang}
      />

      {/* Galaga (1981) Namco History Modal */}
      <GalagaHistoryModal
        isOpen={isGalagaHistoryOpen}
        onClose={() => setIsGalagaHistoryOpen(false)}
        onPlayGame={() => {
          setIsGalagaHistoryOpen(false);
          onSelectGame('galaga');
        }}
        lang={lang}
      />

      {/* Sudoku (1984 / 1979) Nikoli / Howard Garns History Modal */}
      <SudokuHistoryModal
        isOpen={isSudokuHistoryOpen}
        onClose={() => setIsSudokuHistoryOpen(false)}
        lang={lang}
      />

      {/* Zeeslag Solitaire (1982) Jaime Poniachik History Modal */}
      <BattleshipHistoryModal
        isOpen={isBattleshipHistoryOpen}
        onClose={() => setIsBattleshipHistoryOpen(false)}
        lang={lang}
      />

      {/* Mastermind (1970/1971) Mordecai Meirowitz / Jumbo History Modal */}
      <MastermindHistoryModal
        isOpen={isMastermindHistoryOpen}
        onClose={() => setIsMastermindHistoryOpen(false)}
        onPlayGame={() => {
          setIsMastermindHistoryOpen(false);
          onSelectGame('mastermind');
        }}
        lang={lang}
      />

      {/* Patience / Solitaire (1990) Wes Cherry & Susan Kare / Windows 3.0 / 95 History Modal */}
      <PatienceHistoryModal
        isOpen={isPatienceHistoryOpen}
        onClose={() => setIsPatienceHistoryOpen(false)}
        onPlayGame={() => {
          setIsPatienceHistoryOpen(false);
          onSelectGame('patience');
        }}
        lang={lang}
      />

      {/* Hartenjagen / Hearts (1992) The Microsoft Hearts Network History Modal */}
      <HeartsHistoryModal
        isOpen={isHeartsHistoryOpen}
        onClose={() => setIsHeartsHistoryOpen(false)}
        onPlayGame={() => {
          setIsHeartsHistoryOpen(false);
          onSelectGame('hearts');
        }}
        lang={lang}
      />

      {/* FreeCell (1991) Paul Alan Schultz / Windows 3.1 & 95 History Modal */}
      <FreeCellHistoryModal
        isOpen={isFreeCellHistoryOpen}
        onClose={() => setIsFreeCellHistoryOpen(false)}
        onPlayGame={() => {
          setIsFreeCellHistoryOpen(false);
          onSelectGame('freecell');
        }}
        lang={lang}
      />

      {/* Spider Solitaire (1998) John A. Blackall / Windows 98 & XP History Modal */}
      <SpiderHistoryModal
        isOpen={isSpiderHistoryOpen}
        onClose={() => setIsSpiderHistoryOpen(false)}
        onPlayGame={() => {
          setIsSpiderHistoryOpen(false);
          onSelectGame('spider_solitaire');
        }}
        lang={lang}
      />

      {/* Klaverjassen (1890 / 1985) Nederlands Troef- & Slagenspel History Modal */}
      <KlaverjassenHistoryModal
        isOpen={isKlaverjassenHistoryOpen}
        onClose={() => setIsKlaverjassenHistoryOpen(false)}
        onPlayGame={() => {
          setIsKlaverjassenHistoryOpen(false);
          onSelectGame('klaverjassen');
        }}
        lang={lang}
      />

      {/* Blackjack / 21 (1931 / 1962) Casino Classic History Modal */}
      <BlackjackHistoryModal
        isOpen={isBlackjackHistoryOpen}
        onClose={() => setIsBlackjackHistoryOpen(false)}
        onPlayGame={() => {
          setIsBlackjackHistoryOpen(false);
          onSelectGame('blackjack');
        }}
        lang={lang}
      />

      {/* Contract Bridge (1925) Harold Vanderbilt / NBB Denksport History Modal */}
      <BridgeHistoryModal
        isOpen={isBridgeHistoryOpen}
        onClose={() => setIsBridgeHistoryOpen(false)}
        onPlayGame={() => {
          setIsBridgeHistoryOpen(false);
          onSelectGame('bridge');
        }}
        lang={lang}
      />

      {/* Radarsoft 3D Tic Tac Toe (1984) C64 Debut History Modal */}
      <Radarsoft3DTicTacToeHistoryModal
        isOpen={isRadarsoft3DHistoryOpen}
        onClose={() => setIsRadarsoft3DHistoryOpen(false)}
        onPlayGame={() => {
          setIsRadarsoft3DHistoryOpen(false);
          onSelectGame('radarsoft_3d_ttt');
        }}
        lang={lang}
      />

      {/* Stratego (1947/1958) Jacques Johan Mogendorff / Jumbo History Modal */}
      <StrategoHistoryModal
        isOpen={isStrategoHistoryOpen}
        onClose={() => setIsStrategoHistoryOpen(false)}
        onPlayGame={() => {
          setIsStrategoHistoryOpen(false);
          onSelectGame('stratego');
        }}
        lang={lang}
      />

      {/* Kamertje Verhuren (1895) Édouard Lucas / Ruitjespapier History Modal */}
      <KamertjeVerhurenHistoryModal
        isOpen={isKamertjeHistoryOpen}
        onClose={() => setIsKamertjeHistoryOpen(false)}
        onPlayGame={() => {
          setIsKamertjeHistoryOpen(false);
          onSelectGame('kamertje_verhuren');
        }}
        lang={lang}
      />

      {/* Connect Four / Vier op een Rij (1974) Milton Bradley History Modal */}
      <ConnectFourHistoryModal
        isOpen={isConnectFourHistoryOpen}
        onClose={() => setIsConnectFourHistoryOpen(false)}
        onPlayGame={() => {
          setIsConnectFourHistoryOpen(false);
          onSelectGame('connect_four');
        }}
        lang={lang}
      />

      {/* Galgje op Ruitjespapier (1894) History Modal */}
      <HangmanHistoryModal
        isOpen={isHangmanHistoryOpen}
        onClose={() => setIsHangmanHistoryOpen(false)}
        onPlayGame={() => {
          setIsHangmanHistoryOpen(false);
          onSelectGame('hangman');
        }}
        lang={lang}
      />
    </div>
  );
};
