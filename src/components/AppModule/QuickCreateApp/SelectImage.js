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
import { loadAllProject } from '../../../actions/harbor'
import { getAppsList } from '../../../actions/app_store'
import { DEFAULT_REGISTRY } from '../../../constants'
import { encodeImageFullname } from '../../../common/tools'
import './style/SelectImage.less'
import NotificationHandler from '../../../components/Notification'

const standard = require('../../../../configs/constants').STANDARD_MODE
const mode = require('../../../../configs/model').mode
const standardFlag = mode === standard
const RadioGroup = Radio.Group
const TabPane = Tabs.TabPane
const PUBLIC_IMAGES = 'publicImages'
const IMAGE_STORE = 'imageStore'
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
    let { imageName, imageType, searchImage } = location.query
    if (!imageType) {
      imageType = PUBLIC_IMAGES
    }
    if(!searchImage) {
      searchImage = false
    } else {
      imageType = 'privateImages'
    }
    this.state = {
      imageType,
      imageFilter: 'all',
      searchInputValue: imageName,
      currentPage: 1,
      searchImage
    }
  }

  loadData(props, query, callback) {
    // const { registry, loadPublicImageList } = props
    // let serverType = null
    // if (standardFlag) {
    //   serverType = 'all'
    // }
    // loadPublicImageList(registry, serverType, callback)
    const { registry, loadAllProject, cluster } = props
    let notify = new NotificationHandler()
    if (!callback) {
      callback = {
        success: {
          func: (res) => {
            if(res.data && res.data.repository && res.data.repository.length > 0 && this.state.searchImage) {
              const repo = res.data.repository[0]
              if(repo.projectPublic) {
                this.setState({
                  imageType: PUBLIC_IMAGES,
                })
              }
            }
          }
        },
        failed: {
          func: res => {
            if (res.statusCode === 500) {
              notify.error('请求错误', '镜像仓库暂时无法访问，请联系管理员')
            }
          }
        }
      }
    }
    const harbor = cluster.harbor && cluster.harbor[0] ? cluster.harbor[0] : ""
    //todo 切换 集群列表
    loadAllProject(registry, Object.assign({}, query, { harbor }), callback)
  }

  componentWillMount() {
    const { searchInputValue, imageType } = this.state
    if (imageType === IMAGE_STORE) {
      return this.loadImageStore()
    }
    if(searchInputValue) {
      this.loadData(this.props, {
        q: searchInputValue
      })
      return
    }
    this.loadData(this.props)
  }

  componentDidMount() {
    const searchImagesInput = document.getElementById('searchImages')
    searchImagesInput && searchImagesInput.focus()
  }

  imageTypeChange(e, isResetSearchInput, callback) {
    const imageType = e.target.value
    if (imageType === IMAGE_STORE) {
      this.setState({
        imageType
      })
      return this.loadImageStore()
    }
    const {
      registry,
      //loadPrivateImageList,
    //  loadFavouriteList,
    } = this.props
    const newState = {
      imageType,
      currentPage: 1,
      searchInputValue: this.state.searchInputValue
    }
    if (isResetSearchInput === true || isResetSearchInput === undefined) {
      newState.searchInputValue = ''
    }
    this.setState(newState)
    this.loadData(this.props, {
      q: newState.searchInputValue
    })
    // switch (imageType) {
    //   case PUBLIC_IMAGES:
    //     this.loadData(this.props, callback)
    //     break
    //   case 'privateImages':
    //     loadPrivateImageList(registry, callback)
    //     break
    //   case 'fockImages':
    //     loadFavouriteList(registry, callback)
    //     break
    //   default:
    //     break
    // }
  }
  loadImageStore() {
    const { getAppsList, cluster } = this.props
    const { searchInputValue, currentPage } = this.state
    let notify = new NotificationHandler()
    // const harbor = cluster.harbor && cluster.harbor[0] ? cluster.harbor[0] : ""
    let filter = 'type,2,publish_status,2,target_cluster,' + cluster.clusterID
    if (searchInputValue) {
      filter += `,file_nick_name,${searchInputValue}`
    }
    let query = {
      form: (currentPage - 1) * 10,
      size: 10,
      filter
    }
    //todo 切换 集群列表
    getAppsList(query, {
      failed: {
        func: res => {
          if (res.statusCode === 500) {
            notify.error('请求错误', '镜像仓库暂时无法访问，请联系管理员')
          }
        }
      }
    })
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
    if(searchInputValue) {
      return this.loadData(this.props, {
        q: searchInputValue
      })
    }
    return this.loadData(this.props)
    // const {
    //   registry,
    //   searchPublicImages,
    //   searchPrivateImages,
    //   //searchFavoriteImages,
    // } = this.props
    // this.setState({
    //   imageFilter: 'all',
    // })
    // switch (imageType) {
    //   case PUBLIC_IMAGES:
    //     if (searchInputValue) {
    //       searchPublicImages(registry, searchInputValue)
    //     } else {
    //       this.loadData(this.props)
    //     }
    //     break
    //   case 'privateImages':
    //     searchPrivateImages({ registry, imageName: searchInputValue })
    //     break
    //   case 'fockImages':
    //     searchFavoriteImages({ registry, imageName: searchInputValue })
    //     break
    //   default:
    //     break
    // }
  }

  onDeploy(imageName, registry) {
    this.props.onChange(imageName, registry)
  }
  renderImageList(imageData) {
    if(!imageData) {
      imageData = {
        server: '',
      }
    }
    const { imageStoreList } = this.props
    const { isFetching } = imageData
    const { imageType } = this.state
    let imageList = imageData[imageType]
    if (imageType === IMAGE_STORE) {
      imageList = imageStoreList && imageStoreList.apps
    }
    const columns = [{
      title: '镜像名称',
      dataIndex: imageType === IMAGE_STORE ? 'resourceName' : 'repositoryName',
      key: imageType === IMAGE_STORE ? 'resourceName' : 'repositoryName',
      render(text, row) {
        return (
          <div>
            <svg className='imgUrl'>
              <use xlinkHref='#appcenterlogo' />
            </svg>
            <div className="infoBox">
              <span className="name">{text}</span> <br />
              <span className="desc">{imageType !== IMAGE_STORE ? row.description : row.versions[0].description}</span>
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
        let str = row.repositoryName
        let server = imageData.server
        if (imageType === IMAGE_STORE) {
          server = row.resourceLink.split('/')[0]
          str = encodeImageFullname(row.resourceName)
        }
        return (
          <div className="deployBox">
            <Button
              className="deployBtn"
              type="primary" size="large"
              onClick={this.onDeploy.bind(this, str, server)}
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
      onChange: current => this.setState({ currentPage: current }, imageType === IMAGE_STORE && this.loadImageStore()),
      pageSize: 10
    }
    return (
      <Table
        rowKey={row => row.repositoryName}
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
    const noTabimageList = (
      <div>
        {/* <div style={{height: "28px"}}></div> */}
        {this.renderImageList(images)}
      </div>
    )
    return(
      <div id="quickCreateAppSelectImage">
        <div className="selectImage">
          选择镜像
          <span className="imageType">
            <RadioGroup size="large" onChange={this.imageTypeChange} value={imageType}>
              <Radio prefixCls="ant-radio-button" value={PUBLIC_IMAGES}>公有</Radio>
              <Radio prefixCls="ant-radio-button" value="privateImages">私有</Radio>
              <Radio prefixCls="ant-radio-button" value="imageStore">镜像商店</Radio>
              { /*<Radio value="fockImages">收藏</Radio> */ }
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
                    <Radio prefixCls="ant-radio-button" value="all">全部</Radio>
                    <Radio prefixCls="ant-radio-button" value="runtime">运行环境</Radio>
                    <Radio prefixCls="ant-radio-button" value="server">Web服务器</Radio>
                    <Radio prefixCls="ant-radio-button" value="database">数据库与缓存</Radio>
                    <Radio prefixCls="ant-radio-button" value="os">操作系统</Radio>
                    <Radio prefixCls="ant-radio-button" value="others">中间件与其他</Radio>
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
  const { cluster, unit, space } =  state.entities.current
  const oemInfo = state.entities.loginUser.info.oemInfo || {}
  const { productName } = oemInfo.company || {}
  const { appStore }  = state
  const { imagePublishRecord } = appStore
  const { data: imageStoreList } = imagePublishRecord || { data: {} }

  const { projectVisibleClusters } = state.projectAuthority
  const currentNamespace = space.namespace
  const currentProjectClusterList = projectVisibleClusters[currentNamespace] || {}
  const clusters = currentProjectClusterList.data || []
  return {
    registry,
    images: state.harbor.allProject[registry],
    cluster,
    unit,
    productName,
    imageStoreList,
    clusters,
  }
}

export default connect(mapStateToProps, {
 // loadPublicImageList,
 // loadPrivateImageList,
 // loadFavouriteList,
  searchPublicImages,
  searchFavoriteImages,
  searchPrivateImages,
  publicFilterServer,
  loadAllProject,
  getAppsList
})(SelectImage)
