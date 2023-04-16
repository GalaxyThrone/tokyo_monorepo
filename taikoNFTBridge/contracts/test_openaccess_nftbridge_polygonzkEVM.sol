// SPDX-License-Identifier: MIT

/*
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

interface IPolygonBridgeContract {
   function bridgeMessage(
        uint32 destinationNetwork,
        address destinationAddress,
        bool forceUpdateGlobalExitRoot,
        bytes calldata metadata
    ) external payable;

    function claimMessage(
        bytes32[32] calldata smtProof,
        uint32 index,
        bytes32 mainnetExitRoot,
        bytes32 rollupExitRoot,
        uint32 originNetwork,
        address originAddress,
        uint32 destinationNetwork,
        address destinationAddress,
        uint256 amount,
        bytes calldata metadata
    ) external;
}



// Abstract contract, add appropriate functionality later
abstract contract WrappedNFT {
    function claimBridged(uint256 srcChainId,
        address app,
        bytes32 signal,
        bytes calldata proof
    ) public virtual returns (bool,address,address,uint);

    function addSisterContract(address _newSisterContractOnOtherChain) public virtual;
}

// Contract for open access NFT bridge
contract openAccessNFTBridge is Ownable, IERC721Receiver {
    using Counters for Counters.Counter;

    IPolygonBridgeContract polygonBridge;

    // Use different starting points for each chain to prevent overlap
    Counters.Counter private _tokenIdCounter;

    // Define bridge and chain contracts and IDs
    address public polygonzkEVMBridgeContractL1 =
        	address(0xF6BEEeBB578e214CA9E23B0e9683454Ff88Ed2A7); // MessageService PolygonzkEVM

    address public polygonzkEVMBridgeContractL2 =
        	address(0xF6BEEeBB578e214CA9E23B0e9683454Ff88Ed2A7); // MessageService PolygonzkEVM

    

    address public ethereumGoerliBridgeContract =
        address(0x11013a48Ad87a528D23CdA25D2C34D7dbDA6b46b); // MessageService GoerliEth

    uint public goerliChainId = 5; //ChainID Sepolia

    uint public polygonChainIdZK = 1442; //ChainID polygon zkEVM  Testnet

    uint public currentChainType = 0; // 1 for L1, 2 for L2

    address public currentBridgeSignalContract;

    // The bridge contract on the other side. Actually useless atm.
    address public currentSisterContract;

    bool sisterBridgeSetup =false;

    uint public currentChainId;

    uint public currentSisterChainId;


    event bridgeRequestSent(
        address owner,
        address indexednftContract,
        uint indexed nftId
    );

    // Constructor function for the contract
    constructor(
        uint _chainType
    ) {
        currentChainType = _chainType;
        
        if (_chainType == 1) {
            currentBridgeSignalContract = polygonzkEVMBridgeContractL1;

            currentChainId = goerliChainId;
            currentSisterChainId = polygonChainIdZK;
        }

        if (_chainType == 2) {
            currentBridgeSignalContract = polygonzkEVMBridgeContractL2;

            currentChainId = polygonChainIdZK;
            currentSisterChainId = goerliChainId;
        }
    }

    // Mapping to store NFTs being held
    mapping(address => mapping(address => mapping(uint => bool))) heldNFT;

    mapping(address => address) public sisterContract;


    // Add a new sister contract
    function addSisterContract(address _newSisterContract) external {
        sisterContract[msg.sender] = _newSisterContract;
    }

    // Add a sister contract via signature
    function addSisterContractViaSignature(address _newSisterContract, bytes memory _signature) external {
        // TODO

        // for non-upgradable NFT Contracts to be L2 Bridge compliant
    }

    function addSisterBridgeContract(address _SisterContractInit) external onlyOwner{

        //sister bridge contract can only be set up once
        require(!sisterBridgeSetup, "A contract is a contract is a contract!");
        sisterBridgeSetup = true;
        currentSisterContract  = _SisterContractInit;

    }

    // Returns true or false if message received, the original NFT Contract address from the other chain, the owner of the NFT, and the tokenId
    function claimBridged(
        uint256 srcChainId,
        address _origin,
        bytes32 _dataPayload,
        bytes calldata proof
    ) external returns (bool,address,address,uint) {
        polygonBridge = IPolygonBridgeContract(currentBridgeSignalContract);

      
        bool response = polygonBridge.claimMessage(
            srcChainId,
            _origin,
            _dataPayload,
            proof
        );

        (
            address _addrOwner,
            address _addrOriginNftContract,
            uint256 _nftId
        ) = decodeMessagePayload(_dataPayload);

        // If we hold the NFT from a previous bridging, we return it to the owner here.
        if (
            heldNFT[_addrOwner][sisterContract[_addrOriginNftContract]][_nftId]
        ) {
            address sisterContractAddress = sisterContract[_addrOriginNftContract];

            require(sisterContractAddress != address(0), "no sister contract specified!");

            IERC721 sisterNftContract = IERC721(sisterContractAddress);

            sisterNftContract.safeTransferFrom(
                sisterContractAddress,
                _addrOwner,
                _nftId
            );

            return (response, address(0),address(0),0);
        }

        return (response, _addrOriginNftContract,_addrOwner,_nftId);
    }


       


    //requestId => storageSlot;
    mapping(uint => bytes32) public storageSlotsBridgeRequest;


    mapping(uint => address)public  bridgeRequestInitiatorUser;


    mapping(uint => address) public bridgeRequestInitiatorSender;

    mapping(uint => bytes32) public sentPayload;
    uint public totalRequestsSent;






    event bridgeData(
        address indexed sender,
        bytes32 indexed dataPayload
    );

    // Bridge NFT to sister chain
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) public override returns (bytes4) {
        address nftContractAddr = msg.sender;

        bytes32 encodedData = encodeMessagePayload(
            nftContractAddr,
            from,
            tokenId
        );

     
        
        storageSlotsBridgeRequest[totalRequestsSent] = pingBridgeForTransfer(
            encodedData
        );

        sentPayload[totalRequestsSent] = encodedData;
        bridgeRequestInitiatorUser[totalRequestsSent] = from ;
        bridgeRequestInitiatorSender[totalRequestsSent] = msg.sender;
      
        totalRequestsSent++;
        heldNFT[from][nftContractAddr][tokenId] = true;
       

        emit bridgeRequestSent(from, msg.sender, tokenId);

    
        return this.onERC721Received.selector;
    }

    function pingBridgeForTransfer(
        bytes32 _dataPayload
    ) internal {

        emit bridgeData(msg.sender, _dataPayload);
        polygonBridge = IPolygonBridgeContract(currentBridgeSignalContract);

    function bridgeMessage(
        uint32 destinationNetwork,
        address destinationAddress,
        bool forceUpdateGlobalExitRoot,
        bytes calldata metadata
    ) external payable;


       
    }

// Encode data payload to bytes32 for cross-chain messaging
function encodeMessagePayload(
    address _addrOwner,
    address _addrOriginNftContract,
    uint256 _nftId
) public pure returns (bytes32) {
    bytes32 encoded = bytes32(
        (uint256(uint160(_addrOwner)) << 96) |
        (uint256(uint160(_addrOriginNftContract)) << 32) |
        _nftId
    );
    return encoded;
}

// Decode data payload from bytes32 for cross-chain messaging
function decodeMessagePayload(
    bytes32 encodedMessageNFTBridge
) public pure returns (address, address, uint256) {
    address _addrOwner = address(uint160(uint256(encodedMessageNFTBridge) >> 96));
    address _addrOriginNftContract = address(uint160(uint256(encodedMessageNFTBridge) << 160 >> 192));
    uint256 _nftId = uint256(encodedMessageNFTBridge) & 0xFFFFFFFF;
    return (_addrOwner, _addrOriginNftContract, _nftId);
}

}

*/

