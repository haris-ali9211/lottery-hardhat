const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const { networkConfig, deveplomentChains } = require("../../helper-hardhat-config");

!deveplomentChains.includes(network.name)
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
            raffleEntranceFees = await raffle.getEnteranceFees();
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

        describe('enterRaffle', () => {
            it("Reverts when you don't pay enough", async function () {
                await expect(raffle.enterRaffle()).to.be.revertedWith("Raffle__NotEnoughETHEntered")
            })
            it("records players when they enter", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFees })
                const playerFromContract = await raffle.getPlayer[0]
                assert.equal(playerFromContract, deployer);
            })
            it("emits event on enter", async () => {
                await expect(raffle.enterRaffle({ value: raffleEntranceFees })).to.emit(raffle, "EnterRaffle")
            })
            it("does not allow entrance when raffle is calculating", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFees })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", [])
                await raffle.performUpkeep([])
                await expect(raffle.enterRaffle({ value: raffleEntranceFees })).to.be.revertedWith("Raffle__NotOpen")
            })
        })
        describe("checkUpKeep", function () {
            it("returns false if people have not sent any ETH", async () => {
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", [])
                //using callStatic for simulates the transaction 
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])

                //   assert(!upkeepNeeded)
                assert.equal(upkeepNeeded, false)
            })
            it("returns false if raffle is not open", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFees })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", [])
                await raffle.performUpkeep([])
                //  await raffle.performUpkeep("0x") //sending 0x is equal to []
                const getRaffleState = await raffle.getRaffleState()
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
                assert.equal(getRaffleState, "1")
                assert.equal(upkeepNeeded, false)
            })
            it("returns false if enough time hasn't passed", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFees })
                await network.provider.send("evm_increaseTime", [interval.toNumber() - 1])
                //  await network.provider.request({ method: "evm_mine", params: [] })
                await network.provider.send("evm_mine", [])
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x")
                assert.equal(upkeepNeeded, false)
            })
            it("returns true if enough time has passed, has players, eth, and is open", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFees })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", [])
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x")
                assert(upkeepNeeded)
            })
        })

        describe("PerformUpKeep", function () {
            it("it can inly run if checkUpKeep is true", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFees })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", [])
                const tx = await raffle.performUpkeep([])
                assert(tx)
            })
            it("reverts when checkUpkeep is false", async () => {
                await expect(raffle.performUpkeep([])).to.be.revertedWith("Raffle__UpKeepNotNeeded")
            })
            it("updates the raffle state, emit the event, and calls the vrf Coordinator", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFees })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", [])
                const txResponse = await raffle.performUpkeep([])
                const txReceipt = await txResponse.wait(1)
                const requestId = txReceipt.events[1].args.requestId
                const raffleState = await raffle.getRaffleState()
                assert(requestId.toNumber() > 0)
                assert.equal(raffleState, "1")
            })
        })
        describe("fulfillRandomWords", function () {
            beforeEach(async function () {
                await raffle.enterRaffle({ value: raffleEntranceFees })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", [])
            })
            it("it only be called after performUpKeep", async () => {
                await expect(VRFCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)).to.be.revertedWith("nonexistent request")
            })
            it("picks a winner, resets, and sends money", async () => {
                const additionalEntrances = 3
                const startingIndex = 2
                const accounts = await ethers.getSigners()
                for (let i = startingIndex; i < startingIndex + additionalEntrances; i++) {
                    const accountsConnected = raffle.connect(accounts[i])
                    await accountsConnected.enterRaffle({ value: raffleEntranceFees })
                        
                }
                const startingTimeStamp = await raffle.getLatestTimeStamp()
                // This will be more important for our staging tests...
                await new Promise(async (resolve, reject) => {
                    raffle.once("WinnerPicked", async () => {
                        console.log("WinnerPicked event fired!")
                        // assert throws an error if it fails, so we need to wrap
                        // it in a try/catch so that the promise returns event
                        // if it fails.
                        try {
                            // Now lets get the ending values...
                            const recentWinner = await raffle.getRecentWinner()
                            const raffleState = await raffle.getRaffleState()
                            const winnerBalance = await accounts[2].getBalance()
                            const endingTimeStamp = await raffle.getLatestTimeStamp()
                            await expect(raffle.getPlayer(0)).to.be.reverted
                            assert.equal(recentWinner.toString(), accounts[2].address)
                            assert.equal(raffleState, 0)
                            assert.equal(
                                winnerBalance.toString(),
                                startingBalance
                                    .add(
                                        raffleEntranceFees
                                            .mul(additionalEntrances)
                                            .add(raffleEntranceFees)
                                    )
                                    .toString()
                            )
                            assert(endingTimeStamp > startingTimeStamp)
                            resolve()
                        } catch (e) {
                            reject(e)
                        }
                    })

                    const tx = await raffle.performUpkeep("0x")
                    const txReceipt = await tx.wait(1)
                    const startingBalance = await accounts[2].getBalance()
                    await VRFCoordinatorV2Mock.fulfillRandomWords(
                        txReceipt.events[1].args.requestId,
                        raffle.address
                    )
                })
            })
        })
    })