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
import { Menu, Button, Card, Input, Dropdown, Spin, Modal, message, Icon, Checkbox } from 'antd'
import { Link ,browserHistory} from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
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
    scheduleStatus: false,
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
            <span>应用名称</span>
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
            <Dropdown.Button overlay={dropdown} type='ghost' onClick={()=>browserHistory.push(`/app_manage/app_create/fast_create?registryServer=${registryServer}&imageName=${item.name}`)}>
              <FormattedMessage {...menusText.deployService} />
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
  }
  componentWillReceiveProps(nextProps) {
  }
  render() {
    const { formatMessage } = this.props.intl;
    const { isFetching, podList } = this.props;
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
                  <span>应用名称</span>
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
              <MyComponent podList={podList} isFetching={isFetching} />
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
    podList: testList,
    isFetching: false
  }
  const { podList, isFetching } = pods;
  return {
    podList,
    isFetching
  }
}

export default connect(mapStateToProps, {
})(injectIntl(clusterTabList, {
  withRef: true,
}))