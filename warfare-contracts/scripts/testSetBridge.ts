import { ethers } from "hardhat";
import { Ships } from "../typechain-types";
// import typechain Ship struct

export async function testProof(shipsAddress: string) {
  let shipContract = (await ethers.getContractAt(
    "Ships",
    shipsAddress
  )) as Ships;

  const claim = await shipContract.setNftBridge(
    "0x5037C611B29FA623Ed82F9DD923f5343F15180D1"
  );

  await claim.wait();
}

if (require.main === module) {
  testProof("0x2bF2B35f593C44094267AD2cB56ae396465587Cc")
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
