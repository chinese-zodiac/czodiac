// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "./ChronoVesting.sol";
import "./CZFarm.sol";

contract ChronoPoolService is AccessControlEnumerable {
    bytes32 public constant POOL_LORD = keccak256("POOL_LORD");

    uint112 baseEmissionRate;
    uint112 currentEmissionRate;

    CZFarm public czf;
    struct ChronoPool {
        uint32 rateBasis;
        ChronoVesting chronoVesting;
    }
    ChronoPool[] public chronoPools;

    constructor(CZFarm _czf, uint112 _baseEmissionRate) {
        _setupRole(POOL_LORD, _msgSender());
        czf = _czf;
        baseEmissionRate = _baseEmissionRate;
    }

    function getAdjustedRateBasis(uint32 _rateBasis)
        public
        view
        returns (uint32 adjustedRateBasis_)
    {
        if (currentEmissionRate <= baseEmissionRate) return _rateBasis;
        return
            uint32(
                (uint112(_rateBasis) * baseEmissionRate) / currentEmissionRate
            );
    }

    function getChronoPoolInfo(uint256 _pid)
        external
        view
        returns (
            uint32 adjustedRateBasis_,
            uint32 vestPeriod_,
            uint32 ffBasis_,
            uint112 poolEmissionRate_
        )
    {
        ChronoPool storage pool = chronoPools[_pid];
        ChronoVesting vest = pool.chronoVesting;
        adjustedRateBasis_ = getAdjustedRateBasis(chronoPools[_pid].rateBasis);
        vestPeriod_ = vest.vestPeriod();
        ffBasis_ = vest.ffBasis();
        poolEmissionRate_ = vest.totalEmissionRate();
    }

    function getChronoPoolAccountInfo(address _for, uint256 _pid)
        external
        view
        returns (
            uint256 totalVesting_,
            uint112 emissionRate_,
            uint32 updateEpoch_
        )
    {
        ChronoVesting vest = chronoPools[_pid].chronoVesting;
        totalVesting_ = vest.balanceOf(_for);
        emissionRate_ = vest.getAccountEmissionRate(_for);
        updateEpoch_ = vest.getAccountUpdateEpoch(_for);
    }

    function addChronoPool(
        uint32 _ffBasis,
        uint32 _vestPeriod,
        uint32 _apr
    ) external onlyRole(POOL_LORD) returns (uint256 pid_) {
        bytes memory bytecode = abi.encodePacked(
            type(ChronoVesting).creationCode,
            abi.encode(address(czf), _ffBasis, _vestPeriod)
        );
        bytes32 salt = keccak256(
            abi.encodePacked(
                address(czf),
                _ffBasis,
                _vestPeriod,
                block.timestamp
            )
        );
        address chronoVesting;
        assembly {
            chronoVesting := create2(
                0,
                add(bytecode, 32),
                mload(bytecode),
                salt
            )
        }
        pid_ = chronoPools.length;
        chronoPools.push(
            ChronoPool({
                rateBasis: uint32(
                    (uint256(_apr) * 365 days) / uint256(_vestPeriod)
                ),
                chronoVesting: ChronoVesting(chronoVesting)
            })
        );
        czf.grantRole(keccak256("MINTER_ROLE"), chronoVesting);
    }

    function setChronoPool(
        uint256 _pid,
        uint32 _ffBasis,
        uint32 _apr
    ) external onlyRole(POOL_LORD) {
        ChronoPool storage pool = chronoPools[_pid];
        ChronoVesting vest = pool.chronoVesting;
        vest.setFFBasis(_ffBasis);
        pool.rateBasis = uint32(
            (uint256(_apr) * 365 days) / uint256(vest.vestPeriod())
        );
    }

    function deposit(uint256 _pid, uint256 _wad) public {
        uint256 rewardWad = (_wad *
            (10000 + getAdjustedRateBasis(chronoPools[_pid].rateBasis))) /
            10000;
        czf.burnFrom(msg.sender, _wad);
        currentEmissionRate += chronoPools[_pid].chronoVesting.addVest(
            msg.sender,
            uint112(rewardWad)
        );
    }

    function reinvest(uint256 _pid) public {
        uint256 initialBalance = czf.balanceOf(msg.sender);
        claimPool(_pid);
        deposit(_pid, czf.balanceOf(msg.sender) - initialBalance);
    }

    function claimAll() public {
        for (uint256 i; i < chronoPools.length; i++) {
            claimPool(i);
        }
    }

    function claimPool(uint256 _pid) public {
        claimPoolForTo(msg.sender, _pid, uint32(block.timestamp));
    }

    function claimPoolForTo(
        address _for,
        uint256 _pid,
        uint32 _epoch
    ) public {
        currentEmissionRate -= chronoPools[_pid].chronoVesting.claimForTo(
            _for,
            _epoch
        );
    }

    function claimAndFastForwardAll() public {
        claimAll();
        emergencyFastForwardAll();
    }

    function claimAndFastForward(uint256 _pid) public {
        claimPool(_pid);
        emergencyFastForward(_pid);
    }

    function emergencyFastForwardAll() public {
        for (uint256 i; i < chronoPools.length; i++) {
            emergencyFastForward(i);
        }
    }

    function emergencyFastForward(uint256 _pid) public {
        currentEmissionRate -= chronoPools[_pid].chronoVesting.fastForward(
            msg.sender
        );
    }

    function setBaseEmissionRate(uint112 _to) external onlyRole(POOL_LORD) {
        baseEmissionRate = _to;
    }
}
