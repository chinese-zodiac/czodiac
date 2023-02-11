// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "./Cashback_Registry.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Cashback_Registry_Referral_Levels is Ownable {
    Cashback_Registry CBR =
        Cashback_Registry(0xe32a6BF04d6Aaf34F3c29af991a6584C5D8faB5C);

    constructor() Ownable() {}

    function getSignerReferredAccountLevels(
        address _signer,
        uint256 _start,
        uint256 _count
    )
        external
        view
        returns (
            uint64[] memory accountIds,
            Cashback_Registry.LEVEL[] memory levels
        )
    {
        uint64 signerAccountId = CBR.signerToAccountId(_signer);
        accountIds = CBR.getAccountReferrals(signerAccountId, _start, _count);
        for (uint256 i = 0; i < _count; i++) {
            (Cashback_Registry.LEVEL level, , , , , , , ) = CBR.getSignerInfo(
                _signer
            );
            levels[i] = level;
        }
    }

    function setCbr(Cashback_Registry _to) external onlyOwner {
        CBR = _to;
    }
}
