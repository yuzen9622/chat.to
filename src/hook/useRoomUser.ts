"use client";

import { useMemo } from "react";

import { useChatStore } from "@/store/ChatStore";

export const useRoomUser = () => {
	const { currentChat } = useChatStore();

	const roomUsers = useMemo(() => {
		if (!currentChat) return null;
		const roomInfo: Record<
			string,
			{ id: string; name: string; image: string }
		> | null = {};

		currentChat.room_members.map((rm) => {
			if (rm.user) {
				roomInfo[rm.user_id] = rm.user;
			}
		});
		return roomInfo;
	}, [currentChat]);

	return roomUsers;
};
