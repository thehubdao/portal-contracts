// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AvatarAccess is Ownable {
    address[] public approvedAvatarContracts;

    address public wearableClaimSigner;
    
    event AvatarContractAdded(address indexed avatarContract);
    event AvatarContractRemoved(address indexed avatarContract);
    
    constructor(address _wearableClaimSigner) Ownable(msg.sender) {
        wearableClaimSigner = _wearableClaimSigner;
    }

    function setWearableClaimSigner(address _wearableClaimSigner) external onlyOwner { //Set the signer for wearable claims
        require(_wearableClaimSigner != address(0), "Invalid signer address");
        wearableClaimSigner = _wearableClaimSigner;
    }

    function getWearableClaimSigner() external view returns (address) { //Get the current signer for wearable claims
        return wearableClaimSigner;
    }

    function addAvatarContract(address avatarContract) external onlyOwner { //Add avatar contract to the contracts list
        require(avatarContract != address(0), "Invalid contract");
        require(!isAvatarContractApproved(avatarContract), "Already approved");
        
        approvedAvatarContracts.push(avatarContract);
        
        emit AvatarContractAdded(avatarContract);
    }
    
    function removeAvatarContract(address avatarContract) external onlyOwner { //Remove avatar contract from the contracts list
        require(isAvatarContractApproved(avatarContract), "Not approved");
        
        for (uint256 i = 0; i < approvedAvatarContracts.length; i++) {
            if (approvedAvatarContracts[i] == avatarContract) {
                approvedAvatarContracts[i] = approvedAvatarContracts[approvedAvatarContracts.length - 1];
                approvedAvatarContracts.pop();
                break;
            }
        }
        
        emit AvatarContractRemoved(avatarContract);
    }
    
    function isAvatarContractApproved(address avatarContract) public view returns (bool) { //Check if the avatar contract is approved
        for (uint256 i = 0; i < approvedAvatarContracts.length; i++) {
            if (approvedAvatarContracts[i] == avatarContract) {
                return true;
            }
        }
        return false;
    }
    
    function getAvatarApprovedContracts() external view returns (address[] memory) { //Get all approved avatar contracts
        return approvedAvatarContracts;
    }
}