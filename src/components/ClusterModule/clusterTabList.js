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
import { Menu, Button, Card, Input, Dropdown, Spin, Modal, message, Icon, Checkbox, Switch, Tooltip, } from 'antd'
import { Link ,browserHistory} from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import {
  getAllClusterNodes,
  changeClusterNodeSchedule,
  deleteClusterNode,
  getKubectlsPods,
  getAddNodeCMD,
} from '../../actions/cluster_node'
import './style/clusterTabList.less'
import TerminalModal from '../TerminalModal'
import NotificationHandler from '../../common/notification_handler'
import { formatDate, calcuDate } from '../../common/tools'
import { camelize } from 'humps'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const ButtonGroup = Button.Group
const MASTER = '主控节点/Master'
const SLAVE = '计算节点/Slave'

function diskFormat(num) {
  if (num < 1024) {
    return num + 'KB'
  }
  num = parseInt(num / 1024);
  if (num < 1024) {
    return num + 'MB'
  }
  num = parseInt(num / 1024);
  if (num < 1024) {
    return num + 'GB'
  }
  num = parseInt(num / 1024);
  return num + 'TB'
}

function getContainerNum(name, podList) {
  //this function for return the container num of node
  let num;
  podList.map((pod) => {
    if(pod.name == name) {
      num = pod.count;
    }
  });
  return num;
}

function cpuUsed(cpuTotal, cpuList, name) {
  //this function for compute cpu used
  let total = 0;
  let used;
  let length;
  for(let key in cpuList) {
    if(key != 'statusCode') {
      if(cpuList[key].name == name) {
        length = cpuList[key].metrics.length
        cpuList[key].metrics.map((item) => {
          total = total + item.value;
        });
      }
    }
  }
  // 1h and to 100%
  used = total / cpuTotal /length;
  used = ( used * 100 ).toFixed(2);
  return used;
}

function memoryUsed(memoryTotal, memoryList, name) {
  //this function for compute memory used
  let total = 0;
  let used;
  let length;
  for(let key in memoryList) {
    if(key != 'statusCode') {
      if(memoryList[key].name == name) {
        length = memoryList[key].metrics.length
        memoryList[key].metrics.map((item) => {
          total = total + (item.value / 1024);
        });
      }
    }
  }
  used = total / memoryTotal;
  // 1h and to 100%
  used = (used * 100 / length).toFixed(2);
  return used;
}

const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  changeSchedulable(node, e) {
    //this function for change node schedulable
    const { scope } = this.props;
    const { cluster, changeClusterNodeSchedule } = scope.props;
    let { nodeList } = scope.state;
    changeClusterNodeSchedule(cluster, node, e, {
      success: {
        func: ()=> {
          notification['success']({
            message: e ? '打开调度成功' : '暂停调度成功',
          });
          nodeList.map((item) => {
            if(item.objectMeta.name == node) {
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
  ShowDeleteClusterNodeModal(node) {
    //this function for delete cluster node
    const { scope } = this.props;
    scope.setState({
      deleteNode: node,
      deleteNodeModal: true
    })
  },
  openTerminalModal(item, e) {

  },
  render: function () {
    const { isFetching, podList, containerList, cpuList, memoryList } = this.props
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
    let items = podList.map((item, index) => {
      /*const dropdown = (
        <Menu onClick={this.ShowDeleteClusterNodeModal.bind(this, item.objectMeta.name)}
          style={{ width: '100px' }}
          >
          <Menu.Item key={item.id}>
            <span>删除节点</span>
          </Menu.Item>
        </Menu>
      );*/
      return (
        <div className='podDetail' key={`${item.objectMeta.name}-${index}`} >
          <div className='checkBox commonTitle'>
            {/*<Checkbox ></Checkbox>*/}
          </div>
          <div className='name commonTitle'>
            <Tooltip title={item.objectMeta.name}>
              <span>{item.objectMeta.name}</span>
            </Tooltip>
          </div>
          <div className='address commonTitle'>
            <Tooltip title={item.address}>
              <span>{item.address}</span>
            </Tooltip>
          </div>
          <div className='status commonTitle'>
            <span className={ item.ready == 'True' ? 'runningSpan' : 'errorSpan' }><i className='fa fa-circle' />&nbsp;&nbsp;{item.ready == 'True' ? '运行中' : '异常'}</span>
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
            <span className='topSpan'>{item.cpuTotal / 1000}核</span>
            <span className='bottomSpan'>{cpuUsed(item.cpuTotal, cpuList, item.objectMeta.name) + '%'}</span>
          </div>
          <div className='memory commonTitle'>
            <span className='topSpan'>{diskFormat(item.memoryTotalKB)}</span>
            <span className='bottomSpan'>{memoryUsed(item.memoryTotalKB, memoryList, item.objectMeta.name) + '%'}</span>
          </div>
          {/*<div className='disk commonTitle'>
            <span className='topSpan'>{'-'}</span>
            <span className='bottomSpan'>{'-'}</span>
          </div>*/}
          <div className='schedule commonTitle'>
            <Switch className='switchBox' defaultChecked={item.schedulable} checkedChildren='开' unCheckedChildren='关' onChange={this.changeSchedulable.bind(root, item.objectMeta.name)}/>
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
            <Button
              type="ghost"
              disabled={item.isMaster ? true : false}
              onClick={this.ShowDeleteClusterNodeModal.bind(this, item)}>
              删除节点
            </Button>
            {/*<Dropdown.Button
              overlay={dropdown} type='ghost'
              onClick={this.openTerminalModal.bind(this, item)}>
              <svg>
                <use xlinkHref='#terminal' />
              </svg>
              <span>终端</span>
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

class clusterTabList extends Component {
  constructor(props) {
    super(props);
    this.loadData = this.loadData.bind(this);
    this.searchNodes = this.searchNodes.bind(this);
    this.deleteClusterNode = this.deleteClusterNode.bind(this);
    this.closeDeleteModal = this.closeDeleteModal.bind(this);
    this.closeTerminalLayoutModal = this.closeTerminalLayoutModal.bind(this);
    this.openTerminalModal = this.openTerminalModal.bind(this);
    this.handleAddClusterNode = this.handleAddClusterNode.bind(this)
    this.copyAddNodeCMD = this.copyAddNodeCMD.bind(this)
    this.state = {
      nodeList: [],
      podCount: [],
      currentContainer: [],
      deleteNodeModal: false,
      TerminalLayoutModal: false,
      addNodeModalVisible: false,
      deleteNode: null,
      copyAddNodeSuccess: false
    }
  }

  loadData() {
    const { getAllClusterNodes, cluster } = this.props;
    getAllClusterNodes(cluster, {
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
  }

  componentWillMount() {
    const { getAllClusterNodes, cluster, getKubectlsPods } = this.props
    getKubectlsPods(cluster)
    this.loadData()
  }

  componentDidMount() {
    const { cluster, getAddNodeCMD } = this.props
    getAddNodeCMD(cluster)
  }

  copyAddNodeCMD() {
    //this function for user click the copy btn and copy the download code
    const code = document.getElementById('addNodeCMDInput')
    code.select()
    document.execCommand('Copy', false)
    this.setState({
      copyAddNodeSuccess: true
    })
  }

  searchNodes(e) {
    //this function for search nodes
    const { nodes } = this.props;
    if(e.target.value.length == 0) {
      this.setState({
        nodeList: nodes.nodes
      })
      return;
    }
    let search = e.target.value;
    let nodeList = [];
    nodes.nodes.map((node) => {
      if(node.objectMeta.name.indexOf(search) > -1) {
        nodeList.push(node);
      }
    });
    this.setState({
      nodeList: nodeList
    });
  }

  deleteClusterNode() {
    //this function for delete cluster node
    let notification = new NotificationHandler()
    const { cluster, deleteClusterNode, getAllClusterNodes } = this.props;
    const { deleteNode } = this.state;
    const _this = this;
    if (deleteNode.isMaster) {
      notification.warn(`不能删除${MASTER}`)
      return
    }
    deleteClusterNode(cluster, deleteNode.objectMeta.name, {
      success: {
        func: () => {
          getAllClusterNodes(cluster, {
            success: {
              func: (result) => {
                let nodeList = result.data.clusters.nodes.nodes;
                notification['success']({
                  message: '主机节点删除成功',
                });
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

  closeTerminalLayoutModal() {
    //this function for user close the terminal modal
    this.setState({
      TerminalLayoutModal: false
    });
  }

  openTerminalModal() {
    const { kubectlsPods } = this.props
    let { currentContainer } = this.state;
    if (currentContainer.length > 0) {
      this.setState({
        TerminalLayoutModal: true,
      })
      return
    }
    const { namespace, pods } = kubectlsPods
    if (!pods || pods.length === 0) {
      let notification = new NotificationHandler()
      notification.warn('没有可用终端节点，请联系管理员')
      return
    }
    let randomPodNum = Math.ceil(Math.random() * pods.length)
    if (randomPodNum === 0) randomPodNum = 1
    this.setState({
      currentContainer: [{
        metadata: {
          namespace,
          name: pods[randomPodNum - 1]
        }
      }],
      TerminalLayoutModal: true,
    })
    if(!hadFlag) {
      let body = {
        metadata: {
          namespace: 'kube-system',
          name: 'temp'
        }
      }
      currentContainer.push(body)
    }
    this.setState({
      currentContainer: currentContainer,
      TerminalLayoutModal: true
    });
  }

  handleAddClusterNode() {
    this.setState({
      addNodeModalVisible: true,
    })
  }

  render() {
    const { intl, isFetching, nodes, cluster, memoryList, cpuList, kubectlsPods, addNodeCMD } = this.props;
    const { formatMessage } = intl;
    const { nodeList, podCount, deleteNode, copyAddNodeSuccess } = this.state;
    const rootscope = this.props.scope;
    const scope = this;
    let oncache = this.state.currentContainer.map((item) => {
      return item.metadata.name;
    })
    return (
      <QueueAnim className='clusterTabListBox'
        type='right'
        >
        <div id='clusterTabList' key='clusterTabList'>
          <Card className='ClusterListCard'>
            <div className='operaBox'>
              <Button className='addPodBtn' size='large' type='primary' onClick={this.handleAddClusterNode}>
                <Icon type='plus' />
                <span>添加主机节点</span>
              </Button>
              <Button disabled={kubectlsPods.namespace ? false : true} className='terminalBtn' size='large' type='ghost' onClick={this.openTerminalModal}>
                <svg>
                  <use xlinkHref='#terminal' />
                </svg>
                <span>终端 | 集群管理</span>
              </Button>
              <Button type='ghost' size='large' className="refreshBtn" onClick={this.loadData}>
                <i className='fa fa-refresh' /> 刷新
              </Button>
              <span className='searchBox'>
                <Input className='searchInput' size='large' placeholder='搜索' type='text' onChange={this.searchNodes} />
                <i className='fa fa-search'></i>
              </span>
            </div>
            <div className='dataBox'>
              <div className='titleBox'>
                <div className='checkBox commonTitle'>
                  {/*<Checkbox ></Checkbox>*/}
                </div>
                <div className='name commonTitle'>
                  <span>主机名称</span>
                </div>
                <div className='address commonTitle'>
                  <span>IP 地址</span>
                </div>
                <div className='status commonTitle'>
                  <span>状态</span>
                </div>
                <div className='role commonTitle'>
                  <span>节点角色</span>&nbsp;
                  <Tooltip title={`主控节点：用来做系统调度管理集群，同时也会作为计算节点提供资源；
计算节点：集群内承担计算资源提供的能力，未配置分布式存储的集群也会承担存储能力`}>
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </div>
                <div className='container commonTitle'>
                  <span>容器数</span>&nbsp;
                  <Tooltip title={`运行在当前主机节点上的容器数量（包括系统所需容器）`}>
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </div>
                <div className='cpu commonTitle'>
                  <span>CPU</span>
                </div>
                <div className='memory commonTitle'>
                  <span>内存</span>
                </div>
                {/*<div className='disk commonTitle'>
                  <span>硬盘</span>
                </div>*/}
                <div className='schedule commonTitle'>
                  <span>调度状态</span>&nbsp;
                  <Tooltip title={`调度状态开启的主机节点，将允许被分配新建的应用容器，未开启调度的节点，除已运行的容器之外不再允许新增调度容器`}>
                    <Icon type="question-circle-o" />
                  </Tooltip>
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
              <MyComponent podList={nodeList} containerList={podCount} isFetching={isFetching} scope={scope} memoryList={memoryList} cpuList={cpuList} />
            </div>
          </Card>
          <Modal title='删除主机' className='deleteClusterNodeModal' visible={this.state.deleteNodeModal} onOk={this.deleteClusterNode} onCancel={this.closeDeleteModal}>
            <div style={{ color: '#00a0ea', height: "50px" }}>
              <Icon type='exclamation-circle-o' />
              &nbsp;&nbsp;&nbsp;确定要删除&nbsp;{deleteNode ? deleteNode.objectMeta.name : ''}&nbsp;主机节点？
            </div>
            <div className="note">注意：请保证其他开启调度状态的主机节点，剩余的配置足够运行所有应用的容器</div>
          </Modal>
          <Modal
            visible={this.state.TerminalLayoutModal}
            className='TerminalLayoutModal'
            transitionName='move-down'
            onCancel={this.closeTerminalLayoutModal}
            maskClosable={false}
            >
            <TerminalModal scope={scope} config={this.state.currentContainer} show={this.state.TerminalLayoutModal} oncache={oncache} cluster={cluster}/>
          </Modal>
          <Modal
            title='添加主机节点'
            className='addClusterNodeModal'
            visible={this.state.addNodeModalVisible}
            onOk={() => this.setState({addNodeModalVisible: false})}
            onCancel={() => this.setState({addNodeModalVisible: false})}>
            <div>
              <div style={{paddingBottom: '15px'}}>
                1. 先根据您的操作系统安装最新版本 Docker
                （<a target="_blank" href="https://docs.docker.com/engine/installation/linux/">如何在Linux安装Docker</a>）
              </div>
              <div>
                2. 请在安装好 Docker 的主机上执行以下命令：
                <pre>
                  {addNodeCMD ? addNodeCMD[camelize('default_command')] : <Spin />}&nbsp;&nbsp;
                  <Tooltip title={copyAddNodeSuccess ? '复制成功' : '点击复制'}>
                    <a className={copyAddNodeSuccess ? "actions copyBtn" : "copyBtn"}
                      onClick={this.copyAddNodeCMD}
                      onMouseLeave={() => setTimeout(() => this.setState({copyAddNodeSuccess: false}), 500) }>
                      <Icon type="copy" />
                    </a>
                  </Tooltip>
                  <input id="addNodeCMDInput" style={{ position: "absolute", opacity: "0", top:'0'}} value={addNodeCMD && addNodeCMD[camelize('default_command')]} />
                </pre>
                注意：新添加的主机需要与 Master 节点同一内网，可互通
              </div>
            </div>
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

clusterTabList.propTypes = {
  intl: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
  const pods = {
    nodes: {},
    isFetching: false
  }
  const cluster = state.entities.current.cluster.clusterID
  const { getAllClusterNodes, kubectlsPods, addNodeCMD } = state.cluster_nodes
  const { isFetching } = getAllClusterNodes || pods
  const data = getAllClusterNodes.nodes || pods
  const { cpuList, memoryList } = data
  const nodes = data.clusters ? data.clusters.nodes : []
  return {
    nodes,
    cpuList,
    memoryList,
    isFetching,
    cluster,
    kubectlsPods: (kubectlsPods ? kubectlsPods.result : {}) || {},
    addNodeCMD: (addNodeCMD ? addNodeCMD.result : {}) || {},
  }
}

export default connect(mapStateToProps, {
  getAllClusterNodes,
  changeClusterNodeSchedule,
  deleteClusterNode,
  getKubectlsPods,
  getAddNodeCMD,
})(injectIntl(clusterTabList, {
  withRef: true,
}))