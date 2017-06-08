/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: select image
 *
 * v0.1 - 2017-05-03
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Radio, Input, Tabs, Button, Table } from 'antd'
import {
  loadPublicImageList, loadPrivateImageList, searchPublicImages,
  loadFavouriteList, searchFavoriteImages, searchPrivateImages,
  publicFilterServer
} from '../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../constants'
import './style/SelectImage.less'

const standard = require('../../../../configs/constants').STANDARD_MODE
const mode = require('../../../../configs/model').mode
const standardFlag = mode === standard
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const TabPane = Tabs.TabPane
const PUBLIC_IMAGES = 'publicImages'
class SelectImage extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
  }

  constructor(props) {
    super()
    this.imageTypeChange = this.imageTypeChange.bind(this)
    this.imageFilterChange = this.imageFilterChange.bind(this)
    this.onTabChange = this.onTabChange.bind(this)
    this.searchImages = this.searchImages.bind(this)
    this.onDeploy = this.onDeploy.bind(this)
    this.renderImageList = this.renderImageList.bind(this)
    const { location } = props
    let { imageName, imageType } = location.query
    if (!imageType) {
      imageType = PUBLIC_IMAGES
    }
    this.state = {
      imageType,
      imageFilter: 'all',
      searchInputValue: imageName,
      currentPage: 1,
    }
  }

  loadData(props, callback) {
    const { registry, loadPublicImageList } = props
    let serverType = null
    if (standardFlag) {
      serverType = 'all'
    }
    loadPublicImageList(registry, serverType, callback)
  }

  componentWillMount() {
    const { searchInputValue, imageType } = this.state
    const callback = {
      success: {
        func: () => {
          if (searchInputValue) {
            this.searchImages()
          }
        },
        isAsync: true,
      }
    }
    this.imageTypeChange({
      target: {
        value: imageType,
      }
    }, false, callback)
  }

  componentDidMount() {
    const searchImagesInput = document.getElementById('searchImages')
    searchImagesInput && searchImagesInput.focus()
  }

  imageTypeChange(e, isResetSearchInput, callback) {
    const imageType = e.target.value
    const {
      registry,
      loadPrivateImageList,
      loadFavouriteList,
    } = this.props
    const newState = {
      imageType,
      currentPage: 1,
    }
    if (isResetSearchInput === true || isResetSearchInput === undefined) {
      newState.searchInputValue = ''
    }
    this.setState(newState)
    switch (imageType) {
      case PUBLIC_IMAGES:
        this.loadData(this.props, callback)
        break
      case 'privateImages':
        loadPrivateImageList(registry, callback)
        break
      case 'fockImages':
        loadFavouriteList(registry, callback)
        break
      default:
        break
    }
  }

  imageFilterChange(e) {
    const { publicFilterServer, registry } = this.props
    const imageFilter = e.target.value
    this.setState({
      imageFilter,
    })
    publicFilterServer(this.props.registry, imageFilter)
  }

  onTabChange(key) {
    const { publicFilterServer, registry } = this.props
    if (key === 'hub') {
      publicFilterServer(registry, 'hub')
      return
    }
    publicFilterServer(registry, this.state.imageFilter)
  }

  searchImages() {
    const { searchInputValue, imageType } = this.state
    const {
      registry,
      searchPublicImages,
      searchPrivateImages,
      searchFavoriteImages,
    } = this.props
    this.setState({
      imageFilter: 'all',
    })
    switch (imageType) {
      case PUBLIC_IMAGES:
        if (searchInputValue) {
          searchPublicImages(registry, searchInputValue)
        } else {
          this.loadData(this.props)
        }
        break
      case 'privateImages':
        searchPrivateImages({ registry, imageName: searchInputValue })
        break
      case 'fockImages':
        searchFavoriteImages({ registry, imageName: searchInputValue })
        break
      default:
        break
    }
  }

  onDeploy(imageName, registry) {
    this.props.onChange(imageName, registry)
  }

  renderImageList(imageData) {
    const { imageList, server, isFetching } = imageData
    const columns = [{
      title: '镜像名称',
      dataIndex: 'name',
      key: 'name',
      render(text, row) {
        return (
          <div>
            <svg className='imgUrl'>
              <use xlinkHref='#appcenterlogo' />
            </svg>
            <div className="infoBox">
              <span className="name">{text}</span> <br />
              <span className="desc">{row.description}</span>
            </div>
          </div>
        )
      }
    }, {
      title: '部署',
      dataIndex: 'deploy',
      key: 'deploy',
      width: '10%',
      render: (text, row)=> {
        return (
          <div className="deployBox">
            <Button
              className="deployBtn"
              type="primary" size="large"
              onClick={this.onDeploy.bind(this, row.name, server)}
            >
              部署&nbsp;
              <i className="fa fa-arrow-circle-o-right" />
            </Button>
          </div>
        )
      }
    }]
    const paginationOpts = {
      simple: true,
      current: this.state.currentPage,
      onChange: current => this.setState({ currentPage: current }),
      pageSize: 10
    }
    return (
      <Table
        rowKey={row => row.name}
        showHeader={false}
        className="imageList"
        dataSource={imageList}
        columns={columns}
        pagination={paginationOpts}
        loading={isFetching}
      />
    )
  }

  render() {
    const { images, registry } = this.props
    const { imageType, imageFilter, searchInputValue } = this.state
    let imageData = this.props.images[imageType]
    imageData = imageData && imageData[registry]
    if (!imageData) {
      imageData = { imageList: [] }
    }
    const noTabimageList = (
      <div>
        <div style={{height: "28px"}}></div>
        {this.renderImageList(imageData)}
      </div>
    )
    return(
      <div id="quickCreateAppSelectImage">
        <div className="selectImage">
          选择镜像
          <span className="imageType">
            <RadioGroup size="large" onChange={this.imageTypeChange} value={imageType}>
              <RadioButton value={PUBLIC_IMAGES}>公有</RadioButton>
              <RadioButton value="privateImages">私有</RadioButton>
              <RadioButton value="fockImages">收藏</RadioButton>
            </RadioGroup>
          </span>
          <span className="searchInputBox">
            <Input
              value={searchInputValue}
              size="large"
              placeholder="按镜像名称搜索"
              id="searchImages"
              onPressEnter={this.searchImages}
              onChange={e => {
                this.setState({
                  searchInputValue: e.target.value
                })
              }}
            />
            <i className="fa fa-search cursor" onClick={this.searchImages}></i>
          </span>
        </div>
        <div className="content">
          {
            (standardFlag && imageType === PUBLIC_IMAGES)
            ? (
              <Tabs type="card" onChange={this.onTabChange}>
                <TabPane tab="官方镜像" key="local">
                  <RadioGroup onChange={this.imageFilterChange} value={imageFilter}>
                    <RadioButton value="all">全部</RadioButton>
                    <RadioButton value="runtime">运行环境</RadioButton>
                    <RadioButton value="server">Web服务器</RadioButton>
                    <RadioButton value="database">数据库与缓存</RadioButton>
                    <RadioButton value="os">操作系统</RadioButton>
                    <RadioButton value="others">中间件与其他</RadioButton>
                  </RadioGroup>
                  {this.renderImageList(imageData)}
                </TabPane>
                <TabPane tab={`镜像广场 | ${this.props.productName}`} key="hub">
                  {noTabimageList}
                </TabPane>
              </Tabs>
            )
            : noTabimageList
          }
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const registry = DEFAULT_REGISTRY
  const { cluster, unit } =  state.entities.current
  const oemInfo = state.entities.loginUser.info.oemInfo || {}
  const { productName } = oemInfo.company || {}
  return {
    registry,
    images: state.images,
    cluster: cluster.clusterID,
    unit,
    productName
  }
}

export default connect(mapStateToProps, {
  loadPublicImageList,
  loadPrivateImageList,
  loadFavouriteList,
  searchPublicImages,
  searchFavoriteImages,
  searchPrivateImages,
  publicFilterServer
})(SelectImage)
