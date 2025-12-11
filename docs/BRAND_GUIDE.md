# Harper’s Xmas Village — Brand Guide

## Visual Story
- A magical village where butterflies and hearts symbolise love, safety, and discovery.
- Each tile represents a tiny stage: soft gradients, neon glows, and playful imagery create a wonderland for a three-year-old.
- The modal experience should feel like opening a storybook with personalized art, subtitles, and dad’s loving narration.

## Color Language
- **Primary Glow**: Electric pinks (FF5FA2–FF78D6) blended with calming cyans (4EFCFF–72D8FF).
- **Support Gradients**: Sunset oranges (FFB46C), lavender hazes (D3B2FF), and midnight blues (080F1F) for depth.
- **Accents**: White shimmer (FFFFFF) and gold sparkles (FFD166) to highlight buttons, subtitles, and floating particles.

## Typography
- Use a headline-friendly serif or rounded display for hero titles (e.g., “Harper’s Xmas Village”).
- Body copy should be legible and warm—preferably a geometric sans with soft curves for whisper-like lines and modal stories.
- Uppercase tracking (0.4em+) distinguishes system labels (“memory unlocked,” “chat with”) while rounded corners and shadows keep it playful.

## Components
- **Calendar Tiles**: Heart doors with neon outlines, individual hover glows, and gentle lock indicators. The button text pulls from the JSON `title` so each day feels personal.
- **Modal**: Split layout with hero image on the left, story panel on the right. Subtitles show the static `message` (subtitle) from the data while body paragraphs are AI-generated, ensuring each day feels fresh.
- **Chat**: Gradient header, blur overlay, and playful indicator dots. Random greeting seeds and butterfly imagery keep the conversation whimsical yet soothing.
- **Love Note**: Persistent “I Love You Harper, Dad” marquee with the heart SVG and pulsing glow to anchor the emotional tone.

## Motion
- Soft wisp animations (Snowfall, Northern Lights, Fireflies) layer behind the grid.
- Button interactions rely on scale/bounce cues so little fingers get immediate feedback.
- Modal text reveals should gently cascade letter-by-letter, imitating dad reading a bedtime story.

## Data & Experience
- All imagery pairs (PNG + JSON) live in `public/photos/`. Each JSON entry uses `{ "title": "...", "summary": "...", "body": "...", "cache_key": "..." }`.
- `title`: button/hero text; `summary`: static subtitle; `body`: AI prompt; `cache_key`: key for 48-hour body cache.
- GPT-5-mini generates fresh stories per day using the prompt, but cached responses ensure consistent memories within the 2-day window.

## Audio & Interaction
- Background music: “Ben Bohmer, Nils Hoffmann & Malou – Breathing” loops with a soft fade. Play button lives next to Chat/Surprise CTAs for mobile comfort.
- Sound effects (door creak, magical ding) should be light and friendly—never startling.

## Overall Tone
- Dad’s voice is wise, caring, and steady. Every interaction reinforces safety and awe, encouraging Harper to explore, ask questions, and feel loved.
- UX choices (big buttons, gentle lighting, responsive touch targets) are optimized for small hands and short attention spans while keeping parents delighted.

