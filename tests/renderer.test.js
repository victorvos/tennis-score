const UIRenderer = require('../js/renderer.js');

describe('UIRenderer', () => {
    let renderer;
    let mockConfig;
    let mockState;
    let mockJQuery;

    beforeEach(() => {
        mockConfig = {
            players: ['P1', 'P2'],
            sets: 3
        };
        mockState = {
            points: [0, 0],
            currentSet: 0,
            winner: -1,
            isTieBreakerActive: jest.fn().mockReturnValue(false),
            getGamesInSet: jest.fn().mockReturnValue([0, 0]),
            getTieBreakerScore: jest.fn().mockReturnValue([0, 0]),
            latestEvent: { text: '' },
            wonSets: []
        };

        // Mock jQuery
        mockJQuery = jest.fn().mockReturnValue({
            text: jest.fn(),
            html: jest.fn(),
            val: jest.fn(),
            addClass: jest.fn(),
            removeClass: jest.fn(),
            prop: jest.fn(),
            fadeOut: jest.fn().mockReturnThis(),
            fadeIn: jest.fn().mockReturnThis()
        });
        global.$ = mockJQuery;

        renderer = new UIRenderer(mockConfig, mockState);
    });

    test('should draw configuration names', () => {
        renderer.drawConfig();

        expect(mockJQuery).toHaveBeenCalledWith('#p1name');
        expect(mockJQuery).toHaveBeenCalledWith('#p2name');
    });

    test('should draw scores for active sets', () => {
        renderer.drawScores();

        expect(mockState.getGamesInSet).toHaveBeenCalledWith(0);
        expect(mockState.getGamesInSet).toHaveBeenCalledWith(1);
        expect(mockState.getGamesInSet).toHaveBeenCalledWith(2);
    });

    test('should handle winner state', () => {
        mockState.winner = 0;
        renderer.drawScores();

        // drawWinner calls setButtonDisabled which calls prop
        expect(mockJQuery).toHaveBeenCalledWith('#p1scoresBtn');
    });
});
