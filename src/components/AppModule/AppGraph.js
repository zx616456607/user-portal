/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppGraph component
 *
 * v0.1 - 2016-10-26
 * @author Shouhong_Zhang
 */
import React, { Component } from 'react'
import { Checkbox, Dropdown, Button, Card, Menu, Icon } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/AppGraph.less"
import { getAppOrchfile } from '../../actions/app_manage'

let OrchfileComponent = React.createClass({
  componentWillMount() {
    this.props.getAppOrchfile(this.props.cluster, this.props.appName)
  },
  render: function () {
    if(!this.props.appOrchfile || !this.props.appOrchfile.result
       || this.props.appOrchfile.result.data <=0 ) {
      return  <div className="introBox"></div>
    }
    let content = this.props.appOrchfile.result.data;
    return (
      <div id="AppGraph">
        <div className="bottomBox">
          <span>描述文件&nbsp;:&nbsp;</span>
          <div className="introBox">
           <pre>{content}</pre>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
      </div>
    )
  }
});

function mapStateToProp(state) {
  return {
    appOrchfile: state.apps.appOrchfile
  }
}

OrchfileComponent = connect(mapStateToProp, {
  getAppOrchfile: getAppOrchfile
})(OrchfileComponent)

export default class AppGraph extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <OrchfileComponent  cluster={this.props.cluster} appName={this.props.appName} />
    )
  }
}

AppGraph.propTypes = {
  //
}
