export type MetaData = {
  public_id: string;
  type: string;
  url: string;
  size: number;
};
export type friendStatus = "accepted" | "declined" | "pending" | "canceled";
export type MessageStatus = "send" | "pending" | "failed" | "deleting";
export type MessageType = "text" | "media" | "file" | "url" | "audio";
export type ProviderType = "google" | "github" | "credentials";

export interface TypingInterface {
  roomId: string;
  typing: boolean;
  user: UserInterface;
}

export interface NotifyMessage {
  type: "message";
  data: ClientMessageInterface;
}

export interface NotifyFriend {
  type: "friend";
  data: FriendInterface;
}

export type NotifyInterface = NotifyMessage | NotifyFriend;

export interface ClientMessageInterface {
  id?: string;
  text: string;
  meta_data?: MetaData;
  reply?: ClientMessageInterface;
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
  user: UserInterface;
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
  created_at?: string;
  user: UserInterface;
}

export interface RoomInterface {
  id: string;
  room_name: string;
  created_at: string;
  room_members: Array<RoomMemberInterface>;
  room_type: "personal" | "group";
  room_img?: { url: string; public_id: "" };

  updated_at?: Date;
}
export interface FriendInterface {
  id: string;
  user_id: string;
  friend_id: string;
  user: UserInterface;
  personal_room_id: string;
}

export interface FriendRequestInterface {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: friendStatus;
  created_at: Date;
}

export interface SystemAlertInterface {
  open: boolean;
  serverity: "success" | "info" | "error";
  variant: "standard" | "filled" | "outlined";
  text: string;
}
