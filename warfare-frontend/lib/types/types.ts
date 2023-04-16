export type Ship = {
  id?: number;
  name: string;
  attack: number;
  defense: number;
  health: number;
  energy: number;
  special1: number;
  special2: number;
  alive: boolean;
};

export type Game = {
  player1: string;
  player2: string;
  team1: number[];
  team2: number[];
  turn: number;
  lastMoveAt: number;
};
