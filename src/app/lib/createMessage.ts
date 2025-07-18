import {
  ClientMessageInterface,
  MetaData,
  NoteInterface,
  UserInterface,
} from "@/types/type";
import { fileType } from "./util";
import { v4 as uuidv4 } from "uuid";

export const createTextMessage = (
  user: UserInterface,
  roomId: string,
  messageText: string,
  reply?: ClientMessageInterface,
  forward?: ClientMessageInterface
) => {
  if (messageText.trim() === "") return null;
  const { id, name, image } = user;
  const newMessage: ClientMessageInterface = {
    id: uuidv4(),
    sender: id || "",
    sender_info: { id, name, image },
    room: roomId,
    is_read: [id || ""],
    reply: reply!,
    status: "pending",
    text: messageText,
    created_at: new Date().toISOString(),
    type: "text",
    is_edit: false,
    forward,
  };
  return newMessage;
};
export const createReplyNoteMessage = (
  user: UserInterface,
  roomId: string,
  messageText: string,
  reply_note: NoteInterface
) => {
  if (messageText.trim() === "") return null;
  const { id, name, image } = user;
  const newMessage: ClientMessageInterface = {
    id: uuidv4(),
    sender: id || "",
    sender_info: { id, name, image },
    room: roomId,
    is_read: [id || ""],
    reply_note: reply_note,
    status: "pending",
    text: messageText,
    created_at: new Date().toISOString(),
    type: "text",
    is_edit: false,
  };
  return newMessage;
};

export const createFileMessage = (
  user: UserInterface,
  roomId: string,
  file: File,
  reply?: ClientMessageInterface
) => {
  const metaData: MetaData = {
    type: file.type,
    url: URL.createObjectURL(file),
    size: file.size,
    public_id: "",
  };
  const type = fileType(metaData.type);
  const { id, name, image } = user;
  const newMessage: ClientMessageInterface = {
    id: uuidv4(),
    sender: id || "",
    sender_info: { id, name, image },
    room: roomId,
    is_read: [id || ""],
    reply: reply!,
    text: file.name,
    status: "pending",
    created_at: new Date().toISOString(),
    meta_data: metaData,
    type,
    is_edit: false,
  };
  return newMessage;
};

export const createForwardMessage = (
  user: UserInterface,
  forward: ClientMessageInterface,
  text: string
) => {
  const { id, name, image } = user;
  const newMessage: ClientMessageInterface = {
    sender: id || "",
    sender_info: { id, name, image },
    room: "",
    is_read: [id || ""],
    text,
    status: "pending",
    created_at: new Date().toISOString(),
    type: "text",
    is_edit: false,
    forward: forward.forward || forward,
  };
  return newMessage;
};
