/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Storage Home component
 *
 * v0.1 - 2017-9-8
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import {  } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import './style/index.less'
import classNames from 'classnames'
import { browserHistory } from 'react-router'
import Title from '../Title'

class StorageHome extends Component {
  constructor(props) {
    super(props)
    this.loadSelectedClass = this.loadSelectedClass.bind(this)
    this.state = {
      sharedMemorySelected: false,
      exclusiveMemorySelected: true,
      hostMemorySelected: false,
    }
  }

  loadSelectedClass(pathname){
    if(pathname === "/app_manage/storage"){
      this.setState({
        sharedMemorySelected: false,
        exclusiveMemorySelected: true,
        hostMemorySelected: false,
      })
      return
    }
    if(pathname === "/app_manage/storage/shared"){
      this.setState({
        sharedMemorySelected: true,
        exclusiveMemorySelected: false,
        hostMemorySelected: false,
      })
      return
    }
    if(pathname === "/app_manage/storage/host"){
      this.setState({
        sharedMemorySelected: false,
        exclusiveMemorySelected: false,
        hostMemorySelected: true,
      })
      return
    }
    this.setState({
      sharedMemorySelected: false,
      exclusiveMemorySelected: true,
      hostMemorySelected: false,
    })
  }

  componentWillMount() {
    const { location } = this.props
    this.loadSelectedClass(location.pathname)
  }

  componentWillReceiveProps(nextProps) {
    const { location } = nextProps
    if(this.props.location.pathname === location.pathname){
      return
    }
    this.loadSelectedClass(location.pathname)
  }

  render() {
    const { children } = this.props
    const { sharedMemorySelected, exclusiveMemorySelected, hostMemorySelected } = this.state
    const sharedMemory = classNames({
      'tabs_item_style': true,
      'tabs_item_selected_style': sharedMemorySelected
    })
    const exclusiveMemory = classNames({
      'tabs_item_style': true,
      'tabs_item_selected_style': exclusiveMemorySelected
    })
    const hostMemory = classNames({
      'tabs_item_style': true,
      'tabs_item_selected_style': hostMemorySelected
    })
    return(
      <QueueAnim className='storage_home'>
        <Title title="存储"/>
        <div id='storage_home' key="storage_home">
          <div className='tabs_header_style'>
            <div
              className={exclusiveMemory}
              onClick={() => browserHistory.push(`/app_manage/storage`)}
            >
              独享型存储
            </div>
            <div
              className={sharedMemory}
              onClick={() => browserHistory.push(`/app_manage/storage/shared`)}
            >
              共享型存储
            </div>
            <div
              className={hostMemory}
              onClick={() => browserHistory.push(`/app_manage/storage/host`)}
            >
              本地存储
            </div>
          </div>
          <div className="children_box">
            { children }
          </div>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProp(state, props) {

  return {

  }
}

export default connect(mapStateToProp, {

})(StorageHome)