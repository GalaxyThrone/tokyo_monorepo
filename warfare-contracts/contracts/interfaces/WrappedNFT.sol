// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface WrappedNFT {
    function claimNFT(
        address app,
        bytes32 signal,
        bytes calldata proof
    ) external;

    function addSisterContract(address _newSisterContract) external;
}
