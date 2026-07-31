import { useCallback, useEffect, useState } from 'react'
import { isRtl, loadLocale, saveLocale, t, type LocaleId } from './strings'

export function useLocale() {
  const [locale, setLocaleState] = useState<LocaleId>(() => loadLocale())

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = isRtl(locale) ? 'rtl' : 'ltr'
  }, [locale])

  const setLocale = useCallback((id: LocaleId) => {
    saveLocale(id)
    setLocaleState(id)
  }, [])

  const tr = useCallback((key: string) => t(locale, key), [locale])

  return { locale, setLocale, t: tr, rtl: isRtl(locale) }
}
