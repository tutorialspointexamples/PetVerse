/** MTT2-listed locales: EN, ES, PT, FR, DE, RU, TR, AR */

export type LocaleId = 'en' | 'es' | 'pt' | 'fr' | 'de' | 'ru' | 'tr' | 'ar'

export const LOCALES: { id: LocaleId; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
  { id: 'pt', label: 'Português' },
  { id: 'fr', label: 'Français' },
  { id: 'de', label: 'Deutsch' },
  { id: 'ru', label: 'Русский' },
  { id: 'tr', label: 'Türkçe' },
  { id: 'ar', label: 'العربية' },
]

type Dict = Record<string, string>

const en: Dict = {
  'hud.coins': 'coins',
  'hud.fuel': 'fuel',
  'hud.stars': 'stars',
  'action.feed': 'Feed',
  'action.sleep': 'Sleep',
  'action.wake': 'Wake',
  'action.bath': 'Bath',
  'action.play': 'Play',
  'action.brush': 'Brush',
  'action.potty': 'Potty',
  'action.talk': 'Hold to Talk',
  'action.listening': 'Listening…',
  'action.talking': 'Talking…',
  'action.style': 'Style',
  'nav.rooms': 'Rooms',
  'nav.cards': 'Cards',
  'nav.games': 'Games',
  'nav.travel': 'Travel',
  'nav.skills': 'Skills',
  'nav.pets': 'Pets',
  'nav.boost': 'Boost',
  'nav.lang': 'Lang',
  'shop.title': 'Style Shop',
  'shop.looks': 'looks',
  'shop.decor': 'decor',
  'games.title': 'Mini-Games',
  'travel.title': 'Plane Travel',
  'rooms.title': 'Home Rooms',
  'cards.title': 'Card Album',
  'food.title': 'Kitchen Menu',
  'lang.title': 'Language',
  'hint.main': 'Tap head/belly/companion · Room props · Hold mic to talk',
  'name.title': 'Name your pet',
  'name.submit': 'Start caring',
  'photo.title': 'Photo Booth',
  'photo.snap': 'Snap',
  'photo.close': 'Done',
}

const es: Dict = {
  ...en,
  'action.feed': 'Comer',
  'action.sleep': 'Dormir',
  'action.wake': 'Despertar',
  'action.bath': 'Baño',
  'action.play': 'Jugar',
  'action.brush': 'Cepillar',
  'action.potty': 'Baño',
  'action.talk': 'Mantén para hablar',
  'action.style': 'Estilo',
  'nav.rooms': 'Habitaciones',
  'nav.cards': 'Cartas',
  'nav.games': 'Juegos',
  'nav.travel': 'Viajar',
  'nav.skills': 'Habilidades',
  'nav.pets': 'Mascotas',
  'nav.boost': 'Boost',
  'nav.lang': 'Idioma',
  'shop.title': 'Tienda de estilo',
  'games.title': 'Minijuegos',
  'travel.title': 'Viaje en avión',
  'rooms.title': 'Habitaciones',
  'cards.title': 'Álbum de cartas',
  'food.title': 'Menú de cocina',
  'lang.title': 'Idioma',
  'hint.main': 'Toca cabeza/barriga · Props · Mantén mic para hablar',
  'name.title': 'Nombra a tu mascota',
  'name.submit': 'Empezar',
  'photo.title': 'Fotomatón',
  'photo.snap': 'Foto',
  'photo.close': 'Listo',
}

const pt: Dict = {
  ...en,
  'action.feed': 'Comer',
  'action.sleep': 'Dormir',
  'action.wake': 'Acordar',
  'action.bath': 'Banho',
  'action.play': 'Brincar',
  'action.brush': 'Escovar',
  'action.potty': 'Banheiro',
  'action.talk': 'Segure para falar',
  'action.style': 'Estilo',
  'nav.rooms': 'Cômodos',
  'nav.cards': 'Cartas',
  'nav.games': 'Jogos',
  'nav.travel': 'Viajar',
  'nav.skills': 'Habilidades',
  'nav.pets': 'Pets',
  'nav.lang': 'Idioma',
  'shop.title': 'Loja de estilo',
  'games.title': 'Minijogos',
  'travel.title': 'Viagem de avião',
  'rooms.title': 'Cômodos',
  'cards.title': 'Álbum de cartas',
  'food.title': 'Menu da cozinha',
  'lang.title': 'Idioma',
  'name.title': 'Nomeie seu pet',
  'name.submit': 'Começar',
  'photo.title': 'Cabine de fotos',
  'photo.snap': 'Foto',
  'photo.close': 'Pronto',
}

const fr: Dict = {
  ...en,
  'action.feed': 'Nourrir',
  'action.sleep': 'Dormir',
  'action.wake': 'Réveiller',
  'action.bath': 'Bain',
  'action.play': 'Jouer',
  'action.brush': 'Brosser',
  'action.potty': 'Toilettes',
  'action.talk': 'Maintenir pour parler',
  'action.style': 'Style',
  'nav.rooms': 'Pièces',
  'nav.cards': 'Cartes',
  'nav.games': 'Jeux',
  'nav.travel': 'Voyager',
  'nav.skills': 'Compétences',
  'nav.pets': 'Animaux',
  'nav.lang': 'Langue',
  'shop.title': 'Boutique style',
  'games.title': 'Mini-jeux',
  'travel.title': 'Voyage en avion',
  'rooms.title': 'Pièces',
  'cards.title': 'Album de cartes',
  'food.title': 'Menu cuisine',
  'lang.title': 'Langue',
  'name.title': 'Nomme ton animal',
  'name.submit': 'Commencer',
  'photo.title': 'Cabine photo',
  'photo.snap': 'Photo',
  'photo.close': 'OK',
}

const de: Dict = {
  ...en,
  'action.feed': 'Füttern',
  'action.sleep': 'Schlafen',
  'action.wake': 'Wecken',
  'action.bath': 'Bad',
  'action.play': 'Spielen',
  'action.brush': 'Bürsten',
  'action.potty': 'Klo',
  'action.talk': 'Halten zum Sprechen',
  'action.style': 'Style',
  'nav.rooms': 'Räume',
  'nav.cards': 'Karten',
  'nav.games': 'Spiele',
  'nav.travel': 'Reisen',
  'nav.skills': 'Skills',
  'nav.pets': 'Haustiere',
  'nav.lang': 'Sprache',
  'shop.title': 'Style-Shop',
  'games.title': 'Minispiele',
  'travel.title': 'Flugreise',
  'rooms.title': 'Räume',
  'cards.title': 'Kartenalbum',
  'food.title': 'Küchenmenü',
  'lang.title': 'Sprache',
  'name.title': 'Benenne dein Haustier',
  'name.submit': 'Los',
  'photo.title': 'Fotobox',
  'photo.snap': 'Foto',
  'photo.close': 'Fertig',
}

const ru: Dict = {
  ...en,
  'action.feed': 'Кормить',
  'action.sleep': 'Спать',
  'action.wake': 'Разбудить',
  'action.bath': 'Ванна',
  'action.play': 'Играть',
  'action.brush': 'Чистить',
  'action.potty': 'Туалет',
  'action.talk': 'Удерживай для речи',
  'action.style': 'Стиль',
  'nav.rooms': 'Комнаты',
  'nav.cards': 'Карты',
  'nav.games': 'Игры',
  'nav.travel': 'Путешествия',
  'nav.skills': 'Навыки',
  'nav.pets': 'Питомцы',
  'nav.lang': 'Язык',
  'shop.title': 'Магазин стиля',
  'games.title': 'Мини-игры',
  'travel.title': 'Перелёт',
  'rooms.title': 'Комнаты',
  'cards.title': 'Альбом карт',
  'food.title': 'Меню кухни',
  'lang.title': 'Язык',
  'name.title': 'Назови питомца',
  'name.submit': 'Начать',
  'photo.title': 'Фотобудка',
  'photo.snap': 'Снимок',
  'photo.close': 'Готово',
}

const tr: Dict = {
  ...en,
  'action.feed': 'Besle',
  'action.sleep': 'Uyu',
  'action.wake': 'Uyandır',
  'action.bath': 'Banyo',
  'action.play': 'Oyna',
  'action.brush': 'Fırçala',
  'action.potty': 'Tuvalet',
  'action.talk': 'Konuşmak için basılı tut',
  'action.style': 'Stil',
  'nav.rooms': 'Odalar',
  'nav.cards': 'Kartlar',
  'nav.games': 'Oyunlar',
  'nav.travel': 'Seyahat',
  'nav.skills': 'Beceriler',
  'nav.pets': 'Evcil',
  'nav.lang': 'Dil',
  'shop.title': 'Stil Mağazası',
  'games.title': 'Mini Oyunlar',
  'travel.title': 'Uçak Seyahati',
  'rooms.title': 'Odalar',
  'cards.title': 'Kart Albümü',
  'food.title': 'Mutfak Menüsü',
  'lang.title': 'Dil',
  'name.title': 'Evcil hayvanına isim ver',
  'name.submit': 'Başla',
  'photo.title': 'Fotoğraf Kabini',
  'photo.snap': 'Çek',
  'photo.close': 'Tamam',
}

const ar: Dict = {
  ...en,
  'action.feed': 'إطعام',
  'action.sleep': 'نوم',
  'action.wake': 'إيقاظ',
  'action.bath': 'استحمام',
  'action.play': 'لعب',
  'action.brush': 'تنظيف',
  'action.potty': 'مرحاض',
  'action.talk': 'اضغط للتحدث',
  'action.style': 'مظهر',
  'nav.rooms': 'غرف',
  'nav.cards': 'بطاقات',
  'nav.games': 'ألعاب',
  'nav.travel': 'سفر',
  'nav.skills': 'مهارات',
  'nav.pets': 'حيوانات',
  'nav.lang': 'لغة',
  'shop.title': 'متجر المظهر',
  'games.title': 'ألعاب صغيرة',
  'travel.title': 'سفر بالطائرة',
  'rooms.title': 'غرف المنزل',
  'cards.title': 'ألبوم البطاقات',
  'food.title': 'قائمة المطبخ',
  'lang.title': 'اللغة',
  'name.title': 'سمِّ حيوانك الأليف',
  'name.submit': 'ابدأ',
  'photo.title': 'كشك الصور',
  'photo.snap': 'التقط',
  'photo.close': 'تم',
}

const TABLES: Record<LocaleId, Dict> = { en, es, pt, fr, de, ru, tr, ar }

const LOCALE_KEY = 'petverse-locale'

export function loadLocale(): LocaleId {
  try {
    const raw = localStorage.getItem(LOCALE_KEY) as LocaleId | null
    if (raw && TABLES[raw]) return raw
  } catch {
    /* ignore */
  }
  return 'en'
}

export function saveLocale(id: LocaleId) {
  try {
    localStorage.setItem(LOCALE_KEY, id)
  } catch {
    /* ignore */
  }
}

export function t(locale: LocaleId, key: string): string {
  return TABLES[locale]?.[key] ?? TABLES.en[key] ?? key
}

export function isRtl(locale: LocaleId): boolean {
  return locale === 'ar'
}
