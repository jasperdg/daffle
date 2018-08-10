import React from 'react';
import './../css/info.css';
class Info extends React.Component{
  constructor(props) {
    super(props);
  }

  componentDidUpdate(){
    const infoElem = document.querySelector('.info-elem');
    infoElem.style.left = this.props.x + 'px';
    infoElem.style.top = this.props.y - 400 + 'px';

  }

  render(){
    return(
      <section className={`info-elem ${this.props.show ? 'show' : 'hide'}`}>
        <p>We take a 2% fee for gas / oracle fee / development.</p>
      </section>
    );
  }
}

export default Info;
