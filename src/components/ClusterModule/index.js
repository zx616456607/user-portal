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
import { ROLE_SYS_ADMIN, URL_REGEX, ROLE_BASE_ADMIN, ROLE_PLATFORM_ADMIN, NO_CLUSTER_FLAG, DEFAULT_CLUSTER_MARK, IP_REGEX, HOST_REGEX } from '../../../constants'
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
import classNames from 'classnames'
import foundationApplicationModle from './FoundationApplicationModle'
import intlMsg from './indexIntl'

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
    const { intl: { formatMessage } } = this.props
    if (!value) {
      callback([new Error(formatMessage(intlMsg.plsInputImgServerAddress))])
      return
    }
    // if (!/^(http|https):\/\/([a-zA-Z-]+\.)+[a-zA-Z-]+(:[0-9]{1,5})?(\/)?$/.test(value) && !/^(http|https):\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?(\/)?$/.test(value)) {
    if (!(/^http:|^https:/).test(value)) {
      return callback(formatMessage(intlMsg.plsInputRightImgServerAddress))
    }
    callback()
  },
  addRegistry() {
    const { intl: { formatMessage } } = this.props
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }
      this.setState({
        addRegistryBtnLoading: true,
      })
      const notification = new NotificationHandler()
      notification.spin(formatMessage(intlMsg.savingImgServerConfig))
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
              notification.error(formatMessage(intlMsg.imgServerAddressNotAvailable))
              return
            }
            let saveOrUpdate
            const callback = {
              success: {
                func: (result) => {
                  getAddClusterCMD()
                  notification.close()
                  notification.success(formatMessage(intlMsg.imgServerSaveSuccess))
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
                  notification.error(formatMessage(intlMsg.imgServerSaveFail), msg)
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
            notification.error(formatMessage(intlMsg.imgServerAddressNotAvailable))
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
        <div className="titlle"><FormattedMessage {...intlMsg.imgRepoUseFor} /></div>
        <div className="desc">
          <p><FormattedMessage {...intlMsg.imgRepoUseFor1} /></p>
          <p><FormattedMessage {...intlMsg.imgRepoUseFor2} /></p>
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
            <span className="itemKey"><FormattedMessage {...intlMsg.imgServerAddress} /></span>
            <Input {...mirrorProps} placeholder="如：http://192.168.1.113" ref={urlInput => this.urlInput = urlInput} />
          </Form.Item>
        </Form>
        <div className="footer">
          <Button key="previous" style={{marginRight: 8}} type="ghost" size="large" onClick={() => goNoClusterStep(2)}>
            <FormattedMessage {...intlMsg.canAccessPublicNetwork} />
          </Button>
          <a style={{marginRight: 8}} className="ant-btn ant-btn-ghost ant-btn-lg" href='/logout'>
            <FormattedMessage {...intlMsg.logout} />
          </a>
          <Button
            key="submit"
            type="primary"
            size="large"
            loading={addRegistryBtnLoading}
            onClick={this.addRegistry}>
            <FormattedMessage {...intlMsg.finishNNext} />
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
    const { funcs, parentScope, form, current, intl: { formatMessage } } = this.props
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
                  notification.success(formatMessage(intlMsg.addClusterNameSuccess, { clusterName: values.clusterName }))
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
            notification.error(formatMessage(intlMsg.addClusterFail, { clusterName: values.clusterName }), _message)
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
      callback([new Error(this.props.intl.formatMessage(intlMsg.apiHostValidatorErr))])
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
    const { funcs, parentScope, intl: { formatMessage } } = this.props
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
            notification.warn(formatMessage(intlMsg.hasNoClusterAdd))
            return
          }
          notification.success(formatMessage(intlMsg.addClusterSuccess))
          loadLoginUserDetail()
          parentScope.setState({
            createModal: false
          })
        },
        isAsync: true
      },
      failed: {
        func: error => {
          notification.error(formatMessage(intlMsg.checkClusterErr))
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
    const { addClusterCMD, form, noCluster, loginUser, intl: { formatMessage } } = this.props
    const { getFieldProps, getFieldValue } = form
    const { submitBtnLoading, checkBtnLoading } = this.state
    const { tenxApi } = loginUser
    let cmd = addClusterCMD && addClusterCMD[camelize('default_command')] || ''
    cmd = cmd.replace('ADMIN_SERVER_URL', `${tenxApi.protocol}://${tenxApi.host}`)
    const clusterNamePorps = getFieldProps('clusterName', {
      rules: [
        { required: true, message: formatMessage(intlMsg.plsInputClusterName) },
        {
          validator: (rule, value, callback) => {
            if (value && value.length > 18) {
              return callback([new Error(formatMessage(intlMsg.clusterNameErr))])
            }
            callback()
          }
        }
      ]
    })
    const apiHostPorps = getFieldProps('apiHost', {
      rules: [
        { required: true, whitespace: true, message: formatMessage(intlMsg.plsInputApiServer) },
        { validator: this.checkApiHost },
      ]
    })
    const apiTokenPorps = getFieldProps('apiToken', {
      rules: [
        { required: true, whitespace: true, message: formatMessage(intlMsg.plsInputApiToken) },
      ]
    })
    const bindingIPsPorps = getFieldProps('bindingIPs', {
      rules: [
        { required: true, message: formatMessage(intlMsg.inputServerOutIp) },
        {
          validator: (rule, value, callback) => {
            if (value && !IP_REGEX.test(value)) {
              return callback([new Error(formatMessage(intlMsg.plsInputRightServerIp))])
            }
            callback()
          }
        }
      ]
    })
    const bindingDomainPorps = getFieldProps('bindingDomains', {
      rules: [
        {message: formatMessage(intlMsg.plsIptServerDomain) },
        {
          validator: (rule, value, callback) => {
            if (value && !HOST_REGEX.test(value)) {
              return callback([new Error(formatMessage(intlMsg.plsIptRightServerDomain))])
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
        { required: true, message: formatMessage(intlMsg.plsSelect) },
      ],
      valuePropName: 'checked',
      initialValue: (noCluster ? true : false),
    })
    return (
      <Tabs defaultActiveKey="newCluster">
        <TabPane tab={formatMessage(intlMsg.newCluster)} key="newCluster">
          <AddClusterOrNodeModalContent CMD={cmd} />
          <div style={{paddingBottom: 10}}>
            <FormattedMessage {...intlMsg.newClusterAnnotation} />
          </div>
          {
            noCluster &&
            <div className="footer">
              <Button key="previous" style={{marginRight: 8}} type="ghost" size="large" onClick={() => this.goNoClusterStep(1)}>
                <FormattedMessage {...intlMsg.previewStep} />
              </Button>
              <a style={{marginRight: 8}} className="ant-btn ant-btn-ghost ant-btn-lg" href='/logout'>
                <FormattedMessage {...intlMsg.logout} />
              </a>
              <Button key="submit" type="primary" size="large" loading={checkBtnLoading} onClick={this.checkClusters}>
                <FormattedMessage {...intlMsg.finishAddCluster} />
              </Button>
            </div>
          }
        </TabPane>
        <TabPane tab={formatMessage(intlMsg.addExistCluster)} key="addExistedCluster">
          <Form horizontal onSubmit={(e)=> this.handleSubmit(e)}>
            <br/>
            <Form.Item>
              <span className="itemKey"><FormattedMessage {...intlMsg.clusterName} /></span>
              <Input {...clusterNamePorps} size="large" />
            </Form.Item>
            <Form.Item>
              <span className="itemKey">API Host</span>
              <Input
                {...apiHostPorps}
                placeholder={formatMessage(intlMsg.apiHostPlaceholder)} />
            </Form.Item>
            <Form.Item>
              <span className="itemKey">API Token</span>
              <Input {...apiTokenPorps} />
            </Form.Item>
            <Form.Item>
              <span className="itemKey"><FormattedMessage {...intlMsg.serverOutIp} /></span>
              <Input
                {...bindingIPsPorps}
                placeholder={formatMessage(intlMsg.inputServerOutIp)} />
            </Form.Item>
            <Form.Item>
              <span className="itemKey"><FormattedMessage {...intlMsg.serverDomain} /></span>
              <Input
                {...bindingDomainPorps}
                placeholder={formatMessage(intlMsg.inputDomain)} />
            </Form.Item>
            <Form.Item>
              <span className="itemKey"><FormattedMessage {...intlMsg.description} /></span>
              <Input {...descProps} type="textarea"/>
            </Form.Item>
            <Form.Item>
              <span className="itemKey"></span>
              <Checkbox disabled={noCluster} {...isDefaultProps}><FormattedMessage {...intlMsg.onlyOpenToEnterprise} /></Checkbox>
            </Form.Item>
          </Form>
          <div className="footer">
            {
              !noCluster &&
              <Button key="back" type="ghost" size="large" onClick={this.onCancel}>
                <FormattedMessage {...intlMsg.back} />
              </Button>
            }
            <Button key="submit" type="primary" size="large" loading={submitBtnLoading} onClick={this.handleSubmit}>
              <FormattedMessage {...intlMsg.submit} />
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
      loadGlobalConfig, getAddClusterCMD, intl: { formatMessage },
    } = this.props
    const { noClusterStep } = this.state
    return (
      <Modal
        title={
          noCluster
          ? formatMessage(intlMsg.initConfig)
          : formatMessage(intlMsg.addCluster)
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
          <Step title={formatMessage(intlMsg.imgServerConfig)} />
          <Step title={formatMessage(intlMsg.addCluster)} />
        </Steps>
      }
      {
        noCluster &&
        <Alert message={formatMessage(intlMsg.configImgRepoAlert)} type="warning" showIcon />
      }
      {
        (noCluster && noClusterStep === 1) && (
          <NoClusterStepOne
            intl={this.props.intl}
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
    if(role === ROLE_SYS_ADMIN || role === ROLE_BASE_ADMIN || role === ROLE_PLATFORM_ADMIN){
      return true
    }

  }

  componentWillMount() {
    const { loadClusterList, noCluster, loadGlobalConfig, loginUser } = this.props
    const { role } = loginUser
    if(role === ROLE_SYS_ADMIN || role === ROLE_PLATFORM_ADMIN){
      this.loadProjectsApprovalClusters(1)
    }
    loadClusterList({size: 100})
    if (noCluster) {
      loadGlobalConfig()
    }
  }

  componentDidMount() {
    const { loginUser, getAddClusterCMD, location, changeActiveCluster, currentClusterID } = this.props
    const { role } = loginUser
    if (!this.checkIsAdmin()) {
      browserHistory.push('/')
      return
    }
    let activeCluster = currentClusterID
    if(location && location.query && location.query.from == 'clusterDetail'){
      activeCluster = location.query.clusterID
      this.setState({
        clusterTabPaneKey: location.query.clusterID
      })
    }
    changeActiveCluster(activeCluster)
    getAddClusterCMD()
    if (location.hash && location.hash.indexOf('imageServer') > -1) { // 需要锚点到镜像服务
      setTimeout(() => {
        let anchorElement = document.getElementById('imageServiceIdForAnchor')
        anchorElement && anchorElement.scrollIntoView()
      }, 2000)
    }
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
      const clusterNameClass = classNames({
        'builder-style': cluster.isBuilder,
        'common-style': true,
      })
      let tabPaneTab = <div className='clusterDiv'>
        <Tooltip title={cluster.clusterName}>
          <span className={clusterNameClass}>{cluster.clusterName}</span>
        </Tooltip>
          { cluster.isBuilder && <Tooltip title={formatMessage(intlMsg.buildEnv)}><img src={CI} className='clusterImg'/></Tooltip> }
        </div>
      if (cluster.clusterID) {
        ImageTabList.push(
          <TabPane
            tab={tabPaneTab}
            key={cluster.clusterID}
          >
            <ClusterTabList license={license} cluster={cluster} location={location}/>
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
        <Title title={formatMessage(intlMsg.title)} />
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
                  [
                    <Tooltip
                    title={formatMessage(intlMsg.addClusterTip, { maxClusters: maxClusters || '-', clusterSum })}
                    placement="topLeft"
                  >
                    <span className='addBtn'>
                      <Button
                        disabled={createClusterBtnDisabled}
                        key='addBtn'
                        type='primary'
                        onClick={() => this.setState({ createModal: true })}>
                        <i className="fa fa-plus" aria-hidden="true"/>&nbsp;
                          {formatMessage(intlMsg.addCluster)}
                      </Button>
                    </span>
                  </Tooltip>,
                <Tooltip
                  title={formatMessage(intlMsg.addClusterHelp)}
                  placement="topLeft"
                >
                  <Button
                    className="tooltipBtn"
                    icon="question-circle-o"
                    onClick={foundationApplicationModle}
                   />
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
              <FormattedMessage {...intlMsg.noClusterPlsAdd}/>
            </div>)
          }

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
