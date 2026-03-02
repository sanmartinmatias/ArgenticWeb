// Shared types and interfaces for the game

export interface Position {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  name: string;
  position: Position;
  health: number;
  score: number;
  isAI: boolean;
}

export interface Enemy {
  id: string;
  position: Position;
  health: number;
  type: string;
}

export interface GameState {
  players: Map<string, Player>;
  enemies: Map<string, Enemy>;
  worldSize: { width: number; height: number };
  timestamp: number;
}

export interface LocationDescription {
  position: Position;
  description: string;
  nearbyPlayers: Array<{ id: string; name: string; distance: number }>;
  nearbyEnemies: Array<{ id: string; type: string; distance: number }>;
  terrain: string;
}

export enum InputAction {
  MOVE_UP = "MOVE_UP",
  MOVE_DOWN = "MOVE_DOWN",
  MOVE_LEFT = "MOVE_LEFT",
  MOVE_RIGHT = "MOVE_RIGHT",
  ATTACK = "ATTACK",
  GET_DESCRIPTION = "GET_DESCRIPTION"
}

export interface PlayerInput {
  playerId: string;
  action: InputAction;
  timestamp: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  apiCall?: string;
}
