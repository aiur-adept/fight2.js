import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { client } from './redis.js';

import { handleMessage } from './handle-message.js'


const port = process.env.PORT || 8080;
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';

console.log(`REDIS_HOST is ${REDIS_HOST}`);

let io;

function emit(fightId, msg, socket) {
    let target = socket ? socket : fightId;
    io.to(target).emit('message', JSON.stringify(msg));
}

async function sendFightData(fightData) {
    const response = {
        event: 'fight/data',
        fightData: fightData,
    };
    emit(fightData.id, response);
}

function setupSocketIO(server) {
    io = new Server(server);
    const pubClient = createClient({ url: `redis://${REDIS_HOST}:6379` });
    const subClient = pubClient.duplicate();

    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        io.adapter(createAdapter(pubClient, subClient));

        io.on('connection', (socket) => {

            socket.on('message', (data) => {
                try {
                    const msg = JSON.parse(data);
                    handleMessage(socket, msg);
                } catch (error) {
                    console.log(`Error parsing message data from ${socket.id}:`, error);
                }
            });

            socket.on('disconnect', async () => {
                // console.log(`User disconnected: ${socket.id}`);
            });
        });

        io.of("/").adapter.on("leave-room", async (room) => {
            const roomDetails = io.sockets.adapter.rooms.get(room);
            emit(room, { event: 'fight/leave-room' });
            if (roomDetails && roomDetails.size == 0) {
                await client.del(room);
            }
        });

        console.log(`socket.io listening on port ${port}`);
    });
}

export {
    io,
    emit,
    sendFightData,
    setupSocketIO,
};
