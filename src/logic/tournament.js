import { generateRoundRobin } from './roundRobin.js';

//new tournament creating, how to ruse object tournament ??
export const createTournament = (players) => {
    const schedule = generateRoundRobin(players);
    const tournament = {
        id: Date.now() + Math.random(),
        createdAt: Date.now(),
        startedA: null,
        endedAt: null,
        player_ids: players.map(p => p.id), 
        createdBy: players[0].id,
        currentRound: 0,
        size,
        registrationStartTime: Date.now(),
        registrationDeadline: Date.now() + 1000 * 60 * 5,
        winner_id,
        schedule,
        scores,
    }
    tournaments.push(tournament)
    return tournament
}

export const startNextRound = (tournamentId) => {
    const tournament = tournaments.find(t => t.id === tournamentId)
    if(!tournament) throw new Error('Tournament not found')
    
    if(tournament.currentRound >= tournament.schedule.length) {
        throw new Error('Tournament is already finished')
    }

    const roundMatches = tournament.schedule[tournament.currentRound].map((player1, player2) => ({
        id: Date.now() + Math.random(),
        player1,
        player2,
        score: null
    }))
    tournament.matches.push(...roundMatches)
    tournament.currentRound++

    return tournament
}
