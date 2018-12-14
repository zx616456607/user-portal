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
import Xterm from './Xterm'
import { updateVmTermData, updateVmTermLogData } from '../../actions/vmTerminalNLog'
import { getDeepValue } from '../../util/util'
import { getExploreName } from './funcs'

const TERM_TIPS_DISABLED = 'vm_term_tips_disabled'

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
    termMsg: this.consts.isConnecting,
    tipHasKnow: false,
  }
  onSizeChange = dockSize => {
    if (dockSize < DOCK_DEFAULT_HEADER_SIZE) return
    this.setState({ dockSize })
  }
  onCloseDock = () => {
    this.setState({
      dockVisible: false,
      dockContainer: '',
      dockName: '',
      tipHasKnow: false,
      termMsg: this.consts.isConnecting,
    })
    this.props.updateVmTermData({
      data: {},
    })
  }
  componentWillUnmount() { // [KK-1667]
    this.props.updateVmTermData({
      data: {},
    })
    this.props.updateVmTermLogData({
      show: false,
      data: {},
      tomcatList: [],
      selectTomcat: '',
    })
  }

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
          <span>传统环境终端不同于容器终端，操作是不可逆的，请谨慎操作！</span>
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
  toggleShowLog = () => this.props.updateVmTermLogData({
    show: !this.props.logShow,
  })
  renderHeader = () => {
    const { dockSize } = this.state
    return (
      <div className={'header'}>
        <div className="headerStatic">
          <div className="left">
            <div className="name">
              {this.props.termData.name}
            </div>
            <Button
              icon="file-text"
              onClick={this.toggleShowLog}
              size="small"
              type="primary">Tomcat 日志</Button>
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
  render() {
    const cols = 150
    const rows = getExploreName() === 'Firefox' ? 22 : 24
    const { dockSize } = this.state
    const {
      termData, logShow, logData, tomcatList, selectTomcat,
      updateVmTermLogData: _updateVmTermLogData, vmTermConfig,
    } = this.props
    const protocol = vmTermConfig.protocol === 'http' ? 'ws:' : 'wss:'
    const commonUrl = `${protocol}//${vmTermConfig.host}/api/${vmTermConfig.version}`
    const termUrl = `${commonUrl}/vms/exec?width=${cols}&height=${rows}&host=${termData.host}${encodeURIComponent(':22')}`
    const selectName = getDeepValue(tomcatList.filter(tom => tom.id + '' === selectTomcat), '0.name'.split('.'))
    const logPath = encodeURIComponent(`/${logData.user === 'root' ? 'root' : 'home/' + logData.user}/${selectName}/logs/catalina.out`)
    const logUrl = `${commonUrl}/vms/tail?width=${cols}&height=${rows}&host=${logData.host}${encodeURIComponent(':22')}&logPath=${logPath}`
    return (
      <div className="TerminalNLog">
        {
          logShow &&
          <Log
            toggleShow={this.toggleShowLog}
            data={logData}
            consts={this.consts}
            tomcatList={tomcatList}
            selectTomcat={selectTomcat}
            updateVmTermLogData={_updateVmTermLogData}
            url={logUrl}
          />
        }
        {
          termData.user &&
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
              <Xterm
                url={termUrl}
                consts={this.consts}
                setTermMsg={termMsg => this.setState({ termMsg })}
                user={termData.user}
                password={termData.password}
                cols={cols}
                rows={rows}
              />
            </div>
          </Dock>
        }
      </div>
    )
  }
}

const mapState = ({ vmTermNLog: { term, log }, entities }) => ({
  userName: getDeepValue(entities, 'loginUser.info.userName'.split('.')),
  termShow: term.show,
  termData: term.data,
  logShow: log.show,
  logData: log.data,
  tomcatList: log.tomcatList,
  selectTomcat: log.selectTomcat,
  vmTermConfig: getDeepValue(entities, 'loginUser.info.vmTermConfig'.split('.')),
})

export default connect(mapState, {
  updateVmTermLogData,
  updateVmTermData,
})(TerminalNLog)
