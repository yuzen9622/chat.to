// lib/ablyListener.ts
import { RealtimeChannel } from "ably";
import { ablyEventManager } from "./ablyManager";

export function registerAblyListeners(channel: RealtimeChannel) {
  const events = [
    "friend_action",
    "room_action",
    "notify",
    "note_action",
    "signal_action",
    "call_action",
    "user_action",
    "typing_action",
  ];

  events.forEach((event) => {
    channel.subscribe(event, (message) => {
      ablyEventManager.emit(event, message);
    });
  });

  return () => {
    events.forEach((event) => {
      channel.unsubscribe(event);
    });
  };
}
