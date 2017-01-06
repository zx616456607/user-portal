/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppAddServiceModal component
 *
 * v0.1 - 2016-09-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Input, Modal, Checkbox, Button, Card, Menu, Spin } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import {
  loadPublicImageList, loadPrivateImageList, searchPublicImages,
  loadFavouriteList, searchFavoriteImages, searchPrivateImages, publicFilterServer
} from '../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../constants'
import './style/AppAddServiceModal.less'

const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  modalShow: function (imageName, registryServer) {
    //close model function
    const {scope} = this.props;
    const rootScope = scope.props.scope;
    rootScope.setState({
      currentSelectedImage: imageName,
      registryServer,
      modalShow: false,
      serviceModalShow: true,
      isCreate: true,
      addServiceModalShow: false, // for add service
      deployServiceModalShow: true,
      visible: false
    })
  },
  render: function () {
    const { images, registryServer, loading } = this.props
    if (loading) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    const items = images.map((item) => {
      return (
        <div key={item.name} className="serviceDetail">
          <svg className='imgUrl'>
            <use xlinkHref='#appcenterlogo' />
          </svg>
          <div className="infoBox">
            <span className="name">{item.name}</span> <br />
            <span className="intro">{item.description}</span>
          </div>
          <Button type="primary" size="large" onClick={this.modalShow.bind(this, item.name, registryServer)}>
            部署
            <i className="fa fa-arrow-circle-o-right" />
          </Button>
        </div>
      );
    });
    return (
      <div className="dataBox">
        {items}
      </div>
    );
  }
});

let AppAddServiceModal = React.createClass({
  propTypes: {
    selectedList: React.PropTypes.array,
    loadPublicImageList: PropTypes.func
  },
  getInitialState: function () {
    return {
      currentImageType: "publicImages",
      publicImages: false,
      privateImages: false,
      fockImages: false,
      selectRepo: 'local',// 服务 Title
      serverType: 'all' // 服务类型 default all
    }
  },
  selectImageType(currentType) {
    //the function for user select image type
    document.getElementById('soImageName').focus()
    if (currentType === this.state.currentImageType) return
    this.setState({
      currentImageType: currentType,
      [currentType]: false
    });
    const imageList = this.props.imageList[currentType]
    if (this.state[currentType]) {
      return this.searchImage(currentType)
    }
    if (imageList && imageList[this.props.registry] && imageList[this.props.registry].imageList.length > 0) {
      return
    }
    this.props[currentType](this.props.registry)
  },
  componentWillMount() {
    document.title = '添加应用 | 时速云'
    const { registry, publicFilterServer} = this.props
    this.props.publicImages(registry, 'all')
  },
  searchImage(imageType) {
    const type = imageType || this.state.currentImageType
    let imageName = document.getElementById('soImageName').value
    if (imageType) imageName = ''
    if (imageName) {
      this.setState({
        [type]: true
      })
    } else {
      this.setState({
        [type]: false
      })
    }
    if (type === 'publicImages') {
      if (imageName) {
        return this.props.searchPublicImages(this.props.registry, imageName)
      }
      this.setState({selectRepo: 'local'})
      this.props.publicImages(this.props.registry, 'all')
    }
    if (type === 'privateImages') {
      this.setState({selectRepo: false})
      return this.props.searchPrivateImages({ imageName: imageName, registry: this.props.registry })
    }
    if (type === 'fockImages') {
      this.setState({selectRepo: false})
      return this.props.searchFavoriteImages({ imageName: imageName, registry: this.props.registry })
    }
  },
  selectRepo(type) {
    this.setState({selectRepo: type})
    if (type =='hub') {
      this.props.publicFilterServer(this.props.registry,'hub')
      return
    }
    this.props.publicFilterServer(this.props.registry, this.state.serverType)
  },
  filterServer(type) {
    this.setState({serverType: type})
    this.props.publicFilterServer(this.props.registry,type)
  },
  serverHeader() {
    if (this.state.selectRepo == 'local') {
      return (
        <div className="serverKey">
          <span className={this.state.serverType =='all' ? 'btns primary': 'btns'} onClick={()=> this.filterServer('all')}>全部</span>
          <span className={this.state.serverType =='runtime' ? 'btns primary': 'btns'} onClick={()=> this.filterServer('runtime')}>运行环境</span>
          <span className={this.state.serverType =='server' ? 'btns primary': 'btns'} onClick={()=> this.filterServer('server')}>Web服务器</span>
          <span className={this.state.serverType =='database' ? 'btns primary': 'btns'} onClick={()=> this.filterServer('database')}>数据库与缓存</span>
          <span className={this.state.serverType =='os' ? 'btns primary': 'btns'} onClick={()=> this.filterServer('os')}>操作系统</span>
          <span className={this.state.serverType =='others' ? 'btns primary': 'btns'} onClick={()=> this.filterServer('others')}>中间件与其他</span>
        </div>
      )
    }
    return (
      <div className="serverKey">
      </div>
    )
  },
  render: function () {
    const parentScope = this
    const { scope } = this.props
    let images = this.props.imageList[this.state.currentImageType][this.props.registry]
    if (!images) {
      images = { imageList: [] }
    }
    const { imageList, server, isFetching } = images
    return (
      <div id="AppAddServiceModal" key="AppAddServiceModal">
        <div className="operaBox">
          <span className="titleSpan">选择镜像</span>
          <Button type={this.state.currentImageType == "publicImages" ? "primary" : "ghost"} size="large" onClick={this.selectImageType.bind(this, "publicImages")}>
            公有
          </Button>
          <Button size="large" type={this.state.currentImageType == "privateImages" ? "primary" : "ghost"} onClick={this.selectImageType.bind(this, "privateImages")}>
            私有
          </Button>
          <Button size="large" type={this.state.currentImageType == "fockImages" ? "primary" : "ghost"} onClick={this.selectImageType.bind(this, "fockImages")}>
            收藏
          </Button>
          <div className="inputBox">
            <Input size="large" placeholder="按镜像名称搜索" onPressEnter={() => this.searchImage()} id="soImageName" />
            <i className="fa fa-search cursor" onClick={() => this.searchImage()}></i>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        { this.state.currentImageType == 'publicImages' ?
          <div className="serverType">
            <div className="serverTitle">
              <span className={this.state.selectRepo == 'local' ? 'selected': ''} onClick={()=> this.selectRepo('local')}>官方镜像</span>
              <span className={this.state.selectRepo == 'hub' ? 'selected': ''} onClick={()=> this.selectRepo('hub')}>镜像广场 | 时速云 </span>
            </div>
            {this.serverHeader()}
          </div>
          :
            null
          }
        <MyComponent
          scope={parentScope}
          images={images.imageList}
          loading={isFetching}
          registryServer={server} />
      </div>
    )
  }
})

function mapStateToProps(state, props) {
  const registry = DEFAULT_REGISTRY
  const { cluster } =  state.entities.current
  return {
    registry,
    imageList: state.images,
    cluster: cluster.clusterID
  }
}

export default connect(mapStateToProps, {
  publicImages: loadPublicImageList,
  privateImages: loadPrivateImageList,
  fockImages: loadFavouriteList,
  searchPublicImages,
  searchFavoriteImages,
  searchPrivateImages,
  publicFilterServer
})(AppAddServiceModal)