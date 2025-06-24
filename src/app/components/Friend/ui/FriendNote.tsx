"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";

import NoteCard from "../../ui/NoteCard";
import { useAuthStore } from "../../../store/AuthStore";

import "swiper/css";
import "swiper/css/navigation";
import { useSession } from "next-auth/react";
export default function FriendNote() {
  const { friends } = useAuthStore();
  const user = useSession()?.data?.user;
  return (
    <div className="">
      <Swiper
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={true}
        slidesPerView={"auto"}
        spaceBetween={20}
        slidesPerGroup={3}
        modules={[Pagination, Navigation]}
      >
        <SwiperSlide className="!w-fit">
          <NoteCard isOwn={true} user={user!} />
        </SwiperSlide>

        {friends &&
          friends.map((friend) => (
            <SwiperSlide key={friend.id} className="!w-fit">
              <NoteCard key={friend.id} isOwn={false} user={friend.user} />
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
}
