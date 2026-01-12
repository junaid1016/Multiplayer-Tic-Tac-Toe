import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("https://multiplayer-tic-tac-toe-xlhz.vercel.app:3001/", {
  autoConnect: false,
});

export default function App() {
  const [lobbyUsers, setLobbyUsers] = useState([]);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [roomId, setRoomId] = useState(null);

  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState(null);
  const [winner, setWinner] = useState(null);

  const [isRequesting, setIsRequesting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const [mySymbol, setMySymbol] = useState("O");

  useEffect(() => {

    socket.connect();

    socket.on("lobbyUsers", setLobbyUsers);

    socket.on("duelRequest", ({ from }) => {
      setIncomingRequest(from);
    });

    socket.on("gameStart", ({ roomId }) => {
      setIsRequesting(false);
      setIsStarting(false);
      setRoomId(roomId);
      setBoard(Array(9).fill(null));
      setWinner(null);
      setCurrentTurn("X");
    });

    socket.on("gameUpdate", (data) => {
      setBoard(data.board);
      setCurrentTurn(data.currentTurn);
      setWinner(data.winner);

      if (data.winner) {
        setIsEnding(true);
        setTimeout(() => {
          setRoomId(null);
          setBoard(Array(9).fill(null));
          setWinner(null);
          setCurrentTurn(null);
          setIsEnding(false);
        }, 3000);
      }
    });

    return () => {
      socket.off("lobbyUsers");
      socket.off("duelRequest");
      socket.off("gameStart");
      socket.off("gameUpdate");
      socket.disconnect();
    };
  }, []);




  function requestDuel(id) {
    setIsRequesting(true);
    socket.emit("sendDuelRequest", id);
    setMySymbol('X');
  }

  function acceptDuel() {
    setIsStarting(true);
    socket.emit("acceptDuel", { from: incomingRequest });
    setIncomingRequest(null);
  }

  function handleClick(index) {
    if (!roomId || winner || isEnding) return;
    socket.emit("makeMove", { roomId, index });
  }

  return (
    <div className="app">
      <h1>Tic Tac Toe</h1>

      {/* LOADERS */}
      {isRequesting && <p>⏳ Sending duel request...</p>}
      {isStarting && <p>⏳ Match is starting...</p>}
      {isEnding && <p>⏳ Match ended, returning to lobby...</p>}

      {/* LOBBY */}
      {!roomId && !isRequesting && !isStarting && (
        <>
          <h2>Lobby</h2>
          {lobbyUsers.map((u) => {
  const isYou = u.id === socket.id;

  return (
    
    <div key={u.id} style={{ marginBottom: "8px" }}>
      <span>
        {u.id.slice(0, 5)} {isYou && "(You)"}
      </span>

      {!isYou && (
        <button
          style={{ marginLeft: "10px" }}
          onClick={() => requestDuel(u.id)}
        >
          Duel
        </button>
      )}
    </div>
  );
})}
        </>
      )}

      {/* INCOMING REQUEST */}
      {incomingRequest && !roomId && (
        <div>
          <p>Duel request from {incomingRequest.slice(0, 5)}</p>
          <button onClick={acceptDuel}>Accept</button>
        </div>
      )}

      {/* GAME BOARD */}
      {roomId && (
        <>
          <p>
            Room Id -> {roomId}
          </p>
          <p>
            You are: {mySymbol}
          </p>
          <p>
            {winner
              ? `Winner: ${winner}`
              : `Turn: ${currentTurn}`}
          </p>

          <div className="board">
            {board.map((cell, i) => (
              <button
                key={i}
                onClick={() => handleClick(i)}
                disabled={!!cell || winner || isEnding}
              >
                {cell}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
