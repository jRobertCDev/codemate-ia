import { describe, it, expect } from "vitest";

function buildSystemPrompt(fileContent: string): string {
  if (fileContent) {
    return `Sos CodeMate, un asistente experto en programación.
      Respondés siempre en español con formato markdown.
      
      El usuario subió este archivo:
      \`\`\`
      ${fileContent}
      \`\`\``;
  }
  return `Sos CodeMate, un asistente experto en programación.
      Respondés siempre en español con formato markdown.`;
}

function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  return authHeader.replace("Bearer ", "");
}

function buildConversationTitle(firstMessage: string): string {
  return firstMessage.slice(0, 50);
}

function isFirstMessage(messagesLength: number): boolean {
  return messagesLength === 1;
}

describe("buildSystemPrompt", () => {
  it("devuelve el prompt base cuando no hay archivo", () => {
    const prompt = buildSystemPrompt("");
    expect(prompt).toContain("CodeMate");
    expect(prompt).toContain("markdown");
    expect(prompt).not.toContain("usuario subió");
  });

  it("incluye el contenido del archivo cuando existe", () => {
    const prompt = buildSystemPrompt("const x = 1");
    expect(prompt).toContain("usuario subió");
    expect(prompt).toContain("const x = 1");
  });
});

describe("extractToken", () => {
  it("extrae el token del header Authorization", () => {
    expect(extractToken("Bearer mi-token-123")).toBe("mi-token-123");
  });

  it("devuelve null si no hay header", () => {
    expect(extractToken(null)).toBeNull();
  });
});

describe("buildConversationTitle", () => {
  it("usa el mensaje completo si tiene menos de 50 caracteres", () => {
    expect(buildConversationTitle("Hola CodeMate")).toBe("Hola CodeMate");
  });

  it("trunca el mensaje a 50 caracteres", () => {
    const longMessage =
      "Este es un mensaje muy largo que supera los cincuenta caracteres permitidos";
    expect(buildConversationTitle(longMessage)).toHaveLength(50);
  });
});

describe("isFirstMessage", () => {
  it("devuelve true si es el primer mensaje", () => {
    expect(isFirstMessage(1)).toBe(true);
  });

  it("devuelve false si hay más de un mensaje", () => {
    expect(isFirstMessage(2)).toBe(false);
    expect(isFirstMessage(5)).toBe(false);
  });
});
