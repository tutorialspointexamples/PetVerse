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
- Home rooms: Living, Kitchen, Bathroom, Bedroom, Backyard, Cinema Lounge
- Talk-back mic (hold to record, pitch-shifted playback)
- Large wardrobe (600 looks) + 304 furniture SKUs
- Mini-games: Space Trails (waves, shield/magnet, portals, skins, on-screen D-pad), Sky Race, Dunk-a-Pet, Build Your Plane, Buddy Catch co-op
- Interactive rooms: fridge/stove cooking, tub/sink/toilet/medicine VFX, bed/lamp, yard trampoline/swing/fountain/sandbox/slide, living TV/sofa, cinema screen/console/seats
- Plane travel to 8 worlds with flight cutscene + world spot micro-activities
- Daily missions with coin/fuel claims
- Collectible card album (30) with set-completion rewards (worlds / arcade / care / legend)
- Photo booth snaps, multi-language UI (EN/ES/PT/FR/DE/RU/TR/AR) + shop catalog word i18n
- Companions with hunger/happiness meters, quick fetch, Buddy Catch co-op, and skill duo beats
- Skills: drums / hoop / boxing rhythm QTE (Easy/Normal/Hard) with SFX + cooldown
- Multi-bone soft puppet (ears/arms/jaw/legs/tail) + shared `derivePose()` + poke ragdoll
- Optional mock rewarded ad / IAP boosts (coins, fuel, style, Remove Ads)
- Capacitor Android packaging notes in `docs/ANDROID.md`

## Stack
Vite + React + TypeScript + PixiJS + Zustand (+ Capacitor-ready `webDir`)
