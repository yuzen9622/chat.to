import React from "react";
import { Skeleton } from "@mui/material";
export default function Loading() {
  return (
    <div className="flex flex-col flex-1 max-h-full m-2 overflow-y-hidden transition-all rounded-md ">
      <header className="flex items-center justify-between w-full p-2 ">
        <span className="flex items-center w-fit">
          <Skeleton
            animation="wave"
            className=" dark:bg:white/10 bg-stone-900/10"
            width="45px"
            height="45px"
            variant="circular"
          />
          <span className="flex flex-col pl-2 ">
            <Skeleton width={200} className="" height={40} animation="wave" />
          </span>
        </span>
      </header>
      <div className="box-border flex flex-col h-full overflow-hidden rounded-lg ">
        <main className="flex flex-col items-end flex-1 p-4 space-y-4 overflow-y-auto">
          <Skeleton
            height={40}
            width={200}
            className=" dark:bg:white/10 bg-stone-900/10"
          />
          <Skeleton
            height={40}
            width={200}
            className=" dark:bg:white/10 bg-stone-900/10"
          />
          <Skeleton
            height={40}
            width={200}
            className=" dark:bg:white/10 bg-stone-900/10"
          />
        </main>
      </div>
    </div>
  );
}
