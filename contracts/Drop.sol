// SPDX-License-Identifier: MIT
import "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/presets/LSP7Mintable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

pragma solidity ^0.8.20;

contract Drop is LSP7Mintable {
    constructor() LSP7Mintable("Platties Tee", "PLT", msg.sender, 1, true) {}

    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount, "0x");
    }
}
