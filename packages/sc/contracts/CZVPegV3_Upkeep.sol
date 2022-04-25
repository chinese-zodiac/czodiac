// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Thanks to Chainlink for assistance
pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IMetaPool.sol";
import "./CZVPegV3.sol";

contract CZVPegV3_Upkeep is KeeperCompatibleInterface, Ownable {
    IMetaPool public czusd3EpsPool;
    CZVPegV3 public czvPegV3;
    uint256 public smallDelta = 10 ether;
    uint256 public minProfit = 10 ether;

    uint256 public constant goldenRatio = 16180339;
    uint256 public constant precision = 10000000;
    uint256 public maxIter = 50;

    enum PEG_STATUS {
        under,
        over,
        on
    }

    constructor(IMetaPool _czusd3EpsPool, CZVPegV3 _czvPegV3) Ownable() {
        czusd3EpsPool = _czusd3EpsPool;
        czvPegV3 = _czvPegV3;
    }

    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        PEG_STATUS pegStatus = getEllipsisPegStatus();
        uint256 wad = 0;
        int256 profit = 0;
        upkeepNeeded = false;
        if (pegStatus == PEG_STATUS.on) {
            // on peg, dont do anything
        } else if (pegStatus == PEG_STATUS.over) {
            wad = getWad(0, 1);
            profit = getProfit(0, 1, wad);
        } else {
            wad = getWad(1, 0);
            profit = getProfit(0, 1, wad);
        }
        if (profit > int256(smallDelta)) {
            upkeepNeeded = true;
        }
        performData = abi.encode(pegStatus, wad);
    }

    function performUpkeep(bytes calldata performData) external override {
        (PEG_STATUS pegStatus, uint256 wad) = abi.decode(
            performData,
            (PEG_STATUS, uint256)
        );
        require(pegStatus != PEG_STATUS.on, "On peg.");
        bool isOverPeg = pegStatus == PEG_STATUS.over;
        czvPegV3.repegEllipsisOnly(wad, isOverPeg);
    }

    function getEllipsisPegStatus() public view returns (PEG_STATUS pegStatus) {
        uint256 dyOver = czusd3EpsPool.get_dy_underlying(0, 1, smallDelta);
        uint256 dyUnder = czusd3EpsPool.get_dy_underlying(1, 0, smallDelta);
        if (dyOver > smallDelta) return PEG_STATUS.over;
        if (dyUnder > smallDelta) return PEG_STATUS.under;
        return PEG_STATUS.on;
    }

    function getWad(uint256 i, uint256 j) public view returns (uint256 wad_) {
        uint256 dx = smallDelta;
        int256 profit = 0;
        int256 nextProfit = 0;
        //First find order of magnitude
        while (profit <= nextProfit) {
            dx = dx * 10;
            profit = nextProfit;
            nextProfit = getProfit(i, j, dx);
        }
        //Next search by golden ratio
        uint256 a = dx / 10;
        uint256 b = dx;
        uint256 c = b - (((b - a) * precision) / goldenRatio);
        uint256 d = a + (((b - a) * precision) / goldenRatio);
        uint256 iter = 0;
        while (b - a > smallDelta && iter < maxIter) {
            int256 fc = getProfit(i, j, c);
            int256 fd = getProfit(i, j, d);
            if (fc > fd) {
                b = d;
            } else {
                a = c;
            }
            c = b - (((b - a) * precision) / goldenRatio);
            d = a + (((b - a) * precision) / goldenRatio);
            iter++;
        }
        return a;
    }

    function getProfit(
        uint256 i,
        uint256 j,
        uint256 _delta
    ) public view returns (int256 _profit) {
        uint256 dyOver = czusd3EpsPool.get_dy_underlying(
            int128(int256(i)),
            int128(int256(j)),
            _delta
        );
        return (int256(dyOver) - int256(_delta));
    }

    function setMinProfit(uint256 _to) external onlyOwner {
        minProfit = _to;
    }

    function setSmallDelta(uint256 _to) external onlyOwner {
        smallDelta = _to;
    }
}
