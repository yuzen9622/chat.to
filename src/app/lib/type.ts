export type MetaData = {
  public_id: string;
  type: string;
  url: string;
  size: number;
};
export type friendStatus = "accepted" | "declined" | "pending" | "canceled";
export type MessageStatus = "send" | "pending" | "failed" | "deleting";
export type MessageType = "text" | "media" | "file" | "url";
export type ProviderType = "google" | "github" | "credentials";

export interface TypingInterface {
  userId: string;
  typing: boolean;
}

export interface NotifyMessage {
  type: "message";
  data: MessageInterface;
}

export interface NotifyFriend {
  type: "friend";
  data: FriendInterface;
}

export type NotifyInterface = NotifyMessage | NotifyFriend;

export interface MessageInterface {
  id?: string;
  text: string;
  meta_data?: MetaData;
  reply?: string;
  sender: string;
  room: string;
  created_at: string;
  status: MessageStatus;
  is_read: Array<string>;
  type: MessageType;
}
export interface NoteInterface {
  id: number;
  text: string;
  user_id: string;
  created_at: Date;
  public: boolean;
  updated_at: string;
}
export interface UserInterface {
  id: string;
  name: string;
  email?: string;
  image: string;
  note?: NoteInterface;
  provider?: ProviderType;
}

export interface RoomMemberInterface {
  id?: string;
  room_id: string;
  user_id: string;
  is_deleted: boolean;
}

export interface RoomInterface {
  id: string;
  room_name: string;
  created_at: string;
  room_members: Array<RoomMemberInterface>;
  room_type: "personal" | "group";
  room_img?: "";
  updated_at?: Date;
}
export interface FriendInterface {
  id: string;
  user_id: string;
  friend_id: string;
}

export interface FriendRequestInterface {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: friendStatus;
  created_at: Date;
}
