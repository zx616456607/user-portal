/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * PublicSpace component
 *
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Alert, Menu, Button, Card, Input, Tooltip, Modal, Spin } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadPublicImageList ,getImageDetailInfo} from '../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../constants'
import "./style/PublicSpace.less"
import ImageDetailBox from './ImageDetail/Index.js'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const ButtonGroup = Button.Group

const menusText = defineMessages({
  search: {
    id: 'AppCenter.ImageCenter.PublicSpace.search',
    defaultMessage: '搜索',
  },
  belong: {
    id: 'AppCenter.ImageCenter.PublicSpace.belong',
    defaultMessage: '所属空间：',
  },
  imageUrl: {
    id: 'AppCenter.ImageCenter.PublicSpace.imageUrl',
    defaultMessage: '镜像地址：',
  },
  downloadNum: {
    id: 'AppCenter.ImageCenter.PublicSpace.downloadNum',
    defaultMessage: '下载次数：',
  },
  deployService: {
    id: 'AppCenter.ImageCenter.PublicSpace.deployService',
    defaultMessage: '部署服务',
  },
  tooltips: {
    id: 'AppCenter.ImageCenter.PublicSpace.tooltips',
    defaultMessage: '公共镜像 —— 企业成员可以将在镜像空间内设置的私有镜像，一键开放为企业所有人可见的公共镜像，可以实现跨团队，共享容器镜像服务，实现企业内部高效开发协作的容器镜像PaaS平台。',
  }
})

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.object,
    scope: React.PropTypes.object
  },
  showImageDetail: function (id) {
    //  this function for user select image and show the image detail info
    // console.log(id)
    const scope = this.props.scope;
    scope.setState({
      imageDetailModalShow: true,
      currentImage: id
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
    const { loading } = this.props;
    let { imageList, serviceIp } = this.props.config;
    if (loading) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    let items = imageList.map((item) => {
      return (
        <div className="imageDetail" key={item.name} >
          <div className="imageBox">
            <img src="/img/test/github.jpg" />
          </div>
          <div className="contentBox">
            <span className="title" onClick={this.showImageDetail.bind(this, item)}>
              {item.name}
            </span><br />
            <span className="type">
              <FormattedMessage {...menusText.belong} />&nbsp;
              {item.contributor}
            </span>
            <span className="imageUrl textoverflow">
              <span className="defalutColor"><FormattedMessage {...menusText.imageUrl} />&nbsp;</span>
              <Tooltip placement="topLeft" title={serviceIp + "/" + item.name}>
                <span>{serviceIp + "/" + item.name}</span>
              </Tooltip>
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

class PublicSpace extends Component {
  constructor(props) {
    super(props);
    this.closeImageDetailModal = this.closeImageDetailModal.bind(this);
    this.state = {
      currentImage: null,
      imageDetailModalShow: false,
      imageInfo: ''
    }
  }

  componentWillMount() {
    document.title = '公有镜像 | 时速云';
    const { registry, loadPublicImageList } = this.props
    loadPublicImageList(registry)
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
    const { isFetching } = this.props;
    const scope = this;
    const config = {
      "imageList": this.props.publicImageList,
      "serviceIp": this.props.registryServer
    };
    return (
      <QueueAnim className="PublicSpace"
        type="right"
        >
        <div id="PublicSpace" key="PublicSpace">
          <Alert message={<FormattedMessage {...menusText.tooltips} />} type="info" />
          <Card className="PublicSpaceCard">
            <div className="operaBox">
              <Input className="searchBox" placeholder={formatMessage(menusText.search)} type="text" />
              <i className="fa fa-search"></i>
              <div style={{ clear: "both" }}></div>
            </div>
            <MyComponent scope={scope} getImageDetailInfo={(obj,callback)=> this.props.getImageDetailInfo(obj,callback)} loading={isFetching} config={config} />
          </Card>
        </div>
        <Modal
          visible={this.state.imageDetailModalShow}
          className="AppServiceDetail"
          transitionName="move-right"
          onCancel={this.closeImageDetailModal}
          >
          {/* right detail box  */}
          <ImageDetailBox scope={scope} imageInfo={this.state.imageInfo} config={this.state.currentImage} />
        </Modal>
      </QueueAnim>
    )
  }
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
  const { publicImages, imagesInfo } = state.images
  const { registry, imageList, isFetching, server } = publicImages[DEFAULT_REGISTRY] || defaultPublicImages
  const { imageInfo } = imagesInfo[DEFAULT_REGISTRY] || defaultConfig

  return {
    registry,
    registryServer: server,
    publicImageList: imageList,
    isFetching,
    imageInfo
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadPublicImageList: (registry) => {
      dispatch(loadPublicImageList(registry))
    },
    getImageDetailInfo :(obj, callback)=> {
      dispatch(getImageDetailInfo(obj, callback))
    },
  }
}

PublicSpace.propTypes = {
  intl: PropTypes.object.isRequired,
  loadPublicImageList: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  getImageDetailInfo: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps )(injectIntl(PublicSpace, {
  withRef: true,
}));