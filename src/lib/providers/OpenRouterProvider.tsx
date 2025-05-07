import React, { createContext, useContext } from "react";
import type { OpenRouterService, OpenRouterServiceConfig } from "../services/openrouter";

interface OpenRouterContextValue {
  service: OpenRouterService;
}

const OpenRouterContext = createContext<OpenRouterContextValue | null>(null);

export interface OpenRouterProviderProps {
  children: React.ReactNode;
  service: OpenRouterService;
}

export function OpenRouterProvider({
  children,
  service,
}: OpenRouterProviderProps) {
  const value = React.useMemo(
    () => ({
      service,
    }),
    [service],
  );

  return (
    <OpenRouterContext.Provider value={value}>
      {children}
    </OpenRouterContext.Provider>
  );
}

export function useOpenRouterContext(): OpenRouterContextValue {
  const context = useContext(OpenRouterContext);
  
  if (!context) {
    throw new Error(
      "useOpenRouterContext must be used within an OpenRouterProvider",
    );
  }
  
  return context;
}

// Factory function to create a new OpenRouter service instance
export function createOpenRouterService(config: OpenRouterServiceConfig): OpenRouterService {
  return new OpenRouterService(config);
} 