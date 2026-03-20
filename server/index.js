const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const {
  createRoom,
  joinRoom,
  joinAsController,
  getRoom,
  removeSocket,
} = require('./roomManager');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.get('/', (req, res) => res.send('🎮 Playmates server is running!'));

// ─── Socket Events ────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[+] Connected: ${socket.id}`);

  // ── Create Room (host) ──────────────────────────────────────────────────────
  socket.on('create-room', ({ gameType, mode }) => {
    const roomId = createRoom(socket.id, gameType, mode);
    socket.join(roomId);
    socket.emit('room-created', { roomId, playerNum: 1 });
    console.log(`[Room] ${roomId} created | game: ${gameType} | mode: ${mode}`);
  });

  // ── Join Room (guest, Mode 1 only) ──────────────────────────────────────────
  socket.on('join-room', ({ roomId }) => {
    const result = joinRoom(roomId.toUpperCase(), socket.id);

    if (result.error) {
      socket.emit('join-error', { message: result.error });
      return;
    }

    socket.join(roomId.toUpperCase());
    socket.emit('room-joined', { roomId: roomId.toUpperCase(), playerNum: result.playerNum });
    io.to(roomId.toUpperCase()).emit('player-joined', { playerCount: result.room.players.length });

    // Both players in room → start game
    if (result.room.players.length === 2) {
      io.to(roomId.toUpperCase()).emit('game-start');
      console.log(`[Room] ${roomId.toUpperCase()} game-start (mode 1)`);
    }
  });

  // ── Join as Phone Controller (Mode 2) ───────────────────────────────────────
  socket.on('join-controller', ({ roomId, playerNum }) => {
    const result = joinAsController(roomId.toUpperCase(), socket.id, playerNum);

    if (result.error) {
      socket.emit('join-error', { message: result.error });
      return;
    }

    socket.join(roomId.toUpperCase());
    socket.emit('controller-joined', { roomId: roomId.toUpperCase(), playerNum, gameType: result.room.gameType });

    const room = getRoom(roomId.toUpperCase());
    io.to(roomId.toUpperCase()).emit('controller-connected', {
      playerNum,
      controllerCount: room.controllers.length,
    });

    // Both phone controllers connected → start game
    if (room.controllers.length === 2) {
      io.to(roomId.toUpperCase()).emit('game-start');
      console.log(`[Room] ${roomId.toUpperCase()} game-start (mode 2)`);
    }
  });

  // ── Player Input ─────────────────────────────────────────────────────────────
  // Relays input from guest/controller to everyone else in the room
  // { roomId, playerNum, input: { up: bool, down: bool } }
  socket.on('player-input', ({ roomId, playerNum, input }) => {
    socket.to(roomId).emit('player-input', { playerNum, input });
  });

  // ── Game State Broadcast (host → everyone else) ──────────────────────────────
  socket.on('game-state', ({ roomId, state }) => {
    socket.to(roomId).emit('game-state', state);
  });

  // ── Disconnect ───────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const result = removeSocket(socket.id);
    if (result) {
      io.to(result.roomId).emit('player-disconnected', { destroyed: result.destroyed });
      console.log(`[-] ${socket.id} left room ${result.roomId}`);
    }
    console.log(`[-] Disconnected: ${socket.id}`);
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🎮 Playmates server running on http://localhost:${PORT}\n`);
});
