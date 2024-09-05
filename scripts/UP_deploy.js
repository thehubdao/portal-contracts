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

const RPC_URL = process.env.RPC_URL

const provider = new ethers.JsonRpcProvider(
    RPC_URL
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
    const targetContractAddress = '0x4FB99a7ab547582646B9069eAB46F91dBAf31091';
    const targetContract = new ethers.Contract(
        targetContractAddress,
        UniversalProfile.abi,
        provider,
    );

    const avatarERC725Contract = new ERC725(schemas, targetContractAddress, RPC_URL, _config);

    const metadataDataKey = avatarERC725Contract.encodeKeyName('LSP4Metadata')
    const metadataDataValue = avatarERC725Contract.encodeData([
        {
            keyName: 'LSP4Metadata',
            value: {
                json: { "LSP4Metadata": { "name": "Metaheads Hat", "description": "Third  wearable drop from THE HUB DAO featuring Metaheads. This LSP7 token can only be used once and it can only be equipped to your Citizens. If you equip it to any of your Citizens, this token will be burnt. Choose wisely!", "images": [[{ "width": 1080, "height": 1080, "url": "ipfs://QmaT1JMTAcid7d6PsY3eNXQnLpahw21Qv2Vir48HbzkTAc" }]], "attributes": [{ "value": "Tier", "type": "string", "key": "Mythical" }]} },
                url: 'ipfs://QmesSjNQ7FwZptgafWsJN8biSpiXDhPGnVYURmhjFPXZsT',
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
setContractMetadata()

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

    const avatarERC725Contract = new ERC725(schemas, targetContractAddress, RPC_URL, _config);

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

    const avatarERC725Contract = new ERC725(schemas, targetContractAddress, RPC_URL, _config);
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


    const avatarERC725Contract = new ERC725(schemas, targetContractAddress, RPC_URL, _config);
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
    const airdropList = ["0x46449e7d22fb09e3cb295b996ba3a8c96ff27075", "0x46449e7d22fb09e3cb295b996ba3a8c96ff27075"]
    const targetContractAddress = '0x74654920356257981f6b63a65ad72d4d9bc21929';
    const avatarContract = new ethers.Contract(
        targetContractAddress,
        LSP8ABI,
        provider,
    );

    const airdropTokenIds = await avatarContract.tokenIdsOf('0xfa39A2207f1d1C1ceC32502000481F0feF660384')
    console.log(airdropTokenIds)
    const avatarERC725Contract = new ERC725(schemas, targetContractAddress, RPC_URL, _config);
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

    const avatarERC725Contract = new ERC725(schemas, targetContractAddress, RPC_URL, _config);

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

const burnTokens = async () => {
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
    ]
    for (let index = 0; index < array.length; index++) {
        console.log(index + 1)
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

/* mintDrop() */