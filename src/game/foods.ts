export type FoodId =
  | 'kibble'
  | 'sushi'
  | 'cake'
  | 'smoothie'
  | 'pizza'
  | 'veggie'
  | 'burger'
  | 'icecream'
  | 'taco'
  | 'donut'
  | 'noodles'
  | 'fish'
  | 'pancake'
  | 'salad'
  | 'ramen'
  | 'cookie'
  | 'smoothieBerry'
  | 'steak'

export interface FoodDef {
  id: FoodId
  name: string
  hunger: number
  happiness: number
  coins: number
  price: number
  color: number
}

export const FOODS: FoodDef[] = [
  { id: 'kibble', name: 'Kibble Bowl', hunger: 28, happiness: 6, coins: 4, price: 0, color: 0xb56b45 },
  { id: 'sushi', name: 'Sushi Roll', hunger: 32, happiness: 12, coins: 6, price: 8, color: 0xff85a1 },
  { id: 'cake', name: 'Berry Cake', hunger: 22, happiness: 18, coins: 5, price: 10, color: 0xffc8dd },
  { id: 'smoothie', name: 'Green Smoothie', hunger: 18, happiness: 10, coins: 4, price: 6, color: 0x7bc9a6 },
  { id: 'pizza', name: 'Paw Pizza', hunger: 36, happiness: 14, coins: 8, price: 12, color: 0xe9b44c },
  { id: 'veggie', name: 'Veggie Plate', hunger: 24, happiness: 8, coins: 5, price: 5, color: 0x4caf7a },
  { id: 'burger', name: 'Meow Burger', hunger: 38, happiness: 16, coins: 9, price: 14, color: 0xe76f51 },
  { id: 'icecream', name: 'Ice Cream', hunger: 16, happiness: 22, coins: 6, price: 11, color: 0xffc8dd },
  { id: 'taco', name: 'Taco Tuesday', hunger: 30, happiness: 14, coins: 7, price: 10, color: 0xf4d35e },
  { id: 'donut', name: 'Sprinkle Donut', hunger: 20, happiness: 20, coins: 5, price: 9, color: 0xff85a1 },
  { id: 'noodles', name: 'Noodle Cup', hunger: 34, happiness: 12, coins: 7, price: 11, color: 0xffbe0b },
  { id: 'fish', name: 'Fresh Fish', hunger: 40, happiness: 15, coins: 10, price: 15, color: 0x4cc9f0 },
  { id: 'pancake', name: 'Pancake Stack', hunger: 30, happiness: 16, coins: 7, price: 12, color: 0xe9c46a },
  { id: 'salad', name: 'Garden Salad', hunger: 22, happiness: 10, coins: 5, price: 7, color: 0x80ed99 },
  { id: 'ramen', name: 'Hot Ramen', hunger: 36, happiness: 14, coins: 8, price: 13, color: 0xe76f51 },
  { id: 'cookie', name: 'Choco Cookie', hunger: 14, happiness: 20, coins: 5, price: 8, color: 0xb56b45 },
  { id: 'smoothieBerry', name: 'Berry Blast', hunger: 18, happiness: 18, coins: 6, price: 10, color: 0xff85a1 },
  { id: 'steak', name: 'Fancy Steak', hunger: 44, happiness: 18, coins: 12, price: 18, color: 0x9b2226 },
]

export function getFood(id: FoodId): FoodDef {
  return FOODS.find((f) => f.id === id) ?? FOODS[0]
}
