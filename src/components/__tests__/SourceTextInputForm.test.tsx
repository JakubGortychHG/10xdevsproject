import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SourceTextInputForm from "../SourceTextInputForm";

describe("SourceTextInputForm", () => {
  const mockSubmit = vi.fn();
  const validText = "A".repeat(1000); // Valid text with 1000 characters
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with empty initial text", () => {
    render(
      <SourceTextInputForm 
        onSubmit={mockSubmit} 
        isLoading={false} 
      />
    );
    
    // Check if the form elements are rendered
    expect(screen.getByLabelText(/tekst źródłowy/i)).toBeInTheDocument();
    expect(screen.getByText(/0\/10000 znaków/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generuj fiszki/i })).toBeDisabled();
  });

  it("renders correctly with initial text", () => {
    render(
      <SourceTextInputForm 
        onSubmit={mockSubmit} 
        isLoading={false}
        initialText={validText}
      />
    );
    
    // Check if the input has the initial text
    const textArea = screen.getByLabelText(/tekst źródłowy/i);
    expect(textArea).toHaveValue(validText);
    expect(screen.getByText(/1000\/10000 znaków/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generuj fiszki/i })).toBeEnabled();
  });

  it("disables the form when loading", () => {
    render(
      <SourceTextInputForm 
        onSubmit={mockSubmit} 
        isLoading={true}
        initialText={validText}
      />
    );
    
    // Check if the input and button are disabled
    expect(screen.getByLabelText(/tekst źródłowy/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /generowanie\.\.\./i })).toBeDisabled();
  });

  it("shows error when text is too short", async () => {
    const user = userEvent.setup();
    
    render(
      <SourceTextInputForm 
        onSubmit={mockSubmit} 
        isLoading={false}
      />
    );
    
    // Type short text
    const textArea = screen.getByLabelText(/tekst źródłowy/i);
    await user.type(textArea, "Short text");
    
    // Try to submit the form
    const submitButton = screen.getByRole("button", { name: /generuj fiszki/i });
    expect(submitButton).toBeDisabled();
  });

  it("shows validation error when trying to submit invalid text directly", async () => {
    render(
      <SourceTextInputForm 
        onSubmit={mockSubmit} 
        isLoading={false}
      />
    );
    
    // Set invalid text directly in the textarea (bypassing disabled button)
    const textArea = screen.getByLabelText(/tekst źródłowy/i);
    fireEvent.change(textArea, { target: { value: "Short text" } });
    
    // Manually trigger form submission (bypassing disabled button)
    const form = screen.getByTestId("source-form");
    fireEvent.submit(form);
    
    // Check if error message is shown
    expect(screen.getByText(/tekst źródłowy musi zawierać co najmniej 1000 znaków/i)).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("submits the form with valid text", async () => {
    const user = userEvent.setup();
    
    render(
      <SourceTextInputForm 
        onSubmit={mockSubmit} 
        isLoading={false}
      />
    );
    
    // Set valid text
    const textArea = screen.getByLabelText(/tekst źródłowy/i);
    fireEvent.change(textArea, { target: { value: validText } });
    
    // Submit the form
    const submitButton = screen.getByRole("button", { name: /generuj fiszki/i });
    await user.click(submitButton);
    
    // Check if onSubmit was called with correct data
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({ source_text: validText });
  });

  it("shows error when text is too long", async () => {
    const user = userEvent.setup();
    const tooLongText = "A".repeat(10001); // 10001 characters
    
    render(
      <SourceTextInputForm 
        onSubmit={mockSubmit} 
        isLoading={false}
      />
    );
    
    // Set too long text
    const textArea = screen.getByLabelText(/tekst źródłowy/i);
    fireEvent.change(textArea, { target: { value: tooLongText } });
    
    // Try to submit the form
    const form = screen.getByTestId("source-form");
    fireEvent.submit(form);
    
    // Check if error message is shown
    expect(screen.getByText(/tekst źródłowy nie może przekraczać 10000 znaków/i)).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("resets error message when input changes", async () => {
    const user = userEvent.setup();
    
    render(
      <SourceTextInputForm 
        onSubmit={mockSubmit} 
        isLoading={false}
      />
    );
    
    // Submit with invalid text to trigger error
    const textArea = screen.getByLabelText(/tekst źródłowy/i);
    fireEvent.change(textArea, { target: { value: "Short text" } });
    const form = screen.getByTestId("source-form");
    fireEvent.submit(form);
    
    // Check if error is shown
    expect(screen.getByText(/tekst źródłowy musi zawierać co najmniej 1000 znaków/i)).toBeInTheDocument();
    
    // Change the input text
    await user.type(textArea, " more text");
    
    // Error should disappear
    expect(screen.queryByText(/tekst źródłowy musi zawierać co najmniej 1000 znaków/i)).not.toBeInTheDocument();
  });
}); 