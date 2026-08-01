import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useGameStore } from '../state/gameStore'
import type { CareAction } from '../game/needs'
import { useLocale } from '../i18n/useLocale'

type CareTool = {
  id: CareAction
  labelKey: string
  mark: string
  hintKey: string
}

const TOOLS: CareTool[] = [
  { id: 'feed', labelKey: 'care.spoon', mark: 'spoon', hintKey: 'care.hint.feed' },
  { id: 'bath', labelKey: 'care.soap', mark: 'soap', hintKey: 'care.hint.bath' },
  { id: 'brush', labelKey: 'care.brush', mark: 'brush', hintKey: 'care.hint.brush' },
  { id: 'potty', labelKey: 'care.potty', mark: 'potty', hintKey: 'care.hint.potty' },
  { id: 'sleep', labelKey: 'care.pillow', mark: 'pillow', hintKey: 'care.hint.sleep' },
  { id: 'play', labelKey: 'care.ball', mark: 'ball', hintKey: 'care.hint.play' },
]

/**
 * MTT2-style drag-and-drop care props.
 * Drag a tool over the pet (stage center) and release to apply care.
 */
export function CareTray() {
  const doCare = useGameStore((s) => s.doCare)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const sleeping = useGameStore((s) => s.sleeping)
  const cooldowns = useGameStore((s) => s.cooldowns)
  const { t } = useLocale()
  const [drag, setDrag] = useState<{
    tool: CareTool
    x: number
    y: number
    overPet: boolean
  } | null>(null)
  const originRef = useRef<{ x: number; y: number } | null>(null)

  const now = Date.now()
  const cooling = (action: CareAction) => {
    const until = cooldowns[action]
    return Boolean(until && until > now)
  }

  const petHit = (x: number, y: number) => {
    const cx = window.innerWidth * 0.5
    const cy = window.innerHeight * 0.42
    const dx = x - cx
    const dy = y - cy
    return dx * dx + dy * dy < 140 * 140
  }

  const onDown = (tool: CareTool, e: ReactPointerEvent<HTMLButtonElement>) => {
    if (cooling(tool.id) || (sleeping && tool.id !== 'sleep')) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    originRef.current = { x: e.clientX, y: e.clientY }
    setDrag({
      tool,
      x: e.clientX,
      y: e.clientY,
      overPet: petHit(e.clientX, e.clientY),
    })
  }

  const onMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag) return
    setDrag({
      ...drag,
      x: e.clientX,
      y: e.clientY,
      overPet: petHit(e.clientX, e.clientY),
    })
  }

  const onUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag) return
    const over = petHit(e.clientX, e.clientY)
    const tool = drag.tool
    setDrag(null)
    originRef.current = null
    if (!over) return
    if (tool.id === 'feed') {
      setOverlay('food')
      return
    }
    doCare(tool.id)
  }

  return (
    <>
      <aside className="care-tray" aria-label={t('care.drag')}>
        <p className="care-tray-label">{t('care.drag')}</p>
        <div className="care-tray-tools">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              type="button"
              className={`care-tool ${cooling(tool.id) || (sleeping && tool.id !== 'sleep') ? 'disabled' : ''}`}
              disabled={cooling(tool.id) || (sleeping && tool.id !== 'sleep')}
              title={t(tool.hintKey)}
              aria-label={t(tool.hintKey)}
              onPointerDown={(e) => onDown(tool, e)}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={() => setDrag(null)}
            >
              <span className={`care-tool-mark ${tool.mark}`} aria-hidden />
              <span>{t(tool.labelKey)}</span>
            </button>
          ))}
        </div>
      </aside>
      {drag ? (
        <div
          className={`care-ghost ${drag.overPet ? 'over' : ''}`}
          style={{ left: drag.x, top: drag.y }}
          aria-hidden
        >
          <span className={`care-tool-mark ${drag.tool.mark}`} />
        </div>
      ) : null}
      {drag?.overPet ? <div className="care-drop-ring" aria-hidden /> : null}
    </>
  )
}
