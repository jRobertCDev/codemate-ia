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

function isImageFile(fileType: string): boolean {
  return fileType.startsWith("image/");
}

type TextContent = { type: string; text: string };
type ImageContent = { type: string; image: string };
type MessageContent = string | TextContent | ImageContent;

interface ProcessedMessage {
  role: string;
  content: MessageContent | MessageContent[];
}

function buildMessagesWithImage(
  messages: { role: string; content: string }[],
  imageBase64: string,
  imageMimeType: string,
): ProcessedMessage[] {
  return messages.map((m, index) => {
    if (index === messages.length - 1 && m.role === "user") {
      return {
        role: "user",
        content: [
          { type: "text", text: m.content } as TextContent,
          {
            type: "image",
            image: `data:${imageMimeType};base64,${imageBase64}`,
          } as ImageContent,
        ],
      };
    }
    return m;
  });
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

describe("isImageFile", () => {
  it("devuelve true para tipos de imagen", () => {
    expect(isImageFile("image/png")).toBe(true);
    expect(isImageFile("image/jpeg")).toBe(true);
    expect(isImageFile("image/gif")).toBe(true);
    expect(isImageFile("image/webp")).toBe(true);
  });

  it("devuelve false para tipos que no son imagen", () => {
    expect(isImageFile("text/plain")).toBe(false);
    expect(isImageFile("application/pdf")).toBe(false);
    expect(isImageFile("application/json")).toBe(false);
  });
});

describe("buildMessagesWithImage", () => {
  it("agrega la imagen al último mensaje del usuario", () => {
    const messages = [{ role: "user", content: "¿Qué ves en esta imagen?" }];
    const result = buildMessagesWithImage(messages, "base64data", "image/png");
    const lastMessage = result[result.length - 1];
    const content = lastMessage.content as MessageContent[];

    expect(Array.isArray(content)).toBe(true);
    expect(content).toHaveLength(2);
    expect(content[0]).toEqual({
      type: "text",
      text: "¿Qué ves en esta imagen?",
    });
    expect(content[1]).toEqual({
      type: "image",
      image: "data:image/png;base64,base64data",
    });
  });

  it("no modifica mensajes anteriores", () => {
    const messages = [
      { role: "user", content: "Primer mensaje" },
      { role: "assistant", content: "Primera respuesta" },
      { role: "user", content: "¿Qué ves en esta imagen?" },
    ];
    const result = buildMessagesWithImage(messages, "base64data", "image/png");

    expect(result[0]).toEqual(messages[0]);
    expect(result[1]).toEqual(messages[1]);
    expect(Array.isArray(result[2].content)).toBe(true);
  });

  it("construye el data URL correctamente", () => {
    const messages = [{ role: "user", content: "test" }];
    const result = buildMessagesWithImage(messages, "abc123", "image/jpeg");
    const lastMessage = result[result.length - 1];
    const content = lastMessage.content as MessageContent[];
    const imageContent = content[1] as ImageContent;

    expect(imageContent.image).toBe("data:image/jpeg;base64,abc123");
  });
});

function checkRateLimit(
  userId: string,
  map: Map<string, { count: number; resetTime: number }>,
  maxRequests = 20,
): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const userLimit = map.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    map.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) return false;

  userLimit.count++;
  return true;
}

describe("checkRateLimit", () => {
  it("permite el primer request", () => {
    const map = new Map();
    expect(checkRateLimit("user-1", map)).toBe(true);
  });

  it("permite hasta el máximo de requests", () => {
    const map = new Map();
    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit("user-1", map)).toBe(true);
    }
  });

  it("bloquea cuando se supera el límite", () => {
    const map = new Map();
    for (let i = 0; i < 20; i++) {
      checkRateLimit("user-1", map);
    }
    expect(checkRateLimit("user-1", map)).toBe(false);
  });

  it("no afecta a otros usuarios", () => {
    const map = new Map();
    for (let i = 0; i < 20; i++) {
      checkRateLimit("user-1", map);
    }
    expect(checkRateLimit("user-2", map)).toBe(true);
  });
});
