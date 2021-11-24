// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Olympus Dao
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "./ChronoVesting.sol";
import "./CZFarm.sol";

contract ExoticMaster is AccessControlEnumerable {
    using SafeERC20 for IERC20;
    bytes32 public constant EXOTIC_PRICER = keccak256("EXOTIC_PRICER");
    bytes32 public constant EXOTIC_LORD = keccak256("EXOTIC_LORD");

    uint112 public baseEmissionRate;
    uint112 public currentEmissionRate;
    address public treasury;

    CZFarm public czf;
    struct ExoticFarm {
        uint112 czfPerAssetWad;
        uint32 rateBasis;
        IERC20 asset;
        ChronoVesting chronoVesting;
    }
    ExoticFarm[] public exoticFarms;

    constructor(
        CZFarm _czf,
        uint112 _baseEmissionRate,
        address _treasury
    ) {
        _setupRole(EXOTIC_PRICER, _msgSender());
        _setupRole(EXOTIC_LORD, _msgSender());
        czf = _czf;
        baseEmissionRate = _baseEmissionRate;
        treasury = _treasury;
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
            uint112 czfPerAssetWad_,
            IERC20 asset_
        )
    {
        ExoticFarm storage farm = exoticFarms[_pid];
        ChronoVesting vest = farm.chronoVesting;
        adjustedRateBasis_ = getAdjustedRateBasis(farm.rateBasis);
        vestPeriod_ = vest.vestPeriod();
        poolEmissionRate_ = vest.totalEmissionRate();
        czfPerAssetWad_ = farm.czfPerAssetWad;
        asset_ = farm.asset;
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
        uint112 _czfPerAssetWad,
        IERC20 _asset
    ) external onlyRole(EXOTIC_LORD) returns (uint256 pid_) {
        bytes memory bytecode = abi.encodePacked(
            type(ChronoVesting).creationCode,
            abi.encode(address(czf), 0, _vestPeriod)
        );
        bytes32 salt = keccak256(
            abi.encodePacked(
                address(czf),
                uint32(0),
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
        pid_ = exoticFarms.length;
        exoticFarms.push(
            ExoticFarm({
                czfPerAssetWad: _czfPerAssetWad,
                rateBasis: uint32(
                    (uint256(_apr) * uint256(_vestPeriod)) / 365 days
                ),
                asset: _asset,
                chronoVesting: ChronoVesting(chronoVesting)
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

    function setExoticFarmAssetRate(uint256 _pid, uint112 _czfPerAssetWad)
        external
        onlyRole(EXOTIC_PRICER)
    {
        ExoticFarm storage farm = exoticFarms[_pid];
        farm.czfPerAssetWad = _czfPerAssetWad;
    }

    function deposit(uint256 _pid, uint256 _wad) public {
        ExoticFarm storage farm = exoticFarms[_pid];
        farm.asset.transferFrom(msg.sender, treasury, _wad);
        uint256 baseValueWad = _wad * farm.czfPerAssetWad;
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

    function setBaseEmissionRate(uint112 _to) external onlyRole(EXOTIC_LORD) {
        baseEmissionRate = _to;
    }

    function setTreasury(address _to) external onlyRole(EXOTIC_LORD) {
        treasury = _to;
    }
}
