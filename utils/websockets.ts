import { io, Socket } from "socket.io-client";

const WEBSOCKET_URL =
  process.env.NEXT_PUBLIC_WEBSOCKET_URL || process.env.WEBSOCKET_URL;

export function trigger(id: string, event: string, data: unknown) {
  const socket = io(WEBSOCKET_URL);
  socket.emit(process.env.WEBSOCKET_KEY, id, event, data);
}

export function websocketChannel(key: string) {
  const socket = io(WEBSOCKET_URL);

  return {
    bindToEvents: (
      connections: { event: string; receiveFunction: (data: any) => any }[]
    ) => {
      bindToEvents(socket, key, connections);
    },
    disconnect: () => {
      disconnectSocket(socket);
    },
  };
}

function bindToEvents(
  socket: Socket,
  id: string,
  connections: { event: string; receiveFunction: (data: any) => any }[]
) {
  socket.on(id, (message, data) => {
    connections.forEach((connection) => {
      if (connection.event === message) {
        connection.receiveFunction(data);
      }
    });
  });
}

function disconnectSocket(socket: Socket) {
  socket.disconnect();
}
