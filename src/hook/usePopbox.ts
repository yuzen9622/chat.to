"use client";

import { useState, useCallback } from "react";

export function usePopbox<T extends HTMLElement = HTMLElement>() {
  const [anchorEl, setAnchorEl] = useState<T | null>(null);

  const handleOpen = useCallback((event: React.MouseEvent<T>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  return {
    anchorEl,
    open: Boolean(anchorEl),
    handleOpen,
    handleClose,
  };
}
