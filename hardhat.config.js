const { config } = require("dotenv");

require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
config()


const PK = process.env.EOA_PK
const PK_DEV = process.env.EOA_PK_TESTNET

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    luksoT:{
      live: true,
      url: "https://rpc.testnet.lukso.network",
      chainId: 4201,
      accounts: [PK_DEV]
    },
    luksoM: {
      live: true,
      url: "https://rpc.mainnet.lukso.network",
      chainId: 42,
      accounts: [PK]
    },

  },
  etherscan: {
    // no API is required to verify contracts
    // via the Blockscout instance of LUKSO Testnet
    apiKey: "no-api-key-needed",
    customChains: [
      {
        network: "luksoTestnet",
        chainId: 4201,
        urls: {
          apiURL: "https://api.explorer.execution.testnet.lukso.network/api",
          browserURL: "https://explorer.execution.testnet.lukso.network",
        },
      },
      {
        network: "luksoMainnet",
        chainId: 42,
        urls: {
          apiURL: "https://api.explorer.execution.mainnet.lukso.network/api",
          browserURL: "https://explorer.execution.mainnet.lukso.network",
        },
      },
    ],
  },
};