import { useEffect, useRef, useState } from 'react'
import { getCompanion } from '../game/progress'
import { playCompanionVoice } from '../audio/companionVoice'
import { useGameStore } from '../state/gameStore'
import { useLocale } from '../i18n/useLocale'

type Treat = { x: number; y: number; vy: number; r: number; color: string; caught: boolean }

function hex(n: number) {
  return `#${n.toString(16).padStart(6, '0')}`
}

/** MTT2-style companion co-op: catch falling treats with your pet while the buddy helps. */
export function BuddyCatchGame() {
  const hostRef = useRef<HTMLCanvasElement>(null)
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
    const canvas = hostRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let disposed = false
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
    let last = performance.now()
    let frame = 0

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const dpr = Math.min(devicePixelRatio || 1, 2)
      const w = parent.clientWidth
      const h = Math.max(280, parent.clientHeight)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

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

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true
      if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false
      if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false
    }
    const pointerPos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointerX = (e.clientX - rect.left) / Math.max(1, rect.width)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    canvas.addEventListener('pointermove', pointerPos)
    canvas.addEventListener('pointerdown', pointerPos)

    const drawCatcher = (x: number, y: number, fill: string, accent: string, scale = 1) => {
      ctx.fillStyle = 'rgba(26,42,34,0.2)'
      ctx.beginPath()
      ctx.ellipse(x, y + 18 * scale, 28 * scale, 12 * scale, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = fill
      roundRect(ctx, x - 22 * scale, y - 10 * scale, 44 * scale, 36 * scale, 16 * scale)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x, y - 28 * scale, 20 * scale, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#1a2a22'
      ctx.beginPath()
      ctx.arc(x - 7 * scale, y - 30 * scale, 3.2 * scale, 0, Math.PI * 2)
      ctx.arc(x + 7 * scale, y - 30 * scale, 3.2 * scale, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = accent
      ctx.globalAlpha = 0.55
      ctx.beginPath()
      ctx.ellipse(x, y + 6 * scale, 14 * scale, 10 * scale, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    }

    const loop = (now: number) => {
      if (disposed) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const w = canvas.clientWidth
      const h = canvas.clientHeight

      if (living) {
        timer -= dt
        setTimeLeft(Math.max(0, Math.ceil(timer)))
        if (timer <= 0) finish()

        const speed = 1.35
        if (keys.left) playerX -= speed * dt
        if (keys.right) playerX += speed * dt
        if (pointerX !== null) playerX += (pointerX - playerX) * Math.min(1, dt * 10)
        playerX = Math.max(0.08, Math.min(0.92, playerX))

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
        if (living && spawnAcc >= spawnEvery) {
          spawnAcc = 0
          treats.push({
            x: (0.1 + Math.random() * 0.8) * w,
            y: -20,
            vy: 140 + Math.random() * 90 + scoreLocal * 3,
            r: 12 + Math.random() * 6,
            color: Math.random() > 0.55 ? hex(def.accent) : '#ffbe0b',
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
          if (Math.hypot(tr.x - px, tr.y - py) < catchR + tr.r * 0.3) {
            tr.caught = true
            scoreLocal += 1
            setScore(scoreLocal)
          } else if (Math.hypot(tr.x - bx, tr.y - py) < catchR * 0.9 + tr.r * 0.3) {
            tr.caught = true
            buddyLocal += 1
            setBuddyScore(buddyLocal)
            if (buddyLocal % 3 === 0) playCompanionVoice(companion)
          }
        }
        for (let i = treats.length - 1; i >= 0; i--) {
          if (treats[i].caught || treats[i].y > h + 40) treats.splice(i, 1)
        }
      }

      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#1b4332')
      g.addColorStop(0.55, '#2d6a4f')
      g.addColorStop(1, '#95d5b2')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = 'rgba(149,213,178,0.35)'
      ctx.beginPath()
      ctx.ellipse(w * 0.5, h * 0.95, w * 0.55, 40, 0, 0, Math.PI * 2)
      ctx.fill()

      for (const tr of treats) {
        ctx.fillStyle = tr.color
        ctx.beginPath()
        ctx.arc(tr.x, tr.y, tr.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.45)'
        ctx.beginPath()
        ctx.arc(tr.x - 3, tr.y - 3, tr.r * 0.28, 0, Math.PI * 2)
        ctx.fill()
      }

      drawCatcher(buddyX * w, h * 0.78, hex(def.fill), hex(def.accent), 0.78)
      drawCatcher(playerX * w, h * 0.78, '#f4a261', '#ffe066', 1)

      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    return () => {
      disposed = true
      living = false
      cancelAnimationFrame(frame)
      ro.disconnect()
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      canvas.removeEventListener('pointermove', pointerPos)
      canvas.removeEventListener('pointerdown', pointerPos)
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
          <p className="buddy-hint">{t('buddy.hint')}</p>
        </div>
        <div className="minigame-canvas">
          <canvas ref={hostRef} />
        </div>
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

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}
