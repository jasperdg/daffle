import React from 'react';
import '../css/counter.css';

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timeLeftSeconds : 300,
      formattedTicker : ""
    }
  }

  componentDidMount() {
    this.props.socket.on('second passed', (event) => {
      this.countDown(event)
    });
  }

  countDown = (secondsNow) =>{
    var minutes = Math.floor(secondsNow / 60);
    var seconds = secondsNow - minutes * 60;

    this.setState({
      timeLeftSeconds : secondsNow,
      formattedTicker: '0' + minutes + ':' + (seconds < 10 ? '0' + seconds : seconds)
    });
  }



  render(){
    return(
      <section>
        <span className="counter">{this.state.formattedTicker}</span>
        <p className="counter-text">A winner will only be picked if the total bet amount is above 0.5 ETH and there are multiple people in the lobby.</p>
      </section>
    );
  }
}

export default Counter;
