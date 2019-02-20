/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageDetailBox component
 *
 * v0.1 - 2017-6-09
 * @author BaiYu
 */
import React, { Component, PropTypes } from 'react'
import { Tabs, Button, Card, Switch, Menu, Tooltip, Icon, Input, Modal, Select } from 'antd'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { imageStore, imageSwitch, loadPublicImageList, loadFavouriteList, loadPrivateImageList, updateImageinfo, getImageDetailInfo, loadMirrorSafetyScanStatus, loadMirrorSafetyLayerinfo,loadMirrorSafetyScan, loadMirrorSafetyLyinsinfo, loadMirrorSafetyChairinfo } from '../../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../../constants'
import ImageVersion from './ImageVersion'
// import DockerFile from './Dockerfile'
import Attribute from './Attribute'
import MirrorSafety from './Mirrorsafety'
import './style/ImageDetailBox.less'
import NotificationHandler from '../../../../components/Notification'
import { camelize } from 'humps'
import DetailInfo from './DetailInfo'
import TenxIcon from '@tenx-ui/icon/es/_old'
import { injectIntl } from 'react-intl'
import detailIndexIntl from './intl/detailIndexIntl'
import {setBodyScrollbar} from "../../../../common/tools";
import CreateAppStack from './CreateAppStack'

const TabPane = Tabs.TabPane;
const Option = Select.Option;

class ImageDetailBox extends Component {
  constructor(props) {
    super(props);
    this.copyDownloadCode = this.copyDownloadCode.bind(this);
    this.returnDefaultTooltip = this.returnDefaultTooltip.bind(this);
    this.handleTabsSwitch = this.handleTabsSwitch.bind(this)
    this.safetyscanShow = this.safetyscanShow.bind(this)
    // this.isSwitch = this.isSwitch.bind(this);
    this.handelSelectedOption = this.handelSelectedOption.bind(this)
    // this.formatErrorMessage = this.formatErrorMessage.bind(this)
    //this.TemplateTabPaneMirrorsafety = this.TemplateTabPaneMirrorsafety.bind(this)
    this.state = {
      imageDetail: null,
      copySuccess: false,
      editInfo: false,
      activeKey: 'detailInfo',
      disable: true,
      tagVersion: '',
      tag: '',
      UpgradeVisible:false,
      tabledisabled:true,
      safetyscanVisible:false,
    }
  }
  componentDidMount() {
    const { location } = this.props
    const { query } = location
    if (query && query.activeKey) {
      this.setState({
        activeKey: query.activeKey
      })
    }
    setBodyScrollbar()
  }
  componentWillUnmount() {
    setBodyScrollbar(true)
  }
  componentWillReceiveProps(nextPorps) {
    const { visible: oldVisible } = this.props
    const { visible: newVisible, location } = nextPorps
    const { query } = location
    if (query !== this.props.location.query && query.activeKey) {
      this.setState({
        activeKey: query.activeKey
      })
    }
    if (oldVisible && !newVisible) {
      this.setState({
        activeKey: 'detailInfo'
      })
    }
  }
  copyDownloadCode() {
    //this function for user click the copy btn and copy the download code
    const scope = this;
    let code = document.getElementsByClassName("privateCodeInput");
    code[0].select();
    document.execCommand("Copy", false);
    scope.setState({
      copySuccess: true
    });
  }
  returnDefaultTooltip() {
    const scope = this;
    setTimeout(function () {
      scope.setState({
        copySuccess: false
      });
    }, 500);
  }
  safetyscanhandleOk() {
    const { loadMirrorSafetyScanStatus, loadMirrorSafetyLayerinfo, loadMirrorSafetyScan, loadMirrorSafetyLyinsinfo, loadMirrorSafetyChairinfo, cluster_id, mirrorSafetyScan, mirrorScanUrl } = this.props
    const imageDetail = this.props.config
    const imageName = imageDetail.name
    const tag = this.state.tagVersion
    const notificationHandler = new NotificationHandler()
    this.setState({safetyscanLoading : true})
    const { formatMessage } = this.props.intl;
    loadMirrorSafetyScanStatus({ imageName, tag },{
      success: {
        func: () => {
          loadMirrorSafetyLayerinfo({ imageName, tag })
          this.setState({
            TabsDisabled: false,
            safetyscanVisible: false,
            activeKey: '5',
            disable: true,
            tag: this.state.tagVersion,
            safetyscanLoading:false
          })
          const { mirrorScanstatus } = this.props
          const currentImageScanstatus = mirrorScanstatus[imageName][tag]
          const currentImageScanstatusResult = currentImageScanstatus.result
          const statusCode = currentImageScanstatusResult.statusCode
          const full_name = currentImageScanstatusResult.fullName
          const blob_sum = currentImageScanstatusResult.blobSum
          const status = currentImageScanstatusResult.status
          const registry = mirrorScanUrl
          if(statusCode == 500){
            return
          }
          const config = {
            cluster_id,
            imageName,
            tag,
            registry,
            full_name
          }
          if(statusCode && statusCode == 200){
            switch(status){
              case 'lynis':
              case 'clair':
              case 'running':
              case 'both':{
                loadMirrorSafetyChairinfo({imageName, blob_sum, full_name, tag})
                loadMirrorSafetyLyinsinfo({imageName, blob_sum, full_name, tag})
                return
              }
              case 'noresult':{
                if(mirrorSafetyScan[imageName] && mirrorSafetyScan[imageName][tag]){
                  loadMirrorSafetyChairinfo({imageName, blob_sum, full_name, tag})
                  loadMirrorSafetyLyinsinfo({imageName, blob_sum, full_name, tag})
                  return
                }
                return loadMirrorSafetyScan({...config}, {
                  success: {
                    func: () =>{
                      loadMirrorSafetyChairinfo({imageName, blob_sum, full_name, tag})
                      loadMirrorSafetyLyinsinfo({imageName, blob_sum, full_name, tag})
                    },
                    isAsync : true
                  }
                })
              }
              case 'different':
              case 'failed':
              default: return false
            }
          }
        },
        isAsync: true
      },
      failed:{
        func: (res) => {
          if(res.statusCode == 412){
            this.setState({
              safetyscanVisible:false,
              safetyscanLoading:false,
            })
            return
          }

          notificationHandler.error(formatMessage(detailIndexIntl.errMsg, {name: imageName, tag, msg: this.formatErrorMessage(res) }))
          this.setState({
            safetyscanVisible:false,
            safetyscanLoading:false,
          })
        },
        isAsync : true
      }
    })
  }
  safetyscanShow() {
    this.setState({
      safetyscanVisible: true,
      tagVersion : ''
    })
  }
  handleTabsSwitch(key) {
    this.setState({
      activeKey: key.toString()
    })
  }
  TemplateSafetyScan() {
    const { imgTag } = this.props
    if (!imgTag) {
      return
    }
    const tags = imgTag.map((item, index) => {
      return (
        <Option value={item} key={index}>{item}</Option>
      )
    })
    return tags
  }
  safetyscanhandleCancel() {
    this.setState({safetyscanVisible: false,disable:false})
  }
  handelSelectedOption(tag) {
    this.setState({
      disable: false,
      tagVersion: tag
    })
  }
  render() {
    const { formatMessage } = this.props.intl;
    const imageInfo = this.props.config;
    const { imageType, UpgradeVisible, scope, isAdminAndHarbor, location, currentUserRole, project_id } = this.props
    if (!imageInfo) {
      return ('')
    }
    const imageDetail = this.props.config;
    const ipAddress = this.props.server;
    const imageName = imageDetail.name;
    let pullCode = "docker pull " + ipAddress + "/" + imageName;
    return (
      <div id="ImageDetailBox">
        <div className="headerBox">
          <div className="imgBox">
            <TenxIcon type='app-center-logo'/>
          </div>
          <div className="infoBox">
            <p className="imageName">
              {imageDetail.name ? imageDetail.name : imageDetail.imageName}
            </p>
            <div className="textareas">
              {imageInfo.description}
              {/*{this.imageDescription(imageInfo)}*/}

            </div>
            <div className="rightBox">
              <Icon type='cross' className='cursor' style={{ fontSize: '18px', position: 'absolute', top: '0px', right: '0px' }} onClick={this.props.scope.closeImageDetailModal} />
              <div className='rightBoxleft'>
                <Button size="large" type="primary" onClick={() => browserHistory.push(`/app_manage/app_create/quick_create?registryServer=${ipAddress}&imageName=${imageName}`)}>
                  {formatMessage(detailIndexIntl.deployImage)}
                </Button>
              </div>
              {/* 扫描 */}
              <div className='rightBoxright'>
                <Button type="ghost" size="large" onClick={this.safetyscanShow}>{formatMessage(detailIndexIntl.securityScan)}</Button>
                <Modal title={formatMessage(detailIndexIntl.securityScan)} visible={this.state.safetyscanVisible} closable={true}
                  onCancel={()=> this.safetyscanhandleCancel()}
                  confirmLoading={true}
                  footer={[
                    <Button
                      key="back"
                      type="ghost"
                      size="large"
                      onClick={()=> this.safetyscanhandleCancel()}>
                      {formatMessage(detailIndexIntl.cancelText)}
                    </Button>,
                    <Button
                      key="submit"
                      type="primary"
                      size="large"
                      loading={this.state.safetyscanLoading}
                      disabled={this.state.disable}
                      onClick={()=> this.safetyscanhandleOk()}>
                      {formatMessage(detailIndexIntl.okText)}
                    </Button>,
                  ]}>
                  <div>
                    <span style={{ marginRight: '30px' }}>{formatMessage(detailIndexIntl.version)}</span>
                    <Select
                      showSearch
                      style={{ width: '322px' }}
                      notFoundContent={formatMessage(detailIndexIntl.notFoundContent)}
                      placeholder={formatMessage(detailIndexIntl.selectPlaceholder)}
                      value={this.state.tagVersion ? this.state.tagVersion : formatMessage(detailIndexIntl.selectPlaceholder)}
                      allowClear={true}
                      confirmLoading={true}
                      onChange={this.handelSelectedOption}
                    >
                      {this.TemplateSafetyScan()}
                    </Select>
                  </div>
                </Modal>
              </div>
            </div>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        <div className="downloadBox">
          <div className="code">
            <TenxIcon type="download" className="left"/>
            {formatMessage(detailIndexIntl.downloadImage)}&nbsp;&nbsp;&nbsp;&nbsp;
            <span className="pullCode textoverflow">docker pull {this.props.server}/{imageName}&nbsp;&nbsp;</span>
            <Tooltip title={this.state.copySuccess ? formatMessage(detailIndexIntl.copySuccess) : formatMessage(detailIndexIntl.copyBtn)}>
              <TenxIcon type="copy" className='appcentercopy center' onClick={this.copyDownloadCode} onMouseLeave={this.returnDefaultTooltip}/>
            </Tooltip>
            <input className="privateCodeInput" value={pullCode} style={{ position: "absolute", opacity: "0" }} />
          </div>
          <div className="times">
            <TenxIcon type="download" className="right"/>
            {imageDetail[camelize('pull_count')]}
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        <div className="tabBox">
          <Tabs className="itemList" activeKey={this.state.activeKey} onChange={this.handleTabsSwitch}>
            <TabPane tab={formatMessage(detailIndexIntl.info)} key="detailInfo">
              <DetailInfo
                registry={DEFAULT_REGISTRY}
                imageName={this.props.imageName}
                project_id={project_id}
              />
            </TabPane>
            <TabPane tab={formatMessage(detailIndexIntl.tag)} key="tag">
              <ImageVersion
                imageName={this.props.imageName}
                location={location}
                isAdminAndHarbor={isAdminAndHarbor}
                scope={this} config={imageDetail}
                scopeDetail={scope}
                currentUserRole={currentUserRole}
                project_id={project_id}
              />
            </TabPane>
            <TabPane tab={formatMessage(detailIndexIntl.attribute)} key="attr"><Attribute detailInfo={imageInfo} /></TabPane>
            <TabPane tab={formatMessage(detailIndexIntl.mirrorSafety)} key="5">
              <MirrorSafety imageName={imageInfo.name}
                            imageType="publicImages"
                            registry={DEFAULT_REGISTRY}
                            tagVersion={this.state.tag}
                            tabledisabled={this.state.tabledisabled}
              />
            </TabPane>
            <TabPane tab={isAdminAndHarbor ? formatMessage(detailIndexIntl.createAppStack) : ''} key="6" disable={!isAdminAndHarbor}>
              <CreateAppStack
                imageName={this.props.imageName}
                ImageGroupName={this.props.ImageGroupName}
                server={this.props.server}
              />
            </TabPane>
          </Tabs>
        </div>
      </div>
    )
  }
}

ImageDetailBox.propTypes = {
  intl: PropTypes.object.isRequired,
}
function mapStateToProps(state, props) {
  const defaultConfig = {
    isFetching: false,
    registry: DEFAULT_REGISTRY
  }
  const { imagesInfo } = state.images
  const { imageInfo } = imagesInfo[DEFAULT_REGISTRY] || defaultConfig
  const imageName = props.config.name
  const { getImageTag, entities, images } = state
  let imageType  = props.imageType || 'privateImages'
  const { imageTags } = state.harbor
  let imgTag = []
  if (imageTags[DEFAULT_REGISTRY] && imageTags[DEFAULT_REGISTRY][imageName]) {
    imgTag = imageTags[DEFAULT_REGISTRY][imageName].tag || []
  }
  let mirrorScanUrl = ''
  if (images[imageType][DEFAULT_REGISTRY] && images[imageType][DEFAULT_REGISTRY].server) {
    mirrorScanUrl = images[imageType][DEFAULT_REGISTRY].server
  }

  let mirrorSafetyScan = images.mirrorSafetyScan || ''
  let cluster_id = entities.current.cluster.clusterID || ''
  let mirrorScanstatus = images.mirrorSafetyScanStatus
  return {
    imageInfo,
    registry: DEFAULT_REGISTRY,
    imageName,
    imgTag,
    mirrorSafetyScan,
    cluster_id,
    mirrorScanUrl,
    mirrorScanstatus
  }
}

export default connect(mapStateToProps, {
  imageStore,
  imageSwitch,
  loadPrivateImageList,
  loadPublicImageList,
  loadFavouriteList,
  updateImageinfo,
  getImageDetailInfo,
  loadMirrorSafetyScanStatus,
  loadMirrorSafetyLayerinfo,
  loadMirrorSafetyScan,
  loadMirrorSafetyLyinsinfo,
  loadMirrorSafetyChairinfo
})(injectIntl(ImageDetailBox, {
  withRef: true,
}));
