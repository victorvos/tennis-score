const ScoringEngine = require('../js/scoring.js');
const MatchConfig = require('../js/config.js');
const MatchState = require('../js/state.js');

describe('ScoringEngine', () => {
    let config;
    let state;
    let engine;

    beforeEach(() => {
        config = new MatchConfig();
        state = new MatchState();
        engine = new ScoringEngine(config, state);
    });

    test('should increment points correctly', () => {
        engine.playerScores(0); // 15
        expect(state.points[0]).toBe(1);
        expect(state.points[1]).toBe(0);

        engine.playerScores(0); // 30
        expect(state.points[0]).toBe(2);
    });

    test('should win game after 40', () => {
        // 0 -> 15 -> 30 -> 40 -> Win
        state.setPoint(0, 3); // 40
        engine.playerScores(0);

        expect(state.points[0]).toBe(0);
        expect(state.getGamesInSet(0)[0]).toBe(1);
    });

    test('should handle deuce', () => {
        state.setPoint(0, 3); // 40
        state.setPoint(1, 3); // 40

        engine.playerScores(0); // Advantage P1
        expect(state.points[0]).toBe(4);
        expect(state.points[1]).toBe(3);

        engine.playerScores(1); // Back to Deuce
        expect(state.points[0]).toBe(3);
        expect(state.points[1]).toBe(3);
    });

    test('should win set', () => {
        config.gamesPerSet = 6;
        state.setGamesInSet(0, [5, 0]);

        // Win last game
        state.setPoint(0, 3);
        engine.playerScores(0);

        expect(state.getGamesInSet(0)[0]).toBe(6);
        expect(state.wonSets).toContain('#p1set1');
        expect(state.currentSet).toBe(1);
    });

    test('should trigger tie breaker at 6-6', () => {
        state.setGamesInSet(0, [5, 6]);
        // Win game to make it 6-6
        state.setPoint(0, 3);
        engine.playerScores(0);

        expect(state.getGamesInSet(0)).toEqual([6, 6]);
        expect(state.isTieBreakerActive(0)).toBe(true);
    });

    test('should handle tie breaker scoring', () => {
        state.setTieBreakerActive(0, true);

        engine.playerScores(0);
        expect(state.getTieBreakerScore(0)[0]).toBe(1);
    });
});
