import { sendAblyMessage } from "@/app/lib/ably/ablyMessage";
import {
  editUserMessage,
  sendUserMessage,
} from "@/app/lib/api/message/messageApi";
import { createFileMessage, createTextMessage } from "@/app/lib/createMessage";
import { uploadFile } from "@/app/lib/util";
import { useAblyStore } from "@/app/store/AblyStore";
import { useChatStore } from "@/app/store/ChatStore";
import { ClientMessageInterface, UserInterface } from "@/types/type";

import { Dispatch, SetStateAction, useCallback } from "react";

type sendProps = {
  user?: UserInterface;
  roomId: string;
  messageText: string;
  messageFiles: File[];

  setMessageText: Dispatch<SetStateAction<string>>;
  setMessageFiles: Dispatch<SetStateAction<File[]>>;
};

type EditProps = {
  messageText: string;
  setMessageText: Dispatch<SetStateAction<string>>;
};

export const useInputBarSend = ({
  user,
  roomId,
  messageText,
  messageFiles,
  setMessageText,
  setMessageFiles,
}: sendProps) => {
  const { reply, setReply, setCurrentMessage, setLastMessages } =
    useChatStore();

  const handleSendMessage = useCallback(async () => {
    if (!user) return;
    const pendingMessages: ClientMessageInterface[] = [];
    const newMessage: ClientMessageInterface | null = createTextMessage(
      user,
      roomId,
      messageText,
      reply!
    );
    if (newMessage) {
      pendingMessages.push(newMessage);
      setLastMessages({ ...newMessage, isFetching: true });
      setMessageText("");
    }

    const newFilesMessages: ClientMessageInterface[] = messageFiles.map(
      (file) => createFileMessage(user!, roomId, file, reply!)
    );

    newFilesMessages.forEach((msg) => {
      pendingMessages.push(msg);
    });
    setMessageFiles([]);
    setCurrentMessage((prev) => [...prev, ...pendingMessages]);
    try {
      if (messageFiles.length > 0) {
        const filesResponse = await uploadFile(messageFiles);
        if (filesResponse) {
          const uploadFileMessages = newFilesMessages.map((msg, index) => {
            if (msg.meta_data) {
              const { url, public_id } = filesResponse[index];
              msg.meta_data = {
                ...msg.meta_data,
                public_id,
                url,
              };
            }
            return msg;
          });
          await Promise.all(
            uploadFileMessages.map(async (msg) => {
              await sendUserMessage(msg);
              await sendAblyMessage(msg);
            })
          );
        }
      }

      if (newMessage) {
        await sendUserMessage(newMessage);
        await sendAblyMessage(newMessage);
      }
    } catch (error) {
      if (newMessage) {
        newMessage.status = "failed";
        setCurrentMessage((prev) =>
          prev.map((msg) => (msg.id === newMessage.id ? newMessage : msg))
        );
        setLastMessages({ ...newMessage, isFetching: true });
      }

      console.error("發送訊息失敗:", error);
    }
    setReply(null);
  }, [
    setCurrentMessage,

    setReply,
    setLastMessages,
    setMessageText,
    user,
    roomId,
    messageText,
    reply,
    setMessageFiles,
    messageFiles,
  ]);
  return { handleSendMessage };
};

export const useInputBarEdit = ({ messageText, setMessageText }: EditProps) => {
  const { edit, setEdit, setCurrentMessage } = useChatStore();
  const { channel, room } = useAblyStore();
  const handleEditMessage = useCallback(async () => {
    if (!edit || !room || messageText.trim().length === 0) return;
    const newMessage: ClientMessageInterface = {
      ...edit,
      text: messageText,
      status: "pending",
      is_edit: true,
    };
    setCurrentMessage((prev) =>
      prev.map((msg) => (msg.id === edit.id ? newMessage : msg))
    );
    setMessageText("");
    setEdit(null);

    try {
      await editUserMessage(newMessage);
      if (channel) {
        await channel.publish("notify", {
          action: "edit",
          newMessage,
        });
      }
      await room.publish("message", { action: "edit", newMessage });
    } catch (error) {
      setCurrentMessage((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "failed" } : msg
        )
      );
      console.error("編輯訊息失敗:", error);
    }
  }, [
    room,
    channel,
    edit,
    messageText,
    setCurrentMessage,
    setEdit,
    setMessageText,
  ]);
  return { handleEditMessage };
};
