import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import * as dotenv from "dotenv";
dotenv.config();
import "hardhat-gas-reporter";

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    mumbai: {
      url: process.env.RPC,
      accounts: process.env.PK !== undefined ? [process.env.PK] : [],
      blockGasLimit: 20000000,
    },
    taiko: {
      url: "https://l2rpc.hackathon.taiko.xyz",
      accounts: process.env.PK !== undefined ? [process.env.PK] : [],
    },
    sepolia: {
      url: "https://rpc.sepolia.org",
      accounts: process.env.PK !== undefined ? [process.env.PK] : [],
    },
    gnosis: {
      url: "https://gnosis-mainnet.public.blastapi.io",
      accounts: process.env.PK !== undefined ? [process.env.PK] : [],
    },
  },
};

export default config;
