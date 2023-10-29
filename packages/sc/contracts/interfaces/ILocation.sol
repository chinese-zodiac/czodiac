// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Pancakeswap
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/interfaces/IERC721.sol";

interface ILocation {
    //Only callable by LOCATION_CONTROLLER
    function LOCATION_CONTROLLER_onArrival(
        IERC721 _entity,
        uint256 _nftId,
        ILocation _from
    ) external;

    //Only callable by LOCATION_CONTROLLER
    function LOCATION_CONTROLLER_onDeparture(
        IERC721 _entity,
        uint256 _nftId,
        ILocation _to
    ) external;

    function viewOnly_getAllValidSources()
        external
        view
        returns (address[] memory locations_);

    function getValidSourceCount() external view returns (uint256);

    function getValidSourceAt(uint256 _i) external view returns (address);

    function viewOnly_getAllValidDestinations()
        external
        view
        returns (address[] memory locations_);

    function getValidDestinationCount() external view returns (uint256);

    function getValidDestinationAt(uint256 _i) external view returns (address);

    function viewOnly_getAllValidEntities()
        external
        view
        returns (address[] memory entities_);

    function getValidEntitiesCount() external view returns (uint256);

    function getValidEntitiesAt(uint256 _i) external view returns (address);
}
