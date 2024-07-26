const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const UNO = require('./uno.js');

app.use(express.static('public'));

const Game = new UNO(io);

io.on('connection', socket => {
    // only add players who have selected a username
    socket.on('username', username => {
        Game.addPlayer(socket, username);
    });

    socket.on('disconnect', () => {
        Game.removePlayer(socket.id);
    });

    socket.on('start', () => {
        Game.startGame();
    });

    socket.on('playCard', card => {
        Game.playCard(socket.id, card);
    });
});

server.listen(5500, () => {
    console.log('listening on *:5500');
});