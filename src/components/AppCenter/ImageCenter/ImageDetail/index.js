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
import { Tabs, Button, Card, Switch, Menu, Tooltip, Icon, Input } from 'antd'
import { Link ,browserHistory} from 'react-router'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { imageStore, imageSwitch, loadPublicImageList, loadFavouriteList, loadPrivateImageList, updateImageinfo, getImageDetailInfo } from '../../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../../constants'
import ImageVersion from './ImageVersion.js'
import DetailInfo from './DetailInfo'
import DockerFile from './Dockerfile'
import Attribute from './Attribute'
import './style/ImageDetailBox.less'
import NotificationHandler from '../../../../common/notification_handler'

const TabPane = Tabs.TabPane;

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
    this.isSwitch = this.isSwitch.bind(this)
    this.state = {
      imageDetail: null,
      copySuccess: false,
      editInfo: false
    }
  }

  componentWillMount() {
    const imageDetail = this.props.config;
    const imageInfo = this.props.imageInfo
    this.setState({
      imageDetail: imageDetail,
      imageInfo: imageInfo
    });
  }

  componentWillReceiveProps(nextPorps) {
    //this function for user select different image
    //the nextProps is mean new props, and the this.props didn't change
    //so that we should use the nextProps
    this.setState({
      nextPorps: nextPorps.imageInfo,
      imageDetail: nextPorps.config
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
  setimageStore(image, favourite) {
    // let isPrivate = this.props.imageInfo.isPrivate;
    const config = {
      isFavourite: favourite,
      registry: DEFAULT_REGISTRY,
      // isPrivate,
      image
    }
    const scope = this
    const imageSpace = this.props.parentScope.state.current
    let notification = new NotificationHandler()
    this.props.imageStore(config, {
      success: {
        func: () => {
          notification.success('更新成功！')
          scope.props.loadFavouriteList(DEFAULT_REGISTRY)
        },
        isAsync: true
      }
    })
  }
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
        func: ()=> {
          notification.success('更新成功！')
          getImageDetailInfo(config)
          _this.setState({editInfo: false})
        },
        isAsync: true
      }
    })
  }
  imageDescription(imageInfo) {
    if (this.state.editInfo) {
      return (
        <div>
          <Input type="textarea" id="editInfo" className="imagedescription"/>
          <FormattedMessage {...menusText.type} />
          <Switch checked={(imageInfo.isPrivate == 0) ? true : false} disabled={!imageInfo.isOwner} defaultChecked="true" checkedChildren={<FormattedMessage {...menusText.pubilicType} />} unCheckedChildren={<FormattedMessage {...menusText.privateType} /> } />
          <span style={{float:'right'}}>
            <Button  onClick={()=> this.setState({editInfo: false})}>取消</Button>
            <Button  onClick={()=> this.handChangeInfo()} type="primary">保存</Button>
          </span>
        </div>
      )
    }
    return (
      <div>
        <Input type="textarea" disabled={true} className="imagedescription" value={imageInfo.description} />
        <div>
          <FormattedMessage {...menusText.type} />
          <Switch onChange={this.isSwitch} checked={(imageInfo.isPrivate == 0) ? true : false} disabled={!imageInfo.isOwner} checkedChildren={<FormattedMessage {...menusText.pubilicType } />} unCheckedChildren={<FormattedMessage {...menusText.privateType} />} />
          {imageInfo.isOwner ?
          <Button icon="edit" style={{float:'right'}} onClick={()=> this.setState({editInfo: true})}>编辑</Button>
          :null
          }
        </div>
      </div>
    )

  }
  render() {
    const { formatMessage } = this.props.intl;
    const imageInfo = this.props.imageInfo
    if (!imageInfo) {
      return ('')
    }
    const imageDetail = this.props.config;
    const scope = this;
    const ipAddress = this.props.server;
    const imageName = this.state.imageDetail.name;
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
            <p className="imageName">{imageDetail.name ? imageDetail.name : imageDetail.imageName}</p>
            <div className="leftBox">

              {this.imageDescription(imageInfo) }

              {/*<span className="type">
                <FormattedMessage {...menusText.type} />
                {(imageInfo.isOwner) ?
                  <Switch onChange={this.isSwitch} checked={(imageInfo.isPrivate == 0) ? true : false} checkedChildren={formatMessage(menusText.pubilicType)} unCheckedChildren={formatMessage(menusText.privateType)} />
                  :
                  <Switch checked={(imageInfo.isPrivate == 0) ? true : false} disabled={true} defaultChecked="true" checkedChildren={formatMessage(menusText.pubilicType)} unCheckedChildren={formatMessage(menusText.privateType)} />
                }
              </span>*/}
            </div>
            <div className="rightBox">
              <Icon type='cross' className='cursor' style={{ fontSize: '18px', position: 'absolute', top: '0px', right: '0px' }} onClick={this.props.scope.closeImageDetailModal} />
              <Button size="large" type="primary" onClick={()=>browserHistory.push(`/app_manage/app_create/fast_create?registryServer=${ipAddress}&imageName=${imageName}`)}>
                  <FormattedMessage {...menusText.deployImage} />
              </Button>
              {(imageInfo.isFavourite == 1) ?
                <Button size="large" type="ghost" onClick={() => this.setimageStore(imageInfo.name, '0')}>
                  <Icon type="star" />
                  <FormattedMessage {...menusText.closeImage} />
                </Button>
                :
                <Button size="large" type="ghost" onClick={() => this.setimageStore(imageInfo.name, '1')}>
                  <Icon type="star-o" />
                  <FormattedMessage {...menusText.colletctImage} />
                </Button>
              }

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
            {imageDetail.downloadNumber}
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        <div className="tabBox">
          <Tabs className="itemList" defaultActiveKey="1">
            <TabPane tab={formatMessage(menusText.info)} key="1"><DetailInfo scope={this} registry={DEFAULT_REGISTRY} detailInfo={imageInfo} isOwner={imageInfo.isOwner} /></TabPane>
            <TabPane tab="Dockerfile" key="2"><DockerFile isFetching={this.props.isFetching} scope={this} registry={DEFAULT_REGISTRY} detailInfo={imageInfo} isOwner={imageInfo.isOwner} /></TabPane>
            <TabPane tab={formatMessage(menusText.tag)} key="3"><ImageVersion scope={scope} config={imageDetail} /></TabPane>
            <TabPane tab={formatMessage(menusText.attribute)} key="4"><Attribute detailInfo={imageInfo} /></TabPane>
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
    isFavourite: 0,
    isFetching: false,
    registry: DEFAULT_REGISTRY
  }
  const { imagesInfo } = state.images
  const { imageInfo } = imagesInfo[DEFAULT_REGISTRY] || defaultConfig

  return {
    imageInfo,
    registry: DEFAULT_REGISTRY
  }
}

// function mapDispatchToProps(dispatch) {
//   return {
//     imageStore: (obj, callback) => {
//       dispatch(imageStore(obj, callback))
//     },
//     imageSwitch: (obj, callback) => {
//       dispatch(imageSwitch(obj, callback))
//     },
//     loadPrivateImageList: (DEFAULT_REGISTRY) => {
//       dispatch(loadPrivateImageList(DEFAULT_REGISTRY))
//     },
//     loadPublicImageList: (registry) => {
//       dispatch(loadPublicImageList(registry))
//     },
//     loadFavouriteList: (registry) =>{
//       dispatch(loadFavouriteList(registry))
//     }
//   }
// }

export default connect(mapStateToProps, {
  imageStore,
  imageSwitch,
  loadPrivateImageList,
  loadPublicImageList,
  loadFavouriteList,
  updateImageinfo,
  getImageDetailInfo
})(injectIntl(ImageDetailBox, {
  withRef: true,
}));