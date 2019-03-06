/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * AlarmCard
 *
 * @author Songsz
 * @date 2018-12-20
 *
*/

import React from 'react'
import { Menu, Dropdown, Icon, Tooltip, Modal } from 'antd'
import './style/AlarmCard.less'
import TenxIcon from '@tenx-ui/icon/es/_old'
import classnames from 'classnames'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { quickRestartServices } from '../../actions/sysServiceManage'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import NotificationHandler from '../../../src/components/Notification'
import { sysServiceRunningStatus } from './funcs'

@connect(null, { quickRestartServices })
export default class AlarmCard extends React.PureComponent {
  state = {
    restartModal: false,
    restartFetching: false,
  }
  onDropdownMenuClick = ({ key }) => {
    if (key === 'restart') return this.setState({ restartModal: true })
    if (key === 'log') return this.toDetail('log')
    if (key === 'monitor') return this.toDetail('monitor')
    if (key === 'alarm') return this.toDetail('alarm')
  }
  restart = async () => {
    this.setState({ restartFetching: true })
    const { clusterID, quickRestartServices: _quickRestartServices } = this.props
    const res = await _quickRestartServices(clusterID, [ this.props.data.name ])
    this.setState({ restartFetching: false })
    if (getDeepValue(res, 'response.result.data.status'.split('.')) === 'Success') {
      this.setState({ restartModal: false })
      const notification = new NotificationHandler()
      notification.success('重启成功')
    }
  }

  toDetail = active => {
    const activeTab = active ? `&active=${active}` : ''
    browserHistory.push(`/cluster/sysServiceManageDetail?clusterID=${this.props.clusterID}&name=${this.props.data.name}${activeTab}`)
  }
  render() {
    const { data } = this.props
    const successStatus = sysServiceRunningStatus(data)
    return (
      <div
        className="clusterSysServiceManageAlarmCard"
        onClick={() => this.toDetail()}
      >
        <div onClick={e => e.stopPropagation()} className="setting">
          <Dropdown
            overlay={
              <Menu onClick={this.onDropdownMenuClick}>
                <Menu.Item key="restart">&nbsp;&nbsp;重启&nbsp;&nbsp;</Menu.Item>
                <Menu.Item key="log">&nbsp;&nbsp;日志&nbsp;&nbsp;</Menu.Item>
                <Menu.Item key="monitor">&nbsp;&nbsp;监控&nbsp;&nbsp;</Menu.Item>
                <Menu.Item key="alarm">&nbsp;&nbsp;告警&nbsp;&nbsp;</Menu.Item>
              </Menu>}
            placement="bottomLeft">
            <TenxIcon type="setting-o"/>
          </Dropdown>
        </div>
        <div className="name">
          <Tooltip title={data.name}>
            <div className="textoverflow inlineBlock nameIn">{data.name}</div>
          </Tooltip>
        </div>
        <div className="desc">实例数：{(data.pods || []).length}</div>
        <div className="bottom">
          <div className={classnames('status', {
            errorColor: !successStatus,
            successColor: successStatus,
          })}>
            <TenxIcon className="circle" type="Circle"/>
            <div>{successStatus ? '运行中' : '异常'}</div>
          </div>
          <div onClick={() => this.toDetail('alarm')}>
            <Tooltip title="查看告警设置">
              <Icon
                type="notification"
                className={classnames('alarm', {
                  errorColor: !successStatus,
                })}
              />
            </Tooltip>
          </div>
        </div>
        <Modal
          title="重启操作" visible={this.state.restartModal}
          confirmLoading={this.state.restartFetching}
          onCancel={() => this.setState({ restartModal: false })}
          onOk={this.restart}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
            您是否确定重启该系统组件？
          </div>
        </Modal>
      </div>
    )
  }
}
