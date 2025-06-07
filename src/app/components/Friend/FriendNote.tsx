"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";

import NoteCard from "../ui/NoteCard";
import { useAuthStore } from "../../store/AuthStore";

import { NoteInterface } from "../../../types/type";
import "swiper/css";
import "swiper/css/navigation";
export default function FriendNote({
  userNote,
}: {
  userNote: NoteInterface | null;
}) {
  const { friendNote } = useAuthStore();

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
        {userNote && (
          <SwiperSlide className="!w-fit">
            <NoteCard note={userNote} />
          </SwiperSlide>
        )}
        {friendNote &&
          friendNote.map((note) => (
            <SwiperSlide key={note.id} className="!w-fit">
              <NoteCard key={note.id} note={note} />
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
}
