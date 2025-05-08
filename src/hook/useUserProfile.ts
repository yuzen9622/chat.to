"use client";
import { supabase } from "@/app/lib/supabasedb";
import { UserInterface } from "@/app/lib/type";
import { useChatStore } from "@/app/store/ChatStore";
import { useEffect, useState } from "react";

export const useUserProfile = (userId: string | undefined) => {
  const [user, setUser] = useState<UserInterface | null>(null);
  const {
    currentUser,
    setCurrentUsers,
    onboardingUsers,
    addOnboardingUser,
    removeOnboardingUser,
  } = useChatStore();

  useEffect(() => {
    if (!userId || onboardingUsers.has(userId)) return;
    const cachedUser = currentUser.find((user) => user.id === userId);

    if (cachedUser) {
      setUser(cachedUser);
      return;
    }

    const fetchUser = async () => {
      try {
        addOnboardingUser(userId);

        const { data } = await supabase
          .from("users")
          .select("id,image,name")
          .eq("id", userId);
        if (data) {
          setCurrentUsers(data[0]);
          setUser(data[0]);
        }
      } catch (error) {
        console.log(error);
      } finally {
        removeOnboardingUser(userId);
      }
    };

    fetchUser();
  }, [
    userId,
    currentUser,
    setCurrentUsers,
    addOnboardingUser,
    removeOnboardingUser,
  ]);

  return user;
};
