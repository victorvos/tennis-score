/**
 * ScoringEngine - Single Responsibility: Handle scoring logic
 * Encapsulates all rules regarding points, games, and set transitions.
 */
class ScoringEngine {
    constructor(config, state) {
        this.config = config;
        this.state = state;
    }

    // Handle a player scoring a point
    playerScores(winningPlayer) {
        const winningPlayerIndex = parseInt(winningPlayer);
        const losingPlayerIndex = (winningPlayerIndex + 1) % 2;
        const currentSet = this.state.currentSet;

        this.state.setLatestEvent(1, `${this.config.players[winningPlayerIndex]} scored the point`);

        if (this.state.isTieBreakerActive(currentSet)) {
            this._handleTieBreakerPoint(winningPlayerIndex, losingPlayerIndex, currentSet);
        } else {
            this._handleRegularPoint(winningPlayerIndex, losingPlayerIndex, currentSet);
        }
    }

    _handleTieBreakerPoint(winner, loser, set) {
        const scores = this.state.getTieBreakerScore(set);
        scores[winner]++;
        this.state.setTieBreakerScore(set, scores);

        if (
            scores[winner] >= this.config.tieBreakerPoints &&
            scores[winner] - scores[loser] >= 2
        ) {
            this.playerWinsSet(winner);
        }
    }

    _handleRegularPoint(winner, loser, set) {
        const points = this.state.points;

        // 0(0), 15(1), 30(2)
        if (points[winner] <= 2) {
            points[winner]++;
        }
        // 40(3)
        else if (points[winner] === 3) {
            // Deuce: Both 40
            if (points[loser] === 3) {
                points[winner]++; // Advantage
            }
            // Loser has Advantage
            else if (points[loser] === 4) {
                points[loser]--; // Back to Deuce
            }
            else {
                this.playerWinsGame(winner);
            }
        }
        // Advantage(4)
        else if (points[winner] === 4) {
            this.playerWinsGame(winner);
        }

        this.state.setPoint(0, points[0]);
        this.state.setPoint(1, points[1]);
    }

    playerWinsGame(winningPlayer) {
        const winner = parseInt(winningPlayer);
        const loser = (winner + 1) % 2;
        const currentSet = this.state.currentSet;

        // Reset points
        this.state.setPoint(0, 0);
        this.state.setPoint(1, 0);

        // Increment game count
        const games = this.state.getGamesInSet(currentSet);
        games[winner]++;
        this.state.setGamesInSet(currentSet, games);

        if (this.state.latestEvent.level <= 2) {
            this.state.setLatestEvent(2, `${this.config.players[winner]} won the game`);
        }

        // Check set win condition
        if (games[winner] >= this.config.gamesPerSet) {
            if (games[winner] - games[loser] >= 2) {
                this.playerWinsSet(winner);
            } else if (
                games[winner] === this.config.gamesPerSet &&
                games[loser] === this.config.gamesPerSet
            ) {
                // Activate tie break
                this.state.setTieBreakerActive(currentSet, true);
            }
        }
    }

    playerWinsSet(winningPlayer) {
        const winner = parseInt(winningPlayer);

        this.state.playerSetsWon[winner]++;
        this.state.addWonSet(`#p${winner + 1}set${this.state.currentSet + 1}`);

        // Check for match winner
        // Example: Best of 3 (sets=3). Win 2 sets to win match. (3+1)/2 = 2.
        // Example: Best of 5 (sets=5). Win 3 sets to win match. (5+1)/2 = 3.
        const setsToWin = (this.config.sets + 1) / 2;

        if (this.state.playerSetsWon[winner] >= setsToWin) {
            this.state.winner = winner;
            this.state.setLatestEvent(4, `${this.config.players[winner]} won the match!`);
            return;
        }

        if (this.state.latestEvent.level <= 3) {
            this.state.setLatestEvent(3, `${this.config.players[winner]} took the set`);
        }

        // Advance to next set
        this.state.currentSet++;

        // Ensure points are reset for the start of the next set
        this.state.setPoint(0, 0);
        this.state.setPoint(1, 0);
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = ScoringEngine;
}
