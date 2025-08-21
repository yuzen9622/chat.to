export type MetaData = {
  public_id: string;
  type: string;
  url: string;
  size: number;
};
export type UserImageData = { imgFile: File; imgUrl: string };
export type friendStatus = "accepted" | "declined" | "pending" | "canceled";
export type MessageStatus = "send" | "pending" | "failed" | "deleting";
export type MessageType = "text" | "media" | "file" | "audio";
export type ProviderType = "google" | "github" | "credentials";
export type CallStatus = "connect" | "disconnect" | "waiting" | "receiving";
export type CallType = "voice" | "video";
export type RoomTheme =
  | { type: "color"; bgColor: string; textColor: string; ownColor: string }
  | {
      type: "image";
      image: { url: string; public_id: string };
      bgImage: string;
    };

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

export interface BaseMessage {
  id?: string;
  text: string;
  meta_data?: MetaData;
  sender: string;
  room: string;
  created_at: string;
  status: MessageStatus;
  is_read: Array<string>;
  reply_note?: NoteInterface;
  type: MessageType;
  is_edit: boolean;
}

export interface ClientMessageInterface extends BaseMessage {
  sender_info: PublicUserInfo;
  reply?: ClientMessageInterface;
  forward?: ClientMessageInterface;
}

export interface ServerMessageInterface extends BaseMessage {
  reply?: string;
  forward?: string;
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

export interface PublicUserInfo {
  id: string;
  name: string;
  image: string;
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
  room_owner?: string;
  room_theme: RoomTheme | null;
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
  sender_info: PublicUserInfo;
  receiver_info: PublicUserInfo;
  status: friendStatus;
  created_at: Date;
}

export interface SystemAlertInterface {
  open: boolean;
  severity: "success" | "info" | "error";
  variant: "standard" | "filled" | "outlined";
  text: string;
}

export interface Forward {
  room_type: "personal" | "group";
  room_id: string;
}
