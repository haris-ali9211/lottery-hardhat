import { useWeb3Contract } from "react-moralis"
import { contractAddresses, abi } from '../constants'
import { useMoralis } from 'react-moralis'
import { useEffect } from "react"


export default function LotteryEntrance() {

    const { isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    // const { runContractFunction: enterRaffle } = useWeb3Contract({
    //     abi: contractAbi,
    //     contractAddress: contractAddress,
    //     functionName://,
    //         params:{},

    // })

    const { runContractFunction: getEnteranceFees } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, // specify the networkId
        functionName: "getEnteranceFees",
        params: {},
    })


    async function updateUi() {
        const someThing = await getEnteranceFees()
        console.log("🚀 ~ file: LotteryEntrance.jsx:34 ~ updateUi ~ someThing", someThing)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUi() 
        }
    }, [isWeb3Enabled])

    return (
        <>
            Lottery Entrance
        </>
    )
}