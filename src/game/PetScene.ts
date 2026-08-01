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
import { derivePose } from './petPose'

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
  companionHunger: number
  companionHappiness: number
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
  | 'bath_medicine'
  | 'bed_sleep'
  | 'bedroom_lamp'
  | 'yard_play'
  | 'yard_swing'
  | 'yard_fountain'
  | 'yard_sandbox'
  | 'living_tv'
  | 'living_sofa'
  | 'cinema_screen'
  | 'cinema_console'
  | 'cinema_sofa'

export class PetScene {
  readonly app: Application
  private root = new Container()
  private roomBack = new Graphics()
  private furnitureLayer = new Graphics()
  private roomFront = new Graphics()
  private roomPropHit = new Graphics()
  private roomPropHitB = new Graphics()
  private roomPropHitC = new Graphics()
  private roomPropHitD = new Graphics()
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
  private cookT = 0
  private fountainT = 0
  private bathPulseT = 0
  private brushPulseT = 0
  private pottyPulseT = 0
  private medicinePulseT = 0
  private swingPulseT = 0
  private tvPulseT = 0
  private sleepPulseT = 0
  private sandboxPulseT = 0
  private cinemaPulseT = 0
  private consolePulseT = 0
  private pokeJiggleT = 0
  private pokeJiggleStrength = 1
  private pokeJiggleDir = 1
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
      this.roomPropHitD,
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
    this.roomPropHitD.eventMode = 'none'
    this.roomPropHitD.cursor = 'pointer'
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
      else if (room === 'cinema') this.onPoke('cinema_screen')
    })
    this.roomPropHitB.on('pointertap', () => {
      const room = this.props.room
      if (room === 'bathroom') this.onPoke('bath_sink')
      else if (room === 'kitchen') this.onPoke('kitchen_stove')
      else if (room === 'bedroom') this.onPoke('bedroom_lamp')
      else if (room === 'yard') this.onPoke('yard_swing')
      else if (room === 'living') this.onPoke('living_sofa')
      else if (room === 'cinema') this.onPoke('cinema_console')
    })
    this.roomPropHitC.on('pointertap', () => {
      if (this.props.room === 'bathroom') this.onPoke('bath_potty')
      else if (this.props.room === 'yard') this.onPoke('yard_fountain')
      else if (this.props.room === 'cinema') this.onPoke('cinema_sofa')
    })
    this.roomPropHitD.on('pointertap', () => {
      if (this.props.room === 'bathroom') this.onPoke('bath_medicine')
      else if (this.props.room === 'yard') this.onPoke('yard_sandbox')
    })

    parent.addEventListener('pointermove', this.onPointerMove)
    window.addEventListener('petverse-poke-impulse', this.onPokeImpulse)

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
      // Stove + cooktop
      back.roundRect(w * 0.62, h * 0.36, w * 0.28, h * 0.2, 6)
      back.fill(0xe76f51)
      back.roundRect(w * 0.64, h * 0.38, w * 0.24, h * 0.08, 4)
      back.fill(0x333333)
      // Frying pan
      back.ellipse(w * 0.74, h * 0.41, 22, 10)
      back.fill(0x6c757d)
      back.ellipse(w * 0.74, h * 0.4, 16, 7)
      back.fill(0x495057)
      back.roundRect(w * 0.82, h * 0.39, 28, 5, 2)
      back.fill(0x343a40)
    } else if (this.props.room === 'bathroom') {
      // Sink vanity
      back.roundRect(w * 0.68, h * 0.28, w * 0.22, h * 0.28, 10)
      back.fill(0xffffff)
      back.ellipse(w * 0.79, h * 0.38, 28, 12)
      back.fill(0x90e0ef)
      back.roundRect(w * 0.77, h * 0.3, 10, 14, 3)
      back.fill(0x4cc9f0)
      // Medicine cabinet (MTT2 cure loop)
      back.roundRect(w * 0.7, h * 0.1, w * 0.18, h * 0.14, 6)
      back.fill(0xe8f7ef)
      back.roundRect(w * 0.715, h * 0.12, w * 0.06, h * 0.1, 3)
      back.fill(0xffffff)
      back.roundRect(w * 0.79, h * 0.12, w * 0.06, h * 0.1, 3)
      back.fill(0xffffff)
      back.circle(w * 0.745, h * 0.17, 5)
      back.fill(0x5cb88a)
      back.roundRect(w * 0.742, h * 0.14, 3, 10, 1)
      back.fill(0xffffff)
      back.roundRect(w * 0.738, h * 0.165, 10, 3, 1)
      back.fill(0xffffff)
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
      // Yard fountain (interactive water toy)
      const fx = w * 0.82
      const fy = h * 0.58
      back.ellipse(fx, fy + 18, 36, 12)
      back.fill(0x4cc9f0)
      back.ellipse(fx, fy + 18, 26, 8)
      back.fill(0x90e0ef)
      back.roundRect(fx - 6, fy - 28, 12, 46, 4)
      back.fill(0xb0b0b0)
      back.circle(fx, fy - 32, 12)
      back.fill(0xffffff)
      back.circle(fx, fy - 32, 7)
      back.fill(0x4cc9f0)
      // Sandbox dig pit
      back.ellipse(w * 0.68, h * 0.72, 42, 16)
      back.fill(0xe9c46a)
      back.ellipse(w * 0.68, h * 0.72, 30, 10)
      back.fill(0xd4a373)
      // Permanent yard slide
      const slx = w * 0.08
      const sly = h * 0.28
      back.roundRect(slx, sly, 14, h * 0.34, 4)
      back.fill(0xffbe0b)
      back.moveTo(slx + 14, sly + 8)
      back.lineTo(slx + 90, sly + h * 0.28)
      back.lineTo(slx + 78, sly + h * 0.3)
      back.lineTo(slx + 14, sly + 28)
      back.closePath()
      back.fill(0x4cc9f0)
      back.ellipse(slx + 86, sly + h * 0.3, 16, 8)
      back.fill(0x6a994e)
    } else if (this.props.room === 'cinema') {
      // Dark chill cinema: big screen, seat row, console, popcorn
      back.rect(0, 0, w, h * 0.62)
      back.fill(0x140c1f)
      back.rect(0, 0, w, h * 0.62)
      back.fill({ color: 0x3a1c5c, alpha: 0.35 })
      // Projector beam
      back.moveTo(w * 0.5, h * 0.08)
      back.lineTo(w * 0.18, h * 0.42)
      back.lineTo(w * 0.82, h * 0.42)
      back.closePath()
      back.fill({ color: 0xffffff, alpha: 0.06 })
      // Giant screen
      back.roundRect(w * 0.12, h * 0.1, w * 0.76, h * 0.32, 10)
      back.fill(0x0d0d0d)
      back.roundRect(w * 0.14, h * 0.12, w * 0.72, h * 0.26, 8)
      back.fill(0x1d3557)
      // Neon trim
      back.roundRect(w * 0.12, h * 0.1, w * 0.76, h * 0.32, 10)
      back.stroke({ width: 3, color: 0xe63946, alpha: 0.7 })
      // Seat row
      for (let i = 0; i < 4; i++) {
        const sx = w * 0.18 + i * w * 0.16
        back.roundRect(sx, h * 0.48, w * 0.12, h * 0.12, 8)
        back.fill(0x1a1a1a)
        back.roundRect(sx + 4, h * 0.46, w * 0.12 - 8, h * 0.05, 6)
        back.fill(0xe63946)
      }
      // Chill console
      back.roundRect(w * 0.72, h * 0.48, w * 0.18, h * 0.12, 6)
      back.fill(0x240046)
      back.roundRect(w * 0.745, h * 0.5, w * 0.13, h * 0.05, 4)
      back.fill(0x00f5d4)
      // Popcorn stand
      back.roundRect(w * 0.08, h * 0.5, w * 0.1, h * 0.1, 4)
      back.fill(0xffbe0b)
      back.rect(w * 0.08, h * 0.52, w * 0.1, 4)
      back.fill(0xe63946)
      back.rect(w * 0.08, h * 0.56, w * 0.1, 4)
      back.fill(0xe63946)
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
    const hitD = this.roomPropHitD
    const hint = this.roomPropHint
    hit.clear()
    hitB.clear()
    hitC.clear()
    hitD.clear()
    hint.clear()
    hit.eventMode = 'none'
    hitB.eventMode = 'none'
    hitC.eventMode = 'none'
    hitD.eventMode = 'none'
    const pulse = 0.35 + Math.abs(Math.sin(this.time * 2.4)) * 0.35
    const room = this.props.room

    if (room === 'kitchen') {
      // Fridge → food menu
      hit.roundRect(w * 0.08, h * 0.28, w * 0.28, h * 0.28, 8)
      hit.fill({ color: 0xffffff, alpha: 0.001 })
      hit.eventMode = 'static'
      hint.roundRect(w * 0.08, h * 0.28, w * 0.28, h * 0.28, 8)
      hint.stroke({ width: 3, color: 0xffbe0b, alpha: pulse })
      // Stove → cooking snack mini-anim
      hitB.roundRect(w * 0.62, h * 0.36, w * 0.28, h * 0.2, 6)
      hitB.fill({ color: 0xffffff, alpha: 0.001 })
      hitB.eventMode = 'static'
      hint.roundRect(w * 0.62, h * 0.36, w * 0.28, h * 0.2, 6)
      hint.stroke({ width: 3, color: 0xe76f51, alpha: pulse })
      hint.ellipse(w * 0.74, h * 0.41, 22, 10)
      hint.stroke({ width: 2, color: 0x6c757d, alpha: 0.55 + pulse * 0.3 })
      const flame = 0.3 + Math.abs(Math.sin(this.time * 10)) * 0.5
      const cookBoost = this.cookT > 0 ? 1.4 : 1
      hint.circle(w * 0.7, h * 0.48, 4 * cookBoost)
      hint.fill({ color: 0xffbe0b, alpha: flame })
      hint.circle(w * 0.78, h * 0.48, 4 * cookBoost)
      hint.fill({ color: 0xe63946, alpha: flame * 0.85 })
      // Sizzle steam while cooking
      if (this.cookT > 0) {
        for (let i = 0; i < 5; i++) {
          const t = this.time * 3 + i
          const sx = w * 0.7 + i * 8 + Math.sin(t) * 4
          const sy = h * 0.36 - (1 - this.cookT / 1.8) * 28 - i * 6 - Math.abs(Math.sin(t * 1.4)) * 6
          hint.ellipse(sx, sy, 7 + i, 4)
          hint.fill({ color: 0xffffff, alpha: 0.2 + this.cookT * 0.2 })
        }
        // Pan bounce
        const bob = Math.sin(this.time * 18) * 2
        hint.ellipse(w * 0.74, h * 0.41 + bob, 18, 8)
        hint.fill({ color: 0xffbe0b, alpha: 0.35 })
      }
    } else if (room === 'bathroom') {
      // Tub → bath
      hit.ellipse(w * 0.2, h * 0.5, 44, 32)
      hit.fill({ color: 0xffffff, alpha: 0.001 })
      hit.eventMode = 'static'
      hint.ellipse(w * 0.2, h * 0.5, 44, 32)
      hint.stroke({ width: 3, color: 0xffffff, alpha: pulse })
      if (this.bathPulseT > 0) {
        const bt = this.bathPulseT
        for (let i = 0; i < 7; i++) {
          const ang = (i / 7) * Math.PI * 2 + this.time * 3
          const r = 20 + (1 - bt / 1.5) * 28
          hint.circle(w * 0.2 + Math.cos(ang) * r, h * 0.5 + Math.sin(ang) * r * 0.7, 4 + (i % 3))
          hint.fill({ color: i % 2 ? 0xffffff : 0x90e0ef, alpha: 0.45 * bt })
        }
        hint.ellipse(w * 0.2, h * 0.5, 36 + (1 - bt / 1.5) * 10, 22)
        hint.fill({ color: 0x4cc9f0, alpha: 0.2 * bt })
      }
      // Sink → brush teeth
      hitB.roundRect(w * 0.68, h * 0.28, w * 0.22, h * 0.28, 10)
      hitB.fill({ color: 0xffffff, alpha: 0.001 })
      hitB.eventMode = 'static'
      hint.roundRect(w * 0.68, h * 0.28, w * 0.22, h * 0.28, 10)
      hint.stroke({ width: 3, color: 0x4cc9f0, alpha: pulse })
      if (this.brushPulseT > 0) {
        const path = 1 - this.brushPulseT / 1.4
        const bx = w * 0.74 + Math.sin(this.time * 16) * 8
        const by = h * 0.38 + path * 18
        hint.roundRect(bx - 10, by - 4, 20, 8, 3)
        hint.fill({ color: 0xffffff, alpha: 0.7 * this.brushPulseT })
        for (let i = 0; i < 5; i++) {
          hint.circle(bx + (i - 2) * 5, by - 10 - i * 2, 2.5)
          hint.fill({ color: 0xffffff, alpha: 0.5 * this.brushPulseT })
        }
      }
      // Toilet → potty routine
      hitC.roundRect(w * 0.4, h * 0.28, w * 0.2, h * 0.3, 10)
      hitC.fill({ color: 0xffffff, alpha: 0.001 })
      hitC.eventMode = 'static'
      hint.roundRect(w * 0.42, h * 0.3, w * 0.16, h * 0.28, 10)
      hint.stroke({ width: 3, color: 0x90e0ef, alpha: pulse })
      hint.ellipse(w * 0.5, h * 0.52, 26, 12)
      hint.fill({ color: 0x4cc9f0, alpha: 0.2 + pulse * 0.2 })
      if (this.pottyPulseT > 0) {
        const swirl = this.pottyPulseT
        hint.ellipse(w * 0.5, h * 0.52, 20 + (1 - swirl / 1.2) * 8, 8)
        hint.stroke({ width: 2, color: 0xffffff, alpha: 0.7 * swirl })
        hint.circle(w * 0.5 + Math.sin(this.time * 12) * 6, h * 0.5, 3)
        hint.fill({ color: 0x4cc9f0, alpha: 0.6 * swirl })
      }
      // Medicine cabinet → cure
      hitD.roundRect(w * 0.68, h * 0.08, w * 0.22, h * 0.18, 6)
      hitD.fill({ color: 0xffffff, alpha: 0.001 })
      hitD.eventMode = 'static'
      hint.roundRect(w * 0.7, h * 0.1, w * 0.18, h * 0.14, 6)
      hint.stroke({ width: 3, color: 0x5cb88a, alpha: pulse })
      if (this.medicinePulseT > 0) {
        const mt = this.medicinePulseT
        for (let i = 0; i < 6; i++) {
          const ang = (i / 6) * Math.PI * 2 + this.time * 4
          const r = 10 + (1 - mt / 1.4) * 18
          hint.circle(w * 0.79 + Math.cos(ang) * r, h * 0.17 + Math.sin(ang) * r * 0.7, 3)
          hint.fill({ color: i % 2 ? 0x5cb88a : 0xffffff, alpha: 0.55 * mt })
        }
        hint.roundRect(w * 0.775, h * 0.14, 8, 18, 2)
        hint.fill({ color: 0xffffff, alpha: 0.65 * mt })
        hint.roundRect(w * 0.765, h * 0.155, 18, 8, 2)
        hint.fill({ color: 0xffffff, alpha: 0.65 * mt })
      }
    } else if (room === 'bedroom') {
      // Bed → sleep
      hit.roundRect(w * 0.08, h * 0.28, w * 0.32, h * 0.3, 10)
      hit.fill({ color: 0xffffff, alpha: 0.001 })
      hit.eventMode = 'static'
      hint.roundRect(w * 0.08, h * 0.28, w * 0.32, h * 0.3, 10)
      hint.stroke({ width: 3, color: 0xffe066, alpha: pulse })
      if (this.sleepPulseT > 0) {
        for (let i = 0; i < 3; i++) {
          const rise = (1 - this.sleepPulseT / 1.6) * 30 + i * 12
          hint.circle(w * 0.22 + i * 10, h * 0.32 - rise, 6 + i * 2)
          hint.fill({ color: 0xffe066, alpha: 0.25 * this.sleepPulseT })
        }
      }
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
      const swingBob = this.swingPulseT > 0 ? Math.sin(this.time * 14) * 10 : Math.sin(this.time * 2) * 3
      hitB.roundRect(sx - 20, sy, 56, 90, 8)
      hitB.fill({ color: 0xffffff, alpha: 0.001 })
      hitB.eventMode = 'static'
      hint.moveTo(sx, sy)
      hint.lineTo(sx - 10 + swingBob, sy + 70)
      hint.moveTo(sx + 30, sy)
      hint.lineTo(sx + 40 + swingBob, sy + 70)
      hint.stroke({ width: 3, color: 0xb56b45, alpha: 0.85 })
      hint.roundRect(sx - 14 + swingBob, sy + 66, 58, 14, 6)
      hint.fill({ color: 0xe76f51, alpha: 0.85 })
      hint.roundRect(sx - 14 + swingBob, sy + 66, 58, 14, 6)
      hint.stroke({ width: 2, color: 0xffbe0b, alpha: pulse })
      if (this.swingPulseT > 0) {
        for (let i = 0; i < 4; i++) {
          hint.circle(sx + 10 + swingBob + i * 8, sy + 50 - i * 6, 3)
          hint.fill({ color: 0xffbe0b, alpha: 0.55 * this.swingPulseT })
        }
      }
      // Fountain → splash play
      const fountX = w * 0.82
      const fountY = h * 0.58
      hitC.ellipse(fountX, fountY + 10, 40, 36)
      hitC.fill({ color: 0xffffff, alpha: 0.001 })
      hitC.eventMode = 'static'
      hint.ellipse(fountX, fountY + 18, 36, 12)
      hint.stroke({ width: 3, color: 0x4cc9f0, alpha: pulse })
      if (this.fountainT > 0) {
        const burst = 1 - this.fountainT / 1.6
        for (let i = 0; i < 8; i++) {
          const ang = -Math.PI / 2 + (i - 3.5) * 0.22
          const dist = 18 + burst * 42 + Math.sin(this.time * 14 + i) * 4
          const dx = Math.cos(ang) * dist
          const dy = Math.sin(ang) * dist
          hint.circle(fountX + dx, fountY - 20 + dy, 3 + (i % 3))
          hint.fill({ color: i % 2 ? 0xffffff : 0x90e0ef, alpha: 0.55 * this.fountainT })
        }
        hint.circle(fountX, fountY - 40 - burst * 20, 10 + burst * 8)
        hint.fill({ color: 0x4cc9f0, alpha: 0.35 * this.fountainT })
      } else {
        const spout = 8 + Math.abs(Math.sin(this.time * 4)) * 10
        hint.circle(fountX, fountY - 32 - spout * 0.3, 5)
        hint.fill({ color: 0xffffff, alpha: 0.45 })
        hint.ellipse(fountX, fountY - 20, 4, spout)
        hint.fill({ color: 0x90e0ef, alpha: 0.4 })
      }
      // Sandbox + slide cue (hit covers sandbox; slide is scenic next to swing)
      const sbx = w * 0.68
      const sby = h * 0.72
      hitD.ellipse(sbx, sby, 48, 22)
      hitD.fill({ color: 0xffffff, alpha: 0.001 })
      hitD.eventMode = 'static'
      hint.ellipse(sbx, sby, 42, 16)
      hint.stroke({ width: 3, color: 0xe9c46a, alpha: pulse })
      if (this.sandboxPulseT > 0) {
        for (let i = 0; i < 6; i++) {
          hint.circle(
            sbx + (i - 2.5) * 8,
            sby - 8 - (1 - this.sandboxPulseT / 1.4) * 16 - (i % 2) * 4,
            3,
          )
          hint.fill({ color: i % 2 ? 0xe9c46a : 0xffffff, alpha: 0.55 * this.sandboxPulseT })
        }
      }
      // Slide sparkle on the permanent slide structure
      const slx = w * 0.08
      const sly = h * 0.28
      hint.moveTo(slx + 18, sly + 12)
      hint.lineTo(slx + 82, sly + h * 0.26)
      hint.stroke({ width: 3, color: 0xffbe0b, alpha: pulse * 0.7 })
    } else if (room === 'cinema') {
      // Big screen → chill watch
      hit.roundRect(w * 0.12, h * 0.1, w * 0.76, h * 0.32, 10)
      hit.fill({ color: 0xffffff, alpha: 0.001 })
      hit.eventMode = 'static'
      hint.roundRect(w * 0.12, h * 0.1, w * 0.76, h * 0.32, 10)
      hint.stroke({ width: 3, color: 0xe63946, alpha: pulse })
      const flicker = 0.25 + Math.abs(Math.sin(this.time * 5)) * 0.45
      const chillBoost = this.cinemaPulseT > 0 ? 0.5 : 0
      hint.roundRect(w * 0.14, h * 0.12, w * 0.72, h * 0.26, 8)
      hint.fill({
        color: this.cinemaPulseT > 0 ? 0xff85a1 : 0x4cc9f0,
        alpha: flicker * 0.3 + chillBoost,
      })
      if (this.cinemaPulseT > 0) {
        for (let i = 0; i < 8; i++) {
          hint.circle(
            w * 0.2 + i * w * 0.08,
            h * 0.22 + Math.sin(this.time * 8 + i) * 6,
            3,
          )
          hint.fill({ color: 0xffffff, alpha: 0.45 * this.cinemaPulseT })
        }
      }
      // Neon console → short play pulse
      hitB.roundRect(w * 0.72, h * 0.46, w * 0.2, h * 0.16, 6)
      hitB.fill({ color: 0xffffff, alpha: 0.001 })
      hitB.eventMode = 'static'
      hint.roundRect(w * 0.72, h * 0.48, w * 0.18, h * 0.12, 6)
      hint.stroke({ width: 3, color: 0x00f5d4, alpha: pulse })
      if (this.consolePulseT > 0) {
        for (let i = 0; i < 5; i++) {
          hint.circle(w * 0.78 + i * 6, h * 0.52 - (1 - this.consolePulseT / 1.3) * 14, 3)
          hint.fill({ color: 0x00f5d4, alpha: 0.55 * this.consolePulseT })
        }
      }
      // Cinema sofa / seat row → poke + popcorn card
      hitC.ellipse(w * 0.4, h * 0.55, 90, 28)
      hitC.fill({ color: 0xffffff, alpha: 0.001 })
      hitC.eventMode = 'static'
      hint.ellipse(w * 0.4, h * 0.55, 90, 28)
      hint.stroke({ width: 3, color: 0xe63946, alpha: pulse })
      hint.roundRect(w * 0.08, h * 0.5, w * 0.1, h * 0.1, 4)
      hint.stroke({ width: 2, color: 0xffbe0b, alpha: pulse })
    } else if (room === 'living') {
      // TV → watch / play
      hit.roundRect(w * 0.68, h * 0.18, w * 0.24, h * 0.22, 10)
      hit.fill({ color: 0xffffff, alpha: 0.001 })
      hit.eventMode = 'static'
      hint.roundRect(w * 0.68, h * 0.18, w * 0.24, h * 0.22, 10)
      hint.stroke({ width: 3, color: 0x9b5de5, alpha: pulse })
      const flicker = 0.35 + Math.abs(Math.sin(this.time * 6)) * 0.4
      const tvBoost = this.tvPulseT > 0 ? 0.55 : 0
      hint.roundRect(w * 0.7, h * 0.2, w * 0.2, h * 0.16, 6)
      hint.fill({ color: this.tvPulseT > 0 ? 0xff85a1 : 0x4cc9f0, alpha: flicker * 0.35 + tvBoost })
      if (this.tvPulseT > 0) {
        for (let i = 0; i < 5; i++) {
          hint.circle(w * 0.75 + i * 8, h * 0.26 + Math.sin(this.time * 10 + i) * 4, 3)
          hint.fill({ color: 0xffffff, alpha: 0.5 * this.tvPulseT })
        }
      }
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
        } else if (id === 'fountain' || id === 'sandbox' || id === 'trampoline' || id.includes('fountain')) {
          g.ellipse(w * 0.72, floorY + 10, id.includes('trampoline') ? 48 : 28, id.includes('trampoline') ? 18 : 12)
          g.fill(item.color)
          if (id.includes('trampoline')) {
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
        } else if (id.startsWith('cushion') || id.includes('ottoman') || id.includes('beanbag')) {
          g.ellipse(w * 0.3, floorY + 8, 34, 18)
          g.fill(item.color)
          g.ellipse(w * 0.3, floorY + 2, 22, 10)
          g.fill(item.accent)
        } else if (id.startsWith('toy') || id.includes('rocket') || id.includes('duck')) {
          g.roundRect(w * 0.58, floorY - 18, 28, 26, 6)
          g.fill(item.color)
          g.circle(w * 0.72, floorY - 6, 10)
          g.fill(item.accent)
        } else if (id.startsWith('table')) {
          g.roundRect(w * 0.42, floorY - 8, 70, 14, 4)
          g.fill(item.color)
          g.rect(w * 0.46, floorY + 4, 6, 12)
          g.fill(item.accent)
          g.rect(w * 0.72, floorY + 4, 6, 12)
          g.fill(item.accent)
        } else {
          // Distinct generic floor props by color bands so new SKUs don't share one blob
          g.ellipse(w * 0.55, floorY + 8, 30, 12)
          g.fill(item.color)
          g.roundRect(w * 0.48, floorY - 16, 28, 22, 8)
          g.fill(item.accent)
          g.circle(w * 0.62, floorY - 10, 8)
          g.fill({ color: item.color, alpha: 0.85 })
        }
      } else if (item.slot === 'wall') {
        const x = id.includes('moon') || id === 'pirate_flag' ? w * 0.18 : w * 0.08
        const y = h * 0.2
        if (id.startsWith('poster') || id.startsWith('wall_art') || id.startsWith('wall_banner')) {
          g.roundRect(x, y, 54, 68, 6)
          g.fill(0xf2e8d5)
          g.roundRect(x + 6, y + 6, 42, 56, 4)
          g.fill(item.color)
          if (id.includes('banner')) {
            g.moveTo(x + 10, y + 50)
            g.lineTo(x + 27, y + 62)
            g.lineTo(x + 44, y + 50)
            g.fill(item.accent)
          } else {
            g.circle(x + 27, y + 30, 12)
            g.fill(item.accent)
          }
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
          g.circle(x - 10, y - 16, 4)
          g.fill(0xff85a1)
          g.circle(x + 10, y - 16, 4)
          g.fill(0x4cc9f0)
          g.roundRect(x - 8, y - 12, 16, 4, 2)
          g.fill({ color: 0xffffff, alpha: 0.45 })
        } else if (id === 'sofa_cinema' || id === 'sofa_cinema_xl') {
          const wide = id === 'sofa_cinema_xl' ? 1.25 : 1
          g.roundRect(x - 40 * wide, y - 36, 80 * wide, 32, 10)
          g.fill(item.color)
          g.roundRect(x - 36 * wide, y - 48, 72 * wide, 18, 8)
          g.fill(item.accent)
          g.ellipse(x - 28 * wide, y - 20, 10, 8)
          g.fill({ color: 0xffffff, alpha: 0.12 })
          g.ellipse(x + 28 * wide, y - 20, 10, 8)
          g.fill({ color: 0xffffff, alpha: 0.12 })
        } else if (id === 'slide') {
          g.roundRect(x - 8, y - 70, 12, 70, 4)
          g.fill(item.color)
          g.moveTo(x + 4, y - 62)
          g.lineTo(x + 48, y - 8)
          g.lineTo(x + 38, y - 2)
          g.lineTo(x + 4, y - 42)
          g.closePath()
          g.fill(item.accent)
        } else if (id === 'drum_kit') {
          g.ellipse(x, y - 18, 28, 14)
          g.fill(item.color)
          g.ellipse(x, y - 18, 20, 9)
          g.fill(item.accent)
          g.circle(x - 22, y - 34, 10)
          g.fill(0x333333)
          g.circle(x + 22, y - 34, 10)
          g.fill(0x333333)
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
    const playing = this.props.reaction === 'play'
    const hungry = this.props.companionHunger < 30
    const sad = this.props.companionHappiness < 30
    const skillCheer = this.props.reaction.startsWith('skill_') && this.props.companionHappiness > 40
    const hop = playing || skillCheer
      ? Math.abs(Math.sin(this.time * 10)) * 18
      : hungry || sad
        ? Math.sin(this.time * 1.6) * 2
        : Math.sin(this.time * 3) * 4
    const x = w * 0.72 + (playing || skillCheer ? Math.sin(this.time * 6) * 16 : 0)
    const y = h * 0.7 + hop
    g.ellipse(x, y + 28, 22, 8)
    g.fill({ color: 0x1a2a22, alpha: 0.15 })
    g.circle(x, y, 22)
    g.fill(def.fill)
    // Mini care meters (MTT2 companion needs)
    const barW = 36
    const barX = x - barW / 2
    const barY = y - 40
    g.roundRect(barX - 2, barY - 2, barW + 4, 14, 4)
    g.fill({ color: 0x1a2a22, alpha: 0.45 })
    g.roundRect(barX, barY, barW, 4, 2)
    g.fill({ color: 0xffffff, alpha: 0.2 })
    g.roundRect(barX, barY, barW * (this.props.companionHunger / 100), 4, 2)
    g.fill(this.props.companionHunger < 30 ? 0xd1645b : 0xe9b44c)
    g.roundRect(barX, barY + 6, barW, 4, 2)
    g.fill({ color: 0xffffff, alpha: 0.2 })
    g.roundRect(barX, barY + 6, barW * (this.props.companionHappiness / 100), 4, 2)
    g.fill(this.props.companionHappiness < 30 ? 0xd1645b : 0x5cb88a)
    if (playing) {
      // Fetch toy — companion play interaction beyond tap-to-hear
      const ballX = w * 0.55 + Math.sin(this.time * 7) * 40
      const ballY = h * 0.62 + Math.abs(Math.cos(this.time * 7)) * 30
      g.circle(ballX, ballY, 8)
      g.fill(0xff85a1)
      g.circle(ballX - 2, ballY - 2, 2)
      g.fill({ color: 0xffffff, alpha: 0.7 })
    }
    if (skillCheer) {
      // Cheer bubbles while pet performs drums / hoop / boxing
      for (let i = 0; i < 4; i++) {
        const rise = ((this.time * 40 + i * 18) % 40)
        g.circle(x + (i - 1.5) * 10, y - 28 - rise, 3)
        g.fill({ color: 0xf4d35e, alpha: 0.55 })
      }
      g.moveTo(x - 6, y - 18)
      g.lineTo(x, y - 30)
      g.lineTo(x + 6, y - 18)
      g.stroke({ width: 2, color: 0xff85a1, alpha: 0.7 })
    }
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

  private pose() {
    return derivePose({
      time: this.time,
      reaction: this.props.reaction,
      sleeping: this.props.sleeping,
      talking: this.props.talking,
      needs: this.props.needs,
      stretchT: this.stretchT,
      sneezeT: this.sneezeT,
      yawnT: this.yawnT,
      earFlopT: this.earFlopT,
    })
  }

  private redraw() {
    if (!this.ready || this.disposed) return
    const { needs, bodyColor, hat, glasses, scarf, shirt, shoes, reaction, sleeping, talking, petName } =
      this.props
    const color = getBodyColor(bodyColor)
    const mood = deriveMood(needs)
    const scale = this.app.screen.width < 480 ? 0.82 : 1
    const pose = this.pose()
    const jiggle =
      this.pokeJiggleT > 0
        ? Math.sin(this.pokeJiggleT * 42) * 0.08 * this.pokeJiggleStrength * this.pokeJiggleDir
        : 0
    const jiggleSquash =
      this.pokeJiggleT > 0 ? 1 + Math.sin(this.pokeJiggleT * 36) * 0.06 * this.pokeJiggleStrength : 1
    this.pet.scale.set(scale * pose.sx * jiggleSquash, scale * pose.sy * (2 - jiggleSquash))
    this.pet.rotation = pose.tilt + jiggle
    this.nameTag.text = petName || 'Your Pet'
    const b = pose.bounce + (this.pokeJiggleT > 0 ? Math.sin(this.pokeJiggleT * 40) * 6 * this.pokeJiggleStrength : 0)

    this.drawShadow(b)
    this.drawLegs(color.fill, b, pose.limbPhase)
    this.drawShoesLayer(shoes, b)
    this.drawBodyLayer(color.fill, color.belly, color.ear, mood, b, pose.breath)
    this.drawShirtLayer(shirt, b)
    this.drawArms(color.fill, reaction, b, pose.armLift)
    this.drawHeadLayer(color.fill, color.ear, b + pose.headBob * 0.15, pose.earFlop)
    this.drawFaceLayer(mood, reaction, sleeping, talking, b, pose.mouthOpen)
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

  private drawLegs(fill: number, b: number, limbPhase = 0) {
    const g = this.legs
    g.clear()
    const playStep = limbPhase
    const leftY = 70 + b * 0.2 + playStep * 0.35
    const rightY = 70 + b * 0.2 - playStep * 0.35
    // Thigh volume + shin taper for more articulated limbs
    g.ellipse(-34, leftY + 8, 16, 20)
    g.fill(fill)
    g.roundRect(-48, leftY, 28, 42, 12)
    g.fill(fill)
    g.ellipse(34, rightY + 8, 16, 20)
    g.fill(fill)
    g.roundRect(20, rightY, 28, 42, 12)
    g.fill(fill)
    // Knee highlights
    g.ellipse(-34, leftY + 14, 7, 5)
    g.fill({ color: 0xffffff, alpha: 0.12 })
    g.ellipse(34, rightY + 14, 7, 5)
    g.fill({ color: 0xffffff, alpha: 0.12 })
    // Soft paw pads when barefoot
    if (this.props.shoes === 'none') {
      g.ellipse(-34, leftY + 38, 10, 6)
      g.fill({ color: 0xffb4a2, alpha: 0.75 })
      g.ellipse(34, rightY + 38, 10, 6)
      g.fill({ color: 0xffb4a2, alpha: 0.75 })
      for (const sx of [-40, -34, -28]) {
        g.circle(sx, leftY + 30, 2.4)
        g.fill({ color: 0xffb4a2, alpha: 0.7 })
      }
      for (const sx of [28, 34, 40]) {
        g.circle(sx, rightY + 30, 2.4)
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

  private drawBodyLayer(fill: number, belly: number, ear: number, mood: string, b: number, breathIn = 0) {
    const g = this.body
    g.clear()
    const breath = breathIn || Math.sin(this.time * 2.1) * 2.5
    const bodyFill = mood === 'sick' ? 0x8fbc8f : fill
    // Soft outer rim for rounded cartoon volume
    g.ellipse(0, 30 + b, 82 + breath * 0.4, 96)
    g.fill({ color: ear, alpha: 0.35 })
    g.ellipse(0, 28 + b, 78 + breath * 0.35, 92)
    g.fill(bodyFill)
    // Chest/shoulder volume planes (pseudo-3D)
    g.ellipse(-36, 8 + b, 26, 22)
    g.fill({ color: 0xffffff, alpha: 0.08 })
    g.ellipse(36, 10 + b, 24, 20)
    g.fill({ color: 0x000000, alpha: 0.05 })
    // Depth shade + highlight
    g.ellipse(18, 40 + b, 40, 70)
    g.fill({ color: 0x000000, alpha: 0.07 })
    g.ellipse(-22, 8 + b, 22, 28)
    g.fill({ color: 0xffffff, alpha: 0.1 })
    // Cream belly patch with soft bounce
    g.ellipse(0, 42 + b + breath * 0.3, 48 + breath * 0.2, 58)
    g.fill(belly)
    g.ellipse(-8, 30 + b, 14, 18)
    g.fill({ color: 0xffffff, alpha: 0.12 })
    // Fur stripes (talking-pet silhouette cue)
    g.ellipse(-40, 20 + b, 8, 22)
    g.fill({ color: ear, alpha: 0.28 })
    g.ellipse(-36, 55 + b, 7, 18)
    g.fill({ color: ear, alpha: 0.22 })
    g.ellipse(40, 24 + b, 8, 20)
    g.fill({ color: ear, alpha: 0.24 })
    g.ellipse(36, 58 + b, 6, 16)
    g.fill({ color: ear, alpha: 0.2 })

    // Tail with tip accent — happier pets wag harder
    const wagSpeed =
      mood === 'happy' ? 9 : mood === 'sick' || mood === 'sad' || mood === 'tired' ? 1.2 : 2.5
    const wagAmp = mood === 'happy' ? 16 : mood === 'sick' || mood === 'sad' ? 3 : 10
    const wag = Math.sin(this.time * wagSpeed) * wagAmp
    g.moveTo(70, 50 + b)
    g.quadraticCurveTo(110 + wag, 10 + b, 98 + wag * 0.4, -20 + b)
    g.stroke({ width: 16, color: bodyFill, cap: 'round' })
    g.circle(98 + wag * 0.4, -20 + b, 9)
    g.fill(ear)
    g.circle(100 + wag * 0.4, -22 + b, 4)
    g.fill({ color: 0xffffff, alpha: 0.2 })

    if (mood === 'sick') {
      g.ellipse(0, 28 + b, 78, 92)
      g.fill({ color: 0x70a37a, alpha: 0.22 })
      for (let i = 0; i < 4; i++) {
        const ang = this.time * 0.8 + i * 1.4
        g.circle(Math.cos(ang) * 28, 20 + b + Math.sin(ang * 0.7) * 20, 5)
        g.fill({ color: 0x5a8f66, alpha: 0.2 })
      }
    }

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

  private drawArms(fill: number, reaction: Reaction, b: number, armLift = 0) {
    const g = this.arms
    g.clear()
    if (this.stretchT > 0 || (armLift > 10 && reaction === 'idle')) {
      const lift = armLift || 28
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
    const punchPhase = Math.sin(this.time * 14)
    const leftPunch = reaction === 'skill_boxing' ? Math.max(0, punchPhase) * 28 : 0
    const rightPunch = reaction === 'skill_boxing' ? Math.max(0, -punchPhase) * 28 : 0
    const swing =
      reaction === 'skill_boxing'
        ? punchPhase * 26
        : reaction === 'play'
          ? Math.sin(this.time * 14) * 22
          : reaction === 'skill_drums'
            ? Math.sin(this.time * 20) * 18
            : reaction === 'skill_hoop'
              ? Math.sin(this.time * 8) * 10
              : reaction === 'laugh'
                ? Math.sin(this.time * 16) * 12
                : Math.sin(this.time * 2) * 4
    const liftBoost = armLift * 0.35
    // Upper-arm + forearm segments for clearer articulation
    g.ellipse(-72 - leftPunch * 0.15, 6 + b + swing * 0.1 - liftBoost - leftPunch * 0.2, 16, 22)
    g.fill(fill)
    g.ellipse(72 + rightPunch * 0.15, 6 + b - swing * 0.1 - liftBoost - rightPunch * 0.2, 16, 22)
    g.fill(fill)
    g.ellipse(-78 - leftPunch * 0.35, 20 + b + swing * 0.15 - liftBoost - leftPunch * 0.4, 22, 36)
    g.fill(fill)
    g.ellipse(78 + rightPunch * 0.35, 20 + b - swing * 0.15 - liftBoost - rightPunch * 0.4, 22, 36)
    g.fill(fill)
    g.ellipse(-74, 10 + b + swing * 0.08, 6, 8)
    g.fill({ color: 0xffffff, alpha: 0.12 })
    g.ellipse(74, 10 + b - swing * 0.08, 6, 8)
    g.fill({ color: 0xffffff, alpha: 0.12 })
    // Palm pads for softer cartoon paws
    g.ellipse(-78 - leftPunch * 0.4, 48 + b + swing * 0.1 - leftPunch * 0.5, 10, 8)
    g.fill({ color: 0xffb4a2, alpha: 0.72 })
    g.ellipse(78 + rightPunch * 0.4, 48 + b - swing * 0.1 - rightPunch * 0.5, 10, 8)
    g.fill({ color: 0xffb4a2, alpha: 0.72 })
    for (const sx of [-86, -78, -70]) {
      g.circle(sx - leftPunch * 0.35, 38 + b + swing * 0.08 - leftPunch * 0.4, 2.2)
      g.fill({ color: 0xffb4a2, alpha: 0.65 })
    }
    for (const sx of [70, 78, 86]) {
      g.circle(sx + rightPunch * 0.35, 38 + b - swing * 0.08 - rightPunch * 0.4, 2.2)
      g.fill({ color: 0xffb4a2, alpha: 0.65 })
    }
    if (reaction === 'skill_hoop') {
      // Toss arc: rise → peak → catch
      const toss = (Math.sin(this.time * 5) + 1) * 0.5
      const hoopY = -10 + b - toss * 70
      const hoopX = Math.sin(this.time * 5) * 18
      const hoopR = 26 + toss * 6
      g.circle(hoopX, hoopY, hoopR)
      g.stroke({ width: 5, color: 0xf4d35e })
      g.circle(hoopX, hoopY, hoopR - 6)
      g.stroke({ width: 2, color: 0xffffff, alpha: 0.35 })
      if (toss > 0.85) {
        g.ellipse(0, 55 + b, 36, 10)
        g.fill({ color: 0xf4d35e, alpha: 0.25 })
      }
    }
    if (reaction === 'skill_drums') {
      // Alternating drum sticks
      const stickL = Math.sin(this.time * 20) * 10
      const stickR = Math.sin(this.time * 20 + Math.PI) * 10
      g.moveTo(-48, 30 + b)
      g.lineTo(-36, 55 + b + stickL)
      g.stroke({ width: 3, color: 0xb56b45 })
      g.moveTo(48, 30 + b)
      g.lineTo(36, 55 + b + stickR)
      g.stroke({ width: 3, color: 0xb56b45 })
      g.circle(-36, 58 + b + stickL, 3)
      g.fill(0x333333)
      g.circle(36, 58 + b + stickR, 3)
      g.fill(0x333333)
    }
    if (reaction === 'skill_boxing') {
      const lx = -90 - leftPunch * 0.5
      const ly = 10 + b + swing - leftPunch * 0.6
      const rx = 90 + rightPunch * 0.5
      const ry = 10 + b - swing - rightPunch * 0.6
      g.circle(lx, ly, 14)
      g.fill(0xe63946)
      g.circle(rx, ry, 14)
      g.fill(0xe63946)
      g.circle(lx, ly, 7)
      g.fill({ color: 0xffffff, alpha: 0.35 })
      g.circle(rx, ry, 7)
      g.fill({ color: 0xffffff, alpha: 0.35 })
      // Impact stars on punch peaks
      if (leftPunch > 20 || rightPunch > 20) {
        const ix = leftPunch > rightPunch ? lx - 18 : rx + 18
        const iy = leftPunch > rightPunch ? ly : ry
        for (let i = 0; i < 4; i++) {
          const ang = (i / 4) * Math.PI * 2 + this.time * 8
          g.circle(ix + Math.cos(ang) * 12, iy + Math.sin(ang) * 10, 2.5)
          g.fill({ color: 0xf4d35e, alpha: 0.7 })
        }
      }
    }
  }

  private drawHeadLayer(fill: number, ear: number, b: number, earFlop = 0) {
    const g = this.head
    g.clear()
    const headY = -78 + b
    const earWiggle = earFlop || Math.sin(this.time * 2.6) * 4
    const talkBob = this.props.talking ? Math.sin(this.time * 14) * 2 : 0
    const browLift =
      this.props.reaction === 'laugh'
        ? 4
        : this.props.reaction === 'annoyed'
          ? -3
          : Math.sin(this.time * 1.8) * 1.2
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
    // Forehead fur tuft + brow ridges for more facial depth
    g.moveTo(-8, headY - 52 + talkBob)
    g.quadraticCurveTo(0, headY - 68 + talkBob + browLift, 8, headY - 52 + talkBob)
    g.stroke({ width: 5, color: fill, cap: 'round' })
    g.ellipse(-22, headY - 18 + talkBob + browLift, 16, 5)
    g.fill({ color: 0x000000, alpha: 0.08 })
    g.ellipse(22, headY - 18 + talkBob + browLift, 16, 5)
    g.fill({ color: 0x000000, alpha: 0.08 })
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
    mouthOpen = 0,
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
      const eyeOpen = mood === 'tired' || mood === 'sick' ? 6 : 12
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
    // Animated whiskers — secondary motion for MTT2-like face life
    const whiskerWave =
      talking || reaction === 'talk' || reaction === 'laugh'
        ? Math.sin(this.time * 14) * 3
        : Math.sin(this.time * 2.2) * 1.5
    const wY = headY + 18
    g.moveTo(-18, wY)
    g.quadraticCurveTo(-34, wY - 4 + whiskerWave, -48, wY - 2 + whiskerWave * 0.6)
    g.stroke({ width: 1.8, color: 0x243029, alpha: 0.45, cap: 'round' })
    g.moveTo(-18, wY + 4)
    g.quadraticCurveTo(-32, wY + 6 + whiskerWave * 0.5, -46, wY + 8 + whiskerWave * 0.4)
    g.stroke({ width: 1.8, color: 0x243029, alpha: 0.4, cap: 'round' })
    g.moveTo(18, wY)
    g.quadraticCurveTo(34, wY - 4 - whiskerWave, 48, wY - 2 - whiskerWave * 0.6)
    g.stroke({ width: 1.8, color: 0x243029, alpha: 0.45, cap: 'round' })
    g.moveTo(18, wY + 4)
    g.quadraticCurveTo(32, wY + 6 - whiskerWave * 0.5, 46, wY + 8 - whiskerWave * 0.4)
    g.stroke({ width: 1.8, color: 0x243029, alpha: 0.4, cap: 'round' })
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
      const open = 4 + mouthOpen * 14
      g.ellipse(0, mouthY + 4, 12, open)
      g.fill(0x3a1f1a)
    } else if (
      reaction === 'eat' ||
      reaction === 'eat_spicy' ||
      reaction === 'eat_sweet' ||
      reaction === 'eat_messy' ||
      reaction === 'eat_healthy'
    ) {
      const chomp = Math.max(2, mouthOpen * 10)
      g.ellipse(0, mouthY + 2, 10, 4 + chomp)
      g.fill(0x3a1f1a)
      if (reaction === 'eat_spicy') {
        g.moveTo(-8, mouthY - 8)
        g.lineTo(-2, mouthY - 18)
        g.lineTo(4, mouthY - 10)
        g.lineTo(10, mouthY - 20)
        g.stroke({ width: 3, color: 0xe63946, cap: 'round' })
      }
    } else if (reaction === 'laugh' || reaction === 'play' || mood === 'happy') {
      g.moveTo(-16, mouthY)
      g.quadraticCurveTo(0, mouthY + 16, 16, mouthY)
      g.stroke({ width: 4, color: 0x243029, cap: 'round' })
    } else if (mood === 'sick') {
      g.ellipse(0, mouthY + 4, 10, 7)
      g.fill({ color: 0x3a1f1a, alpha: 0.85 })
      g.ellipse(-34, headY + 10, 5, 7)
      g.fill({ color: 0x90e0ef, alpha: 0.45 })
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

    if (reaction === 'cure') {
      const pulse = 0.4 + Math.abs(Math.sin(this.time * 10)) * 0.4
      g.roundRect(-8, headY - 50, 16, 28, 4)
      g.fill({ color: 0x5cb88a, alpha: 0.85 })
      g.roundRect(-3, headY - 44, 6, 16, 2)
      g.fill({ color: 0xffffff, alpha: pulse })
      g.roundRect(-8, headY - 36, 16, 6, 2)
      g.fill({ color: 0xffffff, alpha: pulse })
      g.circle(40, headY - 10, 4 + Math.sin(this.time * 12) * 1.5)
      g.fill({ color: 0x5cb88a, alpha: 0.5 })
      g.circle(-42, headY + 4, 3)
      g.fill({ color: 0xffffff, alpha: 0.55 })
    }

    if (reaction === 'eat_sweet') {
      g.ellipse(-34, headY + 18, 8, 5)
      g.fill({ color: 0xff8fab, alpha: 0.45 })
      g.ellipse(34, headY + 18, 8, 5)
      g.fill({ color: 0xff8fab, alpha: 0.45 })
    }
    if (reaction === 'eat_healthy') {
      g.ellipse(0, headY - 40, 10, 6)
      g.fill({ color: 0x80ed99, alpha: 0.55 })
    }
    if (reaction === 'eat_messy') {
      g.circle(-18, mouthY + 10, 3)
      g.fill({ color: 0xe76f51, alpha: 0.5 })
      g.circle(14, mouthY + 12, 2.5)
      g.fill({ color: 0xe9b44c, alpha: 0.45 })
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
      const beat = Math.abs(Math.sin(this.time * 18))
      g.roundRect(-34, 68 + b, 68, 32, 8)
      g.fill(0xb56b45)
      g.ellipse(0, 74 + b, 28, 12)
      g.fill(0xe63946)
      g.ellipse(0, 74 + b, 18, 7)
      g.fill(0xf4d35e)
      g.circle(-42, 48 + b + Math.sin(this.time * 20) * 10, 9)
      g.fill(0x333333)
      g.circle(42, 48 + b + Math.sin(this.time * 20 + Math.PI) * 10, 9)
      g.fill(0x333333)
      // Beat spark crumbs
      if (beat > 0.85) {
        for (let i = 0; i < 5; i++) {
          g.circle((i - 2) * 10, 40 + b - beat * 16, 2.5)
          g.fill({ color: 0xf4d35e, alpha: 0.65 })
        }
      }
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

  /** Room-toy juice — cook / bath / brush / potty / swing / tv / sleep / fountain / cinema / sandbox. */
  pulseRoomProp(
    kind:
      | 'cook'
      | 'fountain'
      | 'bath'
      | 'brush'
      | 'potty'
      | 'medicine'
      | 'swing'
      | 'tv'
      | 'sleep'
      | 'sandbox'
      | 'cinema'
      | 'console',
  ) {
    const w = this.app.screen.width
    const h = this.app.screen.height
    const origins: Record<typeof kind, { x: number; y: number; color: number; n: number }> = {
      cook: { x: w * 0.74, y: h * 0.4, color: 0xffbe0b, n: 12 },
      fountain: { x: w * 0.82, y: h * 0.52, color: 0x4cc9f0, n: 16 },
      bath: { x: w * 0.2, y: h * 0.5, color: 0xffffff, n: 14 },
      brush: { x: w * 0.78, y: h * 0.4, color: 0x4cc9f0, n: 10 },
      potty: { x: w * 0.5, y: h * 0.48, color: 0x90e0ef, n: 8 },
      medicine: { x: w * 0.79, y: h * 0.17, color: 0x5cb88a, n: 12 },
      swing: { x: w * 0.2, y: h * 0.55, color: 0xffbe0b, n: 10 },
      tv: { x: w * 0.8, y: h * 0.28, color: 0x9b5de5, n: 12 },
      sleep: { x: w * 0.22, y: h * 0.38, color: 0xffe066, n: 8 },
      sandbox: { x: w * 0.68, y: h * 0.7, color: 0xe9c46a, n: 12 },
      cinema: { x: w * 0.5, y: h * 0.24, color: 0xe63946, n: 14 },
      console: { x: w * 0.8, y: h * 0.52, color: 0x00f5d4, n: 10 },
    }
    const o = origins[kind]
    if (kind === 'cook') this.cookT = 1.8
    else if (kind === 'fountain') this.fountainT = 1.6
    else if (kind === 'bath') this.bathPulseT = 1.5
    else if (kind === 'brush') this.brushPulseT = 1.4
    else if (kind === 'potty') this.pottyPulseT = 1.2
    else if (kind === 'medicine') this.medicinePulseT = 1.4
    else if (kind === 'swing') this.swingPulseT = 1.4
    else if (kind === 'tv') this.tvPulseT = 1.3
    else if (kind === 'sandbox') this.sandboxPulseT = 1.4
    else if (kind === 'cinema') this.cinemaPulseT = 2.4
    else if (kind === 'console') this.consolePulseT = 1.3
    else this.sleepPulseT = 1.6

    // Particles are drawn in pet-local fx space; convert screen → roughly centered pet space
    const localX = o.x - w * 0.5
    const localY = o.y - h * 0.45
    for (let i = 0; i < o.n; i++) {
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.5
      this.particles.push({
        x: localX + (Math.random() - 0.5) * 24,
        y: localY + (Math.random() - 0.5) * 18,
        vx: Math.cos(ang) * (25 + Math.random() * 40),
        vy: Math.sin(ang) * (30 + Math.random() * 40) - 15,
        life: 0,
        max: 0.55 + Math.random() * 0.55,
        color: Math.random() > 0.45 ? o.color : 0xffffff,
        size: 2 + Math.random() * 4,
        kind: kind === 'brush' || kind === 'tv' || kind === 'cinema' || kind === 'console' ? 'spark' : 'circle',
      })
    }
  }

  private onPokeImpulse = (ev: Event) => {
    const detail = (ev as CustomEvent<{ zone?: string; strength?: number }>).detail
    this.pokeJiggleT = 0.55
    this.pokeJiggleStrength = detail?.strength ?? 1
    this.pokeJiggleDir = detail?.zone === 'belly' ? -1 : 1
  }

  private spawnReactionFx(reaction: Reaction) {
    const bursts: Array<{
      n: number
      color: number
      kind: 'circle' | 'heart' | 'crumb' | 'spark'
      spread: number
    }> = []
    if (reaction === 'eat') bursts.push({ n: 10, color: 0xf4a261, kind: 'crumb', spread: 40 })
    if (reaction === 'eat_spicy') bursts.push({ n: 12, color: 0xe63946, kind: 'spark', spread: 55 })
    if (reaction === 'eat_sweet') bursts.push({ n: 10, color: 0xff85a1, kind: 'heart', spread: 45 })
    if (reaction === 'eat_messy') bursts.push({ n: 12, color: 0xe9b44c, kind: 'crumb', spread: 50 })
    if (reaction === 'eat_healthy') bursts.push({ n: 10, color: 0x80ed99, kind: 'spark', spread: 40 })
    if (reaction === 'cure') bursts.push({ n: 14, color: 0x5cb88a, kind: 'spark', spread: 55 })
    if (reaction === 'bath') bursts.push({ n: 14, color: 0xffffff, kind: 'circle', spread: 70 })
    if (reaction === 'laugh' || reaction === 'play')
      bursts.push({ n: 8, color: 0xff85a1, kind: 'heart', spread: 50 })
    if (reaction === 'brush') bursts.push({ n: 10, color: 0x4cc9f0, kind: 'spark', spread: 45 })
    if (reaction === 'potty') bursts.push({ n: 6, color: 0x90e0ef, kind: 'spark', spread: 30 })
    if (reaction === 'skill_drums') bursts.push({ n: 14, color: 0xf4d35e, kind: 'crumb', spread: 55 })
    if (reaction === 'skill_hoop') bursts.push({ n: 12, color: 0x4cc9f0, kind: 'spark', spread: 65 })
    if (reaction === 'skill_boxing') bursts.push({ n: 14, color: 0xe63946, kind: 'spark', spread: 70 })
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
    if (this.cookT > 0) this.cookT = Math.max(0, this.cookT - dt)
    if (this.fountainT > 0) this.fountainT = Math.max(0, this.fountainT - dt)
    if (this.bathPulseT > 0) this.bathPulseT = Math.max(0, this.bathPulseT - dt)
    if (this.medicinePulseT > 0) this.medicinePulseT = Math.max(0, this.medicinePulseT - dt)
    if (this.brushPulseT > 0) this.brushPulseT = Math.max(0, this.brushPulseT - dt)
    if (this.pottyPulseT > 0) this.pottyPulseT = Math.max(0, this.pottyPulseT - dt)
    if (this.swingPulseT > 0) this.swingPulseT = Math.max(0, this.swingPulseT - dt)
    if (this.tvPulseT > 0) this.tvPulseT = Math.max(0, this.tvPulseT - dt)
    if (this.sleepPulseT > 0) this.sleepPulseT = Math.max(0, this.sleepPulseT - dt)
    if (this.sandboxPulseT > 0) this.sandboxPulseT = Math.max(0, this.sandboxPulseT - dt)
    if (this.cinemaPulseT > 0) this.cinemaPulseT = Math.max(0, this.cinemaPulseT - dt)
    if (this.consolePulseT > 0) this.consolePulseT = Math.max(0, this.consolePulseT - dt)
    if (this.pokeJiggleT > 0) this.pokeJiggleT = Math.max(0, this.pokeJiggleT - dt)
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
    window.removeEventListener('petverse-poke-impulse', this.onPokeImpulse)
    this.host?.removeEventListener('pointermove', this.onPointerMove)
    this.host = null
    try {
      this.app.destroy(true, { children: true })
    } catch {
      /* ignore */
    }
  }
}
