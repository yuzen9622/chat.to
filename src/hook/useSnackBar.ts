import { useCallback } from 'react';

import { useAuthStore } from '@/app/store/AuthStore';

export const useSnackBar = () => {
  const { setSystemAlert } = useAuthStore();
  const handleSnackOpen = useCallback(
    (text: string, severity?: "success" | "info" | "error") => {
      setSystemAlert({
        text,
        severity: severity || "success",
        variant: "standard",
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
