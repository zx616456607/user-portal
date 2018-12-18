/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * Term header container
 *
 * @author Songsz
 * @date 2018-12-18
 *
*/

import React from 'react'
import classnames from 'classnames'
import { Button, Icon } from 'antd'
import { DOCK_DEFAULT_HEADER_SIZE, DOCK_DEFAULT_SIZE } from './index'
import { getDeepValue } from '../../util/util'

const TERM_TIPS_DISABLED = 'vm_term_tips_disabled'

export default class DockHeader extends React.PureComponent {
  toggleShowLog = async record => {
    const { updateVmTermLogData, selectTerm, logShow, getTomcatList, updateVmTermData } = this.props
    updateVmTermLogData({
      show: true,
    })
    if (logShow && selectTerm === record.vminfoId) return
    updateVmTermData({ select: record.vminfoId })
    updateVmTermLogData({
      tomcatList: [],
      data: record,
    })
    const res = await getTomcatList({
      vminfo_id: record.vminfoId,
      page: 1,
      size: 9999,
    })
    if (res.error) return
    const tomcatList = getDeepValue(res, 'response.result.results'.split('.')) || []
    updateVmTermLogData({
      tomcatList,
      selectTomcat: tomcatList.length ? tomcatList[0].id + '' : '',
    })
  }
  onSizeChange = dockSize =>
    dockSize >= DOCK_DEFAULT_HEADER_SIZE && this.props.setPropsState({ dockSize })
  onCloseDock = () => {
    this.props.setPropsState({
      dockVisible: false,
      dockContainer: '',
      dockName: '',
      tipHasKnow: false,
      termMsg: this.props.consts.isConnecting,
    })
    this.props.updateVmTermData({
      data: [],
      select: '',
    })
  }
  onNeverRemindClick = () => {
    const { userName } = this.props
    const noTipList = JSON.parse(window.localStorage.getItem(TERM_TIPS_DISABLED) || '{}')
    noTipList[userName] = true
    window.localStorage.setItem(TERM_TIPS_DISABLED, JSON.stringify(noTipList))
    this.props.setPropsState({ tipHasKnow: true })
  }
  renderWarning = () => {
    const { userName } = this.props
    const { tipHasKnow } = this.props
    const noTipList = JSON.parse(window.localStorage.getItem(TERM_TIPS_DISABLED) || '{}')
    if (noTipList[userName] || tipHasKnow) return null
    return (
      <span className="warningTip">
        <span>
          <span>传统环境终端不同于容器终端，操作是不可逆的，请谨慎操作！</span>
        </span>
        <span>
          <Button
            onClick={() => this.props.setPropsState({ tipHasKnow: true })}
            className="hasKnow"
            size="small"
            type="primary">知道了</Button>
          <Button onClick={this.onNeverRemindClick} size="small">不再提醒</Button>
        </span>
      </span>
    )
  }
  renderMsg = () => {
    const { termMsg } = this.props
    if (termMsg) {
      return (
        <span className="termMsg">
          <div className="webLoadingBox">
            {
              termMsg === this.props.consts.isConnecting &&
              [
                <span className="terIcon" key="point1"/>,
                <span className="terIcon" key="point2"/>,
                <span className="terIcon" key="point3"/>,
              ]
            }
            <span>{termMsg}</span>
          </div>
        </span>
      )
    }
    return null
  }
  renderHeaderNames = () => this.props.termData.map(t => (
    <div
      key={t.vminfoId}
      className={classnames({
        oneTermName: true,
        oneTermSelect: t.vminfoId === this.props.selectTerm,
      })}
    >
      <div className="name" onClick={() => this.props.updateVmTermData({ select: t.vminfoId })}>
        { t.name }
      </div>
      <Button icon="file-text" onClick={() => this.toggleShowLog(t)} size="small" type="primary">Tomcat 日志</Button>
      <Button
        icon="cross"
        type="dashed"
        size="small"
        className="close"
        onClick={() => this.props.deleteVmTermData(t.vminfoId)}
      />
    </div>
  ))
  render() {
    const { dockSize } = this.props
    return (
      <div className={'header'}>
        <div className="headerStatic">
          <div className="left">
            { this.renderHeaderNames() }
          </div>
          <span className="right">
            {
              dockSize > DOCK_DEFAULT_HEADER_SIZE + 8 &&
              <Icon type="minus" className="icon" onClick={() => this.onSizeChange(DOCK_DEFAULT_HEADER_SIZE)}/>
            }
            {
              dockSize <= DOCK_DEFAULT_HEADER_SIZE + 8 &&
              <svg onClick={() => this.onSizeChange(DOCK_DEFAULT_SIZE)} className="maxWindow">
                <use xlinkHref={'#maxwindow'} />
              </svg>
            }
            <Icon type="cross" className="icon" onClick={this.onCloseDock}/>
          </span>
        </div>
        { this.renderWarning() }
        { this.renderMsg() }
      </div>
    )
  }
}
