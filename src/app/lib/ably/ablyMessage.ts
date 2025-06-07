import { ClientMessageInterface } from "@/types/type";
import { Realtime } from "ably";

export async function sendAblyMessage(
  ablyRealtime: Realtime,
  newMessage: ClientMessageInterface
) {
  const room = ablyRealtime.channels.get(newMessage.room);
  const global = ablyRealtime.channels.get("chatta-chat-channel");

  // 可用 Promise.all 同時傳送提升效能
  await Promise.all([
    global.publish("notify", {
      action: "send",
      newMessage,
    }),
    room.publish("message", {
      action: "send",
      newMessage,
    }),
  ]);
}
