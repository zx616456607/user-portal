/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Network Solutions component
 *
 * v0.1 - 2017-1-22
 * @author ZhangChengZheng
 */
import React, { Component, PropTypes } from 'react'
import { Checkbox } from 'antd'
import './style/NetworkSolutions.less'
import { connect } from 'react-redux'
import { getNetworkSolutions } from '../../actions/cluster_node'

class NetworkSolutions extends Component {
	constructor(props){
    super(props)
    this.handlebodyTemplate = this.handlebodyTemplate.bind(this)
    this.handlefooterTemplate = this.handlefooterTemplate.bind(this)
    this.state = {

    }
  }

  componentWillMount() {
    const { getNetworkSolutions, clusterID } = this.props
    getNetworkSolutions(clusterID)
  }

  handlebodyTemplate(){
    const { clusterID, networksolutions } = this.props
    if(!networksolutions[clusterID] || !networksolutions[clusterID].supported){
      return
    }
    let arr = networksolutions[clusterID].supported.map((item, index) => {
      return <div className='standard' key={'body' + item}>
        <div className='item firstitem'>
          <span className='title'>{item}</span>
          {
            item == networksolutions[clusterID].current
            ? <span className='tips'>已打开固定服务内『容器实例IP』，且保留IP超时时间50min</span>
            : <span></span>
          }
        </div>
        <div className='item seconditem'>
          {
            item == networksolutions[clusterID].current
            ? <Checkbox checked></Checkbox>
            : <span></span>
          }
        </div>
      </div>
    })
    return arr
  }

  handlefooterTemplate(){
    const { clusterID, networksolutions } = this.props
    if(!networksolutions[clusterID] || !networksolutions[clusterID].supported){
      return
    }
    let arr = networksolutions[clusterID].supported.map((item, index) => {
      if(item == 'macvlan'){
        return <div className="standard" key={'footer' + item}>
          <div className="title">Macvlan</div>
          <div className="item"><i className="fa fa-square pointer" aria-hidden="true"></i>基于二层隔离，所以需要二层路由支持，对物理网络基础设施依赖程度最高，从逻辑和Kemel层来看隔离性和性能最优的方案 ，大多数云服务商不支持，所以混合云上比较难以实现。</div>
          <div className="item seconditem"><i className="fa fa-square pointer" aria-hidden="true"></i>固定容器实例IP：即固定服务内『容器实例』的IP，且设有一定的超时时间，如容器重启、容器删除后服务重新扩容实例个数、容器重新部署，会在超时时间之内保证服务内容器实例IP不变。</div>
        </div>
      }
      if(item == 'calico'){
        return <div className="standard" key={'footer' + item}>
          <div className="title">Calico</div>
          <div className="item"><i className="fa fa-square pointer" aria-hidden="true"></i>已打开基于BGP协议的私有网络，支持细致的ACL控制，适合对隔离要求比较严格的场景，因为不涉及到二层的支持，所以对混合云亲和度比较高。</div>
        </div>
      }
    })
    return arr
  }

  render(){
    return(
      <div id="networksolutions">
        <div className='header'>
          集群网络方案
        </div>
        <div className='body'>
          <div className='title standard'>
            <div className='item firstitem'>网络方案</div>
            <div className='item seconditem'>该集群</div>
          </div>
          {this.handlebodyTemplate()}
        </div>
        <div className="footer">
          {this.handlefooterTemplate()}
        </div>
      </div>
    )
  }
}

function mapStateToProp(state, props) {
  const { networksolutions } = state.cluster_nodes || {}
  return {
    networksolutions,
  }
}

export default connect(mapStateToProp, {
  getNetworkSolutions,
})(NetworkSolutions)