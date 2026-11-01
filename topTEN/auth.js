/**
 * topTEN — logowanie kontem Google (Firebase lumina-cc, wspólne konto EkoCC).
 * Udostępnia window.ccTopTenAuth i zdarzenie 'topten-auth' dla app.js / panelu.
 */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

const CONFIG = {
  apiKey: 'AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M',
  authDomain: 'lumina-cc.firebaseapp.com',
  projectId: 'lumina-cc',
  storageBucket: 'lumina-cc.firebasestorage.app',
  messagingSenderId: '413985877183',
  appId: '1:413985877183:web:b0c99a686a4fb1b875aa0a',
};

const app = getApps().length ? getApp() : initializeApp(CONFIG);
const auth = getAuth(app);
let current = null;
let ready = false;

window.ccTopTenAuth = {
  get user() { return current ? { uid: current.uid, name: current.displayName || current.email, email: current.email } : null; },
  get ready() { return ready; },
  async signIn() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
  },
  signOut: () => signOut(auth),
  getToken: (force = false) => (current ? current.getIdToken(force) : Promise.resolve(null)),
};

onAuthStateChanged(auth, (user) => {
  current = user;
  ready = true;
  window.dispatchEvent(new CustomEvent('topten-auth', { detail: window.ccTopTenAuth.user }));
});
