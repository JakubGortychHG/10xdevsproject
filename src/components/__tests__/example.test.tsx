import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// This is just an example - replace with your actual component
const ExampleButton = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) => <button onClick={onClick}>{children}</button>;

describe("ExampleButton", () => {
  it("renders correctly", () => {
    render(<ExampleButton onClick={() => { /* empty function */ }}>Click me</ExampleButton>);
    
    expect(
      screen.getByRole("button", { name: /click me/i }),
    ).toBeInTheDocument();
  });
  
  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    
    render(<ExampleButton onClick={onClick}>Click me</ExampleButton>);
    
    await user.click(screen.getByRole("button", { name: /click me/i }));
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });
}); 