import { useWeb3Contract } from "react-moralis"
import { contractAddresses, abi } from '../constants'
import { useMoralis } from 'react-moralis'
import { useEffect, useState } from "react"
import { ethers } from "ethers"


export default function LotteryEntrance() {

    const { isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    const [entranceFeeFromContract, setEntranceFeeFromContract] = useState("0")

    const { runContractFunction: enterRaffle } = useWeb3Contract({
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


    async function updateUi() {
        const entranceFeeFromContract = (await getEnteranceFees()).toString()
        setEntranceFeeFromContract(entranceFeeFromContract)

    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUi()
        }
    }, [isWeb3Enabled])

    return (
        <>
            Lottery Entrance
            <br />
            {raffleAddress ?
                <div>
                    <button onClick={async function () {
                        await enterRaffle()
                    }}>Enter Raffle</button>
                    EntranceFee: {ethers.utils.formatUnits(entranceFeeFromContract, "ether")} Eth
                </div>
                :
                <div>No Raffle Address detected </div>
            }

        </>
    )
}