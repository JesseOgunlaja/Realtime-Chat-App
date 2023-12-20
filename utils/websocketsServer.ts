import { io, Socket } from "socket.io-client";

export function getSocket() {
  return io(process.env.WEBSOCKET_URL, {
    auth: {
      password: process.env.WEBSOCKET_KEY,
    },
  });
}

export function trigger(
  socket: Socket,
  id: string,
  event: string,
  data: unknown
) {
  socket.emit(process.env.WEBSOCKET_KEY, id, event, data);
}
