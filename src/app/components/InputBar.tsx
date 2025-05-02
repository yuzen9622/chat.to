"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CirclePlus } from "lucide-react";
import { Send } from "lucide-react";
import { useAblyStore } from "../store/AblyStore";
import { useChatStore } from "../store/ChatStore";
import { MessageInterface, MessageType } from "../lib/type";

import { X, Laugh, Pencil, Paperclip, Bot, Mic, CircleX } from "lucide-react";
import {
  editUserMessage,
  messageType,
  sendUserMessage,
  uploadFile,
} from "../lib/util";
import EmojiPicker from "emoji-picker-react";
import { Theme, EmojiStyle } from "emoji-picker-react";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { WavesurferRecord } from "@/app/components/Audio";
import { useSession } from "next-auth/react";
function SendBar({
  handleFile,
}: {
  handleFile: (accept: string, fromType: MessageType) => Promise<void>;
}) {
  const [barOpen, setBarOpen] = useState(false);
  const handleBlur = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setBarOpen(false);
    }
  };

  return (
    <div onBlur={handleBlur}>
      <button
        type="button"
        className={twMerge("p-1 h-fit transition-all", barOpen && " rotate-45")}
        onClick={() => setBarOpen((prev) => !prev)}
      >
        <CirclePlus className="text-gray-400 hover:dark:text-white" />
      </button>
      {barOpen && (
        <div className="absolute left-0 flex flex-col p-1 rounded-md bottom-12 bg-neutral-800 animate-in fade-in slide-in-from-top-1">
          <button
            type="button"
            onClick={() => handleFile("*", "file")}
            className="flex items-center w-full gap-2 p-1 text-sm font-bold text-white rounded-md hover:bg-white/10"
          >
            <Paperclip className="mr-2" size={20} />
            檔案
          </button>

          <button
            type="button"
            className="flex items-center justify-around w-full gap-2 p-1 text-sm font-bold text-white rounded-md hover:bg-white/10"
          >
            <Bot size={20} className="mr-2" /> AI 文字
          </button>
        </div>
      )}
    </div>
  );
}

export default function InputBar({
  containerEnd,
}: {
  containerEnd: React.RefObject<HTMLDivElement | null>;
}) {
  const [messageText, setMessageText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const { channel } = useAblyStore();
  const [isComposing, setIsComposing] = useState(false);
  const [isRecord, setIsRecord] = useState(false);

  const [audioUrl, setAudioUrl] = useState("");
  const {
    setCurrentMessage,
    reply,
    setReply,
    currentUser,
    edit,
    setEdit,
    setLastMessages,
  } = useChatStore();
  const { roomId, room } = useAblyStore();

  const userId = useSession().data?.userId;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };
  const handleCompositionStart = () => {
    setIsComposing(true);
  };
  useEffect(() => {
    if (reply || edit) {
      inputRef.current?.focus();
    }
    if (edit) {
      setMessageText(edit.text);
    }
  }, [reply, edit]);

  const replyText = useCallback(() => {
    if (!reply) return "";
    if (messageType(reply.meta_data!) === "audio") return "語音";
    if (messageType(reply.meta_data!) === "image") return "圖片";
    if (messageType(reply.meta_data!) === "file") return "檔案";
    if (messageType(reply.meta_data!) === "video") return "影片";
    return reply.text;
  }, [reply]);

  const handleSendMessage = useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      if (!room) return;
      if (messageText.trim() === "") return;
      const messageType = messageText.trim().startsWith("http")
        ? "url"
        : "text";
      const newMessage: MessageInterface = {
        id: uuidv4(),
        sender: userId || "",
        room: roomId,
        is_read: [userId || ""],
        reply: reply?.id,
        status: "pending",
        text: messageText,
        created_at: new Date().toISOString(),
        type: messageType,
      };

      setCurrentMessage((prev) => [...prev, newMessage]);

      setLastMessages(newMessage);
      setMessageText("");
      setReply(null);
      if (inputRef.current) {
        inputRef.current?.focus();
        inputRef.current.rows = 1;
        inputRef.current.style.height = "auto"; // 先重設高度，避免內容刪減後高度無法縮小
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
      }

      try {
        const sendMessage = (await sendUserMessage(
          newMessage
        )) as MessageInterface;
        if (channel) {
          channel.publish("notify", {
            action: "send",
            newMessage: sendMessage,
          });
        }
        room.publish("message", { action: "send", newMessage: sendMessage });
      } catch (error) {
        newMessage.status = "failed";
        setCurrentMessage((prev) =>
          prev.map((msg) => (msg.id === newMessage.id ? newMessage : msg))
        );
        setLastMessages(newMessage);
        console.error("發送訊息失敗:", error);
      }
      containerEnd.current?.scrollIntoView({ behavior: "smooth" });
    },
    [
      channel,
      messageText,
      setCurrentMessage,
      containerEnd,
      userId,
      roomId,
      reply,
      room,
      setReply,
      setLastMessages,
    ]
  );

  const handleEditMessage = useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      if (!edit || !room) return;
      const newMessage: MessageInterface = {
        ...edit,
        text: messageText,
        status: "pending",
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
    },
    [room, channel, edit, messageText, setCurrentMessage, setEdit]
  );

  const handleFile = useCallback(
    async (accept: string, fromType: MessageType) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = accept;
      input.click();
      input.onchange = async (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files) {
          const file = target?.files[0];

          const newMessage: MessageInterface = {
            id: uuidv4(),
            sender: userId || "",
            room: roomId,
            is_read: [userId || ""],
            reply: reply?.id,
            status: "pending",
            text: file.name,
            type: fromType,
            meta_data: {
              type: file.type,
              size: file.size,
              url: URL.createObjectURL(file),
              public_id: "",
            },
            created_at: new Date().toISOString(),
          };
          try {
            setCurrentMessage((prev) => [...prev, newMessage]);
            containerEnd.current?.scrollIntoView({ behavior: "smooth" });
            setLastMessages(newMessage);
            setReply(null);
            const res = await uploadFile(file);
            if (newMessage.meta_data) {
              newMessage.meta_data = {
                ...newMessage.meta_data,
                url: res.url,
                public_id: res.public_id,
              };
            }

            if (!room) return;
            if (!res) return;

            if (inputRef.current) {
              inputRef.current?.focus();
              inputRef.current.rows = 1;
            }

            await sendUserMessage(newMessage);
            if (channel) {
              await channel.publish("notify", {
                action: "send",
                newMessage,
              });
            }
            await room.publish("message", { action: "send", newMessage });
          } catch (error) {
            setCurrentMessage((prev) =>
              prev.map((msg) =>
                msg.id === newMessage.id ? { ...msg, status: "failed" } : msg
              )
            );
            console.error("發送訊息失敗:", error);
          }
        }
      };
    },
    [
      room,
      channel,
      reply,
      roomId,
      setCurrentMessage,
      containerEnd,
      setReply,
      userId,
      setLastMessages,
    ]
  );

  const handleAudioMessage = useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      console.log(audioUrl);
      if (audioUrl === "" || !userId) return;
      console.log(audioUrl);
      const res = await fetch(audioUrl);
      const blob = await res.blob();
      const file = new File([blob], `audio-${Date.now()}.mp3`, {
        type: "audio/mp3",
      });
      const newMessage: MessageInterface = {
        id: uuidv4(),
        text: file.name,
        room: roomId,
        is_read: [userId],
        reply: reply?.id,
        status: "pending",
        sender: userId,
        type: "media",
        meta_data: {
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          public_id: "",
        },
        created_at: new Date().toISOString(),
      };
      try {
        setCurrentMessage((prev) => [...prev, newMessage]);
        const fileRes = await uploadFile(file);
        if (newMessage.meta_data) {
          newMessage.meta_data = {
            ...newMessage.meta_data,
            url: fileRes.url,
            public_id: fileRes.public_id,
          };
        }

        if (!room) return;
        if (!res) return;

        setReply(null);
        if (inputRef.current) {
          inputRef.current?.focus();
          inputRef.current.rows = 1;
        }

        await sendUserMessage(newMessage);
        if (channel) {
          await channel.publish("notify", {
            action: "send",
            newMessage,
          });
        }
        await room.publish("message", { action: "send", newMessage });
      } catch (error) {
        setCurrentMessage((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: "failed" } : msg
          )
        );
        console.log(error);
      } finally {
        setAudioUrl("");
      }
    },
    [
      audioUrl,
      userId,
      reply,
      roomId,
      channel,
      room,
      setCurrentMessage,
      setReply,
    ]
  );

  useEffect(() => {
    if (audioUrl === "") return;
    handleAudioMessage();
  }, [handleAudioMessage, audioUrl]);

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        if (edit) {
          handleEditMessage(e);
        } else if (audioUrl) {
          handleAudioMessage(e);
        } else {
          handleSendMessage(e);
        }
      }}
      className="w-full"
    >
      <div className="sticky bottom-0 px-2 py-1 m-2 rounded bg-white/10 backdrop-blur-3xl">
        {reply && (
          <div className="border-l-[3px] px-2  border-blue-600 bg-white/5 rounded-e-sm shadow-md  ">
            <div className="flex justify-between font-semibold dark:text-white ">
              <p className="text-lg text-blue-500">
                {currentUser.find((user) => user.id === reply.sender)?.name}
              </p>
              <button
                type="button"
                className="p-1 rounded-full hover:bg-gray-100 hover:dark:bg-white/10"
                onClick={() => setReply(null)}
              >
                <X />
              </button>
            </div>
            <div className="flex items-center justify-between w-full py-1">
              <span className=" text-stone-800 dark:text-white/50">
                {replyText()}
              </span>
              {reply.meta_data && messageType(reply.meta_data!) === "image" && (
                <Image
                  className="object-cover w-10 h-10 rounded-md"
                  alt={reply.text}
                  width={50}
                  height={50}
                  src={reply.meta_data?.url}
                />
              )}
              {reply.meta_data && messageType(reply.meta_data!) === "video" && (
                <video
                  muted
                  className="w-10 h-10 rounded-md"
                  src={reply.meta_data.url}
                ></video>
              )}
            </div>
          </div>
        )}
        {edit && (
          <div className="px-2 rounded-e-sm ">
            <div className="flex justify-between font-semibold dark:text-white">
              <p className="text-sm text-white/80">編輯訊息</p>
              <button
                type="button"
                className="p-1 rounded-full hover:bg-white/10"
                onClick={() => {
                  setEdit(null);
                  setMessageText("");
                }}
              >
                <X />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-start mt-1">
          {!edit && !isRecord && <SendBar handleFile={handleFile} />}
          {!isRecord && (
            <textarea
              value={messageText}
              ref={inputRef}
              autoFocus
              rows={1}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              onBlur={() => setEmojiOpen(false)}
              onKeyDown={(e) => {
                if (isComposing) return;
                if (e.code === "Enter") {
                  if (!window.getSelection()?.toString()) {
                    e.preventDefault(); // 防止換行
                    if (edit) {
                      handleEditMessage();
                    } else {
                      handleSendMessage();
                    }
                  }
                } else {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto"; // 先重設高度，避免內容刪減後高度無法縮小
                  target.style.height = `${target.scrollHeight}px`; // 設定新高度
                }
              }}
              onChange={(e) => {
                setMessageText(e.target.value);
                if (!inputRef.current) return;
                inputRef.current.style.height = "auto"; // 先重設高度，避免內容刪減後高度無法縮小
                inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
              }}
              placeholder="Type some message..."
              className="w-full p-1 mx-2 text-base bg-transparent outline-none resize-none dark:text-white h-fit"
            />
          )}

          {emojiOpen && (
            <div className="absolute z-20 p-2 right-2 bottom-10 rounded-b-md ">
              <EmojiPicker
                lazyLoadEmojis={true}
                autoFocusSearch={false}
                theme={Theme.DARK}
                emojiStyle={EmojiStyle.NATIVE}
                onEmojiClick={(e) => setMessageText((prev) => prev + e.emoji)}
              />
            </div>
          )}
          <>
            <button
              onClick={() => {
                setAudioUrl("");
                setIsRecord((prev) => !prev);
              }}
              className={twMerge(
                "p-1 h-full my-auto animate-in hover:spin-in-3",
                isRecord && "rounded-full  animate-in slide-in-from-right-40"
              )}
              type="button"
            >
              {isRecord ? (
                <CircleX className="text-red-500" />
              ) : (
                <Mic className="text-gray-500 hover:dark:text-white" />
              )}
            </button>
            {isRecord && (
              <WavesurferRecord
                formRef={formRef}
                setAudioUrl={setAudioUrl}
                isRecord={isRecord}
                setIsRecord={setIsRecord}
              />
            )}
          </>

          {!edit && messageText === "" && !isRecord && (
            <div className="flex animate-in zoom-in">
              <button
                type="button"
                onClick={() => handleFile("image/*,video/*", "media")}
                className="p-1 text-gray-500 hover:dark:text-white hover:scale-110"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-image"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </button>
            </div>
          )}
          {!isRecord && (
            <button
              type="button"
              onClick={() => setEmojiOpen((prev) => !prev)}
              className="p-1 mx-1 "
            >
              <Laugh className="text-gray-500 hover:dark:text-white hover:scale-110" />
            </button>
          )}

          {!isRecord && messageText !== "" && (
            <button
              type="submit"
              className="p-1 transition-all bg-blue-600 rounded-lg active:bg-blue-300 zoom-in animate-in "
            >
              {edit ? (
                <Pencil className="text-white hover:text-white" />
              ) : (
                <Send className="text-white hover:text-white " />
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
