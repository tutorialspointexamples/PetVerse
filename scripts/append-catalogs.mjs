import fs from 'fs'

function appendToUnionAndArray(file, typeName, arrayName, items, itemFormatter) {
  let s = fs.readFileSync(file, 'utf8')
  const typeRe = new RegExp(`export type ${typeName} =([\\s\\S]*?)\\n\\nexport `)
  const tm = s.match(typeRe)
  if (!tm) throw new Error('type not found ' + typeName)
  const typeBody = tm[1]
  const existing = new Set([...typeBody.matchAll(/'([^']+)'/g)].map((m) => m[1]))
  const toAdd = items.filter((it) => !existing.has(it.id))
  if (!toAdd.length) {
    console.log(typeName, 'nothing to add')
    return 0
  }
  const typeInsert = toAdd.map((it) => `\n  | '${it.id}'`).join('')
  const typeEnd = tm.index + tm[0].length - '\n\nexport '.length
  const lastId = [...typeBody.matchAll(/\| '([^']+)'/g)].pop()
  if (!lastId) throw new Error('no ids in ' + typeName)
  const needle = `| '${lastId[1]}'`
  const pos = s.lastIndexOf(needle, typeEnd + 80)
  if (pos < 0) throw new Error('needle not found ' + needle)
  const insertAt = pos + needle.length
  s = s.slice(0, insertAt) + typeInsert + s.slice(insertAt)

  const marker = `export const ${arrayName}`
  const idx = s.indexOf(marker)
  if (idx < 0) throw new Error('array missing ' + arrayName)
  const eq = s.indexOf('= [', idx)
  const start = eq + 2
  let depth = 0
  let i = start
  let inStr = false
  let q = ''
  let esc = false
  for (; i < s.length; i++) {
    const c = s[i]
    if (inStr) {
      if (esc) esc = false
      else if (c === '\\') esc = true
      else if (c === q) inStr = false
      continue
    }
    if (c === '"' || c === "'" || c === '`') {
      inStr = true
      q = c
      continue
    }
    if (c === '[') depth++
    if (c === ']') {
      depth--
      if (depth === 0) break
    }
  }
  const beforeClose = s.lastIndexOf('\n', i)
  const entries = toAdd.map(itemFormatter).join('\n')
  s = s.slice(0, beforeClose) + '\n' + entries + s.slice(beforeClose)
  fs.writeFileSync(file, s)
  console.log(typeName, '+', toAdd.length)
  return toAdd.length
}

function countArray(file, name) {
  const s = fs.readFileSync(file, 'utf8')
  const marker = 'export const ' + name
  const idx = s.indexOf(marker)
  const eq = s.indexOf('= [', idx)
  const start = eq + 2
  let depth = 0
  let i = start
  let inStr = false
  let q = ''
  let esc = false
  for (; i < s.length; i++) {
    const c = s[i]
    if (inStr) {
      if (esc) esc = false
      else if (c === '\\') esc = true
      else if (c === q) inStr = false
      continue
    }
    if (c === '"' || c === "'" || c === '`') {
      inStr = true
      q = c
      continue
    }
    if (c === '[') depth++
    if (c === ']') {
      depth--
      if (depth === 0) {
        i++
        break
      }
    }
  }
  return (s.slice(start, i).match(/\bid:\s*['"]/g) || []).length
}

const hex = (n) => n.toString(16).padStart(6, '0')

const cos = 'src/game/cosmetics.ts'

appendToUnionAndArray(
  cos,
  'BodyColorId',
  'BODY_COLORS',
  [
    { id: 'nebula', name: 'Nebula', fill: 0x5a189a, belly: 0xd8bbff, ear: 0x9b5de5, price: 120 },
    { id: 'coralMist', name: 'Coral Mist', fill: 0xff8fab, belly: 0xffe5ec, ear: 0xffc2d1, price: 115 },
    { id: 'pine', name: 'Pine', fill: 0x2d6a4f, belly: 0xd8f3dc, ear: 0x95d5b2, price: 110 },
    { id: 'saffron', name: 'Saffron', fill: 0xffb703, belly: 0xfff3bf, ear: 0xfb8500, price: 118 },
    { id: 'iceberg', name: 'Iceberg', fill: 0xcaf0f8, belly: 0xffffff, ear: 0x90e0ef, price: 112 },
    { id: 'velvetNight', name: 'Velvet Night', fill: 0x3a0ca3, belly: 0xcbb2fe, ear: 0x7209b7, price: 130 },
    { id: 'butterscotch', name: 'Butterscotch', fill: 0xe9c46a, belly: 0xfff1c9, ear: 0xf4a261, price: 108 },
    { id: 'seafoamLite', name: 'Seafoam Lite', fill: 0x80ed99, belly: 0xe8fff0, ear: 0x57cc99, price: 114 },
  ],
  (it) =>
    `  { id: '${it.id}', name: '${it.name}', fill: 0x${hex(it.fill)}, belly: 0x${hex(it.belly)}, ear: 0x${hex(it.ear)}, price: ${it.price} },`,
)

appendToUnionAndArray(
  cos,
  'HatId',
  'HATS',
  [
    { id: 'hatComet', name: 'Comet Cap', price: 118, color: 0x00f5d4, style: 'cap' },
    { id: 'hatBalloon', name: 'Balloon Hat', price: 102, color: 0xff85a1, style: 'bow' },
    { id: 'hatLantern', name: 'Lantern Helm', price: 140, color: 0xffbe0b, style: 'knight' },
    { id: 'capCitrus', name: 'Citrus Cap', price: 96, color: 0xffbe0b, style: 'cap' },
    { id: 'hatLeafSoft', name: 'Soft Leaf Crown', price: 110, color: 0x80ed99, style: 'flower' },
    { id: 'beanieAurora', name: 'Aurora Beanie', price: 124, color: 0x9b5de5, style: 'beanie' },
    { id: 'helmNebula', name: 'Nebula Helm', price: 150, color: 0x5a189a, style: 'diver' },
    { id: 'hatCupcake', name: 'Cupcake Hat', price: 108, color: 0xffc8dd, style: 'party' },
    { id: 'capWaveSoft', name: 'Wave Cap', price: 100, color: 0x4cc9f0, style: 'cap' },
    { id: 'bowCrystal', name: 'Crystal Bow', price: 112, color: 0xcaf0f8, style: 'bow' },
  ],
  (it) =>
    `  { id: '${it.id}', name: '${it.name}', price: ${it.price}, color: 0x${hex(it.color)}, style: '${it.style}' },`,
)

appendToUnionAndArray(
  cos,
  'GlassesId',
  'GLASSES',
  [
    { id: 'lensComet', name: 'Comet Lenses', price: 88, color: 0x00f5d4 },
    { id: 'goggleAurora', name: 'Aurora Goggles', price: 96, color: 0x9b5de5 },
    { id: 'specsButter', name: 'Butter Specs', price: 78, color: 0xe9c46a },
    { id: 'visorMist', name: 'Mist Visor', price: 90, color: 0x90e0ef },
    { id: 'framesPine', name: 'Pine Frames', price: 82, color: 0x2d6a4f },
    { id: 'lensRubySoft', name: 'Soft Ruby Lens', price: 94, color: 0xe63946 },
    { id: 'goggleCandy', name: 'Candy Goggles', price: 86, color: 0xff85a1 },
    { id: 'specsPixelSoft', name: 'Soft Pixel Specs', price: 92, color: 0x00ff88 },
  ],
  (it) => `  { id: '${it.id}', name: '${it.name}', price: ${it.price}, color: 0x${hex(it.color)} },`,
)

appendToUnionAndArray(
  cos,
  'ScarfId',
  'SCARVES',
  [
    { id: 'scarfComet', name: 'Comet Scarf', price: 76, color: 0x00f5d4 },
    { id: 'capeAurora', name: 'Aurora Cape', price: 98, color: 0x9b5de5 },
    { id: 'scarfPine', name: 'Pine Scarf', price: 72, color: 0x2d6a4f },
    { id: 'bowtieCandy', name: 'Candy Bowtie', price: 68, color: 0xff85a1 },
    { id: 'scarfButter', name: 'Butter Scarf', price: 74, color: 0xe9c46a },
    { id: 'leiMist', name: 'Mist Lei', price: 70, color: 0x90e0ef },
    { id: 'scarfNebula', name: 'Nebula Scarf', price: 88, color: 0x5a189a },
    { id: 'ruffCrystal', name: 'Crystal Ruff', price: 84, color: 0xcaf0f8 },
  ],
  (it) => `  { id: '${it.id}', name: '${it.name}', price: ${it.price}, color: 0x${hex(it.color)} },`,
)

appendToUnionAndArray(
  cos,
  'ShirtId',
  'SHIRTS',
  [
    { id: 'shirtComet', name: 'Comet Tee', price: 92, color: 0x00f5d4 },
    { id: 'hoodieAurora', name: 'Aurora Hoodie', price: 118, color: 0x9b5de5 },
    { id: 'shirtPine', name: 'Pine Shirt', price: 96, color: 0x2d6a4f },
    { id: 'teeCandyStripe', name: 'Candy Stripe Tee', price: 90, color: 0xff85a1 },
    { id: 'shirtButter', name: 'Butter Shirt', price: 94, color: 0xe9c46a },
    { id: 'tankMist', name: 'Mist Tank', price: 86, color: 0x90e0ef },
    { id: 'hoodieNebula', name: 'Nebula Hoodie', price: 122, color: 0x5a189a },
    { id: 'teeCrystal', name: 'Crystal Tee', price: 98, color: 0xcaf0f8 },
    { id: 'shirtWaveSoft', name: 'Wave Soft Shirt', price: 100, color: 0x4cc9f0 },
    { id: 'hoodieLeaf', name: 'Leaf Hoodie', price: 110, color: 0x80ed99 },
  ],
  (it) => `  { id: '${it.id}', name: '${it.name}', price: ${it.price}, color: 0x${hex(it.color)} },`,
)

appendToUnionAndArray(
  cos,
  'ShoesId',
  'SHOES',
  [
    { id: 'shoesComet', name: 'Comet Sneakers', price: 88, color: 0x00f5d4 },
    { id: 'bootsAurora', name: 'Aurora Boots', price: 104, color: 0x9b5de5 },
    { id: 'shoesPine', name: 'Pine Shoes', price: 86, color: 0x2d6a4f },
    { id: 'sneakersCandy', name: 'Candy Sneakers', price: 90, color: 0xff85a1 },
    { id: 'bootsButter', name: 'Butter Boots', price: 96, color: 0xe9c46a },
    { id: 'shoesMist', name: 'Mist Shoes', price: 84, color: 0x90e0ef },
    { id: 'sneakersNebula', name: 'Nebula Sneakers', price: 108, color: 0x5a189a },
    { id: 'bootsCrystal', name: 'Crystal Boots', price: 100, color: 0xcaf0f8 },
  ],
  (it) => `  { id: '${it.id}', name: '${it.name}', price: ${it.price}, color: 0x${hex(it.color)} },`,
)

appendToUnionAndArray(
  'src/game/furniture.ts',
  'FurnitureId',
  'FURNITURE',
  [
    { id: 'rug_comet', name: 'Comet Rug', price: 125, slot: 'floor', color: 0x00f5d4, accent: 0xffffff },
    { id: 'bed_aurora', name: 'Aurora Bed', price: 240, slot: 'side', color: 0x9b5de5, accent: 0xffffff },
    { id: 'sofa_pine', name: 'Pine Sofa', price: 200, slot: 'side', color: 0x2d6a4f, accent: 0x95d5b2 },
    { id: 'lamp_candy', name: 'Candy Lamp', price: 130, slot: 'side', color: 0xff85a1, accent: 0xffffff },
    { id: 'poster_butter', name: 'Butter Poster', price: 60, slot: 'wall', color: 0xe9c46a, accent: 0xffffff },
    { id: 'plant_mist', name: 'Mist Plant', price: 105, slot: 'side', color: 0x90e0ef, accent: 0x80ed99 },
    { id: 'shelf_nebula', name: 'Nebula Shelf', price: 160, slot: 'wall', color: 0x5a189a, accent: 0xf4d35e },
    { id: 'table_crystal', name: 'Crystal Table', price: 135, slot: 'floor', color: 0xcaf0f8, accent: 0xffffff },
    { id: 'chair_wave', name: 'Wave Chair', price: 155, slot: 'side', color: 0x4cc9f0, accent: 0xffffff },
    { id: 'fountain_comet', name: 'Comet Fountain', price: 190, slot: 'floor', color: 0x00f5d4, accent: 0x9b5de5 },
    { id: 'clock_aurora', name: 'Aurora Clock', price: 115, slot: 'wall', color: 0x9b5de5, accent: 0xffffff },
    { id: 'toy_pine', name: 'Pine Plush', price: 95, slot: 'floor', color: 0x2d6a4f, accent: 0xffffff },
    { id: 'cushion_candy', name: 'Candy Cushion', price: 85, slot: 'floor', color: 0xff85a1, accent: 0xffffff },
    { id: 'mirror_butter', name: 'Butter Mirror', price: 145, slot: 'wall', color: 0xe9c46a, accent: 0xffffff },
    { id: 'rug_mist', name: 'Mist Rug', price: 120, slot: 'floor', color: 0x90e0ef, accent: 0xffffff },
    { id: 'bed_nebula', name: 'Nebula Bed', price: 245, slot: 'side', color: 0x5a189a, accent: 0x00f5d4 },
    { id: 'sofa_crystal', name: 'Crystal Sofa', price: 210, slot: 'side', color: 0xcaf0f8, accent: 0xffffff },
    { id: 'lamp_wave', name: 'Wave Lamp', price: 135, slot: 'side', color: 0x4cc9f0, accent: 0xffffff },
    { id: 'poster_comet', name: 'Comet Poster', price: 62, slot: 'wall', color: 0x00f5d4, accent: 0xffffff },
    { id: 'plant_aurora', name: 'Aurora Plant', price: 112, slot: 'side', color: 0x9b5de5, accent: 0x80ed99 },
    { id: 'cabinet_pine', name: 'Pine Cabinet', price: 170, slot: 'side', color: 0x2d6a4f, accent: 0xffffff },
    { id: 'ottoman_candy', name: 'Candy Ottoman', price: 100, slot: 'floor', color: 0xff85a1, accent: 0xffffff },
    { id: 'desk_butter', name: 'Butter Desk', price: 175, slot: 'side', color: 0xe9c46a, accent: 0xffffff },
    { id: 'wall_art_mist', name: 'Mist Art', price: 70, slot: 'wall', color: 0x90e0ef, accent: 0xffffff },
    { id: 'rug_nebula_soft', name: 'Soft Nebula Rug', price: 138, slot: 'floor', color: 0x5a189a, accent: 0xf4d35e },
    { id: 'bed_crystal', name: 'Crystal Bed', price: 248, slot: 'side', color: 0xcaf0f8, accent: 0x4cc9f0 },
    { id: 'sofa_wave', name: 'Wave Sofa', price: 205, slot: 'side', color: 0x4cc9f0, accent: 0xffffff },
    { id: 'lamp_pine', name: 'Pine Lamp', price: 128, slot: 'side', color: 0x2d6a4f, accent: 0xffe066 },
    { id: 'poster_aurora', name: 'Aurora Poster', price: 64, slot: 'wall', color: 0x9b5de5, accent: 0xffffff },
    { id: 'toy_comet', name: 'Comet Toy', price: 92, slot: 'floor', color: 0x00f5d4, accent: 0xff006e },
  ],
  (it) =>
    `  { id: '${it.id}', name: '${it.name}', price: ${it.price}, slot: '${it.slot}', color: 0x${hex(it.color)}, accent: 0x${hex(it.accent)} },`,
)

const names = ['BODY_COLORS', 'HATS', 'GLASSES', 'SCARVES', 'SHIRTS', 'SHOES']
const c = Object.fromEntries(names.map((n) => [n, countArray(cos, n)]))
console.log({
  ...c,
  furniture: countArray('src/game/furniture.ts', 'FURNITURE'),
  wearables: Object.values(c).reduce((a, b) => a + b, 0),
})
