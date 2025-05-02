"use client";
import { create } from "zustand";
import {
  MessageInterface,
  NotifyInterface,
  RoomInterface,
  UserInterface,
} from "../lib/type";

interface ChatStore {
  currentChat: RoomInterface | null;
  rooms: RoomInterface[];
  currentUser: UserInterface[];
  currentMessage: MessageInterface[];
  loading: boolean;
  newMessage: MessageInterface | null;
  reply: MessageInterface | null;
  newNotify: NotifyInterface | null;
  typingUsers: Record<string, Array<{ userId: string; typing: boolean }>>;
  edit: MessageInterface | null;
  chatInfoOpen: boolean;
  setChatInfoOpen: (isOpen: boolean) => void;
  notify: MessageInterface[];
  lastMessages: Record<string, MessageInterface | null>;
  onboardingUsers: Set<string>;
  sidebarOpen: boolean;
  setLoading: (load: boolean) => void;
  setRoom: (
    roomOrFn: RoomInterface | ((prev: RoomInterface[]) => RoomInterface[])
  ) => void;
  setCurrentChat: (currentChat: RoomInterface | null) => void;
  setCurrentMessage: (
    msgOrFn:
      | MessageInterface
      | ((prev: MessageInterface[]) => MessageInterface[])
  ) => void;
  setReply: (msg: MessageInterface | null) => void;
  setEdit: (msg: MessageInterface | null) => void;
  setNotify: (
    notifyOrFn:
      | MessageInterface
      | ((prev: MessageInterface[]) => MessageInterface[])
  ) => void;
  setCurrentUsers: (newUser: UserInterface) => void;
  setLastMessages: (
    newLastMsg:
      | MessageInterface
      | ((
          prev: Record<string, MessageInterface | null>
        ) => Record<string, MessageInterface | null>)
  ) => void;
  addOnboardingUser: (userId: string) => void;
  removeOnboardingUser: (userId: string) => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setTypingUsers: (
    typingUsers: Record<string, Array<{ userId: string; typing: boolean }>>
  ) => void;
  setNewNotify: (
    notify:
      | NotifyInterface
      | null
      | ((prev: NotifyInterface) => NotifyInterface)
  ) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  currentUser: [],
  currentChat: null,
  newNotify: null,
  rooms: [],
  currentMessage: [],
  newMessage: null,
  loading: false,
  lastMessages: {},
  reply: null,
  typingUsers: {},
  sidebarOpen: true,
  edit: null,
  notify: [],

  onboardingUsers: new Set(),
  chatInfoOpen: false,
  setChatInfoOpen: (isOpen: boolean) => {
    set((state) => {
      return {
        ...state,
        chatInfoOpen: isOpen,
      };
    });
  },
  setReply(msg) {
    set({ reply: msg });
  },
  setEdit: (msg) => {
    set({ edit: msg });
  },
  setRoom: (roomOrFn) => {
    set((state) => {
      if (typeof roomOrFn === "function") {
        const newRooms = roomOrFn(state.rooms);
        return {
          ...state,
          rooms: newRooms,
        };
      }

      if (state.rooms.some((m) => m.id === roomOrFn.id)) {
        return state;
      }
      return {
        ...state,
        rooms: [...state.rooms, roomOrFn],
      };
    });
  },
  setLoading: (load: boolean) => {
    set({ loading: load });
  },
  setCurrentChat: async (currentChat) => {
    set((state) => {
      if (state.currentChat?.id !== currentChat?.id) {
        return {
          ...state,
          currentChat,
          currentMessage: [],
          loading: true,
        };
      }

      return {
        ...state,
        currentChat,
      };
    });
    set({ loading: true });
    set({ reply: null });
    set({ edit: null });
    set({ currentChat: currentChat });
    if (!currentChat) return;
    set({ loading: false });
  },
  addOnboardingUser: (userId) =>
    set((state) => {
      const newSet = new Set(state.onboardingUsers);
      newSet.add(userId);
      return { onboardingUsers: newSet };
    }),
  removeOnboardingUser: (userId) =>
    set((state) => {
      const newSet = new Set(state.onboardingUsers);
      newSet.delete(userId);
      return { onboardingUsers: newSet };
    }),
  setCurrentMessage: (msgOrFn) => {
    set((state) => {
      if (typeof msgOrFn === "function") {
        const newMessages = msgOrFn(state.currentMessage);
        return {
          ...state,
          currentMessage: newMessages,
        };
      }

      if (state.currentMessage.some((m) => m.id === msgOrFn.id)) {
        return state;
      }
      return {
        ...state,
        currentMessage: [...state.currentMessage, msgOrFn],
      };
    });
  },
  setNotify: (notifyOrFn) => {
    set((state) => {
      if (typeof notifyOrFn === "function") {
        const newNotify = notifyOrFn(state.notify);
        return {
          ...state,
          notify: newNotify,
        };
      }

      if (state.notify.some((m) => m.id === notifyOrFn.id)) {
        return state;
      }
      return {
        ...state,
        notify: [...state.notify, notifyOrFn],
      };
    });
  },
  setCurrentUsers: (newUser) => {
    set((state) => {
      const isExist = state.currentUser.some((user) => user.id === newUser.id);
      if (isExist) {
        return {
          ...state,
          currentUser: state.currentUser.map((u) =>
            u.id === newUser.id ? newUser : u
          ),
        };
      }
      return {
        ...state,
        currentUser: [...state.currentUser, newUser],
      };
    });
  },
  setLastMessages: (newLastMsgOrFn) => {
    set((state) => {
      if (!state.lastMessages) return state;
      if (typeof newLastMsgOrFn === "function") {
        const n = newLastMsgOrFn(state.lastMessages);
        return { ...state, lastMessages: n };
      }
      const newLastMessages = { ...state.lastMessages };
      newLastMessages[newLastMsgOrFn.room] = newLastMsgOrFn;
      const room = state.rooms.find((r) => r.id === newLastMsgOrFn.room);

      if (room) {
        console.log(newLastMsgOrFn);
        room.created_at = newLastMsgOrFn.created_at;
        const newRooms = state.rooms.map((r) => (r.id === room.id ? room : r));
        const sortRooms = newRooms.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        return {
          ...state,
          rooms: sortRooms,
          lastMessages: newLastMessages,
        };
      }
      return {
        ...state,
        lastMessages: { ...state.lastMessages },
      };
    });
  },
  setSidebarOpen: (isOpen) => {
    set((state) => {
      return {
        ...state,
        sidebarOpen: isOpen,
      };
    });
  },
  setTypingUsers: (typingUsers) => {},
  setNewNotify: (notifyOrFn) => {
    set((state) => {
      if (typeof notifyOrFn === "function") {
        const newNotify = notifyOrFn(state.newNotify!);
        return {
          ...state,
          newNotify: newNotify,
        };
      }

      return { ...state, newNotify: notifyOrFn };
    });
  },
}));
