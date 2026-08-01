import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { createTalkBack, type TalkBackStatus } from '../audio/talkBack'
import { useGameStore, type Overlay } from '../state/gameStore'
import { useLocale } from '../i18n/useLocale'

type DockSheet = 'none' | 'care' | 'more'

const MORE_ITEMS: { overlay: Overlay; labelKey: string }[] = [
  { overlay: 'games', labelKey: 'nav.games' },
  { overlay: 'skills', labelKey: 'nav.skills' },
  { overlay: 'companions', labelKey: 'nav.pets' },
  { overlay: 'cards', labelKey: 'nav.cards' },
  { overlay: 'missions', labelKey: 'nav.missions' },
  { overlay: 'photo', labelKey: 'nav.photo' },
  { overlay: 'rooms', labelKey: 'nav.rooms' },
  { overlay: 'lang', labelKey: 'nav.lang' },
  { overlay: 'rewarded', labelKey: 'nav.boost' },
  { overlay: 'event', labelKey: 'nav.event' },
]

export function ActionBar() {
  const doCare = useGameStore((s) => s.doCare)
  const sleeping = useGameStore((s) => s.sleeping)
  const cooldowns = useGameStore((s) => s.cooldowns)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const setTalking = useGameStore((s) => s.setTalking)
  const setMicError = useGameStore((s) => s.setMicError)
  const micError = useGameStore((s) => s.micError)
  const health = useGameStore((s) => s.needs.health)
  const { t } = useLocale()
  const [talkStatus, setTalkStatus] = useState<TalkBackStatus>('idle')
  const [sheet, setSheet] = useState<DockSheet>('none')
  const controllerRef = useRef<ReturnType<typeof createTalkBack> | null>(null)

  useEffect(() => {
    const controller = createTalkBack({
      onStatus: (status) => {
        setTalkStatus(status)
        setTalking(status === 'recording' || status === 'playing')
      },
      onError: (message) => setMicError(message || null),
    })
    controllerRef.current = controller
    return () => controller.destroy()
  }, [setMicError, setTalking])

  const now = Date.now()
  const cooling = (action: keyof typeof cooldowns) => {
    const until = cooldowns[action]
    return Boolean(until && until > now)
  }

  const onTalkDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    void controllerRef.current?.start()
  }

  const onTalkUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    void controllerRef.current?.stop()
  }

  const toggleSheet = (next: DockSheet) => {
    setSheet((cur) => (cur === next ? 'none' : next))
  }

  const openOverlay = (overlay: Overlay) => {
    setSheet('none')
    setOverlay(overlay)
  }

  return (
    <footer className="action-bar dock-bar">
      {micError ? <p className="mic-banner">{micError}</p> : null}

      {sheet === 'care' ? (
        <div className="dock-sheet" role="dialog" aria-label={t('dock.care')}>
          <div className="dock-sheet-grid">
            <button
              type="button"
              className="action-btn"
              disabled={cooling('feed') || sleeping}
              onClick={() => openOverlay('food')}
            >
              <span className="action-mark feed" aria-hidden />
              {t('action.feed')}
            </button>
            <button
              type="button"
              className={`action-btn ${sleeping ? 'active' : ''}`}
              disabled={cooling('sleep')}
              onClick={() => doCare('sleep')}
            >
              <span className="action-mark sleep" aria-hidden />
              {sleeping ? t('action.wake') : t('action.sleep')}
            </button>
            <button
              type="button"
              className="action-btn"
              disabled={cooling('bath') || sleeping}
              onClick={() => doCare('bath')}
            >
              <span className="action-mark bath" aria-hidden />
              {t('action.bath')}
            </button>
            <button
              type="button"
              className="action-btn"
              disabled={cooling('brush') || sleeping}
              onClick={() => doCare('brush')}
            >
              <span className="action-mark brush" aria-hidden />
              {t('action.brush')}
            </button>
            <button
              type="button"
              className="action-btn"
              disabled={cooling('potty') || sleeping}
              onClick={() => doCare('potty')}
            >
              <span className="action-mark potty" aria-hidden />
              {t('action.potty')}
            </button>
            <button
              type="button"
              className={`action-btn cure ${health < 40 ? 'pulse-need' : ''}`}
              disabled={cooling('cure') || sleeping}
              onClick={() => doCare('cure')}
            >
              <span className="action-mark cure" aria-hidden />
              {t('action.cure')}
            </button>
            <button
              type="button"
              className={`action-btn mic ${talkStatus === 'recording' ? 'recording' : ''} ${talkStatus === 'playing' ? 'playing' : ''}`}
              onPointerDown={onTalkDown}
              onPointerUp={onTalkUp}
              onPointerCancel={onTalkUp}
              onContextMenu={(e) => e.preventDefault()}
            >
              <span className="action-mark mic" aria-hidden />
              {talkStatus === 'recording'
                ? t('action.listening')
                : talkStatus === 'playing'
                  ? t('action.talking')
                  : t('action.talk')}
            </button>
          </div>
        </div>
      ) : null}

      {sheet === 'more' ? (
        <div className="dock-sheet more-sheet" role="dialog" aria-label={t('dock.more')}>
          <div className="dock-sheet-grid more">
            {MORE_ITEMS.map((item) => (
              <button
                key={item.overlay}
                type="button"
                className="action-btn slim"
                onClick={() => openOverlay(item.overlay)}
              >
                {t(item.labelKey)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <nav className="dock" aria-label={t('dock.nav')}>
        <button
          type="button"
          className={`dock-btn ${sheet === 'care' ? 'active' : ''}`}
          onClick={() => toggleSheet('care')}
        >
          <span className="dock-icon care" aria-hidden />
          {t('dock.care')}
        </button>
        <button
          type="button"
          className="dock-btn"
          disabled={cooling('play') || sleeping}
          onClick={() => {
            setSheet('none')
            doCare('play')
          }}
        >
          <span className="dock-icon play" aria-hidden />
          {t('dock.play')}
        </button>
        <button
          type="button"
          className="dock-btn"
          onClick={() => openOverlay('travel')}
        >
          <span className="dock-icon travel" aria-hidden />
          {t('dock.travel')}
        </button>
        <button type="button" className="dock-btn" onClick={() => openOverlay('shop')}>
          <span className="dock-icon style" aria-hidden />
          {t('dock.style')}
        </button>
        <button
          type="button"
          className={`dock-btn ${sheet === 'more' ? 'active' : ''}`}
          onClick={() => toggleSheet('more')}
        >
          <span className="dock-icon more" aria-hidden />
          {t('dock.more')}
        </button>
      </nav>
      <p className="hint">{t('hint.main')}</p>
    </footer>
  )
}
