/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { io, Socket } from "socket.io-client";
import { encryptString } from "./encryption";

export function trigger(id: string, event: string, msg: unknown) {
  fetch(`${process.env.WEBSOCKET_URL}/emit-event`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      event,
      msg,
      password: process.env.WEBSOCKET_KEY,
    }),
  });
}

export function websocketChannel(key: string) {
  const encryptedString = encryptString(key, true) as string;
  const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL, {
    auth: {
      token: encryptedString,
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
  connections.forEach((connection) => {
    socket.on(connection.event, (data) => {
      connection.receiveFunction(data);
    });
  });
}

function disconnectSocket(socket: Socket) {
  socket.disconnect();
}
