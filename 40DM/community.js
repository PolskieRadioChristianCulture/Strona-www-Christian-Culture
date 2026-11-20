const urls = { pl: 'https://polskieradio.cc/40DM/', en: 'https://polskieradio.cc/40DM/en/' };

export function shareLinks(locale) {
  const url = urls[locale];
  const text = locale === 'en' ? 'Join me for 40 Days of Prayer.' : 'Dołącz do mnie w akcji 40 Dni Modlitwy.';
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  const msg = encodeURIComponent(text + ' ' + url);
  return { url, text, WhatsApp: 'https://wa.me/?text=' + msg,
    Facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + u,
    Telegram: 'https://t.me/share/url?url=' + u + '&text=' + t,
    X: 'https://x.com/intent/tweet?url=' + u + '&text=' + t,
    email: 'mailto:?subject=' + t + '&body=' + msg,
    sms: 'sms:?body=' + msg };
}

export function makeReminder(locale, clock, remaining, now = new Date()) {
  if (!/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/.test(clock) || !Number.isInteger(remaining) || remaining < 1 || remaining > 40) return '';
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const pad = n => String(n).padStart(2, '0');
  const day = tomorrow.getFullYear() + pad(tomorrow.getMonth() + 1) + pad(tomorrow.getDate());
  const start = day + 'T' + clock.replace(':', '') + '00';
  const stamped = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const title = locale === 'en' ? '40 Days of Prayer' : '40 Dni Modlitwy';
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Christian Culture//40DM//EN',
    'BEGIN:VEVENT', 'UID:40dm-' + start + '@polskieradio.cc', 'DTSTAMP:' + stamped,
    'DTSTART:' + start, 'DURATION:PT10M', 'RRULE:FREQ=DAILY;COUNT=' + remaining,
    'SUMMARY:' + title, 'URL:' + urls[locale] + '?next=1#plan',
    'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', 'DESCRIPTION:' + title,
    'END:VALARM', 'END:VEVENT', 'END:VCALENDAR', ''
  ].join('\r\n');
}

function mount() {
  const locale = document.documentElement.lang === 'en' ? 'en' : 'pl';
  const en = locale === 'en';
  const byId = id => document.getElementById(id);
  const status = byId('invite-status');
  const links = shareLinks(locale);
  const invite = byId('invite-url');
  invite.value = links.url;
  for (const link of document.querySelectorAll('[data-share]')) link.href = links[link.dataset.share];

  byId('copy-invite').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(links.url);
      status.textContent = en ? 'Link copied.' : 'Link skopiowany.';
    } catch {
      invite.focus();
      invite.select();
      status.textContent = en ? 'The link is selected and ready to copy.' : 'Link jest zaznaczony. Możesz go skopiować.';
    }
  });
  const share = byId('share-invite');
  if (navigator.share) {
    share.hidden = false;
    share.addEventListener('click', async () => {
      try { await navigator.share({ title: en ? '40 Days of Prayer' : '40 Dni Modlitwy', text: links.text, url: links.url }); }
      catch (error) { if (error.name !== 'AbortError') byId('share-more').open = true; }
    });
  }

  byId('reminder-form').addEventListener('submit', event => {
    event.preventDefault();
    const ics = makeReminder(locale, byId('reminder-time').value, Number(byId('plan').dataset.remaining));
    const note = byId('reminder-status');
    if (!ics) {
      note.textContent = en ? 'Your plan is already complete.' : 'Twój plan jest już ukończony.';
      return;
    }
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = '40dm-reminders.ics';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    note.textContent = en ? 'Open the downloaded file in your calendar to activate reminders.' : 'Otwórz pobrany plik w kalendarzu, aby włączyć przypomnienia.';
  });

  const btn = byId('confirm-prayer');
  const count = byId('prayer-count');
  const countStatus = byId('counter-status');
  const endpoint = '/api/40dm/counter';
  const key = 'cc-40dm-daily-confirmation';
  const dayFormatter = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw' });
  let busy = false;
  async function update(token) {
    if (busy) return;
    busy = true;
    btn.disabled = true;
    try {
      const options = token ? { method:'POST', headers:{'Content-Type':'text/plain'}, body: token } : {};
      const result = await fetch(endpoint, { ...options, credentials:'omit', signal:AbortSignal.timeout(8000) });
      if (!result.ok) throw new Error('counter unavailable');
      const data = await result.json();
      if (!Number.isInteger(data.count) || data.count < 0) throw new Error('invalid counter');
      count.textContent = new Intl.NumberFormat(locale).format(data.count);
      if (token) {
        const current = JSON.parse(localStorage.getItem(key));
        if (current?.token === token) localStorage.setItem(key, JSON.stringify({ ...current, confirmed: data.day }));
        countStatus.textContent = en ? 'Your confirmation has been counted.' : 'Twoje potwierdzenie zostało policzone.';
      }
    } catch {
      countStatus.textContent = en ? 'The counter is temporarily unavailable.' : 'Licznik jest chwilowo niedostępny.';
    } finally {
      busy = false;
      btn.disabled = false;
    }
  }
  btn.addEventListener('click', () => {
    const today = dayFormatter.format(new Date());
    try {
      const stored = JSON.parse(localStorage.getItem(key) || 'null');
      if (stored?.confirmed === today) {
        countStatus.textContent = en ? 'This browser already confirmed today.' : 'W tej przeglądarce potwierdzono już dzisiejszą modlitwę.';
        return;
      }
      const token = stored?.day === today && /^[0-9a-f-]{36}$/.test(stored.token) ? stored.token : crypto.randomUUID();
      localStorage.setItem(key, JSON.stringify({ day:today, token }));
      countStatus.textContent = '';
      update(token);
    } catch {
      countStatus.textContent = en ? 'Enable local storage to confirm.' : 'Włącz lokalny zapis, aby potwierdzić modlitwę.';
    }
  });
  update();
}
if (typeof document !== 'undefined') mount();
