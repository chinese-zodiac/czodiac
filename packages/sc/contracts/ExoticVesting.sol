// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Olympus DAO
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "./libs/Queue.sol";
import "./CZFarm.sol";

contract ExoticVesting is Ownable, AccessControlEnumerable {
    using SafeERC20 for IERC20;
    using Queue for Queue.List;

    bytes32 public constant EMISSION_ROLE = keccak256("EMISSION_ROLE");

    IERC20 public asset;

    uint112 public totalRewardsWad;
    uint112 public totalClaimedWad;

    uint32 public vestPeriod;

    struct Account {
        uint112 totalRewardsWad;
        uint112 totalClaimedWad;
        uint32 updateEpoch;
        uint112 emissionRate;
        uint112 emissionRateCredit;
        Queue.List emissionDecreaseQueue;
        mapping(uint256 => EmissionDelta) queuedEmissionDecrease;
    }
    struct EmissionDelta {
        uint112 wadPerSecond;
        uint32 epoch;
    }
    mapping(address => Account) internal accounts;

    constructor(IERC20 _asset) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(EMISSION_ROLE, _msgSender());
        asset = _asset;
    }

    //Used to more easily handle dao voting
    //Snapshots are not required since vesting asset cannot be manipulated with flashloans
    function balanceOf(address _account) external view returns (uint256) {
        return
            accounts[_account].totalRewardsWad -
            accounts[_account].totalClaimedWad;
    }

    function claim() external {
        claimForTo(msg.sender, uint32(block.timestamp));
    }

    function claimForTo(address _account, uint32 _epoch) public {
        Account storage account = accounts[_account];
        require(
            _epoch <= block.timestamp,
            "ExoticAuction: Cannot update account past current timestamp"
        );
        uint32 accountUpdateEpoch = account.updateEpoch;
        uint112 wadToClaim = 0;
        while (accountUpdateEpoch < _epoch) {
            EmissionDelta storage emissionDecrease = account
                .queuedEmissionDecrease[
                    account.emissionDecreaseQueue.getFirstEntry()
                ];
            if (emissionDecrease.epoch < _epoch) {
                //Get wad to claim at old emission rate.
                wadToClaim +=
                    (accountUpdateEpoch - emissionDecrease.epoch) *
                    account.emissionRate;
                //Change emission rate.
                accountUpdateEpoch = emissionDecrease.epoch;
                uint112 emissionRateDecrease = emissionDecrease.wadPerSecond;
                if (account.emissionRateCredit > 0) {
                    //Handle emission rate credit (credits are issued when users exit vesting)
                    if (emissionRateDecrease <= account.emissionRateCredit) {
                        account.emissionRateCredit -= emissionRateDecrease;
                        emissionRateDecrease = 0;
                    } else {
                        emissionRateDecrease -= account.emissionRateCredit;
                        account.emissionRateCredit = 0;
                    }
                }
                account.emissionRate -= emissionRateDecrease;
                delete account.queuedEmissionDecrease[
                    account.emissionDecreaseQueue.dequeue()
                ];
            } else {
                wadToClaim +=
                    (_epoch - accountUpdateEpoch) *
                    account.emissionRate;
                accountUpdateEpoch = _epoch;
            }
        }
        account.totalClaimedWad += wadToClaim;
        account.updateEpoch = accountUpdateEpoch;
        totalClaimedWad += wadToClaim;
        asset.transfer(_account, wadToClaim);
        require(
            account.totalClaimedWad <= account.totalRewardsWad,
            "ExoticVesting: Can never claim more rewards than granted"
        );
    }

    function addVest(address _for, uint112 _wad)
        public
        onlyRole(EMISSION_ROLE)
    {
        Account storage account = accounts[_for];
        asset.transferFrom(msg.sender, address(this), _wad);

        totalRewardsWad += _wad;
        account.totalRewardsWad += _wad;

        uint112 wadPerSecond = _wad / vestPeriod;

        account.emissionRate += wadPerSecond;
        account.queuedEmissionDecrease[
            account.emissionDecreaseQueue.enqueue()
        ] = EmissionDelta({
            wadPerSecond: wadPerSecond,
            epoch: uint32(block.timestamp) + vestPeriod
        });
    }
}
