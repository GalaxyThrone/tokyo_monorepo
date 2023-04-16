import { BigNumber } from "ethers";

export const addressShortFormat = (address: string, amount?: number) => {
  if (!amount) amount = 4;
  return (
    address.slice(0, amount) +
    "..." +
    address.slice(address.length - amount, address.length)
  );
};

export const chainSelection = [
  {
    name: "ethereum",
    subchains: [{ name: "SEPOLIA" }, { name: "GOERLI" }],
    img: "/brand/eth.png",
  },
  {
    name: "polygon",
    subchains: [{ name: "ZK EVM TESTNET" }],
    img: "/brand/polygon.png",
  },
  {
    name: "taiko",
    subchains: [{ name: "TAIKO A2 HACKATHON TESTNET" }],
    img: "/brand/taiko.jpeg",
  },
];

export const chainImages = {
  ethereum: "/brand/eth.png",
  polygon: "/brand/polygon.png",
  taiko: "/brand/taiko.jpeg",
};

export const getChainImgUrl = (subchainName) => {
  // Find the object in chainSelection that has the subchain with the given name
  const chainObj = chainSelection.find((chain) => {
    return chain.subchains.some((subchain) => subchain.name === subchainName);
  });

  // Use the name of the found chain object to get its image URL from chainImages
  return chainImages[chainObj.name];
};

export const isBigNumber = (value) => {
  return value instanceof BigNumber;
};
