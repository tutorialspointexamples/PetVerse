import { useEffect, useRef, useState } from 'react'
import { Application, Container, Graphics, Text } from 'pixi.js'
import { getCompanion } from '../game/progress'
import { playCompanionVoice } from '../audio/companionVoice'
import { useGameStore } from '../state/gameStore'
import { useLocale } from '../i18n/useLocale'

type Treat = { x: number; y: number; vy: number; r: number; color: number; caught: boolean }

/** MTT2-style companion co-op: catch falling treats with your pet while the buddy helps. */
export function BuddyCatchGame() {
  const hostRef = useRef<HTMLDivElement>(null)
  const companion = useGameStore((s) => s.companion)
  const finishBuddyCatch = useGameStore((s) => s.finishBuddyCatch)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const { t } = useLocale()
  const [score, setScore] = useState(0)
  const [buddyScore, setBuddyScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [done, setDone] = useState(false)
  const [summary, setSummary] = useState('')
  const [runKey, setRunKey] = useState(0)

  useEffect(() => {
    if (companion === 'none') {
      setOverlay('companions')
      return
    }
    const host = hostRef.current
    if (!host) return
    let disposed = false
    const app = new Application()
    let living = true
    let playerX = 0.5
    let buddyX = 0.35
    let scoreLocal = 0
    let buddyLocal = 0
    let timer = 30
    let spawnAcc = 0
    let keys = { left: false, right: false }
    let pointerX: number | null = null
    const treats: Treat[] = []
    const def = getCompanion(companion)
    playCompanionVoice(companion)

    const finish = () => {
      if (!living) return
      living = false
      setDone(true)
      const total = scoreLocal + buddyLocal
      const coins = Math.min(40, 6 + scoreLocal * 2 + buddyLocal)
      const xp = Math.max(4, Math.floor(total * 1.2))
      finishBuddyCatch(coins, xp, scoreLocal, buddyLocal)
      setSummary(
        t('buddy.result')
          .replace('{you}', String(scoreLocal))
          .replace('{buddy}', String(buddyLocal))
          .replace('{c}', String(coins)),
      )
    }

    void (async () => {
      await app.init({
        resizeTo: host,
        background: 0x1b4332,
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
      const hud = new Text({
        text: '',
        style: {
          fill: 0xffffff,
          fontSize: 18,
          fontFamily: 'Fredoka, Nunito, sans-serif',
          fontWeight: '700',
        },
      })
      hud.position.set(12, 10)
      root.addChild(gfx, hud)

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true
        if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true
      }
      const onKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false
        if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false
      }
      const onPointerMove = (e: PointerEvent) => {
        const rect = app.canvas.getBoundingClientRect()
        pointerX = (e.clientX - rect.left) / Math.max(1, rect.width)
      }
      const onPointerDown = (e: PointerEvent) => {
        const rect = app.canvas.getBoundingClientRect()
        pointerX = (e.clientX - rect.left) / Math.max(1, rect.width)
        try {
          app.canvas.setPointerCapture(e.pointerId)
        } catch {
          /* ignore */
        }
      }

      window.addEventListener('keydown', onKeyDown)
      window.addEventListener('keyup', onKeyUp)
      app.canvas.addEventListener('pointermove', onPointerMove)
      app.canvas.addEventListener('pointerdown', onPointerDown)

      app.ticker.add((tick) => {
        if (!living || disposed) return
        const dt = tick.deltaMS / 1000
        const w = app.screen.width
        const h = app.screen.height
        timer -= dt
        setTimeLeft(Math.max(0, Math.ceil(timer)))
        if (timer <= 0) {
          finish()
          return
        }

        const speed = 1.35
        if (keys.left) playerX -= speed * dt
        if (keys.right) playerX += speed * dt
        if (pointerX !== null) {
          playerX += (pointerX - playerX) * Math.min(1, dt * 10)
        }
        playerX = Math.max(0.08, Math.min(0.92, playerX))

        // Buddy AI: chase nearest falling treat in upper half, stay clear of player
        let target = buddyX
        let bestDist = 999
        for (const tr of treats) {
          if (tr.caught || tr.y > h * 0.75) continue
          const d = Math.abs(tr.x - buddyX * w)
          if (d < bestDist) {
            bestDist = d
            target = tr.x / w
          }
        }
        if (Math.abs(target - playerX) < 0.12) target = playerX > 0.5 ? playerX - 0.18 : playerX + 0.18
        buddyX += (target - buddyX) * Math.min(1, dt * 3.2)
        buddyX = Math.max(0.08, Math.min(0.92, buddyX))

        spawnAcc += dt
        const spawnEvery = Math.max(0.35, 0.85 - scoreLocal * 0.02)
        if (spawnAcc >= spawnEvery) {
          spawnAcc = 0
          treats.push({
            x: (0.1 + Math.random() * 0.8) * w,
            y: -20,
            vy: 140 + Math.random() * 90 + scoreLocal * 3,
            r: 12 + Math.random() * 6,
            color: Math.random() > 0.55 ? def.accent : 0xffbe0b,
            caught: false,
          })
        }

        const catchR = 42
        for (const tr of treats) {
          if (tr.caught) continue
          tr.y += tr.vy * dt
          const px = playerX * w
          const bx = buddyX * w
          const py = h * 0.78
          const by = h * 0.78
          if (Math.hypot(tr.x - px, tr.y - py) < catchR + tr.r * 0.3) {
            tr.caught = true
            scoreLocal += 1
            setScore(scoreLocal)
          } else if (Math.hypot(tr.x - bx, tr.y - by) < catchR * 0.9 + tr.r * 0.3) {
            tr.caught = true
            buddyLocal += 1
            setBuddyScore(buddyLocal)
            if (buddyLocal % 3 === 0) playCompanionVoice(companion)
          }
        }
        for (let i = treats.length - 1; i >= 0; i--) {
          if (treats[i].caught || treats[i].y > h + 40) treats.splice(i, 1)
        }

        hud.text = `${t('buddy.you')} ${scoreLocal} · ${def.name} ${buddyLocal} · ${Math.ceil(timer)}s`

        gfx.clear()
        // Soft yard gradient blocks
        gfx.rect(0, 0, w, h)
        gfx.fill(0x2d6a4f)
        gfx.ellipse(w * 0.5, h * 0.95, w * 0.55, 40)
        gfx.fill({ color: 0x95d5b2, alpha: 0.35 })

        for (const tr of treats) {
          gfx.circle(tr.x, tr.y, tr.r)
          gfx.fill(tr.color)
          gfx.circle(tr.x - 3, tr.y - 3, tr.r * 0.28)
          gfx.fill({ color: 0xffffff, alpha: 0.45 })
        }

        const drawCatcher = (x: number, y: number, fill: number, accent: number, scale = 1) => {
          gfx.ellipse(x, y + 18 * scale, 28 * scale, 12 * scale)
          gfx.fill({ color: 0x1a2a22, alpha: 0.2 })
          gfx.roundRect(x - 22 * scale, y - 10 * scale, 44 * scale, 36 * scale, 16 * scale)
          gfx.fill(fill)
          gfx.circle(x, y - 28 * scale, 20 * scale)
          gfx.fill(fill)
          gfx.circle(x - 7 * scale, y - 30 * scale, 3.2 * scale)
          gfx.fill(0x1a2a22)
          gfx.circle(x + 7 * scale, y - 30 * scale, 3.2 * scale)
          gfx.fill(0x1a2a22)
          gfx.ellipse(x, y + 6 * scale, 14 * scale, 10 * scale)
          gfx.fill({ color: accent, alpha: 0.55 })
        }

        drawCatcher(buddyX * w, h * 0.78, def.fill, def.accent, 0.78)
        drawCatcher(playerX * w, h * 0.78, 0xf4a261, 0xffe066, 1)
      })

      ;(app as Application & { __cleanup?: () => void }).__cleanup = () => {
        window.removeEventListener('keydown', onKeyDown)
        window.removeEventListener('keyup', onKeyUp)
        app.canvas.removeEventListener('pointermove', onPointerMove)
        app.canvas.removeEventListener('pointerdown', onPointerDown)
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
  }, [companion, finishBuddyCatch, setOverlay, t, runKey])

  if (companion === 'none') return null

  return (
    <div className="minigame-overlay">
      <div className="minigame-frame buddy-catch">
        <div className="minigame-top">
          <h2>{t('buddy.title')}</h2>
          <p>
            {t('buddy.you')} {score} · {getCompanion(companion).name} {buddyScore} · {timeLeft}s
          </p>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        <p className="buddy-hint">{t('buddy.hint')}</p>
        <div className="minigame-canvas" ref={hostRef} />
        {done ? (
          <div className="minigame-end">
            <p>{summary || t('minigame.rewards')}</p>
            <div className="minigame-actions">
              <button
                type="button"
                className="name-submit"
                onClick={() => {
                  setDone(false)
                  setScore(0)
                  setBuddyScore(0)
                  setTimeLeft(30)
                  setSummary('')
                  setRunKey((k) => k + 1)
                }}
              >
                {t('minigame.replay')}
              </button>
              <button type="button" className="name-submit" onClick={() => setOverlay('none')}>
                {t('minigame.home')}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
