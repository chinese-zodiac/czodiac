// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to minime token
pragma solidity ^0.8.4;

library Checkpoints {
    struct Checkpoint {
        uint128 fromTime;
        uint128 value;
    }

    function getValueAt(Checkpoint[] storage checkpoints, uint256 _time)
        internal
        view
        returns (uint256)
    {
        // This case should be handled by caller
        if (checkpoints.length == 0) return 0;

        // Use the latest checkpoint
        if (_time >= checkpoints[checkpoints.length - 1].fromTime)
            return checkpoints[checkpoints.length - 1].value;

        // Use the oldest checkpoint
        if (_time < checkpoints[0].fromTime) return checkpoints[0].value;

        // Binary search of the value in the array
        uint256 min = 0;
        uint256 max = checkpoints.length - 1;
        while (max > min) {
            uint256 mid = (max + min + 1) / 2;
            if (checkpoints[mid].fromTime <= _time) {
                min = mid;
            } else {
                max = mid - 1;
            }
        }
        return checkpoints[min].value;
    }

    function updateNow(
        Checkpoint[] storage checkpoints,
        uint256 _oldValue,
        uint256 _value
    ) internal {
        require(_value <= ~uint128(0));
        require(_oldValue <= ~uint128(0));

        if (checkpoints.length == 0) {
            Checkpoint storage genesis = checkpoints[checkpoints.length + 1];
            genesis.fromTime = uint128(block.timestamp - 1);
            genesis.value = uint128(_oldValue);
        }

        if (checkpoints[checkpoints.length - 1].fromTime < block.timestamp) {
            Checkpoint storage newCheckPoint = checkpoints[
                checkpoints.length + 1
            ];
            newCheckPoint.fromTime = uint128(block.timestamp);
            newCheckPoint.value = uint128(_value);
        } else {
            Checkpoint storage oldCheckPoint = checkpoints[
                checkpoints.length - 1
            ];
            oldCheckPoint.value = uint128(_value);
        }
    }
}
