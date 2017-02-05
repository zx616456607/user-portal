/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageSpace component
 *
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Menu, Button, Card, Input, Dropdown, Spin, Modal, message} from 'antd'
import { Link ,browserHistory} from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadPrivateImageList, getImageDetailInfo, deleteImage, checkImage, searchPrivateImages } from '../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../constants'
import "./style/ImageSpace.less"
import ImageDetailBox from './ImageDetail'
import NotificationHandler from '../../../common/notification_handler'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const ButtonGroup = Button.Group

const menusText = defineMessages({
  search: {
    id: 'AppCenter.ImageCenter.ImageSpace.search',
    defaultMessage: '搜索',
  },
  publicType: {
    id: 'AppCenter.ImageCenter.ImageSpace.publicType',
    defaultMessage: '公有',
  },
  privateType: {
    id: 'AppCenter.ImageCenter.ImageSpace.privateType',
    defaultMessage: '私有',
  },
  delete: {
    id: 'AppCenter.ImageCenter.ImageSpace.delete',
    defaultMessage: '删除',
  },
  type: {
    id: 'AppCenter.ImageCenter.ImageSpace.type',
    defaultMessage: '类型：',
  },
  imageUrl: {
    id: 'AppCenter.ImageCenter.ImageSpace.imageUrl',
    defaultMessage: '镜像地址：',
  },
  deployService: {
    id: 'AppCenter.ImageCenter.ImageSpace.deployService',
    defaultMessage: '部署服务',
  },
  uploadImage: {
    id: 'AppCenter.ImageCenter.ImageSpace.uploadImage',
    defaultMessage: '上传镜像',
  },
  uploadImageFirstTips: {
    id: 'AppCenter.ImageCenter.ImageSpace.uploadImageFirstTips',
    defaultMessage: '在本地 docker 环境中输入以下命令进行登录',
  },
  uploadImageSecondTips: {
    id: 'AppCenter.ImageCenter.ImageSpace.uploadImageSecondTips',
    defaultMessage: '然后，对本地需要 push 的 image 进行标记，比如：',
  },
  uploadImageThirdTips: {
    id: 'AppCenter.ImageCenter.ImageSpace.uploadImageThirdTips',
    defaultMessage: '最后在命令行输入如下命令，就可以 push 这个 image 到镜像仓库中了',
  },
  downloadImage: {
    id: 'AppCenter.ImageCenter.ImageSpace.downloadImage',
    defaultMessage: '下载镜像',
  },
  downloadImageFirstTips: {
    id: 'AppCenter.ImageCenter.ImageSpace.downloadImageFirstTips',
    defaultMessage: '在本地 docker 环境中输入以下命令，就可以 pull 一个镜像到本地了',
  },
  downloadImageSecondTips: {
    id: 'AppCenter.ImageCenter.ImageSpace.downloadImageSecondTips',
    defaultMessage: '私有镜像需要先 login 后才能拉取',
  },
  downloadImageThirdTips: {
    id: 'AppCenter.ImageCenter.ImageSpace.downloadImageThirdTips',
    defaultMessage: '为了在本地方便使用，下载后可以修改<tag>为短标签，比如：',
  },
  downloadNum: {
    id: 'AppCenter.ImageCenter.PublicSpace.downloadNum',
    defaultMessage: '下载次数：',
  },
})

const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  getInitialState() {
    return {delModal: false}
  },
  btnDeleteImage: function () {
    //this function for user delete select imagex
    const {deleteImage} = this.props.scope.props
    const config = {
      registry: DEFAULT_REGISTRY,
      image: this.state.imageName
    }
    this.setState({delModal: false})
    let notification = new NotificationHandler()
    notification.spin(`删除镜像 ${this.state.imageName} 中...`)
    deleteImage(config, {
      success: {
        func: () => {
          notification.close()
          notification.success('删除成功！')
        }
      },
      failed: {
        func: (res) => {
          notification.close()
          notification.error('删除失败')
        }
      }
    })

  },
  componentWillMount() {
    const imagename = location.search.split('imageName=')[1]
    if (imagename !== '' && imagename !== undefined) {
      const scope = this.props.scope;
      const config = {
        registry: DEFAULT_REGISTRY,
        image: imagename
      }
      scope.setState({
        privateDetailModal: true,
        currentImage: this.props.imageInfo
      });
      scope.props.checkImage(config, {
        success: {
          func: (res) => {
            if (res.data.hasOwnProperty('status') && res.data.status == 404) {
              let notification = new NotificationHandler()
              notification.warn('所查看的镜像不存在')
              return
            }
          }
        }
      })
      this.setState({
        imageInfo: this.props.imageInfo
      })
    }
  },
  showImageDetail: function (id) {
    //this function for user select image and show the image detail info
    const scope = this.props.scope;
    scope.setState({
      privateDetailModal: true,
      currentImage: id
    });
    const fullgroup = { registry: DEFAULT_REGISTRY, fullName: id.name }
    this.props.getImageDetailInfo(fullgroup, {
      success: {
        func: (res) => {
          scope.setState({
            imageInfo: res.data
          })
        }
      }
    })
  },
  render: function () {
    const { registryServer, imageList, isFetching} = this.props
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (imageList.length === 0) {
      return (
        <div style={{ lineHeight: '20px', height: '60px', paddingLeft: '30px' }}>您还没有私有镜像，去创建一个吧！</div>
      )
    }
    let items = imageList.map((item, index) => {
      const dropdown = (
        <Menu onClick={()=> this.setState({delModal: true, imageName: item.name})}
          style={{ width: "100px" }}
          >
          <Menu.Item key={item.id}>
            <FormattedMessage {...menusText.delete} />
          </Menu.Item>
        </Menu>
      );
      return (
        <div className="imageDetail" key={`${item.name}-${index}`} >
          <div className="imageBox">
            <svg className='appcenterlogo'>
              <use xlinkHref='#appcenterlogo' />
            </svg>
          </div>
          <div className="contentBox">
            <span className="title" onClick={this.showImageDetail.bind(this, item)}>
              {item.name}
            </span><br />
            <span className="type">
              <FormattedMessage {...menusText.type} />&nbsp;&nbsp;&nbsp;
                {item.isPrivate == "0" ? [
                <span key={item.id + "unlock"}><svg className='cicdpublic'><use xlinkHref='#cicdpublic' /></svg>&nbsp;<FormattedMessage {...menusText.publicType} /></span>]
                :
                [<span key={item.id + "lock"}><svg className='cicdprivate'><use xlinkHref='#cicdprivate' /></svg>&nbsp;<FormattedMessage {...menusText.privateType} /></span>]
              }
            </span>
            <span className="imageUrl textoverflow">
              <FormattedMessage {...menusText.imageUrl} />&nbsp;
              <span className="">{registryServer}/{item.name}</span>
            </span>
            <span className="downloadNum">
              <FormattedMessage {...menusText.downloadNum} />&nbsp;{item.downloadNumber}
            </span>
          </div>
          <div className="btnBox">
            <Dropdown.Button overlay={dropdown} type="ghost" onClick={()=>browserHistory.push(`/app_manage/app_create/fast_create?registryServer=${registryServer}&imageName=${item.name}`)}>
              <FormattedMessage {...menusText.deployService} />
            </Dropdown.Button>
          </div>
        </div>
      );
    });
    return (
      <div className="imageList">
        {items}
        <Modal title="删除镜像操作" visible={this.state.delModal}
          onOk={() => this.btnDeleteImage()} onCancel={() => this.setState({ delModal: false })}
          >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{ marginRight: '8px' }}></i>您确定要删除镜像 {this.state.imageName}?</div>
        </Modal>
      </div>
    );
  }
});

class ImageSpace extends Component {
  constructor(props) {
    super(props);
    this.openUploadModal = this.openUploadModal.bind(this);
    this.closeUploadModal = this.closeUploadModal.bind(this);
    this.openDownloadModal = this.openDownloadModal.bind(this);
    this.closeDownloadModal = this.closeDownloadModal.bind(this);
    this.closeImageDetailModal = this.closeImageDetailModal.bind(this)
    this.state = {
      uploadModalVisible: false,
      downloadModalVisible: false,
      currentImage: null,
      privateDetailModal: false
    }
  }
  componentWillMount() {
    this.props.loadPrivateImageList(DEFAULT_REGISTRY);
  }
  componentWillReceiveProps(nextProps) {
    const { space } = nextProps
    if (space.namespace !== this.props.space.namespace) {
      this.props.loadPrivateImageList(DEFAULT_REGISTRY)
    }
  }
  openUploadModal() {
    //this function for user open the upload image modal
    this.setState({
      uploadModalVisible: true
    });
  }

  closeUploadModal() {
    //this function for user close the upload image modal
    this.setState({
      uploadModalVisible: false
    });
  }

  openDownloadModal() {
    //this function for user open the download image modal
    this.setState({
      downloadModalVisible: true
    });
  }

  closeDownloadModal() {
    //this function for user close the download image modal
    this.setState({
      downloadModalVisible: false
    });
  }

  closeImageDetailModal() {
    //this function for user close the modal of image detail info
    this.setState({
      privateDetailModal: false
    });
  }
  searchImage() {
    const condition = {
      imageName: this.state.imageName || '',
      registry: this.props.registry
    }
    this.props.searchPrivateImages(condition)
  }

  render() {
    const { formatMessage } = this.props.intl;
    const rootscope = this.props.scope;
    const scope = this;
    const { imageList, server, imageInfo} = this.props
    return (
      <QueueAnim className="ImageSpace"
        type="right"
        >
        <div id="ImageSpace" key="ImageSpace">
          <Card className="ImageSpaceCard">
            <div className="operaBox">
              <Button className="uploadBtn" size="large" type="primary" onClick={this.openUploadModal}>
                <svg className='appcenterupload'>
                  <use xlinkHref='#appcenterupload' />
                </svg>
                <FormattedMessage {...menusText.uploadImage} />
              </Button>
              <Button className="downloadBtn" size="large" type="ghost" onClick={this.openDownloadModal}>
                <svg className='appcenterdownload'>
                  <use xlinkHref='#appcenterdownload' />
                </svg>
                <FormattedMessage {...menusText.downloadImage} />
              </Button>
              <span className="searchBox">
                <Input className="searchInput" size="large" placeholder="搜索" type="text" onChange={(e)=> this.setState({imageName: e.target.value})} onPressEnter={()=> this.searchImage()} />
                <i className="fa fa-search" onClick={()=> this.searchImage()}></i>
              </span>
            </div>
            <MyComponent scope={scope} isFetching={this.props.isFetching} imageList={imageList} registryServer={server} imageInfo={imageInfo} getImageDetailInfo={(obj, callback) => this.props.getImageDetailInfo(obj, callback)} />
            <Modal title={<FormattedMessage {...menusText.uploadImage} />} className="uploadImageModal" visible={this.state.uploadModalVisible}
              onCancel={this.closeUploadModal} onOk={this.closeUploadModal}
              >
              <p>1.&nbsp;&nbsp;<FormattedMessage {...menusText.uploadImageFirstTips} /></p>
              <pre className="codeSpan">
                sudo docker login {this.props.server}
              </pre>
              <p>2.&nbsp;&nbsp;<FormattedMessage {...menusText.uploadImageSecondTips} /></p>
              <pre className="codeSpan">
                {`sudo docker tag tenxcloud/ubuntu:latest ${this.props.server}/<username>/<repository>:<tag>`}
              </pre>
              <p>3.&nbsp;&nbsp;<FormattedMessage {...menusText.uploadImageThirdTips} /></p>
              <pre className="codeSpan">
                {`sudo docker push ${this.props.server}/<username>/<repository>:<tag>`}
              </pre>
            </Modal>
            <Modal title={<FormattedMessage {...menusText.downloadImage} />} className="uploadImageModal" visible={this.state.downloadModalVisible}
              onCancel={this.closeDownloadModal} onOk={this.closeDownloadModal}
              >
              <p><FormattedMessage {...menusText.downloadImageFirstTips} /></p>
              <p><i className="fa fa-exclamation-triangle"></i>&nbsp;<FormattedMessage {...menusText.downloadImageSecondTips} /></p>
              <pre className="codeSpan">
                {`sudo docker pull ${this.props.server}/<username>/<repository>:<tag>`}
              </pre>
              <p><i className="fa fa-exclamation-triangle"></i>&nbsp;<FormattedMessage {...menusText.downloadImageThirdTips} /></p>
              <pre className="codeSpan">
                sudo docker tag  {this.props.server}/tenxcloud/hello-world:latst tenxcloud/hello-world:latest
              </pre>
            </Modal>
            <Modal
              visible={this.state.privateDetailModal}
              className="AppServiceDetail"
              transitionName="move-right"
              onCancel={this.closeImageDetailModal}
              >
              {/* right detail box  */}
              <ImageDetailBox parentScope={rootscope} server={this.props.server} scope={scope} imageInfo={this.state.imageInfo} config={this.state.currentImage} />
            </Modal>
          </Card>
        </div>
      </QueueAnim>
    )
  }
}

ImageSpace.propTypes = {
  intl: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
  const defaultPrivateImages = {
    isFetching: false,
    registry: DEFAULT_REGISTRY,
    imageList: [],
    server: ''
  }
  const defaultConfig = {
    isFetching: false,
    imageInfo: { dockerfile: '', detailMarkdown: '' }
  }
  const { privateImages, imagesInfo } = state.images
  const { imageList, isFetching, registry, server} = privateImages[DEFAULT_REGISTRY] || defaultPrivateImages
  const { imageInfo } = imagesInfo[DEFAULT_REGISTRY] || defaultConfig
  const { space } = state.entities.current

  return {
    imageList,
    isFetching,
    imageInfo,
    registry,
    server,
    space,
  }
}

// function mapDispatchToProps(dispatch) {
//   return {
//     loadPrivateImageList: (DEFAULT_REGISTRY) => {
//       dispatch(loadPrivateImageList(DEFAULT_REGISTRY))
//     },
//     getImageDetailInfo :(obj, callback)=> {
//       dispatch(getImageDetailInfo(obj, callback))
//     },

//   }
// }

export default connect(mapStateToProps, {
  loadPrivateImageList,
  getImageDetailInfo,
  deleteImage,
  checkImage,
  searchPrivateImages
})(injectIntl(ImageSpace, {
  withRef: true,
}))