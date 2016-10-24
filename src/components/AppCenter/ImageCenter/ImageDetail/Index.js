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
import { Switch, Tabs, Button, Card, Menu, Tooltip } from 'antd'
import { Link} from 'react-router'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import ImageVersion from './ImageVersion.js'
import DetailInfo from './DetailInfo.js'
import DockerFile from './Dockerfile.js'
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
    defaultMessage: '私有',
  },
  colletctImage: {
    id: 'AppCenter.ImageCenter.ImageDetail.colletctImage',
    defaultMessage: '收藏镜像',
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
      imageDetail: nextPorps.config
    });
  }

  copyDownloadCode() {
    //this function for user click the copy btn and copy the download code
    const scope = this;
    let code = document.getElementsByClassName("pullCodeInput");
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

  render() {
    const { formatMessage } = this.props.intl;
    const {imageInfo} = this.props
    const imageDetail = this.props.config;
    const scope = this;
    const ipAddress = this.props.scope.props.registryServer;
    const imageName = this.state.imageDetail.name;
    let pullCode = "docker pull " + ipAddress + "/" + imageName;
    return (
      <div id="ImageDetailBox">
        <div className="headerBox">
          <div className="imgBox">
            <img src="/img/test/github.jpg" />
          </div>
          <div className="infoBox">
            <p className="imageName">{imageDetail.name ? imageDetail.name : imageDetail.imageName}</p>
            <div className="leftBox">
              <p className="imageUrl">{imageDetail.description ? imageDetail.description : imageDetail.imageName}</p>
              <span className="type"><FormattedMessage {...menusText.type} /></span>
              <Switch style={{float: 'left'}} checked={imageDetail.isPrivate == 0 ? true : false} checkedChildren={formatMessage(menusText.pubilicType)} unCheckedChildren={formatMessage(menusText.privateType)} />
            </div>
            <div className="rightBox">
              <Button size="large" type="primary">
                <FormattedMessage {...menusText.deployImage} />
              </Button>
              <Button size="large" type="ghost">
                <i className="fa fa-star-o"></i>&nbsp;
                <FormattedMessage {...menusText.colletctImage} />
              </Button>
            </div>
            <i className="closeBtn fa fa-times" onClick={this.props.scope.closeImageDetailModal}></i>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        <div className="downloadBox">
          <div className="code">
            <i className="fa fa-download"></i>&nbsp;
          <FormattedMessage {...menusText.downloadImage} />&nbsp;&nbsp;&nbsp;&nbsp;
           <span className="pullCode">docker pull {ipAddress}/{imageName}&nbsp;&nbsp;</span>
            <Tooltip title={this.state.copySuccess ? formatMessage(menusText.copySuccess) : formatMessage(menusText.copyBtn)} getTooltipContainer={() => document.getElementById("ImageDetailBox")}>
              <i className="fa fa-copy" onClick={this.copyDownloadCode} onMouseLeave={this.returnDefaultTooltip}></i>
            </Tooltip>
            <input className="pullCodeInput" defaultValue={pullCode} style={{ position: "absolute", opacity: "0" }} />
          </div>
          <div className="times">
            <i className="fa fa-cloud-download"></i>&nbsp;&nbsp;
          {imageDetail.downloadNumber}
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        <div className="tabBox">
          <Tabs className="itemList" defaultActiveKey="1">
            <TabPane tab={formatMessage(menusText.info)} key="1"><DetailInfo detailInfo={imageInfo.detailMarkdown} /></TabPane>
            <TabPane tab="DockerFile" key="2"><DockerFile isFetching = {this.props.isFetching} dockerfile={imageInfo.dockerfile} /></TabPane>
            <TabPane tab={formatMessage(menusText.tag)} key="3"><ImageVersion scope={scope} config={imageDetail} /></TabPane>
            <TabPane tab={formatMessage(menusText.attribute)} key="4">Conten of Tab Pane 3</TabPane>
          </Tabs>
        </div>
      </div>
    )
  }
}

ImageDetailBox.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect()(injectIntl(ImageDetailBox, {
  withRef: true,
}));