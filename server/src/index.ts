import express from "express";
import { createServer } from "http";
import { Server } from "colyseus";
import { monitor } from "@colyseus/monitor";
import cors from "cors";
import { GameRoom } from "./rooms/GameRoom";

const app = express();
const port = Number(process.env.PORT) || 2567;

app.use(cors());
app.use(express.json());

const server = createServer(app);
const gameServer = new Server({
  server,
});

// Register the game room
gameServer.define("game", GameRoom);

// REST API endpoints for AI agents
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// Get available rooms
app.get("/api/rooms", async (req, res) => {
  res.json({ success: true, message: "Use WebSocket to connect to game rooms at /game" });
});

// API documentation endpoint
app.get("/api/docs", (req, res) => {
  res.json({
    endpoints: {
      "GET /api/health": "Check server health",
      "GET /api/rooms": "List available game rooms",
      "GET /api/docs": "API documentation",
      "WebSocket /game": "Connect to game room"
    },
    websocketMessages: {
      input: {
        description: "Send player input",
        example: { action: "MOVE_UP" },
        actions: ["MOVE_UP", "MOVE_DOWN", "MOVE_LEFT", "MOVE_RIGHT", "ATTACK"]
      },
      get_description: {
        description: "Get current location description",
        example: "Send message 'get_description' without body"
      },
      ai_action: {
        description: "AI agent action (same as input)",
        example: { action: "MOVE_UP" }
      }
    },
    keyboardMapping: {
      ArrowUp: "MOVE_UP",
      KeyW: "MOVE_UP",
      ArrowDown: "MOVE_DOWN",
      KeyS: "MOVE_DOWN",
      ArrowLeft: "MOVE_LEFT",
      KeyA: "MOVE_LEFT",
      ArrowRight: "MOVE_RIGHT",
      KeyD: "MOVE_RIGHT",
      Space: "ATTACK",
      KeyL: "GET_DESCRIPTION"
    }
  });
});

// Monitor panel (optional, for debugging)
app.use("/colyseus", monitor());

gameServer.listen(port);

console.log(`🎮 Game server listening on http://localhost:${port}`);
console.log(`📊 Monitor available at http://localhost:${port}/colyseus`);
console.log(`📖 API docs at http://localhost:${port}/api/docs`);
