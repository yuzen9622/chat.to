"use client";
import { create } from "zustand";
import { FriendRequestInterface, UserInterface } from "../lib/type";
import { fetchFriendRequests, fetchUserFriends } from "../lib/util";
import { getSession } from "next-auth/react";
interface AuthStore {
  user: UserInterface | null;
  setUser: (user: object) => Promise<void>;
  friends: UserInterface[] | null;
  friendRequests: FriendRequestInterface[] | null;
  isInitialized: boolean;
  setFriends: (
    friend: UserInterface | ((prev: UserInterface[]) => UserInterface[])
  ) => void;
  setFriendRequest: (
    requestOrFn:
      | FriendRequestInterface
      | ((prev: FriendRequestInterface[]) => FriendRequestInterface[])
  ) => void;
  initialize: (user: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isInitialized: false,
  friends: null,
  friendRequests: null,
  setUser: async (user) => {
    try {
      const res = await fetch("/api/users", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      if (res.ok) {
        const data = await res.json();
        console.log(data);
        set({ user: data[0] });
      } else {
        throw new Error("server error");
      }
    } catch (error) {
      console.log(error);
    }
  },
  initialize: async (user: string) => {
    try {
      const session = await getSession();
      console.log(user);
      // const userRes = await fetch("/api/users", {
      //   method: "post",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(user),
      // });
      // const userData = await userRes.json();
      const friendsData: UserInterface[] = await fetchUserFriends(user);
      const friendRequestData: FriendRequestInterface[] =
        await fetchFriendRequests(user);
      set({ friends: friendsData || [] });
      set({ friendRequests: friendRequestData || [] });
      const userData: UserInterface = {
        id: session?.userId as string,
        username: session?.user.name as string,
        email: session?.user.email as string,
        image: session?.user.image as string,
      };
      set({ user: userData });

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
        return {
          ...state,
          friendRequests: newFriendRequest,
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
}));
