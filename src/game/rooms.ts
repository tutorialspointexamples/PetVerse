export type RoomId = 'living' | 'kitchen' | 'bathroom' | 'bedroom' | 'yard' | 'cinema'

export interface RoomDef {
  id: RoomId
  name: string
  wall: number
  wallAccent: number
  floor: number
  trim: number
  outdoor?: boolean
}

export const ROOMS: RoomDef[] = [
  {
    id: 'living',
    name: 'Living Room',
    wall: 0x2f6f5e,
    wallAccent: 0x4a9b82,
    floor: 0xc4a574,
    trim: 0xa8885a,
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    wall: 0xf2e8d5,
    wallAccent: 0xffe8c8,
    floor: 0xd4c4a8,
    trim: 0xb8a888,
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    wall: 0x90e0ef,
    wallAccent: 0xcaf0f8,
    floor: 0xade8f4,
    trim: 0x48cae4,
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    wall: 0x7b2cbf,
    wallAccent: 0x9b5de5,
    floor: 0x5a189a,
    trim: 0x3c096c,
  },
  {
    id: 'yard',
    name: 'Backyard',
    wall: 0x87ceeb,
    wallAccent: 0xffe066,
    floor: 0x6a994e,
    trim: 0x4caf7a,
    outdoor: true,
  },
  {
    id: 'cinema',
    name: 'Cinema Lounge',
    wall: 0x1a1028,
    wallAccent: 0x3a1c5c,
    floor: 0x2b1d3a,
    trim: 0xe63946,
  },
]

export function getRoom(id: RoomId): RoomDef {
  return ROOMS.find((r) => r.id === id) ?? ROOMS[0]
}
