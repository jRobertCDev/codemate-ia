import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

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
  fileType,
  onRemove,
}: {
  filename: string;
  fileType: string;
  onRemove: () => void;
}) {
  const isImage = fileType.startsWith("image/");
  return (
    <div data-testid="file-preview">
      {isImage ? (
        <img data-testid="image-preview" alt="preview" />
      ) : (
        <span data-testid="file-icon">📄</span>
      )}
      <span data-testid="filename">{filename}</span>
      <button data-testid="remove-button" onClick={onRemove}>
        ✕
      </button>
    </div>
  );
}

function ConversationItem({
  title,
  isActive,
  onClick,
  onDelete,
}: {
  title: string;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      data-testid="conversation-item"
      className={isActive ? "active" : ""}
      onClick={onClick}
    >
      <span data-testid="conversation-title">{title}</span>
      <button
        data-testid="delete-button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
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
    render(
      <FilePreview
        filename="index.ts"
        fileType="text/plain"
        onRemove={() => {}}
      />,
    );
    expect(screen.getByTestId("filename")).toHaveTextContent("index.ts");
  });

  it("muestra ícono de documento para archivos de código", () => {
    render(
      <FilePreview
        filename="index.ts"
        fileType="text/plain"
        onRemove={() => {}}
      />,
    );
    expect(screen.getByTestId("file-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("image-preview")).not.toBeInTheDocument();
  });

  it("muestra preview de imagen para archivos de imagen", () => {
    render(
      <FilePreview
        filename="foto.png"
        fileType="image/png"
        onRemove={() => {}}
      />,
    );
    expect(screen.getByTestId("image-preview")).toBeInTheDocument();
    expect(screen.queryByTestId("file-icon")).not.toBeInTheDocument();
  });

  it("llama onRemove al hacer click en el botón", () => {
    const onRemove = vi.fn();
    render(
      <FilePreview
        filename="index.ts"
        fileType="text/plain"
        onRemove={onRemove}
      />,
    );
    fireEvent.click(screen.getByTestId("remove-button"));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});

describe("ConversationItem", () => {
  it("muestra el título de la conversación", () => {
    render(
      <ConversationItem
        title="Mi primera conversación"
        isActive={false}
        onClick={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(screen.getByTestId("conversation-title")).toHaveTextContent(
      "Mi primera conversación",
    );
  });

  it("aplica clase active cuando está seleccionada", () => {
    render(
      <ConversationItem
        title="Test"
        isActive={true}
        onClick={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(screen.getByTestId("conversation-item")).toHaveClass("active");
  });

  it("llama onClick al hacer click en la conversación", () => {
    const onClick = vi.fn();
    render(
      <ConversationItem
        title="Test"
        isActive={false}
        onClick={onClick}
        onDelete={() => {}}
      />,
    );
    fireEvent.click(screen.getByTestId("conversation-item"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("llama onDelete sin propagar el click al item", () => {
    const onClick = vi.fn();
    const onDelete = vi.fn();
    render(
      <ConversationItem
        title="Test"
        isActive={false}
        onClick={onClick}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByTestId("delete-button"));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });
});
