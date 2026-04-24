import { io, Socket } from 'socket.io-client';

// Derive socket URL from API URL.
// NEXT_PUBLIC_API_URL is e.g. "https://api-cityfix.itninja.co.il/api"
// We need the base origin without the /api path suffix.
function getSocketUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100/api';
  try {
    const url = new URL(apiUrl);
    return url.origin; // e.g. "https://api-cityfix.itninja.co.il"
  } catch {
    // Fallback: strip trailing /api path only
    return apiUrl.replace(/\/api\/?$/, '') || 'http://localhost:4100';
  }
}

const SOCKET_URL = getSocketUrl();

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};
