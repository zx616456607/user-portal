/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App Wrap Store
 *
 * v0.1 - 2017-11-20
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { Icon, Dropdown, Menu, Card, Pagination, Tooltip, Modal } from 'antd'
import classNames from 'classnames'
import { offShelfWrap, getWrapStoreHotList } from '../../../actions/app_center'
import { getAppsList, getAppsHotList, appStoreApprove } from '../../../actions/app_store'
import { calcuDate } from '../../../common/tools'
import NotificationHandler from '../../../components/Notification'
import { API_URL_PREFIX } from '../../../constants'
import { ROLE_SYS_ADMIN } from '../../../../constants'
import ProjectDetail from '../ImageCenter/ProjectDetail'
const sortOption = [
  {
    key: 'publish_time',
    text: '按照发布时间'
  },
  {
    key: 'download_times',
    text: '按照下载次数'
  }
]

class WrapComopnent extends React.Component {
  constructor(props) {
    super(props)
    this.closeModal = this.closeModal.bind(this)
    this.offShelfConfirm = this.offShelfConfirm.bind(this)
    this.offShelfCancel = this.offShelfCancel.bind(this)
    this.showImageDetail = this.showImageDetail.bind(this)
    this.closeImageDetailModal = this.closeImageDetailModal.bind(this)
    this.state = {
      
    }
  }
  componentWillMount() {
    const { getWrapStoreHotList, activeKey, getAppsHotList } = this.props
    if (activeKey === 'app') {
      getWrapStoreHotList()
    } else {
      getAppsHotList()
    }
  }
  renderClassifyTab() {
    const { wrapGroupList, classify, filterClassify } = this.props
    if (!wrapGroupList || !wrapGroupList.classifies || !wrapGroupList.classifies.length) return
    const allClassify = [{
      iD: "",
      classifyName: "全部"
    }]
    let newClassifies = allClassify.concat(wrapGroupList.classifies)
    return newClassifies.map(item => {
      return(
        <span
          className={classNames('filterTab', {'active': item.iD === classify})}
          key={item.iD}
          onClick={() => filterClassify(item.iD)}
        >
          {item.classifyName}
        </span>
      )
    })
  }
  renderSortTab() {
    const { changeSort, sort_by, activeKey } = this.props
    let newSortOpt
    if (activeKey === 'app') {
      newSortOpt = sortOption.concat(
        {
          key: 'file_nick_name',
          text: '按照名称'
        }
      )
    } else {
      newSortOpt = sortOption.concat(
        {
          key: 'app_name',
          text: '按照名称'
        }
      )
    }
    return newSortOpt.map(item => {
      return(
        <span
          className={classNames('filterTab', { 'active': sort_by === item.key })}
          key={item.key}
          onClick={() => changeSort(item.key)}
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
    const { offShelfWrap, getWrapStoreHotList, getStoreList } = this.props
    let notify = new NotificationHandler()
    notify.spin('操作中')
    offShelfWrap(pkgID, {
      success: {
        func: () => {
          notify.close()
          notify.success('操作成功')
          getStoreList()
          getWrapStoreHotList()
        },
        isAsync: true
      },
      failed: {
        func: res => {
          notify.close()
          notify.error(`操作失败\n${res.message}`)
        }
      }
    })
  }
  offsetImage(id) {
    this.setState({
      offShelfModal: true,
      offshelfId: id
    })
  }
  offShelfConfirm() {
    const { appStoreApprove, getStoreList, getAppsHotList } = this.props
    const { offshelfId } = this.state
    let notify = new NotificationHandler()
    notify.spin('操作中')
    const body = {
      id: offshelfId,
      type: 2,
      status: 4,
    }
    appStoreApprove(body, {
      success: {
        func: () => {
          notify.close()
          notify.success('操作成功')
          getStoreList()
          getAppsHotList()
          this.setState({
            offShelfModal: false,
            offshelfId: ''
          })
        },
        isAsync: true
      },
      failed: {
        func: res => {
          notify.close()
          notify.error(`操作失败\n${res.message.message}`)
          this.setState({
            offShelfModal: false,
            offshelfId: ''
          })
        }
      }
    })
  }
  offShelfCancel() {
    this.setState({
      offShelfModal: false,
      offshelfId: ''
    })
  }
  handleMenuClick(e, row) {
    const { activeKey } = this.props
    const { downloadModalVisible } = this.state
    switch(e.key) {
      case 'offShelf':
        if (activeKey === 'app') {
          this.updateAppStatus(row.id)
          return
        }
        this.offsetImage(row.iD)
        break
      case 'vm':
        browserHistory.push(`/app_manage/vm_wrap/create?from=wrapStore&fileName=${row.fileName}`)
        break
      case 'download':
        if (!downloadModalVisible) {
          this.setState({
            currentImage: row,
            downloadModalVisible: true
          })
        }
        break
    }
  }
  closeModal() {
    this.setState({
      downloadModalVisible: false,
      currentImage: null
    })
  }
  handleButtonClick(item) {
    const { activeKey } = this.props
    if (activeKey === 'app') {
      this.goDeploy(item.fileName)
      return
    }
    const { resourceLink, resourceName } = item
    const server = resourceLink && resourceLink.split('/')[0]
    browserHistory.push(`/app_manage/app_create/quick_create?registryServer=${server}&imageName=${resourceName}#configure-service`)
  }
  startCopy(value) {
    const target = document.getElementsByClassName('storeCopyInput')[0]
    target.value = value
  }
  copyOperate() {
    let target = document.getElementsByClassName('storeCopyInput')[0];
    target.select()
    document.execCommand("Copy", false);
    this.setState({
      copyStatus: true
    })
  }
  copyEnd() {
    this.setState({
      copyStatus: false
    })
  }
  closeImageDetailModal(){
    this.setState({imageDetailModalShow:false})
  }
  showImageDetail(item) {
    this.setState({currentImage: item, imageDetailModalShow: true})
  }
  renderWrapList(dataSource, isHot) {
    const { role, activeKey } = this.props
    const { copyStatus } = this.state
    let newData
    if (activeKey === 'app') {
      if (!dataSource || !dataSource.pkgs || !dataSource.pkgs.length) {
        return
      }
      newData = dataSource.pkgs
    } else {
      if (!dataSource || !dataSource.apps || !dataSource.apps.length) {
        return
      }
      newData = dataSource.apps
    }
    if (!newData || !newData.length) {
      return (
        <div className='loadingBox'>
          暂无数据
        </div>
      )
    }
    return newData.map((item, index) => {
      const menu = (
        <Menu style={{ width: 90 }} onClick={e => this.handleMenuClick(e, item)}>
          {
            activeKey === 'app' 
              ? <Menu.Item key="vm">
                传统部署
                </Menu.Item>
              : <Menu.Item key="none" style={{ display: 'none' }}/>
          }
          <Menu.Item key="download">
            {
              activeKey === 'app' ?
                <a target="_blank" href={`${API_URL_PREFIX}/pkg/${item.id}`}>下载</a>
                :
                '下载'
            }
          </Menu.Item>
          {
            role === ROLE_SYS_ADMIN
              ? <Menu.Item key="offShelf" disabled={[0, 1, 4].includes(item.publishStatus)}>下架</Menu.Item>
              : <Menu.Item key="none" style={{ display: 'none' }}/>
          }
        </Menu>
      );
      return (
        <div key={activeKey === 'app' ? item.id : item.publishTime} className={classNames("wrapList", {"noBorder": isHot})} type="flex">
          {
            isHot && <div className="rank">{index !== 0 ? <span className={`hotOrder hotOrder${index + 1}`}>{index + 1}</span> : <i className="champion"/>}</div>
          }
            <img className={classNames({"wrapIcon": !isHot, "hotWrapIcon": isHot})}
                 src={`${API_URL_PREFIX}/pkg/icon/${ activeKey === 'app' ? item.pkgIconID : item.versions[0].iconID}`}
            />
            <div className="wrapListMiddle">
              <div className="appName" style={{ marginBottom: isHot || activeKey === 'image' ? 0 : 10 }}>
                <div onClick={activeKey === 'image' && this.showImageDetail.bind(this, item)} className={classNames("themeColor pointer", {'inlineBlock' : !isHot})}>{activeKey === 'app' ? item.fileNickName : item.appName}</div>
                {
                  !isHot && <span className="nickName hintColor"> ({activeKey === 'app' ? item.fileName : item.resourceName})</span>
                }
                {
                  activeKey === 'image' && !isHot &&
                    <span className="tagBox noWrap">
                      <Icon type="tag" className="tag"/>
                      {item.versions[0].tag}
                    </span>
                }
              </div>
              {
                isHot &&
                  <Tooltip title={activeKey === 'app' ? item.fileName : item.resourceName}>
                    <div className="nickName hintColor textoverflow"> ({activeKey === 'app' ? item.fileName : item.resourceName})</div>
                  </Tooltip>
              }
              {
                activeKey === 'image' && !isHot && 
                <div className="sourceAddr hintColor">
                  <span className="sourceText noWrap">镜像地址：</span>
                  <Tooltip title={`${item.resourceLink}:${item.versions[0].tag}`}>
                    <span className="textoverflow resourceLink">{item.resourceLink}:{item.versions[0].tag}</span>
                  </Tooltip>
                  <input type="text" className="storeCopyInput" style={{ position: "absolute", opacity: "0", top:'0'}}/>
                  <Tooltip title={copyStatus ? '复制成功' : '点击复制'}>
                    <Icon
                      type="copy"
                      className="copyBtn pointer"
                      onMouseEnter={() => this.startCopy(`${item.resourceLink}:${item.versions[0].tag}`)}
                      onClick={this.copyOperate.bind(this)}
                      onMouseLeave={this.copyEnd.bind(this)}
                    />
                  </Tooltip>
                </div>
              }
              {
                !isHot && <div className="hintColor appDesc">描述：{activeKey === 'app' ? item.description : item.versions[0].description}</div>
              }
              {
                isHot &&
                <div className="downloadBox">
                  <span className="hintColor"><Icon type="download" /> {item.downloadTimes}</span>
                </div>
              }
            </div>
          <div className="wrapListRight" style={{ textAlign: 'right' }}>
            <Dropdown.Button
              className="wrapPopBtn"
              overlay={menu}
              type="ghost"
              onClick={() => this.handleButtonClick(item)}
            >
              <span className="operateBtn"><Icon type="appstore-o" /> {activeKey === 'app' ? '容器部署' : '部署'}</span>
            </Dropdown.Button>
            {
              !isHot &&
              <div className="downloadBox">
                <span className="hintColor"><Icon type="download" /> {item.downloadTimes}</span>
                <span className="hintColor"><Icon type="clock-circle-o" /> 发布于 {calcuDate(item.publishTime)}</span>
              </div>
            }
          </div>
        </div>
      )
    })
  }
  render() {
    const { current, dataSource, dataHotList, updatePage } = this.props
    const { downloadModalVisible, currentImage, offShelfModal, imageDetailModalShow } = this.state
    let server
    let node
    if (currentImage) {
      server = currentImage.resourceLink && currentImage.resourceLink.split('/')[0]
      node = currentImage.resourceLink && currentImage.resourceLink.split('/')[1]
      Object.assign(currentImage, { name: currentImage.resourceName })
    }
    const pagination = {
      simple: true,
      current,
      pageSize: 10,
      total: dataSource && dataSource.total || 0,
      onChange: updatePage
    }
    return(
      <div className="storeTemplate">
        <Modal
          visible={imageDetailModalShow}
          className="AppServiceDetail"
          transitionName="move-right"
          onCancel={()=> this.setState({imageDetailModalShow:false})}
        >
          <ProjectDetail server={server} scope={this} config={currentImage}/>
        </Modal>
        <Modal 
          title="下载镜像"
          className="uploadImageModal" 
          visible={downloadModalVisible} 
          width="800px"
          onCancel={this.closeModal} 
          onOk={this.closeModal}
        >
          <p>在本地 docker 环境中输入以下命令，就可以 pull 一个镜像到本地了</p>
          <pre className="codeSpan">
            {`sudo docker pull ${server && server}/${node && node}/<image name>:<tag>`}
          </pre>
          <p>为了在本地方便使用，下载后可以修改tag为短标签，比如：</p>
          <pre className="codeSpan">
            {`sudo docker tag  ${server && server}/${node && node}/hello-world:latest ${node && node}/hello-world:latest`}
            </pre>
        </Modal>
        <Modal
          title="下架"
          visible={offShelfModal}
          onOk={this.offShelfConfirm}
          onCancel={this.offShelfCancel}
        >
         <div className="deleteRow">
           <i className="fa fa-exclamation-triangle" aria-hidden="true"/>
           <span>下架后会将该镜像删除并且无法恢复，是否确定下架？</span>
         </div> 
        </Modal>
        <div className="wrapStoreBody">
          <div className="wrapListBox wrapStoreLeft">
            <div className="filterAndSortBox">
              <div className="filterClassify">
                <span>分类：</span>
                {this.renderClassifyTab()}
              </div>
              <div className="sortBox">
                <span>排序：</span>
                {this.renderSortTab()}
              </div>
              {
                dataSource && dataSource.total !== 0 &&
                <div className="total">共 {dataSource && dataSource.total || 0} 条</div>
              }
              {
                dataSource && dataSource.total !== 0 &&
                <Pagination {...pagination}/>
              }
            </div>
            <div className="storeListBox">
              {this.renderWrapList(dataSource, false)}
            </div>
          </div>
          <div className="wrapListBox wrapStoreRight">
            <Card title="排行榜" bordered={false} className="hotWrapCard">
              {this.renderWrapList(dataHotList, true)}
            </Card>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    
  }
}
export default connect(mapStateToProps, {
  offShelfWrap,
  getWrapStoreHotList,
  getAppsList, 
  getAppsHotList,
  appStoreApprove
})(WrapComopnent)