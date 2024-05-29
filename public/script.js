window.onload = () => {
    const connect = document.getElementById('connect');
    connect.onclick = () => {
        const username = document.getElementById('input').value;
        if (!username) return;

        document.getElementById('playerInfo').style.display = 'none';
        document.getElementById('canvas').style.display = 'block';

        const players = new Map();

        let socket = io();
        socket.emit('username', username);

        socket.on('players', pl => {
            for (const player of pl) {
                players.set(player.id, new Player(player.username));
            }
        });

        socket.on('newPlayer', player => {
            players.set(player.id, new Player(player.username));

        });

        socket.on('deletePlayer', playerid => {
            players.delete(playerid);
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
            for (const player of players.values()) {
                console.log(player);
                const value = (Math.PI * 2) / players.size * i - (90 * Math.PI / 180);
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
