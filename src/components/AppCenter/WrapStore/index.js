/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App Wrap Store
 *
 * v0.1 - 2017-11-08
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Tabs } from 'antd'
import cloneDeep from 'lodash/cloneDeep'
import { getWrapStoreList, getWrapStoreHotList, getWrapGroupList } from '../../../actions/app_center'
import { getAppsList, getAppsHotList } from '../../../actions/app_store'
import './style/index.less'
import { camelize } from 'humps'
import { ROLE_SYS_ADMIN } from '../../../../constants'
import StoreTemplate from './StoreTemplate'
import CommonSearchInput from '../../CommonSearchInput'
import classNames from 'classnames'
import Title from '../../Title'
import NotificationHandler from '../../../components/Notification'

const TabPane = Tabs.TabPane;
const notify = new NotificationHandler()

class AppWrapStore extends React.Component {
  constructor(props) {
    super(props)
    this.changeTab = this.changeTab.bind(this)
    this.getStoreList = this.getStoreList.bind(this)
    this.updateParentState = this.updateParentState.bind(this)
    this.state = {
      current: 1,
      filterName: '',
      classify: '',
      sort_by: 'publish_time',
      activeKey: 'image'
    }
  }
  componentWillMount() {
    const { getWrapGroupList, getAppsHotList, cluster } = this.props
    getWrapGroupList()
    this.getStoreList()
    getAppsHotList(cluster.clusterID, {
      failed: {
        func: () => {}
      }
    })
  }
  changeTab(activeKey){
    const { getAppsHotList } = this.props
    this.setState({
      current: 1,
      filterName: '',
      classify: '',
      sort_by: 'publish_time',
      activeKey
    }, this.getStoreList)
    if (activeKey === 'app') {
      this.resetDownloadCount()
      return
    }
    const clusterID = this.props.cluster.clusterID
    getAppsHotList(clusterID, {
      failed: {
        func: () => {}
      }
    })
  }
  getStoreList() {
    const { getWrapStoreList, getAppsList, cluster } = this.props
    const { current, filterName, sort_by, classify, activeKey } = this.state
    let query = {
      from: (current - 1) * 12,
      size: 12,
      filter: "target_cluster," + (!!cluster ? cluster.clusterID : ""),
    }
    if (activeKey === 'image') {
      const { filter } = query
      const newFilter = filter + ',type,2,publish_status,2'
      Object.assign(query, { filter: newFilter })
    }
    if (filterName) {
      if (activeKey === 'app') {
        Object.assign(query, { file_name: filterName })
      } else {
        const { filter } = query
        let newFilter = filter + `,file_nick_name,${filterName}`
        Object.assign(query, { filter: newFilter })
      }
    }
    if (sort_by) {
      if (activeKey === 'app') {
        Object.assign(query, { sort_by, sort_order: sort_by !== 'file_nick_name' ? 'desc' : 'asc' })
      } else {
        Object.assign(query, { [sort_by]: sort_by !== 'app_name' ? 'd' : 'a' })
      }
    }
    if (classify) {
      if (activeKey === 'app') {
        Object.assign(query, { classify_id: classify })
      } else {
        const { filter } = query
        let newFilter = filter + `,classify_id,${classify}`
        Object.assign(query, { filter: newFilter })
      }
    }
    if (activeKey === 'app') {
      getWrapStoreList(query)
      return
    }
    getAppsList(query, {
      failed: {
        func: err => {
          if (err.is_public === false) {
            notify.warn('请联系管理员检查商店对应仓库组是否存在或已开放！')
          }
        }
      }
    })
  }
  updateParentState(key, value, callback) {
    const { activeKey } = this.state
    this.setState({
      [key]: value
    }, callback && this.getStoreList)
    if (activeKey === 'image') {
      return
    }
    this.resetDownloadCount()
  }
  downloadCount = (id) => {
    const { downloadCount } = this.state
    let newCount = cloneDeep(downloadCount)
    newCount = Object.assign({}, newCount, {
      [`${id}-count`]: (newCount[`${id}-count`] ? newCount[`${id}-count`] : 0) + 1
    })
    this.setState({
      downloadCount: newCount
    })
  }
  resetDownloadCount = () => {
    const { getWrapStoreHotList } = this.props
    this.setState({
      downloadCount: {}
    })
    getWrapStoreHotList()
  }
  render() {
    const {
      wrapGroupList, wrapStoreList, wrapStoreHotList,
      imageStoreList, imageHotList, wrapStoreFetching,
      wrapHotFetching, imageStoreFetching, imageHotFetching,
      loginUser, location
    } = this.props
    const { activeKey, current, classify, sort_by, rectStyle, downloadCount } = this.state
    const isUPAdmin = loginUser.role === ROLE_SYS_ADMIN
    const isAdmin = loginUser.harbor[camelize('has_admin_role')] === 1 && isUPAdmin
    const imageComposeStyle = classNames({
      'tabs_item_style': true,
      'tabs_item_selected_style': activeKey === "image"
    })
    const appComposeStyle = classNames({
      'tabs_item_style': true,
      'tabs_item_selected_style': activeKey === "app"
    })
    return (
      <QueueAnim>
        <Title title="应用商店"/>
        <div key="appWrapStore" className="appWrapStore">
          <ul className='tabs_header_style'>
            <li className={imageComposeStyle}
                onClick={this.changeTab.bind(this, "image")}
            >
              镜像商店
            </li>
            <li className={appComposeStyle}
                onClick={this.changeTab.bind(this, "app")}
            >
              应用包商店
            </li>
            <CommonSearchInput
              placeholder={activeKey === 'app' ? "请输入应用包名称搜索" : "请输入镜像名称或发布名称搜索"}
              size="large"
              style={{ width: 280, float: 'right' }}
              onSearch={value => this.updateParentState('filterName', value, true)}
            />
          </ul>
          {
            activeKey === "image" ?
              <StoreTemplate
                location={location}
                isAdmin={isAdmin}
                activeKey={activeKey}
                current={current}
                classify={classify}
                sort_by={sort_by}
                rectStyle={rectStyle}
                wrapGroupList={wrapGroupList}
                dataSource={imageStoreList}
                dataFetching={imageStoreFetching}
                dataHotList={imageHotList}
                dataHotFetching={imageHotFetching}
                getStoreList={this.getStoreList}
                updateParentState={this.updateParentState}
              />
              : null
          }
          {
            activeKey === "app" ?
              <StoreTemplate
                location={location}
                isUPAdmin={isUPAdmin}
                activeKey={activeKey}
                current={current}
                classify={classify}
                sort_by={sort_by}
                rectStyle={rectStyle}
                downloadCount={downloadCount}
                wrapGroupList={wrapGroupList}
                dataSource={wrapStoreList}
                dataFetching={wrapStoreFetching}
                dataHotList={wrapStoreHotList}
                dataHotFetching={wrapHotFetching}
                getStoreList={this.getStoreList}
                updateParentState={this.updateParentState}
                updateDownloadCount={this.downloadCount}
              />
              : null
          }
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state) {
  const { images, entities, appStore } = state
  const { loginUser } = entities
  const { wrapStoreList, wrapStoreHotList, wrapGroupList } = images
  const { result: storeList, isFetching: wrapStoreFetching } = wrapStoreList || { result: {}, isFetching: false }
  const { data: storeData } = storeList || { data: [] }
  const { result: storeHotList, isFetching: wrapHotFetching } = wrapStoreHotList || { result: {}, isFetching: false }
  const { data: storeHotData } = storeHotList || { data: [] }
  const { result: groupList } = wrapGroupList || { result: {} }
  const { data: groupData } = groupList || { data: [] }
  const { imagePublishRecord, imageHotRecord } = appStore
  const { data: imageStoreList, isFetching: imageStoreFetching } = imagePublishRecord || { data: {}, isFetching: false }
  const { data: imageHotList, isFetching: imageHotFetching } = imageHotRecord || { data: {}, isFetching: false }

  const { cluster } = entities.current
  return {
    loginUser: loginUser.info,
    wrapStoreList: storeData,
    wrapStoreFetching,
    wrapStoreHotList: storeHotData,
    wrapHotFetching,
    wrapGroupList: groupData,
    imageStoreList,
    imageStoreFetching,
    imageHotList,
    imageHotFetching,
    cluster,
  }
}
export default connect(mapStateToProps, {
  getWrapStoreList,
  getWrapStoreHotList,
  getWrapGroupList,
  getAppsList,
  getAppsHotList
})(AppWrapStore)
