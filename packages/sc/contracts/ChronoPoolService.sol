// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "./ChronoVesting.sol";
import "./CZFarm.sol";

contract ChronoPoolService is AccessControlEnumerable {
    bytes32 public constant POOL_LORD = keccak256("POOL_LORD");

    uint256 baseEmissionRate;
    uint256 currentEmissionRate;

    CZFarm public czf;
    struct ChronoPool {
        uint32 rateBasis;
        ChronoVesting chronoVesting;
    }
    ChronoPool[] public chronoPools;

    constructor(CZFarm _czf, uint256 _baseEmissionRate) {
        _setupRole(POOL_LORD, _msgSender());
        czf = _czf;
        baseEmissionRate = _baseEmissionRate;
    }

    function getAdjustedRateBasis(uint32 _rateBasis)
        public
        view
        returns (uint32 adjustedRateBasis_)
    {
        if (currentEmissionRate < baseEmissionRate) return _rateBasis;
        return
            uint32(
                (uint256(_rateBasis) * baseEmissionRate) / currentEmissionRate
            );
    }

    function addChronoPool(
        IERC20 _asset,
        uint32 _ffBasis,
        uint32 _vestPeriod,
        uint32 _apr
    ) external onlyRole(POOL_LORD) returns (uint256 pid_) {
        bytes memory bytecode = type(ChronoVesting).creationCode;
        bytes32 salt = keccak256(
            abi.encodePacked(_asset, _ffBasis, _vestPeriod)
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
                rateBasis: ((_apr * 365 days) / _vestPeriod),
                chronoVesting: ChronoVesting(chronoVesting)
            })
        );
        czf.approve(chronoVesting, ~uint256(0));
    }

    function setChronoPool(
        uint256 _pid,
        uint32 _ffBasis,
        uint32 _apr
    ) external onlyRole(POOL_LORD) {
        ChronoPool storage pool = chronoPools[_pid];
        ChronoVesting vest = pool.chronoVesting;
        uint32 vestPeriod = vest.vestPeriod();
        vest.setFFBasis(_ffBasis);
        pool.rateBasis = ((_apr * 365 days) / vestPeriod);
    }

    function setBaseEmissionRate(uint256 _to) external onlyRole(POOL_LORD) {
        baseEmissionRate = _to;
    }

    function deposit(uint256 _pid, uint256 _wad) public {
        uint256 rewardWad = _wad *
            (10000 + getAdjustedRateBasis(chronoPools[_pid].rateBasis));
        czf.burnFrom(msg.sender, _wad);
        czf.mint(address(this), rewardWad);
        chronoPools[_pid].chronoVesting.addVest(msg.sender, uint112(rewardWad));
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
        chronoPools[_pid].chronoVesting.claimForTo(_for, _epoch);
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
        chronoPools[_pid].chronoVesting.fastForward(msg.sender);
        czf.burn(czf.balanceOf(address(this)));
    }
}
