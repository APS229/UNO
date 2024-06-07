window.onload = () => {
    const connect = document.getElementById('connect');
    connect.onclick = () => {
        const username = document.getElementById('input').value;
        if (!username) return;

        let socket = io();

        socket.on('connect', () => {
            // display canvas and start button, remove other GUI
            document.getElementById('playerInfo').style.display = 'none';
            document.getElementById('disconnect').style.display = 'none';
            document.getElementById('canvas').style.display = 'block';
            document.getElementById('start').style.display = 'block';

            socket.emit('username', username);

            let players = {};

            // only let APS start the game
            const start = document.getElementById('start');
            start.onclick = () => {
                const username = document.getElementById('input').value;
                if (username !== 'APS') return;
                socket.emit('start', true);
            }

            socket.on('players', pl => {
                players = pl;
            });

            socket.on('newPlayer', player => {
                players[player.id] = new Player(player.username);

            });

            socket.on('deletePlayer', playerid => {
                delete players[playerid];
            });

            const canvas = document.getElementById('canvas');
            canvas.width = innerWidth;
            canvas.height = innerHeight;

            // resize canvas when window is resized
            window.onresize = () => {
                canvas.width = innerWidth;
                canvas.height = innerHeight;
            };

            // distance between all the displaying players
            const distance = 320;

            const context = canvas.getContext('2d');
            context.font = "30px Arial";

            function draw() {
                // clear the canvas every frame
                context.clearRect(0, 0, canvas.width, canvas.height);

                let i = 0;
                for (const p in players) {
                    const player = players[p];
                    // calculate the value of each player's position on the canvas
                    const value = (Math.PI * 2) / Object.keys(players).length * i - (90 * Math.PI / 180);
                    const x = Math.cos(value) * distance + (canvas.width / 2 - 100);
                    const y = Math.sin(value) * distance + (canvas.height / 2 - 100);
                    context.fillText(player.username, x, y);
                    i++;
                }

                requestAnimationFrame(draw);
            }

            requestAnimationFrame(draw);
        });

        // display disconnected title, stop displaying canvas
        socket.on('disconnect', () => {
            document.getElementById('disconnect').style.display = 'block';
            document.getElementById('canvas').style.display = 'none';
            document.getElementById('start').style.display = 'none';
        });
    }
}
