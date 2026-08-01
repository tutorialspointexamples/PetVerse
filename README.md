# PetVerse

Browser virtual-pet game inspired by talking-pet care loops (original PetVerse IP).
Gameplay mirrors the My Talking Tom 2 loop: care routines, talk-back, plane travel, mini-games, outfits, companions, and skills.

## Run

```bash
npm install
npm run dev
```

## Features
- Care: drag-drop tray (spoon/soap/brush/potty/pillow/ball) + feed menu (22 foods), sleep, bath, play, brush, potty + layered pet reactions / VFX
- Home rooms: Living, Kitchen, Bathroom, Bedroom, Backyard
- Talk-back mic (hold to record, pitch-shifted playback)
- Large wardrobe (600 looks) + 304 furniture SKUs
- Mini-games: Space Trails (waves, shield/magnet, portals, power skins, boost pads), Sky Race (rings/boosts/combos), Dunk-a-Pet (rim/swish/crowd), Build Your Plane (assemble + speed/handling/armor tradeoffs + flight test)
- Interactive rooms: fridge/stove cooking, tub/sink/toilet VFX, bed/lamp, yard trampoline/swing/fountain splash, living TV/sofa
- Plane travel to 8 worlds with flight cutscene + world spot micro-activities
- Daily missions with coin/fuel claims
- Collectible card album (25) with set-completion rewards (worlds / arcade / care / legend)
- Photo booth snaps, multi-language UI (EN/ES/PT/FR/DE/RU/TR/AR)
- Companions with unique voices + fetch play, skills (drums / hoop / boxing), seasonal login + daily event activities
- Pet puppet shared `derivePose()` (squash/stretch, breath, limb phase, mouth open)
- Optional mock rewarded ad / IAP boosts
- Capacitor Android packaging notes in `docs/ANDROID.md`

## Stack
Vite + React + TypeScript + PixiJS + Zustand (+ Capacitor-ready `webDir`)
