import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { isRtl, loadLocale, saveLocale, t, type LocaleId } from './strings'

type Listener = () => void

let currentLocale: LocaleId = loadLocale()
const listeners = new Set<Listener>()

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getLocaleSnapshot() {
  return currentLocale
}

function setGlobalLocale(id: LocaleId) {
  if (currentLocale === id) return
  currentLocale = id
  saveLocale(id)
  emit()
}

export function useLocale() {
  const locale = useSyncExternalStore(subscribe, getLocaleSnapshot, getLocaleSnapshot)

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = isRtl(locale) ? 'rtl' : 'ltr'
  }, [locale])

  const setLocale = useCallback((id: LocaleId) => {
    setGlobalLocale(id)
  }, [])

  const tr = useCallback((key: string) => t(locale, key), [locale])

  return { locale, setLocale, t: tr, rtl: isRtl(locale) }
}
