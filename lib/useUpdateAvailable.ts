"use client";

import { useEffect, useState } from "react";
import { clearDeployUpdatePending, isDeployUpdatePending } from "./updates";

export function useUpdateAvailable() {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    setAvailable(isDeployUpdatePending());
    const onEvent = () => setAvailable(true);
    window.addEventListener("cb:update-available", onEvent);
    return () => window.removeEventListener("cb:update-available", onEvent);
  }, []);

  const acknowledge = () => {
    clearDeployUpdatePending();
    setAvailable(false);
  };

  return { available, acknowledge };
}
