const { network, ethers } = require("hardhat");
const {deveplomentChains} = require("../helper-hardhat-config")

const BASE_FEES = ethers.utils.parseEther("0.25");
const GAS_PRICE_LINK = 1e9; 
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    // const chainId = network.config.chainId
    // const args = [BASE_FEES,GAS_PRICE_LINK];

    if(deveplomentChains.includes(network.name)) {
        log("Local network detected Deploying mocks.....");
        await deploy("VRFCoordinatorV2Mock",{
            from:deployer,
            log:true,
            args:[BASE_FEES,GAS_PRICE_LINK]
        })
        log("Mock Deployed!");
        log("-------------------------------------------------------");

    }
} 

module.exports.tags = ["all","mocks"]