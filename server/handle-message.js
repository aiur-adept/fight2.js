import { fightJoin, fightResponses } from './fight-responses.js';
import { stoppage } from './victory.js';
import { getFightData, setFightData } from './redis.js';
import { sendFightData } from './ws.js';

async function handleMessage(socket, msg) {
    const { fightId } = msg;

    // get fight data
    let fightData;
    try {
        fightData = await getFightData(fightId);
    } catch (err) {
        console.error(err);
        return;
    }

    if (msg.event == 'fight/join') {
        fightJoin(socket, msg, fightData);
        await setFightData(fightId, fightData);
    } else {
        // game logic
        fightResponses[msg.event](socket, msg, fightData);
        // set and send fight data
        await setFightData(fightId, fightData);
        sendFightData(fightData);
        // after fight event, check for victory by damage
        for (const name of fightData.names) {
            if (fightData.states[name].health <= 0) {
                const victor = fightData.names.find(name_ => name_ !== name);
                stoppage(fightData, victor, "TKO");
            }
        }
    }

}

export {
    handleMessage,
};