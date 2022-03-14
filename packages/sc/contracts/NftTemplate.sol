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
contract JsonNftTemplate is Context, AccessControlEnumerable, ERC721Enumerable, ERC721Burnable {
    using Counters for Counters.Counter;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    Counters.Counter private _tokenIdTracker;

    mapping(uint256=>string) public jsonIpfsHash;
    mapping(uint256=>string) public serial;

    /**
     * @dev Grants `DEFAULT_ADMIN_ROLE`, `MANAGER_ROLE` to the
     * account that deploys the contract.
     *
     * Token URIs will be autogenerated based on `baseURI` and their token IDs.
     * See {ERC721-tokenURI}.
     */
    constructor() ERC721("JsonNftTemplate", "JNT") {
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
    function add(string calldata _jsonIpfsHash, string calldata _serial) public {
        require(hasRole(MANAGER_ROLE, _msgSender()), "JNT: must have manager role to mint");

        // We cannot just use balanceOf to create the new tokenId because tokens
        // can be burned (destroyed), so we need a separate counter.
        uint256 newTokenId = _tokenIdTracker.current();
        _mint(_msgSender(), newTokenId);
        set(newTokenId,_jsonIpfsHash,_serial);
        _tokenIdTracker.increment();
    }

    function set(uint256 _tokenId, string calldata _jsonIpfsHash, string calldata _serial) public {
        require(hasRole(MANAGER_ROLE, _msgSender()), "JNT: must have manager role to mint");
        jsonIpfsHash[_tokenId] = _jsonIpfsHash;
        serial[_tokenId] = _serial;
    }

    function consecutiveBatchTransfer(address to, uint256 tokenIdStart, uint256 tokenIdEnd) public {
        for(uint i = tokenIdStart; i<tokenIdEnd; i++){
            require(_isApprovedOrOwner(_msgSender(), i), "JNT: batch transfer caller is not owner nor approved");
            _transfer(_msgSender(), to, i);
        }
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "JNT: URI query for nonexistent token");

        return string(abi.encodePacked("ipfs://", jsonIpfsHash[tokenId]));
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControlEnumerable, ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
