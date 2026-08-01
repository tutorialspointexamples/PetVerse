import { useEffect, useRef } from 'react'
import { PetScene, type PokeZone } from '../game/PetScene'
import { useGameStore } from '../state/gameStore'

export function GameCanvas() {
  const hostRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<PetScene | null>(null)

  const needs = useGameStore((s) => s.needs)
  const bodyColor = useGameStore((s) => s.bodyColor)
  const hat = useGameStore((s) => s.hat)
  const glasses = useGameStore((s) => s.glasses)
  const scarf = useGameStore((s) => s.scarf)
  const shirt = useGameStore((s) => s.shirt)
  const shoes = useGameStore((s) => s.shoes)
  const reaction = useGameStore((s) => s.reaction)
  const sleeping = useGameStore((s) => s.sleeping)
  const talking = useGameStore((s) => s.talking)
  const petName = useGameStore((s) => s.petName)
  const placedFurniture = useGameStore((s) => s.placedFurniture)
  const companion = useGameStore((s) => s.companion)
  const room = useGameStore((s) => s.room)
  const poke = useGameStore((s) => s.poke)
  const pokeCompanion = useGameStore((s) => s.pokeCompanion)
  const doCare = useGameStore((s) => s.doCare)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const collectCard = useGameStore((s) => s.collectCard)

  const actionsRef = useRef({ poke, pokeCompanion, doCare, setOverlay, collectCard })
  actionsRef.current = { poke, pokeCompanion, doCare, setOverlay, collectCard }

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const onZone = (zone: PokeZone) => {
      const a = actionsRef.current
      if (zone === 'companion') a.pokeCompanion()
      else if (zone === 'kitchen_food') a.setOverlay('food')
      else if (zone === 'kitchen_stove') {
        if (a.doCare('feed')) a.collectCard('stove_spark')
      }       else if (zone === 'bath_tub') a.doCare('bath')
      else if (zone === 'bath_sink') a.doCare('brush')
      else if (zone === 'bath_potty') a.doCare('potty')
      else if (zone === 'bed_sleep') a.doCare('sleep')
      else if (zone === 'bedroom_lamp') {
        a.poke('head')
        a.collectCard('lamp_glow')
      } else if (zone === 'yard_swing') {
        if (a.doCare('play')) a.collectCard('swing_ticket')
      } else if (zone === 'yard_play') a.doCare('play')
      else if (zone === 'living_tv') a.doCare('play')
      else if (zone === 'living_sofa') {
        a.poke('belly')
        a.collectCard('sofa_cushion')
      } else a.poke(zone)
    }

    const scene = new PetScene(
      host,
      {
        needs,
        bodyColor,
        hat,
        glasses,
        scarf,
        shirt,
        shoes,
        reaction,
        sleeping,
        talking,
        petName,
        placedFurniture,
        companion,
        room,
      },
      onZone,
    )
    sceneRef.current = scene

    return () => {
      scene.destroy()
      sceneRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    sceneRef.current?.updateProps({
      needs,
      bodyColor,
      hat,
      glasses,
      scarf,
      shirt,
      shoes,
      reaction,
      sleeping,
      talking,
      petName,
      placedFurniture,
      companion,
      room,
    })
  }, [
    needs,
    bodyColor,
    hat,
    glasses,
    scarf,
    shirt,
    shoes,
    reaction,
    sleeping,
    talking,
    petName,
    placedFurniture,
    companion,
    room,
  ])

  return <div className="game-canvas" ref={hostRef} aria-label="Pet room" />
}
