/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster plugin component
 *
 * v2.2 - 2017-5-3
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import './style/clusterPlugin.less'

class ClusterPlugin extends Component{
  constructor(props){
    super(props)
    this.state = {

    }
  }

  render(){
    return <div id="cluster_clusterplugin">
      集群标签
    </div>
  }
}

export default ClusterPlugin