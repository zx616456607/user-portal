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
import { getIntegrationVmList, manageVmDetail } from '../../actions/integration'
import { Button, Alert, Card, Spin, Input, Tooltip, Dropdown, Menu, Select, notification, Modal } from 'antd'
import { formatDate, calcuDate } from '../../common/tools'
import './style/VmList.less'
import CreateVmModal from './CreateVmModal'

const ButtonGroup = Button.Group;
const Option = Select.Option;

const menusText = defineMessages({
  create: {
    id: 'Integration.VmList.create',
    defaultMessage: '克隆虚拟机',
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
  poweron: {
    id: 'Integration.VmList.poweron',
    defaultMessage: '打开电源',
  },
  poweroff: {
    id: 'Integration.VmList.poweroff',
    defaultMessage: '关闭电源',
  },
  shutdown: {
    id: 'Integration.VmList.shutdown',
    defaultMessage: '关闭虚拟机',
  },
  delete: {
    id: 'Integration.VmList.delete',
    defaultMessage: '删除虚拟机',
  },
  createTitle: {
    id: 'Integration.VmList.createTitle',
    defaultMessage: '克隆虚拟机',
  },
  poweronStatus: {
    id: 'Integration.VmList.poweronStatus',
    defaultMessage: '运行中',
  },
  poweroffStatus: {
    id: 'Integration.VmList.poweroffStatus',
    defaultMessage: '已关闭',
  },
  refresh: {
    id: 'Integration.VmList.refresh',
    defaultMessage: '刷新',
  }
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

function formatStatus(status) {
  //this function for format status
  switch(status) {
    case 'poweron':
      return (
        <span className='poweron'><i className='fa fa-circle' /><FormattedMessage {...menusText.poweronStatus} /></span>
      )
      break;
    case 'poweroff':
      return (
        <span className='poweroff'><i className='fa fa-circle' /><FormattedMessage {...menusText.poweroffStatus} /></span>
      )
      break;
  }
}

class VmList extends Component {
  constructor(props) {
    super(props);
    this.onChangeShowType = this.onChangeShowType.bind(this);
    this.onChangeAppType = this.onChangeAppType.bind(this);
    this.ShowDetailInfo = this.ShowDetailInfo.bind(this);
    this.onChangeDataCenter = this.onChangeDataCenter.bind(this);
    this.onPowerOn = this.onPowerOn.bind(this);
    this.meunClick = this.meunClick.bind(this);
    this.closeCreateVmModal = this.closeCreateVmModal.bind(this);
    this.openCreateVmModal = this.openCreateVmModal.bind(this);
    this.refreshVmList = this.refreshVmList.bind(this);
    this.state = {
      currentShowApps: 'all',
      currentAppType: '1',
      showType: 'list',
      createVmModal: false
    }
  }
  
  componentWillMount() {
    document.title = '集成中心 | 时速云';
    const { getIntegrationVmList, integrationId, currentDataCenter } = this.props;
    getIntegrationVmList(integrationId, currentDataCenter)
  }
  
  componentWillReceiveProps(nextProps) {
    const { getIntegrationVmList, integrationId, currentDataCenter } = nextProps;
    if(nextProps.currentDataCenter != this.props.currentDataCenter) {
      getIntegrationVmList(integrationId, currentDataCenter)
    }
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
  
  onPowerOn(path, status) {
    //this function for user power on the vm
    const { manageVmDetail, integrationId, currentDataCenter, vmList } = this.props;
    let tempBody = {
      action: status,
      vm: path
    }
    let title = null;
    let successMsg = null;
    let errorMsg = null;
    let newStatus = null;
    if(status == 'poweron') {
      title = '打开虚拟机';
      successMsg = '该虚机已经打开了~';
      errorMsg = '打开虚拟机成功~';
      newStatus = 'poweroff';
    } else if (status == 'poweroff') {
      title = '关闭虚拟机';
      successMsg = '该虚机已经关闭了~';
      errorMsg = '关闭虚拟机成功~';
      newStatus = 'poweron';
    }
    vmList.map((item) => {
      if(item.path == path && item.powerstate == status) {
        notification['warning']({
          message: title,
          description: errorMsg,
        });
      }
    });
    manageVmDetail(integrationId, currentDataCenter, tempBody, {
      success: {
        func: () => {
          vmList.map((item) => {
            if(item.path == path) {
              
              item.powerstate = newStatus;
            }
          });
          notification['success']({
          message: title,
          description: successMsg,
        });
        },
        isAsync: true
      }
    });
  }
  
  meunClick(path, key) {
    //this function for user manage the vm 
    const { manageVmDetail, integrationId, currentDataCenter, vmList } = this.props;
    let title = null;
    let msg = null;
    let errorMsg = null;
    switch(key.key) {
      case 'poweroff':
        title = '关闭电源';
        msg = '关闭电源成功~';
        errorMsg = '该虚机已经关闭电源了~';
        break;
      case 'shutdown':
        title = '关闭虚拟机';
        msg = '关闭虚拟机成功~';
        errorMsg = '该虚机已经关闭了~';
        break;
      case 'delete':
        title = '删除虚拟机';
        msg = '删除虚拟机成功~';
        errorMsg = '该虚机已经被删除了~';
        break;
      case 'poweron':
        title = '打开虚拟机';
        msg = '打开虚拟机成功~';
        errorMsg = '该虚机已经被打开了~';
        break;
    }
    vmList.map((item) => {
      if(item.path == path && item.powerstate == key.key) {
        notification['warning']({
          message: title,
          description: errorMsg,
        });
      }
    })
    let tempBody = {
      action: key.key,
      vm: path
    }
    manageVmDetail(integrationId, currentDataCenter, tempBody, {
      success: {
        func: () => {
          vmList.map((item) => {
            if(item.path == path) {
              item.powerstate = key.key
            }
          });
          notification['success']({
          message: title,
          description: msg,
        });
        },
        isAsync: true
      }
    });
  }
  
  openCreateVmModal() {
    //this function for user open the create vm modal
    this.setState({
      createVmModal: true
    })
  }
  
  closeCreateVmModal() {
    //this function for user close the create vm modal
    this.setState({
      createVmModal: false
    })
  }
  
  refreshVmList() {
    //this function for refresh the vm list
    const { currentDataCenter, getIntegrationVmList, integrationId } = this.props;
    getIntegrationVmList(integrationId, currentDataCenter);
  }
  
  render() {
    const { formatMessage } = this.props.intl;
    const { isFetching, vmList, dataCenters, currentDataCenter, integrationId } = this.props;
    const scope = this;
    if(isFetching || !Boolean(vmList)) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    let appShow = vmList.map((item, index) => {
      const menu = (
        <Menu onClick={this.meunClick.bind(this, item.path)} style={{ width: '126px' }}>
          { 
            item.powerstate == 'poweron' ? [<Menu.Item key='poweroff'><i className='fa fa-stop' />&nbsp;<FormattedMessage {...menusText.poweroff} /></Menu.Item>] : [<Menu.Item key='poweron'><i className='fa fa-play' />&nbsp;<FormattedMessage {...menusText.poweron} /></Menu.Item>]
          }          
          <Menu.Item key='shutdown'><i className='fa fa-chain-broken' />&nbsp;<FormattedMessage {...menusText.shutdown} /></Menu.Item>
          <Menu.Item key='delete' disabled><i className='fa fa-trash' />&nbsp;<FormattedMessage {...menusText.delete} /></Menu.Item>
        </Menu>
      )
      return (
        <div className='podDetail' key={'podDetail' + index}>
          <div className='ip commonTitle'>
            <span className='commonSpan'>
              <Tooltip placement='topLeft' title={item.name}>
                <span className='topSpan'>{item.name}</span>
              </Tooltip>
              <Tooltip placement='topLeft' title={!!item.ip ? item.ip : '-'}>
                <span className='bottomSpan'>{!!item.ip ? item.ip : '-'}</span>
              </Tooltip>
            </span>
          </div>
          <div className='status commonTitle'>
            <span className='commonSpan'>
              <span>{formatStatus(item.powerstate)}</span>
            </span>
          </div>
          <div className='pod commonTitle'>
            <span className='commonSpan'>
              <Tooltip placement='topLeft' title={item.hostSystem}>
               <span>{item.hostSystem}</span>
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
            {/*<Button size='large' type='primary' className='terminalBtn'>
              <svg className='terminal'>
                <use xlinkHref='#terminal' />
              </svg>
              <span style={{ marginLeft: '20px' }}>终端</span>
            </Button>*/}
            <Dropdown.Button overlay={menu} type='ghost' size='large' onClick={this.onPowerOn.bind(this, item.path, item.powerstate)}>
              <span>
                { item.powerstate == 'poweron' ? [<span><i className='fa fa-play' />&nbsp;<FormattedMessage {...menusText.poweron} /></span>] : [<span><i className='fa fa-stop' />&nbsp;<FormattedMessage {...menusText.poweroff} /></span>] }
              </span>
            </Dropdown.Button>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
      )
    });
    return (
      <div id='VmList' key='VmList'>
        <div className='operaBox'>
          <Button type='primary' size='large' onClick={this.openCreateVmModal.bind(this)}>
            <i className='fa fa-plus' />&nbsp;
            <FormattedMessage {...menusText.create} />
          </Button>
          <Button type='primary' size='large' className='refreshBtn' onClick={this.refreshVmList.bind(this)}>
            <i className='fa fa-refresh' />&nbsp;
            <FormattedMessage {...menusText.refresh} />
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
        { vmList.length == 0 ? [
          <div className='loadingBox' key='loadingBox'>
            <span>暂无数据</span>
          </div>
        ] : null }
        <Modal
          title={<FormattedMessage {...menusText.createTitle} />}
          className='createIntegrationModal'
          visible={this.state.createVmModal}
          onCancel={this.closeCreateVmModal.bind(this)}
        >
          <CreateVmModal scope={scope} createVmModal={this.state.createVmModal} currentDataCenter={currentDataCenter} integrationId={integrationId}/>
        </Modal>
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
  getIntegrationVmList,
  manageVmDetail
})(injectIntl(VmList, {
  withRef: true,
}));

