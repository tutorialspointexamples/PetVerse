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
    { id: 'mangoDusk', name: 'Mango Dusk', fill: 0xff9f1c, belly: 0xffe5b4, ear: 0xf77f00, price: 116 },
    { id: 'lagoon', name: 'Lagoon', fill: 0x00bbf9, belly: 0xd0f4ff, ear: 0x0096c7, price: 118 },
    { id: 'plumGlow', name: 'Plum Glow', fill: 0x7b2cbf, belly: 0xe0aaff, ear: 0x9d4edd, price: 122 },
    { id: 'sandstone', name: 'Sandstone', fill: 0xc9a227, belly: 0xfff1c9, ear: 0xa68a00, price: 110 },
    { id: 'frostMint', name: 'Frost Mint', fill: 0x80ffdb, belly: 0xf0fff8, ear: 0x56cfe1, price: 114 },
    { id: 'emberRose', name: 'Ember Rose', fill: 0xff4d6d, belly: 0xffccd5, ear: 0xc9184a, price: 120 },
  ],
  (it) =>
    `  { id: '${it.id}', name: '${it.name}', fill: 0x${hex(it.fill)}, belly: 0x${hex(it.belly)}, ear: 0x${hex(it.ear)}, price: ${it.price} },`,
)

appendToUnionAndArray(
  cos,
  'HatId',
  'HATS',
  [
    { id: 'hatMango', name: 'Mango Cap', price: 104, color: 0xff9f1c, style: 'cap' },
    { id: 'hatLagoon', name: 'Lagoon Beanie', price: 112, color: 0x00bbf9, style: 'beanie' },
    { id: 'hatPlum', name: 'Plum Crown', price: 128, color: 0x7b2cbf, style: 'flower' },
    { id: 'helmSand', name: 'Sand Helm', price: 136, color: 0xc9a227, style: 'knight' },
    { id: 'hatFrost', name: 'Frost Bow', price: 108, color: 0x80ffdb, style: 'bow' },
    { id: 'hatEmber', name: 'Ember Party', price: 118, color: 0xff4d6d, style: 'party' },
    { id: 'capTide', name: 'Tide Cap', price: 100, color: 0x48cae4, style: 'cap' },
    { id: 'hatOrbit', name: 'Orbit Visor', price: 142, color: 0x7209b7, style: 'visor' },
  ],
  (it) =>
    `  { id: '${it.id}', name: '${it.name}', price: ${it.price}, color: 0x${hex(it.color)}, style: '${it.style}' },`,
)

appendToUnionAndArray(
  cos,
  'GlassesId',
  'GLASSES',
  [
    { id: 'lensMango', name: 'Mango Specs', price: 84, color: 0xff9f1c },
    { id: 'goggleLagoon', name: 'Lagoon Goggles', price: 92, color: 0x00bbf9 },
    { id: 'framesPlum', name: 'Plum Frames', price: 88, color: 0x7b2cbf },
    { id: 'visorSand', name: 'Sand Visor', price: 96, color: 0xc9a227 },
    { id: 'lensFrost', name: 'Frost Lenses', price: 90, color: 0x80ffdb },
    { id: 'goggleEmber', name: 'Ember Goggles', price: 94, color: 0xff4d6d },
    { id: 'specsTide', name: 'Tide Specs', price: 82, color: 0x48cae4 },
    { id: 'framesOrbit', name: 'Orbit Frames', price: 98, color: 0x7209b7 },
  ],
  (it) => `  { id: '${it.id}', name: '${it.name}', price: ${it.price}, color: 0x${hex(it.color)} },`,
)

appendToUnionAndArray(
  cos,
  'ScarfId',
  'SCARVES',
  [
    { id: 'scarfMango', name: 'Mango Scarf', price: 74, color: 0xff9f1c },
    { id: 'capeLagoon', name: 'Lagoon Cape', price: 96, color: 0x00bbf9 },
    { id: 'scarfPlum', name: 'Plum Scarf', price: 80, color: 0x7b2cbf },
    { id: 'bowtieSand', name: 'Sand Bowtie', price: 70, color: 0xc9a227 },
    { id: 'leiFrost', name: 'Frost Lei', price: 72, color: 0x80ffdb },
    { id: 'scarfEmber', name: 'Ember Scarf', price: 86, color: 0xff4d6d },
    { id: 'ruffTide', name: 'Tide Ruff', price: 78, color: 0x48cae4 },
    { id: 'capeOrbit', name: 'Orbit Cape', price: 102, color: 0x7209b7 },
  ],
  (it) => `  { id: '${it.id}', name: '${it.name}', price: ${it.price}, color: 0x${hex(it.color)} },`,
)

appendToUnionAndArray(
  cos,
  'ShirtId',
  'SHIRTS',
  [
    { id: 'shirtMango', name: 'Mango Tee', price: 94, color: 0xff9f1c },
    { id: 'hoodieLagoon', name: 'Lagoon Hoodie', price: 116, color: 0x00bbf9 },
    { id: 'shirtPlum', name: 'Plum Shirt', price: 98, color: 0x7b2cbf },
    { id: 'teeSand', name: 'Sand Tee', price: 90, color: 0xc9a227 },
    { id: 'tankFrost', name: 'Frost Tank', price: 88, color: 0x80ffdb },
    { id: 'hoodieEmber', name: 'Ember Hoodie', price: 120, color: 0xff4d6d },
    { id: 'shirtTide', name: 'Tide Shirt', price: 96, color: 0x48cae4 },
    { id: 'teeOrbit', name: 'Orbit Tee', price: 104, color: 0x7209b7 },
    { id: 'hoodieMangoSoft', name: 'Soft Mango Hoodie', price: 118, color: 0xffb703 },
    { id: 'shirtLagoonStripe', name: 'Lagoon Stripe', price: 100, color: 0x90e0ef },
  ],
  (it) => `  { id: '${it.id}', name: '${it.name}', price: ${it.price}, color: 0x${hex(it.color)} },`,
)

appendToUnionAndArray(
  cos,
  'ShoesId',
  'SHOES',
  [
    { id: 'shoesMango', name: 'Mango Sneakers', price: 88, color: 0xff9f1c },
    { id: 'bootsLagoon', name: 'Lagoon Boots', price: 102, color: 0x00bbf9 },
    { id: 'shoesPlum', name: 'Plum Shoes', price: 90, color: 0x7b2cbf },
    { id: 'sneakersSand', name: 'Sand Sneakers', price: 86, color: 0xc9a227 },
    { id: 'bootsFrost', name: 'Frost Boots', price: 98, color: 0x80ffdb },
    { id: 'shoesEmber', name: 'Ember Shoes', price: 92, color: 0xff4d6d },
    { id: 'sneakersTide', name: 'Tide Sneakers', price: 84, color: 0x48cae4 },
    { id: 'bootsOrbit', name: 'Orbit Boots', price: 106, color: 0x7209b7 },
  ],
  (it) => `  { id: '${it.id}', name: '${it.name}', price: ${it.price}, color: 0x${hex(it.color)} },`,
)

appendToUnionAndArray(
  'src/game/furniture.ts',
  'FurnitureId',
  'FURNITURE',
  [
    { id: 'rug_mango', name: 'Mango Rug', price: 122, slot: 'floor', color: 0xff9f1c, accent: 0xffffff },
    { id: 'bed_lagoon', name: 'Lagoon Bed', price: 236, slot: 'side', color: 0x00bbf9, accent: 0xffffff },
    { id: 'sofa_plum', name: 'Plum Sofa', price: 208, slot: 'side', color: 0x7b2cbf, accent: 0xe0aaff },
    { id: 'lamp_sand', name: 'Sand Lamp', price: 128, slot: 'side', color: 0xc9a227, accent: 0xffffff },
    { id: 'poster_frost', name: 'Frost Poster', price: 62, slot: 'wall', color: 0x80ffdb, accent: 0xffffff },
    { id: 'plant_ember', name: 'Ember Plant', price: 108, slot: 'side', color: 0xff4d6d, accent: 0xffe066 },
    { id: 'shelf_tide', name: 'Tide Shelf', price: 158, slot: 'wall', color: 0x48cae4, accent: 0xffffff },
    { id: 'table_orbit', name: 'Orbit Table', price: 142, slot: 'floor', color: 0x7209b7, accent: 0x00f5d4 },
    { id: 'chair_mango', name: 'Mango Chair', price: 150, slot: 'side', color: 0xff9f1c, accent: 0xffffff },
    { id: 'fountain_lagoon', name: 'Lagoon Fountain', price: 188, slot: 'floor', color: 0x00bbf9, accent: 0x80ffdb },
    { id: 'clock_plum', name: 'Plum Clock', price: 118, slot: 'wall', color: 0x7b2cbf, accent: 0xffffff },
    { id: 'toy_sand', name: 'Sand Plush', price: 94, slot: 'floor', color: 0xc9a227, accent: 0xffffff },
    { id: 'cushion_frost', name: 'Frost Cushion', price: 86, slot: 'floor', color: 0x80ffdb, accent: 0xffffff },
    { id: 'mirror_ember', name: 'Ember Mirror', price: 146, slot: 'wall', color: 0xff4d6d, accent: 0xffffff },
    { id: 'rug_tide', name: 'Tide Rug', price: 124, slot: 'floor', color: 0x48cae4, accent: 0xffffff },
    { id: 'bed_orbit', name: 'Orbit Bed', price: 250, slot: 'side', color: 0x7209b7, accent: 0x00f5d4 },
    { id: 'sofa_mango', name: 'Mango Sofa', price: 204, slot: 'side', color: 0xff9f1c, accent: 0xffffff },
    { id: 'lamp_lagoon', name: 'Lagoon Lamp', price: 132, slot: 'side', color: 0x00bbf9, accent: 0xffffff },
    { id: 'poster_plum', name: 'Plum Poster', price: 64, slot: 'wall', color: 0x7b2cbf, accent: 0xffffff },
    { id: 'plant_sand', name: 'Sand Plant', price: 110, slot: 'side', color: 0xc9a227, accent: 0x80ed99 },
    { id: 'cabinet_frost', name: 'Frost Cabinet', price: 172, slot: 'side', color: 0x80ffdb, accent: 0xffffff },
    { id: 'ottoman_ember', name: 'Ember Ottoman', price: 102, slot: 'floor', color: 0xff4d6d, accent: 0xffffff },
    { id: 'desk_tide', name: 'Tide Desk', price: 176, slot: 'side', color: 0x48cae4, accent: 0xffffff },
    { id: 'wall_art_orbit', name: 'Orbit Art', price: 72, slot: 'wall', color: 0x7209b7, accent: 0xffffff },
    { id: 'rug_ember_soft', name: 'Soft Ember Rug', price: 136, slot: 'floor', color: 0xff4d6d, accent: 0xffbe0b },
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
