export function truncateText(text: string, maxLength: number): string {
  if (maxLength < 0) {
    throw new Error("maxLength must be greater than or equal to 0");
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
}
