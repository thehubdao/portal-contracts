const UniversalProfile = require('@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json');
const avatarContractFactoryJson = require('../artifacts/contracts/LuksoCitizens.sol/LuksoCitizens.json')
const ethers = require('ethers')
const { config } = require("dotenv");
const { ERC725 } = require('@erc725/erc725.js')
const AvatarContractABI = require('../abi/AvatarContractABI.json')
const LSP8ABI = require('../abi/LSP8MintableABI.json')
const DropContractABI = require('../abi/DropContractABI.json')

//NOTE: This file contains some helpful functions to make interactions with contracts from the owner UP
//TODO: Finish organazing repeated strings

config()

const _config = {
    ipfsGateway: 'ipfs://',
};

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
    },
    {
        "name": "LSP4TokenName",
        "key": "0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1",
        "keyType": "Singleton",
        "valueType": "string",
        "valueContent": "String"
    }
];

const provider = new ethers.JsonRpcProvider(
    process.env.RPC_URL
);
const universalProfileAddress = process.env.UP_ADDRESS;
const universalProfile = new ethers.Contract(
    universalProfileAddress,
    UniversalProfile.abi,
    provider,
);


const OPERATION_CALL = 0;

const PRIVATE_KEY = process.env.UP_PK; 
const EOA = new ethers.Wallet(PRIVATE_KEY).connect(provider);

const setContractMetadata = async () => {
    const targetContractAddress = '0xf05C6747b2C6C8ae984651f54A109a11196FfC43';
    const targetContract = new ethers.Contract(
        targetContractAddress,
        UniversalProfile.abi,
        provider,
    );

    const avatarERC725Contract = new ERC725(schemas, targetContractAddress, 'https://rpc.mainnet.lukso.network', _config);

    const metadataDataKey = avatarERC725Contract.encodeKeyName('LSP4Metadata')
    const metadataDataValue = avatarERC725Contract.encodeData([
        {
            keyName: 'LSP4Metadata',
            value: {
                json: {"LSP4Metadata":{"name":"Platties Tee","description":"Second wearable drop from THE HUB DAO featuring Platties. The wearable will be airdropped to all unmasked Plats. This LSP7 token can only be used once. If you equip it to your Citizen or Creator, this token will be burnt. Choose wisely!","images":[[{"width":1080,"height":1080,"url":"ipfs://QmVPpzRFyA8EBCm2xY8DEsN58gdr9y7miFFWSiqn6MNXQm"}]],"assets":[{"url":"ipfs://QmccLuakYZtqTGvuxsH9NE9k2fLwgD3ZNuk2k2yLCv4PgH","fileType":"video/mp4"}],"attributes":[{"value":"Tier","type":"string","key":"Mythical"}]}},
                url: 'ipfs://QmX82CqyL54VHFiP8jcYUWC3YHpsCHHDbqPFnMjwBaywwG',
            },
        },
    ])
    const setMetadataDataEncodedFunction = targetContract.interface.encodeFunctionData('setData', [metadataDataKey, metadataDataValue.values[0]])
    const tx = await universalProfile.connect(EOA).execute(OPERATION_CALL, // operation type = CREATE
        targetContractAddress, // address zero
        0, // amount to the fund the contract with when deploying
        setMetadataDataEncodedFunction
    )
    tx.wait()
}
/* setContractMetadata() */

const setDataForTokenId = async () => {
    const targetContractAddress = '0x754a5D007d5F1188Ef0db892ee115a7c01b38fA3';
    const targetContract = new ethers.Contract(
        targetContractAddress,
        avatarContractFactoryJson.abi,
        provider,
    );

    const setDataForTokenIdEncodedData = targetContract.interface.encodeFunctionData('setDataForTokenId', ['0x0000000000000000000000000000000000000000000000000000000000000069',
        '0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e',
        '0x00006f357c6a0020cb0ee2baacd8514202d26715087b56001847deb23774b33a5b68e754022a250a697066733a2f2f516d59644e6b624c5a34476e323443443148736a65485943665a51467a634576764565647453626b446131653638'])

    const setDataForTokenIdTx = await universalProfile.connect(EOA).execute(OPERATION_CALL, targetContractAddress, 0, setDataForTokenIdEncodedData)
    console.log(setDataForTokenIdTx)
    await setDataForTokenIdTx.wait()
    console.log(setDataForTokenIdTx)
}

/* setDataForTokenId() */

const transferOwnership = async () => {
    const targetContractAddress = '0x754a5D007d5F1188Ef0db892ee115a7c01b38fA3';
    const targetContract = new ethers.Contract(
        targetContractAddress,
        avatarContractFactoryJson.abi,
        provider,
    );

    const transferOwnershipEncodedData = targetContract.interface.encodeFunctionData('transferOwnership', ['0x179eDFB309C13d847A1ce41E472581156A17fA14'/* '0x179eDFB309C13d847A1ce41E472581156A17fA14' */])

    const transferOwnershipTx = await universalProfile.connect(EOA).execute(OPERATION_CALL, targetContractAddress, 0, transferOwnershipEncodedData)
    console.log(transferOwnershipTx)
    await transferOwnershipTx.wait()
    console.log(transferOwnershipTx)
}
/* transferOwnership() */

const setTokenName = async () => {
    const targetContractAddress = '0x323b3f7aff4e60a13593401521b96197f3c59369';
    const targetContract = new ethers.Contract(
        targetContractAddress,
        UniversalProfile.abi,
        provider,
    );

    const avatarERC725Contract = new ERC725(schemas, targetContractAddress, 'https://rpc.mainnet.lukso.network', _config);

    const metadataDataKey = avatarERC725Contract.encodeKeyName('LSP4TokenName')
    console.log(metadataDataKey)
    const metadataDataValue = avatarERC725Contract.encodeData([
        {
            keyName: metadataDataKey,
            value: 'Lukso Creators'
        },
    ])

    const setMetadataDataEncodedFunction = targetContract.interface.encodeFunctionData('setData', [metadataDataKey, metadataDataValue.values[0]])
    const tx = await universalProfile.connect(EOA).execute(OPERATION_CALL, // operation type = CREATE
        targetContractAddress, // address zero
        0, // amount to the fund the contract with when deploying
        setMetadataDataEncodedFunction
    )
    tx.wait()
}

/* setTokenName() */

const mintTeamTokens = async () => {
    const targetContractAddress = '0x323b3f7aff4e60a13593401521b96197f3c59369';
    const avatarContract = new ethers.Contract(
        targetContractAddress,
        LSP8ABI,
        provider,
    );

    const avatarERC725Contract = new ERC725(schemas, targetContractAddress, 'https://rpc.mainnet.lukso.network', _config);
    const addressList = ['0x06d0c7fc09974A69ae1dF763e269b3CAEc8b316E', /* '0xc868F0349c91467834d4C7C9E3E7dAFc0D8047f4' */]
    for (let i = 0; i < addressList.length; i++) {
        const totalSupply = await avatarContract.totalSupply()
        const encodedTokenId = avatarERC725Contract.encodeValueType(
            'uint256',
            Number(totalSupply) + 1,
        )
        console.log(totalSupply, Number(totalSupply) + 1, encodedTokenId)
        const setMintEncodedFunction = avatarContract.interface.encodeFunctionData('mint', [addressList[i],
            encodedTokenId, false, '0x'])
        console.log("TX", avatarContract.interface)
        const tx = await universalProfile.connect(EOA).execute(OPERATION_CALL, // operation type = CREATE
            targetContractAddress, // address zero
            0, // amount to the fund the contract with when deploying
            setMintEncodedFunction
        )

    }
}

/* mintTeamTokens() */

const contractMigration = async () => {
    const originContractAddress = '0x323b3f7aff4e60a13593401521b96197f3c59369'
    const targetContractAddress = '0x74654920356257981f6b63a65ad72d4d9bc21929';
    const avatarContract = new ethers.Contract(
        targetContractAddress,
        LSP8ABI,
        provider,
    );
    const originContract = new ethers.Contract(
        originContractAddress,
        LSP8ABI,
        provider,
    );


    const avatarERC725Contract = new ERC725(schemas, targetContractAddress, 'https://rpc.mainnet.lukso.network', _config);
    const originTotalSupply = await originContract.totalSupply()
    for (let i = 0; i < Number(originTotalSupply); i++) {
        const tokenId = i + 1
        const encodedTokenId = avatarERC725Contract.encodeValueType(
            'uint256',
            tokenId,
        )
        const tokenOwnerAddress = await originContract.tokenOwnerOf(encodedTokenId)
        if (tokenOwnerAddress == '0xfa39A2207f1d1C1ceC32502000481F0feF660384') {
            console.log(tokenId, encodedTokenId, "Token Id Owned By Contract Owner")
            continue
        }
        console.log(tokenOwnerAddress, tokenId, encodedTokenId)
        const transferEncodedFunction = avatarContract.interface.encodeFunctionData('transfer', ['0xfa39A2207f1d1C1ceC32502000481F0feF660384', tokenOwnerAddress, encodedTokenId,
            false, '0x'])
        const tx = await universalProfile.connect(EOA).execute(OPERATION_CALL, // operation type = CREATE
            targetContractAddress,
            0,
            transferEncodedFunction
        )
        tx.wait()
    }
}

/* contractMigration()
 */
const airDrop = async () => {
    const airdropList = ["0x46449e7d22fb09e3cb295b996ba3a8c96ff27075", "0x46449e7d22fb09e3cb295b996ba3a8c96ff27075", "0xab6319fbaa539274031c724d7e35c8760c0c20b7", "0x0a0f3d59a536453c003b75c8795ddc43f0c6d693", "0x234b3946817ac64436b59010cfa85a1e1b3b91a0", "0x648b492803bda096e58fc669795b3daa3f64624c", "0x648b492803bda096e58fc669795b3daa3f64624c", "0x648b492803bda096e58fc669795b3daa3f64624c", "0x22addbf2303d2186ebe6cf6d60c2c69bdcbf8922", "0x22addbf2303d2186ebe6cf6d60c2c69bdcbf8922", "0x7fedf316d792e7eaa7020fe1a3c5c1af8e5b5314", "0x21e79431b9295d1426e75708b4590542e85a1e8e", "0x7df8c9dadb37e32717f9ea011e4c20cbf7a82084", "0x0b25abf901199fd1104cab993a1aeac48272d067", "0x085bb75aee3c75a6d7a7236e3e000d588888780d", "0x10266d3f59eb61a3bd4b000664ddbc5f7a92bfb9", "0x6e1188d0c1517efeb4245661dc418c0e4f8d72ec", "0xcbc8831d9d9641a88c91df7998b5ceea671b62c5", "0xc1d432de41ba2235848821185e518fd3c4225840", "0x0c50c0c0ca7d28c73aebeec5e4b66270d92b17fd", "0x2ad2ebb85cda89a50d5b87c847e26e470e5407dd", "0xe20f6767cacd89006e729202b2629d2a53c03e66", "0xb33f3d1a619b7d24f2e5406cf8709274a7f1ce00", "0x7c179ba5b7f81c41f05cf0be00a0517a8e9e262e", "0x3d2c675a1f1a0e8e0eb178e1a4a99767b969752e", "0x381020e11198521d3bfb00b9464731ce3c68e51a", "0x70717042cff0b531628a3944c90031fdd80f138d", "0x73e2025e80110dbb7c6c3842c334f649093c9ecb", "0xe9109ff545ce8cbeba9e0dacd5d0dfa265f00ad9", "0xcba8fccdd5c8c67c17521f29cab8bcda004ae1f2", "0x0ca5b861f36a846e8d77dd5eaabcfd767cf166e0", "0x1d2f995839107870e0f6599c83477ade9491baa3", "0xc28ac81561e730d9fbd5100db1a8d3317a19d236", "0xc28ac81561e730d9fbd5100db1a8d3317a19d236", "0x91f84d5e489ca4c38c87c77743c1685abf4f6770", "0xece30622baf59d47eff18d60e40061123c43dc26", "0xe569102a009bc313c0527cc5009a3ae6f8b9ca4c", "0x9aa1e1b793da792e75d81c3eaa105c5fe64c6bf9", "0x07b2b4a339a437ed6bfb02e528b3542f9e3b50ec", "0x1744c02cc0331bef6807ff157359b5145c9ab24d", "0xe2fa6cc31b7fb95cadab4cbfbaf41e1bfbae183f", "0xd9a566a484a8455e8c6b7d00e1f8d8d2f601904c", "0x9797953494ad45dd40195c6416b289787db9abe6", "0x9797953494ad45dd40195c6416b289787db9abe6", "0x9797953494ad45dd40195c6416b289787db9abe6", "0x9797953494ad45dd40195c6416b289787db9abe6", "0x9797953494ad45dd40195c6416b289787db9abe6", "0xcd0ff813352956b1658fa5f58f884075b68b0d74", "0x94bc15d2b88f8983217c6f50092ab3e4c5a8dd0c", "0x0a6f723c4d90df036417449402f177c9932c67c8", "0x0a6f723c4d90df036417449402f177c9932c67c8", "0x0a6f723c4d90df036417449402f177c9932c67c8", "0x0a6f723c4d90df036417449402f177c9932c67c8", "0xcadc3f94a1ad75a1bac8644646d9386c991fdff5", "0xcadc3f94a1ad75a1bac8644646d9386c991fdff5", "0xcadc3f94a1ad75a1bac8644646d9386c991fdff5", "0xcadc3f94a1ad75a1bac8644646d9386c991fdff5", "0xe36ddb2a45a50868b77b6611504522bafe1ccc33", "0x9c69255acb16bf24437f111debd2e11b7df64bb5", "0x451a1bbf32eff02b77fd2b38d53d3e216e1b4db4", "0x234c8fcd41d02b104b8e3d9776a11e1b39dfd1b0", "0x282870fde318ae354485dc08999fa1a5f99d3873", "0x73bee12fdb77347543e4a3245320cff9cbbc9e5e", "0x73bee12fdb77347543e4a3245320cff9cbbc9e5e", "0x73bee12fdb77347543e4a3245320cff9cbbc9e5e", "0x73bee12fdb77347543e4a3245320cff9cbbc9e5e", "0xeb1857eba573d847ff68f8026f098b3575a59d09", "0x3e20961ebee1cbe7dfe9d62f8a94720264396354", "0x4945bd66b3faa4726f8c88a0553753f701a1f5f7", "0x4945bd66b3faa4726f8c88a0553753f701a1f5f7", "0x1ca5d5786e35be8c1caf72ef7703e9413ad82e59", "0x05f1bd4af73b96272b7ff7e7725457685e038291", "0x778babe68ad1e0140b05a3eb8cf2a81019f523b5", "0x1e188abbb45eac07754247243a17c2eb827c3c2b", "0xf8792039b89f2e6c32b77526e09211961053a7c0", "0x3e90a6ad2228dadccd76f41eb330dd014ce04156", "0x881c3a94873859d21f1e9cede0f13c8d822bd087", "0x881c3a94873859d21f1e9cede0f13c8d822bd087", "0x7b419ea45c5278cab3e15d1d398d2b830c4ed186", "0x01e0cab664e41e3f4aec3df2d37d3538028fcd4a", "0x46c9e9cbcb7a3b8b155bd5dfb2247a4306f8b8b1", "0x93264d29f27951d83a304a16ae9303fafbc42df0", "0x7688df290a4cb981d9023873223f5738c3f8a0d7", "0xc0e390bd45a9a4304a7a870c62405a5fe98d5238", "0x248c7408fb52d9cee51fc7e095fb7aa389820a8b", "0xaf91c76f2a1ae9f52f9ea43dad3ee85e911f7468", "0xbf730af4397568074412998ea99d64406618860e", "0xbf730af4397568074412998ea99d64406618860e", "0xbf730af4397568074412998ea99d64406618860e", "0x9ee96b2f135042a980a9203d5b7ff6091d79e738", "0xa0e7d903e61ae11063610395d41ff2ba18eaeb83", "0xf91760d1b4c4bb801d6876e2abe2361ffd032a52", "0xbac42b674495d03550195f059e4a49bbbc995615", "0xdddda2d4b16d9868272b8aa7da4674f7280f2ed2", "0xdddda2d4b16d9868272b8aa7da4674f7280f2ed2", "0x50dde93402b35778a8a073b1a58974b43d0d77ee", "0x50dde93402b35778a8a073b1a58974b43d0d77ee", "0x50dde93402b35778a8a073b1a58974b43d0d77ee", "0xfe338c50307dcd1b2718ea12e5111bd6b4442eef", "0x230877a4bb7f05f0290dcb636ee6d45493a8a8dc", "0xe5e4469ecf96e01ba49af49496d7d5cd19c421fc", "0x1339da99019be50746e045a7d1163c038a3f2770", "0xa022e7c3bbb260a400fe09cedd6be93c2cccee7d", "0xbbe88a2f48eaa2ef04411e356d193ba3c1b37200", "0x77e0156df988ce8f621b6944f08644b32441ae53", "0x77e0156df988ce8f621b6944f08644b32441ae53", "0x378be8577ede94b9d4b9f45447f21b826501bab8", "0x378be8577ede94b9d4b9f45447f21b826501bab8", "0x77fa3c41411dfefbf1e82df22cbafeef0c8941fd", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x9a8fa107333d37fff53f507703590d810bd36a58", "0x430e25cd9c4387a020694d590fd44775d32691bb", "0x6c77cbb37f03d700a2b19bbb34fbd402a8207511", "0x6c77cbb37f03d700a2b19bbb34fbd402a8207511", "0x6c77cbb37f03d700a2b19bbb34fbd402a8207511", "0x7bfbcaf9384b43a21287d419b2b347ab44895677", "0xaae90e0000ec70ccc71de79130c563784360f60b", "0xc0bebe1f597745cca1e05ad29be09e1c4ea2e606", "0xc0bebe1f597745cca1e05ad29be09e1c4ea2e606", "0x1e111601dd00842a1d8ef80058dab417fc678cbe", "0x1e111601dd00842a1d8ef80058dab417fc678cbe", "0x752c81c5826d14f60488651a78de746e9a0b9415", "0x752c81c5826d14f60488651a78de746e9a0b9415", "0xb2a74a1d07f854348c2d4b7363a9cb423c8fb6ef", "0xb2a74a1d07f854348c2d4b7363a9cb423c8fb6ef", "0xae594e329b0f47f93a965a653318165eaa7be5dd", "0x9cd867b956f66a45112d2047332384f348a62fa7", "0xfb4ccecada3364f3b32c9d515d7f5340811a29b8", "0xfb4ccecada3364f3b32c9d515d7f5340811a29b8", "0xfbe9f2cc6365614503679af21aa9d28179bdfb4f", "0xfbe9f2cc6365614503679af21aa9d28179bdfb4f", "0x129d19c44a692c7ee9cdc84e05232b0f0b380006", "0x129d19c44a692c7ee9cdc84e05232b0f0b380006", "0x129d19c44a692c7ee9cdc84e05232b0f0b380006", "0xa8e7bab97d05933be232c767a05427bb7a692d04", "0xa8e7bab97d05933be232c767a05427bb7a692d04", "0x52f9e02461e656a0a66707910ae3681ee5dacc62", "0xbbaf9e207dbdaa06b3d3bfa31c4f394cb93ec2a1", "0x959efff4187c425f3aed079d66e85df6b5512765", "0xc813f6f86618e1cd538ae8b931fe4b34fe0fd362", "0x41be92e41b9d8e320330bad6607168adb833fcd5", "0x6a8fab9571f45b0e55a2605c961825b5e46bffe0", "0xb3a12262dc4dfe96c49befcad0b901ee2d6a0ba0", "0xc7d873c8a6c8e329d566b20e42980e24dd9af107", "0xf39765b43d9daef6331bb17041197b0f0123d6d9", "0xf90fa6178a68b5d08eb40479c18c5738dcf4b927", "0x3a06450b10fd0d9eaeabf686a5f59a42bbcd19a3", "0xa1d2d25ae200e428f48cced548a7644312fd7c8a", "0xa1d2d25ae200e428f48cced548a7644312fd7c8a", "0x96be167e06db6ad6ff3dc158d6f3c05d5fda1a37", "0x47d378212f499aea2be264f230902969c353e424", "0x1708adf7db9a70b41f9f807b9f6b4a951aff705b", "0x1708adf7db9a70b41f9f807b9f6b4a951aff705b", "0x1708adf7db9a70b41f9f807b9f6b4a951aff705b", "0x1708adf7db9a70b41f9f807b9f6b4a951aff705b", "0x218f77fc44a3e36aee96438a461f0eb9e590e356", "0x218f77fc44a3e36aee96438a461f0eb9e590e356", "0x218f77fc44a3e36aee96438a461f0eb9e590e356", "0x218f77fc44a3e36aee96438a461f0eb9e590e356", "0xd04a5e0b4424818cf059c3b4525b36de737832c1", "0x327a1e3ae86b2002adf99f08c979cca1bffd01f9", "0x79b296f1828142572e6c6b984d121e66dfe3ae2f", "0x4642f380c66e455f47430b390d2a566e56eb414a", "0xe5a8857544ef840999945b13055a5c625ac38d46", "0xe5a8857544ef840999945b13055a5c625ac38d46", "0x7ee5e78b8da599fce0edfb464547774366d6465f", "0xdf869fe30f4714eaf7d518181266517753e0731f", "0xdf869fe30f4714eaf7d518181266517753e0731f", "0xdf869fe30f4714eaf7d518181266517753e0731f", "0xdf869fe30f4714eaf7d518181266517753e0731f", "0xdf869fe30f4714eaf7d518181266517753e0731f", "0x3ee92cc3a7bfe3d970ca969fb16d5850c2f55873", "0x50ea1f54fceede08962747c53d400607adddc84b", "0xc4e35e28ca622a698cf3bf6adbac5f03ee432e9a", "0x118b5d09f5f725915274b624e98f08c275a0c89f", "0xd8744e1c6b2f9e49c54dee14f9a51e202e121228", "0xd8744e1c6b2f9e49c54dee14f9a51e202e121228", "0x68a38f9b3a33691573d5ae6310980491ea5f9dbb", "0x888a848ab6c50e65ad6a39acdb34691725577e48", "0x149dd09147e2b6c21124c0cf1354696106b76aca", "0xa893c4c8e3cc951935b865f1a84c771136a4e555", "0x2c505c48677daeea2ae8877d1bb031a4252881f7", "0xc5411c871a668707e992c68e0c0a1d3a3edfba4f", "0x679d78578937489a6444d5aee7ed2ef12462524f", "0x00838a4a4285f366a671cd1bb6f0007cf2f506f9", "0x00838a4a4285f366a671cd1bb6f0007cf2f506f9", "0x8ab89ececa9b1d71d46688aac06c92463ad26d99", "0x7c76696eacfa6f894719317ce03c8f24e9462081", "0x656e6d406dc2fabe9825a732febfffb5bbfc7f84", "0x2cdfa4c1f3a6b4effecd2220599a3736d5614500", "0x2cdfa4c1f3a6b4effecd2220599a3736d5614500", "0x2cdfa4c1f3a6b4effecd2220599a3736d5614500", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x5c5afe4b214fcefd8df1a1c3b8e666591e8554f9", "0x3910caaded28962573889c8a9a9fbe8e721cb906", "0x3910caaded28962573889c8a9a9fbe8e721cb906", "0xf09b1985c7614c2a8f99afab492ecdf6bae70388", "0xf09b1985c7614c2a8f99afab492ecdf6bae70388", "0xf09b1985c7614c2a8f99afab492ecdf6bae70388", "0xf76ef9e28ac9c7dbb89729e2f52d810b643b1576", "0x5f12c83d462eee18821cd74beca8547013c28092", "0x707dd5da74b427625669a00d362fba16cb9c49b5", "0x0bbb4fe3e8ce441de4315af9230ae53514ffb50a", "0xe527f0012585a4c164046211da07ed5090b91dba", "0x4f209ca477ae53c989f9bee51ba8aa7ecd43201a", "0x0e2f830eeb96a2a062e1bf3973262c44ed21e580", "0x9f44880dd3ac71c3754827f0d129209597a2787f", "0x1af30099af4fa0d1da8edf97a68c69436c52e284", "0x92b9e9ac7d91d545a8638448fff80f0fbf145249", "0x8b22d938774fcbee58ebe7046457e6020be71f75", "0xcf2be7e117fecdec17957a2cf2264db74211ef3e", "0xd061b39b7340dab4b8060744d8dd593790fa2cb7", "0xfa6f58063c9e1017a829fab865de85866f8771fa", "0xfa6f58063c9e1017a829fab865de85866f8771fa", "0xfa6f58063c9e1017a829fab865de85866f8771fa", "0x5e789955e878dc65ad07e5cf51795fc1abbd0509", "0xe6eb90bc4e032761773ee615f7a660b267bf37d3", "0x71352c4fbe872072ad4fec4c9fdc29d3e5a935ed", "0xa559ddd0eabae21b16793e805fc7180b7c397227", "0x40d7ee9a2c074f7b88186a329c0a32c7938d9019", "0x99009b3cdc3db0c9f3ad1b1e4cb9ca1ab8f21b99", "0xd4bd045052d2f8b2fa72e2c14c7475589e5e8a7a", "0x7a2f29a929c3ae69587e08544b4b618f34f89f18", "0x0e0d6c0e84d20eef9c2609cf7b0bb90699a22a02", "0x0e0d6c0e84d20eef9c2609cf7b0bb90699a22a02", "0x67ca5ddf6ad4d097f994ff2c38198517384d32de", "0x96e27e0ec60a22b501a1c85db9efa8cd7429b314", "0xfee4110d231ed9009304edf2c589d1c0f28b4599", "0x62dd53ab9ac524bb81f582a05b429a5379130ff6", "0x3ea45008748bea6ac18371ba225ab3a3bed7a958", "0x31dad352b2b8f80a9464abdd7c04ac8f0d8c8b10", "0x4d2ca70ad8b153936d58ab4ce89c0bac000525c1", "0xfb79e3d8c697f87bcb46111f49d052d46efded66", "0xfb79e3d8c697f87bcb46111f49d052d46efded66", "0xfb79e3d8c697f87bcb46111f49d052d46efded66", "0xfb79e3d8c697f87bcb46111f49d052d46efded66", "0xfb79e3d8c697f87bcb46111f49d052d46efded66", "0xfb79e3d8c697f87bcb46111f49d052d46efded66", "0xfb79e3d8c697f87bcb46111f49d052d46efded66", "0xfb79e3d8c697f87bcb46111f49d052d46efded66", "0xfb79e3d8c697f87bcb46111f49d052d46efded66", "0xfb79e3d8c697f87bcb46111f49d052d46efded66", "0xfb79e3d8c697f87bcb46111f49d052d46efded66", "0xfb79e3d8c697f87bcb46111f49d052d46efded66", "0xfb79e3d8c697f87bcb46111f49d052d46efded66", "0xfb79e3d8c697f87bcb46111f49d052d46efded66", "0xfb79e3d8c697f87bcb46111f49d052d46efded66", "0x2a4b0cfb82a0721416045c4985f0f860ba706dd3", "0xc6c11eca9bbf2247ae33d4c9136bdc8b79fc68ea", "0xb0905b68e20ee5bab88a2d13084bf487a6e21eb7", "0x05d52b56ab35ea1ab880d1597fe1047f021deae4", "0x245a477d4a57dad6ff051408fb8f22766a591be5", "0xd99857bff8c27e896bf54da265e51cae068d0379", "0x9b79221baf1871fb38dd614d0d7085aaf6fa5212", "0x311b2036ac58832d448a47cfb08e67697d1ea34b", "0x311b2036ac58832d448a47cfb08e67697d1ea34b", "0x311b2036ac58832d448a47cfb08e67697d1ea34b", "0x311b2036ac58832d448a47cfb08e67697d1ea34b", "0x311b2036ac58832d448a47cfb08e67697d1ea34b", "0xaeae91332c28adfd1d4b039b8a10b5d63b0a386c", "0xaeae91332c28adfd1d4b039b8a10b5d63b0a386c", "0xeccedbdad7dae297d1ef1134cca43cdfc2857bd1", "0xeccedbdad7dae297d1ef1134cca43cdfc2857bd1", "0xeccedbdad7dae297d1ef1134cca43cdfc2857bd1", "0xeccedbdad7dae297d1ef1134cca43cdfc2857bd1", "0xeccedbdad7dae297d1ef1134cca43cdfc2857bd1", "0xeccedbdad7dae297d1ef1134cca43cdfc2857bd1", "0xeccedbdad7dae297d1ef1134cca43cdfc2857bd1", "0x0ebbf5aad9a0ee0de5765f02963f6b1cd5d8a418", "0x430b5751808bddb463d2aef2306a56a794e17692", "0x551d0ebc7b6124126285f90c693ef6999cd28025", "0x00902f4505f88b4b26a391b9a3ae6ec3aef91175", "0x00902f4505f88b4b26a391b9a3ae6ec3aef91175", "0x065f8eb18ebb45747c8c4b3f59bdc9e375e7c2df", "0x29d7c7e4571a83b3ef5c867f75c81d736a9d58aa", "0x26e7da1968cfc61fb8ab2aad039b5a083b9de21e", "0xa1ee4cc968a0328e9b1cf76f3cd7d4dbe9a02a78", "0x11c0a5d6a6dde5a9643d33f0775902eb0ab125e0", "0x95ea0c496c7b023e4a4da41b51ec8b488023339e", "0xd9a4dde76a63df1e72c4ce0cde16e80d4724fba2", "0x37415b787190b2bc6371093383e84a03e975d716", "0xc493c8844ad525186ffc3b718b17973fa69c101b", "0x2aaf9c5616fcf3af252dc2a4c935db40a5e695d6", "0x2aaf9c5616fcf3af252dc2a4c935db40a5e695d6", "0x68b02c9a11d7fcb7590889e216389b416949e386", "0x68b02c9a11d7fcb7590889e216389b416949e386", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0x5d2fa3ef7384ac759a074701890ebe23e5d09059", "0xf3696fe16f3d7c1932ceaf1d3c33a32aef3037b8", "0xf3696fe16f3d7c1932ceaf1d3c33a32aef3037b8", "0xf3696fe16f3d7c1932ceaf1d3c33a32aef3037b8", "0xf3696fe16f3d7c1932ceaf1d3c33a32aef3037b8", "0xf3696fe16f3d7c1932ceaf1d3c33a32aef3037b8", "0xf3696fe16f3d7c1932ceaf1d3c33a32aef3037b8", "0xf3696fe16f3d7c1932ceaf1d3c33a32aef3037b8", "0xf3696fe16f3d7c1932ceaf1d3c33a32aef3037b8", "0xf3696fe16f3d7c1932ceaf1d3c33a32aef3037b8", "0xf3696fe16f3d7c1932ceaf1d3c33a32aef3037b8", "0xf3696fe16f3d7c1932ceaf1d3c33a32aef3037b8", "0xf3696fe16f3d7c1932ceaf1d3c33a32aef3037b8", "0xf3696fe16f3d7c1932ceaf1d3c33a32aef3037b8", "0xf3696fe16f3d7c1932ceaf1d3c33a32aef3037b8", "0x4d26f3e69973de843e3446f641b46384701b4217", "0x4d26f3e69973de843e3446f641b46384701b4217", "0x5545ceb7f77b3f713fae514232c3ca4fe06ae1f3", "0x9d4d46c475a94ca379d90ed19c3b08bb3c5f5d34", "0x935068bb8b5af50bf941a7f88be7dc00458f5339", "0x935068bb8b5af50bf941a7f88be7dc00458f5339", "0x383b85481a24e3c1dfeb7e58a65537cf78f2d20b", "0x3c3253650bea79cf895d6b793d9f8eea43f80390", "0x26526debd4ac8fcd9592c82970d5ac1e53a663d9", "0x26526debd4ac8fcd9592c82970d5ac1e53a663d9", "0x80237be7517d0bc735a5d8c06c093f7fa4618a63", "0x80237be7517d0bc735a5d8c06c093f7fa4618a63", "0xb3b188d3ab6f3bce5b6c17f7db7d9682d39bc589", "0xc70f80bb4df893cf70d7bedd3902a2d76445537a", "0x6827cfd20dc7bfe42a84ea320448fb75caa95991", "0x6827cfd20dc7bfe42a84ea320448fb75caa95991", "0x6827cfd20dc7bfe42a84ea320448fb75caa95991", "0x74e3b300a82c712234f4fa60a50ead494b52a8f4", "0xf54a1b5aa9712a3a00ed45778cfd8be14a408485", "0xbcba4fe7e548b67a42342a69b37dbcaf713fb2da", "0xa1be982bbc7005fbc1d966542d3ac8e921b063bb", "0xb76ac1bc8fed275d43c7b2130a7b753eec9e7a4a", "0x37502a753ea697fbdf5402718c2f83443e4569b3", "0x523f05b9e75275c403d62ca625036b62ad2b5513", "0x424ffc9e6c3eeb4fccc3167b77f14b12164c9ac6", "0x8cabb08c1c00012731aaafddd480b85bc8478b91", "0x8cabb08c1c00012731aaafddd480b85bc8478b91", "0x8cabb08c1c00012731aaafddd480b85bc8478b91", "0x4acabf64aef8ca056d35367bcafa1cd78a17bf1c", "0x4acabf64aef8ca056d35367bcafa1cd78a17bf1c", "0x4acabf64aef8ca056d35367bcafa1cd78a17bf1c", "0x89240eb6b68a98e6304f2348e43d954a3581611f", "0xc140ac44566f7b2db65dd054ce7681d1d87257d4", "0x7b5a42885878d70e730a93e2a76a4b8ebc0d0182", "0x33ed4ff96de3522839ce11052235767f467e7c23", "0x33ed4ff96de3522839ce11052235767f467e7c23", "0xace655a51051524e32336199467b19b26a3c6f3c", "0x0d5c8b7cc12ed8486e1e0147cc0c3395739f138d", "0xda96fab60c71cfb3f5f7804342572095029dad38", "0x33b1cd6ee8135cbe370a1862a44810c725218390", "0x3febba031a3f6326127097250c35ee1b68c3c777"]
    const targetContractAddress = '0x74654920356257981f6b63a65ad72d4d9bc21929';
    const avatarContract = new ethers.Contract(
        targetContractAddress,
        LSP8ABI,
        provider,
    );

    const airdropTokenIds = await avatarContract.tokenIdsOf('0xfa39A2207f1d1C1ceC32502000481F0feF660384')
    console.log(airdropTokenIds)
    const avatarERC725Contract = new ERC725(schemas, targetContractAddress, 'https://rpc.mainnet.lukso.network', _config);
    for (let i = 0; i <= airdropList.length; i++) {
        const tokenId = airdropTokenIds[i]
        const airdropAddress = airdropList[i]

        console.log(airdropAddress, tokenId, i)
        const transferEncodedFunction = avatarContract.interface.encodeFunctionData('transfer', ['0xfa39A2207f1d1C1ceC32502000481F0feF660384', airdropAddress, tokenId,
            true, '0x'])
        const tx = await universalProfile.connect(EOA).execute(OPERATION_CALL, // operation type = CREATE
            targetContractAddress,
            0,
            transferEncodedFunction
        )
        tx.wait()
    }
}

/* airDrop()  */

const withdraw = async () => {
    const targetContractAddress = '0x323b3f7aff4e60a13593401521b96197f3c59369';
    const avatarContract = new ethers.Contract(
        targetContractAddress,
        LSP8ABI,
        provider,
    );
    const claimableBalance = await avatarContract.claimBalanceOf('0xfa39A2207f1d1C1ceC32502000481F0feF660384')
    const withdrawEncodedFunction = avatarContract.interface.encodeFunctionData('claim', ['0xfa39A2207f1d1C1ceC32502000481F0feF660384', claimableBalance])
    const tx = await universalProfile.connect(EOA).execute(OPERATION_CALL, // operation type = CREATE
        targetContractAddress,
        0,
        withdrawEncodedFunction
    )
    tx.wait()

}
/* withdraw() */

const sendTo = async () => {
    const targetContractAddress = '0x74654920356257981f6b63a65ad72d4d9bc21929';
    const avatarContract = new ethers.Contract(
        targetContractAddress,
        LSP8ABI,
        provider,
    );

    const airdropTokenIds = await avatarContract.tokenIdsOf('0xfa39A2207f1d1C1ceC32502000481F0feF660384')
    console.log(airdropTokenIds)
    for (let i = 0; i <= 4; i++) {
        const tokenId = airdropTokenIds[i]
        const airdropAddress = '0x99F0B34F745a91ef00b33ebb96B84FF61e01e41B'

        console.log(airdropAddress, tokenId, i)
        const transferEncodedFunction = avatarContract.interface.encodeFunctionData('transfer', ['0xfa39A2207f1d1C1ceC32502000481F0feF660384', airdropAddress, tokenId,
            true, '0x'])
        const tx = await universalProfile.connect(EOA).execute(OPERATION_CALL, // operation type = CREATE
            targetContractAddress,
            0,
            transferEncodedFunction
        )
        tx.wait()
    }
}

/* sendTo()
 */
const setBaseURI = async () => {
    const targetContractAddress = '0x74654920356257981f6b63a65ad72d4d9bc21929';
    const targetContract = new ethers.Contract(
        targetContractAddress,
        UniversalProfile.abi,
        provider,
    );

    const avatarERC725Contract = new ERC725(schemas, targetContractAddress, 'https://rpc.mainnet.lukso.network', _config);

    const metadataDataKey = avatarERC725Contract.encodeKeyName('LSP8TokenMetadataBaseURI')
    /*     const metadataDataValue = avatarERC725Contract.encodeData([
            {
                keyName: 'LSP8TokenMetadataBaseURI',
                value: 'ipfs://QmdQnUhWpsubqNjWsFkPmx1pY16Fz5QtCPAeZHQRao9woa'
            },
        ]) */
    const encodedBaseUri = concatBaseURI('ipfs://bafybeibtakbvx57vz2pz4vhacroncfk4cbra7utj2baoee2w43nhk626ju/')

    const setBaseUriEncodedFunction = targetContract.interface.encodeFunctionData('setData', [metadataDataKey, encodedBaseUri])
    const tx = await universalProfile.connect(EOA).execute(OPERATION_CALL, // operation type = CREATE
        targetContractAddress, // address zero
        0, // amount to the fund the contract with when deploying
        setBaseUriEncodedFunction
    )
    tx.wait()
    console.log(tx)
}

function concatBaseURI(baseURI) {
    const prefix = Buffer.from('6f357c6a', 'hex');
    const baseURIBuffer = Buffer.from(baseURI);
    const resultBuffer = Buffer.concat([prefix, baseURIBuffer]);
    return '0x' + resultBuffer.toString('hex');
}

/* setBaseURI() */

const burnTokens = async ()=>{
    const targetContractAddress = '0x3D6894787Ea0228237b408Ec04d1d1C39554Cb61';
    const avatarContract = new ethers.Contract(
        targetContractAddress,
        DropContractABI,
        provider,
    );
    const burnEncodedFunction = avatarContract.interface.encodeFunctionData('burn', ['0x06d0c7fc09974a69ae1df763e269b3caec8b316e',
        1])
    const tx = await universalProfile.connect(EOA).execute(OPERATION_CALL, // operation type = CREATE
        targetContractAddress,
        0, // amount to the fund the contract with when deploying
        burnEncodedFunction
    )
}

/* burnTokens() */

const mintDrop = async () => {
    const targetContractAddress = '0xf05c6747b2c6c8ae984651f54a109a11196ffc43';
    const avatarContract = new ethers.Contract(
        targetContractAddress,
        DropContractABI,
        provider,
    );
    const array = [
        '0xbF969fdCCf9D9bEEe0b56bdaEF2a73a6eb885C59',
        '0xA286d419a9d67Ef189F9200800b18A6881d24b9b',
        '0x29d7c7E4571a83B3eF5C867f75c81D736a9D58aa',
        '0xab5773b774c532aad8e60b088eb77c7cc937448a',
        '0xab5773b774c532aad8e60b088eb77c7cc937448a',
        '0xab5773b774c532aad8e60b088eb77c7cc937448a',
        '0xab5773b774c532aad8e60b088eb77c7cc937448a',
        '0xab5773b774c532aad8e60b088eb77c7cc937448a',
        '0xab5773b774c532aad8e60b088eb77c7cc937448a',
        '0xab5773b774c532aad8e60b088eb77c7cc937448a',
        '0xdE0Da643334b4f0722f45baA9b1f7B7C71C82976',
        '0x26526debd4ac8fcd9592c82970d5ac1e53a663d9',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x202e3754ef7df874ddfa92c7d14240f1a77d2e0b',
        '0x3364D57a4ec61388E6F5d34fD51d88EC91998b59',
        '0x05d52b56AB35ea1aB880D1597fE1047F021DEae4',
        '0xf3696Fe16f3d7c1932CEAf1D3c33A32aEf3037B8',
        '0x82C4DC98E27cFE9d7D312250e972e7380fBf6B77',
        '0x541e81180b8bc7ddF10DcCEC3dFa7ed278caC316',
        '0x041B2744fB8433Fc8165036d30072c514390271e',
        '0xcEcD1798420A533c9627770e052f49aa127c3B3B',
        '0x1339dA99019bE50746E045a7D1163c038a3f2770',
        '0x1339dA99019bE50746E045a7D1163c038a3f2770',
        '0x1339dA99019bE50746E045a7D1163c038a3f2770',
        '0x1339dA99019bE50746E045a7D1163c038a3f2770',
        '0x1339dA99019bE50746E045a7D1163c038a3f2770',
        '0x1339dA99019bE50746E045a7D1163c038a3f2770',
        '0x1339dA99019bE50746E045a7D1163c038a3f2770',
        '0x64318CDdF0F87DBa45BE181584c54Ae955ABF2D2',
        '0xd64Deb40240209473f676945c2ed2bfA2CeF2B7d',
        '0x065F8Eb18eBb45747c8C4b3F59bDC9E375e7C2Df',
        '0x0Ea75f1646073aD4A76C43A3BBCabd6D47Fe738C',
        '0xb24F0de210e408d7A2d7361b082D5Fb7061733d7',
        '0x7727BebfA486e232fd1c36b96343163d0b3Dc2e5',
        '0x7001420371860fcd0d7ccce907c23ac704b2a51c',
        '0x4dcf320d483d5f5c527ff7a455aa59af31a4e84a',
        '0x3c3253650bea79cf895d6b793d9f8eea43f80390',
        '0x4dcf320d483d5f5c527ff7a455aa59af31a4e84a',
        '0x4dcf320d483d5f5c527ff7a455aa59af31a4e84a',
        '0x4dcf320d483d5f5c527ff7a455aa59af31a4e84a',
        '0x4dcf320d483d5f5c527ff7a455aa59af31a4e84a',
        '0x7fb1829bEA330Aa8315Ff3c6a8B7B0F50Eb65E8C',
        '0x8282c581BBd9071e7E6b3630E322FAC2CDC80F87',
        '0xe11999ecae4c2cd5e719577f71fae32d5f6bc4d0',
        '0x152BDF6893c9e020894C815de52FEAba213F5223',
        '0x1916D7915001dEA6b2996Eb7B3585FCdE0167906',
        '0xb46d2c5357107b8670b4a90132b4f41b7f110a84',
        '0x49e15909da658786054f2d1e09f7bebefd1b13f4',
        '0x57d4876c0bdc25d1a76efd78738b764181afe828',
        '0xFBE1cEE27d6C7b4bCe0d72b6c711F647e6E79aa8',
        '0xae0D6988d8C26CB54315D8D40dbCC86542fDb076',
        '0x8b1d746bd25ac3307a3a38cbd1cf88261fdcc03f',
        '0xe345E97D7cE933a6344516ee2ae1AABd6C47d35f',
        '0x9268A1DEC49B6Be4E4bE3cb558CA2e23f599eb03',
        '0xB19846077fE2E113037478161f025c135A3F75D5',
        '0xAAE90E0000eC70ccC71De79130c563784360F60B',
        '0xe100b05Dc141EB1E13DF381A9Da4e725b3cC0656',
        '0xECcedBDAD7DAe297D1EF1134CcA43Cdfc2857bD1',
        '0x129D19C44A692c7Ee9cDc84e05232b0F0B380006'
    ]
    for (let index = 0; index < array.length; index++) {
        console.log(index+1)
        const address = array[index];
        const mintEncodedFunction = avatarContract.interface.encodeFunctionData('mint', [address,
            '1', true, '0x'])
        const tx = await universalProfile.connect(EOA).execute(OPERATION_CALL, // operation type = CREATE
            targetContractAddress,
            0, // amount to the fund the contract with when deploying
            mintEncodedFunction
        )
        tx.wait()
    }
}

mintDrop()