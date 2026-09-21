import React from 'react';
import { X, Trophy, Sparkles, Smartphone, Flame, Compass, Star, Zap, Shield, HelpCircle } from 'lucide-react';

interface TempleRunHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'nl' | 'en';
}

export const TempleRunHistoryModal: React.FC<TempleRunHistoryModalProps> = ({
  isOpen,
  onClose,
  lang = 'nl'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border border-amber-500/50 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] p-6 sm:p-8 text-neutral-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer border border-neutral-700"
          title="Sluiten"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Marquee */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-black font-black text-2xl shadow-lg shrink-0">
            🏃
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-mono tracking-wide text-white">
                TEMPLE RUN 3D
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-500/20 text-amber-400 border border-amber-500/40">
                2011 iOS
              </span>
            </div>
            <p className="text-xs text-amber-300/80 font-mono">
              Imangi Studios • Keith Shepherd &amp; Natalia Luckyanova
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-sm leading-relaxed">
          
          {/* Section 1: The Golden Idol & Origin Story */}
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
            <h3 className="font-bold text-amber-400 font-mono flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>De Geboorte van het 3D Endless Runner Genre</span>
            </h3>
            <p className="text-neutral-300">
              In augustus 2011 brachten Keith Shepherd en zijn vrouw Natalia Luckyanova (Imangi Studios) 
              <strong> Temple Run</strong> uit op de iPhone. Geïnspireerd door Indiana Jones stal ontdekkingsreiziger 
              <em> Guy Dangerous</em> het vervloekte Gouden Idool uit een eeuwenoude tempel, waarna hij meedogenloos werd achtervolgd 
              door kwaadaardige demonische apen (Evil Demon Monkeys).
            </p>
          </div>

          {/* Section 2: Innovative Controls & Mobile Mechanics */}
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
            <h3 className="font-bold text-emerald-400 font-mono flex items-center gap-2 mb-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Baanbrekende Swipe &amp; Gyroscoop Besturing</span>
            </h3>
            <p className="text-neutral-300 mb-2">
              Temple Run definieerde hoe 3D-actiegames op mobiele touchscreens horen te spelen:
            </p>
            <ul className="list-disc list-inside space-y-1 text-neutral-300 text-xs font-mono">
              <li><strong>Swipe Omhoog:</strong> Spring over boomstammen, vuurvallen en kloofgaten.</li>
              <li><strong>Swipe Omlaag:</strong> Glijd onder stenen bogen en overhangende takken door.</li>
              <li><strong>Swipe Links / Rechts:</strong> Maak 90-graden bochten bij scherpe tempelafslagen.</li>
              <li><strong>Kantelen (Tilt):</strong> Verplaats naar de rand van het pad om rijen goudmunten te pakken.</li>
            </ul>
          </div>

          {/* Section 3: Global Impact & Records */}
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
            <h3 className="font-bold text-yellow-400 font-mono flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Wereldwijd Fenomeen &amp; Miljarden Downloads</span>
            </h3>
            <p className="text-neutral-300">
              Met meer dan <strong>1 miljard downloads</strong> werd Temple Run een van de meest invloedrijke mobiele games 
              in de geschiedenis, en legde het de basis voor games als Subway Surfers en Sonic Dash. 
              In onze 3D Arcade Vault-editie beleef je de originele adrenaline in Three.js hardware-rendering met volledige 
              desktop- en mobiele ondersteuning!
            </p>
          </div>

        </div>

        {/* Footer Button */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold font-mono text-xs transition cursor-pointer shadow-lg"
          >
            SLUIT DOSSIER &amp; SPEEL
          </button>
        </div>

      </div>
    </div>
  );
};
