import React from 'react';
import '../css/betBook.css';
import info from '../images/information.png';
import Chart from './Chart';
import Info from './Info';
import PickingWinner from './PickingWinner';
class BetBook extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      bets: [],
      prefRes: [],
      totalValue: null,
      selectedBet: null,
      anyBets: false,
      userBalance: null,
      userBalances: [],
      raffleParticipants: 0,
      showInfo: false,
      eventObj : false,
      event: null,
      winner: null,
      newWinner: false,
      pickingWinner: false,
      requestNumber: false,
      txId: false
    }
  }

  componentDidMount = () => {
    this.props.socket.on('new user', (event) => {
      setTimeout(() => {
        this.props.contract.methods.getPartAmounts().call(this.props.contractObject, (err, res) => {
          this.setState({event: res, txId: false});
        });
      }, 500);
    });
    this.props.socket.on('initializing', (event) => {
      setTimeout(() => {
        this.setState({
          initializing: event,
          picking: true,
        })
      }, 500);
    });
    this.props.socket.on('request number', (event) => {
      setTimeout(() => {
        this.setState({
          requestNumber: event,
          initializing:false,
          picking: true,
        })
      }, 500);
    });
    this.props.socket.on('picking winner', (event) => {
      setTimeout(() => {
        this.setState({
          pickingWinner: event,
          requestNumber: false,
          picking: true,
        })
      }, 500);
    });
    this.props.socket.on('winner picked', (event) => {
      setTimeout(() => {
        this.setState({
          winner: event, 
          newWinner: true, 
          pickingWinner: false,
          picking: false
        });
      }, 500);
    });
  }
  
  componentDidUpdate = () => {
    const liArr = [];
    const newWinner = this.state.newWinner;
    
    if ((this.props.contract)) {
      this.getActiveAccounts();
      this.checkUserBalance();
      const contract = this.props.contract;
      contract.methods.getPartAmounts().call(this.props.contractObject, (err, res) => {
        if(err) {
          throw err;
        } else{
          if(res.find(this.checkPrecent) || newWinner) {
            let totalValue = 0;

            res.forEach((element, i) => {
              if (element != 0){
                const resInEth = this.props.web3.utils.fromWei(element, 'ether');
                res[i] = resInEth;
                totalValue += parseFloat(resInEth);
              }
            });
            res.forEach(bet => {
              if (bet != 0){
                const chance = this.calculateChance(bet, totalValue);
                liArr.push(<li className="bet" key={liArr.length} title={chance}> {bet} ETH <span className="win-chance">({chance.toFixed(2)}%)</span> </li>)
              }
            });

            const arrDifferent = this.state.prefRes[this.state.prefRes.length -1] !== res[res.length -1];
            
            if ((this.state.bets.length !== liArr.length ) || arrDifferent || newWinner) {
              this.setState({
                bets: liArr,
                totalValue: totalValue,
                anyBets: true,
                prefRes: res,
                newWinner: false
              });
            }
          } else if(this.state.bets.length !== liArr.length){
            if (this.state.anyBets === true) {
              this.setState({
                anyBets: false
              });
            }
          }
        }
      })
    } else {
      if (this.state.anyBets === true) {
        this.setState({
          anyBets: false
        });
      }
    }
  }

  getActiveAccounts = () => {
    fetch ('http://200.74.240.59:3000/api/account-amount', {mode: 'cors'})
    .then((res)=>{
      return res.json();
    })
    .then((res) => {
        if (this.state.raffleParticipants !== res.response) {
          this.setState({
            raffleParticipants: res.response,
          })
        }
      });
  
  }

  checkUserBalance = () => {
    fetch("http://200.74.240.59:3000/api/user-balance",  {
      mode: 'cors',
      method: 'post',
      body : JSON.stringify({
        address: this.props.account
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },

    }).then((res)=>{
      return res.json();
    })
    .then((json)=>{
      if (this.state.userBalance !== this.props.web3.utils.fromWei(json.response[1].toString(), 'ether')){
        this.setState({userBalance: this.props.web3.utils.fromWei(json.response[1].toString(), 'ether')})
      }
    });

  }

  checkPrecent(age) {
    return age > 0;
  }
  betButtonClick = (e) => {
    const value = e.target.innerHTML;
    const valueArr = value.split(' ');
    if (this.state.selectedBet === valueArr[0]){
      this.setState({selectedBet: null});
    } else {
      this.setState({selectedBet: valueArr[0]});
    }
  }

  placeBet = () => {
    this.props.contract.methods.placeBet()
    .send({from:this.props.account, value:this.props.web3.utils.toWei(this.state.selectedBet.toString(), 'ether'), gas:300000}, (err, res) => {
      if (err) {
        throw err;
      } else {
        this.setState({txId: res});
      }
    });
  }

  calculateChance(bet, totalValue){
    return ((bet / totalValue) * 100);
  }

  setNoWinner = () => {
    
    this.setState({winner: false, picking: false});
  }



  showInfo = (e) => {
    this.setState({
      showInfo: true,
      infoX: e.pageX,
      infoY: e.pageY
    });
  }
  hideInfo= (e) => {
    this.setState({showInfo: false});
  }


  closeTxPopUp = () => {
    this.setState({txId: false});
  }

  render(){
    return(
      <section>
        <PickingWinner
          formatAddr = {this.props.formatAddr}
          picking = {this.state.picking}
          pickingWinner = {this.state.pickingWinner}
          winner = {this.state.winner}
          initializing = {this.state.initializing}
          requestNumber ={this.state.requestNumber}
          showWinner = {this.state.newWinner}
          winnings = {this.state.totalValue}
          account = {this.props.account}
          closePopUp = {this.setNoWinner}
        />
        <div className={`transaction-pop-up ${this.state.txId ? 'show' : 'hide'}`}>
          <div onClick={this.closeTxPopUp} className="close">x</div>
          <p>Your bet is being placed, you can check the progress here: <a target="_blank" href={`https://ropsten.etherscan.io/tx/${this.state.txId}`}>{this.state.txId}</a></p>
        </div>
        <section className="betBook">
          <Info
            x = {this.state.infoX}
            y = {this.state.infoY}
            show = {this.state.showInfo}
          />
          <ul className="orders">
            <p className="lobby-fill">  {`Active bets: ${this.state.raffleParticipants}`}</p>

            {this.state.bets}
            <li className={`bet no-bets ${this.state.anyBets ? "hide" : "show"}`}> No bets have been placed yet, be the first one to place a bet! </li>
            <li className={`bet total ${this.state.anyBets ? "show" : "hide"}`}>Winner wins:
              <strong>{0.98 * this.state.totalValue} ETH</strong>
              <img
                onMouseOver={this.showInfo}
                onMouseOut={this.hideInfo}
                className="info"
                alt="info icon hover over to see how we get to this price"
                src={info}
              />
            </li>
          </ul>
          

          <div>  
          </div>

          <div className="bet-buttons">
            <button className={`button ${this.state.selectedBet === "0.01" ? "selected" : "unselected" }`} onClick={this.betButtonClick}>0.01 ETH</button>
            <button className={`button ${this.state.selectedBet === "0.1" ? "selected" : "unselected" }`} onClick={this.betButtonClick}>0.1 ETH</button>
            <button className={`button ${this.state.selectedBet === "0.25" ? "selected" : "unselected" }`} onClick={this.betButtonClick}>0.25 ETH</button>
            <button className={`button ${this.state.selectedBet === "0.5" ? "selected" : "unselected" }`} onClick={this.betButtonClick}>0.5 ETH</button>
            <button className={`button ${this.state.selectedBet === "1" ? "selected" : "unselected" }`} onClick={this.betButtonClick}>1 ETH</button>
            <button className={`button ${this.state.selectedBet === "5" ? "selected" : "unselected" }`} onClick={this.betButtonClick}>5 ETH</button>

            <p className={`stake ${this.state.userBalance == null ? 'hide' : 'show'}`}>Your stake in this raffle is: <strong>{this.state.userBalance} ETH </strong></p>
            <p className={`refund-warning ${(this.state.selectedBet != null && (this.state.userBalance != null && this.state.userBalance != 0 )) ? 'show' : 'hide'}`}>NOTICE: You've already placed a bet.. your previous bet will be refunded but you have to pay the gas.</p>
            <button onClick={this.placeBet} className={`button bet-button active ${this.state.selectedBet === null ? 'hide' : 'show'}`}> Place bet </button>
          </div>

        </section>
        <Chart dataSet={this.state.bets}/>
      </section>

    );
  }
}

export default BetBook;
