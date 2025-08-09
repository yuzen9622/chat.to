import { Realtime, Rest } from "ably";

export const ably = new Rest(process.env.ABLY_API_KEY ?? "");
export const ablyRealtime = new Realtime(process.env.ABLY_API_KEY ?? "");
