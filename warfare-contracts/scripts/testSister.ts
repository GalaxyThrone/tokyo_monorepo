import { ethers } from "hardhat";
import { Ships } from "../typechain-types";
// import typechain Ship struct

export async function testSister(shipsAddress: string) {
  let shipContract = (await ethers.getContractAt(
    "Ships",
    shipsAddress
  )) as Ships;

  const claim = await shipContract.addSisterContract(
    "0x9B41Fff0cAE65282931a0350815F643B59b36570"
  );

  await claim.wait();
}

if (require.main === module) {
  testSister("0x2bF2B35f593C44094267AD2cB56ae396465587Cc")
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
