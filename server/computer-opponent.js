import { io } from 'socket.io-client';

export const startComputerOpponentProcess = (fightData) => {
    const fightId = fightData.id;
    const websocket = io('http://localhost:8080');
    const user = "computer";

    websocket.on('connect', () => {
        websocket.send(JSON.stringify({ event: 'fight/join', username: user, fightId }));
    });

    websocket.on('message', (msg) => {
        const data = JSON.parse(msg);
        if (data.fightData) {
          fightData = data.fightData;
        }
        let options;
        switch(data.event) {
          case 'fight/canAttack':
            options = data.options;
            const randomOption = options[Math.floor(Math.random() * options.length)];
            setTimeout(() => {
              websocket.send(JSON.stringify({ fightId, event: 'fight/attack', user, attack: randomOption }));
            }, 500);
            break;
          case 'fight/canBlock':
            options = data.options;
            const randomBlockOption = options[Math.floor(Math.random() * options.length)];
            setTimeout(() => {
              websocket.send(JSON.stringify({ fightId, event: 'fight/block', user, block: randomBlockOption }));
            }, 500);
            break;
          case 'fight/end':
            // disconnect the websocket
            websocket.disconnect();
            break;
          case 'fight/leave-room':
            // disconnect the websocket
            websocket.disconnect();
            break;
        }
        if (data.type === 'error') {
          console.error(data.message);
        }
      });
}

