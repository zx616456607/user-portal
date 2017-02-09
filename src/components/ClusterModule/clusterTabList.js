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

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const ButtonGroup = Button.Group

let testList = [
  {
    name: 'test-1',
    masterPod: 'Master',
    computePod: 'Slave',
    containers: '12',
    cpuNum: '8',
    cpuUsed: 0.2,
    memoryNum: '5',
    memoryUsed: 0.6,
    diskNum: '1',
    diskUsed: 0.3,
    scheduleStatus: false,
    runnigTime: 30,
    startTime: '2017-1-22 18:04:22'
  }, {
    name: 'test-2',
    masterPod: 'Master',
    computePod: 'Slave',
    containers: '12',
    cpuNum: '8',
    cpuUsed: 0.2,
    memoryNum: '5',
    memoryUsed: 0.6,
    diskNum: '1',
    diskUsed: 0.3,
    scheduleStatus: true,
    runnigTime: 30,
    startTime: '2017-1-22 18:04:22'
  }, {
    name: 'test-3',
    masterPod: 'Master',
    containers: '12',
    cpuNum: '8',
    cpuUsed: 0.2,
    memoryNum: '5',
    memoryUsed: 0.6,
    diskNum: '1',
    diskUsed: 0.3,
    scheduleStatus: false,
    runnigTime: 30,
    startTime: '2017-1-22 18:04:22'
  }
]

const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  componentWillMount() {
  },
  render: function () {
    const { isFetching, podList } = this.props
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
            <Tooltip title={item.objectMeta.name}>
              <span>{item.objectMeta.name}</span>
            </Tooltip>
          </div>
          <div className='status commonTitle'>
            <span>{item.ready == 'True' ? '运行中' : '异常'}</span>
          </div>
          <div className='role commonTitle'>
            {
              item.masterPod ? [<span>{item.masterPod}</span>] : null
            }
            {
              item.computePod ? [<span>{item.computePod}</span>] : null
            }
            <span></span>
          </div>
          <div className='container commonTitle'>
            <span>{item.containers}</span>
          </div>
          <div className='cpu commonTitle'>
            <span>{item.cpuNum}</span>
            <span>{item.cpuUsed * 100 + '%'}</span>
          </div>
          <div className='memory commonTitle'>
            <span>{item.memoryNum}</span>
            <span>{item.memoryUsed * 100 + '%'}</span>
          </div>
          <div className='disk commonTitle'>
            <span>{item.diskNum}</span>
            <span>{item.diskUsed * 100 + '%'}</span>
          </div>
          <div className='schedule commonTitle'>
            <Switch defaultChecked={item.scheduleStatus} checkedChildren="开" unCheckedChildren="关" />
            <span>{item.scheduleStatus ? '正常调度' : '闲置下线'}</span>
          </div>
          <div className='runningTime commonTitle'>
            <Tooltip title={item.runnigTime + 'Days'}>
            <span>{item.runnigTime + 'Days'}</span>
            </Tooltip>
          </div>
          <div className='startTime commonTitle'>
            <Tooltip title={item.startTime}>
              <span>{item.startTime}</span>
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
    }
  }
  componentWillMount() {
    const { getAllClusterNodes, cluster } = this.props;
    getAllClusterNodes(cluster)    
  }
  componentWillReceiveProps(nextProps) {
  }
  render() {
    console.log(this.props)
    const { formatMessage } = this.props.intl;
    const { isFetching, nodes } = this.props;
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
              <MyComponent podList={nodes.nodes} isFetching={isFetching} />
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