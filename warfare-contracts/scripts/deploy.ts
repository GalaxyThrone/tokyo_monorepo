import { ethers, upgrades } from "hardhat";
import { addShips } from "./addShipTypes";

async function main() {
  const Ships = await ethers.getContractFactory("Ships");
  const ships = await Ships.deploy(
    ethers.constants.AddressZero,
    ethers.constants.AddressZero,
    0
    // {
    //   gasLimit: 5000000,
    // }
  );
  await ships.deployed();

  console.log("Ships deployed to:", ships.address);

  const Game = await ethers.getContractFactory("Game");
  const game = await Game.deploy(
    ships.address
    //   {
    //   gasLimit: 5000000,
    // }
  );
  await game.deployed();

  await ships.setGame(game.address);

  console.log("Game deployed to:", game.address);

  await addShips(ships.address);

  console.log("Added Ships");

  // await ships.addSisterContract("0x048A645062893f9152d8165829710DBD9d131a28");

  console.log("DEPLOY AND SETUP COMPLETED");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
