const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const game = require('./game/gameState')

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST']
    }
});

const PORT = 3001

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send("Socket IO is running.")
})

io.on('connection', (socket) => {
    console.log("A user connected: ", socket.id);

    symbol = game.addPlayer(socket.id)

    socket.emit('assignPlayer', symbol);
    socket.emit('gameState', game.getState());

    socket.on('makeMove', (index) => {
        const result = game.makeMove(socket.id, index);
        if(!result) return;
        
        io.emit("gameUpdate", result);

        if(result.winner){
            io.emit("gameState", game.getState());
        }
    })

    socket.on('disconnect', () => {
        console.log("A user disconnected: ", socket.id);
        game.removePlayer(socket.id);
        game.resetGame();
        io.emit('gameState', game.getState());
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});