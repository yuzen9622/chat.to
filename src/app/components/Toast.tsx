"use client";
import { useSnackBar } from "@/hook/useSnackBar";
import { Alert, Snackbar } from "@mui/material";
import { useAuthStore } from "../store/AuthStore";

export const Toast = () => {
  const { systemAlert } = useAuthStore();
  const { handleSnackClose } = useSnackBar();
  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      onClose={handleSnackClose}
      autoHideDuration={5000}
      open={systemAlert.open}
    >
      <Alert severity={systemAlert.severity} variant={systemAlert.variant}>
        {systemAlert.text}
      </Alert>
    </Snackbar>
  );
};
