const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts;

    let vrfCoordinatorV2Address
    const chainId = network.config.chainId;

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mocks = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfCoordinatorV2Mocks.address;
    }
    else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
    }

    const entranceFee = network.networkConfig[chainId]["entranceFee"]
    const gasLane = network.networkConfig[chainId]["gasLane"]

    const args = [vrfCoordinatorV2Address, entranceFee, gasLane]

    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
}