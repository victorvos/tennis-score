const MatchConfig = require('../js/config.js');

describe('MatchConfig', () => {
    test('should initialize with default values', () => {
        const config = new MatchConfig();
        expect(config.gamesPerSet).toBe(6);
        expect(config.sets).toBe(3);
        expect(config.tieBreakerPoints).toBe(7);
        expect(config.players).toEqual(['Player 1', 'Player 2']);
    });

    test('should update configuration values', () => {
        const config = new MatchConfig();
        config.sets = 5;
        config.gamesPerSet = 4;
        expect(config.sets).toBe(5);
        expect(config.gamesPerSet).toBe(4);
    });

    test('should update player names', () => {
        const config = new MatchConfig();
        config.setPlayerName(0, 'Alice');
        config.setPlayerName(1, 'Bob');
        expect(config.players[0]).toBe('Alice');
        expect(config.players[1]).toBe('Bob');
    });

    test('should handle JSON serialization', () => {
        const config = new MatchConfig();
        config.setPlayerName(0, 'Test Player');
        const json = config.toJSON();
        const newConfig = MatchConfig.fromJSON(json);
        expect(newConfig.players[0]).toBe('Test Player');
        expect(newConfig.sets).toBe(config.sets);
    });
});
