import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();

test('Lumi Direct Dock: contract and implementation files exist', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'components/lumi-direct-dock-adapter.js')), 'Adapter file exists');
  assert.ok(fs.existsSync(path.join(ROOT, 'components/lumi-direct-dock.js')), 'Component file exists');
  assert.ok(fs.existsSync(path.join(ROOT, 'css/lumi-direct-dock.css')), 'CSS file exists');
  assert.ok(fs.existsSync(path.join(ROOT, 'src/lumi-direct-dock/src/types.ts')), 'Source types exist');
  assert.ok(fs.existsSync(path.join(ROOT, 'src/lumi-direct-dock/src/LumiDirectDock.vue')), 'Vue 3 source exists');
});

test('Lumi Direct Dock Adapter: adheres to DirectMessagingAdapter contract', () => {
  const code = fs.readFileSync(path.join(ROOT, 'components/lumi-direct-dock-adapter.js'), 'utf8');

  // Symulowane środowisko przeglądarki
  const sandbox = {
    window: {},
    LuminaDB: {
      getCurrentUser: () => ({ uid: 'user_1', slug: 'jan_kowalski', isAnonymous: false }),
      getCurrentProfile: () => ({ uid: 'user_1', slug: 'jan_kowalski', name: 'Jan Kowalski' }),
      normalizeChatUserId: (id) => String(id).toLowerCase().trim(),
      getBlockedUsers: async () => ['blocked_user_99'],
      isUserBlocked: (id) => id === 'blocked_user_99',
      subscribeToUserChats: (userId, cb) => {
        cb([
          {
            chatId: 'jan_kowalski_anna_nowak',
            users: ['jan_kowalski', 'anna_nowak'],
            participants: ['user_1', 'user_2'],
            otherName: 'Anna Nowak',
            otherAvatar: 'avatar_anna.jpg',
            lastMessageTimestamp: 1729238400000,
            unreadCount: { jan_kowalski: 2 }
          },
          {
            chatId: 'jan_kowalski_blocked_user_99',
            users: ['jan_kowalski', 'blocked_user_99'],
            participants: ['user_1', 'user_99'],
            otherName: 'Blocked User',
            lastMessageTimestamp: 1729238000000
          }
        ]);
        return () => {};
      },
      subscribeToDirectMessages: (chatId, cb) => {
        cb([
          { id: 'msg_1', chatId, senderId: 'anna_nowak', text: 'Cześć Jan!', createdAt: 1729238300000, isRead: false },
          { id: 'msg_2', chatId, senderId: 'jan_kowalski', text: 'Dzień dobry!', createdAt: 1729238400000, isRead: true }
        ]);
        return () => {};
      },
      sendDirectMessageToCloud: async (chatId, msgObj) => {
        assert.equal(chatId, 'jan_kowalski_anna_nowak');
        assert.equal(msgObj.receiverId, 'anna_nowak');
        assert.equal(msgObj.text, 'Nowa wiadomość testowa');
        return 'new_msg_id_777';
      },
      markDirectMessagesAsRead: async (chatId, userId, name) => true
    },
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    addEventListener: () => {},
    removeEventListener: () => {}
  };
  sandbox.global = sandbox;
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);

  assert.equal(typeof sandbox.createDirectMessagingAdapter, 'function', 'Factory function is exported');
  const adapter = sandbox.createDirectMessagingAdapter();

  // 1. getCurrentUserId
  assert.equal(adapter.getCurrentUserId(), 'jan_kowalski', 'Returns normalized authenticated user id');

  // 2. listDirectConversations (uwzględnia blokady i filtruje blocked_user_99)
  return adapter.listDirectConversations().then(convos => {
    assert.equal(convos.length, 1, 'Only non-blocked conversations are listed');
    assert.equal(convos[0].id, 'jan_kowalski_anna_nowak');
    assert.equal(convos[0].participant.id, 'anna_nowak');
    assert.equal(convos[0].unreadCount, 2);

    // 3. listMessages
    return adapter.listMessages('jan_kowalski_anna_nowak', 50).then(msgs => {
      assert.equal(msgs.length, 2);
      assert.equal(msgs[0].id, 'msg_1');
      assert.equal(msgs[0].text, 'Cześć Jan!');
      assert.equal(msgs[1].deliveryStatus, 'read');

      // 4. sendText validation
      return adapter.sendText('jan_kowalski_anna_nowak', 'Nowa wiadomość testowa', 'req_1').then(() => {
        // Powinno rzucić błąd przy zablokowanym użytkowniku
        return adapter.sendText('jan_kowalski_blocked_user_99', 'Hej', 'req_2')
          .then(() => assert.fail('Should have thrown for blocked user'))
          .catch(err => {
            assert.ok(err.message.includes('zablokowany'), 'Correctly blocked message sending');
          });
      });
    });
  });
});

test('Lumi Direct Dock Controller: state, auto-open policy, and DOM interaction', () => {
  const code = fs.readFileSync(path.join(ROOT, 'components/lumi-direct-dock.js'), 'utf8');

  let appendChildCalled = false;
  let eventListeners = {};

  const fakeElement = {
    className: '',
    style: {
      setProperty: () => {},
      display: ''
    },
    setAttribute: () => {},
    innerHTML: '',
    parentNode: { removeChild: () => {} },
    querySelector: (sel) => {
      if (sel === '#ldd-compose-field') return { value: '', focus: () => {} };
      if (sel === '.ldd-compose') return { onsubmit: null };
      if (sel === '.ldd-btn-min') return { onclick: null };
      if (sel === '.ldd-btn-close') return { onclick: null };
      return null;
    },
    querySelectorAll: () => []
  };

  const sandbox = {
    localStorage: {
      _data: {},
      getItem(k) { return this._data[k] || null; },
      setItem(k, v) { this._data[k] = String(v); }
    },
    document: {
      readyState: 'complete',
      visibilityState: 'visible',
      createElement: () => {
        appendChildCalled = true;
        return fakeElement;
      },
      body: {
        appendChild: () => {}
      },
      addEventListener: (evt, fn) => { eventListeners[evt] = fn; },
      removeEventListener: () => {}
    },
    addEventListener: (evt, fn) => { eventListeners[evt] = fn; },
    removeEventListener: () => {}
  };
  sandbox.global = sandbox;
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);

  assert.equal(typeof sandbox.LumiDirectDockController, 'function');
  assert.equal(typeof sandbox.mountLumiDirectDock, 'function');

  // Test zachowania przy braku autoryzacji
  const mockAdapterNoAuth = {
    getCurrentUserId: () => null
  };
  const ctrlNoAuth = new sandbox.LumiDirectDockController({ adapter: mockAdapterNoAuth });
  ctrlNoAuth.syncUser();
  assert.equal(ctrlNoAuth.userId, null, 'No user logged in -> userId is null');
  assert.equal(ctrlNoAuth.conversations.length, 0);

  // Test z zalogowanym użytkownikiem
  let incomingCallback = null;
  const mockAdapterAuth = {
    getCurrentUserId: () => 'adam_testowy',
    listDirectConversations: async () => [
      {
        id: 'adam_testowy_ewa_testowa',
        type: 'direct',
        participant: { id: 'ewa_testowa', name: 'Ewa Testowa', avatarUrl: 'ewa.jpg', isOnline: true },
        unreadCount: 0,
        lastMessageAt: '2026-10-18T09:00:00Z'
      }
    ],
    listMessages: async () => [],
    subscribeIncomingDM: (cb) => {
      incomingCallback = cb;
      return () => {};
    },
    markRead: async () => {}
  };

  const ctrl = new sandbox.LumiDirectDockController({ adapter: mockAdapterAuth });
  ctrl.syncUser();
  assert.equal(ctrl.userId, 'adam_testowy');

  // Default requested by owner (2026-10-18): bubble appears by default without auto-opening window.
  assert.equal(ctrl.prefs.autoOpen, false, 'New incoming private conversations show avatar bubble by default without auto-opening window');

  // Sprawdź minimalizację i zamykanie
  ctrl.openConversation('adam_testowy_ewa_testowa');
  assert.equal(ctrl.activeId, 'adam_testowy_ewa_testowa', 'Conversation opened');

  // Minimalizacja
  ctrl.activeId = null;
  assert.equal(ctrl.activeId, null, 'Minimized conversation');
  assert.ok(!ctrl.hidden.includes('adam_testowy_ewa_testowa'), 'Conversation still in dock heads');

  // Zamknięcie (×)
  ctrl.hidden.push('adam_testowy_ewa_testowa');
  ctrl.activeId = null;
  assert.ok(ctrl.hidden.includes('adam_testowy_ewa_testowa'), 'Chat head hidden');

  // Nowa wiadomość przywraca ukryty chat head
  if (incomingCallback) {
    incomingCallback({
      conversationId: 'adam_testowy_ewa_testowa',
      message: {
        id: 'msg_999',
        conversationId: 'adam_testowy_ewa_testowa',
        senderId: 'ewa_testowa',
        text: 'Halo Adam!',
        createdAt: '2026-10-18T09:30:00Z'
      }
    });
    assert.ok(!ctrl.hidden.includes('adam_testowy_ewa_testowa'), 'New incoming DM unhides the chat head');
    assert.equal(ctrl.activeId, null, 'Auto-open disabled -> activeId remains null (no intrusive focus)');
  }
});

test('Lumi Direct Dock model only: two in-memory mock accounts (not production E2E)', async () => {
  // Symulacja bazy Firestore w pamięci dla dwóch kont
  const firestoreDb = {
    messages: [],
    chats: [
      {
        chatId: 'cezaryrgowski_wiolettarogowska',
        users: ['cezaryrgowski', 'wiolettarogowska'],
        participants: ['uid_cezary', 'uid_wioletta'],
        lastMessageTimestamp: Date.now(),
        unreadCount: { cezaryrgowski: 0, wiolettarogowska: 0 }
      }
    ]
  };

  function createMockAdapterForUser(userId, uid, name, partnerId, partnerName) {
    const listeners = [];
    return {
      getCurrentUserId: () => userId,
      async listDirectConversations() {
        return [
          {
            id: 'cezaryrgowski_wiolettarogowska',
            type: 'direct',
            participant: { id: partnerId, name: partnerName, avatarUrl: `${partnerId}.jpg`, isOnline: true },
            unreadCount: firestoreDb.chats[0].unreadCount[userId] || 0,
            lastMessageAt: new Date(firestoreDb.chats[0].lastMessageTimestamp).toISOString()
          }
        ];
      },
      async listMessages(chatId) {
        return firestoreDb.messages
          .filter(m => m.conversationId === chatId)
          .map(m => ({ ...m }));
      },
      subscribeIncomingDM(cb) {
        listeners.push(cb);
        return () => {
          const idx = listeners.indexOf(cb);
          if (idx >= 0) listeners.splice(idx, 1);
        };
      },
      async sendText(chatId, text, clientRequestId) {
        const msg = {
          id: `msg_${Date.now()}_${Math.random()}`,
          conversationId: chatId,
          senderId: userId,
          text,
          createdAt: new Date().toISOString(),
          deliveryStatus: 'sent'
        };
        firestoreDb.messages.push(msg);
        firestoreDb.chats[0].unreadCount[partnerId] = (firestoreDb.chats[0].unreadCount[partnerId] || 0) + 1;
        firestoreDb.chats[0].lastMessageTimestamp = Date.now();

        // Powiadom partnera
        if (global._mockBroadcastDM) {
          global._mockBroadcastDM(partnerId, { conversationId: chatId, message: msg });
        }
      },
      async markRead(chatId, messageId) {
        firestoreDb.messages.forEach(m => {
          if (m.conversationId === chatId) m.deliveryStatus = 'read';
        });
        firestoreDb.chats[0].unreadCount[userId] = 0;
      },
      _dispatchIncoming(event) {
        listeners.forEach(cb => cb(event));
      }
    };
  }

  const adapter1 = createMockAdapterForUser('cezaryrgowski', 'uid_cezary', 'Cezary Rogowski', 'wiolettarogowska', 'Wioletta Rogowska');
  const adapter2 = createMockAdapterForUser('wiolettarogowska', 'uid_wioletta', 'Wioletta Rogowska', 'cezaryrgowski', 'Cezary Rogowski');

  global._mockBroadcastDM = (targetUser, event) => {
    if (targetUser === 'wiolettarogowska') adapter2._dispatchIncoming(event);
    if (targetUser === 'cezaryrgowski') adapter1._dispatchIncoming(event);
  };

  // 1. Cezary wysyła wiadomość do Wioletty
  await adapter1.sendText('cezaryrgowski_wiolettarogowska', 'Niech będzie pochwalony Jezus Chrystus!', 'req_c1');

  // 2. Sprawdź stan u Wioletty
  const convosWioletta = await adapter2.listDirectConversations();
  assert.equal(convosWioletta[0].unreadCount, 1, 'Wioletta has 1 unread message');

  const msgsWioletta = await adapter2.listMessages('cezaryrgowski_wiolettarogowska');
  assert.equal(msgsWioletta.length, 1);
  assert.equal(msgsWioletta[0].text, 'Niech będzie pochwalony Jezus Chrystus!');
  assert.equal(msgsWioletta[0].senderId, 'cezaryrgowski');

  // 3. Wioletta odczytuje wiadomość
  await adapter2.markRead('cezaryrgowski_wiolettarogowska', msgsWioletta[0].id);
  const convosWiolettaAfterRead = await adapter2.listDirectConversations();
  assert.equal(convosWiolettaAfterRead[0].unreadCount, 0, 'Unread count reset to 0 after markRead');

  // 4. Wioletta odpowiada Cezaremu
  await adapter2.sendText('cezaryrgowski_wiolettarogowska', 'Na wieki wieków. Amen! ✨', 'req_w1');

  // 5. Cezary widzi odpowiedź
  const msgsCezary = await adapter1.listMessages('cezaryrgowski_wiolettarogowska');
  assert.equal(msgsCezary.length, 2);
  assert.equal(msgsCezary[1].text, 'Na wieki wieków. Amen! ✨');
  assert.equal(msgsCezary[1].senderId, 'wiolettarogowska');

  delete global._mockBroadcastDM;
});

