'use strict';
(function () {
  // Shared pure logic: the browser UI and Node tests use exactly these functions.
  function toCents(value) {
    const text = String(value).trim();
    if (!/^\d{1,9}(?:[.,]\d{1,2})?$/.test(text)) throw new RangeError('INVALID_AMOUNT');
    const [whole, fraction = ''] = text.replace(',', '.').split('.');
    const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
    if (cents > 10000000000) throw new RangeError('INVALID_AMOUNT');
    return cents;
  }
  function difference(income, costs) { return toCents(income) - toCents(costs); }
  function draftText(data, lang) {
    const single = value => String(value).replace(/[\r\n\u0000-\u001f]/g, ' ').trim();
    const pl = lang === 'pl';
    return [pl ? 'Zgłoszenie wolontariackie — Christian Culture' : 'Volunteer enquiry — Christian Culture', '',
      `${pl ? 'Imię i nazwisko' : 'Full name'}: ${single(data.name)}`,
      `${pl ? 'E-mail' : 'Email'}: ${single(data.email)}`,
      `${pl ? 'Specjalizacja' : 'Specialty'}: ${single(data.specialty)}`, '',
      pl ? 'Dostępność i doświadczenie:' : 'Availability and experience:', String(data.availability).replace(/\u0000/g, '').trim(), '',
      pl ? 'Proszę o kontakt w sprawie możliwej współpracy wolontariackiej.' : 'Please contact me about possible volunteer collaboration.'
    ].join('\n');
  }
  function mailUrl(text, lang) {
    const subject = lang === 'pl' ? 'Wolontariat — Christian Culture' : 'Volunteering — Christian Culture';
    return `mailto:wolontariat@polskieradio.cc?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  }
  // Gmail w przeglądarce: działa także bez domyślnego programu pocztowego (mailto: wtedy nic nie robi)
  function gmailUrl(text, lang) {
    const subject = lang === 'pl' ? 'Wolontariat — Christian Culture' : 'Volunteering — Christian Culture';
    return `https://mail.google.com/mail/?view=cm&fs=1&to=wolontariat@polskieradio.cc&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { toCents, difference, draftText, mailUrl, gmailUrl };
  if (typeof document === 'undefined') return;

  const en = {
    urgentTitle:"Need urgent help?", urgent112:"If life or health is at risk, call:", urgentCrisis:"Emotional crisis (Poland) — Support Centre, free and 24/7:", urgentCrisisChat:"chat and email: centrumwsparcia.pl", urgentLegal:"Free legal advice in Poland, including debt matters:", urgentLegalLink:"free legal aid points (Gov.pl) ↗", urgentNote:"These are external services. Christian Culture does not run a crisis line.",
    responsibilityTitle:'Important: the role of Christian Culture', responsibilityShort:'Christian Culture helps you connect with independent specialists and support providers. Each provider is responsible for their own advice and the way they provide support. A conversation does not guarantee a particular outcome.', responsibilityMore:'Terms of use and scope of responsibility', responsibilityLink:'Understand CC’s role and responsibility →',
    responsibilityFull1:'Christian Culture — Christian Social Initiative provides information and organisational support to facilitate contact with independent specialists, volunteers and support providers. Making contact details available does not itself mean that Christian Culture provides medical treatment, psychotherapy, legal services or financial advice.',
    responsibilityFull2:'Each support provider is responsible for their own statements and recommendations, the conduct of the meeting and working within their qualifications and professional authorisation. The scope and terms of support should be agreed directly with that provider.',
    responsibilityFull3:'Christian Culture does not guarantee a particular outcome and does not assume responsibility for independent professional advice, users’ own decisions or their consequences, subject to any responsibility imposed by applicable law. Users should consider their own circumstances and consult an appropriately qualified professional where professional authorisation is required.',
    responsibilityFull4:'This notice does not exclude Christian Culture’s responsibility for its own acts or omissions, or limit users’ rights under applicable law. Support conversations are not an emergency service or a crisis intervention service.',
    skip:'Skip to content', brandSub:'FAITH · SUPPORT · HOPE', navLabel:'Page navigation', guides:'Guides', findHelp:'Where to find help', volunteerNav:'Volunteering', support:'Support us', openMenu:'Open side panel', closeMenu:'Close side panel',
    heroLabel:'CHRISTIAN CULTURE · HELP', heroLine1:'Step out of debt.', heroLine2:'Find peace again.', heroLead:'Practical steps, reliable information and support rooted in Christian values.', firstStep:'Take the first step', findHelpShort:'Find help →', heroNote:'No judgement. No promises of quick fixes. Respect for your situation.', heroAlt:'A notebook, calculator and envelopes on a table in warm daylight', photoCaption:'A good beginning: seeing your situation clearly.',
    stepsLabel:'Three first steps', step1:'Organise your commitments', step2:'Explore your options', step3:'Plan your next step', guidesTitle:'Help begins with knowledge.', guidesLead:'Start with one thing you can organise today.', articleAlt1:'Envelopes and a notebook', articleAlt2:'A notebook for organising a household budget', category1:'A FIRST STEP', category2:'HOUSEHOLD FINANCES', articleTitle1:'Keep your documents together.', articleTitle2:'A budget without the chaos.', articleDesc1:'An inventory of documents can help you prepare for a conversation with a qualified professional.', articleDesc2:'See income and expenses together. This simple worksheet needs no account.', readGuide:'Read the guide →', openWorksheet:'Open the worksheet →',
    recruitLabel:'HELP GOOD THINGS HAPPEN', recruitTitle:'Your time could help someone.', vacancy:'Volunteer opportunity — position open', recruitDesc:'Are you a lawyer or adviser? Would you like to share your experience? Let’s talk about working together.', recruitCta:'Enquire as a specialist →',
    worksheetLabel:'A SMALL STEP TOWARDS CLARITY', worksheetTitle:'See your month clearly.', worksheetLead:'Enter approximate amounts. This worksheet only shows income minus expenses. It does not recommend repayments or assess creditworthiness.', worksheetPrivacy:'Amounts are calculated in this browser tab. We do not store them or send them to a server.', worksheetNoJs:'The worksheet needs JavaScript. You can also write income and expenses on paper and subtract expenses from income.', income:'Monthly net income (PLN)', costs:'Total monthly expenses (PLN)', costsHint:'Include planned debt payments. Do not enter account numbers or identification details.', calculate:'Calculate the difference →', clear:'Clear amounts',
    helpTitle:'Where to find help?', helpLead:'Official resources for people in Poland. These are external organisations, not a claim of partnership with CC.', resource1Title:'Free legal assistance', resource1Desc:'Read the eligibility rules and ways to book advice on Gov.pl.', resource2Title:'Consumer assistance', resource2Desc:'UOKiK lists sources of assistance for disputes about purchases and services.', resourcesNote:'Links open official websites in a new tab. Sources checked on 27 October 2026. Confirm the current terms with the provider.',
    hopeLabel:'FAITH AND RESPONSIBILITY', hopeTitle:'You are more than this difficulty.', hopeCopy:'Your financial situation does not define your worth. In the spirit of Galatians 6:2, we encourage mutual support and finding a way forward together.', bibleCta:'Open the Bible →',
    volunteerLabel:'HELP BUILD A SUPPORT NETWORK', volunteerTitle:'Share your experience.', volunteerLead:'We are looking for people willing to give some time to responsible support. We will discuss the scope, qualifications and availability individually.', volunteerHonesty:'We do not advertise staffed sessions or specialist availability before these have been confirmed.', formTitle:'Prepare an enquiry', formIntro:'This prepares a draft, not a submission. Download it or open it in your email application, review it and send it yourself.', nameLabel:'Full name', emailLabel:'Reply email address', specialtyLabel:'Specialty', availabilityLabel:'Availability and a few words about your experience', dataMinimisation:'Do not enter client information, health or religious information, or identification numbers. This page does not save these fields. Email is processed by your chosen email provider.', draftConfirm:'I understand that preparing a draft does not send it or confirm acceptance of my enquiry.', prepareDraft:'Prepare a draft →', draftStatus:'Your draft is ready. No message has been sent.', downloadDraft:'Download TXT file', openEmail:'Open in email app →', openGmail:'Open in Gmail', copyDraft:'Copy text', emailFallback:'No email app? Use Gmail or copy the text and send it from any mailbox to polskiercctv@gmail.com. This page cannot confirm delivery.',
    faqTitle:'Good to know.', q1:'Does Christian Culture already provide legal advice?', a1:'This page offers educational materials and links to official resources. We do not claim to have lawyers or staffed advice sessions available. Contact a qualified professional about your individual circumstances.', q2:'Do I have to donate to use this page?', a2:'No. Reading the materials and using the worksheet require no payment. Supporting Christian Culture is entirely voluntary.', q3:'Do you save my amounts and enquiry?', a3:'This page uses Google Analytics for visit analytics; the worksheet and enquiry draft are not saved in a CC database. Amounts and draft details stay in the open page’s memory until it is reloaded. A downloaded file remains on your device; a sent email is handled by the sender’s and recipient’s email providers.',
    supportTitle:'Help us help others.', supportCopy:'Support accessible Christian Culture resources and tools. Voluntarily, on your own terms.', mission:'Serving God and people.', disclaimer:'Educational resources do not replace individual legal or financial advice.', panelTitle:'Close to what matters.', panelNav:'Christian Culture ecosystem', academy:'Academy', panelNote:'Help begins with care for another person.', closeArticle:'Close guide', guideLabel:'GUIDE · A FIRST STEP',
    articleFullLead:'Organising information helps you describe your situation. This prepares you for a conversation; it is not a set of legal instructions.', articleFull1:'Gather letters you have received, agreements and payment confirmations.', articleFull2:'Note when documents arrived and any dates mentioned. Do not determine legal consequences yourself based on this guide.', articleFull3:'Prepare a short list of questions to ask a qualified professional.', articleFull4:'Use official contact channels. Do not send document scans to unfamiliar people.', officialHelp:'Check the official help resource ↗'
  };
  const pl = {"urgentTitle":"Potrzebujesz pilnej pomocy?","urgent112":"Zagrożenie życia lub zdrowia — zadzwoń:","urgentCrisis":"Kryzys psychiczny — Centrum Wsparcia, bezpłatnie i całodobowo:","urgentCrisisChat":"czat i e-mail: centrumwsparcia.pl","urgentLegal":"Bezpłatna pomoc prawna, także w sprawach zadłużenia:","urgentLegalLink":"punkty nieodpłatnej pomocy prawnej (Gov.pl) ↗","urgentNote":"To instytucje zewnętrzne. Christian Culture nie prowadzi dyżuru kryzysowego.","skip":"Przejdź do treści","brandSub":"WIARA · WSPARCIE · NADZIEJA","guides":"Poradniki","findHelp":"Gdzie szukać pomocy","volunteerNav":"Wolontariat","support":"Wspieram to","heroLabel":"CHRISTIAN CULTURE · POMOC","heroLine1":"Wyjść z długów.","heroLine2":"Odzyskać spokój.","heroLead":"Praktyczne kroki, rzetelne informacje i wsparcie w duchu chrześcijańskich wartości.","firstStep":"Zacznij od pierwszego kroku","findHelpShort":"Znajdź pomoc →","heroNote":"Bez oceniania. Bez obietnic szybkich rozwiązań. Z szacunkiem do Twojej sytuacji.","photoCaption":"Dobry początek: zobaczyć swoją sytuację jasno.","step1":"Uporządkuj zobowiązania","step2":"Poznaj swoje możliwości","step3":"Zaplanuj kolejny krok","responsibilityTitle":"Ważne: rola Christian Culture","responsibilityShort":"Christian Culture ułatwia kontakt z niezależnymi specjalistami i osobami udzielającymi wsparcia. Za treść własnych porad i sposób świadczenia pomocy odpowiada osoba, która jej udziela. Udział w rozmowie nie gwarantuje określonego rezultatu.","responsibilityMore":"Zasady korzystania i zakres odpowiedzialności","responsibilityFull1":"Christian Culture — Chrześcijańska Inicjatywa Społeczna pełni rolę informacyjną i organizacyjną, ułatwiając nawiązanie kontaktu z niezależnymi specjalistami, wolontariuszami i osobami udzielającymi wsparcia. Samo udostępnienie kontaktu nie oznacza, że Christian Culture świadczy usługę medyczną, psychoterapeutyczną, prawną lub doradztwo finansowe.","responsibilityFull2":"Osoba udzielająca pomocy odpowiada za treść swoich wypowiedzi i zaleceń, sposób prowadzenia spotkania oraz działanie w granicach posiadanych kwalifikacji i uprawnień. Zakres pomocy i zasady współpracy należy ustalić bezpośrednio z tą osobą.","responsibilityFull3":"Christian Culture nie gwarantuje określonych efektów spotkań ani nie przejmuje odpowiedzialności za niezależne porady specjalistów, samodzielne decyzje użytkownika i ich następstwa, z zastrzeżeniem odpowiedzialności wynikającej z obowiązujących przepisów. Użytkownik powinien podejmować decyzje po uwzględnieniu własnej sytuacji, a w sprawach wymagających uprawnień zawodowych — po konsultacji z właściwym specjalistą.","responsibilityFull4":"Niniejsza informacja nie wyłącza odpowiedzialności Christian Culture za własne działania lub zaniechania ani nie ogranicza praw użytkownika wynikających z obowiązujących przepisów. Rozmowy wspierające nie są usługą ratunkową ani interwencją kryzysową.","guidesTitle":"Pomoc zaczyna się od wiedzy.","guidesLead":"Zacznij od jednej rzeczy, którą możesz uporządkować dzisiaj.","category1":"PIERWSZY KROK","articleTitle1":"Zbierz dokumenty w jednym miejscu.","articleDesc1":"Spis dokumentów pomoże przygotować się do rozmowy z wykwalifikowaną osobą.","readGuide":"Przeczytaj poradnik →","category2":"DOMOWE FINANSE","articleTitle2":"Domowy budżet bez chaosu.","articleDesc2":"Zobacz przychody i wydatki razem. Prosty arkusz nie wymaga zakładania konta.","openWorksheet":"Otwórz arkusz →","recruitLabel":"DOŁĄCZ DO DOBRA","recruitTitle":"Twój czas może komuś pomóc.","vacancy":"Wolontariacki wakat — stanowisko wolne","recruitDesc":"Jesteś prawnikiem lub doradcą? Chcesz dzielić się doświadczeniem? Porozmawiajmy o współpracy.","recruitCta":"Zgłoś się jako specjalista →","worksheetLabel":"MAŁY KROK, WIĘCEJ JASNOŚCI","worksheetTitle":"Zobacz swój miesiąc.","worksheetLead":"Wpisz orientacyjne kwoty. Arkusz pokazuje wyłącznie różnicę między przychodami a wydatkami — nie dobiera rat ani nie ocenia zdolności kredytowej.","worksheetPrivacy":"Kwoty są liczone w tej karcie przeglądarki. Nie zapisujemy ich i nie wysyłamy na serwer.","worksheetNoJs":"Arkusz wymaga JavaScript. Możesz też zapisać przychody i wydatki na kartce, a potem obliczyć różnicę.","income":"Miesięczne przychody netto (PLN)","costs":"Łączne miesięczne wydatki (PLN)","costsHint":"Uwzględnij również zaplanowane płatności zobowiązań. Nie podawaj danych kont ani numerów dokumentów.","calculate":"Oblicz różnicę →","clear":"Wyczyść kwoty","helpTitle":"Gdzie szukać pomocy?","helpLead":"Oficjalne źródła dla osób w Polsce. To instytucje zewnętrzne, nie deklaracja partnerstwa z CC.","resource1Title":"Nieodpłatna pomoc prawna","resource1Desc":"Sprawdź na Gov.pl zasady korzystania z pomocy i sposoby zapisania się na poradę.","resource2Title":"Pomoc dla konsumentów","resource2Desc":"UOKiK wskazuje miejsca pomocy w sporach dotyczących zakupów i usług.","resourcesNote":"Linki otwierają oficjalne strony w nowej karcie. Źródła sprawdzono 27.10.2026; warunki pomocy sprawdzaj bezpośrednio u jej organizatora.","hopeLabel":"WIARA I ODPOWIEDZIALNOŚĆ","hopeTitle":"Nie jesteś swoją trudnością.","hopeCopy":"Twoja sytuacja finansowa nie określa Twojej wartości. W duchu Ga 6,2 zachęcamy do wzajemnego wsparcia i wspólnego szukania drogi naprzód.","bibleCta":"Sięgnij do Biblii →","volunteerLabel":"WSPÓŁTWÓRZ SIEĆ WSPARCIA","volunteerTitle":"Podziel się doświadczeniem.","volunteerLead":"Szukamy osób gotowych poświęcić część czasu na odpowiedzialną pomoc. Zakres współpracy, kwalifikacje i dostępność ustalimy indywidualnie.","volunteerHonesty":"Nie ogłaszamy obsadzonych dyżurów ani dostępności specjalistów przed ich potwierdzeniem.","formTitle":"Przygotuj zgłoszenie","formIntro":"To szkic wiadomości, nie wysyłka. Pobierz go lub otwórz w swojej poczcie, sprawdź i wyślij samodzielnie.","responsibilityLink":"Poznaj rolę CC i zasady odpowiedzialności →","nameLabel":"Imię i nazwisko","emailLabel":"Adres e-mail do odpowiedzi","specialtyLabel":"Specjalizacja","availabilityLabel":"Dostępność i kilka słów o doświadczeniu","dataMinimisation":"Nie wpisuj danych klientów, informacji o zdrowiu, wyznaniu ani numerów dokumentów. Pola nie są zapisywane przez stronę. E-mail będzie przetwarzany przez wybranego dostawcę poczty.","draftConfirm":"Rozumiem, że przygotowanie szkicu nie oznacza wysłania ani przyjęcia zgłoszenia.","prepareDraft":"Przygotuj szkic →","draftStatus":"Szkic gotowy. Wiadomość nie została wysłana.","downloadDraft":"Pobierz plik TXT","openEmail":"Otwórz w programie pocztowym →","openGmail":"Otwórz w Gmailu","copyDraft":"Kopiuj treść","emailFallback":"Nie masz programu pocztowego? Użyj Gmaila albo skopiuj treść i wyślij ją z dowolnej skrzynki na polskiercctv@gmail.com. Ta strona nie potwierdza doręczenia.","faqTitle":"Warto wiedzieć.","q1":"Czy Christian Culture udziela już porad prawnych?","a1":"Ta strona udostępnia materiały edukacyjne i odsyła do oficjalnych źródeł. Nie deklarujemy dostępności własnych prawników ani dyżurów. W indywidualnej sprawie skontaktuj się z uprawnionym specjalistą.","q2":"Czy muszę wesprzeć misję, żeby korzystać ze strony?","a2":"Nie. Czytanie materiałów i korzystanie z arkusza nie wymaga wpłaty. Wsparcie Christian Culture jest całkowicie dobrowolne.","q3":"Czy zapisujecie moje kwoty i zgłoszenie?","a3":"Strona korzysta z Google Analytics do analizy odwiedzin; arkusz i szkic zgłoszenia nie są zapisywane w bazie CC. Kwoty i szkic zgłoszenia istnieją w pamięci otwartej strony, dopóki jej nie odświeżysz. Pobrany plik pozostaje na Twoim urządzeniu; wysłana wiadomość trafia do dostawców poczty nadawcy i odbiorcy.","supportTitle":"Pomóż nam pomagać.","supportCopy":"Wspieraj rozwój dostępnych treści i narzędzi Christian Culture. Dobrowolnie, na własnych zasadach.","mission":"Służymy Bogu i człowiekowi.","disclaimer":"Materiały edukacyjne nie zastępują indywidualnej porady prawnej ani finansowej.","panelTitle":"Blisko tego, co ważne.","academy":"Akademia","panelNote":"Pomoc zaczyna się od uważności na człowieka.","guideLabel":"PORADNIK · PIERWSZY KROK","articleFullLead":"Uporządkowanie informacji pomaga opisać swoją sytuację. To przygotowanie do rozmowy, nie instrukcja rozstrzygnięcia sprawy.","articleFull1":"Zgromadź otrzymane pisma, umowy i potwierdzenia płatności.","articleFull2":"Zapisz daty otrzymania dokumentów i wymienione w nich terminy. Nie ustalaj skutków prawnych samodzielnie na podstawie tego poradnika.","articleFull3":"Przygotuj krótką listę pytań, które chcesz zadać uprawnionemu specjaliście.","articleFull4":"Korzystaj z oficjalnych kanałów kontaktu. Nie wysyłaj skanów dokumentów przypadkowym rozmówcom.","officialHelp":"Sprawdź oficjalne źródło pomocy ↗","navLabel":"Nawigacja strony","openMenu":"Otwórz panel","heroAlt":"Notatnik, kalkulator i koperty na stole w ciepłym świetle","stepsLabel":"Trzy pierwsze kroki","articleAlt1":"Koperty i notatnik","articleAlt2":"Notatnik do uporządkowania budżetu","closeMenu":"Zamknij panel","panelNav":"Ekosystem Christian Culture","closeArticle":"Zamknij poradnik"};
  ['data-i18n','data-i18n-aria','data-i18n-alt'].forEach(attr => {
    document.querySelectorAll(`[${attr}]`).forEach(el => {
      const key = el.getAttribute(attr);
      if (!Object.hasOwn(pl,key)) pl[key] = attr === 'data-i18n' ? el.textContent : el.getAttribute(attr === 'data-i18n-aria' ? 'aria-label' : 'alt');
      if (!Object.hasOwn(en, key)) throw new Error(`Missing English translation: ${key}`);
    });
  });
  const messages = {
    pl:{title:'Wyjść z długów. Odzyskać spokój. — Christian Culture',description:'Praktyczny pierwszy krok do uporządkowania domowych finansów. Poradniki, oficjalne źródła pomocy i wolontariat Christian Culture.',balance:'Różnica w tym miesiącu',balanceNote:'To proste zestawienie podanych kwot, nie rekomendacja finansowa.',invalid:'Wpisz kwotę od 0 do 100 000 000, maksymalnie z dwoma miejscami po przecinku.'},
    en:{title:'Step out of debt. Find peace again. — Christian Culture',description:'A practical first step towards organised household finances. Guides, official help resources and Christian Culture volunteering.',balance:'Difference this month',balanceNote:'This only compares the amounts you entered. It is not financial advice.',invalid:'Enter an amount from 0 to 100,000,000, with at most two decimal places.'}
  };
  let lang = 'pl';
  let draft = '';
  let draftFile = null;
  let lastBalance = null;
  const budgetForm = document.getElementById('budget-form');
  const volunteerForm = document.getElementById('volunteer-form');
  const draftPanel = document.getElementById('draft-panel');
  const emailLink = document.getElementById('open-email');
  const gmailLink = document.getElementById('open-gmail');
  const copyButton = document.getElementById('copy-draft');
  function setLinks() { emailLink.href = mailUrl(draft, lang); gmailLink.href = gmailUrl(draft, lang); }

  function renderBalance() {
    const output = document.getElementById('budget-result');
    output.replaceChildren();
    if (lastBalance === null) { output.hidden = true; return; }
    const strong = document.createElement('strong');
    strong.textContent = `${messages[lang].balance}: ${new Intl.NumberFormat(lang === 'pl' ? 'pl-PL' : 'en-GB', {style:'currency',currency:'PLN'}).format(lastBalance/100)}`;
    const small = document.createElement('small'); small.textContent = messages[lang].balanceNote;
    output.append(strong, small); output.hidden = false;
  }
  function readDraft() { return draftText(Object.fromEntries(new FormData(volunteerForm)), lang); }
  function invalidateDraft() {
    draft = ''; draftPanel.hidden = true; emailLink.removeAttribute('href'); gmailLink.removeAttribute('href');
    if (draftFile) { URL.revokeObjectURL(draftFile); draftFile = null; }
  }
  function setLanguage(next, updateUrl) {
    lang = next === 'en' ? 'en' : 'pl';
    const dict = lang === 'pl' ? pl : en;
    document.documentElement.lang = lang; document.title = messages[lang].title;
    document.querySelector('meta[name="description"]').content = messages[lang].description;
    ['data-i18n','data-i18n-aria','data-i18n-alt'].forEach(attr => document.querySelectorAll(`[${attr}]`).forEach(el => {
      const text = dict[el.getAttribute(attr)];
      if (attr === 'data-i18n') el.textContent = text;
      else el.setAttribute(attr === 'data-i18n-aria' ? 'aria-label' : 'alt', text);
    }));
    document.querySelectorAll('[data-lang]').forEach(el => el.setAttribute('aria-pressed',String(el.dataset.lang === lang)));
    document.querySelectorAll('input[type=number]').forEach(el => el.setCustomValidity(''));
    renderBalance();
    if (draft) { draft = readDraft(); setLinks(); }
    if (updateUrl) {
      const canonical=document.querySelector('link[rel="canonical"]');
      if(canonical?.href.startsWith('https://polskieradio.cc/')) {
        location.href=lang==='en'?'/en/debt-help':'/dlugi'; return;
      }
      try { const url = new URL(location.href); url.searchParams.set('lang',lang); history.replaceState(null,'',url); } catch (_) { /* file preview may restrict history */ }
    }
  }
  document.querySelectorAll('[data-lang]').forEach(el => el.addEventListener('click',() => setLanguage(el.dataset.lang,true)));
  setLanguage(new URLSearchParams(location.search).get('lang') || (location.pathname.startsWith('/en/') ? 'en' : 'pl'), false);

  function wireDialog(dialogId, openSelector, closeId) {
    const dialog = document.getElementById(dialogId);
    const openers = document.querySelectorAll(openSelector);
    let opener = null;
    openers.forEach(button => button.addEventListener('click',() => {
      opener = button; dialog.showModal();
      if (button.hasAttribute('aria-expanded')) button.setAttribute('aria-expanded','true');
    }));
    document.getElementById(closeId).addEventListener('click',() => dialog.close());
    dialog.addEventListener('click',event => {
      const box = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
    });
    dialog.querySelectorAll('a[href]').forEach(a => a.addEventListener('click',() => dialog.close()));
    dialog.addEventListener('close',() => {
      if (opener) { if(opener.hasAttribute('aria-expanded')) opener.setAttribute('aria-expanded','false'); opener.focus(); }
    });
    // Native showModal provides focus containment, inert background, and Escape dismissal.
  }
  wireDialog('edge-panel','#open-menu','close-menu');
  wireDialog('article-dialog','[data-article]','close-article');

  budgetForm.addEventListener('submit',event => {
    event.preventDefault();
    for (const name of ['income','costs']) {
      const input = budgetForm.elements.namedItem(name);
      try { toCents(input.value); input.setCustomValidity(''); }
      catch (_) { input.setCustomValidity(messages[lang].invalid); input.reportValidity(); return; }
    }
    lastBalance = difference(budgetForm.elements.income.value,budgetForm.elements.costs.value); renderBalance();
  });
  budgetForm.addEventListener('input',event => { event.target.setCustomValidity?.(''); lastBalance=null; renderBalance(); });
  budgetForm.addEventListener('reset',() => { lastBalance=null; renderBalance(); budgetForm.querySelectorAll('input').forEach(el=>el.setCustomValidity('')); });

  volunteerForm.addEventListener('input',invalidateDraft);
  volunteerForm.addEventListener('submit',event => {
    event.preventDefault(); if(!volunteerForm.reportValidity()) return;
    draft=readDraft(); setLinks(); draftPanel.hidden=false;
    // Asynchroniczne przekazanie zgłoszenia na backend /api/wolontariat z routingiem poczty
    try {
      const fd = new FormData(volunteerForm);
      const payload = {
        name: fd.get('name') || '',
        email: fd.get('email') || '',
        specialty: fd.get('specialty') || '',
        availability: fd.get('availability') || '',
        privacyConsent: true
      };
      const submitBtn = volunteerForm.querySelector('button[type="submit"]');
      const origText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = lang === 'pl' ? 'Wysyłanie zgłoszenia...' : 'Sending enquiry...';
      }
      fetch('/api/wolontariat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json()).then(data => {
        if (data && data.ok) {
          const draftStatus = document.getElementById('draft-status');
          if (draftStatus) {
            draftStatus.innerHTML = lang === 'pl'
              ? '<strong style="color:var(--cc-gold,#C4A35A)">✓ Zgłoszenie wysłane.</strong> Doręczono do administratora na adres <code>' + (data.destination || 'wolontariat@polskieradio.cc') + '</code> (ID: ' + data.id + '). Dziękujemy za Twoją gotowość do pomocy!'
              : '<strong style="color:var(--cc-gold,#C4A35A)">✓ Enquiry sent.</strong> Forwarded to <code>' + (data.destination || 'wolontariat@polskieradio.cc') + '</code> (ID: ' + data.id + '). Thank you for your willingness to help!';
          }
        }
      }).catch(err => {
        console.warn('Network submit fallback:', err);
      }).finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = origText;
        }
      });
    } catch (e) {
      console.warn('Submission handler error:', e);
    }
  });
  document.getElementById('download-draft').addEventListener('click',() => {
    if(!draft) return;
    if(draftFile) URL.revokeObjectURL(draftFile);
    draftFile=URL.createObjectURL(new Blob(['\ufeff',draft],{type:'text/plain;charset=utf-8'}));
    const a=document.createElement('a'); a.href=draftFile; a.download=`cc-volunteer-${lang}.txt`; a.click();
  });
  copyButton.addEventListener('click',() => {
    if(!draft) return;
    const done = () => { copyButton.textContent = lang==='pl' ? 'Skopiowano ✓' : 'Copied ✓'; };
    if (navigator.clipboard) navigator.clipboard.writeText('Do: wolontariat@polskieradio.cc' + String.fromCharCode(10, 10) + draft).then(done).catch(() => {});
  });
  window.addEventListener('pagehide',() => { if(draftFile) URL.revokeObjectURL(draftFile); });
  // Fail closed if this script is missing or fails before all submit handlers exist.
  document.querySelectorAll('[data-js-fields]').forEach(fieldset => { fieldset.disabled=false; });
})();
