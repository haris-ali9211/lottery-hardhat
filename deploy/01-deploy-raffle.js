const { network, ethers } = require("hardhat");
const { deveplomentChains, networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("1");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    // const chainId = network.config.chainId;

    let vrfCoordinatorV2Address
    let subscriptionId
    if(deveplomentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        //generating subscription id for the localhost and hardhat network from a code
        const transectionResponse = await vrfCoordinatorV2Mock.createSubscription();
        const transectionReceipt = await transectionResponse.wait(1)
        subscriptionId = transectionReceipt.events[0].args.subId;
        //Fund the subscription
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, raffle.address);
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId,VRF_SUB_FUND_AMOUNT)
    }
    else{
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }
    const entranceFees = networkConfig[chainId]["entranceFees"]
    const gasLane = networkConfig[chainId]["gasLane"]
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    const interval = networkConfig[chainId]["interval"]
    const args = [vrfCoordinatorV2Address,entranceFees,gasLane,subscriptionId,callbackGasLimit,interval]
    // const args = [
    //     vrfCoordinatorV2Address,
    //     networkConfig[chainId]["raffleEntranceFee"],
    //     networkConfig[chainId]["gasLane"],
    //     subscriptionId,
    //     networkConfig[chainId]["callbackGasLimit"],
    //     networkConfig[chainId]["interval"]
    // ]

    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: waitBlockConfirmations,

    })

    if(!deveplomentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("Verifying...")
        await verify(raffle.address,args)
    }
    log("--------------------------------------")
}

module.exports.tags = ["all", "raffle"]