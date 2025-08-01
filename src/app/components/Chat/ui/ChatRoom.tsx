"use client";
import type { InboundMessage } from "ably";
import { ChevronDown } from "lucide-react";
import moment from "moment";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GroupedVirtuoso } from "react-virtuoso";
import { twMerge } from "tailwind-merge";

import ChatHeader from "@/app/components/Chat/ui/ChatHeader";
import {
  fetchRoomMessage,
  readMessage,
} from "@/app/lib/api/message/messageApi";
import { CircularProgress } from "@mui/material";

import { clearReadMessage } from "../../../lib/util";
import { useAblyRoom, useAblyStore } from "../../../store/AblyStore";
import { useChatStore } from "../../../store/ChatStore";
import TypingBar from "../../ui/TypingBar";
import Message from "./ChatMessage/index";
import InputBar from "./InputBar/index";

import type { VirtuosoHandle } from "react-virtuoso";
import type { ClientMessageInterface } from "../../../../types/type";
export default function ChatRoom({ roomId }: { roomId: string }) {
  const userId = useSession().data?.userId;

  const { currentMessage, setCurrentMessage, currentChat, typingUsers } =
    useChatStore();

  const { room } = useAblyStore();
  const [page, setPage] = useState(1);

  const [target, setTarget] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasOldMessage, setHasOldMessage] = useState(true);
  const [downBtnAppear, setDownBtnAppear] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(true);

  const findRef = useRef("");
  const scrollRef = useRef<VirtuosoHandle>(null);

  useAblyRoom(roomId);
  const typingUser = useMemo(() => {
    return typingUsers[roomId];
  }, [roomId, typingUsers]);
  const { dateCounts, flatMessages, dates, isRended } = useMemo(() => {
    const dateCounts: number[] = [];
    const flatMessages: ClientMessageInterface[] = [];
    const dates: string[] = [];
    let isRended = false;
    if (!currentMessage) return { dateCounts, flatMessages, dates };
    const groupedMessages = Object.groupBy(currentMessage, ({ created_at }) => {
      if (
        moment().format("YYYYMMDD") === moment(created_at).format("YYYYMMDD")
      ) {
        return "今天";
      }
      if (
        moment().add(-1, "days").format("YYYYMMDD") ===
        moment(created_at).format("YYYYMMDD")
      ) {
        return "昨天";
      }
      return moment(created_at).format("LL dddd");
    });

    Object.entries(groupedMessages).map(([date, messages]) => {
      if (date) {
        dates.push(date);
      }
      if (messages) {
        messages.map((message) => {
          flatMessages.push(message);
        });
        dateCounts.push(messages.length);
      }
    });
    isRended = true;
    return { dateCounts, flatMessages, dates, isRended };
  }, [currentMessage]);

  const loadMoreMessages = useCallback(async () => {
    const nextPage = page + 1;
    const start = currentMessage.length;
    const end = start + 9;

    if (isLoading || !hasOldMessage || start < 20) return;
    setIsLoading(true);
    try {
      const data = await fetchRoomMessage(roomId, start, end);

      if (data.length === 0 || data.length < 10) {
        setHasOldMessage(false);
      }
      setPage(nextPage);

      setCurrentMessage((prev) => {
        return [...data, ...prev];
      });

      if (findRef.current === "") {
        scrollRef.current?.scrollToIndex({
          index: data.length,
          align: "start",
        });
      }
      return data as ClientMessageInterface[];
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [
    page,
    roomId,
    setCurrentMessage,
    hasOldMessage,
    currentMessage,
    isLoading,
  ]);

  const scrollToMessage = useCallback(
    async (messageId: string) => {
      if (!messageId) return;
      let index = currentMessage.findIndex((v) => v.id === messageId);
      const current = currentMessage;

      findRef.current = messageId;
      if (index !== -1) {
        scrollRef.current?.scrollToIndex(index);
      } else {
        while (index === -1) {
          const newMessages = await loadMoreMessages();

          if (newMessages) {
            current.unshift(...newMessages);
            index = current.findIndex((v) => v.id === messageId);
          }
        }
        scrollRef.current?.scrollToIndex(index);
      }
      findRef.current = "";
      setTarget(messageId);
    },
    [currentMessage, loadMoreMessages]
  );

  const scrollToBottom = useCallback(() => {
    if (!scrollRef.current) return;

    scrollRef.current?.scrollToIndex(flatMessages.length - 1);
  }, [flatMessages]);

  useEffect(() => {
    if (!room) return;
    const handleMessage = (message: InboundMessage) => {
      const { newMessage, action } = message.data;

      if (newMessage.room !== currentChat?.id) return;

      if (
        currentMessage.some(
          (msg) => msg.id === newMessage.id && action !== "delete"
        )
      ) {
        setCurrentMessage((prevMessages) => {
          return prevMessages.map((msg) => {
            if (msg.id === newMessage.id) {
              return {
                ...newMessage,
                status: "send",
              };
            }
            return msg;
          });
        });
      } else if (action === "delete") {
        setCurrentMessage((prev) =>
          prev.filter((msg) => msg.id !== newMessage.id)
        );
      } else {
        readMessage(newMessage.room, userId ?? null);
        clearReadMessage(newMessage.room);
        newMessage.status = "send";
        newMessage.is_read.push(userId);
        setCurrentMessage((prev) => [...prev, newMessage]);
      }
    };
    room.subscribe("message", handleMessage);
    return () => {
      room.unsubscribe("message", handleMessage);
    };
  }, [room, setCurrentMessage, currentMessage, userId, currentChat]);

  useEffect(() => {
    if (shouldScroll) {
      setTimeout(() => {
        setShouldScroll(false);
      }, 100);
    }
  }, [shouldScroll]);

  const dateContent = useCallback(
    (index: number) => {
      const date = dates[index];

      return (
        <span
          key={date}
          className="z-10 flex items-center justify-center w-full text-xs font-medium "
        >
          <p className="p-1 px-2 rounded-3xl bg-gray-400/20 dark:text-white dark:bg-neutral-800/80 backdrop-blur-3xl">
            {date}
          </p>
        </span>
      );
    },
    [dates]
  );

  return (
    <>
      {currentChat && currentChat.id === roomId && isRended && (
        <div className="flex flex-col flex-1 overflow-y-hidden transition-all bg-center bg-no-repeat bg-cover border border-l dark:border-none sm:rounded-l-md dark:bg-neutral-800 max-h-dvh">
          <div className="box-border relative flex flex-col flex-1 py-2 overflow-hidden max-h-dvh ">
            <ChatHeader />
            <main
              className={twMerge(
                " relative flex-1 p-2 overflow-y-hidden duration-200 fade-in animate-in  dark:border-none "
              )}
            >
              {flatMessages.length > 0 && (
                <GroupedVirtuoso
                  increaseViewportBy={1500}
                  ref={scrollRef}
                  className="h-full overflow-x-hidden fade-in animate-in"
                  atBottomStateChange={(atBottom) =>
                    setDownBtnAppear(!atBottom)
                  }
                  atTopStateChange={(atTop: boolean) => {
                    if (atTop && !isLoading && !shouldScroll) {
                      loadMoreMessages();
                    }
                  }}
                  onScroll={(e) => {
                    if (
                      e.currentTarget.scrollTop === 0 &&
                      !isLoading &&
                      !shouldScroll
                    ) {
                      loadMoreMessages();
                    }
                  }}
                  followOutput={(atBottom) => {
                    const lastMessage = flatMessages[flatMessages.length - 1];
                    if (
                      lastMessage?.sender === userId &&
                      atBottom &&
                      !downBtnAppear
                    ) {
                      return true;
                    }
                    return false;
                  }}
                  initialTopMostItemIndex={
                    flatMessages.length - 1 > 0 ? flatMessages.length - 1 : 0
                  }
                  context={{ isLoading }}
                  groupContent={dateContent}
                  groupCounts={dateCounts}
                  itemContent={(index) => (
                    <Message
                      key={flatMessages[index].id}
                      index={index}
                      target={target}
                      setTarget={setTarget}
                      scrollToMessage={scrollToMessage}
                      message={flatMessages[index]}
                    />
                  )}
                  components={{
                    Header: ({ context: { isLoading } }) => {
                      return (
                        <>
                          {isLoading && (
                            <span className="flex items-center justify-center w-full">
                              <CircularProgress size={24} />
                            </span>
                          )}
                        </>
                      );
                    },
                  }}
                />
              )}

              {downBtnAppear && (
                <button
                  onClick={() => scrollToBottom()}
                  className={twMerge(
                    " absolute z-10 p-1   text-sm bottom-2  bg-gray-100  rounded-md shadow-md  text-stone-700  w-fit dark:text-white dark:bg-white/10 backdrop-blur-2xl right-2"
                  )}
                >
                  <ChevronDown />
                </button>
              )}
            </main>
            <div className="px-2 dark:text-white">
              <TypingBar roomId={roomId} typingUsers={typingUser} />
            </div>

            <InputBar />
          </div>
        </div>
      )}
    </>
  );
}
