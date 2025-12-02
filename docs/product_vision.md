# Harper’s Xmas Village — Product Vision

## Vision
Craft a magical, parent-approved advent experience where butterflies, heartbeats, and loving memories guide toddlers through December. Harper’s Xmas Village blends tactile play, photo-driven nostalgia, and gentle AI narration so every door unlocks a moment of curiosity, safety, and connection with Dad—both in-person and remotely.

## Product Description
Harper’s Xmas Village is a responsive Vite + React experience built for three-year-olds. Twenty-five heart-shaped tiles unlock day-by-day based on Adelaide time. Each door reveals:
- A personalized title and subtitle sourced from family photos.
- A modal with slow-text reveal and soft animations (butterflies, confetti, aurora glows).
- Placeholder prompts for AI-generated stories when parents want fresh copy.
- Audio cues via MusicPlayer + SoundManager to keep the village alive.

Parents prep assets locally (PNG + JSON) and run `npm run upload:photos` to normalize metadata; no external CMS is required. The interface respects small hands—large touch targets, forgiving animations, and a fallback passcode to preview everything in advance.

## Feature Set
1. **Advent Calendar Grid** – 25 heart-door buttons with neon glow states, date-locked to UTC+10:30.
2. **Modal Memory Experience** – Split-pane layout with image, subtitle ribbon, text reveal animation, and CTA for downloading the photo.
3. **Butterfly & Confetti Animations** – GSAP + Framer Motion sequences triggered on unlock for sensory delight.
4. **Audio Layer** – Background music with ducking and sound effects; optional random surprise videos.
5. **Chat With Daddy** – Whisper-light chat UI using LangChain backend; stores quotes and session history locally.
6. **Local Asset Pipeline** – `public/photos` drive the UI, while scripts validate metadata, generate manifests, and prep bundles for sharing.

## Appeal for Parents
- **Emotional Connection** – Each tile is built around family photos and loving lines authored by parents, keeping the focus on gratitude and bonding.
- **Safe & Offline-Friendly** – Assets live locally; no remote API or account required. Parents maintain full control over what Harper sees.
- **Development-Friendly** – Animations and fonts are tuned for toddlers, encouraging fine motor practice without overstimulation.
- **Year-Round Reuse** – Force-unlock flag lets parents preview or replay memories anytime, making it more than a one-season novelty.

## Roadmap Toward 2026
1. **2025 Holiday Update**
   - Surprise mini-games per door (color-swirl tracing, butterfly catching).
   - Multi-language subtitle packs so bilingual families can swap copy easily.
2. **Early 2026**
   - Parent companion app with drag-and-drop photo uploads, automatic compression, and story suggestions generated via on-device AI.
   - Cloud sync option (opt-in) using secure storage for families split across homes.
3. **Late 2026**
   - Adaptive sensory mode that tunes animations/sounds based on child interaction data (all anonymized and stored locally by default).
   - AR layer for tablets/phones that projects butterflies around the real tree when doors open.

This vision keeps Harper at the center, while giving parents confidence that every interaction is loving, private, and easy to maintain.
