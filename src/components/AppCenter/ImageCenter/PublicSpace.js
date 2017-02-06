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
import { Alert, Menu, Button, Card, Input, Tooltip, Modal, Spin, Icon } from 'antd'
import { browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadPublicImageList, searchPublicImages,  getImageDetailInfo } from '../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../constants'
import "./style/PublicSpace.less"
import ImageDetailBox from './ImageDetail'
import noBindImg from '../../../assets/img/appCenter/noBind.png'

const mode = require('../../../../configs/model').mode
const standard = require('../../../../configs/constants').STANDARD_MODE
let standardFlag = (mode == standard ? true : false);

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
  },
  noData: {
    id: 'AppCenter.ImageCenter.OtherSpace.noData',
    defaultMessage: '暂无数据',
  }
})

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.object,
    scope: React.PropTypes.object
  },
  showImageDetail: function (id) {
    //  this function for user select image and show the image detail info
    const scope = this.props.scope;
    scope.setState({
      imageDetailModalShow: true,
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
    const { loading } = this.props;
    let { imageList, serviceIp } = this.props.config;
    if (loading) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (imageList.length == 0) {
      return (
        <div className='loadingBox'>
          <FormattedMessage {...menusText.noData} />
        </div>
      )
    }
    let items = imageList.map((item) => {
      return (
        <div className="imageDetail" key={item.name} >
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
              <FormattedMessage {...menusText.belong} />&nbsp;
              {item.contributor}
            </span>
            <span className="imageUrl textoverflow">
              <span className="defalutColor"><FormattedMessage {...menusText.imageUrl} />&nbsp;</span>
              <span className="defalutColor">{serviceIp + "/" + item.name}</span>
            </span>
            <span className="downloadNum">
              <FormattedMessage {...menusText.downloadNum} />&nbsp;{item.downloadNumber}
            </span>
          </div>
          <div className="btnBox">
            <Button type="ghost" onClick={()=>browserHistory.push(`/app_manage/app_create/fast_create?registryServer=${serviceIp}&imageName=${item.name}`)}>
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

let NoBind = React.createClass({
  getInitialState() {
    return {
      username: '',
      password: ''
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
    scope.setState({
      bindModalShow: false
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
      <Modal className='liteBindCenterModal' title='关联时速云镜像Hub' visible={scope.state.bindModalShow}
        onCancel={this.closeBindModal} onOk={this.submitBind}
      >
        <Alert message={[<span><Icon type='exclamation-circle' style={{ marginRight: '7px', color: '#2db7f5' }} /><span>关联时速云·公有云的镜像仓库，请填写时速云官网注册的用户名和密码</span></span>]} type="info" />
        <div className='inputBox'>
          <span className='title'>用户名</span>
          <span className={this.state.usernameError ? 'errorInput input' : 'input'}>
            <Input type='large' value={this.state.username} onChange={this.onChangeUsername} />
          </span>
        </div>
        <div className='inputBox'>
          <span className='title'>密码</span>
          <span className={this.state.passwordError ? 'errorInput input' : 'input'}>
            <Input type='large' value={this.state.password} onChange={this.onChangePassword} />
          </span>
        </div>
      </Modal>
    </div>
    )
  }
});

class PublicSpace extends Component {
  constructor(props) {
    super(props);
    this.closeImageDetailModal = this.closeImageDetailModal.bind(this);
    this.state = {
      currentImage: null,
      imageDetailModalShow: false,
      imageInfo: '',
      bindModalShow: false
    }
  }

  componentWillMount() {
    const { registry, loadPublicImageList } = this.props
    loadPublicImageList(registry)
  }

  closeImageDetailModal() {
    //this function for user close the modal of image detail info
    this.setState({
      imageDetailModalShow: false
    });
  }
  searchImages() {
    let image = this.state.imageName
    const { registry, searchPublicImages } = this.props
    searchPublicImages(registry, image)
  }
  render() {
    const { formatMessage } = this.props.intl;
    const rootscope = this.props.scope;
    const { isFetching, liteFlag } = this.props;
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
          <Alert message={standardFlag ? [<FormattedMessage {...menusText.tooltips} />] : '镜像仓库用于存放镜像，您可关联时速云·公有云的镜像仓库，使用公有云中私有空间镜像；关联后，该仓库也用于存放通过TenxFlow构建出的镜像'} type="info" />
          { !standardFlag && !liteFlag ? 
            [<NoBind scope={scope} />] 
            :
            [<Card className="PublicSpaceCard">
              <div className="operaBox">
                <Input className="searchBox" placeholder={formatMessage(menusText.search)} type="text" onChange={(e)=> this.setState({imageName: e.target.value})} onPressEnter={()=> this.searchImages()} />
                <i className="fa fa-search" onClick={()=> this.searchImages()}></i>
                <div style={{ clear: "both" }}></div>
              </div>
              <MyComponent scope={scope} getImageDetailInfo={(obj, callback) => this.props.getImageDetailInfo(obj, callback)} loading={isFetching} config={config} />]
            </Card>]
          }
        </div>
        <Modal
          visible={this.state.imageDetailModalShow}
          className="AppServiceDetail"
          transitionName="move-right"
          onCancel={this.closeImageDetailModal}
          >
          {/* right detail box  */}
          <ImageDetailBox scope={scope} server={this.props.registryServer} parentScope={rootscope} imageInfo={this.state.imageInfo} config={this.state.currentImage} />
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
    imageInfo: { dockerfile: '', detailMarkdown: '' }
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
    getImageDetailInfo: (obj, callback) => {
      dispatch(getImageDetailInfo(obj, callback))
    },
    searchPublicImages: (registry, image) => {
      dispatch(searchPublicImages(registry, image))
    }
  }
}

PublicSpace.propTypes = {
  intl: PropTypes.object.isRequired,
  loadPublicImageList: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  getImageDetailInfo: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(PublicSpace, {
  withRef: true,
}));