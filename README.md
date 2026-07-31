# PetVerse

Browser virtual-pet game inspired by talking-pet care loops (original PetVerse IP).
Gameplay mirrors the My Talking Tom 2 loop: care routines, talk-back, plane travel, mini-games, outfits, companions, and skills.

## Run

```bash
npm install
npm run dev
```

## Features
- Care: drag-drop tray (spoon/soap/brush/pillow/ball) + feed menu (22 foods), sleep, bath, play, brush, potty + layered pet reactions / VFX
- Home rooms: Living, Kitchen, Bathroom, Bedroom, Backyard
- Talk-back mic (hold to record, pitch-shifted playback)
- Large wardrobe (~340 looks) + 150 furniture SKUs
- Mini-games: Space Trails (wrap edges, asteroids, comets, combos), Sky Race (rings/boosts/combos), Dunk-a-Pet, Build Your Plane (assemble + flight test)
- Interactive rooms: fridge/stove, tub/sink, bed/lamp, yard trampoline/swing, living TV/sofa
- Plane travel to 8 worlds with flight cutscene
- Daily missions with coin/fuel claims
- Collectible card album (24) from worlds, rooms, missions, and mini-games
- Photo booth snaps, multi-language UI (EN/ES/PT/FR/DE/RU/TR/AR)
- Companions with unique voices, skills (drums / hoop / boxing), seasonal events
- Optional mock rewarded ad / IAP boosts
- Capacitor Android packaging notes in `docs/ANDROID.md`

## Stack
Vite + React + TypeScript + PixiJS + Zustand (+ Capacitor-ready `webDir`)
