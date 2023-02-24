import { useWeb3Contract } from "react-moralis"
import { contractAddresses, abi } from '../constants'
import { useMoralis } from 'react-moralis'
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"


export default function LotteryEntrance() {

    const { isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    const [entranceFeeFromContract, setEntranceFeeFromContract] = useState("0")
    const [numberOfPlayers, setNumberOfPlayers] = useState("0")
    const [RecentWinner, setRecentWinner] = useState("0")
    const dispatch = useNotification();

    const {
        runContractFunction: enterRaffle,
        // data: enterTxResponse,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, 
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFeeFromContract
    })

    const { runContractFunction: getEnteranceFees } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, // specify the networkId
        functionName: "getEnteranceFees",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, // specify the networkId
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, // specify the networkId
        functionName: "getRecentWinner",
        params: {},
    })


    async function updateUi() {
        const entranceFeeFromContract = (await getEnteranceFees()).toString()
        const NumberOfPlayers = (await getNumberOfPlayers()).toString()
        const RecentWinner = (await getRecentWinner()).toString()
        setEntranceFeeFromContract(entranceFeeFromContract)
        setRecentWinner(RecentWinner)
        setNumberOfPlayers(NumberOfPlayers)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUi()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNotification(tx)
        updateUi()
    }

    const handleNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete",
            title: "Tx Notification",
            position: "topR",
            icon: "bell"
        })
    }

    return (
        <>
            Lottery Entrance
            <br />
            {raffleAddress ?
                <div>
                    <button
                        className="border-solid border-2 border-sky-500"

                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            }
                            )
                        }}
                        disabled={isLoading || isFetching}
                    >Enter Raffle</button>
                    EntranceFee: {ethers.utils.formatUnits(entranceFeeFromContract, "ether")} Eth
                    <br />
                    Number of Player {numberOfPlayers}
                    <br />
                    Recent Winner {RecentWinner}
                </div>
                :
                <div>No Raffle Address detected </div>
            }

            <div className="p-5">
                <h1 className="py-4 px-4 font-bold text-3xl">Lottery</h1>
                {raffleAddress ? (
                    <>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                            onClick={async function () {
                                await enterRaffle({
                                    onSuccess: handleSuccess,
                                    onError: (error) => console.log(error),
                                }
                                )
                            }}
                            disabled={isLoading || isFetching}
                        >
                            {isLoading || isFetching ? (
                                <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                            ) : (
                                "Enter Raffle"
                            )}
                        </button>
                        <div>Entrance Fee: {ethers.utils.formatUnits(entranceFeeFromContract, "ether")} ETH</div>
                        <div>The current number of players is: {numberOfPlayers}</div>
                        <div>The most previous winner was: {RecentWinner}</div>
                    </>
                ) : (
                    <div>Please connect to a supported chain </div>
                )}
            </div>
        </>
    )
}