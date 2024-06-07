const Player = require('./player.js');

const COLORS = ['yellow', 'blue', 'greem', 'red']

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

    // load all the cards in for the current game
    async loadCards() {
        this.cards = ['wild', 'wild +4'];
        for (const color of COLORS) {
            for (let i = 0; i <= 9; i++) {
                this.cards.push(color + ' ' + i);
            }
            this.cards.push(color + ' skip');
            this.cards.push(color + ' reverse');
            this.cards.push(color + ' +2');
        }
    }

    addPlayer(socket, username) {
        this.players[socket.id] = new Player(username);
        socket.emit('players', this.players);
        this.io.emit('newPlayer', { id: socket.id, username: username });
    }

    removePlayer(id) {
        delete this.players[id];
        this.io.emit('deletePlayer', id);
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
        this.turnOrder = this.shuffle(Object.keys(this.players));
        this.assignCards();
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
        }
    }
}

module.exports = UNO;