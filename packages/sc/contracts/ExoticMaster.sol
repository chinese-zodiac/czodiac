// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Olympus Dao
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./ammswap/PairOracle.sol";
import "./ChronoVesting.sol";
import "./CZFarm.sol";

contract ExoticMaster is AccessControlEnumerable, Pausable {
    using SafeERC20 for IERC20;
    bytes32 public constant EXOTIC_LORD = keccak256("EXOTIC_LORD");

    uint112 public baseEmissionRate;
    uint112 public currentEmissionRate;
    address public treasury;

    CZFarm public czf;
    struct ExoticFarm {
        uint32 rateBasis;
        IAmmPair lp;
        IPairOracle oracle;
        ChronoVesting chronoVesting;
    }
    ExoticFarm[] public exoticFarms;

    constructor(
        CZFarm _czf,
        uint112 _baseEmissionRate,
        address _treasury
    ) {
        _setupRole(EXOTIC_LORD, _msgSender());
        czf = _czf;
        baseEmissionRate = _baseEmissionRate;
        treasury = _treasury;
    }

    function getCzfPerLPWad(IPairOracle oracle, IAmmPair lp)
        public
        returns (uint256 czfPerLPWad_)
    {
        oracle.update();
        uint256 assetPerCzfWad = oracle.consultTwap(address(czf), 1 ether);
        (uint112 reserve0, uint112 reserve1, ) = lp.getReserves();
        uint256 lpCzfBalBase;
        uint256 lpCzfBalAlt;
        if (lp.token0() == address(czf)) {
            lpCzfBalBase = reserve0;
            lpCzfBalAlt = assetPerCzfWad / reserve1;
        } else {
            lpCzfBalBase = reserve1;
            lpCzfBalAlt = assetPerCzfWad / reserve0;
        }
        czfPerLPWad_ =
            ((lpCzfBalBase <= lpCzfBalAlt ? lpCzfBalBase : lpCzfBalAlt) *
                1 ether) /
            lp.totalSupply();
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

    function getExoticFarmInfo(uint256 _pid)
        external
        view
        returns (
            uint32 adjustedRateBasis_,
            uint32 vestPeriod_,
            uint112 poolEmissionRate_,
            IAmmPair lp_
        )
    {
        ExoticFarm storage farm = exoticFarms[_pid];
        ChronoVesting vest = farm.chronoVesting;
        adjustedRateBasis_ = getAdjustedRateBasis(farm.rateBasis);
        vestPeriod_ = vest.vestPeriod();
        poolEmissionRate_ = vest.totalEmissionRate();
        lp_ = farm.lp;
    }

    function getExoticFarmAccountInfo(address _for, uint256 _pid)
        external
        view
        returns (
            uint256 totalVesting_,
            uint112 emissionRate_,
            uint32 updateEpoch_
        )
    {
        ChronoVesting vest = exoticFarms[_pid].chronoVesting;
        totalVesting_ = vest.balanceOf(_for);
        emissionRate_ = vest.getAccountEmissionRate(_for);
        updateEpoch_ = vest.getAccountUpdateEpoch(_for);
    }

    function addExoticFarm(
        uint32 _vestPeriod,
        uint32 _apr,
        IAmmPair _lp
    ) external onlyRole(EXOTIC_LORD) returns (uint256 pid_) {
        //Deploy chrono vesting
        bytes memory bytecode = abi.encodePacked(
            type(ChronoVesting).creationCode,
            abi.encode(address(czf), uint32(0), _vestPeriod)
        );
        bytes32 salt = keccak256(
            abi.encodePacked(address(_lp), _vestPeriod, block.timestamp)
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
        //deploy oracle
        bytes memory bytecodeOracle = abi.encodePacked(
            type(PairOracle).creationCode,
            abi.encode(address(_lp))
        );
        address oracle;
        assembly {
            oracle := create2(
                0,
                add(bytecodeOracle, 32),
                mload(bytecodeOracle),
                salt
            )
        }

        pid_ = exoticFarms.length;
        exoticFarms.push(
            ExoticFarm({
                rateBasis: uint32(
                    (uint256(_apr) * uint256(_vestPeriod)) / 365 days
                ),
                lp: _lp,
                chronoVesting: ChronoVesting(chronoVesting),
                oracle: IPairOracle(oracle)
            })
        );
        czf.grantRole(keccak256("MINTER_ROLE"), chronoVesting);
    }

    function setExoticFarmApr(uint256 _pid, uint32 _apr)
        external
        onlyRole(EXOTIC_LORD)
    {
        ExoticFarm storage farm = exoticFarms[_pid];
        ChronoVesting vest = farm.chronoVesting;
        farm.rateBasis = uint32(
            ((uint256(_apr) * uint256(vest.vestPeriod())) / 365 days)
        );
    }

    function deposit(uint256 _pid, uint256 _wad) public whenNotPaused {
        ExoticFarm storage farm = exoticFarms[_pid];
        farm.lp.transferFrom(msg.sender, treasury, _wad);
        uint256 baseValueWad = (_wad * getCzfPerLPWad(farm.oracle, farm.lp)) /
            1 ether;
        uint256 rewardWad = (baseValueWad *
            (10000 + getAdjustedRateBasis(exoticFarms[_pid].rateBasis))) /
            10000;
        currentEmissionRate += exoticFarms[_pid].chronoVesting.addVest(
            msg.sender,
            uint112(rewardWad)
        );
    }

    function claimAll() public {
        for (uint256 i; i < exoticFarms.length; i++) {
            claimFarm(i);
        }
    }

    function claimFarm(uint256 _pid) public {
        claimFarmForTo(msg.sender, _pid, uint32(block.timestamp));
    }

    function claimFarmForTo(
        address _for,
        uint256 _pid,
        uint32 _epoch
    ) public {
        currentEmissionRate -= exoticFarms[_pid].chronoVesting.claimForTo(
            _for,
            _epoch
        );
    }

    //TODO: Readd fastforwad, but with 1 day timelock from last deposit

    function setBaseEmissionRate(uint112 _to) external onlyRole(EXOTIC_LORD) {
        baseEmissionRate = _to;
    }

    function setTreasury(address _to) external onlyRole(EXOTIC_LORD) {
        treasury = _to;
    }
}
