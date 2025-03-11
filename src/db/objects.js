const tournaments = {
  created_by: null,
  current_round: 0,
  size: 0,
  registration_start_time: Date.now(),
  registration_deadline: Date.now() + 1000 * 60 * 5,
  winner_id: null,
  schedule: null,
  scores: null,
  created_at: Date.now(),
  started_at: null,
  ended_at: null,
};

export default { tournaments };