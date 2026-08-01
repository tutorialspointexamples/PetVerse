/** Monetization stubs — real Capacitor / Play Billing plugins can replace these later. */

export interface RewardedAdResult {
  watched: boolean
  mock: boolean
  skippedBecauseAdFree?: boolean
}

let adFreeSession = false

export function setAdFreeUnlocked(unlocked: boolean) {
  adFreeSession = unlocked
}

export function isAdFreeUnlocked() {
  return adFreeSession
}

export async function showRewardedAd(): Promise<RewardedAdResult> {
  if (adFreeSession) {
    // MTT2-style: ad-free owners still get the reward without a commercial break
    await new Promise((r) => setTimeout(r, 200))
    return { watched: true, mock: true, skippedBecauseAdFree: true }
  }
  // Web / debug stub: instant "watched" after a short delay.
  await new Promise((r) => setTimeout(r, 600))
  return { watched: true, mock: true }
}

export type IapKind = 'coins' | 'fuel' | 'style' | 'adfree'

export interface IapProduct {
  id: string
  title: string
  priceLabel: string
  coins: number
  fuel: number
  kind: IapKind
}

/** Optional purchases mirroring MTT2 free-to-play loops (coins, fuel, style, remove ads). */
export const IAP_PRODUCTS: IapProduct[] = [
  { id: 'coins_small', title: 'Coin Pouch', priceLabel: '$0.99', coins: 100, fuel: 0, kind: 'coins' },
  { id: 'coins_large', title: 'Coin Chest', priceLabel: '$4.99', coins: 600, fuel: 0, kind: 'coins' },
  { id: 'fuel_pack', title: 'Fuel Can', priceLabel: '$1.99', coins: 0, fuel: 8, kind: 'fuel' },
  { id: 'outfit_pack', title: 'Style Pack', priceLabel: '$2.99', coins: 50, fuel: 0, kind: 'style' },
  { id: 'ad_free', title: 'Remove Ads', priceLabel: '$4.99', coins: 0, fuel: 0, kind: 'adfree' },
]

export async function purchaseIap(productId: string): Promise<{ ok: boolean; mock: boolean }> {
  await new Promise((r) => setTimeout(r, 400))
  if (!IAP_PRODUCTS.some((p) => p.id === productId)) return { ok: false, mock: true }
  if (productId === 'ad_free') adFreeSession = true
  return { ok: true, mock: true }
}

export const MONETIZATION_ENABLED = true
