import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../state/gameStore'

type Phase = 'aim' | 'flying' | 'result'
type ShotKind = 'perfect' | 'score' | 'rim' | 'miss' | null

export function DunkTossGame() {
  const grant = useGameStore((s) => s.grantMinigameReward)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const [meter, setMeter] = useState(0)
  const [dir, setDir] = useState(1)
  const [throws, setThrows] = useState(0)
  const [hits, setHits] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [done, setDone] = useState(false)
  const [msg, setMsg] = useState('Tap when the bar is in the green zone')
  const [phase, setPhase] = useState<Phase>('aim')
  const [flight, setFlight] = useState(0)
  const [lastPerfect, setLastPerfect] = useState(false)
  const [shotKind, setShotKind] = useState<ShotKind>(null)
  const [popup, setPopup] = useState<string | null>(null)
  const [crowd, setCrowd] = useState(0.35)
  const [shake, setShake] = useState(0)
  const [netSwish, setNetSwish] = useState(false)
  const [coinsEarned, setCoinsEarned] = useState(0)
  const running = useRef(true)
  const flightRef = useRef(0)

  useEffect(() => {
    let frame = 0
    let last = performance.now()
    const loop = (now: number) => {
      if (!running.current) return
      const dt = (now - last) / 1000
      last = now
      setShake((s) => Math.max(0, s - dt * 4))
      setCrowd((c) => Math.max(0.25, c - dt * 0.08))
      if (phase === 'aim' && !done) {
        setMeter((m) => {
          let next = m + dir * dt * (1.25 + streak * 0.1)
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
        flightRef.current += dt * (shotKind === 'rim' ? 1.35 : 1.85)
        setFlight(Math.min(1, flightRef.current))
        if (flightRef.current >= 1) {
          setPhase('result')
          window.setTimeout(() => {
            if (!running.current) return
            setPhase('aim')
            setFlight(0)
            flightRef.current = 0
            setPopup(null)
            setShotKind(null)
            setNetSwish(false)
          }, shotKind === 'rim' ? 700 : 550)
        }
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => {
      running.current = false
      cancelAnimationFrame(frame)
    }
  }, [dir, phase, done, streak, shotKind])

  const toss = () => {
    if (done || phase !== 'aim') return
    const perfect = meter > 0.44 && meter < 0.58
    const okay = meter > 0.3 && meter < 0.72
    const rim = !perfect && !okay && meter > 0.22 && meter < 0.82
    const nextThrows = throws + 1
    let nextHits = hits
    let nextStreak = streak
    let kind: ShotKind = 'miss'
    if (perfect) {
      nextHits += 1
      nextStreak += 1
      kind = 'perfect'
      setMsg('Swish!')
      setPopup(nextStreak >= 3 ? `${nextStreak}x FIRE!` : nextStreak >= 2 ? `${nextStreak}x Combo!` : 'Perfect!')
      setLastPerfect(true)
      setNetSwish(true)
      setCrowd(1)
      setShake(0.35)
    } else if (okay) {
      nextHits += 1
      nextStreak += 1
      kind = 'score'
      setMsg('Nice dunk!')
      setPopup(nextStreak >= 2 ? `${nextStreak}x Combo!` : 'Score!')
      setLastPerfect(false)
      setNetSwish(true)
      setCrowd(0.75)
      setShake(0.2)
    } else if (rim) {
      nextStreak = 0
      kind = 'rim'
      setMsg('Off the rim!')
      setPopup('Clang!')
      setLastPerfect(false)
      setCrowd(0.4)
      setShake(0.55)
    } else {
      nextStreak = 0
      kind = 'miss'
      setMsg('Air ball — try the green zone')
      setPopup('Miss')
      setLastPerfect(false)
      setCrowd(0.2)
      setShake(0.25)
    }
    const finalBest = Math.max(bestStreak, nextStreak)
    setHits(nextHits)
    setThrows(nextThrows)
    setStreak(nextStreak)
    setBestStreak(finalBest)
    setShotKind(kind)
    setPhase('flying')
    flightRef.current = 0
    setFlight(0)
    if (nextThrows >= 5) {
      setDone(true)
      const comboBonus = Math.min(16, finalBest * 2 + (nextStreak >= 2 ? nextStreak * 2 : 0))
      const coins = 4 + nextHits * 7 + comboBonus + (kind === 'perfect' ? 3 : 0)
      setCoinsEarned(coins)
      window.setTimeout(() => {
        running.current = false
        grant(coins, nextHits >= 3 ? 2 : 1, true)
      }, 750)
    }
  }

  const replay = () => {
    running.current = true
    setMeter(0)
    setDir(1)
    setThrows(0)
    setHits(0)
    setStreak(0)
    setBestStreak(0)
    setDone(false)
    setMsg('Tap when the bar is in the green zone')
    setPhase('aim')
    setFlight(0)
    setLastPerfect(false)
    setShotKind(null)
    setPopup(null)
    setCrowd(0.35)
    setShake(0)
    setNetSwish(false)
    setCoinsEarned(0)
    flightRef.current = 0
  }

  const rimWobble = shotKind === 'rim' ? Math.sin(flight * Math.PI * 6) * 18 : 0
  const arcX =
    Math.sin(flight * Math.PI) * (lastPerfect ? 6 : shotKind === 'rim' ? 28 + rimWobble : meter > 0.75 || meter < 0.25 ? 38 : 14)
  const arcY =
    shotKind === 'rim'
      ? flight * 95 - Math.sin(flight * Math.PI) * 55 + Math.abs(Math.sin(flight * Math.PI * 3)) * 12
      : flight * 112 - Math.sin(flight * Math.PI) * 72
  const ballScale = 1 - flight * (shotKind === 'miss' ? 0.15 : 0.28)

  return (
    <div className="minigame-overlay">
      <div
        className={`minigame-frame dunk ${shake > 0 ? 'dunk-shake' : ''} ${streak >= 3 ? 'dunk-hot' : ''}`}
        style={{ ['--shake' as string]: `${shake * 6}px` }}
      >
        <div className="minigame-top">
          <h2>Dunk-a-Pet</h2>
          <p>
            {hits}/{throws} hits · streak {streak} · best {bestStreak} · 5 throws
          </p>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        <div className="dunk-scoreboard" aria-hidden>
          <span>{hits * 2}</span>
          <em>PTS</em>
          <span className="dunk-crowd-meter" style={{ ['--crowd' as string]: String(crowd) }} />
        </div>
        <div className={`dunk-court ${netSwish ? 'swishing' : ''} ${shotKind === 'rim' ? 'rim-hit' : ''}`}>
          <div className="dunk-crowd" style={{ opacity: 0.35 + crowd * 0.55 }} />
          <div className="dunk-backboard" />
          <div className={`dunk-hoop ${shotKind === 'rim' && phase !== 'aim' ? 'clang' : ''}`} />
          <div className={`dunk-net ${netSwish ? 'swish' : ''}`} />
          <div className="dunk-pet" aria-hidden />
          <div
            className={`dunk-ball ${phase === 'flying' ? 'flying' : ''} ${lastPerfect && phase !== 'aim' ? 'swish' : ''} ${shotKind === 'rim' ? 'rimball' : ''}`}
            style={{
              ['--lift' as string]: `${phase === 'aim' ? meter * 36 : arcY}px`,
              ['--drift' as string]: `${phase === 'aim' ? 0 : arcX}px`,
              ['--scale' as string]: String(phase === 'aim' ? 1 : ballScale),
            }}
          />
          {popup ? (
            <div className={`dunk-popup ${popup === 'Miss' || popup === 'Clang!' ? 'miss' : 'hit'}`}>{popup}</div>
          ) : null}
        </div>
        <div className="dunk-meter">
          <div className="dunk-zone dunk-zone-soft" />
          <div className="dunk-zone" />
          <div className="dunk-needle" style={{ left: `${meter * 100}%` }} />
        </div>
        <p className="dunk-msg">{done ? `Game over · +${coinsEarned}c` : msg}</p>
        {done ? (
          <div className="minigame-actions">
            <button type="button" className="name-submit" onClick={replay}>
              Play again
            </button>
            <button type="button" className="name-submit" onClick={() => setOverlay('none')}>
              Back to pet
            </button>
          </div>
        ) : (
          <button type="button" className="name-submit" disabled={phase !== 'aim'} onClick={toss}>
            {phase === 'flying' ? '…' : 'Toss'}
          </button>
        )}
      </div>
    </div>
  )
}
