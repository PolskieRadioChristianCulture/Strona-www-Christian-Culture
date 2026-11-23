// CCN Ogłoszenia — testy reguł Firestore na emulatorze (konta fikcyjne, bez danych osobowych).
// Uruchomienie (wymaga Javy i @firebase/rules-unit-testing):
//   npx firebase emulators:exec --only firestore --project demo-ogloszenia "node --test tests/ogloszenia-rules.test.mjs"
// Administrator w teście = token z roszczeniem admin:true (ta sama ścieżka co isMasterAdmin()).
import { test, before, after, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';

const RULES = process.env.OGL_RULES || fileURLToPath(new URL('../firestore.rules', import.meta.url));
const USER = 'user-ogl-1', OTHER = 'user-ogl-2', ADMIN = 'admin-ogl';
let env;

const member = uid => env.authenticatedContext(uid, { firebase: { sign_in_provider: 'google.com' } }).firestore();
const anon = () => env.authenticatedContext('anon-1', { firebase: { sign_in_provider: 'anonymous' } }).firestore();
const guest = () => env.unauthenticatedContext().firestore();
const admin = () => env.authenticatedContext(ADMIN, { admin: true, firebase: { sign_in_provider: 'google.com' } }).firestore();

const base = (uid, extra = {}) => ({ kind: 'cc_ogloszenie', authorUid: uid, title: 'Rower', description: 'Opis', contactName: 'Jan',
  type: 'sprzedam', category: 'inne', featured: false, isPatron: false, patronBadge: '', status: 'pending', ...extra });

before(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-ogloszenia', firestore: { rules: readFileSync(RULES, 'utf8'), host: '127.0.0.1', port: 8080 } });
});
after(async () => { await env.cleanup(); });
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'user_posts', 'pub'), base(OTHER, { status: 'published' }));
    await setDoc(doc(db, 'user_posts', 'pend'), base(OTHER, { status: 'pending' }));
    await setDoc(doc(db, 'user_posts', 'mine'), base(USER, { status: 'pending' }));
    await setDoc(doc(db, 'user_posts', 'patronOld'), base(USER, { status: 'published', featured: true, isPatron: true, patronBadge: 'Patron & Mecenas CC' }));
  });
});

test('P0 Patron: zwykły członek NIE może utworzyć ogłoszenia z featured / isPatron / patronBadge', async () => {
  const db = member(USER);
  await assertFails(setDoc(doc(db, 'user_posts', 'a1'), base(USER, { featured: true })));
  await assertFails(setDoc(doc(db, 'user_posts', 'a2'), base(USER, { isPatron: true })));
  await assertFails(setDoc(doc(db, 'user_posts', 'a3'), base(USER, { patronBadge: 'Patron & Mecenas CC' })));
});

test('P0 Patron: zwykły członek NIE może dopisać Patrona edycją ani go zdjąć z cudzego/własnego', async () => {
  const db = member(USER);
  await assertFails(updateDoc(doc(db, 'user_posts', 'mine'), { featured: true, status: 'pending' }));
  await assertFails(updateDoc(doc(db, 'user_posts', 'mine'), { patronBadge: 'X', status: 'pending' }));
  await assertFails(updateDoc(doc(db, 'user_posts', 'patronOld'), { featured: false, isPatron: false, patronBadge: '', status: 'pending' }));
  // Istniejący Patron zostaje: autor może edytować treść, pola Patrona bez zmian (ogłoszenie wraca do moderacji).
  await assertSucceeds(updateDoc(doc(db, 'user_posts', 'patronOld'), { title: 'Nowy tytuł', status: 'pending' }));
});

test('Moderacja: członek tworzy tylko pending, nie published; nie zatwierdza sam', async () => {
  const db = member(USER);
  await assertSucceeds(setDoc(doc(db, 'user_posts', 'ok'), base(USER)));
  await assertFails(setDoc(doc(db, 'user_posts', 'pubself'), base(USER, { status: 'published' })));
  await assertFails(setDoc(doc(db, 'user_posts', 'nostatus'), (({ status, ...r }) => r)(base(USER))));
  await assertFails(updateDoc(doc(db, 'user_posts', 'mine'), { status: 'published' }));
  await assertFails(updateDoc(doc(db, 'user_posts', 'mine'), { status: 'rejected' }));
  await assertFails(setDoc(doc(db, 'user_posts', 'foreign'), base(OTHER)));
  await assertFails(updateDoc(doc(db, 'user_posts', 'pend'), { title: 'x', status: 'pending' }));
});

test('Moderacja: konto anonimowe i gość nie publikują', async () => {
  await assertFails(setDoc(doc(anon(), 'user_posts', 'x'), base('anon-1')));
  await assertFails(setDoc(doc(guest(), 'user_posts', 'y'), base('nobody')));
});

test('Odczyt: gość widzi tylko published; zapytanie bez filtra statusu jest odrzucone', async () => {
  const db = guest();
  await assertSucceeds(getDoc(doc(db, 'user_posts', 'pub')));
  await assertFails(getDoc(doc(db, 'user_posts', 'pend')));
  await assertSucceeds(getDocs(query(collection(db, 'user_posts'), where('kind', '==', 'cc_ogloszenie'), where('status', '==', 'published'))));
  await assertFails(getDocs(query(collection(db, 'user_posts'), where('kind', '==', 'cc_ogloszenie'))));
  await assertFails(getDocs(query(collection(db, 'user_posts'), where('status', '==', 'pending'))));
});

test('Odczyt: autor widzi swoje oczekujące, nie cudze', async () => {
  const db = member(USER);
  await assertSucceeds(getDoc(doc(db, 'user_posts', 'mine')));
  await assertFails(getDoc(doc(db, 'user_posts', 'pend')));
  await assertSucceeds(getDocs(query(collection(db, 'user_posts'), where('kind', '==', 'cc_ogloszenie'), where('authorUid', '==', USER))));
});

test('Administrator: widzi oczekujące, zatwierdza, odrzuca, nadaje Patrona, publikuje od razu', async () => {
  const db = admin();
  await assertSucceeds(getDocs(query(collection(db, 'user_posts'), where('kind', '==', 'cc_ogloszenie'), where('status', '==', 'pending'))));
  await assertSucceeds(updateDoc(doc(db, 'user_posts', 'pend'), { status: 'published' }));
  await assertSucceeds(updateDoc(doc(db, 'user_posts', 'mine'), { status: 'rejected' }));
  await assertSucceeds(updateDoc(doc(db, 'user_posts', 'pub'), { featured: true, isPatron: true, patronBadge: 'Patron & Mecenas CC' }));
  await assertSucceeds(setDoc(doc(db, 'user_posts', 'adm'), base(ADMIN, { status: 'published', featured: true, isPatron: true, patronBadge: 'Patron & Mecenas CC' })));
});

test('Usuwanie: autor swoje, administrator każde, obcy nie', async () => {
  await assertFails(deleteDoc(doc(member(OTHER), 'user_posts', 'mine')));
  await assertSucceeds(deleteDoc(doc(member(USER), 'user_posts', 'mine')));
  await assertSucceeds(deleteDoc(doc(admin(), 'user_posts', 'pend')));
});
