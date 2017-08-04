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

class NetworkIsolation extends Component {
  constructor(props) {
    super(props)
    this.openSetNetwordModal = this.openSetNetwordModal.bind(this)
    this.comfirmSetNetwork = this.comfirmSetNetwork.bind(this)
    this.state = {
      setNetworkVisible: false,
      confirmLoading: false,
      allow: true
    }
  }

  openSetNetwordModal(){
    if(false){
      Modal.info({
        title: '提示',
        content: (
          <div>
            <div>系统管理员未允许当前集群项目间网络隔离，请联系系统管理员更改当前集群网络方案</div>
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
    this.setState({
      setNetworkVisible: false,
      confirmLoading: false,
      allow: !this.state.allow
    })
  }
  
  render() {
    const { allow } = this.props
    return(
      <QueueAnim>
        <Title title="网络隔离"/>
        <div id='network_isolation' key="network_isolation">
          <div className='body'>
            <div className='content'>
              <div className='sketch_map'>
                <img
                  src={ allow ? NetworkAllow : NetworkForbid}
                  alt="网络隔离示意图"
                  className='sketch_map_img'
                />
                {
                  allow
                    ? <span className='allow_arrow'>访问</span>
                    : <span className='forbid_arrow'>禁止访问</span>
                }
              </div>
              <span className='pointer'>·</span>
              当前集群您的服务
              {
                allow
                  ? '可'
                  : '不允许'
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

  return {

  }
}

export default connect(mapStateToProp, {

})(NetworkIsolation)