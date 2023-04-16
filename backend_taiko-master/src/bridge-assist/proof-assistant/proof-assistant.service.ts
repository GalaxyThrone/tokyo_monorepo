import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { keccak256 } from 'ethereumjs-util';
import { MerkleTree } from 'merkletreejs';
import * as abi from 'ethereumjs-abi';
import { ConfigService } from '@nestjs/config';
import { throwError } from 'rxjs';

@Injectable()
export class ProofAssistantService {
  private provider = new ethers.providers.JsonRpcProvider(
    "https://eth-sepolia.g.alchemy.com/v2/LHtmBfCuRwAK8RqtaHNRTqFdhx4YE7B3"
  );

  private providerTaiko = new ethers.providers.JsonRpcProvider(
    "https://l2rpc.hackathon.taiko.xyz"
  );



  private privateKey: string;
  private wallet: ethers.Wallet;

  constructor(private configService: ConfigService) {
    this.privateKey = this.configService.get<string>('PRIVATE_KEY');
    this.wallet = new ethers.Wallet(this.privateKey, this.provider);
  }


  private contractAddressSepolia = "0x11013a48Ad87a528D23CdA25D2C34D7dbDA6b46b"; // SignalService Sepolia
  private contractAddressTaiko = "0x0000777700000000000000000000000000000007"; // SignalService Taiko

  private contractAddressBridgeSepolia = "0x0363AA31FD5b7B273E3698F12c83fbDA92e74e85";
  private contractAddressBridgeTaiko = "0x942021fBb49d74Ddd0bc21c75A29A001dEE5281D"; //@notice currently not used. Important for bridging back.


  private contractABI = [
    {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
    {
    "type": "address",
    "name": "",
    "internalType": "address"
    }
    ],
    "name": "addressManager",
    "inputs": []
    },
    {
    "type": "function",
    "stateMutability": "pure",
    "outputs": [
    {
    "type": "bytes32",
    "name": "signalSlot",
    "internalType": "bytes32"
    }
    ],
    "name": "getSignalSlot",
    "inputs": [
    {
    "type": "address",
    "name": "app",
    "internalType": "address"
    },
    {
    "type": "bytes32",
    "name": "signal",
    "internalType": "bytes32"
    }
    ]
    },
    {
    "type": "function",
    "stateMutability": "nonpayable",
    "outputs": [],
    "name": "init",
    "inputs": [
    {
    "type": "address",
    "name": "_addressManager",
    "internalType": "address"
    }
    ]
    },
    {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
    {
    "type": "bool",
    "name": "",
    "internalType": "bool"
    }
    ],
    "name": "isSignalReceived",
    "inputs": [
    {
    "type": "uint256",
    "name": "srcChainId",
    "internalType": "uint256"
    },
    {
    "type": "address",
    "name": "app",
    "internalType": "address"
    },
    {
    "type": "bytes32",
    "name": "signal",
    "internalType": "bytes32"
    },
    {
    "type": "bytes",
    "name": "proof",
    "internalType": "bytes"
    }
    ]
    },
    {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
    {
    "type": "bool",
    "name": "",
    "internalType": "bool"
    }
    ],
    "name": "isSignalSent",
    "inputs": [
    {
    "type": "address",
    "name": "app",
    "internalType": "address"
    },
    {
    "type": "bytes32",
    "name": "signal",
    "internalType": "bytes32"
    }
    ]
    },
    {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
    {
    "type": "address",
    "name": "",
    "internalType": "address"
    }
    ],
    "name": "owner",
    "inputs": []
    },
    {
    "type": "function",
    "stateMutability": "nonpayable",
    "outputs": [],
    "name": "renounceOwnership",
    "inputs": []
    },
    {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
    {
    "type": "address",
    "name": "",
    "internalType": "address payable"
    }
    ],
    "name": "resolve",
    "inputs": [
    {
    "type": "string",
    "name": "name",
    "internalType": "string"
    },
    {
    "type": "bool",
    "name": "allowZeroAddress",

    "internalType": "bool"
}
]
},
{
"type": "function",
"stateMutability": "view",
"outputs": [
{
    "type": "address",
    "name": "",
    "internalType": "address payable"
}
],
"name": "resolve",
"inputs": [
{
    "type": "uint256",
    "name": "chainId",
    "internalType": "uint256"
},
{
    "type": "string",
    "name": "name",
    "internalType": "string"
},
{
    "type": "bool",
    "name": "allowZeroAddress",
    "internalType": "bool"
}
]
},
{
"type": "function",
"stateMutability": "nonpayable",
"outputs": [
{
    "type": "bytes32",
    "name": "storageSlot",
    "internalType": "bytes32"
}
],
"name": "sendSignal",
"inputs": [
{
    "type": "bytes32",
    "name": "signal",
    "internalType": "bytes32"
}
]
},
{
"type": "function",
"stateMutability": "nonpayable",
"outputs": [],
"name": "transferOwnership",
"inputs": [
{
    "type": "address",
    "name": "newOwner",
    "internalType": "address"
}
]
},
{
"type": "event",
"name": "Initialized",
"inputs": [
{
    "type": "uint8",
    "name": "version",
    "indexed": false
}
],
"anonymous": false
},
{
"type": "event",
"name": "OwnershipTransferred",
"inputs": [
{
    "type": "address",
    "name": "previousOwner",
    "indexed": true
},
{
    "type": "address",
    "name": "newOwner",
    "indexed": true
}
],
"anonymous": false
},
{
"type": "error",
"name": "B_NULL_APP_ADDR",
"inputs": []
},
{
"type": "error",
"name": "B_WRONG_CHAIN_ID",
"inputs": []
},
{
"type": "error",
"name": "B_ZERO_SIGNAL",
"inputs": []
},
{
"type": "error",
"name": "RESOLVER_DENIED",
"inputs": []
},
{
"type": "error",
"name": "RESOLVER_INVALID_ADDR",
"inputs": []
}
]
  



  private bridgeContractABI = [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_chainType",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "indexednftContract",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "nftId",
          "type": "uint256"
        }
      ],
      "name": "bridgeRequestSent",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_SisterContractInit",
          "type": "address"
        }
      ],
      "name": "addSisterBridgeContract",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_newSisterContract",
          "type": "address"
        }
      ],
      "name": "addSisterContract",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_newSisterContract",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "_signature",
          "type": "bytes"
        }
      ],
      "name": "addSisterContractViaSignature",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "bridgeRequestInitiatorSender",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "bridgeRequestInitiatorUser",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "srcChainId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_origin",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "_dataPayload",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "proof",
          "type": "bytes"
        }
      ],
      "name": "claimBridged",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "currentBridgeSignalContract",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "currentChainId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "currentChainType",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "currentSisterChainId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "currentSisterContract",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "encodedMessageNFTBridge",
          "type": "bytes32"
        }
      ],
      "name": "decodeMessagePayload",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_addrOwner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_addrOriginNftContract",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_nftId",
          "type": "uint256"
        }
      ],
      "name": "encodeMessagePayload",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "onERC721Received",
      "outputs": [
        {
          "internalType": "bytes4",
          "name": "",
          "type": "bytes4"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "sentPayload",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "sepoliaBridgeContract",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "sepoliaChainId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "sisterContract",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "storageSlotsBridgeRequest",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "taikoBridgeContract",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "taikoChainId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalRequestsSent",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
  private taikoBridgeABIHEaders = [
    {
      "constant": true,
      "inputs": [],
      "name": "getLatestSyncedHeader",
      "outputs": [
        {
          "name": "",
          "type": "bytes32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
  ]

 
  private sepoliaChainId = 11155111; // Sepolia Id
  private taikoId = 167002; // Taiko A2

  







  //checks if signal was received and also returns proof.
  async claimSignal(bridgeRequest: number) {


    const contractSignalService = new ethers.Contract(
      this.contractAddressTaiko,
      this.contractABI,
      this.wallet).connect(this.provider)
    
    const bridgeContract = new ethers.Contract(
      this.contractAddressBridgeSepolia,
      this.bridgeContractABI,
      this.wallet
    ).connect(  this.provider);
  
    const bridgeContractTaiko = new ethers.Contract(
      this.contractAddressTaiko,
      this.bridgeContractABI,
      this.wallet
    ).connect(  this.provider);
  

    console.log("WE STARTIN")

    console.log(bridgeRequest)
    
    let signalSenderAddress = this.contractAddressBridgeSepolia; // "0x13120DFedaa8Ec13CD363dccF764FBe41e77a50D"
    

    //0x13120DFedaa8Ec13CD363dccF764FBe41e77a50D
    
    console.log(signalSenderAddress)
    console.log("So far...1")


      


    //0x71ca46722f31889ce64f10afa0e54029d9066641a744ea32adbae4545c603073
    //0x67d67034cf7e83c76825b836320f85883356ed004d1f34415274fe8e86c9feea
    console.log("So far...2")
    let signalToVerify =  await bridgeContract.sentPayload(bridgeRequest)//await bridgeContract.sentPayload(bridgeRequest); // @TODO get from contract;

      console.log(signalToVerify)
   




    console.log("So far...3")
    //console.log(signalToVerify)

   
  
    
 

    const taikoL2Contract = new ethers.Contract(
      "0x0000777700000000000000000000000000000001",
      this.taikoBridgeABIHEaders,
      this.providerTaiko,
      
    );

    const latestSyncedHeaderHash = await taikoL2Contract.getLatestSyncedHeader();

    
    const block = await this.provider.send("eth_getBlockByHash", [
      latestSyncedHeaderHash,
      false,
    ]);



    const blockHeader = {
      parentHash: block.parentHash,
      ommersHash: block.sha3Uncles,
      beneficiary: block.miner,
      stateRoot: block.stateRoot,
      transactionsRoot: block.transactionsRoot,
      receiptsRoot: block.receiptsRoot,
      logsBloom: block.logsBloom
        .toString()
        .substring(2)
        .match(/.{1,64}/g)
        .map((s) => "0x" + s),
      difficulty: block.difficulty,
      height: block.number,
      gasLimit: block.gasLimit,
      gasUsed: block.gasUsed,
      timestamp: block.timestamp,
      extraData: block.extraData,
      mixHash: block.mixHash,
      nonce: block.nonce,
      baseFeePerGas: block.baseFeePerGas
        ? parseInt(block.baseFeePerGas)
        : 0,
      withdrawalsRoot: block.withdrawalsRoot,
    };






    
    const proof = await this.provider.send("eth_getProof", [
      this.contractAddressSepolia,
      [
        ethers.utils.keccak256(
          ethers.utils.solidityPack(
            ["address", "bytes32"],
            [
              signalSenderAddress,
              signalToVerify,
            ]
          )
        ),
      ],
      latestSyncedHeaderHash,
    ]);

    console.log("So far...4")
    console.log("--------------")
    console.log(proof)


    const RLP = ethers.utils.RLP;
    const encodedProof = ethers.utils.defaultAbiCoder.encode(
      ["bytes", "bytes"],
      [
        RLP.encode(proof.accountProof),
        RLP.encode(proof.storageProof[0].proof),
      ]
    );

  


    console.log("---------------encoded account & storage proof---------------");
    //console.log(encodedProof);

    let signalProof = ethers.utils.defaultAbiCoder.encode(
      [
        "tuple(tuple(bytes32 parentHash, bytes32 ommersHash, address beneficiary, bytes32 stateRoot, bytes32 transactionsRoot, bytes32 receiptsRoot, bytes32[8] logsBloom, uint256 difficulty, uint128 height, uint64 gasLimit, uint64 gasUsed, uint64 timestamp, bytes extraData, bytes32 mixHash, uint64 nonce, uint256 baseFeePerGas, bytes32 withdrawalsRoot) header, bytes proof)",
      ],
      [{ header: blockHeader, proof: encodedProof }]
    );

    console.log(signalProof);

    console.log("General Kenobi!")

    
    console.log("--sepoliaChainId--")
    console.log(this.sepoliaChainId);
    console.log("--signalSenderAddress--")
    console.log(signalSenderAddress);
    console.log("--signalToVerify--")
    console.log(signalToVerify);
    console.log("--signalProof--")
    console.log(signalProof);
    console.log("----")

      

     
    const tx = await contractSignalService
      .connect(this.providerTaiko)
      .isSignalReceived(this.sepoliaChainId, signalSenderAddress, signalToVerify, signalProof);

    console.log(`Signal sent status: ${tx}`);

    //return signalProof;
  }



  async returnSignalSentBridgeRequest(bridgeRequest: number) {


    const contractSignalService = new ethers.Contract(
      this.contractAddressSepolia,
      this.contractABI,
      this.wallet
    );

    const contractSignalServiceTaiko = new ethers.Contract(
      this.contractAddressTaiko,
      this.contractABI,
      this.wallet
    );
    
    const bridgeContract = new ethers.Contract(
      this.contractAddressBridgeSepolia,
      this.bridgeContractABI,
      this.wallet
    );
  

  

      
    const signalSenderAddressUser = await bridgeContract.bridgeRequestInitiatorUser(bridgeRequest);
  
    const signalSenderAddressContr = await bridgeContract.bridgeRequestInitiatorSender(bridgeRequest);
   

 
    let signalToVerify = await bridgeContract.storageSlotsBridgeRequest(bridgeRequest); // @TODO get from contract;

    

    
    console.log(signalToVerify)

    return signalToVerify;
  }


  async executeClaimSignal() {
    await this.claimSignal(0);
  }
}

function decToHex(decimal) {
  return "0x" + decimal.toString(16);
}

