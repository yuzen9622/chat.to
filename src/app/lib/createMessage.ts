import { ClientMessageInterface, MetaData, NoteInterface } from "@/types/type";
import { fileType } from "./util";
import { v4 as uuidv4 } from "uuid";

export const createTextMessage = (
  userId: string,
  roomId: string,
  messageText: string,
  reply?: ClientMessageInterface
) => {
  if (messageText.trim() === "") return null;

  const newMessage: ClientMessageInterface = {
    id: uuidv4(),
    sender: userId || "",
    room: roomId,
    is_read: [userId || ""],
    reply: reply!,
    status: "pending",
    text: messageText,
    created_at: new Date().toISOString(),
    type: "text",
  };
  return newMessage;
};
export const createReplyNoteMessage = (
  userId: string,
  roomId: string,
  messageText: string,
  reply_note: NoteInterface
) => {
  if (messageText.trim() === "") return null;

  const newMessage: ClientMessageInterface = {
    id: uuidv4(),
    sender: userId || "",
    room: roomId,
    is_read: [userId || ""],
    reply_note: reply_note,
    status: "pending",
    text: messageText,
    created_at: new Date().toISOString(),
    type: "text",
  };
  return newMessage;
};

export const createFileMessage = (
  userId: string,
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
  const newMessage: ClientMessageInterface = {
    id: uuidv4(),
    sender: userId || "",
    room: roomId,
    is_read: [userId || ""],
    reply: reply!,
    text: file.name,
    status: "pending",
    created_at: new Date().toISOString(),
    meta_data: metaData,
    type,
  };
  return newMessage;
};
