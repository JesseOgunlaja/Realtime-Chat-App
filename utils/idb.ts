import { openDB } from "idb";

async function initDB() {
  const dbName = "my-db";
  const dbVersion = 1;

  return await openDB(dbName, dbVersion, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("data")) {
        db.createObjectStore("data", { autoIncrement: true });
      }
    },
  });
}

export async function setDataInIDB(key: string, data: unknown) {
  const db = await initDB();
  const tx = db.transaction("data", "readwrite");
  const store = tx.objectStore("data");
  if (await store.get(key)) {
    await store.put(data, key);
  } else {
    await store.add(data, key);
  }
}

export async function getDataFromIDB(key: string) {
  const db = await initDB();
  const tx = db.transaction("data", "readonly");
  const store = tx.objectStore("data");
  return await store.get(key);
}

export async function clearAllDataFromIDB() {
  const db = await initDB();
  const tx = db.transaction("data", "readwrite");
  const store = tx.objectStore("data");
  await store.clear();
}
