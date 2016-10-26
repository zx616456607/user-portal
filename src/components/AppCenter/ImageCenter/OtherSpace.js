/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * OtherSpace component
 *
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Menu, Button, Card, Input, Modal } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import {deleteOtherImage} from '../../../actions/app_center'


import "./style/OtherSpace.less"
import ImageDetailBox from './ImageDetail/Index.js'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const ButtonGroup = Button.Group

const menusText = defineMessages({
  search: {
    id: 'AppCenter.ImageCenter.OtherSpace.search',
    defaultMessage: '搜索',
  },
  belong: {
    id: 'AppCenter.ImageCenter.OtherSpace.belong',
    defaultMessage: '所属空间：',
  },
  imageUrl: {
    id: 'AppCenter.ImageCenter.OtherSpace.imageUrl',
    defaultMessage: '镜像地址：',
  },
  downloadNum: {
    id: 'AppCenter.ImageCenter.OtherSpace.downloadNum',
    defaultMessage: '下载次数：',
  },
  deployService: {
    id: 'AppCenter.ImageCenter.OtherSpace.deployService',
    defaultMessage: '部署服务',
  },
  logout: {
    id: 'AppCenter.ImageCenter.OtherSpace.logout',
    defaultMessage: '注销',
  },
})

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  showImageDetail: function (id) {
    //this function for user select image and show the image detail info
    //  const scope = this.props.scope;
    //  scope.setState({
    //   imageDetailModalShow:true,
    //   currentImage:id
    //  });
  },
  render: function () {
    let config = this.props.config;
    if (!config) return
    let items = config.map((item) => {
      return (
        <div className="imageDetail" key={item} >
          <div className="imageBox">
            <img src="/img/test/github.jpg" />
          </div>
          <div className="contentBox">
            <span className="title" onClick={this.showImageDetail.bind(this, item)}>
              {item}
            </span><br />
            <span className="type">
              <FormattedMessage {...menusText.belong} />&nbsp;私有
            </span>
            <span className="imageUrl">
              <FormattedMessage {...menusText.imageUrl} />&nbsp;
            <span className="">{this.props.registryServer}/{item}</span>
            </span>

          </div>
          <div className="btnBox">
            <Button type="ghost">
              <FormattedMessage {...menusText.deployService} />
            </Button>
          </div>
        </div>
      );
    });
    return (
      <div className="imageList">
        {items}
      </div>
    );
  }
});

class OtherSpace extends Component {
  constructor(props) {
    super(props);
    this.closeImageDetailModal = this.closeImageDetailModal.bind(this);
    this.state = {
      currentImage: null,
      imageDetailModalShow: false
    }
  }

  closeImageDetailModal() {
    //this function for user close the modal of image detail info
    this.setState({
      imageDetailModalShow: false
    });
  }

  render() {
    const { formatMessage } = this.props.intl;
    const rootscope = this.props.scope;
    const scope = this;
    console.log(this.props.imageId)
    return (
      <QueueAnim className="OtherSpace"
        type="right"
        >
        <div id="OtherSpace" key="OtherSpace">
          <Card className="OtherSpaceCard">
            <div className="operaBox">
              <div className="infoBox">
                <div className="url">
                  <i className="fa fa-link"></i>&nbsp;&nbsp;
                    {this.props.registryServer}
                  </div>
                
              </div>
              <Button className="logout" size="large" type="ghost" onClick={()=>this.props.deleteOtherImage(this.props.imageId)}>
                <FormattedMessage {...menusText.logout} />
              </Button>
              <Input className="searchBox" placeholder={formatMessage(menusText.search)} type="text" />
              <i className="fa fa-search"></i>
              <div style={{ clear: "both" }}></div>
            </div>
            <MyComponent scope={scope} registryServer={this.props.registryServer} config={this.props.config} />
          </Card>
        </div>
        <Modal
          visible={this.state.imageDetailModalShow}
          className="AppServiceDetail"
          transitionName="move-right"
          onCancel={this.closeImageDetailModal}
          >
          <ImageDetailBox scope={scope} config={this.state.currentImage} />
        </Modal>
      </QueueAnim>
    )
  }
}

OtherSpace.propTypes = {
  intl: PropTypes.object.isRequired
}
function mapStateToProps(state, props) {
  const defaultPrivateImages = {
    isFetching: false,
    imageList: []
  }
  const defaultConfig = {
    isFetching: false,
    imageInfo: {dockerfile:'', detailMarkdown:''}
  }
  const { privateImages, imagesInfo } = state.images
  const { imageList, isFetching } = privateImages || defaultPrivateImages
  const { imageInfo } = imagesInfo || defaultConfig

  return {
    imageList,
    isFetching,
    imageInfo
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadPrivateImageList: () => {
      dispatch(loadPrivateImageList())
    },
    getImageDetailInfo :(obj, callback)=> {
      dispatch(getImageDetailInfo(obj, callback))
    },
    deleteOtherImage: (id, callback)=> {
      dispatch(deleteOtherImage(id,callback))
    }
  }
}
export default connect(mapStateToProps,mapDispatchToProps)(injectIntl(OtherSpace, {
  withRef: true,
}))