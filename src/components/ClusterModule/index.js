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
import { ROLE_SYS_ADMIN, URL_REGEX, CLUSTER_PAGE, NO_CLUSTER_FLAG, DEFAULT_CLUSTER_MARK } from '../../../constants'
import { loadClusterList, getAddClusterCMD, createCluster } from '../../actions/cluster'
import { loadLoginUserDetail } from '../../actions/entities'
import AddClusterOrNodeModalContent from './AddClusterOrNodeModal/Content'
import { camelize } from 'humps'

const TabPane = Tabs.TabPane;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

let CreateClusterModal = React.createClass({
  getInitialState() {
    return {
      submitBtnLoading: false,
      checkBtnLoading: false,
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
            loadClusterList()
            notification.success(`添加集群 ${values.clusterName} 成功`)
            parentScope.setState({
              createModal: false
            })
            resetFields()
          },
          isAsync: true
        },
        failed: {
          func: err => {
            notification.failed(`添加集群 ${values.clusterName} 失败`)
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
    loadClusterList(null, {
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
  render () {
    const { addClusterCMD, form, noCluster, parentScope, loginUser } = this.props
    const { getFieldProps, getFieldValue } = form
    const { submitBtnLoading, checkBtnLoading } = this.state
    const { tenxApi } = loginUser
    let cmd = addClusterCMD && addClusterCMD[camelize('default_command')] || ''
    cmd = cmd.replace('ADMIN_SERVER_URL', `${tenxApi.protocol}://${tenxApi.host}`)
    const clusterNamePorps = getFieldProps('clusterName', {
      rules: [
        { required: true, message: '请填写集群名称' },
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
        { required: true, whitespace: true, message: '请填写服务出口列表，多个出口英文逗号分开' },
      ]
    })
    const bindingDomainPorps = getFieldProps('bindingDomains', {
      rules: [
        { whitespace: true, message: '请填写域名列表，多个域名英文逗号分开' },
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
      <Modal title="添加集群"
        visible={noCluster || parentScope.state.createModal}
        closable={!noCluster}
        wrapClassName="createClusterModal"
        width={500}
        onCancel={() => this.onCancel()}
        onOk={()=>this.handleSubmit()}
        footer={null}
      >
      {
        noCluster &&
        <Alert message="请您先添加集群，添加完集群才能进行其他操作" type="warning" showIcon />
      }
      <Tabs defaultActiveKey="newCluster">
        <TabPane tab="新建集群" key="newCluster">
          <AddClusterOrNodeModalContent CMD={cmd} />
          <div style={{paddingBottom: 10}}>
            注：新建的首个集群，将设置对平台全部个人帐号开放
          </div>
          {
            noCluster &&
            <div className="footer">
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
              <span className="itemKey">服务出口列表</span>
              <Input
                {...bindingIPsPorps}
                placeholder="输入服务出口列表，多个出口英文逗号分开"
                type="textarea"/>
            </Form.Item>
            <Form.Item>
              <span className="itemKey">域名列表</span>
              <Input
                {...bindingDomainPorps}
                placeholder="输入域名列表，多个域名英文逗号分开"
                type="textarea" />
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
    </Modal>

    )
  }
})

CreateClusterModal = Form.create()(CreateClusterModal)

class ClusterList extends Component {
  constructor(props) {
    super(props)
    this.checkIsAdmin = this.checkIsAdmin.bind(this)
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
    const { loadClusterList } = this.props
    loadClusterList()
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

  render() {
    const {
      intl, clustersIsFetching, clusters,
      currentClusterID, addClusterCMD, createCluster,
      license, noCluster, loadClusterList,
      loadLoginUserDetail, loginUser,
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
          <TabPane tab={cluster.clusterName} key={cluster.clusterID}>
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
    const { maxClusters } = license
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
            loginUser={loginUser}
            noCluster={noCluster}
            parentScope={scope}
            addClusterCMD={addClusterCMD}
            funcs={{createCluster, loadClusterList, loadLoginUserDetail}}
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
  const { entities, cluster, cluster_nodes } = state
  const { loginUser, current } = entities
  const { clusters, addClusterCMD } = cluster
  const { getAllClusterNodes } = cluster_nodes
  const getAllClusterNodesKeys = Object.keys(getAllClusterNodes)
  return {
    loginUser: loginUser.info,
    noCluster: loginUser.info[camelize(NO_CLUSTER_FLAG)],
    clustersIsFetching: clusters.isFetching,
    clusters: clusters.clusterList ? clusters.clusterList : [],
    currentClusterID: current.cluster.clusterID,
    addClusterCMD: (addClusterCMD ? addClusterCMD.result : {}) || {},
    license: (getAllClusterNodesKeys[0] ? getAllClusterNodes[getAllClusterNodesKeys[0]].nodes.license : {}) || {},
  }
}

export default connect(mapStateToProps, {
  loadClusterList,
  getAddClusterCMD,
  createCluster,
  loadLoginUserDetail,
})(injectIntl(ClusterList, {
  withRef: true,
}))