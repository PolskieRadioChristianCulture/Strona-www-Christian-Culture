/**
 * ==========================================================================
 * LUMINA TYPED DATA CONTRACTS - CHAT & MESSENGER MODEL
 * ==========================================================================
 */

export interface ChatReaction {
  emoji: string;
  count: number;
  users: string[];
}

export type AssistantActionType =
  | 'open_url'
  | 'share'
  | 'copy'
  | 'open_contact'
  | 'submit_idea'
  | 'show_topic';

export interface AssistantAction {
  type: AssistantActionType;
  label: string;
  url?: string;
  topicId?: string;
  payload?: string;
  primary?: boolean;
}

export interface AssistantPayload {
  version: 1;
  actions: AssistantAction[];
  sourceIds?: string[];
  intent?: string;
  confidence?: 'high' | 'medium' | 'low' | 'none';
  sharePrompt?: {
    enabled: boolean;
    text?: string;
    targetUrl?: string;
  };
}

export interface ChatMessage {
  id: string;
  chatId?: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId?: string;
  text: string;
  timestamp: any;
  isRead?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  reactions?: Record<string, string[]>;
  seenBy?: Array<{ id: string; name: string; time: number }>;
  assistantPayload?: AssistantPayload;
}

export interface DirectChatRoom {
  id: string;
  chatId: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount?: number;
  otherUserName?: string;
  otherUserAvatar?: string;
  otherUserSlug?: string;
  isVerified?: boolean;
  isOnline?: boolean;
  statusText?: string;
  lastSeen?: any;
}
