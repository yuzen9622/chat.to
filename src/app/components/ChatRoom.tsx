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

import { useRoomUser } from "@/hook/useRoomUser";
import { CircularProgress } from "@mui/material";

export default function ChatRoom({ roomId }: { roomId: string }) {
  const { currentMessage, setCurrentMessage, currentChat, reply } =
    useChatStore();
  const { room } = useAblyStore();
  const [page, setPage] = useState(1);
  const messagesRef = useRef<Record<string, HTMLDivElement | null>>({});
  const [target, setTarget] = useState<string>("");
  useAblyRoom(roomId);
  const userId = useSession().data?.userId;
  const messageEnd = useRef<HTMLDivElement | null>(null);
  const containerEnd = useRef<HTMLDivElement | null>(null);
  const [shouldScroll, setShouldScroll] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const userMap = useRoomUser();
  const [hasOldMessage, setHasOldMessage] = useState(true);
  const [downBtnAppear, setDownBtnAppear] = useState(false);

  const groupedMessages = useMemo(() => {
    return Object.groupBy(currentMessage, ({ created_at }) => {
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
  }, [currentMessage]);

  const scrollToMessage = useCallback(async (messageId: string) => {
    if (!messageId) return;
    console.log(messageId);
    setTarget(messageId);
  }, []);

  const loadMoreMessages = useCallback(async () => {
    const nextPage = page + 1;
    const start = currentMessage.length;
    const end = start + 9;
    mainRef.current?.scrollTo({ top: 1, behavior: "smooth" });
    if (isLoading || !hasOldMessage) return;
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
        const concatMsg = data.concat(prev);
        return concatMsg;
      });
    }
    setIsLoading(false);
  }, [
    page,
    roomId,
    setCurrentMessage,
    hasOldMessage,
    currentMessage,
    isLoading,
  ]);

  // const isNearBottom = useCallback(() => {
  //   const container = mainRef.current;
  //   const end = messageEnd.current;
  //   if (!container || !end) return false;
  //   const observer = new IntersectionObserver(
  //     (el) => {
  //       el.forEach((e) => {
  //         console.log(e);
  //         if (e.isIntersecting) {
  //           return true;
  //         }
  //         return false;
  //       });
  //     },
  //     { threshold: 0 }
  //   );
  //   observer.observe(end);

  //   const threshold = 50;
  //   return (
  //     container.scrollHeight - container.scrollTop - container.clientHeight <
  //     threshold
  //   );
  // }, []);

  const scrollToBottom = useCallback((behavior?: ScrollBehavior) => {
    if (!containerEnd.current) return;

    setTimeout(() => {
      containerEnd.current?.scrollIntoView({ behavior: behavior });
    }, 100);
  }, []);

  useEffect(() => {
    if (target === "") return;
    const targetRef = messagesRef.current[target];
    console.log(messagesRef);
    if (!targetRef) {
      loadMoreMessages();
      return;
    }
    const targetObserver = new IntersectionObserver(
      (el) => {
        el.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("animate-wiggle");
            setTarget("");
          }
          setTimeout(() => {
            e.target.classList.remove("animate-wiggle");
          }, 500);
        });
      },
      { threshold: 1 }
    );
    if (targetRef) {
      targetRef.scrollIntoView({ behavior: "smooth", block: "start" });
      targetObserver.observe(targetRef);
    }
    return () => {
      targetObserver.disconnect();
    };
  }, [target, messagesRef, loadMoreMessages]);

  useEffect(() => {
    const end = messageEnd.current;

    if (!end || target !== "") return;
    const observer = new IntersectionObserver(
      (el) => {
        el.forEach((e) => {
          if (e.isIntersecting) {
            scrollToBottom("smooth");
          }
          setDownBtnAppear(!e.isIntersecting);
        });
      },
      { root: mainRef.current, threshold: 0 }
    );
    observer.observe(end);
    return () => {
      observer.disconnect();
    };
  }, [scrollToBottom, currentMessage, reply, target]);

  useEffect(() => {
    if (containerEnd.current && shouldScroll && currentMessage.length > 0) {
      scrollToBottom();
      setShouldScroll(false);
    }
  }, [scrollToBottom, currentMessage, shouldScroll, userMap]);

  useEffect(() => {
    if (!room) return;

    const handleMessage = (message: InboundMessage) => {
      const { newMessage, action } = message.data;
      if (newMessage.room !== currentChat?.id) return;
      if (newMessage.sender === userId) {
        //scrollToBottom();
      }
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
  }, [
    room,
    setCurrentMessage,
    currentMessage,
    userId,
    currentChat,
    scrollToBottom,
  ]);

  return (
    <>
      {currentChat && currentChat.id === roomId && (
        <div className="flex flex-col flex-1 overflow-y-hidden transition-all bg-center bg-no-repeat bg-cover max-h-dvh">
          <div className="box-border relative flex flex-col flex-1 overflow-hidden max-h-dvh ">
            <ChatHeader />

            <main
              onScroll={() => {
                if (!mainRef.current) return;
                if (mainRef.current.scrollTop === 0) {
                  loadMoreMessages();
                }
              }}
              ref={mainRef}
              className={twMerge(
                " relative flex-1 p-2 overflow-y-auto duration-200 fade-in animate-in border-y dark:border-none "
              )}
            >
              {isLoading && (
                <span className="flex items-center justify-center w-full">
                  <CircularProgress size={24} />
                </span>
              )}
              {Object.entries(groupedMessages).map(([date, messages]) => (
                <React.Fragment key={date}>
                  {userMap && (
                    <div key={date} className="flex flex-col items-center ">
                      <span
                        key={date}
                        className="sticky top-0 z-10 p-1 px-2 my-1 text-sm font-medium rounded-md bg-gray-400/20 dark:text-white w-fit dark:bg-stone-700/50 backdrop-blur-3xl"
                      >
                        {date}
                      </span>

                      {messages &&
                        messages.map((msg) => (
                          <Message
                            key={msg.id}
                            scrollFn={scrollToMessage}
                            user={userMap[msg.sender]}
                            ref={(ref) => {
                              if (msg.id) {
                                messagesRef.current[msg.id] = ref;
                              }
                              if (
                                currentMessage[currentMessage.length - 1].id ===
                                msg.id
                              ) {
                                messageEnd.current = ref;
                              }
                            }}
                            message={msg}
                          />
                        ))}
                    </div>
                  )}
                </React.Fragment>
              ))}
              {downBtnAppear && (
                <button
                  onClick={() => scrollToBottom()}
                  className={twMerge(
                    "fixed z-10 p-1 my-1 text-sm bottom-20 bg-gray-100  rounded-md shadow-md  text-stone-700  w-fit dark:text-white dark:bg-white/10 backdrop-blur-2xl",
                    reply && "sticky bottom-0"
                  )}
                >
                  <ChevronDown />
                </button>
              )}
              {userMap && <div ref={containerEnd}></div>}
            </main>

            <InputBar containerEnd={containerEnd} />
          </div>
        </div>
      )}
    </>
  );
}
