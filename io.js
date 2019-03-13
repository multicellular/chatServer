const socket = require('socket.io');

class IOServer {

    constructor(server) {
        this.io = socket(server);
        this.listenSystemRoom();
    }
    listenSystemRoom() {
        var socketUsers = {};
        var roomUsers = {};
        this.io.on('connection', socket => {

            socket.on('login', user => {
                socketUsers[socket.id] = user.id;
            });

            socket.on('joinRoom', ({ user, room }) => {
                if (!roomUsers[room]) {
                    roomUsers[room] = [];
                }
                const idx = roomUsers[room].findIndex(item => item.id === user.id);
                if (idx < 0) {
                    socket.join(room);
                    roomUsers[room].push(user);
                }
                this.io.to(room).emit('userJoin', user);
                socket.emit('roomUsers', roomUsers[room]);
            });

            socket.on('leaveRoom', ({ user, room }) => {
                if (!roomUsers[room]) {
                    roomUsers[room] = [];
                }
                const idx = roomUsers[room].findIndex(item => item.id === user.id);
                if (idx > -1) {
                    roomUsers[room].splice(idx, 1);
                    socket.leave(room);
                }
                this.io.to(room).emit('userLeave', user);
            });

            socket.on('message', ({ user, room, message }) => {
                const idx = roomUsers[room].findIndex(item => item.id === user.id);
                if (idx > -1) {
                    this.io.to(room).emit('message', message);
                }
            });

            socket.on('disconnect', () => {
                const userId = socketUsers[socket.id];
                for (let room in roomUsers) {
                    let idx;
                    let user;
                    if (roomUsers[room]) {
                        idx = roomUsers[room].findIndex(item => item.id === userId);
                    }
                    if (idx > -1) {
                        user = roomUsers[room][idx];
                        roomUsers[room].splice(idx, 1);
                        socket.leave(room);
                        this.io.to(room).emit('userLeave', user);
                    }
                }
            });

        });
    }
}

module.exports = IOServer;