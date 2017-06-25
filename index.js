import _ from "lodash";
import "babel/polyfill";

import React from "react";
import { render, findDOMNode } from "react-dom";

import data from "./data";

const buildDistribution = (distObj, distFill = { low: [0, 1, 2, 3, 4, 5, 6], mid: [7, 8, 9] }) => {
  const dist = {
    low: 0,
    mid: 0,
    high: 0
  };

  for (let key in distObj) {
    const percent = parseFloat(distObj[key]);
    const roll = parseInt(key, 10);

    if (distFill.low.includes(roll)) {
      dist.low += percent;
    } else if (distFill.mid.includes(roll)) {
      dist.mid += percent;
    } else {
      dist.high += percent;
    }
  }

  return dist;
}

class DistributionSet extends React.Component {
  constructor(props) {
    super(props);
    this.renderDistribution = this.renderDistribution.bind(this);

    this.handleUpperLowChange = this.handleUpperLowChange.bind(this);
    this.handleUpperMidChange = this.handleUpperMidChange.bind(this);

    this.state = {
      upperLow: this.props.initialUpperLow,
      upperMid: this.props.initialUpperMid
    };
  }

  render() {
    return (
      <div>
        <h3>{this.props.titleBase}</h3>
        <div>
          <span style={{width: 150, display: "inline-block"}}>
            Low: 0 - <input type="number" value={this.state.upperLow} onChange={this.handleUpperLowChange} />
          </span>
          <span style={{width: 150, display: "inline-block"}}>
            Mid: {this.state.upperLow + 1} - <input type="number" value={this.state.upperMid} onChange={this.handleUpperMidChange} />
          </span>
          <span style={{width: 150, display: "inline-block"}}>
            High: {this.state.upperMid + 1}+
          </span>
        </div>
        {this.props.initialMods.map(this.renderDistribution)}
      </div>
    );
  }

  renderDistribution(mod, i) {
    const distFill = {
      low: _.range(0, this.state.upperLow + 1),
      mid: _.range(this.state.upperLow + 1, this.state.upperMid + 1)
    };

    return <DiceDistributionWrapper key={i} titleBase={this.props.titleBase}
            dataObj={this.props.dataObj} initialMod={mod} distFill={distFill} />;
  }

  handleUpperLowChange(e) {
    const n = parseInt(e.target.value, 10);
    this.setState({
      upperLow: n
    });
  }

  handleUpperMidChange(e) {
    const n = parseInt(e.target.value, 10);
    this.setState({
      upperMid: n
    });
  }
}

class DiceDistributionChart extends React.Component {
  render() {
    const style = {
      width: this.props.width,
      height: this.props.height,
      display: "inline-block"
    };

    return <div style={style} />;
  }

  componentDidMount() {
    this.renderChart();
  }

  componentDidUpdate() {
    this.renderChart();
  }

  renderChart() {
    const data = google.visualization.arrayToDataTable([
      ['Result', '% Chance', { role: 'annotation' }],
      ['Low', this.props.data.low, Math.round(this.props.data.low) + "%"],
      ['Mid', this.props.data.mid, Math.round(this.props.data.mid) + "%"],
      ['High', this.props.data.high, Math.round(this.props.data.high) + "%"]
    ]);

    const options = {
      title: this.props.title,
      legend: { position: 'none' },
      vAxis: {
        ticks: [ 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 ]
      }
    };

    const chart = new google.visualization.ColumnChart(findDOMNode(this));
    chart.draw(data, options);
  }
}

DiceDistributionChart.propTypes = {
  width: React.PropTypes.any,
  height: React.PropTypes.any,
  title: React.PropTypes.string,
  data: React.PropTypes.shape({
    low: React.PropTypes.number.isRequired,
    mid: React.PropTypes.number.isRequired,
    high: React.PropTypes.number.isRequired,
  }).isRequired,
}

DiceDistributionChart.defaultProps = {
  title: '',
  width: 180,
  height: 275,
}

class DiceDistributionWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.handleModChange = this.handleModChange.bind(this);

    this.state = {
      lastMod: props.initialMod,
      mod: props.initialMod
    };
  }

  render() {
    const title = this.props.titleBase + (this.state.lastMod < 0 ? "" : "+") + this.state.lastMod;
    const data = this.props.dataObj[title];
    const distribution = buildDistribution(data, this.props.distFill);

    return (
      <div style={{display: "inline-block"}}>
        <div>
          <DiceDistributionChart key={title} title={title} data={distribution} />
        </div>
        Mod: <input type="number" value={this.state.mod} onChange={this.handleModChange} />
      </div>
    );
  }

  handleModChange(e) {
    const newMod = parseInt(e.target.value, 10);
    if(isNaN(newMod)) {
      this.setState({mod: e.target.value});
    } else {
      this.setState({lastMod: newMod, mod: newMod});
    }
  }
}

DiceDistributionWrapper.propTypes = {
  initialMod: React.PropTypes.number.isRequired,
  titleBase: React.PropTypes.string.isRequired,
  dataObj: React.PropTypes.object.isRequired,
  distFill: React.PropTypes.object.isRequired,
};

const renderDistribution = (titleBase, dataLookupObj, mod, distFill) => {
  const title = titleBase + (mod < 0 ? "" : "+") + mod;
  const data = dataLookupObj[title];
  const distribution = buildDistribution(data, distFill);
  return <DiceDistributionChart key={title} title={title} data={distribution} />
};

var runApp = (
  _2dUpLow, _2dUpMid, _2dMod1, _2dMod2, _2dMod3, _2dMod4, _2dMod5, _2dMod6, _2dMod7,
  _3dUpLow, _3dUpMid, _3dMod1, _3dMod2, _3dMod3, _3dMod4, _3dMod5, _3dMod6, _3dMod7
) => {
  return (
    <div>
      <p>
        Balacing 2d6+mod and 3d6+mod dice distributions. Based on the Dungeon World ruleset
        where rolling in the "low" range is a fail, rolling in the "mid" range is a success
        with a hard choice or caveat, and rolling in the "high" range is a success. The goal
        is to utilize 3d6 instead of the default 2d6, but match up the ranges and modifiers
        so that the 3d6 distributions match as closely as possible.
      </p>
      <DistributionSet titleBase="2d6" dataObj={data._2d6}
        initialUpperLow={_2dUpLow} initialUpperMid={_2dUpMid}
        initialMods={[_2dMod1, _2dMod2, _2dMod3, _2dMod4, _2dMod5, _2dMod6, _2dMod7]} />
      <hr />
      <DistributionSet titleBase="3d6" dataObj={data._3d6}
        initialUpperLow={_3dUpLow} initialUpperMid={_3dUpMid}
        initialMods={[_3dMod1, _3dMod2, _3dMod3, _3dMod4, _3dMod5, _3dMod6, _3dMod7]} />
    </div>
  );
};

window.initApp = () => {
  let search = window.location.search;
  if (!search) {
    search = "?" + [
      6, 9, -3, -2, -1, 0, 1, 2, 3, 9, 13, -3, -2, -1, 0, 1, 2, 3
    ].join(",");
  }
  // if (!window.location.search) {
  //   window.location.search = "?" + [
  //     6, 9, -3, -2, -1, 0, 1, 2, 3, 9, 13, -3, -2, -1, 0, 1, 2, 3
  //   ].join(",");
  //   return;
  // }

  const application = runApp(...search.substring(1).split(",").map((i) => {
    console.log(i);
    return parseInt(i, 10);
  }));

  render(application, document.getElementById("app"));
}
