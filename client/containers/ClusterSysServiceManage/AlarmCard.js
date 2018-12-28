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
import Ellipsis from '@tenx-ui/ellipsis/lib'
import classnames from 'classnames'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { quickRestartServices } from '../../actions/sysServiceManage'
import { getDeepValue } from '../../util/util'
import NotificationHandler from '../../../src/components/Notification'

@connect(null, { quickRestartServices })
export default class AlarmCard extends React.PureComponent {
  state = {
    restartModal: false,
    restartFetching: false,
  }
  onDropdownMenuClick = ({ key }) => {
    const { cluster: { clusterID } } = this.props
    if (key === 'restart') return this.setState({ restartModal: true })
    if (key === 'log') return this.toDetail(clusterID, 'log')
    if (key === 'monitor') return this.toDetail(clusterID, 'monitor')
    if (key === 'alarm') return this.toDetail(clusterID, 'alarm')
  }
  restart = async () => {
    this.setState({ restartFetching: true })
    const { cluster: { clusterID }, quickRestartServices: _quickRestartServices } = this.props
    const res = await _quickRestartServices(clusterID, [ 'metrics-server' ])
    this.setState({ restartFetching: false })
    if (getDeepValue(res, 'response.result.data.status'.split('.')) === 'Success') {
      this.setState({ restartModal: false })
      const notification = new NotificationHandler()
      notification.success('重启成功')
    }
  }

  toDetail = (clusterID, active) => {
    const activeTab = active ? `&active=${active}` : ''
    browserHistory.push(`/cluster/sysServiceManageDetail?clusterID=${clusterID}${activeTab}`)
  }
  render() {
    const successStatus = parseInt(Math.random() * 100) % 2 === 1
    const { cluster: { clusterID }, data } = this.props
    return (
      <div
        className="clusterSysServiceManageAlarmCard"
        onClick={() => this.toDetail(clusterID)}
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
        <div className="name"><Ellipsis>{data.name}</Ellipsis></div>
        <div className="desc"><Ellipsis>K8s 自身数据存储</Ellipsis></div>
        <div className="bottom">
          <div className={classnames('status', {
            errorColor: !successStatus,
            successColor: successStatus,
          })}>
            <TenxIcon className="circle" type="Circle"/>
            <div>运行中</div>
          </div>
          <div onClick={e => e.stopPropagation()}>
            <Tooltip title={successStatus ? '' : '可在告警记录中查看'}>
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
