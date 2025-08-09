"use client";

import { Realtime } from "ably";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { useAblyStore } from "../../store/AblyStore";

let ablyInstance: Realtime;

export const getAblyClient = (clientId: string) => {
  if (!ablyInstance) {
    ablyInstance = new Realtime({
      authUrl: "/api/ably-token",
      authHeaders: { "Content-Type": "application/json" },
      authParams: { clientId },
      authMethod: "POST",
      autoConnect: true,
    });
  }
  return ablyInstance;
};

export const useAbly = () => {
  const [ablyClient, setAblyClient] = useState<Realtime | null>(null);
  const { data: session } = useSession();
  const userId = session?.userId;
  const { setAbly } = useAblyStore();

  useEffect(() => {
    if (userId && !ablyClient) {
      const client = getAblyClient(userId);
      setAblyClient(client);
      setAbly(client);
    }
  }, [userId, ablyClient, setAbly]);

  return ablyClient;
};
