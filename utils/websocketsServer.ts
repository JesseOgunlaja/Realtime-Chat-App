import { io } from "socket.io-client";

const socket = io(process.env.WEBSOCKET_URL, {
  auth: {
    password: process.env.WEBSOCKET_KEY,
  },
});

export function trigger(id: string, event: string, data: unknown) {
  console.log(process.env.WEBSOCKET_KEY);
  console.log(process.env.WEBSOCKET_URL);
  socket.emit(process.env.WEBSOCKET_KEY, id, event, data);
}
