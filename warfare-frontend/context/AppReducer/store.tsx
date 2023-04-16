import { Contract, ethers, providers } from "ethers";
import { Game } from "lib/types/types";

export interface State {
  contracts: { game: Contract | null; ships: Contract | null };
  address: string | null;
  signer: ethers.Signer | null;
  provider: providers.JsonRpcProvider | undefined;
  ownedShips: any[];
  matches: Game[];
  isPlayer1Turn: boolean;
}

export const initialState: State = {
  contracts: { game: null, ships: null },
  address: null,
  signer: null,
  provider: undefined,
  ownedShips: [],
  matches: [],
  isPlayer1Turn: false,
};
