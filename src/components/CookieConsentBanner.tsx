import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X, ChevronRight, Check } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface CookieConsentBannerProps {
  lang: Language;
  onOpenPrivacyDetails: () => void;
}

const CONSENT_STORAGE_KEY = 'arcade_cookie_consent_v1';

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  lang,
  onOpenPrivacyDetails,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!stored) {
        // Delay slightly for smooth entrance
        const timer = setTimeout(() => setIsVisible(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore localStorage issues (e.g. private mode)
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted');
    } catch {
      // Ignore
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const isEn = lang === 'en';

  return (
    <aside
      aria-label="Privacy & Storage Notice"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in slide-in-from-bottom-5 fade-in duration-300"
    >
      <div className="p-4 rounded-2xl bg-neutral-950/95 border-2 border-cyan-500/80 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(6,182,212,0.25)] backdrop-blur-md text-neutral-200">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <Cookie className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h4 className="font-mono font-bold text-xs sm:text-sm text-white tracking-wide">
                {isEn ? 'Privacy & Local Storage' : 'Privacy & Lokale Opslag'}
              </h4>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
                <span>{isEn ? 'No tracking • 100% On-Device' : 'Geen tracking • 100% Lokaal'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAccept}
            className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-neutral-800/60 transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed mb-3 font-sans">
          {isEn
            ? 'This arcade strictly uses client-side local storage (localStorage) to save your high scores, audio settings, and language preference. We do NOT use tracking cookies or external profiling.'
            : 'Deze arcade gebruikt uitsluitend lokale browseropslag (localStorage) voor je topscores, geluidsinstellingen en taalvoorkeur. We gebruiken GEEN tracking cookies of externe profielen.'}
        </p>

        <div className="flex items-center justify-end gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={onOpenPrivacyDetails}
            className="px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <span>{isEn ? 'Storage Details' : 'Opslag Details'}</span>
            <ChevronRight className="w-3 h-3 text-cyan-400" />
          </button>

          <button
            type="button"
            onClick={handleAccept}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)] flex items-center gap-1 text-[11px] cursor-pointer active:scale-95"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isEn ? 'Got it' : 'Begrepen'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
