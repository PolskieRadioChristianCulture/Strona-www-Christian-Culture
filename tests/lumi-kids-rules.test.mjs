// LUMI KIDS — testy reguł Firestore na emulatorze (konta i dane fikcyjne).
// Uruchomienie (wymaga Javy): npx firebase emulators:exec --only firestore --project demo-lumi-kids "node --test tests/lumi-kids-rules.test.mjs"
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, collection, getDocs, query, where, serverTimestamp, deleteField } from 'firebase/firestore';

const RULES = process.env.RULES_FILE || 'firestore.rules';
let env;
const CHILD = 'kidUid1', PARENT = 'parentUid1', MOM = 'momUid1', STRANGER = 'strangerUid1';
const ADMIN_TOKEN = { email: 'nazirczarkes@gmail.com', email_verified: true, firebase: { sign_in_provider: 'google.com' } };
const KID_EMAIL = 'dziecko.testowe@example.com';
const pwd = (email, verified = true) => ({ email, email_verified: verified, firebase: { sign_in_provider: 'password' } });
const goog = (email) => ({ email, email_verified: true, firebase: { sign_in_provider: 'google.com' } });

const db = (uid, token) => env.authenticatedContext(uid, token).firestore();
const admin = () => db(PARENT, ADMIN_TOKEN);
const child = () => db(CHILD, pwd(KID_EMAIL));
const mom = () => db(MOM, goog('mama.testowa@example.com'));
const stranger = () => db(STRANGER, goog('obcy@example.com'));
const CHAT = 'cezaryrgowski_' + CHILD.toLowerCase();
const MOMCHAT = 'mamatestowa_' + CHILD.toLowerCase();


async function seed(cfg = {}) {
  await env.withSecurityRulesDisabled(async (c) => {
    const f = c.firestore();
    await setDoc(doc(f, 'kids_pilot/config'), { enabled: true, childUid: CHILD, contacts: [PARENT, MOM], familyChats: { [PARENT]: CHAT, [MOM]: MOMCHAT }, ...cfg });
    for (const [chatId, other] of [[CHAT, PARENT], [MOMCHAT, MOM]]) {
      await setDoc(doc(f, `lumina_message_requests/${chatId}`), { chatId, senderAuthUid: other, receiverAuthUid: CHILD, participants: [other, CHILD], status: 'accepted', kidsFamily: true });
      await setDoc(doc(f, `lumina_chats/${chatId}`), { chatId, participants: [other, CHILD], users: [other, CHILD], conversationState: 'accepted', kidsFamily: true });
    }
    await setDoc(doc(f, 'lumina_direct_messages/m1'), dm(PARENT, CHILD, CHAT, 'Cześć!', true));
    await setDoc(doc(f, 'lumina_profiles/' + STRANGER), { uid: STRANGER, name: 'Obcy' });
  });
}
function dm(from, to, chatId, text, server = false) {
  return { clientMessageId: 'c-' + Math.random(), chatId, senderAuthUid: from, receiverAuthUid: to, participants: [from, to],
    senderId: from.toLowerCase(), senderName: 'Test', receiverId: to.toLowerCase(), users: [from, to], text, type: 'text',
    status: 'sent', isRead: false, reactions: {}, createdAt: Date.now(), timestamp: server ? new Date() : serverTimestamp() };
}
test('public chat author can edit and delete, other accounts cannot change text or ownership', async () => {
  const path = 'lumina_public_chat_messages/author-edit-test';
  const own = doc(stranger(), path);
  await assertSucceeds(setDoc(own, { senderAuthUid: STRANGER, text: 'Pierwsza wersja', timestamp: serverTimestamp() }));
  await assertFails(updateDoc(doc(mom(), path), { text: 'Cudza zmiana', editedAt: serverTimestamp() }));
  await assertFails(updateDoc(doc(child(), path), { text: 'Cudza zmiana', editedAt: serverTimestamp() }));
  await assertFails(updateDoc(own, { text: ' ', editedAt: serverTimestamp() }));
  await assertFails(updateDoc(own, { text: 'x'.repeat(2001), editedAt: serverTimestamp() }));
  await assertFails(updateDoc(own, { text: 'Bez daty' }));
  await assertFails(updateDoc(own, { text: 'Fałszywa data', editedAt: new Date(0) }));
  await assertFails(updateDoc(own, { text: 'Podmiana', editedAt: serverTimestamp(), senderAuthUid: MOM }));
  await assertFails(updateDoc(own, { text: 'Podmiana', editedAt: serverTimestamp(), reactions: { added: true } }));
  await assertSucceeds(updateDoc(doc(mom(), path), { reactions: { added: true } }));
  await assertSucceeds(updateDoc(own, { text: 'Druga wersja', editedAt: serverTimestamp() }));
  const edited = (await getDoc(own)).data();
  assert.equal(edited.text, 'Druga wersja');
  assert.equal(edited.senderAuthUid, STRANGER);
  assert.ok(edited.editedAt);
  await assertFails(deleteDoc(doc(mom(), path)));
  await assertSucceeds(deleteDoc(own));
  assert.equal((await getDoc(own)).exists(), false);
});

const myDms = (f, uid, chatId) => getDocs(query(collection(f, 'lumina_direct_messages'), where('participants', 'array-contains', uid), where('chatId', '==', chatId)));

before(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-lumi-kids', firestore: { rules: readFileSync(RULES, 'utf8'), host: '127.0.0.1', port: 8080 } });
});
after(async () => { await env.cleanup(); });
beforeEach(async () => { await env.clearFirestore(); });

test('T01/T02. Dziecko czyta wspólny wątek DM z rodzicem (ten sam magazyn co LUMINA)', async () => {
  await seed();
  await assertSucceeds(getDoc(doc(child(), 'kids_pilot/config')));
  await assertSucceeds(myDms(child(), CHILD, CHAT));
});

test('T02. Rodzic (zwykła LUMINA) wysyła do dziecka; zatwierdzony kontakt (mama) też', async () => {
  await seed();
  await assertSucceeds(addDoc(collection(admin(), 'lumina_direct_messages'), dm(PARENT, CHILD, CHAT, 'TEST-RODZIC-1')));
  await assertSucceeds(addDoc(collection(mom(), 'lumina_direct_messages'), dm(MOM, CHILD, MOMCHAT, 'TEST-MAMA-1')));
});

test('T03. Dziecko odpowiada rodzicowi w tym samym wątku (z cytatem) i aktualizuje podgląd rozmowy', async () => {
  await seed();
  await assertSucceeds(setDoc(doc(child(), 'lumina_direct_messages/k1'), { ...dm(CHILD, PARENT, CHAT, 'TEST-DZIECKO-1'), replyToMessageId: 'm1', replyToSenderName: 'Tata', replyToText: 'Cześć!' }));
  await assertSucceeds(updateDoc(doc(child(), `lumina_chats/${CHAT}`), { lastMessageText: 'TEST-DZIECKO-1', lastSenderId: CHILD.toLowerCase() }));
  await assertSucceeds(myDms(admin(), PARENT, CHAT));
});

test('T10. Idempotencja: ponowny zapis tego samego identyfikatora wiadomości przez dziecko jest odrzucony (jeden rekord)', async () => {
  await seed();
  await assertSucceeds(setDoc(doc(child(), 'lumina_direct_messages/same1'), dm(CHILD, PARENT, CHAT, 'raz')));
  await assertFails(setDoc(doc(child(), 'lumina_direct_messages/same1'), dm(CHILD, PARENT, CHAT, 'drugi raz')));
});

test('Walidacja zapisu dziecka: zdjęcie, za długi tekst, podszycie, pusty tekst', async () => {
  await seed();
  const c = collection(child(), 'lumina_direct_messages');
  await assertFails(addDoc(c, { ...dm(CHILD, PARENT, CHAT, 'foto'), imageUrl: 'https://example.com/a.jpg' }));
  await assertFails(addDoc(c, { ...dm(CHILD, PARENT, CHAT, 'x'), type: 'image' }));
  await assertFails(addDoc(c, dm(CHILD, PARENT, CHAT, 'x'.repeat(1001))));
  await assertFails(addDoc(c, dm(CHILD, PARENT, CHAT, '')));
  await assertFails(addDoc(c, { ...dm(CHILD, PARENT, CHAT, 'udaję tatę'), senderAuthUid: PARENT }));
});

test('T07. Dziecko nie napisze do niezatwierdzonej osoby; obcy nie napisze do dziecka ani nie przyjmie go dziecko', async () => {
  await seed();
  const sc = 'obcy_' + CHILD.toLowerCase();
  await env.withSecurityRulesDisabled(async (c) => {
    await setDoc(doc(c.firestore(), `lumina_message_requests/${sc}`), { chatId: sc, senderAuthUid: STRANGER, receiverAuthUid: CHILD, participants: [STRANGER, CHILD], status: 'pending', previewText: 'hej' });
  });
  await assertFails(addDoc(collection(child(), 'lumina_direct_messages'), dm(CHILD, STRANGER, sc, 'hej')));
  await assertFails(addDoc(collection(stranger(), 'lumina_direct_messages'), dm(STRANGER, CHILD, sc, 'hej')));
  await assertFails(updateDoc(doc(child(), `lumina_message_requests/${sc}`), { status: 'accepted', acceptedAt: serverTimestamp(), acceptedBy: CHILD }));
  await assertFails(addDoc(collection(child(), 'lumina_message_requests'), { chatId: 'x', senderAuthUid: CHILD, receiverAuthUid: STRANGER, participants: [CHILD, STRANGER], previewText: 'hej', status: 'pending' }));
});

test('T08. Osoba trzecia nie odczyta wątku rodzinnego ani jego podglądu', async () => {
  await seed();
  await assertFails(getDoc(doc(stranger(), 'lumina_direct_messages/m1')));
  await assertFails(getDoc(doc(stranger(), `lumina_chats/${CHAT}`)));
  await assertFails(myDms(stranger(), CHILD, CHAT));
  await assertFails(getDocs(collection(stranger(), 'lumina_direct_messages')));
  await assertFails(getDoc(doc(stranger(), 'kids_pilot/config')));
});

test('T09. Cofnięcie zgody odcina dziecku odczyt, wysyłkę, reakcje i podgląd — konto dziecka nadal zablokowane publicznie', async () => {
  await seed({ enabled: false, revoked: true });
  await assertFails(myDms(child(), CHILD, CHAT));
  await assertFails(getDoc(doc(child(), 'lumina_direct_messages/m1')));
  await assertFails(addDoc(collection(child(), 'lumina_direct_messages'), dm(CHILD, PARENT, CHAT, 'hej')));
  await assertFails(updateDoc(doc(child(), 'lumina_direct_messages/m1'), { isRead: true, status: 'read' }));
  await assertFails(updateDoc(doc(child(), `lumina_chats/${CHAT}`), { lastMessageText: 'x' }));
  await assertFails(addDoc(collection(child(), 'lumina_public_chat_messages'), { senderAuthUid: CHILD, text: 'hej' }));
});

test('T13/T14. Konto dziecka bez czatu publicznego i profilu; zwykli użytkownicy i ich DM bez zmian', async () => {
  await seed();
  await assertFails(setDoc(doc(child(), `lumina_profiles/${CHILD}`), { uid: CHILD, name: 'Dziecko' }));
  await assertFails(addDoc(collection(child(), 'lumina_public_chat_messages'), { senderAuthUid: CHILD, text: 'hej' }));
  await assertFails(addDoc(collection(child(), 'user_posts'), { authorUid: CHILD, title: 'x' }));
  await assertFails(setDoc(doc(child(), 'lumina_chats/nowy'), { participants: [CHILD, PARENT] }));
  await assertSucceeds(addDoc(collection(stranger(), 'lumina_public_chat_messages'), { senderAuthUid: STRANGER, text: 'hej' }));
  await assertSucceeds(setDoc(doc(stranger(), `lumina_profiles/${STRANGER}`), { uid: STRANGER, name: 'Ktoś' }));
  // Zwykły DM dorosłych (zaakceptowana rozmowa) nadal działa:
  await env.withSecurityRulesDisabled(async (c) => {
    await setDoc(doc(c.firestore(), 'lumina_message_requests/a_b'), { chatId: 'a_b', senderAuthUid: STRANGER, receiverAuthUid: MOM, participants: [STRANGER, MOM], status: 'accepted' });
  });
  await assertSucceeds(addDoc(collection(stranger(), 'lumina_direct_messages'), dm(STRANGER, MOM, 'a_b', 'dorośli')));
  await assertSucceeds(myDms(mom(), MOM, 'a_b'));
});

test('Bez konfiguracji pilotażu LUMINA działa normalnie, a LUMI KIDS jest zamknięte', async () => {
  await assertSucceeds(addDoc(collection(stranger(), 'lumina_public_chat_messages'), { senderAuthUid: STRANGER, text: 'hej' }));
  await assertFails(getDoc(doc(child(), 'kids_pilot/config')));
});

test('T01. Zaproszenie: tylko zweryfikowany właściciel adresu (hasło) przyjmuje je dla siebie', async () => {
  await env.withSecurityRulesDisabled(async (c) => {
    await setDoc(doc(c.firestore(), 'kids_invites/inv1'), { email: KID_EMAIL, status: 'pending', createdBy: PARENT });
  });
  const claim = (f, uid) => updateDoc(doc(f, 'kids_invites/inv1'), { status: 'claimed', claimedUid: uid, claimedAt: serverTimestamp() });
  await assertFails(getDoc(doc(stranger(), 'kids_invites/inv1')));
  await assertFails(claim(stranger(), STRANGER));
  await assertFails(claim(db(CHILD, pwd(KID_EMAIL, false)), CHILD)); // adres niezweryfikowany
  await assertFails(claim(db(CHILD, goog(KID_EMAIL)), CHILD));       // inny dostawca niż hasło
  await assertFails(claim(child(), STRANGER));                         // przypisanie komuś innemu
  await assertSucceeds(getDocs(query(collection(child(), 'kids_invites'), where('email', '==', KID_EMAIL))));
  await assertSucceeds(claim(child(), CHILD));
  await assertFails(claim(child(), CHILD));                            // drugi raz
  // Dziecko nie nadaje sobie roli — dopiero opiekun zapisuje childUid w konfiguracji:
  await assertFails(setDoc(doc(child(), 'kids_pilot/config'), { enabled: true, childUid: CHILD, contacts: [PARENT] }));
  await assertSucceeds(setDoc(doc(admin(), 'kids_pilot/config'), { enabled: true, childUid: CHILD, contacts: [PARENT] }));
});


test('Reakcje i odczytanie: dziecko reaguje i oznacza wiadomość rodzica jako przeczytaną', async () => {
  await seed();
  const m = doc(child(), 'lumina_direct_messages/m1');
  await assertSucceeds(updateDoc(m, { reactions: { '❤️': [{ id: CHILD.toLowerCase(), name: 'Dziecko' }] } }));
  await assertSucceeds(updateDoc(m, { isRead: true, status: 'read', readAt: Date.now(), readBy: [CHILD.toLowerCase()] }));
  await assertFails(updateDoc(m, { text: 'zmienione' }));
});

test('Zgłoszenie do pilotażu: tylko własne, zweryfikowane konto, poprawne pola; czyta autor i administrator', async () => {
  const ok = (uid, email) => ({ uid, email, parentName: 'Rodzic Testowy', childrenCount: 2, message: '', consent: true, status: 'new', createdAt: serverTimestamp() });
  const p = db('parentX', goog('rodzic.x@example.com'));
  await assertFails(setDoc(doc(p, 'kids_waitlist/innyUid'), ok('innyUid', 'rodzic.x@example.com')));
  await assertFails(setDoc(doc(p, 'kids_waitlist/parentX'), ok('parentX', 'ktos.inny@example.com')));
  await assertFails(setDoc(doc(p, 'kids_waitlist/parentX'), { ...ok('parentX', 'rodzic.x@example.com'), consent: false }));
  await assertFails(setDoc(doc(p, 'kids_waitlist/parentX'), { ...ok('parentX', 'rodzic.x@example.com'), childName: 'Jaś' }));
  await assertFails(setDoc(doc(db('anonX', { firebase: { sign_in_provider: 'anonymous' } }), 'kids_waitlist/anonX'), ok('anonX', 'a@example.com')));
  await assertFails(setDoc(doc(db('parentY', pwd('rodzic.y@example.com', false)), 'kids_waitlist/parentY'), ok('parentY', 'rodzic.y@example.com')));
  await assertSucceeds(setDoc(doc(p, 'kids_waitlist/parentX'), ok('parentX', 'rodzic.x@example.com')));
  await assertFails(updateDoc(doc(p, 'kids_waitlist/parentX'), { status: 'approved' }));
  await assertSucceeds(getDoc(doc(p, 'kids_waitlist/parentX')));
  await assertFails(getDoc(doc(stranger(), 'kids_waitlist/parentX')));
  await assertFails(getDocs(collection(stranger(), 'kids_waitlist')));
  await assertSucceeds(getDocs(collection(admin(), 'kids_waitlist')));
  await seed();
  await assertFails(setDoc(doc(child(), `kids_waitlist/${CHILD}`), ok(CHILD, KID_EMAIL)));
});

test('T17. Zdjęcie dziecka (kids_profiles.photo): widzą je tylko dziecko i zatwierdzeni; dziecko nie podmieni zdjęcia', async () => {
  await seed();
  await assertSucceeds(setDoc(doc(admin(), `kids_profiles/${CHILD}`), { displayName: 'Dziecko', photo: 'data:image/webp;base64,AAAA' }));
  await assertSucceeds(getDoc(doc(child(), `kids_profiles/${CHILD}`)));
  await assertSucceeds(getDoc(doc(mom(), `kids_profiles/${CHILD}`)));
  await assertFails(getDoc(doc(stranger(), `kids_profiles/${CHILD}`)));
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), `kids_profiles/${CHILD}`)));
  await assertFails(setDoc(doc(child(), `kids_profiles/${CHILD}`), { displayName: 'Dziecko', photo: 'data:image/webp;base64,BBBB' }));
});

test('Powiadomienia: dziecko zapisuje własny token urządzenia, nie cudzy; nikt poza administracją go nie odczyta', async () => {
  await seed();
  await assertSucceeds(setDoc(doc(child(), 'LuminaDeviceTokens/tok1'), { token: 't', uid: CHILD, enabled: true }));
  await assertFails(setDoc(doc(child(), 'LuminaDeviceTokens/tok2'), { token: 't', uid: PARENT, enabled: true }));
  await assertFails(getDoc(doc(stranger(), 'LuminaDeviceTokens/tok1')));
});


// ── Społeczność LUMINA: każdy z każdym (prośba → przyjęcie → rozmowa) ─────────────────
const UA = 'userA1', UB = 'userB1', UC = 'userC1';
const ua = () => db(UA, goog('a.testowa@example.com'));
const ub = () => db(UB, goog('b.testowy@example.com'));
const uc = () => db(UC, goog('c.testowy@example.com'));
const ABCHAT = 'usera1_userb1';
const req = (from, to, status = 'pending') => ({ chatId: ABCHAT, senderAuthUid: from, receiverAuthUid: to, participants: [from, to], previewText: 'Cześć', status });

test('Społeczność 1: bez przyjętej prośby nie da się wysłać wiadomości ani przyjąć rozmowy samemu', async () => {
  await assertFails(addDoc(collection(ua(), 'lumina_direct_messages'), dm(UA, UB, ABCHAT, 'hej')));
  await assertFails(setDoc(doc(ua(), `lumina_message_requests/${ABCHAT}`), req(UA, UB, 'accepted')));
  await assertFails(setDoc(doc(ua(), `lumina_chats/${ABCHAT}`), { chatId: ABCHAT, participants: [UA, UB], users: [UA, UB], conversationState: 'accepted' }));
});

test('Społeczność 2: prośba → przyjęcie → obie strony piszą, obcy nie czyta i nie pisze', async () => {
  await assertSucceeds(setDoc(doc(ua(), `lumina_message_requests/${ABCHAT}`), req(UA, UB)));
  await assertFails(updateDoc(doc(ua(), `lumina_message_requests/${ABCHAT}`), { status: 'accepted', acceptedBy: UA, acceptedAt: serverTimestamp() }));
  await assertSucceeds(updateDoc(doc(ub(), `lumina_message_requests/${ABCHAT}`), { status: 'accepted', acceptedBy: UB, acceptedAt: serverTimestamp(), respondedAt: serverTimestamp(), respondedBy: UB }));
  await assertSucceeds(setDoc(doc(ua(), 'lumina_direct_messages/ab1'), dm(UA, UB, ABCHAT, 'A do B')));
  await assertSucceeds(setDoc(doc(ua(), `lumina_chats/${ABCHAT}`), { chatId: ABCHAT, participants: [UA, UB], users: [UA, UB], conversationState: 'accepted', lastMessageText: 'A do B' }));
  await assertSucceeds(setDoc(doc(ub(), 'lumina_direct_messages/ba1'), dm(UB, UA, ABCHAT, 'B do A')));
  await assertSucceeds(updateDoc(doc(ub(), `lumina_chats/${ABCHAT}`), { lastMessageText: 'B do A' }));
  await assertSucceeds(getDoc(doc(ub(), 'lumina_direct_messages/ab1')));
  await assertFails(getDoc(doc(uc(), 'lumina_direct_messages/ab1')));
  await assertFails(addDoc(collection(uc(), 'lumina_direct_messages'), { ...dm(UC, UB, ABCHAT, 'wtrącam się') }));
});

test('Społeczność 3: rozmowę otwartą przez administratora odbiorca może od razu kontynuować', async () => {
  const chatId = 'admin_' + UB.toLowerCase();
  await env.withSecurityRulesDisabled(async (c) => {
    await setDoc(doc(c.firestore(), `lumina_chats/${chatId}`), { chatId, participants: [PARENT, UB], users: [PARENT, UB], conversationState: 'accepted' });
  });
  await assertSucceeds(setDoc(doc(ub(), 'lumina_direct_messages/r1'), dm(UB, PARENT, chatId, 'Dziękuję!')));
  await assertSucceeds(updateDoc(doc(ub(), `lumina_chats/${chatId}`), { lastMessageText: 'Dziękuję!' }));
  await assertFails(setDoc(doc(uc(), 'lumina_direct_messages/r2'), dm(UC, PARENT, chatId, 'obcy')));
});

test('Społeczność 4: odrzuconą prośbę odbiorca może później przyjąć; nadawca nie może jej sam otworzyć', async () => {
  await env.withSecurityRulesDisabled(async (c) => { await setDoc(doc(c.firestore(), `lumina_message_requests/${ABCHAT}`), req(UA, UB, 'declined')); });
  await assertFails(updateDoc(doc(ua(), `lumina_message_requests/${ABCHAT}`), { status: 'accepted', acceptedBy: UA, acceptedAt: serverTimestamp() }));
  await assertSucceeds(updateDoc(doc(ub(), `lumina_message_requests/${ABCHAT}`), { status: 'accepted', acceptedBy: UB, acceptedAt: serverTimestamp() }));
  await assertSucceeds(setDoc(doc(ub(), 'lumina_direct_messages/d1'), dm(UB, UA, ABCHAT, 'Jednak porozmawiajmy')));
});


test('Regresja syn → mama: zwykle konto mamy czyta pelna tresc i odpowiada w tym samym pokoju; obcy nadal nie czyta', async () => {
  await seed();
  const original = 'Wiadomosc syna dla mamy — pełna treść';
  await assertSucceeds(setDoc(doc(child(), 'lumina_direct_messages/child-to-mom'), dm(CHILD, MOM, MOMCHAT, original)));
  const first = await assertSucceeds(myDms(mom(), MOM, MOMCHAT));
  assert.equal(first.docs.find(d => d.id === 'child-to-mom').data().text, original);
  await assertSucceeds(setDoc(doc(mom(), 'lumina_direct_messages/mom-reply'), dm(MOM, CHILD, MOMCHAT, 'Odpowiedz mamy')));
  const again = await assertSucceeds(myDms(mom(), MOM, MOMCHAT));
  assert.equal(again.size, 2);
  assert.equal(again.docs.find(d => d.id === 'child-to-mom').data().text, original);
  const outsider = await assertSucceeds(myDms(stranger(), STRANGER, MOMCHAT));
  assert.equal(outsider.empty, true);
  await assertFails(getDoc(doc(stranger(), 'lumina_direct_messages/child-to-mom')));
});


// ── Pokoje LIVE TV ────────────────────────────────────────────────────────────
const liveMsg = (uid, extra = {}) => ({ roomId: 'tv_zapolske', text: 'Panie, błogosław Polsce', senderAuthUid: uid, senderName: 'Test', senderAvatar: '/lumina_icon.jpg', kind: 'prayer', createdAt: serverTimestamp(), ...extra });
test('LIVE TV: członek pisze w pokoju, wszyscy czytają, dziecko i gość nie piszą, nie da się podszyć ani dopisać pól', async () => {
  await seed();
  const col = (f) => collection(f, 'lumina_live_rooms/tv_zapolske/messages');
  await assertSucceeds(setDoc(doc(ua(), 'lumina_live_rooms/tv_zapolske/messages/p1'), liveMsg(UA)));
  await assertSucceeds(getDoc(doc(env.unauthenticatedContext().firestore(), 'lumina_live_rooms/tv_zapolske/messages/p1')));
  await assertFails(addDoc(col(child()), liveMsg(CHILD)));
  await assertFails(addDoc(col(env.unauthenticatedContext().firestore()), liveMsg('anon')));
  await assertFails(addDoc(col(ua()), liveMsg(UB)));
  await assertFails(addDoc(col(ua()), liveMsg(UA, { imageUrl: 'https://example.com/x.jpg' })));
  await assertFails(addDoc(col(ua()), liveMsg(UA, { text: 'x'.repeat(1001) })));
  await assertFails(addDoc(col(ua()), liveMsg(UA, { roomId: 'tv_cctv24' })));
  await assertFails(addDoc(col(ua()), liveMsg(UA, { kind: 'pinned' })));
  await assertFails(updateDoc(doc(ua(), 'lumina_live_rooms/tv_zapolske/messages/p1'), { text: 'zmiana' }));
  await assertFails(deleteDoc(doc(ub(), 'lumina_live_rooms/tv_zapolske/messages/p1')));
  await assertSucceeds(deleteDoc(doc(admin(), 'lumina_live_rooms/tv_zapolske/messages/p1')));
});
