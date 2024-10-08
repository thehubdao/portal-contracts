const { config } = require("dotenv");
const { Contract } = require("ethers");
const { ERC725 } = require('@erc725/erc725.js')
const AvatarContractABI = require('../abi/AvatarContractABI.json')
const DropContractABI = require('../abi/DropContractABI.json')

config()

const schemas = [
  {
    name: 'LSP8MetadataTokenURI:bytes',
    key: '0x1339e76a390b7b9ec9010000b963e9b45d014edd60cff22ec9ad383335bbc3f8',
    keyType: 'Mapping',
    valueType: 'bytes',
    valueContent: '0xabe425d6',
  },
  {
    "name": "LSP4Metadata",
    "key": "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e",
    "keyType": "Singleton",
    "valueType": "bytes",
    "valueContent": "VerifiableURI"
  },
  {
    "name": "LSP4CreatorsMap:<address>",
    "key": "0x6de85eaf5d982b4e5da00000<address>",
    "keyType": "Mapping",
    "valueType": "(bytes4,uint128)",
    "valueContent": "(Bytes4,Number)"
  },
  {
    "name": "LSP4Creators[]",
    "key": "0x114bd03b3a46d48759680d81ebb2b414fda7d030a7105a851867accf1c2352e7",
    "keyType": "Array",
    "valueType": "address",
    "valueContent": "Address"
  }
];



//NOTE: This file is the main file to deploy contracts with hardhat, all the deployments are made from an EOA and ownership is consequently transfered to the UP

const _config = {
  ipfsGateway: 'ipfs://',
}


async function main() {
  const [deployer] = await ethers.getSigners();
  const { gasPrice } =
    await ethers.provider.getFeeData()
  await deployDrop(deployer, gasPrice)
  /* await deployCitizensProxy(deployer, gasPrice) */

}

async function deployDrop(deployer, gasPrice) {
  const contractFactory = await ethers.getContractFactory('Drop', DropContractABI, deployer)
  const proxy = await contractFactory.deploy({ gasPrice })
  const contractAddress = await proxy.getAddress()
  const dropContract = new Contract(contractAddress, DropContractABI, deployer)
  await dropContract.transferOwnership(process.env.UP_ADDRESS)
  
  console.log("Drop address:" + contractAddress)
}

async function deployCitizensProxy(deployer, gasPrice) {
  const contractFactory = await ethers.getContractFactory('AvatarProxyContract', deployer)
  const proxy = await contractFactory.deploy(process.env.EOA_ADDRESS, { gasPrice })
  const contractAddress = await proxy.getAddress()
  console.log("Proxy contract address:" + contractAddress)
}

async function deployLuksoCitizens(deployer, gasPrice) {
  const contractFactory = await ethers.getContractFactory('LuksoCitizens', deployer)
  const token = await contractFactory.deploy({ gasPrice })
  const contractAddress = await token.getAddress()
  //NOTE: check current provider on lukso docs, current=https://rpc.l16.lukso.network
  const avatarERC725Contract = new ERC725(schemas, contractAddress, 'https://rpc.l16.lukso.network', _config)
  const avatarContract = new Contract(contractAddress, AvatarContractABI, deployer)
  await avatarContract.waitForDeployment()

  const metadataDataKey = avatarERC725Contract.encodeKeyName('LSP4Metadata')
  const metadataDataValue = avatarERC725Contract.encodeData([
    {
      keyName: 'LSP4Metadata',
      value: {
        json: { "LSP4Metadata": { "description": "LUKSO Citizens is a collection of 1764 interoperable Avatars on the LUKSO Blockchain." } },
        url: 'https://nftstorage.link/ipfs/bafkreihvpcprxaffdqvydnhzbim5lvyd2wo4756kc34c7lals2n77qanom',
      },
    },
  ])

  const setMetadataDataTx = await avatarContract.setData(metadataDataKey, metadataDataValue.values[0])
  setMetadataDataTx.wait()

  const creatorDataValue = avatarERC725Contract.encodeData([
    {
      keyName: 'LSP4Creators[]',
      value: ['0xD579eA9De0e0Dbb77FB80811C004E2BEee3afdFB'],
    },
  ])

  const setCreatorArrayDataTx = await avatarContract.setData(creatorDataValue.keys[0], creatorDataValue.values[0])
  setCreatorArrayDataTx.wait()
  const setCreatorArrayElementsDataTx = await avatarContract.setData(creatorDataValue.keys[1], creatorDataValue.values[1])
  setCreatorArrayElementsDataTx.wait()
  const decodedData = avatarERC725Contract.decodeData([{ keyName: creatorDataValue.keys[0], value: creatorDataValue.values[1] }])

  console.log(creatorDataValue, decodedData)
  console.log("Avatar Contract address:", await avatarContract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });