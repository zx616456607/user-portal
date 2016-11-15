/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ComposeGroup component
 *
 * v0.1 - 2016-09-27
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Card } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import filter from 'lodash/filter'

import "./style/ComposeGroup.less"

let MyComponent = React.createClass({
  propTypes : {
    config : React.PropTypes.array
  },
  componentWillMount() {
    const service = this.props.service
    let volumes = service.spec.template.spec.volumes
    const container = service.spec.template.spec.containers[0]
    if(!volumes) {
      this.setState({
        config: []
      })
      return
    }
    const config = []
    let index = 0
    volumes.forEach((volume) => {
      if (volume.configMap) {
        config.push({
          id: ++index,
          mountPod: filter(container.volumeMounts, ['name', volume.name])[0].mountPath,
          group: volume.configMap.name,
          file: volume.configMap.items.map(i => {
            return i.path
          })
        })
      }
    })
    this.setState({
      config
    })
  },
  componentWillReceiveProps(nextProp) {
    const { serviceDetailmodalShow } = nextProp
    if (!serviceDetailmodalShow) {
      this.setState({
        config: []
      })
      return
    }
    const service = nextProp.service
    if(!service.spec) {
      this.setState({
        config: []
      })
      return
    }
    const volumes = service.spec.template.spec.volumes
    const container = service.spec.template.spec.containers[0]
    if (!volumes) {
      this.setState({
        config: []
      })
      return
    }
    const config = []
    let index = 0
    volumes.forEach((volume) => {
      if (volume.configMap) {
        config.push({
          id: ++index,
          mountPod: filter(container.volumeMounts, ['name', volume.name])[0].mountPath,
          group: volume.configMap.name,
          file: volume.configMap.items.map(i => {
            return i.path
          })
        })
      }
    })
    this.setState({
      config
    })
  },
  render : function() {
  let config = this.state.config;
  let items = config.map((item) => {
    return (
      <div className="composeDetail" key={item.id.toString()}>
        <div className="commonData">
          <span>{item.mountPod}</span>
        </div>
        <div className="commonData">
          <span>{item.group}</span>
        </div>
        <div className="composefile commonData">
          <span>{item.file}</span>
        </div>
        <div style={{clear:"both"}}></div>
      </div>
    );
  });
  return (
    <Card className="composeList">
        { items }
    </Card>
    );
  }
});


export default class ComposeGroup extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const parentScope = this;
    return (
      <div id="ComposeGroup">
        <div className="titleBox">
          <div className="commonTitle">
            容器挂载点
          </div>
          <div className="commonTitle">
            配置组
          </div>
          <div className="commonTitle">
            配置文件
          </div>
          <div style={{clear:"both"}}></div>
        </div>
        <MyComponent service={this.props.service} serviceName={this.props.serviceName} cluster={this.props.cluster} serviceDetailmodalShow={this.props.serviceDetailmodalShow}/>
      </div>
    )
  }
}

ComposeGroup.propTypes = {
//
}
