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
import { Checkbox, Row, Col, Modal } from 'antd'
import './style/NetworkSolutions.less'
import { connect } from 'react-redux'
import { getNetworkSolutions } from '../../actions/cluster_node'
import { updateClusterConfig } from '../../actions/cluster'
import { loadTeamClustersList } from '../../actions/team'
import NotificationHandler from '../../components/Notification'
import { setCurrent } from '../../actions/entities'

class NetworkSolutions extends Component {
	constructor(props){
    super(props)
    this.handlebodyTemplate = this.handlebodyTemplate.bind(this)
    this.handlefooterTemplate = this.handlefooterTemplate.bind(this)
    this.handleCurrentTemplate = this.handleCurrentTemplate.bind(this)
    this.confirmSettingPermsission = this.confirmSettingPermsission.bind(this)
    this.openPermissionModal = this.openPermissionModal.bind(this)
    this.state = {
      permissionVisible: false,
      confirmLoading: false,
    }
  }

  componentWillMount() {
    const { getNetworkSolutions, clusterID } = this.props
    getNetworkSolutions(clusterID)
  }

  handleCurrentTemplate(item) {
    if(item == 'macvlan'){
      return <span><i className="fa fa-check-circle-o check_icon" aria-hidden="true"></i>已启用基于Macvlan的私有网络</span>
    }
    return <span><i className="fa fa-check-circle-o check_icon" aria-hidden="true"></i>已启用基于BGP协议的私有网络</span>
  }

  handlebodyTemplate(){
    const { clusterID, networksolutions, networkPolicySupported } = this.props
    if(!networksolutions[clusterID] || !networksolutions[clusterID].supported){
      return
    }
    let arr = networksolutions[clusterID].supported.map((item, index) => {
      return <Row className='standard' key={'body' + item}>
        <Col span="10">
          <span className='item_header'>网络方案：</span><span className='title'>{item}</span>
          {
            item == networksolutions[clusterID].current
            ? <span className='tips'>{this.handleCurrentTemplate(item)}</span>
            : <span></span>
          }
        </Col>
        <Col className='seconditem' span="5">

          {
            item == networksolutions[clusterID].current
            ? <span>
                <span className='item_header'>该集群：</span>
                <span className='tips' style={{marginLeft: 0}}>
                  <i className="fa fa-check-circle-o check_icon" aria-hidden="true"></i>
                  已启用
                </span>
              </span>
            : <span></span>
          }
        </Col>
        <Col span="9">
          {
            item == 'calico' && <span>
              <span className='item_header'>允许该集群用户变更 inbound 隔离策略：</span>
              <span>
                {
                  networkPolicySupported
                    ? '允许变更'
                    : '禁止变更'
                }
                </span>
              <span className='open_permission' onClick={this.openPermissionModal}>
                {
                  !networkPolicySupported
                  ? '[ 允许变更 ]'
                  : '[ 禁止变更 ]'
                }
              </span>
            </span>
          }
        </Col>


      </Row>
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
          <div className="item"><i className="fa fa-square pointer" aria-hidden="true"></i>基于BGP协议的路由方案，支持细致的ACL控制，适合对隔离要求比较严格的场景，因为不涉及到二层的支持，所以对混合云亲和度比较高。</div>
        </div>
      }
    })
    return arr
  }

  openPermissionModal(){
    this.setState({
      permissionVisible: true,
      confirmLoading: false,
    })
  }

  confirmSettingPermsission(){
    const { networkPolicySupported, updateClusterConfig,
      clusterID, loadTeamClustersList,
      space, setCurrent } = this.props
    let Noti = new NotificationHandler()
    this.setState({
      confirmLoading: true
    })
    let body = {
      networkPolicySupported: !networkPolicySupported
    }
    updateClusterConfig(clusterID, body, {
      success: {
        func: () => {
          let message = '关闭权限成功'
          if(body.networkPolicySupported){
            message = '开启权限成功'
          }
          Noti.success(message)
          this.setState({
            permissionVisible: false,
            confirmLoading: false,
          })
          loadTeamClustersList(space.teamID, { size: 100 }, {
            success: {
              func: () => {
                const { result } = this.props
                for(let i=0; i<result.data.length; i++){
                  if(result.data[i].clusterID == clusterID){
                    setCurrent({
                      cluster: result.data[i],
                    })
                    break
                  }
                }
              },
              isAsync: true,
            }
          })
        },
        isAsync: true,
      },
      failed: {
        func: (res) => {
          this.setState({
            confirmLoading: false,
          })
          let message = '开启权限失败，请重试'
          if(body.networkPolicySupported){
            message = '关闭权限失败，请重试'
          }
          if(res.message){
            message = res.message
          }
          Noti.error(message)
        }
      }
    })
  }

  render(){
    const { networkPolicySupported } = this.props
    return(
      <div id="networksolutions">
        <div className='header'>
          集群网络方案
        </div>
        <div className='body'>
          <Row className='standard' style={{ height: 40}}/>
          {this.handlebodyTemplate()}
        </div>
        <div className="footer">
          {this.handlefooterTemplate()}
        </div>

        <Modal
        	title={<span>{networkPolicySupported ? '关闭' : '开启'}</span>}
        	visible={this.state.permissionVisible}
        	closable={true}
        	onOk={this.confirmSettingPermsission}
        	onCancel={() => this.setState({permissionVisible: false})}
        	maskClosable={false}
        	confirmLoading={this.state.confirmLoading}
        	wrapClassName="set_permission_modal"
          okText={<span>{networkPolicySupported ? '确定' : '已添加，开启允许'}</span>}
          cancelText={<span>{networkPolicySupported ? '取消' : '尚未添加'}</span>}
        >

          {
            networkPolicySupported
              ? <div className='info_box_close'>
                <i className="fa fa-exclamation-triangle warning_icon" aria-hidden="true"></i>
                <div>
                  将关闭『允许当前集群用户开启 inbound 隔离』的功能。
                </div>
              </div>
              : <div className='info_box'>
                <i className="fa fa-exclamation-triangle warning_icon" aria-hidden="true"></i>
                <div>
                  将允许当前集群用户开启 inbound 隔离，请提前保证所有代理出口 ip 添加进策略，具体咨询系统实施工程师。
                </div>
              </div>
          }
        </Modal>
      </div>
    )
  }
}

function mapStateToProp(state, props) {
  const { entities } = state
  const { networksolutions } = state.cluster_nodes || {}
  let networkPolicySupported = false
  let clusterID
  let space = entities.current.space
  const { result } = state.team.teamClusters || {}
  if(entities.current && entities.current.cluster ){
    networkPolicySupported = entities.current.cluster.networkPolicySupported
    clusterID = entities.current.cluster.clusterID
  }
  return {
    networksolutions,
    clusterID,
    space,
    networkPolicySupported,
    result,
  }
}

export default connect(mapStateToProp, {
  getNetworkSolutions,
  updateClusterConfig,
  loadTeamClustersList,
  setCurrent,
})(NetworkSolutions)