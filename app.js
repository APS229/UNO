const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const Player = require('./player.js');
const players = new Map();

app.use(express.static('public'));

io.on('connection', socket => {
    const playersArray = [];
    players.forEach((value, key) => {
        playersArray.push({id: key, username: value.username});
    });
    socket.on('username', username => {
        socket.emit('players', playersArray);
        players.set(socket.id, new Player(username));
        io.emit('newPlayer', { id: socket.id, username: username });
    });

    socket.on('disconnect', () => {
        io.emit('deletePlayer', socket.id);
        players.delete(socket.id);
    });
});

server.listen(5500, () => {
    console.log('listening on *:5500');
});