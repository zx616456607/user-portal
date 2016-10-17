/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * PortDetail component
 *
 * v0.1 - 2016-09-27
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Card } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/PortDetail.less"

const testData = [];

var MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  render: function () {
    var config = this.props.config;
    if (config.length < 1) {
      return (
        <span>无~</span>
      )
    }
    var items = config.map((item) => {
      return (
        <div className="portDetail" key={item.id}>
          <div className="commonData">
            <span>{item.name}</span>
          </div>
          <div className="commonData">
            <span>{item.port}</span>
          </div>
          <div className="commonData">
            <span>{item.poctoal}</span>
          </div>
          <div className="commonData">
            <span>{item.mapPort}</span>
          </div>
          <div className="serviceUrl commonData">
            <span>{item.serviceUrl}</span>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
      );
    });
    return (
      <Card className="portList">
        {items}
      </Card>
    );
  }
});

export default class PortDetail extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const parentScope = this;
    return (
      <div id="PortDetail">
        <div className="titleBox">
          <div className="commonTitle">
            名称
          </div>
          <div className="commonTitle">
            容器端口
          </div>
          <div className="commonTitle">
            协议
          </div>
          <div className="commonTitle">
            映射端口
          </div>
          <div className="serviceUrl commonTitle">
            服务地址
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        <MyComponent config={testData} />
      </div>
    )
  }
}

PortDetail.propTypes = {
  //
}
