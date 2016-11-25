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
import { getIntegrationVmList } from '../../actions/integration'
import { Button, Alert, Card, Spin, Input, Tooltip, Dropdown, Menu, Select } from 'antd'
import { formatDate, calcuDate } from '../../common/tools'
import './style/VmList.less'

const ButtonGroup = Button.Group;
const Option = Select.Option;

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
  core: {
    id: 'Integration.VmList.core',
    defaultMessage: '核',
  },
})

function diskFormat(num) {
  if(num < 1024) {
    return num + 'MB'
  }
  num = parseInt(num / 1024);
  if(num < 1024) {
    return num + 'GB'
  }
  num = parseInt(num / 1024);
  return num + 'TB'
}

class VmList extends Component {
  constructor(props) {
    super(props);
    this.onChangeShowType = this.onChangeShowType.bind(this);
    this.onChangeAppType = this.onChangeAppType.bind(this);
    this.ShowDetailInfo = this.ShowDetailInfo.bind(this);
    this.onChangeDataCenter = this.onChangeDataCenter.bind(this);
    this.state = {
      currentShowApps: 'all',
      currentAppType: '1',
      showType: 'list'
    }
  }
  
  componentWillMount() {
    document.title = '集成中心 | 时速云';
    const { getIntegrationVmList, integrationId, currentDataCenter } = this.props;
    getIntegrationVmList(integrationId, currentDataCenter)
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
  
  onChangeDataCenter(e) {
    //this function for user change the current data center
    const { scope, getIntegrationVmList, integrationId } = this.props;
    scope.setState({
      currentDataCenter: e
    });
    getIntegrationVmList(integrationId, e)
  }
  
  render() {
    const { formatMessage } = this.props.intl;
    const {isFetching, vmList, dataCenters, currentDataCenter} = this.props;
    const scope = this;
    console.log(this.props)
    if(isFetching || !Boolean(vmList)) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    let appShow = vmList.map((item, index) => {
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
              <Tooltip placement='topLeft' title={!!item.ip ? item.ip : null}>
                <span>{!!item.ip ? item.ip : '-'}</span>
              </Tooltip>
            </span>
          </div>
          <div className='status commonTitle'>
            <span className='commonSpan'>
              <span>{item.powerstate}</span>
            </span>
          </div>
          <div className='pod commonTitle'>
            <span className='commonSpan'>
              <Tooltip placement='topLeft' title={item.name}>
               <span>{item.name}</span>
              </Tooltip>
            </span>
          </div>
          <div className='cpu commonTitle'>
            <span className='commonSpan'>
              <span>{item.cpuNumber}<FormattedMessage {...menusText.core} /></span>
            </span>
          </div>
          <div className='memory commonTitle'>
            <span className='commonSpan'>
              <span>{diskFormat(item.memoryTotal)}</span>
            </span>
          </div>
          <div className='disk commonTitle'>
            <span className='commonSpan'>
              <span>{diskFormat(item.diskTotal)}</span>
            </span>
          </div>
          <div className='runTime commonTitle'>
            <span className='commonSpan'>
              <Tooltip placement='topLeft' title={!!item.bootTime ? calcuDate(item.bootTime) : null}>
                <span>{!!item.bootTime ? calcuDate(item.bootTime) : '-'}</span>
              </Tooltip>
            </span>
          </div>
          <div className='startTime commonTitle'>
            <span className='commonSpan'>
              <Tooltip placement='topLeft' title={!!item.bootTime ? formatDate(item.bootTime) : null}>
                <span>{!!item.bootTime ? formatDate(item.bootTime) : '-'}</span>
              </Tooltip>
            </span>
          </div>
          <div className='opera commonTitle'>
            <Button size='large' type='primary' className='terminalBtn'>
              <svg className='terminal'>
                <use xlinkHref='#terminal' />
              </svg>
              <span style={{ marginLeft: '20px' }}>终端</span>
            </Button>
            <Dropdown.Button overlay={menu} type="ghost" size='large'>
              干嘛呢
            </Dropdown.Button>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
      )
    });
    let selectDcShow = dataCenters.map((item, index) => {
      return (
        <Option value={item} key={item}>{item.replace('/','')}</Option>
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
          <Select defaultValue={currentDataCenter} style={{ width: 150, marginLeft: '15px' }} size='large' onChange={this.onChangeDataCenter}>
            {selectDcShow}
          </Select>
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
        { vmList.length == 0 ? [
          <div className='loadingBox' key='loadingBox'>
            <span>暂无数据</span>
          </div>
        ] : null }
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultVmList = {
    isFetching: false,
    vmList: []
  }
  const { getIntegrationVmList } = state.integration
  const { isFetching, vmList } = getIntegrationVmList || defaultVmList
  return {
    isFetching,
    vmList
  }
}

VmList.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getIntegrationVmList
})(injectIntl(VmList, {
  withRef: true,
}));

