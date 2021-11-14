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

    struct Account {
        uint112 totalRewardsWad;
        uint112 totalClaimedWad;
        uint32 updateEpoch;
        uint112 emissionRate;
        Queue.List emissionIncreaseQueue;
        Queue.List emissionDecreaseQueue;
        mapping(uint256 => EmissionDelta) queuedEmissionIncrease;
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
            EmissionDelta storage emissionIncrease = account
                .queuedEmissionIncrease[
                    account.emissionIncreaseQueue.getFirstEntry()
                ];
            EmissionDelta storage emissionDecrease = account
                .queuedEmissionIncrease[
                    account.emissionIncreaseQueue.getFirstEntry()
                ];
            bool isIncrease;
            EmissionDelta storage emissionDelta;
            if (emissionIncrease.epoch < emissionDecrease.epoch) {
                isIncrease = true;
                emissionDelta = emissionIncrease;
            } else {
                isIncrease = false;
                emissionDelta = emissionDecrease;
            }
            if (emissionDelta.epoch < _epoch) {
                //Get wad to claim at old emission rate.
                wadToClaim +=
                    (accountUpdateEpoch - emissionDelta.epoch) *
                    account.emissionRate;
                //Change emission rate.
                accountUpdateEpoch = emissionDelta.epoch;
                if (isIncrease) {
                    account.emissionRate += emissionDelta.wadPerSecond;
                    delete account.queuedEmissionIncrease[
                        account.emissionIncreaseQueue.dequeue()
                    ];
                } else {
                    account.emissionRate -= emissionDelta.wadPerSecond;
                    delete account.queuedEmissionDecrease[
                        account.emissionDecreaseQueue.dequeue()
                    ];
                }
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
    }

    function addVest(
        address _for,
        uint112 _wad,
        uint32 _startEpoch,
        uint32 _vestPeriod
    ) public onlyRole(EMISSION_ROLE) {
        Account storage account = accounts[_for];
        asset.transferFrom(msg.sender, address(this), _wad);

        totalRewardsWad += _wad;
        account.totalRewardsWad += _wad;

        uint112 wadPerSecond = _wad / _vestPeriod;

        require(
            account.emissionIncreaseQueue.getLastEntry() <= _startEpoch,
            "ExoticVesting: Cannot enqueue increase epoch before last epoch"
        );
        require(
            account.emissionDecreaseQueue.getLastEntry() <=
                _startEpoch + _vestPeriod,
            "ExoticVesting: Cannot enqueue decrease epoch before last epoch"
        );

        account.queuedEmissionIncrease[
            account.emissionIncreaseQueue.enqueue()
        ] = EmissionDelta({wadPerSecond: wadPerSecond, epoch: _startEpoch});
        account.queuedEmissionDecrease[
            account.emissionDecreaseQueue.enqueue()
        ] = EmissionDelta({
            wadPerSecond: wadPerSecond,
            epoch: _startEpoch + _vestPeriod
        });
    }
}
