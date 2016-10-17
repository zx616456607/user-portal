/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppLog component
 *
 * v0.1 - 2016-09-11
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Checkbox, Dropdown, Button, Card, Menu, Icon } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/AppLog.less"
import { appLogs } from '../../actions/app_manage'
const data = [{
  id: "1",
  message: "今天我挺萌的",
  status: "1",
  statusMsg: "卖萌成功",
  createTime: "2016-09-09 11:27:27",
}, {
  id: "2",
  message: "今天我挺萌的",
  status: "1",
  statusMsg: "卖萌成功",
  createTime: "2016-09-10 11:27:27",
}, {
  id: "3",
  message: "今天我挺萌的",
  status: "0",
  statusMsg: "卖萌失败",
  createTime: "2016-09-11 11:27:27",
}, {
  id: "4",
  message: "今天我挺萌的",
  status: "0",
  statusMsg: "卖萌失败",
  createTime: "2016-09-12 11:27:27",
}, {
  id: "5",
  message: "今天我没吃药",
  status: "0",
  statusMsg: "卖萌失败",
  createTime: "2016-09-09 11:27:27",
}, {
  id: "6",
  message: "今天我挺萌的",
  status: "1",
  statusMsg: "卖萌成功",
  createTime: "2016-09-09 11:27:27",
}, {
  id: "7",
  message: "今天我没吃药",
  status: "1",
  statusMsg: "卖萌成功",
  createTime: "2016-09-09 11:27:27",
}, {
  id: "8",
  message: "今天我没吃药",
  status: "0",
  statusMsg: "卖萌失败",
  createTime: "2016-09-09 11:27:27",
}];

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  componentWillMount() {
    this.props.getAppLogs(this.props.cluster, this.props.appName)
  },
  onchange: function () {

  },
  render: function () {
    if(!this.props.appLogs || !this.props.appLogs.result || this.props.appLogs.result.data <=0 ) {
      return  <div className="logDetail"></div>
    }
    const logs = this.props.appLogs.result.data
    const items = logs.map((item, index) => {
      return (
        <div className="logDetail" key={index}>
          <div className="iconBox">
            <div className="line"></div>
            <div className={item.result === 'success' ? "icon fa fa-check-circle success" : "icon fa fa-times-circle fail"}>
            </div>
          </div>
          <div className="infoBox">
            <div className={item.result === 'success' ? "status success" : "status fail"}>
              {`${item.operation} ${item.result}`}
            </div>
            <div className="message">
              { !item.detail ? '' : `消息&nbsp;:&nbsp${item.detail}`}
            </div>
            <div className="createTime">
              {item.time}
            </div>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
      );
    });
    return (
      <div className="logBox">
        {items}
      </div>
    );
  }
});
function mapStateToProp(state) {
  return {
    appLogs: state.apps.appLogs
  }
}
MyComponent = connect(mapStateToProp, {
  getAppLogs: appLogs
})(MyComponent)

export default class AppLog extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="AppLog">
        <MyComponent  cluster={this.props.cluster} appName={this.props.appName} />
      </div>
    )
  }
}

AppLog.propTypes = {
  //
}
