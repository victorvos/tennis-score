const SocketManager = require('../js/socket-manager.js');

describe('SocketManager', () => {
    let manager;
    let mockIo;
    let mockSocket;

    beforeEach(() => {
        mockSocket = {
            on: jest.fn(),
            emit: jest.fn()
        };
        mockIo = {
            connect: jest.fn().mockReturnValue(mockSocket)
        };
        global.io = mockIo;

        // Mock jQuery selector
        global.$ = jest.fn().mockReturnValue({
            html: jest.fn()
        });

        manager = new SocketManager();
    });

    test('should report connected state based on io presence', () => {
        expect(manager.isConnected()).toBe(true);
        global.io = undefined;
        expect(manager.isConnected()).toBe(false);
    });

    test('should connect and setup listeners', () => {
        manager.connect();

        expect(mockIo.connect).toHaveBeenCalledWith('http://localhost:8080');
        expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('server_updates_config', expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('server_updates_state', expect.any(Function));
    });

    test('should emit match state', () => {
        manager.matchId = 123;
        manager.socket = mockSocket;

        const state = { points: [0, 0] };
        manager.emitMatchState(state);

        expect(mockSocket.emit).toHaveBeenCalledWith(
            'client_updates_state',
            123,
            JSON.stringify(state)
        );
    });
});
