const tournament = {
  createdAt: Date.now(),
  startedAt: null,
  endedAt: null,
  createdBy: null,
  currentRound: 0,
  size: 0,
  registrationStartTime: Date.now(),
  registrationDeadline: Date.now() + 1000 * 60 * 5,
  winner_id: null,
  schedule: null,
  scores: null,
};

export default { tournament };