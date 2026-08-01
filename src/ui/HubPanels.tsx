import { WORLDS, getWorldSpots, type WorldSpot } from '../game/worlds'
import { getActiveEvent } from '../game/events'
import { COMPANIONS, SKILLS, levelFromXp, type SkillId } from '../game/progress'
import { getCompanionCare } from '../game/companionCare'
import { FOODS } from '../game/foods'
import { ROOMS } from '../game/rooms'
import { CARD_SETS, CARDS, setProgress } from '../game/cards'
import { missionsForDay, todayKey } from '../game/missions'
import { IAP_PRODUCTS, purchaseIap, showRewardedAd } from '../monetization/stubs'
import { playSkillBeatSfx } from '../audio/skillSfx'
import { useGameStore } from '../state/gameStore'
import { useEffect, useRef, useState } from 'react'
import { LOCALES } from '../i18n/strings'
import { useLocale } from '../i18n/useLocale'
import { WorldSpotActivity } from './WorldSpotActivity'

type SkillDifficulty = 'easy' | 'normal' | 'hard'

const SKILL_DIFF: Record<
  SkillDifficulty,
  { beats: number; speed: number; perfectPad: number; goodPad: number; labelKey: string }
> = {
  easy: { beats: 3, speed: 1.05, perfectPad: 0.12, goodPad: 0.28, labelKey: 'skills.diff.easy' },
  normal: { beats: 4, speed: 1.35, perfectPad: 0.08, goodPad: 0.22, labelKey: 'skills.diff.normal' },
  hard: { beats: 6, speed: 1.75, perfectPad: 0.05, goodPad: 0.14, labelKey: 'skills.diff.hard' },
}

const SKILL_REACTION: Record<SkillId, 'skill_drums' | 'skill_hoop' | 'skill_boxing'> = {
  drums: 'skill_drums',
  hoop: 'skill_hoop',
  boxing: 'skill_boxing',
}

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
                        ? ' · pad/swing/fountain/sandbox=play'
                        : r.id === 'cinema'
                          ? ' · screen=watch, console=play, seats=poke'
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
  const setReaction = useGameStore((s) => s.setReaction)
  const unlockedSkills = useGameStore((s) => s.unlockedSkills)
  const skillPracticeUntil = useGameStore((s) => s.skillPracticeUntil)
  const reaction = useGameStore((s) => s.reaction)
  const companion = useGameStore((s) => s.companion)
  const companionCare = useGameStore((s) => s.companionCare)
  const level = levelFromXp(xp)
  const { t } = useLocale()
  const [difficulty, setDifficulty] = useState<SkillDifficulty>('normal')
  const [activeSkill, setActiveSkill] = useState<SkillId | null>(null)
  const [beatIndex, setBeatIndex] = useState(0)
  const [meter, setMeter] = useState(0)
  const [dir, setDir] = useState(1)
  const [perfects, setPerfects] = useState(0)
  const [goods, setGoods] = useState(0)
  const [misses, setMisses] = useState(0)
  const [duoHits, setDuoHits] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [popup, setPopup] = useState<string | null>(null)
  const [resultMsg, setResultMsg] = useState<string | null>(null)
  const running = useRef(true)
  const companionJoins =
    companion !== 'none' && getCompanionCare(companionCare, companion).happiness > 40
  const diff = SKILL_DIFF[difficulty]
  // Companion co-op beats on even indices when a happy pet is active
  const isDuoBeat = companionJoins && activeSkill != null && beatIndex % 2 === 1

  useEffect(() => {
    running.current = true
    return () => {
      running.current = false
    }
  }, [])

  useEffect(() => {
    if (!activeSkill || resultMsg) return
    let frame = 0
    let last = performance.now()
    const loop = (now: number) => {
      if (!running.current || !activeSkill) return
      const dt = (now - last) / 1000
      last = now
      setMeter((m) => {
        const speed = diff.speed + beatIndex * 0.1 + streak * 0.04
        let next = m + dir * dt * speed
        if (next >= 1) {
          next = 1
          setDir(-1)
        } else if (next <= 0) {
          next = 0
          setDir(1)
        }
        return next
      })
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [activeSkill, beatIndex, dir, streak, resultMsg, diff.speed])

  if (overlay !== 'skills') return null
  const cooling = skillPracticeUntil > Date.now()
  const performing = reaction.startsWith('skill_')
  const perfectLo = 0.5 - diff.perfectPad
  const perfectHi = 0.5 + diff.perfectPad
  const goodLo = 0.5 - diff.goodPad
  const goodHi = 0.5 + diff.goodPad
  // Duo beats shift the sweet spot slightly so companion timing feels distinct
  const zoneShift = isDuoBeat ? 0.08 : 0

  const startRhythm = (id: SkillId) => {
    if (cooling || level < (SKILLS.find((s) => s.id === id)?.unlockLevel ?? 99)) return
    setActiveSkill(id)
    setBeatIndex(0)
    setMeter(0.15)
    setDir(1)
    setPerfects(0)
    setGoods(0)
    setMisses(0)
    setDuoHits(0)
    setStreak(0)
    setBestStreak(0)
    setPopup(null)
    setResultMsg(null)
    setReaction(SKILL_REACTION[id])
  }

  const hitBeat = () => {
    if (!activeSkill || resultMsg) return
    const center = meter - zoneShift
    const perfect = center > perfectLo && center < perfectHi
    const good = !perfect && center > goodLo && center < goodHi
    let nextPerfects = perfects
    let nextGoods = goods
    let nextMisses = misses
    let nextDuo = duoHits
    let nextStreak = streak
    let quality: 'perfect' | 'good' | 'miss' = 'miss'
    if (perfect) {
      nextPerfects += 1
      nextStreak += 1
      quality = 'perfect'
      if (isDuoBeat) nextDuo += 1
      setPopup(
        isDuoBeat
          ? t('skills.duo')
          : nextStreak >= 3
            ? t('skills.fire').replace('{n}', String(nextStreak))
            : nextStreak >= 2
              ? t('skills.combo').replace('{n}', String(nextStreak))
              : t('skills.perfect'),
      )
    } else if (good) {
      nextGoods += 1
      nextStreak += 1
      quality = 'good'
      if (isDuoBeat) nextDuo += 1
      setPopup(
        isDuoBeat
          ? t('skills.duo')
          : nextStreak >= 2
            ? t('skills.combo').replace('{n}', String(nextStreak))
            : t('skills.good'),
      )
    } else {
      nextMisses += 1
      nextStreak = 0
      quality = 'miss'
      setPopup(t('skills.miss'))
    }
    playSkillBeatSfx(quality)
    const nextBest = Math.max(bestStreak, nextStreak)
    setPerfects(nextPerfects)
    setGoods(nextGoods)
    setMisses(nextMisses)
    setDuoHits(nextDuo)
    setStreak(nextStreak)
    setBestStreak(nextBest)
    const nextBeat = beatIndex + 1
    if (nextBeat >= diff.beats) {
      const ok = practiceSkill(activeSkill, {
        perfects: nextPerfects,
        goods: nextGoods,
        misses: nextMisses,
        bestStreak: nextBest,
        duoHits: nextDuo,
        difficulty,
      })
      if (ok) {
        const stars =
          nextPerfects >= Math.ceil(diff.beats * 0.75)
            ? '★★★'
            : nextPerfects + nextGoods >= Math.ceil(diff.beats * 0.6)
              ? '★★☆'
              : nextGoods >= 1
                ? '★☆☆'
                : '☆☆☆'
        const base = t('skills.result')
          .replace('{stars}', stars)
          .replace('{p}', String(nextPerfects))
          .replace('{g}', String(nextGoods))
        setResultMsg(nextDuo > 0 ? `${base} · ${t('skills.duo.result').replace('{n}', String(nextDuo))}` : base)
      } else {
        setResultMsg(t('skills.cool'))
        setReaction('idle')
      }
      window.setTimeout(() => {
        if (!running.current) return
        setActiveSkill(null)
        setPopup(null)
        setResultMsg(null)
      }, 1600)
    } else {
      setBeatIndex(nextBeat)
      setMeter(0.1 + Math.random() * 0.2)
      setDir(1)
      window.setTimeout(() => {
        if (running.current) setPopup(null)
      }, 450)
    }
  }

  const cancelRhythm = () => {
    setActiveSkill(null)
    setPopup(null)
    setResultMsg(null)
    if (reaction.startsWith('skill_')) setReaction('idle')
  }

  return (
    <div className="shop-overlay" role="dialog" aria-label="Skills">
      <div className="shop-panel">
        <div className="shop-header">
          <h2>{t('skills.title')}</h2>
          <p className="shop-coins">Lv {level}</p>
          <button
            type="button"
            className="close-btn"
            onClick={() => {
              cancelRhythm()
              setOverlay('none')
            }}
          >
            ×
          </button>
        </div>
        {!activeSkill ? (
          <div className="skill-diff-row" role="group" aria-label={t('skills.diff')}>
            {(['easy', 'normal', 'hard'] as const).map((id) => (
              <button
                key={id}
                type="button"
                className={`skill-diff-btn ${difficulty === id ? 'active' : ''}`}
                disabled={cooling || (id === 'hard' && level < 3)}
                onClick={() => setDifficulty(id)}
              >
                {t(SKILL_DIFF[id].labelKey)}
              </button>
            ))}
          </div>
        ) : null}
        <p className="panel-note">
          {activeSkill
            ? isDuoBeat
              ? t('skills.performing.duo')
              : companionJoins
                ? t('skills.performing.cheer')
                : t('skills.performing')
            : performing
              ? companion !== 'none'
                ? t('skills.performing.cheer')
                : t('skills.performing')
              : cooling
                ? t('skills.cool')
                : companionJoins
                  ? t('skills.hint.duo')
                  : t('skills.hint')}
        </p>
        {activeSkill ? (
          <div className={`skill-rhythm ${isDuoBeat ? 'duo' : ''}`} aria-label={t('skills.rhythm')}>
            <div className="skill-rhythm-top">
              <strong>
                {SKILLS.find((s) => s.id === activeSkill)?.name} · {t(diff.labelKey)}
              </strong>
              <span>
                {t('skills.beat')} {Math.min(beatIndex + 1, diff.beats)}/{diff.beats}
              </span>
            </div>
            <div className="skill-meter" role="meter" aria-valuenow={Math.round(meter * 100)}>
              <div
                className="skill-meter-zone"
                style={{
                  left: `${(goodLo + zoneShift) * 100}%`,
                  width: `${(goodHi - goodLo) * 100}%`,
                }}
              />
              <div
                className="skill-meter-perfect"
                style={{
                  left: `${(perfectLo + zoneShift) * 100}%`,
                  width: `${(perfectHi - perfectLo) * 100}%`,
                }}
              />
              <div className="skill-meter-needle" style={{ left: `${meter * 100}%` }} />
            </div>
            <div className="skill-beat-dots">
              {Array.from({ length: diff.beats }, (_, i) => (
                <span
                  key={i}
                  className={`skill-beat-dot ${i < beatIndex ? 'done' : i === beatIndex ? 'active' : ''} ${
                    companionJoins && i % 2 === 1 ? 'duo' : ''
                  }`}
                />
              ))}
            </div>
            {popup ? <p className="skill-popup">{popup}</p> : null}
            {resultMsg ? <p className="skill-result">{resultMsg}</p> : null}
            <button type="button" className="skill-hit-btn" disabled={!!resultMsg} onClick={hitBeat}>
              {isDuoBeat
                ? t('skills.hit.duo')
                : activeSkill === 'drums'
                  ? t('skills.hit.drums')
                  : activeSkill === 'hoop'
                    ? t('skills.hit.hoop')
                    : t('skills.hit.boxing')}
            </button>
            <button type="button" className="hub-card skill-cancel" onClick={cancelRhythm}>
              <strong>{t('skills.cancel')}</strong>
            </button>
          </div>
        ) : (
          SKILLS.map((skill) => {
            const locked = level < skill.unlockLevel
            const learned = unlockedSkills.includes(skill.id)
            return (
              <button
                key={skill.id}
                type="button"
                className="hub-card"
                disabled={locked || cooling}
                onClick={() => startRhythm(skill.id)}
              >
                <strong>
                  {skill.name}
                  {learned ? '' : ` · ${t('skills.new')}`}
                </strong>
                <span>
                  {locked
                    ? t('skills.unlock').replace('{n}', String(skill.unlockLevel))
                    : cooling
                      ? t('skills.cooling')
                      : t('skills.reward')
                          .replace('{c}', String(skill.coinReward))
                          .replace('{x}', String(skill.xpReward))}
                </span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

export function CompanionsPanel() {
  const overlay = useGameStore((s) => s.overlay)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const coins = useGameStore((s) => s.coins)
  const companion = useGameStore((s) => s.companion)
  const companionCare = useGameStore((s) => s.companionCare)
  const ownedCompanions = useGameStore((s) => s.ownedCompanions)
  const unlockCompanion = useGameStore((s) => s.unlockCompanion)
  const playWithCompanion = useGameStore((s) => s.playWithCompanion)
  const feedCompanion = useGameStore((s) => s.feedCompanion)
  const companionPlayUntil = useGameStore((s) => s.companionPlayUntil)
  const { t } = useLocale()
  if (overlay !== 'companions') return null
  const playCooling = companionPlayUntil > Date.now()
  const care = getCompanionCare(companionCare, companion)
  return (
    <div className="shop-overlay" role="dialog" aria-label="Companions">
      <div className="shop-panel">
        <div className="shop-header">
          <h2>{t('companions.title')}</h2>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        {companion !== 'none' ? (
          <div className="companion-care-card" aria-label={t('companions.care')}>
            <p className="companion-care-title">{t('companions.care')}</p>
            <div className="companion-care-meters">
              <div className="companion-care-row">
                <span>{t('companions.hunger')}</span>
                <div className="need-track slim">
                  <div
                    className={`need-fill ${care.hunger < 30 ? 'low' : care.hunger < 50 ? 'mid' : 'high'}`}
                    style={{ width: `${care.hunger}%` }}
                  />
                </div>
                <span>{Math.round(care.hunger)}</span>
              </div>
              <div className="companion-care-row">
                <span>{t('companions.happy')}</span>
                <div className="need-track slim">
                  <div
                    className={`need-fill ${care.happiness < 30 ? 'low' : care.happiness < 50 ? 'mid' : 'high'}`}
                    style={{ width: `${care.happiness}%` }}
                  />
                </div>
                <span>{Math.round(care.happiness)}</span>
              </div>
            </div>
          </div>
        ) : null}
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
          const petCare = getCompanionCare(companionCare, c.id)
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
              {owned ? (
                <span className="companion-care-mini">
                  {t('companions.hunger')} {Math.round(petCare.hunger)} · {t('companions.happy')}{' '}
                  {Math.round(petCare.happiness)}
                </span>
              ) : null}
            </button>
          )
        })}
        <div className="companion-actions">
          <button
            type="button"
            className="name-submit secondary"
            disabled={companion === 'none' || coins < 3}
            onClick={() => feedCompanion()}
          >
            {t('companions.feed')} · 3c
          </button>
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
        </div>
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
  const addFuel = useGameStore((s) => s.addFuel)
  const unlockAdFree = useGameStore((s) => s.unlockAdFree)
  const adFree = useGameStore((s) => s.adFree)
  const { t } = useLocale()

  if (overlay !== 'rewarded') return null

  const watch = async () => {
    const result = await showRewardedAd()
    if (result.watched) applyRewardedBoost()
  }

  const buy = async (id: string, coins: number, fuel: number, kind: string) => {
    const result = await purchaseIap(id)
    if (!result.ok) return
    if (coins > 0) addCoins(coins)
    if (fuel > 0) addFuel(fuel)
    if (kind === 'adfree') unlockAdFree()
    setOverlay('none')
  }

  return (
    <div className="shop-overlay" role="dialog" aria-label="Rewards">
      <div className="shop-panel">
        <div className="shop-header">
          <h2>{t('boost.title')}</h2>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')}>
            ×
          </button>
        </div>
        <p className="panel-note">{t('boost.note')}</p>
        {adFree ? <p className="panel-note">{t('boost.adfree.on')}</p> : null}
        <button type="button" className="hub-card" onClick={() => void watch()}>
          <strong>{adFree ? t('boost.reward.adfree') : t('boost.reward')}</strong>
          <span>{t('boost.reward.blurb')}</span>
        </button>
        {IAP_PRODUCTS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="hub-card"
            disabled={p.kind === 'adfree' && adFree}
            onClick={() => void buy(p.id, p.coins, p.fuel, p.kind)}
          >
            <strong>
              {t(`boost.iap.${p.id}`)} · {p.priceLabel}
            </strong>
            <span>
              {p.kind === 'adfree'
                ? t('boost.iap.ad_free.blurb')
                : p.kind === 'fuel'
                  ? t('boost.iap.fuel.blurb').replace('{n}', String(p.fuel))
                  : p.kind === 'style'
                    ? t('boost.iap.style.blurb')
                    : t('boost.iap.coins.blurb').replace('{n}', String(p.coins))}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
