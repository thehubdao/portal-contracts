// SPDX-License-Identifier: MIT
import "@lukso/lsp-smart-contracts/contracts/LSP17ContractExtension/LSP17Extension.sol";
import "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";
import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";
import "@lukso/lsp-smart-contracts/contracts/LSP2ERC725YJSONSchema/LSP2Utils.sol";
import "./AvatarWearable.sol";

pragma solidity ^0.8.20;

contract AvatarContractExtension is LSP17Extension, ERC725Y {
    struct Linkedwearable {
        address wearableContract;
        uint256 wearableTokenId;
    }

    event WearableEquipped(
        uint256 indexed tokenId,
        address indexed wearableContract,
        uint256 indexed wearableTokenId,
        address owner
    );

    event WearableUnequipped(
        uint256 indexed tokenId,
        address indexed wearableContract,
        uint256 indexed wearableTokenId,
        address owner
    );

    event TokenMetadataUpdated(
        uint256 indexed tokenId,
        bytes32 indexed dataKey,
        bytes dataValue,
        address owner
    );

    event StorageDataUpdated(
        bytes32 indexed dataKey,
        bytes dataValue,
        address indexed targetContract,
        address indexed owner
    );

    modifier onlyTokenOwner(uint256 tokenId) {
        require(
            LSP8IdentifiableDigitalAsset(payable(msg.sender)).tokenOwnerOf(
                bytes32(tokenId)
            ) == _extendableMsgSender(),
            "Only token Owner can call this function"
        );
        _;
    }

    constructor(address initialOwner) LSP17Extension() ERC725Y(initialOwner) {}

    function _equippedWearablesKey(
        uint256 tokenId,
        address wearableContract,
        uint256 wearableTokenId
    ) internal pure returns (bytes32) {
        bytes32 firstWordHash = keccak256(bytes("equippedWearables"));
        bytes32 secondWordHash = keccak256(bytes(abi.encodePacked(tokenId)));
        bytes32 thirdWordHash = keccak256(
            abi.encodePacked(wearableContract, wearableTokenId)
        );
        bytes32 key = LSP2Utils.generateMappingWithGroupingKey(
            bytes6(firstWordHash),
            bytes4(secondWordHash),
            bytes20(thirdWordHash)
        );

        return key;
    }

    function _updateLSP8Data(bytes32 key, bytes memory value) internal {
        address upOwner = Ownable(msg.sender).owner();

        require(upOwner != address(0), "UP owner is zero");

        bytes memory setDataCall = abi.encodeWithSignature(
            "setData(bytes32,bytes)",
            key,
            value
        );

        (bool success, bytes memory returnData) = upOwner.call(
            abi.encodeWithSignature(
                "execute(uint256,address,uint256,bytes)",
                0,
                msg.sender,
                0,
                setDataCall
            )
        );

        if (!success) {
            if (returnData.length > 0) {
                assembly {
                    revert(add(returnData, 0x20), mload(returnData))
                }
            } else {
                revert("UP execute failed - no return data");
            }
        }

        emit StorageDataUpdated(key, value, msg.sender, _extendableMsgSender());
    }

    function _updateTokenIdLSP8Data(
        bytes32 tokenId,
        bytes memory value
    ) internal {
        address upOwner = Ownable(msg.sender).owner();

        require(upOwner != address(0), "UP owner is zero");
        bytes32 lsp4MetadataKey = keccak256("LSP4Metadata");
        bytes memory setDataCall = abi.encodeWithSignature(
            "setDataForTokenId(bytes32,bytes32,bytes)",
            tokenId,
            lsp4MetadataKey,
            value
        );

        (bool success, bytes memory returnData) = upOwner.call(
            abi.encodeWithSignature(
                "execute(uint256,address,uint256,bytes)",
                0,
                msg.sender,
                0,
                setDataCall
            )
        );

        if (!success) {
            if (returnData.length > 0) {
                assembly {
                    revert(add(returnData, 0x20), mload(returnData))
                }
            } else {
                revert("UP execute failed - no return data");
            }
        }

        emit TokenMetadataUpdated(
            uint256(tokenId),
            lsp4MetadataKey,
            value,
            _extendableMsgSender()
        );
    }

    function equipWearable(
        uint256 tokenId,
        address wearableContract,
        uint256 wearableTokenId
    ) internal {
        AvatarWearable(payable(wearableContract)).transferWearable(
            wearableTokenId,
            _extendableMsgSender(),
            msg.sender //This contract is an LSP17 extension and should transfer the wearable to the avatar contract that is, the sender. In case of deploying a new avatar, the sender is the avatar contract itself and would have to make one codebase for the contract.
        );

        bytes32 key = _equippedWearablesKey(
            tokenId,
            wearableContract,
            wearableTokenId
        );

        bytes memory value = abi.encode(
            Linkedwearable(wearableContract, wearableTokenId)
        );

        _updateLSP8Data(key, value);

        emit WearableEquipped(
            tokenId,
            wearableContract,
            wearableTokenId,
            _extendableMsgSender()
        );
    }

    function unequipWearable(
        uint256 tokenId,
        address wearableContract,
        uint256 wearableTokenId
    ) internal {
        bytes32 key = _equippedWearablesKey(
            tokenId,
            wearableContract,
            wearableTokenId
        );

        _updateLSP8Data(key, bytes(""));
        AvatarWearable(payable(wearableContract)).transferWearable(
            wearableTokenId,
            msg.sender, // This contract is an LSP17 extension and should transfer the wearable to the avatar contract that is, the sender. In case of deploying a new avatar, the sender is the avatar contract itself and would have to make one codebase for the contract.
            _extendableMsgSender()
        );

        emit WearableUnequipped(
            tokenId,
            wearableContract,
            wearableTokenId,
            _extendableMsgSender()
        );
    }

    function getClaimPrice(
        Linkedwearable[] memory wearablesToEquip
    ) public view returns (uint256) {
        uint256 claimPrices = 0;
        for (uint256 i = 0; i < wearablesToEquip.length; i++) {
            claimPrices += AvatarWearable(
                payable(wearablesToEquip[i].wearableContract)
            ).claimPrice();
        }
        return claimPrices;
    }

    function claimAndSetNewWearings(
        uint256 avatarTokenId,
        bytes[] memory claimSignatures,
        uint256[] memory predictedWearableTokenIds,
        Linkedwearable[] memory wearablesToUnequip,
        Linkedwearable[] memory wearablesToEquip,
        bytes memory lsp4MetadataValue
    ) public payable onlyTokenOwner(avatarTokenId) {
        // Verificar que tenemos suficiente ETH para todos los claims
        uint256 totalClaimPrice = 0;
        for (uint256 i = 0; i < wearablesToEquip.length; i++) {
            totalClaimPrice += AvatarWearable(
                payable(wearablesToEquip[i].wearableContract)
            ).claimPrice();
        }
        require(msg.value >= totalClaimPrice, "Insufficient ETH for claims");

        // Claim cada wearable y verificar tokenId predicho
        for (uint256 i = 0; i < wearablesToEquip.length; i++) {
            uint256 claimPrice = AvatarWearable(
                payable(wearablesToEquip[i].wearableContract)
            ).claimPrice();

            uint256 newTokenId = AvatarWearable(
                payable(wearablesToEquip[i].wearableContract)
            ).claimWearable{value: claimPrice}(
                claimSignatures[i],
                _extendableMsgSender()
            );

            require(
                newTokenId == predictedWearableTokenIds[i], //We predict and check the token id to avoid any inconsistency between minted tokenId and equipping. EG:If two users claim and equip at the same time.
                "Predicted token ID mismatch"
            );
        }

        // Ahora equipar todo
        setAvatarNewWearings(
            avatarTokenId,
            wearablesToUnequip,
            wearablesToEquip,
            lsp4MetadataValue
        );
    }

    function setAvatarNewWearings(
        uint256 tokenId,
        Linkedwearable[] memory wearablesToUnequip,
        Linkedwearable[] memory wearablesToEquip,
        bytes memory lsp4MetadataValue
    ) public onlyTokenOwner(tokenId) {
        for (uint256 i = 0; i < wearablesToUnequip.length; i++) {
            unequipWearable(
                tokenId,
                wearablesToUnequip[i].wearableContract,
                wearablesToUnequip[i].wearableTokenId
            );
        }

        for (uint256 i = 0; i < wearablesToEquip.length; i++) {
            equipWearable(
                tokenId,
                wearablesToEquip[i].wearableContract,
                wearablesToEquip[i].wearableTokenId
            );
        }
        bytes32 bytestokenId = bytes32(tokenId);
        _updateTokenIdLSP8Data(bytestokenId, lsp4MetadataValue);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(LSP17Extension, ERC725YCore) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
