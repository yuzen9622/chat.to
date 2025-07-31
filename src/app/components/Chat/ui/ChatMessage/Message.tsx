import type { ClientMessageInterface } from "@/types/type";
import { useCallback } from 'react';

import AudioMessage from './AudioMessage';
import FileMessage from './FileMessage';
import MediaMessage from './MediaMessage';
import TextMessage from './TextMessage';

export default function Message({
  message,

  isOwn,
}: {
  message: ClientMessageInterface;

  isOwn: boolean;
}) {
  const Message = useCallback(() => {
    const messageType = {
      text: <TextMessage message={message} isOwn={isOwn} />,
      media: <MediaMessage message={message} />,
      file: <FileMessage message={message} isOwn={isOwn} />,

      audio: message.meta_data && (
        <AudioMessage metaData={message.meta_data} isOwn={isOwn} />
      ),
    };
    return messageType[message.type];
  }, [isOwn, message]);

  return <Message />;
}
