import { io, Socket } from 'socket.io-client';

declare global {
  interface Window {
    socket: Socket;
    roomId: number;
  }
}

window.socket = io();
