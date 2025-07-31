"use client";
import EmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react';
import { Laugh, Pencil, Send } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { WavesurferRecord } from '@/app/components/ui/Audio';
import { useAblyStore } from '@/app/store/AblyStore';
import { useChatStore } from '@/app/store/ChatStore';

import Edit from './Edit';
import FileContainer from './FileContainer';
import { useInputBarEdit, useInputBarSend } from './hook/useInputBar';
import { useInputBarTyping } from './hook/useInputBarTyping';
import MediaActions from './MediaActions';
import Reply from './Reply';
import { SendBar } from './SendBar';

import type { FormEvent } from "react";
export default function InputBar() {
  const [messageText, setMessageText] = useState("");
  const [messageFiles, setMessageFiles] = useState<File[]>([]);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const [isComposing, setIsComposing] = useState(false);
  const [isDropIn, setIsDropIn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const { reply, edit } = useChatStore();
  const { roomId, channel } = useAblyStore();
  const user = useSession()?.data?.user;

  const { handleChange } = useInputBarTyping({
    user: user,
    channel: channel,
    roomId,
  });
  const { handleSendMessage } = useInputBarSend({
    user: user,
    roomId,
    messageText,
    messageFiles,
    setMessageFiles,
    setMessageText,
  });
  const { handleEditMessage } = useInputBarEdit({
    messageText,
    setMessageText,
  });

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

  const onSend = useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      await handleSendMessage();
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.rows = 1;
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
      }
    },
    [handleSendMessage]
  );

  const onEdit = useCallback(
    async (e?: FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      await handleEditMessage();
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.rows = 1;
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
      }
    },
    [handleEditMessage]
  );

  const handleDragFile = useCallback((e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
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
              onEdit(e);
            } else {
              onSend(e);
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
            {reply && <Reply reply={reply} />}
            {edit && <Edit setMessageText={setMessageText} />}
            {messageFiles.length > 0 && (
              <FileContainer
                messageFiles={messageFiles}
                setMessageFiles={setMessageFiles}
              />
            )}

            <div className="flex items-start mt-1">
              {!edit && <SendBar setMessageFiles={setMessageFiles} />}

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
                        onEdit();
                      } else {
                        onSend();
                      }
                    }
                  } else {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto"; // 先重設高度，避免內容刪減後高度無法縮小
                    target.style.height = `${target.scrollHeight}px`; // 設定新高度
                  }
                }}
                onChange={(e) => handleChange(e, setMessageText)}
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
                <MediaActions
                  setIsRecording={setIsRecording}
                  setMessageFiles={setMessageFiles}
                />
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
