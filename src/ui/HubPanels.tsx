import { WORLDS, getWorldSpots, type WorldSpot } from '../game/worlds'
import { getActiveEvent } from '../game/events'
import { COMPANIONS, SKILLS, levelFromXp } from '../game/progress'
import { FOODS } from '../game/foods'
import { ROOMS } from '../game/rooms'
import { CARD_SETS, CARDS, setProgress } from '../game/cards'
import { missionsForDay, todayKey } from '../game/missions'
import { IAP_PRODUCTS, purchaseIap, showRewardedAd } from '../monetization/stubs'
import { useGameStore } from '../state/gameStore'
import { useEffect, useState } from 'react'
import { LOCALES } from '../i18n/strings'
import { useLocale } from '../i18n/useLocale'
import { WorldSpotActivity } from './WorldSpotActivity'

export function GamesHub() {
  const overlay = useGameStore((s) => s.overlay)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const { t } = useLocale()
  if (overlay !== 'games') return null
  return (
    <div className="shop-overlay" role="dialog" aria-label="Mini-games">
      <div className="shop-panel">
        <div className="shop-header">
          <h2>{t('games.title')}</h2>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        <button type="button" className="hub-card" onClick={() => setOverlay('spaceTrails')}>
          <strong>{t('games.space')}</strong>
          <span>{t('games.space.blurb')}</span>
        </button>
        <button type="button" className="hub-card" onClick={() => setOverlay('skyDash')}>
          <strong>{t('games.sky')}</strong>
          <span>{t('games.sky.blurb')}</span>
        </button>
        <button type="button" className="hub-card" onClick={() => setOverlay('dunkToss')}>
          <strong>{t('games.dunk')}</strong>
          <span>{t('games.dunk.blurb')}</span>
        </button>
        <button type="button" className="hub-card" onClick={() => setOverlay('buildPlane')}>
          <strong>{t('games.plane')}</strong>
          <span>{t('games.plane.blurb')}</span>
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
  const { t } = useLocale()
  if (overlay !== 'travel') return null
  return (
    <div className="shop-overlay" role="dialog" aria-label="Plane travel">
      <div className="shop-panel">
        <div className="shop-header">
          <h2>{t('travel.title')}</h2>
          <p className="shop-coins">
            {fuel} {t('travel.fuel')}
          </p>
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
              <strong>{t(`world.${w.id}.name`)}</strong>
              <span>
                {w.fuelCost} {t('travel.fuel')} · +{w.rewardCoins}c
                {visitedWorlds.includes(w.id) ? ` · ${t('travel.visited')}` : ` · ${t('travel.new')}`}
              </span>
              <span className="hub-blurb">{t(`world.${w.id}.blurb`)}</span>
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
  const worldVisitCollected = useGameStore((s) => s.worldVisitCollected)
  const collectWorldSpot = useGameStore((s) => s.collectWorldSpot)
  const clearWorldVisit = useGameStore((s) => s.clearWorldVisit)
  const { t } = useLocale()
  const [activeSpot, setActiveSpot] = useState<WorldSpot | null>(null)
  if (overlay !== 'worldVisit' || !activeWorld) return null
  const world = WORLDS.find((w) => w.id === activeWorld)
  if (!world) return null
  const spots = getWorldSpots(activeWorld)
  const found = worldVisitCollected.length
  const cleared = found >= spots.length && spots.length > 0
  return (
    <div className="shop-overlay" role="dialog" aria-label="World visit">
      <div
        className="shop-panel world-visit interactive"
        style={{
          background: `linear-gradient(165deg, #${world.wall.toString(16).padStart(6, '0')} 0%, #${world.accent.toString(16).padStart(6, '0')}55 42%, #${world.floor.toString(16).padStart(6, '0')} 100%)`,
          color: '#1a2a22',
        }}
      >
        <div className="shop-header">
          <h2>{t(`world.${world.id}.name`)}</h2>
          <p className="shop-coins">
            {found}/{spots.length} {t('travel.spots')}
          </p>
          <button type="button" className="close-btn" onClick={clearWorldVisit}>
            ×
          </button>
        </div>
        <p className="panel-note">
          {t(`world.${world.id}.blurb`)} {t('travel.explore')}
        </p>
        <div className="world-stage" aria-label={t('travel.explore')}>
          <div className="world-pet" aria-hidden />
          {spots.map((spot) => {
            const taken = worldVisitCollected.includes(spot.id)
            return (
              <button
                key={spot.id}
                type="button"
                className={`world-spot ${taken ? 'collected' : ''}`}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                disabled={taken}
                onClick={() => setActiveSpot(spot)}
                title={t(`spot.${world.id}.${spot.id}.blurb`)}
              >
                <strong>{t(`spot.${world.id}.${spot.id}.label`)}</strong>
                <span>{taken ? t('travel.collected') : `+${spot.rewardCoins}c`}</span>
              </button>
            )
          })}
        </div>
        {cleared ? <p className="world-clear-banner">{t('travel.cleared')}</p> : null}
        <button type="button" className="name-submit" onClick={clearWorldVisit}>
          {t('travel.home')}
        </button>
        {activeSpot ? (
          <WorldSpotActivity
            spot={{
              ...activeSpot,
              label: t(`spot.${world.id}.${activeSpot.id}.label`),
              blurb: t(`spot.${world.id}.${activeSpot.id}.blurb`),
            }}
            accent={world.accent}
            onCancel={() => setActiveSpot(null)}
            onSuccess={() => {
              collectWorldSpot(activeSpot.id)
              setActiveSpot(null)
            }}
          />
        ) : null}
      </div>
    </div>
  )
}

export function FlightPanel() {
  const overlay = useGameStore((s) => s.overlay)
  const activeWorld = useGameStore((s) => s.activeWorld)
  const finishFlight = useGameStore((s) => s.finishFlight)
  const { t } = useLocale()
  const world = WORLDS.find((w) => w.id === activeWorld)

  useEffect(() => {
    if (overlay !== 'flight') return
    const timer = window.setTimeout(() => finishFlight(), 2200)
    return () => window.clearTimeout(timer)
  }, [overlay, finishFlight])

  if (overlay !== 'flight' || !world) return null
  return (
    <div className="shop-overlay flight-overlay" role="dialog" aria-label="Flying">
      <div className="flight-scene">
        <div className="flight-sky" />
        <div className="flight-plane" aria-hidden />
        <p className="flight-label">
          {t('travel.flying')} {t(`world.${world.id}.name`)}…
        </p>
        <button type="button" className="name-submit" onClick={finishFlight}>
          {t('travel.skip')}
        </button>
      </div>
    </div>
  )
}

export function FoodPanel() {
  const overlay = useGameStore((s) => s.overlay)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const coins = useGameStore((s) => s.coins)
  const feedFood = useGameStore((s) => s.feedFood)
  const favoriteFood = useGameStore((s) => s.favoriteFood)
  const cooldowns = useGameStore((s) => s.cooldowns)
  const { t } = useLocale()
  if (overlay !== 'food') return null
  const cooling = Boolean(cooldowns.feed && cooldowns.feed > Date.now())
  return (
    <div className="shop-overlay" role="dialog" aria-label="Food menu">
      <div className="shop-panel">
        <div className="shop-header">
          <h2>{t('food.title')}</h2>
          <p className="shop-coins">{coins}c</p>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        {FOODS.map((food) => (
          <button
            key={food.id}
            type="button"
            className={`hub-card ${favoriteFood === food.id ? 'active' : ''}`}
            disabled={cooling || (food.price > 0 && coins < food.price)}
            onClick={() => feedFood(food.id)}
          >
            <strong>
              {t(`food.${food.id}.name`)}
              {favoriteFood === food.id ? ` · ${t('food.fav')}` : ''}
            </strong>
            <span>
              +{food.hunger} {t('food.hunger')} · +{food.happiness} {t('food.happy')}
              {food.healthDelta !== 0
                ? ` · ${food.healthDelta > 0 ? '+' : ''}${food.healthDelta} ${t('food.health')}`
                : ''}
              {` · ${t(`food.tag.${food.tag}`)}`}
              {food.price ? ` · ${food.price}c` : ` · ${t('food.free')}`}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function RoomsPanel() {
  const overlay = useGameStore((s) => s.overlay)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const room = useGameStore((s) => s.room)
  const setRoom = useGameStore((s) => s.setRoom)
  const { t } = useLocale()
  if (overlay !== 'rooms') return null
  return (
    <div className="shop-overlay" role="dialog" aria-label="Rooms">
      <div className="shop-panel">
        <div className="shop-header">
          <h2>{t('rooms.title')}</h2>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        <div className="room-grid">
          {ROOMS.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`hub-card room-card ${room === r.id ? 'active' : ''}`}
              style={{ borderLeft: `6px solid #${r.wall.toString(16).padStart(6, '0')}` }}
              onClick={() => setRoom(r.id)}
            >
              <strong>{r.name}</strong>
              <span>
                {room === r.id ? t('rooms.here') : t('rooms.go')}
                {r.id === 'kitchen'
                  ? ' · fridge=menu, stove=snack'
                  : r.id === 'bathroom'
                    ? ' · tub=bath, sink=brush, toilet=potty'
                    : r.id === 'bedroom'
                      ? ' · bed=sleep, lamp=poke'
                      : r.id === 'yard'
                        ? ' · pad/swing=play'
                        : ' · tv=play, sofa=poke'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function LangPanel() {
  const overlay = useGameStore((s) => s.overlay)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const { locale, setLocale, t } = useLocale()
  if (overlay !== 'lang') return null
  return (
    <div className="shop-overlay" role="dialog" aria-label="Language">
      <div className="shop-panel">
        <div className="shop-header">
          <h2>{t('lang.title')}</h2>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        <div className="room-grid">
          {LOCALES.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`hub-card ${locale === l.id ? 'active' : ''}`}
              onClick={() => {
                setLocale(l.id)
                setOverlay('none')
              }}
            >
              <strong>{l.label}</strong>
              <span>{l.id.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CardsPanel() {
  const overlay = useGameStore((s) => s.overlay)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const ownedCards = useGameStore((s) => s.ownedCards)
  const claimedCardSets = useGameStore((s) => s.claimedCardSets)
  const claimCardSet = useGameStore((s) => s.claimCardSet)
  const { t } = useLocale()
  if (overlay !== 'cards') return null
  return (
    <div className="shop-overlay" role="dialog" aria-label="Collectible cards">
      <div className="shop-panel wide">
        <div className="shop-header">
          <h2>{t('cards.title')}</h2>
          <p className="shop-coins">
            {ownedCards.length}/{CARDS.length}
          </p>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        <p className="panel-note">{t('cards.note')}</p>
        <div className="card-sets">
          {CARD_SETS.map((set) => {
            const progress = setProgress(ownedCards, set)
            const claimed = claimedCardSets.includes(set.id)
            const ready = progress.complete && !claimed
            return (
              <div key={set.id} className={`card-set ${claimed ? 'claimed' : ''} ${ready ? 'ready' : ''}`}>
                <div className="card-set-copy">
                  <strong>{set.name}</strong>
                  <span>
                    {progress.owned}/{progress.total} · +{set.rewardCoins}c
                    {set.rewardStars ? ` · +${set.rewardStars}★` : ''}
                    {set.rewardFuel ? ` · +${set.rewardFuel} fuel` : ''}
                  </span>
                  <em>{set.blurb}</em>
                  <div className="mission-bar">
                    <i style={{ width: `${Math.min(100, (progress.owned / progress.total) * 100)}%` }} />
                  </div>
                </div>
                <button
                  type="button"
                  className="mission-claim"
                  disabled={!ready}
                  onClick={() => claimCardSet(set.id)}
                >
                  {claimed ? t('cards.set.done') : ready ? t('cards.set.claim') : t('cards.set.track')}
                </button>
              </div>
            )
          })}
        </div>
        <div className="card-album">
          {CARDS.map((card) => {
            const owned = ownedCards.includes(card.id)
            return (
              <div
                key={card.id}
                className={`album-card ${owned ? 'owned' : 'locked'} rarity-${card.rarity}`}
                style={{ ['--card-color' as string]: `#${card.color.toString(16).padStart(6, '0')}` }}
              >
                <strong>{owned ? card.name : '???'}</strong>
                <span>{owned ? card.blurb : t('cards.locked')}</span>
                <em>{card.rarity}</em>
              </div>
            )
          })}
        </div>
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
  const { t } = useLocale()
  if (overlay !== 'skills') return null
  return (
    <div className="shop-overlay" role="dialog" aria-label="Skills">
      <div className="shop-panel">
        <div className="shop-header">
          <h2>{t('skills.title')}</h2>
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
  const playWithCompanion = useGameStore((s) => s.playWithCompanion)
  const companionPlayUntil = useGameStore((s) => s.companionPlayUntil)
  const { t } = useLocale()
  if (overlay !== 'companions') return null
  const playCooling = companionPlayUntil > Date.now()
  return (
    <div className="shop-overlay" role="dialog" aria-label="Companions">
      <div className="shop-panel">
        <div className="shop-header">
          <h2>{t('companions.title')}</h2>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        {COMPANIONS.map((c) => {
          if (c.id === 'none') {
            return (
              <button key={c.id} type="button" className="hub-card" onClick={() => unlockCompanion('none')}>
                <strong>{t('companions.solo')}</strong>
                <span>{t('companions.solo.blurb')}</span>
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
              <span>
                {t('companions.voice')}: {c.voiceLabel}
                {' · '}
                {owned
                  ? companion === c.id
                    ? t('companions.active')
                    : t('companions.owned')
                  : `${c.unlockCost}c`}
              </span>
            </button>
          )
        })}
        <button
          type="button"
          className="name-submit"
          disabled={companion === 'none' || playCooling}
          onClick={() => {
            if (playWithCompanion()) setOverlay('none')
          }}
        >
          {playCooling ? t('companions.play.cool') : t('companions.play')}
        </button>
        <p className="hint">{t('companions.hint')}</p>
      </div>
    </div>
  )
}

export function EventPanel() {
  const overlay = useGameStore((s) => s.overlay)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const claimEventBonus = useGameStore((s) => s.claimEventBonus)
  const doEventActivity = useGameStore((s) => s.doEventActivity)
  const eventClaimDate = useGameStore((s) => s.eventClaimDate)
  const eventActivityDate = useGameStore((s) => s.eventActivityDate)
  const { t } = useLocale()
  const event = getActiveEvent()
  if (overlay !== 'event' || !event) return null
  const today = todayKey()
  const claimed = eventClaimDate === today
  const activityDone = eventActivityDate === today
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
          {claimed ? t('event.claimed') : `${t('event.claim')} +${event.loginBonus}c`}
        </button>
        {event.activityKind ? (
          <button
            type="button"
            className="hub-card event-activity"
            disabled={activityDone}
            onClick={() => doEventActivity()}
          >
            <strong>{event.activityLabel ?? t('event.activity')}</strong>
            <span>
              {activityDone
                ? t('event.activity.done')
                : `+${event.activityBonus ?? 10}c · ${event.activityKind}`}
            </span>
          </button>
        ) : null}
      </div>
    </div>
  )
}

export function MissionsPanel() {
  const overlay = useGameStore((s) => s.overlay)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const missionProgress = useGameStore((s) => s.missionProgress)
  const claimedMissions = useGameStore((s) => s.claimedMissions)
  const claimMission = useGameStore((s) => s.claimMission)
  const ensureMissions = useGameStore((s) => s.ensureMissions)
  const { t } = useLocale()

  useEffect(() => {
    if (overlay === 'missions') ensureMissions()
  }, [overlay, ensureMissions])

  if (overlay !== 'missions') return null
  const missions = missionsForDay(todayKey())

  return (
    <div className="shop-overlay" role="dialog" aria-label="Daily missions">
      <div className="shop-panel">
        <div className="shop-header">
          <h2>{t('missions.title')}</h2>
          <p className="shop-coins">{t('missions.subtitle')}</p>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        <div className="mission-list">
          {missions.map((m) => {
            const progress = missionProgress[m.id] ?? 0
            const claimed = claimedMissions.includes(m.id)
            const ready = progress >= m.target && !claimed
            return (
              <div key={m.id} className={`mission-card ${claimed ? 'claimed' : ''} ${ready ? 'ready' : ''}`}>
                <div className="mission-copy">
                  <strong>{m.label}</strong>
                  <span>
                    {Math.min(progress, m.target)}/{m.target} · +{m.rewardCoins}c
                    {m.rewardFuel ? ` · +${m.rewardFuel} fuel` : ''}
                  </span>
                  <div className="mission-bar">
                    <i style={{ width: `${Math.min(100, (progress / m.target) * 100)}%` }} />
                  </div>
                </div>
                <button
                  type="button"
                  className="mission-claim"
                  disabled={!ready}
                  onClick={() => claimMission(m.id)}
                >
                  {claimed ? t('missions.done') : ready ? t('missions.claim') : t('missions.track')}
                </button>
              </div>
            )
          })}
        </div>
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
