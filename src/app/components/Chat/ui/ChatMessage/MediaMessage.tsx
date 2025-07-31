import 'react-photo-view/dist/react-photo-view.css';

import Image from 'next/image';
import { memo, useCallback, useMemo, useState } from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';

import PreviewMediaModal from '@/app/components/ui/Modal/PreviewMediaModal';
import { messageType } from '@/app/lib/util';

import type { ClientMessageInterface } from "@/types/type";
const MediaMessage = memo(function MediaMessage({
  message,
}: {
  message: ClientMessageInterface;
}) {
  const metaData = message.meta_data;
  const [open, setOpen] = useState(false);

  const type = useMemo(() => {
    if (!metaData) return false;
    return messageType(metaData);
  }, [metaData]);

  const PreviewMedia = useMemo(() => {
    if (!metaData) return;
    return {
      alt: message.text,
      url: metaData.url || "",
      type: type || "",
    };
  }, [metaData, type, message]);

  const handleVideoPlay = useCallback(
    async (e: React.MouseEvent<HTMLVideoElement>) => {
      const video = e.target as HTMLVideoElement;
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    },
    []
  );

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  return (
    <div className="w-auto h-auto max-w-[300px] rounded-3xl">
      <PreviewMediaModal
        media={PreviewMedia}
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      />
      {metaData ? (
        <>
          {type === "image" && (
            <PhotoProvider>
              <PhotoView src={metaData.url}>
                <Image
                  width={300}
                  height={300}
                  src={metaData.url}
                  className="w-full h-full rounded-3xl"
                  alt={message.text}
                />
              </PhotoView>
            </PhotoProvider>
          )}
          {type === "video" && (
            <video
              width={300}
              height={300}
              src={metaData.url}
              onClick={handleOpen}
              muted
              onMouseEnter={handleVideoPlay}
              onMouseLeave={handleVideoPlay}
              className="w-full h-full rounded-3xl"
            />
          )}
        </>
      ) : (
        <span className="w-full h-full dark:bg-neutral-800"></span>
      )}
    </div>
  );
});
export default MediaMessage;
