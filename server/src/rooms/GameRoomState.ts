import { Schema, type, MapSchema } from "@colyseus/schema";

export class Position extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
}

export class Player extends Schema {
  @type("string") id: string = "";
  @type("string") name: string = "";
  @type(Position) position: Position = new Position();
  @type("number") health: number = 100;
  @type("number") score: number = 0;
  @type("boolean") isAI: boolean = false;
}

export class Enemy extends Schema {
  @type("string") id: string = "";
  @type(Position) position: Position = new Position();
  @type("number") health: number = 50;
  @type("string") type: string = "basic";
}

export class GameRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: Enemy }) enemies = new MapSchema<Enemy>();
  @type("number") worldWidth: number = 800;
  @type("number") worldHeight: number = 600;
  @type("number") timestamp: number = Date.now();
}
