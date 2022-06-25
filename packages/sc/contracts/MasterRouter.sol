// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// The master router handles routing cliams for master contracts such as farm master, chrono service, exotic master.
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./ChronoPoolService.sol";
import "./ExoticMaster.sol";
import "./CZFarmMasterRoutable.sol";

contract MasterRouter {
    using SafeERC20 for IERC20;

    function claimAll(
        ChronoPoolService _chronoPoolService,
        uint256[] calldata _chronoPids,
        ExoticMaster _exoticMaster,
        uint256[] calldata _exoticPids,
        CZFarmMasterRoutable _czFarmMasterRoutable,
        uint256[] calldata _czFarmPids
    ) external {
        claimChronos(_chronoPoolService, _chronoPids, msg.sender);
        claimExotics(_exoticMaster, _exoticPids, msg.sender);
        claimV2Farms(_czFarmMasterRoutable, _czFarmPids, msg.sender);
    }

    function claimChronos(
        ChronoPoolService _chronoPoolService,
        uint256[] calldata _pids,
        address _for
    ) public {
        _claimChronos(_chronoPoolService, _pids, _for);
    }

    function claimExotics(
        ExoticMaster _exoticMaster,
        uint256[] calldata _pids,
        address _for
    ) public {
        _claimExotics(_exoticMaster, _pids, _for);
    }

    function claimV2Farms(
        CZFarmMasterRoutable _czFarmMasterRoutable,
        uint256[] calldata _pids,
        address _for
    ) public {
        _claimV2Farms(_czFarmMasterRoutable, _pids, _for);
    }

    function _claimChronos(
        ChronoPoolService _chronoPoolService,
        uint256[] calldata _pids,
        address _for
    ) internal {
        for (uint256 i; i < _pids.length; i++) {
            _chronoPoolService.claimPoolForTo(
                _for,
                _pids[i],
                uint32(block.timestamp)
            );
        }
    }

    function _claimExotics(
        ExoticMaster _exoticMaster,
        uint256[] calldata _pids,
        address _for
    ) internal {
        for (uint256 i; i < _pids.length; i++) {
            _exoticMaster.claimFarmForTo(
                _for,
                _pids[i],
                uint32(block.timestamp)
            );
        }
    }

    function _claimV2Farms(
        CZFarmMasterRoutable _czFarmMasterRoutable,
        uint256[] calldata _pids,
        address _for
    ) internal {
        for (uint256 i; i < _pids.length; i++) {
            _czFarmMasterRoutable.claimRoutabale(_for, _pids[i]);
        }
    }
}
