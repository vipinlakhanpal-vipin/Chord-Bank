"use client";

import { useEffect, useState } from "react";
import { checkVersionOnLoad, clearDeployUpdatePending, isDeployUpdatePending } from "./updates";

export function useUpdateAvailable() {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    // Runs first, synchronously, so a "you were away and missed a version"
    // flag it sets is already in localStorage before the read right below —
    // see checkVersionOnLoad's comment in lib/updates.ts for why this alone
    // isn't enough and the version-polling effect in ServiceWorkerRegister
    // still matters too.
    checkVersionOnLoad();
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
