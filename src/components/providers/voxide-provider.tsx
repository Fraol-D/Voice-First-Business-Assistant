"use client";

import React, { createContext, useContext, useMemo } from "react";
import { VoxideClient } from "@voxide/react";

interface VoxideContextValue {
  client: VoxideClient | null;
  apiKey: string;
}

const VoxideContext = createContext<VoxideContextValue>({
  client: null,
  apiKey: "",
});

export function useVoxide() {
  const context = useContext(VoxideContext);
  if (!context) {
    throw new Error("useVoxide must be used within a VoxideProvider");
  }
  return context;
}

interface VoxideProviderProps {
  apiKey?: string;
  children: React.ReactNode;
}

export function VoxideProvider({ apiKey = "", children }: VoxideProviderProps) {
  const effectiveKey =
    apiKey ||
    (typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_VOXIDE_API_KEY || ""
      : "");

  const client = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }
    // VoxideClient expects a publishable key (e.g. vox_pub_...)
    const key = effectiveKey.trim() || "vox_pub_business_assistant";
    try {
      return new VoxideClient({
        publicKey: key,
        language: "en-US",
      });
    } catch (err) {
      console.warn("[Voxide] Failed to initialize VoxideClient:", err);
      return null;
    }
  }, [effectiveKey]);

  return (
    <VoxideContext.Provider value={{ client, apiKey: effectiveKey }}>
      {children}
    </VoxideContext.Provider>
  );
}
