/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_CHAT_API_URL?: string
  readonly CHAT_API_URL?: string
  readonly PROD?: string
  readonly MODE?: string
  readonly DEV?: boolean
  readonly VITE_FORCE_UNLOCK?: string
  readonly FORCE_UNLOCK?: string
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_VAPID_KEY?: string
  readonly VITE_ENCRYPTION_KEY: string
  readonly VITE_ENV?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_HASHED_ACCESS_CODE?: string
  readonly VITE_HASHED_GUEST_CODE?: string
  readonly VITE_HASHED_MOIR_GUEST_CODE?: string
  readonly VITE_HASHED_BIRTHDATE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
