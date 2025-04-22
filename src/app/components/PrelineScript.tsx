"use client";
import { useEffect } from "react";

export default function PrelineScript() {
  useEffect(() => {
    import("preline/dist/preline.js")
      .then(() => {
        console.log("Preline loaded successfully");
      })
      .catch((error) => {
        console.error("Error loading Preline:", error);
      });
  }, []);

  return null;
}
