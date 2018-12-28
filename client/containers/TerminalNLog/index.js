/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * vm Term&Log Container
 *
 * @author Songsz
 * @date 2018-12-11
 *
*/

import React from 'react'
import './style/index.less'
import Dock from 'react-dock'
import { connect } from 'react-redux'
import Log from './Log'
import Xterm from './Xterm'
import { updateVmTermData, deleteVmTermData, updateVmTermLogData } from '../../actions/vmTerminalNLog'
import { getTomcatList } from '../../../src/actions/vm_wrap'
import { getDeepValue } from '../../util/util'
import { getExploreName } from './funcs'
import Header from './DockHeader'

export const DOCK_DEFAULT_SIZE = 370
export const DOCK_DEFAULT_HEADER_SIZE = 37

class TerminalNLog extends React.PureComponent {
  consts = {
    isConnecting: '终端连接中...',
    timeout: '连接超时',
    connectStop: '连接已断开',
  }
  state = {
    dockSize: DOCK_DEFAULT_SIZE,
    termMsg: {},
    tipHasKnow: false,
  }
  onSizeChange = dockSize => {
    // [KK-2035]
    if (dockSize < DOCK_DEFAULT_HEADER_SIZE || dockSize > document.getElementById('sider').clientHeight) return
    this.setState({ dockSize })
  }
  componentWillUnmount() { // [KK-1667]
    this.props.updateVmTermData({
      data: [],
      select: '',
    })
    this.props.updateVmTermLogData({
      show: false,
      data: {},
      tomcatList: [],
      selectTomcat: '',
    })
  }
  toggleShowLog = () => this.props.updateVmTermLogData({
    show: !this.props.logShow,
  })
  renderTerms = (commonUrl, cols, rows) => this.props.termData.map(t => {
    const termUrl = `${commonUrl}/vms/exec?width=${cols}&height=${rows}&host=${t.host}${encodeURIComponent(':22')}`
    return (
      <div
        key={t.vminfoId}
        style={{ display: this.props.selectTerm === t.vminfoId ? 'block' : 'none' }}>
        <Xterm
          url={termUrl}
          consts={this.consts}
          setTermMsg={termMsg => this.setState({
            termMsg: {
              ...this.state.termMsg,
              [t.vminfoId]: termMsg,
            },
          })}
          user={t.user}
          password={t.password}
          cols={cols}
          rows={rows}
        />
      </div>
    )
  })
  render() {
    const cols = 150
    const browserRate = getExploreName() === 'Firefox' ? 0.068 : 0.073
    const rows = parseInt((this.state.dockSize - DOCK_DEFAULT_HEADER_SIZE - 24) * browserRate)
    const { dockSize } = this.state
    const {
      termData, logShow, logData, tomcatList, selectTomcat,
      updateVmTermLogData: _updateVmTermLogData, vmTermConfig,
    } = this.props
    const protocol = vmTermConfig.protocol === 'http' ? 'ws:' : 'wss:'
    const commonUrl = `${protocol}//${vmTermConfig.host}/api/${vmTermConfig.version}`
    const selectName = getDeepValue(tomcatList.filter(tom => tom.id + '' === selectTomcat), '0.name'.split('.'))
    const logPath = encodeURIComponent(`/${logData.user === 'root' ? 'root' : 'home/' + logData.user}/${selectName}/logs/catalina.out`)
    const logUrl = `${commonUrl}/vms/tail?width=${cols}&height=${22}&host=${logData.host}${encodeURIComponent(':22')}&logPath=${logPath}`
    return (
      <div className="TerminalNLog">
        {
          logShow &&
          <Log
            browserRate={browserRate}
            toggleShow={this.toggleShowLog}
            data={logData}
            consts={this.consts}
            tomcatList={tomcatList}
            selectTomcat={selectTomcat}
            updateVmTermLogData={_updateVmTermLogData}
            url={logUrl}
            height={document.documentElement.clientHeight - dockSize}
          />
        }
        {
          termData.length > 0 &&
          <Dock
            fluid={false}
            size={dockSize}
            isVisible={true}
            position="bottom"
            dimMode="none"
            onSizeChange={this.onSizeChange}
          >
            <div className="container">
              <Header
                {...this.props}
                {...this.state}
                consts={this.consts}
                onSizeChange={this.onSizeChange}
                setPropsState={data => this.setState(data)}
              />
              <div className="placeholderHeader"/>
              {
                this.renderTerms(commonUrl, cols, rows)
              }
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
  selectTerm: term.select,
  logShow: log.show,
  logData: log.data,
  tomcatList: log.tomcatList,
  selectTomcat: log.selectTomcat,
  vmTermConfig: getDeepValue(entities, 'loginUser.info.vmTermConfig'.split('.')),
})

export default connect(mapState, {
  updateVmTermLogData,
  updateVmTermData,
  deleteVmTermData,
  getTomcatList,
})(TerminalNLog)
