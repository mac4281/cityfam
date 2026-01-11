export interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserImageUrl?: string;
  lastMessage?: string;
  lastMessageTimestamp?: Date | string;
  unreadCount: number;
}

