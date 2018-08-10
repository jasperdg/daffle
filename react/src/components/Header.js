import React from 'react';
import './../css/header.css';
import metamaskLogo from '../images/metamask-head.svg'
class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accountBalance: "-",
      formattedAddress: '0x0...000',
      account: '0x0',
    }

  }
  componentDidMount(){
    setTimeout(() => {
      if (this.props.account){
        this.props.web3.eth.getBalance(this.props.account, 'latest', (err, res) => {
          if (this.state.accountBalance !== this.props.web3.utils.fromWei(res.toString(), 'ether')) {
            this.setState({
              account : this.props.account,
              accountBalance: this.props.web3.utils.fromWei(res.toString(), 'ether'),
              formattedAddress: this.props.formatAddr(this.props.account)
            })
          }
        });
      }
    }, 10000);
  }

  componentDidUpdate(){
    if (this.props.account){
      this.props.web3.eth.getBalance(this.props.account, 'latest', (err, res) => {
        if (this.state.accountBalance !== this.props.web3.utils.fromWei(res.toString(), 'ether')) {
          this.setState({
            account : this.props.account,
            accountBalance: this.props.web3.utils.fromWei(res.toString(), 'ether'),
            formattedAddress: this.props.formatAddr(this.props.account)
          })
        }
      });
    }

  }


  render(){
    return(
      <header>
        <h1>Daffle</h1>
        <p className="user-info">
          <a href={"https://ropsten.etherscan.io/address/"+this.props.contractAddress+"#internaltx"} target="_blank">
            <button className="payout-button">Check payouts</button>
          </a>
          <a onClick={this.props.showInfoSection} className="info-button" href="">Info</a>
          <span title={this.state.accountBalance} className="coinbase">{parseFloat(this.state.accountBalance).toFixed(4) + ' ETH'}</span>
          <img className="metamask-head" src={metamaskLogo} alt="metamask fox logo"/>
          <span title={this.state.account} className="user-address">{this.state.formattedAddress}</span>
        </p>
      </header>
      
    );
  }
}

export default Header;
