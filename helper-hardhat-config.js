const { ethers } = require("hardhat");

const networkConfig = {
    // 4: {
    //     name : "rinkeby",
    //     vrfCoordinatorV2 : "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
    //     entranceFees : ethers.utils.parseEther("0.01"),
    //     gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", //keyhash
    //     subscriptionId : "7025",
    //     callbackGasLimit : "500000",
    //     interval : 30
    // },
    31337: {
        name : "localhost", 
        entranceFees : ethers.utils.parseEther("0.01"),
        subscriptionId: "588",
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // this is the keyhash it could be anything for localhost and hardhat network
        callbackGasLimit : "500000",
        interval : 30
    },
    5: {
        name: "goerli",
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        entranceFees : ethers.utils.parseEther("0.01"),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", // 30 gwei
        subscriptionId: "8689",
        // keepersUpdateInterval: "30",
        callbackGasLimit: "500000", // 500,000 gas
        interval : 30
    }

}

const deveplomentChains = ["hardhat", "localhost"];
module.exports = {
    networkConfig,
    deveplomentChains
}