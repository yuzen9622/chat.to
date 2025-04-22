import React from "react";
import FriendRequest from "../components/FriendRequest";
import FriendList from "../components/FriendList";
import NavBar from "../components/NavBar";

export default function Page() {
  return (
    <div className="relative flex-1 max-h-full p-2 m-2 overflow-y-hidden transition-all rounded-lg bg-white/5">
      <span className="flex flex-col w-full lg:flex-row">
        <NavBar />
        <FriendRequest />
        <FriendList />
      </span>
    </div>
  );
}
