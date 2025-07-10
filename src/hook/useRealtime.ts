"use client";
import {
  ClientMessageInterface,
  FriendInterface,
  NoteInterface,
  RoomInterface,
  UserInterface,
} from "@/types/type";

import { useAuthStore } from "@/app/store/AuthStore";
import { useChatStore } from "@/app/store/ChatStore";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { InboundMessage, RealtimeChannel } from "ably";
import { RoomMemberInterface } from "@/types/type";
import { useCallStore } from "@/app/store/CallStore";
import { createPeer, startStream } from "@/app/lib/util";

export const useFriendListener = (channel: RealtimeChannel) => {
  const { setFriendRequest, setFriends } = useAuthStore();
  const userId = useSession().data?.userId;
  useEffect(() => {
    const handleFriendAction = (message: InboundMessage) => {
      const { action, data } = message.data;
      if (action === "request") {
        setFriendRequest((prev) => {
          const isExist = prev.some((request) => request.id === data.id);
          if (isExist) {
            return prev.map((fr) => (fr.id === data.id ? data : fr));
          }
          return [...prev, data];
        });
      } else if (action === "response") {
        setFriendRequest((prev) => {
          const newPrev = prev.map((request) => {
            if (request.id === data.id || data.status !== "accepted") {
              request.status = data.status;
            }
            return request;
          });
          return newPrev.filter((request) => request.status === "pending");
        });
        if (data.status !== "accepted") return;
        const currentFriend = data.friends.find(
          (friend: FriendInterface) => friend.user_id === userId
        );

        setFriends(currentFriend);
      } else if (action === "delete") {
        setFriends((prev) => {
          return prev.filter((f) => f.friend_id !== data);
        });
      }
    };

    channel.subscribe("friend_action", handleFriendAction);
    return () => {
      channel.unsubscribe("friend_action");
    };
  }, [channel, setFriendRequest, userId, setFriends]);
};

export const useRoomActionListener = (channel: RealtimeChannel) => {
  const { setRoom, rooms, currentChat, setCurrentChat } = useChatStore();
  const userId = useSession()?.data?.userId;
  useEffect(() => {
    if (!channel) return;
    const handleCreate = (message: InboundMessage) => {
      const { newRoom, newRoomMembers } = message.data;

      if (!userId) return;

      setRoom((prev) => {
        if (
          !prev.some((roomInfo) => roomInfo.id === newRoom.id) &&
          newRoomMembers.includes(userId)
        ) {
          return [...prev, newRoom];
        }
        return prev;
      });
    };
    const handleJoin = (message: InboundMessage) => {
      const { newRoom }: { newRoom: RoomInterface } = message.data;
      if (!userId) return;
      if (
        !newRoom ||
        !newRoom.room_members.some(
          (m: RoomMemberInterface) => m.user_id === userId
        ) ||
        newRoom.room_type === "personal"
      )
        return;

      if (newRoom.id === currentChat?.id) {
        setCurrentChat(newRoom);
      }

      setRoom((prevRooms) => {
        if (!prevRooms.some((room) => room.id === newRoom.id)) {
          return [...prevRooms, newRoom];
        }
        return prevRooms.map((room) => {
          if (room.id === newRoom.id) {
            return newRoom;
          }
          return room;
        });
      });
    };
    const handleEdit = (message: InboundMessage) => {
      const { newRoom }: { newRoom: RoomInterface } = message.data;
      console.log(newRoom);
      if (newRoom.id === currentChat?.id) {
        setCurrentChat(newRoom);
      }
      setRoom((prev) => {
        return prev.map((r) => {
          if (r.id === newRoom.id) {
            return newRoom;
          }
          return r;
        });
      });
    };
    const handleRoomAction = (message: InboundMessage) => {
      const { action } = message.data;
      if (action === "join") {
        handleJoin(message);
      } else if (action === "create") {
        handleCreate(message);
      } else if (action === "edit") {
        handleEdit(message);
      }
    };
    channel.subscribe("room_action", handleRoomAction);
    return () => {
      channel.unsubscribe("room_action");
    };
  }, [channel, rooms, setRoom, userId, currentChat, setCurrentChat]);
};

export const useNotifyListener = (channel: RealtimeChannel) => {
  const {
    rooms,
    setLastMessages,
    setNewNotify,
    currentChat,
    lastMessages,
    setNotify,
  } = useChatStore();
  const userId = useSession()?.data?.userId;
  useEffect(() => {
    if (!channel) return;
    const handleNotify = (message: InboundMessage) => {
      const {
        action,
        newMessage,
      }: { action: string; newMessage: ClientMessageInterface } = message.data;

      const messageRoom = rooms.find(
        (r) =>
          r.id === newMessage.room &&
          r.room_members.some((rm) => rm.user_id === userId)
      );
      if (
        !messageRoom ||
        messageRoom.room_members.find(
          (rm) => rm.user_id === userId && rm.is_deleted
        )
      ) {
        return;
      }

      newMessage.status = "send";
      const lastMessage = lastMessages[newMessage.room];

      if (action === "send") {
        setLastMessages({ ...newMessage, isFetching: true });
        if (
          (newMessage.room !== currentChat?.id || !currentChat) &&
          newMessage.sender !== userId
        ) {
          setNewNotify({ type: "message", data: newMessage });
        }
      } else if (action === "edit") {
        if (!lastMessage || lastMessage.id !== newMessage.id) return;
        setLastMessages({ ...newMessage, isFetching: true });
        if (newMessage.room !== currentChat?.id) {
          setNewNotify({ type: "message", data: newMessage });
        }
      } else if (action === "delete") {
        if (!lastMessage || lastMessage.id !== newMessage.id) return;
        setLastMessages({
          ...lastMessage,
          text: "已刪除訊息",
          status: "failed",
        });
      }
      if ((userId && newMessage.sender === userId) || !userId) {
        return;
      }

      setNotify((prevNotify) => {
        if (!userId) return prevNotify;

        if (action === "delete") {
          return prevNotify.filter((msg) => msg.id !== newMessage.id);
        }
        if (prevNotify.some((item) => item.id === newMessage.id)) {
          return prevNotify.map((msg) => {
            if (msg.id === newMessage.id) {
              return { ...msg, text: newMessage.text };
            }
            return msg;
          });
        }
        if (
          currentChat &&
          newMessage.room === currentChat.id &&
          action === "send" &&
          newMessage.is_read.some((read_user: string) => read_user !== userId)
        ) {
          const isRead = newMessage.is_read;
          isRead.push(userId);
          return [
            ...prevNotify,
            {
              ...newMessage,
              status: "send",
              is_read: isRead,
            },
          ];
        }
        if (action === "edit") {
          return prevNotify;
        }
        return [...prevNotify, { ...newMessage, status: "send" }];
      });
    };
    channel.subscribe("notify", handleNotify);
    return () => {
      channel.unsubscribe("notify");
    };
  }, [
    channel,
    setNotify,
    userId,
    currentChat,
    setLastMessages,
    lastMessages,
    rooms,
    setNewNotify,
  ]);
};

export const useNoteListener = (channel: RealtimeChannel) => {
  const { setFriendNote, friends } = useAuthStore();
  useEffect(() => {
    const handleNote = (message: InboundMessage) => {
      const {
        action,
        note,
      }: { action: "delete" | "update"; note: NoteInterface } = message.data;
      console.log(note);
      if (friends?.some((f) => f.friend_id === note.user_id)) {
        if (action === "delete") {
          setFriendNote((prev) => {
            return prev.filter((n) => n.id !== note.id);
          });
        } else {
          setFriendNote((prev) => {
            if (!prev.some((n) => n.id === note.id)) {
              return [note, ...prev];
            }
            return prev.map((n) => (n.id === note.id ? note : n));
          });
        }
      }
    };
    channel.subscribe("note_action", handleNote);

    return () => {
      channel.unsubscribe("note_action");
    };
  }, [channel, setFriendNote, friends]);
};

export const useSignalListener = (channel: RealtimeChannel) => {
  const { addRemoteStream, peerConnections, addPeer } = useCallStore();
  const { rooms } = useChatStore();
  const user = useSession()?.data?.user;

  useEffect(() => {
    const handleCall = async (message: InboundMessage) => {
      const { type, roomId, from, to, sdp, candidate } = message.data;

      if (!user?.id || to !== user?.id || rooms.some((r) => r.id === roomId))
        return;
      if (type === "offer") {
        const pc = createPeer(user.id, from, channel);
        await pc.setRemoteDescription({ type: "offer", sdp });
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        addPeer(from, pc);
        channel.publish("signal_action", {
          type: "answer",
          from: user?.id,
          to: from,
          sdp: answer.sdp,
        });
      }
      if (type === "answer") {
        if (!peerConnections[from]) return;
        await peerConnections[from].setRemoteDescription({
          type: "answer",
          sdp,
        });
      }
      if (type === "candidate") {
        if (!peerConnections[from]) return;
        await peerConnections[from]?.addIceCandidate(candidate);
      }
    };
    channel.subscribe("signal_action", handleCall);
    return () => {
      channel.unsubscribe("signal_action", handleCall);
    };
  }, [user, addRemoteStream, channel, peerConnections, rooms, addPeer]);
};

export const useCallListener = (channel: RealtimeChannel) => {
  const {
    setCallStatus,
    startCall,
    addPeer,
    closeCall,
    addRemoteStream,
    removePeer,
    removeRemoteStream,
    setCallRoom,
  } = useCallStore();
  const { rooms } = useChatStore();
  const user = useSession()?.data?.user;

  useEffect(() => {
    const handleCallAction = async (message: InboundMessage) => {
      const { action, room, from, to, caller, callType, setting } =
        message.data;
      const { callRoom, peerConnections, callStatus, remoteStreams } =
        useCallStore.getState();

      if (!user?.id || !rooms.some((r) => r.id === room?.id)) return;

      if (action === "offer") {
        if (caller.id === user.id) return;
        console.log(message.data);

        if (!callRoom || callRoom.id !== room.id) {
          const confirm = window.confirm(`${caller.name}的來電`) ?? true;
          if (!confirm) {
            await channel.publish("call_action", {
              action: "decline",
            });
            return;
          }
        }
        const stream = await startStream(callType);
        startCall([caller, user], room, false, callType, stream);
        setCallStatus("receiving");
        setCallRoom(room);
        await Promise.all(
          room.room_members.map(async (rm: RoomMemberInterface) => {
            await channel.publish("call_action", {
              action: "answer",
              from: user,
              to: rm.user,
              room: room,
            });
          })
        );

        setCallStatus("connect");
      }

      if (
        action === "answer" &&
        (callStatus == "waiting" ||
          callStatus === "connect" ||
          callStatus === "receiving")
      ) {
        if (
          to.id !== user?.id ||
          from.id === user.id ||
          peerConnections[from.id]
        )
          return;

        const pc = createPeer(user.id, from.id, channel);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        addPeer(from.id, pc);

        await channel.publish("signal_action", {
          type: "offer",
          from: user.id,
          to: from.id,
          sdp: offer.sdp,
        });

        setCallStatus("connect");
      }

      if (action === "leave") {
        removePeer(from);
        removeRemoteStream(from);
      }

      if (action === "decline") {
        closeCall();
      }

      if (action === "setting") {
        const settingStream = remoteStreams.find((rs) => rs.userId === from);

        if (!settingStream) return;

        if (setting.type === "voice") {
          settingStream.stream.getAudioTracks()[0].enabled = setting.isOn;
        } else {
          settingStream.stream.getVideoTracks()[0].enabled = setting.isOn;
        }
        addRemoteStream(from, settingStream.stream);
      }
    };
    channel.subscribe("call_action", handleCallAction);
    return () => {
      channel.unsubscribe("call_action", handleCallAction);
    };
  }, [
    channel,
    user,
    rooms,
    removeRemoteStream,
    removePeer,
    setCallRoom,
    setCallStatus,
    startCall,
    addRemoteStream,
    addPeer,
    closeCall,
  ]);
};

export const useUserListener = (channel: RealtimeChannel) => {
  const { setCurrentUsers, currentUser } = useChatStore();
  useEffect(() => {
    if (!channel) return;
    const handleUserChange = (message: InboundMessage) => {
      const { user }: { user: UserInterface } = message.data;
      if (!currentUser.find((cu) => cu.id === user.id)) return;
      setCurrentUsers(user);
    };
    channel.subscribe("user_action", handleUserChange);
    return () => {
      channel?.unsubscribe("user_action");
    };
  }, [channel, setCurrentUsers, currentUser]);
};

export const useTypingListener = (channel: RealtimeChannel) => {
  const { setTypingUsers } = useChatStore();
  useEffect(() => {
    const handleTyping = async (message: InboundMessage) => {
      const { data } = message;
      //console.log(data);
      setTypingUsers(data);
    };
    channel.subscribe("typing_action", handleTyping);
    return () => {
      channel.unsubscribe("typing_action");
    };
  }, [channel, setTypingUsers]);
};
