/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 *
 *
 * @author Songsz
 * @date 2018-12-12
 *
*/

import React from 'react'
import { Icon } from 'antd'

export default class FullScreenIcon extends React.PureComponent {
  state = {
    full: false,
  }
  fullScreen = () => {
    const i = document.getElementById(this.props.fullscreenId)
    // go full-screen
    if (i.requestFullscreen) {
      i.requestFullscreen()
    } else if (i.webkitRequestFullscreen) {
      i.webkitRequestFullscreen()
    } else if (i.mozRequestFullScreen) {
      i.mozRequestFullScreen()
    } else if (i.msRequestFullscreen) {
      i.msRequestFullscreen()
    }
    this.setState({ full: true })
    this.props.onToggleFullscreen(true)
  }
  exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    this.setState({ full: false })
    this.props.onToggleFullscreen(false)
  }
  render() {
    const { full } = this.state
    return (
      <Icon
        type={full ? 'shrink' : 'arrow-salt'}
        className={this.props.className}
        onClick={full ? this.exitFullscreen : this.fullScreen}
      />
    )
  }
}
