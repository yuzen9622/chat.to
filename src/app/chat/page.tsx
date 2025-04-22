import React from "react";

import Image from "next/image";

export function generateMetadata() {
  return {
    title: `chat.to．聊天室`,
    description: `chat.to．聊天室`,
  };
}
export default function Page() {
  // // 監聽用戶進出
  // usePresenceListener(
  //   "chatta-chat-channel",
  //   (presenceMessage: PresenceMessage) => {
  //     const { action, clientId } = presenceMessage;

  //     if (action === "enter") {
  //       setLog((prev) => [...prev, `${clientId} 進入聊天室`]);
  //     } else if (action === "leave") {
  //       setLog((prev) => [...prev, `${clientId} 離開聊天室`]);
  //     }
  //   }
  // );

  return (
    <>
      <div className="justify-center hidden transition-all sm:flex sm:items-center sm:w-full sm:h-full">
        <Image src="/chat.png" width={100} height={100} alt="icon" />
      </div>
    </>
  );
}
