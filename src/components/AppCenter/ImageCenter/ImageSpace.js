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
import { Menu, Button, Card, Input, Dropdown, Spin, Modal, Alert, Icon, Tooltip } from 'antd'
import { Link ,browserHistory} from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadPrivateImageList, getImageDetailInfo, deleteImage, checkImage, searchPrivateImages, AppCenterBindUser, deleteAppCenterBindUser } from '../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../constants'
import "./style/ImageSpace.less"
import ImageDetailBox from './ImageDetail'
import NotificationHandler from '../../../common/notification_handler'
import noBindImg from '../../../assets/img/appCenter/noBind.png'

const mode = require('../../../../configs/model').mode
const standard = require('../../../../configs/constants').STANDARD_MODE
let standardFlag = (mode == standard ? true : false);

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

let NoBind = React.createClass({
  getInitialState() {
    return {
      username: '',
      password: '',
      bindModalConfirmLoading: false,
    }
  },
  onChangeUsername(e) {
    //this function for change the username of state
    this.setState({
      username: e.target.value
    })
    if(e.target.value.length > 0) {
      this.setState({
        usernameError: false
      })
    } else {
      this.setState({
        usernameError: true
      })
    }
  },
  onChangePassword(e) {
    //this function for change the password of state
    this.setState({
      password: e.target.value
    })
    if(e.target.value.length > 0) {
      this.setState({
        passwordError: false
      })
    } else {
      this.setState({
        passwordError: true
      })
    }
  },
  openBindModal() {
    //this function for open bind modal
    const { scope } = this.props;
    scope.setState({
      bindModalShow: true
    });
  },
  closeBindModal() {
    //this function for close bind modal
    const { scope } = this.props;
    this.setState({
      usernameError: false,
      passwordError: false,
      username: '',
      password: ''
    });
    scope.setState({
      bindModalShow: false
    });
  },
  submitBind() {
    //this function for submit bind
    const { scope } = this.props;
    const { username, password } = this.state;
    const { AppCenterBindUser } = scope.props;
    let errorFlag = false;
    if(!Boolean(username)) {
      //wrong username
      errorFlag = true;
      this.setState({
        usernameError: true
      })
    }
    if(!Boolean(password)) {
      //wrong password
      errorFlag = true;
      this.setState({
        passwordError: true
      })
    }
    if(errorFlag) {
      return;
    }
    this.setState({
      bindModalConfirmLoading: true
    });
    let body = {
      username: username,
      password: password
    }
    let notification = new NotificationHandler()
    AppCenterBindUser(body, {
      success: {
        func: () => {
          scope.props.scope.setState({
            configured: true
          })
          this.setState({
            username: '',
            password: '',
            bindModalConfirmLoading: false,
          });
          scope.setState({
            bindModalShow: false
          });
          notification.succes(`绑定账户 ${username} 成功`)
        },
        isAsync: true
      },
      failed: {
        func: err => {
          this.setState({
            bindModalConfirmLoading: false,
          });
          const { message } = err
          console.log(err)
          notification.error(`绑定账户 ${username} 失败`, message.message || message)
        },
        isAsync: true
      }
    });
  },
  render() {
    const {scope} = this.props;
    return (
    <div className='noBind'>
      <Card className='noBindCard'>
        <div className='leftBox'>
          <img src={noBindImg} />
        </div>
        <div className='rightBox'>
          <div className='msgDetail'>
            <div className='square'></div>
            <span>企业版支持关联时速云·公有云的镜像仓库。</span>
          </div>
          <div className='msgDetail'>
            <div className='square'></div>
            <span>只需填写时速云官网注册的用户名和密码即可快速关联。</span>
          </div>
        </div>
      </Card>
      <Button className='bindBtn' type='primary' size='large' onClick={this.openBindModal}>
        <Icon type='plus' />
        <span>时速云镜像Hub</span>
      </Button>
      <p className='alert'>目前您还没有关联时速云·公有云镜像</p>
      <Modal
        className='liteBindCenterModal'
        title='关联时速云镜像Hub'
        visible={scope.state.bindModalShow}
        onCancel={this.closeBindModal}
        onOk={this.submitBind}
        confirmLoading={this.state.bindModalConfirmLoading}
        maskClosable={false}
      >
        <Alert message={[<span><Icon type='exclamation-circle' style={{ marginRight: '7px', color: '#2db7f5' }} /><span>关联时速云·公有云的镜像仓库，请填写时速云官网注册的用户名和密码</span></span>]} type="info" />
        <div className='inputBox'>
          <span className='title'>用户名</span>
          <span className={this.state.usernameError ? 'errorInput input' : 'input'}>
            <Input size='large' value={this.state.username} onChange={this.onChangeUsername} />
            <div className='errorMsg'><Icon type='exclamation-circle-o' /><span>用户名不能为空</span></div>
          </span>
        </div>
        <div className='inputBox'>
          <span className='title'>密码</span>
          <span className={this.state.passwordError ? 'errorInput input' : 'input'}>
            <Input size='large' type='password' value={this.state.password} onChange={this.onChangePassword} />
            <div className='errorMsg'><Icon type='exclamation-circle-o' /><span>密码不能为空</span></div>
          </span>
        </div>
      </Modal>
    </div>
    )
  }
});

class ImageSpace extends Component {
  constructor(props) {
    super(props);
    this.openUploadModal = this.openUploadModal.bind(this);
    this.closeUploadModal = this.closeUploadModal.bind(this);
    this.openDownloadModal = this.openDownloadModal.bind(this);
    this.closeDownloadModal = this.closeDownloadModal.bind(this);
    this.closeImageDetailModal = this.closeImageDetailModal.bind(this);
    this.showDeleteBindUser = this.showDeleteBindUser.bind(this);
    this.closeDeleteBindUser = this.closeDeleteBindUser.bind(this);
    this.deleteBindUser = this.deleteBindUser.bind(this);
    this.state = {
      uploadModalVisible: false,
      downloadModalVisible: false,
      currentImage: null,
      privateDetailModal: false,
      imageDetailModalShow: false,
      deleteBindUserModal: false
    }
  }
  componentWillMount() {
    const { hubConfig } = this.props;
    if(hubConfig) {
      this.props.loadPrivateImageList(DEFAULT_REGISTRY);
    }
  }
  componentWillReceiveProps(nextProps) {
    const { space, hubConfig } = nextProps
    if (space.namespace !== this.props.space.namespace) {
      this.props.loadPrivateImageList(DEFAULT_REGISTRY)
    }
    if(this.props.hubConfig != hubConfig && hubConfig) {
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
  deleteBindUser() {
    //this function for unbind user from public cloud
    const { deleteAppCenterBindUser, scope } = this.props;
    deleteAppCenterBindUser({
      success: {
        func: () => {
          notification['success']({
            message: '注销成功'
          });
          scope.setState({
            configured: false
          })
        },
        isAsync: true
      }
    });
    this.setState({
      deleteBindUserModal: false
    })
  }
  showDeleteBindUser() {
    //this function for show delete modal
    this.setState({
      deleteBindUserModal: true
    });
  }
  closeDeleteBindUser() {
    //this function for close delete modal
    this.setState({
      deleteBindUserModal: false
    });
  }
  render() {
    const { formatMessage } = this.props.intl;
    const rootscope = this.props.scope;
    const scope = this;
    const { imageList, server, imageInfo, hubConfig, globalHubConfigured } = this.props
    return (
      <QueueAnim className="ImageSpace"
        type="right"
        >
        <div id="ImageSpace" key="ImageSpace">
          { !standardFlag ? [<Alert message={'镜像仓库用于存放镜像，您可关联时速云·公有云的镜像仓库，使用公有云中私有空间镜像；关联后，该仓库也用于存放通过TenxFlow构建出的镜像'} type="info" />] : null }
          { !hubConfig ?
            [<NoBind scope={scope} />]
            :
          [<Card className="ImageSpaceCard">
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
              { !standardFlag && !globalHubConfigured ?
                [
                <Tooltip title='注销时速云Hub'>
                  <Button className='logoutBtn' size='large' type='ghost' onClick={this.showDeleteBindUser}>
                    <span>注销</span>
                  </Button>
                </Tooltip>
                ] : null
              }
            </div>
            <MyComponent scope={scope} isFetching={this.props.isFetching} imageList={imageList} registryServer={server} imageInfo={imageInfo} getImageDetailInfo={(obj, callback) => this.props.getImageDetailInfo(obj, callback)} />
          </Card>]
          }
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
          <Modal title='注销' className='liteBindCenterModal' visible={this.state.deleteBindUserModal} onOk={this.deleteBindUser} onCancel={this.closeDeleteBindUser}>
            <span style={{ color: '#00a0ea' }}><Icon type='exclamation-circle-o' />&nbsp;&nbsp;&nbsp;确定要注销时速云官方Hub？</span>
          </Modal>
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

export default connect(mapStateToProps, {
  loadPrivateImageList,
  getImageDetailInfo,
  deleteImage,
  checkImage,
  searchPrivateImages,
  AppCenterBindUser,
  deleteAppCenterBindUser
})(injectIntl(ImageSpace, {
  withRef: true,
}))