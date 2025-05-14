"use client";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import Message from "./ui/Message";

import ChatHeader from "./CharHeader";
import InputBar from "./ui/InputBar";
import { useAblyRoom, useAblyStore } from "../store/AblyStore";
import { useChatStore } from "../store/ChatStore";
import { InboundMessage } from "ably";
import { clearReadMessage, readMessage } from "../lib/util";
import moment from "moment";
import { ChevronDown } from "lucide-react";
import { supabase } from "../lib/supabasedb";
import { useSession } from "next-auth/react";
import { twMerge } from "tailwind-merge";
import { VirtuosoHandle, GroupedVirtuoso } from "react-virtuoso";
import { useRoomUser } from "@/hook/useRoomUser";
import { CircularProgress } from "@mui/material";
import { ClientMessageInterface } from "../../types/type";

export default function ChatRoom({ roomId }: { roomId: string }) {
  const userId = useSession().data?.userId;

  const { currentMessage, setCurrentMessage, currentChat, reply } =
    useChatStore();

  const { room } = useAblyStore();
  const [page, setPage] = useState(1);

  const [target, setTarget] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<VirtuosoHandle>(null);
  const userMap = useRoomUser();
  const [hasOldMessage, setHasOldMessage] = useState(true);
  const [downBtnAppear, setDownBtnAppear] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(true);
  useAblyRoom(roomId);

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

    const abortSignal = new AbortController();
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("room", roomId)
      .order("created_at", { ascending: false })
      .range(start, end)
      .abortSignal(abortSignal.signal);

    if (error) return;
    if (data) {
      if (data.length === 0) {
        setHasOldMessage(false);
      }
      setPage(nextPage);
      data.reverse();
      setCurrentMessage((prev) => {
        return [...data, ...prev];
      });
      scrollRef.current?.scrollToIndex({
        index: data.length,
        align: "start",
      });
    }
    setIsLoading(false);
    return data as ClientMessageInterface[];
  }, [
    page,
    roomId,
    setCurrentMessage,
    hasOldMessage,
    currentMessage,
    isLoading,
  ]);

  const scrollToMessage = async (messageId: string) => {
    if (!messageId) return;
    let index = currentMessage.findIndex((v) => v.id === messageId);
    const current = currentMessage;
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
    setTarget(messageId);
  };

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
        readMessage(newMessage.room, userId!);
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
    if (userMap && shouldScroll) {
      setTimeout(() => {
        setShouldScroll(false);
      }, 100);
    }
  }, [userMap, shouldScroll]);

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
      {currentChat && currentChat.id === roomId && (
        <div className="flex flex-col flex-1 overflow-y-hidden transition-all bg-center bg-no-repeat bg-cover max-h-dvh">
          <div className="box-border relative flex flex-col flex-1 overflow-hidden max-h-dvh ">
            <ChatHeader />

            <main
              className={twMerge(
                " relative flex-1 p-2 overflow-y-hidden duration-200 fade-in animate-in border-y dark:border-none "
              )}
            >
              {flatMessages.length > 0 && userMap && dates ? (
                <GroupedVirtuoso
                  ref={scrollRef}
                  increaseViewportBy={{ top: 1000, bottom: 500 }}
                  className="h-full overflow-x-hidden fade-in animate-in"
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
                  atBottomStateChange={(atBottom) =>
                    setDownBtnAppear(!atBottom)
                  }
                  followOutput={(atBottom) => {
                    const lastMessage = flatMessages[flatMessages.length - 1];
                    if (
                      lastMessage.sender === userId &&
                      atBottom &&
                      !downBtnAppear
                    ) {
                      return true;
                    }
                    return false;
                  }}
                  alignToBottom
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
                      roomUsers={userMap}
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
              ) : (
                !isRended && (
                  <span className="flex items-center justify-center w-full">
                    <CircularProgress size={24} />
                  </span>
                )
              )}

              {downBtnAppear && (
                <button
                  onClick={() => scrollToBottom()}
                  className={twMerge(
                    "fixed z-10 p-1 my-1 text-sm bottom-20  bg-gray-100  rounded-md shadow-md  text-stone-700  w-fit dark:text-white dark:bg-white/10 backdrop-blur-2xl",
                    reply && "sticky bottom-0"
                  )}
                >
                  <ChevronDown />
                </button>
              )}
            </main>

            <InputBar />
          </div>
        </div>
      )}
    </>
  );
}
