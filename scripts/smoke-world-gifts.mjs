import { chromium } from 'playwright'

const BASE = process.env.PETVERSE_URL || 'http://127.0.0.1:4173'

const seed = {
  petName: 'Pixel',
  named: true,
  needs: { hunger: 70, energy: 70, hygiene: 70, happiness: 70, health: 90 },
  coins: 120,
  stars: 2,
  fuel: 12,
  xp: 40,
  bodyColor: 'ginger',
  hat: 'none',
  glasses: 'none',
  scarf: 'none',
  shirt: 'none',
  shoes: 'none',
  ownedColors: ['ginger'],
  ownedHats: ['none'],
  ownedGlasses: ['none'],
  ownedScarves: ['none'],
  ownedShirts: ['none'],
  ownedShoes: ['none'],
  ownedFurniture: ['rug_basic'],
  placedFurniture: ['rug_basic'],
  visitedWorlds: [],
  worldSpotCollections: { beach: ['shells', 'surf'] },
  claimedWorldGifts: [],
  companion: 'none',
  ownedCompanions: ['none'],
  companionCare: {},
  unlockedSkills: ['drums'],
  eventClaimDate: new Date().toISOString().slice(0, 10),
  claimedEventIds: ['seed'],
  eventActivityDate: new Date().toISOString().slice(0, 10),
  sleeping: false,
  room: 'living',
  favoriteFood: 'kibble',
  ownedCards: [],
  claimedCardSets: [],
  missionDate: null,
  missionProgress: {},
  claimedMissions: [],
  adFree: true,
  lastSavedAt: Date.now(),
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const fails = []

  await page.addInitScript((data) => {
    // Seed only once — do not overwrite after gameplay saves.
    if (!localStorage.getItem('petverse-smoke-seeded')) {
      localStorage.setItem('petverse-save-v4', JSON.stringify(data))
      localStorage.setItem('petverse-smoke-seeded', '1')
    }
  }, seed)

  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  const dismissOverlays = async () => {
    for (let i = 0; i < 3; i++) {
      const close = page.locator('.shop-overlay .close-btn').first()
      if (!(await close.isVisible().catch(() => false))) break
      await close.click({ force: true }).catch(() => {})
      await page.waitForTimeout(250)
    }
  }
  await dismissOverlays()

  // Open Travel via dock
  const travelBtn = page.getByRole('button', { name: /travel|viajar|plane/i }).first()
  if (await travelBtn.isVisible().catch(() => false)) {
    await travelBtn.click()
  } else {
    // More → Travel fallback
    const more = page.getByRole('button', { name: /more|más|mais/i }).first()
    await more.click()
    await page.getByRole('button', { name: /travel|viajar/i }).first().click()
  }
  await page.waitForTimeout(400)

  const beachCard = page.locator('.hub-card', { hasText: 'Adventure Beach' })
  const badgeText = await beachCard.locator('.world-progress-badge').innerText()
  console.log('Beach badge before:', badgeText)
  if (!/2\/3/.test(badgeText) && !/gift/i.test(badgeText)) {
    fails.push(`Expected beach progress 2/3, got "${badgeText}"`)
  }

  await beachCard.click()
  // Flight cutscene auto-lands (~2.2s); Skip is often covered by .flight-sky.
  await page.waitForSelector('.world-visit', { timeout: 10000 })

  const sandcastle = page.locator('.world-spot', { hasText: 'Sandcastle' })
  await sandcastle.click()
  await page.waitForSelector('.spot-chase-target', { timeout: 5000 })
  for (let i = 0; i < 5; i++) {
    const target = page.locator('.spot-chase-target')
    if (await target.isVisible().catch(() => false)) {
      await target.click({ force: true }).catch(() => {})
      await page.waitForTimeout(200)
    }
  }
  await page.waitForTimeout(900)

  const giftBanner = page.locator('.world-clear-banner.gift')
  const giftVisible = await giftBanner.isVisible().catch(() => false)
  const giftText = giftVisible ? await giftBanner.innerText() : ''
  console.log('Gift banner:', giftText || '(missing)')
  if (!giftVisible || !/\+18c/i.test(giftText)) {
    fails.push(`Expected souvenir gift banner with +18c, got "${giftText}"`)
  }

  await page.getByRole('button', { name: /fly home|home|volver|voar/i }).first().click()
  await page.waitForTimeout(400)

  // Reopen travel
  if (await travelBtn.isVisible().catch(() => false)) await travelBtn.click()
  else {
    await page.getByRole('button', { name: /more|más/i }).first().click()
    await page.getByRole('button', { name: /travel|viajar/i }).first().click()
  }
  await page.waitForTimeout(400)
  const badgeAfter = await page
    .locator('.hub-card', { hasText: 'Adventure Beach' })
    .locator('.world-progress-badge')
    .innerText()
  console.log('Beach badge after:', badgeAfter)
  if (!/claimed/i.test(badgeAfter)) {
    fails.push(`Expected gift claimed badge, got "${badgeAfter}"`)
  }

  // Persistence across reload (init script must not re-seed)
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await dismissOverlays()
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('petverse-save-v4') || '{}'))
  console.log('Persisted spots:', saved.worldSpotCollections)
  console.log('Claimed gifts:', saved.claimedWorldGifts)
  if (!saved.worldSpotCollections?.beach || saved.worldSpotCollections.beach.length < 3) {
    fails.push('worldSpotCollections.beach missing 3 spots after reload')
  }
  if (!saved.claimedWorldGifts?.includes('beach')) {
    fails.push('claimedWorldGifts missing beach after reload')
  }

  // Games hub Buddy Catch (More dock → Games)
  await page.evaluate(() => {
    document.querySelectorAll('.shop-overlay .close-btn').forEach((el) =>
      el.dispatchEvent(new MouseEvent('click', { bubbles: true })),
    )
  })
  await page.waitForTimeout(250)
  await page.locator('.dock-btn').filter({ hasText: /more|más|mais/i }).first().click({ force: true })
  await page.waitForTimeout(250)
  await page.locator('.dock-sheet button, .action-btn, button').filter({ hasText: /games|juegos|jogos/i }).first().click({ force: true })
  await page.waitForSelector('.hub-card:has-text("Buddy Catch")', { timeout: 5000 })
  const buddy = page.locator('.hub-card', { hasText: 'Buddy Catch' })
  const buddyDisabled = await buddy.isDisabled()
  console.log('Buddy Catch visible/disabled:', true, buddyDisabled)
  if (!buddyDisabled) fails.push('Buddy Catch should be disabled without companion')

  await browser.close()
  if (fails.length) {
    console.error('FAIL\n' + fails.map((f) => `- ${f}`).join('\n'))
    process.exit(1)
  }
  console.log('PASS all world-gift smoke checks')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
