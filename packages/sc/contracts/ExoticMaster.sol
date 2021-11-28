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

import "hardhat/console.sol";

contract ExoticMaster is AccessControlEnumerable, Pausable {
    using SafeERC20 for IERC20;
    bytes32 public constant EXOTIC_LORD = keccak256("EXOTIC_LORD");

    address public treasury;
    uint32 public fastForwardLockPeriod;

    CZFarm public czf;

    struct LpEmission {
        uint112 baseEmissionRate;
        uint112 currentEmissionRate;
    }
    mapping(IAmmPair => LpEmission) public lpEmissions;

    struct ExoticFarm {
        uint32 rateBasis;
        IAmmPair lp;
        IPairOracle oracle;
        ChronoVesting chronoVesting;
    }
    ExoticFarm[] public exoticFarms;
    mapping(uint256 => mapping(address => uint32)) farmAccountDepositEpoch;

    constructor(
        CZFarm _czf,
        address _treasury,
        uint32 _fastForwardLockPeriod
    ) {
        _setupRole(EXOTIC_LORD, _msgSender());
        czf = _czf;
        treasury = _treasury;
        fastForwardLockPeriod = _fastForwardLockPeriod;
    }

    function getCzfPerLPWad(IPairOracle oracle, IAmmPair lp)
        public
        view
        returns (uint256 czfPerLPWad_)
    {
        uint256 assetPerCzfWad = oracle.consultTwap(address(czf), 1 ether);
        (uint112 reserve0, uint112 reserve1, ) = lp.getReserves();
        uint256 lpCzfBalBase;
        uint256 lpCzfBalAlt;
        if (lp.token0() == address(czf)) {
            lpCzfBalBase = 2 * uint256(reserve0);
            lpCzfBalAlt = (2 * uint256(reserve1) * 1 ether) / assetPerCzfWad;
        } else {
            lpCzfBalBase = 2 * uint256(reserve1);
            lpCzfBalAlt = (2 * uint256(reserve0) * 1 ether) / assetPerCzfWad;
        }
        czfPerLPWad_ =
            ((lpCzfBalBase <= lpCzfBalAlt ? lpCzfBalBase : lpCzfBalAlt) *
                1 ether) /
            lp.totalSupply();
    }

    function getAdjustedRateBasis(uint32 _rateBasis, IAmmPair _lp)
        public
        view
        returns (uint32 adjustedRateBasis_)
    {
        LpEmission storage lpe = lpEmissions[_lp];
        if (lpe.currentEmissionRate <= lpe.baseEmissionRate) return _rateBasis;
        return
            uint32(
                (uint112(_rateBasis) * lpe.baseEmissionRate) /
                    lpe.currentEmissionRate
            );
    }

    function getExoticFarmInfo(uint256 _pid)
        external
        view
        returns (
            uint32 adjustedRateBasis_,
            uint32 vestPeriod_,
            uint32 ffBasis_,
            uint112 poolEmissionRate_,
            uint112 baseEmissionRate_,
            IAmmPair lp_,
            uint256 czfPerLpWad_
        )
    {
        ExoticFarm storage farm = exoticFarms[_pid];
        ChronoVesting vest = farm.chronoVesting;
        adjustedRateBasis_ = getAdjustedRateBasis(farm.rateBasis, farm.lp);
        vestPeriod_ = vest.vestPeriod();
        ffBasis_ = vest.ffBasis();
        poolEmissionRate_ = vest.totalEmissionRate();
        lp_ = farm.lp;
        baseEmissionRate_ = lpEmissions[lp_].baseEmissionRate;
        czfPerLpWad_ = getCzfPerLPWad(farm.oracle, farm.lp);
    }

    function getExoticFarmAccountInfo(address _for, uint256 _pid)
        external
        view
        returns (
            uint256 totalVesting_,
            uint112 emissionRate_,
            uint32 updateEpoch_,
            uint32 fastForwardLockToEpoch_
        )
    {
        ChronoVesting vest = exoticFarms[_pid].chronoVesting;
        totalVesting_ = vest.balanceOf(_for);
        emissionRate_ = vest.getAccountEmissionRate(_for);
        updateEpoch_ = vest.getAccountUpdateEpoch(_for);
        fastForwardLockToEpoch_ = farmAccountDepositEpoch[_pid][_for] == 0
            ? 0
            : farmAccountDepositEpoch[_pid][_for] + fastForwardLockPeriod;
    }

    function addExoticFarm(
        uint32 _ffBasis,
        uint32 _vestPeriod,
        uint32 _apr,
        IAmmPair _lp
    ) external onlyRole(EXOTIC_LORD) returns (uint256 pid_) {
        require(
            lpEmissions[_lp].baseEmissionRate > 0,
            "ExoticMaster: Base emission rate not set for LP."
        );
        //Deploy chrono vesting
        bytes memory bytecode = abi.encodePacked(
            type(ChronoVesting).creationCode,
            abi.encode(address(czf), _ffBasis, _vestPeriod)
        );
        bytes32 salt = keccak256(
            abi.encodePacked(
                address(_lp),
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
        IPairOracle(oracle).update();
    }

    function setLpBaseEmissionRate(IAmmPair _lp, uint112 _to)
        external
        onlyRole(EXOTIC_LORD)
    {
        lpEmissions[_lp].baseEmissionRate = _to;
    }

    function setExoticFarmApr(
        uint256 _pid,
        uint32 _ffBasis,
        uint32 _apr
    ) external onlyRole(EXOTIC_LORD) {
        ExoticFarm storage farm = exoticFarms[_pid];
        ChronoVesting vest = farm.chronoVesting;
        vest.setFFBasis(_ffBasis);
        farm.rateBasis = uint32(
            ((uint256(_apr) * uint256(vest.vestPeriod())) / 365 days)
        );
    }

    function setFastForwardLockPeriod(uint32 _to)
        external
        onlyRole(EXOTIC_LORD)
    {
        fastForwardLockPeriod = _to;
    }

    function deposit(uint256 _pid, uint256 _wad) public whenNotPaused {
        ExoticFarm storage farm = exoticFarms[_pid];
        farm.lp.transferFrom(msg.sender, treasury, _wad);
        farm.oracle.update();
        uint256 baseValueWad = (_wad * getCzfPerLPWad(farm.oracle, farm.lp)) /
            1 ether;
        uint256 rewardWad = (baseValueWad *
            (10000 +
                getAdjustedRateBasis(exoticFarms[_pid].rateBasis, farm.lp))) /
            10000;
        lpEmissions[farm.lp].currentEmissionRate += exoticFarms[_pid]
            .chronoVesting
            .addVest(msg.sender, uint112(rewardWad));
        farmAccountDepositEpoch[_pid][msg.sender] = uint32(block.timestamp);
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
    ) public whenNotPaused {
        lpEmissions[exoticFarms[_pid].lp].currentEmissionRate -= exoticFarms[
            _pid
        ].chronoVesting.claimForTo(_for, _epoch);
    }

    function claimAndFastForwardAll() public {
        claimAll();
        emergencyFastForwardAll();
    }

    function claimAndFastForward(uint256 _pid) public {
        claimFarm(_pid);
        emergencyFastForward(_pid);
    }

    function emergencyFastForwardAll() public {
        for (uint256 i; i < exoticFarms.length; i++) {
            emergencyFastForward(i);
        }
    }

    function emergencyFastForward(uint256 _pid) public whenNotPaused {
        require(
            farmAccountDepositEpoch[_pid][msg.sender] + fastForwardLockPeriod <
                block.timestamp,
            "ExoticMaster: Fast forward locked"
        );
        lpEmissions[exoticFarms[_pid].lp].currentEmissionRate -= exoticFarms[
            _pid
        ].chronoVesting.fastForward(msg.sender);
    }

    function setTreasury(address _to) external onlyRole(EXOTIC_LORD) {
        treasury = _to;
    }
}
