import UploadAvatar from "@/app/components/ui/Avatar/UploadAvatar";
import { createRoom } from "@/app/lib/api/room/roomApi";
import { useAblyStore } from "@/app/store/AblyStore";
import { useAuthStore } from "@/app/store/AuthStore";
import { Grow, Modal } from "@mui/material";
import { Ellipsis } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useCallback, useState } from "react";
import { twMerge } from "tailwind-merge";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import UserButton from "./UserButton";
import { useSnackBar } from "@/hook/useSnackBar";

export function CreateRoomModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { friends } = useAuthStore();
  const { channel } = useAblyStore();
  const [roomName, setRoomName] = useState("");
  const [roomMembers, setRoomMembers] = useState<Array<string>>([]);
  const [roomImg, setRoomImg] = useState<{
    imgUrl: string;
    imgFile: File;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const userId = useSession().data?.userId;
  const { handleSnackOpen } = useSnackBar();
  const handleRoomMember = useCallback(
    (userId: string) => {
      if (roomMembers.includes(userId)) {
        setRoomMembers((prev) => {
          return prev.filter((m) => m !== userId);
        });
      } else {
        setRoomMembers((prev) => [...prev, userId]);
      }
    },
    [roomMembers]
  );

  return (
    <>
      <Modal
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          setRoomMembers([]);
        }}
        className="flex items-center justify-center w-full h-full"
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Grow in={isOpen}>
          <div className=" w-11/12 max-w-[500px] p-4  transform  bg-white dark:bg-stone-900 rounded-md top-1/2 left-1/2  ">
            <h1 className="text-xl font-semibold dark:text-white">群組</h1>
            {/* <JoinModal />
            <div className="relative text-stone-800/55 flex items-center text-sm justify-center w-full p-2 text-center dark:text-white/20 before:absolute before:w-[43%] before:h-[1px] before:left-0 before:bg-stone-800/55 after:bg-stone-800/55 before:dark:bg-white/20 after:absolute after:w-[43%] after:h-[1px] after:right-0 after:dark:bg-white/20">
              OR
            </div> */}

            <p className="text-sm text-stone-900/70 dark:text-white/70">
              創建群組與好友聊天吧
            </p>
            <UploadAvatar
              src={roomImg?.imgUrl}
              setUserImage={setRoomImg}
              userImage={roomImg}
            />
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsLoading(true);
                const newRoom = await createRoom(
                  userId!,
                  roomName,
                  roomMembers,
                  "group",

                  roomImg?.imgFile
                );
                if (!channel || !newRoom) return;

                await channel.publish("room_action", {
                  action: "create",
                  newRoom: newRoom,
                  newRoomMembers: [...roomMembers, userId],
                });
                handleSnackOpen("創建房間成功");
                setIsLoading(false);
                setIsOpen(false);
                redirect(`/chat/${newRoom.id}`);
              }}
            >
              <div className="flex flex-col dark:text-white ">
                <label
                  htmlFor="room_name"
                  className="after:content-['*'] after:text-red-600"
                >
                  Name
                </label>
                <input
                  className="p-2 rounded-lg focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 bg-stone-900/5 dark:bg-stone-800"
                  type="text"
                  id="room_name"
                  required
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>
              <div className="w-full py-2 ">
                <p className="text-white">邀請好友</p>
                <div className="flex w-full max-w-full gap-2 overflow-auto">
                  <Swiper
                    pagination={{
                      clickable: true,
                      dynamicBullets: true,
                    }}
                    slidesPerView={"auto"}
                    spaceBetween={10}
                    slidesPerGroup={3}
                    className="!ml-0 "
                    modules={[Pagination, Navigation]}
                  >
                    {friends &&
                      friends.map((friend) => (
                        <>
                          <SwiperSlide key={friend.id} className="!w-fit">
                            <UserButton
                              key={friend.id}
                              friend={friend}
                              roomMembers={roomMembers}
                              handleRoomMember={handleRoomMember}
                            />
                          </SwiperSlide>
                        </>
                      ))}
                  </Swiper>
                </div>
              </div>
              <button
                type="submit"
                className={twMerge(
                  "flex items-center p-2 justify-center mt-3 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-400 ",
                  isLoading && "bg-blue-400"
                )}
              >
                {isLoading ? (
                  <>
                    <Ellipsis className=" animate-pulse" />
                  </>
                ) : (
                  "創建"
                )}
              </button>
            </form>
          </div>
        </Grow>
      </Modal>
    </>
  );
}
