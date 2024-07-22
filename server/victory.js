import { notifyStoppage, notifyJudgeDecision } from './notify.js';

import { saveFightRecord } from './db.js';


function assignRoundScores(fightData) {
  const scores = [];
  let roundPoints = [];
  for (let name of fightData.names) {
    roundPoints.push(fightData.states[name].roundPoints);
  }
  
  for (let i = 0; i < 3; i++) {
    let firstScore, secondScore;

    if (roundPoints[0] > roundPoints[1]) {
      firstScore = 10;
      secondScore = 9;
    } else if (roundPoints[1] > roundPoints[0]) {
      secondScore = 10;
      firstScore = 9;
    } else {
      // if we're here, both players had the same round score.
      firstScore = 10;
      secondScore = 10;
    }

    // random judge error
    let firstError = 0;
    let secondError = 0;
    // 10% chance of error (3 judges, 3 rounds means there will possibly be one error, less likely 2, etc)
    if (Math.random() < 0.1) {
      firstError = Math.floor(Math.random() * 2 - 1); // Random error between -1 and 0
      secondError = Math.floor(Math.random() * 2 - 1); // Random error between -1 and 0
    }

    const adjustedFirstScore = Math.max(Math.min(firstScore + firstError, 10), 0); // Clamp scores between 0 and 10
    const adjustedSecondScore = Math.max(Math.min(secondScore + secondError, 10), 0); // Clamp scores between 0 and 10

    scores.push([adjustedFirstScore, adjustedSecondScore]);
  }

  // Update the fightData with the new scores
  for (let i = 0; i < 3; i++) {
    fightData.judgeScores[i][0] += scores[i][0];
    fightData.judgeScores[i][1] += scores[i][1];
  }

  return fightData;
}

const stoppage = async (fightData, victor, method) => {
  let victorName = victor;
  victorName = victorName.toUpperCase();
  const messages = [
    { content: "-----", className: "breakline" },
    {
      content: `The referee has called a stop to the contest due to ${method} in round ${fightData.round}`,
      className: "buffer",
    },
    {
      content: `... declaring the winner... ${victorName}!!!`,
      className: "buffer",
    },
  ];
  fightData.resultDescription = `${victor} by ${method} in round ${fightData.round}`;
  fightData.status = 'finished';
  fightData.victor = victor;

  notifyStoppage(fightData, messages);
  await saveFightRecord(fightData);
};

const judgeDecision = async (fightData) => {
  const names = fightData.names;
  let player0Total = 0;
  let player1Total = 0;

  // figure out victor
  for (let i = 0; i < 3; i++) {
    player0Total += fightData.judgeScores[i][0];
    player1Total += fightData.judgeScores[i][1];
  }

  // Prepare messages
  const messages = [
    { content: "-----", className: "breakline" },
    { content: `After ${fightData.nRounds} rounds, we go to the judge's scorecards...`, className: "buffer" },
  ];

  // write scores out (victor number goes first)
  for (let i = 0; i < 3; i++) {
    const displayScores = [
      fightData.judgeScores[i][victorIx],
      fightData.judgeScores[i][(victorIx + 1) % 2],
    ];
    messages.push({
      content: `Judge ${i + 1} scores the contest ${displayScores[0]}, ${displayScores[1]}...`,
      className: "buffer",
    });
  }

  // Determine the result
  let isDraw, victor, victorName;
  if (player0Total > player1Total) {
    victor = names[0];
    victorName = victor.toUpperCase();
  } else if (player0Total < player1Total) {
    victor = names[1];
    victorName = victor.toUpperCase();
  } else {
    isDraw = true;
    victor = null;
    victorName = null;
  }

  messages.push({
    content: isDraw ? "This contest is declared a drawww!" : `... declaring the winner... ${victorName}!!!`,
    className: "buffer",
  });

  fightData.resultDescription = isDraw ? "draw" : `${victor} by judge's decision`;
  fightData.status = 'finished';
  fightData.victor = victor;

  notifyJudgeDecision(fightData, messages);
  await saveFightRecord(fightData);
};

export {
  stoppage,
  assignRoundScores,
  judgeDecision,
};
