import { ethers } from "hardhat";
import { Ships } from "../typechain-types";
// import typechain Ship struct

export async function testTransferNft(shipsAddress: string) {
  let shipContract = (await ethers.getContractAt(
    "Ships",
    shipsAddress
  )) as Ships;

  const faucet = await shipContract.faucet([1, 2, 3]);
  await faucet.wait();

  const transfer = await shipContract[
    "safeTransferFrom(address,address,uint256)"
  ](
    "0x13120DFedaa8Ec13CD363dccF764FBe41e77a50D",
    "0x0363AA31FD5b7B273E3698F12c83fbDA92e74e85",
    1
  );

  await transfer.wait();

  console.log("DONE TESTBRIDGE");
  // const ship = await shipContract.getShip(1);
  // console.log(ship);
}

if (require.main === module) {
  testTransferNft("0x048A645062893f9152d8165829710DBD9d131a28")
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
