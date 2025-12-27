# UDP Tennis Scoreboard

A broadcast-ready tennis scoreboard application using **Node.js**, **Express**, and **Socket.io**.  
Refactored to be modular, testable, and SOLID-compliant.

## Description

This app allows you to display a real-time tennis scoreboard. One client acts as the host (controller) to update scores, while other clients (overlays, spectators) receive updates in real-time. It supports custom player names, set configuration (1, 3, or 5 sets), and full match logic including tie-breakers.

## Features

- **Real-time updates**: Instant score reflection across all connected clients.
- **Configurable**: Change player names, number of sets, and game rules.
- **Robust Logic**: Handles deuce, advantage, tie-breakers, and set transitions automatically.
- **Admin Panel**: Full control to override scores, names, or reset the match.
- **Modular Architecture**: Clean separation of concerns (Config, State, Scoring, Renderer).

## Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Start the Server
```bash
npm start
```
The server will start on port `8080`.

### Host a Match
1. Open `http://localhost:8080`.
2. Click **Broadcast**.
3. Use the interface to score points for Player 1 or Player 2.
4. Use the **Configure** button to change names or correct scores.

### Spectate/Overlay
1. Open `http://localhost:8080`.
2. Click **Spectate**.
3. Enter the Match ID of the host (shown on the Host's screen).

## Testing

The project uses **Jest** for unit testing.

```bash
npm test
```

## Project Structure

- `js/app.js`: Main entry point, wires up dependencies.
- `js/config.js`: Manages game configuration.
- `js/state.js`: Manages mutable game state (points, sets).
- `js/scoring.js`: Scoring rules engine.
- `js/renderer.js`: Handles UI updates.
- `js/socket-manager.js`: WebSocket communication.
- `js/admin.js`: Admin panel logic.
- `tests/`: Unit tests for all modules.

### Architecture

```mermaid
graph TD
    %% Main Entry Point
    App[TennisScoreApp] -->|Orchestrates| Config[MatchConfig]
    App -->|Orchestrates| State[MatchState]
    
    %% Dependencies
    App -->|Injects Data| Scoring[ScoringEngine]
    App -->|Injects Data| Renderer[UIRenderer]
    App -->|Injects Logic| Admin[AdminController]
    App -->|Callbacks| Socket[SocketManager]

    %% Interactions
    Scoring -->|Reads| Config
    Scoring -->|Updates| State

    Renderer -->|Reads| Config
    Renderer -->|Reads| State

    Admin -->|Updates| Config
    Admin -->|Updates| State
    Admin -->|Triggers| Renderer

    Socket -->|Broadcasts| Config
    Socket -->|Broadcasts| State
    
    %% Styling
    style App fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000
    style Config fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000
    style State fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000
    style Scoring fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000
    style Renderer fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#000
    style Admin fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000
    style Socket fill:#fff8e1,stroke:#fbc02d,stroke-width:2px,color:#000
```

## Author

themetalfleece
