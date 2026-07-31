import { useState } from 'react'
import { BODY_COLORS, GLASSES, HATS, SCARVES, SHIRTS, SHOES, WEARABLE_COUNT } from '../game/cosmetics'
import { FURNITURE, FURNITURE_COUNT } from '../game/furniture'
import { useGameStore } from '../state/gameStore'

type Tab = 'coats' | 'hats' | 'glasses' | 'scarves' | 'shirts' | 'shoes' | 'furniture'

export function ShopPanel() {
  const overlay = useGameStore((s) => s.overlay)
  const setOverlay = useGameStore((s) => s.setOverlay)
  const coins = useGameStore((s) => s.coins)
  const bodyColor = useGameStore((s) => s.bodyColor)
  const hat = useGameStore((s) => s.hat)
  const glasses = useGameStore((s) => s.glasses)
  const scarf = useGameStore((s) => s.scarf)
  const shirt = useGameStore((s) => s.shirt)
  const shoes = useGameStore((s) => s.shoes)
  const ownedColors = useGameStore((s) => s.ownedColors)
  const ownedHats = useGameStore((s) => s.ownedHats)
  const ownedGlasses = useGameStore((s) => s.ownedGlasses)
  const ownedScarves = useGameStore((s) => s.ownedScarves)
  const ownedShirts = useGameStore((s) => s.ownedShirts)
  const ownedShoes = useGameStore((s) => s.ownedShoes)
  const ownedFurniture = useGameStore((s) => s.ownedFurniture)
  const placedFurniture = useGameStore((s) => s.placedFurniture)
  const buyColor = useGameStore((s) => s.buyColor)
  const buyHat = useGameStore((s) => s.buyHat)
  const buyGlasses = useGameStore((s) => s.buyGlasses)
  const buyScarf = useGameStore((s) => s.buyScarf)
  const buyShirt = useGameStore((s) => s.buyShirt)
  const buyShoes = useGameStore((s) => s.buyShoes)
  const buyFurniture = useGameStore((s) => s.buyFurniture)
  const [tab, setTab] = useState<Tab>('coats')

  if (overlay !== 'shop') return null

  return (
    <div className="shop-overlay" role="dialog" aria-label="Style shop">
      <div className="shop-panel wide">
        <div className="shop-header">
          <h2>Style Shop</h2>
          <p className="shop-coins">
            {coins} coins · {WEARABLE_COUNT} looks · {FURNITURE_COUNT} decor
          </p>
          <button type="button" className="close-btn" onClick={() => setOverlay('none')} aria-label="Close shop">
            ×
          </button>
        </div>

        <div className="shop-tabs">
          {(
            [
              ['coats', 'Coats'],
              ['hats', 'Hats'],
              ['glasses', 'Glasses'],
              ['scarves', 'Scarves'],
              ['shirts', 'Shirts'],
              ['shoes', 'Shoes'],
              ['furniture', 'Furniture'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`shop-tab ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'coats' && (
          <div className="shop-grid">
            {BODY_COLORS.map((color) => {
              const owned = ownedColors.includes(color.id)
              const equipped = bodyColor === color.id
              return (
                <button
                  key={color.id}
                  type="button"
                  className={`shop-item ${equipped ? 'equipped' : ''}`}
                  disabled={!owned && coins < color.price}
                  onClick={() => buyColor(color.id)}
                >
                  <span
                    className="swatch"
                    style={{ background: `#${color.fill.toString(16).padStart(6, '0')}` }}
                  />
                  <span className="shop-item-name">{color.name}</span>
                  <span className="shop-item-price">
                    {equipped ? 'On' : owned ? 'Own' : `${color.price}c`}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {tab === 'hats' && (
          <div className="shop-grid">
            {HATS.map((item) => {
              const owned = ownedHats.includes(item.id)
              const equipped = hat === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`shop-item ${equipped ? 'equipped' : ''}`}
                  disabled={!owned && coins < item.price}
                  onClick={() => buyHat(item.id)}
                >
                  <span className="hat-preview" style={{ background: `#${item.color.toString(16).padStart(6, '0')}` }}>
                    {item.id === 'none' ? '—' : '✦'}
                  </span>
                  <span className="shop-item-name">{item.name}</span>
                  <span className="shop-item-price">
                    {equipped ? 'On' : owned ? 'Own' : `${item.price}c`}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {tab === 'glasses' && (
          <div className="shop-grid">
            {GLASSES.map((item) => {
              const owned = ownedGlasses.includes(item.id)
              const equipped = glasses === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`shop-item ${equipped ? 'equipped' : ''}`}
                  disabled={!owned && coins < item.price}
                  onClick={() => buyGlasses(item.id)}
                >
                  <span className="hat-preview">◯</span>
                  <span className="shop-item-name">{item.name}</span>
                  <span className="shop-item-price">
                    {equipped ? 'On' : owned ? 'Own' : `${item.price}c`}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {tab === 'scarves' && (
          <div className="shop-grid">
            {SCARVES.map((item) => {
              const owned = ownedScarves.includes(item.id)
              const equipped = scarf === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`shop-item ${equipped ? 'equipped' : ''}`}
                  disabled={!owned && coins < item.price}
                  onClick={() => buyScarf(item.id)}
                >
                  <span
                    className="swatch"
                    style={{ background: `#${item.color.toString(16).padStart(6, '0')}` }}
                  />
                  <span className="shop-item-name">{item.name}</span>
                  <span className="shop-item-price">
                    {equipped ? 'On' : owned ? 'Own' : `${item.price}c`}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {tab === 'shirts' && (
          <div className="shop-grid">
            {SHIRTS.map((item) => {
              const owned = ownedShirts.includes(item.id)
              const equipped = shirt === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`shop-item ${equipped ? 'equipped' : ''}`}
                  disabled={!owned && coins < item.price}
                  onClick={() => buyShirt(item.id)}
                >
                  <span
                    className="swatch"
                    style={{ background: `#${item.color.toString(16).padStart(6, '0')}` }}
                  />
                  <span className="shop-item-name">{item.name}</span>
                  <span className="shop-item-price">
                    {equipped ? 'On' : owned ? 'Own' : `${item.price}c`}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {tab === 'shoes' && (
          <div className="shop-grid">
            {SHOES.map((item) => {
              const owned = ownedShoes.includes(item.id)
              const equipped = shoes === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`shop-item ${equipped ? 'equipped' : ''}`}
                  disabled={!owned && coins < item.price}
                  onClick={() => buyShoes(item.id)}
                >
                  <span
                    className="swatch"
                    style={{ background: `#${item.color.toString(16).padStart(6, '0')}` }}
                  />
                  <span className="shop-item-name">{item.name}</span>
                  <span className="shop-item-price">
                    {equipped ? 'On' : owned ? 'Own' : `${item.price}c`}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {tab === 'furniture' && (
          <div className="shop-grid">
            {FURNITURE.map((item) => {
              const owned = ownedFurniture.includes(item.id)
              const placed = placedFurniture.includes(item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`shop-item ${placed ? 'equipped' : ''}`}
                  disabled={!owned && coins < item.price}
                  onClick={() => buyFurniture(item.id)}
                >
                  <span
                    className="swatch"
                    style={{ background: `#${item.color.toString(16).padStart(6, '0')}` }}
                  />
                  <span className="shop-item-name">{item.name}</span>
                  <span className="shop-item-price">
                    {placed ? 'In room' : owned ? 'Place' : `${item.price}c`}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
