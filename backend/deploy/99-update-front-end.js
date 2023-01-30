const { ethers } = require("hardhat");
const fs = require("fs") 

const FRONT_END_ADDRESS_FILE =
    "../frontend/nextV2/constants/contractAddress.json";

const FRONT_END_ABI = 
    "../frontend/nextV2/constants/abi.json"


module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("updating Frontend....")
        updateContractAddress()
        updateAbi()
        console.log("Frontend updated!")    }
}

async function updateContractAddress () {
    const raffle = await ethers.getContract("Raffle")
    const chainId = network.config.chainId.toString()
    const currentAddress = JSON.parse(fs.readFileSync(FRONT_END_ADDRESS_FILE,"utf-8"))
    if(chainId in currentAddress){
        if(!currentAddress[chainId].includes(raffle.address)){
            currentAddress[chainId].push(raffle.address)
        }
    }
    else{
        currentAddress[chainId] = [raffle.address]
    }
    fs.writeFileSync(FRONT_END_ADDRESS_FILE,JSON.stringify(currentAddress))
}

const updateAbi = async() => {
    const raffle  = await ethers.getContract("Raffle")
    fs.writeFileSync(FRONT_END_ABI, raffle.interface.format(ethers.utils.FormatTypes.json))
}

module.exports.tags = ["all", "frontend"]