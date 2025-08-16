"use client";

import "moment/locale/zh-tw";
import "moment/locale/zh-cn";
import "moment/locale/ja";
import "moment/locale/zh-hk";

import moment from "moment";
import { useEffect } from "react";

import { useAuthStore } from "../store/AuthStore";

import type { ReactNode } from "react";

export const MomentProvider = ({ children }: { children: ReactNode }) => {
  const { timeLang } = useAuthStore();

  useEffect(() => {
    moment.locale(timeLang);
  }, [timeLang]);

  return <>{children}</>;
};
