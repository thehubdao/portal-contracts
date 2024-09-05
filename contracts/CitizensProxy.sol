// SPDX-License-Identifier: MIT
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
pragma solidity ^0.8.20;

interface IAvatarContract {
    function mint(
        address to,
        bytes memory tokenId,
        bytes calldata data
    ) external;

    function transferOwnership(address newOwner) external;

    function balanceOf(address tokenOwner) external view returns (uint256);

    function totalSupply() external view returns (uint256);

    function setDataForTokenId(
        bytes32 tokenId,
        bytes32 dataKey,
        bytes memory dataValue
    ) external;
}

contract AvatarProxyContract is Ownable {
    mapping(address => bool) public whitelistedAddresses;
    mapping(address => bool) public hasMinted;

    address finalContract = address(0);
    uint256 _currentPhase = 0;

    constructor(address _finalContract) Ownable(msg.sender) {
        finalContract = _finalContract;
    }

    function updateWhitelist(
        address _addressToWhitelist,
        bool whiteListed
    ) public onlyOwner {
        require(
            whitelistedAddresses[_addressToWhitelist] != whiteListed,
            "Whitelist state already set"
        );
        whitelistedAddresses[_addressToWhitelist] = whiteListed;
    }

    function updateWhitelistBulk(
        address[] calldata addressesToWhitelist,
        bool whiteListed
    ) public onlyOwner {
        for (uint256 i = 0; i < addressesToWhitelist.length; i++) {
            whitelistedAddresses[addressesToWhitelist[i]] = whiteListed;
        }
    }

    function isWhitelisted(address _address) public view returns (bool) {
        return whitelistedAddresses[_address];
    }

    function updatePhase(uint phase) public onlyOwner {
        _currentPhase = phase;
    }

    function setFinalContract(address _finalContract) external onlyOwner {
        finalContract = _finalContract;
    }

    function mint(
        bytes calldata data,
        bytes32 dataKey,
        bytes memory dataValue
    ) public {
        address sender = msg.sender;
        bool _hasMinted = hasMinted[sender];

        require(
            IAvatarContract(finalContract).balanceOf(sender) == 0,
            "Address has minted already"
        );
        if (_currentPhase == 0) require(isWhitelisted(sender), "Address not whitelisted");
        require(_hasMinted == false, "Address has already minted");
        
        uint256 supply = IAvatarContract(finalContract).totalSupply();
        bytes memory tokenId = abi.encodePacked(supply);

        IAvatarContract(finalContract).mint(sender, tokenId, data);
        IAvatarContract(finalContract).setDataForTokenId(
            bytes32(tokenId),
            dataKey,
            dataValue
        );
        hasMinted[sender] = true;
    }

    function proxyTransferOwnership(address newOwner) external onlyOwner {
        IAvatarContract(finalContract).transferOwnership(newOwner);
    }

    function setDataForTokenId(
        bytes32 tokenId,
        bytes32 dataKey,
        bytes memory dataValue
    ) external onlyOwner {
        IAvatarContract(finalContract).setDataForTokenId(
            tokenId,
            dataKey,
            dataValue
        );
    }
}
