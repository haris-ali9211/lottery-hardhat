import { useWeb3Contract } from "react-moralis"
import { contractAddress, contractAbi } from '../constants/index'
import { useMoralis } from 'react-moralis'


export default function LotteryEntrance() {

    const { chainId: chainIdHex } = useMoralis()
    console.log("🚀 ~ file: LotteryEntrance.jsx:9 ~ LotteryEntrance ~ chainId", chainIdHex)

    // const { runContractFunction: enterRaffle } = useWeb3Contract({
    //     abi: contractAbi,
    //     contractAddress: contractAddress,
    //     functionName://,
    //         params:{},

    // })

    return (
        <>
            Lottery Entrance
        </>
    )
}