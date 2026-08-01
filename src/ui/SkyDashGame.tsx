import { useEffect, useRef, useState } from 'react'
import { Application, Container, Graphics, Text } from 'pixi.js'
import { useGameStore } from '../state/gameStore'

type ObstacleKind = 'block' | 'coin' | 'ring' | 'boost'

interface Obstacle {
  x: number
  y: number
  w: number
  h: number
  kind: ObstacleKind
  spin: number
  taken?: boolean
}

export function SkyDashGame() {
  const hostRef = useRef<HTMLDivElement>(null)
  const grant = useGameStore((s) => s.grantMinigameReward)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [alive, setAlive] = useState(true)
  const [endCoins, setEndCoins] = useState(0)
  const [runKey, setRunKey] = useState(0)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let disposed = false
    const app = new Application()
    let scoreLocal = 0
    let comboLocal = 0
    let living = true
    const pet = { y: 0, vy: 0 }
    const obstacles: Obstacle[] = []
    let spawn = 0
    let boostT = 0
    let nearMissFlash = 0

    const finish = (finalScore: number) => {
      living = false
      setAlive(false)
      const coins = Math.min(48, 5 + Math.floor(finalScore / 2.5))
      const fuel = finalScore >= 30 ? 2 : 1
      grant(coins, fuel, true)
      setEndCoins(coins)
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
        style: {
          fill: 0xffffff,
          fontSize: 28,
          fontFamily: 'Fredoka, Nunito, sans-serif',
          fontWeight: '700',
        },
      })
      label.position.set(16, 16)
      root.addChild(gfx, label)

      const onTap = () => {
        if (!living) return
        pet.vy = boostT > 0 ? -380 : -320
      }
      app.canvas.addEventListener('pointerdown', onTap)

      app.ticker.add((t) => {
        if (!living || disposed) return
        const dt = t.deltaMS / 1000
        const w = app.screen.width
        const h = app.screen.height
        if (pet.y === 0) pet.y = h * 0.45

        boostT = Math.max(0, boostT - dt)
        nearMissFlash = Math.max(0, nearMissFlash - dt)
        const speed = (220 + scoreLocal * 2.2) * (boostT > 0 ? 1.35 : 1)

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
          spawn = 0.7 + Math.random() * 0.45
          const roll = Math.random()
          const y = 60 + Math.random() * (h - 120)
          if (roll < 0.28) {
            obstacles.push({ x: w + 20, y, w: 28, h: 28, kind: 'coin', spin: 0 })
          } else if (roll < 0.48) {
            obstacles.push({ x: w + 30, y, w: 54, h: 54, kind: 'ring', spin: Math.random() * Math.PI })
          } else if (roll < 0.58) {
            obstacles.push({ x: w + 20, y, w: 36, h: 22, kind: 'boost', spin: 0 })
          } else {
            obstacles.push({
              x: w + 20,
              y,
              w: 36,
              h: 50 + Math.random() * 40,
              kind: 'block',
              spin: 0,
            })
          }
        }

        const px = w * 0.22
        const py = pet.y
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const o = obstacles[i]
          o.x -= speed * dt
          o.spin += dt * 3
          if (o.x < -60) {
            obstacles.splice(i, 1)
            continue
          }
          const hit =
            Math.abs(px - o.x) < o.w * 0.5 + 18 && Math.abs(py - o.y) < o.h * 0.5 + 18
          const near =
            !hit &&
            o.kind === 'block' &&
            Math.abs(px - o.x) < o.w * 0.5 + 34 &&
            Math.abs(py - o.y) < o.h * 0.5 + 28
          if (near && nearMissFlash <= 0) {
            nearMissFlash = 0.35
            comboLocal += 1
            scoreLocal += 1
            setCombo(comboLocal)
            setScore(Math.floor(scoreLocal))
          }
          if (!hit || o.taken) continue
          if (o.kind === 'coin') {
            comboLocal += 1
            scoreLocal += 2 + Math.min(4, comboLocal)
            o.taken = true
            obstacles.splice(i, 1)
            setCombo(comboLocal)
            setScore(Math.floor(scoreLocal))
          } else if (o.kind === 'ring') {
            comboLocal += 2
            scoreLocal += 5 + Math.min(6, comboLocal)
            o.taken = true
            obstacles.splice(i, 1)
            setCombo(comboLocal)
            setScore(Math.floor(scoreLocal))
          } else if (o.kind === 'boost') {
            boostT = 1.6
            comboLocal += 1
            scoreLocal += 3
            o.taken = true
            obstacles.splice(i, 1)
            setCombo(comboLocal)
            setScore(Math.floor(scoreLocal))
          } else {
            finish(scoreLocal)
            return
          }
        }

        scoreLocal += dt * (boostT > 0 ? 2.4 : 1.5)
        setScore(Math.floor(scoreLocal))
        label.text =
          comboLocal > 1
            ? `${Math.floor(scoreLocal)}  ·  ${comboLocal}x`
            : String(Math.floor(scoreLocal))

        gfx.clear()
        // layered sky
        gfx.rect(0, 0, w, h * 0.55)
        gfx.fill(boostT > 0 ? 0x2f6f8a : 0x244e66)
        gfx.rect(0, h * 0.55, w, h * 0.45)
        gfx.fill(0x163442)
        // distant hills
        for (let i = 0; i < 5; i++) {
          const hx = ((i * 180 - (scoreLocal * 18) % 900) + 900) % (w + 160) - 80
          gfx.ellipse(hx, h * 0.62, 90, 36)
          gfx.fill({ color: 0x1a4a3a, alpha: 0.45 })
        }
        // clouds
        for (let i = 0; i < 6; i++) {
          const cx = ((i * 160 - (scoreLocal * 30) % 800) + 800) % (w + 100) - 50
          gfx.ellipse(cx, 40 + i * 28, 42, 16)
          gfx.fill({ color: 0xffffff, alpha: 0.18 })
          gfx.ellipse(cx + 18, 36 + i * 28, 28, 12)
          gfx.fill({ color: 0xffffff, alpha: 0.12 })
        }
        // pet with wing flap + boost trail
        const flap = pet.vy < 0 ? -6 : 4
        if (boostT > 0) {
          gfx.ellipse(px - 28, py, 18, 8)
          gfx.fill({ color: 0xffbe0b, alpha: 0.45 })
          gfx.ellipse(px - 40, py + 4, 14, 5)
          gfx.fill({ color: 0xff006e, alpha: 0.35 })
        }
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
        if (nearMissFlash > 0) {
          gfx.circle(px, py, 30 + (0.35 - nearMissFlash) * 20)
          gfx.stroke({ width: 2, color: 0xf4d35e, alpha: nearMissFlash / 0.35 })
        }
        for (const o of obstacles) {
          if (o.kind === 'coin') {
            gfx.circle(o.x, o.y, 14)
            gfx.fill({ color: 0xf4d35e, alpha: 0.25 })
            gfx.circle(o.x, o.y, 10)
            gfx.fill(0xf4d35e)
            gfx.circle(o.x - 2, o.y - 2, 3)
            gfx.fill({ color: 0xffffff, alpha: 0.45 })
          } else if (o.kind === 'ring') {
            const pulse = 1 + Math.sin(o.spin * 2) * 0.06
            gfx.circle(o.x, o.y, 24 * pulse)
            gfx.stroke({ width: 5, color: 0x4cc9f0, alpha: 0.9 })
            gfx.circle(o.x, o.y, 16 * pulse)
            gfx.stroke({ width: 2, color: 0xffffff, alpha: 0.35 })
          } else if (o.kind === 'boost') {
            gfx.roundRect(o.x - o.w / 2, o.y - o.h / 2, o.w, o.h, 8)
            gfx.fill(0xffbe0b)
            gfx.moveTo(o.x - 6, o.y + 6)
            gfx.lineTo(o.x, o.y - 8)
            gfx.lineTo(o.x + 6, o.y + 6)
            gfx.closePath()
            gfx.fill(0xffffff)
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
  }, [grant, runKey])

  return (
    <div className="minigame-overlay">
      <div className="minigame-frame">
        <div className="minigame-top">
          <h2>Sky Race</h2>
          <p>
            Score {Math.floor(score)}
            {combo > 1 ? ` · ${combo}x combo` : ''} · Rings & boosts · Tap to flap
          </p>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        <div className="minigame-canvas" ref={hostRef} />
        {!alive ? (
          <div className="minigame-end">
            <p>Run over · +{endCoins}c</p>
            <div className="minigame-actions">
              <button
                type="button"
                className="name-submit"
                onClick={() => {
                  setAlive(true)
                  setScore(0)
                  setCombo(0)
                  setEndCoins(0)
                  setRunKey((k) => k + 1)
                }}
              >
                Play again
              </button>
              <button type="button" className="name-submit" onClick={() => setOverlay('none')}>
                Back to pet
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
