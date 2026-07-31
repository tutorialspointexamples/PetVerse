import { useMemo, useState } from 'react'
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
  ],
  wings: [
    { id: 'short', label: 'Short', bonus: 2 },
    { id: 'wide', label: 'Wide', bonus: 4 },
    { id: 'delta', label: 'Delta', bonus: 5 },
  ],
  engine: [
    { id: 'putt', label: 'Putt', bonus: 2 },
    { id: 'turbo', label: 'Turbo', bonus: 5 },
    { id: 'rocket', label: 'Rocket', bonus: 6 },
  ],
  paint: [
    { id: 'sky', label: 'Sky', bonus: 1 },
    { id: 'candy', label: 'Candy', bonus: 3 },
    { id: 'neon', label: 'Neon', bonus: 4 },
  ],
}

const ORDER: PartId[] = ['nose', 'wings', 'engine', 'paint']

/** Craft a plane from parts — Build Your Plane analogue. */
export function BuildPlaneGame() {
  const grant = useGameStore((s) => s.grantMinigameReward)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const [step, setStep] = useState(0)
  const [picks, setPicks] = useState<Partial<Record<PartId, string>>>({})
  const [done, setDone] = useState(false)
  const [reward, setReward] = useState(0)

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
    }
    return { nose, wings, engine, paint, color: colors[paint] ?? '#4cc9f0' }
  }, [picks])

  const choose = (optionId: string) => {
    if (done) return
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
    setReward(bonus)
    setDone(true)
    grant(bonus, 2)
  }

  return (
    <div className="minigame-overlay">
      <div className="minigame-frame build-plane">
        <div className="minigame-top">
          <h2>Build Your Plane</h2>
          <p>{done ? `Launch ready · +${reward} coins` : `Pick ${partId} (${step + 1}/${ORDER.length})`}</p>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        <div className="plane-preview" aria-hidden>
          <div
            className={`plane-body nose-${preview.nose} wings-${preview.wings} engine-${preview.engine}`}
            style={{ background: preview.color }}
          />
          <div className={`plane-wing left wings-${preview.wings}`} style={{ background: preview.color }} />
          <div className={`plane-wing right wings-${preview.wings}`} style={{ background: preview.color }} />
          <div className={`plane-nose nose-${preview.nose}`} />
          <div className={`plane-engine engine-${preview.engine}`} />
        </div>
        {!done ? (
          <div className="plane-options">
            {options.map((o) => (
              <button key={o.id} type="button" className="hub-card" onClick={() => choose(o.id)}>
                <strong>{o.label}</strong>
                <span>+{o.bonus} build bonus</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="dunk-msg">Plane assembled — fuel and coins banked</p>
        )}
      </div>
    </div>
  )
}
