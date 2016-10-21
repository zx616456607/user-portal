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
import { loadServicePorts, clearServicePorts } from '../../../actions/services'

const testData = [];

// 需要后端提供获取服务的 service 的 API ！！！


let MyComponent = React.createClass({
  getInitialState(){
    return {}
  },
  propTypes: {
    config: React.PropTypes.array
  },
  componentWillMount() {
    this.props.loadServicePorts(this.props.cluster, this.props.serviceName)
  },
  componentWillUnmount() {
    this.props.clearServicePorts()
  },
  componentWillReceiveProps(nextProps) {
    const { serviceDetailmodalShow } = nextProps
    if (serviceDetailmodalShow === this.props.serviceDetailmodalShow) {
      return
    }
    if(!serviceDetailmodalShow) {
      return this.props.clearServicePorts()
    }
    this.props.loadServicePorts(nextProps.cluster, nextProps.serviceName)
  },
  render: function () {
    const {servicePorts} = this.props
    if (servicePorts.isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if(!servicePorts.data) {
      return (<div className='loadingBox'>
        无端口
      </div>)
    }
    let property = Object.getOwnPropertyNames(servicePorts.data)
    if(property.length === 0) {
      return (<div className='loadingBox'>
        无端口
      </div>)
    }
    const service = servicePorts.data[property[0]]
    if(!service.spec) {
      return (
        <div className='loadingBox'>
          无端口
        </div>
      )
    }
    const ports = service.spec.ports
    if (ports.length < 1) {
      return (
        <div className='loadingBox'>
          无端口
        </div>
      )
    }
    var items = ports.map((item) => {
      return (
        <div className="portDetail" key={item.name}>
          <div className="commonData">
            <span>{item.name}</span>
          </div>
          <div className="commonData">
            <span>{item.targetPort}</span>
          </div>
          <div className="commonData">
            <span>{item.protocol}</span>
          </div>
          <div className="commonData">
            <span>{item.port}</span>
          </div>
          <div className="serviceUrl commonData">
            <span>-</span>
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

function mapSateToProp(state) {
  return {
    servicePorts: state.services.servicePorts
  }
}

MyComponent = connect(mapSateToProp, {
  loadServicePorts,
  clearServicePorts
})(MyComponent)

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
        <MyComponent config={containerList} loading={loading} cluster={this.props.cluster} serviceName={this.props.serviceName} serviceDetailmodalShow={this.props.serviceDetailmodalShow}/>
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