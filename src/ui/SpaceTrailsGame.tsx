import { useEffect, useRef, useState } from 'react'
import { Application, Container, Graphics, Text } from 'pixi.js'
import { useGameStore } from '../state/gameStore'

/** Snake-style trail collector — Space Trails analogue. */
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
    const cell = 22
    let dir = { x: 1, y: 0 }
    let nextDir = { x: 1, y: 0 }
    let snake: { x: number; y: number }[] = [
      { x: 6, y: 8 },
      { x: 5, y: 8 },
      { x: 4, y: 8 },
    ]
    let star = { x: 12, y: 6 }
    let stepAcc = 0
    const stepEvery = 0.16

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

      const turnToward = (tx: number, ty: number) => {
        if (!living) return
        const head = snake[0]
        const cols = Math.max(8, Math.floor(app.screen.width / cell))
        const rows = Math.max(8, Math.floor(app.screen.height / cell))
        const gx = Math.max(0, Math.min(cols - 1, Math.floor(tx / cell)))
        const gy = Math.max(0, Math.min(rows - 1, Math.floor(ty / cell)))
        const dx = gx - head.x
        const dy = gy - head.y
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx !== 0 && dir.x === 0) nextDir = { x: dx > 0 ? 1 : -1, y: 0 }
        } else if (dy !== 0 && dir.y === 0) {
          nextDir = { x: 0, y: dy > 0 ? 1 : -1 }
        }
      }

      const onPointer = (e: PointerEvent) => {
        const rect = app.canvas.getBoundingClientRect()
        turnToward(e.clientX - rect.left, e.clientY - rect.top)
      }
      app.canvas.addEventListener('pointerdown', onPointer)

      app.ticker.add((t) => {
        if (!living || disposed) return
        const dt = t.deltaMS / 1000
        const cols = Math.max(8, Math.floor(app.screen.width / cell))
        const rows = Math.max(8, Math.floor(app.screen.height / cell))
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
        for (let i = 0; i < 18; i++) {
          const sx = ((i * 73 + scoreLocal * 9) % (app.screen.width + 40)) - 20
          const sy = (i * 47) % app.screen.height
          gfx.circle(sx, sy, 1.5)
          gfx.fill({ color: 0xffffff, alpha: 0.35 })
        }
        gfx.circle(star.x * cell + cell / 2, star.y * cell + cell / 2, 8)
        gfx.fill(0xf4d35e)
        snake.forEach((s, i) => {
          gfx.roundRect(s.x * cell + 2, s.y * cell + 2, cell - 4, cell - 4, 6)
          gfx.fill(i === 0 ? 0xf4a261 : 0xe76f51)
        })
      })
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
          <h2>Space Trails</h2>
          <p>Stars {score} · Tap ahead to steer · Grow the trail</p>
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
