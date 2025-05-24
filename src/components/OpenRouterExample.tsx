import React, { useState } from "react";
import { useOpenRouter } from "../lib/hooks/useOpenRouter";
import { useOpenRouterContext } from "../lib/providers/OpenRouterProvider";
import type { Message, ContentPart } from "../lib/services/openRouterService";

export function OpenRouterExample() {
  const { service } = useOpenRouterContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const {
    sendMessage,
    isLoading,
    error,
    dailyUsage,
    setModel,
    setParams,
    setCostLimit,
  } = useOpenRouter(service, {
    onError: () => {
      // Error is handled by the hook's error state
    },
  });

  // Helper function to render message content safely
  const renderMessageContent = (content: string | ContentPart[]): string => {
    if (typeof content === "string") {
      return content;
    }
    // For ContentPart[], extract text content
    return content
      .map((part) => {
        if (part.type === "text" && part.text) {
          return part.text;
        }
        return "";
      })
      .join("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    try {
      const response = await sendMessage([...messages, newMessage]);

      setMessages((prev) => [...prev, response.choices[0].message]);
    } catch {
      // Error is already handled by the hook
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value);
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams({
      temperature: parseFloat(e.target.value),
    });
  };

  const handleCostLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : null;
    setCostLimit(value);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Settings</h2>
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium">
              Model:
              <select
                className="mt-1 block w-full rounded-md border-gray-300"
                onChange={handleModelChange}
              >
                <option value="openai/gpt-4o-mini">GPT-4 Mini</option>
                <option value="anthropic/claude-3-opus-20240229">
                  Claude 3 Opus
                </option>
                <option value="anthropic/claude-3-sonnet-20240229">
                  Claude 3 Sonnet
                </option>
              </select>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium">
              Temperature:
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                className="mt-1 block w-full"
                onChange={handleTemperatureChange}
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium">
              Daily Cost Limit ($):
              <input
                type="number"
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300"
                onChange={handleCostLimitChange}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Daily Usage: ${dailyUsage.toFixed(4)}
        </p>
        {error && (
          <p className="text-sm text-red-600">Error: {error.message}</p>
        )}
      </div>

      <div className="mb-4 h-96 overflow-y-auto border rounded-md p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded ${
              message.role === "user" ? "bg-blue-100 ml-auto" : "bg-gray-100"
            }`}
          >
            <p className="text-sm font-medium mb-1">
              {message.role === "user" ? "You" : "Assistant"}
            </p>
            <p className="whitespace-pre-wrap">
              {renderMessageContent(message.content)}
            </p>
          </div>
        ))}
        {isLoading && (
          <div className="text-center py-2">
            <span className="animate-pulse">Thinking...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-md border-gray-300"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
