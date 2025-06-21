import { Skeleton } from "@mui/material";
import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center w-full h-full gap-4 p-4 overflow-y-auto">
      <section className="w-full max-w-2xl p-6 text-white shadow-lg shadow-blue-400/50 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative flex flex-col items-center gap-4 dark:text-white">
            <div className="relative ">
              <Skeleton
                width={128}
                height={128}
                variant="circular"
                animation="wave"
              />
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-start">
            <Skeleton height={40} width={210} />
            <Skeleton width={210} />
          </div>
        </div>
      </section>
    </div>
  );
}
