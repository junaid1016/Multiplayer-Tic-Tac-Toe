const {calculateWinner} = require('./gameLogic');

let board = Array(9).fill(null);
let currentTurn = 'X';
let players = {};

function addPlayer(socketId){
    if(!players.X){
        players.X = socketId;
        return 'X';
    }
    if(!players.O){
        players.O = socketId;
        return 'O';
    }
    return null;
}

function makeMove(socketId, index){
    const symbol = Object.keys(players).find(
        key => players[key] === socketId
    );
    if(symbol !== currentTurn) return null;
    if(board[index]) return null;
    board[index] = symbol;
    const winner = calculateWinner(board);
    if(winner){
        const result = {
            board,
            currentTurn,
            winner
        };
        resetGame();
        return result;
    }
    currentTurn = currentTurn === 'X' ? 'O' : 'X';
    return {
        board,
        winner: null,
        currentTurn
    }
}

function resetGame(){
    board = Array(9).fill(null);
    currentTurn = 'X';
}

function getState(){
    return {
        board,
        currentTurn
    };
}

function removePlayer(socketId){
    if(players.X === socketId) delete players.X;
    if(players.O === socketId) delete players.O;
}

module.exports = {
    addPlayer,
    resetGame,
    makeMove,
    getState,
    removePlayer
};