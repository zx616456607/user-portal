/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Advanced Setting component
 *
 * v0.1 - 2017-5-10
 * @author ZhangChengZheng
 */
import React, { Component, propTypes } from 'react'
import { Switch, Checkbox, Spin, Modal, Icon } from 'antd';
import './style/AdvancedSetting.less'
import { connect } from 'react-redux'
import { updateClusterConfig } from '../../../actions/cluster'
import NotificationHandler from '../../../common/notification_handler'

class AdvancedSetting extends Component {
  constructor(props){
    super(props)
    this.handleSwitch = this.handleSwitch.bind(this)
    this.handleName = this.handleName.bind(this)
    this.handleTag = this.handleTag.bind(this)
    this.updataClusterListNodes = this.updataClusterListNodes.bind(this)
    this.handleConfirmSwitch = this.handleConfirmSwitch.bind(this)
    this.handleCancelSwitch = this.handleCancelSwitch.bind(this)
    this.handleListNodeStatus = this.handleListNodeStatus.bind(this)
    this.handleUpdataConfigMessage = this.handleUpdataConfigMessage.bind(this)
    this.state = {
      swicthChecked: true,
      switchVisible : false ,
      Ipdisabled : false ,
      Tagdisabled : false ,
      switchdisable : false ,
      Ipcheckbox : false,
      TagCheckbox : false,
    }
  }
  
  componentWillMount(){
    document.title = '高级设置 | 时速云'
    const { cluster } = this.props
    const { listNodes } = cluster
    this.handleListNodeStatus(listNodes)
  }

  handleUpdataConfigMessage(status,num){
    const Notification = new NotificationHandler()
    if(status == 'success'){
      switch(num){
        case 1 :
          return Notification.success('关闭绑定节点成功！')
        case 2 :
          return Notification.success('开启【主机名及IP】绑定成功！')
        case 3 :
          return Notification.success('开启【主机标签】绑定成功！')
        case 4 :
          return Notification.success('开启【主机名及IP】与【主机标签】绑定成功！')
        default :
          return
      }
    }
    if(status == 'failed'){
      switch(num){
        case 1 :
          return Notification.success('关闭绑定节点失败！')
        case 2 :
          return Notification.success('开启【主机名及IP】绑定失败！')
        case 3 :
          return Notification.success('开启【主机标签】绑定失败！')
        case 4 :
          return Notification.success('开启【主机名及IP】与【主机标签】绑定失败！')
        default :
          return
      }
    }
  }

  handleListNodeStatus(listNodes){
    switch(listNodes){
      case 0 :
      case 1 :
        return this.setState({
          swicthChecked: false,
        })
      case 2 :
        return this.setState({
          swicthChecked : true,
          Ipcheckbox : true,
          TagCheckbox : false,
        })
      case 3 :
        return this.setState({
          swicthChecked : true,
          Ipcheckbox : false,
          TagCheckbox : true,
        })
      case 4 :
        return this.setState({
          swicthChecked : true,
          Ipcheckbox : true,
          TagCheckbox : true,
        })
      default:
        return
    }
  }

  componentWillReceiveProps(nextProps){
    const num = nextProps.cluster.listNodes
    if(!this.props.cluster.listNodes || this.props.cluster.clusterID !== nextProps.cluster.clusterID || this.props.cluster.listNodes !== nextProps.cluster.listNodes){
      this.handleListNodeStatus(num)
    }
  }
  
  updataClusterListNodes(num){
    const {updateClusterConfig, cluster} = this.props
    const {clusterID} = cluster
    updateClusterConfig(clusterID, {ListNodes: num}, {
      success: {
        func: () =>{
          this.handleUpdataConfigMessage('success',num)
          this.setState({
            switchdisable : false,
            Tagdisabled : false,
            Ipdisabled : false,
          })
          this.handleListNodeStatus(num)
        }
      },
      falied: {
        func : () => {
          this.handleUpdataConfigMessage('failed',num)
          this.setState({
            switchdisable : false,
            Tagdisabled : false,
            Ipdisabled : false,
          })
        }
      }
    })
  }

  handleSwitch(){
    return this.setState({
      switchVisible : true,
      switchdisable : true,
      Ipdisabled : true,
      Tagdisabled : true,
    })
  }

  handleConfirmSwitch(){
    const { swicthChecked } = this.state
    this.setState({
      switchVisible : false
    })
    if(swicthChecked == true){
      this.updataClusterListNodes(1)
      return
    }
    if(swicthChecked == false){
      this.updataClusterListNodes(2)
      return
    }
  }

  handleCancelSwitch(){
    this.setState({
      switchVisible : false,
      switchdisable : false,
      Ipdisabled : false ,
      Tagdisabled : false ,
    })
  }

  handleName(){
    const { Ipcheckbox, TagCheckbox } = this.state
    this.setState({
      Ipdisabled : true,
      Tagdisabled : true,
    })
    if(TagCheckbox == true ){
      switch(Ipcheckbox){
        case true :
          return this.updataClusterListNodes(3)
        case false :
          return this.updataClusterListNodes(4)
        default :
          return
      }
    }
    if(TagCheckbox == false){
      switch(Ipcheckbox){
        case true :
          return this.updataClusterListNodes(1)
        case false :
        default :
          return
      }
    }
  }

  handleTag(){
    const { Ipcheckbox, TagCheckbox } = this.state
    this.setState({
      Ipdisabled : true,
      Tagdisabled : true,
    })
    if(Ipcheckbox == true ){
      switch(TagCheckbox){
        case true :
          return this.updataClusterListNodes(2)
        case false :
          return this.updataClusterListNodes(4)
        default :
          return
      }
    }
    if(Ipcheckbox == false){
      switch(TagCheckbox){
        case true :
          return this.updataClusterListNodes(1)
        case false :
          return this.updataClusterListNodes(3)
        default :
          return
      }
    }
  }

  render(){
    const { swicthChecked, Ipcheckbox, TagCheckbox, switchdisable, Tagdisabled, Ipdisabled } = this.state
    const { cluster } = this.props
    const { listNodes } = cluster
    return (<div id="AdvancedSetting">
      <div className='title'>高级设置</div>
      <div className='content'>
        <div className='contentheader'>允许用户绑定节点（所有集群）</div>
        <div className='contentbody'>
          <div className='contentbodytitle alertRow'>
            即创建服务时，可以将服务对应容器实例，固定在节点或者某些『标签』的节点上来调度
          </div>
          {
            listNodes || listNodes == 0
              ? <div>
              <div className='contentbodycontainers'>
            <span>
              {
                swicthChecked
                  ? <span>开启</span>
                  : <span>关闭</span>
              }
              绑定节点</span>
                <Switch checked={swicthChecked} onChange={this.handleSwitch} className='switchstyle' disabled={switchdisable}/>
              </div>
              {
                swicthChecked
                  ? <div className='contentfooter'>
                  <div className='item'>
                    <Checkbox onChange={this.handleName}
                      checked={ Ipcheckbox } disabled={Ipdisabled}>允许用户通过『主机名及IP』来实现绑定【单个节点】</Checkbox>
                  </div>
                  <div className='item'>
                    <Checkbox onChange={this.handleTag}
                      checked={ TagCheckbox } disabled={Tagdisabled}>用户可通过『主机标签』绑定【某类节点】</Checkbox>
                  </div>
                </div>
                  : <div></div>
              }
            </div>
              : <div className='nodata'><Spin></Spin></div>
          }
        </div>
      </div>

      <Modal
        title={swicthChecked ? '关闭绑定节点' : '开启绑定节点'}
        visible={this.state.switchVisible}
        maskClosable={false}
        wrapClassName="AdvancedSettingSwitch"
        onOk={this.handleConfirmSwitch}
        onCancel={this.handleCancelSwitch}
      >
        {
          swicthChecked
          ?<div className='container'>
            <div className='item'>关闭绑定节点，平台用户将不可以把某个服务的容器实例，绑定到固定主机节点上</div>
            <div className='item color'><Icon type="question-circle-o" style={{marginRight:'8px'}}/>确认关闭绑定节点功能？</div>
          </div>
          : <div className='container'>
            <div className='item'>开启绑定节点，平台用户将可以把某个服务的容器实例，绑定到固定主机节点上</div>
            <div className='item color'><Icon type="question-circle-o" style={{marginRight:'8px'}}/>确认开启允许绑定节点功能？</div>
          </div>
        }
      </Modal>
    </div>)
  }
}

function mapPropsToState(state,props) {
  const { cluster } = state.entities.current
  return {
    cluster,
  }
}

export default connect(mapPropsToState,{
  updateClusterConfig,
})(AdvancedSetting)