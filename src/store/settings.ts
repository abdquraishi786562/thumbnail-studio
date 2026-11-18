import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { ThemeId } from '../theme/themes';
import type { LanguageCode } from '../i18n/languages';
import { NO_PICTURES, type PictureConfig } from '../ai/pictures';

/** localStorage can be unavailable (private windows, blocked storage); never let that break the app. */
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      /* ignore */
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  }
};

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export interface SettingsState {
  theme: ThemeId;
  customAccent: string;
  customDark: boolean;
  reduceMotion: boolean;
  language: LanguageCode;
  /** Optional AI picture service (the user's own key, kept in this browser only). */
  pictures: PictureConfig;
  setTheme: (theme: ThemeId) => void;
  setCustomAccent: (accent: string) => void;
  setCustomDark: (dark: boolean) => void;
  setReduceMotion: (reduce: boolean) => void;
  setLanguage: (language: LanguageCode) => void;
  setPictures: (pictures: PictureConfig) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'cleanLight',
      customAccent: '#7c5cff',
      customDark: true,
      reduceMotion: prefersReducedMotion(),
      language: 'en',
      pictures: NO_PICTURES,
      setTheme: (theme) => set({ theme }),
      setCustomAccent: (customAccent) => set({ customAccent, theme: 'custom' }),
      setCustomDark: (customDark) => set({ customDark }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setLanguage: (language) => set({ language }),
      setPictures: (pictures) => set({ pictures })
    }),
    {
      name: 'thumbnail-studio:settings',
      version: 1,
      storage: createJSONStorage(() => safeStorage)
    }
  )
);
