harper-advent-calendar
# Family Calendar Creator v2.0
===============================

A customizable calendar creation tool for families to build interactive calendars with daily surprises, photos, and memories.

## Calendar Content Setup

- Place calendar photos inside `public/photos` using the convention `day-01.jpg`, `day-02.jpg`, etc. At runtime these are served from `/photos/day-XX.jpg`.
- Daily content lives in `src/data/calendarContent.ts`. A helper export exposes the simplified structure `{ day: number, message: string }` so each calendar number maps directly to its content.
- If you need to override photos per device, you can drop compressed images into `localStorage` (keys `calendar-photo-<day>`). The `/photos` assets act as the shared baseline while local storage handles per-device customizations.
- `photoManifest` maps each day to its canonical file path (e.g. `{ 1: '/photos/day-01.jpg' }`). When calendar entries open we reference this manifest so the correct image displays immediately.
- **Testing/Preview Mode**: To unlock all entries for testing (regardless of date), set the environment variable `VITE_FORCE_UNLOCK=true`:
  - **Local Development**: Create a `.env` or `.env.local` file with `VITE_FORCE_UNLOCK=true` and restart the dev server
  - **Production**: Add `VITE_FORCE_UNLOCK` as an environment variable with value `true`, then redeploy
  - This flag allows all entries to be opened regardless of the current date, useful for QA and testing
  - **Note**: In development mode (`npm run dev`), entries are automatically unlocked unless explicitly disabled

## Music Uploads

- Add background music files to `public/music/`. The `MusicPlayer` component can play theme music that enhances the calendar experience.
- The `SoundManager` handles audio playback and effects when calendar entries are opened.
- Configure music themes in `src/lib/musicTheme.ts` for different calendar styles.

## Chat With Daddy API

- Store your inspirational quotes in `public/data/daddy-quotes.json` following the `{ "response_id": 1, "response_type": ["joy"], "text": "..." }` schema. The chat feature fetches and forwards this file for retrieval-augmented responses.
- The chat API is implemented as Cloudflare Pages Functions in `functions/api/chat-with-daddy.mjs`. It accepts `{ messages, quotes, sessionId }` and returns `{ reply: string }`, using `gpt-4o-mini` model.
- Store your OpenAI API key in Cloudflare Pages environment variables (`OPENAI_API_KEY`) and system prompt in `CHAT_SYSTEM_PROMPT`. These are never exposed to the client.
- The front-end keeps the last five chat exchanges in `localStorage` (`chat-with-daddy`) so Harper can pick up the conversation where she left off.
- The guiding system prompt lives at `config/chat-system-prompt.txt` and is loaded via the `CHAT_SYSTEM_PROMPT` environment variable in Cloudflare.
- Every time Harper sends a message, the UI POSTs to `/api/chat-sessions` which persists chat history to Cloudflare KV (`HARPER_ADVENT` namespace).
- For local development, set `VITE_CHAT_API_URL` to your production API URL (e.g., `https://toharper.dad`) or use `wrangler dev` to test functions locally.
- The client automatically uses the same origin as the deployed frontend in production. For development, set `VITE_CHAT_API_URL` to point to your API.
- See `CLOUDFLARE_DEPLOYMENT.md` for detailed deployment instructions.
- Drop photo assets into `public/photos/` alongside a JSON file with the same base name (e.g. `IMG_0009.png` + `IMG_0009.json`). Each JSON entry should look like `{ "Title": "button text", "Subtitle": "Daddy Loves You!", "Body": "prompt context", "cache_key": "harper-day-XX", "day": 1, "body_timestamp": 1234567890 }`. Run `npm run generate:photos` to refresh `src/data/photoPairs.generated.ts`; the calendar tiles and modals will read from this manifest. Run `npm run upload:photos` to validate metadata and create compressed versions. Run `npm run generate:bodies` to regenerate Body fields every 2 days with fresh LLM content.
- Set `UPLOAD_SUBTITLE="Your constant subtitle"` if you want the uploader to override or backfill the `subtitle` for every entry (default: `Daddy Loves You!`). If the JSON already contains a subtitle, it still wins; otherwise the constant is inserted automatically.
- When a heart door opens, the modal’s hero title, subtitle ribbon, and slow-reveal story body come straight from the JSON’s `title`, `subtitle`, and `body` so the home screen copy always matches the opened memory.
- The local uploader (`npm run upload:photos`) validates metadata and writes the normalized PNG/JSON pairs into `public/photos` by default (set `UPLOAD_OUTPUT_DIR` if you want a different folder).
- The uploader enforces unique `day` values (1–25) plus non-empty `title`, `body`, and `cache_key` entries. If anything is missing, the script logs exactly which field needs attention before retrying.
