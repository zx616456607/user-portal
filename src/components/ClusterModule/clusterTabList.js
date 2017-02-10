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
import { Menu, Button, Card, Input, Dropdown, Spin, Modal, message, Icon, Checkbox, Switch, Tooltip, notification } from 'antd'
import { Link ,browserHistory} from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { getAllClusterNodes, changeClusterNodeSchedule, deleteClusterNode } from '../../actions/cluster_node'
import './style/clusterTabList.less'
import TerminalModal from '../TerminalModal'
import NotificationHandler from '../../common/notification_handler'
import { formatDate, calcuDate } from '../../common/tools'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const ButtonGroup = Button.Group

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
  let num;
  podList.map((pod) => {
    if(pod.name == name) {
      num = pod.count; 
    }
  });
  return num;
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
            message: e ? '打开调度成功' : '关闭调度成功',
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
      deleteNodeName: node,
      deleteNodeModal: true
    })
  },
  openTerminalModal(item, e) {
    
  },
  render: function () {
    const { isFetching, podList, containerList } = this.props
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
      const dropdown = (
        <Menu onClick={this.ShowDeleteClusterNodeModal.bind(this, item.objectMeta.name)}
          style={{ width: '100px' }}
          >
          <Menu.Item key={item.id}>
            <span>删除节点</span>
          </Menu.Item>
        </Menu>
      );
      return (
        <div className='podDetail' key={`${item.objectMeta.name}-${index}`} >
          <div className='checkBox commonTitle'>
            <Checkbox ></Checkbox>
          </div>
          <div className='name commonTitle'>
            <Tooltip title={item.objectMeta.name}>
              <span>{item.objectMeta.name}</span>
            </Tooltip>
          </div>
          <div className='status commonTitle'>
            <span className={ item.ready == 'True' ? 'runningSpan' : 'errorSpan' }><i className='fa fa-circle' />&nbsp;&nbsp;{item.ready == 'True' ? '运行中' : '异常'}</span>
          </div>
          <div className='role commonTitle'>
            <Tooltip title={item.isMaster ? '主控节点/Master' : '计算节点/Slave'}>
              <span>{item.isMaster ? '主控节点/Master' : '计算节点/Slave'}</span>
            </Tooltip>
          </div>
          <div className='container commonTitle'>
            <span>{getContainerNum(item.objectMeta.name, containerList)}</span>
          </div>
          <div className='cpu commonTitle'>
            <span className='topSpan'>{item.cpuTotal / 1000}核</span>
            <span className='bottomSpan'>{item.cpuUsed * 100 + '%'}</span>
          </div>
          <div className='memory commonTitle'>
            <span className='topSpan'>{diskFormat(item.memoryTotalKB)}</span>
            <span className='bottomSpan'>{item.memoryUsed * 100 + '%'}</span>
          </div>
          <div className='disk commonTitle'>
            <span className='topSpan'>{item.diskNum}</span>
            <span className='bottomSpan'>{item.diskUsed * 100 + '%'}</span>
          </div>
          <div className='schedule commonTitle'>
            <Switch className='switchBox' defaultChecked={item.schedulable} checkedChildren='开' unCheckedChildren='关' onChange={this.changeSchedulable.bind(root, item.objectMeta.name)}/>
            <span className='scheduleSpan'>{item.schedulable ? '正常调度' : '闲置下线'}</span>
          </div>
          <div className='runningTime commonTitle'>
            <Tooltip title={calcuDate(item.startTime)}>
            <span>{calcuDate(item.startTime)}</span>
            </Tooltip>
          </div>
          <div className='startTime commonTitle'>
            <Tooltip title={formatDate(item.startTime)}>
              <span>{formatDate(item.startTime)}</span>
            </Tooltip>
          </div>
          <div className='opera commonTitle'>
            <Dropdown.Button overlay={dropdown} type='ghost' onClick={this.openTerminalModal.bind(this, item)}>
              <svg>
                <use xlinkHref='#terminal' />
              </svg>
              <span>终端</span>
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

class clusterTabList extends Component {
  constructor(props) {
    super(props);
    this.searchNodes = this.searchNodes.bind(this);
    this.deleteClusterNode = this.deleteClusterNode.bind(this);
    this.closeDeleteModal = this.closeDeleteModal.bind(this);
    this.closeTerminalLayoutModal = this.closeTerminalLayoutModal.bind(this);
    this.state = {
      nodeList: [],
      podCount: [],
      currentContainer: [],
      deleteNodeModal: false,
      TerminalLayoutModal: false
    }
  }
  
  componentWillMount() {
    const { getAllClusterNodes, cluster } = this.props;
    const _this = this;
    getAllClusterNodes(cluster, {
      success: {
        func: (result) => {
          let nodeList = result.data.nodes.nodes;
          let podCount = result.data.podCount;
          _this.setState({
            nodeList: nodeList,
            podCount: podCount
          })
        },
        isAsync: true
      }
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
    const { cluster, deleteClusterNode, getAllClusterNodes } = this.props;
    const { deleteNodeName } = this.state;
    const _this = this;
    deleteClusterNode(cluster, deleteNodeName, {
      success: {
        func: () => {
          getAllClusterNodes(cluster, {
            success: {
              func: (result) => {
                let nodeList = result.data.nodes.nodes;
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
    let { currentContainer } = this.state;
    let hadFlag = false;
    currentContainer.map((container) => {
      if(container.metadata.name == item.metadata.name) {
        hadFlag = true;
      }
    });
    if(!hadFlag) {
      let body = {
        metadata: {
          namespace: 'kube-system',
          name: ''
        }
      }
      currentContainer.push()
    }
    this.setState({
      currentContainer: currentContainer,
      TerminalLayoutModal: true
    });
  }
  
  render() {
    const { formatMessage } = this.props.intl;
    const { isFetching, nodes, cluster } = this.props;
    const { nodeList, podCount } = this.state;
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
              <Button className='addPodBtn' size='large' type='primary'>
                <Icon type='plus' />
                <span>添加主机节点</span>
              </Button>
              <Button className='terminalBtn' size='large' type='ghost' onClick={this.openTerminalModal.bind(this, item)}>
                <svg>
                  <use xlinkHref='#terminal' />
                </svg>
                <span>终端</span>
              </Button>
              <span className='searchBox'>
                <Input className='searchInput' size='large' placeholder='搜索' type='text' onChange={this.searchNodes} />
                <i className='fa fa-search'></i>
              </span>
            </div>
            <div className='dataBox'>
              <div className='titleBox'>
                <div className='checkBox commonTitle'>
                  <Checkbox ></Checkbox>
                </div>
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
                  <span>硬盘</span>
                </div>
                <div className='schedule commonTitle'>
                  <span>调度状态</span>
                </div>
                <div className='runningTime commonTitle'>
                  <span>进行时间</span>
                </div>
                <div className='startTime commonTitle'>
                  <span>启动时间</span>
                </div>
                <div className='opera commonTitle'>
                  <span>操作</span>
                </div>
              </div>
              <MyComponent podList={nodeList} containerList={podCount} isFetching={isFetching} scope={scope} />
            </div>
          </Card>
          <Modal title='删除主机' className='deleteClusterNodeModal' visible={this.state.deleteNodeModal} onOk={this.deleteClusterNode} onCancel={this.closeDeleteModal}>
            <span style={{ color: '#00a0ea' }}><Icon type='exclamation-circle-o' />&nbsp;&nbsp;&nbsp;确定要删除&nbsp;{this.state.deleteNodeName}&nbsp;主机节点？</span>
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
    data: {},
    isFetching: false
  }
  const cluster = state.entities.current.cluster.clusterID
  const { getAllClusterNodes } = state.cluster_nodes
  const { data, isFetching } = getAllClusterNodes || pods
  const { nodes, cpuList, memoryList } = data
  return {
    nodes,
    cpuList,
    memoryList,
    isFetching,
    cluster
  }
}

export default connect(mapStateToProps, {
  getAllClusterNodes,
  changeClusterNodeSchedule,
  deleteClusterNode
})(injectIntl(clusterTabList, {
  withRef: true,
}))