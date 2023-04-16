import { Contract, Signer } from "ethers";
import { GAME_CONTRACT_ADDRESS, SHIPS_CONTRACT_ADDRESS } from "lib/contracts";
import GameABI from "lib/abis/Game.json";
import ShipsABI from "lib/abis/Ships.json";
import { Action } from "./reducer";
import { shipImages } from "lib/ships";
import { isBigNumber } from "lib";

export const getContracts = (
  signer: Signer,
  dispatch: React.Dispatch<Action>
) => {
  const game = new Contract(GAME_CONTRACT_ADDRESS, GameABI.abi, signer);
  const ships = new Contract(SHIPS_CONTRACT_ADDRESS, ShipsABI.abi, signer);

  dispatch({ type: "SET_CONTRACTS", contracts: { game, ships } });
};

export const batchMint = async (contracts, signer, dispatch) => {
  if (contracts?.ships && signer) {
    try {
      const { ships } = contracts;
      const batchMintTx = await ships.faucet([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const recipt = await batchMintTx.wait();
      if (Number(recipt.status) == 1) {
        console.log("success");
        fetchOwnedShips(contracts, signer.getAddress(), dispatch);
      }
    } catch (error) {
      console.log(error);
    }
  }
};

export const fetchOwnedShips = async (
  contracts,
  address,
  dispatch: React.Dispatch<Action>
) => {
  if (contracts?.ships && address) {
    try {
      const shipCount = await contracts.ships.balanceOf(address);
      const tokenIdsPromises = [];

      for (let i = 0; i < shipCount; i++) {
        tokenIdsPromises.push(contracts.ships.tokenOfOwnerByIndex(address, i));
      }

      const tokenIds = await Promise.all(tokenIdsPromises);
      const shipsPromises = tokenIds.map((tokenId) =>
        contracts.ships
          .getShip(tokenId)
          .then((ship) => ({ ...ship, id: tokenId }))
      );

      const ships = await Promise.all(shipsPromises);

      ships.forEach((ship) => {
        Object.keys(ship).forEach((key) => {
          if (isBigNumber(ship[key])) {
            ship[key] = ship[key].toString();
          }
        });
        ship.image = shipImages[ship.name.toLowerCase()];
      });

      dispatch({ type: "SET_OWNED_SHIPS", ownedShips: ships });
    } catch (error) {
      console.log(error);
    }
  }
};

export const checkPlayerTurn = (
  game,
  address,
  dispatch: React.Dispatch<Action>
) => {
  const player1Address = game?.player1;
  const player2Address = game?.player2;
  const turn = game?.turn;

  if (turn === 1 && player1Address.toLowerCase() === address.toLowerCase()) {
    dispatch({ type: "SET_IS_PLAYER_1_TURN", isPlayer1Turn: true });
  } else if (
    turn === 2 &&
    player2Address.toLowerCase() === address.toLowerCase()
  ) {
    dispatch({ type: "SET_IS_PLAYER_1_TURN", isPlayer1Turn: false });
  }
};
