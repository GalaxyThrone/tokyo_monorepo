import { ethers } from "hardhat";
import { Ships } from "../typechain-types";
// import typechain Ship struct

export async function addShips(shipsAddress: string) {
  let shipContract = (await ethers.getContractAt(
    "Ships",
    shipsAddress
  )) as Ships;

  const shipTypes = [
    {
      name: "Fighter",
      attack: 12,
      defense: 8,
      health: 50,
      energy: 20,
      special1: 2,
      special2: 5,
      alive: true,
    },
    {
      name: "Defender",
      attack: 8,
      defense: 12,
      health: 50,
      energy: 20,
      special1: 3,
      special2: 6,
      alive: true,
    },
    {
      name: "Healer",
      attack: 8,
      defense: 8,
      health: 50,
      energy: 25,
      special1: 1,
      special2: 4,
      alive: true,
    },
    {
      name: "Scout",
      attack: 10,
      defense: 10,
      health: 40,
      energy: 30,
      special1: 1,
      special2: 7,
      alive: true,
    },
    {
      name: "Assassin",
      attack: 14,
      defense: 6,
      health: 40,
      energy: 20,
      special1: 8,
      special2: 5,
      alive: true,
    },
    {
      name: "Tank",
      attack: 6,
      defense: 14,
      health: 60,
      energy: 20,
      special1: 3,
      special2: 6,
      alive: true,
    },
    {
      name: "Support",
      attack: 8,
      defense: 8,
      health: 50,
      energy: 30,
      special1: 1,
      special2: 4,
      alive: true,
    },
    {
      name: "Sniper",
      attack: 16,
      defense: 4,
      health: 40,
      energy: 20,
      special1: 7,
      special2: 5,
      alive: true,
    },
    {
      name: "Shielder",
      attack: 6,
      defense: 10,
      health: 50,
      energy: 25,
      special1: 3,
      special2: 4,
      alive: true,
    },
    {
      name: "Berserker",
      attack: 14,
      defense: 7,
      health: 45,
      energy: 20,
      special1: 2,
      special2: 8,
      alive: true,
    },
  ];

  const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const addShipTx = await shipContract.addShipTypes(shipTypes, ids);
  await addShipTx.wait();

  console.log("DONE SHIPTYPES");
}

if (require.main === module) {
  addShips("0x6faAe4df861D296b8baD3772bF4EFdC4A5A7251b")
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
