import React, { Fragment, useCallback, useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import {
  formatSize,
  getFileIcon,
  handleDownload,
  messageType,
} from "../../../lib/util";
import { ClientMessageInterface } from "../../../../types/type";

import { useChatStore } from "../../../store/ChatStore";
import { LucideIcon } from "lucide-react";
import PreviewMediaModal from "../../ui/Modal/PreviewMediaModal";
import { PhotoProvider, PhotoView } from "react-photo-view";
import moment from "moment";
type Type = "media" | "url" | "file";

export default function ChatInfoList() {
  const [isLoading, setIsLoading] = useState(false);
  const [filterMessages, setFilterMessages] = useState<
    ClientMessageInterface[]
  >([]);
  const [filterType, setFilterType] = useState<Type>("file");
  const [isOpen, setIsOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{
    alt: string;
    url: string;
    type: string;
  } | null>(null);

  const { currentChat } = useChatStore();
  const handleFilterMessage = useCallback(async () => {
    if (!currentChat) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/messages/meta", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metaType: filterType,
          roomId: currentChat?.id,
        }),
      });
      if (res.ok) {
        const data: ClientMessageInterface[] = await res.json();
        const filterData = data.filter((msg) => {
          if (messageType(msg.meta_data!) === "audio") return null;
          return msg;
        });
        setFilterMessages(filterData);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [filterType, currentChat]);

  const handlePreview = useCallback((message: ClientMessageInterface) => {
    const mediaType = messageType(message.meta_data!);
    if (!mediaType || !message.meta_data) return;
    setIsOpen(true);
    setPreviewMedia({
      alt: message.text,
      url: message.meta_data?.url,
      type: mediaType,
    });
  }, []);

  useEffect(() => {
    setFilterMessages([]);
    handleFilterMessage();
  }, [handleFilterMessage]);

  return (
    <>
      <PreviewMediaModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        media={previewMedia!}
      />

      <div className="flex flex-col items-center w-full h-full overflow-hidden ">
        <span className="flex w-full dark:text-white ">
          <button
            onClick={() => setFilterType("file")}
            className={twMerge(
              "flex-1 py-2 border-b-2 border-transparent",
              filterType === "file" && "  border-blue-600"
            )}
          >
            檔案
          </button>
          <button
            onClick={() => setFilterType("media")}
            className={twMerge(
              "flex-1 py-2   border-b-2 border-transparent",
              filterType === "media" && "  border-blue-600"
            )}
          >
            媒體
          </button>
          {/* <button
                onClick={() => handleFileType("url")}
                className={twMerge(
                  "flex-1 py-2   border-b-2 border-transparent",
                  filterType === "url" && " border-blue-600"
                )}
              >
                連結
              </button> */}
        </span>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <div
            className={twMerge(
              "grid w-full max-h-full grid-cols-3 overflow-y-auto ",
              filterType === "file" && "grid-cols-1 gap-2"
            )}
          >
            {filterMessages.map((message) => {
              if (filterType === "file") {
                if (message.type === "media") return null;
                const Icon: LucideIcon = getFileIcon(message.text);
                return (
                  <button
                    key={message.id}
                    title={message.text}
                    onClick={() =>
                      handleDownload(
                        message?.meta_data?.url || "",
                        message.text
                      )
                    }
                    className={twMerge(
                      "flex  p-2  dark:text-white bg-gray-500/20 gap-1 dark:bg-wjite/5"
                    )}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className="flex flex-col items-center p-2 rounded-full bg-white/5">
                        <Icon />
                      </span>
                      <p className="text-xs">
                        {
                          message.text.split(".")[
                            message.text.split(".").length - 1
                          ]
                        }
                      </p>
                    </div>
                    <span className="flex flex-col justify-center w-full ">
                      <span className="flex justify-between gap-2">
                        <p className="text-sm break-all text-start">
                          {message.text}
                        </p>
                        <p className="px-3 py-1 text-xs text-center text-white h-fit dark:bg-white/5 outline-white rounded-3xl">
                          {moment(message.created_at).calendar()}
                        </p>
                      </span>

                      <span className="flex items-center justify-between w-full gap-1 mt-1 text-xs">
                        <p>
                          大小:
                          {message.meta_data &&
                            formatSize(message.meta_data.size)}
                        </p>

                        <p>點擊下載</p>
                      </span>
                    </span>
                  </button>
                );
              } else if (filterType === "media") {
                const mediaType = messageType(message.meta_data!);
                return (
                  <Fragment key={message.id}>
                    {message.meta_data && (
                      <>
                        {mediaType === "image" ? (
                          <PhotoProvider>
                            <PhotoView src={message?.meta_data.url}>
                              <Image
                                src={message?.meta_data.url}
                                alt={message.text}
                                width={50}
                                height={50}
                                className="object-cover w-full aspect-square"
                              />
                            </PhotoView>
                          </PhotoProvider>
                        ) : (
                          <video
                            src={message?.meta_data.url}
                            onClick={() => handlePreview(message)}
                            className="object-cover w-full aspect-square"
                          />
                        )}
                      </>
                    )}
                  </Fragment>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    </>
  );
}
