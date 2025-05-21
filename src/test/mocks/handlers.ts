import { http, HttpResponse } from "msw";

// Define your API mocks here
export const handlers = [
  // Example handler
  http.get("/api/example", () => {
    return HttpResponse.json({
      status: "success",
      data: {
        message: "This is a mocked API response",
      },
    });
  }),
  
  // Add more handlers as needed
]; 