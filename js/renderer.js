/**
 * UIRenderer - Single Responsibility: Handle all UI rendering
 * Dependency Inversion: Depends on abstractions (config, state) not concrete implementations
 */
class UIRenderer {
    constructor(config, state) {
        this.config = config;
        this.state = state;
        this.pointTrans = [0, 15, 30, 40, "AD"];
    }

    // Draw everything
    render() {
        this.drawConfig();
        this.drawScores();
    }

    drawConfig() {
        this._hideShowSets();
        this.setText("#p1name", this.config.players[0]);
        this.setText("#p2name", this.config.players[1]);
        this.setText("#p1scoresBtn", this.config.players[0]);
        this.setText("#p2scoresBtn", this.config.players[1]);
    }

    drawScores() {
        this.drawPoints();

        // Temporarily save current set to iterate through all sets for drawing
        const actualCurrentSet = this.state.currentSet;
        const setsToDraw = this.config.sets;

        for (let i = 0; i < setsToDraw; i++) {
            // We pretend the current set is 'i' to check tiebreaker status for that set
            // But getGamesInSet just takes an index, so we can use that directly.
            // The original code set matchState.currentSet = i, which might have been needed for some shared state access.

            // Check if tiebreaker was active in this set
            const isTieBreak = this.state.isTieBreakerActive(i);
            this.drawGamesInSet(i, isTieBreak);
            this.markSetRemove(i + 1);
        }

        // Highlight the current set header
        if (this.state.winner === -1) {
            this.markSetAdd(actualCurrentSet + 1);
        } else {
            this.drawWinner();
        }

        // Highlight won sets
        // Clear all bold first? Original code adds class 'bold' but doesn't seem to remove it for reset?
        // We should probably remove 'bold' from all pXsetY before re-adding.
        $(".bold").removeClass("bold");

        this.state.wonSets.forEach(selector => {
            $(selector).addClass("bold");
        });

        this.setText("#latestEvent", this.state.latestEvent.text);
    }

    drawPoints() {
        const currentSet = this.state.currentSet;
        const points = this.state.points;
        const tieBreakScores = this.state.getTieBreakerScore(currentSet);
        const isTieBreak = this.state.isTieBreakerActive(currentSet);

        if (!isTieBreak) {
            this.fadeHtml("#p1points", this.pointTrans[points[0]]);
            this.fadeHtml("#p2points", this.pointTrans[points[1]]);
        } else {
            this.fadeHtml("#p1points", tieBreakScores[0]);
            this.fadeHtml("#p2points", tieBreakScores[1]);
        }
    }

    drawGamesInSet(setIndex, showTieBreakerScore) {
        const games = this.state.getGamesInSet(setIndex);
        const tieBreakScores = this.state.getTieBreakerScore(setIndex);

        // Set index is 0-based, UI IDs are 1-based
        const setNum = setIndex + 1;

        let p1Html = games[0];
        let p2Html = games[1];

        if (showTieBreakerScore) {
            p1Html += `<sup>${tieBreakScores[0]}</sup>`;
            p2Html += `<sup>${tieBreakScores[1]}</sup>`;
        }

        this.fadeHtml(`#p1set${setNum}`, p1Html);
        this.fadeHtml(`#p2set${setNum}`, p2Html);
    }

    drawWinner() {
        this.setButtonDisabled("#p1scoresBtn", true);
        this.setButtonDisabled("#p2scoresBtn", true);
    }

    resetButtons() {
        this.setButtonDisabled("#p1scoresBtn", false);
        this.setButtonDisabled("#p2scoresBtn", false);
        this.setButtonDisabled("#undoBtn", true);
    }

    enableUndo() {
        this.setButtonDisabled("#undoBtn", false);
    }

    disableUndo() {
        this.setButtonDisabled("#undoBtn", true);
    }

    toggleAdminPanel(isVisible) {
        if (isVisible) {
            $("#adminPanel").removeClass("hidden");
            $("#adminBtn").addClass("btn-primary");
        } else {
            $("#adminPanel").addClass("hidden");
            $("#adminBtn").removeClass("btn-primary");
        }
    }

    // --- Helpers ---

    _hideShowSets() {
        const maxSets = 5; // Hardcoded in HTML
        const activeSets = this.config.sets;

        for (let i = 1; i <= maxSets; i++) {
            if (i <= activeSets) {
                $(`#set${i}head`).removeClass("hidden");
                $(`#admin_set${i}head`).removeClass("hidden");
                for (let j = 1; j <= 2; j++) {
                    $(`#p${j}set${i}`).removeClass("hidden");
                    $(`#admin_p${j}set${i}`).removeClass("hidden");
                }
            } else {
                $(`#set${i}head`).addClass("hidden");
                $(`#admin_set${i}head`).addClass("hidden");
                for (let j = 1; j <= 2; j++) {
                    $(`#p${j}set${i}`).addClass("hidden");
                    $(`#admin_p${j}set${i}`).addClass("hidden");
                }
            }
        }
    }

    markSetRemove(setNum) {
        $(`#set${setNum}head`).removeClass("success");
    }

    markSetAdd(setNum) {
        $(`#set${setNum}head`).addClass("success");
    }

    setText(selector, text) {
        $(selector).text(text);
    }

    setButtonDisabled(selector, disabled) {
        $(selector).prop("disabled", disabled);
    }

    fadeHtml(selector, html) {
        const el = $(selector);
        // Rough check to avoid unnecessary animation if content is same (assuming simple content)
        // Note: .html() returns innerHTML, so generic comparisons might tricky, but fine for numbers/strings
        if (el.html() != html) {
            el.fadeOut("fast", function () {
                $(this).html(html);
            }).fadeIn("fast");
        }
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = UIRenderer;
}
