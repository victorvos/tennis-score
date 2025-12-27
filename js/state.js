/**
 * MatchState - Single Responsibility: Manage match state
 * Handles all state-related operations, transitions, and history.
 */
class MatchState {
    constructor() {
        this.reset();
    }

    reset() {
        this.state = {
            points: [0, 0],
            tieBreakerActive: {},
            currentSet: 0,
            playerSetsWon: [0, 0],
            winner: -1,
            games: {},
            tieBreakerScore: {},
            latestEvent: { level: 0, text: "Match just started!" },
            wonSets: [],
        };

        // Initialize games and tieBreakerScore arrays for up to 5 sets (index 0-4)
        for (let i = 0; i < 5; i++) {
            this.state.games[i] = [0, 0];
            this.state.tieBreakerScore[i] = [0, 0];
        }
    }

    get points() { return this.state.points; }
    get currentSet() { return this.state.currentSet; }
    set currentSet(val) { this.state.currentSet = val; }

    get playerSetsWon() { return this.state.playerSetsWon; }
    get winner() { return this.state.winner; }
    set winner(val) { this.state.winner = val; }

    get latestEvent() { return this.state.latestEvent; }
    get wonSets() { return this.state.wonSets; }

    getGamesInSet(setIndex) {
        return this.state.games[setIndex] || [0, 0];
    }

    setGamesInSet(setIndex, scores) {
        this.state.games[setIndex] = scores;
    }

    isTieBreakerActive(setIndex) {
        return !!this.state.tieBreakerActive[setIndex];
    }

    setTieBreakerActive(setIndex, isActive) {
        this.state.tieBreakerActive[setIndex] = isActive;
    }

    getTieBreakerScore(setIndex) {
        return this.state.tieBreakerScore[setIndex] || [0, 0];
    }

    setTieBreakerScore(setIndex, scores) {
        this.state.tieBreakerScore[setIndex] = scores;
    }

    setPoint(playerIndex, point) {
        this.state.points[playerIndex] = point;
    }

    addWonSet(selector) {
        this.state.wonSets.push(selector);
    }

    setLatestEvent(level, text) {
        this.state.latestEvent = { level, text };
    }

    toJSON() {
        return this.state;
    }

    static fromJSON(json) {
        const instance = new MatchState();
        instance.state = typeof json === 'string' ? JSON.parse(json) : json;
        return instance;
    }

    clone() {
        return MatchState.fromJSON(JSON.parse(JSON.stringify(this.state)));
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = MatchState;
}
