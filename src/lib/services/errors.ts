export class FlashcardServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FlashcardServiceError";
  }
}

export class DatabaseError extends FlashcardServiceError {
  constructor(
    message: string,
    public readonly originalError: unknown,
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class NoDataError extends FlashcardServiceError {
  constructor(message = "No data returned from database") {
    super(message);
    this.name = "NoDataError";
  }
}
