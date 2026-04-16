import { create } from 'zustand'
import {
  PREF_AI_ASSISTANT_KEY,
  PREF_CURRENCY_KEY,
  PREF_LANGUAGE_KEY,
  PREF_THEME_KEY,
} from '../constants/storage'

export type ThemePreference = 'light' | 'dark' | 'system'
export type AiAssistantPreference = 'show' | 'hide'
export type LanguagePreference = 'ko'
export type CurrencyPreference = 'KRW'

interface UserPreferencesState {
  theme: ThemePreference
  language: LanguagePreference
  currency: CurrencyPreference
  aiAssistant: AiAssistantPreference
  setTheme: (value: ThemePreference) => void
  setLanguage: (value: LanguagePreference) => void
  setCurrency: (value: CurrencyPreference) => void
  setAiAssistant: (value: AiAssistantPreference) => void
}

function readValue<T extends string>(key: string, fallback: T, allowed: readonly T[]): T {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback
}

function applyTheme(theme: ThemePreference) {
  const root = document.documentElement
  if (theme === 'system') {
    root.removeAttribute('data-theme')
    return
  }
  root.setAttribute('data-theme', theme)
}

const initialTheme = readValue(PREF_THEME_KEY, 'dark', ['light', 'dark', 'system'] as const)
const initialLanguage = readValue(PREF_LANGUAGE_KEY, 'ko', ['ko'] as const)
const initialCurrency = readValue(PREF_CURRENCY_KEY, 'KRW', ['KRW'] as const)
const initialAi = readValue(PREF_AI_ASSISTANT_KEY, 'show', ['show', 'hide'] as const)

applyTheme(initialTheme)

export const useUserPreferencesStore = create<UserPreferencesState>((set) => ({
  theme: initialTheme,
  language: initialLanguage,
  currency: initialCurrency,
  aiAssistant: initialAi,
  setTheme: (value) =>
    set(() => {
      localStorage.setItem(PREF_THEME_KEY, value)
      applyTheme(value)
      return { theme: value }
    }),
  setLanguage: (value) =>
    set(() => {
      localStorage.setItem(PREF_LANGUAGE_KEY, value)
      return { language: value }
    }),
  setCurrency: (value) =>
    set(() => {
      localStorage.setItem(PREF_CURRENCY_KEY, value)
      return { currency: value }
    }),
  setAiAssistant: (value) =>
    set(() => {
      localStorage.setItem(PREF_AI_ASSISTANT_KEY, value)
      return { aiAssistant: value }
    }),
}))
