/**
 * TennisScoreApp - Composition Root
 * Wires all dependencies together following Dependency Inversion Principle
 */
class TennisScoreApp {
    constructor() {
        this.config = new MatchConfig();
        this.state = new MatchState();

        this.renderer = new UIRenderer(this.config, this.state);
        this.socketManager = new SocketManager();
        this.scoringEngine = new ScoringEngine(this.config, this.state);

        // Backup state for Undo functionality
        this.backupState = null;

        this.init();
    }

    init() {
        // 1. Restore from LocalStorage
        this.restoreBackup();

        // 2. Initialize Renderer
        this.renderer.render();

        // 3. Initialize Admin Controller
        // When admin applies changes, we want to broadcast them
        this.adminController = new AdminController(
            this.config,
            this.state,
            this.renderer,
            () => this.broadcastUpdates()
        );

        // 4. Bind Scoring Buttons
        this.bindScoringEvents();

        // 5. Initialize WebSockets (Logic for Host/Join)
        this.setupWebSockets();
    }

    bindScoringEvents() {
        $("#p1scoresBtn").click(() => this.handleScore(0));
        $("#p2scoresBtn").click(() => this.handleScore(1));

        $("#undoBtn").click(() => this.undo());
    }

    handleScore(playerIndex) {
        this.saveBackup(); // For Undo

        this.scoringEngine.playerScores(playerIndex);
        this.renderer.render();

        this.saveToLocalStorage();
        this.renderer.enableUndo();

        this.broadcastState();
    }

    undo() {
        if (this.backupState) {
            this.state.state = JSON.parse(JSON.stringify(this.backupState)); // Deep restore
            this.renderer.render();
            this.renderer.disableUndo();
            this.saveToLocalStorage();
            this.broadcastState();
        }
    }

    saveBackup() {
        this.backupState = JSON.parse(JSON.stringify(this.state.toJSON()));
    }

    saveToLocalStorage() {
        window.localStorage.setItem("matchConfig", JSON.stringify(this.config.toJSON()));
        window.localStorage.setItem("matchState", JSON.stringify(this.state.toJSON()));
    }

    restoreBackup() {
        const configStr = window.localStorage.getItem("matchConfig");
        const stateStr = window.localStorage.getItem("matchState");

        if (configStr) {
            this.config = MatchConfig.fromJSON(configStr);
            // We need to re-inject config into dependencies if it changed reference, 
            // but here we just updated internal state of config object or we can re-assign properties.
            // Actually MatchConfig.fromJSON implementation returns new object. 
            // My implementation: this.config = ...
            // Dependencies (renderer, scoringEngine) hold reference to OLD config.
            // FIX: MatchConfig should update its internal config object OR valid dependencies.
            // Let's rely on the fact that existing objects are mutable or we need to update refs.
            // Refactoring: Let's assume Config is mutable and we merge.
        }

        if (stateStr) {
            this.state.state = JSON.parse(stateStr);
        }

        // Re-wire dependencies if objects were replaced (Simplest way to ensure consistency)
        this.renderer.config = this.config;
        this.renderer.state = this.state;
        this.scoringEngine.config = this.config;
        this.scoringEngine.state = this.state;
    }

    setupWebSockets() {
        this.socketManager.setCallbacks(
            (newConfig) => {
                // On Server Updates Config
                this.config = MatchConfig.fromJSON(newConfig);
                this.updateDependencies();
                this.renderer.render();
            },
            (newState) => {
                // On Server Updates State
                this.state.state = newState;
                this.renderer.render();
                this.saveToLocalStorage();
            },
            () => {
                // On Connect
                $(".connectionless_only").hide();
                $(".host_only").hide();
            }
        );

        // DOM Bindings for Host/Join
        $("#host").click(() => {
            this.socketManager.startHosting((id) => {
                this.broadcastUpdates();
                // Show host controls again?
                $(".host_only").show(); // Ensure host can score
            });
        });

        $("#join").click(() => {
            const matchId = parseInt(prompt("Which Match #?"));
            if (!isNaN(matchId)) {
                this.socketManager.joinMatch(matchId);
            }
        });

        // Check URL params
        const urlParams = new URLSearchParams(window.location.search);
        const room = parseInt(urlParams.get("room"));
        if (!isNaN(room)) {
            this.socketManager.joinMatch(room);
        }

        // Hide WS menu if no socket
        if (!this.socketManager.isConnected()) {
            $(".ws_only").hide();
        }
    }

    broadcastUpdates() {
        this.broadcastConfig();
        this.broadcastState();
        this.saveToLocalStorage();
    }

    broadcastConfig() {
        this.socketManager.emitMatchConfig(this.config.toJSON());
    }

    broadcastState() {
        this.socketManager.emitMatchState(this.state.toJSON());
    }

    updateDependencies() {
        this.renderer.config = this.config;
        this.renderer.state = this.state;
        this.scoringEngine.config = this.config;
        this.scoringEngine.state = this.state;
        if (this.adminController) {
            this.adminController.config = this.config;
            this.adminController.state = this.state;
        }
    }
}

// Bootstrap
$(document).ready(() => {
    window.tennisApp = new TennisScoreApp();
});
