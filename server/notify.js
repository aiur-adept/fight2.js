export function notifyStartFight(fightData) {
    fightData.status = 'in-progress';
    emit(fightData.id, { event: 'fight/start' });
}

export function notifyStartRound(fightData) {
    emit(fightData.id, { event: 'fight/roundStart' });
}

export function notifyEndRound(fightData) {
    emit(fightData.id, { event: 'fight/roundEnd' });
}

export function notifyFeelOut(attackerName, fightData) {
    const msg = {
        event: "fight/output",
        message: {
            content: `<span class="move feelOut">feel out...</span>`,
        },
        attacker: attackerName,
        fightData,
    };
    emit(fightData.id, msg);
}

export function notifyBlocked(fightData, move) {
    const msg = {
        event: 'fight/moveBlocked',
        fighter: fightData.names[fightData.initiative],
        move: move
    };
    emit(fightData.id, msg);
}

export function notifyConnects(fightData, move) {
    const msg = {
        event: 'fight/moveConnects',
        fighter: fightData.names[fightData.initiative],
        move: move
    };
    emit(fightData.id, msg);
}

export function notifyStoppage(fightData, messages) {
    const msg = {
        type: "fight/stoppage",
        messages: messages,
        fightData: fightData,
    };
    emit(fightData.id, msg);
}

export function notifyJudgeDecision(fightData, messages) {
    const msg = {
        type: "fight/judgeDecision",
        messages: messages,
        result: result,
    };
    fightData.result = `${victor} by judge's decision`;
    fightData.status = 'finished';
    emit(fightData.id, msg);
}