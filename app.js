const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const UNO = require('./uno.js');

app.use(express.static('public'));

const Game = new UNO();

io.on('connection', socket => {
    socket.on('username', username => {
        socket.emit('players', UNO.players);
        Game.addPlayer(socket.id, username);
        io.emit('newPlayer', { id: socket.id, username: username });
    });

    socket.on('disconnect', () => {
        io.emit('deletePlayer', socket.id);
        UNO.removePlayer(socket.id);
    });
});

server.listen(5500, () => {
    console.log('listening on *:5500');
});