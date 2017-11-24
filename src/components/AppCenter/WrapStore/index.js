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
import { getWrapStoreList, getWrapGroupList } from '../../../actions/app_center'
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
    this.changeSort = this.changeSort.bind(this)
    this.filterClassify = this.filterClassify.bind(this)
    this.updatePage = this.updatePage.bind(this)
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
    this.setState({
      current: 1,
      filterName: '',
      classify: '',
      sort_by: 'publish_time',
      activeKey
    }, this.getStoreList)
  }
  getStoreList() {
    const { getWrapStoreList, getAppsList } = this.props
    const { current, filterName, sort_by, classify, activeKey } = this.state
    let query = {
      from: (current - 1) * 10,
      size: 10
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
  changeSort(sort) {
    const { sort_by } = this.state
    if (sort_by === sort) return
    this.setState({
      sort_by: sort,
    },  this.getStoreList)
  }
  filterValue(value) {
    this.setState({
      filterName: value
    }, this.getStoreList)
  }
  filterClassify(value) {
    this.setState({
      classify: value
    }, this.getStoreList)
  }
  updatePage(current) {
    this.setState({
      current
    }, this.getStoreList)
  }
  
  render() {
    const { wrapGroupList, wrapStoreList, wrapStoreHotList, role, imageStoreList, imageHotList } = this.props
    const { activeKey, current, classify, sort_by } = this.state
    return (
      <QueueAnim>
        <div key="appWrapStore" className="appWrapStore">
          <div className="wrapStoreHead">
            <div className="storeHeadText">商店</div>
            <CommonSearchInput 
              placeholder={activeKey === 'app' ? "请输入应用包名称搜索" : "请输入镜像名称搜索"}
              size="large"
              style={{ width: 280 }}
              onSearch={value => this.filterValue(value)}
            />
          </div>
          <Tabs className="storeTabs" activeKey={activeKey} onChange={this.changeTab}>
            <TabPane tab="镜像商店" key="image">
              <StoreTemplate
                activeKey={activeKey}
                current={current}
                classify={classify}
                sort_by={sort_by}
                wrapGroupList={wrapGroupList}
                dataSource={imageStoreList}
                dataHotList={imageHotList}
                role={role}
                getStoreList={this.getStoreList}
                changeSort={this.changeSort}
                filterClassify={this.filterClassify}
                updatePage={this.updatePage}
              />
            </TabPane>
            <TabPane tab="应用包商店" key="app">
              <StoreTemplate
                activeKey={activeKey}
                current={current}
                classify={classify}
                sort_by={sort_by}
                wrapGroupList={wrapGroupList}
                dataSource={wrapStoreList}
                dataHotList={wrapStoreHotList}
                role={role}
                getStoreList={this.getStoreList}
                changeSort={this.changeSort}
                filterClassify={this.filterClassify}
                updatePage={this.updatePage}
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
  const { result: storeList } = wrapStoreList || { result: {}}
  const { data: storeData } = storeList || { data: [] }
  const { result: storeHotList } = wrapStoreHotList || { result: {} }
  const { data: storeHotData } = storeHotList || { data: [] }
  const { result: groupList } = wrapGroupList || { result: {} }
  const { data: groupData } = groupList || { data: [] }
  const { imagePublishRecord, imageHotRecord } = appStore
  const { data: imageStoreList } = imagePublishRecord || { data: {} }
  const { data: imageHotList } = imageHotRecord || { data: {} }
  return {
    wrapStoreList: storeData,
    wrapStoreHotList: storeHotData,
    wrapGroupList: groupData,
    imageStoreList,
    imageHotList,
    role
  }
}
export default connect(mapStateToProps, {
  getWrapStoreList,
  getWrapGroupList,
  getAppsList,
  getAppsHotList
})(AppWrapStore)