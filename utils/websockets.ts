import { io, Socket } from "socket.io-client";
import { encryptString } from "./encryption";

const WEBSOCKET_URL =
  process.env.NEXT_PUBLIC_WEBSOCKET_URL || process.env.WEBSOCKET_URL;

export function trigger(id: string, event: string, data: unknown) {
  const socket = io(WEBSOCKET_URL, {
    auth: {
      password: process.env.WEBSOCKET_KEY,
    },
  });
  socket.emit(process.env.WEBSOCKET_KEY, id, event, data);
}

export function websocketChannel(key: string) {
  const socket = io(WEBSOCKET_URL, {
    auth: {
      token: encryptString(key, true),
    },
    query: {
      id: key,
    },
  });

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
