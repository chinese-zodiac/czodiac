// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "./ChronoVesting.sol";
import "./CZFarm.sol";

contract LossCompensation is AccessControlEnumerable {
    bytes32 public constant LOSS_MANAGER = keccak256("LOSS_MANAGER");

    CZFarm public czf;
    ChronoVesting public lossPool;
    uint32 vestingPeriod;
    uint32 ffBasis;

    constructor(
        CZFarm _czf,
        uint32 _vestPeriod,
        uint32 _ffBasis
    ) {
        _setupRole(LOSS_MANAGER, _msgSender());
        czf = _czf;
        vestingPeriod = _vestPeriod;
        ffBasis = _ffBasis;

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
        address lossPoolAddress;
        assembly {
            lossPoolAddress := create2(
                0,
                add(bytecode, 32),
                mload(bytecode),
                salt
            )
        }
        lossPool = ChronoVesting(lossPoolAddress);
    }

    function getLossPoolInfo()
        external
        view
        returns (
            uint32 vestPeriod_,
            uint32 ffBasis_,
            uint112 poolEmissionRate_
        )
    {
        vestPeriod_ = vestingPeriod;
        ffBasis_ = ffBasis;
        poolEmissionRate_ = lossPool.totalEmissionRate();
    }

    function getChronoPoolAccountInfo(address _for)
        external
        view
        returns (
            uint256 totalVesting_,
            uint112 emissionRate_,
            uint32 updateEpoch_
        )
    {
        totalVesting_ = lossPool.balanceOf(_for);
        emissionRate_ = lossPool.getAccountEmissionRate(_for);
        updateEpoch_ = lossPool.getAccountUpdateEpoch(_for);
    }

    function addVestList(address[] calldata _fors, uint256[] calldata _wads)
        public
        onlyRole(LOSS_MANAGER)
    {
        require(
            _fors.length == _wads.length,
            "Different amount of fors and wads"
        );
        for (uint256 i; i < _fors.length; i++) {
            addVest(_fors[i], _wads[i]);
        }
    }

    function addVest(address _for, uint256 _wad) public onlyRole(LOSS_MANAGER) {
        lossPool.addVest(_for, uint112(_wad));
    }

    function claim() public {
        claimForTo(msg.sender, uint32(block.timestamp));
    }

    function claimForTo(address _for, uint32 _epoch) public {
        lossPool.claimForTo(_for, _epoch);
    }

    function claimAndFastForward() public {
        claim();
        emergencyFastForward();
    }

    function emergencyFastForward() public {
        lossPool.fastForward(msg.sender);
    }
}
