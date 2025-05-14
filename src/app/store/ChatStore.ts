"use client";
import { create } from "zustand";
import {
  ClientMessageInterface,
  NotifyInterface,
  RoomInterface,
  UserInterface,
} from "../../types/type";

interface ChatStore {
  currentChat: RoomInterface | null;
  rooms: RoomInterface[];
  currentUser: UserInterface[];
  currentMessage: ClientMessageInterface[];
  cachedMessages: Map<string, ClientMessageInterface[]>;
  loading: boolean;
  newMessage: ClientMessageInterface | null;
  reply: ClientMessageInterface | null;
  newNotify: NotifyInterface | null;
  typingUsers: Record<string, Array<{ userId: string; typing: boolean }>>;
  edit: ClientMessageInterface | null;
  chatInfoOpen: boolean;
  setChatInfoOpen: (isOpen: boolean) => void;
  notify: ClientMessageInterface[];
  lastMessages: Record<string, ClientMessageInterface | null>;
  onboardingUsers: Set<string>;
  sidebarOpen: boolean;
  setCachedMessages: (
    roomId: string,
    messages: ClientMessageInterface[]
  ) => void;
  setLoading: (load: boolean) => void;
  setRoom: (
    roomOrFn: RoomInterface | ((prev: RoomInterface[]) => RoomInterface[])
  ) => void;
  setCurrentChat: (currentChat: RoomInterface | null) => void;
  setCurrentMessage: (
    msgOrFn:
      | ClientMessageInterface
      | ((prev: ClientMessageInterface[]) => ClientMessageInterface[])
  ) => void;
  setReply: (msg: ClientMessageInterface | null) => void;
  setEdit: (msg: ClientMessageInterface | null) => void;
  setNotify: (
    notifyOrFn:
      | ClientMessageInterface
      | ((prev: ClientMessageInterface[]) => ClientMessageInterface[])
  ) => void;
  setCurrentUsers: (newUser: UserInterface) => void;
  setLastMessages: (
    newLastMsg:
      | ClientMessageInterface
      | ((
          prev: Record<string, ClientMessageInterface | null>
        ) => Record<string, ClientMessageInterface | null>)
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
  cachedMessages: new Map(),
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
  setCachedMessages: (roomId, messages) => {
    set((state) => {
      const newCached = new Map(state.cachedMessages);
      if (messages.length > 20) {
        messages = messages.slice(-20);
      }
      newCached.set(roomId, messages);
      return { ...state, cachedMessages: newCached };
    });
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
        const newCached = state.cachedMessages;
        if (state.currentChat) {
          newCached.set(state.currentChat.id, newMessages);
        }

        return {
          ...state,
          cachedMessages: newCached,
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
  setTypingUsers: (typingUsers) => {
    return typingUsers;
  },
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
