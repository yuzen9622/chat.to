"use client";
import 'swiper/css';
import 'swiper/css/navigation';

import moment from 'moment';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { useAuthStore } from '../../../store/AuthStore';
import NoteCard from '../../ui/note/NoteCard';

export default function FriendNote() {
  const { friends, friendNote } = useAuthStore();

  const sortedNote = useMemo(() => {
    if (!friends) return [];

    const addNoteFriends = friends?.map((f) => {
      f.user.note = friendNote?.find((fn) => fn.user_id === f.friend_id);
      return f;
    });

    addNoteFriends.sort((a, b) => {
      if (!a.user.note && !b.user.note) {
        return 0;
      } else if (!b.user.note) {
        return -1;
      } else if (!a.user.note) {
        return 1;
      }
      return (
        moment(b.user.note.created_at).unix() -
        moment(a.user.note.created_at).unix()
      );
    });

    return addNoteFriends;
  }, [friendNote, friends]);

  const user = useSession()?.data?.user;
  return (
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
      {user && (
        <SwiperSlide className="!w-fit">
          <NoteCard isOwn={true} user={user} />
        </SwiperSlide>
      )}

      {sortedNote?.map((friend) => (
        <SwiperSlide key={friend.id} className="!w-fit">
          <NoteCard key={friend.id} isOwn={false} user={friend.user} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
