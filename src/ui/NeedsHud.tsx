import { NEED_KEYS, NEED_LABELS, type NeedKey } from '../game/needs'
import { getActiveEvent } from '../game/events'
import { useGameStore } from '../state/gameStore'

function barClass(value: number): string {
  if (value < 25) return 'need-fill low'
  if (value < 50) return 'need-fill mid'
  return 'need-fill high'
}

export function NeedsHud() {
  const needs = useGameStore((s) => s.needs)
  const coins = useGameStore((s) => s.coins)
  const fuel = useGameStore((s) => s.fuel)
  const stars = useGameStore((s) => s.stars)
  const petName = useGameStore((s) => s.petName)
  const sleeping = useGameStore((s) => s.sleeping)
  const room = useGameStore((s) => s.room)
  const xp = useGameStore((s) => s.xp)
  const level = Math.max(1, Math.floor(xp / 50) + 1)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const event = getActiveEvent()
  const roomLabel =
    room === 'kitchen'
      ? 'Kitchen'
      : room === 'bathroom'
        ? 'Bathroom'
        : room === 'bedroom'
          ? 'Bedroom'
          : 'Living'

  return (
    <header className="hud">
      <div className="hud-top">
        <div className="brand-block">
          <p className="brand">PetVerse</p>
          <p className="pet-label">
            {petName || 'Your pet'} · Lv {level}
            {sleeping ? ' · sleeping' : ''} · {roomLabel}
          </p>
        </div>
        <div className="hud-stats">
          <div className="coins" aria-label={`${coins} coins`}>
            <span className="coin-icon" aria-hidden>
              ●
            </span>
            {coins}
          </div>
          <div className="coins fuel" aria-label={`${fuel} fuel`}>
            Fuel {fuel}
          </div>
          <div className="coins stars" aria-label={`${stars} stars`}>
            Stars {stars}
          </div>
        </div>
      </div>
      <div className="needs-grid">
        {NEED_KEYS.map((key: NeedKey) => (
          <div className="need" key={key}>
            <div className="need-meta">
              <span>{NEED_LABELS[key]}</span>
              <span>{Math.round(needs[key])}</span>
            </div>
            <div className="need-track">
              <div className={barClass(needs[key])} style={{ width: `${needs[key]}%` }} />
            </div>
          </div>
        ))}
      </div>
      {event ? (
        <button type="button" className="event-chip" onClick={() => setOverlay('event')}>
          Event: {event.name}
        </button>
      ) : null}
    </header>
  )
}
