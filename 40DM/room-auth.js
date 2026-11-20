const signIn = document.getElementById('google-login');
const signed = document.getElementById('lumina-signed');
const error = document.getElementById('auth-error');

if (location.origin === 'https://polskieradio.cc') {
  const frame = document.createElement('iframe');
  frame.className = 'room-frame';
  frame.title = document.documentElement.lang === 'en'
    ? '40 Days of Prayer room in LUMI MESS' : 'Pokój 40 Dni Modlitwy w LUMI MESS';
  frame.src = '/mess?embed=1&room=prayer_40dm' + (document.documentElement.lang === 'en' ? '&lang=en' : '');
  document.getElementById('room-slot').append(frame);

  try {
    const auth = await import('/lumina-db.js?v=20261013_notifsafe1');
    await auth.ensureDbReady();
    auth.onAuthChange(user => {
      const active = !!user && !user.isAnonymous;
      signed.hidden = !active;
      signIn.hidden = active;
      if (active) error.hidden = true;
    });
    signIn.addEventListener('click', async () => {
      if (signIn.disabled) return;
      signIn.disabled = true;
      error.hidden = true;
      try { await auth.loginWithGoogle(); }
      catch { error.hidden = false; }
      finally { signIn.disabled = false; }
    });
  } catch { error.hidden = false; }
}
