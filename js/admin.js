/**
 * AdminController - Single Responsibility: Handle admin panel operations
 */
class AdminController {
    constructor(config, state, renderer, onApply) {
        this.config = config;
        this.state = state;
        this.renderer = renderer;
        this.onApply = onApply;

        this.bindEvents();
    }

    bindEvents() {
        $("#adminBtn").click(() => {
            $("#adminPanel").toggleClass("hidden");
            $("#adminBtn").toggleClass("btn-primary");

            const isVisible = !$("#adminPanel").hasClass("hidden");
            if (isVisible) {
                this.populateAdminPanel();
            }
        });

        $("#applyBtn").click(() => {
            this.applyChanges();
        });

        $("#resetBtn").click(() => {
            $("#confirmResetModal").modal({ backdrop: "static", keyboard: false })
                .one("click", "#confirmResetBtn", () => {
                    this.resetMatch();
                });
        });
    }

    populateAdminPanel() {
        // Configuration
        $("#sets").val(this.config.sets);
        $("#gamesPerSet").val(this.config.gamesPerSet);
        $("#tieBreakerPoints").val(this.config.tieBreakerPoints);
        $("#currentSet").val(parseInt(this.state.currentSet) + 1);

        // Names
        $("#admin_p1nameInput").val(this.config.players[0] === "Player 1" ? "" : this.config.players[0]);
        $("#admin_p2nameInput").val(this.config.players[1] === "Player 2" ? "" : this.config.players[1]);

        // Points
        $("#admin_p1pointsInput").val(this.state.points[0]);
        $("#admin_p2pointsInput").val(this.state.points[1]);

        // Games history
        for (let i = 0; i < this.config.sets; i++) {
            const games = this.state.getGamesInSet(i);
            $(`#admin_p1set${i + 1}Input`).val(games[0]);
            $(`#admin_p2set${i + 1}Input`).val(games[1]);
        }
    }

    applyChanges() {
        // 1. Update Config
        const p1Name = $("#admin_p1nameInput").val();
        const p2Name = $("#admin_p2nameInput").val();
        this.config.setPlayerName(0, p1Name);
        this.config.setPlayerName(1, p2Name);

        this.config.sets = $("#sets").val();
        this.config.gamesPerSet = $("#gamesPerSet").val();
        this.config.tieBreakerPoints = $("#tieBreakerPoints").val();

        // 2. Update State
        // Current set is 0-indexed internally
        this.state.currentSet = parseInt($("#currentSet").val()) - 1;

        this.state.setPoint(0, parseInt($("#admin_p1pointsInput").val()));
        this.state.setPoint(1, parseInt($("#admin_p2pointsInput").val()));

        // Update games for visible sets
        // Careful: loop up to current configured sets
        for (let i = 0; i < this.config.sets; i++) {
            const p1Games = parseInt($(`#admin_p1set${i + 1}Input`).val());
            const p2Games = parseInt($(`#admin_p2set${i + 1}Input`).val());
            this.state.setGamesInSet(i, [p1Games, p2Games]);
        }

        // Reset event text on manual override
        this.state.setLatestEvent(0, "");

        // 3. UI & Logic
        this.renderer.resetButtons();
        this.renderer.disableUndo();
        this.renderer.render();

        // Close panel
        this.renderer.toggleAdminPanel(false);

        // Callback to emit updates
        if (this.onApply) this.onApply();
    }

    resetMatch() {
        // 1. Reset State
        this.state.reset();

        // 2. Reset Admin Inputs (Visual Cleanup)
        $("#currentSet").val(1);
        $("#admin_p1pointsInput").val(0);
        $("#admin_p2pointsInput").val(0);

        // Reset inputs for all potential sets
        for (let i = 1; i <= 5; i++) {
            $(`#admin_p1set${i}Input`).val(0);
            $(`#admin_p2set${i}Input`).val(0);
        }

        // 3. Apply essentially does the sync + render + emit
        // But we just called reset(), so we don't want to read from inputs that might be stale if we didn't just update them above.
        // So we just re-render and emit.
        this.renderer.resetButtons();
        this.renderer.disableUndo();

        // We simulate an 'Apply' to ensure everything syncs up, 
        // but Apply reads from Inputs. So we must ensure Inputs are cleared first (which we did).
        // Or we can just trigger applyBtn click?
        // Better to call applyChanges logic directly but we need to ensure the Config isn't reset?
        // The original code uses Apply button after resetting inputs.

        $("#applyBtn").click();
    }
}
