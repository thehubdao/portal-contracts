// SPDX-License-Identifier: MIT
import "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";
pragma solidity ^0.8.20;

contract LuksoCitizens is LSP8IdentifiableDigitalAsset {
    
    uint16 public constant MAX_SUPPLY = 1764; 

    constructor() LSP8IdentifiableDigitalAsset("Lukso Citizens", "LYXCTZNS", msg.sender,1,0) {}

    function mint(
        address to,
        bytes memory tokenId,
        bytes calldata data
    ) public onlyOwner {
        require(totalSupply() <= MAX_SUPPLY, "MAX SUPPLY REACHED");
        _mint(to, bytes32(tokenId), true, data);
    }
}
