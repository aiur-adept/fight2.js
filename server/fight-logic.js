import {
    standingMoves, 
    grapplingMoves, 
    damageRate, 
} from './moves.js';

function getAvailableMoves(fightData, user) {
    // TODO: implement differential movesets for players
    let availableMoves = [];
    if (fightData.mode === "standing") {
      availableMoves = [...standingMoves];
    } else if (fightData.mode === "grappling") {
      availableMoves = [...grapplingMoves];
      // in order to be able to try a submission you have to have some submissionProgress
      // *or* 10% of the time, you can seize a wild opportunity knowing it's a long shot
      // statistics-wise (submission progress changes submission probability)
      if (fightData.states[user].submissionProgress > 0 || Math.random() < 0.10) {
        availableMoves = availableMoves.concat(submissions);
      }
    }
    return availableMoves;
  }
  
  async function damage(fightData, recipient, move) {
    const rollD6 = () => {
      return Math.floor(Math.random() * 6) + 1;
    }
    const targetState = fightData.states[recipient];
    const otherState = fightData.states[fightData.names.find(name => name !== recipient)];
    let damage = Math.floor(rollD6() * damageRate[move] / 6.0);
    if (move != "headbutt-stomach" && damage == 0) {
      damage = 1;
    }
    targetState.health -= damage;
    targetState.acuity = Math.max(0, targetState.acuity - Math.floor(damage * Math.random() * 3));
    otherState.roundPoints += damage;
    if (move != "headbutt-stomach") {
      otherState.roundPoints++;
    }
  }
  
  function getTelegraphMoves(fightData, realMove, availableMoves) {
    // put the real move 1-3 times (TODO: this is telegraphing mechanic. enrich it)
    const telegraphMoves = [realMove];
    let realRepetition = 1;
    if (Math.random() < 0.33) {
      realRepetition = 2;
    }
    if (Math.random() < 0.05) {
      realRepetition = 3;
    }
    for (let i = 1; i < realRepetition; i++) {
      telegraphMoves.push(realMove);
    }
    // fill the rest with random moves
    while (telegraphMoves.length < 3) {
      const fake = availableMoves[Math.floor(Math.random() * availableMoves.length)];
      if (!telegraphMoves.includes(fake)) {
        telegraphMoves.push(fake);
      }
    }
    // Permute the telegraphMoves array
    for (let i = telegraphMoves.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [telegraphMoves[i], telegraphMoves[j]] = [telegraphMoves[j], telegraphMoves[i]];
    }
  
    return telegraphMoves;
  }

  export {
    getAvailableMoves,
    damage,
    getTelegraphMoves
  };