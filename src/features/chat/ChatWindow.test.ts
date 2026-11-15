import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ChatWindow from "./ChatWindow.vue";
import { chatRepository } from "@/services/repositories/chatRepository";
import type { ChatMessage, DirectChatRoom } from "@/types/chat";

vi.mock("@/services/repositories/chatRepository", () => {
  return {
    chatRepository: {
      subscribeToMessages: vi.fn((chatId: string, callback: (messages: ChatMessage[]) => void) => {
        // Natychmiastowe wywołanie z przykładowymi wiadomościami
        callback([
          {
            id: "msg_1",
            senderId: "user_other",
            senderName: "Brat Jan",
            text: "Pokój Wam!",
            timestamp: "12:00",
            isRead: true,
            status: "read"
          },
          {
            id: "msg_2",
            senderId: "user_me",
            senderName: "Ja",
            text: "Amen!",
            timestamp: "12:01",
            isRead: false,
            status: "sent"
          },
          {
            id: "msg_3",
            senderId: "user_me",
            senderName: "Ja",
            text: "I z duchem twoim",
            timestamp: "12:02",
            isRead: true,
            status: "read"
          }
        ]);
        return vi.fn();
      }),
      sendMessage: vi.fn(),
      markMessagesAsRead: vi.fn()
    }
  };
});

describe("ChatWindow.vue", () => {
  const baseChat: DirectChatRoom = {
    id: "room_1",
    chatId: "room_1",
    participants: ["user_me", "user_other"],
    otherUserName: "Brat Jan",
    otherUserAvatar: "avatar_jan.jpg",
    isVerified: false,
    isOnline: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("P1: nie wyświetla ikony weryfikacji gdy profil nie jest zweryfikowany", () => {
    const wrapper = mount(ChatWindow, {
      props: {
        chat: { ...baseChat, isVerified: false },
        currentUserId: "user_me",
        currentUserName: "Ja"
      }
    });

    expect(wrapper.find(".check-icon").exists()).toBe(false);
  });

  it("P1: wyświetla ikonę weryfikacji gdy isVerified jest true", () => {
    const wrapper = mount(ChatWindow, {
      props: {
        chat: { ...baseChat, isVerified: true },
        currentUserId: "user_me",
        currentUserName: "Ja"
      }
    });

    expect(wrapper.find(".check-icon").exists()).toBe(true);
  });

  it("P1: wyświetla status 'Aktywny teraz' tylko gdy isOnline jest true, a fallback gdy false", () => {
    const offlineWrapper = mount(ChatWindow, {
      props: {
        chat: { ...baseChat, isOnline: false },
        currentUserId: "user_me",
        currentUserName: "Ja"
      }
    });
    expect(offlineWrapper.find(".partner-status").text()).not.toContain("Aktywny teraz");
    expect(offlineWrapper.find(".status-indicator-dot").exists()).toBe(false);

    const onlineWrapper = mount(ChatWindow, {
      props: {
        chat: { ...baseChat, isOnline: true },
        currentUserId: "user_me",
        currentUserName: "Ja"
      }
    });
    expect(onlineWrapper.find(".partner-status").text()).toContain("Aktywny teraz");
    expect(onlineWrapper.find(".status-indicator-dot").exists()).toBe(true);
  });

  it("P1: rozróżnia znacznik wysłania (fa-check) od przeczytania (fa-check-double is-read)", () => {
    const wrapper = mount(ChatWindow, {
      props: {
        chat: baseChat,
        currentUserId: "user_me",
        currentUserName: "Ja"
      }
    });

    // msg_2 jest wychodząca i isRead: false -> powinna mieć pojedynczy ptaszek is-sent
    const sentIcons = wrapper.findAll(".read-check.is-sent");
    expect(sentIcons.length).toBe(1);

    // msg_3 jest wychodząca i isRead: true -> powinna mieć podwójny ptaszek is-read
    const readIcons = wrapper.findAll(".read-check.is-read");
    expect(readIcons.length).toBe(1);
  });

  it("P2: zachowuje wpisany tekst w polu gdy sendMessage zwróci błąd/null", async () => {
    vi.mocked(chatRepository.sendMessage).mockResolvedValue(null);

    const wrapper = mount(ChatWindow, {
      props: {
        chat: baseChat,
        currentUserId: "user_me",
        currentUserName: "Ja"
      }
    });

    const input = wrapper.find(".chat-input-field");
    await input.setValue("Ważna intencja modlitewna, która nie może zginąć");

    const form = wrapper.find(".chat-input-form");
    await form.trigger("submit");

    // Ponieważ zapis się nie powiódł, tekst w polu NIE może być wyczyszczony!
    expect((input.element as HTMLInputElement).value).toBe("Ważna intencja modlitewna, która nie może zginąć");
    // Wyświetla się czytelny komunikat błędu
    expect(wrapper.find(".chat-send-error-banner").exists()).toBe(true);
  });

  it("ostrzega o niepotwierdzonym wysłaniu i zaleca sprawdzenie historii przed ponowieniem", async () => {
    vi.mocked(chatRepository.sendMessage)
      .mockResolvedValueOnce({ status: "delivery_unconfirmed" })
      .mockResolvedValueOnce({ status: "sent", id: "retry-message-1" });

    const wrapper = mount(ChatWindow, {
      props: {
        chat: baseChat,
        currentUserId: "user_me",
        currentUserName: "Ja"
      }
    });

    const input = wrapper.find(".chat-input-field");
    await input.setValue("Wiadomość o niepewnym statusie");
    await wrapper.find(".chat-input-form").trigger("submit");

    expect((input.element as HTMLInputElement).value).toBe("Wiadomość o niepewnym statusie");
    expect(wrapper.find(".chat-send-error-banner").text()).toContain("sprawdź historię rozmowy przed ponowną próbą");
    expect((wrapper.find(".btn-send-message").element as HTMLButtonElement).disabled).toBe(true);

    await wrapper.find(".chat-input-form").trigger("submit");
    expect(chatRepository.sendMessage).toHaveBeenCalledTimes(1);

    await wrapper.find(".btn-confirm-delivery-check").trigger("click");
    expect((wrapper.find(".btn-send-message").element as HTMLButtonElement).disabled).toBe(false);

    await wrapper.find(".chat-input-form").trigger("submit");
    expect(chatRepository.sendMessage).toHaveBeenCalledTimes(2);
    expect((input.element as HTMLInputElement).value).toBe("");
  });

  it("wiąże niepewny szkic z pierwotnym czatem i odbiorcą po przełączeniu rozmowy", async () => {
    const otherChat: DirectChatRoom = {
      ...baseChat,
      id: "room_2",
      chatId: "room_2",
      participants: ["user_me", "user_two"],
      otherUserName: "Siostra Maria"
    };
    vi.mocked(chatRepository.sendMessage)
      .mockResolvedValueOnce({ status: "delivery_unconfirmed" })
      .mockResolvedValueOnce({ status: "sent", id: "other-message" })
      .mockResolvedValueOnce({ status: "sent", id: "original-message" });

    const wrapper = mount(ChatWindow, {
      props: {
        chat: baseChat,
        currentUserId: "user_me",
        currentUserName: "Ja"
      }
    });

    const input = wrapper.find(".chat-input-field");
    await input.setValue("Szkic dla pierwotnego rozmówcy");
    await wrapper.find(".chat-input-form").trigger("submit");

    expect(wrapper.find(".btn-confirm-delivery-check").exists()).toBe(true);
    await wrapper.setProps({ chat: otherChat });
    expect((input.element as HTMLInputElement).value).toBe("");
    expect(wrapper.find(".btn-confirm-delivery-check").exists()).toBe(false);

    await input.setValue("Nowa wiadomość dla innego rozmówcy");
    await wrapper.find(".chat-input-form").trigger("submit");
    expect(chatRepository.sendMessage).toHaveBeenNthCalledWith(
      2,
      "room_2",
      "user_me",
      "Ja",
      "lumina_icon.jpg",
      "Nowa wiadomość dla innego rozmówcy",
      "user_two"
    );

    await wrapper.setProps({ chat: baseChat });
    expect((input.element as HTMLInputElement).value).toBe("Szkic dla pierwotnego rozmówcy");
    expect(wrapper.find(".btn-confirm-delivery-check").exists()).toBe(true);
    await wrapper.find(".btn-confirm-delivery-check").trigger("click");
    await wrapper.find(".chat-input-form").trigger("submit");

    expect(chatRepository.sendMessage).toHaveBeenNthCalledWith(
      3,
      "room_1",
      "user_me",
      "Ja",
      "lumina_icon.jpg",
      "Szkic dla pierwotnego rozmówcy",
      "user_other"
    );
  });

  it("czyści pole po wysłaniu, którego nie udało się odzwierciedlić w podglądzie, i zabrania ponowienia", async () => {
    vi.mocked(chatRepository.sendMessage).mockResolvedValue({
      status: "sent_preview_update_failed",
      id: "saved-message-1"
    });

    const wrapper = mount(ChatWindow, {
      props: {
        chat: baseChat,
        currentUserId: "user_me",
        currentUserName: "Ja"
      }
    });

    const input = wrapper.find(".chat-input-field");
    await input.setValue("Wiadomość zapisana");
    await wrapper.find(".chat-input-form").trigger("submit");

    expect((input.element as HTMLInputElement).value).toBe("");
    expect(wrapper.find(".chat-send-error-banner").text()).toContain("Wiadomość została wysłana");
    expect(wrapper.find(".chat-send-error-banner").text()).toContain("Nie wysyłaj jej ponownie");
  });

  it("pokazuje błąd ładowania zamiast stanu pustej rozmowy i pozwala ponowić subskrypcję", async () => {
    vi.mocked(chatRepository.subscribeToMessages).mockImplementationOnce(
      (_chatId, _callback, _messageLimit, onError) => {
        onError?.(new Error("permission-denied"));
        return vi.fn();
      }
    );

    const wrapper = mount(ChatWindow, {
      props: {
        chat: baseChat,
        currentUserId: "user_me",
        currentUserName: "Ja"
      }
    });

    expect(wrapper.find('[role="alert"]').text()).toContain("Nie udało się załadować wiadomości");
    expect(wrapper.find(".empty-messages-state").exists()).toBe(false);

    await wrapper.find(".btn-retry-messages").trigger("click");

    expect(chatRepository.subscribeToMessages).toHaveBeenCalledTimes(2);
    expect(wrapper.find(".chat-load-error-banner").exists()).toBe(false);
  });

  it("P2: czyści pole tekstowe po udanym wysłaniu wiadomości", async () => {
    vi.mocked(chatRepository.sendMessage).mockResolvedValue({ status: "sent", id: "new_msg_id_777" });

    const wrapper = mount(ChatWindow, {
      props: {
        chat: baseChat,
        currentUserId: "user_me",
        currentUserName: "Ja"
      }
    });

    const input = wrapper.find(".chat-input-field");
    await input.setValue("Błogosławionego dnia!");

    const form = wrapper.find(".chat-input-form");
    await form.trigger("submit");

    // Sukces - pole wyczyszczone, brak banera błędu
    expect((input.element as HTMLInputElement).value).toBe("");
    expect(wrapper.find(".chat-send-error-banner").exists()).toBe(false);
  });
});
