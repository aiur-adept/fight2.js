import { io } from './ws.js';
import { getFightData, setFightData } from './db.js';

async function sendFightData(fightId) {
    const fightData = await getFightData(fightId);
    console.log(`sending ${JSON.stringify(fightData)}`);
    const response = { 
        event: 'fight/data', 
        fightData: JSON.stringify(fightData)
    };
    io.to(fightId).emit('message', JSON.stringify(response));
}

async function join(socket, msg) {
    try {
        console.log('[[join]]');
        console.log(msg);
        const { fightId } = msg;
        socket.join(fightId);
        console.log(`User ${socket.id} as ${msg.username} joined room: ${fightId}`);

        // set the user's fight stats (health, acuity, etc.) and username
        const fightData = await getFightData(fightId);
        fightData.states[msg.username] = {
            health: 20,
            acuity: 100,
            submissionProgress: 0,
        };
        fightData.names.push(msg.username);
        await setFightData(fightId, fightData);

        // Check the room size after joining
        const roomSize = io.sockets.adapter.rooms.get(fightId)?.size || 0;
        console.log(`Room ${fightId} size: ${roomSize}`);

        // If two users are in the room, start the fight
        if (roomSize === 2) {
            io.to(fightId).emit('message', JSON.stringify({ event: 'fight/begin' }));
            console.log(`Fight started in room: ${fightId}`);
            await sendFightData(fightId);
        }
    } catch (error) {
        console.log(`Error parsing join data from ${socket.id}:`, error);
    }
}

function handleMessage(socket, msg) {
    console.log(`handleMessage [${msg.type}]`);
    switch(msg.type) {
        case "fight/join":
            join(socket, msg);
            break;
        default:
            console.error(`unknown message: ${JSON.stringify(msg)}`);
    }
}

export {
    handleMessage,
};