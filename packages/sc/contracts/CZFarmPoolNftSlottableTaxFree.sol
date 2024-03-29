// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Olive.cash, Pancakeswap
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract CZFarmPoolNftSlottableTaxFree is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeERC20 for ERC20Burnable;

    // Whether it is initialized
    bool public isInitialized;

    // Accrued token per share
    uint256 public accTokenPerShare;

    // The timestamp when REWARD mining ends.
    uint256 public timestampEnd;

    // The timestamp when REWARD mining starts.
    uint256 public timestampStart;

    // The timestamp of the last pool update
    uint256 public timestampLast;

    // REWARD tokens created per second.
    uint256 public rewardPerSecond;

    // The precision factor
    uint256 public PRECISION_FACTOR;

    // The reward token
    IERC20 public rewardToken;

    // The staked token
    ERC20Burnable public stakedToken;

    // Whitelist token
    IERC20 public whitelistToken;

    // Whitelist token wad required
    uint256 public whitelistWad;

    //withdraw fee in basis points (0.01%)
    uint256 public withdrawFeeBasis;

    //slot this NFT to remove fees
    IERC721 public slottableNftTaxFree;

    //Nft unlock period
    uint256 public nftLockPeriod;

    // Info of each user that stakes tokens (stakedToken)
    mapping(address => UserInfo) public userInfo;

    struct UserInfo {
        uint256 amount; // How many staked tokens the user has provided
        uint256 rewardDebt; // Reward debt
        mapping(IERC721 => SlottedNft) slottedNfts;
    }

    struct SlottedNft {
        uint256 id;
        uint256 timestamp;
    }

    event AdminTokenRecovery(address tokenRecovered, uint256 amount);
    event Deposit(address indexed user, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 amount);
    event NewStartAndEndTimestamps(
        uint256 timestampStart,
        uint256 timestampEnd
    );
    event NewRewardPerSecond(uint256 rewardPerSecpmd);
    event RewardsStop(uint256 timestamp);
    event Withdraw(address indexed user, uint256 amount);

    modifier onlyWhitelist() {
        if (
            whitelistWad != 0 &&
            whitelistToken != IERC20(address(0x0)) &&
            msg.sender != owner()
        ) {
            require(
                whitelistToken.balanceOf(msg.sender) >= whitelistWad,
                "Not enough whitelist token to deposit"
            );
        }
        _;
    }

    /*
     * @notice Initialize the contract
     * @param _stakedToken: staked token address
     * @param _rewardToken: reward token address
     * @param _rewardPerSecond: reward per second (in rewardToken)
     * @param _timestampStart: start timestamp
     * @param _timestampEnd: end timestamp
     * @param _poolLimitPerUser: pool limit per user in stakedToken (if any, else 0)
     * @param _admin: admin address with ownership
     */
    function initialize(
        ERC20Burnable _stakedToken,
        IERC20 _rewardToken,
        uint256 _rewardPerSecond,
        uint256 _timestampStart,
        uint256 _timestampEnd,
        uint256 _withdrawFeeBasis,
        IERC20 _whitelistToken,
        uint256 _whitelistWad,
        IERC721 _slottableNftTaxFree,
        uint256 _nftLockPeriod,
        address _admin
    ) external {
        require(!isInitialized, "Already initialized");
        isInitialized = true;

        stakedToken = _stakedToken;
        rewardToken = _rewardToken;
        rewardPerSecond = _rewardPerSecond;
        timestampStart = _timestampStart;
        timestampEnd = _timestampEnd;
        withdrawFeeBasis = _withdrawFeeBasis;

        whitelistToken = _whitelistToken;
        whitelistWad = _whitelistWad;

        slottableNftTaxFree = _slottableNftTaxFree;
        nftLockPeriod = _nftLockPeriod;

        PRECISION_FACTOR = uint256(
            10 **
                (uint256(30) -
                    (IERC20Metadata(address(rewardToken)).decimals()))
        );

        // Set the timestampLast as the timestampStart
        timestampLast = timestampStart;

        // Transfer ownership to the admin address who becomes owner of the contract
        transferOwnership(_admin);
    }

    function getSlottedNft(address _account, IERC721 _nftSc)
        external
        view
        returns (uint256 id_, uint256 timestamp_)
    {
        SlottedNft storage slottedNft = userInfo[_account].slottedNfts[_nftSc];
        id_ = slottedNft.id;
        timestamp_ = slottedNft.timestamp;
    }

    function slotNft(IERC721 _nftSc, uint256 _nftId) public nonReentrant {
        SlottedNft storage slottedNft = userInfo[msg.sender].slottedNfts[
            _nftSc
        ];
        require(slottedNft.timestamp == 0, "CZ: NFT already slotted");
        slottedNft.id = _nftId;
        slottedNft.timestamp = block.timestamp;
        _nftSc.transferFrom(msg.sender, address(this), _nftId);
    }

    function unslotNft(IERC721 _nftSc) public nonReentrant {
        SlottedNft storage slottedNft = userInfo[msg.sender].slottedNfts[
            _nftSc
        ];
        require(slottedNft.timestamp != 0, "CZ: No NFT Slotted");
        require(
            block.timestamp > slottedNft.timestamp + nftLockPeriod,
            "CZ: NFT Locked"
        );
        _nftSc.transferFrom(address(this), msg.sender, slottedNft.id);
        delete slottedNft.id;
        delete slottedNft.timestamp;
        delete userInfo[msg.sender].slottedNfts[_nftSc];
    }

    function depositFors(uint256[] calldata _amounts, address[] calldata _fors)
        external
    {
        for (uint256 i; i < _amounts.length; i++) {
            deposit(_amounts[i], _fors[i]);
        }
    }

    function deposit(uint256 _amount) external {
        deposit(_amount, msg.sender);
    }

    /*
     * @notice Deposit staked tokens and collect reward tokens (if any)
     * @param _amount: amount to withdraw (in rewardToken)
     */
    function deposit(uint256 _amount, address _for)
        public
        nonReentrant
        onlyWhitelist
    {
        UserInfo storage user = userInfo[_for];

        _updatePool();

        if (user.amount > 0) {
            uint256 pending = (user.amount * accTokenPerShare) /
                PRECISION_FACTOR -
                user.rewardDebt;
            if (pending > 0) {
                rewardToken.safeTransfer(address(_for), pending);
            }
        }

        if (_amount > 0) {
            user.amount = user.amount + _amount;
            stakedToken.safeTransferFrom(
                address(msg.sender),
                address(this),
                _amount
            );
        }

        user.rewardDebt = (user.amount * accTokenPerShare) / PRECISION_FACTOR;

        emit Deposit(_for, _amount);
    }

    /*
     * @notice Withdraw staked tokens and collect reward tokens
     * @param _amount: amount to withdraw (in rewardToken)
     */
    function withdraw(uint256 _amount) public nonReentrant onlyWhitelist {
        UserInfo storage user = userInfo[msg.sender];
        require(user.amount >= _amount, "Amount to withdraw too high");

        _updatePool();

        uint256 pending = (user.amount * accTokenPerShare) /
            PRECISION_FACTOR -
            user.rewardDebt;

        if (_amount > 0) {
            user.amount = user.amount - _amount;
            //Set withdraw fee to zero if user has a slotted nft active
            uint256 withdrawFee = (user
                .slottedNfts[slottableNftTaxFree]
                .timestamp != 0)
                ? 0
                : ((_amount * withdrawFeeBasis) / 10000);
            if (withdrawFee > 0) stakedToken.burn(withdrawFee);
            stakedToken.safeTransfer(
                address(msg.sender),
                _amount - withdrawFee
            );
        }

        if (pending > 0) {
            rewardToken.safeTransfer(address(msg.sender), pending);
        }

        user.rewardDebt = (user.amount * accTokenPerShare) / PRECISION_FACTOR;

        emit Withdraw(msg.sender, _amount);
    }

    /*
     * @notice Withdraw staked tokens without caring about rewards rewards
     * @dev Needs to be for emergency.
     */
    function emergencyWithdraw() external nonReentrant onlyWhitelist {
        UserInfo storage user = userInfo[msg.sender];
        uint256 amountToTransfer = user.amount;
        user.amount = 0;
        user.rewardDebt = 0;

        if (amountToTransfer > 0) {
            uint256 withdrawFee = (amountToTransfer * withdrawFeeBasis) / 10000;
            if (withdrawFee > 0) stakedToken.burn(withdrawFee);
            stakedToken.safeTransfer(
                address(msg.sender),
                amountToTransfer - withdrawFee
            );
        }

        emit EmergencyWithdraw(msg.sender, user.amount);
    }

    /*
     * @notice Stop rewards
     * @dev Only callable by owner. Needs to be for emergency.
     */
    function emergencyRewardWithdraw(uint256 _amount)
        external
        onlyOwner
        onlyWhitelist
    {
        rewardToken.safeTransfer(address(msg.sender), _amount);
    }

    /**
     * @notice It allows the admin to recover wrong tokens sent to the contract
     * @param _tokenAddress: the address of the token to withdraw
     * @param _tokenAmount: the number of tokens to withdraw
     * @dev This function is only callable by admin.
     */
    function recoverWrongTokens(address _tokenAddress, uint256 _tokenAmount)
        external
        onlyOwner
    {
        require(
            _tokenAddress != address(stakedToken),
            "Cannot be staked token"
        );
        require(
            _tokenAddress != address(rewardToken),
            "Cannot be reward token"
        );

        IERC20(_tokenAddress).safeTransfer(address(msg.sender), _tokenAmount);

        emit AdminTokenRecovery(_tokenAddress, _tokenAmount);
    }

    /*
     * @notice View function to see pending reward on frontend.
     * @param _user: user address
     * @return Pending reward for a given user
     */
    function pendingReward(address _user) external view returns (uint256) {
        UserInfo storage user = userInfo[_user];
        uint256 stakedTokenSupply = stakedToken.balanceOf(address(this));
        if (block.timestamp > timestampLast && stakedTokenSupply != 0) {
            uint256 multiplier = _getMultiplier(timestampLast, block.timestamp);
            uint256 cakeReward = multiplier * rewardPerSecond;
            uint256 adjustedTokenPerShare = accTokenPerShare +
                ((cakeReward * PRECISION_FACTOR) / stakedTokenSupply);
            return
                (user.amount * adjustedTokenPerShare) /
                PRECISION_FACTOR -
                user.rewardDebt;
        } else {
            return
                (user.amount * accTokenPerShare) /
                PRECISION_FACTOR -
                user.rewardDebt;
        }
    }

    /*
     * @notice Update reward variables of the given pool to be up-to-date.
     */
    function _updatePool() internal {
        if (block.timestamp <= timestampLast) {
            return;
        }

        uint256 stakedTokenSupply = stakedToken.balanceOf(address(this));

        if (stakedTokenSupply == 0) {
            timestampLast = block.timestamp;
            return;
        }

        uint256 multiplier = _getMultiplier(timestampLast, block.timestamp);
        uint256 cakeReward = multiplier * rewardPerSecond;
        accTokenPerShare =
            accTokenPerShare +
            ((cakeReward * PRECISION_FACTOR) / stakedTokenSupply);
        timestampLast = block.timestamp;
    }

    /*
     * @notice Return reward multiplier over the given _from to _to timestamp.
     * @param _from: timestamp to start
     * @param _to: timestamp to finish
     */
    function _getMultiplier(uint256 _from, uint256 _to)
        internal
        view
        returns (uint256)
    {
        if (_to <= timestampEnd) {
            return _to - _from;
        } else if (_from >= timestampEnd) {
            return 0;
        } else {
            return timestampEnd - _from;
        }
    }

    function czfarmSetStart(uint256 _timestampStart) public onlyOwner {
        require(block.timestamp < timestampStart, "Pool has started");
        timestampStart = _timestampStart;
        timestampEnd = timestampStart + rewardDuration();
        timestampLast = timestampStart;
    }

    function czfarmSetDuration(uint256 _durationSeconds) public onlyOwner {
        require(block.timestamp < timestampStart, "Pool has started");
        timestampEnd = timestampStart + _durationSeconds;
        czfarmUpdateRewardPerSecond();
    }

    function czfarmSetStartAndDuration(
        uint256 _timestampStart,
        uint256 _durationSeconds
    ) public onlyOwner {
        czfarmSetStart(_timestampStart);
        czfarmSetDuration(_durationSeconds);
    }

    function czfarmUpdateRewardPerSecond() public onlyOwner {
        uint256 rewardBal = rewardToken.balanceOf(address(this));
        rewardPerSecond = rewardBal / rewardDuration();
    }

    function rewardDuration() public view returns (uint256) {
        return timestampEnd - timestampStart;
    }

    function czfarmSetWithdrawFeeBasis(uint256 _withdrawFeeBasis)
        public
        onlyOwner
    {
        withdrawFeeBasis = _withdrawFeeBasis;
    }

    function czfarmSetWhitelistToken(IERC20 _whitelistToken) public onlyOwner {
        whitelistToken = _whitelistToken;
    }

    function czfarmSetWhitelistWad(uint256 _whitelistWad) public onlyOwner {
        whitelistWad = _whitelistWad;
    }

    function czfarmSetSlottableNftTaxFree(IERC721 _slottableNftTaxFree)
        public
        onlyOwner
    {
        slottableNftTaxFree = _slottableNftTaxFree;
    }

    function czfarmSetNftLockPeriod(uint256 _nftLockPeriod) public onlyOwner {
        nftLockPeriod = _nftLockPeriod;
    }
}
