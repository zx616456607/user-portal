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
import { Menu, Dropdown, Icon, Tooltip } from 'antd'
import './style/AlarmCard.less'
import TenxIcon from '@tenx-ui/icon/es/_old'
import Ellipsis from '@tenx-ui/ellipsis/lib'
import classnames from 'classnames'
import { browserHistory } from 'react-router'

export default class AlarmCard extends React.PureComponent {
  onDropdownMenuClick = ({ key }) => {
    if (key === 'restart') return
  }
  render() {
    const successStatus = parseInt(Math.random() * 100) % 2 === 1
    const { cluster: { clusterID } } = this.props
    return (
      <div
        className="clusterSysServiceManageAlarmCard"
        onClick={() => browserHistory.push(`/cluster/sysServiceManageDetail?clusterID=${clusterID}`)}
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
        <div className="name"><Ellipsis>XXXXXXXXXXSDFSDFDSFSFS服务</Ellipsis></div>
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
      </div>
    )
  }
}
