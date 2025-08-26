import { Ellipsis } from 'lucide-react';
import { Fragment, useCallback, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { useAblyStore } from '@/app/store/AblyStore';
import { useChatStore } from '@/app/store/ChatStore';
import { useSnackBar } from '@/hook/useSnackBar';
import { Grow, Modal } from '@mui/material';

export function JoinModal() {
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { channel } = useAblyStore();
  const { rooms } = useChatStore();
  const { handleSnackOpen } = useSnackBar();

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleJoin = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      try {
        e.preventDefault();
        setIsLoading(true);

        if (
          !channel ||
          rooms.some((r) => r.id === roomId && r.room_type === "group")
        )
          return;

        handleSnackOpen("加入房間成功", "success");
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    },
    [channel, roomId, rooms, handleSnackOpen]
  );
  return (
    <Fragment>
      <button
        onClick={handleOpen}
        className="w-full p-2 my-2 text-sm font-bold rounded-md dark:text-white bg-stone-900/5 hover:bg-stone-900/10 dark:bg-white/5 hover:dark:bg-white/10 "
      >
        加入群組
      </button>
      <Modal
        keepMounted
        className="flex items-center justify-center w-full h-full"
        open={open}
        onClose={handleClose}
      >
        <Grow in={open}>
          <div className=" w-11/12 max-w-[500px] p-4  transform  bg-white dark:bg-stone-900 rounded-md  ">
            <form onSubmit={handleJoin}>
              <div className="flex flex-col dark:text-white ">
                <label
                  htmlFor="room_name"
                  className="after:content-['*'] after:text-red-600"
                >
                  群組 Id
                </label>
                <input
                  className="p-2 rounded-lg bg-stone-900/10 focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:bg-stone-800"
                  type="text"
                  id="room_name"
                  required
                  onChange={(e) => setRoomId(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className={twMerge(
                  "flex items-center p-2 justify-center mt-3 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-400 ",
                  isLoading && "bg-blue-400"
                )}
              >
                {isLoading ? <Ellipsis className=" animate-pulse" /> : "加入"}
              </button>
            </form>
          </div>
        </Grow>
      </Modal>
    </Fragment>
  );
}
