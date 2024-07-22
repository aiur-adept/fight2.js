import {
  notifyStartFight,
  notifyStartRound,
  notifyEndRound,
  notifyFeelOut,
  notifyBlocked,
  notifyConnects
} from './notify.js';

import {
  submissions,
  blockSuccessRate
} from './moves.js';

import {
  getAvailableMoves,
  damage,
  getTelegraphMoves
} from './fight-logic.js'

import {
  assignRoundScores,
  stoppage,
  judgeDecision
} from './victory.js';

import { io, emit, sendFightData } from './ws.js';

function updateAcuity(fightData) {
  const a = fightData.names[fightData.initiative];
  const aState = fightData.states[a];
  const b = fightData.names[(fightData.initiative + 1) % 2];
  const bState = fightData.states[b];
  // interpolate the player's acuity;
  aState.acuity = 0.8 * aState.acuity + 0.2 * bState.acuity;
  // random adjustment to acuity
  if (Math.random() < 0.2) {
    aState.acuity = Math.round(Math.max(aState.acuity * 0.9, aState.acuity + 10));
  }
}

async function tickTime(fightData) {
  updateAcuity(fightData);

  // Handle round time and progression
  fightData.t++;
  if (fightData.t === fightData.roundTime) {
    // End this round
    notifyEndRound(fightData);
    assignRoundScores(fightData);
    // reset round points for each player
    for (let key of Object.keys(fightData.states)) {
      fightData.states[key].roundPoints = 0;
    }
    // advance round
    fightData.t = 0;
    fightData.round++;

    if (fightData.round > fightData.nRounds) {
      return judgeDecision(fightData);
    } else {
      // TODO recoverBetweenRounds()
      notifyStartRound(fightData);
      fightData.mode = "standing";
      // Coin flip for initiative at the beginning of the round
      fightData.initiative = Math.floor(Math.random() * 2);
    }
  }

  fightData.initiativeStrike = 0;
  canAttack(fightData);
}




async function canAttack(fightData) {
  const user = fightData.names[fightData.initiative];
  const msg = {
    event: 'fight/canAttack',
    options: getAvailableMoves(fightData, user),
  };
  emit(fightData.id, msg, fightData.sockets[user]);
}

function canBlock(fightData, telegraphMoves) {
  const user = fightData.names[(fightData.initiative + 1) % 2];
  const msg = {
    event: 'fight/canBlock',
    options: telegraphMoves,
    fightData,
  };
  emit(fightData.id, msg, fightData.sockets[user]);
}



async function fightJoin(socket, msg, fightData) {
  try {
    const { fightId } = msg;
    socket.join(fightId);

    // set the user's fight stats (health, acuity, etc.) and username
    fightData.states[msg.username] = {
      health: 20,
      acuity: 100,
      submissionProgress: 0,
      roundPoints: 0,
    };
    fightData.emails[msg.username] = msg.email;
    const initiativeIx = Math.round(Math.random());
    fightData.initiative = initiativeIx;
    fightData.names.push(msg.username);
    // store username with socketid
    fightData.sockets[msg.username] = socket.id;

    // Check the room size after joining
    const roomSize = io.sockets.adapter.rooms.get(fightId)?.size || 0;

    // If two users are in the room, start the fight
    if (roomSize === 2) {
      await sendFightData(fightData);
      await notifyStartFight(fightData);
      await notifyStartRound(fightData);
      canAttack(fightData);
    }
  } catch (error) {
    console.log(`Error parsing join data from ${socket.id}:`, error);
  }
}

async function fightAttack(socket, msg, fightData) {

  const realMove = msg.attack;
  const attacker = fightData.names[fightData.initiative];

  if (realMove === "feel-out") {
    const attackerName = attacker;
    const attackerIndex = fightData.initiative;

    // Send the feel-out message to the client
    notifyFeelOut(attackerName, fightData);

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
    return tickTime(fightData);
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
            fightData.submissionProgress = [0, 0];
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
