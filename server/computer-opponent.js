import { io } from 'socket.io-client';

export const startComputerOpponentProcess = (fightData) => {
    const fightId = fightData.id;
    console.log('computer opponent opening socket...');
    const websocket = io('http://localhost:8080');
    const user = "computer";
    websocket.on('connect', () => {
        console.log('computer opponent joining fight ', fightId);
        websocket.send(JSON.stringify({ event: 'fight/join', username: user, fightId }));
    });

    websocket.on('message', (msg) => {
        console.log(msg);
        const data = JSON.parse(msg);
        if (data.fightData) {
          fightData = data.fightData;
        }
        console.log(data);
        let options;
        switch(data.event) {
          case 'fight/canAttack':
            options = data.options;
            console.log(options);
            websocket.send(JSON.stringify({ fightId, event: 'fight/attack', user, attack: options[0] }));
            break;
          case 'fight/canBlock':
            options = data.options;
            console.log(options);
            websocket.send(JSON.stringify({ fightId, event: 'fight/block', user, block: options[0] }));
            break;
          case 'fight/end':
            console.log('fight ended: ', fightData.id)
            break;
        }
        if (data.type === 'error') {
          console.error(data.message);
        }
      });
}

