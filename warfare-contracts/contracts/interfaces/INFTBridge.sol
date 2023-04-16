// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface INFTBridge {
    function claimBridged(
        uint256 srcChainId,
        address app,
        bytes32 signal,
        bytes calldata proof
    ) external returns (bool, address, address, uint);

    function addSisterContract(address _newSisterContract) external;
}
