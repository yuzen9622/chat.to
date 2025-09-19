"use client";

import "moment/locale/ja";
import "moment/locale/zh-cn";
import "moment/locale/zh-hk";
import "moment/locale/zh-tw";

import moment from "moment";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAuthStore } from "@/store/AuthStore";

export const MomentProvider = ({ children }: { children: ReactNode }) => {
  const { timeLang } = useAuthStore();

  useEffect(() => {
    moment.locale(timeLang);
  }, [timeLang]);

  return <>{children}</>;
};
