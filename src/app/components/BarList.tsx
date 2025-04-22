import React from "react";
import ListItem from "./ListItem";

import { House, MessageSquareMore, Users, Bell } from "lucide-react";
export default function BarList() {
  return (
    <>
      <ListItem href="/">
        <House className="sm:mr-2" />
        <span className="hidden sm:block">Home</span>
      </ListItem>
      <ListItem href="/chat">
        <MessageSquareMore className="sm:mr-2" />
        <span className="hidden sm:block">Chats</span>
      </ListItem>
      <ListItem href="/friend">
        <Users className="sm:mr-2" />
        <span className="hidden sm:block">Friends</span>
      </ListItem>
      <ListItem href="/notify">
        <Bell className="sm:mr-2" />
        <span className="hidden sm:block">Notify</span>
      </ListItem>
    </>
  );
}
