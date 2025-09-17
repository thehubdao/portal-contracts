// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;
import "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "./AvatarAccess.sol";

contract AvatarWearable is LSP8IdentifiableDigitalAsset {
    address public avatarAccessContract;

    uint256 public claimPrice = 0 ether;

    mapping(address => uint256) public userNonces;

    mapping(address => uint256) public userClaims;

    event WearableClaimed(address indexed user, uint256 indexed tokenId);

    constructor(
        string memory name,
        string memory symbol,
        address _avatarAccessContract,
        uint256 _claimPrice
    ) LSP8IdentifiableDigitalAsset(name, symbol, msg.sender, 1, 0) {
        claimPrice = _claimPrice;
        avatarAccessContract = _avatarAccessContract;
    }

    function getUserNonce(address user) public view returns (uint256) {
        return userNonces[user];
    }

    function getUserClaims(address user) public view returns (uint256) {
        return userClaims[user];
    }

    function setAvatarAccessContract(
        address _avatarAccessContract
    ) external onlyOwner {
        avatarAccessContract = _avatarAccessContract;
    }

    function mint(address to) external onlyOwner {
        uint256 newTokenId = totalSupply() + 1;
        _mint(to, bytes32(newTokenId), true, "0x");
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    function claimWearable(
        bytes memory signature,
        address to
    ) public payable returns (uint256) {
        require(msg.value == claimPrice, "Invalid price sent");
        uint256 userNonce = userNonces[to];
        string memory message = string(
            abi.encodePacked(
                Strings.toHexString(uint160(address(this)), 20),
                ":",
                Strings.toHexString(uint160(to), 20),
                ":",
                Strings.toString(userNonce)
            )
        );

        bytes memory messageHash = bytes(message);

        bytes32 ethHash = MessageHashUtils.toEthSignedMessageHash(messageHash);

        address signer = ECDSA.recover(ethHash, signature);

        require(
            signer ==
                AvatarAccess(avatarAccessContract).getWearableClaimSigner(),
            "Invalid signature"
        );

        userNonces[to]++;

        uint256 newTokenId = totalSupply() + 1;
        _mint(to, bytes32(newTokenId), false, "0x");

        userClaims[to]++;

        emit WearableClaimed(to, newTokenId);

        return newTokenId;
    }

    function transferWearable(
        uint256 tokenId,
        address tokenOwner,
        address to
    ) public {
        bool isApproved = AvatarAccess(avatarAccessContract)
            .isAvatarContractApproved(msg.sender);
        require(isApproved, "Wearable contract not approved");

        require(
            tokenOwnerOf(bytes32(tokenId)) == tokenOwner,
            "Invalid token owner"
        );

        _transfer(tokenOwner, to, bytes32(tokenId), true, "0x");
    }
}
