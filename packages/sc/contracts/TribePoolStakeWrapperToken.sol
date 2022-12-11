// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Wrapper.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./interfaces/IBlacklist.sol";
import "./CZRed.sol";
import "./TribePool.sol";

//import "hardhat/console.sol";

contract TribePoolStakeWrapperToken is
    Context,
    ERC20Wrapper,
    Ownable,
    ReentrancyGuard
{
    using SafeERC20 for IERC20;

    struct SlottedNft {
        uint256 id;
        uint256 timestamp;
    }

    CZRed public czr = CZRed(0x5cd0c2C744caF04cda258Efc6558A3Ed3defE97b);

    TribePool public pool;
    mapping(address => mapping(IERC721 => SlottedNft)) accountSlottedNfts;

    //slot this NFT to remove fees
    IERC721 public slottableNftTaxFree =
        IERC721(0x17B44eBb07a9861A3E566308DE3578a71Bf52906); //1BAD
    //Nft unlock period
    uint256 public nftLockPeriod = 30 days;
    // Whitelist token
    IERC20 public whitelistToken =
        IERC20(0xE95412D2d374B957ca7f8d96ABe6b6c1148fA438);
    // Whitelist token wad required
    uint256 public whitelistWad;
    //withdraw fee in basis points (0.01%)
    uint256 public withdrawFeeBasis;

    address public tribePoolMaster;

    modifier onlyWhitelist() {
        if (
            whitelistWad != 0 &&
            whitelistToken != IERC20(address(0x0)) &&
            msg.sender != owner()
        ) {
            require(
                whitelistToken.balanceOf(msg.sender) >= whitelistWad
            );
        }
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _tribeToken,
        bool _isLrtWhitelist,
        address _owner,
        address _tribePoolMaster
    ) ERC20(_name, _symbol) ERC20Wrapper(IERC20(czr)) Ownable() {
        if (_isLrtWhitelist) {
            setWhitelistWad(50 ether);
            setWithdrawFeeBasis(998);
        } else {
            setWithdrawFeeBasis(1498);
        }
        TribePool newPool = new TribePool();
        newPool.initialize(
            _tribeToken,
            address(this),
            _owner,
            _tribePoolMaster
        );
        setPool(newPool);
        transferOwnership(_owner);
        tribePoolMaster = _tribePoolMaster;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        pool.withdraw(from, amount);
        pool.deposit(to, amount);
    }

    function depositFor(address _account, uint256 _amount)
        public
        override
        onlyWhitelist
        returns (bool)
    {
        super.depositFor(_account, _amount);
        if (IBlacklist(tribePoolMaster).isBlacklisted(_account)) {
            super.withdrawTo(owner(), _amount);
        }
        return true;
    }

    function withdrawTo(address _account, uint256 _amount)
        public
        override
        onlyWhitelist
        returns (bool)
    {
        uint256 withdrawFee = (accountSlottedNfts[msg.sender][
            slottableNftTaxFree
        ].timestamp != 0)
            ? 0
            : ((_amount * withdrawFeeBasis) / 10000);
        if (withdrawFee > 0) {
            _burn(msg.sender, withdrawFee);
            czr.burn(withdrawFee);
        }
        address rewardsreceiver = IBlacklist(tribePoolMaster).isBlacklisted(
            _account
        )
            ? owner()
            : _account;
        super.withdrawTo(rewardsreceiver, _amount - withdrawFee);
        return true;
    }

    function setPool(TribePool _to) public onlyOwner {
        pool = _to;
    }

    function getSlottedNft(address _account, IERC721 _nftSc)
        external
        view
        returns (uint256 id_, uint256 timestamp_)
    {
        SlottedNft storage slottedNft = accountSlottedNfts[_account][_nftSc];
        id_ = slottedNft.id;
        timestamp_ = slottedNft.timestamp;
    }

    function slotNft(IERC721 _nftSc, uint256 _nftId) public nonReentrant {
        SlottedNft storage slottedNft = accountSlottedNfts[msg.sender][_nftSc];
        require(slottedNft.timestamp == 0);
        slottedNft.id = _nftId;
        slottedNft.timestamp = block.timestamp;
        _nftSc.transferFrom(msg.sender, address(this), _nftId);
    }

    function unslotNft(IERC721 _nftSc) public nonReentrant {
        SlottedNft storage slottedNft = accountSlottedNfts[msg.sender][_nftSc];
        require(slottedNft.timestamp != 0);
        require(
            block.timestamp > slottedNft.timestamp + nftLockPeriod);
        _nftSc.transferFrom(address(this), msg.sender, slottedNft.id);
        delete slottedNft.id;
        delete slottedNft.timestamp;
        delete accountSlottedNfts[msg.sender][_nftSc];
    }

    function setWithdrawFeeBasis(uint256 _withdrawFeeBasis) public onlyOwner {
        withdrawFeeBasis = _withdrawFeeBasis;
    }

    function setWhitelistToken(IERC20 _whitelistToken) public onlyOwner {
        whitelistToken = _whitelistToken;
    }

    function setWhitelistWad(uint256 _whitelistWad) public onlyOwner {
        whitelistWad = _whitelistWad;
    }

    function setSlottableNftTaxFree(IERC721 _slottableNftTaxFree)
        public
        onlyOwner
    {
        slottableNftTaxFree = _slottableNftTaxFree;
    }

    function setNftLockPeriod(uint256 _nftLockPeriod) public onlyOwner {
        nftLockPeriod = _nftLockPeriod;
    }

    function recoverWrongTokens(
        address _tokenAddress,
        uint256 _tokenAmount,
        address _to
    ) external onlyOwner {
        require(_tokenAddress != address(underlying));

        IERC20(_tokenAddress).safeTransfer(_to, _tokenAmount);
    }
}
