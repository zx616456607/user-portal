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
import { loadPublicImageList, loadPrivateImageList, searchPublicImages, loadFavouriteList, searchFavoriteImages, searchPrivateImages } from '../../../actions/app_center'
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
          <img className="imgUrl" src="/img/test/github.jpg" />
          <div className="infoBox">
            <span className="name">{item.name}</span> <span className="type">{item.category || ''}</span><br />
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
    loadPublicImageList: PropTypes.func.isRequired
  },
  getInitialState: function () {
    return {
      currentImageType: "publicImages",
      publicImages: false,
      privateImages: false,
      fockImages: false
    }
  },
  selectImageType(currentType) {
    //the function for user select image type
    if (currentType === this.state.currentImageType) return
    this.setState({
      currentImageType: currentType,
      imageName: '',
      [currentType]: false
    });
    const imageList = this.props.imageList[currentType]
    if (this.state[currentType]) {
      return this.searchImage(currentType, '')
    }
    if (imageList && imageList[this.props.registry] && imageList[this.props.registry].imageList.length > 0) {
      return
    }
    this.props[currentType](this.props.registry)
  },
  componentWillMount() {
    document.title = '添加应用 | 时速云'
    const { registry, loadPublicImageList } = this.props
    this.props.publicImages(registry)
  },
  getImageName(e) {
    this.setState({
      imageName: e.target.value
    })
  },
  searchImage(imageType, currentImageName) {
    const type = imageType || this.state.currentImageType
    let imageName = this.state.imageName
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
      this.props.publicImages(this.props.registry)
    }
    if (type === 'privateImages') {
      return this.props.searchPrivateImages({ imageName: imageName, registry: this.props.registry })
    }
    if (type === 'fockImages') {
      return this.props.searchFavoriteImages({ imageName: imageName, registry: this.props.registry })
    }
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
            <Input size="large" placeholder="按镜像名称搜索" onChange={e => this.getImageName(e)} onPressEnter={() => this.searchImage()} value={this.state.imageName} />
            <i className="fa fa-search"></i>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
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
  return {
    registry,
    imageList: state.images,
    cluster: state.entities.current.cluster.clusterID
  }
}

export default connect(mapStateToProps, {
  publicImages: loadPublicImageList,
  privateImages: loadPrivateImageList,
  fockImages: loadFavouriteList,
  searchPublicImages,
  searchFavoriteImages,
  searchPrivateImages
})(AppAddServiceModal)