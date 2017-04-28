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
import { Modal, Tabs, Icon, Menu, Button, Card, Form, Input, Tooltip, Spin, Alert, Checkbox } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/clusterList.less'
import ClusterTabList from './clusterTabList'
import NotificationHandler from '../../common/notification_handler'
import { browserHistory } from 'react-router'
import { ROLE_SYS_ADMIN, URL_REGEX, CLUSTER_PAGE, NO_CLUSTER_FLAG, DEFAULT_CLUSTER_MARK, IP_REGEX, HOST_REGEX } from '../../../constants'
import { loadClusterList, getAddClusterCMD, createCluster } from '../../actions/cluster'
import { loadLoginUserDetail } from '../../actions/entities'
import { changeActiveCluster } from '../../actions/terminal'
import { loadTeamClustersList } from '../../actions/team'
import { updateGlobalConfig, saveGlobalConfig, loadGlobalConfig, isValidConfig } from '../../actions/global_config'
import AddClusterOrNodeModalContent from './AddClusterOrNodeModal/Content'
import { camelize } from 'humps'
import CI from '../../assets/img/setting/shishi.png'

const TabPane = Tabs.TabPane;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

let NoClusterStepOne = React.createClass({
  getInitialState() {
    return {
      //
    }
  },
  // 镜像服务地址校验规则
  checkMirror(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写镜像服务地址')])
      return
    }
    if (!/^([a-zA-Z-]+\.)+[a-zA-Z-]+(:[0-9]{1,5})?$/.test(value) && !/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?$/.test(value)) {
      return callback('请填入合法的镜像服务地址')
    }
    callback()
  },
  // 认证服务地址校验规则
  checkApprove(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写认证服务地址')])
      return
    }
    if (!/^(http|https):\/\/([a-zA-Z-]+\.)+[a-zA-Z-]+(:[0-9]{1,5})?$/.test(value) && !/^(http|https):\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?$/.test(value)) {
      return callback('请填入合法的认证服务地址')
    }
    callback()
  },
  // 扩展服务地址校验规则
  checkExtend(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写扩展服务地址')])
      return
    }
    if (!/^(http|https):\/\/([a-zA-Z-]+\.)+[a-zA-Z-]+(:[0-9]{1,5})?$/.test(value) && !/^(http|https):\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?$/.test(value)) {
      return callback('请填入合法的扩展服务地址')
    }
    callback()
  },
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
      const { updateGlobalConfig, isValidConfig, saveGlobalConfig, goNoClusterStep, loadGlobalConfig } = this.props
      const { mirror, approve, extend, registryID } = values
      const self = this
      const body = {
        configID: registryID,
        detail: {
          host: extend,
          v2AuthServer: approve,
          v2Server: mirror
        }
      }
      isValidConfig('registry', {
        host: extend ,
        v2AuthServer: approve,
        v2Server: mirror
      }, {
        success: {
          func: (result) => {
            if (!result.data || result.data !== 'success') {
              notification.close()
              notification.error('扩展服务地址不可用')
              return
            }
            let saveOrUpdate
            const callback = {
              success: {
                func: (result) => {
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
              saveOrUpdate = saveGlobalConfig.bind(this, null, 'registry', body, callback)
            } else {
              saveOrUpdate = updateGlobalConfig.bind(this, null, registryID, 'registry', body, callback)
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
      if (config.configType === 'registry') {
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
    const { v2Server, v2AuthServer, protocol, host, port } = registryConfig.configDetail || {}
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
    })
    const mirrorProps = getFieldProps('mirror', {
      rules: [
        { validator: this.checkMirror }
      ],
      initialValue: v2Server
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
          <Form.Item>
            <span className="itemKey">扩展服务地址</span>
            <Input {...extendProps} placeholder="如：http://192.168.1.113:80" size="large" />
          </Form.Item>
          <Form.Item>
            <span className="itemKey">认证服务地址</span>
            <Input {...approveProps} placeholder="如：http://192.168.1.113:80" size="large" />
          </Form.Item>
          <Form.Item>
            <span className="itemKey">镜像服务地址</span>
            <Input {...mirrorProps} placeholder="如：https://192.168.1.113:4081" />
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
    const { funcs, parentScope, form } = this.props
    const { createCluster, loadClusterList, loadLoginUserDetail } = funcs
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
            if (value && value.length > 30) {
              return callback([new Error('集群名称不能超过30个字符')])
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
      loadGlobalConfig,
    } = this.props
    const { noClusterStep } = this.state
    return (
      <Modal title="添加集群"
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
        <Alert message="请您先添加集群，添加完集群才能进行其他操作" type="warning" showIcon />
      }
      {
        (noCluster && noClusterStep === 1) && (
          <NoClusterStepOne
            globalConfig={globalConfig}
            loadGlobalConfig={loadGlobalConfig}
            updateGlobalConfig={updateGlobalConfig}
            isValidConfig={isValidConfig}
            saveGlobalConfig={saveGlobalConfig}
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
    if (noCluster) {
      loadGlobalConfig()
    }
  }

  componentDidMount() {
    document.title = '基础设施 | 时速云'
    const { loginUser, getAddClusterCMD } = this.props
    const { role } = loginUser
    if (!this.checkIsAdmin()) {
      browserHistory.push('/')
    }
    getAddClusterCMD()
  }

  componentWillUnmount() {
    const { current, loadTeamClustersList } = this.props
    const { space } = current
    loadTeamClustersList(space.teamID, { size: 100 })
  }

  onTabChange(key) {
    const { changeActiveCluster } = this.props
    changeActiveCluster(key)
  }

  render() {
    const {
      intl, clustersIsFetching, clusters,
      currentClusterID, addClusterCMD, createCluster,
      license, noCluster, loadClusterList,
      loadLoginUserDetail, loginUser, globalConfig,
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
      if (cluster.clusterID) {
        ImageTabList.push(
          <TabPane tab={<div className='clusterDiv'><span>{cluster.clusterName}</span>{ cluster.isBuilder ? <Tooltip title='构建环境'><img src={CI} className='clusterImg'/></Tooltip> : <span></span>}</div>} key={cluster.clusterID}>
            <ClusterTabList cluster={cluster} />
          </TabPane>
        )
      }
    })
     /*clusters.map(cluster => (
      <TabPane tab={cluster.clusterName} key={cluster.clusterID}>
        <ClusterTabList cluster={cluster} />
      </TabPane>
    ))*/
    const clusterSum = clusters.length
    let createClusterBtnDisabled = true
    const maxClusters = license[camelize('max_clusters')]
    if (clusterSum < maxClusters) {
      createClusterBtnDisabled = false
    }
    return (
      <QueueAnim className='ClusterBox'
        type='right'
      >
        <div id='ClusterContent' key='ClusterContent'>
          <div className="alertRow">基础设施，在这里您可以完成容器云平台的计算资源池管理：集群的添加、删除，以及集群内主机的添加、删除，并管理主机内的容器实例、查看主机维度的监控等。</div>
          <CreateClusterModal
            {...this.props}
            parentScope={scope}
            addClusterCMD={addClusterCMD}
            funcs={{createCluster, loadClusterList, loadLoginUserDetail}}
            globalConfig={globalConfig}
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
                defaultActiveKey={currentClusterID}
                tabBarExtraContent={
                  <Tooltip
                    title={`当前许可证最多支持 ${maxClusters || '-'} 个 集群（目前已添加 ${clusterSum} 个）`}
                    placement="topLeft"
                    getTooltipContainer={() => document.getElementById('ClusterContent')}
                  >
                    <Button
                      disabled={createClusterBtnDisabled}
                      className='addBtn'
                      key='addBtn' size='large'
                      type='primary'
                      onClick={() => this.setState({ createModal: true })}>
                      <Icon type='plus' />&nbsp;
                        <span>添加集群</span>
                    </Button>
                  </Tooltip>
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
        </div>
      </QueueAnim>
    )
  }
}

ClusterList.propTypes = {
  intl: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
  const { entities, cluster, cluster_nodes, globalConfig } = state
  const { loginUser, current } = entities
  const { clusters, addClusterCMD } = cluster
  const { getAllClusterNodes } = cluster_nodes
  const getAllClusterNodesKeys = Object.keys(getAllClusterNodes)
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
  }
}

export default connect(mapStateToProps, {
  loadClusterList,
  getAddClusterCMD,
  createCluster,
  loadLoginUserDetail,
  changeActiveCluster,
  loadTeamClustersList,
  updateGlobalConfig,
  loadGlobalConfig,
  isValidConfig,
  saveGlobalConfig,
})(injectIntl(ClusterList, {
  withRef: true,
}))