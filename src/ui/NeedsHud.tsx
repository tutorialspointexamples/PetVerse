import { NEED_KEYS, NEED_LABELS, type NeedKey } from '../game/needs'
import { getActiveEvent } from '../game/events'
import { getRoom } from '../game/rooms'
import { useGameStore } from '../state/gameStore'
import { useLocale } from '../i18n/useLocale'

function barClass(value: number): string {
  if (value < 25) return 'need-fill low'
  if (value < 50) return 'need-fill mid'
  return 'need-fill high'
}

const NEED_ICON: Record<NeedKey, string> = {
  hunger: 'H',
  energy: 'E',
  happiness: '☺',
  cleanliness: 'C',
  health: '+',
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
  const roomLabel = getRoom(room).name
  const { t } = useLocale()
  const sick = needs.health < 30

  return (
    <header className="hud compact-hud">
      <div className="hud-top">
        <div className="brand-block">
          <p className="brand">PetVerse</p>
          <p className="pet-label">
            {petName || 'Your pet'} · Lv {level}
            {sleeping ? ` · ${t('hud.sleeping')}` : ''}
            {sick ? ` · ${t('hud.sick')}` : ''} · {roomLabel}
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
            {t('hud.fuel')} {fuel}
          </div>
          <div className="coins stars" aria-label={`${stars} stars`}>
            {t('hud.stars')} {stars}
          </div>
        </div>
      </div>
      <div className="needs-strip" role="group" aria-label="Needs">
        {NEED_KEYS.map((key: NeedKey) => (
          <div className={`need-chip ${key === 'health' && needs[key] < 40 ? 'warn' : ''}`} key={key}>
            <span className="need-icon" aria-hidden>
              {NEED_ICON[key]}
            </span>
            <div className="need-chip-meta">
              <span className="need-chip-label">{NEED_LABELS[key]}</span>
              <div className="need-track slim">
                <div className={barClass(needs[key])} style={{ width: `${needs[key]}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {event ? (
        <button type="button" className="event-chip" onClick={() => setOverlay('event')}>
          {t('nav.event')}: {event.name}
        </button>
      ) : null}
    </header>
  )
}
