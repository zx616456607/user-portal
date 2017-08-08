/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Network Isolation component
 *
 * v0.1 - 2017-8-4
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Button, Modal } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import './style/index.less'
import Title from '../../Title'
import NetworkAllow from '../../../assets/img/app/networkAllow.png'
import NetworkForbid from '../../../assets/img/app/networkForbid.png'
import NotificationHandler from '../../../components/Notification'
import { getNetworkIsolationStatus, postNetworkIsolation, deleteNetworkIsolation } from '../../../actions/app_manage'

class NetworkIsolation extends Component {
  constructor(props) {
    super(props)
    this.openSetNetwordModal = this.openSetNetwordModal.bind(this)
    this.comfirmSetNetwork = this.comfirmSetNetwork.bind(this)
    this.getNetworkIsolationStatus = this.getNetworkIsolationStatus.bind(this)
    this.state = {
      setNetworkVisible: false,
      confirmLoading: false,
      allow: false
    }
  }
  
  getNetworkIsolationStatus(){
    const { getNetworkIsolationStatus, clusterID, namespace } = this.props
    let body = {
      clusterID,
      namespace,
    }
    getNetworkIsolationStatus(body, {
      success: {
        func: (res) => {
          if(res.rule && res.rule.policy === 'allow' && res.rule.targets[0] === namespace){
            this.setState({
              allow: true
            })
          }
        }
      }
    })
  }

  componentWillMount() {
    this.getNetworkIsolationStatus()
  }

  openSetNetwordModal(){
    const { networkPolicySupported } = this.props
    if(!networkPolicySupported){
      Modal.info({
        title: '提示',
        content: (
          <div>
            <div>系统管理员未允许变更当前集群的网络隔离策略，请联系系统管理员开启『基础设施→网络方案』的允许变更开关。</div>
          </div>
        ),
        onOk() {},
      });
      return
    }
    this.setState({
      setNetworkVisible: true,
      confirmLoading: false,
    })
  }

  comfirmSetNetwork(){
    const { postNetworkIsolation, clusterID, namespace, deleteNetworkIsolation } = this.props
    const { allow } = this.state
    let Noti = new NotificationHandler()
    let postBody = {
      clusterID,
      namespace,
      body: {
        "rule": {
          "policy": "allow",
          "targets": [`${namespace}`]
        }
      }
    }
    if(allow){
      let deleteBody = {
        clusterID,
        namespace,
      }
      deleteNetworkIsolation(deleteBody, {
        success: {
          func: () => {
            Noti.success('关闭网络 inbound 隔离成功')
            this.setState({
              setNetworkVisible: false,
              confirmLoading: false,
              allow: false,
            })
          },
          isAsync: true,
        },
        failed: {
          func: (res) => {
            let message = `关闭网络 inbound 隔离失败，请重试`
            if(res.message){
              message = res.message
            }
            this.setState({
              confirmLoading: false
            })
            Noti.error(message)
          }
        }
      })
      return
    }
    postNetworkIsolation(postBody, {
      success: {
        func: () => {
          Noti.success('开启网络 inbound 隔离成功')
          this.setState({
            confirmLoading: false,
            setNetworkVisible: false,
            allow: true
          })
        },
        isAsync: true,
      },
      failed: {
        func: (res) => {
          let message = `开启网络 inbound 隔离失败，请重试`
          if(res.message){
            message = res.message
          }
          this.setState({
            confirmLoading: false
          })
          Noti.error(message)
        }
      }
    })
  }
  
  render() {
    const { allow } = this.state
    return(
      <QueueAnim>
        <Title title="网络隔离"/>
        <div id='network_isolation' key="network_isolation">
          <div className='body'>
            <div className='content'>
              <div className='sketch_map'>
                <img
                  src={ allow ? NetworkForbid : NetworkAllow}
                  alt="网络隔离示意图"
                  className='sketch_map_img'
                />
                {
                  allow
                  ? <span className='forbid_arrow'>禁止访问</span>
                  : <span className='allow_arrow'>访问</span>
                }
              </div>
              <span className='pointer'>·</span>
              当前集群您的服务
              {
                allow
                  ? '不允许'
                  : '可'
              }
              被同一集群其他用户或项目的服务访问
            </div>
          </div>
          <div className="footer">
            <Button type="primary" size="large" onClick={this.openSetNetwordModal}>
              {
                allow
                  ? <span>关闭网络 inbound 隔离</span>
                  : <span>开启网络 inbound 隔离</span>
              }
            </Button>
          </div>


          <Modal
            title={<span>{allow ? '关闭' : '开启'}网络 inbound 隔离</span>}
            visible={this.state.setNetworkVisible}
            closable={true}
            onOk={this.comfirmSetNetwork}
            onCancel={() => this.setState({setNetworkVisible: false})}
            maskClosable={false}
            confirmLoading={this.state.confirmLoading}
            wrapClassName="set_network_isolation"
          >
            <div className='info_box'>
              <i className="fa fa-exclamation-triangle warning_icon" aria-hidden="true"></i>
              {
                allow
                  ? <div>
                    关闭后，您的服务将允许被同一集群其他用户或项目访问。<br/>
                    确认关闭网络 inbound 隔离？
                  </div>
                  : <div>
                    开启后，将无法被同一集群其他用户或项目的服务访问。<br/>
                    确认开启网络 inbound 隔离？
                  </div>
              }
            </div>
          </Modal>
        </div>
      </QueueAnim>

    )
  }
}

function mapStateToProp(state, props) {
  const { entities } = state
  let networkPolicySupported = false
  let clusterID
  let namespace
  if(entities.current && entities.current.cluster){
    networkPolicySupported = entities.current.cluster.networkPolicySupported
    clusterID = entities.current.cluster.clusterID
  }
  if(entities.current && entities.current.space){
    namespace = entities.current.space.namespace
  }
  return {
    networkPolicySupported,
    clusterID,
    namespace,
  }
}

export default connect(mapStateToProp, {
  getNetworkIsolationStatus,
  postNetworkIsolation,
  deleteNetworkIsolation,
})(NetworkIsolation)