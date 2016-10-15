/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ContainerLog component
 *
 * v0.1 - 2016-09-22
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Checkbox, Dropdown, Button, Card, Menu, Icon } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/ContainerLog.less"

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

var MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  onchange: function () {

  },
  render: function () {
    var config = this.props.config;
    var items = config.map((item) => {
      return (
        <div className="logDetail" key={item.id}>
          <div className="iconBox">
            <div className="line"></div>
            <div className={item.status == 1 ? "icon fa fa-check-circle success" : "icon fa fa-times-circle fail"}>
            </div>
          </div>
          <div className="infoBox">
            <div className={item.status == 1 ? "status success" : "status fail"}>
              {item.statusMsg}
            </div>
            <div className="message">
              消息&nbsp;:&nbsp;{item.message}
            </div>
            <div className="createTime">
              {item.createTime}
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

export default class ContainerLog extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="ContainerLog">
        <MyComponent config={data} />
      </div>
    )
  }
}

ContainerLog.propTypes = {
  //
}
