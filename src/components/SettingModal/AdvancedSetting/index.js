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
import { Switch, Checkbox, Spin, Modal, Icon, Form, Radio, Button, Card } from 'antd';
import './style/AdvancedSetting.less'
import { connect } from 'react-redux'
import { updateClusterConfig } from '../../../actions/cluster'
import { setCurrent } from '../../../actions/entities'
import { updateConfigurations, getConfigurations } from '../../../actions/harbor'
import { saveGlobalConfig, getConfigByType, updateGlobalConfig } from '../../../actions/global_config'
import { loadLoginUserDetail } from '../../../actions/entities'
import NotificationHandler from '../../../components/Notification'
import { DEFAULT_REGISTRY } from '../../../constants'
import Title from '../../Title'
import QueueAnim from 'rc-queue-anim'

class AdvancedSetting extends Component {
  constructor(props){
    super(props)
    this.handleSwitch = this.handleSwitch.bind(this)
    this.handleTradition = this.handleTradition.bind(this)
    this.handleName = this.handleName.bind(this)
    this.handleTag = this.handleTag.bind(this)
    this.updataClusterListNodes = this.updataClusterListNodes.bind(this)
    this.handleConfirmTradition = this.handleConfirmTradition.bind(this)
    this.handleCancelTradition = this.handleCancelTradition.bind(this)
    this.handleConfirmSwitch = this.handleConfirmSwitch.bind(this)
    this.handleCancelSwitch = this.handleCancelSwitch.bind(this)
    this.handleListNodeStatus = this.handleListNodeStatus.bind(this)
    this.handleUpdataConfigMessage = this.handleUpdataConfigMessage.bind(this)
    this.handleImageProjectRight = this.handleImageProjectRight.bind(this)
    this.handleCancelImageProjectRight = this.handleCancelImageProjectRight.bind(this)
    this.handleSaveImageProjectRight = this.handleSaveImageProjectRight.bind(this)
    this.state = {
      swicthChecked: true,
      switchVisible: false,
      Ipdisabled: false,
      Tagdisabled: false,
      switchdisable: false,
      Ipcheckbox: false,
      TagCheckbox: false,
      confirmlodaing: false,
      imageProjectRightIsEdit: false,
      traditionDisable: false,
      traditionVisible: false,
      traditionBtnLoading: false,
      traditionChecked: props.vmWrapConfig.enabled || false,
      isTradition: false,
    }
  }

  componentWillMount(){
    const { cluster, getConfigurations, harbor, billingConfig } = this.props
    const { listNodes } = cluster
    this.handleListNodeStatus(listNodes)
    if(!harbor.hasAdminRole) {
      return
    }
    getConfigurations(DEFAULT_REGISTRY, {
      success: {
        func: (res) => {
          let projectCreationRestriction = res.data.projectCreationRestriction
          if (!projectCreationRestriction) {
            projectCreationRestriction = {
              editable: false,
              value: 'adminonly'
            }
          }
          this.setState({
            currentRepoAuth: projectCreationRestriction.value
          })
        }
      },
      failed: {
        func: (res) => {
          const notification = new NotificationHandler()
          let message = '获取仓库组权限信息失败'
          if (res.statusCode && res.statusCode == 403) {
            message = '没有权限获取仓库组权限信息'
          }
          notification.error(message)
        }
      }
    })
    const { enabled } = billingConfig
    this.setState({
      billingChecked: enabled
    })
  }
  handleUpdataConfigMessage(status,num){
    const Notification = new NotificationHandler()
    if(status == 'success'){
      switch(num){
        case 1:
          return Notification.success('关闭绑定节点成功！')
        case 2:
          return Notification.success('开启【主机名及IP】绑定成功！')
        case 3:
          return Notification.success('开启【主机标签】绑定成功！')
        case 4:
          return Notification.success('开启【主机名及IP】与【主机标签】绑定成功！')
        default:
          return
      }
    }
    if(status == 'failed'){
      switch(num){
        case 1:
          return Notification.success('关闭绑定节点失败！')
        case 2:
          return Notification.success('开启【主机名及IP】绑定失败！')
        case 3:
          return Notification.success('开启【主机标签】绑定失败！')
        case 4:
          return Notification.success('开启【主机名及IP】与【主机标签】绑定失败！')
        default:
          return
      }
    }
  }

  handleTraditionMessage(num){
    const Notification = new NotificationHandler()
    switch (num){
      case 1:
        return Notification.success('关闭【传统应用管理】成功！')
      case 2:
        return Notification.success('开启【传统应用管理】成功！')
    }
  }

  handleListNodeStatus(listNodes){
    switch(listNodes){
      case 0:
      case 1:
        return this.setState({
          swicthChecked: false,
        })
      case 2:
        return this.setState({
          swicthChecked: true,
          Ipcheckbox: true,
          TagCheckbox: false,
        })
      case 3:
        return this.setState({
          swicthChecked: true,
          Ipcheckbox: false,
          TagCheckbox: true,
        })
      case 4:
        return this.setState({
          swicthChecked: true,
          Ipcheckbox: true,
          TagCheckbox: true,
        })
      default:
        return this.setState({
          swicthChecked: false,
        })
    }
  }

  componentWillReceiveProps(nextProps){
    const num = nextProps.cluster.listNodes
    if(!this.props.cluster.listNodes || this.props.cluster.clusterID !== nextProps.cluster.clusterID || this.props.cluster.listNodes !== nextProps.cluster.listNodes){
      this.handleListNodeStatus(num)
    }
  }

  updataClusterListNodes(num){
    const {updateClusterConfig, cluster, setCurrent} = this.props
    const {clusterID} = cluster
    this.setState({
      confirmlodaing: true
    })
    updateClusterConfig(clusterID, {ListNodes: num}, {
      success: {
        func: () =>{
          cluster.listNodes = num
          setCurrent({
            cluster,
          })
          this.handleUpdataConfigMessage('success',num)
          this.setState({
            switchdisable: false,
            Tagdisabled: false,
            Ipdisabled: false,
            confirmlodaing: false
          })
          this.handleListNodeStatus(num)
        },
        isAsync: true
      },
      falied: {
        func: () => {
          this.handleUpdataConfigMessage('failed',num)
          this.setState({
            switchdisable: false,
            Tagdisabled: false,
            Ipdisabled: false,
          })
        }
      }
    })
  }

  TraditionState(ListNode){
    switch (ListNode){
      case 1:
        this.setState({
          traditionChecked: false,
        })
        this.handleTraditionMessage(ListNode)
        return
      case 2:
        this.setState({
          traditionChecked: true,
        })
        this.handleTraditionMessage(ListNode)
        return
      default:
        return this.setState({
          traditionChecked: false,
        })
    }
  }

  handleSwitch(){
    return this.setState({
      switchVisible: true,
      switchdisable: true,
      Ipdisabled: true,
      Tagdisabled: true,
    })
  }
  vmInfo(){
    Modal.info({
      title: '请先完成全局配置内传统应用配置',
    });
  }
  /**
   * 传统应用管理
   */
  handleTradition (checked){
    const { vmWrapConfig } = this.props
    const { host } = vmWrapConfig || { host: '' }
    if (!host) {
      this.vmInfo()
      return
    }
    return this.setState({
      traditionVisible: true,
      isTradition: checked,
    })
  }
  /**
   * 计费功能
   */
  handleBilling = () => {
    this.setState({
      billingVisible: true,
      // billingChecked: checked
    })
  }
  
  cancelBilling = () => {
    this.setState({
      billingVisible: false
    })
  }
  
  confirmBilling = () => {
    const { billingChecked } = this.state
    const { updateGlobalConfig, cluster, billingConfig, loadLoginUserDetail } = this.props
    let notify = new NotificationHandler()
    const body = {
      configID: billingConfig.configID,
      detail: {
        enabled: !billingChecked
      }
    }
    this.setState({
      billingLoading: true
    })
    notify.spin(billingChecked ? '关闭计费功能中' : '开启计费功能中')
    updateGlobalConfig(cluster, null, 'billing', body, {
      success: {
        func: () => {
          notify.close()
          notify.success(billingChecked ? '关闭成功' : '开启成功')
          this.setState({
            billingVisible: false,
            billingLoading: false,
            billingChecked: !billingChecked
          })
          loadLoginUserDetail()
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notify.close()
          notify.warn(billingChecked ? '关闭失败' : '开启失败')
          this.setState({
            billingLoading: false
          })
        }
      }
    })
  }
  /**
   * 弹框确定
   */
  handleConfirmTradition() {
    const notification = new NotificationHandler()
    const { saveGlobalConfig, loadLoginUserDetail, vmWrapConfig, cluster } = this.props
    const { traditionChecked } = this.state
    const entity = {
      configID: vmWrapConfig.configID,
      detail: {
        enabled: !traditionChecked,
      }
    }
    this.setState({
      traditionBtnLoading: true,
    })
    saveGlobalConfig(cluster.clusterID, 'vm', entity, {
      success: {
        func: res => {
          loadLoginUserDetail()
          this.setState({
            traditionVisible: false
          })
          if (traditionChecked === true){
            this.TraditionState(1)
            return
          }
          if (traditionChecked === false){
            this.TraditionState(2)
            return
          }
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          notification.error('保存失败')
        }
      },
      finally: {
        func: () => {
          this.setState({
            traditionBtnLoading: false,
          })
        }
      }
    })
    /*if( this.traditionVisible === true){
      return
    }
    if(this.traditionVisible === false){
      return
    }*/
  }
  /**
   * 弹框取消
   */
  handleCancelTradition (){
    this.setState({
      traditionVisible: false,
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
      switchVisible: false,
      switchdisable: false,
      Ipdisabled: false,
      Tagdisabled: false,
    })
  }

  handleName(){
    const { Ipcheckbox, TagCheckbox } = this.state
    this.setState({
      Ipdisabled: true,
      Tagdisabled: true,
    })
    if(TagCheckbox == true){
      switch(Ipcheckbox){
        case true:
          return this.updataClusterListNodes(3)
        case false:
          return this.updataClusterListNodes(4)
        default:
          return
      }
    }
    if(TagCheckbox == false){
      switch(Ipcheckbox){
        case true:
          return this.updataClusterListNodes(1)
        case false:
        default:
          return
      }
    }
  }

  handleTag(){
    const { Ipcheckbox, TagCheckbox } = this.state
    this.setState({
      Ipdisabled: true,
      Tagdisabled: true,
    })
    if(Ipcheckbox == true ){
      switch(TagCheckbox){
        case true:
          return this.updataClusterListNodes(2)
        case false:
          return this.updataClusterListNodes(4)
        default:
          return
      }
    }
    if(Ipcheckbox == false){
      switch(TagCheckbox){
        case true:
          return this.updataClusterListNodes(1)
        case false:
          return this.updataClusterListNodes(3)
        default:
          return
      }
    }
  }

  handleImageProjectRight(){
    this.setState({
      imageProjectRightIsEdit: true
    })
  }

  handleCancelImageProjectRight(){
    this.setState({
      imageProjectRightIsEdit: false
    })
    const { form } = this.props
    const { setFieldsValue } = form
    setFieldsValue({
      imageProjectRightProps: this.state.currentRepoAuth
    })
  }

  handleSaveImageProjectRight(){
    const { form, updateConfigurations } = this.props
    const { getFieldValue } = form
    let value = getFieldValue('imageProjectRightProps')
    const notification = new NotificationHandler()
    notification.spin('修改仓库组创建权限中')
    updateConfigurations(DEFAULT_REGISTRY, {
      project_creation_restriction: value
    }, {
        success: {
          func: (res) => {
            notification.close()
            notification.success('修改仓库组创建权限成功')
            this.setState({
              imageProjectRightIsEdit: false,
              currentRepoAuth: value
            })
          }
        },
        failed: {
          func: (res) => {
            notification.close()
            let message = '修改仓库组创建权限失败'
            if(res.statusCode && res.statusCode == 403) {
              message = '没有权限对仓库组权限进行更改'
            }
            notification.error(message)
          }
        }
      })
  }

  render() {
    const { 
      traditionChecked, traditiondisable, swicthChecked, Ipcheckbox, TagCheckbox, 
      switchdisable, Tagdisabled, Ipdisabled, imageProjectRightIsEdit, billingChecked,
      billingVisible, billingLoading
    } = this.state
    const { cluster, form, configurations, harbor } = this.props
    const { listNodes } = cluster
    const { getFieldProps  } = form
    if(listNodes == undefined || (harbor.hasAdminRole && (!configurations[DEFAULT_REGISTRY] || configurations[DEFAULT_REGISTRY].isFetching))) {
      return <div className='nodata'><Spin></Spin></div>
    }
    let projectCreationRestriction
    if(harbor.hasAdminRole && configurations[DEFAULT_REGISTRY].data) {
      projectCreationRestriction  = configurations[DEFAULT_REGISTRY].data.projectCreationRestriction
    }
    if(!projectCreationRestriction) {
      projectCreationRestriction = {
        editable: false,
        value: 'adminonly'
      }
    }
    const imageProjectRightProps = getFieldProps('imageProjectRightProps',{
      initialValue: projectCreationRestriction.value
    })
    let style = {

    }
    return (
      <QueueAnim>
      <div id="AdvancedSetting" key='AdvancedSetting'>
      <Title title="高级设置" />
      <div className='title'>高级设置</div>
      <div className='content'>
        <div className='nodes'>
          <div className='contentheader'>允许用户绑定节点（所有集群）</div>
          <div className='contentbody'>
            <div className='contentbodytitle alertRow'>
              即创建服务时，可以将服务对应容器实例，固定在节点或者某些『标签』的节点上来调度
            </div>
            <div>
              <div className='contentbodycontainers'>
                <span className="switchLabel">
                 {/* {
                    swicthChecked
                      ? <span>开启</span>
                      : <span>关闭</span>
                  }*/}
                  绑定节点
                  </span>
                <Switch checkedChildren="开" unCheckedChildren="关" checked={swicthChecked} onChange={this.handleSwitch} className='switchstyle' disabled={switchdisable} />
              </div>
              {
                swicthChecked
                  ? <div className='contentfooter'>
                    <div className='item'>
                      <Checkbox onChange={this.handleName}
                        checked={Ipcheckbox} disabled={Ipdisabled}>允许用户通过『主机名及IP』来实现绑定【单个节点】</Checkbox>
                    </div>
                    <div className='item'>
                      <Checkbox onChange={this.handleTag}
                        checked={TagCheckbox} disabled={Tagdisabled}>用户可通过『主机标签』绑定【某类节点】</Checkbox>
                    </div>
                  </div>
                  : <div></div>
              }
            </div>
          </div>
        </div>
        {harbor.hasAdminRole ? <div className='imageprojectright'>
          <div className="contentheader imageproject">仓库组创建权限</div>
          <div className="contentbody">
            <div className="alertRow">用来确定哪些用户有权限创建『仓库组』，默认为『所有人』，设置为『仅管理员』则只有系统管理员有权限</div>
          </div>
          <div className='radiobox'>
            <Form>
              <Form.Item>
                <Radio.Group disabled={!imageProjectRightIsEdit} {...imageProjectRightProps}>
                  <Radio value="everyone" key="alluser">所有人均可创建</Radio>
                  <Radio value="adminonly" key="admin">仅管理员可创建</Radio>
                </Radio.Group>
              </Form.Item>
            </Form>
          </div>
          <div className='buttonbox'>
            {
              imageProjectRightIsEdit
                ? <span>
                  <Button onClick={this.handleCancelImageProjectRight}>取消</Button>
                  <Button onClick={this.handleSaveImageProjectRight} type="primary" className='saveButton' >保存</Button>
                </span>
                : <Button type="primary" onClick={this.handleImageProjectRight} disabled={!projectCreationRestriction.editable}>编辑</Button>
            }
          </div>
        </div> : ''}
        <div className='Tradition'>
          <div className='contentheader'>传统应用管理</div>
          <div className='contentbody'>
            <div className='contentbodytitle alertRow'>
              传统应用，这些指非容器化部署（即基于虚拟机物理部署）的应用，平台可以支持开启关闭部署此类应用的能力
            </div>
            <div>
              <div className='contentbodycontainers'>
                <span className="switchLabel">
                 {/* {
                    traditionChecked
                      ? <span>开启</span>
                      : <span>关闭</span>
                  }*/}
                  传统应用管理
                  </span>
                <Switch checkedChildren="开" unCheckedChildren="关" checked={traditionChecked} onChange={this.handleTradition} className='traditionStyle' />
                <span className="describe">传统应用管理、部署环境管理</span>
              </div>
              {
                /*traditionChecked
                  ? <div className='contentfooter'>
                  <div className='item'>
                    <Checkbox onChange={this.handleName}
                              checked="true" disabled="false">开启传统应用管理</Checkbox>
                  </div>
                  <div className='item'>
                    <Checkbox onChange={this.handleTag}
                              checked="true" disabled="false">开启传统应用部署环境管理</Checkbox>
                  </div>
                </div>
                  : <div></div>*/
              }
            </div>
          </div>
        </div>
        <Card title="计费功能开关" className="billingCard">
          <div className='alertRow'>
            通过计费功能开关，切换平台上应用、存储、数据库与缓存等资源的计费功能。重新开启后，项目的余额将保持在上一次关闭前的状态
          </div>
          <span className="switchLabel">
            计费功能
          </span>
          <Switch checkedChildren="开" unCheckedChildren="关" checked={billingChecked} onChange={this.handleBilling} className='switchstyle' />
        </Card>
      </div>
      <Modal
        title={swicthChecked ? '关闭绑定节点' : '开启绑定节点'}
        visible={this.state.switchVisible}
        maskClosable={false}
        wrapClassName="AdvancedSettingSwitch"
        onOk={this.handleConfirmSwitch}
        onCancel={this.handleCancelSwitch}
        confirmLoading={this.state.confirmlodaing}
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
      <Modal
        title='传统应用管理'
        visible={this.state.traditionVisible}
        maskClosable={false}
        wrapClassName="AdvancedSettingSwitch"
        onOk={this.handleConfirmTradition}
        onCancel={this.handleCancelTradition}
        footer={[
          <Button
            key="back"
            type="ghost"
            size="large"
            onClick={this.handleCancelTradition}
          >
            取 消
          </Button>,
          <Button
            key="submit"
            type="primary"
            size="large"
            loading={this.state.traditionBtnLoading}
            onClick={this.handleConfirmTradition}
          >
            确 定
          </Button>,
        ]}
        /*confirmLoading={this.state.confirmlodaing}*/
      >
        {
          traditionChecked
            ?<div className='container'>
            <div className='item'>传统应用管理，将关闭基于『非容器环境』的应用包部署管理</div>
            <div className='item color'><Icon type="question-circle-o" style={{marginRight:'8px'}}/>确认关闭？</div>
          </div>
            : <div className='container'>
            <div className='item'>传统应用管理，将开启基于『非容器环境』的应用包部署管理</div>
            <div className='item color'><Icon type="question-circle-o" style={{marginRight:'8px'}}/>确认开启？</div>
          </div>
        }
      </Modal>
        <Modal
          title={billingChecked ? '关闭计费功能' : '开启计费功能'}
          visible={billingVisible}
          wrapClassName="AdvancedSettingSwitch"
          maskClosable={false}
          onCancel={this.cancelBilling}
          onOk={this.confirmBilling}
          confirmLoading={billingLoading}
        >
          {
            billingChecked ?
              <div className='container'>
                <div className='item'>
                  关闭计费功能后，平台上计费相关的将被移除，应用、存储、数据库与缓存的使用将不计费，在资源配额充足的情况下，
                  创建资源时将不受项目余额限制。
                </div>
                <div className='item color'><Icon type="question-circle-o" style={{marginRight:'8px'}}/>确认关闭计费功能？</div>
              </div>
              : <div className='container'>
                <div className='item'>
                  开启后，平台支持对应用、存储、数据库与缓存等资源计费，请管理员根据项目需要像个人项目和共享项目充值，以免余额不足影响使用。
                </div>
                <div className='item color'><Icon type="question-circle-o" style={{marginRight:'8px'}}/>确认开启计费功能？</div>
              </div>
          }
        </Modal>
    </div>
      </QueueAnim>
    )
  }
}

AdvancedSetting = Form.create()(AdvancedSetting)

function mapPropsToState(state,props) {
  const { cluster } = state.entities.current
  const { harbor, vmWrapConfig, billingConfig } = state.entities.loginUser.info
  const { configurations } = state.harbor
  return {
    cluster,
    configurations,
    harbor,
    vmWrapConfig,
    billingConfig
  }
}

export default connect(mapPropsToState,{
  updateClusterConfig,
  setCurrent,
  updateConfigurations,
  getConfigurations,
  saveGlobalConfig,
  loadLoginUserDetail,
  getConfigByType,
  updateGlobalConfig
})(AdvancedSetting)