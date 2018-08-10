import React from 'react';

class ChatBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chatActive: false,
      chatMessage: '',
      chatLog: [''],
      userNameSet: false,
      userName: ''
    }
    this.props.socket.on('chat message', (msg) => {
      this.setState(prevState => ({
        chatLog: [...this.state.chatLog, <li key={this.state.chatLog.length}> {msg} </li>]
      }))
    });
  }

  sendChat = (e) =>{
    e.preventDefault();
    this.props.socket.emit('chat message', this.state.userName + ':  ' +  this.state.chatMessage);
    this.setState({chatMessage: ''});
  }

  setUserName = (e) => {
    e.preventDefault();
    this.setState({
      userNameSet: true
    });
    document.querySelector('#chat-input').focus();
  }

  onInputChange = (e, key) => {
    this.setState({[key] : e.target.value});
  }
  //socket.emit('chat message', $('#m').val());
  toggleShowChat = (e) => {
    this.setState({chatActive: !this.state.chatActive});
    if (!this.state.chatActive && this.state.userNameSet) {
      setTimeout(() => {
        document.querySelector('#chat-input').focus();
      }, 100);
    } else if (!this.state.chatActive){
      document.querySelector('.selectUserName').focus();

    }
  }

  render(){
    return(
      <section className={`chat ${this.state.chatActive ? 'show' : 'hide'}`}>
          <div className={`noUserName ${!this.state.userNameSet  && this.state.chatActive  ? 'show' : 'hide'}`}>
            <p>Please select a username for the chat</p>
            <form onSubmit={this.setUserName}>
              <input type="text" className="selectUserName" onChange={(e) => this.onInputChange(e, 'userName')} />
            </form>
          </div>
          <div onClick={this.toggleShowChat} className="chat-header"  >
            <p>Chat({this.state.chatLog.length - 1})</p>
            <div className={`arrow ${this.state.chatActive ? 'up' : 'down'}`}></div>
          </div>
          <div className="chat-body">
            <ul id="messages">
              {this.state.chatLog}
            </ul>
            <form action="" onSubmit={this.sendChat}>
              <input onChange={(e) => this.onInputChange(e, 'chatMessage')} value={this.state.chatMessage} id="chat-input" autoComplete="off" />
            </form>
          </div>
        </section>
    )
  }
}
export default ChatBox;
