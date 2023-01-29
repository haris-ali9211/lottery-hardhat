import { ConnectButton } from "web3uikit";

export default function Header(){
    return(
        <>
        <div>
            Decentralize Lottery
        </div>
            <ConnectButton moralisAuth={false}/>
        </>
    )
}