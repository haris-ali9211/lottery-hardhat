const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("30");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts;

    let vrfCoordinatorV2Address
    const chainId = network.config.chainId;

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mocks = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfCoordinatorV2Mocks.address;
        const transactionResponse = await vrfCoordinatorV2Mocks.createSubscription();
        const transactionReceipt = await transactionResponse.wait(1);
        subscriptionId = transactionReceipt.event[0].args.subId;

        await vrfCoordinatorV2Mocks.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
    }
    else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }

    const entranceFee = network.networkConfig[chainId]["entranceFee"]
    const gasLane = network.networkConfig[chainId]["gasLane"]
    const callBackGasLimit = network.networkConfig[chainId]["callBackGasLimit"]
    const interval = network.networkConfig[chainId]["interval"]

    const args = [vrfCoordinatorV2Address, entranceFee, gasLane, subscriptionId, callBackGasLimit, interval]

    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("Verifying.....")
        await verify(raffle.address,args)
    }
    log("----------------------------------------------------------")
}

module.exports.tags = ["all","raffle"]