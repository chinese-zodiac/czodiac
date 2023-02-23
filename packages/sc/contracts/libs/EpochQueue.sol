// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Vittorio Minacori (https://github.com/vittominacori)

pragma solidity ^0.8.0;

//import "hardhat/console.sol";

library EpochQueue {
    uint256 private constant _NULL = 0;
    uint256 private constant _HEAD = 0;

    bool private constant _PREV = false;
    bool private constant _NEXT = true;

    struct List {
        uint256 size;
        mapping(uint256 => uint64) epochs;
        mapping(uint256 => mapping(bool => uint256)) list;
    }

    /**
     * @dev Returns the number of elements in the list
     * @param self stored linked list from contract
     * @return uint256
     */
    function sizeOf(List storage self) internal view returns (uint256) {
        return self.size;
    }

    function getFirstEntry(List storage self) internal view returns (uint256) {
        return self.list[_HEAD][_NEXT];
    }

    function getLastEntry(List storage self) internal view returns (uint256) {
        return self.list[_HEAD][_PREV];
    }

    function getNextEntry(List storage self, uint256 _entryId)
        internal
        view
        returns (uint256)
    {
        return self.list[_entryId][_NEXT];
    }

    /**
     * @dev Inserts an entry to a sorted location in the queue
     * @param self stored linked list from contract
     */
    function insertAtEpoch(
        List storage self,
        uint256 _nodeId,
        uint64 _epoch
    ) internal {
        require(self.epochs[_nodeId] == 0, "EpochQueue: _nodeId exists");
        uint256 next = getSortedSpot(self, _epoch);
        uint256 prev = self.list[next][_PREV];
        _createLink(self, next, _nodeId, _PREV);
        _createLink(self, prev, _nodeId, _NEXT);

        self.epochs[_nodeId] = _epoch;

        self.size++;
    }

    function remove(List storage self, uint256 _nodeId) internal {
        require(self.epochs[_nodeId] != 0, "EpochQueue: _nodeId !exists");
        _createLink(
            self,
            self.list[_nodeId][_PREV],
            self.list[_nodeId][_NEXT],
            _NEXT
        );
        delete self.list[_nodeId][_PREV];
        delete self.list[_nodeId][_NEXT];
        delete self.epochs[_nodeId];

        self.size -= 1;
    }

    /**
     * @dev Pops the first entry from the head of the linked list
     * @param self stored linked list from contract
     * @return uint256 the removed node
     */
    function dequeue(List storage self) internal returns (uint256) {
        uint256 adj = self.list[_HEAD][_NEXT];
        _createLink(self, self.list[adj][_PREV], self.list[adj][_NEXT], _NEXT);
        delete self.list[adj][_PREV];
        delete self.list[adj][_NEXT];
        delete self.epochs[adj];

        self.size -= 1;

        return adj;
    }

    function getSortedSpot(List storage self, uint64 _epoch)
        internal
        view
        returns (uint256 next_)
    {
        if (sizeOf(self) == 0) {
            return 0;
        }

        next_ = getNextEntry(self, 0);
        while ((next_ != 0) && (_epoch > self.epochs[next_])) {
            next_ = self.list[next_][_NEXT];
        }
        return next_;
    }

    function getEpochAtEntry(List storage self, uint256 _entryId)
        internal
        view
        returns (uint64)
    {
        return self.epochs[_entryId];
    }

    /**
     * @dev Creates a bidirectional link between two nodes on direction `_direction`
     * @param self stored linked list from contract
     * @param _node existing node
     * @param _link node to link to in the _direction
     * @param _direction direction to insert node in
     */
    function _createLink(
        List storage self,
        uint256 _node,
        uint256 _link,
        bool _direction
    ) private {
        self.list[_link][!_direction] = _node;
        self.list[_node][_direction] = _link;
    }
}
