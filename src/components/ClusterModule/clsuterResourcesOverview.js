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
import './style/clusterResourcesOverview.less'
import ClusterInfo from './ClusterInfo'
import NetworkConfiguration from './NetworkConfiguration'

class ClusterResourcesOverview extends Component{
  constructor(props){
    super(props)
    this.state = {

    }
  }

  render(){
    return <div id="cluster__resourcesoverview">
      资源总览
    </div>
  }
}

export default ClusterResourcesOverview