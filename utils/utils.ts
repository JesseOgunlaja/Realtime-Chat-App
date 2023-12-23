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

export function getNewReference(val: unknown) {
  return JSON.parse(JSON.stringify(val));
}

export function removeUndefinedFromObject<T>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj as Record<string, unknown>).filter(
      ([key, value]) => value !== undefined
    )
  ) as T;
}
