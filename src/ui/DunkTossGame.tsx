import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../state/gameStore'

type Phase = 'aim' | 'flying' | 'result'

export function DunkTossGame() {
  const grant = useGameStore((s) => s.grantMinigameReward)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const [meter, setMeter] = useState(0)
  const [dir, setDir] = useState(1)
  const [throws, setThrows] = useState(0)
  const [hits, setHits] = useState(0)
  const [streak, setStreak] = useState(0)
  const [done, setDone] = useState(false)
  const [msg, setMsg] = useState('Tap when the bar is in the green zone')
  const [phase, setPhase] = useState<Phase>('aim')
  const [flight, setFlight] = useState(0)
  const [lastPerfect, setLastPerfect] = useState(false)
  const [popup, setPopup] = useState<string | null>(null)
  const running = useRef(true)
  const flightRef = useRef(0)

  useEffect(() => {
    let frame = 0
    let last = performance.now()
    const loop = (now: number) => {
      if (!running.current) return
      const dt = (now - last) / 1000
      last = now
      if (phase === 'aim' && !done) {
        setMeter((m) => {
          let next = m + dir * dt * (1.2 + streak * 0.08)
          if (next >= 1) {
            next = 1
            setDir(-1)
          } else if (next <= 0) {
            next = 0
            setDir(1)
          }
          return next
        })
      } else if (phase === 'flying') {
        flightRef.current += dt * 1.8
        setFlight(Math.min(1, flightRef.current))
        if (flightRef.current >= 1) {
          setPhase('result')
          window.setTimeout(() => {
            if (!running.current) return
            setPhase('aim')
            setFlight(0)
            flightRef.current = 0
            setPopup(null)
          }, 550)
        }
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => {
      running.current = false
      cancelAnimationFrame(frame)
    }
  }, [dir, phase, done, streak])

  const toss = () => {
    if (done || phase !== 'aim') return
    const perfect = meter > 0.42 && meter < 0.62
    const okay = meter > 0.3 && meter < 0.75
    const nextThrows = throws + 1
    let nextHits = hits
    let nextStreak = streak
    if (perfect) {
      nextHits += 1
      nextStreak += 1
      setMsg('Swish!')
      setPopup(nextStreak >= 2 ? `${nextStreak}x Combo!` : 'Perfect!')
      setLastPerfect(true)
    } else if (okay) {
      nextHits += 1
      nextStreak += 1
      setMsg('Nice dunk!')
      setPopup('Score!')
      setLastPerfect(false)
    } else {
      nextStreak = 0
      setMsg('Miss — try the green zone')
      setPopup('Miss')
      setLastPerfect(false)
    }
    setHits(nextHits)
    setThrows(nextThrows)
    setStreak(nextStreak)
    setPhase('flying')
    flightRef.current = 0
    setFlight(0)
    if (nextThrows >= 5) {
      setDone(true)
      const comboBonus = Math.min(12, nextStreak * 2)
      const coins = 4 + nextHits * 6 + comboBonus
      window.setTimeout(() => {
        running.current = false
        grant(coins, nextHits >= 3 ? 2 : 1)
      }, 700)
    }
  }

  const arcX = Math.sin(flight * Math.PI) * (lastPerfect ? 8 : meter > 0.75 || meter < 0.25 ? 36 : 14)
  const arcY = flight * 110 - Math.sin(flight * Math.PI) * 70
  const ballScale = 1 - flight * 0.25

  return (
    <div className="minigame-overlay">
      <div className="minigame-frame dunk">
        <div className="minigame-top">
          <h2>Dunk-a-Pet</h2>
          <p>
            {hits}/{throws} hits · streak {streak} · 5 throws
          </p>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        <div className="dunk-court">
          <div className="dunk-backboard" />
          <div className="dunk-hoop" />
          <div className="dunk-net" />
          <div className="dunk-pet" aria-hidden />
          <div
            className={`dunk-ball ${phase === 'flying' ? 'flying' : ''} ${lastPerfect && phase !== 'aim' ? 'swish' : ''}`}
            style={{
              ['--lift' as string]: `${phase === 'aim' ? meter * 36 : arcY}px`,
              ['--drift' as string]: `${phase === 'aim' ? 0 : arcX}px`,
              ['--scale' as string]: String(phase === 'aim' ? 1 : ballScale),
            }}
          />
          {popup ? <div className={`dunk-popup ${popup === 'Miss' ? 'miss' : 'hit'}`}>{popup}</div> : null}
        </div>
        <div className="dunk-meter">
          <div className="dunk-zone" />
          <div className="dunk-needle" style={{ left: `${meter * 100}%` }} />
        </div>
        <p className="dunk-msg">{done ? `Game over · +${4 + hits * 6}c` : msg}</p>
        <button type="button" className="name-submit" disabled={done || phase !== 'aim'} onClick={toss}>
          {done ? 'Rewards saved' : phase === 'flying' ? '…' : 'Toss'}
        </button>
      </div>
    </div>
  )
}
