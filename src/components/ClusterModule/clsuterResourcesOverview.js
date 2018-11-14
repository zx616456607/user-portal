/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster Resources Overview component
 *
 * v0.1 - 2017-5-3
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { Row, Col, Card } from 'antd'
import './style/clusterResourcesOverview.less'
import ClusterInfo from './ClusterInfo'
import NetworkConfiguration from './NetworkConfiguration'
import ResourcesOverview from './ResourcesOverview'

class ClusterResourcesOverview extends Component{
  constructor(props){
    super(props)
    this.state = {
      refreshNetworkConfig: false,
    }
  }
  refreshNetworkConfig() {
    this.setState({
      // 子组件NetworkConfiguration添加网络出口后会遇到再次添加失败的问题(问题的原因很复杂), 暂时使用卸载并重新渲染组件的方式解决
      refreshNetworkConfig: true,
    })
    this.refreshNetworkTimer = setTimeout(() => {
      this.setState({
        refreshNetworkConfig: false
      })
    }, 10)
  }
  componentWillUnmount() {
    this.refreshNetworkTimer && clearTimeout(this.refreshNetworkTimer)
  }
  render(){
    const {
      intl, isFetching, nodes,
      clusterID, memoryMetric, cpuMetric,
      license, kubectlsPods, addNodeCMD,
      cluster, clusterSummary,
    } = this.props
    return <div id="cluster__resourcesoverview">
      <ClusterInfo cluster={cluster}/>
      <ResourcesOverview clusterSummary={clusterSummary} cluster={cluster} />
      {
        !this.state.refreshNetworkConfig &&
        <NetworkConfiguration
          refreshComponent={this.refreshNetworkConfig.bind(this)}
          id="Network"
          cluster={cluster}/>
      }
    </div>
  }
}

export default ClusterResourcesOverview
