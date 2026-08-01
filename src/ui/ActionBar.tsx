import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { createTalkBack, type TalkBackStatus } from '../audio/talkBack'
import { useGameStore } from '../state/gameStore'
import { useLocale } from '../i18n/useLocale'

export function ActionBar() {
  const doCare = useGameStore((s) => s.doCare)
  const sleeping = useGameStore((s) => s.sleeping)
  const cooldowns = useGameStore((s) => s.cooldowns)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const setTalking = useGameStore((s) => s.setTalking)
  const setMicError = useGameStore((s) => s.setMicError)
  const micError = useGameStore((s) => s.micError)
  const { t } = useLocale()
  const [talkStatus, setTalkStatus] = useState<TalkBackStatus>('idle')
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

  return (
    <footer className="action-bar">
      {micError ? <p className="mic-banner">{micError}</p> : null}
      <div className="action-row">
        <button type="button" className="action-btn" disabled={cooling('feed') || sleeping} onClick={() => setOverlay('food')}>
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
        <button type="button" className="action-btn" disabled={cooling('bath') || sleeping} onClick={() => doCare('bath')}>
          <span className="action-mark bath" aria-hidden />
          {t('action.bath')}
        </button>
        <button type="button" className="action-btn" disabled={cooling('play') || sleeping} onClick={() => doCare('play')}>
          <span className="action-mark play" aria-hidden />
          {t('action.play')}
        </button>
      </div>
      <div className="action-row care-extra">
        <button type="button" className="action-btn" disabled={cooling('brush') || sleeping} onClick={() => doCare('brush')}>
          <span className="action-mark brush" aria-hidden />
          {t('action.brush')}
        </button>
        <button type="button" className="action-btn" disabled={cooling('potty') || sleeping} onClick={() => doCare('potty')}>
          <span className="action-mark potty" aria-hidden />
          {t('action.potty')}
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
        <button type="button" className="action-btn shop" onClick={() => setOverlay('shop')}>
          <span className="action-mark style" aria-hidden />
          {t('action.style')}
        </button>
      </div>
      <div className="action-row tertiary">
        <button type="button" className="action-btn slim" onClick={() => setOverlay('rooms')}>
          {t('nav.rooms')}
        </button>
        <button type="button" className="action-btn slim" onClick={() => setOverlay('cards')}>
          {t('nav.cards')}
        </button>
        <button type="button" className="action-btn slim" onClick={() => setOverlay('missions')}>
          {t('nav.missions')}
        </button>
        <button type="button" className="action-btn slim" onClick={() => setOverlay('games')}>
          {t('nav.games')}
        </button>
        <button type="button" className="action-btn slim" onClick={() => setOverlay('travel')}>
          {t('nav.travel')}
        </button>
        <button type="button" className="action-btn slim" onClick={() => setOverlay('skills')}>
          {t('nav.skills')}
        </button>
        <button type="button" className="action-btn slim" onClick={() => setOverlay('companions')}>
          {t('nav.pets')}
        </button>
        <button type="button" className="action-btn slim" onClick={() => setOverlay('photo')}>
          {t('nav.photo')}
        </button>
        <button type="button" className="action-btn slim" onClick={() => setOverlay('lang')}>
          {t('nav.lang')}
        </button>
        <button type="button" className="action-btn slim" onClick={() => setOverlay('rewarded')}>
          {t('nav.boost')}
        </button>
      </div>
      <p className="hint">{t('hint.main')}</p>
    </footer>
  )
}
