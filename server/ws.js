import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { client, getFightData } from './db.js';

import { handleMessage } from './handle-message.js'


const port = process.env.PORT || 8080;

let io;

function emit(fightId, msg, user) {
    console.log(`---EMIT @ ${fightId}---:`);
    console.log(msg);
    let target;
    if (user) {
        target = msg.fightData.sockets[user];
    } else {
        target = msg.fightData.id;
    }
    io.to(target).emit('message', JSON.stringify(msg));
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
                // Retrieve all rooms (fights) the socket is currently in
                const rooms = Array.from(socket.rooms);
                rooms.forEach(async (uuid) => {
                    // Skip the socket's own ID, which is also listed in rooms
                    if (uuid === socket.id) return;

                    const roomSize = io.sockets.adapter.rooms.get(uuid)?.size || 0;
                    console.log(`Room ${uuid} size after disconnect: ${roomSize}`);

                    // If the room is empty after the user disconnects, delete the fight data
                    if (roomSize === 0) {
                        console.log(`Deleting fight data for empty room: ${uuid}`);
                        await client.del(uuid);
                    }
                });
            });
        });

        console.log(`socket.io listening on port ${port}`);
    });
}

export {
    io,
    emit,
    setupSocketIO,
};
