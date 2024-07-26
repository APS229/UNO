window.onload = () => {
    // ordered according to texture atlas
    const COLORS = ['red', 'yellow', 'green', 'blue'];
    // size of each card
    const tileWidth = 120;
    const tileHeight = 180;

    const cards = {};

    let j = 0;
    for (const color of COLORS) {
        cards[color] = {};
        for (let i = 0; i <= 9; i++) {
            cards[color][i] = { x: i, y: j };
        }
        cards[color].skip = { x: 10, y: j };
        cards[color].reverse = { x: 11, y: j };
        cards[color]['+2'] = { x: 12, y: j };
        j++;
    }
    cards['wild'] = {
        '0': { x: 13, y: 0 },
        '+4': { x: 13, y: 4 }
    };
    function getPositionByCard(card) {
        let [cardType, cardValue] = card.split(' ');
        if (cardType === 'wild' && cardValue !== '+4') cardValue = '0';
        if (!cards[cardType] || !cards[cardType][cardValue]) return '0px 0px';
        return ('-' + cards[cardType][cardValue].x * tileWidth + 'px') + ' ' + ('-' + cards[cardType][cardValue].y * tileHeight + 'px');
    }

    let players = {};
    let prevTurn;
    let hasStarted = false;
    let playerCards = [];
    let topCard;
    let connected = false;

    const connect = document.getElementById('connect');
    connect.onclick = () => {
        const username = document.getElementById('input').value;
        if (!username) return;

        let socket = io();

        socket.on('connect', () => {
            // display canvas and start button, remove other GUI
            document.getElementById('playerinfo').style.display = 'none';
            document.getElementById('disconnect').style.display = 'none';
            document.getElementById('start').style.display = 'block';
            document.getElementById('game').style.display = 'block';

            socket.emit('username', username);

            if (connected) return;
            connected = true;

            // only let APS start the game
            const start = document.getElementById('start');
            start.onclick = () => {
                const username = document.getElementById('input').value;
                if (username !== 'APS') return;
                socket.emit('start', true);
            }

            socket.on('players', playerList => {
                // reset players on disconnection
                players = {};
                document.getElementById('players').innerHTML = '';
                for (const p in playerList) {
                    if (players[p]) continue;
                    const player = playerList[p];
                    players[p] = new Player(player.username);
                    const playerElement = document.createElement('div');
                    playerElement.id = p;
                    playerElement.setAttribute('class', 'player');
                    playerElement.innerHTML = `<b>${player.username}</b><p>${players[p].cardsLength} cards left</p>`;
                    document.getElementById('players').append(playerElement);
                }
            });

            socket.on('newPlayer', player => {
                if (players[player.id]) return;
                players[player.id] = new Player(player.username);
                const playerElement = document.createElement('div');
                playerElement.id = player.id;
                playerElement.setAttribute('class', 'player');
                playerElement.innerText = player.username;
                playerElement.innerHTML = `<b>${player.username}` + (player.id === socket.id ? '<a> (You)</a>' : '') + `</b><p>${players[player.id].cardsLength} cards left</p>`;
                document.getElementById('players').append(playerElement);
            });

            socket.on('deletePlayer', playerid => {
                const player = players[playerid];
                if (hasStarted)
                    document.getElementById(playerid).innerHTML = `<b>${player.username}</b><a class="disconnected"> (Disconnected)</a><p>${player.cardsLength} cards left</p>`;
                else
                    document.getElementById(playerid).remove();
                delete players[playerid];
            });

            socket.on('start', () => {
                document.getElementById('start').style.display = 'none';
                prevTurn = null;
                playerCards = [];
                hasStarted = true;
            });

            socket.on('topCard', (card, playedBy) => {
                topCard = card;
                document.querySelector('#topcard h1').innerText = card.toUpperCase();
                document.getElementById('card').style.background = "url('./textures/cards.png')";
                document.getElementById('card').style.backgroundPosition = getPositionByCard(card);
                document.getElementById('card').style.backgroundSize = '1400%';
                if (!playedBy) return;
                players[playedBy].cardsLength--;
                document.getElementById(playedBy).lastChild.innerText = `${players[playedBy].cardsLength} cards left`;
            });

            socket.on('hand', hand => {
                playerCards = hand = hand.sort();
                const handHTML = document.getElementById('cards-row');
                for (let i = 0; i < hand.length; i++) {
                    const card = document.createElement('div');
                    card.setAttribute('class', 'cards');
                    card.setAttribute('value', hand[i]);
                    card.style.backgroundPosition = getPositionByCard(hand[i]);
                    card.style.left = (i * 40) + 'px';
                    card.onclick = async () => {
                        if (prevTurn === socket.id) {
                            const playingCard = card.getAttribute('value').split(' ');
                            let cardColor = playingCard[0];
                            if (cardColor === 'wild') {
                                async function pickColor() {
                                    do {
                                        cardColor = prompt("Please enter a color");
                                    } while (!cardColor || !COLORS.includes(cardColor.toLowerCase()));
                                }
                                await pickColor();
                                playingCard.push(cardColor);
                            }
                            else {
                                const topCardSplit = topCard.split(' ');
                                let topCardColor = topCardSplit[0];
                                if (topCardColor === 'wild') {
                                    console.log(cardColor);
                                    topCardColor = topCardSplit[1] === '+4' ? topCardSplit[2] : topCardSplit[1];
                                    if (cardColor !== topCardColor) return alert("Your card color must match the top card.");
                                }
                                else {
                                    if (playingCard[1] !== topCardSplit[1] && cardColor !== topCardColor) return alert("Your card must match either the color or the value of the top card.");
                                }
                            }
                            socket.emit('playCard', playingCard.join(' '));
                            playerCards.splice(playingCard.join(' '), 1);
                            card.remove();
                            rearrangeCards();
                        }
                    }
                    handHTML.append(card);
                }
            });

            socket.on('turn', playerid => {
                document.getElementById(playerid).style.backgroundImage = 'linear-gradient(to bottom right, red, orange, yellow, green, blue)';
                if (prevTurn) document.getElementById(prevTurn).style.backgroundImage = '';
                prevTurn = playerid;
            })
        });

        // display disconnected title, stop displaying the game
        socket.on('disconnect', () => {
            document.getElementById('disconnect').style.display = 'block';
            document.getElementById('start').style.display = 'none';
            document.getElementById('game').style.display = 'none';
            document.getElementById('players').innerHTML = '';
            delete players[socket.id];
        });
    }

    function rearrangeCards() {
        const row = document.getElementById('cards-row');
        for (let i = 0; i < row.children.length; i++) {
            row.children[i].style.left = (i * 40) + 'px';
        }
    }
}
