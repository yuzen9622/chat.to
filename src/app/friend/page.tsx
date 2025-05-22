import React from "react";
import FriendRequest from "../components/FriendRequest";
import FriendList from "../components/FriendList";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "朋友",
};

export default function Page() {
  return (
    <div className="relative flex-1 max-h-full p-2 m-2 overflow-y-hidden transition-all rounded-lg ">
      <span className="flex flex-col w-full h-full gap-2 lg:flex-row">
        {/* <NavBar /> */}
        <FriendRequest />
        <FriendList />
      </span>
    </div>
  );
}
