import { useEffect, useRef, useState } from 'react'
import { Application, Container, Graphics, Text } from 'pixi.js'
import { useGameStore } from '../state/gameStore'

type Cell = { x: number; y: number }
type Pickup = Cell & { kind: 'star' | 'comet' }

/** Snake-style trail collector — Space Trails with asteroids, comets, and neon juice. */
export function SpaceTrailsGame() {
  const hostRef = useRef<HTMLDivElement>(null)
  const grant = useGameStore((s) => s.grantMinigameReward)
  const collectCard = useGameStore((s) => s.collectCard)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [alive, setAlive] = useState(true)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let disposed = false
    const app = new Application()
    let living = true
    let scoreLocal = 0
    let comboLocal = 0
    let comboTimer = 0
    let caughtComet = false
    const cell = 24
    let dir = { x: 1, y: 0 }
    let nextDir = { x: 1, y: 0 }
    let snake: Cell[] = [
      { x: 6, y: 8 },
      { x: 5, y: 8 },
      { x: 4, y: 8 },
    ]
    let pickup: Pickup = { x: 12, y: 6, kind: 'star' }
    let asteroids: Cell[] = []
    let stepAcc = 0
    let stepEvery = 0.18
    let animTime = 0
    let pointerDown: { x: number; y: number } | null = null
    const bursts: Array<{ x: number; y: number; life: number; color: number }> = []

    const finish = (finalScore: number) => {
      if (!living) return
      living = false
      setAlive(false)
      const coins = Math.min(55, 8 + Math.floor(finalScore / 1.6))
      if (caughtComet) collectCard('comet_core')
      grant(coins, finalScore >= 10 ? 2 : 1)
    }

    const occupied = (x: number, y: number) =>
      snake.some((s) => s.x === x && s.y === y) || asteroids.some((a) => a.x === x && a.y === y)

    const placePickup = (cols: number, rows: number) => {
      for (let tries = 0; tries < 50; tries++) {
        const x = 1 + Math.floor(Math.random() * (cols - 2))
        const y = 1 + Math.floor(Math.random() * (rows - 2))
        if (!occupied(x, y)) {
          pickup = { x, y, kind: Math.random() < 0.22 ? 'comet' : 'star' }
          return
        }
      }
    }

    const seedAsteroids = (cols: number, rows: number, count: number) => {
      asteroids = []
      for (let n = 0; n < count; n++) {
        for (let tries = 0; tries < 30; tries++) {
          const x = 1 + Math.floor(Math.random() * (cols - 2))
          const y = 1 + Math.floor(Math.random() * (rows - 2))
          if (!occupied(x, y) && !(x === pickup.x && y === pickup.y) && x > 8) {
            asteroids.push({ x, y })
            break
          }
        }
      }
    }

    const queueDir = (nx: number, ny: number) => {
      if (!living) return
      if (nx === -dir.x && ny === -dir.y) return
      if (nx === 0 && ny === 0) return
      nextDir = { x: nx, y: ny }
    }

    void (async () => {
      await app.init({
        resizeTo: host,
        background: 0x070b1a,
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
      const comboLabel = new Text({
        text: '',
        style: {
          fill: 0xf4d35e,
          fontSize: 18,
          fontFamily: 'Fredoka, Nunito, sans-serif',
          fontWeight: '700',
        },
      })
      label.position.set(16, 16)
      comboLabel.position.set(16, 48)
      root.addChild(gfx, label, comboLabel)

      const cols0 = Math.max(10, Math.floor(app.screen.width / cell))
      const rows0 = Math.max(10, Math.floor(app.screen.height / cell))
      seedAsteroids(cols0, rows0, 5)
      placePickup(cols0, rows0)

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
        if (absX > 14 || absY > 14) {
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
        comboTimer = Math.max(0, comboTimer - dt)
        if (comboTimer <= 0 && comboLocal > 0) {
          comboLocal = 0
          setCombo(0)
        }
        const cols = Math.max(10, Math.floor(app.screen.width / cell))
        const rows = Math.max(10, Math.floor(app.screen.height / cell))
        stepEvery = Math.max(0.1, 0.18 - scoreLocal * 0.0035)
        stepAcc += dt
        while (stepAcc >= stepEvery) {
          stepAcc -= stepEvery
          dir = nextDir
          // Soft wrap edges (portal lanes) — MTT2 Space Trails feel without hard walls
          let nx = snake[0].x + dir.x
          let ny = snake[0].y + dir.y
          if (nx < 0) nx = cols - 1
          if (ny < 0) ny = rows - 1
          if (nx >= cols) nx = 0
          if (ny >= rows) ny = 0
          const head = { x: nx, y: ny }
          if (snake.some((s) => s.x === head.x && s.y === head.y)) {
            finish(scoreLocal)
            return
          }
          if (asteroids.some((a) => a.x === head.x && a.y === head.y)) {
            finish(scoreLocal)
            return
          }
          snake.unshift(head)
          if (head.x === pickup.x && head.y === pickup.y) {
            const gain = pickup.kind === 'comet' ? 3 : 1
            if (pickup.kind === 'comet') caughtComet = true
            const mult = 1 + Math.min(4, Math.floor(comboLocal / 3))
            scoreLocal += gain * mult
            comboLocal += 1
            comboTimer = 2.4
            setScore(scoreLocal)
            setCombo(comboLocal)
            bursts.push({
              x: head.x * cell + cell / 2,
              y: head.y * cell + cell / 2,
              life: 0.45,
              color: pickup.kind === 'comet' ? 0x00f5d4 : 0xf4d35e,
            })
            placePickup(cols, rows)
            if (scoreLocal > 0 && scoreLocal % 8 === 0 && asteroids.length < 12) {
              for (let tries = 0; tries < 30; tries++) {
                const x = 1 + Math.floor(Math.random() * (cols - 2))
                const y = 1 + Math.floor(Math.random() * (rows - 2))
                if (!occupied(x, y) && !(x === pickup.x && y === pickup.y)) {
                  asteroids.push({ x, y })
                  break
                }
              }
            }
          } else {
            snake.pop()
          }
          // Drift asteroids slowly every few steps
          if (scoreLocal > 0 && Math.random() < 0.08) {
            asteroids = asteroids.map((a, i) => {
              const d = i % 2 === 0 ? 1 : -1
              let ax = a.x + (Math.random() < 0.5 ? d : 0)
              let ay = a.y + (Math.random() < 0.5 ? 0 : d)
              if (ax < 0) ax = cols - 1
              if (ay < 0) ay = rows - 1
              if (ax >= cols) ax = 0
              if (ay >= rows) ay = 0
              if (snake.some((s) => s.x === ax && s.y === ay)) return a
              return { x: ax, y: ay }
            })
          }
        }

        label.text = String(scoreLocal)
        comboLabel.text = comboLocal >= 2 ? `Combo x${1 + Math.min(4, Math.floor(comboLocal / 3))}` : ''
        gfx.clear()

        // Nebula bands
        for (let i = 0; i < 6; i++) {
          const bx = ((i * 97 + animTime * 12) % (app.screen.width + 120)) - 60
          const by = (i * 71 + Math.sin(animTime + i) * 20) % app.screen.height
          gfx.ellipse(bx, by, 70, 28)
          gfx.fill({ color: i % 2 ? 0x3a0ca3 : 0x1d3557, alpha: 0.14 })
        }
        for (let i = 0; i < 36; i++) {
          const sx = ((i * 73 + scoreLocal * 9 + animTime * 28) % (app.screen.width + 40)) - 20
          const sy = (i * 47 + Math.sin(i + scoreLocal) * 8) % app.screen.height
          gfx.circle(sx, sy, i % 5 === 0 ? 2.2 : 1.2)
          gfx.fill({ color: 0xffffff, alpha: 0.28 + (i % 3) * 0.1 })
        }

        // Asteroids
        for (const a of asteroids) {
          const cx = a.x * cell + cell / 2
          const cy = a.y * cell + cell / 2
          const wob = Math.sin(animTime * 3 + a.x) * 1.5
          gfx.circle(cx + wob, cy, 9)
          gfx.fill(0x6c757d)
          gfx.circle(cx - 3 + wob, cy - 2, 3)
          gfx.fill({ color: 0x343a40, alpha: 0.6 })
        }

        // Pickup glow
        const pcx = pickup.x * cell + cell / 2
        const pcy = pickup.y * cell + cell / 2
        const pulse = 12 + Math.sin(animTime * 8) * 3
        gfx.circle(pcx, pcy, pulse + 4)
        gfx.fill({ color: pickup.kind === 'comet' ? 0x00f5d4 : 0xf4d35e, alpha: 0.18 })
        gfx.circle(pcx, pcy, 8)
        gfx.fill(pickup.kind === 'comet' ? 0x00f5d4 : 0xf4d35e)
        if (pickup.kind === 'comet') {
          gfx.moveTo(pcx - 10, pcy)
          gfx.lineTo(pcx - 22, pcy + 4)
          gfx.stroke({ width: 3, color: 0x80ffdb, alpha: 0.7 })
        }

        // Neon trail
        snake.forEach((s, i) => {
          const alpha = 1 - (i / Math.max(snake.length, 1)) * 0.4
          const cx = s.x * cell + cell / 2
          const cy = s.y * cell + cell / 2
          if (i === 0) {
            gfx.circle(cx, cy, 12)
            gfx.fill({ color: 0xf4a261, alpha: 0.35 })
          }
          gfx.roundRect(s.x * cell + 2, s.y * cell + 2, cell - 4, cell - 4, 7)
          gfx.fill({ color: i === 0 ? 0xffbe0b : i % 2 ? 0xe76f51 : 0xf4a261, alpha })
          if (i === 0) {
            gfx.circle(cx + dir.x * 6, cy + dir.y * 6, 3.5)
            gfx.fill(0xffffff)
          }
        })

        for (let i = bursts.length - 1; i >= 0; i--) {
          const b = bursts[i]
          b.life -= dt
          if (b.life <= 0) {
            bursts.splice(i, 1)
            continue
          }
          const a = b.life / 0.45
          gfx.circle(b.x, b.y, 10 + (1 - a) * 18)
          gfx.stroke({ width: 2, color: b.color, alpha: a })
        }
      })

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
  }, [grant, collectCard])

  return (
    <div className="minigame-overlay">
      <div className="minigame-frame">
        <div className="minigame-top">
          <h2>Space Trails</h2>
          <p>
            Stars {score}
            {combo >= 2 ? ` · Combo ${combo}` : ''} · Swipe/arrows · Wrap edges · Dodge rocks
          </p>
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
