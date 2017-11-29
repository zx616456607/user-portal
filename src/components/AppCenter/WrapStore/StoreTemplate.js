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
import { Icon, Dropdown, Menu, Card, Pagination, Tooltip, Modal, Select, Row, Col, Button, Spin } from 'antd'
import classNames from 'classnames'
import { offShelfWrap, getWrapStoreHotList } from '../../../actions/app_center'
import { getAppsList, getAppsHotList, appStoreApprove } from '../../../actions/app_store'
import { calcuDate, encodeImageFullname } from '../../../common/tools'
import NotificationHandler from '../../../components/Notification'
import { API_URL_PREFIX } from '../../../constants'
import defaultImage from '../../../../static/img/appstore/defaultimage.png'
import { ROLE_SYS_ADMIN } from '../../../../constants'
import ProjectDetail from '../ImageCenter/ProjectDetail'

const Option = Select.Option;

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
    this.selectTag = this.selectTag.bind(this)
    this.renderFooter = this.renderFooter.bind(this)
    this.state = {
      selectTag: ''
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
    const { wrapGroupList, classify, updateParentState } = this.props
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
          onClick={() => updateParentState('classify', item.iD, true)}
        >
          {item.classifyName}
        </span>
      )
    })
  }
  renderSortTab() {
    const { updateParentState, sort_by, activeKey } = this.props
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
          onClick={() => updateParentState('sort_by', item.key, true)}
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
  offsetImage(image) {
    let tagWithId = {}
    image.versions.forEach(item => {
      Object.assign(tagWithId, {
        [item.iD]: item.tag
      })
    })
    this.setState({
      tagWithId,
      offShelfModal: true,
      currentImage: image
    })
  }
  offShelfConfirm() {
    const { appStoreApprove, getStoreList, getAppsHotList } = this.props
    const { offshelfId, currentImage, tagWithId } = this.state
    let notify = new NotificationHandler()
    notify.spin('操作中')
    const body = {
      id: offshelfId,
      type: 2,
      status: 4,
      imageTagName: `${currentImage.resourceName}:${tagWithId[offshelfId]}`
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
            offshelfId: '',
            currentImage: null,
            tagWithId: {}
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
            offshelfId: '',
            currentImage: null,
            tagWithId: {}
          })
        }
      }
    })
  }
  offShelfCancel() {
    this.setState({
      offShelfModal: false,
      offshelfId: '',
      currentImage: null
    })
  }
  handleMenuClick(e, row) {
    const { activeKey } = this.props
    const { downloadModalVisible } = this.state
    switch(e.key) {
      case 'offShelf':
        if (activeKey === 'app') {
          this.updateAppStatus(row.appId)
          return
        }
        this.offsetImage(row)
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
    browserHistory.push(`/app_manage/app_create/quick_create?registryServer=${server}&imageName=${encodeImageFullname(resourceName)}#configure-service`)
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
  selectTag(tagId) {
    this.setState({
      offshelfId: tagId
    })
  }
  renderWrapList(dataSource, isHot) {
    const { role, activeKey, dataFetching, dataHotFetching, rectStyle } = this.props
    const { copyStatus } = this.state
    let newData
    if (isHot) {
      if (dataHotFetching) {
        return (
          <div className='loadingBox'>
            <Spin size='large'/>
          </div>
        )
      }
    } else {
      if (dataFetching) {
        return (
          <div className='loadingBox'>
            <Spin size='large'/>
          </div>
        )
      }
    }
    if (activeKey === 'app') {
      if (!dataSource || !dataSource.pkgs || !dataSource.pkgs.length) {
        return (
          <div className='loadingBox'>
            <i className="anticon anticon-frown"/>暂无数据
          </div>
        )
      }
      newData = dataSource.pkgs
    } else {
      if (!dataSource || !dataSource.apps || !dataSource.apps.length) {
        return (
          <div className='loadingBox'>
            <i className="anticon anticon-frown"/>暂无数据
          </div>
        )
      }
      newData = dataSource.apps
    }
    return newData.map((item, index) => {
      const menu = width => (
        <Menu style={{ width }} onClick={e => this.handleMenuClick(e, item)}>
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
        [
          (!rectStyle || isHot) &&
          <div key={activeKey === 'app' ? item.id : item.publishTime} className={classNames("wrapList", {"noBorder": isHot})} type="flex">
            {
              isHot && <div className="rank">{index !== 0 ? <span className={`hotOrder hotOrder${index + 1}`}>{index + 1}</span> : <i className="champion"/>}</div>
            }
            <img className={classNames({"wrapIcon": !isHot, "hotWrapIcon": isHot})}
                 src={
                   activeKey === 'app' ?
                     `${API_URL_PREFIX}/pkg/icon/${item.pkgIconID}`
                     :
                       item.versions[0].iconID ?
                         `${API_URL_PREFIX}/pkg/icon/${item.versions[0].iconID}`
                         :
                         defaultImage
                 }
            />
            <div className="wrapListMiddle">
              <div className="appName">
                <div
                  onClick={activeKey === 'image' && this.showImageDetail.bind(this, item)}
                  className={classNames("themeColor", {'inlineBlock pointer' : !isHot, 'hidden': isHot})}
                >
                  {activeKey === 'app' ? item.fileNickName : item.appName}
                </div>
                {
                  !isHot && <span className="nickName firstNickName hintColor"> ({activeKey === 'app' ? item.fileName : item.resourceName.split('/')[1]})</span>
                }
                {
                  activeKey === 'image' && !isHot &&
                  <Tooltip title={`最新版本：${item.versions[0].tag}`}>
                    <span className="tagBox noWrap hintColor textoverflow inlineBlock">
                      <Icon type="tag" className="tag"/>
                      {item.versions[0].tag}
                    </span>
                  </Tooltip>
                }
              </div>
              {
                isHot &&
                <Tooltip title={activeKey === 'app' ? item.fileNickName : item.appName}>
                  <div onClick={activeKey === 'image' && this.showImageDetail.bind(this, item)} className="themeColor pointer textoverflow">
                    {activeKey === 'app' ? item.fileNickName : item.appName}
                  </div>
                </Tooltip>
              }
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
                  <Tooltip title={item.resourceLink}>
                    <span className="textoverflow resourceLink">{item.resourceLink}</span>
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
                !isHot &&
                <Tooltip title={activeKey === 'app' ? item.description : item.versions[0].description}>
                  <div className="hintColor appDesc textoverflow">描述：{activeKey === 'app' ? item.description : item.versions[0].description}</div>
                </Tooltip>
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
                overlay={menu(100)}
                type="ghost"
                onClick={() => this.handleButtonClick(item)}
              >
                <span className="operateBtn"><Icon type="appstore-o" /> {activeKey === 'app' ? '容器部署' : '部署'}</span>
              </Dropdown.Button>
              {
                !isHot &&
                <div className="downloadBox">
                  <span className="hintColor"><Icon type="download" /> {item.downloadTimes}</span>
                  <span className="hintColor"><Icon type="clock-circle-o" /> {activeKey === 'app' ? '发布' : '更新'}于 {calcuDate(item.publishTime)}</span>
                </div>
              }
            </div>
          </div>,
          rectStyle && !isHot &&
          <div className="rectBox" key={activeKey === 'app' ? item.id : item.publishTime}>
            <div className="reactBoxTop pointer" onClick={activeKey === 'image' && this.showImageDetail.bind(this, item)}>
              <img
                className="reactImg"
                src={
                  activeKey === 'app' ?
                    `${API_URL_PREFIX}/pkg/icon/${item.pkgIconID}`
                    :
                    item.versions[0].iconID ?
                      `${API_URL_PREFIX}/pkg/icon/${item.versions[0].iconID}`
                      :
                      defaultImage
                }
              />
              <div className="rectAppName">
                {activeKey === 'app' ? item.fileNickName : item.appName}
              </div>
              <Tooltip title={activeKey === 'app' ? item.description : item.versions[0].description}>
                <div className="rectDesc textoverflow hintColor">{activeKey === 'app' ? item.description : item.versions[0].description}</div>
              </Tooltip>
            </div>
            <div className="reactBoxFooter">
              <Tooltip title={item.downloadTimes}>
                <div className="hintColor downLoadBox textoverflow">
                  <Icon type="download" /> {item.downloadTimes}
                </div>
              </Tooltip>
              <Tooltip title={calcuDate(item.publishTime)}>
                <div className="hintColor timeBox textoverflow">
                  <Icon type="clock-circle-o" /> {calcuDate(item.publishTime)}
                </div>
              </Tooltip>
              <div className={classNames("dropDownBox", { 'appDrop': activeKey === 'app' })}>
                <Dropdown.Button
                  overlay={menu(80)}
                  type="ghost"
                  onClick={() => this.handleButtonClick(item)}
                >
                  <span>{activeKey === 'app' ? '容器部署' : '部署'}</span>
                </Dropdown.Button>
              </div>
            </div>
          </div>
        ]
      )
    })
  }
  renderFooter() {
    const { offshelfId } = this.state
    return [
      <Button key="cancel" onClick={this.offShelfCancel}>取消</Button>,
      <Button key="confirm" onClick={this.offShelfConfirm} type="primary" disabled={!offshelfId}>确定</Button> 
    ]
  }
  render() {
    const { current, dataSource, dataHotList, updateParentState, rectStyle } = this.props
    const { downloadModalVisible, currentImage, offShelfModal, imageDetailModalShow, offshelfId } = this.state
    let server
    let node
    let tagArr = []
    if (currentImage) {
      server = currentImage.resourceLink && currentImage.resourceLink.split('/')[0]
      node = currentImage.resourceLink && currentImage.resourceLink.split('/')[1]
      Object.assign(currentImage, { name: currentImage.resourceName })
      tagArr = currentImage.versions.map(item => <Option key={item.iD}>{item.tag}</Option>)
    }
    const pagination = {
      simple: true,
      current,
      pageSize: 12,
      total: dataSource && dataSource.total || 0,
      onChange: current => updateParentState('current', current, true)
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
          footer={this.renderFooter()}
        >
          <Row type="flex" justify="center" align="middle">
            <Col span={3}>
              下架版本
            </Col>
            <Col span={18}>
              <Select
                showSearch
                value={offshelfId}
                style={{ width: 300, marginLeft: 20 }}
                placeholder="请选择版本"
                optionFilterProp="children"
                notFoundContent="无法找到"
                onChange={this.selectTag}
              >
                {tagArr}
              </Select>
            </Col>
          </Row>
          <Row type="flex" justify="center" style={{ marginTop: 20 }}>
            <Col span={18} offset={5}><Icon type="info-circle-o" /> 下架之后会将所选镜像版本删除，原镜像不受影响</Col>
          </Row>
        </Modal>
        <div className="wrapStoreBody">
          <div className="wrapListBox wrapStoreLeft">
            <div className="filterAndSortBox">
              <div className="filterClassify">
                <div className="text">分类：</div>
                <div className="listBox">
                  {this.renderClassifyTab()}
                </div>
              </div>
              <div className="sortBox">
                <div className="text">排序：</div>
                <div className="listBox">
                  {this.renderSortTab()}
                </div>
              </div>
              {
                dataSource && dataSource.total !== 0 &&
                <div className="total">共 {dataSource && dataSource.total || 0} 条</div>
              }
              {
                dataSource && dataSource.total !== 0 &&
                <Pagination {...pagination}/>
              }
              <div className="styleChange">
                <Icon type="bars" className={classNames("pointer", {'btnActive': !rectStyle})} onClick={() => updateParentState('rectStyle', false)}/>
                <Icon type="appstore-o" className={classNames("pointer", {'btnActive': rectStyle})} onClick={() => updateParentState('rectStyle', true)}/>
              </div>
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
