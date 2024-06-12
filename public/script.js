window.onload = () => {
    let players = {};

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
            document.getElementById('players').style.display = 'flex';

            socket.emit('username', username);

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
                    playerElement.innerHTML = `<p>${player.username}</p><b>${players[p].cardsLength}</b>`;
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
                playerElement.innerHTML = `<p>${player.username}` + (player.id === socket.id ? '<a> (You)</a>' : '') + `</p><b>${players[player.id].cardsLength}</b>`;
                document.getElementById('players').append(playerElement);
            });

            socket.on('deletePlayer', playerid => {
                delete players[playerid];
                document.getElementById('players').removeChild(document.getElementById(playerid));
            });

            socket.on('start', () => {
                document.getElementById('start').style.display = 'none';
            });
        });

        // display disconnected title, stop displaying the game
        socket.on('disconnect', () => {
            document.getElementById('disconnect').style.display = 'block';
            document.getElementById('start').style.display = 'none';
            document.getElementById('players').style.display = 'none';
            document.getElementById('players').innerHTML = '';
        });
    }
}
