import { v4 as uuidv4 } from 'uuid';

export const createFightData = () => {
    // Generate a unique UUID for the fight session
  const fightId = uuidv4();
  const fightUrl = `/fight/${fightId}`;

  const fightData = {
    id: fightId,
    url: fightUrl,
    names: [],
    emails: {},
    sockets: {},
    round: 1,
    roundTime: 12,
    nRounds: 3,
    t: 0,
    states: {},
    initiative: -1,
    mode: 'standing',
    status: 'waiting', // Possible statuses: 'waiting', 'in-progress', 'finished'
    judgeScores: [[0, 0], [0, 0], [0, 0]],
    initiativeStrike: 0,
    events: [],
  };

  return fightData;
}