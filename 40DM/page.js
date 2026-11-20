'use strict';

const copy = {
  pl: {
    skip:'Przejdź do treści', planLink:'Plan 40 dni', roomLink:'Pokój modlitwy', support:'Wspieram to',
    title:'40 Dni Modlitwy', intro:'Zatrzymaj się przy Słowie Bożym. Wybierz swój dzień albo dołącz do wspólnej modlitwy w LUMI MESS.',
    heroLine:'Czterdzieści dni ze Słowem i modlitwą.', heroPlan:'Otwórz plan', gathering:'Modlimy się razem.', roomTitle:'Pokój modlitwy', preview:'Pokój w przygotowaniu',
    roomLead:'Dołącz już teraz przez WhatsApp.', roomCopy:'Po uruchomieniu dedykowany pokój otworzy się tutaj od razu po wejściu na stronę.',
    openRoom:'Otwórz w LUMI MESS ↗', whatsapp:'Dołącz przez WhatsApp ↗',
    planTitle:'Twój plan modlitwy', planCopy:'Wybierz dzień. Zaznacz go po modlitwie, żeby móc wrócić do swojego rytmu.',
    progressText:'ukończonych dni', local:'Postęp zapisuje się w tej przeglądarce.',
    temporary:'Postęp działa w tej sesji. Przeglądarka blokuje trwały zapis.',
    resources:'Modlitwa w ekosystemie CC', read:'Czytaj Słowo Boże ↗', audio:'Biblia Audio', listen:'Posłuchaj Pisma ↗',
    bcm:'Biblijny Czas Modlitwy', join:'Przejdź do BCM24 ↗', community:'Odwiedź społeczność ↗', top:'Wróć na górę ↑',
    heroAlt:'40 Dni Modlitwy — otwarta Biblia i wschód słońca nad zielonymi wzgórzami',
    range:'Zakres dni', choose:'Wybierz dzień', day:'Dzień', finished:'ukończony', done:'✓ Zaznacz jako ukończony',
    undo:'↶ Cofnij oznaczenie', frame:'Pokój 40 Dni Modlitwy w LUMI MESS',
    periods:[
      ['Zatrzymaj się','Wdzięczność','Uważność','Zaufanie','Pokój','Nadzieja','Słuchanie','Odpoczynek','Radość','Wierność'],
      ['Bliscy','Przebaczenie','Cierpliwość','Życzliwość','Rozmowa','Zrozumienie','Sąsiedzi','Samotność','Wspólnota','Pojednanie'],
      ['Odwaga','Rozeznanie','Pokora','Wytrwałość','Uczciwość','Mądrość','Służba','Codzienna praca','Hojność','Współczucie'],
      ['Zagubieni','Potrzebujący','Pokój na świecie','Jedność','Świadectwo','Misja','Nowy początek','Podziękowanie','Kolejny krok','Modlitwa dalej']
    ],
    prompts:[
      'Wybierz krótką chwilę ciszy. Opowiedz Bogu własnymi słowami, z czym dziś przychodzisz.',
      'Pomyśl o jednej osobie, której dotyczy ten temat. Pomódl się za nią i rozważ jeden gest życzliwości.',
      'Przynieś Bogu jedną sprawę związaną z tym tematem. Zastanów się nad małym krokiem, który możesz dziś podjąć.',
      'Pomódl się w tej sprawie za swoją wspólnotę i za ludzi, których jeszcze nie znasz.'
    ]
  },
  en: {
    skip:'Skip to content', planLink:'40-day plan', roomLink:'Prayer room', support:'Support this',
    title:'40 Days of Prayer', intro:'Take a moment with Scripture. Choose your day or join the community in prayer in LUMI MESS.',
    heroLine:'Forty days with Scripture and prayer.', heroPlan:'Open the plan', gathering:'Praying together.', roomTitle:'Prayer room', preview:'Room in preparation',
    roomLead:'Join the group on WhatsApp.', roomCopy:'Once activated, the dedicated room will open here as soon as you visit this page.',
    openRoom:'Open in LUMI MESS ↗', whatsapp:'Join via WhatsApp ↗',
    planTitle:'Your prayer plan', planCopy:'Choose a day. Mark it when you finish praying so you can return to your rhythm.',
    progressText:'days completed', local:'Your progress is saved in this browser.',
    temporary:'Progress lasts for this session. The browser has blocked permanent storage.',
    resources:'Prayer across Christian Culture', read:'Read Scripture ↗', audio:'Audio Bible', listen:'Listen to Scripture ↗',
    bcm:'Biblical Time of Prayer', join:'Visit BCM24 ↗', community:'Visit the community ↗', top:'Back to top ↑',
    heroAlt:'40 Days of Prayer — an open Bible and sunrise over green hills',
    range:'Day range', choose:'Choose a day', day:'Day', finished:'complete', done:'✓ Mark as complete',
    undo:'↶ Undo completion', frame:'40 Days of Prayer room in LUMI MESS',
    periods:[
      ['Pause','Gratitude','Attention','Trust','Peace','Hope','Listening','Rest','Joy','Faithfulness'],
      ['Loved ones','Forgiveness','Patience','Kindness','Conversation','Understanding','Neighbours','Loneliness','Community','Reconciliation'],
      ['Courage','Discernment','Humility','Perseverance','Integrity','Wisdom','Service','Daily work','Generosity','Compassion'],
      ['Those who feel lost','People in need','Peace in the world','Unity','Testimony','Mission','A new beginning','Thanksgiving','The next step','Keep praying']
    ],
    prompts:[
      'Take a short moment of silence. Tell God in your own words what you are bringing today.',
      'Think of one person connected to this theme. Pray for them and consider one act of kindness.',
      'Bring one concern about this theme to God. Consider a small step you can take today.',
      'Pray about this theme for your community and for people you have yet to meet.'
    ]
  }
};

const key = 'cc-40dm-preview-v1';
let canSave = true;
let saved = {};
try { saved = JSON.parse(localStorage.getItem(key)) || {}; } catch { canSave = false; }
const completed = new Set(Array.isArray(saved.completed) ? saved.completed.filter(day => Number.isInteger(day) && day >= 1 && day <= 40) : []);
let lang = saved.lang === 'en' ? 'en' : 'pl';
let day = Number.isInteger(saved.day) && saved.day >= 1 && saved.day <= 40 ? saved.day : 1;
const byId = id => document.getElementById(id);
const language = byId('language');
const periods = byId('periods');
const days = byId('days');
const done = byId('done');

function save() {
  try { localStorage.setItem(key, JSON.stringify({ lang, day, completed: [...completed] })); }
  catch { canSave = false; }
}

function makeChoice(label, value, active) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.dataset.value = String(value);
  button.setAttribute('aria-pressed', String(active));
  return button;
}

function render() {
  const t = copy[lang];
  const period = Math.floor((day - 1) / 10);
  document.documentElement.lang = lang;
  document.title = t.title + ' · Christian Culture';
  document.querySelectorAll('[data-i]').forEach(el => {
    if (el.id === 'title') return;
    el.textContent = el.dataset.i === 'local' && !canSave ? t.temporary : t[el.dataset.i];
  });
  const accent = document.createElement('i');
  const split = lang === 'pl' ? ['40 Dni ', 'Modlitwy'] : ['40 Days ', 'of Prayer'];
  accent.textContent = split[1];
  byId('title').replaceChildren(split[0], accent);
  document.querySelector('[data-aria="heroAlt"]').alt = t.heroAlt;
  language.textContent = lang === 'pl' ? 'EN' : 'PL';
  language.lang = lang === 'pl' ? 'en' : 'pl';
  language.setAttribute('aria-label', lang === 'pl' ? 'English' : 'Polski');
  periods.setAttribute('aria-label', t.range);
  days.setAttribute('aria-label', t.choose);
  periods.replaceChildren(...t.periods.map((_, index) => makeChoice((index * 10 + 1) + '–' + (index + 1) * 10, index, index === period)));
  days.replaceChildren(...t.periods[period].map((_, index) => {
    const number = period * 10 + index + 1;
    const marked = completed.has(number);
    const button = makeChoice(String(number).padStart(2, '0'), number, number === day);
    button.classList.toggle('complete', marked);
    button.setAttribute('aria-label', t.day + ' ' + number + (marked ? ', ' + t.finished : ''));
    return button;
  }));
  byId('progress-count').textContent = completed.size + ' / 40';
  byId('hero-day').textContent = String(day).padStart(2, '0');
  document.querySelector('.progress-track').style.setProperty('--done', (completed.size / 40 * 100) + '%');
  byId('note-day').textContent = t.day + ' ' + day;
  byId('note-title').textContent = t.periods[period][(day - 1) % 10];
  byId('note-copy').textContent = t.prompts[period];
  done.textContent = completed.has(day) ? t.undo : t.done;
  done.setAttribute('aria-pressed', String(completed.has(day)));
  const frame = document.querySelector('.room-frame');
  if (frame) frame.title = t.frame;
}

function selectFrom(group, convert) {
  group.addEventListener('click', event => {
    const target = event.target.closest('button[data-value]');
    if (!target) return;
    const value = Number(target.dataset.value);
    day = convert(value);
    save();
    render();
    group.querySelector('[data-value="' + value + '"]').focus({preventScroll:true});
  });
}

selectFrom(periods, index => index * 10 + 1);
selectFrom(days, number => number);
done.addEventListener('click', () => {
  if (completed.has(day)) completed.delete(day);
  else completed.add(day);
  save();
  render();
});
language.addEventListener('click', () => {
  lang = lang === 'pl' ? 'en' : 'pl';
  save();
  render();
});

// Wstaw rzeczywisty identyfikator po rejestracji i sprawdzeniu pokoju w LUMI MESS.
const roomId = null;
if (roomId && location.origin === 'https://polskieradio.cc') {
  const fullUrl = new URL('/mess', location.origin);
  fullUrl.searchParams.set('room', roomId);
  const open = byId('room-open');
  open.href = fullUrl;
  open.hidden = false;
  fullUrl.searchParams.set('embed', '1');
  const frame = document.createElement('iframe');
  frame.className = 'room-frame';
  frame.title = copy[lang].frame;
  frame.src = fullUrl;
  byId('room-preview').replaceWith(frame);
}
render();


if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      target.classList.add('arrived');
      observer.unobserve(target);
    });
  }, { threshold: 0.08 });
  const motion = '.gathering-copy>*, .room-head, .room-preview, .room-actions, .journal-head>*, .calendar, .day-note, .resources h2, .resource-grid>a';
  document.querySelectorAll(motion).forEach(element => observer.observe(element));
}
