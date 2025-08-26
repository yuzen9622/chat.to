import { X } from 'lucide-react';

import { useChatStore } from '@/app/store/ChatStore';

export default function Edit({
  setMessageText,
}: {
  setMessageText: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { setEdit } = useChatStore();
  return (
    <div className="px-3 py-1 rounded-e-sm ">
      <div className="flex justify-between font-semibold dark:text-white">
        <p className="text-sm dark:text-white/80">編輯訊息</p>
        <button
          type="button"
          className="p-1 rounded-full hover:bg-white/10"
          onClick={() => {
            setEdit(null);
            setMessageText("");
          }}
        >
          <X />
        </button>
      </div>
    </div>
  );
}
