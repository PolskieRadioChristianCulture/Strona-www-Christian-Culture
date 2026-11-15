import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import LumiDirectDock from './LumiDirectDock.vue';
import type { DirectMessagingAdapter, DockConversation, DockMessage, IncomingDM } from './types';

function createMockAdapter(overrides: Partial<DirectMessagingAdapter> = {}) {
  let incomingHandler: ((event: IncomingDM) => void) | null = null;
  const baseConversations: DockConversation[] = [
    {
      id: 'dm_1',
      type: 'direct',
      unreadCount: 2,
      lastMessageAt: '2026-11-14T12:00:00.000Z',
      participant: {
        id: 'user_anna',
        name: 'Anna Nowak',
        avatarUrl: 'avatar_anna.jpg',
        isOnline: true
      }
    }
  ];

  const baseMessages: DockMessage[] = [
    {
      id: 'msg_1',
      conversationId: 'dm_1',
      senderId: 'user_anna',
      text: 'Pokój Boży!',
      createdAt: '2026-11-14T12:00:00.000Z'
    }
  ];

  const unsubIncoming = vi.fn();
  const unsubConvo = vi.fn();

  const adapter: DirectMessagingAdapter = {
    getCurrentUserId: vi.fn(() => 'user_me'),
    listDirectConversations: vi.fn(async () => baseConversations),
    listMessages: vi.fn(async () => baseMessages),
    sendText: vi.fn(async () => 'msg_sent_1'),
    markRead: vi.fn(async () => {}),
    subscribeIncomingDM: vi.fn((cb) => {
      incomingHandler = cb;
      return unsubIncoming;
    }),
    subscribeConversation: vi.fn(() => unsubConvo),
    ...overrides
  };

  return {
    adapter,
    unsubIncoming,
    unsubConvo,
    emitIncoming: (ev: IncomingDM) => incomingHandler?.(ev)
  };
}

describe('LumiDirectDock.vue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('domyślnie nie otwiera automatycznie okna DM przy starcie i pokazuje badge nieprzeczytanych', async () => {
    const { adapter } = createMockAdapter();
    const wrapper = mount(LumiDirectDock, { props: { adapter } });
    await flushPromises();

    expect(wrapper.find('.ldd-head').exists()).toBe(true);
    expect(wrapper.find('.ldd-count').text()).toBe('2');
    expect(wrapper.find('.ldd-window').exists()).toBe(false);
  });

  it('otwiera okno po kliknięciu głowy rozmowy, oznacza jako przeczytane i wysyła odpowiedź', async () => {
    const { adapter } = createMockAdapter();
    const wrapper = mount(LumiDirectDock, { props: { adapter } });
    await flushPromises();

    await wrapper.find('.ldd-head').trigger('click');
    await flushPromises();

    expect(wrapper.find('.ldd-window').exists()).toBe(true);
    expect(wrapper.find('.ldd-bubble').text()).toContain('Pokój Boży!');
    expect(adapter.markRead).toHaveBeenCalledTimes(1);

    const textarea = wrapper.find('#ldd-compose-field');
    await textarea.setValue('Amen, dziękuję!');
    await wrapper.find('.ldd-compose').trigger('submit.prevent');
    await flushPromises();

    expect(adapter.sendText).toHaveBeenCalledWith('dm_1', 'Amen, dziękuję!', expect.any(String));
  });

  it('zachowuje wpisaną wiadomość i pokazuje alert błędu, gdy sendText zawiedzie', async () => {
    const { adapter } = createMockAdapter({
      sendText: vi.fn(async () => {
        throw new Error('Brak połączenia z chmurą');
      })
    });
    const wrapper = mount(LumiDirectDock, { props: { adapter } });
    await flushPromises();

    await wrapper.find('.ldd-head').trigger('click');
    await flushPromises();

    const textarea = wrapper.find('#ldd-compose-field');
    await textarea.setValue('Nieutracona treść');
    await wrapper.find('.ldd-compose').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.find('.ldd-error').text()).toContain('Brak połączenia z chmurą');
    expect((textarea.element as HTMLTextAreaElement).value).toBe('Nieutracona treść');
  });

  it('odróżnia minimalizację od zamknięcia i sprząta subskrypcje przy unmount', async () => {
    const { adapter, unsubIncoming, unsubConvo, emitIncoming } = createMockAdapter();
    const wrapper = mount(LumiDirectDock, { props: { adapter } });
    await flushPromises();

    await wrapper.find('.ldd-head').trigger('click');
    await flushPromises();

    await wrapper.find('.ldd-btn-min').trigger('click');
    expect(wrapper.find('.ldd-window').exists()).toBe(false);
    expect(wrapper.find('.ldd-head').exists()).toBe(true);

    await wrapper.find('.ldd-head').trigger('click');
    await flushPromises();
    await wrapper.find('.ldd-btn-close').trigger('click');
    expect(wrapper.find('.ldd-head').exists()).toBe(false);

    emitIncoming({
      conversationId: 'dm_1',
      message: {
        id: 'msg_2',
        conversationId: 'dm_1',
        senderId: 'user_anna',
        text: 'Nowa wiadomość',
        createdAt: '2026-11-14T12:05:00.000Z'
      }
    });
    await flushPromises();
    expect(wrapper.find('.ldd-head').exists()).toBe(true);

    wrapper.unmount();
    expect(unsubIncoming).toHaveBeenCalledTimes(1);
    expect(unsubConvo).toHaveBeenCalledTimes(
      (adapter.subscribeConversation as ReturnType<typeof vi.fn>).mock.calls.length
    );
  });
});
