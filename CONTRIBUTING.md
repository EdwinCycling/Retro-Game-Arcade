# 🤝 Contributing to the Classic Retro Arcade

Thank you for your interest in contributing to the **Classic Retro Arcade Vault**! We welcome bug fixes, historical accuracy improvements, audio synthesis enhancements, and new retro game additions.

---

## Code of Conduct

Please treat everyone with respect and kindness. We aim to maintain a collaborative, open, and educational community honoring the history of computer science and video games.

---

## Development Setup

1. **Fork the repo** on GitHub and clone your fork locally:
   ```bash
   git clone https://github.com/your-username/classic-retro-arcade.git
   cd classic-retro-arcade
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local dev server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000/` in your browser.

4. **Verify TypeScript & linting**:
   ```bash
   npm run lint
   ```

5. **Test production compilation**:
   ```bash
   npm run build
   ```

---

## Guidelines for Adding a New Retro Game

When contributing a new retro game recreation, adhere to the project's core principles:

1. **No External ROMs or Binary Blobs**:
   The game engine must be implemented in clean TypeScript/React using HTML5 Canvas 2D or Three.js.
2. **Procedural Sound**:
   Sound effects must be synthesized via the `Web Audio API` (oscillators, filters, gain envelopes). Do not add large binary `.mp3` or `.wav` files.
3. **Multi-Input Readiness**:
   Ensure the game supports:
   - Standard Keyboard controls
   - Gamepad API controller mappings (A = Primary Action, B = Secondary, etc.)
   - Mobile touch gestures or virtual D-pad buttons
4. **Historical Dossier**:
   Add bilingual metadata in `src/i18n/lobbyTranslations.ts` (English & Dutch) including:
   - Year of release, original developers, and hardware platform
   - Technical specifications and historical context
5. **Cabinet Design**:
   Create a cabinet component with authentic marquee, side art, and bezel styling honoring the original hardware.

---

## Pull Request Checklist

Before submitting your PR:
- [ ] TypeScript compiles cleanly with zero errors (`npm run lint`).
- [ ] Production build succeeds (`npm run build`).
- [ ] Both English and Dutch localizations are populated.
- [ ] The game operates cleanly on desktop, tablet, and mobile viewports.
- [ ] Commit messages are descriptive and concise.
