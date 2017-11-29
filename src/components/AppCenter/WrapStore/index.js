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
import { getWrapStoreList, getWrapStoreHotList, getWrapGroupList } from '../../../actions/app_center'
import { getAppsList, getAppsHotList } from '../../../actions/app_store'
import './style/index.less'
import StoreTemplate from './StoreTemplate'
import CommonSearchInput from '../../CommonSearchInput'
const TabPane = Tabs.TabPane;

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
    const { getWrapGroupList } = this.props
    getWrapGroupList()
    this.getStoreList()
  }
  changeTab(activeKey){
    const { getAppsHotList, getWrapStoreHotList } = this.props
    this.setState({
      current: 1,
      filterName: '',
      classify: '',
      sort_by: 'publish_time',
      activeKey
    }, this.getStoreList)
    getAppsHotList()
    getWrapStoreHotList()
  }
  getStoreList() {
    const { getWrapStoreList, getAppsList } = this.props
    const { current, filterName, sort_by, classify, activeKey } = this.state
    let query = {
      from: (current - 1) * 12,
      size: 12
    }
    if (activeKey === 'image') {
      Object.assign(query, { filter: 'type,2,publish_status,2' })
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
        Object.assign(query, { sort_by, sort_order: 'desc' })
      } else {
        Object.assign(query, { [sort_by]: 'd' })
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
    getAppsList(query)
  }
  updateParentState(key, value, callback) {
    this.setState({
      [key]: value
    }, callback && this.getStoreList)
  }
  
  render() {
    const { 
      wrapGroupList, wrapStoreList, wrapStoreHotList, 
      role, imageStoreList, imageHotList, wrapStoreFetching,
      wrapHotFetching, imageStoreFetching, imageHotFetching
    } = this.props
    const { activeKey, current, classify, sort_by, rectStyle } = this.state
    return (
      <QueueAnim>
        <div key="appWrapStore" className="appWrapStore">
          <div className="wrapStoreHead">
            <div className="storeHeadText">应用商店</div>
            <CommonSearchInput 
              placeholder={activeKey === 'app' ? "请输入应用包名称搜索" : "请输入镜像名称或发布名称搜索"}
              size="large"
              style={{ width: 280 }}
              onSearch={value => this.updateParentState('filterName', value, true)}
            />
          </div>
          <Tabs className="storeTabs" activeKey={activeKey} onChange={this.changeTab}>
            <TabPane tab="镜像商店" key="image">
              <StoreTemplate
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
                role={role}
                getStoreList={this.getStoreList}
                updateParentState={this.updateParentState}
              />
            </TabPane>
            <TabPane tab="应用包商店" key="app">
              <StoreTemplate
                activeKey={activeKey}
                current={current}
                classify={classify}
                sort_by={sort_by}
                rectStyle={rectStyle}
                wrapGroupList={wrapGroupList}
                dataSource={wrapStoreList}
                dataFetching={wrapStoreFetching}
                dataHotList={wrapStoreHotList}
                dataHotFetching={wrapHotFetching}
                role={role}
                getStoreList={this.getStoreList}
                updateParentState={this.updateParentState}
              />
            </TabPane>
          </Tabs>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state) {
  const { images, entities, appStore } = state
  const { loginUser } = entities
  const { role } = loginUser.info || { role: 0 }
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
  return {
    wrapStoreList: storeData,
    wrapStoreFetching,
    wrapStoreHotList: storeHotData,
    wrapHotFetching,
    wrapGroupList: groupData,
    imageStoreList,
    imageStoreFetching,
    imageHotList,
    imageHotFetching,
    role
  }
}
export default connect(mapStateToProps, {
  getWrapStoreList,
  getWrapStoreHotList,
  getWrapGroupList,
  getAppsList,
  getAppsHotList
})(AppWrapStore)