import { Skeleton } from "@mui/material";

export function LoadingList() {
  return (
    <div>
      <div className="flex items-center min-w-[300px] mb-3 ">
        <Skeleton
          variant="circular"
          className=" dark:bg:white/10 bg-stone-900/10"
          width={45}
          height={45}
        />
        <div className="ml-2">
          <Skeleton
            variant="text"
            className=" dark:bg:white/10 bg-stone-900/10"
            width={150}
          />
          <Skeleton
            variant="text"
            width={100}
            className=" dark:bg:white/10 bg-stone-900/10"
          />
        </div>
      </div>
      <div className="flex items-center w-full mb-3 ">
        <Skeleton
          variant="circular"
          className=" dark:bg:white/10 bg-stone-900/10"
          width={45}
          height={45}
        />
        <div className="ml-2">
          <Skeleton
            variant="text"
            className=" dark:bg:white/10 bg-stone-900/10"
            width={150}
          />
          <Skeleton
            variant="text"
            width={100}
            className=" dark:bg:white/10 bg-stone-900/10"
          />
        </div>
      </div>
      <div className="flex items-center w-full mb-3 ">
        <Skeleton
          variant="circular"
          className=" dark:bg:white/10 bg-stone-900/10"
          width={45}
          height={45}
        />
        <div className="ml-2">
          <Skeleton
            variant="text"
            className=" dark:bg:white/10 bg-stone-900/10"
            width={150}
          />
          <Skeleton
            variant="text"
            width={100}
            className=" dark:bg:white/10 bg-stone-900/10"
          />
        </div>
      </div>
      <div className="flex items-center w-full mb-3 ">
        <Skeleton
          variant="circular"
          className=" dark:bg:white/10 bg-stone-900/10"
          width={45}
          height={45}
        />
        <div className="ml-2">
          <Skeleton
            variant="text"
            className=" dark:bg:white/10 bg-stone-900/10"
            width={150}
          />
          <Skeleton
            variant="text"
            width={100}
            className=" dark:bg:white/10 bg-stone-900/10"
          />
        </div>
      </div>
    </div>
  );
}
