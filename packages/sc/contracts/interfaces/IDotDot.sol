// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

interface IDotDot {
    struct Amounts {
        uint256 epx;
        uint256 ddd;
    }

    function claim(
        address _receiver,
        address[] calldata _tokens,
        uint256 _maxBondAmount
    ) external;

    function claimable(address _user, address[] calldata _tokens)
        external
        view
        returns (Amounts[] memory);

    function deposit(
        address _user,
        address _token,
        uint256 _amount
    ) external;

    function withdraw(
        address _receiver,
        address _token,
        uint256 _amount
    ) external;

    function claimExtraRewards(address _receiver, address pool) external;

    function userBalances(address _user, address _token)
        external
        view
        returns (uint256);
}
