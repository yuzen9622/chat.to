import { Ellipsis, ForwardIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";

import { sendAblyMessage } from "@/app/lib/ably/ablyMessage";
import { forwardMessage } from "@/app/lib/api/message/messageApi";
import { createForwardMessage } from "@/app/lib/createMessage";
import { useChatStore } from "@/app/store/ChatStore";
import { Grow, Modal } from "@mui/material";

import ForwardRoomItem from "./ForwardRoomItem";

import type { ClientMessageInterface, Forward } from "@/types/type";

export default function ForwardModal({
  message,
}: {
  message: ClientMessageInterface;
}) {
  const [open, setOpen] = useState(false);
  const [targets, setTarget] = useState<Forward[]>([]);
  const [loading, setLoading] = useState(false);
  const { rooms } = useChatStore();
  const [text, setText] = useState("");
  const user = useSession()?.data?.user;

  const targetRoom = useMemo(() => {
    return rooms.filter((room) =>
      room.room_members.some((rm) => rm.user_id === user?.id && !rm.is_deleted)
    );
  }, [rooms, user]);

  const handleForward = useCallback(async () => {
    try {
      setLoading(true);
      if (!user) return;
      const forwardMsg = createForwardMessage(user, message, text);

      const forwards = await forwardMessage(targets, forwardMsg);
      await Promise.all(
        forwards.map(async (msg) => await sendAblyMessage(msg))
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }, [targets, message, text, user]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={twMerge(
          "w-full  justify-between flex items-center gap-x-3.5 py-1.5 px-2.5 text-sm rounded-md text-stone-700 hover:bg-gray-100 dark:text-neutral-300 hover:dark:bg-neutral-700"
        )}
      >
        轉發 <ForwardIcon size={20} />
      </button>
      <Modal
        className="flex items-center justify-center w-full h-full "
        open={open}
        onClose={() => setOpen(false)}
      >
        <Grow in={open}>
          <div className="flex flex-col w-11/12 max-w-lg gap-3 p-3 bg-white rounded-md h-4/5 dark:bg-stone-900">
            <h1 className="flex text-2xl">轉發</h1>
            <div className="flex flex-col h-full gap-2 overflow-x-hidden overflow-y-auto">
              {targetRoom.map((room) => (
                <ForwardRoomItem
                  key={room.id}
                  isSelected={targets.some(
                    (target) => target.room_id === room.id
                  )}
                  room={room}
                  setTargets={setTarget}
                />
              ))}
            </div>{" "}
            {targets.length > 0 && (
              <div className="flex items-center gap-2 p-1 dark:bg-white/10 bg-stone-100 rounded-3xl">
                <input
                  type="text"
                  value={text}
                  placeholder="輸入文字 (可選)"
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 h-full px-3 py-2 bg-transparent rounded-md outline-none"
                />

                <button
                  type="button"
                  onClick={handleForward}
                  className="p-2 px-3 text-sm text-white bg-blue-500 rounded-3xl w-fit hover:bg-blue-600 animate-in zoom-in-50"
                >
                  {" "}
                  {loading ? (
                    <Ellipsis className=" animate-pulse" />
                  ) : (
                    ` 轉發 (${targets.length})`
                  )}
                </button>
              </div>
            )}
          </div>
        </Grow>
      </Modal>
    </>
  );
}
