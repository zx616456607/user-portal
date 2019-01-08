/**
 * Created by zhangchengzheng on 2017/5/2.
 */
import React, { Component, propTypes } from 'react'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import NotificationHandler from '../../components/Notification'
import { Card, Button, Tooltip, Icon, Input, Spin, Menu, Dropdown, Switch, Tag, Modal, Form, Table, Pagination } from 'antd'
import { formatDate, calcuDate, getHostLastHeartbeatTime } from '../../common/tools'
import { camelize } from 'humps'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import {
  getAllClusterNodes, getClusterNodesMetrics, getKubectlsPods,
  deleteClusterNode, getClusterLabel, changeClusterNodeSchedule,
  getNodeDetail, maintainNode, exitMaintainNode, getNotMigratedPodCount,
  getClusterResourceConsumption,
} from '../../actions/cluster_node'
import { addTerminal } from '../../actions/terminal'
import { NOT_AVAILABLE } from '../../constants'
import AddClusterOrNodeModal from './AddClusterOrNodeModal'
import TagDropdown from './TagDropdown'
import ManageLabelModal from './MangeLabelModal'
import './style/hostList.less'
import isEmpty from 'lodash/isEmpty'
import TenxIcon from '@tenx-ui/icon/es/_old'
import intlMsg from './hostListIntl'
import clusterDetailIntlMsg from './ClusterDetailIntl'
import * as moment from 'moment';

const MASTER = 'Master'
const SLAVE = 'Slave'
const SubMenu = Menu.SubMenu;

function diskFormat(num) {
  if (num < 1024) {
    return num + 'KB'
  }
  num = Math.floor(num / 1024 * 100) / 100;
  if (num < 1024) {
    return num + 'MB'
  }
  num = Math.floor(num / 1024 * 100) / 100;
  if (num < 1024) {
    return num + 'GB'
  }
  num = Math.floor(num / 1024 * 100) / 100;
  return num + 'TB'
}

function getContainerNum(name, podList) {
  //this function for return the container num of node
  let num;
  podList.map((pod) => {
    if (pod.name == name) {
      num = pod.count;
    }
  });
  return num;
}

function getRS(resourceConsumption, record) {
  if (!resourceConsumption || !record || !resourceConsumption[record.objectMeta.name]) {
    return {
      cpu: {
        number: NOT_AVAILABLE,
        unit: '',
        class: '',
      },
      memory: {
        number: NOT_AVAILABLE,
        unit: '',
        class: '',
      },
    }
  }
  const name = record.objectMeta.name
  const { cpu, memory } = resourceConsumption[name].requests || {}
  const data = {
    cpu: {
      number: cpu,
      unit: 'm',
    },
    memory: {
      number: Math.round(memory / 1024 / 1024 * 100) / 100,
      unit: 'GB',
    },
  }
  const cpuTotal = record[camelize('cpu_total')]
  data.cpu.class = getRSClass(data.cpu.number / cpuTotal)
  const memoryTotal = record[camelize('memory_total_kb')]
  data.memory.class = getRSClass(memory / memoryTotal)
  return data
}

function getRSClass(percent) {
  if (percent < 0.8) {
    return ''
  }
  if (percent < 0.9) {
    return 'warnColor'
  }
  return 'failedColor'
}

function cpuUsed(cpuTotal, cpuMetric, name) {
  name = camelize(name)
  if (!cpuMetric || !cpuMetric[name]) {
    return {
      number: NOT_AVAILABLE,
      class: '',
      unit: '',
    }
  }
  return {
    number: Math.round(cpuMetric[name] * 100) / 100,
    class: getRSClass(cpuMetric[name] / 100),
    unit: '%',
  }
}

function memoryUsed(memoryTotal, memoryMetric, name) {
  name = camelize(name)
  if (!memoryMetric || !memoryMetric[name]) {
    return {
      number: NOT_AVAILABLE,
      class: '',
      unit: '',
    }
  }
  let metric = memoryMetric[name]
  metric = Math.round(metric / 1024 / memoryTotal * 100 * 100) / 100
  // metric = `${metric.toFixed(2)}%`
  return {
    number: metric,
    class: getRSClass(metric / 100),
    unit: '%',
  }
}


const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  changeSchedulable(node, e) {
    //this function for change node schedulable
    const { scope, intl: { formatMessage } } = this.props;
    const { clusterID, changeClusterNodeSchedule } = scope.props;
    let { nodeList } = scope.state;
    let notification = new NotificationHandler()
    changeClusterNodeSchedule(clusterID, node, e, {
      success: {
        func: () => {
          // notification.info(e ? '开启调度中，该操作 1 分钟内生效' : '关闭调度中，该操作 1 分钟内生效');
          notification.success(e ? formatMessage(intlMsg.openDispatchSuccess) : formatMessage(intlMsg.closeDispatchSuccess));
          nodeList.map((item) => {
            if (item.objectMeta.name == node) {
              item.schedulable = e;
            }
          });
          scope.setState({
            nodeList: nodeList
          })
        },
        isAsync: true
      }
    })
  },
  ShowDeleteClusterNodeModal(node,item) {
    //this function for delete cluster node
    const { scope } = this.props;
    let handle = item.key.split('/')[0]
    if(handle == 'manage'){
      scope.setState({
        deleteNode: node,
        manageLabelModal : true
      })
      return
    }
    if(handle == 'delete'){
      scope.setState({
        deleteNode: node,
        deleteNodeModal: true
      })
    }
    if (handle === 'maintain') {
      this.loadNodeDetail(node)
    }
    if (handle === 'exitMaintain') {
      this.nodeIsMigrate(node)
    }
  },
  combineForceBody(node, pod) {
    const body = {};
    (pod || []).forEach(item => {
      switch (item.msgType) {
        case 0:
          Object.assign(body, { deleteLocalStoragePod: true })
          break;
        case 1:
          Object.assign(body, { deleteLabelPod: true })
          break;
        case 2:
          Object.assign(body, { deleteNodeSelector: true })
          break;
        default:
          break;
      }
    })
    if (body.hasOwnProperty('deleteLabelPod')) {
      return body
    }
    (node || []).forEach(item => {
      if (item.resourceKind === 'loadbalance') {
        Object.assign(body, { deleteLabelPod: true })
        return
      }
    })
    return body
  },
  async loadNodeDetail(currentNode){
    const { getNodeDetail, clusterID, scope } = this.props
    const result = await getNodeDetail(clusterID, currentNode.objectMeta.name)
    const { node, pod } = result.response.result.data || { node: [], pod: []}
    scope.setState({
      deleteNode: currentNode,
      maintainModal: true
    })
    if (isEmpty(node) && isEmpty(pod)) {
      scope.setState({
        canMaintain: true
      })
      return
    }
    scope.setState({
      canMaintain: false,
      forceBody: this.combineForceBody(node, pod)
    })
  },
  async nodeIsMigrate(currentNode) {
    const { getNotMigratedPodCount, clusterID, scope, intl: { formatMessage } } = this.props
    const result = await getNotMigratedPodCount(clusterID, currentNode.objectMeta.name)
    const res = result.response.result.data
    const { current } = res[Object.keys(res)[0]]
    if (current === 0 || currentNode.objectMeta.annotations.maintenance === 'failed') {
      scope.setState({
        deleteNode: currentNode,
        exitMaintainModal: true
      })
    } else {
      Modal.info({
        content: formatMessage(intlMsg.migrateUnfinishedNotExit),
      });
    }
  },
  getDiskStatus(node) {
    const { intl: { formatMessage } } = this.props
    const conditions = node.conditions || []
    let color = 'green'
    let text = formatMessage(intlMsg.health)
    conditions.forEach(condition => {
      const { type, status } = condition
      switch (type) {
        case 'DiskPressure':
          if (status !== 'False' && status !== 'Unknown') {
            color = 'yellow'
            text = formatMessage(intlMsg.notEnough)
          }
          break
        case 'OutOfDisk':
          if (status !== 'False' && status !== 'Unknown') {
            color = 'red'
            text = formatMessage(intlMsg.alarm)
          }
          break
        default:
          break
      }
    })
    return (
      <Tag color={color}>{text}</Tag>
    )
  },
  renderStatus(text, record) {
    const { intl: { formatMessage } } = this.props
    const { maintainStatus, current, total } = record.objectMeta.annotations || { maintainStatus: 'fetching', current: 0, total: 0 }
    let message = formatMessage(intlMsg.abnormal)
    let classname = 'errorSpan'
    if (text === 'True') {
      if (record.objectMeta.annotations.maintenance === 'true') {
        message = formatMessage(intlMsg.inMaintenance)
        classname = 'themeColor'
        if (maintainStatus === 'processing') {
          message = '服务迁移中'
        }
      } else if (record.objectMeta.annotations.maintenance === 'failed') {
        message = formatMessage(intlMsg.migrateFail)
        classname = 'errorSpan'
      } else {
        message = formatMessage(intlMsg.running)
        classname = 'runningSpan'
      }
    }
    return (
      <div>
        <span className={classname}>
          <i className='fa fa-circle'/>&nbsp;&nbsp;{message}
          {
            maintainStatus === 'processing' &&
            <Tooltip
              title={formatMessage(intlMsg.notDoWhenMigratingTip)}
            >
              <Icon type="exclamation-circle-o" />
            </Tooltip>
          }
        </span>
        {
          maintainStatus === 'processing' && <div><FormattedMessage {...intlMsg.hasMigratedServer}/> <span>{total - current}</span>/{total}</div>
        }
      </div>
    )
  },
  isShowHeartbeatWarning(masterLastHeartbeatTime, nodeLastHeartbeatTime) {
    if (!masterLastHeartbeatTime || !nodeLastHeartbeatTime) {
      return false
    }
    const timeError = Math.abs((new Date(masterLastHeartbeatTime) - new Date(nodeLastHeartbeatTime)))
    if (timeError < 5 * 60 * 1000) {
      return false
    }
    return moment.duration(timeError).humanize()
  },
  render: function () {
    const {
      isFetching, nodeList, cpuMetric, memoryMetric, clusterID,
      resourceConsumption, license, podCount , intl: { formatMessage },
    } = this.props
    const root = this
    let masterLastHeartbeatTime
    nodeList.every(node => {
      if (node.isMaster) {
        masterLastHeartbeatTime = getHostLastHeartbeatTime(node)
        return false
      }
      return true
    })
    let dropdown
    let maxNodes
    let column = [
      {
        title: formatMessage(intlMsg.nameOrIp)
      },{
        title: formatMessage(intlMsg.status)
      },{
        title: formatMessage(intlMsg.role)
      },{
        title: formatMessage(intlMsg.monitorAlert)
      },{
        title: formatMessage(intlMsg.container)
      },{
        title: 'CPU'
      },{
        title: formatMessage(intlMsg.memory)
      },{
        title: formatMessage(intlMsg.dispatchStatus)
      },{
        title: formatMessage(intlMsg.diskCondition)
      },{
        title: formatMessage(intlMsg.joinClusterTime)
      }, {
        title: formatMessage(intlMsg.operation)
      }
    ]
    if(nodeList && nodeList.length !== 0){
      maxNodes = license && license[camelize('max_nodes')]
      dropdown = item => {
        return (
          <Menu disabled={item.isMaster ? true : false}
            onClick={this.ShowDeleteClusterNodeModal.bind(this, item)}
            style={{ width: '100px' }}
          >
            <Menu.Item key={'manage/'+item.address}>
              <span><FormattedMessage {...intlMsg.manageLabel}/></span>
            </Menu.Item>
            <Menu.Item key={'delete/'+item.address}>
              <span><FormattedMessage {...intlMsg.deleteNode}/></span>
            </Menu.Item>
            {
              ['true', 'failed'].includes(item.objectMeta.annotations.maintenance)
                ?
                <Menu.Item key={'exitMaintain/'+item.address}>
                  <span><FormattedMessage {...intlMsg.exitMaintain}/></span>
                </Menu.Item>
                :
                <Menu.Item key={'maintain/'+item.address}>
                  <span><FormattedMessage {...intlMsg.nodeMaintain}/></span>
                </Menu.Item>
            }
          </Menu>
        )
      }
      column = [
        {
          title: formatMessage(intlMsg.nameOrIp),
          dataIndex: 'objectMeta.name',
          render: (text, item, index) => <Tooltip
            title={`${formatMessage(clusterDetailIntlMsg.lastHeartbeatTime)}${getHostLastHeartbeatTime(item)}`}
          >
            <div
              onClick={() => { browserHistory.push(`/cluster/${clusterID}/host/${item.objectMeta.name}`) }}
              className='nameIP'
            >
              <div className="hostname">
                {item.objectMeta.name}
              </div>
              <div className="address">{item.address}</div>
            </div>
          </Tooltip>,
          sorter: (a, b) => (a.objectMeta.name).localeCompare(b.objectMeta.name)
        },{
          title: formatMessage(intlMsg.status),
          dataIndex: 'ready',
          render: (text, record) => this.renderStatus(text, record),
          sorter: (a, b) => readySorter(a.ready) - readySorter(b.ready)
        },{
          title: formatMessage(intlMsg.role),
          dataIndex: 'isMaster',
          render: (isMaster, item) => {
            const timeError = this.isShowHeartbeatWarning(masterLastHeartbeatTime, getHostLastHeartbeatTime(item))
            return <div>
              <div>
                <span>{isMaster ? MASTER : SLAVE}</span>
                {
                  timeError
                    ? <Tooltip title={formatMessage(intlMsg.lastHeartbeatTimeTips, { time: timeError })}>
                      <Icon className="heartbeatWarningTip" type="exclamation-circle-o" />
                    </Tooltip>
                    : null
                }
              </div>
            </div>
          },
          sorter: (a, b) => isMasterSorter(a.isMaster) - isMasterSorter(b.isMaster)
        },{
          title: formatMessage(intlMsg.monitorAlert),
          dataIndex: 'objectMete',
          render: (objectMeta, item, index) => <div className='alarm'>
            <Tooltip title={formatMessage(intlMsg.checkMonitor)}>

              <TenxIcon type="manage-monitor"
                        className="managemoniter"
                        onClick={()=> browserHistory.push(`/cluster/${clusterID}/${item.objectMeta.name}?tab=monitoring`)}/>
            </Tooltip>
            <Tooltip title={formatMessage(intlMsg.alertSetting)} onClick={()=> browserHistory.push(`/cluster/${clusterID}/${item.objectMeta.name}?tab=alarm&open=true`)} >
              <Icon type="notification" />
            </Tooltip>
          </div>
        },{
          title: formatMessage(intlMsg.container),
          dataIndex: 'objectMeta',
          render: (objectMeta) => <div>
            <span>{getContainerNum(objectMeta.name, podCount)}</span>
          </div>,
          sorter: (a, b) => getContainerNum(a.objectMeta.name, podCount) - getContainerNum(b.objectMeta.name, podCount)
        },{
          title: 'CPU',
          render: (text, record, index) => {
            const { cpu: cpuRS } = getRS(resourceConsumption, record)
            const cpuUsedObj = cpuUsed(record[camelize('cpu_total')], cpuMetric, record.objectMeta.name)
            return <div>
              <div>
                <span className="justify"><FormattedMessage {...intlMsg.amount}/></span>：
                <code>{record[camelize('cpu_total')]}m</code>
              </div>
              <div className={cpuRS.class}>
                <span className="justify"><FormattedMessage {...intlMsg.assigned}/></span>：
                <code>{cpuRS.number}{cpuRS.unit}</code>
              </div>
              <div className={cpuUsedObj.class}>
                <span className="justify"><FormattedMessage {...intlMsg.use}/></span>：
                <code>
                  {cpuUsedObj.number}{cpuUsedObj.unit}
                </code>&nbsp;
                <Tooltip title={formatMessage(intlMsg.useTips)}>
                  <Icon type="question-circle-o" />
                </Tooltip>
              </div>
            </div>
          }
        },{
          title: formatMessage(intlMsg.memory),
          render: (text, item, index) => {
            const { memory: memoryRS } = getRS(resourceConsumption, item)
            const memoryUsedObj = memoryUsed(item[camelize('memory_total_kb')], memoryMetric, item.objectMeta.name)
            return <div>
            <div>
              <span className="justify"><FormattedMessage {...intlMsg.amount}/></span>：
              <code>{diskFormat(item[camelize('memory_total_kb')])}</code>
              </div>
              <div className={memoryRS.class}>
                <span className="justify"><FormattedMessage {...intlMsg.assigned}/></span>：
                <code>{memoryRS.number}{memoryRS.unit}</code>
              </div>
              <div className={memoryUsedObj.class}>
                <span className="justify"><FormattedMessage {...intlMsg.use}/></span>：
                <code>
                  {memoryUsedObj.number}{memoryUsedObj.unit}
                </code>&nbsp;
                <Tooltip title={formatMessage(intlMsg.useTips)}>
                  <Icon type="question-circle-o" />
                </Tooltip>
              </div>
              {/* <div className='topSpan'>{diskFormat(item[camelize('memory_total_kb')])}</div>
              <div className='bottomSpan'>{memoryUsed(item[camelize('memory_total_kb')], memoryMetric, item.objectMeta.name)}</div> */}
            </div>
          }
        },{
          title: formatMessage(intlMsg.dispatchStatus),
          dataIndex: 'schedulable',
          render: (text, item, index) => {
            const isMaintaining = ['true', 'failed'].includes(item.objectMeta.annotations.maintenance)
            return (
              <div>
                <Tooltip
                  title={isMaintaining ? formatMessage(intlMsg.maintainNoDispatchSwitch) : ''}
                >
                  <Switch
                    className='switchBox'
                    checked={item.schedulable || false}
                    checkedChildren={formatMessage(intlMsg.on)}
                    unCheckedChildren={formatMessage(intlMsg.off)}
                    disabled={index >= maxNodes}
                    onChange={
                      isMaintaining ? () => null :
                      this.changeSchedulable.bind(root, item.objectMeta.name)
                    } />
                </Tooltip>
                <br/>
                <span className='scheduleSpan'>
                  {
                    item.schedulable
                      ? <span>
                        <FormattedMessage {...intlMsg.normalDispatch}/>&nbsp;
                        <Tooltip title={formatMessage(item.isMaster ? intlMsg.allowSysContainer : intlMsg.allowNewContainer)}>
                          <Icon type="question-circle-o" />
                        </Tooltip>
                      </span>
                      : <span>
                        <FormattedMessage {...intlMsg.pauseDispatch}/>&nbsp;
                        <Tooltip title={formatMessage(item.isMaster ? intlMsg.notAllowSysContainer : intlMsg.notAllowNewContainer)}>
                          <Icon type="question-circle-o" />
                        </Tooltip>
                      </span>
                  }
                </span>
              </div>
            )
          },
          sorter: (a, b) => isMasterSorter(a.schedulable) - isMasterSorter(b.schedulable)
        },{
          title: formatMessage(intlMsg.diskCondition),
          dataIndex: 'conditions',
          render: (text, item, index) => <div>{this.getDiskStatus(item)}</div>,
          sorter: (a, b) => diskSorter(a.conditions) - diskSorter(b.conditions)
        },{
          title: formatMessage(intlMsg.joinClusterTime),
          dataIndex: 'objectMeta.creationTimestamp',
          render: (text, item, index) => <div>
            <Tooltip title={formatDate(item.objectMeta.creationTimestamp)}>
              <span className="timeSpan">{calcuDate(item.objectMeta.creationTimestamp)}</span>
            </Tooltip>
          </div>,
          sorter: (a, b) => soterCreateTime(a.objectMeta.creationTimestamp, b.objectMeta.creationTimestamp)
        },{
          title: formatMessage(intlMsg.operation),
          render: (text, item, index) => <div>
            <Dropdown.Button type="ghost" overlay={dropdown(item)} onClick={() => browserHistory.push(`/cluster/${clusterID}/host/${item.objectMeta.name}`)}>
              <FormattedMessage {...intlMsg.hostDetail}/>
            </Dropdown.Button>
          </div>
        }
      ]
    }
    function readySorter(ready){
      if(ready == 'True'){
        return 1
      }
      return -1
    }

    function isMasterSorter(a){
      if(a){
        return 1
      }
      return -1
    }

    function diskSorter(conditions){
      let conditionsArray = conditions || []
      let sorterNumber = 1
      conditionsArray.forEach(condition => {
        const { type, status } = condition
        switch (type) {
          case 'DiskPressure':
            if (status !== 'False') {
              sorterNumber = 0
            }
            break
          case 'OutOfDisk':
            if (status !== 'False') {
              sorterNumber = -1
            }
            break
          default:
            break
        }
      })
      return sorterNumber
    }

    function soterCreateTime(a, b){
      let oDate1 = new Date(a);
      let oDate2 = new Date(b);
      if(oDate1.getTime() > oDate2.getTime()){
        return 1
      } else {
        return -1
      }
    }

    return (
      <div className='imageList'>
        <Table
          columns={column}
          dataSource={nodeList}
          pagination={{simple: true}}
          loading={isFetching}
        />
      </div>
    );
  }
});

let isSet = false
class hostList extends Component {
  constructor(props) {
    super(props)
    this.openTerminalModal = this.openTerminalModal.bind(this)
    this.handleDropdownTag = this.handleDropdownTag.bind(this)
    this.formTagContainer = this.formTagContainer.bind(this)
    this.deleteClusterNode = this.deleteClusterNode.bind(this);
    this.closeDeleteModal = this.closeDeleteModal.bind(this)
    this.callbackManageLabelModal = this.callbackManageLabelModal.bind(this)
    this.state = {
      addClusterOrNodeModalVisible:false,
      nodeList: [],
      podCount: null,
      currentContainer:[],
      manageLabelContainer:[],
      manageLabelModal : false,
      deleteNodeModal : false,
      deleteNode : null,
      summary: props.summary || [],// || props.labelsDefaultShow || [],
      search: '',
    }
  }

  loadData(e) {
    const {
      clusterID, getClusterNodesMetrics, getAllClusterNodes, intl: { formatMessage },
      getKubectlsPods, summary, getClusterResourceConsumption,
    } = this.props
    const notification = new NotificationHandler()
    getAllClusterNodes(clusterID, {
      success: {
        func: (result) => {
          let nodeList = result.data.clusters.nodes.nodes
          let podCount = result.data.clusters.podCount
          if (Array.isArray(summary) && e) {
            nodeList = nodeList.filter(item => {
              const firstSummary = summary[ 0 ]
              const { objectMeta } = item
              const { labels } = objectMeta
              if (labels && firstSummary && labels[ firstSummary.key ] && labels[ firstSummary.key ] == firstSummary.value) {
                return item
              }
            })
            this.setState({
              nodeList,
              podCount: podCount,
              summary,
            })
          } else {
            const temp = {
              nodeList,
              podCount: podCount,
            }
            if (!this.state.summary || !this.state.summary.length) {
              temp.summary = []
            }
            this.setState(temp)
          }
          let slaveAvailable = false
          nodeList.map((item) => {
            if (item.isMaster === false) {
              slaveAvailable = true
              return
            }
          });
          if (slaveAvailable) {
            getClusterNodesMetrics(clusterID, { pods: nodeList.map(node => node.objectMeta.name) }, {
              failed: {
                func: err => {
                  notification.info(formatMessage(intlMsg.setPrometheusHint))
                }
              }
            })
            getClusterResourceConsumption(clusterID, null, {
              failed: {
                func: err => {
                  notification.error(formatMessage(intlMsg.getNodeSourceFail))
                }
              }
            })
          }
          this.searchNodes()
        },
        isAsync: true
      }
    })
    getKubectlsPods(clusterID)
  }
  componentWillMount() {
    this.loadData('willMount')
    const { clusterID } = this.props
    this.props.getClusterLabel(clusterID)
  }
  componentWillReceiveProps(nextProps) {
    // 又要求不要默认节点了 = = 暂时屏蔽
    // if (isSet === false && nextProps.labelsDefaultShow && nextProps.labelsDefaultShow.length) {
    //   isSet = true
    //   this.setState({
    //     summary: nextProps.labelsDefaultShow || [],
    //   })
    // }
    if (!nextProps.summary || nextProps.summary.length === 0) {
      return
    }
    const { activeKey } = this.props
    if (nextProps.activeKey !== activeKey && nextProps.activeKey === 'host' && nextProps.summary) {
      let nodeList =[]
      nextProps.nodes.nodes.map((item)=> {
        if (item.objectMeta.labels[nextProps.summary[0].key] == nextProps.summary[0].value) {
          nodeList.push(item)
        }
      })

      this.setState({
        summary: nextProps.summary,
        nodeList,
      })
    }
  }
  searchNodes() {
    //this function for search nodes
    const { search } = this.state

    const { nodes } = this.props;
    if (search.length == 0) {
      this.setState({
        nodeList: nodes.nodes
      })
      return;
    }
    let nodeList = [];
    nodes.nodes.map((node) => {
      if (node.objectMeta.name.indexOf(search) > -1 || node.address.indexOf(search) > -1) {
        nodeList.push(node);
      }
    });
    this.setState({
      nodeList: nodeList
    });
  }
  openTerminalModal(item, e) {
    const { kubectlsPods, addTerminal, clusterID } = this.props
    let { currentContainer } = this.state
    let notification = new NotificationHandler()
    if (currentContainer.length > 0) {
      addTerminal(clusterID, currentContainer[0])
      return
    }
    const { namespace, pods } = kubectlsPods.result
    if (!pods || pods.length === 0) {
      notification.warn(formatMessage(intlMsg.noTermNode))
      return
    }
    let randomPodNum = Math.ceil(Math.random() * pods.length)
    if (randomPodNum === 0) randomPodNum = 1
    currentContainer = [{
      spec: {
        containers: [
          {
            name: 'kubectl' // must specify the container name to connect to
          }
        ]
      },
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
    const { cluster } = this.props
    /*
      接入服务商提供的主机（自定义添加主机）1
      接入服务商提供的主机（OpenStack） 2
      接入服务商提供的主机（云星） 3
      导入已有 Kubernetes 集群 4
      添加主机自建 Kubernetes 集群 5
     */
    if ([1, 2, 3].includes(cluster.clusterType)) {
      browserHistory.push(`/cluster/addHosts?clusterType=${cluster.clusterType}&&clusterID=${cluster.clusterID}`)
      return
    }
    this.setState({
      addClusterOrNodeModalVisible: true,
    })
  }

  handleDropdownTag(obj) {
    const {callbackActiveKey} = this.props
    if(obj.key == 'manageTag'){
      callbackActiveKey('labels')
    }
  }
  handleClose(item) {
    const summary = this.state.summary.filter(tag => {
      if (tag.key === item.key && tag.value === item.value) {
        return false
      }
      return true
    });
    let nodeList = [];
    const { nodes } = this.props;
    if (summary.length == 0) {
      this.setState({
        summary,
        nodeList: nodes.nodes,
      })
      return
    }
    nodes.nodes.map(node => {
      let labels = node.objectMeta.labels
      let isEqual = true
      summary.every(item => {
        if (!labels[item.key] || labels[item.key] !== item.value) {
          isEqual = false
          return false
        }
        return true
      })
      if (isEqual) {
        nodeList.push(node)
      }
    });
    // nodeList = Array.from(new Set(nodeList))
    this.setState({
      summary,
      nodeList
    });
  }
  formTagContainer() {
    const { summary } = this.state
    return summary.map((item, index) => {
      return (
        <Tag closable color="blue" key={item.key + '_' + item.value + index} afterClose={() => this.handleClose(item)} style={{width:'100%'}}>
          <span>{item.key}</span>
          <span className='point'>:</span>
          <span>{item.value}</span>
        </Tag>
      )
    })
  }

  deleteClusterNode(){
    const { intl: { formatMessage } } = this.props
    //this function for delete cluster node
    let notification = new NotificationHandler()
    const {
      clusterID, deleteClusterNode, getAllClusterNodes,
      getClusterNodesMetrics, getClusterResourceConsumption,
    } = this.props;
    const {deleteNode} = this.state;
    const _this = this;
    if(deleteNode.isMaster){
      notification.warn(`${formatMessage(intlMsg.canNotDelete)}${MASTER}`)
      return
    }
    deleteClusterNode(clusterID, deleteNode.objectMeta.name, {
      success: {
        func: () =>{
          getAllClusterNodes(clusterID, {
            success: {
              func: (result) => {
                let nodeList = result.data.clusters.nodes.nodes;
                notification.success(formatMessage(intlMsg.hostNodeDeleteSuccess));
                _this.setState({
                  nodeList: nodeList,
                  deleteNodeModal: false
                })
                let slaveAvailable = false
                nodeList.map((item) => {
                  if (item.isMaster === false) {
                    slaveAvailable = true
                    return
                  }
                });
                if (slaveAvailable) {
                  getClusterNodesMetrics(clusterID, { pods: nodeList.map(node => node.objectMeta.name) }, {
                    failed: {
                      func: err => {
                        notification.info(formatMessage(intlMsg.setPrometheusHint))
                      }
                    }
                  })
                  getClusterResourceConsumption(clusterID, null, {
                    failed: {
                      func: err => {
                        notification.error(formatMessage(intlMsg.getNodeSourceFail))
                      }
                    }
                  })
                }
              },
              isAsync: true
            }
          })
        },
        isAsync: true
      }
    })
  }

  closeDeleteModal() {
    //this function for close delete node modal
    this.setState({
      deleteNodeModal: false
    })
  }

  callbackManageLabelModal(obj){
    this.setState({
      manageLabelModal: false
    })
  }

  maintainConfirm = () => {
    this.setState({
      maintainModal: false,
      confirmModal: true
    })
  }

  maintainCancel = () => {
    this.setState({
      maintainModal: false,
      forceBody: null
    })
  }

  renderFooter = () => {
    const { canMaintain } = this.state
    if (canMaintain) {
      return [
        <Button key="cancel" type="ghost" onClick={this.maintainCancel}><FormattedMessage {...intlMsg.cancel}/></Button>,
        <Button key="confirm" type="primary" onClick={this.maintainConfirm}><FormattedMessage {...intlMsg.confirm}/></Button>,
      ]
    }
    return [
      <Button type="ghost" onClick={() => this.setState({ maintainModal: false })}><FormattedMessage {...intlMsg.cancel}/></Button>,
      <Button type="primary" onClick={() => this.setState({ forceModal: true, maintainModal: false })}><FormattedMessage {...intlMsg.deleteErrForceMaintain}/></Button>
    ]
  }

  doubleConfirm = async (isForce) => {
    const { deleteNode, forceBody } = this.state
    const { maintainNode, clusterID, intl: { formatMessage } } = this.props
    let notify = new NotificationHandler()
    this.setState({
      [isForce ? 'forceLoading' : 'doubleConfirmLoading']: true
    })
    notify.spin(formatMessage(intlMsg.nodeMaintainOpen))
    const res = await maintainNode(clusterID, deleteNode.objectMeta.name, forceBody, {
      failed: {
        func: () => null
      }
    })
    if (res.error) {
      this.setState({
        [isForce ? 'forceLoading' : 'doubleConfirmLoading']: false
      })
      notify.close()
      let errorMessage = res.error.message.message || res.error.message;
      if (res.error.statusCode === 409) {
        const { namespace, resourceName } = res.error.message.data;
        errorMessage = formatMessage(intlMsg.userViolatedPdb, { namespace, resourceName })
        this.loadData()
        notify.warn(formatMessage(intlMsg.containerMigrateFail), errorMessage)
        this.setState({
          forceModal: false
        })
        return
      }
      notify.warn(formatMessage(intlMsg.nodeMaintainFail), errorMessage)
      this.setState({
        forceModal: false
      })
      return
    }
    this.loadData()
    this.setState({
      [isForce ? 'forceLoading' : 'doubleConfirmLoading']: false,
      confirmModal: false,
      maintainModal: false,
      forceModal: false,
      forceBody: null
    })
    notify.close()
    notify.success(formatMessage(intlMsg.nodeMaintainSuccess))
  }

  doubleCancel = () => {
    this.setState({
      confirmModal: false
    })
  }

  forceCancel = () => {
    this.setState({
      forceModal: false,
      forceBody: null
    })
  }


  exitMaintainConfirm = async () => {
    const { exitMaintainNode, clusterID, intl: { formatMessage } } = this.props
    const { deleteNode } = this.state
    let notify = new NotificationHandler()
    const result = await exitMaintainNode(clusterID, deleteNode.objectMeta.name)
    this.setState({
      exitMaintainLoading: true
    })
    notify.spin(formatMessage(intlMsg.exitNodeMaintain))
    if (result.error) {
      this.setState({
        exitMaintainLoading: false
      })
      notify.close()
      notify.warn(formatMessage(intlMsg.exitNodeMaintainFail), result.error.message.message || result.error.message)
      return
    }
    this.loadData()
    this.setState({
      exitMaintainLoading: false,
      exitMaintainModal: false
    })
    notify.close()
    notify.success(formatMessage(intlMsg.exitNodeMaintainSuccess))
  }
  formatType = type => {
    const { intl: { formatMessage } } = this.props
    switch (type) {
      case 0:
        return formatMessage(intlMsg.hostStorage)
      case 1:
        return formatMessage(intlMsg.bindLabel)
      case 2:
        return formatMessage(intlMsg.bindNode)
      default:
        return
    }
  }

  renderInfo = () => {
    const { canMaintain } = this.state
    const { nodeInfo, intl: { formatMessage } } = this.props
    const { pod, node } = nodeInfo || { pod: [], node: [] }
    if (canMaintain) { return }
    const column = [
      {
        title: formatMessage(intlMsg.question),
        dataIndex: 'msgType',
        width: '15%',
        render: text => this.formatType(text)
      }, {
        title: formatMessage(intlMsg.object),
        dataIndex: 'podName',
        width: '50%'
      }, {
        title: formatMessage(intlMsg.belongProject),
        dataIndex: 'namespace',
        width: '15%'
      }, {
        title: formatMessage(intlMsg.belongServer),
        dataIndex: 'svcName',
        width: '15%'
      }
    ]
    return (
      <div className="extraInfo">
        <div className="errorInfo">
          <i className="fa fa-exclamation-triangle" aria-hidden="true"/> <FormattedMessage {...intlMsg.nodeErrorMigrateRisk}/>
        </div>
        <div className="container">
          <div className="titleLabel"><FormattedMessage {...intlMsg.globalQuestion}/></div>
          {
            (node || []).map(item => {
              if (item.resourceKind === 'loadbalance') {
                return <div className="globalList"><i/>
                  <FormattedMessage {...intlMsg.nodeUseLoadBalance} values={{ namespace: item.namespace, resourceName: item.resourceName }}/>
                </div>
              }
              return <div className="globalList"><i/><FormattedMessage {...intlMsg.nodeUseClusterNet}/></div>
            })
          }
        </div>
        <div className="container">
          <div className="titleLabel"><FormattedMessage {...intlMsg.containerQuestion}/></div>
          <Table
            className="podTable"
            columns={column}
            dataSource={pod}
            pagination={false}
          />
        </div>
      </div>
    )
  }
  render() {
    const { addNodeCMD, labels, license, intl: { formatMessage } } = this.props
    const {
      deleteNode, podCount, summary, nodeList,
      maintainModal, confirmModal, doubleConfirmLoading,
      exitMaintainModal, exitMaintainLoading, forceModal,
      forceLoading,
    } = this.state
    const scope = this;
    const nodeSum = nodeList && nodeList.length
    let addNodeBtnDisabled = true
    const maxNodes = license && license[camelize('max_nodes')]
    if (nodeSum < maxNodes) {
      addNodeBtnDisabled = false
    }
    return <div id="cluster__hostlist">
      <Card className='ClusterListCard'>
        <div className='operaBox'>
          <Tooltip title={formatMessage(intlMsg.licenseSupportNode, { maxNodes: maxNodes || '-', nodeSum })}>
            <Button
              className='addPodBtn'
              size='large'
              type='primary'
              onClick={()=> this.handleAddClusterNode()}
              disabled={addNodeBtnDisabled}
            >
              <i className="fa fa-plus" style={{marginRight:'5px'}}/>
              <span><FormattedMessage {...intlMsg.addHostNode}/></span>
            </Button>
          </Tooltip>
          <Button className='terminalBtn' size='large' type='ghost' onClick={this.openTerminalModal}>
            <TenxIcon type="terminal"/>
            <span><FormattedMessage {...intlMsg.termOrClusterManage}/></span>
          </Button>
          <Button type='ghost' size='large' className="refreshBtn" onClick={() => this.loadData()}>
            <i className='fa fa-refresh' /> <FormattedMessage {...intlMsg.refresh}/>
          </Button>
          <span className='searchBox'>
            <Input className='searchInput' onChange={e => this.setState({search: e.target.value})} size='large' placeholder={formatMessage(intlMsg.search)} type='text' onPressEnter={(e) => this.searchNodes()} />
            <Icon type="search" className="fa" onClick={() => this.searchNodes()} />
          </span>
          <span className='selectlabel' id="cluster__hostlist__selectlabel">
            <TagDropdown
              clusterID={this.props.clusterID}
              callbackHostList={this.handleDropdownTag}
              labels={labels}
              scope={scope}
              footer={true}
              getClusterLabel={this.props.getClusterLabel}
              summary={summary}
            />
          </span>
          {
            nodeList && nodeList.length
            ? <div className='totle_num'><FormattedMessage {...intlMsg.totalNumber} values={{ number: nodeList.length }}/></div>
            : null
          }

          {
            summary && summary.length > 0
            ? <div className='selectedroom'>
              {this.formTagContainer()}
            </div>
            : null
          }
        </div>
        <div className='dataBox'>
          <div className='datalist'>
            <MyComponent {...this.props} nodeList={nodeList} scope={scope} podCount={podCount} />
          </div>
        </div>
      </Card>

      <AddClusterOrNodeModal
        title={formatMessage(intlMsg.addHostNode)}
        visible={this.state.addClusterOrNodeModalVisible}
        closeModal={() => this.setState({addClusterOrNodeModalVisible: false})}
        CMD={addNodeCMD && addNodeCMD[camelize('default_command')]}
        bottomContent={<p><FormattedMessage {...intlMsg.addHostNodeNote}/></p>} />

      <ManageLabelModal
        manageLabelModal={this.state.manageLabelModal}
        clusterID={this.props.clusterID}
        nodeName={this.state.deleteNode ? this.state.deleteNode.objectMeta.name:''}
        callback={this.callbackManageLabelModal}
        footer={true}
      />

      <Modal
        title={formatMessage(intlMsg.deleteHostNode)}
        className='deleteClusterNodeModal'
        visible={this.state.deleteNodeModal}
        onOk={this.deleteClusterNode}
        onCancel={this.closeDeleteModal}
      >
        <div className="deleteRow">
          <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
          <FormattedMessage {...intlMsg.confirmDeleteHostNode} values={{ nodeName: deleteNode ? deleteNode.objectMeta.name : '' }}/>
        </div>
        <div className="note"><FormattedMessage {...intlMsg.deleteHostNodeNote}/></div>
      </Modal>
      <Modal
        title={formatMessage(intlMsg.nodeMaintain)}
        className="maintainModal"
        visible={maintainModal}
        onOk={this.maintainConfirm}
        onCancel={this.maintainCancel}
        footer={this.renderFooter()}
      >
        <div><FormattedMessage {...intlMsg.nodeMaintainNote}/></div>
        <br/>
        <div><FormattedMessage {...intlMsg.applicableScene}/>：</div>
        <div className="sceneBox">
          <p className="maintainScene"><span>1</span>{formatMessage(intlMsg.nodeCoreUpdate)}</p>
          <p className="maintainScene"><span>2</span>{formatMessage(intlMsg.hardSysMaintain)}</p>
          <p className="maintainScene"><span>3</span>{formatMessage(intlMsg.replaceClusterNode)}</p>
        </div>
        {this.renderInfo()}
      </Modal>
      <Modal
        title={formatMessage(intlMsg.confirmAgain)}
        visible={confirmModal}
        onOk={this.doubleConfirm}
        onCancel={this.doubleCancel}
        confirmLoading={doubleConfirmLoading}
      >
        <div className="deleteRow">
          <i className="fa fa-exclamation-triangle" aria-hidden="true"/> <FormattedMessage {...intlMsg.maintainStatusCaution}/>
        </div>
      </Modal>
      <Modal
        title={formatMessage(intlMsg.confirmAgain)}
        visible={forceModal}
        onCancel={this.forceCancel}
        onOk={this.doubleConfirm.bind(this, true)}
        confirmLoading={forceLoading}
      >
        <div className="deleteRow">
          <i className="fa fa-exclamation-triangle" aria-hidden="true"/> <FormattedMessage {...intlMsg.maintainStatusCautionAgain}/>
        </div>
      </Modal>
      <Modal
        title={formatMessage(intlMsg.exitMaintain)}
        visible={exitMaintainModal}
        onCancel={() => this.setState({ exitMaintainModal: false })}
        onOk={this.exitMaintainConfirm}
        confirmLoading={exitMaintainLoading}
      >
        <div className="deleteRow">
          <i className="fa fa-exclamation-triangle" aria-hidden="true"/>
          <FormattedMessage {...intlMsg.exitMaintainNote}/>
        </div>
      </Modal>
    </div>
  }
}

function mapStateToProps(state, props) {
  const pods = {
    nodes: {},
    isFetching: false
  }
  const clusterID = props.cluster.clusterID
  const { getAllClusterNodes, kubectlsPods, addNodeCMD, clusterLabel, nodeDetail } = state.cluster_nodes
  const { clusterSummary } = state.cluster
  const targetAllClusterNodes = getAllClusterNodes[clusterID]
  const { isFetching } = targetAllClusterNodes || pods
  const data = (targetAllClusterNodes && targetAllClusterNodes.nodes) || pods
  const { cpuMetric, memoryMetric, resourceConsumption, license } = data
  const nodes = data.clusters ? data.clusters.nodes : []

  const cluster = props.clusterID
  if (!clusterLabel || !clusterLabel[cluster]) {
    return props
  }
  let { result } = clusterLabel[cluster]

  if (!result) {
    result = {summary:[]}
  }
  const { data: nodeInfo } = nodeDetail || { data: []}
  return {
    labels: result.summary,
    labelsDefaultShow: result.summary.filter(item =>
      (item.key === 'beta.kubernetes.io/arch' && item.value === 'arm64')
      || (item.key === 'beta.kubernetes.io/arch' && item.value === 'amd64')
      || item.key === 'beta.kubernetes.io/os'),
    nodes,
    cpuMetric,
    memoryMetric,
    resourceConsumption,
    license,
    isFetching,
    kubectlsPods,
    addNodeCMD: addNodeCMD[clusterID] || {},
    nodeInfo
  }
}
export default connect(mapStateToProps, {
  getAllClusterNodes,
  getClusterNodesMetrics,
  getClusterResourceConsumption,
  addTerminal,
  getKubectlsPods,
  deleteClusterNode,
  getClusterLabel,
  changeClusterNodeSchedule,
  getNodeDetail,
  maintainNode,
  exitMaintainNode,
  getNotMigratedPodCount
})(injectIntl(hostList, {
  withRef: true,
}))
