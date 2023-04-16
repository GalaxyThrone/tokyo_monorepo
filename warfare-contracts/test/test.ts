import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Game, Ships, IShips } from "../typechain-types";
import { ContractFactory, Signer } from "ethers";
import { addShips } from "../scripts/addShipTypes";

async function mintShipsForPlayer(player: Signer, shipsContract: Ships) {
  await shipsContract.connect(player).faucet([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
}

describe("Game Contract", () => {
  let game: Game;
  let ships: Ships;
  let player1: Signer;
  let player2: Signer;
  let team1: any;
  let team2: any;

  beforeEach(async () => {
    const Ships = await ethers.getContractFactory("Ships");
    ships = (await Ships.deploy(
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      2
    )) as Ships;
    await ships.deployed();

    const Game = await ethers.getContractFactory("Game");

    game = (await Game.deploy(ships.address)) as Game;
    await game.deployed();

    await ships.setGame(game.address);

    await addShips(ships.address);

    const signers = await ethers.getSigners();
    player1 = signers[1];
    player2 = signers[2];

    // Mint ships and set approval for both players
    await mintShipsForPlayer(player1, ships);
    await mintShipsForPlayer(player2, ships);

    await ships.connect(player1).setApprovalForAll(game.address, true);
    await ships.connect(player2).setApprovalForAll(game.address, true);

    // Register both players
    team1 = [1, 2, 3];
    team2 = [11, 14, 20];
    await game.connect(player1).register(team1);
    await game.connect(player2).register(team2);
  });

  describe("initialize", () => {
    it("should set the ships contract address correctly", async () => {
      expect(await game.ships()).to.equal(ships.address);
    });
  });

  describe("register", () => {
    it("should correctly register players and transfer their ships to the game contract", async () => {
      const match = await game.getMatch(1);
      expect(match.player1).to.equal(await player1.getAddress());
      expect(match.team1).to.deep.equal(team1);
      expect(match.player2).to.equal(await player2.getAddress());
      expect(match.team2).to.deep.equal(team2);
    });
  });

  describe("takeTurn", () => {
    it("should correctly execute takeTurn and update the match state", async () => {
      const actions: [Game.ActionStruct, Game.ActionStruct, Game.ActionStruct] =
        [
          { fromShip: 1, toShip: 11, action: 1 },
          { fromShip: 2, toShip: 14, action: 1 },
          { fromShip: 3, toShip: 20, action: 1 },
        ];

      await game.connect(player1).takeTurn(1, actions);

      const match = await game.getMatch(1);
      expect(match.turn).to.equal(2);
    });

    it("should correctly handle invalid action in takeTurn and revert", async () => {
      const actions: [Game.ActionStruct, Game.ActionStruct, Game.ActionStruct] =
        [
          { fromShip: 1, toShip: 11, action: 5 },
          { fromShip: 2, toShip: 14, action: 1 },
          { fromShip: 3, toShip: 20, action: 1 },
        ];

      await expect(
        game.connect(player1).takeTurn(1, actions)
      ).to.be.revertedWith("Invalid action.");
    });

    it("should revert if the match doesn't exist", async () => {
      const actions: [Game.ActionStruct, Game.ActionStruct, Game.ActionStruct] =
        [
          { fromShip: 1, toShip: 11, action: 1 },
          { fromShip: 2, toShip: 14, action: 1 },
          { fromShip: 3, toShip: 20, action: 1 },
        ];

      await expect(
        game.connect(player1).takeTurn(999, actions)
      ).to.be.revertedWith("not playing");
    });

    it("should revert if the player is not part of the match", async () => {
      const actions: [Game.ActionStruct, Game.ActionStruct, Game.ActionStruct] =
        [
          { fromShip: 1, toShip: 11, action: 1 },
          { fromShip: 2, toShip: 14, action: 1 },
          { fromShip: 3, toShip: 20, action: 1 },
        ];

      const otherPlayer = (await ethers.getSigners())[3];
      await expect(
        game.connect(otherPlayer).takeTurn(1, actions)
      ).to.be.revertedWith("It is not your turn.");
    });

    it("should revert if it's not the player's turn", async () => {
      const actions: [Game.ActionStruct, Game.ActionStruct, Game.ActionStruct] =
        [
          { fromShip: 1, toShip: 11, action: 1 },
          { fromShip: 2, toShip: 14, action: 1 },
          { fromShip: 3, toShip: 20, action: 1 },
        ];

      await expect(
        game.connect(player2).takeTurn(1, actions)
      ).to.be.revertedWith("It is not your turn.");
    });

    it("should revert if the ship is not part of the player's team", async () => {
      const actions: [Game.ActionStruct, Game.ActionStruct, Game.ActionStruct] =
        [
          { fromShip: 1, toShip: 11, action: 1 },
          { fromShip: 2, toShip: 14, action: 1 },
          { fromShip: 4, toShip: 20, action: 1 },
        ];

      await expect(
        game.connect(player1).takeTurn(1, actions)
      ).to.be.revertedWith("The ship is not part of your team.");
    });

    it("should revert if the target ship is not part of the opponent's team", async () => {
      const actions: [Game.ActionStruct, Game.ActionStruct, Game.ActionStruct] =
        [
          { fromShip: 1, toShip: 11, action: 1 },
          { fromShip: 2, toShip: 14, action: 1 },
          { fromShip: 3, toShip: 1, action: 1 },
        ];

      await expect(
        game.connect(player1).takeTurn(1, actions)
      ).to.be.revertedWith(
        "The target ship is not part of the opponent's team."
      );
    });

    it("should revert if the same ship is used more than once in a turn", async () => {
      const actions: [Game.ActionStruct, Game.ActionStruct, Game.ActionStruct] =
        [
          { fromShip: 1, toShip: 11, action: 1 },
          { fromShip: 2, toShip: 14, action: 1 },
          { fromShip: 2, toShip: 20, action: 1 },
        ];

      await expect(
        game.connect(player1).takeTurn(1, actions)
      ).to.be.revertedWith("Each ship can only be used once per turn.");
    });
    it("should correctly execute takeTurn, update the match state and allow players to alternate turns", async () => {
      const actions1: [
        Game.ActionStruct,
        Game.ActionStruct,
        Game.ActionStruct
      ] = [
        { fromShip: 1, toShip: 11, action: 1 },
        { fromShip: 2, toShip: 14, action: 1 },
        { fromShip: 3, toShip: 20, action: 1 },
      ];

      const actions2: [
        Game.ActionStruct,
        Game.ActionStruct,
        Game.ActionStruct
      ] = [
        { fromShip: 11, toShip: 1, action: 1 },
        { fromShip: 14, toShip: 2, action: 1 },
        { fromShip: 20, toShip: 3, action: 1 },
      ];

      // Listen for TurnTaken events
      const turnTakenFilter = game.filters.TurnTaken(null, null);

      await game.connect(player1).takeTurn(1, actions1);

      // Verify if player1's turn event is emitted
      const eventsAfterTurn1 = await game.queryFilter(turnTakenFilter);
      expect(eventsAfterTurn1.length).to.equal(1);
      expect(eventsAfterTurn1[0].args.player).to.equal(
        await player1.getAddress()
      );

      await game.connect(player2).takeTurn(1, actions2);

      // Verify if player2's turn event is emitted
      const eventsAfterTurn2 = await game.queryFilter(turnTakenFilter);
      expect(eventsAfterTurn2.length).to.equal(2);
      expect(eventsAfterTurn2[1].args.player).to.equal(
        await player2.getAddress()
      );
    });
  });
});
