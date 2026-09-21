# ♊ Gemini AI Development Guidelines (GEMINI.md)

This file provides system context and rules for **Gemini AI models** operating in Google AI Studio and development containers for the **Classic Retro Arcade, Handheld & Console Vault**.

---

## 📌 Core Directives for Gemini AI

1. **Strict User Intent & Scope Discipline**:
   - Build and modify exactly what the user requests.
   - Preserve all existing games, consoles, cabinet features, and dual-language translations.
   - **NEVER delete existing functionality** or remove supported games.

2. **Language Preference**:
   - Respond in **Dutch (`nl`)** when communicating with the user, confirming requests first before detailing actions.
   - Maintain bilingual support (`nl` / `en`) in all translation files (`lobbyTranslations.ts`).

3. **Port & Runtime Constraints**:
   - The application runs on **Port 3000** (`0.0.0.0:3000`).
   - Do not alter dev server port settings. Always verify that the app starts cleanly without white screens or script errors.

4. **Testing & Code Quality Rules**:
   - When running lint commands, avoid linting `dist`, `node_modules`, or `public`. Use `--cache`.
   - Run `compile_applet` / `npm run lint` to verify that all TypeScript types, cabinet router screens, and i18n dictionaries are 100% error-free.
   - Always inform the user where they can test: `De applicatie draait nu op http://localhost:3000/ waar je de nieuwe functionaliteit kunt testen!`.

---

## 🕹️ Architecture Quick Reference for Gemini

- **Root Routing**: `src/App.tsx`
- **Main Hub & Timeline**: `src/components/ArcadeLobby.tsx` & `src/components/ArcadeTimelineView.tsx`
- **Consoles & Handhelds**:
  - `src/components/GameBoyCabinet.tsx` & `GameBoyHistoryModal.tsx`
  - `src/components/GbaSpCabinet.tsx` & `GbaHistoryModal.tsx`
  - `src/components/Ps1Cabinet.tsx` & `Ps1HistoryModal.tsx`
- **Metadata & Specs**: `src/i18n/lobbyTranslations.ts`
- **Documentation**: `README.md`, `AGENTS.md`, `docs/GAMES_CATALOG.md`, `docs/ARCHITECTURE.md`, `docs/CONTROLS.md`
