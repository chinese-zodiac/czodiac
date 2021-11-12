// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Vittorio Minacori (https://github.com/vittominacori)

pragma solidity ^0.8.0;

library Queue {
    uint256 private constant _NULL = 0;
    uint256 private constant _HEAD = 0;

    bool private constant _PREV = false;
    bool private constant _NEXT = true;

    struct List {
        uint256 size;
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

    /**
     * @dev Pushes an entry to the tail of the linked list
     * @param self stored linked list from contract
     * @return uint256 newly queued node
     */
    function enqueue(List storage self) internal returns (uint256) {
        uint256 c = self.list[_HEAD][_PREV];
        uint256 node = c + 1;
        _createLink(self, _HEAD, node, _PREV);
        _createLink(self, node, c, _PREV);

        self.size += 1;

        return node;
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

        self.size -= 1;

        return adj;
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
