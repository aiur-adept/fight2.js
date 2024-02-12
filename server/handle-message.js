import { fightJoin, fightResponses, tickTime } from './fight-responses.js';
import { getFightData, setFightData } from './db.js';
import { emit } from './ws.js';

async function sendFightData(fightData) {
    const response = {
        event: 'fight/data',
    };
    emit(fightData.id, response);
}

async function handleMessage(socket, msg) {
    const { fightId } = msg;
    console.log(`[${msg.event}]@${fightId}`);

    // get fight data
    const fightData = await getFightData(fightId);

    if (msg.event == 'fight/join') {
        console.log('fightData:');
        console.log(fightData);
        fightJoin(socket, msg, fightData);
        await setFightData(fightId, fightData);
    } else {
        // game logic
        fightResponses[msg.type](socket, msg, fightData);
        tickTime(fightData);
        await setFightData(fightId, fightData);
        sendFightData(fightData);
    }

}

export {
    handleMessage,
};