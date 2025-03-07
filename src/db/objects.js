const players = [{
  },
];//should save player that creates tournament in onReady hook
//all others in invitation request hook 

// const size = players.length;

const tournament = {
  id: null,
  createdAt: Date.now(),
  startedAt: null,
  endedAt: null,
  createdBy: players[0].id,
  currentRound: 0,
  size: players.length,
  registrationStartTime: Date.now(),
  registrationDeadline: Date.now() + 1000 * 60 * 5,
  winner_id: null,
  schedule: null,
  scores: null,
};

export default { players, tournament };