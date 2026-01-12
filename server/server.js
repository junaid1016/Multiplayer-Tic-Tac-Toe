const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { createGame, makeMove } = require("./game/gameManager");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = 3001;

// Lobby + Games
const lobbyUsers = new Map(); // socketId => { id }
const games = new Map(); // roomId => game

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // Add to lobby
  lobbyUsers.set(socket.id, { id: socket.id });
  io.emit("lobbyUsers", Array.from(lobbyUsers.values()));

  // Send duel request
  socket.on("sendDuelRequest", (targetId) => {
    io.to(targetId).emit("duelRequest", { from: socket.id });
  });

  // Accept duel
  socket.on("acceptDuel", ({ from }) => {
    const roomId = `game-${from}-${socket.id}`;

    socket.join(roomId);
    io.to(from).socketsJoin(roomId);

    const game = createGame(roomId, from, socket.id);
    games.set(roomId, game);

    io.to(roomId).emit("gameStart", {
      roomId,
      players: game.players
    });
  });

  // Make move
  socket.on("makeMove", ({ roomId, index }) => {
    const game = games.get(roomId);
    if (!game) return;

    const result = makeMove(game, socket.id, index);
    if (!result) return;

    io.to(roomId).emit("gameUpdate", result);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
    lobbyUsers.delete(socket.id);
    io.emit("lobbyUsers", Array.from(lobbyUsers.values()));
    console.log("Lobbys: ", lobbyUsers);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
