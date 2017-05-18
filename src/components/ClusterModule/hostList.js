/**
 * Created by zhangchengzheng on 2017/5/2.
 */
import React, { Component, propTypes } from 'react'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { Card, Button, Tooltip, Icon, Input, Select, Spin, Menu, Dropdown, Switch, Tag, Modal, Form } from 'antd'
import NotificationHandler from '../../common/notification_handler'
import { formatDate, calcuDate } from '../../common/tools'
import { camelize } from 'humps'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import {  getAllClusterNodes, getKubectlsPods, deleteClusterNode, getClusterLabel } from '../../actions/cluster_node'
import { addTerminal } from '../../actions/terminal'
import { NOT_AVAILABLE } from '../../constants'
import AddClusterOrNodeModal from './AddClusterOrNodeModal'
import TagDropdown from './TagDropdown'
import ManageLabelModal from './MangeLabelModal'
import './style/hostList.less'

const MASTER = '主控节点/Master'
const SLAVE = '计算节点/Slave'
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

function cpuUsed(cpuTotal, cpuMetric, name) {
  name = camelize(name)
  if (!cpuMetric || !cpuMetric[name]) {
    return NOT_AVAILABLE
  }
  return `${cpuMetric[name].toFixed(2)}%`
}

function memoryUsed(memoryTotal, memoryMetric, name) {
  name = camelize(name)
  if (!memoryMetric || !memoryMetric[name]) {
    return NOT_AVAILABLE
  }
  let metric = memoryMetric[name]
  metric = metric / 1024 / memoryTotal * 100
  metric = `${metric.toFixed(2)}%`
  return metric
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
    let handle = item.key.substring(0,6)
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
  },
  render: function () {
    const { isFetching, containerList, nodeList, cpuMetric, memoryMetric, clusterID, license } = this.props
    const root = this
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (nodeList.length === 0) {
      return (
        <div className="ant-table-placeholder"><i className="anticon anticon-frown"></i> 暂无数据</div>
      )
    }
    const maxNodes = license[camelize('max_nodes')]
    let items = nodeList.map((item, index) => {
      const dropdown = (
        <Menu disabled={item.isMaster ? true : false}
          onClick={this.ShowDeleteClusterNodeModal.bind(this, item)}
          style={{ width: '100px' }}
        >
          <Menu.Item key={'manage'+item.address}>
            <span>管理标签</span>
          </Menu.Item>
          <Menu.Item key={'delete'+item.address}>
            <span>删除节点</span>
          </Menu.Item>
        </Menu>
      );
      return (
        <div className='podDetail' key={index} >
          {/*<div className='podDetail' key={`${item.objectMeta.name}-${index}`} >*/}
          <div className='name commonTitle'>
            <Link to={`/cluster/${clusterID}/${item.objectMeta.name}`}>{item.objectMeta.name}</Link>
          </div>
          <div className='status commonTitle'>
            <span className={item.ready == 'True' ? 'runningSpan' : 'errorSpan'}><i className='fa fa-circle' />&nbsp;&nbsp;{item.ready == 'True' ? '运行中' : '异常'}</span>
          </div>
          <div className='role commonTitle'>
            <Tooltip title={item.isMaster ? MASTER : SLAVE}>
              <span>{item.isMaster ? MASTER : SLAVE}</span>
            </Tooltip>
          </div>
          <div className='container commonTitle'>
            <span>{getContainerNum(item.objectMeta.name, containerList)}</span>
          </div>
          <div className='cpu commonTitle'>

            <div className='topSpan'>{item[camelize('cpu_total')] / 1000}核</div>
            <div className='bottomSpan'>{cpuUsed(item[camelize('cpu_total')], cpuMetric, item.objectMeta.name)}</div>
          </div>
          <div className='memory commonTitle'>
            <div className='topSpan'>{diskFormat(item[camelize('memory_total_kb')])}</div>
            <div className='bottomSpan'>{memoryUsed(item[camelize('memory_total_kb')], memoryMetric, item.objectMeta.name)}</div>
          </div>
          <div className='disk commonTitle'>
            <div className='topSpan'>{'-'}</div>
            <div className='bottomSpan'>{'-'}</div>
          </div>
          <div className='schedule commonTitle'>
            <Switch style={{display:"block"}}
              className='switchBox'
              defaultChecked={item.schedulable}
              checkedChildren='开'
              unCheckedChildren='关'
              disabled={index >= maxNodes}
              onChange={this.changeSchedulable.bind(root, item.objectMeta.name)} />
            <span className='scheduleSpan'>
              {
                item.schedulable
                  ? (

                    <span>
                      正常调度&nbsp;
                    <Tooltip title={`允许分配新容器`}>
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  )
                  : (
                    <span>
                      暂停调度&nbsp;
                    <Tooltip title={`不允许分配新容器，正常运行的不受影响`}>
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  )
              }
            </span>
          </div>
          <div className='runningTime commonTitle'>
            <Tooltip title={calcuDate(item.objectMeta.creationTimestamp)}>
              <span>{calcuDate(item.objectMeta.creationTimestamp)}</span>
            </Tooltip>
          </div>
          <div className='startTime commonTitle'>
            <Tooltip title={formatDate(item.objectMeta.creationTimestamp)}>
              <span>{formatDate(item.objectMeta.creationTimestamp)}</span>
            </Tooltip>
          </div>
          <div className='opera commonTitle'>
            <Dropdown.Button type="ghost" overlay={dropdown} onClick={() => browserHistory.push(`/cluster/${clusterID}/${item.objectMeta.name}`)}>
              主机详情
            </Dropdown.Button>
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
      podCount: [],
      currentContainer:[],
      manageLabelContainer:[],
      manageLabelModal : false,
      deleteNodeModal : false,
      deleteNode : null,
      summary: []
    }
  }

  loadData() {
    const { clusterID } = this.props
    this.props.getAllClusterNodes(clusterID, {
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
    this.props.getKubectlsPods(clusterID)
  }
  componentWillMount() {
    this.loadData()
    const { clusterID } = this.props
    this.props.getClusterLabel(clusterID)
  }
  searchNodes() {
    //this function for search nodes
    let search = document.getElementsByClassName('searchInput')[0].value
    const { nodes } = this.props;
    if (search.length == 0) {
      this.setState({
        nodeList: nodes.nodes
      })
      return;
    }
    let nodeList = [];
    nodes.nodes.map((node) => {
      if (node.objectMeta.name.indexOf(search) > -1) {
        nodeList.push(node);
      }
    });
    this.setState({
      nodeList: nodeList
    });
  }
  openTerminalModal(item, e) {
    const { kubectlsPods, addTerminal, clusterID } = this.props
    let { currentContainer } = this.state;
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
      callbackActiveKey(obj)
    }
  }
  handleClose(item) {
    console.log('item',item)
    const summary = [...this.state.summary].filter(tag => (tag.key !== item.key) && tag);
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
      summary.map((tag)=> {
        if (labels[tag.key]) {
          nodeList.push(node);
        }
      })

    });
    nodeList = Array.from(new Set(nodeList))
    this.setState({
      summary,
      nodeList
    });
  }
  formTagContainer(){
    let { summary } = this.state
    const arr = summary.map((item)=> {
      return (
        <Tag closable color="blue" key={item.key + item.value} afterClose={() => this.handleClose(item)} style={{width:'100%'}}>
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
    const {clusterID, deleteClusterNode, getAllClusterNodes} = this.props;
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
              func: (result) =>{
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

  render() {
    const { addNodeCMD, labels } = this.props
    const { deleteNode } = this.state
    const scope = this;
    return <div id="cluster__hostlist">
      <Card className='ClusterListCard'>
        <div className='operaBox'>
          <Button
            className='addPodBtn'
            size='large'
            type='primary'
            onClick={()=> this.handleAddClusterNode()}
          >
            <Icon type='plus' />
            <span>添加主机节点</span>
          </Button>
          <Button className='terminalBtn' size='large' type='ghost' onClick={this.openTerminalModal}>
            <svg>
              <use xlinkHref='#terminal' />
            </svg>
            <span>终端 | 集群管理</span>
          </Button>
          <Button type='ghost' size='large' className="refreshBtn" onClick={() => this.loadData()}>
            <i className='fa fa-refresh' /> 刷新
          </Button>
          <span className='searchBox'>
            <Input className='searchInput' size='large' placeholder='搜索' type='text' onPressEnter={() => this.searchNodes()} />
            <Icon type="search" className="fa" onClick={() => this.searchNodes()} />
          </span>
          <span className='selectlabel' id="cluster__hostlist__selectlabel">
            <TagDropdown clusterID={this.props.clusterID} callbackHostList={this.handleDropdownTag} labels={labels} scope={scope} footer={true}/>
          </span>
          {
            this.state.summary.length > 0
            ? <div className='selectedroom'>
              {this.formTagContainer()}
            </div>
            : null
          }
        </div>
        <div className='dataBox'>
          <div className='titleBox'>
            <div className='name commonTitle'>
              <span>主机名称</span>
            </div>
            <div className='status commonTitle'>
              <span>状态</span>
            </div>
            <div className='role commonTitle'>
              <span>节点角色</span>
            </div>
            <div className='container commonTitle'>
              <span>容器数</span>
            </div>
            <div className='cpu commonTitle'>
              <span>CPU</span>
            </div>
            <div className='memory commonTitle'>
              <span>内存</span>
            </div>
            <div className='disk commonTitle'>
              <span>磁盘</span>
            </div>
            <div className='schedule commonTitle'>
              <span>调度状态</span>
            </div>
            <div className='runningTime commonTitle'>
              <span>运行时间</span>
            </div>
            <div className='startTime commonTitle'>
              <span>启动时间</span>
            </div>
            <div className='opera commonTitle'>
              <span>操作</span>
            </div>
          </div>
          <div className='datalist'>
            <MyComponent {...this.props} nodeList={this.state.nodeList} scope={scope}/>
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
        <div style={{ color: '#00a0ea', height: "50px" }}>
          <Icon type='exclamation-circle-o' />
          &nbsp;&nbsp;&nbsp;确定要删除&nbsp;{deleteNode ? deleteNode.objectMeta.name : ''}&nbsp;主机节点？
        </div>
        <div className="note">注意：请保证其他开启调度状态的主机节点，剩余的配置足够运行所有应用的容器</div>
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
  const { getAllClusterNodes, kubectlsPods, addNodeCMD, clusterLabel } = state.cluster_nodes
  const { clusterSummary } = state.cluster
  const targetAllClusterNodes = getAllClusterNodes[clusterID]
  const { isFetching } = targetAllClusterNodes || pods
  const data = (targetAllClusterNodes && targetAllClusterNodes.nodes) || pods
  const { cpuMetric, memoryMetric, license } = data
  const nodes = data.clusters ? data.clusters.nodes : []

  const cluster = props.clusterID
  if (!clusterLabel[cluster]) {
    return props
  }
  let { result } = clusterLabel[cluster]

  if (!result) {
    result = {summary:[]}
  }
  return {
    labels:result.summary,
    nodes,
    cpuMetric,
    memoryMetric,
    license,
    isFetching,
    kubectlsPods,
    addNodeCMD: addNodeCMD[clusterID] || {},
  }
}
export default connect(mapStateToProps, {
  getAllClusterNodes,
  addTerminal,
  getKubectlsPods,
  deleteClusterNode,
  getClusterLabel
})(injectIntl(hostList, {
  withRef: true,
}))
