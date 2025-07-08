"use client";
import { create } from "zustand";
import {
  ClientMessageInterface,
  FriendInterface,
  FriendRequestInterface,
  NoteInterface,
  RoomInterface,
  SystemAlertInterface,
} from "../../types/type";

import { fetchFriendNote } from "../lib/api/note/noteApi";
import {
  fetchFriendRequests,
  fetchUserFriends,
} from "../lib/api/friend/friendApi";
import { fetchUserRooms } from "../lib/api/room/roomApi";
import { fetchUsersNotify } from "../lib/api/notify/notifytApi";
import { isMobile } from "react-device-detect";
import { useChatStore } from "./ChatStore";

interface AuthStore {
  friends: FriendInterface[] | null;
  friendRequests: FriendRequestInterface[] | null;
  friendNote: NoteInterface[] | null;
  userNote: NoteInterface | null;
  isInitialized: boolean;
  isMobile: boolean;
  setIsMobile: (bool: boolean) => void;
  systemAlert: SystemAlertInterface;
  setSystemAlert: (alertInfo: SystemAlertInterface) => void;
  setFriends: (
    friend: FriendInterface | ((prev: FriendInterface[]) => FriendInterface[])
  ) => void;
  setFriendRequest: (
    requestOrFn:
      | FriendRequestInterface
      | ((prev: FriendRequestInterface[]) => FriendRequestInterface[])
  ) => void;
  initialize: (user: string) => Promise<void>;
  setFriendNote: (
    note: NoteInterface | ((prev: NoteInterface[]) => NoteInterface[])
  ) => void;
  setUserNote: (note: NoteInterface) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isInitialized: false,
  friends: null,
  friendRequests: null,
  userNote: null,
  isMobile: false,
  setIsMobile: (bool: boolean) => {
    set((state) => {
      return { ...state, isMobile: bool };
    });
  },
  systemAlert: {
    open: false,
    severity: "success",
    variant: "standard",
    text: "",
  },
  setUserNote: (note) => {
    set((state) => {
      return { ...state, userNote: note };
    });
  },
  setSystemAlert: (alertInfo: SystemAlertInterface) => {
    set({ systemAlert: alertInfo });
  },
  friendNote: null,
  initialize: async (user: string) => {
    try {
      const { setLastMessages, setRoom, setNotify } = useChatStore.getState();
      const friendsData: FriendInterface[] = await fetchUserFriends(user);
      const friendRequestData: FriendRequestInterface[] =
        await fetchFriendRequests(user);
      const userIds = friendsData.map((f) => f.friend_id);
      const friendNote: NoteInterface[] = await fetchFriendNote(userIds);
      const data = await fetchFriendNote([user]);
      const {
        rooms: roomsData,
        lastMessages,
      }: { rooms: RoomInterface[]; lastMessages: ClientMessageInterface[] } =
        await fetchUserRooms();
      const inRooms = roomsData.filter((r) =>
        r.room_members.some((m) => m.user_id === user)
      );

      if (roomsData.length > 0) {
        setRoom(() => inRooms);
      }
      lastMessages.forEach((lm) => {
        setLastMessages({ ...lm, isFetching: true });
      });
      const notifiesData = await fetchUsersNotify(user, inRooms);
      setNotify(() => notifiesData);
      set({ userNote: data[0] });
      set({ isMobile: isMobile });
      set({ friends: friendsData || [] });
      set({ friendRequests: friendRequestData || [] });
      set({ friendNote: friendNote });
      set({ isInitialized: true });
    } catch (error) {
      console.error("Error initializing:", error);
    }
  },
  setFriendRequest: (requestOrFn) => {
    set((state) => {
      if (!state.friendRequests) return state;
      if (typeof requestOrFn === "function") {
        const newFriendRequest = requestOrFn(state.friendRequests);
        const filterFriendRequest = newFriendRequest.filter(
          (fr) => fr.status === "pending"
        );
        return {
          ...state,
          friendRequests: filterFriendRequest,
        };
      }

      if (state.friendRequests.some((m) => m.id === requestOrFn.id)) {
        return state;
      }
      return {
        ...state,
        rooms: [...state.friendRequests, requestOrFn],
      };
    });
  },
  setFriends: (friendOrFn) => {
    set((state) => {
      if (!state.friends) return state;
      if (typeof friendOrFn === "function") {
        const newFriends = friendOrFn(state.friends);
        return { ...state, friends: newFriends };
      }
      if (state.friends.some((fid) => fid.id === friendOrFn.id)) {
        return state;
      }

      return { ...state, friends: [...state.friends, friendOrFn] };
    });
  },
  setFriendNote: (noteOrFn) => {
    set((state) => {
      if (!state.friendNote) return state;
      if (typeof noteOrFn === "function") {
        const newNotes = noteOrFn(state.friendNote);
        return { ...state, friendNote: newNotes };
      }
      return { ...state, friendNote: [...state.friendNote, noteOrFn] };
    });
  },
}));
