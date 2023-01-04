// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

error Raffle__RaffleNotOpen();


contract Raffle is VRFConsumerBaseV2{
    //state variable
    uint256 private immutable i_entranceFee;
    address payable[] private s_player;

    //events
    event RaffleEnter(address indexed player);

    constructor(uint256 entranceFee) {
        i_entranceFee = entranceFee;
    }

    function enterRaffle() public payable {
        if (msg.value < i_entranceFee) {
            revert Raffle__RaffleNotOpen();
        }
        s_player.push(payable(msg.sender));
        emit RaffleEnter(msg.sender);
    }

    function requestRandomNumber(){
        //request nomber
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override{

    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_player[index];
    }

    // function pickRandomNumber(){}
}
