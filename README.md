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
graph LR
    %% Styling Classes
    classDef main fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:black
    classDef control fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:black
    classDef logic fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:black
    classDef data fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:black
    classDef view fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:black
    classDef actor fill:#fff,stroke:#333,stroke-width:2px,color:black,stroke-dasharray: 5 5

    %% 1. Actors (Input Sources)
    subgraph Actors [Users]
        direction TB
        Host((Host User)):::actor
        AdminUser((Admin)):::actor
    end

    %% 2. Initialization (Top)
    App[TennisScoreApp]:::main

    %% 3. Controllers (Left)
    subgraph Inputs [Controllers & Logic]
        direction TB
        Scoring[ScoringEngine]:::logic
        Admin[AdminController]:::control
    end

    %% 4. Model (Center)
    subgraph Model [Data Model]
        direction TB
        Config[MatchConfig]:::data
        State[MatchState]:::data
    end

    %% 5. Views (Right)
    subgraph Outputs [Views & Network]
        direction TB
        Renderer[UIRenderer]:::view
        Socket[SocketManager]:::view
    end

    %% Wiring (Initialization)
    App -- Creates --> Inputs
    App -- Creates --> Model
    App -- Creates --> Outputs

    %% User Input Flow
    Host -- Clicks Score Btns --> Scoring
    AdminUser -- Uses Panel --> Admin

    %% Data Flow (Left to Right)
    Admin -->|Updates| Config
    Admin -->|Updates| State
    Scoring -->|Updates| State

    %% Read Flow
    Config -.->|Reads| Renderer
    State -.->|Reads| Renderer
    
    Config -.->|Reads| Socket
    State -.->|Reads| Socket

    %% Triggers
    Admin -.-|Triggers| Renderer
```

## Author

themetalfleece
