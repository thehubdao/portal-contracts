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
const IPFS_GATEWAY_API_KEY = "4gnf45tj05cp95oe2t1n"

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
  const avatarContract = new Contract('0x754a5d007d5f1188ef0db892ee115a7c01b38fa3', AvatarContractABI, signer)
  console.log(signer)
  const transferOwnershipTx = await avatarContract.transferOwnership('0xfa39a2207f1d1c1cec32502000481f0fef660384')
  transferOwnershipTx.wait()
}

/* transferOwnership() */

const transferDropOwnership = async () => {
  const avatarContract = new Contract('0xeC2c84fa653bdB61aac4b87580a96C0A29a80a00', AvatarContractABI, signer)
  console.log(signer)
  const transferOwnershipTx = await avatarContract.transferOwnership('0xfa39a2207f1d1c1cec32502000481f0fef660384')
  transferOwnershipTx.wait()
}

/* transferDropOwnership() */

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
    '0xda5533b1a2ba24c7215dda4257c126c94a9cb9ba',
    '0x8e343c7137d4f2cfdcd53fd7dabaa6a5b83dfacd',
    '0x75cb3e61ca356aa691d503b129b764105cd1c9e0',
    '0x4d0ed86fc2fa2236eea8445ec8d7281bca9e186f',
    '0xc6d4136ea1fb4f6dc6057e15daad587af9b799b0',
    '0x34752d5cb4d87870ad6b2bebf2286b02035afee3',
    '0xd70884ec3918355606528cda9fc478110831719e',
    '0xaf5f78a7e0cd2e6c4b01a76927eb60f64079815b',
    '0x3a90020ae28fd195b960cf65d714d173a7d5f58d',
    '0xa286d419a9d67ef189f9200800b18a6881d24b9b',
    '0x91352dca56470773cc7afd63dbff9fa47af2b641',
    '0x0664e0628da0505a7411212ebbe5c1346edef8cf',
    '0xa5118f0524c14ef9bfb7ceec73d5cbdc2838dfe0',
    '0x0d6cef9f7bf3a50364ed53989d67d695f71d2857',
    '0xf307be559f40a983fa9f47686b42eee0949fc343',
    '0x77784d19c584a82f145206b82f51fe3d936dbb7c',
    '0x34315790d57e6b075966fad16abd6335d6adaa3a',
    '0x9f4c2ae934b3176fbda45c437424a155ea542888',
    '0x333d35215cdf664ddcc2a09d282f0399b1ede902',
    '0x61f5d0365aa07d68432935fc3c0622c2e929cd48',
    '0x34bbfbf854e02f1b9d9d5dfb5b5a3cd95ba94a9e',
    '0xb7842737a3c0071d8fa652c84e705c5135f074f8',
    '0x5cfde4a09bd8c9611c16fc257c59cde805293cab',
    '0xe7b2e0bb3e3a7f51504d6125d4cbe3eab15f28f1',
    '0xd2cee9af3ebbc22849ffb6c769b908b5487dac29',
    '0x1d06374650329af0cb15d399f56a32741ed2db2f',
    '0x87be97d92a094cde3e02f1e7ee24a84bb3d80acd',
    '0x9da28102c1a6a54ff466b8ae7a460e4ae1fff265',
    '0x5c0bae8d65c1fc7170bcbd2dbda719dff96d11d8',
    '0xab5773b774c532aad8e60b088eb77c7cc937448a',
    '0x2a405df74cfd9b0126b62fa8e4a3f349654024f9',
    '0x9de1fbd7b656839dde58e3aefcecc09187b4c9a9',
    '0x0ef1a8df47a319ce4021198d9d98858578b7a00a',
    '0xa57ff567e4154f29402c58ed7a4bcbedc7fbdca9',
    '0x4d8055010f9bc89d12620c59d233ce9c38ebf077',
    '0x33bca68c161d6681b06bc53cfbc139b8cc2afa63',
    '0x4006e8072272b0a9535f1b147aa75c30992723ef',
    '0xc7884bc16080cc701533cb10bfede47aaece6174',
    '0xfb5f8ec07096ef62d313a163f27be365e485af7c',
    '0xaa694df5103bd57cd2c0620e29c2679dd63866d7',
    '0x0431ca336fecb66e318601138c676bbbd14deaeb',
    '0x6f62a055d78ba38009ec077a8dc4646ca7098e27',
    '0x89d71e1256ad3501c2e570e6de74b176f8842800',
    '0x9ed8b66891f239c4ac056475aaf4699ba901b4ac',
    '0x6e088619e3571f9bdf17b20511d5f9e3252646fb',
    '0x0a449e5384a9a7f25a497608672ecc648dac1cc6',
    '0xaf4877094c00d7dd5088d720cb0b49fa3b396dc9',
    '0x9824364d4766165a523183521868d7fd8d360698',
    '0xb40d08169e6b08e64afdfbfa30101d5101c6e02f',
    '0x353d738303892f534f355c14df26d6c02c32a864',
    '0xf35cf5b387e2dd0d44924cf6a050eb19e5d00099',
    '0xc2392771e3a300941ea676b48cfce804e8ce814a',
    '0xca7e1c2c91e27bf7293ef307266d1e6ca1d5f1ee',
    '0xd1ff969c0e8e316600d2d8bb34e65ec6c3853b19',
    '0xb50e7eb0e87f08200343e43c7d64dd385d5d01a3',
    '0x9384820d75497a30d7fcb587a82c031f3c3ae80c',
    '0x43ac8bfca17f84a72cee88098a1b3cbd2eeddb6b',
    '0xa699c70e8d840b0ded799cb1e6650dd988f7c503',
    '0xf2da90a0fdf404c00c3c3ee8ca34b15270501ae0',
    '0x28f602181c5251571c89b8bb0fc887ec275afb56',
    '0x5f67d10fe5649f4624852c8c27167ee2e08fc1fe',
    '0x22d615ff31bfecc813544c134fc6350d85fc589b',
    '0x5130e31c11ce2d519c4e077ddff991d12b255607',
    '0x5cb1c13c3aff182f4bed839a6f80c954bc77b6dc',
    '0x77197af9bab216c35b90d001870ab5d167fe5770',
    '0x13c7f0e1d736f52c6e95847ffef997e08179d9aa',
    '0x71d48d151b96b60ef31cac524ef0f053df4d6ef8',
    '0xfe2a037e136f730cff5a5240adb9c27ab5ee43d0',
    '0x1355b334c8e7293453ca45b25eb04bb04c3fda8c',
    '0xd72251143cbcb6fee8295dec34633231497c1111',
    '0x25c7478986b89d4024098fccb0fed9705068a0d0',
    '0x1e2b6239af3d5fa9c41fbe565e59c1f7311cb844',
    '0x314c53f58afe19723928d46114ff0c5707e4e926',
    '0xa405bec82fa3f9d959e74af460b19d2fb8649807',
    '0x1d6d5f5d381acb17086d5f5a8438fa91acde2a19',
    '0xbef346bcd8f2b6f6bcc638ed4f8c87152a144562',
    '0x4ec2a1cf172df96af72544138508f64ff901cfaf',
    '0xa0f4e675706eadc2c5fe04ef5cc254646cd1eae8',
    '0x19434167eaa0e4750ca2c53e0f546c8fb5817736',
    '0x505a771ffcaa8c51533444ca79d02b694305635c',
    '0x6faff10eb925234af863bf06e892d74d77e502c0',
    '0x949ba5f99446ee006927ca99fa366942f8684b5f',
    '0x59caaff9b2d06fb8e96bb4977f39f75beb9a392c',
    '0xbe5aa5bafd554cd61223427875c7973d54fa74e2',
    '0x7eef1845184ac7a821746e5398c4d51d9680ebea',
    '0xc29998c7db42914d796e8a2129d2d5d824fba55d',
    '0x4f662d1e90703eefe401a98d3063ea0422643aa4',
    '0x7c80a5c44af291a3224b9801ba5efc7e5824166a',
    '0x0f7f28e3881d1d06ddd30308ed92bb5d6121ea70',
    '0x0e137613a26e44e88e60036871f06c78e5ba83e8',
    '0xd272f636cdcedf62988f0c81a807583820ac0b79',
    '0x6605275b5ab0bc4e38e07c73a8fe7653f1a5301a',
    '0x44d16103d4bbd3272635c1181ab170d5201082cd',
    '0x5de114c00f01b6d535cd8e181fd9b87091716204',
    '0x335c02fa6d4b894fdd1f3419fd52091e61a85ee7',
    '0xa570d482bbd4dda143574756c84dfd25fd7987ed',
    '0xae0d6988d8c26cb54315d8d40dbcc86542fdb076',
    '0x475fd05aae9d157e0acd1f1dc4a20dcc72172fc3',
    '0x86232ab9c0642ccc3b3af13e9787a9789b193294',
    '0xede04533a1efb857dc859ec99bb9eba506ea9a6d',
    '0x5c60d171e73b62ee0e25e43994ab1d6a4f67988e',
    '0xba6d53a48cfca797f3f45f930fec005ff9eddf49',
    '0xa9930d9c511c020374bd0f3819bb39592710e040',
    '0x76ab4e3de3df4762d57f73373f6c7417a550e10b',
    '0x5731d85d2e5d64bfef31a4c26d17317375509de0',
    '0x14f1a008e721c4e7bf1c0bb3259526b0f5089972',
    '0xf02d54c31490ce3bd047b5305c8f61e580cbbe47',
    '0x9d670ab55443b66576a8cb5b101d0c0820511634',
    '0xfd4fee24f9d0e349bcd5d4b697d78850cd892626',
    '0xbea77dbff05dbdab4b121726d4f16ba87f1536ec',
    '0x13d1366764d8421a3875cf81ec847d5e05fd94e4',
    '0xb7ef0b1687413e925c42bb98e922b342d6d94240',
    '0x541e81180b8bc7ddf10dccec3dfa7ed278cac316',
    '0x88e687b635eb3f29556435579cea4af9e0f3e3b3',
    '0x74a1683f28e8b81caadccec5bb7c43584984fc1a',
    '0xc144c5166a758fb496db469c8a246e52aef9c9bd',
    '0xf61c813c54e806e5f1b25312cabdad1896b569be',
    '0x1c02b51c435b3f1336eaab3c4efa5cb75a49976a',
    '0x8e1ef3efdf28e0b44d31b0416ce07e80a02f214d',
    '0xbd843abbb3970426413dfa24db383005e4a11b8d',
    '0xba3baf45d681fe37f7515971365b948873b0aebe',
    '0xbab7cf2e6ca69806c4e1d184ef0e392a97d81a0e',
    '0x69038b56286eb0a9c0a4f44acdb160306b2ce093',
    '0x6bfebaf8b64c5dcddfbda194b17f4f2d9a85f496',
    '0x16da193337eb2416f81e34b38b5295ee5ffdf4cc',
    '0x76d141fa424f57954d301fb100b6ebc74aa62564',
    '0x98c01cb80349c7db5f73679003ab61a4985a3876',
    '0x8c2de817be2e28d0b16f65830553a2d8d3a14eee',
    '0xb5ff6e168d8aafefba446696c0e8dad2f5342e4e',
    '0x702638b60f40864b6d95db4b461e18da0bbdf3d3',
    '0xc7ee692a5e03d0dee7c10472bd2c1fda95f55108',
    '0x641713e91a96597abedd11e979e79001609f4af3',
    '0x0c92e84d858794b8556408ea26402f8b5949df2e',
    '0xfe7e961d5cab05f8359b08dee264d9f1518ef80d',
    '0x3c4d93f749405116ad5563ffb5f4456a8226656a',
    '0x64832669bc53099654c034aaaf0fde2c2c34379d',
    '0x310abe89c0351df7c4c9ec17179e4bec90e8d9ed',
    '0xe345e97d7ce933a6344516ee2ae1aabd6c47d35f',
    '0x27ee9ce4a289629447ead4b05eaa1679b4695767',
    '0x5cb44b4fdff97e1665b455f778f4929baa31daa2',
    '0xfabaa2b90d57741273309f973ff60b575546645b',
    '0x80c499afd2a543bff285a24f257b08397d004f99',
    '0x69d4a96e542cae8e58b4d95a3e8b9810998f367a',
    '0x70abf19b9dd435f183e6b8a1a243825ef78bf040',
    '0xc7766ced49615a491dbd6cc65307ba9126a741c9',
    '0x264b1255d7f4c5dd55450a0c9c79e50e72ac36cf',
    '0x7ad51ad81e5546280fd3bd8e6ae6ab8963035f7d',
    '0xf442203f634d2d227fd972dc8451bc08438a4278',
    '0x72ec44590c9235a910c1dd2745cfda6843ad40f2',
    '0x08326a03bf19bb55c6bcb15506bef42da32ccb42',
    '0x283efeef01c8917c1d8afa7d4ab653c2d684b397',
    '0xfa00ba127034fe1c4962e93aa845d6cc902604de',
    '0x9ffaa1fbc7108df6a800fe65397dff590366048d',
    '0x7cba5e0c725680f0e9865c931dc62bc96281dea8',
    '0x2cd436599da7994ca7318808c7650224a499ee28',
    '0xa9c34802c4131775b3eda104f1ab00ca10d012d5',
    '0xeb21b414b4bd218d2ea270abbbe7b39e4819c753',
    '0x7789dbefb92bec4a6430dc6d295f108aa6e71c46',
    '0x672567413f87265c86dc8c86f719e2b48f482488',
    '0xbc4444eb8e358e31b5d6860e088b1ff36aa888d2',
    '0xfe2e40f2739809d9af9b6e0979ec0868fcb3b16a',
    '0x325e6d4c0a50315becd54b234b8c51d55c794f6e',
    '0x8e1ce4ced1f5805c9ee46fede6db2d71229238f9',
    '0xb5dcb33ebeefd4fb8d4f87b5e55fb6f05134bd4b',
    '0x12ab9a567a81d0e220d4752a450044a934abf5ec',
    '0x01221af5e57d449df581e950a73b0eebdcef1f00',
    '0x85beeffe41b2f8567e1f1292c49a5266017f7f59',
    '0x1f0874359a05004ec211e2e1654d18685ff6d663',
    '0xdc2d461baa36bc17d3f75425d56faaaa9551a28e',
    '0xbf891dbe59cfe2a588aa5546329d3cab6a784f1b',
    '0x33c976811e15ec7593eb17d1970c388dce245c39',
    '0x734f22abc57f270d29e69c56abb7a04c99792ac3',
    '0x50d4986ae9aeabd25d93295f104e912bd7f87023',
    '0x960d73f5e28c6effe87fe7022d1af643f2b744a3',
    '0xc60ced683d546d96a4835af9579987ad7ccd9693',
    '0x55c1bab4607611c9b2b0518b87bcbd8cc2b566e5',
    '0x0a607f902caa16a27aa3aabd968892aa89abda92',
    '0xbf8b247c08a3ace0311044de539025e6b565ae09',
    '0xc97b6b037289009378ef2986d6a33e24d11850ba',
    '0x78b71f2b170a7f569195e57f4f196e659135b44c',
    '0xabf97e4170f2edd38e52ef16e2005c965d869ffd',
    '0x6661dea3eae450268634855b5ef02e4ba785eb72',
    '0xf26bbba82232fdefc7d8696dfde619f6b53de20b',
    '0xe61540a75832284dcaa6a036359ab2a375b7fb36',
    '0xcf051a15650b658af14b6186b42e36cd593a6069',
    '0xe100b05dc141eb1e13df381a9da4e725b3cc0656',
    '0xe1e3b9580a8cc09e6fb51728c727cc90de87ac0b',
    '0x6ed59c8a1068b37da60ab0bbed3e49936e99f9bf',
    '0x9d6ac7ac65a45353081c39fe2ca61f78fcdebf30',
    '0x07e837b2781d6a6b367138b10f26b6cdab3240d7',
    '0xa6ac5a22b1a760f44a938114ea8a8f1ce7e5517b',
    '0x7c9e5ac911b9415a1fd091975e0ba96fe3e62001',
    '0x1c0b106cb4189faca9ab34b6bf5cf86b7979342c',
    '0xdf951e054cbc4f094b468ec25b01fdf8957f02db',
    '0x424fd3bc9e987a62c8ef9678f15239f61519d50d',
    '0x51f8f1f683f51ca3208e1d3474e919cb2c608df9',
    '0x26f11c453ebd3ecc8ce9699dc87ccc2b61337bc6',
    '0xa9c91fd8c47cabbd7c5c95e9ea28ffb86c270094',
    '0x3766293b1b1efe7f61e96defb66b66763d7a6ec2',
    '0xe7d6219765722ae0bc705453a125ea19d695bee1',
    '0xccf930cde88c734690751148e634b186ee4d0fae',
    '0x0d0bb3ce1c2bb25722c28a52774fe08ccbfee681',
    '0x6183101bdb50e3f84fb30667aba0b332681a38c3',
    '0xe5fc7e5b0e16c4478cac820248b449baa774aff1',
    '0x33a82ba5e539d89e31baa3f36548b25c1b0d22c6',
    '0x46d5608ce1a5eab76d43fc8ed05cdce7cf48d810',
    '0x2c8c68f84dfe2be2908f3aa54ab8505b7347ee02',
    '0x5cbbf9d8a370d42ee3090cb6668605999da3f852',
    '0xc2f17388d119032c65b21c657ac91af373db354f',
    '0x481b502bc0b6226b27693a2fc16bb9fb8118b475',
    '0x72676a22bbdfaef6b7378dd49a996a6c074d6307',
    '0xbb63ccc129e4ffe870694626c979aa77738d3415',
    '0x99e23e92748f8c0cfd34481ec3981698cbe35eca',
    '0x874ee54ceb1dfc11c96003b8914b5d10587f547a',
    '0x30be86726fa54613957d65d7179c87502c71e430',
    '0x34afbc580a09ae85368124d5c4e834ad6d8fc403',
    '0xf969e884b6894edeb9e468f776c47d7f41b155c2',
    '0x09e0d859b8fbbe5fd4f391ff09acbcdb38225291',
    '0x600d81590f36c942fc171d887da609b6b73b34e0',
    '0x2c881907bc85debbbd7f3543739c480f77d10f14',
    '0x3c229531055dbc7b8ae07931b7fc8c8f948cac55',
    '0xd90dd35dc17b8c2bc77eb1eb13e903c2a87ed91b',
    '0x8d5a5685ca42f2a58f8cfdc6ad6910f6bf92bc7c',
    '0xfc856e04c4842962161bcc259940ead944fa81ed',
    '0x00fc6a5e1926dfbca0dff7040eb9a9a06b682d8d',
    '0xb1343fc621a946fbc557cc6b1a84eadb0079d217',
    '0x437687d1c81f403c04bd4776618a075e27ff704f',
    '0x3e99e2bf6e709414b85a8d1113c4276b80f179bc',
    '0x051cec999bb68cfac4d5dba1a8f4260b1ceee937',
    '0x97a8005918e67b481486848ea21af5477636cf3e',
    '0x3c5097f0cb72c737ea541d3789aa685b6135b0d3',
    '0xf808c53dbf41279c26397288ce38d7fef70ffa26',
    '0x9227491f821b9dd1b5d96511db865b77541742ae',
    '0x025609d830bc8a49a300249bf74247134cef572e',
    '0x1b8fe01c369b8694c87c30c2f6fc149eedf547ca',
    '0xe1639e88a972dec8eb63171a0e5228b5a196470f',
    '0x7e76f3a158cb3fef81578e8d155d446b4b5f28d9',
    '0x03865aa35cdcc70439d47bb7843aa8f586f547ac',
    '0x26494309f27921c894dfe2c40035d91c09136c15',
    '0x4114cd4efa8314d83caa7265f546153585617f61',
    '0x8b0c74264add25ce043d84fa24820122ea55efa2',
    '0x52b061a013e65f1d2db1e97eae10fb640e5a28dd',
    '0x37f193080bf0c55be16ffc1ad5b879c6ea6a7a7b',
    '0x54719e8b65d105be2a59103d284151ba71b87b89',
    '0x42e1b7a9f0b1f4dace0fcf4dd32b43d833df552c',
    '0x140d1bd6804576f03a59025ca91f3a420dffca81',
    '0x21222619fb8ed06be43c0967736b8523f2d06164',
    '0xbdf83f6b16f09863a27ffaeae6de7768a301361e',
    '0x6c274c3844e1f9bdefb2020137ad10a657218840',
    '0x5910d807033a869ea55b0ebd0c4232a6bcaaff6d',
    '0x587bf64f193d78b5f09e4f3e36afd1520f4b0360',
    '0x57cbcd61c785a4bd5bac064611d333eb63ff80c6',
    '0x549a1d4725ab838ec8b855f3427a68b3184077d9',
    '0x5a576a9765400832ff7a0176aa7e3a29714d8a9d',
    '0xee6329d3634a1beabcd2745b47b66b051f376c7c',
    '0xde0a9ec4bb2d73c651f8da9967f525782bc4e046',
    '0x878553f5df3a95158b71ed343d6785aea3dc73c8',
    '0x9268a1dec49b6be4e4be3cb558ca2e23f599eb03',
    '0x3c9b2b0cc37fe4762f73a10b8de5a5109506a574',
    '0x2aad4b046eb741ba840d4a4d137d0dacf13e930a',
    '0x56ad063cbd478c948fe8f868883d3d8cec8decec',
    '0xa7add8e76ced0f51c5acd301b115a072cb056145',
    '0x7efecb49f03b0efcacfe774a4254518dba82a5a6',
    '0xbdc67d222e0b0c63bc655e1fcb37d67b2c0d0818',
    '0x408b6b40f3247e203912d1ba4eb0983cc7b0d424',
    '0x07a77b794c4e4707fa0e035a9b59283679dd7825',
    '0xcd4f9cfefc113e927b54f65102a8c8ce17779d36',
    '0xdfe03dacdd938ce10c6659931eb80b2f74f8ff41',
    '0xe756871028a0870526e9c813e8b8466071624b10',
    '0xeedf504a5d5eec3525919b3e66696b786a485fe2',
    '0x9bf004bc419f51bda32bd8fdceec83f6412064d7',
    '0x4a59186cbf7ca0245b77782ad0beb4df8fd9fcc2',
    '0xe1b6558c5a600702acfa94e898e906fab9e0f7c2',
    '0x48c93200fee11403404bc23082d561b7961b4272',
    '0x896dc15b354c7ec0b4f8193d5dc2e9dbe5803233',
    '0x86188fe5096a72ff50253182e1928bfed305a5fb',
    '0x2e121eb6fd45dfee7fb1561aefa92537590464ab',
    '0x3c7f8f3b27172d814eca3fc8e48c8b4060e94b09',
    '0x822a6b2481fa578425726f829286f4a5fe1554ac',
    '0x5d09a863c89662d513d7f0e074c3093e9ac164a1',
    '0x6c3ac81abcefa91189df1a1bf51c73893471177c',
    '0x1c72b9577b778376fca45d97c88f2ec5d16ac054',
    '0x4c38361428950f958882f7a6a42fddf545997f07',
    '0xca8f32a751c09d2fa4a6c214bfbe4d899716303c',
    '0xc9c4ca6fe4ed925a167fd2a721419bf2878461ca',
    '0x9ec62aa17388ae88146c53248fbb35d2052364c9',
    '0x01ec3afe361fa61264749e0c90b83e0beb70dde3',
    '0x092216b445b6c64594b4eb8e3fa1ae2790fe1abe',
    '0x59f7ec8376d46ffe20cbf0108a625d2ca3317b8b',
    '0xb71971881f1950edd52c3bd1fc04f28b8498ea77',
    '0x5105334f7ac34864379452279e25b37992ec254a',
    '0x6f68bb18349225e56997b804d3d926ef7d23c6d7',
    '0xef7fcc59c9ed7719ec3b8f14f528cac0e8754008',
    '0xf3e58cca885689af88aaedad169a8855fe220ff2',
    '0xa8b99f2fa34b79817a43da3005e45476f7a1d32e',
    '0xf2f5fd1b32e4ffcea38e5fcc49d50ae91364a4bb',
    '0x30e9e7a80ee016a1278b7ecd384f76aa80d6ff91',
    '0x26d8ca465d27db249171ba5ef33df5b90535c117',
    '0xa7a318a716814963a43a3f66424d2cf1c11075ac',
    '0x1fb9e6e6165e76ad1ee330cfa45d6e156dee7c5c',
    '0x2c31c31d2682e2019fe806d374cc79a4b90a3577',
    '0x5270e4b2b4216dd690aab02dd26e25e0871fc923',
    '0x49bbcaf0ee1b4e33381aa42a8dadcd69586aeec0',
    '0xd758fc79754e671017128bdd7031ca32f1051ca2',
    '0xf3c189819fd5b042f692983bfbfd57ab607ee709',
    '0x67b00aec22de09ffa10f06278a11f4f49b60ccef',
    '0xbd315f675a4d8fa1a54729966884c8c67678606f',
    '0x8cc5b5dfdb3316bcacbc418f7cef0d2eff9db3f3',
    '0xf1c4fe3d4a854bc856265b162eb8541acecf69a4',
    '0x678e5608a5a8217a38aec6dc112f388b9b1c39a1',
    '0xd7a1fa4467af153715ce91e2b38f03bad0204e13',
    '0xde0da643334b4f0722f45baa9b1f7b7c71c82976',
    '0x8f6d072f9a62eed3f85f350c5da5bafd1c483720',
    '0x8074e7c8dab03e56cb7da964e4b056d2b8a1d3d3',
    '0x8a4e9dec200353d121e05a9b77beac00bb64a763',
    '0x152bdf6893c9e020894c815de52feaba213f5223',
    '0x93ecb814477f72f6e97a1cb5f20694b90f561779',
    '0xb1b7c859226eb5dc9226664335d582aa27a89fbf',
    '0x2c3124c50118dde1a27e0fd4a68ad72e846b2571',
    '0x716385ec9461566ac0ad6f0e99e8522c4ff661b6',
    '0xbdc9adf4f0056dd79a7c9188efac7a0250e14fb3',
    '0x7fb1829bea330aa8315ff3c6a8b7b0f50eb65e8c',
    '0xa74582eb1c67152a266f961abd345ccc61280f49',
    '0xd165b3bb648b5c16f6a2e2733b5c986d5fa4a01b',
    '0x5961b1a25e99a69a07d62776a644a3b0f2a7410a',
    '0x18f8980f34b2a4e658bdbb207294ddc14660c0dd',
    '0x542dab9c79410da5f118eac0bcedbb475d7dc3b1',
    '0x2afbfb2c96bdfe002ceceee66b2b4fd87822e132',
    '0x9ad9b01def5233e74d03bdccce7dcdf99fedb8b7',
    '0xbae180977de266897c36f0d4e1999bea91b4f1d8',
    '0x6be3eff30451d61670dc4463e3d63e5ae53279a5',
    '0x9c0fddb98a30efbb575b5a4752ef1fadf7417fcb',
    '0xd40492914100b44e7b17d53931e4a05b673abe75',
    '0x98a81036d93c45ef830596ed5214672434e61a10',
    '0x05e092fe4979aaf7f37d0230cda9ce83bc7a12d0',
    '0x2c1a9f52b5e47685b00f6899f2b59616b9f408b8',
    '0xde29745c489495716a87d6ee8104a44103911706',
    '0xa3f77a2585c90b1a4f4a89b229f9145a93ed2d2e',
    '0x89e9b9815cfb4df587de0acd4812388d323038c9',
    '0x8282c581bbd9071e7e6b3630e322fac2cdc80f87',
    '0xeee82f23b505512fe62f9d0fe93881df209b2132',
    '0xe71a22bd9cec8be7eddd0a92e8bd436a6d7a4ba2',
    '0xd95ac1d623934218f50902e83a419bebeb5a28df',
    '0x25dc6d6ebab2ed4e9f76ad3ef1aceb5ac7403cb3',
    '0x122926a5461fc704e39c7f97770feaf869d3e777',
    '0x1bce2bc55dd398427e3196f8c0d081456970736a',
    '0x2327e3dbfb481e2081e87cdfb6ae44c968d2f9f8',
    '0xa51dff5730acf6d6b2a9f741cbc6473860abe898',
    '0xd519f7cbd314d8ae3ef64dfd83d53f31895f1ce2',
    '0xe89d05ee8590b09bd22a52bc268cb1ae31e0a3ee',
    '0x91c1e07709f3305ada23a8b830d95e9c0a28068d',
    '0x3702a7be7ea8ff7f12d4078b6ff9828898bfad97',
    '0xa6a077b16b205da73c2255888d56d98091158997',
    '0x8f7433f7e07ba8b1d8cd60e339b779f755930b76',
    '0xec1459e2dfd0c4dffe3e748b94b1074cd46406d9',
    '0x444d0e4f9793b06a3adad6e4f7f8ba2c2ceb9594',
    '0xaeddbf17a66c9b610990197f0d332d299d5587f4',
    '0x7129773ee38604d4b7ac546bf4f710e4ad66afb0',
    '0x6b77f2d34204504d6635c35a5a1f5e1b838d6016',
    '0x8e09409823f355bfd0b56d3ffa3c087933276d8c',
    '0x21fc95320bce469569c77467886a83a2afe6aacb',
    '0xebf02834ce8008f4f10027217078e1ca33a3ec2a',
    '0xbbf6c800a124a48ef7dfb9bbaa3c97afe51e73c1',
    '0xeeb3c6dfdfbd6a600d4b06d95837767a5d6b24b0',
    '0xb2cfdbde319c377c5aea592a4157497496612593',
    '0x847b4a5a8a53d7cfe6a8c27ddc2e904331d99a42',
    '0x003628b9698be0e209b15fffcb3060bbc43a5307',
    '0x7d2952358144c9be65b5704758331c528ac8c048',
    '0x48d93f5da408479638b32b74656afe1004866169',
    '0x91e8bc66ebb7e72547ed99915d9cd873ff58c5bf',
    '0x355cc0d30a1b95e7df279cf64fc311c017b2f4bc',
    '0xd109b2969aeeddabf5a95fae9045fe1ab391a2ec',
    '0x861d37c5ef38fa1fd3b7fb4721c7234d9f2d6dfa',
    '0x2bb1d8fb4307af3df7bf65b5d529174df6b0e5ab',
    '0x0e3566986b32300692a76eae132304f216518d13',
    '0xcecd1798420a533c9627770e052f49aa127c3b3b',
    '0xe2ccfcb9569a954bda0bbb4a9364664b8d80d027',
    '0x784aac2629f2c26ae3e17d43c8e0d7284c9a2d73',
    '0x4cde44cc40a9dbe977f64064eb4f0e10a589cf7b',
    '0xd08796a64baf028a7dc80636a13e9588581de94d',
    '0x7e2490e3f288b62b9c5a05a7836ebcb74d3d22ec',
    '0xaa2ddffc287df6df593e55a9211eb33c1117b28a',
    '0x8dfa6e958a0cce5aa10654f66ab5bc62c9ad6604',
    '0x6524bc604a8eef4be030ac12481eaa4b5bc6129b',
    '0x81820ff545b15a9c96b76f43d6079708a28209a7',
    '0x82417ff72af044077b7f67f138ad835be3f052a0',
    '0xfdef71b0bc0222e8a14365555fb0790299e6f937',
    '0xe4dc30eabe2ce672e3be58c513c6cc3ab857067b',
    '0x2bd48297635b87b7d3ecca8df16534e494da3b78',
    '0x726b34a96fb6b541b36dfe28bb560a0a09dd4da1',
    '0x4d355b8291f616619b32b240238c9faafd7cf126',
    '0x14711423b8a352481fe9749f05296bdbb87484e1',
    '0x0b1dc36d238d09ed48180eaf3c4d975ea13f6453',
    '0x2a142dea2ee5ba9221cb476861640c9c55ecef9e',
    '0xcc2c471376bf5aa18f7c782902149230ffdd6c78',
    '0x0848e5e5b97fd72e80dc9dee6a781919c1ecc9ca',
    '0x4de2c062f9046581996a53f8ad52c7dfc7955249',
    '0x757b493a39c9d351626e137698b6e3f82b6addd5',
    '0x633e4b70f23e64ba631741e5a45614ca090701cc',
    '0xafa290e5a5bbe4f644b13b46f9836d5dc7bd688f',
    '0x8631c2a7368e6c785de11c2a7624d3684f84a4ae',
    '0xbb99c0e1f4ac76498475ba8faeeb9f70d3054a6e',
    '0xafb7df7b7a6a588686aa2c980afaff1751a36470',
    '0xa027516eddaec55d28ba7a3a238608b3a465f0cd',
    '0x46807489d9acccb4e11be44db9ab6a7c77174ad0',
    '0x19f81926bfc460abcfe0f169253f815b45f5a3e8',
    '0x2cdca851182f74415dfb5e5d74b55a3d66b7362a',
    '0xe65da8c00d8300062bd6ef36846ceb73126f152e',
    '0x46449e7d22fb09e3cb295b996ba3a8c96ff27075',
    '0xab6319fbaa539274031c724d7e35c8760c0c20b7',
    '0x0a0f3d59a536453c003b75c8795ddc43f0c6d693',
    '0x234b3946817ac64436b59010cfa85a1e1b3b91a0',
    '0x648b492803bda096e58fc669795b3daa3f64624c',
    '0x22addbf2303d2186ebe6cf6d60c2c69bdcbf8922',
    '0x7fedf316d792e7eaa7020fe1a3c5c1af8e5b5314',
    '0x21e79431b9295d1426e75708b4590542e85a1e8e',
    '0x7df8c9dadb37e32717f9ea011e4c20cbf7a82084',
    '0x0b25abf901199fd1104cab993a1aeac48272d067',
    '0x085bb75aee3c75a6d7a7236e3e000d588888780d',
    '0x10266d3f59eb61a3bd4b000664ddbc5f7a92bfb9',
    '0x6e1188d0c1517efeb4245661dc418c0e4f8d72ec',
    '0xcbc8831d9d9641a88c91df7998b5ceea671b62c5',
    '0xc1d432de41ba2235848821185e518fd3c4225840',
    '0x0c50c0c0ca7d28c73aebeec5e4b66270d92b17fd',
    '0x2ad2ebb85cda89a50d5b87c847e26e470e5407dd',
    '0xe20f6767cacd89006e729202b2629d2a53c03e66',
    '0xb33f3d1a619b7d24f2e5406cf8709274a7f1ce00',
    '0x7c179ba5b7f81c41f05cf0be00a0517a8e9e262e',
    '0x3d2c675a1f1a0e8e0eb178e1a4a99767b969752e',
    '0x381020e11198521d3bfb00b9464731ce3c68e51a',
    '0x70717042cff0b531628a3944c90031fdd80f138d',
    '0x73e2025e80110dbb7c6c3842c334f649093c9ecb',
    '0xe9109ff545ce8cbeba9e0dacd5d0dfa265f00ad9',
    '0xcba8fccdd5c8c67c17521f29cab8bcda004ae1f2',
    '0x0ca5b861f36a846e8d77dd5eaabcfd767cf166e0',
    '0x1d2f995839107870e0f6599c83477ade9491baa3',
    '0xc28ac81561e730d9fbd5100db1a8d3317a19d236',
    '0x91f84d5e489ca4c38c87c77743c1685abf4f6770',
    '0xece30622baf59d47eff18d60e40061123c43dc26',
    '0xe569102a009bc313c0527cc5009a3ae6f8b9ca4c',
    '0x9aa1e1b793da792e75d81c3eaa105c5fe64c6bf9',
    '0x07b2b4a339a437ed6bfb02e528b3542f9e3b50ec',
    '0x1744c02cc0331bef6807ff157359b5145c9ab24d',
    '0xe2fa6cc31b7fb95cadab4cbfbaf41e1bfbae183f',
    '0xd9a566a484a8455e8c6b7d00e1f8d8d2f601904c',
    '0x9797953494ad45dd40195c6416b289787db9abe6',
    '0xcd0ff813352956b1658fa5f58f884075b68b0d74',
    '0x94bc15d2b88f8983217c6f50092ab3e4c5a8dd0c',
    '0x0a6f723c4d90df036417449402f177c9932c67c8',
    '0xcadc3f94a1ad75a1bac8644646d9386c991fdff5',
    '0xe36ddb2a45a50868b77b6611504522bafe1ccc33',
    '0x9c69255acb16bf24437f111debd2e11b7df64bb5',
    '0x451a1bbf32eff02b77fd2b38d53d3e216e1b4db4',
    '0x234c8fcd41d02b104b8e3d9776a11e1b39dfd1b0',
    '0x282870fde318ae354485dc08999fa1a5f99d3873',
    '0x73bee12fdb77347543e4a3245320cff9cbbc9e5e',
    '0xeb1857eba573d847ff68f8026f098b3575a59d09',
    '0x3e20961ebee1cbe7dfe9d62f8a94720264396354',
    '0x4945bd66b3faa4726f8c88a0553753f701a1f5f7',
    '0x1ca5d5786e35be8c1caf72ef7703e9413ad82e59',
    '0x05f1bd4af73b96272b7ff7e7725457685e038291',
    '0x778babe68ad1e0140b05a3eb8cf2a81019f523b5',
    '0x1e188abbb45eac07754247243a17c2eb827c3c2b',
    '0xf8792039b89f2e6c32b77526e09211961053a7c0',
    '0x3e90a6ad2228dadccd76f41eb330dd014ce04156',
    '0x881c3a94873859d21f1e9cede0f13c8d822bd087',
    '0x7b419ea45c5278cab3e15d1d398d2b830c4ed186',
    '0x01e0cab664e41e3f4aec3df2d37d3538028fcd4a',
    '0x46c9e9cbcb7a3b8b155bd5dfb2247a4306f8b8b1',
    '0x93264d29f27951d83a304a16ae9303fafbc42df0',
    '0x7688df290a4cb981d9023873223f5738c3f8a0d7',
    '0xc0e390bd45a9a4304a7a870c62405a5fe98d5238',
    '0x248c7408fb52d9cee51fc7e095fb7aa389820a8b',
    '0xaf91c76f2a1ae9f52f9ea43dad3ee85e911f7468',
    '0xbf730af4397568074412998ea99d64406618860e',
    '0x9ee96b2f135042a980a9203d5b7ff6091d79e738',
    '0xa0e7d903e61ae11063610395d41ff2ba18eaeb83',
    '0xf91760d1b4c4bb801d6876e2abe2361ffd032a52',
    '0xbac42b674495d03550195f059e4a49bbbc995615',
    '0xdddda2d4b16d9868272b8aa7da4674f7280f2ed2',
    '0x50dde93402b35778a8a073b1a58974b43d0d77ee',
    '0xfe338c50307dcd1b2718ea12e5111bd6b4442eef',
    '0x230877a4bb7f05f0290dcb636ee6d45493a8a8dc',
    '0xe5e4469ecf96e01ba49af49496d7d5cd19c421fc',
    '0x1339da99019be50746e045a7d1163c038a3f2770',
    '0xa022e7c3bbb260a400fe09cedd6be93c2cccee7d',
    '0xbbe88a2f48eaa2ef04411e356d193ba3c1b37200',
    '0x77e0156df988ce8f621b6944f08644b32441ae53',
    '0x378be8577ede94b9d4b9f45447f21b826501bab8',
    '0x77fa3c41411dfefbf1e82df22cbafeef0c8941fd',
    '0x9a8fa107333d37fff53f507703590d810bd36a58',
    '0x430e25cd9c4387a020694d590fd44775d32691bb',
    '0x6c77cbb37f03d700a2b19bbb34fbd402a8207511',
    '0x7bfbcaf9384b43a21287d419b2b347ab44895677',
    '0xaae90e0000ec70ccc71de79130c563784360f60b',
    '0xc0bebe1f597745cca1e05ad29be09e1c4ea2e606',
    '0x1e111601dd00842a1d8ef80058dab417fc678cbe',
    '0x752c81c5826d14f60488651a78de746e9a0b9415',
    '0xb2a74a1d07f854348c2d4b7363a9cb423c8fb6ef',
    '0xae594e329b0f47f93a965a653318165eaa7be5dd',
    '0x9cd867b956f66a45112d2047332384f348a62fa7',
    '0xfb4ccecada3364f3b32c9d515d7f5340811a29b8',
    '0xfbe9f2cc6365614503679af21aa9d28179bdfb4f',
    '0x129d19c44a692c7ee9cdc84e05232b0f0b380006',
    '0xa8e7bab97d05933be232c767a05427bb7a692d04',
    '0x52f9e02461e656a0a66707910ae3681ee5dacc62',
    '0xbbaf9e207dbdaa06b3d3bfa31c4f394cb93ec2a1',
    '0x959efff4187c425f3aed079d66e85df6b5512765',
    '0xc813f6f86618e1cd538ae8b931fe4b34fe0fd362',
    '0x41be92e41b9d8e320330bad6607168adb833fcd5',
    '0x6a8fab9571f45b0e55a2605c961825b5e46bffe0',
    '0xb3a12262dc4dfe96c49befcad0b901ee2d6a0ba0',
    '0xc7d873c8a6c8e329d566b20e42980e24dd9af107',
    '0xf39765b43d9daef6331bb17041197b0f0123d6d9',
    '0xf90fa6178a68b5d08eb40479c18c5738dcf4b927',
    '0x3a06450b10fd0d9eaeabf686a5f59a42bbcd19a3',
    '0xa1d2d25ae200e428f48cced548a7644312fd7c8a',
    '0x96be167e06db6ad6ff3dc158d6f3c05d5fda1a37',
    '0x47d378212f499aea2be264f230902969c353e424',
    '0x1708adf7db9a70b41f9f807b9f6b4a951aff705b',
    '0x218f77fc44a3e36aee96438a461f0eb9e590e356',
    '0xd04a5e0b4424818cf059c3b4525b36de737832c1',
    '0x327a1e3ae86b2002adf99f08c979cca1bffd01f9',
    '0x79b296f1828142572e6c6b984d121e66dfe3ae2f',
    '0x4642f380c66e455f47430b390d2a566e56eb414a',
    '0xe5a8857544ef840999945b13055a5c625ac38d46',
    '0x7ee5e78b8da599fce0edfb464547774366d6465f',
    '0xdf869fe30f4714eaf7d518181266517753e0731f',
    '0x3ee92cc3a7bfe3d970ca969fb16d5850c2f55873',
    '0x50ea1f54fceede08962747c53d400607adddc84b',
    '0xc4e35e28ca622a698cf3bf6adbac5f03ee432e9a',
    '0x118b5d09f5f725915274b624e98f08c275a0c89f',
    '0xd8744e1c6b2f9e49c54dee14f9a51e202e121228',
    '0x68a38f9b3a33691573d5ae6310980491ea5f9dbb',
    '0x888a848ab6c50e65ad6a39acdb34691725577e48',
    '0x149dd09147e2b6c21124c0cf1354696106b76aca',
    '0xa893c4c8e3cc951935b865f1a84c771136a4e555',
    '0x2c505c48677daeea2ae8877d1bb031a4252881f7',
    '0xc5411c871a668707e992c68e0c0a1d3a3edfba4f',
    '0x679d78578937489a6444d5aee7ed2ef12462524f',
    '0x00838a4a4285f366a671cd1bb6f0007cf2f506f9',
    '0x8ab89ececa9b1d71d46688aac06c92463ad26d99',
    '0x7c76696eacfa6f894719317ce03c8f24e9462081',
    '0x656e6d406dc2fabe9825a732febfffb5bbfc7f84',
    '0x2cdfa4c1f3a6b4effecd2220599a3736d5614500',
    '0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9',
    '0x3910caaded28962573889c8a9a9fbe8e721cb906',
    '0xf09b1985c7614c2a8f99afab492ecdf6bae70388',
    '0xf76ef9e28ac9c7dbb89729e2f52d810b643b1576',
    '0x5f12c83d462eee18821cd74beca8547013c28092',
    '0x707dd5da74b427625669a00d362fba16cb9c49b5',
    '0x0bbb4fe3e8ce441de4315af9230ae53514ffb50a',
    '0xe527f0012585a4c164046211da07ed5090b91dba',
    '0x4f209ca477ae53c989f9bee51ba8aa7ecd43201a',
    '0x0e2f830eeb96a2a062e1bf3973262c44ed21e580',
    '0x9f44880dd3ac71c3754827f0d129209597a2787f',
    '0x1af30099af4fa0d1da8edf97a68c69436c52e284',
    '0x92b9e9ac7d91d545a8638448fff80f0fbf145249',
    '0x8b22d938774fcbee58ebe7046457e6020be71f75',
    '0xcf2be7e117fecdec17957a2cf2264db74211ef3e',
    '0xd061b39b7340dab4b8060744d8dd593790fa2cb7',
    '0xfa6f58063c9e1017a829fab865de85866f8771fa',
    '0x5e789955e878dc65ad07e5cf51795fc1abbd0509',
    '0xe6eb90bc4e032761773ee615f7a660b267bf37d3',
    '0x71352c4fbe872072ad4fec4c9fdc29d3e5a935ed',
    '0xa559ddd0eabae21b16793e805fc7180b7c397227',
    '0x40d7ee9a2c074f7b88186a329c0a32c7938d9019',
    '0x99009b3cdc3db0c9f3ad1b1e4cb9ca1ab8f21b99',
    '0xd4bd045052d2f8b2fa72e2c14c7475589e5e8a7a',
    '0x7a2f29a929c3ae69587e08544b4b618f34f89f18',
    '0x0e0d6c0e84d20eef9c2609cf7b0bb90699a22a02',
    '0x67ca5ddf6ad4d097f994ff2c38198517384d32de',
    '0x96e27e0ec60a22b501a1c85db9efa8cd7429b314',
    '0xfee4110d231ed9009304edf2c589d1c0f28b4599',
    '0x62dd53ab9ac524bb81f582a05b429a5379130ff6',
    '0x3ea45008748bea6ac18371ba225ab3a3bed7a958',
    '0x31dad352b2b8f80a9464abdd7c04ac8f0d8c8b10',
    '0x4d2ca70ad8b153936d58ab4ce89c0bac000525c1',
    '0xfb79e3d8c697f87bcb46111f49d052d46efded66',
    '0x2a4b0cfb82a0721416045c4985f0f860ba706dd3',
    '0xc6c11eca9bbf2247ae33d4c9136bdc8b79fc68ea',
    '0xb0905b68e20ee5bab88a2d13084bf487a6e21eb7',
    '0x05d52b56ab35ea1ab880d1597fe1047f021deae4',
    '0x245a477d4a57dad6ff051408fb8f22766a591be5',
    '0xd99857bff8c27e896bf54da265e51cae068d0379',
    '0x9b79221baf1871fb38dd614d0d7085aaf6fa5212',
    '0x311b2036ac58832d448a47cfb08e67697d1ea34b',
    '0xaeae91332c28adfd1d4b039b8a10b5d63b0a386c',
    '0xeccedbdad7dae297d1ef1134cca43cdfc2857bd1',
    '0x0ebbf5aad9a0ee0de5765f02963f6b1cd5d8a418',
    '0x430b5751808bddb463d2aef2306a56a794e17692',
    '0x551d0ebc7b6124126285f90c693ef6999cd28025',
    '0x00902f4505f88b4b26a391b9a3ae6ec3aef91175',
    '0x065f8eb18ebb45747c8c4b3f59bdc9e375e7c2df',
    '0x29d7c7e4571a83b3ef5c867f75c81d736a9d58aa',
    '0x26e7da1968cfc61fb8ab2aad039b5a083b9de21e',
    '0xa1ee4cc968a0328e9b1cf76f3cd7d4dbe9a02a78',
    '0x11c0a5d6a6dde5a9643d33f0775902eb0ab125e0',
    '0x95ea0c496c7b023e4a4da41b51ec8b488023339e',
    '0xd9a4dde76a63df1e72c4ce0cde16e80d4724fba2',
    '0x37415b787190b2bc6371093383e84a03e975d716',
    '0xc493c8844ad525186ffc3b718b17973fa69c101b',
    '0x2aaf9c5616fcf3af252dc2a4c935db40a5e695d6',
    '0x68b02c9a11d7fcb7590889e216389b416949e386',
    '0x5d2fa3ef7384ac759a074701890ebe23e5d09059',
    '0xf3696fe16f3d7c1932ceaf1d3c33a32aef3037b8',
    '0x4d26f3e69973de843e3446f641b46384701b4217',
    '0x5545ceb7f77b3f713fae514232c3ca4fe06ae1f3',
    '0x9d4d46c475a94ca379d90ed19c3b08bb3c5f5d34',
    '0x935068bb8b5af50bf941a7f88be7dc00458f5339',
    '0x383b85481a24e3c1dfeb7e58a65537cf78f2d20b',
    '0x3c3253650bea79cf895d6b793d9f8eea43f80390',
    '0x26526debd4ac8fcd9592c82970d5ac1e53a663d9',
    '0x80237be7517d0bc735a5d8c06c093f7fa4618a63',
    '0xb3b188d3ab6f3bce5b6c17f7db7d9682d39bc589',
    '0xc70f80bb4df893cf70d7bedd3902a2d76445537a',
    '0x6827cfd20dc7bfe42a84ea320448fb75caa95991',
    '0x74e3b300a82c712234f4fa60a50ead494b52a8f4',
    '0xf54a1b5aa9712a3a00ed45778cfd8be14a408485',
    '0xbcba4fe7e548b67a42342a69b37dbcaf713fb2da',
    '0xa1be982bbc7005fbc1d966542d3ac8e921b063bb',
    '0xb76ac1bc8fed275d43c7b2130a7b753eec9e7a4a',
    '0x37502a753ea697fbdf5402718c2f83443e4569b3',
    '0x523f05b9e75275c403d62ca625036b62ad2b5513',
    '0x424ffc9e6c3eeb4fccc3167b77f14b12164c9ac6',
    '0x8cabb08c1c00012731aaafddd480b85bc8478b91',
    '0x4acabf64aef8ca056d35367bcafa1cd78a17bf1c',
    '0x89240eb6b68a98e6304f2348e43d954a3581611f',
    '0xc140ac44566f7b2db65dd054ce7681d1d87257d4',
    '0x7b5a42885878d70e730a93e2a76a4b8ebc0d0182',
    '0x33ed4ff96de3522839ce11052235767f467e7c23',
    '0xace655a51051524e32336199467b19b26a3c6f3c',
    '0x0d5c8b7cc12ed8486e1e0147cc0c3395739f138d',
    '0xda96fab60c71cfb3f5f7804342572095029dad38',
    '0x33b1cd6ee8135cbe370a1862a44810c725218390',
    '0x3febba031a3f6326127097250c35ee1b68c3c777'
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