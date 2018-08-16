/**
 * Created by zhangchengzheng on 2017/5/2.
 */
import React, { Component, propTypes } from 'react'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import NotificationHandler from '../../components/Notification'
import { Card, Button, Tooltip, Icon, Input, Spin, Menu, Dropdown, Switch, Tag, Modal, Form, Table, Pagination } from 'antd'
import { formatDate, calcuDate } from '../../common/tools'
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
    const { scope } = this.props;
    const { clusterID, changeClusterNodeSchedule } = scope.props;
    let { nodeList } = scope.state;
    let notification = new NotificationHandler()
    changeClusterNodeSchedule(clusterID, node, e, {
      success: {
        func: () => {
          // notification.info(e ? '开启调度中，该操作 1 分钟内生效' : '关闭调度中，该操作 1 分钟内生效');
          notification.success(e ? '开启调度成功' : '关闭调度成功');
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
    const { getNotMigratedPodCount, clusterID, scope } = this.props
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
        content: '容器迁移未完成，无法退出维护状态',
      });
    }
  },
  getDiskStatus(node) {
    const conditions = node.conditions || []
    let color = 'green'
    let text = '健康'
    conditions.forEach(condition => {
      const { type, status } = condition
      switch (type) {
        case 'DiskPressure':
          if (status !== 'False' && status !== 'Unknown') {
            color = 'yellow'
            text = '不足'
          }
          break
        case 'OutOfDisk':
          if (status !== 'False' && status !== 'Unknown') {
            color = 'red'
            text = '告警'
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
    const { maintainStatus, current, total } = record.objectMeta.annotations || { maintainStatus: 'fetching', current: 0, total: 0 }
    let message = '异常'
    let classname = 'errorSpan'
    if (text === 'True') {
      if (record.objectMeta.annotations.maintenance === 'true') {
        message = '维护中'
        classname = 'themeColor'
      } else if (record.objectMeta.annotations.maintenance === 'failed') {
        message = '迁移失败'
        classname = 'errorSpan'
      } else if (maintainStatus === 'processing') {
        message = '服务迁移中'
        classname = 'themeColor'
      } else {
        message = '运行中'
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
              title="服务迁移过程最好不要进行其他操作，避免发生未知错误！"
            >
              <Icon type="exclamation-circle-o" />
            </Tooltip>
          }
        </span>
        {
          maintainStatus === 'processing' && <div>已迁移服务 <span>{total - current}</span>/{total}</div>
        }
      </div>
    )
  },
  render: function () {
    const {
      isFetching, nodeList, cpuMetric, memoryMetric, clusterID,
      resourceConsumption, license, podCount ,
    } = this.props
    const root = this
    let dropdown
    let maxNodes
    let column = [
      {
        title: '名称/IP'
      },{
        title: '状态'
      },{
        title: '角色'
      },{
        title: '监控告警'
      },{
        title: '容器'
      },{
        title: 'CPU'
      },{
        title: '内存'
      },{
        title: '调度状态'
      },{
        title: '磁盘情况'
      },{
        title: '加入集群时间'
      }, {
        title: '操作'
      }
    ]
    if(nodeList && nodeList.length !== 0){
      maxNodes = license && license[camelize('max_nodes')]
      dropdown = nodeList.map((item, index) => {
        return (
          <Menu disabled={item.isMaster ? true : false}
            onClick={this.ShowDeleteClusterNodeModal.bind(this, item)}
            style={{ width: '100px' }}
          >
            <Menu.Item key={'manage/'+item.address}>
              <span>管理标签</span>
            </Menu.Item>
            <Menu.Item key={'delete/'+item.address}>
              <span>删除节点</span>
            </Menu.Item>
            {
              ['true', 'failed'].includes(item.objectMeta.annotations.maintenance)
                ?
                <Menu.Item key={'exitMaintain/'+item.address}>
                  <span>退出维护</span>
                </Menu.Item>
                :
                <Menu.Item key={'maintain/'+item.address}>
                  <span>节点维护</span>
                </Menu.Item>
            }
          </Menu>
        )
      })
      column = [
        {
          title: '名称/IP',
          dataIndex: 'objectMeta.name',
          render: (text, item, index) => <div onClick={() => { browserHistory.push(`/cluster/${clusterID}/${item.objectMeta.name}`) }} className='nameIP '>
            <div className="hostname">
              {item.objectMeta.name}
            </div>
            <div className="address">{item.address}</div>
          </div>,
          sorter: (a, b) => (a.objectMeta.name).localeCompare(b.objectMeta.name)
        },{
          title: '状态',
          dataIndex: 'ready',
          render: (text, record) => this.renderStatus(text, record),
          sorter: (a, b) => readySorter(a.ready) - readySorter(b.ready)
        },{
          title: '角色',
          dataIndex: 'isMaster',
          render: (isMaster) => <div>
            <Tooltip title={isMaster ? MASTER : SLAVE}>
              <span>{isMaster ? MASTER : SLAVE}</span>
            </Tooltip>
          </div>,
          sorter: (a, b) => isMasterSorter(a.isMaster) - isMasterSorter(b.isMaster)
        },{
          title: '监控告警',
          dataIndex: 'objectMete',
          render: (objectMeta, item, index) => <div className='alarm'>
            <Tooltip title="查看监控">
              <svg className="managemoniter" onClick={()=> browserHistory.push(`/cluster/${clusterID}/${item.objectMeta.name}?tab=monitoring`)}><use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#managemoniter"/></svg>
            </Tooltip>
            <Tooltip title="告警设置" onClick={()=> browserHistory.push(`/cluster/${clusterID}/${item.objectMeta.name}?tab=alarm&open=true`)} >
              <Icon type="notification" />
            </Tooltip>
          </div>
        },{
          title: '容器',
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
                <span className="justify">总量</span>：
                <code>{record[camelize('cpu_total')]}m</code>
              </div>
              <div className={cpuRS.class}>
                <span className="justify">已分配</span>：
                <code>{cpuRS.number}{cpuRS.unit}</code>
              </div>
              <div className={cpuUsedObj.class}>
                <span className="justify">使用</span>：
                <code>
                  {cpuUsedObj.number}{cpuUsedObj.unit}
                </code>
              </div>
            </div>
          }
        },{
          title: '内存',
          render: (text, item, index) => {
            const { memory: memoryRS } = getRS(resourceConsumption, item)
            const memoryUsedObj = memoryUsed(item[camelize('memory_total_kb')], memoryMetric, item.objectMeta.name)
            return <div>
            <div>
              <span className="justify">总量</span>：
              <code>{diskFormat(item[camelize('memory_total_kb')])}</code>
              </div>
              <div className={memoryRS.class}>
                <span className="justify">已分配</span>：
                <code>{memoryRS.number}{memoryRS.unit}</code>
              </div>
              <div className={memoryUsedObj.class}>
                <span className="justify">使用</span>：
                <code>
                  {memoryUsedObj.number}{memoryUsedObj.unit}
                </code>
              </div>
              {/* <div className='topSpan'>{diskFormat(item[camelize('memory_total_kb')])}</div>
              <div className='bottomSpan'>{memoryUsed(item[camelize('memory_total_kb')], memoryMetric, item.objectMeta.name)}</div> */}
            </div>
          }
        },{
          title: '调度状态',
          dataIndex: 'schedulable',
          render: (text, item, index) => {
            const isMaintaining = ['true', 'failed'].includes(item.objectMeta.annotations.maintenance)
            return (
              <div>
                <Tooltip
                  title={isMaintaining ? '维护状态禁止使用调度开关' : ''}
                >
                  <Switch
                    className='switchBox'
                    checked={item.schedulable || false}
                    checkedChildren='开'
                    unCheckedChildren='关'
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
                        正常调度&nbsp;
                        <Tooltip title={`允许分配${item.isMaster ? '系统' : '新'}容器`}>
                          <Icon type="question-circle-o" />
                        </Tooltip>
                      </span>
                      : <span>
                        暂停调度&nbsp;
                        <Tooltip title={`不允许分配${item.isMaster ? '系统' : '新'}容器，正常运行的不受影响`}>
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
          title: '磁盘情况',
          dataIndex: 'conditions',
          render: (text, item, index) => <div>{this.getDiskStatus(item)}</div>,
          sorter: (a, b) => diskSorter(a.conditions) - diskSorter(b.conditions)
        },{
          title: '加入集群时间',
          dataIndex: 'objectMeta.creationTimestamp',
          render: (text, item, index) => <div>
            <Tooltip title={formatDate(item.objectMeta.creationTimestamp)}>
              <span className="timeSpan">{calcuDate(item.objectMeta.creationTimestamp)}</span>
            </Tooltip>
          </div>,
          sorter: (a, b) => soterCreateTime(a.objectMeta.creationTimestamp, b.objectMeta.creationTimestamp)
        },{
          title: '操作',
          render: (text, item, index) => <div>
            <Dropdown.Button type="ghost" overlay={dropdown[index]} onClick={() => browserHistory.push(`/cluster/${clusterID}/${item.objectMeta.name}`)}>
              主机详情
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
      summary: props.summary || [],
      search: '',
    }
  }

  loadData(e) {
    const {
      clusterID, getClusterNodesMetrics, getAllClusterNodes,
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
            this.setState({
              nodeList,
              podCount: podCount,
              summary: [],
            })
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
                  notification.error('获取节点监控数据失败')
                }
              }
            })
            getClusterResourceConsumption(clusterID, null, {
              failed: {
                func: err => {
                  notification.error('获取节点资源数据失败')
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
    if (!nextProps.summary || nextProps.summary.length ==0) {
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
        nodeList
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
      notification.warn('没有可用终端节点，请联系管理员')
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
      if (tag.key !== item.key && tag.value !== item.value) {
        return true
      }
      return false
    });
    let nodeList = [];
    const { nodes } = this.props;
    if (summary.length ==0) {
      this.setState({
        summary,
        nodeList:nodes.nodes
      });
      return
    }
    nodes.nodes.map((node) => {
      let labels = node.objectMeta.labels
      let isEqual = true
      summary.every(item => {
        if (!labels[item.key]) {
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
  formTagContainer(){
    let { summary } = this.state
    const arr = summary.map((item, index)=> {
      return (
        <Tag closable color="blue" key={item.key + index} afterClose={() => this.handleClose(item)} style={{width:'100%'}}>
          <span>{item.key}</span>
          <span className='point'>:</span>
          <span>{item.value}</span>
        </Tag>
      )
    })

    return arr
  }

  deleteClusterNode(){
    //this function for delete cluster node
    let notification = new NotificationHandler()
    const {
      clusterID, deleteClusterNode, getAllClusterNodes,
      getClusterNodesMetrics, getClusterResourceConsumption,
    } = this.props;
    const {deleteNode} = this.state;
    const _this = this;
    if(deleteNode.isMaster){
      notification.warn(`不能删除${MASTER}`)
      return
    }
    deleteClusterNode(clusterID, deleteNode.objectMeta.name, {
      success: {
        func: () =>{
          getAllClusterNodes(clusterID, {
            success: {
              func: (result) => {
                let nodeList = result.data.clusters.nodes.nodes;
                notification.success('主机节点删除成功');
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
                        notification.error('获取节点监控数据失败')
                      }
                    }
                  })
                  getClusterResourceConsumption(clusterID, null, {
                    failed: {
                      func: err => {
                        notification.error('获取节点资源数据失败')
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
        <Button key="cancel" type="ghost" onClick={this.maintainCancel}>取消</Button>,
        <Button key="confirm" type="primary" onClick={this.maintainConfirm}>确定</Button>,
      ]
    }
    return [
      <Button type="ghost" onClick={() => this.setState({ maintainModal: false })}>取消</Button>,
      <Button type="primary" onClick={() => this.setState({ forceModal: true, maintainModal: false })}>删除问题资源，强制维护</Button>
    ]
  }

  doubleConfirm = async (isForce) => {
    const { deleteNode, forceBody } = this.state
    const { maintainNode, clusterID } = this.props
    let notify = new NotificationHandler()
    this.setState({
      [isForce ? 'forceLoading' : 'doubleConfirmLoading']: true
    })
    notify.spin('节点维护开启中')
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
        errorMessage = `用户${namespace}的节点${resourceName}违反了自己的pdb策略`
        this.loadData()
        notify.warn('容器迁移失败', errorMessage)
        this.setState({
          forceModal: false
        })
        return
      }
      notify.warn('节点维护开启失败', errorMessage)
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
    notify.success('节点维护开启成功')
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
    const { exitMaintainNode, clusterID } = this.props
    const { deleteNode } = this.state
    let notify = new NotificationHandler()
    const result = await exitMaintainNode(clusterID, deleteNode.objectMeta.name)
    this.setState({
      exitMaintainLoading: true
    })
    notify.spin('退出节点维护中')
    if (result.error) {
      this.setState({
        exitMaintainLoading: false
      })
      notify.close()
      notify.warn('退出节点维护失败', result.error.message.message || result.error.message)
      return
    }
    this.loadData()
    this.setState({
      exitMaintainLoading: false,
      exitMaintainModal: false
    })
    notify.close()
    notify.success('退出节点维护成功')
  }
  formatType = type => {
    switch (type) {
      case 0:
        return 'host 存储'
      case 1:
        return '绑定标签'
      case 2:
        return '绑定节点'
      default:
        return
    }
  }

  renderInfo = () => {
    const { canMaintain } = this.state
    const { nodeInfo } = this.props
    const { pod, node } = nodeInfo || { pod: [], node: [] }
    if (canMaintain) { return }
    const column = [
      {
        title: '问题',
        dataIndex: 'msgType',
        width: '15%',
        render: text => this.formatType(text)
      }, {
        title: '对象',
        dataIndex: 'podName',
        width: '50%'
      }, {
        title: '所属项目',
        dataIndex: 'namespace',
        width: '15%'
      }, {
        title: '所属服务',
        dataIndex: 'svcName',
        width: '15%'
      }
    ]
    return (
      <div className="extraInfo">
        <div className="errorInfo">
          <i className="fa fa-exclamation-triangle" aria-hidden="true"/> 该节点存在以下问题，部分容器有迁移风险
        </div>
        <div className="container">
          <div className="titleLabel">全局问题</div>
          {
            (node || []).map(item => {
              if (item.resourceKind === 'loadbalance') {
                return <div className="globalList"><i/>{`该节点被 ${item.namespace} 项目 ${item.resourceName} 负载均衡占用`}</div>
              }
              return <div className="globalList"><i/>该节点被设为集群网络出口</div>
            })
          }
        </div>
        <div className="container">
          <div className="titleLabel">容器问题</div>
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
    const { addNodeCMD, labels, license } = this.props
    const {
      deleteNode, podCount, summary, nodeList,
      maintainModal, confirmModal, doubleConfirmLoading,
      exitMaintainModal, exitMaintainLoading, forceModal,
      forceLoading
    } = this.state
    const scope = this;
    const nodeSum = nodeList && nodeList.length
    let addNodeBtnDisabled = true
    const maxNodes = license[camelize('max_nodes')]
    if (nodeSum < maxNodes) {
      addNodeBtnDisabled = false
    }
    return <div id="cluster__hostlist">
      <Card className='ClusterListCard'>
        <div className='operaBox'>
          <Tooltip title={`当前许可证单个集群最多支持 ${maxNodes || '-'} 个节点（目前已添加 ${nodeSum} 个）`}>
            <Button
              className='addPodBtn'
              size='large'
              type='primary'
              onClick={()=> this.handleAddClusterNode()}
              disabled={addNodeBtnDisabled}
            >
              <i className="fa fa-plus" style={{marginRight:'5px'}}/>
              <span>添加主机节点</span>
            </Button>
          </Tooltip>
          <Button className='terminalBtn' size='large' type='ghost' onClick={this.openTerminalModal}>
            <svg>
              <use xlinkHref='#terminal' />
            </svg>
            <span>终端 | 集群管理</span>
          </Button>
          <Button type='ghost' size='large' className="refreshBtn" onClick={() => this.loadData()}>
            <i className='fa fa-refresh' /> 刷 新
          </Button>
          <span className='searchBox'>
            <Input className='searchInput' onChange={e => this.setState({search: e.target.value})} size='large' placeholder='搜索' type='text' onPressEnter={(e) => this.searchNodes()} />
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
            />
          </span>
          {
            nodeList && nodeList.length
            ? <div className='totle_num'>共 <span>{nodeList.length}</span> 条</div>
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
        title="添加主机节点"
        visible={this.state.addClusterOrNodeModalVisible}
        closeModal={() => this.setState({addClusterOrNodeModalVisible: false})}
        CMD={addNodeCMD && addNodeCMD[camelize('default_command')]}
        bottomContent={<p>注意：新添加的主机需要与 Master 节点同一内网，可互通</p>} />

      <ManageLabelModal
        manageLabelModal={this.state.manageLabelModal}
        clusterID={this.props.clusterID}
        nodeName={this.state.deleteNode ? this.state.deleteNode.objectMeta.name:''}
        callback={this.callbackManageLabelModal}
        footer={true}
      />

      <Modal
        title='删除主机节点'
        className='deleteClusterNodeModal'
        visible={this.state.deleteNodeModal}
        onOk={this.deleteClusterNode}
        onCancel={this.closeDeleteModal}
      >
        <div className="deleteRow">
          <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
          确定要删除&nbsp;{deleteNode ? deleteNode.objectMeta.name : ''}&nbsp;主机节点？
        </div>
        <div className="note">注意：请保证其他开启调度状态的主机节点，剩余的配置足够运行所有应用的容器</div>
      </Modal>
      <Modal
        title="节点维护"
        className="maintainModal"
        visible={maintainModal}
        onOk={this.maintainConfirm}
        onCancel={this.maintainCancel}
        footer={this.renderFooter()}
      >
        <div>进入维护状态之后，节点调度状态将会关闭，节点上容器将会被随机迁移到其它可调度节点上；点击确定后进入维护状态，容器迁移完成后，才能退出维护状态</div>
        <br/>
        <div>适用场景：</div>
        <div className="sceneBox">
          <p className="maintainScene"><span>1</span>节点内核升级</p>
          <p className="maintainScene"><span>2</span>硬件系统维护</p>
          <p className="maintainScene"><span>3</span>替换集群节点</p>
        </div>
        {this.renderInfo()}
      </Modal>
      <Modal
        title="再次确认"
        visible={confirmModal}
        onOk={this.doubleConfirm}
        onCancel={this.doubleCancel}
        confirmLoading={doubleConfirmLoading}
      >
        <div className="deleteRow">
          <i className="fa fa-exclamation-triangle" aria-hidden="true"/> 进入维护状态，会迁移容器，将会导致服务中断，请谨慎操作！
        </div>
      </Modal>
      <Modal
        title="再次确认"
        visible={forceModal}
        onCancel={this.forceCancel}
        onOk={this.doubleConfirm.bind(this, true)}
        confirmLoading={forceLoading}
      >
        <div className="deleteRow">
          <i className="fa fa-exclamation-triangle" aria-hidden="true"/> 强制维护会强制迁移节点上所有容器资源，迁移过程会导致服务中断，请谨慎操作!
        </div>
      </Modal>
      <Modal
        title="退出维护"
        visible={exitMaintainModal}
        onCancel={() => this.setState({ exitMaintainModal: false })}
        onOk={this.exitMaintainConfirm}
        confirmLoading={exitMaintainLoading}
      >
        <div className="deleteRow">
          <i className="fa fa-exclamation-triangle" aria-hidden="true"/>
          退出维护将恢复调度，允许调度新的容器到该节点上，请先确认是否完成维护工作，避免出现不必要的错误，影响您的使用体验，是否确定退出？
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
    labels:result.summary,
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
