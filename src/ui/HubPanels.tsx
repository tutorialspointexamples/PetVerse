import { WORLDS } from '../game/worlds'
import { getActiveEvent } from '../game/events'
import { COMPANIONS, SKILLS, levelFromXp } from '../game/progress'
import { IAP_PRODUCTS, purchaseIap, showRewardedAd } from '../monetization/stubs'
import { useGameStore } from '../state/gameStore'

export function GamesHub() {
  const overlay = useGameStore((s) => s.overlay)
  const setOverlay = useGameStore((s) => s.setOverlay)
  if (overlay !== 'games') return null
  return (
    <div className="shop-overlay" role="dialog" aria-label="Mini-games">
      <div className="shop-panel">
        <div className="shop-header">
          <h2>Mini-Games</h2>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        <button type="button" className="hub-card" onClick={() => setOverlay('spaceTrails')}>
          <strong>Space Trails</strong>
          <span>Steer the trail, collect stars offline</span>
        </button>
        <button type="button" className="hub-card" onClick={() => setOverlay('skyDash')}>
          <strong>Sky Race</strong>
          <span>Flap, grab coins, dodge blocks</span>
        </button>
        <button type="button" className="hub-card" onClick={() => setOverlay('dunkToss')}>
          <strong>Dunk-a-Pet</strong>
          <span>Time your toss in the green zone</span>
        </button>
        <button type="button" className="hub-card" onClick={() => setOverlay('buildPlane')}>
          <strong>Build Your Plane</strong>
          <span>Assemble parts and earn fuel</span>
        </button>
      </div>
    </div>
  )
}

export function TravelPanel() {
  const overlay = useGameStore((s) => s.overlay)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const fuel = useGameStore((s) => s.fuel)
  const travelTo = useGameStore((s) => s.travelTo)
  const visitedWorlds = useGameStore((s) => s.visitedWorlds)
  if (overlay !== 'travel') return null
  return (
    <div className="shop-overlay" role="dialog" aria-label="Plane travel">
      <div className="shop-panel">
        <div className="shop-header">
          <h2>Plane Travel</h2>
          <p className="shop-coins">{fuel} fuel</p>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        <div className="world-list">
          {WORLDS.map((w) => (
            <button
              key={w.id}
              type="button"
              className="hub-card"
              style={{ borderLeft: `6px solid #${w.wall.toString(16).padStart(6, '0')}` }}
              disabled={fuel < w.fuelCost}
              onClick={() => travelTo(w.id)}
            >
              <strong>{w.name}</strong>
              <span>
                {w.fuelCost} fuel · +{w.rewardCoins}c
                {visitedWorlds.includes(w.id) ? ' · visited' : ' · new'}
              </span>
              <span className="hub-blurb">{w.blurb}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function WorldVisitPanel() {
  const overlay = useGameStore((s) => s.overlay)
  const activeWorld = useGameStore((s) => s.activeWorld)
  const clearWorldVisit = useGameStore((s) => s.clearWorldVisit)
  if (overlay !== 'worldVisit' || !activeWorld) return null
  const world = WORLDS.find((w) => w.id === activeWorld)
  if (!world) return null
  return (
    <div className="shop-overlay" role="dialog" aria-label="World visit">
      <div
        className="shop-panel world-visit"
        style={{
          background: `linear-gradient(180deg, #${world.wall.toString(16).padStart(6, '0')}, #${world.floor.toString(16).padStart(6, '0')})`,
          color: '#1a2a22',
        }}
      >
        <h2>{world.name}</h2>
        <p>{world.blurb} You landed safely and collected rewards. New unlocks were added to your shop.</p>
        <button type="button" className="name-submit" onClick={clearWorldVisit}>
          Fly home
        </button>
      </div>
    </div>
  )
}

export function SkillsPanel() {
  const overlay = useGameStore((s) => s.overlay)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const xp = useGameStore((s) => s.xp)
  const practiceSkill = useGameStore((s) => s.practiceSkill)
  const unlockedSkills = useGameStore((s) => s.unlockedSkills)
  const level = levelFromXp(xp)
  if (overlay !== 'skills') return null
  return (
    <div className="shop-overlay" role="dialog" aria-label="Skills">
      <div className="shop-panel">
        <div className="shop-header">
          <h2>Skills</h2>
          <p className="shop-coins">Lv {level}</p>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        {SKILLS.map((skill) => {
          const locked = level < skill.unlockLevel
          const learned = unlockedSkills.includes(skill.id)
          return (
            <button
              key={skill.id}
              type="button"
              className="hub-card"
              disabled={locked}
              onClick={() => practiceSkill(skill.id)}
            >
              <strong>
                {skill.name}
                {learned ? '' : ' · new'}
              </strong>
              <span>
                {locked
                  ? `Unlock at level ${skill.unlockLevel}`
                  : `+${skill.coinReward}c · +${skill.xpReward} XP`}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function CompanionsPanel() {
  const overlay = useGameStore((s) => s.overlay)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const coins = useGameStore((s) => s.coins)
  const companion = useGameStore((s) => s.companion)
  const ownedCompanions = useGameStore((s) => s.ownedCompanions)
  const unlockCompanion = useGameStore((s) => s.unlockCompanion)
  if (overlay !== 'companions') return null
  return (
    <div className="shop-overlay" role="dialog" aria-label="Companions">
      <div className="shop-panel">
        <div className="shop-header">
          <h2>Companions</h2>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        {COMPANIONS.map((c) => {
          if (c.id === 'none') {
            return (
              <button key={c.id} type="button" className="hub-card" onClick={() => unlockCompanion('none')}>
                <strong>Solo</strong>
                <span>No companion in the room</span>
              </button>
            )
          }
          const owned = ownedCompanions.includes(c.id)
          return (
            <button
              key={c.id}
              type="button"
              className={`hub-card ${companion === c.id ? 'active' : ''}`}
              disabled={!owned && coins < c.unlockCost}
              onClick={() => unlockCompanion(c.id)}
            >
              <strong>{c.name}</strong>
              <span>{owned ? (companion === c.id ? 'Active' : 'Own · tap to equip') : `${c.unlockCost}c`}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function EventPanel() {
  const overlay = useGameStore((s) => s.overlay)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const claimEventBonus = useGameStore((s) => s.claimEventBonus)
  const eventClaimDate = useGameStore((s) => s.eventClaimDate)
  const event = getActiveEvent()
  if (overlay !== 'event' || !event) return null
  const today = new Date().toISOString().slice(0, 10)
  const claimed = eventClaimDate === today
  return (
    <div className="shop-overlay" role="dialog" aria-label="Event">
      <div className="shop-panel">
        <div className="shop-header">
          <h2>{event.name}</h2>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        <p>{event.blurb}</p>
        <button
          type="button"
          className="name-submit"
          disabled={claimed}
          onClick={() => claimEventBonus()}
        >
          {claimed ? 'Bonus claimed today' : `Claim +${event.loginBonus} coins`}
        </button>
      </div>
    </div>
  )
}

export function RewardedPanel() {
  const overlay = useGameStore((s) => s.overlay)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const applyRewardedBoost = useGameStore((s) => s.applyRewardedBoost)
  const addCoins = useGameStore((s) => s.addCoins)

  if (overlay !== 'rewarded') return null

  const watch = async () => {
    const result = await showRewardedAd()
    if (result.watched) applyRewardedBoost()
  }

  const buy = async (id: string, coins: number) => {
    const result = await purchaseIap(id)
    if (result.ok && coins > 0) addCoins(coins)
    if (result.ok && id === 'outfit_pack') {
      addCoins(50)
    }
    setOverlay('none')
  }

  return (
    <div className="shop-overlay" role="dialog" aria-label="Rewards">
      <div className="shop-panel">
        <div className="shop-header">
          <h2>Boosts</h2>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        <p className="panel-note">Optional. Everything in PetVerse stays playable without spending.</p>
        <button type="button" className="hub-card" onClick={() => void watch()}>
          <strong>Watch rewarded (mock)</strong>
          <span>+15 coins · +2 fuel</span>
        </button>
        {IAP_PRODUCTS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="hub-card"
            onClick={() => void buy(p.id, p.coins)}
          >
            <strong>
              {p.title} · {p.priceLabel}
            </strong>
            <span>{p.coins ? `+${p.coins} coins (mock IAP)` : 'Style pack (mock IAP)'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
