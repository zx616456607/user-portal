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
    const { cluster } = this.props
    console.log('this.props=',this.props)
    return <div id="cluster__resourcesoverview">
      <ClusterInfo cluster={cluster}/>
    </div>
  }
}

export default ClusterResourcesOverview