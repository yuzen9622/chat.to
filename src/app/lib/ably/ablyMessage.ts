import { useAblyStore } from "@/app/store/AblyStore";
import { ClientMessageInterface } from "@/types/type";

export async function sendAblyMessage(newMessage: ClientMessageInterface) {
  const { ably } = useAblyStore.getState();
  if (!ably) throw "Ably is not active";
  const room = ably.channels.get(newMessage.room);
  const global = ably.channels.get("chatta-chat-channel");

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
