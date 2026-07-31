/** Monetization stubs — real Capacitor plugins can replace these later. */

export interface RewardedAdResult {
  watched: boolean
  mock: boolean
}

export async function showRewardedAd(): Promise<RewardedAdResult> {
  // Web / debug stub: instant "watched" after a short delay.
  await new Promise((r) => setTimeout(r, 600))
  return { watched: true, mock: true }
}

export interface IapProduct {
  id: string
  title: string
  priceLabel: string
  coins: number
}

export const IAP_PRODUCTS: IapProduct[] = [
  { id: 'coins_small', title: 'Coin Pouch', priceLabel: '$0.99', coins: 100 },
  { id: 'coins_large', title: 'Coin Chest', priceLabel: '$4.99', coins: 600 },
  { id: 'outfit_pack', title: 'Style Pack', priceLabel: '$2.99', coins: 0 },
]

export async function purchaseIap(productId: string): Promise<{ ok: boolean; mock: boolean }> {
  await new Promise((r) => setTimeout(r, 400))
  if (!IAP_PRODUCTS.some((p) => p.id === productId)) return { ok: false, mock: true }
  return { ok: true, mock: true }
}

export const MONETIZATION_ENABLED = true
