/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 *
 *
 * @author Songsz
 * @date 2018-12-11
 *
*/

import React from 'react'
import './style/index.less'
import Dock from 'react-dock'
import { Icon, Button } from 'antd'
import { connect } from 'react-redux'
import Log from './Log'

const TERM_TIPS_DISABLED = 'term_tips_disabled'

export const DOCK_DEFAULT_SIZE = 370
export const DOCK_DEFAULT_HEADER_SIZE = 32

class TerminalNLog extends React.PureComponent {
  consts = {
    isConnecting: '终端连接中...',
    timeout: '连接超时',
    connectStop: '连接已断开',
  }
  state = {
    dockSize: DOCK_DEFAULT_SIZE,
    dockName: '这是名字',
    showSocket: false,
    connected: false,
    termMsg: this.consts.isConnecting,
    tipHasKnow: false,
    showLog: false,
  }
  onSizeChange = dockSize => {
    if (dockSize < DOCK_DEFAULT_HEADER_SIZE) return
    this.setState({ dockSize })
  }
  onCloseDock = () => this.setState({
    dockVisible: false,
    dockContainer: '',
    dockName: '',
    tipHasKnow: false,
  })
  onNeverRemindClick = () => {
    const { userName } = this.props
    const noTipList = JSON.parse(window.localStorage.getItem(TERM_TIPS_DISABLED) || '{}')
    noTipList[userName] = true
    window.localStorage.setItem(TERM_TIPS_DISABLED, JSON.stringify(noTipList))
    this.setState({ tipHasKnow: true })
  }
  renderWarning = () => {
    const { userName } = this.props
    const { tipHasKnow } = this.state
    const noTipList = JSON.parse(window.localStorage.getItem(TERM_TIPS_DISABLED) || '{}')
    if (noTipList[userName] || tipHasKnow) return null
    return (
      <span className="warningTip">
        <span>
          <span>由于Pod本身无状态且不可变的特性，以防Pod销毁后，对Pod内部做的改动无法保留，</span>
          <span className="notModify">建议不要直接修改Pod中内容（有状态的Pod中存储映射出来的目录除外）</span>
        </span>
        <span>
          <Button
            onClick={() => this.setState({ tipHasKnow: true })}
            className="hasKnow"
            size="small"
            type="primary">知道了</Button>
          <Button onClick={this.onNeverRemindClick} size="small">不再提醒</Button>
        </span>
      </span>
    )
  }
  renderMsg = () => {
    const { termMsg } = this.state
    if (termMsg) {
      return (
        <span className="termMsg">
          <div className="webLoadingBox">
            {
              termMsg === this.consts.isConnecting &&
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
  toggleShowLog = () => this.setState({ showLog: !this.state.showLog })
  renderHeader = () => {
    const { dockSize, dockName } = this.state
    return (
      <div className={'header'}>
        <div className="headerStatic">
          <div className="left">
            <div className="name">
              {dockName}
            </div>
            <Button
              icon='file-text'
              onClick={this.toggleShowLog}
              size="small"
              type="primary">日志</Button>
          </div>
          <span className="right">
            {
              dockSize > DOCK_DEFAULT_HEADER_SIZE + 8 &&
              <Icon type="minus" className="icon" onClick={() => this.onSizeChange(DOCK_DEFAULT_HEADER_SIZE)}/>
            }
            {
              dockSize <= DOCK_DEFAULT_HEADER_SIZE + 8 &&
              <Icon type="plus" className="icon" onClick={() => this.onSizeChange(DOCK_DEFAULT_SIZE)}/>
            }
            <Icon type="cross" className="icon" onClick={this.onCloseDock}/>
          </span>
        </div>
        { this.renderWarning() }
        { this.renderMsg() }
      </div>
    )
  }
  render() {
    const { dockSize, showLog } = this.state
    return (
      <div className="TerminalNLog">
        {
          showLog &&
          <Log
            toggleShow={this.toggleShowLog}
          />
        }
        <Dock
          fluid={false}
          size={dockSize}
          isVisible={true}
          position="bottom"
          dimMode="none"
          onSizeChange={this.onSizeChange}
        >
          <div className="container">
            { this.renderHeader() }
            <div className="placeholderHeader"/>
            <span>
              终端哦哦
            </span>
          </div>
        </Dock>
      </div>
    )
  }
}

const mapState = ({ state }) => ({
  userName: 'ssz',
})

export default connect(mapState)(TerminalNLog)
