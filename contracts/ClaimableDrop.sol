// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;
import "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/presets/LSP7Mintable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ClaimableDrop is LSP7Mintable {
    mapping(address => bool) public approvedForClaim;
    mapping(address => bool) public hasClaimed;
    uint256 public constant CLAIM_AMOUNT = 1; // Amount of tokens to claim
    uint256 public claimPrice;
    uint256 public maxSupply;
    uint256 public totalMinted;

    constructor(
        string memory name,
        string memory symbol,
        uint256 _claimPrice,
        uint256 _maxSupply
    ) LSP7Mintable(name, symbol, msg.sender, 1, true) {
        claimPrice = _claimPrice;
        maxSupply = _maxSupply;
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

    function _checkMaxSupply(uint256 amount) internal view {
        if (maxSupply > 0) {
            require(totalMinted + amount <= maxSupply, "Max supply exceeded");
        }
    }

    function claim() external payable {
        require(approvedForClaim[msg.sender], "Not approved for claim");
        require(!hasClaimed[msg.sender], "Already claimed");
        require(msg.value >= claimPrice, "Insufficient payment");

        _checkMaxSupply(CLAIM_AMOUNT);
        hasClaimed[msg.sender] = true;
        totalMinted += CLAIM_AMOUNT;
        _mint(msg.sender, CLAIM_AMOUNT, false, "");
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _checkMaxSupply(amount);
        totalMinted += amount;
        _mint(to, amount, false, "");
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    function adjustBurn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount, "0x");
    }

    function burn(address from, uint256 amount) public onlyOwner {
        totalMinted -= amount;
        _burn(from, amount, "0x");
    }
}
