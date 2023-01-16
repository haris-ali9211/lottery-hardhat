const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const { networkConfig, developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ?
    describe.skip
    :
    describe("Raffle Unit Tests", () => {
        let raffle, VRFCoordinatorV2Mock, raffleEntranceFees, deployer, interval
        const chainId = network.config.chainId;
        beforeEach(async () => {
            enterRaffle = await (getNamedAccounts()).deployer
            await deployments.fixture(["all"])
            raffle = await ethers.getContract("Raffle", deployer)
            raffleEntranceFees = await raffle.getEntranceFee();
            interval = await raffle.getInterval()
            VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
        })
        describe("constructor", () => {
            it("Initializes the raffle correctly", async () => {
                const raffleState = await raffle.getRaffleState()
                assert.equal(raffleState.toString(), "0")
                assert.equal(interval.toString(), networkConfig[chainId]["interval"]);
            })

        })
        
        describe("enterRaffle",async function(){
            it("revert when you dont pay enough",async function(){
                await expect(raffle.enterRaffle()).to.be.revertedWith(
                    "Raffle__NotEnoughETHEntered"
                )
            })
        })
    })