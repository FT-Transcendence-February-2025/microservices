// TODO: update this

export const tournamentMatchesController = {
  async postTournamentMatch (request, reply) {
    const { tournamentID, _round, matches } = request.body

    console.log.info(`Received tournament matches for tournamentID = ${tournamentID}`)
    console.log.info(matches)

    // Here you can integrate with your websocket connection logic. For example,
    // iterate over the matches and send a connection or handshake message to the players.
    // Example: websocketHandler.broadcastToPlayers(matches)

    return reply.code(200).send({
      statusCode: 200,
      message: 'Matches processes, awaiting players acceptance'
    })
  }
}
