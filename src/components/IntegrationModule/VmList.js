/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  VmList index module
 *
 * v2.0 - 2016-11-22
 * @author by Gaojian
 */

import React, { Component, PropTypes } from 'react'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Button, Alert, Card, Spin, Input, Tooltip, Dropdown, Menu } from 'antd'
import './style/VmList.less'

const ButtonGroup = Button.Group;


let testData = [
  {
    id: '192.168.1.1',
    status: 'running',
    pod: '192.168.1.2',
    ip: '233.233.233.233',
    runTime: '30Days',
    startTime: '2016-11-22 19:38:27',
    env: 'tcp',
    life: '3Years',
  },
  {
    id: '192.168.1.1',
    status: 'running',
    pod: '192.168.1.2',
    ip: '233.233.233.233',
    runTime: '30Days',
    startTime: '2016-11-22 19:38:27',
    env: 'tcp',
    life: '3Years',
  },
  {
    id: '192.168.1.1',
    status: 'running',
    pod: '192.168.1.2',
    ip: '233.233.233.233',
    runTime: '30Days',
    startTime: '2016-11-22 19:38:27',
    env: 'tcp',
    life: '3Years',
  },
  {
    id: '192.168.1.1',
    status: 'running',
    pod: '192.168.1.2',
    ip: '233.233.233.233',
    runTime: '30Days',
    startTime: '2016-11-22 19:38:27',
    env: 'tcp',
    life: '3Years',
  }
]

const menusText = defineMessages({
  create: {
    id: 'Integration.VmList.create',
    defaultMessage: '创建虚拟机',
  },
  ip: {
    id: 'Integration.VmList.ip',
    defaultMessage: '虚拟机IP',
  },
  status: {
    id: 'Integration.VmList.status',
    defaultMessage: '状态',
  },
  pod: {
    id: 'Integration.VmList.pod',
    defaultMessage: '所属物理机',
  },
  memory: {
    id: 'Integration.VmList.memory',
    defaultMessage: '内存',
  },
  disk: {
    id: 'Integration.VmList.disk',
    defaultMessage: '硬盘',
  },
  runTime: {
    id: 'Integration.VmList.runTime',
    defaultMessage: '运行时间',
  },
  startTime: {
    id: 'Integration.VmList.startTime',
    defaultMessage: '启动时间',
  },
  opera: {
    id: 'Integration.VmList.opera',
    defaultMessage: '操作',
  },
})

class VmList extends Component {
  constructor(props) {
    super(props);
    this.onChangeShowType = this.onChangeShowType.bind(this);
    this.onChangeAppType = this.onChangeAppType.bind(this);
    this.ShowDetailInfo = this.ShowDetailInfo.bind(this);
    this.state = {
      currentShowApps: 'all',
      currentAppType: '1',
      showType: 'list'
    }
  }
  
  componentWillMount() {
    document.title = '集成中心 | 时速云';
  }
  
  onChangeShowType(type) {
    //this function for user change the type of app list
    this.setState({
      currentShowApps: type
    });
  }
  
  onChangeAppType(type) {
    //this function for user change the type of app
    this.setState({
      currentAppType: type
    });
  }
  
  ShowDetailInfo(name) {
    //this function for view the app detail info
    this.setState({
      showType: 'detail'
    });
  }
  
  render() {
    const { formatMessage } = this.props.intl;
    const {isFetching, VmList} = this.props;
    const scope = this;
    let appShow = VmList.map((item, index) => {
      const menu = (
        <Menu>
          <Menu.Item key="1">我是干嘛的</Menu.Item>
          <Menu.Item key="2">我是干嘛的</Menu.Item>
          <Menu.Item key="3">我是干嘛的</Menu.Item>
        </Menu>
      )
      return (
        <div className='podDetail' key={'podDetail' + index}>
          <div className='ip commonTitle'>
            <span className='commonSpan'>
              <Tooltip placement='topLeft' title={item.id}>
                <span>{item.id}</span>
              </Tooltip>
            </span>
          </div>
          <div className='status commonTitle'>
            <span className='commonSpan'>
              <span>{item.status}</span>
            </span>
          </div>
          <div className='pod commonTitle'>
            <span className='commonSpan'>
              <Tooltip placement='topLeft' title={item.pod}>
               <span>{item.pod}</span>
              </Tooltip>
            </span>
          </div>
          <div className='cpu commonTitle'>
            <span className='commonSpan'>
              <Tooltip placement='topLeft' title={item.ip}>
                <span>{item.ip}</span>
              </Tooltip>
            </span>
          </div>
          <div className='memory commonTitle'>
            <span className='commonSpan'>
              <span>{item.runTime}</span>
            </span>
          </div>
          <div className='disk commonTitle'>
            <span className='commonSpan'>
              <Tooltip placement='topLeft' title={item.startTime}>
                <span>{item.startTime}</span>
              </Tooltip>
            </span>
          </div>
          <div className='runTime commonTitle'>
            <span className='commonSpan'>
              <Tooltip placement='topLeft' title={item.env}>
                <span>{item.env}</span>
              </Tooltip>
            </span>
          </div>
          <div className='startTime commonTitle'>
            <span className='commonSpan'>
              <Tooltip placement='topLeft' title={item.life}>
                <span>{item.life}</span>
              </Tooltip>
            </span>
          </div>
          <div className='opera commonTitle'>
            <Dropdown.Button overlay={menu} type="ghost">
              干嘛呢
            </Dropdown.Button>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
      )
    });
    return (
      <div id='VmList' key='VmList'>
        <div className='operaBox'>
          <Button type='primary' size='large'>
            <i className='fa fa-plus' />&nbsp;
            <FormattedMessage {...menusText.create} />
          </Button>
          <div className='searchBox'>
            <Input type='text' size='large' />
            <i className='fa fa-search' />
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className='titleBox'>
          <div className='ip commonTitle'>
            <FormattedMessage {...menusText.ip} />
          </div>
          <div className='status commonTitle'>
            <FormattedMessage {...menusText.status} />
          </div>
          <div className='pod commonTitle'>
            <FormattedMessage {...menusText.pod} />
          </div>
          <div className='cpu commonTitle'>
            <span>CPU</span>
          </div>
          <div className='memory commonTitle'>
            <FormattedMessage {...menusText.memory} />
          </div>
          <div className='disk commonTitle'>
            <FormattedMessage {...menusText.disk} />
          </div>
          <div className='runTime commonTitle'>
            <FormattedMessage {...menusText.runTime} />
          </div>
          <div className='startTime commonTitle'>
            <FormattedMessage {...menusText.startTime} />
          </div>
          <div className='opera commonTitle'>
            <FormattedMessage {...menusText.opera} />
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        {appShow}
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultAppList = {
    isFetching: false,
    VmList: testData
  }
  const {isFetching, VmList} = defaultAppList
  return {
    isFetching,
    VmList
  }
}

VmList.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {

})(injectIntl(VmList, {
  withRef: true,
}));

