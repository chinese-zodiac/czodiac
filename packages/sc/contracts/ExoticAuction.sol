// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Olympus DAO
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IExoticMaster.sol";
import "./CZFarm.sol";

contract ExoticAuction is Ownable {
    using SafeERC20 for IERC20;

    IExoticMaster public exoticMaster;
    IERC20 public asset;
    IERC20 public lp;

    struct Vest {
        uint112 lpWad;
        uint112 debtWad;
        uint32 roundID;
    }
    mapping(address => Vest[]) public accounts;

    struct Round {
        uint32 startEpoch;
        uint112 lpWad;
        uint112 assetWad;
    }
    Round[] public rounds;

    constructor(
        IExoticMaster _exoticMaster,
        IERC20 _asset,
        IERC20 _lp
    ) {
        exoticMaster = _exoticMaster;
        asset = _asset;
        lp = _lp;
    }

    function getAssetWadClaimable(address _for, uint256 _vestID)
        public
        view
        returns (uint112 wad_)
    {
        Vest storage vest = accounts[_for][_vestID];
        Round storage round = rounds[vest.roundID];
        uint112 maxVestWad = ((vest.lpWad * round.assetWad) / round.lpWad);
        uint32 vestStartEpoch = round.startEpoch + exoticMaster.roundDuration();
        uint32 vestEndEpoch = vestStartEpoch + exoticMaster.vestDuration();
        if (block.timestamp < vestStartEpoch) return 0;
        if (block.timestamp > vestEndEpoch) return maxVestWad - vest.debtWad;
        return
            uint112(
                (maxVestWad * (block.timestamp - vestStartEpoch)) /
                    exoticMaster.vestDuration() -
                    vest.debtWad
            );
    }

    function claim(address _for, uint256 _vestID) external {
        uint112 wad = getAssetWadClaimable(_for, _vestID);
        asset.transfer(_for, wad);
        accounts[_for][_vestID].debtWad += wad;
    }

    function startRound(uint112 _assetWad) external {
        require(
            msg.sender == address(exoticMaster),
            "ExoticAuction: Sender must be exotic master."
        );
        require(
            rounds[rounds.length - 1].startEpoch +
                exoticMaster.roundDuration() <
                block.timestamp,
            "ExoticAuction: Previous round not yet complete"
        );
        asset.transferFrom(address(exoticMaster), address(this), _assetWad);
        rounds.push(
            Round({
                startEpoch: uint32(block.timestamp),
                lpWad: 0,
                assetWad: _assetWad
            })
        );
    }

    function deposit(address _for, uint112 _wad) external {
        lp.transferFrom(msg.sender, address(this), _wad);
        uint256 roundID = rounds.length - 1;
        Round storage round = rounds[roundID];
        require(
            round.startEpoch + exoticMaster.roundDuration() > block.timestamp,
            "ExoticAuction: Previous round complete"
        );
        Vest[] storage vests = accounts[_for];
        if (vests.length > 0 && vests[vests.length - 1].roundID == roundID) {
            vests[vests.length - 1].lpWad += _wad;
        } else {
            vests.push(
                Vest({lpWad: _wad, debtWad: 0, roundID: uint32(roundID)})
            );
        }
    }

    function getRoundCount() external view returns (uint256 count_) {
        count_ = rounds.length;
    }

    function getVestCount(address _for) external view returns (uint256 count_) {
        count_ = accounts[_for].length;
    }

    function getRound(uint256 _roundID)
        external
        view
        returns (
            uint32 startEpoch_,
            uint112 lpWad_,
            uint112 assetWad_
        )
    {
        startEpoch_ = rounds[_roundID].startEpoch;
        lpWad_ = rounds[_roundID].lpWad;
        assetWad_ = rounds[_roundID].assetWad;
    }

    function getVest(address _for, uint256 _vestID)
        external
        view
        returns (
            uint112 lpWad_,
            uint112 debtWad_,
            uint32 roundID_
        )
    {
        Vest storage vest = accounts[_for][_vestID];
        lpWad_ = vest.lpWad;
        debtWad_ = vest.debtWad;
        roundID_ = vest.roundID;
    }

    function recoverERC20(address tokenAddress) external onlyOwner {
        IERC20(tokenAddress).safeTransfer(
            _msgSender(),
            IERC20(tokenAddress).balanceOf(address(this))
        );
    }
}
