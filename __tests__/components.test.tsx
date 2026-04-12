import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

// Componente simple para testear
function MessageBubble({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  return (
    <div
      data-testid="message"
      className={role === "user" ? "user-message" : "assistant-message"}
    >
      <span data-testid="role">{role === "user" ? "Vos" : "CodeMate"}</span>
      <p data-testid="content">{content}</p>
    </div>
  );
}

function FilePreview({
  filename,
  onRemove,
}: {
  filename: string;
  onRemove: () => void;
}) {
  return (
    <div data-testid="file-preview">
      <span data-testid="filename">{filename}</span>
      <button data-testid="remove-button" onClick={onRemove}>
        ✕
      </button>
    </div>
  );
}

describe("MessageBubble", () => {
  it("renderiza un mensaje del usuario correctamente", () => {
    render(<MessageBubble role="user" content="Hola CodeMate" />);
    expect(screen.getByTestId("role")).toHaveTextContent("Vos");
    expect(screen.getByTestId("content")).toHaveTextContent("Hola CodeMate");
  });

  it("renderiza un mensaje del asistente correctamente", () => {
    render(
      <MessageBubble
        role="assistant"
        content="Hola, ¿en qué puedo ayudarte?"
      />,
    );
    expect(screen.getByTestId("role")).toHaveTextContent("CodeMate");
    expect(screen.getByTestId("content")).toHaveTextContent(
      "Hola, ¿en qué puedo ayudarte?",
    );
  });

  it("aplica la clase correcta según el rol", () => {
    const { rerender } = render(<MessageBubble role="user" content="test" />);
    expect(screen.getByTestId("message")).toHaveClass("user-message");

    rerender(<MessageBubble role="assistant" content="test" />);
    expect(screen.getByTestId("message")).toHaveClass("assistant-message");
  });
});

describe("FilePreview", () => {
  it("muestra el nombre del archivo", () => {
    render(<FilePreview filename="index.ts" onRemove={() => {}} />);
    expect(screen.getByTestId("filename")).toHaveTextContent("index.ts");
  });

  it("renderiza el botón de eliminar", () => {
    render(<FilePreview filename="index.ts" onRemove={() => {}} />);
    expect(screen.getByTestId("remove-button")).toBeInTheDocument();
  });
});
