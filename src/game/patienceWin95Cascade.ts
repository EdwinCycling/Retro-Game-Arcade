import { Card, Suit, CardRank } from './patienceTypes';
import { SUIT_SYMBOLS, RANK_NAMES, getCardColor } from './patienceEngine';
import { patienceAudio } from './patienceAudio';

interface BouncingCard {
  card: Card;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  bounces: number;
  active: boolean;
}

export class PatienceWin95Cascade {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private bouncingCards: BouncingCard[] = [];
  private cardQueue: { card: Card; startX: number; startY: number }[] = [];
  private currentSpawningIndex: number = 0;
  private lastSpawnTime: number = 0;
  private isRunning: boolean = false;
  private cardWidth: number = 72;
  private cardHeight: number = 96;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Could not get canvas 2d context');
    this.ctx = context;
  }

  public start(foundations: Card[][], foundationCoordinates: { x: number; y: number }[]) {
    this.stop();
    this.isRunning = true;
    this.bouncingCards = [];
    this.cardQueue = [];
    this.currentSpawningIndex = 0;
    this.lastSpawnTime = Date.now();

    // Resize internal dimensions
    this.canvas.width = this.canvas.clientWidth || 800;
    this.canvas.height = this.canvas.clientHeight || 600;

    // Responsive card dimensions
    this.cardWidth = Math.max(50, Math.min(80, this.canvas.width / 10));
    this.cardHeight = this.cardWidth * 1.4;

    // Build the queue of all 52 cards in reverse order (Kings down to Aces) from each foundation
    for (let rank = 13; rank >= 1; rank--) {
      for (let fIdx = 0; fIdx < 4; fIdx++) {
        const pile = foundations[fIdx] || [];
        const card = pile.find(c => c.rank === rank) || {
          id: `card_${fIdx}_${rank}`,
          suit: (['spades', 'hearts', 'clubs', 'diamonds'] as Suit[])[fIdx],
          rank: rank as CardRank,
          faceUp: true
        };
        const coords = foundationCoordinates[fIdx] || {
          x: (this.canvas.width / 2) - 160 + fIdx * (this.cardWidth + 12),
          y: 30
        };
        this.cardQueue.push({ card, startX: coords.x, startY: coords.y });
      }
    }

    this.loop();
  }

  private loop = () => {
    if (!this.isRunning) return;

    const now = Date.now();
    // Spawn next card in queue
    if (this.currentSpawningIndex < this.cardQueue.length && now - this.lastSpawnTime > 220) {
      const item = this.cardQueue[this.currentSpawningIndex];
      this.lastSpawnTime = now;
      this.currentSpawningIndex++;

      // Initial velocities
      const vx = (Math.random() * 8 - 4) * 1.5 || 3;
      const vy = - (Math.random() * 4 + 2);

      this.bouncingCards.push({
        card: item.card,
        x: item.startX,
        y: item.startY,
        vx: Math.abs(vx) < 1 ? (Math.random() > 0.5 ? 2.5 : -2.5) : vx,
        vy: vy,
        width: this.cardWidth,
        height: this.cardHeight,
        bounces: 0,
        active: true
      });

      patienceAudio.playCardBounce(0.8);
    }

    // Physics step
    const gravity = 0.55;
    const bounceFactor = -0.84;
    const floorY = this.canvas.height - this.cardHeight;

    for (const bc of this.bouncingCards) {
      if (!bc.active) continue;

      bc.vy += gravity;
      bc.x += bc.vx;
      bc.y += bc.vy;

      // Draw card stamp at current position (without clearing previous drawings for classic trailing effect!)
      this.drawCard(bc.card, bc.x, bc.y, bc.width, bc.height);

      // Floor bounce
      if (bc.y >= floorY) {
        bc.y = floorY;
        bc.vy *= bounceFactor;
        bc.bounces++;
        patienceAudio.playCardBounce(Math.min(1, Math.abs(bc.vy) / 10));

        if (Math.abs(bc.vy) < 1.5 && bc.bounces > 15) {
          bc.active = false;
        }
      }

      // Left/Right boundaries check - once it leaves the screen deactivate
      if (bc.x < -bc.width * 2 || bc.x > this.canvas.width + bc.width * 2) {
        bc.active = false;
      }
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private drawCard(card: Card, x: number, y: number, w: number, h: number) {
    const isRed = getCardColor(card.suit) === 'red';
    const ctx = this.ctx;

    ctx.save();
    // Card background & rounded border
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // Corner Rank & Suit
    const rankStr = RANK_NAMES[card.rank];
    const suitStr = SUIT_SYMBOLS[card.suit];
    ctx.fillStyle = isRed ? '#dc2626' : '#0f172a';
    ctx.font = `bold ${Math.floor(w * 0.22)}px monospace, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Top-left corner
    ctx.fillText(`${rankStr}`, x + 4, y + 4);
    ctx.font = `${Math.floor(w * 0.2)}px sans-serif`;
    ctx.fillText(`${suitStr}`, x + 4, y + 4 + Math.floor(w * 0.22));

    // Center Large Suit Icon
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.floor(w * 0.45)}px sans-serif`;
    ctx.fillText(suitStr, x + w / 2, y + h / 2);

    ctx.restore();
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public clear() {
    this.stop();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
