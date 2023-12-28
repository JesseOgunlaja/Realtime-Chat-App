import CryptoJS from "crypto-js";

const ENCRYPTION_CLIENT = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
const ENCRYPTION_SERVER = process.env.ENCRYPTION_KEY;

export function encryptString(value: string, client: boolean) {
  const encrypted = CryptoJS.AES.encrypt(
    value,
    client ? ENCRYPTION_CLIENT : ENCRYPTION_SERVER
  ).toString();
  return encrypted;
}

export function decryptString(value: string, client: boolean) {
  const decrypted = CryptoJS.AES.decrypt(
    value,
    client ? ENCRYPTION_CLIENT : ENCRYPTION_SERVER
  ).toString(CryptoJS.enc.Utf8);
  return decrypted;
}
