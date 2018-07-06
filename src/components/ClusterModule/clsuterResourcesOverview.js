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
import ImageService from './ImageService'

class ClusterResourcesOverview extends Component{
  constructor(props){
    super(props)
    this.state = {
      //
    }
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
      <ImageService scope={this} cluster={cluster}/>
      <NetworkConfiguration id="Network" cluster={cluster}/>
    </div>
  }
}

export default ClusterResourcesOverview