const Player = require('./player.js');

const COLORS = ['yellow', 'blue', 'greem', 'red']
const CARDS = ['wild', 'wild +4'];

for (const color of COLORS) {
    for (let i = 0; i <= 9; i++) {
        CARDS.push(color + ' ' + i);
    }
    CARDS.push(color + ' skip');
    CARDS.push(color + ' reverse');
    CARDS.push(color + ' +2');
}

class UNO {
    constructor() {
        this.name = 'UNO';
        this.players = {};
        this.hasStarted = false;
        this.turn = 0;
        this.topCard = '';
        this.turnOrder = [];
    }

    addPlayer(id, username) {
        this.players[id] = new Player(username);
    }

    removePlayer(id) {
        delete this.players[id];
    }

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

    random(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    startGame() {
        // if (this.hasStarted) return;
        this.hasStarted = true;
        this.turnOrder = this.shuffle(Object.keys(this.players));
        console.log(this.turnOrder);
        this.assignCards();
    }

    assignCards() {
        for (const p in this.players) {
            const player = this.players[p];
            for (let i = 0; i < 7; i++) {
                player.cards.push(this.random(CARDS));
            }
        }
    }
}

module.exports = UNO;