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
import { injectIntl } from 'react-intl'
import StorageDetailIntl from './StorageDetailIntl'

class MountServiceList extends Component {
  constructor(props) {
    super(props)
    this.renderServiceList = this.renderServiceList.bind(this)
    this.state = {
      changeValue: undefined,
      searchValue: undefined,
    }
  }

  componentWillMount() {
    const { getVolumeBindInfo, clusterID, query, volumeName } = this.props
    getVolumeBindInfo(clusterID, volumeName, query)
  }

  renderServiceList(mountserviceData){
    const { formatMessage } = this.props.intl
    const { searchValue } = this.state
    if (!mountserviceData.length && searchValue) {
      return <div id='mount_service_list'>
        <div className='no_data'>{formatMessage(StorageDetailIntl.notSearchView)}</div>
      </div>
    }
    if(!mountserviceData.length){
      return <div id='mount_service_list'>
        <div className='no_data'>{formatMessage(StorageDetailIntl.notBind)}</div>
      </div>
    }
    return mountserviceData.map((item, index) => {
      return <Row key={`service${index}`} className='list_style'>
        <Col key={`serviceName${index}`} span="6" className='service_name'>
          <span className='img_box'>
            <img src={VolumeBindIcon} alt="" className='img_style'/>
          </span>
          <span className='text'>{formatMessage(StorageDetailIntl.service)}：{item.serviceName}</span>
        </Col>
        <Col key={`appName${index}`} span="6">
          {formatMessage(StorageDetailIntl.inApp)}：{item.appName}
        </Col>
        <Col key={`mountPoint${index}`} span="6" className='point_style'>
          {formatMessage(StorageDetailIntl.forIn)}：{item.mountPoint}
        </Col>
        <Col key={`readyOnly${index}`} span="6">
          { item.readOnly ? <span>{formatMessage(StorageDetailIntl.serviceStorageOnly)}</span> : <span>{formatMessage(StorageDetailIntl.serviceStoragefull)}</span> }
        </Col>
      </Row>
    })
  }

  searchService(){
    const { searchStoreageBindInfo } = this.props
    const { changeValue } = this.state
    this.setState({
      searchValue: changeValue
    }, () => {
      const { searchValue } = this.state
      searchStoreageBindInfo(searchValue)
    })
  }

  searchInputChange(e) {
    const changeValue = e.target.value.trim()
    this.setState({
      changeValue,
    })
  }

  render() {
    const { volumeBindInfo } = this.props
    const { formatMessage } = this.props.intl
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
              placeholder={formatMessage(StorageDetailIntl.inputServiceName)}
              id='search_service'
              onPressEnter={() => this.searchService()}
              onChange={e => this.searchInputChange(e)}
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
})(injectIntl(MountServiceList,{withRef: true}))