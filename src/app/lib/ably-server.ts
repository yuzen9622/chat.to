import * as Ably from "ably";

export const ably = new Ably.Rest(process.env.ABLY_API_KEY!);
