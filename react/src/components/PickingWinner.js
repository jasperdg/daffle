import React from 'react';
import '../css/winner.css';

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render(){
    return(
        <div className={`winner-background ${this.props.picking || this.props.winner ? 'show' : 'hide'}`}>
            <section className={`winner-section`}>
                <div onClick={this.props.closePopUp} className="close">x</div>
                <div className={`picking ${this.props.picking ? 'show' : 'hide'}`}>
                    <h3>
                        {`${this.props.initializing ? 'Initializing' 
                        : this.props.requestNumber ? 'Getting random number'
                        : 'Picking winner'}`}
                    </h3>
                    <p className={`${this.props.requestNumber ? 'show' : 'hide'}`}>(This step might take a while)</p>
                    <section className="checkpoints">
                        <div className="spinner step-one ">
                            <div className={`double-bounce1 ${this.props.initializing ? 'active' : 'done'}`}></div>
                            <div className={`double-bounce2 ${this.props.initializing ? 'active' : 'done'}`}></div>
                        </div>

                        <div className="spinner step-two">
                            <div className={`double-bounce1 ${this.props.initializing ? 'inactive' : this.props.requestNumber ? 'active' : 'done'}`}></div>
                            <div className={`double-bounce2 ${this.props.initializing ? 'inactive' : this.props.requestNumber ? 'active' : 'done'}`}></div>
                        </div>

                        <div className="spinner step-three">
                            <div className={`double-bounce1 ${this.props.pickingWinner ? 'active' : 'inactive'}`}></div>
                            <div className={`double-bounce2 ${this.props.pickingWinner ? 'active' : 'inactive'}`}></div>
                        </div>
                    </section>
                    <a 
                        target="_blank" 
                        className={typeof this.props.pickingWinner == "string" ? 'show' : 'hide'}
                        href={"https://ropsten.etherscan.io/tx/" + (this.props.pickingWinner)}>
                        Click here to see the deciding transaction
                    </a>
                </div>
                <div className={`picked ${this.props.winner ? 'show' : 'hide'}`}>
                    <div className={`winner ${this.props.winner && this.props.winner.change.winner === this.props.account ? 'show' : 'hide'}`}>
                        <h3>Congratulations! You've won!</h3>
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                        <circle className="path circle" fill="none" stroke="#73AF55" strokeWidth="6" strokeMiterlimit="10" cx="65.1" cy="65.1" r="62.1"/>
                        <polyline className="path check" fill="none" stroke="#73AF55" strokeWidth="6" strokeLinecap="round" strokeMiterlimit="10" points="100.2,40.2 51.5,88.8 29.8,67.5 "/>
                        </svg>
                    </div>
                    <div className={`loser ${this.props.winner && this.props.winner.change.winner !== this.props.account ? 'show' : 'hide'}`}>
                        <h3>Sorry, {(this.props.winner ? this.props.formatAddr(this.props.winner.change.winner) : '?') + " has won."}</h3>
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                            <circle className="path circle" fill="none" stroke="#D06079" strokeWidth="6" strokeMiterlimit="10" cx="65.1" cy="65.1" r="62.1"/>
                            <line className="path line" fill="none" stroke="#D06079" strokeWidth="6" strokeLinecap="round" strokeMiterlimit="10" x1="34.4" y1="37.9" x2="95.8" y2="92.3"/>
                            <line className="path line" fill="none" stroke="#D06079" strokeWidth="6" strokeLinecap="round" strokeMiterlimit="10" x1="95.8" y1="38" x2="34.4" y2="92.2"/>
                        </svg>
                    </div>
                </div>
            </section>
        </div>
    );
  }
}

export default Counter;
