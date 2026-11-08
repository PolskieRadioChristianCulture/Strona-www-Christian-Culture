import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { Window } from 'happy-dom';

const script = readFileSync('js/cc-daily-course-share.js', 'utf8');
test('subscription enrollment mounts by default; can be disabled with false',()=>{
  const w=mount();
  assert.ok(w.document.querySelector('script[src*="cc-daily-course-subscription"]'));
  assert.ok(w.document.querySelector('script[src*="cc-daily-course-subscription"]').src.endsWith('?v=20261009_coursekv2'));
  w.close();
  const wDisabled=mount('/akademia/kurscodzienny/dzien-08',()=>{},win=>{win.CC_DAILY_COURSE_SUBSCRIPTIONS_ENABLED=false;});
  assert.equal(wDisabled.document.querySelector('script[src*="cc-daily-course-subscription"]'),null);
  wDisabled.close();
});
test('guest invitation is free, nonblocking, and follows actual auth rather than event identity',()=>{
  const w=mount();const invitation=w.document.getElementById('ccDailyAccountInvitation');
  assert.equal(invitation.hidden,false);
  assert.match(invitation.textContent,/bezpłatnie/);
  assert.match(invitation.textContent,/pozostaje dostępne bez konta/);
  assert.equal(invitation.querySelector('a').getAttribute('href'),'/lumina-login');
  w.dispatchEvent(new w.CustomEvent('lumina-auth-state',{detail:{user:{uid:'fake'}}}));
  assert.equal(invitation.hidden,false);
  w.firebaseAuth={currentUser:{uid:'synthetic',isAnonymous:false}};
  w.dispatchEvent(new w.Event('lumina-auth-state'));assert.equal(invitation.hidden,true);
  w.firebaseAuth.currentUser={isAnonymous:true};
  w.dispatchEvent(new w.Event('lumina-auth-state'));assert.equal(invitation.hidden,false);
  w.eval(script);assert.equal(w.document.querySelectorAll('#ccDailyAccountInvitation').length,1);
  w.close();
});
const CHANNEL = 'https://whatsapp.com/channel/0029VbE8sXK6xCSOTjPi7o2P';
test('kanał WhatsApp: jeden blok tuż pod panelem udostępniania, bezpieczny link',()=>{
  const w=mount();const box=w.document.getElementById('ccWaChannel');
  assert.ok(box);
  assert.equal(box.previousElementSibling.id,'ccDailyShare');
  assert.equal(box.nextElementSibling.id,'ccDailyAccountInvitation');
  const a=box.querySelector('a');
  assert.equal(a.getAttribute('href'),CHANNEL);
  assert.equal(a.getAttribute('target'),'_blank');
  assert.equal(a.getAttribute('rel'),'noopener noreferrer');
  assert.match(box.textContent,/nie widzi Twojego numeru/);
  w.eval(script);assert.equal(w.document.querySelectorAll('#ccWaChannel').length,1);
  w.close();
});
test('kanał WhatsApp działa też na lekcji z panelem #ccDailyShare wpisanym w HTML (np. dzień 39)',()=>{
  const w=new Window({url:'https://polskieradio.cc/akademia/kurscodzienny/dzien-39'});
  w.document.write('<title>Dzień 39</title><main><section id="ccDailyShare">statyczny</section><p id="po">dalej</p></main>');
  const calls=[];w.gtag=(...args)=>calls.push(args);
  w.eval(script);
  const box=w.document.getElementById('ccWaChannel');
  assert.ok(box,'blok kanału musi się pojawić mimo wczesnego return');
  assert.equal(box.previousElementSibling.id,'ccDailyShare');
  box.querySelector('a').dispatchEvent(new w.Event('click'));
  assert.deepEqual(JSON.parse(JSON.stringify(calls[0])),['event','select_content',{content_type:'whatsapp_channel',item_id:'biblijna-akademia'}]);
  w.close();
});
test('kanał WhatsApp nie pojawia się poza Kursem Codziennym',()=>{
  const w=mount('/akademia');
  assert.equal(w.document.getElementById('ccWaChannel'),null);
  w.close();
});
function mount(path = '/akademia/kurscodzienny/dzien-08', navigatorSetup = () => {}, windowSetup = () => {}) {
  const window = new Window({url: 'https://polskieradio.cc' + path});
  window.document.write('<title>Dzień 8 — Wieża Babel</title><main><section><a href="/tablica?share=dzien-07">Stary link</a></section></main>');
  navigatorSetup(window.navigator);
  windowSetup(window);
  window.eval(script);
  return window;
}
test('każda istniejąca lekcja, alias i katalog ładuje jeden wspólny panel i standardowy przycisk powrotu na górę', () => {
  let count = 0;
  function scan(dir) {
    for (const entry of readdirSync(dir, {withFileTypes: true})) {
      const path = dir + '/' + entry.name;
      if (entry.isDirectory()) scan(path);
      else if (path.endsWith('.html')) {
        const content = readFileSync(path, 'utf8');
        assert.equal((content.match(/cc-daily-course-share\.js/g) || []).length, 1, path);
        assert.ok(content.includes('cc-daily-course-share.js?v=20261108_wa1'),path+' musi ładować aktualną subskrypcję');
        assert.ok(content.includes('id="backToTopBtn"'), path + ' musi zawierać id="backToTopBtn"');
        if (path.includes('dzien-')) {
          assert.ok(content.includes('id="kcJumpShareBtn"'), path + ' musi zawierać id="kcJumpShareBtn"');
          assert.ok(content.includes('fa-arrow-down'), path + ' musi zawierać ikonę strzałki w dół fa-arrow-down');
        }
        count++;
      }
    }
  }
  scan('akademia/kurscodzienny'); scan('kursy/kurscodzienny');
  for (const path of ['akademia.html','akademia/index.html','kursy.html','kursy/index.html','akademia/kurscodzienny.html','kursy/kurscodzienny.html']) {
    const content = readFileSync(path, 'utf8');
    assert.equal((content.match(/cc-daily-course-share\.js/g) || []).length, 1);
    assert.ok(content.includes('id="backToTopBtn"'), path + ' musi zawierać id="backToTopBtn"');
  }
  assert.ok(count >= 24);
});
test('Dzień 8 i alias udostępniają Dzień 8, nie 7; siedem kanałów', () => {
  for (const path of ['/akademia/kurscodzienny/dzien-08','/kursy/kurscodzienny/dzien-08/index.html']) {
    const w = mount(path);
    const links = [...w.document.querySelectorAll('#ccDailyShare a')];
    assert.equal(links.length, 6);
    const lumina = new URL(links[0].href);
    assert.equal(lumina.searchParams.get('share_url'), 'https://polskieradio.cc/akademia/kurscodzienny/dzien-08');
    assert.ok(lumina.searchParams.get('share_text').includes('/dzien-08'));
    assert.equal(w.document.querySelector('a[href*="share=dzien-07"]'), null);
    for (const a of links.filter(a => a.target === '_blank')) assert.equal(a.rel, 'noopener noreferrer');
    w.eval(script);
    assert.equal(w.document.querySelectorAll('#ccDailyShare').length, 1);
    w.close();
  }
});
test('kurs w akademii nie udostępnia losowego dnia', () => {
  const w = mount('/akademia#kurscodzienny');
  const link = new URL(w.document.querySelector('#ccDailyShare a').href);
  assert.equal(link.searchParams.get('share_url'), 'https://polskieradio.cc/akademia#kurscodzienny');
  w.close();
});
test('same ikony zachowują nazwy dostępności, tooltip i cele 44x44', () => {
  const w = mount();
  for (const control of w.document.querySelectorAll('#ccDailyShare a, #ccDailyShare button')) {
    assert.ok(control.getAttribute('aria-label'));
    assert.equal(control.title, control.getAttribute('aria-label'));
    assert.equal(control.firstElementChild.getAttribute('aria-hidden'), 'true');
    assert.equal(control.style.width, '44px');
    assert.equal(control.style.height, '44px');
    assert.notEqual(control.textContent, control.getAttribute('aria-label'));
  }
  w.close();
});
test('schowek: sukces dopiero po zapisie, odmowa daje ręczną kopię', async () => {
  let value;
  const w = mount(undefined, nav => Object.defineProperty(nav, 'clipboard', {value: {writeText: async text => {value = text;}}, configurable:true}));
  w.document.querySelector('button').click(); await new Promise(resolve => setTimeout(resolve, 0));
  assert.ok(value.endsWith('/dzien-08'));
  assert.equal(w.document.querySelector('[role="status"]').textContent, 'Link skopiowany.');
  Object.defineProperty(w.navigator, 'clipboard', {value: {writeText: async () => {throw Error('denied');}}});
  w.document.querySelector('button').click(); await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(w.document.querySelector('label').hidden, false);
  assert.ok(w.document.querySelector('input').value.endsWith('/dzien-08'));
  w.close();
});
test('natywne udostępnianie opcjonalne; anulowanie nie zgłasza sukcesu', async () => {
  const w = mount(undefined, nav => Object.defineProperty(nav, 'share', {value: async () => {throw Object.assign(Error('cancel'), {name:'AbortError'});}}));
  const b = w.document.querySelector('button[aria-label="Więcej aplikacji…"]');
  assert.ok(b);
  b.click(); await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(w.document.querySelector('[role="status"]').textContent, '');
  w.close();
});

test('standardowy przycisk powrotu na górę (#backToTopBtn) jest zamontowany, dostępny i reaguje na scroll oraz click', () => {
  let scrolledTo = null;
  const w = mount('/akademia/kurscodzienny/dzien-01', () => {}, win => {
    win.scrollTo = (options) => { scrolledTo = options; };
  });
  const btn = w.document.getElementById('backToTopBtn');
  assert.ok(btn, 'Przycisk #backToTopBtn musi istnieć');
  assert.ok(btn.classList.contains('back-to-top'), 'Musi mieć klasę back-to-top');
  assert.equal(btn.getAttribute('aria-label'), 'Przewiń do góry');
  assert.equal(btn.title, 'Przewiń do góry');
  assert.ok(btn.querySelector('i'), 'Musi zawierać ikonę strzałki');

  // Na starcie (scrollY = 0) nie powinien mieć klasy visible
  assert.equal(btn.classList.contains('visible'), false);

  // Po przewinięciu powyżej 300px
  w.document.documentElement.scrollTop = 450;
  w.dispatchEvent(new w.Event('scroll'));
  assert.equal(btn.classList.contains('visible'), true);

  // Po powrocie do góry
  w.document.documentElement.scrollTop = 100;
  w.dispatchEvent(new w.Event('scroll'));
  assert.equal(btn.classList.contains('visible'), false);

  // Kliknięcie wywołuje scrollTo({ top: 0, behavior: 'smooth' })
  btn.click();
  assert.equal(scrolledTo?.top, 0);
  assert.equal(scrolledTo?.behavior, 'smooth');

  // Wielokrotna ewaluacja nie duplikuje przycisku
  w.eval(script);
  assert.equal(w.document.querySelectorAll('#backToTopBtn').length, 1);
  w.close();
});

test('kanoniczny panel dzielenia się lekcją zawiera 8 okrągłych akcji w jednym wierszu', () => {
  const w = mount('/akademia/kurscodzienny/dzien-09', nav => Object.defineProperty(nav, 'share', {value: async () => {}, configurable: true}));
  const panel = w.document.getElementById('ccDailyShare');
  assert.ok(panel, '#ccDailyShare musi istnieć');
  assert.equal(panel.querySelector('h2').textContent, 'Podziel się tą lekcją');
  assert.ok(panel.textContent.includes('Wybierz, komu i gdzie chcesz przekazać link. Udostępnianie nie wymaga konta LUMINA.'));

  const actions = panel.querySelector('.cc-daily-share-actions');
  assert.ok(actions, 'Pasek akcji musi istnieć');
  const buttons = actions.querySelectorAll('a, button');
  assert.equal(buttons.length, 8, 'Dokładnie 8 akcji udostępniania (w tym natywne Web Share API)');

  w.close();
});

test('widok katalogu kursu ma dedykowany nagłówek zaproszenia', () => {
  const w = mount('/akademia#kurscodzienny');
  const panel = w.document.getElementById('ccDailyShare');
  assert.equal(panel.querySelector('h2').textContent, 'Zaproś do codziennego kursu');
  w.close();
});
