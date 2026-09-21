# ⚖️ Legal & Intellectual Property Notice

**Last Updated:** September 2026

## Legal & Intellectual Property Notice

**Retro Game Arcade** is an independent, non-commercial educational and historical project created as a tribute to the evolution of video games and computer-game engineering.

The software implementations in this project have been independently created for this project. No original commercial game ROMs or executable binaries are distributed.

Names of historical video games, companies, systems, characters and other trademarks may be referenced for identification, historical commentary and educational context. These names and trademarks remain the property of their respective rights holders.

This project is not affiliated with, sponsored by, approved by, or endorsed by Nintendo, Atari, Namco, Sega, Taito, id Software, Valve, Konami, Sierra, Electronic Arts, or any other referenced rights holder.

The project is provided free of charge and is not monetised. Its purpose is to document, demonstrate and celebrate significant developments in video-game design and engineering.

Copyrights, trademarks and other intellectual-property rights relating to the original commercial games remain with their respective owners.

If you are a rights holder and believe that material in this project infringes your rights, please contact the project maintainer so that the relevant material can be reviewed and, where appropriate, modified or removed.

---

## Additional Legal Safeguards & Fair Use Principles

### 1. Clean-Room Implementation & Absence of Proprietary Binary Assets
- **No ROMs Distributed**: This repository does not contain, distribute, host, or link to any copyrighted binary ROM files, disk images, BIOS dumps, or protected game executables.
- **Pure Code Re-creation**: Every logic loop, collision engine, rendering pipeline, and procedural audio synthesis routine is an original, clean-room implementation written in TypeScript and JavaScript.

### 2. Procedural Audio Synthesis
- No proprietary copyrighted music recordings (MP3/WAV/FLAC) are hosted or distributed.
- All sound effects and chip music are generated procedurally at runtime using mathematical frequencies via the browser's native Web Audio API (`OscillatorNode`, `GainNode`, `BiquadFilterNode`).

### 3. Nominative Fair Use of Trademarks
- Historical titles, computer models (e.g., BBC Micro, Commodore 64, ZX Spectrum, NES, IBM PC), and publisher names are referenced strictly under the doctrine of **Nominative Fair Use** for accurate historical identification, educational cataloging, and museum context.
- There is no commercial exploitation, merchandise sales, subscription fees, advertising revenue, or token monetization associated with this project.

### 4. Notice and Takedown Procedure (DMCA / EU Directive 2000/31/EC / DSA Compliance)
The project maintainer respects the intellectual property rights of others and commits to an immediate response to legitimate rights-holder inquiries.

If you are a verified copyright or trademark holder (or authorized representative) and believe that any visual asset, name, or recreation in this repository infringes upon your rights, please submit a written notice containing:
1. Identification of the copyrighted work or trademark claimed to be infringed.
2. The specific URL, file path, or component within this project where the material is located.
3. Your contact information (name, organization, and official email address).
4. A statement confirming that you are the rights holder or authorized to act on their behalf.

**Designated Contact Point:**
- **Email:** `edwin@editsolutions.nl`
- **GitHub Issues:** Open an issue marked `[Notice & Takedown Request]`

Upon receipt of a verified notice, the maintainer will promptly review the item and, where appropriate, remove, modify, or replace the material within 48 hours without the need for contentious legal proceedings.

---

## 5. Privacy, Cookies & Client-Side Local Storage Policy (GDPR & ePrivacy Directive)

### Absolute Zero-Tracking Commitment
This project strictly avoids all tracking mechanisms:
- **No HTTP Tracking Cookies**: The application sets zero HTTP cookies for advertising, user profiling, retargeting, or behavioural tracking.
- **No Third-Party Analytics / Beacons**: No Google Analytics, Meta Pixels, or external telemetry libraries are embedded or executed.
- **No Server-Side Data Collection**: The project does not collect, log, transmit, or monetize any personal user data.

### Transparent Use of Strictly Necessary Browser Storage (`localStorage`)
Under the EU ePrivacy Directive (Directive 2002/58/EC as amended by Directive 2009/136/EC) and the General Data Protection Regulation (GDPR - Regulation (EU) 2016/679), **purely functional technical data** stored solely on the client device for explicit service delivery does not require invasive tracking consent. 

The application utilizes standard browser `localStorage` solely for:
1. `arcade_vault_lang_v2`: Persisting language selection (`'en'` or `'nl'`).
2. `arcade_cookie_consent_v1`: Remembering that the user has acknowledged the storage notice (`'accepted'`).
3. `pacman_haptics_enabled`: Saving vibration preference on mobile devices.
4. `*_high_scores`: Saving local gameplay records (initials and score) within the user's browser sandbox.
5. `kq_save_slots` / `sq_save_slots`: Saving local game quest progress for adventure titles.

All of the above keys exist exclusively on the user's local machine and are never transmitted to any external server or third party. Users can clear this data at any time via their browser's "Clear Site Data" or "Clear Cookies & Cache" tools.

