import { Application, Container, Graphics, Text } from 'pixi.js'
import {
  getBodyColor,
  getGlasses,
  getHat,
  getScarf,
  getShirt,
  getShoes,
  type BodyColorId,
  type GlassesId,
  type HatId,
  type ScarfId,
  type ShirtId,
  type ShoesId,
} from './cosmetics'
import { getFurniture, type FurnitureId } from './furniture'
import { getCompanion, type CompanionId } from './progress'
import { deriveMood, type Needs } from './needs'
import type { Reaction } from '../state/gameStore'
import { getRoom, type RoomId } from './rooms'

export interface PetSceneProps {
  needs: Needs
  bodyColor: BodyColorId
  hat: HatId
  glasses: GlassesId
  scarf: ScarfId
  shirt: ShirtId
  shoes: ShoesId
  reaction: Reaction
  sleeping: boolean
  talking: boolean
  petName: string
  placedFurniture: FurnitureId[]
  companion: CompanionId
  room: RoomId
}

export type PokeZone =
  | 'head'
  | 'belly'
  | 'companion'
  | 'kitchen_food'
  | 'kitchen_stove'
  | 'bath_tub'
  | 'bath_sink'
  | 'bath_potty'
  | 'bed_sleep'
  | 'bedroom_lamp'
  | 'yard_play'
  | 'yard_swing'
  | 'living_tv'
  | 'living_sofa'

export class PetScene {
  readonly app: Application
  private root = new Container()
  private roomBack = new Graphics()
  private furnitureLayer = new Graphics()
  private roomFront = new Graphics()
  private roomPropHit = new Graphics()
  private roomPropHitB = new Graphics()
  private roomPropHitC = new Graphics()
  private roomPropHint = new Graphics()
  private pet = new Container()
  private shadow = new Graphics()
  private legs = new Graphics()
  private shoesGfx = new Graphics()
  private body = new Graphics()
  private shirtGfx = new Graphics()
  private arms = new Graphics()
  private head = new Graphics()
  private face = new Graphics()
  private scarfGfx = new Graphics()
  private glassesGfx = new Graphics()
  private hatGfx = new Graphics()
  private companionGfx = new Graphics()
  private companionHit = new Graphics()
  private fx = new Graphics()
  private zzz = new Text({
    text: 'z',
    style: { fill: 0xffffff, fontSize: 28, fontFamily: 'Fredoka, system-ui' },
  })
  private nameTag = new Text({
    text: '',
    style: {
      fill: 0xffffff,
      fontSize: 22,
      fontFamily: 'Fredoka, Nunito, system-ui',
      fontWeight: '700',
      dropShadow: { color: 0x1a2a22, blur: 2, distance: 1, alpha: 0.35 },
    },
  })
  private headHit = new Graphics()
  private bellyHit = new Graphics()
  private time = 0
  private blinkT = 0
  private yawnT = 0
  private stretchT = 0
  private sneezeT = 0
  private earFlopT = 0
  private lookTarget = { x: 0, y: 0 }
  private idleClock = 0
  private idleCycle = 0
  private lastFxReaction: Reaction = 'idle'
  private particles: Array<{
    x: number
    y: number
    vx: number
    vy: number
    life: number
    max: number
    color: number
    size: number
    kind: 'circle' | 'heart' | 'crumb' | 'spark'
  }> = []
  private props: PetSceneProps
  private onPoke: (zone: PokeZone) => void
  private disposed = false
  private ready = false
  private host: HTMLElement | null = null

  constructor(canvasParent: HTMLElement, props: PetSceneProps, onPoke: (zone: PokeZone) => void) {
    this.props = props
    this.onPoke = onPoke
    this.host = canvasParent
    this.app = new Application()
    void this.init(canvasParent)
  }

  private async init(parent: HTMLElement) {
    await this.app.init({
      resizeTo: parent,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    })
    if (this.disposed) {
      this.app.destroy(true)
      return
    }
    parent.appendChild(this.app.canvas)
    this.app.stage.addChild(this.root)
    this.root.addChild(
      this.roomBack,
      this.furnitureLayer,
      this.roomPropHint,
      this.roomPropHit,
      this.roomPropHitB,
      this.roomPropHitC,
      this.pet,
      this.companionGfx,
      this.companionHit,
      this.roomFront,
      this.nameTag,
    )
    this.pet.addChild(
      this.shadow,
      this.legs,
      this.shoesGfx,
      this.body,
      this.shirtGfx,
      this.arms,
      this.head,
      this.scarfGfx,
      this.face,
      this.glassesGfx,
      this.hatGfx,
      this.fx,
      this.zzz,
      this.headHit,
      this.bellyHit,
    )

    this.headHit.eventMode = 'static'
    this.headHit.cursor = 'pointer'
    this.bellyHit.eventMode = 'static'
    this.bellyHit.cursor = 'pointer'
    this.companionHit.eventMode = 'static'
    this.companionHit.cursor = 'pointer'
    this.roomPropHit.eventMode = 'none'
    this.roomPropHit.cursor = 'pointer'
    this.roomPropHitB.eventMode = 'none'
    this.roomPropHitB.cursor = 'pointer'
    this.roomPropHitC.eventMode = 'none'
    this.roomPropHitC.cursor = 'pointer'
    this.headHit.on('pointertap', () => this.onPoke('head'))
    this.bellyHit.on('pointertap', () => this.onPoke('belly'))
    this.companionHit.on('pointertap', () => this.onPoke('companion'))
    this.roomPropHit.on('pointertap', () => {
      const room = this.props.room
      if (room === 'kitchen') this.onPoke('kitchen_food')
      else if (room === 'bathroom') this.onPoke('bath_tub')
      else if (room === 'bedroom') this.onPoke('bed_sleep')
      else if (room === 'yard') this.onPoke('yard_play')
      else if (room === 'living') this.onPoke('living_tv')
    })
    this.roomPropHitB.on('pointertap', () => {
      const room = this.props.room
      if (room === 'bathroom') this.onPoke('bath_sink')
      else if (room === 'kitchen') this.onPoke('kitchen_stove')
      else if (room === 'bedroom') this.onPoke('bedroom_lamp')
      else if (room === 'yard') this.onPoke('yard_swing')
      else if (room === 'living') this.onPoke('living_sofa')
    })
    this.roomPropHitC.on('pointertap', () => {
      if (this.props.room === 'bathroom') this.onPoke('bath_potty')
    })

    parent.addEventListener('pointermove', this.onPointerMove)

    this.zzz.anchor.set(0.5)
    this.nameTag.anchor.set(0.5, 0)

    this.ready = true
    this.layout()
    this.redraw()
    this.app.ticker.add((ticker) => this.update(ticker.deltaMS / 1000))
    window.addEventListener('resize', this.layout)
  }

  private layout = () => {
    if (!this.ready || this.disposed) return
    const w = this.app.screen.width
    const h = this.app.screen.height
    this.pet.position.set(w * 0.5, h * 0.56)
    this.nameTag.position.set(w * 0.5, h * 0.1)
    this.drawRoom(w, h)
    this.drawFurniture(w, h)
    this.drawRoomProps(w, h)
    this.drawCompanion(w, h)
  }

  private drawRoom(w: number, h: number) {
    const back = this.roomBack
    const front = this.roomFront
    back.clear()
    front.clear()
    const room = getRoom(this.props.room)

    back.rect(0, 0, w, h * 0.62)
    back.fill(room.wall)
    back.rect(0, 0, w, h * 0.62)
    back.fill({ color: room.wallAccent, alpha: 0.28 })

    if (this.props.room === 'kitchen') {
      back.roundRect(w * 0.08, h * 0.28, w * 0.28, h * 0.28, 8)
      back.fill(0xffffff)
      back.roundRect(w * 0.1, h * 0.32, w * 0.1, h * 0.08, 4)
      back.fill(0x4cc9f0)
      back.roundRect(w * 0.62, h * 0.36, w * 0.28, h * 0.2, 6)
      back.fill(0xe76f51)
    } else if (this.props.room === 'bathroom') {
      // Sink vanity
      back.roundRect(w * 0.68, h * 0.28, w * 0.22, h * 0.28, 10)
      back.fill(0xffffff)
      back.ellipse(w * 0.79, h * 0.38, 28, 12)
      back.fill(0x90e0ef)
      back.roundRect(w * 0.77, h * 0.3, 10, 14, 3)
      back.fill(0x4cc9f0)
      // Tub
      back.ellipse(w * 0.2, h * 0.5, 40, 28)
      back.fill(0x48cae4)
      back.roundRect(w * 0.12, h * 0.48, 16, 40, 4)
      back.fill(0x0077b6)
      // Toilet / potty (MTT2 bathroom routine prop)
      back.roundRect(w * 0.42, h * 0.36, w * 0.16, h * 0.22, 10)
      back.fill(0xffffff)
      back.ellipse(w * 0.5, h * 0.52, 28, 14)
      back.fill(0xcaf0f8)
      back.roundRect(w * 0.46, h * 0.3, w * 0.08, h * 0.08, 6)
      back.fill(0xf8f9fa)
      back.circle(w * 0.54, h * 0.33, 4)
      back.fill(0x4cc9f0)
    } else if (this.props.room === 'bedroom') {
      back.roundRect(w * 0.08, h * 0.34, w * 0.32, h * 0.24, 10)
      back.fill(0x4a90a4)
      back.roundRect(w * 0.1, h * 0.28, w * 0.2, h * 0.1, 8)
      back.fill(0xffe8c8)
      back.circle(w * 0.78, h * 0.2, 18)
      back.fill({ color: 0xffe066, alpha: 0.55 })
    } else if (this.props.room === 'yard') {
      // Sky gradient bands + sun + fence
      back.rect(0, 0, w, h * 0.62)
      back.fill(0x87ceeb)
      back.rect(0, h * 0.4, w, h * 0.22)
      back.fill({ color: 0xa8dadc, alpha: 0.45 })
      back.circle(w * 0.82, h * 0.14, 28)
      back.fill(0xffe066)
      back.circle(w * 0.82, h * 0.14, 36)
      back.fill({ color: 0xffbe0b, alpha: 0.25 })
      for (let i = 0; i < 8; i++) {
        const fx = w * 0.05 + i * (w * 0.12)
        back.rect(fx, h * 0.48, 8, h * 0.14)
        back.fill(0xb56b45)
      }
      back.rect(0, h * 0.48, w, 6)
      back.fill(0x8b5e3c)
      back.ellipse(w * 0.18, h * 0.42, 36, 22)
      back.fill(0xffffff)
      back.ellipse(w * 0.24, h * 0.4, 28, 18)
      back.fill(0xffffff)
    } else {
      // Living room: window + TV console
      const wx = w * 0.08
      const wy = h * 0.12
      const ww = Math.min(140, w * 0.2)
      const wh = Math.min(110, h * 0.18)
      back.roundRect(wx, wy, ww, wh, 12)
      back.fill(0x9fd7ff)
      back.stroke({ width: 6, color: 0xf2e8d5 })
      back.moveTo(wx + ww / 2, wy)
      back.lineTo(wx + ww / 2, wy + wh)
      back.moveTo(wx, wy + wh / 2)
      back.lineTo(wx + ww, wy + wh / 2)
      back.stroke({ width: 4, color: 0xf2e8d5, alpha: 0.9 })
      const tvX = w * 0.68
      const tvY = h * 0.18
      const tvW = w * 0.24
      const tvH = h * 0.22
      back.roundRect(tvX, tvY, tvW, tvH, 10)
      back.fill(0x1a1a1a)
      back.roundRect(tvX + 8, tvY + 8, tvW - 16, tvH - 28, 6)
      back.fill(0x3a86ff)
      back.roundRect(tvX + tvW * 0.35, tvY + tvH - 14, tvW * 0.3, 10, 3)
      back.fill(0x333333)
      back.ellipse(w * 0.35, h * 0.55, 50, 18)
      back.fill({ color: 0xe07a5f, alpha: 0.35 })
    }

    back.rect(0, h * 0.62, w, h * 0.38)
    back.fill(room.floor)
    back.rect(0, h * 0.62, w, 14)
    back.fill(room.trim)

    front.rect(0, h * 0.92, w, h * 0.08)
    front.fill({ color: 0x1a2a22, alpha: 0.12 })
  }

  private onPointerMove = (e: PointerEvent) => {
    if (!this.ready || this.disposed) return
    const w = this.app.screen.width
    const h = this.app.screen.height
    const rect = this.app.canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * w
    const y = ((e.clientY - rect.top) / rect.height) * h
    const px = this.pet.position.x
    const py = this.pet.position.y - 78
    this.lookTarget.x = Math.max(-4, Math.min(4, (x - px) * 0.02))
    this.lookTarget.y = Math.max(-3, Math.min(3, (y - py) * 0.015))
  }

  /** Interactive kitchen / bathroom / bedroom / living / yard props. */
  private drawRoomProps(w: number, h: number) {
    const hit = this.roomPropHit
    const hitB = this.roomPropHitB
    const hitC = this.roomPropHitC
    const hint = this.roomPropHint
    hit.clear()
    hitB.clear()
    hitC.clear()
    hint.clear()
    hit.eventMode = 'none'
    hitB.eventMode = 'none'
    hitC.eventMode = 'none'
    const pulse = 0.35 + Math.abs(Math.sin(this.time * 2.4)) * 0.35
    const room = this.props.room

    if (room === 'kitchen') {
      // Fridge → food menu
      hit.roundRect(w * 0.08, h * 0.28, w * 0.28, h * 0.28, 8)
      hit.fill({ color: 0xffffff, alpha: 0.001 })
      hit.eventMode = 'static'
      hint.roundRect(w * 0.08, h * 0.28, w * 0.28, h * 0.28, 8)
      hint.stroke({ width: 3, color: 0xffbe0b, alpha: pulse })
      // Stove → quick snack
      hitB.roundRect(w * 0.62, h * 0.36, w * 0.28, h * 0.2, 6)
      hitB.fill({ color: 0xffffff, alpha: 0.001 })
      hitB.eventMode = 'static'
      hint.roundRect(w * 0.62, h * 0.36, w * 0.28, h * 0.2, 6)
      hint.stroke({ width: 3, color: 0xe76f51, alpha: pulse })
      hint.circle(w * 0.72, h * 0.42, 5)
      hint.fill({ color: 0x333333, alpha: 0.5 })
      hint.circle(w * 0.78, h * 0.42, 5)
      hint.fill({ color: 0x333333, alpha: 0.5 })
      const flame = 0.3 + Math.abs(Math.sin(this.time * 10)) * 0.5
      hint.circle(w * 0.72, h * 0.48, 4)
      hint.fill({ color: 0xffbe0b, alpha: flame })
      hint.circle(w * 0.78, h * 0.48, 4)
      hint.fill({ color: 0xe63946, alpha: flame * 0.85 })
    } else if (room === 'bathroom') {
      // Tub → bath
      hit.ellipse(w * 0.2, h * 0.5, 44, 32)
      hit.fill({ color: 0xffffff, alpha: 0.001 })
      hit.eventMode = 'static'
      hint.ellipse(w * 0.2, h * 0.5, 44, 32)
      hint.stroke({ width: 3, color: 0xffffff, alpha: pulse })
      // Sink → brush teeth
      hitB.roundRect(w * 0.68, h * 0.28, w * 0.22, h * 0.28, 10)
      hitB.fill({ color: 0xffffff, alpha: 0.001 })
      hitB.eventMode = 'static'
      hint.roundRect(w * 0.68, h * 0.28, w * 0.22, h * 0.28, 10)
      hint.stroke({ width: 3, color: 0x4cc9f0, alpha: pulse })
      // Toilet → potty routine
      hitC.roundRect(w * 0.4, h * 0.28, w * 0.2, h * 0.3, 10)
      hitC.fill({ color: 0xffffff, alpha: 0.001 })
      hitC.eventMode = 'static'
      hint.roundRect(w * 0.42, h * 0.3, w * 0.16, h * 0.28, 10)
      hint.stroke({ width: 3, color: 0x90e0ef, alpha: pulse })
      hint.ellipse(w * 0.5, h * 0.52, 26, 12)
      hint.fill({ color: 0x4cc9f0, alpha: 0.2 + pulse * 0.2 })
    } else if (room === 'bedroom') {
      // Bed → sleep
      hit.roundRect(w * 0.08, h * 0.28, w * 0.32, h * 0.3, 10)
      hit.fill({ color: 0xffffff, alpha: 0.001 })
      hit.eventMode = 'static'
      hint.roundRect(w * 0.08, h * 0.28, w * 0.32, h * 0.3, 10)
      hint.stroke({ width: 3, color: 0xffe066, alpha: pulse })
      // Lamp → playful night light
      hitB.circle(w * 0.78, h * 0.2, 28)
      hitB.fill({ color: 0xffffff, alpha: 0.001 })
      hitB.eventMode = 'static'
      hint.circle(w * 0.78, h * 0.2, 22)
      hint.stroke({ width: 3, color: 0xffe066, alpha: pulse })
      hint.circle(w * 0.78, h * 0.2, 16)
      hint.fill({ color: 0xffe066, alpha: 0.25 + pulse * 0.35 })
    } else if (room === 'yard') {
      // Trampoline / play spot → play care
      hit.ellipse(w * 0.5, h * 0.72, 70, 28)
      hit.fill({ color: 0xffffff, alpha: 0.001 })
      hit.eventMode = 'static'
      hint.ellipse(w * 0.5, h * 0.72, 70, 28)
      hint.stroke({ width: 3, color: 0x4cc9f0, alpha: pulse })
      hint.ellipse(w * 0.5, h * 0.72, 50, 18)
      hint.fill({ color: 0x4cc9f0, alpha: 0.15 })
      // Swing → play
      const sx = w * 0.18
      const sy = h * 0.38
      hitB.roundRect(sx - 20, sy, 56, 90, 8)
      hitB.fill({ color: 0xffffff, alpha: 0.001 })
      hitB.eventMode = 'static'
      hint.moveTo(sx, sy)
      hint.lineTo(sx - 10, sy + 70)
      hint.moveTo(sx + 30, sy)
      hint.lineTo(sx + 40, sy + 70)
      hint.stroke({ width: 3, color: 0xb56b45, alpha: 0.85 })
      hint.roundRect(sx - 14, sy + 66, 58, 14, 6)
      hint.fill({ color: 0xe76f51, alpha: 0.85 })
      hint.roundRect(sx - 14, sy + 66, 58, 14, 6)
      hint.stroke({ width: 2, color: 0xffbe0b, alpha: pulse })
    } else if (room === 'living') {
      // TV → watch / play
      hit.roundRect(w * 0.68, h * 0.18, w * 0.24, h * 0.22, 10)
      hit.fill({ color: 0xffffff, alpha: 0.001 })
      hit.eventMode = 'static'
      hint.roundRect(w * 0.68, h * 0.18, w * 0.24, h * 0.22, 10)
      hint.stroke({ width: 3, color: 0x9b5de5, alpha: pulse })
      const flicker = 0.35 + Math.abs(Math.sin(this.time * 6)) * 0.4
      hint.roundRect(w * 0.7, h * 0.2, w * 0.2, h * 0.16, 6)
      hint.fill({ color: 0x4cc9f0, alpha: flicker * 0.35 })
      // Sofa → poke / laugh
      hitB.ellipse(w * 0.35, h * 0.55, 58, 24)
      hitB.fill({ color: 0xffffff, alpha: 0.001 })
      hitB.eventMode = 'static'
      hint.ellipse(w * 0.35, h * 0.55, 58, 24)
      hint.stroke({ width: 3, color: 0xe07a5f, alpha: pulse })
      hint.roundRect(w * 0.22, h * 0.48, w * 0.26, h * 0.08, 8)
      hint.fill({ color: 0xe07a5f, alpha: 0.35 })
    }
  }

  private drawFurniture(w: number, h: number) {
    const g = this.furnitureLayer
    g.clear()
    const placed = this.props.placedFurniture
    const floorY = h * 0.78
    let sideIndex = 0

    for (const id of placed) {
      const item = getFurniture(id)
      if (item.slot === 'floor') {
        if (id.startsWith('rug')) {
          g.ellipse(w * 0.5, floorY, Math.min(220, w * 0.36), Math.min(70, h * 0.075))
          g.fill(item.color)
          g.ellipse(w * 0.5, floorY, Math.min(170, w * 0.28), Math.min(48, h * 0.05))
          g.fill(item.accent)
          if (id === 'rug_star') {
            g.moveTo(w * 0.5, floorY - 16)
            g.lineTo(w * 0.5 + 8, floorY - 4)
            g.lineTo(w * 0.5 + 20, floorY - 4)
            g.lineTo(w * 0.5 + 10, floorY + 6)
            g.lineTo(w * 0.5 + 14, floorY + 18)
            g.lineTo(w * 0.5, floorY + 10)
            g.lineTo(w * 0.5 - 14, floorY + 18)
            g.lineTo(w * 0.5 - 10, floorY + 6)
            g.lineTo(w * 0.5 - 20, floorY - 4)
            g.lineTo(w * 0.5 - 8, floorY - 4)
            g.closePath()
            g.fill({ color: item.accent, alpha: 0.9 })
          }
        } else if (id.startsWith('bowl')) {
          g.ellipse(w * 0.38, floorY + 18, 22, 10)
          g.fill(item.color)
          g.ellipse(w * 0.38, floorY + 14, 16, 7)
          g.fill(item.accent)
        } else if (id === 'ball_pile' || id === 'robot_toy') {
          g.circle(w * 0.62, floorY + 10, 12)
          g.fill(item.color)
          g.circle(w * 0.65, floorY + 4, 10)
          g.fill(item.accent)
          g.circle(w * 0.59, floorY + 2, 9)
          g.fill(0xf4d35e)
          if (id === 'robot_toy') {
            g.roundRect(w * 0.58, floorY - 22, 26, 22, 4)
            g.fill(item.color)
            g.circle(w * 0.64, floorY - 14, 4)
            g.fill(item.accent)
          }
        } else if (id === 'cushion' || id === 'beanbag_xl') {
          g.ellipse(w * 0.28, floorY + 8, id === 'beanbag_xl' ? 48 : 36, id === 'beanbag_xl' ? 26 : 20)
          g.fill(item.color)
          g.ellipse(w * 0.28, floorY + 4, id === 'beanbag_xl' ? 32 : 24, 12)
          g.fill(item.accent)
        } else if (id === 'coral_reef') {
          g.ellipse(w * 0.7, floorY + 12, 40, 16)
          g.fill(item.accent)
          g.ellipse(w * 0.68, floorY - 4, 10, 22)
          g.fill(item.color)
          g.ellipse(w * 0.74, floorY, 8, 18)
          g.fill(0xffc8dd)
        } else if (id === 'dragon_egg') {
          g.ellipse(w * 0.34, floorY + 6, 22, 30)
          g.fill(item.color)
          g.ellipse(w * 0.34, floorY - 4, 10, 8)
          g.fill(item.accent)
        } else if (id === 'rug_wave') {
          g.ellipse(w * 0.5, floorY, Math.min(210, w * 0.34), Math.min(64, h * 0.07))
          g.fill(item.color)
          g.moveTo(w * 0.35, floorY)
          g.quadraticCurveTo(w * 0.42, floorY - 12, w * 0.5, floorY)
          g.quadraticCurveTo(w * 0.58, floorY + 12, w * 0.65, floorY)
          g.stroke({ width: 4, color: item.accent })
        } else if (id === 'fountain' || id === 'sandbox' || id === 'trampoline') {
          g.ellipse(w * 0.72, floorY + 10, id === 'trampoline' ? 48 : 28, id === 'trampoline' ? 18 : 12)
          g.fill(item.color)
          if (id === 'trampoline') {
            g.ellipse(w * 0.72, floorY + 10, 34, 10)
            g.fill(item.accent)
          } else if (id === 'sandbox') {
            g.roundRect(w * 0.62, floorY - 4, 48, 18, 4)
            g.fill(item.accent)
          } else {
            g.rect(w * 0.7, floorY - 30, 10, 40)
            g.fill(0xb0b0b0)
            g.circle(w * 0.705, floorY - 34, 10)
            g.fill(item.accent)
          }
        } else {
          g.ellipse(w * 0.55, floorY + 8, 28, 12)
          g.fill(item.color)
          g.circle(w * 0.55, floorY - 8, 12)
          g.fill(item.accent)
        }
      } else if (item.slot === 'wall') {
        const x = id.includes('moon') || id === 'pirate_flag' ? w * 0.18 : w * 0.08
        const y = h * 0.2
        if (id.startsWith('poster')) {
          g.roundRect(x, y, 54, 68, 6)
          g.fill(0xf2e8d5)
          g.roundRect(x + 6, y + 6, 42, 56, 4)
          g.fill(item.color)
          g.circle(x + 27, y + 30, 12)
          g.fill(item.accent)
        } else if (id === 'plant_hang') {
          g.moveTo(w * 0.55, h * 0.08)
          g.lineTo(w * 0.55, h * 0.18)
          g.stroke({ width: 3, color: 0x8b5e3c })
          g.ellipse(w * 0.55, h * 0.22, 18, 22)
          g.fill(item.color)
        } else if (id === 'shelf_books') {
          g.roundRect(w * 0.12, h * 0.34, 70, 12, 3)
          g.fill(item.color)
          g.rect(w * 0.16, h * 0.28, 10, 20)
          g.fill(item.accent)
          g.rect(w * 0.28, h * 0.26, 12, 22)
          g.fill(0x4cc9f0)
          g.rect(w * 0.42, h * 0.29, 9, 17)
          g.fill(0xf4d35e)
        } else if (id === 'tv_wall') {
          g.roundRect(w * 0.62, h * 0.16, 90, 58, 6)
          g.fill(item.color)
          g.roundRect(w * 0.65, h * 0.19, 78, 44, 4)
          g.fill(item.accent)
        } else if (id === 'clock_cuckoo') {
          g.roundRect(w * 0.78, h * 0.18, 40, 48, 4)
          g.fill(item.color)
          g.circle(w * 0.98 - 40, h * 0.32, 12)
          g.fill(item.accent)
        } else if (id === 'pirate_flag' || id === 'birdhouse' || id === 'disco_ball' || id === 'trophy_shelf' || id === 'shelf_games') {
          if (id === 'disco_ball') {
            g.circle(w * 0.5, h * 0.14, 16)
            g.fill(item.color)
            g.circle(w * 0.48, h * 0.12, 4)
            g.fill(item.accent)
          } else if (id === 'birdhouse') {
            g.roundRect(w * 0.5, h * 0.16, 36, 32, 4)
            g.fill(item.color)
            g.circle(w * 0.58, h * 0.28, 6)
            g.fill(item.accent)
          } else {
            g.roundRect(x, y, 54, 68, 6)
            g.fill(item.color)
            g.roundRect(x + 8, y + 10, 38, 12, 3)
            g.fill(item.accent)
          }
        } else {
          g.roundRect(x, y, 48, 56, 6)
          g.fill(item.color)
          g.circle(x + 24, y + 28, 10)
          g.fill(item.accent)
        }
      } else {
        const x = sideIndex % 2 === 0 ? w * 0.14 : w * 0.86
        const y = floorY - 10
        sideIndex++
        if (id === 'bed_castle' || id === 'bed_race') {
          g.roundRect(x - 42, y - 30, 84, 44, 8)
          g.fill(item.color)
          g.rect(x - 42, y - 55, 12, 28)
          g.fill(item.accent)
          g.rect(x + 30, y - 55, 12, 28)
          g.fill(item.accent)
          g.roundRect(x - 30, y - 38, 48, 16, 6)
          g.fill(0xffffff)
        } else if (id.startsWith('bed')) {
          g.roundRect(x - 40, y - 28, 80, 40, 10)
          g.fill(item.color)
          g.roundRect(x - 34, y - 36, 50, 18, 8)
          g.fill(item.accent)
        } else if (id.startsWith('lamp')) {
          g.rect(x - 3, y - 70, 6, 55)
          g.fill(0x8b5e3c)
          g.circle(x, y - 78, 16)
          g.fill({ color: item.accent, alpha: 0.85 })
          g.ellipse(x, y, 14, 6)
          g.fill(item.color)
        } else if (id === 'toybox') {
          g.roundRect(x - 28, y - 24, 56, 36, 6)
          g.fill(item.color)
          g.rect(x - 28, y - 8, 56, 6)
          g.fill(item.accent)
        } else if (id === 'plant_tall') {
          g.ellipse(x, y - 40, 22, 36)
          g.fill(item.color)
          g.roundRect(x - 14, y - 10, 28, 22, 4)
          g.fill(item.accent)
        } else if (id === 'aquarium') {
          g.roundRect(x - 30, y - 50, 60, 45, 8)
          g.fill({ color: item.color, alpha: 0.55 })
          g.stroke({ width: 3, color: 0xffffff, alpha: 0.5 })
          g.ellipse(x - 8, y - 28, 8, 5)
          g.fill(0xff85a1)
        } else if (id === 'jukebox') {
          g.roundRect(x - 22, y - 70, 44, 70, 8)
          g.fill(item.color)
          g.circle(x, y - 40, 12)
          g.fill(item.accent)
        } else if (id === 'treasure_chest') {
          g.roundRect(x - 28, y - 28, 56, 34, 6)
          g.fill(item.color)
          g.rect(x - 28, y - 14, 56, 6)
          g.fill(item.accent)
          g.circle(x, y - 14, 5)
          g.fill(0xe9b44c)
        } else if (id === 'neon_console') {
          g.roundRect(x - 26, y - 48, 52, 42, 6)
          g.fill(item.color)
          g.roundRect(x - 18, y - 40, 36, 18, 4)
          g.fill(item.accent)
        } else if (id === 'alien_pod') {
          g.ellipse(x, y - 36, 28, 36)
          g.fill({ color: item.color, alpha: 0.85 })
          g.ellipse(x, y - 36, 14, 18)
          g.fill({ color: item.accent, alpha: 0.5 })
        } else if (id === 'mirror_vanity') {
          g.ellipse(x, y - 55, 22, 28)
          g.stroke({ width: 5, color: item.accent })
          g.ellipse(x, y - 55, 16, 22)
          g.fill({ color: item.color, alpha: 0.7 })
          g.roundRect(x - 20, y - 20, 40, 16, 4)
          g.fill(0xb56b45)
        } else if (id === 'bathtub_prop') {
          g.ellipse(x, y - 18, 36, 20)
          g.fill(item.color)
          g.circle(x - 12, y - 30, 8)
          g.fill(item.accent)
          g.circle(x + 8, y - 34, 10)
          g.fill(item.accent)
        } else if (id === 'fridge') {
          g.roundRect(x - 22, y - 70, 44, 70, 6)
          g.fill(item.color)
          g.rect(x + 12, y - 50, 4, 12)
          g.fill(item.accent)
        } else if (id === 'stove') {
          g.roundRect(x - 26, y - 36, 52, 36, 4)
          g.fill(item.color)
          g.circle(x - 10, y - 24, 7)
          g.fill(item.accent)
          g.circle(x + 10, y - 24, 7)
          g.fill(item.accent)
        } else if (id === 'hammock') {
          g.moveTo(x - 36, y - 40)
          g.quadraticCurveTo(x, y - 10, x + 36, y - 40)
          g.stroke({ width: 4, color: item.accent })
          g.ellipse(x, y - 22, 30, 12)
          g.fill(item.color)
        } else if (id === 'candy_machine') {
          g.roundRect(x - 16, y - 20, 32, 20, 4)
          g.fill(0x333333)
          g.circle(x, y - 48, 22)
          g.fill({ color: item.color, alpha: 0.55 })
          g.circle(x - 6, y - 50, 5)
          g.fill(item.accent)
          g.circle(x + 8, y - 44, 5)
          g.fill(0x4cc9f0)
        } else {
          // Generic side prop for expanded catalog SKUs
          g.roundRect(x - 22, y - 48, 44, 48, 8)
          g.fill(item.color)
          g.ellipse(x, y - 54, 16, 10)
          g.fill(item.accent)
          g.roundRect(x - 14, y - 20, 28, 10, 3)
          g.fill({ color: 0xffffff, alpha: 0.35 })
        }
      }
    }

    // Default plant if none placed on left
    if (!placed.includes('plant_tall')) {
      g.ellipse(w * 0.12, h * 0.58, 28, 40)
      g.fill(0x4caf7a)
      g.roundRect(w * 0.1, h * 0.62, 36, 28, 6)
      g.fill(0xb56b45)
    }
  }

  private drawCompanion(w: number, h: number) {
    const g = this.companionGfx
    const hit = this.companionHit
    g.clear()
    hit.clear()
    const id = this.props.companion
    if (id === 'none') {
      hit.eventMode = 'none'
      return
    }
    hit.eventMode = 'static'
    const def = getCompanion(id)
    const x = w * 0.72
    const y = h * 0.7 + Math.sin(this.time * 3) * 4
    g.ellipse(x, y + 28, 22, 8)
    g.fill({ color: 0x1a2a22, alpha: 0.15 })
    g.circle(x, y, 22)
    g.fill(def.fill)
    g.circle(x - 8, y - 4, 3)
    g.fill(0x243029)
    g.circle(x + 8, y - 4, 3)
    g.fill(0x243029)
    g.circle(x, y + 6, 4)
    g.fill(def.accent)
    if (id === 'sprout') {
      g.ellipse(x, y - 26, 8, 12)
      g.fill(0x3d9a68)
    } else if (id === 'blinky') {
      g.circle(x - 10, y - 8, 6)
      g.fill(0xffffff)
      g.circle(x + 10, y - 8, 6)
      g.fill(0xffffff)
      g.circle(x - 10, y - 8, 2.5)
      g.fill(def.accent)
      g.circle(x + 10, y - 8, 2.5)
      g.fill(def.accent)
      g.ellipse(x, y - 28, 6, 14)
      g.fill(def.accent)
    } else if (id === 'pebble') {
      g.ellipse(x, y + 4, 26, 18)
      g.fill(def.fill)
      g.circle(x - 8, y - 2, 3)
      g.fill(0x243029)
      g.circle(x + 8, y - 2, 3)
      g.fill(0x243029)
    } else {
      g.ellipse(x - 16, y - 10, 8, 5)
      g.fill(def.fill)
      g.ellipse(x + 16, y - 10, 8, 5)
      g.fill(def.fill)
    }
    hit.circle(x, y, 28)
    hit.fill({ color: 0xffffff, alpha: 0.001 })
  }

  updateProps(props: Partial<PetSceneProps>) {
    this.props = { ...this.props, ...props }
    if (this.ready) {
      this.layout()
      this.redraw()
    }
  }

  private bounce(): number {
    const { reaction, needs } = this.props
    const mood = deriveMood(needs)
    if (this.sneezeT > 0) return Math.sin(this.sneezeT * 40) * 6
    if (this.stretchT > 0) return -6 + Math.sin(this.stretchT * 4) * 4
    if (reaction === 'laugh') return Math.sin(this.time * 20) * 10
    if (reaction === 'play' || reaction.startsWith('skill_')) {
      return Math.sin(this.time * 16) * 5
    }
    if (reaction === 'eat') return Math.sin(this.time * 12) * 2
    if (mood === 'happy') return Math.sin(this.time * 3.4) * 5
    return Math.sin(this.time * 2.2) * 3
  }

  private redraw() {
    if (!this.ready || this.disposed) return
    const { needs, bodyColor, hat, glasses, scarf, shirt, shoes, reaction, sleeping, talking, petName } =
      this.props
    const color = getBodyColor(bodyColor)
    const mood = deriveMood(needs)
    const scale = this.app.screen.width < 480 ? 0.82 : 1
    this.pet.scale.set(scale)
    this.nameTag.text = petName || 'Your Pet'
    const b = this.bounce()

    this.drawShadow(b)
    this.drawLegs(color.fill, b)
    this.drawShoesLayer(shoes, b)
    this.drawBodyLayer(color.fill, color.belly, color.ear, mood, b)
    this.drawShirtLayer(shirt, b)
    this.drawArms(color.fill, reaction, b)
    this.drawHeadLayer(color.fill, color.ear, b)
    this.drawFaceLayer(mood, reaction, sleeping, talking, b)
    this.drawScarfLayer(scarf, b)
    this.drawGlassesLayer(glasses, b)
    this.drawHatLayer(hat, b)
    this.zzz.visible = sleeping
    this.zzz.alpha = sleeping ? 0.9 : 0

    this.headHit.clear()
    this.headHit.circle(0, -78, 58)
    this.headHit.fill({ color: 0xffffff, alpha: 0.001 })
    this.bellyHit.clear()
    this.bellyHit.ellipse(0, 30, 70, 78)
    this.bellyHit.fill({ color: 0xffffff, alpha: 0.001 })
  }

  private drawShadow(b: number) {
    const g = this.shadow
    g.clear()
    g.ellipse(0, 118 - b * 0.2, 78, 18)
    g.fill({ color: 0x1a2a22, alpha: 0.18 })
  }

  private drawLegs(fill: number, b: number) {
    const g = this.legs
    g.clear()
    g.roundRect(-48, 70 + b * 0.2, 28, 42, 12)
    g.fill(fill)
    g.roundRect(20, 70 + b * 0.2, 28, 42, 12)
    g.fill(fill)
    // Soft paw pads when barefoot
    if (this.props.shoes === 'none') {
      g.ellipse(-34, 108 + b * 0.2, 10, 6)
      g.fill({ color: 0xffb4a2, alpha: 0.75 })
      g.ellipse(34, 108 + b * 0.2, 10, 6)
      g.fill({ color: 0xffb4a2, alpha: 0.75 })
      for (const sx of [-40, -34, -28, 28, 34, 40]) {
        g.circle(sx, 100 + b * 0.2, 2.4)
        g.fill({ color: 0xffb4a2, alpha: 0.7 })
      }
    }
  }

  private drawShoesLayer(shoes: ShoesId, b: number) {
    const g = this.shoesGfx
    g.clear()
    if (shoes === 'none') return
    const c = getShoes(shoes).color
    const y = 102 + b * 0.2
    if (shoes === 'sneakers' || shoes === 'boots') {
      g.roundRect(-52, y, 34, shoes === 'boots' ? 22 : 16, 8)
      g.fill(c)
      g.roundRect(18, y, 34, shoes === 'boots' ? 22 : 16, 8)
      g.fill(c)
      if (shoes === 'sneakers') {
        g.rect(-52, y + 10, 34, 4)
        g.fill(0x4cc9f0)
        g.rect(18, y + 10, 34, 4)
        g.fill(0x4cc9f0)
      }
    } else if (shoes === 'sandals') {
      g.ellipse(-35, y + 10, 16, 7)
      g.fill(c)
      g.ellipse(35, y + 10, 16, 7)
      g.fill(c)
      g.moveTo(-45, y + 2)
      g.lineTo(-25, y + 8)
      g.moveTo(25, y + 2)
      g.lineTo(45, y + 8)
      g.stroke({ width: 3, color: 0x8b5e3c })
    } else if (shoes === 'rocket') {
      g.roundRect(-52, y - 4, 34, 20, 6)
      g.fill(c)
      g.roundRect(18, y - 4, 34, 20, 6)
      g.fill(c)
      g.moveTo(-35, y + 16)
      g.lineTo(-42, y + 28)
      g.lineTo(-28, y + 28)
      g.closePath()
      g.fill(0xffbe0b)
      g.moveTo(35, y + 16)
      g.lineTo(28, y + 28)
      g.lineTo(42, y + 28)
      g.closePath()
      g.fill(0xffbe0b)
    } else if (shoes === 'roller' || shoes === 'iceSkates' || shoes === 'cleats') {
      g.roundRect(-52, y, 34, 14, 6)
      g.fill(c)
      g.roundRect(18, y, 34, 14, 6)
      g.fill(c)
      g.circle(-42, y + 16, 5)
      g.fill(0x333333)
      g.circle(-28, y + 16, 5)
      g.fill(0x333333)
      g.circle(28, y + 16, 5)
      g.fill(0x333333)
      g.circle(42, y + 16, 5)
      g.fill(0x333333)
    } else if (shoes === 'flippers') {
      g.ellipse(-35, y + 12, 22, 10)
      g.fill(c)
      g.ellipse(35, y + 12, 22, 10)
      g.fill(c)
    } else if (shoes === 'heels') {
      g.roundRect(-48, y, 28, 12, 4)
      g.fill(c)
      g.roundRect(20, y, 28, 12, 4)
      g.fill(c)
      g.rect(-38, y + 12, 4, 10)
      g.fill(c)
      g.rect(34, y + 12, 4, 10)
      g.fill(c)
    } else {
      // slippers / hiking / socks / cloud
      g.roundRect(-52, y, 34, 16, 10)
      g.fill(c)
      g.roundRect(18, y, 34, 16, 10)
      g.fill(c)
      g.ellipse(-35, y + 4, 10, 5)
      g.fill({ color: 0xffffff, alpha: 0.35 })
      g.ellipse(35, y + 4, 10, 5)
      g.fill({ color: 0xffffff, alpha: 0.35 })
    }
  }

  private drawBodyLayer(fill: number, belly: number, ear: number, mood: string, b: number) {
    const g = this.body
    g.clear()
    // Soft outer rim for rounded cartoon volume
    g.ellipse(0, 30 + b, 82, 96)
    g.fill({ color: ear, alpha: 0.35 })
    g.ellipse(0, 28 + b, 78, 92)
    g.fill(fill)
    // Depth shade + highlight
    g.ellipse(18, 40 + b, 40, 70)
    g.fill({ color: 0x000000, alpha: 0.07 })
    g.ellipse(-22, 8 + b, 22, 28)
    g.fill({ color: 0xffffff, alpha: 0.1 })
    // Cream belly patch
    g.ellipse(0, 42 + b, 48, 58)
    g.fill(belly)
    // Fur stripes (talking-pet silhouette cue)
    g.ellipse(-40, 20 + b, 8, 22)
    g.fill({ color: ear, alpha: 0.28 })
    g.ellipse(-36, 55 + b, 7, 18)
    g.fill({ color: ear, alpha: 0.22 })
    g.ellipse(40, 24 + b, 8, 20)
    g.fill({ color: ear, alpha: 0.24 })

    // Tail with tip accent — happier pets wag harder
    const wagSpeed = mood === 'happy' ? 9 : mood === 'sad' || mood === 'tired' ? 1.4 : 2.5
    const wagAmp = mood === 'happy' ? 16 : mood === 'sad' ? 4 : 10
    const wag = Math.sin(this.time * wagSpeed) * wagAmp
    g.moveTo(70, 50 + b)
    g.quadraticCurveTo(110 + wag, 10 + b, 98 + wag * 0.4, -20 + b)
    g.stroke({ width: 16, color: fill, cap: 'round' })
    g.circle(98 + wag * 0.4, -20 + b, 9)
    g.fill(ear)

    if (mood === 'dirty' || this.props.needs.cleanliness < 40) {
      g.circle(-20, 50 + b, 6)
      g.fill({ color: 0x6b4f3a, alpha: 0.35 })
      g.circle(24, 66 + b, 5)
      g.fill({ color: 0x6b4f3a, alpha: 0.3 })
    }
  }

  private drawShirtLayer(shirt: ShirtId, b: number) {
    const g = this.shirtGfx
    g.clear()
    if (shirt === 'none') return
    const c = getShirt(shirt).color
    if (shirt === 'tee' || shirt === 'hoodie') {
      g.ellipse(0, 36 + b, 52, 48)
      g.fill(c)
      if (shirt === 'hoodie') {
        g.ellipse(0, -10 + b, 40, 18)
        g.fill(c)
      }
    } else if (shirt === 'vest') {
      g.moveTo(-40, 10 + b)
      g.lineTo(-48, 70 + b)
      g.lineTo(-8, 70 + b)
      g.lineTo(-4, 20 + b)
      g.closePath()
      g.fill(c)
      g.moveTo(40, 10 + b)
      g.lineTo(48, 70 + b)
      g.lineTo(8, 70 + b)
      g.lineTo(4, 20 + b)
      g.closePath()
      g.fill(c)
    } else if (shirt === 'overalls') {
      g.ellipse(0, 50 + b, 48, 50)
      g.fill(c)
      g.rect(-18, -5 + b, 10, 40)
      g.fill(c)
      g.rect(8, -5 + b, 10, 40)
      g.fill(c)
    } else if (shirt === 'tuxedo') {
      g.ellipse(0, 36 + b, 52, 48)
      g.fill(c)
      g.moveTo(0, 8 + b)
      g.lineTo(-20, 70 + b)
      g.lineTo(20, 70 + b)
      g.closePath()
      g.fill(0xffffff)
      g.circle(0, 18 + b, 5)
      g.fill(0xe63946)
    } else if (shirt === 'raincoat' || shirt === 'sweater' || shirt === 'astronaut') {
      g.ellipse(0, 36 + b, 54, 50)
      g.fill(c)
      if (shirt === 'raincoat') {
        g.ellipse(0, 8 + b, 56, 16)
        g.fill(c)
      }
      if (shirt === 'astronaut') {
        g.circle(0, 30 + b, 12)
        g.fill(0x4cc9f0)
      }
    } else if (shirt === 'jersey') {
      g.ellipse(0, 36 + b, 52, 48)
      g.fill(c)
      g.rect(-8, 16 + b, 16, 36)
      g.fill(0xffffff)
    } else if (shirt === 'kimono' || shirt === 'dress' || shirt === 'onesie') {
      g.ellipse(0, 40 + b, 56, 52)
      g.fill(c)
      g.moveTo(0, 8 + b)
      g.lineTo(-24, 80 + b)
      g.moveTo(0, 8 + b)
      g.lineTo(24, 80 + b)
      g.stroke({ width: 4, color: 0xffffff })
      g.ellipse(0, 24 + b, 40, 10)
      g.fill(0xf4d35e)
    } else if (shirt === 'armor' || shirt === 'blazer' || shirt === 'labcoat' || shirt === 'pirateCoat') {
      g.ellipse(0, 36 + b, 54, 50)
      g.fill(c)
      g.moveTo(0, 8 + b)
      g.lineTo(-18, 70 + b)
      g.lineTo(18, 70 + b)
      g.closePath()
      g.fill({ color: 0xffffff, alpha: shirt === 'labcoat' ? 0.7 : 0.25 })
    } else if (shirt === 'superhero') {
      g.ellipse(0, 36 + b, 52, 48)
      g.fill(c)
      g.moveTo(-30, -20 + b)
      g.lineTo(-60, 60 + b)
      g.lineTo(60, 60 + b)
      g.lineTo(30, -20 + b)
      g.closePath()
      g.fill(0x1d3557)
    } else {
      // polo / hawaiian / pajama / tank / apron / etc.
      g.ellipse(0, 36 + b, 52, 48)
      g.fill(c)
      g.ellipse(0, 20 + b, 20, 10)
      g.fill({ color: 0xffffff, alpha: 0.35 })
    }
  }

  private drawArms(fill: number, reaction: Reaction, b: number) {
    const g = this.arms
    g.clear()
    if (this.stretchT > 0) {
      const lift = 28 + Math.sin(this.stretchT * 5) * 6
      g.ellipse(-70, -10 + b - lift * 0.3, 20, 40)
      g.fill(fill)
      g.ellipse(70, -10 + b - lift * 0.3, 20, 40)
      g.fill(fill)
      g.circle(-70, -48 + b - lift * 0.2, 12)
      g.fill(fill)
      g.circle(70, -48 + b - lift * 0.2, 12)
      g.fill(fill)
      return
    }
    const swing =
      reaction === 'play' || reaction === 'skill_boxing'
        ? Math.sin(this.time * 14) * 14
        : reaction === 'skill_drums'
          ? Math.sin(this.time * 18) * 10
          : Math.sin(this.time * 2) * 4
    g.ellipse(-78, 20 + b + swing * 0.15, 22, 36)
    g.fill(fill)
    g.ellipse(78, 20 + b - swing * 0.15, 22, 36)
    g.fill(fill)
    // Palm pads for softer cartoon paws
    g.ellipse(-78, 48 + b + swing * 0.1, 10, 8)
    g.fill({ color: 0xffb4a2, alpha: 0.72 })
    g.ellipse(78, 48 + b - swing * 0.1, 10, 8)
    g.fill({ color: 0xffb4a2, alpha: 0.72 })
    for (const sx of [-86, -78, -70]) {
      g.circle(sx, 38 + b + swing * 0.08, 2.2)
      g.fill({ color: 0xffb4a2, alpha: 0.65 })
    }
    for (const sx of [70, 78, 86]) {
      g.circle(sx, 38 + b - swing * 0.08, 2.2)
      g.fill({ color: 0xffb4a2, alpha: 0.65 })
    }
    if (reaction === 'skill_hoop') {
      g.circle(0, -20 + b + Math.sin(this.time * 10) * 20, 28)
      g.stroke({ width: 5, color: 0xf4d35e })
    }
    if (reaction === 'skill_boxing') {
      g.circle(-90, 10 + b + swing, 14)
      g.fill(0xe63946)
      g.circle(90, 10 + b - swing, 14)
      g.fill(0xe63946)
      g.circle(-90, 10 + b + swing, 7)
      g.fill({ color: 0xffffff, alpha: 0.35 })
      g.circle(90, 10 + b - swing, 7)
      g.fill({ color: 0xffffff, alpha: 0.35 })
    }
  }

  private drawHeadLayer(fill: number, ear: number, b: number) {
    const g = this.head
    g.clear()
    const headY = -78 + b
    const flop = this.earFlopT > 0 ? Math.sin(this.earFlopT * 14) * 14 : 0
    const earWiggle = Math.sin(this.time * 2.6) * 4 + flop
    const talkBob = this.props.talking ? Math.sin(this.time * 14) * 2 : 0
    // Cheek fluff for rounder talking-pet silhouette
    g.ellipse(-52, headY + 18 + talkBob, 18, 16)
    g.fill(fill)
    g.ellipse(52, headY + 18 + talkBob, 18, 16)
    g.fill(fill)
    g.circle(0, headY + talkBob, 64)
    g.fill(fill)
    // Soft “3D” volume bands (rim light + cheek planes)
    g.circle(16, headY + 6 + talkBob, 40)
    g.fill({ color: 0x000000, alpha: 0.06 })
    g.ellipse(-22, headY - 12 + talkBob, 18, 14)
    g.fill({ color: 0xffffff, alpha: 0.1 })
    g.ellipse(28, headY + 20 + talkBob, 14, 18)
    g.fill({ color: 0x000000, alpha: 0.04 })
    g.ellipse(-40, headY + 8 + talkBob, 10, 14)
    g.fill({ color: 0xffffff, alpha: 0.07 })
    // Muzzle plate with slight depth
    g.ellipse(0, headY + 22 + talkBob, 28, 20)
    g.fill({ color: 0xffe8c8, alpha: 0.55 })
    g.ellipse(0, headY + 26 + talkBob, 20, 10)
    g.fill({ color: 0x000000, alpha: 0.04 })

    g.moveTo(-48, headY - 42 + talkBob)
    g.lineTo(-68 - earWiggle, headY - 98 + talkBob)
    g.lineTo(-18, headY - 58 + talkBob)
    g.closePath()
    g.fill(fill)
    g.moveTo(-48, headY - 48 + talkBob)
    g.lineTo(-58 - earWiggle * 0.6, headY - 84 + talkBob)
    g.lineTo(-30, headY - 58 + talkBob)
    g.closePath()
    g.fill(ear)

    g.moveTo(48, headY - 42 + talkBob)
    g.lineTo(68 + earWiggle, headY - 98 + talkBob)
    g.lineTo(18, headY - 58 + talkBob)
    g.closePath()
    g.fill(fill)
    g.moveTo(48, headY - 48 + talkBob)
    g.lineTo(58 + earWiggle * 0.6, headY - 84 + talkBob)
    g.lineTo(30, headY - 58 + talkBob)
    g.closePath()
    g.fill(ear)

    // Ear tufts
    g.moveTo(-58, headY - 88 + talkBob)
    g.lineTo(-62 - earWiggle, headY - 104 + talkBob)
    g.lineTo(-50, headY - 90 + talkBob)
    g.stroke({ width: 3, color: fill, cap: 'round' })
    g.moveTo(58, headY - 88 + talkBob)
    g.lineTo(62 + earWiggle, headY - 104 + talkBob)
    g.lineTo(50, headY - 90 + talkBob)
    g.stroke({ width: 3, color: fill, cap: 'round' })
  }

  private drawFaceLayer(
    mood: string,
    reaction: Reaction,
    sleeping: boolean,
    talking: boolean,
    b: number,
  ) {
    const g = this.face
    g.clear()
    const headY = -78 + b
    // Double-blink every ~3.4s for livelier puppet feel
    const blink =
      (this.blinkT > 0 && this.blinkT < 0.1) || (this.blinkT > 0.18 && this.blinkT < 0.28)

    if (sleeping || reaction === 'sleep' || blink) {
      g.moveTo(-24, headY - 4)
      g.quadraticCurveTo(-18, headY + 2, -12, headY - 4)
      g.stroke({ width: 4, color: 0x243029, cap: 'round' })
      g.moveTo(12, headY - 4)
      g.quadraticCurveTo(18, headY + 2, 24, headY - 4)
      g.stroke({ width: 4, color: 0x243029, cap: 'round' })
    } else if (reaction === 'laugh') {
      g.moveTo(-26, headY - 2)
      g.quadraticCurveTo(-18, headY + 8, -10, headY - 2)
      g.stroke({ width: 4, color: 0x243029, cap: 'round' })
      g.moveTo(10, headY - 2)
      g.quadraticCurveTo(18, headY + 8, 26, headY - 2)
      g.stroke({ width: 4, color: 0x243029, cap: 'round' })
    } else {
      const eyeOpen = mood === 'tired' ? 6 : 12
      const lookX = Math.sin(this.time * 0.7) * 1.2 + this.lookTarget.x
      const lookY = Math.cos(this.time * 0.5) * 0.8 + this.lookTarget.y
      // Bigger cartoon eyes with iris rings + pointer-aware gaze
      g.ellipse(-20, headY - 2, 11, eyeOpen)
      g.fill(0xffffff)
      g.ellipse(20, headY - 2, 11, eyeOpen)
      g.fill(0xffffff)
      g.ellipse(-20 + lookX, headY - 1 + lookY, 7, eyeOpen * 0.75)
      g.fill(0x2a6f97)
      g.ellipse(20 + lookX, headY - 1 + lookY, 7, eyeOpen * 0.75)
      g.fill(0x2a6f97)
      g.ellipse(-20 + lookX, headY - 1 + lookY, 4, eyeOpen * 0.55)
      g.fill(0x243029)
      g.ellipse(20 + lookX, headY - 1 + lookY, 4, eyeOpen * 0.55)
      g.fill(0x243029)
      g.circle(-17 + lookX, headY - 5 + lookY, 2.8)
      g.fill(0xffffff)
      g.circle(23 + lookX, headY - 5 + lookY, 2.8)
      g.fill(0xffffff)
    }

    if (reaction === 'annoyed') {
      g.moveTo(-30, headY - 18)
      g.lineTo(-10, headY - 12)
      g.stroke({ width: 3, color: 0x243029, cap: 'round' })
      g.moveTo(30, headY - 18)
      g.lineTo(10, headY - 12)
      g.stroke({ width: 3, color: 0x243029, cap: 'round' })
    }

    // Soft muzzle plate + nose specular for denser talking-pet face
    g.ellipse(0, headY + 20, 24, 15)
    g.fill({ color: 0xffe8c8, alpha: 0.62 })
    g.ellipse(0, headY + 14, 9, 7)
    g.fill(0xe76f51)
    g.ellipse(-2, headY + 12, 2.4, 1.6)
    g.fill({ color: 0xffffff, alpha: 0.55 })
    g.circle(-3.5, headY + 18, 1.5)
    g.fill(0x243029)
    g.circle(3.5, headY + 18, 1.5)
    g.fill(0x243029)
    // Subtle brow ridge for more dimensional head
    g.ellipse(-20, headY - 14, 12, 3)
    g.fill({ color: 0x000000, alpha: 0.05 })
    g.ellipse(20, headY - 14, 12, 3)
    g.fill({ color: 0x000000, alpha: 0.05 })

    const mouthY = headY + 28
    const yawning = this.yawnT > 0 && !sleeping && reaction === 'idle' && !talking
    const sneezing = this.sneezeT > 0 && !sleeping
    const stretching = this.stretchT > 0 && !sleeping && reaction === 'idle'
    if (sneezing) {
      g.ellipse(0, mouthY + 2, 16, 10)
      g.fill(0x3a1f1a)
      g.circle(-28, headY + 8, 3 + Math.abs(Math.sin(this.time * 30)) * 2)
      g.fill({ color: 0xffffff, alpha: 0.55 })
      g.circle(30, headY + 4, 2.5)
      g.fill({ color: 0xffffff, alpha: 0.45 })
    } else if (yawning) {
      const open = 10 + Math.sin(this.yawnT * 8) * 4
      g.ellipse(0, mouthY + 4, 14, open)
      g.fill(0x3a1f1a)
      g.ellipse(0, mouthY + 2, 10, 4)
      g.fill({ color: 0xff8fab, alpha: 0.45 })
    } else if (stretching) {
      g.moveTo(-14, mouthY + 2)
      g.quadraticCurveTo(0, mouthY + 12, 14, mouthY + 2)
      g.stroke({ width: 3.5, color: 0x243029, cap: 'round' })
    } else if (talking || reaction === 'talk') {
      const open = 6 + Math.abs(Math.sin(this.time * 16)) * 10
      g.ellipse(0, mouthY + 4, 12, open)
      g.fill(0x3a1f1a)
    } else if (reaction === 'eat') {
      const chomp = Math.abs(Math.sin(this.time * 14)) * 8
      g.ellipse(0, mouthY + 2, 10, 4 + chomp)
      g.fill(0x3a1f1a)
    } else if (reaction === 'laugh' || reaction === 'play' || mood === 'happy') {
      g.moveTo(-16, mouthY)
      g.quadraticCurveTo(0, mouthY + 16, 16, mouthY)
      g.stroke({ width: 4, color: 0x243029, cap: 'round' })
    } else if (mood === 'sad' || mood === 'hungry' || reaction === 'annoyed') {
      g.moveTo(-14, mouthY + 8)
      g.quadraticCurveTo(0, mouthY - 2, 14, mouthY + 8)
      g.stroke({ width: 4, color: 0x243029, cap: 'round' })
    } else {
      g.moveTo(-12, mouthY + 2)
      g.quadraticCurveTo(0, mouthY + 8, 12, mouthY + 2)
      g.stroke({ width: 3.5, color: 0x243029, cap: 'round' })
    }

    const whiskerWiggle = talking || reaction === 'talk' ? Math.sin(this.time * 18) * 3 : Math.sin(this.time * 2) * 1
    g.moveTo(-18, headY + 20)
    g.lineTo(-58, headY + 12 + whiskerWiggle)
    g.moveTo(-18, headY + 26)
    g.lineTo(-58, headY + 28 - whiskerWiggle * 0.5)
    g.moveTo(-16, headY + 23)
    g.lineTo(-54, headY + 22)
    g.moveTo(18, headY + 20)
    g.lineTo(58, headY + 12 - whiskerWiggle)
    g.moveTo(18, headY + 26)
    g.lineTo(58, headY + 28 + whiskerWiggle * 0.5)
    g.moveTo(16, headY + 23)
    g.lineTo(54, headY + 22)
    g.stroke({ width: 2, color: 0x243029, alpha: 0.5, cap: 'round' })

    if (mood === 'happy' || reaction === 'laugh') {
      g.ellipse(-34, headY + 18, 8, 5)
      g.fill({ color: 0xff8fab, alpha: 0.35 })
      g.ellipse(34, headY + 18, 8, 5)
      g.fill({ color: 0xff8fab, alpha: 0.35 })
    }

    if (reaction === 'bath') {
      const b1 = 10 + Math.sin(this.time * 8) * 4
      g.circle(-50, 10 + b - b1, 10)
      g.fill({ color: 0xffffff, alpha: 0.55 })
      g.circle(55, -10 + b - b1 * 0.6, 8)
      g.fill({ color: 0xffffff, alpha: 0.5 })
    }

    if (reaction === 'brush') {
      // Toothbrush sweeps left↔right along the mouth (MTT2 brush path)
      const sweep = Math.sin(this.time * 12) * 18
      const brushX = sweep
      const brushY = mouthY - 6 + Math.sin(this.time * 24) * 2
      g.roundRect(brushX - 6, brushY - 4, 34, 9, 4)
      g.fill(0xffffff)
      g.roundRect(brushX + 24, brushY - 8, 8, 16, 3)
      g.fill(0x4cc9f0)
      g.roundRect(brushX - 10, brushY - 2, 8, 6, 2)
      g.fill(0xff85a1)
      // Foam trail along the brush path
      g.circle(brushX - 4, brushY + 2, 3 + Math.abs(Math.sin(this.time * 16)))
      g.fill({ color: 0xffffff, alpha: 0.7 })
      g.circle(brushX + 10, brushY - 2, 2.5)
      g.fill({ color: 0xffffff, alpha: 0.55 })
      g.circle(brushX + 18, brushY + 3, 2)
      g.fill({ color: 0xcaf0f8, alpha: 0.65 })
      g.moveTo(-14, mouthY - 2)
      g.lineTo(14, mouthY - 2)
      g.stroke({ width: 3, color: 0xffffff, alpha: 0.9 })
      // Sparkle teeth shine
      const spark = 0.4 + Math.abs(Math.sin(this.time * 10)) * 0.5
      g.circle(-8, mouthY - 8, 2)
      g.fill({ color: 0xffffff, alpha: spark })
      g.circle(8, mouthY - 6, 1.5)
      g.fill({ color: 0xffffff, alpha: spark * 0.8 })
    }

    if (reaction === 'potty') {
      // Animated toilet bowl under the pet
      const flush = Math.abs(Math.sin(this.time * 6)) * 4
      g.roundRect(-30, 88 + b, 60, 36, 10)
      g.fill(0xffffff)
      g.ellipse(0, 108 + b + flush * 0.2, 22, 10)
      g.fill(0x90e0ef)
      g.ellipse(0, 108 + b + flush * 0.2, 14, 5)
      g.fill({ color: 0x4cc9f0, alpha: 0.55 + flush * 0.05 })
      g.roundRect(18, 78 + b, 16, 22, 5)
      g.fill(0xf8f9fa)
      g.circle(26, 84 + b, 3.5)
      g.fill(0x4cc9f0)
      g.circle(-10 + flush, 100 + b, 2)
      g.fill({ color: 0xffffff, alpha: 0.5 })
      g.circle(8 - flush, 104 + b, 1.5)
      g.fill({ color: 0xffffff, alpha: 0.4 })
    }

    if (reaction === 'skill_drums') {
      g.roundRect(-30, 70 + b, 60, 28, 6)
      g.fill(0xb56b45)
      g.circle(-40, 50 + b + Math.sin(this.time * 18) * 8, 8)
      g.fill(0x333333)
      g.circle(40, 50 + b + Math.sin(this.time * 18 + 1) * 8, 8)
      g.fill(0x333333)
    }
  }

  private drawScarfLayer(scarf: ScarfId, b: number) {
    const g = this.scarfGfx
    g.clear()
    if (scarf === 'none') return
    const c = getScarf(scarf).color
    if (scarf === 'cape') {
      g.moveTo(-30, -20 + b)
      g.lineTo(-70, 70 + b)
      g.lineTo(70, 70 + b)
      g.lineTo(30, -20 + b)
      g.closePath()
      g.fill(c)
      g.ellipse(0, -28 + b, 40, 10)
      g.fill(0xf4d35e)
      return
    }
    g.ellipse(0, -28 + b, 48, 14)
    g.fill(c)
    g.roundRect(-8, -20 + b, 14, 40, 4)
    g.fill(c)
    if (scarf === 'striped' || scarf === 'rainbow') {
      g.rect(-8, -10 + b, 14, 6)
      g.fill(0xffffff)
      g.rect(-8, 6 + b, 14, 6)
      g.fill(scarf === 'rainbow' ? 0x4cc9f0 : 0xffffff)
    }
    if (scarf === 'spots') {
      g.circle(-20, -28 + b, 4)
      g.fill(0xe63946)
      g.circle(18, -24 + b, 3)
      g.fill(0xe63946)
    }
  }

  private drawGlassesLayer(glasses: GlassesId, b: number) {
    const g = this.glassesGfx
    g.clear()
    if (glasses === 'none') return
    const c = getGlasses(glasses).color
    const y = -80 + b
    if (glasses === 'sun' || glasses === 'aviator') {
      g.ellipse(-20, y, 14, glasses === 'aviator' ? 8 : 10)
      g.fill({ color: c, alpha: 0.85 })
      g.ellipse(20, y, 14, glasses === 'aviator' ? 8 : 10)
      g.fill({ color: c, alpha: 0.85 })
    } else if (glasses === 'heart') {
      g.circle(-24, y, 8)
      g.fill(c)
      g.circle(-14, y, 8)
      g.fill(c)
      g.circle(14, y, 8)
      g.fill(c)
      g.circle(24, y, 8)
      g.fill(c)
    } else if (glasses === 'monocle') {
      g.circle(20, y, 12)
      g.stroke({ width: 3, color: c })
      g.moveTo(32, y)
      g.lineTo(40, y + 20)
      g.stroke({ width: 2, color: c })
    } else if (glasses === 'cat') {
      g.moveTo(-34, y - 4)
      g.lineTo(-8, y)
      g.lineTo(-34, y + 8)
      g.stroke({ width: 3, color: c })
      g.moveTo(34, y - 4)
      g.lineTo(8, y)
      g.lineTo(34, y + 8)
      g.stroke({ width: 3, color: c })
      g.circle(-20, y, 10)
      g.stroke({ width: 3, color: c })
      g.circle(20, y, 10)
      g.stroke({ width: 3, color: c })
    } else if (glasses === 'swim') {
      g.ellipse(-20, y, 14, 11)
      g.stroke({ width: 4, color: c })
      g.ellipse(20, y, 14, 11)
      g.stroke({ width: 4, color: c })
      g.ellipse(0, y - 14, 18, 6)
      g.stroke({ width: 3, color: c })
    } else {
      g.circle(-20, y, 12)
      g.stroke({ width: 3, color: c })
      g.circle(20, y, 12)
      g.stroke({ width: 3, color: c })
    }
    if (glasses !== 'monocle') {
      g.moveTo(-8, y)
      g.lineTo(8, y)
      g.stroke({ width: 2, color: c })
    }
  }

  private drawHatLayer(hat: HatId, b: number) {
    const g = this.hatGfx
    g.clear()
    if (hat === 'none') return
    const y = -132 + b
    const def = getHat(hat)
    const col = def.color
    const style = def.style ?? (hat as string)

    if (style === 'cap' || hat === 'sailor' || hat === 'cap') {
      g.ellipse(0, y + 18, 48, 14)
      g.fill(col)
      g.roundRect(-40, y - 8, 70, 28, 10)
      g.fill(hat === 'sailor' ? 0xffffff : 0x3d8ebd)
      if (hat === 'sailor') {
        g.rect(-10, y - 4, 20, 8)
        g.fill(col)
      }
    } else if (style === 'bow' || hat === 'bow') {
      g.ellipse(-18, y + 8, 16, 12)
      g.fill(col)
      g.ellipse(18, y + 8, 16, 12)
      g.fill(col)
      g.circle(0, y + 8, 8)
      g.fill(0xb5172a)
    } else if (style === 'crown' || hat === 'crown') {
      g.moveTo(-32, y + 18)
      g.lineTo(-24, y - 8)
      g.lineTo(-12, y + 10)
      g.lineTo(0, y - 16)
      g.lineTo(12, y + 10)
      g.lineTo(24, y - 8)
      g.lineTo(32, y + 18)
      g.closePath()
      g.fill(col)
    } else if (style === 'beanie' || hat === 'beanie') {
      g.ellipse(0, y + 20, 46, 16)
      g.fill(0x7b2cbf)
      g.roundRect(-42, y - 4, 84, 30, 16)
      g.fill(col)
      g.circle(0, y - 10, 8)
      g.fill(0xf15bb5)
    } else if (style === 'flower' || hat === 'flower') {
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2
        g.circle(Math.cos(a) * 12 - 36, y + 30 + Math.sin(a) * 12, 8)
        g.fill(col)
      }
      g.circle(-36, y + 30, 6)
      g.fill(0xffe066)
    } else if (style === 'topHat' || hat === 'topHat') {
      g.ellipse(0, y + 22, 40, 10)
      g.fill(col)
      g.roundRect(-22, y - 30, 44, 50, 4)
      g.fill(col)
      g.rect(-22, y + 4, 44, 8)
      g.fill(0xe63946)
    } else if (style === 'party' || hat === 'party') {
      g.moveTo(0, y - 30)
      g.lineTo(-28, y + 18)
      g.lineTo(28, y + 18)
      g.closePath()
      g.fill(col)
      g.circle(0, y - 30, 6)
      g.fill(0xf4d35e)
    } else if (style === 'halo' || hat === 'halo') {
      g.ellipse(0, y - 10, 36, 10)
      g.stroke({ width: 4, color: col })
    } else if (style === 'bandana' || hat === 'bandana') {
      g.ellipse(0, y + 28, 50, 12)
      g.fill(col)
      g.moveTo(30, y + 28)
      g.lineTo(48, y + 50)
      g.lineTo(22, y + 36)
      g.closePath()
      g.fill(col)
    } else if (style === 'wizard' || hat === 'wizard') {
      g.moveTo(0, y - 50)
      g.lineTo(-30, y + 20)
      g.lineTo(30, y + 20)
      g.closePath()
      g.fill(col)
      g.circle(0, y - 20, 5)
      g.fill(0xf4d35e)
      g.circle(-8, y - 28, 3)
      g.fill(0xf4d35e)
      g.circle(8, y - 28, 3)
      g.fill(0xf4d35e)
    } else if (style === 'pirate' || hat === 'pirate') {
      g.ellipse(0, y + 22, 48, 12)
      g.fill(col)
      g.roundRect(-36, y - 6, 72, 28, 10)
      g.fill(col)
      g.moveTo(-8, y + 4)
      g.lineTo(0, y + 18)
      g.lineTo(8, y + 4)
      g.closePath()
      g.fill(0xe63946)
    } else if (style === 'diver' || hat === 'diver') {
      g.circle(0, y + 10, 40)
      g.stroke({ width: 8, color: col })
      g.circle(0, y + 10, 28)
      g.fill({ color: 0x90e0ef, alpha: 0.35 })
    } else if (style === 'visor' || hat === 'visor') {
      g.roundRect(-40, y + 8, 80, 18, 8)
      g.fill({ color: col, alpha: 0.85 })
      g.rect(-40, y + 14, 80, 4)
      g.fill(0xffffff)
    } else if (style === 'dragon' || hat === 'dragon') {
      g.moveTo(-36, y + 20)
      g.lineTo(-20, y - 10)
      g.lineTo(0, y + 8)
      g.lineTo(20, y - 10)
      g.lineTo(36, y + 20)
      g.closePath()
      g.fill(col)
      g.circle(0, y + 4, 5)
      g.fill(0xf4d35e)
    } else if (style === 'antenna' || hat === 'antenna') {
      g.moveTo(-14, y + 18)
      g.lineTo(-14, y - 18)
      g.moveTo(14, y + 18)
      g.lineTo(14, y - 18)
      g.stroke({ width: 3, color: col })
      g.circle(-14, y - 22, 6)
      g.fill(0xff85a1)
      g.circle(14, y - 22, 6)
      g.fill(0x80ffdb)
    } else if (style === 'chef' || hat === 'chef') {
      g.ellipse(0, y + 8, 36, 16)
      g.fill(col)
      g.ellipse(0, y - 10, 28, 22)
      g.fill(col)
      g.ellipse(0, y + 18, 40, 10)
      g.fill(0xf0f0f0)
    } else if (style === 'cowboy' || hat === 'cowboy') {
      g.ellipse(0, y + 22, 52, 12)
      g.fill(col)
      g.roundRect(-28, y - 4, 56, 24, 8)
      g.fill(col)
      g.rect(-28, y + 8, 56, 6)
      g.fill(0x6b4428)
    } else if (style === 'headphones' || hat === 'headphones') {
      g.ellipse(0, y + 10, 48, 18)
      g.stroke({ width: 5, color: col })
      g.circle(-42, y + 18, 14)
      g.fill(col)
      g.circle(42, y + 18, 14)
      g.fill(col)
      g.circle(-42, y + 18, 7)
      g.fill(0xff85a1)
      g.circle(42, y + 18, 7)
      g.fill(0xff85a1)
    } else if (style === 'propeller' || hat === 'propeller') {
      g.roundRect(-18, y, 36, 22, 8)
      g.fill(col)
      g.rect(-40, y + 6, 80, 4)
      g.fill(0xf4d35e)
      g.circle(0, y + 8, 5)
      g.fill(0xe63946)
    } else if (style === 'knight' || hat === 'knight') {
      g.roundRect(-34, y - 8, 68, 48, 10)
      g.fill(col)
      g.rect(-18, y + 8, 36, 14)
      g.fill(0x1a1a1a)
      g.rect(-4, y - 8, 8, 48)
      g.fill(0xf4d35e)
    } else if (style === 'santa' || hat === 'santa') {
      g.moveTo(0, y - 28)
      g.lineTo(-34, y + 20)
      g.lineTo(34, y + 20)
      g.closePath()
      g.fill(col)
      g.ellipse(0, y + 22, 36, 10)
      g.fill(0xffffff)
      g.circle(0, y - 28, 7)
      g.fill(0xffffff)
    } else {
      g.ellipse(0, y + 18, 44, 14)
      g.fill(col)
      g.roundRect(-36, y - 6, 72, 28, 12)
      g.fill(col)
    }
  }

  private spawnReactionFx(reaction: Reaction) {
    const bursts: Array<{
      n: number
      color: number
      kind: 'circle' | 'heart' | 'crumb' | 'spark'
      spread: number
    }> = []
    if (reaction === 'eat') bursts.push({ n: 10, color: 0xf4a261, kind: 'crumb', spread: 40 })
    if (reaction === 'bath') bursts.push({ n: 14, color: 0xffffff, kind: 'circle', spread: 70 })
    if (reaction === 'laugh' || reaction === 'play')
      bursts.push({ n: 8, color: 0xff85a1, kind: 'heart', spread: 50 })
    if (reaction === 'brush') bursts.push({ n: 10, color: 0x4cc9f0, kind: 'spark', spread: 45 })
    if (reaction === 'potty') bursts.push({ n: 6, color: 0x90e0ef, kind: 'spark', spread: 30 })
    if (reaction.startsWith('skill_')) bursts.push({ n: 12, color: 0xf4d35e, kind: 'spark', spread: 60 })
    for (const b of bursts) {
      for (let i = 0; i < b.n; i++) {
        const ang = Math.random() * Math.PI * 2
        const spd = 20 + Math.random() * b.spread
        this.particles.push({
          x: (Math.random() - 0.5) * 40,
          y: -40 + Math.random() * 40,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 30,
          life: 0,
          max: 0.7 + Math.random() * 0.6,
          color: b.color,
          size: 3 + Math.random() * 5,
          kind: b.kind,
        })
      }
    }
  }

  private drawFx() {
    const g = this.fx
    g.clear()
    for (const p of this.particles) {
      const a = 1 - p.life / p.max
      if (p.kind === 'heart') {
        g.ellipse(p.x - p.size * 0.35, p.y, p.size * 0.45, p.size * 0.4)
        g.fill({ color: p.color, alpha: a * 0.85 })
        g.ellipse(p.x + p.size * 0.35, p.y, p.size * 0.45, p.size * 0.4)
        g.fill({ color: p.color, alpha: a * 0.85 })
        g.moveTo(p.x - p.size * 0.75, p.y + 1)
        g.lineTo(p.x, p.y + p.size)
        g.lineTo(p.x + p.size * 0.75, p.y + 1)
        g.closePath()
        g.fill({ color: p.color, alpha: a * 0.85 })
      } else if (p.kind === 'spark') {
        g.moveTo(p.x, p.y - p.size)
        g.lineTo(p.x + p.size * 0.25, p.y - p.size * 0.25)
        g.lineTo(p.x + p.size, p.y)
        g.lineTo(p.x + p.size * 0.25, p.y + p.size * 0.25)
        g.lineTo(p.x, p.y + p.size)
        g.lineTo(p.x - p.size * 0.25, p.y + p.size * 0.25)
        g.lineTo(p.x - p.size, p.y)
        g.lineTo(p.x - p.size * 0.25, p.y - p.size * 0.25)
        g.closePath()
        g.fill({ color: p.color, alpha: a })
      } else {
        g.circle(p.x, p.y, p.size)
        g.fill({ color: p.color, alpha: a * (p.kind === 'crumb' ? 0.9 : 0.65) })
      }
    }
  }

  private update(dt: number) {
    if (!this.ready || this.disposed) return
    this.time += dt
    this.blinkT += dt
    if (this.blinkT > 3.4) this.blinkT = 0

    if (this.yawnT > 0) this.yawnT = Math.max(0, this.yawnT - dt)
    if (this.stretchT > 0) this.stretchT = Math.max(0, this.stretchT - dt)
    if (this.sneezeT > 0) this.sneezeT = Math.max(0, this.sneezeT - dt)
    if (this.earFlopT > 0) this.earFlopT = Math.max(0, this.earFlopT - dt)
    this.idleClock += dt
    if (
      this.idleClock > 10 &&
      this.props.reaction === 'idle' &&
      !this.props.sleeping &&
      !this.props.talking
    ) {
      this.idleClock = 0
      this.idleCycle = (this.idleCycle + 1) % 4
      if (this.idleCycle === 0) this.yawnT = 1.4
      else if (this.idleCycle === 1) this.stretchT = 1.6
      else if (this.idleCycle === 2) {
        this.sneezeT = 0.55
        for (let i = 0; i < 8; i++) {
          const ang = -Math.PI / 2 + (Math.random() - 0.5)
          this.particles.push({
            x: (Math.random() - 0.5) * 20,
            y: -60,
            vx: Math.cos(ang) * (40 + Math.random() * 40),
            vy: Math.sin(ang) * (40 + Math.random() * 30),
            life: 0,
            max: 0.5 + Math.random() * 0.4,
            color: 0xffffff,
            size: 2 + Math.random() * 3,
            kind: 'circle',
          })
        }
      } else {
        this.earFlopT = 0.7
      }
    }

    if (this.props.reaction !== this.lastFxReaction) {
      this.lastFxReaction = this.props.reaction
      if (this.props.reaction === 'laugh') this.earFlopT = 0.85
      if (this.props.reaction !== 'idle' && this.props.reaction !== 'sleep') {
        this.spawnReactionFx(this.props.reaction)
      }
    }

    for (const p of this.particles) {
      p.life += dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 40 * dt
    }
    this.particles = this.particles.filter((p) => p.life < p.max)

    if (this.props.sleeping) {
      this.zzz.position.set(48, -150 + Math.sin(this.time * 2) * 8)
      this.zzz.alpha = 0.55 + Math.sin(this.time * 3) * 0.25
      this.zzz.scale.set(0.9 + Math.sin(this.time * 2.5) * 0.15)
    }
    const w = this.app.screen.width
    const h = this.app.screen.height
    this.drawCompanion(w, h)
    this.drawRoomProps(w, h)
    this.redraw()
    this.drawFx()
  }

  destroy() {
    this.disposed = true
    this.ready = false
    window.removeEventListener('resize', this.layout)
    this.host?.removeEventListener('pointermove', this.onPointerMove)
    this.host = null
    try {
      this.app.destroy(true, { children: true })
    } catch {
      /* ignore */
    }
  }
}
