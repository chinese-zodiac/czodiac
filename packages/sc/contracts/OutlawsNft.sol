// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @dev {ERC721} token, including:
 *
 *  - ability for holders to burn (destroy) their tokens
 *  - a minter role that allows for token minting (creation)
 *  - a pauser role that allows to stop all token transfers
 *  - token ID and URI autogeneration
 *
 * This contract uses {AccessControl} to lock permissioned functions using the
 * different roles - head to its documentation for details.
 *
 * The account that deploys the contract will be granted the minter and pauser
 * roles, as well as the default admin role, which will let it grant both minter
 * and pauser roles to other accounts.
 */
contract OutlawsNft is
    Context,
    AccessControlEnumerable,
    ERC721Enumerable,
    ERC721Burnable
{
    using Counters for Counters.Counter;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    Counters.Counter private _tokenIdTracker;

    enum TOKEN {
        BOTTLE, //0
        CASINO, //1
        GUN, //2
        HORSE, //3
        SALOON //4
    }

    mapping(uint256 => string) public jsonIpfsHash;
    mapping(uint256 => TOKEN) public nftToken;
    mapping(uint256 => uint32) public nftGeneration;

    /**
     * @dev Grants `DEFAULT_ADMIN_ROLE`, `MANAGER_ROLE` to the
     * account that deploys the contract.
     *
     * Token URIs will be autogenerated based on `baseURI` and their token IDs.
     * See {ERC721-tokenURI}.
     */
    constructor() ERC721("OutlawsNft", "0LAW") {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MANAGER_ROLE, _msgSender());
    }

    /**
     * @dev Creates a new token for `to`. Its token ID will be automatically
     * assigned (and available on the emitted {IERC721-Transfer} event), and the token
     * URI autogenerated based on the base URI passed at construction.
     *
     * See {ERC721-_mint}.
     *
     * Requirements:
     *
     * - the caller must have the `MINTER_ROLE`.
     */
    function mint(address _to) public {
        require(
            hasRole(MANAGER_ROLE, _msgSender()),
            "JNT: must have manager role to mint"
        );

        // We cannot just use balanceOf to create the new tokenId because tokens
        // can be burned (destroyed), so we need a separate counter.
        uint256 newTokenId = _tokenIdTracker.current();
        _mint(_to, newTokenId);
        _tokenIdTracker.increment();
    }

    function set(
        uint256 _nftId,
        TOKEN _token,
        uint32 _gen,
        string calldata _jsonIpfsHash
    ) public {
        require(
            hasRole(MANAGER_ROLE, _msgSender()),
            "JNT: must have manager role to mint"
        );
        nftToken[_nftId] = _token;
        nftGeneration[_nftId] = _gen;
        jsonIpfsHash[_nftId] = _jsonIpfsHash;
    } 

    function setMulti(
        uint256[] calldata _nftId,
        TOKEN[] calldata _token,
        uint32[] calldata _gen,
        string[] calldata _jsonIpfsHash
    ) public {
        require(
            hasRole(MANAGER_ROLE, _msgSender()),
            "JNT: must have manager role to mint"
        );
        for (uint256 i = 0; i < _nftId.length; i++) {
            nftToken[_nftId[i]] = _token[i];
            nftGeneration[_nftId[i]] = _gen[i];
            jsonIpfsHash[_nftId[i]] = _jsonIpfsHash[i];
        }
    }

    function consecutiveBatchTransfer(
        address to,
        uint256 tokenIdStart,
        uint256 tokenIdEnd
    ) public {
        for (uint256 i = tokenIdStart; i < tokenIdEnd; i++) {
            require(
                _isApprovedOrOwner(_msgSender(), i),
                "JNT: batch transfer caller is not owner nor approved"
            );
            _transfer(_msgSender(), to, i);
        }
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(_exists(tokenId), "JNT: URI query for nonexistent token");

        return string(abi.encodePacked("ipfs://", jsonIpfsHash[tokenId]));
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlEnumerable, ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
