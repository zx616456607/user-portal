/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster list component
 *
 * v0.1 - 2017-1-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Modal, Tabs, Icon, Menu, Button, Card, Form, Input, Tooltip, Spin, Alert, Checkbox, Steps, Table } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/clusterList.less'
import ClusterTabList from './clusterTabList'
import NotificationHandler from '../../components/Notification'
import { browserHistory } from 'react-router'
import { ROLE_SYS_ADMIN, URL_REGEX, CLUSTER_PAGE, NO_CLUSTER_FLAG, DEFAULT_CLUSTER_MARK, IP_REGEX, HOST_REGEX } from '../../../constants'
import { loadClusterList, getAddClusterCMD, createCluster } from '../../actions/cluster'
import { GetProjectsApprovalClusters, UpdateProjectsApprovalCluster, searchProjectsClusterApproval } from '../../actions/project'
import { loadLoginUserDetail } from '../../actions/entities'
import { changeActiveCluster } from '../../actions/terminal'
import { loadTeamClustersList } from '../../actions/team'
import { getProjectVisibleClusters } from '../../actions/project'
import { updateGlobalConfig, saveGlobalConfig, loadGlobalConfig, isValidConfig } from '../../actions/global_config'
import AddClusterOrNodeModalContent from './AddClusterOrNodeModal/Content'
import { camelize } from 'humps'
import CI from '../../assets/img/setting/shishi.png'
import OpenModalImage from '../../assets/img/cluster/clusterAuthority.svg'
import { calcuDate } from '../../common/tools'
import Title from '../Title'

const TabPane = Tabs.TabPane;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const Step = Steps.Step
// const registry = 'registry'
const registry = 'harbor'

let NoClusterStepOne = React.createClass({
  getInitialState() {
    return {
      //
    }
  },
  componentDidMount() {
    setTimeout(() => {
      this.urlInput && this.urlInput.refs.input.focus()
    }, 300)
  },
  // 镜像服务地址校验规则
  checkMirror(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写镜像服务地址')])
      return
    }
    if (!/^(http|https):\/\/([a-zA-Z-]+\.)+[a-zA-Z-]+(:[0-9]{1,5})?(\/)?$/.test(value) && !/^(http|https):\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?(\/)?$/.test(value)) {
      return callback('请填入合法的镜像服务地址')
    }
    callback()
  },
  // 认证服务地址校验规则
  /*checkApprove(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写认证服务地址')])
      return
    }
    if (!/^(http|https):\/\/([a-zA-Z-]+\.)+[a-zA-Z-]+(:[0-9]{1,5})?$/.test(value) && !/^(http|https):\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?$/.test(value)) {
      return callback('请填入合法的认证服务地址')
    }
    callback()
  },*/
  // 扩展服务地址校验规则
  /*checkExtend(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写扩展服务地址')])
      return
    }
    if (!/^(http|https):\/\/([a-zA-Z-]+\.)+[a-zA-Z-]+(:[0-9]{1,5})?$/.test(value) && !/^(http|https):\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?$/.test(value)) {
      return callback('请填入合法的扩展服务地址')
    }
    callback()
  },*/
  addRegistry() {
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }
      this.setState({
        addRegistryBtnLoading: true,
      })
      const notification = new NotificationHandler()
      notification.spin('保存镜像服务配置中')
      const {
        updateGlobalConfig, isValidConfig, saveGlobalConfig,
        goNoClusterStep, loadGlobalConfig, getAddClusterCMD,
      } = this.props
      // const { mirror, approve, extend, registryID } = values
      const { registryID, url } = values
      const self = this
      /*const body = {
        configID: registryID,
        detail: {
          host: extend,
          v2AuthServer: approve,
          v2Server: mirror
        }
      }*/
      const body = {
        configID: registryID,
        detail: {
          url,
        }
      }
      isValidConfig(registry, {
        /*host: extend ,
        v2AuthServer: approve,
        v2Server: mirror,*/
        url,
      }, {
        success: {
          func: (result) => {
            if (!result.data || result.data !== 'success') {
              notification.close()
              notification.error('镜像服务地址不可用')
              return
            }
            let saveOrUpdate
            const callback = {
              success: {
                func: (result) => {
                  getAddClusterCMD()
                  notification.close()
                  notification.success('镜像服务配置保存成功')
                  self.setState({
                    addRegistryBtnLoading: false,
                  })
                  goNoClusterStep(2)
                  if (!registryID) {
                    loadGlobalConfig()
                  }
                },
                isAsync: true
              },
              failed: {
                func: (err) => {
                  notification.close()
                  let msg
                  if (err.message.message) {
                    msg = err.message.message
                  } else {
                    msg = err.message
                  }
                  notification.error('镜像服务配置保存失败', msg)
                  self.setState({
                    addRegistryBtnLoading: false,
                  })
                }
              }
            }
            if (!registryID) {
              saveOrUpdate = saveGlobalConfig.bind(this, null, registry, body, callback)
            } else {
              saveOrUpdate = updateGlobalConfig.bind(this, null, registryID, registry, body, callback)
            }
            saveOrUpdate()
          },
          isAsync: true
        },
        failed: {
          func: () => {
            notification.close()
            notification.error('镜像服务地址不可用')
            self.setState({
              addRegistryBtnLoading: false,
            })
          }
        }
      })
    })
  },
  render() {
    const { form, globalConfig, goNoClusterStep } = this.props
    const { getFieldProps } = form
    const { addRegistryBtnLoading } = this.state
    let registryConfig = {}
    globalConfig.every(config => {
      if (config.configType === registry) {
        registryConfig = config
        try {
          registryConfig.configDetail = JSON.parse(registryConfig.configDetail)
        } catch (error) {
          //
        }
        return false
      }
      return true
    })
    const { url } = registryConfig.configDetail || {}
    /*const { v2Server, v2AuthServer, protocol, host, port } = registryConfig.configDetail || {}
    const extendProps = getFieldProps('extend', {
      rules: [
        { validator: this.checkExtend }
      ],
      initialValue: protocol ? protocol + '://' + host + (port ? ':' + port : '') : ''
    })
    const approveProps = getFieldProps('approve', {
      rules: [
        { validator: this.checkApprove }
      ],
      initialValue: v2AuthServer
    })*/
    const mirrorProps = getFieldProps('url', {
      rules: [
        { validator: this.checkMirror }
      ],
      initialValue: url
    })
    const registryID = getFieldProps('registryID', {
      initialValue: registryConfig ? registryConfig.configID : ''
    })
    return (
      <div className="noClusterStepOne">
        <div className="titlle">该镜像仓库用途：</div>
        <div className="desc">
          <p>① 默认『系统组件』的容器镜像将从该仓库拉取，如可访问公网可略过</p>
          <p>② 该仓库会作为平台 DevOps 的镜像仓库（交付中心、CI/CD 模块中使用）</p>
        </div>
        <Form horizontal>
          {/*<Form.Item>
            <span className="itemKey">扩展服务地址</span>
            <Input {...extendProps} placeholder="如：http://192.168.1.113:4081" size="large" />
          </Form.Item>
          <Form.Item>
            <span className="itemKey">认证服务地址</span>
            <Input {...approveProps} placeholder="如：https://192.168.1.113:5001" size="large" />
          </Form.Item>*/}
          <Form.Item>
            <span className="itemKey">镜像服务地址</span>
            <Input {...mirrorProps} placeholder="如：http://192.168.1.113" ref={urlInput => this.urlInput = urlInput} />
          </Form.Item>
        </Form>
        <div className="footer">
          <Button key="previous" style={{marginRight: 8}} type="ghost" size="large" onClick={() => goNoClusterStep(2)}>
            可访问公网，暂不配置
          </Button>
          <a style={{marginRight: 8}} className="ant-btn ant-btn-ghost ant-btn-lg" href='/logout'>注销登录</a>
          <Button
            key="submit"
            type="primary"
            size="large"
            loading={addRegistryBtnLoading}
            onClick={this.addRegistry}>
            完成并下一步
          </Button>
        </div>
      </div>
    )
  }
})
NoClusterStepOne = Form.create()(NoClusterStepOne)

let CreateClusterModal = React.createClass({
  getInitialState() {
    return {
      submitBtnLoading: false,
      checkBtnLoading: false,
      addRegistryBtnLoading: false,
      noClusterStep: 1,
    }
  },
  handleSubmit(e) {
    e && e.preventDefault()
    const { funcs, parentScope, form, current } = this.props
    const {
      createCluster,
      loadClusterList,
      loadLoginUserDetail,
      getProjectVisibleClusters,
    } = funcs
    const { resetFields } = form
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }
      this.setState({
        submitBtnLoading: true,
      })
      if (values.isDefault === true) {
        values.isDefault = DEFAULT_CLUSTER_MARK
      } else {
        values.isDefault = 0
      }
      const notification = new NotificationHandler()
      createCluster(values, {
        success: {
          func: result => {
            loadLoginUserDetail()
            loadClusterList({size: 100}, {
              finally: {
                func: () => {
                  notification.success(`添加集群 ${values.clusterName} 成功`)
                  parentScope.setState({
                    createModal: false,
                  })
                  this.setState({
                    submitBtnLoading: false
                  })
                  resetFields()
                }
              }
            })
            getProjectVisibleClusters(current.space.namespace)
          },
          isAsync: true
        },
        failed: {
          func: err => {
            let _message = err.message.message || ''
            notification.error(`添加集群 "${values.clusterName}" 失败`, _message)
            this.setState({
              submitBtnLoading: false
            })
          },
          isAsync: true
        }
      })
    });
  },
  checkApiHost(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    if (!URL_REGEX.test(value)) {
      callback([new Error('API Host 由协议 + API server 地址 + 端口号 组成')])
      return
    }
    callback()
  },
  onCancel() {
    const { parentScope, form } = this.props
    parentScope.setState({createModal: false})
    form.resetFields()
  },
  checkClusters() {
    const { funcs, parentScope } = this.props
    const { loadClusterList, loadLoginUserDetail } = funcs
    const notification = new NotificationHandler()
    this.setState({
      checkBtnLoading: true,
    })
    loadClusterList({size: 100}, {
      success: {
        func: result => {
          let clusters = result.data || []
          if (clusters.length < 1) {
            notification.warn('您还未添加集群，请添加')
            return
          }
          notification.success('添加集群成功')
          loadLoginUserDetail()
          parentScope.setState({
            createModal: false
          })
        },
        isAsync: true
      },
      failed: {
        func: error => {
          notification.error('检测集群时发生错误，请重试')
        }
      },
      finally: {
        func: () => {
          this.setState({
            checkBtnLoading: false,
          })
        }
      }
    })
  },
  renderAddCluster() {
    const { addClusterCMD, form, noCluster, loginUser } = this.props
    const { getFieldProps, getFieldValue } = form
    const { submitBtnLoading, checkBtnLoading } = this.state
    const { tenxApi } = loginUser
    let cmd = addClusterCMD && addClusterCMD[camelize('default_command')] || ''
    cmd = cmd.replace('ADMIN_SERVER_URL', `${tenxApi.protocol}://${tenxApi.host}`)
    const clusterNamePorps = getFieldProps('clusterName', {
      rules: [
        { required: true, message: '请填写集群名称' },
        {
          validator: (rule, value, callback) => {
            if (value && value.length > 18) {
              return callback([new Error('集群名称不能超过18个字符')])
            }
            callback()
          }
        }
      ]
    })
    const apiHostPorps = getFieldProps('apiHost', {
      rules: [
        { required: true, whitespace: true, message: '请填写 API Server' },
        { validator: this.checkApiHost },
      ]
    })
    const apiTokenPorps = getFieldProps('apiToken', {
      rules: [
        { required: true, whitespace: true, message: '请填写 API Token' },
      ]
    })
    const bindingIPsPorps = getFieldProps('bindingIPs', {
      rules: [
        { required: true, message: '请填写服务出口 IP' },
        {
          validator: (rule, value, callback) => {
            if (value && !IP_REGEX.test(value)) {
              return callback([new Error('请填写正确的服务出口 IP')])
            }
            callback()
          }
        }
      ]
    })
    const bindingDomainPorps = getFieldProps('bindingDomains', {
      rules: [
        {message: '请填写服务域名' },
        {
          validator: (rule, value, callback) => {
            if (value && !HOST_REGEX.test(value)) {
              return callback([new Error('请填写正确的服务域名')])
            }
            callback()
          }
        }
      ]
    })
    const descProps = getFieldProps('description', {
      rules: [
        { whitespace: true },
      ]
    })
    const isDefaultProps = getFieldProps('isDefault', {
      rules: [
        { required: true, message: '请选择' },
      ],
      valuePropName: 'checked',
      initialValue: (noCluster ? true : false),
    })
    return (
      <Tabs defaultActiveKey="newCluster">
        <TabPane tab="新建集群" key="newCluster">
          <AddClusterOrNodeModalContent CMD={cmd} />
          <div style={{paddingBottom: 10}}>
            注：新建的首个集群，将设置对平台全部个人帐号开放
          </div>
          {
            noCluster &&
            <div className="footer">
              <Button key="previous" style={{marginRight: 8}} type="ghost" size="large" onClick={() => this.goNoClusterStep(1)}>
                上一步
              </Button>
              <a style={{marginRight: 8}} className="ant-btn ant-btn-ghost ant-btn-lg" href='/logout'>注销登录</a>
              <Button key="submit" type="primary" size="large" loading={checkBtnLoading} onClick={this.checkClusters}>
                完成集群添加
              </Button>
            </div>
          }
        </TabPane>
        <TabPane tab="添加已有集群" key="addExistedCluster">
          <Form horizontal onSubmit={(e)=> this.handleSubmit(e)}>
            <br/>
            <Form.Item>
              <span className="itemKey">集群名称</span>
              <Input {...clusterNamePorps} size="large" />
            </Form.Item>
            <Form.Item>
              <span className="itemKey">API Host</span>
              <Input
                {...apiHostPorps}
                placeholder="协议 + API server 地址 + 端口号" />
            </Form.Item>
            <Form.Item>
              <span className="itemKey">API Token</span>
              <Input {...apiTokenPorps} />
            </Form.Item>
            <Form.Item>
              <span className="itemKey">服务出口 IP</span>
              <Input
                {...bindingIPsPorps}
                placeholder="输入服务出口 IP" />
            </Form.Item>
            <Form.Item>
              <span className="itemKey">服务域名</span>
              <Input
                {...bindingDomainPorps}
                placeholder="输入服务域名" />
            </Form.Item>
            <Form.Item>
              <span className="itemKey">描述</span>
              <Input {...descProps} type="textarea"/>
            </Form.Item>
            <Form.Item>
              <span className="itemKey"></span>
              <Checkbox disabled={noCluster} {...isDefaultProps}>对企业内全部个人帐号开放该集群</Checkbox>
            </Form.Item>
          </Form>
          <div className="footer">
            {
              !noCluster &&
              <Button key="back" type="ghost" size="large" onClick={this.onCancel}>返 回</Button>
            }
            <Button key="submit" type="primary" size="large" loading={submitBtnLoading} onClick={this.handleSubmit}>
              提 交
            </Button>
          </div>
        </TabPane>
      </Tabs>
    )
  },
  goNoClusterStep(step) {
    this.setState({
      noClusterStep: step,
    })
  },
  render () {
    const {
      noCluster, parentScope, updateGlobalConfig,
      isValidConfig, saveGlobalConfig, globalConfig,
      loadGlobalConfig, getAddClusterCMD,
    } = this.props
    const { noClusterStep } = this.state
    return (
      <Modal
        title={
          noCluster
          ? "初始化配置"
          : "添加集群"
        }
        visible={noCluster || parentScope.state.createModal}
        closable={!noCluster}
        wrapClassName="createClusterModal"
        width={600}
        onCancel={() => this.onCancel()}
        onOk={()=>this.handleSubmit()}
        footer={null}
      >
      {
        noCluster &&
        <Steps current={noClusterStep - 1} size="small" className="noclusterSteps">
          <Step title="镜像服务配置" />
          <Step title="添加集群" />
        </Steps>
      }
      {
        noCluster &&
        <Alert message="请先配置镜像仓库并添加集群，然后再进行其他操作" type="warning" showIcon />
      }
      {
        (noCluster && noClusterStep === 1) && (
          <NoClusterStepOne
            globalConfig={globalConfig}
            loadGlobalConfig={loadGlobalConfig}
            updateGlobalConfig={updateGlobalConfig}
            isValidConfig={isValidConfig}
            saveGlobalConfig={saveGlobalConfig}
            getAddClusterCMD={getAddClusterCMD}
            goNoClusterStep={this.goNoClusterStep} />
        )
      }
      {
        (!noCluster || noClusterStep === 2) && this.renderAddCluster()
      }
    </Modal>
    )
  }
})
CreateClusterModal = Form.create()(CreateClusterModal)

class ClusterList extends Component {
  constructor(props) {
    super(props)
    this.checkIsAdmin = this.checkIsAdmin.bind(this)
    this.onTabChange = this.onTabChange.bind(this)
    this.state = {
      createModal: false, // create cluster modal
      clusterTabPaneKey: this.props.currentClusterID,
      clusterAuthorityModalVisible: false,
      clusterStatus: true,
      approvalPending: false,
      approvalReady: false,
    }
  }

  checkIsAdmin() {
    const { loginUser } = this.props
    const { role } = loginUser
    return role === ROLE_SYS_ADMIN
  }

  componentWillMount() {
    const { loadClusterList, noCluster, loadGlobalConfig } = this.props
    loadClusterList({size: 100})
    this.loadProjectsApprovalClusters(1)
    if (noCluster) {
      loadGlobalConfig()
    }
  }

  componentDidMount() {
    const { loginUser, getAddClusterCMD, location } = this.props
    const { role } = loginUser
    if (!this.checkIsAdmin()) {
      browserHistory.push('/')
    }
    if(location && location.query && location.query.from == 'clusterDetail'){
      this.setState({
        clusterTabPaneKey: location.query.clusterID
      })
    }
    getAddClusterCMD()
  }

  onTabChange(key) {
    const { changeActiveCluster } = this.props
    changeActiveCluster(key)
    this.setState({
      clusterTabPaneKey: key
    })
  }

  loadProjectsApprovalClusters = num => {
    const { GetProjectsApprovalClusters } = this.props
    let filter = 'status,' + num
    if(num == 5){
      filter = 'status__neq,1,status__neq,0'
    }
    GetProjectsApprovalClusters({filter})
  }

  getProjectApprovalClustersList = status => {
    switch(status){
      case 'modal':
        this.setState({
          clusterAuthorityModalVisible: true,
          clusterStatus: true,
          approvalReady: false,
          approvalPending: true,
        })
        this.loadProjectsApprovalClusters(1)
        return
      case 'waiting':
        this.setState({
          clusterStatus: true,
          approvalReady: false,
          approvalPending: true,
        })
        this.loadProjectsApprovalClusters(1)
        return
      case 'ready':
        this.setState({
          clusterStatus: false,
          approvalReady: true,
          approvalPending: false,
        })
        this.loadProjectsApprovalClusters(5)
        return
      default:
        return
    }

  }

  formatUpdateProjectsApprovalClusterBody = (status, item, num) => {
    if(status == 'allRefuse' || status == 'allpass' || status == 'allclear'){
      const { projectsApprovalClustersList } = this.props
      const { approvalPending, approvalReady } = this.state
      let dataArray = []
      if(approvalPending){
        dataArray = projectsApprovalClustersList.approvalPendingData
      }
      if(approvalReady){
        dataArray = projectsApprovalClustersList.approvedReadyData
      }
      let clusterInfo = []
      let projectObj = {}
      for(let i = 0; i < dataArray.length; i++){
        if(projectObj[dataArray[i].projectId]){
          projectObj[dataArray[i].projectId].push(dataArray[i])
        }else{
          projectObj[dataArray[i].projectId] = [dataArray[i]]
        }
      }
      for(let key in projectObj){
        if(projectObj[key].length == 1){
          clusterInfo.push({
            project: key,
            clusters: {
              [projectObj[key][0].resourceID]: num
            }
          })
        } else {
          clusterInfo.push({
            project: key,
            clusters: {}
          })
          for(let i = 0; i<projectObj[key].length; i++){
            clusterInfo[clusterInfo.length - 1].clusters[projectObj[key][i].resourceID] = num
          }
        }
      }
      return {clusterInfo}
    }
    return {
      clusterInfo: [
        {project: item.projectId,
          clusters:{
            [item.resourceID]: num
          }
        }
      ]
    }
  }

  loadUpdateProjectsApprovalCluster = (body, num, text) => {
    const { UpdateProjectsApprovalCluster } = this.props
    let noti = new NotificationHandler()
    UpdateProjectsApprovalCluster(body, {
      success: {
        func: () => {
          noti.success(text + '成功')
          this.loadProjectsApprovalClusters(num)
          if(text == '撤销'){
            this.loadProjectsApprovalClusters(1)
          }
        },
        isAsync: true
      },
      failed: {
        func: () => {
          noti.error(text + '失败，请稍后重试')
        },
        isAsync: true
      }
    })
  }

  handleClusterApproval = (status, item) => {
    switch(status){
      case 'check':
        let checkbody = this.formatUpdateProjectsApprovalClusterBody('check', item, 2)
        this.loadUpdateProjectsApprovalCluster(checkbody, 1, '操作')
        return
      case 'cross':
        let crossbody = this.formatUpdateProjectsApprovalClusterBody('check', item, 3)
        this.loadUpdateProjectsApprovalCluster(crossbody, 1, '操作')
        return
      case 'clear':
        let clearbody = this.formatUpdateProjectsApprovalClusterBody('clear', item, 4)
        this.loadUpdateProjectsApprovalCluster(clearbody, 5, '清除')
        return
      case 'recall':
        let recallbody = this.formatUpdateProjectsApprovalClusterBody('recall', item, 1)
        this.loadUpdateProjectsApprovalCluster(recallbody, 5, '撤销')
        return
      case 'allRefuse':
        let allRefusebody = this.formatUpdateProjectsApprovalClusterBody('allRefuse', item, 3)
        this.loadUpdateProjectsApprovalCluster(allRefusebody, 1, '操作')
        return
      case 'allpass':
        let allpassbody = this.formatUpdateProjectsApprovalClusterBody('allpass', item, 2)
        this.loadUpdateProjectsApprovalCluster(allpassbody, 1, '操作')
        return
      case 'allclear':
        let allclearbody = this.formatUpdateProjectsApprovalClusterBody('allclear', item, 4)
        this.loadUpdateProjectsApprovalCluster(allclearbody, 5, '全部清除')
        return
      default:
        return
    }
  }

  approvalClusterList = () => {
    const { clusterStatus, approvalPending, approvalReady } = this.state
    const { projectsApprovalClustersList } = this.props
    const column = [
      {
        title: '项目名称',
        dataIndex: 'projectName',
        width: '35%',
      },{
        title: '集群名称',
        dataIndex: 'clusterName',
        width: '35%',
      },{
        title: '操作',
        width: '15%',
        render: (text, record, index) => <div className='handlebox'>
          {
            clusterStatus
            ? [<Button
              shape="circle"
              icon='check'
              size='small'
              className='checkBtn'
              onClick={this.handleClusterApproval.bind(this, 'check', record)}
              key="check"
            ></Button>,
            <Button
              shape="circle"
              icon='cross'
              size='small'
              className='crossBtn'
              onClick={this.handleClusterApproval.bind(this, 'cross', record)}
              key="cross"
            ></Button>]
            : [<Tooltip title='撤销审批' key={`recall${index}`}>
                <i className="fa fa-reply recall" aria-hidden="true" onClick={this.handleClusterApproval.bind(this, 'recall', record)}></i>
              </Tooltip>,
              <Tooltip title="清除审批记录" key={`tooltip${index}`}>
                <svg
                  className='deleteIcon'
                  onClick={this.handleClusterApproval.bind(this, 'clear', record)}
                  key={`clear${index}`}
                ><use xlinkHref="#delete"></use></svg>
              </Tooltip>]
          }

        </div>
      }
    ]
    let datasource = []
    let obj = {}
    if(approvalPending){
      datasource = projectsApprovalClustersList.approvalPendingData
      obj = {
        title: '申请时间',
        dataIndex: 'requestTime',
        width: '15%',
        render: (text, record, index) => {
          return <div>{calcuDate(text)}</div>
        }
      }
    }
    if(approvalReady){
      datasource = projectsApprovalClustersList.approvedReadyData
      obj = {
        title: '状态',
        dataIndex: 'status',
        width: '15%',
        render: (text, record, index) => {
          if(text == 2){
          return <div>同意</div>
          }
          return <div>拒绝</div>
        }
      }
    }
    if(Object.keys(obj).length){
      column.splice(2, 0, obj)
    }
    return <Table
      columns={column}
      dataSource={datasource}
      pagination={false}
      scroll={{ y : 280}}
      loading={projectsApprovalClustersList.isFetching}
    />
  }

  searchItem(){
    const { searchProjectsClusterApproval } = this.props
    let value = document.getElementById('approvedReadySearch').value
    searchProjectsClusterApproval(value)
  }

  render() {
    const {
      intl, clustersIsFetching, clusters,
      currentClusterID, addClusterCMD, createCluster,
      license, noCluster, loadClusterList,
      loadLoginUserDetail, loginUser, globalConfig, location,
      projectsApprovalClustersList, getProjectVisibleClusters,
      current,
    } = this.props
    if (!this.checkIsAdmin()) {
      return (
        <div className="loadingBox">
          <Spin size="large" />
        </div>
      )
    }
    const { formatMessage } = intl
    const otherImageHead = this.state.otherImageHead || []
    const scope = this

    let ImageTabList = []
    clusters.forEach(cluster => {
      let tabPaneTab = <div className='clusterDiv'>
        <Tooltip title={cluster.clusterName}>
          <span className='clustername'>{cluster.clusterName}</span>
        </Tooltip>
          { cluster.isBuilder && <Tooltip title='构建环境'><img src={CI} className='clusterImg'/></Tooltip> }
        </div>
      if (cluster.clusterID) {
        ImageTabList.push(
          <TabPane
            tab={tabPaneTab}
            key={cluster.clusterID}
          >
            <ClusterTabList cluster={cluster} location={location}/>
          </TabPane>
        )
      }
    })
    const clusterSum = clusters.length
    let createClusterBtnDisabled = true
    const maxClusters = license[camelize('max_clusters')]
    if (clusterSum < maxClusters) {
      createClusterBtnDisabled = false
    }
    let waitingRequestNumbers = 0
    let approvedReadyNumbers = 99
    if(projectsApprovalClustersList && projectsApprovalClustersList.approvalPendingData){
      waitingRequestNumbers = projectsApprovalClustersList.approvalPendingData.length
    }
    if(waitingRequestNumbers > 99){
      waitingRequestNumbers = 99
    }
    if(projectsApprovalClustersList && projectsApprovalClustersList.approvedReadyData){
      approvedReadyNumbers = projectsApprovalClustersList.approvedReadyData.length
    }
    return (
      <QueueAnim className='ClusterBox'
        type='right'
      >
        <Title title="基础设施" />
        <div id='ClusterContent' key='ClusterContent'>

          <CreateClusterModal
            {...this.props}
            parentScope={scope}
            addClusterCMD={addClusterCMD}
            funcs={{createCluster, loadClusterList, loadLoginUserDetail, getProjectVisibleClusters}}
            globalConfig={globalConfig}
            current={current}
          />
          {
            clustersIsFetching
            ? (
              <div className="loadingBox">
                <Spin size="large" />
              </div>
            )
            : (
              <Tabs
                onChange={this.onTabChange}
                key='ClusterTabs'
                activeKey={this.state.clusterTabPaneKey}
                type="card"
                style={{position:'relative'}}
                tabBarExtraContent={
                  [<Button
                    className='authorityBtn'
                    type="ghost"
                    onClick={() => this.getProjectApprovalClustersList('modal')}
                  >
                    <img src={OpenModalImage} className='OpenModalImage'/>
                    集群授权审批
                    {
                      waitingRequestNumbers
                      ? <div className='wait_number'>{waitingRequestNumbers}</div>
                      : <span></span>
                    }
                  </Button>,
                    <Tooltip
                    title={`当前许可证最多支持 ${maxClusters || '-'} 个 集群（目前已添加 ${clusterSum} 个）`}
                    placement="topLeft"
                  >
                    <span className='addBtn'>
                      <Button
                        disabled={createClusterBtnDisabled}
                        key='addBtn'
                        type='primary'
                        icon="plus"
                        onClick={() => this.setState({ createModal: true })}>
                        添加集群
                      </Button>
                    </span>
                  </Tooltip>,
                <Tooltip
                  title={'基础设施，在这里您可以完成容器云平台的计算资源池管理：集群的添加、删除，以及集群内主机的添加、删除，并管理主机内的容器实例、查看主机维度的监控等。'}
                  placement="topLeft"
                >
                  <Button className="tooltipBtn" icon="question-circle-o" />
                </Tooltip>]
                }
              >
                {ImageTabList}
              </Tabs>
            )
          }
          {
            (!clustersIsFetching && clusterSum < 1) && (
            <div key="loadingBox" className="loadingBox">
              暂无可用集群，请添加
            </div>)
          }
          <Modal
            title="集群授权审批"
            visible={this.state.clusterAuthorityModalVisible}
            closable={true}
            onCancel={() => this.setState({clusterAuthorityModalVisible: false})}
            width='650px'
            maskClosable={false}
            wrapClassName="clusterAuthorityModal"
            footer={
              this.state.clusterStatus
              ? [<Button
                icon="cross-circle-o"
                size='large'
                onClick={() => this.handleClusterApproval('allRefuse')}
                key="allRefuse"
              >全部拒绝</Button>,
              <Button
                type="primary"
                icon='check-circle-o'
                size='large'
                onClick={() => this.handleClusterApproval('allpass')}
                key="allpass"
              >全部通过</Button>]
            : <Button
                type="primary"
                size='large'
                onClick={() => this.handleClusterApproval('allclear')}
                key="allclear"
                className='allclearBtn'
                disabled={!approvedReadyNumbers}
              >
                <svg
                  className='clearIcon'
                ><use xlinkHref="#delete"></use></svg>
                清除审批记录</Button>
            }
          >
            <div>
              <div className='clusterstatusType'>
                <Button.Group>
                  <Button
                    type={this.state.clusterStatus ? 'primary': 'default'}
                    size='large'
                    icon="edit"
                    className='typeBtn'
                    onClick={() => this.getProjectApprovalClustersList('waiting')}
                    key="waiting"
                  >待审批</Button>
                  <Button
                    type={!this.state.clusterStatus ? 'primary': 'default'}
                    size='large'
                    icon='check-circle-o'
                    className='typeBtn'
                    onClick={() => this.getProjectApprovalClustersList('ready')}
                    key="ready"
                  >已审批</Button>
                </Button.Group>
              </div>
              <div className='clusterContainer'>
                {
                  !this.state.clusterStatus &&  <div className='search_div'>
                    <Input
                      size="large"
                      className='search_box'
                      placeholder='请输入项目名称搜索'
                      id="approvedReadySearch"
                      onPressEnter={() => this.searchItem()}
                    />
                    <i
                      className="fa fa-search search_icon"
                      aria-hidden="true"
                      onClick={() => this.searchItem()}
                    ></i>
                  </div>
                }
                {this.approvalClusterList()}
              </div>
            </div>
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

ClusterList.propTypes = {
  intl: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
  const { entities, cluster, cluster_nodes, globalConfig, projectAuthority } = state
  const { loginUser, current } = entities
  const { clusters, addClusterCMD } = cluster
  const { getAllClusterNodes } = cluster_nodes
  const getAllClusterNodesKeys = Object.keys(getAllClusterNodes)
  const { projectsApprovalClustersList } = projectAuthority
  return {
    current,
    loginUser: loginUser.info,
    noCluster: loginUser.info[camelize(NO_CLUSTER_FLAG)],
    clustersIsFetching: clusters.isFetching,
    clusters: clusters.clusterList ? clusters.clusterList : [],
    currentClusterID: current.cluster.clusterID,
    addClusterCMD: (addClusterCMD ? addClusterCMD.result : {}) || {},
    license: clusters.license || {},
    globalConfig: (globalConfig.globalConfig && globalConfig.globalConfig.result) ? globalConfig.globalConfig.result.data : [],
    projectsApprovalClustersList,
  }
}

export default connect(mapStateToProps, {
  loadClusterList,
  getAddClusterCMD,
  createCluster,
  loadLoginUserDetail,
  changeActiveCluster,
  getProjectVisibleClusters,
  updateGlobalConfig,
  loadGlobalConfig,
  isValidConfig,
  saveGlobalConfig,
  GetProjectsApprovalClusters,
  UpdateProjectsApprovalCluster,
  searchProjectsClusterApproval,
})(injectIntl(ClusterList, {
  withRef: true,
}))