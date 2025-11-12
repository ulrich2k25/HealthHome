//frontend/src/app/lib/socket.ts
import io from "socket.io-client";

let socket: ReturnType<typeof io> | null = null;

/**
 * 🔹 Retourne une instance Socket.io réutilisable
 */
export const getSocket = (): ReturnType<typeof io> => {
  if (!socket) {
    socket = io("http://localhost:4000", {
      withCredentials: true,
      transports: ["websocket"],
    } as any);
  }
  return socket;
};
