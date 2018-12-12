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
import { Button } from 'antd'
import FullscreenIcon from './FullScreenIcon'

class Log extends React.PureComponent {
  render() {
    const { height = '50vh', toggleShow } = this.props

    return (
      <div className="terminalNLog_Log" style={{ height }} id="VMWrapTermLog_log">
        <div className="header">
          <div/>
          <div className="right">
            <Button size="small" icon="cross" type="dashed" onClick={toggleShow}/>
            <FullscreenIcon fullscreenId={'VMWrapTermLog_log'} className="fullscreen"/>
          </div>
        </div>
      </div>
    )
  }
}

export default Log
