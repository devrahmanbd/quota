import {CompactUserWithEmail} from '@ui/types/user';

export interface Chat {
  id: number;
  status: 'active' | 'idle' | 'closed' | 'queued' | 'unassigned';
  last_message?: ChatContentItem;
  visitor_id: number;
  created_at: string;
  visitor?: CompactChatVisitor;
  assigned_to?: number;
  group_id?: number;
  assignee?: CompactUserWithEmail;
}

interface BaseChatContentItem {
  id: number;
  conversation_id: number;
  author: 'visitor' | 'agent' | 'system' | 'bot';
  created_at: string;
}

export interface PlaceholderChatMessage extends Omit<ChatMessage, 'id'> {
  id: string;
}

export interface ChatMessage extends BaseChatContentItem {
  type: 'message' | 'note';
  body: string;
  user?: CompactUserWithEmail;
  attachments?: ChatMessageAttachment[];
}

export interface ChatEvent extends BaseChatContentItem {
  type: 'event';
  body: {
    name:
      | 'visitor.startedChat'
      | 'closed.inactivity'
      | 'closed.byAgent'
      | 'visitor.idle'
      | 'visitor.leftChat'
      | 'agent.leftChat'
      | 'agent.reassigned';
    oldAgent?: string;
    newAgent?: string;
    closedBy?: string;
    status?: string;
  };
}

export type ChatContentItem = ChatMessage | PlaceholderChatMessage | ChatEvent;

export interface ChatMessageAttachment {
  id: number;
  type: string;
  name: string;
  file_size?: number;
  url?: string;
}

export interface CompactChatVisitor {
  id: number;
  name?: string;
  email?: string;
}

export interface ChatVisitor {
  id: number;
  user_identifier: string;
  user_ip: string;
  user?: CompactUserWithEmail;
  created_at: string;
  chats_count?: number;
  email?: string;
  name?: string;
  data: {
    //
  };
  country: string;
  city: string;
  platform: string;
  browser: string;
  device: 'desktop' | 'mobile' | 'tablet' | 'robot' | 'other';
  timezone: string;
}

export interface ChatVisit {
  id: number;
  created_at: string;
  ended_at?: string;
  url: string;
  title: string;
}
