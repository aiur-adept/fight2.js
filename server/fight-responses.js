import { 
  submissions, 
  blockSuccessRate } from './moves.js';

import {
    getAvailableMoves,
    damage,
    getTelegraphMoves
} from './fight-logic.js'

import { 
  assignRoundScores, 
  stoppage, 
  judgeDecision } from './victory.js';

import { io, emit } from './ws.js';

async function startFight(fightData) {
  fightData.status = 'in-progress';
  emit(fightData.id, { event: 'fight/start' });
}

async function startRound(fightData) {
  emit(fightData.id, { event: 'fight/roundStart' });
}

function endRound(fightData) {
  emit(fightData.id, { event: 'fight/roundEnd' });
}




async function tickTime(fightData) {
  console.log(`tick t=${fightData.t}`);

  for (const name of fightData.names) {
    if (fightData.states[name].health <= 0) {
      const victor = fightData.names.find(name_ => name_ !== name);
      stoppage(fightData, victor, "TKO");
    }
  }

  // Update acuity
  const a = fightData.names[fightData.initiative];
  const aState = fightData.states[a];
  const b = fightData.names[(fightData.initiative + 1) % 2];
  const bState = fightData.states[b];
  // interpolate the player's acuity;
  aState.acuity = 0.8 * aState.acuity + 0.2 * bState.acuity;

  if (Math.random() < 0.2) {
    aState.acuity = Math.round(Math.max(aState.acuity * 0.9, aState.acuity + 10));
  }

  // Handle round time and progression
  fightData.t++;
  if (fightData.t === fightData.roundTime) {
    // End this round
    endRound(fightData);
    assignRoundScores(fightData);
    // advance round
    fightData.t = 0;
    fightData.round++;

    if (fightData.round > fightData.nRounds) {
      return judgeDecision(fightData);
    } else {
      // TODO recoverBetweenRounds()
      startRound(fightData);
      fightData.mode = "standing";
      // Coin flip for initiative at the beginning of the round
      fightData.initiative = Math.floor(Math.random() * 2);
    }
  }
  if (fightData.mode === "standing") {
    fightData.submissionProgress = [0, 0];
  }
  fightData.initiativeStrike = 0;
  canAttack(fightData);
}



function notifyBlocked(fightData, move) {
  const msg = {
    event: 'fight/moveBlocked',
    fighter: fightData.names[fightData.initiative],
    move: move
  };
  emit(fightData.id, msg);
}

function notifyConnects(fightData, move) {
  const msg = {
    event: 'fight/moveConnects',
    fighter: fightData.names[fightData.initiative],
    move: move
  };
  emit(fightData.id, msg);
}

async function canAttack(fightData) {
  const user = fightData.names[fightData.initiative];
  const msg = {
    event: 'fight/canAttack',
    options: getAvailableMoves(fightData, user),
  };
  emit(fightData.id, msg, user);
}

function canBlock(fightData, telegraphMoves) {
  const user = fightData.names[(fightData.initiative + 1) % 2];
  const msg = {
    event: 'fight/canBlock',
    options: telegraphMoves,
    fightData,
  };
  emit(fightData.id, msg, user);
}



async function fightJoin(socket, msg, fightData) {
  try {
      console.log('[[join]]');
      console.log(msg);
      const { fightId } = msg;
      socket.join(fightId);
      console.log(`User ${socket.id} as ${msg.username} joined room: ${fightId}`);

      // set the user's fight stats (health, acuity, etc.) and username
      fightData.states[msg.username] = {
          health: 20,
          acuity: 100,
          submissionProgress: 0,
      };
      const initiativeIx = Math.round(Math.random());
      fightData.initiative = initiativeIx;
      fightData.names.push(msg.username);
      // store username with socketid
      fightData.sockets[msg.username] = socket.id;
      
      // Check the room size after joining
      const roomSize = io.sockets.adapter.rooms.get(fightId)?.size || 0;
      console.log(`Room ${fightId} size: ${roomSize}`);

      // If two users are in the room, start the fight
      if (roomSize === 2) {
          console.log(`Fight started in room: ${fightId}`);
          await startFight(fightData);
          await startRound(fightData);
          canAttack(fightData);
      }
  } catch (error) {
      console.log(`Error parsing join data from ${socket.id}:`, error);
  }
}

async function fightAttack(socket, msg, fightData) {
  console.log('[[attack]]');
  console.log(msg);

  const realMove = msg.attack;
  const attacker = fightData.names[fightData.initiative];

  if (realMove === "feel-out") {
    const attackerName = attacker;
    const attackerIndex = fightData.initiative;
    const blockerIndex = (attackerIndex + 1) % 2;
    const blockerName = fightData.names[blockerIndex];

    // Send the feel-out message to the client
    const feelOutMsg = {
      event: "fight/output",
      message: {
        content: `<span class="move feelOut">feel out...</span>`,
      },
      user: fightData.sockets[socket.id],
      fightData,
    };
    emit(feelOutMsg);

    if (Math.random() < 0.5) {
      fightData.states[fightData.names[attackerIndex]].acuity += Math.floor(Math.random() * 10);
    } else {
      // switch initiative
      fightData.initiative = (fightData.initiative + 1) % 2;
    }
    canAttack(fightData);
  } else {
    const telegraphMoves = getTelegraphMoves(fightData, realMove, getAvailableMoves(fightData, msg.user));
    fightData.realMove = realMove;
    canBlock(fightData, telegraphMoves);
  }
}

async function fightBlock(socket, msg, fightData) {
  console.log('[[block]]');
  console.log(msg);

  const realMove = fightData.realMove;
  const userMove = msg.block;

  let blockRate = blockSuccessRate(userMove);

  if (userMove === realMove) {
    // User guessed the real move
    blockRate *= 1.5;
  }

  // blocker is the one blocking, attacker is the one attacking
  const attacker = fightData.names[fightData.initiative];
  const attackerState = fightData.states[attacker];
  const blocker = fightData.names[(fightData.initiative + 1) % 2];
  const blockerState = fightData.states[blocker];

  if (submissions.includes(realMove)) {
    blockRate /= (attackerState.submissionProgress / 3.0 + 1);
    if (blockerState.health < 6) {
      blockRate *= 0.7;
    }
  }

  if (Math.random() * 100 < (blockRate + blockerState.acuity - attackerState.acuity)) {
    notifyBlocked(fightData, realMove);
    fightData.initiative = (fightData.initiative + 1) % 2;
    return;
  } else {
    notifyConnects(fightData, realMove);
    // Move connects, so apply damage, submission progress, or mode change 
    // based on the realMove
    switch (fightData.mode) {
      case "standing":
        if (realMove === "grapple") {
          fightData.mode = "grappling";
          attackerState.submissionProgress = Math.floor(Math.random() * 0.8);
          fightData.initiativeStrike = 0;
        } else {
          fightData.initiativeStrike++;
          damage(fightData, blocker, realMove);
        }
        break;
      case "grappling":
        if (realMove === "progress") {
          attackerState.submissionProgress += 1;
        } else if (realMove === "escape") {
          if (blockerState.submissionProgress === 0) {
            fightData.mode = "standing";
            fightData.initiativeStrike = 0;
          } else {
            blockerState.submissionProgress = 0;
          }
        } else if (submissions.includes(realMove)) {
          // Call stoppage function with appropriate arguments
          return stoppage(fightData, attacker, `submission by ${realMove}`);
        } else {
          damage(fightData, blocker, realMove);
        }
        break;
    }
  }

  // maintain or switch initiative
  if ((blockerState.health < 6 && Math.random() < 0.70) || (Math.random() * 100) < (70 / fightData.initiativeStrike)) {
    fightData.initiativeStrike += 1;
    return canAttack(fightData);
  } else {
    fightData.initiative = (fightData.initiative + 1) % 2;
    return canAttack(fightData);
  }
}



const fightResponses = {
  "fight/attack": fightAttack,
  "fight/block": fightBlock,
};

export {
  fightJoin,
  fightResponses,
  tickTime
};
