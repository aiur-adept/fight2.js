const standingMoves = [
  "feel-out",
  "jab",
  "hook",
  "uppercut",
  "body-punch",
  "body-kick",
  "leg-kick",
  "head-kick",
  "grapple"
];

const grapplingMoves = [
  "progress",
  "escape",
  "elbow",
  "smesh",
  "headbutt-stomach",
  "knee-to-body",
];

const submissions = [
  "kimura", 
  "rear-naked-choke", 
  "arm-bar", 
  "triangle-choke",
  "guillotine"
];

const successRate = {
  "jab": 45,
  "elbow": 45,
  "hook": 45,
  "uppercut": 45,
  "body-punch": 45,
  "body-kick": 45,
  "leg-kick": 65,
  "head-kick": 35,
  "grapple": 45,

  // grapple only
  "progress": 33,
  "escape": 37,
  "smesh": 45,
  "headbutt-stomach": 55,
  "knee-to-body": 40,

  // submissions
  "kimura": 5,
  "rear-naked-choke": 8,
  "arm-bar": 5,
  "triangle-choke": 5,
  "guillotine": 5
}

const damageRate = {
  "jab": 5,
  "elbow": 5,
  "hook": 5,
  "uppercut": 6,
  "body-punch": 5,
  "body-kick": 5,
  "leg-kick": 3,
  "head-kick": 6,
  "smesh": 6,
  "headbutt-stomach": 1,
  "knee-to-body": 5,
}

function blockSuccessRate(move) {
  return 100 - successRate[move];
}


module.exports = {
  standingMoves,
  grapplingMoves,
  submissions,
  successRate,
  damageRate,
  blockSuccessRate,
};
