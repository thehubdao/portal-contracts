const { ERC725 } = require('@erc725/erc725.js')
const { config } = require("dotenv");
const { Contract } = require("ethers");
const AvatarContractABI = require('../abi/AvatarContractABI.json')
const AvatarProxyContractABI = require('../abi/AvatarProxyContractABI.json')
const ethers = require('ethers')

const fs = require('fs')

config()


//NOTE: This file contains some helpful functions to make interactions with contracts from the owner EOA or calling view functions from contracts
//TODO: Finish organazing repeated strings


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
    "name": "LSP4Creators[]",
    "key": "0x114bd03b3a46d48759680d81ebb2b414fda7d030a7105a851867accf1c2352e7",
    "keyType": "Array",
    "valueType": "address",
    "valueContent": "Address"
  }
];
const _config = {
  ipfsGateway: 'ipfs://',
};
const RPC_URL = process.env.RPC_URL;

const provider = new ethers.JsonRpcProvider(RPC_URL)

const signer = new ethers.Wallet(process.env.EOA_PK, provider)

/* const avatarContract = new Contract('0x754a5D007d5F1188Ef0db892ee115a7c01b38fA3', AvatarContractABI, signer)
 */
const contractAddress = '0x74654920356257981f6b63a65ad72d4d9bc21929';


const avatarERC725Contract = new ERC725(schemas, contractAddress, RPC_URL, _config);

const IPFS_GATEWAY_URL = "https://api.universalprofile.cloud/ipfs"

const getAllCombinations = async () => {
  const avatarContract = new Contract(contractAddress, AvatarContractABI, provider)
  for (let index = 1; index <= 4200; index++) {
    const encodedTokenId = avatarERC725Contract.encodeValueType('uint256', index)
    const metadataDataKey = avatarERC725Contract.encodeKeyName('LSP4Metadata')
    const getDataForTokenIdTx = await avatarContract.getDataBatchForTokenIds(
      [encodedTokenId], [metadataDataKey]
    )
    const metadataFormattedArray = getDataForTokenIdTx.map((rawData) => {
      return { keyName: metadataDataKey, value: rawData }
    })
    const decodedData = avatarERC725Contract.decodeData(metadataFormattedArray)
    try {
      
      const cid = decodedData[0].value ? decodedData[0].value.url.split('//')[1]: `bafybeibtakbvx57vz2pz4vhacroncfk4cbra7utj2baoee2w43nhk626ju/${index}`
      const getCid = await (await fetch(`${IPFS_GATEWAY_URL}/${cid}`)).json()
      const metadata = getCid.LSP4Metadata
      const attributesArray = Object.values(metadata.body)
      const combination = attributesArray.map((attribute) => { return attribute.index }).join('-')
      
      fs.appendFile('combinations.txt', `${combination}\n`, (err) => {

        // In case of a error throw err.
        if (err) throw err;
    })

    } catch (err) {
      console.log(err)
      console.log(index + " NO METADATA")
    }

  }

}


/* getAllCombinations() */

const transferOwnership = async () => {
  const avatarContract = new Contract('0x4FB99a7ab547582646B9069eAB46F91dBAf31091', AvatarContractABI, signer)
  const transferOwnershipTx = await avatarContract.transferOwnership('0xfa39a2207f1d1c1cec32502000481f0fef660384')
  transferOwnershipTx.wait()
}

/* transferOwnership() */

const addOwner = async () => {
  const creatorDataValue = avatarERC725Contract.encodeData([
    {
      keyName: 'LSP4Creators[]',
      value: ['0xfa39A2207f1d1C1ceC32502000481F0feF660384'],
    },
  ])
  const avatarContract = new Contract(contractAddress, AvatarContractABI, signer)
  console.log(creatorDataValue.keys[0], creatorDataValue.values[0])
  const setCreatorArrayDataTx = await avatarContract.setData(creatorDataValue.keys[0], creatorDataValue.values[0])
  setCreatorArrayDataTx.wait()
  console.log(creatorDataValue.keys[1], creatorDataValue.values[1])
  const setCreatorArrayElementsDataTx = await avatarContract.setData(creatorDataValue.keys[1], creatorDataValue.values[1])
  setCreatorArrayElementsDataTx.wait()
  const decodedData = avatarERC725Contract.decodeData([{ keyName: creatorDataValue.keys[0], value: creatorDataValue.values[1] }])

  console.log(creatorDataValue, decodedData)
}

/* addOwner() */

const addWhitelist = async () => {
  const avatarProxyContract = new Contract('0x660Ae560BA97234b24Ebb2660E862735a43A4Df9', AvatarProxyContractABI, signer)
  const whitelistTx = await avatarProxyContract.updateWhitelistBulk([
    "0x424fD3bC9e987a62c8eF9678F15239f61519d50D"
  ], true)
  whitelistTx.wait()

}
/* addWhitelist()
 */
const mintTeamTokens = async () => {
  const targetContractAddress = '0x754a5D007d5F1188Ef0db892ee115a7c01b38fA3';
  const avatarContract = new ethers.Contract(
    targetContractAddress,
    AvatarContractABI,
    signer,
  );
  const address = '0xF808C53DBf41279c26397288Ce38d7fef70ffa26'
  for (let i = 0; i < 30; i++) {
    console.log(i)
    const totalSupply = await avatarContract.totalSupply()
    const cloneTokenId = Number(totalSupply) - 200
    console.log(Number(totalSupply) - 200)
    const encodedClonedTokenId = avatarERC725Contract.encodeValueType('uint256', cloneTokenId)
    const encodedTokenId = avatarERC725Contract.encodeValueType(
      'uint256',
      totalSupply,
    )
    const writableContract = avatarContract.connect(signer)
    const mintTx = await writableContract.mint(
      address,
      encodedTokenId,
      '0x')
    await mintTx.wait()

    const metadataDataKey = avatarERC725Contract.encodeKeyName('LSP4Metadata')

    const dataValue = await avatarContract.getDataForTokenId(encodedClonedTokenId, metadataDataKey)
    console.log(dataValue)
    const setDataForTokenIdTx = await avatarContract.setDataForTokenId(
      encodedTokenId, metadataDataKey, dataValue)

    await setDataForTokenIdTx.wait()
    console.log("Minted")
  }
}

/* mintTeamTokens() */

const setCollectionMetadata = async () => {
  const targetContractAddress = '0x754a5D007d5F1188Ef0db892ee115a7c01b38fA3';
  const avatarContract = new ethers.Contract(
    targetContractAddress,
    AvatarContractABI,
    signer,
  );

  const metadataDataKey = avatarERC725Contract.encodeKeyName('LSP4Metadata')
  const metadataDataValue = avatarERC725Contract.encodeData([
    {
      keyName: '0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1',
      value: {
        json: {
          "LSP4Metadata": {
            "name": "Lukso Creators",
            "description": "Lukso Creators are a collection of 4200 living on the Lukso Blockchain. Each NFT includes a VRM model, allowing its holder to use the 3D model on over 30 platforms. Owning a Lukso Creator opens the doors to THE HUB ecosystem including our IRL events, phygital fashion drops and games.", "links": [], "icon": [{ "width": 1080, "height": 1080, "url": "ipfs://bafybeidwurlpb73r73b2ibcq5p55dzbu5dbc4qfmpzyw2jgkmw5lxejtku", "verification": { "method": "keccak256(bytes)", "data": "0x94f1baebfc88426376a830b05ba66487088bd15877402cefaf8888b36ad8d794" } }], "backgroundImage": [{ "width": 1600, "height": 400, "url": "ipfs://bafybeiarj4g4tgbobb6z2rvuucgeci4iitrco4ubaoicxainpojipnakey", "verification": { "method": "keccak256(bytes)", "data": "0x2dee943ec1c40694d98aea35218daaccb8d9c4ab637a1f052bb587e608962d8f" } }], "assets": [{ "url": "ipfs://bafybeihhgntkw5yun7gwyifw2r2pqfsanmkdkom264zivwaejc5yomeahq", "fileType": "image/gif", "verification": { "method": "keccak256(bytes)", "data": "0xb3bb34f3e86aad0d83e9607d04d7786687569e23b08050feabcf5e9c2179c37b" } }], "images": []
          }
        },
        url: 'ipfs://QmcuBaRwiLNVwi8sZqZjN9Q4g2YY5MMtsoMzKXLtoLf2x4',
      },
    },
  ])

  const setMetadataDataTx = await avatarContract.setData(metadataDataKey, metadataDataValue.values[0])
  setMetadataDataTx.wait()

}

/* setCollectionMetadata() */

const setTokenMetadata = async () => {
  const targetContractAddress = '0x754a5D007d5F1188Ef0db892ee115a7c01b38fA3';
  const avatarContract = new ethers.Contract(
    targetContractAddress,
    AvatarContractABI,
    signer,
  );

  const metadataDataKey = avatarERC725Contract.encodeKeyName('LSP4Metadata')
  /*   const metadataDataValue = avatarERC725Contract.encodeData([
      {
        keyName: 'LSP4Metadata',
        value: {
          json: { "LSP4Metadata": { "description": "LUKSO Citizens is a collection of 1765 interoperable Avatars on the LUKSO Blockchain." } },
          url: 'ipfs://QmcuBaRwiLNVwi8sZqZjN9Q4g2YY5MMtsoMzKXLtoLf2x4',
        },
      },
    ]) */

  const setMetadataDataTx = await avatarContract.setDataForTokenId('0x0000000000000000000000000000000000000000000000000000000000000547', metadataDataKey, '0x')
  setMetadataDataTx.wait()

}
/* setTokenMetadata() */

const getFemaleBalances = async () => {
  const addresses = [
    '0xfa39a2207f1d1c1cec32502000481f0fef660384',
  ]
  const avatarContract = new Contract(contractAddress, AvatarContractABI, provider)
  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i]
    const femaleBalance = Number(await avatarContract.balanceOf(address))
    const arrayElement = { address, femaleBalance }
    console.log(arrayElement, i)

  }

}
/* getFemaleBalances() */