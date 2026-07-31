export type FurnitureId =
  | 'rug_basic'
  | 'rug_star'
  | 'rug_wave'
  | 'rug_heart'
  | 'rug_check'
  | 'bed_cozy'
  | 'bed_bunk'
  | 'bed_castle'
  | 'bed_race'
  | 'bowl_wood'
  | 'bowl_gold'
  | 'bowl_crystal'
  | 'toybox'
  | 'ball_pile'
  | 'robot_toy'
  | 'lamp_floor'
  | 'lamp_neon'
  | 'lamp_lava'
  | 'poster_sun'
  | 'poster_moon'
  | 'poster_star'
  | 'poster_band'
  | 'plant_tall'
  | 'plant_hang'
  | 'plant_cactus'
  | 'shelf_books'
  | 'shelf_games'
  | 'cushion'
  | 'beanbag_xl'
  | 'aquarium'
  | 'jukebox'
  | 'treasure_chest'
  | 'coral_reef'
  | 'neon_console'
  | 'dragon_egg'
  | 'alien_pod'
  | 'mirror_vanity'
  | 'bathtub_prop'
  | 'fridge'
  | 'stove'
  | 'tv_wall'
  | 'clock_cuckoo'
  | 'hammock'
  | 'fountain'
  | 'candy_machine'
  | 'pirate_flag'
  | 'swing_set'
  | 'sandbox'
  | 'grill'
  | 'trampoline'
  | 'birdhouse'
  | 'mailbox'
  | 'snowglobe'
  | 'piano'
  | 'telescope'
  | 'disco_ball'
  | 'bean_stalk'
  | 'trophy_shelf'
  | 'rug_galaxy'
  | 'rug_leaf'
  | 'bed_capsule'
  | 'sofa_cloud'
  | 'chair_gaming'
  | 'table_picnic'
  | 'lamp_mushroom'
  | 'poster_planet'
  | 'poster_heart'
  | 'plant_bonsai'
  | 'fireplace'
  | 'arcade'
  | 'drum_kit'
  | 'whiteboard'
  | 'yoga_mat'
  | 'slide'
  | 'pool'
  | 'tent'
  | 'garden_gnome'
  | 'wind_chime'
  | 'statue_cat'
  | 'vending'
  | 'rug_stripes'
  | 'bed_hammock'
  | 'sofa_retro'
  | 'lamp_paper'
  | 'poster_wave'
  | 'plant_fern'
  | 'bookshelf_tall'
  | 'coffee_table'
  | 'record_player'
  | 'fish_bowl'
  | 'wall_clock'
  | 'beanbag_mint'
  | 'kite'
  | 'picnic_blanket'
  | 'surfboard'
  | 'rocket_model'
  | 'candy_jar'
  | 'yoga_ball'
  | 'nightstand'
  | 'curtain_stars'
  | 'rug_rainbow'
  | 'bed_cloud'
  | 'sofa_plush'
  | 'lamp_star'
  | 'poster_cat'
  | 'plant_palm'
  | 'bookshelf_short'
  | 'toy_train'
  | 'balloon_arch'
  | 'wall_shelf'
  | 'ottoman'
  | 'desk_study'
  | 'rug_dots'
  | 'fan_ceiling'
  | 'radio_vintage'
  | 'terrarium'
  | 'hammock_chair'
  | 'neon_sign'
  | 'skate_ramp'
  | 'bird_bath'
  | 'rug_sunset'
  | 'bed_bunk_space'
  | 'sofa_corner'
  | 'lamp_fairy'
  | 'poster_comic'
  | 'plant_succulent'
  | 'shelf_trophy'
  | 'table_round'
  | 'chair_rocking'
  | 'mirror_full'
  | 'rug_paw'
  | 'bed_tent'
  | 'lamp_moon'
  | 'poster_travel'
  | 'plant_ivy'
  | 'cabinet_snack'
  | 'basket_laundry'
  | 'clock_digital'
  | 'cushion_star'
  | 'toy_robot_xl'
  | 'rug_ocean'
  | 'bed_loft'
  | 'sofa_bean'
  | 'lamp_prism'
  | 'poster_music'
  | 'plant_bamboo'
  | 'shelf_photo'
  | 'table_craft'
  | 'chair_egg'
  | 'fountain_mini'

export type FurnitureSlot = 'floor' | 'wall' | 'side'

export interface FurnitureItem {
  id: FurnitureId
  name: string
  price: number
  slot: FurnitureSlot
  color: number
  accent: number
}

export const FURNITURE: FurnitureItem[] = [
  { id: 'rug_basic', name: 'Coral Rug', price: 0, slot: 'floor', color: 0xe07a5f, accent: 0xf2cc8f },
  { id: 'rug_star', name: 'Star Rug', price: 80, slot: 'floor', color: 0x9b5de5, accent: 0xf4d35e },
  { id: 'rug_wave', name: 'Wave Rug', price: 95, slot: 'floor', color: 0x4cc9f0, accent: 0xffffff },
  { id: 'rug_heart', name: 'Heart Rug', price: 100, slot: 'floor', color: 0xff85a1, accent: 0xffffff },
  { id: 'rug_check', name: 'Check Rug', price: 90, slot: 'floor', color: 0x264653, accent: 0xf4d35e },
  { id: 'bed_cozy', name: 'Cozy Bed', price: 120, slot: 'side', color: 0x4a90a4, accent: 0xffe8c8 },
  { id: 'bed_bunk', name: 'Cloud Bed', price: 180, slot: 'side', color: 0x7eb8d8, accent: 0xffffff },
  { id: 'bed_castle', name: 'Castle Bed', price: 220, slot: 'side', color: 0x9b5de5, accent: 0xf4d35e },
  { id: 'bed_race', name: 'Race Car Bed', price: 240, slot: 'side', color: 0xe63946, accent: 0xf4d35e },
  { id: 'bowl_wood', name: 'Wood Bowl', price: 35, slot: 'floor', color: 0xb56b45, accent: 0xe8d5b5 },
  { id: 'bowl_gold', name: 'Gold Bowl', price: 90, slot: 'floor', color: 0xf4d35e, accent: 0xe9b44c },
  { id: 'bowl_crystal', name: 'Crystal Bowl', price: 120, slot: 'floor', color: 0x90e0ef, accent: 0xffffff },
  { id: 'toybox', name: 'Toy Box', price: 70, slot: 'side', color: 0xe76f51, accent: 0xf4a261 },
  { id: 'ball_pile', name: 'Ball Pile', price: 45, slot: 'floor', color: 0x4cc9f0, accent: 0xff85a1 },
  { id: 'robot_toy', name: 'Robot Buddy', price: 150, slot: 'floor', color: 0x8d99ae, accent: 0x00f5d4 },
  { id: 'lamp_floor', name: 'Floor Lamp', price: 65, slot: 'side', color: 0xf2e8d5, accent: 0xffe066 },
  { id: 'lamp_neon', name: 'Neon Lamp', price: 110, slot: 'side', color: 0xff006e, accent: 0x00f5d4 },
  { id: 'lamp_lava', name: 'Lava Lamp', price: 125, slot: 'side', color: 0x9b2226, accent: 0xffbe0b },
  { id: 'poster_sun', name: 'Sun Poster', price: 40, slot: 'wall', color: 0xffbe0b, accent: 0xff006e },
  { id: 'poster_moon', name: 'Moon Poster', price: 40, slot: 'wall', color: 0x3a86ff, accent: 0xffe066 },
  { id: 'poster_star', name: 'Star Poster', price: 45, slot: 'wall', color: 0x240046, accent: 0xf4d35e },
  { id: 'poster_band', name: 'Band Poster', price: 55, slot: 'wall', color: 0xe63946, accent: 0x1a1a1a },
  { id: 'plant_tall', name: 'Tall Plant', price: 55, slot: 'side', color: 0x4caf7a, accent: 0xb56b45 },
  { id: 'plant_hang', name: 'Hanging Plant', price: 50, slot: 'wall', color: 0x3d9a68, accent: 0x8b5e3c },
  { id: 'plant_cactus', name: 'Cactus Pal', price: 60, slot: 'side', color: 0x2a9d8f, accent: 0xe9c46a },
  { id: 'shelf_books', name: 'Book Shelf', price: 95, slot: 'wall', color: 0x8b5e3c, accent: 0xe63946 },
  { id: 'shelf_games', name: 'Game Shelf', price: 110, slot: 'wall', color: 0x457b9d, accent: 0xffbe0b },
  { id: 'cushion', name: 'Bean Cushion', price: 60, slot: 'floor', color: 0xff85a1, accent: 0xffe066 },
  { id: 'beanbag_xl', name: 'XL Beanbag', price: 130, slot: 'floor', color: 0x9b5de5, accent: 0xff85a1 },
  { id: 'aquarium', name: 'Aquarium', price: 150, slot: 'side', color: 0x4cc9f0, accent: 0x90e0ef },
  { id: 'jukebox', name: 'Jukebox', price: 200, slot: 'side', color: 0xe63946, accent: 0xf4d35e },
  { id: 'treasure_chest', name: 'Treasure Chest', price: 140, slot: 'side', color: 0xb56b45, accent: 0xf4d35e },
  { id: 'coral_reef', name: 'Coral Reef', price: 130, slot: 'floor', color: 0xff85a1, accent: 0x4cc9f0 },
  { id: 'neon_console', name: 'Neon Console', price: 180, slot: 'side', color: 0x240046, accent: 0x00f5d4 },
  { id: 'dragon_egg', name: 'Dragon Egg', price: 170, slot: 'floor', color: 0x9b2226, accent: 0xf4d35e },
  { id: 'alien_pod', name: 'Alien Pod', price: 190, slot: 'side', color: 0x5a189a, accent: 0x80ffdb },
  { id: 'mirror_vanity', name: 'Vanity Mirror', price: 125, slot: 'side', color: 0xf8edeb, accent: 0xff85a1 },
  { id: 'bathtub_prop', name: 'Bubble Tub', price: 160, slot: 'side', color: 0x90e0ef, accent: 0xffffff },
  { id: 'fridge', name: 'Snack Fridge', price: 145, slot: 'side', color: 0xd8e2dc, accent: 0x4cc9f0 },
  { id: 'stove', name: 'Little Stove', price: 135, slot: 'side', color: 0x6c757d, accent: 0xe63946 },
  { id: 'tv_wall', name: 'Wall TV', price: 155, slot: 'wall', color: 0x1a1a1a, accent: 0x4cc9f0 },
  { id: 'clock_cuckoo', name: 'Cuckoo Clock', price: 110, slot: 'wall', color: 0xb56b45, accent: 0xf4d35e },
  { id: 'hammock', name: 'Hammock', price: 100, slot: 'side', color: 0xffbe0b, accent: 0x2a9d8f },
  { id: 'fountain', name: 'Yard Fountain', price: 175, slot: 'floor', color: 0x4cc9f0, accent: 0xffffff },
  { id: 'candy_machine', name: 'Candy Machine', price: 165, slot: 'side', color: 0xff006e, accent: 0xffe066 },
  { id: 'pirate_flag', name: 'Pirate Flag', price: 85, slot: 'wall', color: 0x1a1a1a, accent: 0xffffff },
  { id: 'swing_set', name: 'Swing Set', price: 160, slot: 'side', color: 0xe76f51, accent: 0x4cc9f0 },
  { id: 'sandbox', name: 'Sandbox', price: 90, slot: 'floor', color: 0xe9c46a, accent: 0xb56b45 },
  { id: 'grill', name: 'BBQ Grill', price: 140, slot: 'side', color: 0x333333, accent: 0xe63946 },
  { id: 'trampoline', name: 'Trampoline', price: 180, slot: 'floor', color: 0x4cc9f0, accent: 0x1a1a1a },
  { id: 'birdhouse', name: 'Birdhouse', price: 70, slot: 'wall', color: 0xb56b45, accent: 0xe63946 },
  { id: 'mailbox', name: 'Mailbox', price: 65, slot: 'side', color: 0x457b9d, accent: 0xe63946 },
  { id: 'snowglobe', name: 'Snow Globe', price: 115, slot: 'side', color: 0x90e0ef, accent: 0xffffff },
  { id: 'piano', name: 'Mini Piano', price: 210, slot: 'side', color: 0x1a1a1a, accent: 0xffffff },
  { id: 'telescope', name: 'Telescope', price: 155, slot: 'side', color: 0x6c757d, accent: 0xf4d35e },
  { id: 'disco_ball', name: 'Disco Ball', price: 145, slot: 'wall', color: 0xcaf0f8, accent: 0xff006e },
  { id: 'bean_stalk', name: 'Bean Stalk', price: 100, slot: 'side', color: 0x4caf7a, accent: 0x3d9a68 },
  { id: 'trophy_shelf', name: 'Trophy Shelf', price: 170, slot: 'wall', color: 0x8b5e3c, accent: 0xf4d35e },
  { id: 'rug_galaxy', name: 'Galaxy Rug', price: 130, slot: 'floor', color: 0x240046, accent: 0xf4d35e },
  { id: 'rug_leaf', name: 'Leaf Rug', price: 95, slot: 'floor', color: 0x4caf7a, accent: 0xdda15e },
  { id: 'bed_capsule', name: 'Capsule Bed', price: 250, slot: 'side', color: 0x00f5d4, accent: 0x1a1a1a },
  { id: 'sofa_cloud', name: 'Cloud Sofa', price: 190, slot: 'side', color: 0xffffff, accent: 0x90e0ef },
  { id: 'chair_gaming', name: 'Gaming Chair', price: 175, slot: 'side', color: 0xe63946, accent: 0x1a1a1a },
  { id: 'table_picnic', name: 'Picnic Table', price: 120, slot: 'floor', color: 0xb56b45, accent: 0xe9c46a },
  { id: 'lamp_mushroom', name: 'Mushroom Lamp', price: 115, slot: 'side', color: 0xe63946, accent: 0xffffff },
  { id: 'poster_planet', name: 'Planet Poster', price: 50, slot: 'wall', color: 0x3a86ff, accent: 0xffbe0b },
  { id: 'poster_heart', name: 'Heart Poster', price: 48, slot: 'wall', color: 0xff85a1, accent: 0xffffff },
  { id: 'plant_bonsai', name: 'Bonsai', price: 105, slot: 'side', color: 0x606c38, accent: 0xb56b45 },
  { id: 'fireplace', name: 'Cozy Fireplace', price: 220, slot: 'wall', color: 0x6b4428, accent: 0xe76f51 },
  { id: 'arcade', name: 'Arcade Cabinet', price: 230, slot: 'side', color: 0x9b5de5, accent: 0x00f5d4 },
  { id: 'drum_kit', name: 'Drum Kit', price: 200, slot: 'floor', color: 0xe63946, accent: 0xf4d35e },
  { id: 'whiteboard', name: 'Whiteboard', price: 90, slot: 'wall', color: 0xffffff, accent: 0x4cc9f0 },
  { id: 'yoga_mat', name: 'Yoga Mat', price: 70, slot: 'floor', color: 0x9b5de5, accent: 0xff85a1 },
  { id: 'slide', name: 'Yard Slide', price: 185, slot: 'side', color: 0xffbe0b, accent: 0x4cc9f0 },
  { id: 'pool', name: 'Kiddie Pool', price: 160, slot: 'floor', color: 0x4cc9f0, accent: 0xffffff },
  { id: 'tent', name: 'Play Tent', price: 150, slot: 'side', color: 0xff006e, accent: 0xffe066 },
  { id: 'garden_gnome', name: 'Garden Gnome', price: 85, slot: 'floor', color: 0xe63946, accent: 0xffffff },
  { id: 'wind_chime', name: 'Wind Chime', price: 75, slot: 'wall', color: 0xf4d35e, accent: 0x90e0ef },
  { id: 'statue_cat', name: 'Cat Statue', price: 140, slot: 'side', color: 0x8d99ae, accent: 0xf4d35e },
  { id: 'vending', name: 'Snack Machine', price: 195, slot: 'side', color: 0xe63946, accent: 0x4cc9f0 },
  { id: 'rug_stripes', name: 'Stripe Rug', price: 100, slot: 'floor', color: 0xff85a1, accent: 0xffffff },
  { id: 'bed_hammock', name: 'Indoor Hammock', price: 170, slot: 'side', color: 0xffbe0b, accent: 0x2a9d8f },
  { id: 'sofa_retro', name: 'Retro Sofa', price: 200, slot: 'side', color: 0xe76f51, accent: 0xf4d35e },
  { id: 'lamp_paper', name: 'Paper Lantern', price: 90, slot: 'side', color: 0xffe8c8, accent: 0xffbe0b },
  { id: 'poster_wave', name: 'Wave Poster', price: 52, slot: 'wall', color: 0x4cc9f0, accent: 0xffffff },
  { id: 'plant_fern', name: 'Fern Friend', price: 70, slot: 'side', color: 0x4caf7a, accent: 0x2a9d8f },
  { id: 'bookshelf_tall', name: 'Tall Bookshelf', price: 160, slot: 'wall', color: 0x8b5e3c, accent: 0xe9c46a },
  { id: 'coffee_table', name: 'Coffee Table', price: 110, slot: 'floor', color: 0xb56b45, accent: 0xf2e8d5 },
  { id: 'record_player', name: 'Record Player', price: 180, slot: 'side', color: 0x1a1a1a, accent: 0xe63946 },
  { id: 'fish_bowl', name: 'Fish Bowl', price: 95, slot: 'side', color: 0x90e0ef, accent: 0xff85a1 },
  { id: 'wall_clock', name: 'Wall Clock', price: 85, slot: 'wall', color: 0xffffff, accent: 0x243029 },
  { id: 'beanbag_mint', name: 'Mint Beanbag', price: 120, slot: 'floor', color: 0x80ed99, accent: 0xffffff },
  { id: 'kite', name: 'Wall Kite', price: 75, slot: 'wall', color: 0xff006e, accent: 0xffe066 },
  { id: 'picnic_blanket', name: 'Picnic Blanket', price: 80, slot: 'floor', color: 0xe63946, accent: 0xffffff },
  { id: 'surfboard', name: 'Surfboard', price: 140, slot: 'side', color: 0x4cc9f0, accent: 0xffbe0b },
  { id: 'rocket_model', name: 'Rocket Model', price: 155, slot: 'side', color: 0xe63946, accent: 0xd8e2dc },
  { id: 'candy_jar', name: 'Candy Jar', price: 65, slot: 'side', color: 0xff85a1, accent: 0xffffff },
  { id: 'yoga_ball', name: 'Yoga Ball', price: 70, slot: 'floor', color: 0x9b5de5, accent: 0xff85a1 },
  { id: 'nightstand', name: 'Nightstand', price: 100, slot: 'side', color: 0x8b5e3c, accent: 0xf4d35e },
  { id: 'curtain_stars', name: 'Star Curtains', price: 125, slot: 'wall', color: 0x240046, accent: 0xf4d35e },
  { id: 'rug_rainbow', name: 'Rainbow Rug', price: 140, slot: 'floor', color: 0xff006e, accent: 0x4cc9f0 },
  { id: 'bed_cloud', name: 'Fluffy Cloud Bed', price: 230, slot: 'side', color: 0xffffff, accent: 0x90e0ef },
  { id: 'sofa_plush', name: 'Plush Sofa', price: 195, slot: 'side', color: 0xff85a1, accent: 0xffffff },
  { id: 'lamp_star', name: 'Star Lamp', price: 120, slot: 'side', color: 0xf4d35e, accent: 0xffffff },
  { id: 'poster_cat', name: 'Cat Poster', price: 55, slot: 'wall', color: 0xf4a261, accent: 0xffffff },
  { id: 'plant_palm', name: 'Palm Plant', price: 95, slot: 'side', color: 0x4caf7a, accent: 0xb56b45 },
  { id: 'bookshelf_short', name: 'Short Bookshelf', price: 130, slot: 'wall', color: 0x8b5e3c, accent: 0xe63946 },
  { id: 'toy_train', name: 'Toy Train', price: 110, slot: 'floor', color: 0xe63946, accent: 0xf4d35e },
  { id: 'balloon_arch', name: 'Balloon Arch', price: 150, slot: 'wall', color: 0xff85a1, accent: 0x4cc9f0 },
  { id: 'wall_shelf', name: 'Wall Shelf', price: 85, slot: 'wall', color: 0xb56b45, accent: 0xf2e8d5 },
  { id: 'ottoman', name: 'Ottoman', price: 90, slot: 'floor', color: 0x9b5de5, accent: 0xffffff },
  { id: 'desk_study', name: 'Study Desk', price: 160, slot: 'side', color: 0x6b4428, accent: 0x4cc9f0 },
  { id: 'rug_dots', name: 'Dot Rug', price: 105, slot: 'floor', color: 0xffe066, accent: 0xff006e },
  { id: 'fan_ceiling', name: 'Ceiling Fan', price: 140, slot: 'wall', color: 0xd8e2dc, accent: 0x6c757d },
  { id: 'radio_vintage', name: 'Vintage Radio', price: 125, slot: 'side', color: 0xe76f51, accent: 0xf4d35e },
  { id: 'terrarium', name: 'Terrarium', price: 135, slot: 'side', color: 0x2a9d8f, accent: 0x90e0ef },
  { id: 'hammock_chair', name: 'Hammock Chair', price: 170, slot: 'side', color: 0xffbe0b, accent: 0x2a9d8f },
  { id: 'neon_sign', name: 'Neon Sign', price: 155, slot: 'wall', color: 0xff006e, accent: 0x00f5d4 },
  { id: 'skate_ramp', name: 'Skate Ramp', price: 180, slot: 'floor', color: 0x457b9d, accent: 0xe63946 },
  { id: 'bird_bath', name: 'Bird Bath', price: 115, slot: 'floor', color: 0x90e0ef, accent: 0xffffff },
  { id: 'rug_sunset', name: 'Sunset Rug', price: 120, slot: 'floor', color: 0xff6b35, accent: 0xffbe0b },
  { id: 'bed_bunk_space', name: 'Space Bunk', price: 240, slot: 'side', color: 0x240046, accent: 0x00f5d4 },
  { id: 'sofa_corner', name: 'Corner Sofa', price: 210, slot: 'side', color: 0x457b9d, accent: 0xffe8c8 },
  { id: 'lamp_fairy', name: 'Fairy Lights', price: 100, slot: 'wall', color: 0xffe066, accent: 0xffffff },
  { id: 'poster_comic', name: 'Comic Poster', price: 60, slot: 'wall', color: 0xff006e, accent: 0x4cc9f0 },
  { id: 'plant_succulent', name: 'Succulent Set', price: 75, slot: 'side', color: 0x2a9d8f, accent: 0xe9c46a },
  { id: 'shelf_trophy', name: 'Prize Shelf', price: 165, slot: 'wall', color: 0x8b5e3c, accent: 0xf4d35e },
  { id: 'table_round', name: 'Round Table', price: 125, slot: 'floor', color: 0xb56b45, accent: 0xf2e8d5 },
  { id: 'chair_rocking', name: 'Rocking Chair', price: 150, slot: 'side', color: 0x6b4428, accent: 0xffe8c8 },
  { id: 'mirror_full', name: 'Full Mirror', price: 140, slot: 'wall', color: 0xcaf0f8, accent: 0xffffff },
  { id: 'rug_paw', name: 'Paw Rug', price: 110, slot: 'floor', color: 0xf4a261, accent: 0xffe8c8 },
  { id: 'bed_tent', name: 'Tent Bed', price: 200, slot: 'side', color: 0xff85a1, accent: 0xffe066 },
  { id: 'lamp_moon', name: 'Moon Lamp', price: 130, slot: 'side', color: 0xffe066, accent: 0x3a86ff },
  { id: 'poster_travel', name: 'Travel Poster', price: 58, slot: 'wall', color: 0x4cc9f0, accent: 0xe9c46a },
  { id: 'plant_ivy', name: 'Ivy Wall', price: 90, slot: 'wall', color: 0x4caf7a, accent: 0x2a9d8f },
  { id: 'cabinet_snack', name: 'Snack Cabinet', price: 155, slot: 'side', color: 0xe63946, accent: 0xf4d35e },
  { id: 'basket_laundry', name: 'Laundry Basket', price: 70, slot: 'floor', color: 0xe8d5b5, accent: 0xb56b45 },
  { id: 'clock_digital', name: 'Digital Clock', price: 95, slot: 'wall', color: 0x1a1a1a, accent: 0x00f5d4 },
  { id: 'cushion_star', name: 'Star Cushion', price: 80, slot: 'floor', color: 0xf4d35e, accent: 0xffffff },
  { id: 'toy_robot_xl', name: 'XL Robot', price: 190, slot: 'side', color: 0x8d99ae, accent: 0xff006e },
  { id: 'rug_ocean', name: 'Ocean Rug', price: 125, slot: 'floor', color: 0x0077b6, accent: 0x90e0ef },
  { id: 'bed_loft', name: 'Loft Bed', price: 230, slot: 'side', color: 0x457b9d, accent: 0xffe8c8 },
  { id: 'sofa_bean', name: 'Bean Sofa', price: 175, slot: 'side', color: 0x9b5de5, accent: 0xff85a1 },
  { id: 'lamp_prism', name: 'Prism Lamp', price: 145, slot: 'side', color: 0x00f5d4, accent: 0xff006e },
  { id: 'poster_music', name: 'Music Poster', price: 55, slot: 'wall', color: 0xe63946, accent: 0x1a1a1a },
  { id: 'plant_bamboo', name: 'Bamboo Pot', price: 100, slot: 'side', color: 0x606c38, accent: 0xb56b45 },
  { id: 'shelf_photo', name: 'Photo Shelf', price: 115, slot: 'wall', color: 0xb56b45, accent: 0xffffff },
  { id: 'table_craft', name: 'Craft Table', price: 150, slot: 'floor', color: 0xe9c46a, accent: 0x4cc9f0 },
  { id: 'chair_egg', name: 'Egg Chair', price: 180, slot: 'side', color: 0xffffff, accent: 0xff85a1 },
  { id: 'fountain_mini', name: 'Mini Fountain', price: 160, slot: 'floor', color: 0x4cc9f0, accent: 0xffffff },
]

export function getFurniture(id: FurnitureId): FurnitureItem {
  return FURNITURE.find((f) => f.id === id) ?? FURNITURE[0]
}

export const FURNITURE_COUNT = FURNITURE.length
