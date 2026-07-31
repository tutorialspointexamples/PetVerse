import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../state/gameStore'
import { useLocale } from '../i18n/useLocale'

/** Lightweight photo-booth overlay (selfie loop analogue). */
export function PhotoPanel() {
  const overlay = useGameStore((s) => s.overlay)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const petName = useGameStore((s) => s.petName)
  const bodyColor = useGameStore((s) => s.bodyColor)
  const { t } = useLocale()
  const [flash, setFlash] = useState(false)
  const [snaps, setSnaps] = useState(0)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!flash) return
    const id = window.setTimeout(() => setFlash(false), 220)
    return () => window.clearTimeout(id)
  }, [flash])

  if (overlay !== 'photo') return null

  return (
    <div className="shop-overlay" role="dialog" aria-label={t('photo.title')}>
      <div className="shop-panel photo-panel">
        <div className="shop-header">
          <h2>{t('photo.title')}</h2>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        <div className={`photo-stage coat-${bodyColor}${flash ? ' flash' : ''}`} ref={stageRef}>
          <div className="photo-pet" aria-hidden />
          <p className="photo-caption">{petName || 'PetVerse'}</p>
          <div className="photo-frame" aria-hidden />
        </div>
        <p className="panel-note">Snaps {snaps} · Earn a coin each snap</p>
        <div className="photo-actions">
          <button
            type="button"
            className="name-submit"
            onClick={() => {
              setFlash(true)
              setSnaps((n) => n + 1)
              useGameStore.getState().addCoins(1)
              useGameStore.getState().addXp(1)
            }}
          >
            {t('photo.snap')}
          </button>
          <button type="button" className="action-btn slim" onClick={() => setOverlay('none')}>
            {t('photo.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
