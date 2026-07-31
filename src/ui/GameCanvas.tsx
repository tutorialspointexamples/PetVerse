import { useEffect, useRef } from 'react'
import { PetScene } from '../game/PetScene'
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

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

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
      (zone) => {
        if (zone === 'companion') pokeCompanion()
        else poke(zone)
      },
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
