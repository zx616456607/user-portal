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
import { Menu, Button, Card, Input, Dropdown, Spin, Modal, message, Icon, Checkbox, Switch, Tooltip } from 'antd'
import { Link ,browserHistory} from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { getAllClusterNodes, changeClusterNodeSchedule, deleteClusterNode } from '../../actions/cluster_node'
import './style/clusterTabList.less'
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


const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  componentWillMount() {
  },
  changeSchedulable(node, e) {
    //this function for change node schedulable
    const { scope } = this.props;
    const { cluster, changeClusterNodeSchedule } = scope.props;
    changeClusterNodeSchedule(cluster, node, e, {
      success: {
        func: ()=> {
          notification['success']({
            message: e ? '关闭调度成功' : '打开调度成功',
          });
        },
        isAsync: true
      }
    })
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
        <Menu onClick={()=> this.setState({delModal: true, imageName: item.name})}
          style={{ width: '100px' }}
          >
          <Menu.Item key={item.id}>
            <span>删除节点</span>
          </Menu.Item>
        </Menu>
      );
      return (
        <div className='podDetail' key={`${item.name}-${index}`} >
          <div className='checkBox commonTitle'>
            <Checkbox ></Checkbox>
          </div>
          <div className='name commonTitle'>
            <Tooltip title={item.isMaster.name}>
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
            <span>{}</span>
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
            <Dropdown.Button overlay={dropdown} type='ghost'>
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
    this.state = {
      nodes: {}
    }
  }
  
  componentWillMount() {
    const { getAllClusterNodes, cluster } = this.props;
    getAllClusterNodes(cluster)    
  }
  
  componentWillReceiveProps(nextProps) {
    const { isFetching, nodes } = nextProps;
    if(isFetching && this.props.nodes != nodes) {
      this.setState({
        nodes: nodes
      })
    }
  }
  
  render() {
    const { formatMessage } = this.props.intl;
    const { isFetching } = this.props;
    const { nodes } = this.state;
    const rootscope = this.props.scope;
    const scope = this;
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
              <Button className='terminalBtn' size='large' type='ghost'>
                <svg>
                  <use xlinkHref='#terminal' />
                </svg>
                <span>终端</span>
              </Button>
              <span className='searchBox'>
                <Input className='searchInput' size='large' placeholder='搜索' type='text' />
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
              <MyComponent podList={nodes.nodes} containerList={nodes.podCount} isFetching={isFetching} scope={scope} />
            </div>
          </Card>
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
  const { getAllClusterNodes } = state.cluster_nodes
  const { nodes, isFetching } = getAllClusterNodes || pods
  return {
    nodes,
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