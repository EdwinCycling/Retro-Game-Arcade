/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * EINDELOOS - Historic Dossier & Instructions Modal
 */

import React from 'react';
import { X, Map, Compass, Shield, Award, Cpu, BookOpen, Heart } from 'lucide-react';
import { getEindeloosHighScores } from '../game/eindeloosHighScores';

interface EindeloosHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayNow: () => void;
}

export const EindeloosHistoryModal: React.FC<EindeloosHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlayNow,
}) => {
  if (!isOpen) return null;

  const highScores = getEindeloosHighScores();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-neutral-900 border-2 border-cyan-500 rounded-xl shadow-2xl p-6 text-neutral-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg bg-neutral-800/80 hover:bg-neutral-700 transition"
          aria-label="Sluiten"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-cyan-800 pb-4">
          <div className="p-3 bg-cyan-950/80 border border-cyan-500 rounded-lg text-cyan-400">
            <Compass className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-cyan-400 font-mono">
              Radarsoft 1985 · Commodore 64
            </div>
            <h2 className="text-2xl font-black text-white tracking-wider font-mono">
              EINDELOOS (ENDLESS)
            </h2>
          </div>
        </div>

        {/* Narrative & History */}
        <div className="space-y-4 text-sm leading-relaxed mb-6">
          <p>
            In <span className="text-cyan-300 font-semibold">1985</span> bracht het befaamde Nederlandse softwarehuis{' '}
            <span className="text-yellow-400 font-semibold">Radarsoft</span> (opgericht door John Vanderaart en Cees Kramer) het spel{' '}
            <em>Eindeloos</em> uit voor de Commodore 64 en MSX. Het spel werd internationaal uitgebracht onder de naam <em>Endless</em> (VK) en <em>Infinitis</em> (Frankrijk).
          </p>

          <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
            <h3 className="text-cyan-400 font-bold flex items-center gap-2 mb-2 font-mono">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Het Geheim van de 500-Schermen Kaart (1024 × 512 karakters)
            </h3>
            <p className="text-xs text-neutral-300">
              Op een C64 met slechts 64KB RAM leek een doolhof van deze gigantische omvang onmogelijk. Radarsoft ontwikkelde een geniaal compressiesysteem: de hele kaart is opgebouwd uit slechts 128 unieke horizontale blokken van 8 karakters op geheugenadres <code className="text-amber-300">$8000</code> en kleurtabel op <code className="text-amber-300">$A000</code>. Hierdoor kon een reusachtig grottenstelsel van ~500 schermen naadloos in het geheugen passen!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
              <h4 className="text-yellow-400 font-bold flex items-center gap-2 mb-2 font-mono">
                <Shield className="w-4 h-4 text-yellow-400" />
                Spelregels & Doel
              </h4>
              <ul className="text-xs space-y-1.5 list-disc list-inside text-neutral-300">
                <li>Je start met <strong className="text-white">14 helikopters</strong>.</li>
                <li>Vlieg door de grotten en ontwijk rotsen en vijanden.</li>
                <li>Vind het <strong className="text-pink-400">kloppende buitenaardse hart</strong> en schiet het kapot met raketten!</li>
                <li>Vlieg over een <strong className="text-yellow-300">[!]</strong> en druk op actie om een herstartpunt op te slaan.</li>
              </ul>
            </div>

            <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
              <h4 className="text-green-400 font-bold flex items-center gap-2 mb-2 font-mono">
                <Map className="w-4 h-4 text-green-400" />
                Besturing
              </h4>
              <ul className="text-xs space-y-1.5 text-neutral-300 font-mono">
                <li><strong className="text-white">Pijltjes / WASD</strong>: Vliegen met inertie</li>
                <li><strong className="text-white">Spatiebalk / Z</strong>: Raket afvuren</li>
                <li><strong className="text-white">Spatie bij [!]</strong>: Checkpoint activeren</li>
                <li><strong className="text-white">Toets M</strong>: Volledige Kaart bekijken</li>
              </ul>
            </div>
          </div>
        </div>

        {/* High Scores */}
        <div className="border-t border-neutral-800 pt-4 mb-6">
          <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2 font-mono">
            <Award className="w-5 h-5 text-yellow-400" />
            Lokale Hall of Fame (Eindeloos)
          </h3>
          <div className="bg-neutral-950 rounded-lg p-3 border border-neutral-800">
            <div className="grid grid-cols-4 text-xs font-mono text-neutral-500 pb-2 border-b border-neutral-800">
              <span>PILOTE</span>
              <span>SCORE</span>
              <span>VERKEND</span>
              <span>HART</span>
            </div>
            <div className="divide-y divide-neutral-900 font-mono text-sm">
              {highScores.map((s, idx) => (
                <div key={idx} className="grid grid-cols-4 py-1.5 items-center">
                  <span className="text-cyan-400 font-bold">{s.initials}</span>
                  <span className="text-yellow-400">{s.score}</span>
                  <span className="text-neutral-400">{s.exploredPercent}%</span>
                  <span>{s.heartDestroyed ? <Heart className="w-4 h-4 text-pink-500 fill-pink-500 inline" /> : '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 border-t border-neutral-800 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-sm transition"
          >
            Sluiten
          </button>
          <button
            onClick={() => {
              onClose();
              onPlayNow();
            }}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-sm shadow-lg shadow-cyan-900/40 transition"
          >
            Nu Spelen
          </button>
        </div>
      </div>
    </div>
  );
};
