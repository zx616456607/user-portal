/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageDetailBox component
 *
 * v0.1 - 2016-10-09
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Tabs, Button, Card, Switch, Menu, Tooltip, Icon, Input, Modal, Select } from 'antd'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { imageStore, imageSwitch, loadPublicImageList, loadFavouriteList, loadPrivateImageList, updateImageinfo, getImageDetailInfo, loadImageDetailTag, loadMirrorSafetyScanStatus, loadMirrorSafetyLayerinfo,loadMirrorSafetyScan, loadMirrorSafetyLyinsinfo, loadMirrorSafetyChairinfo } from '../../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../../constants'
import ImageVersion from './ImageVersion'
// import DockerFile from './Dockerfile'
import Attribute from './Attribute'
import './style/ImageDetailBox.less'
import NotificationHandler from '../../../../common/notification_handler'
import { camelize } from 'humps'


const TabPane = Tabs.TabPane;
const Option = Select.Option;

const menusText = defineMessages({
  type: {
    id: 'AppCenter.ImageCenter.ImageDetail.type',
    defaultMessage: '类型：',
  },
  pubilicType: {
    id: 'AppCenter.ImageCenter.ImageDetail.pubilicType',
    defaultMessage: '公开',
  },
  privateType: {
    id: 'AppCenter.ImageCenter.ImageDetail.privateType',
    defaultMessage: ' 私有',
  },
  colletctImage: {
    id: 'AppCenter.ImageCenter.ImageDetail.colletctImage',
    defaultMessage: '收藏镜像',
  },
  closeImage: {
    id: 'AppCenter.ImageCenter.ImageDetail.closeImage',
    defaultMessage: '取消收藏',
  },
  deployImage: {
    id: 'AppCenter.ImageCenter.ImageDetail.deployService',
    defaultMessage: '部署镜像',
  },
  downloadImage: {
    id: 'AppCenter.ImageCenter.ImageDetail.downloadImage',
    defaultMessage: '下载镜像',
  },
  info: {
    id: 'AppCenter.ImageCenter.ImageDetail.info',
    defaultMessage: '基本信息',
  },
  tag: {
    id: 'AppCenter.ImageCenter.ImageDetail.tag',
    defaultMessage: '版本及接口',
  },
  attribute: {
    id: 'AppCenter.ImageCenter.ImageDetail.attribute',
    defaultMessage: '属性',
  },
  mirrorSafety: {
    id: 'AppCenter.ImageCenter.ImageDetail.mirrorSafety',
    defaultMessage: '镜像安全',
  },
  copyBtn: {
    id: 'AppCenter.ImageCenter.ImageDetail.copyBtn',
    defaultMessage: '点击复制',
  },
  copySuccess: {
    id: 'AppCenter.ImageCenter.ImageDetail.copySuccess',
    defaultMessage: '复制成功',
  }
})

class ImageDetailBox extends Component {
  constructor(props) {
    super(props);
    this.copyDownloadCode = this.copyDownloadCode.bind(this);
    this.returnDefaultTooltip = this.returnDefaultTooltip.bind(this);
    this.isSwitch = this.isSwitch.bind(this);
    this.handleTabsSwitch = this.handleTabsSwitch.bind(this)
    this.handelSelectedOption = this.handelSelectedOption.bind(this)
    //this.TemplateTabPaneMirrorsafety = this.TemplateTabPaneMirrorsafety.bind(this)
    this.state = {
      imageDetail: null,
      copySuccess: false,
      editInfo: false,
      activeKey: 'tag',
      disable: true,
      tagVersion: '',
      tag: '',
      UpgradeVisible:false,
      tabledisabled:true,
    }
  }

  componentWillMount() {
    const imageDetail = this.props.config;
    // const imageInfo = this.props.imageInfo
    // const { registry, loadImageDetailTag } = this.props
    // const imageName = imageDetail.name
    // loadImageDetailTag(registry, imageName)
    // this.setState({
    //   imageDetail: imageDetail,
    //   TabsDisabled: true
    // });
  }

  componentWillReceiveProps(nextProps) {
    //this function for user select different image
    //the nextProps is mean new props, and the this.props didn't change
    //so that we should use the nextProps
    const imageName = this.props.imageName
    const imageNameNext = nextProps.imageName
    let activekeyNext = '1'
    if (imageName == imageNameNext) {
      activekeyNext = this.state.activeKey
    }
    this.setState({
      imageDetail: nextProps.config,
      activeKey:activekeyNext
    });
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
  // callback(key) {
  //   if (key == 2) {
  //     this.props.getImageDetailInfo(DEFAULT_REGISTRY, this.props.config.name)
  //   }
  // }
  isSwitch(key) {
    let isPrivate = this.props.imageInfo.isPrivate;
    let image = this.state.imageDetail.name
    // const favourite = this.state.imageDetail.isFavourite
    const imageSpace = this.props.parentScope.state.current

    key ? isPrivate = 0 : isPrivate = 1
    const config = {
      isPrivate,
      registry: DEFAULT_REGISTRY,
      image,
      // myfavourite: favourite,
    }
    const scope = this
    let notification = new NotificationHandler()
    this.props.imageSwitch(config, {
      success: {
        func: () => {
          notification.success('更新成功！')
          switch (imageSpace) {
            case 'imageSpace':
              scope.props.loadPrivateImageList(DEFAULT_REGISTRY)
              break
            case 'publicSpace':
              scope.props.loadPublicImageList(DEFAULT_REGISTRY)
              break
            default:
              scope.props.loadPrivateImageList(DEFAULT_REGISTRY)
          }
        },
        isAsync: true
      }
    })
  }
  handChangeInfo() {
    const image = this.props.imageInfo.name
    let notification = new NotificationHandler()
    const desc = document.getElementById('editInfo').value
    if (desc == '') {
      notification.info('请输入描述内容')
      return
    }
    const config = {
      image,
      fullName: image,
      registry: this.props.registry,
      body: { description: desc }
    }
    const { getImageDetailInfo } = this.props
    const _this = this
    this.props.updateImageinfo(config, {
      success: {
        func: () => {
          notification.success('更新成功！')
          getImageDetailInfo(config)
          _this.setState({ editInfo: false })
        },
        isAsync: true
      }
    })
  }
  imageDescription(imageInfo) {
    /*if (this.state.editInfo) {
      return (
        <div>
          <Input type="textarea" id="editInfo" className="imagedescription" />
          <FormattedMessage {...menusText.type} />
          <Switch checked={(imageInfo.isPrivate == 0) ? true : false} disabled={!imageInfo.isOwner} defaultChecked="true" checkedChildren={<FormattedMessage {...menusText.pubilicType} />} unCheckedChildren={<FormattedMessage {...menusText.privateType} />} />
          <span style={{ float: 'right' }}>
            <Button onClick={() => this.setState({ editInfo: false })}>取消</Button>
            <Button onClick={() => this.handChangeInfo()} type="primary">保存</Button>
          </span>
        </div>
      )
    }*/
    return (
      <div>
        <Input type="textarea" className="imagedescription" value={imageInfo.description} />
      </div>
    )

  }

  handleTabsSwitch(key) {
    this.setState({
      activeKey: key.toString()
    })
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
    const { imageType, UpgradeVisible } = this.props
    if (!imageInfo) {
      return ('')
    }
    const imageDetail = this.props.config;
    const scope = this;
    const ipAddress = this.props.server;
    const imageName = imageDetail.name;
    let pullCode = "docker pull " + ipAddress + "/" + imageName;
    return (
      <div id="ImageDetailBox">
        <div className="headerBox">
          <div className="imgBox">
            <svg className='appcenterlogo'>
              <use xlinkHref='#appcenterlogo' />
            </svg>
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
                  <FormattedMessage {...menusText.deployImage} />
                </Button>
              </div>
            </div>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        <div className="downloadBox">
          <div className="code">
            <svg className='appcenterdownload' >
              <use xlinkHref='#appcenterdownload' />
            </svg>
            <FormattedMessage {...menusText.downloadImage} />&nbsp;&nbsp;&nbsp;&nbsp;
            <span className="pullCode textoverflow">docker pull {this.props.server}/{imageName}&nbsp;&nbsp;</span>
            <Tooltip title={this.state.copySuccess ? formatMessage(menusText.copySuccess) : formatMessage(menusText.copyBtn)}>
              <svg className='appcentercopy' onClick={this.copyDownloadCode} onMouseLeave={this.returnDefaultTooltip}>
                <use xlinkHref='#appcentercopy' />
              </svg>
            </Tooltip>
            <input className="privateCodeInput" value={pullCode} style={{ position: "absolute", opacity: "0" }} />
          </div>
          <div className="times">
            <svg className='appcenterdownload' >
              <use xlinkHref='#appcenterdownload' />
            </svg>
            {imageDetail[camelize('pull_count')]}
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        <div className="tabBox">
          <Tabs className="itemList" activeKey={this.state.activeKey} onChange={this.handleTabsSwitch}>

            <TabPane tab={formatMessage(menusText.tag)} key="tag"><ImageVersion scope={scope} config={imageDetail} /></TabPane>
            <TabPane tab={formatMessage(menusText.attribute)} key="attr"><Attribute detailInfo={imageInfo} /></TabPane>

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
  return props

  const defaultConfig = {
    isFavourite: 0,
    isFetching: false,
    registry: DEFAULT_REGISTRY
  }

  const { getImageTag, entities, images } = state
  const { imageType } = props
  const { imageTag } = getImageTag
  let imgTag = []
  if (imageTag[DEFAULT_REGISTRY] && imageTag[DEFAULT_REGISTRY][imageName]) {
    imgTag = imageTag[DEFAULT_REGISTRY][imageName].tag || []
  }
  let mirrorScanUrl = ''
  if (images[imageType][DEFAULT_REGISTRY] && images[imageType][DEFAULT_REGISTRY].server) {
    mirrorScanUrl = images[imageType][DEFAULT_REGISTRY].server
  }
  let mirrorSafetyScan = images.mirrorSafetyScan || ''
  let cluster_id = entities.current.cluster.clusterID || ''
  let envEdition = entities.loginUser.info.envEdition || 0
  let mirrorScanstatus = images.mirrorSafetyScanStatus
  return {
    imageInfo,
    registry: DEFAULT_REGISTRY,
    imageName,
    envEdition,
    imgTag,
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
  loadImageDetailTag,
})(injectIntl(ImageDetailBox, {
  withRef: true,
}));