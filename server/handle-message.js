import { fightJoin, fightResponses, tickTime } from './fight-responses.js';
import { getFightData, setFightData } from './db.js';
import { sendFightData } from './ws.js';

async function handleMessage(socket, msg) {
    const { fightId } = msg;
    console.log(`[${msg.event}]`);

    // get fight data
    const fightData = await getFightData(fightId);

    if (msg.event == 'fight/join') {
        fightJoin(socket, msg, fightData);
        await setFightData(fightId, fightData);
    } else {
        // game logic
        fightResponses[msg.event](socket, msg, fightData);
        tickTime(fightData);
        await setFightData(fightId, fightData);
        sendFightData(fightData);
    }

}

export {
    handleMessage,
};