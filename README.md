# PetVerse

Browser virtual-pet game inspired by talking-pet care loops (original PetVerse IP).
Gameplay mirrors the My Talking Tom 2 loop: care routines, talk-back, plane travel, mini-games, outfits, companions, and skills.

## Run

```bash
npm install
npm run dev
```

## Features
- Care: feed menu (6 foods), sleep, bath, play, brush, potty + layered pet reactions
- Home rooms: Living, Kitchen, Bathroom, Bedroom
- Talk-back mic (hold to record, pitch-shifted playback)
- Wardrobe + furniture decoration (world unlocks included)
- Mini-games: Space Trails, Sky Race, Dunk-a-Pet, Build Your Plane
- Plane travel to 8 worlds with flight cutscene
- Companions, skills (drums / hoop / boxing), seasonal event bonus
- Optional mock rewarded ad / IAP boosts
- Capacitor Android packaging notes in `docs/ANDROID.md`

## Stack
Vite + React + TypeScript + PixiJS + Zustand (+ Capacitor-ready `webDir`)
