import { Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Grow, Modal } from '@mui/material';

import RoomUserItem from './RoomUserItem';

import type { RoomInterface } from "@/types/type";

export function RoomUserModal({ currentChat }: { currentChat: RoomInterface }) {
  const [open, setOpen] = useState(false);

  const roomUsers = useMemo(() => {
    if (!currentChat) return [];
    const roomMembers = currentChat.room_members;
    return roomMembers;
  }, [currentChat]);
  return (
    <>
      <button
        title="成員"
        onClick={() => setOpen(true)}
        className="flex flex-col justify-center p-1 rounded-md dark:text-white hover:bg-white/10 "
      >
        <Users />
      </button>
      <Modal
        onClose={() => setOpen(false)}
        open={open}
        className="flex items-center justify-center"
      >
        <Grow in={open}>
          <div className="flex flex-col w-full h-64 max-w-md gap-2 p-2 bg-white rounded-md dark:bg-stone-900">
            <h1 className="text-xl text-center dark:text-white">成員</h1>

            <div className="flex flex-col max-h-full gap-2 overflow-auto dark:text-white">
              {roomUsers.length > 0 &&
                roomUsers.map((roomUser) => (
                  <RoomUserItem key={roomUser.id} member={roomUser} />
                ))}
            </div>
          </div>
        </Grow>
      </Modal>
    </>
  );
}
