<script lang="ts">
import type { DirectMessagingAdapter } from './types';

export interface LumiDirectDockProps {
  adapter: DirectMessagingAdapter;
  rightOffsetPx?: number;
  bottomOffsetPx?: number;
}
</script>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { DockConversation, DockMessage, IncomingDM, Unsubscribe } from './types';
import './lumi-direct-dock.css';

interface DockPrefs {
  autoOpen: boolean;
}

const PREFS_STORAGE_KEY = 'lumi-direct-dock-prefs-v1';
const MAX_TEXT_LENGTH = 4000;
const DEFAULT_PREFS: DockPrefs = { autoOpen: false };

function loadPrefs(): DockPrefs {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(PREFS_STORAGE_KEY) : null;
    return { ...DEFAULT_PREFS, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

function persistPrefs(next: DockPrefs): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
    }
  } catch {
    // Ignore storage quota errors in restricted WebViews.
  }
}

function formatMessageTime(isoString?: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

const props = withDefaults(defineProps<LumiDirectDockProps>(), {
  rightOffsetPx: 88,
  bottomOffsetPx: 16
});

const currentUserId = ref<string | null>(props.adapter.getCurrentUserId());
const conversations = ref<DockConversation[]>([]);
const activeId = ref<string | null>(null);
const messages = ref<Record<string, DockMessage[]>>({});
const drafts = ref<Record<string, string>>({});
const busy = ref(false);
const error = ref('');
const prefs = ref<DockPrefs>(loadPrefs());
const settingsOpen = ref(false);
const hidden = ref<string[]>([]);
const failedAvatars = ref<Record<string, boolean>>({});
const historyRef = ref<HTMLElement | null>(null);

const readAttemptSet = new Set<string>();
let unsubIncoming: Unsubscribe | null = null;
let unsubConversation: Unsubscribe | null = null;
let activeLoadSeq = 0;

const orderedConversations = computed(() =>
  conversations.value
    .filter((c) => c.type === 'direct' && c.participant && c.participant.id !== currentUserId.value)
    .slice()
    .sort((a, b) => (b.lastMessageAt || '').localeCompare(a.lastMessageAt || ''))
);

const eligibleHeads = computed(() =>
  orderedConversations.value.filter((c) => !hidden.value.includes(c.id))
);

const visibleHeads = computed(() => eligibleHeads.value.slice(0, 6));
const extraCount = computed(() => Math.max(0, eligibleHeads.value.length - 6));

const activeConversation = computed(() =>
  conversations.value.find((c) => c.id === activeId.value) ?? null
);

const currentMessages = computed(() =>
  activeId.value ? messages.value[activeId.value] ?? [] : []
);

const currentDraft = computed(() =>
  activeId.value ? drafts.value[activeId.value] ?? '' : ''
);

const rootStyle = computed(() => ({
  '--ldd-right': `${props.rightOffsetPx}px`,
  '--ldd-bottom': `${props.bottomOffsetPx}px`
}));

function teardownConversationSubscription(): void {
  if (typeof unsubConversation === 'function') {
    try {
      unsubConversation();
    } catch {
      // Ignore cleanup failure from detached listeners.
    }
    unsubConversation = null;
  }
}

function teardownSubscriptions(): void {
  if (typeof unsubIncoming === 'function') {
    try {
      unsubIncoming();
    } catch {
      // Ignore cleanup failure from detached listeners.
    }
    unsubIncoming = null;
  }
  teardownConversationSubscription();
}

function mergeSortedMessages(existing: DockMessage[], incoming: DockMessage[]): DockMessage[] {
  const byId = new Map<string, DockMessage>();
  for (const item of existing) byId.set(item.id, item);
  for (const item of incoming) byId.set(item.id, item);
  return [...byId.values()].sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
}

async function scrollHistoryToBottom(): Promise<void> {
  await nextTick();
  const el = historyRef.value;
  if (el) {
    el.scrollTop = el.scrollHeight;
  }
}

function checkMarkRead(): void {
  const uid = currentUserId.value;
  const convoId = activeId.value;
  if (!uid || !convoId) return;
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;

  const msgList = messages.value[convoId] ?? [];
  const lastMsg = msgList.length ? msgList[msgList.length - 1] : null;
  if (!lastMsg || lastMsg.senderId === uid) return;

  const readKey = `${convoId}:${lastMsg.id}`;
  if (readAttemptSet.has(readKey)) return;
  readAttemptSet.add(readKey);

  props.adapter
    .markRead(convoId, lastMsg.id)
    .then(() => {
      if (currentUserId.value !== uid) return;
      conversations.value = conversations.value.map((c) =>
        c.id === convoId ? { ...c, unreadCount: 0 } : c
      );
    })
    .catch(() => {
      readAttemptSet.delete(readKey);
    });
}

async function loadActiveConversation(convoId: string): Promise<void> {
  const uid = currentUserId.value;
  if (!convoId || !uid) return;
  const seq = ++activeLoadSeq;

  if (typeof unsubConversation === 'function') {
    try {
      unsubConversation();
    } catch {
      // Ignore cleanup failure.
    }
    unsubConversation = null;
  }

  if (typeof props.adapter.subscribeConversation === 'function') {
    unsubConversation = props.adapter.subscribeConversation(convoId, (msg) => {
      if (msg.conversationId !== convoId || activeId.value !== convoId) return;
      messages.value = {
        ...messages.value,
        [convoId]: mergeSortedMessages(messages.value[convoId] ?? [], [msg])
      };
      void scrollHistoryToBottom();
      checkMarkRead();
    });
  }

  try {
    const fetched = await props.adapter.listMessages(convoId, 600);
    if (seq !== activeLoadSeq || activeId.value !== convoId || currentUserId.value !== uid) return;
    messages.value = {
      ...messages.value,
      [convoId]: mergeSortedMessages(fetched ?? [], messages.value[convoId] ?? [])
    };
    await scrollHistoryToBottom();
    checkMarkRead();
  } catch (err) {
    if (seq !== activeLoadSeq) return;
    error.value = err instanceof Error && err.message ? err.message : 'Nie udało się pobrać wiadomości.';
  }
}

function openConversation(convoId: string): void {
  hidden.value = hidden.value.filter((id) => id !== convoId);
  activeId.value = convoId;
  error.value = '';
  void loadActiveConversation(convoId);
}

function toggleHead(convoId: string): void {
  if (activeId.value === convoId) {
    minimizeConversation();
  } else {
    openConversation(convoId);
  }
}

function minimizeConversation(): void {
  activeId.value = null;
  error.value = '';
  teardownConversationSubscription();
}

function closeConversation(): void {
  if (!activeId.value) return;
  const closingId = activeId.value;
  if (!hidden.value.includes(closingId)) {
    hidden.value = [...hidden.value, closingId];
  }
  activeId.value = null;
  error.value = '';
  teardownConversationSubscription();
}

function restoreHidden(): void {
  hidden.value = [];
}

function updateDraft(val: string): void {
  if (!activeId.value) return;
  drafts.value = { ...drafts.value, [activeId.value]: val };
}

function handleComposeKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    void sendMessage();
  }
}

async function sendMessage(): Promise<void> {
  const convoId = activeId.value;
  const senderUid = currentUserId.value;
  if (!convoId || !senderUid || busy.value) return;

  const rawDraft = drafts.value[convoId] ?? '';
  const text = rawDraft.trim();
  if (!text || text.length > MAX_TEXT_LENGTH) return;

  busy.value = true;
  error.value = '';

  try {
    const requestId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    const savedId = await props.adapter.sendText(convoId, text, requestId);
    if (typeof savedId !== 'string' || !savedId.trim()) {
      throw new Error('Brak potwierdzenia zapisu wiadomości.');
    }
    if (currentUserId.value === senderUid && drafts.value[convoId] === rawDraft) {
      drafts.value = { ...drafts.value, [convoId]: '' };
    }
    if (currentUserId.value === senderUid && activeId.value === convoId) {
      await loadActiveConversation(convoId);
    }
  } catch (err) {
    error.value =
      err instanceof Error && err.message
        ? err.message
        : 'Wysyłanie nie powiodło się. Wiadomość pozostała w polu wpisywania.';
  } finally {
    busy.value = false;
  }
}

function handleIncomingEvent(event: IncomingDM, sessionUid: string, initializedRef: { value: boolean }): void {
  if (currentUserId.value !== sessionUid) return;

  type RuntimeConvo = DockConversation & { lastMessageSenderId?: string };
  const batchEvent = event as IncomingDM & { conversations?: RuntimeConvo[] };
  if (Array.isArray(batchEvent.conversations)) {
    const prevById = new Map(conversations.value.map((c) => [c.id, c]));
    const wasInitialized = initializedRef.value;
    initializedRef.value = true;
    const filtered = batchEvent.conversations.filter(
      (c: RuntimeConvo) => c.type === 'direct' && c.participant && c.participant.id !== sessionUid
    );
    const changed = filtered.filter(
      (c: RuntimeConvo) =>
        wasInitialized &&
        c.lastMessageSenderId &&
        c.lastMessageSenderId !== sessionUid &&
        (!prevById.has(c.id) || prevById.get(c.id)?.lastMessageAt !== c.lastMessageAt)
    );
    conversations.value = filtered;
    if (changed.length > 0) {
      hidden.value = hidden.value.filter((id) => !changed.some((c: RuntimeConvo) => c.id === id));
      if (prefs.value.autoOpen && (typeof document === 'undefined' || document.visibilityState !== 'hidden')) {
        openConversation(changed[0].id);
      }
    }
    return;
  }

  if (!event.message || event.message.senderId === sessionUid) return;

  hidden.value = hidden.value.filter((id) => id !== event.conversationId);
  const exists = conversations.value.some((c) => c.id === event.conversationId);
  if (exists) {
    conversations.value = conversations.value.map((c) => {
      if (c.id !== event.conversationId) return c;
      const isCurrentActive = activeId.value === c.id;
      return {
        ...c,
        unreadCount: c.unreadCount + (isCurrentActive ? 0 : 1),
        lastMessageAt: event.message!.createdAt
      };
    });
  }

  messages.value = {
    ...messages.value,
    [event.conversationId]: mergeSortedMessages(messages.value[event.conversationId] ?? [], [event.message])
  };

  if (prefs.value.autoOpen) {
    props.adapter
      .listDirectConversations()
      .then((items) => {
        if (currentUserId.value !== sessionUid) return;
        conversations.value = (items ?? []).filter(
          (c) => c.type === 'direct' && c.participant && c.participant.id !== sessionUid
        );
        if (conversations.value.some((c) => c.id === event.conversationId)) {
          openConversation(event.conversationId);
        }
      })
      .catch(() => {});
  } else if (activeId.value === event.conversationId) {
    void scrollHistoryToBottom();
    checkMarkRead();
  }
}

function initSession(): void {
  teardownSubscriptions();
  const nextUid = props.adapter.getCurrentUserId();
  currentUserId.value = nextUid;
  conversations.value = [];
  activeId.value = null;
  messages.value = {};
  drafts.value = {};
  hidden.value = [];
  error.value = '';
  settingsOpen.value = false;
  readAttemptSet.clear();

  if (!nextUid) return;

  const initializedRef = { value: false };
  props.adapter
    .listDirectConversations()
    .then((items) => {
      if (currentUserId.value !== nextUid || initializedRef.value) return;
      conversations.value = (items ?? []).filter(
        (c) => c.type === 'direct' && c.participant && c.participant.id !== nextUid
      );
      initializedRef.value = true;
    })
    .catch(() => {
      if (currentUserId.value === nextUid) {
        error.value = 'Nie udało się pobrać rozmów prywatnych.';
      }
    });

  unsubIncoming = props.adapter.subscribeIncomingDM((event) => {
    handleIncomingEvent(event, nextUid, initializedRef);
  });
}

function handleVisibilityChange(): void {
  if (typeof document !== 'undefined' && document.visibilityState === 'visible' && activeId.value) {
    checkMarkRead();
  }
}

function handleAuthRefresh(): void {
  if (props.adapter.getCurrentUserId() !== currentUserId.value) {
    initSession();
  }
}

function markAvatarFailed(id: string): void {
  failedAvatars.value = { ...failedAvatars.value, [id]: true };
}

watch(
  () => prefs.value.autoOpen,
  (val) => {
    persistPrefs({ autoOpen: val });
  }
);

watch(
  () => props.adapter,
  () => {
    initSession();
  }
);

onMounted(() => {
  initSession();
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('lumina-auth-state', handleAuthRefresh);
    window.addEventListener('lumina-user-changed', handleAuthRefresh);
  }
});

onBeforeUnmount(() => {
  teardownSubscriptions();
  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('lumina-auth-state', handleAuthRefresh);
    window.removeEventListener('lumina-user-changed', handleAuthRefresh);
  }
});
</script>

<template>
  <section
    v-if="currentUserId && (visibleHeads.length > 0 || activeConversation)"
    class="ldd-root"
    aria-label="LUMI prywatne wiadomości"
    :style="rootStyle"
  >
    <div
      v-if="activeConversation"
      class="ldd-window"
      :data-chat-id="activeConversation.id"
      role="dialog"
      :aria-label="`Prywatna rozmowa z ${activeConversation.participant.name}`"
    >
      <header class="ldd-header">
        <img
          v-if="activeConversation.participant.avatarUrl && !failedAvatars[`win:${activeConversation.id}`]"
          class="ldd-avatar"
          :src="activeConversation.participant.avatarUrl"
          alt=""
          @error="markAvatarFailed(`win:${activeConversation.id}`)"
        />
        <span v-else class="ldd-avatar ldd-initial">
          {{ activeConversation.participant.name.charAt(0) }}
        </span>
        <div class="ldd-name">
          <strong>{{ activeConversation.participant.name }}</strong>
          <small>Wiadomość prywatna</small>
        </div>
        <button
          type="button"
          class="ldd-btn-min"
          aria-label="Minimalizuj rozmowę"
          @click="minimizeConversation"
        >
          −
        </button>
        <button
          type="button"
          class="ldd-prefs"
          aria-label="Ustawienia prywatnych powiadomień"
          title="Ustawienia"
          @click="settingsOpen = !settingsOpen"
        >
          ⚙
        </button>
        <button
          type="button"
          class="ldd-btn-close"
          aria-label="Zamknij rozmowę"
          @click="closeConversation"
        >
          ×
        </button>
      </header>

      <div
        ref="historyRef"
        class="ldd-history"
        aria-label="Historia rozmowy"
        role="log"
        aria-live="polite"
      >
        <div
          v-for="msg in currentMessages"
          :key="msg.id"
          class="ldd-line"
          :class="msg.senderId === currentUserId ? 'ldd-mine' : 'ldd-theirs'"
          :data-message-id="msg.id"
        >
          <div class="ldd-bubble">{{ msg.text }}</div>
          <span class="ldd-time">
            {{ formatMessageTime(msg.createdAt) }}<template v-if="msg.senderId === currentUserId && msg.deliveryStatus"> · {{ msg.deliveryStatus === 'read' ? 'Wyświetlono' : msg.deliveryStatus === 'delivered' ? 'Dostarczono' : 'Wysłano' }}</template>
          </span>
        </div>
      </div>

      <p v-if="error" class="ldd-error" role="alert">{{ error }}</p>

      <form class="ldd-compose" @submit.prevent="sendMessage">
        <label class="ldd-sr" for="ldd-compose-field">Napisz prywatną wiadomość</label>
        <textarea
          id="ldd-compose-field"
          rows="1"
          :maxlength="MAX_TEXT_LENGTH"
          placeholder="Wiadomość…"
          :value="currentDraft"
          @input="updateDraft(($event.target as HTMLTextAreaElement).value)"
          @keydown="handleComposeKeydown"
        />
        <button
          type="submit"
          :disabled="busy || !currentDraft.trim()"
          aria-label="Wyślij wiadomość"
        >
          ➤
        </button>
      </form>
    </div>

    <div class="ldd-dock" aria-label="Skróty rozmów prywatnych">
      <button
        v-for="convo in visibleHeads"
        :key="convo.id"
        type="button"
        class="ldd-head"
        :class="{ 'ldd-selected': activeId === convo.id }"
        :data-chat-id="convo.id"
        :title="`Rozmowa z ${convo.participant.name}`"
        :aria-label="`Otwórz rozmowę z ${convo.participant.name}, nieprzeczytane: ${convo.unreadCount}`"
        @click="toggleHead(convo.id)"
      >
        <img
          v-if="convo.participant.avatarUrl && !failedAvatars[`head:${convo.id}`]"
          :src="convo.participant.avatarUrl"
          alt=""
          @error="markAvatarFailed(`head:${convo.id}`)"
        />
        <span v-else class="ldd-initial">{{ convo.participant.name.charAt(0) }}</span>
        <b v-if="convo.unreadCount > 0" class="ldd-count">
          {{ convo.unreadCount > 99 ? '99+' : convo.unreadCount }}
        </b>
      </button>

      <span
        v-if="extraCount > 0"
        class="ldd-more"
        title="Pozostałe rozmowy dostępne w LUMI Messenger"
      >
        +{{ extraCount }}
      </span>
    </div>

    <div v-if="settingsOpen" class="ldd-settings">
      <label>
        <input v-model="prefs.autoOpen" type="checkbox" id="lddPrefAutoOpen" />
        Automatycznie otwieraj nowe wiadomości prywatne
      </label>
      <p>Możesz wyłączyć automatyczne otwieranie. Skrót z awatarem pozostanie dostępny.</p>
      <button type="button" id="lddBtnRestoreHidden" @click="restoreHidden">
        Przywróć zamknięte skróty
      </button>
    </div>
  </section>
</template>
