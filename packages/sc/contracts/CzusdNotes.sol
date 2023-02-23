// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;
//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "./interfaces/IBlacklist.sol";
import "./libs/EpochQueue.sol";
import "./Cashback_Registry.sol";

contract CzusdNotes is AccessControlEnumerable, ERC721Enumerable {
    using SafeERC20 for IERC20;
    using EpochQueue for EpochQueue.List;

    bytes32 public constant RATER_ROLE = keccak256("RATER_ROLE");

    IERC20 public czusd = IERC20(0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70);

    IBlacklist public blacklistChecker =
        IBlacklist(0x8D82235e48Eeb0c5Deb41988864d14928B485bac);

    struct Account {
        uint64 updateEpoch;
        uint192 yieldPerSecond;
        uint192 totalPrinciple;
        uint192 totalYield;
        EpochQueue.List notesEpochs;
        mapping(uint256 => Note) notes;
    }
    struct Note {
        uint192 yieldPerSecond;
        uint192 principle;
    }
    mapping(address => Account) internal accounts;

    address public treasury = 0x745A676C5c472b50B50e18D4b59e9AeEEc597046;

    uint64 public overnightRateBasis = 450; //4.50% apr for 1 day locks
    uint64 public maximumRateBasis = 1350; //13.50% apr never exceeded
    uint64 public halflife = 365 * 2; //Days to reach halfway between overnightRateBasis and maximumRateBasis (9.0%)

    uint64 public minLock = 1;
    uint64 public maxLock = 3652; //~10 years
    uint192 public minNoteSize = 50 ether;
    uint192 public maxNoteSize = 25000 ether;

    uint192 public outstandingPrinciple;
    uint192 public maxOutstandingPrinciple = 150000 ether;

    uint256 public notesNonce = 0;

    uint64 public cashbackFeeBasis = 1000;
    Cashback_Registry public cashbackRegistry =
        Cashback_Registry(0xe32a6BF04d6Aaf34F3c29af991a6584C5D8faB5C);

    string public baseURI = "";

    constructor() ERC721("CzusdNotes", "CZN") {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(RATER_ROLE, _msgSender());
    }

    function mintNote(
        address _for,
        uint192 _wad,
        uint64 _days
    ) external {
        czusd.safeTransferFrom(_msgSender(), address(this), _wad);
        claimPending(_for, uint64(block.timestamp));
        outstandingPrinciple += _wad;
        require(
            outstandingPrinciple <= maxOutstandingPrinciple,
            "CzusdNotes: Max principle exceeded"
        );
        require(
            _days >= minLock && _days <= maxLock,
            "CzusdNotes: Invalid _days"
        );
        require(
            _wad >= minNoteSize && _wad <= maxNoteSize,
            "CzusdNotes: Invalid _wad"
        );
        Account storage account = accounts[_for];
        uint192 yieldPerSecond = (getYieldAtPeriod(_days) * (_wad / 10000)) /
            365 days;
        account.yieldPerSecond += yieldPerSecond;
        account.totalYield += (yieldPerSecond * _days * 1 days);
        account.totalPrinciple += _wad;
        account.updateEpoch = uint64(block.timestamp);
        notesNonce++;
        accounts[_for].notesEpochs.insertAtEpoch(
            notesNonce,
            uint64(block.timestamp) + _days * 1 days
        );
        accounts[_for].notes[notesNonce] = Note({
            yieldPerSecond: yieldPerSecond,
            principle: _wad
        });
        _safeMint(_for, notesNonce);
    }

    function claimPending(address _for, uint64 _to) public {
        if (_to == 0 || _to > block.timestamp) _to = uint64(block.timestamp);
        Account storage account = accounts[_for];
        (
            uint192 newYieldPerSecond,
            uint192 accYield,
            uint192 accPrinciple
        ) = notesAcc(_for, _to);
        if (accYield == 0 && accPrinciple == 0) {
            account.updateEpoch = uint64(block.timestamp);
            return;
        }
        outstandingPrinciple -= accPrinciple;
        account.totalPrinciple -= accPrinciple;
        account.totalYield -= accYield;
        account.yieldPerSecond = newYieldPerSecond;
        account.updateEpoch = _to;

        uint256 entryId = account.notesEpochs.getFirstEntry();
        uint64 epoch = account.notesEpochs.getEpochAtEntry(entryId);
        while (entryId != 0 && epoch <= _to) {
            delete account.notes[entryId];
            account.notesEpochs.dequeue();
            _burn(entryId);
            entryId = account.notesEpochs.getFirstEntry();
            epoch = account.notesEpochs.getEpochAtEntry(entryId);
        }
        uint256 cashbackFee = (accYield * cashbackFeeBasis) / 10000;
        _transferCzusdWithBlacklistCheck(
            _for,
            accYield - cashbackFee + accPrinciple
        );
        cashbackRegistry.addCzusdToDistribute(_for, cashbackFee);
    }

    function getYieldAtPeriod(uint64 _days)
        public
        view
        returns (uint64 rateBasis_)
    {
        _days = _days - 1;
        return (maximumRateBasis -
            (halflife * (maximumRateBasis - overnightRateBasis)) /
            (_days + halflife));
    }

    function notesAcc(address _forAccount, uint64 _toEpoch)
        public
        view
        returns (
            uint192 newYieldPerSecond_,
            uint192 accYield_,
            uint192 accPrinciple_
        )
    {
        Account storage account = accounts[_forAccount];
        newYieldPerSecond_ = account.yieldPerSecond;
        if (newYieldPerSecond_ == 0 || account.updateEpoch >= _toEpoch)
            return (newYieldPerSecond_, accYield_, accPrinciple_);
        uint256 entryId = account.notesEpochs.getFirstEntry();
        uint64 prevEpoch = account.updateEpoch;
        while (entryId != 0 && prevEpoch < _toEpoch) {
            uint64 newEpoch = account.notesEpochs.getEpochAtEntry(entryId);
            if (newEpoch >= _toEpoch) {
                newEpoch = _toEpoch;
                accYield_ += newYieldPerSecond_ * (newEpoch - prevEpoch);
            } else {
                accPrinciple_ += account.notes[entryId].principle;
                accYield_ += newYieldPerSecond_ * (newEpoch - prevEpoch);
                newYieldPerSecond_ -= account.notes[entryId].yieldPerSecond;
            }
            prevEpoch = newEpoch;
            entryId = account.notesEpochs.getNextEntry(entryId);
        }
        return (newYieldPerSecond_, accYield_, accPrinciple_);
    }

    function getAccount(address _forAccount)
        public
        view
        returns (
            uint64 lastUpdateEpoch_,
            uint192 currYieldPerSecond_,
            uint192 totalYield_,
            uint192 totalPrinciple_,
            uint192 accYield_,
            uint192 accPrinciple_,
            uint256 totalNotes_
        )
    {
        Account storage account = accounts[_forAccount];
        totalNotes_ = account.notesEpochs.sizeOf();
        lastUpdateEpoch_ = account.updateEpoch;
        (currYieldPerSecond_, accYield_, accPrinciple_) = notesAcc(
            _forAccount,
            uint64(block.timestamp)
        );
        totalYield_ = account.totalYield - accYield_;
        totalPrinciple_ = account.totalPrinciple - accPrinciple_;
    }

    function getNotes(
        address _forAccount,
        uint256 _startingEntryId,
        uint256 _count
    )
        public
        view
        returns (
            uint64[] memory epoch_,
            uint192[] memory yieldPerSecond_,
            uint192[] memory principle_,
            uint256[] memory entryIds_
        )
    {
        Account storage account = accounts[_forAccount];
        _startingEntryId = _startingEntryId == 0
            ? account.notesEpochs.getFirstEntry()
            : _startingEntryId;
        uint256 i = 0;
        uint256 entryId = _startingEntryId;
        while (entryId != 0 && i < _count) {
            entryId = account.notesEpochs.getNextEntry(entryId);
            i++;
        }
        _count = i;
        epoch_ = new uint64[](_count);
        yieldPerSecond_ = new uint192[](_count);
        principle_ = new uint192[](_count);
        entryIds_ = new uint256[](_count);
        i = 0;
        entryId = _startingEntryId;
        while (entryId != 0 && i < _count) {
            epoch_[i] = account.notesEpochs.getEpochAtEntry(entryId);
            yieldPerSecond_[i] = account.notes[entryId].yieldPerSecond;
            principle_[i] = account.notes[entryId].principle;
            entryIds_[i] = entryId;
            entryId = account.notesEpochs.getNextEntry(entryId);
            i++;
        }
    }

    function _transferCzusdWithBlacklistCheck(address _for, uint256 _wad)
        internal
    {
        if (!blacklistChecker.isBlacklisted(_for)) {
            czusd.safeTransfer(_for, _wad);
        } else {
            czusd.safeTransfer(treasury, _wad);
        }
    }

    function ADMIN_setTreasury(address _to)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        treasury = _to;
    }

    function ADMIN_setCzusd(IERC20 _to) external onlyRole(DEFAULT_ADMIN_ROLE) {
        czusd = _to;
    }

    function ADMIN_setBlacklist(IBlacklist _blacklistChecker)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        blacklistChecker = _blacklistChecker;
    }

    function ADMIN_setBaseURI(string calldata _to)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        baseURI = _to;
    }

    function RATER_setOvernightRateBasis(uint64 _overnightRateBasis)
        external
        onlyRole(RATER_ROLE)
    {
        overnightRateBasis = _overnightRateBasis;
    }

    function RATER_setMaximumRateBasis(uint64 _maximumRateBasis)
        external
        onlyRole(RATER_ROLE)
    {
        maximumRateBasis = _maximumRateBasis;
    }

    function RATER_setHalflife(uint64 _halflife) external onlyRole(RATER_ROLE) {
        halflife = _halflife;
    }

    function RATER_setMinLock(uint64 _minLock) external onlyRole(RATER_ROLE) {
        minLock = _minLock;
    }

    function RATER_setMaxLock(uint64 _maxLock) external onlyRole(RATER_ROLE) {
        maxLock = _maxLock;
    }

    function RATER_setMinNoteSize(uint192 _minNoteSize)
        external
        onlyRole(RATER_ROLE)
    {
        minNoteSize = _minNoteSize;
    }

    function RATER_setMaxNoteSize(uint192 _maxNoteSize)
        external
        onlyRole(RATER_ROLE)
    {
        maxNoteSize = _maxNoteSize;
    }

    function RATER_setMaxOutstandingPrinciple(uint192 _maxOutstandingPrinciple)
        external
        onlyRole(RATER_ROLE)
    {
        maxOutstandingPrinciple = _maxOutstandingPrinciple;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControlEnumerable, ERC721Enumerable)
        returns (bool)
    {
        return
            ERC721Enumerable.supportsInterface(interfaceId) ||
            AccessControlEnumerable.supportsInterface(interfaceId);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId);
        if (from == address(0) || to == address(0)) {
            //Do nothing when minting or burning
            return;
        }
        claimPending(from, uint64(block.timestamp));
        claimPending(to, uint64(block.timestamp));
        uint64 epoch = accounts[from].notesEpochs.getEpochAtEntry(tokenId);
        uint192 yieldPerSecond = accounts[from].notes[tokenId].yieldPerSecond;
        uint192 principle = accounts[from].notes[tokenId].principle;
        uint192 totalYield = yieldPerSecond * (epoch - uint64(block.timestamp));

        accounts[to].yieldPerSecond += yieldPerSecond;
        accounts[to].totalPrinciple += principle;
        accounts[to].totalYield += totalYield;
        accounts[to].notesEpochs.insertAtEpoch(notesNonce, epoch);
        accounts[to].notes[notesNonce] = accounts[from].notes[tokenId];

        accounts[from].yieldPerSecond -= yieldPerSecond;
        accounts[from].totalPrinciple -= principle;
        accounts[from].totalYield -= totalYield;
        accounts[from].notesEpochs.remove(tokenId);
        delete accounts[from].notes[tokenId];
    }
}
