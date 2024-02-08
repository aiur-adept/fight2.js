// stores fight data like health, acuity, round, etc.
const fights = new Map();
// fight data not sent to players
const fightsHidden = new Map();



function fightAfterlife(fightData) {
  const fightEndPayload = {
    type: 'fight/end'
  };
  fightData.names.forEach((name) => {
    const ws = sockets.get(name);
    ws.send(JSON.stringify(fightEndPayload));
  });
  // TODO: record the fight to the fighter's records
  console.log(`[${fightData.id}] fight data:`);
  console.log(`[${fightData.id}] ` + JSON.stringify(fightData, undefined, 2));
  console.log(`[${fightData.id}] hidden fight data:`);
  console.log(`[${fightData.id}] ` + JSON.stringify(fightsHidden.get(fightData.id), undefined, 2));
  // cleanup the fight state from stores
  fightData.names.forEach((name) => {
    sockets.delete(name);
  });
  fights.delete(fightData.id);
  fightsHidden.delete(fightData.id);
}

module.exports = {
  fights,
  fightsHidden,
  fightAfterlife,
};
