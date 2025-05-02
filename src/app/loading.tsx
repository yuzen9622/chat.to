import NavBar from "./components/NavBar";

import { Skeleton } from "@mui/material";

export default async function Loading() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2 p-2 flex-nowrap">
      <section className="flex flex-col items-center justify-start w-full p-3 px-4 rounded-md min-w-fit h-fit dark:bg-white/5">
        <NavBar />
        <span className="flex items-center gap-8 mt-3 dark:text-white">
          <div className="relative w-fit h-fit">
            <Skeleton width={100} height={100} variant="circular" />
          </div>

          <div className="flex flex-col gap-2 ">
            <span className="flex gap-2">
              <Skeleton width={100} height={20} />
            </span>

            <Skeleton width={100} height={20} />
            <Skeleton width={100} height={20} />
            <span className="flex gap-2">
              <Skeleton width={100} height={20} />
            </span>
          </div>
        </span>
      </section>
      <section className="flex w-full h-full p-3 px-4 text-white rounded-md dark:bg-white/5 ">
        <div className="w-1/2 h-full ">
          <p className="mb-2">便利貼</p>
        </div>
      </section>
    </div>
  );
}
