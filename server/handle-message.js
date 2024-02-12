import { fightResponses } from './fight-responses.js';
import { getFightData, setFightData } from './db.js';
import { emit } from './ws.js';

async function sendFightData(fightData) {
    const response = {
        event: 'fight/data',
        fightData,
    };
    emit(response);
}

async function handleMessage(socket, msg) {
    const { fightId } = msg;
    console.log(`[${msg.type}]@${fightId}`);

    // get fight data
    const fightData = getFightData(fightId);

    // game logic
    fightResponses[msg.type](socket, msg, fightData);

    // persist and send (changed) fight data
    setFightData(fightId, fightData);
    sendFightData(fightData);
}

export {
    handleMessage,
};