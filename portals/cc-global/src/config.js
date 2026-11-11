export const CONFIG = {
  // ✅ Verified 2026-10-16: HTTP 200, audio/mpeg, icy-name: Christiian Culture Global
  globalRadio: import.meta.env.VITE_GLOBAL_RADIO_URL || 'https://stream.zeno.fm/umej2cuqncluv',
  // ✅ Verified 2026-10-16: HTTP 200, audio/mpeg — World English Bible (eBible.org)
  globalBible: import.meta.env.VITE_GLOBAL_BIBLE_URL || 'https://ebible.org/eng-web/mp3/01_01_Matthew.mp3',
  api: import.meta.env.VITE_CONTENT_API || '/Global/api',
  support: import.meta.env.VITE_SUPPORT_URL || 'https://zrzutka.pl/rs4g4v',
  revolut: import.meta.env.VITE_SUPPORT_REVOLUT_URL || 'https://revolut.me/christianculture',
  stripe: import.meta.env.VITE_SUPPORT_STRIPE_URL || 'https://buy.stripe.com/cNicMZ8xeeIJfJ9bXYbsc00?locale=en',
  paypal: import.meta.env.VITE_SUPPORT_PAYPAL_URL || 'https://paypal.me/christianculture',
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'lumina-cc.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'lumina-cc',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:413985877183:web:b0c99a686a4fb1b875aa0a'
  }
};

export const SONGS = [
  {
    title: 'Now Is The Time',
    artist: 'JJ Beauvais',
    href: 'https://youtu.be/5-MJ-rfXiYY',
    image: 'now-is-the-time.webp',
    duration: '6:14',
    badge: 'NEW RELEASE',
    desc: 'A powerful call to repentance, prayer and spiritual revival.'
  },
  {
    title: 'Written In Heaven (Live)',
    artist: 'JJ Beauvais',
    href: 'https://youtu.be/6JrD-LbIvZ0',
    image: 'written-in-heaven.webp',
    duration: '6:47',
    badge: 'NEW RELEASE',
    desc: 'Inspired by Luke 10:20 — rejoice that your names are written in heaven.'
  }
];

export const PLAYLISTS = [
  {
    id: 'PL5VKLFQU7nyCuh4U3mIQLwxqcxjilGq1m',
    title: 'Christian Worship & Praise',
    titles: {
      en: 'Christian Worship & Praise',
      pl: 'Uwielbienie i Chwała',
      es: 'Alabanza y Adoración',
      pt: 'Louvor e Adoração',
      fr: 'Louange et Adoration',
      de: 'Anbetung & Lobpreis',
      hi: 'प्रशंसा और आराधना',
      id: 'Pujian & Penyembahan',
      sw: 'Sifa na Ibada',
      zh: '敬拜与赞美'
    },
    image: 'playlist-worship.webp',
    desc: 'Deep atmosphere of praise, heartfelt devotion and adoration.'
  },
  {
    id: 'PL5VKLFQU7nyA-q5ESfQpjxsAtJszeWePA',
    title: 'Faith and Inspiration',
    titles: {
      en: 'Faith and Inspiration',
      pl: 'Wiara i Inspiracja',
      es: 'Fe e Inspiración',
      pt: 'Fé e Inspiração',
      fr: 'Foi et Inspiration',
      de: 'Glaube und Inspiration',
      hi: 'विश्वास और प्रेरणा',
      id: 'Iman dan Inspirasi',
      sw: 'Imani na Maongozi',
      zh: '信心与启迪'
    },
    image: 'playlist-faith.webp',
    desc: 'Inspiring messages and music lifting spirits in everyday trials.'
  },
  {
    id: 'PL5VKLFQU7nyDotu7lsI_C0EjbE6KCdopf',
    title: 'Christian Living & Personal Growth',
    titles: {
      en: 'Christian Living & Personal Growth',
      pl: 'Życie chrześcijańskie i rozwój',
      es: 'Vida cristiana y crecimiento',
      pt: 'Vida cristã e crescimento',
      fr: 'Vie chrétienne et croissance',
      de: 'Christliches Leben & Reife',
      hi: 'मसीही जीवन और आत्मिक विकास',
      id: 'Kehidupan Kristen & Pertumbuhan',
      sw: 'Maisha ya Kikristo na Ukuaji',
      zh: '基督徒生活与成长'
    },
    image: 'playlist-growth.webp',
    desc: 'Biblical wisdom for family, character, work and relationships.'
  },
  {
    id: 'PL5VKLFQU7nyAJO8cEjGPbD2m7aCjkwMKM',
    title: 'Epic Instrumental Sounds',
    titles: {
      en: 'Epic Instrumental Sounds',
      pl: 'Muzyka instrumentalna',
      es: 'Música instrumental',
      pt: 'Música instrumental',
      fr: 'Musique instrumentale',
      de: 'Instrumentalmusik',
      hi: 'वाद्य संगीत',
      id: 'Musik Instrumental',
      sw: 'Muziki wa Ala',
      zh: '器乐音乐'
    },
    image: 'playlist-instrumental.webp',
    desc: 'Peaceful acoustic and orchestral melodies for prayer, focus and reflection.'
  },
  {
    id: 'PL5VKLFQU7nyCpcbDA-soPovlK3STsZh4g',
    title: 'Music for Every Season',
    titles: {
      en: 'Music for Every Season',
      pl: 'Muzyka na każdą porę',
      es: 'Música para cada tiempo',
      pt: 'Música para toda estação',
      fr: 'Musique pour chaque saison',
      de: 'Musik für jede Zeit',
      hi: 'हर मौसम का संगीत',
      id: 'Musik untuk Setiap Musim',
      sw: 'Muziki kwa Kila Majira',
      zh: '四季之音'
    },
    image: 'playlist-season.webp',
    desc: 'Acoustic harmonies, meditative peace and quiet moments with God.'
  }
];

export const ARTISTS = [
  {
    id: 'gerald-welch',
    name: 'Gerald Welch',
    role: 'Christian Songwriter & Composer',
    rolePl: 'Chrześcijański Kompozytor i Autor Pieśni',
    urlEn: '/Welch/en/',
    urlPl: '/Welch/pl/',
    image: 'gerald-artist.webp',
    archivalImage: 'gerald-1980s.webp',
    featuredTrack: 'WORLD WAR YOU',
    premiereDate: '2026-11-20',
    tag: 'FEATURED ARTIST',
    tagPl: 'WYRÓŻNIONY ARTYSTA',
    desc: 'Faith journey forged across four decades. Author of debut album THE CALL, upcoming album SECOND WIND, and the spiritual warfare rock anthem WORLD WAR YOU.',
    descPl: 'Autentyczna droga wiary trwająca ponad 40 lat. Twórca debiutanckiego albumu THE CALL, albumu SECOND WIND oraz zwiastuna radiowego WORLD WAR YOU.',
    albums: ['THE CALL', 'SECOND WIND'],
    singles: ['WORLD WAR YOU (ISRC QTA842643088)']
  },
  {
    id: 'jj-beauvais',
    name: 'JJ Beauvais',
    role: 'Gospel & Worship Artist',
    rolePl: 'Wokalista Gospel i Uwielbienia',
    urlEn: 'https://youtu.be/5-MJ-rfXiYY',
    urlPl: 'https://youtu.be/5-MJ-rfXiYY',
    image: 'now-is-the-time.webp',
    aspectRatio: '16/9',
    featuredTrack: 'Now Is The Time',
    tag: 'CONTEMPORARY WORSHIP',
    tagPl: 'WSPÓŁCZESNE UWIELBIENIE',
    desc: 'Passionate worship music calling the global church to repentance, prayer and spiritual revival.',
    descPl: 'Poruszające utwory uwielbienia wzywające do modlitwy, pokuty i duchowego przebudzenia.',
    albums: ['Written In Heaven'],
    singles: ['Now Is The Time']
  },
  {
    id: 'ark-of-fire',
    name: 'Ark of Fire',
    role: 'Christian Rock & Metal Project',
    rolePl: 'Projekt Chrześcijańskiego Rocka i Metalu',
    urlEn: '/ArkOfFire/en/',
    urlPl: '/ArkOfFire/pl/',
    image: 'ark-of-fire-hero.webp',
    aspectRatio: '16/9',
    featuredTrack: 'It Is Finished',
    premiereDate: '2026-10-19',
    tag: 'ARTIST SHOWCASE',
    tagPl: 'WIZYTÓWKA ARTYSTY',
    desc: 'Christian rock and metal from the Netherlands. Music for spiritual warfare, centered on the Gospel, grace and the sacrifice of Jesus Christ.',
    descPl: 'Chrześcijański rock i metal z Holandii. Muzyka duchowej walki, skoncentrowana na Ewangelii, Bożej łasce i ofierze Jezusa Chrystusa.',
    albums: ['HEARTS ABLAZE', 'FAITH'],
    singles: ['IT IS FINISHED']
  }
];

export const LANGS = [
  ['en', 'English', 'EN', 'M0 0h640v480H0z'],
  ['pl', 'Polski', 'PL', ''],
  ['es', 'Español', 'ES', ''],
  ['pt', 'Português', 'PT', ''],
  ['fr', 'Français', 'FR', ''],
  ['de', 'Deutsch', 'DE', ''],
  ['hi', 'हिन्दी', 'HI', ''],
  ['id', 'Bahasa Indonesia', 'ID', ''],
  ['sw', 'Kiswahili', 'SW', ''],
  ['zh', '中文', 'ZH', '']
];
