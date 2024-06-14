const Player = require('./player.js');

const COLORS = ['red', 'yellow', 'green', 'blue'];

class UNO {
    constructor(io) {
        this.name = 'UNO';
        this.players = {};
        this.hasStarted = false;
        this.turn = 0;
        this.topCard = '';
        this.turnOrder = [];
        this.cards = [];
        this.io = io;
    }

    // load all the cards for the current game
    async loadCards() {
        for (let i = 0; i < 4; i++) {
            this.cards.push('wild');
            this.cards.push('wild +4');
        }
        for (const color of COLORS) {
            for (let i = 0; i < 2; i++) {
                for (let j = 1; j <= 9; j++) {
                    this.cards.push(color + ' ' + j);
                }
                this.cards.push(color + ' skip');
                this.cards.push(color + ' reverse');
                this.cards.push(color + ' +2');
            }
            this.cards.push(color + ' 0');
        }
    }

    addPlayer(socket, username) {
        const players = {};
        for (const p in this.players) {
            if (p === 'cards') continue;
            players[p] = this.players[p];
        }
        if (this.hasStarted) return;
        socket.emit('players', players);
        this.players[socket.id] = new Player(username);
        this.io.emit('newPlayer', { id: socket.id, username: username });
    }

    removePlayer(id) {
        if (this.players[id]) {
            if (this.hasStarted) {
                this.turnOrder.splice(this.turnOrder.indexOf(id), 1);
            }
            delete this.players[id];
            this.io.emit('deletePlayer', id);
        }
    }

    // randomize elements in an array
    shuffle(array) {
        let currentIndex = array.length;

        while (currentIndex != 0) {

            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    // choose a random element from an array
    random(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    async startGame() {
        if (this.hasStarted) return;
        if (Object.keys(this.players).length < 2) return;

        await this.loadCards();

        this.hasStarted = true;
        this.io.emit('start', true);
        this.turnOrder = this.shuffle(Object.keys(this.players));
        this.assignCards();
        setInterval(() => {
            this.io.emit('topCard', this.random(this.cards));
        }, 1000);
    }

    // assign each player their starting 7 cards
    assignCards() {
        for (const p in this.players) {
            const player = this.players[p];
            for (let i = 0; i < 7; i++) {
                const card = this.random(this.cards);
                this.cards.splice(this.cards.indexOf(card), 1);
                player.cards.push(card);
            }
            this.io.sockets.sockets.get(p).emit('cards', player.cards);
        }
    }

    nextTurn() {
        const prevTurn = this.turnOrder[0];
        this.turnOrder.splice(0, 1);
        this.turnOrder.push(prevTurn);
    }
}

module.exports = UNO;