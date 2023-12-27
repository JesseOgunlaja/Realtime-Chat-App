import { FormEvent } from "react";

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

export function getNewReference<T>(val: T): T {
  return JSON.parse(JSON.stringify(val));
}

export function removeUndefinedFromObject<T>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj as Record<string, unknown>).filter(
      ([key, value]) => value !== undefined
    )
  ) as T;
}

export function getFormValues(e: FormEvent<HTMLFormElement>) {
  const formData = new FormData(e.currentTarget);
  const formValues = Object.fromEntries(formData.entries());
  return formValues;
}

export function renderChatMessage(message: string) {
  if (containsEmoji(message)) {
    return message.replace(/\\u[\dA-Fa-f]{4}/g, function (match) {
      return String.fromCharCode(parseInt(match.slice(2), 16));
    });
  }
  return message;
}
