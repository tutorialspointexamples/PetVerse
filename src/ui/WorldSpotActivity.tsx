import { useEffect, useRef, useState } from 'react'
import type { WorldSpot } from '../game/worlds'
import { useLocale } from '../i18n/useLocale'

interface Props {
  spot: WorldSpot
  accent: number
  onSuccess: () => void
  onCancel: () => void
}

/** Short destination mini-challenges before collecting a world hotspot reward. */
export function WorldSpotActivity({ spot, accent, onSuccess, onCancel }: Props) {
  const { t } = useLocale()
  const kind = spot.activity
  const accentHex = `#${accent.toString(16).padStart(6, '0')}`

  return (
    <div className="spot-activity" role="dialog" aria-label={t('travel.activity')}>
      <div className="spot-activity-card" style={{ borderColor: accentHex }}>
        <div className="shop-header">
          <h3>{spot.label}</h3>
          <button type="button" className="close-btn" onClick={onCancel}>
            ×
          </button>
        </div>
        <p className="panel-note">{spot.blurb}</p>
        {kind === 'timing' ? <TimingGame accent={accentHex} onSuccess={onSuccess} /> : null}
        {kind === 'tap' ? <TapGame accent={accentHex} onSuccess={onSuccess} /> : null}
        {kind === 'chase' ? <ChaseGame accent={accentHex} onSuccess={onSuccess} /> : null}
      </div>
    </div>
  )
}

function TimingGame({ accent, onSuccess }: { accent: string; onSuccess: () => void }) {
  const { t } = useLocale()
  const [pos, setPos] = useState(0)
  const [msg, setMsg] = useState(t('travel.activity.timing'))
  const [done, setDone] = useState(false)
  const dir = useRef(1)
  const posRef = useRef(0)

  useEffect(() => {
    if (done) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      posRef.current += dir.current * dt * 1.35
      if (posRef.current >= 1) {
        posRef.current = 1
        dir.current = -1
      } else if (posRef.current <= 0) {
        posRef.current = 0
        dir.current = 1
      }
      setPos(posRef.current)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [done])

  const stop = () => {
    if (done) return
    const hit = posRef.current > 0.38 && posRef.current < 0.62
    setDone(true)
    if (hit) {
      setMsg(t('travel.activity.success'))
      window.setTimeout(onSuccess, 420)
    } else {
      setMsg(t('travel.activity.retry'))
      window.setTimeout(() => {
        setDone(false)
        setMsg(t('travel.activity.timing'))
      }, 650)
    }
  }

  return (
    <div className="spot-mini">
      <div className="spot-meter">
        <div className="spot-meter-zone" />
        <div className="spot-meter-needle" style={{ left: `${pos * 100}%`, background: accent }} />
      </div>
      <p className="dunk-msg">{msg}</p>
      <button type="button" className="name-submit" disabled={done} onClick={stop}>
        {t('travel.activity.stop')}
      </button>
    </div>
  )
}

function TapGame({ accent, onSuccess }: { accent: string; onSuccess: () => void }) {
  const { t } = useLocale()
  const goal = 8
  const [taps, setTaps] = useState(0)
  const [left, setLeft] = useState(4.5)
  const [failed, setFailed] = useState(false)
  const tapsRef = useRef(0)

  useEffect(() => {
    if (failed || tapsRef.current >= goal) return
    const id = window.setInterval(() => {
      setLeft((v) => {
        if (v <= 0.1) {
          setFailed(true)
          return 0
        }
        return v - 0.1
      })
    }, 100)
    return () => clearInterval(id)
  }, [failed])

  useEffect(() => {
    if (!failed) return
    const id = window.setTimeout(() => {
      tapsRef.current = 0
      setTaps(0)
      setLeft(4.5)
      setFailed(false)
    }, 700)
    return () => clearTimeout(id)
  }, [failed])

  const tap = () => {
    if (failed || tapsRef.current >= goal) return
    tapsRef.current += 1
    setTaps(tapsRef.current)
    if (tapsRef.current >= goal) window.setTimeout(onSuccess, 350)
  }

  return (
    <div className="spot-mini">
      <button
        type="button"
        className={`spot-tap-target ${failed ? 'fail' : ''}`}
        style={{ ['--spot-accent' as string]: accent }}
        onClick={tap}
      >
        {failed ? t('travel.activity.retry') : `${taps}/${goal}`}
      </button>
      <p className="dunk-msg">
        {failed ? t('travel.activity.retry') : `${t('travel.activity.tap')} · ${left.toFixed(1)}s`}
      </p>
    </div>
  )
}

function ChaseGame({ accent, onSuccess }: { accent: string; onSuccess: () => void }) {
  const { t } = useLocale()
  const [pos, setPos] = useState({ x: 30, y: 40 })
  const [caught, setCaught] = useState(0)
  const [msg, setMsg] = useState(t('travel.activity.chase'))
  const goal = 3
  const caughtRef = useRef(0)

  useEffect(() => {
    if (caughtRef.current >= goal) return
    const id = window.setInterval(() => {
      setPos({
        x: 12 + Math.random() * 68,
        y: 18 + Math.random() * 52,
      })
    }, 780)
    return () => clearInterval(id)
  }, [caught])

  const catchIt = () => {
    if (caughtRef.current >= goal) return
    caughtRef.current += 1
    setCaught(caughtRef.current)
    setMsg(`${caughtRef.current}/${goal}`)
    setPos({
      x: 12 + Math.random() * 68,
      y: 18 + Math.random() * 52,
    })
    if (caughtRef.current >= goal) {
      setMsg(t('travel.activity.success'))
      window.setTimeout(onSuccess, 400)
    }
  }

  return (
    <div className="spot-mini">
      <div className="spot-chase-arena" aria-label={t('travel.activity.chase')}>
        <button
          type="button"
          className="spot-chase-target"
          style={{ left: `${pos.x}%`, top: `${pos.y}%`, background: accent }}
          onClick={catchIt}
        />
      </div>
      <p className="dunk-msg">{msg}</p>
    </div>
  )
}
