export function getOpponentDetails (match, userId, activeConnections) {
  let opponentId
  if (userId === match.player1_id) {
    opponentId = match.player2_id
  } else if (userId === match.player2_id) {
    opponentId = match.player1_id
  } else {
    opponentId = null
  }
  // const opponentId = match.userId === match.player1_id ? match.player2_id : match.player1_id
  const opponentConnection = activeConnections.get(userId)
  const opponentDisplayName = opponentConnection ? opponentConnection.displayName : null
  return { opponentId, opponentConnection, opponentDisplayName }
}
