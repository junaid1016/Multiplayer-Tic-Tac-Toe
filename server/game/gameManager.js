const { calculateWinner } = require("./gameLogic");

function createGame(roomId, playerX, playerO) {
  return {
    roomId,
    board: Array(9).fill(null),
    currentTurn: "X",
    players: {
      X: playerX,
      O: playerO
    }
  };
}

function makeMove(game, socketId, index) {
  const symbol = Object.keys(game.players)
    .find(k => game.players[k] === socketId);

  if (symbol !== game.currentTurn) return null;
  if (game.board[index]) return null;

  game.board[index] = symbol;

  const winner = calculateWinner(game.board);
  if (winner) {
    return {
      board: game.board,
      winner,
      currentTurn: null
    };
  }

  game.currentTurn = game.currentTurn === "X" ? "O" : "X";

  return {
    board: game.board,
    winner: null,
    currentTurn: game.currentTurn
  };
}

module.exports = { createGame, makeMove };
