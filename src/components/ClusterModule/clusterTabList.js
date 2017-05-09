/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster Tab List component
 *
 * v0.1 - 2017-1-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Menu, Button, Card, Input, Dropdown, Spin, Modal, message, Icon, Checkbox, Tooltip,  Row, Col, Tabs } from 'antd'
import { Link ,browserHistory} from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import ClusterResourcesOverview from './clsuterResourcesOverview'
import HostList from './hostList'
import ClusterLabelManage from './clusterLabelManage'
import ClusterPlugin from './clusterPlugin'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import {
  // getAllClusterNodes,
  changeClusterNodeSchedule,
  deleteClusterNode,
  getKubectlsPods,
  getAddNodeCMD,
} from '../../actions/cluster_node'
import { getClusterSummary } from '../../actions/cluster'
import { addTerminal } from '../../actions/terminal'
import { NOT_AVAILABLE } from '../../constants'
import './style/clusterTabList.less'
import NotificationHandler from '../../common/notification_handler'
import { formatDate, calcuDate } from '../../common/tools'
import { camelize } from 'humps'
import AddClusterOrNodeModal from './AddClusterOrNodeModal'
import CreateAlarm from '../AppModule/AlarmModal'
import CreateGroup from '../AppModule/AlarmModal/CreateGroup'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const ButtonGroup = Button.Group
const TabPane = Tabs.TabPane;
const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  //},
  render: function () {
    const { isFetching, podList, containerList, cpuMetric, memoryMetric, license } = this.props
    // const clusterID = this.props.scope.props.clusterID
    const root = this
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (podList.length === 0) {
      return (
        <div style={{ lineHeight: '100px', height: '200px', paddingLeft: '30px' }}>您还没有主机，去创建一个吧！</div>
      )
    }
    const maxNodes = license[camelize('max_nodes')]
    let items = podList.map((item, index) => {
      const dropdown = (
        <Menu disabled={item.isMaster ? true : false}
            onClick={this.ShowDeleteClusterNodeModal.bind(this, item)}
            style={{ width: '100px' }}
          >
          <Menu.Item key={item.id}>
            <span>删除节点</span>
          </Menu.Item>
        </Menu>
      );
      return (
        <div className='podDetail' key={`${item.objectMeta.name}-${index}`} >
          <div className='name commonTitle'>
            主机名称
            {/*<Link to={`/cluster/${clusterID}/${item.objectMeta.name}`}>{item.objectMeta.name}</Link>*/}
          </div>
          <div className='status commonTitle'>
            状态
            {/*<span className={ item.ready == 'True' ? 'runningSpan' : 'errorSpan' }><i className='fa fa-circle' />&nbsp;&nbsp;{item.ready == 'True' ? '运行中' : '异常'}</span>*/}
          </div>
          <div className='role commonTitle'>
            节点角色
            {/*<Tooltip title={item.isMaster ? MASTER : SLAVE}>*/}
              {/*<span>{item.isMaster ? MASTER : SLAVE}</span>*/}
            {/*</Tooltip>*/}
          </div>
          <div className="alarm commonTitle">
            监控警告
            {/*<Tooltip title="查看监控">*/}
            {/*<Link to={`/cluster/${clusterID}/${item.objectMeta.name}?monitoring`}><svg className="managemoniter"><use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#managemoniter"></use></svg></Link>*/}
            {/*</Tooltip>*/}
            {/*<Tooltip title="告警设置" onClick={()=> this.props.scope.setState({alarmModal: true})}>*/}
            {/*<Icon type="notification" />*/}
            {/*</Tooltip>*/}
          </div>
          <div className='container commonTitle'>
            容器数
            {/*<span>{getContainerNum(item.objectMeta.name, containerList)}</span>*/}
          </div>
          <div className='cpu commonTitle'>
            Cpu
            {/*<span className='topSpan'>{item[camelize('cpu_total')] / 1000}核</span>*/}
            {/*<span className='bottomSpan'>{cpuUsed(item[camelize('cpu_total')], cpuMetric, item.objectMeta.name)}</span>*/}
          </div>
          <div className='memory commonTitle'>
            内存
            {/*<span className='topSpan'>{diskFormat(item[camelize('memory_total_kb')])}</span>*/}
            {/*<span className='bottomSpan'>{memoryUsed(item[camelize('memory_total_kb')], memoryMetric, item.objectMeta.name)}</span>*/}
          </div>
          <div className='schedule commonTitle'>
            调度状态
            {/*<Switch*/}
              {/*className='switchBox'*/}
              {/*defaultChecked={item.schedulable}*/}
              {/*checkedChildren='开'*/}
              {/*unCheckedChildren='关'*/}
              {/*disabled={index >= maxNodes}*/}
              {/*onChange={this.changeSchedulable.bind(root, item.objectMeta.name)}/>*/}
            {/*<span className='scheduleSpan'>*/}
              {/*{*/}
                {/*item.schedulable*/}
                {/*? (*/}
                  {/*<span>*/}
                    {/*正常调度&nbsp;*/}
                    {/*<Tooltip title={`允许分配新容器`}>*/}
                      {/*<Icon type="question-circle-o" />*/}
                    {/*</Tooltip>*/}
                  {/*</span>*/}
                {/*)*/}
                {/*: (*/}
                  {/*<span>*/}
                    {/*暂停调度&nbsp;*/}
                    {/*<Tooltip title={`不允许分配新容器，正常运行的不受影响`}>*/}
                      {/*<Icon type="question-circle-o" />*/}
                    {/*</Tooltip>*/}
                  {/*</span>*/}
                {/*)*/}
              {/*}*/}
            {/*</span>*/}
          </div>
          <div className='runningTime commonTitle'>
            运行时间
            {/*<Tooltip title={calcuDate(item.objectMeta.creationTimestamp)}>*/}
            {/*<span>{calcuDate(item.objectMeta.creationTimestamp)}</span>*/}
            {/*</Tooltip>*/}
          </div>
          <div className='startTime commonTitle'>
            启动时间
            {/*<Tooltip title={formatDate(item.objectMeta.creationTimestamp)}>*/}
              {/*<span>{formatDate(item.objectMeta.creationTimestamp)}</span>*/}
            {/*</Tooltip>*/}
          </div>
          <div className='opera commonTitle'>
            {/*<Dropdown.Button type="ghost" overlay={dropdown}  onClick={()=> browserHistory.push(`/cluster/${clusterID}/${item.objectMeta.name}`)}>
              主机详情
            </Dropdown.Button>*/}
          </div>
        </div>
      );
    });
    return (
      <div className='imageList'>
        {items}
      </div>
    );
  }
});


class ClusterTabList extends Component {
  constructor(props) {
    super(props);
    this.loadData = this.loadData.bind(this);
    this.deleteClusterNode = this.deleteClusterNode.bind(this);
    this.closeDeleteModal = this.closeDeleteModal.bind(this);
    this.openTerminalModal = this.openTerminalModal.bind(this);
    this.handleAddClusterNode = this.handleAddClusterNode.bind(this)
    this.copyAddNodeCMD = this.copyAddNodeCMD.bind(this)
    this.cancelModal = this.cancelModal.bind(this)
    this.nextStep = this.nextStep.bind(this)
    this.state = {
      nodeList: [],
      podCount: [],
      currentContainer: [],
      deleteNodeModal: false,
      addClusterOrNodeModalVisible: false,
      deleteNode: null,
      copyAddNodeSuccess: false,
      step:1 // create alarm modal step
    }
  }

  loadData(props) {
    const { getAllClusterNodes, clusterID, getKubectlsPods } = props || this.props
    getAllClusterNodes(clusterID, {
      success: {
        func: (result) => {
          let nodeList = result.data.clusters.nodes.nodes;
          let podCount = result.data.clusters.podCount;
          this.setState({
            nodeList: nodeList,
            podCount: podCount
          })
        },
        isAsync: true
      }
    })
    getKubectlsPods(clusterID)
  }

  componentWillMount() {
    // this.loadData()
  }

  // componentWillReceiveProps(nextProps) {
  //   const { clusterID } = nextProps
  //   if (clusterID === this.props.clusterID) {
  //     return
  //   }
  //   this.loadData(nextProps)
  // }

  componentDidMount() {
    const { clusterID, getAddNodeCMD, getClusterSummary } = this.props
    getAddNodeCMD(clusterID)
    getClusterSummary(clusterID)
  }

  copyAddNodeCMD() {
    //this function for user click the copy btn and copy the download code
    const code = document.getElementById('addClusterOrNodeCMDInput')
    code.select()
    document.execCommand('Copy', false)
    this.setState({
      copyAddNodeSuccess: true
    })
  }


  cancelModal() {
    // cancel create Alarm modal
    this.setState({
      alarmModal: false,
      step:1
    })
  }
  nextStep(step) {
    this.setState({
      step: step
    })
  }
  deleteClusterNode() {
    //this function for delete cluster node
    let notification = new NotificationHandler()
    const { clusterID, deleteClusterNode, getAllClusterNodes } = this.props;
    const { deleteNode } = this.state;
    const _this = this;
    if (deleteNode.isMaster) {
      notification.warn(`不能删除${MASTER}`)
      return
    }
    deleteClusterNode(clusterID, deleteNode.objectMeta.name, {
      success: {
        func: () => {
          getAllClusterNodes(clusterID, {
            success: {
              func: (result) => {
                let nodeList = result.data.clusters.nodes.nodes;
                notification.success('主机节点删除成功');
                _this.setState({
                  nodeList: nodeList,
                  deleteNodeModal: false
                })
              },
              isAsync: true
            }
          })
        },
        isAsync: true
      }
    });
  }

  closeDeleteModal() {
    //this function for close delete node modal
    this.setState({
      deleteNodeModal: false
    })
  }

  openTerminalModal() {
    const { kubectlsPods, addTerminal, clusterID } = this.props
    let { currentContainer } = this.state;
    let notification = new NotificationHandler()
    if (currentContainer.length > 0) {
      addTerminal(clusterID, currentContainer[0])
      return
    }
    const { namespace, pods } = kubectlsPods
    if (!pods || pods.length === 0) {
      notification.warn('没有可用终端节点，请联系管理员')
      return
    }
    let randomPodNum = Math.ceil(Math.random() * pods.length)
    if (randomPodNum === 0) randomPodNum = 1
    currentContainer = [{
      metadata: {
        namespace,
        name: pods[randomPodNum - 1]
      }
    }]
    addTerminal(clusterID, currentContainer[0])
    this.setState({
      currentContainer,
    })
  }

  handleAddClusterNode() {
    this.setState({
      addClusterOrNodeModalVisible: true,
    })
  }

  render() {
    const {
      intl, isFetching, nodes,
      clusterID, memoryMetric, cpuMetric,
      license, kubectlsPods, addNodeCMD,
      cluster, clusterSummary,
    } = this.props
    const { formatMessage } = intl;
    const { nodeList, podCount, deleteNode, copyAddNodeSuccess } = this.state;
    const rootscope = this.props.scope;
    const scope = this;
    let oncache = this.state.currentContainer.map((item) => {
      return item.metadata.name;
    })
    const maxNodes = license && license[camelize('max_nodes')]
    const modalFunc=  {
      scope : this,
      cancelModal: this.cancelModal,
      nextStep: this.nextStep
    }
    return (
      <QueueAnim className='clusterTabListBox'
        type='right'
        >
        <div id='clusterTabList' key='clusterTabList'>
          <Tabs>

            <TabPane tab={<div className='tablepanediv'><i className="fa fa-tachometer" aria-hidden="true"></i><span className='tablepanespan'>资源总览</span></div>} key="1">
            <ClusterResourcesOverview
              cluster={cluster}
              clusterSummary={clusterSummary}
            />

            </TabPane>
            <TabPane tab={<div><i className="fa fa-server" aria-hidden="true"></i><span className='tablepanespan'>主机列表</span></div>} key="2">
              <HostList
                cluster={cluster}
                clusterID={clusterID}
                containerList={podCount}
              />
            </TabPane>
            <TabPane tab={<div><i className="fa fa-tag" aria-hidden="true"></i><span className='tablepanespan'>标签管理</span></div>} key="3">
              <ClusterLabelManage  clusterID={clusterID} />
            </TabPane>

            <TabPane tab={<div><i className="fa fa-plug" aria-hidden="true"></i><span className='tablepanespan'>插件集群</span></div>} key="4">
              <ClusterPlugin
              />
            </TabPane>
          </Tabs>

          <Modal title='删除主机节点' className='deleteClusterNodeModal' visible={this.state.deleteNodeModal} onOk={this.deleteClusterNode} onCancel={this.closeDeleteModal}>
            <div style={{ color: '#00a0ea', height: "50px" }}>
              <Icon type='exclamation-circle-o' />
              &nbsp;&nbsp;&nbsp;确定要删除&nbsp;{deleteNode ? deleteNode.objectMeta.name : ''}&nbsp;主机节点？
            </div>
            <div className="note">注意：请保证其他开启调度状态的主机节点，剩余的配置足够运行所有应用的容器</div>
          </Modal>
          <AddClusterOrNodeModal
            title="添加主机节点"
            visible={this.state.addClusterOrNodeModalVisible}
            closeModal={() => this.setState({addClusterOrNodeModalVisible: false})}
            CMD={addNodeCMD && addNodeCMD[camelize('default_command')]}
            bottomContent={<p>注意：新添加的主机需要与 Master 节点同一内网，可互通</p>} />

          <Modal title="创建告警策略" visible={this.state.alarmModal} width={580}
            className="alarmModal"
            onCancel={()=> this.setState({alarmModal:false})}
            maskClosable={false}
            footer={null}
          >
            <CreateAlarm funcs={modalFunc}/>
          </Modal>
          {/* 通知组 */}
          <Modal title="创建新通知组" visible={this.state.createGroup}
            width={560}
            maskClosable={false}
            wrapClassName="AlarmModal"
            className="alarmContent"
            footer={null}
          >
            <CreateGroup funcs={modalFunc}/>
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

ClusterTabList.propTypes = {
  intl: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
  // const pods = {
  //   nodes: {},
  //   isFetching: false
  // }
  const clusterID = props.cluster.clusterID
  // const { getAllClusterNodes, kubectlsPods, addNodeCMD } = state.cluster_nodes
  const { clusterSummary } = state.cluster
  // const targetAllClusterNodes = getAllClusterNodes[clusterID]
  // const { isFetching } = targetAllClusterNodes || pods
  // const data = (targetAllClusterNodes && targetAllClusterNodes.nodes) || pods
  // const { cpuMetric, memoryMetric, license } = data
  // const nodes = data.clusters ? data.clusters.nodes : []
  return {
  //   nodes,
  //   cpuMetric,
  //   memoryMetric,
  //   license,
  //   isFetching,
    clusterID,
  //   kubectlsPods: (kubectlsPods ? kubectlsPods.result : {}) || {},
  //   addNodeCMD: addNodeCMD[clusterID] || {},
    clusterSummary: (clusterSummary && clusterSummary[clusterID] ? clusterSummary[clusterID].summary : {}) || {},
  }
}

export default connect(mapStateToProps, {
  // getAllClusterNodes,
  changeClusterNodeSchedule,
  deleteClusterNode,
  getKubectlsPods,
  getAddNodeCMD,
  getClusterSummary,
  addTerminal
})(injectIntl(ClusterTabList, {
  withRef: true,
}))