// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./interfaces/ILocation.sol";
import "./interfaces/ILocationController.sol";

//Permisionless EntityStoreERC20
//Deposit/withdraw/transfer tokens that are stored to a particular entity
//deposit/withdraw/transfers are restricted to the entity's current location.
contract EntityStoreERC20 is Ownable, Pausable {
    using EnumerableSet for EnumerableSet.UintSet;
    using SafeERC20 for IERC20;

    mapping(IERC721 => mapping(uint256 => mapping(IERC20 => uint256))) entityStoredERC20Shares;
    //Neccessary for rebasing, tax, liquid staking, or other tokens
    //that may directly modify this contract's balance.
    mapping(IERC20 => uint256) public totalShares;
    //Initial precision for shares per token
    uint256 constant SHARES_PRECISION = 10 ** 8;

    ILocationController public immutable locationController;

    modifier onlyEntitysLocation(IERC721 _entity, uint256 _entityId) {
        require(
            msg.sender ==
                address(
                    locationController.getEntityLocation(_entity, _entityId)
                ),
            "Only entity's location"
        );
        _;
    }

    constructor(ILocationController _locationController) Ownable() {
        locationController = _locationController;
    }

    function deposit(
        IERC721 _entity,
        uint256 _entityId,
        IERC20 _token,
        uint256 _wad
    ) external onlyEntitysLocation(_entity, _entityId) whenNotPaused {
        uint256 expectedShares = convertTokensToShares(_token, _wad);
        uint256 initialTokens = _token.balanceOf(address(this));
        _token.safeTransferFrom(
            address(locationController.getEntityLocation(_entity, _entityId)),
            address(this),
            _wad
        );
        //May be different than _wad due to transfer tax/burn
        uint256 deltaTokens = _token.balanceOf(address(this)) - initialTokens;
        uint256 newShares = (deltaTokens * expectedShares) / _wad;
        entityStoredERC20Shares[_entity][_entityId][_token] += newShares;
        totalShares[_token] += newShares;
    }

    function withdraw(
        IERC721 _entity,
        uint256 _entityId,
        IERC20 _token,
        uint256 _wad
    ) external onlyEntitysLocation(_entity, _entityId) whenNotPaused {
        uint256 shares = convertTokensToShares(_token, _wad);
        entityStoredERC20Shares[_entity][_entityId][_token] -= shares;
        totalShares[_token] -= shares;
        _token.safeTransfer(
            address(locationController.getEntityLocation(_entity, _entityId)),
            _wad
        );
    }

    function transfer(
        IERC721 _fromEntity,
        uint256 _fromEntityId,
        IERC721 _toEntity,
        uint256 _toEntityId,
        IERC20 _token,
        uint256 _wad
    )
        external
        onlyEntitysLocation(_fromEntity, _fromEntityId)
        onlyEntitysLocation(_toEntity, _toEntityId)
        whenNotPaused
    {
        uint256 shares = convertTokensToShares(_token, _wad);
        entityStoredERC20Shares[_fromEntity][_fromEntityId][_token] -= shares;
        entityStoredERC20Shares[_toEntity][_toEntityId][_token] += shares;
    }

    function burn(
        IERC721 _entity,
        uint256 _entityId,
        ERC20Burnable _token,
        uint256 _wad
    ) external onlyEntitysLocation(_entity, _entityId) whenNotPaused {
        uint256 shares = convertTokensToShares(_token, _wad);
        entityStoredERC20Shares[_entity][_entityId][_token] -= shares;
        totalShares[_token] -= shares;
        _token.burn(_wad);
    }

    function convertTokensToShares(
        IERC20 _token,
        uint256 _wad
    ) public view returns (uint256) {
        if (totalShares[_token] == 0) return _wad * SHARES_PRECISION;
        return (_wad * totalShares[_token]) / _token.balanceOf(address(this));
    }

    function getStoredER20WadFor(
        IERC721 _entity,
        uint256 _entityId,
        IERC20 _token
    ) external view returns (uint256) {
        return
            (entityStoredERC20Shares[_entity][_entityId][_token] *
                _token.balanceOf(address(this))) / totalShares[_token];
    }

    function getSharesPerToken(IERC20 _token) external view returns (uint256) {
        if (totalShares[_token] == 0) return SHARES_PRECISION;
        return totalShares[_token] / _token.balanceOf(address(this));
    }

    //Escape hatch for emergency use
    function recoverERC20(address tokenAddress) external onlyOwner {
        IERC20(tokenAddress).safeTransfer(
            _msgSender(),
            IERC20(tokenAddress).balanceOf(address(this))
        );
    }

    //Emergency pause/unpause
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}
