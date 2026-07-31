import { useEffect, useMemo, useRef, useState } from 'react'
import { Application, Graphics, Text } from 'pixi.js'
import { useGameStore } from '../state/gameStore'

type PartId = 'nose' | 'wings' | 'engine' | 'paint'

interface PartOption {
  id: string
  label: string
  bonus: number
}

const PARTS: Record<PartId, PartOption[]> = {
  nose: [
    { id: 'round', label: 'Round', bonus: 2 },
    { id: 'sharp', label: 'Sharp', bonus: 4 },
    { id: 'bubble', label: 'Bubble', bonus: 3 },
    { id: 'jet', label: 'Jet Cone', bonus: 5 },
  ],
  wings: [
    { id: 'short', label: 'Short', bonus: 2 },
    { id: 'wide', label: 'Wide', bonus: 4 },
    { id: 'delta', label: 'Delta', bonus: 5 },
    { id: 'biplane', label: 'Biplane', bonus: 6 },
  ],
  engine: [
    { id: 'putt', label: 'Putt', bonus: 2 },
    { id: 'turbo', label: 'Turbo', bonus: 5 },
    { id: 'rocket', label: 'Rocket', bonus: 6 },
    { id: 'twin', label: 'Twin Jet', bonus: 7 },
  ],
  paint: [
    { id: 'sky', label: 'Sky', bonus: 1 },
    { id: 'candy', label: 'Candy', bonus: 3 },
    { id: 'neon', label: 'Neon', bonus: 4 },
    { id: 'camo', label: 'Camo', bonus: 5 },
  ],
}

const ORDER: PartId[] = ['nose', 'wings', 'engine', 'paint']
const FLIGHT_SECONDS = 16

type Phase = 'build' | 'flight' | 'done'

/** Craft a plane, then flight-test it — Build Your Plane analogue. */
export function BuildPlaneGame() {
  const grant = useGameStore((s) => s.grantMinigameReward)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const [phase, setPhase] = useState<Phase>('build')
  const [step, setStep] = useState(0)
  const [picks, setPicks] = useState<Partial<Record<PartId, string>>>({})
  const [buildBonus, setBuildBonus] = useState(0)
  const [flightScore, setFlightScore] = useState(0)
  const [reward, setReward] = useState(0)
  const hostRef = useRef<HTMLDivElement>(null)
  const grantedRef = useRef(false)

  const partId = ORDER[step]
  const options = PARTS[partId]

  const preview = useMemo(() => {
    const nose = picks.nose ?? 'round'
    const wings = picks.wings ?? 'short'
    const engine = picks.engine ?? 'putt'
    const paint = picks.paint ?? 'sky'
    const colors: Record<string, string> = {
      sky: '#4cc9f0',
      candy: '#ff85a1',
      neon: '#00f5d4',
      camo: '#606c38',
    }
    return { nose, wings, engine, paint, color: colors[paint] ?? '#4cc9f0' }
  }, [picks])

  const choose = (optionId: string) => {
    if (phase !== 'build') return
    const next = { ...picks, [partId]: optionId }
    setPicks(next)
    if (step < ORDER.length - 1) {
      setStep(step + 1)
      return
    }
    let bonus = 8
    for (const id of ORDER) {
      const choice = next[id]
      const opt = PARTS[id].find((o) => o.id === choice)
      bonus += opt?.bonus ?? 0
    }
    setBuildBonus(bonus)
    setPhase('flight')
  }

  useEffect(() => {
    if (phase !== 'flight') return
    const host = hostRef.current
    if (!host) return

    let disposed = false
    let living = true
    let score = 0
    let elapsed = 0
    const app = new Application()
    const gfx = new Graphics()
    const label = new Text({
      text: 'Flight test · collect stars, dodge clouds',
      style: { fill: 0xffffff, fontSize: 15, fontFamily: 'Fredoka, system-ui', fontWeight: '700' },
    })

    type Obj = { x: number; y: number; kind: 'star' | 'cloud'; r: number; vy: number }
    const objs: Obj[] = []
    let spawnT = 0
    let planeY = 0
    let planeVy = 0
    let pointerY: number | null = null
    const handling = { speed: 1 + buildBonus / 40 }

    const finish = (finalScore: number) => {
      if (!living) return
      living = false
      setFlightScore(finalScore)
      const coins = Math.max(10, buildBonus + Math.floor(finalScore * 1.4))
      setReward(coins)
      setPhase('done')
      if (!grantedRef.current) {
        grantedRef.current = true
        grant(coins, finalScore >= 10 ? 3 : 2)
      }
    }

    void (async () => {
      await app.init({
        resizeTo: host,
        backgroundAlpha: 0,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
      })
      if (disposed) {
        app.destroy(true)
        return
      }
      host.appendChild(app.canvas)
      app.stage.addChild(gfx, label)
      label.position.set(12, 10)
      planeY = app.screen.height * 0.5

      const onMove = (e: PointerEvent) => {
        const rect = app.canvas.getBoundingClientRect()
        pointerY = e.clientY - rect.top
      }
      app.canvas.addEventListener('pointermove', onMove)
      app.canvas.addEventListener('pointerdown', onMove)

      app.ticker.add((ticker) => {
        if (!living || disposed) return
        const dt = ticker.deltaMS / 1000
        elapsed += dt
        const w = app.screen.width
        const h = app.screen.height
        const remain = Math.max(0, FLIGHT_SECONDS - elapsed)

        if (pointerY != null) {
          const target = pointerY
          planeY += (target - planeY) * Math.min(1, dt * 8)
        } else {
          planeVy += Math.sin(elapsed * 3) * 20 * dt
          planeY += planeVy * dt
          planeY = Math.max(40, Math.min(h - 40, planeY))
        }

        spawnT -= dt
        if (spawnT <= 0) {
          spawnT = 0.45 + Math.random() * 0.35
          const kind: Obj['kind'] = Math.random() < 0.55 ? 'star' : 'cloud'
          objs.push({
            x: w + 20,
            y: 40 + Math.random() * (h - 80),
            kind,
            r: kind === 'star' ? 12 : 28 + Math.random() * 16,
            vy: (Math.random() - 0.5) * 40,
          })
        }

        const px = w * 0.22
        const speed = (160 + buildBonus * 2) * handling.speed
        for (let i = objs.length - 1; i >= 0; i--) {
          const o = objs[i]
          o.x -= speed * dt
          o.y += o.vy * dt
          const dx = o.x - px
          const dy = o.y - planeY
          const hitR = o.kind === 'star' ? 22 : o.r * 0.7
          if (dx * dx + dy * dy < hitR * hitR) {
            if (o.kind === 'star') {
              score += 1
            } else {
              score = Math.max(0, score - 1)
              planeY += (Math.random() - 0.5) * 30
            }
            objs.splice(i, 1)
            continue
          }
          if (o.x < -40) objs.splice(i, 1)
        }

        label.text = `Flight · ${remain.toFixed(1)}s · stars ${score} · build +${buildBonus}`

        gfx.clear()
        // Sky
        gfx.rect(0, 0, w, h)
        gfx.fill(0x5b8fa8)
        gfx.rect(0, h * 0.7, w, h * 0.3)
        gfx.fill({ color: 0x2f5f74, alpha: 0.55 })
        for (let i = 0; i < 6; i++) {
          const cx = ((i * 140 - elapsed * 40) % (w + 80)) - 40
          gfx.ellipse(cx, h * 0.22 + (i % 3) * 18, 36, 14)
          gfx.fill({ color: 0xffffff, alpha: 0.18 })
        }

        // Plane from build picks
        const colorNum =
          preview.paint === 'candy'
            ? 0xff85a1
            : preview.paint === 'neon'
              ? 0x00f5d4
              : preview.paint === 'camo'
                ? 0x606c38
                : 0x4cc9f0
        const bob = Math.sin(elapsed * 10) * 3
        gfx.ellipse(px, planeY + bob, 34, 12)
        gfx.fill(colorNum)
        if (preview.wings === 'biplane') {
          gfx.ellipse(px + 4, planeY + bob - 10, 28, 5)
          gfx.fill(colorNum)
          gfx.ellipse(px + 4, planeY + bob + 10, 28, 5)
          gfx.fill(colorNum)
        } else {
          const wingW = preview.wings === 'wide' ? 36 : preview.wings === 'delta' ? 30 : 24
          gfx.ellipse(px + 2, planeY + bob, wingW, 6)
          gfx.fill({ color: colorNum, alpha: 0.9 })
        }
        const noseLen = preview.nose === 'sharp' || preview.nose === 'jet' ? 18 : 12
        gfx.ellipse(px + 28, planeY + bob, noseLen, 8)
        gfx.fill(0xffe8c8)
        if (preview.engine === 'twin' || preview.engine === 'rocket') {
          gfx.circle(px - 28, planeY + bob - 6, 5)
          gfx.fill(0xffbe0b)
          gfx.circle(px - 28, planeY + bob + 6, 5)
          gfx.fill(0xffbe0b)
        } else {
          gfx.circle(px - 30, planeY + bob, 6)
          gfx.fill(preview.engine === 'turbo' ? 0x00f5d4 : 0xffbe0b)
        }

        for (const o of objs) {
          if (o.kind === 'star') {
            gfx.star(o.x, o.y, 5, o.r, o.r * 0.45)
            gfx.fill(0xffe066)
          } else {
            gfx.ellipse(o.x, o.y, o.r, o.r * 0.55)
            gfx.fill({ color: 0xffffff, alpha: 0.85 })
            gfx.ellipse(o.x - o.r * 0.35, o.y - 4, o.r * 0.45, o.r * 0.35)
            gfx.fill({ color: 0xffffff, alpha: 0.9 })
          }
        }

        if (elapsed >= FLIGHT_SECONDS) finish(score)
      })

      return () => {
        app.canvas.removeEventListener('pointermove', onMove)
        app.canvas.removeEventListener('pointerdown', onMove)
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
  }, [phase, buildBonus, grant, preview.engine, preview.nose, preview.paint, preview.wings])

  const title =
    phase === 'build'
      ? `Pick ${partId} (${step + 1}/${ORDER.length})`
      : phase === 'flight'
        ? 'Flight test — steer with pointer'
        : `Mission complete · +${reward} coins`

  return (
    <div className="minigame-overlay">
      <div className={`minigame-frame build-plane ${phase === 'flight' ? 'flight' : ''}`}>
        <div className="minigame-top">
          <h2>Build Your Plane</h2>
          <p>{title}</p>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        {phase === 'build' ? (
          <>
            <div className="plane-preview" aria-hidden>
              <div
                className={`plane-body nose-${preview.nose} wings-${preview.wings} engine-${preview.engine}`}
                style={{ background: preview.color }}
              />
              <div className={`plane-wing left wings-${preview.wings}`} style={{ background: preview.color }} />
              <div className={`plane-wing right wings-${preview.wings}`} style={{ background: preview.color }} />
              {preview.wings === 'biplane' ? (
                <>
                  <div className="plane-wing left wings-biplane-top" style={{ background: preview.color }} />
                  <div className="plane-wing right wings-biplane-top" style={{ background: preview.color }} />
                </>
              ) : null}
              <div className={`plane-nose nose-${preview.nose}`} />
              <div className={`plane-engine engine-${preview.engine}`} />
            </div>
            <div className="plane-options">
              {options.map((o) => (
                <button key={o.id} type="button" className="hub-card" onClick={() => choose(o.id)}>
                  <strong>{o.label}</strong>
                  <span>+{o.bonus} build bonus</span>
                </button>
              ))}
            </div>
          </>
        ) : null}
        {phase === 'flight' ? <div className="minigame-canvas build-flight" ref={hostRef} /> : null}
        {phase === 'done' ? (
          <div className="minigame-end">
            <p className="dunk-msg">
              Build +{buildBonus} · Flight stars {flightScore} · Banked {reward} coins
            </p>
            <button type="button" className="primary-btn" onClick={() => setOverlay('none')}>
              Back to pet
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
