import { Contract, ethers } from "ethers";
import { State } from "./store";

export type Action =
  | { type: "SET_CONTRACTS"; contracts: State["contracts"] }
  | { type: "SET_ADDRESS"; address: State["address"] }
  | { type: "SET_SIGNER"; signer: State["signer"] }
  | { type: "SET_PROVIDER"; provider: State["provider"] }
  | { type: "SET_OWNED_SHIPS"; ownedShips: State["ownedShips"] }
  | { type: "SET_MATCHES"; matches: State["matches"] }
  | { type: "SET_IS_PLAYER_1_TURN"; isPlayer1Turn: State["isPlayer1Turn"] };

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_CONTRACTS":
      return {
        ...state,
        contracts: action.contracts,
      };
    case "SET_ADDRESS":
      return {
        ...state,
        address: action.address,
      };
    case "SET_SIGNER":
      return {
        ...state,
        signer: action.signer,
      };
    case "SET_PROVIDER":
      return {
        ...state,
        provider: action.provider,
      };
    case "SET_OWNED_SHIPS":
      return {
        ...state,
        ownedShips: action.ownedShips,
      };
    case "SET_MATCHES":
      return {
        ...state,
        matches: action.matches,
      };
    case "SET_IS_PLAYER_1_TURN":
      return {
        ...state,
        isPlayer1Turn: action.isPlayer1Turn,
      };

    default:
      throw "Bad action type";
  }
};
