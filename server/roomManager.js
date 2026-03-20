const rooms = {};

function generateRoomId() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

function createRoom(socketId, gameType, mode) {
  let roomId;
  do { roomId = generateRoomId(); } while (rooms[roomId]);

  rooms[roomId] = {
    id: roomId,
    gameType,
    mode,           // 1 = two devices, 2 = split screen + phone controllers
    host: socketId,
    players: [{ id: socketId, playerNum: 1 }],
    controllers: [], // for mode 2: phone sockets
    status: 'waiting',
  };
  return roomId;
}

function joinRoom(roomId, socketId) {
  const room = rooms[roomId];
  if (!room) return { error: 'Room not found' };
  if (room.mode === 1 && room.players.length >= 2) return { error: 'Room is full' };

  const playerNum = room.players.length + 1;
  room.players.push({ id: socketId, playerNum });
  return { room, playerNum };
}

function joinAsController(roomId, socketId, playerNum) {
  const room = rooms[roomId];
  if (!room) return { error: 'Room not found' };

  // Replace existing controller for same playerNum (re-join case)
  room.controllers = room.controllers.filter(c => c.playerNum !== parseInt(playerNum));
  room.controllers.push({ id: socketId, playerNum: parseInt(playerNum) });
  return { room };
}

function getRoom(roomId) {
  return rooms[roomId];
}

function removeSocket(socketId) {
  for (const roomId in rooms) {
    const room = rooms[roomId];
    const wasPlayer = room.players.some(p => p.id === socketId);
    const wasController = room.controllers.some(c => c.id === socketId);

    room.players = room.players.filter(p => p.id !== socketId);
    room.controllers = room.controllers.filter(c => c.id !== socketId);

    // If host left or no players remain, destroy the room
    if (room.host === socketId || room.players.length === 0) {
      delete rooms[roomId];
      return { roomId, destroyed: true };
    }

    if (wasPlayer || wasController) {
      return { roomId, destroyed: false };
    }
  }
  return null;
}

module.exports = { createRoom, joinRoom, joinAsController, getRoom, removeSocket };
