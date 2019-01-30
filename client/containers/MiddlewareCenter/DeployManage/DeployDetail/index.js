/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * index.js page
 *
 * @author zhangtao
 * @date Tuesday September 11th 2018
 */
/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Deploy manage
 *
 * @author zhangxuan
 * @date 2018-09-06
 */
import React from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim';
import { Row, Col, Card, Tabs, Tooltip, Menu, Dropdown, Modal, notification, Icon } from 'antd'
import { browserHistory } from 'react-router'
import * as mcActions from '../../../../actions/middlewareCenter'
import TenxStatus from '../../../../../src/components/TenxStatus'
import { calcuDate } from '../../../../../src/common/tools'
import OldAppCluserServiceList from './oldAppCluserServiceList'
import { SettingO as SettingIcon } from '@tenx-ui/icon'
// antd1.x 包下没有es文件夹, return-button 的package.json 中有module关键字
// 打包工具会优先去这个关键字指向的路径去寻找包, 这样能够更好的使tree-shaking 工作.
// 尽管return-button的package.json 的main是指向./lib/index.js也不好使
import ReturnButton from '@tenx-ui/return-button/lib'
import '@tenx-ui/return-button/assets/index.css'
import './styles/index.less'

// import DeployDetailTable from './DeployDetailTable'

const mapStateToProps = state => {
  const { cluster } = state.entities.current
  const { AppClusterServerList = {} } = state.middlewareCenter
  return {
    cluster: cluster.clusterID, AppClusterServerList,
  }
}
@connect(mapStateToProps, {
  loadAppClusterDetail: mcActions.loadAppClusterDetail,
  loadAppClusterServerList: mcActions.loadAppClusterServerList,
  deleteAppsCluster: mcActions.deleteAppsCluster,
  restartAppsCluster: mcActions.restartAppsCluster,
})
class DeployDetail extends React.PureComponent {
  state = {
    appClusterDetail: {}, // 应用集群详情
    restartModal: false,
    deleteModal: false,
    confirmLoading: false,
  }
  componentDidMount() {
    this.loadData()
  }
  loadData = async () => {
    const { routeParams: { app_name } = {}, loadAppClusterDetail, cluster,
      loadAppClusterServerList } = this.props
    if (app_name) {
      loadAppClusterServerList(cluster, app_name)
      const result = await loadAppClusterDetail(cluster, app_name)
      const { result: { data = {} } = {} } = result.response.result
      const newData = {
        clusterName: data.clusterName || '-',
        describe: data.comment || '-',
        appName: data.appName || '-',
        appVersion: data.version || '-',
        status: data.status || '-',
        createTime: data.createTime || '-',
        address: data.address || '-',
      }
      this.setState({
        appClusterDetail: newData,
      })
    }

  }
  handleClick = () => {
    browserHistory.push('/middleware_center/deploy')
  }
  restart = () => {
    this.setState({
      restartModal: true,
    })
  }
  deleteDb = () => {
    this.setState({
      deleteModal: true,
    })
  }
  confirmRestart = async () => {
    const { restartAppsCluster, cluster, AppClusterServerList } = this.props
    const list = AppClusterServerList.data.data
    const names = []
    list.forEach(v => {
      names.push(v.metadata.name)
    })
    this.setState({
      confirmLoading: true,
    })
    try {
      await restartAppsCluster(cluster, names)
      await this.loadData()
      await notification.success({
        message: '重新部署应用成功',
      })
      await this.setState({
        restartModal: false,
        confirmLoading: false,
      })
    } catch (e) {
      await notification.error({
        message: '重新部署应用失败',
      })
      this.setState({
        confirmLoading: false,
      })
    }
  }
  confirmDelete = async () => {
    const { deleteAppsCluster, cluster, params } = this.props
    const { app_name } = params
    this.setState({
      confirmLoading: true,
    })
    try {
      await deleteAppsCluster(cluster, [ app_name ])
      await notification.success({
        message: '删除成功',
      })
      await this.setState({
        deleteModal: false,
        confirmLoading: false,
      })
      browserHistory.push({
        pathname: '/middleware_center/deploy',
        state: {
          active: 'BPM',
        },
      })
    } catch (e) {
      await notification.error({
        message: '删除应用失败',
      })
      this.setState({
        confirmLoading: false,
      })
    }
  }
  render() {
    const { AppClusterServerList, routeParams: { app_name } = {} } = this.props
    return (
      <QueueAnim className="DeployDetailWrapper layout-content">
        <div className="returnTitle" key="returnTitle">
          <ReturnButton onClick = {this.handleClick}>返回</ReturnButton>
          <span className="titleSpan">{app_name}</span>
        </div>
        <Row gutter={16} key="mainContent">
          <Col className="gutter-row" span={6}>
            <BaseInfoCard
              info={ this.state.appClusterDetail}
              scope={ this }
            />
          </Col>
          <Col className="gutter-row" span={18}>
            <DeployDetailTabs
              Tabdata = {AppClusterServerList} appName = {app_name}
            />
          </Col>
        </Row>
        <Modal
          visible={this.state.restartModal}
          title="确认执行重启操作吗"
          onOk={this.confirmRestart}
          onCancel={() => {
            this.setState({
              restartModal: false,
            })
          }}
          confirmLoading={this.state.confirmLoading}
        >
          <div>
            <Icon type="question-circle-o" style={{ color: '#2db7f5', marginRight: 5 }}/>
            确认重启集群吗？</div>
        </Modal>
        <Modal
          visible={this.state.deleteModal}
          title="确认执行删除操作吗"
          onOk={this.confirmDelete}
          onCancel={() => {
            this.setState({
              deleteModal: false,
            })
          }}
          confirmLoading={this.state.confirmLoading}
        >
          <div className="deleteBpm">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
            您是否确定要删除集群 { app_name }?
          </div>
        </Modal>
      </QueueAnim>
    )
  }
}

const stylep = { marginTop: '12' }
const styleAddress = { width: '200px', overflow: 'hidden', whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
}
export default DeployDetail
const style = { width: '80', display: 'inline-block' }
function BaseInfoCard({ info: {
  clusterName = '-',
  describe = '-',
  appName = '-',
  appVersion = '-',
  status = '-',
  createTime = '-',
  address = '-',
} = {}, scope }) {
  const options = () => {
    const optionClick = target => {
      const { key } = target
      if (key === 'restart') {
        scope.restart()
        return
      }
      if (key === 'delete') {
        scope.deleteDb()
        return
      }
    }
    const menu = (
      <Menu onClick={optionClick}>
        <Menu.Item key="restart">
          重启集群
        </Menu.Item>
        <Menu.Item key="delete">
          删除集群
        </Menu.Item>
      </Menu>
    );
    return <Dropdown overlay={menu}>
      <SettingIcon style={{ fontSize: 16 }}/>
    </Dropdown>
  }
  return (
    <div>
      <Card title="基本信息" bordered={false} className="BaseInfoCard" extra={options()}>
        <div>
          <p><span style={style}>集群名称:</span> <span>{clusterName}</span></p>
          <p><span style={style}>描述:</span> <span>{describe}</span></p>
          <p><span style={style}>应用名称:</span> <span>{appName}</span></p>
          <p><span style={style}>应用版本:</span> <span>{appVersion}</span></p>
          <p><span style={style}>状态:</span> <span>{status === '-' ? status : <TenxStatus phase={status}
            smart={true}/> }</span></p>
          <p><span style={style}>创建时间:</span> <span>{calcuDate(createTime)}</span></p>
        </div>
      </Card>
      <div style={{ height: '16' }}></div>
      <Card title="访问地址" bordered={false} className="BaseInfoCard">
        <p >AWS PaaS 实例控制台:</p>
        <Tooltip title={`${address}/portal/console/`}>
          <div style={styleAddress}>
            <a href={`http://${address}/portal/console/`}
              target="_blank">{`${address}/portal/console/`}
            </a>
          </div>
        </Tooltip>
        <p style={stylep}>AWS BPM PaaS 门户:</p>
        <Tooltip title={`${address}/portal/`}>
          <div style={styleAddress}>
            <a href={`http://${address}/portal/`}
              target="_blank">{`${address}/portal/`}
            </a>
          </div>
        </Tooltip>
      </Card>
      <Card title="租赁信息" className="BaseInfoCard">

      </Card>
    </div>
  )
}

const DEFAULT_TAB = '#nodeManage'
const TabPane = Tabs.TabPane

class DeployDetailTabs extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeTabKey: props.hash || DEFAULT_TAB,
      serviceList: null,
      availableReplicas: 0,
    }
  }
  componentWillReceiveProps(nextProps) {
    const { hash = DEFAULT_TAB } = nextProps
    if (hash === this.state.hash) return
    this.setState({
      activeKey: hash,
    })
  }
  onTabClick = activeTabKey => {
    if (activeTabKey === this.state.activeTabKey) {
      return
    }
    // const { pathname } = this.props
    const pathname = location.pathname
    this.setState({
      activeTabKey,
    })
    if (activeTabKey === DEFAULT_TAB) {
      activeTabKey = ''
    }
    browserHistory.push({
      pathname,
      hash: activeTabKey,
    })
  }
  // For change app status when service list change
  onServicesChange = (serviceList, availableReplicas, total) => {
    this.setState({
      serviceList,
      availableReplicas,
      total,
    })
  }
  render() {
    const { activeTabKey } = this.state
    const { Tabdata: { data: { data = [] } = {} } = {} } = this.props
    const k8sServiceList = data.map(service => service.service)
    return (
      <Card bordered={false} className="DeployDetailTable">
        <Tabs
          tabPosition="top"
          defaultActiveKey={DEFAULT_TAB}
          onTabClick={this.onTabClick}
          activeKey={activeTabKey}
        >
          <TabPane tab="节点管理" key={DEFAULT_TAB}>
            <OldAppCluserServiceList
              location={location}
              k8sServiceList={k8sServiceList}
              key="AppServiceList"
              // onServicesChange={this.onServicesChange}
              appName={this.props.appName} />
          </TabPane>
          {/* 暂时先不做 */}
          {/* <TabPane tab="审计日志" key={'#auditLog'}>
            <div>审计日志</div>
          </TabPane>
          <TabPane tab="拓扑图" key={'#graph'}>
            <div>拓扑图</div>
          </TabPane> */}
        </Tabs>
      </Card>
    )
  }
}
