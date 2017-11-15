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
import { browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { Row, Col, Icon, Dropdown, Menu, Card, Popover, Pagination } from 'antd'
import classNames from 'classnames'
import { getWrapStoreList, getWrapStoreHotList, offShelfWrap, getWrapGroupList } from '../../../actions/app_center'
import './style/index.less'
import CommonSearchInput from '../../CommonSearchInput'
import { formatDate } from '../../../common/tools'
import NotificationHandler from '../../../components/Notification'
import { API_URL_PREFIX } from '../../../constants'
import { ROLE_SYS_ADMIN } from '../../../../constants'

const sortOption = [
  {
    key: 'publish_time',
    text: '按照发布时间'
  },
  {
    key: 'download_times',
    text: '按照下载次数'
  },
  {
    key: 'file_nick_name',
    text: '按照名称'
  }
]
class AppWrapStore extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      current: 1,
      filterName: '',
      filterClassify: '',
      sort_by: 'publish_time'
    }
  }
  componentWillMount() {
    const { getWrapStoreHotList, getWrapGroupList } = this.props
    this.getStoreList()
    getWrapStoreHotList()
    getWrapGroupList()
  }
  getStoreList() {
    const { getWrapStoreList } = this.props
    const { current, filterName, sort_by, filterClassify } = this.state
    const query = {
      from: (current - 1) * 10,
      size: 10
    }
    if (filterName) {
      Object.assign(query, { file_name: filterName })
    }
    if (sort_by) {
      Object.assign(query, { sort_by, sort_order: 'desc' })
    }
    if (filterClassify) {
      Object.assign(query, { classify_id: filterClassify })
    }
    getWrapStoreList(query)
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
      filterClassify: value
    }, this.getStoreList)
  }
  updatePage(current) {
    this.setState({
      current
    }, this.getStoreList)
  }
  renderClassifyTab() {
    const { wrapGroupList } = this.props
    const { filterClassify } = this.state
    if (!wrapGroupList || !wrapGroupList.classifies || !wrapGroupList.classifies.length) return
    const allClassify = [{
      iD: "",
      classifyName: "全部"
    }]
    let newClassifies = allClassify.concat(wrapGroupList.classifies)
    return newClassifies.map(item => {
      return(
        <span 
          className={classNames('filterTab', {'active': item.iD === filterClassify})} 
          key={item.iD}
          onClick={() => this.filterClassify(item.iD)}
        >
          {item.classifyName}
        </span>
      ) 
    })
  }
  renderSortTab() {
    const { sort_by } = this.state
    return sortOption.map(item => {
      return(
        <span
          className={classNames('filterTab', { 'active': sort_by === item.key })}
          key={item.key}
          onClick={() => this.changeSort(item.key)}
        >
          {item.text}
        </span>
      )
    })
  }
  goDeploy(fileName) {
    browserHistory.push('/app_manage/deploy_wrap?from=wrapStore&fileName='+fileName)
  }
  updateAppStatus(pkgID) {
    const { offShelfWrap, getWrapStoreHotList } = this.props
    let notify = new NotificationHandler()
    notify.spin('操作中')
    offShelfWrap(pkgID, {
      success: {
        func: () => {
          notify.close()
          notify.success('操作成功')
          this.getStoreList()
          getWrapStoreHotList()
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notify.close()
          notify.error('操作失败')
        }
      }
    })
  }
  handleMenuClick(e, row) {
    switch(e.key) {
      case 'offShelf':
        this.updateAppStatus(row.id)
        break
      case 'vm':
        browserHistory.push(`/app_manage/vm_wrap/create?from=wrapStore&fileName=${row.fileName}`)
    }
  }
  handleButtonClick(item) {
    this.goDeploy(item.fileName)
  }
  renderWrapList(dataSorce, isHot) {
    const { role } = this.props
    if (!dataSorce || !dataSorce.pkgs || !dataSorce.pkgs.length) {
      return
    }
    return dataSorce && dataSorce.pkgs.map((item, index) => {
      const menu = (
        <Menu style={{ width: 90 }} onClick={e => this.handleMenuClick(e, item)}>
          <Menu.Item key="vm">
            传统部署
          </Menu.Item>
          <Menu.Item key="download"><a target="_blank" href={`${API_URL_PREFIX}/pkg/${item.id}`}>下载</a></Menu.Item>
          {
            role === ROLE_SYS_ADMIN &&
              <Menu.Item key="offShelf" disabled={[0, 1, 4].includes(item.publishStatus)}>下架</Menu.Item>
          }
        </Menu>
      );
      return (
        <Row key={item.id} className={classNames("wrapList", {"noBorder": isHot, 'hotWrapList': isHot, 'commonWrapList': !isHot})} type="flex" justify="space-around" align="middle">
          {
            isHot && <Col span={3}>{index !== 0 ? <span className={`hotOrder hotOrder${index + 1}`}>{index + 1}</span> : <i className="champion"/>}</Col>
          }
          <Col span={isHot ? 5 : 4}>
            <img className={classNames({"wrapIcon": !isHot, "hotWrapIcon": isHot})} 
              src={`${API_URL_PREFIX}/pkg/icon/${item.pkgIconID}`}
            />
          </Col>
          <Col span={isHot ? 7 : 10}>
            <Row className="wrapListMiddle">
              <Col className="appName" style={{ marginBottom: isHot ? 0 : 10 }}>{item.fileNickName}<span className="nickName hintColor"> ({item.fileName})</span></Col>
              {
                !isHot && <Col className="hintColor appDesc">{item.description}</Col>
              }
              {
                isHot &&
                <Col className="downloadBox">
                  <span className="hintColor"><Icon type="download" /> {item.downloadTimes}</span>
                </Col>
              }
            </Row>
          </Col>
          <Col span={isHot ? 9 : 10} style={{ textAlign: 'right' }}>
            <Dropdown.Button
              className="wrapPopBtn" 
              overlay={menu} 
              type="ghost"
              onClick={() => this.handleButtonClick(item)}
            >
              <span className="operateBtn"><Icon type="appstore-o" /> 容器部署</span>
            </Dropdown.Button>
            {
              !isHot &&
                <div className="downloadBox">
                  <span className="hintColor"><Icon type="download" /> {item.downloadTimes}</span>
                  <span className="hintColor"><Icon type="clock-circle-o" /> 发布于 {formatDate(item.publishTime)}</span>
                </div>
            }
          </Col>
        </Row>
      )
    })
  }
  render() {
    const { wrapStoreList, wrapStoreHotList} = this.props
    const { current } = this.state
    const pagination = {
      simple: true,
      current,
      pageSize: 10,
      total: wrapStoreList && wrapStoreList.total || 0,
      onChange: this.updatePage.bind(this)
    }
    return (
      <QueueAnim>
        <div key="appWrapStore" className="appWrapStore">
          <div className="wrapStoreHead">
            <div className="storeHeadText">应用包商店</div>
            <CommonSearchInput 
              placeholder="请输入应用包名称搜索"
              size="large"
              style={{ width: 280 }}
              onSearch={value => this.filterValue(value)}
            />
          </div>
          <div className="filterAndSortBox">
            <div className="filterClassify">
              <span>分类：</span>
              {this.renderClassifyTab()}
            </div>
            <div className="sortBox">
              <span>排序：</span>
              {this.renderSortTab()}
            </div>
            <div className="total">共 {wrapStoreList && wrapStoreList.total || 0} 条</div>
            <Pagination {...pagination}/>
          </div>
          <div className="wrapStoreBody">
            <div className="wrapListBox wrapStoreLeft">
              {this.renderWrapList(wrapStoreList, false)}
            </div>
            <div className="wrapListBox wrapStoreRight">
              <Card title="排行榜" bordered={false} className="hotWrapCard">
                {this.renderWrapList(wrapStoreHotList, true)}
              </Card>
            </div>
          </div>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state) {
  const { images, entities } = state
  const { loginUser } = entities
  const { role } = loginUser.info || { role: 0 }
  const { wrapStoreList, wrapStoreHotList, wrapGroupList } = images
  const { result: storeList } = wrapStoreList || { result: {}}
  const { data: storeData } = storeList || { data: [] }
  const { result: storeHotList } = wrapStoreHotList || { result: {} }
  const { data: storeHotData } = storeHotList || { data: [] }
  const { result: groupList } = wrapGroupList || { result: {} }
  const { data: groupData } = groupList || { data: [] }
  return {
    wrapStoreList: storeData,
    wrapStoreHotList: storeHotData,
    wrapGroupList: groupData,
    role
  }
}
export default connect(mapStateToProps, {
  getWrapStoreList,
  getWrapStoreHotList,
  getWrapGroupList,
  offShelfWrap
})(AppWrapStore)