import { useEffect, useState } from "react";
import "./App.css";
import {io} from 'socket.io-client';

const socket = io("http://localhost:3001");

socket.on('PlayerJoin', (socket) => {
  console.log("User connected", socket.id);
})

export default function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [player, setPlayer] = useState(null);
  const [currentTurn, setCurrentTurn] = useState("X");
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    
    socket.on('assignPlayer', (symbol) => {
      setPlayer(symbol);
    });

    socket.on('gameState', (state) => {
      setBoard(state.board);
      setCurrentTurn(state.currentTurn);
      setTimeout(() => {
        setWinner(null);
      }, 2000);
    });

    socket.on('gameUpdate', (data) => {
      setBoard(data.board);
      setCurrentTurn(data.currentTurn);
      setWinner(data.winner);
    });

  }, []);

  function handleClick(index){
    if(winner) return;
    if(player !== currentTurn) return;
    socket.emit("makeMove", index)
  }

  return (
    <div className="app">
      <h1>Tic Tac Toe</h1>

      <p>
        {winner
          ? `Winner: ${winner}`
          : `Your Symbol: ${player || "Spectator"} | Turn: ${currentTurn}`}
      </p>

      <div className="board">
        {board.map((cell, i) => (
          <button key={i} className = 'cell' onClick={() => handleClick(i)}>
            {cell}
          </button>
        ))}
      </div>
    </div>
  );

}