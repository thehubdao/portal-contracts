// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;
import "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/presets/LSP7Mintable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ClaimableDrop is LSP7Mintable {
    mapping(address => bool) public approvedForClaim;
    mapping(address => bool) public hasClaimed;
    uint256 public constant CLAIM_AMOUNT = 1; // Amount of tokens to claim
    uint256 public claimPrice;

    constructor(string memory name, string memory symbol, uint256 _claimPrice) 
        LSP7Mintable(name, symbol, msg.sender, 1, true)
    {
        claimPrice = _claimPrice;
    }

    function approveClaim(address[] calldata addresses) external onlyOwner {
        for (uint i = 0; i < addresses.length; i++) {
            approvedForClaim[addresses[i]] = true;
        }
    }

    function revokeClaim(address[] calldata addresses) external onlyOwner {
        for (uint i = 0; i < addresses.length; i++) {
            approvedForClaim[addresses[i]] = false;
        }
    }

    function claim() external payable {
        require(approvedForClaim[msg.sender], "Not approved for claim");
        require(!hasClaimed[msg.sender], "Already claimed");
        require(msg.value >= claimPrice, "Insufficient payment");

        hasClaimed[msg.sender] = true;
        _mint(msg.sender, CLAIM_AMOUNT, false, "");
    }

    // Optional: Allow owner to mint additional tokens
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount, false, "");
    }

    // Withdraw function for the contract owner
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
}
