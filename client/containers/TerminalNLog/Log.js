/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * Log Component
 *
 * @author Songsz
 * @date 2018-12-12
 *
*/

import React from 'react'
import './style/Log.less'
import { Button, Select } from 'antd'
import FullscreenIcon from './FullScreenIcon'
import Xterm from './Xterm'

class Log extends React.PureComponent {

  state = {
    record: {},
    fullscreen: false,
  }
  componentDidMount() {
    this.setState({
      record: this.props.data,
    })
  }

  onTomcatChange = async selectTomcat => {
    const { updateVmTermLogData } = this.props
    await updateVmTermLogData({
      selectTomcat,
      data: {},
    })
    await updateVmTermLogData({
      data: this.state.record,
    })
  }
  render() {
    const height = this.state.fullscreen ? window.screen.height : this.props.height
    const {
      toggleShow, data, tomcatList, selectTomcat, url, browserRate } = this.props
    return (
      <div className="terminalNLog_Log" style={{ height }} id="VMWrapTermLog_log">
        <div className="header">
          <div id="terminalNLog_Log_Select">
            <Select
              size="small"
              value={selectTomcat ? selectTomcat + '' : undefined}
              placeholder="暂无 Tomcat 实例"
              onChange={this.onTomcatChange}
              getPopupContainer={() => document.getElementById('terminalNLog_Log_Select')}
              className="select_tomcat">
              {
                tomcatList.map(tom => (
                  <Select.Option value={tom.id + ''} key={tom.id}>{tom.name}</Select.Option>
                ))
              }
            </Select>
          </div>
          <div className="right">
            <Button size="small" icon="cross" onClick={toggleShow}/>
            <FullscreenIcon
              fullscreenId={'VMWrapTermLog_log'}
              className="fullscreen"
              onToggleFullscreen={fullscreen => this.setState({ fullscreen })}
            />
          </div>
        </div>
        {
          data.user && selectTomcat &&
          <Xterm
            url={url}
            consts={this.props.consts}
            setTermMsg={() => {}}
            user={data.user}
            password={data.password}
            rows={parseInt(height * browserRate)}
          />
        }
        {
          !selectTomcat &&
          <div className="noInstance">暂无 Tomcat 实例</div>
        }
      </div>
    )
  }
}

export default Log
