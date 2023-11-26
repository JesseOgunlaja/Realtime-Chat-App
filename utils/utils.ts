export const compareObjects = (
  x: Record<string, unknown>,
  y: Record<string, unknown>
) => {
  const srt = (obj: Record<string, unknown>) =>
    JSON.stringify(obj)?.split("").sort().join("");
  return srt(x) === srt(y);
};

export function containsEmoji(string: string) {
  const emojiRegex = /[\p{Emoji}]/u;
  return emojiRegex.test(string);
}
