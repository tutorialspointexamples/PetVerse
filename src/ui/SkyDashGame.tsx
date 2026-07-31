import { useEffect, useRef, useState } from 'react'
import { Application, Container, Graphics, Text } from 'pixi.js'
import { useGameStore } from '../state/gameStore'

interface Obstacle {
  x: number
  y: number
  w: number
  h: number
  good: boolean
}

export function SkyDashGame() {
  const hostRef = useRef<HTMLDivElement>(null)
  const grant = useGameStore((s) => s.grantMinigameReward)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const [score, setScore] = useState(0)
  const [alive, setAlive] = useState(true)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let disposed = false
    const app = new Application()
    let scoreLocal = 0
    let living = true
    const pet = { y: 0, vy: 0 }
    const obstacles: Obstacle[] = []
    let spawn = 0

    const finish = (finalScore: number) => {
      living = false
      setAlive(false)
      const coins = Math.min(40, 5 + Math.floor(finalScore / 3))
      const fuel = finalScore >= 25 ? 2 : 1
      grant(coins, fuel)
    }

    void (async () => {
      await app.init({
        resizeTo: host,
        background: 0x1b3a4b,
        antialias: true,
        resolution: Math.min(devicePixelRatio || 1, 2),
        autoDensity: true,
      })
      if (disposed) {
        app.destroy(true)
        return
      }
      host.appendChild(app.canvas)
      const root = new Container()
      app.stage.addChild(root)
      const gfx = new Graphics()
      const label = new Text({
        text: '0',
        style: { fill: 0xffffff, fontSize: 28, fontFamily: 'Fredoka, Nunito, sans-serif', fontWeight: '700' },
      })
      label.position.set(16, 16)
      root.addChild(gfx, label)

      const onTap = () => {
        if (!living) return
        pet.vy = -320
      }
      app.canvas.addEventListener('pointerdown', onTap)

      app.ticker.add((t) => {
        if (!living || disposed) return
        const dt = t.deltaMS / 1000
        const w = app.screen.width
        const h = app.screen.height
        pet.vy += 900 * dt
        pet.y += pet.vy * dt
        if (pet.y < 40) {
          pet.y = 40
          pet.vy = 0
        }
        if (pet.y > h - 40) {
          finish(scoreLocal)
          return
        }

        spawn -= dt
        if (spawn <= 0) {
          spawn = 0.9 + Math.random() * 0.5
          const good = Math.random() > 0.55
          obstacles.push({
            x: w + 20,
            y: 60 + Math.random() * (h - 120),
            w: good ? 28 : 36,
            h: good ? 28 : 50 + Math.random() * 40,
            good,
          })
        }

        const px = w * 0.22
        const py = pet.y
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const o = obstacles[i]
          o.x -= (220 + scoreLocal * 2) * dt
          if (o.x < -50) {
            obstacles.splice(i, 1)
            continue
          }
          const hit =
            Math.abs(px - o.x) < o.w * 0.5 + 18 && Math.abs(py - o.y) < o.h * 0.5 + 18
          if (hit) {
            if (o.good) {
              scoreLocal += 2
              setScore(scoreLocal)
              obstacles.splice(i, 1)
            } else {
              finish(scoreLocal)
              return
            }
          }
        }

        scoreLocal += dt * 1.5
        setScore(Math.floor(scoreLocal))
        label.text = String(Math.floor(scoreLocal))

        gfx.clear()
        // parallax sky bands
        gfx.rect(0, 0, w, h * 0.55)
        gfx.fill(0x244e66)
        gfx.rect(0, h * 0.55, w, h * 0.45)
        gfx.fill(0x163442)
        // clouds
        for (let i = 0; i < 6; i++) {
          const cx = ((i * 160 - (scoreLocal * 30) % 800) + 800) % (w + 100) - 50
          gfx.ellipse(cx, 40 + i * 28, 42, 16)
          gfx.fill({ color: 0xffffff, alpha: 0.18 })
          gfx.ellipse(cx + 18, 36 + i * 28, 28, 12)
          gfx.fill({ color: 0xffffff, alpha: 0.12 })
        }
        // pet with wing flap cue
        const flap = pet.vy < 0 ? -6 : 4
        gfx.ellipse(px - 16, py + flap, 10, 6)
        gfx.fill(0xe76f51)
        gfx.ellipse(px + 16, py - flap, 10, 6)
        gfx.fill(0xe76f51)
        gfx.circle(px, py, 22)
        gfx.fill(0xf4a261)
        gfx.ellipse(px, py + 6, 12, 10)
        gfx.fill(0xffe8c8)
        gfx.circle(px + 6, py - 4, 4)
        gfx.fill(0x243029)
        gfx.circle(px + 7, py - 5, 1.5)
        gfx.fill(0xffffff)
        for (const o of obstacles) {
          if (o.good) {
            gfx.circle(o.x, o.y, 14)
            gfx.fill({ color: 0xf4d35e, alpha: 0.25 })
            gfx.circle(o.x, o.y, 10)
            gfx.fill(0xf4d35e)
          } else {
            gfx.roundRect(o.x - o.w / 2, o.y - o.h / 2, o.w, o.h, 8)
            gfx.fill(0xe76f51)
            gfx.roundRect(o.x - o.w / 2 + 4, o.y - o.h / 2 + 4, o.w - 8, 8, 3)
            gfx.fill({ color: 0xffffff, alpha: 0.2 })
          }
        }
      })

      return () => {
        app.canvas.removeEventListener('pointerdown', onTap)
      }
    })()

    return () => {
      disposed = true
      living = false
      try {
        app.destroy(true, { children: true })
      } catch {
        /* ignore */
      }
    }
  }, [grant])

  return (
    <div className="minigame-overlay">
      <div className="minigame-frame">
        <div className="minigame-top">
          <h2>Sky Race</h2>
          <p>Score {Math.floor(score)} · Tap to flap · Grab coins, dodge blocks</p>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        <div className="minigame-canvas" ref={hostRef} />
        {!alive ? <p className="minigame-end">Run over — rewards saved</p> : null}
      </div>
    </div>
  )
}
