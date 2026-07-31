import { useEffect, useRef, useState } from 'react'
import { Application, Container, Graphics, Text } from 'pixi.js'
import { useGameStore } from '../state/gameStore'

/** Snake-style trail collector — Space Trails analogue with swipe + arrow controls. */
export function SpaceTrailsGame() {
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
    let living = true
    let scoreLocal = 0
    const cell = 24
    let dir = { x: 1, y: 0 }
    let nextDir = { x: 1, y: 0 }
    let snake: { x: number; y: number }[] = [
      { x: 6, y: 8 },
      { x: 5, y: 8 },
      { x: 4, y: 8 },
    ]
    let star = { x: 12, y: 6 }
    let stepAcc = 0
    let stepEvery = 0.18
    let animTime = 0
    let pointerDown: { x: number; y: number } | null = null

    const finish = (finalScore: number) => {
      if (!living) return
      living = false
      setAlive(false)
      const coins = Math.min(45, 6 + Math.floor(finalScore / 2))
      grant(coins, finalScore >= 12 ? 2 : 1)
    }

    const placeStar = (cols: number, rows: number) => {
      for (let tries = 0; tries < 40; tries++) {
        const x = 1 + Math.floor(Math.random() * (cols - 2))
        const y = 1 + Math.floor(Math.random() * (rows - 2))
        if (!snake.some((s) => s.x === x && s.y === y)) {
          star = { x, y }
          return
        }
      }
    }

    const queueDir = (nx: number, ny: number) => {
      if (!living) return
      // Prevent instant reverse into self
      if (nx === -dir.x && ny === -dir.y) return
      if (nx === 0 && ny === 0) return
      nextDir = { x: nx, y: ny }
    }

    void (async () => {
      await app.init({
        resizeTo: host,
        background: 0x0b132b,
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

      const onPointerDown = (e: PointerEvent) => {
        const rect = app.canvas.getBoundingClientRect()
        pointerDown = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      }

      const onPointerUp = (e: PointerEvent) => {
        if (!pointerDown || !living) {
          pointerDown = null
          return
        }
        const rect = app.canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const dx = x - pointerDown.x
        const dy = y - pointerDown.y
        pointerDown = null
        const absX = Math.abs(dx)
        const absY = Math.abs(dy)
        // Prefer swipe direction; fall back to tap-ahead relative to head
        if (absX > 18 || absY > 18) {
          if (absX > absY) queueDir(dx > 0 ? 1 : -1, 0)
          else queueDir(0, dy > 0 ? 1 : -1)
        } else {
          const head = snake[0]
          const gx = Math.floor(x / cell)
          const gy = Math.floor(y / cell)
          const tdx = gx - head.x
          const tdy = gy - head.y
          if (Math.abs(tdx) > Math.abs(tdy)) queueDir(tdx > 0 ? 1 : -1, 0)
          else if (tdy !== 0) queueDir(0, tdy > 0 ? 1 : -1)
        }
      }

      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft' || e.key === 'a') queueDir(-1, 0)
        else if (e.key === 'ArrowRight' || e.key === 'd') queueDir(1, 0)
        else if (e.key === 'ArrowUp' || e.key === 'w') queueDir(0, -1)
        else if (e.key === 'ArrowDown' || e.key === 's') queueDir(0, 1)
      }

      app.canvas.addEventListener('pointerdown', onPointerDown)
      app.canvas.addEventListener('pointerup', onPointerUp)
      app.canvas.addEventListener('pointercancel', () => {
        pointerDown = null
      })
      window.addEventListener('keydown', onKey)

      app.ticker.add((t) => {
        if (!living || disposed) return
        const dt = t.deltaMS / 1000
        animTime += dt
        const cols = Math.max(8, Math.floor(app.screen.width / cell))
        const rows = Math.max(8, Math.floor(app.screen.height / cell))
        // Slight speed-up as trail grows (capped)
        stepEvery = Math.max(0.11, 0.18 - scoreLocal * 0.004)
        stepAcc += dt
        while (stepAcc >= stepEvery) {
          stepAcc -= stepEvery
          dir = nextDir
          const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }
          if (head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows) {
            finish(scoreLocal)
            return
          }
          if (snake.some((s) => s.x === head.x && s.y === head.y)) {
            finish(scoreLocal)
            return
          }
          snake.unshift(head)
          if (head.x === star.x && head.y === star.y) {
            scoreLocal += 1
            setScore(scoreLocal)
            placeStar(cols, rows)
          } else {
            snake.pop()
          }
        }

        label.text = String(scoreLocal)
        gfx.clear()
        for (let i = 0; i < 24; i++) {
          const sx = ((i * 73 + scoreLocal * 9 + animTime * 20) % (app.screen.width + 40)) - 20
          const sy = (i * 47 + Math.sin(i + scoreLocal) * 8) % app.screen.height
          gfx.circle(sx, sy, 1.5)
          gfx.fill({ color: 0xffffff, alpha: 0.35 })
        }
        // Soft aim halo on star
        gfx.circle(star.x * cell + cell / 2, star.y * cell + cell / 2, 14)
        gfx.fill({ color: 0xf4d35e, alpha: 0.2 })
        gfx.circle(star.x * cell + cell / 2, star.y * cell + cell / 2, 8)
        gfx.fill(0xf4d35e)
        snake.forEach((s, i) => {
          const alpha = 1 - i / Math.max(snake.length, 1) * 0.35
          gfx.roundRect(s.x * cell + 2, s.y * cell + 2, cell - 4, cell - 4, 6)
          gfx.fill({ color: i === 0 ? 0xf4a261 : 0xe76f51, alpha })
          if (i === 0) {
            // Nose cue for facing direction
            const cx = s.x * cell + cell / 2 + dir.x * 6
            const cy = s.y * cell + cell / 2 + dir.y * 6
            gfx.circle(cx, cy, 3)
            gfx.fill(0xffffff)
          }
        })
      })

      // cleanup listeners via destroy path
      ;(app as Application & { __cleanup?: () => void }).__cleanup = () => {
        app.canvas.removeEventListener('pointerdown', onPointerDown)
        app.canvas.removeEventListener('pointerup', onPointerUp)
        window.removeEventListener('keydown', onKey)
      }
    })()

    return () => {
      disposed = true
      living = false
      try {
        const cleanup = (app as Application & { __cleanup?: () => void }).__cleanup
        cleanup?.()
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
          <h2>Space Trails</h2>
          <p>Stars {score} · Swipe or arrows to steer · Grow the trail</p>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        <div className="minigame-canvas" ref={hostRef} />
        {!alive ? <p className="minigame-end">Trail ended — rewards saved</p> : null}
      </div>
    </div>
  )
}
