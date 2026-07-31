import { useEffect, useRef } from 'react'
import { useGameStore } from './state/gameStore'
import { GameCanvas } from './ui/GameCanvas'
import { NeedsHud } from './ui/NeedsHud'
import { ActionBar } from './ui/ActionBar'
import { ShopPanel } from './ui/ShopPanel'
import { NameModal } from './ui/NameModal'
import { SkyDashGame } from './ui/SkyDashGame'
import { DunkTossGame } from './ui/DunkTossGame'
import { SpaceTrailsGame } from './ui/SpaceTrailsGame'
import { BuildPlaneGame } from './ui/BuildPlaneGame'
import {
  CompanionsPanel,
  EventPanel,
  FlightPanel,
  FoodPanel,
  GamesHub,
  RewardedPanel,
  RoomsPanel,
  SkillsPanel,
  TravelPanel,
  WorldVisitPanel,
} from './ui/HubPanels'
import { getActiveEvent } from './game/events'

export default function App() {
  const hydrate = useGameStore((s) => s.hydrate)
  const tick = useGameStore((s) => s.tick)
  const save = useGameStore((s) => s.save)
  const overlay = useGameStore((s) => s.overlay)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const eventClaimDate = useGameStore((s) => s.eventClaimDate)
  const named = useGameStore((s) => s.named)
  const eventPrompted = useRef(false)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!named || eventPrompted.current) return
    const event = getActiveEvent()
    const today = new Date().toISOString().slice(0, 10)
    if (event && eventClaimDate !== today) {
      eventPrompted.current = true
      setOverlay('event')
    }
  }, [named, eventClaimDate, setOverlay])

  useEffect(() => {
    let frame = 0
    let last = performance.now()
    let saveAcc = 0

    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      tick(dt)
      saveAcc += dt
      if (saveAcc > 5) {
        save()
        saveAcc = 0
      }
      frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [tick, save])

  useEffect(() => {
    const onHide = () => save()
    const onVis = () => {
      if (document.visibilityState === 'hidden') save()
    }
    window.addEventListener('pagehide', onHide)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('pagehide', onHide)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [save])

  const inMinigame =
    overlay === 'skyDash' ||
    overlay === 'dunkToss' ||
    overlay === 'spaceTrails' ||
    overlay === 'buildPlane'

  return (
    <div className="app-shell">
      <div className="atmosphere" aria-hidden />
      {!inMinigame ? <NeedsHud /> : null}
      <main className="stage">
        <GameCanvas />
      </main>
      {!inMinigame ? <ActionBar /> : null}
      <ShopPanel />
      <GamesHub />
      <TravelPanel />
      <FlightPanel />
      <WorldVisitPanel />
      <FoodPanel />
      <RoomsPanel />
      <SkillsPanel />
      <CompanionsPanel />
      <EventPanel />
      <RewardedPanel />
      {overlay === 'skyDash' ? <SkyDashGame /> : null}
      {overlay === 'dunkToss' ? <DunkTossGame /> : null}
      {overlay === 'spaceTrails' ? <SpaceTrailsGame /> : null}
      {overlay === 'buildPlane' ? <BuildPlaneGame /> : null}
      <NameModal />
    </div>
  )
}
