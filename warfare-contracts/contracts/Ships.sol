// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/WrappedNFT.sol";
import "./interfaces/INFTBridge.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Ships is ERC721Enumerable, Ownable, WrappedNFT {
    address public constant sepoliaBridgeContract =
        0x9bF56347Cf15e37A0b85Dc269b65D2b10399be96;
    uint256 public constant sepoliaChainId = 11155111; //ChainID Sepolia
    uint256 public constant taikoChainId = 167002; //ChainID Taiko A2

    address public game;
    address public currentBridgeSignalContract;
    // The bridge contract on the other side
    address public sisterContract;
    uint256 public currentChainType; // 1 for L1, 2 for L2
    uint256 public currentChainId;
    uint256 public currentSisterChainId;

    INFTBridge nftBridge;

    struct Ship {
        string name;
        uint256 shipType;
        uint256 attack;
        uint256 defense;
        uint256 health;
        uint256 energy;
        uint256 special1;
        uint256 special2;
        bool alive;
    }

    struct ShipType {
        string name;
        uint256 attack;
        uint256 defense;
        uint256 health;
        uint256 energy;
        uint256 special1;
        uint256 special2;
    }

    mapping(uint256 => Ship) private ships;
    mapping(uint256 => ShipType) private shipTypes;

    modifier onlyGame() {
        require(msg.sender == game, "Only game can call this function.");
        _;
    }

    constructor(
        address _game,
        INFTBridge _nftBridge,
        uint256 _chainType
    ) ERC721("Ships", "SHIP") {
        game = _game;
        nftBridge = _nftBridge;
        initializeBridge(_chainType);
    }

    function mintShip(uint256 shipTypeId, address to) internal {
        uint256 id = totalSupply() + 1;
        Ships.Ship memory newShip = Ships.Ship(
            shipTypes[shipTypeId].name,
            shipTypeId,
            shipTypes[shipTypeId].attack,
            shipTypes[shipTypeId].defense,
            shipTypes[shipTypeId].health,
            shipTypes[shipTypeId].energy,
            shipTypes[shipTypeId].special1,
            shipTypes[shipTypeId].special2,
            true
        );
        ships[id] = newShip;
        _safeMint(to, id);
    }

    function faucet(uint256[] calldata _ids) external {
        for (uint256 i = 0; i < _ids.length; i++) {
            mintShip(_ids[i], msg.sender);
        }
    }

    function killShip(uint256 shipId) external onlyGame {
        ships[shipId].alive = false;
        ships[shipId].health = 0;
    }

    function reviveShip(uint256 shipId) external onlyGame {
        ships[shipId].alive = true;
        uint256 health = shipTypes[ships[shipId].shipType].health;
        ships[shipId].health = health;
    }

    function setHealth(uint256 shipId, uint256 amount) external onlyGame {
        ships[shipId].health = amount;
    }

    function setEnergy(uint256 shipId, uint256 amount) external onlyGame {
        ships[shipId].energy = amount;
    }

    function setAttack(uint256 shipId, uint256 amount) external onlyGame {
        ships[shipId].attack = amount;
    }

    function setDefense(uint256 shipId, uint256 amount) external onlyGame {
        ships[shipId].defense = amount;
    }

    function getShip(uint256 id) external view returns (Ship memory) {
        return ships[id];
    }

    function setGame(address _game) external onlyOwner {
        game = _game;
    }

    function setNftBridge(INFTBridge _nftBridge) external onlyOwner {
        nftBridge = _nftBridge;
    }

    function addShipTypes(
        ShipType[] calldata _shipTypes,
        uint256[] calldata _ids
    ) external onlyOwner {
        for (uint256 i = 0; i < _shipTypes.length; i++) {
            shipTypes[_ids[i]] = _shipTypes[i];
        }
    }

    function claimNFT(
        address _origin,
        bytes32 _dataPayload,
        bytes calldata proof
    ) external {
        //req bool true addr not zero, check my sis contract, nft id
        (
            bool success,
            address _owner,
            address _sisterContract,
            uint256 nftId
        ) = nftBridge.claimBridged(
                sepoliaChainId,
                _origin,
                _dataPayload,
                proof
            );
        require(success, "no success");
        require(_owner != address(0), "no owner");
        // todo check later
        // require(sisterContract == _sisterContract, "no sister");
        uint256 _id = totalSupply() + 1;
        _safeMint(_owner, _id);
    }

    function initializeBridge(uint256 _chainType) internal {
        currentChainType = _chainType;

        if (_chainType == 2) {
            currentBridgeSignalContract = sepoliaBridgeContract;

            currentChainId = sepoliaChainId;
            currentSisterChainId = taikoChainId;
        }

        if (_chainType == 1) {
            currentBridgeSignalContract = sepoliaBridgeContract;

            currentChainId = taikoChainId;
            currentSisterChainId = sepoliaChainId;
        }
    }

    function addSisterContract(address _newSisterContract) external onlyOwner {
        sisterContract = _newSisterContract;
        nftBridge.addSisterContract(_newSisterContract);
    }
}
