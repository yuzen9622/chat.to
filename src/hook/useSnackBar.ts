import { useAuthStore } from "@/app/store/AuthStore";
import { useCallback } from "react";

export const useSnackBar = () => {
  const { setSystemAlert } = useAuthStore();
  const handleSnackOpen = useCallback(
    (text: string, severity?: "success" | "info" | "error") => {
      setSystemAlert({
        text,
        severity: severity || "success",
        variant: "filled",
        open: true,
      });
    },
    [setSystemAlert]
  );
  const handleSnackClose = useCallback(() => {
    setSystemAlert({
      text: "",
      severity: "success",
      variant: "filled",
      open: false,
    });
  }, [setSystemAlert]);
  return { handleSnackOpen, handleSnackClose };
};
