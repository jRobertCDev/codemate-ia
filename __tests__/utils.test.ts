import { describe, it, expect } from "vitest";

// Función que vamos a testear
function getGreeting(hour: number): string {
  if (hour >= 6 && hour < 12) return "Buenos días";
  if (hour >= 12 && hour < 18) return "Buenas tardes";
  return "Buenas noches";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isValidFileType(filename: string): boolean {
  const validExtensions = [
    ".js",
    ".ts",
    ".tsx",
    ".jsx",
    ".py",
    ".java",
    ".cpp",
    ".c",
    ".cs",
    ".go",
    ".rs",
    ".html",
    ".css",
    ".json",
    ".md",
    ".txt",
    ".pdf",
  ];
  return validExtensions.some((ext) => filename.endsWith(ext));
}

describe("getGreeting", () => {
  it("devuelve buenos días entre las 6 y 12", () => {
    expect(getGreeting(6)).toBe("Buenos días");
    expect(getGreeting(9)).toBe("Buenos días");
    expect(getGreeting(11)).toBe("Buenos días");
  });

  it("devuelve buenas tardes entre las 12 y 18", () => {
    expect(getGreeting(12)).toBe("Buenas tardes");
    expect(getGreeting(15)).toBe("Buenas tardes");
    expect(getGreeting(17)).toBe("Buenas tardes");
  });

  it("devuelve buenas noches entre las 18 y 6", () => {
    expect(getGreeting(18)).toBe("Buenas noches");
    expect(getGreeting(22)).toBe("Buenas noches");
    expect(getGreeting(0)).toBe("Buenas noches");
  });
});

describe("formatFileSize", () => {
  it("formatea bytes correctamente", () => {
    expect(formatFileSize(500)).toBe("500 B");
  });

  it("formatea kilobytes correctamente", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(2048)).toBe("2.0 KB");
  });

  it("formatea megabytes correctamente", () => {
    expect(formatFileSize(1024 * 1024)).toBe("1.0 MB");
  });
});

describe("isValidFileType", () => {
  it("acepta archivos de código válidos", () => {
    expect(isValidFileType("index.ts")).toBe(true);
    expect(isValidFileType("component.tsx")).toBe(true);
    expect(isValidFileType("script.py")).toBe(true);
    expect(isValidFileType("readme.md")).toBe(true);
    expect(isValidFileType("document.pdf")).toBe(true);
  });

  it("rechaza archivos inválidos", () => {
    expect(isValidFileType("image.png")).toBe(false);
    expect(isValidFileType("video.mp4")).toBe(false);
    expect(isValidFileType("archive.zip")).toBe(false);
  });
});
