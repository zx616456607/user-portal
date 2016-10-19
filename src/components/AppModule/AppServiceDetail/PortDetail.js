/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * PortDetail component
 *
 * v0.1 - 2016-09-27
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Card, Spin } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/PortDetail.less"

const testData = [];

// 需要后端提供获取服务的 service 的 API ！！！


const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  render: function () {
    const {config, loading} = this.props
    if (loading) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    const ports = []
    if (ports.length < 1) {
      return (
        <div className='loadingBox'>
          无端口
        </div>
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

class PortDetail extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { containerList, loading } = this.props
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
        <MyComponent config={containerList} loading={loading} />
      </div>
    )
  }
}

PortDetail.propTypes = {
  cluster: PropTypes.string.isRequired,
  serviceName: PropTypes.string.isRequired,
  container: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
}

export default PortDetail