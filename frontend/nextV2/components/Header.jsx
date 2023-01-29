import { useMoralis } from "react-moralis";
import { useEffect } from "react";

const ManualHeader = () => {
    const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } = useMoralis();

    useEffect(() => {
        console.log("HI")
        console.log("🚀", isWeb3Enabled)
        if(isWeb3Enabled) return
        if(typeof window !== "undefine"){
            if(window.localStorage.getItem("connected")){
                enableWeb3()
            }
        }
    }, [isWeb3Enabled])

    useEffect(()=>{
        Moralis.onAccountChanged((account)=>{
            console.log(`account changed to ${account}`)
            if(account == null){
                window.localStorage.removeItem("connected")
                deactivateWeb3()
                console.log("No account found")
            }
        })
    },[])

    return (
        <>
            {
                account ?
                    <div>Connected to {account.slice(0, 6)}...{account.slice(account.length - 4)}</div>
                    :
                    <button
                        onClick={
                            async () => {
                                await enableWeb3()
                                if(typeof window !== "undefine"){
                                    window.localStorage.setItem("connected","injected")
                                }
                            }
                        }
                        disabled={isWeb3EnableLoading}
                        >Connect</button>
            }
            i am header
        </>
    )
}

export default ManualHeader