export function generateRoundRobin(players) {
  const n = players.length;
  const rounds = n % 2 === 0 ? n - 1 : n;
  // For even numbers: n - 1 rounds; for odd numbers: n rounds
  const schedule = [];

  const isOdd = n % 2 !== 0;
  const extendedPlayers = isOdd ? [...players, null] : players; // Add "null" as the ghost player

  for (let round = 0; round < rounds; round++) {
      const matchesThisRound = [];
      for (let i = 0; i < extendedPlayers.length / 2; i++) {
          const home = extendedPlayers[i];
          const away = extendedPlayers[extendedPlayers.length - i - 1];

          // Skip matches involving the ghost player (null)
          if (home !== null && away !== null) {
              matchesThisRound.push([home, away]);
          }
      }

      // Rotate players clockwise except for the first player
      extendedPlayers.splice(1, 0, extendedPlayers.pop());
      schedule.push(matchesThisRound);
  }

  return schedule.filter(round => round.length > 0);
}