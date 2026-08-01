import { useEffect, useMemo, useRef, useState } from 'react'
import { Application, Graphics, Text } from 'pixi.js'
import { useGameStore } from '../state/gameStore'

type PartId = 'nose' | 'wings' | 'engine' | 'paint'

interface PartOption {
  id: string
  label: string
  /** Flat coin/build score contribution. */
  bonus: number
  /** Flight scroll speed multiplier contribution. */
  speed: number
  /** Pointer steering responsiveness. */
  handling: number
  /** Cloud hit forgiveness (higher = less penalty / smaller hitbox). */
  armor: number
  /** Tradeoff note shown in UI. */
  tradeoff: string
}

const PARTS: Record<PartId, PartOption[]> = {
  nose: [
    { id: 'round', label: 'Round', bonus: 2, speed: 0, handling: 0.08, armor: 0.1, tradeoff: 'Stable · slower tip' },
    { id: 'sharp', label: 'Sharp', bonus: 4, speed: 0.12, handling: 0.02, armor: -0.05, tradeoff: 'Faster · fragile' },
    { id: 'bubble', label: 'Bubble', bonus: 3, speed: -0.04, handling: 0.12, armor: 0.18, tradeoff: 'Tanky · sluggish' },
    { id: 'jet', label: 'Jet Cone', bonus: 5, speed: 0.18, handling: -0.04, armor: -0.08, tradeoff: 'Top speed · twitchy' },
  ],
  wings: [
    { id: 'short', label: 'Short', bonus: 2, speed: 0.06, handling: -0.02, armor: 0, tradeoff: 'Nimble tip · less lift' },
    { id: 'wide', label: 'Wide', bonus: 4, speed: -0.02, handling: 0.14, armor: 0.08, tradeoff: 'Glides · slower' },
    { id: 'delta', label: 'Delta', bonus: 5, speed: 0.1, handling: 0.06, armor: 0, tradeoff: 'Balanced racer' },
    { id: 'biplane', label: 'Biplane', bonus: 6, speed: -0.06, handling: 0.18, armor: 0.16, tradeoff: 'Max control · drag' },
  ],
  engine: [
    { id: 'putt', label: 'Putt', bonus: 2, speed: 0, handling: 0.06, armor: 0.12, tradeoff: 'Reliable · modest' },
    { id: 'turbo', label: 'Turbo', bonus: 5, speed: 0.16, handling: 0, armor: -0.04, tradeoff: 'Punchy · hot' },
    { id: 'rocket', label: 'Rocket', bonus: 6, speed: 0.24, handling: -0.08, armor: -0.1, tradeoff: 'Blazing · hard turns' },
    { id: 'twin', label: 'Twin Jet', bonus: 7, speed: 0.14, handling: 0.04, armor: 0.04, tradeoff: 'Power with grip' },
  ],
  paint: [
    { id: 'sky', label: 'Sky', bonus: 1, speed: 0, handling: 0.02, armor: 0.04, tradeoff: 'Calm finish' },
    { id: 'candy', label: 'Candy', bonus: 3, speed: 0.02, handling: 0.06, armor: 0, tradeoff: 'Sweet handling' },
    { id: 'neon', label: 'Neon', bonus: 4, speed: 0.08, handling: 0, armor: -0.02, tradeoff: 'Flashy speed' },
    { id: 'camo', label: 'Camo', bonus: 5, speed: 0, handling: 0.04, armor: 0.14, tradeoff: 'Tough hide' },
  ],
}

const ORDER: PartId[] = ['nose', 'wings', 'engine', 'paint']
const FLIGHT_SECONDS = 16

type Phase = 'build' | 'flight' | 'done'

interface BuildStats {
  bonus: number
  speed: number
  handling: number
  armor: number
}

function statsFromPicks(picks: Partial<Record<PartId, string>>): BuildStats {
  let bonus = 8
  let speed = 1
  let handling = 1
  let armor = 1
  for (const id of ORDER) {
    const choice = picks[id]
    const opt = PARTS[id].find((o) => o.id === choice)
    if (!opt) continue
    bonus += opt.bonus
    speed += opt.speed
    handling += opt.handling
    armor += opt.armor
  }
  return {
    bonus,
    speed: Math.max(0.7, Math.min(1.6, speed)),
    handling: Math.max(0.6, Math.min(1.7, handling)),
    armor: Math.max(0.6, Math.min(1.6, armor)),
  }
}

/** Craft a plane, then flight-test it — Build Your Plane analogue with part tradeoffs. */
export function BuildPlaneGame() {
  const grant = useGameStore((s) => s.grantMinigameReward)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const [phase, setPhase] = useState<Phase>('build')
  const [step, setStep] = useState(0)
  const [picks, setPicks] = useState<Partial<Record<PartId, string>>>({})
  const [stats, setStats] = useState<BuildStats>({ bonus: 8, speed: 1, handling: 1, armor: 1 })
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
    const nextStats = statsFromPicks(next)
    setStats(nextStats)
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

    const finish = (finalScore: number) => {
      if (!living) return
      living = false
      setFlightScore(finalScore)
      const coins = Math.max(10, stats.bonus + Math.floor(finalScore * 1.4))
      setReward(coins)
      setPhase('done')
      if (!grantedRef.current) {
        grantedRef.current = true
        grant(coins, finalScore >= 10 ? 3 : 2, true)
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
          planeY += (target - planeY) * Math.min(1, dt * 5 * stats.handling)
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
        const speed = (160 + stats.bonus * 2) * stats.speed
        for (let i = objs.length - 1; i >= 0; i--) {
          const o = objs[i]
          o.x -= speed * dt
          o.y += o.vy * dt
          const dx = o.x - px
          const dy = o.y - planeY
          const hitR = o.kind === 'star' ? 22 : o.r * (0.85 - stats.armor * 0.15)
          if (dx * dx + dy * dy < hitR * hitR) {
            if (o.kind === 'star') {
              score += 1
            } else {
              const penalty = stats.armor >= 1.2 ? 0 : 1
              score = Math.max(0, score - penalty)
              planeY += (Math.random() - 0.5) * (36 - stats.armor * 10)
            }
            objs.splice(i, 1)
            continue
          }
          if (o.x < -40) objs.splice(i, 1)
        }

        label.text = `Flight · ${remain.toFixed(1)}s · stars ${score} · spd ${stats.speed.toFixed(2)} · hnd ${stats.handling.toFixed(2)} · arm ${stats.armor.toFixed(2)}`

        gfx.clear()
        gfx.rect(0, 0, w, h)
        gfx.fill(0x5b8fa8)
        gfx.rect(0, h * 0.7, w, h * 0.3)
        gfx.fill({ color: 0x2f5f74, alpha: 0.55 })
        for (let i = 0; i < 6; i++) {
          const cx = ((i * 140 - elapsed * 40) % (w + 80)) - 40
          gfx.ellipse(cx, h * 0.22 + (i % 3) * 18, 36, 14)
          gfx.fill({ color: 0xffffff, alpha: 0.18 })
        }

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
  }, [phase, stats, grant, preview.engine, preview.nose, preview.paint, preview.wings])

  const liveStats = statsFromPicks(picks)
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
            <p className="plane-stats">
              Build +{liveStats.bonus} · Spd {liveStats.speed.toFixed(2)} · Hnd {liveStats.handling.toFixed(2)} · Arm{' '}
              {liveStats.armor.toFixed(2)}
            </p>
            <div className="plane-options">
              {options.map((o) => (
                <button key={o.id} type="button" className="hub-card" onClick={() => choose(o.id)}>
                  <strong>{o.label}</strong>
                  <span>
                    +{o.bonus} · spd {o.speed >= 0 ? '+' : ''}
                    {o.speed.toFixed(2)} · hnd {o.handling >= 0 ? '+' : ''}
                    {o.handling.toFixed(2)} · arm {o.armor >= 0 ? '+' : ''}
                    {o.armor.toFixed(2)}
                  </span>
                  <span className="hub-blurb">{o.tradeoff}</span>
                </button>
              ))}
            </div>
          </>
        ) : null}
        {phase === 'flight' ? <div className="minigame-canvas build-flight" ref={hostRef} /> : null}
        {phase === 'done' ? (
          <div className="minigame-end">
            <p className="dunk-msg">
              Build +{stats.bonus} · Spd {stats.speed.toFixed(2)} · Flight stars {flightScore} · Banked {reward} coins
            </p>
            <div className="minigame-actions">
              <button
                type="button"
                className="name-submit"
                onClick={() => {
                  grantedRef.current = false
                  setPhase('build')
                  setStep(0)
                  setPicks({})
                  setStats({ bonus: 8, speed: 1, handling: 1, armor: 1 })
                  setFlightScore(0)
                  setReward(0)
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
