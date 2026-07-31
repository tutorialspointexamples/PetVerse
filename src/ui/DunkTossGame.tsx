import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../state/gameStore'

export function DunkTossGame() {
  const grant = useGameStore((s) => s.grantMinigameReward)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const [meter, setMeter] = useState(0)
  const [dir, setDir] = useState(1)
  const [throws, setThrows] = useState(0)
  const [hits, setHits] = useState(0)
  const [done, setDone] = useState(false)
  const [msg, setMsg] = useState('Tap when the bar is in the green zone')
  const running = useRef(true)

  useEffect(() => {
    let frame = 0
    let last = performance.now()
    const loop = (now: number) => {
      if (!running.current) return
      const dt = (now - last) / 1000
      last = now
      setMeter((m) => {
        let next = m + dir * dt * 1.35
        if (next >= 1) {
          next = 1
          setDir(-1)
        } else if (next <= 0) {
          next = 0
          setDir(1)
        }
        return next
      })
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => {
      running.current = false
      cancelAnimationFrame(frame)
    }
  }, [dir])

  const toss = () => {
    if (done) return
    const perfect = meter > 0.42 && meter < 0.62
    const okay = meter > 0.3 && meter < 0.75
    const nextThrows = throws + 1
    let nextHits = hits
    if (perfect) {
      nextHits += 1
      setMsg('Swish!')
    } else if (okay) {
      nextHits += 1
      setMsg('Nice dunk!')
    } else {
      setMsg('Miss — try the green zone')
    }
    setHits(nextHits)
    setThrows(nextThrows)
    if (nextThrows >= 5) {
      setDone(true)
      running.current = false
      const coins = 4 + nextHits * 6
      grant(coins, nextHits >= 3 ? 2 : 1)
    }
  }

  return (
    <div className="minigame-overlay">
      <div className="minigame-frame dunk">
        <div className="minigame-top">
          <h2>Dunk Toss</h2>
          <p>
            {hits}/{throws} hits · 5 throws
          </p>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        <div className="dunk-court">
          <div className="dunk-hoop" />
          <div className="dunk-ball" style={{ ['--lift' as string]: `${meter * 80}px` }} />
        </div>
        <div className="dunk-meter">
          <div className="dunk-zone" />
          <div className="dunk-needle" style={{ left: `${meter * 100}%` }} />
        </div>
        <p className="dunk-msg">{msg}</p>
        <button type="button" className="name-submit" disabled={done} onClick={toss}>
          {done ? 'Rewards saved' : 'Toss'}
        </button>
      </div>
    </div>
  )
}
