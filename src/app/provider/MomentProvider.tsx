"use client";

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
