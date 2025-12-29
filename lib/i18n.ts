/**
 * Internationalization (i18n) configuration
 * 
 * TODO: Implement full i18n support with next-intl or similar
 * TODO: Add language switcher component
 * TODO: Load translations from JSON files
 * TODO: Support for German (de) language
 * 
 * Current implementation: English only
 * Future: Support language switching via user settings
 */

export type SupportedLocale = 'en' | 'de'

export const defaultLocale: SupportedLocale = 'en'
export const supportedLocales: SupportedLocale[] = ['en', 'de']

/**
 * Get user's preferred language
 * TODO: Load from user settings or browser preferences
 */
export function getLocale(): SupportedLocale {
  // For now, always return default locale
  // TODO: Check user settings, browser language, or URL parameter
  return defaultLocale
}

/**
 * Translation function placeholder
 * TODO: Implement actual translation loading
 */
export function t(key: string, locale?: SupportedLocale): string {
  // Placeholder - will be replaced with actual translation system
  return key
}

