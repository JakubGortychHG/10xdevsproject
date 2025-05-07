import axios from "axios";
import type { AxiosInstance, AxiosError, AxiosResponse } from "axios";

// Types
export interface OpenRouterServiceConfig {
  apiKey: string;
  defaultModel?: string;
  baseUrl?: string;
  defaultParams?: {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
  };
}

export interface Message {
  role: "system" | "user" | "assistant" | "function";
  content: string | ContentPart[];
  name?: string;
}

export interface ContentPart {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;
    detail?: "low" | "high";
  };
}

export interface ResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: boolean;
    schema: object;
  };
}

export interface ChatParams {
  messages: Message[];
  model?: string;
  responseFormat?: ResponseFormat;
  stream?: boolean;
  params?: {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
  };
}

export interface Model {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: number;
    completion: number;
  };
}

export interface ChatResponse {
  id: string;
  model: string;
  choices: {
    message: Message;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Error Classes
export class OpenRouterError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export class OpenRouterAuthError extends OpenRouterError {
  constructor(message: string, status?: number) {
    super(message, "auth_error", status);
    this.name = "OpenRouterAuthError";
  }
}

export class OpenRouterRateLimitError extends OpenRouterError {
  constructor(message: string, status?: number) {
    super(message, "rate_limit_error", status);
    this.name = "OpenRouterRateLimitError";
  }
}

export class OpenRouterNetworkError extends OpenRouterError {
  constructor(message: string, status?: number) {
    super(message, "network_error", status);
    this.name = "OpenRouterNetworkError";
  }
}

export class OpenRouterModelError extends OpenRouterError {
  constructor(message: string, status?: number) {
    super(message, "model_error", status);
    this.name = "OpenRouterModelError";
  }
}

export class OpenRouterFormatError extends OpenRouterError {
  constructor(message: string, status?: number) {
    super(message, "format_error", status);
    this.name = "OpenRouterFormatError";
  }
}

export class OpenRouterContentError extends OpenRouterError {
  constructor(message: string, status?: number) {
    super(message, "content_error", status);
    this.name = "OpenRouterContentError";
  }
}

export class OpenRouterService {
  private client: AxiosInstance;
  private defaultModel: string;
  private defaultParams: Required<OpenRouterServiceConfig["defaultParams"]>;
  private costLimitDaily: number | null = null;
  private dailyUsage: number = 0;
  private usageResetDate: Date = new Date();

  constructor({
    apiKey,
    defaultModel = "openai/gpt-4o-mini",
    baseUrl = "https://openrouter.ai/api/v1",
    defaultParams = {
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    },
  }: OpenRouterServiceConfig) {
    if (!apiKey) {
      throw new OpenRouterAuthError("API key is required");
    }

    this.defaultModel = defaultModel;
    this.defaultParams = defaultParams as Required<OpenRouterServiceConfig["defaultParams"]>;
    
    // Initialize axios client with base configuration
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://10xcards.com", // Replace with actual domain
        "X-Title": "10xCards", // Replace with actual app name
      },
      timeout: 30000, // 30 second timeout
    });

    // Try to load cost limit from environment variable
    const costLimit = process.env.OPENROUTER_COST_LIMIT_DAILY;
    if (costLimit) {
      this.costLimitDaily = parseFloat(costLimit);
    }
  }

  /**
   * Estimates the cost of a request based on token count and model pricing
   */
  private async estimateRequestCost(
    messages: Message[],
    model: string,
  ): Promise<number> {
    try {
      // Use approximate costs instead of fetching model info
      const approximateCosts = {
        prompt: 0.00001,      // $0.00001 per token
        completion: 0.00001,  // $0.00001 per token
      };

      // Rough token count estimation (this is a simple approximation)
      const tokenCount = messages.reduce((count, msg) => {
        if (typeof msg.content === "string") {
          // Rough estimate: 4 characters per token
          return count + Math.ceil(msg.content.length / 4);
        }
        return count + msg.content.reduce((partCount, part) => {
          if (part.type === "text" && part.text) {
            return partCount + Math.ceil(part.text.length / 4);
          }
          return partCount;
        }, 0);
      }, 0);

      // Calculate cost
      const promptCost = tokenCount * approximateCosts.prompt;
      // Estimate completion tokens as 50% of input tokens
      const completionCost = (tokenCount * 0.5) * approximateCosts.completion;

      return promptCost + completionCost;
    } catch (error) {
      // Even if cost estimation fails, we don't want to block the request
      console.warn("Cost estimation failed:", error);
      return 0;
    }
  }

  /**
   * Updates the daily usage tracking
   */
  private updateDailyUsage(cost: number): void {
    const now = new Date();
    
    // Reset usage if it's a new day
    if (now.getDate() !== this.usageResetDate.getDate() ||
        now.getMonth() !== this.usageResetDate.getMonth() ||
        now.getFullYear() !== this.usageResetDate.getFullYear()) {
      this.dailyUsage = 0;
      this.usageResetDate = now;
    }

    this.dailyUsage += cost;
  }

  /**
   * Checks if the request would exceed the daily cost limit
   */
  private async checkCostLimit(
    messages: Message[],
    model: string,
  ): Promise<void> {
    if (this.costLimitDaily === null) {
      return;
    }

    const estimatedCost = await this.estimateRequestCost(messages, model);
    
    if (this.dailyUsage + estimatedCost > this.costLimitDaily) {
      throw new OpenRouterError(
        `Request would exceed daily cost limit of $${this.costLimitDaily}`,
        "cost_limit_exceeded",
      );
    }
  }

  /**
   * Updates the daily cost limit
   */
  public setDailyCostLimit(limit: number | null): void {
    this.costLimitDaily = limit;
  }

  /**
   * Gets the current daily usage
   */
  public getDailyUsage(): number {
    return this.dailyUsage;
  }

  /**
   * Modified chat method to include cost limiting
   */
  public async chat(params: ChatParams): Promise<ChatResponse> {
    try {
      const model = params.model || this.defaultModel;
      
      // Check cost limit before making the request
      await this.checkCostLimit(params.messages, model);

      const requestBody = {
        model,
        messages: params.messages,
        stream: params.stream || false,
        response_format: params.responseFormat,
        ...this.defaultParams,
        ...params.params,
      };

      if (requestBody.stream) {
        const response = await this.handleStreamingChat(requestBody);
        // Update usage after successful response
        if (response.usage) {
          const cost = await this.estimateRequestCost(
            params.messages,
            model,
          );
          this.updateDailyUsage(cost);
        }
        return response;
      }

      const response = await this.makeRequest("/chat/completions", requestBody);
      const parsedResponse = this.parseResponse(response.data);
      
      // Update usage after successful response
      if (parsedResponse.usage) {
        const cost = await this.estimateRequestCost(
          params.messages,
          model,
        );
        this.updateDailyUsage(cost);
      }

      return parsedResponse;
    } catch (error) {
      this.handleError(error);
      throw error; // This line will never be reached due to handleError throwing
    }
  }

  /**
   * Makes a request to the OpenRouter API
   */
  private async makeRequest(endpoint: string, data: unknown) {
    try {
      return await this.client.post(endpoint, data);
    } catch (error) {
      this.handleError(error);
      throw error; // This line will never be reached due to handleError throwing
    }
  }

  /**
   * Handles streaming chat responses
   */
  private async handleStreamingChat(
    requestBody: unknown,
  ): Promise<ChatResponse> {
    try {
      const response = await this.client.post(
        "/chat/completions",
        requestBody,
        {
          responseType: "stream",
        },
      );

      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        let result: ChatResponse | null = null;

        response.data.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
          
          try {
            const lines = chunk
              .toString()
              .split("\n")
              .filter((line) => line.trim().startsWith("data: "));

            for (const line of lines) {
              const data = JSON.parse(line.slice(6)); // Remove "data: " prefix
              if (!result) {
                result = {
                  id: data.id,
                  model: data.model,
                  choices: [],
                  usage: {
                    prompt_tokens: 0,
                    completion_tokens: 0,
                    total_tokens: 0,
                  },
                };
              }

              if (data.choices?.[0]?.delta?.content) {
                const choice = result.choices[0] || {
                  message: {
                    role: "assistant",
                    content: "",
                  },
                  finish_reason: "",
                };

                choice.message.content += data.choices[0].delta.content;
                
                if (!result.choices[0]) {
                  result.choices.push(choice);
                }
              }

              if (data.choices?.[0]?.finish_reason) {
                result.choices[0].finish_reason = data.choices[0].finish_reason;
              }

              if (data.usage) {
                result.usage = data.usage;
              }
            }
          } catch (error) {
            // Ignore JSON parse errors for incomplete chunks
          }
        });

        response.data.on("end", () => {
          if (!result) {
            reject(new OpenRouterFormatError("No valid response in stream"));
            return;
          }
          resolve(result);
        });

        response.data.on("error", (error: Error) => {
          reject(new OpenRouterNetworkError(error.message));
        });
      });
    } catch (error) {
      this.handleError(error);
      throw error; // This line will never be reached due to handleError throwing
    }
  }

  /**
   * Parses the API response into a ChatResponse object
   */
  private parseResponse(response: unknown): ChatResponse {
    try {
      console.log("Raw API Response:", JSON.stringify(response, null, 2));
      
      // Check if response is already in ChatResponse format
      if (this.isValidChatResponse(response)) {
        console.log("Response is valid ChatResponse format");
        return response;
      }

      // If response is not in ChatResponse format, try to parse it as a raw response
      if (!response || typeof response !== "object") {
        console.log("Response is not an object:", response);
        throw new OpenRouterFormatError("Invalid response format from API");
      }

      const rawResponse = response as any;
      console.log("Attempting to parse as raw response:", {
        hasChoices: Boolean(rawResponse.choices),
        hasMessage: Boolean(rawResponse.choices?.[0]?.message),
        hasContent: Boolean(rawResponse.choices?.[0]?.message?.content)
      });
      
      // Check if this is a JSON schema response
      if (rawResponse.choices?.[0]?.message?.content) {
        console.log("Found content in response, converting to ChatResponse format");
        return {
          id: rawResponse.id || "unknown",
          model: rawResponse.model || "unknown",
          choices: [{
            message: {
              role: "assistant",
              content: rawResponse.choices[0].message.content
            },
            finish_reason: rawResponse.choices?.[0]?.finish_reason || "stop"
          }],
          usage: rawResponse.usage || {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0
          }
        };
      }

      console.log("Response does not match expected format");
      throw new OpenRouterFormatError("Invalid response format from API");
    } catch (error) {
      console.error("Error parsing response:", error);
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Type guard for ChatResponse
   */
  private isValidChatResponse(response: unknown): response is ChatResponse {
    if (!response || typeof response !== "object") {
      return false;
    }

    const chatResponse = response as Partial<ChatResponse>;

    return (
      typeof chatResponse.id === "string" &&
      typeof chatResponse.model === "string" &&
      Array.isArray(chatResponse.choices) &&
      chatResponse.choices.every(
        (choice) =>
          choice.message &&
          typeof choice.message.role === "string" &&
          (typeof choice.message.content === "string" ||
            Array.isArray(choice.message.content)) &&
          typeof choice.finish_reason === "string"
      ) &&
      typeof chatResponse.usage === "object" &&
      chatResponse.usage !== null &&
      typeof chatResponse.usage.prompt_tokens === "number" &&
      typeof chatResponse.usage.completion_tokens === "number" &&
      typeof chatResponse.usage.total_tokens === "number"
    );
  }

  /**
   * Retrieves the list of available models from OpenRouter
   */
  public async getAvailableModels(): Promise<Model[]> {
    try {
      const response = await this.makeRequest("/models", {});
      
      if (!Array.isArray(response.data)) {
        throw new OpenRouterFormatError("Invalid models response format");
      }

      return response.data.map((model: unknown) => {
        if (!this.isValidModel(model)) {
          throw new OpenRouterFormatError("Invalid model format in response");
        }
        return model;
      });
    } catch (error) {
      this.handleError(error);
      throw error; // This line will never be reached due to handleError throwing
    }
  }

  /**
   * Type guard for Model
   */
  private isValidModel(model: unknown): model is Model {
    if (!model || typeof model !== "object") {
      return false;
    }

    const modelData = model as Partial<Model>;

    return (
      typeof modelData.id === "string" &&
      typeof modelData.name === "string" &&
      typeof modelData.description === "string" &&
      typeof modelData.context_length === "number" &&
      typeof modelData.pricing === "object" &&
      modelData.pricing !== null &&
      typeof modelData.pricing.prompt === "number" &&
      typeof modelData.pricing.completion === "number"
    );
  }

  /**
   * Handles errors from the OpenRouter API
   */
  private handleError(error: unknown): never {
    if (this.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data as { error?: { message?: string } };
      const message = data?.error?.message || error.message;

      switch (status) {
        case 401:
        case 403:
          throw new OpenRouterAuthError(message, status);
        case 429:
          throw new OpenRouterRateLimitError(message, status);
        case 404:
          throw new OpenRouterModelError(message, status);
        case 400:
          throw new OpenRouterFormatError(message, status);
        case 422:
          throw new OpenRouterContentError(message, status);
        default:
          throw new OpenRouterNetworkError(
            message || "Network error occurred",
            status,
          );
      }
    }

    if (error instanceof OpenRouterError) {
      throw error;
    }

    throw new OpenRouterError(
      error instanceof Error ? error.message : "Unknown error occurred",
      "unknown_error",
    );
  }

  /**
   * Type guard for AxiosError
   */
  private isAxiosError(error: unknown): error is AxiosError {
    return axios.isAxiosError(error);
  }

  /**
   * Sets the default model for future requests
   */
  public setDefaultModel(model: string): void {
    this.defaultModel = model;
  }

  /**
   * Gets the current default model
   */
  public getDefaultModel(): string {
    return this.defaultModel;
  }

  /**
   * Updates default parameters for future requests
   */
  public setDefaultParams(params: Partial<OpenRouterServiceConfig["defaultParams"]>): void {
    this.defaultParams = {
      ...this.defaultParams,
      ...params,
    };
  }

  /**
   * Gets the current default parameters
   */
  public getDefaultParams(): Required<OpenRouterServiceConfig["defaultParams"]> {
    return { ...this.defaultParams };
  }

  /**
   * Updates the base URL for the API
   */
  public setBaseUrl(url: string): void {
    this.client = axios.create({
      ...this.client.defaults,
      baseURL: url,
    });
  }

  /**
   * Gets the current base URL
   */
  public getBaseUrl(): string {
    return this.client.defaults.baseURL as string;
  }

  /**
   * Updates the API key
   */
  public setApiKey(apiKey: string): void {
    if (!apiKey) {
      throw new OpenRouterAuthError("API key is required");
    }

    this.client = axios.create({
      ...this.client.defaults,
      headers: {
        ...this.client.defaults.headers,
        Authorization: `Bearer ${apiKey}`,
      },
    });
  }

  /**
   * Resets all configuration to default values
   */
  public resetConfig(): void {
    this.defaultModel = "openai/gpt-4o-mini";
    this.defaultParams = {
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    };
    this.costLimitDaily = null;
    this.dailyUsage = 0;
    this.usageResetDate = new Date();
  }
} 