import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { server } from "./mocks/server";

// Extend Vitest's expect with Jest DOM matchers
// Now we can use toBeInTheDocument() and other matchers

// Setup for MSW
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  cleanup(); // Cleanup after each test
  server.resetHandlers(); // Reset handlers between tests
});
afterAll(() => server.close()); 