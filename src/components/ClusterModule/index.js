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
import { Modal, Tabs, Icon, Menu, Button, Card, Form, Input, Tooltip, Spin } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/clusterList.less'
import ClusterTabList from './clusterTabList'
import NotificationHandler from '../../common/notification_handler'
import { browserHistory } from 'react-router'
import { ROLE_SYS_ADMIN, URL_REGEX } from '../../../constants'
import { loadClusterList, getAddClusterCMD, createCluster } from '../../actions/cluster'
import AddClusterOrNodeModalContent from './AddClusterOrNodeModal/Content'
import { camelize } from 'humps'

const TabPane = Tabs.TabPane;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

let CreateClusterModal = React.createClass({
  getInitialState() {
    return {
      submitBtnLoading: false,
    }
  },
  handleSubmit(e) {
    e && e.preventDefault()
    const { createCluster, loadClusterList, parentScope } = this.props
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }
      const notification = new NotificationHandler()
      createCluster(values, {
        success: {
          func: result => {
            notification.success(`添加集群 ${values.clusterName} 成功`)
            loadClusterList()
            parentScope.setState({
              createModal: false
            })
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
      callback([new Error('请填写 API Server')])
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
  render () {
    const { addClusterCMD, form } = this.props
    const { getFieldProps, getFieldValue } = form
    const { parentScope } = this.props
    const { submitBtnLoading } = this.state
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
    return (
      <Modal title="添加集群" visible={parentScope.state.createModal}
        wrapClassName="createClusterModal" width={500}
        onCancel={() => this.onCancel()}
        onOk={()=>this.handleSubmit()}
        footer={null}
      >
      <Tabs defaultActiveKey="newCluster">
        <TabPane tab="新建集群" key="newCluster">
          <AddClusterOrNodeModalContent CMD={addClusterCMD && addClusterCMD[camelize('default_command')]} />
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
          </Form>
          <div className="footer">
            <Button key="back" type="ghost" size="large" onClick={this.onCancel}>返 回</Button>
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
      license,
    } = this.props
    if (!this.checkIsAdmin() || clustersIsFetching) {
      return (
        <div className="loadingBox">
          <Spin size="large" />
        </div>
      )
    }
    /*if (clusters.length < 1) {
      return (
        <div className="loadingBox">
          暂无可用集群，请添加
        </div>)
    }*/
    const { formatMessage } = intl
    const otherImageHead = this.state.otherImageHead || []
    const scope = this
    let ImageTabList = clusters.map(cluster => (
      <TabPane tab={cluster.clusterName} key={cluster.clusterID}>
        <ClusterTabList cluster={cluster} />
      </TabPane>
    ))
    const clusterSum = clusters.length
    let createClusterBtnDisabled = true
    // const { maxClusters } = license
    let maxClusters = 5
    if (clusterSum < maxClusters) {
      createClusterBtnDisabled = false
    }
    return (
      <QueueAnim className='ClusterBox'
        type='right'
      >
        <div id='ClusterContent' key='ClusterContent'>
          <div className="alertRow">企业集成应用中心，这里有时速云企业版提供了业内顶尖的企业管理和开发工具集合，您可以在这里一键安装，并且在当前控制台完成所有应用的安装、卸载以及对应功能的管理。</div>

          <Tabs
            key='ClusterTabs'
            defaultActiveKey={currentClusterID}
            tabBarExtraContent={
              <Tooltip title={`当前版本支持 ${maxClusters || '-'} 个 集群（目前已添加 ${clusterSum} 个）`} placement="topLeft">
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
          {
            clusterSum < 1 && (
            <div key="loadingBox" className="loadingBox">
              暂无可用集群，请添加
            </div>)
          }
         <CreateClusterModal parentScope={scope} addClusterCMD={addClusterCMD} createCluster={createCluster} loadClusterList={loadClusterList} />
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
  return {
    loginUser: loginUser.info,
    clustersIsFetching: clusters.isFetching,
    clusters: clusters.clusterList ? clusters.clusterList : [],
    currentClusterID: current.cluster.clusterID,
    addClusterCMD: (addClusterCMD ? addClusterCMD.result : {}) || {},
    license: (getAllClusterNodes.nodes ? getAllClusterNodes.nodes.license : {}) || {},
  }
}


export default connect(mapStateToProps, {
  loadClusterList,
  getAddClusterCMD,
  createCluster,
})(injectIntl(ClusterList, {
  withRef: true,
}))