/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Access Method component
 *
 * v0.1 - 2017-7-3
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Row, Col, Input, Spin } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import './style/MountServiceList.less'
import VolumeBindIcon from '../../assets/img/appmanage/volumeBIndIcon.svg'
import { getVolumeBindInfo, searchStoreageBindInfo } from '../../actions/storage'

class MountServiceList extends Component {
  constructor(props) {
    super(props)
    this.renderServiceList = this.renderServiceList.bind(this)
    this.state = {

    }
  }

  componentWillMount() {
    const { getVolumeBindInfo, clusterID, query, volumeName } = this.props
    getVolumeBindInfo(clusterID, volumeName, query)
  }

  renderServiceList(mountserviceData){
    let value = undefined
    if (document.getElementById('search_service')) {
      value = document.getElementById('search_service').value
    }
    if (!mountserviceData.length && value) {
      return <div id='mount_service_list'>
        <div className='no_data'>未搜索到符合条件的服务</div>
      </div>
    }
    if(!mountserviceData.length){
      return <div id='mount_service_list'>
        <div className='no_data'>无绑定服务</div>
      </div>
    }
    return mountserviceData.map((item, index) => {
      return <Row key={`service${index}`} className='list_style'>
        <Col key={`serviceName${index}`} span="6" className='service_name'>
          <span className='img_box'>
            <img src={VolumeBindIcon} alt="" className='img_style'/>
          </span>
          <span className='text'>服务：{item.serviceName}</span>
        </Col>
        <Col key={`appName${index}`} span="6">
          所属应用：{item.appName}
        </Col>
        <Col key={`mountPoint${index}`} span="6" className='point_style'>
          挂载点：{item.mountPoint}
        </Col>
        <Col key={`readyOnly${index}`} span="6">
          { item.readOnly ? <span>服务对存储只读</span> : <span>服务对存储可读可写</span> }
        </Col>
      </Row>
    })
  }

  searchService(){
    const { searchStoreageBindInfo } = this.props
    const value = document.getElementById('search_service').value
    searchStoreageBindInfo(value)
  }

  render() {
    const { volumeBindInfo } = this.props
    const isFetching = volumeBindInfo.isFetching
    if(isFetching){
      return <div className="loadingBox">
        <Spin size="large"></Spin>
      </div>
    }
    const mountserviceData = volumeBindInfo.volumeBindInfo
    return(
	    <QueueAnim className='mount_service_list' type='right'>
	      <div id='mount_service_list' key='mount_service_list'>
          <div className='search_box'>
            <Input
              size="large"
              placeholder="按服务名称搜索"
              id='search_service'
              onPressEnter={() => this.searchService()}
            />
            <i className="fa fa-search search_icon" aria-hidden="true" onClick={() => this.searchService()}></i>
          </div>
          <div className='service_list'>
            { this.renderServiceList(mountserviceData) }
          </div>
	      </div>
	    </QueueAnim>
    )
  }
}

function mapStateToProp(state, props) {
  const { storage } = state
  const { volumeBindInfo } = storage
  let bindInfo = {
    isFetching: false,
    volumeBindInfo: [],
  }
  if(Object.keys(volumeBindInfo).length){
    bindInfo = volumeBindInfo
  }
  return {
    volumeBindInfo: bindInfo,
  }
}

export default connect(mapStateToProp, {
  getVolumeBindInfo,
  searchStoreageBindInfo,
})(MountServiceList)