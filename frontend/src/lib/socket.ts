// lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Retourne une instance Socket.io réutilisable.
 */
export const getSocket = (): Socket => {
  if (!socket) {
    // ⚠️ Remplace l’URL par celle de ton backend
    socket = io("http://localhost:4000", {
      withCredentials: true,
      transports: ["websocket"],
    });
  }
  return socket;
};
