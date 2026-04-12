import { describe, it, expect, vi } from "vitest";

// Testeamos la lógica del sistema prompt
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
