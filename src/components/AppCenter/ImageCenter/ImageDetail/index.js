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
import { Tabs, Button, Card,Switch , Menu, Tooltip ,Icon, message} from 'antd'
import { Link} from 'react-router'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { imageStore, imageSwitch ,loadPublicImageList , loadFavouriteList , loadPrivateImageList, updateImageinfo} from '../../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../../constants'
import ImageVersion from './ImageVersion.js'
import DetailInfo from './DetailInfo'
import DockerFile from './Dockerfile'
import Attribute from './Attribute'
import './style/ImageDetailBox.less'

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
      copySuccess: false
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
      nextPorps : nextPorps.imageInfo,
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
    this.props.imageStore(config, {
      success: {
        func: ()=>{
          message.success('更新成功！')
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

    key ? isPrivate =0 : isPrivate =1
    const config = {
      isPrivate,
      registry: DEFAULT_REGISTRY,
      image,
      // myfavourite: favourite,
    }
    const scope = this
    this.props.imageSwitch(config, {
      success: {
        func: ()=>{
          message.success('更新成功！')
          switch(imageSpace) {
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

  render() {
    const { formatMessage } = this.props.intl;
    const imageInfo = this.props.imageInfo || {'detailMarkdown': ''}
    const imageDetail = this.props.config;
    const scope = this;
    const ipAddress = this.props.server;
    const imageName = this.state.imageDetail.name;
    let pullCode = "docker pull " + ipAddress + "/" + imageName;
    return (
      <div id="ImageDetailBox">
        <div className="headerBox">
          <div className="imgBox">
            <img src="/img/default.png" />
          </div>
          <div className="infoBox">
            <p className="imageName">{imageDetail.name ? imageDetail.name : imageDetail.imageName}</p>
            <div className="leftBox">
              <p className="imageUrl">{imageDetail.description ? imageDetail.description : imageDetail.imageName}</p>
              <span className="type">
              <FormattedMessage {...menusText.type} />
              { (imageInfo.isOwner) ?
                <Switch onChange={this.isSwitch} checked={(imageInfo.isPrivate == 0) ? true: false} checkedChildren={formatMessage(menusText.pubilicType) } unCheckedChildren={formatMessage(menusText.privateType)} />
              :
                <Switch checked={(imageInfo.isPrivate ==0) ? true: false} disabled={true} defaultChecked="true" checkedChildren={formatMessage(menusText.pubilicType) } unCheckedChildren={formatMessage(menusText.privateType)} />
              }
             </span>
            </div>
            <div className="rightBox">
              <Icon type='cross' className='cursor' style={{fontSize: '18px',position: 'absolute', top:'0px', right:'0px'}} onClick={this.props.scope.closeImageDetailModal} />
              <Button size="large" type="primary">
                <Link to={`/app_manage/app_create/fast_create?registryServer=${ipAddress}&imageName=${imageName}`}>
                <FormattedMessage {...menusText.deployImage} />
                </Link>
              </Button>
            { ( imageInfo.isFavourite == 1) ?
              <Button size="large" type="ghost" onClick={ ()=>this.setimageStore(imageInfo.name, '0') }>
                <Icon type="star" />
                <FormattedMessage {...menusText.closeImage} />
              </Button>
              :
              <Button size="large" type="ghost" onClick={ ()=>this.setimageStore(imageInfo.name, '1') }>
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
            <i className="fa fa-download"></i>&nbsp;
          <FormattedMessage {...menusText.downloadImage} />&nbsp;&nbsp;&nbsp;&nbsp;
           <span className="pullCode textoverflow">docker pull {this.props.server}/{imageName}&nbsp;&nbsp;</span>
            <Tooltip title={this.state.copySuccess ? formatMessage(menusText.copySuccess) : formatMessage(menusText.copyBtn)}>
              <i className="fa fa-copy" onClick={this.copyDownloadCode} onMouseLeave={this.returnDefaultTooltip}></i>
            </Tooltip>
            <input className="privateCodeInput" defaultValue={pullCode} style={{ position: "absolute", opacity: "0" }} />
          </div>
          <div className="times">
            <i className="fa fa-cloud-download"></i>&nbsp;&nbsp;
          {imageDetail.downloadNumber}
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        <div className="tabBox">
          <Tabs className="itemList" defaultActiveKey="1">
            <TabPane tab={formatMessage(menusText.info)} key="1"><DetailInfo detailInfo={imageInfo.detailMarkdown} isOwner={imageInfo.isOwner}/></TabPane>
            <TabPane tab="DockerFile" key="2"><DockerFile isFetching = {this.props.isFetching} dockerfile={imageInfo.dockerfile} isOwner={imageInfo.isOwner} /></TabPane>
            <TabPane tab={formatMessage(menusText.tag)} key="3"><ImageVersion scope={scope} config={imageDetail} /></TabPane>
            <TabPane tab={formatMessage(menusText.attribute)} key="4"><Attribute detailInfo = {imageInfo} /></TabPane>
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
  updateImageinfo
})(injectIntl(ImageDetailBox, {
  withRef: true,
}));