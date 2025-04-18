import fetch from 'node-fetch'
import config from '../../config/config.js'

export async function startGameForMatch (match) {
  try {
    const response = await fetch(`${config.endpoints.game}/games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        matchId: match.id,
        tournamentId: match.tournamentId,
        player1Id: match.player1_id,
        player2Id: match.player2_id,
        isLocal: false
      })
    })

    const result = await response.json()

    if (result.success) {
      console.log(`Game created successfully for match ${match.id}`)
      return true
    } else {
      console.error(`Failed to create game for match ${match.id}: ${result.message}`)
      return false
    }
  } catch (error) {
    console.error(`Error creating game: ${error.message}`)
    return false
  }
}
