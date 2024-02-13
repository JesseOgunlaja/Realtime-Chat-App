import { io } from "socket.io-client";

const socket = io(process.env.WEBSOCKET_URL, {
  auth: {
    password: process.env.WEBSOCKET_KEY,
  },
  query: {
    test: "hi",
  },
});

export function trigger(id: string, event: string, data: unknown) {
  socket.emit(process.env.WEBSOCKET_KEY, id, event, data);
}
