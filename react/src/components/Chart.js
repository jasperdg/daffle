import React from 'react';
import '../css/betBook.css';
import {PieChart} from 'react-easy-chart';
import ToolTip from './ToolTip';
class Chart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [], 
      compareData: []
    }

  }


  arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length)
        return false;
    for (var i = arr1.length; i--;) {
        if (arr1[i] !== arr2[i])
            return false;
    }
    return true;
  }

  componentDidUpdate = () =>{
    const data = this.props.dataSet;
    let compareDataArr = [];
    if (data.length > 0) {

      const colors = ["#accbff", "#92bbff", "#78aaff", "#649eff", "#4188ff"];
      const dataSet = [];
      data.forEach((value, i)=>{
        compareDataArr.push(value.props.title.toFixed(2))
        dataSet.push({key: value.props.title.toFixed(2) + '%', value: value.props.title, color: colors[i]} );
      });

      if (!this.arraysEqual(compareDataArr, this.state.compareData)) {
        this.setState({
          data: dataSet,
          compareData: compareDataArr
      });
      }
    }
  }
  mouseOverHandler = (d, e) => {
    this.setState({
      showToolTip: true,
      top: e.y,
      left: e.x,
      value: d.value,
      key: d.data.key});
  }

  mouseOutHandler = () => {
    this.setState({showToolTip: false});
  }

  createTooltip = () => {
    if (this.state.showToolTip) {
      return (
        <ToolTip        >
        {this.state.key}% chance to win!
        </ToolTip>
      );
    }
    return false;
  }

  render(){
    if (this.props.dataSet.length > 0) {
      return(
        <section className="chart">
            {this.createTooltip()}
            <PieChart
              labels
              styles={{
                '.chart_lines': {
                  strokeWidth: 0
                },
                '.chart_text': {
                  fontFamily: 'serif',
                  fontSize: '1.25em',
                  fill: '#333'
                }
              }}
              innerHoleSize={200}
              mouseOverHandler={this.mouseOverHandler}
              mouseOutHandler={this.mouseOutHandler.bind(this)}
              padding={10}
              data={this.state.data}
            />
        </section>
      );
    } else {
      return (
        <section className="chart">

        </section>
      )
    }
  }
}

export default Chart;
