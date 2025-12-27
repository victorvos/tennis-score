/**
 * MatchConfig - Single Responsibility: Manage match configuration
 * Handles all configuration-related operations and constants.
 */
class MatchConfig {
  static DEFAULT_CONFIG = {
    gamesPerSet: 6,
    sets: 3,
    tieBreakerPoints: 7,
    players: ["Player 1", "Player 2"],
  };

  constructor(initialConfig) {
    this.config = { ...MatchConfig.DEFAULT_CONFIG, ...initialConfig };
  }

  get gamesPerSet() {
    return this.config.gamesPerSet;
  }
  set gamesPerSet(val) {
    this.config.gamesPerSet = parseInt(val);
  }

  get sets() {
    return this.config.sets;
  }
  set sets(val) {
    this.config.sets = parseInt(val);
  }

  get tieBreakerPoints() {
    return this.config.tieBreakerPoints;
  }
  set tieBreakerPoints(val) {
    this.config.tieBreakerPoints = parseInt(val);
  }

  get players() {
    return this.config.players;
  }
  setPlayerName(index, name) {
    if (index >= 0 && index < 2) {
      this.config.players[index] = name || `Player ${index + 1}`;
    }
  }

  toJSON() {
    return this.config;
  }

  static fromJSON(json) {
    return new MatchConfig(typeof json === 'string' ? JSON.parse(json) : json);
  }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = MatchConfig;
}
