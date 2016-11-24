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
import { Card, Spin, Modal } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import filter from 'lodash/filter'
import { loadConfigName } from '../../../actions/configs.js'
import "./style/ComposeGroup.less"

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  componentWillMount() {
    const service = this.props.service
    let volumes = service.spec.template.spec.volumes
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
	loadConfigData(group, name) {
    const self = this
    this.props.loadConfigName(this.props.cluster, { group, Name: name }, {
      success: {
        func: (result) => {
          Modal.confirm({
            title: '配置文件',
            content: <pre>{result.data}</pre>,
            okText: '确定'
          })
        }
      }
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
    if (!service.spec) {
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
  render: function () {
    const configData = this.props.configData[this.props.cluster]
    let loading = ''
    if(configData) {
      const { isFetching } = configData
      
      if(isFetching) {
        loading= <div className="loadingBox" style={{position: 'absolute'}}><Spin size="large" /></div>
      }
    }
    let config = this.state.config;
    if (config.length == 0) {
      return (
        <Card className="composeList">
        {loading}
        <div style={{lineHeight:'60px'}}>暂无配置</div>
      </Card>
      )
    }
    let items = config.map((item) => {
      return (
        <div className="composeDetail" key={item.id.toString() }>
          <div className="commonData">
            <span>{item.mountPod}</span>
          </div>
          <div className="commonData">
            <span>{item.group}</span>
          </div>
          <div className="composefile commonData" onClick={() => this.loadConfigData(item.group, item.file) }>
            <span>{item.file}</span>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
      );
    });
    return (
      <Card className="composeList">
        {loading}
        { items }
      </Card>
    );
  }
});

function mapStateToProps(state, props) {
  return {
	   cluster: state.entities.current.cluster.clusterID,
				configData: state.configReducers.loadConfigName
		}
}

MyComponent = connect(mapStateToProps, {
  loadConfigName
})(MyComponent)

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
          <div style={{ clear: "both" }}></div>
        </div>
        <MyComponent service={this.props.service} serviceName={this.props.serviceName} cluster={this.props.cluster} serviceDetailmodalShow={this.props.serviceDetailmodalShow}/>
      </div>
    )
  }
}

ComposeGroup.propTypes = {
  //
}
