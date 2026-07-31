import { Application, Container, Graphics, Text } from 'pixi.js'
import {
  getBodyColor,
  getGlasses,
  getHat,
  getScarf,
  getShirt,
  type BodyColorId,
  type GlassesId,
  type HatId,
  type ScarfId,
  type ShirtId,
} from './cosmetics'
import { getFurniture, type FurnitureId } from './furniture'
import { getCompanion, type CompanionId } from './progress'
import { deriveMood, type Needs } from './needs'
import type { Reaction } from '../state/gameStore'

export interface PetSceneProps {
  needs: Needs
  bodyColor: BodyColorId
  hat: HatId
  glasses: GlassesId
  scarf: ScarfId
  shirt: ShirtId
  reaction: Reaction
  sleeping: boolean
  talking: boolean
  petName: string
  placedFurniture: FurnitureId[]
  companion: CompanionId
}

export type PokeZone = 'head' | 'belly' | 'companion'

export class PetScene {
  readonly app: Application
  private root = new Container()
  private roomBack = new Graphics()
  private furnitureLayer = new Graphics()
  private roomFront = new Graphics()
  private pet = new Container()
  private shadow = new Graphics()
  private legs = new Graphics()
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
  private props: PetSceneProps
  private onPoke: (zone: PokeZone) => void
  private disposed = false
  private ready = false

  constructor(canvasParent: HTMLElement, props: PetSceneProps, onPoke: (zone: PokeZone) => void) {
    this.props = props
    this.onPoke = onPoke
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
      this.pet,
      this.companionGfx,
      this.companionHit,
      this.roomFront,
      this.nameTag,
    )
    this.pet.addChild(
      this.shadow,
      this.legs,
      this.body,
      this.shirtGfx,
      this.arms,
      this.head,
      this.scarfGfx,
      this.face,
      this.glassesGfx,
      this.hatGfx,
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
    this.headHit.on('pointertap', () => this.onPoke('head'))
    this.bellyHit.on('pointertap', () => this.onPoke('belly'))
    this.companionHit.on('pointertap', () => this.onPoke('companion'))

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
    this.drawCompanion(w, h)
  }

  private drawRoom(w: number, h: number) {
    const back = this.roomBack
    const front = this.roomFront
    back.clear()
    front.clear()

    // Parallax wall wash
    back.rect(0, 0, w, h * 0.62)
    back.fill(0x2f6f5e)
    back.rect(0, 0, w, h * 0.62)
    back.fill({ color: 0x4a9b82, alpha: 0.28 })

    // Window
    const wx = w * 0.72
    const wy = h * 0.12
    const ww = Math.min(160, w * 0.22)
    const wh = Math.min(120, h * 0.2)
    back.roundRect(wx, wy, ww, wh, 12)
    back.fill(0x9fd7ff)
    back.stroke({ width: 6, color: 0xf2e8d5 })
    back.moveTo(wx + ww / 2, wy)
    back.lineTo(wx + ww / 2, wy + wh)
    back.moveTo(wx, wy + wh / 2)
    back.lineTo(wx + ww, wy + wh / 2)
    back.stroke({ width: 4, color: 0xf2e8d5, alpha: 0.9 })

    // Soft light shaft
    back.moveTo(wx, wy + wh)
    back.lineTo(wx + ww, wy + wh)
    back.lineTo(wx + ww + 40, h * 0.62)
    back.lineTo(wx - 20, h * 0.62)
    back.closePath()
    back.fill({ color: 0xfff6d8, alpha: 0.12 })

    // Floor
    back.rect(0, h * 0.62, w, h * 0.38)
    back.fill(0xc4a574)
    back.rect(0, h * 0.62, w, 14)
    back.fill(0xa8885a)

    // Depth board at bottom
    front.rect(0, h * 0.92, w, h * 0.08)
    front.fill({ color: 0x1a2a22, alpha: 0.12 })
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
        } else if (id === 'ball_pile') {
          g.circle(w * 0.62, floorY + 10, 12)
          g.fill(item.color)
          g.circle(w * 0.65, floorY + 4, 10)
          g.fill(item.accent)
          g.circle(w * 0.59, floorY + 2, 9)
          g.fill(0xf4d35e)
        } else if (id === 'cushion') {
          g.ellipse(w * 0.28, floorY + 8, 36, 20)
          g.fill(item.color)
          g.ellipse(w * 0.28, floorY + 4, 24, 12)
          g.fill(item.accent)
        }
      } else if (item.slot === 'wall') {
        const x = id.includes('moon') ? w * 0.18 : w * 0.08
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
        }
      } else {
        const x = sideIndex % 2 === 0 ? w * 0.14 : w * 0.86
        const y = floorY - 10
        sideIndex++
        if (id.startsWith('bed')) {
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
    const { reaction } = this.props
    if (reaction === 'laugh' || reaction === 'play' || reaction.startsWith('skill_')) {
      return Math.sin(this.time * 16) * 5
    }
    if (reaction === 'eat') return Math.sin(this.time * 12) * 2
    return Math.sin(this.time * 2.2) * 3
  }

  private redraw() {
    if (!this.ready || this.disposed) return
    const { needs, bodyColor, hat, glasses, scarf, shirt, reaction, sleeping, talking, petName } =
      this.props
    const color = getBodyColor(bodyColor)
    const mood = deriveMood(needs)
    const scale = this.app.screen.width < 480 ? 0.82 : 1
    this.pet.scale.set(scale)
    this.nameTag.text = petName || 'Your Pet'
    const b = this.bounce()

    this.drawShadow(b)
    this.drawLegs(color.fill, b)
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
  }

  private drawBodyLayer(fill: number, belly: number, ear: number, mood: string, b: number) {
    const g = this.body
    g.clear()
    g.ellipse(0, 28 + b, 78, 92)
    g.fill(fill)
    // Depth shade
    g.ellipse(18, 40 + b, 40, 70)
    g.fill({ color: 0x000000, alpha: 0.06 })
    g.ellipse(0, 42 + b, 48, 58)
    g.fill(belly)

    // Tail
    const wag = Math.sin(this.time * (mood === 'happy' ? 6 : 2.5)) * 10
    g.moveTo(70, 50 + b)
    g.quadraticCurveTo(110 + wag, 10 + b, 98 + wag * 0.4, -20 + b)
    g.stroke({ width: 16, color: fill, cap: 'round' })

    if (mood === 'dirty' || this.props.needs.cleanliness < 40) {
      g.circle(-20, 50 + b, 6)
      g.fill({ color: 0x6b4f3a, alpha: 0.35 })
      g.circle(24, 66 + b, 5)
      g.fill({ color: 0x6b4f3a, alpha: 0.3 })
    }
    void ear
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
    }
  }

  private drawArms(fill: number, reaction: Reaction, b: number) {
    const g = this.arms
    g.clear()
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
    if (reaction === 'skill_hoop') {
      g.circle(0, -20 + b + Math.sin(this.time * 10) * 20, 28)
      g.stroke({ width: 5, color: 0xf4d35e })
    }
  }

  private drawHeadLayer(fill: number, ear: number, b: number) {
    const g = this.head
    g.clear()
    const headY = -78 + b
    g.circle(0, headY, 62)
    g.fill(fill)
    g.circle(16, headY + 6, 40)
    g.fill({ color: 0x000000, alpha: 0.05 })

    g.moveTo(-48, headY - 42)
    g.lineTo(-68, headY - 98)
    g.lineTo(-18, headY - 58)
    g.closePath()
    g.fill(fill)
    g.moveTo(-48, headY - 48)
    g.lineTo(-58, headY - 84)
    g.lineTo(-30, headY - 58)
    g.closePath()
    g.fill(ear)

    g.moveTo(48, headY - 42)
    g.lineTo(68, headY - 98)
    g.lineTo(18, headY - 58)
    g.closePath()
    g.fill(fill)
    g.moveTo(48, headY - 48)
    g.lineTo(58, headY - 84)
    g.lineTo(30, headY - 58)
    g.closePath()
    g.fill(ear)
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
    const blink = this.blinkT > 0 && this.blinkT < 0.12

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
      const eyeOpen = mood === 'tired' ? 5 : 9
      g.ellipse(-20, headY - 2, 8, eyeOpen)
      g.fill(0x243029)
      g.ellipse(20, headY - 2, 8, eyeOpen)
      g.fill(0x243029)
      g.circle(-17, headY - 5, 2.5)
      g.fill(0xffffff)
      g.circle(23, headY - 5, 2.5)
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

    g.moveTo(0, headY + 10)
    g.lineTo(-7, headY + 18)
    g.lineTo(7, headY + 18)
    g.closePath()
    g.fill(0xe76f51)

    const mouthY = headY + 28
    if (talking || reaction === 'talk') {
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

    g.moveTo(-18, headY + 20)
    g.lineTo(-58, headY + 12)
    g.moveTo(-18, headY + 26)
    g.lineTo(-58, headY + 28)
    g.moveTo(18, headY + 20)
    g.lineTo(58, headY + 12)
    g.moveTo(18, headY + 26)
    g.lineTo(58, headY + 28)
    g.stroke({ width: 2, color: 0x243029, alpha: 0.45, cap: 'round' })

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
    g.ellipse(0, -28 + b, 48, 14)
    g.fill(c)
    g.roundRect(-8, -20 + b, 14, 40, 4)
    g.fill(c)
    if (scarf === 'striped') {
      g.rect(-8, -10 + b, 14, 6)
      g.fill(0xffffff)
      g.rect(-8, 6 + b, 14, 6)
      g.fill(0xffffff)
    }
  }

  private drawGlassesLayer(glasses: GlassesId, b: number) {
    const g = this.glassesGfx
    g.clear()
    if (glasses === 'none') return
    const c = getGlasses(glasses).color
    const y = -80 + b
    if (glasses === 'sun') {
      g.ellipse(-20, y, 14, 10)
      g.fill({ color: c, alpha: 0.85 })
      g.ellipse(20, y, 14, 10)
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
    } else {
      g.circle(-20, y, 12)
      g.stroke({ width: 3, color: c })
      g.circle(20, y, 12)
      g.stroke({ width: 3, color: c })
    }
    g.moveTo(-8, y)
    g.lineTo(8, y)
    g.stroke({ width: 2, color: c })
  }

  private drawHatLayer(hat: HatId, b: number) {
    const g = this.hatGfx
    g.clear()
    if (hat === 'none') return
    const y = -132 + b
    const col = getHat(hat).color

    if (hat === 'cap' || hat === 'sailor') {
      g.ellipse(0, y + 18, 48, 14)
      g.fill(col)
      g.roundRect(-40, y - 8, 70, 28, 10)
      g.fill(hat === 'sailor' ? 0xffffff : 0x3d8ebd)
      if (hat === 'sailor') {
        g.rect(-10, y - 4, 20, 8)
        g.fill(col)
      }
    } else if (hat === 'bow') {
      g.ellipse(-18, y + 8, 16, 12)
      g.fill(col)
      g.ellipse(18, y + 8, 16, 12)
      g.fill(col)
      g.circle(0, y + 8, 8)
      g.fill(0xb5172a)
    } else if (hat === 'crown') {
      g.moveTo(-32, y + 18)
      g.lineTo(-24, y - 8)
      g.lineTo(-12, y + 10)
      g.lineTo(0, y - 16)
      g.lineTo(12, y + 10)
      g.lineTo(24, y - 8)
      g.lineTo(32, y + 18)
      g.closePath()
      g.fill(col)
    } else if (hat === 'beanie') {
      g.ellipse(0, y + 20, 46, 16)
      g.fill(0x7b2cbf)
      g.roundRect(-42, y - 4, 84, 30, 16)
      g.fill(col)
      g.circle(0, y - 10, 8)
      g.fill(0xf15bb5)
    } else if (hat === 'flower') {
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2
        g.circle(Math.cos(a) * 12 - 36, y + 30 + Math.sin(a) * 12, 8)
        g.fill(col)
      }
      g.circle(-36, y + 30, 6)
      g.fill(0xffe066)
    } else if (hat === 'topHat') {
      g.ellipse(0, y + 22, 40, 10)
      g.fill(col)
      g.roundRect(-22, y - 30, 44, 50, 4)
      g.fill(col)
      g.rect(-22, y + 4, 44, 8)
      g.fill(0xe63946)
    } else if (hat === 'party') {
      g.moveTo(0, y - 30)
      g.lineTo(-28, y + 18)
      g.lineTo(28, y + 18)
      g.closePath()
      g.fill(col)
      g.circle(0, y - 30, 6)
      g.fill(0xf4d35e)
    } else if (hat === 'halo') {
      g.ellipse(0, y - 10, 36, 10)
      g.stroke({ width: 4, color: col })
    } else if (hat === 'bandana') {
      g.ellipse(0, y + 28, 50, 12)
      g.fill(col)
      g.moveTo(30, y + 28)
      g.lineTo(48, y + 50)
      g.lineTo(22, y + 36)
      g.closePath()
      g.fill(col)
    } else if (hat === 'wizard') {
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
    }
  }

  private update(dt: number) {
    if (!this.ready || this.disposed) return
    this.time += dt
    this.blinkT += dt
    if (this.blinkT > 3.2) this.blinkT = 0
    if (this.props.sleeping) {
      this.zzz.position.set(48, -150 + Math.sin(this.time * 2) * 8)
      this.zzz.alpha = 0.55 + Math.sin(this.time * 3) * 0.25
      this.zzz.scale.set(0.9 + Math.sin(this.time * 2.5) * 0.15)
    }
    this.drawCompanion(this.app.screen.width, this.app.screen.height)
    this.redraw()
  }

  destroy() {
    this.disposed = true
    this.ready = false
    window.removeEventListener('resize', this.layout)
    try {
      this.app.destroy(true, { children: true })
    } catch {
      /* ignore */
    }
  }
}
