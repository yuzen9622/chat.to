import { LogOut, Trash2Icon } from 'lucide-react';

import { useChatAction } from './hook/useChatAction';

export default function OutModal({ isOwner }: { isOwner: boolean }) {
  const { handleDelete, handleQuit } = useChatAction();
  return (
    <>
      {isOwner ? (
        <button
          title="刪除"
          className="p-1 rounded-md dark:text-white hover:bg-white/10"
          onClick={handleDelete}
        >
          <Trash2Icon />
        </button>
      ) : (
        <button
          title="退出"
          className="p-1 rounded-md dark:text-white hover:bg-white/10"
          onClick={handleQuit}
        >
          <LogOut />
        </button>
      )}
    </>
  );
}
