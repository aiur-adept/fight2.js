import { fightResponses } from './fight-responses.js';

async function handleMessage(socket, msg) {
    const { fightId } = msg;
    console.log(`[${msg.type}]@${fightId}`);
    fightResponses[msg.type](socket, msg);
}

export {
    handleMessage,
};