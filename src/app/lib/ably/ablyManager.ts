import type { InboundMessage } from "ably";

type EventHandler = (message: InboundMessage) => void;

class AblyEventManager {
  private handlers: Record<string, EventHandler[]> = {};

  subscribe(eventName: string, handler: EventHandler) {
    if (!this.handlers[eventName]) this.handlers[eventName] = [];
    this.handlers[eventName].push(handler);
  }

  unsubscribe(eventName: string, handler: EventHandler) {
    this.handlers[eventName] = this.handlers[eventName]?.filter(
      (h) => h !== handler
    );
  }

  emit(eventName: string, message: InboundMessage) {
    this.handlers[eventName]?.forEach((handler) => handler(message));
  }
}

export const ablyEventManager = new AblyEventManager();
