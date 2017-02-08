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
import { Alert, Menu, Button, Card, Spin, Input, Modal, Icon } from 'antd'
import { Link ,browserHistory} from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadFavouriteList, getImageDetailInfo, searchFavoriteImages} from '../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../constants'
import "./style/MyCollection.less"
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
    let imageList = this.props.config;
    const {isFetching, registryServer} = this.props
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (imageList.length === 0) {
      return (
        <div style={{lineHeight:'20px',height:'60px',paddingLeft:'30px'}}>您还没有收藏的镜像。</div>
      )
    }
    let items = imageList.map((item, index) => {
      return (
        <div className="imageDetail" key={`${item.id}-${index}`} >
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
              <FormattedMessage {...menusText.imageUrl} />&nbsp;
              <span className="">{registryServer}/{item.name}</span>
            </span>
            <span className="downloadNum">
              <FormattedMessage {...menusText.downloadNum} />&nbsp;{item.downloadNumber}
            </span>
          </div>
          <div className="btnBox">
            <Button type="ghost" onClick={()=>browserHistory.push(`/app_manage/app_create/fast_create?registryServer=${registryServer}&imageName=${item.name}`)}>
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
    const { loadFavouriteList, liteFlag } = this.props
    if(liteFlag) {      
      loadFavouriteList(DEFAULT_REGISTRY)
    }
  }
  closeImageDetailModal() {
    //this function for user close the modal of image detail info
    this.setState({
      imageDetailModalShow: false
    });
  }
  searchImages() {
    const { registry, searchFavoriteImages } = this.props
    const condition = {imageName: this.state.imageName, registry }
    searchFavoriteImages(condition)
  }
  render() {
    const { formatMessage } = this.props.intl;
    const rootscope = this.props.scope;
    const { liteFlag } = this.props;
    const scope = this;
    const imageList = this.props.fockImageList
    return (
      <QueueAnim className="MyCollection"
        type="right"
        >
        <div id="MyCollection" key="MyCollection">
          <Alert message={standardFlag ? [<FormattedMessage {...menusText.tooltips} />] : '关联时速云·公有云镜像仓库后，您可使用公有云中收藏的镜像，也可以将时速云镜像hub中的任意镜像，一键收藏到我的收藏，便捷的管理常用容器镜像。'} type="info" />
          { !standardFlag && !liteFlag ? 
            [<NoBind scope={scope} />] 
            :
            [<Card className="MyCollectionCard">
              <div className="operaBox">
                <Input className="searchBox" placeholder={formatMessage(menusText.search)} type="text" onChange={(e)=> this.setState({imageName: e.target.value})} onPressEnter={()=> this.searchImages()} />
                <i className="fa fa-search"></i>
                <div style={{ clear: "both" }}></div>
              </div>
              <MyComponent scope={scope} isFetching={this.props.isFetching} registryServer={this.props.server} getImageDetailInfo={(obj, callback) => this.props.getImageDetailInfo(obj, callback)} config={imageList} />
            </Card>]
          }
        </div>
        <Modal
          visible={this.state.imageDetailModalShow}
          className="AppServiceDetail"
          transitionName="move-right"
          onCancel={this.closeImageDetailModal}
          >
          <ImageDetailBox parentScope={rootscope} server={this.props.server} scope={scope} imageInfo={this.state.imageInfo} config={this.state.currentImage} />
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
    imageInfo: { dockerfile: '', detailMarkdown: '' }
  }
  const { fockImages, imagesInfo } = state.images
  const { registry, imageList, isFetching, server } = fockImages[DEFAULT_REGISTRY] || defaultPublicImages
  const { imageInfo } = imagesInfo[DEFAULT_REGISTRY] || defaultConfig

  return {
    registry,
    server,
    fockImageList: imageList,
    isFetching,
    imageInfo
  }
}

export default connect(mapStateToProps, {
  loadFavouriteList,
  getImageDetailInfo,
  searchFavoriteImages
})(injectIntl(MyCollection, {
  withRef: true,
}))