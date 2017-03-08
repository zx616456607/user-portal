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
import ClusterTabList from './ClusterTabList'
import NotificationHandler from '../../common/notification_handler'
import { browserHistory } from 'react-router'
import { ROLE_SYS_ADMIN } from '../../../constants'
import { loadClusterList } from '../../actions/cluster'

const TabPane = Tabs.TabPane;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

let CreateClusterModal = React.createClass({
  handleSubmit(e) {
    e && e.preventDefault()
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        console.log('Errors in form!!!');
        return;
      }
      console.log('Submit!!!');
      console.log(values);
    });
  },
  checkName(rule, value, callback) {
    if(!value) {
      callback([new Error('sfsldslfjs')])
      return
    }
    callback()
  },
  btncancel() {
    const { parentScope, form } = this.props
    parentScope.setState({createModal: false})
    form.resetFields()
  },
  render () {
    const { getFieldProps ,getFieldValue} = this.props.form;
    const { parentScope } = this.props
    const clusterName = getFieldProps('clusterName', {
      rules: [
        { required: true },
        { validator: this.checkName },
      ]
    })
    const apiServer = getFieldProps('apiServer', {
      rules: [
        { required: true, whitespace: true, message: '请填写API Server' },
      ]
    })
    const apiTocken = getFieldProps('apiTocken', {
      rules: [
        { required: true, whitespace: true, message: '请填写API Tocken' },
      ]
    })
    const serverExport = getFieldProps('serverExport', {
      rules: [
        { required: true, whitespace: true, message: '请填写服务出口列表' },
      ]
    })
    const orgList = getFieldProps('orgList', {
      rules: [
        { required: true, whitespace: true, message: '请填写域名列表' },
      ]
    })
    const descProps = getFieldProps('descProps', {
      rules: [
        { whitespace: true },
      ]
    })
    return (
      <Modal title="添加集群" visible={parentScope.state.createModal}
        wrapClassName="createClusterModal" width={500}
        onCancel={() => this.btncancel()}
        onOk={()=>this.handleSubmit()}
      >
      <Form horizontal onSubmit={(e)=> this.handleSubmit(e)}>
        <br/>
        <Form.Item>
          <span className="itemKey">集群名称</span>
          <Input {...clusterName} size="large" />
        </Form.Item>
        <Form.Item>
          <span className="itemKey">API Server</span>
          <Input {...apiServer} />
        </Form.Item>
        <Form.Item>
           <span className="itemKey">API Tocken</span>
          <Input {...apiTocken} type="textarea"/>
        </Form.Item>
        <Form.Item>
          <span className="itemKey">服务出口列表</span>
          <Input {...serverExport} type="textarea"/>
        </Form.Item>
        <Form.Item>
          <span className="itemKey">域名列表</span>
          <Input {...orgList} type="textarea"/>
        </Form.Item>
        <Form.Item>
          <span className="itemKey">描述</span>
          <Input {...descProps} type="textarea"/>
        </Form.Item>
      </Form>
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
    const { loginUser } = this.props
    const { role } = loginUser
    if (!this.checkIsAdmin()) {
      browserHistory.push('/')
    }
  }

  render() {
    const { intl, clustersIsFetching, clusters, } = this.props
    if (!this.checkIsAdmin() || clustersIsFetching) {
      return (
        <div className="loadingBox">
          <Spin size="large" />
        </div>
      )
    }
    if (clusters.length < 1) {
      return (
        <div className="loadingBox">
          暂无可用集群，请添加
        </div>)
    }
    const { formatMessage } = intl
    const otherImageHead = this.state.otherImageHead || []
    const scope = this
    let ImageTabList = clusters.map(cluster => (
      <TabPane tab={cluster.clusterName} key={cluster.clusterID}>
        <ClusterTabList cluster={cluster} />
      </TabPane>
    ))
    return (
      <QueueAnim className='ClusterBox'
        type='right'
      >
        <div id='ClusterContent' key='ClusterContent'>
          <div className="alertRow">企业集成应用中心，这里有时速云企业版提供了业内顶尖的企业管理和开发工具集合，您可以在这里一键安装，并且在当前控制台完成所有应用的安装、卸载以及对应功能的管理。</div>

          <Tabs
            key='ClusterTabs'
            defaultActiveKey={clusters[0].clusterID}
            tabBarExtraContent={
              <Tooltip title="企业版 Lite 只支持一个集群，联邦集群等功能，请使用 Pro 版。" placement="topLeft">
                <Button className='addBtn' key='addBtn' size='large' type='primary' onClick={() => this.setState({ createModal: true })}>
                  <Icon type='plus' />&nbsp;
                    <span>添加集群</span>
                </Button>
              </Tooltip>
            }
          >
            {ImageTabList}
          </Tabs>
         <CreateClusterModal parentScope={scope}/>
        </div>
      </QueueAnim>
    )
  }
}

ClusterList.propTypes = {
  intl: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
  const { entities, cluster } = state
  const { loginUser } = entities
  const { clusters } = cluster
  return {
    loginUser: loginUser.info,
    clustersIsFetching: clusters.isFetching,
    clusters: clusters.result ? clusters.result.data : []
  }
}


export default connect(mapStateToProps, {
  loadClusterList,
})(injectIntl(ClusterList, {
  withRef: true,
}))