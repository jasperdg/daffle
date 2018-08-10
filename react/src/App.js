// Packages
import React, { Component } from 'react';
import Web3 from 'web3';
import metamaskhead from './images/metamask-head.svg';
import openSocket from 'socket.io-client';

// Components
import Header from './components/Header';
import ChatBox from './components/ChatBox';
import BetBook from './components/BetBook';
import Counter from './components/Counter';
// import PastTransactions from './components/PastTransactions';

// Files
import './App.css';
import abi from './abi.json';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: null,
      contract: null,
      web3: window.web3 ? new Web3(window.web3.currentProvider) : new Web3(Web3.currentProvider),
      loginRequired: false,
      metamaskDetected: true,
      showInfoSection: false
    }
    this.contractAddress = "0x1A181f1871D4D5CBb16a20F8753d3fAB295Bf818";
    this.contractObject = {from: this.account, gas:300000};
    this.socket = openSocket('http://localhost:3000'); // subscribed to the socket server firing the events from node back-end
    // this.socket = openSocket('http://200.74.240.59:3000'); // subscribed to the socket server firing the events from node back-end

  }

  showInfoSection = (e) => {
    e.preventDefault();
    this.setState({showInfoSection : !this.state.showInfoSection});
  }


  formatAddress = (address) => {
    if (typeof address === "string") {
      address = address.slice(0, 6) + '...' + address.slice(-4, address.length + 1);
    }
    return address;
  }

  componentDidMount = () => {
    if (typeof window.web3 !== 'undefined') {
        this.setState({metamaskDetected : true});
        this.state.web3.eth.getAccounts((err, accounts) => {
          if(err) {
              throw err;
          } else {
            if (accounts.length > 0) {
              this.contractObject = {from: accounts[0], gas:3000000};
              this.contract = new this.state.web3.eth.Contract(abi, this.contractAddress);
              this.setState(prevState=> ({
                web3: {
                  ...prevState.web3,
                  eth: {
                    ...prevState.web3.eth,
                    defaultAccount: accounts[0]
                  }
                },
                loginRequired : false,
                account : accounts[0],
                contract : this.contract
              }));
            } else {
              this.setState({loginRequired: true})
            }
          }
      });
    } else {

      this.setState({metamaskDetected :false});

        console.log('No web3? You should consider trying MetaMask!')
    }
  }
  closeLoginReq = () => {
    this.setState({loginRequired: false})
  }
  closeMetamask = () => {
    this.setState({metamaskDetected: true})
  }

  closeInfoSection = () => {
    this.setState({showInfoSection: false})
  }

  render() {
    return (
      <div className="App">
        <Header
          formatAddr = {this.formatAddress}
          account = {this.state.account}
          web3={this.state.web3}
          contract={this.state.contract}
          contractObject={this.contractObject}
          contractAddress={this.contractAddress}
          showInfoSection={this.showInfoSection.bind(this)}
        />
        <section className={`info-section ${this.state.showInfoSection ? 'show' : 'hide'}`}> 
          <p onClick={this.closeInfoSection} className="close">x</p>
          <h1>Daffle</h1>
          <h2>Fair, decentralized, transparent en instant payouts!</h2>
          <h2>Smart contract address: <a target="_blank" href={"https://ropsten.etherscan.io/address/" + this.contractAddress}>{this.contractAddress}</a></h2>
          <h3>What is Daffle?</h3>
          <p>Daffle is a decentralized raffle (Daffle) that makes use of the ethereum blackchain, has no need to buy a erc-20 crypto currency up front (like some of its competitors) but does
            everything straight-up with ethereum.
          </p>
          <p>To make use of this raffle you have to install <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn">Metamask</a>, 
            this makes it save and incredably easy to send transactions.
          </p>
          <h3>How does it work?</h3>
          <p>There is one lobby with an x amount of people, there a couple of fixed amounts of Ethereum that can be send to the smart-contract. The more
            Ethereum you send the higher the chance is of you winning, the winner is picked by getting a random number from an oracle service. Example:
          </p>
          <section className="example">
            <p>You send 1 Ethereum</p>
            <p>Player 2 sends 0.5 Ethereum</p>
            <p>Player 3 sends 0.5 Ethereum as well</p>
          </section>
          <p>You'll have 50% chance to win, while played 2 and 3 have 25% to win.</p>
          <h3>What do you win?</h3>
          <p>You win the entire stack of Ethereum - a 2% fee (this is send to the creators wallet for server/oracle/gas/development costs) so
             in the example above the winner would win 1.96 Ethereum!
          </p>
          <p>If you have any questions, try to see if we are in the chat. </p>
          <p><strong>NOTICE:</strong> The Daffle team would never ask you for your private key or ask you to send Ethereum to us personally.</p>


        </section>
        <section  className={`login-notifier ${this.state.loginRequired ? 'show' : 'hide'}`}>
          <div className="content-section">
            <div onClick={this.closeLoginReq} className="cross"><span>x</span></div>
            <img src={metamaskhead} alt="metmask logo"></img>
            <h3>Please log in to your metamask account to be able to place bets.</h3>
          </div>
        </section>

        <section  className={`login-notifier metamask ${this.state.metamaskDetected ? 'hide' : 'show'}`}>
          <div className="content-section">
            <div onClick={this.closeMetamask} className="cross"><span>x</span></div>
            <img src={metamaskhead} alt="metmask logo"></img>
            <h3>To make use of this application you will need to install Metamask <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn">here</a></h3>
          </div>
        </section>
        <section className="main">
          <Counter
            socket = {this.socket}
          />
          <BetBook
            socket = {this.socket}
            formatAddr = {this.formatAddress}
            account = {this.state.account}
            web3={this.state.web3}
            contract={this.state.contract}
            contractObject={this.contractObject}
          />
          {/* <PastTransactions/> */}
        </section>
        <ChatBox
          socket = {this.socket}
        />
      </div>
    );
  }
}

export default App;
