// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Olympus DAO
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "./libs/Queue.sol";

contract ChronoVesting is AccessControlEnumerable {
    using SafeERC20 for IERC20;
    using Queue for Queue.List;

    bytes32 public constant EMISSION_ROLE = keccak256("EMISSION_ROLE");

    IERC20 public asset;

    uint112 public totalRewardsWad;
    uint112 public totalClaimedWad;
    uint112 public totalEmissionRate;

    uint32 public vestPeriod;
    uint32 public ffBasis;

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

    constructor(
        IERC20 _asset,
        uint32 _ffBasis,
        uint32 _vestPeriod
    ) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(EMISSION_ROLE, _msgSender());
        asset = _asset;
        ffBasis = _ffBasis;
        vestPeriod = _vestPeriod;
    }

    function balanceOf(address _account) external view returns (uint256) {
        return
            accounts[_account].totalRewardsWad -
            accounts[_account].totalClaimedWad;
    }

    function claimForTo(address _account, uint32 _epoch)
        public
        onlyRole(EMISSION_ROLE)
        returns (uint112 deltaEmissionRate_)
    {
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
            if (
                emissionDecrease.epoch < _epoch && emissionDecrease.epoch != 0
            ) {
                //Get wad to claim at old emission rate.
                wadToClaim +=
                    (emissionDecrease.epoch - accountUpdateEpoch) *
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
                totalEmissionRate -= emissionRateDecrease;
                deltaEmissionRate_ += emissionRateDecrease;
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
        if (
            account.emissionRate == 0 &&
            account.totalRewardsWad - account.totalClaimedWad - wadToClaim > 0
        ) {
            //handle dust
            wadToClaim = account.totalRewardsWad - account.totalClaimedWad;
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
        returns (uint112 deltaEmissionRate_)
    {
        claimForTo(_for, uint32(block.timestamp));

        Account storage account = accounts[_for];
        asset.transferFrom(msg.sender, address(this), _wad);

        totalRewardsWad += _wad;
        account.totalRewardsWad += _wad;

        deltaEmissionRate_ = _wad / vestPeriod;

        account.emissionRate += deltaEmissionRate_;
        totalEmissionRate += deltaEmissionRate_;
        account.queuedEmissionDecrease[
            account.emissionDecreaseQueue.enqueue()
        ] = EmissionDelta({
            wadPerSecond: deltaEmissionRate_,
            epoch: uint32(block.timestamp) + vestPeriod
        });
    }

    function fastForward(address _for)
        external
        onlyRole(EMISSION_ROLE)
        returns (uint112 deltaEmissionRate_)
    {
        Account storage account = accounts[_for];
        uint256 rewardsWad = account.totalRewardsWad - account.totalClaimedWad;
        uint256 exitWad = uint256((rewardsWad * ffBasis) / 10000);
        deltaEmissionRate_ = account.emissionRate;
        account.emissionRateCredit += deltaEmissionRate_;
        totalEmissionRate -= deltaEmissionRate_;
        account.emissionRate = 0;
        asset.transfer(_for, exitWad);
        uint112 rewardsWadDelta = uint112(rewardsWad) - uint112(exitWad);
        asset.transfer(msg.sender, uint256(rewardsWadDelta));
        account.totalRewardsWad -= rewardsWadDelta;
        account.totalClaimedWad += uint112(exitWad);
        totalRewardsWad -= rewardsWadDelta;
        totalClaimedWad += uint112(exitWad);
    }

    function setFFBasis(uint32 _to) external onlyRole(EMISSION_ROLE) {
        require(
            _to <= 10000,
            "Cannot set early exit higher than total vesting"
        );
        ffBasis = _to;
    }

    function getAccountEmissionRate(address _for)
        external
        view
        returns (uint112)
    {
        return accounts[_for].emissionRate;
    }

    function getAccountUpdateEpoch(address _for)
        external
        view
        returns (uint32)
    {
        return accounts[_for].updateEpoch;
    }
}
