import { useState, useCallback } from "react";
import type {
  OpenRouterService,
  Message,
  ChatParams,
  ChatResponse,
} from "../services/openrouter";

export interface UseOpenRouterOptions {
  onError?: (error: Error) => void;
  onSuccess?: (response: ChatResponse) => void;
}

export function useOpenRouter(
  service: OpenRouterService,
  options: UseOpenRouterOptions = {},
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async (
      messages: Message[],
      chatOptions?: Omit<ChatParams, "messages">,
    ): Promise<ChatResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await service.chat({
          messages,
          ...chatOptions,
        });

        options.onSuccess?.(response);
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [service, options],
  );

  const setModel = useCallback(
    (model: string) => {
      service.setDefaultModel(model);
    },
    [service],
  );

  const setParams = useCallback(
    (params: Parameters<typeof service.setDefaultParams>[0]) => {
      service.setDefaultParams(params);
    },
    [service],
  );

  const setCostLimit = useCallback(
    (limit: number | null) => {
      service.setDailyCostLimit(limit);
    },
    [service],
  );

  return {
    sendMessage,
    setModel,
    setParams,
    setCostLimit,
    isLoading,
    error,
    dailyUsage: service.getDailyUsage(),
  };
}
