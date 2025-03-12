export function generateRoundRobin (players) {
  const n = players.length
  const rounds = n - 1
  const matchesPerRound = n / 2

  const schedule = []

  for (let round = 0; round < rounds; round++) {
    const matchesThisRound = []
    for (let match = 0; match < matchesPerRound; match++) {
      const home = (round + match) % (n - 1)
      const away = (n - 1 - match + round) % (n - 1)
      if (match === 0) {
        matchesThisRound.push([players[n - 1], players[home]])
      } else {
        matchesThisRound.push([players[home], players[away]])
      }
    }
    schedule.push(matchesThisRound)
  }
  return schedule
}
