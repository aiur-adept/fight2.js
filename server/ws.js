import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { client, getFightData } from './db.js';

import { handleMessage } from './handle-message.js'


const port = process.env.PORT || 8080;

let io;

function emit(fightId, msg, socket) {
    console.log(`---EMIT ${msg.event} @ ${fightId}---:`);
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
    const pubClient = createClient({ url: "redis://localhost:6379" });
    const subClient = pubClient.duplicate();

    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        io.adapter(createAdapter(pubClient, subClient));

        io.on('connection', (socket) => {
            console.log('A user connected:', socket.id);

            // Handling messages. Assuming messages include the UUID.
            socket.on('message', (data) => {
                try {
                    const msg = JSON.parse(data); // Assuming data is a JSON string
                    const { fightId } = msg;
                    console.log(`Message received for room ${fightId} from ${socket.id}`);
                    handleMessage(socket, msg);
                } catch (error) {
                    console.log(`Error parsing message data from ${socket.id}:`, error);
                }
            });

            socket.on('disconnect', async () => {
                console.log(`User disconnected: ${socket.id}`);
            });
        });

        io.of("/").adapter.on("leave-room", async (room) => {
            console.log(`room ${room} had a leave-room event`);
            if (io.sockets.adapter.rooms.get(room).size == 0) {
                console.log(`no users left in room ${room}, deleting fightData...`);
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
