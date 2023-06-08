// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

import "./OutlawsNft.sol";

contract OutlawsNftSetJsonIpfs is Context, AccessControlEnumerable {
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    OutlawsNft public outlaws =
        OutlawsNft(0x128Bf3854130B8cD23e171041Fc65DeE43a1c194);

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MANAGER_ROLE, _msgSender());
    }

    function setIpfsHash(uint256 _nftId, string calldata _jsonIpfsHash)
        external
        onlyRole(MANAGER_ROLE)
    {
        outlaws.set(
            _nftId,
            outlaws.nftToken(_nftId),
            outlaws.nftGeneration(_nftId),
            _jsonIpfsHash
        );
    }
}
