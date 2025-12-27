const MatchState = require('../js/state.js');

describe('MatchState', () => {
    let state;

    beforeEach(() => {
        state = new MatchState();
    });

    test('should initialize with empty scores', () => {
        expect(state.points).toEqual([0, 0]);
        expect(state.currentSet).toBe(0);
        expect(state.winner).toBe(-1);
    });

    test('should update points', () => {
        state.setPoint(0, 3); // 40
        expect(state.points[0]).toBe(3);
    });

    test('should track games in sets', () => {
        state.setGamesInSet(0, [2, 1]);
        expect(state.getGamesInSet(0)).toEqual([2, 1]);
    });

    test('should handle tie breaker state', () => {
        expect(state.isTieBreakerActive(0)).toBe(false);
        state.setTieBreakerActive(0, true);
        expect(state.isTieBreakerActive(0)).toBe(true);
    });

    test('should serialize and deserialize', () => {
        state.setPoint(1, 2);
        state.currentSet = 1;

        const json = state.toJSON();
        const newState = MatchState.fromJSON(json);

        expect(newState.points[1]).toBe(2);
        expect(newState.currentSet).toBe(1);
    });
});
