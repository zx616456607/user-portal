/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * MyCollection component
 *
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Alert, Menu, Button, Card, Spin,Input, Modal } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadFavouriteList, getImageDetailInfo} from '../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../constants'

import "./style/MyCollection.less"
import ImageDetailBox from './ImageDetail/Index.js'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const ButtonGroup = Button.Group

const menusText = defineMessages({
  search: {
    id: 'AppCenter.ImageCenter.MyCollection.search',
    defaultMessage: '搜索',
  },
  belong: {
    id: 'AppCenter.ImageCenter.MyCollection.belong',
    defaultMessage: '所属空间：',
  },
  imageUrl: {
    id: 'AppCenter.ImageCenter.MyCollection.imageUrl',
    defaultMessage: '镜像地址：',
  },
  downloadNum: {
    id: 'AppCenter.ImageCenter.MyCollection.downloadNum',
    defaultMessage: '下载次数：',
  },
  deployService: {
    id: 'AppCenter.ImageCenter.MyCollection.deployService',
    defaultMessage: '部署服务',
  },
  tooltips: {
    id: 'AppCenter.ImageCenter.MyCollection.tooltips',
    defaultMessage: '我的收藏 —— 您可以将任意可见的镜像空间内的镜像，一键收藏到我的收藏，便捷的管理常用容器镜像。',
  }
})

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  showImageDetail: function (id) {
    //this function for user select image and show the image detail info
     const scope = this.props.scope;
     scope.setState({
      imageDetailModalShow:true,
      currentImage:id
     });
    const fullgroup={registry: DEFAULT_REGISTRY, fullName: id.name}
    this.props.getImageDetailInfo(fullgroup, {
      success: {
        func: (res)=> {
          scope.setState({
            imageInfo: res.data
          })
        }
      }
    })
  },
  render: function () {
    let config = this.props.config;
    const {isFetching } = this.props
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    let items = config.map((item) => {
      return (
        <div className="imageDetail" key={item.id} >
          <div className="imageBox">
            <img src={item.icon =='default' ?  '/img/test/github.jpg' : item.icon} />
          </div>
          <div className="contentBox">
            <span className="title" onClick={this.showImageDetail.bind(this, item)}>
              {item.name}
            </span><br />
            <span className="type">
              <FormattedMessage {...menusText.belong} />&nbsp;
              {item.type}
            </span>
            <span className="imageUrl textoverflow">
              <FormattedMessage {...menusText.imageUrl} />&nbsp;
              <span className="">{item.name}</span>
            </span>
            <span className="downloadNum">
              <FormattedMessage {...menusText.downloadNum} />&nbsp;{item.downloadNumber}
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

class MyCollection extends Component {
  constructor(props) {
    super(props);
    this.closeImageDetailModal = this.closeImageDetailModal.bind(this);
    this.state = {
      currentImage: null,
      imageDetailModalShow: false
    }
  }
  componentWillMount() {
    document.title = '我的收藏 | 时速云';
    const { loadFavouriteList } = this.props
    loadFavouriteList(DEFAULT_REGISTRY)
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
    const imageList = this.props.fockImageList
    return (
      <QueueAnim className="MyCollection"
        type="right"
        >
        <div id="MyCollection" key="MyCollection">
          <Alert message={<FormattedMessage {...menusText.tooltips} />} type="info" />
          <Card className="MyCollectionCard">
            <div className="operaBox">
              <Input className="searchBox" placeholder={formatMessage(menusText.search)} type="text" />
              <i className="fa fa-search"></i>
              <div style={{ clear: "both" }}></div>
            </div>
            <MyComponent scope={scope} isFetching={this.props.isFetching} getImageDetailInfo={(obj,callback)=> this.props.getImageDetailInfo(obj,callback)} config={imageList} />
          </Card>
        </div>
        <Modal
          visible={this.state.imageDetailModalShow}
          className="AppServiceDetail"
          transitionName="move-right"
          onCancel={this.closeImageDetailModal}
          >
          <ImageDetailBox scope={scope} imageInfo={this.state.imageInfo} config={this.state.currentImage} />
        </Modal>
      </QueueAnim>
    )
  }
}

MyCollection.propTypes = {
  intl: PropTypes.object.isRequired
}
function mapStateToProps(state, props) {
  const defaultPublicImages = {
    isFetching: false,
    registry: DEFAULT_REGISTRY,
    imageList: []
  }
  const defaultConfig = {
    isFetching: false,
    imageInfo: {dockerfile:'', detailMarkdown:''}
  }
  const { fockImages, imagesInfo } = state.images
  const { registry, imageList, isFetching, server } = fockImages[DEFAULT_REGISTRY] || defaultPublicImages
  const { imageInfo } = imagesInfo[DEFAULT_REGISTRY] || defaultConfig

  return {
    registry,
    registryServer: server,
    fockImageList: imageList,
    isFetching,
    imageInfo
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadFavouriteList: (registry) => {
      dispatch(loadFavouriteList(registry))
    },
    getImageDetailInfo :(obj, callback)=> {
      dispatch(getImageDetailInfo(obj, callback))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(MyCollection, {
  withRef: true,
}))