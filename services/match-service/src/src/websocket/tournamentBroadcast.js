// TODO: check if nedded

export function broadcastTournamentMatches (matches) {
  for (const match of matches) {
    const { player1Id, player2Id } = match
    const message = JSON.stringify({
      type: 'tournamentMatch',
      match
    })

    // Send message to player 1
    const connection1 = globalThis.activeConnections ? globalThis.activeConnections.get(player1Id) : null
    if (connection1 && connection1.socket && connection1.socket.readyState === 1) {
      connection1.socket.send(message)
    }

    const connection2 = globalThis.activeConnections ? globalThis.activeConnections.get(player2Id) : null
    if (connection2 && connection2.socket && connection2.socket.readyState === 1) {
      connection2.socket.send(message)
    }
  }
}
