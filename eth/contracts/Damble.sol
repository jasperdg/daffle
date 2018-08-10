pragma solidity ^0.4.19;

import './SafeMath.sol';
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract Damble is usingOraclize{
    using SafeMath for uint256;

    mapping(address => uint) public users;
    mapping(uint => bool) private allowedValues;
    address[] public userAddresses;
    uint[] public partAmounts;
    address owner;

    uint minEther;
    uint public totalEth;
    uint maxUsers;
    uint maxValue = 5 ether;
    uint public randomNumber;
    function Damble() {
        owner = msg.sender;
        minEther = 0.5 ether;

        // these are the only allowed values in this lobby, if the value is something else the user has been playing around with the code
        allowedValues[(1 ether / 100)] = true;
        allowedValues[(1 ether / 10)] = true;
        allowedValues[(1 ether / 4)] = true;
        allowedValues[(1 ether / 2)] = true;
        allowedValues[(1 ether)] = true;
        allowedValues[(5 ether)] = true;
    }

    event NewUser(address userAddress, uint amount);
    event WinnerPicked(address winner);
    event NewRandomNumber_bytes(bytes);
    event NewRandomNumber_uint(uint);
    event ProofFailed();


    function placeBet() public payable{
        require(msg.value <= maxValue && msg.value > 0);
        require(allowedValues[msg.value]);

        if (users[msg.sender] > 0) {
            userPullout(); //Remove senders data
        }

        // Push senders data again.
        userAddresses.push(msg.sender);
        partAmounts.push(msg.value);
        totalEth = SafeMath.add(msg.value, totalEth);
        users[msg.sender] = msg.value;
        NewUser(msg.sender, msg.value);
    }
    

    function getPartAmounts() view public returns(uint[]){
        return partAmounts;
    }

    function getUserBalance(address user) view public returns(address, uint){
        return(user, users[user]);
    }

    function accountAmount() view public returns(uint) {
        uint arrLen = 0;
        for (uint i = 0; i < userAddresses.length; i++) {
            if (users[userAddresses[i]] > 0){
                arrLen++;
            }
        }
        return arrLen;
    }

    function minEthIsMet() view public returns(bool){
        return (totalEth >= minEther);
    }

    function userPullout() private {
        require(users[msg.sender] > 0);
        for (uint i = 0; i < userAddresses.length; i++) {
            if (userAddresses[i] == msg.sender){
                delete userAddresses[i];
                delete partAmounts[i];
            }
        }
        
        totalEth = SafeMath.sub(totalEth, users[msg.sender]);
        msg.sender.transfer(users[msg.sender]);
        users[msg.sender] = 0;
    }


    function pickWinner(uint randomNumber) view private returns(address){
        uint lastMax = 1;

        for (uint i = 0; i < userAddresses.length; i++) {
            if (randomNumber >= lastMax && randomNumber <= (users[userAddresses[i]] + lastMax)){
                WinnerPicked(userAddresses[i]);
                return (userAddresses[i]);
            }
            lastMax =  SafeMath.add(users[userAddresses[i]], lastMax);
        }
    }
    


    function endRaffle() public{
        require(msg.sender == owner);
        require(accountAmount() > 1);
        require(totalEth >= minEther);

        address winner = pickWinner(randomNumber);
        if (winner == address(0)){
            onNoAddress();
        } else {
            uint winnings; 
            if (SafeMath.div((SafeMath.mul(totalEth, 98)), 100) > this.balance) {
                winnings = SafeMath.div((SafeMath.mul(totalEth, 98)), 100);
            } else {
                winnings = SafeMath.div((SafeMath.mul(this.balance, 98)), 100);
            }
                
            winner.transfer(winnings);
            owner.transfer(address(this).balance);
        }
        totalEth = 0;
        clearParticipants();
    }

    function getContractBalance() public view returns(uint){
        return address(this).balance;
    }

    function clearParticipants() private {
        for (uint i = 0; i < userAddresses.length; i++) {
            users[userAddresses[i]] = 0;
            delete userAddresses[i];
            delete partAmounts[i];
        }
    }

    function onNoAddress() private{
        for (uint i = 0; i < userAddresses.length; i++) {
            userAddresses[i].transfer(users[userAddresses[i]]);
            users[userAddresses[i]] = 0;
        }
    }
    
    
    // Orazlized code
    function __callback(bytes32 _queryId, string _result, bytes _proof)
    { 
        if (msg.sender != oraclize_cbAddress()) throw;
        
        if (oraclize_randomDS_proofVerify__returnCode(_queryId, _result, _proof) != 0) {
            ProofFailed();
            // the proof verification has failed, do we need to take any action here? (depends on the use case)
        } else {
            // for simplicity of use, let's also convert the random bytes to uint if we need
            uint maxRange = totalEth -1; // deduct one so that when one gets added later it cant be bigger than the total eth.
            randomNumber = (uint(sha3(_result)) % maxRange) + 1; // this is an efficient way to get the uint out in the [1, maxRange] range
            
            NewRandomNumber_uint(randomNumber); // this is the resulting random number (uint)
        }
    }
    
    function getRandomNumber() payable { 
        require(msg.sender == owner);
        require(accountAmount() > 1);
        require(totalEth >= minEther);
        
        oraclize_setProof(proofType_Ledger); // sets the Ledger authenticity proof
        uint N = 4; // number of random bytes we want the datasource to return
        uint delay = 0; // number of seconds to wait before the execution takes place
        uint callbackGas = 200000; // amount of gas we want Oraclize to set for the callback function
        bytes32 queryId = oraclize_newRandomDSQuery(delay, N, callbackGas);
    }
    
}