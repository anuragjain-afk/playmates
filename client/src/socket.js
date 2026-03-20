import { io } from 'socket.io-client';

// In development, the Vite proxy forwards /socket.io → localhost:3001
// In production, change this to your deployed server URL
const SERVER_URL = '';

const socket = io(SERVER_URL, {
  autoConnect: true,
  reconnectionAttempts: 5,
});

socket.on('connect', () => console.log('[Socket] Connected:', socket.id));
socket.on('disconnect', () => console.log('[Socket] Disconnected'));

export default socket;
