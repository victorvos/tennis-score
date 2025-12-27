/**
 * SocketManager - Single Responsibility: Handle all WebSocket communications
 * Interface Segregation: Only exposes methods needed for socket operations
 */
class SocketManager {
    constructor(socketAddress = "http://localhost:8080") {
        this.socketAddress = socketAddress;
        this.socket = null;
        this.matchId = null;
        this.callbacks = {
            onConfigUpdate: () => { },
            onStateUpdate: () => { },
            onConnect: () => { }
        };
    }

    setCallbacks(onConfigUpdate, onStateUpdate, onConnect) {
        this.callbacks.onConfigUpdate = onConfigUpdate;
        this.callbacks.onStateUpdate = onStateUpdate;
        this.callbacks.onConnect = onConnect;
    }

    isConnected() {
        // Check if io is defined (from global script include)
        return typeof io !== 'undefined';
    }

    connect(isHost = false) {
        if (!this.isConnected()) return;

        console.log(`initializing socket connection`);
        this.socket = io.connect(this.socketAddress);
        console.log(`socket connected`);

        this.socket.on("connect", () => {
            this.callbacks.onConnect();
            if (isHost) {
                this.socket.emit("addhost");
                console.log(`host added`);
            } else if (this.matchId) {
                this.socket.emit("addlistener", this.matchId);
            }
        });

        this.socket.on("server_updates_config", (configStr) => {
            this.callbacks.onConfigUpdate(JSON.parse(configStr));
        });

        this.socket.on("server_updates_state", (stateStr) => {
            this.callbacks.onStateUpdate(JSON.parse(stateStr));
        });

        this.socket.on("basic_info", (id) => {
            this.matchId = id;
            $("#ws_status").html(`Broadcasting Match # ${this.matchId}<br>`);
            // Notify app that we have a match ID and should sync initial data
            // We can expose an event or return a promise, but for now we'll trigger a sync
            // if this was an "addhost" flow. The best way is to let the app handle the logic.
            // For now, we'll just log it. 
            // NOTE: App needs to listen to this to start broadcasting.
            // We'll emit a custom event or callback?
            if (this.onMatchIdAssigned) this.onMatchIdAssigned(id);
        });
    }

    joinMatch(matchId) {
        this.matchId = matchId;
        this.connect(false);
    }

    startHosting(onMatchIdAssigned) {
        this.onMatchIdAssigned = onMatchIdAssigned;
        this.connect(true);
    }

    emitMatchState(state) {
        if (this.socket && this.matchId) {
            this.socket.emit("client_updates_state", this.matchId, JSON.stringify(state));
        }
    }

    emitMatchConfig(config) {
        if (this.socket && this.matchId) {
            this.socket.emit("client_updates_config", this.matchId, JSON.stringify(config));
        }
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = SocketManager;
}
