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
import { loadK8sService, clearK8sService } from '../../../actions/services'
import findIndex from 'lodash/findIndex'

let MyComponent = React.createClass({
  getInitialState() {
    return {}
  },
  propTypes: {
    config: React.PropTypes.array
  },
  componentWillMount() {
    this.props.loadK8sService(this.props.cluster, this.props.serviceName)
  },
  componentWillUnmount() {
    this.props.clearK8sService()
  },
  componentWillReceiveProps(nextProps) {
    const { serviceDetailmodalShow } = nextProps
    if (serviceDetailmodalShow === this.props.serviceDetailmodalShow) {
      return
    }
    if (!serviceDetailmodalShow) {
      return this.props.clearK8sService()
    }
    this.props.loadK8sService(nextProps.cluster, nextProps.serviceName)
  },
  render: function () {
    const {k8sService} = this.props
    if (k8sService.isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (!k8sService.data) {
      return (<div className='loadingBox'>
        无端口
      </div>)
    }
    let property = Object.getOwnPropertyNames(k8sService.data)
    if (property.length === 0) {
      return (<div className='loadingBox'>
        无端口
      </div>)
    }
    const service = k8sService.data[property[0]]
    if (!service.spec) {
      return (
        <div className='loadingBox'>
          无端口
        </div>
      )
    }
    const ports = service.spec.ports
    const annotations = service.metadata.annotations
    let userPort = annotations['tenxcloud.com/schemaPortname']
    if(!userPort)  return (
        <div className='loadingBox'>
          无端口
        </div>
      )
    userPort = userPort.split(',')
    userPort = userPort.map(item => {
      return item.split('/')
    })
    if (ports.length < 1) {
      return (
        <div className='loadingBox'>
          无端口
        </div>
      )
    }
    const items = []
    ports.forEach((item) => {
      const targetPort = findIndex(userPort, i => i[0] == item.name)
      if(targetPort < 0) return 
      const target = userPort[targetPort]
      if(!target) return
      if(target[1].toLowerCase() == 'tcp' && target.length < 3) return
      items.push (
        <div className="portDetail" key={item.name}>
          <div className="commonData">
            <span>{item.name}</span>
          </div>
          <div className="commonData">
            <span>{item.targetPort}</span>
          </div>
          <div className="commonData">
            <span>{target[1]}</span>
          </div>
          <div className="commonData">
            <span>{target[1].toLowerCase() == 'http' ? 80 : target[2]}</span>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
      );
    });
    if(items.length == 0) return (<div className='loadingBox'>
          无端口
        </div>)
    return (
      <Card className="portList">
        {items}
      </Card>
    );
  }
});

function mapSateToProp(state) {
  return {
    k8sService: state.services.k8sService
  }
}

MyComponent = connect(mapSateToProp, {
  loadK8sService,
  clearK8sService
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
            服务端口
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        <MyComponent config={containerList} loading={loading} cluster={this.props.cluster} serviceName={this.props.serviceName} serviceDetailmodalShow={this.props.serviceDetailmodalShow} />
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