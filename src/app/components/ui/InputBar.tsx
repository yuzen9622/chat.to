"use client";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CirclePlus, CloudUpload, LucideIcon, Mic } from "lucide-react";
import { Send } from "lucide-react";
import { useAblyStore } from "../../store/AblyStore";
import { useChatStore } from "../../store/ChatStore";
import { ClientMessageInterface, TypingInterface } from "../../../types/type";
import _ from "lodash";

import { X, Laugh, Pencil, Paperclip } from "lucide-react";
import {
  editUserMessage,
  formatSize,
  getFileIcon,
  messageType,
  sendUserMessage,
  uploadFile,
} from "../../lib/util";
import EmojiPicker from "emoji-picker-react";
import { Theme, EmojiStyle } from "emoji-picker-react";
import { twMerge } from "tailwind-merge";
import Image from "next/image";

import { useSession } from "next-auth/react";
import { useAuthStore } from "@/app/store/AuthStore";
import { Popover } from "@mui/material";
import { WavesurferRecord } from "./Audio";
import { createFileMessage, createTextMessage } from "@/app/lib/createMessage";

function SendBar({
  handleFile,
}: {
  handleFile: (accept: string) => Promise<void>;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const barOpen = Boolean(anchorEl);
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  return (
    <div>
      <button
        type="button"
        onClick={handleOpen}
        className={twMerge("p-1 h-fit transition-all", barOpen && " rotate-45")}
      >
        <CirclePlus className="text-gray-400 hover:dark:text-white" />
      </button>
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            backgroundColor: "transparent",
            boxShadow: "none",
            padding: "2px",
          },
        }}
        onClose={handleClose}
        open={barOpen}
      >
        <div className="flex flex-col p-1 bg-white rounded-md shadow-md dark:bg-neutral-800 animate-in fade-in slide-in-from-top-1">
          <button
            type="button"
            onClick={() => handleFile("*")}
            className="flex items-center w-full gap-2 p-2 text-sm font-bold rounded-md dark:text-white hover:bg-stone-900/10 hover:dark:bg-white/10"
          >
            <Paperclip className="mr-2" size={20} />
            檔案
          </button>

          {/* <button
            type="button"
            className="flex items-center justify-around w-full gap-2 p-1 text-sm font-bold text-white rounded-md hover:bg-white/10"
          >
            <Bot size={20} className="mr-2" /> AI 文字
          </button> */}
        </div>
      </Popover>
    </div>
  );
}

function FileItem({
  file,
  handleRemove,
}: {
  file: File;
  handleRemove: (lastModified: number) => void;
}) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  const type = useMemo(() => file.type.split("/")[0], [file]);
  const Icon: LucideIcon = getFileIcon(file.name);
  return (
    <div className="relative w-fit animate-in zoom-in-0 ">
      {type === "image" && (
        <Image
          className="object-cover w-full h-full rounded-2xl max-w-24 max-h-24"
          alt={file.name}
          width={100}
          height={100}
          src={url}
        />
      )}
      {type === "video" && (
        <video className=" rounded-2xl max-w-24 max-h-24" src={url}></video>
      )}
      {type !== "video" && type != "image" && (
        <div
          title={file.name}
          className={twMerge(
            "flex items-center p-2 px-3 rounded-3xl w-fit dark:text-white bg-gray-500/20 gap-x-1 dark:bg-stone-800",
            "dark:bg-blue-500 bg-blue-500 text-white"
          )}
        >
          <div className="flex flex-col items-center justify-center w-fit">
            <span className="flex flex-col items-center p-2 rounded-full bg-white/5">
              <Icon />
            </span>
            <p className="text-xs ">
              {file.name.split(".")[file.name.split(".").length - 1]}
            </p>
          </div>
          <span className="w-fit max-w-40">
            <p className="text-sm break-all text-start w-fit">{file.name}</p>
            <span className="flex items-center justify-between w-full gap-1 mt-1 text-xs text-nowrap">
              <p>大小:{formatSize(file.size)}</p>
            </span>
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={() => handleRemove(file.lastModified)}
        className="absolute p-1 text-xs rounded-full -top-1 -right-1 dark:bg-stone-900 dark:text-white bg-stone-200"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export default function InputBar() {
  const [messageText, setMessageText] = useState("");
  const [messageFiles, setMessageFiles] = useState<File[]>([]);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const { channel } = useAblyStore();
  const [isComposing, setIsComposing] = useState(false);
  const [isDropIn, setIsDropIn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

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
  const { setSystemAlert } = useAuthStore();

  const userId = useSession().data?.userId;
  const user = useSession()?.data?.user;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isTyping = useRef(false);

  const debouncedStopTyping = useCallback(
    _.debounce(async () => {
      if (!user || !channel || !isTyping.current) return;

      const typingUser: TypingInterface = {
        roomId: roomId,
        user: user,
        typing: false,
      };
      await channel.publish("typing_action", typingUser);
      isTyping.current = false;
    }, 500),
    [channel, roomId, user]
  );

  const handleChange = useCallback(
    async (e: ChangeEvent<HTMLTextAreaElement>) => {
      setMessageText(e.target.value);

      if (!isTyping.current && user && channel) {
        isTyping.current = true;
        const typingUser: TypingInterface = {
          roomId: roomId,
          user: user,
          typing: true,
        };
        await channel.publish("typing_action", typingUser);
      }

      debouncedStopTyping();
      if (!inputRef.current) return;
      inputRef.current.style.height = "auto"; // 先重設高度，避免內容刪減後高度無法縮小
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    },
    [channel, roomId, user, debouncedStopTyping]
  );

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

  // const createTextMessage = useCallback(() => {
  //   if (messageText.trim() === "") return null;
  //   const messageType = messageText.trim().startsWith("http") ? "url" : "text";
  //   const newMessage: ClientMessageInterface = {
  //     id: uuidv4(),
  //     sender: userId || "",
  //     room: roomId,
  //     is_read: [userId || ""],
  //     reply: reply!,
  //     status: "pending",
  //     text: messageText,
  //     created_at: new Date().toISOString(),
  //     type: messageType,
  //   };
  //   return newMessage;
  // }, [messageText, roomId, userId, reply]);

  // const createFileMessage = useCallback(
  //   (
  //     userId: string,
  //     roomId: string,
  //     file: File,
  //     reply?: ClientMessageInterface
  //   ) => {
  //     const metaData: MetaData = {
  //       type: file.type,
  //       url: URL.createObjectURL(file),
  //       size: file.size,
  //       public_id: "",
  //     };
  //     const type = fileType(metaData.type);
  //     const newMessage: ClientMessageInterface = {
  //       id: uuidv4(),
  //       sender: userId || "",
  //       room: roomId,
  //       is_read: [userId || ""],
  //       reply: reply!,
  //       text: file.name,
  //       status: "pending",
  //       created_at: new Date().toISOString(),
  //       meta_data: metaData,
  //       type,
  //     };
  //     return newMessage;
  //   },
  //   []
  // );

  const handleSendMessage = useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      if (!room) return;
      const pendingMessagas: ClientMessageInterface[] = [];
      const newMessage: ClientMessageInterface | null = createTextMessage(
        userId!,
        roomId,
        messageText,
        reply!
      );
      if (newMessage) {
        pendingMessagas.push(newMessage);
        setLastMessages({ ...newMessage, isFetching: true });
        setMessageText("");
        if (inputRef.current) {
          inputRef.current?.focus();
          inputRef.current.rows = 1;
          inputRef.current.style.height = "auto"; // 先重設高度，避免內容刪減後高度無法縮小
          inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
      }

      const newFilesMessages: ClientMessageInterface[] = messageFiles.map(
        (file) => createFileMessage(userId!, roomId, file, reply!)
      );

      newFilesMessages.forEach((msg) => {
        pendingMessagas.push(msg);
      });
      setMessageFiles([]);
      setCurrentMessage((prev) => [...prev, ...pendingMessagas]);
      try {
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
            uploadFileMessages.map((msg) => sendUserMessage(msg))
          );
        }
        if (newMessage) await sendUserMessage(newMessage);
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
    },
    [
      setCurrentMessage,
      room,
      setReply,
      setLastMessages,
      userId,
      roomId,
      messageText,
      reply,
      messageFiles,
    ]
  );

  const handleEditMessage = useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      if (!edit || !room || messageText.trim().length === 0) return;
      const newMessage: ClientMessageInterface = {
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
    async (accept: string) => {
      const input = document.createElement("input");
      const MAX_FILE_SIZE = 1024 * 1024 * 10;
      input.type = "file";
      input.accept = accept;
      input.multiple = true;
      input.click();
      input.onchange = async (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files) {
          const files = target.files;
          for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (file.size > MAX_FILE_SIZE) {
              setSystemAlert({
                open: true,
                serverity: "error",
                text: "請檢查檔案，檔案大小不得超過10MB",
                variant: "filled",
              });
              return;
            }
            setMessageFiles((prev) => {
              const newPrev = [...prev];
              newPrev.push(file);
              return newPrev;
            });
          }
        }
      };
    },
    [setSystemAlert]
  );

  const handleDragFile = useCallback((e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("drag in");
    setIsDropIn(false);
    if (e.dataTransfer.items) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (e.dataTransfer.items[i].kind === "file") {
          const file = e.dataTransfer.items[i].getAsFile();
          if (file) {
            setMessageFiles((prev) => [...prev, file]);
          }
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      [...e.dataTransfer.files].forEach((file) => {
        setMessageFiles((prev) => [...prev, file]);
      });
    }
  }, []);

  const removeFile = useCallback((lastModified: number) => {
    setMessageFiles((prev) => {
      return prev.filter((file) => file.lastModified !== lastModified);
    });
  }, []);

  return (
    <>
      {isRecording ? (
        <WavesurferRecord isRecord={isRecording} setIsRecord={setIsRecording} />
      ) : (
        <form
          ref={formRef}
          onDrop={handleDragFile}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDropIn(true);
          }}
          onDragLeave={() => setIsDropIn(false)}
          onSubmit={(e) => {
            if (edit) {
              handleEditMessage(e);
            } else {
              handleSendMessage(e);
            }
          }}
          className={twMerge("z-20 w-full")}
        >
          <div
            className={twMerge(
              "sticky bottom-0 px-2 py-1 m-2 border border-t dark:border-none rounded-3xl transition-[border-radius] bg-white/10 backdrop-blur-3xl",
              reply && "rounded-md",
              isDropIn && "  outline-dashed outline-blue-500"
            )}
          >
            {reply && (
              <div className="p-2 border-b dark:border-none">
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
                  <span className="truncate text-stone-800 dark:text-white/50">
                    {replyText()}
                  </span>
                  {reply.meta_data &&
                    messageType(reply.meta_data!) === "image" && (
                      <Image
                        className="object-cover w-10 h-10 rounded-md"
                        alt={reply.text}
                        width={50}
                        height={50}
                        src={reply.meta_data?.url}
                      />
                    )}
                  {reply.meta_data &&
                    messageType(reply.meta_data!) === "video" && (
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
            {messageFiles.length > 0 && (
              <div className="flex gap-2 p-2 overflow-auto">
                <div>
                  <button
                    className="flex flex-col items-center justify-center h-full p-2 text-xs text-white bg-blue-500 rounded-2xl w-fit text-nowrap"
                    onClick={() => handleFile("'*")}
                    type="button"
                  >
                    上傳檔案或照片
                    <span className="p-1 rounded-full bg-white/10">
                      <CloudUpload />
                    </span>
                  </button>
                </div>

                {messageFiles.map((file, index) => (
                  <FileItem handleRemove={removeFile} file={file} key={index} />
                ))}
              </div>
            )}

            <div className="flex items-start mt-1">
              {!edit && <SendBar handleFile={handleFile} />}

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
                onChange={handleChange}
                placeholder="輸入訊息..."
                className="w-full p-1 mx-2 text-base bg-transparent outline-none resize-none max-h-52 dark:text-white h-fit"
              />

              {emojiOpen && (
                <div className="absolute z-20 p-2 right-2 bottom-10 rounded-b-md ">
                  <EmojiPicker
                    lazyLoadEmojis={true}
                    autoFocusSearch={false}
                    theme={Theme.DARK}
                    className="z-20 "
                    emojiStyle={EmojiStyle.NATIVE}
                    onEmojiClick={(e) =>
                      setMessageText((prev) => prev + e.emoji)
                    }
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => setEmojiOpen((prev) => !prev)}
                className="p-1 mx-1 "
              >
                <Laugh className=" dark:text-white" />
              </button>

              {!edit && (
                <div className="flex animate-in zoom-in">
                  <button
                    type="button"
                    onClick={() => handleFile("image/*,video/*")}
                    className="p-1 dark:text-white "
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
                  <button
                    onClick={() => setIsRecording(true)}
                    className="p-1 dark:text-white "
                  >
                    <Mic />
                  </button>
                </div>
              )}

              {(messageText !== "" || messageFiles.length > 0) && (
                <button
                  type="submit"
                  className="px-3 py-1 transition-all bg-blue-600 rounded-3xl active:bg-blue-300 zoom-in animate-in "
                >
                  {edit ? (
                    <Pencil className="text-white hover:text-white " />
                  ) : (
                    <Send className="text-white hover:text-white rotate-12" />
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      )}
    </>
  );
}
