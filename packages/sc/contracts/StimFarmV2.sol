// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Olympus DAO
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./CZFarm.sol";

contract StimFarmV2 is Ownable, Pausable {
    using SafeERC20 for IERC20;
    
    IERC20 public asset;
    IERC20 public lp;

    uint112 public debtWad;
    uint32 public constant roundDuration = 1 days;
    uint32 public constant vestDuration = 1 weeks;
    uint32 public constant emissionBasis = 100; //1%

    struct Vest {
        uint112 lpWad;
        uint112 debtWad;
        uint32 roundID;
    }
    mapping(address=>Vest[]) public accounts;
    
    struct Round {
        uint32 startEpoch;
        uint112 lpWad;
        uint112 assetWad;
    }
    Round[] public rounds;

    constructor(IERC20 _asset, IERC20 _lp) {
        asset = _asset;
        lp = _lp;
    }

    function getAssetWadClaimable(address _for, uint256 _vestID) public view returns (uint112 wad_) {
        Vest storage vest = accounts[_for][_vestID];
        Round storage round = rounds[vest.roundID];
        uint112 maxVestWad = (vest.lpWad * round.assetWad / round.lpWad);
        uint32 vestStartEpoch = round.startEpoch + roundDuration;
        uint32 vestEndEpoch = vestStartEpoch + vestDuration;
        if(block.timestamp < vestStartEpoch) return 0;
        if(block.timestamp > vestEndEpoch) return maxVestWad - vest.debtWad;
        return uint112(maxVestWad * (block.timestamp - vestStartEpoch) / vestDuration - vest.debtWad);
    }

    function claim(address _for, uint256 _vestID) external whenNotPaused {
        uint112 wad = getAssetWadClaimable(_for, _vestID);
        asset.transfer(_for,wad);
        debtWad -= wad;
        accounts[_for][_vestID].debtWad += wad;
    }

    function startRound() external whenNotPaused {
        require(
            rounds[rounds.length-1].startEpoch + roundDuration < block.timestamp,
            "StimFarmV2: Previous round not yet complete"
        );
        uint112 assetWad = uint112((asset.balanceOf(address(this)) - debtWad) * emissionBasis / 10000);
        rounds.push(Round({
            startEpoch: uint32(block.timestamp),
            lpWad: 0,
            assetWad: assetWad
        }));
        debtWad += assetWad;
    }

    function deposit(address _for, uint112 _wad) external whenNotPaused {
        lp.transferFrom(msg.sender,address(this), _wad);
        uint roundID = rounds.length-1;
        Round storage round = rounds[roundID];
        require(
            round.startEpoch + roundDuration > block.timestamp,
            "StimFarmV2: Previous round complete"
        );
        Vest[] storage vests = accounts[_for];
        if(vests.length > 0 && vests[vests.length-1].roundID == roundID) {
            vests[vests.length-1].lpWad += _wad;
        } else {
            vests.push(Vest({
                lpWad: _wad,
                debtWad: 0,
                roundID: uint32(roundID)
            }));
        }
    }

    function getRoundCount() external view returns (uint count_) {
        count_ = rounds.length;
    }

    function getVestCount(address _for) external view returns (uint count_) {
        count_ = accounts[_for].length;
    }

    function getRound(uint _roundID) external view returns (uint32 startEpoch_, uint112 lpWad_, uint112 assetWad_) {
        startEpoch_ = rounds[_roundID].startEpoch;
        lpWad_ = rounds[_roundID].lpWad;
        assetWad_ = rounds[_roundID].assetWad;
    }

    function getVest(address _for, uint _vestID) external view returns (uint112 lpWad_, uint112 debtWad_, uint32 roundID_) {
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