/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { io, Socket } from "socket.io-client";
import { encryptString } from "./encryption";

export function websocketChannel(key: string) {
  const encryptedString = encryptString(key, true);
  const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL, {
    auth: {
      token: String(encryptedString),
    },
    query: {
      id: key,
    },
  });

  return {
    bindToEvents: (
      connections: {
        event: string;
        receiveFunction: (data: any) => void;
      }[]
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
  connections: {
    event: string;
    receiveFunction: (data: any) => void;
  }[]
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
