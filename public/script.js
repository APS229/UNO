window.onload = () => {
    const connect = document.getElementById('connect');
    connect.onclick = () => {
        const username = document.getElementById('input').value;
        if (!username) return;

        document.getElementById('playerInfo').style.display = 'none';
        document.getElementById('canvas').style.display = 'block';

        let players = {};

        let socket = io();
        socket.emit('username', username);

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

        window.onresize = () => {
            canvas.width = innerWidth;
            canvas.height = innerHeight;
        };

        const distance = 320;

        const context = canvas.getContext('2d');
        context.font = "30px Arial";

        function draw() {
            context.clearRect(0, 0, canvas.width, canvas.height);

            let i = 0;
            for (const p in players) {
                const player = players[p];
                const value = (Math.PI * 2) / Object.keys(players).length * i - (90 * Math.PI / 180);
                const x = Math.cos(value) * distance + (innerWidth / 2 - 100);
                const y = Math.sin(value) * distance + (innerHeight / 2 - 100);
                context.fillText(player.username, x, y);
                i++;
            }

            requestAnimationFrame(draw);
        }

        requestAnimationFrame(draw);

    }
}
